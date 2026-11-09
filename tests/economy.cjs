// THE MONEY CHECK: node tests/economy.cjs. Runs the website's worker (wrangler dev): what you own only grows as fast as play allows (cash and things beyond the bucket are not kept, moves between your bag, the bank and the vault are free), and a body's things fall to the ground for anyone an hour after (here: a moment, a test's short life).
const {spawn}=require('child_process'), WS=require('ws'), PORT=8798, BASE='http://127.0.0.1:'+PORT, ROOM='/parties/block/s-ectest'+Date.now();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let bad=0; const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
const own=(who,body)=>fetch(BASE+'/owned',{method:'POST',headers:{cookie:'tsfm-pass=dev:'+who,origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json()).catch(e=>({why:String(e)}));
const J=v=>{ try{ return JSON.parse(v); }catch(e){ return null; } };
const open=n=>new Promise((res,rej)=>{ const w=new WS('ws://127.0.0.1:'+PORT+ROOM,{headers:{Cookie:'tsfm-pass=dev:'+n,Origin:BASE}}); w.got=[]; w.on('message',d=>{ try{ w.got.push(JSON.parse(d)); }catch(e){} }); w.on('open',()=>res(w)); w.on('error',rej); });
const run=async()=>{
  const A='ec-'+Date.now();
  let r=await own(A,{put:{inv:JSON.stringify({v:1,items:{x_perch:2},cash:1200})}});
  ok(r.ok&&!r.clip,'a small gain is kept ($200, two fish)');
  r=await own(A,{put:{inv:JSON.stringify({v:1,items:{x_perch:2},cash:1e9})}});
  let got=J((await own(A,{})).owned.inv);
  ok(r.ok&&r.clip&&r.clip.cash>0&&got.cash<=1200+2600,'a billion dollars from nowhere is cut to what the bucket allows: $'+(got&&got.cash)+' '+JSON.stringify(r.clip&&{cash:r.clip.cash}));
  r=await own(A,{put:{inv:JSON.stringify({v:1,items:{x_perch:9002},cash:got.cash})}});
  got=J((await own(A,{})).owned.inv);
  ok(r.clip&&got.items.x_perch<=2+601,'nine thousand fish at once are cut too: '+got.items.x_perch);
  const c0=got.cash;
  r=await own(A,{put:{inv:JSON.stringify({v:1,items:got.items,cash:c0-500}),bank:JSON.stringify({v:1,bal:500})}});
  ok(r.ok&&!r.clip,'cash into the bank in the same save is a move, not a gain');
  r=await own(A,{put:{bank:JSON.stringify({v:1,bal:5e6})}});
  got=J((await own(A,{})).owned.bank);
  ok(r.clip&&got.bal<5e6,'a bank balance from nowhere is cut: $'+(got&&got.bal));
  const L=await own(A,{}); ok(L.owned&&L.owned.inv,'the save is still there');
  // the body
  const B='ecb-'+Date.now(), C='ecc-'+Date.now();
  await own(B,{put:{inv:JSON.stringify({v:1,items:{},cash:0}),corpse:JSON.stringify({x:10,z:20,py:0,t:Date.now(),items:{x_perch:3},inside:{},cash:40})}});
  const a=await open(B), c=await open(C); await wait(400);
  a.send(JSON.stringify({t:'mv',at:[10,20,0,0,'up','']})); c.send(JSON.stringify({t:'mv',at:[12,20,0,0,'up','']})); await wait(300);
  a.send(JSON.stringify({t:'body',v:{x:10,y:0,z:20,lv:'street'},life:800})); await wait(4500);
  const drops=c.got.filter(m=>m.t==='world'&&String(m.k).startsWith('drop:')&&m.v).map(m=>({k:m.k,...J(m.v)})).filter(d=>String(d.by).startsWith('body:'));
  ok(drops.some(d=>d.id==='x_perch'&&d.n===3)&&drops.some(d=>d.id==='cash'&&d.n===40),'after its time the body\'s things fall to the ground, cash too, and others see them: '+JSON.stringify(drops.map(d=>[d.id,d.n])));
  ok(!J((await own(B,{})).owned.corpse||'null'),'the body is no longer its owner\'s to take back');
  const fish=drops.find(d=>d.id==='x_perch'); if(fish){ c.send(JSON.stringify({t:'take',k:fish.k})); await wait(400); }
  ok(fish&&c.got.some(m=>m.t==='took'&&m.k===fish.k&&m.v),'anyone may take them');
  // a stall: rented, stocked, bought from while its renter watches, the till collected less the market's cut
  const st=(w,o)=>w.send(JSON.stringify({t:'st',...o})), last=(w,op)=>w.got.filter(m=>m.t==='st'&&m.op===op).pop();
  st(a,{op:'leave',id:'s1'}); await wait(200); st(a,{op:'rent',id:'s1',days:2}); await wait(300);
  ok(last(a,'rented')&&last(a,'rented').cost===30,'a stall is rented: two days, $30');
  st(c,{op:'rent',id:'s1',days:1}); await wait(300); ok(last(c,'no'),'someone else cannot rent it too');
  st(a,{op:'put',id:'s1',item:'x_perch',n:3,p:9}); await wait(300);
  const one=c.got.filter(m=>m.t==='st'&&m.op==='one'&&m.id==='s1').pop();
  ok(one&&one.o&&one.o.goods.some(g=>g.id==='x_perch'&&g.n===3&&g.p===9),'three fish at $9 are set out, and everyone sees them');
  st(c,{op:'buy',id:'s1',item:'x_perch',n:1}); await wait(400);
  ok(last(c,'bought')&&last(c,'bought').cost===9&&last(a,'sold'),'another player buys one; the renter hears it sold');
  st(a,{op:'collect',id:'s1'}); await wait(300); const back=last(a,'back');
  ok(back&&back.cash===8,'the till, less the market\'s 5%, is collected: $'+(back&&back.cash));
  st(a,{op:'leave',id:'s1'}); await wait(300); const left=last(a,'back');
  ok(left&&left.items&&left.items.x_perch===2,'given up, what was left comes back to the bag');
  a.close(); c.close(); };
(async()=>{ const w=spawn('npx',['wrangler','dev','--port',String(PORT),'--ip','127.0.0.1','--var','DEV_AUTH:1','--show-interactive-dev-session=false'],{stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
  let log=''; w.stdout.on('data',d=>log+=d); w.stderr.on('data',d=>log+=d);
  let up=false; for(let i=0;i<120&&!up;i++){ await wait(1000); up=await fetch(BASE+'/').then(r=>r.ok).catch(()=>false); }
  if(!up){ console.log('FAIL: the worker never started\n'+log); w.kill(); process.exit(1); }
  try{ await run(); }catch(e){ ok(false,'the checks threw: '+e.message); }
  w.kill(); console.log(bad?bad+' FAILED':'all money checks passed'); process.exit(bad?1:0); })();
