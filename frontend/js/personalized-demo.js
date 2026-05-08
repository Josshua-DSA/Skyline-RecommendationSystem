let _selectedPassengerId = 1;

async function initPersonalizedDemo() {
  const passengers = await getData(API.getSamplePassengers, MOCK.samplePassengers);
  buildPassengerSelector(passengers);
  await loadPassengerRecommendation(_selectedPassengerId);
}

function buildPassengerSelector(passengers) {
  const selector = document.getElementById('passenger-selector');
  if (!selector) return;

  passengers.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'passenger-chip' + (p.id === _selectedPassengerId ? ' active' : '');
    chip.textContent = p.label;
    chip.addEventListener('click', async () => {
      document.querySelectorAll('.passenger-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      _selectedPassengerId = p.id;
      await loadPassengerRecommendation(p.id);
    });
    selector.appendChild(chip);
  });
}

async function loadPassengerRecommendation(id) {
  // Show loading in rec list
  const recList = document.getElementById('rec-list');
  if (recList) recList.innerHTML = `<div class="loading-overlay" style="padding:40px"><div class="spinner"></div></div>`;

  const data = await getData(() => API.getRecommendation(id), MOCK.recommendations[id] || MOCK.recommendations[1]);
  if (!data) return;

  renderProfile(data.passenger_profile, id);
  renderPrediction(data);
  renderProblems(data.problematic_services || []);
  renderRecommendations(data.recommendations || []);
}

function renderProfile(profile, id) {
  const avatarEmojis = { 1:'👨‍💼', 2:'👩', 3:'👨', 4:'👩‍💼', 5:'👴' };
  const avatar = document.getElementById('profile-avatar');
  if (avatar) avatar.textContent = avatarEmojis[id] || '👤';

  const nameEl = document.getElementById('profile-name');
  if (nameEl) nameEl.textContent = `${profile.gender || '—'}, Age ${profile.age || '—'}`;

  const subEl = document.getElementById('profile-sub');
  if (subEl) subEl.textContent = `${profile.customer_type} · ${profile.travel_type}`;

  const badgeEl = document.getElementById('profile-badge');
  if (badgeEl) {
    badgeEl.textContent = profile.class;
    badgeEl.className = 'badge ' + (profile.class === 'Business' ? 'badge-blue' : profile.class === 'Eco Plus' ? 'badge-gold' : 'badge-purple');
  }

  const attrsEl = document.getElementById('profile-attrs');
  if (!attrsEl) return;

  const attrs = [
    ['Customer Type', profile.customer_type],
    ['Travel Type', profile.travel_type],
    ['Class', profile.class],
    ['Flight Distance', fmt(profile.flight_distance) + ' km'],
    ['Departure Delay', (profile.departure_delay || 0) + ' min'],
    ['Arrival Delay', (profile.arrival_delay || 0) + ' min'],
  ];

  attrsEl.innerHTML = attrs.map(([k, v]) => `
    <div class="profile-attr">
      <span class="attr-key">${k}</span>
      <span class="attr-val">${v}</span>
    </div>
  `).join('');
}

function renderPrediction(data) {
  const before = data.prediction_before;
  const after = data.prediction_after;
  const uplift = data.satisfaction_uplift || 0;

  const probBefore = document.getElementById('prob-before');
  if (probBefore) probBefore.textContent = fmtPct(before.probability_satisfied);

  const probAfter = document.getElementById('prob-after');
  if (probAfter) probAfter.textContent = fmtPct(after.probability_satisfied);

  const upliftVal = document.getElementById('uplift-val');
  if (upliftVal) upliftVal.textContent = '+' + fmtPct(uplift);

  const upliftBar = document.getElementById('uplift-bar');
  if (upliftBar) setTimeout(() => { upliftBar.style.width = Math.min(100, uplift * 200).toFixed(0) + '%'; }, 300);

  const predBadge = document.getElementById('pred-badge');
  if (predBadge) {
    const isSat = after.prediction === 1;
    predBadge.textContent = isSat ? '✅ Predicted Satisfied' : '⚠️ Predicted Dissatisfied';
    predBadge.className = 'badge ' + (isSat ? 'badge-green' : 'badge-red');
  }
}

function renderProblems(problems) {
  const list = document.getElementById('problems-list');
  const count = document.getElementById('problem-count');
  if (!list) return;

  if (count) count.textContent = problems.length + ' issue' + (problems.length !== 1 ? 's' : '');

  if (problems.length === 0) {
    list.innerHTML = `<div style="color:var(--accent-green);font-size:13px;padding:12px 0;">✅ No critical service issues detected</div>`;
    return;
  }

  list.innerHTML = problems.slice(0, 6).map(p => `
    <div class="problem-item ${p.severity}">
      <div class="severity-dot sev-${p.severity}"></div>
      <div class="problem-name">${p.feature}</div>
      <div class="problem-rating" style="color:${p.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-gold)'}">
        ${p.rating}/5
      </div>
      <span class="badge ${p.severity === 'critical' ? 'badge-red' : 'badge-gold'}">${p.severity}</span>
    </div>
  `).join('');
}

function renderRecommendations(recs) {
  const list = document.getElementById('rec-list');
  const count = document.getElementById('rec-count');
  if (!list) return;

  if (count) count.textContent = recs.length + ' recommendations';

  if (recs.length === 0) {
    list.innerHTML = `<div style="color:var(--text-muted);font-size:13px;padding:20px 0;text-align:center;">No recommendations triggered for this passenger profile.</div>`;
    return;
  }

  list.innerHTML = recs.map((r, i) => `
    <div class="rec-item fade-in" style="animation-delay:${i * 80}ms;">
      <div class="rec-item-rank">${i + 1}</div>
      <div class="rec-icon">${r.icon || '⚡'}</div>
      <div class="rec-info">
        <div class="rec-name">${r.name}</div>
        <div class="rec-desc">${r.description}</div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
          ${r.rule_triggered ? `<span class="badge badge-gold" style="font-size:10px;">📋 Rule</span>` : ''}
          ${r.model_triggered ? `<span class="badge badge-blue" style="font-size:10px;">🤖 Model</span>` : ''}
          <span class="badge badge-purple" style="font-size:10px;">Score: ${((r.ensemble_score || 0) * 100).toFixed(0)}%</span>
        </div>
      </div>
      <div class="rec-meta">
        <div class="rec-uplift">+${fmtPct(r.satisfaction_uplift)}</div>
        <div class="rec-uplift-label">Uplift</div>
        <div class="confidence-bar-wrap" style="margin-top:6px;">
          <div class="confidence-bar-fill" style="width:${((r.ensemble_score || 0.5) * 100).toFixed(0)}%"></div>
        </div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">confidence</div>
      </div>
    </div>
  `).join('');
}