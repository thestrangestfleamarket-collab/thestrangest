// THE PACE, THE LANDING, THE QUICK BAR: node tests/pace.cjs [out folder]. A tap of Shift switches walk and run (no jog); Shift+M leaves it; a drop of about a storey plays the hard landing, a small step none;
// the quick bar holds MAP, BAG, PASSPORT and EMOTES, its slots set 1 to 40.
const {chromium}=require('playwright'); const OUT=process.argv[2]; let bad=0;
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const errs=[];
  const wait=ms=>new Promise(r=>setTimeout(r,ms)); const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+'  · '+(i||'')); };
  const open=async q=>{ const pg=await b.newPage({viewport:{width:1100,height:640}}); pg.on('pageerror',e=>errs.push(e.message.slice(0,200)));
    { const DIR=require('path').join(process.cwd(),'node_modules/@dimforge/rapier3d-compat'), fs=require('fs');
      await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=require('path').join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue(); r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
    await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12'+q,{timeout:600000}); await pg.waitForFunction(()=>window.__started,null,{timeout:900000}); for(let i=0;i<80&&!(await pg.evaluate(()=>AVATAR.ready()));i++)await wait(500); await wait(4000); return pg; };
  const third=pg=>pg.evaluate(()=>{ __dbg.UI.setView('third'); SHARED.yawTo=SHARED.yaw=SHARED.heading+Math.PI; SHARED.pitchTo=SHARED.pitch=.3; });
  let pg=await open('');
  const tap=async(...ks)=>{ for(const k of ks)await pg.keyboard.down(k); await wait(80); for(const k of ks.reverse())await pg.keyboard.up(k); await wait(400); };
  const g0=await pg.evaluate(()=>SHARED.gait||0); await tap('Shift'); const j=await pg.evaluate(()=>({g:SHARED.gait,rt:__dbg.ST.runTarget,jog:__dbg.ST.jog,act:AVATAR.act(__dbg.ST)}));
  rec('a tap of Shift: run, never a jog',g0===0&&j.g===2&&j.rt===1&&!j.jog&&!(j.act&&j.act.n==='Jog'),JSON.stringify(j));
  await tap('Shift','m'); const m=await pg.evaluate(()=>SHARED.gait); await pg.keyboard.press('Escape'); rec('Shift+M leaves the pace',m===2,m);
  await tap('Shift','w'); rec('Shift with W again: walk',await pg.evaluate(()=>SHARED.gait===0&&__dbg.ST.runTarget===0));
  await tap('Shift'); await third(pg); await pg.keyboard.down('w'); await wait(1800); if(OUT)require('fs').mkdirSync(OUT,{recursive:true}),await pg.screenshot({path:OUT+'/run.png'}); await pg.keyboard.up('w'); await tap('Shift');
  const q=await pg.evaluate(()=>{ const s=HUDDBG().slots; HUD.count(25); const n=document.querySelectorAll('#hud .slot, #hud [data-i]').length; return {s,n,N:HUD.n()}; });
  rec('the quick bar: the common things, and 25 slots',q.N===25&&['act:map','act:bag','act:passport','act:emotes'].every(a=>q.s.includes(a)),JSON.stringify(q));
  if(OUT)require('fs').mkdirSync(OUT,{recursive:true}),await pg.screenshot({path:OUT+'/bar25.png'}); await pg.evaluate(()=>{ HUD.count(99); }); rec('clamped to 40',await pg.evaluate(()=>HUD.n()===40)); await pg.evaluate(()=>HUD.count(10));
  const op=await pg.evaluate(async()=>{ HUD.use(HUDDBG().slots.indexOf('act:bag')); await new Promise(r=>setTimeout(r,500)); const o=!document.getElementById('bagp').hidden; BAG.toggle(false); return o; }); rec('the BAG slot opens the bag',op);
  await pg.evaluate(()=>__dbg.UI.goName('THE STREET')); await wait(10000); await third(pg); await wait(800);
  const L=await pg.evaluate(async()=>{ for(let i=0;i<20&&!__dbg.RIG.MOVES.mc_pf_Land;i++)await new Promise(r=>setTimeout(r,300)); const f0=GPH.floor; GPH.floor=g=>(f0?f0(g):g)+5; await new Promise(r=>setTimeout(r,1500)); GPH.floor=f0; await new Promise(r=>setTimeout(r,500)); const r=[__dbg.ST.move&&__dbg.ST.move.name,FADE.busy,SHARED.LVL,!!ROOMS.cur,!!__dbg.RIG.MOVES.mc_pf_Land,SHARED.py]; return r[0]==='mc_pf_Land'?r[0]:JSON.stringify(r); });
  rec('dropped from high: a hard landing',L==='mc_pf_Land',L); await wait(250); if(OUT)require('fs').mkdirSync(OUT,{recursive:true}),await pg.screenshot({path:OUT+'/land.png'}); await wait(400); if(OUT)require('fs').mkdirSync(OUT,{recursive:true}),await pg.screenshot({path:OUT+'/land2.png'});
  await wait(2500); const L2=await pg.evaluate(async()=>{ for(let i=0;i<60&&__dbg.ST.move;i++)await new Promise(r=>setTimeout(r,250)); const f0=GPH.floor; GPH.floor=g=>(f0?f0(g):g)+.6; await new Promise(r=>setTimeout(r,1500)); GPH.floor=f0; await new Promise(r=>setTimeout(r,500)); return __dbg.ST.move&&__dbg.ST.move.name; }); rec('a small step down: none',!L2,L2);
  rec('no page errors',!errs.length,JSON.stringify([...new Set(errs)])); await b.close(); console.log(bad?bad+' FAILED':'ALL PASS'); process.exit(bad?1:0); })();
