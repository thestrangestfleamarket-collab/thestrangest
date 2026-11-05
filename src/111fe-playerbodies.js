// THE PLAYER BODIES: the six bodies A–F (data/bodies.json: tools/bodies-bake.mjs, then tools/rig-rebake.py players) on your rig, smooth and cel-lit, each its own height; everyone is one of them (BODIES.base), not the Walker (owner, 4 Nov 2026). SHAPES: a design — its start, the BODY and FACE sliders (data/shapes-X.json), its skin, hair and eye colours and hair style (data/hair-X.json) — in one code kept in OWNED and sent with your look.
import {THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {LOOKS} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
const SHAPES={names:[],mine:null}; window.SHAPES=SHAPES;
{ const DATA=__LAZY__("data/bodies.json"), KEYS='ABCDEF';
  const SH={A:__LAZY__("data/shapes-A.json"),B:__LAZY__("data/shapes-B.json"),C:__LAZY__("data/shapes-C.json"),D:__LAZY__("data/shapes-D.json"),E:__LAZY__("data/shapes-E.json"),F:__LAZY__("data/shapes-F.json")};
  const HR={A:__LAZY__("data/hair-A.json"),B:__LAZY__("data/hair-B.json"),C:__LAZY__("data/hair-C.json"),D:__LAZY__("data/hair-D.json"),E:__LAZY__("data/hair-E.json"),F:__LAZY__("data/hair-F.json")};
  const NS=64, STYLES=['part','bob','curly','crop','ponytail','bun','bald'], base=k=>BODIES.by['p'+k];
  // a design's code: its start (A–F), the sliders' values (a signed byte each, -100…100), then after a dot its looks (hair style, which colours are its own, and those colours), url-safe
  const b64=b=>btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''), unb64=s=>atob(s.replace(/-/g,'+').replace(/_/g,'/'));
  const CK=['skin','hairC','eyeC'];
  const enc=(k,v,L)=>{ const b=Array.from(v,x=>Math.max(-100,Math.min(100,Math.round(x*100)))&255); while(b.length&&!b[b.length-1])b.pop(); let c=k+(b.length?b64(b):'');
    L=L||{}; const st=STYLES.indexOf(L.hair)+1; let fl=0; const lb=[st,0]; CK.forEach((n,i)=>{ if(L[n]!=null){ fl|=1<<i; lb.push(L[n]>>16&255,L[n]>>8&255,L[n]&255); } }); lb[1]=fl; return st||fl?c+'.'+b64(lb):c; };
  const dec=c=>{ const v=new Float32Array(NS), L={}; c=c||''; let k=c[0]; if(!KEYS.includes(k))k=null; const [sv,lv]=c.slice(1).split('.');
    try{ const s=unb64(sv||''); for(let i=0;i<Math.min(NS,s.length);i++){ const b=s.charCodeAt(i); v[i]=(b>127?b-256:b)/100; } }catch(e){}
    try{ if(lv){ const s=unb64(lv), a=i=>s.charCodeAt(i); if(a(0))L.hair=STYLES[a(0)-1]; let j=2; CK.forEach((n,i)=>{ if(a(1)&1<<i){ L[n]=a(j)<<16|a(j+1)<<8|a(j+2); j+=3; } }); } }catch(e){}
    return {k,v,L}; };
  const designed=d=>!!d&&(d.v.some(x=>x)||Object.keys(d.L||{}).length>0);
  // each start's sliders, loaded once: the points each moves (index, change) and how far each joint goes
  const T={}, loading={};
  const load=k=>T[k]?Promise.resolve(T[k]):(loading[k]||(loading[k]=SH[k]().then(J=>{ SHAPES.names=J.sliders.map(s=>s.name);
    T[k]=J.sliders.map(s=>{ const m=B64(s.m), d=new Int8Array(B64(s.d).buffer.slice(0)), ix=[]; for(let i=0;i<J.n;i++)if(m[i>>3]&(1<<(i&7)))ix.push(i); const D=new Float32Array(d.length); for(let i=0;i<d.length;i++)D[i]=d[i]*s.sc; return {ix:Int32Array.from(ix),D,o:s.o}; }); return T[k]; })));
  const HS={}, hairs=k=>HS[k]||(HS[k]=HR[k]());
  // a body at a design: its points (a swapped hair rides the head point nearest it), joints, height and hip moved from its start's
  const reshape=(body,v)=>{ const b=body.src, P=body.GEO.attributes.position, A=P.array, R0=body.R0, n=b.P0.length/3; A.set(R0); const O=b.origin.map(o=>o.slice()), t=T[b.k];
    if(t)for(let i=0;i<NS;i++){ const w=v[i]; if(!w||!t[i])continue; const {ix,D,o}=t[i]; for(let j=0;j<ix.length;j++){ const p=ix[j]*3; A[p]+=w*D[3*j]; A[p+1]+=w*D[3*j+1]; A[p+2]+=w*D[3*j+2]; } o.forEach((d,j)=>{ O[j][0]+=w*d[0]; O[j][1]+=w*d[1]; O[j][2]+=w*d[2]; }); }
    if(body.near)for(let j=0;j<body.near.length;j++){ const q=body.near[j]*3, p=(n+j)*3; for(let c=0;c<3;c++)A[p+c]+=A[q+c]-R0[q+c]; }
    let top=0; for(let i=1;i<A.length;i+=3)if(A[i]>top)top=A[i];
    const {off,binv}=BODIES.skeleton(O,b.rest); body.off=off; body.binv=binv; body.height=top; body.hipY=O[0][1]; body.scale=b.metres/1.76*top/b.height; BODIES.fit(body);
    P.needsUpdate=true; body.GEO.computeVertexNormals(); body.GEO.computeBoundingSphere(); };
  // its hair: its own, another style (on the head, its own points), or none
  const setHair=(body,st,H)=>{ const b=body.src, n=b.P0.length/3, g=body.GEO, hr=b.ranges.hair, own=!st;
    let HP=null, HI=null, m=0; if(H){ const Q=I16(H.p); m=H.n; HP=new Float32Array(m*3); for(let i=0;i<m*3;i++)HP[i]=(Q[i]+32500)*H.sc+H.lo[i%3]; HI=U16(H.i); }
    const R0=new Float32Array((n+m)*3); R0.set(b.P0); if(HP)R0.set(HP,n*3); body.R0=R0;
    const bi=new Float32Array((n+m)*2), bw=new Float32Array(n+m); bi.set(b.BI); bw.set(b.BW); for(let j=n;j<n+m;j++){ bi[2*j]=bi[2*j+1]=b.head; bw[j]=1; }
    const I=[]; for(let i=0;i<b.IDX.length;i+=3){ const a=b.IDX[i]; if(!own&&hr&&a>=hr[0]&&a<hr[0]+hr[1])continue; I.push(b.IDX[i],b.IDX[i+1],b.IDX[i+2]); } if(HI)for(const i of HI)I.push(i+n);
    body.near=null; if(HP){ const cand=[]; for(const [nm,s0,c] of b.ranges.all)if(nm==='body')for(let v=s0;v<s0+c;v++)if(b.P0[3*v+1]>b.neckY)cand.push(v);
      body.near=new Int32Array(m); for(let j=0;j<m;j++){ let bd=1e9, bv=0; const x=HP[3*j], y=HP[3*j+1], z=HP[3*j+2]; for(const v of cand){ const d=(b.P0[3*v]-x)**2+(b.P0[3*v+1]-y)**2+(b.P0[3*v+2]-z)**2; if(d<bd){ bd=d; bv=v; } } body.near[j]=bv; } }
    g.setAttribute('position',new THREE.BufferAttribute(R0.slice(),3)); g.setAttribute('color',new THREE.BufferAttribute(new Float32Array((n+m)*3),3)); g.setAttribute('bi',new THREE.BufferAttribute(bi,2)); g.setAttribute('bw',new THREE.BufferAttribute(bw,1));
    g.setIndex(new THREE.BufferAttribute(n+m>65535?new Uint32Array(I):new Uint16Array(I),1)); body.hs=st||''; };
  // its colours: skin (and lips), hair (and brows), eyes; the start's own where the design has none
  const rgb=h=>[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255], mix=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
  const colour=body=>{ const b=body.src, L=body.L||{}, A=body.GEO.attributes.color.array, n=b.P0.length/3; A.set(b.C0);
    const put=(nm,c)=>{ for(const [r,s0,cnt] of b.ranges.all)if(r===nm)for(let v=s0;v<s0+cnt;v++)A.set(c,3*v); };
    if(L.skin!=null){ const s=rgb(L.skin); put('body',s); put('lip',mix(s,rgb(0xa05a50),.45)); }
    const hc=rgb(L.hairC!=null?L.hairC:b.colors.hair||0); if(L.hairC!=null){ put('hair',hc); put('brow',hc.map(x=>x*.85)); } for(let v=n;v<A.length/3;v++)A.set(hc,3*v);
    if(L.eyeC!=null)put('iris',rgb(L.eyeC)); body.GEO.attributes.color.needsUpdate=true; };
  // a body put in a design: its hair, colours and shape (each part as soon as what it needs has come)
  const dress=(body,v,L)=>{ body.v=v; body.L=L||{}; const k=body.src.k, own=body.src.own, st=body.L.hair&&body.L.hair!==own?body.L.hair:'', tk=body.tk=(body.tk||0)+1;
    const hair=st&&st!=='bald'?hairs(k).then(H=>H.styles[st]):Promise.resolve(null), sl=v.some(x=>x)?load(k):Promise.resolve();
    return Promise.all([hair,sl]).then(([H])=>{ if(tk!==body.tk)return; if(body.hs!==st)setHair(body,st,H); colour(body); reshape(body,v); }).catch(e=>console.warn('PLAYER BODIES',e)); };
  const add=(D,k)=>{ const b=D.bodies[k], {off,binv}=BODIES.skeleton(b.origin,b.rest), head=D.bones.indexOf('head');
    const Q=I16(b.pos), P0=new Float32Array(Q.length); for(let i=0;i<Q.length;i++)P0[i]=(Q[i]+32500)*b.sc+b.lo[i%3];
    const n=P0.length/3, VC=B64(b.vcol), BN=B64(b.bone), BWb=B64(b.w), C0=new Float32Array(n*3), BI=new Float32Array(n*2), BW=new Float32Array(n);
    for(let v=0;v<n;v++){ C0[3*v]=VC[3*v]/255; C0[3*v+1]=VC[3*v+1]/255; C0[3*v+2]=VC[3*v+2]/255; BI[2*v]=BN[2*v]; BI[2*v+1]=BN[2*v+1]; BW[v]=BWb[v]/255; }
    const rs=b.ranges||[], hr=rs.find(r=>r[0]==='hair'), colors=b.colors||{}, IDX=U16(b.tri);
    const src={k,P0,C0,BI,BW,IDX,head,origin:b.origin,rest:b.rest,height:b.height,metres:b.metres,own:colors.style,colors,neckY:b.origin[2][1],ranges:{all:rs,hair:hr?[hr[1],hr[2]]:null}};
    const geo=()=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P0.slice(),3)); g.setAttribute('color',new THREE.BufferAttribute(C0.slice(),3)); g.setAttribute('bi',new THREE.BufferAttribute(BI.slice(),2)); g.setAttribute('bw',new THREE.BufferAttribute(BW.slice(),1));
      g.setIndex(new THREE.BufferAttribute(IDX.slice(),1)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
    const make=(key,d)=>{ const body={key,label:b.name,geo,height:b.height,hipY:b.hipY,off,binv,soft:true,scale:b.metres/1.76,src,R0:P0,hs:''}; body.GEO=geo(); BODIES.fit(body);
      if(designed(d))dress(body,d.v,d.L); else { body.v=d?d.v:new Float32Array(NS); body.L={}; } return body; };
    const VAR=new Map(), me=make('p'+k+'~me',null), mineD=()=>SHAPES.mine&&SHAPES.mine.k===k?SHAPES.mine:null;
    BODIES.add({key:'p'+k,label:b.name,geo,height:b.height,hipY:b.hipY,off,binv,at:null,soft:true,scale:b.metres/1.76,playable:true,
      // you: the design you wear; the others: a body for their design's code (made once, dressed when what it needs arrives)
      mine:()=>designed(mineD())?me:null, look:()=>{ const d=mineD(); return d?enc(k,d.v,d.L).slice(1):''; },
      variant:c=>{ if(!c)return BODIES.by['p'+k]; let body=VAR.get(c); if(!body){ body=make('p'+k+'~'+c,dec(k+c)); VAR.set(c,body); } return body; },
      dress:(v,L)=>dress(me,v,L), start:colors}); };
  const saved=dec(OWNED.get('shape')||''); if(saved.k)SHAPES.mine=saved;
  Object.assign(SHAPES,{enc,dec,load,NS,STYLES,
    // the design you wear: its start, values and looks, worn, dressed and kept (on the server)
    set:(k,v,L)=>{ L=L||(SHAPES.mine&&SHAPES.mine.L)||{}; SHAPES.mine={k,v:Float32Array.from(v),L:{...L}}; BODIES.set('p'+k); const b=base(k); try{ OWNED.set('shape',enc(k,v,L)); }catch(e){} return b?b.dress(SHAPES.mine.v,SHAPES.mine.L):Promise.resolve(); },
    // a start's own colours and hair style (where the designer's choices begin)
    start:k=>{ const b=base(k); return b&&b.start||{}; }});
  SYS.onStart(()=>DATA().then(D=>{ for(const k of Object.keys(D.bodies))add(D,k); BODIES.base=()=>SHAPES.mine?'p'+SHAPES.mine.k:(LOOKS.L&&LOOKS.L.form==='F')?'pB':'pA';
    if(designed(SHAPES.mine)){ const b=base(SHAPES.mine.k); if(b)b.dress(SHAPES.mine.v,SHAPES.mine.L); } }).catch(e=>console.warn('PLAYER BODIES',e)),'111fe-playerbodies'); }
export {SHAPES};
