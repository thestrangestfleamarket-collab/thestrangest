// THE NEWSSTAND (newsstand.js), a look: isometric from the street and close in the map view, by day (and 9 pm shut). node tests/newsshot.cjs <out>
const {chromium}=require('playwright'), out=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:620}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  const load=async q=>{ await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&wx=clear&hideme=1'+q,{waitUntil:'commit',timeout:180000}); for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(6000); };
  await load(''); const AT=await pg.evaluate(()=>NEWSDBG().at); console.log('at',AT);
  for(const [name,q,cam] of [['news-iso',`&at=${AT}&hour=15.5`,null],['news-close',`&at=${AT}&hour=15.5&view=map`,[0.25,0.25,2.2]],['news-night',`&at=${AT}&hour=23`,null]]){
    await load(q); if(cam)await pg.evaluate(c=>__dbg.cam(c[0],c[1],__dbg.cv().PPU*c[2]),cam); await pg.waitForTimeout(12000);
    await pg.screenshot({path:`${out}/${name}.png`}); console.log(name,JSON.stringify(await pg.evaluate(()=>NEWSDBG().stock))); }
  await b.close(); })();
