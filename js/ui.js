/* =====================================================
   ui.js — Interactions UI : lightbox et le fond animé
   (circuit imprimé).
===================================================== */

import { $, $$ } from './utils.js';

/* ---- Lightbox visionneuse d'images ---- */

export function initLightbox() {
  const galleryImages = $$('.schema-gallery img');
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightbox-img');
  const btnClose      = document.querySelector('.lightbox-close');
  const btnPrev       = document.querySelector('.lightbox-prev');
  const btnNext       = document.querySelector('.lightbox-next');

  if (!lightbox || !galleryImages.length) return;

  let currentIndex = 0;

  function showImg(index) {
    currentIndex = index;
    lightboxImg.src = galleryImages[index].src;
    lightboxImg.alt = galleryImages[index].alt || '';
  }

  function openLightbox(index) {
    showImg(index);
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    btnClose?.focus();
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  function nextImg() {
    if (!galleryImages.length) return;
    showImg((currentIndex + 1) % galleryImages.length);
  }

  function prevImg() {
    if (!galleryImages.length) return;
    showImg((currentIndex - 1 + galleryImages.length) % galleryImages.length);
  }

  // Clic sur chaque image de la galerie
  galleryImages.forEach((img, i) => img.addEventListener('click', () => openLightbox(i)));

  // Contrôles lightbox
  btnClose?.addEventListener('click', closeLightbox);
  btnNext?.addEventListener('click',  nextImg);
  btnPrev?.addEventListener('click',  prevImg);

  // Clic sur le fond = fermeture
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  // Clavier (seulement quand la lightbox est ouverte)
  window.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') nextImg();
    if (e.key === 'ArrowLeft')  prevImg();
  });
}

/* ---- Fond animé : circuit imprimé (PCB) avec pulses électriques (canvas) ---- */

export function initNetworkCanvas(){
/* roundRect polyfill for older Safari */
if(!CanvasRenderingContext2D.prototype.roundRect){CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.min(r,w/2,h/2);this.moveTo(x+r,y);this.lineTo(x+w-r,y);this.quadraticCurveTo(x+w,y,x+w,y+r);this.lineTo(x+w,y+h-r);this.quadraticCurveTo(x+w,y+h,x+w-r,y+h);this.lineTo(x+r,y+h);this.quadraticCurveTo(x,y+h,x,y+h-r);this.lineTo(x,y+r);this.quadraticCurveTo(x,y,x+r,y);this.closePath();};}
const cv=document.getElementById('bg-canvas'),c=cv.getContext('2d');
let W,H,raf,frame=0,nodes=[],edges=[],packets=[],formulas=[],textZone=null;
const TEAL='#00f5d4',ORG='#ff6b35',PRP='#7b61ff';

/* Repère la zone de texte actuellement à l'écran (colonne de titre du hero)
   pour que le fond s'efface doucement dessous et ne gêne pas la lecture. */
function computeTextZone(){
  const el=document.querySelector('.hero-title')?.closest('.hero-grid > div');
  if(!el){ textZone=null; return; }
  const r=el.getBoundingClientRect();
  textZone={x:r.left,y:r.top,w:r.width,h:r.height};
}
/* 1 = intensité normale, ~0.15 = fondu doux sous la zone de texte repérée */
function quiet(x,y){
  if(!textZone) return 1;
  const pad=110;
  const left=textZone.x-pad,right=textZone.x+textZone.w+pad;
  const top=textZone.y-pad,bottom=textZone.y+textZone.h+pad;
  if(x<left||x>right||y<top||y>bottom) return 1;
  const d=Math.min(x-left,right-x,y-top,bottom-y);
  const t=Math.min(1,d/pad);
  return 1-t*.85;
}

/* Formules scientifiques célèbres, flottant doucement en arrière-plan */
const FORMULAS=[
  'E = mc²',
  'V(φ) = -μ²|φ|² + λ|φ|⁴',
  'iħ ∂ψ/∂t = Ĥψ',
  'e^{iπ} + 1 = 0',
  '∇ × B = μ₀J + μ₀ε₀ ∂E/∂t',
  'a² + b² = c²',
  'F = G·(m₁m₂)/r²',
  'ΔS ≥ 0'
];
const FCOL=[TEAL,PRP,ORG];

/* Via/pastille : pad carré + trou métallisé */
function drawVia(x,y,r,a,col){
  c.save();c.globalAlpha=a;
  c.beginPath();c.roundRect(x-r*.6,y-r*.6,r*1.2,r*1.2,2);
  c.strokeStyle=col;c.fillStyle=col+'22';c.lineWidth=1;c.fill();c.stroke();
  c.beginPath();c.arc(x,y,r*.28,0,Math.PI*2);
  c.fillStyle='#080c14';c.fill();c.strokeStyle=col;c.lineWidth=.8;c.stroke();
  c.restore();
}
/* Puce : boîtier + broches courtes de part et d'autre */
function drawChip(x,y,r,a,col){
  c.save();c.globalAlpha=a;
  const w=r*2.2,h=r*1.5;
  c.beginPath();c.roundRect(x-w/2,y-h/2,w,h,2);
  c.strokeStyle=col;c.fillStyle=col+'18';c.lineWidth=1;c.fill();c.stroke();
  for(let i=0;i<3;i++){
    const py=y-h/2+(h/4)*(i+1);
    c.beginPath();c.moveTo(x-w/2-4,py);c.lineTo(x-w/2,py);c.strokeStyle=col;c.lineWidth=1;c.stroke();
    c.beginPath();c.moveTo(x+w/2,py);c.lineTo(x+w/2+4,py);c.stroke();
  }
  c.beginPath();c.arc(x-w/2+4,y-h/2+4,1.3,0,Math.PI*2);c.fillStyle=col;c.fill();
  c.restore();
}

/* Géométrie des pistes : tracé en angle droit (Manhattan) entre deux pastilles */
function computeEdgeGeometry(e){
  const a=nodes[e.a],b=nodes[e.b];
  const bend=e.horizFirst?{x:b.x,y:a.y}:{x:a.x,y:b.y};
  e.bend=bend;
  e.len1=Math.hypot(bend.x-a.x,bend.y-a.y);
  e.len2=Math.hypot(b.x-bend.x,b.y-bend.y);
  e.total=(e.len1+e.len2)||1;
}
function edgePoint(e,t){
  const a=nodes[e.a],b=nodes[e.b];
  const d=Math.max(0,Math.min(1,t))*e.total;
  if(d<=e.len1){
    const lt=e.len1?d/e.len1:0;
    return {x:a.x+(e.bend.x-a.x)*lt,y:a.y+(e.bend.y-a.y)*lt};
  }
  const lt=e.len2?(d-e.len1)/e.len2:0;
  return {x:e.bend.x+(b.x-e.bend.x)*lt,y:e.bend.y+(b.y-e.bend.y)*lt};
}

function build(){
  nodes=[];edges=[];packets=[];
  const cnt=Math.max(16,Math.floor(W*H/65000)+10);
  for(let i=0;i<cnt;i++){
    nodes.push({
      x:60+Math.random()*(W-120),y:60+Math.random()*(H-120),
      r:9+Math.random()*6,
      type:Math.random()<.16?'chip':'via',
      col:Math.random()<.14?ORG:(Math.random()<.32?PRP:TEAL),
      ph:Math.random()*Math.PI*2,glow:0
    });
  }
  nodes.forEach((n,i)=>{
    const ds=nodes.map((m,j)=>({j,d:Math.hypot(n.x-m.x,n.y-m.y)}))
      .filter(d=>d.j!==i).sort((a,b)=>a.d-b.d);
    ds.slice(0,3+(Math.random()<.4?1:0)).forEach(({j})=>{
      if(!edges.find(e=>(e.a===i&&e.b===j)||(e.a===j&&e.b===i))){
        const e={a:i,b:j,horizFirst:Math.random()<.5};
        computeEdgeGeometry(e);
        edges.push(e);
      }
    });
  });
  edges.forEach(e=>{
    if(Math.random()<.6) packets.push({
      ei:edges.indexOf(e),t:Math.random(),
      spd:.0035+Math.random()*.0045,
      dir:Math.random()<.5?1:-1,
      col:Math.random()<.14?ORG:(Math.random()<.32?PRP:TEAL)
    });
  });

  const fcnt=Math.max(4,Math.min(13,Math.floor(W*H/150000)));
  const pool=[...FORMULAS].sort(()=>Math.random()-.5);
  formulas=[];
  for(let i=0;i<fcnt;i++){
    formulas.push({
      x:Math.random()*W,y:Math.random()*H,
      vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,
      text:pool[i%pool.length],
      size:13+Math.random()*5,
      ph:Math.random()*Math.PI*2,
      col:FCOL[Math.floor(Math.random()*FCOL.length)]
    });
  }
}

function loop(){
  frame++;
  c.fillStyle='#080c14';c.fillRect(0,0,W,H);
  [{x:.15,y:.3,r:.42,col:'rgba(0,245,212,.018)'},{x:.85,y:.65,r:.38,col:'rgba(0,180,216,.014)'}].forEach(o=>{
    const g=c.createRadialGradient(o.x*W,o.y*H,0,o.x*W,o.y*H,o.r*W);
    g.addColorStop(0,o.col);g.addColorStop(1,'transparent');
    c.fillStyle=g;c.fillRect(0,0,W,H);
  });
  /* Formules scientifiques flottantes */
  formulas.forEach(f=>{
    f.x+=f.vx;f.y+=f.vy;
    if(f.x<-160)f.x=W+160;if(f.x>W+160)f.x=-160;
    if(f.y<-30)f.y=H+30;if(f.y>H+30)f.y=-30;
    const a=(.13+.08*Math.sin(f.ph+frame*.012))*quiet(f.x,f.y);
    c.save();c.globalAlpha=a;c.font=`${f.size}px "JetBrains Mono",monospace`;
    c.fillStyle=f.col;c.textAlign='center';
    c.shadowBlur=5;c.shadowColor=f.col;
    c.fillText(f.text,f.x,f.y);
    c.restore();
    f.ph+=.01;
  });
  /* Pistes de circuit imprimé (tracé en angle droit) */
  edges.forEach(e=>{
    const a=nodes[e.a],b=nodes[e.b];
    c.save();c.globalAlpha=.06*quiet(e.bend.x,e.bend.y);c.strokeStyle=TEAL;c.lineWidth=1;
    c.beginPath();c.moveTo(a.x,a.y);c.lineTo(e.bend.x,e.bend.y);c.lineTo(b.x,b.y);c.stroke();
    c.restore();
  });
  /* Pulses électriques voyageant le long des pistes (avec traînée) */
  packets.forEach(p=>{
    const e=edges[p.ei];if(!e)return;
    const pos=edgePoint(e,p.t);
    const tail=edgePoint(e,p.t-p.spd*p.dir*6);
    const q=quiet(pos.x,pos.y);
    c.save();
    const trail=c.createLinearGradient(tail.x,tail.y,pos.x,pos.y);
    trail.addColorStop(0,p.col+'00');trail.addColorStop(1,p.col+'cc');
    c.strokeStyle=trail;c.lineWidth=1.5;c.globalAlpha=.65*q;
    c.beginPath();c.moveTo(tail.x,tail.y);c.lineTo(pos.x,pos.y);c.stroke();
    c.shadowBlur=7;c.shadowColor=p.col;c.globalAlpha=.75*q;
    c.fillStyle=p.col;c.beginPath();c.arc(pos.x,pos.y,2.3,0,Math.PI*2);c.fill();
    c.restore();
    p.t+=p.spd*p.dir;
    if(p.t>1||p.t<0){p.dir*=-1;p.t=Math.max(0,Math.min(1,p.t));
      const ni=p.dir===1?e.a:e.b;if(nodes[ni])nodes[ni].glow=1;}
  });
  /* Pastilles et puces */
  nodes.forEach(n=>{
    const a=(.28+.12*Math.sin(n.ph+frame*.018))*quiet(n.x,n.y);
    if(n.glow>0){
      c.save();c.globalAlpha=n.glow*.2*quiet(n.x,n.y);c.shadowBlur=14;c.shadowColor=n.col;
      c.beginPath();c.arc(n.x,n.y,n.r+8,0,Math.PI*2);
      c.strokeStyle=n.col;c.lineWidth=1.5;c.stroke();
      c.restore();n.glow=Math.max(0,n.glow-.025);
    }
    (n.type==='chip'?drawChip:drawVia)(n.x,n.y,n.r,a,n.col);
    n.ph+=.008;
  });
  if(frame%20===0) computeTextZone();
  raf=requestAnimationFrame(loop);
}

function init(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;build();computeTextZone();loop();}
let scrollT=false;
window.addEventListener('scroll',()=>{
  if(scrollT) return;
  scrollT=true;
  requestAnimationFrame(()=>{ computeTextZone(); scrollT=false; });
},{passive:true});
let resizeT;
window.addEventListener('resize',()=>{
  clearTimeout(resizeT);
  resizeT=setTimeout(()=>{
    const newW=window.innerWidth,newH=window.innerHeight;
    /* Mobile browsers fire resize when the address bar shows/hides while
       scrolling (height-only change) — skip the rebuild in that case so
       the background doesn't jank/reset on every scroll. */
    if(newW===W && Math.abs(newH-H)<100) return;
    cancelAnimationFrame(raf);
    W=cv.width=newW;H=cv.height=newH;build();loop();
  },150);
});
init();
}
