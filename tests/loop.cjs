// THE LOOP: every section has a station on the loop, the tunnels run unbroken round both tracks, both trains keep the timetable (60 s at every station), you can ride one, and every station's exit and entrance take you up and down.
// Run: node tests/loop.cjs   (slow in a cloud container: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:800,height:450}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2000);
  const idle=()=>pg.waitForFunction(()=>FADE.busy===0&&getComputedStyle(document.getElementById('subfade')).opacity==='0',null,{timeout:300000,polling:500}).catch(()=>{});
  await idle();
  const S=await pg.evaluate(()=>({ids:SHARED.SECTIONS.list.map(s=>s.id).sort().join(''),st:LOOP.STA.map(s=>s.id).sort().join(''),inSec:LOOP.STA.every(s=>SHARED.SECTIONS.at(s.x,s.my(LOOP.MID))===s.id),
    trains:TRAINS.list.map(t=>({dir:t.dir,n:t.tbl.length,ids:new Set(t.tbl.map(e=>e.st.id)).size,dwell:t.tbl.every(e=>Math.abs(e.dep-e.arr-60)<1e-9),lap:t.lap,sum:t.tbl.reduce((a,e)=>a+60+e.T,0)}))}));
  ok(S.ids==='ABCDEFGH'&&S.st==='ABCDEFGH'&&S.inSec,'eight sections, one station in each ('+S.st+')');
  ok(S.trains.length===2&&S.trains[0].dir===-S.trains[1].dir,'two trains, one each way');
  ok(S.trains.every(t=>t.n===8&&t.ids===8&&t.dwell&&Math.abs(t.lap-t.sum)<1e-6),'each train stops 60 s at all eight stations every lap ('+S.trains.map(t=>(t.lap/60).toFixed(1)+' min').join(', ')+')');
  const tun=await pg.evaluate(()=>{ const M=SHARED.METRO, out={}; for(const k in LOOP.TRK){ const tr=LOOP.TRK[k]; let gap=0, n=0; for(let s=0;s<tr.L;s+=5){ const o=tr.pt(s), x=LOOP.WX(o.x), z=LOOP.WZ(o.y); n++; if(!M.inside(x,z))gap++; } out[k]=gap+'/'+n; } return out; });
  ok(Object.values(tun).every(v=>v.startsWith('0/')),'both tracks run unbroken round the loop, tunnels and stations ('+JSON.stringify(tun)+')');
  // a train comes into A, waits 60 s with its doors open, then leaves
  const atA=async(dt)=>pg.evaluate(dt=>{ const t=TRAINS.list[0], e=t.tbl.find(q=>q.st.old), now=TRAINS.now(); TRAINS.skew+=((e.arr+dt-((now-t.off)%t.lap))%t.lap+t.lap)%t.lap; },dt);
  await pg.evaluate(()=>{ const p=METRO.plat; __dbg.UI.goTo(p.x,p.z,'down'); }); await idle(); await atA(5); await pg.waitForFunction(()=>/NOW/.test(LOOP.STA.find(q=>q.old).board.last),null,{timeout:60000,polling:500}).catch(()=>{});
  const A=await pg.evaluate(()=>{ const t=TRAINS.list[0], s=TRAINS.state(t), c=t.cars[0].G.position, st=LOOP.STA.find(q=>q.old), m=LOOP.MX(c.x); return {doors:s.doors,at:s.at&&s.at.id,inSta:m>st.x0&&m<st.x0+LOOP.LEN,board:st.board.last}; });
  ok(A.doors&&A.at==='A'&&A.inSta,'train 1 stands in A with its doors open ('+JSON.stringify(A)+')');
  ok(/NOW/.test(A.board),'A\'s board says train 1 is in ('+A.board+')');
  // ride it: walk off the platform through a door, out again, back in; carried when it leaves
  const step=dir=>pg.evaluate(async dir=>{ const t=TRAINS.list[0], c=t.cars[0].p, T=LOOP.WX(1)-LOOP.WX(0), px=-c.uz, pz=c.ux, fr=()=>new Promise(r=>requestAnimationFrame(r));
      const side=[1,-1].find(sg=>METRO.ground(c.x+px*sg*3*T,c.z+pz*sg*3*T)>LOOP.H(-2)); if(dir<0)__dbg.UI.goTo(c.x+px*side*3.4*T,c.z+pz*side*3.4*T,'down'); await fr(); await fr();
      for(let i=0;i<50&&(dir<0?!TRAINS.ride.c:!!TRAINS.ride.c);i++){ const q=__dbg.pos(), r=__dbg.collide(q[0]+px*side*dir*.12*T,q[2]+pz*side*dir*.12*T); __dbg.UI.goTo(r[0],r[1],'down'); await fr(); await fr(); }
      const q=__dbg.pos(); return {ride:!!TRAINS.ride.c,side,y:+q[1].toFixed(2),plat:+LOOP.H(0).toFixed(2),z:ZONES.cur&&ZONES.cur.name}; },dir);
  const on=await step(-1); ok(on.ride,'you walk through a door onto train 1 ('+JSON.stringify(on)+')');
  const off=await step(1); ok(!off.ride&&Math.abs(off.y-off.plat)<.05,'and back out onto the platform ('+JSON.stringify(off)+')');
  const on2=await step(-1); const r0=await pg.evaluate(()=>({ride:!!TRAINS.ride.c,z:ZONES.cur&&ZONES.cur.name,p:__dbg.pos()}));
  ok(on2.ride&&/TRAIN 1/.test(r0.z),'you get on train 1 ('+r0.z+')');
  await pg.evaluate(()=>{ TRAINS.skew+=70; }); await pg.waitForTimeout(4000);
  const r1=await pg.evaluate(()=>{ const c=TRAINS.list[0].cars[0].p, p=__dbg.pos(); return {ride:!!TRAINS.ride.c,d:Math.hypot(p[0]-c.x,p[2]-c.z),doors:TRAINS.state(TRAINS.list[0]).doors,lvl:__dbg.lvl()}; });
  ok(r1.ride&&!r1.doors&&r1.d<2*1.13&&r1.lvl==='down','the train leaves and carries you ('+JSON.stringify(r1)+')');
  const r2=await pg.evaluate(()=>{ const p=__dbg.pos(); return Math.hypot(p[0],p[2]); });
  ok(Math.abs(r2-Math.hypot(r0.p[0],r0.p[2]))>3,'you went with it');
  const rd=await pg.evaluate(()=>({n:RIDERS.list.length,inCars:RIDERS.list.every(r=>TRAINS.list.some(t=>t.cars.some(c=>c.inner===r.g.parent))),kinds:new Set(RIDERS.list.map(r=>r.kind)).size,seats:RIDERS.list.every(r=>r.seat)}));
  ok(rd.n>=6&&rd.inCars&&rd.seats&&rd.kinds>=2,'riders sit in the trains\' seats, doing different things ('+JSON.stringify(rd)+')');
  // ride on to the next stop (round the corner to B) and get off there
  await pg.evaluate(()=>{ const t=TRAINS.list[0], e=t.tbl[1], now=TRAINS.now(); TRAINS.skew+=((e.arr+5-((now-t.off)%t.lap))%t.lap+t.lap)%t.lap; }); await pg.waitForTimeout(3000);
  const nx=await pg.evaluate(()=>{ const S=TRAINS.state(TRAINS.list[0]); return {at:S.at&&S.at.id,doors:S.doors,ride:!!TRAINS.ride.c}; });
  ok(nx.ride&&nx.doors&&nx.at==='B','still aboard when it stops at B with its doors open ('+JSON.stringify(nx)+')');
  await pg.evaluate(()=>{ const t=TRAINS.list[0], e=t.tbl[1], now=TRAINS.now(); TRAINS.skew+=((e.arr+1-((now-t.off)%t.lap))%t.lap+t.lap)%t.lap; });
  const offB=await step(1); ok(!offB.ride&&/STATION \u00b7 B/.test(offB.z)&&Math.abs(offB.y-offB.plat)<.05,'you get off at B ('+JSON.stringify(offB)+')');
  // every new station: down by its entrance, up by its exit
  for(const id of ['C','F']){
    await pg.evaluate(id=>{ const st=LOOP.STA.find(s=>s.id===id), k=st.kiosk; __dbg.UI.goTo(LOOP.WX((k.x0+k.x1)/2),LOOP.WZ((k.y0+k.y1)/2),'up'); },id); await pg.waitForTimeout(1500); await idle(); await pg.waitForTimeout(1500);
    const d=await pg.evaluate(()=>({lvl:__dbg.lvl(),z:ZONES.cur&&ZONES.cur.name}));
    ok(d.lvl==='down'&&d.z.includes('STATION · '+id),'the entrance in '+id+' takes you down to its platform ('+d.z+')');
    await pg.evaluate(id=>{ const st=LOOP.STA.find(s=>s.id===id), p=st.P(-2.8,12.4,0); __dbg.UI.goTo(p[0],p[2],'down'); },id); await pg.waitForTimeout(1500); await idle(); await pg.waitForTimeout(1500);
    const u=await pg.evaluate(()=>({lvl:__dbg.lvl(),z:ZONES.cur&&ZONES.cur.name}));
    ok(u.lvl==='up'&&u.z.endsWith('· '+id),'its exit '+id+'1 takes you up to the street ('+u.z+')'); }
  // a tunnel wall stops you
  await pg.evaluate(()=>{ const o=LOOP.TRK.outer.pt(300); __dbg.UI.goTo(LOOP.WX(o.x),LOOP.WZ(o.y),'down'); }); await pg.waitForTimeout(1500);
  const w=await pg.evaluate(()=>{ const tr=LOOP.TRK.outer, o=tr.pt(300), p={x:LOOP.WX(o.x),z:LOOP.WZ(o.y)}, T=LOOP.WX(1)-LOOP.WX(0); for(let i=0;i<60;i++){ p.x+=-o.hy*.1*T; p.z+=o.hx*.1*T; [p.x,p.z]=__dbg.collide(p.x,p.z); } return tr.near(LOOP.MX(p.x),LOOP.MY(p.z)).v; });
  ok(w<2.2,'a tunnel wall stops you ('+w.toFixed(2)+')');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all loop checks passed'); await b.close(); process.exit(bad?1:0); })();
