// THE OUTSIDE GATE CHECK (SYS.far, 006): node tests/outgate.cjs [dist/market.html]. A start on the platform fetches none of the street's own files (cars, the row's fronts, the animals); they come when you are first out on the street; a start on the street has them at once.
const {chromium}=require('playwright'), path=require('path');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const errs=[], fails=[], ok=(c,m)=>{ if(!c)fails.push(m); console.log((c?'ok  ':'FAIL')+' '+m); };
  const U='file://'+path.resolve(process.argv[2]||'dist/market.html'), open=async q=>{ const pg=await b.newPage({viewport:{width:800,height:500}}); pg.on('pageerror',e=>errs.push(e.message.slice(0,200))); await pg.goto(U+q,{waitUntil:'commit',timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:600000}); return pg; };
  const st=pg=>pg.evaluate(()=>{ const M=__dbg.MAPK.MODS; return {out:__dbg.out(),cars:!!(M.cars&&M.cars.dbg&&M.cars.dbg().loaded),row:!!(window.PFROW&&PFROW.done),folk:__dbg.NPCS.all().length}; });
  let pg=await open('?hour=13&npcwait=99'); await pg.waitForTimeout(8000); const a=await st(pg);
  ok(!a.out&&!a.cars&&!a.row,'on the platform the street\'s files are not asked for: '+JSON.stringify(a));
  await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD; __dbg.UI.goTo(B.X(40),B.Z(60),0); }); let c=a; for(let i=0;i<120&&!(c.out&&c.cars&&c.row&&c.folk>a.folk);i++){ await pg.waitForTimeout(500); c=await st(pg); }
  ok(c.out&&c.cars&&c.row&&c.folk>a.folk,'out on the street they come: '+JSON.stringify(c)); await pg.close();
  pg=await open('?fresh=1&at=0,0&hour=13&npcwait=99'); const d=await st(pg); ok(d.out,'a start on the street has the gate open at once: '+JSON.stringify(d));
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):'')); await b.close(); console.log(fails.length?'FAILED: '+fails.length:'all outside gate checks passed'); process.exit(fails.length?1:0); })();
