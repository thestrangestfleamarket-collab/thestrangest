// THE BIRDS AS A SHEET (owner's rule, new characters shown first): node tests/birdsheet.cjs <out> [zoom]: every kind in a row on the open
// street at noon, wings folded, then the same row with wings spread; <out>-a.png, <out>-b.png
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]||'bs', zoom=+(process.argv[3]||3); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1200,height:700}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12&hideme=1&at='+(process.env.AT||'0,3'),{timeout:180000}); await pg.waitForTimeout(28000);
  await pg.evaluate(()=>{ NEWSCLK(12,0); for(const b of [...BIRDS.list])BIRDS.drop(b); const T=BIRDS.T, p=STORE.pos, n=BIRDS.K.length;
    window.SHEETB=BIRDS.K.map((k,i)=>{ const x=p.x+(i-(n-1)/2)*.62*T, z=p.z+.2*T, y=GARDEN.lawnAt(x,z)??p.y; const b=BIRDS.add(i,x,y,z,{st:'perch',src:'sheet'}); b.yaw=Math.PI/4+Math.PI; b.until=1e9; return b; }); });
  for(let i=0;i<zoom;i++){ await pg.mouse.move(600,350); await pg.mouse.wheel(0,-250); await pg.waitForTimeout(150); } await pg.waitForTimeout(3000);
  await pg.screenshot({path:out+'-a.png'});
  await pg.evaluate(()=>{ const t0=BIRDS.tick; BIRDS.tick=dt=>{ t0(dt); }; for(const b of SHEETB){ b.st='still'; b.wing=1.6; } }); await pg.waitForTimeout(1500); await pg.screenshot({path:out+'-b.png'});
  console.log(JSON.stringify(await pg.evaluate(()=>BIRDDBG()))); console.log('errors',Object.keys(errs)); await b.close(); })();
