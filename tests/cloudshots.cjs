const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'out', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,3000)); };
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 for(const H of ['13','15.5']){
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(H+' '+e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(H+' '+m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hide=1&hour='+H+'&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(5000);
  const shot=async(n,f,w=4000)=>{ try{ if(f)await pg.evaluate(f); await pg.waitForTimeout(w); await pg.screenshot({path:path.join(OUT,H+'-'+n+'.png')}); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  const SPOT=[[-13,-15],[13,-15],[-14,3],[14,3],[-12,21],[13,21]];
  rep['wx'+H]=await pg.evaluate(()=>({show:WX.show,vis:WX.clouds.visible,n:WX.cld.length,inst:WX.clouds.geometry.instanceCount,cy:WX.cy,pos:WX.clouds.position.toArray().map(v=>+v.toFixed(1)),sun:CLOCK.dir.toArray().map(v=>+v.toFixed(2))}));
  await pg.mouse.move(480,270); for(let i=0;i<10;i++){ await pg.mouse.wheel(0,600); await pg.waitForTimeout(150); }
  for(let i=0;i<6;i++)await shot('animal'+i,(g)=>{ const M=__dbg.MAPK, P=M.PARK, T=window.TILE||33.9/30; STORE.goTo(M.BOD.XS(P.round[0]+(P.ox||0))+g[0]*T,M.BOD.ZS(P.round[1]+(P.oy||0))+g[1]*T,'up'); },3000);
  await pg.evaluate(SP=>0,SPOT);
  if(H==='13'){
   await shot('wide',()=>{ const M=__dbg.MAPK, P=M.PARK; STORE.goTo(M.BOD.XS(P.round[0]+(P.ox||0)),M.BOD.ZS(P.round[1]+(P.oy||0)),'up'); },3000);
   await pg.keyboard.press('v'); await shot('behind',()=>{ const s=__dbg.clock.sunV; __dbg.face(Math.atan2(-s.x,-s.z)); window.LOOKPITCH&&LOOKPITCH(4); },4000);
   await shot('behind-away',()=>{ const s=__dbg.clock.sunV; __dbg.face(Math.atan2(s.x,s.z)); window.LOOKPITCH&&LOOKPITCH(4); },4000);
   await pg.keyboard.press('v'); await shot('first-up',()=>{ const s=__dbg.clock.sunV; __dbg.face(Math.atan2(-s.x,-s.z)); window.LOOKPITCH&&LOOKPITCH(-40); },4000);
   await shot('first-up2',()=>{ window.LOOKPITCH&&LOOKPITCH(40); },4000);
   await shot('first-away',()=>{ const s=__dbg.clock.sunV; __dbg.face(Math.atan2(s.x,s.z)); window.LOOKPITCH&&LOOKPITCH(-25); },4000);
   rep.render=await pg.evaluate(()=>{ try{ const r=RENDERLIST(); return {head:r.head||r.totals||null}; }catch(e){ return 'ERR '+e.message; } });
   rep.info=await pg.evaluate(()=>{ const i=__dbg && window.__scene ? null:null; return null; });
  }
  await pg.close(); }
 fin(); await b.close(); })();
