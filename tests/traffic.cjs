// THE TRAFFIC (150pb-traffic, the crossing in 069-dress): node tests/traffic.cjs [out]: the vehicles load and drive; on red no car is on the park gate's crosswalk and the waiting cars are behind their line; a car stops for someone standing in its lane; the button starts the walk; <out>.png the crossing
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]; const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13&at=45,4',{timeout:300000});
  await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForFunction(()=>window.TRAFFIC&&TRAFFIC.dbg().loaded&&TRAFFIC.dbg().lanes.every(L=>L.cars.every(c=>c.model)),null,{timeout:120000,polling:1000}).catch(()=>{});
  const T=()=>pg.evaluate(()=>TRAFFIC.dbg()); let d=await T();
  ok(d.lanes.length===4&&d.lanes.every(L=>L.cars.every(c=>c.model)),'four lanes, every vehicle has a model');
  ok(new Set(d.lanes.flatMap(L=>L.cars.map(c=>c.model))).size>=8,'many kinds of vehicle');
  const R=()=>pg.evaluate(()=>{ const t=Date.now()/1000+TRAFFIC.skew; return ((t%90)+90)%90; });
  // green (the timer's 40 s of 90): someone in the westbound lane ahead of a car; it stops short of them
  await pg.evaluate(()=>{ const t=Date.now()/1000, r=((t%90)+90)%90; TRAFFIC.skew=(36-r); }); await pg.waitForTimeout(3000); d=await T();
  const L0=d.lanes[0], c=L0.cars.filter(c=>c.on&&c.x>-100&&c.x<300).sort((a,b)=>a.x-b.x)[0];
  if(c){ const sx=c.x-(c.len+30); await pg.evaluate(([x,z])=>{ STORE.pos.set(x,0,z); SHARED.py=SHARED.groundY(x,z); },[sx,L0.z]); await pg.waitForTimeout(9000); d=await T();
    const c2=d.lanes[0].cars.filter(q=>q.on&&q.x>sx).sort((a,b)=>a.x-b.x)[0]; ok(c2&&c2.sp<.5&&c2.x-c2.len>sx,'a car stops for someone in the road: '+JSON.stringify(c2&&{x:c2.x,sp:c2.sp,me:sx}));
    await pg.evaluate(()=>{ STORE.pos.set(45,0,4); SHARED.py=SHARED.groundY(45,4); }); }
  else ok(false,'a westbound car on the street');
  // on into the red (73 s), then 6 s more
  while(true){ const r=await R(); if(r>=79&&r<84)break; await pg.waitForTimeout(1000); } d=await T();
  ok(d.light.m==='r'&&d.light.x==='w','red for the cars, WALK for people: '+JSON.stringify(d.light));
  const [x0,x1]=d.cross, G=d.lanes.filter(L=>!L.fly);
  ok(G.every(L=>L.cars.every(c=>!c.on||c.x+c.len<x0||c.x-c.len>x1)),'no car on the crosswalk on red '+JSON.stringify([x0,x1,G.map(L=>L.cars.filter(c=>c.on&&!(c.x+c.len<x0||c.x-c.len>x1)).map(c=>[c.model,+c.x.toFixed(1),c.sp,+L.stop.toFixed(1)]))]));
  ok(G.every(L=>L.cars.every(c=>{ if(!c.on)return true; const before=L.dir<0?c.x>x1&&c.x<L.stop+25:c.x<x0&&c.x>L.stop-25; return !before||(L.dir<0?c.x-c.len>=L.stop-1:c.x+c.len<=L.stop+1); })),'the waiting cars are behind their line')
  await pg.evaluate(()=>{ const t=Date.now()/1000, r=((t%90)+90)%90; TRAFFIC.skew=(20-r); TRAFFIC.press(); }); await pg.waitForTimeout(6000); d=await T();
  ok(d.light.m==='r'&&d.light.x==='w','the button brings the walk: '+JSON.stringify(d.light));
  if(out){ await pg.evaluate(()=>{ STORE.pos.set(52,0,4); SHARED.py=SHARED.groundY(52,4); }); await pg.waitForTimeout(4000); await pg.screenshot({path:out+'.png'}); }
  ok(!errs.length,'no page errors '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(bad?1:0); })();
