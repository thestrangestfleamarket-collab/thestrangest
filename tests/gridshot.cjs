// THE POWER GRID (grid.js): the street at night with the grid on, its state; then spans cut, that stretch dark. node tests/gridshot.cjs <outdir> [cut spans, e.g. 2,5]
const {chromium}=require('playwright'); const out=process.argv[2]||'.', cut=process.argv[3]||'';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1100,height:700}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message)); pg.on('console',m=>{ if(m.type()==='error'||(m.type()==='warning'&&/GRID/.test(m.text())))console.log(m.type(),m.text().slice(0,300)); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?grid=1&hour=22&view=map&hideme=1&at=-8,4'+(cut?'&cut='+cut:'')); await pg.waitForFunction(()=>window.__started,{timeout:240000}); await pg.waitForTimeout(5000);
  console.log(JSON.stringify(await pg.evaluate(()=>({tris:GRID.tris,house:GRID.house&&[GRID.house.x,GRID.house.z].map(v=>+v.toFixed(1)),...GRID.state()}))));
  const shot=async(n,y,p,z)=>{ await pg.evaluate(([y,p,z])=>__dbg.cam(y,p,z),[y,p,z]); await pg.waitForTimeout(4000); await pg.screenshot({path:out+'/'+n+'.png'}); };
  await shot('grid-street',-.5,.35,9); await shot('grid-house',2.4,.3,14);
  await b.close(); })();
