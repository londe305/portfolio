/* =====================================================
   game.js — Jeu Dino SIO
===================================================== */

import { $ } from './utils.js';

export function initGame() {
  const canvas = $('#dino-canvas');
  const ctx    = canvas?.getContext('2d');
  if (!canvas || !ctx) return { resume() {}, pause() {}, reset() {} };

  const scoreEl   = $('#score');
  const levelEl   = $('#level-label');
  const msgEl     = $('#game-msg');
  const btnStart   = $('.btn-start');
  const btnRestart = $('.btn-restart');
  const btnDiff    = $('.btn-difficulty');
  const modal      = $('#diff-modal');
  const btnClose   = $('.btn-close-modal');

  const levels   = ['CP','CE1','CE2','CM1','CM2','6e','5e','4e','3e','Seconde','Première','Terminale'];
  const GROUND_Y = canvas.height - 30;
  const DINO     = { x: 40, y: GROUND_Y - 30, w: 26, h: 30, vy: 0, onGround: true, eyeBlinkT: 0, scale: 1 };
  const GRAVITY  = 1200, JUMP_VY = -520, OB_MIN_H = 22, OB_MAX_H = 46, OB_W = 22;

  let running = false, paused = true, lastTs = 0, speed = 220, score = 0, levelIx = 0,
      spawnT = 0, spawnDelay = 1.4, obstacles = [], combo = 0, highScore = 0,
      particles = [], flashTime = 0, lastOmittedObstacle = null;

  function loadHighScore() {
    const saved = localStorage.getItem('dinoHighScore');
    return saved ? parseInt(saved, 10) : 0;
  }
  function saveHighScore() {
    if (score > highScore) { highScore = score; localStorage.setItem('dinoHighScore', score); }
  }
  highScore = loadHighScore();

  function reset() {
    running = false; paused = true; lastTs = 0; speed = 220; score = 0; levelIx = 0;
    spawnT = 0; spawnDelay = 1.4; obstacles = []; combo = 0; particles = [];
    flashTime = 0; lastOmittedObstacle = null;
    DINO.y = GROUND_Y - 30; DINO.vy = 0; DINO.onGround = true; DINO.scale = 1;
    updateHUD(); clearMsg(); render();
  }

  function start() {
    if (running) return;
    running = true; paused = false; lastTs = performance.now();
    requestAnimationFrame(loop);
  }

  function pause() {
    paused = true;
    showMsg('⏸ Jeu en pause<br><small>Reviens quand tu veux&nbsp;!</small>');
  }

  function resume() {
    if (!running) { start(); return; }
    if (!paused) return;
    paused = false; clearMsg(); lastTs = performance.now();
    requestAnimationFrame(loop);
  }

  function loop(ts) {
    if (!running || paused) return;
    const dt = Math.min(0.032, (ts - lastTs) / 1000);
    lastTs = ts;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function update(dt) {
    if (flashTime > 0) flashTime -= dt;

    score += Math.floor(dt * 100);

    if (obstacles.length > 0 && obstacles[0].x + obstacles[0].w < DINO.x
        && lastOmittedObstacle !== obstacles[0]) {
      combo++;
      score += Math.floor(combo * 10);
      lastOmittedObstacle = obstacles[0];
    }

    updateProgression();

    DINO.vy += GRAVITY * dt;
    DINO.y  += DINO.vy * dt;
    if (DINO.y >= GROUND_Y - DINO.h) { DINO.y = GROUND_Y - DINO.h; DINO.vy = 0; DINO.onGround = true; }

    DINO.eyeBlinkT += dt;
    if (DINO.eyeBlinkT > 3) DINO.eyeBlinkT = 0;

    spawnT += dt;
    if (spawnT >= spawnDelay) {
      spawnT = 0;
      const h    = rnd(OB_MIN_H, OB_MAX_H);
      const type = rnd(0, 2);
      obstacles.push({ x: canvas.width + 20, y: GROUND_Y - h, w: OB_W, h, label: levels[levelIx], type });
    }
    obstacles.forEach(o => { o.x -= speed * dt; });
    obstacles = obstacles.filter(o => o.x + o.w > -10);

    particles = particles.filter(p => {
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt;
      return p.life > 0;
    });

    for (const o of obstacles) { if (intersect(DINO, o)) { gameOver(o.label); return; } }
  }

  function spawnParticles(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const s     = rnd(150, 250);
      particles.push({
        x, y,
        vx:    Math.cos(angle) * s,
        vy:    Math.sin(angle) * s - 100,
        life:  0.6,
        color: rnd(0, 1) ? '#33e6cc' : '#7fe7ff'
      });
    }
  }

  function getObstacleColor(type) {
    return ['#7fe7ff', '#ff6e7f', '#ffd93d'][type % 3];
  }

  function render() {
    ctx.fillStyle = '#0a1418';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (flashTime > 0) {
      ctx.fillStyle = `rgba(255, 110, 127, ${(flashTime / 0.3) * 0.3})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.strokeStyle = 'rgba(51,230,204,.35)';
    ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 0.5); ctx.lineTo(canvas.width, GROUND_Y + 0.5); ctx.stroke();

    // Dino
    ctx.save();
    ctx.translate(DINO.x + DINO.w / 2, DINO.y + DINO.h / 2);
    ctx.scale(DINO.scale, DINO.scale);
    ctx.fillStyle = '#33e6cc';
    ctx.fillRect(-DINO.w / 2, -DINO.h / 2, DINO.w, DINO.h);
    ctx.fillStyle = '#081116';
    const isBlinking = DINO.eyeBlinkT > 2.8 || (DINO.eyeBlinkT % 0.5 < 0.1);
    if (!isBlinking) {
      ctx.fillRect(-DINO.w / 2 + 4,  -DINO.h / 2 + 4, 4, 4);
      ctx.fillRect(-DINO.w / 2 + 12, -DINO.h / 2 + 4, 4, 4);
    } else {
      ctx.fillRect(-DINO.w / 2 + 4,  -DINO.h / 2 + 6, 4, 2);
      ctx.fillRect(-DINO.w / 2 + 12, -DINO.h / 2 + 6, 4, 2);
    }
    ctx.restore();

    // Obstacles
    obstacles.forEach(o => {
      ctx.fillStyle = getObstacleColor(o.type);
      ctx.fillRect(o.x, o.y, o.w, o.h);
      if (o.type === 1) {
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(o.x, o.y + o.h / 2); ctx.lineTo(o.x + o.w, o.y + o.h / 2); ctx.stroke();
      }
      ctx.fillStyle = '#b3fff5'; ctx.font = 'bold 11px monospace';
      ctx.fillText(o.label, o.x - 6, o.y - 6);
    });

    // Particules
    particles.forEach(p => {
      ctx.fillStyle = p.color; ctx.globalAlpha = p.life / 0.6;
      ctx.fillRect(p.x, p.y, 3, 3);
    });
    ctx.globalAlpha = 1;

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(canvas.width - 160, 8, 152, 64);
    ctx.fillStyle = '#cfe'; ctx.font = '11px monospace';
    ctx.fillText('Score: ' + score,          canvas.width - 150, 24);
    ctx.fillText('Niveau: ' + levels[levelIx], canvas.width - 150, 40);
    ctx.fillText('Combo: ' + combo,          canvas.width - 150, 56);
    if (score > highScore) {
      ctx.fillStyle = '#ffd93d'; ctx.font = 'bold 11px monospace';
      ctx.fillText('🔥 NEW HIGH!', canvas.width - 150, 72);
    } else {
      ctx.fillStyle = '#999'; ctx.font = '10px monospace';
      ctx.fillText('High: ' + highScore, canvas.width - 150, 72);
    }
  }

  function updateProgression() {
    const ix = Math.min(levels.length - 1, Math.floor(score / 300));
    if (ix !== levelIx) {
      levelIx    = ix;
      speed      = 220 + levelIx * 32;
      spawnDelay = Math.max(0.7, 1.4 - levelIx * 0.06);
    }
    updateHUD();
  }

  function updateHUD() {
    if (scoreEl) scoreEl.textContent = score;
    if (levelEl) levelEl.textContent = levels[levelIx];
  }

  function gameOver(label) {
    running = false; paused = true; flashTime = 0.3;
    spawnParticles(DINO.x + DINO.w / 2, DINO.y + DINO.h / 2, 8);
    saveHighScore();
    showMsg(`💥 Aïe… tu as buté sur <strong>${label}</strong>.<br>Combo: <strong>${combo}</strong> | Score: <strong>${score}</strong><br><small>⟲ Rejoue pour viser la Terminale!</small>`);
  }

  function showMsg(html) { if (!msgEl) return; msgEl.innerHTML = html; msgEl.classList.remove('hidden'); }
  function clearMsg()    { if (!msgEl) return; msgEl.innerHTML = ''; msgEl.classList.add('hidden'); }
  function intersect(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function jump() {
    if (!running) start();
    if (DINO.onGround) { DINO.vy = JUMP_VY; DINO.onGround = false; spawnParticles(DINO.x + DINO.w / 2, GROUND_Y, 4); }
  }

  // Contrôles clavier
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
  });

  // Contrôles tactiles/souris sur le canvas (compatible mobile)
  canvas.addEventListener('pointerdown', jump);
  canvas.addEventListener('touchstart',  (e) => { e.preventDefault(); jump(); }, { passive: false });

  // Boutons UI
  btnStart?.addEventListener('click',   ()  => start());
  btnRestart?.addEventListener('click', ()  => { reset(); start(); });
  btnDiff?.addEventListener('click',    ()  => modal?.classList.remove('hidden'));
  btnClose?.addEventListener('click',   ()  => modal?.classList.add('hidden'));
  modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

  reset();
  return { resume, pause, reset };
}
