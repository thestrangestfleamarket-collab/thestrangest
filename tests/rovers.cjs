// THE PARK'S ROVERS (150ph-rover, their round in 150pb-traffic; owner 12 Nov 2026): node tests/rovers.cjs: two silver rovers keep to the park's paths, none on the road; a fire by one goes out; spray paint by one is cleaned off for everyone; near you one says hello.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({executablePath:process.env.PWCHROME||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:640}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13&at=45,4',{timeout:300000});
  await pg.waitForFunction(()=>window.__started&&!document.getElementById('loading')&&window.TRAFFIC&&TRAFFIC.dbg().loaded&&TRAFFIC.dbg().lanes.every(L=>L.cars.every(c=>c.model))&&window.ROVERS,null,{timeout:500000,polling:1000}).catch(()=>{});
  const d=await pg.evaluate(()=>{ const D=TRAFFIC.dbg(), r=D.rings.find(r=>r.id==='rover'), P=[0,1].map(i=>TRAFFIC.ringAt('rover',i)), X=SHARED.BOD.XS, Z=SHARED.BOD.ZS;
    return {r,road:D.lanes.flatMap(L=>L.cars.map(c=>c.model)).filter(m=>m==='rover').length,inPark:P.every(p=>p.x>X(D.park[0])&&p.x<X(D.park[1])&&p.z>Z(D.park[2])&&p.z<Z(D.park[3])),y:P.map(p=>+p.y.toFixed(2))}; });
  ok(d.r&&d.r.models.length===2&&d.road===0&&d.inPark&&d.y.every(y=>Math.abs(y)<.01),'two rovers on the park\'s paths, on the ground, none on the road: '+JSON.stringify(d));
  const f=await pg.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)), p=TRAFFIC.ringAt('rover',0), n0=ROVERS.fires; const fire=BLAZE.start(p.x+1.5,p.z+1,true); for(let i=0;i<20&&fire&&fire.wet<3;i++)await w(300); return {lit:!!fire,doused:ROVERS.fires-n0,wet:fire?fire.wet:null}; });
  ok(f.lit&&f.doused>=1&&f.wet>=3,'a fire started beside a rover is put out: '+JSON.stringify(f));
  const s=await pg.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)), p=TRAFFIC.ringAt('rover',1); STORE.pos.set(p.x+8,0,p.z+8); const n0=ROVERS.tags; ONLINE.put('tag:test',JSON.stringify({o:[p.x+1,.1,p.z+1],n:[0,1,0],p:'0,0,5,5,10,0',c:1,w:.05})); const had=!!(ONLINE.world||{})['tag:test']; for(let i=0;i<30&&(ONLINE.world||{})['tag:test'];i++)await w(400); return {had,wiped:ROVERS.tags-n0,left:(ONLINE.world||{})['tag:test']||''}; });
  ok(s.had&&s.wiped>=1&&!s.left,'spray paint beside a rover is cleaned off: '+JSON.stringify(s));
  const h=await pg.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)), n0=ROVERS.hello; for(let i=0;i<12&&ROVERS.hello===n0;i++){ const p=TRAFFIC.ringAt('rover',1); STORE.pos.set(p.x+1.5,0,p.z+1.5); await w(400); } return {hello:ROVERS.hello-n0}; });
  ok(h.hello>=1,'next to you a rover says hello: '+JSON.stringify(h));
  ok(!errs.length,'no page errors '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(bad?1:0); })();
