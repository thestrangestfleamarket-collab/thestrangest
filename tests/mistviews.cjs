// THE MIST FROM EVERY VIEW (skyline.js's mist by the ground's distance, FOGQ in map-pre.js): node tests/mistviews.cjs <out>: the park and the street
// from the opening isometric view (<out>-park.png, <out>-street.png), and the park over his shoulder, V (<out>-behind.png)
const {chromium}=require('playwright');
(async()=>{ const [out]=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:900,height:600}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&place=central park',{timeout:180000}); await pg.waitForTimeout(36000);
  await pg.screenshot({path:out+'-park.png'}); await pg.keyboard.press('v'); await pg.waitForTimeout(4000); await pg.screenshot({path:out+'-behind.png'});
  await pg.keyboard.press('v'); await pg.keyboard.press('v'); await pg.evaluate(()=>__UI.goPlace('THE STREET')); await pg.waitForTimeout(6000); await pg.screenshot({path:out+'-street.png'});
  console.log('errors',Object.keys(errs)); await b.close(); })();
