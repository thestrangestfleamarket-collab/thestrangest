// MOCKUP ONLY (not committed to the game): first-person at the Hudson's quay, the current walled far edge vs a proposal — far wall gone,
// open water fading to a hazy horizon (an invisible swim limit would sit a little past the extended edge). node tests/rivedge-mock.cjs <outdir>
const {chromium}=require('playwright'), out=process.argv[2]||'.';
const shot=async(pg,f,ms=3500)=>{ await pg.waitForTimeout(ms); await pg.screenshot({path:`${out}/${f}.png`}); console.log('shot',f); };
(async()=>{ require('fs').mkdirSync(out,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1200,height:620}}); pg.on('pageerror',e=>console.log('pageerror:',e.message.slice(0,200)));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13&hideme=1',{timeout:180000});
  await pg.waitForFunction(()=>window.__started&&window.RIVER&&window.RIVER.box,{timeout:240000}); await pg.waitForTimeout(5000);
  await pg.evaluate(()=>{ const g=document.querySelector('#rvpan [data-go="1"]'); if(g)g.click(); }); await pg.waitForTimeout(3500);
  await pg.evaluate(()=>{ RIVER.set&&RIVER.set({way:'full',wi:0}); __dbg.UI.setView('first'); }); await pg.waitForTimeout(1500);
  console.log('at', await pg.evaluate(()=>({pos:__dbg.pos(), box:RIVER.box})));
  // find which way faces the water: two candidate headings, current look
  await pg.evaluate(()=>__dbg.setHd(Math.PI)); await shot(pg,'before-N');
  await pg.evaluate(()=>__dbg.setHd(0)); await shot(pg,'before-S');
  // THE PROPOSAL, applied live for the picture only (far wall gone, open water to a hazy horizon)
  await pg.evaluate(()=>{ const THREE=__dbg.THREE, scene=__dbg.scene, B=RIVER.box, T=__dbg.cv().TILE;
    if(RIVER.wallS)RIVER.wallS.visible=false;
    const bg=scene.background&&scene.background.isColor?scene.background.clone():new THREE.Color(0.62,0.69,0.78);
    const far=B.z0-900, w=(B.x1-B.x0)+1600, geo=new THREE.PlaneGeometry(w, B.z1-far).rotateX(-Math.PI/2);
    const mat=new THREE.MeshBasicMaterial({color:new THREE.Color(0.13,0.30,0.37), fog:true});
    const m=new THREE.Mesh(geo,mat); m.position.set((B.x0+B.x1)/2, B.lv-0.04, (B.z1+far)/2); m.renderOrder=-1; scene.add(m);
    scene.fog=new THREE.Fog(bg, 30*T, 340*T); });
  await pg.evaluate(()=>__dbg.setHd(Math.PI)); await shot(pg,'after-open-N');
  await pg.evaluate(()=>__dbg.setHd(0)); await shot(pg,'after-open-S');
  // a hazier horizon (stronger fade)
  await pg.evaluate(()=>{ const THREE=__dbg.THREE, scene=__dbg.scene, T=__dbg.cv().TILE; scene.fog=new THREE.Fog(scene.fog.color.clone(), 20*T, 200*T); });
  await pg.evaluate(()=>__dbg.setHd(Math.PI)); await shot(pg,'after-hazy-N');
  await pg.evaluate(()=>__dbg.setHd(0)); await shot(pg,'after-hazy-S');
  await b.close(); })();
