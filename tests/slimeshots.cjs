const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'slimeout', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,6000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(5000);
  const shot=async(n,f,w=4000)=>{ try{ if(f)await pg.evaluate(f); await pg.waitForTimeout(w); await pg.screenshot({path:path.join(OUT,n+'.png')}); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  const st=async k=>{ rep[k]=await pg.evaluate(()=>({mob:DUNMOBDBG(),dun:DUNDBG(),tris:__dbg.tris(),calls:__dbg.info().calls,hp:+__dbg.VIT.hp.toFixed(3),jour:[...document.querySelectorAll('#fjour div')].map(d=>d.textContent)})); };
  const wheel=async(n)=>{ await pg.mouse.move(480,270); for(let i=0;i<Math.abs(n);i++){ await pg.mouse.wheel(0,n<0?-400:400); await pg.waitForTimeout(120); } };
  for(const n of [1,2,3,4,5]){ await pg.evaluate(n=>DUNGEON.go(n),n); await pg.waitForTimeout(n>=2?9000:4000); await shot('L'+n,null,1500); await st('L'+n); }
  await pg.evaluate(()=>DUNGEON.go(1)); await pg.waitForTimeout(4000);
  await pg.evaluate(()=>{ const S=DUNMOBS.slimes[0], T=DUNMOBS.T; S.wait=99; S.to=null; __dbg.ui().goTo(S.x,S.z-.7*Math.abs(T),'down'); });
  await wheel(-5); await shot('L1-near',null,1500);
  rep.punch=[]; for(let i=0;i<6;i++){ await pg.evaluate(()=>{ const S=DUNMOBS.slimes[0], y=__dbg.you(), T=DUNMOBS.T; S.x=y.x+Math.sin(y.h)*.6*T; S.z=y.z+Math.cos(y.h)*.6*T; S.to=null; S.air=0; S.wait=99; S.kb=null; }); await pg.keyboard.press('j'); await pg.waitForTimeout(700); rep.punch.push(await pg.evaluate(()=>{ const S=DUNMOBS.slimes[0], y=__dbg.you(); return {hp:S.hp,dead:S.dead,d:+(Math.hypot(S.x-y.x,S.z-y.z)/DUNMOBS.T).toFixed(2)}; })); }
  await pg.evaluate(()=>{ if(!DUNMOBS.slimes[0].dead)DUNMOBS.hit(0,9); }); await shot('L1-killed',null,1200); await st('killed');
  rep.nobottle=await pg.evaluate(()=>{ delete INV.items.bottle; const th=DUNMOBS.things().find(t=>/SLIME/.test(t.name)); th.act(); return {have:FORAGE.has('slime_green'),thing:!!DUNMOBS.things().includes(th),last:[...document.querySelectorAll('#fjour div')].map(d=>d.textContent).slice(-1)[0]}; });
  await shot('L1-nobottle',null,600);
  rep.bottle=await pg.evaluate(()=>{ FORAGE.give('bottle',2); const th=DUNMOBS.things().find(t=>/SLIME/.test(t.name)); th.act(); return {have:FORAGE.has('slime_green'),bottles:FORAGE.has('bottle'),thing:DUNMOBS.things().includes(th),last:[...document.querySelectorAll('#fjour div')].map(d=>d.textContent).slice(-1)[0]}; });
  await shot('L1-bottled',null,600);
  rep.loot=await pg.evaluate(()=>{ let n=0; for(let i=1;i<DUNMOBS.slimes.length;i++)DUNMOBS.hit(i,9); const L=DUNMOBS.things().filter(t=>!/SLIME/.test(t.name)); const c0=INV.cash; const names=L.map(t=>t.name); for(const t of L)t.act(); return {names,cash:[c0,INV.cash],fight:FORAGE.sk('fight')}; });
  await shot('L1-allkilled',null,1500); await st('L1all');
  await pg.evaluate(()=>DUNGEON.go(3)); await pg.waitForTimeout(5000); await shot('L3-close',()=>{ const S=DUNMOBS.slimes.find(s=>s.k==='red'), T=DUNMOBS.T; __dbg.ui().goTo(S.x+1.2*T,S.z,'down'); },3000);
  await pg.waitForTimeout(5000); await st('L3attack'); await shot('L3-after',null,500);
  await pg.evaluate(()=>{ __dbg.VIT.hp=1; DUNGEON.go(4); }); await pg.waitForTimeout(9000);
  await pg.evaluate(()=>{ const r=DUNMOBS.res.find(r=>r.on&&!r.dead&&r.key==='Warrior')||DUNMOBS.res.find(r=>r.on), T=DUNMOBS.T; __dbg.ui().goTo(r.N.st.x+1.5*T,r.N.st.z,'down'); });
  await shot('L4-fight0',null,2500); await shot('L4-fight1',null,2500); await st('L4fight');
  rep.skelKill=await pg.evaluate(async()=>{ const out=[]; for(let k=0;k<12;k++){ const on=DUNMOBS.res.filter(r=>r.on&&!r.dead); if(!on.length)break; DUNMOBS.hitRes(DUNMOBS.res.filter(r=>r.on).indexOf(on[0]),3); out.push(on[0].key+':'+on[0].hp); await new Promise(r=>setTimeout(r,400)); } return out; });
  await shot('L4-killed',null,2500); await st('L4killed');
  await pg.evaluate(()=>{ __dbg.VIT.hp=1; DUNGEON.go(5); }); await pg.waitForTimeout(6000); await shot('L5-again',null,500); await st('L5again');
  await pg.evaluate(()=>DUNGEON.go(0)); await pg.waitForTimeout(4000); await st('out');
  fin(); await b.close(); })();
