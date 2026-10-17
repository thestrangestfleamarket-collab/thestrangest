// GHOST STREET'S DOJO (ghostdojo.js): the building from its forecourt, the hall from inside, the page's errors
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); }); pg.on('console',m=>{ if(m.type()==='error')console.log(m.type(),m.text().slice(0,300)); });
  const out=process.argv[2]||'gd', zoom=+(process.argv[3]||0), k=33.9/30*1.1, X=t=>((t-72)*k).toFixed(2), Z=t=>((t+77)*k).toFixed(2);   // (the building's scale: BOD.X, BOD.Z)
  for(const [name,q] of [['out',`?at=${X(118.96)},${Z(-77-2.5)}&hour=${process.env.HOUR||21}`],['in',`?at=${X(118.96)},${Z(-77-8.6)}&hour=21`]]){ await pg.goto('file://'+process.cwd()+'/dist/market.html'+q,{waitUntil:'commit',timeout:180000}); await pg.waitForTimeout(38000);
    for(let i=0;i<Math.abs(zoom);i++){ await pg.mouse.move(500,350); await pg.mouse.wheel(0,zoom<0?-250:250); await pg.waitForTimeout(150); } await pg.waitForTimeout(1500);
    await pg.screenshot({path:out+'-'+name+'.png'}); console.log(name,await pg.evaluate(()=>JSON.stringify(window.MAPDBG&&MAPDBG()))); }
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
