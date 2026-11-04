// THE LOOP, with only section A loaded (28 Oct 2026): A's station on the loop, the tunnels run unbroken round both tracks, both trains shuttle from A out to each tunnel end and back (60 s at A, taking turns), you can ride one out and back, and a tunnel wall stops you.
// Run: node tests/loop.cjs   (slow in a cloud container: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:800,height:450}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2000);
  const idle=()=>pg.waitForFunction(()=>FADE.busy===0&&getComputedStyle(document.getElementById('subfade')).opacity==='0',null,{timeout:300000,polling:500}).catch(()=>{});
  await idle();
  const S=await pg.evaluate(()=>({loaded:SHARED.SECTIONS.loaded.map(s=>s.id).join(''),st:LOOP.STA.map(s=>s.id).join(''),inSec:LOOP.STA.every(s=>SHARED.SECTIONS.at(s.x,s.my(LOOP.MID))===s.id),
    trains:TRAINS.list.map(t=>({dir:t.dir,lap:t.lap,stops:t.legs?t.legs.filter(g=>g.doors).length:0,dwell:!!t.legs&&t.legs.filter(g=>g.doors).every(g=>Math.abs(g.dur-60)<1e-9),ways:t.legs?new Set(t.legs.filter(g=>g.d>1).map(g=>g.sg)).size:0}))}));
  ok(S.loaded==='A'&&S.st==='A'&&S.inSec,'only section A is loaded, its station on the loop ('+S.st+')');
  ok(S.trains.length===2&&S.trains[0].dir===-S.trains[1].dir,'two trains, one each way');
  ok(S.trains.every(t=>t.stops===2&&t.dwell&&t.ways===2)&&Math.abs(S.trains[0].lap-S.trains[1].lap)<1e-6,'each train shuttles from A out to both tunnel ends and back, 60 s at A each time, the two laps the same ('+S.trains.map(t=>(t.lap/60).toFixed(1)+' min').join(', ')+')');
  const G=await pg.evaluate(()=>{ const A=LOOP.STA.find(s=>s.old), arr=t=>(t.legs?t.legs.filter(g=>g.doors).map(g=>g.t0):[t.tbl.find(e=>e.st===A).arr]).map(a=>a+t.off), [a,b]=TRAINS.list, lap=a.lap; let gap=lap; for(const x of arr(a))for(const y of arr(b))gap=Math.min(gap,Math.abs(((x-y)%lap+lap*1.5)%lap-lap/2)); return {gap,lap}; });
  ok(G.gap>=G.lap/4-1,'the two trains never call at A together: a quarter lap apart at least ('+Math.round(G.gap)+' s of a '+Math.round(G.lap)+' s lap)');
  const tun=await pg.evaluate(()=>{ const M=SHARED.METRO, out={}; for(const k in LOOP.TRK){ const tr=LOOP.TRK[k]; let gap=0, n=0; for(let s=0;s<tr.L;s+=5){ const o=tr.pt(s), x=LOOP.WX(o.x), z=LOOP.WZ(o.y); n++; if(!M.inside(x,z))gap++; } out[k]=gap+'/'+n; } return out; });
  ok(Object.values(tun).every(v=>v.startsWith('0/')),'both tracks run unbroken round the loop, tunnels and stations ('+JSON.stringify(tun)+')');
  // a train comes into A, waits 60 s with its doors open, then leaves
  const atA=async(dt)=>pg.evaluate(dt=>{ const t=TRAINS.list[0], e=t.tbl.find(q=>q.st.old), now=TRAINS.now(); TRAINS.skew+=((e.arr+dt-((now-t.off)%t.lap))%t.lap+t.lap)%t.lap; },dt);
  await pg.evaluate(()=>{ const p=METRO.plat; __dbg.UI.goTo(p.x,p.z,'down'); }); await idle(); await atA(5); await pg.waitForFunction(()=>/NOW/.test(LOOP.STA.find(q=>q.old).board.last),null,{timeout:60000,polling:500}).catch(()=>{});
  const A=await pg.evaluate(()=>{ const t=TRAINS.list[0], s=TRAINS.state(t), c=t.cars[0].G.position, st=LOOP.STA.find(q=>q.old), m=LOOP.MX(c.x); return {doors:s.doors,at:s.at&&s.at.id,inSta:m>st.x0&&m<st.x0+LOOP.LEN,board:st.board.last}; });
  ok(A.doors&&A.at==='A'&&A.inSta,'train 1 stands in A with its doors open ('+JSON.stringify(A)+')');
  ok(/NOW/.test(A.board),'A\'s board says train 1 is in ('+A.board+')');
  // ride it: walk off the platform through a door, out again, back in; carried when it leaves
  // the train's clock is held while you walk through the door: on a slow runner a hundred frames outlast its 60 s stop and the doors would shut on you
  const step=dir=>pg.evaluate(async dir=>{ const t=TRAINS.list[0], c=t.cars[0].p, T=LOOP.WX(1)-LOOP.WX(0), px=-c.uz, pz=c.ux, fr=()=>new Promise(r=>requestAnimationFrame(r)), clock=TRAINS.now, t0=clock(); TRAINS.now=()=>t0;
      try{ const side=[1,-1].find(sg=>METRO.ground(c.x+px*sg*3*T,c.z+pz*sg*3*T)>LOOP.H(-2)); if(dir<0)__dbg.UI.goTo(c.x+px*side*3.4*T,c.z+pz*side*3.4*T,'down'); await fr(); await fr();
        for(let i=0;i<50&&(dir<0?!TRAINS.ride.c:!!TRAINS.ride.c);i++){ const q=__dbg.pos(), r=__dbg.collide(q[0]+px*side*dir*.12*T,q[2]+pz*side*dir*.12*T); __dbg.UI.goTo(r[0],r[1],'down'); await fr(); await fr(); }
        const q=__dbg.pos(); return {ride:!!TRAINS.ride.c,side,y:+q[1].toFixed(2),plat:+LOOP.H(0).toFixed(2),z:ZONES.cur&&ZONES.cur.name}; }
      finally{ TRAINS.now=clock; } },dir);
  const on=await step(-1); ok(on.ride,'you walk through a door onto train 1 ('+JSON.stringify(on)+')');
  const off=await step(1); ok(!off.ride&&Math.abs(off.y-off.plat)<.05,'and back out onto the platform ('+JSON.stringify(off)+')');
  const on2=await step(-1); const r0=await pg.evaluate(()=>({ride:!!TRAINS.ride.c,z:ZONES.cur&&ZONES.cur.name,p:__dbg.pos()}));
  ok(on2.ride&&/TRAIN 1/.test(r0.z),'you get on train 1 ('+r0.z+')');
  await pg.evaluate(()=>{ TRAINS.skew+=70; }); await pg.waitForTimeout(4000);
  const r1=await pg.evaluate(()=>{ const c=TRAINS.list[0].cars[0].p, p=__dbg.pos(); return {ride:!!TRAINS.ride.c,d:Math.hypot(p[0]-c.x,p[2]-c.z),doors:TRAINS.state(TRAINS.list[0]).doors,lvl:__dbg.lvl()}; });
  ok(r1.ride&&!r1.doors&&r1.d<2*1.13&&r1.lvl==='down','the train leaves and carries you ('+JSON.stringify(r1)+')');
  const r2=await pg.evaluate(()=>{ const p=__dbg.pos(); return Math.hypot(p[0],p[2]); });
  ok(Math.abs(r2-Math.hypot(r0.p[0],r0.p[2]))>3,'you went with it');
  // in the car: the poles are solid, a pole and a strap can be held (the hand on it), and out in the tunnel it is dark
  const H=await pg.evaluate(async()=>{ const car=TRAINS.ride.c, fr=()=>new Promise(r=>requestAnimationFrame(r)), wait=async n=>{ for(let i=0;i<n;i++)await fr(); }, at=(a,v)=>{ const c=car.p; return {x:c.x+a*c.ux-v*c.uz,z:c.z+a*c.uz+v*c.ux}; };
    const hand=()=>{ const G=__dbg.ST.grip; if(!G)return 99; const w=RIG.pose(__dbg.ST).J[G.side>0?'wristL':'wristR']; return Math.hypot(w.x-G.x,w.y-G.y,w.z-G.z); }, mid=L=>L.reduce((b,p)=>Math.hypot(p.a,p.v)<Math.hypot(b.a,b.v)?p:b);
    const P=mid(car.poles); let w=at(P.a,P.v); __dbg.UI.goTo(w.x+.01,w.z,'down'); await wait(4); w=at(P.a,P.v); const q=__dbg.pos(), solid=Math.hypot(q[0]-w.x,q[2]-w.z);
    TRAINS.grab('pole'); await wait(4); const pole=TRAINS.hold.h&&TRAINS.hold.h.k==='pole'?hand():99; TRAINS.letGo();
    const S=mid(car.straps), u=at(S.a,S.v*.6); __dbg.UI.goTo(u.x,u.z,'down'); await wait(4); TRAINS.grab('rail'); await wait(4); const strap=TRAINS.hold.h&&TRAINS.hold.h.k==='rail'?hand():99; TRAINS.letGo();
    { const t=TRAINS.list[0], u=((TRAINS.now()-t.off)%t.lap+t.lap)%t.lap, g=t.legs.filter(q=>q.d>1).reduce((a,b)=>b.d>a.d?b:a); TRAINS.skew+=((g.t0+g.dur*.6-u)%t.lap+t.lap)%t.lap; }   // well out along the longer tunnel
    await wait(60); const p=__dbg.pos(); return {solid:+solid.toFixed(2),pole:+pole.toFixed(2),strap:+strap.toFixed(2),ride:!!TRAINS.ride.c,inSta:LOOP.inStation(p[0],p[2]),amb:+LEVELS.of.station.amb.toFixed(3)}; });
  ok(H.solid>.35,'the middle pole is solid: standing on it puts you beside it ('+JSON.stringify(H)+')');
  ok(H.pole<1.5&&H.strap<1.5&&H.ride,'you can hold a pole and a strap: the hand is on it ('+JSON.stringify(H)+')');
  ok(!H.inSta&&H.amb<.05,'out in the tunnel it is dark ('+JSON.stringify(H)+')');
  const rd=await pg.evaluate(()=>({n:RIDERS.list.length,inCars:RIDERS.list.every(r=>TRAINS.list.some(t=>t.cars.some(c=>c.inner===r.g.parent))),kinds:new Set(RIDERS.list.map(r=>r.kind)).size,seats:RIDERS.list.every(r=>r.seat)}));
  ok(rd.n>=6&&rd.inCars&&rd.seats&&rd.kinds>=2,'riders sit in the trains\' seats, doing different things ('+JSON.stringify(rd)+')');
  // ride on: it waits in the dark at the tunnel's end and comes back to A with its doors open; get off there
  const toDoors=(dt)=>pg.evaluate(dt=>{ const t=TRAINS.list[0], now=TRAINS.now(), u=((now-t.off)%t.lap+t.lap)%t.lap, g=t.legs.filter(q=>q.doors).map(q=>q.t0<=u?q.t0+t.lap:q.t0).sort((a,b)=>a-b)[0]; TRAINS.skew+=g+dt-u; },dt);
  await toDoors(5); await pg.waitForTimeout(3000);
  const nx=await pg.evaluate(()=>{ const S=TRAINS.state(TRAINS.list[0]); return {at:S.at&&S.at.id,doors:S.doors,ride:!!TRAINS.ride.c}; });
  ok(nx.ride&&nx.doors&&nx.at==='A','still aboard when it comes back to A with its doors open ('+JSON.stringify(nx)+')');
  const offA=await step(1); ok(!offA.ride&&/STATION \u00b7 A/.test(offA.z)&&Math.abs(offA.y-offA.plat)<.05,'you get off at A again ('+JSON.stringify(offA)+')');
  // a tunnel wall stops you (8 tiles into the tunnel past the station's end)
  await pg.evaluate(()=>{ const o=LOOP.TRK.outer.pt(LOOP.STA[0].s.outer+LOOP.LEN/2+8); __dbg.UI.goTo(LOOP.WX(o.x),LOOP.WZ(o.y),'down'); }); await pg.waitForTimeout(1500);
  const w=await pg.evaluate(()=>{ const tr=LOOP.TRK.outer, o=tr.pt(LOOP.STA[0].s.outer+LOOP.LEN/2+8), p={x:LOOP.WX(o.x),z:LOOP.WZ(o.y)}, T=LOOP.WX(1)-LOOP.WX(0); for(let i=0;i<60;i++){ p.x+=-o.hy*.1*T; p.z+=o.hx*.1*T; [p.x,p.z]=__dbg.collide(p.x,p.z); } return tr.near(LOOP.MX(p.x),LOOP.MY(p.z)).v; });
  ok(w<2.2,'a tunnel wall stops you ('+w.toFixed(2)+')');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all loop checks passed'); await b.close(); process.exit(bad?1:0); })();
