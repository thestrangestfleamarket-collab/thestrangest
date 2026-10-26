// THE HEADSET: VR plays THE MARKET in a WebXR headset (a Quest 3 in its browser): you look out of the Walker's eyes and the two controllers are one gamepad.
import {SHARED, THREE} from './003-shx.js';
import {BOAT, ED, FEEL, keys, pos, RAG, st, UI, VIT, VR, W3} from './003b-systems.js';
import {PCAM, renderer, resize, scene} from './004-main.js';
import {FADE, SYS, TILE} from './006-map-pre.js';
import {collide, frame, PAD} from './075-main-13.js';
{
  const xr=navigator.xr, V3=THREE.Vector3, SNAP=Math.PI/6, LEASH=.3;
  Object.assign(VR,{s:null,busy:false,cal:false,pose:null,rt:null,yaw:0,eye:0,y0:0,px:0,pz:0,view:'',fov:60,tip:0,m:'',win:false,ct:0,bt:0,sn:0,err:0});
  window.VR=VR; VR.state=()=>({view:UI.view,body:W3.group.visible,pad:!!PAD.xr,menu:!!UI.menuOpen,fov:PCAM.fov,yaw:SHARED.yawTo,pitch:SHARED.pitchTo});
  const O=new V3(), HL=new V3(), HQ=new THREE.Quaternion(), FW=new V3(), EV=new V3();
  const DOLLY=new THREE.Group(), CAM=new THREE.PerspectiveCamera(70,1,.05,450); DOLLY.add(CAM); VR.cam=CAM; VR.dolly=DOLLY;
  const HUD=new THREE.Scene(), HG=new THREE.Group(); HG.matrixAutoUpdate=false; HUD.add(HG);
  const veil=new THREE.Mesh(new THREE.SphereGeometry(.3,16,8),new THREE.MeshBasicMaterial({color:0,side:THREE.BackSide,transparent:true,depthTest:false,depthWrite:false,fog:false})); veil.renderOrder=1; HG.add(veil);
  const cv=document.createElement('canvas'); cv.width=512; cv.height=200; const tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace;
  const card=new THREE.Mesh(new THREE.PlaneGeometry(.96,.375),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,fog:false,toneMapped:false})); card.position.set(0,-.14,-1.1); card.renderOrder=2; card.visible=false; HG.add(card);
  const TIP=['THE MARKET IN VR','LEFT STICK WALKS · RIGHT STICK TURNS · A JUMPS','X USES · Y KICKS · RIGHT TRIGGER RUNS','PRESS RIGHT STICK: RECENTRE · HOLD B: LEAVE VR'],
    WIN=['A WINDOW IS OPEN ON THE SCREEN','LEFT STICK MOVES · A PRESSES · B CLOSES','Y: LEAVE VR TO USE IT'];
  const write=L=>{ const g=cv.getContext('2d'); g.clearRect(0,0,512,200); g.fillStyle='rgba(16,18,26,.9)'; g.fillRect(0,0,512,200); g.strokeStyle='#2a2e3a'; g.lineWidth=4; g.strokeRect(2,2,508,196); g.textAlign='center'; g.textBaseline='middle';
    L.forEach((l,i)=>{ let px=i?17:22; do{ g.font=px+'px Silkscreen, monospace'; }while(g.measureText(l).width>484&&--px>9); g.fillStyle=i?'#ece5d3':'#f2c14e'; g.fillText(l,256,34+i*44); }); tex.needsUpdate=true; };

  const B0=()=>({value:0,pressed:false,touched:false});
  const VP={id:'Meta Quest Touch (WebXR)',index:-1,connected:false,mapping:'standard',timestamp:0,axes:[0,0,0,0],buttons:Array.from({length:16},B0),hapticActuators:[]};
  const MAPB=[['R',4],['R',5],['L',4],['L',5],['L',1],['R',1],['L',0],['R',0],null,null,['L',3],['R',3]];
  const read=xf=>{ const H={L:null,R:null}; for(const s of xf.session.inputSources)if(s.gamepad&&(s.handedness==='left'||s.handedness==='right'))H[s.handedness==='left'?'L':'R']=s.gamepad;
    MAPB.forEach((m,i)=>{ const b=m&&H[m[0]]&&H[m[0]].buttons[m[1]], v=b?b.value:0; VP.buttons[i].value=v; VP.buttons[i].pressed=v>.5; });
    const ax=(g,k)=>!g?0:(g.axes.length>=4?g.axes[2+k]:g.axes[k])||0; VP.axes[0]=ax(H.L,0); VP.axes[1]=ax(H.L,1); VP.axes[2]=ax(H.R,0); VP.axes[3]=ax(H.R,1); VP.timestamp=performance.now(); };

  const RAF=window.requestAnimationFrame, CAF=window.cancelAnimationFrame, Q=new Map(); let qid=1e9, nat=0, beat=false;
  const pulse=()=>{ nat=performance.now(); if(beat)RAF.call(window,pulse); };
  const shim=on=>{ beat=on; if(!on){ window.requestAnimationFrame=RAF; window.cancelAnimationFrame=CAF; for(const [id,q] of Q)RAF.call(window,t=>{ if(Q.delete(id))q.f(t); }); return; } nat=performance.now(); RAF.call(window,pulse);
    window.requestAnimationFrame=f=>{ const id=++qid; Q.set(id,{f,n:RAF.call(window,t=>{ if(Q.delete(id))f(t); })}); return id; };
    window.cancelAnimationFrame=id=>{ const q=Q.get(id); if(q){ Q.delete(id); CAF.call(window,q.n); } else CAF.call(window,id); }; };
  const flush=t=>{ if(!Q.size||performance.now()-nat<250)return; const L=[...Q.values()]; Q.clear(); for(const q of L){ CAF.call(window,q.n); try{ q.f(t); }catch(e){ console.warn('VR: a frame callback',e); } } };

  const was={}, edge=(k,on)=>{ const r=on&&!was[k]; was[k]=on; return r; };
  const yawOf=q=>{ FW.set(0,0,-1).applyQuaternion(q); return Math.atan2(-FW.x,-FW.z); };
  const rot=(x,z,a,out)=>out.set(x*Math.cos(a)+z*Math.sin(a),0,-x*Math.sin(a)+z*Math.cos(a));
  const head=out=>rot(HL.x*FEEL.MH,HL.z*FEEL.MH,VR.yaw,out).add(O);
  const turn=d=>{ head(EV); VR.yaw+=d; rot(HL.x*FEEL.MH,HL.z*FEEL.MH,VR.yaw,O); O.set(EV.x-O.x,0,EV.z-O.z); };
  const calib=()=>{ VR.yaw=SHARED.heading+Math.PI-yawOf(HQ); rot(HL.x*FEEL.MH,HL.z*FEEL.MH,VR.yaw,O); O.set(pos.x-O.x,0,pos.z-O.z); VR.y0=HL.y;
    VR.eye=W3.eyeAt&&W3.eyeAt(EV)?Math.max(.5*TILE,EV.y-SHARED.py):1.62/.84*TILE*(W3.SZ||1); VR.px=pos.x; VR.pz=pos.z; VR.cal=true; };
  const free=()=>!RAG.on&&!VIT.dead&&!(VIT.out>0)&&!(window.BOAT&&BOAT.on)&&!st.sit&&!UI.fly&&!UI.freeCam&&!ED.on&&!(st.water&&st.water.in);

  SYS.add('xr',(dt,xf)=>{ const P=VR.pose; if(!P)return; const T=P.transform; HL.set(T.position.x,T.position.y,T.position.z); HQ.set(T.orientation.x,T.orientation.y,T.orientation.z,T.orientation.w);
    if(!VR.cal)calib(); if(UI.view!=='first')UI.setView('first'); VR.tip-=dt;
    const B=VP.buttons, rx=VP.axes[2];
    if(Math.abs(rx)<.3)VR.sn=0; else if(!VR.sn&&Math.abs(rx)>.65){ VR.sn=1; turn(rx>0?-SNAP:SNAP); }
    if(edge('q',keys.has('q')))turn(SNAP); if(edge('e',keys.has('e')))turn(-SNAP);
    if(edge('rc',B[11].value>.5))VR.cal=false;
    if(edge('y',B[3].value>.5)&&VR.m==='win')return VR.leave();
    if(B[1].value>.5){ const n=performance.now(); if(!VR.bt)VR.bt=n; else if(n-VR.bt>1500){ VR.bt=Infinity; return VR.leave(); } } else VR.bt=0;
    head(EV); let dx=EV.x-pos.x, dz=EV.z-pos.z, d=Math.hypot(dx,dz); const L=LEASH*FEEL.MH;
    if(d>L){ if(free()){ const k=1-L/d; pos.x+=dx*k; pos.z+=dz*k; collide(pos); if(FEEL.take())FEEL.sync(); dx=EV.x-pos.x; dz=EV.z-pos.z; d=Math.hypot(dx,dz); }
      if(d>L){ const m=(d-L)/d; O.x-=dx*m; O.z-=dz*m; } }
    VR.px=pos.x; VR.pz=pos.z;
    const a=VR.yaw+yawOf(HQ); SHARED.yaw=SHARED.yawTo=a; SHARED.pitch=SHARED.pitchTo=Math.max(-1.2,Math.min(1.3,-Math.asin(Math.max(-1,Math.min(1,FW.y))))); },'162c-vr');

  VR.draw=hold=>{ if(!VR.pose)return; const r=renderer;
    O.x+=pos.x-VR.px; O.z+=pos.z-VR.pz; VR.px=pos.x; VR.pz=pos.z;
    DOLLY.position.set(O.x,SHARED.py+VR.eye-VR.y0*FEEL.MV,O.z); DOLLY.rotation.set(0,VR.yaw,0); DOLLY.scale.set(FEEL.MH,FEEL.MV,FEEL.MH); DOLLY.updateMatrixWorld(true);
    const f=FADE.el?+FADE.el.style.opacity||0:0; veil.material.opacity=f; veil.visible=f>.01;
    if(--VR.ct<=0){ VR.ct=10; VR.win=!!UI.menuOpen||!!(PAD.panels&&PAD.panels().length); }
    const m=VR.win?'win':VR.tip>0?'tip':''; if(m!==VR.m){ VR.m=m; if(m)write(m==='win'?WIN:TIP); } card.visible=!!m;
    r.xr.enabled=true; r.setRenderTarget(VR.rt);
    if(hold||!VR.cal)r.clear(); else{ r.render(scene,CAM); if(veil.visible||card.visible){ HG.matrix.copy(CAM.matrixWorld); HG.matrixWorldNeedsUpdate=true; const ac=r.autoClear; r.autoClear=false; r.render(HUD,CAM); r.autoClear=ac; } }
    r.xr.enabled=false; };

  const loop=(t,xf)=>{ const ref=renderer.xr.getReferenceSpace(); VR.pose=ref?xf.getViewerPose(ref):null; VR.rt=renderer.getRenderTarget(); read(xf); flush(t);
    try{ frame(t,xf); }catch(e){ if(!VR.err){ VR.err=1; console.warn('VR: the frame',e); } } };

  const btn=document.createElement('button'); btn.type='button'; btn.id='vrbtn'; btn.hidden=true; btn.textContent='ENTER VR'; btn.title='Play in your headset (hold B to leave)';
  btn.style.cssText='position:fixed;left:calc(12px + env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:5;font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:8px 12px;cursor:pointer';
  btn.onclick=()=>{ btn.blur(); if(VR.on)VR.leave(); else VR.enter(); }; document.body.appendChild(btn);
  if(xr&&xr.isSessionSupported)xr.isSessionSupported('immersive-vr').then(ok=>{ btn.hidden=!ok; }).catch(()=>{});

  const stop=()=>{ '@later'; if(!VR.on)return; VR.on=false; VR.s=null; VR.pose=null; renderer.xr.setAnimationLoop(null); renderer.setAnimationLoop(null); renderer.xr.enabled=false; shim(false);
    VP.connected=false; PAD.xr=null; dispatchEvent(new Event('gamepaddisconnected')); keys.clear();
    PCAM.fov=VR.fov; PCAM.updateProjectionMatrix(); if(VR.view&&VR.view!=='first')UI.setView(VR.view); btn.textContent='ENTER VR'; resize(); };
  const start=s=>{ '@later'; VR.s=s; VR.on=true; VR.cal=false; VR.err=0; VR.m=''; VR.tip=10; VR.view=UI.view; VR.fov=PCAM.fov; PCAM.fov=110; PCAM.updateProjectionMatrix(); CAM.far=600/FEEL.MH;
    shim(true); renderer.xr.enabled=false; renderer.xr.setAnimationLoop(loop);
    VP.connected=true; PAD.xr=VP; dispatchEvent(new Event('gamepadconnected'));
    s.addEventListener('end',stop); const ref=renderer.xr.getReferenceSpace(); if(ref&&ref.addEventListener)ref.addEventListener('reset',()=>{ VR.cal=false; });
    btn.textContent='LEAVE VR'; };
  VR.enter=async()=>{ '@later'; if(VR.on||VR.busy||!xr)return; VR.busy=true;
    try{ const s=await xr.requestSession('immersive-vr'); renderer.xr.setReferenceSpaceType('local'); await renderer.xr.setSession(s); start(s); }
    catch(e){ console.warn('VR: the headset did not start',e); } finally{ VR.busy=false; } };
  VR.leave=()=>{ '@later'; if(VR.s)VR.s.end().catch(()=>stop()); };
}
