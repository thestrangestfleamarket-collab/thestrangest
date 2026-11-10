// THE FARM (086a-farm): node tests/farm.cjs [dist/market.html]. The paddock deep in the park with its gate shut (solid; a double click steps you through); its animals stay in the pen, live by the farm's day (graze, rest, stand, walk by day).
const {chromium}=require('playwright'), path=require('path');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:900,height:600}}), errs=[]; let bad=0;
  const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; }; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+path.resolve(process.argv[2]||'dist/market.html')+'?hour=13&fresh=1&at=20,111.8',{waitUntil:'commit',timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:400000,polling:2000});
  await pg.waitForFunction(()=>window.CREATS&&CREATS.filter(N=>N.life).length>=6&&window.FARMDBG&&FARMDBG().gate,null,{timeout:200000,polling:2000}).catch(()=>{});
  const S=()=>pg.evaluate(()=>{ const P=FARMDBG().pen, z0=Math.min(P.z0,P.z1), z1=Math.max(P.z0,P.z1); return CREATS.filter(N=>N.life).map(N=>({k:N.key,a:N.life.act,in:N.st.x>=P.x0-.3&&N.st.x<=P.x1+.3&&N.st.z>=z0-.3&&N.st.z<=z1+.3})); });
  const acts=new Set(); let out=0, n=0; for(let i=0;i<8;i++){ const L=await S(); n=L.length; for(const q of L){ acts.add(q.a); if(!q.in)out++; } await pg.waitForTimeout(8000); }
  ok(n>=6,'the farm\'s animals are there ('+n+')'); ok(!out,'they stay in the pen ('+out+' samples out)'); ok(acts.size>=3&&!acts.has('sleep'),'by day they do different things, none asleep: '+[...acts].join(','));
  const g=await pg.evaluate(()=>{ const G=FARMDBG().gate, th=__dbg.UI.things.find(t=>t.name==='THE PADDOCK GATE'), solid=__dbg.SOL.up.some(b=>G.x>b[0]&&G.x<b[2]&&G.z>b[1]&&G.z<b[3]); const a=STORE.pos.clone(); th&&th.act(); const c=STORE.pos.clone(); th&&th.act(); const d=STORE.pos.clone();
    const sd=v=>Math.sign(v.x-G.x); return {th:!!th,solid,through:sd(a)!==sd(c)&&sd(d)===sd(a)}; });
  ok(g.th&&g.solid&&g.through,'the gate is shut and solid, and a double click steps you through and back: '+JSON.stringify(g));
  ok(!errs.length,'no page errors '+errs.slice(0,2).join(' | '));
  await b.close(); process.exit(bad?1:0); })();
