// THE DINER (src/146za-diner.js): node tests/diner.cjs [out folder]: in the diner, 20 seats (8 stools, 6 booth benches) and you can sit on them; the octopus chef is drawn and hands a plate out through the pass (counter, then the window's shelf, then taken); the kitchen's swing doors open as you come near; every diner job has a work spot inside, clear of the furniture; anyone else eating there takes a free seat and sits; no page error. Exits 1 on any failure.
const {chromium}=require('playwright'), fs=require('fs'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs=[]; let bad=0;
  pg.on('pageerror',e=>errs.push(e.message.slice(0,160)));
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=11',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.evaluate(()=>ROOMS.enter('diner'));
  await pg.waitForFunction(()=>ROOMS.offIn()==='diner'&&!(window.FADE&&FADE.busy)&&DINERDBG().built,null,{timeout:120000}); await pg.waitForTimeout(1500);
  const d=await pg.evaluate(()=>DINERDBG());
  rec('the diner is built',d.built); rec('20 seats',d.seats===20,d.seats); rec('its things are there',d.things>=50,d.things+' things');
  const n=await pg.evaluate(()=>({stool:__dbg.UI.things.filter(t=>t.name==='STOOL').length,booth:__dbg.UI.things.filter(t=>t.name==='BOOTH').length,chef:__dbg.UI.things.some(t=>t.name.startsWith('THE OCTOPUS CHEF'))}));
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
  const pt=await pg.evaluate(()=>{ const b=ROOMS.off.diner.box, got=[]; for(let i=0;i<21;i++)got.push(CREW.inside('diner','patron'+i)); const ok=got.slice(0,20);
    const inB=ok.every(p=>p&&p.sit>0&&p.x>b.x0&&p.x<b.x1&&p.z>b.z0&&p.z<b.z1), uniq=new Set(ok.map(p=>p&&p.x.toFixed(2)+','+p.z.toFixed(2))).size;
    CREW.out('patron3'); const again=CREW.inside('diner','patron20'); for(let i=0;i<21;i++)CREW.out('patron'+i); return {inB,uniq,full:got[20]===null,freed:!!again&&again.sit>0}; });
  rec('patrons take the 20 seats, one each, inside; none left when full; a seat frees when they go',pt.inB&&pt.uniq===20&&pt.full&&pt.freed,JSON.stringify(pt));
  // nothing just for show: the counter sells, the boards read close up, the jukebox plays, a shift at the pass pays
  const fn=await pg.evaluate(()=>{ const th=n=>__dbg.UI.things.find(t=>t.name.startsWith(n)); INV.cash=20; const c0=INV.items.f_pie||0; th('THE PIE CASE').act(); const pie=(INV.items.f_pie||0)===c0+1&&INV.cash===17;
    INV.cash=0; th('THE COFFEE BREWER').act(); const broke=INV.cash===0; INV.cash=20;
    th('THE CASH REGISTER').act(); const shop=!!SHOPS.cur&&SHOPS.cur.key==='diner_waitress'; const t=CHARS.trade({key:'diner_waitress'}); const menu=!!t&&['d_coffee','f_burger','f_pie','d_shake'].every(k=>t.sells.includes(k)&&ITEMS.prop(k,'edible'));
    th('THE MENU BOARD').act(); const look=MINI.on&&MINI.on.title==='THE MENU BOARD'; MINI.close();
    const juke=RADIO.src.has('jukebox-diner'); const need=['THE GUMBALL','THE NEWSPAPER BOX','THE MEN','THE WOMEN','A WASHBASIN','A TABLETOP JUKEBOX','THE JUKEBOX','THE CLOCK','THE HOST STAND','THE SODA FOUNTAIN','THE MILKSHAKE','THE CAKE STAND','THE PASS'].filter(n=>!th(n));
    th('THE PASS').act(); const S=MINI.state(); const game=!!S&&MINI.on.title==='A SHIFT AT THE PASS';
    return {pie,broke,shop,menu,look,juke,need,game}; });
  rec('the counter sells (a slice of pie, $3), and not when you are broke',fn.pie&&fn.broke,JSON.stringify(fn));
  rec('ordering opens the waitress\'s menu of things you can eat',fn.shop&&fn.menu);
  rec('the menu board reads close up',fn.look); rec('the jukebox is a radio in the room',fn.juke);
  rec('every machine, box and fixture you would use is usable',!fn.need.length,fn.need.join(', '));
  // the shift: put the right plate to the right table and a tip comes
  const sh=await pg.evaluate(async()=>{ const S=MINI.state(); for(let i=0;i<80&&!S.plates.length;i++)await new Promise(r=>setTimeout(r,100)); if(!S.plates.length)return {plates:0};
    const p=S.plates[0], i=S.want.findIndex(w=>w&&w.d===p.d), TB=[[50,330],[120,330],[190,330],[260,330],[330,330],[85,405],[200,405],[315,405]];
    const click=async(x,y)=>{ S.mx=x; S.my=y; S.press=true; await new Promise(r=>setTimeout(r,120)); };
    await click(60,95); await click(TB[i][0],TB[i][1]); const tips=S.tips; S.left=0; await new Promise(r=>setTimeout(r,200)); const c=INV.cash; MINI.close(); return {plates:1,tips,paid:c>20,last:DINER.last}; });
  rec('a shift at the pass: the right plate to the right table pays a tip',sh.plates&&sh.tips>0&&sh.paid,JSON.stringify(sh));
  if(OUT){ fs.mkdirSync(OUT,{recursive:true}); await pg.screenshot({path:OUT+'/diner.png'}); }
  rec('no page errors',!errs.length,errs.slice(0,3).join(' | '));
  await b.close(); process.exit(bad?1:0); })();
