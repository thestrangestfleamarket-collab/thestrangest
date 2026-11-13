// DECORATE'S POLYFORK FURNITURE: node tests/pfdecor.cjs dist/market.html. Its pieces are kinds from the start, off sale until DECORATE opens and their models come; then each has its model, and bought ones stand in the flat with theirs.
const {chromium}=require('playwright'), path=require('path');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); let bad=0; const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  const pg=await b.newPage({viewport:{width:800,height:500}}), errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+path.resolve(process.argv[2]||'dist/market.html')+'?fresh=1&hour=11&place=your%20apartment',{waitUntil:'commit'}); await pg.waitForFunction(()=>window.__started,null,{timeout:400000});
  await pg.evaluate(async()=>{ const A=__dbg.MAPK.MODS.apts; if(!A.inReal)await A.enterReal(); for(let i=0;i<40&&(window.FADE&&FADE.busy);i++)await new Promise(r=>setTimeout(r,250)); });
  await pg.waitForTimeout(2000); const a=await pg.evaluate(()=>PFDECORDBG());
  ok(a.kinds>=25&&!a.ready&&a.built===0,'the Polyfork pieces are kinds, their models not fetched before DECORATE opens: '+JSON.stringify(a));
  await pg.evaluate(()=>{ INV.cash=1e5; ROOMED.toggle(); }); let c=a; for(let i=0;i<90&&!c.ready;i++){ await pg.waitForTimeout(1000); c=await pg.evaluate(()=>PFDECORDBG()); }
  ok(c.ready&&c.built===c.kinds&&!c.bad,'opening DECORATE fetches them and every piece has its model: '+JSON.stringify(c));
  const r=await pg.evaluate(async()=>{ const u=ROOMED.buy('pf:lounge-sofa-c34b3e'); await new Promise(r=>setTimeout(r,400)); if(ROOMED.place)ROOMED.place(); const A=ROOMED._api(), un=A.units().find(q=>q.kind==='pf:lounge-sofa-c34b3e'); return {bought:!!u,stands:!!un&&un.obj.children.length>0}; });
  ok(r.bought&&r.stands,'a Polyfork sofa bought in DECORATE stands in the flat with its model: '+JSON.stringify(r));
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  console.log(bad?bad+' failed':'all Polyfork furniture checks passed'); await b.close(); process.exit(bad?1:0); })();
