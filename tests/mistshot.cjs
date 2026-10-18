// THE MIST (skyline.js, FAR3.mist): his liked shot again (the park by the cave at 5:24 pm, low), and the game's own views at other hours. node tests/mistshot.cjs <out>
const {chromium}=require('playwright'), out=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:620}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  const load=async q=>{ await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&wx=clear'+q,{waitUntil:'commit',timeout:180000}); for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(6000); };
  await load(''); const AT=await pg.evaluate(()=>{ const {BOD,PARK}=__dbg.MAPK; return [BOD.XS(PARK.round[0]+PARK.ox-16),BOD.ZS(PARK.round[1]+PARK.oy+11)]; });
  for(const [name,q,cam] of [['park-low-1724',`&at=${AT}&hour=17.4&view=map`,[2.3,0.2,1.3]],['street-iso-1530','&at=-2.2,3.2&hour=15.5',null],['street-iso-noon','&at=-2.2,3.2&hour=12',null],['street-iso-night','&at=-2.2,3.2&hour=21',null],['street-behind-1530','&at=-2.2,3.2&hour=15.5&view=follow',null],['street-behind-1530-oldhaze','&at=-2.2,3.2&hour=15.5&view=follow&mist=0',null]]){
    await load(q); if(cam)await pg.evaluate(c=>__dbg.cam(c[0],c[1],__dbg.cv().PPU*c[2]),cam); await pg.waitForTimeout(14000);
    await pg.screenshot({path:`${out}/${name}.png`}); console.log(name,await pg.textContent('#stat').catch(()=>'')); }
  await b.close(); })();
