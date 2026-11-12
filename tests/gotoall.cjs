// EVERY GO TO PLACE (owner, 8 Nov 2026: "test each location make sure it works that you can teleport there and walk around without glitching at least 2 steps"): node tests/gotoall.cjs ["NAME|NAME"] (slow: about 25 minutes on software rendering); each place from the map's GO TO list, then a walk each way until one goes a tile without being thrown out, falling or an error
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const pg=await b.newPage({viewport:{width:480,height:270}}); let errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,140)));
 await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,6&hour=13&npcwait=99',{timeout:300000,waitUntil:'commit'}); for(let i=0;i<300&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000); await pg.waitForTimeout(3000);
 await pg.evaluate(()=>__UI.brochure.open('goto')); await pg.waitForTimeout(1500); const names=await pg.evaluate(()=>[...document.querySelectorAll('#dbro .gor')].map(o=>o.dataset.n).filter(n=>!/'S APARTMENT$/.test(n))); console.log('open',names.length); await pg.evaluate(()=>__UI.brochure.close());
 const only=process.argv[2]?process.argv[2].split('|'):null; const list=[...new Set(names)].filter(n=>!only||only.includes(n)); console.log('places',list.length);
 const st=()=>pg.evaluate(()=>{ const y=__dbg.you(); return {x:y.x,z:y.z,y:y.y,room:ROOMS.cur&&(ROOMS.cur.off||ROOMS.cur.lz||ROOMS.cur.id)||null,lvl:SHARED.LVL,busy:FADE.busy}; });
 const T=33.9/30, bad=[];
 for(const n of list){ errs=[]; await pg.evaluate(n=>__UI.goName(n),n).catch(e=>errs.push('goName '+e.message));
   for(let i=0;i<80;i++){ await pg.waitForTimeout(500); const s=await st(); if(!s.busy&&i>3)break; } await pg.waitForTimeout(2500);
   const a=await st(); let ok=false, best=0, out='';
   for(const k of ['w','s','a','d']){ const p0=await st(); await pg.keyboard.down(k); await pg.waitForTimeout(6000); await pg.keyboard.up(k); await pg.waitForTimeout(700); const p1=await st();
     const d=Math.hypot(p1.x-p0.x,p1.z-p0.z)/T; best=Math.max(best,d); if(Math.hypot(p1.x-a.x,p1.z-a.z)/T>15||p1.room!==a.room||p1.lvl!==a.lvl){ out=`thrown from ${a.room||a.lvl} to ${p1.room||p1.lvl} ${(Math.hypot(p1.x-a.x,p1.z-a.z)/T).toFixed(1)} tiles`; break; }
     if(!Number.isFinite(p1.y)||p1.y<a.y-3){ out='fell y '+p1.y.toFixed(2); break; } if(d>=1.0){ ok=true; break; } }
   const r=`${ok&&!out&&!errs.length?'ok  ':'BAD '} ${n} · at ${(a.x/T+72).toFixed(0)},${(a.z/T-77).toFixed(0)} ${a.room||''} ${a.lvl} · walked ${best.toFixed(1)} tiles ${out} ${errs.slice(0,2).join(' | ')}`; console.log(r); if(!r.startsWith('ok'))bad.push(n); }
 console.log(bad.length?bad.length+" failed: "+bad.join(", "):"every place works"); await b.close(); process.exit(bad.length?1:0); })();
