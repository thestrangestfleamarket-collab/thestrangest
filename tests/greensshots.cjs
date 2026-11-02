// SCREENSHOTS OF THE GREENS, start to finish: node tests/greensshots.cjs <out dir> [page]. Main Street at the arcade, inside the arcade, the holodeck and its
// panel, RUN, the zen garden from the tee, the pond and waterfall, the lanterns and maples, a wide view, addressing the ball with the power bar, the ball
// rolling, the ball in the cup with the card, and the holodeck again after END PROGRAM.
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'shots', PAGE=path.resolve(process.argv[3]||path.resolve(__dirname,'../dist/market.html'));
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:1280,height:720}}); pg.setDefaultTimeout(900000); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,300)));
  await pg.goto('file://'+PAGE+'?fresh=1&hour=18',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__started))break; }
  await pg.waitForTimeout(8000); await pg.waitForFunction(()=>!FADE.busy,null,{timeout:120000}).catch(()=>{});
  let n=0; const shot=async name=>{ await pg.waitForTimeout(2500); const f=path.join(OUT,String(++n).padStart(2,'0')+'-'+name+'.png'); await pg.screenshot({path:f}); console.log('shot',f); };
  const settle=(ms=7000)=>pg.waitForTimeout(ms).then(()=>pg.waitForFunction(()=>!FADE.busy,null,{timeout:120000}).catch(()=>{}));
  const U=(f,ms=90000)=>pg.waitForFunction(f,null,{timeout:ms,polling:200});
  // 1 the arcade's front on Main Street
  await pg.evaluate(()=>{ const d=(STORE.main.doors||[]).find(q=>q[0]==='THE ARCADE'); if(d)__dbg.UI.goTo(d[1],d[2],'up'); }); await settle(9000); await shot('main-street-arcade');
  // 2 inside the arcade; 3 the holodeck; 4 its panel
  for(let k=0;k<4;k++){ await pg.evaluate(()=>{ if(!ARCDBG().built&&!FADE.busy)ROOMS.enter('arcade'); }); if(await U(()=>ARCDBG().built&&!FADE.busy,60000).then(()=>1,()=>0))break; } await settle(5000); await shot('arcade-inside');
  await pg.evaluate(()=>{ const t=__dbg.UI.things.find(t=>t.name==='THE HOLODECK'); if(t)t.act(); }); await settle(6000); await shot('holodeck');
  await pg.evaluate(()=>{ __dbg.UI.things.find(t=>t.name==='THE HOLODECK PANEL').act(); }); await pg.waitForTimeout(800); await shot('holodeck-panel');
  // 5 RUN: the garden from the tee, first person
  await pg.evaluate(()=>{ INV.cash=50; const hp=document.getElementById('holog'), i=STORE.holo.programs.findIndex(p=>p.name==='THE GREENS'); hp.querySelector('button[data-run="'+i+'"]').click(); });
  await U(()=>GREENSDBG().ready&&ROOMS.offIn&&ROOMS.offIn()==='greens'&&!FADE.busy); await pg.waitForTimeout(1500);
  const look=(x,z,yaw,pitch,view='first')=>pg.evaluate(([x,z,yaw,pitch,view])=>{ const M=33.9/30/.84; STORE.goTo(4200+x*M,z*M,'up',yaw); __dbg.UI.setView(view); SHARED.yawTo=SHARED.yaw=yaw; SHARED.pitchTo=SHARED.pitch=pitch; },[x,z,yaw,pitch,view]);
  await look(0,-4.6,Math.PI,-.08); await shot('garden-from-the-tee');
  await look(-1.2,-5.2,Math.PI,.0,'follow'); await shot('garden-from-behind');
  await look(-5.6,-.2,Math.PI,-.05); await shot('pond-and-waterfall');
  await look(3.2,-5.2,Math.PI-.55,-.05); await shot('lantern-and-maple');
  // 6 addressing the ball: the aim line, the bar while the button is held; 7 the ball rolling
  await pg.evaluate(()=>{ GREENS.warp(); __dbg.UI.setView('follow'); }); await pg.waitForTimeout(1500); await shot('address');
  const cv=await pg.$('canvas'); const bb=await cv.boundingBox(); await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height*.6); await pg.mouse.down(); await pg.waitForTimeout(700); await shot('drawing-back'); await pg.mouse.up(); await pg.waitForTimeout(500); await shot('rolling');
  await U(()=>GREENSDBG().rest,60000);
  // 8 in the cup
  await pg.evaluate(()=>{ const C=GREENS.cup; GREENS.place(C.x-C.tx*.5,C.z-C.tz*.5); GREENS.warp(); }); await pg.waitForTimeout(800); await pg.evaluate(()=>GREENS.putt(GREENS.toCup().ang,1.1)); await U(()=>GREENSDBG().inCup,20000); await pg.waitForTimeout(300); await shot('in-the-cup');
  // 9 END PROGRAM: back in the holodeck
  await pg.evaluate(()=>{ STORE.holo.menu(); }); await pg.waitForTimeout(600); await shot('end-program-menu');
  await pg.evaluate(()=>{ STORE.holo.end(); STORE.holo.hide(); }); await U(()=>!ARCDBG().holo.run&&ROOMS.offIn&&ROOMS.offIn()==='arcade'&&!FADE.busy,60000); await settle(4000); await shot('back-in-the-holodeck');
  fs.writeFileSync(path.join(OUT,'errors.txt'),errs.join('\n')||'none'); console.log('errors:',errs.length?errs.join('\n'):'none'); await b.close(); })().catch(e=>{ console.log('FAIL',e.message); process.exit(1); });
