// AIR HOCKEY: the arcade's table, full size (1.12 m by 2.24 m of play), standing in the room; AIRH.put(F,K,u,v,add) builds it, AIRH.play(o) puts you at its end against the house (first to 7; easy, medium or hard), your mallet under the mouse or the arrow keys; o.end({won,score,level}) gets the result.
import {SHARED, THREE} from './003-shx.js';
import {pos, SFX, UI, VR} from './003b-systems.js';
import {renderer} from './004-main.js';
import {SYS} from './006-map-pre.js';
const AIRH={on:false}; window.AIRH=AIRH;
{ const cl=(v,a,b)=>v<a?a:v>b?b:v;
  // the table in metres: x across, z along; side +1 (you) defends the +z goal, side -1 (the house) the -z goal
  const W=.56, L=1.12, PR=.041, MR=.05, GH=.15, VMAX=4.5, E_WALL=.8, E_MAL=.72, HAND=4, HOME=L-.3, TARGET=7, STEP=1/240;
  const LEVELS={easy:{speed:.9,strike:1.7,err:.12,react:.4,block:.9},medium:{speed:1.4,strike:2.5,err:.08,react:.3,block:1.3},hard:{speed:1.9,strike:3.2,err:.08,react:.29,block:1.4}};
  const mallet=side=>({side,x:0,z:side*HOME,vx:0,vz:0,tx:0,tz:side*HOME,maxSpeed:HAND,ai:null});
  const create=()=>({puck:{x:0,z:0,vx:0,vz:0},m:[mallet(1),mallet(-1)],live:true});
  const faceoff=(s,side)=>{ const p=s.puck; p.x=0; p.z=side*.4; p.vx=p.vz=0; s.live=true; s.m[0].ai=s.m[1].ai=null; };
  const step=(s,dt,ev)=>{ const p=s.puck; let dx, dz, d;
    for(const m of s.m){ m.tx=cl(m.tx,-(W-MR),W-MR); m.tz=m.side>0?cl(m.tz,MR,L-MR):cl(m.tz,-(L-MR),-MR); dx=m.tx-m.x; dz=m.tz-m.z; d=Math.hypot(dx,dz);
      const mx=m.maxSpeed*dt, ox=m.x, oz=m.z; if(d>mx){ m.x+=dx/d*mx; m.z+=dz/d*mx; } else { m.x=m.tx; m.z=m.tz; } m.vx=(m.x-ox)/dt; m.vz=(m.z-oz)/dt; }
    if(!s.live)return;
    p.x+=p.vx*dt; p.z+=p.vz*dt;
    let sp=Math.hypot(p.vx,p.vz); if(sp>0){ const f=Math.max(0,sp*Math.exp(-.22*dt)-.04*dt)/sp; p.vx*=f; p.vz*=f; }
    const n=PR+MR;
    for(const m of s.m){ dx=p.x-m.x; dz=p.z-m.z; d=Math.hypot(dx,dz); if(d>=n)continue;
      const nx=d>1e-6?dx/d:0, nz=d>1e-6?dz/d:-m.side, vn=(p.vx-m.vx)*nx+(p.vz-m.vz)*nz;
      if(vn<0){ p.vx-=(1+E_MAL)*vn*nx; p.vz-=(1+E_MAL)*vn*nz; if(vn<-.2)ev.push({k:'mallet',s:-vn}); }
      p.x=m.x+nx*n; p.z=m.z+nz*n; }
    const lim=W-PR;
    if(p.x>lim){ p.x=lim; if(p.vx>0){ if(p.vx>.2)ev.push({k:'wall',s:p.vx}); p.vx*=-E_WALL; } }
    else if(p.x<-lim){ p.x=-lim; if(p.vx<0){ if(p.vx<-.2)ev.push({k:'wall',s:-p.vx}); p.vx*=-E_WALL; } }
    for(const sg of [-1,1]){ if(sg*p.z<=L-PR)continue;
      if(Math.abs(p.x)>=GH){ p.z=sg*(L-PR); if(sg*p.vz>0){ if(sg*p.vz>.2)ev.push({k:'wall',s:sg*p.vz}); p.vz*=-E_WALL; } continue; }
      for(const q of [-1,1]){ dx=p.x-q*GH; dz=p.z-sg*L; d=Math.hypot(dx,dz); if(d>=PR||d<=1e-6)continue;
        const px=dx/d, pz=dz/d, pv=p.vx*px+p.vz*pz; if(pv<0){ p.vx-=(1+E_WALL)*pv*px; p.vz-=(1+E_WALL)*pv*pz; if(pv<-.2)ev.push({k:'post',s:-pv}); }
        p.x=q*GH+px*PR; p.z=sg*L+pz*PR; }
      if(sg*p.z>L+PR*.6){ s.live=false; ev.push({k:'goal',into:sg}); return; } }
    // a mallet cannot squash the puck into a wall: the mallet gives way
    for(const m of s.m){ dx=p.x-m.x; dz=p.z-m.z; d=Math.hypot(dx,dz); if(d<n-1e-4&&d>1e-6){ m.x=p.x-dx/d*n; m.z=p.z-dz/d*n; } }
    sp=Math.hypot(p.vx,p.vz); if(sp>VMAX){ p.vx*=VMAX/sp; p.vz*=VMAX/sp; } };
  // the house's player: where its mallet heads this moment
  const think=(s,m,cfg,dt)=>{ const p=s.puck, sd=m.side, ai=m.ai||(m.ai={t:0,ex:0,gx:0,bank:0,stall:0,seen:0}); ai.t-=dt;
    if(ai.t<=0){ ai.t=.4+Math.random()*.4; ai.ex=(Math.random()*2-1)*cfg.err; ai.gx=(Math.random()*2-1)*.11; ai.bank=Math.random()<.25?(Math.random()<.5?-1:1):0; }
    const pz=p.z*sd, pvz=p.vz*sd, mz=m.z*sd; let tx, tz, sp=cfg.speed;
    if(!(pvz>.8))ai.seen=0;
    if(pz>0&&Math.hypot(p.vx,p.vz)<.2)ai.stall+=dt; else ai.stall=0;
    const incoming=pz>-.4&&pvz>.8&&pz<mz-.02;
    if(!s.live){ tx=0; tz=HOME; }
    else if(ai.stall>3){ tx=p.x; tz=pz; sp=cfg.strike; }
    else if(incoming&&(ai.seen+=dt)<cfg.react){ tx=cl(m.x,-.2,.2); tz=HOME; }
    else if(incoming){ tz=L-.24; const lim=W-PR, span=2*lim; let x=p.x+p.vx*(tz-pz)/pvz; x=(((x+lim)%(2*span))+2*span)%(2*span); if(x>span)x=2*span-x; x-=lim; tx=cl(x+ai.ex,-.27,.27); sp=cfg.block; }
    else if(pz>.02){ const gx=ai.bank?2*ai.bank*W-ai.gx:ai.gx; let dx=gx-p.x, dz=-L-pz; const dl=Math.hypot(dx,dz); dx/=dl; dz/=dl;
      const rx=m.x-p.x, rz=mz-pz, along=rx*dx+rz*dz, lat=Math.abs(rx*dz-rz*dx);
      if(along<-.05&&lat<.04){ tx=p.x+dx*.3; tz=pz+dz*.3; sp=cfg.strike; }
      else if(mz<pz+.03){ let g=m.x>=p.x?1:-1; if(Math.abs(p.x+g*.16)>W-MR)g=-g; tx=p.x+g*.16; tz=pz+.15; }
      else { tx=p.x-dx*(MR+PR+.035)+ai.ex*.3; tz=pz-dz*(MR+PR+.035); } }
    else { tx=cl(p.x*.45,-.2,.2); tz=HOME; }
    m.tx=tx; m.tz=cl(tz,MR,L-MR)*sd; m.maxSpeed=sp; };
  AIRH.sim={W,L,PR,MR,GH,LEVELS,create,faceoff,step,think};

  let A=null, P=null, keys=new Set(), lastSfx=0;
  const RW=.07, RH=.045, FT=.012, OW=2*(W+FT+RW), OL=2*(L+FT+RW), TOP=.8;
  AIRH.size=[OW,OL];
  const SEG=[0x3f,0x06,0x5b,0x4f,0x66,0x6d,0x7d,0x07,0x7f,0x6f];
  // the table at the room's (u,v), its length along v, your end toward +v
  AIRH.put=(F,K,cu,cv,add)=>{ '@later'; const MW=K.MW, C={rail:0x141518,face:0xe9ebee,alu:0xb9bdc4,cab:0x122a5c,black:0x0d0d0f,stripe:0xc41f2a};
    const bx=(w,h,d,c,x,y,z)=>K.box(cu+x-w/2,cv+z-d/2,cu+x+w/2,cv+z+d/2,TOP+y-h/2,TOP+y+h/2,c), endW=W-GH;
    for(const s of [-1,1]){ bx(FT,RH,2*L,C.face,s*(W+FT/2),RH/2,0); bx(RW,RH+.006,2*L+2*RW,C.rail,s*(W+FT+RW/2),(RH+.006)/2,0);
      for(const q of [-1,1]){ bx(endW,RH,FT,C.face,q*(GH+endW/2),RH/2,s*(L+FT/2)); bx(endW+FT,RH+.006,RW,C.rail,q*(GH+(endW+FT)/2),(RH+.006)/2,s*(L+FT+RW/2)); }
      bx(2*GH,.012,RW,C.rail,0,RH,s*(L+FT+RW/2)); bx(2*GH,.002,RW+FT,C.black,0,-.004,s*(L+(RW+FT)/2)); bx(2*GH+.06,.09,.05,C.black,0,-.07,s*(L+FT+RW+.02));
      bx(OW-.3,.06,.06,C.black,0,-.6,s*(OL/2-.14)); }
    bx(OW,.3,OL,C.cab,0,-.152,0); bx(OW+.004,.03,OL+.004,C.stripe,0,-.1,0); bx(OW+.006,.012,OL+.006,C.alu,0,-.008,0);
    for(const cx of [-1,1])for(const cz of [-1,1]){ bx(.13,.48,.13,C.black,cx*(OW/2-.1),-.54,cz*(OL/2-.14)); bx(.09,.02,.09,C.alu,cx*(OW/2-.1),-.79,cz*(OL/2-.14)); }
    const sbz=-(L+FT+RW+.05); for(const x of [-.3,.3])bx(.025,.42,.025,C.alu,x,.21,sbz); bx(.72,.26,.05,C.black,0,.5,sbz);
    K.sol(cu-OW/2,cv-OL/2,cu+OW/2,cv+OL/2);
    const tex=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'), t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; t.redraw=()=>{ g.clearRect(0,0,w,h); draw(g,w,h); t.needsUpdate=true; }; t.redraw(); return t; };
    const T={score:[0,0],mode:'idle',level:'medium',sim:create(),pause:0,next:0,acc:0,o:null,ev:[]};
    // the playing surface: white laminate, air holes every 25 mm, the printed lines
    const surfT=tex(560,1120,(g,Wd,Hd)=>{ const sc=Wd/(2*W), X=x=>(x+W)*sc, Z=z=>(z+L)*sc, RED='#cc1f2b', BLUE='#1c4fae'; g.fillStyle='#f3f5f7'; g.fillRect(0,0,Wd,Hd);
      for(let i=0;i<60;i++){ g.strokeStyle='rgba(120,130,140,'+(.03+Math.random()*.05)+')'; g.lineWidth=.6+Math.random(); const a0=Math.random()*6.3; g.beginPath(); g.arc(Math.random()*Wd,Math.random()*Hd,60+Math.random()*400,a0,a0+.15+Math.random()*.4); g.stroke(); }
      g.fillStyle='rgba(70,90,120,.5)'; for(let i=6.25;i<Wd;i+=12.5)for(let j=6.25;j<Hd;j+=12.5)g.fillRect(i-.6,j-.6,1.3,1.3);
      g.lineWidth=5; g.strokeStyle=BLUE; g.strokeRect(9,9,Wd-18,Hd-18);
      g.fillStyle='rgba(204,31,43,.10)'; g.strokeStyle=RED; g.beginPath(); g.arc(X(0),Z(-L),.25*sc,0,Math.PI); g.fill(); g.stroke(); g.beginPath(); g.arc(X(0),Z(L),.25*sc,Math.PI,2*Math.PI); g.fill(); g.stroke();
      g.lineWidth=7; g.beginPath(); g.moveTo(0,Hd/2); g.lineTo(Wd,Hd/2); g.stroke();
      g.fillStyle='#f3f5f7'; g.beginPath(); g.arc(X(0),Z(0),.2*sc,0,7); g.fill(); g.strokeStyle=BLUE; g.lineWidth=5; g.beginPath(); g.arc(X(0),Z(0),.2*sc,0,7); g.stroke();
      g.strokeStyle=RED; g.lineWidth=7; g.beginPath(); g.moveTo(X(-.2),Hd/2); g.lineTo(X(.2),Hd/2); g.stroke(); g.fillStyle=BLUE; g.beginPath(); g.arc(X(0),Z(0),7,0,7); g.fill();
      for(const [x,z] of [[-.3,-.56],[.3,-.56],[-.3,.56],[.3,.56]]){ g.strokeStyle=BLUE; g.lineWidth=3; g.beginPath(); g.arc(X(x),Z(z),.06*sc,0,7); g.stroke(); g.fillStyle=RED; g.beginPath(); g.arc(X(x),Z(z),6,0,7); g.fill(); } });
    const seven=(g,x,y,w,h,n)=>{ const t=w*.17, m=SEG[n%10], seg=(bit,rx,ry,rw,rh)=>{ const on=(m>>bit)&1; g.fillStyle=on?'#ff2a1a':'#2a0a08'; g.shadowColor='#ff2a1a'; g.shadowBlur=on?14:0; g.fillRect(rx,ry,rw,rh); };
      seg(0,x+t,y,w-2*t,t); seg(1,x+w-t,y+t,t,h/2-1.5*t); seg(2,x+w-t,y+h/2+t/2,t,h/2-1.5*t); seg(3,x+t,y+h-t,w-2*t,t); seg(4,x,y+h/2+t/2,t,h/2-1.5*t); seg(5,x,y+t,t,h/2-1.5*t); seg(6,x+t,y+h/2-t/2,w-2*t,t); g.shadowBlur=0; };
    const boardT=tex(640,220,(g,Wd,Hd)=>{ g.fillStyle='#0c0c0e'; g.fillRect(0,0,Wd,Hd); g.strokeStyle='#3a3c40'; g.lineWidth=6; g.strokeRect(3,3,Wd-6,Hd-6);
      g.fillStyle='#e8e8e8'; g.textAlign='center'; g.textBaseline='middle'; g.font='bold 30px monospace'; g.fillText('YOU',150,36); g.fillText('HOUSE',Wd-150,36);
      g.font='20px monospace'; g.fillStyle='#9a9a9a'; g.fillText('FIRST TO '+TARGET,Wd/2,190); seven(g,105,62,90,132,T.score[0]); seven(g,Wd-195,62,90,132,T.score[1]);
      g.fillStyle='#ff2a1a'; g.fillRect(Wd/2-7,100,14,14); g.fillRect(Wd/2-7,142,14,14); });
    const g=new THREE.Group(), p0=F.pw(cu,cv); g.position.set(p0[0],TOP*MW,p0[1]); g.rotation.y=F.hd(0,1); g.scale.setScalar(MW);
    const lam=c=>new THREE.MeshLambertMaterial({color:c}), surf=new THREE.Mesh(new THREE.PlaneGeometry(2*W,2*L),new THREE.MeshLambertMaterial({map:surfT})); surf.rotation.x=-Math.PI/2; surf.receiveShadow=true; g.add(surf);
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(.68,.234),new THREE.MeshBasicMaterial({map:boardT})); sign.position.set(0,.5,sbz+.026); g.add(sign);
    const V2=(x,y)=>new THREE.Vector2(x,y), malG=new THREE.LatheGeometry([V2(0,0),V2(MR-.002,0),V2(MR,.004),V2(MR,.02),V2(MR-.006,.026),V2(.03,.022),V2(.022,.03),V2(.019,.055),V2(.023,.068),V2(.019,.08),V2(0,.084)],28);
    const mal=[0x1c56c4,0x1c9a48].map(c=>{ const m=new THREE.Mesh(malG,lam(c)); m.castShadow=true; g.add(m); return m; });
    const puck=new THREE.Mesh(new THREE.CylinderGeometry(PR,PR,.006,28),lam(0xd3202a)); puck.position.y=.0035; g.add(puck);
    const rest=()=>{ const s=T.sim; faceoff(s,0); s.live=false; s.m[0].tx=0; s.m[0].tz=HOME; s.m[0].maxSpeed=1.2; };
    const show=()=>{ const s=T.sim; for(let i=0;i<2;i++)mal[i].position.set(s.m[i].x,0,s.m[i].z); puck.visible=s.live||T.mode==='idle'||T.mode==='over'; puck.position.x=s.puck.x; puck.position.z=s.puck.z; };
    rest(); show(); add(g);
    Object.assign(T,{g,MW,rest,show,board:()=>boardT.redraw(),stand:F.pw(cu,cv+OL/2+1.0),drop:()=>{ surfT.dispose(); boardT.dispose(); malG.dispose(); }});
    A=T; return T; };

  const panel=()=>{ '@later'; if(P)return P; P=document.createElement('div'); P.id='airh'; P.className='ml'; P.hidden=true;
    P.style.cssText='position:fixed;right:14px;top:14px;z-index:23;padding:10px 14px;text-align:center;width:min(250px,60vw);zoom:var(--uiz,1)';
    P.innerHTML='<h3 style="margin:0 0 6px">AIR HOCKEY</h3><div data-s style="min-height:20px"></div><div style="margin-top:8px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button data-d="easy" type="button">EASY</button><button data-d="medium" type="button">MEDIUM</button><button data-d="hard" type="button">HARD</button><button data-x type="button">LEAVE</button></div><div data-h style="opacity:.7;font-size:14px!important;margin-top:6px">FIRST TO '+TARGET+'. THE MOUSE OR THE ARROW KEYS MOVE YOUR MALLET. ESC LEAVES.</div>';
    P.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; if(b.dataset.d)AIRH.start(b.dataset.d); else AIRH.close(); });
    for(const ev of ['pointerdown','dblclick','wheel'])P.addEventListener(ev,e=>e.stopPropagation());
    document.body.appendChild(P); return P; };
  const line=t=>{ if(P)P.querySelector('[data-s]').textContent=t; }, pick=on=>{ if(P)for(const b of P.querySelectorAll('[data-d],[data-h]'))b.hidden=!on; };
  const sfx=(k,vol)=>{ const now=performance.now(); if(now-lastSfx<25||!SFX||!SFX.play)return; lastSfx=now; SFX.play(k,{vol,vary:.25}); };

  AIRH.play=(o={})=>{ '@later'; const T=A; if(!T||!T.g.parent||AIRH.on)return false; panel(); T.o=o; AIRH.on=true; keys.clear();
    T.back={x:pos.x,z:pos.z,view:UI.view}; pos.x=T.stand[0]; pos.z=T.stand[1]; T.t0=performance.now(); T.fp=null;
    if(!(VR&&VR.on)){ if(!UI.persp)UI.setView('third'); UI.holdCam='hockey'; }
    P.hidden=false; pick(true); line('PICK A LEVEL.'); return true; };
  AIRH.start=lv=>{ const T=A; if(!T||!AIRH.on)return; if(LEVELS[lv])T.level=lv; T.score=[0,0]; T.mode='play'; T.pause=0; T.acc=0; faceoff(T.sim,1); T.sim.m[0].maxSpeed=HAND; T.board(); pick(false); line('YOUR PUCK. '+T.level.toUpperCase()+'.'); };
  AIRH.close=()=>{ const T=A; if(!AIRH.on)return; AIRH.on=false; keys.clear(); if(P)P.hidden=true;
    if(T){ if(T.mode!=='idle'){ T.mode='idle'; T.score=[0,0]; T.rest(); T.board(); } if(T.back){ pos.x=T.back.x; pos.z=T.back.z; } }
    if(UI.holdCam==='hockey'){ UI.holdCam=null; const v=T&&T.back&&T.back.view; if(v&&UI.view!==v)UI.setView(v); } };
  AIRH.aim=(x,z)=>{ if(A){ A.sim.m[0].tx=x; A.sim.m[0].tz=z; } };
  AIRH.dbg=()=>A?{on:AIRH.on,mode:A.mode,score:A.score.slice(),level:A.level,puck:[A.sim.puck.x,A.sim.puck.z],built:!!A.g.parent}:null;

  const RAY=new THREE.Raycaster(), NDC=new THREE.Vector2(), INV4=new THREE.Matrix4(), LR=new THREE.Ray(), PL=new THREE.Plane(new THREE.Vector3(0,1,0),0), HP=new THREE.Vector3();
  addEventListener('pointermove',e=>{ const T=A, cam=SHARED.cam; if(!AIRH.on||!T||T.mode==='idle'||T.mode==='over'||!cam)return; const r=renderer.domElement.getBoundingClientRect();
    NDC.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1); RAY.setFromCamera(NDC,cam); T.g.updateMatrixWorld(true); LR.copy(RAY.ray).applyMatrix4(INV4.copy(T.g.matrixWorld).invert());
    if(LR.intersectPlane(PL,HP))AIRH.aim(HP.x,HP.z+(e.pointerType==='touch'?-.1:0)); });
  const typing=e=>/^(INPUT|TEXTAREA|SELECT)$/.test(e.target&&e.target.tagName||'');
  addEventListener('keydown',e=>{ if(!AIRH.on||typing(e))return; if(e.key==='Escape')AIRH.close(); else keys.add(e.key.toLowerCase()); e.stopImmediatePropagation(); if(/^(arrow|\s)/i.test(e.key))e.preventDefault(); },true);
  addEventListener('keyup',e=>{ if(!AIRH.on||typing(e))return; keys.delete(e.key.toLowerCase()); e.stopImmediatePropagation(); },true);

  SYS.add('life',dt=>{ const T=A; if(!T)return; if(!T.g.parent){ AIRH.close(); T.drop(); A=null; return; } if(T.mode==='idle'&&!AIRH.on)return;
    dt=Math.min(dt,.05); const s=T.sim, cfg=LEVELS[T.level], me=s.m[0];
    if(T.mode==='play'){ const kx=(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0), kz=(keys.has('arrowdown')||keys.has('s')?1:0)-(keys.has('arrowup')||keys.has('w')?1:0);
      if(kx||kz){ me.tx=cl(me.tx+kx*1.8*dt,-(W-MR),W-MR); me.tz=cl(me.tz+kz*1.8*dt,MR,L-MR); } }
    if(T.mode==='goal'&&(T.pause-=dt)<=0){
      if(T.score[0]>=TARGET||T.score[1]>=TARGET){ const won=T.score[0]>T.score[1]; T.mode='over'; T.rest(); pick(true); line((won?'YOU WIN ':'THE HOUSE WINS ')+T.score[0]+' : '+T.score[1]+'. AGAIN?'); sfx('bell',.4); if(T.o&&T.o.end)T.o.end({won,score:T.score[0],against:T.score[1],level:T.level}); }
      else { T.mode='play'; faceoff(s,T.next); } }
    T.acc+=dt; T.ev.length=0; while(T.acc>=STEP){ think(s,s.m[1],cfg,STEP); step(s,STEP,T.ev); T.acc-=STEP; }
    for(const e of T.ev){ if(e.k==='goal'){ const who=e.into>0?1:0; T.score[who]++; T.next=e.into; T.mode='goal'; T.pause=1.8; T.board(); line((who?'THE HOUSE SCORES. ':'GOAL. ')+T.score[0]+' : '+T.score[1]); sfx('ding',.4); }
      else sfx(e.k==='mallet'?'click':'clunk',cl(e.s/5,.06,.5)); }
    T.show(); },'146zcz-airhockey');
  // a standing player's view from your end of the table (from higher up on a tall screen)
  const CA=new THREE.Vector3(), CB=new THREE.Vector3(), LK=new THREE.Matrix4(), QT=new THREE.Quaternion(), UP=new THREE.Vector3(0,1,0);
  SYS.add('cam',()=>{ const T=A, cam=SHARED.cam; if(!AIRH.on||!T||UI.holdCam!=='hockey'||!cam||!cam.isPerspectiveCamera)return;
    if(!T.fp){ T.fp=cam.position.clone(); T.fq=cam.quaternion.clone(); } const k=cl((1.2-cam.aspect)/.5,0,1), s=Math.min(1,(performance.now()-T.t0)/600), e=s*s*(3-2*s), lean=T.sim.m[0].x*.12*(1-k);
    T.g.updateMatrixWorld(true); T.g.localToWorld(CA.set(lean,.95+k*1.05,1.9-k*.5)); T.g.localToWorld(CB.set(0,0,-.22+k*.2)); LK.lookAt(CA,CB,UP); QT.setFromRotationMatrix(LK);
    cam.position.lerpVectors(T.fp,CA,e); cam.quaternion.slerpQuaternions(T.fq,QT,e); },'146zcz-airhockey');
}
export {AIRH};
