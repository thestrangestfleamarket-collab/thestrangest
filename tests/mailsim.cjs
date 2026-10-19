// THE MAIL, WHAT'S LEFT (src/160-mail.js): node tests/mailsim.cjs <out folder>, the whole town brought in. Every address and box checked; no homes
// in the apartment house or the apartments, no box of yours, no welcome notice, no rent (owner, 19 Oct 2026). The bodega posts four pieces in
// its collection box (no carrier droid walks them since the droids went out); the clock driven to day 3 (once a rent day): no rent bills;
// the save carries your money over a reload. Exits 1 on any failure.
const {chromium}=require('playwright'); const OUT=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const ctx=await b.newContext({viewport:{width:960,height:640}}); let pg=await ctx.newPage(); const errs={};
  const watch=p=>p.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; }); watch(pg);
  const R=[]; const rec=(n,ok,i)=>{ R.push([n,ok]); console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const up=async(q)=>{ await pg.goto('file://'+process.cwd()+'/dist/market.html?city=1&hour=12&bring=all'+q); for(let i=0;i<240&&!(await pg.evaluate(()=>!!window.__started&&window.MAIL&&MAIL.ready).catch(()=>false));i++)await pg.waitForTimeout(1000); await pg.evaluate(()=>{ __dbg.CLOCK.run=false; MAIL.v=5; MAIL.stopMs=300; MAIL.replyP=1; }); };
  const hour=async h=>{ await pg.evaluate(h=>CITY.setHour(h),h); await pg.waitForTimeout(1500); };
  const passMidnight=async()=>{ await hour(23.9); await hour(.05); };
  await up('&fresh=1');
  const A=await pg.evaluate(()=>({n:MAIL.addr.length,cb:MAIL.cboxes.length,labels:MAIL.addr.map(a=>a.name+' · '+a.label),noBox:MAIL.addr.filter(a=>!a.box).map(a=>a.id),dup:MAIL.addr.length-new Set(MAIL.addr.map(a=>a.label)).size,house:MAIL.addr.filter(a=>/^(house|apts)/.test(a.id)).map(a=>a.id),mine:!!MAIL.mine,res:!!(window.CITY&&CITY.residents),notes:MAIL.L.map(l=>l.subject)}));
  console.log('addresses:\n  '+A.labels.join('\n  '));
  rec('every door an address, every address a box',A.n>=10&&!A.noBox.length,A.n+' addresses, '+A.cb+' collection boxes'+(A.noBox.length?', no box: '+A.noBox.join():''));
  rec('no two addresses the same',A.dup===0);
  rec('no homes in the apartment house or the apartments, no box of yours, no residents',!A.house.length&&!A.mine&&!A.res,A.house.join());
  rec('no welcome notice',!A.notes.some(s=>/WELCOME/.test(s)),A.notes.join());
  const posted=await pg.evaluate(()=>{ const walker=WALKERS.list.find(w=>w.home&&w.home.id); window.__W=walker; if(!walker)return null; const at=MAIL.postAt(MAIL.byId('bodega')); CIVIC.shops.bodega.till+=50;
    const t=(o,tag)=>{ const l=MAIL.post(Object.assign({from:'bodega',at},o)); if(l)l.tag=tag; return !!l; };
    return [t({to:walker.home.id,subject:'YOUR ORDER',body:'It came in.'},'letter'),t({to:walker.home.id,kind:'PARCEL',subject:'A GIFT',body:'For you.'},'parcel'),t({to:'nowhere',toLabel:'99 NOWHERE LANE',subject:'LOST',body:'?'},'bad'),t({to:MAIL.hall.id,subject:'THE STREET LIGHT',body:'It flickers.'},'hall'),walker.home.label]; });
  rec('the bodega posted four pieces to a townsperson\'s box',!!posted&&posted.slice(0,4).every(x=>x),posted&&posted[4]);
  await hour(20.4); await hour(20.6); await passMidnight(); await passMidnight(); await passMidnight(); await hour(7.9); await hour(8.05); await hour(9.4); await hour(9.6);
  const day=await pg.evaluate(()=>MAIL.day()), rent=await pg.evaluate(()=>MAIL.L.filter(l=>/RENT/.test(l.subject)).length); rec('no rent bills on day '+day,rent===0,rent+' rent pieces');
  const before=await pg.evaluate(()=>{ MAIL.you.cash=77; MAIL.save(); return {n:MAIL.L.length,cash:MAIL.you.cash,day:MAIL.day()}; });
  await up('&keepmail=1'); const after=await pg.evaluate(()=>({n:MAIL.L.length,cash:MAIL.you.cash,day:MAIL.day()}));
  rec('the mail and your money kept over a reload',after.n>=before.n-1&&after.cash===before.cash&&after.day>=before.day,JSON.stringify(before)+' → '+JSON.stringify(after));
  const stats=await pg.evaluate(()=>MAILDBG()); console.log('the post now:',JSON.stringify(stats));
  await pg.evaluate(()=>{ const T=__dbg.cv().TILE, cb=MAIL.cboxes[0]; STORE.goTo(cb.x,cb.z+2.5*T,'up'); }); await pg.waitForTimeout(4000); await pg.screenshot({path:OUT+'/mail_collectionbox.png'});
  rec('no page errors',!Object.keys(errs).length,JSON.stringify(errs));
  await b.close(); process.exit(R.some(r=>!r[1])?1:0); })();
