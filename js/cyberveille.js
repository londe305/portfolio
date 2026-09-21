/* =====================================================
   cyberveille.js — Agrégateur RSS cybersécurité.

   Contrairement au widget RSS de "Veille" (js/ui.js), qui
   interroge des flux en direct côté navigateur, cette section
   lit un instantané déjà collecté, dédupliqué et purgé (>7 jours)
   par le workflow planifié .github/workflows/cyberveille-feed.yml
   (voir scripts/cyberveille/fetch-feed.mjs). Aucun appel réseau
   externe ni proxy CORS n'est nécessaire ici : data/cyber-feed.json
   est servi par le même serveur statique que le reste du site.
===================================================== */

import { safeStorage } from './utils.js';

const FEED_URL = 'data/cyber-feed.json';
const META_URL = 'data/cyber-meta.json';
const RECENT_KEY = 'cyberveilleRecent';
const RECENT_MAX = 10;

const state = {
  items: [],
  dayFilter: null,      // null = tous les jours, sinon 'YYYY-MM-DD'
  excludedSources: new Set(),
  criticalOnly: true
};

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isValidItem(item) {
  return item && typeof item.title === 'string' && typeof item.source === 'string'
    && typeof item.summary === 'string' && isSafeHttpUrl(item.link)
    && Number.isFinite(new Date(item.pubDate).getTime());
}

/* ---- Utilitaires date ---- */

function dayKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayLabel(key) {
  const today = dayKey(new Date().toISOString());
  const yestKey = dayKey(new Date(Date.now() - 86400000).toISOString());
  if (key === today) return "Aujourd'hui";
  if (key === yestKey) return 'Hier';
  const [y, m, d] = key.split('-');
  return new Date(`${y}-${m}-${d}T00:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

/* ---- Fetch ---- */

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.debug(`[cyberveille] échec du chargement de ${url}:`, e.message);
    return null;
  }
}

/* ---- "Consultés récemment" (localStorage) ---- */

function getRecent() {
  return safeStorage.getJSON(RECENT_KEY, []);
}

function recordRecent(item) {
  if (!isSafeHttpUrl(item.link)) return;
  const list = getRecent().filter(r => r.link !== item.link);
  list.unshift({ title: item.title, link: item.link, source: item.source });
  safeStorage.setJSON(RECENT_KEY, list.slice(0, RECENT_MAX));
  renderRecent();
}

function renderRecent() {
  const container = document.getElementById('cv-recent-list');
  if (!container) return;
  const list = getRecent();
  if (!list.length) {
    container.innerHTML = '<p class="cv-empty">Aucun article consulté pour l\'instant.</p>';
    return;
  }
  container.innerHTML = '';
  list.forEach(item => {
    if (!isSafeHttpUrl(item.link)) return;
    const a = document.createElement('a');
    a.className = 'cv-recent-item';
    a.href = item.link;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = `${item.title} — ${item.source}`;
    container.appendChild(a);
  });
}

/* ---- Rendu d'une carte article ---- */

function buildCard(item) {
  const div = document.createElement('div');
  div.className = 'cv-card' + (item.severity === 'critical' ? ' critical' : '');

  const meta = document.createElement('div');
  meta.className = 'cv-card-meta';
  const source = document.createElement('span');
  source.className = 'cv-source';
  source.textContent = item.source;
  const date = document.createElement('span');
  date.className = 'cv-date';
  date.textContent = new Date(item.pubDate).toLocaleDateString('fr-FR');
  meta.append(source, date);
  if (item.severity === 'critical') {
    const badge = document.createElement('span');
    badge.className = 'cv-badge critical';
    badge.textContent = '🚨 CRITIQUE';
    meta.appendChild(badge);
  }
  (Array.isArray(item.cveIds) ? item.cveIds : []).forEach(cve => {
    if (!/^CVE-\d{4}-\d{4,7}$/i.test(cve)) return;
    const badge = document.createElement('span');
    badge.className = 'cv-badge cve';
    badge.textContent = cve;
    meta.appendChild(badge);
  });

  const link = document.createElement('a');
  link.className = 'cv-title';
  link.href = item.link;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = item.title;
  link.addEventListener('click', () => recordRecent(item));

  div.appendChild(meta);
  div.appendChild(link);

  if (item.summary) {
    const p = document.createElement('p');
    p.className = 'cv-summary';
    p.textContent = item.summary;
    div.appendChild(p);
  }
  return div;
}

/* ---- Filtres sidebar ---- */

function buildDayFilters() {
  const container = document.getElementById('cv-day-filters');
  if (!container) return;

  const counts = new Map();
  state.items.forEach(item => {
    const key = dayKey(item.pubDate);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const days = [...counts.keys()].sort().reverse();

  container.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'cv-day-btn' + (state.dayFilter === null ? ' active' : '');
  allBtn.innerHTML = `<span>Tous</span><span class="cv-count">${state.items.length}</span>`;
  allBtn.addEventListener('click', () => setDayFilter(null, allBtn));
  container.appendChild(allBtn);

  days.forEach(key => {
    const btn = document.createElement('button');
    btn.className = 'cv-day-btn' + (key === state.dayFilter ? ' active' : '');
    btn.innerHTML = `<span>${dayLabel(key)}</span><span class="cv-count">${counts.get(key)}</span>`;
    btn.addEventListener('click', () => setDayFilter(key, btn));
    container.appendChild(btn);
  });
}

function setDayFilter(key, btn) {
  state.dayFilter = key;
  document.querySelectorAll('.cv-day-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function buildSourceFilters() {
  const container = document.getElementById('cv-source-filters');
  if (!container) return;

  const sources = [...new Set(state.items.map(i => i.source))].sort();
  container.innerHTML = '';
  sources.forEach(source => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    input.addEventListener('change', () => {
      if (input.checked) state.excludedSources.delete(source);
      else state.excludedSources.add(source);
      applyFilters();
    });
    label.appendChild(input);
    label.appendChild(document.createTextNode(source));
    container.appendChild(label);
  });
}

/* ---- Bandeau d'alertes critiques (indépendant des filtres jour/source) ---- */

function renderAlerts() {
  const container = document.getElementById('cv-alerts');
  if (!container) return;
  const alerts = state.items.filter(i => i.severity !== 'normal').slice(0, 5);
  container.innerHTML = '';
  if (!alerts.length) return;
  const heading = document.createElement('div');
  heading.className = 'cv-alerts-heading';
  heading.textContent = '🚨 Alertes critiques & CVE majeures';
  container.appendChild(heading);
  alerts.forEach(item => container.appendChild(buildCard(item)));
}

/* ---- Application des filtres + rendu du flux principal ---- */

function applyFilters() {
  const feed = document.getElementById('cv-feed');
  if (!feed) return;

  const filtered = state.items.filter(item => {
    if (state.dayFilter && dayKey(item.pubDate) !== state.dayFilter) return false;
    if (state.excludedSources.has(item.source)) return false;
    if (state.criticalOnly && item.severity === 'normal') return false;
    return true;
  });

  feed.innerHTML = '';
  if (!filtered.length) {
    feed.innerHTML = '<p class="rss-notice">Aucun article ne correspond aux filtres sélectionnés.</p>';
  } else {
    filtered.forEach(item => feed.appendChild(buildCard(item)));
  }

  const count = document.getElementById('cv-count');
  if (count) count.textContent = `${filtered.length} article${filtered.length > 1 ? 's' : ''}`;
}

function bindCriticalToggle() {
  const toggle = document.getElementById('cv-critical-toggle');
  if (!toggle) return;
  toggle.addEventListener('change', () => {
    state.criticalOnly = toggle.checked;
    applyFilters();
  });
}

function renderUpdated(meta) {
  const el = document.getElementById('cv-updated');
  if (!el) return;
  if (meta && meta.lastRun) {
    el.textContent = `Mis à jour : ${new Date(meta.lastRun).toLocaleString('fr-FR')}`;
  } else {
    el.textContent = 'Données d\'exemple — en attente de la première collecte automatique';
  }
}

function renderFallback() {
  const feed = document.getElementById('cv-feed');
  if (feed) feed.innerHTML = '<p class="rss-notice">⚠️ Flux indisponible pour le moment — réessayez plus tard.</p>';
}

/* ---- Point d'entrée ---- */

export async function initCyberveille() {
  const feed = document.getElementById('cv-feed');
  if (!feed) return; // composant non chargé

  try {
    const [items, meta] = await Promise.all([fetchJSON(FEED_URL), fetchJSON(META_URL)]);

    if (!items || !items.length) {
      renderFallback();
      renderRecent();
      return;
    }

    state.items = items.filter(isValidItem).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    if (!state.items.length) {
      renderFallback();
      renderRecent();
      return;
    }

    const todayKey = dayKey(new Date().toISOString());
    state.dayFilter = state.items.some(item => dayKey(item.pubDate) === todayKey) ? todayKey : null;

    buildDayFilters();
    buildSourceFilters();
    bindCriticalToggle();
    renderAlerts();
    applyFilters();
    renderUpdated(meta);
    renderRecent();
  } catch (err) {
    console.error('[cyberveille] Échec de l\'initialisation:', err);
    renderFallback();
  }
}
