// THE DUNGEON'S SERVER CHECK: node tests/dunmobs-server.cjs. Runs the website's worker (wrangler dev) and players below: no creatures till the dungeon master's design, a player's design refused, the owner's published to all; the monsters stepped and sent to both in the room, their blows reaching a player, a kill told to the striker, and someone in another room told only of theirs.
const {spawn}=require('child_process'), WS=require('ws'), PORT=8799, BASE='http://127.0.0.1:'+PORT, U='ws://127.0.0.1:'+PORT+'/parties/block/s-duntest'+Date.now();
const open=n=>new Promise((res,rej)=>{ const w=new WS(U,{headers:{Cookie:'tsfm-pass=dev:'+n,Origin:BASE,'x-tsfm-dev':'1'}}); w.got=[]; w.on('message',d=>{ try{ w.got.push(JSON.parse(d)); }catch(e){} }); w.on('open',()=>res(w)); w.on('error',rej); });
const wait=ms=>new Promise(r=>setTimeout(r,ms)); let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
const G={v:'srv1',T:1,rooms:[{k:2,n:3,lane:[0,0,10,10],block:[]},{k:3,n:2,lane:[20,0,30,10],block:[]}],cat:{tiers:{red:{hp:7,dmg:.07,v:1.5},green:{hp:2,dmg:0,v:.9}},mix:{3:{red:1},2:{green:1}},guards:{},stats:{},styles:{},kk:[]}};
const DS={mobs:[{id:'r',r:2,kind:'s',key:'red',x:6,z:6,n:3,hp:7,dmg:.07,v:1.5,beh:'hunt'},{id:'g',r:3,kind:'c',key:'fa:Bear',x:25,z:5,n:2,hp:5,dmg:.05,beh:'wander'}]};
const run=async()=>{ const a=await open('owner-a'), b=await open('bob'), c=await open('carol'); await wait(400);
  const hi=a.got.find(m=>m.t==='hi'); ok(hi&&'mv' in hi,'the hi says the map\'s version ('+(hi&&JSON.stringify(hi.mv))+')');
  ok(a.got.some(m=>m.t==='dm'&&m.d===null),'a new dungeon has no design: no creatures');
  a.send(JSON.stringify({t:'mobgrid',g:G})); await wait(400);
  for(const [w,x] of [[a,5],[b,5.5]])w.send(JSON.stringify({t:'mv',at:[x,5,0,0,'down','']})); c.send(JSON.stringify({t:'mv',at:[25,5,0,0,'down','']})); await wait(1500);
  ok(!a.got.filter(m=>m.t==='mobs').some(m=>m.m.length),'with no design the rooms are empty');
  b.send(JSON.stringify({t:'dmset',d:DS})); await wait(600); ok(b.got.some(m=>m.t==='dmres'&&!m.ok)&&!c.got.some(m=>m.t==='dm'&&m.d),'a player\'s design is refused');
  a.send(JSON.stringify({t:'dmset',d:DS})); await wait(600); ok(a.got.some(m=>m.t==='dmres'&&m.ok)&&c.got.some(m=>m.t==='dm'&&m.d&&m.d.mobs.length===2),'the owner\'s design goes to everyone');
  await wait(2500);
  const ma=a.got.filter(m=>m.t==='mobs'), mb=b.got.filter(m=>m.t==='mobs'), mc=c.got.filter(m=>m.t==='mobs');
  ok(ma.length>5&&mb.length>5,'both in the room hear the monsters several times a second ('+ma.length+', '+mb.length+')');
  const last=ma[ma.length-1];
  ok(mc.length&&mc.every(m=>m.m.every(e=>e[1]===3))&&mc.some(m=>m.m.some(e=>e[3]==='fa:Bear')),'someone in another room hears only that room\'s creatures (the bears)');
  ok(last.m.filter(e=>e[2]==='s').length&&last.m.filter(e=>e[2]==='s').every(e=>e[3]==='red'),'the room holds the design\'s red slimes '+JSON.stringify(last.m.slice(0,2)));
  await wait(4000); const hurt=[...a.got,...b.got].filter(m=>m.t==='mobhurt'); ok(hurt.length>0&&hurt.every(h=>h.d>0),'their blows reach the players ('+hurt.length+')');
  const near=last.m.filter(e=>e[1]===2&&!e[9]).sort((p,q)=>Math.hypot(p[4]-5,p[5]-5)-Math.hypot(q[4]-5,q[5]-5))[0], id=near[0]; let k=null; for(let i=0;i<6&&!k;i++){ a.send(JSON.stringify({t:'mobhit',i:id,d:20,kb:1,hv:1})); await wait(300); k=a.got.find(m=>m.t==='mobkill'); }
  ok(k&&k.i===id&&k.w==='s'&&k.key==='red','a killing blow is told to the striker, with what it was '+JSON.stringify(k));
  ok(!b.got.some(m=>m.t==='mobkill'),'and not to anyone else');
  const after=b.got.filter(m=>m.t==='mobs').pop(); ok(after.m.some(e=>e[0]===id&&e[9]>0),'everyone sees it dead');
  a.close(); b.close(); c.close(); };
(async()=>{ const w=spawn('npx',['wrangler','dev','--port',String(PORT),'--ip','127.0.0.1','--var','DEV_AUTH:1','--show-interactive-dev-session=false'],{stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
  let log=''; w.stdout.on('data',d=>log+=d); w.stderr.on('data',d=>log+=d);
  let up=false; for(let i=0;i<120&&!up;i++){ await wait(1000); up=await fetch(BASE+'/').then(r=>r.ok).catch(()=>false); }
  if(!up){ console.log('FAIL: the worker never started\n'+log.slice(-3000)); w.kill(); process.exit(1); }
  try{ await run(); }catch(e){ ok(false,'the checks threw: '+e.message); }
  if(bad)console.log(log.slice(-2000)); w.kill(); console.log(bad?bad+' FAILED':'all dungeon server checks passed'); process.exit(bad?1:0); })();
