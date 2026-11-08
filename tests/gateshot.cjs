// CENTRAL PARK'S GATE (owner, 18 Oct 2026, "A"): node tests/gateshot.cjs <out> [hour]: <out>-0..3.png the main gate and its stalls from the four
// isometric angles (E turns), <out>-wall.png along the railing; prints the iron's triangles and any page error
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2], hr=process.argv[3]||13; const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1100,height:760}}); pg.on('pageerror',e=>console.log('ERR',e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour='+hr,{timeout:180000}); await pg.waitForTimeout(30000);
  console.log(JSON.stringify(await pg.evaluate(()=>({iron:PARK.iron,gate:PARK.gate}))));
  await pg.evaluate(()=>{ const [m,v]=STALL.made, T=(v.hx-m.hx)/18; STORE.pos.set((m.hx+v.hx)/2,0,PARK.look[1]-1.4*T); }); await pg.waitForTimeout(3000);
  for(let i=0;i<4;i++){ await pg.screenshot({path:out+'-'+i+'.png'}); await pg.keyboard.press('r'); await pg.waitForTimeout(2500); }
  await pg.evaluate(()=>{ const [m,v]=STALL.made, T=(v.hx-m.hx)/18; STORE.pos.set(m.hx-10*T,0,PARK.look[1]+.4*T); }); await pg.waitForTimeout(3000);
  for(let i=0;i<3;i++){ await pg.mouse.move(550,380); await pg.mouse.wheel(0,-240); await pg.waitForTimeout(300); } await pg.waitForTimeout(2500); await pg.screenshot({path:out+'-wall.png'});
  await b.close(); })();
