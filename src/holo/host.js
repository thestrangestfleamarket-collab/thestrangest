// THE HOLODECK'S HOST: what ROAM and BOARDED UP took from the market, on a page of their own with no market in it: a renderer, a camera, the controller, the headset (WebXR, the Quest's controllers as one gamepad, as 162c-vr), the word to the server (net.js) and the way back
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {NET} from './net.js';

const QS=new URLSearchParams(location.search), TILE=33.9/30;
const SHARED={drive:null,target:null,py:0,heading:0}; window.SHARED=SHARED;
const pos={x:0,z:0}, ROOMS={}, PARK={}, FADE={busy:false}, SFX={snd:false,onAll:[]}, W3={group:{visible:true}};
const UI={view:'first',menuOpen:false,setView:v=>{ UI.view=v; }};
const SYS={add:()=>{},run:()=>{},every:()=>{},onStart:f=>f()};
const PAD={xr:null,panels:()=>[]};
const stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance',alpha:true}); renderer.setClearAlpha(1); renderer.setPixelRatio(1); renderer.localClippingEnabled=true; stage.appendChild(renderer.domElement);
const PCAM=new THREE.PerspectiveCamera(60,1,.05,1500);
const resize=()=>{ if(VR.on)return; const k=Math.min(2,devicePixelRatio||1), w=innerWidth, h=innerHeight; renderer.setSize(Math.round(w*k),Math.round(h*k),false); renderer.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block'; PCAM.aspect=w/h; PCAM.updateProjectionMatrix(); };
addEventListener('resize',()=>resize());

const HOLO={programs:[],run:null,hall:null}, STORE={holo:HOLO};
// ending the program leaves the page: the market loads again, you where you stood
HOLO.end=()=>{ const D=HOLO.run; if(!D)return; HOLO.run=null; try{ if(D.P.hide)D.P.hide(); }catch(e){ console.warn('HOLO',e); } if(VR.on)VR.leave(); HOLO.left=true; if(!QS.has('stay'))NET.back(); };
const ONLINE={get on(){ return NET.on; },get others(){ return NET.others; },hear:NET.hear,send:m=>NET.send(m)};
window.LOAD=()=>Promise.resolve();

/* ---------- the headset ---------- */
const xr=navigator.xr, V3=THREE.Vector3;
const DOLLY=new THREE.Group(), CAM=new THREE.PerspectiveCamera(70,1,.05,450); DOLLY.add(CAM);
const VR={on:false,busy:false,s:null,cal:false,y0:null,cam:CAM,dolly:DOLLY,opt:{hand:'right',scale:.75},joints:{L:null,R:null},grips:[],hands:0};
const HL=new V3(), HQ=new THREE.Quaternion(), P4=new V3(), Q4=new THREE.Quaternion();
const B0=()=>({value:0,pressed:false,touched:false});
const VP={id:'Meta Quest Touch (WebXR)',index:-1,connected:false,mapping:'standard',timestamp:0,axes:[0,0,0,0],buttons:Array.from({length:16},B0),hapticActuators:[]};
const MAPB=[['R',4],['R',5],['L',4],['L',5],['L',1],['R',1],['L',0],['R',0]];
const CTL=[0,1].map(()=>({on:0,h:'',wp:new V3(),wq:new THREE.Quaternion(),v:new V3()}));
// your hands in the headset: a small block where each controller is, a dot at each tracked wrist and fingertip, drawn over the program's scene
const OVER=new THREE.Scene(), MK=new THREE.MeshBasicMaterial({color:0xc9ccd6,fog:false,toneMapped:false}), MARKS=[0,1].map(()=>new THREE.Mesh(new THREE.BoxGeometry(.04,.05,.11),MK)), DOTS=Array.from({length:6},()=>new THREE.Mesh(new THREE.SphereGeometry(.012,8,6),MK)); OVER.add(...MARKS,...DOTS);
let r3=0;
const read=xf=>{ const H={L:null,R:null}; for(const s of xf.session.inputSources)if(s.gamepad&&!s.hand&&(s.handedness==='left'||s.handedness==='right'))H[s.handedness==='left'?'L':'R']=s.gamepad;
  MAPB.forEach((m,i)=>{ const b=H[m[0]]&&H[m[0]].buttons[m[1]], v=b?b.value:0; VP.buttons[i].value=v; VP.buttons[i].pressed=v>.5; });
  const ax=(g,k)=>!g?0:(g.axes.length>=4?g.axes[2+k]:g.axes[k])||0; VP.axes[0]=ax(H.L,0); VP.axes[1]=ax(H.L,1); VP.axes[2]=ax(H.R,0); VP.axes[3]=ax(H.R,1); VP.timestamp=performance.now();
  const p=!!(H.R&&H.R.buttons[3]&&H.R.buttons[3].value>.5); if(p&&!r3){ VR.cal=false; if(SHARED.drive&&SHARED.drive.recentre)SHARED.drive.recentre(); } r3=p; };
const track=(xf,ref,dt)=>{ let nc=0, nd=0; VR.grips.length=0; VR.joints.L=VR.joints.R=null; VR.hands=0; const W=DOLLY.matrixWorld, WQ=DOLLY.quaternion;
  for(const s of xf.session.inputSources){
    if(s.hand){ VR.hands++; const J={wrist:null,index:null,thumb:null,q:null,pinch:false}; VR.joints[s.handedness==='left'?'L':'R']=J;
      for(const [name,key] of [['wrist','wrist'],['index-finger-tip','index'],['thumb-tip','thumb']]){ const js=s.hand.get(name), p=js&&xf.getJointPose(js,ref); if(!p)continue; const T=p.transform; P4.set(T.position.x,T.position.y,T.position.z); J[key]=P4.clone().applyMatrix4(W);
        if(key==='wrist')J.q=WQ.clone().multiply(Q4.set(T.orientation.x,T.orientation.y,T.orientation.z,T.orientation.w)); if(nd<DOTS.length){ DOTS[nd].position.copy(J[key]); DOTS[nd++].visible=true; } }
      if(J.index&&J.thumb)J.pinch=J.index.distanceTo(J.thumb)<.03; continue; }
    if(nc<2&&s.gripSpace){ const g=xf.getPose(s.gripSpace,ref), U=CTL[nc], M=MARKS[nc]; nc++; if(!g){ U.on=0; M.visible=false; continue; } const G=g.transform; P4.set(G.position.x,G.position.y,G.position.z).applyMatrix4(W);
      if(U.on&&dt>0)U.v.copy(P4).sub(U.wp).divideScalar(dt); else U.v.set(0,0,0); U.wp.copy(P4); U.wq.copy(WQ).multiply(Q4.set(G.orientation.x,G.orientation.y,G.orientation.z,G.orientation.w)); U.h=s.handedness; U.on=1; M.position.copy(U.wp); M.quaternion.copy(U.wq); M.visible=true;
      const gp=s.gamepad; VR.grips.push({h:s.handedness,p:U.wp.clone(),q:U.wq.clone(),grip:gp&&gp.buttons[1]?gp.buttons[1].value:0,trig:gp&&gp.buttons[0]?gp.buttons[0].value:0}); } }
  for(let i=nc;i<2;i++){ CTL[i].on=0; MARKS[i].visible=false; } for(let i=nd;i<DOTS.length;i++)DOTS[i].visible=false; };
VR.hand=side=>{ if(!VR.on)return null; return CTL.find(c=>c.on&&c.h===side)||null; };
let xlast=0;
const xloop=(t,xf)=>{ const ref=renderer.xr.getReferenceSpace(), pose=ref?xf.getViewerPose(ref):null, rt=renderer.getRenderTarget(), dt=Math.max(0,Math.min(.05,(t-(xlast||t))/1000)); xlast=t; if(!pose)return;
  const T=pose.transform; HL.set(T.position.x,T.position.y,T.position.z); HQ.set(T.orientation.x,T.orientation.y,T.orientation.z,T.orientation.w); if(!VR.cal){ VR.y0=HL.y; VR.cal=true; }
  try{ read(xf); track(xf,ref,dt); const D=SHARED.drive; if(D&&D.pad)D.pad(VP,dt,()=>false,()=>false); step(dt);
    const E=SHARED.drive; if(E&&E.dolly)E.dolly(DOLLY,HL,HQ); DOLLY.updateMatrixWorld(true);
    renderer.xr.enabled=true; renderer.setRenderTarget(rt);
    if(E&&E.scene){ renderer.render(E.scene,CAM); const ac=renderer.autoClear; renderer.autoClear=false; renderer.clearDepth(); renderer.render(OVER,CAM); renderer.autoClear=ac; } else renderer.clear();
    renderer.xr.enabled=false; VR.fn=(VR.fn||0)+1; if(VR.after){ const f=VR.after; VR.after=null; f(); } }catch(e){ renderer.xr.enabled=false; if(!VR.err){ VR.err=1; console.warn('VR: the frame',e); } } };
const btn=document.getElementById('vrbtn');
const stop=()=>{ if(!VR.on)return; VR.on=false; VR.s=null; renderer.xr.setAnimationLoop(null); renderer.xr.enabled=false; VP.connected=false; PAD.xr=null; btn.textContent='ENTER VR'; resize(); };
VR.enter=async()=>{ if(VR.on||VR.busy||!xr)return; VR.busy=true;
  try{ const s=await xr.requestSession('immersive-vr',{optionalFeatures:['hand-tracking']}); renderer.xr.setReferenceSpaceType('local'); renderer.xr.setFramebufferScaleFactor(VR.opt.scale); await renderer.xr.setSession(s);
    VR.s=s; VR.on=true; VR.cal=false; VR.err=0; xlast=0; renderer.xr.enabled=false; renderer.xr.setAnimationLoop(xloop); VP.connected=true; PAD.xr=VP; s.addEventListener('end',stop); btn.textContent='LEAVE VR'; }
  catch(e){ console.warn('VR: the headset did not start',e); } finally{ VR.busy=false; } };
VR.leave=()=>{ if(VR.s)VR.s.end().catch(()=>stop()); };
btn.onclick=()=>{ btn.blur(); if(VR.on)VR.leave(); else VR.enter(); };
if(xr&&xr.isSessionSupported)xr.isSessionSupported('immersive-vr').then(ok=>{ btn.hidden=!ok; }).catch(()=>{});

/* ---------- the frame: the program and nothing else ---------- */
const step=dt=>{ const D=HOLO.run; if(D&&D.P.run)D.P.run(D,dt); };
let last=0;
const frame=now=>{ requestAnimationFrame(frame); if(VR.on)return; const dt=Math.max(0,Math.min(.05,(now-(last||now))/1000)); last=now;
  const D=SHARED.drive, gp=(navigator.getGamepads?[...navigator.getGamepads()]:[]).find(g=>g&&g.connected); if(gp&&D&&D.pad)D.pad(gp,dt,()=>false,()=>false);
  step(dt); const E=SHARED.drive; if(E&&E.draw)E.draw(); };
// the page's one program starts as soon as its module has registered it
const boot=()=>{ resize(); NET.connect(); const P=HOLO.programs[0]; if(!P)return; HOLO.run={P,x:0,z:0,n:0,good:0,t:2}; if(P.intro&&window.SAY)window.SAY(P.intro,'#7dffa4'); if(P.go)P.go(HOLO.run); requestAnimationFrame(frame); };
document.getElementById('leave').onclick=()=>HOLO.end();
window.HOLO=HOLO; window.VR=VR; window.HOLONET=NET;
export {boot, EffectComposer, FADE, ONLINE, OutputPass, PAD, PARK, PCAM, pos, QS, renderer, RenderPass, ROOMS, SFX, SHARED, STORE, SYS, THREE, TILE, UI, VR, W3};
