// THE CASTLE: in the park's north-west block, its moat one sheet of water, the drawbridge at the gate, its torches lit by night, no lamp or tree in its moat, the stair down still there: node tests/castle.cjs dist/market.html [outdir]
const {chromium}=require('playwright'), page=process.argv[2]||'dist/market.html', out=process.argv[3];
(async()=>{ const b=await chromium.launch({...(process.env.PWEXE?{executablePath:process.env.PWEXE}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1000,height:640}}); const errs=[];
  pg.on('pageerror',e=>{ errs.push(e.message); console.log('pageerror:',e.message); });
  await pg.goto('file://'+require('path').resolve(page)+'?fresh=1&npcwait=99&look=night&place=the castle',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<240;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started&&window.SITES&&SITES.ready&&window.PARKDBG).catch(()=>false))break; } await pg.waitForTimeout(4000);
  const R=await pg.evaluate(()=>{ const C=__dbg.MAPK.CASTLE, B=__dbg.MAPK.BOD, P=PARK, [bx0,bx1,by0,by1]=C.b, L=C.lot, segs=P.segs, inL=(x,y,m=0)=>x>L[0]-m&&x<L[1]+m&&y>L[2]-m&&y<L[3]+m;
    const water=[]; __scene.traverse(o=>{ if(o.name==='moat water')water.push(o); }); const ys=water.length?[...new Set(Array.from(water[0].geometry.attributes.position.array).filter((v,i)=>i%3===1).map(v=>v.toFixed(4)))]:[];
    const rects=SITES.moat.rects.map(([p,q])=>[B.MX(Math.min(p[0],q[0])),B.MX(Math.max(p[0],q[0])),B.MY(Math.min(p[2],q[2])),B.MY(Math.max(p[2],q[2]))]), front=rects.filter(r=>r[3]<by0).sort((a,c)=>a[0]-c[0]);
    const hoods=(P.hoods||[]).map(l=>[B.MX(l.position.x),B.MY(l.position.z),l.intensity,!!l.userData.torch]), lampsIn=hoods.filter(([x,y,,t])=>!t&&inL(x,y,.5)).length;
    const lampsWet=hoods.filter(([x,y,,t])=>!t&&P.pd(x,y)<.4).length, trees=PARKDBG().trees.filter(t=>inL(t[1],t[2],.5)).length;
    const ways=__dbg.MAPK.MODS&&window.LEVELS?LEVELS.ways.find(w=>w.id==='castle stairs'):null, S=C.stair;
    return {b:C.b,lot:L,gate:C.gate,segs:segs.length,water:water.length,levels:ys.length,rects:rects.length,gap:front.length===2?[front[0][1],front[1][0]]:null,lampsIn,lampsWet,trees,
      torches:__dbg.MAPK.MODS.castleTorches,lit:hoods.filter(h=>h[3]&&h[2]>0).length,stairIn:S.x0>bx0&&S.x1<bx1&&S.y0>by0&&S.y1<by1,ways:!!ways&&ways.stair===S,wall:P.x0,ways0:P.segs[0][0],cross:P.segs[1][1],y1:P.y1}; });
  console.log(JSON.stringify(R));
  const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)errs.push(m); };
  ok(R.lot[0]>R.wall+10&&R.lot[1]<R.ways0-7&&R.lot[2]>R.cross+7&&R.lot[3]<R.y1-10,'the castle and its moat stand in the north-west block, clear of the wall and the ways');
  ok(R.water===1&&R.levels===1,'the moat is one sheet of water at one level');
  ok(R.rects===5&&R.gap&&Math.abs((R.gap[0]+R.gap[1])/2-R.gate)<.01&&R.gap[1]-R.gap[0]<2,'the moat is crossed only at the gate, by a bridge as wide as the gate');
  ok(R.lampsIn===0,'no lamp post stands in the moat or on the castle');
  ok(R.lampsWet===0,'every lamp post stands beside a way, not on it');
  ok(R.trees===0,'no tree stands on the castle or its moat');
  ok(R.torches===6&&R.lit>=6,'the castle\'s six torches are lit by night');
  ok(R.stairIn&&R.ways,'the stair down to the dungeon is in the bailey and is the dungeon\'s way');
  const D=await pg.evaluate(async()=>{ const a=__dbg.MAPK.MODS.dungeon.arrive(1); __dbg.UI.goTo(a.x,a.z,'down'); await new Promise(f=>setTimeout(f,6000)); return {lvl:__dbg.lvl()}; }).catch(e=>({err:String(e)}));
  ok(D.lvl==='down','the dungeon under it still opens ('+JSON.stringify(D)+')');
  await b.close(); if(errs.length){ console.log('FAIL',errs.join(' | ')); process.exit(1); } console.log('ok'); })();
