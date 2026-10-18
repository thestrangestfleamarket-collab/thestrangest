// ONE OF THE TOONS WALKING (npc-toons.js): node tests/toonwalk.cjs <name: tomato|cat|tv|frog|shark> <outdir> [zoom]: found on the street, the free
// camera kept on him, three moments a second apart (his walk, his springs, his things)
const {chromium}=require('playwright');
(async()=>{ const [name,out='.',zoom='2']=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:900,height:620}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?at=0,3',{timeout:180000}); await pg.waitForTimeout(20000);
  const D=await pg.evaluate(n=>TOONSDBG()[n],name); await pg.evaluate(()=>{ try{ localStorage.clear(); }catch(e){} });   // (the game keeps where you left off: not for the second look) console.log(name,JSON.stringify(D));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hideme=1&hour=13&npcwait=0&at='+(D.x+5*1.13).toFixed(2)+','+(D.z+.5).toFixed(2),{timeout:180000}); await pg.waitForTimeout(24000);
  await pg.evaluate(([key,z])=>{ const N=__dbg.NPCS.find(n=>n.key===key), U=__dbg.UI; U.setFree(true); __dbg.cam(null,null,30*z); setInterval(()=>U.camT.set(N.g.position.x,N.g.position.y+N.H*.4,N.g.position.z),16); },[D.key,+zoom]);
  await pg.waitForTimeout(3000);
  for(let i=0;i<3;i++){ await pg.waitForTimeout(1000); await pg.screenshot({path:out+'/walk-'+name+i+'.png'}); }
  console.log(JSON.stringify(await pg.evaluate(n=>TOONSDBG()[n],name)),'errors',JSON.stringify(errs)); await b.close(); })();
