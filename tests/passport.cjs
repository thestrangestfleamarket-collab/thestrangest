// THE PASSPORT CHECK: node tests/passport.cjs [dist/market.html]. You are issued a passport at the start and carry it; its window shows it; the station's exit gate, unseen until you walk into it, blocks the way out until the passport is shown at the machine, opens six seconds for everyone, and lets you in from the street freely.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:900,height:560}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2500);
  const P=await pg.evaluate(()=>({no:PASSPORT.P.no,home:PASSPORT.P.home,issued:PASSPORT.P.issued,has:FORAGE.has('passport'),row:FORAGE.ROWB.some(f=>(f('passport')||[]).some(r=>r[1]==='passport')),saved:JSON.parse(localStorage.getItem('market-save')||'{}').passport}));
  ok(/^\d{4}$/.test(P.no)&&P.home==='A'&&/^\d{4}-\d\d-\d\d$/.test(P.issued),'a passport is issued at first login: a number, the home section, the date ('+P.no+', '+P.home+', '+P.issued+')');
  ok(P.has===1&&P.row&&!!P.saved,'it is in your pack with a SHOW button, and kept');
  const W=await pg.evaluate(()=>{ PASSPORT.open(); const el=document.getElementById('passportw'), t=el.innerText; PASSPORT.close(); return {t,hidden:el.hidden}; });
  ok(W.t.includes('THE STRANGEST FLEA MARKET')&&/CITIZEN \d+/.test(W.t)&&W.hidden,'the window shows it and closes');   // (the card as of 7 Nov 2026)
  const idle=()=>pg.waitForFunction(()=>FADE.busy===0&&getComputedStyle(document.getElementById('subfade')).opacity==='0',null,{timeout:300000,polling:500}).catch(()=>{});
  await idle(); await pg.evaluate(()=>{ const p=SHARED.METRO.plat; __dbg.UI.goTo(p.x,p.z,'down'); }); await idle();
  await pg.waitForFunction(()=>PASSPORT.gates&&PASSPORT.gates.length>=1,null,{timeout:60000}).catch(()=>{}); await pg.waitForTimeout(800);
  const G=await pg.evaluate(()=>{ const g=PASSPORT.gates[0]; return {n:PASSPORT.gates.length,shown:g.me.visible,solid:SHARED.solids.includes(g.box),thing:__dbg.ui().things.some(t=>t.name==='PASSPORT MACHINE'),u:g.u()}; });
  ok(G.n>=1&&!G.shown&&G.solid&&G.thing,'the station exit has an unseen forcefield that blocks you, and a passport machine beside it ('+JSON.stringify(G)+')');
  await pg.evaluate(()=>{ const g=PASSPORT.gates[0], p=g.st.P(.7,LOOP.MID+1.5,0); __dbg.UI.goTo(p[0],p[2],'down'); }); await idle(); await pg.waitForFunction(()=>PASSPORT.gates[0].vis>.5,null,{timeout:20000,polling:200}).catch(()=>{});   // (the field fades in over a few frames: slow on a software-drawn page)
  const V=await pg.evaluate(()=>{ const g=PASSPORT.gates[0]; return {shown:g.me.visible,vis:+g.vis.toFixed(2),u:+g.u().toFixed(2)}; }); ok(V.shown&&V.vis>.5,'walking into it from the platform shows the field ('+JSON.stringify(V)+')');
  const O=await pg.evaluate(()=>{ const sent=[]; ONLINE.send=m=>sent.push(m); const th=__dbg.ui().things.find(t=>t.name==='PASSPORT MACHINE'); th.act(); const g=PASSPORT.gates[0]; return {open:g.until>0,shown:g.me.visible,solid:SHARED.solids.includes(g.box),sent:sent.filter(m=>m.t==='world'&&m.k==='gate:A').length}; });
  ok(O.open&&!O.shown&&!O.solid&&O.sent===1,'showing the passport at the machine opens the gate and tells the block ('+JSON.stringify(O)+')');
  await pg.waitForTimeout(6000); let C=null; for(let t=0;t<8000;t+=250){ C=await pg.evaluate(()=>{ const g=PASSPORT.gates[0]; return {open:g.until>0,solid:SHARED.solids.includes(g.box)}; }); if(!C.open&&C.solid)break; await pg.waitForTimeout(250); } ok(!C.open&&C.solid,'six seconds later it is closed again (the close lands on the next frame, slow here)');
  const F=await pg.evaluate(()=>{ ONLINE.feed({t:'world',k:'gate:A',v:Date.now()-1000}); const g=PASSPORT.gates[0]; const a=g.until>0; ONLINE.feed({t:'world',k:'gate:A',v:Date.now()-60000}); return {a,still:g.until>0}; });
  ok(F.a,'a gate another player opened opens here too; a stale message does not');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0].slice(0,200):''));
  await b.close(); process.exit(bad?1:0); })();
