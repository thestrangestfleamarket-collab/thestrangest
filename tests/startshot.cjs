// THE OPENING VIEW (owner, 17 Oct 2026, his picture of the dojo: "i want the game to always start you this distance and at this isometric
// angle"): node tests/startshot.cjs <out.png> [place] [view] [width] [height] [keys to press, as 'q' or 'vv']: the page as it opens, taken to a place of the menu's (THE BATHS), at night
const {chromium}=require('playwright');
(async()=>{ const [out,place='THE BATHS',view='',w='1095',h='765',press='']=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:+w,height:+h}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour='+(process.env.HOUR||22)+(view?'&view='+view:''),{timeout:180000}); await pg.waitForTimeout(24000);
  const ok=await pg.evaluate(p=>{ const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===p); if(b){ b.click(); return true; } return false; },place);
  await pg.waitForTimeout(5000); if(await pg.evaluate(()=>{ const m=document.getElementById('menu'); return m&&!m.hidden&&getComputedStyle(m).display!=='none'; }))await pg.keyboard.press('Escape'); await pg.waitForTimeout(1500); for(const k of press)if(k!==' '){ await pg.keyboard.press(k); await pg.waitForTimeout(400); } await pg.waitForTimeout(2000);
  await pg.screenshot({path:out}); console.log('place',ok,'errors',Object.keys(errs)); await b.close(); })();
