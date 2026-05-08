async function initExecutiveSummary() {
  const [summary, metrics] = await Promise.all([
    getData(API.getExecutiveSummary, MOCK.executiveSummary),
    getData(API.getMetrics, MOCK.metrics)
  ]);

  // KPI counters
  const totalEl = document.getElementById('kpi-total');
  if (totalEl) animateCounter(totalEl, summary.total_passengers);

  const satRateEl = document.getElementById('kpi-sat-rate');
  if (satRateEl) { satRateEl.textContent = '—'; setTimeout(() => { satRateEl.textContent = fmtPct(summary.satisfaction_rate); }, 400); }

  const satCountEl = document.getElementById('kpi-sat-count');
  if (satCountEl) satCountEl.textContent = fmt(summary.satisfied_count) + ' passengers satisfied';

  const upliftEl = document.getElementById('kpi-uplift');
  if (upliftEl) { upliftEl.textContent = '—'; setTimeout(() => { upliftEl.textContent = '+' + fmtPct(summary.predicted_uplift); }, 500); }

  const newRateEl = document.getElementById('kpi-new-rate');
  if (newRateEl) newRateEl.textContent = 'New rate: ' + fmtPct(summary.predicted_new_satisfaction_rate);

  const revEl = document.getElementById('kpi-revenue');
  if (revEl) { revEl.textContent = '—'; setTimeout(() => { revEl.textContent = fmtUSD(summary.estimated_revenue_lift_annual); }, 600); }

  const riskEl = document.getElementById('kpi-risk');
  if (riskEl) animateCounter(riskEl, summary.high_risk_passengers);

  // Accuracy strip
  const accAcc = document.getElementById('acc-accuracy');
  if (accAcc) accAcc.textContent = fmtPct(metrics.accuracy);

  const accAuc = document.getElementById('acc-auc');
  if (accAuc) accAuc.textContent = metrics.roc_auc.toFixed(4);

  const accRec = document.getElementById('acc-rec');
  if (accRec) { accRec.textContent = '—'; animateCounter(accRec, summary.total_recommendations_possible); }

  const accModel = document.getElementById('acc-model');
  if (accModel) accModel.textContent = 'Hybrid Ensemble\n(CatBoost + Rules)';

  // Factor list
  buildFactorList(summary.top_factors);

  // Uplift numbers
  const upBefore = document.getElementById('uplift-before');
  if (upBefore) upBefore.textContent = fmtPct(summary.satisfaction_rate);

  const upAfter = document.getElementById('uplift-after');
  if (upAfter) upAfter.textContent = fmtPct(summary.predicted_new_satisfaction_rate);

  // Revenue
  const revMonthly = document.getElementById('rev-monthly');
  if (revMonthly) revMonthly.textContent = fmtUSD(summary.estimated_revenue_lift_monthly);

  const revAnnual = document.getElementById('rev-annual');
  if (revAnnual) revAnnual.textContent = fmtUSD(summary.estimated_revenue_lift_annual);

  // Doughnut chart
  const satPct = +(summary.satisfaction_rate * 100).toFixed(1);
  const disatPct = +(100 - satPct).toFixed(1);
  drawDoughnut('chart-satisfaction-split',
    [satPct, disatPct],
    ['Satisfied', 'Neutral / Dissatisfied'],
    ['#3ECFB2', '#FF4D6D']
  );

  // Stagger KPI cards
  staggerFadeIn(document.querySelectorAll('.kpi-card'));
}

function buildFactorList(factors) {
  const list = document.getElementById('factor-list');
  if (!list) return;
  const maxImp = Math.max(...factors.map(f => f.importance));
  list.innerHTML = factors.map((f, i) => `
    <div class="factor-item fade-in" style="animation-delay:${i * 80}ms">
      <div class="factor-rank">${i + 1}</div>
      <div class="factor-info">
        <div class="factor-name">${f.feature}</div>
        <div class="factor-bar-track">
          <div class="factor-bar-fill" style="width:${(f.importance / maxImp * 100).toFixed(1)}%"></div>
        </div>
      </div>
      <div class="factor-pct">${f.importance.toFixed(1)}%</div>
    </div>
  `).join('');
}