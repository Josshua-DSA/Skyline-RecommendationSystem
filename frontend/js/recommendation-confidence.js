async function initRecommendationConfidence() {
  const [metrics, fi] = await Promise.all([
    getData(API.getMetrics, MOCK.metrics),
    getData(API.getFeatureImportance, MOCK.featureImportance)
  ]);

  // Story questions update
  document.getElementById('story-acc').textContent = fmtPct(metrics.accuracy);
  document.getElementById('story-recall').textContent = fmtPct(metrics.recall);

  // Metric rings
  setRingMetric('accuracy', metrics.accuracy, fmtPct(metrics.accuracy, 1));
  setRingMetric('precision', metrics.precision, fmtPct(metrics.precision, 1));
  setRingMetric('recall', metrics.recall, fmtPct(metrics.recall, 1));
  setRingMetric('f1', metrics.f1_score, fmtPct(metrics.f1_score, 1));

  // Confusion matrix
  const cm = metrics.confusion_matrix;
  document.getElementById('cm-tn').textContent = fmt(cm[0][0]);
  document.getElementById('cm-fp').textContent = fmt(cm[0][1]);
  document.getElementById('cm-fn').textContent = fmt(cm[1][0]);
  document.getElementById('cm-tp').textContent = fmt(cm[1][1]);
  const totalErrors = cm[0][1] + cm[1][0];
  document.getElementById('cm-errors').textContent = fmt(totalErrors);

  // ROC curve
  drawROCCurve('chart-roc');

  // Feature importance chart
  drawFeatureImportance('chart-feature-importance', fi, 10);

  // Segment confidence cards
  buildSegmentConfidence();

  staggerFadeIn(document.querySelectorAll('.conf-metric-card'));
}

function setRingMetric(key, value, label) {
  const valEl = document.getElementById('val-' + key);
  if (valEl) valEl.textContent = label;

  const ring = document.getElementById('ring-' + key);
  if (ring) {
    const circumference = 201;
    const offset = circumference - (circumference * value);
    setTimeout(() => {
      ring.style.transition = 'stroke-dashoffset 1.2s ease';
      ring.setAttribute('stroke-dashoffset', offset.toFixed(1));
    }, 200);
  }
}

function buildSegmentConfidence() {
  const segments = [
    { label: 'Business Class', confidence: 0.94, color: 'var(--accent-blue)', note: 'Highest precision' },
    { label: 'Returning Customers', confidence: 0.91, color: 'var(--accent-green)', note: 'Strong signal' },
    { label: 'Business Travel', confidence: 0.89, color: 'var(--accent-purple)', note: 'Reliable predictions' },
    { label: 'Economy Class', confidence: 0.83, color: 'var(--accent-gold)', note: 'Good coverage' },
    { label: 'Personal Travel', confidence: 0.78, color: 'var(--accent-gold)', note: 'Moderate signal' },
    { label: 'First-time Customers', confidence: 0.71, color: 'var(--accent-red)', note: 'Lower signal — less data' },
  ];

  const container = document.getElementById('seg-confidence');
  if (!container) return;

  container.innerHTML = segments.map(s => `
    <div class="card" style="padding:16px;text-align:center;">
      <div style="font-size:13px;font-weight:600;margin-bottom:10px;">${s.label}</div>
      <div style="font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:${s.color};margin-bottom:6px;">${fmtPct(s.confidence, 0)}</div>
      <div class="progress-bar" style="margin-bottom:8px;">
        <div class="progress-fill" style="width:${(s.confidence * 100).toFixed(0)}%;background:${s.color}"></div>
      </div>
      <div style="font-size:11px;color:var(--text-muted);">${s.note}</div>
    </div>
  `).join('');

  staggerFadeIn(container.querySelectorAll('.card'));
}