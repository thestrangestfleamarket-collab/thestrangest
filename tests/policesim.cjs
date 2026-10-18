// node tests/policesim.cjs: at 22:00 with ?trouble=1 a troublemaker comes up the subway stairs; passes when the police droid answers the call
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:800,height:500}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,150)));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=22&trouble=1&place=THE%20SUBWAY%20STAIRS'); for(let i=0;i<200&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000);
  const t0=Date.now(); let seen=false;
  while(Date.now()-t0<300000){ const s=await pg.evaluate(()=>({tr:GUARDX.TROUBLE.map(t=>t.mode),call:CIVIC.log.some(e=>/call to the precinct/.test(e.what)),pol:CIVIC.log.filter(e=>/POLICE DROID/.test(e.what)).map(e=>e.what),st:CIVIC.staff.officer1.state}));
    if(s.call&&!seen){ seen=true; console.log('call posted after',((Date.now()-t0)/1000).toFixed(0),'s · troublemakers',s.tr.join(),'· officer',s.st); }
    if(s.pol.length){ console.log('PASS police droid answered after',((Date.now()-t0)/1000).toFixed(0),'s:',s.pol[0]); break; } await pg.waitForTimeout(3000); }
  if(Date.now()-t0>=300000)console.log('FAIL no police answer in 5 min', JSON.stringify(await pg.evaluate(()=>({tr:GUARDX.TROUBLE.map(t=>t.mode),st:CIVIC.staff.officer1.state,jobs:CITY.jobs.filter(j=>j.kind==='crime').map(j=>j.state)}))));
  console.log('errors',errs.length,errs.slice(0,3)); await b.close(); })();
