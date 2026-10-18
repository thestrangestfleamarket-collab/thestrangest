// THE FAR CITY STILL (owner, 18 Oct 2026: "the distant buildings constantly change every pixel every single frame ... likes like static"): his eyes
// down the street, a picture; the view turned a tenth of a degree, a picture; how many pixels of the skyline (the picture's top half) changed
// beyond what the turn itself moves. node tests/farstatic.cjs <out-prefix>
const {chromium}=require('playwright'), out=process.argv[2]||'far';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:640,height:400}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&frame=1&at=40,11',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(6000);
  await pg.evaluate(()=>__dbg.setHd(Math.PI/2)); await pg.keyboard.press('v'); await pg.waitForTimeout(600); await pg.keyboard.press('v'); await pg.waitForTimeout(3000);
  const shot=async n=>{ await pg.waitForTimeout(1500); return pg.screenshot({path:`${out}-${n}.png`}); };
  const y0=await pg.evaluate(()=>__dbg.cv().yaw); await shot('a');
  await pg.evaluate(y=>__dbg.cam(y+0.0017),y0); await shot('b');
  await pg.evaluate(y=>__dbg.cam(y),y0); await shot('c');
  console.log('errors',errs.slice(0,3)); await b.close(); })();
