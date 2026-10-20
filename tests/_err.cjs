const {chromium}=require('playwright'),path=require('path');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage(); const out=[];
  pg.on('pageerror',e=>out.push('PAGEERROR '+e.message.slice(0,400)+' | '+(e.stack||'').split('\n').slice(1,4).join(' / ')));
  pg.on('console',m=>{ if(m.type()==='error')out.push('CONSOLE '+m.text().slice(0,300)); });
  await pg.goto('file://'+path.resolve(process.argv[2])+'?fresh=1&hour=13',{waitUntil:'commit'});
  let st=false; for(let i=0;i<36&&!st;i++){ await pg.waitForTimeout(5000); st=await pg.evaluate(()=>!!window.__started).catch(()=>false); }
  out.push(st?'STARTED':'NOT STARTED in 180 s'); for(const l of out.slice(0,20))console.log('::notice title=err::'+l.replace(/%/g,'%25').replace(/\n/g,'%0A'));
  await b.close(); })();
