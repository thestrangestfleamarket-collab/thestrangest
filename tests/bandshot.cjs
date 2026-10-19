// THE BAR'S STAGE, ONE AT A TIME (bandstand.js): sets of a few seconds (?set=), the stage from the floor at each turn, who's drawn and how loud
// each one is (a click first: the sound starts with it); the page's errors. node tests/bandshot.cjs out [setSeconds]
const {chromium}=(()=>{ try{ return require('playwright'); }catch(e){ return require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright'); } })();
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']}); const pg=await b.newPage({viewport:{width:1000,height:700}}); pg.setDefaultTimeout(240000);
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message.slice(0,300),(e.stack||'').split('\n').slice(1,3).join(' / ').slice(0,300)); });
  const out=process.argv[2]||'band', set=+(process.argv[3]||24);
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hideme=1&npcwait=99&hour=21&place=the%20bar&set='+set,{waitUntil:'commit',timeout:240000}); for(let i=0;i<120&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000); await pg.waitForTimeout(8000);
  await pg.keyboard.press('Shift');   // (the sound wakes with a key)
  await pg.evaluate(()=>{ STORE.ensure(); const S=STORE.bar, P=STORE.PNM.at, D=STORE.DRM.at; STORE.pos.set(P.x+.6,0,P.z+3.2); STORE.STAGE.go(0); window.__dbg.UI.setFree(true); window.__dbg.UI.camT.set((P.x+D.x)/2,(P.y||0)+.9,(P.z+D.z)/2); window.__dbg.cam(0,.45,window.__dbg.cv().PPU*2.2); });
  let last=null, n=0; const t0=Date.now();
  while(n<5&&Date.now()-t0<900000){ const who=await pg.evaluate(()=>STORE.STAGE.who()); if(who!==last){ last=who; await pg.waitForTimeout(5000); await pg.screenshot({path:out+'_'+n+'_'+who+'.png'}); console.log(n,who,JSON.stringify(await pg.evaluate(()=>STORE.STAGE.heard())),'left',(await pg.evaluate(()=>STORE.STAGE.left())).toFixed(1)); n++; } await pg.waitForTimeout(1000); }
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
