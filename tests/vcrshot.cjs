// LIGHTNING FAST VCR REPAIR off the map: node tests/vcrshot.cjs <out> (writes <out>-a/-w/-b/-c/-i.png: its front, wide, the side yard, inside from the back, inside from the front; HOUR=22 for night)
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]; const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1095,height:765}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; }); pg.on('console',m=>{ if(/store|CLIP|error/i.test(m.text()))console.log('C',m.text().slice(0,200)); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour='+(process.env.HOUR||14),{timeout:180000}); await pg.waitForTimeout(24000);
  console.log(await pg.evaluate(()=>{ const bt=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='VCR REPAIR'); if(bt)bt.click(); const R=STORE.rooms.find(r=>r.id==='vcr'); return JSON.stringify(R&&{at:R.at,x0:R.x0,x1:R.x1,z0:R.z0,z1:R.z1}); }));
  await pg.waitForTimeout(3000); if(await pg.evaluate(()=>{ const m=document.getElementById('menu'); return m&&!m.hidden&&getComputedStyle(m).display!=='none'; }))await pg.keyboard.press('Escape');
  await pg.evaluate(()=>{ const X=STORE.XYZ; STORE.pos.set(X.X(388),0,X.Z(-78)); }); await pg.mouse.move(547,380); for(let i=0;i<12;i++){ await pg.mouse.wheel(0,400); await pg.waitForTimeout(150); } await pg.waitForTimeout(5000);
  await pg.screenshot({path:out+'-a.png'}); await pg.evaluate(()=>{ const X=STORE.XYZ; CAMAT(X.X(388),2,X.Z(-84),.55); }); await pg.waitForTimeout(5000); await pg.screenshot({path:out+'-w.png'});
  await pg.keyboard.press('c'); await pg.waitForTimeout(800); await pg.evaluate(()=>{ const X=STORE.XYZ; STORE.pos.set(X.X(397),0,X.Z(-84)); }); await pg.waitForTimeout(1500); for(const k of 'q'){ await pg.keyboard.press(k); await pg.waitForTimeout(600); } await pg.waitForTimeout(2500); await pg.screenshot({path:out+'-b.png'});
  await pg.evaluate(()=>{ const X=STORE.XYZ; STORE.pos.set(X.X(387),0,X.Z(-85)); }); await pg.waitForTimeout(4000); await pg.screenshot({path:out+'-c.png'}); for(const k of 'qq'){ await pg.keyboard.press(k); await pg.waitForTimeout(600); } await pg.waitForTimeout(3000); await pg.screenshot({path:out+'-i.png'});
  console.log('errors',Object.keys(errs)); await b.close(); })();
