// THE MAP (owner, 10 Nov 2026: "B", a section of the menu): node tests/brochure.cjs <out>: Shift+M opens it on STREET (<out>-street.png), the wheel zooms (<out>-zoom.png), SUBWAY, UNDERGROUND and GO TO (pictures of each), typing in GO TO and Enter goes there, a click on a numbered place goes there, Shift+M closes it
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]||'map'; const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1280,height:720}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,6&npcwait=99',{timeout:180000,waitUntil:'commit'});
  for(let i=0;i<200&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000); await pg.waitForTimeout(8000);
  await pg.keyboard.press('Shift+M'); await pg.waitForTimeout(2500); console.log('street',JSON.stringify(await pg.evaluate(()=>BRODBG()))); await pg.screenshot({path:out+'-street.png'});
  const vb=()=>pg.evaluate(()=>document.querySelector('#dbro svg.mv').getAttribute('viewBox')); const v0=await vb(), r=await pg.evaluate(()=>{ const q=document.querySelector('#dbro svg.mv').getBoundingClientRect(); return [q.x+q.width/2,q.y+q.height*.8]; });
  await pg.mouse.move(r[0],r[1]); for(let i=0;i<3;i++){ await pg.mouse.wheel(0,-100); await pg.waitForTimeout(200); } const v1=await vb(); console.log('zoom',v0,'->',v1,v0!==v1); await pg.screenshot({path:out+'-zoom.png'});
  const box=()=>pg.evaluate(()=>{ const q=document.querySelector('#menu .box').getBoundingClientRect(); return [Math.round(q.x),Math.round(q.y)]; }), b0=await box();
  await pg.mouse.move(r[0],r[1]); await pg.mouse.down(); await pg.mouse.move(r[0]-120,r[1]-60,{steps:6}); await pg.mouse.up(); const v2=await vb(), b1=await box();
  console.log('drag moves the map',v1!==v2,'not the menu',JSON.stringify(b0)===JSON.stringify(b1));
  const fill=await pg.evaluate(()=>{ const s=document.querySelector('#dbro svg.mv').getBoundingClientRect(), p=document.querySelector('#menu .panes').getBoundingClientRect(); return s.width>=p.width-4&&s.height>=p.height-4; }); console.log('the map fills its pane',fill);
  await pg.click('#dbro [data-z="1"]'); const v3=await vb(); await pg.click('#dbro [data-z="0"]'); const N=v=>v.split(' ').map(Number).join(' '); console.log('+ zooms',v3!==v2,'◎ the whole map',N(await vb())===N(v0)); await pg.screenshot({path:out+'-fill.png'});
  for(const t of ['subway','under','goto']){ await pg.evaluate(t=>__UI.brochure.open(t),t); await pg.waitForTimeout(1500); console.log(t,JSON.stringify(await pg.evaluate(()=>BRODBG()))); await pg.screenshot({path:out+'-'+t+'.png'}); }
  await pg.keyboard.type('bod'); await pg.waitForTimeout(400); console.log('typed',await pg.evaluate(()=>[...document.querySelectorAll('#dbro .gor')].map(r=>r.textContent).join('|')),'still open',await pg.evaluate(()=>BRODBG().up));
  await pg.keyboard.press('Enter'); for(let i=0;i<40&&!(await pg.evaluate(()=>!!ROOMS.cur));i++)await pg.waitForTimeout(250); console.log('after enter',JSON.stringify(await pg.evaluate(()=>({up:BRODBG().up,room:ROOMS.cur&&(ROOMS.cur.off||ROOMS.cur.id)||null}))));
  await pg.waitForTimeout(3000); await pg.evaluate(()=>__UI.mapWindow()); await pg.waitForTimeout(2500);
  await pg.evaluate(()=>document.querySelector('#dbro [data-go="CENTRAL PARK"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))); await pg.waitForTimeout(5000);
  console.log('after the park click',JSON.stringify(await pg.evaluate(()=>({up:BRODBG().up,at:[STORE.pos.x.toFixed(1),STORE.pos.z.toFixed(1)],room:!!ROOMS.cur}))));
  await pg.keyboard.press('Shift+M'); await pg.waitForTimeout(1500); const o=await pg.evaluate(()=>BRODBG().up); await pg.keyboard.press('Shift+M'); await pg.waitForTimeout(500); console.log('shift+m opens',o,'and closes',!(await pg.evaluate(()=>BRODBG().up)));
  console.log('errors',Object.keys(errs)); await b.close(); })();
