// THE PARK'S ANIMALS SHARED: node tests/animals.cjs dist/market.html. With the walks on (?folk=1, as on the website), every animal on the ground joins the section's walks (worker/folk.js) under its own key and walks where they say.
const {chromium}=require('playwright'), path=require('path');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:900,height:600}}), errs=[]; let bad=0;
  const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; }; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+path.resolve(process.argv[2]||'dist/market.html')+'?hour=12&fresh=1&folk=1&at=40,60',{waitUntil:'commit',timeout:180000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  let a=null; for(let i=0;i<60;i++){ await pg.waitForTimeout(2000); a=await pg.evaluate(()=>{ const L=[...WALKS.by.values()].filter(r=>r.k.startsWith('an:')); return {n:L.length,keys:new Set(L.map(r=>r.k)).size,kinds:new Set(L.map(r=>r.k.split(':')[1])).size,pos:L.filter(r=>r.v>.12).map(r=>[r.k,r.N.st.x,r.N.st.z]),folk:L.every(r=>r.N.st.folk===r)}; }); if(a.n>60)break; }
  ok(a.n>60&&a.keys===a.n&&a.kinds>20&&a.folk,'the animals join the walks, each under its own key ('+a.n+' animals, '+a.kinds+' kinds)');
  let m=0; for(let i=0;i<40&&!(m>a.pos.length*.5);i++){ await pg.waitForTimeout(5000);   // slow machines step slowly: wait till half have moved, up to 200 s
    m=await pg.evaluate(P=>{ let n=0; for(const [k,x,z] of P){ const r=WALKS.by.get(k); if(r&&Math.hypot(r.N.st.x-x,r.N.st.z-z)>.3)n++; } return n; },a.pos); }
  ok(m>a.pos.length*.5,'they walk where the walks say ('+m+' of the '+a.pos.length+' that walk at a pace moved; bugs creep)');
  ok(!errs.length,'no page errors '+errs.slice(0,2).join(' | '));
  await b.close(); process.exit(bad?1:0); })();
