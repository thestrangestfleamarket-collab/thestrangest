// THE TRIANGLES IN THE FRAME, TWO BUILDS (18 Oct 2026): node tests/tricompare.cjs "<query>" <shot prefix> <path to a built market.html>: at four places, renderer.info's triangles and draw calls (all passes) over six frames, and a shot each
const {chromium}=require('playwright'); const q=process.argv[2]||'', out=process.argv[3]||'/tmp/claude-0/s/tri';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}});
  pg.on('pageerror',e=>console.log('ERR',e.message.slice(0,200))); pg.on('console',m=>{ if(m.type()==='error'||/BatchedMesh|NAV|BVH/.test(m.text()))console.log('console:',m.text().slice(0,200)); });
  await pg.goto('file://'+process.argv[4]+'?fresh=1&hour=11&'+q); for(let i=0;i<300&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000); await pg.waitForTimeout(8000);
  for(const name of ['CENTRAL PARK','THE BODEGA','THE BATH HOUSE','THE DUNGEON STAIR']){ await pg.evaluate(n=>__dbg.UI.goPlace(n),name); await pg.waitForTimeout(10000);
    const r=[]; for(let k=0;k<6;k++){ await pg.waitForTimeout(700); r.push(await pg.evaluate(()=>{ const i=__dbg.renderer.info.render; return [i.triangles,i.calls]; })); }
    console.log(q||'default',name,JSON.stringify(r)); await pg.screenshot({path:out+'_'+name.replace(/\W+/g,'_')+'.png'}); }
  await b.close(); })();
