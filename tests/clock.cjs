// THE CLOCK'S BUTTONS (owner, 7 Nov 2026): on the real worker (wrangler dev), the owner's THE HOURS panel sets the clock to an hour, pauses it, runs it on and puts it back on real Central time; each reaches the server (/shared/time.json) and a player reads it there. node tests/clock.cjs
const {chromium}=require('playwright'), {spawn}=require('child_process');
const PORT=8798, BASE='http://127.0.0.1:'+PORT; let bad=0;
const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c){ bad++; if(process.env.GITHUB_ACTIONS)console.log('::error title=clock::'+String(m).slice(0,900)); } };
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const w=spawn('npx',['wrangler','dev','--port',String(PORT),'--ip','127.0.0.1','--var','DEV_AUTH:1','--show-interactive-dev-session=false'],{stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
  let log=''; w.stdout.on('data',d=>log+=d); w.stderr.on('data',d=>log+=d);
  let up=false; for(let i=0;i<120&&!up;i++){ await wait(1000); up=await fetch(BASE+'/').then(r=>r.ok).catch(()=>false); }
  if(!up){ console.log('FAIL: the worker never started\n'+log); w.kill(); process.exit(1); }
  const file=async()=>{ const r=await fetch(BASE+'/shared/time.json',{headers:{cookie:'tsfm-pass=dev:clock-player'}}); return r.status===200?r.json():null; };
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const ctx=await b.newContext({viewport:{width:960,height:600}}); await ctx.addCookies([{name:'tsfm-pass',value:'dev:owner-clock',url:BASE}]);
  const pg=await ctx.newPage(); pg.setDefaultTimeout(600000); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,200)));
  await pg.goto(BASE+'/?fresh=1',{waitUntil:'commit',timeout:600000}); for(let i=0;i<1500&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await wait(200);
  await wait(8000);   // (no admins table off the website: the page is told it is the owner below; the server still checks the login is the owner's)
  await pg.evaluate(()=>__UI.menuTab('set')); await wait(800); await pg.evaluate(()=>document.querySelector('[data-sec="set"]').click()); await wait(500); await pg.evaluate(()=>document.querySelector('[data-sub="time"]').click());
  for(let i=0;i<60&&!(await pg.evaluate(()=>{ DN.owner=true; if(!document.querySelector('#dnclkset'))DN.draw(); return !!document.querySelector('#dnclkset'); }).catch(()=>false));i++)await wait(500);
  const press=async(sel,word)=>{ await pg.evaluate(s=>document.querySelector(s).click(),sel); for(let i=0;i<40;i++){ const m=await pg.evaluate(()=>document.querySelector('#dnmsg').textContent); if(m&&!/setting/.test(m))return m; await wait(250); } return pg.evaluate(()=>document.querySelector('#dnmsg').textContent); };
  const hour=()=>pg.evaluate(()=>DN.clockH());
  await pg.fill('#dnclkh','03:15'); const m1=await press('#dnclkset'), f1=await file(), h1=await hour();
  ok(/03:15/.test(m1)&&f1&&f1.clk&&Math.abs(h1-3.25)<.05,'SET puts the clock at 03:15 for everyone ('+m1+'; '+h1.toFixed(2)+'; '+JSON.stringify(f1)+')');
  const m2=await press('#dnclkp'), f2=await file(), a=await hour(); await wait(3000); const a2=await hour(), lab=await pg.evaluate(()=>document.querySelector('#dnclkp').textContent);
  ok(/stopped/.test(m2)&&f2&&f2.clk&&f2.clk.stop!=null&&a===a2&&lab==='RUN','PAUSE stops it for everyone and the button says RUN ('+m2+'; '+JSON.stringify(f2&&f2.clk)+')');
  const m3=await press('#dnclkp'), f3=await file(); await wait(4000); const b3=await hour();
  ok(/runs on/.test(m3)&&f3&&f3.clk&&f3.clk.stop==null&&b3>a2,'RUN starts it again from where it stood ('+m3+'; '+a2.toFixed(4)+' -> '+b3.toFixed(4)+')');
  const m4=await press('#dnclkr'), f4=await file(), h4=await hour(), real=+new Date().toLocaleString('en-US',{timeZone:'America/Chicago',hour:'numeric',hourCycle:'h23'});
  ok(/Central/.test(m4)&&f4&&f4.clk&&!f4.clk.off&&f4.clk.stop==null&&Math.floor(h4)===real,'REAL TIME puts it back on Central time ('+m4+'; '+h4.toFixed(2)+' vs '+real+')');
  { const r=await fetch(BASE+'/shared/time.json',{method:'POST',headers:{cookie:'tsfm-pass=dev:clock-player',origin:BASE,'content-type':'application/json'},body:'{"clk":{"off":0,"stop":0}}'}); ok(r.status===403,'a player who is not the owner cannot set the clock ('+r.status+')'); }
  { const c2=await b.newContext({viewport:{width:640,height:400}}); await c2.addCookies([{name:'tsfm-pass',value:'dev:owner-two',url:BASE}]); const p2=await c2.newPage(); p2.setDefaultTimeout(600000);   // a second owner's page follows the first's change (12 Nov 2026: "it only changes for me")
    await p2.goto(BASE+'/?fresh=1',{waitUntil:'commit',timeout:600000}); for(let i=0;i<1500&&!(await p2.evaluate(()=>!!window.__started).catch(()=>false));i++)await wait(200); await wait(8000); await p2.evaluate(()=>{ DN.owner=true; });
    for(let i=0;i<60&&!(await pg.evaluate(()=>ONLINE.on)&&await p2.evaluate(()=>ONLINE.on));i++)await wait(500);
    const want=await pg.evaluate(()=>DN.mode==='night'?'day':'night'); await pg.evaluate(async m=>{ DN.hold=m; DN.set(m,true); await DN.pushTime(m); },want);
    let got=null; for(let i=0;i<40&&got!==want;i++){ await wait(500); got=await p2.evaluate(()=>DN.hold); }
    ok(got===want,'a look held for everyone reaches a second owner\'s page too ('+want+' -> '+got+')');
    await pg.evaluate(()=>{ DN.hold=null; return DN.pushTime('clock'); }); for(let i=0;i<40&&got!==null;i++){ await wait(500); got=await p2.evaluate(()=>DN.hold); }
    ok(got===null,'and THE CLOCK\'S again reaches it ('+got+')'); await c2.close(); }
  ok(!errs.length,'no page errors '+errs.join(' | '));
  await b.close(); w.kill(); console.log(bad?bad+' FAILED':'all good'); process.exit(bad?1:0);
})().catch(e=>{ console.log('FAIL '+e.message); process.exit(1); });
