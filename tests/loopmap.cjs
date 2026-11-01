// THE LOOP MAP CHECK: node tests/loopmap.cjs [dist/market.html]. On the platform: the map sign is square and a thing; its window shows all eight sections, the next trains here, the schedule and details.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:1000,height:600}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2000);
  const idle=()=>pg.waitForFunction(()=>FADE.busy===0&&getComputedStyle(document.getElementById('subfade')).opacity==='0',null,{timeout:300000,polling:500}).catch(()=>{});
  await idle(); await pg.evaluate(()=>{ const p=SHARED.METRO.plat; __dbg.UI.goTo(p.x,p.z,'down'); }); await idle(); await pg.waitForTimeout(1500);
  const S=await pg.evaluate(()=>{ const st=LOOP.STA[0], me=st.signs.map.me[0]; me.geometry.computeBoundingBox(); const bb=me.geometry.boundingBox, w=Math.hypot(bb.max.x-bb.min.x,bb.max.z-bb.min.z), h=bb.max.y-bb.min.y; return {w,h,thing:__dbg.ui().things.some(t=>t.name==='THE LOOP MAP'&&t.obj===me)}; });
  ok(S.w>1.5&&S.w<3&&Math.abs(S.w/S.h-1)<.15,'the map sign is small and square ('+S.w.toFixed(2)+' by '+S.h.toFixed(2)+')');
  ok(S.thing,'the sign is a thing: double-click it to look closer');
  const W=await pg.evaluate(()=>{ LOOPMAP.open(); const el=document.getElementById('loopmap'), t=el.innerText; return {open:!el.hidden,t,cv:!!el.querySelector('canvas'),rows:el.querySelectorAll('tr').length}; });
  ok(W.open&&W.cv,'the window opens with the map of all eight sections drawn');
  ok(['MARKET ST','MOTH ST','TINKER ST','KETTLE ST','RAG ST','BUTTON ST','BRASS ST','CLOCK ST'].every(n=>W.t.includes(n)),'every section\'s station is in the schedule');
  ok(/NEXT TRAINS HERE/.test(W.t)&&/↻/.test(W.t)&&/↺/.test(W.t)&&/(NOW|ARRIVING|\d+:\d\d)/.test(W.t),'the next trains here, each way, with their times');
  ok(/A LAP/.test(W.t)&&/EXIT A1/.test(W.t)&&/THIS SECTION · A/.test(W.t),'this section close up, and the details');
  const C=await pg.evaluate(()=>{ LOOPMAP.close(); return document.getElementById('loopmap').hidden; }); ok(C,'the window closes');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0].slice(0,200):''));
  await b.close(); process.exit(bad?1:0); })();
