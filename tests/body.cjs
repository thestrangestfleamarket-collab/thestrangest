// YOUR BODY (owner, 7 Nov 2026; 8 Nov 2026 the bath house): dying leaves your body holding what you carried; the ghost walks to the bath house, ten seconds in its steam and you wake alive there; your body still holds it all until you take it back (8 Nov 2026, the island bath house). node tests/body.cjs [dist/market.html]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }); const errs=[];
  pg.on('pageerror', e => errs.push(e.message.slice(0,300)));
  await pg.goto('file://'+require('path').resolve(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13', { waitUntil: 'commit' });
  await pg.waitForFunction(()=>window.__started,null,{timeout:300000}); await pg.evaluate(()=>__dbg.UI.goTo(40,10,'up')); await pg.waitForTimeout(3000);   // (dies on the street)
  const r=await pg.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); INV.items={}; INV.add('sword',1); INV.cash=50; const o={}; const p=__dbg.pos(); o.at=[p[0],p[2]];
    __dbg.VIT.die(); await w(500); o.dead=__dbg.VIT.dead; o.body=BODYDBG(); o.emptied=!INV.items.sword&&INV.cash===0; o.note=(document.getElementById('dead')||{}).textContent; return o; });
  console.log(JSON.stringify(r));
  await pg.waitForFunction(()=>DEADDBG().gh>=1,null,{timeout:120000}).catch(()=>console.log('no ghost'));
  // the ghost goes into the bath house and waits in the steam
  const inBath=()=>pg.evaluate(()=>{ const B=__dbg.MAPK.BOD, G=B.GD, r=G.r; __dbg.UI.goTo((B.X(r[0])+B.X(r[2]))/2,(B.Z(r[1])+B.Z(r[3]))/2,'up'); return G.inside(); });
  let ok=false, inside=false; for(let i=0;i<30&&!ok;i++){ inside=await inBath()||inside; await pg.waitForTimeout(2000); ok=await pg.evaluate(()=>!__dbg.VIT.dead); }
  await pg.waitForFunction(()=>!(window.FADE&&FADE.busy),null,{timeout:120000}).catch(()=>{});
  // (owner, 8 Nov 2026, the island bath house: alive again where you stand in the steam; the body still lies where you fell, holding what you carried, until you take it back)
  const a=await pg.evaluate(()=>({p:__dbg.pos(),dead:__dbg.VIT.dead,inBath:__dbg.MAPK.BOD.GD.inside(),body:BODYDBG(),note:(document.getElementById('dead')||{}).textContent}));
  const kept=!!a.body&&a.body.items===1&&a.body.cash===50;
  await pg.evaluate(at=>__dbg.UI.goTo(at[0],at[1]+.6,'up'),r.at); await pg.waitForTimeout(3000);
  const t=await pg.evaluate(async()=>{ const th=__dbg.UI.things.find(x=>x.name==='YOUR BODY'); if(th)th.act(); await new Promise(r=>setTimeout(r,800)); return {found:!!th,back:!!INV.items.sword&&INV.cash===50,body:BODYDBG()}; });
  console.log(JSON.stringify({inside,woke:ok,kept,...a,take:t}),'errs',errs.slice(0,3)); await b.close();
  const good=r.dead&&r.emptied&&!!r.body&&/BATH HOUSE/.test(r.note||'')&&inside&&ok&&!a.dead&&a.inBath&&kept&&t.found&&t.back&&!t.body&&!errs.length; console.log(good?'all body checks passed':'FAIL body'); process.exit(good?0:1);
})();
