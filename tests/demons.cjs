// THE SUBWAY'S DEMONS AND ITS BUSKER: node tests/demons.cjs [dist/market.html] [shots dir]. On the platform's far corner by the route map the octopus in the cowboy hat loops the hardest piece in the book and says Gracias for a tip; down on the tracks a demon turns up, runs from you, and blows up only when cornered (it hurts, never kills); the freeze ray's ice makes one a block you carry; the demon drop box pays for it, or TAMING 1 makes it a pet; a kept block thaws and the demon is out.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:900,height:560}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; }, J=JSON.stringify;
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2500);
  const idle=()=>pg.waitForFunction(()=>FADE.busy===0&&getComputedStyle(document.getElementById('subfade')).opacity==='0',null,{timeout:300000,polling:500}).catch(()=>{});
  const until=(fn,arg,ms=120000)=>pg.waitForFunction(fn,arg,{timeout:ms,polling:300}).catch(()=>{});
  await idle(); await pg.evaluate(()=>{ const p=SHARED.METRO.at(9.6,24.5); __dbg.UI.goTo(p.x,p.z,'down'); }); await idle(); await pg.waitForTimeout(2500);
  const O=await pg.evaluate(()=>{ const o=OCTODBG(), T=SHARED.METRO; return {...o,tx:+T.TX(o.x,o.z).toFixed(1),ty:+T.TY(o.x,o.z).toFixed(1),size:OCTOBUSK.N.size}; });
  ok(O&&O.vis&&O.ty>26&&Math.abs(O.size-1.05)<.01,'the octopus busker stands in the far corner by the route map, a quarter smaller ('+J(O)+')');
  await until(()=>!!OCTODBG().song);
  const S=await pg.evaluate(()=>{ const B=GUITAR.BOOK, top=Math.max(...B.map(t=>t.lvl||0)); return {song:OCTODBG().song,lvl:(B.find(t=>t.name===OCTODBG().song)||{}).lvl,top}; });
  ok(!!S.song&&S.lvl===S.top,'he plays the hardest piece in the book ('+J(S)+')');
  const C=await pg.evaluate(()=>{ const th=__dbg.UI.things.find(t=>/GUITAR CASE/.test(t.name)), c0=INV.cash; th.act(); return {paid:c0-INV.cash,said:(__dbg.LINES.log.slice(-1)[0]||{}).text}; });
  ok(C.paid===1&&/Gracias/.test(J(C.said)),'a $1 tip in his case and he says Gracias ('+J(C)+')');
  // down on the track bed: a demon turns up out in the dark, keeps off the platform, and runs from you
  await pg.evaluate(()=>{ const p=SHARED.METRO.at(2.2,10); __dbg.UI.goTo(p.x,p.z,'down'); }); await idle(); await pg.waitForTimeout(2000);
  const D0=await pg.evaluate(()=>{ const m=DEMONS.T.me(), d=DEMONDBG().spawn(); return d?{id:d.id,r:Math.hypot(d.x-m.x,d.z-m.z),track:DEMONS.T.onTrack(d.x,d.z),onMe:DEMONS.T.onTrack(m.x,m.z,0)}:null; });
  ok(D0&&D0.track&&D0.onMe,'a demon turns up down on the tracks, not the platform ('+J(D0)+')');
  const gd=id=>pg.evaluate(id=>{ const d=DEMONS.list.find(d=>d.id===id), m=DEMONS.T.me(); return d?{state:d.state,r:Math.hypot(d.x-m.x,d.z-m.z),x:d.x,z:d.z,track:DEMONS.T.onTrack(d.x,d.z),blk:d.blk.visible}:null; },id);
  const r0=await pg.evaluate(id=>{ const d=DEMONS.list.find(d=>d.id===id), m=DEMONS.T.me(), M=DEMONS.T.M, q=DEMONS.T.trackNear(2.5*M,3.5*M); if(q){ d.x=q.x; d.z=q.z; d.hx=q.x; d.hz=q.z; } return Math.hypot(d.x-m.x,d.z-m.z); },D0.id);
  await until(([id,r0])=>{ const d=DEMONS.list.find(d=>d.id===id), m=DEMONS.T.me(); return d&&Math.hypot(d.x-m.x,d.z-m.z)>r0+1.5*DEMONS.T.M; },[D0.id,r0],90000);
  const D1=await gd(D0.id); ok(D1&&D1.r>r0+1&&D1.track&&D1.state==='flee','it runs away from you, staying on the tracks ('+J({r0,...D1})+')');
  await pg.evaluate(id=>{ DEMONS.list.find(d=>d.id===id).frozen=4; },D0.id); await pg.waitForTimeout(600);
  const F=await gd(D0.id); ok(F&&F.state==='ice'&&F.blk,'the freeze ray\'s ice locks it in a block ('+J(F)+')');
  const P=await pg.evaluate(id=>{ DEMONS.list.find(d=>d.id===id).th.act(); return {bag:INV.items.demon_ice||0,left:DEMONS.list.some(x=>x.id===id)}; },D0.id);
  ok(P.bag===1&&!P.left,'picked up, it is in your bag ('+J(P)+')');
  const H=await pg.evaluate(()=>{ const th=__dbg.UI.things.find(t=>/DEMON DROP BOX/.test(t.name)); const c0=INV.cash; th.act(); return {box:!!th,office:__dbg.UI.things.some(t=>/SECURITY OFFICE/.test(t.name)),paid:INV.cash-c0,bag:INV.items.demon_ice||0,want:DEMONS.BOUNTY}; });
  ok(H.box&&!H.office&&H.paid===H.want&&H.bag===0,'the demon drop box (no security office) pays the bounty for it ('+J(H)+')');
  // tamed: not below TAMING 1; with it, the frozen demon you carry becomes one of your pets
  const TM=await pg.evaluate(async()=>{ FORAGE.give('demon_ice',1); DEMONS.T.BAG.push(60); const S=FORAGE.S, n0=PETS.list().length; S.sk.tame=0; await FORAGE.ACT.demontame(); const no={bag:INV.items.demon_ice||0,pets:PETS.list().length-n0};
    S.sk.tame=10; await FORAGE.ACT.demontame(); const r=PETS.list()[PETS.list().length-1]; return {no,bag:INV.items.demon_ice||0,pets:PETS.list().length-n0,kind:r&&PETS.decode(r.c).k}; });
  ok(TM.no.bag===1&&TM.no.pets===0&&TM.bag===0&&TM.pets===1&&TM.kind==='demon','TAMING 1 tames a frozen demon into a pet, less does not ('+J(TM)+')');
  const T=await pg.evaluate(async()=>{ FORAGE.give('demon_ice',1); DEMONS.T.BAG.push(.5); const n0=DEMONS.list.length; for(let i=0;i<200&&INV.items.demon_ice;i++)await new Promise(r=>setTimeout(r,300)); const d=DEMONS.list[DEMONS.list.length-1]; return {bag:INV.items.demon_ice||0,out:DEMONS.list.length-n0,track:!!d&&DEMONS.T.onTrack(d.x,d.z)}; });
  ok(T.bag===0&&T.out===1&&T.track,'a block kept too long thaws and the demon is out, down on the tracks ('+J(T)+')');
  await pg.evaluate(()=>{ for(const d of [...DEMONS.list])d.g.removeFromParent(); DEMONS.list.length=0; });
  // cornered at the end of its stretch, close to you: it blows up; it hurts, you live
  const B=await pg.evaluate(async()=>{ __dbg.VIT.hp=.15; const M=DEMONS.T.M, m=DEMONS.T.me(), q=DEMONS.T.trackNear(.9*M,1.3*M); if(!q)return {none:true}; const d=DEMONS.T.spawn(q.x,q.z); const r=Math.hypot(q.x-m.x,q.z-m.z), ux=(q.x-m.x)/r, uz=(q.z-m.z)/r, H=24.95*M; d.hx=q.x-ux*H; d.hz=q.z-uz*H; d.t=.01;
    for(let i=0;i<300&&DEMONS.list.includes(d);i++)await new Promise(r=>setTimeout(r,300)); const e=DEMONS.T.me(); return {hp:e.hp,dead:e.dead,gone:!DEMONS.list.includes(d)}; });
  ok(B.gone&&B.hp<.15&&B.hp>0&&!B.dead,'one you corner blows up: it hurts, you live ('+J(B)+')');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0].slice(0,300):''));
  await b.close(); process.exit(bad?1:0); })();
