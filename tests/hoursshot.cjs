// THE HOURS (134b): each of the four looks from the street, down toward the skyline and toward the sunset side. node tests/hoursshot.cjs <outdir>
const {chromium}=require('playwright'); const out=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  for(const k of ['day','night']){ const pg=await b.newPage({viewport:{width:1000,height:620}}); pg.on('pageerror',e=>console.log('pageerror:',e.message.slice(0,120)));
    await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&view=first&at=-2.2,3.2&hideme=1&npcwait=99&look='+k,{waitUntil:'commit',timeout:180000});
    for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; }
    await pg.waitForTimeout(5000);
    for(const [tag,y] of [['street',-1.1],['sunset',.5]]){ await pg.evaluate(y=>__dbg.cam(y,.08),y); await pg.waitForTimeout(8000); await pg.screenshot({path:`${out}/hours-${k}-${tag}.png`}); }
    console.log(k,await pg.evaluate(()=>JSON.stringify({mode:DN.mode,h:+CLOCK.h.toFixed(2),bands:SKY.U.uBands.value,clouds:SKY.CU.n,fog:'#'+FAR3.fog.color.getHexString()}))); await pg.close(); }
  await b.close(); })();
