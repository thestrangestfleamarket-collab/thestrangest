// THE HUDSON LOADS NEAR (owner, 22 Oct 2026: "the hudson promanade also shouldnt load untli you go into it"; 4 Nov 2026: "why isnt the hudson showing"):
// far from the river it isn't built; from Market St (near its side) it is built and drawn; far again it isn't drawn; the forcefield shows only where you press against it.
// Run: node tests/zones.cjs   (slow in a cloud container: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,200&hour=12'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(3000);
  const idle=()=>pg.waitForFunction(()=>!(window.FADE&&FADE.busy),null,{timeout:120000,polling:300}).catch(()=>{});
  const s0=await pg.evaluate(()=>({river:RIVER.on}));
  ok(!s0.river,'far from the Hudson the river is not built ('+JSON.stringify(s0)+')');
  await pg.evaluate(()=>__dbg.UI.goTo(0,0,'up')); await pg.waitForTimeout(4000);
  const sm=await pg.evaluate(()=>({river:RIVER.on,shown:RIVER.shown,fade:!!(window.FADE&&FADE.busy)}));
  ok(sm.river&&sm.shown,'from Market St, near its side, the river is built and drawn ('+JSON.stringify(sm)+')');
  await pg.evaluate(()=>__dbg.UI.goTo((117.5-72)*1.13,(-112+77)*1.13,'up',Math.PI)); await pg.waitForTimeout(1500); await idle(); await pg.waitForTimeout(2000);
  const s1=await pg.evaluate(()=>({river:RIVER.on,shown:RIVER.shown}));
  ok(s1.river&&s1.shown,'down the path to the Hudson the river is built and shown ('+JSON.stringify(s1)+')');
  await pg.evaluate(()=>__dbg.UI.goTo(0,200,'up')); await pg.waitForTimeout(2500);
  ok(!(await pg.evaluate(()=>RIVER.shown)),'far from it again the river isn\'t drawn');
  const ff=await pg.evaluate(async()=>{ const F=RINGX.field; if(!F)return {none:true}; const far=F.visible, m=F.children[0], p=m.position; __dbg.UI.goTo(p.x+(Math.abs(m.rotation.y)>.1?-1:0)*1.2,p.z+(Math.abs(m.rotation.y)>.1?0:-1)*1.2,'up'); await new Promise(r=>setTimeout(r,2500)); return {far,near:F.visible,d:+RINGX.near(__dbg.you().x,__dbg.you().z).toFixed(2)}; });
  ok(ff.none||(!ff.far&&ff.near),'the forcefield is hidden far away and shows where you press against it ('+JSON.stringify(ff)+')');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all zone checks passed'); await b.close(); process.exit(bad?1:0); })();
