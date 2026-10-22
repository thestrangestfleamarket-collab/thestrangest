// THE FLOOR HOLDS: walking into THE LAKE (its bed below the street) keeps you on the street, and a drag turns and tilts the view in every view.
// Run: node tests/floorhold.cjs   (slow in a cloud container: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:800,height:450}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2000);
  const T=1.13, L=[(151-72)*T,(10+77)*T];
  await pg.evaluate(([x,z])=>{ __dbg.UI.goTo(x,z+2*1.13,'up',0); },L); await pg.waitForFunction(()=>__dbg.MAPK.PARK.in&&__dbg.MAPK.PARK.ready&&__dbg.ground(__dbg.pos()[0],__dbg.pos()[2])<-1.6,null,{timeout:300000,polling:500}).catch(()=>{});
  const lows=[]; for(let i=0;i<10;i++){ await pg.waitForTimeout(500); if(i===4)await pg.keyboard.press('Space'); lows.push(await pg.evaluate(()=>[__dbg.lvl(),+__dbg.pos()[1].toFixed(2),+__dbg.ground(__dbg.pos()[0],__dbg.pos()[2]).toFixed(2)])); }
  ok(lows.some(l=>l[2]<-1.6),'THE LAKE\'s bed is below the old height line ('+lows[0][2]+')');
  ok(lows.every(l=>l[0]==='up')&&Math.abs(lows[9][1]-lows[9][2])<.05,'standing and jumping in THE LAKE you stay on the street, on its bed ('+JSON.stringify(lows)+')');
  for(const v of ['iso','map','third','follow','first']){ await pg.evaluate(v=>__dbg.UI.setView(v),v); await pg.waitForTimeout(800);
    const a=await pg.evaluate(()=>[__dbg.cv().yaw,__dbg.cv().pitch]); await pg.mouse.move(400,225); await pg.mouse.down({button:'right'}); await pg.mouse.move(470,260,{steps:6}); await pg.mouse.up({button:'right'}); await pg.waitForTimeout(600);
    const c=await pg.evaluate(()=>[__dbg.cv().yaw,__dbg.cv().pitch]); ok(Math.abs(c[0]-a[0])>.1&&Math.abs(c[1]-a[1])>.01,'a right drag turns and tilts the '+v+' view ('+a.map(x=>x.toFixed(2))+' → '+c.map(x=>x.toFixed(2))+')'); }
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all floor and view checks passed'); await b.close(); process.exit(bad?1:0); })();
