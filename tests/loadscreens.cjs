// THE LOADING SCREENS (owner, 7 Nov 2026: "show a 'Switching View' loading screen with progress bar. showing loading progress bars that show what is loading on every loading screen"):
// the start names each place it builds with a bar; leaving the overhead view for third person shows SWITCHING VIEW with a bar and what is loading, and lifts only once
// every square within the new view's reach is painted. Run: node tests/loadscreens.cjs [shots dir] (slow: software rendering)
const {chromium}=require('playwright'), path=require('path'); const SHOTS=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13');
  const seen=new Set(); for(let i=0;i<600;i++){ const r=await pg.evaluate(()=>({t:(document.getElementById('loading')||{}).textContent||'',s:!!window.__started})).catch(()=>({t:'',s:false})); if(r.t)seen.add(r.t.replace(/\(.*$/,'').trim()); if(r.s)break; await pg.waitForTimeout(500); }
  ok([...seen].some(t=>/BUILDING/.test(t)),'the start names the places it builds ('+[...seen].slice(0,4).join(' | ')+' ...)');
  await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(3000);
  ok(await pg.evaluate(()=>__dbg.UI.view==='iso'),'the game opens in the overhead view');
  await pg.evaluate(()=>__dbg.UI.goTo(SHARED.BOD.XS(111),SHARED.BOD.ZS(20),'up')); await pg.waitForFunction(()=>PARK.ready&&__dbg.UI.viewsHere().includes('third')&&!FADE.busy,null,{timeout:240000}); await pg.waitForTimeout(3000);   // (in town the view is overhead; third person is for the park and insides)
  await pg.evaluate(()=>{ window.__sw=__dbg.UI.switchView('third').then(()=>{ window.__swDone=performance.now(); }); window.__sw0=performance.now(); });
  let mid=null; for(let i=0;i<60&&!mid;i++){ await pg.waitForTimeout(250); mid=await pg.evaluate(()=>{ const el=document.getElementById('subfade'); if(!el||el.style.opacity!=='1')return null; const fb=el.querySelector('.fb'); return {t:el.querySelector('.ft').textContent,bar:fb.style.visibility,l:el.querySelector('.fl').textContent}; }); }
  if(SHOTS&&mid)await pg.screenshot({path:path.join(SHOTS,'switching-view.png')});
  ok(mid&&mid.t==='SWITCHING VIEW'&&mid.bar==='visible','SWITCHING VIEW shows with its bar: '+JSON.stringify(mid));
  ok(mid&&/PAINTING|DOWNLOADING|READY|LOADING/.test(mid.l),'the bar says what is loading ('+(mid&&mid.l)+')');
  await pg.waitForFunction(()=>window.__swDone,null,{timeout:60000}).catch(()=>{});
  const end=await pg.evaluate(()=>({view:__dbg.UI.view,left:FADE.left(),busy:FADE.busy,ms:Math.round(window.__swDone-window.__sw0)}));
  ok(end.view==='third'&&!end.busy,'it lifts into third person ('+end.ms+' ms)');
  ok(end.left===0,'nothing within the new view\'s reach is left to paint when it lifts ('+end.left+')');
  if(SHOTS){ await pg.waitForTimeout(1500); await pg.screenshot({path:path.join(SHOTS,'after-switch.png')}); }
  const back=await pg.evaluate(async()=>{ await __dbg.UI.switchView('iso'); return {view:__dbg.UI.view,busy:FADE.busy}; });
  ok(back.view==='iso'&&!back.busy,'back to the overhead view at once, no loading screen');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  console.log(bad?bad+' failed':'all loading screen checks passed'); await b.close(); process.exit(bad?1:0); })();
