// THE CREW AND THE FLEA MARKET: polyfork.dev's stalls, street furniture and diner fittings (data/polyfork.json) put where data/world.json's things say; the cast (every character in characters.json with a pf body, data/cast/<group>.json) loaded a place at a time as you come near, on your rig, handed to JOBS; CREW.door/inside/spot say where each place's door, inside and work spot are (an inside's own spots by job title: ROOMS.off[id].spots; its seats for anyone else: ROOMS.off[id].seats).
import {SHARED, THREE} from './003-shx.js';
import {B64, F32} from './003a-skin.js';
import {ARCH, CITY, PARK, pos, ROOMS, SHOPS, WED} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, MAPG, MODS, QS, SOL, STORE, SYS, TILE} from './006-map-pre.js';
import {stfree} from './076-npc-map.js';
import {BODIES} from './111a-bodies.js';
const CREW={list:[],loaded:{},hd:{},alias:{play:'playhouse',bath:'dojo',feel:'store:feel-lab'}};
{ const PF=SYS.far(__LAZY__("data/polyfork.json")), FM=window.FLEA=MODS.flea={made:[],want:(LEVEL.things||[]).length}; window.CREW=CREW;
  const G={arcade:__LAZY__("data/cast/arcade.json"),art:__LAZY__("data/cast/art.json"),bank:__LAZY__("data/cast/bank.json"),bar:__LAZY__("data/cast/bar.json"),bath:__LAZY__("data/cast/bath.json"),
    boards:__LAZY__("data/cast/boards.json"),bodega:__LAZY__("data/cast/bodega.json"),castle:__LAZY__("data/cast/castle.json"),clinic:__LAZY__("data/cast/clinic.json"),commute:__LAZY__("data/cast/commute.json"),
    depot:__LAZY__("data/cast/depot.json"),diner:__LAZY__("data/cast/diner.json"),feel:__LAZY__("data/cast/feel.json"),firehouse:__LAZY__("data/cast/firehouse.json"),fixit:__LAZY__("data/cast/fixit.json"),
    flea:__LAZY__("data/cast/flea.json"),hall:__LAZY__("data/cast/hall.json"),hudson:__LAZY__("data/cast/hudson.json"),lake:__LAZY__("data/cast/lake.json"),loop:__LAZY__("data/cast/loop.json"),
    museum:__LAZY__("data/cast/museum.json"),night:__LAZY__("data/cast/night.json"),park:__LAZY__("data/cast/park.json"),play:__LAZY__("data/cast/play.json"),post:__LAZY__("data/cast/post.json"),
    precinct:__LAZY__("data/cast/precinct.json"),theatre:__LAZY__("data/cast/theatre.json"),town:__LAZY__("data/cast/town.json"),'v-casino':__LAZY__("data/cast/v-casino.json"),
    'v-frontier':__LAZY__("data/cast/v-frontier.json"),'v-halloween':__LAZY__("data/cast/v-halloween.json"),'v-japan':__LAZY__("data/cast/v-japan.json"),'v-mountain':__LAZY__("data/cast/v-mountain.json"),
    'v-space':__LAZY__("data/cast/v-space.json"),'v-stadium':__LAZY__("data/cast/v-stadium.json")};
  const T=TILE, hsh=s=>{ let h=7; for(const c of s)h=(h*31+c.charCodeAt(0))>>>0; return h; }, W=(x,y)=>({x:SHARED.BOD.XS(x),z:SHARED.BOD.ZS(y)});
  /* ---------- where a place is: its door on the street, a spot inside it, a work spot or area out of doors ---------- */
  CREW.door=at=>{ if(!at)return null; const a=CREW.alias[at]||at, R=ROOMS.off[a];
    if(R&&R.out)return {x:R.out[0],z:R.out[1]};
    const P=(LEVEL.places||[]).find(p=>p.id===at);
    if(P&&P.door)return W(P.door[0],P.door[1]);   // a place that names its door (the fair's gate)
    if(P){ const cx=(P.x0+P.x1)/2; if(P.y1==null)return W(cx,LEVEL.block.front+.9); const cy=(P.y0+P.y1)/2, f=P.face||'n';
      return f==='e'?W(P.x1+.9,cy):f==='w'?W(P.x0-.9,cy):f==='s'?W(cx,P.y0-.9):W(cx,P.y1+.9); }
    if(at==='flea'){ const t=(LEVEL.things||[]).find(o=>o.k==='ftable'); return t?W(t.x,LEVEL.block.front+.9):null; }
    if(at==='lake'){ const L=LEVEL.parkPlaces.lake; return W(L.x+PARK.ox,L.y+PARK.oy); }
    if(at==='round')return W(PARK.round[0]+PARK.ox,PARK.round[1]+PARK.oy);
    if(at==='hudson')return W(117.5,-113);
    if(at==='street')return W(72,-72.5);
    try{ const p=CITY.place(a); if(p)return {x:p.door.x,z:p.door.z}; }catch(e){}
    return null; };
  for(const [id,nm] of [['hudson','TO THE HUDSON (THE PIER)'],['fishtables','THE FISH TABLES']]){ const d=CREW.door(id); if(d)STORE.places.push([nm,d.x,d.z,'up','see']); }   // GO TO: the way through to the river and its pier, the fish market's tables
  // an inside's own list of where people go: ROOMS.off[id] (rooms off the map) or STORE.rooms (the street's insides), each with spots (by job title) and seats ({x,z,hd,y}: y the seat's height, none to stand) and whether it lies off the map
  const insideOf=a=>ROOMS.off[a]||(STORE.rooms||[]).find(r=>r.id===a)||null, offOf=a=>!!ROOMS.off[a]||!!(insideOf(a)||{}).offmap;
  CREW.out=key=>{ for(const R of [...Object.values(ROOMS.off),...(STORE.rooms||[])]){ const t=R.taken; if(t)t.delete(key); } };   // their seat is free again
  CREW.inside=(at,key,job)=>{ '@later'; const a=CREW.alias[at]||at, R=insideOf(a), h=hsh(key||at), u=.25+.5*((h%97)/96), v=.25+.5*(((h>>7)%97)/96), off=offOf(a);
    const S=R&&R.spots&&job&&R.spots[job.title]; if(S)return {x:S.x,z:S.z,hd:S.hd,sit:S.y,off:S.off??off};   // a place's work spots, by job title
    if(R&&R.seats){ const T=R.taken||(R.taken=new Map()); let i=T.get(key); if(i==null){ const used=new Set(T.values()), n=R.seats.length; for(let k=0;k<n&&i==null;k++)if(!used.has((h+k)%n))i=(h+k)%n; if(i==null)return null; T.set(key,i); }   // a patron takes a free seat or place (none free: not in sight)
      const s=R.seats[i]; return {x:s.x,z:s.z,hd:s.hd,sit:s.y,off:s.off??off}; }
    if(R&&R.box){ const b=R.box; return {x:b.x0+u*(b.x1-b.x0),z:b.z0+v*(b.z1-b.z0),off:true}; }
    const P=['bar','museum','bank','art','theatre'].includes(at)&&(LEVEL.places||[]).find(p=>p.id===at);
    if(P){ const y0=P.y1==null?LEVEL.block.back:P.y0, y1=P.y1==null?LEVEL.block.front:P.y1; return W(P.x0+u*(P.x1-P.x0),y0+v*(y1-y0)); }
    return null; };
  const band=(x0,x1,rows)=>{ const f=()=>{ const r=rows[Math.floor(Math.random()*rows.length)]; return W(x0+Math.random()*(x1-x0),r[0]+Math.random()*(r[1]-r[0])); }; f.rects=rows.map(r=>{ const a=W(x0,r[0]), b=W(x1,r[1]); return [a.x,a.z,b.x,b.z]; }); return f; };
  const MKT=LEVEL.streets.market, WST=LEVEL.streets.west;
  CREW.spots={};   // a place's own work spots: spots[at](J) -> {x,z,hd,r} (the fair registers its posts)
  CREW.spot=J=>{ '@later'; const j=J.job, k=J.key, own=CREW.spots[j.at]&&CREW.spots[j.at](J); if(own)return own;
    if(j.spot==='street'||j.at==='street'){ const c=W(72,-72.5); c.band=band(MKT.x0+10,MKT.x1-10,[[-76,-69.5],[-46,-39.5]]); return c; }
    if(j.spot==='west'){ const c=W((WST.x0+WST.x1)/2,0); c.band=band(WST.x0+1,WST.x1-1,[[-30,170]]); return c; }
    if(j.spot==='round')return CREW.door('round');
    if(j.at==='flea'&&!j.r&&LEVEL.homes[k]){ const H=LEVEL.homes[k]; return {...W(H[0],H[1]),hd:CREW.hd[k]}; }
    if(j.at==='lake'){ const L=LEVEL.parkPlaces.lake, a=(hsh(k)%360)*Math.PI/180, r=(L.r||8)+1.4, c=W(L.x+PARK.ox,L.y+PARK.oy), p=W(L.x+PARK.ox+Math.cos(a)*r,L.y+PARK.oy+Math.sin(a)*r); return {...p,hd:Math.atan2(c.x-p.x,c.z-p.z)}; }
    return CREW.door(j.at); };
  /* ---------- the polyfork props ---------- */
  const geo=D=>{ const p=F32(D.p), col=B64(D.c), C=new Float32Array(col.length), c=new THREE.Color();
    for(let i=0;i<col.length;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(p,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals(); g.computeBoundingBox(); return g; };
  const GEO={}, geoOf=k=>FM.P&&FM.P[k]?(GEO[k]||(GEO[k]=geo(FM.P[k]))):null, mat=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});
  FM.mesh=k=>{ const g=geoOf(k); if(!g)return null; const me=new THREE.Mesh(g,mat), s=FM.P[k].metres*T/.84; me.scale.setScalar(s); me.castShadow=me.receiveShadow=true; return me; };
  const build=P=>{ FM.P=P; const B=SHARED.BOD, M=T/.84, things=LEVEL.things||[], kinds={}, m4=new THREE.Matrix4(), q=new THREE.Quaternion(), Y=new THREE.Vector3(0,1,0), root=MAPG.bodega||MAPG.street||scene;
    for(const o of things){ const D=P[o.k]; if(!D)continue; const K=kinds[o.k]||(kinds[o.k]={g:geoOf(o.k),s:D.metres*M,L:[]}), bb=K.g.boundingBox, a=o.rot||0, ca=Math.abs(Math.cos(a)), sa=Math.abs(Math.sin(a));
      const hx=(bb.max.x-bb.min.x)/2*K.s, hz=(bb.max.z-bb.min.z)/2*K.s, ex=ca*hx+sa*hz, ez=sa*hx+ca*hz;
      let x=B.XS(o.x), z=B.ZS(o.y); const ok=(x,z)=>{ for(let u=-1;u<=1;u++)for(let v=-1;v<=1;v++)if(!stfree(x+u*ex*.8,z+v*ez*.8,.05*T))return false; return true; };
      if(!ok(x,z)){ let f=null; for(let k=1;k<=12&&!f;k++)for(const s of [1,-1])if(!f&&ok(x+s*k*.35*T,z))f=x+s*k*.35*T; if(f==null)continue; x=f; }
      const y=SHARED.groundY?SHARED.groundY(x,z):0, sol=[x-ex,z-ez,x+ex,z+ez], fix=[x-ex,z-ez,y,x+ex,z+ez,y+D.metres*M*.95]; SOL.up.push(sol); FIX.up.push(fix);
      K.L.push({o,x,y,z,a,sol,fix}); }
    for(const k in kinds){ const K=kinds[k], me=new THREE.InstancedMesh(K.g,mat,K.L.length);
      K.L.forEach((t,i)=>me.setMatrixAt(i,m4.compose(new THREE.Vector3(t.x,t.y,t.z),q.setFromAxisAngle(Y,t.a),new THREE.Vector3(K.s,K.s,K.s))));
      me.castShadow=me.receiveShadow=true; me.computeBoundingSphere(); root.add(me); WED.meshes.push({place:'street',me,items:K.L.map((t,i)=>({k:'pf-'+k+'-'+i,x:t.x,y:t.y,z:t.z,sol:t.sol,fix:t.fix}))}); FM.made.push(...K.L.map(t=>({k,...t}))); }
    for(const t of FM.made){ const w=t.o.who; if(!w)continue; const K=kinds[t.k], bz=K.g.boundingBox.min.z*K.s-.35*M, a=t.a;
      LEVEL.homes[w]=[(t.x+Math.sin(a)*bz-B.XS(0))/T,(t.z+Math.cos(a)*bz-B.ZS(0))/T,0,null]; CREW.hd[w]=a; } };
  /* ---------- the cast: a group's bodies when you come near its place ---------- */
  const REC=LEVEL.chars||{}, members={};
  for(const k in REC){ const r=REC[k]; if(r&&r.pf&&r.group&&G[r.group]&&!ARCH.has(k))(members[r.group]=members[r.group]||[]).push(k); }
  const anchor=g=>{ const H=members[g].map(k=>LEVEL.homes&&LEVEL.homes[k]).filter(h=>h&&h[2]===0); if(H.length)return H.map(h=>({x:SHARED.BOD.XS(h[0]),z:SHARED.BOD.ZS(h[1])}));   // every teacher's own spot (owner, 5 Nov 2026): the group comes when you near any of them (a shop's keeper inside it, the rest outdoors)
    const k=members[g][0], at=REC[k].job&&REC[k].job.at, d=at==='street'||!at?null:CREW.door(at); return d?[d]:[]; };
  let busy=false;
  const tick=()=>{ if(busy||SHARED.LVL!=='up')return; let best=null, bd=90*T;
    for(const g in members){ if(CREW.loaded[g])continue; const A=anchor(g), d=A.length?Math.min(...A.map(a=>Math.hypot(a.x-pos.x,a.z-pos.z))):0; if(d<bd){ bd=d; best=g; } }
    if(!best)return; busy=true; CREW.loaded[best]=true;
    G[best]().then(D=>{ for(const k of members[best]){ const b=D.bodies[k]; if(!b)continue; const r=REC[k];
        BODIES.rebaked(D,k,r.name||'SOMEONE',0,{size:b.height/1.8,hd:CREW.hd[k]});
        const N=BODIES.by[k]&&BODIES.by[k].npc; if(N)CREW.list.push({key:k,N,job:r.job,rec:r}); }
      if(SHOPS.sync)SHOPS.sync(); }).catch(e=>console.warn('CAST',best,e)).finally(()=>{ busy=false; }); };
  CREW.all=()=>{ for(const g in members)CREW.loaded[g]||(CREW.loaded[g]=false); return Object.keys(members); };
  CREW.bring=async()=>{ '@later'; for(const g in members)if(!CREW.loaded[g]){ CREW.loaded[g]=true; const D=await G[g](); for(const k of members[g]){ const b=D.bodies[k], r=REC[k]; if(!b)continue; BODIES.rebaked(D,k,r.name||'SOMEONE',0,{size:b.height/1.8,hd:CREW.hd[k]}); const N=BODIES.by[k]&&BODIES.by[k].npc; if(N)CREW.list.push({key:k,N,job:r.job,rec:r}); } } if(SHOPS.sync)SHOPS.sync(); };
  SYS.onStart(()=>LOAD('later').then(()=>PF()).then(build).catch(e=>console.warn('FLEA',e)).finally(()=>{ CREW.ready=true; if(QS.get('cast')!=='0'){ setInterval(tick,1500); tick(); } }),'111fb-cast');
}
export {CREW};
