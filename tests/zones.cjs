// THE ALLEY AND THE HUDSON LOAD WHEN YOU GO IN (owner, 22 Oct 2026: "the alley should not load unless you go in there. for now its blocked off by gates ... (4 gate total) the hudson promanade also shouldnt load untli you go into it"):
// the alley and the river aren't built from Market St; four gates close the alley's ends; walking down the path to the Hudson builds the river; back on Market St it isn't drawn.
// Run: node tests/zones.cjs   (slow in a cloud container: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,0&hour=12'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(3000);
  const idle=()=>pg.waitForFunction(()=>!(window.FADE&&FADE.busy),null,{timeout:120000,polling:300}).catch(()=>{});
  const s0=await pg.evaluate(()=>({river:RIVER.on,alley:!!window.BLK.built,gates:GATES.list.filter(g=>g.alley).length}));
  ok(!s0.river&&!s0.alley,'from Market St neither the alley nor the river is built ('+JSON.stringify(s0)+')');
  ok(s0.gates===4,'four gates close the alley ('+s0.gates+')');
  const blocked=await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD, T=1.13, z=(-94.15+77)*T, g=GATES.list.filter(q=>q.alley).map(q=>q.x); return g.map(x=>{ const p=__dbg.collide((x-72)*T,z); return Math.abs(p[0]-(x-72)*T)>.05||Math.abs(p[1]-z)>.05; }); });
  ok(blocked.every(Boolean),'each alley gate stops you ('+blocked+')');
  await pg.evaluate(()=>__dbg.UI.goTo((117.5-72)*1.13,(-112+77)*1.13,'up',Math.PI)); await pg.waitForTimeout(1500); await idle(); await pg.waitForTimeout(2000);
  const s1=await pg.evaluate(()=>({river:RIVER.on,shown:RIVER.shown,alley:!!window.BLK.built}));
  ok(s1.river&&s1.shown&&!s1.alley,'down the path to the Hudson the river is built and shown, the alley still not ('+JSON.stringify(s1)+')');
  await pg.evaluate(()=>__dbg.UI.goTo(0,0,'up')); await pg.waitForTimeout(2000);
  ok(!(await pg.evaluate(()=>RIVER.shown)),'back on Market St the river isn\'t drawn');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all zone checks passed'); await b.close(); process.exit(bad?1:0); })();
