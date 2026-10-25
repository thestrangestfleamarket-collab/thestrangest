// THE SITE CHECK (18 Oct 2026, after the white screen: the copy on the website had an unclosed <!-- and showed nothing). Runs the
// website's own worker (worker/door.js, wrangler dev) on dist/ and checks it as a visitor would: / without a login is the door (the
// invite code box), / with a login (the dev: pass, only on this machine) is THE MARKET and it starts, and the files aren't handed out
// by themselves. The deploy (.github/workflows/site.yml) runs only if this passes. Exits 1 if anything fails.
const {chromium}=require('playwright'), {spawn}=require('child_process');
const PORT=8799, BASE='http://127.0.0.1:'+PORT;
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
(async()=>{
  const w=spawn('npx',['wrangler','dev','--port',String(PORT),'--ip','127.0.0.1','--var','DEV_AUTH:1','--show-interactive-dev-session=false'],{stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
  let log=''; w.stdout.on('data',d=>log+=d); w.stderr.on('data',d=>log+=d);
  let up=false; for(let i=0;i<120&&!up;i++){ await new Promise(r=>setTimeout(r,1000)); up=await fetch(BASE+'/').then(r=>r.ok).catch(()=>false); }
  if(!up){ console.log('FAIL: the worker never started\n'+log); w.kill(); process.exit(1); }
  const fs=require('fs'), gf=fs.readdirSync('dist/g').filter(f=>f!=='market.html');
  for(const p of ['/market.html','/market','/door.html','/avatar.html','/g/market.html','/g/market','/g/'+gf[0]])ok((await fetch(BASE+p)).status===404,p+' is not handed out by itself');
  ok((await fetch(BASE+'/g/'+gf[0],{headers:{cookie:'tsfm-pass=dev:site-check'}})).status===200,'/g/'+gf[0]+' with a login');
  { const home=body=>fetch(BASE+'/home',{method:'POST',headers:{cookie:'tsfm-pass=dev:site-check',origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json()).catch(e=>({why:String(e)}));
    ok((await fetch(BASE+'/home',{method:'POST',headers:{origin:BASE},body:'{}'})).status===401,'/home without a login is refused');
    const put=await home({put:{v:1,wall:'brick',things:{}}}), got=await home({});
    ok(put.ok===true&&got.home&&got.home.wall==='brick','/home keeps your decorated room ('+JSON.stringify(got).slice(0,80)+')'); }
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const door=await b.newPage(), derr=[]; door.on('pageerror',e=>derr.push(e.message));
  await door.goto(BASE+'/',{waitUntil:'load'}); await door.waitForTimeout(1500);
  ok(await door.locator('#dcode').isVisible().catch(()=>false),'/ without a login: the door, with its invite code box');
  ok(!derr.length,'the door: no page errors '+derr.join(' | '));
  const ctx=await b.newContext(); await ctx.addCookies([{name:'tsfm-pass',value:'dev:site-check',url:BASE}]);
  const g=await ctx.newPage(), gerr=[]; g.on('pageerror',e=>gerr.push(e.message));
  await g.goto(BASE+'/',{waitUntil:'commit',timeout:180000});
  let started=false; for(let i=0;i<300&&!(started=await g.evaluate(()=>!!window.__started).catch(()=>false));i++)await g.waitForTimeout(1000);
  ok(await g.evaluate(()=>!!document.querySelector('meta[name=market-build]')).catch(()=>false),'/ with a login: THE MARKET');
  ok(started,'THE MARKET starts');
  ok(started&&await g.evaluate(()=>!!document.querySelector('#stage canvas')).catch(()=>false),'THE MARKET draws (its canvas is on the page)');
  ok(!gerr.length,'THE MARKET: no page errors '+[...new Set(gerr)].join(' | '));
  await b.close(); w.kill();
  console.log(bad?bad+' FAILED':'all good'); process.exit(bad?1:0);
})();
