// FLOWERS, BIRDS, BOOKS (owner, 19 Oct 2026): node tests/natshot.cjs <out>: the park lawn with its flowers and birds, a planted bed,
// the bird menu, the journal, the oddities stall, the tomato's seeds; prints GARDDBG, BIRDDBG and the page's errors
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]||'nat'; const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1100,height:760}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); });
  pg.on('console',m=>{ if(m.type()==='error')console.log('console',m.text().slice(0,300)); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour='+(process.env.HOUR||10)+(process.env.AT?'&at='+process.env.AT:''),{timeout:180000}); await pg.waitForTimeout(+(process.env.WAIT||30000));
  const dbg=()=>pg.evaluate(()=>({g:window.GARDDBG&&GARDDBG(),b:window.BIRDDBG&&BIRDDBG()}));
  console.log('start',JSON.stringify(await dbg()));
  if(process.env.PARK!=='0'){ await pg.evaluate(()=>{ const v=VEGDBG(); STORE.pos.set(v.wx+2,0,v.wz+9); }); await pg.waitForTimeout(9000); }
  console.log('park',JSON.stringify(await dbg()));
  for(let i=0;i<+(process.env.ZOOM||2);i++){ await pg.mouse.move(550,380); await pg.mouse.wheel(0,-250); await pg.waitForTimeout(150); } await pg.waitForTimeout(2000);
  await pg.screenshot({path:out+'-lawn.png'});
  await pg.evaluate(()=>{ const b=BIRDS.list.filter(b=>b.st==='ground').sort((a,c)=>Math.hypot(a.x-STORE.pos.x,a.z-STORE.pos.z)-Math.hypot(c.x-STORE.pos.x,c.z-STORE.pos.z))[0]; if(b)STORE.pos.set(b.x+BIRDS.T*1.3,0,b.z+BIRDS.T*1.3); }); await pg.waitForTimeout(3000); await pg.screenshot({path:out+'-birds.png'});
  console.log('plant',await pg.evaluate(()=>{ FORAGE.give('sd_sunflower',2); FORAGE.give('sd_tulip',1); const r=[]; for(const id of ['sd_sunflower','sd_tulip']){ FORAGE.ACT.gplant(id); STORE.pos.x+=BIRDS.T*.8; } return JSON.stringify(GARDDBG()); }));
  await pg.evaluate(()=>{ NEWSCLK((NEWSCLK()+1)%24); CITY.day++; }); await pg.waitForTimeout(3500); console.log('grown',JSON.stringify(await pg.evaluate(()=>GARDDBG())));
  await pg.screenshot({path:out+'-bed.png'});
  console.log('bird',await pg.evaluate(()=>{ const b=BIRDS.list.find(b=>b.st!=='pet'); if(!b)return 'none'; BIRDS.menu(b); return BIRDS.K[b.k][0]; })); await pg.waitForTimeout(600); await pg.screenshot({path:out+'-menu.png'});
  await pg.evaluate(()=>{ document.getElementById('birdp').hidden=true; FORAGE.give('bseed',3); BIRDS.S.seen[0]=2; BIRDS.S.seen[3]=1; FORAGE.PACK.toggle('birds'); }); await pg.waitForTimeout(600); await pg.screenshot({path:out+'-journal.png'});
  await pg.evaluate(()=>{ VEG.SHOP.open(); }); await pg.waitForTimeout(600); await pg.screenshot({path:out+'-veg.png'});
  await pg.evaluate(()=>{ document.getElementById('vegp').hidden=true; const b=BIRDS.list.find(b=>b.st!=='pet'); if(b){ FORAGE.S.sk.bird=1000; STORE.pos.set(b.x+BIRDS.T*1.5,0,b.z); BIRDS.menu(b); document.querySelector('#birdp [data-a="tame"]').click(); } }); await pg.waitForTimeout(5000);
  await pg.screenshot({path:out+'-pet.png'});
  console.log('end',JSON.stringify(await dbg())); console.log('errors',JSON.stringify(errs)); await b.close(); })();
