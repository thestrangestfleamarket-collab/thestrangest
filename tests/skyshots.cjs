// SKY SHOTS (19 Oct 2026): node tests/skyshots.cjs <out dir>: the behind view facing the sun at three hours, and the iso view; console
// errors (shader errors among them) listed in report.json.
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'skyout', PAGE=path.resolve(__dirname,'../dist/market.html');
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); const errs=[], rep={}; pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error'||/Shader Error|ERROR:/.test(m.text()))errs.push(m.text().slice(0,600)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=16&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__started))break; }
  await pg.waitForTimeout(5000);
  await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD; STORE.goTo(B.XS(40),B.ZS((B.CURB+B.FAR)/2),'up'); });
  await pg.waitForTimeout(3000); await pg.screenshot({path:path.join(OUT,'iso-16.png')});
  await pg.keyboard.press('v'); await pg.waitForTimeout(1500);
  for(const h of [16,9,12.5]){ await pg.evaluate(h=>{ const C=__dbg.clock; C.set(h); const s=C.sunV; window.__face=Math.atan2(-s.x,-s.z); },h);
    await pg.evaluate(()=>{ __dbg.face(__face); }); await pg.waitForTimeout(4000); await pg.screenshot({path:path.join(OUT,'behind-'+h+'.png')}); }
  await pg.evaluate(()=>{ __dbg.clock.set(16); }); await pg.goto('file://'+PAGE+'?hour=16&wx=CLOUDY',{waitUntil:'commit'}); for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__started))break; } await pg.waitForTimeout(6000); await pg.evaluate(()=>{ const s=__dbg.clock.sunV; __dbg.face(Math.atan2(-s.x,-s.z)); }); await pg.waitForTimeout(3000); await pg.screenshot({path:path.join(OUT,'cloudy-16.png')});
  rep.trees=await pg.evaluate(()=>__dbg.far3.treeN); rep.view=await pg.evaluate(()=>__dbg.ui().view); rep.errors=errs; fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep)); await b.close(); })();
