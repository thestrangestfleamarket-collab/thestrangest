// THE SPRAY PAINT CHECK: node tests/spray.cjs [dist/market.html]. A can from the bodega: SPRAY from the pack opens the 256-colour grid; dots go on the wall as you spray, the can empties, the tag goes to the block's world, and tags from the block are drawn.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:900,height:560}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2500);
  const A=await pg.evaluate(()=>{ window.__sent=[]; ONLINE.send=m=>__sent.push(m); const no=SPRAY.open('spray_silver'); const closedStill=!SPRAY.on; FORAGE.give('spray_silver',1); SPRAY.open('spray_silver'); const el=document.getElementById('sprayp'); return {closedStill,on:SPRAY.on,open:!el.hidden,swatches:el.querySelectorAll('[data-c]').length,row:FORAGE.ROWB.some(f=>(f('spray_silver')||[]).some(r=>r[1]==='spray')),left:SPRAY.left('spray_silver'),cols:SPRAY.COL.length}; });
  ok(A.closedStill&&A.on&&A.open,'no can, no spraying; with a can from the bodega the palette opens');
  ok(A.swatches===256&&A.cols===256&&A.row,'256 colours on the grid, a SPRAY button on the can in your pack');
  const B=await pg.evaluate(()=>{ SPRAY.c=0x25; const P=__dbg.you(), V=__dbg.THREE.Vector3; const n=new V(0,0,1); let on=0; for(let i=0;i<30;i++){ if(SPRAY.at(new V(P.x+i*.06,SHARED.py+1+Math.sin(i)*.05,P.z-1),n))on++; } return {on,dots:SPRAY.state().dots,left:SPRAY.left('spray_silver')}; });
  ok(B.on===30&&B.dots===30&&B.left===900-30,'thirty sprays put thirty dots on the wall and use thirty of the can ('+JSON.stringify(B)+')');
  const C=await pg.evaluate(()=>{ SPRAY.close(); const m=__sent.filter(q=>q.t==='world'&&/^tag:A:/.test(q.k)); let t=null; try{ t=JSON.parse(m[0].v); }catch(e){} return {n:m.length,pts:t?t.p.split(',').length:0,c:t&&t.c,len:m[0]?m[0].v.length:0,on:SPRAY.on}; });
  ok(C.n===1&&C.pts===60&&C.c===0x25&&C.len<4000&&!C.on,'putting the can away sends the tag to the block, compact ('+JSON.stringify(C)+')');
  const D=await pg.evaluate(()=>{ const d0=SPRAY.state().dots; ONLINE.feed({t:'world',k:'tag:A:other',v:JSON.stringify({o:[10,1,10],n:[0,1,0],c:200,w:.05,p:'0,0,5,0,10,0,15,0'})}); return SPRAY.state().dots-d0; });
  ok(D===4,'a tag from another player on the block is drawn here ('+D+' dots)');
  const E=await pg.evaluate(()=>{ ONLINE.feed({t:'world',k:'tag:A:mine',v:'{"o":[0,0,0],"n":[0,1,0],"c":1,"w":.05,"p":"0,0"}'}); const s=JSON.parse(localStorage.getItem('market-save')||'{}'); return {can:s.spray}; });
  ok(!!E.can,'how much is left in the can is kept with your things');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0].slice(0,200):''));
  await b.close(); process.exit(bad?1:0); })();
