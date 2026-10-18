// HIS BODY IN A T-POSE, every side: node tests/tpose.cjs <outdir> [body] [tag]: the studio, his arms straight out, front, back, both sides, three
// quarters, from above; his joints written to <outdir>/<tag>-joints.json, and what passes through what
const {chromium}=require('playwright'), fs=require('fs'), out=process.argv[2]||'.', body=process.argv[3]||'', tag=process.argv[4]||'t';
const T={'L.ua0':-3,'R.ua0':-3,'L.ua1':84,'R.ua1':84,'L.fa1':3,'R.fa1':3,'L.fa0':-18,'R.fa0':-18};   // (from his standing: the upper arm 3 forward and 6 out, the forearm 21 forward and 3 out)
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:900,height:700}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=13&fresh=1'+(body?'&body='+body:'')); await pg.waitForFunction(()=>window.__started,null,{timeout:240000}); await pg.waitForTimeout(4000);
  await pg.keyboard.press('Shift+K'); await pg.waitForTimeout(2000); await pg.click('#av [data-t="pose"]'); await pg.waitForTimeout(500);
  await pg.evaluate(d=>AVPOSED(d),T);
  const r=await pg.evaluate(()=>{ const {J,why}=AVJ(), o={}; for(const k in J){ const v=J[k]; if(v&&v.x!=null&&!/^k\d/.test(k))o[k]=[+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2)]; } return {J:o,why}; });
  fs.writeFileSync(`${out}/${tag}-joints.json`,JSON.stringify(r,null,1)); console.log('overlaps',r.why.length,r.why.slice(0,12).join(' '));
  const d0=await pg.evaluate(()=>STUDIODBG().dist);
  for(const [v,y,p,k] of [['front',0,0,1],['back',Math.PI,0,1],['left',Math.PI/2,0,1],['right',-Math.PI/2,0,1],['q',Math.PI/4,.3,1],['top',0,1.45,1]]){ await pg.evaluate(([y,p,d])=>STUDIOTURN(y,p,d),[y,p,d0*k]); await pg.waitForTimeout(900);
    await pg.screenshot({path:`${out}/${tag}-${v}.png`,clip:{x:0,y:0,width:520,height:700}}); }
  await b.close(); })();
