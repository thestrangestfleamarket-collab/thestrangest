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
  // an inside the street has no more (the bar shut, 6 Nov 2026) is skipped, not waited on
  const has=id=>pg.evaluate(async id=>{ if(STORE.ensure)await STORE.ensure(); return !!(STORE.inside&&STORE.inside[id]); },id), skip=n=>console.log('SKIP '+n+': it has no inside now');
  /* ---------- THE BAR ---------- */
  if(!await has('bar'))skip('bar'); else { await pg.evaluate(()=>STORE.enter('bar',true)); await U(()=>STORE.inside.bar&&STORE.inside.bar.done&&ROOMS.cur&&ROOMS.cur.id==='bar'&&!(window.FADE&&FADE.busy)); await U(()=>WORKERSDBG().some(w=>w.k==='w_badger'&&w.made),60000).catch(()=>{});
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
  // since 7 Nov 2026 the token changer, prize counter and soda machine are archived: the games are free
  { await pg.evaluate(()=>ROOMS.enter('arcade')); await U(()=>ROOMS.offIn&&ROOMS.offIn()==='arcade'&&!(window.FADE&&FADE.busy)&&__dbg.UI.things.some(t=>t.name.startsWith('SKEE-BALL')),180000); await U(()=>WORKERSDBG().some(w=>w.k==='w_tokenbot'&&w.made),60000).catch(()=>{});
    rec('arcade: TOKEN is archived (11 Nov 2026), never made',await pg.evaluate(()=>!WORKERSDBG().some(w=>w.k==='w_tokenbot'&&w.made)&&!(window.BODIES&&BODIES.by&&BODIES.by.w_tokenbot)));
    const a=await pg.evaluate(async()=>{ const th=n=>__dbg.UI.things.find(t=>t.name.startsWith(n)), play=n=>{ th(n).act(); const ok=!!MINI.on&&MINI.on.title===n; MINI.close(); return ok; };
      const W=ms=>new Promise(r=>setTimeout(r,ms)), view=__dbg.UI.view; th('AIR HOCKEY').act(); const sat=AIRH.on&&__dbg.UI.holdCam==='hockey'; AIRH.start('easy'); AIRH.aim(0,.3); let d=AIRH.dbg(); for(let i=0;i<80&&!(d.puck[1]<.3);i++){ await W(250); d=AIRH.dbg(); } const hit=d.mode==='play'&&d.puck[1]<.3;   // (waits for the mallet to reach the puck, up to 20 s: a slow machine's frames)
      const S=AIRH.sim, s=S.create(), ev=[]; let goals=0, out=0; S.faceoff(s,1); for(let i=0;i<240*120;i++){ S.think(s,s.m[0],S.LEVELS.hard,1/240); S.think(s,s.m[1],S.LEVELS.easy,1/240); S.step(s,1/240,ev); if(Math.abs(s.puck.x)>S.W||Math.abs(s.puck.z)>S.L+.1)out++; if(!s.live){ goals++; S.faceoff(s,1); } }
      AIRH.close(); const hockey=sat&&hit&&goals>0&&!out&&!AIRH.on&&!__dbg.UI.holdCam&&__dbg.UI.view===view;
      return {skee:play('SKEE-BALL'),claw:play('THE CLAW'),hockey,hk:{sat,hit,goals,out,d},cabs:__dbg.UI.things.filter(t=>t.name.startsWith('PLAY ')).length}; });
    rec('arcade: skee-ball, the claw and air hockey play; the cabinets stand',a.skee&&a.claw&&a.hockey&&a.cabs>=6,JSON.stringify(a));
    if(OUT){ await pg.screenshot({path:OUT+'/arcade.png'}); }
    await pg.evaluate(()=>ROOMS.exit('arcade')); await pg.waitForTimeout(3000); }
  /* ---------- THE BODEGA ---------- */
  // its groceries, deli, urn and staff are archived (5 and 7 Nov 2026): you go in and come out
  { await pg.evaluate(()=>ROOMS.enter('bodega')); const inB=await U(()=>ROOMS.offIn&&ROOMS.offIn()==='bodega'&&!(window.FADE&&FADE.busy),180000).then(()=>true).catch(()=>false);
    await pg.evaluate(()=>ROOMS.exit('bodega')); const out=await U(()=>!(ROOMS.offIn&&ROOMS.offIn())&&!(window.FADE&&FADE.busy),60000).then(()=>true).catch(()=>false);
    rec('bodega: you go in and come back out',inB&&out); }
  /* ---------- THE MOVIE THEATRE ---------- */
  // THE STARLITE (11 Nov 2026): no way in without a ticket, a ticket lets you in; no snack bar; the fox at the box office, every seat on the list and every row to sit in; the floor steps up to the back; its own reel on the screen when no film is; dropped when you leave
  if(!await has('theatre'))skip('theatre'); else { const no=await pg.evaluate(()=>{ INV.items.ticket=0; return STORE.gate.theatre?STORE.gate.theatre():true; }); rec('theatre: no ticket, no way in',no===false);
    await pg.evaluate(()=>{ INV.add('ticket',1); STORE.enter('theatre',true); }); const inT=await U(()=>STORE.inside.theatre&&STORE.inside.theatre.done&&!(window.FADE&&FADE.busy),180000).then(()=>true).catch(()=>false);
    rec('theatre: a ticket lets you in',inT);
    const fp=await pg.evaluate(()=>{ const R=STORE.rooms.find(r=>r.id==='theatre'), seats=__dbg.UI.things.filter(t=>t.name==='A ROW OF SEATS'); return {listed:(R.seats||[]).length,sit:seats.length,snack:!!(R.spots||{}).CONCESSIONS||WORKERSDBG().some(w=>w.k==='w_raccoon'&&w.made),fox:!!(CINEMA.dbg&&CINEMA.dbg().fox),box:!!(CINEMA.boxG&&CINEMA.boxG()),rise:Math.max(...R.seats.map(p=>SHARED.groundY(p.x,p.z)))-Math.min(...R.seats.map(p=>SHARED.groundY(p.x,p.z))),free:R.seats.every(p=>p.x>R.x0&&p.x<R.x1&&p.z>R.z0&&p.z<R.z1),reel:!!STORE.main.theatre.reel,live:!!THEATRE.live()}; });
    rec('theatre: the seats are listed for moviegoers and can be sat in, no snack bar, the fox stands in the box office '+JSON.stringify(fp),fp.listed===180&&fp.sit===60&&!fp.snack&&fp.box&&fp.rise>1.5&&fp.free&&fp.reel&&fp.live);
    if(OUT)await pg.screenshot({path:OUT+'/theatre.png'}).catch(()=>{});
    await pg.evaluate(()=>STORE.exit('theatre')); await pg.waitForTimeout(6000);
    const gone=await pg.evaluate(()=>({live:!!THEATRE.live(),reel:!!STORE.main.theatre.reel,grounds:ROOMS.grounds.length,seats:__dbg.UI.things.filter(t=>t.name==='A ROW OF SEATS').length})); rec('theatre: dropped once you are out '+JSON.stringify(gone),!gone.live&&!gone.reel&&!gone.grounds&&!gone.seats); }
  /* ---------- THE ART MUSEUM ---------- */
  { await pg.evaluate(async()=>{ if(STORE.ensure)await STORE.ensure(); STORE.enter('art',true); }); await U(()=>STORE.inside.art&&STORE.inside.art.done&&!(window.FADE&&FADE.busy)&&__dbg.UI.things.some(t=>t.name==='THE FLOOR PLAN')&&STORE.art&&STORE.art.built,240000);
    const p=await people('art'); rec('art museum: nobody works there; visitor places inside it, standing places clear',p.spots===0&&p.seats>=12&&p.seatsIn&&!p.standFree,JSON.stringify(p));
    const a=await pg.evaluate(()=>{ const th=n=>__dbg.UI.things.find(t=>t.name.startsWith(n));
      th('THE FLOOR PLAN').act(); const plan=MINI.on&&MINI.on.title==='THE FLOOR PLAN'; MINI.close();
      const casts=__dbg.UI.things.filter(t=>/\(A (CAST|COPY)\)/.test(t.name)).length;
      const R=STORE.rooms.find(r=>r.id==='art'), bx=R.box||R, inArt=t=>{ const o=t.obj; if(!o||!o.updateWorldMatrix)return true; o.updateWorldMatrix(true,false); const e=o.matrixWorld.elements; return e[12]>bx.x0&&e[12]<bx.x1&&e[14]>bx.z0&&e[14]<bx.z1; };   // (the bookstore café elsewhere is not the museum's)
      const shopL=__dbg.UI.things.filter(t=>/ESPRESSO|PASTRY|POSTCARD|PRINTS|CAFÉ|GUIDED TOUR|INFORMATION DESK/.test(t.name)&&inArt(t)).map(t=>t.name), shops=shopL.length;
      return {plan,casts,shops,shopL,rosie:ARCH.has('w_redpanda')}; });
    rec('art museum: the floor plan by the door; no casts, café, gift shop, desk or tour',a.plan&&a.casts===0&&a.shops===0&&a.rosie,JSON.stringify(a));
    if(OUT)await pg.screenshot({path:OUT+'/art.png'}).catch(()=>{});
    await pg.evaluate(()=>STORE.exit('art')); await pg.waitForTimeout(4000); }
  rec('no page errors',!errs.length,errs.slice(0,3).join(' | '));
  await b.close(); process.exit(bad?1:0); })();
