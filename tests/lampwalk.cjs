// THE LIGHT ON HIM IN STEPS (looks.js's LSTEP): node tests/lampwalk.cjs <out> [query]: at night, walked along under the nearest street light in
// small steps; how many of the steps changed the light's way on him (W3.Lw) and by how much, and a picture under the lamp (<out>.png)
const {chromium}=require('playwright');
(async()=>{ const [out,q='']=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:700,height:500}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=21&at=0,6&'+q,{timeout:180000}); await pg.waitForTimeout(30000);
  const P=await pg.evaluate(()=>{ const p=STORE.pos, L=DRESS.pools.map(P=>[P[1],P[2]]).sort((a,b)=>Math.hypot(a[0]-p.x,a[1]-p.z)-Math.hypot(b[0]-p.x,b[1]-p.z))[0]; return L; });
  let ch=0, n=0, mx=0; await pg.evaluate(([x,z])=>{ STORE.pos.set(x-3,0,z+.6); },P); await pg.waitForTimeout(3000);
  let prev=await pg.evaluate(()=>W3.Lw.toArray());
  for(let i=0;i<60;i++){ await pg.evaluate(()=>{ STORE.pos.x+=.1; }); await pg.waitForTimeout(250); const v=await pg.evaluate(()=>W3.Lw.toArray());
    const d=Math.acos(Math.min(1,v[0]*prev[0]+v[1]*prev[1]+v[2]*prev[2]))*180/Math.PI; n++; if(d>.01){ ch++; mx=Math.max(mx,d); } prev=v; if(i===30)await pg.screenshot({path:out+'.png'}); }
  console.log(JSON.stringify({lamp:P.map(v=>+v.toFixed(1)),steps:n,changed:ch,biggest:+mx.toFixed(1)}),'errors',Object.keys(errs)); await b.close(); })();
