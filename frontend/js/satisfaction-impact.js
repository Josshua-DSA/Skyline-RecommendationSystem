async function initSatisfactionImpact() {
  const data = await getData(API.getSatisfactionImpact, MOCK.satisfactionImpact);

  buildGapBars(data.service_gap);
  buildDelayChart(data.delay_impact);
  buildClassImpactChart(data.class_travel_impact);
  drawHeatmap('heatmap-container', data.correlation_matrix);
}

function buildGapBars(gapData) {
  const container = document.getElementById('gap-bars-container');
  if (!container) return;

  const entries = Object.entries(gapData).sort((a, b) => b[1].gap - a[1].gap);
  const maxSat = Math.max(...entries.map(([, v]) => v.satisfied_avg));

  container.innerHTML = entries.map(([feature, vals]) => `
    <div class="gap-bar-item">
      <div class="gap-bar-label" title="${feature}">${feature}</div>
      <div class="gap-bar-track" style="position:relative;height:20px;border-radius:4px;background:rgba(255,255,255,0.04);">
        <div title="Dissatisfied avg: ${vals.dissatisfied_avg.toFixed(2)}"
          style="position:absolute;left:0;top:0;height:100%;border-radius:4px;background:rgba(255,77,109,0.4);
          width:${(vals.dissatisfied_avg/maxSat*100).toFixed(1)}%;transition:width 0.8s ease;"></div>
        <div title="Satisfied avg: ${vals.satisfied_avg.toFixed(2)}"
          style="position:absolute;left:0;top:0;height:100%;border-radius:4px;background:rgba(62,207,178,0.6);
          width:${(vals.satisfied_avg/maxSat*100).toFixed(1)}%;transition:width 0.8s ease;opacity:0.6;"></div>
        <div style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:10px;color:var(--text-muted);">
          <span style="color:var(--accent-red);">${vals.dissatisfied_avg.toFixed(1)}</span>
          <span style="color:var(--text-muted);"> → </span>
          <span style="color:var(--accent-green);">${vals.satisfied_avg.toFixed(1)}</span>
        </div>
      </div>
      <div class="gap-value">Δ${vals.gap.toFixed(2)}</div>
    </div>
  `).join('');
}

function buildDelayChart(delayData) {
  const labels = Object.keys(delayData);
  const rates  = Object.values(delayData).map(d => +(d.satisfaction_rate * 100).toFixed(1));
  const counts = Object.values(delayData).map(d => d.count);

  destroyChart('chart-delay-impact');
  const ctx = document.getElementById('chart-delay-impact');
  if (!ctx) return;

  const colors = rates.map(r => r > 60 ? '#3ECFB2' : r > 50 ? '#F0B429' : r > 35 ? '#FF8C00' : '#FF4D6D');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Satisfaction Rate (%)',
        data: rates,
        backgroundColor: colors,
        borderRadius: 8,
        yAxisID: 'y'
      }, {
        label: 'Passenger Count',
        data: counts,
        type: 'line',
        borderColor: '#388BFD',
        backgroundColor: 'rgba(56,139,253,0.1)',
        pointBackgroundColor: '#388BFD',
        tension: 0.4,
        fill: true,
        yAxisID: 'y2',
        borderWidth: 2,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend:{ position:'bottom' } },
      scales: {
        x: { grid:{ display:false }, ticks:{ color:'#8899BB', maxRotation:20, font:{ size:10 } } },
        y: {
          position:'left',
          max:100,
          grid:{ color:'rgba(255,255,255,0.04)' },
          ticks:{ color:'#8899BB', callback: v => v+'%' }
        },
        y2: {
          position:'right',
          grid:{ display:false },
          ticks:{ color:'#388BFD', callback: v => v >= 1000 ? (v/1000).toFixed(0)+'K' : v }
        }
      }
    }
  });
}

function buildClassImpactChart(impact) {
  const byClass = impact.by_class;
  const byTravel = impact.by_travel_type;

  const labels = [...Object.keys(byClass), ...Object.keys(byTravel)];
  const rates  = [
    ...Object.values(byClass).map(d => +(d.satisfaction_rate * 100).toFixed(1)),
    ...Object.values(byTravel).map(d => +(d.satisfaction_rate * 100).toFixed(1))
  ];
  const bgColors = [
    '#388BFD','#F0B429','#9B72F2',
    '#3ECFB2','#FF4D6D'
  ];

  destroyChart('chart-class-impact');
  const ctx = document.getElementById('chart-class-impact');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Satisfaction Rate (%)',
        data: rates,
        backgroundColor: bgColors,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend:{ display:false }, tooltip:{ callbacks:{ label: c => ` ${c.raw}%` } } },
      scales: {
        x: { grid:{ display:false }, ticks:{ color:'#8899BB' } },
        y: { max:100, grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#8899BB', callback: v => v+'%' } }
      }
    }
  });
}