// YOUR HALL (150n-hall.js): the hall behind your front door builds with your rooms, its elevator and door are things, the stairs down land you at the stoop and the stairs up on the roof, and the roof's stair head takes you back down. node tests/hall.cjs
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:900,height:620}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?npcwait=99&hour=13&at=0,0',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(3000);
  const fails=[], ok=(c,m)=>{ if(!c)fails.push(m); console.log((c?'ok  ':'FAIL')+' '+m); }, until=async(f,n=60)=>{ for(let i=0;i<n;i++){ if(await pg.evaluate(f))return true; await pg.waitForTimeout(500); } return false; }, clear=()=>until(()=>{ const f=document.getElementById('subfade'); return !f||f.style.opacity!=='1'; });   // each fade is slow under software rendering: wait it out
  await pg.evaluate(()=>window.ENTERAPT()); await until(()=>HALLDBG().real&&HALLDBG().built); await clear(); await pg.waitForTimeout(800);
  let d=await pg.evaluate(()=>({...HALLDBG(),apt:APTSDBG()}));
  ok(d.real&&d.built,'the hall builds with your rooms');
  ok(d.things.includes('ELEVATOR')&&d.things.includes('FRONT DOOR')&&d.things.includes('STAIRS DOWN'),'the elevator, your front door and the roof\'s stair head are things ('+d.things.join(', ')+')');
  ok(!d.door,'your front door starts shut');
  await pg.evaluate(()=>HALLDBG().use('FRONT DOOR')); await pg.waitForTimeout(500); d=await pg.evaluate(()=>HALLDBG()); ok(d.door,'double-clicking your front door opens it');
  const home=await pg.evaluate(()=>APTSDBG().pos);
  await pg.evaluate(()=>{ HALLDBG().land('down'); HALLDBG().use('STAIRS DOWN TO THE STREET'); }); await until(()=>!HALLDBG().real); await clear(); await pg.waitForTimeout(800);
  d=await pg.evaluate(()=>({real:HALLDBG().real,apt:APTSDBG(),home:window.HOUSEAT(.9)}));
  ok(!d.real&&Math.hypot(d.apt.pos[0]-d.home[0],d.apt.pos[1]-d.home[1])<3,'the stairs down land you at the stoop ('+d.apt.pos+' vs '+d.home.map(v=>+v.toFixed(1))+')');
  await pg.evaluate(()=>window.ENTERAPT()); await until(()=>HALLDBG().real); await clear(); await pg.waitForTimeout(800);
  await pg.evaluate(()=>{ HALLDBG().land('up'); HALLDBG().use('STAIRS UP TO THE ROOF'); }); await until(()=>!HALLDBG().real); await clear(); await pg.waitForTimeout(800);
  d=await pg.evaluate(()=>({real:HALLDBG().real,floors:HALLDBG().floors,apt:APTSDBG()}));
  ok(!d.real&&d.apt.floor>=d.floors-1&&d.apt.py>1,'the stairs up put you on the roof (floor '+d.apt.floor+', py '+d.apt.py.toFixed(1)+')');
  await pg.evaluate(()=>HALLDBG().use('STAIRS DOWN')); await until(()=>HALLDBG().real); await clear(); await pg.waitForTimeout(800);
  d=await pg.evaluate(()=>HALLDBG());
  ok(d.real&&d.on===null,'the roof\'s stair head takes you down into the hall');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  await b.close(); if(fails.length){ console.log('FAILED: '+fails.length); process.exit(1); } console.log('hall: all good'); })();
