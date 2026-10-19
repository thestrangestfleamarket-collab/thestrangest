// SCREENSHOTS OF A BATCH OF CHANGES (19 Oct 2026): node tests/batchshots.cjs <out dir> [page]: the page opened once, then a picture at each
// place (the menu's own jump, `goPlace`) or spot, after the world round it has settled; page errors listed in <out dir>/errors.txt.
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'shots', PAGE=path.resolve(process.argv[3]||path.resolve(__dirname,'../dist/market-prof.html'));
const SHOTS=[['start',null],['theatre','THE MOVIE THEATRE'],['arcade','THE ARCADE'],['playhouse','THE PLAYHOUSE'],['holodeck','THE HOLODECK'],['stage','()=>{ const d=STORE.main.doors.find(q=>q[0]===\'THE PLAYHOUSE\'); return [d[1],d[2]-6*window.__TILE]; }'],
  ['parkgate','()=>{ const P=__dbg.MAPK.PARK,B=__dbg.MAPK.BOD; return [B.XS(P.round[0]+(P.ox||0)),B.ZS(P.y0+(P.oy||0))-2]; }'],
  ['edge','()=>{ const b=window.RINGX&&RINGX.bound; return b?[b.x1-1.5,(b.z0+b.z1)/2]:[0,0]; }']];
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:1280,height:720}}); pg.setDefaultTimeout(900000); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,300)));
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__started))break; }
  await pg.waitForTimeout(6000);
  await pg.evaluate(()=>{ window.__TILE=window.__R&&window.CAMW?(__R.cam.right-__R.cam.left)/CAMW():1; });
  for(const [name,to] of SHOTS){ try{
      if(to&&to.startsWith('()'))await pg.evaluate(f=>{ const [x,z]=eval(f)(); __dbg.UI.goTo(x,z,'up'); },to);
      else if(to)await pg.evaluate(n=>{ const d=(STORE.main.doors||[]).find(q=>q[0]===n); if(d)__dbg.UI.goTo(d[1],d[2],'up'); },to);
      await pg.waitForTimeout(8000); await pg.screenshot({path:path.join(OUT,name+'.png')}); console.log('shot',name);
    }catch(e){ errs.push(name+': '+e.message.slice(0,200)); } }
  fs.writeFileSync(path.join(OUT,'errors.txt'),errs.join('\n')||'none'); console.log('errors:',errs.length?errs.join('\n'):'none'); await b.close(); })();
