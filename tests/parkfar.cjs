// THE PARK RUNS ON (park.js's far lawns): from his eyes and behind him at the corner's far edge, toward the park's east and north. node tests/parkfar.cjs <out> [extra query]
const {chromium}=require('playwright'), out=process.argv[2]||'.', extra=process.argv[3]||'';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:620}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  const load=async q=>{ await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&wx=clear'+(extra?'&'+extra:'')+q,{waitUntil:'commit',timeout:180000}); for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(5000); };
  await load(''); const S=await pg.evaluate(()=>{ const {BOD,RING,PARK}=__dbg.MAPK, C=RING.cf; return {ne:[BOD.XS(C.x1-6),BOD.ZS(C.y1-6)],mid:[BOD.XS((PARK.x0+PARK.x1)/2+PARK.ox),BOD.ZS(C.y1-5)],C,P:[PARK.x0,PARK.x1,PARK.y0,PARK.y1,PARK.ox,PARK.oy],z:[BOD.ZS(C.y0),BOD.ZS(C.y1)]}; }); console.log(JSON.stringify(S));
  for(const [name,q,cam] of [['first-ne',`&at=${S.ne}&hour=15&view=first`,[Math.PI*0.75,0.05]],['first-n',`&at=${S.mid}&hour=15&view=first`,[Math.PI,0.05]],['behind-ne',`&at=${S.ne}&hour=15&view=follow`,[Math.PI*0.75,0.25]],['iso-ne',`&at=${S.ne}&hour=15`,null],['first-ne-night',`&at=${S.ne}&hour=21&view=first`,[Math.PI*0.75,0.05]]]){
    await load(q); if(cam)await pg.evaluate(c=>__dbg.cam(c[0],c[1]),cam); await pg.waitForTimeout(9000);
    await pg.screenshot({path:`${out}/${name}.png`}); console.log(name,await pg.evaluate(()=>[__dbg.tris&&__dbg.tris(),__dbg.cv().yaw,__dbg.cv().pitch]).catch(e=>e.message)); }
  await b.close(); })();
