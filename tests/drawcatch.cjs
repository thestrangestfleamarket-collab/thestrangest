// THE DRAW'S CATCH (owner, 7 Nov 2026: "add the toArray catch"): a bad entry planted in a drawn material's uniform array; the frame goes on, the entry is set right,
// and what held it is kept for the next bug report. Run: node tests/drawcatch.cjs (slow: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}), errs=[], warns=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='warning'&&/^draw /.test(m.text()))warns.push(m.text()); });
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2000);
  const put=await pg.evaluate(()=>{ const R=__dbg.renderer||SHARED.renderer; let hit=null; __dbg.scene.traverse(o=>{ if(hit||!o.visible||!o.isMesh||!o.material)return; const m=[].concat(o.material)[0], P=R.properties.get(m), u=P&&P.uniforms; if(u&&u.sunB&&Array.isArray(u.sunB.value)){ u.sunB.value[3]=7; hit={o:o.name||o.type,u:u.sunB.value}; window.__bad=u.sunB.value; } }); return hit&&hit.o; });
  ok(!!put,'a bad entry planted in a drawn material ('+put+')');
  const f0=await pg.evaluate(()=>SHARED.frame||performance.now()); await pg.waitForTimeout(3000);
  const r=await pg.evaluate(()=>({fixed:!!(window.__bad&&window.__bad[3]&&window.__bad[3].toArray)}));
  ok(r.fixed,'the entry is set right');
  ok(warns.length>0&&/sunB\[3\]=number/.test(warns[0]),'what held it is named ('+(warns[0]||'').slice(0,200)+')');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  console.log(bad?bad+' failed':'the draw\'s catch works'); await b.close(); process.exit(bad?1:0); })();
