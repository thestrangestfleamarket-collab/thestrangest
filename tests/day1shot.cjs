// THE DAY 1 STATION (owner, 19 Oct 2026: "lets replace the subway station with the very 1st one with security drones, passport machine, etc."):
// walks from the sidewalk down the stairs (ENTERING SUBWAY), checks the level and the ground on the platform, looks at the platform from two angles, sends a subway-bound character, walks back up.
// Run: node tests/day1shot.cjs [out-dir]   (slow in a cloud container: software rendering, a few minutes)
const {chromium}=require('playwright'), out=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:1000,height:700}}), errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error'&&!/URL scheme "file"/.test(m.text()))errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=21'+(process.env.Q||'')); await pg.waitForFunction(()=>window.__started,null,{timeout:300000}); await pg.waitForTimeout(3000);
  const st=n=>pg.evaluate(n=>{ const D=__dbg, M=METRO, p=D.pos(); return {n,lvl:D.lvl(),pos:p.map(v=>+v.toFixed(2)),ground:+D.ground(p[0],p[2]).toFixed(2),onPlat:+(p[1]-M.DY).toFixed(2),tris:D.tris(),lamps:D.LITE.sel.length}; },n);
  const shot=async n=>{ await pg.screenshot({path:out+'/day1-'+n+'.png'}); console.log(JSON.stringify(await st(n))); };
  await pg.evaluate(()=>{ __dbg.UI.goPlace('THE SUBWAY STAIRS'); __dbg.cam(null,null,30); }); await pg.waitForTimeout(2500); await shot('street');
  const until=(f,ms=240000)=>pg.waitForFunction(f,null,{timeout:ms,polling:250}).then(()=>true,()=>false);
  await pg.evaluate(()=>{ const S=__dbg.MAPK.MAPSTAIR; __dbg.go(METRO.XC,(S.y0+1+77)*1.13); }); console.log('down the stairs',await until(()=>__dbg.lvl()==='down'&&!METRO.doorBusy())); await shot('arrived');
  await pg.evaluate(()=>{ const p=METRO.plat; __dbg.UI.goTo(p.x,p.z,'down'); __dbg.cam(null,null,30); }); await pg.waitForTimeout(2500); await shot('platform');
  await pg.keyboard.press('q'); await pg.waitForTimeout(2500); await shot('platform-q');
  console.log('cost',JSON.stringify(await pg.evaluate(()=>{ const D=__dbg, n=g=>{ let t=0; g.traverse(o=>{ if(o.isMesh&&o.geometry&&!o.isSkinnedMesh){ const G=o.geometry, c=G.index?G.index.count:G.attributes.position.count; t+=c/3; } }); return Math.round(t); };
    return {stationTris:n(D.MAPG.down),stairsTris:n(D.MAPG.stairs),drawCalls:D.info().calls,lampRecords:D.lamps.filter(L=>{ let o=L; while(o.parent&&o.parent!==D.scene)o=o.parent; return o===D.MAPG.down||o===D.MAPG.stairs; }).length,litNow:D.LITE.sel.length}; })));
  console.log('frame ms on the platform (software GL)',await pg.evaluate(()=>new Promise(r=>{ let n=0; const t=performance.now(); const f=()=>{ if(++n<30)requestAnimationFrame(f); else r(+((performance.now()-t)/30).toFixed(1)); }; requestAnimationFrame(f); })));
  await pg.evaluate(()=>{ const f=METRO.foot; __dbg.UI.goTo(f.x,f.z,'down'); __dbg.cam(null,null,30); }); await pg.waitForTimeout(1500); await shot('foot');
  await pg.evaluate(()=>{ const S=__dbg.MAPK.MAPSTAIR; __dbg.go(METRO.XC,(S.y1-.5+77)*1.13); }); console.log('up the stairs',await until(()=>__dbg.lvl()==='up'&&!METRO.doorBusy())); await shot('left');
  console.log('errors:',errs.length?errs.join(' | '):'none'); await b.close(); })();
