// THE MAP EDITOR, CHECKED (src/mapedit.js): Shift+M opens it; the bodega dragged 8 tiles back from the street and the park 10 east and 6 further
// out on its plan; APPLY reloads the page with them there. Then: the boxes, the walls' solids, the lamps and the Fox moved with them; he walks
// into the moved bodega's front wall and stops; he walks through where it was; no page errors. Shots: argv[2] (a folder), mapedit_*.png
// node tests/mapedit.cjs <out folder>
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]||'.', b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}), pg=await b.newPage({viewport:{width:1280,height:820}}), errs=[];
  pg.on('pageerror',e=>{ errs.push(e.message); console.log('pageerror:',e.message); });
  const url='file://'+process.cwd()+'/dist/market.html?npcwait=99&hour=13';
  const start=async()=>{ for(let i=0;i<120;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))return i; } throw 'never started'; };
  await pg.goto(url); console.log('started at',await start()); await pg.waitForTimeout(4000);
  const T=await pg.evaluate(()=>__dbg.cv().TILE), box0=await pg.evaluate(()=>({bod:MAPED.box('bodega'),park:MAPED.box('park')}));
  // open it, drag the two places on its plan
  await pg.keyboard.press('Shift+M'); await pg.waitForTimeout(3000); console.log('open:',await pg.evaluate(()=>MAPED.on&&getComputedStyle(document.getElementById('maped')).display));
  await pg.screenshot({path:out+'/mapedit_panel_before.png'});
  const drag=async(k,dx,dz)=>{ const b=await pg.evaluate(k=>MAPED.box(k),k), [x,y]=await pg.evaluate(([x,z])=>MAPED.px(x,z),[(b[0]+b[2])/2+(k==='park'?6*T:0),(b[1]+b[3])/2]), s=await pg.evaluate(()=>MAPED.k());
    await pg.mouse.move(x,y); await pg.mouse.down(); for(let i=1;i<=8;i++){ await pg.mouse.move(x+dx*T*s*i/8,y+dz*T*s*i/8); await pg.waitForTimeout(30); } await pg.mouse.up(); };
  await drag('bodega',0,-8); await drag('park',10,6); await pg.waitForTimeout(300);
  console.log('work:',JSON.stringify(await pg.evaluate(()=>MAPED.work())));
  await pg.screenshot({path:out+'/mapedit_panel_moved.png'});
  // APPLY: kept, the page loaded again
  await Promise.all([pg.waitForNavigation({timeout:60000}),pg.click('#meA')]); console.log('reloaded, started at',await start()); await pg.waitForTimeout(4000);
  const r=await pg.evaluate(([T])=>{ const S=__dbg.SOL.up, b=MAPED.box('bodega'), p=MAPED.box('park'), inB=(q,B)=>(q[0]+q[2])/2>B[0]-.01&&(q[0]+q[2])/2<B[2]+.01&&(q[1]+q[3])/2>B[1]-.01&&(q[1]+q[3])/2<B[3]+.01;
    const old=[b[0],b[3]+1*T,b[2],b[3]+8*T], pw=[p[0],p[1]-.3*T,p[2],p[1]+.8*T], pwo=[p[0]-10*T,p[1]-6.3*T,p[2]-10*T,p[1]-5.2*T],   /* (old: where it stood and nothing of it now (its front's things stand a little out); pw, pwo: the park's wall line now and before) */ L=LITE.recs.filter(L=>L.position.x||L.position.z).map(L=>[L.position.x,L.position.z,L.position.z]);   /* (not the two unplaced, unlit records at the world's middle: in every build) */
    return {bod:b,park:p,solNew:S.filter(q=>inB(q,b)).length,solOld:S.filter(q=>inB(q,old)&&!inB(q,b)).length,lampNew:L.filter(l=>inB([l[0],l[1],l[0],l[1]],b)).length,lampOld:L.filter(l=>inB([l[0],l[1],l[0],l[1]],old)&&!inB([l[0],l[1],l[0],l[1]],b)).length,
      wallNew:S.filter(q=>inB(q,pw)).length, wallOld:S.filter(q=>inB(q,pwo)&&!inB(q,pw)).length,
      oldS:S.filter(q=>inB(q,old)&&!inB(q,b)).map(q=>q.map(v=>+(v/T).toFixed(2))), oldL:L.filter(l=>inB([l[0],l[1],l[0],l[1]],old)&&!inB([l[0],l[1],l[0],l[1]],b)).map(l=>[+(l[0]/T).toFixed(2),+(l[1]/T).toFixed(2)]), fox:window.FOXDBG?(typeof FOXDBG==="function"?FOXDBG():FOXDBG):null}; },[T]);
  console.log('bodega box before',box0.bod.map(v=>v.toFixed(2)).join(','),'after',r.bod.map(v=>v.toFixed(2)).join(','),'(z moved',((r.bod[1]-box0.bod[1])/T).toFixed(2),'tiles)');
  console.log('park box before',box0.park.map(v=>v.toFixed(2)).join(','),'after',r.park.map(v=>v.toFixed(2)).join(','),'(moved',((r.park[0]-box0.park[0])/T).toFixed(2),((r.park[1]-box0.park[1])/T).toFixed(2),'tiles)');
  console.log('solids in the new bodega:',r.solNew,'left where it was:',r.solOld,JSON.stringify(r.oldS),'· lamps in the new bodega:',r.lampNew,'left where it was:',r.lampOld,'· the park wall\'s solids on its new line:',r.wallNew,'on its old line:',r.wallOld,'· fox:',JSON.stringify(r.fox).slice(0,160));
  // walking: at the moved front wall (west of the door) he's stopped; where the old wall was he walks on
  const walk=async(x,z,tx,tz,ms)=>{ await pg.evaluate(([x,z])=>STORE.goTo(x,z,'up'),[x,z]); await pg.waitForTimeout(600); await pg.evaluate(([x,z])=>__dbg.go(x,z),[tx,tz]); await pg.waitForTimeout(ms); return pg.evaluate(()=>[STORE.pos.x,STORE.pos.z]); };
  const xw=r.bod[0]+2.2*T, zf=r.bod[3], zo=zf+8*T;   // (west of the door, under the west window; the front wall now, and where it was)
  const c1=await walk(xw,zf+1.2*T,xw,zf-3*T,20000); console.log('walked at the moved front wall: stopped at z',(c1[1]/T).toFixed(2),'· the wall at',(zf/T).toFixed(2),c1[1]>zf?'STOPPED BY IT':'WENT THROUGH');
  await pg.screenshot({path:out+'/mapedit_wall.png'});
  const c2=await walk(xw,zo+1.2*T,xw,zo-3*T,20000); console.log('walked where the front wall was: reached z',(c2[1]/T).toFixed(2),'· the old wall at',(zo/T).toFixed(2),c2[1]<zo-.5*T?'WALKED ON':'STOPPED');
  const k1=await pg.evaluate(([x,z])=>__dbg.collide(x,z),[xw,zf]), k2=await pg.evaluate(([x,z])=>__dbg.collide(x,z),[xw,zo]);
  console.log('a spot on the moved wall is pushed to z',(k1[1]/T).toFixed(2),'· a spot on the old wall line stays at',(k2[1]/T).toFixed(2),'(from',(zo/T).toFixed(2)+')');
  // from above: the editor's picture of the Market as now built, and the game's own view over the bodega, zoomed out
  await pg.keyboard.press('Shift+M'); await pg.waitForTimeout(4000); await pg.screenshot({path:out+'/mapedit_after.png'});
  await pg.keyboard.press('Escape'); await pg.evaluate(([x,z])=>STORE.goTo(x,z,'up'),[(r.bod[0]+r.bod[2])/2,r.bod[3]+3*T]); await pg.evaluate(()=>__dbg.cam(null,1.2,null)); await pg.waitForTimeout(500);
  for(let i=0;i<6;i++){ await pg.mouse.move(640,410); await pg.mouse.wheel(0,300); await pg.waitForTimeout(150); } await pg.waitForTimeout(5000); await pg.screenshot({path:out+'/mapedit_view.png'});
  console.log('page errors:',errs.length); await b.close(); })();
