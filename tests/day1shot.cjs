// THE DAY 1 STATION (owner, 19 Oct 2026: "lets replace the subway station with the very 1st one with security drones, passport machine, etc."):
// walks from the sidewalk down the stairs (ENTERING SUBWAY), checks the level and the ground on the platform, waits for the two security drones
// to lift off the passport machine, scan and go back, looks at the platform from two angles, sends a subway-bound character, walks back up.
// Run: node tests/day1shot.cjs [out-dir]   (slow in a cloud container: software rendering, a few minutes)
const {chromium}=require('playwright'), out=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:1000,height:700}}), errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error'&&!/URL scheme "file"/.test(m.text()))errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=21'+(process.env.Q||'')); await pg.waitForFunction(()=>window.__started,null,{timeout:300000}); await pg.waitForTimeout(3000);
  const st=n=>pg.evaluate(n=>{ const D=__dbg, M=METRO, p=D.pos(); return {n,lvl:D.lvl(),pos:p.map(v=>+v.toFixed(2)),ground:+D.ground(p[0],p[2]).toFixed(2),onPlat:+(p[1]-M.DY).toFixed(2),tris:D.tris(),lamps:D.LITE.sel.length,drones:M.drones.map(d=>d.st)}; },n);
  const shot=async n=>{ await pg.screenshot({path:out+'/day1-'+n+'.png'}); console.log(JSON.stringify(await st(n))); };
  await pg.evaluate(()=>{ __dbg.UI.goPlace('THE SUBWAY STAIRS'); __dbg.cam(null,null,30); }); await pg.waitForTimeout(2500); await shot('street');
  const until=(f,ms=240000)=>pg.waitForFunction(f,null,{timeout:ms,polling:250}).then(()=>true,()=>false);
  await pg.evaluate(()=>{ const S=__dbg.MAPK.MAPSTAIR; __dbg.go(METRO.XC,(S.y0+1+77)*1.13); }); console.log('down the stairs',await until(()=>__dbg.lvl()==='down'&&!METRO.doorBusy())); await shot('arrived');
  console.log('drones scan',await until(()=>METRO.drones[0].st==='scan'&&METRO.drones[0].t>1.2)); await shot('scan');
  console.log('drone thanks',await until(()=>METRO.drones[0].st==='say'&&METRO.drones[0].t>1.2)); await shot('thanks');
  console.log('drones home',await until(()=>METRO.drones.every(d=>d.st==='perch'))); await shot('home');
  await pg.evaluate(()=>{ const p=METRO.plat; __dbg.UI.goTo(p.x,p.z,'down'); __dbg.cam(null,null,30); }); await pg.waitForTimeout(2500); await shot('platform');
  await pg.keyboard.press('q'); await pg.waitForTimeout(2500); await shot('platform-q');
  console.log('cost',JSON.stringify(await pg.evaluate(()=>{ const D=__dbg, n=g=>{ let t=0; g.traverse(o=>{ if(o.isMesh&&o.geometry&&!o.isSkinnedMesh){ const G=o.geometry, c=G.index?G.index.count:G.attributes.position.count; t+=c/3; } }); return Math.round(t); }, dr=METRO.drones.reduce((a,d)=>a+n(d.g),0);
    return {stationTris:n(D.MAPG.down)-dr,stairsTris:n(D.MAPG.stairs),droneTris:dr,drawCalls:D.info().calls,lampRecords:D.lamps.filter(L=>{ let o=L; while(o.parent&&o.parent!==D.scene)o=o.parent; return o===D.MAPG.down||o===D.MAPG.stairs; }).length,litNow:D.LITE.sel.length}; })));
  console.log('frame ms on the platform (software GL)',await pg.evaluate(()=>new Promise(r=>{ let n=0; const t=performance.now(); const f=()=>{ if(++n<30)requestAnimationFrame(f); else r(+((performance.now()-t)/30).toFixed(1)); }; requestAnimationFrame(f); })));
  const who=await pg.evaluate(()=>{ const N=__dbg.NPCS.find(n=>n.life&&n.lv==='up'); if(!N)return null; const S=__dbg.MAPK.MAPSTAIR; N.st.x=METRO.XC+1; N.st.z=(S.y1+3+77)*1.13; __dbg.LIVES.send(N.key,'subway'); return N.key; });
  console.log('sent to the subway',who,await until(()=>{ const N=__dbg.NPCS.find(n=>n.life&&n.life.to==='subway'||n.life&&n.life.at==='subway'); return N&&N.lv==='down'&&Math.abs(N.g.position.y-METRO.DY)<.2; },300000),JSON.stringify(await pg.evaluate(()=>__dbg.LIVES.dbg().filter(d=>d.lv==='down'))));
  await pg.evaluate(()=>{ const f=METRO.foot; __dbg.UI.goTo(f.x,f.z,'down'); __dbg.cam(null,null,30); }); await pg.waitForTimeout(1500); await shot('foot');
  await pg.evaluate(()=>{ const S=__dbg.MAPK.MAPSTAIR; __dbg.go(METRO.XC,(S.y1-.5+77)*1.13); }); console.log('up the stairs',await until(()=>__dbg.lvl()==='up'&&!METRO.doorBusy())); await shot('left');
  console.log('errors:',errs.length?errs.join(' | '):'none'); await b.close(); })();
