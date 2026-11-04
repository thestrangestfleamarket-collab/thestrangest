// LOOSE THINGS (src/150-loose.js, owner 19 Oct 2026 "push and throw things"): on the street, in the bodega, in an apartment and in the
// dungeon the loose things near you become bodies; a shove moves one, it falls and sleeps; one is picked up and thrown; walking into a
// light one pushes it and its old place no longer blocks (the street's nearest light loose thing: no trash can is loose any more, 4 Nov 2026); a heavy one barely moves; ms a frame with many awake. No page errors.
// node tests/loosecheck.cjs   (software rendering: a few minutes; ?physics=1 loads the physics at the start, as it waits for a first push otherwise)
const {chromium}=require('playwright');
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
const wait=(pg,ms)=>pg.waitForTimeout(ms);
const open=async(b,q)=>{ const pg=await b.newPage({viewport:{width:960,height:640}}), errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=14&physics=1&'+q,{timeout:180000});
  for(let i=0;i<200&&!await pg.evaluate(()=>!!window.__started).catch(()=>false);i++)await wait(pg,1000);
  for(let i=0;i<60&&!await pg.evaluate(()=>GOODSDBG().built&&GOODSDBG().active>0).catch(()=>false);i++)await wait(pg,1000);
  await wait(pg,1500); pg.errs=errs; return pg; };
const settle=async(pg,n,ms=40000)=>{ for(let t=0;t<ms;t+=500){ await wait(pg,500); const a=await pg.evaluate(n=>LOOSE.nearest(n),n); if(a&&!a.awake)return {a,t}; } return {a:await pg.evaluate(n=>LOOSE.nearest(n),n),t:ms}; };
const beside=(pg,n,k=1)=>pg.evaluate(([n,k])=>{ const T=__dbg.cv().TILE, a=LOOSE.nearest(n), [x,y,z]=__dbg.pos(), dx=a.at[0]-x, dz=a.at[2]-z, d=Math.hypot(dx,dz)||1, r=Math.max(...LOOSE.list().find(q=>q.name===a.name&&Math.abs(q.at[0]-a.at[0])<1e-3).h); __dbg.UI.goTo(a.at[0]-dx/d*(r+k*T),a.at[2]-dz/d*(r+k*T),y); return a; },[n,k]);
const walkInto=(pg,n,k=2.5)=>pg.evaluate(([n,k])=>{ const T=__dbg.cv().TILE, a=LOOSE.nearest(n), [x,,z]=__dbg.pos(), dx=a.at[0]-x, dz=a.at[2]-z, d=Math.hypot(dx,dz); __dbg.go(a.at[0]+dx/d*k*T,a.at[2]+dz/d*k*T); return a; },[n,k]);
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  { const pg=await open(b,'');
    const N=await pg.evaluate(()=>{ const L=LOOSE.list(true).filter(q=>q.k!=='v'&&!q.heavy&&q.m<=30), [x,,z]=__dbg.pos(), q=L.sort((p,r)=>Math.hypot(p.c[0]-x,p.c[2]-z)-Math.hypot(r.c[0]-x,r.c[2]-z))[0]; if(!q)return null; __dbg.UI.goTo(q.c[0]+1.2*__dbg.cv().TILE,q.c[2],'up'); return q.name; });
    for(let i=0;i<40&&N&&!await pg.evaluate(n=>LOOSE.list().some(q=>q.name===n),N);i++)await wait(pg,500); await wait(pg,1500);
    const s=await pg.evaluate(()=>{ const L=LOOSE.list(true), by={}; for(const q of L){ const k=q.k==='v'?'goods':q.heavy?'heavy':q.m<=30?'light':'other'; by[k]=(by[k]||0)+1; } return {n:L.length,by,dbg:GOODSDBG(),act:LOOSE.list().filter(q=>q.k!=='v').map(q=>q.name)}; });
    console.log('loose things:',s.n,JSON.stringify(s.by),'· near the start:',s.dbg.active,'bodies,',s.dbg.statics,'fixed colliders ·',s.act.join(', '));
    ok(s.dbg.active>0&&!!N&&s.act.includes(N),'the street: things near the start are bodies (a light one among them: '+N+')');
    await beside(pg,N,.7); await wait(pg,1500); const r0=await walkInto(pg,N); await wait(pg,12000); const r1=await pg.evaluate(n=>LOOSE.nearest(n),N);
    ok(Math.hypot(r1.at[0]-r0.at[0],r1.at[2]-r0.at[2])>.05,`walking into ${N} pushes it (moved ${Math.hypot(r1.at[0]-r0.at[0],r1.at[2]-r0.at[2]).toFixed(2)})`);
    await settle(pg,N);
    const a0=await pg.evaluate(n=>{ const a=LOOSE.nearest(n); LOOSE.push(n,2.5,3,1.5); return a; },N); await wait(pg,400);
    const mid=await pg.evaluate(n=>LOOSE.nearest(n),N); const {a:a1,t}=await settle(pg,N);
    ok(mid.awake&&Math.hypot(a1.at[0]-a0.at[0],a1.at[2]-a0.at[2])>.3,`a shoved ${N} flies (moved ${Math.hypot(a1.at[0]-a0.at[0],a1.at[2]-a0.at[2]).toFixed(2)}) and sleeps (${(t/1000).toFixed(1)} s)`);
    ok(!a1.awake&&a1.at[1]<a0.at[1]+.3&&a1.at[1]>a0.at[1]-1.2,`it lands (y ${a0.at[1].toFixed(2)} -> ${a1.at[1].toFixed(2)})`);
    const blk=await pg.evaluate(([x,z])=>{ const p=__dbg.collide(x,z); return Math.hypot(p[0]-x,p[1]-z); },[a0.at[0],a0.at[2]]);
    ok(blk<.01,`its old place no longer blocks walking (pushed out ${blk.toFixed(3)})`);
    const st=await pg.evaluate(n=>LOOSE.nearest(n),N); await wait(pg,2500); const st2=await pg.evaluate(n=>LOOSE.nearest(n),N);
    ok(Math.hypot(st2.at[0]-st.at[0],st2.at[1]-st.at[1],st2.at[2]-st.at[2])<1e-4,'at rest it stays still');
    const pk=await pg.evaluate(n=>LOOSE.pickAt(n),N); ok(pk===N.toUpperCase(),'clicking it offers to pick it up ('+pk+')');
    ok(!pg.errs.length,'the street: no page errors '+pg.errs.join(' | ')); await pg.close(); }
  { const pg=await open(b,'at=9.9,-3.4');
    const d0=await pg.evaluate(()=>({dbg:GOODSDBG(),act:LOOSE.list().filter(q=>q.k!=='v').map(q=>q.name)})); console.log('the bodega:',d0.dbg.active,'bodies ·',d0.act.join(', '));
    ok(d0.dbg.active>100,'the bodega: its goods and things are bodies');
        await beside(pg,'office chair',.6); await wait(pg,1500);
    const c0=await pg.evaluate(()=>{ const a=LOOSE.nearest('office chair'); return {a,g:GOODSGRAB('office chair')}; }); await wait(pg,800);
    const c1=await pg.evaluate(()=>({h:GOODSDBG().held,a:LOOSE.nearest('office chair')})); ok(c1.h==='office chair','picked up the office chair (held: '+c1.h+')');
    await pg.evaluate(()=>GOODSTHROW(-3*__dbg.cv().TILE,0)); await wait(pg,300); const {a:c2,t}=await settle(pg,'office chair');
    ok(!c2.awake&&Math.hypot(c2.at[0]-c0.a.at[0],c2.at[2]-c0.a.at[2])>.5,`thrown, it lands ${Math.hypot(c2.at[0]-c0.a.at[0],c2.at[2]-c0.a.at[2]).toFixed(2)} away and sleeps (${(t/1000).toFixed(1)} s)`);
    await beside(pg,'office chair',.6); await wait(pg,1500); await pg.evaluate(()=>GOODSGRAB('office chair')); await wait(pg,800);
    const pu=await pg.evaluate(()=>{ const T=__dbg.cv().TILE, r=GOODSPUT(1.5*T,0); return {r,T,h:GOODSDBG().held}; }); await wait(pg,300); const {a:c3}=await settle(pg,'office chair'); const p3=await pg.evaluate(()=>__dbg.pos());
    ok(pu.r&&!pu.h&&Math.abs(c3.at[0]-p3[0]-1.5*pu.T)<.5*pu.T&&Math.abs(c3.at[2]-p3[2])<.5*pu.T,'held, a double-click puts it down where you clicked, not thrown ('+JSON.stringify([c3.at[0]-p3[0],c3.at[2]-p3[2]].map(v=>+(v/pu.T).toFixed(2)))+' tiles)');
    const hit=await pg.evaluate(()=>GOODSHIT(3,5)); await wait(pg,300); const ms=[]; let aw=0;
    for(let i=0;i<10;i++){ await wait(pg,200); const d=await pg.evaluate(()=>GOODSDBG()); ms.push(d.ms); aw=Math.max(aw,d.awake); }
    console.log(`  knocked ${hit}: up to ${aw} awake, the physics ${Math.max(...ms).toFixed(2)} ms a frame (EMA), ${Math.min(...ms).toFixed(2)} at least`);
    for(let i=0;i<180&&(await pg.evaluate(()=>GOODSDBG().awake));i++)await wait(pg,500);
    const d1=await pg.evaluate(()=>GOODSDBG()); ok(d1.awake===0,`all asleep again (${d1.moved} moved) `+JSON.stringify(await pg.evaluate(()=>LOOSE.list().filter(q=>q.awake).map(q=>[q.name,q.at])))); const msr=[]; for(let i=0;i<5;i++){ await wait(pg,200); msr.push(await pg.evaluate(()=>GOODSDBG().ms)); }
    console.log(`  at rest: ${Math.min(...msr).toFixed(3)} ms a frame`);
    ok(!pg.errs.length,'the bodega: no page errors '+pg.errs.join(' | ')); await pg.close(); }
  { const pg=await open(b,'at=-2.2,3.2');
    const at=await pg.evaluate(()=>{ const T=__dbg.cv().TILE, L=LOOSE.list(true).filter(q=>q.name==='wardrobe').sort((p,q)=>p.c[1]-q.c[1]), w=L[0], y=w.c[1]-w.h[1]; __dbg.UI.goTo(w.c[0]+(w.h[0]+.9*T),w.c[2],y); return [w.c,y]; });
    for(let i=0;i<40&&!await pg.evaluate(()=>LOOSE.nearest('wardrobe')&&LOOSE.nearest('wardrobe').at[1]<__dbg.pos()[1]+5);i++)await wait(pg,500); await wait(pg,1500);
    const a=await pg.evaluate(()=>({dbg:GOODSDBG(),act:LOOSE.list().filter(q=>q.k!=='v').map(q=>q.name)})); console.log('an apartment:',a.dbg.active,'bodies ·',[...new Set(a.act)].join(', '));
    ok(a.act.includes('wardrobe')&&a.act.includes('stool'),'an apartment: its furniture are bodies');
    await beside(pg,'wardrobe',.7); await wait(pg,1500); const w0=await walkInto(pg,'wardrobe',1.5); await wait(pg,10000); const w1=await pg.evaluate(()=>LOOSE.nearest('wardrobe'));
    await beside(pg,'stool',.7); await wait(pg,1500); const s0=await walkInto(pg,'stool',1.5); await wait(pg,10000); const s1=await pg.evaluate(()=>LOOSE.nearest('stool'));
    const dw=Math.hypot(w1.at[0]-w0.at[0],w1.at[2]-w0.at[2]), ds=Math.hypot(s1.at[0]-s0.at[0],s1.at[2]-s0.at[2]);
    console.log(`  walked into: the wardrobe (${w0.m.toFixed(0)} kg) moved ${dw.toFixed(3)}, a stool (${s0.m.toFixed(1)} kg) ${ds.toFixed(3)}`);
    ok(ds>.05&&dw<.5*ds,'a heavy thing barely budges next to a light one');
    ok(!pg.errs.length,'the apartment: no page errors '+pg.errs.join(' | ')); await pg.close(); }
  { const pg=await open(b,'place=the%20dungeon');
    for(let i=0;i<30&&!await pg.evaluate(()=>!!LOOSE.nearest('crate'));i++)await wait(pg,500);
    const a=await pg.evaluate(()=>({dbg:GOODSDBG(),act:LOOSE.list().filter(q=>q.k!=='v').map(q=>q.name)})); console.log('the dungeon:',a.dbg.active,'bodies ·',a.act.join(', '));
    ok(a.act.includes('crate')&&a.act.includes('oak barrel'),'the dungeon: crates and barrels are bodies');
    const g=await pg.evaluate(()=>GOODSGRAB('crate')); await wait(pg,500); await pg.evaluate(()=>GOODSTHROW(0,3*__dbg.cv().TILE)); const {a:c}=await settle(pg,'crate'); ok(g==='crate'&&!c.awake,'a crate picked up, thrown, asleep');
    ok(!pg.errs.length,'the dungeon: no page errors '+pg.errs.join(' | ')); await pg.close(); }
  await b.close(); console.log(bad?bad+' FAILED':'all good'); process.exit(bad?1:0); })().catch(e=>{ console.error(e); process.exit(1); });
