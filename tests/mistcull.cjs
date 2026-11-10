// PAST THE MIST NOT DRAWN (skyline.js's FAR3.cull): node tests/mistcull.cjs <out> [query]: at five places, one whole frame's triangles and draws
// (every pass), how many meshes were left out, and a picture (<out>-<n>.png); run once with mistcull=0 to compare
const {chromium}=require('playwright');
(async()=>{ const [out,q='']=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&'+q,{timeout:180000}); await pg.waitForTimeout(34000);
  let n=0; for(const p of ['THE STREET','THE BODEGA','CENTRAL PARK','THE BATH HOUSE','THE DUNGEON STAIR']){ await pg.evaluate(x=>__UI.goPlace(x),p); await pg.waitForTimeout(7000);
    const r=await pg.evaluate(()=>FAR3.frameTris()); console.log(p.padEnd(14),JSON.stringify(r)); await pg.screenshot({path:out+'-'+(n++)+'.png'}); }
  console.log('errors',Object.keys(errs)); await b.close(); })();
