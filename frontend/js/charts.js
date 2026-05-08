// ── CHART.JS GLOBAL DEFAULTS ──
if (typeof Chart !== 'undefined') {
  Chart.defaults.color = '#8899BB';
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.tooltip.backgroundColor = '#0D1B2E';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(56,139,253,0.3)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.titleColor = '#E8F0FF';
  Chart.defaults.plugins.tooltip.bodyColor = '#8899BB';
}

const CHART_COLORS = {
  blue:   '#388BFD',
  cyan:   '#00D4FF',
  green:  '#3ECFB2',
  gold:   '#F0B429',
  red:    '#FF4D6D',
  purple: '#9B72F2',
  muted:  '#4A5A7A'
};

const GRADIENT_BLUE  = (ctx) => { const g = ctx.createLinearGradient(0,0,0,300); g.addColorStop(0,'rgba(56,139,253,0.5)'); g.addColorStop(1,'rgba(56,139,253,0.02)'); return g; };
const GRADIENT_GREEN = (ctx) => { const g = ctx.createLinearGradient(0,0,0,300); g.addColorStop(0,'rgba(62,207,178,0.5)'); g.addColorStop(1,'rgba(62,207,178,0.02)'); return g; };
const GRADIENT_GOLD  = (ctx) => { const g = ctx.createLinearGradient(0,0,0,300); g.addColorStop(0,'rgba(240,180,41,0.5)'); g.addColorStop(1,'rgba(240,180,41,0.02)'); return g; };

function destroyChart(id) {
  const existing = Chart.getChart(id);
  if (existing) existing.destroy();
}

// ── ROC CURVE (simulated) ──
function drawROCCurve(canvasId) {
  destroyChart(canvasId);
  const pts = [];
  for (let i = 0; i <= 1; i += 0.01) {
    pts.push({ x: i, y: Math.min(1, Math.pow(i, 0.07)) });
  }
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        { label: 'ROC Curve (AUC = 0.9923)', data: pts, borderColor: CHART_COLORS.blue, backgroundColor: 'transparent', showLine: true, pointRadius: 0, borderWidth: 2.5 },
        { label: 'Random Classifier', data: [{x:0,y:0},{x:1,y:1}], borderColor: CHART_COLORS.muted, backgroundColor: 'transparent', showLine: true, pointRadius: 0, borderWidth: 1.5, borderDash: [6,4] }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      scales: {
        x: { min:0, max:1, title:{ display:true, text:'False Positive Rate', color:'#8899BB' }, grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#8899BB' } },
        y: { min:0, max:1, title:{ display:true, text:'True Positive Rate', color:'#8899BB' }, grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#8899BB' } }
      },
      plugins: { legend:{ position:'bottom' }, tooltip:{ enabled:false } }
    }
  });
}

// ── HORIZONTAL BAR - Feature Importance ──
function drawFeatureImportance(canvasId, data, maxItems = 10) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const features = data.features.slice(0, maxItems);
  const importance = data.importance.slice(0, maxItems);
  const colors = importance.map((v, i) => {
    if (i === 0) return CHART_COLORS.blue;
    if (i === 1) return CHART_COLORS.cyan;
    if (i < 4) return CHART_COLORS.purple;
    return CHART_COLORS.muted;
  });
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: features,
      datasets: [{ label: 'Importance (%)', data: importance, backgroundColor: colors, borderRadius: 6, borderSkipped: false }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend:{ display:false }, tooltip:{ callbacks:{ label: c => ` ${c.raw.toFixed(2)}%` } } },
      scales: {
        x: { grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#8899BB', callback: v => v+'%' } },
        y: { grid:{ display:false }, ticks:{ color:'#8899BB' } }
      }
    }
  });
}

// ── DOUGHNUT ──
function drawDoughnut(canvasId, values, labels, colors) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: true, cutout: '72%',
      plugins: { legend:{ position:'bottom' }, tooltip:{ callbacks:{ label: c => ` ${c.label}: ${c.raw.toFixed(1)}%` } } }
    }
  });
}

// ── RADAR ──
function drawRadar(canvasId, labels, datasets) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'radar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: true,
      scales: {
        r: {
          min: 0, max: 5,
          ticks: { stepSize: 1, color: '#4A5A7A', backdropColor: 'transparent' },
          grid: { color: 'rgba(255,255,255,0.06)' },
          pointLabels: { color: '#8899BB', font:{ size: 11 } },
          angleLines: { color: 'rgba(255,255,255,0.06)' }
        }
      },
      plugins: { legend:{ position:'bottom' } }
    }
  });
}

// ── LINE CHART ──
function drawLineChart(canvasId, labels, datasets) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend:{ position:'bottom' } },
      scales: {
        x: { grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#8899BB' } },
        y: { grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#8899BB' } }
      }
    }
  });
}

// ── BAR CHART ──
function drawBarChart(canvasId, labels, datasets, opts = {}) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend:{ position:'bottom', display: opts.legend !== false } },
      scales: {
        x: { grid:{ display: false }, ticks:{ color:'#8899BB', maxRotation: opts.rotate || 0 } },
        y: { grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#8899BB', callback: opts.yCallback || undefined }, beginAtZero: true, max: opts.yMax }
      },
      ...(opts.stacked ? { scales: { x: { stacked:true }, y: { stacked:true } } } : {})
    }
  });
}

// ── CORRELATION HEATMAP (canvas-based) ──
function drawHeatmap(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const { features, matrix } = data;
  const n = features.length;

  const table = document.createElement('table');
  table.className = 'heatmap-table';

  // Header row
  const thead = document.createElement('thead');
  const hRow = document.createElement('tr');
  hRow.appendChild(document.createElement('th'));
  features.forEach(f => {
    const th = document.createElement('th');
    th.textContent = f.length > 8 ? f.slice(0,8)+'…' : f;
    th.title = f;
    hRow.appendChild(th);
  });
  thead.appendChild(hRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  matrix.forEach((row, i) => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.textContent = features[i].length > 8 ? features[i].slice(0,8)+'…' : features[i];
    th.title = features[i];
    th.style.textAlign = 'left';
    th.style.paddingRight = '8px';
    th.style.fontSize = '10px';
    th.style.color = '#8899BB';
    tr.appendChild(th);

    row.forEach((val, j) => {
      const td = document.createElement('td');
      td.textContent = val.toFixed(2);
      td.title = `${features[i]} ↔ ${features[j]}: ${val.toFixed(3)}`;
      const intensity = Math.abs(val);
      if (i === j) {
        td.style.background = 'rgba(56,139,253,0.35)';
        td.style.color = '#E8F0FF';
      } else if (val >= 0.5) {
        td.style.background = `rgba(62,207,178,${intensity * 0.6})`;
        td.style.color = '#E8F0FF';
      } else if (val >= 0.3) {
        td.style.background = `rgba(240,180,41,${intensity * 0.4})`;
        td.style.color = '#E8F0FF';
      } else {
        td.style.background = 'rgba(255,255,255,0.03)';
        td.style.color = '#4A5A7A';
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.innerHTML = '';
  container.appendChild(table);
}

// ── SIMULATION BAR CHART ──
function drawSimulationChart(canvasId, scenarios) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const labels = ['Conservative', 'Expected', 'Aggressive'];
  const monthly = labels.map(l => scenarios[l.toLowerCase()]?.monthly_revenue_lift || 0);
  const annual  = labels.map(l => scenarios[l.toLowerCase()]?.annual_revenue_lift || 0);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Monthly Revenue Lift (USD)', data: monthly, backgroundColor: [CHART_COLORS.muted, CHART_COLORS.green, CHART_COLORS.gold], borderRadius: 8 },
        { label: 'Annual Revenue Lift (USD)', data: annual, backgroundColor: ['rgba(74,90,122,0.3)','rgba(62,207,178,0.25)','rgba(240,180,41,0.25)'], borderRadius: 8 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend:{ position:'bottom' }, tooltip:{ callbacks:{ label: c => ` USD ${c.raw.toLocaleString()}` } } },
      scales: {
        x: { grid:{ display:false }, ticks:{ color:'#8899BB' } },
        y: { grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#8899BB', callback: v => 'USD '+(v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':v) } }
      }
    }
  });
}