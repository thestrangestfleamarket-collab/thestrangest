// THE DRUMMER: DRM puts the octopus drummer at a drum kit: the bar's (DRM.make(S,{add,live}): S its kit's spot, add puts the figure in a room, live says it is being heard).
import {SHARED, THREE} from './003-shx.js';
import {DRM, pos, SND} from './003b-systems.js';
import {PPU} from './004-main.js';
import {MAPG, STORE, ZU} from './006-map-pre.js';
import {IMX} from './119-game-music-1-engine.js';
import {octBody, OCTP} from './125-game-zzz-bar-octopus-1-body.js';
import {octArms, OCTBK, octHabits, octPose, octStep} from './126-game-zzz-bar-octopus-2-play.js';
Object.assign(DRM,{tick:()=>{}}); STORE.DRM=DRM;
// an octopus figure: its body's ellipsoids drawn as one instanced mesh, in the body's own units (draw(octBody(A)) each frame it moves)
const octFig=(CAP=160)=>{ '@later'; const g=new THREE.Group(); g.scale.set(1/PPU,ZU,1/PPU);
  const im=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,8),new THREE.MeshLambertMaterial({}),CAP); im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.castShadow=true; im.receiveShadow=true; im.frustumCulled=false; g.add(im);
  const col=new THREE.Color(), M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), EU=new THREE.Euler(0,0,0,'YXZ'), P3=new THREE.Vector3(), S3=new THREE.Vector3();
  const place=(i,x,y,z,rx,ry,rz,yaw,pit,rol,c)=>{ P3.set(y,z,x); EU.set(-pit,yaw,rol); Q.setFromEuler(EU); S3.set(ry,rz,rx); M4.compose(P3,Q,S3); im.setMatrixAt(i,M4);
    const k=typeof c==='function'?c(0,0,0):c, rgb=OCTP[k]||OCTP.b; col.setRGB(rgb[0]/255,rgb[1]/255,rgb[2]/255,THREE.SRGBColorSpace); im.setColorAt(i,col); };
  const draw=B=>{ let n=0; for(const e of B.E){ if(n>=CAP)break; place(n++,e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9]); }
    for(const [x,y,z,c] of B.D){ if(n>=CAP)break; place(n++,x,y,z,.7,.7,.7,0,0,0,c); }
    im.count=n; im.instanceMatrix.needsUpdate=true; if(im.instanceColor)im.instanceColor.needsUpdate=true; };
  return {g,im,draw}; };
DRM.make=(S=STORE.bar,o={})=>{ '@later'; if(!S)return; const live=DRM.live=o.live||(()=>MAPG.bodega.visible), AT={...S.at(S.drums.x,S.drums.y-OCTBK),hd:S.hd,y:SHARED.BOD.Y(S.stage.z)}, F=octFig(), g=F.g; (o.add||(x=>MAPG.bodega.add(x)))(g); DRM.g=g; DRM.at=AT;
  g.position.set(AT.x,AT.y,AT.z); g.rotation.set(0,AT.hd,0);
  const hush=()=>{ const N=IMX.nodes.get('bar|drum kit'); if(N&&SND.ctx)N.g.gain.setTargetAtTime(0,SND.ctx.currentTime,.1); }; DRM.stop=hush;
  DRM.tick=dt=>{ const d=Math.hypot(pos.x-AT.x,pos.z-AT.z); if(!DRM.on||!live()||d>18){ hush(); return; } const now=performance.now();
    octStep(dt,now); octHabits(now); const p=octPose(now), A=octArms(p), B=octBody(A);
    F.draw(B);
    const N=IMX.nodes.get('bar|drum kit'); if(N&&SND.ctx){ const c=SND.ctx; N.g.gain.setTargetAtTime(.9*Math.max(0,1-d/14),c.currentTime,.1); N.pan.to(AT.x,AT.y+1,AT.z); } }; };
