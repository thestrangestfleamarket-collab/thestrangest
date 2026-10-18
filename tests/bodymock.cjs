// HIS BUILD AT THE ROOT, the mockups: node tests/bodymock.cjs <outdir> [A,B,C,D]: each body (?body=) in the studio, relaxed, front, side, three quarters
const {chromium}=require('playwright'), out=process.argv[2]||'.', bs=(process.argv[3]||'A,B,C,D').split(',');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  for(const k of bs){ const pg=await b.newPage({viewport:{width:900,height:700}}); pg.on('pageerror',e=>console.log(k,'pageerror:',e.message));
    await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=13&fresh=1&body='+k); await pg.waitForFunction(()=>window.__started,null,{timeout:240000}); await pg.waitForTimeout(4000);
    await pg.keyboard.press('Shift+K'); await pg.waitForTimeout(2000); await pg.click('#av [data-t="pose"]'); await pg.waitForTimeout(500);
    for(const pose of ['RELAXED','HANDS ON HIPS']){ await pg.evaluate(n=>AVPOSE(n),pose);
      const r=await pg.evaluate(()=>AVJ().why.filter(w=>/^arm/.test(w)).length); console.log(k,pose,'arm overlaps',r);
      for(const [v,y,p] of [['front',0,.1],['side',Math.PI/2,.1],['q',Math.PI/4,.3]]){ await pg.evaluate(([y,p])=>STUDIOTURN(y,p),[y,p]); await pg.waitForTimeout(900);
        await pg.screenshot({path:`${out}/${k}-${pose.replace(/\W+/g,'_')}-${v}.png`,clip:{x:0,y:0,width:520,height:700}}); } }
    await pg.close(); }
  await b.close(); })();
