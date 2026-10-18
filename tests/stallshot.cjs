// THE STALLS (owner, 18 Oct 2026, "B with C's overflow"): node tests/stallshot.cjs <out>: <out>-1.png both stalls from the opening view, <out>-2.png
// closer; prints their cost and any page error
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]; const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1100,height:760}}); pg.on('pageerror',e=>console.log('ERR',e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour='+(process.env.HOUR||14),{timeout:180000}); await pg.waitForTimeout(30000);
  console.log(JSON.stringify(await pg.evaluate(()=>{ const [m,v]=[STALL.made.find(s=>!s.veg),STALL.made.find(s=>s.veg)]; return {m:m&&{tris:m.tris,items:m.items},v:v&&{tris:v.tris,items:v.items}}; })));
  await pg.evaluate(()=>{ const [m,v]=[STALL.made.find(s=>!s.veg),STALL.made.find(s=>s.veg)]; STORE.pos.set((m.hx+v.hx)/2,0,m.hz-2.2*(v.hz-v.fz)/5.2); }); await pg.waitForTimeout(4000); await pg.screenshot({path:out+'-1.png'});
  for(let i=0;i<6;i++){ await pg.mouse.move(550,380); await pg.mouse.wheel(0,-240); await pg.waitForTimeout(300); } await pg.waitForTimeout(2500); await pg.screenshot({path:out+'-2.png'});
  await b.close(); })();
