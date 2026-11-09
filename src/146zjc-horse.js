// THE HORSE (owner, 9 Nov 2026: "add horse that you can ride, saddle. give all players this. real size. real horse animation riding. add cowboy hat to inventory"): every player's SADDLE calls their own saddled quarter horse (Polyfork's, life size, through PETS); hold it and E: you swing up; W walks (held, it trots), Shift gallops, A D turn, S halts and backs; E gets down and it waits there; others see you ride. And the COWBOY HAT.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INSPECT, INV, keys, ONLINE, PETS, pos, RIDE, ROOMS, SFX, SPEED, st, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
import {collide} from './075-main-13.js';
const HORSE={}; window.HORSE=HORSE;
{ const WU=TILE/.84, V3=THREE.Vector3, say=(t,c)=>SAY(t,c||'#e8e2cc'), wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
  FORAGE.add({names:{saddle:'SADDLE',cowboyhat:'COWBOY HAT'},prices:{saddle:120,cowboyhat:25}});
  // given once to everyone, new and old, kept with the account
  SYS.onStart(()=>{ const S=FORAGE.S; if(!S||S.horse1)return; for(const id of ['saddle','cowboyhat'])INV.items[id]=Math.max(INV.items[id]||0,1); S.horse1=1; if(INV.save)INV.save(); if(FORAGE.save)FORAGE.save(); },'146zjc-horse');

  /* ---------- the horse: a quarter horse, withers at 1.55 m; its coat yours (kept with the account), shared so others see the same horse ---------- */
  const BREED='quarterhorse', LONG=2.85;   // (its length in the pets' metres: beside the rider a horse 1.55 m at the withers, the player standing 1.75 m)
  const COATS=[['BAY','#7a4526','#1e1a18','#1e1a18'],['SORREL','#b4622e','#b4622e','#b4622e'],['BUCKSKIN','#c8a46a','#1e1a18','#1e1a18'],['PALOMINO','#d8b066','#d8b066','#ece8e0'],['BLACK','#1e1a18','#1e1a18','#1e1a18'],['GREY','#c8c4bc','#9a948c','#ece8e0'],['DUN','#b89870','#1e1a18','#1e1a18'],['CHESTNUT','#a0522d','#a0522d','#a0522d']];
  let COAT=+OWNED.get('horse'); if(!(COAT>=0&&COAT<COATS.length)){ COAT=Math.floor(Math.random()*COATS.length); try{ OWNED.set('horse',String(COAT)); }catch(e){} }
  ONLINE.mine.hs=()=>COAT;
  const look=c=>PETS.idx().then(I=>{ const K=I.by[BREED], C=COATS[c]||COATS[0], pr={coat:C[1],points:C[2],hair:C[3]}; return {k:BREED,n:'',c:K.zones.map(([z,d])=>pr[z]||d),s:(K.s0||[]).slice(),z:100,h:false}; });

  /* ---------- the saddle, in metres (x across, y up, z toward the head; its seat at 0): a western saddle on a striped blanket, horn, cantle, fenders, stirrups, the cinch ---------- */
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), LEA=lam(0x6a3c1e), LEAD=lam(0x3e2210), BLK=lam(0x9a2a22), BLC=lam(0xe2d2a8), IRON=lam(0x8a8478);
  const shell=(r,len,arc,m,y0)=>{ const g=new THREE.CylinderGeometry(r,r,len,16,1,true,-arc/2,arc); g.rotateX(Math.PI/2); g.rotateZ(Math.PI/2); g.translate(0,y0-r,0); const me=new THREE.Mesh(g,m); me.material.side=THREE.DoubleSide; return me; };
  const box=(w,h,d,m,x,y,z,rx=0,rz=0)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); me.position.set(x,y,z); me.rotation.set(rx,0,rz); return me; };
  const saddle=()=>{ const G=new THREE.Group();
    G.add(shell(.3,.78,2.3,BLK,-.06),shell(.302,.7,2.32,BLC,-.058),shell(.304,.62,2.34,BLK,-.056));   // the blanket, a cream stripe through it
    G.add(shell(.29,.56,1.7,LEA,-.02));   // the skirts and seat
    { const s=box(.3,.04,.36,LEAD,0,-.005,-.02); G.add(s); }
    G.add(box(.26,.12,.06,LEA,0,.04,.2,-.35),box(.06,.11,.06,LEAD,0,.12,.25));   // the fork and the horn's post
    { const cap=new THREE.Mesh(new THREE.CylinderGeometry(.05,.045,.025,12),LEAD); cap.position.set(0,.185,.26); G.add(cap); }
    G.add(box(.3,.13,.05,LEA,0,.05,-.25,.4));   // the cantle
    for(const s of [1,-1]){ const F=new THREE.Group(); F.position.set(s*.27,-.06,.02); F.rotation.z=s*.12; G.add(F);
      F.add(box(.03,.44,.2,LEA,0,-.22,0)); F.add(box(.012,.07,.012,LEAD,0,-.47,0));
      const st=new THREE.Mesh(new THREE.TorusGeometry(.06,.012,6,12,Math.PI),IRON); st.position.set(0,-.5,0); st.rotation.set(0,Math.PI/2,Math.PI); F.add(st); F.add(box(.13,.012,.05,IRON,0,-.56,0,0,0).rotateY(Math.PI/2)); }
    { const c=new THREE.Mesh(new THREE.CylinderGeometry(.33,.33,.06,18,1,true),LEAD); c.rotation.x=Math.PI/2; c.scale.set(.9,1.25,1); c.position.set(0,-.36,.06); c.material.side=THREE.DoubleSide; G.add(c); }
    G.traverse(c=>{ if(c.isMesh){ c.castShadow=true; c.userData.ownMat=true; } }); return G; };
  const hat=()=>{ const G=new THREE.Group(), F=lam(0x8a6a44), B=lam(0x3e2a1a), brim=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.012,24),F), crown=new THREE.Mesh(new THREE.CylinderGeometry(.085,.1,.12,16),F), band=new THREE.Mesh(new THREE.CylinderGeometry(.101,.101,.025,16),B);
    brim.scale.set(1,1,1.15); const p=brim.geometry.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i); p.setY(i,p.getY(i)+Math.max(0,Math.abs(x)-.1)*.5); } brim.geometry.computeVertexNormals();
    crown.position.y=.065; band.position.y=.02; G.add(brim,crown,band); G.traverse(c=>{ c.userData.ownMat=true; }); return G; };
  INSPECT.kinds.push({is:id=>id==='saddle'||id==='cowboyhat',make:id=>id==='saddle'?saddle():hat()});

  /* ---------- one horse in the world: a PETS body its rider drives; its back's skinned points give the saddle's place and the rider's seat ---------- */
  const A=new V3(), B=new V3(), C=new V3();
  const make=(key,coat,drive)=>{ const H={N:null,sad:saddle(),seatW:new V3(),ok:false}; H.sad.visible=false;
    look(coat).then(P=>PETS.make(key,P,()=>null,{drive:N=>drive(H,N),gait,long:LONG})).then(N=>{ if(!N)return; if(H.gone){ PETS.drop(N); return; } H.N=N; N.farMove=()=>{ const D=drive(H,N); if(D){ N.st.x=D.x; N.st.z=D.z; N.st.h=D.h; } }; N.farMove();
      if(N.th){ const j=UI.things.indexOf(N.th); if(j>=0)UI.things.splice(j,1); N.th=null; }
      const me=N.me, P=me.geometry.attributes.position, n=P.count; let y0=1e9,y1=-1e9,z0=1e9,z1=-1e9; for(let i=0;i<n;i++){ const y=P.getY(i), z=P.getZ(i); y0=Math.min(y0,y); y1=Math.max(y1,y); z0=Math.min(z0,z); z1=Math.max(z1,z); }
      const top=zz=>{ let b=-1, by=-1e9; for(let i=0;i<n;i++){ if(Math.abs(P.getX(i))>.06*(y1-y0)||Math.abs(P.getZ(i)-zz)>.04*(z1-z0))continue; const y=P.getY(i); if(y>by){ by=y; b=i; } } return b; };
      const zc=z0+(z1-z0)*HORSE.at; H.vi=[top(zc),top(zc+(z1-z0)*.12),top(zc-(z1-z0)*.12)]; H.k=(z1-z0)/LONG;   // (model units a metre)
      N.body.add(H.sad); H.sad.scale.setScalar(H.k); H.ok=H.vi.every(i=>i>=0); }).catch(e=>console.warn('HORSE',e));
    return H; };
  HORSE.at=.45;   // (where the saddle sits along the body, rump to nose)
  // its gait for its speed (m/s): the walk to about 2.8 (a stride of 1.3 m and more), then the run clip as a canter and a gallop (a longer stride, faster)
  const gait=v=>v<.12?{c:'idle',f:0}:v<2.8?{c:'walk',f:v/(1.25+.3*v)}:{c:'run',f:v/(1.6+.4*v)};
  // each frame: the saddle on the back where its skinned points are, tipped with the back; the seat a little above it
  const fit=H=>{ const N=H.N; if(!N||!H.ok||!N.g.visible){ H.sad.visible=false; return false; } N.g.updateMatrixWorld(true); const me=N.me;
    me.getVertexPosition(H.vi[0],A); me.getVertexPosition(H.vi[1],B); me.getVertexPosition(H.vi[2],C);
    H.sad.visible=true; H.sad.position.copy(A); const dz=B.z-C.z, dy=B.y-C.y; H.sad.rotation.set(-Math.atan2(dy,dz),0,0);
    me.localToWorld(H.seatW.copy(A)); H.seatW.y-=.02*WU; return true; };
  HORSE.fit=fit;

  /* ---------- yours: ridden, or waiting where you left it (hidden while you are indoors or on another level) ---------- */
  let mine=null, park=null;
  const indoors=()=>{ const c=ROOMS.cur, o=c&&c.off&&ROOMS.off[c.off]; return !!c&&!(o&&o.outdoor); };
  const mineDrive=(H,N)=>{ if(RIDE.on==='saddle')return {x:pos.x,z:pos.z,y:SHARED.py,h:RIDE.hd,v:RIDE.v/WU,ghost:true};
    if(park&&park.lv===(SHARED.LVL||'up')&&!indoors())return {x:park.x,z:park.z,y:SHARED.groundY?SHARED.groundY(park.x,park.z):0,h:park.h,v:0}; return null; };
  const mineH=()=>mine||(mine=make('horse-mine',COAT,mineDrive));
  const POSE={k:'horse',lean:0,steer:0,z:0,th0:40,th1:30,sh0:-6,sh1:14,ft:-6,ua0:34,ua1:10,fa0:76,fa1:6}; HORSE.POSE=POSE;
  const V=HORSE.V={walk:1.7,trot:3.8,gallop:12,back:.8};
  let fwdT=0;
  const k={name:'HORSE',hint:'E CALLS YOUR HORSE AND YOU SWING UP. W WALKS (HOLD IT: A TROT), SHIFT GALLOPS, A D TURN, S HALTS, E GETS DOWN.',onSay:'YOU SWING UP INTO THE SADDLE.',held:1,hand:()=>saddle(),
    make:()=>new THREE.Group(), noLook:true, lift:.001, hop:false, knock:1e9, ease:12,
    on:R=>{ const H=mineH(), d=park?Math.hypot(park.x-pos.x,park.z-pos.z)/WU:1e9;
      if(park&&d<4&&park.lv===(SHARED.LVL||'up')){ pos.x=park.x; pos.z=park.z; R.hd=park.h; } else say('YOU WHISTLE. YOUR HORSE TROTS UP.');
      park=null; fwdT=0; SHARED.heading=R.hd; if(SFX.play)SFX.play('step',{vol:.6,pitch:.5}); },
    off:()=>{ park={x:pos.x,z:pos.z,h:RIDE.hd,lv:SHARED.LVL||'up'}; const sx=Math.cos(park.h)*.9*WU, sz=-Math.sin(park.h)*.9*WU; pos.x+=sx; pos.z+=sz; collide(pos); },
    pose:R=>{ POSE.lean=Math.max(-.6,Math.min(1,R.v/WU/V.gallop*1.2-(R.brk||0))); POSE.steer=R.lean||0; return POSE; },
    seat:(m,o)=>{ const H=m.userData.H||(m.userData.mine?mine:null); if(!H||!fit(H))return o.set(0,1.45*WU,0); return m.worldToLocal(o.copy(H.seatW)); }, fit:()=>1,
    // its own motion: a horse's paces, not a board's glide; it turns slower the faster it goes and pulls up at a wall
    step:(R,dt,{mx,mz,ml})=>{ let want=0, e=0;
      if(ml>0){ e=wrap(Math.atan2(mx,mz)-R.hd); if(Math.abs(e)>2.4){ want=R.v>.2*WU?0:-V.back; e=0; } else { fwdT+=dt; want=(keys.has('shift')?V.gallop:fwdT>1.6?V.trot:V.walk)*SPEED.of('horse'); } } else fwdT=0;
      const v=R.v/WU, a=want>v?(want>V.trot?2.6:1.8):(ml>0?4:3); R.brk=want<v-1.5?Math.min(1,(v-want)/6):0;
      const nv=want>v?Math.min(want,v+a*dt):Math.max(want,v-a*dt), turn=(1.7/(1+Math.abs(nv)*.12))*dt, d=Math.max(-turn,Math.min(turn,e));
      R.hd+=d; R.lean+=((d/Math.max(dt,1e-3))*.5-R.lean)*Math.min(1,dt*5); R.v=nv*WU;
      const ox=pos.x, oz=pos.z, go=R.v*dt; pos.x+=Math.sin(R.hd)*go; pos.z+=Math.cos(R.hd)*go; collide(pos);
      const nose={x:pos.x+Math.sin(R.hd)*Math.sign(go||1)*1.1*WU,z:pos.z+Math.cos(R.hd)*Math.sign(go||1)*1.1*WU}, nx=nose.x, nz=nose.z; collide(nose);
      if(Math.abs(go)>1e-4&&(Math.hypot(pos.x-ox,pos.z-oz)<Math.abs(go)*.5||Math.hypot(nose.x-nx,nose.z-nz)>.02*WU)){ pos.x=ox; pos.z=oz; if(R.v>V.trot*WU)say('YOUR HORSE PULLS UP SHORT.'); R.v=0; }
      SHARED.heading=R.hd; R.lift=1.0*WU; st.ride=k.pose(R); return true; },
    place:(m,R)=>{ if(R===RIDE){ m.userData.mine=true; return; } let H=m.userData.H; const o=ONLINE.others&&ONLINE.others.get(R.pid);
      if(!H){ H=m.userData.H=make('horse-'+R.pid,o&&o.x&&o.x.hs>=0?+o.x.hs:0,(H,N)=>{ if(!m.parent)return null; const t=performance.now(), p=m.position; if(H.lt){ const dd=Math.hypot(p.x-H.lx,p.z-H.lz)/WU, dts=(t-H.lt)/1000; if(dts>0)H.v+=(Math.min(16,dd/dts)-H.v)*Math.min(1,dts*4); } H.lt=t; H.lx=p.x; H.lz=p.z;
        return {x:p.x,z:p.z,y:SHARED.groundY?SHARED.groundY(p.x,p.z):p.y,h:m.rotation.y,v:H.v}; }); H.v=0; THEIRS.add(H); H.m=m; } } };
  RIDE.kind('horse',k);
  const THEIRS=new Set();
  SYS.add('life',()=>{ if(mine)fit(mine); for(const H of THEIRS){ if(!H.m.parent){ H.gone=true; if(H.N)PETS.drop(H.N); THEIRS.delete(H); continue; } fit(H); } },'146zjc-horse');
  HORSE.dbg=()=>({on:RIDE.on,v:+(RIDE.v/WU).toFixed(2),park,mine:!!(mine&&mine.N),ok:!!(mine&&mine.ok),seat:mine&&mine.seatW.toArray().map(v=>+(v/WU).toFixed(2)),theirs:THEIRS.size});
}
