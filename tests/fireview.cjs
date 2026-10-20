const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'fireout', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,4000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(5000);
  const shot=async(n,f,w=4000)=>{ try{ if(f)await pg.evaluate(f); await pg.waitForTimeout(w); await pg.screenshot({path:path.join(OUT,n+'.png')}); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  const dbg=async k=>{ rep[k]=await pg.evaluate(()=>window.FIREDBG&&FIREDBG()); };
  const apt=(u,v)=>{ const M=__dbg.MAPK, P=M.MODS.apts, A=P.A; STORE.goTo(M.BOD.X(A.x0+u),M.BOD.Z(A.y0+v),P.lvY(2)); };
  await pg.evaluate(()=>window.DN&&DN.set&&DN.set('day'));
  await shot('apt-corridor',`(${apt})(23.4,7.2)`,5000); await dbg('corridor');
  await shot('apt-room',`(${apt})(23.4,2.6)`,4000); await dbg('room');
  await shot('apt-window',`(${apt})(24.7,1.0)`,3000);
  await pg.evaluate(()=>FIREV.out()); await pg.waitForTimeout(450); await pg.screenshot({path:path.join(OUT,'fade.png')});
  for(let i=0;i<240;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>window.FIREDBG&&FIREDBG().on))break; }
  await pg.waitForTimeout(3000); await dbg('escape');
  await shot('esc-iso-day',null,3000);
  await pg.mouse.move(480,270); for(let i=0;i<4;i++){ await pg.mouse.wheel(0,600); await pg.waitForTimeout(150); }
  await shot('esc-iso-day-wide',null,3000);
  rep.tris=await pg.evaluate(()=>FAR3.frameTris()); rep.lite=await pg.evaluate(()=>LITE.sel.length);
  await pg.keyboard.press('v'); await shot('esc-behind-day',null,4000); rep.trisBehind=await pg.evaluate(()=>FAR3.frameTris());
  await pg.keyboard.press('v'); await shot('esc-first-day',null,4000);
  await pg.keyboard.press('v'); await pg.evaluate(()=>DN.set('night')); await shot('esc-iso-night',null,5000);
  await pg.keyboard.press('v'); await shot('esc-behind-night',null,4000); rep.lite2=await pg.evaluate(()=>LITE.sel.length);
  await pg.keyboard.press('v'); await shot('esc-first-night',null,4000); await pg.keyboard.press('v');
  await pg.evaluate(()=>DN.set('day')); await shot('esc-sit',()=>FIREV.sit(),3000); await dbg('sit');
  await pg.keyboard.press('q'); await shot('esc-iso-q',null,3000); await pg.keyboard.press('e');
  await pg.evaluate(()=>FIREV.back()); await pg.waitForTimeout(2500); await shot('back-apt',null,3000); await dbg('back');
  fin(); await b.close(); })();
