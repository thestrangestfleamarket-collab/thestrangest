// THE CROWD: node tools/loadsim.cjs [players=30] [secs=120] with wrangler dev on :8799 (--var DEV_AUTH:1). Players on one section's Block at the client's 6 Hz, chat, tricks, fishing, stalls, hits; prints fan-out and latency, and probes the stall's trust.
const WS=require('ws'); const PORT=8799, BASE='http://127.0.0.1:'+PORT, ROOM='/parties/block/s-load'+Date.now();
const N=+process.argv[2]||30, SECS=+process.argv[3]||120; const wait=ms=>new Promise(r=>setTimeout(r,ms));
const own=(who,body)=>fetch(BASE+'/owned',{method:'POST',headers:{cookie:'tsfm-pass=dev:'+who,origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json()).catch(e=>({why:String(e)}));
const open=n=>new Promise((res,rej)=>{ const w=new WS('ws://127.0.0.1:'+PORT+ROOM,{headers:{Cookie:'tsfm-pass=dev:'+n,Origin:BASE}}); w.name=n; w.rx=0; w.bytes=0; w.kinds={}; w.got=[];
  w.on('message',d=>{ w.rx++; w.bytes+=d.length; let m; try{ m=JSON.parse(d); }catch(e){ return; } w.kinds[m.t]=(w.kinds[m.t]||0)+1; if(m.t!=='mv'&&m.t!=='folk'&&m.t!=='mobs')w.got.push(m); if(w.onm)w.onm(m); });
  w.on('open',()=>res(w)); w.on('error',rej); });
const ARCH=['fisher','forager','dungeon','socialite','trader','skater','idler','pvp'];
(async()=>{ const P=[]; const t0=Date.now();
  for(let i=0;i<N;i++){ const name='p'+i+'-'+t0; await own(name,{put:{inv:JSON.stringify({v:1,items:{rod:1},cash:1000})}}); const w=await open(name); w.arch=ARCH[i%ARCH.length]; w.x=40+Math.random()*60; w.z=100+Math.random()*80; w.id=name; P.push(w);
    w.send(JSON.stringify({t:'me',name:'P'+i,look:'',hp:1})); }
  console.log('connected',P.length,'in',Date.now()-t0,'ms');
  // stalls: everyone wants one at once
  for(const w of P)w.send(JSON.stringify({t:'st',op:'rent',id:'s'+(1+Math.floor(Math.random()*5)),days:7}));
  await wait(1500); const rented=P.filter(w=>w.got.some(m=>m.t==='st'&&m.op==='rented')); console.log('stalls: '+rented.length+' of '+N+' got one (5 tables)');
  // exploit probe: put things you don't have, take them back
  if(rented[0]){ const w=rented[0], id=w.got.find(m=>m.op==='rented').id; w.send(JSON.stringify({t:'st',op:'put',id,item:'cut_meteor',n:9999,p:5})); await wait(300); w.send(JSON.stringify({t:'st',op:'take',id,item:'cut_meteor'})); await wait(800);
    const back=w.got.filter(m=>m.op==='back').pop(); console.log('stall put/take of 9999 meteors never owned ->',JSON.stringify(back));
    // and a buy with no money check
    const b=P.find(x=>!rented.includes(x)); w.send(JSON.stringify({t:'st',op:'put',id,item:'x_perch',n:1,p:1000000})); await wait(300); b.send(JSON.stringify({t:'st',op:'buy',id,item:'x_perch',n:1})); await wait(500);
    console.log('a $1,000,000 buy by a player with $1,000 ->',JSON.stringify(b.got.filter(m=>m.t==='st'&&(m.op==='bought'||m.op==='no')).pop()));
    w.send(JSON.stringify({t:'st',op:'collect',id})); await wait(800); console.log('  seller collects ->',JSON.stringify(w.got.filter(m=>m.op==='back').pop()));
  }
  // play
  const lat=[]; let sent=0; const end=Date.now()+SECS*1000; const rx0=P.map(w=>w.rx);
  const timers=P.map(w=>setInterval(()=>{ if(w.readyState!==1)return; const moving=w.arch!=='idler'&&w.arch!=='fisher'||Math.random()<.1; if(moving){ w.x+=(Math.random()-.5)*1.2; w.z+=(Math.random()-.5)*1.2; } 
     w.send(JSON.stringify({t:'mv',at:[+w.x.toFixed(2),+w.z.toFixed(2),0,0,'up','']})); sent++;
     const r=Math.random(); if(w.arch==='socialite'&&r<.03){ w.send(JSON.stringify({t:'say',text:'hey everyone '+Math.random().toString(36).slice(2,6)})); sent++; }
     if(w.arch==='skater'&&r<.2){ w.send(JSON.stringify({t:'trk',s:'ollie',v:5})); sent++; }
     if(w.arch==='pvp'&&r<.3){ const t=P.find(o=>o!==w&&Math.hypot(o.x-w.x,o.z-w.z)<6); if(t){ w.send(JSON.stringify({t:'hit',to:t.id,d:.5,kb:1})); sent++; } }
     if(w.arch==='fisher'&&r<.05){ w.send(JSON.stringify({t:'fish',b:[w.x,0,w.z],x:[w.x+3,0,w.z],k:'bob'})); sent++; }
  },1000/6));
  // latency probe: 'lives' round trip every 2 s from one client
  const probe=P[0]; const lp=setInterval(()=>{ const t=Date.now(); probe.onm=m=>{ if(m.t==='lives'){ lat.push(Date.now()-t); probe.onm=null; } }; probe.send(JSON.stringify({t:'lives'})); },2000);
  // pvp tally
  while(Date.now()<end) await wait(1000);
  timers.forEach(clearInterval); clearInterval(lp);
  const rx=P.map((w,i)=>w.rx-rx0[i]), hits=P.map(w=>w.kinds.hit||0);
  const kinds={}; for(const w of P)for(const k in w.kinds)kinds[k]=(kinds[k]||0)+w.kinds[k];
  lat.sort((a,b)=>a-b);
  console.log(JSON.stringify({players:N,secs:SECS,sentPerSec:+(sent/SECS).toFixed(0),rxPerClientPerSec:+(rx.reduce((a,b)=>a+b)/N/SECS).toFixed(1),kbPerClientPerSec:+(P.reduce((a,w)=>a+w.bytes,0)/N/SECS/1024).toFixed(1),
    serverFanoutPerSec:+(rx.reduce((a,b)=>a+b)/SECS).toFixed(0),probeLatencyMs:{n:lat.length,med:lat[lat.length>>1],p95:lat[Math.floor(lat.length*.95)],max:lat[lat.length-1]},maxHitsTaken:Math.max(...hits),kinds}));
  const hitTaken=Math.max(...hits); console.log('most hits taken by one player in '+SECS+' s: '+hitTaken+' (each up to 0.5 of health, judged by the attacker)');
  P.forEach(w=>w.close()); process.exit(0); })();
