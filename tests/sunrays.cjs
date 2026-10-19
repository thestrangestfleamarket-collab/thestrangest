// THE SUN THROUGH THE CLOUDS (weather.js's big clouds, sunrays.js): facing the sun and with it behind, in the park, from his eyes and behind him. node tests/sunrays.cjs <out> [hour] [weather]
const {chromium}=require('playwright'), out=process.argv[2]||'.', H=process.argv[3]||'16.5', WXQ=process.argv[4]||'natural';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:620}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message)); pg.on('console',m=>{ if(m.type()==='error'&&/Shader|ERROR/.test(m.text()))console.log('ERR',m.text().slice(0,400)); });
  const load=async q=>{ await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&wx='+WXQ+'&hour='+H+q,{waitUntil:'commit',timeout:180000}); for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(5000); };
  const face=async(p,away)=>pg.evaluate(async([p,away])=>{ const s=__dbg.CLOCK.sunV, f=new __dbg.THREE.Vector3(); let best=0,bd=-9; for(let k=0;k<16;k++){ const y=k*Math.PI/8; __dbg.cam(y,p); await new Promise(r=>setTimeout(r,250)); __dbg.camO().getWorldDirection(f); const d=(f.x*s.x+f.z*s.z)*(away?-1:1); if(d>bd){ bd=d; best=y; } } __dbg.cam(best,p); return [best,bd,__dbg.CLOCK.elev()]; },[p,away]);
  const AT=process.argv[5]||await (async()=>{ await load(''); return pg.evaluate(()=>{ const {BOD,PARK}=__dbg.MAPK; return [BOD.XS(PARK.round[0]+PARK.ox),BOD.ZS(PARK.round[1]+PARK.oy-4)]; }); })();
  for(const [name,view,p,away] of [['sun-first','first',0.12,false],['sun-behind','follow',0.2,false],['away-behind','follow',0.35,true],['iso','iso',null,false]]){
    await load(`&at=${AT}&view=${view}`); const f=p!=null?await face(p,away):null; await pg.waitForTimeout(6000);
    await pg.screenshot({path:`${out}/${name}.png`}); console.log(name,JSON.stringify(f),await pg.evaluate(()=>[RAYS.pass.uniforms.uK.value,RAYS.s.w,document.getElementById('stat')&&document.getElementById('stat').textContent])); }
  await b.close(); })();
