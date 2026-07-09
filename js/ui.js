/* =====================================================
   ui.js — Interactions UI : lightbox et le fond animé
   (équipements réseau).
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

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = galleryImages[index].src;
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
    currentIndex = (currentIndex + 1) % galleryImages.length;
    lightboxImg.src = galleryImages[currentIndex].src;
  }

  function prevImg() {
    if (!galleryImages.length) return;
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentIndex].src;
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

/* ---- Fond animé : équipements réseau (canvas) ---- */

export function initNetworkCanvas(){
/* roundRect polyfill for older Safari */
if(!CanvasRenderingContext2D.prototype.roundRect){CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.min(r,w/2,h/2);this.moveTo(x+r,y);this.lineTo(x+w-r,y);this.quadraticCurveTo(x+w,y,x+w,y+r);this.lineTo(x+w,y+h-r);this.quadraticCurveTo(x+w,y+h,x+w-r,y+h);this.lineTo(x+r,y+h);this.quadraticCurveTo(x,y+h,x,y+h-r);this.lineTo(x,y+r);this.quadraticCurveTo(x,y,x+r,y);this.closePath();};}
const cv=document.getElementById('bg-canvas'),c=cv.getContext('2d');
let W,H,raf,frame=0,nodes=[],edges=[],packets=[];
const TEAL='#00f5d4',ORG='#ff6b35',PRP='#7b61ff';

function drawRouter(x,y,r,a){
  c.save();c.globalAlpha=a;
  c.beginPath();c.arc(x,y,r,0,Math.PI*2);
  c.strokeStyle=TEAL;c.fillStyle='rgba(0,245,212,.07)';c.lineWidth=1;c.fill();c.stroke();
  [[0,-1],[1,0],[0,1],[-1,0]].forEach(([dx,dy])=>{
    const ex=x+dx*r*1.38,ey=y+dy*r*1.38;
    c.beginPath();c.moveTo(x+dx*r*.6,y+dy*r*.6);c.lineTo(ex,ey);
    c.strokeStyle=TEAL;c.lineWidth=.9;c.stroke();
    const ag=Math.atan2(dy,dx);
    c.beginPath();c.moveTo(ex,ey);
    c.lineTo(ex-r*.27*Math.cos(ag-.5),ey-r*.27*Math.sin(ag-.5));
    c.lineTo(ex-r*.27*Math.cos(ag+.5),ey-r*.27*Math.sin(ag+.5));
    c.closePath();c.fillStyle=TEAL;c.fill();
  });
  c.restore();
}
function drawSwitch(x,y,r,a){
  c.save();c.globalAlpha=a;
  const w=r*2.4,h=r*1.1;
  c.beginPath();c.roundRect(x-w/2,y-h/2,w,h,3);
  c.strokeStyle=TEAL;c.fillStyle='rgba(0,245,212,.06)';c.lineWidth=1;c.fill();c.stroke();
  for(let i=0;i<6;i++){
    const px=x-w*.38+i*(w*.76/5);
    c.beginPath();c.arc(px,y+1,2.2,0,Math.PI*2);
    c.fillStyle=i<4?'rgba(0,245,212,.7)':'rgba(255,107,53,.6)';c.fill();
  }
  c.restore();
}
function drawFirewall(x,y,r,a){
  c.save();c.globalAlpha=a;
  c.beginPath();c.moveTo(x,y-r);
  c.bezierCurveTo(x+r*.9,y-r*.75,x+r*.9,y+r*.1,x,y+r*.9);
  c.bezierCurveTo(x-r*.9,y+r*.1,x-r*.9,y-r*.75,x,y-r);
  c.strokeStyle=ORG;c.fillStyle='rgba(255,107,53,.07)';c.lineWidth=1;c.fill();c.stroke();
  c.beginPath();c.moveTo(x-r*.28,y+r*.05);c.lineTo(x-r*.02,y+r*.38);c.lineTo(x+r*.35,y-r*.22);
  c.strokeStyle=ORG;c.lineWidth=1.4;c.stroke();
  c.restore();
}
function drawServer(x,y,r,a){
  c.save();c.globalAlpha=a;
  const w=r*1.7,row=r*.58;
  for(let i=0;i<3;i++){
    const ry=y-r*.85+i*row;
    c.beginPath();c.roundRect(x-w/2,ry,w,row-2,2);
    c.strokeStyle=PRP;c.fillStyle='rgba(123,97,255,.07)';c.lineWidth=.9;c.fill();c.stroke();
    c.beginPath();c.arc(x+w*.36,ry+row/2-1,2,0,Math.PI*2);
    c.fillStyle=i===0?'rgba(0,245,212,.85)':'rgba(123,97,255,.5)';c.fill();
  }
  c.restore();
}
function drawPC(x,y,r,a){
  c.save();c.globalAlpha=a;
  const mw=r*1.9,mh=r*1.3;
  c.beginPath();c.roundRect(x-mw/2,y-mh/2-3,mw,mh,3);
  c.strokeStyle='rgba(0,245,212,.45)';c.fillStyle='rgba(0,245,212,.04)';c.lineWidth=.9;c.fill();c.stroke();
  if(frame%60<35){c.beginPath();c.moveTo(x-mw*.18,y+mh*.1);c.lineTo(x-mw*.08,y+mh*.1);c.strokeStyle='rgba(0,245,212,.6)';c.lineWidth=1;c.stroke();}
  c.beginPath();c.moveTo(x,y+mh/2-3);c.lineTo(x,y+mh/2+5);c.moveTo(x-r*.4,y+mh/2+5);c.lineTo(x+r*.4,y+mh/2+5);
  c.strokeStyle='rgba(0,245,212,.35)';c.stroke();
  c.restore();
}
function drawAP(x,y,r,a){
  c.save();c.globalAlpha=a;
  for(let i=0;i<3;i++){
    c.beginPath();c.arc(x,y+r*.1,r*(.35+i*.3),-Math.PI*.78,-Math.PI*.22);
    c.strokeStyle=`rgba(0,245,212,${.55-i*.12})`;c.lineWidth=1;c.stroke();
  }
  c.beginPath();c.arc(x,y+r*.1,2.5,0,Math.PI*2);c.fillStyle=TEAL;c.fill();
  c.restore();
}

const FN={router:drawRouter,switch:drawSwitch,firewall:drawFirewall,server:drawServer,pc:drawPC,ap:drawAP};
const COL={router:TEAL,switch:TEAL,firewall:ORG,server:PRP,pc:TEAL,ap:TEAL};
const LBL={
  router:['Core-R','Edge-R','R1','R2','BGP-R'],
  switch:['SW-Core','SW-Dist','L3-SW','Access-1','SW2'],
  firewall:['ASA-5505','FortiGate','FW-DMZ','PFSense'],
  server:['Zabbix','DC01','SRV-01','AD-DS','NTP'],
  pc:['WS-01','Client','HOST-A','PC-Sec'],
  ap:['AP-RDC','AP-1F','WAP-Conf','WiFi6']
};
function rndLbl(t){const l=LBL[t];return l[Math.floor(Math.random()*l.length)];}

function build(){
  nodes=[];edges=[];packets=[];
  const cnt=Math.max(10,Math.floor(W*H/90000)+6);
  const tps=['router','switch','firewall','server','pc','pc','pc','ap'];
  const forced=['firewall','router','server','switch'];
  for(let i=0;i<cnt;i++){
    nodes.push({x:70+Math.random()*(W-140),y:70+Math.random()*(H-140),
      type:i<forced.length?forced[i]:tps[Math.floor(Math.random()*tps.length)],
      ph:Math.random()*Math.PI*2,glow:0,label:''});
  }
  nodes.forEach(n=>{n.label=rndLbl(n.type);});
  nodes.forEach((n,i)=>{
    const ds=nodes.map((m,j)=>({j,d:Math.hypot(n.x-m.x,n.y-m.y)}))
      .filter(d=>d.j!==i).sort((a,b)=>a.d-b.d);
    ds.slice(0,2+(Math.random()<.3?1:0)).forEach(({j})=>{
      if(!edges.find(e=>(e.a===i&&e.b===j)||(e.a===j&&e.b===i)))
        edges.push({a:i,b:j,off:0});
    });
  });
  edges.forEach(e=>{
    if(Math.random()<.55) packets.push({
      ei:edges.indexOf(e),t:Math.random(),
      spd:.0025+Math.random()*.003,
      dir:Math.random()<.5?1:-1,
      col:Math.random()<.12?ORG:TEAL
    });
  });
}

function loop(){
  frame++;
  c.fillStyle='#080c14';c.fillRect(0,0,W,H);
  [{x:.15,y:.3,r:.42,col:'rgba(0,245,212,.018)'},{x:.85,y:.65,r:.38,col:'rgba(0,180,216,.014)'}].forEach(o=>{
    const g=c.createRadialGradient(o.x*W,o.y*H,0,o.x*W,o.y*H,o.r*W);
    g.addColorStop(0,o.col);g.addColorStop(1,'transparent');
    c.fillStyle=g;c.fillRect(0,0,W,H);
  });
  /* Edges */
  edges.forEach(e=>{
    const a=nodes[e.a],b=nodes[e.b];e.off-=.18;
    c.save();c.globalAlpha=.055;c.strokeStyle=TEAL;c.lineWidth=.55;
    c.setLineDash([5,9]);c.lineDashOffset=e.off;
    c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
    c.setLineDash([]);c.restore();
  });
  /* Packets */
  packets.forEach(p=>{
    const e=edges[p.ei];if(!e)return;
    const a=nodes[e.a],b=nodes[e.b];
    const x=a.x+(b.x-a.x)*p.t,y=a.y+(b.y-a.y)*p.t;
    c.save();c.globalAlpha=.82;c.shadowBlur=10;c.shadowColor=p.col;
    c.fillStyle=p.col;c.beginPath();c.arc(x,y,2.8,0,Math.PI*2);c.fill();c.restore();
    p.t+=p.spd*p.dir;
    if(p.t>1||p.t<0){p.dir*=-1;p.t=Math.max(0,Math.min(1,p.t));
      const ni=p.dir===1?e.a:e.b;if(nodes[ni])nodes[ni].glow=1;}
  });
  /* Nodes */
  nodes.forEach(n=>{
    const r=13,a=.42+.18*Math.sin(n.ph+frame*.018);
    if(n.glow>0){
      c.save();c.globalAlpha=n.glow*.22;c.shadowBlur=18;c.shadowColor=COL[n.type]||TEAL;
      c.beginPath();c.arc(n.x,n.y,r+8,0,Math.PI*2);
      c.strokeStyle=COL[n.type]||TEAL;c.lineWidth=1.5;c.stroke();
      c.restore();n.glow=Math.max(0,n.glow-.025);
    }
    (FN[n.type]||drawPC)(n.x,n.y,r,a);
    c.save();c.globalAlpha=a+.08;c.font='8.5px "JetBrains Mono",monospace';
    c.fillStyle=COL[n.type]||TEAL;c.textAlign='center';
    c.fillText(n.label,n.x,n.y+r+13);c.restore();
    n.ph+=.008;
  });
  raf=requestAnimationFrame(loop);
}

function init(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;build();loop();}
window.addEventListener('resize',()=>{cancelAnimationFrame(raf);W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;build();});
init();
}
