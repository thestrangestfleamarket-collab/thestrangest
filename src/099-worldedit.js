// THE WORLD EDITOR: WE lets you pick, move, turn, scale, recolour and hide objects in the world.
import {SHARED, THREE} from './003-shx.js';
import {LEVELS, LITE, NPCS, PARK, pos, SIGNS, UI, W3, WE, WED, WEEDS} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {FIX, SOL, SYS, TILE} from './006-map-pre.js';
import {OBJS, PEEK} from './008-batch.js';
import {TPANE} from './087dz-tpane.js';
Object.assign(WE,{on:false}); window.WE=WE;
{ const T=TILE, ST={}; let sel=null, box=null, drag=null;
  const base=o=>{ '@later'; if(o.base)return o.base; const B=o.parts.map(p=>p.me.geometry.attributes.position.array.slice(p.v0*3,p.v0*3+18)); const c=new THREE.Vector3(); let n=0, y0=1e9;
    for(const a of B)for(let i=0;i<18;i+=3){ c.x+=a[i]; c.y+=a[i+1]; c.z+=a[i+2]; n++; y0=Math.min(y0,a[i+1]); } c.divideScalar(n||1); c.y=y0; o.base=B; o.c=c; return B; };
  const E0=()=>({t:[0,0,0],r:0,rx:0,rz:0,s:[1,1,1],col:'#ffffff',bri:1,op:1,del:false});
  const E0L=()=>({li:1,lcol:null,ldist:null});
  let KMAP=null;
  const kraw=o=>{ base(o); const c=o.c; return o.place+'|'+o.name+'|'+Math.round(c.x*10)/10+','+Math.round(c.y*10)/10+','+Math.round(c.z*10)/10; };
  const kid=o=>{ '@later'; if(!KMAP){ KMAP=new Map(); const g={}; for(const q of OBJS){ const r=kraw(q); (g[r]||(g[r]=[])).push(q); } for(const r in g){ const L=g[r]; if(L.length<2)KMAP.set(L[0],r); else { L.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0); L.forEach((q,i)=>KMAP.set(q,r+'#'+i)); } } } return KMAP.get(o)||kraw(o); };
  const rp=p=>Math.round(p*10)/10, keyOf=o=>o.copy?o.key:o.prop||o.obj?o.place+'|'+o.name+'|'+rp(o.pivot[0])+','+rp(o.pivot[1])+','+rp(o.pivot[2]):kid(o);
  const stOf=o=>{ const k=keyOf(o); return ST[k]||(ST[k]=E0()); };
  const v=new THREE.Vector3(), vv=new THREE.Vector3(), E3=new THREE.Euler(), col=new THREE.Color(), touched=new Set();
  const D2R=Math.PI/180, Mx=new THREE.Matrix4(), Tx=new THREE.Matrix4(), Ex=new THREE.Euler(), PB=new THREE.Box3();
  // a moved, scaled or removed thing takes its footprint (what you bump into) with it, and the grass round it is grown again
  const foot=(it,e)=>{ '@later'; if(!it||!it.sol)return; const b=it.sol, f=it.fix, b0=it.sol0||(it.sol0=b.slice()), f0=it.fix0||(f&&(it.fix0=f.slice())), cx=(b0[0]+b0[2])/2+e.t[0], cz=(b0[1]+b0[3])/2+e.t[2], hx=(b0[2]-b0[0])/2*Math.abs(e.s[0]), hz=(b0[3]-b0[1])/2*Math.abs(e.s[2]), was=b.slice();
    if(e.del){ b[0]=b[2]=b[1]=b[3]=1e9; } else { b[0]=cx-hx; b[2]=cx+hx; b[1]=cz-hz; b[3]=cz+hz; }
    if(f&&f0){ if(e.del){ f[0]=f[3]=f[1]=f[4]=1e9; } else { f[0]=b[0]; f[3]=b[2]; f[1]=b[1]; f[4]=b[3]; f[5]=f0[5]*Math.abs(e.s[1]); } }
    for(const q of it.more||[]){ const [s,g]=q, s0=q[2]||(q[2]=s.slice()), g0=q[3]||(q[3]=g.slice()), dx=e.del?1e9:cx-(b0[0]+b0[2])/2, dz=e.del?1e9:cz-(b0[1]+b0[3])/2;   // a long thing's other boxes go with it
      s[0]=s0[0]+dx; s[2]=s0[2]+dx; s[1]=s0[1]+dz; s[3]=s0[3]+dz; g[0]=s[0]; g[3]=s[2]; g[1]=s[1]; g[4]=s[3]; }
    if(WEEDS&&WEEDS.lawnDrop&&was.some((v,i)=>v!==b[i])){ for(const r of [was,b])if(r[0]<1e8)WEEDS.lawnDrop([r[0]-TILE,r[1]-TILE,r[2]+TILE,r[3]+TILE]); } };
  // what goes with a thing: its lights (dark while it is removed) and glows
  const follow=(it,e,pv)=>{ '@later'; if(!it||!it.follow)return; Ex.set((e.rx||0)*D2R,(e.r||0)*D2R,(e.rz||0)*D2R,'YXZ');
    for(const L of it.follow){ const u=L.userData; if(!u.wePos0){ u.wePos0=L.position.clone(); u.weS0=L.scale.clone(); }
      if(L.isLight){ if(e.del){ if(u.weI0==null){ u.weI0=u.i0!=null?u.i0:L.intensity; u.i0=0; L.intensity=0; } } else if(u.weI0!=null){ u.i0=u.weI0; L.intensity=u.weI0; delete u.weI0; } }
      else L.scale.copy(u.weS0).multiplyScalar(e.del?0:1);
      v.set(pv[0],pv[1],pv[2]); L.position.copy(u.wePos0).sub(v).multiply(vv.fromArray(e.s)).applyEuler(Ex).add(v).add(vv.fromArray(e.t)); }
    if(LITE)LITE.t=0; };
  const Bx=new THREE.Matrix4(), cx=new THREE.Color();
  // a BatchedMesh item moves by its own matrix; an InstancedMesh item by the edit times its first matrix (removed: shrunk to nothing)
  function applyProp(o){ '@later'; const e=stOf(o), me=o.me, id=o.id, pv=o.pivot, en=o.en, inst=!!(me&&me.isInstancedMesh); if(!me||!me.setMatrixAt)return;
    foot(o.it,e); follow(o.it,e,pv);
    if(inst&&!en.base){ en.base=me.instanceMatrix.array.slice(); if(me.instanceColor)en.col0=me.instanceColor.array.slice(); }
    // a tree's shadow stand-in (061-park) is the same tree in another batch: what is done to one is done to the other
    const twin=(f)=>{ const T=me.userData.twins; if(!T||!me.userData.ids)return; const i=me.userData.ids.indexOf(id); for(const t of T){ const j=t.userData.ids&&t.userData.ids[i]; if(j>=0)f(t,j); } };
    if(e.del){ if(inst){ me.setMatrixAt(id,Mx.makeScale(0,0,0).setPosition(pv[0],pv[1],pv[2])); me.instanceMatrix.needsUpdate=true; me.computeBoundingSphere(); } else if(me.setVisibleAt){ me.setVisibleAt(id,false); (me.userData.gone||(me.userData.gone=new Set())).add(id); twin((t,j)=>t.setVisibleAt(j,false)); } return; }
    if(me.setVisibleAt){ me.setVisibleAt(id,true); if(me.userData.gone)me.userData.gone.delete(id); (me.userData.edited||(me.userData.edited=new Set())).add(id); if(PARK.lodReset)PARK.lodReset(); }
    Ex.set((e.rx||0)*D2R,(e.r||0)*D2R,(e.rz||0)*D2R,'YXZ'); Mx.makeRotationFromEuler(Ex); Mx.multiply(Tx.makeScale(e.s[0],e.s[1],e.s[2]));
    Mx.multiply(Tx.makeTranslation(-pv[0],-pv[1],-pv[2])); Mx.premultiply(Tx.makeTranslation(pv[0]+e.t[0],pv[1]+e.t[1],pv[2]+e.t[2]));
    if(inst){ Mx.multiply(Bx.fromArray(en.base,id*16)); me.instanceMatrix.needsUpdate=true;
      if(en.col0){ col.set(e.col).multiplyScalar(e.bri==null?1:e.bri); me.setColorAt(id,cx.fromArray(en.col0,id*3).multiply(col)); me.instanceColor.needsUpdate=true; } }
    me.setMatrixAt(id,Mx); if(me.isBatchedMesh&&me.setColorAt){ const plain=(e.col||'#ffffff').toLowerCase()==='#ffffff'&&(e.bri==null||e.bri===1); if(!plain||me.userData.tinted){ me.userData.tinted=1; me.setColorAt(id,col.set(e.col||'#ffffff').multiplyScalar(e.bri==null?1:e.bri)); } } if(me.computeBoundingSphere)me.computeBoundingSphere(); twin((t,j)=>{ t.setMatrixAt(j,Mx); t.setVisibleAt(j,true); if(t.computeBoundingSphere)t.computeBoundingSphere(); }); }
  const propHandle=(en,bid)=>{ const it=en.items[en.ids[bid]]; return {prop:true,me:en.me,id:bid,place:en.place,name:it.k,pivot:[it.x,it.y,it.z],it,en,tint:!!((en.me.isInstancedMesh&&en.me.instanceColor)||en.me.isBatchedMesh)}; };
  // WED.meshes: {place, me (a BatchedMesh or InstancedMesh), items [{k:name, x,y,z:pivot, sol?, fix?, follow?}], ids? (batch or instance id to item; one item per instance when left out)}
  // an inside's pieces are there only while it is built: dropped from the lists once it is gone
  const inScene=o=>{ for(let q=o;q;q=q.parent)if(q===scene)return true; return false; };
  const prune=L=>{ for(let i=L.length-1;i>=0;i--){ const en=L[i]; if(en.temp&&!inScene(en.me||en.obj))L.splice(i,1); } return L; };
  const ents=()=>{ prune(WED.meshes); for(const en of WED.meshes)if(!en.ids)en.ids=en.items.map((_,i)=>i); return WED.meshes; };
  // parts of one thing in different meshes (a tree's crown and trunk, a lantern's frame and glass) share a key and are edited together
  let KX=null, KN=-1; const linked=o=>{ '@later'; if(!o.prop||!o.me)return [o]; const L=ents(); let n=0; for(const en of L)n+=en.ids.length;
    if(!KX||n!==KN){ KX=new Map(); KN=n; for(const en of L)for(let bid=0;bid<en.ids.length;bid++){ const h=propHandle(en,bid), k=keyOf(h); (KX.get(k)||KX.set(k,[]).get(k)).push(h); } } return KX.get(keyOf(o))||[o]; };
  const applyWED=()=>{ for(const en of ents())for(let bid=0;bid<en.ids.length;bid++){ const h=propHandle(en,bid); if(ST[keyOf(h)])applyProp(h); } };
  // WED.objs: {place, name, obj (a whole model: a Polyfork building, a kit piece), sol?, fix?}: moved, turned, scaled, tinted and hidden as one; its first place and look kept to edit from
  const objFirst=en=>{ if(en.p0)return; const o=en.obj; o.updateMatrixWorld(true); en.p0=o.position.clone(); en.q0=o.quaternion.clone(); en.s0=o.scale.clone(); en.w0=new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
    en.m0=[]; o.traverse(m=>{ if(m.isMesh){ m.userData.weObj=en; en.m0.push([m,m.matrixWorld.clone()]); } }); };
  const objHandle=en=>{ objFirst(en); return {obj:true,ob:en.obj,place:en.place,name:en.name,pivot:[en.w0.x,en.w0.y,en.w0.z],it:en,en}; };
  function applyObj(o){ '@later'; const e=stOf(o), en=o.en, ob=o.ob; objFirst(en); foot(en,e); if(e.del){ ob.visible=false; return; } ob.visible=true;
    ob.position.set(en.p0.x+e.t[0],en.p0.y+e.t[1],en.p0.z+e.t[2]); ob.quaternion.setFromEuler(Ex.set((e.rx||0)*D2R,(e.r||0)*D2R,(e.rz||0)*D2R,'YXZ')).multiply(en.q0); ob.scale.set(en.s0.x*e.s[0],en.s0.y*e.s[1],en.s0.z*e.s[2]);
    const plain=(e.col||'#ffffff').toLowerCase()==='#ffffff'&&(e.bri==null||e.bri===1)&&(e.op==null||e.op>=1);
    ob.traverse(m=>{ if(!m.isMesh||!m.material)return; if(!m.userData.weMat0)m.userData.weMat0=m.material; if(plain){ m.material=m.userData.weMat0; return; }
      if(m.material===m.userData.weMat0){ m.material=m.material.clone(); } m.material.color.set(e.col||'#ffffff').multiplyScalar(e.bri==null?1:e.bri); const t=(e.op==null?1:e.op)<1; if(m.material.transparent!==t){ m.material.transparent=t; m.material.needsUpdate=true; } m.material.opacity=e.op==null?1:e.op; });
    ob.updateMatrixWorld(true); }
  const objs=()=>prune(WED.objs||[]);
  // anything else in the world (the skate park, the fair, a sign, the ground): a plain mesh is taken as a whole thing when picked, and found again by its key when the world loads; never a person, a glow or a particle
  const wname=m=>String(m.name||(m.parent&&m.parent.name)||(m.geometry&&m.geometry.type.replace(/Geometry$/,''))||'thing').toLowerCase().slice(0,40);
  const person=m=>{ for(let q=m;q;q=q.parent){ if(q===W3.group||q.userData.npc||q.userData.body||q.userData.player)return true; if(NPCS.some(N=>N.g===q))return true; } return false; };
  const plainMesh=m=>m&&m.isMesh&&!(m.material&&m.material.visible===false)&&!m.isSkinnedMesh&&!m.isInstancedMesh&&!m.isBatchedMesh&&!m.userData.weCopy&&!m.userData.weObj&&!(m.material&&m.material.transparent&&m.material.depthWrite===false)&&vis(m)&&!person(m);
  const asWorld=m=>{ const en={place:'world',name:wname(m),obj:m}; WED.objs.push(en); objFirst(en); return en; };
  let scanned=0; const scanWorld=()=>{ const want=new Set(Object.keys(ST).filter(k=>k.startsWith('world|'))); if(!want.size||scanned===want.size)return; scanned=want.size;
    scene.traverse(m=>{ if(!m.isMesh||m.userData.weObj||m.isSkinnedMesh||m.isInstancedMesh||m.isBatchedMesh||m.userData.weCopy)return; m.updateMatrixWorld(); const p=new THREE.Vector3().setFromMatrixPosition(m.matrixWorld), k='world|'+wname(m)+'|'+rp(p.x)+','+rp(p.y)+','+rp(p.z); if(want.has(k))asWorld(m); }); };
  const applyObjs=()=>{ scanWorld(); for(const en of objs()){ const h=objHandle(en); if(ST[keyOf(h)])applyObj(h); } };
  const fromOBJE=key=>{ for(const en of objs()){ const h=objHandle(en); if(keyOf(h)===key)return h; } return null; };
  // copies: a picked park thing again beside it, its own mesh cut from the same batch; kept in ST as 'C|n' {copy:name, of:the original's key, place, at:[x,y,z], ...the usual edits}
  // a placed thing far off waits until you come within 90 tiles (its category fetched then)
  const FAR=new Set(); SYS.every(()=>{ for(const k of FAR)if(!ST[k])FAR.delete(k); else if(Math.hypot(ST[k].at[0]-pos.x,ST[k].at[2]-pos.z)<=90*T)applyCopy({key:k}); },2000,'099-far');
  const CP=new Map(); let cpg=null; const D2=Math.PI/180;
  const fromWED=key=>{ for(const en of ents())for(let bid=0;bid<en.ids.length;bid++){ const h=propHandle(en,bid); if(keyOf(h)===key)return h; } return null; };
  const geoOf=h=>{ '@later'; const me=h.me; let G;
    if(me.isInstancedMesh){ G=me.geometry.clone(); G.applyMatrix4(Bx.fromArray(h.en.base||me.instanceMatrix.array,h.id*16)); }
    else { let R=null; try{ R=me.getGeometryRangeAt(me.getGeometryIdAt(h.id)); }catch(e){} if(!R)return null; G=new THREE.BufferGeometry();
      for(const k in me.geometry.attributes){ if(k==='batchId')continue; const A=me.geometry.attributes[k], z=A.itemSize; G.setAttribute(k,new THREE.BufferAttribute(A.array.slice(R.vertexStart*z,(R.vertexStart+R.vertexCount)*z),z,A.normalized)); } }
    G.translate(-h.pivot[0],-h.pivot[1],-h.pivot[2]); G.computeBoundingSphere(); return G; };
  // a painted object (OBJS) copied: its quads as first painted, one mesh per batch they sit in
  const objGeos=o=>{ '@later'; const B=base(o), by=new Map(); o.parts.forEach((p,k)=>(by.get(p.me)||by.set(p.me,[]).get(p.me)).push([p,B[k]]));
    return [...by].map(([me,L])=>{ const G=new THREE.BufferGeometry(); for(const n in me.geometry.attributes){ const A=me.geometry.attributes[n], z=A.itemSize, d=new A.array.constructor(L.length*6*z);
        L.forEach(([p,b],i)=>n==='position'?d.set(b,i*18):n==='aCol'||n==='aOp'?d.fill(1,i*6*z,(i+1)*6*z):d.set(A.array.subarray(p.v0*z,(p.v0+6)*z),i*6*z)); G.setAttribute(n,new THREE.BufferAttribute(d,z,A.normalized)); }
      G.translate(-o.c.x,-o.c.y,-o.c.z); G.computeVertexNormals(); G.computeBoundingSphere(); return [G,me]; }); };
  const fromOBJ=key=>{ for(const o of OBJS)if(kid(o)===key)return o; return null; };
  const copyMesh=k=>{ '@later'; let g=CP.get(k); const e=ST[k]; if(!e||!e.of&&!e.pf)return null; if(!g){ const h0=e.pf?null:fromWED(e.of), oe=h0||e.pf?null:fromOBJE(e.of), o=h0||oe||e.pf?null:fromOBJ(e.of);
      const add=(src,me)=>{ me.castShadow=src.castShadow; me.receiveShadow=src.receiveShadow; if(src.customDepthMaterial)me.customDepthMaterial=src.customDepthMaterial; me.userData.weCopy=k; g.add(me); };
      g=new THREE.Group();
      if(h0)for(const h of linked(h0)){ const G=geoOf(h); if(!G)continue; let me; if(h.me.isInstancedMesh){ me=new THREE.InstancedMesh(G,h.me.material,1); me.setMatrixAt(0,Tx.identity()); if(h.me.instanceColor)me.setColorAt(0,cx.fromArray(h.en.col0||h.me.instanceColor.array,h.id*3)); me.computeBoundingSphere(); } else me=new THREE.Mesh(G,h.me.material); add(h.me,me); }
      else if(o)for(const [G,src] of objGeos(o))add(src,new THREE.Mesh(G,src.material));
      else if(oe)for(const [m,M] of oe.en.m0){ const G=m.geometry.clone().applyMatrix4(M); G.translate(-oe.pivot[0],-oe.pivot[1],-oe.pivot[2]); G.computeBoundingSphere(); add(m,new THREE.Mesh(G,m.userData.weMat0||m.material)); }
      else if(e.pf){ const G=WE.pfGeo&&WE.pfGeo(e.pf); if(!G){ if(Math.hypot(e.at[0]-pos.x,e.at[2]-pos.z)>90*T){ FAR.add(k); return null; } FAR.delete(k); if(WE.pfLoad)WE.pfLoad(e.pf).then(()=>{ if(ST[k]&&!CP.get(k)){ applyCopy({key:k}); settle(); if(sel&&sel.key===k)frame(); } }).catch(()=>{}); return null; }
        const me=new THREE.Mesh(G,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true})); me.castShadow=me.receiveShadow=true; me.userData.weCopy=k; g.add(me); }
      if(!g.children.length)return null; if(!cpg){ cpg=new THREE.Group(); scene.add(cpg); } cpg.add(g); CP.set(k,g); } return g; };
  // a placed Polyfork thing stands where he bumps into it (its footprint turned with it), and takes its colour and see-through
  const pfSolid=(k,e,g)=>{ const S=g.userData.sol||(g.userData.sol=[0,0,0,0]), F=g.userData.fix||(g.userData.fix=[0,0,0,0,0,0]);
    if(e.del){ for(const [L,x] of [[SOL.up,S],[FIX.up,F],[PEEK.boxes,g.userData.peek]]){ const i=L.indexOf(x); if(i>=0)L.splice(i,1); } return; }
    const b=new THREE.Box3().setFromObject(g), f=WE.pfFoot&&WE.pfFoot(e.pf); if(f){ const y=b.min.y; b.makeEmpty(); for(const [x,z] of [[f[0],f[1]],[f[2],f[1]],[f[0],f[3]],[f[2],f[3]]])b.expandByPoint(vv.set(x,0,z).applyMatrix4(g.matrixWorld)); b.min.y=y; b.max.y=Math.max(b.max.y,new THREE.Box3().setFromObject(g).max.y); } S[0]=b.min.x; S[1]=b.min.z; S[2]=b.max.x; S[3]=b.max.z; F[0]=b.min.x; F[1]=b.min.z; F[2]=b.min.y; F[3]=b.max.x; F[4]=b.max.z; F[5]=b.max.y;
    if(!SOL.up.includes(S))SOL.up.push(S); if(!FIX.up.includes(F))FIX.up.push(F);
    // a big one fades round you like the park's big trees and the walls (PEEK): a tree opens fully, anything else as a wall
    { const W=new THREE.Box3().setFromObject(g), M=T/.84, big=W.max.y-W.min.y>=2.2*M||Math.max(W.max.x-W.min.x,W.max.z-W.min.z)>=3*M, pk=g.userData.peek;
      if(big){ for(const c of g.children)if(c.geometry&&!c.geometry.attributes.aWl)PEEK.mark(c.geometry,new Uint8Array(c.geometry.attributes.position.count).fill(WE.pfTree&&WE.pfTree(e.pf)?4:2));
        if(pk){ const ex=.7*M; pk.b.min.copy(W.min).subScalar(ex); pk.b.max.copy(W.max).addScalar(ex); } else { PEEK.box(g,W.min.x,W.min.y,W.min.z,W.max.x,W.max.y,W.max.z); g.userData.peek=PEEK.boxes[PEEK.boxes.length-1]; } }
      else if(pk){ const i=PEEK.boxes.indexOf(pk); if(i>=0)PEEK.boxes.splice(i,1); g.userData.peek=null; } }
    for(const c of g.children){ const m=c.material; if(!m||!m.isMeshLambertMaterial)continue; m.color.set(e.col||'#ffffff').multiplyScalar(e.bri==null?1:e.bri); const t=(e.op==null?1:e.op)<1; if(m.transparent!==t){ m.transparent=t; m.needsUpdate=true; } m.opacity=e.op==null?1:e.op; } };
  const copyHandle=k=>({copy:true,key:k,name:ST[k].copy,place:ST[k].place,pivot:ST[k].at});
  function applyCopy(o){ '@later'; const e=ST[o.key]; if(!e)return; if(e.del){ const m=CP.get(o.key); if(m){ if(e.pf)pfSolid(o.key,e,m); cpg.remove(m); m.traverse(c=>c.geometry&&c.geometry.dispose()); CP.delete(o.key); } return; } const me=copyMesh(o.key); if(!me)return;
    me.position.set(e.at[0]+e.t[0],e.at[1]+e.t[1],e.at[2]+e.t[2]); me.rotation.set((e.rx||0)*D2,(e.r||0)*D2,(e.rz||0)*D2,'YXZ'); me.scale.set(e.s[0],e.s[1],e.s[2]); me.visible=true; if(e.pf){ me.updateMatrixWorld(true); pfSolid(o.key,e,me); } }
  const applyCopies=()=>{ for(const k in ST)if(k[0]==='C'&&k[1]==='|')applyCopy({key:k}); };
  const applySel=o=>o.copy?applyCopy(o):o.obj?applyObj(o):o.prop?linked(o).forEach(applyProp):apply(o);
  function apply(o){ '@later'; const B=base(o), e=stOf(o), c=o.c; foot(o,e); follow(o,e,[c.x,c.y,c.z]); E3.set((e.rx||0)*Math.PI/180,(e.r||0)*Math.PI/180,(e.rz||0)*Math.PI/180,'YXZ'); col.set(e.col).multiplyScalar(e.bri==null?1:e.bri);
    o.parts.forEach((p,k)=>{ const g=p.me.geometry, P=g.attributes.position.array, N=g.attributes.normal.array, C=g.attributes.aCol.array, O=g.attributes.aOp.array, a=B[k];
      for(let i=0;i<6;i++){ vv.set((a[i*3]-c.x)*e.s[0],(a[i*3+1]-c.y)*e.s[1],(a[i*3+2]-c.z)*e.s[2]).applyEuler(E3);
        const j=(p.v0+i)*3; if(e.del){ P[j]=c.x; P[j+1]=c.y-50; P[j+2]=c.z; } else { P[j]=c.x+vv.x+e.t[0]; P[j+1]=c.y+vv.y+e.t[1]; P[j+2]=c.z+vv.z+e.t[2]; }
        C[j]=col.r; C[j+1]=col.g; C[j+2]=col.b; O[p.v0+i]=e.op; }
      for(const t0 of [p.v0,p.v0+3]){ const j=t0*3, ux=P[j+3]-P[j], uy=P[j+4]-P[j+1], uz=P[j+5]-P[j+2], wx=P[j+6]-P[j], wy=P[j+7]-P[j+1], wz=P[j+8]-P[j+2];
        let nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx; const l=Math.hypot(nx,ny,nz)||1; for(let q=0;q<3;q++){ N[j+q*3]=nx/l; N[j+q*3+1]=ny/l; N[j+q*3+2]=nz/l; } }
      g.attributes.position.needsUpdate=g.attributes.normal.needsUpdate=g.attributes.aCol.needsUpdate=g.attributes.aOp.needsUpdate=true; touched.add(g); }); }
  let reshade=0; const settle=()=>{ for(const g of touched)g.computeBoundingSphere(); touched.clear(); clearTimeout(reshade); reshade=setTimeout(()=>{ scene.traverse(L=>{ if(L.isLight&&L.castShadow&&L.shadow&&L.shadow.autoUpdate===false)L.shadow.needsUpdate=true; }); },250); };
  // lights (brightness/colour/range) — i0 is the base every day/night and flicker system scales from, so editing it sticks
  const hexOf=n=>'#'+(n>>>0&0xffffff).toString(16).padStart(6,'0');
  const litKey=L=>{ const p=L.userData.wePos0||L.position; return 'L|'+rp(p.x)+'_'+rp(p.y)+'_'+rp(p.z); };
  const litOrig=L=>{ const u=L.userData; if(u.i0Orig==null)u.i0Orig=(u.i0!=null?u.i0:L.intensity); if(u.colOrig==null)u.colOrig=L.color.getHex(); if(u.distOrig==null)u.distOrig=L.distance; return u; };
  const sceneLights=()=>{ const out=[]; scene.traverse(o=>{ if(o.isLight&&o.intensity!==undefined&&o.type!=='AmbientLight'&&o.type!=='HemisphereLight'&&!o.userData.pool)out.push(o); }); if(LITE&&LITE.recs)for(const L of LITE.recs)if(!out.includes(L))out.push(L); return out; };
  const nearLight=(pt,R)=>{ let best=null, bd=R*R; for(const L of sceneLights()){ const d=L.position.distanceToSquared(pt); if(d<bd){ bd=d; best=L; } } return best; };
  const applyLight=(L,s)=>{ const u=litOrig(L), li=s.li==null?1:s.li, nb=u.i0Orig*li;
    if(u.i0!=null){ const f=u.i0?L.intensity/u.i0:1; u.i0=nb; L.intensity=nb*f; } else L.intensity=nb;
    L.color.set(s.lcol!=null?s.lcol:u.colOrig); L.distance=s.ldist!=null?s.ldist:u.distOrig; };
  const applyLights=()=>{ if(!Object.keys(ST).some(k=>k[0]==='L'&&k[1]==='|'))return; for(const L of sceneLights()){ const s=ST[litKey(L)]; if(s)applyLight(L,s); } };
  // signs (editable text + glow, e.g. the theatre marquee): each registers get/set in SIGNS.list
  const signKey=o=>'S|'+o.place+'|'+o.name, sgOf=m=>{ for(const sg of SIGNS.list)if(sg.me===m)return sg; return null; };
  const applySigns=()=>{ if(!Object.keys(ST).some(k=>k[0]==='S'&&k[1]==='|'))return; for(const sg of SIGNS.list){ const st=ST['S|'+sg.place+'|'+sg.name]; if(st&&sg.set)sg.set({text:st.text,bri:st.sbri,col:st.scol}); } };
  const save=()=>{ try{ localStorage.setItem('market-world',JSON.stringify(ST)); }catch(e){} if(WE.onsave)WE.onsave(ST); };
  let BAKED={}; try{ BAKED=__DATA__("data/world-edits.json")||{}; }catch(e){}
  let LOCAL={}; try{ LOCAL=JSON.parse(localStorage.getItem('market-world')||'{}'); }catch(e){}
  try{ Object.assign(ST,BAKED,LOCAL); }catch(e){}
  const applyAll=()=>{ if(!Object.keys(ST).length)return; for(const o of OBJS)if(ST[kid(o)])apply(o); applyWED(); applyObjs(); applyCopies(); applyLights(); applySigns(); settle(); };
  const drainWED=()=>{ let t=800; const re=()=>{ (window.LOAD?LOAD('later'):Promise.resolve()).then(()=>{ applyWED(); applyObjs(); applyLights(); applySigns(); }).catch(()=>{}); if((t*=2)<40000)setTimeout(re,t); }; setTimeout(re,t); };
  // the world everyone shares (the server's file, 136b) under your own browser's edits; the owner's browser is the server's copy unless a send of his failed
  WE.setLive=(live,mine)=>{ const was=JSON.stringify(ST); for(const k in ST)delete ST[k]; Object.assign(ST,BAKED,live||{},mine?LOCAL:{}); try{ localStorage.setItem('market-world',JSON.stringify(ST)); }catch(e){} return JSON.stringify(ST)!==was; };
  // things built after the start (the park's Polyfork things, the Polyfork rows) call this once they stand, so their saved edits are put on them
  WE.late=()=>{ if(!Object.keys(ST).length)return; (window.LOAD?LOAD('later'):Promise.resolve()).then(()=>{ applyWED(); applyObjs(); settle(); }).catch(()=>{}); };
  WE.applyAll=()=>{ if(!SYS.started)return; (window.LOAD?LOAD('later'):Promise.resolve()).then(applyAll).catch(applyAll); drainWED(); };
  SYS.onStart(()=>(WE.ready||Promise.resolve()).catch(()=>{}).then(async()=>{ if(!Object.keys(ST).length)return; if(window.LOAD)await LOAD('later'); WE.applyAll(); }),'099-worldedit');   // laying the edits needs the later chunk
  WE.getState=()=>ST;
  const css=document.createElement('style'); css.textContent=`
  #we{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:12px;width:min(400px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20;box-sizing:border-box}
  #we[hidden]{display:none} #we h2{font:12px var(--pixel);color:var(--key);margin:0;padding:12px 14px;border-bottom:2px solid var(--line)} #we .pane{padding:10px 14px}
  #we .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0} #we .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 8px;cursor:pointer}
  #we .dim{color:var(--dim)} #we .lab{width:84px} #we textarea{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;width:100%;box-sizing:border-box;min-height:56px;padding:6px} #we .tp{margin:6px 0}
  #we.lock>h2,#we.lock>.pane,#we.lock>.wtabs{opacity:.35;filter:grayscale(1);pointer-events:none} #welock{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--key);text-shadow:none;pointer-events:none} #welock span{background:var(--bg);border:2px solid var(--line);padding:10px 14px;font:12px var(--pixel);line-height:2;pointer-events:none} #welock[hidden]{display:none}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='we'; P.hidden=true; P.innerHTML=`<h2>EDIT THE WORLD</h2><div class="pane">
    <div class="dim" id="wname">double-click a thing to pick it</div>
    <div id="wtools" hidden>
      <div class="row" data-orow><span class="lab">MOVE</span><button class="btn" data-mv="-1,0">◀</button><button class="btn" data-mv="1,0">▶</button><button class="btn" data-mv="0,-1">▲</button><button class="btn" data-mv="0,1">▼</button><button class="btn" data-up="1">UP</button><button class="btn" data-up="-1">DOWN</button></div>
      <div class="dim" data-orow>or drag it along the ground</div>
      <div class="row" data-orow><span class="lab">TURN</span><button class="btn" data-turn="-15">⟲ 15°</button><button class="btn" data-turn="15">⟳ 15°</button><button class="btn" data-turn="90">90°</button></div>
      <div class="row" data-srow><span class="lab">SIGN TEXT</span></div>
      <div class="row" data-srow><textarea id="wstext" placeholder="(blank = the live title)"></textarea></div>
    </div>
    <div class="tp"></div><div class="dim" id="wmsg"></div>
    <input type="file" id="wimpf" accept="application/json" style="display:none"><div class="row"><button class="btn" id="wsend" hidden>SEND TO SERVER</button></div>
    <div class="dim" id="wwho"></div></div><div id="welock" hidden><span>EDITING ONLY IN<br>THE ISOMETRIC VIEW</span></div>`;
  document.body.appendChild(P); const $=s=>P.querySelector(s);
  ['keydown','keyup','keypress'].forEach(ev=>P.addEventListener(ev,e=>{ if(e.target.matches('input,textarea'))e.stopPropagation(); }));
  $('.tp').addEventListener('mousedown',e=>e.stopPropagation());
  let pane=null, quiet=false; const BL={};
  const shown=(b,on)=>{ if(b)b.element.style.display=on?'':'none'; };
  const E=()=>sel&&!sel.sign?stOf(sel):E0(), LS=()=>sel&&sel.lite?ST[sel.liteKey]||E0L():E0L(), SS=()=>sel&&sel.sign?ST[signKey(sel)]||{}:{};
  function draw(){ '@later'; const on=!!sel, isSign=on&&!!sel.sign;
    $('#wtools').hidden=!on; $('#wname').textContent=on?'PICKED: '+sel.name.toUpperCase()+' ('+sel.place+')':'double-click a thing to pick it';
    P.querySelectorAll('#wtools [data-orow]').forEach(r=>r.style.display=isSign?'none':''); P.querySelectorAll('#wtools [data-srow]').forEach(r=>r.style.display=isSign?'':'none');
    if(isSign){ const st=SS(); $('#wstext').value=st.text!=null?st.text:''; }
    if(!pane)return; const obj=on&&!isSign, pr=k=>obj&&!(sel.prop&&!(sel.tint&&k!=='op'));
    for(const k of ['shape','acts'])shown(BL[k],obj); shown(BL.sign,isSign);
    for(const k of ['col','col0','bri','op'])shown(BL[k],pr(k)); shown(BL.colour,pr('col'));
    shown(BL.lite,obj&&!!sel.lite); if(obj&&sel.lite)BL.lite.title='LIGHT ON THIS '+sel.name.toUpperCase();
    quiet=true; try{ pane.refresh(); }finally{ quiet=false; } }
  function frame(){ '@later'; if(box){ scene.remove(box); box=null; } if(!sel||(!sel.sign&&stOf(sel).del))return; const b=new THREE.Box3();
    if(sel.sign){ if(sel.me&&sel.me.geometry){ sel.me.geometry.computeBoundingBox(); b.copy(sel.me.geometry.boundingBox).applyMatrix4(sel.me.matrixWorld); } }
    else if(sel.copy){ const me=CP.get(sel.key); if(me)b.setFromObject(me); }
    else if(sel.obj){ b.setFromObject(sel.ob); }
    else if(sel.prop){ for(const h of linked(sel)){ const m=h.me; if(!m)continue; PB.makeEmpty(); if(m.getBoundingBoxAt)m.getBoundingBoxAt(h.id,PB); else if(m.isInstancedMesh){ if(!m.geometry.boundingBox)m.geometry.computeBoundingBox(); PB.copy(m.geometry.boundingBox); } if(m.getMatrixAt){ m.getMatrixAt(h.id,Mx); PB.applyMatrix4(Mx); } b.union(PB.applyMatrix4(m.matrixWorld)); } }
    else for(const p of sel.parts){ const a=p.me.geometry.attributes.position.array; for(let i=0;i<6;i++)b.expandByPoint(v.fromArray(a,(p.v0+i)*3)); }
    if(b.isEmpty())return; box=new THREE.Box3Helper(b,0xf2c14e); scene.add(LEVELS.own(box,'*')); }
  const change=f=>{ if(!sel)return; f(stOf(sel)); applySel(sel); settle(); save(); frame(); draw(); };
  const changeLite=f=>{ if(!sel||!sel.lite)return; const k=sel.liteKey, s=ST[k]||(ST[k]=E0L()); f(s); applyLight(sel.lite,s); if((s.li==null||s.li===1)&&s.lcol==null&&s.ldist==null)delete ST[k]; settle(); save(); draw(); };
  const changeSign=f=>{ if(!sel||!sel.sign)return; const k=signKey(sel), st=ST[k]||(ST[k]={text:null,sbri:null,scol:null}); f(st); sel.ref.set&&sel.ref.set({text:st.text,bri:st.sbri,col:st.scol}); if(st.text==null&&(st.sbri==null||st.sbri===1)&&st.scol==null)delete ST[k]; save(); };
  const ground=()=>{ const r=new THREE.Vector3().setFromMatrixColumn(SHARED.cam.matrixWorld,0); r.y=0; r.normalize(); const f=new THREE.Vector3(-r.z,0,r.x); return [r,f]; };
  P.querySelectorAll('[data-mv]').forEach(b=>b.onclick=()=>{ const [dx,dz]=b.dataset.mv.split(',').map(Number), [r,f]=ground(); change(e=>{ e.t[0]+=(r.x*dx+f.x*dz)*.25*T; e.t[2]+=(r.z*dx+f.z*dz)*.25*T; }); });
  P.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>change(e=>{ e.t[1]+=+b.dataset.up*.1*T; }));
  P.querySelectorAll('[data-turn]').forEach(b=>b.onclick=()=>change(e=>{ e.r=(e.r+ +b.dataset.turn)%360; }));
  $('#wstext').oninput=ev=>changeSign(st=>{ st.text=ev.target.value||null; });
  const ed=(get,set,via=change)=>[get,v=>{ if(!quiet)via(e=>set(e,v)); }];
  const V=TPANE.live({
    rx:ed(()=>E().rx||0,(e,v)=>{ e.rx=v; }), rz:ed(()=>E().rz||0,(e,v)=>{ e.rz=v; }),
    sz:ed(()=>{ const s=E().s; return Math.cbrt(s[0]*s[1]*s[2]); },(e,v)=>{ const k=v/Math.cbrt(e.s[0]*e.s[1]*e.s[2]); e.s=e.s.map(x=>x*k); }),
    s0:ed(()=>E().s[0],(e,v)=>{ e.s[0]=v; }), s1:ed(()=>E().s[1],(e,v)=>{ e.s[1]=v; }), s2:ed(()=>E().s[2],(e,v)=>{ e.s[2]=v; }),
    col:ed(()=>E().col,(e,v)=>{ e.col=v; }), bri:ed(()=>E().bri==null?1:E().bri,(e,v)=>{ e.bri=v; }), op:ed(()=>1-E().op,(e,v)=>{ e.op=1-v; }),
    li:ed(()=>LS().li==null?1:LS().li,(s,v)=>{ s.li=v; },changeLite),
    lcol:ed(()=>{ const s=LS(); return hexOf(s.lcol!=null?parseInt(s.lcol.slice(1),16):sel&&sel.lite?litOrig(sel.lite).colOrig:0xffffff); },(s,v)=>{ s.lcol=v; },changeLite),
    ldist:ed(()=>{ const s=LS(); return +((s.ldist!=null?s.ldist:sel&&sel.lite?litOrig(sel.lite).distOrig:T)/T).toFixed(1); },(s,v)=>{ s.ldist=v*T; },changeLite),
    sbri:ed(()=>SS().sbri==null?1:SS().sbri,(st,v)=>{ st.sbri=v; },changeSign), scol:ed(()=>SS().scol||'#ffd98a',(st,v)=>{ st.scol=v; },changeSign)});
  const hook=(b,id,a,q='input')=>{ const el=b.element.querySelector(q); if(el&&id)el.id=id; if(a)b.element.setAttribute(a,''); return b; };
  const build=async()=>{ '@later'; pane=await TPANE.make($('.tp')); const sl=(f,k,label,min,max,step,id,a)=>BL[k]=hook(f.addBinding(V,k,{label,min,max,step}),id,a);
    const bt=(f,title,id,fn,a,k)=>{ const b=hook(f.addButton({title}),id,a,'button'); b.on('click',fn); if(k)BL[k]=b; return b; };
    const sh=BL.shape=pane.addFolder({title:'TURN AND SIZE'});
    sl(sh,'rx','PITCH',-180,180,1,'wrx'); sl(sh,'rz','ROLL',-180,180,1,'wrz'); sl(sh,'sz','SIZE',.2,3,.01,'wsz');
    sl(sh,'s0','WIDTH',.2,3,.01); sl(sh,'s1','HEIGHT',.2,3,.01); sl(sh,'s2','DEPTH',.2,3,.01);
    const co=BL.colour=pane.addFolder({title:'COLOUR'});
    BL.col=hook(co.addBinding(V,'col',{label:'COLOUR'}),'wcol','data-prow'); bt(co,'NO COLOUR','wcol0',()=>change(e=>{ e.col='#ffffff'; }),'data-prow','col0');
    sl(co,'bri','BRIGHTNESS',.2,2,.01,'wbri','data-prow'); sl(co,'op','SEE-THROUGH',0,.9,.01,'wop','data-prow');
    const li=BL.lite=hook(pane.addFolder({title:'LIGHT'}),null,'data-lrow');
    sl(li,'li','BRIGHTNESS',0,3,.01,'wlbri'); hook(li.addBinding(V,'lcol',{label:'LIGHT COLOUR'}),'wlcol'); bt(li,'NO LIGHT COLOUR','wlcol0',()=>changeLite(s=>{ s.lcol=null; })); sl(li,'ldist','RANGE',1,40,.5,'wldist');
    const sg=BL.sign=hook(pane.addFolder({title:'SIGN'}),null,'data-srow');
    sl(sg,'sbri','GLOW',.2,2.5,.01,'wsbri'); hook(sg.addBinding(V,'scol',{label:'GLOW COLOUR'}),'wscol'); bt(sg,'NO GLOW COLOUR','wscol0',()=>{ changeSign(st=>{ st.scol=null; }); draw(); });
    bt(sg,'BACK AS IT WAS','wsback',()=>{ if(!sel||!sel.sign)return; delete ST[signKey(sel)]; sel.ref.set&&sel.ref.set({text:null,bri:null,col:null}); save(); draw(); });
    const ac=BL.acts=pane.addFolder({title:'THIS THING'}); bt(ac,'COPY','wcopy',copy); bt(ac,'DELETE','wdel',()=>{ change(e=>{ e.del=true; }); sel=null; frame(); draw(); });
    bt(ac,'BACK AS IT WAS','wback',()=>{ change(e=>{ Object.assign(e,E0()); }); if(sel&&sel.lite){ const k=sel.liteKey; ST[k]=E0L(); applyLight(sel.lite,ST[k]); delete ST[k]; settle(); save(); draw(); } });
    const al=pane.addFolder({title:'EVERY EDIT'}); bt(al,'EVERYTHING BACK','wall',allBack); bt(al,'EXPORT','wexp',exp); bt(al,'IMPORT','wimp',()=>$('#wimpf').click());
    bt(pane,'DONE (SHIFT+E)','wout',()=>WE.toggle()); draw(); };
  const exp=()=>{ const blob=new Blob([JSON.stringify(ST,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='world-edits.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2e3); };
  $('#wimpf').onchange=async ev=>{ '@later'; const f=ev.target.files&&ev.target.files[0]; ev.target.value=''; if(!f)return; try{ const j=JSON.parse(await f.text()); Object.assign(ST,j); for(const o of OBJS)if(ST[kid(o)])apply(o); applyWED(); applyCopies(); applyLights(); applySigns(); settle(); save(); frame(); draw(); }catch(e){} };
  const copy=()=>{ '@later'; if(!sel||sel.sign)return; const src=stOf(sel), [r]=ground(); let at, of, rad=0;
    let pf=null; if(sel.copy){ const e=ST[sel.key]; at=[e.at[0]+e.t[0],e.at[1]+e.t[1],e.at[2]+e.t[2]]; of=e.of; pf=e.pf||null; if(pf){ const g=CP.get(sel.key); if(g){ const b=new THREE.Box3().setFromObject(g); rad=Math.max(b.max.x-b.min.x,b.max.z-b.min.z)/2; } } } else if(sel.prop||sel.obj){ at=[sel.pivot[0]+src.t[0],sel.pivot[1]+src.t[1],sel.pivot[2]+src.t[2]]; of=keyOf(sel); if(sel.obj){ const b=new THREE.Box3().setFromObject(sel.ob); rad=Math.max(b.max.x-b.min.x,b.max.z-b.min.z)/2; } }
    else { const B=base(sel), c=sel.c; at=[c.x+src.t[0],c.y+src.t[1],c.z+src.t[2]]; of=kid(sel); for(const a of B)for(let i=0;i<18;i+=3)rad=Math.max(rad,Math.hypot(a[i]-c.x,a[i+2]-c.z)); }
    const h=fromWED(of), it=h&&h.it; if(it&&it.r)rad=it.r; const w=Math.max(.6*T,rad*2+.3*T);
    const k=WE.newKey(); ST[k]=Object.assign(E0(),{copy:sel.name,of,pf,place:sel.place,at:[at[0]+r.x*w,at[1],at[2]+r.z*w],r:src.r||0,rx:src.rx||0,rz:src.rz||0,s:src.s.slice()});
    if(!copyMesh(k)){ delete ST[k]; return; } sel=copyHandle(k); applyCopy(sel); settle(); save(); frame(); draw(); };
  WE.newKey=()=>{ let k; do k='C|'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); while(ST[k]); return k; };
  // PLACE (099a): a new Polyfork thing at a spot, picked so it edits like anything else
  WE.addPf=(pf,name,at,r)=>{ const k=WE.newKey(); ST[k]=Object.assign(E0(),{copy:name,pf,place:'street',at,r:r||0}); applyCopy({key:k});
    const g=CP.get(k), S=g&&g.userData.sol, m=.3*T; if(S&&pos.x>S[0]-m&&pos.x<S[2]+m&&pos.z>S[1]-m&&pos.z<S[3]+m){ ST[k].del=true; applyCopy({key:k}); delete ST[k]; settle(); return null; }   // never on top of you: it is solid and would hold you
    sel=copyHandle(k); settle(); save(); frame(); draw(); return k; };
  // an entry that changes nothing (picked, never moved): not an edit
  WE.blank=e=>{ if(!e||typeof e!=='object')return false; const j=JSON.stringify(e); return j===JSON.stringify(E0())||j===JSON.stringify(E0L()); };
  WE.ground=e=>{ const r=renderer.domElement.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)),SHARED.cam);
    const y=SHARED.py!=null?SHARED.py:0, q=new THREE.Vector3(); if(!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-y),q))return null; const gy=SHARED.groundY?SHARED.groundY(q.x,q.z):null; if(gy!=null&&isFinite(gy))q.y=gy; return [q.x,q.y,q.z]; };
  const allBack=()=>{ '@later'; if(!confirm('Put everything back as it was?'))return; for(const k of Object.keys(ST))if(k[0]==='C'&&k[1]==='|'){ ST[k].del=true; applyCopy({key:k}); delete ST[k]; } for(const o of OBJS){ const k=kid(o); if(ST[k]){ ST[k]=E0(); apply(o); delete ST[k]; } }
    for(const en of ents())for(let bid=0;bid<en.ids.length;bid++){ const h=propHandle(en,bid), k=keyOf(h); if(ST[k]){ ST[k]=E0(); applyProp(h); } }
    for(const en of WED.meshes)for(let bid=0;bid<en.ids.length;bid++){ const k=keyOf(propHandle(en,bid)); if(ST[k])delete ST[k]; }
    for(const L of sceneLights()){ const k=litKey(L); if(ST[k]){ ST[k]=E0L(); applyLight(L,ST[k]); delete ST[k]; } }
    for(const sg of SIGNS.list){ const k='S|'+sg.place+'|'+sg.name; if(ST[k]){ sg.set&&sg.set({text:null,bri:null,col:null}); delete ST[k]; } } settle(); save(); frame(); draw(); };
  let busy=null;
  WE.copies=()=>[...CP.keys()];
  // every player who has played before edits, in the isometric view only (owner, 7 Nov 2026)
  WE.iso=()=>UI.view==='iso'&&!UI.freeCam;
  WE.key=()=>{ if(WE.on)return WE.toggle(); if(WE.may&&!WE.may()){ UI.log&&UI.log('The world editor opens from your second visit.','#e8a23a'); return; }
    if(!WE.iso()){ UI.log&&UI.log('Edit the world in the isometric view (V).','#e8a23a'); return; } return WE.toggle(); };
  { let was=null; SYS.every(()=>{ const lk=WE.on&&!WE.iso(); if(lk===was)return; was=lk; P.classList.toggle('lock',lk); $('#welock').hidden=!lk; if(lk&&drag){ drag=null; settle(); save(); } },250,'099-welock'); }
  WE.toggle=()=>{ WE.on=!WE.on; P.hidden=!WE.on; if(!WE.on){ sel=null; frame(); } draw(); UI.badge&&UI.badge();
    if(WE.on&&!busy)busy=build().catch(e=>{ busy=null; $('#wmsg').textContent='PANEL DID NOT LOAD: '+e.message; }); return WE.on?busy:Promise.resolve(); };
  const vis=m=>{ let q=m; while(q){ if(!q.visible)return false; q=q.parent; } return true; };
  const ray=new THREE.Raycaster(), meshes=()=>[...new Set(OBJS.flatMap(o=>o.parts.map(p=>p.me)))].filter(vis);
  const wedOf=o=>{ for(const en of WED.meshes)if(en.me===o)return en; return null; };
  const pickSet=()=>{ const s=meshes(); for(const g of CP.values())if(g.visible)s.push(...g.children); for(const en of ents())if(vis(en.me))s.push(en.me); for(const sg of SIGNS.list)if(sg.me&&vis(sg.me))s.push(sg.me); for(const en of objs()){ if(!vis(en.obj))continue; objFirst(en); for(const [m] of en.m0)s.push(m); } return s; };
  WE.can=o=>!!o;   // everything, buildings and streets too, for everyone (owner, 7 Nov 2026); a player's edits still reach others only through the owner's APPROVE
  const hitAt=e=>{ const h=hitAt0(e)||hitWorld(e); return h&&WE.can(h.o)?h:null; };
  const hitWorld=e=>{ '@later'; const r=renderer.domElement.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)),SHARED.cam);
    for(const h of ray.intersectObject(scene,true)){ const m=h.object; if(!plainMesh(m))continue; const o=objHandle(asWorld(m)), st=ST[keyOf(o)]; if(st&&st.del)return null; return {o,p:h.point}; } return null; };
  const hitAt0=e=>{ '@later'; const r=renderer.domElement.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)),SHARED.cam);
    for(const h of ray.intersectObjects(pickSet(),false)){ if(h.object.userData.weCopy&&ST[h.object.userData.weCopy])return {o:copyHandle(h.object.userData.weCopy),p:h.point}; if(h.object.userData.weObj){ const o=objHandle(h.object.userData.weObj), st=ST[keyOf(o)]; if(st&&st.del)return null; return {o,p:h.point}; } const sg=sgOf(h.object); if(sg)return {o:{sign:true,ref:sg,name:sg.name,place:sg.place,me:sg.me},p:h.point}; const en=wedOf(h.object);
      if(en){ const bid=h.batchId==null?h.instanceId:h.batchId; if(bid==null||en.ids[bid]==null)return null; const o=propHandle(en,bid), s=ST[keyOf(o)]; if(s&&s.del)return null; return {o,p:h.point}; }
      const o=h.object.userData.objOf&&h.object.userData.objOf[Math.floor(h.faceIndex/2)]; if(o&&!(ST[kid(o)]&&ST[kid(o)].del))return {o,p:h.point}; return null; } return null; };
  WE.pick=e=>{ if(!WE.iso())return; const h=hitAt(e); sel=h?h.o:null; if(sel&&!sel.sign){ if(!sel.prop&&!sel.copy&&!sel.obj)base(sel); sel.lite=null; const L=nearLight(h.p,9*T); if(L){ litOrig(L); sel.lite=L; sel.liteKey=litKey(L); } } frame(); draw(); };
  WE.down=e=>{ if(WE.on&&WE.iso()&&WE.placeDown&&WE.placeDown(e))return true; if(!WE.on||!WE.iso()||!sel||sel.sign||e.button!==0)return false; const h=hitAt(e); if(!h||h.o.sign||keyOf(h.o)!==keyOf(sel))return false; drag={y:h.p.y,last:h.p.clone()}; return true; };
  WE.move=e=>{ '@later'; if(!drag)return; const r=renderer.domElement.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)),SHARED.cam);
    const pl=new THREE.Plane(new THREE.Vector3(0,1,0),-drag.y), q=new THREE.Vector3(); if(!ray.ray.intersectPlane(pl,q))return; const dx=q.x-drag.last.x, dz=q.z-drag.last.z; drag.last.copy(q);
    const s=stOf(sel); s.t[0]+=dx; s.t[2]+=dz; applySel(sel); frame(); };
  WE.up=()=>{ if(!drag)return; drag=null; settle(); save(); };
  Object.defineProperty(WE,'dragging',{get:()=>!!drag});
  // the editor's instanced things (bricks, rocks, lanterns...) answer rays only while editing: the camera's every-frame ray skips them
  { const gate=en=>{ const m=en&&en.me; if(!m||!m.isInstancedMesh||m.userData.weOnly)return; m.userData.weOnly=1; const r0=m.raycast; m.raycast=function(r,i){ if(WE.on)r0.call(this,r,i); }; };
    WED.meshes.forEach(gate); const p0=WED.meshes.push.bind(WED.meshes); WED.meshes.push=(...a)=>{ a.forEach(gate); return p0(...a); }; }
  WE.dbgWobj=(f,i=0)=>{ const en=objs().filter(f)[i]; if(!en)return null; sel=objHandle(en); frame(); draw(); return keyOf(sel); };
  WE.dbgWorld=(near=40*T)=>{ let m=null; scene.traverse(q=>{ if(m||!plainMesh(q))return; q.updateMatrixWorld(); const p=new THREE.Vector3().setFromMatrixPosition(q.matrixWorld); if(Math.hypot(p.x-pos.x,p.z-pos.z)<near&&q.geometry&&q.geometry.attributes.position.count>24)m=q; }); if(!m)return null; sel=objHandle(asWorld(m)); frame(); draw(); return keyOf(sel); };
  WE.dbgSelObj=()=>sel&&sel.ob; WE.dbgObjs=()=>objs();
  WE.dbgProps=()=>ents(); WE.baked=()=>BAKED; WE.dbgPick=(mi,bid)=>{ const en=ents()[mi]; if(!en||en.ids[bid]==null)return null; sel=propHandle(en,bid); frame(); draw(); return keyOf(sel); };
  WE.dbgSel=()=>sel; WE.dbgLinked=()=>sel?linked(sel).length:0; WE.dbgObj=(name,i=0)=>{ const o=OBJS.filter(q=>q.name===name)[i]; if(!o)return null; base(o); sel=o; sel.lite=null; frame(); draw(); return kid(o); };
  WE.dbgLights=()=>sceneLights().length; WE.dbgSelLight=i=>{ const L=sceneLights()[i]; if(!L)return null; litOrig(L); sel={name:'TEST',place:'world',prop:true,pivot:[0,0,0],lite:L,liteKey:litKey(L)}; draw(); return {key:litKey(L),i0:L.userData.i0,intensity:+L.intensity.toFixed(3)}; };
  WE.dbgSigns=()=>SIGNS.list.map(s=>s.name); WE.dbgSelSign=i=>{ const sg=SIGNS.list[i]; if(!sg)return null; sel={sign:true,ref:sg,name:sg.name,place:sg.place,me:sg.me}; draw(); return {key:signKey(sel),has:!!sg.set}; };
  WE.dbgSignMat=i=>{ const sg=SIGNS.list[i]; if(!sg||!sg.me)return null; const m=sg.me.material, mm=Array.isArray(m)?(m.find(x=>x&&x.color&&x.map)||m[0]):m; if(!mm||!mm.color)return null; const c=mm.color; return [+c.r.toFixed(2),+c.g.toFixed(2),+c.b.toFixed(2)]; };
}
