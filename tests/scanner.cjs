// THE SCANNER CHECK: node tests/scanner.cjs [dist/market.html]. On the platform: a drone perches at the end; a person stepping off a train is scanned (the drone comes, the grid cage shows, the card), then the drone goes back.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:900,height:560}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2000);
  const idle=()=>pg.waitForFunction(()=>FADE.busy===0&&getComputedStyle(document.getElementById('subfade')).opacity==='0',null,{timeout:300000,polling:500}).catch(()=>{});
  await idle(); await pg.evaluate(()=>{ const p=SHARED.METRO.plat; __dbg.UI.goTo(p.x,p.z,'down'); }); await idle();
  await pg.waitForFunction(()=>SCANNER.state&&SCANNER.state().length>=1,null,{timeout:60000}).catch(()=>{}); await pg.waitForTimeout(800);
  const S0=await pg.evaluate(()=>SCANNER.state()[0]); ok(S0&&S0.ph==='perch'&&!S0.scan,'a drone perches at the platform end ('+JSON.stringify(S0)+')');
  const Q=await pg.evaluate(()=>{ const P=__dbg.you(); return SCANNER.off('me','TEST',{x:P.x,y:SHARED.py,z:P.z}); }); ok(Q,'a person stepping off the train is queued for a scan');
  const until=async(f,ms)=>{ for(let t=0;t<ms;t+=200){ if(await pg.evaluate(f))return true; await pg.waitForTimeout(200); } return false; };
  ok(await until(()=>SCANNER.state()[0].ph==='scan'&&SCANNER.state()[0].scan,30000),'the drone flies over and the grid scan shows');
  const D=await pg.evaluate(()=>{ const s=SCANNER.state()[0], P=__dbg.you(); return Math.hypot(s.at[0]-P.x,s.at[2]-P.z); }); ok(D<3,'it hovers close in front of the person ('+D.toFixed(2)+' away)');
  ok(await until(()=>{ const s=SCANNER.state()[0]; return s.ph==='perch'&&s.done===1; },60000),'then goes back to its perch, one scan done');
  const A=await pg.evaluate(()=>{ const car=TRAINS.list[0].cars[0]; TRAINS.ride.c=car; return true; }); await pg.waitForTimeout(300);
  const B=await pg.evaluate(()=>{ TRAINS.ride.c=null; return true; }); ok(A&&B&&await until(()=>{ const s=SCANNER.state()[0]; return s.ph!=='perch'||s.queue>0; },4000),'stepping off a train yourself starts a scan');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0].slice(0,200):''));
  await b.close(); process.exit(bad?1:0); })();
