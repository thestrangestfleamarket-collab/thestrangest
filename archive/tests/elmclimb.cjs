// THE ELMS UP CLOSE (park.js, 144e-trees.js): stand at an elm of the entrance rows, look up, climb it to the fork; the crown open inside, flowers and mushrooms at its foot. node tests/elmclimb.cjs <outdir> [page]
const {chromium}=require('playwright'), out=process.argv[2]||'.', page=process.argv[3]||'dist/market.html';
(async()=>{ const b=await chromium.launch({...(process.env.PWEXE?{executablePath:process.env.PWEXE}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:620}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  await pg.goto('file://'+require('path').resolve(page)+'?at=48,70&hour=14&npcwait=99',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; }
  await pg.waitForTimeout(6000);
  const info=await pg.evaluate(()=>{ const IT=PARK.treeItems().filter(o=>/^GE/.test(o.k)); const n=PARKDBG().trees.filter(t=>/^GE/.test(t[0])).length;
    let it=IT[0], bd=1e9; for(const o of IT){ const d=Math.hypot(o.x-__dbg.pos.x,o.z-__dbg.pos.z); if(d<bd){ bd=d; it=o; } } window.__elm=it; return {elms:n,top:it.top-it.y,fork:it.fork,feet:PARK.feet&&PARK.feet.userData}; }).catch(e=>({err:e.message}));
  console.log('elm',JSON.stringify(info)); if(!(info.elms>=30&&info.fork>0&&info.feet&&info.feet.flowers>0&&info.feet.mushrooms>0)){ console.log('FAIL: elms, their fork or the flowers and mushrooms at their feet are missing'); process.exitCode=1; }
  const go=async(name,f,view,pitch,wait=6000)=>{ await pg.evaluate(([f,view,pitch])=>{ const it=window.__elm, [x,z]=new Function('it','return '+f)(it); STORE.goTo(x,z,'up'); __dbg.UI.setView(view); const h=Math.atan2(it.x-x,it.z-z); SHARED.heading=h; SHARED.yaw=SHARED.yawTo=h+Math.PI; SHARED.pitch=SHARED.pitchTo=pitch; },[f,view,pitch]); await pg.waitForTimeout(wait); await pg.screenshot({path:`${out}/${name}.png`,timeout:120000}); console.log(name); };
  await go('elm-foot','[it.x+it.tr*4,it.z+it.tr*4]','follow',.1);
  await go('elm-lookup','[it.x+it.tr*2.2,it.z]','first',-1.1);
  await pg.evaluate(()=>{ TREES.want=window.__elm; }); await pg.keyboard.down('w'); await pg.waitForTimeout(20000); await pg.keyboard.up('w');
  const c=await pg.evaluate(()=>({...TREESDBG(),y:SHARED.py-window.__elm.y})); console.log('climb',JSON.stringify(c)); if(!(c.climbing&&c.y>0)){ console.log('FAIL: the elm cannot be climbed'); process.exitCode=1; }
  await pg.screenshot({path:`${out}/elm-climb.png`,timeout:120000});
  console.log('stat',await pg.textContent('#stat').catch(()=>''));
  await b.close(); })();
