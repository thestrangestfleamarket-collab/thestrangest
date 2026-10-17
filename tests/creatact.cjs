// THE CREATURES, CLOSE (npc-creatures): one creature of each kind set down by you in the park, told to walk away along x, a few frames of
// its walk and of its standing, close up; CREATDBG and the page's errors.   node tests/creatact.cjs [outprefix] [hour] [kinds] [at=x,z[,height]]
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); });
  const out=process.argv[2]||'creat', hour=process.argv[3]||'14', kinds=(process.argv[4]||'rat,frog,slime,snake,spider,bat,wasp').split(','), at=process.argv[5]||'1,28';
  await pg.goto('file://'+process.cwd()+'/dist/market.html?at='+at+'&hour='+hour+'&npcwait=60',{timeout:180000}); await pg.waitForTimeout(22000);
  for(let k=0;k<4;k++){ await pg.mouse.move(500,350); await pg.mouse.wheel(0,-250); await pg.waitForTimeout(150); } await pg.waitForTimeout(1000);
  for(const kind of kinds){ await pg.evaluate(kind=>{ for(const N of CREATS){ N.st.to=null; N.st.wait=99; N.st.x=-200; N.g.visible=false; } /* (the rest out of the way) */ const N=CREATS.find(N=>N.key===kind); N.st.x=0.4; N.st.z=28.6; N.st.h=Math.PI/2; N.st.to={x:N.st.x+2.2,z:N.st.z}; N.st.wait=99; N.g.visible=true; if(kind==='bat'&&!N.low){ N.low=1; const t0=N.tick; N.tick=(dt,you)=>{ t0(dt,you); N.g.position.y-=5.4; }; } /* (the bat brought down into view) */ },kind);
    for(let f=0;f<3;f++){ await pg.waitForTimeout(f?350:900); await pg.screenshot({path:out+'_'+kind+'_walk'+f+'.png'}); }
    await pg.evaluate(kind=>{ const N=CREATS.find(N=>N.key===kind); N.st.to=null; N.st.wait=99; },kind);
    for(let f=0;f<2;f++){ await pg.waitForTimeout(f?700:900); await pg.screenshot({path:out+'_'+kind+'_idle'+f+'.png'}); }
    console.log(kind,await pg.evaluate(kind=>JSON.stringify(CREATDBG().find(c=>c.key===kind)),kind)); }
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
