// THE STREET'S CHARACTERS (npc-street): the leopard, the cat and the ghost on the sidewalk, a few moments apart, and the page's errors
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); }); pg.on('console',m=>{ if(m.type()==='error'||m.type()==='warning')console.log(m.type(),m.text().slice(0,300)); });
  const at=process.argv[2]||'', out=process.argv[3]||'street', zoom=+(process.argv[4]||0);
  await pg.goto('file://'+process.cwd()+'/dist/market.html'+at,{timeout:180000}); await pg.waitForTimeout(25000); for(let i=0;i<Math.abs(zoom);i++){ await pg.mouse.move(500,350); await pg.mouse.wheel(0,zoom<0?-250:250); await pg.waitForTimeout(150); } await pg.waitForTimeout(1500);
  for(let i=0;i<4;i++){ await pg.screenshot({path:out+i+'.png'}); console.log(i,await pg.textContent('#stat'),await pg.evaluate(()=>typeof STREET!=='undefined'?STREET.npcs.map(N=>N.key+' '+N.st.x.toFixed(1)+','+N.st.y.toFixed(2)+','+N.st.z.toFixed(1)+(N.st.move?' '+N.st.move.name:'')+(N.st.moving?' >':'')+(N.st.ground?'':' air')).join(' | ')+' phys '+STREET.ready+' R '+!!(STREET.PB&&STREET.PB.R)+' loading '+!!(STREET.PB&&STREET.PB.loading):'no STREET')); await pg.waitForTimeout(6000); }
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
