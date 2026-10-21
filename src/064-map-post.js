// THE STAIRS AND GROUND: inStair and SHARED.groundY say how high the ground is everywhere; LITE and HEMI set the lamps and sky light.
import {SHARED, THREE} from './003-shx.js';
import {BROOK, LITE, NPCS, PARK, pos, ROOMS, st, W3} from './003b-systems.js';
import {scene} from './004-main.js';
import {CASTLE, FIX, grab, lamps, LAY, MAPG, MAPSTAIR, MODS, RING, SEEN, SHL, SOL, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
await grab('stairs',async()=>SHARED.METRO.exit());
const STAIRS=[MAPSTAIR,CASTLE.stair,...RING.stairs], inStair=(x,z,lv)=>{ const gx=x/TILE+72, gy=z/TILE-77; for(const S of STAIRS)if(S.has?S.has(x,z,lv):gx>=S.x0&&gx<S.x1&&gy>=S.y0&&gy<S.y1)return {S,gy}; return null; };
MODS.inStair=inStair;
SHARED.groundY=(x,z)=>{ const s=inStair(x,z); if(s){ const S=s.S; if(S.ground)return S.ground(x,z); const t=S.dir>0?s.gy-S.y0:S.y1-s.gy, k=Math.min(S.steps,Math.max(1,Math.floor(t/((S.y1-S.y0)/S.steps))+1)); return -k*S.depth/S.steps*ZU; }
  { const st=SHARED.LVL==='up'&&STORE.stackGround?STORE.stackGround(x,z):null; if(st!=null)return st; }
  { const bg=SHARED.LVL==='up'&&SHARED.BOD.GD&&SHARED.BOD.GD.ground?SHARED.BOD.GD.ground(x,z):null; if(bg!=null)return bg; }
  { const sp=SHARED.LVL==='up'&&MODS.apts&&MODS.apts.stoop?MODS.apts.stoop(x,z):null; if(sp!=null)return sp; }
  return SHARED.LVL==='down'?(MODS.dungeon&&MODS.dungeon.inside(x,z)?MODS.dungeon.ground(x,z):MODS.station.ground(x,z)):MODS.apts&&MODS.apts.inside(x,z)?MODS.apts.ground(x,z):MODS.bodega.ground(x,z); };
{ const PB=MODS.bodega.BOUND;
  SHARED.BOUND={x0:Math.min(MODS.bodega.BOUND.x0,MODS.station.BOUND.x0),x1:Math.max(MODS.bodega.BOUND.x1,PB.x1),z0:Math.min(MODS.station.BOUND.z0,PB.z0),z1:Math.max(MODS.bodega.BOUND.z1,MODS.park.BOUND.z1)}; }
{ const g=(k,x0,z0,x1,z1)=>{ if(!LAY.L[k])return; SHARED.BOUND.x0=Math.min(SHARED.BOUND.x0,x0); SHARED.BOUND.z0=Math.min(SHARED.BOUND.z0,z0); SHARED.BOUND.x1=Math.max(SHARED.BOUND.x1,x1); SHARED.BOUND.z1=Math.max(SHARED.BOUND.z1,z1); }, B=SHARED.BOD.B0, A=MODS.apts.A, C=CASTLE.b, G=SHARED.BOD.grounds.find(q=>q.id==='ghostst');
  g('bodega',SHARED.BOD.X(B.x0),SHARED.BOD.Z(B.y0),SHARED.BOD.X(B.x1),SHARED.BOD.Z(B.y1)); g('house',SHARED.BOD.X(A.x0),SHARED.BOD.Z(A.y0),SHARED.BOD.X(A.x1),SHARED.BOD.Z(A.y1)); g('castle',SHARED.BOD.XS(C[0]),SHARED.BOD.ZS(C[2]),SHARED.BOD.XS(C[1]),SHARED.BOD.ZS(C[3]));
  if(G)g('ghost',SHARED.BOD.X(G.x0),SHARED.BOD.Z(G.y0),SHARED.BOD.X(G.x1),SHARED.BOD.Z(G.y1)); for(const R of STORE.rooms)g(R.id,R.x0,R.z0,R.x1,R.z1); }
const HEMI=new THREE.HemisphereLight(0x55607a,0x14110e,.3); scene.add(HEMI);
Object.assign(LITE,{N:8,pool:[],recs:[],sel:[],t:0,f:0,at:null,V:new THREE.Vector3()}); window.LITE=LITE;
for(let i=0;i<LITE.N;i++){ const L=new THREE.PointLight(0xffffff,0,8*TILE,1.6); L.userData.pool=true; if(!i){ L.castShadow=true; L.shadow.mapSize.set(1024,1024); L.shadow.camera.near=.1; L.shadow.camera.far=14; L.shadow.bias=-.002; L.shadow.normalBias=.06; } scene.add(L); LITE.pool.push(L); }
SHL.push(LITE.pool[0],LITE.pool[1]);
const LITE_init0=()=>{ const top=o=>{ while(o.parent&&o.parent!==scene)o=o.parent; return o; };
  scene.traverse(o=>{ if(o.isPointLight&&!o.userData.pool)LITE.recs.push(o); });
  for(const L of LITE.recs){ const g=top(L); L.userData.grp=g===L?null:g; L.castShadow=false; L.removeFromParent(); } };
LITE.init=(...a)=>{ const r=LITE_init0(...a); SYS.run('liteInit'); return r; };
LITE.tick=(dt,x,y,z)=>{ const P=LITE.pool;
  LITE.t=Math.min(LITE.t-dt,.25); if(!(LITE.t>0)){ LITE.t=.25; const R=typeof ROOMS!=='undefined'?ROOMS:null, RB=R&&R.boxes?R.boxes():[], cur=R?R.cur:null, e=.5*TILE;
    const inB=(b,p,m)=>p.x>b.x0-m&&p.x<b.x1+m&&p.z>b.z0-m&&p.z<b.z1+m&&p.y>b.y0-e&&p.y<b.y1+e;
    LITE.sel=LITE.recs.filter(L=>L.intensity>0&&!L.userData.off&&(!L.userData.grp||L.userData.grp.visible)&&(L.userData.in?L.userData.in(cur):L.userData.both||(cur?inB(cur,L.position,e):!RB.some(b=>inB(b,L.position,-e)))))
      .map(L=>[((L.position.x-x)**2+(L.position.y-y)**2+(L.position.z-z)**2)*(L.userData.fire?.25:1),L]).sort((p,q)=>p[0]-q[0]).slice(0,LITE.N);
    const S0=LITE.slots||(LITE.slots=[]), want=LITE.sel.map(p=>p[1]), dOf=L=>{ const p=LITE.sel.find(q=>q[1]===L); return p?p[0]:1e18; };
    let first=want[0]; if(S0[0]&&want.includes(S0[0])&&dOf(S0[0])<=dOf(first)*1.35)first=S0[0];
    const slots=new Array(LITE.N).fill(null); slots[0]=first||null; for(let i=1;i<LITE.N;i++)if(S0[i]&&S0[i]!==first&&want.includes(S0[i]))slots[i]=S0[i];
    for(const L of want){ if(slots.includes(L))continue; const i=slots.indexOf(null,1); if(i<0)break; slots[i]=L; }
    LITE.slots=slots; LITE.sel=slots.filter(Boolean); }
  for(let i=0;i<P.length;i++){ const S=P[i], L=(LITE.slots||LITE.sel)[i]; if(!L||!(L.intensity>0)){ S.intensity=0; continue; } S.position.copy(L.position); S.color.copy(L.color); S.intensity=L.intensity; S.distance=L.distance; S.decay=L.decay; }
  const H0=(LITE.slots||LITE.sel)[0], H1=LITE.sel.filter(L=>L!==H0).sort((p,q)=>p.position.distanceToSquared(LITE.V.set(x,y,z))-q.position.distanceToSquared(LITE.V))[0]; LITE.w=1;
  if(H0&&H1&&P[0].intensity>0){ const dd=L=>Math.hypot(L.position.x-x,L.position.y-y,L.position.z-z); let w=Math.min(1,Math.max(0,(dd(H1)-dd(H0))/(1.5*TILE))); w=w*w*(3-2*w); LITE.w=w;
    if(w<1){ const S=P[0], E=P[P.length-1]; E.position.copy(S.position); E.color.copy(S.color); E.distance=S.distance; E.decay=S.decay; E.intensity=S.intensity*(1-w); S.intensity*=w; } }
  const L0=P[0], first=(LITE.slots||LITE.sel)[0]; let mv=LITE.at!==first||Math.abs(x-LITE.px)+Math.abs(y-LITE.py)+Math.abs(z-LITE.pz)>1e-4&&(x-L0.position.x)**2+(z-L0.position.z)**2<(L0.distance||8*TILE)**2; LITE.at=first; LITE.px=x; LITE.py=y; LITE.pz=z;
  if(L0.intensity>0&&typeof NPCS!=='undefined'){ const r=(L0.distance||8*TILE)**2; for(const N of NPCS){ if(!N.g||!N.g.visible||!N.st)continue; const p=N.g.position, dx=p.x-L0.position.x, dz=p.z-L0.position.z; if(dx*dx+dz*dz>r)continue; const k=p.x*7.13+p.z*3.31+p.y*1.7+N.st.h; if(N._lk!==k){ N._lk=k; mv=true; } } }
  L0.shadow.autoUpdate=L0.intensity>0&&mv; };
scene.background=new THREE.Color(0x050507);
const UNDER=(()=>{ let on=false, hid=[]; const keep=new Set(['down','dungeon','castlestairs','stairs','fire']), bb=new THREE.Box3(), skin=o=>{ let k=false; o.traverse(c=>{ if(c.isSkinnedMesh||c.isLight)k=true; }); return k; };
  return dn=>{ if(dn===on)return; on=dn;
    if(dn){ hid=[]; const npc=new Set((typeof NPCS!=='undefined'?NPCS:[]).map(N=>N.g)); for(const o of scene.children){ if(keep.has(o.name)||o.isLight||o.isCamera||npc.has(o)||(o===W3.group)||skin(o))continue;
        if(o.isInstancedMesh){ o.computeBoundingBox(); bb.copy(o.boundingBox).applyMatrix4(o.matrixWorld); } else bb.setFromObject(o); if(bb.isEmpty()||bb.min.y<-1)continue;
        o.traverse(c=>{ if(c.isMesh||c.isPoints||c.isLine||c.isSprite){ c.layers.disable(0); c.layers.enable(1); hid.push(c); } }); } }
    else{ for(const c of hid){ c.layers.enable(0); c.layers.disable(1); } hid=[]; } }; })();
const OUTWET=p=>SHARED.LVL==='up'&&!!((st.water&&st.water.in)||window.BROOK&&BROOK.over||window.FOUNT&&FOUNT.wet&&FOUNT.wet(p.x,p.z,TILE));
const MAPLV=(py,pos)=>{ SHARED.METRO.door(py,pos); if(MODS.dunDoor)MODS.dunDoor(py,pos); PARK.door(py,pos); const wet=OUTWET(pos), lv=py<-1.6&&!wet?'down':'up', si=inStair(pos.x,pos.z), st=si!=null, sd=st&&si.S!==MAPSTAIR;
  MAPG.down.visible=(lv==='down'||sd)&&!(lv==='down'&&MODS.dungeon.inside(pos.x,pos.z)); if(MAPG.dungeon)MAPG.dungeon.visible=lv==='down'||st; for(const k of ['bodega','pool','poolout','parkwall','park','castle'])if(MAPG[k])MAPG[k].visible=lv==='up'&&!(sd&&py<-1)&&(k!=='park'||PARK.in);
  UNDER(py<-1&&!wet&&!(st&&!sd&&SHARED.LVL==='up'));
  MODS.stairCut.constant=st?py+.25:1e6; if(MODS.castleStairCut)MODS.castleStairCut.constant=st?py+.25:1e6;
  if(lv===SHARED.LVL)return false; SHARED.LVL=lv; SHARED.solids=SOL[lv]; SHARED.fixed=FIX[lv]; HEMI.color.set(lv==='down'?0x8a93a8:0x55607a); HEMI.groundColor.set(lv==='down'?0x1a1814:0x14110e); HEMI.intensity=lv==='down'?.1:.3; return true; };

{ const MB=SHARED.BOUND; STORE.tick=()=>{ STORE.pos=pos; STORE.cur=ROOMS.cur?ROOMS.cur.id:null; STORE.nl=lamps.length; STORE.lon=LITE.sel.length;
    for(const r of STORE.roofs)SEEN(r.me,!(r.R.inside(pos.x,pos.z)||ROOMS.cur===r.R)); SHARED.BOUND=SHARED.LVL==='down'&&MODS.dungeon.inside(pos.x,pos.z)?MODS.dungeon.bound(pos.x,pos.z):STORE.inStore(pos.x,pos.z)?STORE.bound:MB; }; }
window.MAPDBG=()=>({LVL:SHARED.LVL,cut:MODS.stairCut.constant,vis:Object.fromEntries(Object.entries(MAPG).map(([k,g])=>[k,g.visible])),stairLamp:lamps.filter(L=>L.parent===MAPG.stairs).map(L=>L.intensity),py:typeof SHARED.py!=='undefined'?SHARED.py:null,pos:typeof pos!=='undefined'?[pos.x,pos.z]:null});

{ const K=32, N=K*24, c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d'), im=g.createImageData(N,N), GC=SHARED.BOD.g.lawnCol;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const v=GC((i+.5)/24+200,(j+.5)/24+200), k=(j*N+i)*4; im.data[k]=v[0]; im.data[k+1]=v[1]; im.data[k+2]=v[2]; im.data[k+3]=255; }
  g.putImageData(im,0,0); const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping; t.repeat.set(1/K,1/K);
  const XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS, M=SHARED.BOD.MAP, tt=v=>v/TILE, R=320, cx=tt(XS((M.x0+M.x1)/2)), cz=tt(ZS(M.y0));
  const LO=LAY.o('land'), LE=LAY.e('land'), LR=MODS.landR={x0:cx-R+LO.x+LE[0],z0:cz-R+LO.y+LE[1],x1:cx+R+LO.x+LE[2],z1:cz+R+LO.y+LE[3]};
  const sh=new THREE.Shape([[LR.x0,-LR.z0],[LR.x1,-LR.z0],[LR.x1,-LR.z1],[LR.x0,-LR.z1]].map(p=>new THREE.Vector2(...p)));
  const hole=(x0,z0,x1,z1)=>x0>LR.x0&&x1<LR.x1&&z0>LR.z0&&z1<LR.z1&&sh.holes.push(new THREE.Path([[x0,-z0],[x0,-z1],[x1,-z1],[x1,-z0]].map(p=>new THREE.Vector2(...p))));
  const clip=(Q,e)=>{ const m=.5, inside=([x,z])=>e===0?x>LR.x0+m:e===1?x<LR.x1-m:e===2?z>LR.z0+m:z<LR.z1-m, cross=(a,b)=>{ const k=e<2?(e===0?LR.x0+m:LR.x1-m):(e===2?LR.z0+m:LR.z1-m), t=e<2?(k-a[0])/(b[0]-a[0]):(k-a[1])/(b[1]-a[1]); return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]; };
    const out=[]; for(let i=0;i<Q.length;i++){ const a=Q[i], b=Q[(i+1)%Q.length], ia=inside(a), ib=inside(b); if(ia&&ib)out.push(b); else if(ia&&!ib)out.push(cross(a,b)); else if(!ia&&ib){ out.push(cross(a,b)); out.push(b); } } return out; };
  for(const P of SHARED.BOD.roadPolys){ let Q=P.map(([x,y])=>[tt(XS(x)),tt(ZS(y))]); for(let e=0;e<4&&Q.length;e++)Q=clip(Q,e); if(Q.length>=3)sh.holes.push(new THREE.Path(Q.map(([x,z])=>new THREE.Vector2(x,-z)))); }
  for(const r of SHARED.BOD.ramps.RP){ const a=r.e+r.dir*.01, b=r.e+r.dir*SHARED.BOD.ramps.D, P=r.ax==='x'?[r.u0,Math.min(a,b),r.u1,Math.max(a,b)]:[Math.min(a,b),r.u0,Math.max(a,b),r.u1]; hole(tt(XS(P[0])),tt(ZS(P[1])),tt(XS(P[2])),tt(ZS(P[3]))); }
  hole(tt(XS(MAPSTAIR.x0)),tt(ZS(MAPSTAIR.y0)),tt(XS(MAPSTAIR.x1)),tt(ZS(MAPSTAIR.y1)));
  for(const S of RING.stairs)hole(tt(XS(S.x0)),tt(ZS(S.y0)),tt(XS(S.x1)),tt(ZS(S.y1)));
  { const S=CASTLE.stair; hole(tt(XS(S.x0)),tt(ZS(S.y0)),tt(XS(S.x1)),tt(ZS(S.y1))); }
  { const z0=tt(Math.min(ZS(RING.river.y0),ZS(RING.river.y1))), z1=tt(Math.max(ZS(RING.river.y0),ZS(RING.river.y1))); hole(LR.x0+.5,z0,LR.x1-.5,z1); }
  const mk=()=>{ const geo=new THREE.ShapeGeometry(sh); geo.rotateX(-Math.PI/2); geo.scale(TILE,1,TILE); geo.translate(0,-.5*ZU,0); return geo; }, geo=mk(); let geoH=null;
  MODS.landHoles=on=>{ if(on&&!geoH&&window.PARK&&PARK.brook&&FOUNT.S){ for(const H of PARK.wetHole())sh.holes.push(new THREE.Path(H.map(([x,y])=>new THREE.Vector2(tt(XS(x+(PARK.ox||0))),-tt(ZS(y+(PARK.oy||0))))))); geoH=mk(); } m.geometry=on&&geoH?geoH:geo; };
  const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:t})); m.receiveShadow=true; MAPG.bodega.add(m); MODS.land=m; }
export {HEMI, inStair, MAPLV};
