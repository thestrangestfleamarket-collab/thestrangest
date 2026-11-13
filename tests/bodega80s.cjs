// THE 1980s BODEGA CHECK: node tests/bodega80s.cjs [dist/market.html]. On Market St the front wears what the photographs show (the GROCERY awning, the window posters and signs, the Miller neon, milk crates) and its windows show the real inside both ways; on the Hudson row (owner, 7 Nov 2026) that front is not built. Inside, the shelves hold only the cat's and the fish's food (owner, 5 Nov 2026), each a real named product on a labelled face.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:900,height:560}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2500);
  const F=await pg.evaluate(()=>{ const names=SHARED.BOD.FRONT.map(p=>p.name); const n=k=>names.filter(x=>x===k).length; return {awning:n('awning'),neon:n('neon sign'),poster:n('poster'),sign:n('shop sign'),crates:n('milk crates'),names:[...new Set(names)]}; });
  const HUD=await pg.evaluate(()=>!!SHARED.BOD.HUD);
  if(HUD)ok(F.names.length===0,'on the Hudson row the old Market St front is not built ('+JSON.stringify(F.names)+')');
  else ok(F.awning===1&&F.sign>=2&&F.poster>=3&&F.neon>=4&&F.crates===2,'the front: a GROCERY awning, the Lotto and Café Bustelo signs, the window posters, the Miller High Life and OPEN neons, milk crates by the door ('+JSON.stringify(F)+')');
  if(!HUD){ const W=await pg.evaluate(()=>new Promise(res=>{ const t0=performance.now(); const tick=()=>{ const L=WINDOWS.panes.filter(p=>p.off==='bodega'&&p.look==='in'); if(L.length&&L.every(p=>p.rt||p.kept)){ const p=L[0]; let lit=0, cols=new Set(); if(p.rt){ const w=p.rt.width, h=p.rt.height, b=new Uint8Array(w*h*4); __dbg.renderer.readRenderTargetPixels(p.rt,0,0,w,h,b); for(let i=0;i<b.length;i+=64){ lit+=b[i]+b[i+1]+b[i+2]; cols.add((b[i]>>5)+'.'+(b[i+1]>>5)+'.'+(b[i+2]>>5)); } lit/=b.length/64*3; } const out={n:L.length,lit:Math.round(lit),cols:cols.size,kept:!!p.kept,ms:Math.round(performance.now()-t0)}, t1=performance.now(), st=()=>{ const s=Object.keys(localStorage).some(k=>k.startsWith('winpic:bodega')); if(s||performance.now()-t1>60000)res({...out,stored:s}); else setTimeout(st,500); }; st(); } else if(performance.now()-t0>120000)res({n:L.length,timeout:true}); else setTimeout(tick,500); }; tick(); }));
  ok(W.n===2&&!W.timeout&&(W.kept||(W.lit>18&&W.cols>6))&&W.stored,'the front windows show the real inside without a visit, and keep the picture ('+JSON.stringify(W)+')'); }
  const idle=()=>pg.waitForFunction(()=>FADE.busy===0&&getComputedStyle(document.getElementById('subfade')).opacity==='0',null,{timeout:300000,polling:500}).catch(()=>{});
  await idle(); await pg.evaluate(()=>ROOMS.enter('bodega')); await pg.waitForFunction(()=>ROOMS.cur&&ROOMS.cur.off==='bodega'&&SHARED.BOD.goodsMesh,null,{timeout:180000}).catch(()=>{}); await idle(); await pg.waitForTimeout(1500);
  const G=await pg.evaluate(()=>{ const B=SHARED.BOD, m=B.goodsMesh; return {brands:B.brands||[],map:!!(m&&m.material.map),uv:!!(m&&m.geometry.attributes.uv),goods:B.goods?B.goods.length:0,kinds:[...new Set((B.goods||[]).map(g=>g.k))],keys:Object.keys(B.O).filter(k=>/^w|^win/.test(k))}; });
  const must=['PURINA','9 LIVES','TETRA'];
  ok(must.every(n=>G.brands.includes(n)),'the pet food is real named products ('+G.brands.join(', ')+'; missing: '+must.filter(n=>!G.brands.includes(n)).join(', ')+')');
  ok(G.map&&G.uv,'the goods carry their labels from the atlas');
  ok(G.kinds.length===2&&G.kinds.includes('catfood')&&G.kinds.includes('fishfood'),'only the cat\'s and the fish\'s food are on the shelves ('+G.kinds.join(', ')+')');
  ok(G.keys.includes('wm1')&&G.keys.includes('win1')&&G.keys.includes('win2'),'a middle shelf and two window displays stand with the old shelves ('+G.keys.join(' ')+')');
  const LV=await pg.evaluate(()=>({rt:WINDOWS.live.rt.size,live:WINDOWS.panes.filter(p=>p.off==='bodega'&&p.look==='out'&&p.live).length,eyes:WINDOWS.eyes.length}));
  if(!HUD)ok(LV.rt>=1&&LV.live>=1&&LV.eyes>=1,'from inside, the front glass shows the real street live in 3D ('+JSON.stringify(LV)+')');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0].slice(0,200):''));
  await b.close(); process.exit(bad?1:0); })();
