// THE AIR (134e-distfog.js): the mist, the sun in it and the land's rim seen from the park's open lawn in third person, by day, at dusk and at night, and from the street. node tests/airshot.cjs <out> [air=0 to see it without]
const {chromium}=require('playwright'), out=process.argv[2]||'.', off=process.argv[3]==='air=0';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:620}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message)); pg.on('console',m=>{ if(m.type()==='error'&&/Shader Error|WebGLProgram/.test(m.text()))console.log('console:',m.text().slice(0,400)); });
  const load=async q=>{ await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&wx=clear'+q,{waitUntil:'commit',timeout:180000}); for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(6000); };
  await load(''); const AT=await pg.evaluate(()=>{ const {BOD,PARK}=__dbg.MAPK; return [BOD.XS(PARK.round[0]+PARK.ox-16),BOD.ZS(PARK.round[1]+PARK.oy+11)]; });
  for(const [name,q] of [['lawn-noon',`&at=${AT}&hour=12&view=follow`],['lawn-dusk',`&at=${AT}&hour=17.4&view=follow`],['lawn-night',`&at=${AT}&hour=21&view=follow`],['street-noon','&at=-2.2,3.2&hour=12&view=follow']]){
    await load(q); if(off)await pg.evaluate(()=>DFOG.set({air:0,mist:0,sun:0,rim:0})); await pg.waitForTimeout(12000);
    await pg.screenshot({path:`${out}/${name}${off?'-off':''}.png`,timeout:180000}); console.log(name,await pg.evaluate(()=>{ const u=DFOG.pass.uniforms.uA.value; return 'air '+u.x.toExponential(2)+' mist '+u.y.toExponential(2); })); }
  await b.close(); })();
