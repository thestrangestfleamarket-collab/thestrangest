const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'out', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,6000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error'||/BATHT/.test(m.text()))errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(5000);
  const shot=async(n,f,w=4000)=>{ try{ if(f)rep[n+'_r']=await pg.evaluate(f); await pg.waitForTimeout(w); await pg.screenshot({path:path.join(OUT,n+'.png')}); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD, G=B.GD, P=B.GDK.pool, cx=(G.r[0]+G.r[2])/2; window.__B={cx,yE:P[3],r:G.r,f:G.floor}; window.TP=(x,y)=>{ STORE.goTo(B.X(x),B.Z(y),'up'); return [B.X(x),B.Z(y)]; };
    window.ST=()=>({py:+window.__dbg.you().y.toFixed(3),water:!!(__rigst().water&&__rigst().water.in),dead:!!__dbg.VIT.dead,inPool:G.inPool(__dbg.you().x,__dbg.you().z),room:window.INTDBG&&INTDBG()}); });
  rep.park=await pg.evaluate(()=>({rooms:(STORE.rooms||[]).map(r=>r.id),places:(STORE.places||[]).map(p=>p[0]).filter(n=>/SHRINE/i.test(n))}));
  await shot('bath-front',()=>{ TP(__B.cx,__B.f[3]-.6); return ST(); },8000);
  await pg.mouse.move(480,270); for(let i=0;i<3;i++){ await pg.mouse.wheel(0,-400); await pg.waitForTimeout(150); }
  await shot('bath-zoom',()=>ST(),3000);
  await pg.keyboard.press('e'); await shot('bath-turn',()=>ST(),3000); await pg.keyboard.press('q');
  await shot('wade',()=>{ TP(__B.cx+.3,__B.yE-.9); return ST(); },3000); rep.wade=await pg.evaluate(()=>ST());
  await shot('swim',()=>{ TP(__B.cx-2.2,__B.yE-1.9); return ST(); },3000); rep.swim=await pg.evaluate(()=>ST());
  await pg.keyboard.press('v'); await shot('swim-behind',null,3000); await pg.keyboard.press('v'); await pg.keyboard.press('v');
  await shot('night',()=>{ window.DN&&DN.set&&DN.set('night'); TP(__B.cx,__B.f[3]-.6); return ST(); },4000); await pg.evaluate(()=>window.DN&&DN.set&&DN.set('day'));
  await pg.evaluate(()=>KILLME()); for(let i=0;i<60;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!(window.RAGON&&RAGON())))break; }
  await shot('ghost-in',()=>{ TP(__B.cx,__B.yE+.45); return ST(); },3000);
  rep.walk={out:[]}; { let bd=-1e9; for(const key of ['w','a','s','d']){ const d0=await pg.evaluate(()=>{ TP(__B.cx,__B.yE+.45); return 0; }); await pg.waitForTimeout(400);
      const a=await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD; return Math.hypot(__dbg.you().x-B.X(__B.cx),__dbg.you().z-B.Z(__B.yE-1.4)); }); await pg.keyboard.down(key); await pg.waitForTimeout(400); await pg.keyboard.up(key);
      const c=await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD; return Math.hypot(__dbg.you().x-B.X(__B.cx),__dbg.you().z-B.Z(__B.yE-1.4)); }); rep.walk.out.push(key+':'+(a-c).toFixed(2)); if(a-c>bd){ bd=a-c; rep.walk.best=key; } }
    await pg.evaluate(()=>TP(__B.cx,__B.yE+.45)); await pg.waitForTimeout(400); }
  if(rep.walk.best){ await pg.keyboard.down(rep.walk.best); for(let i=0;i<40;i++){ await pg.waitForTimeout(150); if(await pg.evaluate(()=>ST().inPool))break; } await pg.waitForTimeout(300); await pg.keyboard.up(rep.walk.best); }
  rep.afterWalk=await pg.evaluate(()=>ST()); if(!rep.afterWalk.inPool){ await pg.evaluate(()=>TP(__B.cx-1.8,__B.yE-1.5)); rep.teleportedIn=true; }
  rep.dd=[]; for(let i=0;i<4;i++){ await pg.waitForTimeout(700); rep.dd.push(await pg.evaluate(()=>window.DEADDBG&&DEADDBG())); await pg.screenshot({path:path.join(OUT,'sink'+i+'.png')}); }
  await pg.waitForTimeout(400); await pg.screenshot({path:path.join(OUT,'refreshed.png')});
  rep.during=await pg.evaluate(()=>({...ST(),fade:document.getElementById('subfade').textContent}));
  await shot('outside',null,5000); rep.after=await pg.evaluate(()=>({...ST(),hp:__dbg.VIT.hp,sta:__dbg.VIT.sta}));
  await shot('outside-wide',()=>{ const B=__dbg.MAPK.BOD; return ST(); },500);
  rep.render=await pg.evaluate(()=>{ try{ const r=RENDERLIST(); return {head:r.head||r.totals||null}; }catch(e){ return 'ERR '+e.message; } });
  await shot('in-again',()=>{ TP(__B.cx,__B.f[3]-.6); return ST(); },4000);
  rep.renderIn=await pg.evaluate(()=>({info:{...__dbg.info()},tris:__dbg.tris&&__dbg.tris()}));
  await shot('park-old-shrine',()=>{ const M=__dbg.MAPK, o=M.LAY.o('park'), B=M.BOD, x=B.X(72+o.x/1.1), z=B.Z(-45.9+(o.y+23)/1.1+8); STORE.goTo(x,z,'up'); return [x,z]; },6000);
  rep.info=await pg.evaluate(()=>__dbg.info());
  fin(); await b.close(); })();
