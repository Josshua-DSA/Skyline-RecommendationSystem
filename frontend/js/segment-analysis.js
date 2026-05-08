let _segData = null;
let _activeSeg = 'travel_type';

async function initSegmentAnalysis() {
  _segData = await getData(API.getSegments, MOCK.segments);

  // Tab listeners
  document.querySelectorAll('#segment-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#segment-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      _activeSeg = tab.dataset.seg;
      renderSegment(_activeSeg);
    });
  });

  renderSegment(_activeSeg);
}

function renderSegment(segType) {
  const data = _segData[segType];
  if (!data) return;

  const entries = Object.entries(data);

  // Cards
  buildSegmentCards(entries);

  // Satisfaction bar
  buildSatisfactionChart(entries);

  // Radar
  buildRadarChart(entries);

  // Table
  buildSegmentTable(entries);
}

function buildSegmentCards(entries) {
  const container = document.getElementById('segment-cards');
  if (!container) return;

  container.innerHTML = entries.map(([name, seg]) => {
    const [cls, label] = opportunityLabel(seg.opportunity_score || 50);
    return `
      <div class="card" style="padding:18px;">
        <div style="font-size:13px;font-weight:600;margin-bottom:12px;">${name}</div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:10px;">
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:3px;">PASSENGERS</div>
            <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;">${fmt(seg.count)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:3px;">SHARE</div>
            <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--accent-blue)">${seg.pct || '—'}%</div>
          </div>
        </div>
        <div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
            <span style="color:var(--text-muted);">Satisfaction</span>
            <span style="font-weight:700;color:${(seg.satisfaction_rate||0) > 0.6 ? 'var(--accent-green)' : (seg.satisfaction_rate||0) > 0.45 ? 'var(--accent-gold)' : 'var(--accent-red)'}">
              ${fmtPct(seg.satisfaction_rate || 0)}
            </span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${((seg.satisfaction_rate||0)*100).toFixed(0)}%;background:${(seg.satisfaction_rate||0) > 0.6 ? 'var(--accent-green)' : (seg.satisfaction_rate||0) > 0.45 ? 'var(--accent-gold)' : 'var(--accent-red)'}"></div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:11px;color:var(--text-muted);">Opportunity</span>
          <span class="opportunity-pill ${cls}">${seg.opportunity_score || '—'}/100 · ${label}</span>
        </div>
      </div>
    `;
  }).join('');

  staggerFadeIn(container.querySelectorAll('.card'));
}

function buildSatisfactionChart(entries) {
  const labels = entries.map(([n]) => n);
  const rates  = entries.map(([, s]) => +((s.satisfaction_rate || 0) * 100).toFixed(1));
  const colors = rates.map(r => r > 60 ? '#3ECFB2' : r > 45 ? '#F0B429' : '#FF4D6D');

  destroyChart('chart-seg-satisfaction');
  const ctx = document.getElementById('chart-seg-satisfaction');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Satisfaction Rate (%)', data: rates, backgroundColor: colors, borderRadius: 8 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      plugins: { legend:{ display:false }, tooltip:{ callbacks:{ label: c => ` ${c.raw}%` } } },
      scales: {
        x: { max:100, grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#8899BB', callback: v => v+'%' } },
        y: { grid:{ display:false }, ticks:{ color:'#8899BB' } }
      }
    }
  });
}

function buildRadarChart(entries) {
  const colorPalette = ['#388BFD','#3ECFB2','#F0B429','#9B72F2','#FF4D6D'];
  const radarFeatures = ['Online Boarding','In-flight Wifi Service','Seat Comfort','In-flight Entertainment','On-board Service','Cleanliness'];

  const datasets = entries
    .filter(([, s]) => s.avg_ratings)
    .map(([name, s], i) => ({
      label: name,
      data: radarFeatures.map(f => s.avg_ratings[f] || 3),
      borderColor: colorPalette[i % colorPalette.length],
      backgroundColor: colorPalette[i % colorPalette.length] + '22',
      pointBackgroundColor: colorPalette[i % colorPalette.length],
      borderWidth: 2, pointRadius: 3
    }));

  if (datasets.length > 0) {
    drawRadar('chart-seg-radar', radarFeatures.map(f => f.replace('In-flight ','').replace(' Service','')), datasets);
  }
}

function buildSegmentTable(entries) {
  const tbody = document.getElementById('segment-table-body');
  if (!tbody) return;
  tbody.innerHTML = entries.map(([name, seg]) => {
    const [cls, label] = opportunityLabel(seg.opportunity_score || 50);
    return `
      <tr>
        <td style="font-weight:600;">${name}</td>
        <td>${fmt(seg.count)}</td>
        <td>${seg.pct || '—'}%</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="flex:1;max-width:80px;" class="progress-bar">
              <div class="progress-fill" style="width:${((seg.satisfaction_rate||0)*100).toFixed(0)}%;background:${(seg.satisfaction_rate||0) > 0.6 ? 'var(--accent-green)' : 'var(--accent-gold)'}"></div>
            </div>
            <span style="font-weight:600;">${fmtPct(seg.satisfaction_rate||0)}</span>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="flex:1;max-width:80px;" class="progress-bar">
              <div class="progress-fill" style="width:${seg.opportunity_score||0}%;background:var(--accent-purple)"></div>
            </div>
            <span style="font-weight:600;">${seg.opportunity_score||0}</span>
          </div>
        </td>
        <td><span class="opportunity-pill ${cls}">${label}</span></td>
      </tr>
    `;
  }).join('');
}