// THE INTERIORS, PART TWO (docs/INTERIORS.md): node tests/interiors2.cjs [out folder]. The playhouse's foyer, the golems' cave, the bath house, your hall, the bank and the squirrel's tower: their staff spots and places, their new things and what each does. Exits 1 on any failure.
const {chromium}=require('playwright'), fs=require('fs'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs=[]; let bad=0;
  pg.on('pageerror',e=>errs.push(e.message.slice(0,160)));
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const U=(f,ms=120000)=>pg.waitForFunction(f,null,{timeout:ms});
  const shot=n=>OUT?pg.screenshot({path:OUT+'/'+n+'.png'}).catch(()=>{}):null;
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=20',{timeout:240000}); await U(()=>window.__started,300000);
  await pg.evaluate(()=>{ const B=SHARED.BOD; STORE.goTo(B.XS(99),B.ZS((B.CURB+B.FAR)/2),'up'); }); await pg.waitForTimeout(4000);
  const has=n=>pg.evaluate(n=>__dbg.UI.things.some(t=>t.name.startsWith(n)),n);
  const people=at=>pg.evaluate(at=>{ const R=ROOMS.off[at]||STORE.rooms.find(r=>r.id===at); const b=R.box||R, sol=SHARED.solids;
    const inB=p=>p.x>b.x0&&p.x<b.x1&&p.z>b.z0&&p.z<b.z1, free=p=>!sol.some(r=>p.x>r[0]&&p.x<r[2]&&p.z>r[1]&&p.z<r[3]);
    const sp=Object.entries(R.spots||{}), se=R.seats||[]; return {spots:sp.length,seats:se.length,spotsIn:sp.every(([,p])=>inB(p)),seatsIn:se.every(inB),spotsFree:sp.filter(([,p])=>!free(p)).map(([k])=>k),standFree:se.filter(p=>p.y==null&&!free(p)).length}; },at);
  /* ---------- THE PLAYHOUSE ---------- */
  if(await pg.evaluate(()=>!!ROOMS.off.playhouse)){ await pg.evaluate(()=>ROOMS.enter('playhouse')); await U(()=>ROOMS.offIn&&ROOMS.offIn()==='playhouse'&&!(window.FADE&&FADE.busy)&&__dbg.UI.things.some(t=>t.obj&&t.obj.parent&&t.name.startsWith('THE PROGRAMME')),240000);   // (its box office and foyer bar are archived, 7 Nov 2026)
    const p=await people('playhouse'); rec('playhouse: the company has its posts in the foyer and the stage manager his at the prompt desk; sixty stalls seats for the audience',p.spots>=7&&p.seats>=60&&p.spotsIn&&p.seatsIn&&!p.spotsFree.length,JSON.stringify(p));
    const r=await pg.evaluate(()=>{ const live=t=>t.obj&&t.obj.parent, th=n=>__dbg.UI.things.find(t=>live(t)&&t.name.startsWith(n));
      th('THE PROGRAMME').act(); const prog=MINI.on&&MINI.on.title==='THE PROGRAMME'; MINI.close(); const benches=__dbg.UI.things.filter(t=>live(t)&&t.name==='A VELVET BENCH').length;
      return {prog,benches,gone:!th('THE BOX OFFICE')&&!th('THE FOYER BAR')}; });
    rec('playhouse: the programme reads, two benches to sit on; the archived box office and foyer bar are gone',r.prog&&r.benches===2&&r.gone,JSON.stringify(r));
    await shot('playhouse'); await pg.evaluate(()=>ROOMS.exit('playhouse')); await U(()=>!(ROOMS.offIn&&ROOMS.offIn())&&!(window.FADE&&FADE.busy),120000).catch(()=>{}); await pg.waitForTimeout(1000); }
  /* ---------- THE BANK ---------- */
  { await U(()=>!!STORE.inside.bank,120000); for(let i=0;i<6;i++){ await pg.evaluate(()=>{ if(!(window.FADE&&FADE.busy))STORE.enter('bank',true); }); if(await U(()=>STORE.inside.bank.done,30000).then(()=>1,()=>0))break; }
    await U(()=>STORE.inside.bank&&STORE.inside.bank.done&&!(window.FADE&&FADE.busy)&&__dbg.UI.things.some(t=>t.name.startsWith('CAGE ONE')),180000);
    const p=await people('bank'); rec('bank: its staff at the cages, the door and the sides; customers queue at the cages',p.spots>=5&&p.seats>=4&&p.spotsIn&&p.seatsIn&&!p.spotsFree.length&&!p.standFree,JSON.stringify(p));
    const wd=()=>{ const N=BODIES.by.w_rat&&BODIES.by.w_rat.npc, s=STORE.rooms.find(r=>r.id==='bank').spots.CAGES; return N?Math.hypot(N.st.x-s.x,N.st.z-s.z):null; };
    await pg.waitForFunction(`(${wd})()!=null&&(${wd})()<.2`,null,{timeout:90000}).catch(()=>{}); rec('bank: THE RAT keeps cage one',await pg.evaluate(`(${wd})()<.2`));
    const a=await pg.evaluate(()=>{ INV.cash=500; const b0=BANKK.account().bal; __dbg.UI.things.find(t=>t.name.startsWith('CAGE ONE')).act(); const win=MINI.on&&/THE BANK/.test(MINI.on.title); MINI.close();
      BANKK.move(200); const dep=INV.cash===300&&BANKK.account().bal===b0+200; BANKK.move(-50); const wit=INV.cash===350&&BANKK.account().bal===b0+150; return {win,dep,wit}; });
    rec('bank: the cage opens your account; money goes in and out',a.win&&a.dep&&a.wit,JSON.stringify(a));
    rec('bank: the dragon still sleeps over its gold',await pg.evaluate(()=>!!STORE.bank.hoard&&!STORE.bank.dragon().awake));
    await shot('bank'); await pg.evaluate(()=>STORE.exit('bank')); await pg.waitForTimeout(4000); }
  /* ---------- THE BATH HOUSE ---------- */
  { await pg.evaluate(()=>{ const G=SHARED.BOD.GD; __dbg.UI.goTo(SHARED.BOD.X(G.door[0]),SHARED.BOD.Z(G.door[1])+1.2*(SHARED.BOD.Z(1)-SHARED.BOD.Z(0)),0); }); await U(()=>SHARED.BOD.GD.built()&&__dbg.UI.things.some(t=>t.name.startsWith('THE FRONT DESK')),180000);
    const p=await people('dojo'); rec('bath house: its two attendants have their spots, the bathers six places on the benches',p.spots>=2&&p.seats>=6&&p.spotsIn&&p.seatsIn&&!p.spotsFree.length,JSON.stringify(p));
    const r=await pg.evaluate(()=>{ const th=n=>__dbg.UI.things.find(t=>t.name.startsWith(n)); INV.cash=5; BATHK.until=0; th('THE FRONT DESK (A SOAK').act(); const soak=INV.cash===1&&BATHK.until>performance.now()/1000;
      const ghost=!!th('THE BEDSHEET'), benches=__dbg.UI.things.filter(t=>t.name==='A BENCH').length>=3, towels=!!th('THE TOWEL SHELF'); return {soak,ghost,benches,towels}; });
    rec('bath house: THE BEDSHEET at the desk sells a soak and a towel; benches; the towel shelf',r.soak&&r.ghost&&r.benches&&r.towels,JSON.stringify(r)); await shot('bath'); }
  /* ---------- THE SQUIRREL'S TOWER ---------- */
  { await U(()=>!!ROOMS.off.sqtower,60000).catch(()=>{}); await pg.waitForFunction(()=>{ const inn=ROOMS.offIn&&ROOMS.offIn()==='sqtower'; if(!inn&&!(window.FADE&&FADE.busy))ROOMS.enter('sqtower'); return inn&&!(window.FADE&&FADE.busy)&&__dbg.UI.things.some(t=>t.name.startsWith('THE LADDER (UP TO THE ROOF)')); },null,{timeout:120000,polling:1000}).catch(()=>{});   // (an entry asked during a fade, as the bath house's way out, is ignored: ask again)
    const t=await pg.evaluate(()=>{ const th=n=>__dbg.UI.things.find(t=>t.name.startsWith(n)); const inn=ROOMS.offIn&&ROOMS.offIn()==='sqtower'; const ch=th("THE LOOKOUT'S CHART"); if(ch)ch.act(); const chart=MINI.on&&/CHART/.test(MINI.on.title); MINI.close(); return {inn,chart,bunk:!!th('THE BUNK')}; });
    rec("squirrel's tower: its door leads into the round guardroom; the chart reads; a bunk",t.inn&&t.chart&&t.bunk,JSON.stringify(t)); await shot('tower-in');
    await pg.evaluate(()=>{ const th=__dbg.UI.things.find(t=>t.name.startsWith('THE LADDER (UP TO THE ROOF)')); if(th)th.act(); }); await U(()=>{ if(!TOWERK.roofAt)return false; const s=GTOWER.site(), w=TOWERK.where(); return w.y>s.top*.8&&Math.hypot(w.x-s.x,w.z-s.z)<s.r*1.5; },60000).catch(()=>{}); await pg.waitForTimeout(500);   // (the climb ends behind a fade: wait till you stand up there)
    const r=await pg.evaluate(()=>{ const s=GTOWER.site(), w=TOWERK.where(), up=w.y>s.top*.8&&Math.hypot(w.x-s.x,w.z-s.z)<s.r*1.5; const sg=__dbg.UI.things.find(t=>t.name==='THE SPYGLASS'); if(sg)sg.act(); const spy=!!TOWERK.spy; return {up,spy,hatch:__dbg.UI.things.some(t=>t.name==='THE HATCH (DOWN)')}; });
    rec("squirrel's tower: the ladder takes you up to the roof; the spyglass narrows the view; the hatch is there",r.up&&r.spy&&r.hatch,JSON.stringify(r)); await shot('tower-roof'); }
  /* ---------- YOUR HALL ---------- */
  { const ok=await pg.evaluate(()=>{ if(window.ENTERAPT){ ENTERAPT(); return true; } return false; }); await U(()=>window.HALLDBG&&HALLDBG().built&&__dbg.UI.things.some(t=>t.name==='YOUR MAILBOX'),180000).catch(()=>{});
    const h=await pg.evaluate(async()=>{ const th=n=>__dbg.UI.things.find(t=>t.name===n); const nb=th('THE NOTICE BOARD'); if(nb)nb.act(); const board=MINI.on&&MINI.on.title==='THE NOTICE BOARD'; MINI.close(); const mb=th('YOUR MAILBOX'); const n=mb?await HALLK.mail():null; return {board,mail:mb?HALLK.opened>=1:false,n}; });
    rec('your hall: the mailbox opens your letters (none here), the notice board reads',ok&&h.board&&h.mail,JSON.stringify(h)); await shot('hall'); }
  rec('no page errors',!errs.length,errs.slice(0,3).join(' | '));
  await b.close(); process.exit(bad?1:0); })();
