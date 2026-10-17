// THE STOREROOM (store.js): each stored room from its door, by night (lit by its own lamps) and inside; the page's errors and the store's warnings
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}}); pg.setDefaultTimeout(180000);
  const errs={}, warns=[]; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message.slice(0,300),(e.stack||'').split('\n').slice(1,4).join(' / ').slice(0,500)); }); pg.on('console',m=>{ const t=m.text(); if(/store:|no /.test(t)&&warns.length<30)warns.push(t.slice(0,120)); });
  const out=process.argv[2]||'store', hour=process.argv[3]||'22', places=(process.argv[4]||'THE DINER,THE BAR,THE MOON SHRINE,THE HERB COTTAGE,THE OCTOPUS TANK,THE KEEP,THE BUTTERFLIES').split(',');
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour='+hour+'&npcwait=60',{timeout:240000}); await pg.waitForTimeout(25000);
  console.log('rooms',await pg.evaluate(()=>JSON.stringify(STORE.rooms.map(r=>[r.id,+r.at.x.toFixed(1),+r.at.z.toFixed(1)]))),'batch',await pg.evaluate(()=>JSON.stringify(STORE.stats)));
  for(const P of places){ const tag=P.toLowerCase().replace(/[^a-z]+/g,'-'); await pg.evaluate(P=>{ const p=STORE.places.find(q=>q[0]===P); STORE.goTo(p[1],p[2],'up'); },P); await pg.waitForTimeout(2500);
    for(let k=0;k<2;k++){ await pg.mouse.move(500,350); await pg.mouse.wheel(0,250); await pg.waitForTimeout(150); } await pg.waitForTimeout(1200); await pg.screenshot({path:out+'_'+tag+'.png'});
    await pg.evaluate(()=>{ const r=STORE.rooms.find(r=>r.inside!==undefined&&Math.hypot(r.at.x-STORE.pos.x,r.at.z-STORE.pos.z)<1); if(r){ STORE.pos.set((r.x0+r.x1)/2,0,(r.z0+r.z1)/2); } }); await pg.waitForTimeout(1500); await pg.screenshot({path:out+'_'+tag+'_in.png'});
    console.log(P,await pg.evaluate(()=>JSON.stringify({pos:[+STORE.pos.x.toFixed(1),+STORE.pos.z.toFixed(1)],room:STORE.cur,inStore:STORE.inStore(STORE.pos.x,STORE.pos.z)}))); }
  console.log('warnings',JSON.stringify(warns)); console.log('errors',JSON.stringify(errs)); await b.close(); })();
