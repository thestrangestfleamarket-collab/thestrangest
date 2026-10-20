const {chromium}=require('playwright'), path=require('path'), fs=require('fs');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); fs.mkdirSync('out',{recursive:true});
  for(const [tag,file] of [['base','../base/dist/market.html'],['head','dist/market.html']]){
    const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(/not loaded/.test(m.text()))errs.push(m.text()); });
    await pg.goto('file://'+path.resolve(file)+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'}); for(let i=0;i<900&&!(await pg.evaluate(()=>!!window.__dbg).catch(()=>false));i++)await pg.waitForTimeout(500);
    await pg.waitForTimeout(8000);
    for(const [n,f] of [['arcade',async()=>{ await __dbg.ui().goPlace('THE ARCADE'); await new Promise(r=>setTimeout(r,3000)); await STORE.enter('arcade',true); await new Promise(r=>setTimeout(r,5000)); }],['vcr',async()=>{ await __dbg.ui().goPlace('VCR REPAIR'); await new Promise(r=>setTimeout(r,6000)); }],['fire',async()=>{ FIREV.out(); await new Promise(r=>setTimeout(r,9000)); }],['bath',async()=>{ const M=__dbg.MAPK, G=M.BOD.GD, r=G.r; STORE.goTo(M.BOD.X((r[0]+r[2])/2),M.BOD.Z((r[1]+r[3])/2),'up'); await new Promise(r=>setTimeout(r,8000)); }]]){
      await pg.evaluate(`(${f})()`).catch(e=>errs.push(n+' '+e.message)); await pg.screenshot({path:'out/cmp-'+n+'-'+tag+'.png'}); }
    console.log(tag,JSON.stringify(errs)); await pg.close(); }
  await b.close(); })();
