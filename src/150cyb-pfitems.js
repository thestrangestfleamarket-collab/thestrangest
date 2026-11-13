// THE THINGS' POLYFORK MODELS (owner, 8 Nov 2026: "lets look for polyfork assets for anything in game and use those"): an item Polyfork has (data/pfitems.json, tools/pfitems-bake.py) is drawn as that model wherever items are (the ground, the inspect window), fetched after the start; the shapes of 150cya until it comes and for the rest.
import {THREE} from './003-shx.js';
import {INSPECT, INSTR} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
const PFI={on:[]}; window.PFI=PFI;
{ const LZ=__LAZY__("data/pfitems.json"), GEO=new Map(), MAT=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.85}); let D=null, P=null;
  PFI.load=()=>P||(P=LZ().then(j=>{ D=j; for(const f of PFI.on)try{ f(); }catch(e){ console.warn('PFI',e); } }).catch(e=>{ P=null; console.warn('PFI',e); }));
  const key=id=>{ const k=String(id).split('~')[0]; return D&&!/^spray_/.test(k)&&D.map[k]; }, TURN=new Set(['sunflower-80ce15']);   // (TURN: baked upside down, turned over here)
  // its points in metres (its foot at 0, centred), coloured as baked
  const decode=R=>{ const q=new Int16Array(Uint8Array.from(atob(R.p),c=>c.charCodeAt(0)).buffer), col=Uint8Array.from(atob(R.c),c=>c.charCodeAt(0)), b=R.b;
    const Pp=new Float32Array(q.length), C=new Float32Array(col.length), c=new THREE.Color(); for(let i=0;i<q.length;i++){ const a=i%3; Pp[i]=b[a]+(q[i]+32768)/65535*(b[a+3]-b[a]); }
    for(let i=0;i<col.length;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals(); g.computeBoundingSphere(); g.userData.keep=true; return g; };
  const geo=(k,R)=>{ let g=GEO.get(k); if(!g){ GEO.set(k,g=decode(R||D.m[k])); if(TURN.has(k)){ g.computeBoundingBox(); const b=g.boundingBox; g.rotateX(Math.PI); g.translate(0,b.min.y+b.max.y,0); g.computeBoundingBox(); g.computeBoundingSphere(); } } return g; }; PFI.decode=decode;
  // the model, its moving parts (a valve, a pedal, a cymbal: tools/pfitems-bake.py) each its own mesh in place, found by name in userData.parts (its rest place and turn in at and q0)
  const make=(k,M)=>{ const R=D.m[k], m=new THREE.Mesh(geo(k),M); m.castShadow=m.receiveShadow=true; m.userData.shared=true; m.userData.pf=k; m.userData.parts={};
    for(const [n,P] of Object.entries(R.parts||{})){ const q=new THREE.Mesh(geo(k+'|'+n,P),M); q.castShadow=q.receiveShadow=true; q.userData.shared=true; q.position.set(...P.at); q.quaternion.set(...P.q); q.userData.at=q.position.clone(); q.userData.q0=q.quaternion.clone(); q.name=n; m.add(q); m.userData.parts[n]=q; }
    return m; };
  PFI.has=id=>!!key(id);
  PFI.mesh=id=>key(id)?make(key(id),LMAT||(LMAT=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}))):null; let LMAT=null;
  PFI.on.push(()=>INSTR.pfReady(PFI));
  INSPECT.kinds.unshift({is:id=>!!key(id),make:id=>{ const g=new THREE.Group(); g.add(make(key(id),MAT)); g.userData.pf=key(id); return g; }});
  SYS.onStart(()=>setTimeout(()=>PFI.load(),3000),'150cyb-pfitems'); }
export {PFI};
