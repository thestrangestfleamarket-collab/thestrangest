// THE WORLD EDITOR FOR PLAYERS (099-worldedit, 136b-worldpub): Shift+E opens it only from a player's second visit and only in the isometric
// view; another view greys it out; buildings, the park wall, streets and sidewalks can't be picked. node tests/weplayers.cjs. Exits 1 on failure.
const {chromium}=require('playwright');
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const open=async(b,plays)=>{ const ctx=await b.newContext({viewport:{width:960,height:540}}); if(plays)await ctx.addInitScript(n=>{ try{ if(!localStorage.getItem('market-save'))localStorage.setItem('market-save',JSON.stringify({v:5,plays:String(n)})); }catch(e){} },plays);
  const pg=await ctx.newPage(); pg.on('pageerror',e=>console.log('pageerror:',e.message.slice(0,200)));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=13&hideme=1&npcwait=99',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<240&&!await pg.evaluate(()=>!!window.__started).catch(()=>false);i++)await wait(1000); await pg.evaluate(()=>LOAD('later')); return pg; };
(async()=>{
  const b=await chromium.launch({...(process.env.PWEXE?{executablePath:process.env.PWEXE}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const [p1,p2]=await Promise.all([open(b,0),open(b,1)]);
  ok(await p1.evaluate(()=>!!window.__started)&&await p2.evaluate(()=>!!window.__started),'the market starts');
  await p1.keyboard.press('Shift+E'); await wait(300);
  ok(await p1.evaluate(()=>WE.may()===false&&!WE.on),'a first visit: Shift+E does not open it');
  ok(await p2.evaluate(()=>WE.may()===true),'a second visit may edit');
  const st=pg=>pg.evaluate(()=>({on:WE.on,lock:document.getElementById('we').classList.contains('lock'),msg:!document.getElementById('welock').hidden}));
  const setV=async x=>{ await p2.evaluate(x=>{ __dbg.UI.setView(x); },x); await wait(500); };
  await setV('third'); await p2.keyboard.press('Shift+E'); await wait(300);
  ok(!(await st(p2)).on,'third person: Shift+E does not open it');
  await setV('iso'); await p2.keyboard.press('Shift+E'); await wait(800); let s=await st(p2);
  ok(s.on&&!s.lock,'isometric: Shift+E opens it');
  await setV('third'); s=await st(p2); ok(s.on&&s.lock&&s.msg,'leaving isometric greys it out');
  await setV('iso'); s=await st(p2); ok(s.on&&!s.lock&&!s.msg,'back in isometric it works again');
  const can=await p2.evaluate(()=>['bath house','kerb brick','brick wall','floor','bench','street signs','street lamp','lamp post','gate lantern'].map(n=>WE.can({name:n})));
  ok(JSON.stringify(can)==='[false,false,false,false,true,true,true,true,true]','buildings, walls, kerbs and floors are not pickable; benches, signs and lamps are ('+can+')');
  const mv=await p2.evaluate(()=>{ const L=WE.dbgProps(); const mi=L.findIndex(e=>e.place==='street'&&e.ids.length); if(mi<0)return null; const k=WE.dbgPick(mi,0); document.querySelector('#we [data-up="1"]').click(); return k&&WE.getState()[k]&&WE.getState()[k].t[1]; });
  ok(mv>0,'a street thing picks and moves ('+mv+')');
  await p2.keyboard.press('Shift+E'); await wait(300); ok(!(await st(p2)).on,'Shift+E closes it');
  await b.close(); console.log(bad?bad+' failed':'all passed'); process.exit(bad?1:0); })();
