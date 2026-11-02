// THE PLAYHOUSE IN PICTURES: goes in and takes a picture from each of a list of spots (local metres: x, z, eye height above the ground, the way you look, the tilt), for looking over the hall by eye.
// Run: node tests/playhouse-shots.cjs [outdir] [only]   (slow: software rendering)
const {chromium}=require('playwright'), fs=require('fs');
const OUT=process.argv[2]||'shots', ONLY=process.argv[3]||'';
const SPOTS={
  stalls:[0,16,1.6,Math.PI,-.05], circle:[0,26,1.6,Math.PI,.18], stage:[0,-6,1.6,Math.PI,-.05], apron:[0,1.5,1.6,0,-.15], box:[13.3,2.6,1.4,-Math.PI/2+.3,-.1],
  pit:[-3,6.2,1.6,Math.PI,.45], dome:[0,10,1.6,Math.PI,-.9], foyer:[0,40,1.6,Math.PI,.05], stairs:[-2,37,1.6,Math.PI+.5,-.25], landing:[0,28.6,1.6,0,-.1],
  wingsL:[9,-3,1.6,-Math.PI/2-.4,.1], wingsR:[-9,-6,1.6,Math.PI/2+.5,.1], fly:[0,-8,1.6,Math.PI/2,-1.1], dr1:[-6,-20,1.6,Math.PI,0], dr2:[6,-20,1.6,Math.PI,0],
  corridor:[-12,-17.6,1.6,Math.PI/2,0], bar:[6,34,1.6,Math.PI/2,0] };
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({executablePath:process.env.PW_EXE||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}), errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error'||/playhouse|chunk/.test(m.text()))console.log('console:',m.text().slice(0,300)); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,0&hour=12'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(1500);
  const idle=()=>pg.waitForFunction(()=>!(window.FADE&&FADE.busy),null,{timeout:180000,polling:300}).catch(()=>{});
  await pg.evaluate(()=>ROOMS.enter('playhouse')); await idle(); await pg.waitForTimeout(3000);
  console.log(JSON.stringify(await pg.evaluate(()=>{ const d=PHDBG(); delete d.W; delete d.L; delete d.ground; return d; })));
  for(const [k,[x,z,e,hd,pt]] of Object.entries(SPOTS)){ if(ONLY&&!ONLY.split(',').includes(k))continue;
    await pg.evaluate(([x,z,hd,pt])=>{ PHDBG().look(x,z,hd,pt,'first'); },[x,z,hd,pt]);
    await pg.waitForTimeout(2500); await pg.screenshot({path:OUT+'/'+k+'.png',timeout:240000}); console.log('shot',k); }
  if(process.env.CURTAIN){ for(const [k,t] of [['curtainShut',0],['curtainOpen',1],['curtainHalf',.5]]){ await pg.evaluate(t=>{ PHDBG().curtain(t); PHDBG().look(0,9,Math.PI,.04,'first'); PHDBG().run((K)=>{ const c=K.cloth.curtain; for(let i=0;i<400;i++)c.step(1/20,null); }); },t); await pg.waitForTimeout(3000); await pg.screenshot({path:OUT+'/'+k+'.png',timeout:240000}); console.log('shot',k); } }
  if(process.env.LOOKS){ for(const lk of process.env.LOOKS.split(',')){ await pg.evaluate(lk=>{ PHDBG().curtain(1); PHDBG().run((K)=>{ const c=K.cloth.curtain; for(let i=0;i<400;i++)c.step(1/20,null); K.lx.cue(lk,.01); }); PHDBG().look(0,13,Math.PI,.04,'first'); },lk); await pg.waitForTimeout(4000); await pg.screenshot({path:OUT+'/look-'+lk+'.png',timeout:240000}); console.log('shot',lk); } }
  console.log(errs.length?'errors: '+errs.join(' | '):'no page errors'); await b.close(); })();
