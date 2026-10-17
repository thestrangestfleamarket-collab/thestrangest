// HIS HAIRSTYLES FROM FOUR ANGLES (owner, 17 Oct 2026: "look through hairstyles from multiple angles"): each style, close, turned a quarter at a time (Q); the page's errors
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]||'hair', which=(process.argv[3]||'0,1,2,3,4').split(',').map(Number), b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  for(const k of which){ const pg=await b.newPage({viewport:{width:900,height:700}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; });
    await pg.addInitScript(h=>{ localStorage.setItem('market-looks',JSON.stringify({name:'',sex:'M',build:0,eyes:0,hair:h,skin:1,hairc:1,eye:0,shirt:0,pants:0,shoes:0})); },k);
    await pg.goto('file://'+process.cwd()+'/dist/market.html?place=central%20park&hour=13',{timeout:180000}); await pg.waitForTimeout(25000);
    for(let i=0;i<2;i++){ await pg.mouse.move(450,350); await pg.mouse.wheel(0,-250); await pg.waitForTimeout(120); } await pg.waitForTimeout(1500);
    await pg.mouse.move(450,250); await pg.mouse.down(); await pg.mouse.move(450,330,{steps:4}); await pg.mouse.move(450,600,{steps:8}); await pg.mouse.up(); await pg.waitForTimeout(800);   // (the screen slid down: his head in the picture)
    for(let a=0;a<4;a++){ await pg.screenshot({path:`${out}${k}-${a}.png`}); await pg.keyboard.press('q'); await pg.waitForTimeout(1200); }
    // walking (the hung hair swinging): a step and a half, a shot mid-stride; then a stop and a shot at rest
    await pg.keyboard.down('d'); await pg.waitForTimeout(900); await pg.screenshot({path:`${out}${k}-walk.png`}); await pg.keyboard.up('d'); await pg.waitForTimeout(1500); await pg.screenshot({path:`${out}${k}-stop.png`});
    console.log('hair',k,'errors',JSON.stringify(errs)); await pg.close(); }
  await b.close(); })();
