// Helpers
const $  = (s, r=document)=> r.querySelector(s);
const $$ = (s, r=document)=> Array.from(r.querySelectorAll(s));

const translations = {
  fr: {
    "lang.fr": "FR",
    "lang.en": "EN",
    "lang.cn": "CN",
    "nav.home": "🏠 Accueil",
    "nav.apropos": "👤 À propos",
    "nav.alternance": "🏢 Alternance",
    "nav.alt-arrivee": "• Arrivée",
    "nav.alt-equipe": "• Équipe infra",
    "nav.alt-tuteur": "• Tuteur",
    "nav.alt-transdev": "• Transdev",
    "nav.projets": "🛠️ Projets",
    "nav.certifications": "🏅 Certifications",
    "nav.cert-reseau": "• Réseau",
    "nav.cert-systemes": "• Systèmes",
    "nav.cert-cloud": "• Cloud",
    "nav.cert-securite": "• Sécurité",
    "nav.cert-devops": "• DevOps / IaC",
    "nav.cert-itsm": "• ITSM / Gouvernance",
    "nav.cert-outils": "• Outils / Supervision",
    "nav.cert-autres": "• Autres",
    "nav.veille": "🔒 Veille technologique",
    "nav.contact": "📞 Contact",
    "nav.jeu": "🎮 Jeu – Dino SIO",
    "home.title": "[=== BIENVENUE ===]",
    "home.welcome":"Bienvenue sur le portfolio de <strong>Londé Balossa Lotus Espoir</strong>.",
    "home.instructions":"Utilise le menu à gauche pour naviguer.",
    "apropos.title":"[=== À PROPOS ===]",
    "apropos.intro":"Étudiant en BTS SIO (option SISR), je m’intéresse aux systèmes, réseaux et à la cybersécurité. Mon objectif : bâtir des infrastructures <strong>performantes</strong>, <strong>sécurisées</strong> et <strong>résilientes</strong>.",
    "apropos.infra.title":"Enjeux des infrastructures réseau aujourd’hui",
    "apropos.infra.1":"<strong>Performance & scalabilité</strong> – absorber la croissance utilisateurs/données/services.",
    "apropos.infra.2":"<strong>Sécurité</strong> – faire face aux ransomwares, compromissions d’identités, exposition Internet.",
    "apropos.infra.3":"<strong>Disponibilité</strong> – maintenir un service 24/7 avec redondance, sauvegardes, PRA/PCA.",
    "apropos.future.title":"Dans la prochaine décennie",
    "apropos.future.1":"<strong>Automatisation & IaC/SDN</strong> – réseaux pilotés par code, déploiements répétables.",
    "apropos.future.2":"<strong>Zero Trust généralisé</strong> – contrôle d’accès fort, moindre privilège, vérification continue.",
    "apropos.future.3":"<strong>Observabilité</strong> – télémétrie fine, détection temps réel, auto-remédiation.",
    "apropos.future.4":"<strong>IA & sécurité</strong> – détection d’anomalies, réponse automatisée.",
    "apropos.assistant":"Assistant IA accessible depuis le bouton flottant en bas à droite.",
    "alternance.title":"[=== MON ALTERNANCE CHEZ TRANSDEV ===]",
    "alternance.subtabs.label":"Sous-onglets Alternance",
    "alt-arrivee.title":"Arrivée au sein du groupe Transdev",
    "alt-arrivee.text":"(À compléter : contexte d’arrivée, objectifs de la mission, périmètre technique…)",
    "alt-equipe.title":"L’équipe infrastructure",
    "alt-equipe.text":"(À compléter : organisation, responsabilités, technologies principales, interactions…)",
    "alt-tuteur.title":"Présentation",
    "alt-tuteur.p1":"<strong>Johann Launay</strong> est <strong>Asset Manager</strong> / gestionnaire du parc informatique à la <strong>DSI France</strong> de Transdev. Dans un entretien publié par Transdev, il met en avant les actions de sobriété énergétique et l’optimisation du cycle de vie des équipements (reconditionnement, réduction des emballages, méthodes de réception et logistique à Roissy) dans une démarche de gestion responsable des actifs IT. <a href=\"https://www.transdev.com/fr/innovation-et-tech/la-dsi-france-et-la-sobriete-energetique-entretien-avec-johann-launay-gestionnaire-du-parc-informatique/\" target=\"_blank\" rel=\"noopener\">Source</a>.",
    "alt-tuteur.role.title":"Rôle & missions (extraits publics)",
    "alt-tuteur.role.1":"<strong>Gestion du parc IT & sobriété :</strong> pilotage du cycle de vie des équipements, reconditionnement, logistique (plateforme de Roissy), réduction des impacts environnementaux liés aux actifs informatiques (démarche décrite par Transdev). <a href=\"https://www.transdev.com/fr/innovation-et-tech/la-dsi-france-et-la-sobriete-energetique-entretien-avec-johann-launay-gestionnaire-du-parc-informatique/\" target=\"_blank\" rel=\"noopener\">Source</a>.",
    "alt-tuteur.role.2":"<strong>Parcours IT (éléments antérieurs, profil pro) :</strong> responsabilités systèmes, réseaux, data center, projets de consolidation d’infrastructures et d’outillage IT (ex. GLPI, supervision), telles que décrites sur un profil professionnel public (Viadeo/JDN). <a href=\"https://viadeo.journaldunet.com/p/johann-launay-5047557\" target=\"_blank\" rel=\"noopener\">Source</a>.",
    "alt-tuteur.note1":"(Les items ci‑dessus reflètent uniquement des informations <em>publiques</em> et professionnelles.)",
    "alt-tuteur.role-internal.title":"Fonctionnement avec mon tuteur (éléments internes)",
    "alt-tuteur.role-internal.1":"<strong>Rituel hebdo :</strong> point <strong>30 min chaque début de semaine</strong> pour cadrer priorités, risques et livrables.",
    "alt-tuteur.role-internal.2":"<strong>Montée en autonomie :</strong> démonstration → binômage → réalisation encadrée → validation.",
    "alt-tuteur.role-internal.3":"<strong>Traçabilité :</strong> ticketing + documentation des SOP/Runbooks + preuves pour E6.",
    "alt-tuteur.note2":"Ces informations décrivent notre organisation interne (non publiques).",
    "alt-tuteur.learned.title":"Ce que j’apprends à ses côtés",
    "alt-tuteur.learned.1":"<strong>Démarrage en IT d’entreprise :</strong> j’ai véritablement fait mes débuts en environnement pro avec lui ; il a posé les bases (méthode, qualité, sécurité).",
    "alt-tuteur.learned.2":"<strong>Gestion d’actifs IT “responsable” :</strong> penser cycle de vie complet (inventaire → exploitation → retrait), standardiser et mesurer l’impact (KPI simples).",
    "alt-tuteur.learned.3":"<strong>Exigence & mentorat :</strong> Johann est une vraie source de motivation et un <strong>mentor</strong> — il challenge, explique, et valide les étapes clés.",
    "alt-transdev.title":"Qui est Transdev ?",
    "alt-transdev.p1":"Transdev est un opérateur et intégrateur de mobilités présent dans <strong>19 pays</strong>, qui transporte en moyenne <strong>12,8 millions</strong> de passagers par jour et emploie plus de <strong>105 000</strong> collaborateurs (2024). Modes exploités : bus, car, tram, train, métro, ferries, vélo, transport à la demande et services autonomes. <a href=\"https://fr.linkedin.com/company/-transdev\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.gouv.title":"Actionnariat & gouvernance",
    "alt-transdev.gouv.1":"<strong>Actionnariat (2025) :</strong> Groupe <strong>RETHMANN 66 %</strong> et <strong>Caisse des Dépôts 34 %</strong> – finalisation annoncée le 2 juillet 2025. <a href=\"https://www.transdev.com/wp-content/uploads/2025/07/2025-07-02-presse-release-rethmann-caisse-des-depots-transdev_en.pdf\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.gouv.2":"<strong>Gouvernance :</strong> comité exécutif groupe (PDG Thierry Mallet, etc.) détaillé sur la page officielle. <a href=\"https://www.transdev.com/fr/notre-groupe/qui-dirige-le-groupe/\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.chiffres.title":"Chiffres 2024 (repères officiels)",
    "alt-transdev.chiffres.1":"CA 2024 : ~<strong>10,05 Md€</strong> (cap franchi) ; <strong>12,8 M</strong> de passagers/jour en moyenne.",
    "alt-transdev.chiffres.2":"Performance : résultat opérationnel courant 2024 en forte hausse (<em>donnée institutionnelle</em>).",
    "alt-transdev.chiffres.note":"Sources institutionnelles (Caisse des Dépôts / pages corporate). <a href=\"https://www.caissedesdepots.fr/eclairage/actualites/transdev-sest-surpasse-en-2024\" target=\"_blank\" rel=\"noopener\">CDC 13 mars 2025</a> · <a href=\"https://fr.linkedin.com/company/-transdev\" target=\"_blank\" rel=\"noopener\">Transdev (présentation)</a>",
    "alt-transdev.strat.title":"Stratégie numérique & gestion d’actifs (EAM)",
    "alt-transdev.strat.1":"Standardisation EAM cloud : déploiements Infor CloudSuite EAM (Australasie) pour centraliser achats, maintenance, inventaires & conformité. <a href=\"https://www.technologydecisions.com.au/content/cloud-and-virtualisation/news/transdev-selects-infor-for-cloud-based-asset-management-270053092\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.strat.2":"Cadres ISO 55001 : approches multi‑modalités et corpus de pratiques (AMBoK) pour aligner performance, sécurité et contrats. <a href=\"https://amcouncil.win/2023/08/11/transdev-multi-modal-asset-management-strategy-establishing-asset-management-body-of-knowledge-ambok/\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.strat.3":"Cas d’usage : prise en main rapide d’un réseau ferroviaire en Suède en 2024 via outillage d’asset management (référence presse). <a href=\"https://railwaynews.net/transdev-sweden-rapid-rail-network-takeover-asset-management-success.html\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.sober.title":"IT & sobriété (exemple France)",
    "alt-transdev.sober.1":"En France, la DSI met en avant la sobriété énergétique et une gestion responsable du parc IT : reconditionnement des matériels, réduction des emballages, méthodes de réception & logistique (plateforme de Roissy), pour limiter l’empreinte des équipements. <a href=\"https://www.transdev.com/fr/innovation-et-tech/la-dsi-france-et-la-sobriete-energetique-entretien-avec-johann-launay-gestionnaire-du-parc-informatique/\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.links.title":"Où suivre l’officiel",
    "alt-transdev.links.1":"Gouvernance (ComEx)",
    "alt-transdev.links.2":"Investors & résultats",
    "alt-transdev.links.3":"Présentation (LinkedIn corp.)",
    // More translations are needed for the rest of the content but this initial dictionary is enough to wire the system.
  },
  en: {
    "lang.fr": "FR",
    "lang.en": "EN",
    "lang.cn": "CN",
    "nav.home": "🏠 Home",
    "nav.apropos": "👤 About",
    "nav.alternance": "🏢 Internship",
    "nav.alt-arrivee": "• Arrival",
    "nav.alt-equipe": "• Infra Team",
    "nav.alt-tuteur": "• Tutor",
    "nav.alt-transdev": "• Transdev",
    "nav.projets": "🛠️ Projects",
    "nav.certifications": "🏅 Certifications",
    "nav.cert-reseau": "• Network",
    "nav.cert-systemes": "• Systems",
    "nav.cert-cloud": "• Cloud",
    "nav.cert-securite": "• Security",
    "nav.cert-devops": "• DevOps / IaC",
    "nav.cert-itsm": "• ITSM / Governance",
    "nav.cert-outils": "• Tools / Monitoring",
    "nav.cert-autres": "• Other",
    "nav.veille": "🔒 Tech Watch",
    "nav.contact": "📞 Contact",
    "nav.jeu": "🎮 Game – Dino SIO",
    "home.title": "[=== WELCOME ===]",
    "home.welcome":"Welcome to the portfolio of <strong>Londé Balossa Lotus Espoir</strong>.",
    "home.instructions":"Use the menu on the left to navigate.",
    "apropos.title":"[=== ABOUT ===]",
    "apropos.intro":"BTS SIO student (SISR option), I focus on systems, networks and cybersecurity. My goal: build <strong>performant</strong>, <strong>secure</strong> and <strong>resilient</strong> infrastructures.",
    "apropos.infra.title":"Network infrastructure challenges today",
    "apropos.infra.1":"<strong>Performance & scalability</strong> – absorb user/data/service growth.",
    "apropos.infra.2":"<strong>Security</strong> – face ransomware, identity compromise, Internet exposure.",
    "apropos.infra.3":"<strong>Availability</strong> – keep service 24/7 with redundancy, backups, DR/BC plans.",
    "apropos.future.title":"In the next decade",
    "apropos.future.1":"<strong>Automation & IaC/SDN</strong> – code-driven networks, repeatable deployments.",
    "apropos.future.2":"<strong>Wider Zero Trust</strong> – strong access control, least privilege, continuous verification.",
    "apropos.future.3":"<strong>Observability</strong> – detailed telemetry, real-time detection, self-remediation.",
    "apropos.future.4":"<strong>AI & security</strong> – anomaly detection, automated response.",
    "apropos.assistant":"AI assistant available from the floating button in the bottom right.",
    "alternance.title":"[=== MY INTERNSHIP AT TRANSDEV ===]",
    "alternance.subtabs.label":"Internship subtabs",
    "alt-arrivee.title":"Arrival at Transdev",
    "alt-arrivee.text":"(To complete: arrival context, mission objectives, technical scope…)",
    "alt-equipe.title":"Infrastructure team",
    "alt-equipe.text":"(To complete: organization, responsibilities, main technologies, interactions…)",
    "alt-tuteur.title":"Presentation",
    "alt-tuteur.p1":"<strong>Johann Launay</strong> is an <strong>Asset Manager</strong> / IT asset manager at Transdev France IT. In an interview, he highlights energy sobriety actions and lifecycle optimization of equipment (refurbishment, reduced packaging, reception and logistics methods in Roissy) in a responsible IT asset management approach. <a href=\"https://www.transdev.com/fr/innovation-et-tech/la-dsi-france-et-la-sobriete-energetique-entretien-avec-johann-launay-gestionnaire-du-parc-informatique/\" target=\"_blank\" rel=\"noopener\">Source</a>.",
    "alt-tuteur.role.title":"Role & missions (public excerpts)",
    "alt-tuteur.role.1":"<strong>IT asset management & sobriety:</strong> lifecycle management of equipment, refurbishment, logistics (Roissy platform), reducing environmental impacts of IT assets (as described by Transdev). <a href=\"https://www.transdev.com/fr/innovation-et-tech/la-dsi-france-et-la-sobriete-energetique-entretien-avec-johann-launay-gestionnaire-du-parc-informatique/\" target=\"_blank\" rel=\"noopener\">Source</a>.",
    "alt-tuteur.role.2":"<strong>IT career (prior experience, professional profile):</strong> system, network, data center responsibilities, infrastructure consolidation and IT tooling projects (e.g. GLPI, monitoring), as described on a public professional profile. <a href=\"https://viadeo.journaldunet.com/p/johann-launay-5047557\" target=\"_blank\" rel=\"noopener\">Source</a>.",
    "alt-tuteur.note1":"(The above items reflect only public and professional information.)",
    "alt-tuteur.role-internal.title":"Working with my tutor (internal notes)",
    "alt-tuteur.role-internal.1":"<strong>Weekly ritual:</strong> 30-minute meeting at the start of each week to align priorities, risks and deliverables.",
    "alt-tuteur.role-internal.2":"<strong>Growing autonomy:</strong> demonstration → paired work → supervised execution → validation.",
    "alt-tuteur.role-internal.3":"<strong>Traceability:</strong> ticketing + SOP/Runbook documentation + evidence for E6.",
    "alt-tuteur.note2":"These details describe our internal organization (not public).",
    "alt-tuteur.learned.title":"What I learn alongside him",
    "alt-tuteur.learned.1":"<strong>Starting in enterprise IT:</strong> I truly began my professional experience with him; he set the foundations (method, quality, security).",
    "alt-tuteur.learned.2":"<strong>Responsible IT asset management:</strong> thinking about the full lifecycle (inventory → operation → retirement), standardizing and measuring impact (simple KPIs).",
    "alt-tuteur.learned.3":"<strong>Demanding mentorship:</strong> Johann is a real source of motivation and a <strong>mentor</strong> — he challenges, explains, and validates key steps.",
    "alt-transdev.title":"Who is Transdev?",
    "alt-transdev.p1":"Transdev is a mobility operator and integrator present in <strong>19 countries</strong>, transporting an average of <strong>12.8 million</strong> passengers per day and employing more than <strong>105,000</strong> people (2024). Modes: bus, coach, tram, train, metro, ferries, bike, on-demand transport and autonomous services. <a href=\"https://fr.linkedin.com/company/-transdev\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.gouv.title":"Ownership & governance",
    "alt-transdev.gouv.1":"<strong>Ownership (2025):</strong> RETHMANN Group 66% and Caisse des Dépôts 34% – completion announced July 2, 2025. <a href=\"https://www.transdev.com/wp-content/uploads/2025/07/2025-07-02-presse-release-rethmann-caisse-des-depots-transdev_en.pdf\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.gouv.2":"<strong>Governance:</strong> group executive committee (CEO Thierry Mallet, etc.) detailed on the official page. <a href=\"https://www.transdev.com/fr/notre-groupe/qui-dirige-le-groupe/\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.chiffres.title":"2024 Figures (official references)",
    "alt-transdev.chiffres.1":"2024 revenue: around <strong>€10.05B</strong> (milestone surpassed); average <strong>12.8M</strong> passengers/day.",
    "alt-transdev.chiffres.2":"Performance: strong increase in current operating income in 2024 (<em>institutional data</em>).",
    "alt-transdev.chiffres.note":"Institutional sources (Caisse des Dépôts / corporate pages). <a href=\"https://www.caissedesdepots.fr/eclairage/actualites/transdev-sest-surpasse-en-2024\" target=\"_blank\" rel=\"noopener\">CDC March 13, 2025</a> · <a href=\"https://fr.linkedin.com/company/-transdev\" target=\"_blank\" rel=\"noopener\">Transdev (presentation)</a>",
    "alt-transdev.strat.title":"Digital strategy & asset management (EAM)",
    "alt-transdev.strat.1":"Cloud EAM standardization: Infor CloudSuite EAM deployments (Asia-Pacific) to centralize purchasing, maintenance, inventory and compliance. <a href=\"https://www.technologydecisions.com.au/content/cloud-and-virtualisation/news/transdev-selects-infor-for-cloud-based-asset-management-270053092\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.strat.2":"ISO 55001 frameworks: multimodal approaches and practice corpus (AMBoK) to align performance, security and contracts. <a href=\"https://amcouncil.win/2023/08/11/transdev-multi-modal-asset-management-strategy-establishing-asset-management-body-of-knowledge-ambok/\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.strat.3":"Use case: quick takeover of a Swedish rail network in 2024 using asset management tooling (press reference). <a href=\"https://railwaynews.net/transdev-sweden-rapid-rail-network-takeover-asset-management-success.html\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.sober.title":"IT & sustainability (France example)",
    "alt-transdev.sober.1":"In France, the IT department promotes energy sobriety and responsible IT asset management: equipment refurbishment, reduced packaging, reception & logistics methods (Roissy platform), to limit equipment footprint. <a href=\"https://www.transdev.com/fr/innovation-et-tech/la-dsi-france-et-la-sobriete-energetique-entretien-avec-johann-launay-gestionnaire-du-parc-informatique/\" target=\"_blank\" rel=\"noopener\">Source</a>",
    "alt-transdev.links.title":"Where to follow the official sources",
    "alt-transdev.links.1":"Governance (ComEx)",
    "alt-transdev.links.2":"Investors & results",
    "alt-transdev.links.3":"Presentation (LinkedIn corp.)",
  },
  cn: {
    "lang.fr": "FR",
    "lang.en": "EN",
    "lang.cn": "CN",
    "nav.home": "🏠 主页",
    "nav.apropos": "👤 关于",
    "nav.alternance": "🏢 实习",
    "nav.alt-arrivee": "• 入职",
    "nav.alt-equipe": "• 基础设施团队",
    "nav.alt-tuteur": "• 导师",
    "nav.alt-transdev": "• Transdev",
    "nav.projets": "🛠️ 项目",
    "nav.certifications": "🏅 认证",
    "nav.cert-reseau": "• 网络",
    "nav.cert-systemes": "• 系统",
    "nav.cert-cloud": "• 云",
    "nav.cert-securite": "• 安全",
    "nav.cert-devops": "• DevOps / IaC",
    "nav.cert-itsm": "• ITSM / 治理",
    "nav.cert-outils": "• 工具 / 监控",
    "nav.cert-autres": "• 其他",
    "nav.veille": "🔒 技术观察",
    "nav.contact": "📞 联系",
    "nav.jeu": "🎮 游戏 – Dino SIO",
    "home.title": "[=== 欢迎 ===]",
    "home.welcome":"欢迎来到 <strong>Londé Balossa Lotus Espoir</strong> 的作品集。",
    "home.instructions":"使用左侧菜单进行导航。",
    "apropos.title":"[=== 关于 ===]",
    "apropos.intro":"BTS SIO 学生（SISR 方向），我关注系统、网络和网络安全。我的目标：构建<strong>高效</strong>、<strong>安全</strong>、<strong>有弹性</strong>的基础设施。",
    "apropos.infra.title":"当今网络基础设施的挑战",
    "apropos.infra.1":"<strong>性能与可扩展性</strong> – 承载用户/数据/服务增长。",
    "apropos.infra.2":"<strong>安全</strong> – 应对勒索软件、身份泄露、互联网暴露。",
    "apropos.infra.3":"<strong>可用性</strong> – 通过冗余、备份、灾备计划保持 24/7 服务。",
    "apropos.future.title":"未来十年",
    "apropos.future.1":"<strong>自动化 & IaC/SDN</strong> – 代码驱动网络，可重复部署。",
    "apropos.future.2":"<strong>广泛的零信任</strong> – 强访问控制、最小权限、持续验证。",
    "apropos.future.3":"<strong>可观察性</strong> – 细粒度遥测、实时检测、自我修复。",
    "apropos.future.4":"<strong>AI 与安全</strong> – 异常检测、自动响应。",
    "apropos.assistant":"AI 助手可通过右下角悬浮按钮访问。",
    "alternance.title":"[=== 我在 TRANSDEV 的实习 ===]",
    "alternance.subtabs.label":"实习子标签",
    "alt-arrivee.title":"加入 Transdev",
    "alt-arrivee.text":"（待补充：入职背景、任务目标、技术范围……）",
    "alt-equipe.title":"基础设施团队",
    "alt-equipe.text":"（待补充：组织结构、职责、主要技术、协作……）",
    "alt-tuteur.title":"介绍",
    "alt-tuteur.p1":"<strong>Johann Launay</strong> 是 Transdev 法国 IT 部门的 <strong>资产经理</strong>。在一次采访中，他强调了能源节约行动和设备生命周期优化（翻新、减少包装、罗西机场的接收与物流方法），体现了负责任的 IT 资产管理。<a href=\"https://www.transdev.com/fr/innovation-et-tech/la-dsi-france-et-la-sobriete-energetique-entretien-avec-johann-launay-gestionnaire-du-parc-informatique/\" target=\"_blank\" rel=\"noopener\">来源</a>。",
    "alt-tuteur.role.title":"角色与任务（公开摘录）",
    "alt-tuteur.role.1":"<strong>IT 资产管理与节能：</strong>设备生命周期管理、翻新、物流（罗西平台），减少 IT 资产的环境影响（Transdev 所述）。<a href=\"https://www.transdev.com/fr/innovation-et-tech/la-dsi-france-et-la-sobriete-energetique-entretien-avec-johann-launay-gestionnaire-du-parc-informatique/\" target=\"_blank\" rel=\"noopener\">来源</a>。",
    "alt-tuteur.role.2":"<strong>IT 职业发展（先前经历，职业简介）：</strong>系统、网络、数据中心职责，基础设施整合和 IT 工具项目（如 GLPI、监控），如公开职业资料所述。<a href=\"https://viadeo.journaldunet.com/p/johann-launay-5047557\" target=\"_blank\" rel=\"noopener\">来源</a>。",
    "alt-tuteur.note1":"（以上内容仅反映公开和专业信息。）",
    "alt-tuteur.role-internal.title":"与我的导师合作（内部内容）",
    "alt-tuteur.role-internal.1":"<strong>每周例会：</strong>每周开始时进行 30 分钟会议，协调优先级、风险和交付内容。",
    "alt-tuteur.role-internal.2":"<strong>提升自主性：</strong>演示 → 配对工作 → 受监督执行 → 验证。",
    "alt-tuteur.role-internal.3":"<strong>可追溯性：</strong>工单 + SOP/Runbook 文档 + E6 证据。",
    "alt-tuteur.note2":"这些细节描述了我们的内部组织（非公开）。",
    "alt-tuteur.learned.title":"我从他身上学到的",
    "alt-tuteur.learned.1":"<strong>企业 IT 启动：</strong>我真正开始了职业实践，他奠定了基础（方法、质量、安全）。",
    "alt-tuteur.learned.2":"<strong>负责的 IT 资产管理：</strong>考虑完整生命周期（盘点 → 运营 → 退役），标准化并衡量影响（简单 KPI）。",
    "alt-tuteur.learned.3":"<strong>严格的导师指导：</strong>Johann 是真正的动力源和 <strong>导师</strong> — 他挑战、解释并验证关键步骤。",
    "alt-transdev.title":"Transdev 是谁？",
    "alt-transdev.p1":"Transdev 是一家覆盖 <strong>19 个国家</strong>的出行运营商和集成商，平均每天运输 <strong>1280 万</strong>乘客，拥有超过 <strong>105000</strong>名员工（2024）。业务模式：公交、长途汽车、有轨电车、火车、地铁、渡轮、自行车、按需出行和自动驾驶服务。<a href=\"https://fr.linkedin.com/company/-transdev\" target=\"_blank\" rel=\"noopener\">来源</a>",
    "alt-transdev.gouv.title":"股权与治理",
    "alt-transdev.gouv.1":"<strong>股权（2025）：</strong>RETHMANN 集团 66%，Caisse des Dépôts 34%，2025 年 7 月 2 日宣布完成。<a href=\"https://www.transdev.com/wp-content/uploads/2025/07/2025-07-02-presse-release-rethmann-caisse-des-depots-transdev_en.pdf\" target=\"_blank\" rel=\"noopener\">来源</a>",
    "alt-transdev.gouv.2":"<strong>治理：</strong>集团执行委员会（CEO Thierry Mallet 等）在官方页面中有详细介绍。<a href=\"https://www.transdev.com/fr/notre-groupe/qui-dirige-le-groupe/\" target=\"_blank\" rel=\"noopener\">来源</a>",
    "alt-transdev.chiffres.title":"2024 年数据（官方参考）",
    "alt-transdev.chiffres.1":"2024 年收入：约 <strong>100.5 亿欧元</strong>（已突破）；平均每天 <strong>1280 万</strong>乘客。",
    "alt-transdev.chiffres.2":"业绩：2024 年经常性经营利润大幅增长（<em>机构数据</em>）。",
    "alt-transdev.chiffres.note":"机构来源（Caisse des Dépôts / 企业页面）。<a href=\"https://www.caissedesdepots.fr/eclairage/actualites/transdev-sest-surpasse-en-2024\" target=\"_blank\" rel=\"noopener\">CDC 2025 年 3 月 13 日</a> · <a href=\"https://fr.linkedin.com/company/-transdev\" target=\"_blank\" rel=\"noopener\">Transdev（介绍）</a>",
    "alt-transdev.strat.title":"数字战略与资产管理（EAM）",
    "alt-transdev.strat.1":"云 EAM 标准化：Infor CloudSuite EAM 部署（亚太地区），用于集中采购、维护、库存和合规。<a href=\"https://www.technologydecisions.com.au/content/cloud-and-virtualisation/news/transdev-selects-infor-for-cloud-based-asset-management-270053092\" target=\"_blank\" rel=\"noopener\">来源</a>",
    "alt-transdev.strat.2":"ISO 55001 框架：多模式方法和实践体系（AMBoK），用于对齐绩效、安全和合同。<a href=\"https://amcouncil.win/2023/08/11/transdev-multi-modal-asset-management-strategy-establishing-asset-management-body-of-knowledge-ambok/\" target=\"_blank\" rel=\"noopener\">来源</a>",
    "alt-transdev.strat.3":"示例：2024 年通过资产管理工具快速接管瑞典铁路网络（新闻参考）。<a href=\"https://railwaynews.net/transdev-sweden-rapid-rail-network-takeover-asset-management-success.html\" target=\"_blank\" rel=\"noopener\">来源</a>",
    "alt-transdev.sober.title":"IT 与节能（法国示例）",
    "alt-transdev.sober.1":"在法国，IT 部门强调能源节约与负责任的 IT 资产管理：设备翻新、减少包装、接收与物流方法（罗西平台），以限制设备足迹。<a href=\"https://www.transdev.com/fr/innovation-et-tech/la-dsi-france-et-la-sobriete-energetique-entretien-avec-johann-launay-gestionnaire-du-parc-informatique/\" target=\"_blank\" rel=\"noopener\">来源</a>",
    "alt-transdev.links.title":"官方信息来源",
    "alt-transdev.links.1":"治理（ComEx）",
    "alt-transdev.links.2":"投资者与业绩",
    "alt-transdev.links.3":"LinkedIn 介绍",
  }
};

function getStoredLanguage(){
  const lang = localStorage.getItem('portfolioLang');
  if (lang && ['fr','en','cn'].includes(lang)) return lang;
  const browser = navigator.language?.slice(0,2).toLowerCase();
  return ['fr','en','cn'].includes(browser) ? browser : 'fr';
}

function setLanguage(lang){
  if (!translations[lang]) return;
  document.documentElement.lang = lang;
  localStorage.setItem('portfolioLang', lang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (!key) return;
    const entry = translations[lang][key];
    if (entry !== undefined) el.textContent = entry;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (!key) return;
    const entry = translations[lang][key];
    if (entry !== undefined) el.innerHTML = entry;
  });
}

function initLanguage(){
  const lang = getStoredLanguage();
  setLanguage(lang);
  document.getElementById('lang-switcher')?.addEventListener('click', (e)=>{
    const btn = e.target.closest('.lang-btn');
    if (!btn) return;
    setLanguage(btn.dataset.lang);
  });
}

/* =========================
   FONCTIONS PARTAGÉES
========================= */
// Activation d'un groupe de subtabs (groupe = element .subtabs)
function activateSubtabGroup(subtabsEl, subId){
  if (!subtabsEl) return false;
  const panelsContainer = subtabsEl.nextElementSibling;
  if (!panelsContainer || !panelsContainer.classList.contains('subpanels')) return false;
  const esc = (s) => (window.CSS && CSS.escape) ? CSS.escape(s) : s;

  const tabs = Array.from(subtabsEl.querySelectorAll('li'));
  const panels = Array.from(panelsContainer.querySelectorAll('.subpanel'));
  tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
  panels.forEach(p => p.classList.remove('active'));

  // Determine subId: passed > stored on group > first
  if (!subId) subId = subtabsEl.dataset.activeSub || tabs[0]?.getAttribute('data-sub') || null;
  if (!subId) return false;

  const tab = subtabsEl.querySelector(`li[data-sub="${esc(subId)}"]`);
  const panel = panelsContainer.querySelector(`#${esc(subId)}`);
  if (tab) { tab.classList.add('active'); tab.setAttribute('aria-selected','true'); }
  if (panel) panel.classList.add('active');

  subtabsEl.dataset.activeSub = subId;
  return true;
}

function setTreeOpen(parentLi, open){
  const ul = parentLi.querySelector(".tree-children");
  if (!ul) return;
  ul.style.willChange = "max-height";
  ul.style.overflow = "hidden";
  if (open){
    parentLi.classList.add("open");
    parentLi.setAttribute("aria-expanded","true");
    ul.style.maxHeight = ul.scrollHeight + "px";
  } else {
    parentLi.classList.remove("open");
    parentLi.setAttribute("aria-expanded","false");
    ul.style.maxHeight = "0px";
  }
  setTimeout(()=>{ ul.style.willChange = "auto"; }, 300);
}

function syncSidebarTree(sectionId, subId){
  const group = document.querySelector(`.sidebar li.has-children[data-section="${sectionId}"]`);
  if (group) setTreeOpen(group, true);

  // Actif visuel dans le tree
  $$(".tree-item").forEach(x => x.classList.remove("active"));
  if (subId){
    document.querySelector(`.tree-item[data-section="${sectionId}"][data-sub="${subId}"]`)?.classList.add("active");
  }

  // Actif visuel du parent / élément simple
  $$(".sidebar li").forEach(i => i.classList.remove("active"));
  if (group) group.classList.add("active");
  else document.querySelector(`.sidebar li[data-section="${sectionId}"]`)?.classList.add("active");
}

function goTo(sectionId, subId=null){

  // Sections
  const sections = $$(".section");
  sections.forEach(s => s.classList.remove("active"));

  const sectionEl = $("#"+sectionId);
  if (!sectionEl) return;
  sectionEl.classList.add("active");

  // Jeu : pause/resume
  if (typeof dinoGame !== "undefined"){
    if (sectionId === "jeu") dinoGame.resume();
    else dinoGame.pause();
  }

  // Sous-onglet
  // Sous-onglets : gérer chaque groupe indépendamment
  let resolvedSub = null;
  const groups = Array.from(sectionEl.querySelectorAll('.subtabs'));
  if (subId){
    // essayer d'activer le groupe qui contient ce subId
    for (const g of groups){
      const ok = activateSubtabGroup(g, subId);
      if (ok) { resolvedSub = subId; break; }
    }
    // fallback : si non trouvé, initialiser tous les groupes
    if (!resolvedSub) groups.forEach(g => activateSubtabGroup(g, null));
  } else {
    // initialiser chaque groupe (utilise stockage local du groupe ou premier)
    groups.forEach(g => { activateSubtabGroup(g, null); if (!resolvedSub) resolvedSub = g.dataset.activeSub || resolvedSub; });
    subId = resolvedSub;
  }

  // Synchro sidebar
  syncSidebarTree(sectionId, subId);

  // 📱 UX mobile : fermeture menu
  if (window.innerWidth <= 600) {
    document.querySelector(".sidebar")?.classList.remove("open");
    document.querySelector(".mobile-overlay")?.classList.remove("active");
  }

  // ✅ Fond dynamique
  const body = document.body;

  body.classList.remove(
    "bg-home",
    "bg-alternance",
    "bg-certifications",
    "bg-projets",
    "bg-veille",
    "bg-jeu",
    "bg-apropos",
    "bg-contact"
  );

body.classList.add("bg-" + sectionId);

} // ✅ fermeture de goTo correcte



/* =========================
   SIDEBAR (délégation)
========================= */
function initSidebar(){

  const sidebar = $(".sidebar");
  if (!sidebar) return;

  // État initial : groupes fermés
  $$(".sidebar li.has-children").forEach(parent => {
    const children = parent.querySelector(".tree-children");
    if (children){
      children.style.maxHeight = "0px";
      parent.setAttribute("aria-expanded","false");
      parent.classList.remove("open");
    }
  });

  sidebar.addEventListener("click", (e) => {
    const caret = e.target.closest(".caret");
    if (caret){
      const parent = caret.closest("li.has-children");
      setTreeOpen(parent, !parent.classList.contains("open"));
      return;
    }

    const li = e.target.closest("li");
    if (!li || !sidebar.contains(li)) return;

    // Titre non cliquable (pas de data-section)
    const sectionId = li.getAttribute("data-section");
    if (!sectionId) return;

    // Ouvrir un groupe parent si fermé
    if (li.classList.contains("has-children") && !li.classList.contains("open")){
      setTreeOpen(li, true);
    }

    const subId = li.getAttribute("data-sub") || null;
    goTo(sectionId, subId);
  });
}
initSidebar();

/* =========================
   SOUS-ONGLETS (ROBUSTE – multi-niveaux)
========================= */
function initSubtabs(sectionId){
  const section = document.getElementById(sectionId);
  if (!section) return;
  // Pour CHAQUE groupe de subtabs dans la section
  section.querySelectorAll(".subtabs").forEach(subtabs => {
    const panelsContainer = subtabs.nextElementSibling;
    if (!panelsContainer || !panelsContainer.classList.contains("subpanels")) return;

    // Accessibilité
    subtabs.setAttribute('role','tablist');
    Array.from(subtabs.querySelectorAll('li')).forEach(li => {
      li.setAttribute('role','tab');
      li.setAttribute('aria-selected', li.classList.contains('active') ? 'true' : 'false');
      const sub = li.getAttribute('data-sub');
      if (sub) li.setAttribute('aria-controls', sub);
    });

    // Délégation d'événements : plus robuste que listeners par onglet
    subtabs.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li || !subtabs.contains(li)) return;
      const sub = li.getAttribute('data-sub');
      if (!sub) return;
      // Activation centrale sur ce groupe
      const ok = activateSubtabGroup(subtabs, sub);
      // Mise à jour du sidebar si activé
      if (ok && section && section.id) syncSidebarTree(section.id, sub);
    });

    // Initialisation : utiliser le sous-onglet stocké ou actif ou le premier
    const stored = subtabs.dataset.activeSub;
    const initial = stored || subtabs.querySelector('li.active')?.getAttribute('data-sub') || subtabs.querySelector('li')?.getAttribute('data-sub');
    if (initial) activateSubtabGroup(subtabs, initial);
  });
}
["alternance","certifications","projets","veille"].forEach(initSubtabs);

/* =========================
   VEILLE Zero Trust – RSS Multisources
========================= */

async function fetchRSSFeed(url) {
  const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=6`;

  try {
    const response = await fetch(rss2jsonUrl, { cache: 'no-cache' });
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok' && Array.isArray(data.items)) {
        return { items: data.items.map(item => ({
          title: item.title || 'Sans titre',
          link: item.link || item.guid || '#',
          pubDate: item.pubDate || item.pubDate || '',
          source: item.source?.name || ''
        })) };
      }
    }
  } catch (error) {
    console.debug('rss2json unavailable:', error);
  }

  // Fallback via proxy (tolérant) — ne pas lever d'exception, retourner items vides en cas d'erreur
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const proxyResponse = await fetch(proxyUrl, { cache: 'no-cache' });
    if (!proxyResponse.ok) {
      console.debug('proxy fetch failed', proxyResponse.status);
      return { items: [] };
    }
    const text = await proxyResponse.text();
    const xml = new DOMParser().parseFromString(text, 'text/xml');
    if (xml.querySelector('parsererror')) {
      console.debug('Invalid XML from RSS source');
      return { items: [] };
    }

    const items = Array.from(xml.querySelectorAll('item,entry')).slice(0, 6).map(entry => {
      const title = entry.querySelector('title')?.textContent?.trim() || 'Sans titre';
      const linkNode = entry.querySelector('link');
      let link = linkNode?.textContent?.trim() || linkNode?.getAttribute('href')?.trim() || '#';
      if (!link) {
        const alt = entry.querySelector('link[rel="alternate"]');
        link = alt?.getAttribute('href')?.trim() || '#';
      }
      const pubDate = entry.querySelector('pubDate')?.textContent?.trim() || entry.querySelector('published')?.textContent?.trim() || entry.querySelector('updated')?.textContent?.trim() || '';
      return { title, link, pubDate, source: '' };
    });

    return { items };
  } catch (e) {
    console.debug('proxy fallback failed', e);
    return { items: [] };
  }
  
}

async function loadVeilleRSS() {
  const feeds = [
    { url: "https://feeds.feedburner.com/TheHackersNews", name: "Hacker News" },
    { url: "https://krebsonsecurity.com/feed/", name: "Krebs" },
    { url: "https://arstechnica.com/security/feed/", name: "Ars Tech" }
  ];

  const container = document.getElementById("rss-container");
  if (!container) return;
  container.innerHTML = "📡 Chargement des actualités importantes...";

  const promises = feeds.map(feed =>
    fetchRSSFeed(feed.url)
      .then(data => ({ success: true, feed, items: data.items || [] }))
      .catch(error => {
        console.debug(`${feed.name} indisponible`, error);
        return { success: false, feed, items: [] };
      })
  );

  const results = await Promise.all(promises);
  const allItems = [];

  results.forEach(result => {
    result.items.forEach(item => {
      allItems.push({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        source: result.feed.name
      });
    });
  });

  if (!allItems.length) {
    // Fallback : afficher des exemples locaux si les sources sont indisponibles
    const sample = [
      { title: 'Analyse : nouvelle vulnérabilité critique (exemple)', link: '#', pubDate: new Date().toISOString(), source: 'Exemple' },
      { title: 'Tutoriel : durcir une connexion SSH', link: '#', pubDate: new Date().toISOString(), source: 'Exemple' },
      { title: 'Outil recommandé : surveillance & alerting', link: '#', pubDate: new Date().toISOString(), source: 'Exemple' }
    ];
    container.innerHTML = '<div class="rss-fallback">⚠️ Flux externes indisponibles — affichage d’exemples.</div>';
    sample.forEach(item => {
      const p = document.createElement('p');
      const date = item.pubDate ? new Date(item.pubDate).toLocaleDateString('fr-FR') : 'Date indisponible';
      p.innerHTML = `
        <a href="${item.link}" target="_blank" rel="noopener">${item.title}</a>
        <span style="color:#33e6cc;font-size:0.75rem;margin-left:8px;">[${item.source}]</span><br>
        <small style="color:#888;">${date}</small>
      `;
      container.appendChild(p);
    });
    return;
  }

  allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  container.innerHTML = "";

  allItems.slice(0, 18).forEach(item => {
    const p = document.createElement("p");
    const date = new Date(item.pubDate).toLocaleDateString('fr-FR');
    p.innerHTML = `
      <a href="${item.link}" target="_blank" rel="noopener">${item.title}</a>
      <span style="color:#33e6cc;font-size:0.75rem;margin-left:8px;">[${item.source}]</span><br>
      <small style="color:#888;">${date}</small>
    `;
    container.appendChild(p);
  });
}

loadVeilleRSS();

/* =========================
   🎮 JEU – DINO SIO (AMÉLIORÉ)
========================= */
const dinoGame = (function(){
  const canvas = $("#dino-canvas");
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return { resume(){}, pause(){}, reset(){} };

  const scoreEl = $("#score");
  const levelEl = $("#level-label");
  const msgEl   = $("#game-msg");
  const btnStart   = $(".btn-start");
  const btnRestart = $(".btn-restart");
  const btnDiff    = $(".btn-difficulty");
  const modal      = $("#diff-modal");
  const btnClose   = $(".btn-close-modal");

  const levels = ["CP","CE1","CE2","CM1","CM2","6e","5e","4e","3e","Seconde","Première","Terminale"];
  const GROUND_Y = canvas.height - 30;
  const DINO = { x: 40, y: GROUND_Y-30, w: 26, h: 30, vy: 0, onGround: true, eyeBlinkT: 0, scale: 1 };
  const GRAVITY = 1200, JUMP_VY = -520, OB_MIN_H = 22, OB_MAX_H = 46, OB_W = 22;

  // Améliorations : High Score, Combo, Particules
  let running=false, paused=true, lastTs=0, speed=220, score=0, levelIx=0, spawnT=0, spawnDelay=1.4;
  let obstacles=[], combo=0, highScore=0, particles=[], flashTime=0, lastOmittedObstacle=0;

  // Charger High Score depuis localStorage
  function loadHighScore(){
    const saved = localStorage.getItem("dinoHighScore");
    return saved ? parseInt(saved) : 0;
  }

  function saveHighScore(){
    if (score > highScore){ highScore=score; localStorage.setItem("dinoHighScore", score); }
  }

  highScore = loadHighScore();

  function reset(){
    running=false; paused=true; lastTs=0; speed=220; score=0; levelIx=0; spawnT=0; spawnDelay=1.4; obstacles=[];
    combo=0; particles=[]; flashTime=0; lastOmittedObstacle=0;
    DINO.y = GROUND_Y-30; DINO.vy=0; DINO.onGround=true; DINO.scale=1; updateHUD(); clearMsg(); render(0);
  }
  function start(){ if (running) return; running=true; paused=false; lastTs=performance.now(); requestAnimationFrame(loop); }
  function pause(){ paused=true; showMsg("⏸ Jeu en pause<br><small>Reviens quand tu veux&nbsp;!</small>"); }
  function resume(){ if (!running){ start(); return; } if (!paused) return; paused=false; clearMsg(); lastTs=performance.now(); requestAnimationFrame(loop); }

  function loop(ts){ if (!running || paused) return; const dt=Math.min(0.032,(ts-lastTs)/1000); lastTs=ts; update(dt); render(); requestAnimationFrame(loop); }

  function update(dt){
    // Réduction flash de collision
    if (flashTime > 0) flashTime -= dt;

    score += Math.floor(dt * 100); 
    
    // Bonus combo
    if (obstacles.length > 0 && obstacles[0].x < DINO.x && obstacles[0].x + obstacles[0].w < DINO.x && lastOmittedObstacle !== obstacles[0]){
      combo++;
      score += Math.floor(combo * 10);
      lastOmittedObstacle = obstacles[0];
    }

    updateProgression();
    DINO.vy += GRAVITY * dt; DINO.y += DINO.vy * dt;
    if (DINO.y >= GROUND_Y - DINO.h){ DINO.y = GROUND_Y - DINO.h; DINO.vy=0; DINO.onGround=true; }

    // Animation des yeux
    DINO.eyeBlinkT += dt;
    if (DINO.eyeBlinkT > 3) DINO.eyeBlinkT = 0;

    spawnT += dt;
    if (spawnT >= spawnDelay){
      spawnT=0; 
      const h=rnd(OB_MIN_H,OB_MAX_H);
      const type = rnd(0,2); // 3 types d'obstacles
      obstacles.push({ x: canvas.width+20, y: GROUND_Y-h, w: OB_W, h, label: levels[levelIx], type });
    }
    obstacles.forEach(o=> o.x -= speed*dt);
    obstacles = obstacles.filter(o=> o.x + o.w > -10);

    // Mise à jour des particules
    particles = particles.filter(p => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt; // Gravité
      return p.life > 0;
    });

    for (const o of obstacles){ if (intersect(DINO,o)){ gameOver(o.label); return; } }
  }

  function spawnParticles(x, y, count=6){
    for (let i=0; i<count; i++){
      const angle = (Math.PI*2 / count) * i;
      const speed = rnd(150, 250);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        life: 0.6,
        color: rnd(0,1) ? "#33e6cc" : "#7fe7ff"
      });
    }
  }

  function getObstacleColor(type){
    const colors = ["#7fe7ff", "#ff6e7f", "#ffd93d"];
    return colors[type % colors.length];
  }

  function render(){
    ctx.fillStyle="#0a1418"; ctx.fillRect(0,0,canvas.width,canvas.height);
    
    // Flash de collision
    if (flashTime > 0){
      const alpha = (flashTime / 0.3) * 0.3;
      ctx.fillStyle=`rgba(255, 110, 127, ${alpha})`;
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }

    ctx.strokeStyle="rgba(51,230,204,.35)";
    ctx.beginPath(); ctx.moveTo(0,GROUND_Y+0.5); ctx.lineTo(canvas.width,GROUND_Y+0.5); ctx.stroke();

    // ===== DINO AMÉLIORÉ =====
    ctx.save();
    ctx.translate(DINO.x + DINO.w/2, DINO.y + DINO.h/2);
    ctx.scale(DINO.scale, DINO.scale);
    
    // Corps du dino
    ctx.fillStyle="#33e6cc";
    ctx.fillRect(-DINO.w/2, -DINO.h/2, DINO.w, DINO.h);
    
    // Yeux
    const isBlinking = DINO.eyeBlinkT > 2.8 || (DINO.eyeBlinkT % 0.5 < 0.1);
    ctx.fillStyle="#081116";
    if (!isBlinking){
      ctx.fillRect(-DINO.w/2 + 4, -DINO.h/2 + 4, 4, 4);
      ctx.fillRect(-DINO.w/2 + 12, -DINO.h/2 + 4, 4, 4);
    } else {
      ctx.fillRect(-DINO.w/2 + 4, -DINO.h/2 + 6, 4, 2);
      ctx.fillRect(-DINO.w/2 + 12, -DINO.h/2 + 6, 4, 2);
    }
    
    ctx.restore();

    // ===== OBSTACLES VARIÉS =====
    obstacles.forEach(o=>{
      const color = getObstacleColor(o.type);
      ctx.fillStyle=color;
      ctx.fillRect(o.x,o.y,o.w,o.h);
      
      // Motif selon le type
      ctx.strokeStyle="rgba(255,255,255,0.3)";
      ctx.lineWidth=1;
      if (o.type === 1){
        ctx.beginPath();
        ctx.moveTo(o.x, o.y + o.h/2);
        ctx.lineTo(o.x + o.w, o.y + o.h/2);
        ctx.stroke();
      }
      
      ctx.fillStyle="#b3fff5"; 
      ctx.font="bold 11px monospace";
      ctx.fillText(o.label, o.x - 6, o.y - 6);
    });

    // ===== PARTICULES =====
    particles.forEach(p=>{
      ctx.fillStyle=p.color;
      ctx.globalAlpha = p.life / 0.6;
      ctx.fillRect(p.x, p.y, 3, 3);
    });
    ctx.globalAlpha = 1;

    // ===== HUD =====
    ctx.fillStyle="rgba(0,0,0,.15)"; ctx.fillRect(canvas.width-160,8,152,60);
    ctx.fillStyle="#cfe"; ctx.font="11px monospace";
    ctx.fillText("Score: "+score, canvas.width-150, 24);
    ctx.fillText("Niveau: "+levels[levelIx], canvas.width-150, 40);
    ctx.fillText("Combo: "+combo, canvas.width-150, 56);
    
    // Afficher High Score si battu
    if (score > highScore){
      ctx.fillStyle="#ffd93d";
      ctx.font="bold 11px monospace";
      ctx.fillText("🔥 NEW HIGH!", canvas.width-150, 72);
    } else {
      ctx.fillStyle="#999";
      ctx.font="10px monospace";
      ctx.fillText("High: "+highScore, canvas.width-150, 72);
    }
  }

  function updateProgression(){
    const ix=Math.min(levels.length-1, Math.floor(score/300));
    if (ix!==levelIx){
      levelIx=ix;
      speed=220+levelIx*32;
      spawnDelay=Math.max(0.7,1.4 - levelIx*0.06);
      updateHUD();
    } else {
      updateHUD(false);
    }
  }

  function updateHUD(force=true){ if (!scoreEl||!levelEl) return; scoreEl.textContent=score; if (force) levelEl.textContent=levels[levelIx]; }

  function gameOver(label){
    running=false; paused=true;
    flashTime = 0.3;
    spawnParticles(DINO.x + DINO.w/2, DINO.y + DINO.h/2, 8);
    saveHighScore();
    showMsg(`💥 Aïe… tu as buté sur <strong>${label}</strong>.<br>Combo: <strong>${combo}</strong> | Score: <strong>${score}</strong><br><small>⟲ Rejoue pour viser la Terminale!</small>`);
  }

  function showMsg(html){ if (!msgEl) return; msgEl.innerHTML=html; msgEl.classList.remove("hidden"); }
  function clearMsg(){ if (!msgEl) return; msgEl.classList.add("hidden"); msgEl.innerHTML=""; }

  function intersect(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
  function rnd(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function jump(){ if (!running) start(); if (DINO.onGround){ DINO.vy=-520; DINO.onGround=false; spawnParticles(DINO.x + DINO.w/2, GROUND_Y, 4); } }
  window.addEventListener("keydown", (e)=>{ if (e.code==="Space"||e.code==="ArrowUp"){ e.preventDefault(); jump(); } });
  canvas.addEventListener("pointerdown", jump);

  btnStart?.addEventListener("click", ()=> start());
  btnRestart?.addEventListener("click", ()=> { reset(); start(); });
  btnDiff?.addEventListener("click", ()=> { modal?.classList.remove("hidden"); });
  btnClose?.addEventListener("click", ()=> { modal?.classList.add("hidden"); });
  modal?.addEventListener("click", (e)=>{ if (e.target===modal) modal.classList.add("hidden"); });

  reset();
  return { resume, pause, reset };
})();

const knowledge = [
  {
    keywords: ["sd-wan", "sd wan", "wan"],
    answer: {
      definition: "Le SD-WAN est une technologie réseau permettant de gérer intelligemment le trafic entre plusieurs sites.",
      role: "Il optimise les performances, sécurise les connexions et permet une gestion centralisée.",
      example: "Exemple : une entreprise avec plusieurs agences utilise le SD-WAN pour améliorer ses connexions Internet."
    }
  },

  {
    keywords: ["firewall", "pare-feu"],
    answer: {
      definition: "Un firewall est un dispositif de sécurité qui filtre le trafic réseau.",
      role: "Il protège contre les attaques et les accès non autorisés.",
      example: "Exemple : bloquer des IP malveillantes venant d’Internet."
    }
  },

  {
    keywords: ["vlan"],
    answer: {
      definition: "Un VLAN permet de segmenter un réseau physique.",
      role: "Il améliore la sécurité et la gestion des utilisateurs.",
      example: "Exemple : séparer le réseau RH du réseau IT."
    }
  },

  {
    keywords: ["vpn"],
    answer: {
      definition: "Un VPN crée une connexion sécurisée via Internet.",
      role: "Il protège les données et permet l’accès à distance.",
      example: "Exemple : un salarié se connecte au réseau de l’entreprise depuis chez lui."
    }
  },

  {
    keywords: ["dns"],
    answer: {
      definition: "Le DNS traduit un nom de domaine en adresse IP.",
      role: "Il permet d’accéder aux sites facilement.",
      example: "Exemple : google.com → adresse IP."
    }
  }
];

function ajouterMessage(text, type) {
  const chat = document.getElementById("chat-box");
  if (!chat) return;

  const msg = document.createElement("div");
  msg.classList.add("message", type);
  msg.innerText = text;

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function repondre() {
  let input = document.getElementById("question").value.toLowerCase();

  // ✅ FIX BUG ESPACE (IMPORTANT)
  if (!input || input.trim() === "") return;

  ajouterMessage(input, "user");

  let found = false;

  for (let item of knowledge) {
    for (let keyword of item.keywords) {
      if (input.includes(keyword)) {
        let response =
          "📘 Définition : " + item.answer.definition +
          "\n\n🎯 Rôle : " + item.answer.role +
          "\n\n💡 Exemple : " + item.answer.example;

        ajouterMessage(response, "bot");
        found = true;
        break;
      }
    }
    if (found) break;
  }

  if (!found) {
    ajouterMessage("❌ Terme non trouvé. Essaie avec un terme comme : firewall, VLAN, VPN…", "bot");
  }

  document.getElementById("question").value = ""; // reset input
}

function initAIAssistant() {
  const modal = document.getElementById("assistant-modal");
  const toggle = document.getElementById("assistant-toggle");
  const closeButton = document.getElementById("assistant-close");
  const input = document.getElementById("question");
  const button = document.getElementById("assistant-send");
  const chatBox = document.getElementById("chat-box");
  if (!modal || !toggle || !closeButton || !input || !button || !chatBox) return;

  const setModalOpen = (open) => {
    modal.classList.toggle("hidden", !open);
    modal.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) {
      input.focus();
    }
  };

  const addMessage = (text, type) => {
    const msg = document.createElement("div");
    msg.classList.add("message", type);
    msg.innerText = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  const findDefinition = (text) => {
    const lower = text.toLowerCase();
    if (/\bsd[\s-]?wan\b/.test(lower)) return knowledge[0].answer;
    if (/\bfirewall\b/.test(lower) || /\bpare[- ]?feu\b/.test(lower)) return knowledge[1].answer;
    if (/\bvlan\b/.test(lower)) return knowledge[2].answer;
    if (/\bvpn\b/.test(lower)) return knowledge[3].answer;
    if (/\bdns\b/.test(lower)) return knowledge[4].answer;
    return null;
  };

  const answerTerm = () => {
    const raw = input.value;
    if (!raw || !/\S/.test(raw)) return;

    addMessage(raw, "user");
    input.value = "";

    const definition = findDefinition(raw);
    if (definition) {
      const response =
        "📘 Définition : " + definition.definition +
        "\n\n🎯 Rôle : " + definition.role +
        "\n\n💡 Exemple : " + definition.example;
      addMessage(response, "bot");
      return;
    }

    addMessage("❌ Terme non trouvé. Essaie avec un terme comme : firewall, VLAN, VPN, DNS…", "bot");
  };

  window.repondre = answerTerm;
  toggle.addEventListener("click", () => setModalOpen(true));
  closeButton.addEventListener("click", () => setModalOpen(false));
  modal.addEventListener("click", (e) => { if (e.target === modal) setModalOpen(false); });
  button.addEventListener("click", answerTerm);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      answerTerm();
    }
  });
}


document.addEventListener("DOMContentLoaded", () => {
  initAIAssistant();

  // ✅ section active au départ
  const current = document.querySelector(".section.active")?.id || "home";

  // ✅ applique le fond IMMEDIATEMENT
  document.body.classList.add("bg-" + current);

  // ✅ lance la logique complète
  goTo(current);

  // 🔥 IMPORTANT
});
/* ===== LIGHTBOX PRO ===== */
const galleryImages = Array.from(document.querySelectorAll(".schema-gallery img"));
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const btnPrev = document.querySelector(".lightbox-prev");
const btnNext = document.querySelector(".lightbox-next");
const btnClose = document.querySelector(".lightbox-close");

let currentIndex = 0;

function openLightbox(index){
  currentIndex = index;
  lightboxImg.src = galleryImages[index].src;
  lightbox.classList.remove("hidden");
}

function closeLightbox(){
  lightbox.classList.add("hidden");
}

function nextImg(){
  currentIndex = (currentIndex + 1) % galleryImages.length;
  lightboxImg.src = galleryImages[currentIndex].src;
}

function prevImg(){
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  lightboxImg.src = galleryImages[currentIndex].src;
}

galleryImages.forEach((img, i)=>{
  img.addEventListener("click", ()=> openLightbox(i));
});

btnClose.addEventListener("click", closeLightbox);
btnNext.addEventListener("click", nextImg);
btnPrev.addEventListener("click", prevImg);

lightbox.addEventListener("click", (e)=>{
  if (e.target === lightbox) closeLightbox();
});

window.addEventListener("keydown", (e)=>{
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") nextImg();
  if (e.key === "ArrowLeft") prevImg();
});
// 📱 Menu burger mobile + overlay
const burger  = document.querySelector(".burger-btn");
const sidebar = document.querySelector(".sidebar");
const overlay = document.querySelector(".mobile-overlay");

burger?.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay?.classList.toggle("active");
});

// Clic sur l’overlay = fermeture du menu
overlay?.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
});
