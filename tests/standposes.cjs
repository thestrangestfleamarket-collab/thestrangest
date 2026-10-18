// THE STANDING POSES (the avatar editor's POSE tab): node tests/standposes.cjs <outdir> [names,...]: each pose set, him from the front and the
// side in the studio, his joints (hands, elbows) and anything passing through anything printed
const {chromium}=require('playwright'), out=process.argv[2]||'.', only=process.argv[3]?process.argv[3].split(','):null;
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:900,height:700}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=13&fresh=1'); await pg.waitForFunction(()=>window.__started,null,{timeout:180000}); await pg.waitForTimeout(4000);
  await pg.keyboard.press('Shift+K'); await pg.waitForTimeout(2000); await pg.click('#av [data-t="pose"]'); await pg.waitForTimeout(500);
  const names=only||await pg.evaluate(()=>AVPOSE('RELAXED'));
  for(const n of names){ await pg.evaluate(n=>AVPOSE(n),n);
    const r=await pg.evaluate(()=>{ const {J,why}=AVJ(), f=v=>v?[+v.x.toFixed(1),+v.y.toFixed(1),+v.z.toFixed(1)]:null; return {wL:f(J.wristL),wR:f(J.wristR),eL:f(J.elbowL),eR:f(J.elbowR),hipL:f(J.hipL),sh:f(J.shoulderL),why}; });
    console.log(n, JSON.stringify(r));
    const fn=n.replace(/\W+/g,'_');
    for(const [v,y,p] of [['front',0,.1],['side',Math.PI/2,.1],['q',Math.PI/4,.3]]){ await pg.evaluate(([y,p])=>STUDIOTURN(y,p),[y,p]); await pg.waitForTimeout(900); await pg.screenshot({path:`${out}/${fn}-${v}.png`,clip:{x:0,y:0,width:520,height:700}}); } }
  await b.close(); })();
