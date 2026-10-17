// THE CAMPFIRE AND THE STALLS (park.js): the fire by the sitting log at dusk, the two stalls at the gate by day; the page's errors
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); });
  const out=process.argv[2]||'camp';
  for(const [tag,at,zoom] of [['fire','?at=11.3,31&hour=19.5&npcwait=60',-2],['stalls','?at=0,19.5&hour=14&npcwait=60',-1]]){ await pg.goto('file://'+process.cwd()+'/dist/market.html'+at,{timeout:180000}); await pg.waitForTimeout(22000);
    for(let k=0;k<Math.abs(zoom);k++){ await pg.mouse.move(500,350); await pg.mouse.wheel(0,zoom<0?-250:250); await pg.waitForTimeout(150); } await pg.waitForTimeout(3000); await pg.screenshot({path:out+'_'+tag+'.png'}); }
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
