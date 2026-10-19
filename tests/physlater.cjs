// PHYSICS ONLY WHEN WANTED (owner, 19 Oct 2026, of "do we need such a big physics engine": "C"): Rapier is not fetched at the start;
// a punch beside a light loose thing (the nearest one) fetches it, and then the thing is a body. No page errors.
// node tests/physlater.cjs   (software rendering: a few minutes)
const {chromium}=require('playwright');
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:960,height:640}}), errs=[], got=[];
  pg.on('pageerror',e=>errs.push(e.message)); pg.on('request',r=>{ if(/rapier/.test(r.url()))got.push(Date.now()); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=14&at=-2.2,3.2',{timeout:180000});
  for(let i=0;i<200&&!await pg.evaluate(()=>!!window.__started).catch(()=>false);i++)await pg.waitForTimeout(1000);
  await pg.waitForTimeout(15000);
  ok(!got.length&&!await pg.evaluate(()=>GOODSDBG().built),'the physics is not fetched at the start');
  const N=await pg.evaluate(()=>{ const [x,,z]=__dbg.pos(), L=LOOSE.list(true).filter(q=>q.k!=='v'&&!q.heavy&&q.m>2).sort((p,q)=>Math.hypot(p.at[0]-x,p.at[2]-z)-Math.hypot(q.at[0]-x,q.at[2]-z)); return L[0]&&L[0].name; });
  const rx='^'+(N||'-').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$', a=await pg.evaluate(n=>LOOSE.nearest(n),rx);
  ok(!!a,'the loose things are known before the physics (the nearest light one: '+N+')');
  await pg.evaluate(n=>{ const T=__dbg.cv().TILE, a=LOOSE.nearest(n), [x,y,z]=__dbg.pos(), dx=a.at[0]-x, dz=a.at[2]-z, d=Math.hypot(dx,dz)||1, r=Math.max(...a.h); __dbg.UI.goTo(a.at[0]-dx/d*(r+.7*T),a.at[2]-dz/d*(r+.7*T),y); },rx);
  await pg.waitForTimeout(1500); const t0=Date.now(); await pg.keyboard.down('j'); await pg.waitForTimeout(150); await pg.keyboard.up('j');
  for(let i=0;i<60&&!await pg.evaluate(()=>GOODSDBG().built);i++)await pg.waitForTimeout(1000);
  ok(got.length>0&&await pg.evaluate(()=>GOODSDBG().built),`a punch beside it fetches the physics (${got.length?((got[0]-t0)/1000).toFixed(1)+' s':'never'})`);
  await pg.waitForTimeout(3000); const r1=await pg.evaluate(n=>LOOSE.list().some(q=>new RegExp(n).test(q.name)),rx);
  ok(r1,'then it is a body (it can be pushed and thrown)');
  ok(!errs.length,'no page errors '+errs.join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'all good'); process.exit(bad?1:0); })();
