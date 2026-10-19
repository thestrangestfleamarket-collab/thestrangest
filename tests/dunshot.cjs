const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'out', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={steps:[]};
const fin=()=>{ rep.errors=errs.slice(0,60); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,6000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(6000);
  const shot=async n=>{ try{ await pg.screenshot({path:path.join(OUT,n+'.png')}); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  const st=async tag=>{ const d=await pg.evaluate(()=>({D:DUNDBG(),lvl:window.DUNGEON.level,you:__dbg.you(),fade:getComputedStyle(document.getElementById('subfade')).opacity,txt:document.getElementById('subfade').textContent})); d.tag=tag; rep.steps.push(d); return d; };
  const walk=async(spot,tag)=>{ const sp=await pg.evaluate(spot); let best=null;
    best=[sp.dir>0?'s':'w',0];
    await pg.evaluate(s=>{ STORE.goTo(s.x,s.z,s.lv); },sp); await pg.waitForTimeout(1200);
    await pg.evaluate(()=>{ const y=__dbg.you(), w=window.__w={p0:[y.x,y.z],t0:performance.now(),hit:null}; const f=()=>{ if(DUNDBG().busy){ const q=__dbg.you(); w.hit={ms:Math.round(performance.now()-w.t0),dist:+(Math.hypot(q.x-w.p0[0],q.z-w.p0[1])/1.13).toFixed(2)}; return; } if(performance.now()-w.t0<6000)requestAnimationFrame(f); }; requestAnimationFrame(f); });
    await pg.keyboard.down(best[0]); let hit=null; try{ await pg.waitForFunction(()=>window.__w.hit,null,{timeout:8000,polling:30}); hit=await pg.evaluate(()=>window.__w.hit); }catch(e){}
    await pg.keyboard.up(best[0]); await pg.waitForTimeout(80); await shot(tag+'-fade'); await st(tag+'-fade'); const L=rep.steps[rep.steps.length-1]; L.key=best; L.hit=hit; await pg.waitForTimeout(1800); return !!hit; };
  rep.TILE=await pg.evaluate(()=>window.TILE);
  await pg.evaluate(()=>{ const M=__dbg.MAPK, S=M.CASTLE.stair, B=M.BOD; STORE.goTo(B.XS((S.x0+S.x1)/2),B.ZS(S.y0-.45),'up'); }); await pg.waitForTimeout(2500); await shot('castle-top'); await st('castle-top');
  if(!await walk(()=>{ const M=__dbg.MAPK, S=M.CASTLE.stair, B=M.BOD; return {x:B.XS((S.x0+S.x1)/2),z:B.ZS(S.y0-.45),lv:'up',dir:1}; },'castle')){ await pg.evaluate(()=>{ const M=__dbg.MAPK, S=M.CASTLE.stair, B=M.BOD; STORE.goTo(B.XS((S.x0+S.x1)/2),B.ZS(S.y0+.15),'up'); }); await pg.waitForTimeout(200); await shot('castle-fade2'); await pg.waitForTimeout(1600); }
  await pg.waitForTimeout(1500); await shot('L1'); await st('L1');
  for(let n=1;n<5;n++){ await pg.evaluate(()=>{ const M=__dbg.MAPK.MODS.dungeon, L=M.lay(DUNGEON.level), B=__dbg.MAPK.BOD; STORE.goTo(B.XS((L.dn.x0+L.dn.x1)/2),B.ZS(L.dn.y0-.45),'down'); }); await pg.waitForTimeout(1200);
    if(n===1)await shot('L1-at-down');
    if(!await walk(()=>{ const L=__dbg.MAPK.MODS.dungeon.lay(DUNGEON.level), B=__dbg.MAPK.BOD; return {x:B.XS((L.dn.x0+L.dn.x1)/2),z:B.ZS(L.dn.y0-.45),lv:'down',dir:1}; },'down'+n)){ await pg.evaluate(()=>{ const M=__dbg.MAPK.MODS.dungeon, L=M.lay(DUNGEON.level), B=__dbg.MAPK.BOD; STORE.goTo(B.XS((L.dn.x0+L.dn.x1)/2),B.ZS(L.dn.y0+.15),'down'); }); await pg.waitForTimeout(2200); }
    await pg.waitForTimeout(1200); await shot('L'+(n+1)); await st('L'+(n+1)); }
  await pg.mouse.move(480,270); for(let i=0;i<5;i++){ await pg.mouse.wheel(0,500); await pg.waitForTimeout(150); } await pg.waitForTimeout(1500); await shot('L5-wide'); await pg.keyboard.press('v'); await pg.waitForTimeout(2000); await shot('L5-behind'); await pg.keyboard.press('v'); await pg.keyboard.press('v'); await pg.waitForTimeout(1500);
  for(let n=5;n>=1;n--){ if(!await walk(()=>{ const L=__dbg.MAPK.MODS.dungeon.lay(DUNGEON.level), B=__dbg.MAPK.BOD; return {x:B.XS((L.up.x0+L.up.x1)/2),z:B.ZS(L.up.y1+.45),lv:'down',dir:-1}; },'up'+n)){ await pg.evaluate(()=>{ const M=__dbg.MAPK.MODS.dungeon, L=M.lay(DUNGEON.level), B=__dbg.MAPK.BOD; STORE.goTo(B.XS((L.up.x0+L.up.x1)/2),B.ZS(L.up.y1-.15),'down'); }); await pg.waitForTimeout(2200); }
    await pg.waitForTimeout(1200); await shot('back'+(n-1)); await st('back-to-'+(n-1)); }
  await pg.evaluate(()=>DUNGEON.go(3)); await pg.waitForTimeout(3000); await st('go3'); await shot('go3');
  await pg.evaluate(()=>{ __UI.goPlace('DUNGEON L1'); }); await pg.waitForTimeout(4000); await st('menu-L1'); await shot('menu-L1');
  await pg.evaluate(()=>{ __UI.goPlace('THE CASTLE'); }); await pg.waitForTimeout(3000); await st('menu-castle');
  rep.render=await pg.evaluate(()=>{ try{ const r=RENDERLIST(); return r.head||r.totals||null; }catch(e){ return 'ERR '+e.message; } });
  fin(); await b.close(); })();
