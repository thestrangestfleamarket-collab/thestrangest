// THE PLAYHOUSE IN PICTURES (the Wooden O): goes in and takes a picture from each of a list of spots (local metres: x, z, eye height above the ground, the way you look, the tilt), for looking over the round by eye.
// Run: node tests/playhouse-shots.cjs [outdir] [only]   (slow: software rendering)
const {chromium}=require('playwright'), fs=require('fs');
const OUT=process.argv[2]||'shots', ONLY=process.argv[3]||'';
const SPOTS={
  yard:[0,8,1.6,Math.PI,-.05], stage:[0,-4.5,1.6,0,-.05], heavens:[0,-3,1.6,Math.PI,.9], sky:[0,2,1.6,0,.9], gate:[0,10.5,1.6,0,0], gallery:[-10.4,0,1.6,Math.PI/2,-.1], tiring:[0,-1,1.6,Math.PI,.1] };
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({executablePath:process.env.PW_EXE||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}), errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error'||/playhouse|chunk/.test(m.text()))console.log('console:',m.text().slice(0,300)); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,0&hour=12'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(1500);
  const idle=()=>pg.waitForFunction(()=>!(window.FADE&&FADE.busy),null,{timeout:180000,polling:300}).catch(()=>{});
  await pg.evaluate(()=>ROOMS.enter('playhouse')); await idle(); await pg.waitForTimeout(3000);
  console.log(JSON.stringify(await pg.evaluate(()=>{ const d=PHDBG(); delete d.W; delete d.L; delete d.ground; return d; })));
  for(const [k,[x,z,e,hd,pt]] of Object.entries(SPOTS)){ if(ONLY&&!ONLY.split(',').includes(k))continue;
    await pg.evaluate(([x,z,hd,pt])=>{ PHDBG().look(x,z,hd,pt,'first'); },[x,z,hd,pt]);
    await pg.waitForTimeout(2500); await pg.screenshot({path:OUT+'/'+k+'.png',timeout:240000}); console.log('shot',k); }
  console.log(errs.length?'errors: '+errs.join(' | '):'no page errors'); await b.close(); })();
