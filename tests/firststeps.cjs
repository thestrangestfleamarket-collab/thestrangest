// FIRST STEPS (owner, 11 Nov 2026: "C"): node tests/firststeps.cjs <out>: the beta welcome shows first (<out>-welcome.png), GOT IT brings the checklist, walking, running, the view, the pack and the map tick themselves off (<out>-steps.png); exits 1 if a step fails to tick.
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]||'firststeps'; const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1280,height:720}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&welcome=1&npcwait=99',{timeout:180000,waitUntil:'commit'});
  for(let i=0;i<200&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000);
  await pg.waitForSelector('#fwel',{state:'visible',timeout:60000}); await pg.waitForTimeout(4000); await pg.screenshot({path:out+'-welcome.png'});
  await pg.click('#fwel .go'); await pg.waitForTimeout(1500);
  await pg.keyboard.down('KeyW'); await pg.keyboard.down('Shift'); await pg.waitForTimeout(1500); await pg.keyboard.up('Shift'); await pg.keyboard.up('KeyW');
  await pg.keyboard.press('KeyV'); await pg.waitForTimeout(1500);
  await pg.keyboard.press('KeyI'); await pg.waitForTimeout(1500); await pg.keyboard.press('Escape'); await pg.waitForTimeout(800);
  await pg.keyboard.press('Shift+M'); await pg.waitForTimeout(2000); await pg.keyboard.press('Escape'); await pg.waitForTimeout(800);
  const done=await pg.evaluate(()=>[...document.querySelectorAll('#fsteps .t')].map(t=>t.classList.contains('d')));
  console.log('ticked',JSON.stringify(done)); await pg.screenshot({path:out+'-steps.png'});
  const ok=done[0]&&done[1]&&done[4]&&done[5]&&!done[2]&&!done[3]; console.log(ok?'PASS':'FAIL','errors',Object.keys(errs)); await b.close(); process.exit(ok?0:1); })();
