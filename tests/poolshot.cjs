// THE BOATS (boats.js): the pool from inside, a few moments apart (the kayak and the fishing boat afloat); the page's errors
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); });
  const out=process.argv[2]||'pool';
  await pg.goto('file://'+process.cwd()+'/dist/market.html'+(process.argv[3]||'?at=25,-5.3')+'&hour=14',{timeout:180000}); await pg.waitForTimeout(22000);
  for(let k=0;k<3;k++){ await pg.mouse.move(500,350); await pg.mouse.wheel(0,250); await pg.waitForTimeout(150); }
  for(let i=0;i<2;i++){ await pg.waitForTimeout(4000); await pg.screenshot({path:out+i+'.png'}); console.log(i,await pg.evaluate(()=>typeof FLOATS!=='undefined'?JSON.stringify(FLOATS.bodies.map(b=>({x:+b.x[0].toFixed(2),y:+b.x[1].toFixed(2),z:+b.x[2].toFixed(2)}))):'no FLOATS')); }
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
