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

async function fetchRSSFeed(url) {
  // Tentative 1 : API rss2json (plus fiable)
  try {
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=6`,
      { cache: 'no-cache' }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items)) {
        return {
          items: data.items.map(item => ({
            title:   item.title || 'Sans titre',
            link:    item.link || item.guid || '#',
            pubDate: item.pubDate || '',
            source:  item.source?.name || ''
          }))
        };
      }
    }
  } catch (e) {
    console.debug('rss2json indisponible:', e);
  }

  // Tentative 2 : proxy allorigins + parsing XML manuel
  try {
    const proxyRes = await fetch(
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      { cache: 'no-cache' }
    );
    if (!proxyRes.ok) return { items: [] };

    const xml = new DOMParser().parseFromString(await proxyRes.text(), 'text/xml');
    if (xml.querySelector('parsererror')) return { items: [] };

    const items = Array.from(xml.querySelectorAll('item,entry')).slice(0, 6).map(entry => {
      const title    = entry.querySelector('title')?.textContent?.trim() || 'Sans titre';
      const linkNode = entry.querySelector('link');
      const altLink  = entry.querySelector('link[rel="alternate"]');
      const link     =
        linkNode?.textContent?.trim() ||
        linkNode?.getAttribute('href')?.trim() ||
        altLink?.getAttribute('href')?.trim() || '#';
      const pubDate  =
        entry.querySelector('pubDate')?.textContent?.trim() ||
        entry.querySelector('published')?.textContent?.trim() ||
        entry.querySelector('updated')?.textContent?.trim() || '';
      return { title, link, pubDate, source: '' };
    });

    return { items };
  } catch (e) {
    console.debug('proxy fallback échoué:', e);
    return { items: [] };
  }
}

async function loadVeilleRSS() {
  const container = document.getElementById('rss-container');
  if (!container) return;

  container.innerHTML = '📡 Chargement des actualités importantes...';

  const feeds = [
    { url: 'https://feeds.feedburner.com/TheHackersNews', name: 'Hacker News' },
    { url: 'https://krebsonsecurity.com/feed/',           name: 'Krebs'        },
    { url: 'https://arstechnica.com/security/feed/',      name: 'Ars Tech'     }
  ];

  const results = await Promise.all(
    feeds.map(feed =>
      fetchRSSFeed(feed.url)
        .then(data => ({ feed, items: data.items || [] }))
        .catch(()  => ({ feed, items: [] }))
    )
  );

  const allItems = results.flatMap(r =>
    r.items.map(item => ({ ...item, source: r.feed.name }))
  );

  // Fallback si tous les flux sont indisponibles
  if (!allItems.length) {
    const sample = [
      { title: 'Analyse : nouvelle vulnérabilité critique (exemple)', link: '#', pubDate: new Date().toISOString(), source: 'Exemple' },
      { title: 'Tutoriel : durcir une connexion SSH',                 link: '#', pubDate: new Date().toISOString(), source: 'Exemple' },
      { title: 'Outil recommandé : surveillance & alerting',          link: '#', pubDate: new Date().toISOString(), source: 'Exemple' }
    ];
    container.innerHTML = '<div class="rss-fallback">⚠️ Flux externes indisponibles — affichage d\'exemples.</div>';
    sample.forEach(item => container.appendChild(buildRSSItem(item)));
    return;
  }

  allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  container.innerHTML = '';
  allItems.slice(0, 18).forEach(item => container.appendChild(buildRSSItem(item)));
}

function buildRSSItem(item) {
  const p    = document.createElement('p');
  const date = item.pubDate ? new Date(item.pubDate).toLocaleDateString('fr-FR') : 'Date indisponible';
  p.innerHTML =
    `<a href="${item.link}" target="_blank" rel="noopener">${item.title}</a>` +
    `<span style="color:#33e6cc;font-size:0.75rem;margin-left:8px;">[${item.source}]</span><br>` +
    `<small style="color:#888;">${date}</small>`;
  return p;
}

loadVeilleRSS();
