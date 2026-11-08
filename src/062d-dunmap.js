// THE DUNGEON'S MAP: its plan drawn from the layout (rooms, corridors, ledges, pits, lava, spikes, webs, the stair, the torches) for the corner map below ground and the full map you open from it (owner, 8 Nov 2026).
import {SHARED} from './003-shx.js';
import {pos} from './003b-systems.js';
import {MODS} from './006-map-pre.js';
{ const S=8, PAD=6;   // pixels to a tile
  let Q=null, QV=-1;
  const plan=()=>{ const D=MODS.dungeon; if(!D||!D.rooms)return null; const v=(D.v||0)+':'+D.rooms.length; if(Q&&QV===v)return Q; QV=v;
    const RM=D.rooms, x0=Math.min(...RM.map(r=>r.B.x0)), y0=Math.min(...RM.map(r=>r.B.y0)), x1=Math.max(...RM.map(r=>r.B.x1)), y1=Math.max(...RM.map(r=>r.B.y1));
    const cv=Q&&Q.cv||document.createElement('canvas'); cv.width=Math.ceil((x1-x0)*S)+2*PAD; cv.height=Math.ceil((y1-y0)*S)+2*PAD; const g=cv.getContext('2d');
    const px=gx=>PAD+(gx-x0)*S, py=gy=>PAD+(gy-y0)*S, B=SHARED.BOD;
    g.fillStyle='#0b0d12'; g.fillRect(0,0,cv.width,cv.height);
    for(const r of RM){ const b=r.B; g.fillStyle=r.c?'#2c2925':'#38342e'; g.fillRect(px(b.x0),py(b.y0),(b.x1-b.x0)*S,(b.y1-b.y0)*S); }
    for(const r of RM){ const L=D.lay(r.k), T=L&&L.T; if(!T)continue;   // the ground: ledges lighter, pits darker (a cistern's hold water)
      for(let j=0;j<T.ny;j++)for(let i=0;i<T.nx;i++){ const h=T.g[j*T.nx+i]; if(Math.abs(h)<10)continue; g.fillStyle=h>0?`rgba(150,140,120,${Math.min(.55,h/70)})`:T.theme==='cistern'?'rgba(40,110,110,.7)':`rgba(0,0,0,${Math.min(.6,-h/80)})`; g.fillRect(px(T.x0+i*.5-.25),py(T.y0+j*.5-.25),S*.5,S*.5); }
      if(MODS.dunTerr){ g.fillStyle='#16130f'; for(const c of MODS.dunTerr.cliffs(L)){ const a=B.MX(c[0]), b=B.MX(c[2]), u=B.MY(c[1]), w=B.MY(c[3]); g.fillRect(px(Math.min(a,b)),py(Math.min(u,w)),Math.max(1,Math.abs(b-a)*S),Math.max(1,Math.abs(w-u)*S)); } }
      if(T.theme==='subway'&&L.track){ const t=L.track; g.fillStyle='#7a5a44'; g.fillRect(px(t.x0),py(t.y0),(t.x1-t.x0)*S,(t.y1-t.y0)*S); } }
    for(const r of RM){ const b=r.B; g.strokeStyle='#6a6258'; g.lineWidth=1; g.strokeRect(px(b.x0)+.5,py(b.y0)+.5,(b.x1-b.x0)*S-1,(b.y1-b.y0)*S-1); }
    for(const r of RM){ const b=r.B; for(const q of RM){ if(q===r)continue; const A=q.B;   // the openings between rooms: no wall drawn there
        if(A.y1===b.y0||A.y0===b.y1){ const a=Math.max(A.x0,b.x0), c=Math.min(A.x1,b.x1); if(c>a){ g.fillStyle=r.c?'#2c2925':'#38342e'; g.fillRect(px(a)+1,py(A.y1===b.y0?b.y0:b.y1)-1,(c-a)*S-2,2); } }
        if(A.x1===b.x0||A.x0===b.x1){ const a=Math.max(A.y0,b.y0), c=Math.min(A.y1,b.y1); if(c>a){ g.fillStyle=r.c?'#2c2925':'#38342e'; g.fillRect(px(A.x1===b.x0?b.x0:b.x1)-1,py(a)+1,2,(c-a)*S-2); } } } }
    for(const r of RM){ const L=D.lay(r.k); if(!L)continue;
      for(const h of L.hz){ if(h.t==='lava'){ g.fillStyle='#d2561e'; g.beginPath(); g.ellipse(px(h.cx),py(h.cy),h.rx*S,h.ry*S,0,0,Math.PI*2); g.fill(); } else if(h.t==='spike'){ g.fillStyle='#8e8a84'; g.fillRect(px(h.x0),py(h.y0),(h.x1-h.x0)*S,(h.y1-h.y0)*S); } else { g.strokeStyle='#d8d8c8'; g.beginPath(); g.moveTo(px(h.cx-h.r),py(h.cy-h.r)); g.lineTo(px(h.cx+h.r),py(h.cy+h.r)); g.moveTo(px(h.cx+h.r),py(h.cy-h.r)); g.lineTo(px(h.cx-h.r),py(h.cy+h.r)); g.stroke(); } }
      const R=L.R; g.fillStyle='#ffb347'; for(const t of R.torches){ const [x,y]=t.w==='l'?[R.x0+.2,R.y0+t.u]:t.w==='r'?[R.x1-.2,R.y0+t.u]:t.w==='b'?[R.x0+t.u,R.y0+.2]:[R.x0+t.u,R.y1-.2]; g.fillRect(px(x)-1.5,py(y)-1.5,3,3); }
      if(L.up){ const u=L.up; g.fillStyle='#9a968c'; for(let k=0;k<u.n;k++)g.fillRect(px(u.x0),py(u.y0+(u.y1-u.y0)*k/u.n),(u.x1-u.x0)*S,1); } }
    const names=RM.filter(r=>!r.c&&r.nm).map(r=>({nm:r.nm,x:px((r.B.x0+r.B.x1)/2),y:py((r.B.y0+r.B.y1)/2)}));
    Q={cv,S,names,wx:x=>px(B.MX(x)),wz:z=>py(B.MY(z))}; return Q; };
  // the whole dungeon, opened from the corner map: every room named, you in it
  let W=null; const open=()=>{ const P=plan(); if(!P)return; if(!W){ W=document.createElement('div'); W.id='dmapw'; W.style.cssText='position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:rgba(5,6,10,.7)';
      W.innerHTML='<div style="position:relative;background:#0b0d12;box-shadow:0 0 0 2px #3aa866;padding:12px;max-width:94vw;max-height:92vh;overflow:auto;font:12px Silkscreen,monospace;color:#7dffa8"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>THE DUNGEON</span><button class="pX" aria-label="close" style="font:inherit;background:#0e1016;color:#7dffa8;border:2px solid #3aa866;cursor:pointer">X</button></div><canvas></canvas></div>';
      document.body.appendChild(W); W.querySelector('.pX').onclick=()=>{ W.hidden=true; }; W.onclick=e=>{ if(e.target===W)W.hidden=true; }; W.addEventListener('keydown',e=>{ if(e.key==='Escape')W.hidden=true; }); }
    W.hidden=false; const c=W.querySelector('canvas'), k=Math.min(2,Math.max(1,Math.floor(Math.min(innerWidth*.9/P.cv.width,innerHeight*.8/P.cv.height)*2)/2)); c.width=P.cv.width*k; c.height=P.cv.height*k; const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
    g.drawImage(P.cv,0,0,c.width,c.height); g.font=`${Math.round(9*k)}px Silkscreen,monospace`; g.textAlign='center'; g.lineWidth=3; g.strokeStyle='#000'; g.fillStyle='#e8dcc0';
    for(const n of P.names){ g.strokeText(n.nm,n.x*k,n.y*k); g.fillText(n.nm,n.x*k,n.y*k); }
    const x=P.wx(pos.x)*k, y=P.wz(pos.z)*k; g.fillStyle='#000'; g.fillRect(x-5,y-5,10,10); g.fillStyle='#fff'; g.fillRect(x-4,y-4,8,8); };
  MODS.dunMap={plan,open,shut:()=>{ if(W)W.hidden=true; },isOpen:()=>!!(W&&!W.hidden)};
  window.DUNMAPDBG=()=>{ const P=plan(); return P?{w:P.cv.width,h:P.cv.height,names:P.names.length,you:[P.wx(pos.x),P.wz(pos.z)].map(Math.round)}:null; }; }
