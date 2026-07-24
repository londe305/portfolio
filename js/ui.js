/* =====================================================
   ui.js — Interactions UI : lightbox et le fond animé
   (équipements réseau).
===================================================== */

import { $, $$ } from './utils.js';

/* ---- Lightbox visionneuse d'images ---- */

export function initLightbox() {
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
}

/* ---- Fond animé : circuit imprimé (canvas) ---- */

export function initNetworkCanvas() {
  const cv = document.getElementById('bg-canvas');
  if (!cv) return;
  const c = cv.getContext('2d');

  const TEAL = '0,245,212';
  const PURPLE = '123,97,255';
  const CELL = 34;

  let W, H, raf, lastTs = 0, traces = [], pulses = [], pulseTimer = 0;

  function traceCount() {
    return Math.max(14, Math.min(60, Math.floor((W * H) / 26000)));
  }

  function snap(v) { return Math.round(v / CELL) * CELL; }

  function build() {
    traces = [];
    const n = traceCount();
    for (let i = 0; i < n; i++) {
      const x1 = snap(Math.random() * W);
      const y1 = snap(Math.random() * H);
      const cx = Math.floor(Math.random() * 7) - 3; // -3..3 cellules
      const cy = Math.floor(Math.random() * 7) - 3;
      if (cx === 0 && cy === 0) continue;
      const x2 = Math.min(W, Math.max(0, x1 + cx * CELL));
      const y2 = Math.min(H, Math.max(0, y1 + cy * CELL));
      const bend = Math.random() < 0.5 ? { x: x2, y: y1 } : { x: x1, y: y2 };
      const p0 = { x: x1, y: y1 }, p1 = bend, p2 = { x: x2, y: y2 };
      const l1 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const l2 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      if (l1 + l2 < 8) continue;
      traces.push({ p0, p1, p2, l1, l2, total: l1 + l2, col: Math.random() < 0.18 ? PURPLE : TEAL });
    }
    pulses = [];
    pulseTimer = 0;
  }

  function pointAt(tr, dist) {
    if (dist <= tr.l1) {
      const f = tr.l1 === 0 ? 0 : dist / tr.l1;
      return { x: tr.p0.x + (tr.p1.x - tr.p0.x) * f, y: tr.p0.y + (tr.p1.y - tr.p0.y) * f };
    }
    const f = tr.l2 === 0 ? 0 : (dist - tr.l1) / tr.l2;
    return { x: tr.p1.x + (tr.p2.x - tr.p1.x) * f, y: tr.p1.y + (tr.p2.y - tr.p1.y) * f };
  }

  function step(dt) {
    pulseTimer -= dt;
    if (pulseTimer <= 0 && traces.length) {
      pulseTimer = 0.1 + Math.random() * 0.15;
      const idx = Math.floor(Math.random() * traces.length);
      pulses.push({ idx, t: 0, spd: 0.35 + Math.random() * 0.3, col: traces[idx].col });
    }
    pulses = pulses.filter(p => (p.t += p.spd * dt) < 1);
  }

  function render() {
    c.fillStyle = '#080c14';
    c.fillRect(0, 0, W, H);

    c.lineWidth = 1.2;
    traces.forEach(tr => {
      c.strokeStyle = `rgba(${tr.col},.16)`;
      c.beginPath();
      c.moveTo(tr.p0.x, tr.p0.y);
      c.lineTo(tr.p1.x, tr.p1.y);
      c.lineTo(tr.p2.x, tr.p2.y);
      c.stroke();
      c.fillStyle = `rgba(${tr.col},.35)`;
      [tr.p0, tr.p2].forEach(p => {
        c.beginPath(); c.arc(p.x, p.y, 2, 0, Math.PI * 2); c.fill();
      });
    });

    pulses.forEach(p => {
      const tr = traces[p.idx];
      if (!tr) return;
      const pos = pointAt(tr, p.t * tr.total);
      c.save();
      c.globalAlpha = 1 - Math.abs(p.t - 0.5) * 0.6;
      c.shadowBlur = 8; c.shadowColor = `rgb(${p.col})`;
      c.fillStyle = `rgb(${p.col})`;
      c.beginPath(); c.arc(pos.x, pos.y, 2.2, 0, Math.PI * 2); c.fill();
      c.restore();
    });
  }

  function loop(ts) {
    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
    lastTs = ts;
    step(dt);
    render();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(raf);
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
    build();
    lastTs = performance.now();
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', start);
  start();
}
