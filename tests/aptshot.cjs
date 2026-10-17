// THE APARTMENT HOUSE'S FLOORS (apts.js): each floor from inside, by night and day. node tests/aptshot.cjs <outdir>
const {chromium}=require('playwright'), out=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:900,height:620}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  for(const [k,q] of [['g-night','place=apartment house ground&hour=21'],['f3-night','place=apartment house floor 3&hour=21'],['f3-day','place=apartment house floor 3&hour=13'],['f5-night','place=apartment house floor 5&hour=21']]){
    await pg.goto('file://'+process.cwd()+'/dist/market.html?npcwait=99&'+q,{waitUntil:'commit',timeout:180000});
    for(let i=0;i<120;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(9000);
    const r=await pg.evaluate(()=>{ const L=[]; __scene.traverse(o=>{ if(o.isPointLight&&o.intensity>0)L.push([Math.round(o.position.x),Math.round(o.position.y),Math.round(o.position.z),+o.intensity.toFixed(2),o.castShadow]); }); return {lit:L.length,sample:L.slice(0,12),pos:__dbg.cv().pos}; });
    console.log(k,JSON.stringify(r)); await pg.screenshot({path:`${out}/apt-${k}.png`}); }
  await b.close(); })();
