async function initRecommendationConfidence() {
  const [metrics, fi] = await Promise.all([
    getData(API.getMetrics, null, { allowFallback: false, label: 'model metrics' }),
    getData(API.getFeatureImportance, MOCK.featureImportance)
  ]);

  const accuracy = metricValue(metrics, 'accuracy');
  const precision = metricValue(metrics, 'precision', metricValue(metrics, 'precision_satisfied'));
  const recall = metricValue(metrics, 'recall', metricValue(metrics, 'at_risk_detection_rate', metricValue(metrics, 'recall_satisfied')));
  const f1Score = metricValue(metrics, 'f1_score', metricValue(metrics, 'f1_satisfied'));
  const auc = metricValue(metrics, 'roc_auc');
  const totalSamples = metricValue(metrics, 'total_samples');
  updateMetricNarratives(fi, { auc, totalSamples });

  // Story questions update
  document.getElementById('story-acc').textContent = metricLabel(accuracy);
  document.getElementById('story-recall').textContent = metricLabel(recall);

  // Metric rings
  setRingMetric('accuracy', accuracy, metricLabel(accuracy, 1));
  setRingMetric('precision', precision, metricLabel(precision, 1));
  setRingMetric('recall', recall, metricLabel(recall, 1));
  setRingMetric('f1', f1Score, metricLabel(f1Score, 1));

  // Confusion matrix
  renderConfusionMatrix(metrics?.confusion_matrix, totalSamples);

  // ROC curve
  drawROCCurve('chart-roc', auc);

  // Feature importance chart
  drawFeatureImportance('chart-feature-importance', fi, 10);

  // Segment confidence cards
  buildSegmentConfidence(metrics);

  staggerFadeIn(document.querySelectorAll('.conf-metric-card'));
}

function metricValue(metrics, key, fallback = null) {
  const value = metrics?.[key];
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function metricLabel(value, decimals = 1) {
  return Number.isFinite(Number(value)) ? fmtPct(Number(value), decimals) : 'Unavailable';
}

function setRingMetric(key, value, label) {
  const valEl = document.getElementById('val-' + key);
  if (valEl) valEl.textContent = label;

  const ring = document.getElementById('ring-' + key);
  if (ring) {
    const circumference = 201;
    const bounded = Number.isFinite(Number(value)) ? Math.max(0, Math.min(1, Number(value))) : 0;
    const offset = circumference - (circumference * bounded);
    setTimeout(() => {
      ring.style.transition = 'stroke-dashoffset 1.2s ease';
      ring.setAttribute('stroke-dashoffset', offset.toFixed(1));
    }, 200);
  }
}

function renderConfusionMatrix(cm, totalSamples) {
  const validCm = Array.isArray(cm) && cm.length === 2 && cm.every(row => Array.isArray(row) && row.length === 2);

  const ids = ['cm-tn', 'cm-fp', 'cm-fn', 'cm-tp'];
  if (!validCm) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });
    const errEl = document.getElementById('cm-errors');
    if (errEl) errEl.textContent = 'not exported';
    const samplesBadge = document.getElementById('cm-samples-badge');
    if (samplesBadge) samplesBadge.textContent = Number.isFinite(Number(totalSamples)) ? `${fmt(totalSamples)} samples` : 'samples unavailable';
    const story = document.getElementById('cm-story');
    if (story) {
      story.innerHTML = 'Confusion matrix was not exported in the current artifact. The dashboard still reports accuracy, precision, recall, F1, and AUC from the saved CatBoost evaluation.';
    }
    return;
  }

  document.getElementById('cm-tn').textContent = fmt(cm[0][0]);
  document.getElementById('cm-fp').textContent = fmt(cm[0][1]);
  document.getElementById('cm-fn').textContent = fmt(cm[1][0]);
  document.getElementById('cm-tp').textContent = fmt(cm[1][1]);

  const totalErrors = cm[0][1] + cm[1][0];
  document.getElementById('cm-errors').textContent = fmt(totalErrors);

  const samplesBadge = document.getElementById('cm-samples-badge');
  if (samplesBadge) samplesBadge.textContent = `${fmt(totalSamples)} samples`;

  const story = document.getElementById('cm-story');
  if (story) {
    story.innerHTML = `Only <strong id="cm-errors">${fmt(totalErrors)}</strong> misclassifications out of ${fmt(totalSamples)} passengers. False negatives are kept low, which matters for detecting at-risk passengers before they churn.`;
  }
}

function updateMetricNarratives(fi, values) {
  const hasAuc = Number.isFinite(Number(values.auc));
  const aucText = hasAuc ? Number(values.auc).toFixed(4) : 'Unavailable';
  const reliabilityPct = hasAuc ? (Number(values.auc) * 100).toFixed(1) : null;

  const rocSubtitle = document.getElementById('roc-subtitle');
  if (rocSubtitle) rocSubtitle.textContent = hasAuc ? `AUC = ${aucText} - model discrimination ability` : 'AUC unavailable';

  const aucBadge = document.getElementById('auc-badge');
  if (aucBadge) aucBadge.textContent = hasAuc ? `AUC ${aucText}` : 'AUC unavailable';

  const aucStory = document.getElementById('auc-story');
  if (aucStory) {
    aucStory.innerHTML = hasAuc
      ? `An <strong>AUC of ${aucText}</strong> means the system can distinguish satisfied from dissatisfied passengers with about ${reliabilityPct}% ranking reliability on the saved evaluation set.`
      : 'ROC-AUC is unavailable because the backend metrics endpoint did not return model evaluation data.';
  }

  const topFeatures = (fi?.features || []).slice(0, 3);
  const topImportances = (fi?.importance || []).slice(0, 3);
  const topFeatureSummary = document.getElementById('top-feature-summary');
  if (topFeatureSummary && topFeatures.length > 0) {
    topFeatureSummary.innerHTML = `Top features: <strong style="color:var(--accent-purple)">${topFeatures.join(', ')}</strong> - strongest signals behind recommendation priority.`;
  }

  const featureStory = document.getElementById('feature-story');
  if (featureStory && topFeatures.length >= 2) {
    const combined = topImportances.slice(0, 2).reduce((sum, value) => sum + Number(value || 0), 0);
    featureStory.innerHTML = `<strong>${topFeatures[0]} (${Number(topImportances[0]).toFixed(1)}%)</strong> and <strong>${topFeatures[1]} (${Number(topImportances[1]).toFixed(1)}%)</strong> are the two strongest model drivers, together contributing <strong>${combined.toFixed(1)}%</strong> of feature importance.`;
  }
}

function buildSegmentConfidence(metrics) {
  const container = document.getElementById('seg-confidence');
  if (!container) return;

  const highConfidenceRate = metricValue(metrics, 'high_confidence_rate');
  if (!Number.isFinite(Number(highConfidenceRate))) {
    container.innerHTML = `
      <div class="disclaimer" style="grid-column:1/-1;">
        <span class="disclaimer-icon">Info</span>
        <span>Segment-level confidence is not exported by the current metrics API, so no hardcoded segment confidence values are shown.</span>
      </div>
    `;
    return;
  }

  const segments = [
    {
      label: 'Overall High-Confidence Rate',
      confidence: highConfidenceRate,
      color: 'var(--accent-green)',
      note: 'Loaded from model metadata'
    },
  ];

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
