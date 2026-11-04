// THE DINER (src/146za-diner.js): node tests/diner.cjs [out folder]: in the diner, 20 seats (8 stools, 6 booth benches) and you can sit on them; the octopus chef is drawn and hands a plate out through the pass (counter, then the window's shelf, then taken); the kitchen's swing doors open as you come near; every diner job has a work spot inside, clear of the furniture; no page error. Exits 1 on any failure.
const {chromium}=require('playwright'), fs=require('fs'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs=[]; let bad=0;
  pg.on('pageerror',e=>errs.push(e.message.slice(0,160)));
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=11',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.evaluate(()=>ROOMS.enter('diner'));
  await pg.waitForFunction(()=>ROOMS.offIn()==='diner'&&!(window.FADE&&FADE.busy)&&DINERDBG().built,null,{timeout:120000}); await pg.waitForTimeout(1500);
  const d=await pg.evaluate(()=>DINERDBG());
  rec('the diner is built',d.built); rec('20 seats',d.seats===20,d.seats); rec('its things are there',d.things>=50,d.things+' things');
  const n=await pg.evaluate(()=>({stool:__dbg.UI.things.filter(t=>t.name==='STOOL').length,booth:__dbg.UI.things.filter(t=>t.name==='BOOTH').length,chef:__dbg.UI.things.some(t=>t.name==='THE OCTOPUS CHEF')}));
  rec('8 stools and 6 booth benches to sit on',n.stool===8&&n.booth===6,JSON.stringify(n)); rec('the octopus chef is a thing',n.chef);
  for(const k of ['STOOL','BOOTH']){ const s=await pg.evaluate(k=>{ const th=__dbg.UI.things.find(t=>t.name===k); th.act(); return {seat:!!USE.seat}; },k).catch(e=>({err:e.message}));
    rec('sitting on a '+k.toLowerCase(),s.seat,JSON.stringify(s)); await pg.keyboard.press('w'); await pg.waitForTimeout(400); }
  rec('the octopus is drawn',await pg.evaluate(()=>!!DINER.oct&&DINER.oct.im.count>100));
  const P=await pg.evaluate(()=>{ const R=MSHOP.at.diner.R, B=SHARED.BOD;
    const at=t=>{ DINER.chef(t); const p=DINER.plate; return p.visible?+((p.position.z-B.Z(R.y0))/(B.Z(R.y1)-B.Z(R.y0))).toFixed(3):null; };
    return {plated:at(1),out:at(5.5),taken:at(7.6)}; });
  rec('a plate goes from the counter out to the pass shelf, then is taken',P.plated!=null&&P.out!=null&&P.out>P.plated&&P.taken==null,JSON.stringify(P));
  const door=await pg.evaluate(async()=>{ const D=DINER.door; __dbg.UI.goTo(D.x,D.z+.7*Math.abs(SHARED.BOD.X(1)-SHARED.BOD.X(0)),SHARED.py); for(let i=0;i<40&&DINER.door.a<.8;i++)await new Promise(r=>setTimeout(r,150)); return +DINER.door.a.toFixed(2); });
  rec('the swing doors open as you come near',door>.8,door);
  const C=JSON.parse(fs.readFileSync('data/characters.json','utf8')), titles=[...new Set(Object.values(C).filter(c=>c&&c.job&&c.job.at==='diner').map(c=>c.job.title))];
  const sp=await pg.evaluate(titles=>{ const b=ROOMS.off.diner.box; return titles.map(t=>{ const p=CREW.inside('diner','x',{title:t}); if(!p)return t+': none'; const inB=p.x>b.x0&&p.x<b.x1&&p.z>b.z0&&p.z<b.z1;
    const hit=SHARED.solids.some(r=>p.x>r[0]&&p.x<r[2]&&p.z>r[1]&&p.z<r[3]); return inB&&!hit?null:t+(inB?': in furniture':': outside'); }).filter(Boolean); },titles);
  rec('every diner job ('+titles.join(', ')+') has a clear spot inside',!sp.length,sp.join(', '));
  if(OUT){ fs.mkdirSync(OUT,{recursive:true}); await pg.screenshot({path:OUT+'/diner.png'}); }
  rec('no page errors',!errs.length,errs.slice(0,3).join(' | '));
  await b.close(); process.exit(bad?1:0); })();
