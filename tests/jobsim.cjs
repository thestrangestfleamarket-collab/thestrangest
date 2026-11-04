// THE CAST'S DAY (src/159-jobs.js, src/111fb-fleamarket.js): node tests/jobsim.cjs [out folder]: every cast member brought in; the clock held and set: at 11 everyone whose day says work (their hours, or their own life's plan) is at work, at 2:30 everyone whose day says home is home and out of sight; the diner stands; no page error. Exits 1 on any failure.
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1',{timeout:240000}); await pg.waitForFunction(()=>window.__started&&window.CREW&&CREW.ready&&window.NEWSCLK,null,{timeout:300000});
  await pg.evaluate(()=>{ NEWSCLK(11,0); return CREW.bring(); });
  await pg.waitForFunction(()=>JOBDBG().length>=190,null,{timeout:120000});
  const J=()=>pg.evaluate(()=>JOBDBG()); let j=await J();
  rec('the whole cast has jobs',j.length>=190,j.length+' at work or home');
  const inH=(h,[a,c])=>{ a%=24; c%=24; return a<=c?h>=a+.4&&h<c-.4:h>=a+.4||h<c-.4; };
  const hrs=x=>x.hours.split('-').map(Number);
  const waitAll=async(h,want,pred,ms)=>{ await pg.evaluate(h=>NEWSCLK(h,0),h); await pg.waitForTimeout(3000); const t=Date.now(); let k;   // (the goals follow the clock on the jobs' next half-second)
    while(Date.now()-t<ms){ k=await J(); if(k.filter(pred).every(x=>x.state===want))return [true,k]; await pg.waitForTimeout(3000); } return [false,k]; };
  // (a life of their own, src/158-lives.js, can take someone off for a meal or an errand in their hours: what their day asks is their goal)
  let [ok,k]=await waitAll(11,'work',x=>x.goal==='work',420000);
  rec('at 11 everyone whose day says work is at work',ok,k.filter(x=>x.goal==='work'&&x.state!=='work').map(x=>x.key+':'+x.state).slice(0,12).join()||k.filter(x=>x.state==='work').length+' at work');
  rec('most of those on shift at 11 are working',k.filter(x=>inH(11,hrs(x))&&x.state==='work').length>k.filter(x=>inH(11,hrs(x))).length/2,k.filter(x=>x.state==='work').length+' of '+k.length);
  rec('the outdoor workers are out in sight',k.filter(x=>x.state==='work'&&x.out).every(x=>x.vis));
  if(OUT){ await pg.screenshot({path:OUT+'/cast-11.png'}); }
  [ok,k]=await waitAll(2.5,'home',x=>x.goal==='home',600000);
  rec('at 2:30 everyone whose day says home is home',ok,k.filter(x=>x.goal==='home'&&x.state!=='home').map(x=>x.key+':'+x.state).slice(0,12).join()||k.filter(x=>x.state==='home').length+' home');
  rec('at 2:30 most of the town is home',k.filter(x=>x.state==='home').length>k.length*.75,k.filter(x=>x.state==='home').length+' of '+k.length);
  rec('home means out of sight',k.filter(x=>x.state==='home').every(x=>!x.vis));
  rec('the diner stands',await pg.evaluate(()=>MSHOPDBG().shops.includes('diner')));
  const E=Object.keys(errs); rec('no page errors',!E.length,E.slice(0,3).join(' | '));
  await b.close(); process.exit(bad?1:0); })();
