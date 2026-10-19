// NEXT SHOTS (19 Oct 2026): node tests/nextshots.cjs <out dir>: Market St from above, the apartment house front, lobby and roof,
// the arcade with the holodeck booth, the Hudson before and after its far part loads, and the frog's state; page errors in report.json.
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'nextout', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,4000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(5000);
  const shot=async(n,f,w=5000)=>{ try{ if(f)await pg.evaluate(f); await pg.waitForTimeout(w); await pg.screenshot({path:path.join(OUT,n+'.png')}); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  rep.brook=[]; const n=await pg.evaluate(()=>__dbg.MAPK.PARK.brook.C.length);
  for(let k=0;k<12;k++){ const i=Math.round(k*(n-1)/11);
    await pg.evaluate(i=>{ const M=__dbg.MAPK, P=M.PARK, c=P.brook.C[i]; STORE.goTo(M.BOD.XS(c[0]+(P.ox||0)),M.BOD.ZS(c[1]+(P.oy||0)),'up'); },i);
    await pg.waitForTimeout(2500); const a=await pg.evaluate(()=>{ const y=__dbg.you(); return {y:+y.y.toFixed(2),room:window.ROOMS&&ROOMS.cur?(ROOMS.cur.id||ROOMS.cur.name||'?'):null,wade:!!(window.BROOK&&BROOK.wade)}; });
    await pg.keyboard.press(' '); await pg.waitForTimeout(1800); const b=await pg.evaluate(()=>{ const y=__dbg.you(); return {y:+y.y.toFixed(2),room:window.ROOMS&&ROOMS.cur?(ROOMS.cur.id||ROOMS.cur.name||'?'):null,wade:!!(window.BROOK&&BROOK.wade)}; });
    await pg.screenshot({path:path.join(OUT,'brook'+k+'.png')}); rep.brook.push({i,a,b}); }
  fin(); await b.close(); })();
