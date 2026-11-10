// THE RIDE: RIDE carries you on a thing you hold and then stand on or hang from — any item whose GRANTS is a kind registered here (ride: a hoverboard; lift: a balloon). Hold it and click to get on, click again to get off; WASD steers it, SPACE hops; others see you on it.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, FORAGE, ITEMS, keys, LEVELS, ONLINE, pos, RAG, RIDE, ROOMS, SFX, SPEED, st, VIT, VLOOK, W3, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
import {collide} from './075-main-13.js';
Object.assign(RIDE,{on:null,kind:null,v:0,hd:0,lift:0,z:0,vz:0,dry:false,ease:20,kinds:{},mesh:null,lean:0,knock:0}); window.RIDE=RIDE;
{ const T=TILE, say=(t,c)=>SAY(t,c||'#e8e2cc'), prop=(id,k)=>ITEMS.prop?ITEMS.prop(id,k):undefined, V3=THREE.Vector3, wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
  // a kind: {name, hint, make(id) -> Object3D in metres, place(mesh, R, t) each frame, pose(R) -> the rig's st.ride, floor(g, R) -> how high you are, step(R, dt, input) -> true when it moves you itself, dry: over water too, hand(id) -> what you carry when it is not what you ride (a saddle)}
  RIDE.kind=(grant,k)=>{ RIDE.kinds[grant]=k; for(const id of ITEMS.ids?ITEMS.ids():[])if(prop(id,'grants')===grant)hold(id,k); };
  // a kind you board where it stands instead of carrying it (a parked car): registered under its own id with world:true; hide:true draws no rider (you are inside it); seat(m) gives where the rider sits in the mesh and fit(m) how much smaller to draw them there
  const kindOf=id=>RIDE.kinds[prop(id,'grants')]||(RIDE.kinds[id]&&RIDE.kinds[id].world?RIDE.kinds[id]:null); RIDE.kindOf=kindOf;
  // what you ride wears the owner's look for it (VLOOK, by the item's id; a car is dressed by its own maker)
  const made=id=>{ const k=kindOf(id), m=k.make(id); return k.world||k.noLook?m:VLOOK.dress(id,m); };
  const M=new Map(); CLOCK.movers.push(()=>M.values()); const mesh=id=>{ let m=M.get(id); if(!m){ m=made(id); m.userData.anyRoom=true; m.traverse(c=>{ if(c.isMesh){ c.castShadow=true; c.userData.ownMat=true; } }); scene.add(LEVELS.own(m,'*')); M.set(id,m); } return m; };
  // held, it is a WIELD tool: a click gets on; on it, a click (or the same key) gets off
  const hold=(id,k)=>{ const w={name:(FORAGE.NM&&FORAGE.NM[id])||id.toUpperCase(),hint:k.hint||'E GETS ON; E GETS OFF.',make:()=>{ const g=(k.hand||k.make)(id); g.scale.multiplyScalar(k.held||.6); g.head=new V3(0,.4,0); return g; },ekey:1,use:()=>{ RIDE.on?(RIDE.cur&&RIDE.cur.leave?RIDE.cur.leave(RIDE):RIDE.off()):RIDE.mount(id); },aim:(dt,aim)=>{ aim.set(Math.sin(SHARED.heading)*.25,-.95,Math.cos(SHARED.heading)*.25).normalize(); return true; }};
    (WIELD.pend=WIELD.pend||[]).push([id,w]); if(WIELD.kind)WIELD.kind(id,w); };
  const indoors=()=>{ const c=ROOMS.cur, o=c&&c.off&&ROOMS.off[c.off]; return !!c&&!(o&&o.outdoor); };   // an off-map place can be outdoors (ROOMS.off[id].outdoor): ride there
  const free=()=>!(RAG.on||st.water&&st.water.in||st.climb||st.hang||st.sit||VIT.dead||VIT.out>0);
  RIDE.mount=id=>{ '@later'; const k=kindOf(id); if(!k||!k.world&&!FORAGE.has(id))return false; if(indoors()&&!k.inside)return say('NOT INDOORS. TAKE IT OUTSIDE.','#c8a090'),false; if(!free())return false;
    RIDE.on=id; RIDE.cur=k; RIDE.v=0; RIDE.hd=SHARED.heading; RIDE.z=0; RIDE.vz=0; RIDE.lean=0; RIDE.dry=!!k.dry; RIDE.ease=k.ease||20; RIDE.t0=performance.now(); st.move=null;
    st.ride=k.pose(RIDE); SHARED.target=null; if(k.on)k.on(RIDE); share(); say(k.onSay||'YOU STEP ON.'); if(SFX.play)SFX.play('step',{vol:.4,pitch:.7}); return true; };
  RIDE.off=(why,fall)=>{ '@later'; if(!RIDE.on)return; const k=RIDE.cur, id=RIDE.on; RIDE.on=null; RIDE.cur=null; RIDE.dry=false; RIDE.ease=20; st.ride=null; RIDE.lift=0; if(k&&k.off)k.off(id,fall); const m=M.get(id); if(m)m.visible=false; share();
    if(why)say(why,fall?'#c8a090':'#e8e2cc'); if(fall)SHARED.trip=k&&k.fly||true; };   // fly: how hard a fall throws you (SHARED.trip, 075)
  RIDE.floor=g=>{ const k=RIDE.cur; return k&&k.floor?k.floor(g,RIDE):g+RIDE.lift; };
  // the board's own motion: it keeps its speed, carves toward where you steer, brakes when you pull back; a wall at speed throws you off
  RIDE.steer=(dt,mx,mz)=>{ '@later'; const R=RIDE, k=R.cur, id=R.on; if(!k)return; const lost=!k.world&&!FORAGE.has(id)||!free()||(indoors()&&!k.inside); if(lost||!k.world&&WIELD.on!==id){ if(!lost&&k.leave)k.leave(R); else { R.off(ROOMS.cur?'YOU PICK IT UP; NOT INDOORS.':''); return; } }
    const ml=Math.hypot(mx,mz), vmax=(+prop(id,'speed')||5)*T*SPEED.of(k.cat||'boards'), acc=(k.acc||3)*T*SPEED.of(k.cat||'boards'), len=+prop(id,'len')||.8, input={mx,mz,ml};
    if(k.step&&k.step(R,dt,input))return;
    if(ml>0){ const want=Math.atan2(mx,mz), e=wrap(want-R.hd), back=Math.abs(e)>2.4&&R.v>.5*T;
      if(back)R.v=Math.max(0,R.v-acc*2.2*dt); else { const turn=(k.turn||2.6)/(1+R.v/T*.12*len)*dt, d=Math.max(-turn,Math.min(turn,e)); R.hd+=d; R.lean+=((d/Math.max(dt,1e-3))*.12-R.lean)*Math.min(1,dt*6); if(Math.abs(e)<1.4)R.v=Math.min(vmax,R.v+acc*dt*(1-R.v/vmax*.6)); } }
    else { R.v=Math.max(0,R.v-(k.drag||.5)*T*dt); R.lean*=1-Math.min(1,dt*4); }
    if(R.z>0||R.vz>0){ R.vz-=9.8*T*dt; R.z=Math.max(0,R.z+R.vz*dt); if(R.z===0&&R.vz<0){ R.vz=0; if(SFX.play)SFX.play('step',{vol:.5,pitch:.5}); } }
    if(keys.has(' ')&&!R.sp&&R.z===0&&k.hop!==false){ R.vz=(k.hop||3.2)*T; R.z=.001; } R.sp=keys.has(' ');
    const ox=pos.x, oz=pos.z, go=R.v*dt; pos.x+=Math.sin(R.hd)*go; pos.z+=Math.cos(R.hd)*go; (k.collide||collide)(pos);
    const moved=Math.hypot(pos.x-ox,pos.z-oz); if(go>.001&&moved<go*.5){ if(R.v>(k.knock||5.5)*T){ R.v=0; R.off('YOU HIT IT HARD AND FALL OFF.',true); return; } R.v*=.4; }
    SHARED.heading=R.hd; const gl=Math.sin(performance.now()/1000*2.6)*.012*T; R.lift=(k.lift||.3)*T+gl+R.z; st.ride=k.pose(R); };

  /* ---------- drawn each frame: yours under you, theirs under them ---------- */
  const theirs=new Map(); let shT=0;
  const share=()=>{ if(ONLINE.on&&ONLINE.send)ONLINE.send({t:'ride',b:RIDE.on||null}); shT=4; };
  ONLINE.hear.ride=msg=>{ '@later'; const o=ONLINE.others&&ONLINE.others.get(msg.id), id=typeof msg.b==='string'&&kindOf(msg.b)?msg.b:null, was=theirs.get(msg.id);
    if(was&&(!id||was.id!==id)){ was.m.removeFromParent(); VLOOK.live.delete(was.m); theirs.delete(msg.id); if(o&&o.S)o.S.ride=null; }
    if(id&&o&&!theirs.has(msg.id)){ const k=kindOf(id), m=made(id); m.userData.anyRoom=true; scene.add(LEVELS.own(m,'*')); theirs.set(msg.id,{id,k,m,R:{v:0,z:0,lean:0,hd:0,lift:(k.lift||.3)*T,pid:msg.id}}); } };
  RIDE.their=id=>{ const o=theirs.get(id); return o&&o.R; };   // another rider's board state (their tricks land on it, 146ib)
  const deck=()=>RIG.RIDEG.deck*(W3.group.scale.y||.046);
  SYS.add('life',dt=>{ const t=performance.now()/1000;
    for(const [id,m] of M)if(id!==RIDE.on)m.visible=false;
    if(RIDE.on){ const m=mesh(RIDE.on); m.visible=RIDE.cur.hide||RIDE.cur.seat||!(W3.group&&W3.group.visible===false); m.position.set(pos.x,SHARED.py+deck(),pos.z); m.rotation.set(0,RIDE.hd,0); RIDE.cur.place(m,RIDE,t); if((shT-=dt||0)<=0)share(); }
    for(const [pid,o] of theirs){ const R=ONLINE.others&&ONLINE.others.get(pid); if(!R||!R.fig||!R.p){ o.m.removeFromParent(); VLOOK.live.delete(o.m); theirs.delete(pid); continue; }
      const q=o.R; if(q.flip&&(q.flip.t+=dt||0)>q.flip.dur)q.flip=null; if(q.pushing)q.pt=(q.pt||0)+(dt||0)*1.3; if(R.S)R.S.ride=o.k.pose(o.R); const g=R.fig.g; o.m.visible=o.k.hide||o.k.seat||g.visible; o.m.position.set(g.position.x,g.position.y+RIG.RIDEG.deck*(g.scale.y||.046),g.position.z); o.R.hd=R.p.hd||0; o.m.rotation.set(0,o.R.hd,0); o.k.place(o.m,o.R,t); } },'146i-ride');
  const SEAT=new THREE.Vector3(), sitIn=(g,k,m)=>{ m.updateMatrixWorld(true); m.localToWorld(k.seat(m,SEAT)); const f=k.fit?k.fit(m):1; g.scale.multiplyScalar(f); m.getWorldQuaternion(g.quaternion); SEAT.y-=RIG.RIDEG.sit*g.scale.y; g.position.copy(SEAT); g.updateMatrixWorld(true); };
  SYS.add('cam',()=>{ if(RIDE.on&&RIDE.cur){ if(RIDE.cur.seat)sitIn(W3.group,RIDE.cur,mesh(RIDE.on)); else if(RIDE.cur.hide)W3.group.visible=false; }
    for(const [pid,o] of theirs)if(o.k.hide||o.k.seat){ const R=ONLINE.others&&ONLINE.others.get(pid); if(!R||!R.fig)continue; if(o.k.seat)sitIn(R.fig.g,o.k,o.m); else R.fig.g.visible=false; } },'146i-ride');   // after the view sets who is drawn
  window.RIDEDBG=()=>({on:RIDE.on,v:+(RIDE.v/T).toFixed(2),hd:+RIDE.hd.toFixed(2),lift:+(RIDE.lift/T).toFixed(2),py:+SHARED.py.toFixed(2),ride:st.ride&&st.ride.k,kinds:Object.keys(RIDE.kinds),theirs:[...theirs].map(([id,o])=>({id,b:o.id,shown:o.m.visible}))});
}
