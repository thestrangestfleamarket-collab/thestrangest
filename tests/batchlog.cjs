// THE ATLAS'S PAGES (batch.js): node tests/batchlog.cjs <out.png>: every BATCH.build's faces, pages and the kinds on more than one page (split)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:700,height:500}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,6',{timeout:180000}); await pg.waitForTimeout(32000);
  console.log(JSON.stringify(await pg.evaluate(()=>BATCH.log))); await pg.screenshot({path:process.argv[2]}); console.log(Object.keys(errs)); await b.close(); })();
