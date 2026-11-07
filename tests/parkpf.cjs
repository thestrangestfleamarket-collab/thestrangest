// THE PARK'S POLYFORK THINGS (owner, 7 Nov 2026: "add all of them into central park"; "make sure things will render as fast as possible"): every p: thing in
// data/world.json is baked into patch meshes, only the near ones drawn, shadows only close by, boats on the water, the paths left walkable; the big lake runs
// past the forcefield and the brook leaves it. Run: node tests/parkpf.cjs (slow: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({executablePath:process.env.PWC||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000});
  await pg.evaluate(()=>__dbg.UI.goTo(SHARED.BOD.XS(112),SHARED.BOD.ZS(12),'up'));
  await pg.waitForFunction(()=>window.PARKPFDBG&&PARKPFDBG().done,null,{timeout:240000}).catch(()=>{}); await pg.waitForTimeout(1500);
  const d=await pg.evaluate(()=>({...PARKPFDBG(),...PARKPFCHK()}));
  ok(d.done,'the park\'s Polyfork things are built');
  ok(d.skipped.length<=2,'all but at most two of the '+d.want+' things stand ('+d.things+'; skipped: '+d.skipped.join(', ')+')');
  ok(d.patches<130&&d.tris<600000,'baked into '+d.patches+' patch meshes, '+d.tris+' triangles in all');
  ok(d.drawn<d.tris*.4&&d.hid>d.patches/2,'only the near patches are drawn ('+d.drawn+' triangles, '+d.hid+' of '+d.patches+' patches hidden)');
  ok(d.shadow<=12,'shadows only from the big patches close by ('+d.shadow+')');
  ok(d.solids>=20&&d.mallBlocked===0,'the big pieces are solid ('+d.solids+') and the Mall is clear to walk');
  ok(d.boats>=4,'the boats and ducks are on the big lake ('+d.boats+')');
  ok(d.past[0]&&d.past[1],'the big lake runs past the park\'s edge');
  ok(d.brookStart<12,'the brook starts at the big lake, its course run on to the water ('+d.brookStart.toFixed(2)+' tiles from its water)');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all park Polyfork checks passed'); await b.close(); process.exit(bad?1:0); })();
