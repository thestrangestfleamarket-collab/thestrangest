// THE ANIMALS' RESTS CHECK: node tests/fauna-rest.cjs [dist/market.html]. A park animal rests on a clip of its own (Mesh2Motion's, retold on its rig):
// at night the farm's cows, pigs and horses lie asleep on their own Sleep clip.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:800,height:500}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=2&at=20,111.8',{waitUntil:'commit',timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:400000,polling:2000});
  await pg.waitForFunction(()=>window.CREATS&&CREATS.filter(N=>N.life).length>=6,null,{timeout:200000,polling:2000}).catch(()=>{});
  const r=await pg.evaluate(async()=>{ const wait=ms=>new Promise(r=>setTimeout(r,ms)), out={};
    for(const K of ['Cow','Pig','Horse']){ let w=0, n=0, asleep=0;
      for(let i=0;i<150&&w<.5;i++){ const L=CREATS.filter(N=>N.life&&N.kind===K); n=L.length;
        for(const N of L){ if(N.life.act!=='sleep')continue; asleep++; const a=N.mixer._actions.find(a=>a.getClip().name===K+'_Sleep'); w=Math.max(w,a?a.getEffectiveWeight():0); }
        if(w<.5)await wait(200); }
      out[K]={n,sleep:+w.toFixed(2)}; }
    return out; });
  for(const K of ['Cow','Pig','Horse'])ok(r[K]&&r[K].sleep>=.5,'the '+K.toLowerCase()+', asleep at night, lies on its own Sleep clip: '+JSON.stringify(r[K]));
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0].slice(0,200):''));
  await b.close(); process.exit(bad?1:0); })();
