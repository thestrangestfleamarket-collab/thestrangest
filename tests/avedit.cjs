// THE AVATAR WORKBENCH (avatar/avatar-editor.html): node tests/avedit.cjs <outdir> [pose,pose...] : the page wrapped as the artifact wraps it,
// any page errors, then a screenshot per pose (front 3/4) and one each of front / side / back
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
(async()=>{ const [out='.',list='Spread out']=process.argv.slice(2);
  const src=fs.readFileSync(path.join(__dirname,'../avatar/avatar-editor.html'),'utf8'), page=path.join(out,'avedit.html');
  fs.writeFileSync(page,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+src+'</body></html>');
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1280,height:800}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error'||m.type()==='warning') errs.push(m.type()+': '+m.text()); });
  await pg.goto('file://'+path.resolve(page)); await pg.waitForFunction(()=>window.AW,null,{timeout:120000});
  await pg.evaluate(()=>{ AW.VIEW.px=1; AW.applyView('3/4'); });
  for(const p of list.split(',')){ await pg.evaluate(p=>{ const A=AW; if(p.startsWith('anim:')) A.playAnim(p.slice(5)); else A.setPose(p); },p); await pg.waitForTimeout(1500);
    await pg.screenshot({path:path.join(out,'av-'+p.replace(/[^\w]+/g,'_')+'.png')}); }
  console.log(JSON.stringify(errs.slice(0,20))); await b.close(); })();
