
looseDraw();
let looseAcc=0, J0=null, J0t=0, trip=false; const SUNG={t:0,lit:0,k:0,rc:new THREE.Raycaster(),o:new THREE.Vector3(),hit:[]};

const keys=new Set(), PAD={mv:null,n:0}; let target=null;
const VIEW0={yaw:Math.PI/4,pitch:Math.PI/6,ppu:PPU}; let yaw=VIEW0.yaw, pitch=VIEW0.pitch, yawTo=yaw, pitchTo=pitch, ppuTo=ppu;
const PMIN=0.17, PMAX=Math.PI/2-0.002, clampP=v=>Math.max(PMIN,Math.min(PMAX,v));
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
let drag=null;
renderer.domElement.addEventListener('pointerdown',e=>{ if(e.button===2||e.button===1){ drag={x:e.clientX,y:e.clientY}; UI.grab(e); renderer.domElement.setPointerCapture(e.pointerId); } });
renderer.domElement.addEventListener('pointermove',e=>{ if(!drag)return; UI.orbit(e.clientX-drag.x,e.clientY-drag.y); drag={x:e.clientX,y:e.clientY}; });
renderer.domElement.addEventListener('pointerup',()=>drag=null);
renderer.domElement.addEventListener('wheel',e=>{ e.preventDefault(); let lo=3; if(e.deltaY>0&&!UI.persp){ const w=cam.right-cam.left; if(w>=UI.MAXW*.99)return; lo=Math.max(lo,ppu*w/UI.MAXW); } ppuTo=Math.max(lo,Math.min(ZMAX,ppuTo*Math.pow(1.0015,-e.deltaY))); UI.wheelAt(e); },{passive:false});
addEventListener('keydown',e=>{ const k=UI.key(e); if(!k)return; if(FEEL.key(k,e))return; const FT=FEEL.take(); if(k===' '&&!e.repeat&&FT)FEEL.press(); keys.add(k); if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(k==='0'){ yawTo=VIEW0.yaw; pitchTo=VIEW0.pitch; ppuTo=VIEW0.ppu; UI.home(); } if(k==='h')document.getElementById('hud').hidden^=1; if(k==='1'&&!e.repeat&&!ED.on&&window.WIELD)WIELD.next();
  if(k==='-'||k==='_'){RESI=Math.max(0,RESI-1);resize();} if(k==='='||k==='+'){ if(pxS()>1||vpu()>art())RESI=Math.min(RESMAX,RESI+1); resize(); }
  if(k==='shift')st.runTarget=1; if(k==='f'&&!e.repeat&&!UI.freeCam&&!UI.fly&&!ED.on)trip=true; if(st.water&&st.water.in&&(k===' '||k==='j')){ st.water.dive=true; e.preventDefault(); } else if(MOVEK[k]&&!e.repeat&&!RAG.on&&!UI.freeCam&&!ED.on&&!(UI.fly&&k===' ')&&!(FT&&k===' '))RIG.act(st,MOVEK[k]); });
const MOVEK={' ':' ',j:'J',k:'K',r:'R',v:'V',u:'U'};
addEventListener('keyup',e=>{ const k=UI.key(e); if(!k)return; keys.delete(k); if(k==='shift')st.runTarget=0; if(k===' '||k==='j'){ if(st.water)st.water.dive=false; } if(MOVEK[k])RIG.release(st,MOVEK[k]); });
addEventListener('blur',()=>{ keys.clear(); st.runTarget=0; FEEL.IN.press=0; }); document.addEventListener('visibilitychange',()=>{ if(document.hidden){ keys.clear(); st.runTarget=0; FEEL.IN.press=0; } });
const ray=new THREE.Raycaster(), gplane=new THREE.Plane(new THREE.Vector3(0,1,0),0), hit=new THREE.Vector3();
const marker=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.5).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xf2c14e,transparent:true,opacity:0.8})); marker.visible=false; scene.add(marker);

function collide(p){ if(typeof NPCS!=='undefined'&&!VIT.dead)for(const N of NPCS)if(N.lv===LVL&&!N.far)N.push(p); const r=0.36; p.x=Math.max(BOUND.x0,Math.min(BOUND.x1,p.x)); p.z=Math.max(BOUND.z0,Math.min(BOUND.z1,p.z));
  for(const [x0,z0,x1,z1] of solids){ const cx=Math.max(x0,Math.min(x1,p.x)), cz=Math.max(z0,Math.min(z1,p.z)), dx=p.x-cx, dz=p.z-cz, d2=dx*dx+dz*dz;
    if(d2>=r*r)continue; if(d2>1e-8){ const d=Math.sqrt(d2); p.x=cx+dx/d*r; p.z=cz+dz/d*r; }
    else { const o=[p.x-x0+r,x1-p.x+r,p.z-z0+r,z1-p.z+r], m=Math.min(...o); if(m===o[0])p.x=x0-r; else if(m===o[1])p.x=x1+r; else if(m===o[2])p.z=z0-r; else p.z=z1+r; } } }

const R=new THREE.Vector3(),U=new THREE.Vector3(),F=new THREE.Vector3(),disp=new THREE.Vector3();
let last=performance.now(), fpsT=0, fpsN=0, t=0;
function frame(now){ requestAnimationFrame(frame); renderer.info.reset(); const dt=Math.max(0,Math.min(0.05,(now-last)/1000)); last=now; METRO.tick(dt,pos); t+=dt;
  if(UI.freeCam?MAPLV(UI.camT.y-.9,UI.camT):MAPLV(py,pos))setPhys(LVL);
  if(UI.view!=='iso'){ if(keys.has('q'))yawTo+=dt*1.8; if(keys.has('e'))yawTo-=dt*1.8; if(keys.has('z'))pitchTo=UI.clampV(pitchTo-dt*1.2); if(keys.has('x'))pitchTo=UI.clampV(pitchTo+dt*1.2); }
  const FT=FEEL.take(), ease=FT?1-Math.exp(-dt*FEEL.cfg.camDamp):Math.min(1,dt*12); yaw=Math.abs(yawTo-yaw)<1e-4?yawTo:yaw+(yawTo-yaw)*ease; pitch=Math.abs(pitchTo-pitch)<1e-4?pitchTo:pitch+(pitchTo-pitch)*ease; const zk0=UI.zk(); ppu=Math.abs(ppuTo/ppu-1)<1e-4?ppuTo:ppu*Math.pow(ppuTo/ppu,ease); if(pxS()!==SCL)resize(); else frustum(); UI.zoomStep(zk0);
  const a=yaw, fx=-Math.sin(a), fz=-Math.cos(a);
  let mx=0,mz=0, up=keys.has('w')||keys.has('arrowup'), dn=keys.has('s')||keys.has('arrowdown'), lf=keys.has('a')||keys.has('arrowleft'), rt=keys.has('d')||keys.has('arrowright');
  UI.camStep(dt,a,up,dn,lf,rt); if(UI.freeCam||ED.on)up=dn=lf=rt=false;
  if(up){mx+=fx;mz+=fz;} if(dn){mx-=fx;mz-=fz;} if(rt){mx+=-fz;mz+=fx;} if(lf){mx-=-fz;mz-=fx;}
  if(PAD.mv&&(up||dn||lf||rt)){ const [lx,ly]=PAD.mv; mx=-ly*fx-lx*fz; mz=-ly*fz+lx*fx; }
  if(!RAG.on&&MODS.apts.lad&&MODS.apts.lad(dt,up,dn,lf||rt||!!target)){ up=dn=lf=rt=false; mx=mz=0; target=null; }
  if(mx||mz)target=null; else if(target){ const dx=target.x-pos.x, dz=target.z-pos.z, d=Math.hypot(dx,dz); if(d<0.12)target=null; else {mx=dx/d;mz=dz/d;} }
  view0.a=a; P.x=pos.x/TL; P.y=-pos.z/TL; PH.hd=heading;
  const hit=PHYOU.hit||0, hn=PHYOU.hitN; PHYOU.hit=0;
  if(!RAG.on&&!(st.water&&st.water.level!=null)&&(trip||hit>12)){ const [u,v]=[(Math.sin(PH.hd)+Math.cos(PH.hd))/2,(Math.cos(PH.hd)-Math.sin(PH.hd))/2], [fx2,fy2]=wvV(u,v), n=Math.hypot(fx2,fy2), k=Math.min(3,hit/30);
    ragStart(RIG.pose(st,false),J0,J0t?(now-J0t)/1000:0,trip||!hn?[fx2/n*1.6,fy2/n*1.6,.3]:[-hn[0]*k,-hn[1]*k,.2]); target=null; }
  trip=false; let B;
  if(RAG.on){ ragStep(dt); st.target=0; pos.x=P.x*TL; pos.z=-P.y*TL; py=0; if(!RAG.on){ heading=PH.hd; pos.x=P.x*TL; pos.z=-P.y*TL; } }
  if(RAG.on)B=ragPose();
  else{
    if(window.BOAT&&BOAT.on){ BOAT.steer(dt,mx,mz); mx=0; mz=0; target=null; } const ml=Math.hypot(mx,mz), busy=st.move;
    if(FT){ st.yr=0; if(!RIVER.feed(st,pos,dt,ml>0,keys)&&!(FOUNT.feed&&FOUNT.feed(st,pos,dt,ml>0,keys))&&!(BOD.GD&&BOD.GD.feed&&BOD.GD.feed(st,pos,dt,ml>0,keys)))WATER.feed(st,pos,dt,ml>0,keys); st.target=0; RIG.step(st,dt); FEEL.step(dt,mx,mz); }
    else{
    if(window.WIELD)WIELD.pre(dt);
    if(ml>0&&!(busy&&busy.def.below!=null)){ const tk=busy?.5:1; let dh=Math.atan2(mx,mz)-heading; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); const turn=3*Math.PI*dt*tk; const dd=Math.max(-turn,Math.min(turn,dh*(1-Math.exp(-dt*12*tk)))); heading+=dd; st.yr=dd/Math.max(dt,1e-3); } else st.yr=0;
    if(window.BOAT&&BOAT.on){ BOAT.carry(st,pos); heading=BOAT.hd; } else if(!RIVER.feed(st,pos,dt,ml>0,keys)&&!(FOUNT.feed&&FOUNT.feed(st,pos,dt,ml>0,keys))&&!(BOD.GD&&BOD.GD.feed&&BOD.GD.feed(st,pos,dt,ml>0,keys)))WATER.feed(st,pos,dt,ml>0,keys); st.target=ml>0?1:0; const before=st.dist; RIG.step(st,dt); const go=(st.dist-before)*W3.SZ/PPU*(VIT.dead&&NPCS.some(N=>N.lv===LVL&&!N.far&&N.mode!=='hidden'&&N.blocks(pos.x,pos.z,.3*TILE))?.75:1); if(typeof SFX!=='undefined')SFX.steps(st,go);
    if(go){ const ox=pos.x,oz=pos.z; pos.x+=Math.sin(heading)*go; pos.z+=Math.cos(heading)*go; if(UI.fly)UI.flyStep(0); else collide(pos); if(st.water&&st.water.in&&RIVER.swim)RIVER.clamp(pos); else if(st.water&&st.water.in&&POOLR.inBasin(pos.x,pos.z)){ const m=0.3; pos.x=Math.max(WATER.X0+m,Math.min(WATER.X0+WATER.W-m,pos.x)); pos.z=Math.max(WATER.Z0+m,Math.min(WATER.Z0+WATER.D-m,pos.z)); }
    if(target&&Math.hypot(pos.x-ox,pos.z-oz)<go*0.2)target=null; }
    if(UI.fly)UI.flyStep(dt); else if(window.BOAT&&BOAT.on)py=BOAT.py; else { let g=groundY(pos.x,pos.z); if(st.fk)for(const n of 'LR'){ const f=st.fk[n]; if(f&&f.on&&Math.hypot(f.x-pos.x,f.z-pos.z)<1)g=Math.min(g,f.y); } py+=(g-py)*Math.min(1,dt*20); } }
    P.x=pos.x/TL;
    P.y=-pos.z/TL; PH.hd=heading;
    { st.world=RAG.on?null:{x:pos.x,z:pos.z,y:py,hd:heading,kx:1/W3.group.scale.x,ky:1/W3.group.scale.y,gnd:groundY,t:now/1000}; B=ED.anim?ED.animPose():RIG.pose(st); ragBlend(B); ragStrikes(B,J0,J0t?(now-J0t)/1000:0); J0=B.J; J0t=now; ASTEP.you.B=B; } }
  const hdA=(RAG.on?RAG.hd:heading)-a;
  if(loose.length||FLOATS.bodies.some(b=>Math.hypot(b.x[0]*TL-pos.x,-b.x[1]*TL-pos.z)<2.5))RIG.draw(B,cloud,hdA,uimg,PW,PICH,AX,AY,1,false);
  W3.place(B,pos.x,py,pos.z,RAG.on?RAG.hd:heading,hdA,ZU); if(window.WIELD)WIELD.post(B); FEEL.ui(dt); PB.step(dt,B,pos.x,py,pos.z,RAG.on?RAG.hd:heading,groundY(pos.x,pos.z),RAG.on); if(ED.on)ED.tick();
  phyYouNow(dt); looseAcc+=dt; let nst=0; while(looseAcc>=PHH&&nst<6){ looseAcc-=PHH; nst++; phyStep(loose,STATIC,PHH,null,null); } if(nst>=6)looseAcc=0; looseDraw();
  if(PERFX.poolNear()){ const px=FLOATS.px??pos.x, pz=FLOATS.pz??pos.z, k=1/Math.max(dt,1e-3); FLOATS.step(dt,{inWater:!!(st.water&&st.water.in),x:pos.x,z:pos.z,vx:(pos.x-px)*k,vz:(pos.z-pz)*k}); FLOATS.px=pos.x; FLOATS.pz=pos.z; }
  if(typeof UI!=='undefined'&&UI.freeCam)LITE.tick(dt,UI.camT.x,UI.camT.y,UI.camT.z); else LITE.tick(dt,pos.x,py+1.2*TILE,pos.z);
  let lampW=0; for(const L of lamps){ if(!L.visible||!(L.intensity>0)||!L.parent)continue; const d=Math.hypot(L.position.x-pos.x,L.position.z-pos.z); if(d<6)lampW=Math.max(lampW,(1-d/6)*Math.min(1,L.intensity/(L.userData.i0||L.intensity))); }
  { const G=SUNG, sun=CLOCK.sun, out=LVL==='up'&&!ROOMS.cur&&sun&&sun.intensity>.6&&CLOCK.dir&&CLOCK.dir.y>.05; if((G.t-=dt)<=0){ G.t=.15; G.lit=0; if(out){ G.rc.set(G.o.set(pos.x,py+1.1*TILE,pos.z),CLOCK.dir); G.rc.camera=cam; G.rc.far=40*TILE; G.hit.length=0; let blk=false;
      for(const h of G.rc.intersectObjects(scene.children,true,G.hit)){ const o=h.object, m=Array.isArray(o.material)?o.material[0]:o.material; let v=true; for(let q=o;q;q=q.parent)if(!q.visible||q===W3.group){ v=false; break; } if(!v||o.isSprite||!m||m.transparent||m.depthWrite===false||o.isPoints||o.isSprite||o.isLine)continue; blk=true; break; }
      G.lit=blk?0:Math.min(1,(sun.intensity-.6)/1.4); } } G.k+=(G.lit-G.k)*Math.min(1,dt*4); }
  W3.tint.setRGB(.58,.6,.66).lerp(C2.setRGB(1,1,1),Math.max(Math.max(0,lampW)*(ROOMS.cur?0.35:0.7),SUNG.k*.9)); if(ED.on)W3.tint.setRGB(1,1,1);
  DRESS.tick(dt,pos); RINGX.tick(dt); RIVER.tick(dt,pos); FOUNT.tick&&FOUNT.tick(dt,pos); RIVER.hud(); if(window.BROOK&&BROOK.tick)BROOK.tick(dt,pos); SUBX.tick(dt); { const r=MODS.apts.tick(); if(r)solids=r; } { const r2=STORE.stackTick&&STORE.stackTick(); if(r2)solids=r2; } CITY.tick(dt,pos); NPCS.tick(dt,pos); if(FIRE)FIRE.tick(dt); FIGFX.tick(dt,pos); FLAME.tick(dt,pos); MUS.tick(dt); BWK.tick(dt); PNM.tick(dt); SGM.tick(dt); DRM.tick(dt); STAGE.tick(dt);
  UI.goTick(); UI.runTick(); CLOCK.tick(dt); VIT.tick(dt); LOOK.tick(); WHERE.tick(dt); AMB.tick(dt); LINES.tick(dt);
  marker.visible=!!target; if(target){ marker.position.set(target.x,groundY(target.x,target.z)+0.03,target.z); marker.material.opacity=0.5+0.4*Math.sin(t*8); }
  for(const sg of shopGroups)sg.scale.y+=(cut-sg.scale.y)*Math.min(1,dt*8);
  for(const tr of trees){ tr.crown.rotation.z=Math.sin(t*1.3+tr.ph)*0.035+Math.sin(t*3.1+tr.ph)*0.01; tr.crown.rotation.x=Math.sin(t*1.1+tr.ph*1.7)*0.025; }
  if(night!==nightTo){ night+=(nightTo-night)*Math.min(1,dt*2.5); if(Math.abs(nightTo-night)<0.002)night=nightTo; applyTime(night); }
  if(UI.freeCam)disp.copy(UI.camT); else{ UI.follow&&UI.follow(); disp.set(pos.x,py+(ED.on?0.85:0),pos.z); disp.add(UI.off); } F.set(Math.sin(a)*Math.cos(pitch),Math.sin(pitch),Math.cos(a)*Math.cos(pitch));
  UI.view3(a); cam.quaternion.setFromEuler(UI.eul.set(-pitch,a,0,'YXZ')); cam.position.copy(disp).addScaledVector(F,300); if(!UI.persp){ const u=rppu(), cr=UI.snR.set(1,0,0).applyQuaternion(cam.quaternion), cu=UI.snU.set(0,1,0).applyQuaternion(cam.quaternion), x=cam.position.dot(cr), y=cam.position.dot(cu); const ax=Math.round(x*u)/u-x, ay=Math.round(y*u)/u-y; cam.position.addScaledVector(cr,ax).addScaledVector(cu,ay); UI.snD=UI.freeCam?null:(UI.snD||new THREE.Vector3()).copy(cr).multiplyScalar(ax).addScaledVector(cu,ay); } else UI.snD=null; { const n=.1; if(Math.abs(OCAM.near-n)>.01){ OCAM.near=n; OCAM.updateProjectionMatrix(); } } UI.view3b(a); cam.updateMatrixWorld();
  you.quaternion.copy(cam.quaternion); you.position.copy(disp).addScaledVector(F,0.35);
  for(const w of cutWalls)w.pl.constant=(!UI.persp&&(w.always||Math.sin(a)*w.nx+Math.cos(a)*w.nz<-0.05)&&pitch<1.45&&(!w.when||w.when()))?w.foot:1e6;
  { const bi=BODB.inside(); for(const r of BODB.roof)SEEN(r,!bi); } if(MODS.pool.roof)SEEN(MODS.pool.roof,!MODS.pool.inside(pos.x,pos.z));
  const wOn=LVL==='up'&&(MODS.pool.inside(pos.x,pos.z)||Math.hypot(pos.x-POOLR.X((POOLR.bx0+POOLR.bx1)/2),pos.z-POOLR.Z((POOLR.by0+POOLR.by1)/2))<15*TILE);
  ROOMS.tick(); INTERIORS.tick(); PERFX.tick(); STORE.tick(); NPCS.cull(true); INTERIORS.cull(true); CULL.begin(); if(PERFX.bfNear())BF.tick(dt); if(wOn)WATER.step(renderer,dt); WATER.tickAll(renderer,dt,pos); renderer.shadowMap.needsUpdate=true; if(wOn&&WATER.seen(WATER.mesh,cam))WATER.under(renderer,scene,cam,lamps); WATER.underAll(renderer,scene,cam,lamps); RIVER.pre(renderer,scene,cam,dt,pos); FOUNT.pre&&FOUNT.pre(scene,cam); FAR3.pre(renderer,cam); W3.shadowPass(renderer); if(OUTL.on)OUTL.render(renderer,scene,cam); PEEK.tick(dt); CLOCK.main=1; composer.render(); CLOCK.main=0; FOUNT.post&&FOUNT.post(scene); RIVER.post(scene); FAR3.post(); CULL.end(); NPCS.cull(false); INTERIORS.cull(false);
  fpsN++; fpsT+=dt; if(fpsT>0.5){ const RI=renderer.info.render; statEl.textContent=`${Math.round(fpsN/fpsT)} fps · ${Math.round(RI.calls/fpsN)} draws · ${(RI.triangles/fpsN/1000).toFixed(1)}k tris · ${RW}×${RH} px · turn ${Math.round(((a*180/Math.PI)%360+360)%360)}° · tilt ${Math.round(pitch*180/Math.PI)}° · zoom ${(SCL*rppu()/V0).toFixed(2)}× · art ${SCL===1&&vpu()<art()?'full':RES()+'×'}`; renderer.info.reset(); fpsN=0; fpsT=0; }
}
composer=new EffectComposer(renderer); composer.setPixelRatio(1); composer.addPass(RPASS=new RenderPass(scene,cam)); { const sp=new ShaderPass(OUTL.pass); composer.addPass(sp); OUTL.sp=sp; sp.enabled=!!OUTL.on; OUTL.pass.uniforms=sp.uniforms; sp.uniforms.tId.value=OUTL.rt.texture; sp.uniforms.tint.value=W3.tint; }
composer.addPass(new OutputPass());
{ const SH={on:true,lv:2}, el=document.getElementById('shd'), draw=()=>{ W3.lv.value=SH.on?(SH.lv>=2?2:1):0; el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s?String(SH.on):String(SH.on&&SH.lv===+b.dataset.l))); el.querySelector('[data-s]').textContent=SH.on?'ON':'OFF'; };
  el.querySelectorAll('button').forEach(b=>b.onclick=()=>{ if(b.dataset.s)SH.on=!SH.on; else{ SH.lv=+b.dataset.l; SH.on=true; } b.blur(); draw(); }); draw(); }
const SKEL=__LAZY__("data/skel.json");
