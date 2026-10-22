// MOCKUP ONLY (not wired into the game): first-person at the Hudson's quay — the current walled far edge vs a proposal where the far wall is
// gone and the water runs out to a hazy horizon (an invisible swim limit would sit a little past the extended edge). node tests/rivedge-mock.cjs <outdir>
const {chromium}=require('playwright'), out=process.argv[2]||'.';
const shot=async(pg,f,ms=3500)=>{ await pg.waitForTimeout(ms); await pg.screenshot({path:`${out}/${f}.png`,timeout:120000}); console.log('shot',f); };
(async()=>{ require('fs').mkdirSync(out,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1200,height:620}}); pg.setDefaultTimeout(120000); pg.on('pageerror',e=>console.log('pageerror:',e.message.slice(0,200)));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13&hideme=1',{timeout:180000});
  await pg.waitForFunction(()=>window.__started&&window.RIVER&&window.RIVER.build,{timeout:240000}); await pg.waitForTimeout(3000);
  // build the Hudson (it's lazy now), then stand at the quay in first person
  await pg.evaluate(async()=>{ if(!RIVER.on)await (window.FADE?FADE.run('x',()=>RIVER.build()):Promise.resolve(RIVER.build())); });
  await pg.waitForFunction(()=>window.RIVER.box&&document.querySelector('#rvpan [data-go="1"]'),{timeout:60000});
  await pg.evaluate(()=>{ document.querySelector('#rvpan [data-go="1"]').click(); }); await pg.waitForTimeout(3500);
  await pg.evaluate(()=>{ RIVER.set&&RIVER.set({way:'flat',wi:0}); __dbg.UI.setView('first'); }); await pg.waitForTimeout(1500);
  console.log('at', await pg.evaluate(()=>({pos:__dbg.pos(), box:RIVER.box})));
  const HDS=[0,Math.PI/2,Math.PI,3*Math.PI/2], DEG=[0,90,180,270];
  for(let i=0;i<4;i++){ await pg.evaluate(h=>__dbg.setHd(h),HDS[i]); await shot(pg,'before-'+DEG[i],1800); }
  // THE PROPOSAL, applied live for the picture only
  await pg.evaluate(()=>{ const THREE=__dbg.THREE, scene=__dbg.scene, B=RIVER.box, T=__dbg.cv().TILE;
    if(RIVER.wallS)RIVER.wallS.visible=false;
    const bg=scene.background&&scene.background.isColor?scene.background.clone():new THREE.Color(0.62,0.69,0.78);
    const far=B.z0-900, w=(B.x1-B.x0)+1600, geo=new THREE.PlaneGeometry(w, B.z1-far).rotateX(-Math.PI/2);
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:new THREE.Color(0.13,0.30,0.37), fog:true}));
    m.position.set((B.x0+B.x1)/2, B.lv-0.04, (B.z1+far)/2); m.renderOrder=-1; scene.add(m);
    scene.fog=new THREE.Fog(bg, 30*T, 340*T); });
  for(let i=0;i<4;i++){ await pg.evaluate(h=>__dbg.setHd(h),HDS[i]); await shot(pg,'after-'+DEG[i],1800); }
  await b.close(); })();
