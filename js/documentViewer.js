/* =====================================================
   documentViewer.js — Visualiseur PDF en diaporama
   (précédent/suivant, swipe mobile, bouton de téléchargement).

   PDF.js est chargé à la demande depuis un CDN (aucun rendu
   ni traitement ne passe par un service externe : le parsing
   et le rendu des pages se font entièrement dans le navigateur,
   comme pour data/cyber-feed.json en lecture statique).
===================================================== */

import { syncModalBodyState } from './utils.js';

const PDFJS_VERSION = '3.11.174';
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;
/* Intégrité du script principal, vérifiée par le navigateur avant exécution
   (défense en profondeur si le CDN venait à être compromis). Le worker
   (pdf.worker.min.js) est chargé via `new Worker(url)` par pdf.js lui-même :
   l'API Worker ne supporte pas encore l'attribut integrity, donc seul le
   script principal peut être protégé ainsi. */
const PDFJS_SRI = 'sha384-/1qUCSGwTur9vjf/z9lmu/eCUYbpOTgSjmpbMQZ1/CtX2v/WcAIKqRv+U1DUCG6e';
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
let viewerOpener = null;

const state = {
  pdf: null,
  pageNum: 1,
  pageCount: 0,
  rendering: false,
  pendingPage: null,
  requestId: 0,
  loadingTask: null
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
    script.integrity = PDFJS_SRI;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.js`;
      resolve(window.pdfjsLib);
    };
    script.onerror = () => {
      pdfjsLoadPromise = null;
      reject(new Error('PDF.js indisponible (CDN injoignable)'));
    };
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

function renderPage(num, requestId = state.requestId) {
  const { canvas, canvasWrap } = els();
  if (!canvas || !state.pdf || requestId !== state.requestId) return;
  if (state.rendering) { state.pendingPage = num; return; }
  const pdf = state.pdf;
  state.rendering = true;
  setStatus('…');

  pdf.getPage(num).then(page => {
    if (requestId !== state.requestId || pdf !== state.pdf) return null;
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
    if (requestId !== state.requestId || pdf !== state.pdf) return;
    state.rendering = false;
    setStatus('');
    updateHUD();
    if (state.pendingPage !== null) {
      const next = state.pendingPage;
      state.pendingPage = null;
      renderPage(next, requestId);
    }
  }).catch(err => {
    if (requestId !== state.requestId) return;
    state.rendering = false;
    console.error('[documentViewer] Échec du rendu de page:', err);
    setStatus('Impossible de charger ce document. Réessayez plus tard ou téléchargez le PDF.');
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
  state.requestId += 1;
  state.loadingTask?.destroy?.();
  state.loadingTask = null;
  state.pdf?.destroy?.();
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  syncModalBodyState();
  state.pdf = null;
  state.pageNum = 1;
  state.pageCount = 0;
  state.rendering = false;
  state.pendingPage = null;
  if (viewerOpener?.isConnected) viewerOpener.focus();
  viewerOpener = null;
}

export async function openDocument(setKey, docId, label, opener = document.activeElement) {
  const doc = findDoc(setKey, docId);
  if (!doc || !doc.file) return;

  const { modal, title, download, canvas } = els();
  if (!modal) return;

  state.requestId += 1;
  const requestId = state.requestId;
  state.loadingTask?.destroy?.();
  state.pdf?.destroy?.();
  state.pdf = null;
  viewerOpener = opener;

  if (title) title.textContent = label || '';
  if (download) {
    download.href = doc.file;
    download.download = doc.file.split('/').pop();
  }
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  syncModalBodyState();
  setStatus('…');
  modal.querySelector('[data-action="close-doc"]')?.focus();

  try {
    const pdfjsLib = await loadPdfJs();
    if (requestId !== state.requestId) return;
    const loadingTask = pdfjsLib.getDocument(doc.file);
    state.loadingTask = loadingTask;
    const pdf = await loadingTask.promise;
    if (requestId !== state.requestId) { pdf.destroy?.(); return; }
    state.loadingTask = null;
    state.pdf = pdf;
    state.pageCount = pdf.numPages;
    state.pageNum = 1;
    updateHUD();
    renderPage(1, requestId);
  } catch (err) {
    if (requestId !== state.requestId || err?.name === 'AbortException') return;
    console.error('[documentViewer] Échec du chargement du PDF:', err);
    setStatus('⚠️');
  }
}

function handleDelegatedClick(e) {
  const opener = e.target.closest('[data-doc-set][data-doc-id]');
  if (opener) {
    const label = opener.querySelector('.doc-item-title');
    openDocument(opener.dataset.docSet, opener.dataset.docId, label ? label.textContent : '', opener);
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
