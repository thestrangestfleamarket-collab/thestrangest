// THE FLEA MARKET: node tests/flea.cjs [out]: every placed polyfork thing is in, each vendor stands at its stall and sells, no page error; <out>-1.png the lot, <out>-2.png the street furniture
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]; const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); let bad=0;
  const pg=await b.newPage({viewport:{width:1100,height:760}}); pg.on('pageerror',e=>{ bad++; console.log('ERR',e.message); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=14',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:240000});
  await pg.waitForFunction(()=>window.FLEA&&FLEA.made.length&&CREW.ready,null,{timeout:120000}); await pg.evaluate(()=>CREW.bring()); await pg.waitForTimeout(4000);
  const r=await pg.evaluate(()=>{ const V=['hotdogman','fruitseller','trader','junkman','flowerlady'], S=SHOPDBG();
    return {made:FLEA.made.length,want:FLEA.want,vendors:V.map(k=>{ const B=BODIES.by[k], st=B&&B.npc&&B.npc.st, t=FLEA.made.find(m=>m.o.who===k); return {k,on:!!(B&&B.npc.on),shop:S.bound.includes(k),d:st&&t?+Math.hypot(st.x-t.x,st.z-t.z).toFixed(2):null}; })}; });
  console.log(JSON.stringify(r));
  if(r.made!==r.want){ bad++; console.log('FAIL placed',r.made,'of',r.want); }
  for(const v of r.vendors)if(!v.on||!v.shop||v.d==null||v.d>4){ bad++; console.log('FAIL vendor',JSON.stringify(v)); }
  if(out){ const go=async(k,dz,n)=>{ const [x,z]=await pg.evaluate(([k,dz])=>{ const t=FLEA.made.find(m=>m.k===k); return [t.x,t.z+dz*1.13]; },[k,dz]);
      await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=14&at='+x.toFixed(2)+','+z.toFixed(2),{timeout:240000}); await pg.waitForFunction(()=>window.FLEA&&FLEA.made.length,null,{timeout:240000}); await pg.waitForTimeout(5000); await pg.screenshot({path:out+'-'+n+'.png'}); };
    await go('ftable',6,1); await go('shelter',4,2); }
  console.log(bad?'FAIL':'OK'); await b.close(); process.exit(bad?1:0); })();
