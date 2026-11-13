// THE BROCHURE MAP (owner, 4 Nov 2026): node tests/brochure.cjs <out>: MAP opened on the street (the unfolded sheet, <out>-front.png), flipped to THE SUBWAY (<out>-back.png),
// a click on a numbered place (where it put him), GO TO's drop-down (<out>-goto.png; every place on the guide and MY APARTMENT; typing a name and Enter goes there), ESC folds it away
const {chromium}=require('playwright');
(async()=>{ const [out]=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1280,height:720}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,6&npcwait=99',{timeout:180000,waitUntil:'commit'});
  for(let i=0;i<300&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000); await pg.waitForTimeout(15000);
  await pg.evaluate(()=>__UI.mapWindow()); await pg.waitForTimeout(1600);
  console.log('open',JSON.stringify(await pg.evaluate(()=>BRODBG())));
  await pg.screenshot({path:out+'-front.png'});
  await pg.keyboard.press('f'); await pg.waitForTimeout(900); console.log('flipped',JSON.stringify(await pg.evaluate(()=>BRODBG())));
  await pg.screenshot({path:out+'-back.png'});
  await pg.keyboard.press('f'); await pg.waitForTimeout(500); console.log('flipped back by F (no flip box on the map, 4 Nov 2026)',JSON.stringify(await pg.evaluate(()=>BRODBG().flipped)));
  const names=await pg.evaluate(()=>__UI.brochure.places()); console.log('places',names.join(' · '));
  await pg.evaluate(()=>document.querySelector('#bro .pn .fc:not(.bk) [data-go="CENTRAL PARK"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))); await pg.waitForTimeout(4000);
  console.log('after the park click',JSON.stringify(await pg.evaluate(()=>({up:BRODBG().up,at:[STORE.pos.x.toFixed(1),STORE.pos.z.toFixed(1)],lvl:SHARED.LVL,room:!!ROOMS.cur}))));
  await pg.evaluate(()=>__UI.mapWindow()); await pg.waitForTimeout(2500);
  const dd=await pg.evaluate(()=>{ document.querySelector('#bro .gob button').click(); const o=[...document.querySelectorAll('#bro [data-goto]')].map(o=>o.dataset.goto), all=[...new Set(__UI.places().map(p=>p[0]))]; return {n:o.length,apt:!!document.querySelector('#bro .goapt'),missing:all.filter(n=>!o.includes(n))}; }); console.log('drop-down',JSON.stringify(dd));
  await pg.screenshot({path:out+'-goto.png'});
  await pg.keyboard.type('bod'); await pg.waitForTimeout(400); console.log('typed',await pg.evaluate(()=>[...document.querySelectorAll('#bro .gox .gor')].map(r=>r.textContent).join('|'))); await pg.keyboard.press('f'); console.log('f in the drop-down does not flip',!(await pg.evaluate(()=>BRODBG().flipped)));
  await pg.keyboard.press('Backspace'); await pg.keyboard.press('Enter'); for(let i=0;i<40&&!(await pg.evaluate(()=>ROOMS.cur));i++)await pg.waitForTimeout(250);
  console.log('after the drop-down',JSON.stringify(await pg.evaluate(()=>({up:BRODBG().up,room:ROOMS.cur&&(ROOMS.cur.off||ROOMS.cur.id)||null})))); await pg.waitForTimeout(3000);
  await pg.evaluate(()=>__UI.mapWindow()); await pg.waitForTimeout(2500); await pg.keyboard.press('Escape'); for(let i=0;i<40&&(await pg.evaluate(()=>BRODBG().up));i++)await pg.waitForTimeout(250);
  console.log('after esc',JSON.stringify(await pg.evaluate(()=>BRODBG())));
  console.log('errors',Object.keys(errs)); await b.close(); })();
