/* =====================================================
   main.js — Application entry point.

   Loads every HTML component independently (Promise.allSettled),
   so a single failing fetch never blocks the rest of the page.
   Once components are in the DOM, each feature module is
   initialised in its own try/catch for the same reason: a bug
   in one module (e.g. the game) must not take down navigation,
   language switching or the rest of the page.
===================================================== */

import { initLanguage } from './language.js';
import { initNavigation, initScrollBehavior, closeMenu } from './navigation.js';
import { initProjects, closeModal as closeBlogModal } from './projects.js';
import { initLightbox, initNetworkCanvas } from './ui.js';
import { initCyberveille } from './cyberveille.js';
import { initGame } from './game.js';
import { initDocumentViewer, closeDocViewer } from './documentViewer.js';

/* Component name → DOM mount point id (see index.html). */
const COMPONENTS = [
  ['header',          'header-mount'],
  ['navigation',      'navigation-mount'],
  ['hero',            'hero-mount'],
  ['about',           'about-mount'],
  ['experience',      'experience-mount'],
  ['projects',        'projects-mount'],
  ['certifications',  'certifications-mount'],
  ['veille',          'veille-mount'],
  ['cyberveille',     'cyberveille-mount'],
  ['blogs',           'blogs-mount'],
  ['contact',         'contact-mount'],
  ['game',            'game-mount'],
  ['footer',          'footer-mount'],
  ['modals',          'modals-mount'],
];

async function loadComponent([name, mountId]) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  try {
    const res = await fetch(`components/${name}.html`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    mount.innerHTML = await res.text();
  } catch (err) {
    console.error(`[main] Échec du chargement du composant "${name}":`, err);
    mount.innerHTML = '';
  }
}

function safeInit(label, fn) {
  try { fn(); }
  catch (err) { console.error(`[main] Échec de l'initialisation "${label}":`, err); }
}

function bindEscapeHandler() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeBlogModal();
    closeDocViewer();
    document.getElementById('diff-modal')?.classList.add('hidden');
    closeMenu();
  });
}

/* Background canvas + click delegation work immediately, even
   before components are injected — start them right away so the
   page feels alive as soon as possible. */
safeInit('network-canvas', initNetworkCanvas);
safeInit('navigation-delegation', initNavigation);

async function bootstrap() {
  await Promise.allSettled(COMPONENTS.map(loadComponent));

  safeInit('language', initLanguage);
  safeInit('scroll-behavior', initScrollBehavior);
  safeInit('lightbox', initLightbox);
  safeInit('projects', initProjects);
  safeInit('cyberveille', initCyberveille);
  safeInit('game', initGame);
  safeInit('document-viewer', initDocumentViewer);
  bindEscapeHandler();
}

bootstrap();
