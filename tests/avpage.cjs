// THE AVATAR EDITOR, STANDALONE (dist/avatar.html, build.py): node tests/avpage.cjs <outdir> ["POSE,POSE,move:wave,view:FRONT,wear:CAMO"]
// the page wrapped as the artifact wraps it, then a screenshot after each step; the page's errors at the end
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
(async()=>{ const [out='.',list='SPREAD OUT',W='1400',H='860']=process.argv.slice(2);
  const page=path.join(out,'avpage.html'); fs.writeFileSync(page,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}</style></head><body>'+fs.readFileSync('dist/avatar.html','utf8')+'</body></html>');
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:+W,height:+H}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text()); });
  const t0=Date.now(); await pg.goto('file://'+path.resolve(page)); await pg.waitForFunction(()=>window.AVE&&window.AVE.draw,null,{timeout:180000}); console.log('ready in',Date.now()-t0,'ms');
  for(const s of list.split(',')){ await pg.evaluate(s=>{ const A=AVE; if(s.startsWith('move:'))A.playMove(s.slice(5)); else if(s.startsWith('view:'))A.goView(s.slice(5)); else if(s.startsWith('wear:'))A.wear(s.slice(5));
      else if(s.startsWith('shade:'))A.shadeAs(s.slice(6)); else if(s.startsWith('back:'))A.setBack(s.slice(5)); else if(s.startsWith('js:'))eval(s.slice(3)); else if(s==='SIT')A.sit(); else A.setPose(s); },s);
    await pg.waitForTimeout(s.startsWith('move:')?600:1600); await pg.screenshot({path:path.join(out,'ap-'+s.replace(/[^\w]+/g,'_')+'.png')}); }
  console.log('errors',JSON.stringify(errs.slice(0,12))); await b.close(); })();
