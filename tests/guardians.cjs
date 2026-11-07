// THE GUARDIANS: the keep's crew (data/guardians.json crew) built and standing, THE HERBALIST among them, a breakout fought, a bounty taken, counted and paid: node tests/guardians.cjs dist/market.html
const {chromium}=require('playwright'), page=process.argv[2]||'dist/market.html';
(async()=>{ const b=await chromium.launch({...(process.env.PWEXE?{executablePath:process.env.PWEXE}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:640}}); const errs=[];
  pg.on('pageerror',e=>{ errs.push(e.message); console.log('pageerror:',e.message); }); pg.on('console',m=>{ if(/guardian /.test(m.text()))errs.push(m.text()); });
  await pg.goto('file://'+require('path').resolve(page)+'?hour=12&fresh=1&place=the castle',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<180;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started&&!!window.GUARDDBG&&GUARDDBG().length>0).catch(()=>false))break; } await pg.waitForTimeout(5000);
  const L=await pg.evaluate(()=>GUARDDBG()); const n=L.length, tris=L.reduce((a,g)=>a+g.tris,0);
  console.log('guardians',n,'tris',Math.round(tris),'max',Math.max(...L.map(g=>g.tris)));
  const bad=L.filter(g=>!isFinite(g.x)||!isFinite(g.y)); if(n!==14||bad.length)errs.push('the crew is not all standing: '+n+' '+JSON.stringify(bad));
  if(!L.some(g=>g.k==='gd_toucan'))errs.push('THE HERBALIST is missing');
  await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD, S=__dbg.MAPK.CASTLE.stair; __dbg.UI.goTo(B.XS((S.x0+S.x1)/2)+1.5,B.ZS(S.y1+2),'up'); BREAK.wave(4); }); for(let i=0;i<24;i++){ await pg.waitForTimeout(5000); if(await pg.evaluate(()=>BREAK.list.some(c=>c.hp<c.K.hp||c.dead)||BREAK.list.length<4))break; }
  const BK=await pg.evaluate(()=>({left:BREAK.list.length,hurt:BREAK.list.filter(c=>c.hp<c.K.hp||c.dead).length,fighting:GUARD.list.filter(N=>N.inFight).length}));
  console.log('breakout',JSON.stringify(BK)); if(!BK.fighting||(BK.left===4&&!BK.hurt))errs.push('the guardians did not fight the breakout');
  const bt=await pg.evaluate(()=>{ TALK.ops.bounty('take slimes'); for(let i=0;i<6;i++)SYS.run('slain',{kind:'slime',lvl:1}); const done=TALK.tests.bounty('done'), c0=INV.cash; TALK.ops.bounty('pay'); return {done,paid:INV.cash-c0,left:GUARD.bounty()}; });
  console.log('bounty',JSON.stringify(bt)); if(!bt.done||bt.paid!==30||bt.left)errs.push('bounty failed');
  await b.close(); if(errs.length){ console.log('FAIL',errs.join(' | ')); process.exit(1); } console.log('ok'); })();
