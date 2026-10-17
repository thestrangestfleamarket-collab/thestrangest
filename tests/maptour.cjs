const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const T=33.9/30, shots=[['platform',`${-12.43},${-24.86},-3.77`],['pool',`${32.77},${-2.26}`],['bodega',`0,${-3.39}`],['stairs',`${-12.43},0,-1.9`]];
  for(const [n,at] of shots){ const pg=await b.newPage({viewport:{width:900,height:620}}); pg.on('pageerror',e=>console.log(n,'pageerror:',e.message));
    await pg.goto('file://'+process.cwd()+'/dist/market.html?at='+at); await pg.waitForTimeout(24000); await pg.keyboard.press('h'); await pg.screenshot({path:'tour-'+n+'.png'}); console.log(n,await pg.textContent('#stat')); await pg.close(); }
  // walk down the stairs from the top
  const pg=await b.newPage({viewport:{width:900,height:620}}); pg.on('pageerror',e=>console.log('walk pageerror:',e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?at='+`${-12.43},3.6`); await pg.waitForTimeout(22000); await pg.keyboard.press('h');
  await pg.keyboard.down('w'); await pg.waitForTimeout(9000); await pg.keyboard.up('w'); await pg.waitForTimeout(3000); await pg.screenshot({path:'tour-walkdown.png'});
  await b.close(); })();
