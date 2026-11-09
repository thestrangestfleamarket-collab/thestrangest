// STARTING AT HOME: a spot saved in your apartment comes back to it however long ago you left, and the start leaves the shops and streets for when you go out. node tests/aptstart.cjs
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:900,height:620}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  const fails=[], ok=(c,m)=>{ if(!c)fails.push(m); console.log((c?'ok  ':'FAIL')+' '+m); }, until=async(f,n=60)=>{ for(let i=0;i<n;i++){ if(await pg.evaluate(f).catch(()=>false))return true; await pg.waitForTimeout(500); } return false; }, clear=()=>until(()=>{ const f=document.getElementById('subfade'); return !f||f.style.opacity!=='1'; });
  const U='file://'+process.cwd()+'/dist/market.html?npcwait=99&hour=13', start=async q=>{ const t0=Date.now(); await pg.goto(U+q,{waitUntil:'commit',timeout:180000}); for(let i=0;i<300;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } return (Date.now()-t0)/1000; };
  const age=h=>pg.evaluate(h=>{ dispatchEvent(new Event('pagehide')); window.__started=false; const o=JSON.parse(localStorage.getItem('market-save')); for(const k of ['here','where'])if(o[k]){ const w=JSON.parse(o[k]); w.t-=h*36e5; o[k]=JSON.stringify(w); } localStorage.setItem('market-save',JSON.stringify(o)); },h);
  const tStreet=await start('&fresh=1'); await pg.waitForTimeout(2000); const N=(await pg.evaluate(()=>MSHOPDBG())).built.length;
  await pg.evaluate(()=>window.ENTERAPT()); await until(()=>window.__dbg.MAPK.MODS.apts.inReal); await clear(); await pg.waitForTimeout(1500);
  ok(await pg.evaluate(()=>window.__dbg.MAPK.MODS.apts.inReal),'in your apartment');
  await age(5); const tHome=await start(''); await pg.waitForTimeout(1500);
  ok(await pg.evaluate(()=>window.__dbg.MAPK.MODS.apts.inReal),'a spot in your apartment saved 5 hours ago comes back in it');
  const sh=await pg.evaluate(()=>MSHOPDBG()); ok(sh.built.length===0,'no shop inside built while you are home ('+sh.built.length+' / '+sh.shops.length+')');
  console.log('start on the street (fresh) '+tStreet.toFixed(1)+' s, start at home '+tHome.toFixed(1)+' s');
  await pg.evaluate(()=>window.EXITAPT()); await until(()=>!window.__dbg.MAPK.MODS.apts.inReal); await clear(); await pg.waitForTimeout(1000);
  ok(await pg.evaluate(()=>!window.__dbg.MAPK.MODS.apts.inReal&&window.__dbg.MAPK.MODS.apts.inR(window.__dbg.you().x,window.__dbg.you().z)===false),'out to the street'); { const sh=await pg.evaluate(()=>MSHOPDBG()); ok(sh.built.length>=N,'the shops are built on the way out ('+sh.built.length+', '+N+' at a street start)'); }
  await pg.waitForTimeout(1500); await age(5); await start(''); await pg.waitForTimeout(1500);
  ok(await pg.evaluate(()=>!window.__dbg.MAPK.MODS.apts.inReal&&window.__dbg.you().y<0),'a street spot saved 5 hours ago starts on the subway platform');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  await b.close(); if(fails.length){ console.log('FAILED: '+fails.length); process.exit(1); } console.log('aptstart: all good'); })();
