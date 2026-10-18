// ---- NPC LIVES (owner, 17 Oct 2026, the budget: "far characters neither drawn nor moved"; the plan paused on 17 Oct 2026: off-screen characters
// exist only as numbers, with real daily lives by the clock, shown only when near or seen). Every character on the street who isn't a guard has
// a day: asleep at home till seven (the apartment house's hall, the apartment building's lobby or hallway), breakfast at the Diner, his work
// (the bodega, the dojo, the stalls by the park's gate, the park, the castle, the subway's platform), lunch, work again, the evening on the street
// or in the park (the street as full at seven as it always was), a few to the Bar, home to bed by eleven; each one's hours shifted a little
// from the next's. The guards (the skeletons, the droids) keep their beats; the creatures their grounds. A character you can't see (out of the
// camera's picture and more than four tiles from you, indoors where you aren't, on a level not shown) is neither drawn nor his rig run: his
// numbers walk him instead, four times a second, along the street's lanes (the shops' sidewalk, the road, the far one; the kerb half of the
// sidewalk passes the subway's stair hole) and each place's own way in (its door, then its room), round poles and things by a sidestep,
// never through a wall; down the subway's or the castle's stair, his level and group switched halfway as yours are. Coming into the picture he
// is handed back to his own tick where his numbers are (no pop: they share one state, st); going out of it his numbers carry on from where he
// stood. A far character blocks no one and pushes no one (makeNPC's walk, collide, clip.js), and is in no shadow pass (not drawn).
// ?lives=1 a small list of every character: his state, his place, whether he's drawn. ?lives=0 off (every character as before).
// COST (measured in the cloud's software Chromium, 51 characters, tests/livescheck.cjs): LIVES.tick 0.04-0.1 ms a frame on average (the 4 Hz
// step 0.2-0.3 ms when it runs); a frame (every pass, the shadow maps too) with every other character far draws 316,600 fewer triangles and
// 131 fewer draw calls than with all of them near (2,019,700 / 393); by the rule at seven in the evening (37 of 51 far) 411,400 fewer
// triangles and 187 fewer calls. No new lights, no new programs ----
const LIVES={on:QS.get('lives')!=='0',ready:false,ms:0,stepMs:0,list:[],force:null,skips:0};
{ const T=TILE, X=BOD.XS, Z=BOD.ZS, XB=BOD.X, ZB=BOD.Z, M=BOD.MAP, LS=BOD.K.LSEED, HZ=.25, R=.3, d2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  // THE STREET'S LANES (the game's tiles, y): the kerb half of the shops' sidewalk (clear of the subway's stair hole, open to the kerb), the
  // road's middle, the far sidewalk; the stair hole, kept out of while wandering (you'd fall in)
  const ZS_=Z(LS.street-1.5), ZR=Z((LS.street+LS.grass)/2), ZF=Z((LS.grass+M.y1)/2), HOLE=[X(MAPSTAIR.x0-.6),Z(MAPSTAIR.y0),X(MAPSTAIR.x1+.6),Z(MAPSTAIR.y1+.6)];
  const inHole=(x,z)=>x>HOLE[0]&&x<HOLE[2]&&z>HOLE[1]&&z<HOLE[3];
  // THE PLACES: each its door on a lane (where the street's walk ends), its way in (waypoints, the last his spot), its room to wander (a box, or a
  // reach round the spot), its level ('up' or 'down'), whether it has walls (indoors: shown only from inside it)
  const P={}; const place=(id,o)=>{ P[id]=Object.assign({id,lv:'up',walls:false,reach:1.5*T,path:[]},o); return P[id]; };
  // (a box in the given tiles → the world; a spot inside it)
  const bx=(Xf,Zf,r)=>({x0:Math.min(Xf(r[0]),Xf(r[2])),z0:Math.min(Zf(r[1]),Zf(r[3])),x1:Math.max(Xf(r[0]),Xf(r[2])),z1:Math.max(Zf(r[1]),Zf(r[3]))});
  const mid=(Xf,Zf,r)=>({x:(Xf(r[0])+Xf(r[2]))/2,z:(Zf(r[1])+Zf(r[3]))/2});
  LIVES.build=()=>{
    place('street',{door:null,reach:0});
    { const B=BOD.B0, dx=XB((B.x0+B.x1)/2); place('bodega',{walls:true,door:{x:dx,z:ZS_},path:[{x:dx,z:ZB(B.y1)+.6*T},{x:dx,z:ZB(B.y1)-3.4}],box:bx(XB,ZB,[B.x0+1,BOD.BODOFF+1,B.x1-1,B.y1-1]),reach:2.5*T}); }
    if(MODS.apts&&MODS.apts.A){ const A=MODS.apts.A, H=MODS.apts.H, dx=XB(A.x1-1.0), hm=(H.y0+H.y1)/2;
      place('apthouse',{walls:true,door:{x:dx,z:ZS_},path:[{x:dx,z:ZB(A.y1)+.6*T},{x:dx,z:ZB(A.y1)-1.2},{x:XB(A.x1-.75),z:ZB(hm)},{x:XB((A.x0+A.x1)/2),z:ZB(hm)}],box:bx(XB,ZB,[A.x0+.7,H.y0+.4,A.x1-.7,H.y1-.4]),reach:3*T}); }
    if(!AWAY.has('apartments')){ const Rm=POOLR.ROOMS||[], dx=POOLR.X(22.75), HY=(6.24+8.28)/2;   // (the apartment building off the map, owner 18 Oct 2026: AWAY, map-pre.js)
      place('lobby',{walls:true,door:{x:dx,z:ZS_},path:[{x:dx,z:POOLR.Z(16.8)+.6*T},{x:dx,z:POOLR.Z(15.6)},{x:dx,z:POOLR.Z(12)}],box:Rm[5]&&bx(POOLR.X,POOLR.Z,[Rm[5][0]+.8,Rm[5][1]+.8,Rm[5][2]-.8,Rm[5][3]-.8]),reach:2.5*T});
      place('hallway',{walls:true,door:{x:dx,z:ZS_},path:[{x:dx,z:POOLR.Z(16.8)+.6*T},{x:dx,z:POOLR.Z(15.6)},{x:dx,z:POOLR.Z(HY)},{x:POOLR.X(27.3*2/3-1),z:POOLR.Z(HY)},{x:POOLR.X(11),z:POOLR.Z(HY)}],box:Rm[3]&&bx(POOLR.X,POOLR.Z,[Rm[3][0]+.6,Rm[3][1]+.4,Rm[3][2]-.6,Rm[3][3]-.4]),reach:4*T}); }
    if(BOD.GD){ const G=BOD.GD, dx=XB(G.door[0]); place('dojo',{walls:true,door:{x:dx,z:ZS_},path:[{x:dx,z:ZB(G.door[1])+.8*T},{x:dx,z:ZB(G.door[1])-1.5*T},mid(XB,ZB,G.r)],box:bx(XB,ZB,[G.r[0]+1.2,G.r[1]+1.2,G.r[2]-1.2,G.r[3]-1.2]),reach:3*T}); }
    for(const [id,nm] of [['diner','diner'],['bar','bar']]){ const Rr=STORE.rooms.find(r=>r.id===nm); if(!Rr||Rr.fy)continue;   // (the Diner and the Bar on the street; a stacked room has no way in on foot)
      place(id,{walls:true,door:{x:Rr.at.x,z:ZS_},path:[{x:Rr.at.x,z:Rr.z1+.6*T},{x:Rr.at.x,z:Rr.at.z}],box:{x0:Rr.x0+.8*T,z0:Rr.z0+.8*T,x1:Rr.x1-.8*T,z1:Rr.z1-.8*T},reach:3*T}); }
    { const gx=X((PARK.gate[0]+PARK.gate[1])/2+PARK.ox), gz=Z(PARK.y0+PARK.oy), rd={x:X(PARK.round[0]+PARK.ox),z:Z(PARK.round[1]+PARK.oy)};
      place('park',{door:{x:gx,z:ZF},path:[{x:gx,z:gz+.9*T},{x:gx,z:gz-1.2*T},rd],reach:5*T,grass:true});
      place('stalls',{door:{x:gx,z:ZF},path:[{x:gx,z:gz+.9*T},{x:gx,z:gz-1.2*T},{x:gx+2.5*T,z:gz-4*T}],reach:2.5*T,grass:true});
      // the castle: along the park's two ways (the gate's to the round, the end-to-end one), then up the lawn to its gate, into the bailey
      const C=CASTLE, cg={x:X(C.gate),z:Z(C.b[2])}, bail={x:X(C.gate),z:Z((C.b[2]+C.b[3])/2+1)};
      const up=[{x:gx,z:gz+.9*T},{x:gx,z:gz-1.2*T},rd,{x:cg.x+1.5*T,z:rd.z},{x:cg.x+1.5*T,z:cg.z-2.5*T},{x:cg.x,z:cg.z-2.5*T},{x:cg.x,z:cg.z+1.5*T}];   // (up the lawn a step east of the gate's line: a lamp stands on it)
      place('castle',{door:{x:gx,z:ZF},path:[...up,bail],reach:3*T,grass:true});
      // the dungeon: through the bailey to the stair's top, down it (his level switches halfway), to the hall's middle
      const S=C.stair, Hh=C.hall, sx=X((S.x0+S.x1)/2), hm={x:X((Hh.x0+Hh.x1)/2),z:Z((Hh.y0+Hh.y1)/2)};
      place('dungeon',{lv:'down',door:{x:gx,z:ZF},path:[...up,{x:sx,z:Z(S.y0)-.35*T},{x:sx,z:Z(S.y0)+.3*T},{x:sx,z:Z(S.y1)-.3*T,lv:'down'},{x:sx,z:Z(S.y1)+.55*T,lv:'down'},{x:hm.x,z:Z(S.y1)+.55*T,lv:'down'},{...hm,lv:'down'}],box:{x0:X(Hh.x0+1.5),z0:Z(Hh.y0+1.5),x1:X(Hh.x1-1.5),z1:Z(Hh.y1-1.5)},reach:3*T}); }   // (walls: not set: its own group is shown only from below, as its level is)
    { const S=MAPSTAIR, sx=X((S.x0+S.x1)/2), plat=MODS.station.plat;   // (the platform: the menu's spot)
      if(MODS.station.path)place('subway',{lv:'down',door:{x:sx,z:ZS_},path:[{x:sx,z:Z(S.y1)+.5*T},...MODS.station.path],reach:4*T});   // (THE METRO's way down, metro.js: the flight, the corridor, the gates, the platform; owner 18 Oct 2026)
      else place('subway',{lv:'down',door:{x:sx,z:ZS_},path:[{x:sx,z:Z(S.y1)+.5*T},{x:sx,z:Z(S.y1)-.3*T},{x:sx,z:Z(S.y0)+.3*T,lv:'down'},{x:sx,z:Z(S.y0)-1.5*T,lv:'down'},{x:X(S.x0+2),z:Z(S.y0-16),lv:'down'},{...plat,lv:'down'}],reach:4*T}); } };   // (lv on a waypoint: past the stair's foot, for a test's look at the legs)
  // WHERE HE MAY STAND: out of his level's solids (clip.js's boxes), not in the stair hole unless on his way down it; a straight line between two
  // spots sampled every third of a tile
  const freeAt=(N,x,z,stair)=>!CLIP.hit(SOL[N.lv]||SOL.up,x,z,N.st.R)&&(stair||N.lv==='down'||!inHole(x,z));
  const lineFree=(N,a,b)=>{ const n=Math.ceil(d2(a,b)/(.33*T)); for(let k=1;k<=n;k++){ const t=k/n; if(!freeAt(N,a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t))return false; } return true; };
  // THE GROUND UNDER HIM, wherever he is: the step of a stair he's on (both stairs), else his level's (the dungeon's in it, the station's; the street's)
  const gnd=(N,x,z)=>{ const s=inStair(x,z,N.lv); if(s){ const S=s.S; if(S.ground)return S.ground(x,z,N.lv); const t=S.dir>0?s.gy-S.y0:S.y1-s.gy, k=Math.min(S.steps,Math.max(1,Math.floor(t/((S.y1-S.y0)/S.steps))+1)); return -k*S.depth/S.steps*ZU; }
    return N.lv==='down'?(MODS.dungeon&&MODS.dungeon.inside(x,z)?MODS.dungeon.ground(x,z):MODS.station.ground(x,z)):MODS.bodega.ground(x,z); };
  // HIS LEVEL from his height (halfway down a stair he's below, as you are: MAPLV), his group with it
  const level=N=>{ const y=gnd(N,N.st.x,N.st.z), lv=y<-1.6?'down':'up'; if(lv!==N.lv){ N.lv=lv; const g=lv==='down'?(MODS.dungeon&&MODS.dungeon.inside(N.st.x,N.st.z)&&MAPG.dungeon?MAPG.dungeon:MAPG.down):MAPG.bodega; if(N.g.parent!==g)g.add(N.g); } return y; };
  // A SIDESTEP round what's in the way (a pole, a can, a chair): the first clear spot beside the blocked one, a little further each try, that a
  // straight line from where he is reaches
  const side=(N,from,n,g)=>{ const dx=g.x-from.x, dz=g.z-from.z, l=Math.hypot(dx,dz)||1, px=-dz/l, pz=dx/l;
    for(const k of [.5,-.5,1,-1,1.6,-1.6,2.3,-2.3]){ const q={x:n.x+px*k*T,z:n.z+pz*k*T}; if(freeAt(N,q.x,q.z,true)&&lineFree(N,from,q))return q; } return null; };
  // THE ROUTE from where he is to a place: back out of the place he's in (its way reversed from the last spot he reached), along the street's
  // lanes (his door's lane along to the other's x, across to its lane), then the place's way in. Each waypoint says which place it's inside
  const route=(N,to)=>{ const L=N.life, st=N.st, wp=[], at=P[L.at];
    if(at&&at.path.length){ for(let k=Math.min(L.k,at.path.length)-1;k>=0;k--)wp.push({x:at.path[k].x,z:at.path[k].z,in:at.id}); wp.push({x:at.door.x,z:at.door.z,in:null}); }
    const from=wp.length?wp[wp.length-1]:{x:st.x,z:st.z}, dest=P[to], door=dest.door;
    if(door){ const lane=wp.length?from.z:(Math.abs(st.z-ZF)<Math.abs(st.z-ZS_)?ZF:ZS_);   // (on the street: the nearer lane first)
      if(Math.abs(from.z-lane)>.05)wp.push({x:from.x,z:lane,in:null}); if(Math.abs(from.x-door.x)>.05)wp.push({x:door.x,z:lane,in:null}); if(Math.abs(lane-door.z)>.05)wp.push({x:door.x,z:door.z,in:null});
      for(const p of dest.path)wp.push({x:p.x,z:p.z,in:dest.id}); }
    else{ const lane=Math.abs(st.z-ZF)<Math.abs(st.z-ZS_)?ZF:ZS_; wp.push({x:from.x,z:lane,in:null},{x:from.x+(Math.random()-.5)*8*T,z:lane,in:null}); }   // (the street: out to a lane and a stretch along it)
    L.wp=wp; L.i=0; L.tmp=null; L.stuck=0; L.to=to; L.state='walking'; };
  // A SPOT TO WANDER TO within his place (its box, or his reach round his spot; on the street a stretch of the lanes), that he can walk straight to
  const wander=N=>{ const L=N.life, st=N.st, pl=P[L.at]; for(let k=0;k<8;k++){ let q;
      if(pl.id==='street'){ const r=(Math.random()<.5?-1:1)*(2+Math.random()*7)*T; q={x:Math.max(X(M.x0+2),Math.min(X(M.x1-2),st.x+r)),z:[ZS_,ZR,ZF][Math.floor(Math.random()*3)]}; }
      else if(pl.box){ const b=pl.box; q={x:b.x0+Math.random()*(b.x1-b.x0),z:b.z0+Math.random()*(b.z1-b.z0)}; }
      else{ const s=pl.path[pl.path.length-1], a=Math.random()*6.283, r=Math.random()*pl.reach; q={x:s.x+Math.sin(a)*r,z:s.z+Math.cos(a)*r}; }
      if(d2(q,st)<.5*T||!freeAt(N,q.x,q.z)||!lineFree(N,st,q))continue; L.wp=[{x:q.x,z:q.z,in:pl.walls?pl.id:null}]; L.i=0; L.tmp=null; L.stuck=0; L.state='walking'; return; } };
  // HIS DAY (the hour, CLOCK.h, shifted by his own s): where he should be and what he's doing there
  const plan=(L,h)=>{ const t=(h-L.s+24)%24;
    if(t<7)return [L.home,'sleeping']; if(t<8)return [L.home,'standing']; if(t<9)return [L.meal,'sitting']; if(t<12)return [L.work,'standing']; if(t<13)return [L.meal,'sitting'];
    if(t<17)return [L.work,'standing']; if(t<19)return [L.eve,'standing']; if(t<22)return [L.night,L.night==='bar'?'sitting':'standing']; return [L.home,'sleeping']; };
  // WHO LIVES: every street walker who isn't a guard, a troublemaker, a dragon or a creature (those keep their beats and grounds); his home,
  // work, meal, evening and night by what he is (the skeleton pawns the castle's, asleep in its dungeon; the ogres at the dojo; the villagers
  // the bodega's; the heroes the park's; the mushroom seller at the stalls; the gold one the platform's)
  const lifeOf=(N,i)=>{ const k=N.key, pick=(a,b)=>i%2?a:b, s=((i*7)%9-4)*.2, has=id=>!!P[id];
    const L={s,home:has('apthouse')&&(i%3!==2||!has('lobby'))?'apthouse':has('lobby')?pick('lobby','hallway'):'street',meal:has('diner')?'diner':'street',work:'bodega',eve:pick('park','street'),night:'street',at:null,k:0,wp:null,i:0,state:'standing',to:null,wt:0};
    if(/^skeleton/.test(k)){ L.work='castle'; L.home=has('dungeon')?'dungeon':L.home; L.eve='park'; }
    else if(/^ogre/.test(k)){ L.work=has('dojo')?'dojo':'street'; }
    else if(/^hero/.test(k)){ L.work='park'; L.eve='stalls'; }
    else if(/^villager/.test(k)){ L.work=pick('bodega','stalls'); }
    else if(k==='mushroom'){ L.work='stalls'; L.eve='street'; }
    else if(k==='Gold'){ L.work='subway'; L.home='subway'; L.eve='street'; }
    if(i%4===1&&has('bar'))L.night='bar';   // (a few to the Bar of an evening; the rest on the street as they always were at seven)
    return L; };
  const resident=N=>!!(window.CITY&&CITY.residents&&CITY.residents.some(r=>r.key===N.key));   // (the apartment house's residents have their own hours and errands: residents.js, the city's spine; not two lives at once)
  const livesFor=N=>!('mode' in N)&&!N.guard&&!N.sheet&&!N.st.hold&&N.lv==='up'&&!(window.CREATS&&CREATS.includes(N))&&N.key!=='fox'&&N.key!=='mushroom'&&N.key!=='bear'&&!resident(N)&&!N.errand&&!N.walker;   /* (the town's walkers live by walkers.js) */
  // ---- INIT (after the hitboxes' pass, clip.js): the places, each life, and everyone put where his day has him at this hour ----
  LIVES.init=()=>{ if(!LIVES.on)return; LIVES.build(); let i=0; for(const N of NPCS)N.v0=N.st.v;
    for(const N of NPCS){ if(!livesFor(N))continue; const L=N.life=lifeOf(N,i++); N.st.hold=true; N.st.to=null;
      N.free=(x,z,R)=>freeAt(N,x,z,true); N.ground=(x,z)=>gnd(N,x,z);   // (his own say on where he may stand and the floor under him: anywhere on the map now)
      const [to,state]=plan(L,CLOCK.h), pl=P[to]; L.at=to; L.k=pl.path.length; L.state=state; L.to=to; L.inside=pl.walls?pl.id:null;
      // (put at his place: his spot, or a clear spot about it)
      const s=pl.path.length?pl.path[pl.path.length-1]:{x:N.st.x,z:N.st.z}; let put=null;
      for(let k=0;k<30&&!put;k++){ const a=Math.random()*6.283, r=k?Math.random()*pl.reach:0, q={x:s.x+Math.sin(a)*r,z:s.z+Math.cos(a)*r}; if(!CLIP.hit(SOL[pl.lv]||SOL.up,q.x,q.z,N.st.R)&&!NPCS.some(o=>o!==N&&o.life&&d2(o.st,q)<o.st.R+N.st.R))put=q; }
      if(put){ N.st.x=put.x; N.st.z=put.z; } N.lv=pl.lv; level(N); N.st.h=Math.random()*6.283; N.g.position.set(N.st.x,gnd(N,N.st.x,N.st.z),N.st.z); N.g.rotation.y=N.st.h; }
    LIVES.ready=true; };
  // IS HE HIDDEN BY HIS LIFE: indoors where you aren't (in a room with walls while you're outside it or in another), so neither drawn nor run
  const within=(b,x,z,e)=>x>b.x0-e&&x<b.x1+e&&z>b.z0-e&&z<b.z1+e;
  LIVES.hidden=N=>{ const L=N.life; if(!L)return false; const cur=ROOMS.cur; if(cur&&!FREE)return !within(cur,N.st.x,N.st.z,.4*T);
    const inn=L.inside?P[L.inside]:null; return !!(inn&&inn.walls&&(N.lv!=='down'||LVL==='down')); };   // (underground while you're up: his group's already hidden)
  // ---- ONE STEP OF A FAR CHARACTER'S NUMBERS (dt a quarter second): along his route, a sidestep round what blocks him, else stuck a while and on
  const passed=(N,g)=>{ const L=N.life; if(L.tmp){ L.tmp=null; return; } L.i++; L.inside=g.in; L.at=g.in||'street';
    if(g.in){ const j=P[g.in].path.findIndex(p=>p.x===g.x&&p.z===g.z); if(j>=0)L.k=g.in===L.to?j+1:j; } };   // (on his way in: j passed; on his way out: j the next back)
  const stepFar=(N,dt)=>{ const L=N.life, st=N.st, g=L.tmp||(L.wp&&L.wp[L.i]); if(!g){ arrive(N,dt); return; }
    const d=d2(g,st); if(d<.1*T){ passed(N,g); return; }
    const s=Math.min(d,st.v*dt), nx=st.x+(g.x-st.x)/d*s, nz=st.z+(g.z-st.z)/d*s;
    if(freeAt(N,nx,nz,true)&&!NPCS.some(q=>q!==N&&q.lv===N.lv&&!q.far&&q.blocks&&q.blocks(nx,nz,st.R))){ st.x=nx; st.z=nz; st.h=Math.atan2(g.x-st.x,g.z-st.z); L.stuck=0; }   // (a near one in his way: not walked into; a far one he passes through, no one sees)
    else{ const q=side(N,st,{x:nx,z:nz},g); if(q)L.tmp=q; else if((L.stuck+=dt)>8){ L.stuck=0; LIVES.skips++; st.x=g.x; st.z=g.z; } }   // (held a while: on to the waypoint; far, unseen)
    level(N); N.g.position.set(st.x,gnd(N,st.x,st.z),st.z); N.g.rotation.y=st.h; };
  // A NEAR ONE: his own tick walks him (makeNPC), his numbers only say where to (st.to); a waypoint dropped (blocked, held up) is given again, or a sidestep
  const stepNear=(N,dt)=>{ const L=N.life, st=N.st, g=L.tmp||(L.wp&&L.wp[L.i]); if(!g){ arrive(N,dt); return; }
    const d=d2(g,st); if(d<.12*T){ st.to=null; passed(N,g); return; }
    if(st.to){ L.stuck=0; return; }
    if((L.wt-=dt)>0)return; L.wt=.4;
    if(L.gave&&L.gave.x===g.x&&L.gave.z===g.z){ const dx=g.x-st.x, dz=g.z-st.z, l=Math.hypot(dx,dz), q=side(N,st,{x:st.x+dx/l*.6*T,z:st.z+dz/l*.6*T},g); if(q){ L.tmp=q; st.to={x:q.x,z:q.z}; st.wait=0; return; } if((L.stuck+=1)>12){ L.stuck=0; L.tmp=null; L.i++; LIVES.skips++; return; } }   // (dropped: round it, or after a while on past it)
    st.to={x:g.x,z:g.z}; st.wait=0; L.gave=g; };
  // ARRIVED at his place: there, doing what the hour says; now and then a few steps about it (not asleep, not at table)
  const arrive=(N,dt)=>{ const L=N.life, st=N.st; if(L.wp){ L.wp=null; L.at=L.to; L.k=P[L.at].path.length; L.inside=P[L.at].walls?L.at:null; L.state=plan(L,CLOCK.h)[1]; st.to=null; st.wait=1e9; L.wt=4+Math.random()*8; return; }
    if(L.state==='walking')L.state=plan(L,CLOCK.h)[1]; if(L.state==='standing'&&(L.wt-=dt)<=0){ L.wt=6+Math.random()*8; wander(N); } };
  // ---- EACH FRAME: the plan checked and the far ones stepped four times a second; the near ones steered every frame
  let acc=0, n=0;
  LIVES.tick=(dt,you)=>{ if(!LIVES.ready)return; const t0=performance.now(); acc+=dt; const step=acc>=HZ; if(step)acc-=HZ;
    for(const N of NPCS){ const L=N.life;
      if(!L){ if(step&&N.far)beat(N,HZ); continue; }
      if(step){ const [to,state]=plan(L,CLOCK.h); if(to!==L.to)route(N,to); else if(!L.wp)L.state=state; if(N.far)stepFar(N,HZ); }   // (the hour's place changed: on his way; the hour's doing where he is)
      if(!N.far)stepNear(N,dt); }
    const ms=performance.now()-t0; LIVES.ms+=(ms-LIVES.ms)*.02; if(step)LIVES.stepMs+=(ms-LIVES.stepMs)*.1; if(step&&PANEL)PANEL(); };
  // THE GUARDS AND THE REST WHEN FAR: a guard goes end to end of his beat (his own pick: the other end), stands a moment, and back; a creature or
  // the bear picks his next spot as he always does and goes; nothing drawn, nothing's bones moved
  const beat=(N,dt)=>{ const st=N.st; if(st.hold&&!N.guard)return; if(!st.to){ if((st.wait-=dt)>0)return; if(N.pick)N.pick(); if(!st.to)return; }
    if(!(st.v>.05*T))st.v=N.v0;   // (a guard's pace before his mind first ran, a frog's between hops: his own)
    const d=d2(st.to,st); if(d<.1*T){ st.to=null; st.wait=N.guard?2.5:1.5+Math.random()*4; return; } const s=Math.min(d,st.v*dt), nx=st.x+(st.to.x-st.x)/d*s, nz=st.z+(st.to.z-st.z)/d*s;
    if(N.free&&!N.free(nx,nz,st.R)){ st.to=null; st.wait=1; return; } st.h=Math.atan2(st.to.x-st.x,st.to.z-st.z); st.x=nx; st.z=nz; N.g.position.set(st.x,N.ground(st.x,st.z),st.z); N.g.rotation.y=st.h; };
  // ---- A TEST'S AND THE OWNER'S LOOK: every character, his state, his place, whether he's drawn (?lives=1 lists them on the page) ----
  LIVES.dbg=()=>NPCS.map(N=>{ const L=N.life, dr=N.key==='dragon'; return {key:N.key,state:L?L.state:dr?'flying':N.guard?(N.st.to?'walking':'standing'):N.st.to?'walking':'standing',place:L?(L.wp?'to '+L.to:L.at):dr?'the sky':N.guard?'beat':N.lv==='down'?'platform':'street',drawn:!N.far&&N.g.visible&&N.g.parent.visible&&(N.lv===LVL||N.g.parent.visible),far:!!N.far,lv:N.lv,x:+N.st.x.toFixed(1),z:+N.st.z.toFixed(1),y:+N.g.position.y.toFixed(2)}; });
  LIVES.places=()=>Object.values(P).map(p=>({id:p.id,lv:p.lv,door:p.door,path:p.path,box:p.box}));
  LIVES.lineFree=(key,a,b,lv)=>{ const N=NPCS.find(n=>n.key===key), l0=N.lv; if(lv)N.lv=lv; const r=lineFree(N,a,b); N.lv=l0; return r; };   // (a test: a leg walked straight, on a level)
  LIVES.legHit=(key,a,b,lv)=>{ const N=NPCS.find(n=>n.key===key), L=SOL[lv||N.lv], n=Math.ceil(d2(a,b)/(.33*T)); for(let k=1;k<=n;k++){ const t=k/n, h=CLIP.hit(L,a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,N.st.R); if(h)return {box:h,at:[a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t]}; } return null; };
  LIVES.send=(key,to)=>{ const N=NPCS.find(n=>n.key===key); if(N&&N.life&&P[to]){ N.life.to=null; route(N,to); N.life.to=to; } };   // (a test: send one somewhere now)
  let PANEL=null;
  if(QS.get('lives')==='1'){ const d=document.createElement('div'); d.id='lives'; d.style.cssText='position:fixed;right:8px;top:8px;max-height:92vh;overflow:auto;font:10px monospace;color:#cfd3dc;background:rgba(10,12,18,.85);padding:6px 8px;z-index:40;white-space:pre;line-height:1.25'; document.body.appendChild(d);
    PANEL=()=>{ let s='LIVES '+LIVES.ms.toFixed(3)+' ms/frame  '+CLOCK.h.toFixed(2)+'h\nKEY              STATE     PLACE          DRAWN\n'; for(const r of LIVES.dbg())s+=(r.key+'                ').slice(0,16)+' '+(r.state+'         ').slice(0,9)+' '+(r.place+'              ').slice(0,14)+' '+(r.drawn?'yes':'-')+'\n'; d.textContent=s; }; } }
