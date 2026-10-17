// THE MUSHROOM SELLER (npc-mushroom): find him (MUSHDBG), then a look at him close, two moments; the page's errors
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); });
  const out=process.argv[2]||'mush', rest=process.argv[3]||'', zoom=+(process.argv[4]||2), dx=+(process.argv[5]||3), dz=+(process.argv[6]||.6);
  await pg.goto('file://'+process.cwd()+'/dist/market.html?at=0,3',{timeout:180000}); await pg.waitForTimeout(20000);
  const D=await pg.evaluate(()=>typeof MUSHDBG!=='undefined'?MUSHDBG():null); console.log('mush',JSON.stringify(D)); if(!D){ console.log('errors',JSON.stringify(errs)); await b.close(); return; }
  await pg.goto('file://'+process.cwd()+'/dist/market.html?at='+(D.x+dx).toFixed(2)+','+(D.z+dz).toFixed(2)+'&npcwait=99&hideme=1'+rest,{timeout:180000}); await pg.waitForTimeout(22000);
  for(let i=0;i<zoom;i++){ await pg.mouse.move(500,350); await pg.mouse.wheel(0,-250); await pg.waitForTimeout(150); }  await pg.waitForTimeout(2500);
  await pg.screenshot({path:out+'0.png'}); console.log(await pg.evaluate(()=>JSON.stringify([MUSHDBG(),APTSDBG().pos,MUSHDBG.y&&MUSHDBG.y()]))); await pg.waitForTimeout(6000); await pg.screenshot({path:out+'1.png'});
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
