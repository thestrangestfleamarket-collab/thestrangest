// THE GUARDIANS: at the castle, all of them built and standing, a bounty taken, counted and paid, and a picture: node tests/guardians.cjs dist/market.html [outdir]
const {chromium}=require('playwright'), page=process.argv[2]||'dist/market.html', out=process.argv[3]||'.';
(async()=>{ const b=await chromium.launch({...(process.env.PWEXE?{executablePath:process.env.PWEXE}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:640}}); const errs=[];
  pg.on('pageerror',e=>{ errs.push(e.message); console.log('pageerror:',e.message); }); pg.on('console',m=>{ if(/guardian/.test(m.text()))errs.push(m.text()); });
  await pg.goto('file://'+require('path').resolve(page)+'?hour=12&fresh=1&place=the castle',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<180;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started&&!!window.GUARDDBG&&GUARDDBG().length>0).catch(()=>false))break; } await pg.waitForTimeout(5000);
  const L=await pg.evaluate(()=>GUARDDBG()); const n=L.length, tris=L.reduce((a,g)=>a+g.tris,0);
  console.log('guardians',n,'tris',Math.round(tris),'max',Math.max(...L.map(g=>g.tris)));
  const bad=L.filter(g=>!isFinite(g.x)||!isFinite(g.y)); if(n<35||bad.length)errs.push('guardians missing or misplaced: '+n+' '+JSON.stringify(bad));
  const bt=await pg.evaluate(()=>{ TALK.ops.bounty('take slimes'); for(let i=0;i<6;i++)SYS.run('slain',{kind:'slime',lvl:1}); const done=TALK.tests.bounty('done'), c0=INV.cash; TALK.ops.bounty('pay'); return {done,paid:INV.cash-c0,left:GUARD.bounty()}; });
  console.log('bounty',JSON.stringify(bt)); if(!bt.done||bt.paid!==30||bt.left)errs.push('bounty failed');
  for(const [k,who,yaw] of [['gate','gd_pangolin',Math.PI],['bailey','gd_panda',Math.PI],['fire','gd_lynx',Math.PI*.75]]){ await pg.evaluate(([who,yaw])=>{ const g=GUARD.list.find(N=>N.key===who); __dbg.UI.goTo(g.st.x+.6,g.st.z-1.4,'up'); __dbg.cam(yaw,.35,__dbg.cv().ppu*1.8); },[who,yaw]); await pg.waitForTimeout(7000); await pg.screenshot({path:`${out}/guardians-${k}.png`}); }
  await b.close(); if(errs.length){ console.log('FAIL',errs.join(' | ')); process.exit(1); } console.log('ok'); })();
