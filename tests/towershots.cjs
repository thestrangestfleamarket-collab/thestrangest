const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'out', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,4000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error'||/TOWER/.test(m.text()))errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(5000); await pg.evaluate(()=>window.DN&&DN.set&&DN.set('day'));
  const shot=async(n,f,w=4000)=>{ try{ if(f)await pg.evaluate(f); await pg.waitForTimeout(w); await pg.screenshot({path:path.join(OUT,n+'.png')}); rep[n]=await pg.evaluate(()=>window.SQDBG&&SQDBG()); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  const go=(dx,dz)=>`(()=>{ const s=GTOWER.site(), T=window.TILE||(__dbg.cv().TILE); STORE.goTo(s.x+${dx}*T,s.z+${dz}*T,'up'); })()`;
  for(let i=0;i<20;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>window.GTOWER&&GTOWER.ready))break; }
  await shot('tower-iso',go(3,4),6000);
  await pg.mouse.move(480,270); for(let i=0;i<4;i++){ await pg.mouse.wheel(0,-500); await pg.waitForTimeout(200); }
  await shot('tower-near',null,3000);
  await pg.keyboard.press('e'); await shot('tower-turned',null,3000); await pg.keyboard.press('q'); await pg.waitForTimeout(1500);
  await pg.mouse.move(480,270); for(let i=0;i<3;i++){ await pg.mouse.wheel(0,-500); await pg.waitForTimeout(200); }
  for(let i=0;i<4;i++)await shot('sq-'+i,null,7000);
  await shot('sq-scan',()=>{ SQUIRREL.N.mode='post'; SQUIRREL.A.act='scan'; SQUIRREL.A.t=0; SQUIRREL.N.aT=6; SQUIRREL.N.tT=20; },1800);
  await shot('sq-salute',()=>{ SQUIRREL.A.act='salute'; SQUIRREL.A.t=0; SQUIRREL.N.aT=3; },700);
  await shot('sq-walk',()=>{ SQUIRREL.A.act=''; SQUIRREL.N.tT=0; },2500);
  await pg.waitForTimeout(3000);
  await pg.keyboard.press('b'); await pg.waitForTimeout(150); rep.up=await pg.evaluate(()=>__rigst().up&&__rigst().up.name);
  await shot('wave-1',null,500); await pg.keyboard.press('b'); await shot('wave-2',null,600); await shot('wave-after',null,4000);
  await shot('night',()=>DN.set('night'),3000);
  rep.tris=await pg.evaluate(()=>__dbg.tris());
  fin(); await b.close(); })();
