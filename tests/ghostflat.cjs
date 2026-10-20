const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'out', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={log:[]};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(5000);
  const dbg=async tag=>{ const d=await pg.evaluate(()=>{ const y=__dbg.you(); return Object.assign({you:[+y.x.toFixed(1),+y.z.toFixed(1),+(y.y||0).toFixed(2)]},window.DEADDBG?DEADDBG():{}); }); d.tag=tag; rep.log.push(d); fin(); console.log(JSON.stringify(d)); };
  let n=0; const shot=async(tag,f,w=3000)=>{ try{ if(f){ await pg.evaluate(f); await dbg(tag+'-now'); } await pg.waitForTimeout(w); n++; await pg.screenshot({path:path.join(OUT,String(n).padStart(2,'0')+'-'+tag+'.png')}); await dbg(tag); }catch(e){ errs.push(tag+': '+e.message.slice(0,200)); } };
  const park=(dx,dy)=>`(()=>{ const M=__dbg.MAPK, P=M.PARK; STORE.goTo(M.BOD.XS(P.round[0]+(P.ox||0)+${dx}),M.BOD.ZS(P.round[1]+(P.oy||0)+${dy}),'up'); })()`;
  await shot('park',park(9,6),3000);
  await pg.evaluate(()=>KILLME());
  for(let i=0;i<60;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!(window.RAGON&&RAGON())))break; }
  for(let i=0;i<5;i++)await shot('dead'+i,null,2000); for(let i=0;i<60;i++){ if(await pg.evaluate(()=>DEADDBG().gh>=1))break; await pg.waitForTimeout(1000); }
  await shot('bath-goto',()=>{ const M=__dbg.MAPK, G=M.BOD.GD, r=G.r; for(const X of [M.BOD.X,M.BOD.XS])for(const Z of [M.BOD.Z,M.BOD.ZS]){ STORE.goTo(X((r[0]+r[2])/2),Z((r[1]+r[3])/2),'up'); if(G.inside())return; } },4500);
  await shot('bath-2',null,2500); await shot('bath-3',null,4000);
  await shot('flora',park(5,5),4500);
  for(let i=0;i<4;i++)await shot('flora'+i,null,1500);
  await shot('street',()=>{ const B=__dbg.MAPK.BOD; STORE.goTo(B.XS(99),B.ZS((B.CURB+B.FAR)/2),'up'); },4500);
  await pg.keyboard.down('w'); await shot('walk',null,2500); await pg.keyboard.up('w'); await shot('walk-stop',null,1500);
  await pg.keyboard.down('Shift'); await pg.keyboard.down('w'); await shot('run',null,2500); await pg.keyboard.up('w'); await pg.keyboard.up('Shift');
  await pg.keyboard.press('Space'); await shot('jump',null,400); await shot('jump-after',null,2500);
  await pg.keyboard.press('v'); await shot('view-behind',null,2500); await pg.keyboard.press('v'); await shot('view-fp',null,2500); await pg.keyboard.press('v'); await shot('view-iso',null,2000);
  await shot('park-again',park(9,6),4500); await shot('park-again2',null,3000);
  fin(); await b.close(); })();
