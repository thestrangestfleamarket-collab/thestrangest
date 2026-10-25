// THE CONTACT SHADOWS: cheap soft blobs under props and furniture to ground them (SHAD.blob); a dark decal on the floor, no light needed.
import {THREE} from './003-shx.js';
import {SHAD} from './003b-systems.js';
import {scene} from './004-main.js';
const TEX=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'), r=g.createRadialGradient(32,32,1,32,32,31); r.addColorStop(0,'rgba(0,0,0,.9)'); r.addColorStop(.55,'rgba(0,0,0,.5)'); r.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=r; g.fillRect(0,0,64,64); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();
const GEO=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);
Object.assign(SHAD,{ tex:TEX,
  mat(o={}){ return new THREE.MeshBasicMaterial({map:TEX,transparent:true,opacity:o.alpha??.5,depthWrite:false,...(o.clip?{clippingPlanes:o.clip}:{})}); },
  // a soft dark ellipse on the floor at (x,y,z), rx by rz across; pass a shared material in o.mat for many blobs
  blob(parent,x,y,z,rx,rz,o={}){ const m=new THREE.Mesh(GEO,o.mat||SHAD.mat(o)); m.position.set(x,y+(o.lift??.01),z); m.scale.set(rx,1,rz); if(o.ry)m.rotation.y=o.ry; m.renderOrder=o.renderOrder??1; m.castShadow=m.receiveShadow=false; m.userData.blob=true; (parent||scene).add(m); return m; } });
