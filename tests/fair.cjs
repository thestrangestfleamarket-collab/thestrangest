// THE STRANGEST FAIR (owner, 4 Nov 2026): the lot behind the West St row builds when you come near, with its thirteen rides, the midway's twelve booths, the kart track and the bumper cars;
// a seat is boarded for a ticket and carries you; a booth plays; a kart rents; the staff stand at their posts; the theatre's door is on West St and the gate's gap in the row is open.
// Run: node tests/fair.cjs   (slow in a cloud container: software rendering)
const {chromium}=require('playwright'), path=require('path');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message.slice(0,300)));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  const W=(x,y)=>[((x-72)*1.13).toFixed(1),((y+77)*1.13).toFixed(1)].join(',');
  await pg.goto('file://'+path.resolve(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13&at='+W(-100,112),{waitUntil:'commit'});
  let st=false; for(let i=0;i<80&&!st;i++){ await pg.waitForTimeout(3000); st=await pg.evaluate(()=>!!window.__started).catch(()=>false); } ok(st,'the page starts at the fair\'s plaza');
  let built=false; for(let i=0;i<45&&!built;i++){ await pg.waitForTimeout(2000); built=await pg.evaluate(()=>!!(window.FAIR&&FAIR.built)).catch(()=>false); } ok(built,'the fair builds when you are near');
  if(built){
    const d=await pg.evaluate(()=>({f:FAIRDBG(),m:MIDDBG(),k:KARTDBG(),zone:(window.ZONES&&ZONES.cur&&ZONES.cur.name)||document.body.innerText.match(/A · [A-Z ]+/)&&document.body.innerText.match(/A · ([A-Z ]+)/)[1]}));
    ok(d.f.rides.length>=13&&d.f.rides.every(r=>r.seats>0),'thirteen rides, each with seats: '+d.f.rides.map(r=>r.id).join(' '));
    ok(d.m.booths.length>=12,'twelve game booths: '+d.m.booths.join(' '));
    ok(d.k.karts.length===6&&d.k.bumps.length===6&&d.k.line,'six rental karts, six bumper cars, the start line laid');
    ok(d.f.posts>=40,'the staff\'s posts are registered ('+d.f.posts+')');
    ok(/STRANGEST FAIR/.test(String(d.zone)),'the plaza is in THE STRANGEST FAIR zone ('+d.zone+')');
    const g=await pg.evaluate(()=>{ const F=__dbg.MAPK.RING.wx0, P=__dbg.MAPK.LEVEL?null:null; const gate=(window.FAIR.P.gate||[105.3,116.1]); const row=[...window.BLK.blds,...window.BLK.lots].filter(q=>Math.abs(q.x1-F)<.6&&q.y1>gate[0]+.2&&q.y0<gate[1]-.2);
      const dd=(STORE.main.doors||[]).find(q=>q[0]==='THE MOVIE THEATRE'); return {row:row.length,door:dd&&[dd[1]/1.13+72,dd[2]/1.13-77].map(v=>+v.toFixed(1)),F}; });
    ok(g.row===0,'the gate\'s gap in the West St row is open (no filler in it)');
    ok(g.door&&Math.abs(g.door[0]-g.F)<1.5&&g.door[1]>91&&g.door[1]<106,'the movie theatre\'s door is on West St beside the gate ('+JSON.stringify(g.door)+')');
    const sp=await pg.evaluate(()=>{ const c=CREW.spots.fair({job:{at:'fair',spot:'op:wheel'},key:'x'}); return c&&[c.x/1.13+72,c.z/1.13-77].map(v=>+v.toFixed(1)); });
    ok(sp&&Math.abs(sp[0]+82.5)<3&&sp[1]<186&&sp[1]>170,'a job at the fair resolves to its post (the wheel\'s operator stands by the wheel: '+JSON.stringify(sp)+')');
    // the staff: the cast groups with fair jobs load near the gate and go to work (13:00 is inside their hours)
    let J=[]; for(let i=0;i<30;i++){ await pg.waitForTimeout(2000); J=await pg.evaluate(()=>window.JOBDBG?JOBDBG().filter(j=>j.at==='fair'):[]); if(J.length>=30)break; }
    const atWork=J.filter(j=>j.state==='work'||j.goal==='work'); ok(J.length>=30&&atWork.length>=J.length*.7,J.length+' fair workers loaded, '+atWork.length+' at work');
    // a ride: tickets, board the wheel while it stands, ride up, get let off when it stops
    const r=await pg.evaluate(async()=>{ INV.add('fairticket',20); const R=FAIR.rides.wheel, now=TRAINS.now(); R.off=-(now%R.def.cycle)+5; await new Promise(r=>setTimeout(r,250)); const t0=INV.items.fairticket; const okb=FAIR.board('wheel',0); await new Promise(r=>setTimeout(r,250)); return {okb,on:RIDE.on,paid:t0-INV.items.fairticket}; });
    ok(r.okb&&r.on==='fair:wheel:0'&&r.paid===2,'the Ferris wheel boards for two tickets: '+JSON.stringify(r));
    const r2=await pg.evaluate(async()=>{ const R=FAIR.rides.wheel, now=TRAINS.now(); R.off=-(now%R.def.cycle)+R.def.load+40; await new Promise(r=>setTimeout(r,1500)); return {on:RIDE.on,py:+(SHARED.py/1.13).toFixed(1),stopped:R.stopped}; });
    ok(r2.on==='fair:wheel:0'&&!r2.stopped&&r2.py>3,'riding, the seat carries you up ('+r2.py+' tiles)');
    const r3=await pg.evaluate(async()=>{ const R=FAIR.rides.wheel, now=TRAINS.now(); R.off=-(now%R.def.cycle)+2; await new Promise(r=>setTimeout(r,800)); return {on:RIDE.on,py:+(SHARED.py/1.13).toFixed(2)}; });
    ok(!r3.on&&r3.py<1,'back at the station the ride lets you off on the ground: '+JSON.stringify(r3));
    // a booth: a play costs a ticket, three presses throw, the game ends
    const p0=await pg.evaluate(()=>{ const t=INV.items.fairticket; MIDWAY.play(MIDWAY.booths.rings); return {on:MIDWAY.on,paid:t-INV.items.fairticket}; });
    for(let i=0;i<3;i++){ await pg.waitForTimeout(700); await pg.keyboard.press(' '); } await pg.waitForTimeout(2500);
    const p1=await pg.evaluate(()=>({on:MIDWAY.on,ptix:INV.items.ptix|0,best:MIDDBG().bests}));
    ok(p0.on==='rings'&&p0.paid===1&&p1.on===null,'the ring toss takes a ticket, plays three throws and ends (prize tickets '+p1.ptix+')');
    // a kart: rent one at the pit, you are in it, get out and it stands at its slot again
    const k=await pg.evaluate(async()=>{ const th=UI.things.find(t=>/RENT A KART/.test(t.name)); th.act(); await new Promise(r=>setTimeout(r,400)); const on=RIDE.on; RIDE.off(); await new Promise(r=>setTimeout(r,300)); return {on,off:RIDE.on,back:KARTS.karts[0].mesh.visible}; });
    ok(k.on==='fair:kart:0'&&!k.off&&k.back,'a rental kart boards where it stands and goes back to its slot: '+JSON.stringify(k));
    const f=await pg.evaluate(()=>{ INV.cash+=20; const th=UI.things.find(t=>/^POPCORN/.test(t.name)); th.act(); MIDWAY.prizes(); const w=document.getElementById('prizew'); const open=!w.hidden; w.hidden=true; MIDWAY.fireworks(); return {popcorn:INV.items.popcorn|0,open}; });
    ok(f.popcorn===1&&f.open,'a stall sells popcorn for cash, the prize counter opens, the fireworks burst');
    const fw=await pg.evaluate(async()=>{ await new Promise(r=>setTimeout(r,300)); return MIDDBG().fw; }); ok(fw>0,'fireworks sparks are live ('+fw+')');
  }
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all fair checks passed'); await b.close(); process.exit(bad?1:0); })();
