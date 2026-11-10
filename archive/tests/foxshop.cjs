// THE FOX BEHIND THE COUNTER, close, by night (the rack over him, his spot): node tests/foxshop.cjs <outdir>
const {chromium}=require('playwright'), out=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:900,height:620}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?npcwait=99&hour=21&hideme=1&place=the bodega',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(6000);
  await pg.evaluate(()=>{ const f=FOXDBG(); __dbg.UI.off.set(f.x-__dbg.cv().pos[0],0,f.z-__dbg.cv().pos[1]); __dbg.cam(-1.2,0.35,__dbg.cv().PPU*2.2); }); await pg.waitForTimeout(7000);
  console.log(JSON.stringify(await pg.evaluate(()=>FOXDBG()))); await pg.screenshot({path:`${out}/fox-shop.png`}); await b.close(); })();
