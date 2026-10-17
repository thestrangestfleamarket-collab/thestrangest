// THE AVATAR EDITOR (src/avatar.js), each tab: node tests/avshot.cjs <outdir>  (the page opened, Shift+K, a screenshot a tab, every page error printed)
const {chromium}=require('playwright'), out=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1100,height:760}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message)); pg.on('console',m=>{ if(m.type()==='error')console.log('error',m.text().slice(0,300)); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=13'); await pg.waitForTimeout(30000);
  await pg.keyboard.press('Shift+K'); await pg.waitForTimeout(3000);
  console.log('AV.on', await pg.evaluate(()=>({on:__dbg.AV.on,ed:__dbg.ED.on,hidden:document.getElementById('av').hidden})));
  for(const t of ['body','look','tex','outl','shade','pre']){ await pg.click(`#av [data-t="${t}"]`); await pg.waitForTimeout(400);
    if(t==='tex'){ await pg.click('#av [data-g="0"][data-pt="2"]'); await pg.click('#av [data-g="1"][data-pt="3"]'); await pg.waitForTimeout(1500); }
    if(t==='outl'){ await pg.click('#avoon'); await pg.click('#av [data-w="2"]'); await pg.waitForTimeout(1500); }
    if(t==='body'){ await pg.click('#av [data-o="pointed"]'); await pg.waitForTimeout(800); }
    if(t==='shade'){ await pg.click('#avst2'); await pg.waitForTimeout(800); }
    await pg.screenshot({path:`${out}/av-${t}.png`}); console.log('shot',t); }
  await pg.click('#avdone'); await pg.waitForTimeout(1500); console.log('after DONE', await pg.evaluate(()=>({on:__dbg.AV.on,ed:__dbg.ED.on,hidden:document.getElementById('av').hidden,view:__dbg.UI.view})));
  await pg.screenshot({path:`${out}/av-done.png`}); await b.close(); })();
