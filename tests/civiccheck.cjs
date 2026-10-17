// THE CITY'S SERVICES, CHECKED (src/civic.js, duties.js, vehicles.js): at 13:00, the clock stopped: the six houses of the civic row are
// addresses, the staff stand at their doors in uniform, the four vehicles are parked at their houses; TRY a fire: a firefighter answers,
// the truck's lights go, the fire is hosed out; TRY an outage: the lamps off, the works crew comes, the lamps back; TRY a full can: a heap
// beside it, the crew empties it; a letter to you: the clock run past 9:30, the carrier leaves, your box gets it; YOU FAINT: the medic
// comes, you're up. Each watched till done (minutes each in the cloud's frames). Shots: argv[2] (a folder), civic_*.png
// node tests/civiccheck.cjs <out folder>
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]||'.', b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}), pg=await b.newPage({viewport:{width:1280,height:820}}), errs=[];
  pg.on('pageerror',e=>{ errs.push(e.message); console.log('pageerror:',e.message); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?npcwait=99&hour=13&hideme=1',{timeout:180000});
  for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(4000);
  const T=await pg.evaluate(()=>__dbg.cv().TILE), dbg=()=>pg.evaluate(()=>CIVDBG()), until=async(f,ms,step=2000)=>{ let t=0; for(;t<ms;t+=step){ await pg.waitForTimeout(step); if(await pg.evaluate(f))return t; } return -1; };
  const P=await pg.evaluate(()=>CITY.places().filter(p=>['precinct','firehouse','post','depot','hall','clinic'].includes(p.id)).map(p=>p.id+'@'+(p.door.x/__dbg.cv().TILE).toFixed(0)+','+(p.door.z/__dbg.cv().TILE).toFixed(0)));
  console.log('the civic row:',P.join(' · '),'· row triangles',await pg.evaluate(()=>CIVIC.tris));
  const d0=await dbg(); console.log('staff:',d0.staff.map(s=>s[0]+' '+s[1]+' at '+s[3]+','+s[4]+(s[5]?'':' HIDDEN')).join(' · '));
  console.log('vehicles:',JSON.stringify(await pg.evaluate(()=>VEHDBG())));
  // a look at the row from above, and a car close
  await pg.evaluate(()=>{ const h=CIVIC.house('depot'), T=__dbg.cv().TILE; __dbg.UI.setFree(true); __dbg.UI.camT.set(h.x,1.5,h.z+2*T); __dbg.cam(0.4,0.75,__dbg.cv().PPU*.45); }); await pg.waitForTimeout(3000); await pg.screenshot({path:out+'/civic_row.png'});
  await pg.evaluate(()=>{ const v=VEH.kinds.patrol; __dbg.UI.setFree(true); __dbg.UI.camT.set(v.x,v.H*.6,v.z); __dbg.cam(null,null,__dbg.cv().PPU*3); }); await pg.waitForTimeout(2500); await pg.screenshot({path:out+'/civic_car.png'});
  await pg.evaluate(()=>{ __dbg.UI.setFree(false); const h=CIVIC.house('depot'); STORE.goTo(h.x,h.z+3*__dbg.cv().TILE,'up'); });
  // A FIRE
  await pg.evaluate(()=>CIVIC.tryFire()); let d=await dbg(); console.log('fire started at',JSON.stringify(d.fires),'· job',d.jobs.filter(j=>j.startsWith('fire')).join());
  let t=await until(()=>Object.values(CIVIC.staff).some(S=>S.id.startsWith('fire')&&S.state!=='free'),20000); console.log('  a firefighter answered after',t,'ms ·',(await dbg()).staff.filter(s=>s[0].startsWith('fire')).map(s=>s[1]).join(', '),'· truck lights',await pg.evaluate(()=>VEH.kinds.fire.alarm));
  t=await until(()=>CIVIC.fires.length===0||CIVIC.fires.every(f=>f.out),600000,4000); d=await dbg(); console.log('  the fire out after',t>=0?(t/1000).toFixed(0)+' s':'NEVER (10 min)','·',d.log.find(l=>/fire is out|burnt/.test(l))||'(no log line)');
  await pg.screenshot({path:out+'/civic_fire.png'});
  // AN OUTAGE
  await pg.evaluate(()=>CIVIC.tryOutage()); const off0=await pg.evaluate(()=>DRESS.pools.filter(p=>p[0].userData.off).length); console.log('outage: lamps off',off0);
  t=await until(()=>DRESS.pools.every(p=>!p[0].userData.off)&&CITY.open('power').length===0,600000,4000); console.log('  power back after',t>=0?(t/1000).toFixed(0)+' s':'NEVER (10 min)','· works crew:',(await dbg()).staff.find(s=>s[0]==='works')[1]);
  // A FULL CAN
  t=await until(()=>CIVIC.staff.works.state==='free',300000,4000); await pg.evaluate(()=>CIVIC.tryCan()); d=await dbg(); console.log('a full can:',JSON.stringify(d.cans[0]),'· job',d.jobs.filter(j=>j.startsWith('trash')).join());
  t=await until(()=>CIVIC.cans[0].fill===0&&CITY.open('trash').length===0,600000,4000); console.log('  emptied after',t>=0?(t/1000).toFixed(0)+' s':'NEVER (10 min)');
  // THE MAIL
  await pg.evaluate(()=>{ CIVIC.send('you','THE MARKET','HELLO','test'); CITY.setHour(9.4); }); await pg.waitForTimeout(1500); await pg.evaluate(()=>CITY.setHour(9.6)); await pg.waitForTimeout(2000);
  d=await dbg(); console.log('the mail: bag',d.bag,'· carrier',d.staff.find(s=>s[0]==='carrier')[1]);
  t=await until(()=>CIVIC.box('you').length>0,600000,4000); console.log('  your letter arrived after',t>=0?(t/1000).toFixed(0)+' s':'NEVER (10 min)','· boxes',JSON.stringify((await dbg()).boxes));
  // YOU FAINT
  await pg.evaluate(()=>{ STORE.goTo(BOD.X((BOD.B0.x0+BOD.B0.x1)/2),BOD.Z(BOD.B0.y1)+3*__dbg.cv().TILE,'up'); CIVIC.tryFaint(); }); await pg.waitForTimeout(2000); d=await dbg(); console.log('you fainted: job',d.jobs.filter(j=>j.startsWith('medical')).join(),'· medic',d.staff.find(s=>s[0]==='medic')[1]);
  t=await until(()=>CIVIC.log.some(e=>/brought you round/.test(e.what)),600000,4000); console.log('  the medic brought you round after',t>=0?(t/1000).toFixed(0)+' s':'NEVER (10 min)');
  console.log('treasury',(await dbg()).treasury,'· the log:',JSON.stringify((await dbg()).log)); console.log('page errors:',errs.length); await b.close(); })().catch(e=>{ console.error(e); process.exit(1); });
