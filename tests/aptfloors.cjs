// THE HOUSE'S FLOORS (apts.js's lvY / lvOf): node tests/aptfloors.cjs <out.png>: the ground, the 2nd and the 4th floor by the menu, the floor each reads
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:700,height:500}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1',{timeout:180000}); await pg.waitForTimeout(32000);
  for(const f of ['APARTMENT HOUSE GROUND','APARTMENT HOUSE FLOOR 2','APARTMENT HOUSE FLOOR 4']){ await pg.evaluate(n=>__UI.goPlace(n),f); await pg.waitForTimeout(4000); console.log(f,JSON.stringify(await pg.evaluate(()=>{ const d=APTSDBG(); return {in:d.in,floor:d.floor,py:+d.py.toFixed(2),room:!!ROOMS.cur}; }))); }
  await pg.screenshot({path:process.argv[2]}); console.log(Object.keys(errs)); await b.close(); })();
