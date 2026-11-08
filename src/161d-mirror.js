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
  MIRROR.foreign=()=>G.children.filter(c=>!c.userData.side).map(c=>c.type+' '+c.name);
  const shown=o=>{ for(let p=o;p;p=p.parent){ if(!p.visible)return false; if(p===scene)return true; } return false; };
  const near=S=>S.s>0?B.min.x<S.X&&B.max.x>S.X-R:B.max.x>S.X&&B.min.x<S.X+R;
  const scan=()=>{ const seen=new Set();
    for(const k of C.groups||[]){ const g=MAPG[k]; if(!g)continue; g.updateMatrixWorld(); g.traverse(o=>{ if(!fit(o))return; for(const S of SIDES){ if(!near(S))continue; const key=o.uuid+S.s; seen.add(key); let c=clones.get(key); if(!c)clones.set(key,c=make(o,S)); c.matrix.multiplyMatrices(S.M,o.matrixWorld); c.matrixWorld.copy(c.matrix); if(o.isInstancedMesh)c.count=o.count;
      const bx=c.userData.box||(c.userData.box=new THREE.Box3()), x0=2*S.X-B.max.x, x1=2*S.X-B.min.x; bx.min.set(Math.max(x0,S.s>0?S.X:S.X-R),B.min.y,Math.max(B.min.z,za)); bx.max.set(Math.min(x1,S.s>0?S.X+R:S.X),B.max.y,Math.min(B.max.z,zb)); } }); }
    let gone=false; for(const [k,c] of clones)if(!seen.has(k)){ G.remove(c); clones.delete(k); MIRROR.n--; gone=true; }
    if(gone){ const used=new Set(); for(const c of clones.values())for(const m of [].concat(c.material))used.add(m); for(const S of SIDES)for(const [m,c] of S.mats)if(!used.has(c)){ c.dispose(); S.mats.delete(m); } } };
  // (small things in the mirrored street drawn only within SMALL of you: owner, 8 Nov 2026: "i want to make sure arent rendering things are levels we dont need to from things far away")
  let t=1; SYS.add('life',dt=>{ for(const S of SIDES)S.on=Math.abs(pos.x-S.X)<SHOW; if((t+=dt)>1){ t=0; scan(); }
    P.set(pos.x,SHARED.py||0,pos.z); const cam=SHARED.cam; if(cam){ cam.updateMatrixWorld(); PM.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); F.setFromProjectionMatrix(PM); }
    for(const c of clones.values()){ const S=c.userData.src, b=c.userData.box; c.visible=c.userData.side.on&&!!b&&!b.isEmpty()&&(!(CULL.R>0)||b.distanceToPoint(P)<CULL.R)&&!(c.userData.small&&b.distanceToPoint(P)>SMALL)&&(!cam||F.intersectsBox(b))&&shown(S); } },'161d-mirror');
  MIRROR.stat=()=>({n:MIRROR.n,sides:SIDES.map(S=>({X:S.X,on:S.on,mats:S.mats.size}))}); },'mirror');
