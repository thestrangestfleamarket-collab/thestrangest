// THE HUDSON LOADS WHEN YOU GO IN (owner, 22 Oct 2026: "the hudson promanade also shouldnt load untli you go into it"; the alley went with the filler buildings, 28 Oct 2026):
// the river isn't built from Market St; walking down the path to the Hudson builds it; back on Market St it isn't drawn.
// Run: node tests/zones.cjs   (slow in a cloud container: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,0&hour=12'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(3000);
  const idle=()=>pg.waitForFunction(()=>!(window.FADE&&FADE.busy),null,{timeout:120000,polling:300}).catch(()=>{});
  const s0=await pg.evaluate(()=>({river:RIVER.on}));
  ok(!s0.river,'from Market St the river is not built ('+JSON.stringify(s0)+')');
  await pg.evaluate(()=>__dbg.UI.goTo((117.5-72)*1.13,(-112+77)*1.13,'up',Math.PI)); await pg.waitForTimeout(1500); await idle(); await pg.waitForTimeout(2000);
  const s1=await pg.evaluate(()=>({river:RIVER.on,shown:RIVER.shown}));
  ok(s1.river&&s1.shown,'down the path to the Hudson the river is built and shown ('+JSON.stringify(s1)+')');
  await pg.evaluate(()=>__dbg.UI.goTo(0,0,'up')); await pg.waitForTimeout(2000);
  ok(!(await pg.evaluate(()=>RIVER.shown)),'back on Market St the river isn\'t drawn');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all zone checks passed'); await b.close(); process.exit(bad?1:0); })();
