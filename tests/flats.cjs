// THE FOUR SIZES OF FLAT (059a APTS.TIERS, 150d settle, 150n-callbox moveTo): node tests/flats.cjs [dist/market.html]. The small and the medium room are built to their size with their starter pieces, nothing standing in anything or outside the walls, their window and door the house's own; the big one is as it was; another house's door offers its flat, and moving in costs once and is kept.
const {chromium}=require('playwright'), path=require('path');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:900,height:620}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,200)));
  const fails=[], ok=(c,m)=>{ if(!c)fails.push(m); console.log((c?'ok  ':'FAIL')+' '+m); }, U='file://'+path.resolve(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13&npcwait=99&place=your%20apartment';
  const open=async q=>{ await pg.goto(U+q,{waitUntil:'commit',timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:400000});
    for(let i=0;i<300;i++){ if(await pg.evaluate(()=>!!(window.ROOMED&&ROOMED._api&&ROOMED._api()&&__dbg.MAPK.MODS.apts.inReal)).catch(()=>false))break; await pg.waitForTimeout(500); } await pg.waitForTimeout(6000);
    return pg.evaluate(()=>{ const A=ROOMED._api(), M=__dbg.MAPK.MODS.apts, here=A.units().filter(u=>!u.gone), a=A.R.apt.matrixWorld.clone().invert(), P=A.porch;
      const out=here.filter(u=>!u.loose).filter(u=>{ const B=A.unitBox(u.obj); if(B.isEmpty())return false; B.applyMatrix4(a); const cx=(B.min.x+B.max.x)/2, cz=(B.min.z+B.max.z)/2; return !(cx>-.1&&cx<A.Lx+.1&&cz>-.1&&cz<A.Ly+.1)&&!(P&&cz<0); }).map(u=>u.kind);
      return {tier:M.tier,mine:M.mine,Lx:+A.Lx.toFixed(2),Ly:+A.Ly.toFixed(2),here:[...new Set(here.map(u=>u.kind))],away:[...new Set(A.units().filter(u=>u.gone).map(u=>u.kind))],clips:ROOMED.clips(),out,wins:M.WIN.FWU.length,du:M.WIN.DU,n:M.TIERS[M.tier].n}; }); };
  let d=await open('&tier=0');
  ok(d.tier===0&&d.mine==='apts'&&d.Lx<5.2&&d.Ly<4.4,'the small room is No. 1\'s, built small ('+d.Lx+' by '+d.Ly+' m)');
  ok(['CRT TV','WRITING DESK','TABLE RADIO'].every(k=>d.here.includes(k))&&d.away.includes('FISH TANK')&&d.away.includes('TELESCOPE'),'it starts with the TV, the desk and the radio; the tank and the telescope wait in PUT AWAY');
  ok(!d.clips.length&&!d.out.length,'nothing stands in anything or outside its walls'+(d.clips.length||d.out.length?': '+JSON.stringify([d.clips,d.out]):''));
  ok(d.wins===1&&d.du>.9&&d.du<d.Lx/.907-.9,'one front window and the door, where the house has them');
  // another house's door: its flat at its price; no money, no move; with money it is paid once and kept
  const k=await pg.evaluate(async()=>{ const M=__dbg.MAPK.MODS.apts, T=__dbg.UI.things.find(t=>/^No\. 2/.test(t.name)); CALLBOX.noReload=true; T.act(); const txt=document.getElementById('callbox').textContent; INV.cash=100; const poor=M.moveTo(1), c0=INV.cash; INV.cash=3000; const r=M.moveTo(1); return {txt,poor,c0,r,cash:INV.cash,flat:M.flatState(),back:M.moveCost(0),again:M.moveCost(1),up:M.moveCost(2)}; });
  ok(/A MEDIUM ROOM/.test(k.txt)&&/MOVE IN FOR \$2,500/.test(k.txt),'No. 2\'s door offers a medium room for $2,500');
  ok(k.poor==='poor'&&k.c0===100,'without the money you stay');
  ok(k.r==='moved'&&k.cash===500&&k.flat&&k.flat.tier===1&&k.flat.top===1&&k.back===0&&k.again===0&&k.up===8000,'with it you move in: $2,500 paid once, kept with what you own; moving back is free, the next size $8,000 ('+JSON.stringify(k.flat)+')');
  d=await open('&tier=1');
  ok(d.tier===1&&d.mine==='house2'&&d.Lx>7&&d.Lx<8&&d.wins===2,'the medium room is No. 2\'s ('+d.Lx+' by '+d.Ly+' m, two windows)');
  ok(d.here.includes('FISH TANK')&&d.here.includes('RECLINER')&&d.away.includes('TELESCOPE')&&!d.clips.length&&!d.out.length,'it has the tank and the recliner too, all fitting: '+JSON.stringify({away:d.away,clips:d.clips,out:d.out}));
  await pg.evaluate(()=>{ localStorage.clear(); }); d=await open('');
  ok(d.tier===2&&d.mine==='house3'&&d.Lx>11&&!d.away.length&&!d.clips.length,'off the website the page keeps the big flat, every piece in it ('+d.Lx+' by '+d.Ly+' m)');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  await b.close(); console.log(fails.length?fails.length+' failed':'flats: all good'); process.exit(fails.length?1:0); })();
