// THE INVITATIONS' SERVER CHECK: node tests/invites-server.cjs. Runs the website's worker (wrangler dev): a player in one section invites one in another; the invitation reaches her with who, where and what; her yes reaches him; everyone online is listed across sections; a player not online is answered "gone".
const {spawn}=require('child_process'), WS=require('ws'), PORT=8799, BASE='http://127.0.0.1:'+PORT;
const open=(n,room)=>new Promise((res,rej)=>{ const w=new WS('ws://127.0.0.1:'+PORT+'/parties/block/'+room,{headers:{Cookie:'tsfm-pass=dev:'+n,Origin:BASE}}); w.got=[]; w.on('message',d=>{ try{ w.got.push(JSON.parse(d)); }catch(e){} }); w.on('open',()=>res(w)); w.on('error',rej); });
const wait=ms=>new Promise(r=>setTimeout(r,ms)); const inv=w=>w.got.filter(m=>m.t==='inv');
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
const run=async rooms=>{ const a=await open('alice',rooms[0]), b=await open('bob',rooms[1]); await wait(400);
  a.send(JSON.stringify({t:'me',name:'ALICE'})); b.send(JSON.stringify({t:'me',name:'BOB'})); await wait(400);
  a.send(JSON.stringify({t:'everyone'})); await wait(1500); const e=a.got.find(m=>m.t==='everyone');
  ok(e&&e.all.some(p=>p.id==='dev-bob'&&p.name==='BOB'&&p.sec===rooms[1])&&!e.all.some(p=>p.id==='dev-alice'),'everyone online, across sections, not you '+JSON.stringify(e));
  a.send(JSON.stringify({t:'inv',to:'dev-bob',k:'books',d:{n:2,g:'chess'}})); await wait(1500);
  const q=inv(b)[0]; ok(q&&q.op==='ask'&&q.from==='dev-alice'&&q.name==='ALICE'&&q.sec===rooms[0]&&q.k==='books'&&q.d.n===2&&q.d.g==='chess','bob in the other section gets the invitation '+JSON.stringify(q));
  b.send(JSON.stringify({t:'invr',to:'dev-alice',op:'yes',k:'books'})); await wait(1500);
  ok(inv(a).some(m=>m.op==='yes'&&m.from==='dev-bob'&&m.name==='BOB'),'alice hears his yes '+JSON.stringify(inv(a)));
  await wait(3100); a.send(JSON.stringify({t:'inv',to:'dev-nobody',k:'books',d:{n:0,g:'go'}})); await wait(2000);
  ok(inv(a).some(m=>m.op==='gone'&&m.from==='dev-nobody'),'someone not online: "gone" '+JSON.stringify(inv(a).slice(-1)));
  a.close(); b.close(); };
(async()=>{ const W=require('../data/world.json'), ids=W.sections.ids.flat().map(i=>'s-'+String(i).toLowerCase().replace(/[^a-z0-9-]/g,''));
  const w=spawn('npx',['wrangler','dev','--port',String(PORT),'--ip','127.0.0.1','--var','DEV_AUTH:1','--show-interactive-dev-session=false'],{stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
  let log=''; w.stdout.on('data',d=>log+=d); w.stderr.on('data',d=>log+=d);
  let up=false; for(let i=0;i<120&&!up;i++){ await wait(1000); up=await fetch(BASE+'/').then(r=>r.ok).catch(()=>false); }
  if(!up){ console.log('FAIL: the worker never started\n'+log); w.kill(); process.exit(1); }
  try{ await run(ids.slice(0,2)); }catch(e){ ok(false,'the checks threw: '+e.message); }
  w.kill(); console.log(bad?bad+' FAILED':'all server invitation checks passed'); process.exit(bad?1:0); })();
