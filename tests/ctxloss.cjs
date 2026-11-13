// THE LOST PICTURE (19 Oct 2026, quick wins): node tests/ctxloss.cjs [page]
// Phones and tablets drop the graphics context when the game goes to the background. This loses it on purpose (WEBGL_lose_context),
// checks the page says so, brings it back, and checks the game keeps running and draws again with no page errors. Exits 1 on a failure.
const {chromium}=require('playwright'), path=require('path');
const PAGE=path.resolve(process.argv[2]||path.resolve(__dirname,'../dist/market.html'));
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:1280,height:720}}); pg.setDefaultTimeout(900000); const errs=[];
  pg.on('pageerror',e=>errs.push(e.message.slice(0,200)));
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13',{waitUntil:'commit'});
  let started=false; for(let i=0;i<900&&!(started=await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(500);
  ok(started,'THE MARKET starts'); if(!started){ await b.close(); process.exit(1); }
  await pg.waitForTimeout(4000);
  const shot0=(await pg.screenshot()).length;
  const lost=await pg.evaluate(()=>{ const c=document.querySelector('#stage canvas'), gl=c.getContext('webgl2')||c.getContext('webgl'), x=gl&&gl.getExtension('WEBGL_lose_context'); if(!x)return false; window.__LX=x; x.loseContext(); return true; });
  ok(lost,'the context can be lost on purpose');
  await pg.waitForTimeout(1500);
  ok(await pg.evaluate(()=>{ const d=document.getElementById('ctxlost'); return !!d&&d.style.display==='grid'; }),'the page says the picture was lost');
  await pg.evaluate(()=>window.__LX.restoreContext());
  await pg.waitForTimeout(6000);
  ok(await pg.evaluate(()=>{ const d=document.getElementById('ctxlost'); return !d||d.style.display==='none'; }),'the message goes away when it comes back');
  const frames=await pg.evaluate(()=>new Promise(r=>{ let n=0; const t=performance.now(), f=()=>{ n++; if(performance.now()-t<3000)requestAnimationFrame(f); else r(n); }; requestAnimationFrame(f); }));
  ok(frames>=2,'the game keeps running after it comes back ('+frames+' frames in 3 s)');
  const shot1=(await pg.screenshot()).length;
  ok(shot1>shot0*0.5,'it draws again (screenshot '+shot1+' bytes against '+shot0+' before)');
  // lost again and again (a graphics card that keeps giving up): it stops trying and offers a reload and a lighter picture
  for(let i=0;i<3;i++){ await pg.evaluate(()=>window.__LX.loseContext()); await pg.waitForTimeout(1200); await pg.evaluate(()=>window.__LX.restoreContext()); await pg.waitForTimeout(2500); }
  const gu=await pg.evaluate(()=>{ const d=document.getElementById('ctxlost'); return {shown:!!d&&d.style.display==='grid',text:d?d.textContent:'',reload:!!(d&&d.querySelector('[data-r]')),lite:!!(d&&d.querySelector('[data-l]'))}; });
  ok(gu.shown&&/KEEPS GETTING LOST/.test(gu.text)&&gu.reload&&gu.lite,'lost three times in a row, it stops and offers RELOAD and a lighter picture '+JSON.stringify({shown:gu.shown,reload:gu.reload,lite:gu.lite}));
  await pg.evaluate(()=>document.querySelector('#ctxlost [data-l]').click()); await pg.waitForTimeout(3000);
  let again=false; for(let i=0;i<900&&!(again=await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(500);
  const lite=await pg.evaluate(()=>({lite:SHARED.lite,shadows:__dbg.renderer?__dbg.renderer.shadowMap.enabled:null,key:localStorage.getItem('lite-picture')})).catch(e=>({err:e.message}));
  ok(again&&lite.lite===true&&lite.key==='1','the lighter picture: the game starts again without shadows, and the choice is kept '+JSON.stringify(lite));
  ok(!errs.length,'no page errors '+[...new Set(errs)].join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'all good'); process.exit(bad?1:0); })();
