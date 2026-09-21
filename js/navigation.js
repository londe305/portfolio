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
  $$(`[id^="${pPrefix}"]`).filter(p => p.classList.contains('tab-panel') || p.classList.contains('inner-tab-panel'))
    .forEach(p => { p.classList.remove('active'); p.hidden = true; });
  $$(`[id^="${bPrefix}"]`).forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); b.tabIndex = -1; });
  const panel = document.getElementById(pPrefix + id);
  const btn   = document.getElementById(bPrefix + id);
  if (panel) { panel.classList.add('active'); panel.hidden = false; }
  if (btn)   { btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); btn.tabIndex = 0; }
}

/* ---- Veille tabs are scoped to #veille ---- */
function activateVeille(btn, panelId) {
  $$('#veille .tab-panel').forEach(p => { p.classList.remove('active'); p.hidden = true; });
  $$('#veille .tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); b.tabIndex = -1; });
  const panel = document.getElementById(panelId);
  if (panel) { panel.classList.add('active'); panel.hidden = false; }
  if (btn)   { btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); btn.tabIndex = 0; }
}

function initTabAccessibility() {
  const groups = new Set($$('[data-tab-group]').map(btn => btn.dataset.tabGroup));
  groups.forEach(group => {
    const buttons = $$(`[data-tab-group="${group}"]`);
    const panelPrefix = `${group}-`;
    buttons[0]?.parentElement?.setAttribute('role', 'tablist');
    buttons.forEach(btn => {
      const panel = document.getElementById(panelPrefix + btn.dataset.tabId);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(btn.classList.contains('active')));
      btn.tabIndex = btn.classList.contains('active') ? 0 : -1;
      if (!panel) return;
      btn.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', btn.id);
      panel.hidden = !panel.classList.contains('active');
    });
  });

  const veilleButtons = $$('[data-veille-panel]');
  veilleButtons[0]?.parentElement?.setAttribute('role', 'tablist');
  veilleButtons.forEach(btn => {
    const panel = document.getElementById(btn.dataset.veillePanel);
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(btn.classList.contains('active')));
    btn.tabIndex = btn.classList.contains('active') ? 0 : -1;
    if (!panel) return;
    btn.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', btn.id);
    panel.hidden = !panel.classList.contains('active');
  });
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

function handleTabKeydown(e) {
  const current = e.target.closest('[data-tab-group], [data-veille-panel]');
  if (!current || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  const selector = current.dataset.tabGroup
    ? `[data-tab-group="${current.dataset.tabGroup}"]`
    : '[data-veille-panel]';
  const tabs = $$(selector);
  const index = tabs.indexOf(current);
  if (index < 0) return;
  e.preventDefault();
  const nextIndex = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1
    : (index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  tabs[nextIndex].focus();
  tabs[nextIndex].click();
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
  document.addEventListener('keydown', handleTabKeydown);
}

/* Scroll-spy and reveal-on-scroll need the actual section/.reveal
   elements to exist, so this is called only after all components
   have finished loading (see main.js). */
export function initScrollBehavior() {
  initTabAccessibility();
  initScrollSpy();
  initReveal();
}
