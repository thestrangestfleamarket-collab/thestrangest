const {chromium}=(()=>{ try{ return require('playwright'); }catch(e){ return require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright'); } })();
(async()=>{ const out=process.argv[2]||'mockups/ghost-player', only=(process.argv[3]||'idle,glide,arms,back,play').split(','), at=process.argv[4]||'0,3', b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:900,height:700}}); pg.setDefaultTimeout(300000); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message.slice(0,300),(e.stack||'').split('\n').slice(1,3).join(' / ').slice(0,300)); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13&npcwait=99&at='+at+(process.argv[5]||''),{waitUntil:'commit',timeout:300000});
  for(let i=0;i<200&&!(await pg.evaluate(()=>!!window.__started&&window.AVSDBG&&AVSDBG().ready).catch(()=>false));i++)await pg.waitForTimeout(1000);
  await pg.evaluate(()=>{ hud.hidden=true; stat.hidden=true; window.__dbg.cam(Math.PI/4,.5,window.__dbg.cv().PPU*5); }); await pg.waitForTimeout(5000);
  const S=()=>pg.evaluate(()=>JSON.stringify(AVSDBG())), shot=async n=>{ await pg.screenshot({path:out+'-'+n+'.png'}); console.log(n,await S()); };
  const cam=(y,p,z)=>pg.evaluate(([y,p,z])=>{ const h=window.__dbg.hd(); window.__dbg.cam(h+y,p,window.__dbg.cv().PPU*z); },[y,p,z]);
  if(only.includes('idle')){ await cam(.785,.45,5); await pg.waitForTimeout(3000); await shot('idle');
    const still=await pg.evaluate(async()=>{ const C=AVS.C.ghost, a=C.state().cloth; await new Promise(r=>setTimeout(r,1500)); const q=C.state(); return {a,b:q.cloth,lift:q.lift}; }); console.log('idle drift',JSON.stringify(still)); }
  if(only.includes('glide')){ await cam(1.6,.4,4); await pg.keyboard.down('w'); for(let i=0;i<4;i++){ await pg.waitForTimeout(i?500:1200); await shot('glide'+i); } await pg.keyboard.down('Shift'); await pg.waitForTimeout(1500); await shot('run'); await pg.keyboard.up('Shift'); await pg.keyboard.up('w');
    for(let i=0;i<3;i++){ await pg.waitForTimeout(400); await shot('stop'+i); } await pg.keyboard.press(' '); await pg.waitForTimeout(350); await shot('jump'); await pg.waitForTimeout(2500); }
  if(only.includes('arms')){ await cam(.6,.45,5); await pg.waitForTimeout(1000); await pg.keyboard.down('b'); await pg.waitForTimeout(700); await shot('wave'); await pg.keyboard.up('b'); await pg.waitForTimeout(1500);
    await pg.keyboard.press('j'); await pg.waitForTimeout(250); await shot('punch'); await pg.waitForTimeout(1500); }
  if(only.includes('back')){ await cam(3.6,.4,5); await pg.waitForTimeout(2500); await shot('back'); }
  if(only.includes('play')){ await cam(.5,.4,5); await pg.waitForTimeout(800); await pg.keyboard.press('t'); for(let i=0;i<4;i++){ await pg.waitForTimeout(220); await shot('swing'+i); } await pg.waitForTimeout(2500); await shot('play');
    await cam(.5,.4,8); await pg.waitForTimeout(2500); await shot('playclose'); await pg.keyboard.press('t'); await pg.waitForTimeout(2500); await cam(3.6,.4,5); await pg.waitForTimeout(2000); await shot('slung'); }
  console.log(await pg.evaluate(()=>{ const C=AVS.C.ghost, T=f=>{ const t=performance.now(); for(let i=0;i<60;i++)f(); return +((performance.now()-t)/60).toFixed(3); }; return JSON.stringify({tris:C.tris,tick:T(()=>C.tick(1/60,null)),onScreen:window.__dbg.tris()}); }).catch(e=>'eval '+e.message));
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
