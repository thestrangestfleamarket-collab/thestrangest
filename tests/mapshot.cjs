const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message)); pg.on('console',m=>{ if(m.type()==='error'||m.type()==='warning')console.log(m.type(),m.text().slice(0,250)); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html'); await pg.waitForTimeout(30000); await pg.keyboard.press('h');
  console.log(await pg.textContent('#stat')); await pg.screenshot({path:'map1.png'});
  for(let i=0;i<4;i++){ await pg.mouse.move(500,350); await pg.mouse.wheel(0,250); await pg.waitForTimeout(200); } await pg.waitForTimeout(8000); await pg.screenshot({path:'map2.png'}); console.log(await pg.textContent('#stat'));
  await b.close(); })();
