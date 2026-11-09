// THE LOOSE THINGS: GPH lets the light furniture and goods be pushed, kicked, picked up and carried.
import {SHARED, THREE} from './003-shx.js';
import {DRESS, ED, GPH, keys, MOTION, NPCS, ONLINE, PB, PERFX, PHYS, pos, RIDE, ROOMS, SFX, st, UI, USE, VIT, W3, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, MODS, QS, SOL, SYS, TILE} from './006-map-pre.js';
import {OBJS} from './008-batch.js';
import {BVH} from './137-bvh.js';

{ const T=TILE, M1=T/.84, RS=12*T, RF=15*T, CARRY=30, G0=0x00040001, GI=0x00010007, GH=0x00010005, GY=0x00020001, DT=1/60;
  const HANG=/hanging plant|hanging pothos|paper lantern|bare bulb/i;
  const CLS=[[HANG,40],[/drinks fridge|shelf|shelves|sink|counter|back bar|fern bush|drone|wall|DJ|stove|meter|planted/i,0],
    [/wardrobe|fridge|bookshelf|cabinet|bed$|dumpster|speaker|shelving|garden lantern|long table|stump|chest|repair bench|planter|sofa|desk|TV on|brazier/i,70],
    [/chair|stool|table|bench|barrel|screen|floor lamp|rope line|newspaper rack|^bin$|box fan|bokken|umbrella|vacuum|andon|ground lantern|gooseneck|iron and|buckets|trash can/i,28],
    [/crate|box|bags|bottle|empties|jar|candle|incense|radio|computer|camera|tapes|glasses|till|lottery|pot|fern|fig|lily|lilac|broom|bone|skull|old TV|books/i,120]];
  let R=null, world=null, gm=null, P0=null, N0=null, you=null, fb=null, held=null, acc=0, lastHit=null, ready=false, zt=0, shade=0, hooks=null, eq=null, zn=0, picks=[], cat=false, want=null, pre=new Set(), pt=0, LIGHTS=null, lk=null, fxL=null, fxM=null, lx=0, lz=0, ly=0, live=0;
  const items=[], act=new Set(), stat=new Map(), owned=new Set(), byB=new Map(), SKIP=new Map(), FXR=new Map();
  const V=new THREE.Vector3(), Q=new THREE.Quaternion(), M4=new THREE.Matrix4(), M5=new THREE.Matrix4(), S1=new THREE.Vector3(1,1,1);
  const BRK=/bottle|jar|glass|empties|old TV|candle|lamp/i, ROUND=/bottle|jar|barrel|can$|trash can|pot|candle|bucket|lily|fern|fig|lilac|stump|umbrella/i, byC=new Map(), hit0=new Map();
  const SPLIT=/boxes|crates|glasses|empties|tapes|bones|bottles/i, cls=n=>{ for(const [r,d] of CLS)if(r.test(n))return d; return 0; };
  const mk=(o,k,a,b,x)=>({o,k,a,b,c:[0,1,2].map(i=>(a[i]+b[i])/2),h:[0,1,2].map(i=>Math.max(.02*T,(b[i]-a[i])/2)),q:{x:0,y:0,z:0,w:1},rb:null,sol:[],still:0,name:o?o.name:'',...x});
  const vol=it=>8*it.h[0]*it.h[1]*it.h[2];
  const near=()=>{ if(!SHARED.BOD.SB||SHARED.LVL!=='up')return false; const B=SHARED.BOD.SB, x0=SHARED.BOD.X(B.x0)-4*T, x1=SHARED.BOD.X(B.x1)+4*T, z0=SHARED.BOD.Z(B.y0)-4*T, z1=SHARED.BOD.Z(B.y1)+4*T; return pos.x>x0&&pos.x<x1&&pos.z>z0&&pos.z<z1; };
  const comps=o=>{ const L=o.parts.map(p=>{ const A=p.me.geometry.attributes.position.array, a=[1e9,1e9,1e9], b=[-1e9,-1e9,-1e9]; for(let v=p.v0;v<p.v0+6;v++)for(let k=0;k<3;k++){ const q=A[v*3+k]; if(q<a[k])a[k]=q; if(q>b[k])b[k]=q; } return {p,a,b}; }).filter(q=>q.b[0]-q.a[0]+q.b[1]-q.a[1]+q.b[2]-q.a[2]>1e-4);
    const U=L.map((_,i)=>i), f=i=>U[i]===i?i:(U[i]=f(U[i])), e=.02*T;
    for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){ const A=L[i], B=L[j]; if(A.a[0]<=B.b[0]+e&&B.a[0]<=A.b[0]+e&&A.a[1]<=B.b[1]+e&&B.a[1]<=A.b[1]+e&&A.a[2]<=B.b[2]+e&&B.a[2]<=A.b[2]+e)U[f(i)]=f(j); }
    const G=new Map(); L.forEach((q,i)=>{ const r=f(i); (G.get(r)||G.set(r,[]).get(r)).push(q); }); const C=[...G.values()].map(L=>({L,a:[0,1,2].map(k=>Math.min(...L.map(q=>q.a[k]))),b:[0,1,2].map(k=>Math.max(...L.map(q=>q.b[k])))}));
    const ar=p=>(p.b[0]-p.a[0])*(p.b[2]-p.a[2]), joins=(p,q)=>ov(p,q,-.03*T)&&(Math.min(p.b[0],q.b[0])-Math.max(p.a[0],q.a[0]))*(Math.min(p.b[2],q.b[2])-Math.max(p.a[2],q.a[2]))>=.7*Math.min(ar(p),ar(q));
    for(let go=1;go;){ go=0; for(let i=0;i<C.length&&!go;i++)for(let j=i+1;j<C.length;j++)if(joins(C[i],C[j])){ const p=C[i], q=C.splice(j,1)[0]; p.L.push(...q.L); for(let k=0;k<3;k++){ p.a[k]=Math.min(p.a[k],q.a[k]); p.b[k]=Math.max(p.b[k],q.b[k]); } go=1; break; } }
    return C; };
  const ov=(p,q,e)=>p.a[0]<q.b[0]-e&&q.a[0]<p.b[0]-e&&p.a[1]<q.b[1]-e&&q.a[1]<p.b[1]-e&&p.a[2]<q.b[2]-e&&q.a[2]<p.b[2]-e;
  let cg=false, cc=false; function catalog(){ const k0=items.length; cat=true;
    if(!cg&&SHARED.BOD.goodsMesh&&SHARED.BOD.goods){ cg=true; gm=SHARED.BOD.goodsMesh; const g=gm.geometry, pa=g.attributes.position; pa.setUsage(THREE.DynamicDrawUsage); g.attributes.normal.setUsage(THREE.DynamicDrawUsage); P0=pa.array.slice(); N0=g.attributes.normal.array.slice();
      for(const G of SHARED.BOD.goods){ const a=[1e9,1e9,1e9], b=[-1e9,-1e9,-1e9]; for(let v=G.v0;v<G.v1;v++)for(let k=0;k<3;k++){ const q=P0[v*3+k]; if(q<a[k])a[k]=q; if(q>b[k])b[k]=q; } items.push(mk(null,'v',a,b,{name:G.k,m:G.m,v0:G.v0,v1:G.v1})); }
      g._bvhDyn=true; g.computeBoundingSphere(); g.boundingSphere.radius+=T; g.boundingBox=null; }
    if(!cc&&typeof DRESS!=='undefined'&&DRESS.rounds&&(cc=true))for(const cn of DRESS.cans||[]){ const L=[], a=[1e9,1e9,1e9], b=[-1e9,-1e9,-1e9], y0=MODS.bodega.ground(cn.x,cn.z), s=new THREE.Vector3();
      for(const me of [DRESS.rounds,DRESS.blocks])for(let i=0;i<me.count;i++){ me.getMatrixAt(i,M4); V.setFromMatrixPosition(M4); if(Math.hypot(V.x-cn.x,V.z-cn.z)>.5*M1||V.y>y0+1.3*M1)continue; s.setFromMatrixScale(M4);
        [V.x,V.y,V.z].forEach((c,k)=>{ const e=[s.x,s.y,s.z][k]/2; a[k]=Math.min(a[k],c-e); b[k]=Math.max(b[k],c+e); }); L.push([me,i,M4.clone()]); }
      if(!L.length)continue; const it=mk(null,'i',a,b,{name:'trash can',inst:L}); it.m=28*vol(it)/M1**3; for(const q of L)q[2].premultiply(M4.makeTranslation(-it.c[0],-it.c[1],-it.c[2])); items.push(it); }
    if(items.length>k0)fin(items.slice(k0)); }
  let nO=0; const more=()=>{ const N=[], t0=performance.now();
    for(;nO<OBJS.length&&performance.now()-t0<3;nO++){ const o=OBJS[nO], d=cls(o.name||''); if(!d||!o.parts.length)continue;
      const W=SPLIT.test(o.name)?comps(o):[o.parts.reduce((w,p)=>{ const A=p.me.geometry.attributes.position.array; w.L.push({p}); for(let v=p.v0*3;v<p.v0*3+18;v+=3)for(let k=0;k<3;k++){ const q=A[v+k]; if(q<w.a[k])w.a[k]=q; if(q>w.b[k])w.b[k]=q; } return w; },{L:[],a:[1e9,1e9,1e9],b:[-1e9,-1e9,-1e9]})];
      for(const {L,a,b} of W){ if(Math.max(b[0]-a[0],b[1]-a[1],b[2]-a[2])>5*T)continue; const it=mk(o,'m',a,b,{parts:L.map(q=>q.p),hang:HANG.test(o.name)}); it.m=Math.max(.2,Math.min(d===120?20:400,d*vol(it)/M1**3)); N.push(it); } }
    if(N.length){ items.push(...N); fin(N); } };
  const fin=N=>{ for(const it of N){ it.t={x:it.c[0],y:it.c[1],z:it.c[2]}; it.heavy=it.m>CARRY; }
    const S=items.slice().sort((p,q)=>p.a[0]-q.a[0]), nw=new Set(N);
    for(let i=0;i<S.length;i++)for(let j=i+1;j<S.length&&S[j].a[0]<S[i].b[0];j++)if((nw.has(S[i])||nw.has(S[j]))&&ov(S[i],S[j],.01*T)){ (S[i].ov||(S[i].ov=new Set())).add(S[j]); (S[j].ov||(S[j].ov=new Set())).add(S[i]); }
    const M=N.filter(it=>it.k!=='v'), claim=(r,f)=>{ if(owned.has(r))return; const x0=r[0], z0=r[1], x1=f?r[3]:r[2], z1=f?r[4]:r[3], cx=(x0+x1)/2, cz=(z0+z1)/2, ar=(x1-x0)*(z1-z0), e=.15*T; let best=null, bo=0;
      for(const it of M){ if(cx<it.a[0]-e||cx>it.b[0]+e||cz<it.a[2]-e||cz>it.b[2]+e||ar>(it.b[0]-it.a[0]+2*e)*(it.b[2]-it.a[2]+2*e)||f&&(r[2]>it.b[1]+.2*T||r[5]<it.a[1]-.2*T))continue;
        const o=(Math.min(x1,it.b[0])-Math.max(x0,it.a[0]))*(Math.min(z1,it.b[2])-Math.max(z0,it.a[2])); if(o>bo){ bo=o; best=it; } }
      if(best){ best.sol.push([r,f]); owned.add(r); } };
    if(M.length){ for(const L of [SOL.up,SOL.down,...((MODS.apts&&MODS.apts.sol)||[])])for(const r of L)claim(r,false); for(const L of [FIX.up,FIX.down])for(const r of L)claim(r,true); }
    GPH.n=items.length; };
  const setSol=(it,gone,t,q)=>{ '@later'; let s=!gone&&it.heavy, f=s; if(s){ M4.makeRotationFromQuaternion(q); }
    const e=M4.elements, ex=(Math.abs(e[0])*it.h[0]+Math.abs(e[4])*it.h[1]+Math.abs(e[8])*it.h[2])*.92, ey=Math.abs(e[1])*it.h[0]+Math.abs(e[5])*it.h[1]+Math.abs(e[9])*it.h[2], ez=(Math.abs(e[2])*it.h[0]+Math.abs(e[6])*it.h[1]+Math.abs(e[10])*it.h[2])*.92;
    for(const [r,isF] of it.sol){ if(isF?f:s){ if(isF){ f=false; r[0]=t.x-ex; r[1]=t.z-ez; r[2]=t.y-ey; r[3]=t.x+ex; r[4]=t.z+ez; r[5]=t.y+ey; } else { s=false; r[0]=t.x-ex; r[1]=t.z-ez; r[2]=t.x+ex; r[3]=t.z+ez; } } else r.fill(1e9); } };
  const hullOf=it=>{ '@later'; if(it.hull!==undefined)return it.hull; const L=[], c=it.c, pt=(x,y,z)=>L.push(x-c[0],y-c[1],z-c[2]);
    if(it.k==='v'){ const n=it.v1-it.v0, s=Math.max(1,Math.floor(n/200)); for(let v=it.v0;v<it.v1;v+=s)pt(P0[v*3],P0[v*3+1],P0[v*3+2]); }
    else if(it.k==='m'&&!it.dm){ const s=Math.max(1,Math.floor(it.parts.length/40)); for(let i=0;i<it.parts.length;i+=s){ const p=it.parts[i], A=p.me.geometry.attributes.position.array; for(let v=p.v0;v<p.v0+6;v++)pt(A[v*3],A[v*3+1],A[v*3+2]); } }
    else if(it.k==='o'){ it.obj.updateMatrixWorld(true); it.obj.traverse(q=>{ if(!q.isMesh||q.userData.soft)return; const A=q.geometry.attributes.position, s=Math.max(1,Math.floor(A.count/120)); for(let v=0;v<A.count;v+=s){ V.fromBufferAttribute(A,v).applyMatrix4(q.matrixWorld); pt(V.x,V.y,V.z); } }); }
    return it.hull=L.length>=12?new Float32Array(L):null; };
  const shapeOf=it=>{ '@later'; const h=it.h.map(v=>v*.97), s=PHYS.lv('shape');
    if(s>=2&&it.k!=='i'){ const P=hullOf(it), d=P&&R.ColliderDesc.convexHull(P); if(d)return d; }
    if(s>=1){ const r=Math.min(h[0],h[2]); if(it.k==='i'||ROUND.test(it.name)&&Math.abs(h[0]-h[2])<.35*Math.max(h[0],h[2]))return R.ColliderDesc.roundCylinder(Math.max(.01,h[1]-r*.12),r*.88,r*.12);
      const b=Math.min(h[0],h[1],h[2])*.18; return R.ColliderDesc.roundCuboid(h[0]-b,h[1]-b,h[2]-b,b); }
    return R.ColliderDesc.cuboid(h[0],h[1],h[2]); };
  const on=it=>{ '@later'; const t=it.t, rb=world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(t.x,t.y,t.z).setRotation(it.q).setCanSleep(true).setSleeping(true).setLinearDamping(.15).setAngularDamping(.3).setCcdEnabled(it.m<8));
    const cd=shapeOf(it).setMass(it.m).setFriction(it.heavy?.5:.6).setRestitution(.1).setCollisionGroups(GI);
    if(PHYS.on('impact'))cd.setActiveEvents(R.ActiveEvents.CONTACT_FORCE_EVENTS|R.ActiveEvents.COLLISION_EVENTS).setContactForceEventThreshold(it.m*13*3); else cd.setActiveEvents(R.ActiveEvents.COLLISION_EVENTS);
    if(it.ov&&hooks)cd.setActiveHooks(R.ActiveHooks.FILTER_CONTACT_PAIRS); const co=world.createCollider(cd,rb); byC.set(co.handle,it); it.rb=rb;
    if(it.hang){ const k=PHYS.lv('joints'); rb.setAngularDamping(2.6-k*.22); rb.setLinearDamping(1.2-k*.1); world.createImpulseJoint(R.JointData.spherical({x:0,y:it.h[1],z:0},{x:it.c[0],y:it.b[1],z:it.c[2]}),rb,fb,true); } byB.set(rb.handle,it); act.add(it); if(!it.heavy||it.hang)setSol(it,true);
    if(it.k==='m'&&it.rest===undefined&&!it.hang){ const g=SHARED.groundY(it.c[0],it.c[2]); it.rest=isFinite(g)&&it.a[1]>g+.08*T&&!items.some(p=>p!==it&&p.b[1]<=it.a[1]+.02*T&&p.b[1]>it.a[1]-.1*T&&p.a[0]<it.b[0]&&it.a[0]<p.b[0]&&p.a[2]<it.b[2]&&it.a[2]<p.b[2]); } };
  const off=it=>{ const rb=it.rb; for(let i=0;i<rb.numColliders();i++)byC.delete(rb.collider(i).handle); const t=rb.translation(), r=rb.rotation(); it.t={x:t.x,y:t.y,z:t.z}; it.q={x:r.x,y:r.y,z:r.z,w:r.w}; byB.delete(rb.handle); world.removeRigidBody(rb); it.rb=null; act.delete(it); };
  const statics=()=>{ '@later'; const W=new Map(), px=pos.x, pz=pos.z, Rr=RF+T, k=SHARED.LVL+Math.round(SHARED.py/(1.5*T)), X=SHARED.BOD.X, Y=SHARED.BOD.Y, Z=SHARED.BOD.Z;
    if(k!==lk){ for(const s of stat.values())for(const c of s.cs)world.removeCollider(c,false); stat.clear(); lk=k; }
    const far=(x0,z0,x1,z1)=>Math.hypot(Math.max(x0-px,0,px-x1),Math.max(z0-pz,0,pz-z1))>Rr;
    const add=(key,b,free)=>{ if(stat.has(key)){ W.set(key,b); return; } if(b[3]-b[0]<1e-3||b[4]-b[1]<1e-3||b[5]-b[2]<1e-3)return; if(!free){ let ok=SKIP.get(key); if(ok===undefined){ const p={a:b,b:[b[3],b[4],b[5]]}; ok=!items.some(it=>ov(p,it,.004)); SKIP.set(key,ok); } if(!ok)return; } W.set(key,b); };
    if(SHARED.fixed!==fxL){ fxL=SHARED.fixed; FXR.clear(); fxM=new Map(SHARED.fixed.map(f=>[[f[0],f[1],f[3],f[4]].map(v=>v.toFixed(2)).join(),f])); }
    const used=new Set();
    for(const r of SHARED.solids){ if(owned.has(r)||far(r[0],r[1],r[2],r[3]))continue; let f=FXR.get(r); if(f===undefined)FXR.set(r,f=fxM.get(r.map(v=>v.toFixed(2)).join())||null); if(f)used.add(f); add(r,f?[r[0],f[2],r[1],r[2],f[5],r[3]]:[r[0],SHARED.py-.5*T,r[1],r[2],SHARED.py+3*T,r[3]]); }
    for(const f of SHARED.fixed){ if(used.has(f)||owned.has(f)||far(f[0],f[1],f[3],f[4]))continue; add(f,[f[0],f[2],f[1],f[3],f[5],f[4]]); }
    if(near()){ for(const p of Object.values(SHARED.BOD.O||{})){ if(cls(p.name||''))continue; for(const b of p.boxes||[]){ if(b.nb||!(b.z1>b.z0))continue; const q=[X(b.x0),Y(b.z0),Z(b.y0),X(b.x1),Y(b.z1),Z(b.y1)]; add(b,[Math.min(q[0],q[3]),Math.min(q[1],q[4]),Math.min(q[2],q[5]),Math.max(q[0],q[3]),Math.max(q[1],q[4]),Math.max(q[2],q[5])]); } }
      for(const w of SHARED.BOD.WALLS||[]){ let a=w.a0, n=0; const ds=w.holes.filter(h=>h.door).sort((p,q)=>p.a0-q.a0);
        const seg=(a0,a1)=>{ if(a1-a0<.01)return; const q=w.ax==='x'?[X(a0),Y(0),Z(w.at-.1),X(a1),Y(w.H),Z(w.at+.1)]:[X(w.at-.1),Y(0),Z(a0),X(w.at+.1),Y(w.H),Z(a1)]; add(w.id+':'+n++,[Math.min(q[0],q[3]),Math.min(q[1],q[4]),Math.min(q[2],q[5]),Math.max(q[0],q[3]),Math.max(q[1],q[4]),Math.max(q[2],q[5])]); };
        for(const d of ds){ seg(a,d.a0); a=d.a1; } seg(a,w.a1); } }
    const B4=4*T; for(let i=Math.floor((px-Rr)/B4);i<=Math.floor((px+Rr)/B4);i++)for(let j=Math.floor((pz-Rr)/B4);j<=Math.floor((pz+Rr)/B4);j++){ const key='g'+i+':'+j; if(far(i*B4,j*B4,(i+1)*B4,(j+1)*B4))continue; if(stat.has(key)){ W.set(key,stat.get(key).b); continue; }
      const L=[]; for(let u=0;u<4;u++)for(let v=0;v<4;v++){ const x=(i*4+u)*T, z=(j*4+v)*T, g=SHARED.groundY(x+T/2,z+T/2); if(isFinite(g)&&Math.abs(g-SHARED.py)<3*T)L.push([x,g-.5*T,z,x+T,g,z+T]); }
      if(L.length===16&&L.every(q=>Math.abs(q[4]-L[0][4])<.01*T))W.set(key,[[i*B4,L[0][1],j*B4,(i+1)*B4,L[0][4],(j+1)*B4]]); else if(L.length)W.set(key,L); }
    for(const it of act)if(it.rest)add(it,[it.a[0],it.a[1]-.06*T,it.a[2],it.b[0],it.a[1],it.b[2]],true);
    for(const [key,s] of stat)if(!W.has(key)){ for(const c of s.cs)world.removeCollider(c,false); stat.delete(key); }
    for(const [key,b] of W)if(!stat.has(key))stat.set(key,{b,cs:(Array.isArray(b[0])?b:[b]).map(q=>world.createCollider(R.ColliderDesc.cuboid((q[3]-q[0])/2,(q[4]-q[1])/2,(q[5]-q[2])/2).setTranslation((q[0]+q[3])/2,(q[1]+q[4])/2,(q[2]+q[5])/2).setFriction(.8).setCollisionGroups(G0),fb))}); };
  const pickList=(A=act)=>{ const S=new Set(); for(const it of A){ if(it.k==='v')S.add(gm); else if(it.k==='i')for(const q of it.inst)S.add(q[0]); else if(it.k==='o')it.obj.traverse(c=>{ if(c.isMesh)S.add(c); }); else for(const p of it.parts)S.add(p.me); } picks=[...S]; };
  const zone=()=>{ '@later'; if(++zn%40===0)LIGHTS=null; if(!cg||!cc)catalog(); more(); const lo=SHARED.py-1.1*T, hi=SHARED.py+2.4*T;
    for(const it of items){ const t=it.rb?it.rb.translation():it.t, d=Math.hypot(t.x-pos.x,t.z-pos.z), b=t.y-it.h[1], inL=b>lo&&b<hi;
      if(!it.rb){ if(d<RS&&inL&&!(it.hang&&!PHYS.on('joints')))on(it); } else if(it!==held&&(d>RF||!inL)&&it.rb.isSleeping())off(it); }
    statics(); pickList(); };
  function build(){ '@later'; R=PB.R; world=new R.World({x:0,y:-13,z:0}); world.timestep=DT; fb=world.createRigidBody(R.RigidBodyDesc.fixed()); eq=new R.EventQueue(true);
    if(R.ActiveHooks&&R.SolverFlags)hooks={filterContactPair:(c1,c2,b1,b2)=>{ const p=byB.get(b1), q=byB.get(b2); return p&&q&&p.ov&&p.ov.has(q)?R.SolverFlags.EMPTY:R.SolverFlags.COMPUTE_IMPULSE; },filterIntersectionPair:()=>true};
    you=world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(pos.x,SHARED.py+.8,pos.z).lockRotations().setGravityScale(0).setCanSleep(false));
    world.createCollider(R.ColliderDesc.capsule(.45,.38).setDensity(80/(Math.PI*.38*.38*.9+4/3*Math.PI*.38**3)).setFriction(.3).setCollisionGroups(GY),you);
    catalog(); ready=GPH.ready=true; }
  const SB=new THREE.Sphere(), draw=it=>{ '@later'; const t=it.rb.translation(), r=it.rb.rotation(); Q.set(r.x,r.y,r.z,r.w); it.moved=true; if(it.o)it.o.seat=null;
    if(it.k==='v'){ const pa=gm.geometry.attributes.position, na=gm.geometry.attributes.normal, A=pa.array, NA=na.array;
      for(let v=it.v0;v<it.v1;v++){ const o=v*3; V.set(P0[o]-it.c[0],P0[o+1]-it.c[1],P0[o+2]-it.c[2]).applyQuaternion(Q); A[o]=V.x+t.x; A[o+1]=V.y+t.y; A[o+2]=V.z+t.z; V.set(N0[o],N0[o+1],N0[o+2]).applyQuaternion(Q); NA[o]=V.x; NA[o+1]=V.y; NA[o+2]=V.z; }
      pa.addUpdateRange(it.v0*3,(it.v1-it.v0)*3); na.addUpdateRange(it.v0*3,(it.v1-it.v0)*3); pa.needsUpdate=na.needsUpdate=true; if(gm.geometry.boundingSphere)gm.geometry.boundingSphere.union(SB.set(V.set(t.x,t.y,t.z),Math.hypot(it.b[0]-it.a[0],it.b[1]-it.a[1],it.b[2]-it.a[2]))); }
    else if(it.k==='i'){ M4.compose(V.set(t.x,t.y,t.z),Q,S1); for(const [me,i,L] of it.inst){ me.setMatrixAt(i,M5.multiplyMatrices(M4,L)); me.instanceMatrix.needsUpdate=true; } }
    else if(it.k==='o'){ const o=it.obj; o.quaternion.copy(Q).multiply(it.q0); o.position.copy(it.off).applyQuaternion(Q).add(V.set(t.x,t.y,t.z)); }
    else { if(!it.dm)detach(it); for(const D of it.dm){ const g=D.me.geometry, pa=g.attributes.position, na=g.attributes.normal, A=pa.array, NA=na.array;
        for(let o=0;o<A.length;o+=3){ V.set(D.B[o],D.B[o+1],D.B[o+2]).applyQuaternion(Q); A[o]=V.x+t.x; A[o+1]=V.y+t.y; A[o+2]=V.z+t.z; V.set(D.N[o],D.N[o+1],D.N[o+2]).applyQuaternion(Q); NA[o]=V.x; NA[o+1]=V.y; NA[o+2]=V.z; }
        pa.needsUpdate=na.needsUpdate=true; g.computeBoundingSphere(); } }
    if(it.heavy&&it.sol.length)setSol(it,false,t,Q); };
  const detach=it=>{ '@later'; const by=new Map(); for(const p of it.parts)(by.get(p.me)||by.set(p.me,[]).get(p.me)).push(p);
    it.dm=[...by].map(([src,L])=>{ const g=src.geometry, G=new THREE.BufferGeometry(), n=L.length*6;
      for(const k in g.attributes){ const A=g.attributes[k], s=A.itemSize, d=new A.array.constructor(n*s); L.forEach((p,j)=>d.set(A.array.subarray(p.v0*s,(p.v0+6)*s),j*6*s)); G.setAttribute(k,new THREE.BufferAttribute(d,s,A.normalized)); }
      const P=g.attributes.position.array; for(const p of L){ const o=p.v0*3; for(let v=3;v<18;v++)P[o+v]=P[o+v%3]; } g.attributes.position.needsUpdate=true; BVH.refit(g);
      const me=new THREE.Mesh(G,src.material); me.castShadow=src.castShadow; me.receiveShadow=src.receiveShadow; me.renderOrder=src.renderOrder; me.userData={objOf:L.map(()=>it.o),split:true,chunked:true,loose:it}; src.add(me);
      L.forEach((p,j)=>{ p.me=me; p.v0=j*6; }); const B=G.attributes.position.array.slice(); for(let i=0;i<B.length;i++)B[i]-=it.c[i%3]; return {me,B,N:G.attributes.normal.array.slice()}; });
    PERFX.gen++; pickList(); };
  const reshade=()=>{ if(!LIGHTS){ LIGHTS=[]; scene.traverse(L=>{ if(L.isLight&&L.castShadow&&L.shadow)LIGHTS.push(L); }); } for(const L of LIGHTS)if(L.shadow.autoUpdate===false&&Math.hypot(L.position.x-pos.x,L.position.z-pos.z)<RS)L.shadow.needsUpdate=true; };
  const hand=()=>({x:pos.x+Math.sin(SHARED.heading)*.42*T+Math.cos(SHARED.heading)*-.12*T,y:SHARED.py+1.0*T*(W3.SZ?W3.SZ:1),z:pos.z+Math.cos(SHARED.heading)*.42*T-Math.sin(SHARED.heading)*-.12*T});
  const holdAt=it=>{ const h=hand(), r=Math.max(it.h[0],it.h[2]); return {x:h.x+Math.sin(SHARED.heading)*r,y:Math.max(h.y,SHARED.py+it.h[1]+.05*T),z:h.z+Math.cos(SHARED.heading)*r}; };
  const intent=()=>{ if(USE.seat||ED.on||UI.freeCam)return [0,0]; let mx=0, mz=0; const fx=-Math.sin(SHARED.yaw), fz=-Math.cos(SHARED.yaw), k=s=>keys.has(s);
    if(k('w')||k('arrowup')){ mx+=fx; mz+=fz; } if(k('s')||k('arrowdown')){ mx-=fx; mz-=fz; } if(k('d')||k('arrowright')){ mx-=fz; mz+=fx; } if(k('a')||k('arrowleft')){ mx+=fz; mz-=fx; }
    if(!mx&&!mz&&SHARED.target){ mx=SHARED.target.x-pos.x; mz=SHARED.target.z-pos.z; } const l=Math.hypot(mx,mz); return l>1e-6?[mx/l,mz/l]:[0,0]; };
  const drive=(I,h)=>{ '@later'; const tx=pos.x+I[0]*.14*T, ty=SHARED.py+.8, tz=pos.z+I[1]*.14*T, p=you.translation();
    if(Math.hypot(tx-p.x,tz-p.z)+Math.abs(ty-p.y)>.6*T){ you.setTranslation({x:tx,y:ty,z:tz},true); you.setLinvel({x:0,y:0,z:0},true); return; }
    const v=you.linvel(), m=you.mass(), J=[((tx-p.x)/h*.5-v.x)*m,((ty-p.y)/h*.5-v.y)*m,((tz-p.z)/h*.5-v.z)*m], l=Math.hypot(...J), c=Math.min(1,(I[0]||I[1]?700:120)*h/(l||1)); you.applyImpulse({x:J[0]*c,y:J[1]*c,z:J[2]*c},true); };
  const STRIKE=/jab|cross|upper|hook|slap|punch|kick|sweep|round/i;
  const strike=()=>{ '@later'; const s=(st.up&&STRIKE.test(st.up.name)&&st.up)||(st.move&&STRIKE.test(st.move.name)&&st.move); if(!s||s===lastHit||s.t<.08)return; lastHit=s;
    const kick=/kick|sweep|round/i.test(s.name);
    if(PHYS.on('rays')){ const fx=Math.sin(SHARED.heading), fz=Math.cos(SHARED.heading), y=SHARED.py+(kick?.45:1.05)*T, rr=.22*T, reach=1.1*T, from={x:pos.x+fx*.2*T,y,z:pos.z+fz*.2*T};
      const hit=world.castShape(from,{x:0,y:0,z:0,w:1},{x:fx*reach,y:0,z:fz*reach},new R.Ball(rr),0,1,true,undefined,undefined,you.collider(0),held?held.rb:undefined), it=hit&&byC.get(hit.collider.handle);
      if(it&&it.rb){ const k=(kick?5.5:3.8)*Math.min(it.m,25), w=hit.witness1, p=it.rb.translation(), at=w?{x:w.x,y:w.y,z:w.z}:p; it.rb.wakeUp(); it.rb.applyImpulseAtPoint({x:fx*k,y:k*.35,z:fz*k},at,true); } return; }
    const inB=(x,z)=>{ const B=SHARED.BOD.SB; return x>SHARED.BOD.X(B.x0)&&x<SHARED.BOD.X(B.x1)&&z>SHARED.BOD.Z(B.y0)&&z<SHARED.BOD.Z(B.y1); }, me0=inB(pos.x,pos.z), fx=Math.sin(SHARED.heading), fz=Math.cos(SHARED.heading), hy=SHARED.py+(kick?.45:1.05)*T;
    for(const it of act){ if(it===held)continue; const p=it.rb.translation(), dx=p.x-pos.x, dz=p.z-pos.z, d=Math.hypot(dx,dz)-Math.max(it.h[0],it.h[2]), f=(dx*fx+dz*fz)/(Math.hypot(dx,dz)||1);
      if(d<1.1*T&&f>.35&&Math.abs(p.y-hy)<.7*T+it.h[1]&&(it.k!=='v'||inB(p.x,p.z)===me0)){ const k=(kick?5.5:3.8)*Math.min(it.m,25), j=k*.02*Math.max(1,it.h[1]/(.15*T));
        it.rb.wakeUp(); it.rb.applyImpulse({x:fx*k,y:k*.35,z:fz*k},true); it.rb.applyTorqueImpulse({x:(Math.random()-.5)*j,y:(Math.random()-.5)*j,z:(Math.random()-.5)*j},true); } } };
  const grab=it=>{ if(held||!it.rb)return; held=it; it.rb.setBodyType(R.RigidBodyType.KinematicPositionBased,true); it.rb.collider(0).setCollisionGroups(GH); RIG.act(st,'carry'); };
  const throwTo=(it,g)=>{ '@later'; held=null; it.thrown=performance.now(); RIG.release(st,'carry'); MOTION.play('throw'); it.rb.setBodyType(R.RigidBodyType.Dynamic,true); it.rb.collider(0).setCollisionGroups(GI); const h=hand(), dx=g.x-h.x, dz=g.z-h.z, d=Math.max(.5,Math.hypot(dx,dz)), sp=Math.min(9,3+d*.9)*Math.min(1,Math.sqrt(8/Math.max(8,it.m)));
    it.rb.setLinvel({x:dx/d*sp,y:2.6+d*.25,z:dz/d*sp},true); it.rb.setAngvel({x:(Math.random()-.5)*6,y:(Math.random()-.5)*6,z:(Math.random()-.5)*6},true); };
  const putAt=(it,g)=>{ '@later'; held=null; RIG.release(st,'carry'); it.rb.setBodyType(R.RigidBodyType.Dynamic,true); it.rb.collider(0).setCollisionGroups(GI);
    it.rb.setTranslation({x:g.x,y:g.y+it.h[1]+.02*T,z:g.z},true); it.rb.setRotation({x:0,y:Math.sin(SHARED.heading/2),z:0,w:Math.cos(SHARED.heading/2)},true); it.rb.setLinvel({x:0,y:0,z:0},true); it.rb.setAngvel({x:0,y:0,z:0},true); };
  const wake=()=>{ if((pt-=1)>0)return false; pt=6; catalog(); more(); const lo=SHARED.py-1.1*T, hi=SHARED.py+2.4*T; pre.clear();
      for(const it of items){ const t=it.t, b=t.y-it.h[1]; if(Math.hypot(t.x-pos.x,t.z-pos.z)<RS&&b>lo&&b<hi)pre.add(it); } pickList(pre); return true; };
  const asks=()=>{ if(want)return true; const s=(st.up&&STRIKE.test(st.up.name))||(st.move&&STRIKE.test(st.move.name)), I=intent(), mv=I[0]||I[1];
    if(!s&&!mv)return false; for(const it of pre){ const t=it.t, d=Math.hypot(Math.max(it.a[0]-pos.x,0,pos.x-it.b[0]),Math.max(it.a[2]-pos.z,0,pos.z-it.b[2])); if(s?d<1.1*T:!it.heavy&&d<.6*T&&(t.x-pos.x)*I[0]+(t.z-pos.z)*I[1]>0)return true; } return false; };
  const burning=new Map(), BURN=4;
  const hideMesh=it=>{ '@later'; try{ if(it.k==='o'){ it.obj.visible=false; return; } if(it.k==='v'&&gm){ const A=gm.geometry.attributes.position.array; for(let vx=it.v0;vx<it.v1;vx++){ A[vx*3]=it.c[0]; A[vx*3+1]=it.c[1]-60*T; A[vx*3+2]=it.c[2]; } gm.geometry.attributes.position.needsUpdate=true; } else if(it.k==='i'&&it.inst){ const Z=new THREE.Matrix4().makeScale(0,0,0); for(const z of it.inst){ z[0].setMatrixAt(z[1],Z); z[0].instanceMatrix.needsUpdate=true; } } else if(it.parts){ for(const p of it.parts)if(p.me)p.me.visible=false; } }catch(e){} };
  GPH.burn=it=>{ if(it&&!it.gone&&!burning.has(it))burning.set(it,0); };
  GPH.tick=dt=>{ if(!ready){ if(PB.R)build(); else if(!PB.loading){ wake(); if(asks()||QS.get('physics'))PB.load(); } return; } const t0=performance.now();
    if(burning.size)for(const [it,t] of burning){ const nt=t+dt; if(nt>=BURN){ burning.delete(it); it.gone=1; if(it.rb)try{ off(it); }catch(e){} hideMesh(it); } else burning.set(it,nt); }
    if((zt-=dt)<=0){ zt=.25; zone(); } strike(); if(want&&want.rb){ grab(want); want=null; }
    if(held){ const h=holdAt(held); held.rb.setNextKinematicTranslation(h); held.rb.setNextKinematicRotation({x:0,y:Math.sin(SHARED.heading/2),z:0,w:Math.cos(SHARED.heading/2)}); }
    const I=intent(), mv=I[0]||I[1]||Math.abs(pos.x-lx)+Math.abs(pos.z-lz)+Math.abs(SHARED.py-ly)>1e-4; lx=pos.x; lz=pos.z; ly=SHARED.py;
    gust(dt); ctl(dt); crowd();
    const ext=GPH.ext.some(f=>f());
    if(mv||held||live||ext||cbMove){ acc=Math.min(acc+dt,3*DT); while(acc>=DT){ drive(I,DT); for(const f of GPH.pre)f(DT); world.step(eq,hooks||undefined); for(const f of GPH.post)f(DT); acc-=DT; } } else acc=0;
    events();
    live=0; for(const it of act){ if(it!==held&&it.rb.isSleeping())continue; draw(it); if(it===held)continue; live++;
      const p=it.rb.translation(); if(p.y<SHARED.py-8*T){ it.rb.setTranslation({x:it.c[0],y:it.c[1],z:it.c[2]},true); it.rb.setRotation({x:0,y:0,z:0,w:1},true); it.rb.setLinvel({x:0,y:0,z:0},true); it.rb.setAngvel({x:0,y:0,z:0},true); draw(it); it.rb.sleep(); continue; }
      const v=it.rb.linvel(), w=it.rb.angvel(); if(v.x*v.x+v.y*v.y+v.z*v.z<.0225&&w.x*w.x+w.y*w.y+w.z*w.z<.16){ if((it.still+=dt)>.33){ it.rb.sleep(); it.still=0; shade=0; } } else it.still=0; }
    if((live||shade===0)&&(shade-=dt)<=0){ shade=.25; reshade(); }
    GPH.ms=GPH.ms*.95+(performance.now()-t0)*.05; };
  // knocks: how hard a thing hit (its force over its weight); loud ones sound, a breakable one breaks past what IMPACTS allows, a fast one into you hurts
  const events=()=>{ '@later'; const lv=PHYS.lv('impact'), now=performance.now();
    eq.drainContactForceEvents(e=>{ if(!lv)return; const a=byC.get(e.collider1()), b=byC.get(e.collider2()), f=e.totalForceMagnitude();
      for(const it of [a,b]){ if(!it||!it.rb||it===held||it.gone)continue; const g=f/(it.m*13), p=it.rb.translation(); if((hit0.get(it)||0)>now)continue; hit0.set(it,now+150);
        if(BRK.test(it.name)&&!it.heavy&&g>260/lv){ GPH.smash(it); continue; }
        if(g>6)SFX.play&&SFX.play('clunk',{vol:Math.min(1,g/60)*.6,pitch:1.7-Math.min(1,it.m/20),vary:.2,at:p}); } });
    eq.drainCollisionEvents((h1,h2,on)=>{ for(const f of GPH.coll)f(h1,h2,on);
      if(!on||!lv)return; const yc=you&&you.collider(0).handle, it=h1===yc?byC.get(h2):h2===yc?byC.get(h1):null; if(!it||!it.rb||it===held||performance.now()-(it.thrown||0)<800)return;
      const v=it.rb.linvel(), sp=Math.hypot(v.x,v.y,v.z); if(sp>4&&VIT.hurt)VIT.hurt(Math.min(.15,(sp-4)*it.m*.0015*lv/5)); }); };
  GPH.bin=it=>{ it.gone=1; const p=it.rb?it.rb.translation():it.t; if(SFX.play)SFX.play('clunk',{vol:.5,pitch:.8,at:p}); if(it.rb)off(it); hideMesh(it); };
  GPH.smash=it=>{ it.gone=1; const p=it.rb?it.rb.translation():it.t; if(SFX.play){ SFX.play('click',{vol:.8,pitch:2.4,vary:.3,at:p}); SFX.play('clunk',{vol:.4,pitch:1.9,at:p}); } if(it.rb)off(it); hideMesh(it); };
  // what the other physics extras use: the engine, the world, the fixed body, a body's loose thing, and hooks into each step (pre/post), its events (coll) and whether to keep stepping (ext)
  Object.assign(GPH,{pre:[],post:[],coll:[],ext:[],phys:()=>ready?{R,world,fb,you}:null,ofCollider:h=>byC.get(h),active:()=>act,heldNow:()=>held});
  // hanging things on a joint at their top: wind and bumps swing them, SWAYING THINGS sets how freely
  let gt=0; const gust=dt=>{ '@later'; const k=PHYS.lv('joints'); if(!k||(gt-=dt)>0)return; gt=1.5+Math.random()*3; const w=(window.WX&&WX.now&&WX.now.wind)||.2, out=!(ROOMS&&ROOMS.cur);
    for(const it of act)if(it.hang&&it!==held){ const j=it.m*(out?w*1.4:.08)*k*.05*(.5+Math.random()); it.rb.wakeUp(); it.rb.applyImpulse({x:(Math.random()-.5)*j,y:0,z:(Math.random()-.5)*j},true); } };
  // standing on things: Rapier's character controller as your body here; it steps up onto low loose things (STAND ON THINGS: how high), stands on them, and shoves the rest
  const CH=.45, CR=.38, HH=CH+CR+.01; let kcc=null, kb=null, kco=null, kfoot=null;
  const ctl=dt=>{ '@later'; const lv=PHYS.lv('ctrl'), skip=!lv||RIDE.on||UI.fly||ED.on; if(skip){ if(kco&&kco.isEnabled()){ kco.setEnabled(false); you.collider(0).setEnabled(true); } kfoot=null; return; }
    if(!kcc){ kcc=world.createCharacterController(.01*T); kcc.setApplyImpulsesToDynamicBodies(true); kcc.setCharacterMass(80); kcc.enableSnapToGround(.25*T); kcc.setSlideEnabled(true); kcc.setMaxSlopeClimbAngle(.9);
      kb=world.createRigidBody(R.RigidBodyDesc.kinematicPositionBased().setTranslation(pos.x,SHARED.py+HH,pos.z)); kco=world.createCollider(R.ColliderDesc.capsule(CH,CR).setCollisionGroups(0x00020005),kb); }
    if(!kco.isEnabled()){ kco.setEnabled(true); kb.setTranslation({x:pos.x,y:SHARED.py+HH,z:pos.z},true); } you.collider(0).setEnabled(false); kcc.enableAutostep(lv*.05*M1,.08*M1,true);
    const p=kb.translation(), g=SHARED.groundY(pos.x,pos.z), dx=pos.x-p.x, dz=pos.z-p.z;
    if(Math.hypot(dx,dz)>.6*T||!isFinite(g)||p.y<g+HH-.5*T){ kb.setTranslation({x:pos.x,y:(isFinite(g)?g:SHARED.py)+HH,z:pos.z},true); kfoot=null; return; }
    const ex=held&&held.rb?held.rb:undefined; kcc.computeColliderMovement(kco,{x:dx,y:Math.max(g+HH-p.y,-9*T*dt),z:dz},R.QueryFilterFlags.EXCLUDE_SENSORS,0x00030005,c=>{ const q=byC.get(c.handle); return !q||q.rb!==ex; });
    const m=kcc.computedMovement(), n={x:p.x+m.x,y:p.y+m.y,z:p.z+m.z}; let onIt=false; for(let i=0;i<kcc.numComputedCollisions();i++){ const c=kcc.computedCollision(i); if(c&&c.collider&&byC.get(c.collider.handle))onIt=true; }
    if(onIt&&Math.hypot(n.x-pos.x,n.z-pos.z)>.005*T){ pos.x=n.x; pos.z=n.z; } else { n.x=pos.x; n.z=pos.z; }
    kb.setTranslation(n,true); const f=n.y-HH; kfoot=f>g+.03*T&&f<g+1.3*T?f:null; };
  GPH.floor=g=>kfoot!=null&&kfoot>g?kfoot:g;
  // the characters near you in the physics (8 Nov 2026): each a moving body its own size (a capsule, a long animal a box along its heading), so loose things are shoved by and stop at people, animals and the other players
  const CB=new Map(), CBN=24; let cbMove=false;
  const crowd=()=>{ '@later'; const L=[], lv=SHARED.LVL, R2=RS*RS, put=(k,x,y,z,r,l,lz,h)=>{ const dx=x-pos.x, dz=z-pos.z, d=dx*dx+dz*dz; if(d<R2&&isFinite(y))L.push({k,x,y,z,r,l,lz,h,d}); };
    for(const N of NPCS){ const s=N.st; if(!s||N.far||N.fly||N.tiny||N.lv!==lv||N.mode==='hidden'||s.inT!=null||!N.g||!N.g.visible&&!N._cv)continue; put(N,s.x,N.g.position.y,s.z,s.R,s.L||0,s.LZ||0,s.h||0); }
    for(const X of NPCS.extra||[]){ const s=X.st; if(!s||X.on===false||X.mode==='hidden'||X.rag||!X.g||!X.g.visible&&!X._cv||(X.lv||'up')!==lv)continue; put(X,s.x,SHARED.groundY(s.x,s.z),s.z,s.R||.3,0,0,0); }
    if(ONLINE.others)for(const o of ONLINE.others.values()){ if(o.why!=='near you'||!o.p||o.dead)continue; put(o,o.p.x,SHARED.groundY(o.p.x,o.p.z),o.p.z,.3,0,0,0); }
    L.sort((a,b)=>a.d-b.d); if(L.length>CBN)L.length=CBN; const keep=new Set(); cbMove=false;
    for(const c of L){ keep.add(c.k); const tall=Math.max(.4*T,Math.min(4*T,c.k.tall||1.7*M1)), hh=tall/2, r=Math.max(.05*T,Math.min(2*T,c.r)); let B=CB.get(c.k);
      const q={x:0,y:Math.sin(c.h/2),z:0,w:Math.cos(c.h/2)}, at={x:c.x,y:c.y+hh,z:c.z};
      if(!B){ const rb=world.createRigidBody(R.RigidBodyDesc.kinematicPositionBased().setTranslation(at.x,at.y,at.z).setRotation(q)); const cd=c.l?R.ColliderDesc.cuboid(r,hh,r+c.l).setTranslation(0,0,c.lz):R.ColliderDesc.capsule(Math.max(.01,hh-r),r);
        world.createCollider(cd.setFriction(.4).setCollisionGroups(GY),rb); CB.set(c.k,B={rb,x:c.x,z:c.z}); continue; }
      const mvd=Math.hypot(c.x-B.x,c.z-B.z); if(mvd>T){ B.rb.setTranslation(at,true); B.rb.setRotation(q,true); } else if(mvd>1e-4){ B.rb.setNextKinematicTranslation(at); B.rb.setNextKinematicRotation(q);
        if(!cbMove)for(const it of act){ const p=it.rb.translation(); if(Math.hypot(p.x-c.x,p.z-c.z)<r+c.l+Math.max(it.h[0],it.h[2])+.3*T){ cbMove=true; break; } } } B.x=c.x; B.z=c.z; }
    for(const [k,B] of CB)if(!keep.has(k)){ world.removeRigidBody(B.rb); CB.delete(k); } };
  GPH.crowd=()=>[...CB.keys()].map(k=>k.key||k.name||'player');
  const at=it=>it.rb?it.rb.translation():it.t;
  const itemOf=(h,A=act)=>{ '@later'; const m=h.object; if(m===gm){ const v=h.face.a; return items.find(q=>q.k==='v'&&v>=q.v0&&v<q.v1); } if(m.userData.loose)return m.userData.loose;
    if(h.instanceId!=null)return [...A].find(q=>q.k==='i'&&q.inst.some(z=>z[0]===m&&z[1]===h.instanceId));
    const o=m.userData.objOf&&m.userData.objOf[Math.floor(h.faceIndex/2)]; let b=null, bd=1e9; if(o)for(const it of A){ if(it.o!==o||it.dm)continue; const t=at(it), d=Math.hypot(t.x-h.point.x,t.y-h.point.y,t.z-h.point.z); if(d<bd){ bd=d; b=it; } } return b; };
  GPH.pick=ray=>{ if(!ready){ if(!cat||held)return null; const h=ray.intersectObjects(picks,false)[0], it=h&&itemOf(h,pre); if(!it||it.m>CARRY||it.hang||it.o&&USE.test&&USE.test.kindOf(it.o)&&!keys.has('shift'))return null;
      const o=new THREE.Object3D(), r=Math.max(it.h[0],it.h[2]); o.position.set(it.t.x,it.t.y-it.h[1],it.t.z);
      return {d:h.distance,th:{name:(it.name||'').replace(/^cottage: /,'').toUpperCase(),pick:true,obj:o,reach:.85*T+r,near:1.6*T+r,tall:Math.max(.4*T,it.h[1]*2),act:()=>{ want=it; }}}; }
    if(held){ const pl=new THREE.Plane(new THREE.Vector3(0,1,0),-SHARED.py), g=new THREE.Vector3(); if(!ray.ray.intersectPlane(pl,g))return null; const it=held, o=new THREE.Object3D(); o.position.copy(g);
      return {d:0,th:{name:'PUT DOWN',obj:o,reach:.9*T+Math.max(it.h[0],it.h[2]),near:1.4*T,act:()=>putAt(it,g)}}; }
    const h=ray.intersectObjects(picks,false)[0]; if(!h)return null; const it=itemOf(h); if(!it||!it.rb||it.m>CARRY||it.hang)return null; if(it.o&&USE.test&&USE.test.kindOf(it.o)&&!keys.has('shift'))return null;
    const o=new THREE.Object3D(), p=it.rb.translation(), r=Math.max(it.h[0],it.h[2]); o.position.set(p.x,p.y-it.h[1],p.z);
    return {d:h.distance,th:{name:(it.name||'').replace(/^cottage: /,'').toUpperCase(),pick:true,obj:o,reach:.85*T+r,near:1.6*T+r,tall:Math.max(.4*T,it.h[1]*2),act:()=>grab(it)}}; };
  GPH.loose=()=>items;
  // what the inspect window shows: the thing in your hands, else the loose thing under the pointer; its look copied (shared buffers marked, never freed)
  GPH.inspectable=ray=>{ '@later'; let it=held; if(!it&&ray&&picks.length){ const h=ray.intersectObjects(picks,false)[0]; it=h&&itemOf(h,ready?act:pre); } if(!it)return null; const L=GPH.look(it);
    return {obj:L.obj,mine:L.mine,name:(it.name||'').replace(/^cottage: /,''),info:[it===held?'IN YOUR HANDS':'ON THE GROUND',Math.round((it.m||1)*10)/10+' KG']}; };
  GPH.look=it=>{ '@later';
    const sub=(g,rs,mat)=>{ const G=new THREE.BufferGeometry(); let n=0; for(const [a,b] of rs)n+=b-a; for(const k in g.attributes){ const A=g.attributes[k], s=A.itemSize, d=new A.array.constructor(n*s); let j=0; for(const [a,b] of rs){ d.set(A.array.subarray(a*s,b*s),j*s); j+=b-a; } G.setAttribute(k,new THREE.BufferAttribute(d,s,A.normalized)); } return new THREE.Mesh(G,mat); };
    let obj, mine=true;
    if(it.k==='o'){ obj=it.obj; mine=false; }
    else if(it.k==='v')obj=sub(gm.geometry,[[it.v0,it.v1]],gm.material);
    else if(it.k==='i'){ obj=new THREE.Group(); for(const [me,i] of it.inst){ const m=new THREE.InstancedMesh(me.geometry,me.material,1); me.getMatrixAt(i,M4); m.setMatrixAt(0,M4); if(me.instanceColor){ const c=new THREE.Color(); me.getColorAt(i,c); m.setColorAt(0,c); } m.userData.shared=true; obj.add(m); } }
    else if(it.dm){ obj=new THREE.Group(); for(const D of it.dm)obj.add(new THREE.Mesh(D.me.geometry.clone(),D.me.material)); }
    else { const by=new Map(); for(const p of it.parts)(by.get(p.me)||by.set(p.me,[]).get(p.me)).push([p.v0,p.v0+6]); obj=new THREE.Group(); for(const [me,rs] of by)obj.add(sub(me.geometry,rs,me.material)); }
    return {obj,mine}; };
  // a whole object (its own meshes, any shape) as a loose thing: pushed, knocked over, picked up and thrown like the rest; GPH.drop takes it out again
  GPH.add=(obj,{name,m=1}={})=>{ '@later'; obj.updateMatrixWorld(true); const B=new THREE.Box3(); obj.traverse(q=>{ if(q.isMesh&&!q.userData.soft)B.expandByObject(q,true); }); if(B.isEmpty())B.setFromObject(obj); const c=B.getCenter(new THREE.Vector3());   // soft parts (hanging leaves) stay out of the body's box
    const it=mk(null,'o',B.min.toArray(),B.max.toArray(),{name:name||obj.name||'',obj,m,q0:obj.quaternion.clone(),off:obj.position.clone().sub(c)}); obj.traverse(q=>{ if(q.isMesh)q.userData.loose=it; }); items.push(it); fin([it]); return it; };
  GPH.drop=it=>{ if(!it)return; if(it===held)held=null; if(it.rb)off(it); pre.delete(it); const i=items.indexOf(it); if(i>=0)items.splice(i,1); GPH.n=items.length; };
  GPH.init=()=>{ if(typeof USE==='undefined'){ setTimeout(GPH.init,500); return; } const p0=USE.pick; USE.pick=ray=>{ const a=p0(ray), b=GPH.pick(ray); return b&&(!a||b.d<=a.d)?b:a; };
    SYS.add('life',(dt)=>{ GPH.tick(dt); },'150-loose');
    PHYS.onchange.push(k=>{ if(!ready||(k!=='shape'&&k!=='impact'))return; for(const it of [...act])if(it!==held){ off(it); on(it); } }); };
  const nearest=f=>{ let b=null, bd=1e9; for(const it of ready?act:pre){ if(!f(it))continue; const p=at(it), d=Math.hypot(p.x-pos.x,p.z-pos.z); if(d<bd){ bd=d; b=it; } } return b; };
  const rx=s=>s instanceof RegExp?s:new RegExp(s||'.','i');
  window.GOODSGRAB=(n)=>{ const b=nearest(it=>it.m<=CARRY&&(n?rx(n).test(it.name):it.k==='v')); if(!b)return null; grab(b); return b.name; };
  window.GOODSTHROW=(dx,dz)=>{ if(!held)return false; throwTo(held,new THREE.Vector3(pos.x+dx,SHARED.py,pos.z+dz)); return true; };
  window.GOODSPUT=(dx,dz)=>{ if(!held)return false; const it=held; putAt(it,new THREE.Vector3(pos.x+dx,SHARED.py,pos.z+dz)); const p=it.rb.translation(); return [p.x-pos.x,p.z-pos.z]; };
  window.GOODSAT=i=>{ const it=items.filter(q=>q.k==='v')[i]; const p=it.rb?it.rb.translation():it.t; return [p.x,p.y,p.z]; };
  window.GOODSDBG=()=>({built:ready,pre:pre.size,n:items.length,active:act.size,awake:[...act].filter(it=>!it.rb.isSleeping()).length,moved:items.filter(it=>it.moved).length,held:held&&held.name,statics:[...stat.values()].reduce((s,q)=>s+q.cs.length,0),ms:+GPH.ms.toFixed(3),hooks:!!hooks});
  window.GOODSHIT=(k=4,r=3,n)=>{ let c=0; for(const it of act){ const p=it.rb.translation(); if(Math.hypot(p.x-pos.x,p.z-pos.z)<r*T&&(!n||rx(n).test(it.name))){ c++; it.rb.wakeUp(); it.rb.applyImpulse({x:(Math.random()-.5)*k*it.rb.mass(),y:k*.5*it.rb.mass(),z:(Math.random()-.5)*k*it.rb.mass()},true); } } return c; };
  window.LOOSE={list:(all)=>(all?items:[...act]).map(it=>({name:it.name,k:it.k,m:+it.m.toFixed(1),heavy:it.heavy,sol:it.sol.length,active:!!it.rb,awake:!!it.rb&&!it.rb.isSleeping(),at:(it.rb?[it.rb.translation()]:[it.t]).map(p=>[p.x,p.y,p.z].map(v=>+v.toFixed(3)))[0],c:it.c.map(v=>+v.toFixed(3)),h:it.h.map(v=>+v.toFixed(3)),sols:it.sol.map(([r])=>r.slice())})),
    push:(n,x,y,z)=>{ const it=nearest(q=>rx(n).test(q.name)); if(!it)return null; it.rb.wakeUp(); it.rb.applyImpulse({x:x*it.rb.mass(),y:y*it.rb.mass(),z:z*it.rb.mass()},true); return it.name; },
    nearest:n=>{ const it=nearest(q=>rx(n).test(q.name)); return it&&{name:it.name,m:it.m,heavy:it.heavy,awake:it===held||!!it.rb&&!it.rb.isSleeping(),at:(p=>[p.x,p.y,p.z])(at(it)),h:it.h,sols:it.sol.map(([r])=>r.slice()),dm:!!it.dm}; },
    pickAt:(n)=>{ const it=nearest(q=>rx(n).test(q.name)); if(!it)return null; const p=it.rb.translation(), rc=new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2().copy(new THREE.Vector3(p.x,p.y,p.z).project(SHARED.cam)),SHARED.cam); const r=USE.pick(rc); return r&&r.th.name; }};
}
