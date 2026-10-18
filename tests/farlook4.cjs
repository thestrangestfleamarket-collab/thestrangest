// THE BAKED FAR CITY ALL ROUND (skyline.js's panels): his eyes on the main street looking each of the four ways, and the opening isometric view.
// node tests/farlook4.cjs <out-prefix> [query]
const {chromium}=require('playwright'), out=process.argv[2]||'far4', q=process.argv[3]||'';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:640,height:400}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&frame=1&at=40,11'+q,{waitUntil:'commit',timeout:180000});
  for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(5000);
  await pg.screenshot({path:`${out}-iso.png`});
  await pg.keyboard.press('v'); await pg.waitForTimeout(600); await pg.keyboard.press('v'); await pg.waitForTimeout(2500);
  for(const [n,a] of [['east',0],['north',Math.PI/2],['west',Math.PI],['south',-Math.PI/2]]){ await pg.evaluate(a=>__dbg.cam(a),a); await pg.waitForTimeout(2500); await pg.screenshot({path:`${out}-${n}.png`}); }
  console.log('errors',errs.slice(0,3)); await b.close(); })();
