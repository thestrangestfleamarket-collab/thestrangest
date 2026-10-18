// WORK AND HOME, PLAYED THROUGH (src/jobs.js): node tests/jobsim.cjs <out folder>. Every workplace has a worker; every worker's home is near his
// work (25 tiles at most); through a day (the clock held, set hour by hour): at 11 everyone open is at his post, on his own time after closing,
// home asleep at 2; a look inside the Diner at its cook and at a flat's street door over a shop. Exits 1 on any failure.
const {chromium}=require('playwright'); const OUT=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={};
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  const R=[]; const rec=(n,ok,i)=>{ R.push([n,ok]); console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=6&fresh=1'); for(let i=0;i<240&&!(await pg.evaluate(()=>!!window.__started&&window.MAIL&&MAIL.ready).catch(()=>false));i++)await pg.waitForTimeout(1000);
  await pg.evaluate(()=>{ __dbg.CLOCK.run=false; }); await pg.waitForTimeout(2000);
  const J=()=>pg.evaluate(()=>JOBDBG());
  let j=await J(); console.log('the jobs:'); for(const x of j)console.log('  '+x.title.padEnd(14)+' '+x.id.padEnd(9)+' '+x.hours.padEnd(10)+' '+x.who.padEnd(14)+' home '+x.home+' ('+x.homeTiles+' tiles)');
  const places=['diner','bar','aquarium','dojo','market','museum','lucky','yellow','theatre','playhouse','baker','cottage','keep','park','subway'];
  rec('every workplace has a worker',places.every(p=>j.some(x=>x.id===p)),places.filter(p=>!j.some(x=>x.id===p)).join()||places.length+' of '+places.length);
  rec('every worker\'s home within 25 tiles of his work',j.every(x=>x.home&&x.homeTiles<=25),j.filter(x=>!(x.homeTiles<=25)).map(x=>x.id+' '+x.homeTiles).join());
  rec('the Fox lives over the bodega',await pg.evaluate(()=>MAIL.addr.some(a=>a.up&&a.b.id==='bodega'&&a.name==='THE FOX')));
  const waitAll=async(want,pred,ms)=>{ const t=Date.now(); let k; while(Date.now()-t<ms){ k=await J(); if(k.filter(pred).every(x=>x.state===want))return [true,k]; await pg.waitForTimeout(4000); } return [false,k]; };
  // 11:00: everyone whose place is open at 11 at his post
  await pg.evaluate(()=>CITY.setHour(11)); let [ok,k]=await waitAll('work',x=>{ const [o,c]=x.hours.split('-').map(Number); return 11>=o&&11<c; },600000);
  rec('at 11:00 every open place\'s worker is at his post',ok,k.filter(x=>x.state!=='work').map(x=>x.id+':'+x.state).join()||'all '+k.filter(x=>x.state==='work').length);
  // the cook inside the Diner
  await pg.evaluate(()=>{ const D=JOBDBG().find(x=>x.id==='diner'), T=__dbg.cv().TILE; const A=MAIL.addr.find(a=>a.id==='diner'); const s=A.b.step; STORE.goTo(s.x-A.b.F.n.x*1.2*T,s.z-A.b.F.n.z*1.2*T,'up'); }); await pg.waitForTimeout(5000); await pg.screenshot({path:OUT+'/job_diner.png'});
  // a flat's door over a shop
  await pg.evaluate(()=>{ const A=MAIL.addr.find(a=>a.up&&a.b.id!=='bodega')||MAIL.addr.find(a=>a.up), T=__dbg.cv().TILE; window.__UP=A.label; STORE.goTo(A.step.x+A.b.F.n.x*2*T,A.step.z+A.b.F.n.z*2*T,'up'); }); await pg.waitForTimeout(5000); await pg.screenshot({path:OUT+'/job_upstairs.png'}); console.log('  a flat over a shop:',await pg.evaluate(()=>window.__UP));
  // 18:30: the day shifts done, on their own time
  await pg.evaluate(()=>CITY.setHour(18.5)); [ok,k]=await waitAll('off',x=>{ const [o,c]=x.hours.split('-').map(Number); return c<18.5&&c+1.2<18.5; },400000);
  rec('after closing, the day workers are on their own time',ok,k.filter(x=>{ const [o,c]=x.hours.split('-').map(Number); return c+1.2<18.5&&x.state!=='off'; }).map(x=>x.id+':'+x.state).join()||'ok');
  // 2:00: everyone home and out of sight
  await pg.evaluate(()=>{ CITY.setHour(23.9); }); await pg.waitForTimeout(1500); await pg.evaluate(()=>CITY.setHour(2)); [ok,k]=await waitAll('home',x=>true,900000);
  rec('at 2:00 every worker is home',ok,k.filter(x=>x.state!=='home').map(x=>x.id+':'+x.state).join()||'all '+k.length);
  rec('home means out of sight',k.filter(x=>x.state==='home').every(x=>!x.vis));
  // 7:30 the next morning: the early ones out again
  await pg.evaluate(()=>CITY.setHour(7.6)); await pg.waitForTimeout(6000); k=await J(); const early=k.filter(x=>+x.hours.split('-')[0]<=8.5);
  rec('the early shifts leave home in the morning',early.every(x=>x.state!=='home'),early.map(x=>x.id+':'+x.state).join());
  rec('no page errors',!Object.keys(errs).length,JSON.stringify(errs));
  await b.close(); process.exit(R.some(r=>!r[1])?1:0); })();
