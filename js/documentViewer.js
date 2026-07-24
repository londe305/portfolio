/* =====================================================
   documentViewer.js — Visualiseur PDF en diaporama
   (précédent/suivant, swipe mobile, bouton de téléchargement).

   PDF.js est chargé à la demande depuis un CDN (aucun rendu
   ni traitement ne passe par un service externe : le parsing
   et le rendu des pages se font entièrement dans le navigateur,
   comme pour data/cyber-feed.json en lecture statique).
===================================================== */

const PDFJS_VERSION = '3.11.174';
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;
const SWIPE_THRESHOLD = 48;

/* Un document par sous-partie de projet. `file: null` = pas encore
   disponible — l'entrée s'affiche mais reste désactivée (voir
   components/projects.html et le style `.doc-item.disabled`). */
export const DOCUMENT_SETS = {
  'zero-trust': [
    { id: 'zt-1', file: 'assets/docs/zero-trust/1-preparation-systeme.pdf' },
    { id: 'zt-2', file: null }
  ]
};

let viewerInitialized = false;
let pdfjsLoadPromise = null;
let resizeTimer = null;

const state = {
  pdf: null,
  pageNum: 1,
  pageCount: 0,
  rendering: false,
  pendingPage: null
};

function findDoc(setKey, docId) {
  return (DOCUMENT_SETS[setKey] || []).find(d => d.id === docId);
}

function els() {
  return {
    modal: document.getElementById('docModal'),
    canvas: document.getElementById('doc-canvas'),
    canvasWrap: document.getElementById('doc-canvas-wrap'),
    title: document.getElementById('doc-title'),
    pageCur: document.getElementById('doc-page-cur'),
    pageTotal: document.getElementById('doc-page-total'),
    status: document.getElementById('doc-status'),
    download: document.getElementById('doc-download'),
    prev: document.getElementById('doc-prev'),
    next: document.getElementById('doc-next')
  };
}

function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (pdfjsLoadPromise) return pdfjsLoadPromise;
  pdfjsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${PDFJS_BASE}/pdf.min.js`;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.js`;
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error('PDF.js indisponible (CDN injoignable)'));
    document.head.appendChild(script);
  });
  return pdfjsLoadPromise;
}

function setStatus(text) {
  const { status } = els();
  if (status) status.textContent = text || '';
}

function updateHUD() {
  const { pageCur, pageTotal, prev, next } = els();
  if (pageCur) pageCur.textContent = state.pageNum;
  if (pageTotal) pageTotal.textContent = state.pageCount;
  if (prev) prev.disabled = state.pageNum <= 1;
  if (next) next.disabled = state.pageNum >= state.pageCount;
}

function renderPage(num) {
  const { canvas, canvasWrap } = els();
  if (!canvas || !state.pdf) return;
  if (state.rendering) { state.pendingPage = num; return; }
  state.rendering = true;
  setStatus('…');

  state.pdf.getPage(num).then(page => {
    const ctx = canvas.getContext('2d');
    const baseViewport = page.getViewport({ scale: 1 });
    const targetWidth = (canvasWrap?.clientWidth || baseViewport.width) - 16;
    const scale = Math.max(0.4, Math.min(2.2, targetWidth / baseViewport.width));
    const viewport = page.getViewport({ scale });
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    return page.render({
      canvasContext: ctx,
      viewport,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined
    }).promise;
  }).then(() => {
    state.rendering = false;
    setStatus('');
    updateHUD();
    if (state.pendingPage !== null) {
      const next = state.pendingPage;
      state.pendingPage = null;
      renderPage(next);
    }
  }).catch(err => {
    state.rendering = false;
    console.error('[documentViewer] Échec du rendu de page:', err);
    setStatus('⚠️');
  });
}

function goTo(num) {
  if (!state.pdf) return;
  const clamped = Math.max(1, Math.min(state.pageCount, num));
  if (clamped === state.pageNum) return;
  state.pageNum = clamped;
  renderPage(clamped);
  updateHUD();
}

export function closeDocViewer() {
  const { modal } = els();
  if (!modal) return;
  modal.classList.remove('open');
  document.body.classList.remove('modal-open');
  state.pdf = null;
  state.pageNum = 1;
  state.pageCount = 0;
}

export async function openDocument(setKey, docId, label) {
  const doc = findDoc(setKey, docId);
  if (!doc || !doc.file) return;

  const { modal, title, download, canvas } = els();
  if (!modal) return;

  if (title) title.textContent = label || '';
  if (download) {
    download.href = doc.file;
    download.download = doc.file.split('/').pop();
  }
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

  modal.classList.add('open');
  document.body.classList.add('modal-open');
  setStatus('…');

  try {
    const pdfjsLib = await loadPdfJs();
    const pdf = await pdfjsLib.getDocument(doc.file).promise;
    state.pdf = pdf;
    state.pageCount = pdf.numPages;
    state.pageNum = 1;
    updateHUD();
    renderPage(1);
  } catch (err) {
    console.error('[documentViewer] Échec du chargement du PDF:', err);
    setStatus('⚠️');
  }
}

function handleDelegatedClick(e) {
  const opener = e.target.closest('[data-doc-set][data-doc-id]');
  if (opener) {
    const label = opener.querySelector('.doc-item-title');
    openDocument(opener.dataset.docSet, opener.dataset.docId, label ? label.textContent : '');
    return;
  }
  if (e.target.closest('[data-action="close-doc"]')) { closeDocViewer(); return; }
  if (e.target.closest('[data-action="doc-prev"]')) { goTo(state.pageNum - 1); return; }
  if (e.target.closest('[data-action="doc-next"]')) { goTo(state.pageNum + 1); return; }
  if (e.target.id === 'docModal') { closeDocViewer(); }
}

function bindSwipe(canvasWrap) {
  let startX = null;
  canvasWrap.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });
  canvasWrap.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx < 0) goTo(state.pageNum + 1);
    else goTo(state.pageNum - 1);
  }, { passive: true });
}

export function initDocumentViewer() {
  if (viewerInitialized) return;
  viewerInitialized = true;

  document.addEventListener('click', handleDelegatedClick);

  const { canvasWrap } = els();
  if (canvasWrap) bindSwipe(canvasWrap);

  window.addEventListener('keydown', e => {
    const { modal } = els();
    if (!modal || !modal.classList.contains('open')) return;
    if (e.key === 'ArrowRight') goTo(state.pageNum + 1);
    if (e.key === 'ArrowLeft') goTo(state.pageNum - 1);
  });

  window.addEventListener('resize', () => {
    if (!state.pdf) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => renderPage(state.pageNum), 200);
  });
}
