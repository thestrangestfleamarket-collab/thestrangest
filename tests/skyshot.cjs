// THE SKY (sky.js): the sky at a few hours of the evening, from the street, in first person looking west at the sun (a) and east away from it (b),
// and the map view tilted low (m); the page's errors. node tests/skyshot.cjs [out prefix] [hours, e.g. 17.3,18.1,18.6,19.2,21]
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); });
  const out=process.argv[2]||'sky', hours=(process.argv[3]||'17.3,18.1,18.6,19.2,21').split(',').map(Number), wx=process.argv[4]||'clear';
  for(const h of hours){ const tag=String(h).replace('.','_');
    await pg.goto(`file://${process.cwd()}/dist/market.html?at=0,3&hour=${h}&hideme=1&npcwait=99&view=first&wx=${wx}`,{waitUntil:'commit',timeout:180000});
    for(let i=0;i<120&&!(await pg.evaluate(()=>!!window.__started));i++)await pg.waitForTimeout(500); await pg.waitForTimeout(6000);
    // look at the sun (the clock's own direction), then straight away from it, a little up
    const yaw=await pg.evaluate(()=>{ const d=window.SKY?SKY.U.uSunDir.value:{x:-1,z:0}; return Math.atan2(d.x,d.z); });
    const aim=async y=>{ await pg.evaluate(async y=>{ const c=__dbg.camO(), V=new c.position.constructor(), wait=()=>new Promise(r=>setTimeout(r,500));
        for(let i=0;i<5;i++){ c.getWorldDirection(V); const have=Math.atan2(V.x,V.z), cv=__dbg.cv(); let dy=((y-have+Math.PI*3)%(Math.PI*2))-Math.PI; if(Math.abs(dy)<.02)break;
          __dbg.cam(cv.yaw+dy*(window.__ys||1),.1); await wait(); c.getWorldDirection(V); const h2=Math.atan2(V.x,V.z); if(i===0&&Math.abs(((y-h2+Math.PI*3)%(Math.PI*2))-Math.PI)>Math.abs(dy))window.__ys=-1; } },y); await pg.waitForTimeout(800); };
    for(const [k,y] of [['a',yaw],['b',yaw+Math.PI]]){ await aim(y); await pg.screenshot({path:`${out}-${tag}${k}.png`}); }
    console.log(h,await pg.textContent('#stat').catch(()=>''),await pg.evaluate(()=>typeof SKY!=='undefined'?JSON.stringify(SKY.dbg&&SKY.dbg()):'no SKY')); }
  // the same from behind him (third person), at the first hour, toward the sun
  await pg.goto(`file://${process.cwd()}/dist/market.html?at=0,3&hour=${hours[0]}&npcwait=99&view=third&wx=${wx}`,{waitUntil:'commit',timeout:180000});
  for(let i=0;i<120&&!(await pg.evaluate(()=>!!window.__started));i++)await pg.waitForTimeout(500); await pg.waitForTimeout(6000);
  { const y=await pg.evaluate(()=>{ const d=SKY.U.uSunDir.value; return Math.atan2(d.x,d.z); }); await pg.evaluate(y=>{ const cv=__dbg.cv(); __dbg.cam(y+Math.PI,.25); },y); await pg.waitForTimeout(2000); await pg.screenshot({path:`${out}-third.png`}); }
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
