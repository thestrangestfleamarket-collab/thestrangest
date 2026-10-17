// THE STREET'S CHARACTERS' MOVES (npc-street): one character told each move in turn, sharp close-ups mid-move: node tests/streetact.cjs <key> <x,z> <out>
const {chromium}=require('playwright');
(async()=>{ const [key,at,out]=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:900,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?at='+at+'&npcwait=99'); await pg.waitForTimeout(22000);
  for(let i=0;i<3;i++){ await pg.keyboard.press('='); await pg.waitForTimeout(200); } for(let i=0;i<2;i++){ await pg.mouse.move(450,350); await pg.mouse.wheel(0,-250); await pg.waitForTimeout(150); } await pg.waitForTimeout(1500);
  const hold=()=>pg.evaluate(k=>{ const N=STREET.npcs.find(n=>n.key===k); N.st.to=null; N.st.wait=1e9; N.st.move=null; N.st.h=0; return N.st.x.toFixed(2)+','+N.st.z.toFixed(2); },key);
  console.log('at',await hold()); await pg.screenshot({path:out+'-idle.png'});
  for(const m of ['wave','jump','use']){ await hold(); await pg.evaluate(([k,m])=>{ STREET.npcs.find(n=>n.key===k).act(m); },[key,m]); await pg.waitForTimeout(m==='jump'?350:600); await pg.screenshot({path:out+'-'+m+'.png'}); await pg.waitForTimeout(2500); }
  // a walk: sent 3 tiles along the sidewalk, caught mid-stride
  await hold(); await pg.evaluate(k=>{ const N=STREET.npcs.find(n=>n.key===k); N.st.to={x:N.st.x-3,z:N.st.z}; N.st.wait=1e9; },key); await pg.waitForTimeout(1800); await pg.screenshot({path:out+'-walk.png'});
  console.log(await pg.textContent('#stat'),'errors',JSON.stringify(errs)); await b.close(); })();
