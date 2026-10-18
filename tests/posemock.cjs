// STANDING POSES BY THEIR NUMBERS, the mockups: node tests/posemock.cjs <outdir> <body> <poses.json>: each pose ({name: {changes}}) on that body
// (?body=) in the studio, front, three quarters, side
const {chromium}=require('playwright'), fs=require('fs'), out=process.argv[2]||'.', body=process.argv[3]||'A', P=JSON.parse(fs.readFileSync(process.argv[4],'utf8'));
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:900,height:700}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=13&fresh=1&body='+body); await pg.waitForFunction(()=>window.__started,null,{timeout:240000}); await pg.waitForTimeout(4000);
  await pg.keyboard.press('Shift+K'); await pg.waitForTimeout(2000); await pg.click('#av [data-t="pose"]'); await pg.waitForTimeout(500);
  for(const n of Object.keys(P)){ await pg.evaluate(d=>AVPOSED(d),P[n]);
    const r=await pg.evaluate(()=>{ const {J}=AVJ(), f=v=>[+v.x.toFixed(1),+v.y.toFixed(1),+v.z.toFixed(1)]; return {wL:f(J.wristL),eL:f(J.elbowL),wR:f(J.wristR)}; }); console.log(n,JSON.stringify(r));
    for(const [v,y,p] of [['front',0,.1],['q',Math.PI/4,.3],['side',Math.PI/2,.1]]){ await pg.evaluate(([y,p])=>STUDIOTURN(y,p),[y,p]); await pg.waitForTimeout(900);
      await pg.screenshot({path:`${out}/${n}-${v}.png`,clip:{x:0,y:0,width:520,height:700}}); } }
  await b.close(); })();
