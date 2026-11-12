// BOATS: a craft you sit in and row with W A S D (the Hudson's rowboat, the park lake's canoe, kayak and skiff): one ride, each craft on its own water; craft afloat never overlap each other or the shore.
import {SHARED} from './003-shx.js';
import {BOAT, ONLINE, pos, st, UI, W3} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS, TILE, ZU} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
import {RIVER} from './066-river.js';
{ const T=TILE, cl=(v,a,b)=>Math.max(a,Math.min(b,v)), CR=BOAT.crafts=[], REACH=9*T, r2=v=>Math.round(v*100)/100; let row=0, shT=0;
  Object.assign(BOAT,{on:false,c:null,x:0,z:0,hd:Math.PI,v:0,py:0});
  const hull=(c,x,z,hd)=>{ const s=Math.sin(hd)*c.len, k=Math.cos(hd)*c.len; return [-.42,-.21,0,.21,.42].map(u=>[x+s*u,z+k*u]); };
  const clash=(c,x,z,hd)=>{ let A=null; for(const o of CR){ if(o===c||!o.afloat||Math.hypot(o.x-x,o.z-z)>(o.len+c.len)/2+T)continue; A=A||hull(c,x,z,hd); const r=(o.beam+c.beam)/2; for(const b of hull(o,o.x,o.z,o.hd))for(const a of A)if(Math.hypot(a[0]-b[0],a[1]-b[1])<r)return true; } return false; };
  const inB=(x,z)=>{ const B=SHARED.BOUND; return !B||x>B.x0+T&&x<B.x1-T&&z>B.z0+T&&z<B.z1-T; };
  const wf=(c,x,z,hd)=>(c.pts||[-.45,0,.45]).every(u=>{ const X=x+Math.sin(hd)*u*c.len, Z=z+Math.cos(hd)*u*c.len; return inB(X,Z)&&c.wet(X,Z); });
  const set=(c,y)=>{ c.g.position.set(c.x,(y==null?c.lv(c.x,c.z):y)-(c.sink||0),c.z); c.g.rotation.y=c.hd; };
  // where you step out: the craft's own landing, the bank you got in from (a fence may stand between it and the water), or the nearest dry ground; none near, over the side into the water
  const land=c=>{ if(c.shore)return c.shore(); if(c.from&&Math.hypot(c.from.x-BOAT.x,c.from.z-BOAT.z)<REACH+c.len/2)return c.from; if(c.dry)for(let r=1;r<=5;r+=.5)for(let i=0;i<16;i++){ const x=BOAT.x+Math.cos(i*Math.PI/8)*r*T, z=BOAT.z+Math.sin(i*Math.PI/8)*r*T; if(inB(x,z)&&c.dry(x,z))return {x,z}; }
    return c.dry?{x:BOAT.x+Math.cos(BOAT.hd)*(c.beam/2+.6*T),z:BOAT.z-Math.sin(BOAT.hd)*(c.beam/2+.6*T),swim:1}:null; };
  const HUD=document.createElement('div'); HUD.id='boathud'; HUD.hidden=true; { const s=document.createElement('style'); s.textContent='#boathud[hidden]{display:none!important}'; document.head.appendChild(s); }
  HUD.style.cssText='position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:7;font:11px Silkscreen,monospace;color:#e8e2cc;background:#0b0d13e0;border:2px solid #3a3f4e;padding:6px 10px;display:flex;gap:10px;align-items:center;zoom:var(--uiz,1)';
  HUD.innerHTML='<span></span><button style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 8px;cursor:pointer">STEP ASHORE</button>'; document.body.appendChild(HUD);
  const btn=HUD.querySelector('button'); btn.onclick=()=>BOAT.ashore(); SYS.every(()=>{ if(!BOAT.on||!BOAT.c)return; const s=land(BOAT.c); btn.style.opacity=s?1:.45; btn.textContent=s&&s.swim?'GET OUT':'STEP ASHORE'; },400,'111ff-boats ashore');
  const send=(c,end)=>{ if(ONLINE.on&&c.moored)ONLINE.send({t:'craft',i:c.id,p:[r2(c.x),r2(c.z),r2(c.hd)],e:end?1:0}); };
  BOAT.board=c=>{ if(BOAT.on||c.by)return false; c.from=c.dry&&c.dry(pos.x,pos.z)?{x:pos.x,z:pos.z}:null; BOAT.c=c; BOAT.x=c.x; BOAT.z=c.z; BOAT.hd=c.hd; BOAT.v=0; BOAT.on=true; c.afloat=true; c.g.visible=true; SHARED.target=null; HUD.firstChild.textContent=c.name+' · W A S D'; HUD.hidden=false; BOAT.place(); return true; };
  BOAT.ashore=()=>{ const c=BOAT.c; if(!c)return; const s=land(c); if(!s)return SAY(c.far||'ROW TO THE SHORE FIRST.','#c8a090'); BOAT.on=false; BOAT.c=null; BOAT.v=0; st.sit=null; pos.x=s.x; pos.z=s.z; HUD.hidden=true; send(c,1);
    if(c.left)c.left(s); else SAY(s.swim?'YOU SLIP OVER THE SIDE.':'YOU STEP ASHORE.'); };
  BOAT.steer=(dt,mx,mz)=>{ const c=BOAT.c; if(!c)return; const m=Math.hypot(mx,mz), w0=wf(c,BOAT.x,BOAT.z,BOAT.hd), k0=clash(c,BOAT.x,BOAT.z,BOAT.hd), ok=(x,z,h)=>(w0?wf(c,x,z,h):inB(x,z)&&c.wet(x,z))&&(k0||!clash(c,x,z,h));
    let x=BOAT.x, z=BOAT.z, back=false;
    if(m>0){ let dh=Math.atan2(mx,mz)-BOAT.hd; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); const h=BOAT.hd+cl(dh,-1.7*dt,1.7*dt); if(ok(x,z,h))BOAT.hd=h; else if(Math.abs(dh)>.05)back=true;
      if(Math.abs(dh)<1.2&&!back)BOAT.v=Math.min(c.top,BOAT.v+(c.acc||3.6*T)*dt); row+=dt*5; }
    else BOAT.v*=Math.exp(-dt*1.1); if(BOAT.v<.03*T&&!m)BOAT.v=0;
    // no room to turn: it backs off until there is
    if(back){ BOAT.v=0; for(const s of [-1,1]){ const bx=x+s*Math.sin(BOAT.hd)*.9*T*dt, bz=z+s*Math.cos(BOAT.hd)*.9*T*dt; if(ok(bx,bz,BOAT.hd)){ x=bx; z=bz; break; } } }
    else { const dx=Math.sin(BOAT.hd)*BOAT.v*dt, dz=Math.cos(BOAT.hd)*BOAT.v*dt; if(ok(x+dx,z+dz,BOAT.hd)){ x+=dx; z+=dz; } else if(ok(x+dx,z,BOAT.hd))x+=dx; else if(ok(x,z+dz,BOAT.hd))z+=dz; else BOAT.v=Math.min(BOAT.v,.5*T); }
    BOAT.x=x; BOAT.z=z; BOAT.place(); };
  BOAT.place=()=>{ const c=BOAT.c; if(!c)return; const y=c.lv(BOAT.x,BOAT.z); BOAT.py=y+c.floor; c.x=BOAT.x; c.z=BOAT.z; c.hd=BOAT.hd; set(c,y); if(c.row)c.row(row); };
  BOAT.carry=(st,pos)=>{ const c=BOAT.c; if(!c)return; pos.x=BOAT.x; pos.z=BOAT.z; st.sit={z:Math.max(2,c.seat/(ZU*W3.SZ*(W3.BH||1))),hold:1}; if(RIVER.swim)RIVER.swim=false; if(FOUNT.swim)FOUNT.swim=false; if(st.water)st.water.in=false; };   // (sat, hands free: the rod held, cast and reeled as on the pier)
  // a craft left on its water for anyone: double-click it from the bank to get in, again (or STEP ASHORE) to get out; it stays where you leave it
  BOAT.moor=c=>{ c.afloat=c.moored=true; c.id=c.k+CR.filter(o=>o.k===c.k).length; const x0=c.x, z0=c.z;
    for(let i=0;i<60&&!(wf(c,c.x,c.z,c.hd)&&!clash(c,c.x,c.z,c.hd));i++){ const d=(i%2?-1:1)*Math.ceil((i+1)/2)*.5*T; c.x=x0+Math.sin(c.hd)*d; c.z=z0+Math.cos(c.hd)*d; }
    CR.push(c); set(c); UI.thing({name:c.name,obj:c.g,reach:REACH+c.len/2,near:REACH+c.len/2+2*T,tall:1,can:()=>BOAT.on&&BOAT.c!==c?'you are in a boat':c.by?'someone is in it':true,act:()=>{ if(BOAT.c===c)BOAT.ashore(); else if(BOAT.board(c))SAY('YOU GET IN. ROW WITH W A S D.'); }}); return c; };
  SYS.every(()=>{ const up=SHARED.LVL==='up'; for(const c of CR)if(c.moored)c.g.visible=up&&Math.hypot(c.x-pos.x,c.z-pos.z)<72*T; },500,'111ff-boats near');
  // the others see a moored craft go where it is rowed
  SYS.add('life',dt=>{ const c=BOAT.c, now=performance.now(); if(BOAT.on&&c&&(shT-=dt||0)<=0){ shT=.2; send(c); }
    for(const o of CR){ if(o.by&&now-o.at>1500)o.by=null; const p=o.to; if(!p||o===c)continue; const k=Math.min(1,(dt||0)*8), dh=Math.atan2(Math.sin(p[2]-o.hd),Math.cos(p[2]-o.hd)); o.x+=(p[0]-o.x)*k; o.z+=(p[1]-o.z)*k; o.hd+=dh*k; set(o); if(!o.by&&Math.hypot(p[0]-o.x,p[1]-o.z)<.02*T)o.to=null; } },'111ff-boats');
  ONLINE.hear.craft=m=>{ const c=CR.find(o=>o.id===m.i); if(!c||c===BOAT.c||!Array.isArray(m.p)||m.p.length!==3||!m.p.every(v=>typeof v==='number'&&isFinite(v)))return; c.to=m.p; c.by=m.e?null:m.id; c.at=performance.now(); };
  window.BOATDBG=()=>({on:BOAT.on,c:BOAT.c&&BOAT.c.id,x:r2(BOAT.x),z:r2(BOAT.z),hd:r2(BOAT.hd),v:r2(BOAT.v),crafts:CR.map(c=>({id:c.id,x:r2(c.x),z:r2(c.z),hd:r2(c.hd),clash:clash(c,c.x,c.z,c.hd),fits:wf(c,c.x,c.z,c.hd),seen:c.g.visible}))});
}
