// THE TRAFFIC (150pb-traffic, the crossing in 069-dress): node tests/traffic.cjs [out]: the vehicles load and drive; nothing with wheels flies; the owner's speeds (SPEED) set each lane's; on red no car or flier is on the park gate's crosswalk and the waiting ones are behind their line; a car stops for someone standing in its lane; the button starts the walk; a walker's way crosses only on a crosswalk; <out>.png the crossing
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]; const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13&at=45,4',{timeout:300000});
  await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForFunction(()=>window.TRAFFIC&&TRAFFIC.dbg().loaded&&TRAFFIC.dbg().lanes.every(L=>L.cars.every(c=>c.model)),null,{timeout:120000,polling:1000}).catch(()=>{});
  const T=()=>pg.evaluate(()=>TRAFFIC.dbg()); let d=await T();
  ok(d.lanes.length===4&&d.lanes.every(L=>L.cars.every(c=>c.model)),'four lanes, every vehicle has a model'+(d.lanes.every(L=>L.cars.every(c=>c.model))?'':': '+JSON.stringify(d.lanes.map(L=>L.cars.map(c=>c.model)))));
  ok(new Set(d.lanes.flatMap(L=>L.cars.map(c=>c.model))).size>=8,'many kinds of vehicle');
  ok(d.lanes.filter(L=>L.fly).every(L=>L.cars.every(c=>c.model!=='rover')),'nothing with wheels flies');
  const sp=await pg.evaluate(()=>{ const v0=TRAFFIC.lanes.map(L=>L.v); SPEED.set({traffic:2,fliers:.5}); const v1=TRAFFIC.lanes.map(L=>L.v); SPEED.set({}); return {v0,v1,v2:TRAFFIC.lanes.map(L=>L.v)}; });
  ok(sp.v1.every((v,i)=>Math.abs(v-sp.v0[i]*(i<2?2:.5))<1e-6)&&sp.v2.every((v,i)=>v===sp.v0[i]),'the owner\'s speeds set the road\'s and the fliers\' '+JSON.stringify(sp));
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
  const [x0,x1]=d.cross, G=d.lanes;
  ok(G.every(L=>L.cars.every(c=>!c.on||c.x+c.len<x0||c.x-c.len>x1)),'no car or flier on the crosswalk on red '+JSON.stringify([x0,x1,G.map(L=>L.cars.filter(c=>c.on&&!(c.x+c.len<x0||c.x-c.len>x1)).map(c=>[c.model,+c.x.toFixed(1),c.sp,+L.stop.toFixed(1)]))]));
  ok(G.every(L=>L.cars.every(c=>{ if(!c.on)return true; const before=L.dir<0?c.x>x1&&c.x<L.stop+25:c.x<x0&&c.x>L.stop-25; return !before||(L.dir<0?c.x-c.len>=L.stop-1:c.x+c.len<=L.stop+1); })),'the waiting cars and fliers are behind their line')
  await pg.evaluate(()=>{ const t=Date.now()/1000, r=((t%90)+90)%90; TRAFFIC.skew=(20-r); TRAFFIC.press(); }); await pg.waitForTimeout(6000); d=await T();
  ok(d.light.m==='r'&&d.light.x==='w','the button brings the walk: '+JSON.stringify(d.light));
  // the rules of the street (076 pedfree): a walker's way across Market St keeps to the crosswalk; the road is no place to stand, the crosswalk is
  const ru=await pg.evaluate(()=>{ const B=SHARED.BOD, X=B.XS, Z=B.ZS, a={x:X(60),z:Z(-75)}, b={x:X(60),z:Z(-44)}, r=CITY.route('up',a,b,PEDFREE); let bad=0;
    if(r)for(let i=1;i<r.pts.length;i++){ const p=r.pts[i-1], q=r.pts[i]; for(let k=0;k<=20;k++)if(STROAD(p.x+(q.x-p.x)*k/20,p.z+(q.z-p.z)*k/20))bad++; } const w=B.road.xw.find(q=>q.lit);
    return {r:!!r,bad,road:STROAD(X(60),Z(-60)),xing:!!w&&!STROAD(X((w.a0+w.a1)/2),Z(-60))}; });
  ok(ru.r&&!ru.bad&&ru.road&&ru.xing,'a walker crosses Market St only on a crosswalk: '+JSON.stringify(ru));
  if(out){ await pg.evaluate(()=>{ STORE.pos.set(52,0,4); SHARED.py=SHARED.groundY(52,4); }); await pg.waitForTimeout(4000); await pg.screenshot({path:out+'.png'}); }
  // the car lamps (150pc): off by day; after dark the cars on the road show head and tail lights and the nearest light the road for real
  ok(await pg.evaluate(()=>!CARLAMPS.dbg().on),'no car lamps by day');
  const cl=await pg.evaluate(async()=>{ const e0=CLOCK.dayElev; CLOCK.dayElev=()=>-30; await new Promise(r=>setTimeout(r,1500)); const d=CARLAMPS.dbg(); CLOCK.dayElev=e0; return d; });
  ok(cl.on&&cl.lens===(cl.cars-cl.own)*4&&cl.lit>0&&cl.spots.some(v=>v>0),'after dark the cars show their lamps and the nearest light the road: '+JSON.stringify(cl));
  // the patrol: a police cruiser sets out once a minute, one way then the other; the airship rides high, seven times its size
  const pt=await pg.evaluate(()=>{ const L=TRAFFIC.lanes, out=[];
    for(let li=0;li<2;li++)for(let i=0;i<L[li].n;i++)for(let lap=1000;lap<1100;lap++)if(TRAFFIC.patrol(li,i,lap))out.push([li,i,lap]); const b=TRAFFIC.blimp; return {n:out.length,ways:[out.filter(o=>o[0]===0).length,out.filter(o=>o[0]===1).length],pat:L.slice(0,2).map(l=>!!l.pat),random:L[0].GR.includes('police-cruiser-80s'),fl:L[2].FL.includes('sky-tender'),blimp:!!b.m&&{s:+(b.m.scale.x*b.m.children[0].scale.x/(__dbg.cv().TILE/.84*1.4)).toFixed(1),y:+(b.m.position.y/(__dbg.cv().TILE/.84)).toFixed(0)}}; });
  ok(pt.n>20&&Math.abs(pt.ways[0]-pt.ways[1])<=2&&pt.pat.every(Boolean)&&!pt.random,'the police cruiser is the patrol only: once a minute, the two ways in turn: '+JSON.stringify(pt));
  ok(!pt.fl&&pt.blimp&&pt.blimp.s===7&&pt.blimp.y>60,'the airship is out of the lanes, seven times its size, high over the section: '+JSON.stringify(pt.blimp));
  // the airship's captain (150pbb): a new look from the avatar's wardrobe, standing in the gondola as it flies
  await pg.waitForFunction(()=>window.CAPTAIN&&CAPTAIN.dbg().made,null,{timeout:120000,polling:1000}).catch(()=>{});
  const cap=await pg.evaluate(()=>{ const B=TRAFFIC.blimp, c=CAPTAIN.dbg(), g=B.m.children[0], V=CAPTAIN.N.g.position.clone(); g.worldToLocal(V); return {...c,local:V.toArray().map(v=>+v.toFixed(2))}; });
  ok(cap.made&&Math.abs(cap.local[0])<.4&&cap.local[1]>.6&&cap.local[1]<1.1&&cap.local[2]>-1.2&&cap.local[2]<1&&['hat','eyes','face','coat','neck','feet'].every(k=>cap.slots.includes(k)),'the airship\'s captain stands in its gondola, in his flight cap, goggles, beard, long coat, scarf and boots: '+JSON.stringify({local:cap.local,slots:cap.slots}));
  // cars a lap apart on the clock (one held up while unseen ones went back to their places) still see each other: through a red, no two in one place
  await pg.evaluate(()=>{ const t=Date.now()/1000, r=((t%90)+90)%90; TRAFFIC.skew+=(20-r); const lap=TRAFFIC.dbg().lap; for(const L of TRAFFIC.lanes)L.cars.forEach((C,i)=>{ if(i%2)C.u+=lap; }); });
  { let worst=0; for(let k=0;k<45;k++){ await pg.waitForTimeout(2000); worst=Math.max(worst,await pg.evaluate(()=>TRAFFIC.dbg().clip)); } ok(worst===0,'cars a lap apart on the clock keep their gaps through a red: '+worst); }
  // a car you are driving, stopped in the lane: the traffic stops behind its bumper, not in it
  await pg.evaluate(()=>{ const t=Date.now()/1000, r=((t%90)+90)%90; TRAFFIC.skew=(2-r); }); await pg.waitForTimeout(1500); d=await T();
  { const L=d.lanes[0], c=L.cars.filter(c=>c.on&&c.x>-100&&c.x<300).sort((a,b)=>a.x-b.x)[0], sx=c?c.x-(c.len+30):0;
    const id=await pg.evaluate(async([x,z])=>{ const C=CARS.cars.get('c1'); C.x=x; C.z=z; CARS.getIn('c1'); for(let k=0;k<40&&!CARS.driving;k++)await new Promise(r=>setTimeout(r,500)); STORE.pos.set(x,0,z); SHARED.py=SHARED.groundY(x,z); return CARS.dbg().driving; },[sx,L.z]);
    await pg.waitForTimeout(9000); d=await T(); const me=await pg.evaluate(()=>({x:STORE.pos.x,h:2.4*TRAFFIC.dbg().m1}));
    const c2=d.lanes[0].cars.filter(q=>q.on&&q.x>me.x).sort((a,b)=>a.x-b.x)[0]; ok(id&&c2&&c2.sp<.5&&c2.x-c2.len>me.x+me.h,'the traffic stops behind the car you drive: '+JSON.stringify({id,me,c:c2&&{x:c2.x,len:c2.len,sp:c2.sp}}));
 }
  ok(!errs.length,'no page errors '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(bad?1:0); })();
