// A ROOM'S NEAR SIDE AS YOU WALK (owner, 18 Oct 2026: "why is still vanshing liek this when i walk around?"): node tests/roomwalk.cjs <out> [room]
// takes you to a room of the menu's (THE SHOP) and moves you through it, a shot at each of three spots (<out>-0/1/2.png): what stands in the
// room should look the same in all three, only the near walls' band cut
const {chromium}=require('playwright');
(async()=>{ const [out,room='THE BODEGA']=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:900,height:700}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; }); pg.on('console',m=>{ const t=m.text(); if(/ROOMS:|ERROR|shader/i.test(t))errs[t.slice(0,160)]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour='+(process.env.HOUR||21),{timeout:180000}); await pg.waitForTimeout(24000);
  await pg.evaluate(r=>{ const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===r); if(b)b.click(); },room); await pg.waitForTimeout(3000);
  if(await pg.evaluate(()=>{ const m=document.getElementById('menu'); return m&&!m.hidden&&getComputedStyle(m).display!=='none'; }))await pg.keyboard.press('Escape');
  await pg.waitForTimeout(3000); const p0=await pg.evaluate(()=>[STORE.pos.x,STORE.pos.z]);
  for(let i=0;i<3;i++){ await pg.evaluate(([x,z,i])=>{ STORE.pos.set(x+(i-1)*.9,STORE.pos.y,z+(i-1)*.5); },[p0[0],p0[1],i]); await pg.waitForTimeout(2500);
    console.log(i,await pg.evaluate(()=>ROOMS.cur&&ROOMS.cur.id)); await pg.screenshot({path:out+'-'+i+'.png'}); }
  console.log('errors',Object.keys(errs)); await b.close(); })();
