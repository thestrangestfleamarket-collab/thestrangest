// THE MIRROR: past each end of Market St the street's own band drawn again, mirrored at the forcefield and clipped to the band, kept in step with what the street paints near you (data/world.json edge.mirror).
import {SHARED, THREE} from './003-shx.js';
import {CULL, pos} from './003b-systems.js';
import {scene} from './004-main.js';
import {LEVEL, MAPG, SYS, TILE} from './006-map-pre.js';
const MIRROR={n:0,on:false}; window.MIRROR=MIRROR;
SYS.onStart(()=>{ const C=LEVEL.edge&&LEVEL.edge.mirror; if(!C)return; MIRROR.on=true;
  const XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS, T=TILE, R=(C.reach||150)*T, SHOW=(C.show||220)*T, za=Math.min(ZS(C.band[0]),ZS(C.band[1])), zb=Math.max(ZS(C.band[0]),ZS(C.band[1]));
  const G=new THREE.Group(); G.name='mirror'; G.matrixAutoUpdate=false; scene.add(G);
  const SIDES=[{X:XS(C.x[1]),s:1},{X:XS(C.x[0]),s:-1}].map(S=>({...S,M:new THREE.Matrix4().set(-1,0,0,2*S.X,0,1,0,0,0,0,1,0,0,0,0,1),on:true,
    clip:[new THREE.Plane(new THREE.Vector3(0,0,1),-za),new THREE.Plane(new THREE.Vector3(0,0,-1),zb),new THREE.Plane(new THREE.Vector3(S.s,0,0),-S.s*S.X),new THREE.Plane(new THREE.Vector3(-S.s,0,0),S.s*S.X+R)],mats:new Map()}));
  const F=new THREE.Frustum(), PM=new THREE.Matrix4(), P=new THREE.Vector3(), SMALL=(C.small||60)*T;
  const OK=/^Mesh(Lambert|Basic|Phong|Standard|Toon)Material$/, B=new THREE.Box3(), clones=new Map();
  const mat=(S,m)=>{ let c=S.mats.get(m); if(c)return c; c=m.clone(); c.onBeforeCompile=m.onBeforeCompile; if(m.customProgramCacheKey!==THREE.Material.prototype.customProgramCacheKey)c.customProgramCacheKey=m.customProgramCacheKey;
    c.clippingPlanes=S.clip; c.clipIntersection=false; c.clipShadows=false; c.polygonOffset=true; c.polygonOffsetFactor=-1; c.polygonOffsetUnits=-2; c.userData.mirror=1; S.mats.set(m,c); return c; };
  const fit=o=>{ if(!(o.isMesh||o.isInstancedMesh)||o.isSkinnedMesh||o.userData.haze||o.userData.cullOf||o.userData.mirror||o.userData.noMirror)return false; const ms=[].concat(o.material); if(!ms.length||ms.some(m=>!m||!OK.test(m.type)))return false;
    if(o.isInstancedMesh){ if(!o.boundingBox)o.computeBoundingBox(); B.copy(o.boundingBox).applyMatrix4(o.matrixWorld); } else { const g=o.geometry; if(!g||!g.attributes.position)return false; if(!g.boundingBox)g.computeBoundingBox(); B.copy(g.boundingBox).applyMatrix4(o.matrixWorld); }
    return B.max.z>za&&B.min.z<zb; };
  const make=(o,S)=>{ const ms=Array.isArray(o.material)?o.material.map(m=>mat(S,m)):mat(S,o.material); let c;
    if(o.isInstancedMesh){ c=new THREE.InstancedMesh(o.geometry,ms,o.count); c.instanceMatrix=o.instanceMatrix; c.instanceColor=o.instanceColor; } else c=new THREE.Mesh(o.geometry,ms);
    c.matrixAutoUpdate=false; c.castShadow=false; c.receiveShadow=o.receiveShadow; c.frustumCulled=o.frustumCulled; c.renderOrder=o.renderOrder; c.raycast=()=>{}; c.userData.mirror=1; c.userData.src=o; c.userData.side=S; { if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere(); const r=o.geometry.boundingSphere.radius*o.matrixWorld.getMaxScaleOnAxis(); c.userData.small=o.isInstancedMesh?r<1.5*TILE:r<2*TILE; } G.add(c); MIRROR.n++; return c; };
  // a big mesh is mirrored as only its triangles that reach the band (the same attributes, a shorter index): what the clipping keeps is the same, the rest is never sent to be clipped
  const drop=c=>{ const s=c.geometry; if(!s||!s.userData.mirrorPart)return; s.attributes={}; s.morphAttributes={}; s.dispose(); };   // its index only: the attributes are the original's
  const trim=(c,o,S)=>{ const g=o.geometry, P=g.attributes.position, I=g.index, n=I?I.count:P?P.count:0, e=o.matrixWorld.elements, u=c.userData, v=g.id+':'+(P&&P.version)+':'+(I?I.version:0)+':'+n+':'+e.join();
    if(u.tP===P&&u.tI===I&&u.tv===v)return; u.tP=P; u.tI=I; u.tv=v;
    const use=geo=>{ if(c.geometry!==geo){ drop(c); c.geometry=geo; } };
    if(!P||n<9000||Array.isArray(o.material)&&g.groups.length||g.morphAttributes.position||g.drawRange.start>0||g.drawRange.count<n)return use(g);
    const x0=(S.s>0?S.X-R:S.X)-.01*T, x1=(S.s>0?S.X:S.X+R)+.01*T, z0=za-.01*T, z1=zb+.01*T, K=new (P.count>65535?Uint32Array:Uint16Array)(n); let m=0;
    for(let t=0;t<n;t+=3){ let ax=1e30, bx=-1e30, az=1e30, bz=-1e30; for(let j=0;j<3;j++){ const q=I?I.getX(t+j):t+j, x=P.getX(q), y=P.getY(q), z=P.getZ(q), wx=e[0]*x+e[4]*y+e[8]*z+e[12], wz=e[2]*x+e[6]*y+e[10]*z+e[14];
        if(wx<ax)ax=wx; if(wx>bx)bx=wx; if(wz<az)az=wz; if(wz>bz)bz=wz; }
      if(bx>=x0&&ax<=x1&&bz>=z0&&az<=z1){ for(let j=0;j<3;j++)K[m++]=I?I.getX(t+j):t+j; } }
    if(m>n*.8)return use(g);
    const s=new THREE.BufferGeometry(); for(const k in g.attributes)s.setAttribute(k,g.attributes[k]); s.setIndex(new THREE.BufferAttribute(K.slice(0,m),1));
    if(!g.boundingSphere)g.computeBoundingSphere(); if(!g.boundingBox)g.computeBoundingBox(); s.boundingSphere=g.boundingSphere; s.boundingBox=g.boundingBox; s.userData.mirrorPart=1; use(s); };
  MIRROR.tris=()=>{ let a=0, b=0; for(const c of clones.values()){ if(c.isInstancedMesh)continue; const s=c.geometry, o=c.userData.src.geometry; a+=(s.index?s.index.count:s.attributes.position.count)/3; b+=(o.index?o.index.count:o.attributes.position.count)/3; } return {sent:Math.round(a),whole:Math.round(b)}; };
  MIRROR.foreign=()=>G.children.filter(c=>!c.userData.side).map(c=>c.type+' '+c.name);
  const shown=o=>{ for(let p=o;p;p=p.parent){ if(!p.visible)return false; if(p===scene)return true; } return false; };
  const near=S=>S.s>0?B.min.x<S.X&&B.max.x>S.X-R:B.max.x>S.X&&B.min.x<S.X+R;
  const scan=()=>{ const seen=new Set();
    for(const k of C.groups||[]){ const g=MAPG[k]; if(!g)continue; g.updateMatrixWorld(); g.traverse(o=>{ if(!fit(o))return; for(const S of SIDES){ if(!near(S))continue; const key=o.uuid+S.s; seen.add(key); let c=clones.get(key); if(!c)clones.set(key,c=make(o,S)); c.matrix.multiplyMatrices(S.M,o.matrixWorld); c.matrixWorld.copy(c.matrix); if(o.isInstancedMesh)c.count=o.count; else trim(c,o,S);
      const bx=c.userData.box||(c.userData.box=new THREE.Box3()), x0=2*S.X-B.max.x, x1=2*S.X-B.min.x; bx.min.set(Math.max(x0,S.s>0?S.X:S.X-R),B.min.y,Math.max(B.min.z,za)); bx.max.set(Math.min(x1,S.s>0?S.X+R:S.X),B.max.y,Math.min(B.max.z,zb)); } }); }
    let gone=false; for(const [k,c] of clones)if(!seen.has(k)){ G.remove(c); drop(c); clones.delete(k); MIRROR.n--; gone=true; }
    if(gone){ const used=new Set(); for(const c of clones.values())for(const m of [].concat(c.material))used.add(m); for(const S of SIDES)for(const [m,c] of S.mats)if(!used.has(c)){ c.dispose(); S.mats.delete(m); } } };
  // (small things in the mirrored street drawn only within SMALL of you: owner, 8 Nov 2026: "i want to make sure arent rendering things are levels we dont need to from things far away")
  let t=1; SYS.add('life',dt=>{ for(const S of SIDES)S.on=Math.abs(pos.x-S.X)<SHOW; if((t+=dt)>1){ t=0; scan(); }
    P.set(pos.x,SHARED.py||0,pos.z); const cam=SHARED.cam; if(cam){ cam.updateMatrixWorld(); PM.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); F.setFromProjectionMatrix(PM); }
    for(const c of clones.values()){ const S=c.userData.src, b=c.userData.box; c.visible=c.userData.side.on&&!!b&&!b.isEmpty()&&(!(CULL.R>0)||b.distanceToPoint(P)<CULL.R)&&!(c.userData.small&&b.distanceToPoint(P)>SMALL)&&(!cam||F.intersectsBox(b))&&shown(S); } },'161d-mirror');
  MIRROR.stat=()=>({n:MIRROR.n,sides:SIDES.map(S=>({X:S.X,on:S.on,mats:S.mats.size}))}); },'mirror');
