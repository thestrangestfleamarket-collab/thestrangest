// THE SCANNER CHECK: node tests/scanner.cjs [dist/market.html]. On the platform: two drones perch on things and float about; showing up books a scan ten to twenty seconds later; a scan comes (the drone flies over, a grid on the body, a sharp card), then the drone goes back to a perch; stepping off a train is showing up.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:900,height:560}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13&scanin=100'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2000);
  const idle=()=>pg.waitForFunction(()=>FADE.busy===0&&getComputedStyle(document.getElementById('subfade')).opacity==='0',null,{timeout:300000,polling:500}).catch(()=>{});
  await idle(); await pg.evaluate(()=>{ const p=SHARED.METRO.plat; __dbg.UI.goTo(p.x,p.z,'down'); }); await idle();   // (a fresh start is on the platform; ?scanin=100 holds the booked scan, since software rendering can take the game's 10 to 20 seconds before the first check)
  await pg.waitForFunction(()=>SCANNER.state&&SCANNER.state().length>=2,null,{timeout:60000}).catch(()=>{}); await pg.waitForTimeout(800);
  const S0=await pg.evaluate(()=>SCANNER.state().filter(d=>d.st==='A')); ok(S0.length===2&&S0.every(d=>d.ph==='perch'&&d.perch)&&S0[0].perch!==S0[1].perch,'two drones perch on the platform, each on its own thing ('+JSON.stringify(S0.map(d=>d.perch))+')');
  const B=await pg.evaluate(()=>{ const p=SCANNER.pending().find(t=>t.id==='me'); return p?{st:p.st,inS:+((p.due-Date.now())/1000).toFixed(1)}:null; }); ok(B&&B.st==='A'&&B.inS>0&&B.inS<=100,'showing up on the platform books your scan for later (the game: ten to twenty seconds) ('+JSON.stringify(B)+')');
  const Q=await pg.evaluate(()=>{ const P=__dbg.you(); return SCANNER.off('me','TEST',{x:P.x,y:SHARED.py,z:P.z}); }); ok(Q,'stepping off a train brings the scan forward');
  const until=async(f,ms,arg)=>{ for(let t=0;t<ms;t+=200){ if(await pg.evaluate(f,arg))return true; await pg.waitForTimeout(200); } return false; };
  ok(await until(()=>SCANNER.state().some(d=>d.ph==='scan'&&d.scan),30000),'a drone flies over and the grid scan shows');
  { const g=await pg.evaluate(()=>{ const d=SCANNER.list.find(d=>d.ph==='scan'); if(!d)return null; const L=[...LABELS.list].find(L=>L.on&&/SCANNING/.test(L.el.textContent)); return {ov:d.ov?d.ov.length:0,onBody:!!(d.ov&&d.ov.length&&d.ov.every(([m,o])=>o.parent===m)),box:d.S.children.some(c=>c.isMesh||c.isLineSegments),card:L?L.el.textContent:null,sprite:d.card.visible}; });
    ok(g&&g.ov>0&&g.onBody&&!g.box&&/SCANNING/.test(g.card||'')&&/CLEAR/.test(g.card||'')&&!g.sprite,'the scan is a grid drawn on the body itself (no box), and its card is sharp page text, not a picture in the scene: '+JSON.stringify(g)); }
  const D=await pg.evaluate(()=>{ const s=SCANNER.state().find(d=>d.ph==='scan'), P=__dbg.you(); return s?Math.hypot(s.at[0]-P.x,s.at[2]-P.z):99; }); ok(D<3,'it hovers close in front of the person ('+D.toFixed(2)+' away)');
  ok(await until(()=>SCANNER.state().some(d=>d.done===1&&d.ph==='perch'&&d.perch),60000),'then goes to a perch, one scan done');
  const P0=await pg.evaluate(()=>SCANNER.state().filter(d=>d.st==='A').map(d=>d.perch));
  ok(await until(P0=>{ const s=SCANNER.state().filter(d=>d.st==='A'); return s.some(d=>d.ph==='float')||s.some((d,i)=>d.ph==='perch'&&d.perch!==P0[i]); },150000,P0),'the drones float about and perch on other things ('+JSON.stringify(P0)+')');
  const back=await pg.evaluate(()=>{ SCANNER.DELAY=[.2,.5]; const P=__dbg.you(), tn=TRAINS.list[0], car=tn.cars[0]; TRAINS.ride.tn=tn; TRAINS.ride.c=car; __dbg.UI.goTo(car.p.x,car.p.z,'down'); return [P.x,P.z]; });
  await pg.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r))))); await pg.waitForTimeout(500); const aboard=await pg.evaluate(()=>!!TRAINS.ride.c);
  await pg.evaluate(([x,z])=>{ TRAINS.ride.c=TRAINS.ride.tn=null; __dbg.UI.goTo(x,z,'down'); },back); ok(aboard&&await until(()=>SCANNER.pending().some(t=>t.id==='me')||SCANNER.state().some(d=>d.ph==='scan'||d.next==='scan'),30000),'stepping off a train yourself is showing up again: a new scan');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0].slice(0,200):''));
  await b.close(); process.exit(bad?1:0); })();
