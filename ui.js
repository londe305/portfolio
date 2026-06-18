/* =====================================================
   ui.js — Interactions UI : lightbox + flux RSS veille
   Dépendances : navigation.js ($, $$)
===================================================== */

/* ---- Lightbox visionneuse d'images ---- */

(function initLightbox() {
  const galleryImages = $$('.schema-gallery img');
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightbox-img');
  const btnClose      = document.querySelector('.lightbox-close');
  const btnPrev       = document.querySelector('.lightbox-prev');
  const btnNext       = document.querySelector('.lightbox-next');

  if (!lightbox || !galleryImages.length) return;

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = galleryImages[index].src;
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    btnClose?.focus();
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  function nextImg() {
    if (!galleryImages.length) return;
    currentIndex = (currentIndex + 1) % galleryImages.length;
    lightboxImg.src = galleryImages[currentIndex].src;
  }

  function prevImg() {
    if (!galleryImages.length) return;
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentIndex].src;
  }

  // Clic sur chaque image de la galerie
  galleryImages.forEach((img, i) => img.addEventListener('click', () => openLightbox(i)));

  // Contrôles lightbox
  btnClose?.addEventListener('click', closeLightbox);
  btnNext?.addEventListener('click',  nextImg);
  btnPrev?.addEventListener('click',  prevImg);

  // Clic sur le fond = fermeture
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  // Clavier (seulement quand la lightbox est ouverte)
  window.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') nextImg();
    if (e.key === 'ArrowLeft')  prevImg();
  });
})();

/* ---- RSS – Actualités veille Zero Trust ---- */

const RSS_CACHE_KEY = 'portfolioRSS';
const RSS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const RSS_FEEDS = [
  { url: 'https://feeds.feedburner.com/TheHackersNews', name: 'Hacker News' },
  { url: 'https://krebsonsecurity.com/feed/',           name: 'Krebs'        },
  { url: 'https://arstechnica.com/security/feed/',      name: 'Ars Tech'     }
];

const RSS_FALLBACK = [
  { title: 'Zero Trust : principes fondamentaux',         link: '#', pubDate: new Date().toISOString(), source: 'Exemple' },
  { title: 'Tutoriel : durcir une connexion SSH',         link: '#', pubDate: new Date().toISOString(), source: 'Exemple' },
  { title: 'Outil recommandé : surveillance & alerting',  link: '#', pubDate: new Date().toISOString(), source: 'Exemple' }
];

/* ---- Cache localStorage ---- */

function getRSSCache() {
  try {
    const raw = localStorage.getItem(RSS_CACHE_KEY);
    if (!raw) return null;
    const { ts, items } = JSON.parse(raw);
    return (Date.now() - ts < RSS_CACHE_TTL) ? items : null;
  } catch { return null; }
}

function setRSSCache(items) {
  try { localStorage.setItem(RSS_CACHE_KEY, JSON.stringify({ ts: Date.now(), items })); }
  catch { /* quota dépassé – on ignore */ }
}

/* ---- Fetch avec timeout ---- */

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

/* ---- Parse RSS XML → items ---- */

function parseRSSXml(xmlText, feedName) {
  try {
    const xml   = new DOMParser().parseFromString(xmlText, 'text/xml');
    const items = Array.from(xml.querySelectorAll('item'));
    if (!items.length) return [];
    return items.slice(0, 6).map(el => ({
      title:   el.querySelector('title')?.textContent?.trim()   || 'Sans titre',
      link:    el.querySelector('link')?.textContent?.trim()
               || el.querySelector('guid')?.textContent?.trim() || '#',
      pubDate: el.querySelector('pubDate')?.textContent?.trim() || '',
      source:  feedName
    }));
  } catch { return []; }
}

/* ---- Fetch d'un flux via allorigins.win (CORS proxy, pas de quota) ---- */

async function fetchOneFeed(feed) {
  /* Proxy 1 : allorigins.win */
  try {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
    const res  = await fetchWithTimeout(url, 8000);
    if (res.ok) {
      const data = await res.json();
      if (data && data.contents) {
        const items = parseRSSXml(data.contents, feed.name);
        if (items.length) return items;
      }
    }
  } catch (e) { console.debug(`[RSS] allorigins ${feed.name}:`, e.message); }

  /* Proxy 2 : rss2json (fallback) */
  try {
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=6`;
    const res  = await fetchWithTimeout(url, 6000);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items) && data.items.length) {
        return data.items.map(item => ({
          title:   item.title   || 'Sans titre',
          link:    item.link    || item.guid || '#',
          pubDate: item.pubDate || '',
          source:  feed.name
        }));
      }
    }
  } catch (e) { console.debug(`[RSS] rss2json ${feed.name}:`, e.message); }

  return [];
}

/* ---- Récupération de tous les flux en parallèle ---- */

async function fetchAllFeeds() {
  const results = await Promise.allSettled(RSS_FEEDS.map(fetchOneFeed));
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 18);
}

/* ---- Rendu ---- */

function buildRSSItem(item) {
  const div  = document.createElement('div');
  div.className = 'rss-item';
  const date = item.pubDate ? new Date(item.pubDate).toLocaleDateString('fr-FR') : '—';
  div.innerHTML =
    `<div class="rss-item-meta"><span class="rss-source">${item.source}</span><span class="rss-date">${date}</span></div>` +
    `<a class="rss-title" href="${item.link}" target="_blank" rel="noopener">${item.title}</a>`;
  return div;
}

function renderRSS(container, items) {
  container.innerHTML = '';
  items.forEach(item => container.appendChild(buildRSSItem(item)));
}

function renderFallback(container) {
  container.innerHTML = '<p class="rss-notice">⚠️ Flux RSS indisponibles — affichage des exemples.</p>';
  RSS_FALLBACK.forEach(item => container.appendChild(buildRSSItem(item)));
}

/* ---- Vide le cache si la version du RSS a changé ---- */
(function purgeLegacyCache() {
  try {
    const raw = localStorage.getItem(RSS_CACHE_KEY);
    if (!raw) return;
    const { ts } = JSON.parse(raw);
    // Supprime les caches de plus de 30 minutes (peut être corrompu)
    if (!ts || Date.now() - ts > 30 * 60 * 1000) localStorage.removeItem(RSS_CACHE_KEY);
  } catch { localStorage.removeItem(RSS_CACHE_KEY); }
})();

/* ---- Chargement principal (avec cache stale-while-revalidate) ---- */

let rssLoading = false; // verrou pour éviter les doublons simultanés

async function loadVeilleRSS() {
  const container = document.getElementById('rss-container');
  if (!container || rssLoading) return;

  const cached = getRSSCache();

  // Affichage instantané depuis le cache → rafraîchissement silencieux
  if (cached && cached.length) {
    renderRSS(container, cached);
    rssLoading = true;
    fetchAllFeeds().then(items => {
      if (items.length) { setRSSCache(items); renderRSS(container, items); }
    }).finally(() => { rssLoading = false; });
    return;
  }

  // Pas de cache : chargement complet
  rssLoading = true;
  container.innerHTML = '<p class="rss-notice">📡 Chargement des actualités…</p>';
  try {
    const items = await fetchAllFeeds();
    if (items.length) { setRSSCache(items); renderRSS(container, items); }
    else renderFallback(container);
  } finally {
    rssLoading = false;
  }
}

/* ---- Exposition globale (appelée directement par activateVeille) ---- */
window.loadVeilleRSS = loadVeilleRSS;
