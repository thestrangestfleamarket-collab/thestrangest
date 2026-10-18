// THE METRO (owner, 17 Oct 2026; on the map 18 Oct 2026: "i want to bring the metro into the map and move the current subway station off map"):
// the subway from the Metro_PSX kit, looked at: the opening on the lot from the street, the flight down, the corridor, the gates, the platform
// with the car, the platform turned a quarter, and the car leaving (?train=leave is not a thing: its clock run on by hand). Each look: the
// level, the triangles, any street-level mesh still drawn underground (none expected: map-post's UNDER), console errors.
// Run: node tests/metroshot.cjs [out-dir]   (slow in a cloud container: software rendering, ~30 s a page)
const {chromium}=require('playwright'), out=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  // (spots in the kit's metres, kx across from the track to the back wall and on to the street, kz along the platform; METRO.X/Z/Y in the page)
  const shots=[['opening',[29.6,76.25,null],[]],['flight',[22,76.2,8],[]],['corridor',[13.7,66,4],[]],['gates',[14,50,1.4],['q']],['platform',[15,30,1.4],[]],['platform-q',[15,30,1.4],['q']],['train-leaving',[15,30,1.4],['q','leave']]];
  for(const [n,[kx,kz,ky],keys] of shots){ const pg=await b.newPage({viewport:{width:1000,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
    await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:180000}); await pg.waitForTimeout(3000);
    await pg.evaluate(([kx,kz,ky])=>{ const M=window.METRO, x=M.X(kx,kz), z=M.Z(kx,kz); STORE.goTo(x,z,ky==null?0:M.ground(x,z)); __dbg.cam(null,null,30); },[kx,kz,ky]); await pg.waitForTimeout(2500);
    for(const k of keys){ if(k==='leave'){ await pg.evaluate(()=>{ METRO.train.t=0; }); await pg.waitForTimeout(9000); } else{ await pg.keyboard.press(k); await pg.waitForTimeout(1500); } }
    await pg.screenshot({path:out+'/metro-'+n+'.png'});
    const r=await pg.evaluate(()=>{ const D=__dbg, T=D.THREE, cam=D.camO(), F=new T.Frustum(); F.setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse)); const bb=new T.Box3(); let up=0;
      if(D.lvl()==='down')D.scene.traverseVisible(o=>{ if(!o.isMesh||!o.layers.test(cam.layers)||(o.frustumCulled&&!F.intersectsObject(o)))return; let p=o; while(p.parent&&p.parent!==D.scene)p=p.parent; if(['down','dungeon','stairs','castlestairs','fire'].includes(p.name))return; bb.setFromObject(o); if(bb.min.y>-1)up++; });
      return {lvl:D.lvl(),pos:D.pos().map(v=>+v.toFixed(2)),tris:D.tris(),lamps:D.LITE.sel.length,train:METRO.train.state,streetMeshesUnderground:up}; });
    console.log(n,JSON.stringify(r),errs.length?'ERRORS: '+errs.join(' | '):''); await pg.close(); }
  await b.close(); })();
