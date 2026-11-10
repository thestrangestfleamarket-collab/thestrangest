// THE FRAME: the main loop (frame): movement, collision, water, sun shade, lamps, rooms, culling, then the render.
import {SHARED, THREE} from './003-shx.js';
import {AMB, BATCH, BOAT, BROOK, BUGS, CITY, CLOCK, CULL, DRESS, DRM, ED, EQUIP, FAR3, FEEL, FIGFX, GPH, GPUT, ICE, INTERIORS, keys, LEVELS, LINES, LITE, LOOK, MUS, NPCS, ONLINE, PARK, PB, PERFX, PH, PNM, pos, PS2, RAG, RIDE, ROOMS, SFX, SGM, st, STAGE, TRICKS, UI, VIT, VR, W3, WHERE, WIELD, wvV, ZONES} from './003b-systems.js';
import {EffectComposer, frustum, OCAM, OutputPass, PPU, pxS, renderer, RenderPass, resize, RH, rppu, RW, scene, SCL, ShaderPass, statEl, V0} from './004-main.js';
import {applyTime, ASTEP, BF, C2, cutWalls, lamps, MODS, nightTo, SEEN, shopGroups, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
import {PEEK} from './008-batch.js';
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
let looseAcc=0, J0=null, J0t=0; SHARED.trip=false; const SUNG={t:0,lit:0,k:0,rc:new THREE.Raycaster(),o:new THREE.Vector3(),hit:[],st:[]};

const PAD={mv:null,n:0}; SHARED.target=null;
const VIEW0={yaw:Math.PI/4,pitch:Math.PI/6,ppu:PPU*1.5}; SHARED.yaw=VIEW0.yaw; SHARED.pitch=VIEW0.pitch; SHARED.yawTo=SHARED.yaw; SHARED.pitchTo=SHARED.pitch; SHARED.ppuTo=SHARED.ppu;
// the overhead view moves in whole pixels of the picture (the PS2 filter's chunky ones when it is on), so what stands still on the ground never shimmers from step to step
const SNR=new THREE.Vector3(), SNU=new THREE.Vector3(), snapCam=()=>{ const c=SHARED.cam; if(!c.isOrthographicCamera||UI.persp)return; const L=SHARED.cellLines||RH, w=(c.top-c.bottom)/c.zoom/Math.max(1,L); if(!(w>0))return;
  SNR.set(1,0,0).applyQuaternion(c.quaternion); SNU.set(0,1,0).applyQuaternion(c.quaternion); const a=c.position.dot(SNR), b=c.position.dot(SNU); c.position.addScaledVector(SNR,Math.round(a/w)*w-a).addScaledVector(SNU,Math.round(b/w)*w-b); if(PS2.sp){ const m=n=>((n%4096)+4096)%4096; PS2.sp.uniforms.uO.value.set(m(Math.round(a/w)),m(Math.round(b/w))); } };
const PMIN=Math.PI/12, PMAX=Math.PI/2-0.002, clampP=v=>Math.max(PMIN,Math.min(PMAX,v));
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
let drag=null;
renderer.domElement.addEventListener('pointerdown',e=>{ if(e.button===2||e.button===1){ drag={x:e.clientX,y:e.clientY}; UI.grab(e); renderer.domElement.setPointerCapture(e.pointerId); } });
renderer.domElement.addEventListener('pointermove',e=>{ if(!drag)return; UI.orbit(e.clientX-drag.x,e.clientY-drag.y); drag={x:e.clientX,y:e.clientY}; });
renderer.domElement.addEventListener('pointerup',()=>drag=null);
UI.holdUp=new THREE.Vector3();
renderer.domElement.addEventListener('wheel',e=>{ e.preventDefault(); if(!UI.menuOpen&&UI.pickStep&&UI.pickStep(e.deltaY))return; if(UI.hold&&UI.hold.look&&!UI.persp){ const c=SHARED.cam; UI.hold.dy=(UI.hold.dy||0)-e.deltaY*(c.top-c.bottom)/(c.zoom||1)/1500; return; } UI.zoomLv(e); },{passive:false});
addEventListener('keydown',e=>{ const k=UI.key(e); if(!k)return; if(TRICKS.takes&&TRICKS.takes(k))return; if(FEEL.key(k,e))return; const FT=FEEL.take(); if(k===' '&&!e.repeat&&FT)FEEL.press(); keys.add(k); if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(k==='0'){ SHARED.yawTo=VIEW0.yaw; SHARED.pitchTo=VIEW0.pitch; SHARED.ppuTo=VIEW0.ppu; UI.home(); } if(k==='1'&&!e.repeat&&!ED.on&&WIELD)WIELD.next();
  if(k==='shift'){ if(!e.repeat)SHARED.shiftAlone=true; } else if(!WALKK.has(k))SHARED.shiftAlone=false; if(st.water&&st.water.in&&(k===' '||k==='j')){ e.preventDefault(); } else if(MOVEK[k]&&!e.repeat&&!SHARED.drive&&!RAG.on&&!VIT.dead&&!(VIT.out>0)&&!(SHARED.frozen>0)&&!UI.freeCam&&!ED.on&&!UI.fly&&!(FT&&k===' ')){ RIG.act(st,MOVEK[k]); SYS.run('act',MOVEK[k],1); } });
// a tap of Shift (with the walking keys or alone) switches walk and run (no jog, owner, 9 Nov 2026); Shift with any other key is that key's own
const WALKK=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);
const MOVEK={' ':' ',j:'J',k:'K',r:'R',v:'V',u:'U',n:'N',i:'C','2':'X','3':'Q','4':'E'};
addEventListener('keyup',e=>{ const k=UI.key(e); if(!k)return; keys.delete(k); if(k==='shift'&&SHARED.shiftAlone){ SHARED.shiftAlone=false; SHARED.gait=SHARED.gait?0:2; } if(MOVEK[k]){ RIG.release(st,MOVEK[k]); SYS.run('act',MOVEK[k],0); } });
addEventListener('blur',()=>{ keys.clear(); st.runTarget=0; FEEL.IN.press=0; }); document.addEventListener('visibilitychange',()=>{ if(document.hidden){ keys.clear(); st.runTarget=0; FEEL.IN.press=0; } });
const ray=new THREE.Raycaster(), gplane=new THREE.Plane(new THREE.Vector3(0,1,0),0), hit=new THREE.Vector3();
const marker=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.5).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xf2c14e,transparent:true,opacity:0.8})); marker.visible=false; scene.add(LEVELS.own(marker,'*'));

function collide(p,ox,oz){ if(!VIT.dead){ for(const N of NPCS)if(N.lv===SHARED.LVL&&!N.far)N.push(p); NPCS.pushX(p); if(ONLINE.push)ONLINE.push(p); } const r=0.36; p.x=Math.max(SHARED.BOUND.x0,Math.min(SHARED.BOUND.x1,p.x)); p.z=Math.max(SHARED.BOUND.z0,Math.min(SHARED.BOUND.z1,p.z));
  for(const [x0,z0,x1,z1] of SHARED.solids){ const cx=Math.max(x0,Math.min(x1,p.x)), cz=Math.max(z0,Math.min(z1,p.z)), dx=p.x-cx, dz=p.z-cz, d2=dx*dx+dz*dz;
    if(d2>=r*r)continue; if(d2>1e-8){ const d=Math.sqrt(d2); p.x=cx+dx/d*r; p.z=cz+dz/d*r; }
    else { const o=[p.x-x0+r,x1-p.x+r,p.z-z0+r,z1-p.z+r], m=Math.min(...o); if(m===o[0])p.x=x0-r; else if(m===o[1])p.x=x1+r; else if(m===o[2])p.z=z0-r; else p.z=z1+r; } }
  const D=MODS.dungeon; if(ox!=null&&SHARED.LVL==='down'&&D&&D.tooHigh&&D.tooHigh(p.x,p.z,SHARED.py)){ if(!D.tooHigh(p.x,oz,SHARED.py))p.z=oz; else if(!D.tooHigh(ox,p.z,SHARED.py))p.x=ox; else { p.x=ox; p.z=oz; } } }   // a ledge too high to step up stops you (you walk off one and drop)

const R=new THREE.Vector3(),U=new THREE.Vector3(),F=new THREE.Vector3(),disp=new THREE.Vector3();
let last=performance.now(), fpsT=0, fpsN=0, t=0, carLook=0;
function frame(now,xf){ if(!xf){ requestAnimationFrame(frame); if(VR.on)return; } if(PARK.hold){ if(xf)VR.draw(true); return; } { const R=renderer.info.render; renderer.info.last={calls:R.calls,triangles:R.triangles,points:R.points,lines:R.lines}; } /* last: the frame just drawn, for the render inspector */ renderer.info.reset(); const fT=SYS.timing?performance.now():0, fC=SYS.cs; const dt=Math.max(0,Math.min(0.05,(now-last)/1000)); last=now; SYS.run('every',now); SYS.run('win',now); SHARED.METRO.tick(dt,pos); SYS.run('carry',dt); t+=dt; if(xf)SYS.run('xr',dt,xf);
  if(UI.freeCam?MAPLV(UI.camT.y-.9,UI.camT,true):MAPLV(SHARED.py,pos))setPhys(SHARED.LVL);
  if(MODS.cars&&MODS.cars.driving&&UI.view==='third'){ carLook+=((keys.has('q')?1.5:UI.rotHeld?-1.5:0)-carLook)*Math.min(1,dt*6); SHARED.yawTo=SHARED.heading+Math.PI+carLook; SHARED.pitchTo=.3; }   // driving: locked behind the car, Q and E look left and right, no tilt
  else if(UI.view!=='iso'){ if(keys.has('q'))SHARED.yawTo+=dt*1.8; if(UI.rotHeld)SHARED.yawTo-=dt*1.8; if(keys.has('z'))SHARED.pitchTo=UI.clampV(SHARED.pitchTo-dt*1.2); if(keys.has('x'))SHARED.pitchTo=UI.clampV(SHARED.pitchTo+dt*1.2); }
  if(UI.hold&&!UI.persp){ const H=UI.hold; SHARED.yawTo=H.yaw; SHARED.pitchTo=H.pitch; SHARED.ppuTo=H.ppu; if(UI.off){ H.off?UI.off.copy(H.off):UI.off.set(0,0,0); if(H.look){ const c=SHARED.cam, lim=H.look*(c.top-c.bottom)/(c.zoom||1); H.dy=Math.max(-lim,Math.min(lim,H.dy||0)); UI.off.addScaledVector(UI.holdUp.setFromMatrixColumn(c.matrixWorld,1),H.dy); } } }
  const FT=FEEL.take(), ease=FT?1-Math.exp(-dt*FEEL.cfg.camDamp):Math.min(1,dt*12); SHARED.yaw=Math.abs(SHARED.yawTo-SHARED.yaw)<1e-4?SHARED.yawTo:SHARED.yaw+(SHARED.yawTo-SHARED.yaw)*ease; SHARED.pitch=Math.abs(SHARED.pitchTo-SHARED.pitch)<1e-4?SHARED.pitchTo:SHARED.pitch+(SHARED.pitchTo-SHARED.pitch)*ease; const zk0=UI.zk(); SHARED.ppu=Math.abs(SHARED.ppuTo/SHARED.ppu-1)<1e-4?SHARED.ppuTo:SHARED.ppu*Math.pow(SHARED.ppuTo/SHARED.ppu,ease); if(pxS()!==SCL)resize(); else frustum(); UI.zoomStep(zk0);
  const a=SHARED.yaw, fx=-Math.sin(a), fz=-Math.cos(a);
  let mx=0,mz=0, up=keys.has('w')||keys.has('arrowup'), dn=keys.has('s')||keys.has('arrowdown'), lf=keys.has('a')||keys.has('arrowleft'), rt=keys.has('d')||keys.has('arrowright');
  UI.camStep(dt,a,up,dn,lf,rt); if(UI.freeCam||ED.on||SHARED.fishing)up=dn=lf=rt=false; if(SHARED.frozen>0){ up=dn=lf=rt=false; SHARED.target=null; }
  if(up){mx+=fx;mz+=fz;} if(dn){mx-=fx;mz-=fz;} if(rt){mx+=-fz;mz+=fx;} if(lf){mx-=-fz;mz-=fx;}
  if(PAD.mv&&(up||dn||lf||rt)){ const [lx,ly]=PAD.mv; mx=-ly*fx-lx*fz; mz=-ly*fz+lx*fx; }
  if(!RAG.on&&!UI.fly&&(MODS.apts.lad&&MODS.apts.lad(dt,up,dn,lf||rt||!!SHARED.target)||(MODS.climbs||[]).some(c=>c(dt,up,dn,lf,rt,!!SHARED.target)))){ up=dn=lf=rt=false; mx=mz=0; SHARED.target=null; }
  if(mx||mz)SHARED.target=null; else if(SHARED.target){ const dx=SHARED.target.x-pos.x, dz=SHARED.target.z-pos.z, d=Math.hypot(dx,dz); if(d<0.12)SHARED.target=null; else {mx=dx/d;mz=dz/d;} }
  view0.a=a; P.x=pos.x/TL; P.y=-pos.z/TL; PH.hd=SHARED.heading;
  const hit=PHYOU.hit||0, hn=PHYOU.hitN; PHYOU.hit=0;
  if(!RAG.on&&!(st.water&&st.water.level!=null)&&(SHARED.trip||hit>12)){ const [u,v]=[(Math.sin(PH.hd)+Math.cos(PH.hd))/2,(Math.cos(PH.hd)-Math.sin(PH.hd))/2], [fx2,fy2]=wvV(u,v), n=Math.hypot(fx2,fy2), k=Math.min(3,hit/30);
    const fk=+SHARED.trip||1; ragStart(RIG.pose(st,false),J0,J0t?(now-J0t)/1000:0,SHARED.trip||!hn?[fx2/n*1.6*fk,fy2/n*1.6*fk,.3*fk*fk]:[-hn[0]*k,-hn[1]*k,.2]); SHARED.target=null; }   // SHARED.trip a number: thrown that much harder (out of a kart)
  SHARED.trip=false; let B;
  if(RAG.on){ ragStep(dt); st.target=0; pos.x=P.x*TL; pos.z=-P.y*TL; SHARED.py=0; if(!RAG.on){ SHARED.heading=PH.hd; pos.x=P.x*TL; pos.z=-P.y*TL; } }
  if(RAG.on)B=ragPose();
  else{
    if(SHARED.drive){ mx=0; mz=0; SHARED.target=null; st.runTarget=0; } if(BOAT&&BOAT.on){ BOAT.steer(dt,mx,mz); mx=0; mz=0; SHARED.target=null; } if(RIDE.on){ RIDE.steer(dt,mx,mz); mx=0; mz=0; SHARED.target=null; }
    if(MODS.runner&&MODS.runner.on){ const r=MODS.runner.steer(dt); mx=r[0]; mz=r[1]; SHARED.target=null; st.runTarget=r[2]??1; } const ml=Math.hypot(mx,mz), busy=st.move;
    if(FT){ st.yr=0; if(UI.fly){ if(st.water)st.water.in=false; RIVER.swim=false; } else if(!(ICE.feed&&ICE.feed(st,pos))&&!RIVER.feed(st,pos,dt,ml>0,keys)&&!(FOUNT.feed&&FOUNT.feed(st,pos,dt,ml>0,keys))&&!(BROOK.feed&&BROOK.feed(st,pos,dt,ml>0,keys))&&!(SHARED.BOD.GD&&SHARED.BOD.GD.feed&&SHARED.BOD.GD.feed(st,pos,dt,ml>0,keys))&&!(MODS.waters||[]).some(w=>w.feed&&w.feed(st,pos,dt,ml>0,keys)))WATER.feed(st,pos,dt,ml>0,keys); SYS.run('swim',st,dt,keys,ml>0); st.target=0; RIG.step(st,SHARED.frozen>0?0:dt); FEEL.step(dt,mx,mz); }
    else{
    if(WIELD)WIELD.pre(dt);
    if(ml>0&&!(busy&&busy.def.below!=null)){ const tk=busy?.5:1; let dh=Math.atan2(mx,mz)-SHARED.heading; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); const turn=3*Math.PI*dt*tk; const dd=Math.max(-turn,Math.min(turn,dh*(1-Math.exp(-dt*12*tk)))); SHARED.heading+=dd; st.yr=dd/Math.max(dt,1e-3); } else st.yr=0;
    if(BOAT&&BOAT.on){ BOAT.carry(st,pos); SHARED.heading=BOAT.hd; } else if(RIDE.on&&RIDE.dry){ if(st.water)st.water.in=false; } else if(UI.fly){ if(st.water)st.water.in=false; RIVER.swim=false; } else if(!(ICE.feed&&ICE.feed(st,pos))&&!RIVER.feed(st,pos,dt,ml>0,keys)&&!(FOUNT.feed&&FOUNT.feed(st,pos,dt,ml>0,keys))&&!(BROOK.feed&&BROOK.feed(st,pos,dt,ml>0,keys))&&!(SHARED.BOD.GD&&SHARED.BOD.GD.feed&&SHARED.BOD.GD.feed(st,pos,dt,ml>0,keys))&&!(MODS.waters||[]).some(w=>w.feed&&w.feed(st,pos,dt,ml>0,keys)))WATER.feed(st,pos,dt,ml>0,keys); SYS.run('swim',st,dt,keys,ml>0); st.target=ml>0&&!UI.fly?1:0; const before=st.dist; RIG.step(st,SHARED.frozen>0?0:dt); const go=UI.fly?UI.flyGo(dt,ml>0):(st.dist-before)*W3.SZ/PPU*(SHARED.drag??1)*(VIT.dead&&NPCS.some(N=>N.lv===SHARED.LVL&&!N.far&&N.mode!=='hidden'&&N.blocks(pos.x,pos.z,.3*TILE))?.75:1); SFX.steps(st,go);
    if(go){ const ox=pos.x,oz=pos.z; pos.x+=Math.sin(SHARED.heading)*go; pos.z+=Math.cos(SHARED.heading)*go; if(UI.fly)UI.flyStep(0); else collide(pos,ox,oz); if(st.water&&st.water.in&&RIVER.swim)RIVER.clamp(pos);
    if(SHARED.target&&Math.hypot(pos.x-ox,pos.z-oz)<go*0.2)SHARED.target=null; }
    if(UI.fly)UI.flyStep(dt); else if(BOAT&&BOAT.on)SHARED.py=BOAT.py; else { let g=SHARED.groundY(pos.x,pos.z); if(st.fk&&!st.climb&&!st.hang&&!st.move)for(const n of 'LR'){ const f=st.fk[n]; if(f&&f.on&&Math.hypot(f.x-pos.x,f.z-pos.z)<1)g=Math.min(g,f.y); } if(EQUIP&&EQUIP.float)g+=.6*TILE; if(GPH.floor)g=GPH.floor(g); if(ICE.floor)g=ICE.floor(g); if(RIDE.on)g=RIDE.floor(g); SHARED.py+=(g-SHARED.py)*Math.min(1,dt*(RIDE.on?RIDE.ease:20)); } }
    P.x=pos.x/TL;
    P.y=-pos.z/TL; PH.hd=SHARED.heading;
    { const rf=SHARED.floorFrame, dx=rf?pos.x-rf.x:0, dz=rf?pos.z-rf.z:0;   // on a moving floor (a train) the feet stand in its frame, so they don't step as it moves
      st.world=RAG.on?null:{x:rf?dx*rf.uz-dz*rf.ux:pos.x,z:rf?dx*rf.ux+dz*rf.uz:pos.z,y:SHARED.py,hd:rf?SHARED.heading-Math.atan2(rf.ux,rf.uz):SHARED.heading,kx:1/W3.group.scale.x,ky:1/W3.group.scale.y,gnd:SHARED.groundY,t:now/1000}; B=ED.anim?ED.animPose():RIG.pose(st); ragBlend(B); ragStrikes(B,J0,J0t?(now-J0t)/1000:0); J0=B.J; J0t=now; ASTEP.you.B=B; } }
  const hdA=(RAG.on?RAG.hd:SHARED.heading)-a;
  if(loose.length||FLOATS.bodies.some(b=>Math.hypot(b.x[0]*TL-pos.x,-b.x[1]*TL-pos.z)<2.5))RIG.draw(B,cloud,hdA,uimg,PW,PICH,AX,AY,1,false);
  W3.place(B,pos.x,SHARED.py,pos.z,RAG.on?RAG.hd:SHARED.heading,hdA,ZU); if(WIELD)WIELD.post(B); if(EQUIP&&EQUIP.post)EQUIP.post(B); FEEL.ui(dt); if(!(RIDE.on&&RIDE.cur&&RIDE.cur.seat||B.seat))PB.step(dt,B,pos.x,SHARED.py,pos.z,RAG.on?RAG.hd:SHARED.heading,SHARED.groundY(pos.x,pos.z),RAG.on); if(ED.on)ED.tick();
  phyYouNow(dt); looseAcc+=dt; let nst=0; while(looseAcc>=PHH&&nst<6){ looseAcc-=PHH; nst++; phyStep(loose,STATIC,PHH,null,null); } if(nst>=6)looseAcc=0; looseDraw();

  SYS.go(()=>{ if(UI.freeCam)LITE.tick(dt,UI.camT.x,UI.camT.y,UI.camT.z); else LITE.tick(dt,pos.x,SHARED.py+1.2*TILE,pos.z); },'lite');
  SYS.go(()=>{ let lampW=0; for(const L of lamps){ if(!L.visible||!(L.intensity>0)||!L.parent)continue; const d=Math.hypot(L.position.x-pos.x,L.position.z-pos.z); if(d<6)lampW=Math.max(lampW,(1-d/6)*Math.min(1,L.intensity/(L.userData.i0||L.intensity))); }
  { const G=SUNG, sun=CLOCK.sun, out=SHARED.LVL==='up'&&!ROOMS.cur&&sun&&sun.intensity>.6&&CLOCK.dir&&CLOCK.dir.y>.05; if((G.t-=dt)<=0){ G.t=.15; G.lit=0; if(out){ G.rc.set(G.o.set(pos.x,SHARED.py+1.1*TILE,pos.z),CLOCK.dir); G.rc.camera=SHARED.cam; G.rc.far=40*TILE; let blk=false; const S=G.st; S.length=0; for(const c of scene.children)S.push(c);   // only what is drawn, and the first solid hit is enough
      while(S.length&&!blk){ const o=S.pop(); if(!o.visible||o===W3.group)continue; for(const c of o.children)S.push(c); if(!o.isMesh||!o.layers.test(G.rc.layers))continue; const m=Array.isArray(o.material)?o.material[0]:o.material; if(!m||m.transparent||m.depthWrite===false)continue; G.hit.length=0; o.raycast(G.rc,G.hit); blk=G.hit.length>0; }
      G.lit=blk?0:Math.min(1,(sun.intensity-.6)/1.4); } } G.k+=(G.lit-G.k)*Math.min(1,dt*4); }
  W3.tint.setRGB(.58,.6,.66).lerp(C2.setRGB(1,1,1),Math.max(Math.max(0,lampW)*(ROOMS.cur?0.35:0.7),SUNG.k*.9)); if(ED.on)W3.tint.setRGB(1,1,1); },'tint');
  SYS.go(()=>DRESS.tick(dt,pos),'dress'); SYS.run('dress',dt,pos); SYS.go(()=>RINGX.tick(dt),'ring'); SYS.run('ring',dt); SYS.go(()=>RIVER.tick(dt,pos),'river'); SYS.go(()=>{ FOUNT.tick&&FOUNT.tick(dt,pos); },'fount'); SYS.go(()=>RIVER.hud(),'riverhud'); SYS.go(()=>{ if(BROOK&&BROOK.tick)BROOK.tick(dt,pos); },'brook'); SYS.go(()=>{ const r=MODS.apts.tick(); if(r)SHARED.solids=r; },'apts'); SYS.go(()=>{ const r2=STORE.stackTick&&STORE.stackTick(); if(r2)SHARED.solids=r2; },'storestack'); SYS.go(()=>CITY.tick(dt,pos),'city'); SYS.run('city',dt,pos); SYS.go(()=>NPCS.tick(dt,pos),'npcs'); SYS.go(()=>{ if(SHARED.FIRE)SHARED.FIRE.tick(dt); },'fire'); SYS.go(()=>FIGFX.tick(dt,pos),'figfx'); SYS.go(()=>FLAME.tick(dt,pos),'flame'); SYS.go(()=>MUS.tick(dt),'mus'); SYS.go(()=>PNM.tick(dt),'pnm'); SYS.go(()=>SGM.tick(dt),'sgm'); SYS.go(()=>DRM.tick(dt),'drm'); SYS.go(()=>STAGE.tick(dt),'stage');
  SYS.go(()=>UI.goTick(),'uigo'); SYS.go(()=>UI.runTick(),'uirun'); SYS.go(()=>BATCH.tick(dt),'batch'); SYS.run('clockPre',dt); SYS.go(()=>CLOCK.tick(dt),'clock'); SYS.run('sky',dt); SYS.run('life',dt); SYS.run('places',dt); SYS.run('vitalsPre',dt); SYS.go(()=>VIT.tick(dt),'vit'); SYS.run('vitals',dt); SYS.go(()=>LOOK.tick(),'look'); SYS.go(()=>WHERE.tick(dt),'where'); SYS.go(()=>AMB.tick(dt),'amb'); SYS.go(()=>LINES.tick(dt),'lines');
  SYS.go(()=>{ marker.visible=!!SHARED.target; if(SHARED.target){ marker.position.set(SHARED.target.x,SHARED.groundY(SHARED.target.x,SHARED.target.z)+0.03,SHARED.target.z); marker.material.opacity=0.5+0.4*Math.sin(t*8); } },'marker');
  SYS.go(()=>{ for(const sg of shopGroups)sg.scale.y+=(cut-sg.scale.y)*Math.min(1,dt*8); },'shopcut');
  SYS.go(()=>{ if(SHARED.night!==nightTo){ SHARED.night+=(nightTo-SHARED.night)*Math.min(1,dt*2.5); if(Math.abs(nightTo-SHARED.night)<0.002)SHARED.night=nightTo; applyTime(SHARED.night); } },'night');
  if(UI.freeCam)disp.copy(UI.camT); else{ UI.follow&&UI.follow(); disp.set(pos.x,SHARED.py+(ED.on?0.85:!UI.persp&&UI.mid?UI.mid():0),pos.z); disp.add(UI.off); } F.set(Math.sin(a)*Math.cos(SHARED.pitch),Math.sin(SHARED.pitch),Math.cos(a)*Math.cos(SHARED.pitch));
  UI.view3(a); SHARED.cam.quaternion.setFromEuler(UI.eul.set(-SHARED.pitch,a,0,'YXZ')); SHARED.cam.position.copy(disp).addScaledVector(F,300); { const n=SHARED.pitch<0.05?300-1.5*TILE:UI.view==='iso'&&!UI.persp&&!UI.freeCam?Math.max(.1,300-Math.max(20*TILE,1.2*OCAM.top/Math.tan(SHARED.pitch)+3*TILE)):.1; if(Math.abs(OCAM.near-n)>.01){ OCAM.near=n; OCAM.updateProjectionMatrix(); } }   /* the overhead view draws nothing further from you toward the camera than the screen's bottom edge needs (at least 20 tiles) */ UI.view3b(a,dt); SYS.run('cam',dt); snapCam(); SHARED.cam.updateMatrixWorld();
  you.quaternion.copy(SHARED.cam.quaternion); you.position.copy(disp).addScaledVector(F,0.35);
  SYS.go(()=>{ for(const w of cutWalls)w.pl.constant=(!UI.persp&&(w.always||Math.sin(a)*w.nx+Math.cos(a)*w.nz<-0.05)&&SHARED.pitch<1.45&&SHARED.pitch>=0.05&&!ROOMS.cur&&(!w.when||w.when()))?w.foot:1e6; },'cutwalls');
  SYS.go(()=>{ const bi=SHARED.BODB.inside(), cy=SHARED.cam.position.y; for(const r of SHARED.BODB.roof){ if(r.userData.y0==null){ r.geometry.computeBoundingBox(); r.updateMatrixWorld(); r.userData.y0=r.geometry.boundingBox.min.y+r.matrixWorld.elements[13]; } SEEN(r,!bi||cy<r.userData.y0); } },'roofs');
  SYS.go(()=>ROOMS.tick(),'rooms'); SYS.run('rooms'); SYS.go(()=>ZONES.tick(),'zones'); SYS.go(()=>INTERIORS.tick(),'interiors'); SYS.go(()=>PERFX.tick(),'perfx'); SYS.go(()=>STORE.tick(),'store'); SYS.go(()=>NPCS.cull(true),'npccullA'); SYS.go(()=>INTERIORS.cull(true),'intcullA'); SYS.go(()=>{ LEVELS.H=LEVELS.hide(); },'levelhide'); SYS.go(()=>CULL.begin(),'cullbegin'); SYS.go(()=>{ if(PERFX.bfNear())BF.tick(dt); },'bf'); SYS.go(()=>WATER.tickAll(renderer,dt,pos),'water'); SYS.run('water',renderer,dt,pos); if(!xf||VR.pass.shadow)renderer.shadowMap.needsUpdate=true; SYS.go(()=>{ if(!xf||VR.pass.water)WATER.underAll(renderer,scene,SHARED.cam,lamps); },'waterunder'); SYS.go(()=>{ if(!xf||VR.pass.water)RIVER.pre(renderer,scene,SHARED.cam,dt,pos); },'riverpre'); SYS.go(()=>{ FOUNT.pre&&FOUNT.pre(scene,SHARED.cam); },'fountpre'); SYS.go(()=>{ for(const w of MODS.waters||[])if(w.pre)w.pre(scene,SHARED.cam); },'waterspre'); SYS.go(()=>FAR3.pre(renderer,SHARED.cam),'far3pre'); SYS.go(()=>{ if(!xf||VR.pass.shadow)W3.shadowPass(renderer); },'w3shadow'); SYS.go(()=>{ if(OUTL.on&&!xf)OUTL.render(renderer,scene,SHARED.cam); },'outl'); SYS.go(()=>PEEK.tick(dt),'peek'); SYS.go(()=>SHARED.foldPick(),'fold'); CLOCK.main=1; if(xf)VR.draw(); else if(SHARED.drive&&SHARED.drive.draw)SHARED.drive.draw(); else if(!SHARED.covered){ try{ SHARED.composer.render(); }catch(e){ if(!/toArray/.test(e&&e.message))throw e; BUGS.badUni(scene,e); } SYS.run('overlay',dt); } CLOCK.main=0; SYS.go(()=>{ for(const w of MODS.waters||[])if(w.post)w.post(scene); },'waterspost'); SYS.go(()=>{ FOUNT.post&&FOUNT.post(scene); },'fountpost'); SYS.go(()=>RIVER.post(scene),'riverpost'); SYS.go(()=>FAR3.post(),'far3post'); SYS.go(()=>CULL.end(),'cullend'); SYS.go(()=>{ LEVELS.show(LEVELS.H); LEVELS.H=null; },'levelshow'); SYS.go(()=>NPCS.cull(false),'npccullB'); SYS.go(()=>INTERIORS.cull(false),'intcullB');
  fpsN++; fpsT+=dt; if(fpsT>0.5){ const RI=renderer.info.render; statEl.textContent=`${Math.round(fpsN/fpsT)} fps${GPUT&&GPUT.on&&GPUT.frame?` · gpu ${GPUT.frame.toFixed(1)} ms`:''} · ${Math.round(RI.calls/fpsN)} draws · ${(RI.triangles/fpsN/1000).toFixed(1)}k tris · ${RW}×${RH} px · turn ${Math.round(((a*180/Math.PI)%360+360)%360)}° · tilt ${Math.round(SHARED.pitch*180/Math.PI)}° · zoom ${(SCL*rppu()/V0).toFixed(2)}×`; renderer.info.reset(); fpsN=0; fpsT=0; }
  if(fT)SYS.took('frame',fT,fC);
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
W3.lv.value=2;
const SKEL=__LAZY__("data/skel.json");
export {clampP, collide, disp, frame, marker, PAD, PMAX, PMIN, ray, SKEL, VIEW0};
