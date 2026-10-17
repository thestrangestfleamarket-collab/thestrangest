// HOW THE GUITARIST HOLDS IT (musician.js, MUS.hold): a few holds tried in one load, his arms' joints and a picture of each from the front
// and his right front. node tests/gthold.cjs out '[[drop,tiltDeg,[wrx,wry,wrz],[polex,poley,polez]],...]'
const {chromium}=(()=>{ try{ return require('playwright'); }catch(e){ return require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright'); } })();
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:700,height:700}}); pg.setDefaultTimeout(240000);
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message.slice(0,300)); });
  pg.on('console',m=>{ if(m.type()==='error'||m.type()==='warning')console.log('console',m.type(),m.text().slice(0,300)); });
  const out=process.argv[2]||'hold', H=JSON.parse(process.argv[3]||'[]');
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hideme=1&npcwait=99&hour=21&place=the%20bar&set=600',{waitUntil:'commit',timeout:240000}); for(let i=0;i<120&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000); await pg.waitForTimeout(9000);
  await pg.evaluate(()=>{ STORE.STAGE.go('gtr'); const A=STORE.MUS.at; STORE.pos.set(A.x,0,A.z+1.4); }); await pg.waitForTimeout(2000);
  for(let k=0;k<H.length;k++){ const [dr,tl,wr,po]=H[k]; await pg.evaluate(([dr,tl,wr,po])=>{ STORE.MUS.hold(dr,tl*Math.PI/180,wr,po); STORE.MUS.err={L:[0,0],R:[0,0]}; },[dr,tl,wr,po]);
    for(const [n,y,p] of [['f',0,.2],['r',.75,.2]]){ await pg.evaluate(([y,p])=>{ const A=STORE.MUS.at; window.__dbg.UI.setFree(true); window.__dbg.UI.camT.set(A.x,(A.y||0)+1.0,A.z); window.__dbg.cam(y,p,window.__dbg.cv().PPU*5); },[y,p]); await pg.waitForTimeout(2600); await pg.screenshot({path:out+k+n+'.png'}); }
    console.log(k,JSON.stringify(H[k]),await pg.evaluate(()=>JSON.stringify({vis:STORE.MUS.g.visible,rh:STORE.MUS._rh,pos:[STORE.pos.x.toFixed(2),STORE.pos.z.toFixed(2)],room:STORE.cur&&STORE.cur.name})),JSON.stringify(await pg.evaluate(()=>STORE.MUS.elbow())),'fingertips off their notes (his units, mean):',await pg.evaluate(()=>{ const e=STORE.MUS.err; return 'L '+(e.L[0]/Math.max(1,e.L[1])).toFixed(2)+' ('+e.L[1]+') R '+(e.R[0]/Math.max(1,e.R[1])).toFixed(2)+' ('+e.R[1]+')'; })); }
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
