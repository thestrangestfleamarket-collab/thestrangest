// THE SIX FIGURES (npc-figures): the street from a few spots, a few moments apart; FIGDBG (where each is, what he does) and the page's errors
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); }); pg.on('console',m=>{ if(m.type()==='error'||m.type()==='warning')console.log(m.type(),m.text().slice(0,300)); });
  const at=process.argv[2]||'', out=process.argv[3]||'fig', n=+(process.argv[4]||3);
  await pg.goto('file://'+process.cwd()+'/dist/market.html'+at,{timeout:180000}); await pg.waitForTimeout(25000);
  for(let i=0;i<n;i++){ await pg.screenshot({path:out+i+'.png'}); console.log(i,await pg.evaluate(()=>typeof FIGDBG!=='undefined'?JSON.stringify(FIGDBG()):'no FIGDBG')); await pg.waitForTimeout(7000); }
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
