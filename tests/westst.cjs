// EVERY BUILDING FACES ITS STREET (owner, 22 Oct 2026: "make sure the front of all buildings face the street they are on"; only Market St, 7 Nov 2026):
// your flat's way out leaves you on Market St (the park side), the theatre's on the promenade (the river side); West St has no buildings and no filler; no garages between the rows' buildings.
// Run: node tests/westst.cjs   (slow in a cloud container: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,0&hour=12'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2000); await pg.evaluate(()=>STORE.ensure());
  const idle=()=>pg.waitForFunction(()=>!(window.FADE&&FADE.busy),null,{timeout:120000,polling:300}).catch(()=>{});
  const at=()=>pg.evaluate(()=>{ const p=__dbg.pos(), B=__dbg.MAPK.BOD; return {x:p[0]/1.13+B.OX,y:p[2]/1.13+B.OY}; });
  const WJ=JSON.parse(require('fs').readFileSync(process.cwd()+'/data/world.json','utf8')), L={front:WJ.block.front,row2:WJ.block.backrow,wx:WJ.streets.west.x0};
  await pg.evaluate(()=>__dbg.MAPK.MODS.apts.enterReal()); await idle(); await pg.waitForTimeout(800); await pg.evaluate(()=>__dbg.MAPK.MODS.apts.exitReal()); await idle(); await pg.waitForTimeout(500);
  { const o=await at(); ok(o.y>L.front-.5&&o.y<L.front+8,'your flat: out onto Market St\'s sidewalk, the park side ('+o.x.toFixed(1)+', '+o.y.toFixed(1)+')'); }
  if(await pg.evaluate(()=>!!STORE.inside.theatre)){ await pg.evaluate(()=>STORE.enter('theatre',true)); await idle(); await pg.waitForTimeout(800); await pg.evaluate(()=>STORE.exit('theatre')); await idle(); await pg.waitForTimeout(500);
  { const o=await at(); ok(o.y<L.row2[0]+.5&&o.y>L.row2[0]-8,'the theatre: out onto the promenade, the river side ('+o.x.toFixed(1)+', '+o.y.toFixed(1)+')'); } }
  const g=await pg.evaluate(wx=>{ const B=[...window.BLK.blds,...window.BLK.lots]; return {west:B.filter(q=>q.row===5).length,inside:B.filter(q=>q.row===1&&q.x1>wx+.1).length,pf:PFROWDBG().houses}; },L.wx);
  ok(g.west===0&&g.pf===0,'West St: no buildings, no filler ('+JSON.stringify(g)+')'); ok(g.inside===0,'no garages between Market St\'s buildings ('+g.inside+')');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all street-facing checks passed'); await b.close(); process.exit(bad?1:0); })();
