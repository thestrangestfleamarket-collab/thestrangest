// THE POLYFORK FRONTS (owner, 5 Nov 2026): Market St's new shops wear whole Polyfork buildings and West St is a line of 10-storey apartment houses with a small gap between each;
// every front arrives after the start from data/street.json, stands solid from the start, and each house has a door thing. Run: node tests/pfrow.cjs (slow: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=-45,0&hour=12'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000});
  await pg.waitForFunction(()=>window.PFROWDBG&&PFROWDBG().done,null,{timeout:120000}).catch(()=>{}); await pg.waitForTimeout(1500);
  const d=await pg.evaluate(()=>PFROWDBG());
  ok(d.done,'the Polyfork fronts came after the start: '+JSON.stringify(d));
  const W=JSON.parse(require('fs').readFileSync('data/world.json','utf8')), hud=W.places.filter(p=>p.row===2&&p.kind==='front'&&p.pf).map(p=>p.id), want=hud;   // the Hudson row's shops (one brick building kind, 8 Nov 2026); the Hudson entrance's corners are the old bodega and the lofts, the arcade its own front (12 Nov 2026)
  ok(want.every(id=>d.fronts.includes(id)),'every Hudson row shop has its building (8 Nov 2026: '+want.filter(id=>!d.fronts.includes(id)).join(', ')+' missing of '+d.fronts.join(', ')+')');
  // nothing overlaps (owner, 8 Nov 2026: "make sure the buildings dont over lap"): the backdrop's blocks past the map's edge stand clear of every place on their row
  const ov=await pg.evaluate(L=>{ const bad=[]; for(const k of BLK.back||[])for(const p of L){ if(p.x0==null||p.y0==null||p.y1==null)continue; const ox=Math.min(k.x1,p.x1)-Math.max(k.x0,p.x0), oy=Math.min(k.y1,p.y1)-Math.max(k.y0,p.y0); if(ox>.2&&oy>.2)bad.push(p.id+' '+ox.toFixed(1)); } return {n:(BLK.back||[]).length,bad}; },require('../data/world.json').places);
  ok(ov.n>0&&!ov.bad.length,'the backdrop past the map\'s edge overlaps no building: '+JSON.stringify(ov));
  ok(d.houses===0&&d.solids===0,'no Polyfork towers on West St (its apartment houses are brownstones, 7 Nov 2026): '+d.houses);
  ok(d.tris>0&&d.tris<200000,'the fronts and their dressing are about 170,000 triangles along 230 m of street, never all in view ('+d.tris+')');
  
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all Polyfork front checks passed'); await b.close(); process.exit(bad?1:0); })();
