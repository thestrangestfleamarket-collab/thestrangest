// EVERY SHADER EDIT LANDS (src/shx.js): node tests/shxcheck.cjs [query]: the page opened, every material warmed (the menu's map draws every
// place), and every edit whose text wasn't found listed (SHX.miss); none is the pass
const {chromium}=require('playwright');
(async()=>{ const [q='']=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:900,height:600}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; }); pg.on('console',m=>{ if(/compile|SHADER/.test(m.text()))errs[m.text().slice(0,200)]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&'+q,{timeout:180000}); await pg.waitForTimeout(30000);
  for(const p of ['CENTRAL PARK','THE BODEGA','THE BATH HOUSE','THE PLATFORM','THE DUNGEON','THE DUNGEON STAIR']){ await pg.evaluate(n=>__UI.goPlace(n),p); await pg.waitForTimeout(5000); }
  const m=await pg.evaluate(()=>SHX.miss); console.log('missed',m.length); for(const k of m)console.log('  '+k);
  console.log('errors',Object.keys(errs)); await b.close(); process.exit(m.length?1:0); })();
