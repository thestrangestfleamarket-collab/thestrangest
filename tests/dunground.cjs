// The dungeon's uneven ground (8 Nov 2026): rooms have ledges and pits; a ledge stops you from below, its ramp takes you up, walking off it drops you; torches on every wall; the city's leftovers by room.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
  const pg=await b.newPage({viewport:{width:1280,height:720}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=11&place=THE%20DUNGEON',{timeout:300000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.waitForFunction(()=>SHARED.LVL==='down'&&window.DUNROOMS&&DUNROOMS()[1].torches>0,null,{timeout:300000,polling:1000}); await pg.waitForTimeout(3000);
  const W=ms=>pg.waitForTimeout(ms), R=await pg.evaluate(()=>DUNROOMS());
  ok(R.filter(r=>r.feats.length).length>=R.length*.6,'most rooms have ledges or pits ('+R.filter(r=>r.feats.length).length+' of '+R.length+')');
  ok(new Set(R.map(r=>r.theme)).size===4,'all four leftovers of the city: '+[...new Set(R.map(r=>r.theme))].join(', '));
  ok(R.every(r=>r.torches>=5),'every room has at least five torches: '+R.map(r=>r.torches).join(' '));
  const L=R.flatMap(r=>r.feats.map(f=>({...f,room:r.nm}))).find(f=>f.h>0&&Math.min(f.rx,f.ry)>1.6);
  const at=(f,a,d)=>pg.evaluate(([f,a,d])=>DUNAT(f.cx+Math.cos(a)*f.rx*d,f.cy+Math.sin(a)*f.ry*d),[f,a,d]);
  const walkTo=async(x,z,ms)=>{ await pg.evaluate(([x,z])=>{ SHARED.target=__dbg.THREE?new __dbg.THREE.Vector3(x,SHARED.py,z):null; __UI.go&&__UI.go(Math.hypot(x-__dbg.pos()[0],z-__dbg.pos()[2])); },[x,z]); await W(ms); await pg.evaluate(()=>{ SHARED.target=null; }); };
  const place=async(x,z)=>{ await pg.evaluate(([x,z])=>__UI.goTo(x,z,'down'),[x,z]); await W(2500); };
  const hNow=()=>pg.evaluate(()=>DUNG(__dbg.pos()[0],__dbg.pos()[2]));
  if(L){ const back=L.ramp+Math.PI, c=await at(L,0,0);
    await place(...await at(L,back,1.7)); const h0=await hNow(); await walkTo(...c,2500); const h1=await hNow();
    ok(h0<12&&h1<L.h*.5,`${L.room}: from below on its steep side the ledge stops you (height ${h0.toFixed(0)} -> ${h1.toFixed(0)}, the ledge ${L.h})`);
    await place(...await at(L,L.ramp,2.3)); await walkTo(...c,14000); const h2=await hNow();
    ok(h2>L.h*.7,`${L.room}: its ramp takes you up (height ${h2.toFixed(0)} of ${L.h})`);
    await pg.screenshot({path:process.argv[2]||'/tmp/dun-ledge.png'});
    const hp0=await pg.evaluate(()=>__dbg.VIT.hp); const tgt=await at(L,back,1.5); await walkTo(...tgt,12000); const h3=await hNow(); console.log('off',tgt,await pg.evaluate(()=>__dbg.pos()));
    ok(h3<h2-12,`walking off its edge drops you (height ${h3.toFixed(0)}; health ${hp0.toFixed(2)} -> ${(await pg.evaluate(()=>__dbg.VIT.hp)).toFixed(2)})`); }
  else ok(false,'a ledge to test');
  const PT=R.flatMap(r=>r.feats.map(f=>({...f,room:r.nm}))).find(f=>f.h<-40&&Math.min(f.rx,f.ry)>1.5);
  if(PT){ const back=PT.ramp+Math.PI, c=await at(PT,0,0); await place(...await at(PT,back,1.8)); const hp0=await pg.evaluate(()=>__dbg.VIT.hp), g0=await hNow(); await walkTo(...c,6000); const g1=await hNow(), hp1=await pg.evaluate(()=>__dbg.VIT.hp);
    ok(g1<g0-25,`${PT.room}: over the edge into a pit (${g0.toFixed(0)} -> ${g1.toFixed(0)})`); ok(hp1<hp0,`a drop that deep hurts (${hp0.toFixed(2)} -> ${hp1.toFixed(2)})`);
    await pg.screenshot({path:process.argv[3]||'/tmp/dun-pit.png'});
    await walkTo(...await at(PT,PT.ramp,2.4),16000); ok(await hNow()>g1+20,'the rubble slope takes you out'); await walkTo(...c,5000); }
  ok(!Object.keys(errs).length,'no page errors '+Object.keys(errs).join(' | ')); await b.close(); process.exit(bad?1:0); })();
