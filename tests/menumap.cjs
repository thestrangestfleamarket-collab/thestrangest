// THE MENU'S MAP (owner, 18 Oct 2026: "map like"): node tests/menumap.cjs <out>: the menu opened on its MAP tab, the drawn plan of the street
// level (<out>.png) and a click on it (where it put him)
const {chromium}=require('playwright');
(async()=>{ const [out]=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1100,height:820}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,6',{timeout:180000}); await pg.waitForTimeout(30000);
  await pg.evaluate(()=>{ const t0=performance.now(); __UI.toggleMenu(); window.__MT=performance.now()-t0; }); await pg.waitForTimeout(1500);
  console.log('open ms',await pg.evaluate(()=>Math.round(__MT)));
  await pg.screenshot({path:out+'.png'});
  const r=await pg.evaluate(()=>{ const c=document.getElementById('mapcv').getBoundingClientRect(); return [c.left+c.width*.5,c.top+c.height*.3]; });
  await pg.mouse.click(r[0],r[1]); await pg.waitForTimeout(800); console.log('after click',await pg.evaluate(()=>[STORE.pos.x.toFixed(1),STORE.pos.z.toFixed(1)]));
  console.log('errors',Object.keys(errs)); await b.close(); })();
