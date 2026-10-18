// THE AVATAR EDITOR'S POSES, ALL AT ONCE: node tests/avposes.cjs <outdir> [view] : each pose of dist/avatar.html held, the panels out of
// the picture, a shot each (ap-pose-<n>.png); tests/avposes.py makes them one contact sheet
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
(async()=>{ const [out='.',view='3/4']=process.argv.slice(2);
  const page=path.join(out,'avpage.html'); fs.writeFileSync(page,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}</style></head><body>'+fs.readFileSync('dist/avatar.html','utf8')+'</body></html>');
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:520,height:560}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+path.resolve(page)); await pg.waitForFunction(()=>window.AVE&&window.AVE.draw,null,{timeout:180000});
  const names=await pg.evaluate(v=>{ for(const s of ['#wb','#av','#bar','#tip','#ed'])document.querySelector(s)&&(document.querySelector(s).style.display='none'); AVE.goView(v); AVE.ORB.size=1.6; return Object.keys(AVE.POSES).concat(['SIT']); },view);
  let i=0; for(const n of names){ await pg.evaluate(n=>{ n==='SIT'?AVE.sit():AVE.setPose(n); AVE.MODE.Pnow=AVE.MODE.P; AVE.MODE.airNow=AVE.MODE.air; },n); await pg.waitForTimeout(250);
    await pg.screenshot({path:path.join(out,'ap-pose-'+String(i++).padStart(2,'0')+'.png')}); }
  fs.writeFileSync(path.join(out,'ap-poses.json'),JSON.stringify(names)); console.log('poses',names.length,'errors',JSON.stringify(errs)); await b.close(); })();
