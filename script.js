// Helpers
const $  = (s, r=document)=> r.querySelector(s);
const $$ = (s, r=document)=> Array.from(r.querySelectorAll(s));

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

document.addEventListener("DOMContentLoaded", () => {
  // Initialize AI assistant safely
  try { initAIAssistant(); } catch (e) { /* noop if not present */ }

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
