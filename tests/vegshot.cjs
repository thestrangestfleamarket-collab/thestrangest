// THE TOMATO'S VEGGIE STAND, THE FOX, THE MENU (owner, 18 Oct 2026): node tests/vegshot.cjs <out>: <out>-veg.png the stand and the tomato (and the
// mushroom booth beside it), <out>-shop.png his shop open, <out>-fox.png the Fox at the lower counter, <out>-menu.png the menu's map and GO TO;
// prints who's on the map (no droids, no toys) and the stand's state
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]; const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1100,height:760}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour='+(process.env.HOUR||14),{timeout:180000}); await pg.waitForTimeout(26000);
  console.log('gone',await pg.evaluate(()=>({droids:!!window.DROIDS,toys:!!window.TOYS,staff:Object.keys(CIVIC.staff),ualkit:!!window.UALK,toons:Object.keys(TOONSDBG())})));
  console.log('veg',JSON.stringify(await pg.evaluate(()=>VEGDBG())));
  await pg.evaluate(()=>{ const v=VEGDBG(); STORE.pos.set(v.wx+1.2,0,v.wz+3.2); }); await pg.waitForTimeout(3500); await pg.screenshot({path:out+'-veg.png'});
  await pg.evaluate(()=>VEG.SHOP.open()); await pg.waitForTimeout(800); await pg.screenshot({path:out+'-shop.png'}); await pg.evaluate(()=>{ document.getElementById('vegp').hidden=true; });
  await pg.evaluate(()=>{ const b=[...document.querySelectorAll('#places button')].find(b=>b.textContent==='THE BODEGA'); b&&b.click(); }); await pg.waitForTimeout(500);
  await pg.evaluate(()=>{ const P=__UI.places().find(p=>p[0]==='THE BODEGA'); STORE.pos.set(P[1]+.6,0,P[2]+.4); }); await pg.waitForTimeout(4000); await pg.screenshot({path:out+'-fox.png'});
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(2500); await pg.screenshot({path:out+'-menu.png'});
  console.log('go to options',await pg.evaluate(()=>document.querySelectorAll('#placesel option').length));
  console.log('errors',Object.keys(errs)); await b.close(); })();
