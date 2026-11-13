// THE RENDER INSPECTOR'S EXPORT: node tests/rinsp.cjs: opens the inspector, presses EXPORT and checks the file says where you are and lists everything.
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], bad=[], ok=(c,m)=>{ if(!c)bad.push(m); };
(async()=>{ const b=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540},acceptDownloads:true}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300)));
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(4000); await pg.evaluate(()=>RINSP.toggle(true)); await pg.waitForTimeout(3000);
  const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('#rinsp .ex')]), R=JSON.parse(fs.readFileSync(await dl.path(),'utf8')), sum=(A,k)=>A.reduce((a,w)=>a+w[k],0);
  ok(/^render-.*\.json$/.test(dl.suggestedFilename()),'file name '+dl.suggestedFilename());
  ok(R.build&&R.when&&R.where&&R.where.at.length===3&&R.where.camera.at.length===3&&R.where.level,'where');
  ok(R.screen.w>0&&R.screen.passes.length>0,'screen'); ok(R.head.calls>0&&R.head.loadedTris>0,'head');
  ok(R.time.length>0&&R.time.some(t=>t.parts&&t.parts.length),'time opened out');
  ok(R.drawn.length>0&&R.drawn.every(w=>w.parts.length===w.n&&w.group),'every drawn object listed');
  ok(R.notDrawn.length>0&&R.notDrawn.every(w=>w.parts.length===w.n),'every loaded object listed');
  ok(sum(R.drawn,'n')===R.head.drawnObjs,'drawn count'); ok(R.drawn.some(w=>w.parts.some(p=>p.mats.length&&p.mats[0].program)),'materials');
  ok(R.lights.length===R.head.lightsInScene&&R.lights.every(l=>l.at.length===3),'lights'); ok(R.programs.length===R.head.programs,'programs');
  ok(Object.keys(R.groups.drawn).length>0,'groups'); ok(!errs.length,'page errors '+errs.join(' | '));
  console.log(JSON.stringify({file:dl.suggestedFilename(),bytes:fs.statSync(await dl.path()).size,where:R.where,head:R.head,drawn:R.drawn.length,notDrawn:R.notDrawn.length,lights:R.lights.length,bad}).slice(0,3000));
  if(process.argv[2])fs.copyFileSync(await dl.path(),process.argv[2]);
  await b.close(); process.exit(bad.length?1:0); })();
