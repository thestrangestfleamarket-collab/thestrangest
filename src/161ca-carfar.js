// THE FAR CARS: a car on the road (the traffic, 150pb) or parked (150p) past the detail distance is drawn in a few pieces, one for each of its looks (paint, chrome, glass, glow…: its body, wheels, doors, kit and inside merged at rest) instead of forty and more; near, the car as it is (owner, 10 Nov 2026: far cars in fewer draws).
import {SHARED, THREE} from './003-shx.js';
import {VLOOK} from './003b-systems.js';
import {MODS, SYS, TILE} from './006-map-pre.js';
import {TRAFFIC} from './150pb-traffic.js';
import {MERGE} from './161c-merge.js';
const CARFAR={}; window.CARFAR=CARFAR;
{ const GEO={}, LIVE=new Set(), V=new THREE.Vector3();
  // what goes in: a still, plain mesh (no picture, nothing drawn its own way); the pieces of one look (material, colour, glow, shine) merged into one, each piece's colour in its corners
  const keyOf=(o,m)=>[m.type,m.side,m.transparent?1:0,m.opacity,m.emissive?m.emissive.getHexString()+':'+m.emissiveIntensity:'',m.metalness??'',m.roughness??'',m.envMap?m.envMap.uuid:'',m.flatShading?1:0,m.toneMapped?1:0,m.depthWrite?1:0,o.castShadow?1:0,o.renderOrder].join('|');
  const groups=m=>{ const G=new Map(); m.updateMatrixWorld(true); const walk=o=>{ if(!o.visible||o.userData.carFar)return; const mt=o.material;
      if(o.isMesh&&!o.isInstancedMesh&&!o.isSkinnedMesh&&mt&&!Array.isArray(mt)&&!mt.map&&!(mt.alphaTest>0)&&!o.morphTargetInfluences&&o.geometry&&o.geometry.attributes.position){ const k=keyOf(o,mt); let g=G.get(k); if(!g)G.set(k,g={L:[],o}); g.L.push(o); }
      for(const c of o.children)walk(c); }; walk(m); return [...G.values()]; };
  const bake=m=>groups(m).map(({L,o})=>{ const mt=o.material.clone(); mt.vertexColors=true; if(mt.color)mt.color.set(1,1,1); return {geo:MERGE.geo(L,m),mat:mt,cast:o.castShadow,rec:o.receiveShadow,ro:o.renderOrder}; });
  const farOf=(k,m)=>{ const B=GEO[k]||(GEO[k]=bake(m)); if(!B.length)return null; const F=new THREE.Group(); F.userData.carFar=1; F.visible=false;
    for(const b of B){ const me=new THREE.Mesh(b.geo,b.mat); me.castShadow=b.cast; me.receiveShadow=b.rec; me.renderOrder=b.ro; me.raycast=()=>{}; F.add(me); } m.add(F); return F; };
  const set=(m,far)=>{ const U=m.userData, F=U.far; if(!!U.isFar===far)return; U.isFar=far;
    if(far){ U.farHid=m.children.filter(c=>c!==F&&c.visible); for(const c of U.farHid)c.visible=false; F.visible=true; }
    else { for(const c of U.farHid||[])c.visible=true; U.farHid=null; F.visible=false; } };
  const drop=()=>{ for(const m of LIVE){ set(m,false); const F=m.userData.far; if(F)F.removeFromParent(); m.userData.far=null; } LIVE.clear(); for(const k in GEO){ for(const b of GEO[k]){ b.geo.dispose(); b.mat.dispose(); } delete GEO[k]; } };
  VLOOK.on(drop);
  CARFAR.R=()=>80*TILE*(SHARED.lodK||.5); CARFAR.drop=drop; CARFAR.n=()=>[...LIVE].filter(m=>m.userData.isFar&&m.visible).length;
  const one=(m,k,R,cp)=>{ if(!m||!m.visible||!k)return; const U=m.userData;
    if(U.farK!==k){ if(U.far){ set(m,false); U.far.removeFromParent(); } U.far=farOf(k,m); U.farK=k; if(U.far)LIVE.add(m); }
    if(!U.far)return; const d=m.getWorldPosition(V).distanceTo(cp); set(m,U.isFar?d>R*.95:d>R*1.05); };
  // the traffic's copies, and the parked cars (150p: a parked one is hidden while it is driven; the driven one is its own)
  SYS.add('life',()=>{ const cam=SHARED.cam; if(!cam)return; const R=CARFAR.R(), cp=cam.position;
    for(const L of TRAFFIC.lanes||[])for(const C of L.cars)one(C.m,C.model,R,cp);
    if(MODS.cars&&MODS.cars.cars)for(const C of MODS.cars.cars.values())one(C.mesh,C.model,R,cp); },'161ca-carfar'); }
