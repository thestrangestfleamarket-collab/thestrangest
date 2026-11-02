// THE CARS' SERVER CHECK: node tests/cars-server.cjs. Runs the website's worker (wrangler dev) and talks to a block's server as three players: one gets in a car, the second cannot take it, parking it is heard with where, a newcomer sees it parked and free, a driver who leaves the game leaves it parked where they were.
const {spawn}=require('child_process'), WS=require('ws'), PORT=8798, BASE='http://127.0.0.1:'+PORT, U='ws://127.0.0.1:'+PORT+'/parties/block/s-cartest'+Date.now();

const open=n=>new Promise((res,rej)=>{ const w=new WS(U,{headers:{Cookie:'tsfm-pass=dev:'+n,Origin:BASE}}); w.got=[]; w.on('message',d=>{ try{ w.got.push(JSON.parse(d)); }catch(e){} }); w.on('open',()=>res(w)); w.on('error',rej); });
const wait=ms=>new Promise(r=>setTimeout(r,ms)); const cars=w=>w.got.filter(m=>m.t==='car');
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
const run=async()=>{ const a=await open('alice'), b=await open('bob'); await wait(400);
  a.send(JSON.stringify({t:'car',k:'c1',on:1})); await wait(500);
  ok(cars(a).some(m=>m.k==='c1'&&m.by==='dev-alice')&&cars(b).some(m=>m.k==='c1'&&m.by==='dev-alice'),'alice gets in c1; both hear it '+JSON.stringify([cars(a),cars(b)]));
  b.send(JSON.stringify({t:'car',k:'c1',on:1})); await wait(500);
  ok(cars(b).some(m=>m.k==='c1'&&m.no&&m.by==='dev-alice')&&!cars(a).some(m=>m.by==='dev-bob'),'bob cannot take c1 while alice drives it '+JSON.stringify(cars(b)));
  a.send(JSON.stringify({t:'car',k:'c1',on:0,at:[1,2,.5]})); await wait(600);
  ok(cars(b).some(m=>m.k==='c1'&&m.by===null&&m.at==='1,2,0.5'),'alice parks it; bob hears where '+JSON.stringify(cars(b).slice(-1)));
  const c=await open('carol'); await wait(500); const hi=c.got.find(m=>m.t==='hi');
  ok(hi&&hi.world&&hi.world['car:c1']==='1,2,0.5'&&hi.cars&&!hi.cars.c1,'someone arriving sees it parked there and free '+JSON.stringify(hi&&{w:hi.world['car:c1'],cars:hi.cars}));
  b.send(JSON.stringify({t:'car',k:'c1',on:1})); await wait(400); b.send(JSON.stringify({t:'mv',at:[5,6,0,1.2,'up','']})); await wait(400); b.close(); await wait(800);
  ok(cars(c).some(m=>m.k==='c1'&&m.by==='dev-bob')&&cars(c).some(m=>m.k==='c1'&&m.by===null&&m.at==='5,6,1.2'),'bob drives it and leaves the game: it is parked where he was, free '+JSON.stringify(cars(c)));
  a.close(); c.close(); };

(async()=>{ const w=spawn('npx',['wrangler','dev','--port',String(PORT),'--ip','127.0.0.1','--var','DEV_AUTH:1','--show-interactive-dev-session=false'],{stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
  let log=''; w.stdout.on('data',d=>log+=d); w.stderr.on('data',d=>log+=d);
  let up=false; for(let i=0;i<120&&!up;i++){ await wait(1000); up=await fetch(BASE+'/').then(r=>r.ok).catch(()=>false); }
  if(!up){ console.log('FAIL: the worker never started\n'+log); w.kill(); process.exit(1); }
  try{ await run(); }catch(e){ ok(false,'the checks threw: '+e.message); }
  w.kill(); console.log(bad?bad+' FAILED':'all server car checks passed'); process.exit(bad?1:0); })();
