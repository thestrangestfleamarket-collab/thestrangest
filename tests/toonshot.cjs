// THE TOMATO AND HIS FRIENDS (npc-toons.js): node tests/toonshot.cjs <outdir> [hour] [zoom] [extra query]: the five stood in a row before the
// camera (?toonhold=1), at the game's own pixels; the page's errors and each one's triangles
const {chromium}=require('playwright');
(async()=>{ const [out='.',hour='13',zoom='1',extra='']=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:900,height:620}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour='+hour,{timeout:180000}); await pg.waitForTimeout(20000); const T=await pg.evaluate(()=>TOONSDBG().tomato); await pg.evaluate(()=>{ try{ localStorage.clear(); }catch(e){} });   // (the game keeps where you left off: not for the second look)   // (where the street is now: by the tomato)
  await pg.goto('file://'+process.cwd()+'/dist/market.html?at='+T.x+','+T.z+'&hideme=1&npcwait=99&toonhold=1&hour='+hour+extra,{timeout:180000}); await pg.waitForTimeout(26000);
  for(let i=0;i<+zoom;i++){ await pg.mouse.move(450,280); await pg.mouse.wheel(0,-250); await pg.waitForTimeout(150); }
  await pg.waitForTimeout(3000); await pg.screenshot({path:out+'/toons-'+hour+'.png'}); console.log(JSON.stringify(await pg.evaluate(()=>window.TOONSDBG&&TOONSDBG())),'errors',JSON.stringify(errs)); await b.close(); })();
