// THE HOSPITAL (150pg-hospital, owner 12 Nov 2026): node tests/hospital.cjs: it stands on West St's park side with its garage; the hover ambulance waits in the garage; a faint calls it: the parked one goes, one flies to you, patches you up and flies home, and it is parked again.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({executablePath:process.env.PWCHROME||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:640}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13&at=-38,-10',{timeout:300000});
  await pg.waitForFunction(()=>window.__started&&!document.getElementById('loading')&&window.CARS&&CARS.dbg().loaded&&window.HOSPITAL&&HOSPITAL.made,null,{timeout:500000,polling:1000}).catch(()=>{});
  await pg.waitForTimeout(3000);
  const d=await pg.evaluate(()=>{ const A=[...CARS.cars.values()].find(c=>c.model==='ambulance'), [gx,gz]=HOSPITAL.home();
    return {made:HOSPITAL.made,n:HOSPITAL.G.children.length,amb:A&&{d:Math.hypot(A.x-gx,A.z-gz)/__dbg.cv().TILE,by:A.by,shown:!!(A.mesh&&A.mesh.visible)},site:HOSPITAL.site}; });
  ok(d.made&&d.n>=12&&d.site,'the hospital stands on its lot, its trees cleared: '+JSON.stringify({pieces:d.n,site:d.site}));
  ok(d.amb&&d.amb.d<2&&!d.amb.by&&d.amb.shown,'the hover ambulance waits in the garage: '+JSON.stringify(d.amb));
  const hp0=await pg.evaluate(()=>{ __dbg.VIT.faint(); return __dbg.VIT.hp; }); let seen={out:false,high:0,there:false,healed:false};
  for(let i=0;i<70;i++){ await pg.waitForTimeout(500); const q=await pg.evaluate(()=>{ const A=[...CARS.cars.values()].find(c=>c.model==='ambulance'), c=HOSPITAL.call, p=c&&HOSPITAL.at(c,TRAINS.now?TRAINS.now():Date.now()/1000); return {by:A.by,shown:!!(A.mesh&&A.mesh.visible),call:!!c,y:p?p.y:0,there:!!(p&&p.there),hp:__dbg.VIT.hp,out:__dbg.VIT.out}; });
    if(q.call&&q.by==='ems'&&!q.shown)seen.out=true; seen.high=Math.max(seen.high,q.y); if(q.there)seen.there=true; if(q.hp>=.3)seen.healed=true; if(seen.there&&!q.call){ seen.back=q; break; } }
  ok(seen.out&&seen.high>5,'a faint calls it: the parked ambulance goes and one flies out over the street: '+JSON.stringify({out:seen.out,high:+seen.high.toFixed(1)}));
  ok(seen.there&&seen.healed,'it comes down beside you and the paramedics patch you up: '+JSON.stringify({there:seen.there,healed:seen.healed,hp0}));
  ok(seen.back&&!seen.back.by&&seen.back.shown,'it flies home and is parked in the garage again: '+JSON.stringify(seen.back||null));
  ok(!errs.length,'no page errors '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(bad?1:0); })();
