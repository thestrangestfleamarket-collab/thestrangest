// CENTRAL PARK'S ENTRANCE (park.js): the gate from the far sidewalk, the path and the round from inside, the page's errors
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); }); pg.on('console',m=>{ if(m.type()==='error'||m.type()==='warning')console.log(m.type(),m.text().slice(0,300)); });
  const out=process.argv[2]||'park', zoom=+(process.argv[3]||0);
  for(const [i,at] of [['gate','?at=0,16.5&hour=14'],['round','?at=0,26&hour=14'],['path','?at=12,33&hour=14'],['night','?at=0,24']].entries()){ await pg.goto('file://'+process.cwd()+'/dist/market.html'+at[1],{waitUntil:'commit',timeout:180000}); await pg.waitForTimeout(35000);
    for(let k=0;k<Math.abs(zoom);k++){ await pg.mouse.move(500,350); await pg.mouse.wheel(0,zoom<0?-250:250); await pg.waitForTimeout(150); } await pg.waitForTimeout(1500);
    await pg.screenshot({path:out+'_'+at[0]+'.png'}); console.log(at[0],await pg.textContent('#stat')); }
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
