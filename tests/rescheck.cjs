// THE RESIDENTS, CHECKED (src/residents.js): the page opened at 23:00: all four home, hidden, inside the house's door; at 13:00: all four out
// and shown; the clock run from 7:20 past 7:30: hero_m comes out of the front door onto his errand (shown, at the door, an errand set);
// the clock set to 18:30: hero_m heads home (an errand to the house's door) and, watched a while, goes in (hidden); no page errors.
// node tests/rescheck.cjs
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}), errs=[];
  const open=async hour=>{ const pg=await b.newPage({viewport:{width:1280,height:820}}); pg.on('pageerror',e=>{ errs.push(e.message); console.log('pageerror:',e.message); });
    await pg.goto('file://'+process.cwd()+'/dist/market.html?npcwait=99&hideme=1&hour='+hour,{timeout:180000});
    for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(3000); return pg; };
  const show=(t,r)=>console.log(t,r.map(q=>`${q.key} ${q.flat}: ${q.state}${q.vis?' shown':' hidden'}${q.errand?' on an errand':''} at ${q.x},${q.z}`).join(' · '));
  let pg=await open(23); let r=await pg.evaluate(()=>RESDBG()); show('23:00 →',r); console.log('  all home and hidden:',r.every(q=>q.state==='home'&&!q.vis)?'YES':'NO');
  const H=await pg.evaluate(()=>{ const H=CITY.place('house'), T=__dbg.cv().TILE; return {x:+(H.door.x/T).toFixed(1),z:+(H.door.z/T).toFixed(1)}; }); console.log('  the house\'s door at',H.x,H.z,'tiles; they stand a tile and a bit inside it:',r.every(q=>Math.abs(q.x-H.x)<.3&&q.z<H.z)?'YES':'NO');
  // the clock run from 7:20 past hero_m's 7:30
  await pg.evaluate(()=>{ CITY.setHour(7.33); }); await pg.waitForTimeout(1500); await pg.evaluate(()=>{ CITY.setHour(7.55); }); await pg.waitForTimeout(2500);
  r=await pg.evaluate(()=>RESDBG()); show('7:33 then 7:55 →',r); const hm=r.find(q=>q.key==='hero_m'); console.log('  hero_m out of the door onto an errand:',hm.state==='out'&&hm.vis&&hm.errand?'YES':'NO','· the others still home:',r.filter(q=>q.key!=='hero_m').every(q=>q.state==='home')?'YES':'NO');
  await pg.close();
  pg=await open(13); r=await pg.evaluate(()=>RESDBG()); show('13:00 →',r); console.log('  all out and shown:',r.every(q=>q.state==='out'&&q.vis)?'YES':'NO');
  // 18:30: hero_m heads home; watched till he's in (a slow walk in the cloud's frames: up to 8 minutes)
  await pg.evaluate(()=>{ const N=__dbg.NPCS.find(n=>n.key==='hero_m'); N.st.v=3*__dbg.cv().TILE; CITY.setHour(18.3); }); await pg.waitForTimeout(2000);
  r=await pg.evaluate(()=>RESDBG()); const h1=r.find(q=>q.key==='hero_m'); console.log('18:30 → hero_m:',h1.state,h1.errand?'on his way':'(no errand)');
  let t=0, h2=h1; for(;t<480000&&h2.state!=='home';t+=5000){ await pg.waitForTimeout(5000); h2=(await pg.evaluate(()=>RESDBG())).find(q=>q.key==='hero_m'); }
  console.log('  after',(t/1000).toFixed(0),'s: hero_m',h2.state,h2.vis?'shown':'hidden','at',h2.x,h2.z,'·',h2.state==='home'&&!h2.vis?'WENT IN':'NOT HOME YET');
  console.log('page errors:',errs.length); await b.close(); })().catch(e=>{ console.error(e); process.exit(1); });
