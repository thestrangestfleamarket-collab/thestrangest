// THE SIX FIGURES, CLOSE (npc-figures): one figure told a move (and a walk), close up, a few frames in; FIGDBG and the page's errors
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); });
  const i=+(process.argv[2]||0), at=process.argv[3]||'?at=-15,5', out=process.argv[4]||'act', moves=(process.argv[5]||'walk,slash,jump,wave').split(',');
  await pg.goto('file://'+process.cwd()+'/dist/market.html'+at+'&hour=14',{timeout:180000}); await pg.waitForTimeout(22000);
  for(let k=0;k<3;k++){ await pg.mouse.move(500,350); await pg.mouse.wheel(0,-250); await pg.waitForTimeout(150); } await pg.waitForTimeout(1000);
  for(const m of moves){ await pg.evaluate(([i,m])=>{ const N=FIGURES[i]; N.fig.move=null; if(m==='walk'){ N.st.to={x:N.st.x+6,z:N.st.z}; N.st.wait=99; } else { N.st.to=null; N.st.wait=99; N.act(m); } },[i,m]);
    await pg.waitForTimeout(m==='walk'?1200:700); await pg.screenshot({path:out+'_'+m+'.png'}); console.log(m,await pg.evaluate(()=>JSON.stringify(FIGDBG()[0]))); await pg.waitForTimeout(1500); }
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
