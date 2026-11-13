// THE FOUR SIZES OF FLAT (059a APTS.TIERS, 150d settle, 150n-callbox moveTo): node tests/flats.cjs [dist/market.html]. The small and the medium room are built to their size with their starter pieces, nothing standing in anything or outside the walls, their window and door the house's own; the big one is as it was; another house's door offers its flat, and moving in costs once and is kept.
const {chromium}=require('playwright'), path=require('path');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:900,height:620}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,200)));
  const fails=[], ok=(c,m)=>{ if(!c)fails.push(m); console.log((c?'ok  ':'FAIL')+' '+m); }, U='file://'+path.resolve(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13&npcwait=99&place=your%20apartment';
  const open=async q=>{ await pg.goto(U+q,{waitUntil:'commit',timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:400000});
    for(let i=0;i<300;i++){ if(await pg.evaluate(()=>!!(window.ROOMED&&ROOMED._api&&ROOMED._api()&&__dbg.MAPK.MODS.apts.inReal)).catch(()=>false))break; await pg.waitForTimeout(500); } await pg.waitForTimeout(6000);
    return pg.evaluate(()=>{ const A=ROOMED._api(), M=__dbg.MAPK.MODS.apts, here=A.units().filter(u=>!u.gone), a=A.R.apt.matrixWorld.clone().invert(), P=A.porch;
      const out=here.filter(u=>!u.loose).filter(u=>{ const B=A.unitBox(u.obj); if(B.isEmpty())return false; B.applyMatrix4(a); const cx=(B.min.x+B.max.x)/2, cz=(B.min.z+B.max.z)/2; return !(cx>-.1&&cx<A.Lx+.1&&cz>-.1&&cz<A.Ly+.1)&&!(P&&cz<0); }).map(u=>u.kind);
      return {tier:M.tier,mine:M.mine,Lx:+A.Lx.toFixed(2),Ly:+A.Ly.toFixed(2),here:[...new Set(here.map(u=>u.kind))],away:[...new Set(A.units().filter(u=>u.gone).map(u=>u.kind))],clips:ROOMED.clips(),out,wins:M.WIN.FWU.length,du:M.WIN.DU,n:M.TIERS[M.tier].n,nan:(()=>{ let n=0; A.R.apt.traverse(o=>{ const P=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position; if(P&&P.array.some(Number.isNaN))n++; }); return n; })()}; }); };
  let d=await open('&tier=0');
  ok(d.tier===0&&d.mine==='apts'&&d.Lx<5.2&&d.Ly<4.4,'the small room, built small ('+d.Lx+' by '+d.Ly+' m)');
  ok(d.nan===0,'a room with one front window builds its walls whole: no NaN in any mesh ('+d.nan+' with NaN, '+d.wins+' window'+(d.wins===1?'':'s')+', 11 Nov 2026)');
  ok(['CRT TV','WRITING DESK','TABLE RADIO'].every(k=>d.here.includes(k))&&d.away.includes('FISH TANK')&&d.away.includes('TELESCOPE'),'it starts with the TV, the desk and the radio; the tank and the telescope wait in PUT AWAY');
  ok(!d.clips.length&&!d.out.length,'nothing stands in anything or outside its walls'+(d.clips.length||d.out.length?': '+JSON.stringify([d.clips,d.out]):''));
  ok(d.wins===1&&d.du>.9&&d.du<d.Lx/.907-.9,'one front window and the door, where the house has them');
  // one apartment house (owner, 12 Nov 2026: "only apartmenst in game are the biggest / lofts"): no other house's door offers a flat
  { const o=await pg.evaluate(()=>__dbg.UI.things.filter(t=>/^No\. [123] /.test(t.name)).map(t=>t.name)); ok(!o.length,'no other apartment house: the lofts are the only one (12 Nov 2026)'+(o.length?': '+o.join(', '):'')); }
  d=await open('&tier=1');
  ok(d.tier===1&&d.mine==='apts'&&d.Lx>7&&d.Lx<8&&d.wins===2,'the medium room ('+d.Lx+' by '+d.Ly+' m, two windows)');
  ok(d.here.includes('FISH TANK')&&d.here.includes('RECLINER')&&d.away.includes('TELESCOPE')&&!d.clips.length&&!d.out.length,'it has the tank and the recliner too, all fitting: '+JSON.stringify({away:d.away,clips:d.clips,out:d.out}));
  await pg.evaluate(()=>{ localStorage.clear(); }); d=await open('');
  ok(d.tier===3&&d.mine==='apts'&&d.Lx>11&&d.away.every(k=>k==='HANGING PLANT')&&!d.clips.length&&['g:sofa','g:red rug','g:round mirror'].every(k=>d.here.includes(k)),'everyone lives in the loft, laid out with its rugs and pictures, nothing hanging from the ceiling ('+d.Lx+' by '+d.Ly+' m; owner, 12 Nov 2026)');
  { const t=await pg.evaluate(()=>{ const M=__dbg.MAPK.MODS.apts; M.flatState=()=>({tier:0,top:0}); return M.tierOf(); }); ok(t===3,'everyone has the loft for now, whatever size they had (12 Nov 2026)'); }
  const hb=await pg.evaluate(async()=>{ const M=__dbg.MAPK.MODS.apts, B=document.getElementById('homebtn'), at=B.hidden; M.inReal=false; await new Promise(r=>setTimeout(r,1500)); const out=B.hidden; M.inReal=true; return {at,out}; });
  ok(hb.at===true&&hb.out===false,'HOME shows anywhere but in your own flat (owner, 12 Nov 2026)');
  await pg.evaluate(()=>{ localStorage.clear(); });
  d=await open('&tier=3');
  const lf=await pg.evaluate(async()=>{ const W=ms=>new Promise(r=>setTimeout(r,ms)), at=async p=>{ __dbg.UI.goTo(p[0],p[2],p[1]); await W(2500); const l=LOFTDBG(); return [+l.h.toFixed(2),l.up]; }, l=LOFTDBG(); return {HW:l.HW,MH:l.MH,top:await at(l.top),deck:await at(l.deck),foot:await at(l.foot),under:await at([l.deck[0],l.foot[1],l.deck[2]]),lights:ROOMED._api().lightsAll().filter(q=>/PENDANT/.test(q.name||'')).length}; });
  ok(d.tier===3&&d.mine==='apts'&&lf.HW>7&&!d.clips.length,'the loft: a tall room ('+lf.HW.toFixed(1)+' m), nothing standing in anything (owner, 12 Nov 2026)');
  const dc=await pg.evaluate(async()=>{ const A=ROOMED._api(), R=A.R, F=R.loft, W=ms=>new Promise(r=>setTimeout(r,ms)), un=A.units().find(u=>u.kind==='BOOKSHELF'&&!u.gone), t0=A.getT(un);
    const stair=ROOMED.fits(un,{...t0,u:(F.sx[0]+F.sx[1])/2+.3,v:F.sv0+.9,h:0}), off=ROOMED.fits(un,{...t0,u:2,v:5,h:F.MH}); ROOMED.toggle(); ROOMED.select(un); ROOMED.floorTo(true); const t1=A.getT(un), on=ROOMED.fits(un,t1); ROOMED.select(null); ROOMED.toggle();
    __dbg.UI.goTo(...(p=>[p.x,p.z,p.y])(A.W(F.mx+1,F.MH,2))); await W(2500); const sol=__dbg.MAPK.SHARED?0:0;
    A.wall('sage','Ww'); A.floor('slate',true); R.loftSet('steel','brass'); const L=ROOMED.snapshot(A);
    return {stair:stair.ok,why:stair.why,off:off.ok,h:t1.h,on:on.ok,u:t1.u,walls:L.walls,floor2:L.floor2,loft:L.loft,brick:R.walls.Wf,clips:ROOMED.clips().length}; });
  ok(!dc.stair&&/STAIR/.test(dc.why||'')&&!dc.off&&Math.abs(dc.h-lf.MH)<.01&&dc.on&&!dc.clips,'DECORATE in the loft: nothing stands in the stair, TO UPSTAIRS sets a piece on the upper floor where it fits: '+JSON.stringify(dc));
  ok(dc.brick==='brick'&&dc.walls.Ww==='sage'&&dc.floor2==='slate'&&dc.loft&&dc.loft.steel==='brass','each wall its own paper (the window wall starts in brick), the upper floor its own boards, the loft\'s steel, beams, woodwork and plaster their colours, all kept with the layout');
  ok(lf.top[0]>lf.MH-.05&&lf.top[1]&&lf.deck[0]>lf.MH-.05&&lf.deck[1]&&Math.abs(lf.foot[0])<.1&&!lf.foot[1]&&Math.abs(lf.under[0])<.1&&!lf.under[1],'its upper floor is walked: the landing and the deck hold you up there, under the deck you stand on the floor: '+JSON.stringify(lf));
  { const bk=await pg.evaluate(()=>{ const g=__scene.children.find(c=>c.name==='block'); return {inn:__dbg.MAPK.MODS.apts.inReal,vis:g&&g.visible}; }); ok(bk.inn&&bk.vis===false,'in your flat the park\'s backdrop trees are not drawn ('+JSON.stringify(bk)+')'); }
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  await b.close(); console.log(fails.length?fails.length+' failed':'flats: all good'); process.exit(fails.length?1:0); })();
