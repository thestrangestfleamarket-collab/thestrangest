// WEST ST FACES ITS STREET (owner, 22 Oct 2026: "make sure the front of all buildings face the street they are on ... allow to rotate"; "fill in empty buildings to flesh out both streets"):
// your apartment house's way out leaves you on West St facing the street, the bar's on the Hudson row before its door; West St has no filler lots and Market St's row its garages.
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
  // the bar is on the Hudson row (6 Nov 2026), its inside a cellar off the map (7 Nov 2026): out of it you stand at its street door facing out
  { const P=await pg.evaluate(()=>{ const D=STORE.streetDoor.bar; return D?{x:SHARED.BOD.X(D.out[0]),z:SHARED.BOD.Z(D.out[1]),hd:D.out[2]}:null; });
    await pg.evaluate(()=>STORE.enter('bar',true)); await idle(); await pg.waitForTimeout(800); await pg.evaluate(()=>STORE.exit('bar')); await idle(); await pg.waitForTimeout(500);
    const o=await pg.evaluate(()=>{ const p=__dbg.pos(); return {x:p[0],z:p[2],hd:__dbg.hd()}; }), d=P?Math.hypot(o.x-P.x,o.z-P.z):1e9, dh=P?Math.abs(Math.atan2(Math.sin(o.hd-P.hd),Math.cos(o.hd-P.hd))):9;
    ok(d<1.5&&dh<.1,'bar: out of it you stand before its door on the Hudson row, facing out ('+d.toFixed(2)+' from its way out, '+dh.toFixed(2)+' off)'); }
  for(const id of ['apt']){ await pg.evaluate(()=>__dbg.MAPK.MODS.apts.enterReal()); await idle(); await pg.waitForTimeout(800); await pg.evaluate(()=>__dbg.MAPK.MODS.apts.exitReal()); await idle(); await pg.waitForTimeout(500); const o=await at();
    ok(o.x>W.x0-.5&&o.x<W.x0+3&&east(o.hd),id+': out onto West St facing the street ('+o.x.toFixed(1)+', '+o.hd.toFixed(2)+')'); }
  const g=await pg.evaluate(()=>{ const L=__dbg.MAPK, F=L.RING.wx0, B=[...window.BLK.blds,...window.BLK.lots], P=L.LEVEL?L.LEVEL.places:[];
    const west=B.filter(q=>q.row===5).map(q=>[q.y0,q.y1]), mk=B.filter(q=>q.row===1).map(q=>[q.x0,q.x1]), pf=window.PFROWDBG?PFROWDBG():null;   // row 5 is West St's filler row; Market St's last garage ends at the corner
    return {west,mk,pf}; });
  ok(g.west.length===0,'West St is apartment houses only, no filler lots (owner, 5 Nov 2026; the brownstones 6 Nov)'); ok(g.mk.length>0,'Market St\'s row has its shut garages between the shops ('+g.mk.length+'; the rows re-laid 6 Nov 2026)');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all West St checks passed'); await b.close(); process.exit(bad?1:0); })();
