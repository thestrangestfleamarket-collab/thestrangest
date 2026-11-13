// THE KITE: KITE flies any item that grants 'fly' from the winder in your hand: a diamond sail on its bridle in the day's wind (stronger and steadier with height, gusty low down), its tail, and a line that sags under its own weight and the wind's drag.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INSPECT, ITEMS, LEVELS, MOTION, ONLINE, pos, SFX, st, VIT, WIELD, WX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OUT, SYS, TILE} from './006-map-pre.js';
const KITE={on:false,reeling:false}; window.KITE=KITE;
{ const T=TILE, M=T/.84, V3=THREE.Vector3, say=SAY, cl=(v,a,b)=>v<a?a:v>b?b:v, RHO=1.225, G=9.81, AREA=.34, BRIDLE=.28, LINE_KG=.0005, LINE_D=.0012, MAXL=60, NL=24, NT=10, TSEG=.26;
  const ids=()=>Object.keys(ITEMS.defs).filter(id=>ITEMS.prop(id,'grants')==='fly'), NM={kite:'KITE'};
  FORAGE.add({names:NM});
  const lam=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));
  // the sail in its own frame: x across, y up the spine to the nose, z out of the face the wind hits
  const sail=()=>{ '@later'; const g=new THREE.Group(), w=.375, top=.3, bot=-.6, P=[[0,top,0],[-w,0,0],[0,0,.0],[w,0,0],[0,bot,0]], C=[0xd8402e,0xf2c14e,0x2e6ad8,0xf2efe6];
      const pos=[], col=[], c=new THREE.Color(), tri=(a,b,d,k)=>{ for(const p of [a,b,d])pos.push(...P[p]); c.setHex(C[k]); for(let i=0;i<3;i++)col.push(c.r,c.g,c.b); };
      tri(0,1,2,0); tri(0,2,3,1); tri(1,4,2,2); tri(2,4,3,3);
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos.map(v=>v*M),3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); geo.computeVertexNormals();
      const face=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})), wood=lam(0x5a4028);
      const spine=new THREE.Mesh(new THREE.BoxGeometry(.012*M,(top-bot)*M,.012*M),wood); spine.position.set(0,(top+bot)/2*M,.008*M);
      const spar=new THREE.Mesh(new THREE.BoxGeometry(2*w*M,.012*M,.012*M),wood); spar.position.z=.008*M; g.add(face,spine,spar); g.tailL=new V3(0,bot*M,0); g.frustumCulled=false; return g; };
  const ribbon=(n,col)=>{ '@later'; const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*2*3),3)); const ix=[]; for(let i=0;i<n-1;i++){ const a=i*2; ix.push(a,a+1,a+2,a+1,a+3,a+2); } geo.setIndex(ix);
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide})); m.frustumCulled=false; return m; };
  const lineOf=()=>{ const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array((NL+1)*3),3)); const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xf2efe6})); l.frustumCulled=false; return l; };
  const winder={name:'KITE',hint:'CLICK TO LAUNCH IT INTO THE WIND. HOLD THE MOUSE TO REEL IN; IT TAKES LINE WHEN IT PULLS.',
    make:()=>{ '@later'; const g=new THREE.Group(), wood=lam(0x8a6a44), spool=new THREE.Mesh(new THREE.CylinderGeometry(.05*M,.05*M,.1*M,8),lam(0xf2efe6)), a=new THREE.Mesh(new THREE.BoxGeometry(.03*M,.2*M,.12*M),wood);
      spool.rotation.z=Math.PI/2; spool.position.y=.1*M; a.position.y=.1*M; g.add(a,spool); g.tipL=new V3(0,.2*M,0); g.head=g.tipL; return g; },
    aim:(dt,aim)=>KITE.aim(dt,aim), use:()=>KITE.click() };
  // in the bag and the inspect window: the kite itself, a diamond on its spars with a tail of bows (the hand holds its winder)
  INSPECT.kinds.unshift({is:id=>ids().includes(String(id).split('~')[0]),make:()=>{ '@later'; const P=INSPECT.part, g=new THREE.Group(), CL={kind:'cloth'};
    g.add(P('oct',0xd83a2a,0,.42,0,.24,.34,.004,0,0,0,CL),P('box',0x8a6a44,0,.42,.006,.01,.68,.008,0,0,0,{kind:'wood'}),P('box',0x8a6a44,0,.42,.006,.48,.01,.008,0,0,0,{kind:'wood'}),P('oct',0xf2c14e,0,.42,.003,.1,.14,.004,0,0,0,CL));
    for(let i=0;i<4;i++){ const x=Math.sin(i*1.4)*.04, y=.02-i*.07; g.add(P('cyl',0xf2efe6,x*.5,y+.035,0,.002,.07,.002),P('oct',[0x3a7ad8,0xf2c14e,0x4aa84a,0xd83a2a][i],x,y,0,.04,.018,.004,0,0,0,CL)); } return g; }});
  for(const id of ids()){ (WIELD.pend=WIELD.pend||[]).push([id,winder]); if(WIELD.kind)WIELD.kind(id,winder); }
  addEventListener('pointerup',()=>{ KITE.reeling=false; }); addEventListener('blur',()=>{ KITE.reeling=false; });

  /* ---------- the wind: the day's, by height (a power law over rough town ground) with gusts that die off as you climb ---------- */
  const ph=[...Array(9)].map(()=>Math.random()*99), nz=(t,k)=>(Math.sin(t*.37+ph[k])+.6*Math.sin(t*.91+ph[k+3])+.35*Math.sin(t*2.3+ph[k+6]))/1.95;
  const open=()=>OUT.open&&SHARED.LVL!=='down';
  KITE.wind=(h,t,o)=>{ '@later'; const W=WX.now; o=o||new V3(); if(!W||!open())return o.set(0,0,0); const U10=1.5+9*W.wind, U=U10*Math.pow(Math.max(h,.3)/10,.16), I=.08+.14*cl(1-h/45,0,1);
    const dx=Math.cos(W.dir), dz=Math.sin(W.dir), a=U*(1+I*nz(t,0)), s=U*I*.5*nz(t*1.1,1), u=U*I*.3*nz(t*1.3,2); return o.set(dx*a-dz*s,u,dz*a+dx*s); };

  /* ---------- the flight: a point mass under its sail, its weight, its tail and half the line's load; the line a rope that only pulls ---------- */
  const k={p:new V3(),v:new V3(),L:0,ten:0,sag:0,q:new V3(),nw:new V3(0,0,1),nose:new V3(0,1,0),r:new V3(1,0,0),roll:0,ground:false,id:null}, hand=new V3(), hv=new V3();
  const tail=[...Array(NT)].map(()=>({p:new V3(),o:new V3()}));
  const W=new V3(), wa=new V3(), F=new V3(), t=new V3(), m=new V3(), u=new V3(), tmp=new V3(), tmp2=new V3(), C=new V3();
  const g0=()=>SHARED.py/M, handAt=o=>{ if(WIELD.on===k.id&&WIELD.tip.lengthSq()>0&&Math.hypot(WIELD.tip.x-pos.x,WIELD.tip.z-pos.z)<2*T)return o.copy(WIELD.tip).divideScalar(M);
    return o.set(pos.x+Math.sin(SHARED.heading)*.4*T,SHARED.py+1.4*M,pos.z+Math.cos(SHARED.heading)*.4*T).divideScalar(M); };
  // the bridle holds the sail at a set angle to the line where it leaves the kite; the tail's weight and the sail's dihedral keep the nose up (and a little into the wind), which brings it back to the top of the wind window; a gust rolls it
  const attitude=(lineDir,wind,roll,o)=>{ '@later'; tmp.copy(wind).normalize().multiplyScalar(-.3); tmp.y+=1; tmp.addScaledVector(lineDir,-tmp.dot(lineDir)); if(tmp.lengthSq()<1e-6)tmp.set(1,0,0).addScaledVector(lineDir,-lineDir.x); tmp.normalize();
    o.nw.copy(lineDir).multiplyScalar(Math.cos(BRIDLE)).addScaledVector(tmp,-Math.sin(BRIDLE)).normalize(); o.nose.copy(tmp).multiplyScalar(Math.cos(BRIDLE)).addScaledVector(lineDir,Math.sin(BRIDLE)).normalize();
    if(roll){ o.nw.applyAxisAngle(lineDir,roll); o.nose.applyAxisAngle(lineDir,roll); } o.r.crossVectors(o.nose,o.nw).normalize(); };
  // a flat plate: lift peaks near 45 degrees, drag grows with the face the wind sees
  const aero=(nw,wind,area,o)=>{ '@later'; const sp=wind.length(); if(sp<1e-3)return o.set(0,0,0); u.copy(wind).divideScalar(sp); const d=nw.dot(u), a=Math.asin(cl(Math.abs(d),0,1));
    const CL=1.2*Math.sin(2*a), CD=.1+1.25*Math.sin(a)**2, q=.5*RHO*sp*sp*area; tmp2.copy(nw).multiplyScalar(d<0?-1:1); tmp2.addScaledVector(u,-tmp2.dot(u)); if(tmp2.lengthSq()>1e-8)tmp2.normalize();
    return o.copy(tmp2).multiplyScalar(CL*q).addScaledVector(u,CD*q); };
  // the line between hand and kite under its own weight and the wind across it: a shallow catenary, sag = qL^2/8T, its end tangent tips the bridle
  const lineLoad=(h,kp,tm)=>{ C.subVectors(kp,h); const L=Math.max(C.length(),.01); C.divideScalar(L); KITE.wind((h.y+kp.y)/2-g0(),tm,tmp); tmp.addScaledVector(C,-tmp.dot(C));
    const s=tmp.length(); k.q.copy(tmp).multiplyScalar(.5*RHO*s*LINE_D*1.1).add(tmp2.set(0,-LINE_KG*G,0)); return L; };
  const hold=id=>{ k.id=id; KITE.mass=ITEMS.prop(id,'weight')||.05; };
  KITE.launch=()=>{ '@later'; const id=WIELD.on; if(!id||ITEMS.prop(id,'grants')!=='fly')return; if(!open())return say('THERE IS NO WIND IN HERE.','#c8a090'); hold(id); handAt(hand); hv.set(0,0,0);
    KITE.wind(2,performance.now()/1000,W); const wl=Math.hypot(W.x,W.z)||1; k.p.copy(hand).add(tmp.set(W.x/wl*1.3,.35,W.z/wl*1.3)); k.v.set(0,.5,0); k.L=k.p.distanceTo(hand)+.05; k.ten=0; k.roll=0; k.ground=false; KITE.on=true;
    for(let i=0;i<NT;i++){ tail[i].p.copy(k.p).y-=.6+i*TSEG; tail[i].o.copy(tail[i].p); } SFX.play('step',{vol:.3,pitch:1.6}); share(1); hud(); };
  KITE.stow=msg=>{ if(!KITE.on)return; KITE.on=false; KITE.reeling=false; if(msg)say(msg); share(1); hud(); };
  KITE.click=()=>{ if(!KITE.on)return KITE.launch(); if(k.ground&&k.L<6)return KITE.stow('YOU PICK UP THE KITE AND WIND THE LINE.'); KITE.reeling=true; MOTION.play('pull',{loop:true,while:()=>KITE.reeling&&KITE.on}); };
  const step=(dt,tm)=>{ '@later'; handAt(tmp); hv.subVectors(tmp,hand).divideScalar(Math.max(dt,1e-3)); hand.copy(tmp);
    if(hand.distanceTo(k.p)>k.L+25)return KITE.stow('THE KITE LINE SLIPS FROM YOUR HAND. YOU WIND IT BACK.');
    const mass=KITE.mass, N=Math.ceil(dt/.004), h=dt/N; let J=0; const gy=g0();
    for(let n=0;n<N;n++){ const L=lineLoad(hand,k.p,tm), sag=cl(k.q.length()*k.L*k.L/(8*Math.max(k.ten,.05)),0,.3*k.L), Lc=k.L-Math.min(.12*k.L,8*sag*sag/(3*Math.max(k.L,.1)));
      // the line at the kite pulls toward the hand, tipped by the sag toward the load
      t.copy(C).negate().addScaledVector(tmp.copy(k.q).addScaledVector(C,-k.q.dot(C)).normalize(),4*sag/Math.max(L,.1)*(L>Lc*.98?1:0)).normalize();
      KITE.wind(k.p.y-gy,tm,W); wa.subVectors(W,k.v); k.roll=.08*nz(tm*1.7,4);
      attitude(t,W.lengthSq()>1e-4?W:tmp.set(1,0,0),k.roll,k);
      aero(k.nw,wa,AREA,F); const tl=wa.length(); F.addScaledVector(wa,.5*RHO*tl*.02).add(tmp.set(0,-mass*G,0)).addScaledVector(k.q,L*.5);
      k.v.addScaledVector(F,h/mass); k.p.addScaledVector(k.v,h);
      u.subVectors(k.p,hand); const d=u.length(); if(d>Lc){ u.divideScalar(d); k.p.copy(hand).addScaledVector(u,Lc); const vr=tmp.subVectors(k.v,hv).dot(u); if(vr>0){ k.v.addScaledVector(u,-vr); J+=mass*vr; } }
      k.ground=k.p.y<gy+.05; if(k.ground){ k.p.y=gy+.05; if(k.v.y<0)k.v.y=0; k.v.multiplyScalar(Math.exp(-h*6)); } k.sag=sag; }
    k.ten+=(J/dt-k.ten)*(1-Math.exp(-dt/.2));
    // you let line run while the kite is up and pulling hard; held, you wind it in
    if(KITE.reeling)k.L=Math.max(1.5,k.L-2.2*dt); else{ const T0=Math.max(.6,2.5*mass*G), el=(k.p.y-hand.y)/Math.max(k.p.distanceTo(hand),.01); if(k.ten>T0&&el>.55&&!k.ground&&k.L<MAXL)k.L=Math.min(MAXL,k.L+Math.min(3,(k.ten-T0)*1.5)*dt); }
    if(KITE.reeling&&k.L<=1.6)KITE.stow('YOU WIND THE KITE IN.');
    // the tail: a light chain off the kite's foot, dragged out downwind
    tmp.copy(k.nose).multiplyScalar(-.6).add(k.p); tail[0].p.copy(tmp); tail[0].o.copy(tmp);
    for(let i=1;i<NT;i++){ const q=tail[i], vel=tmp2.subVectors(q.p,q.o); q.o.copy(q.p); KITE.wind(q.p.y-gy,tm+i*.05,W); vel.lerp(W.multiplyScalar(dt),cl(dt*5,0,1)); q.p.add(vel); q.p.y-=G*dt*dt*.5; if(q.p.y<gy+.02)q.p.y=gy+.02; }
    for(let it=0;it<3;it++)for(let i=1;i<NT;i++){ const a=tail[i-1].p, b=tail[i].p; u.subVectors(b,a); const d=u.length()||1; b.copy(a).addScaledVector(u,TSEG/d); } };

  /* ---------- drawing: yours and everyone else's ---------- */
  const mk=()=>{ const s=sail(), tl=ribbon(NT,0xd8402e), ln=lineOf(); for(const o of [s,tl,ln]){ o.visible=false; o.userData.anyRoom=true; scene.add(LEVELS.own(o,'*')); } return {s,tl,ln}; };
  let mine=null; const Q=new THREE.Matrix4();
  const place=(D,kp,nw,nose,r,h,q,sag,tl)=>{ '@later'; D.s.visible=D.ln.visible=true; Q.makeBasis(r,nose,nw).setPosition(kp.x*M,kp.y*M,kp.z*M); D.s.matrixAutoUpdate=false; D.s.matrix.copy(Q); D.s.matrixWorldNeedsUpdate=true;
    const a=D.ln.geometry.attributes.position; C.subVectors(kp,h); m.copy(C).normalize(); tmp.copy(q).addScaledVector(m,-q.dot(m)); if(tmp.lengthSq()>1e-12)tmp.normalize();
    for(let i=0;i<=NL;i++){ const f=i/NL; a.setXYZ(i,(h.x+C.x*f+tmp.x*4*sag*f*(1-f))*M,(h.y+C.y*f+tmp.y*4*sag*f*(1-f))*M,(h.z+C.z*f+tmp.z*4*sag*f*(1-f))*M); } a.needsUpdate=true;
    D.tl.visible=!!tl; if(tl){ const b=D.tl.geometry.attributes.position; for(let i=0;i<NT;i++){ const p=tl[i].p, w=.025*(1-i/NT*.5); b.setXYZ(i*2,(p.x-r.x*w)*M,(p.y-r.y*w)*M,(p.z-r.z*w)*M); b.setXYZ(i*2+1,(p.x+r.x*w)*M,(p.y+r.y*w)*M,(p.z+r.z*w)*M); } b.needsUpdate=true; } };
  const hide=D=>{ if(D)D.s.visible=D.tl.visible=D.ln.visible=false; };
  KITE.aim=(dt,aim)=>{ const h=SHARED.heading; if(!KITE.on)return aim.set(Math.sin(h)*.6,.55,Math.cos(h)*.6).normalize(),true;
    aim.subVectors(k.p,hand).normalize(); aim.y=cl(aim.y,-.2,.75)+(KITE.reeling?Math.sin(performance.now()/60)*.05:0); return aim.normalize(),true; };
  const free=()=>!(st.water&&st.water.in||st.ride||st.climb||st.hang||VIT.dead);
  const HUD=document.createElement('div'); HUD.hidden=true; HUD.style.cssText='position:fixed;left:50%;bottom:52px;transform:translateX(-50%);z-index:7;font:11px Silkscreen,monospace;color:#e8e2cc;background:#0b0d13e0;border:2px solid #3a3f4e;padding:6px 10px;min-width:260px;text-align:center;zoom:var(--uiz,1)'; document.body.appendChild(HUD);
  let hudT=0; const hud=()=>{ '@later'; if(!KITE.on){ HUD.hidden=true; return; } HUD.hidden=false; const up=k.p.y-g0(), w=KITE.wind(up,performance.now()/1000,tmp).length();
    HUD.innerHTML=`${k.ground?'ON THE GROUND · CLICK TO PICK IT UP':KITE.reeling?'WINDING IN':'FLYING · HOLD THE MOUSE TO WIND IN'}<br>WIND ${w.toFixed(1)} M/S · UP ${Math.max(0,up).toFixed(0)} M · LINE ${k.L.toFixed(0)} M · PULL ${k.ten.toFixed(1)} N`; };
  let shT=0; const share=(now,dt)=>{ if(!ONLINE.on)return; shT-=now?99:dt||0; if(shT>0)return; shT=.25; ONLINE.send({t:'kite',k:KITE.on?[k.p.x,k.p.y,k.p.z].map(v=>Math.round(v*M*100)/100):null}); };
  const theirs=new Map(), P=new V3(), nwT={nw:new V3(),nose:new V3(),r:new V3()};
  ONLINE.hear.kite=msg=>{ '@later'; let o=theirs.get(msg.id); if(!Array.isArray(msg.k)||!ONLINE.others.has(msg.id)){ if(o){ for(const x of Object.values(o.D))x.removeFromParent(); theirs.delete(msg.id); } return; }
    if(!o)theirs.set(msg.id,o={D:mk(),p:new V3(+msg.k[0]/M,+msg.k[1]/M,+msg.k[2]/M),to:new V3()}); o.to.set(+msg.k[0]/M||0,+msg.k[1]/M||0,+msg.k[2]/M||0); o.at=performance.now(); };
  const drawTheirs=dt=>{ '@later'; const now=performance.now(), tm=now/1000;
    for(const [id,o] of theirs){ const R=ONLINE.others.get(id), F2=R&&R.fig; if(!R||now-o.at>3000||!F2){ for(const x of Object.values(o.D))x.removeFromParent(); theirs.delete(id); continue; }
      o.p.lerp(o.to,1-Math.exp(-dt*4)); F2.g.updateMatrixWorld(true); const J=R.B&&R.B.J; if(J&&J.palmR)P.set(J.palmR.x,J.palmR.y,J.palmR.z).applyMatrix4(F2.g.matrixWorld).divideScalar(M); else P.copy(F2.g.position).divideScalar(M).y+=1.4;
      C.subVectors(P,o.p).normalize(); KITE.wind(o.p.y-P.y+1.4,tm,W); attitude(C,W.lengthSq()>1e-4?W:tmp.set(1,0,0),.12*nz(tm,3),nwT); place(o.D,o.p,nwT.nw,nwT.nose,nwT.r,P,tmp2.set(0,-1,0),.04*o.p.distanceTo(P),null); } };
  KITE.dbg=()=>({on:KITE.on,id:k.id,at:[k.p.x*M,k.p.y*M,k.p.z*M].map(v=>+v.toFixed(2)),up:+(k.p.y-g0()).toFixed(2),line:+k.L.toFixed(1),pull:+k.ten.toFixed(2),sag:+k.sag.toFixed(2),ground:k.ground,elev:+(Math.asin(cl((k.p.y-hand.y)/Math.max(k.p.distanceTo(hand),.01),-1,1))*57.3).toFixed(1),wind:+KITE.wind(10,0,tmp).length().toFixed(2),theirs:[...theirs].map(([id,o])=>({id,shown:o.D.s.visible}))});
  SYS.add('life',dt=>{ dt=Math.min(dt||0,.05); if(KITE.on){ if(!FORAGE.has(k.id)||WIELD.on!==k.id||!free())KITE.stow('YOU WIND THE KITE IN.'); else if(!open())KITE.stow('THE KITE COMES DOWN; THERE IS NO WIND HERE.'); }
    if(KITE.on&&dt>0){ step(dt,performance.now()/1000); if(!mine)mine=mk(); place(mine,k.p,k.nw,k.nose,k.r,hand,k.q,k.sag,tail); share(0,dt); if((hudT-=dt)<=0){ hudT=.2; hud(); } } else hide(mine);
    if(theirs.size)drawTheirs(dt); },'146g-kite'); }
