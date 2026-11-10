// THE PLAYHOUSE, THE WOODEN O: goes in by its gate and checks the round is built (seats, solids, lanterns), the ground (the yard, the stage and its steps, the lower gallery, the stair, the middle gallery only from above), sitting on a gallery bench, the pay hatch, the sky over the yard, the front on Market St, and out again.
// Run: node tests/playhouse.cjs   (slow: software rendering; PW_EXE=/opt/pw-browsers/chromium where the local playwright has no browser)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_EXE||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(/playhouse build|SYS places 151/.test(m.text()))errs.push(m.text().slice(0,200)); });
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,0&hour=12'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(1500);
  const idle=()=>pg.waitForFunction(()=>!(window.FADE&&FADE.busy),null,{timeout:180000,polling:300}).catch(()=>{});
  ok(await pg.evaluate(()=>!!(ROOMS.off.playhouse&&ROOMS.off.playhouse.door)),'the playhouse is an inside off the map with a gate on its street');
  ok(await pg.evaluate(()=>!AWAY.has('playhouse')&&!(MSHOP.fronts||[]).some(f=>f.id==='play')),'it stands on Market St with its own front (no brick block of the row there)');
  await pg.evaluate(()=>ROOMS.enter('playhouse')); await idle(); await pg.waitForTimeout(2500);
  const d=await pg.evaluate(()=>{ const D=PHDBG(); return {built:D.built,inside:D.inside,seats:D.seats,solids:D.solids,lamps:D.lamps,tris:D.tris,things:D.things}; });
  ok(d.built&&d.inside,'built and you are inside'); ok(d.seats>=180,'its gallery seats ('+d.seats+')'); ok(d.solids>200,'its walls, posts and fronts are solid ('+d.solids+')'); ok(d.lamps>=4,'its lanterns ('+d.lamps+')');
  console.log('     triangles inside: '+d.tris);
  const g=await pg.evaluate(()=>{ const G=PHDBG().ground, run=PHDBG().run; return run(K=>{ const y0=K.you; K.you=()=>({y:0}); const lo={yard:G(0,3),stage:G(0,-4),step:G(5.8,-2.5),gal:G(-10.5,0),stairFoot:G(2,11),stairTop:G(6,11)}; K.you=()=>({y:3.8}); const hi={gal:G(-10.5,0),stairTop:G(6,11)}; K.you=y0; return {lo,hi}; }); });
  ok(g.lo.yard===0&&Math.abs(g.lo.stage-1.4)<.01,'the yard is on the ground, the stage 1.4 m up ('+g.lo.stage+')'); ok(g.lo.step>0&&g.lo.step<1.4,'steps climb to the stage at its side ('+g.lo.step+')');
  ok(Math.abs(g.lo.gal-.5)<.01&&Math.abs(g.hi.gal-3.8)<.01,'the lower gallery 0.5 m up, the middle one 3.8 m (each where you are)');
  ok(g.lo.stairFoot>.4&&g.lo.stairFoot<1&&Math.abs(g.hi.stairTop-3.8)<.01,'the stair climbs from the gate passage to the middle gallery ('+g.lo.stairFoot.toFixed(2)+' → '+g.hi.stairTop.toFixed(2)+')');
  const sat=await pg.evaluate(()=>{ const P=PHDBG(); P.look(0,-9.6,0,0); const K=P.run(K=>K); const th=K.things.find(t=>/GALLERY/.test(t.name)); th.act(); return !!__dbg.ST.sit; });
  ok(sat,'double-clicking a gallery bench sits you on it');
  ok(await pg.evaluate(()=>__dbg.UI.things.some(t=>/PAY HATCH/.test(t.name))),'the pay hatch sells a ticket');
  ok(await pg.evaluate(()=>!!(OUT.sky&&SKY.dome&&SKY.dome.visible)),'the sky is over the yard');
  await pg.evaluate(()=>ROOMS.exit('playhouse')); await idle(); await pg.waitForTimeout(800);
  ok(await pg.evaluate(()=>!ROOMS.offIn()),'out again to its street');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all playhouse checks passed'); await b.close(); process.exit(bad?1:0); })();
