// THE GUARDIANS: the keep's crew (data/guardians.json crew) built and standing, THE HERBALIST among them, a breakout from the dungeon's design (the shared sim's keep) fought, a bounty taken, counted and paid: node tests/guardians.cjs dist/market.html
const {chromium}=require('playwright'), page=process.argv[2]||'dist/market.html';
(async()=>{ const b=await chromium.launch({...(process.env.PWEXE?{executablePath:process.env.PWEXE}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:640}}); const errs=[];
  pg.on('pageerror',e=>{ errs.push(e.message); console.log('pageerror:',e.message); }); pg.on('console',m=>{ if(/guardian /.test(m.text()))errs.push(m.text()); });
  await pg.goto('file://'+require('path').resolve(page)+'?hour=12&fresh=1&place=the dungeon stair',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<180;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started&&!!window.GUARDDBG&&GUARDDBG().length>0).catch(()=>false))break; } await pg.waitForTimeout(5000);
  const L=await pg.evaluate(()=>GUARDDBG()); const n=L.length, tris=L.reduce((a,g)=>a+g.tris,0);
  console.log('guardians',n,'tris',Math.round(tris),'max',Math.max(...L.map(g=>g.tris)));
  const bad=L.filter(g=>!isFinite(g.x)||!isFinite(g.y)); if(n!==14||bad.length)errs.push('the crew is not all standing: '+n+' '+JSON.stringify(bad));
  if(!L.some(g=>g.k==='gd_toucan'))errs.push('THE HERBALIST is missing');
  const W=await pg.evaluate(async()=>{ const B=__dbg.MAPK.BOD, S=__dbg.MAPK.CASTLE.stair; __dbg.UI.goTo(B.XS((S.x0+S.x1)/2)+1.5,B.ZS(S.y1+2),'up'); await LOAD('dungeon');
    for(let i=0;i<120&&!(window.DUNMOBS&&DUNMOBS.MS.g);i++)await new Promise(r=>setTimeout(r,1000)); const L=DUNMOBS.MS.g.rooms[3].lane;   // the dungeon's design: what can come up
    await DUNMOBS.tryIt({mobs:[{id:'b',r:3,kind:'s',key:'red',x:(L[0]+L[2])/2,z:(L[1]+L[3])/2,n:3,hp:40,dmg:.05},{id:'w',r:3,kind:'c',key:'fa:Wolf',x:(L[0]+L[2])/2,z:(L[1]+L[3])/2,n:2,hp:40,dmg:.05}]});
    BREAK.wave(4); await new Promise(r=>setTimeout(r,500)); return DUNMOBS.MS.m.filter(m=>m.r===64).map(m=>m.key); });
  console.log('came up',JSON.stringify(W)); if(W.length!==4)errs.push('the breakout did not bring up four of the dungeon\'s creatures'); let seen={f:0,h:0}; for(let i=0;i<90&&!(seen.f&&seen.h);i++){ await pg.waitForTimeout(2000); const q=await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD, S=__dbg.MAPK.CASTLE.stair, P=__dbg.pos(), x=B.XS((S.x0+S.x1)/2)+1.5, z=B.ZS(S.y1+2); if(Math.hypot(P[0]-x,P[2]-z)>3)__dbg.UI.goTo(x,z,'up'); return {f:GUARD.list.filter(N=>N.inFight).length,h:DUNMOBS.MS.m.filter(m=>m.r===64&&(m.dead||m.hp<m.mhp)).length,p:[P[0],P[2],x,z,SHARED.LVL]}; }); if(i%10===0)console.log('watch',JSON.stringify(q)); seen.f=Math.max(seen.f,q.f); seen.h=Math.max(seen.h,q.h); }   // slow machines: watched as it goes
  const BK={left:await pg.evaluate(()=>BREAK.list.length),hurt:seen.h,fighting:seen.f};
  console.log('breakout',JSON.stringify(BK)); if(!BK.fighting||!BK.hurt)errs.push('the guardians did not fight the breakout');
  const bt=await pg.evaluate(()=>{ TALK.ops.bounty('take slimes'); for(let i=0;i<6;i++)SYS.run('slain',{kind:'slime',lvl:1}); const done=TALK.tests.bounty('done'), c0=INV.cash; TALK.ops.bounty('pay'); return {done,paid:INV.cash-c0,left:GUARD.bounty()}; });
  console.log('bounty',JSON.stringify(bt)); if(!bt.done||bt.paid!==30||bt.left)errs.push('bounty failed');
  await b.close(); if(errs.length){ console.log('FAIL',errs.join(' | ')); process.exit(1); } console.log('ok'); })();
