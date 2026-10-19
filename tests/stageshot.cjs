// THE STORED BAR'S STAGE (pianist.js, singer.js, drummer.js): from the bar's floor before the stage, close, a few frames apart; the page's errors
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}}); pg.setDefaultTimeout(180000);
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message.slice(0,300),(e.stack||'').split('\n').slice(1,3).join(' / ').slice(0,300)); });
  const out=process.argv[2]||'stage', zoom=+(process.argv[3]||3);
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=22&npcwait=60&place=THE%20BAR',{timeout:240000}); await pg.waitForTimeout(25000);
  await pg.evaluate(()=>{ STORE.ensure(); const S=STORE.bar, B=S.B; STORE.pos.set(STORE.XYZ.X(S.stage.x-2.2),0,STORE.XYZ.Z(B.y0+5.5)); }); await pg.waitForTimeout(2000);
  for(let k=0;k<Math.abs(zoom);k++){ await pg.mouse.move(500,350); await pg.mouse.wheel(0,zoom<0?250:-250); await pg.waitForTimeout(150); } await pg.waitForTimeout(1500);
  for(let f=0;f<3;f++){ await pg.screenshot({path:out+'_'+f+'.png'}); await pg.waitForTimeout(900); }
  console.log(await pg.evaluate(()=>JSON.stringify({room:STORE.cur,pnm:!!STORE.PNM.g,sgm:!!STORE.SGM.g,drm:!!STORE.DRM.g,pos:[+STORE.pos.x.toFixed(1),+STORE.pos.z.toFixed(1)]}))); console.log('errors',JSON.stringify(errs)); await b.close(); })();
