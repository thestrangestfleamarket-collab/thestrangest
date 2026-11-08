// THE BRICK PHONE: node tests/phone.cjs dist/market.html. Every player has one; using it opens its screen of what the bodega sells; an order is paid (price and delivery) and the drone brings it to you outdoors, a parcel at your feet you take in.
const {chromium}=require('playwright'), path=require('path');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:600}}), errs=[]; let bad=0;
  const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; }; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+path.resolve(process.argv[2]||'dist/market.html')+'?hour=12&fresh=1&at=60,-60',{waitUntil:'commit',timeout:180000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000}); await pg.waitForTimeout(5000);
  const A=await pg.evaluate(async()=>{ await LOAD('later'); return {have:INV.items.brickphone||0,name:FORAGE.name('brickphone')}; });
  ok(A.have===1&&A.name==='BRICK PHONE','every player has a BRICK PHONE '+JSON.stringify(A));
  const B=await pg.evaluate(async()=>{ HUD.useItem('brickphone'); await new Promise(r=>setTimeout(r,800)); return {open:!!MINI.on,title:MINI.on&&MINI.on.title}; });
  ok(B.open&&B.title==='BRICK PHONE','using it opens its screen '+JSON.stringify(B));
  const C=await pg.evaluate(async()=>{ MINI.close(); const L=(()=>{ const A=BODEGA.all(); return [...A.supplies,...A.shelves,...A.goods]; })(), r=L.find(q=>q.price>0); INV.cash=500; const c0=INV.cash, n0=INV.items[r.id]||0, e=PHONE.order(r);
    for(let i=0;i<120&&DRONE.state!=='home';i++)await new Promise(q=>setTimeout(q,500));
    const th=__dbg.UI.things.find(t=>t.name==='A PARCEL: '+r.name), p=th&&th.obj.position, P=__dbg.pos(), d=p?Math.hypot(p.x-P[0],p.z-P[2])/__dbg.cv().TILE:null; if(th)th.act();
    return {lines:L.length,e,paid:c0-INV.cash,price:r.price,parcel:!!th,d,got:(INV.items[r.id]||0)-n0}; });
  ok(C.lines>10&&!C.e&&C.paid===C.price+2,'an order is paid: its price and $2 delivery '+JSON.stringify(C));
  ok(C.parcel&&C.d<3&&C.got===1,'the drone brings it to you: a parcel at your feet, taken in '+JSON.stringify({d:C.d,got:C.got}));
  ok(!errs.length,'no page errors '+errs.slice(0,2).join(' | '));
  await b.close(); process.exit(bad?1:0); })();
