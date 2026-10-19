// THE PARK'S TREES (park.js): which trees stand where, then a picture of each landmark (willow, giant, spruce) and a common bunch. node tests/parktrees.cjs <outdir>
const {chromium}=require('playwright'), out=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:640}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?at=20,30&hour=15&hideme=1&npcwait=99',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; }
  const T=await pg.evaluate(()=>{ const D=PARKDBG(); return D.trees.map((t,i)=>[t[0],t[1],t[2],t[3],D.oaks[i][0],D.oaks[i][1]]); });
  const n={}; for(const t of T)n[t[0]]=(n[t[0]]||0)+1; console.log('trees',T.length,JSON.stringify(n));
  for(const t of T.filter(t=>!/^(Oak|Elder)/.test(t[0])))console.log(t[0],'at',t[1],t[2],'size',t[3]);
  const shot=async(name,x,z)=>{ await pg.evaluate(([x,z])=>STORE.goTo(x,z+6,'up'),[x,z]); await pg.waitForTimeout(7000); await pg.screenshot({path:`${out}/${name}.png`}); console.log(name); };
  for(const k of ['Willow1','Giant1','Spruce1']){ const t=T.find(t=>t[0]===k); if(t)await shot(k,t[4],t[5],.7); }
  const e=T.find(t=>/^Elder/.test(t[0])); if(e)await shot('common',e[4],e[5],.55);
  await shot('overview',T.reduce((a,t)=>a+t[4],0)/T.length,T.reduce((a,t)=>a+t[5],0)/T.length,.25);
  await b.close(); })();
