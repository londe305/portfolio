/* =====================================================
   projects.js — Project/Crystal/Zero-Trust tab content
   and the Blogs grid + article modal.
===================================================== */

export const BLOGS = [
  { id: 1, emoji: '🔒', title: 'Zero Trust : ne jamais faire confiance, toujours vérifier', desc: 'Exploration du modèle Zero Trust Security : principes fondamentaux, comparaison avec le périmètre réseau traditionnel, et mise en pratique dans un lab ASA.', tags: ['Zero Trust', 'Cybersécurité', 'Réseau'], date: '2025-04-10', time: '8 min', body: `<h3>Introduction</h3>
<p>Le Zero Trust est une philosophie fondée sur <em>"Ne jamais faire confiance, toujours vérifier"</em>. Contrairement aux approches basées sur un périmètre de confiance, chaque requête est traitée comme potentiellement hostile.</p>
<h3>Principes clés</h3>
<ul>
<li><strong>Vérification systématique</strong> : authentification de chaque requête, même interne.</li>
<li><strong>Moindre privilège</strong> : accès minimal nécessaire.</li>
<li><strong>Micro-segmentation</strong> : isolation des zones réseau.</li>
<li><strong>Assume breach</strong> : supposer la compromission.</li>
</ul>
<h3>Mise en pratique</h3>
<p>Dans mon lab avec un ASA 5505, j'ai implémenté des ACL strictes "deny any any" par défaut, avec uniquement les flux nécessaires autorisés. La PS3 sur le VLAN 40 est totalement isolée — parfait exemple de micro-segmentation.</p>
<h3>Résultats</h3>
<p>Surface d'attaque drastiquement réduite. Chaque flux non autorisé génère un log dans Zabbix, permettant une réponse rapide aux incidents.</p>` },
  { id: 2, emoji: '🛠️', title: 'Crystal Network Refresh : migration SD-WAN en production', desc: 'Retour d\'expérience sur la migration du réseau Crystal vers une architecture SD-WAN v2 Fortinet, avec gestion ITIL et stratégie de rollback.', tags: ['SD-WAN', 'Fortinet', 'ITIL', 'Migration'], date: '2025-05-20', time: '10 min', body: `<h3>Contexte du projet</h3>
<p>Le siège Crystal avait une infrastructure réseau vieillissante. La mission : migrer vers une architecture SD-WAN v2 avec des Fortigate 200G, remplacer 53 switches et déployer 80 bornes WiFi.</p>
<h3>Défis rencontrés</h3>
<ul>
<li>Contraintes physiques en baie (espace, câblage)</li>
<li>Liaisons opérateurs non disponibles au démarrage</li>
<li>Dépendances externes nombreuses (serveurs, vidéo)</li>
<li>Pression sur la continuité de service</li>
</ul>
<h3>Approche ITIL</h3>
<p>Chaque intervention a fait l'objet d'un Change Request validé en CAB. Une stratégie de rollback était systématiquement préparée avant toute intervention en production.</p>
<h3>Lessons learned</h3>
<p>La préparation en staging est cruciale. Les tests en lab avant migration évitent 80% des surprises. La documentation en temps réel (runbooks) permet un rollback efficace si nécessaire.</p>` },
  { id: 3, emoji: '📡', title: 'Supervision réseau avec Zabbix : retour d\'expérience', desc: 'Comment Zabbix m\'a permis de gagner une visibilité complète sur mon infrastructure lab : SNMP, dashboards, alertes et détection d\'anomalies.', tags: ['Zabbix', 'Supervision', 'SNMP', 'Monitoring'], date: '2025-06-01', time: '7 min', body: `<h3>Pourquoi Zabbix ?</h3>
<p>Pour mon lab Zero Trust, j'avais besoin d'une solution de supervision open-source, puissante et flexible. Zabbix s'est imposé : support SNMP natif, alertes configurables et dashboards complets.</p>
<h3>Configuration SNMP</h3>
<ul>
<li>SNMP v2c sur switch Cisco et routeur</li>
<li>SNMP v3 sur l'ASA 5505 pour la sécurité</li>
<li>Community strings isolées par VLAN</li>
<li>Polling toutes les 60 secondes</li>
</ul>
<h3>Dashboards</h3>
<p>Dashboard principal : état des interfaces, trafic par VLAN, taux de refus ACL du firewall, graphiques de bande passante — le tout en temps réel.</p>
<h3>Alertes &amp; incidents</h3>
<p>Zabbix a détecté plusieurs anomalies : scans réseau depuis le VLAN Users, tentatives SSH non autorisées, et une interface tombée à cause d'un câble mal branché. Alerté en moins de 60 secondes.</p>` }
];

function setBodyScroll(locked) {
  document.body.style.overflow = locked ? 'hidden' : '';
}

export function renderBlogs() {
  const grid = document.getElementById('blogsGrid');
  if (!grid) return;
  grid.innerHTML = BLOGS.map(b => `
    <div class="b-card" data-blog-id="${b.id}">
      <div class="b-emoji">${b.emoji}</div>
      <div class="b-title">${b.title}</div>
      <div class="b-desc">${b.desc}</div>
      <div class="b-tags">${b.tags.map(t => `<span class="b-tag">${t}</span>`).join('')}</div>
      <div class="b-meta">📅 ${b.date} · ⏱️ ${b.time}</div>
    </div>`).join('');
}

export function openModal(id) {
  const blog = BLOGS.find(x => x.id === id);
  const modal = document.getElementById('blogModal');
  const emojiEl = document.getElementById('mEmoji');
  const titleEl = document.getElementById('mTitle');
  const metaEl = document.getElementById('mMeta');
  const bodyEl = document.getElementById('mBody');

  if (!blog || !modal || !emojiEl || !titleEl || !metaEl || !bodyEl) return;

  emojiEl.textContent = blog.emoji;
  titleEl.textContent = blog.title;
  metaEl.textContent = `${blog.date} · ${blog.time} · ${blog.tags.join(', ')}`;
  bodyEl.innerHTML = blog.body;
  modal.classList.add('open');
  setBodyScroll(true);
}

export function closeModal() {
  const modal = document.getElementById('blogModal');
  if (modal) modal.classList.remove('open');
  setBodyScroll(false);
}

function handleDelegatedClick(e) {
  const card = e.target.closest('[data-blog-id]');
  if (card) { openModal(Number(card.dataset.blogId)); return; }

  if (e.target.closest('[data-action="close-modal"]')) { closeModal(); return; }

  /* Click directly on the backdrop (not a child) closes the modal */
  if (e.target.id === 'blogModal') { closeModal(); }
}

export function initProjects() {
  document.addEventListener('click', handleDelegatedClick);
  renderBlogs();
}
