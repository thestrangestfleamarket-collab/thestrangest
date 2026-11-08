// THE THINGS' POLYFORK MODELS (owner, 8 Nov 2026: "lets look for polyfork assets for anything in game and use those"): an item Polyfork has (data/pfitems.json, tools/pfitems-bake.py) is drawn as that model wherever items are (the ground, the inspect window), fetched after the start; the shapes of 150cya until it comes and for the rest.
import {THREE} from './003-shx.js';
import {INSPECT} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
const PFI={on:[]}; window.PFI=PFI;
{ const LZ=__LAZY__("data/pfitems.json"), GEO=new Map(), MAT=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.85}); let D=null, P=null;
  PFI.load=()=>P||(P=LZ().then(j=>{ D=j; for(const f of PFI.on)try{ f(); }catch(e){ console.warn('PFI',e); } }).catch(e=>{ P=null; console.warn('PFI',e); }));
  const key=id=>D&&D.map[String(id).split('~')[0]];
  // its points in metres (its foot at 0, centred), coloured as baked
  const geo=k=>{ let g=GEO.get(k); if(g)return g; const R=D.m[k], q=new Int16Array(Uint8Array.from(atob(R.p),c=>c.charCodeAt(0)).buffer), col=Uint8Array.from(atob(R.c),c=>c.charCodeAt(0)), b=R.b;
    const Pp=new Float32Array(q.length), C=new Float32Array(col.length), c=new THREE.Color(); for(let i=0;i<q.length;i++){ const a=i%3; Pp[i]=b[a]+(q[i]+32768)/65535*(b[a+3]-b[a]); }
    for(let i=0;i<col.length;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals(); g.computeBoundingSphere(); g.userData.keep=true; GEO.set(k,g); return g; };
  PFI.has=id=>!!key(id);
  INSPECT.kinds.unshift({is:id=>!!key(id),make:id=>{ const m=new THREE.Mesh(geo(key(id)),MAT), g=new THREE.Group(); m.castShadow=m.receiveShadow=true; m.userData.shared=true; g.add(m); g.userData.pf=key(id); return g; }});
  SYS.onStart(()=>setTimeout(()=>PFI.load(),3000),'150cyb-pfitems'); }
export {PFI};
