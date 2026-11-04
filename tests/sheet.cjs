// A CHARACTER'S SHEET (owner, 17 Oct 2026: "when adding new characters show them in black void, close up, spreading arms and limbs out pose so
// we can see them fully"; "show in full res in screenshots"): node tests/sheet.cjs <key> <outdir>; the page's ?sheet=key puts him out on the
// land in a black void, the camera on him, posed; from the front, the side and the back
const {chromium}=require('playwright');
(async()=>{ const [key,out='.']=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  for(const [k,turn] of [['front',45],['side',135],['back',225]]){ const pg=await b.newPage({viewport:{width:900,height:620}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; });
    await pg.goto('file://'+process.cwd()+'/dist/market.html?at=0,3&hour=13&sheet='+key+'&fullres=8&npcwait=99',{timeout:180000}); await pg.waitForTimeout(30000);
    await pg.evaluate(d=>SHEETTURN(d),turn);
    await pg.waitForTimeout(3000); await pg.evaluate(()=>{ for(const el of document.body.children)if(el.tagName!=='CANVAS')el.style.visibility='hidden'; }); await pg.waitForTimeout(400); await pg.screenshot({path:out+'/sheet-'+key+'-'+k+'.png'}); console.log(k,'errors',JSON.stringify(errs)); await pg.close(); }
  await b.close(); })();
