async function initBusinessImpactSimulation() {
  await runBusinessSimulation();
}

function resetSimDefaults() {
  document.getElementById('sim-ticket').value = 850;
  document.getElementById('sim-volume').value = 10000;
  document.getElementById('sim-adoption').value = 30;
  document.getElementById('adoption-val').textContent = '30%';
  document.getElementById('sim-conversion').value = 5;
  document.getElementById('conv-val').textContent = '5%';
  document.getElementById('sim-retention').value = 3;
  document.getElementById('ret-val').textContent = '3%';
  document.getElementById('sim-ancillary').value = 120;
  document.getElementById('sim-impl-cost').value = 500000;
  document.getElementById('sim-op-cost').value = 80000;
}

async function runBusinessSimulation() {
  const params = {
    avg_ticket_value: +document.getElementById('sim-ticket').value || 850,
    monthly_passengers: +document.getElementById('sim-volume').value || 10000,
    adoption_rate: (+document.getElementById('sim-adoption').value || 30) / 100,
    conversion_lift: (+document.getElementById('sim-conversion').value || 5) / 100,
    retention_lift: (+document.getElementById('sim-retention').value || 3) / 100,
    ancillary_revenue_per_passenger: +document.getElementById('sim-ancillary').value || 120,
    implementation_cost: +document.getElementById('sim-impl-cost').value || 500000,
    monthly_operating_cost: +document.getElementById('sim-op-cost').value || 80000
  };

  const result = await getData(() => API.runSimulation(params), null) || localSimulate(params);

  renderScenarios(result.scenarios);
  renderSimChart(result.scenarios);
  renderSimTable(result.scenarios);
}

function localSimulate(params) {
  const { avg_ticket_value: t, monthly_passengers: mp, adoption_rate: ar,
          conversion_lift: cl, retention_lift: rl, ancillary_revenue_per_passenger: an,
          implementation_cost: ic, monthly_operating_cost: moc } = params;

  function calc(cvMult, retMult, adoptMult) {
    const targeted = mp * adoptMult;
    const converted = targeted * (cl * cvMult);
    const retained = targeted * (rl * retMult);
    const monthly = converted * t + retained * t * 0.15 + targeted * (an * 0.3);
    const annual = monthly * 12;
    const totalCost = ic + moc * 12;
    return {
      monthly_revenue_lift: Math.round(monthly),
      annual_revenue_lift: Math.round(annual),
      roi_percent: +((annual - totalCost) / totalCost * 100).toFixed(1),
      payback_months: +(ic / Math.max(1, monthly - moc)).toFixed(1),
      passengers_targeted: Math.round(targeted),
      new_conversions: Math.round(converted),
      retained_passengers: Math.round(retained)
    };
  }

  return {
    scenarios: {
      conservative: calc(0.6, 0.6, ar * 0.6),
      expected:     calc(1.0, 1.0, ar),
      aggressive:   calc(1.5, 1.4, Math.min(0.8, ar * 1.5))
    }
  };
}

function renderScenarios(scenarios) {
  const s = scenarios;

  document.getElementById('sc-cons-rev').textContent = fmtUSD(s.conservative.annual_revenue_lift);
  document.getElementById('sc-cons-roi').textContent = s.conservative.roi_percent + '%';
  document.getElementById('sc-cons-pay').textContent = s.conservative.payback_months + ' mo.';

  document.getElementById('sc-exp-rev').textContent  = fmtUSD(s.expected.annual_revenue_lift);
  document.getElementById('sc-exp-roi').textContent  = s.expected.roi_percent + '%';
  document.getElementById('sc-exp-pay').textContent  = s.expected.payback_months + ' mo.';

  document.getElementById('sc-agg-rev').textContent  = fmtUSD(s.aggressive.annual_revenue_lift);
  document.getElementById('sc-agg-roi').textContent  = s.aggressive.roi_percent + '%';
  document.getElementById('sc-agg-pay').textContent  = s.aggressive.payback_months + ' mo.';

  staggerFadeIn(document.querySelectorAll('.scenario-card'));
}

function renderSimChart(scenarios) {
  drawSimulationChart('chart-simulation', scenarios);
}

function renderSimTable(scenarios) {
  const tbody = document.getElementById('sim-table-body');
  if (!tbody) return;

  const rows = [
    ['Monthly Revenue Lift', s => fmtUSD(s.monthly_revenue_lift)],
    ['Annual Revenue Lift',  s => fmtUSD(s.annual_revenue_lift)],
    ['ROI',                  s => s.roi_percent + '%'],
    ['Payback Period',       s => s.payback_months + ' months'],
    ['Passengers Targeted',  s => fmt(s.passengers_targeted)],
    ['New Conversions',      s => fmt(s.new_conversions)],
    ['Retained Passengers',  s => fmt(s.retained_passengers)],
  ];

  tbody.innerHTML = rows.map(([label, fn]) => `
    <tr>
      <td style="font-weight:600;">${label}</td>
      <td style="color:var(--text-secondary);">${fn(scenarios.conservative)}</td>
      <td style="color:var(--accent-green);font-weight:600;">${fn(scenarios.expected)}</td>
      <td style="color:var(--accent-gold);font-weight:600;">${fn(scenarios.aggressive)}</td>
    </tr>
  `).join('');
}