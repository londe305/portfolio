/* =====================================================
   assistant.js — Assistant IA réseau
   Dépendances : aucune (autonome)
   Exposé via  : window.repondre (compatibilité HTML inline)
===================================================== */

function initAssistant() {

  /* ---- Normalisation de l'entrée utilisateur ---- */
  function normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* ---- Base de connaissances réseau ---- */
  const knowledge = [
    {
      terms: ['sd wan', 'sdwan'],
      data: {
        definition: "Le SD-WAN est une technologie réseau permettant de gérer intelligemment le trafic entre plusieurs sites.",
        role:       "Optimiser les performances, la redondance et la sécurité des connexions.",
        context:    "Utilisé dans ton projet Crystal pour moderniser le WAN.",
        example:    "Choisir automatiquement le meilleur lien Internet."
      }
    },
    {
      terms: ['wan'],
      data: {
        definition: "Le WAN est un réseau étendu reliant plusieurs sites.",
        role:       "Permettre la communication entre réseaux distants.",
        context:    "Utilisé pour interconnecter les agences d'une entreprise.",
        example:    "Connexion entre Paris et Dublin."
      }
    },
    {
      terms: ['lan'],
      data: {
        definition: "Le LAN est un réseau local.",
        role:       "Relier les équipements dans un même site.",
        context:    "Utilisé dans les entreprises pour les PC et serveurs.",
        example:    "Réseau d'un bureau."
      }
    },
    {
      terms: ['wlan', 'wifi'],
      data: {
        definition: "Le WLAN est un réseau sans fil.",
        role:       "Permettre la connexion sans câble.",
        context:    "Utilisé avec les bornes Wi-Fi.",
        example:    "Connexion d'un smartphone au réseau."
      }
    },
    {
      terms: ['firewall', 'pare feu'],
      data: {
        definition: "Un firewall filtre le trafic réseau.",
        role:       "Protéger l'infrastructure.",
        context:    "Fortigate utilisé dans ton projet.",
        example:    "Bloquer une IP malveillante."
      }
    },
    {
      terms: ['switch'],
      data: {
        definition: "Un switch connecte les équipements d'un LAN.",
        role:       "Acheminer les données.",
        context:    "Remplacement de 53 switches dans Crystal.",
        example:    "Connexion PC et imprimantes."
      }
    },
    {
      terms: ['vpn'],
      data: {
        definition: "Un VPN sécurise les connexions distantes.",
        role:       "Chiffrement des données.",
        context:    "Utilisé pour accès distant.",
        example:    "Connexion entreprise depuis domicile."
      }
    },
    {
      terms: ['vlan'],
      data: {
        definition: "Un VLAN segmente un réseau.",
        role:       "Isoler les flux.",
        context:    "Utilisé dans les switches.",
        example:    "Séparer RH et IT."
      }
    },
    {
      terms: ['dns'],
      data: {
        definition: "Le DNS traduit un nom en IP.",
        role:       "Navigation Internet.",
        context:    "Service fondamental.",
        example:    "google.com → IP."
      }
    },
    {
      terms: ['dhcp'],
      data: {
        definition: "Le DHCP attribue automatiquement les IP.",
        role:       "Simplifier la configuration.",
        context:    "Présent sur serveurs.",
        example:    "IP automatique sur PC."
      }
    },
    {
      terms: ['ipsec'],
      data: {
        definition: "IPSec sécurise les communications réseau.",
        role:       "Chiffrement des tunnels.",
        context:    "Utilisé dans SD-WAN.",
        example:    "Tunnel entre sites."
      }
    },
    {
      terms: ['tcp', 'tcp ip'],
      data: {
        definition: "TCP/IP est le protocole de communication Internet.",
        role:       "Permettre la transmission des données.",
        context:    "Base du réseau.",
        example:    "Communication entre deux machines."
      }
    },
    {
      terms: ['routing', 'routage'],
      data: {
        definition: "Le routage détermine le chemin des données.",
        role:       "Acheminement des paquets.",
        context:    "Utilisé dans WAN.",
        example:    "Choisir un chemin réseau."
      }
    },
    {
      terms: ['sdn'],
      data: {
        definition: "Le SDN permet de piloter le réseau par logiciel.",
        role:       "Automatisation réseau.",
        context:    "Évolution moderne.",
        example:    "Configuration via code."
      }
    },
    {
      terms: ['iac'],
      data: {
        definition: "L'IaC permet de gérer l'infrastructure par code.",
        role:       "Automatiser les déploiements.",
        context:    "Utilisé dans DevOps.",
        example:    "Terraform."
      }
    },
    {
      terms: ['monitoring', 'supervision'],
      data: {
        definition: "La supervision surveille les systèmes.",
        role:       "Détecter les problèmes.",
        context:    "Zabbix / Centreon.",
        example:    "Alertes anomalies."
      }
    },
    {
      terms: ['zero trust'],
      data: {
        definition: "Le Zero Trust vérifie chaque accès.",
        role:       "Sécuriser les infrastructures.",
        context:    "Veille techno de ton portfolio.",
        example:    "Authentification MFA."
      }
    },
    {
      terms: ['mfa'],
      data: {
        definition: "Le MFA ajoute plusieurs facteurs d'authentification.",
        role:       "Renforcer la sécurité.",
        context:    "Zero Trust.",
        example:    "Code SMS + mot de passe."
      }
    }
  ];

  /* ---- Recherche dans la base ---- */
  function findBestMatch(input) {
    for (const item of knowledge) {
      for (const term of item.terms) {
        if (input.includes(term)) return item.data;
      }
    }
    return null;
  }

  /* ---- Affichage des messages dans le chat ---- */
  function addMessage(text, type) {
    const chat = document.getElementById('chat-box');
    if (!chat) return;
    const msg = document.createElement('div');
    msg.classList.add('message', type);
    msg.innerText = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  function addGoogleButton(query) {
    const chat = document.getElementById('chat-box');
    if (!chat) return;
    const btn = document.createElement('button');
    btn.innerText = '🔎 Rechercher sur Google';
    btn.style.marginTop = '10px';
    btn.onclick = () => {
      window.open('https://www.google.com/search?q=' + encodeURIComponent(query));
    };
    chat.appendChild(btn);
  }

  /* ---- Traitement d'une question ---- */
  function handleQuestion() {
    const inputEl = document.getElementById('question');
    if (!inputEl) return;
    const raw = inputEl.value.trim();
    if (!raw) return;

    addMessage(raw, 'user');
    const result = findBestMatch(normalize(raw));

    if (result) {
      addMessage(
        '📘 Définition : ' + result.definition +
        '\n\n🎯 Rôle : '    + result.role       +
        '\n\n🧠 Contexte : ' + result.context    +
        '\n\n💡 Exemple : '  + result.example,
        'bot'
      );
    } else {
      addMessage('❌ Terme non trouvé dans la base.', 'bot');
    }

    addGoogleButton(raw);
    inputEl.value = '';
  }

  /* ---- Événements ---- */
  const sendBtn      = document.getElementById('assistant-send');
  const questionInput = document.getElementById('question');

  sendBtn?.addEventListener('click', handleQuestion);
  questionInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleQuestion(); }
  });

  /* ---- Modal assistant (ouverture / fermeture) ---- */
  const modal    = document.getElementById('assistant-modal');
  const toggle   = document.getElementById('assistant-toggle');
  const closeBtn = document.getElementById('assistant-close');

  const showModal = () => {
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    if (toggle) toggle.style.display = 'none';
    questionInput?.focus();
  };

  const hideModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    if (toggle) toggle.style.display = 'inline-block';
  };

  toggle?.addEventListener('click', showModal);
  closeBtn?.addEventListener('click', hideModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

  // Fermeture au clavier (Escape)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) hideModal();
  });

  // Exposition globale pour rétrocompatibilité
  window.repondre = handleQuestion;
}

// Appel immédiat (script defer = DOM prêt)
initAssistant();
