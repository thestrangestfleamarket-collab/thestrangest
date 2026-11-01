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
    ok(put.ok===true&&got.home&&got.home.wall==='brick','/home keeps your decorated room ('+JSON.stringify(got).slice(0,80)+')');
    const seen=await fetch(BASE+'/home',{method:'POST',headers:{cookie:'tsfm-pass=dev:a-visitor',origin:BASE,'content-type':'application/json'},body:JSON.stringify({who:'dev-site-check'})}).then(r=>r.json()).catch(e=>({why:String(e)}));
    ok(seen.home&&seen.home.wall==='brick','another player can look at your room when they visit ('+JSON.stringify(seen).slice(0,60)+')'); }
  { const own=body=>fetch(BASE+'/owned',{method:'POST',headers:{cookie:'tsfm-pass=dev:own-check',origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json()).catch(e=>({why:String(e)}));
    ok((await fetch(BASE+'/owned',{method:'POST',headers:{origin:BASE},body:'{}'})).status===401,'/owned without a login is refused');
    const p1=await own({put:{inv:'{"v":1}',birds:'x'}}), p2=await own({put:{birds:null}}), got=await own({}), bad=await own({put:{'no way':'x'}});
    ok(p1.ok===true&&p2.ok===true&&got.owned&&got.owned.inv==='{"v":1}'&&!('birds' in got.owned)&&!bad.ok,'/owned keeps what you own, key by key ('+JSON.stringify(got).slice(0,80)+')'); }
  { const CAB='CHECK '+String(Date.now()%1e6), sc=(body,who='dev:score-check')=>fetch(BASE+'/scores',{method:'POST',headers:{cookie:'tsfm-pass='+who,origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json()).catch(e=>({why:String(e)}));
    ok((await fetch(BASE+'/scores',{method:'POST',headers:{origin:BASE},body:'{"cab":"MAZE"}'})).status===401,'/scores without a login is refused');
    const p1=await sc({cab:CAB,put:{ini:'ABC',score:5000,sub:'ROUND 4'}}), p2=await sc({cab:CAB,put:{ini:'XYZ',score:9000,sub:'ROUND 7'}},'dev:score-two'), bad=await sc({cab:CAB,put:{ini:'a!',score:10}}), got=await sc({cab:CAB}), all=await sc({cab:'*'});
    ok(p1.ok===true&&p1.rank===1&&p2.ok===true&&p2.rank===1&&!bad.ok&&got.top&&got.top[0].ini==='XYZ'&&got.top[1].ini==='ABC'&&got.top[1].sub==='ROUND 4'&&all.top&&all.top[CAB]&&all.top[CAB].length===2,'/scores keeps the arcade\'s top ten a cabinet, shared ('+JSON.stringify(got).slice(0,90)+')'); }
  { const T=(body,ck)=>fetch(BASE+'/admin',{method:'POST',headers:{cookie:'tsfm-pass='+ck,origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)});
    ok((await T({do:'text',key:'check.x',text:'HELLO'},'dev:site-check')).status===403,'/admin text: not for a player who is not the owner');
    const put=await (await T({do:'text',key:'check.x',text:'HELLO'},'dev:owner-check')).json(), got=await (await fetch(BASE+'/texts',{headers:{cookie:'tsfm-pass=dev:site-check'}})).json(); await T({do:'text',key:'check.x',text:''},'dev:owner-check');
    ok(put.ok===true&&got['check.x']==='HELLO'&&(await fetch(BASE+'/texts')).status===401,'/texts carries the owner\'s words to every player, and only to players ('+JSON.stringify(got).slice(0,80)+')'); }
  { const WS=require('ws'); const dish=who=>new Promise((res,rej)=>{ const w=new WS(BASE.replace(/^http/,'ws')+'/parties/dish/petri',{headers:{cookie:'tsfm-pass='+who,origin:BASE}}); const got=[]; w.on('message',d=>{ try{ got.push(JSON.parse(d)); }catch(e){} }); w.on('open',()=>res({w,got})); w.on('error',rej); setTimeout(()=>rej(new Error('no dish')),20000); });
    const wait=(c,f,ms=8000)=>new Promise(r=>{ const t0=Date.now(); const k=setInterval(()=>{ if(f(c.got)||Date.now()-t0>ms){ clearInterval(k); r(f(c.got)); } },100); });
    ok(await new Promise(r=>{ const w=new WS(BASE.replace(/^http/,'ws')+'/parties/dish/petri',{headers:{origin:BASE}}); w.on('unexpected-response',(q,res)=>r(res.statusCode===401||res.statusCode===404)); w.on('open',()=>r(false)); w.on('error',()=>r(true)); }),'the dish without a login is refused');
    let a=null, bb=null; try{ a=await dish('dev:dish-a'); bb=await dish('dev:dish-b'); }catch(e){ ok(false,'two players reach the dish ('+e.message+')'); }
    if(a&&bb){ const hiA=await wait(a,g=>g.find(m=>m.t==='hi')), hiB=await wait(bb,g=>g.find(m=>m.t==='hi'));
      const A=hiA&&hiA.you; ok(hiA&&hiB&&A&&A!==hiB.you&&hiB.S.players.some(p=>p[0]===A)&&hiB.S.players.filter(p=>p[3]).length===11&&hiA.S.pellets.length===1000,'two players reach the dish and see each other among eleven bots ('+(hiB&&hiB.S.players.length)+' in it, you '+A+')');
      a.w.send(JSON.stringify({t:'in',dx:1,dy:0})); const tk=await wait(a,g=>g.filter(m=>m.t==='tk').length>=5&&g.filter(m=>m.t==='tk').slice(-1)[0]); const mv=tk&&tk.cells.find(c=>c[1]===A), first=hiA&&hiA.S.cells.find(c=>c[1]===A);
      ok(mv&&first&&mv[2]>first[2]+5&&tk.who.length>=13&&tk.board.length>0,'the dish ticks ten times a second and steering moves your cell ('+(first&&first[2])+' → '+(mv&&mv[2])+')');
      a.w.close(); bb.w.close(); }
  }
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
  if(started){ let keys=[]; for(let i=0;i<20&&!keys.includes('forage');i++){ await g.waitForTimeout(1500); keys=await g.evaluate(()=>fetch('/owned',{method:'POST',headers:{'content-type':'application/json'},body:'{}'}).then(r=>r.json()).then(j=>Object.keys(j.owned||{}))).catch(()=>[]); }
    ok(keys.includes('forage')&&keys.includes('inv'),'what you own in THE MARKET is kept on the server ('+keys.slice(0,8).join(' ')+')'); }
  ok(!gerr.length,'THE MARKET: no page errors '+[...new Set(gerr)].join(' | '));
  await b.close(); w.kill();
  console.log(bad?bad+' FAILED':'all good'); process.exit(bad?1:0);
})();
