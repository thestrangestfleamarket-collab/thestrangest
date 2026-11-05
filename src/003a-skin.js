// THE SKIN: SKIN unpacks baked skinned models into geometry, bones and clips, with the B64 and typed-array readers.
import {THREE} from './003-shx.js';

const B64=s=>{ if(typeof s!=='string')return s; if(Uint8Array.fromBase64)return Uint8Array.fromBase64(s); const t=atob(s), u=new Uint8Array(t.length); for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i); return u; }, F32=s=>new Float32Array(B64(s).buffer), I16=s=>new Int16Array(B64(s).buffer), U16=s=>new Uint16Array(B64(s).buffer), BY=(M,k)=>M.$b&&M.$b[k]||M[k];
const SKIN=(()=>{ const GC=new WeakMap(), IC=new WeakMap(), CC=new WeakMap();
  const pts=M=>{ const q=I16(BY(M,'p')), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3]; return P; };
  const dec=M=>{ let D=GC.get(M); if(!D)GC.set(M,D={p:pts(M),c:B64(BY(M,'c')),i:U16(BY(M,'i')),r:M.r?Float32Array.from(B64(BY(M,'r'))):null,j:M.j?B64(BY(M,'j')):null,w:M.w?B64(BY(M,'w')):null}); return D; };
  const geom=(M,sk=true,reg=true)=>{ const D=dec(M), g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(D.p.slice(),3)); g.setAttribute('color',new THREE.BufferAttribute(D.c.slice(),3,true)); g.setIndex(new THREE.BufferAttribute(D.i.slice(),1));
    g.setAttribute('reg',new THREE.BufferAttribute(reg&&D.r?D.r.slice():new Float32Array(M.n),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(M.n),1));
    if(sk&&D.j){ g.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(D.j.slice(),4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(D.w.slice(),4,true)); } return g; };
  const rig=(R,names=R.names)=>{ const bones=R.names.map((n,i)=>{ const B=new THREE.Bone(); B.name=names[i]; B.position.fromArray(R.t[i]); B.quaternion.fromArray(R.q[i]); if(R.s)B.scale.fromArray(R.s[i]); return B; });
    R.parent.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); }); let ibm=IC.get(R); if(!ibm)IC.set(R,ibm=F32(BY(R,'ibm'))); return {bones,skeleton:new THREE.Skeleton(bones,bones.map((_,i)=>new THREE.Matrix4().fromArray(ibm,i*16)))}; };
  const clips=(S,BN,root=true,pn=n=>n)=>{ let out=CC.get(S); if(out)return out; CC.set(S,out={});
    for(const [name,C] of Object.entries(S)){ const T=Array.from({length:C.n},(_,k)=>k*C.dur/(C.n-1)), Q=I16(BY(C,'q')), tracks=[];
      BN.forEach((bn,j)=>{ const v=new Float32Array(C.n*4); for(let k=0;k<C.n;k++)for(let c=0;c<4;c++)v[k*4+c]=Q[(k*BN.length+j)*4+c]/32000; tracks.push(new THREE.QuaternionKeyframeTrack(bn+'.quaternion',T,v)); });
      for(const bn of Object.keys(C.p))if(root||bn!=='root')tracks.push(new THREE.VectorKeyframeTrack(pn(bn)+'.position',T,F32(BY(C.p,bn))));
      out[name]=new THREE.AnimationClip(name,C.dur,tracks); } return out; };
  return {pts,dec,geom,rig,clips}; })();
export {B64, BY, F32, I16, SKIN, U16};
