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
  const cal=await pg.evaluate(async()=>{ const M=__dbg.MAPK, P=M.PARK, B=M.BOD; STORE.goTo(B.XS(P.round[0]+(P.ox||0)+6),B.ZS(P.round[1]+(P.oy||0)+6),'up'); await new Promise(r=>setTimeout(r,1500)); return 1; });
  let fwd=null; for(const k of ['w','s','a','d']){ const a=await pg.evaluate(()=>__dbg.you()); await pg.keyboard.down(k); await pg.waitForTimeout(500); await pg.keyboard.up(k); await pg.waitForTimeout(400); const c=await pg.evaluate(()=>__dbg.you()); if(!fwd&&c.z-a.z>Math.abs(c.x-a.x))fwd=k; if(k==='w')rep.wmove=[c.x-a.x,c.z-a.z]; }
  rep.fwd=fwd; const back={w:'s',s:'w',a:'d',d:'a'}[fwd||'w'];
  const walk=async(key,tag)=>{ const t0=Date.now(); await pg.keyboard.down(key); let hit=false; for(let i=0;i<40;i++){ await pg.waitForTimeout(50); const s=await pg.evaluate(()=>({b:DUNDBG().busy,f:getComputedStyle(document.getElementById('subfade')).opacity})); if(s.b){ hit=true; break; } }
    const ms=Date.now()-t0; await pg.waitForTimeout(150); await shot(tag+'-fade'); await pg.keyboard.up(key); await st(tag+'-fade'); rep.steps[rep.steps.length-1].walkMs=ms; rep.steps[rep.steps.length-1].hit=hit; await pg.waitForTimeout(1600); return hit; };
  await pg.evaluate(()=>{ const M=__dbg.MAPK, S=M.CASTLE.stair, B=M.BOD; STORE.goTo(B.XS((S.x0+S.x1)/2),B.ZS(S.y0-.45),'up'); }); await pg.waitForTimeout(2500); await shot('castle-top'); await st('castle-top');
  if(!await walk(fwd||'w','castle')){ await pg.evaluate(()=>{ const M=__dbg.MAPK, S=M.CASTLE.stair, B=M.BOD; STORE.goTo(B.XS((S.x0+S.x1)/2),B.ZS(S.y0+.15),'up'); }); await pg.waitForTimeout(200); await shot('castle-fade2'); await pg.waitForTimeout(1600); }
  await pg.waitForTimeout(1500); await shot('L1'); await st('L1');
  for(let n=1;n<5;n++){ await pg.evaluate(()=>{ const M=__dbg.MAPK.MODS.dungeon, L=M.lay(DUNGEON.level), B=__dbg.MAPK.BOD; STORE.goTo(B.XS((L.dn.x0+L.dn.x1)/2),B.ZS(L.dn.y0-.45),'down'); }); await pg.waitForTimeout(1200);
    if(n===1)await shot('L1-at-down');
    if(!await walk(fwd||'w','down'+n)){ await pg.evaluate(()=>{ const M=__dbg.MAPK.MODS.dungeon, L=M.lay(DUNGEON.level), B=__dbg.MAPK.BOD; STORE.goTo(B.XS((L.dn.x0+L.dn.x1)/2),B.ZS(L.dn.y0+.15),'down'); }); await pg.waitForTimeout(2200); }
    await pg.waitForTimeout(1200); await shot('L'+(n+1)); await st('L'+(n+1)); }
  await pg.mouse.move(480,270); for(let i=0;i<5;i++){ await pg.mouse.wheel(0,500); await pg.waitForTimeout(150); } await pg.waitForTimeout(1500); await shot('L5-wide'); await pg.keyboard.press('v'); await pg.waitForTimeout(2000); await shot('L5-behind'); await pg.keyboard.press('v'); await pg.keyboard.press('v'); await pg.waitForTimeout(1500);
  for(let n=5;n>=1;n--){ if(!await walk(back,'up'+n)){ await pg.evaluate(()=>{ const M=__dbg.MAPK.MODS.dungeon, L=M.lay(DUNGEON.level), B=__dbg.MAPK.BOD; STORE.goTo(B.XS((L.up.x0+L.up.x1)/2),B.ZS(L.up.y1-.15),'down'); }); await pg.waitForTimeout(2200); }
    await pg.waitForTimeout(1200); await shot('back'+(n-1)); await st('back-to-'+(n-1)); }
  await pg.evaluate(()=>DUNGEON.go(3)); await pg.waitForTimeout(3000); await st('go3'); await shot('go3');
  await pg.evaluate(()=>{ __UI.goPlace('DUNGEON L1'); }); await pg.waitForTimeout(4000); await st('menu-L1'); await shot('menu-L1');
  await pg.evaluate(()=>{ __UI.goPlace('THE CASTLE'); }); await pg.waitForTimeout(3000); await st('menu-castle');
  rep.render=await pg.evaluate(()=>{ try{ const r=RENDERLIST(); return r.head||r.totals||null; }catch(e){ return 'ERR '+e.message; } });
  fin(); await b.close(); })();
