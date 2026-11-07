// YOUR BODY (owner, 7 Nov 2026): dying leaves your body holding what you carried; the ghost is raised free by THE HERBALIST at the keep and takes it all back from the body. node tests/body.cjs [dist/market.html]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }); const errs=[];
  pg.on('pageerror', e => errs.push(e.message.slice(0,300)));
  await pg.goto('file://'+require('path').resolve(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13', { waitUntil: 'commit' });
  await pg.waitForFunction(()=>window.__started,null,{timeout:300000}); await pg.waitForTimeout(3000);
  const r=await pg.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); INV.items={}; INV.add('sword',1); INV.cash=50; const o={};
    __dbg.VIT.die(); await w(500); o.dead=__dbg.VIT.dead; o.body=BODYDBG(); o.emptied=!INV.items.sword&&INV.cash===0;
    const S=__dbg.CASTLE||null; return o; });
  console.log(JSON.stringify(r));
  // walk the ghost to the Herbalist
  const g=await pg.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); await w(4000); const N=GUARD.list.find(n=>n.key==='gd_toucan');
    const B=__dbg.MAPK.BOD, St=__dbg.MAPK.CASTLE.stair, at=N?{x:N.st.x,z:N.st.z}:{x:B.X((St.x0+St.x1)/2),z:B.Z(St.y1+3)}; return {guards:GUARD.list.length,herb:!!N,at}; });
  console.log(JSON.stringify(g));
  await pg.waitForFunction(()=>DEADDBG().gh>=1,null,{timeout:120000}).catch(()=>console.log('no ghost'));
  if(g.at){ await pg.evaluate(a=>{ __dbg.UI.goTo(a.x,a.z,'up'); },g.at); }
  await pg.waitForTimeout(3000); console.log('ghost',JSON.stringify(await pg.evaluate(()=>({d:DEADDBG(),p:__dbg.pos(),lvl:__dbg.lvl&&__dbg.lvl()}))));
  let ok=false; for(let i=0;i<60&&!ok;i++){ await pg.evaluate(()=>{ const N=GUARD.list.find(n=>n.key==='gd_toucan'), B=__dbg.MAPK.BOD, St=__dbg.MAPK.CASTLE.stair, a=N?{x:N.st.x,z:N.st.z}:{x:B.X((St.x0+St.x1)/2),z:B.Z(St.y1+3)}; const p=__dbg.pos(); if(Math.hypot(p[0]-a.x,p[2]-a.z)>1)__dbg.UI.goTo(a.x,a.z,'up'); }); await pg.waitForTimeout(3000); ok=await pg.evaluate(()=>!__dbg.VIT.dead); }
  console.log('raised',ok);
  console.log('after',JSON.stringify(await pg.evaluate(()=>({d:DEADDBG(),p:__dbg.pos(),dead:__dbg.VIT.dead,note:(document.getElementById('dead')||{}).textContent}))));
  const t=await pg.evaluate(async()=>{ const B=BODYDBG(); if(!B)return 'no body'; __dbg.UI.goTo(B.x,B.z,'up'); await new Promise(r=>setTimeout(r,3000)); const th=__dbg.UI.things.find(t=>t.name==='YOUR BODY'); th.act(); return {back:!!INV.items.sword&&INV.cash===50,gone:!BODYDBG()}; });
  console.log(JSON.stringify(t), 'errs', errs.slice(0,3)); await b.close(); const good=r.dead&&r.emptied&&!!r.body&&ok&&t.back&&t.gone&&!errs.length; console.log(good?'all body checks passed':'FAIL body'); process.exit(good?0:1);
})();
