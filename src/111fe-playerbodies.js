// THE PLAYER BODIES: the six bodies A–F (data/bodies.json: tools/bodies-bake.mjs, then tools/rig-rebake.py players) on your rig, smooth and cel-lit, each its own height; everyone is one of them (BODIES.base), not the Walker (owner, 4 Nov 2026). SHAPES: the BODY sliders (data/shapes-X.json), a design's code (its start and 18 values) kept in OWNED and sent with your look.
import {THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {LOOKS} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
const SHAPES={names:[],mine:null}; window.SHAPES=SHAPES;
{ const DATA=__LAZY__("data/bodies.json"), KEYS='ABCDEF';
  const SH={A:__LAZY__("data/shapes-A.json"),B:__LAZY__("data/shapes-B.json"),C:__LAZY__("data/shapes-C.json"),D:__LAZY__("data/shapes-D.json"),E:__LAZY__("data/shapes-E.json"),F:__LAZY__("data/shapes-F.json")};
  const NS=18, base=k=>BODIES.by['p'+k];
  // a design's code: its start (A–F) and the sliders' values, a signed byte each (-100…100), url-safe
  const enc=(k,v)=>{ const b=Array.from(v,x=>Math.max(-100,Math.min(100,Math.round(x*100)))&255); while(b.length&&!b[b.length-1])b.pop(); return k+(b.length?btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''):''); };
  const dec=c=>{ const v=new Float32Array(NS); let k=(c||'')[0]; if(!KEYS.includes(k))k=null; try{ const s=atob((c||'').slice(1).replace(/-/g,'+').replace(/_/g,'/')); for(let i=0;i<Math.min(NS,s.length);i++){ const b=s.charCodeAt(i); v[i]=(b>127?b-256:b)/100; } }catch(e){} return {k,v}; };
  // each start's sliders, loaded once: the points each moves (index, change) and how far each joint goes
  const T={}, loading={};
  const load=k=>T[k]?Promise.resolve(T[k]):(loading[k]||(loading[k]=SH[k]().then(J=>{ SHAPES.names=J.sliders.map(s=>s.name);
    T[k]=J.sliders.map(s=>{ const m=B64(s.m), d=new Int8Array(B64(s.d).buffer.slice(0)), ix=[]; for(let i=0;i<J.n;i++)if(m[i>>3]&(1<<(i&7)))ix.push(i); const D=new Float32Array(d.length); for(let i=0;i<d.length;i++)D[i]=d[i]*s.sc; return {ix:Int32Array.from(ix),D,o:s.o}; }); return T[k]; })));
  // a body at a design: its points, joints, height and hip moved from its start's
  const reshape=(body,v)=>{ const b=body.src, P=body.GEO.attributes.position, A=P.array; A.set(b.P0); const O=b.origin.map(o=>o.slice()), t=T[b.k];
    if(t)for(let i=0;i<NS;i++){ const w=v[i]; if(!w||!t[i])continue; const {ix,D,o}=t[i]; for(let j=0;j<ix.length;j++){ const p=ix[j]*3; A[p]+=w*D[3*j]; A[p+1]+=w*D[3*j+1]; A[p+2]+=w*D[3*j+2]; } o.forEach((d,j)=>{ O[j][0]+=w*d[0]; O[j][1]+=w*d[1]; O[j][2]+=w*d[2]; }); }
    let top=0; for(let i=1;i<A.length;i+=3)if(A[i]>top)top=A[i];
    const {off,binv}=BODIES.skeleton(O,b.rest); body.off=off; body.binv=binv; body.height=top; body.hipY=O[0][1]; body.scale=b.metres/1.76*top/b.height; BODIES.fit(body);
    P.needsUpdate=true; body.GEO.computeVertexNormals(); body.GEO.computeBoundingSphere(); };
  const add=(D,k)=>{ const b=D.bodies[k], {off,binv}=BODIES.skeleton(b.origin,b.rest);
    const Q=I16(b.pos), P0=new Float32Array(Q.length); for(let i=0;i<Q.length;i++)P0[i]=(Q[i]+32500)*b.sc+b.lo[i%3];
    const src={k,P0,origin:b.origin,rest:b.rest,height:b.height,metres:b.metres};
    const geo=()=>{ const n=P0.length/3, VC=B64(b.vcol), BN=B64(b.bone), BW=B64(b.w), col=new Float32Array(n*3), bi=new Float32Array(n*2), bw=new Float32Array(n);
      for(let v=0;v<n;v++){ col[3*v]=VC[3*v]/255; col[3*v+1]=VC[3*v+1]/255; col[3*v+2]=VC[3*v+2]/255; bi[2*v]=BN[2*v]; bi[2*v+1]=BN[2*v+1]; bw[v]=BW[v]/255; }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P0.slice(),3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setAttribute('bi',new THREE.BufferAttribute(bi,2)); g.setAttribute('bw',new THREE.BufferAttribute(bw,1));
      g.setIndex(new THREE.BufferAttribute(U16(b.tri),1)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
    const make=(key,v)=>{ const body={key,label:b.name,geo,height:b.height,hipY:b.hipY,off,binv,soft:true,scale:b.metres/1.76,src,v}; body.GEO=geo(); BODIES.fit(body);
      if(v&&v.some(x=>x))load(k).then(()=>reshape(body,body.v)); return body; };
    const VAR=new Map(), me=make('p'+k+'~me',new Float32Array(NS));
    BODIES.add({key:'p'+k,label:b.name,geo,height:b.height,hipY:b.hipY,off,binv,at:null,soft:true,scale:b.metres/1.76,playable:true,
      // you: the design you wear; the others: a body for their design's code (made once, its shape set when its sliders arrive)
      mine:()=>SHAPES.mine&&SHAPES.mine.k===k&&SHAPES.mine.v.some(x=>x)?me:null, look:()=>SHAPES.mine&&SHAPES.mine.k===k?enc(k,SHAPES.mine.v).slice(1):'',
      variant:c=>{ if(!c)return BODIES.by['p'+k]; let body=VAR.get(c); if(!body){ body=make('p'+k+'~'+c,dec(k+c).v); VAR.set(c,body); } return body; },
      reshape:v=>{ me.v=v; return load(k).then(()=>reshape(me,v)); }}); };
  const saved=dec(OWNED.get('shape')||''); if(saved.k)SHAPES.mine=saved;
  Object.assign(SHAPES,{enc,dec,load,
    // the design you wear: its start and values, worn, shaped and kept (on the server)
    set:(k,v)=>{ SHAPES.mine={k,v:Float32Array.from(v)}; BODIES.set('p'+k); const b=base(k); try{ OWNED.set('shape',enc(k,v)); }catch(e){} return b?b.reshape(SHAPES.mine.v):Promise.resolve(); }});
  SYS.onStart(()=>DATA().then(D=>{ for(const k of Object.keys(D.bodies))add(D,k); BODIES.base=()=>SHAPES.mine?'p'+SHAPES.mine.k:(LOOKS.L&&LOOKS.L.form==='F')?'pB':'pA';
    if(SHAPES.mine){ const b=base(SHAPES.mine.k); if(b&&SHAPES.mine.v.some(x=>x))b.reshape(SHAPES.mine.v); } }).catch(e=>console.warn('PLAYER BODIES',e)),'111fe-playerbodies'); }
export {SHAPES};
