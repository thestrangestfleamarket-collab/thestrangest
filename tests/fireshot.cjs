// FIRE (fire.js): live flames close up at night, from two angles, two moments apart each (the dojo's candle, the dungeon's torch and brazier,
// the park's campfire, a store candle); the flames' count and the page's errors. node tests/fireshot.cjs [out prefix] [which,...]
// Each is looked at from where you'd stand, in first person, the view turned onto the flame (the camera read back: __dbg.camO)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); });
  const out=process.argv[2]||'fire', only=(process.argv[3]||'dojo,torch,camp').split(','), Q='&hour=21&hideme=1&npcwait=99&view=first';
  // where you stand (x, z, height), which flame, and the second angle's step aside (tiles)
  const S={dojo:['?at=77.2,-11.0'+Q,/dojo candle/,[1.2,.3]],torch:['?at=-13.6,67.3,-3.77'+Q,/wall torch/,[2.8,.6]],brazier:['?at=-11.0,74.0,-3.77'+Q,/brazier/,[0,-1.6]],
    camp:['?at=40.68,28.4'+Q,/campfire/,[1.8,.4]],bar:['?place=the%20bar'+Q,/round table|candle/,[.8,.3]]};
  const aim=re0=>pg.evaluate(async re=>{ const r=new RegExp(re), c=__dbg.camO(), p=c.position, L=FLAME.src.filter(s=>s.k>=0&&r.test(s.name||'')); L.sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z)); const s=L[0]; if(!s)return null;
    const tx=s.x, ty=s.y+s.h*.45, tz=s.z, wait=()=>new Promise(r=>setTimeout(r,600)), V=new c.position.constructor();
    for(let i=0;i<6;i++){ c.getWorldDirection(V); const want=Math.atan2(tx-p.x,tz-p.z), have=Math.atan2(V.x,V.z), d=Math.hypot(tx-p.x,tz-p.z), wp=Math.atan2(ty-p.y,d), hp=Math.asin(V.y), cv=__dbg.cv();
      let dy=((want-have+Math.PI*3)%(Math.PI*2))-Math.PI; __dbg.cam(cv.yaw+dy*(window.__ys||1),cv.pitch+(wp-hp)*(window.__ps||1)); await wait(); c.getWorldDirection(V);
      if(i===0){ const h2=Math.atan2(V.x,V.z); if(Math.abs((((want-h2+Math.PI*3)%(Math.PI*2))-Math.PI))>Math.abs(dy))window.__ys=-1; if(Math.abs(Math.asin(V.y)-wp)>Math.abs(hp-wp))window.__ps=-1; } }
    return {name:s.name,at:[s.x,s.y,s.z].map(v=>+v.toFixed(2)),cam:[p.x,p.y,p.z].map(v=>+v.toFixed(2))}; },re0.source);
  for(const name of only){ const [q,re,side]=S[name];
    for(const [a,dx] of [['a',0],['b',1]]){ let qq=q; if(dx){ const m=q.match(/at=([-\d.]+),([-\d.]+)/); if(m)qq=q.replace(m[0],`at=${(+m[1]+side[0]*1.243).toFixed(2)},${(+m[2]+side[1]*1.243).toFixed(2)}`); }
      await pg.goto('file://'+process.cwd()+'/dist/market.html'+qq,{waitUntil:'commit',timeout:180000});
      for(let i=0;i<120&&!(await pg.evaluate(()=>!!window.__started));i++)await pg.waitForTimeout(500); await pg.waitForTimeout(8000);
      console.log(name,a,JSON.stringify(await aim(re))); await pg.waitForTimeout(2500);
      await pg.screenshot({path:`${out}-${name}-${a}1.png`}); await pg.waitForTimeout(350); await pg.screenshot({path:`${out}-${name}-${a}2.png`}); }
    console.log(name,'cards',await pg.evaluate(()=>FLAME.n),await pg.textContent('#stat').catch(()=>'')); }
  console.log('errors',JSON.stringify(errs)); await b.close(); })();
