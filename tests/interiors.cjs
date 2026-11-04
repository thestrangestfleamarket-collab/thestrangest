// THE INTERIORS (docs/INTERIORS.md): node tests/interiors.cjs [out folder]. Each rebuilt inside: its staff have spots inside it, its patrons have seats or places, its non-human worker is made and stands at its spot, its own mechanic works; no page error. Exits 1 on any failure.
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
    const d=await pg.evaluate(()=>{ const th=__dbg.UI.things.find(t=>/^DARTS/.test(t.name)); th.act(); return BAR.last; });
    rec('bar: a game of darts scores three throws',!!d&&d.said.length===3&&d.tot>=0&&d.tot<=180,JSON.stringify(d));
    rec('bar: the badger sells drinks you can drink',await pg.evaluate(()=>{ const N=BODIES.by.w_badger&&BODIES.by.w_badger.npc, t=N&&CHARS.trade(N); return !!t&&['d_ale','d_stout','d_cola'].every(k=>(t.sells||[]).includes(k)&&ITEMS.prop(k,'edible')); }).catch(e=>String(e)));
    if(OUT){ fs.mkdirSync(OUT,{recursive:true}); await pg.screenshot({path:OUT+'/bar.png'}); }
    await pg.evaluate(()=>STORE.exit('bar')); await pg.waitForTimeout(3000); }
  rec('no page errors',!errs.length,errs.slice(0,3).join(' | '));
  await b.close(); process.exit(bad?1:0); })();
