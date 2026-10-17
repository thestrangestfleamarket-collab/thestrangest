// THE GUITARIST CLOSE (musician.js): his strumming arm from the front, his right side and above, at the screen's pixels; the page's errors.
// node tests/gtshot.cjs out "<extra url params>" [where: bar|street]
const {chromium}=(()=>{ try{ return require('playwright'); }catch(e){ return require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright'); } })();
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:900,height:700}}); pg.setDefaultTimeout(240000);
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message.slice(0,300),(e.stack||'').split('\n').slice(1,3).join(' / ').slice(0,300)); });
  const out=process.argv[2]||'gt', extra=process.argv[3]||'', where=process.argv[4]||'bar';
  const url='file://'+process.cwd()+'/dist/market.html?hideme=1&npcwait=99'+(where==='bar'?'&hour=21&place=the%20bar&set=600':'&hour=13&at=-2.45,2.7')+extra;
  await pg.goto(url,{waitUntil:'commit',timeout:240000}); for(let i=0;i<120&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000); await pg.waitForTimeout(9000);
  if(where==='bar')await pg.evaluate(()=>{ STORE.STAGE&&STORE.STAGE.go('gtr'); const A=STORE.MUS.at; STORE.pos.set(A.x,0,A.z+1.1); }); await pg.waitForTimeout(3000);
  // the camera on him: close, a few sides (yaw: the view's turn), a little above
  for(const [n,y,p] of [['front',0,.25],['right',-1.3,.25],['right2',-0.7,.15],['above',0,.9]]){ await pg.evaluate(([y,p])=>{ const A=STORE.MUS.at; window.__dbg.UI.setFree(true); window.__dbg.UI.camT.set(A.x,(A.y||0)+1.0,A.z); window.__dbg.cam(y,p,window.__dbg.cv().PPU*4.5); },[y,p]); await pg.waitForTimeout(3500); await pg.screenshot({path:out+'_'+n+'.png'}); }
  console.log(await pg.evaluate(()=>JSON.stringify({at:STORE.MUS.at,el:STORE.MUS.elbow&&STORE.MUS.elbow(),stage:STORE.STAGE&&STORE.STAGE.who()})).catch(e=>'eval '+e.message)); console.log('errors',JSON.stringify(errs)); await b.close(); })();
