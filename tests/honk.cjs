// THE HORN'S WAY (150pf): node tests/honk.cjs. A traffic car held up honks and what holds it up gets out of the way: you on foot walk to the kerb, a car left empty in the road pulls over to the kerb, THE BIG CAT hurries his crossing; a player's own horn does the same.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs=[]; let bad=0;
  pg.on('pageerror',e=>errs.push(e.message.slice(0,160)));
  const ok=(c,n)=>{ if(!c)bad++; console.log((c?'ok   ':'FAIL ')+n); };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.waitForFunction(()=>TRAFFIC.dbg().loaded&&TRAFFIC.lanes[0].GR&&window.CARS&&CARS.dbg&&CARS.dbg().loaded,null,{timeout:120000});
  // you stand in the westbound lane, away from the crossing: the next car stops, honks, and you walk to the kerb
  const R=await pg.evaluate(()=>TRAFFIC.road), L=await pg.evaluate(()=>({z:TRAFFIC.lanes[0].z,cross:TRAFFIC.dbg().cross}));
  const x0=L.cross[0]-60; await pg.evaluate(([x,z])=>{ __dbg.UI.setView('third'); __dbg.UI.goTo(x,z,0,0); },[x0,L.z]);
  const n0=await pg.evaluate(()=>HONK.n);
  const honked=await pg.waitForFunction(n=>HONK.n>n,n0,{timeout:150000}).then(()=>true).catch(()=>false);
  ok(honked,'a car held up by you in its lane honks');
  const out=await pg.waitForFunction(R=>{ const p=__dbg.you(); return p.z<R.z0||p.z>R.z1; },R,{timeout:60000}).then(()=>true).catch(()=>false);
  ok(out,'you walk out of the road to the kerb '+JSON.stringify(await pg.evaluate(()=>[+__dbg.you().x.toFixed(1),+__dbg.you().z.toFixed(1)])));
  // a car left empty in the lane goes back to where it parks
  const car=await pg.evaluate(([x,z])=>{ const C=[...CARS.cars.values()].find(c=>c.mesh&&!c.moor); if(!C)return null; ONLINE.put('car:'+C.id,[x,z,0].join(',')); return {id:C.id,at:[C.x,C.z]}; },[x0+20,L.z]);
  ok(!!car&&Math.abs(car.at[1]-L.z)<.01,'a parked car is put in the lane '+JSON.stringify(car));
  const home=car&&await pg.waitForFunction(([c,R])=>{ const C=CARS.cars.get(c.id); return (C.z<R.z0||C.z>R.z1)&&Math.abs(C.x-c.at[0])<.01; },[car,R],{timeout:150000}).then(()=>true).catch(()=>false);
  ok(home,'honked at, it pulls over to the kerb where it stood');
  // the lane is clear again: the cars drive past it
  const flow=await pg.waitForFunction(([c,z])=>TRAFFIC.lanes[0].cars.some(K=>K.m&&K.sp>3&&Math.abs(K.m.position.x-c.at[0])<6),[car,L.z],{timeout:150000}).then(()=>true).catch(()=>false);
  ok(flow,'the traffic drives past the car at the kerb');
  // THE BIG CAT: honked at mid-crossing, he is across sooner
  const cat=await pg.evaluate(()=>{ const W=window.BIGCATWALK; let t=1000; while(!W(t).cross)t+=1; const t1=t+3; let a=t1; while(W(a).cross)a+=.5; ONLINE.world['honk:cat']=t1; let h=t1; while(W(h).cross)h+=.5; const same=W(t1-1).z; delete ONLINE.world['honk:cat']; return {slow:a-t1,fast:h-t1,cont:Math.abs(W(t1-1).z-same)<1e-9}; });
  ok(cat.fast>0&&cat.fast<cat.slow*.5&&cat.cont,'THE BIG CAT, honked at, finishes his crossing in a third of the time '+JSON.stringify(cat));
  // a player's own horn: what is ahead of the car moves, the driver does not
  const own=await pg.evaluate(([x,z])=>{ const C=[...CARS.cars.values()].find(c=>c.mesh&&!c.moor); ONLINE.put('car:'+C.id,[x,z,0].join(',')); SHARED.target=null; SYS.run('honk',{x:x-8,z,dx:1,dz:0,by:ONLINE.me||'me'}); const R=TRAFFIC.road; return {home:C.z<R.z0||C.z>R.z1,me:!SHARED.target}; },[x0+20,L.z]);
  ok(own.home&&own.me,'your own horn clears the car ahead and leaves you be '+JSON.stringify(own));
  // a player's horn behind a traffic car: it pulls over to its kerb and stops, then goes back into its lane
  await pg.evaluate(z=>{ __dbg.UI.goTo(TRAFFIC.road.x0+40,z-30,0,0); },R.z0);
  const pv=await pg.evaluate(async()=>{ const L=TRAFFIC.lanes[0], wait=ms=>new Promise(r=>setTimeout(r,ms)); let C=null; for(let i=0;i<300&&!C;i++){ C=L.cars.find(K=>K.m&&K.sp>2&&Math.abs(K.m.position.x-__dbg.you().x)<25); if(!C)await wait(300); } if(!C)return null;
    const x=C.m.position.x; SYS.run('honk',{x:x+9,z:L.z,dx:-1,dz:0,by:'someone'}); await wait(6000); const off=C.m.position.z-L.z, sp=C.sp, R=TRAFFIC.road, kerb=L.z-R.z0<R.z1-L.z?-1:1; await wait(9000); return {off:+off.toFixed(2),side:Math.sign(off)===kerb,sp:+sp.toFixed(2),back:+Math.abs((C.m?C.m.position.z:L.z)-L.z).toFixed(2),again:+C.sp.toFixed(2)}; });
  ok(!!pv&&Math.abs(pv.off)>1.5&&pv.side&&pv.sp<.5&&pv.back<.3&&pv.again>1,"for a player's horn the traffic car ahead pulls over to its kerb and stops, then drives on in its lane "+JSON.stringify(pv));
  // a walk a honk started is dropped when you get into a car
  const drop=await pg.evaluate(async([x,z])=>{ __dbg.UI.goTo(x,z,0,0); await new Promise(r=>setTimeout(r,300)); SYS.run('honk',{x:x-8,z,dx:1,dz:0,by:null}); const had=!!SHARED.target; const C=[...CARS.cars.values()].find(c=>c.mesh&&!c.moor); C.x=x+3; C.z=z; CARS.getIn(C.id); await new Promise(r=>setTimeout(r,1500)); const r={had,driving:!!CARS.driving,target:!!SHARED.target}; CARS.getOut&&CARS.getOut(); return r; },[x0,L.z]);
  ok(drop.had&&drop.driving&&!drop.target,'getting into a car ends the walk a honk started '+JSON.stringify(drop));
  ok(!errs.length,'no page errors '+errs.slice(0,3).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'all ok'); process.exit(bad?1:0); })();
