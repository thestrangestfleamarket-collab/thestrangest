// ROOMS: which room you are in, the insides off the map (ROOMS.off, the lazy rooms) and the way in and out behind the fade, peek, roofs hidden when inside, and roofAt.
import {SHARED, THREE} from './003-shx.js';
import {BATCH, BLK, CIVIC, CULL, DRM, DRONE, ED, LEVELS, LITE, LOOKS, MAPED, MUS, NPCS, ONLINE, PNM, pos, ROOMS, SFX, SGM, SKY, UI, VIS, W3, WINDOWS} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {cutWalls, FADE, FREE, MAPG, MODS, OUT, OVERHEAD, SEEN, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
import {PEEK} from './008-batch.js';
import {WATER} from './009-down.js';
import {CREATS} from './087-npc-creatures.js';
Object.assign(ROOMS,{cur:null}); window.ROOMS=ROOMS;
// A room's inside built late (ROOMS.part) records all it adds (meshes, its lights, things to use, wall cuts), so ROOMS.unpart takes it all away again.
ROOMS.part=(group,fn,make,cast=true)=>{ const n0=scene.children.length, t0=UI.things.length, c0=cutWalls.length, keep=BATCH.items.splice(0), m0=BATCH.meshes, tg=BATCH.tag; BATCH.meshes={}; BATCH.tag=null;
  try{ fn(); if(make&&BATCH.items.length){ const c=BATCH.cast; BATCH.cast=cast; BATCH.build(make); BATCH.cast=c; } } finally{ BATCH.meshes=m0; BATCH.items=keep; BATCH.tag=tg; }
  const P={group,objs:scene.children.slice(n0),things:UI.things.slice(t0),cuts:cutWalls.slice(c0),lights:[]};
  for(const o of P.objs)group.add(o);
  const L=[]; for(const o of P.objs)o.traverse(c=>{ if(c.isPointLight&&!c.userData.pool)L.push(c); });
  for(const l of L){ l.userData.grp=group; l.castShadow=false; l.removeFromParent(); LITE.recs.push(l); P.lights.push(l); } LITE.t=0; (ROOMS.built||(ROOMS.built=[])).push(P); return P; };   // (built: what src/161c-merge.js may merge)
ROOMS.unpart=P=>{ if(!P)return; const out=(A,L)=>{ for(const a of L){ const i=A.indexOf(a); if(i>=0)A.splice(i,1); } };
  out(UI.things,P.things); out(cutWalls,P.cuts); out(LITE.recs,P.lights); LITE.t=0; if(ROOMS.built)out(ROOMS.built,[P]); if(ROOMS.unmerge)ROOMS.unmerge(P);
  for(const o of P.objs){ o.removeFromParent(); o.traverse(c=>{ if(c.geometry&&!c.geometry.userData.keep)c.geometry.dispose(); for(const q of c.material?[].concat(c.material):[]){ if(q.userData.keep)continue; if(q.map)q.map.dispose(); if(q.emissiveMap)q.emissiveMap.dispose(); q.dispose(); } }); } };
ROOMS.roofAt=(x,y,z)=>{ '@later'; const h=new THREE.Raycaster(new THREE.Vector3(x,y,z),new THREE.Vector3(0,1,0),0,12).intersectObjects(scene.children,true).find(i=>{ for(let q=i.object;q;q=q.parent)if(!q.visible)return false; if(!LEVELS.drawn(i.object))return false; return i.object.isMesh&&!i.object.isSkinnedMesh; }); return h?+h.distance.toFixed(2):null; };
{ const V=THREE.Vector3, PL=[0,1,2,3,4,5].map(()=>new THREE.Plane()), m=.14*TILE, OPEN={r:null,m:[]}; let RL=null;
  const NEAR=[new THREE.Plane(new V(0,-1,0),1e6),new THREE.Plane(new V(1,0,0),1e6),new THREE.Plane(new V(0,0,1),1e6)]; let NEARON=false, NEARIN=false;
  { const C=THREE.ShaderChunk, k='clipping_planes_fragment', a0='clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;', a1='if ( clipped ) discard;';
    if(C[k].includes(a0)&&C[k].includes(a1))C[k]=C[k].replace('bool clipped = true;','bool clipped = true; bool cfirst = true; bool cany = ( NUM_CLIPPING_PLANES - UNION_CLIPPING_PLANES ) < 2;')
      .replace(a0,'{ bool c = dot( vClipPosition, plane.xyz ) > plane.w; if ( cfirst ) { clipped = c; cfirst = false; } else cany = cany || c; }').replace(a1,'if ( clipped && cany ) discard;');
    else console.warn('ROOMS: three\'s clipping chunk not as expected; the near side cuts as before'); }
  const box=(X,Z,t,y0,y1)=>{ const a=X(t[0]), b=X(t[2]), c=Z(t[1]), d=Z(t[3]); return {x0:Math.min(a,b),x1:Math.max(a,b),z0:Math.min(c,d),z1:Math.max(c,d),y0,y1}; };
  const sband=R=>{ const d=R.dw, B=R.B, h=d.wd/2+.2; return box(SHARED.BOD.X,SHARED.BOD.Z,d.w==='f'?[d.a-h,B.y1-.05,d.a+h,B.y1+.55]:d.w==='b'?[d.a-h,B.y0-.55,d.a+h,B.y0+.05]:d.w==='w'?[B.x0-.55,d.a-h,B.x0+.05,d.a+h]:[B.x1-.05,d.a-h,B.x1+.55,d.a+h],-1,0); };
  const build=()=>{ RL=[];
    for(const R of STORE.rooms)if(R.walls){ if(R.dw&&R.B&&!R.band)R.band=sband(R); RL.push(R); }
    if(window.CIVIC&&CIVIC.tower){ const t=CIVIC.tower; RL.push({id:'civic',x0:t.x0,x1:t.x1,z0:t.z0,z1:t.z1,y0:t.y-1,y1:t.y+t.H}); }
    for(const id in ROOMS.off){ const o=ROOMS.off[id]; o.bs=(o.rooms||[o.box]).map(r=>({...o.box,...r,lz:id,off:id,sky:!!o.sky})); o.b=o.bs[0]; RL.push(...o.bs); offL(id); offThings(id); } };
  ROOMS.boxes=()=>{ if(!RL)build(); return RL; };
  // inside a room the third person's camera stays within its walls and under its ceiling, pulled in along the line to you
  UI.camKeeps.push((c,t)=>{ const B=ROOMS.cur; if(!B||!(B.x1>B.x0)||!UI.persp)return; const e=.3*TILE; let k=1;
    for(const [a,lo,hi] of [['x',B.x0+e,B.x1-e],['y',(B.y0??-1e9)+e,(B.y1??1e9)-e],['z',B.z0+e,B.z1-e]]){ const d=c[a]-t[a]; if(c[a]>hi&&d>1e-6)k=Math.min(k,Math.max(0,(hi-t[a])/d)); else if(c[a]<lo&&d<-1e-6)k=Math.min(k,Math.max(0,(lo-t[a])/d)); }
    if(k<1)c.lerpVectors(t,c,k); });
  ROOMS.reset=()=>{ RL=null; if(IV.key){ IV.re=IV.key; IV.reOff=IV.b&&IV.b.off||null; leave(); } IV.C.clear(); SYS.run('roomsReset'); };
  const within=(b,x,z,e=0)=>x>b.x0-e&&x<b.x1+e&&z>b.z0-e&&z<b.z1+e;
  ROOMS.nearAll=()=>{ NEARON=true; const skip=new Set([W3.group,...NPCS.map(N=>N.g),...NPCS.extra.map(X=>X.g).filter(Boolean)]); for(const o of [MUS.g,PNM.g,SGM.g,DRM.g])if(o)skip.add(o);
        const own=new Set(); for(const g of skip)g.traverse(c=>{ if(c.material)for(const mt of [].concat(c.material))own.add(mt); });
        const walk=o=>{ if(skip.has(o)||o.isSkinnedMesh)return; const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; for(const mt of ms){ if(own.has(mt)||mt.clippingPlanes===NEAR||(mt.isShaderMaterial&&!mt.clipping)||(mt.clippingPlanes&&mt.clippingPlanes.length))continue; mt.clippingPlanes=NEAR; mt.clipIntersection=true; mt.needsUpdate=true; } for(const c of o.children)walk(c); };
        walk(scene); };
  const IV={key:null,b:null,want:null,re:null,busy:false,H:[],L:[],S:[],top:new Set(),nc:0,C:new Map()}; ROOMS.iv=IV;
  // Insides off the map (ROOMS.off[id]: name, box, need, build -> ROOMS.part, spawn/out [x,z,y,heading], door/exit [x,y,z], rooms [{x0,z0,x1,z1}] when the inside is several rooms, keep, outdoor when it is open air (you can ride there); a place with ground of its own puts {x0,z0,x1,z1,ground} in ROOMS.grounds while built): gone in and out of only by double-clicking the door's thing (door outside, exit inside; doors never move, walking into one does nothing), built on the way in, the street not drawn while you are in, dropped on the way out unless keep.
  // every inside's way out is a door you see (owner, 11 Nov 2026): one panelled door at its exit, facing in, unless the inside draws its own (ownDoor) or has no exit; doorBack how far behind the exit point its wall is
  const DOOR={}; ROOMS.door=(x,y,z,n,back=.26*TILE)=>{ const T=TILE;   // the door: its foot at x,y,z, n the way into the room, its wall back behind it
    if(!DOOR.g){ const k=g=>(g.userData.keep=true,g), m=c=>{ const q=new THREE.MeshLambertMaterial({color:c}); q.userData.keep=true; return q; }; DOOR.fr=m(0x2c2018); DOOR.pa=m(0x6e4a30); DOOR.in=m(0x5a3a24); DOOR.kn=m(0xd0a850);
      DOOR.g=[[k(new THREE.BoxGeometry(1.25*T,.12*T,.16*T)),'fr',0,2.26*T,0],[k(new THREE.BoxGeometry(.12*T,2.3*T,.16*T)),'fr',-.565*T,1.15*T,0],[k(new THREE.BoxGeometry(.12*T,2.3*T,.16*T)),'fr',.565*T,1.15*T,0],
        [k(new THREE.BoxGeometry(1.01*T,2.2*T,.06*T)),'pa',0,1.1*T,0],[k(new THREE.BoxGeometry(.7*T,.75*T,.03*T)),'in',0,1.62*T,.04*T],[k(new THREE.BoxGeometry(.7*T,.75*T,.03*T)),'in',0,.62*T,.04*T],[k(new THREE.SphereGeometry(.055*T,8,6)),'kn',.38*T,1.08*T,.07*T]]; }
    const d=new THREE.Group(); d.name='exit-door'; for(const [g,mt,px,py,pz] of DOOR.g){ const me=new THREE.Mesh(g,DOOR[mt]); me.position.set(px,py,pz); d.add(me); }
    d.position.set(x-n[0]*back,y,z-n[1]*back); d.rotation.y=Math.atan2(n[0],n[1]); return d; };
  const exitDoor=o=>{ const P=o.P; if(!o.exit||o.ownDoor||!o.spawn||!P||!P.group)return; const e=o.exit, dx=o.spawn[0]-e[0], dz=o.spawn[1]-e[2], n=Math.abs(dx)>Math.abs(dz)?[Math.sign(dx),0]:[0,Math.sign(dz)];
    const d=ROOMS.door(e[0],e[1]||0,e[2],n,o.doorBack); P.group.add(d); P.objs.push(d); };
  const offL=id=>{ const o=ROOMS.off[id]; if(ROOMS.lazy[id])return ROOMS.lazy[id]; const L=ROOMS.lazy[id]={name:o.name,off:1,need:()=>o.need&&o.need(),go:()=>{ o.P=o.build(); exitDoor(o); L.done=true; },done:false};
    if(!o.keep)L.drop=()=>{ ROOMS.unpart(o.P); o.P=null; if(o.unbuild)o.unbuild(); }; return L; };
  for(const id in ROOMS.off)offL(id);
  const offThings=id=>{ const o=ROOMS.off[id]; if(o.th||!UI.thing)return; o.th=1; const hb=(p,name,act,exit)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(1.3*TILE,2.4*TILE,.5*TILE),new THREE.MeshBasicMaterial({visible:false}));
      m.position.set(p[0],p[1]+1.2*TILE,p[2]); scene.add(m); UI.thing({name,ghost:1,obj:m,reach:1.4*TILE,near:2.6*TILE,tall:2.4*TILE,act,exit}); };
    if(o.door)hb(o.door,o.name,()=>ROOMS.enter(id)); if(o.exit)hb(o.exit,o.exitName||'OUTSIDE',()=>ROOMS.exit(id),1); };
  const offHide=on=>{ for(const k in MAPG)VIS.hide(MAPG[k],'off',on); }; ROOMS.offHide=offHide;
  // run fn with the world as it is outside the inside you are in (nothing hidden for the room, no clipping): a window's picture of the street
  ROOMS.peek=fn=>{ '@later'; const H=IV.H.slice(), L=IV.L.slice(), S=IV.S.slice(), ix=S.map(([g])=>g.index), off=IV.b&&(IV.b.off||IV.b.away), clip=renderer.clippingPlanes;
    for(const [o] of H)VIS.hide(o,'room',false); for(const [o] of L)VIS.hide(o,'room',false); for(const [g,i] of S)g.setIndex(i); if(off)offHide(false); renderer.clippingPlanes=[];
    try{ fn(); } finally{ renderer.clippingPlanes=clip; if(off)offHide(true); S.forEach(([g],k)=>g.setIndex(ix[k])); for(const [o] of H)VIS.hide(o,'room'); for(const [o] of L)VIS.hide(o,'room',true,true); } };
  // an inside's ceiling faces down only: seen when you look up from inside, gone from above
  const ceil=o=>{ '@later'; if(o.ceilG||o.noCeil)return; o.ceilG=new THREE.Group(); o.ceilG.name='ceiling'; const M=new THREE.MeshLambertMaterial({color:0x2e2f35});
    for(const b of o.bs){ if(!(b.y1<1e5))continue; const m=new THREE.Mesh(new THREE.PlaneGeometry(b.x1-b.x0,b.z1-b.z0),M); m.rotation.x=Math.PI/2; m.position.set((b.x0+b.x1)/2,b.y1-.03,(b.z0+b.z1)/2); m.receiveShadow=true; o.ceilG.add(m); }
    scene.add(o.ceilG); };
  ROOMS.ceilOf=id=>{ if(!RL)build(); ceil(ROOMS.off[id]); };   // an inside's ceiling made without going in (seen through its windows from the street)
  const offMake=async id=>{ const o=ROOMS.off[id], L=offL(id); if(!RL)build(); if(!L.done){ await L.need(); if(o.pre)await o.pre(); if(!L.done)L.go(); } };
  const offPlace=(id,at)=>{ const o=ROOMS.off[id]; if(!RL)build(); const s=at||o.spawn; UI.goTo(s[0],s[1],s[2],s[3]); ceil(o);
    scene.updateMatrixWorld(); const bb=o.bs.find(b=>within(b,s[0],s[1]))||o.b, w={key:kOf(bb),b:bb}; ROOMS.cur=bb; IV.want=w; apply(w); if(!at&&UI.inIso)UI.inIso(); };
  ROOMS.goIn=async(id,at)=>{ await offMake(id); offPlace(id,at); };
  ROOMS.goOut=id=>{ const o=ROOMS.off[id]; UI.goTo(o.out[0],o.out[1],o.out[2],o.out[3]); ROOMS.cur=null; IV.want=null; apply(null); return ROOMS.unstow&&ROOMS.unstow(); };
  // ONE WAY IN AND OUT OF AN INSIDE (ROOMS.run): a record says what differs. busy (its own lock), gate(on) (may it go now), built(), need() (its code), pre() (what it fetches first), make() (the build), arrive(opt) and depart(opt) (where you stand), text(on,built,opt) and fade(on,built,opt) (the fade's words and way; 'ENTERING name' on the way into one not yet built, a cut). Nothing is returned when it does not go.
  ROOMS.run=(o,on,opt={})=>{ if(!o||o.busy||(o.gate&&!o.gate(on)))return; o.busy=true; const built=o.built();
    return FADE.run(o.text?o.text(on,built,opt):on&&!built?'ENTERING '+o.name:'',async()=>{ if(!(on&&(opt.at||opt.walk===false)))SFX.door(); if(on){ if(!o.built()){ await o.need(); if(o.pre)await o.pre(); o.make(); } await o.arrive(opt); } else await o.depart(opt); },{cut:true,...(o.fade?o.fade(on,built,opt):null)}).finally(()=>{ o.busy=false; }); };
  // an inside off the map as such a record: its own gate, words and fade from ROOMS.off[id] when it has them
  const REC={}, offRec=id=>{ const o=ROOMS.off[id]; if(!o)return null; return REC[id]||(REC[id]={get name(){ return o.name; },get busy(){ return IV.busy; },set busy(v){ IV.busy=v; },gate:on=>!FADE.busy&&(!on||!o.gate||o.gate()),built:()=>!!(ROOMS.lazy[id]&&ROOMS.lazy[id].done),
    need:()=>{},make:()=>{},arrive:opt=>ROOMS.goIn(id,opt.at),depart:()=>ROOMS.goOut(id),text:o.text,fade:o.fade}); };
  ROOMS.enter=(id,opt)=>ROOMS.run(offRec(id),true,opt);   // opt.at: a chosen spot inside (the GO TO menu, a saved spot)
  ROOMS.enterAt=(id,at)=>ROOMS.enter(id,{at});
  ROOMS.boxAt=(x,z)=>{ for(const id in ROOMS.off){ const b=ROOMS.off[id].box; if(b&&x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1)return id; } return null; };   // which off-map inside, if any, holds this point
  ROOMS.exit=id=>ROOMS.off[id]&&IV.b&&IV.b.off===id?ROOMS.run(offRec(id),false):null; ROOMS.leave=ROOMS.exit;
  ROOMS.offIn=()=>IV.b&&IV.b.off||IV.reOff||null;
  { let t0=0; SYS.add('places',()=>{ if(SHARED.LVL!=='up'||FADE.busy||IV.busy||ROOMS.offIn()||!SYS.started){ t0=0; return; } let id=null; for(const k in ROOMS.off){ const o=ROOMS.off[k]; if(o.out&&o.box&&within(o.box,pos.x,pos.z,6)&&!within(o.box,o.out[0],o.out[1],6)){ id=k; break; } }
    if(!id){ t0=0; return; } const now=performance.now(); if(!t0)t0=now; if(now-t0<1000)return; t0=0; const o=ROOMS.off[id]; IV.busy=true; FADE.run('',()=>{ UI.goTo(o.out[0],o.out[1],o.out[2],o.out[3]); },{cut:true}).finally(()=>{ IV.busy=false; }); },'130-rooms stray'); }   // on an inside's spot off the map without being in it (a reset, an old saved spot): out at its door, never left on the bare ground out there   // (between a reset and the room put back you are still in it)
  ROOMS.real=()=>{ const id=ROOMS.offIn(); return id?(WINDOWS.from&&WINDOWS.from(id)):ROOMS.away&&ROOMS.away()||pos; };   // where you are on the street: in a room off the map, where it stands if its windows look out at the street live, else null
  BATCH.at=ROOMS.real;   // in a room off the map with no window out the street's painted ground and walls are dropped, painted again on the way out
  ROOMS.offBuild=async id=>{ const L=offL(id); if(!L.done){ await L.need(); if(!L.done)L.go(); } return L; };   // an inside built without going in (for its windows' first picture)
  ROOMS.offDrop=id=>{ const o=ROOMS.off[id], L=ROOMS.lazy[id]; if(!o||o.keep||!L||!L.done||ROOMS.offIn()===id)return; ROOMS.unpart(o.P); o.P=null; if(o.unbuild)o.unbuild(); L.done=false; };   // and dropped again: nothing inside stays built at the start
  SYS.add('places',()=>{ const cur=ROOMS.offIn(); for(const id in ROOMS.off){ const g=ROOMS.off[id].P&&ROOMS.off[id].P.group; if(g)VIS.hide(g,'away',!(cur===id||(WINDOWS.held&&WINDOWS.held.has(id))||(WINDOWS.taking&&WINDOWS.taking.has(id)))); } },'130-rooms away');   // a built inside is drawn only while you are in it or see it through its glass, never from across the map
  const kOf=b=>[b.x0,b.z0,b.x1,b.z1,b.y0].map(v=>(+v).toFixed(2)).join();
  const lazyOf=b=>{ if(!b||b.noBuild)return null; const L=b.lz&&ROOMS.lazy[b.lz]; if(L)return L.done?null:L; const S=b.id&&STORE.inside&&STORE.inside[b.id];
    return S&&!S.done?{name:/^THE /.test(S.name)?S.name:'THE '+S.name,S,go:()=>{ S.busy=false; STORE.inGo(b.id); },need:async()=>{ if(STORE.need)await STORE.need(); if(STORE.pre&&STORE.pre[b.id])await STORE.pre[b.id](); }}:null; };
  const BX=new THREE.Box3(), V3=new V();
  const ovl=(a,r)=>a.max.x>r.x0&&a.min.x<r.x1&&a.max.z>r.z0&&a.min.z<r.z1&&a.max.y>r.y0&&a.min.y<r.y1, con=(a,r)=>a.min.x>=r.x0&&a.max.x<=r.x1&&a.min.z>=r.z0&&a.max.z<=r.z1&&a.min.y>=r.y0&&a.max.y<=r.y1;
  const pin=(r,x,y,z)=>x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1&&y>r.y0&&y<r.y1;
  const scan=(b,roots)=>{ '@later'; const e=.15*TILE, R={x0:b.x0-e,x1:b.x1+e,z0:b.z0-e,z1:b.z1+e,y0:b.y0-.3,y1:b.y1+.1*TILE}, D=b.band?{x0:b.band.x0,x1:b.band.x1,z0:b.band.z0,z1:b.band.z1,y0:R.y0,y1:R.y1}:null;
    const inn=(x,y,z)=>pin(R,x,y,z)||!!D&&pin(D,x,y,z), T={H:[],L:[],S:[],top:new Set(roots)};
    const skip=new Set([W3.group,...(b.sky&&SKY.dome?[SKY.dome]:[]),...NPCS.map(N=>N.g),...(NPCS.extra||[]).map(q=>q&&q.g),FLAME.me,WATER.mesh,...(WATER.extra||[]).map(w=>w.mesh),
      MUS.g,PNM.g,SGM.g,DRM.g].filter(Boolean));
    const batch=o=>o.isMesh&&!o.isInstancedMesh&&!o.isSkinnedMesh&&!!o.geometry.attributes.aOp&&!o.geometry.index&&!(CULL.M.has(o))&&!(o.userData.intr&&typeof o.userData.intr==='object');
    const st=o=>{ const g=o.geometry; BX.makeEmpty(); if(o.isInstancedMesh){ o.computeBoundingBox(); if(o.boundingBox)BX.copy(o.boundingBox); } else if(g&&!o.isSprite){ if(!g.boundingBox)g.computeBoundingBox(); BX.copy(g.boundingBox); }
      if(BX.isEmpty()){ o.getWorldPosition(V3); return inn(V3.x,V3.y,V3.z)?1:0; } BX.applyMatrix4(o.matrixWorld);
      if(con(BX,R)||D&&con(BX,D))return 1; if(!ovl(BX,R)&&!(D&&ovl(BX,D)))return 0; if(batch(o))return 2; BX.getCenter(V3);
      return inn(V3.x,V3.y,V3.z)&&BX.max.x-BX.min.x<R.x1-R.x0+2*TILE&&BX.max.z-BX.min.z<R.z1-R.z0+2*TILE&&BX.max.y-BX.min.y<R.y1-R.y0+TILE?1:0; };
    const sub=o=>{ const g=o.geometry, P=g.attributes.position.array, n=P.length/18|0, E=o.matrixWorld.elements, k=[];
      for(let f=0;f<n;f++){ let x=0,y=0,z=0; for(let q=0;q<6;q++){ const i=(f*6+q)*3, a=P[i], c=P[i+1], d=P[i+2]; x+=E[0]*a+E[4]*c+E[8]*d+E[12]; y+=E[1]*a+E[5]*c+E[9]*d+E[13]; z+=E[2]*a+E[6]*c+E[10]*d+E[14]; } if(inn(x/6,y/6,z/6))k.push(f); }
      if(k.length===n)return; if(!k.length){ T.L.push(o); return; } const ix=new Uint32Array(k.length*6); k.forEach((f,i)=>{ for(let q=0;q<6;q++)ix[i*6+q]=f*6+q; }); T.S.push({o,g,ix:new THREE.BufferAttribute(ix,1)}); };
    const walk=o=>{ if(skip.has(o)||o.userData.anyRoom||o.isLight||o.isCamera)return true; if(o.userData.cullOf){ if(o.geometry&&st(o)===0)T.L.push(o); return true; } if(o.userData.facade)return false; const own=o.geometry||o.isSprite||!o.children.length?st(o):-1; let kept=false; const outs=[];
      for(const c of o.children){ if(walk(c))kept=true; else outs.push(c); }
      if(!kept&&own<=0)return false; for(const c of outs)T.H.push(c); if(own===0)T.L.push(o); else if(own===2)sub(o); return true; };
    for(const c of roots)if(!walk(c))T.H.push(c); return T; };
  const put=T=>{ for(const o of T.H){ IV.H.push([o]); VIS.hide(o,'room'); } for(const o of T.L){ IV.L.push([o]); VIS.hide(o,'room',true,true); } for(const q of T.S)if(q.o.geometry===q.g){ IV.S.push([q.g,q.g.index]); q.g.setIndex(q.ix); } };
  const leave=()=>{ '@later'; if(!IV.key)return; for(const [o] of IV.H)VIS.hide(o,'room',false); for(const [o] of IV.L)VIS.hide(o,'room',false); for(const [g,i] of IV.S)g.setIndex(i); IV.H=[]; IV.L=[]; IV.S=[]; if(IV.b&&(IV.b.off||IV.b.away))offHide(false); IV.key=null; IV.b=null;
    for(const L of LITE.pool)if(L.castShadow)L.shadow.needsUpdate=true; };
  const drop=w=>{ if(w&&w.b.noBuild)return; const k=w&&w.b.lz; for(const n in ROOMS.lazy){ const L=ROOMS.lazy[n]; if(n!==k&&L.done&&L.drop&&!WINDOWS.held.has(n)&&!(WINDOWS.taking&&WINDOWS.taking.has(n))){ L.drop(); L.done=false; IV.C.clear(); } } };
  const apply=w=>{ leave(); drop(w); if(!w)return; let T=IV.C.get(w.key); if(!T){ scene.updateMatrixWorld(); T=scan(w.b,scene.children.slice()); IV.C.set(w.key,T); } put(T); NEARIN=false; if(w.b.off||w.b.away)offHide(true); IV.top=new Set(T.top); IV.nc=-1; IV.G=new Map(scene.children.map(c=>[c,c.children.length])); IV.gn=kids(); IV.key=w.key; IV.b=w.b; IV.reOff=null; };
  const swap=async()=>{ const w=IV.want, lz=w&&lazyOf(w.b), walk=b=>!!(b&&b.id&&STORE.held&&STORE.held.has(b.id)&&STORE.inside[b.id]);
    if(!lz&&(walk(w&&w.b)||!w&&walk(IV.b))){ apply(w); return; }   // walked in or out through a street shop's door: no fade
    if(!SYS.started||FADE.busy){ if(lz){ await lz.need(); lz.go(); } apply(IV.want); return; }
    IV.busy=true; try{ await FADE.run(lz?'ENTERING '+lz.name:'',async()=>{ if(lz){ if(lz.S)lz.S.busy=true; await lz.need(); lz.go(); }
      const l2=IV.want&&lazyOf(IV.want.b); if(l2){ await l2.need(); l2.go(); } apply(IV.want); },{cut:true}); } finally{ IV.busy=false; } };
  const kids=()=>{ let n=0; for(const c of scene.children)n+=c.children.length; return n; };
  ROOMS.hold=()=>{ if(!IV.key)return; if(scene.children.length!==IV.nc){ IV.nc=scene.children.length; const nw=scene.children.filter(c=>!IV.top.has(c)); if(nw.length){ for(const c of nw)IV.top.add(c); put(scan(IV.b,nw)); } }
    { const n=kids(); if(n!==IV.gn){ IV.gn=n; const G=IV.G||(IV.G=new Map()); for(const g of scene.children){ const k=G.get(g), l=g.children.length; if(k!=null&&l>k&&!IV.H.some(q=>q[0]===g))put(scan(IV.b,g.children.slice(k))); G.set(g,l); } } }   // what a group gets after you came in (the far ground painted a bit a frame) is hidden too
    for(const q of IV.H)VIS.hide(q[0],'room'); for(const q of IV.L)VIS.hide(q[0],'room',true,true); if(scene.background&&scene.background.isColor)scene.background.setRGB(0,0,0); };
  ROOMS.dark=()=>!!IV.key;
  window.INTDBG=()=>({inside:IV.key?IV.b.lz||IV.b.id||IV.key:null,built:[...Object.keys(ROOMS.lazy).filter(k=>ROOMS.lazy[k].done),...Object.keys(STORE.inside||{}).filter(k=>STORE.inside[k].done)],hidden:IV.H.length+IV.L.length+IV.S.length,busy:IV.busy});
  const unclip=g=>{ if(g)g.traverse(c=>{ if(c.material)for(const mt of [].concat(c.material))if(mt.clippingPlanes===NEAR){ mt.clippingPlanes=null; mt.needsUpdate=true; } }); };
  ROOMS.tick=()=>{ if(!RL)build(); let hit=null, bnd=null; if(NEARON)unclip(W3.group); if(LOOKS.light)LOOKS.light();
    if(SHARED.LVL==='up'&&!UI.freeCam&&!ED.on&&!MAPED.on&&!(DRONE&&DRONE.cam)){
      hit=RL.find(b=>(within(b,pos.x,pos.z,0)||!!b.band&&!b.id&&within(b.band,pos.x,pos.z,0))&&SHARED.py>b.y0-.3&&SHARED.py<b.y1)||null; }
    if(!hit&&!IV.key&&!IV.busy)drop(null);
    ROOMS.cur=hit; { const w=hit?{key:kOf(hit),b:hit}:null; IV.want=w; const wk=w?w.key:null; if(wk!==IV.key&&!IV.busy){ if(wk&&wk===IV.re&&!lazyOf(hit))apply(w); else swap().catch(()=>{ IV.busy=false; }); } IV.re=null; if(!IV.b)IV.reOff=null; }
    if(IV.key&&scene.background)scene.background.setRGB(0,0,0);
    UI.isoPlace(); if(SHARED.BOD.GD)SHARED.BOD.GD.tick(); if(MODS.dungeon)MODS.dungeon.tick();
    for(const h of OVERHEAD)SEEN(h.o,SHARED.cam.position.y<h.y);
    const cutOn=false;   // insides never cut their walls (owner, 28 Oct 2026): the see-through circle shows you behind them
    if(cutOn){ if(!NEARON||!NEARIN)ROOMS.nearAll(); NEARIN=true;
      const cx=SHARED.cam.position.x-pos.x, cz=SHARED.cam.position.z-pos.z, l=Math.hypot(cx,cz)||1, ux=cx/l, uz=cz/l, BAND=1.1*TILE;
      NEAR[0].normal.set(0,-1,0); NEAR[0].constant=SHARED.py+.45*ZU*24/.84;
      if(Math.abs(ux)>.2){ if(ux>0){ NEAR[1].normal.set(-1,0,0); NEAR[1].constant=hit.x1-BAND; } else { NEAR[1].normal.set(1,0,0); NEAR[1].constant=-(hit.x0+BAND); } } else NEAR[1].set(new V(-1,0,0),1e6);
      if(Math.abs(uz)>.2){ if(uz>0){ NEAR[2].normal.set(0,0,-1); NEAR[2].constant=hit.z1-BAND; } else { NEAR[2].normal.set(0,0,1); NEAR[2].constant=-(hit.z0+BAND); } } else NEAR[2].set(new V(0,0,-1),1e6); }
    else if(!hit&&!UI.persp&&(UI.view==='iso'||UI.view==='map')&&BLK&&SHARED.LVL!=='down'&&(bnd=BLK.band(pos.x,pos.z))&&Math.abs(SHARED.cam.position.z-pos.z)>.2*Math.hypot(SHARED.cam.position.x-pos.x,SHARED.cam.position.z-pos.z)){
      if(!NEARON||!NEARIN)ROOMS.nearAll(); NEARIN=true; NEAR[0].normal.set(0,-1,0); NEAR[0].constant=SHARED.py+.45*ZU*24/.84; NEAR[1].set(new V(-1,0,0),1e6);
      if(SHARED.cam.position.z>pos.z){ NEAR[2].normal.set(0,0,-1); NEAR[2].constant=bnd.z1-.05*TILE; } else { NEAR[2].normal.set(0,0,1); NEAR[2].constant=-(bnd.z0+.05*TILE); } }
    else { NEARIN=false; if(NEARON&&NEAR[0].constant<1e5){ NEAR[0].constant=NEAR[1].constant=NEAR[2].constant=1e6; } }
    if(hit&&!FREE){ PL[0].set(new V(1,0,0),-(hit.x0-m)); PL[1].set(new V(-1,0,0),hit.x1+m); PL[2].set(new V(0,0,1),-(hit.z0-m)); PL[3].set(new V(0,0,-1),hit.z1+m); PL[4].set(new V(0,1,0),-hit.y0); PL[5].set(new V(0,-1,0),hit.y1+.05);
      renderer.clippingPlanes=PL; scene.background.setRGB(0,0,0); }
    else if(renderer.clippingPlanes.length)renderer.clippingPlanes=[];
    // a room's walls that vanish while you are in it (STORE.open[id]: the theatre keeps only its screen wall), with what of its front would show (STORE.openHide) and the see-through circle
    { const o=hit&&STORE.open&&STORE.open[hit.id]?hit:null; if(o!==OPEN.r){ for(const me of OPEN.m)VIS.hide(me,'open',false); OPEN.m=[]; OPEN.r=o;
        if(o){ for(const w of STORE.open[o.id])for(const me of BATCH.all(STORE.meshes,'W'+o.id+':'+w)){ VIS.hide(me,'open'); OPEN.m.push(me); }
          for(const me of (STORE.openHide&&STORE.openHide[o.id])||[]){ VIS.hide(me,'open'); OPEN.m.push(me); } } PEEK.off=!!o; } }
    const HB=IV.key?IV.b:FREE?null:hit, show=(g,x,z,o,y)=>{ const sh=!HB||within(HB,x,z,.4*TILE)&&(y==null||y>HB.y0-.3&&y<HB.y1); VIS.hide(g,'roof',!sh); };
    for(const N of NPCS){ if(N.lv!=='up'||N.mode==='hidden'||N.hid)continue; show(N.g,N.g.position.x,N.g.position.z,N,N.g.position.y); }
    if(ONLINE.others)for(const o of ONLINE.others.values()){ const g=o.fig&&o.fig.g; if(g&&g.parent)show(g,g.position.x,g.position.z,o,g.position.y); }
    if(CREATS)for(const N of CREATS)if(N.g)show(N.g,N.g.position.x,N.g.position.z,N,N.g.position.y);
    if(MUS.g)show(MUS.g,MUS.at.x,MUS.at.z,MUS,MUS.at.y); if(PNM.g)show(PNM.g,PNM.at.x,PNM.at.z,PNM); if(SGM.g)show(SGM.g,SGM.at.x,SGM.at.z,SGM); if(DRM.g)show(DRM.g,DRM.at.x,DRM.at.z,DRM);
    if(WATER.mesh){ show(WATER.mesh,WATER.mesh.position.x,WATER.mesh.position.z,WATER); for(const w of WATER.extra)if(w.mesh)show(w.mesh,w.mesh.position.x,w.mesh.position.z,w); } };
}
{ SYS.add('rooms',()=>{ OUT.tick(); },'130-rooms'); }
