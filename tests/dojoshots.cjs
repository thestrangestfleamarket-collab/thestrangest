const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'dojoout', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,6000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg&&!!window.DOJODBG))break; }
  await pg.waitForTimeout(5000);
  const shot=async(n,f,w=0)=>{ try{ if(f)await pg.evaluate(f); if(w)await pg.waitForTimeout(w); await pg.screenshot({path:path.join(OUT,n+'.png')}); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  const dbg=()=>pg.evaluate(()=>DOJODBG()); 
  await pg.evaluate(()=>STORE.ensure&&STORE.ensure());
  rep.d0=await dbg();
  await shot('gate',()=>{ const d=DOJODBG(); STORE.goTo(d.gate[0]*d.tile,(d.gate[1]+3)*d.tile,'up'); },5000);
  await pg.mouse.move(480,270); for(let i=0;i<3;i++){ await pg.mouse.wheel(0,300); await pg.waitForTimeout(150); }
  await shot('gate-wide',null,2500);
  await pg.evaluate(()=>DOJOWALK('in'));
  for(let i=0;i<200;i++){ if((await dbg()).busy)break; await pg.waitForTimeout(50); }
  rep.atFade=await dbg(); await shot('fade-in',null,120);
  for(let i=0;i<100;i++){ await pg.waitForTimeout(100); if(!(await dbg()).busy)break; }
  await shot('inside',null,1500); rep.d1=await dbg();
  rep.render=await pg.evaluate(()=>{ try{ const r=RENDERLIST(); return {head:r.head||r.totals||null}; }catch(e){ return 'ERR '+e.message; } });
  await pg.mouse.wheel(0,-300); await pg.waitForTimeout(800); const frames=[]; for(let i=0;i<10;i++){ await shot('ninja'+i,null,0); frames.push((await dbg()).ninja); await pg.waitForTimeout(380); } rep.frames=frames;
  await pg.keyboard.press('v'); await shot('behind',()=>{ const n=DOJONINJA(), y=__dbg.you(); __dbg.face(Math.atan2(n.x-y.x,n.z-y.z)); },2500);
  for(let i=0;i<5;i++){ await shot('behind'+i,null,0); await pg.waitForTimeout(450); }
  await pg.keyboard.press('v'); await pg.keyboard.press('v'); await pg.waitForTimeout(800);
  rep.fight0=(await dbg()).fight;
  await pg.evaluate(()=>{ const n=DOJONINJA(), d=DOJODBG(); STORE.goTo(n.x,n.z+2.2*d.tile,'up'); }); await pg.waitForTimeout(800);
  await pg.evaluate(()=>DOJOTRAIN());
  const log=[]; let seen={}, n=0;
  for(let i=0;i<500;i++){ const d=await dbg(); if(!d.tr.on)break; const key=d.tr.ph+d.tr.n;
    if(!seen[key]){ seen[key]=1; log.push([d.tr.ph,d.tr.n,d.tr.drill,d.ninja&&d.ninja.mv,d.ninja&&d.ninja.up]);
      if(d.tr.ph==='demo'){ await pg.waitForTimeout(250); await shot('train'+d.tr.n+'-demo'); }
      if(d.tr.ph==='you'){ await shot('train'+d.tr.n+'-you'); if(d.tr.n!==2){ const ks=await pg.evaluate(k=>k.map(a=>__UI.keyOf(a)),d.tr.keys); for(const k of ks){ await pg.keyboard.press(k===' '?'Space':k); await pg.waitForTimeout(230); } } }
      if(d.tr.ph==='good'||d.tr.ph==='miss'){ await shot('train'+d.tr.n+'-'+d.tr.ph); }
      if(d.tr.ph==='end'){ await shot('train-end',null,300); } }
    await pg.waitForTimeout(120); }
  rep.trainLog=log; rep.fight1=(await dbg()).fight; rep.forage=await pg.evaluate(()=>FORDBG().sk.fight);
  await pg.evaluate(()=>DOJOWALK('out'));
  for(let i=0;i<200;i++){ if((await dbg()).busy)break; await pg.waitForTimeout(50); }
  await shot('fade-out',null,120);
  for(let i=0;i<100;i++){ await pg.waitForTimeout(100); if(!(await dbg()).busy)break; }
  await shot('outside',null,2500); rep.d2=await dbg();
  await shot('menu-jump',()=>__UI.goPlace('THE DOJO'),2500); rep.d3=await dbg();
  fin(); await b.close(); })();
