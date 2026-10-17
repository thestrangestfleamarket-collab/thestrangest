// THE TREES' LOOKS (park.js, ?treelook=0|1|2|3): the park's round by day, each look, close on an oak; frame time and programs. node tests/treeshot.cjs <outdir>
const {chromium}=require('playwright'), out=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:900,height:620}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  for(const tl of [0,1,2,3]){ await pg.goto('file://'+process.cwd()+'/dist/market.html?at=20,30&hour=15&hideme=1&npcwait=99&treelook='+tl,{waitUntil:'commit',timeout:180000});
    for(let i=0;i<120;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; }
    await pg.evaluate(()=>{ const o=PARKDBG().oaks[1], p=__dbg.pos||{x:0,z:0}; __dbg.UI.off.set(o[0]-__dbg.cv().pos[0],0,o[2]-__dbg.cv().pos[1]); __dbg.cam(0.6,0.35,__dbg.cv().PPU*1.1); }); await pg.waitForTimeout(8000);
    const r=await pg.evaluate(()=>PARKDBG()); await pg.screenshot({path:`${out}/tree${tl}.png`}); console.log('look',tl,await pg.textContent('#stat'),'progs',r.progs); }
  await b.close(); })();
