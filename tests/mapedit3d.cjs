// THE MAP EDITOR IN 3D, CHECKED (src/mapedit.js): Shift+M; the view turned right round with a right drag; the bodega dragged in the world (its box
// and the quarter-tile grid shown mid-drag), the park dragged (its own meshes carried live) and its east edge pulled; every move on a quarter tile;
// the arrows a quarter, Shift+arrow a tile; closing puts the live moves back; APPLY builds them (the bodega's walls where its box was).
// node tests/mapedit3d.cjs <out folder>   (shots: mapedit3d_*.png)
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]||'.', b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}), pg=await b.newPage({viewport:{width:1280,height:820}}), errs=[];
  pg.on('pageerror',e=>{ errs.push(e.message); console.log('pageerror:',e.message); });
  const start=async()=>{ for(let i=0;i<120;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))return i; } throw 'never started'; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?npcwait=99&hour=13'); console.log('started at',await start()); await pg.waitForTimeout(3000);
  const T=await pg.evaluate(()=>__dbg.cv().TILE), PPU=await pg.evaluate(()=>__dbg.cv().PPU), q=v=>Math.abs(v*4-Math.round(v*4))<1e-6;
  const look=async(k,yaw,pitch,z)=>{ await pg.evaluate(([k,yaw,pitch,z])=>{ const b=typeof k==='string'?MAPED.box(k):[k[0],k[1],k[0],k[1]], p=STORE.pos; __dbg.UI.off.set((b[0]+b[2])/2-p.x,0,(b[1]+b[3])/2-p.z); __dbg.cam(yaw,pitch,z); },[k,yaw,pitch,PPU*z]); await pg.waitForTimeout(6000); };
  const scr=(x,y,z)=>pg.evaluate(([x,y,z])=>MAPED.scr(x,y,z),[x,y,z]);
  const drag=async(from,to,shot)=>{ const a=await scr(...from), c=await scr(...to); await pg.mouse.move(a[0],a[1]); await pg.mouse.down();
    for(let i=1;i<=10;i++){ await pg.mouse.move(a[0]+(c[0]-a[0])*i/10,a[1]+(c[1]-a[1])*i/10); await pg.waitForTimeout(60); if(i===7&&shot){ await pg.waitForTimeout(1500); await pg.screenshot({path:out+'/'+shot}); } } await pg.mouse.up(); await pg.waitForTimeout(300); };
  await pg.keyboard.press('Shift+M'); await pg.waitForTimeout(3000); console.log('open:',await pg.evaluate(()=>[MAPED.on,__dbg.UI.view]));
  await look('bodega',.6,.75,.55); await pg.screenshot({path:out+'/mapedit3d_open.png'});
  // the bodega dragged on the ground: from a spot inside its footprint, 3.37 tiles east and 2.13 north (not on the grid: it must snap)
  const bb=await pg.evaluate(()=>MAPED.box('bodega')), p0=[(bb[0]+bb[2])/2,.02,bb[3]-.6*T];
  await drag(p0,[p0[0]+3.37*T,.02,p0[2]-2.13*T],'mapedit3d_dragging.png');
  let w=await pg.evaluate(()=>MAPED.work()); console.log('bodega after the drag:',JSON.stringify(w.bodega),'on the quarter grid:',q(w.bodega.x)&&q(w.bodega.y));
  // turned right round with a right drag (the view's own), and looked at from the far side
  const y0=(await pg.evaluate(()=>__dbg.yaw()))[1]; await pg.mouse.move(640,420); await pg.mouse.down({button:'right'}); for(let i=1;i<=12;i++){ await pg.mouse.move(640+i*50,420); await pg.waitForTimeout(40); } await pg.mouse.up({button:'right'});
  const y1=(await pg.evaluate(()=>__dbg.yaw()))[1]; console.log('a right drag of 600 px turned the view',((y0-y1)*180/Math.PI).toFixed(0),'degrees');
  await look('bodega',.6+Math.PI,.5,.55); await pg.screenshot({path:out+'/mapedit3d_angle2.png'});
  // the park: dragged (its own meshes with it, live), then its east edge pulled out
  await look('park',-.4,.9,.3); const pk=await pg.evaluate(()=>MAPED.box('park')), pp=[(pk[0]+pk[2])/2+10*T,.02,(pk[1]+pk[3])/2];
  await drag(pp,[pp[0]+4.6*T,.02,pp[2]+1.9*T],'mapedit3d_park_dragging.png');
  w=await pg.evaluate(()=>MAPED.work()); const g=await pg.evaluate(()=>MAPED.grp('park')); console.log('park after the drag:',JSON.stringify(w.park),'· its meshes moved live by',(g[0]/T).toFixed(2),(g[2]/T).toFixed(2),'tiles');
  const pk2=await pg.evaluate(()=>MAPED.box('park')), pe=[pk2[2],.02,(pk2[1]+pk2[3])/2]; await look([pe[0],pe[2]],-.4,.9,.4); await drag(pe,[pe[0]+3.1*T,.02,pe[2]]); w=await pg.evaluate(()=>MAPED.work()); console.log('park after its east edge pulled 3.1 tiles:',JSON.stringify(w.park));
  await pg.screenshot({path:out+'/mapedit3d_park_live.png'});
  // the arrows
  await pg.evaluate(()=>MAPED.sel('bodega')); const x0=(await pg.evaluate(()=>MAPED.work())).bodega.x; await pg.keyboard.press('ArrowRight'); const x1=(await pg.evaluate(()=>MAPED.work())).bodega.x; await pg.keyboard.press('Shift+ArrowRight'); const x2=(await pg.evaluate(()=>MAPED.work())).bodega.x;
  console.log('arrow: +'+(x1-x0)+' tile, Shift+arrow: +'+(x2-x1)+' tile');
  // closed: what's built stands as it was till APPLY
  await pg.keyboard.press('Shift+M'); await pg.waitForTimeout(500); console.log('closed: the park\'s meshes back at',JSON.stringify(await pg.evaluate(()=>MAPED.grp('park'))),'view',await pg.evaluate(()=>__dbg.UI.view));
  // APPLY: built where the boxes said
  await pg.keyboard.press('Shift+M'); await pg.waitForTimeout(2000); const want=await pg.evaluate(()=>({b:MAPED.box('bodega'),p:MAPED.box('park')}));
  await Promise.all([pg.waitForNavigation({timeout:60000}),pg.click('#meA')]); console.log('reloaded, started at',await start()); await pg.waitForTimeout(3000);
  const got=await pg.evaluate(()=>({b:MAPED.box('bodega'),p:MAPED.box('park')})), d=(a,c)=>Math.max(...a.map((v,i)=>Math.abs(v-c[i])));
  console.log('built where the boxes were: bodega off by',d(want.b,got.b).toFixed(4),'park off by',d(want.p,got.p).toFixed(4));
  const wall=await pg.evaluate(([T])=>{ const b=MAPED.box('bodega'), x=b[0]+2.2*T; return [__dbg.collide(x,b[3])[1],b[3]]; },[T]); console.log('a spot on its new front wall pushed out to',(wall[0]/T).toFixed(2),'(the wall at',(wall[1]/T).toFixed(2)+')');
  await pg.keyboard.press('Shift+M'); await pg.waitForTimeout(3000); await look('bodega',2.2,.6,.55); await pg.screenshot({path:out+'/mapedit3d_applied.png'});
  console.log('page errors:',errs.length); await b.close(); })();
