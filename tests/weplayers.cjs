// THE WORLD EDITOR FOR PLAYERS (099-worldedit, 136b-worldpub): Shift+E opens it only from a player's second visit and only in the isometric
// view; another view greys it out; buildings, the park wall, streets and sidewalks can't be picked; PLACE puts down a new Polyfork thing. node tests/weplayers.cjs. Exits 1 on failure.
const {chromium}=require('playwright');
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const open=async(b,plays,q='')=>{ const ctx=await b.newContext({viewport:{width:960,height:540}}); if(plays)await ctx.addInitScript(n=>{ try{ if(!localStorage.getItem('market-save'))localStorage.setItem('market-save',JSON.stringify({v:5,plays:String(n)})); }catch(e){} },plays);
  const pg=await ctx.newPage(); pg.on('pageerror',e=>console.log('pageerror:',e.message.slice(0,200))); pg.on('console',m=>{ if(m.type()==='error'||m.type()==='warning')console.log('console:',m.text().slice(0,200)); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=13&hideme=1&npcwait=99'+q,{waitUntil:'commit',timeout:180000});
  for(let i=0;i<240&&!await pg.evaluate(()=>!!window.__started).catch(()=>false);i++)await wait(1000); await pg.evaluate(()=>LOAD('later')); return pg; };
(async()=>{
  const b=await chromium.launch({...(process.env.PWEXE?{executablePath:process.env.PWEXE}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const [p1,p2]=await Promise.all([open(b,0),open(b,1,'&at=36,4')]);
  ok(await p1.evaluate(()=>!!window.__started)&&await p2.evaluate(()=>!!window.__started),'the market starts');
  await p1.evaluate(()=>{ const U=__dbg.UI; if(U.menuOpen)U.toggleMenu(); }); await p1.keyboard.press('Shift+E'); await wait(300);
  ok(await p1.evaluate(()=>WE.may()===false&&!WE.on),'a first visit: Shift+E does not open it');
  ok(await p2.evaluate(()=>WE.may()===true),'a second visit may edit');
  const st=pg=>pg.evaluate(()=>({on:WE.on,lock:document.getElementById('we').classList.contains('lock'),msg:!document.getElementById('welock').hidden}));
  // another view: the street is isometric only now (owner, 7 Nov), so the free camera stands in for one
  const setV=async x=>{ await p2.evaluate(x=>{ const U=__dbg.UI; if(U.menuOpen)U.toggleMenu(); U.setFree(x!=='iso'); if(x==='iso')U.setView('iso'); },x); await wait(500); };
  await setV('third'); await p2.keyboard.press('Shift+E'); await wait(300);
  ok(!(await st(p2)).on,'another view (the free camera): Shift+E does not open it');
  await setV('iso'); await p2.keyboard.press('Shift+E'); await wait(800); let s=await st(p2);
  ok(s.on&&!s.lock,'isometric: Shift+E opens it');
  await setV('third'); s=await st(p2); ok(s.on&&s.lock&&s.msg,'leaving isometric (the free camera) greys it out');
  await setV('iso'); s=await st(p2); ok(s.on&&!s.lock&&!s.msg,'back in isometric it works again');
  const can=await p2.evaluate(()=>['bath house','kerb brick','brick wall','floor','bench','street signs','street lamp','lamp post','gate lantern'].map(n=>WE.can({name:n})));
  ok(can.every(Boolean),'everything can be picked, buildings and streets too (owner, 7 Nov 2026: everyone everything) ('+can+')');
  const mv=await p2.evaluate(()=>{ const L=WE.dbgProps(); const mi=L.findIndex(e=>e.place==='street'&&e.ids.length); if(mi<0)return null; const k=WE.dbgPick(mi,0); document.querySelector('#we [data-up="1"]').click(); return k&&WE.getState()[k]&&WE.getState()[k].t[1]; });
  ok(mv>0,'a street thing picks and moves ('+mv+')');
  // PLACE: a Polyfork thing put down outside, solid, kept in the edits (so it goes to the queue)
  const pl=await p2.evaluate(async()=>{ const q=s=>document.querySelector(s); q('#we [data-wt="place"]').click(); for(let i=0;i<100&&!q('#wplist [data-pk]');i++)await new Promise(r=>setTimeout(r,200));
    const b=q('#wplist [data-pk]'); if(!b)return {err:'no list'}; const k=b.dataset.pk, n0=SHARED.solids.length; b.click(); for(let i=0;i<150&&!/to put down the/.test(q('#wpsay').textContent);i++)await new Promise(r=>setTimeout(r,200));
    const cv=document.querySelector('canvas'), r=cv.getBoundingClientRect(), ev={button:0,clientX:r.left+r.width*.15,clientY:r.top+r.height*.5};
    const took=WE.placeDown(ev); const st=WE.getState(), key=Object.keys(st).find(x=>st[x].pf===k);
    return {k,took,key,placed:!!key,solid:SHARED.solids.length>n0,cats:q('#wpcat').options.length,say:q('#wpsay').textContent}; });
  console.log(JSON.stringify(pl));
  ok(pl.cats===13,'PLACE lists 13 categories');
  ok(pl.took&&pl.placed,'a Polyfork thing is put down and kept in the edits ('+pl.k+')');
  ok(pl.solid,'it is solid (in the things he bumps into)');
  const nr=await p2.evaluate(async()=>{ await WE.pfLoad('food-truck-3c4e0e'); const P=__dbg.you(), n0=Object.keys(WE.getState()).length, k=WE.addPf('food-truck-3c4e0e','food truck',[P.x,P.y,P.z],0); return {k,same:Object.keys(WE.getState()).length===n0,blank:WE.blank({t:[0,0,0],r:0,rx:0,rz:0,s:[1,1,1],col:'#ffffff',bri:1,op:1,del:false})}; });
  ok(nr.k===null&&nr.same,'nothing is put down on top of you (it is solid and would hold you)');
  ok(nr.blank===true,'a thing picked and never changed is not an edit');
  const fd=await p2.evaluate(async()=>{ const k='food-truck-3c4e0e'; await WE.pfLoad(k); const cv=document.querySelector('canvas'), R=cv.getBoundingClientRect(), n0=PEEK.boxes.length; let key=null;
    for(const fx of [.12,.18,.85,.9])for(const fy of [.2,.5,.8]){ if(key)break; const g=WE.ground({clientX:R.left+R.width*fx,clientY:R.top+R.height*fy}); if(g)key=WE.addPf(k,'food truck',g,0); }
    const n1=PEEK.boxes.length, s=WE.getState(); if(key){ s[key].del=true; WE.applyAll(); await new Promise(r=>setTimeout(r,1500)); } return {key:!!key,added:n1-n0,after:PEEK.boxes.length-n0}; });
  ok(fd.key&&fd.added===1&&fd.after===0,'a big placed thing fades round you like the big trees and walls, and stops when it is taken away '+JSON.stringify(fd));
  await p2.keyboard.press('Shift+E'); await wait(300); ok(!(await st(p2)).on,'Shift+E closes it');
  await b.close(); console.log(bad?bad+' failed':'all passed'); process.exit(bad?1:0); })();
