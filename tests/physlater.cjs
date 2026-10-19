// PHYSICS ONLY WHEN WANTED (owner, 19 Oct 2026, of "do we need such a big physics engine": "C"): Rapier is not fetched at the start;
// walking into a light loose thing (a trash can) fetches it, and then the trash can is pushed. No page errors.
// node tests/physlater.cjs   (software rendering: a few minutes)
const {chromium}=require('playwright');
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:960,height:640}}), errs=[], got=[];
  pg.on('pageerror',e=>errs.push(e.message)); pg.on('request',r=>{ if(/rapier/.test(r.url()))got.push(Date.now()); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=14&at=-2.2,3.2',{timeout:180000});
  for(let i=0;i<200&&!await pg.evaluate(()=>!!window.__started).catch(()=>false);i++)await pg.waitForTimeout(1000);
  await pg.waitForTimeout(15000);
  ok(!got.length&&!await pg.evaluate(()=>GOODSDBG().built),'the physics is not fetched at the start');
  const a=await pg.evaluate(()=>{ const T=__dbg.cv().TILE, a=LOOSE.nearest('trash can'), [x,y,z]=__dbg.pos(); return a; });
  ok(!!a,'the trash cans are known before the physics ('+(a&&a.name)+')');
  await pg.evaluate(()=>{ const T=__dbg.cv().TILE, a=LOOSE.nearest('trash can'), [x,y,z]=__dbg.pos(), dx=a.at[0]-x, dz=a.at[2]-z, d=Math.hypot(dx,dz)||1, r=Math.max(...a.h); __dbg.UI.goTo(a.at[0]-dx/d*(r+.7*T),a.at[2]-dz/d*(r+.7*T),y); });
  await pg.waitForTimeout(1500); const t0=Date.now(); const r0=await pg.evaluate(()=>{ const T=__dbg.cv().TILE, a=LOOSE.nearest('trash can'), [x,,z]=__dbg.pos(), dx=a.at[0]-x, dz=a.at[2]-z, d=Math.hypot(dx,dz); __dbg.go(a.at[0]+dx/d*2.5*T,a.at[2]+dz/d*2.5*T); return a; });
  for(let i=0;i<60&&!await pg.evaluate(()=>GOODSDBG().built);i++)await pg.waitForTimeout(1000);
  ok(got.length>0&&await pg.evaluate(()=>GOODSDBG().built),`walking into it fetches the physics (${got.length?((got[0]-t0)/1000).toFixed(1)+' s':'never'})`);
  await pg.evaluate(()=>{ const T=__dbg.cv().TILE, a=LOOSE.nearest('trash can'), [x,,z]=__dbg.pos(), dx=a.at[0]-x, dz=a.at[2]-z, d=Math.hypot(dx,dz); __dbg.go(a.at[0]+dx/d*2.5*T,a.at[2]+dz/d*2.5*T); });
  await pg.waitForTimeout(12000); const r1=await pg.evaluate(()=>LOOSE.nearest('trash can'));
  ok(Math.hypot(r1.at[0]-r0.at[0],r1.at[2]-r0.at[2])>.05,`then it is pushed (moved ${Math.hypot(r1.at[0]-r0.at[0],r1.at[2]-r0.at[2]).toFixed(2)})`);
  ok(!errs.length,'no page errors '+errs.join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'all good'); process.exit(bad?1:0); })();
