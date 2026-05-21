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

/* ---- Fetch avec timeout (évite les blocages) ---- */

async function fetchWithTimeout(url, timeoutMs = 5000) {
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

/* ---- Fetch d'un flux via rss2json uniquement ---- */

async function fetchOneFeed(feed) {
  try {
    const res = await fetchWithTimeout(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=6`,
      5000
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'ok' || !Array.isArray(data.items)) return [];
    return data.items.map(item => ({
      title:   item.title || 'Sans titre',
      link:    item.link  || item.guid || '#',
      pubDate: item.pubDate || '',
      source:  feed.name
    }));
  } catch (e) {
    console.debug(`[RSS] ${feed.name} indisponible :`, e.name);
    return [];
  }
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
  const p    = document.createElement('p');
  const date = item.pubDate ? new Date(item.pubDate).toLocaleDateString('fr-FR') : 'Date inconnue';
  p.innerHTML =
    `<a href="${item.link}" target="_blank" rel="noopener">${item.title}</a>` +
    `<span style="color:#33e6cc;font-size:0.75rem;margin-left:8px;">[${item.source}]</span><br>` +
    `<small style="color:#888;">${date}</small>`;
  return p;
}

function renderRSS(container, items) {
  container.innerHTML = '';
  items.forEach(item => container.appendChild(buildRSSItem(item)));
}

function renderFallback(container) {
  container.innerHTML = '<div class="rss-fallback">⚠️ Flux indisponibles — exemples.</div>';
  RSS_FALLBACK.forEach(item => container.appendChild(buildRSSItem(item)));
}

/* ---- Chargement principal (avec cache stale-while-revalidate) ---- */

async function loadVeilleRSS() {
  const container = document.getElementById('rss-container');
  if (!container || container.dataset.loaded === '1') return;
  container.dataset.loaded = '1';

  const cached = getRSSCache();

  if (cached && cached.length) {
    // Affichage instantané depuis le cache
    renderRSS(container, cached);
    // Rafraîchissement silencieux en arrière-plan
    fetchAllFeeds().then(items => {
      if (items.length) { setRSSCache(items); renderRSS(container, items); }
    });
    return;
  }

  container.innerHTML = '📡 Chargement des actualités...';
  const items = await fetchAllFeeds();
  if (items.length) { setRSSCache(items); renderRSS(container, items); }
  else renderFallback(container);
}

/* ---- Chargement paresseux : déclenché seulement quand #zt-news devient actif ---- */

(function watchVeilleNews() {
  const newsPanel = document.getElementById('zt-news');
  if (!newsPanel) return;

  // Déjà actif au chargement (rare mais possible)
  if (newsPanel.classList.contains('active')) { loadVeilleRSS(); return; }

  const observer = new MutationObserver(() => {
    if (newsPanel.classList.contains('active')) {
      loadVeilleRSS();
      observer.disconnect();
    }
  });
  observer.observe(newsPanel, { attributes: true, attributeFilter: ['class'] });
})();
