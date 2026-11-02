// THE DRUMMER: DRM puts the octopus drummer and its drum kit in the bar.
import {SHARED, THREE} from './003-shx.js';
import {DRM, pos} from './003b-systems.js';
import {PPU} from './004-main.js';
import {MAPG, STORE, ZU} from './006-map-pre.js';
import {octBody, OCTP} from './125-game-zzz-bar-octopus-1-body.js';
import {octArms, OCTBK, octHabits, octPose, octStep} from './126-game-zzz-bar-octopus-2-play.js';
Object.assign(DRM,{tick:()=>{}}); STORE.DRM=DRM;
DRM.make=()=>{ if(!STORE.bar)return; const S=STORE.bar, AT={...S.at(S.drums.x,S.drums.y-OCTBK),hd:S.hd,y:SHARED.BOD.Y(S.stage.z)}, g=new THREE.Group(); MAPG.bodega.add(g); DRM.g=g; DRM.at=AT;
  g.position.set(AT.x,AT.y,AT.z); g.rotation.set(0,AT.hd,0); g.scale.set(1/PPU,ZU,1/PPU);
  const CAP=160, im=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,8),new THREE.MeshLambertMaterial({}),CAP); im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.castShadow=true; im.receiveShadow=true; im.frustumCulled=false; g.add(im);
  const col=new THREE.Color(), M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), EU=new THREE.Euler(0,0,0,'YXZ'), P3=new THREE.Vector3(), S3=new THREE.Vector3();
  const place=(i,x,y,z,rx,ry,rz,yaw,pit,rol,c)=>{ '@later'; P3.set(y,z,x); EU.set(-pit,yaw,rol); Q.setFromEuler(EU); S3.set(ry,rz,rx); M4.compose(P3,Q,S3); im.setMatrixAt(i,M4);
    const k=typeof c==='function'?c(0,0,0):c, rgb=OCTP[k]||OCTP.b; col.setRGB(rgb[0]/255,rgb[1]/255,rgb[2]/255,THREE.SRGBColorSpace); im.setColorAt(i,col); };
  DRM.tick=dt=>{ const d=Math.hypot(pos.x-AT.x,pos.z-AT.z); if(!DRM.on||!MAPG.bodega.visible||d>18)return; const now=performance.now();
    octStep(dt,now); octHabits(now); const p=octPose(now), A=octArms(p), B=octBody(A); let n=0;
    for(const e of B.E){ if(n>=CAP)break; place(n++,e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9]); }
    for(const [x,y,z,c] of B.D){ if(n>=CAP)break; place(n++,x,y,z,.7,.7,.7,0,0,0,c); }
    im.count=n; im.instanceMatrix.needsUpdate=true; if(im.instanceColor)im.instanceColor.needsUpdate=true; }; };
