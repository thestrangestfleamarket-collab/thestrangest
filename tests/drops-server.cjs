// THE GROUND DROPS' SERVER CHECK: node tests/drops-server.cjs. Runs the website's worker (wrangler dev): a thing dropped is kept by the section's block and told to everyone, and to a player joining later; it is set once (nobody changes or clears it); the first to take it gets it, the other is told nothing is there; it is gone when its time is up (the alarm); at most 200 lie there, the oldest go first.
const {spawn}=require('child_process'), WS=require('ws'), PORT=8798, BASE='http://127.0.0.1:'+PORT, U='ws://127.0.0.1:'+PORT+'/parties/block/s-drtest'+Date.now();
const open=n=>new Promise((res,rej)=>{ const w=new WS(U,{headers:{Cookie:'tsfm-pass=dev:'+n,Origin:BASE}}); w.got=[]; w.on('message',d=>{ try{ w.got.push(JSON.parse(d)); }catch(e){} }); w.on('open',()=>res(w)); w.on('error',rej); });
const wait=ms=>new Promise(r=>setTimeout(r,ms)), W=(w,k)=>w.got.filter(m=>m.t==='world'&&m.k===k), hi=w=>w.got.find(m=>m.t==='hi');
const rec=(id,n,x)=>JSON.stringify({id,n,x,y:0,z:2,lv:'street',t:Date.now()});
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
const run=async()=>{
  const a=await open('alice'), b=await open('bob'); await wait(500);
  a.send(JSON.stringify({t:'world',k:'drop:aaaa1',v:rec('fr_apple',3,5)})); await wait(400);
  const ra=W(b,'drop:aaaa1').pop(), r=ra&&JSON.parse(ra.v||'{}'), min=r?(r.until-r.t)/6e4:0;
  ok(r&&r.id==='fr_apple'&&r.n===3&&r.by==='dev-alice'&&min>=60&&min<=120,'alice drops three apples: bob hears it, stamped by the server (by alice, gone in '+min.toFixed(1)+' min)');
  ok(W(a,'drop:aaaa1').length===1,'alice hears it back from the server too');
  b.send(JSON.stringify({t:'world',k:'drop:aaaa1',v:rec('quartz',99,0)})); await wait(250); b.send(JSON.stringify({t:'world',k:'drop:aaaa1',v:''})); await wait(400);
  ok(W(a,'drop:aaaa1').length===1,'nobody changes or clears a drop by writing over it');
  a.send(JSON.stringify({t:'world',k:'drop:bad!',v:rec('fr_apple',1,0)})); await wait(200); a.send(JSON.stringify({t:'world',k:'drop:bbbb1',v:rec('Not An Id',1,0)})); await wait(300);
  ok(!W(b,'drop:bad!').length&&!W(b,'drop:bbbb1').length,'a bad key or item is refused');
  const c=await open('carol'); await wait(500); const h=hi(c);
  ok(h&&h.world&&h.world['drop:aaaa1']&&JSON.parse(h.world['drop:aaaa1']).n===3,'carol joins later and is told of it');
  a.send(JSON.stringify({t:'take',k:'drop:aaaa1'})); b.send(JSON.stringify({t:'take',k:'drop:aaaa1'})); for(let i=0;i<50&&!(a.got.some(m=>m.t==='took'&&m.k==='drop:aaaa1')&&b.got.some(m=>m.t==='took'&&m.k==='drop:aaaa1'));i++)await wait(100);   // both answers, however slow the runner
  const ta=a.got.find(m=>m.t==='took'&&m.k==='drop:aaaa1'), tb=b.got.find(m=>m.t==='took'&&m.k==='drop:aaaa1');
  ok(ta&&ta.v&&JSON.parse(ta.v).n===3&&tb&&tb.v==='','both reach for it: the first gets it with its record, the second gets nothing');
  ok(W(c,'drop:aaaa1').some(m=>m.v===''),'everyone sees it go');
  b.send(JSON.stringify({t:'world',k:'drop:cccc1',v:rec('quartz',1,0),life:1500})); await wait(400);
  ok(W(c,'drop:cccc1').some(m=>m.v),'a drop with a short life (a test server\'s) is told');
  await wait(3500); ok(W(c,'drop:cccc1').some(m=>m.v===''),'its time up, the alarm clears it for everyone');
  const ws=[a,b,c,await open('dave'),await open('erin')]; await wait(400);
  for(let i=0;i<205;i++){ const k='drop:cap'+String(i).padStart(4,'0');   // one at a time, sent again if the block's rate limit let it fall
    for(let t=0;t<40&&!W(a,k).length;t++){ if(t%8===0)ws[(i+Math.floor(t/8))%ws.length].send(JSON.stringify({t:'world',k,v:rec('fr_apple',1,i)})); await wait(40); } }
  await wait(800); const f=await open('frank'); await wait(600); const ks=Object.keys((hi(f)||{}).world||{}).filter(k=>k.startsWith('drop:'));
  ok(ks.length===200&&!ks.includes('drop:cap0000')&&!ks.includes('drop:cap0004')&&ks.includes('drop:cap0204'),'205 dropped: 200 are kept, the five oldest went ('+ks.length+')');
  ok(W(a,'drop:cap0000').some(m=>m.v===''),'and everyone is told the oldest went');
  for(const w of [...ws,f])w.close(); };
(async()=>{ const w=spawn('npx',['wrangler','dev','--port',String(PORT),'--ip','127.0.0.1','--var','DEV_AUTH:1','--show-interactive-dev-session=false'],{stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
  let log=''; w.stdout.on('data',d=>log+=d); w.stderr.on('data',d=>log+=d);
  let up=false; for(let i=0;i<120&&!up;i++){ await wait(1000); up=await fetch(BASE+'/').then(r=>r.ok).catch(()=>false); }
  if(!up){ console.log('FAIL: the worker never started\n'+log); w.kill(); process.exit(1); }
  try{ await run(); }catch(e){ ok(false,'the checks threw: '+e.message); }
  w.kill(); if(bad)console.log(log.split('\n').filter(l=>/error|drops/i.test(l)).slice(-10).join('\n')); console.log(bad?bad+' FAILED':'all ground drop server checks passed'); process.exit(bad?1:0); })();
