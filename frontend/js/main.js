// ── PAGE REGISTRY ──
const PAGES = [
  { id: 'executive-summary',          label: 'Executive Summary',         icon: '📊', file: 'pages/executive-summary.html',          js: 'js/executive-summary.js' },
  { id: 'recommendation-confidence',  label: 'Recommendation Confidence', icon: '🎯', file: 'pages/recommendation-confidence.html',  js: 'js/recommendation-confidence.js' },
  { id: 'personalized-demo',          label: 'Personalized Demo',         icon: '🧩', file: 'pages/personalized-demo.html',          js: 'js/personalized-demo.js' },
  { id: 'segment-analysis',           label: 'Segment Analysis',          icon: '📐', file: 'pages/segment-analysis.html',           js: 'js/segment-analysis.js' },
  { id: 'satisfaction-impact',        label: 'Satisfaction Impact',       icon: '💡', file: 'pages/satisfaction-impact.html',        js: 'js/satisfaction-impact.js' },
  { id: 'business-impact-simulation', label: 'Business Simulation',       icon: '💰', file: 'pages/business-impact-simulation.html', js: 'js/business-impact-simulation.js' },
];

let currentPage = null;
let loadedScripts = new Set();

// ── BUILD SIDEBAR NAV ──
function buildNav() {
  const nav = document.getElementById('sidebar-nav');
  PAGES.forEach(page => {
    const a = document.createElement('a');
    a.className = 'nav-item';
    a.href = '#' + page.id;
    a.dataset.page = page.id;
    a.innerHTML = `<span class="nav-icon">${page.icon}</span> ${page.label}`;
    a.addEventListener('click', e => { e.preventDefault(); navigateTo(page.id); });
    nav.appendChild(a);
  });
}

// ── NAVIGATION ──
async function navigateTo(pageId) {
  const page = PAGES.find(p => p.id === pageId);
  if (!page) return;

  // Update sidebar
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === pageId));

  // Update topbar
  document.getElementById('topbar-title').textContent = page.label;
  document.getElementById('topbar-subtitle').textContent = getPageSubtitle(pageId);

  // Show loading
  const content = document.getElementById('page-content');
  content.innerHTML = `<div class="loading-overlay"><div class="spinner"></div><p style="color:var(--text-muted);font-size:13px">Loading ${page.label}…</p></div>`;

  try {
    // Load HTML
    const res = await fetch(page.file);
    const html = await res.text();
    content.innerHTML = html;

    // Load JS if not already loaded
    if (!loadedScripts.has(page.js)) {
      await loadScript(page.js);
      loadedScripts.add(page.js);
    }

    // Init the page
    const initFn = 'init' + page.id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('');
    if (typeof window[initFn] === 'function') {
      await window[initFn]();
    }

    currentPage = pageId;
    window.location.hash = pageId;
    content.classList.add('fade-in');
  } catch (err) {
    console.error('Navigation error:', err);
    content.innerHTML = `<div class="loading-overlay"><p style="color:var(--accent-red)">⚠️ Failed to load page. Please try again.</p></div>`;
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function getPageSubtitle(id) {
  const map = {
    'executive-summary':          'Business overview for executive reporting',
    'recommendation-confidence':  'CatBoost model performance & reliability metrics',
    'personalized-demo':          'Interactive passenger recommendation engine',
    'segment-analysis':           'Segment-level satisfaction & opportunity analysis',
    'satisfaction-impact':        'Service feature vs satisfaction correlation analysis',
    'business-impact-simulation': 'Assumption-based ROI & revenue simulation',
  };
  return map[id] || '';
}

// ── FORMAT HELPERS ──
function fmt(n, decimals = 0) {
  if (n === undefined || n === null) return '–';
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPct(n, d = 1) { return (n * 100).toFixed(d) + '%'; }

function fmtUSD(n) {
  if (n >= 1e6) return 'USD ' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return 'USD ' + (n / 1e3).toFixed(0) + 'K';
  return 'USD ' + n.toLocaleString();
}

function opportunityLabel(score) {
  if (score >= 85) return ['opp-high', 'High'];
  if (score >= 65) return ['opp-medium', 'Medium'];
  return ['opp-low', 'Low'];
}

function animateCounter(el, target, duration = 1200, decimals = 0) {
  const start = performance.now();
  const from = 0;
  function step(ts) {
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = from + (target - from) * ease;
    el.textContent = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── STAGGER ANIMATION ──
function staggerFadeIn(els) {
  els.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      el.style.opacity = '1';
      el.style.transform = 'none';
    }, i * 80);
  });
}

// ── INIT ──
async function hydrateModelFooter() {
  const samplesEl = document.getElementById('footer-samples');
  const accuracyEl = document.getElementById('footer-accuracy');
  const aucEl = document.getElementById('footer-auc');

  const metrics = await API.getMetrics();
  if (!metrics) {
    if (samplesEl) samplesEl.textContent = 'Unavailable';
    if (accuracyEl) accuracyEl.textContent = 'Unavailable';
    if (aucEl) aucEl.textContent = 'Unavailable';
    return;
  }

  if (samplesEl) samplesEl.textContent = Number.isFinite(Number(metrics.total_samples)) ? `${fmt(metrics.total_samples)} passengers` : 'Unavailable';
  if (accuracyEl) accuracyEl.textContent = Number.isFinite(Number(metrics.accuracy)) ? fmtPct(metrics.accuracy) : 'Unavailable';
  if (aucEl) aucEl.textContent = Number.isFinite(Number(metrics.roc_auc)) ? Number(metrics.roc_auc).toFixed(4) : 'Unavailable';
}

document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  hydrateModelFooter();
  const hash = window.location.hash.replace('#', '') || 'executive-summary';
  navigateTo(hash);
});
