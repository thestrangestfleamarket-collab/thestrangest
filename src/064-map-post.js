// THE STAIRS AND GROUND: inStair and SHARED.groundY say how high the ground is everywhere; LITE and HEMI set the lamps and sky light.
import {SHARED, THREE} from './003-shx.js';
import {LEVELS, LITE, NPCS, PARK, pos, ROOMS, UI, VIS} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {CASTLE, FIX, grab, lamps, LAY, LEVEL, MAPG, MAPSTAIR, MODS, RING, SECTIONS, SEEN, SHL, SOL, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {GRASS} from './014a-grass.js';
import {FOUNT} from './060a-fount.js';
await grab('stairs',async()=>SHARED.METRO.exit());
const STAIRS=[MAPSTAIR,CASTLE.stair,...RING.stairs], inStair=(x,z,lv)=>{ const gx=SHARED.BOD.MX(x), gy=SHARED.BOD.MY(z); for(const S of STAIRS)if(S.has?S.has(x,z,lv):gx>=S.x0&&gx<S.x1&&gy>=S.y0&&gy<S.y1)return {S,gy}; return null; };
MODS.inStair=inStair;
LEVELS.ways.push({id:'subway stairs',stair:MAPSTAIR,a:'street',b:'station',at:['street'],groups:['stairs'],cut:MODS.stairCut},{id:'castle stairs',stair:CASTLE.stair,a:'street',b:'dungeon',at:['street'],groups:['castlestairs'],cut:MODS.castleStairCut});
SHARED.groundY=(x,z)=>{ for(const g of ROOMS.grounds)if(x>g.x0&&x<g.x1&&z>g.z0&&z<g.z1)return g.ground(x,z);   // a built off-map place with ground of its own (ROOMS.grounds)
  const s=inStair(x,z); if(s){ const S=s.S; if(S.ground)return S.ground(x,z); const t=S.dir>0?s.gy-S.y0:S.y1-s.gy, k=Math.min(S.steps,Math.max(1,Math.floor(t/((S.y1-S.y0)/S.steps))+1)); return -k*S.depth/S.steps*ZU; }
  { const st=SHARED.LVL==='up'&&STORE.stackGround?STORE.stackGround(x,z):null; if(st!=null)return st; }
  { const bg=SHARED.LVL==='up'&&SHARED.BOD.GD&&SHARED.BOD.GD.ground?SHARED.BOD.GD.ground(x,z):null; if(bg!=null)return bg; }
  { const sp=SHARED.LVL==='up'&&MODS.apts&&MODS.apts.stoop?MODS.apts.stoop(x,z):null; if(sp!=null)return sp; }
  if(SHARED.LVL==='down'){ const L=LEVELS.at?LEVELS.of[LEVELS.at(x,z,'down')]:null; return L&&L.ground?L.ground(x,z):MODS.station.ground(x,z); }   // each down level says its own ground
  return MODS.apts&&MODS.apts.inside(x,z)?MODS.apts.ground(x,z):MODS.bodega.ground(x,z); };
{ const PB=MODS.bodega.BOUND;
  SHARED.BOUND={x0:Math.min(MODS.bodega.BOUND.x0,MODS.station.BOUND.x0),x1:Math.max(MODS.bodega.BOUND.x1,PB.x1),z0:Math.min(MODS.station.BOUND.z0,PB.z0),z1:Math.max(MODS.bodega.BOUND.z1,MODS.park.BOUND.z1)}; }
{ const g=(k,x0,z0,x1,z1)=>{ if(!LAY.L[k])return; SHARED.BOUND.x0=Math.min(SHARED.BOUND.x0,x0); SHARED.BOUND.z0=Math.min(SHARED.BOUND.z0,z0); SHARED.BOUND.x1=Math.max(SHARED.BOUND.x1,x1); SHARED.BOUND.z1=Math.max(SHARED.BOUND.z1,z1); }, B=SHARED.BOD.B0, A=MODS.apts.A, C=CASTLE.b, G=SHARED.BOD.grounds.find(q=>q.id==='ghostst');
  g('bodega',SHARED.BOD.X(B.x0),SHARED.BOD.Z(B.y0),SHARED.BOD.X(B.x1),SHARED.BOD.Z(B.y1)); g('house',SHARED.BOD.X(A.x0),SHARED.BOD.Z(A.y0),SHARED.BOD.X(A.x1),SHARED.BOD.Z(A.y1)); g('castle',SHARED.BOD.XS(C[0]),SHARED.BOD.ZS(C[2]),SHARED.BOD.XS(C[1]),SHARED.BOD.ZS(C[3]));
  if(G)g('ghost',SHARED.BOD.X(G.x0),SHARED.BOD.Z(G.y0),SHARED.BOD.X(G.x1),SHARED.BOD.Z(G.y1)); for(const R of STORE.rooms)g(R.id,R.x0,R.z0,R.x1,R.z1); }
const HEMI=new THREE.HemisphereLight(0x55607a,0x14110e,.3); scene.add(HEMI);
Object.assign(LITE,{N:8,pool:[],recs:[],sel:[],t:0,f:0,at:null,V:new THREE.Vector3()}); window.LITE=LITE;
for(let i=0;i<LITE.N;i++){ const L=new THREE.PointLight(0xffffff,0,8*TILE,1.6); L.userData.pool=true; if(!i){ L.castShadow=false; L.shadow.mapSize.set(1024,1024); L.shadow.camera.near=.1; L.shadow.camera.far=14; L.shadow.bias=-.002; L.shadow.normalBias=.06; L.shadow.autoUpdate=false; } scene.add(L); LITE.pool.push(L); }
{ let t=0; SYS.add('life',dt=>{ if((t-=dt)>0)return; t=.2; if(LITE.pool[0].castShadow&&LITE.pool[0].intensity>0)LITE.pool[0].shadow.needsUpdate=true; },'064-lampshadow'); }   // a dark lamp's shadow is never seen: not redrawn
SHL.push(LITE.pool[0],LITE.pool[1]);
const LITE_init0=()=>{ const top=o=>{ while(o.parent&&o.parent!==scene)o=o.parent; return o; };
  scene.traverse(o=>{ if(o.isPointLight&&!o.userData.pool)LITE.recs.push(o); });
  for(const L of LITE.recs){ const g=top(L); L.userData.grp=g===L?null:g; L.castShadow=false; L.removeFromParent(); } };
LITE.init=(...a)=>{ const r=LITE_init0(...a); LITE.ready=true; SYS.run('liteInit'); return r; };
LITE.dim=p=>{ const c=SHARED.cam; if(!c||!UI.persp)return 1; const t=Math.min(1,Math.max(0,(c.position.distanceTo(p)/TILE-10)/30)); return 1-.85*t*t*(3-2*t); };   // far lamps light the ground less
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
  for(let i=0;i<P.length;i++){ const S=P[i], L=(LITE.slots||LITE.sel)[i]; if(!L||!(L.intensity>0)){ S.intensity=0; continue; } S.position.copy(L.position); S.color.copy(L.color); if(S.castShadow){ const n=L.userData.near||.1, c=S.shadow.camera; if(c.near!==n){ c.near=n; c.updateProjectionMatrix(); } }   // a lamp inside its own post sees past the post's walls
    S.intensity=L.intensity*LITE.dim(L.position); S.distance=L.distance*1.3; S.decay=Math.max(L.decay,2.2); }
  const H0=(LITE.slots||LITE.sel)[0], H1=LITE.sel.filter(L=>L!==H0).sort((p,q)=>p.position.distanceToSquared(LITE.V.set(x,y,z))-q.position.distanceToSquared(LITE.V))[0]; LITE.w=1;
  if(H0&&H1&&P[0].intensity>0){ const dd=L=>Math.hypot(L.position.x-x,L.position.y-y,L.position.z-z); let w=Math.min(1,Math.max(0,(dd(H1)-dd(H0))/(1.5*TILE))); w=w*w*(3-2*w); LITE.w=w;
    if(w<1){ const S=P[0], E=P[P.length-1]; E.position.copy(S.position); E.color.copy(S.color); E.distance=S.distance; E.decay=S.decay; E.intensity=S.intensity*(1-w); S.intensity*=w; } }
  const L0=P[0], first=(LITE.slots||LITE.sel)[0]; let mv=LITE.at!==first||Math.abs(x-LITE.px)+Math.abs(y-LITE.py)+Math.abs(z-LITE.pz)>1e-4&&(x-L0.position.x)**2+(z-L0.position.z)**2<(L0.distance||8*TILE)**2; LITE.at=first; LITE.px=x; LITE.py=y; LITE.pz=z;
  if(L0.intensity>0&&typeof NPCS!=='undefined'){ const r=(L0.distance||8*TILE)**2; for(const N of NPCS){ if(!N.g||!N.g.visible||!N.st)continue; const p=N.g.position, dx=p.x-L0.position.x, dz=p.z-L0.position.z; if(dx*dx+dz*dz>r)continue; const k=p.x*7.13+p.z*3.31+p.y*1.7+N.st.h; if(N._lk!==k){ N._lk=k; mv=true; } } }
  L0.shadow.autoUpdate=L0.intensity>0&&mv; };
// far lamps: every outdoor lamp past the few lit in full still shows the pool of light it throws on the ground (one cheap glow each), fading out as its real light takes over
{ const F={me:null,n:-1,a:null,t:0}, M=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), S=new THREE.Vector3(), C=new THREE.Color();
  const tex=()=>{ const N=64, c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d'), im=g.createImageData(N,N), B=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];   // stepped and dithered, never a hard rim
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const d=Math.hypot((i+.5)/N*2-1,(j+.5)/N*2-1), a=Math.max(0,1-d)**1.5*6, q=Math.floor(a)+(a-Math.floor(a)>(B[(j%4)*4+i%4]+.5)/16?1:0), k=(j*N+i)*4; im.data[k]=im.data[k+1]=im.data[k+2]=255; im.data[k+3]=Math.round(q/6*255); }
    g.putImageData(im,0,0); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; return t; };
  const out=L=>!L.userData.fire&&!L.userData.in&&!L.userData.both&&(L.userData.i0||0)>=20&&L.distance>=8*TILE&&L.position.y>-1&&!ROOMS.boxes().some(b=>L.position.x>b.x0&&L.position.x<b.x1&&L.position.z>b.z0&&L.position.z<b.z1);
  const build=()=>{ if(F.me){ F.me.removeFromParent(); F.me.geometry.dispose(); } F.L=LITE.recs.filter(out); F.n=LITE.recs.length; if(!F.L.length){ F.me=null; return; }
    const g=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2), m=new THREE.MeshBasicMaterial({map:F.tx||(F.tx=tex()),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
    F.me=new THREE.InstancedMesh(g,m,F.L.length); F.me.frustumCulled=false; F.me.raycast=()=>{}; F.me.renderOrder=2; F.a=new Float32Array(F.L.length);
    F.L.forEach((L,i)=>{ const r=Math.min(L.distance*.38,4.6*TILE), gy=SHARED.groundY?SHARED.groundY(L.position.x,L.position.z):0; M.compose(V.set(L.position.x,(isFinite(gy)?gy:0)+.06,L.position.z),Q,S.set(2*r,1,2*r)); F.me.setMatrixAt(i,M); F.me.setColorAt(i,C.setRGB(0,0,0)); });
    scene.add(F.me); };
  LITE.farTick=dt=>{ if(LITE.recs.length!==F.n)build(); if(!F.me)return; const up=SHARED.LVL==='up'&&!(ROOMS.cur&&ROOMS.cur.off); F.me.visible=up; if(!up)return; const sel=new Set(LITE.sel.map(p=>p[1]||p));
    F.L.forEach((L,i)=>{ const want=sel.has(L)?0:Math.min(1,(L.intensity||0)/(L.userData.i0||1)); F.a[i]+=(want-F.a[i])*Math.min(1,(dt||.016)*1.5); const k=.55*F.a[i]*LITE.dim(L.position); F.me.setColorAt(i,C.copy(L.color).multiplyScalar(k)); });
    F.me.instanceColor.needsUpdate=true; };
  LITE.far=F; SYS.add('life',dt=>LITE.farTick(dt),'064-farglow'); }
scene.background=new THREE.Color(0x050507);
SHARED.floor='up'; let parkOff=null;
const MAPLV=(py,pos,cam)=>{ SHARED.METRO.door(py,pos); if(MODS.dunDoor)MODS.dunDoor(py,pos); PARK.door(py,pos); const si=inStair(pos.x,pos.z), lv=cam?LEVELS.below(py):(SHARED.floor=LEVELS.floor(SHARED.floor,py,si)), cur=LEVELS.set(lv,pos.x,pos.z,si);
  { const off=!(cur==='street'&&PARK.in); if(MAPG.park&&off!==parkOff){ parkOff=off; VIS.hide(MAPG.park,'level',off); } }
  for(const w of LEVELS.ways)if(w.cut)w.cut.constant=LEVELS.way?py+.25:cur===w.b&&LEVELS.of[w.b].ceil!=null?LEVELS.of[w.b].ceil:1e6;
  if(lv==='down'){ const o=LEVELS.of[cur]; HEMI.intensity=o&&o.amb!=null?o.amb:.1; }   // a down level may have no light but its own lamps
  if(lv===SHARED.LVL)return false; SHARED.LVL=lv; SHARED.solids=SOL[lv]; SHARED.fixed=FIX[lv]; HEMI.color.set(lv==='down'?0x8a93a8:0x55607a); HEMI.groundColor.set(lv==='down'?0x1a1814:0x14110e); if(lv!=='down')HEMI.intensity=.3; return true; };

{ const MB=SHARED.BOUND; STORE.tick=()=>{ STORE.pos=pos; STORE.cur=ROOMS.cur?ROOMS.cur.id:null; STORE.nl=lamps.length; STORE.lon=LITE.sel.length;
    for(const r of STORE.roofs)SEEN(r.me,!(r.R.inside(pos.x,pos.z)||ROOMS.cur===r.R)); const L=SHARED.LVL==='down'&&LEVELS.at?LEVELS.of[LEVELS.at(pos.x,pos.z,'down')]:null; SHARED.BOUND=L&&L.bound?L.bound(pos.x,pos.z):ROOMS.cur&&ROOMS.cur.off?ROOMS.cur:MODS.apts&&MODS.apts.inReal&&MODS.apts.bound?MODS.apts.bound():STORE.inStore(pos.x,pos.z)?STORE.bound:MB; }; }   // an off-map inside (bodega, apt, arcade) is walled off the map, so bound by its own box, not the street's limit
window.MAPDBG=()=>({LVL:SHARED.LVL,cut:MODS.stairCut.constant,vis:Object.fromEntries(Object.entries(MAPG).map(([k,g])=>[k,g.visible])),stairLamp:lamps.filter(L=>L.parent===MAPG.stairs).map(L=>L.intensity),py:typeof SHARED.py!=='undefined'?SHARED.py:null,pos:typeof pos!=='undefined'?[pos.x,pos.z]:null});

{ const K=GRASS.TS, N=K*24, GL=GRASS.K.length;
  // the lawn's nine grasses (GRASS): each kind's painted picture in one array, and a map of which kind grows where over your section, a texel a tile; the land picks by spot, its edges jittered so the kinds mingle
  const g0=performance.now(), GD=new Uint8Array(N*N*4*GL); GRASS.K.forEach((k,i)=>{ if(!GRASS.only||k.id===GRASS.only)GD.set(GRASS.paint(k),i*N*N*4); }); const gt=new THREE.DataArrayTexture(GD,N,N,GL); gt.magFilter=THREE.NearestFilter; gt.minFilter=THREE.LinearMipmapLinearFilter; gt.generateMipmaps=true;
  gt.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); gt.colorSpace=THREE.SRGBColorSpace; gt.wrapS=gt.wrapT=THREE.MirroredRepeatWrapping; gt.needsUpdate=true;
  const t1=(GRASS.only?GRASS.of[GRASS.only]:GRASS.of[GRASS.MIX.lawn]).i,   // the one picture (the park's hill and the brook's banks wear it): the main lawn
    t=new THREE.DataTexture(GD.subarray(N*N*4*t1,N*N*4*(t1+1)),N,N); t.magFilter=THREE.NearestFilter; t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping; t.repeat.set(1/K,1/K); t.needsUpdate=true;
  const KM=(()=>{ const L=SECTIONS.live, xs=[SHARED.BOD.XS(L.x0)/TILE,SHARED.BOD.XS(L.x1)/TILE], zs=[SHARED.BOD.ZS(L.y0)/TILE,SHARED.BOD.ZS(L.y1)/TILE], x0=Math.floor(Math.min(...xs))-4, z0=Math.floor(Math.min(...zs))-4, W=Math.ceil(Math.max(...xs))+4-x0, H=Math.ceil(Math.max(...zs))+4-z0, D=new Uint8Array(W*H);
    for(let j=0;j<H;j++)for(let i=0;i<W;i++)D[j*W+i]=GRASS.at(x0+i+.5,z0+j+.5).i; const m=new THREE.DataTexture(D,W,H,THREE.RedFormat); m.magFilter=m.minFilter=THREE.NearestFilter; m.needsUpdate=true;
    // the map again over a box (world coords) when a grass is painted in the landscape editor
    GRASS.remap=(a,b,c,d)=>{ const i0=Math.max(0,Math.floor(a/TILE)-x0-1), i1=Math.min(W-1,Math.ceil(c/TILE)-x0+1), j0=Math.max(0,Math.floor(b/TILE)-z0-1), j1=Math.min(H-1,Math.ceil(d/TILE)-z0+1); for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)D[j*W+i]=GRASS.at(x0+i+.5,z0+j+.5).i; m.needsUpdate=true; };
    return {m,v:new THREE.Vector4(x0,z0,1/W,1/H)}; })();
  GRASS.map=KM; GRASS.ms=Math.round(performance.now()-g0);
  const XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS, M=SHARED.BOD.MAP, tt=v=>v/TILE, R=320, cx=tt(XS((M.x0+M.x1)/2)), cz=tt(ZS(M.y0));
  const LO=LAY.o('land'), LE=LAY.e('land'), LR=MODS.landR={x0:cx-R+LO.x+LE[0],z0:cz-R+LO.y+LE[1],x1:cx+R+LO.x+LE[2],z1:cz+R+LO.y+LE[3]};
  const LZ0=Math.max(LR.z0,tt(Math.max(ZS(RING.river.y0),ZS(RING.river.y1))));   // the land ends at the Hudson's near bank: past it only water, out to the far skyline
  const EL=(LEVEL.edge&&LEVEL.edge.lines)||[], EX=EL.length?Math.max(...EL.flatMap(l=>[l[0],l[2]])):null, EY=EL.length?Math.max(...EL.flatMap(l=>[l[1],l[3]])):null, ES=EL.find(l=>l[1]===l[3]&&l[1]<EY), ZT=EL.length?Math.min(LR.z1,tt(ZS(EY))):LR.z1, XE=EL.length?Math.min(LR.x1,tt(XS(EX))):LR.x1, ZA=ES?Math.max(LZ0,tt(ZS(ES[1]))):ZT, notch=(x,z)=>x>XE+.01&&z>ZA+.01;   // the land stops at the section's north and east lines past the park (owner, 8 Nov 2026: "fix glitchse in water"): the land past them is 069a's, the big lake open in it
  const sh=new THREE.Shape([[LR.x0,-LZ0],[LR.x1,-LZ0],[LR.x1,-ZA],[XE,-ZA],[XE,-ZT],[LR.x0,-ZT]].map(p=>new THREE.Vector2(...p)));
  const hole=(x0,z0,x1,z1)=>x0>LR.x0&&x1<LR.x1&&z0>LZ0&&z1<ZT&&!notch(x1,z1)&&sh.holes.push(new THREE.Path([[x0,-z0],[x0,-z1],[x1,-z1],[x1,-z0]].map(p=>new THREE.Vector2(...p))));
  const clip=(Q,e)=>{ const m=.5, inside=([x,z])=>e===0?x>LR.x0+m:e===1?x<LR.x1-m:e===2?z>LZ0+m:z<ZT-m, cross=(a,b)=>{ const k=e<2?(e===0?LR.x0+m:LR.x1-m):(e===2?LZ0+m:ZT-m), t=e<2?(k-a[0])/(b[0]-a[0]):(k-a[1])/(b[1]-a[1]); return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]; };
    const out=[]; for(let i=0;i<Q.length;i++){ const a=Q[i], b=Q[(i+1)%Q.length], ia=inside(a), ib=inside(b); if(ia&&ib)out.push(b); else if(ia&&!ib)out.push(cross(a,b)); else if(!ia&&ib){ out.push(cross(a,b)); out.push(b); } } return out; };
  for(const P of SHARED.BOD.roadPolys){ let Q=P.map(([x,y])=>[tt(XS(x)),tt(ZS(y))]); for(let e=0;e<4&&Q.length;e++)Q=clip(Q,e); if(Q.length>=3&&!Q.some(([x,z])=>notch(x,z)))sh.holes.push(new THREE.Path(Q.map(([x,z])=>new THREE.Vector2(x,-z)))); }
  for(const r of SHARED.BOD.ramps.RP){ const a=r.e+r.dir*.01, b=r.e+r.dir*SHARED.BOD.ramps.D, P=r.ax==='x'?[r.u0,Math.min(a,b),r.u1,Math.max(a,b)]:[Math.min(a,b),r.u0,Math.max(a,b),r.u1]; hole(tt(XS(P[0])),tt(ZS(P[1])),tt(XS(P[2])),tt(ZS(P[3]))); }
  hole(tt(XS(MAPSTAIR.x0)),tt(ZS(MAPSTAIR.y0)),tt(XS(MAPSTAIR.x1)),tt(ZS(MAPSTAIR.y1)));
  for(const S of RING.stairs)hole(tt(XS(S.x0)),tt(ZS(S.y0)),tt(XS(S.x1)),tt(ZS(S.y1)));
  { const S=CASTLE.stair; hole(tt(XS(S.x0)),tt(ZS(S.y0)),tt(XS(S.x1)),tt(ZS(S.y1))); }
  const mk=()=>{ const geo=new THREE.ShapeGeometry(sh); geo.rotateX(-Math.PI/2); geo.scale(TILE,1,TILE); geo.translate(0,-.5*ZU,0); return geo; }, geo=mk(); let geoH=null;
  MODS.landHoles=on=>{ if(on&&!geoH&&window.PARK&&PARK.brook&&FOUNT.S){ for(const H of PARK.wetHole())sh.holes.push(new THREE.Path(H.map(([x,y])=>{ let a=tt(XS(x+(PARK.ox||0))), z=Math.min(ZT-.3,tt(ZS(y+(PARK.oy||0)))); if(z>ZA)a=Math.min(a,XE-.3); return new THREE.Vector2(a,-z); }))); geoH=mk(); } m.geometry=on&&geoH?geoH:geo; };
  const MR=LEVEL.edge&&LEVEL.edge.mirror, MB=[0,1].map(i=>{ if(!MR)return new THREE.Vector4(1e9,1e9,1e9,1e9); const a=i?MR.x[1]:MR.x[0]-MR.reach, b=i?MR.x[1]+MR.reach:MR.x[0], za=tt(ZS(MR.ground[0])), zb=tt(ZS(MR.ground[1])); return new THREE.Vector4(tt(XS(a)),Math.min(za,zb),tt(XS(b)),Math.max(za,zb)); });   // the street's mirror past its ends (161d) brings its own lawn
  const lm=new THREE.MeshLambertMaterial({map:t}); lm.onBeforeCompile=sh=>{ sh.uniforms.tGK={value:gt}; sh.uniforms.tKM={value:KM.m}; sh.uniforms.uKM={value:KM.v}; sh.uniforms.uMB={value:MB};
    sh.fragmentShader='uniform highp sampler2DArray tGK; uniform sampler2D tKM; uniform vec4 uKM, uMB[2];\n'+sh.fragmentShader.replace('#include <map_fragment>',`{ highp vec2 gt=vMapUv*${K}.; for(int i=0;i<2;i++)if(gt.x>uMB[i].x&&gt.x<uMB[i].z&&-gt.y>uMB[i].y&&-gt.y<uMB[i].w)discard; highp vec2 gq=floor(gt*24.)/24.; vec2 gj=vec2(fract(sin(dot(gq,vec2(12.9898,78.233)))*43758.5453),fract(sin(dot(gq,vec2(39.3468,11.135)))*24634.6345))-.5;
      float gk=floor(texture2D(tKM,(vec2(gt.x,-gt.y)+gj*1.1-uKM.xy)*uKM.zw).r*255.+.5); diffuseColor*=texture(tGK,vec3(vMapUv,gk)); }`); };
  lm.customProgramCacheKey=()=>'grasskinds';
  const m=new THREE.Mesh(geo,lm); m.receiveShadow=true; MAPG.bodega.add(m); MODS.land=m; }
export {HEMI, MAPLV};
