// THE TOWNSPEOPLE WANDER (owner, 22 Oct 2026: "townspeople shouldnt have routes. they sould wander freely"): each next stop is a free spot
// a short walk from where they stand, anywhere outdoors (Market St, West St, the park), never clamped to a lane or a home's circle.
// Run: node tests/wander.cjs   (slow in a cloud container: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(3000);
  const r=await pg.evaluate(()=>{ const R=ROAMDBG(), L=R.L, T=1.13, out={}, pick=(x,z,home)=>{ const st={x,z,R:.3,home}; return R.pick(st,STFREE)?(st.next||st.to):null; };
    const P=__dbg.MAPK.PARK, px=((P.x0+P.x1)/2-72)*T, pz=((P.y0+P.y1)/2+77)*T; let inPark=0, fromPark=0, far=0, n=0;
    for(let i=0;i<60;i++){ const t=pick(px,pz,null); if(t){ fromPark++; const d=Math.hypot(t.x-px,t.z-pz)/T; if(d>=1.99&&d<=9.01)inPark++; } }
    const home={x:0,z:0,r:1*T}; for(let i=0;i<60;i++){ const t=pick(0,0,home); if(t){ n++; if(Math.hypot(t.x,t.z)>home.r+.01)far++; } }
    const still=pick(0,0,{x:0,z:0,r:0});
    return {fromPark,inPark,n,far,still}; });
  ok(r.fromPark>40&&r.inPark===r.fromPark,'from the middle of the park each next stop is a short walk (2 to 9 tiles) from where they stand ('+r.inPark+'/'+r.fromPark+')');
  ok(r.n>40&&r.far>r.n/2,'a home\'s circle doesn\'t hold them: most stops are outside it ('+r.far+'/'+r.n+')');
  ok(r.still===null,'someone whose home has no circle (a vendor) stays put');
  const a=await pg.evaluate(()=>__dbg.NPCS.filter(N=>N.st&&N.lv==='up'&&!N.far&&N.st.home&&N.st.home.r>0).map(N=>[N.key,N.st.x,N.st.z]));
  await pg.waitForTimeout(20000);
  const m=await pg.evaluate(a=>a.map(([k,x,z])=>{ const N=__dbg.NPCS.find(n=>n.key===k); return Math.hypot(N.st.x-x,N.st.z-z); }),a);
  ok(a.length&&m.filter(d=>d>.3).length>=Math.ceil(a.length/3),'the townspeople near you walk about ('+m.filter(d=>d>.3).length+'/'+a.length+' moved)');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all wander checks passed'); await b.close(); process.exit(bad?1:0); })();
