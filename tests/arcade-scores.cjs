// THE ARCADE'S HIGH-SCORE CHECK: node tests/arcade-scores.cjs [dist/market.html]. Enters THE ARCADE, plays RAINBOW RUN, ends the run with a score that makes the top ten, enters the initials with the arrow keys (B, C, A) and SPACE, and finds the run in the cabinet's table at rank 1; leaves and comes back to find it still there; a second run ranks under it. Exits 1 if anything fails.
const {chromium}=require('playwright'), path=require('path');
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c){ bad++; if(process.env.GITHUB_ACTIONS)console.log('::error title=arcade-scores::'+String(m).replace(/\n/g,' ').slice(0,900)); } };
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:600}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ const t=m.text(); if(m.type()==='error'&&!/file:|CORS|ERR_FAILED/.test(t))errs.push(t.slice(0,300)); });
  await pg.goto('file://'+path.resolve(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13',{waitUntil:'commit',timeout:240000});
  await pg.waitForFunction(()=>window.__started,null,{timeout:300000}); await pg.waitForTimeout(3000);
  await pg.evaluate(()=>ROOMS.enter('arcade')); ok(await pg.waitForFunction(()=>window.ARCDBG&&ARCDBG().built&&!(window.FADE&&FADE.busy),null,{timeout:240000}).then(()=>true,()=>false),'THE ARCADE builds');
  const D=()=>pg.evaluate(()=>STORE.cabs.dbg()), U=(f,ms=30000)=>pg.waitForFunction(f,null,{timeout:ms}).then(()=>true,()=>false);
  const play=async()=>{ await pg.evaluate(()=>{ INV.cash=Math.max(INV.cash||0,20); STORE.cabs.play('RAINBOW RUN'); }); if(!await U(()=>STORE.cabs.on&&STORE.cabs.dbg().loaded,90000))return false; await pg.keyboard.press('Space'); return U(()=>STORE.cabs.dbg().mode==='play'); };
  ok(await play(),'RAINBOW RUN loads and a coin starts a run'); let d=await D(); ok(d.top.length===0,'no one is on the table yet ('+d.top.length+')');
  await pg.evaluate(()=>STORE.cabs.cheat.over(777,'ROUND 2')); ok(await U(()=>STORE.cabs.dbg().mode==='initials'),'a run that makes the top ten asks for your initials');
  for(const k of ['ArrowUp','Space','ArrowUp','ArrowUp','Space']){ await pg.keyboard.press(k); await pg.waitForTimeout(150); } d=await D(); ok(d.mode==='initials'&&d.ini==='BCA','the arrows pick the letters and SPACE moves on ('+d.ini+')');
  await pg.keyboard.press('Space'); ok(await U(()=>{ const d=STORE.cabs.dbg(); return d.mode==='over'&&d.rank===1; }),'SPACE on the last letter enters the run'); d=await D();
  ok(d.top.length===1&&d.top[0].ini==='BCA'&&d.top[0].score===777&&d.top[0].sub==='ROUND 2','the run is on the table at rank 1 ('+JSON.stringify(d.top[0])+')');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(500); ok(!(await pg.evaluate(()=>STORE.cabs.on)),'ESC leaves the cabinet');
  ok(await play(),'back at the cabinet'); d=await D(); ok(d.top.length===1&&d.top[0].ini==='BCA'&&d.ini==='BCA','the table and your initials are kept');
  await pg.evaluate(()=>STORE.cabs.cheat.over(500,'ROUND 1')); await U(()=>STORE.cabs.dbg().mode==='initials'); for(const k of ['Space','Space','Space'])await pg.keyboard.press(k); ok(await U(()=>{ const d=STORE.cabs.dbg(); return d.mode==='over'&&d.rank===2; }),'a lower run ranks second'); d=await D();
  ok(d.top.length===2&&d.top[1].score===500,'the table holds both, best first ('+d.top.map(e=>e.ini+' '+e.score).join(', ')+')');
  await pg.keyboard.press('Escape'); ok(!errs.length,'no page errors '+errs.slice(0,3).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'all ok'); process.exit(bad?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
