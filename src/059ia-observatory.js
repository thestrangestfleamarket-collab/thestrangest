// THE OBSERVATORY'S OUTSIDE: the park's public observatory (its lot in the level file, its inside one of MSHOP's, furnished by 150fk): a stone house with a white dome and its slit, the door on its front.
import {THREE} from './003-shx.js';
import {scene} from './004-main.js';
import {grab, TILE} from './006-map-pre.js';
import {MSHOP} from './059i-mshops.js';
await grab('observatory',async()=>{ const A=MSHOP.at.observatory; if(!A||!A.mid)return;
  const M=TILE/.84, [cx,cz]=A.mid, hw=A.half[0], hd=A.half[1], fx=A.door[0]-cx, fz=A.door[1]-cz, fl=Math.hypot(fx,fz)||1, ux=fx/fl, uz=fz/fl, ry=Math.atan2(ux,uz);
  const G=new THREE.Group(); G.name='observatory-out'; G.position.set(cx,0,cz);
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), put=(g,m,x,y,z)=>{ const o=new THREE.Mesh(g,m); o.position.set(x,y,z); o.castShadow=o.receiveShadow=true; G.add(o); return o; };
  const stone=lam(0xb8b2a4), trim=lam(0xd8d4c8), dark=lam(0x2a2e38), white=lam(0xe8e8e4), H=3.4*M, R=Math.min(hw,hd)*.86;
  put(new THREE.BoxGeometry(hw*2,H,hd*2),stone,0,H/2,0); put(new THREE.BoxGeometry(hw*2+.16*M,.3*M,hd*2+.16*M),trim,0,.15*M,0); put(new THREE.BoxGeometry(hw*2+.24*M,.22*M,hd*2+.24*M),trim,0,H,0);
  put(new THREE.CylinderGeometry(R,R,.9*M,28),trim,0,H+.45*M,0);
  { const dome=put(new THREE.SphereGeometry(R,28,12,0,Math.PI*2,0,Math.PI/2),white,0,H+.9*M,0); dome.name='dome';
    const slit=put(new THREE.SphereGeometry(R*1.012,6,12,-.16,.32,0,Math.PI/2),dark,0,H+.9*M,0); slit.rotation.y=ry+Math.PI; slit.castShadow=false; }
  // the front: the door in its frame, two steps, the name over it
  const F=new THREE.Group(); F.rotation.y=ry; G.add(F); const fd=Math.abs(ux)>Math.abs(uz)?hw:hd, fp=(g,m,x,y,z)=>{ const o=new THREE.Mesh(g,m); o.position.set(x,y,z); o.castShadow=true; F.add(o); return o; };
  fp(new THREE.BoxGeometry(1.5*M,2.5*M,.1*M),trim,0,1.25*M,fd+.03*M); fp(new THREE.BoxGeometry(1.2*M,2.3*M,.12*M),dark,0,1.15*M,fd+.04*M);
  fp(new THREE.BoxGeometry(2.2*M,.14*M,.5*M),trim,0,.07*M,fd+.25*M);
  { const cv=document.createElement('canvas'); cv.width=512; cv.height=64; const g=cv.getContext('2d'); g.fillStyle='#2a2e38'; g.fillRect(0,0,512,64); g.fillStyle='#e6e2d6'; g.font='bold 40px Georgia, serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('OBSERVATORY',256,34);
    const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; const s=new THREE.Mesh(new THREE.PlaneGeometry(2.6*M,.34*M),new THREE.MeshLambertMaterial({map:t})); s.position.set(0,2.9*M,fd+.02*M); F.add(s); }
  scene.add(G); A.out=G; });
