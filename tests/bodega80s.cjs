// THE BODEGA'S INSIDE CHECK: node tests/bodega80s.cjs [dist/market.html]. Inside, the shelves stand and hold only the cat's and the fish's food (owner, 5 Nov 2026), each on a labelled face. (The 1980s front and its windows went with the move to the Hudson corner, 8 Nov 2026; the old check is in archive/tests/bodega80s-old.cjs.)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:900,height:560}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2500);
  const idle=()=>pg.waitForFunction(()=>FADE.busy===0&&getComputedStyle(document.getElementById('subfade')).opacity==='0',null,{timeout:300000,polling:500}).catch(()=>{});
  await idle(); await pg.evaluate(()=>ROOMS.enter('bodega')); await pg.waitForFunction(()=>ROOMS.cur&&ROOMS.cur.off==='bodega'&&SHARED.BOD.goodsMesh,null,{timeout:180000}).catch(()=>{}); await idle(); await pg.waitForTimeout(1500);
  const G=await pg.evaluate(()=>{ const B=SHARED.BOD, m=B.goodsMesh; return {brands:B.brands||[],map:!!(m&&m.material.map),uv:!!(m&&m.geometry.attributes.uv),goods:B.goods?B.goods.length:0,kinds:[...new Set((B.goods||[]).map(g=>g.k))],keys:Object.keys(B.O).filter(k=>/^w|^win/.test(k))}; });
  ok(G.goods>=15&&G.kinds.length===2&&G.kinds.includes('catfood')&&G.kinds.includes('fishfood')&&['PURINA','9 LIVES','TETRA'].every(n=>G.brands.includes(n)),'the shelves hold only the cat\'s and the fish\'s food, each a named product ('+G.goods+' goods; '+G.kinds.join(', ')+'; '+G.brands.join(', ')+')');
  ok(G.map&&G.uv,'the goods carry their labels from the atlas');
  ok(G.keys.includes('wm1')&&G.keys.includes('win1')&&G.keys.includes('win2'),'a middle shelf and two window displays stand with the old shelves ('+G.keys.join(' ')+')');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0].slice(0,200):''));
  await b.close(); process.exit(bad?1:0); })();
