// THE LAKE'S BOATS (owner, 11 Nov 2026: "make sure the boats dont clip either. make it easy to get in a boat and ride it around"): the canoe, kayak and skiff float
// clear of each other; a double-click puts you in one, W A S D rows it, it never runs into another boat or the shore, and you step out on the bank. Run: node tests/boats.cjs
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({executablePath:process.env.PWC||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000});
  await pg.evaluate(()=>__dbg.UI.goTo(SHARED.BOD.XS(177),SHARED.BOD.ZS(121),'up'));
  await pg.waitForFunction(()=>window.BOATDBG&&BOATDBG().crafts.length>=3,null,{timeout:420000,polling:1000}).catch(()=>{}); await pg.waitForTimeout(1500);
  const d=await pg.evaluate(()=>BOATDBG());
  ok(d.crafts.length===3,'the canoe, kayak and skiff are moored ('+d.crafts.map(c=>c.id).join(', ')+')');
  ok(d.crafts.every(c=>!c.clash&&c.fits),'none overlaps another or the shore');
  const th=await pg.evaluate(()=>{ const t=__dbg.UI.things.find(t=>t.name==='THE KAYAK'); if(!t)return null; __dbg.UI.walkUp(t); return {reach:t.reach}; });
  await pg.waitForFunction(()=>BOAT.on,null,{timeout:30000}).catch(()=>{});
  const a=await pg.evaluate(()=>({on:BOAT.on,c:BOAT.c&&BOAT.c.id,hud:!document.getElementById('boathud').hidden,x:BOAT.x,z:BOAT.z}));
  ok(th&&a.on&&a.c==='kayak0'&&a.hud,'a double-click from the bank puts you in the kayak');
  if(!a.on){ console.log('1 failed'); await b.close(); process.exit(1); }
  if(process.env.SHOT){ await pg.evaluate(()=>__dbg.UI.setView('third')); await pg.waitForTimeout(2500); await pg.screenshot({path:process.env.SHOT+'-in.png'}); }
  // rowed at each other boat, at the shore and out on the water: never an overlap, and it does go
  const row=(tx,tz,n)=>pg.evaluate(([tx,tz,n])=>{ let bad=0, far=0; const x0=BOAT.x, z0=BOAT.z; for(let i=0;i<n;i++){ const dx=tx-BOAT.x, dz=tz-BOAT.z, l=Math.hypot(dx,dz)||1; BOAT.steer(.05,dx/l,dz/l); const me=BOATDBG().crafts.find(c=>c.id===BOAT.c.id); if(me.clash||!me.fits)bad++; far=Math.max(far,Math.hypot(BOAT.x-x0,BOAT.z-z0)); } return {bad,far:far/(SHARED.BOD.XS(1)-SHARED.BOD.XS(0))}; },[tx,tz,n]);
  const C=d.crafts, out=await pg.evaluate(()=>({x:SHARED.BOD.XS(200),z:SHARED.BOD.ZS(150)}));
  const r1=await row(out.x,out.z,400); ok(r1.bad===0&&r1.far>8,'rowed out on the lake ('+r1.far.toFixed(1)+' tiles)');
  const r2=await row(C[0].x,C[0].z,500); const r3=await row(C[2].x,C[2].z,500); ok(r2.bad===0&&r3.bad===0,'rowed straight at the canoe and the skiff: it stops short of them');
  const sh=await pg.evaluate(()=>({x:SHARED.BOD.XS(170),z:SHARED.BOD.ZS(112)})); const r4=await row(sh.x,sh.z,500); ok(r4.bad===0,'rowed at the bank: it stays on the water');
  const all=await pg.evaluate(()=>BOATDBG().crafts.every(c=>!c.clash&&c.fits)); ok(all,'after all that, still no boat overlaps another or the shore');
  await pg.keyboard.down('w'); await pg.waitForTimeout(2500); await pg.keyboard.up('w'); const kb=await pg.evaluate(()=>BOAT.on);
  ok(kb,'W A S D rows (you stay sat in it)');
  if(process.env.SHOT){ await pg.waitForTimeout(1500); await pg.screenshot({path:process.env.SHOT+'-row.png'}); }
  const e=await pg.evaluate(()=>{ const k=BOAT.c, at=[k.x,k.z]; BOAT.ashore(); return {on:BOAT.on,dry:!FOUNT.wet(...__dbg.pos(),0),sit:!!__dbg.ST.sit,stay:Math.hypot(k.x-at[0],k.z-at[1])<.01,hud:document.getElementById('boathud').hidden}; });
  ok(!e.on&&e.dry&&!e.sit&&e.stay&&e.hud,'STEP ASHORE puts you on the bank, the kayak left where you rowed it');
  if(process.env.SHOT){ await pg.waitForTimeout(2500); await pg.screenshot({path:process.env.SHOT+'-out.png'}); }
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all boat checks passed'); await b.close(); process.exit(bad?1:0); })();
