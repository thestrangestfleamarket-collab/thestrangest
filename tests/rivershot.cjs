// THE HUDSON, REAL WATER (river.js): node tests/rivershot.cjs <outdir> [ways, as flat,swell,full] [waters, as 0,1,2] [hour]: for each way and water,
// the quay from the opening view; then (the first water, FULL) him in it, swimming, a dive, the first person under; the console's errors listed
const {chromium}=require('playwright');
(async()=>{ const [out,ways='flat,swell,full',ws='0,1,2',hour='13']=process.argv.slice(2); require('fs').mkdirSync(out,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1100,height:760}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; }); pg.on('console',m=>{ if(m.type()==='error')errs[m.text().slice(0,300)]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour='+hour,{timeout:180000}); await pg.waitForFunction(()=>window.__started&&window.RIVER,{timeout:240000}); await pg.waitForTimeout(6000);
  await pg.evaluate(()=>[...document.querySelectorAll('#rvpan [data-go="1"]')][0].click()); await pg.waitForTimeout(3000);
  for(const w of ways.split(','))for(const i of ws.split(',')){ await pg.evaluate(([w,i])=>RIVER.set({way:w,wi:+i}),[w,i]); await pg.waitForTimeout(5000); await pg.screenshot({path:`${out}/quay-${w}-${i}.png`}); console.log('shot',w,i); }
  // in the water: FULL, the harbor; a walk off the quay, a swim, a dive
  await pg.evaluate(()=>RIVER.set({way:'full',wi:0})); await pg.waitForTimeout(1500);
  await pg.evaluate(()=>[...document.querySelectorAll('#rvpan [data-go="2"]')][0].click()); await pg.waitForTimeout(4000);
  await pg.screenshot({path:`${out}/swim-1.png`}); console.log('swim',await pg.evaluate(()=>({swim:RIVER.swim,dep:RIVER.dep,bot:RIVER.bot,air:RIVER.air,p:__dbg.pos()})));
  await pg.keyboard.down('a'); await pg.waitForTimeout(2500); await pg.screenshot({path:`${out}/swim-2.png`}); await pg.keyboard.up('a');
  await pg.keyboard.down(' '); await pg.waitForTimeout(3500); await pg.screenshot({path:`${out}/dive.png`}); console.log('dive',await pg.evaluate(()=>({swim:RIVER.swim,dep:RIVER.dep,air:RIVER.air})));
  await pg.keyboard.up(' '); await pg.waitForTimeout(3000);
  console.log('tris',await pg.evaluate(()=>__dbg.tris()),'errors',Object.keys(errs)); await b.close(); })();
