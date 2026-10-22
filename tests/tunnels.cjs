// THE SUBWAY TUNNELS: both tunnels leave the station each way, are walkable at track level, their walls stop you, and their ends are seams to the next sections.
// Run: node tests/tunnels.cjs   (slow in a cloud container: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:800,height:450}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=21&view=first'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2000);
  const idle=()=>pg.waitForFunction(()=>FADE.busy===0&&getComputedStyle(document.getElementById('subfade')).opacity==='0',null,{timeout:300000,polling:500}).catch(()=>{});
  await pg.evaluate(()=>{ const p=METRO.plat; __dbg.UI.goTo(p.x,p.z,'down'); }); await idle(); await pg.waitForTimeout(3000); await idle();
  const info=await pg.evaluate(()=>({n:METRO.tunnels.length,seams:METRO.seams.map(s=>s.edge+':'+s.to+':'+s.ends.length),track:METRO.Y(-98-32)}));
  ok(info.n===8,'the tunnels are 8 pieces: east and west for each track, the west pair turning north ('+info.n+')');
  ok(info.seams.join()==='east:C:2,north:B:2','both tunnel pairs end at a seam to the next section ('+info.seams.join()+')');
  const walk=async(x,y,yaw,ms)=>{ await pg.evaluate(([x,y,yaw])=>{ const p=METRO.at(x,y); __dbg.UI.goTo(p.x,p.z,'down'); __dbg.cam(yaw); },[x,y,yaw]); await idle(); await pg.waitForTimeout(1500);
    const a=await pg.evaluate(()=>__dbg.pos()); await pg.keyboard.down('w'); await pg.waitForTimeout(ms); await pg.keyboard.up('w'); await pg.waitForTimeout(500);
    return pg.evaluate(a=>{ const p=__dbg.pos(); return {moved:Math.hypot(p[0]-a[0],p[2]-a[2]),y:p[1],lvl:__dbg.lvl(),tx:METRO.TX(p[0],p[2]),ty:METRO.TY(p[0],p[2])}; },a); };
  const e=await walk(19.6,80,-Math.PI/2,5000); ok(e.lvl==='down'&&Math.abs(e.y-info.track)<.05&&e.moved>.5,'the east tunnel is walkable at track level ('+JSON.stringify(e)+')');
  const w=await walk(2.2,-80,Math.PI/2,5000); ok(w.lvl==='down'&&Math.abs(w.y-info.track)<.05&&w.moved>.5,'the west tunnel is walkable round its curve ('+JSON.stringify(w)+')');
  const s=await walk(19.6,60,0,4000); ok(s.tx<21.8,'a tunnel wall stops you ('+s.tx.toFixed(2)+')');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all tunnel checks passed'); await b.close(); process.exit(bad?1:0); })();
