/* =====================================================
   navigation.js — Navbar, mobile menu, tab switching,
   scroll-spy and reveal-on-scroll.

   All interactions are wired through a single delegated
   click listener on `document`, so it works regardless of
   whether the target markup was already in the page or was
   injected later by the component loader (main.js).
===================================================== */

import { $, $$ } from './utils.js';

let scrollSpyObserver = null;
let revealObserver = null;

export function navTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  if (!menu) return;
  const open = menu.classList.toggle('open');
  document.body.classList.toggle('menu-open', open);
  document.querySelector('[data-action="toggle-menu"]')?.setAttribute('aria-expanded', String(open));
}

export function closeMenu() {
  document.getElementById('mobileMenu')?.classList.remove('open');
  document.body.classList.remove('menu-open');
  document.querySelector('[data-action="toggle-menu"]')?.setAttribute('aria-expanded', 'false');
}

/* ---- Generic tab switcher: <prefix>-<id> panel + <prefix>-tab-<id> button ---- */
function switchTabs(pPrefix, bPrefix, id) {
  $$(`[id^="${pPrefix}"]`).forEach(p => p.classList.remove('active'));
  $$(`[id^="${bPrefix}"]`).forEach(b => b.classList.remove('active'));
  const panel = document.getElementById(pPrefix + id);
  const btn   = document.getElementById(bPrefix + id);
  if (panel) panel.classList.add('active');
  if (btn)   btn.classList.add('active');
}

/* ---- Veille tabs are scoped to #veille ---- */
function activateVeille(btn, panelId) {
  $$('#veille .tab-panel').forEach(p => p.classList.remove('active'));
  $$('#veille .tab-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
  if (btn)   btn.classList.add('active');
}

function handleDelegatedClick(e) {
  const navBtn = e.target.closest('[data-nav]');
  if (navBtn) { navTo(navBtn.dataset.nav); closeMenu(); return; }

  const menuToggle = e.target.closest('[data-action="toggle-menu"]');
  if (menuToggle) { toggleMenu(); return; }

  const tabBtn = e.target.closest('[data-tab-group]');
  if (tabBtn) {
    const group = tabBtn.dataset.tabGroup;
    switchTabs(`${group}-`, `${group}-tab-`, tabBtn.dataset.tabId);
    return;
  }

  const veilleBtn = e.target.closest('[data-veille-panel]');
  if (veilleBtn) {
    activateVeille(veilleBtn, veilleBtn.dataset.veillePanel);
    return;
  }

  /* Tap outside the open mobile menu (and outside the hamburger) closes it. */
  const menu = document.getElementById('mobileMenu');
  if (menu?.classList.contains('open') && !e.target.closest('#mobileMenu') && !e.target.closest('[data-action="toggle-menu"]')) {
    closeMenu();
  }
}

/* ---- Scroll-spy: highlight the active nav link ---- */
function initScrollSpy() {
  if (typeof IntersectionObserver === 'undefined') return;
  scrollSpyObserver?.disconnect();

  const sectionIds = ['home', 'apropos', 'alternance', 'projets', 'certifications', 'veille', 'cyberveille', 'blogs', 'contact', 'jeu'];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        $$('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector(`.nav-link[data-section="${id}"]`)?.classList.add('active');
      }
    });
  }, { threshold: .2, rootMargin: '-80px 0px -60% 0px' });
  scrollSpyObserver = spy;

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  });
}

/* ---- Reveal-on-scroll + animated skill bars ---- */
function initReveal() {
  if (typeof IntersectionObserver === 'undefined') return;
  revealObserver?.disconnect();

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: .12 });
  revealObserver = io;
  $$('.reveal').forEach(el => io.observe(el));

  const io2 = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.style.width = e.target.dataset.w + '%'; io2.unobserve(e.target); }
    });
  }, { threshold: .1 });
  $$('.sk-fill[data-w]').forEach(el => io2.observe(el));
}

/* Click delegation can be attached immediately: it works on
   elements that don't exist yet, since events bubble up to
   `document` regardless of when their target was injected. */
export function initNavigation() {
  document.addEventListener('click', handleDelegatedClick);
}

/* Scroll-spy and reveal-on-scroll need the actual section/.reveal
   elements to exist, so this is called only after all components
   have finished loading (see main.js). */
export function initScrollBehavior() {
  initScrollSpy();
  initReveal();
}
