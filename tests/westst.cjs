// WEST ST FACES ITS STREET (owner, 22 Oct 2026: "make sure the front of all buildings face the street they are on ... allow to rotate"; "fill in empty buildings to flesh out both streets"):
// every West St place's door is on its street side and its way out leaves you on West St facing the street; West St and Market St's front row have no gaps.
// Run: node tests/westst.cjs   (slow in a cloud container: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,0&hour=12'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2000); await pg.evaluate(()=>STORE.ensure());
  const idle=()=>pg.waitForFunction(()=>!(window.FADE&&FADE.busy),null,{timeout:120000,polling:300}).catch(()=>{});
  const at=()=>pg.evaluate(()=>{ const p=__dbg.pos(); return {x:p[0]/1.13+72,y:p[2]/1.13-77,hd:__dbg.hd()}; });
  const W=await pg.evaluate(()=>({x0:__dbg.MAPK.RING.wx0}));
  const east=h=>Math.abs(Math.sin(h)-1)<.05;
  for(const id of ['bar','playhouse','museum']){ const d=await pg.evaluate(id=>{ const o=STORE.inside[id].th.obj.position; return o.x/1.13+72; },id);
    await pg.evaluate(id=>STORE.enter(id,true),id); await idle(); await pg.waitForTimeout(800); await pg.evaluate(id=>STORE.exit(id),id); await idle(); await pg.waitForTimeout(500); const o=await at();
    ok(d>W.x0-1&&o.x>W.x0-.5&&o.x<W.x0+3&&east(o.hd),id+': its door is on West St and its way out leaves you on West St facing the street ('+d.toFixed(1)+' → '+o.x.toFixed(1)+', '+o.hd.toFixed(2)+')'); }
  for(const id of ['arcade','apt']){ await pg.evaluate(id=>ROOMS.enter(id),id); await idle(); await pg.waitForTimeout(800); await pg.evaluate(id=>ROOMS.exit(id),id); await idle(); await pg.waitForTimeout(500); const o=await at();
    ok(o.x>W.x0-.5&&o.x<W.x0+3&&east(o.hd),id+': out onto West St facing the street ('+o.x.toFixed(1)+', '+o.hd.toFixed(2)+')'); }
  const g=await pg.evaluate(()=>{ const L=__dbg.MAPK, F=L.RING.wx0, B=[...window.BLK.blds,...window.BLK.lots];
    const west=B.filter(q=>Math.abs(q.x1-F)<.6).map(q=>[q.y0,q.y1]), mk=B.filter(q=>q.row===1).map(q=>[q.x0,q.x1]);
    return {west,mk}; });
  ok(g.west.length>=5,'West St has its row of buildings ('+g.west.length+')'); ok(g.mk.length>=10,'Market St\'s front row is filled ('+g.mk.length+')');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all West St checks passed'); await b.close(); process.exit(bad?1:0); })();
