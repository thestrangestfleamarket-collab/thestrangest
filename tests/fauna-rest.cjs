// THE ANIMALS' RESTS CHECK: node tests/fauna-rest.cjs [dist/market.html]. A park animal that stops now and then rests on a clip of its own (Mesh2Motion's,
// retold on its rig): the dog sits.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:800,height:500}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000});
  const r=await pg.evaluate(async()=>{ const wait=ms=>new Promise(r=>setTimeout(r,ms)), D=__dbg; let N=null;
    for(let i=0;i<600&&!N;i++){ N=D.npcs().find(q=>q.key==='dog'); if(!N)await wait(200); } if(!N)return {err:'no dog'};
    D.UI.goTo(N.st.x+1.2*D.cv().TILE,N.st.z,'up'); await wait(2500);
    const A=n=>N.mixer._actions.find(a=>a.getClip().name===n), R0=Math.random; Math.random=()=>.01;
    N.st.to={x:N.st.x+.5*D.cv().TILE,z:N.st.z}; for(let i=0;i<20;i++)await wait(100); N.st.to=null;
    let w=0; for(let i=0;i<200&&w<.5;i++){ await wait(100); const a=A('Dog_Sit'); w=a?a.getEffectiveWeight():0; } Math.random=R0;
    return {sit:+w.toFixed(2),clip:!!A('Dog_Sit')}; });
  ok(r.sit>.5,'the dog, stopped, sits on its own Sit clip: '+JSON.stringify(r));
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0].slice(0,200):''));
  await b.close(); process.exit(bad?1:0); })();
