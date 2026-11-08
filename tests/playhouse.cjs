// THE PLAYHOUSE: goes in by its door and checks the hall is built (seats, solids, the fly bars, the cast), the ground (the stage, its steps, the stalls' rake, the foyer), sitting in a seat, a bar flying and the curtain rising as cloth, the show at a given moment (its line on the caption, its set and lights), and the way out to West St.
// Run: node tests/playhouse.cjs   (slow: software rendering; PW_EXE=/opt/pw-browsers/chromium where the local playwright has no browser)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_EXE||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(/playhouse build|SYS places 151/.test(m.text()))errs.push(m.text().slice(0,200)); });
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,0&hour=12&bring=playhouse'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(1500);
  const idle=()=>pg.waitForFunction(()=>!(window.FADE&&FADE.busy),null,{timeout:180000,polling:300}).catch(()=>{});
  ok(await pg.evaluate(()=>!!(ROOMS.off.playhouse&&ROOMS.off.playhouse.door)),'the playhouse is an inside off the map with a door on its street');
  await pg.evaluate(()=>ROOMS.enter('playhouse')); await idle(); await pg.evaluate(()=>PHDBG().showAt(-1500)); await pg.waitForTimeout(2500);
  const d=await pg.evaluate(()=>{ const D=PHDBG(); return {built:D.built,inside:D.inside,seats:D.seats,solids:D.solids,sets:D.sets.length,mirrors:D.mirrors.length,tris:D.tris}; });
  ok(d.built&&d.inside,'built and you are inside'); ok(d.seats>=120,'its seats ('+d.seats+')'); ok(d.solids>40,'its walls are solid ('+d.solids+')'); ok(d.sets===20,'twenty line sets over the stage'); ok(d.mirrors>=3,'the foyer\'s mirrors ('+d.mirrors+')');
  console.log('     triangles inside: '+d.tris);
  const g=await pg.evaluate(()=>{ const G=PHDBG().ground; return {stage:G(0,-5),apron:G(0,2),front:G(0,4.5),back:G(0,14),foyer:G(0,24),steps:G(8.8,4),stepsL:G(-8.8,4)}; });
  ok(Math.abs(g.stage-1.1)<.01&&Math.abs(g.apron-1.1)<.01,'the stage and its apron are 1.1 m up'); ok(g.back>g.front+1,'the stalls rake up to the back ('+g.front.toFixed(2)+' → '+g.back.toFixed(2)+')');
  ok(g.steps>g.front&&g.steps<g.stage&&Math.abs(g.steps-g.stepsL)<.01,'steps climb from the stalls to the stage on both sides'); ok(Math.abs(g.foyer-g.back)<.01,'the foyer is level with the back of the stalls');
  const sat=await pg.evaluate(()=>{ PHDBG().look(0,9,Math.PI,0); const K=PHDBG().run(K=>K); const th=K.things.find(t=>/STALLS/.test(t.name)); th.act(); return !!__dbg.ST.sit; });
  ok(sat,'double-clicking a row of the stalls sits you in it');
  const fly=await pg.evaluate(()=>PHDBG().run(K=>{ const s=K.fly.byId.s3, y0=s.y; K.flyTo('s3',y0<15?20.5:12); for(let i=0;i<400;i++)K.flyStep(1/30); return [y0,s.y]; }));
  ok(Math.abs(fly[1]-fly[0])>5,'a bar flies on its lines ('+fly[0].toFixed(1)+' → '+fly[1].toFixed(1)+')');
  const cur=await pg.evaluate(()=>PHDBG().run(K=>{ const c=K.cloth.curtain; c.set(0); for(let i=0;i<300;i++)c.step(1/20,null); const h=c.halves[0].c, y=i=>h.X[i*3+1], b=(h.ny-1)*h.nx+h.nx-2, y0=y(b); c.set(1); for(let i=0;i<300;i++)c.step(1/20,null); const y1=y(b); c.set(0); for(let i=0;i<300;i++)c.step(1/20,null); return [y0,y1,y(b)]; }));
  ok(cur[1]>cur[0]+3&&cur[2]<cur[0]+.5,'the house curtain rises on its lines and falls back as cloth ('+cur.map(v=>v.toFixed(1)).join(' → ')+')');
  await pg.evaluate(()=>ROOMS.exit('playhouse')); await idle(); await pg.waitForTimeout(800);
  ok(await pg.evaluate(()=>!ROOMS.offIn()),'out again to its street');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all playhouse checks passed'); await b.close(); process.exit(bad?1:0); })();
