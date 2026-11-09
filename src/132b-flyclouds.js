// THE CLOUD DECK: real cumulus over the whole map, the sky's own clouds as meshes, made the first time you fly high and drawn only while you are up there; flying into one goes white round you.
import {SHARED, THREE} from './003-shx.js';
import {pos, ROOMS, SKY, UI} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {MODS, SYS, TILE} from './006-map-pre.js';
{ const PV=new THREE.Vector3(), WM=TILE/.84, BASE=110*WM, SHOW=80*WM, N=120, hsh=(n,k)=>{ const v=Math.sin(n*12.9898+k*78.233)*43758.5453; return v-Math.floor(v); };
  const D={m:null,C:null,cx:0,cz:0,span:1}; SKY.deck=D;
  const fog=document.createElement('div'); fog.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:5;background:#eef1f4;opacity:0;display:none'; document.body.appendChild(fog);
  const make=()=>{ const B=SHARED.BOUND||{x0:-300,x1:300,z0:-300,z1:300}, m=300*WM; D.cx=(B.x0+B.x1)/2; D.cz=(B.z0+B.z1)/2; const hx=(B.x1-B.x0)/2+m, hz=(B.z1-B.z0)/2+m; D.span=2*hx;
    D.C=[]; for(let i=0;i<N;i++){ const W=(55+hsh(i,3)*70)*WM; D.C.push({x:D.cx+(hsh(i,1)*2-1)*hx,y:BASE+hsh(i,4)*25*WM,z:D.cz+(hsh(i,2)*2-1)*hz,W,s:i+7,a:hsh(i,5)*6.28,v:(1+hsh(i,6)*1.5)*WM}); }   // the same clouds for everyone
    D.m=SKY.cumulus(D.C,SKY.lump(8,6),SKY.cumLive(true)); D.m.userData.sky=1; D.m.visible=false; const u=D.m.material.uniforms; u.uSpan.value=D.span; u.uCC.value.set(D.cx,D.cz); scene.add(D.m); };
  const inside=(c,t)=>{ let v=0; for(let i=0;i<D.n;i++){ const C=D.C[i], x=((C.x-D.cx+t*C.v+D.span*1.5)%D.span)-D.span/2+D.cx, R=.5*C.W, d=Math.hypot(c.x-x,(c.y-C.y-.28*C.W)*1.3,c.z-C.z); if(d<R)v=Math.max(v,Math.min(1,(R-d)/(.35*R))); } return v; };
  SYS.add('sky',()=>{ const cam=SHARED.cam, up=(UI.fly||SHARED.py>SHOW)&&SHARED.LVL==='up'&&!ROOMS.cur&&!(MODS.apts&&MODS.apts.inReal)&&cam&&cam.position.y>SHOW;   // never round a room off the map (your apartment stands high in the sky), nor over the rooftops, only when you fly or climb near the deck
    if(!up){ if(D.m)D.m.visible=false; if(fog.style.display!=='none')fog.style.display='none'; return; }
    if(!D.m)make(); const t=performance.now()/1000, CU=SKY.CU, k=CU&&CU.N?Math.max(.35,CU.n/CU.N):1; D.n=Math.max(1,Math.round(N*k));
    D.m.count=D.m.userData.ends[D.n-1]; D.m.visible=true; const mu=D.m.material.uniforms; mu.uDr.value=t;
    if(mu.uP){ PV.set(pos.x,SHARED.py+.9*TILE,pos.z).project(cam); mu.uP.value.copy(PV); renderer.getDrawingBufferSize(mu.uRes.value); }   // where you stand on the screen, for the see-through circle
    const w=inside(cam.position,t); fog.style.display=w>0?'':'none'; if(w>0)fog.style.opacity=String(Math.min(.7,w)); },'132b-flyclouds'); }
