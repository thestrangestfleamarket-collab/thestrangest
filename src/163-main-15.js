// THE START: every system's init, the first ground patches, where you stand, and __started.
import {SHARED, THREE} from './003-shx.js';
import {AMB, CLIP, CLOCK, CULL, DRONE, ED, GHOSTS, INTERIORS, keys, LINES, LITE, LIVES, LOOKS, NPCS, PARK, PERFX, pos, ROOMS, SFX, SNDED, st, UI, VIT, W3, WEEDS, WHERE} from './003b-systems.js';
import {art, PPU, pxS, renderer, RES, resize, scene, SCL, vpu} from './004-main.js';
import {SAVE} from './005-save.js';
import {applyTime, AWAY, CASTLE, cutWalls, DITH, FIX, FREE, lamps, LAY, MAPG, MAPSTAIR, MODS, QS, RING, SOL, STORE, TILE} from './006-map-pre.js';
import {OBJS} from './008-batch.js';
import {OUTL} from './072-walker3d.js';
import {collide, frame} from './075-main-13.js';
import {BVH} from './137-bvh.js';
import {NEWS} from './147-newsstand.js';
import {ROOFS} from './148-rooftops.js';
import {GATES} from './148a-gates.js';
import {DRAINS} from './148b-drains.js';
import {GPH} from './150-loose.js';
import {NAV} from './153-nav.js';

GATES.init(); DRAINS.init(); CLIP.run(); WEEDS.init(); WEEDS.lawnInit(); DRONE.init(); NEWS.init(); ROOFS.init(); GHOSTS.init(); GPH.init(); LIVES.init(); LITE.init(); SHARED.BODB.gnear(pos.x,pos.z,SHARED.BODB.GR); { const w=WHERE.saved(), P=UI.places().find(p=>p[0]==='CENTRAL PARK'), s=w&&Number.isFinite(w.x)?w:P&&{x:P[1],z:P[2]}; if(s)SHARED.BODB.gnear(s.x,s.z,SHARED.BODB.GR); if(!w&&P&&!['at','place','sheet','npcat','fresh'].some(k=>QS.get(k)!=null))pos.set(P[1],0,P[2]); } if(PARK.within(pos.x,pos.z)&&!PARK.ready){ await PARK.load(); PARK.show(true); } PERFX.split(); CULL.scan(); PERFX.maps(); INTERIORS.build(); STORE.later(); setTimeout(BVH.load,2500); setTimeout(NAV.load,4000); window.__started=true; LOAD('later'); window.__scene=scene; window.LIVES=LIVES; window.__rigst=()=>st; window.__dbg={CULL,VIT,ED,W3,PERFX,LIVES,BVH,NAV,MAPK:{BOD:SHARED.BOD,RING,CASTLE,LAY,PARK,MAPSTAIR,MODS,cutWalls,AWAY:typeof AWAY!=='undefined'?AWAY:null},face:r=>{ SHARED.yaw=SHARED.yawTo=r; },clock:window.CLOCK,far3:window.FAR3,npcs:()=>NPCS,ui:()=>UI,you:()=>({x:pos.x,y:SHARED.py,z:pos.z,h:SHARED.heading,sx:UI.snD?UI.snD.x:0}),info:()=>renderer.info.render,gl:()=>{ const g=renderer.getContext(), x=g.getExtension('WEBGL_debug_renderer_info'); return x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):''; },tris:()=>{ '@later'; const F=new THREE.Frustum(), M=new THREE.Matrix4().multiplyMatrices(SHARED.cam.projectionMatrix,SHARED.cam.matrixWorldInverse); F.setFromProjectionMatrix(M); let n=0; scene.traverseVisible(o=>{ if(!o.isMesh&&!o.isPoints&&!o.isLine)return; if(o.frustumCulled&&!F.intersectsObject(o))return; const g=o.geometry; if(!g)return; const c=g.index?g.index.count:g.attributes.position?g.attributes.position.count:0, d=g.drawRange, k=Math.min(c,d.count===Infinity?c:d.count); n+=(o.isMesh?k/3:o.isPoints?k:k/2)*(o.isInstancedMesh?o.count:1); }); return Math.round(n); },pos:()=>[pos.x,SHARED.py,pos.z],OBJS,SOL,FIX,NPCS,renderer,scene,THREE,camera:SHARED.cam,MAPG,LITE,lamps,INTERIORS,SAVE,SFX,AMB,LINES,SNDED,LOOKS,OUTL,DITH,ground:(x,z)=>SHARED.groundY(x,z),lvl:()=>SHARED.LVL,CLOCK,WHERE,ROOMS,hd:()=>SHARED.heading,setHd:h=>{ SHARED.heading=h; },setRes:i=>{ SHARED.RESI=i; resize(); },res:()=>SHARED.RESI,UI,yaw:()=>[SHARED.yaw,SHARED.yawTo],px:()=>[SCL,RES(),pxS(),vpu()/art()],cam:(y,p,z,d)=>{ if(y!=null)SHARED.yawTo=y; if(p!=null)SHARED.pitchTo=p; if(z!=null)SHARED.ppuTo=z; if(d!=null)UI.dist=d; },cv:()=>({yaw:SHARED.yaw,pitch:SHARED.pitch,ppu:SHARED.ppu,PPU,dist:UI.dist,TILE,heading:SHARED.heading,keys:[...keys],look:UI.look}),camO:()=>SHARED.cam,go:(x,z)=>{ SHARED.target=new THREE.Vector3(x,SHARED.py,z); },collide:(x,z)=>{ const p={x,z}; collide(p); return [p.x,p.z]; }};
{ const t0=performance.now(), PL=[0,1,2,3,4,5].map(()=>new THREE.Plane(new THREE.Vector3(0,1,0),1e6)); if(FREE)ROOMS.nearAll(); renderer.setRenderTarget(SHARED.composer.readBuffer); renderer.compile(scene,SHARED.cam);
  if(!FREE){ renderer.clippingPlanes=PL; renderer.render(new THREE.Scene(),SHARED.cam); renderer.compile(scene,SHARED.cam); renderer.clippingPlanes=[]; } renderer.setRenderTarget(null);
  window.WARMMS=Math.round(performance.now()-t0); }
resize(); applyTime(0); requestAnimationFrame(frame);
