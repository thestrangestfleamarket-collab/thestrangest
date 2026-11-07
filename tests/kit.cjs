// THE STARTER KIT AND THE BMX (src/141-forage.js FORAGE.KIT, src/111fd-skatepark.js BMXP): node tests/kit.cjs [dist/market.html]. A new player starts with the whole kit (99 of each power
// mushroom, the fastest hoverboard, the BMX, the nets, skateboard, go-kart, balloon, kite, guitar, rod, camera, binoculars), none of it archived; it is given once; the BMX rides.
const {chromium}=require('playwright'), path=require('path');
const PAGE=path.resolve(process.argv[2]||'dist/market.html');
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  { const DIR=path.join(process.cwd(),'node_modules/@dimforge/rapier3d-compat'), fs=require('fs');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=path.join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue(); r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  await pg.goto('file://'+PAGE+'?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  const k=await pg.evaluate(()=>{ const K=FORAGE.KIT, miss=Object.entries(K).filter(([id,n])=>(INV.items[id]||0)<n).map(([id])=>id), arch=Object.keys(K).filter(id=>ARCHI(id)); return {n:Object.keys(K).length,miss,arch,given:!!FORAGE.S.kit1}; });
  rec('a new player starts with the whole kit, none of it archived',k.n>=18&&!k.miss.length&&!k.arch.length&&k.given,JSON.stringify(k));
  const o=await pg.evaluate(()=>{ INV.items.airshroom=3; const S=FORAGE.S; return {once:S.kit1===1}; });
  rec('the kit is marked given, so it is not given again',o.once,JSON.stringify(o));
  await pg.waitForFunction(()=>window.RIDE&&RIDE.kinds.bmx,null,{timeout:120000}).catch(()=>{});
  const r=await pg.evaluate(async()=>{ WIELD.set('bmx'); await new Promise(r=>setTimeout(r,400)); const ok=RIDE.mount('bmx'); document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'w',code:'KeyW',bubbles:true})); await new Promise(r=>setTimeout(r,2000));
    const ST=__dbg.ST, v=RIDE.v, pose=ST.ride&&ST.ride.k; document.body.dispatchEvent(new KeyboardEvent('keyup',{key:'w',code:'KeyW',bubbles:true})); RIDE.off(); return {ok,v:+v.toFixed(2),pose,off:!RIDE.on}; });
  rec('the BMX rides: on it, W pedals it forward on the rig\'s bike pose, a click gets off',r.ok&&r.v>.1&&r.pose==='bike'&&r.off,JSON.stringify(r));
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,n])=>n+'× '+k).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'all passed'); process.exit(bad?1:0); })();
