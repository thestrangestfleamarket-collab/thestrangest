// THE SUBWAY'S DEMONS AND ITS BUSKER: node tests/demons.cjs [dist/market.html] [shots dir]. On the platform: the octopus in the cowboy hat plays a piece from the book; a demon climbs out of the tracks and runs at you; the freeze ray's ice makes one a block you carry; the security office pays for it; a kept block thaws and the demon is out; one that reaches you blows up (it hurts, never kills).
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:900,height:560}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; }, shots=process.argv[3], J=JSON.stringify;
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2500);
  const idle=()=>pg.waitForFunction(()=>FADE.busy===0&&getComputedStyle(document.getElementById('subfade')).opacity==='0',null,{timeout:300000,polling:500}).catch(()=>{});
  const face=(x,z)=>pg.evaluate(([x,z])=>{ const m=__dbg.you(); __dbg.setHd(Math.atan2(x-m.x,z-m.z)); __dbg.face(Math.atan2(x-m.x,z-m.z)+Math.PI); },[x,z]);
const until=(fn,arg,ms=120000)=>pg.waitForFunction(fn,arg,{timeout:ms,polling:300}).catch(()=>{});
  await idle(); await pg.evaluate(()=>{ const p=SHARED.METRO.at(9.4,16.6); __dbg.UI.goTo(p.x,p.z,'down'); }); await idle(); await pg.waitForTimeout(2500);
  const O=await pg.evaluate(()=>OCTODBG()); ok(O&&O.vis&&O.tris>0,'the octopus busker stands on the platform ('+J(O)+')');
  await pg.evaluate(()=>__dbg.UI.setView('third')); await face(O.x,O.z); await pg.waitForTimeout(4000);
  await until(()=>!!OCTODBG().song); if(shots)await pg.screenshot({path:shots+'/octobusk.png'});
  const S=await pg.evaluate(()=>OCTODBG().song); ok(!!S,'he plays a piece from the book ('+S+')');
  const D0=await pg.evaluate(()=>{ const d=DEMONDBG().spawn(), m=DEMONS.T.me(); return d?{id:d.id,r:Math.hypot(d.x-m.x,d.z-m.z)}:null; }); ok(!!D0,'a demon climbs out of the tracks ('+J(D0)+')');
  await until(id=>{ const d=DEMONS.list.find(d=>d.id===id); return d&&d.state==='run'&&d.t>1.5; },D0&&D0.id);
  const gd=id=>pg.evaluate(id=>{ const d=DEMONS.list.find(d=>d.id===id), m=DEMONS.T.me(); return d?{state:d.state,r:Math.hypot(d.x-m.x,d.z-m.z),x:d.x,z:d.z,blk:d.blk.visible,name:d.th.name}:null; },id);
  const D1=await gd(D0.id); ok(D1&&D1.state!=='climb'&&D1.r<D0.r,'it runs at you ('+J(D1)+')');
  await pg.evaluate(id=>{ DEMONS.list.find(d=>d.id===id).frozen=4; },D0.id); await pg.waitForTimeout(600);
  const F=await gd(D0.id); ok(F&&F.state==='ice'&&F.blk,'the freeze ray\'s ice locks it in a block ('+J(F)+')');
  if(shots){ await face(F.x,F.z); await pg.waitForTimeout(1500); await pg.screenshot({path:shots+'/demon-ice.png'}); }
  const P=await pg.evaluate(id=>{ DEMONS.list.find(d=>d.id===id).th.act(); return {bag:INV.items.demon_ice||0,left:DEMONS.list.some(x=>x.id===id)}; },D0.id);
  ok(P.bag===1&&!P.left,'picked up, it is in your bag ('+J(P)+')');
  const H=await pg.evaluate(()=>{ const th=__dbg.UI.things.find(t=>/SECURITY OFFICE/.test(t.name)); const c0=INV.cash; th.act(); return {office:!!th,paid:INV.cash-c0,bag:INV.items.demon_ice||0,want:DEMONS.BOUNTY}; });
  ok(H.office&&H.paid===H.want&&H.bag===0,'the security office pays the bounty for it ('+J(H)+')');
  const T=await pg.evaluate(async()=>{ FORAGE.give('demon_ice',1); DEMONS.T.BAG.push(.5); const n0=DEMONS.list.length; for(let i=0;i<200&&INV.items.demon_ice;i++)await new Promise(r=>setTimeout(r,300)); return {bag:INV.items.demon_ice||0,out:DEMONS.list.length-n0}; });
  ok(T.bag===0&&T.out===1,'a block kept too long thaws and the demon is out ('+J(T)+')');
  await pg.evaluate(()=>{ for(const d of [...DEMONS.list])d.g.removeFromParent(); DEMONS.list.length=0; });
  const B=await pg.evaluate(async()=>{ __dbg.VIT.hp=.15; const m=DEMONS.T.me(), d=DEMONS.T.spawn(m.x+.5*SHARED.TILE_||m.x,m.z,'run'); d.x=m.x+.4; d.z=m.z; d.t=.01; for(let i=0;i<300&&DEMONS.list.includes(d);i++)await new Promise(r=>setTimeout(r,300)); const e=DEMONS.T.me(); return {hp:e.hp,dead:e.dead,gone:!DEMONS.list.includes(d)}; });
  ok(B.gone&&B.hp<.15&&B.hp>0&&!B.dead,'one that reaches you blows up: it hurts, you live ('+J(B)+')');
  if(shots){ await pg.evaluate(()=>{ __dbg.VIT.hp=1; const p=SHARED.METRO.at(10.9,22); __dbg.UI.goTo(p.x,p.z,'down'); }); await idle(); await pg.waitForTimeout(1500); const o=await pg.evaluate(()=>({x:DEMONS.office.x,z:DEMONS.office.z})); await face(o.x,o.z); await pg.waitForTimeout(2500); await pg.screenshot({path:shots+'/office.png'});
    await pg.evaluate(()=>{ const m=DEMONS.T.me(); const d=DEMONS.T.spawn(m.x,m.z,'run'); d.t=-100; d.x=m.x+Math.sin(__dbg.hd())*1.6; d.z=m.z+Math.cos(__dbg.hd())*1.6; }); await pg.waitForTimeout(4000); await pg.screenshot({path:shots+'/demon.png'}); }
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0].slice(0,300):''));
  await b.close(); process.exit(bad?1:0); })();
