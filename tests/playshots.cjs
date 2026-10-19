const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'playout', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,4000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(5000);
  const shot=async(n,f,w=5000)=>{ try{ if(f)await pg.evaluate(f); await pg.waitForTimeout(w); await pg.screenshot({path:path.join(OUT,n+'.png')}); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  await pg.evaluate(()=>STORE.ensure&&STORE.ensure());
  await shot('outside',()=>{ const M=STORE.main.play, B=__dbg.MAPK.BOD; STORE.goTo(B.X(M.cx),B.Z(M.B.y1+3),'up'); },4000);
  await pg.mouse.move(480,270); for(let i=0;i<4;i++){ await pg.mouse.wheel(0,500); await pg.waitForTimeout(150); }
  await shot('outside-far',null,3000); for(let i=0;i<4;i++){ await pg.mouse.wheel(0,-500); await pg.waitForTimeout(150); }
  rep.before=await pg.evaluate(()=>({built:!!STORE.main.play.spot}));
  await pg.evaluate(()=>STORE.enter('playhouse',true)); await pg.waitForTimeout(3000);
  const at=`const M=STORE.main.play, B=__dbg.MAPK.BOD, tx=B.X(M.cx), tz=B.Z(M.B.y0+3.4), px=B.X(M.cx+.0), pz=B.Z(M.B.y0+10.6);`;
  await pg.evaluate(new Function(at+'STORE.goTo(px,pz,"up");')); await pg.waitForTimeout(2000);
  await pg.mouse.move(480,270); for(let i=0;i<6;i++){ await pg.mouse.wheel(0,600); await pg.waitForTimeout(150); }
  rep.info=await pg.evaluate(()=>{ const M=STORE.main.play, n=[]; let t=0; for(const m of M.spot||[])t+=m.geometry.attributes.position.count/3; return {built:!!M.spot,drapeTris:M.rigN,spotTris:t,lite:LITE.sel.length,tris:__dbg.info?__dbg.info():null,main:window.MAINDBG?MAINDBG().tris:null}; });
  await pg.evaluate(()=>window.DN&&DN.set&&DN.set('day'));
  await shot('day-iso',null,4000);
  await pg.keyboard.press('q'); await pg.keyboard.press('q'); await shot('day-iso-rev',null,4000); await pg.keyboard.press('e'); await pg.keyboard.press('e');
  await pg.keyboard.press('v'); for(let i=0;i<6;i++){ await pg.mouse.wheel(0,600); await pg.waitForTimeout(150); }
  await shot('day-behind-a',new Function(at+'STORE.goTo(px,B.Z(M.B.y0+11.8),"up"); __dbg.face(Math.atan2(tx-px,tz-pz));'),4000);
  rep.posA=await pg.evaluate(()=>[__dbg.you(),STORE.main.play.B]);
  await shot('day-behind-b',new Function(at+'STORE.goTo(B.X(M.cx+3.3),B.Z(M.B.y0+10.4),"up"); __dbg.face(Math.atan2(px-tx,pz-tz));'),4000);
  rep.posB=await pg.evaluate(()=>__dbg.you());
  await pg.evaluate(()=>window.DN&&DN.set&&DN.set('night'));
  await shot('night-behind-a',new Function(at+'STORE.goTo(px,B.Z(M.B.y0+11.8),"up"); __dbg.face(Math.atan2(tx-px,tz-pz));'),4000);
  await shot('night-behind-b',new Function(at+'STORE.goTo(B.X(M.cx+3.3),B.Z(M.B.y0+10.4),"up"); __dbg.face(Math.atan2(px-tx,pz-tz));'),4000);
  await pg.keyboard.press('v'); await pg.keyboard.press('v'); await pg.evaluate(new Function(at+'STORE.goTo(px,pz,"up");'));
  for(let i=0;i<6;i++){ await pg.mouse.wheel(0,600); await pg.waitForTimeout(150); }
  await shot('night-iso',null,4000);
  await pg.keyboard.press('q'); await pg.keyboard.press('q'); await shot('night-iso-rev',null,4000);
  rep.lamps=await pg.evaluate(()=>LITE.sel.map(L=>[+L.position.x.toFixed(1),+L.position.y.toFixed(1),+L.position.z.toFixed(1),+L.intensity.toFixed(2)])); rep.r=await pg.evaluate(()=>{ const I=__dbg.info&&__dbg.info(); return I; });
  fin(); await b.close(); })();
