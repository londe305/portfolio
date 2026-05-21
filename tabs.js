/* =====================================================
   tabs.js — Gestion des sous-onglets (subtabs)
   Dépendances : aucune (chargé en premier)
   Requis par  : navigation.js (appelle activateSubtabGroup)
===================================================== */

function activateSubtabGroup(subtabsEl, subId) {
  if (!subtabsEl) return false;
  const panelsContainer = subtabsEl.nextElementSibling;
  if (!panelsContainer || !panelsContainer.classList.contains('subpanels')) return false;

  const esc = (s) => (window.CSS && CSS.escape) ? CSS.escape(s) : s;
  const tabs   = Array.from(subtabsEl.querySelectorAll('li'));
  const panels = Array.from(panelsContainer.querySelectorAll('.subpanel'));

  tabs.forEach(t   => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
  panels.forEach(p => p.classList.remove('active'));

  if (!subId) subId = subtabsEl.dataset.activeSub || tabs[0]?.getAttribute('data-sub') || null;
  if (!subId) return false;

  const tab   = subtabsEl.querySelector(`li[data-sub="${esc(subId)}"]`);
  const panel = panelsContainer.querySelector(`#${esc(subId)}`);
  if (tab)   { tab.classList.add('active');   tab.setAttribute('aria-selected', 'true'); }
  if (panel) panel.classList.add('active');

  subtabsEl.dataset.activeSub = subId;
  return true;
}

function initSubtabs(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  section.querySelectorAll('.subtabs').forEach(subtabs => {
    const panelsContainer = subtabs.nextElementSibling;
    if (!panelsContainer || !panelsContainer.classList.contains('subpanels')) return;

    // Accessibilité ARIA
    subtabs.setAttribute('role', 'tablist');
    subtabs.querySelectorAll('li').forEach(li => {
      li.setAttribute('role', 'tab');
      li.setAttribute('aria-selected', li.classList.contains('active') ? 'true' : 'false');
      const sub = li.getAttribute('data-sub');
      if (sub) li.setAttribute('aria-controls', sub);
    });

    // Délégation de clic (1 seul listener par groupe)
    subtabs.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li || !subtabs.contains(li)) return;
      const sub = li.getAttribute('data-sub');
      if (!sub) return;
      const ok = activateSubtabGroup(subtabs, sub);
      // Sync sidebar si disponible
      if (ok && section.id && typeof syncSidebarTree === 'function') {
        syncSidebarTree(section.id, sub);
      }
    });

    // Activation initiale
    const stored  = subtabs.dataset.activeSub;
    const initial = stored
      || subtabs.querySelector('li.active')?.getAttribute('data-sub')
      || subtabs.querySelector('li')?.getAttribute('data-sub');
    if (initial) activateSubtabGroup(subtabs, initial);
  });
}

// Initialisation de toutes les sections à sous-onglets
['alternance', 'certifications', 'projets', 'veille'].forEach(initSubtabs);
