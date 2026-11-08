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
  const W=JSON.parse(require('fs').readFileSync('data/world.json','utf8')), hud=W.places.filter(p=>p.row===2&&p.kind==='front').map(p=>p.id), want=[...hud,'bodega','arcade'];   // the Hudson row's shops (one brick building kind, 8 Nov 2026) and the two corners at the Hudson entrance
  ok(want.every(id=>d.fronts.includes(id)),'every Hudson row shop has its building, and the bodega and the arcade the corners at the Hudson entrance (8 Nov 2026: '+want.filter(id=>!d.fronts.includes(id)).join(', ')+' missing of '+d.fronts.join(', ')+')');
  ok(d.houses===0&&d.solids===0,'no Polyfork towers on West St (its apartment houses are brownstones, 7 Nov 2026): '+d.houses);
  ok(d.tris>0&&d.tris<200000,'the fronts and their dressing are about 170,000 triangles along 230 m of street, never all in view ('+d.tris+')');
  
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all Polyfork front checks passed'); await b.close(); process.exit(bad?1:0); })();
