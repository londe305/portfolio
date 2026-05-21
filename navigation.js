/* =====================================================
   navigation.js — Navigation sections + sidebar
   Dépendances : tabs.js (activateSubtabGroup)
   Requis par  : tous les autres modules (goTo, syncSidebarTree)
===================================================== */

// Helpers raccourcis globaux (disponibles pour tous les fichiers suivants)
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---- Arbre sidebar ---- */

function setTreeOpen(parentLi, open) {
  const ul = parentLi.querySelector('.tree-children');
  if (!ul) return;
  ul.style.willChange = 'max-height';
  ul.style.overflow   = 'hidden';
  if (open) {
    parentLi.classList.add('open');
    parentLi.setAttribute('aria-expanded', 'true');
    ul.style.maxHeight = ul.scrollHeight + 'px';
  } else {
    parentLi.classList.remove('open');
    parentLi.setAttribute('aria-expanded', 'false');
    ul.style.maxHeight = '0px';
  }
  setTimeout(() => { ul.style.willChange = 'auto'; }, 300);
}

function syncSidebarTree(sectionId, subId) {
  const group = document.querySelector(`.sidebar li.has-children[data-section="${sectionId}"]`);
  if (group) setTreeOpen(group, true);

  $$('.tree-item').forEach(x => x.classList.remove('active'));
  if (subId) {
    document.querySelector(`.tree-item[data-section="${sectionId}"][data-sub="${subId}"]`)
      ?.classList.add('active');
  }

  $$('.sidebar li').forEach(i => i.classList.remove('active'));
  if (group) group.classList.add('active');
  else document.querySelector(`.sidebar li[data-section="${sectionId}"]`)?.classList.add('active');
}

/* ---- Navigation principale ---- */

function goTo(sectionId, subId = null) {
  // Afficher la section demandée
  $$('.section').forEach(s => s.classList.remove('active'));
  const sectionEl = document.getElementById(sectionId);
  if (!sectionEl) return;
  sectionEl.classList.add('active');

  // Pause/resume du jeu Dino si présent
  if (typeof dinoGame !== 'undefined') {
    if (sectionId === 'jeu') dinoGame.resume();
    else dinoGame.pause();
  }

  // Activation des sous-onglets de la section
  let resolvedSub = null;
  const groups = Array.from(sectionEl.querySelectorAll('.subtabs'));

  if (subId) {
    for (const g of groups) {
      const ok = activateSubtabGroup(g, subId);
      if (ok) { resolvedSub = subId; break; }
    }
    if (!resolvedSub) groups.forEach(g => activateSubtabGroup(g, null));
  } else {
    groups.forEach(g => {
      activateSubtabGroup(g, null);
      if (!resolvedSub) resolvedSub = g.dataset.activeSub || null;
    });
    subId = resolvedSub;
  }

  // Synchronisation visuelle de la sidebar
  syncSidebarTree(sectionId, subId);

  // 📱 Fermeture automatique du menu burger sur mobile/tablette
  if (window.innerWidth <= 768) {
    document.querySelector('.sidebar')?.classList.remove('open');
    document.querySelector('.mobile-overlay')?.classList.remove('active');
  }

  // Fond dynamique (supprime toutes les classes bg-* existantes)
  document.body.className = document.body.className
    .split(' ')
    .filter(c => !c.startsWith('bg-'))
    .join(' ');
  document.body.classList.add('bg-' + sectionId);
}

/* ---- Sidebar + Burger mobile ---- */

function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // Groupes fermés au démarrage
  sidebar.querySelectorAll('li.has-children').forEach(parent => {
    const children = parent.querySelector('.tree-children');
    if (children) {
      children.style.maxHeight = '0px';
      parent.setAttribute('aria-expanded', 'false');
      parent.classList.remove('open');
    }
  });

  // Un seul listener délégué pour toute la sidebar
  sidebar.addEventListener('click', (e) => {
    // Clic sur la flèche déroulante
    const caret = e.target.closest('.caret');
    if (caret) {
      const parent = caret.closest('li.has-children');
      if (parent) setTreeOpen(parent, !parent.classList.contains('open'));
      return;
    }

    const li = e.target.closest('li');
    if (!li || !sidebar.contains(li)) return;

    const sectionId = li.getAttribute('data-section');
    if (!sectionId) return;

    // Ouvrir le groupe si cliqué et fermé
    if (li.classList.contains('has-children') && !li.classList.contains('open')) {
      setTreeOpen(li, true);
    }

    goTo(sectionId, li.getAttribute('data-sub') || null);
  });

  // 📱 Burger menu
  const burger  = document.querySelector('.burger-btn');
  const overlay = document.querySelector('.mobile-overlay');

  burger?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay?.classList.toggle('active');
  });

  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay?.classList.remove('active');
  });
}

/* ---- Init au chargement ---- */

initSidebar();

const _initSection = document.querySelector('.section.active')?.id || 'home';
document.body.classList.add('bg-' + _initSection);
goTo(_initSection);
