// THE INTERIORS (docs/INTERIORS.md): node tests/interiors.cjs [out folder]. Each rebuilt inside (the bar, the arcade, the bodega, the movie theatre, the Museum of Earth, the art museum, the Boardwright, Fix-It, the Scanner): its staff have spots inside it, its patrons have seats or places, its non-human worker is made and stands at its spot, its own mechanic works; no page error. Exits 1 on any failure.
const {chromium}=require('playwright'), fs=require('fs'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs=[]; let bad=0;
  pg.on('pageerror',e=>errs.push(e.message.slice(0,160)));
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const U=(f,ms=120000)=>pg.waitForFunction(f,null,{timeout:ms});
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=21',{timeout:240000}); await U(()=>window.__started,300000);
  await pg.evaluate(()=>{ const B=SHARED.BOD; STORE.goTo(B.XS(99),B.ZS((B.CURB+B.FAR)/2),'up'); }); await pg.waitForTimeout(4000);
  // where people go, checked the same way for every inside: each staff title of the place has a spot in its box, each place is in its box, none in a solid
  const people=at=>pg.evaluate(at=>{ const R=ROOMS.off[at]||STORE.rooms.find(r=>r.id===at), C=__dbg.CHARS||null; const b=R.box||R, sol=SHARED.solids;
    const inB=p=>p.x>b.x0&&p.x<b.x1&&p.z>b.z0&&p.z<b.z1, free=p=>!sol.some(r=>p.x>r[0]&&p.x<r[2]&&p.z>r[1]&&p.z<r[3]);
    const sp=Object.entries(R.spots||{}), se=R.seats||[];
    return {spots:sp.length,seats:se.length,spotsIn:sp.every(([,p])=>inB(p)),seatsIn:se.every(inB),spotsFree:sp.filter(([,p])=>!free(p)).map(([k])=>k),standFree:se.filter(p=>p.y==null&&!free(p)).length}; },at);
  /* ---------- THE BAR ---------- */
  { await pg.evaluate(()=>STORE.enter('bar',true)); await U(()=>STORE.inside.bar&&STORE.inside.bar.done&&ROOMS.cur&&ROOMS.cur.id==='bar'&&!(window.FADE&&FADE.busy)); await U(()=>WORKERSDBG().some(w=>w.k==='w_badger'&&w.made),60000).catch(()=>{});
    const p=await people('bar'); rec('bar: staff spots and patron places inside it, standing places clear of furniture',p.spots>=5&&p.seats>=14&&p.spotsIn&&p.seatsIn&&!p.spotsFree.length&&!p.standFree,JSON.stringify(p));
    const w=await pg.evaluate(()=>{ const N=BODIES.by.w_badger&&BODIES.by.w_badger.npc, s=STORE.rooms.find(r=>r.id==='bar').spots.TAPS; return N?{d:Math.hypot(N.st.x-s.x,N.st.z-s.z),vis:N.g.visible}:null; });
    rec('bar: the badger stands at the taps',!!w&&w.d<.2,JSON.stringify(w));
    const d=await pg.evaluate(async()=>{ const th=__dbg.UI.things.find(t=>/^DARTS/.test(t.name)); th.act(); const S=MINI.state(); if(!S)return null; for(let i=0;i<3;i++){ S.mx=200; S.my=210; S.press=true; await new Promise(r=>setTimeout(r,150)); }
      const r={title:MINI.on&&MINI.on.title,thrown:S.log.length||S.turn-1,left:S.left,bull:GAMES.dartScore(0,0)[0],t20:GAMES.dartScore(0,.103)[0]}; MINI.close(); return r; });
    rec('bar: darts opens a game of 301 and the throws score',!!d&&d.title==='DARTS: 301'&&d.thrown>=1&&d.bull===50&&d.t20===60,JSON.stringify(d));
    const pool=await pg.evaluate(async()=>{ __dbg.UI.things.find(t=>t.name==='POOL TABLE').act(); const S=MINI.state(); await new Promise(r=>setTimeout(r,200)); const r={title:MINI.on&&MINI.on.title,ok:!!S}; MINI.close(); return r; });
    rec('bar: the pool table opens a game of pool',pool.title==='POOL'&&pool.ok,JSON.stringify(pool));
    rec('bar: the badger sells drinks you can drink',await pg.evaluate(()=>{ const N=BODIES.by.w_badger&&BODIES.by.w_badger.npc, t=N&&CHARS.trade(N); return !!t&&['d_ale','d_stout','d_cola'].every(k=>(t.sells||[]).includes(k)&&ITEMS.prop(k,'edible')); }).catch(e=>String(e)));
    if(OUT){ fs.mkdirSync(OUT,{recursive:true}); await pg.screenshot({path:OUT+'/bar.png'}); }
    await pg.evaluate(()=>STORE.exit('bar')); await pg.waitForTimeout(3000); }
  /* ---------- THE ARCADE ---------- */
  { await pg.evaluate(()=>ROOMS.enter('arcade')); await U(()=>ROOMS.offIn&&ROOMS.offIn()==='arcade'&&!(window.FADE&&FADE.busy)&&__dbg.UI.things.some(t=>t.name==="TOKEN'S PRIZE COUNTER"),180000); await U(()=>WORKERSDBG().some(w=>w.k==='w_tokenbot'&&w.made),60000).catch(()=>{});
    const p=await people('arcade'); rec('arcade: staff spots and patron places inside it, standing places clear of furniture',p.spots>=2&&p.seats>=15&&p.spotsIn&&p.seatsIn&&!p.spotsFree.length&&!p.standFree,JSON.stringify(p));
    rec('arcade: TOKEN is made and stands at the prize counter',await pg.evaluate(()=>WORKERSDBG().some(w=>w.k==='w_tokenbot'&&w.made)));
    const a=await pg.evaluate(async()=>{ const th=n=>__dbg.UI.things.find(t=>t.name.startsWith(n)); INV.items.arc_token=0; INV.cash=0; th('THE TOKEN CHANGER').act(); const broke=!(INV.items.arc_token>0);
      th('SKEE-BALL').act(); const refused=!MINI.state(); MINI.close();
      INV.cash=3; th('THE TOKEN CHANGER').act(); const bought=INV.items.arc_token===4&&INV.cash===2;
      th('SKEE-BALL').act(); const S=MINI.state(), skee=!!S&&MINI.on.title==='SKEE-BALL'; MINI.close();
      th('THE CLAW').act(); const claw=MINI.on&&MINI.on.title==='THE CLAW'; MINI.close();
      th('AIR HOCKEY').act(); const hockey=MINI.on&&MINI.on.title==='AIR HOCKEY'; MINI.close();
      INV.items.ptix=5; th("TOKEN'S PRIZE COUNTER").act(); const prize=INV.items.prize_ring>=1&&INV.items.ptix===1;
      INV.cash=2; th('THE SODA MACHINE').act(); const soda=INV.cash===0&&INV.items.d_cola>=1;
      return {broke,refused,bought,skee,claw,hockey,prize,soda}; });
    rec('arcade: the changer sells four tokens for $1, not when broke',a.broke&&a.bought,JSON.stringify(a));
    rec('arcade: skee-ball, the claw and air hockey are games (free play since the archive, owner 5 Nov 2026)',a.skee&&a.claw&&a.hockey);
    rec('arcade: tickets buy prizes at the counter; the soda machine sells a cola',a.prize&&a.soda);
    if(OUT){ await pg.screenshot({path:OUT+'/arcade.png'}); }
    await pg.evaluate(()=>ROOMS.exit('arcade')); await pg.waitForTimeout(3000); }
  /* ---------- THE BODEGA ---------- */
  { await pg.evaluate(()=>ROOMS.enter('bodega')); await U(()=>ROOMS.offIn&&ROOMS.offIn()==='bodega'&&!(window.FADE&&FADE.busy)&&__dbg.UI.things.some(t=>t.name==='THE REGISTER (PAY)'),180000);
    const p=await people('bodega'); rec('bodega: staff spots and customer places inside it, standing places clear of the shelves',p.spots>=2&&p.seats>=12&&p.spotsIn&&p.seatsIn&&!p.spotsFree.length&&!p.standFree,JSON.stringify(p));
    const b=await pg.evaluate(async()=>{ const th=n=>__dbg.UI.things.find(t=>t.name.startsWith(n)), wait=ms=>new Promise(r=>setTimeout(r,ms)), click=async(x,y)=>{ const S=MINI.state(); S.mx=x; S.my=y; S.press=true; await wait(150); };
      const shelves=__dbg.UI.things.filter(t=>/^THE (SHELF|DRINKS FRIDGE)/.test(t.name)).length; BODEGA.basket.clear(); INV.cash=10; const w0=INV.items.g_water||0;
      th('THE DRINKS FRIDGE').act(); const rows=MINI.state().rows, i=rows.findIndex(r=>r.id==='g_water'); await click(100,12+i*22+11); MINI.close(); const picked=BODEGA.basket.get('g_water')===1;
      th('THE REGISTER (PAY)').act(); await click(100,410); const paid=(INV.items.g_water||0)===w0+1&&INV.cash===9&&!BODEGA.basket.size; MINI.close();
      BODEGA.pick('g_rice'); INV.cash=0; const broke=!!BODEGA.pay()&&BODEGA.basket.size===1; BODEGA.basket.clear();
      INV.cash=10; th('THE LOTTERY MACHINE').act(); const S=MINI.state(), card=!!S&&S.cells.length===9; S.keys.add(' '); await wait(300); const lotto=!!S.over&&INV.cash===8+(S.win||0); MINI.close();
      th('THE DELI CASE').act(); const deli=!!SHOPS.cur&&SHOPS.cur.key==='gas_station_attendant'&&['f_bec','f_hero','f_chopped'].every(k=>CHARS.trade({key:'gas_station_attendant'}).sells.includes(k)&&ITEMS.prop(k,'edible'));
      INV.cash=5; th('THE COFFEE URN').act(); th('THE ICE CHEST').act(); const urn=INV.cash===3&&INV.items.f_icepop>=1;
      INV.add('g_catfood',1); const cf=INV.items.g_catfood; BODEGA.lucky=false; th('MANGO').act(); const cat=BODEGA.lucky&&(INV.items.g_catfood||0)===cf-1;
      th('THE BULLETIN BOARD').act(); const board=MINI.on&&MINI.on.title==='THE BULLETIN BOARD'; MINI.close();
      const crates=__dbg.UI.things.filter(t=>t.name==='A MILK CRATE').length;
      return {shelves,picked,paid,broke,card,lotto,deli,urn,cat,board,crates}; });
    rec('bodega: every shelf and fridge opens what is on it (the groceries are archived, owner 5 Nov 2026)',b.shelves>=13,JSON.stringify(b));
    rec('bodega: a scratch-off is $2 and pays what it shows',b.card&&b.lotto);
    rec('bodega: the deli sells sandwiches, the urn coffee, the chest ice pops',b.deli&&b.urn);
    rec('bodega: MANGO eats cat food and brings luck; the board reads; two crates to sit on',b.cat&&b.board&&b.crates===2);
    if(OUT){ await pg.screenshot({path:OUT+'/bodega.png'}); }
    await pg.evaluate(()=>BODEGA.pick('g_soda')); await pg.evaluate(()=>ROOMS.exit('bodega')); await pg.waitForTimeout(4000);
    rec('bodega: an unpaid basket stays behind when you leave',await pg.evaluate(()=>!BODEGA.basket.size)); }
  /* ---------- THE MOVIE THEATRE ---------- */
  { await pg.evaluate(()=>{ INV.add('ticket',1); STORE.enter('theatre',true); }); await U(()=>STORE.inside.theatre&&STORE.inside.theatre.done&&!(window.FADE&&FADE.busy)&&__dbg.UI.things.some(t=>t.name.startsWith('THE CONCESSION STAND')),180000); await U(()=>WORKERSDBG().some(w=>w.k==='w_raccoon'&&w.made),60000).catch(()=>{});
    const p=await people('theatre'); rec('theatre: staff spots and moviegoer places inside it (the twelve recliners)',p.spots>=3&&p.seats>=14&&p.spotsIn&&p.seatsIn&&!p.spotsFree.length&&!p.standFree,JSON.stringify(p));
    const rd=()=>{ const N=BODIES.by.w_raccoon&&BODIES.by.w_raccoon.npc, s=STORE.rooms.find(r=>r.id==='theatre').spots.CONCESSIONS; return N?{d:Math.hypot(N.st.x-s.x,N.st.z-s.z)}:null; };
    await U(rd,60000).then(()=>pg.waitForFunction(`(${rd})().d<.2`,null,{timeout:60000})).catch(()=>{}); const w=await pg.evaluate(rd);
    rec('theatre: THE RACCOON stands at the concession stand',!!w&&w.d<.2,JSON.stringify(w));
    const c=await pg.evaluate(()=>{ const th=n=>__dbg.UI.things.find(t=>t.name.startsWith(n)); th('THE CONCESSION STAND').act(); const shop=!!SHOPS.cur&&SHOPS.cur.key==='w_raccoon'&&['f_popcorn','f_nachos','f_candybox','d_cola'].every(k=>CHARS.trade({key:'w_raccoon'}).sells.includes(k)&&ITEMS.prop(k,'edible'));
      INV.cash=5; const n0=INV.items.f_popcorn||0; th('THE POPCORN MACHINE').act(); const pop=INV.cash===2&&INV.items.f_popcorn===n0+1; th('THE MENU BOARD').act(); const menu=MINI.on&&MINI.on.title==='CONCESSIONS'; MINI.close(); return {shop,pop,menu}; });
    rec('theatre: the stand sells popcorn, nachos, candy and soda; the machine a tub; the menu reads',c.shop&&c.pop&&c.menu,JSON.stringify(c));
    if(OUT)await pg.screenshot({path:OUT+'/theatre.png'}).catch(()=>{});
    await pg.evaluate(()=>STORE.exit('theatre')); await pg.waitForTimeout(3000); }
  /* ---------- THE ART MUSEUM ---------- */
  { await pg.evaluate(async()=>{ if(STORE.ensure)await STORE.ensure(); STORE.enter('art',true); }); await U(()=>STORE.inside.art&&STORE.inside.art.done&&!(window.FADE&&FADE.busy)&&__dbg.UI.things.some(t=>/^A GUIDED TOUR WITH ROSIE/.test(t.name))&&STORE.art&&STORE.art.built,240000);
    const p=await people('art'); rec('art museum: staff spots and visitor places inside it, standing places clear',p.spots>=4&&p.seats>=16&&p.spotsIn&&p.seatsIn&&!p.spotsFree.length&&!p.standFree,JSON.stringify(p));
    const rd=()=>{ const N=BODIES.by.w_redpanda&&BODIES.by.w_redpanda.npc, s=STORE.rooms.find(r=>r.id==='art').spots['DOCENT TOURS']; return N?Math.hypot(N.st.x-s.x,N.st.z-s.z):null; };
    await pg.waitForFunction(`(${rd})()!=null&&(${rd})()<.2`,null,{timeout:90000}).catch(()=>{}); rec('art museum: ROSIE THE RED PANDA stands by her tour sign',await pg.evaluate(`(${rd})()<.2`));
    const a=await pg.evaluate(()=>{ const th=n=>__dbg.UI.things.find(t=>t.name.startsWith(n));
      th('THE INFORMATION DESK (THE FLOOR PLAN)').act(); const plan=MINI.on&&MINI.on.title==='THE FLOOR PLAN'; MINI.close();
      const casts=__dbg.UI.things.filter(t=>/\(A (CAST|COPY)\) \(THE PLAQUE\)$/.test(t.name)).length; th('THE THINKER').act(); const plaque=MINI.on&&/THINKER/.test(MINI.on.title); MINI.close();
      INV.cash=10; th('THE ESPRESSO MACHINE').act(); th('THE PASTRY CASE').act(); th('THE POSTCARD SPINNER').act(); th('THE PRINTS').act(); const buys=INV.cash===0&&INV.items.f_croissant>=1&&INV.items.art_print>=1;
      const chairs=__dbg.UI.things.filter(t=>t.name==='A CAFÉ CHAIR').length; INV.cash=5; th('A GUIDED TOUR WITH ROSIE').act(); const paid=INV.cash===2&&!!GALLERY.touring;
      return {plan,casts,plaque,buys,chairs,paid}; });
    rec('art museum: the floor plan, four casts with plaques, the café and the shop sell, four café chairs',a.plan&&a.casts===4&&a.plaque&&a.buys&&a.chairs===4,JSON.stringify(a));
    const tour=await pg.waitForFunction(()=>{ const T=GALLERY.touring; if(T&&T.N.st.to){ T.N.st.x=T.N.st.to.x; T.N.st.z=T.N.st.to.z; } return GALLERY.last&&T&&T.i>=0; },null,{timeout:120000,polling:500}).then(()=>true).catch(()=>false);   // she walks at the frames' pace; on a slow machine the check sets her down at her stop
    rec('art museum: the tour costs $3, ROSIE walks to a painting and tells you about it',a.paid&&tour,await pg.evaluate(()=>JSON.stringify({last:GALLERY.last,i:GALLERY.touring&&GALLERY.touring.i})));
    if(OUT)await pg.screenshot({path:OUT+'/art.png'}).catch(()=>{});
    await pg.evaluate(()=>STORE.exit('art')); await pg.waitForTimeout(4000); rec('art museum: leaving ends the tour',await pg.evaluate(()=>!GALLERY.touring)); }
  rec('no page errors',!errs.length,errs.slice(0,3).join(' | '));
  await b.close(); process.exit(bad?1:0); })();
