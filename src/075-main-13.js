// THE FRAME: the main loop (frame): movement, collision, water, sun shade, lamps, rooms, culling, then the render.
import {SHARED, THREE} from './003-shx.js';
import {AMB, BOAT, BROOK, BWK, CITY, CLOCK, CULL, DRESS, DRM, ED, EQUIP, FAR3, FEEL, FIGFX, INTERIORS, keys, LEVELS, LINES, LITE, LOOK, MUS, NPCS, ONLINE, PARK, PB, PERFX, PH, PNM, pos, RAG, ROOMS, SFX, SGM, st, STAGE, UI, VIT, VR, W3, WHERE, WIELD, wvV, ZONES} from './003b-systems.js';
import {EffectComposer, frustum, OCAM, OutputPass, PPU, pxS, renderer, RenderPass, resize, RH, rppu, RW, scene, SCL, ShaderPass, statEl, V0, ZMAX} from './004-main.js';
import {applyTime, ASTEP, BF, C2, cutWalls, lamps, MODS, nightTo, SEEN, shopGroups, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
import {BATCH, PEEK} from './008-batch.js';
import {WATER} from './009-down.js';
import {FOUNT} from './060a-fount.js';
import {MAPLV} from './064-map-post.js';
import {RINGX} from './065-ring.js';
import {RIVER} from './066-river.js';
import {AX, AY, cloud, PICH, PW, uimg, you} from './071-main-11.js';
import {OUTL} from './072-walker3d.js';
import {loose, looseDraw, P, PHH, PHYOU, phyStep, phyYouNow, ragBlend, ragPose, ragStart, ragStep, ragStrikes, setPhys, STATIC, TL, view0} from './073-main-12.js';
import {FLOATS} from './074-floats.js';

looseDraw();
let looseAcc=0, J0=null, J0t=0; SHARED.trip=false; const SUNG={t:0,lit:0,k:0,rc:new THREE.Raycaster(),o:new THREE.Vector3(),hit:[]};

const PAD={mv:null,n:0}; SHARED.target=null;
const VIEW0={yaw:Math.PI/4,pitch:Math.PI/6,ppu:PPU}; SHARED.yaw=VIEW0.yaw; SHARED.pitch=VIEW0.pitch; SHARED.yawTo=SHARED.yaw; SHARED.pitchTo=SHARED.pitch; SHARED.ppuTo=SHARED.ppu;
const PMIN=0.17, PMAX=Math.PI/2-0.002, clampP=v=>Math.max(PMIN,Math.min(PMAX,v));
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
let drag=null;
renderer.domElement.addEventListener('pointerdown',e=>{ if(e.button===2||e.button===1){ drag={x:e.clientX,y:e.clientY}; UI.grab(e); renderer.domElement.setPointerCapture(e.pointerId); } });
renderer.domElement.addEventListener('pointermove',e=>{ if(!drag)return; UI.orbit(e.clientX-drag.x,e.clientY-drag.y); drag={x:e.clientX,y:e.clientY}; });
renderer.domElement.addEventListener('pointerup',()=>drag=null);
UI.holdUp=new THREE.Vector3();
renderer.domElement.addEventListener('wheel',e=>{ '@later'; e.preventDefault(); if(UI.hold&&UI.hold.look&&!UI.persp){ const c=SHARED.cam; UI.hold.dy=(UI.hold.dy||0)-e.deltaY*(c.top-c.bottom)/(c.zoom||1)/1500; return; } if(e.deltaY>0&&!UI.persp&&RW/rppu()>=UI.MAXW*.995)return; SHARED.ppuTo=Math.max(3,Math.min(ZMAX,SHARED.ppuTo*Math.pow(1.0015,-e.deltaY))); UI.wheelAt(e); },{passive:false});
addEventListener('keydown',e=>{ const k=UI.key(e); if(!k)return; if(FEEL.key(k,e))return; const FT=FEEL.take(); if(k===' '&&!e.repeat&&FT)FEEL.press(); keys.add(k); if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(k==='0'){ SHARED.yawTo=VIEW0.yaw; SHARED.pitchTo=VIEW0.pitch; SHARED.ppuTo=VIEW0.ppu; UI.home(); } if(k==='h')document.getElementById('hud').hidden^=1; if(k==='1'&&!e.repeat&&!ED.on&&window.WIELD)WIELD.next();
  if(k==='shift'&&!VIT.tired)st.runTarget=1; if(k==='f'&&!e.repeat&&!UI.freeCam&&!UI.fly&&!ED.on&&!VIT.dead&&!(VIT.out>0))SHARED.trip=true; if(st.water&&st.water.in&&(k===' '||k==='j')){ e.preventDefault(); } else if(MOVEK[k]&&!e.repeat&&!RAG.on&&!VIT.dead&&!(VIT.out>0)&&!UI.freeCam&&!ED.on&&!(UI.fly&&k===' ')&&!(FT&&k===' ')){ RIG.act(st,MOVEK[k]); SYS.run('act',MOVEK[k],1); } });
const MOVEK={' ':' ',j:'J',k:'K',r:'R',v:'V',u:'U',n:'N',i:'C','2':'X','3':'Q','4':'E'};
addEventListener('keyup',e=>{ const k=UI.key(e); if(!k)return; keys.delete(k); if(k==='shift')st.runTarget=0; if(MOVEK[k]){ RIG.release(st,MOVEK[k]); SYS.run('act',MOVEK[k],0); } });
addEventListener('blur',()=>{ keys.clear(); st.runTarget=0; FEEL.IN.press=0; }); document.addEventListener('visibilitychange',()=>{ if(document.hidden){ keys.clear(); st.runTarget=0; FEEL.IN.press=0; } });
const ray=new THREE.Raycaster(), gplane=new THREE.Plane(new THREE.Vector3(0,1,0),0), hit=new THREE.Vector3();
const marker=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.5).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xf2c14e,transparent:true,opacity:0.8})); marker.visible=false; scene.add(LEVELS.own(marker,'*'));

function collide(p){ if(!VIT.dead){ for(const N of NPCS)if(N.lv===SHARED.LVL&&!N.far)N.push(p); if(ONLINE.push)ONLINE.push(p); } const r=0.36; p.x=Math.max(SHARED.BOUND.x0,Math.min(SHARED.BOUND.x1,p.x)); p.z=Math.max(SHARED.BOUND.z0,Math.min(SHARED.BOUND.z1,p.z));
  for(const [x0,z0,x1,z1] of SHARED.solids){ const cx=Math.max(x0,Math.min(x1,p.x)), cz=Math.max(z0,Math.min(z1,p.z)), dx=p.x-cx, dz=p.z-cz, d2=dx*dx+dz*dz;
    if(d2>=r*r)continue; if(d2>1e-8){ const d=Math.sqrt(d2); p.x=cx+dx/d*r; p.z=cz+dz/d*r; }
    else { const o=[p.x-x0+r,x1-p.x+r,p.z-z0+r,z1-p.z+r], m=Math.min(...o); if(m===o[0])p.x=x0-r; else if(m===o[1])p.x=x1+r; else if(m===o[2])p.z=z0-r; else p.z=z1+r; } } }

const R=new THREE.Vector3(),U=new THREE.Vector3(),F=new THREE.Vector3(),disp=new THREE.Vector3();
let last=performance.now(), fpsT=0, fpsN=0, t=0;
function frame(now,xf){ if(!xf){ requestAnimationFrame(frame); if(VR.on)return; } if(PARK.hold){ if(xf)VR.draw(true); return; } renderer.info.reset(); const dt=Math.max(0,Math.min(0.05,(now-last)/1000)); last=now; SHARED.METRO.tick(dt,pos); SYS.run('carry',dt); t+=dt; if(xf)SYS.run('xr',dt,xf);
  if(UI.freeCam?MAPLV(UI.camT.y-.9,UI.camT,true):MAPLV(SHARED.py,pos))setPhys(SHARED.LVL);
  if(UI.view!=='iso'){ if(keys.has('q'))SHARED.yawTo+=dt*1.8; if(keys.has('e'))SHARED.yawTo-=dt*1.8; if(keys.has('z'))SHARED.pitchTo=UI.clampV(SHARED.pitchTo-dt*1.2); if(keys.has('x'))SHARED.pitchTo=UI.clampV(SHARED.pitchTo+dt*1.2); }
  if(UI.hold&&!UI.persp){ const H=UI.hold; SHARED.yawTo=H.yaw; SHARED.pitchTo=H.pitch; SHARED.ppuTo=H.ppu; if(UI.off){ H.off?UI.off.copy(H.off):UI.off.set(0,0,0); if(H.look){ const c=SHARED.cam, lim=H.look*(c.top-c.bottom)/(c.zoom||1); H.dy=Math.max(-lim,Math.min(lim,H.dy||0)); UI.off.addScaledVector(UI.holdUp.setFromMatrixColumn(c.matrixWorld,1),H.dy); } } }
  const FT=FEEL.take(), ease=FT?1-Math.exp(-dt*FEEL.cfg.camDamp):Math.min(1,dt*12); SHARED.yaw=Math.abs(SHARED.yawTo-SHARED.yaw)<1e-4?SHARED.yawTo:SHARED.yaw+(SHARED.yawTo-SHARED.yaw)*ease; SHARED.pitch=Math.abs(SHARED.pitchTo-SHARED.pitch)<1e-4?SHARED.pitchTo:SHARED.pitch+(SHARED.pitchTo-SHARED.pitch)*ease; const zk0=UI.zk(); SHARED.ppu=Math.abs(SHARED.ppuTo/SHARED.ppu-1)<1e-4?SHARED.ppuTo:SHARED.ppu*Math.pow(SHARED.ppuTo/SHARED.ppu,ease); if(pxS()!==SCL)resize(); else frustum(); UI.zoomStep(zk0);
  const a=SHARED.yaw, fx=-Math.sin(a), fz=-Math.cos(a);
  let mx=0,mz=0, up=keys.has('w')||keys.has('arrowup'), dn=keys.has('s')||keys.has('arrowdown'), lf=keys.has('a')||keys.has('arrowleft'), rt=keys.has('d')||keys.has('arrowright');
  UI.camStep(dt,a,up,dn,lf,rt); if(UI.freeCam||ED.on||SHARED.fishing)up=dn=lf=rt=false;
  if(up){mx+=fx;mz+=fz;} if(dn){mx-=fx;mz-=fz;} if(rt){mx+=-fz;mz+=fx;} if(lf){mx-=-fz;mz-=fx;}
  if(PAD.mv&&(up||dn||lf||rt)){ const [lx,ly]=PAD.mv; mx=-ly*fx-lx*fz; mz=-ly*fz+lx*fx; }
  if(!RAG.on&&(MODS.apts.lad&&MODS.apts.lad(dt,up,dn,lf||rt||!!SHARED.target)||(MODS.climbs||[]).some(c=>c(dt,up,dn,lf||rt||!!SHARED.target)))){ up=dn=lf=rt=false; mx=mz=0; SHARED.target=null; }
  if(mx||mz)SHARED.target=null; else if(SHARED.target){ const dx=SHARED.target.x-pos.x, dz=SHARED.target.z-pos.z, d=Math.hypot(dx,dz); if(d<0.12)SHARED.target=null; else {mx=dx/d;mz=dz/d;} }
  view0.a=a; P.x=pos.x/TL; P.y=-pos.z/TL; PH.hd=SHARED.heading;
  const hit=PHYOU.hit||0, hn=PHYOU.hitN; PHYOU.hit=0;
  if(!RAG.on&&!(st.water&&st.water.level!=null)&&(SHARED.trip||hit>12)){ const [u,v]=[(Math.sin(PH.hd)+Math.cos(PH.hd))/2,(Math.cos(PH.hd)-Math.sin(PH.hd))/2], [fx2,fy2]=wvV(u,v), n=Math.hypot(fx2,fy2), k=Math.min(3,hit/30);
    ragStart(RIG.pose(st,false),J0,J0t?(now-J0t)/1000:0,SHARED.trip||!hn?[fx2/n*1.6,fy2/n*1.6,.3]:[-hn[0]*k,-hn[1]*k,.2]); SHARED.target=null; }
  SHARED.trip=false; let B;
  if(RAG.on){ ragStep(dt); st.target=0; pos.x=P.x*TL; pos.z=-P.y*TL; SHARED.py=0; if(!RAG.on){ SHARED.heading=PH.hd; pos.x=P.x*TL; pos.z=-P.y*TL; } }
  if(RAG.on)B=ragPose();
  else{
    if(window.BOAT&&BOAT.on){ BOAT.steer(dt,mx,mz); mx=0; mz=0; SHARED.target=null; } const ml=Math.hypot(mx,mz), busy=st.move;
    if(FT){ st.yr=0; if(!RIVER.feed(st,pos,dt,ml>0,keys)&&!(FOUNT.feed&&FOUNT.feed(st,pos,dt,ml>0,keys))&&!(BROOK.feed&&BROOK.feed(st,pos,dt,ml>0,keys))&&!(SHARED.BOD.GD&&SHARED.BOD.GD.feed&&SHARED.BOD.GD.feed(st,pos,dt,ml>0,keys))&&!(MODS.waters||[]).some(w=>w.feed&&w.feed(st,pos,dt,ml>0,keys)))WATER.feed(st,pos,dt,ml>0,keys); SYS.run('swim',st,dt,keys,ml>0); st.target=0; RIG.step(st,dt); FEEL.step(dt,mx,mz); }
    else{
    if(window.WIELD)WIELD.pre(dt);
    if(ml>0&&!(busy&&busy.def.below!=null)){ const tk=busy?.5:1; let dh=Math.atan2(mx,mz)-SHARED.heading; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); const turn=3*Math.PI*dt*tk; const dd=Math.max(-turn,Math.min(turn,dh*(1-Math.exp(-dt*12*tk)))); SHARED.heading+=dd; st.yr=dd/Math.max(dt,1e-3); } else st.yr=0;
    if(window.BOAT&&BOAT.on){ BOAT.carry(st,pos); SHARED.heading=BOAT.hd; } else if(!RIVER.feed(st,pos,dt,ml>0,keys)&&!(FOUNT.feed&&FOUNT.feed(st,pos,dt,ml>0,keys))&&!(BROOK.feed&&BROOK.feed(st,pos,dt,ml>0,keys))&&!(SHARED.BOD.GD&&SHARED.BOD.GD.feed&&SHARED.BOD.GD.feed(st,pos,dt,ml>0,keys))&&!(MODS.waters||[]).some(w=>w.feed&&w.feed(st,pos,dt,ml>0,keys)))WATER.feed(st,pos,dt,ml>0,keys); SYS.run('swim',st,dt,keys,ml>0); st.target=ml>0?1:0; const before=st.dist; RIG.step(st,dt); const go=(st.dist-before)*W3.SZ/PPU*(SHARED.drag??1)*(VIT.dead&&NPCS.some(N=>N.lv===SHARED.LVL&&!N.far&&N.mode!=='hidden'&&N.blocks(pos.x,pos.z,.3*TILE))?.75:1); SFX.steps(st,go);
    if(go){ const ox=pos.x,oz=pos.z; pos.x+=Math.sin(SHARED.heading)*go; pos.z+=Math.cos(SHARED.heading)*go; if(UI.fly)UI.flyStep(0); else collide(pos); if(st.water&&st.water.in&&RIVER.swim)RIVER.clamp(pos);
    if(SHARED.target&&Math.hypot(pos.x-ox,pos.z-oz)<go*0.2)SHARED.target=null; }
    if(UI.fly)UI.flyStep(dt); else if(window.BOAT&&BOAT.on)SHARED.py=BOAT.py; else { let g=SHARED.groundY(pos.x,pos.z); if(st.fk)for(const n of 'LR'){ const f=st.fk[n]; if(f&&f.on&&Math.hypot(f.x-pos.x,f.z-pos.z)<1)g=Math.min(g,f.y); } if(window.EQUIP&&EQUIP.float)g+=.6*TILE; SHARED.py+=(g-SHARED.py)*Math.min(1,dt*20); } }
    P.x=pos.x/TL;
    P.y=-pos.z/TL; PH.hd=SHARED.heading;
    { const rf=SHARED.floorFrame, dx=rf?pos.x-rf.x:0, dz=rf?pos.z-rf.z:0;   // on a moving floor (a train) the feet stand in its frame, so they don't step as it moves
      st.world=RAG.on?null:{x:rf?dx*rf.uz-dz*rf.ux:pos.x,z:rf?dx*rf.ux+dz*rf.uz:pos.z,y:SHARED.py,hd:rf?SHARED.heading-Math.atan2(rf.ux,rf.uz):SHARED.heading,kx:1/W3.group.scale.x,ky:1/W3.group.scale.y,gnd:SHARED.groundY,t:now/1000}; B=ED.anim?ED.animPose():RIG.pose(st); ragBlend(B); ragStrikes(B,J0,J0t?(now-J0t)/1000:0); J0=B.J; J0t=now; ASTEP.you.B=B; } }
  const hdA=(RAG.on?RAG.hd:SHARED.heading)-a;
  if(loose.length||FLOATS.bodies.some(b=>Math.hypot(b.x[0]*TL-pos.x,-b.x[1]*TL-pos.z)<2.5))RIG.draw(B,cloud,hdA,uimg,PW,PICH,AX,AY,1,false);
  W3.place(B,pos.x,SHARED.py,pos.z,RAG.on?RAG.hd:SHARED.heading,hdA,ZU); if(window.WIELD)WIELD.post(B); if(window.EQUIP&&EQUIP.post)EQUIP.post(B); FEEL.ui(dt); PB.step(dt,B,pos.x,SHARED.py,pos.z,RAG.on?RAG.hd:SHARED.heading,SHARED.groundY(pos.x,pos.z),RAG.on); if(ED.on)ED.tick();
  phyYouNow(dt); looseAcc+=dt; let nst=0; while(looseAcc>=PHH&&nst<6){ looseAcc-=PHH; nst++; phyStep(loose,STATIC,PHH,null,null); } if(nst>=6)looseAcc=0; looseDraw();

  if(UI.freeCam)LITE.tick(dt,UI.camT.x,UI.camT.y,UI.camT.z); else LITE.tick(dt,pos.x,SHARED.py+1.2*TILE,pos.z);
  let lampW=0; for(const L of lamps){ if(!L.visible||!(L.intensity>0)||!L.parent)continue; const d=Math.hypot(L.position.x-pos.x,L.position.z-pos.z); if(d<6)lampW=Math.max(lampW,(1-d/6)*Math.min(1,L.intensity/(L.userData.i0||L.intensity))); }
  { const G=SUNG, sun=CLOCK.sun, out=SHARED.LVL==='up'&&!ROOMS.cur&&sun&&sun.intensity>.6&&CLOCK.dir&&CLOCK.dir.y>.05; if((G.t-=dt)<=0){ G.t=.15; G.lit=0; if(out){ G.rc.set(G.o.set(pos.x,SHARED.py+1.1*TILE,pos.z),CLOCK.dir); G.rc.camera=SHARED.cam; G.rc.far=40*TILE; G.hit.length=0; let blk=false;
      for(const h of G.rc.intersectObjects(scene.children,true,G.hit)){ const o=h.object, m=Array.isArray(o.material)?o.material[0]:o.material; let v=true; for(let q=o;q;q=q.parent)if(!q.visible||q===W3.group){ v=false; break; } if(!v||o.isSprite||!m||m.transparent||m.depthWrite===false||o.isPoints||o.isSprite||o.isLine)continue; blk=true; break; }
      G.lit=blk?0:Math.min(1,(sun.intensity-.6)/1.4); } } G.k+=(G.lit-G.k)*Math.min(1,dt*4); }
  W3.tint.setRGB(.58,.6,.66).lerp(C2.setRGB(1,1,1),Math.max(Math.max(0,lampW)*(ROOMS.cur?0.35:0.7),SUNG.k*.9)); if(ED.on)W3.tint.setRGB(1,1,1);
  SYS.go(()=>DRESS.tick(dt,pos),'dress'); SYS.run('dress',dt,pos); SYS.go(()=>RINGX.tick(dt),'ring'); SYS.run('ring',dt); SYS.go(()=>RIVER.tick(dt,pos),'river'); SYS.go(()=>{ FOUNT.tick&&FOUNT.tick(dt,pos); },'fount'); SYS.go(()=>RIVER.hud(),'riverhud'); SYS.go(()=>{ if(window.BROOK&&BROOK.tick)BROOK.tick(dt,pos); },'brook'); SYS.go(()=>{ const r=MODS.apts.tick(); if(r)SHARED.solids=r; },'apts'); SYS.go(()=>{ const r2=STORE.stackTick&&STORE.stackTick(); if(r2)SHARED.solids=r2; },'storestack'); SYS.go(()=>CITY.tick(dt,pos),'city'); SYS.run('city',dt,pos); SYS.go(()=>NPCS.tick(dt,pos),'npcs'); SYS.go(()=>{ if(SHARED.FIRE)SHARED.FIRE.tick(dt); },'fire'); SYS.go(()=>FIGFX.tick(dt,pos),'figfx'); SYS.go(()=>FLAME.tick(dt,pos),'flame'); SYS.go(()=>MUS.tick(dt),'mus'); SYS.go(()=>BWK.tick(dt),'bwk'); SYS.go(()=>PNM.tick(dt),'pnm'); SYS.go(()=>SGM.tick(dt),'sgm'); SYS.go(()=>DRM.tick(dt),'drm'); SYS.go(()=>STAGE.tick(dt),'stage');
  SYS.go(()=>UI.goTick(),'uigo'); SYS.go(()=>UI.runTick(),'uirun'); SYS.go(()=>BATCH.tick(dt),'batch'); SYS.run('clockPre',dt); SYS.go(()=>CLOCK.tick(dt),'clock'); SYS.run('sky',dt); SYS.run('life',dt); SYS.run('places',dt); SYS.run('vitalsPre',dt); SYS.go(()=>VIT.tick(dt),'vit'); SYS.run('vitals',dt); SYS.go(()=>LOOK.tick(),'look'); SYS.go(()=>WHERE.tick(dt),'where'); SYS.go(()=>AMB.tick(dt),'amb'); SYS.go(()=>LINES.tick(dt),'lines');
  marker.visible=!!SHARED.target; if(SHARED.target){ marker.position.set(SHARED.target.x,SHARED.groundY(SHARED.target.x,SHARED.target.z)+0.03,SHARED.target.z); marker.material.opacity=0.5+0.4*Math.sin(t*8); }
  for(const sg of shopGroups)sg.scale.y+=(cut-sg.scale.y)*Math.min(1,dt*8);
  if(SHARED.night!==nightTo){ SHARED.night+=(nightTo-SHARED.night)*Math.min(1,dt*2.5); if(Math.abs(nightTo-SHARED.night)<0.002)SHARED.night=nightTo; applyTime(SHARED.night); }
  if(UI.freeCam)disp.copy(UI.camT); else{ UI.follow&&UI.follow(); disp.set(pos.x,SHARED.py+(ED.on?0.85:0),pos.z); disp.add(UI.off); } F.set(Math.sin(a)*Math.cos(SHARED.pitch),Math.sin(SHARED.pitch),Math.cos(a)*Math.cos(SHARED.pitch));
  UI.view3(a); SHARED.cam.quaternion.setFromEuler(UI.eul.set(-SHARED.pitch,a,0,'YXZ')); SHARED.cam.position.copy(disp).addScaledVector(F,300); { const n=.1; if(Math.abs(OCAM.near-n)>.01){ OCAM.near=n; OCAM.updateProjectionMatrix(); } } UI.view3b(a,dt); SYS.run('cam',dt); SHARED.cam.updateMatrixWorld();
  you.quaternion.copy(SHARED.cam.quaternion); you.position.copy(disp).addScaledVector(F,0.35);
  for(const w of cutWalls)w.pl.constant=(!UI.persp&&(w.always||Math.sin(a)*w.nx+Math.cos(a)*w.nz<-0.05)&&SHARED.pitch<1.45&&(!w.when||w.when()))?w.foot:1e6;
  { const bi=SHARED.BODB.inside(); for(const r of SHARED.BODB.roof)SEEN(r,!bi); }
  SYS.go(()=>ROOMS.tick(),'rooms'); SYS.run('rooms'); SYS.go(()=>ZONES.tick(),'zones'); SYS.go(()=>INTERIORS.tick(),'interiors'); SYS.go(()=>PERFX.tick(),'perfx'); SYS.go(()=>STORE.tick(),'store'); SYS.go(()=>NPCS.cull(true),'npccullA'); SYS.go(()=>INTERIORS.cull(true),'intcullA'); SYS.go(()=>{ LEVELS.H=LEVELS.hide(); },'levelhide'); SYS.go(()=>CULL.begin(),'cullbegin'); SYS.go(()=>{ if(PERFX.bfNear())BF.tick(dt); },'bf'); SYS.go(()=>WATER.tickAll(renderer,dt,pos),'water'); SYS.run('water',renderer,dt,pos); renderer.shadowMap.needsUpdate=true; SYS.go(()=>WATER.underAll(renderer,scene,SHARED.cam,lamps),'waterunder'); SYS.go(()=>RIVER.pre(renderer,scene,SHARED.cam,dt,pos),'riverpre'); SYS.go(()=>{ FOUNT.pre&&FOUNT.pre(scene,SHARED.cam); },'fountpre'); SYS.go(()=>{ for(const w of MODS.waters||[])if(w.pre)w.pre(scene,SHARED.cam); },'waterspre'); SYS.go(()=>FAR3.pre(renderer,SHARED.cam),'far3pre'); SYS.go(()=>W3.shadowPass(renderer),'w3shadow'); SYS.go(()=>{ if(OUTL.on&&!xf)OUTL.render(renderer,scene,SHARED.cam); },'outl'); SYS.go(()=>PEEK.tick(dt),'peek'); SYS.go(()=>SHARED.foldPick(),'fold'); CLOCK.main=1; if(xf)VR.draw(); else SHARED.composer.render(); CLOCK.main=0; SYS.go(()=>{ for(const w of MODS.waters||[])if(w.post)w.post(scene); },'waterspost'); SYS.go(()=>{ FOUNT.post&&FOUNT.post(scene); },'fountpost'); SYS.go(()=>RIVER.post(scene),'riverpost'); SYS.go(()=>FAR3.post(),'far3post'); SYS.go(()=>CULL.end(),'cullend'); SYS.go(()=>{ LEVELS.show(LEVELS.H); LEVELS.H=null; },'levelshow'); SYS.go(()=>NPCS.cull(false),'npccullB'); SYS.go(()=>INTERIORS.cull(false),'intcullB');
  fpsN++; fpsT+=dt; if(fpsT>0.5){ const RI=renderer.info.render; statEl.textContent=`${Math.round(fpsN/fpsT)} fps · ${Math.round(RI.calls/fpsN)} draws · ${(RI.triangles/fpsN/1000).toFixed(1)}k tris · ${RW}×${RH} px · turn ${Math.round(((a*180/Math.PI)%360+360)%360)}° · tilt ${Math.round(SHARED.pitch*180/Math.PI)}° · zoom ${(SCL*rppu()/V0).toFixed(2)}×`; renderer.info.reset(); fpsN=0; fpsT=0; }
}
SHARED.composer=new EffectComposer(renderer); SHARED.composer.setPixelRatio(1); SHARED.composer.addPass(SHARED.RPASS=new RenderPass(scene,SHARED.cam)); { const sp=new ShaderPass(OUTL.pass); SHARED.composer.addPass(sp); OUTL.sp=sp; sp.enabled=!!OUTL.on; OUTL.pass.uniforms=sp.uniforms; sp.uniforms.tId.value=OUTL.rt.texture; sp.uniforms.tint.value=W3.tint; }
// a pass that only changes its own pixel (SHARED.fold) is drawn at the end of the enabled pass just before it when that one can carry it (SHARED.carry): one full-screen pass fewer, the same maths in the same order; folded code reads gl_FragColor and vUv
{ const C=SHARED.composer, FO=[], CA=[], OP=new OutputPass(), EXP={value:1}, TM={[THREE.LinearToneMapping]:'LINEAR',[THREE.ReinhardToneMapping]:'REINHARD',[THREE.CineonToneMapping]:'CINEON',[THREE.ACESFilmicToneMapping]:'ACES_FILMIC',[THREE.AgXToneMapping]:'AGX'};
  C.addPass(OP);
  const glsl=sp=>{ const m=sp.material, u=m.userData, src=u.src||(u.src=m.fragmentShader); if(!u.def0)u.def0=Object.assign({},m.defines);
    for(const f of FO)Object.assign(sp.uniforms,f.uniforms);
    m.fragmentShader=FO.map(f=>f.head).join('\n')+'\n'+src.replace('void main()','void main0()')+'\nvoid main(){ main0();\n'+FO.map(f=>'#ifdef FOLD_'+f.name+'\n'+f.code+'\n#endif').join('\n')+'\n}'; m.needsUpdate=true; };
  SHARED.carry=sp=>{ sp.material.toneMapped=false; CA.push(sp); glsl(sp); };
  SHARED.fold=(name,p,o)=>{ FO.push(Object.assign({name,p},o)); FO.sort((a,b)=>C.passes.indexOf(a.p)-C.passes.indexOf(b.p)); CA.forEach(glsl); };
  SHARED.foldPick=()=>{ const P=C.passes, D=new Map(CA.map(s=>[s,Object.assign({},s.material.userData.def0)]));
    for(const f of FO){ f.p.enabled=true; let c=null; for(let k=P.indexOf(f.p)-1;k>=0&&!c;k--)if(P[k].enabled)c=P[k]; const d=c&&D.get(c); if(d){ Object.assign(d,{['FOLD_'+f.name]:''},f.defs&&f.defs()); f.p.enabled=false; } }
    for(const [s,d] of D){ const m=s.material, k=JSON.stringify(d); if(m.userData.dk!==k){ m.userData.dk=k; m.defines=d; m.needsUpdate=true; } }
    EXP.value=renderer.toneMappingExposure; };
  SHARED.fold('out',OP,{uniforms:{toneMappingExposure:EXP},head:'#include <tonemapping_pars_fragment>',
    code:`#ifdef LINEAR_TONE_MAPPING
gl_FragColor.rgb=LinearToneMapping(gl_FragColor.rgb);
#elif defined(REINHARD_TONE_MAPPING)
gl_FragColor.rgb=ReinhardToneMapping(gl_FragColor.rgb);
#elif defined(CINEON_TONE_MAPPING)
gl_FragColor.rgb=OptimizedCineonToneMapping(gl_FragColor.rgb);
#elif defined(ACES_FILMIC_TONE_MAPPING)
gl_FragColor.rgb=ACESFilmicToneMapping(gl_FragColor.rgb);
#elif defined(AGX_TONE_MAPPING)
gl_FragColor.rgb=AgXToneMapping(gl_FragColor.rgb);
#endif
#ifdef SRGB_TRANSFER
gl_FragColor=sRGBTransferOETF(gl_FragColor);
#endif`,
    defs:()=>{ const d={}; if(THREE.ColorManagement.getTransfer(renderer.outputColorSpace)===THREE.SRGBTransfer)d.SRGB_TRANSFER=''; const t=TM[renderer.toneMapping]; if(t)d[t+'_TONE_MAPPING']=''; return d; }});
  SHARED.carry(OUTL.sp); }
{ const SH={on:true,lv:2}, el=document.getElementById('shd'), draw=()=>{ W3.lv.value=SH.on?(SH.lv>=2?2:1):0; el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s?String(SH.on):String(SH.on&&SH.lv===+b.dataset.l))); el.querySelector('[data-s]').textContent=SH.on?'ON':'OFF'; };
  el.querySelectorAll('button').forEach(b=>b.onclick=()=>{ if(b.dataset.s)SH.on=!SH.on; else{ SH.lv=+b.dataset.l; SH.on=true; } b.blur(); draw(); }); draw(); }
const SKEL=__LAZY__("data/skel.json");
export {clampP, collide, disp, frame, marker, PAD, PMAX, PMIN, ray, SKEL, VIEW0};
