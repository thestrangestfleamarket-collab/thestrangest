// THE OLD GAME'S ROOMS, OFF THE MAP: each room from data/oldrooms-index.json is a ROOMS.off inside and a MORE PLACES entry; nothing of it loads until you jump to it, then its items (data/oldrooms.json, fetched then) are placed with the kits' makers, a named block standing in for any maker not made yet.
import {SHARED, THREE} from './003-shx.js';
import {pos, ROOMS, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, SOL, STORE, TILE} from './006-map-pre.js';
import {BATCH, OBJ} from './008-batch.js';
import {CAT_INFO, CATALOG, prop, PROPL} from './014-gamekit.js';
import {pageOffice} from './027a-page-office.js';
import {pageKitchen} from './027b-page-kitchen.js';
import {pageCozyDen} from './027c-page-cozyden.js';
import {pageGreenhouse} from './027d-page-greenhouse.js';
import {witchBedroom} from './027e-witch-bedroom.js';
import {crystalCavern} from './027f-crystal-cavern.js';
import {vrForest} from './027g-vr-forest.js';
import {westAwnings} from './027h-west-awnings.js';
import {bathroomKit} from './027i-bathroom.js';
import {laundryKit} from './027j-laundry.js';
import {westDesk} from './027k-west-desk.js';
import {bedroomKit} from './027l-bedroom.js';
{ const {X,Y,Z,faceTex,bq,C,place,gbox}=SHARED.BOD, sh=SHARED.BOD.K.sh, hs=SHARED.BOD.g.hash, INDEX=__DATA__("data/oldrooms-index.json"), ITEMS=__LAZY__("data/oldrooms.json");
  const WH=130, DW=.8, DH=95, OUT0=[-2.2,3.2,0,0]; let DATA=null;
  const MKA=(k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{})});
  const box4=(x0,y0,x1,y1)=>{ const a=X(x0), b=X(x1), c=Z(y0), d=Z(y1); return [Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]; };
  const taken=new Set(STORE.places.map(p=>p[0]).concat(['THE STREET','THE BODEGA','THE PLATFORM','CENTRAL PARK','THE BATH HOUSE','THE CASTLE','DUNGEON L1','THE SHOP','THE BACK ROOM','THE BATHS','THE SUBWAY STAIRS']));
  const inside=(R,S)=>{ '@oldrooms';
    const B=R, cx=(B.x0+B.x1)/2, items=DATA&&DATA[R.id]||[], own=!!R.own;   // a page room brings its own floor and walls (baked into the index)
    const sol=(x0,y0,x1,y1,zt)=>{ const r=box4(x0,y0,x1,y1), f=[r[0],r[1],0,r[2],r[3],Math.max(.05,Y(zt))]; SOL.up.push(r); FIX.up.push(f); S.sol.push(r); S.fix.push(f); };
    const wall=(u,z,f)=>z<6?sh([70,62,58],f):sh([176,168,152],f*(1-.04*hs(Math.floor(u*4),Math.floor(z/8),9)));
    const floor=(x,y)=>{ const r=Math.floor(y*3), b=Math.floor(x/1.5+hs(r,0,13)*3); return sh([128,98,66],(y*3-r)<.06||(x/1.5-Math.floor(x/1.5))<.03?.78:.9+.12*hs(b,r,7)); };
    const WALL=(P0,a0,a1,paint,h=WH,z0=0)=>bq(P0(a0,z0),P0(a1,z0),P0(a1,h),P0(a0,h),faceTex((a1-a0)*24,h-z0,(i,j)=>C(paint(a0+(i+.5)/24,h-j-.5))),'A');
    const PX=(y,o=0)=>(a,z)=>[X(a),Y(z),Z(y+o)], PY=(x,o=0)=>(a,z)=>[X(x+o),Y(z),Z(a)];
    if(!own){ bq([X(B.x0),Y(.15),Z(B.y1)],[X(B.x1),Y(.15),Z(B.y1)],[X(B.x1),Y(.15),Z(B.y0)],[X(B.x0),Y(.15),Z(B.y0)],faceTex((B.x1-B.x0)*24,(B.y1-B.y0)*24,(i,j)=>C(floor(B.x0+(i+.5)/24,B.y1-(j+.5)/24))),'A');
    for(const o of [-.03,.03]){ WALL(PY(B.x0,o),B.y0,B.y1,(u,z)=>wall(u,z,.8)); WALL(PY(B.x1,o),B.y0,B.y1,(u,z)=>wall(u,z,.8)); WALL(PX(B.y0,o),B.x0,B.x1,(u,z)=>wall(u,z,.9));
      WALL(PX(B.y1,o),B.x0,cx-DW,(u,z)=>wall(u,z,.95)); WALL(PX(B.y1,o),cx+DW,B.x1,(u,z)=>wall(u,z,.95)); WALL(PX(B.y1,o),cx-DW,cx+DW,(u,z)=>wall(u,z,.95),WH,DH); }
    STORE.CEIL(X(B.x0),Z(B.y0),X(B.x1),Z(B.y1),Y(WH)-.02);
    sol(B.x0-.1,B.y0,B.x0+.1,B.y1,WH); sol(B.x1-.1,B.y0,B.x1+.1,B.y1,WH); sol(B.x0,B.y0-.1,B.x1,B.y0+.1,WH); sol(B.x0,B.y1-.1,cx-DW,B.y1+.1,WH); sol(cx+DW,B.y1-.1,B.x1,B.y1+.1,WH); }
    const n0=PROPL.length, paint=(p,nm)=>{ BATCH.tag=OBJ('old:'+R.id,nm); for(const b of p.boxes)gbox(b,'A'); BATCH.tag=null; };
    for(const [kind,x,y] of items){ const f=CATALOG[kind]; if(f){ const p=f(+x.toFixed(3),+y.toFixed(3)); if(p){ p.kind=kind; place(p,0); paint(p,p.name||kind); } continue; }
      const nm=((CAT_INFO[kind]&&CAT_INFO[kind].name)||kind).toUpperCase(); SHARED.PNAME=nm; const p=prop([{x0:x-.3,y0:y-.3,x1:x+.3,y1:y+.3,z0:0,z1:30,c:[120,96,150]}],null,{kind}); place(p,0); paint(p,nm); S.missing++;
      const hb=new THREE.Mesh(new THREE.BoxGeometry(.6*TILE,Y(30),.6*TILE),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(x),Y(15),Z(y)); scene.add(hb); UI.thing({name:nm+' (NOT MADE YET)',ghost:1,obj:hb,reach:1.4*TILE,near:2.4*TILE,tall:Y(30)}); }
    for(const p of PROPL.slice(n0)){ if(p.high||p.walk||!p.boxes)continue; if(p.solids){ for(const s of p.solids)sol(s.x0,s.y0,s.x1,s.y1,60); continue; }
      const bs=p.boxes.filter(b=>!b.nb&&b.z0<30&&b.z1-b.z0>3); if(!bs.length)continue;
      if(/wall|parapet/.test(p.kind||p.name||'')){ for(const b of bs)sol(b.x0,b.y0,b.x1,b.y1,b.z1); continue; }
      sol(Math.min(...bs.map(b=>b.x0)),Math.min(...bs.map(b=>b.y0)),Math.max(...bs.map(b=>b.x1)),Math.max(...bs.map(b=>b.y1)),Math.max(...bs.map(b=>b.z1))); }
    S.placed=items.length-S.missing;
    const W=B.x1-B.x0, H=B.y1-B.y0, n=Math.max(1,Math.min(3,Math.round(Math.max(W,H)/8)));
    for(let i=0;i<n;i++){ const t=(i+.5)/n, lx=W>=H?B.x0+t*W:cx, ly=W>=H?(B.y0+B.y1)/2:B.y0+t*H, Lt=new THREE.PointLight(0xffe9c8,8,12*TILE,1.6); Lt.position.set(X(lx),Y(118),Z(ly)); scene.add(Lt); } };
  const OLD={ids:[],by:{},errors:[]};
  for(const R of INDEX){ const id='old-'+R.id, cx=(R.x0+R.x1)/2, wb=box4(R.x0-.2,R.y0-.2,R.x1+.2,R.y1+.2), S={sol:[],fix:[],missing:0,placed:0}; let G=null;
    const name=taken.has(R.name)?R.name+' · OLD':R.name; taken.add(name);
    const o=ROOMS.off[id]={name,box:{x0:wb[0],z0:wb[1],x1:wb[2],z1:wb[3],y0:-1,y1:Y(WH+40)},
      need:()=>{ o.out=ROOMS.offIn()?OUT0:[pos.x,pos.z,SHARED.py,SHARED.heading]; return Promise.all([LOAD('oldkits','oldrooms','later').then(()=>{ if(!OLD.kits){ OLD.kits=1; for(const [n,k] of [['office',pageOffice],['kitchen',pageKitchen],['cozy den',pageCozyDen],['greenhouse',pageGreenhouse],['witch bedroom',witchBedroom],['crystal cavern',crystalCavern],['vr forest',vrForest],['west awnings',westAwnings],['bathroom',bathroomKit],['laundry',laundryKit],['desk room',westDesk],['bedroom',bedroomKit]])try{ k(); }catch(e){ OLD.errors.push(n+': '+(e&&e.message||e)); console.error('old kit '+n+' failed',e); } } }),DATA?null:ITEMS().then(d=>{ DATA=d; })]); },   // the old game's kits register their pieces on the first jump, never at the start
      build:()=>{ G=new THREE.Group(); G.name=id; scene.add(G); S.sol=[]; S.fix=[]; S.missing=0; return o.P=ROOMS.part(G,()=>inside(R,S),MKA); },
      unbuild:()=>{ for(const r of S.sol){ const i=SOL.up.indexOf(r); if(i>=0)SOL.up.splice(i,1); } for(const f of S.fix){ const i=FIX.up.indexOf(f); if(i>=0)FIX.up.splice(i,1); } if(G){ G.removeFromParent(); G=null; } },
      spawn:[X(cx),Z(R.y1-(R.own?2.8:1.3)),0,Math.PI],out:OUT0,exit:[X(cx+(R.own?1.2:0)),0,Z(R.y1-(R.own?2.8:.25))],exitName:'OUTSIDE',old:R,S};   // a room with its own walls: you arrive just inside its south wall, the way out beside you
    STORE.places.push([name,o.spawn[0],o.spawn[1],'up',null,Math.PI]); OLD.ids.push(id); OLD.by[name]=id; }
  SHARED.OLDROOMS=OLD;
  window.OLDDBG=()=>({rooms:OLD.ids.length,kitErrors:OLD.errors,built:OLD.ids.filter(k=>ROOMS.off[k].P),inside:ROOMS.offIn(),data:!!DATA,of:k=>{ const o=ROOMS.off[k]; return o&&{name:o.name,items:o.old.n,placed:o.S.placed,missing:o.S.missing,things:o.P?o.P.things.length:0,verts:o.P?o.P.objs.reduce((n,q)=>{ q.traverse(c=>{ if(c.isMesh&&c.geometry.attributes.position)n+=c.geometry.attributes.position.count; }); return n; },0):0}; }}); }
