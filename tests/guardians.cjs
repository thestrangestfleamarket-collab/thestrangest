// THE GUARDIANS: at the castle, all of them built and standing, a bounty taken, counted and paid, and a picture: node tests/guardians.cjs dist/market.html [outdir]
const {chromium}=require('playwright'), page=process.argv[2]||'dist/market.html', out=process.argv[3]||'.';
(async()=>{ const b=await chromium.launch({...(process.env.PWEXE?{executablePath:process.env.PWEXE}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:640}}); const errs=[];
  pg.on('pageerror',e=>{ errs.push(e.message); console.log('pageerror:',e.message); }); pg.on('console',m=>{ if(/guardian|site /.test(m.text()))errs.push(m.text()); });
  await pg.goto('file://'+require('path').resolve(page)+'?hour=12&fresh=1&place=the castle',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<180;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started&&!!window.GUARDDBG&&GUARDDBG().length>0).catch(()=>false))break; } await pg.waitForTimeout(5000);
  const L=await pg.evaluate(()=>GUARDDBG()); const n=L.length, tris=L.reduce((a,g)=>a+g.tris,0);
  console.log('guardians',n,'tris',Math.round(tris),'max',Math.max(...L.map(g=>g.tris)));
  const bad=L.filter(g=>!isFinite(g.x)||!isFinite(g.y)); if(n<58||bad.length)errs.push('guardians missing or misplaced: '+n+' '+JSON.stringify(bad));
  const S=await pg.evaluate(()=>SITESDBG()); console.log('sites',JSON.stringify(S.map(q=>[q.id,Math.round(q.tris)])));
  for(const id of ['pub','ruins','bridge','hut1','hut2','hut3','yard'])if(!S.find(q=>q.id===id))errs.push('site missing: '+id);
  const IN=await pg.evaluate(async()=>{ const r={}; for(const id of ['pub']){ await ROOMS.goIn(id); await new Promise(f=>setTimeout(f,1500)); r[id]={lvl:__dbg.lvl(),at:__dbg.pos().map(v=>+v.toFixed(1)),things:__dbg.UI.things.filter(t=>/CHEST|OUT/.test(t.name||'')).length}; ROOMS.goOut(id); await new Promise(f=>setTimeout(f,800)); } return r; });
  console.log('insides',JSON.stringify(IN)); if(!IN.pub)errs.push('insides failed');
  await pg.evaluate(()=>{ __dbg.CLOCK.h=12; }); await pg.waitForTimeout(9000); const AR=await pg.evaluate(()=>GUARD.list.filter(N=>N.gd.role==='drill').map(N=>[N.key,!!N.A.mv,N.A.mv&&N.A.mv.k]));
  console.log('drill',JSON.stringify(AR));
  await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD, S=__dbg.MAPK.CASTLE.stair; __dbg.UI.goTo(B.XS((S.x0+S.x1)/2)+1.5,B.ZS(S.y1+2),'up'); BREAK.wave(4); }); for(let i=0;i<24;i++){ await pg.waitForTimeout(5000); if(await pg.evaluate(()=>BREAK.list.some(c=>c.hp<c.K.hp||c.dead)||BREAK.list.length<4))break; } const BK=await pg.evaluate(()=>({left:BREAK.list.length,hurt:BREAK.list.filter(c=>c.hp<c.K.hp||c.dead).length,fighting:GUARD.list.filter(N=>N.inFight).length,moat:SITES.moat&&SITES.moat.rects.length}));
  console.log('breakout',JSON.stringify(BK)); if(!BK.fighting||(BK.left===4&&!BK.hurt))errs.push('the guardians did not fight the breakout'); if(BK.moat!==5)errs.push('moat');
  const PB=await pg.evaluate(async()=>{ DN.S.night.h=21; DN.set('night'); await ROOMS.goIn('pub'); for(let i=0;i<10&&!GUARD.list.some(N=>N.mode==='pub');i++)await new Promise(f=>setTimeout(f,3000)); const n=GUARD.list.filter(N=>N.mode==='pub').length; ROOMS.goOut('pub'); DN.set('day'); await new Promise(f=>setTimeout(f,3000)); return {n,after:GUARD.list.filter(N=>N.mode==='pub').length}; });
  console.log('pub evening',JSON.stringify(PB)); if(!PB.n)errs.push('nobody at the pub in the evening');
  const bt=await pg.evaluate(()=>{ TALK.ops.bounty('take slimes'); for(let i=0;i<6;i++)SYS.run('slain',{kind:'slime',lvl:1}); const done=TALK.tests.bounty('done'), c0=INV.cash; TALK.ops.bounty('pay'); return {done,paid:INV.cash-c0,left:GUARD.bounty()}; });
  console.log('bounty',JSON.stringify(bt)); if(!bt.done||bt.paid!==30||bt.left)errs.push('bounty failed');
  for(const [k,who,yaw] of [['gate','gd_pangolin',Math.PI],['bailey','gd_panda',Math.PI],['fire','gd_lynx',Math.PI*.75]]){ await pg.evaluate(([who,yaw])=>{ const g=GUARD.list.find(N=>N.key===who); __dbg.UI.goTo(g.st.x+.6,g.st.z-1.4,'up'); __dbg.cam(yaw,.35,__dbg.cv().ppu*1.8); },[who,yaw]); await pg.waitForTimeout(7000); await pg.screenshot({path:`${out}/guardians-${k}.png`,timeout:120000}).catch(e=>console.log('picture skipped',k)); }
  await b.close(); if(errs.length){ console.log('FAIL',errs.join(' | ')); process.exit(1); } console.log('ok'); })();
