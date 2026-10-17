// THE STATS LINE AT A SPOT (17 Oct 2026): opens dist/market.html with a query, waits, prints the stats line (fps, draws, triangles) a few times and the
// perf fixes' state (window.__PERFX, when the page exposes it), then a screenshot beside this file's folder. node tests/perfstat.cjs "hour=19&place=the bodega&perfx=0" 40
// (?perfx=0: the fixes off, the before; -1,-2,-4,-6,-7 one of them off: src/perf.js). Compare two screenshots by pixel: PIL's ImageChops.difference, count >30.
const {chromium}=require('playwright');
(async()=>{ const q=process.argv[2]||'hour=19', W=+(process.argv[3]||40);
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1280,height:720}}); pg.setDefaultTimeout(600000);
  pg.on('pageerror',e=>console.log('ERR',e.message.slice(0,200)));
  await pg.goto('file:///home/user/thestrangest/dist/market.html?npcwait=99&'+q,{waitUntil:'commit'});
  for(let i=0;i<240;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; }
  await pg.waitForTimeout(W*1000);
  for(let k=0;k<3;k++){ await pg.waitForTimeout(3000); console.log(q,'|',(await pg.textContent('#stat')).slice(0,45)); }
  console.log(q,'| inner:',JSON.stringify(await pg.evaluate(()=>{ const P=window.__PERFX; if(!P)return null; let tris=0,vis=0; for(const m of P.inner){ const n=m.geometry.attributes.position.count/3; tris+=n; if(m.visible)vis+=n; } const L=window.__LITE.pool[0]; return {inner:P.inner.length,trisHidden:Math.round(tris-vis),trisShown:vis,on:P.on,lampMap:L.shadow.mapSize.x}; })));
  await pg.screenshot({path:__dirname+'/'+q.replace(/[^a-z0-9]+/gi,'_')+'.png'});
  await b.close(); })();
