// THE CREATURES (npc-creatures) and THE UNDERGROWTH (park.js): the park's round by day and by night, a rat close on the street; CREATDBG, errors
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); }); pg.on('console',m=>{ if(m.type()==='error')console.log(m.type(),m.text().slice(0,300)); });
  const out=process.argv[2]||'creat';
  for(const [tag,at,zoom] of [['day','?at=0,26&hour=14&npcwait=60',-2],['night','?at=0,26&hour=22&npcwait=60',-2],['rat','?at=-13.5,2.5&hour=14&npcwait=60',-4]]){ await pg.goto('file://'+process.cwd()+'/dist/market.html'+at,{timeout:180000}); await pg.waitForTimeout(22000);
    for(let k=0;k<Math.abs(zoom);k++){ await pg.mouse.move(500,350); await pg.mouse.wheel(0,zoom<0?-250:250); await pg.waitForTimeout(150); }
    if(tag==='rat')await pg.evaluate(()=>{ const N=CREATS[0]; N.st.to={x:N.st.x+5,z:N.st.z}; N.st.wait=99; }); await pg.waitForTimeout(tag==='rat'?2500:1500);
    await pg.screenshot({path:out+'_'+tag+'.png'}); console.log(tag,await pg.evaluate(()=>JSON.stringify(CREATDBG()))); }
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
