// THE MAP EDITOR'S NEXT ROUND (mapedit.js): the bodega carried live (its faces hidden where they were, a copy moved), the bar lifted and the
// diner sized live, PLACE, RESET; then the saved layout built (the bar up four tiles, the diner a third bigger). node tests/mapedit4.cjs <outdir>
const {chromium}=require('playwright'), out=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1100,height:760}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message.slice(0,300)));
  const start=async()=>{ for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))return; } throw 'never started'; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=13&npcwait=99&layout=0',{waitUntil:'commit',timeout:180000}); await start(); await pg.waitForTimeout(8000);
  await pg.keyboard.press('Shift+M'); await pg.waitForTimeout(2500);
  await pg.evaluate(()=>{ MAPED.sel('bodega'); __dbg.cam(0.7,0.6,__dbg.cv().PPU*0.45); }); await pg.waitForTimeout(3000);
  for(let i=0;i<4;i++){ await pg.keyboard.down('Shift'); await pg.keyboard.press('ArrowRight'); await pg.keyboard.up('Shift'); } await pg.waitForTimeout(400);
  for(let i=0;i<3;i++){ await pg.keyboard.down('Shift'); await pg.keyboard.press('ArrowUp'); await pg.keyboard.up('Shift'); } await pg.waitForTimeout(3000);
  console.log('bodega carried', JSON.stringify(await pg.evaluate(()=>({work:MAPED.work(),car:MAPED.car('bodega')}))));
  await pg.screenshot({path:`${out}/me4-bodega.png`});
  await pg.evaluate(()=>{ MAPED.lift('bar',4); MAPED.size('diner',1.3); MAPED.sel('bar'); const bx=MAPED.box('bar'); __dbg.UI.off.set((bx[0]+bx[2])/2-__dbg.cv().pos[0],0,(bx[1]+bx[3])/2-__dbg.cv().pos[1]); __dbg.cam(0.9,0.5,__dbg.cv().PPU*0.5); }); await pg.waitForTimeout(4000);
  console.log('bar, diner', JSON.stringify(await pg.evaluate(()=>({work:MAPED.work(),bar:MAPED.car('bar'),diner:MAPED.car('diner')}))));
  await pg.screenshot({path:`${out}/me4-barlift.png`});
  await pg.click('#meP'); await pg.waitForTimeout(500); console.log('after PLACE sel', await pg.evaluate(()=>MAPED.sel()));
  await pg.click('#meRA'); await pg.waitForTimeout(1500); console.log('after RESET ALL', JSON.stringify(await pg.evaluate(()=>({work:MAPED.work(),car:[MAPED.car('bodega'),MAPED.car('bar'),MAPED.car('diner')]}))));
  await pg.screenshot({path:`${out}/me4-reset.png`});
  // the saved layout, built
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=21&npcwait=99&place=the bar&layout='+encodeURIComponent('{"bar":{"h":4},"diner":{"s":1.3}}'),{waitUntil:'commit',timeout:180000}); await start(); await pg.waitForTimeout(10000);
  console.log('built', JSON.stringify(await pg.evaluate(()=>{ const R=STORE.rooms.find(r=>r.id==='bar'), D=STORE.rooms.find(r=>r.id==='diner'); return {barFy:R&&+R.fy.toFixed(2),barY:[R.y0,R.y1].map(v=>+v.toFixed(2)),stack:STORE.stack.map(r=>r.id),py:+__dbg.cv().pos[0].toFixed(1),pos:__dbg.cv().pos,dinerW:D&&+(D.x1-D.x0).toFixed(2),ground:STORE.stackGround(__dbg.cv().pos[0],__dbg.cv().pos[1])}; })));
  await pg.screenshot({path:`${out}/me4-built-bar.png`});
  await pg.evaluate(()=>{ __dbg.cam(0.9,0.45,__dbg.cv().PPU*0.4); __dbg.UI.off.set(0,0,0); }); await pg.waitForTimeout(4000); await pg.screenshot({path:`${out}/me4-built-wide.png`});
  await b.close(); })();
