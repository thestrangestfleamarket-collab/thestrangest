// A LOOK AT A SPOT (the house, the street's dressing, the subway, the dragon): node tests/townshot.cjs <x,z[,y]> <out> [zoomSteps] [sharper] [turnDeg] ; the errors once each
const {chromium}=require('playwright');
(async()=>{ const [at,out,zoom='0',sharp='0',turn='0']=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; }); pg.on('console',m=>{ if(m.type()==='warning'&&/no |kit|street|apts|house/.test(m.text()))console.log('warn',m.text().slice(0,200)); });
  let AT=at; if(at.startsWith('npc:')){ const [key,...rs]=at.slice(4).split('&'), rest=rs.join('&'); await pg.goto('file://'+process.cwd()+'/dist/market.html?at=0,3',{timeout:180000}); await pg.waitForTimeout(20000);
    const L=await pg.evaluate(()=>(typeof RIGDBG!=='undefined'?RIGDBG():[]).concat(typeof STDBG!=='undefined'?STDBG():[])); console.log('figures',JSON.stringify(L)); const N=L.find(n=>n.key===key); AT=(N?(N.x+2.4).toFixed(2)+','+(N.z+1.8).toFixed(2):'0,3')+(rest?'&'+rest:''); }
  await pg.goto('file://'+process.cwd()+'/dist/market.html?at='+AT,{timeout:180000}); await pg.waitForTimeout(22000);
  for(let i=0;i<+sharp;i++){ await pg.keyboard.press('='); await pg.waitForTimeout(150); } for(let i=0;i<Math.abs(+zoom);i++){ await pg.mouse.move(500,350); await pg.mouse.wheel(0,+zoom<0?-250:250); await pg.waitForTimeout(150); }
  const t=+turn; if(t){ await pg.evaluate(a=>{ yawTo+=a; },t*Math.PI/180).catch(()=>{}); }
  await pg.waitForTimeout(2500); await pg.screenshot({path:out+'.png'}); console.log(out,await pg.textContent('#stat'),'errors',JSON.stringify(errs),await pg.evaluate(()=>typeof APTSDBG!=='undefined'?JSON.stringify(APTSDBG()):'').catch(e=>String(e))); await b.close(); })();
