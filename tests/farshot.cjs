// THE FAR (skyline.js): the haze and the skyline seen from his eyes down the street and from the isometric opening, by day and at seven;
// node tests/farshot.cjs <outdir> [far=0 to see it without]
const {chromium}=require('playwright'); const out=process.argv[2]||'.', extra=process.argv[3]||'', only=process.argv[4];   // (a 4th argument: only the shots whose name has it)
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  for(const [name,q,drag] of [['first-day','view=first&hour=13&at=-30,3.2',[520,-40]],['first-7pm','view=first&hour=19&at=-30,3.2',[520,-40]],['iso-day','view=iso&hour=13',null],['third-day','view=third&hour=13&at=-30,3.2',[520,-60]]]){
    if(only&&!name.includes(only))continue; const pg=await b.newPage({viewport:{width:1000,height:700}}); pg.on('pageerror',e=>console.log('pageerror:',e.message));
    await pg.goto('file://'+process.cwd()+'/dist/market.html?'+q+(extra?'&'+extra:'')); await pg.waitForTimeout(30000);
    if(drag){ await pg.mouse.move(500,350); await pg.mouse.down({button:'right'}); await pg.mouse.move(500+drag[0],350+drag[1],{steps:12}); await pg.mouse.up({button:'right'}); }
    await pg.waitForTimeout(3000); await pg.screenshot({path:out+'/far-'+name+'.png'}); console.log(name, await pg.evaluate(()=>FAR3&&{n:FAR3.n,tris:FAR3.tris,on:FAR3.on,fog:!!FAR3.fog,near:FAR3.fog.near,far:FAR3.fog.far}).catch(e=>e.message)); await pg.close(); }
  await b.close(); })();
