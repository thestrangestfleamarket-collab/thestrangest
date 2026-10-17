// THE STOREROOM, QUICK (store.js): the page loaded, its errors (with where) and the store's warnings; no pictures
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:600,height:400}});
  const errs={}, warns=[]; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message.slice(0,300),(e.stack||'').split('\n').slice(1,4).join(' / ').slice(0,500)); }); pg.on('console',m=>{ const t=m.text(); if(/store:|no |warn|error|shader/i.test(t)&&warns.length<40)warns.push(t.slice(0,160)); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=22&npcwait=60',{timeout:240000}); await pg.waitForTimeout(12000);
  console.log('rooms',await pg.evaluate(()=>JSON.stringify((window.STORE&&STORE.rooms||[]).map(r=>r.id))),'stats',await pg.evaluate(()=>JSON.stringify(window.STORE&&STORE.stats||null)),'lamps',await pg.evaluate(()=>[STORE.nl,STORE.lon]));
  console.log('warnings',JSON.stringify(warns)); console.log('errors',JSON.stringify(errs)); await b.close(); })();
