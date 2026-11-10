// ONE RULE FOR WHAT'S OUT OF DOORS (OUT, map-pre.js): node tests/outcheck.cjs <out>: on the street, in the shop, underground; what the camera
// sees of the sky, the birds, the force field, the river's sheet and the roofs' things in each, and a picture in the shop (<out>-in.png)
const {chromium}=require('playwright');
(async()=>{ const [out]=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:900,height:600}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,6',{timeout:180000}); await pg.waitForTimeout(30000);
  const look=()=>pg.evaluate(()=>({room:ROOMS.cur?(ROOMS.cur.id||ROOMS.cur.name||'yes'):null,up:OUT.up,open:OUT.open,world:OUT.world,n:OUT.L.length,seen:OUT.L.map(e=>(e.o.layers.mask&1)?1:0).join('')}));
  console.log('street',JSON.stringify(await look()));
  await pg.evaluate(()=>__UI.goPlace('THE BODEGA')); await pg.waitForTimeout(5000); console.log('shop',JSON.stringify(await look())); await pg.screenshot({path:out+'-in.png'});
  await pg.evaluate(()=>__UI.goPlace('THE PLATFORM')); await pg.waitForTimeout(5000); console.log('platform',JSON.stringify(await look()));
  await pg.evaluate(()=>__UI.goPlace('THE STREET')); await pg.waitForTimeout(5000); console.log('street again',JSON.stringify(await look()));
  console.log('errors',Object.keys(errs)); await b.close(); })();
