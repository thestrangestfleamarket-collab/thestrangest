// THE PLAYER BODIES: the six new bodies A–F (data/bodies.json: tools/bodies-bake.mjs, then tools/rig-rebake.py players) on your rig, smooth and cel-lit; each its own height; everyone is one of them (BODIES.base: A, or B for FEMALE), not the Walker (owner, 4 Nov 2026).
import {THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {LOOKS} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
{ const DATA=__LAZY__("data/bodies.json");
  const add=(D,k)=>{ const b=D.bodies[k], {off,binv}=BODIES.skeleton(b.origin,b.rest);
    const geo=()=>{ const Q=I16(b.pos), P=new Float32Array(Q.length); for(let i=0;i<Q.length;i++)P[i]=(Q[i]+32500)*b.sc+b.lo[i%3];
      const n=P.length/3, VC=B64(b.vcol), BN=B64(b.bone), BW=B64(b.w), col=new Float32Array(n*3), bi=new Float32Array(n*2), bw=new Float32Array(n);
      for(let v=0;v<n;v++){ col[3*v]=VC[3*v]/255; col[3*v+1]=VC[3*v+1]/255; col[3*v+2]=VC[3*v+2]/255; bi[2*v]=BN[2*v]; bi[2*v+1]=BN[2*v+1]; bw[v]=BW[v]/255; }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setAttribute('bi',new THREE.BufferAttribute(bi,2)); g.setAttribute('bw',new THREE.BufferAttribute(bw,1));
      g.setIndex(new THREE.BufferAttribute(U16(b.tri),1)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
    BODIES.add({key:'p'+k,label:b.name,geo,height:b.height,hipY:b.hipY,off,binv,at:null,soft:true,scale:b.metres/1.76,playable:true}); };
  BODIES.base=()=>(LOOKS.L&&LOOKS.L.form==='F')?'pB':'pA';
  SYS.onStart(()=>DATA().then(D=>{ for(const k of Object.keys(D.bodies))add(D,k); }).catch(e=>console.warn('PLAYER BODIES',e)),'111fe-playerbodies'); }
