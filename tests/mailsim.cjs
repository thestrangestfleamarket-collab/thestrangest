// THE MAIL, PLAYED THROUGH (src/mail.js): node tests/mailsim.cjs <out folder>. Every address and box checked; you post four pieces (a letter to the
// bodega, a postcard to a resident, a parcel to a townsperson, a letter to an address that doesn't exist); the clock driven through two
// mornings (the 9:30 round takes yours out of your box, the 8:00 sort returns the bad one, the next round delivers); the shops read at 10 and
// answer; the townsperson walks home to his box and reads; the rent bills go out, are paid by mail and banked by city hall; you pay yours in
// the panel; the save carries everything over a reload. The carrier walks quicker than in play (MAIL.v 5). Exits 1 on any failure.
const {chromium}=require('playwright'); const OUT=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const ctx=await b.newContext({viewport:{width:960,height:640}}); let pg=await ctx.newPage(); const errs={};
  const watch=p=>p.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; }); watch(pg);
  const R=[]; const rec=(n,ok,i)=>{ R.push([n,ok]); console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const up=async(q)=>{ await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=12'+q); for(let i=0;i<240&&!(await pg.evaluate(()=>!!window.__started&&window.MAIL&&MAIL.ready).catch(()=>false));i++)await pg.waitForTimeout(1000); await pg.evaluate(()=>{ __dbg.CLOCK.run=false; MAIL.v=5; MAIL.stopMs=300; MAIL.replyP=1; }); };
  const hour=async h=>{ await pg.evaluate(h=>CITY.setHour(h),h); await pg.waitForTimeout(1500); };
  const passMidnight=async()=>{ await hour(23.9); await hour(.05); };
  const carrierDone=async(ms=900000)=>{ const t=Date.now(); await pg.waitForTimeout(2000); while(Date.now()-t<ms){ if(await pg.evaluate(()=>CIVIC.staff.carrier.state==='free'))return Date.now()-t; await pg.waitForTimeout(3000); } return -1; };
  const S=async()=>pg.evaluate(()=>Object.fromEntries(MAIL.L.filter(l=>l.tag).map(l=>[l.tag,{state:l.state,to:l.to,ret:!!l.returned,h:l.hist.map(h=>h[2])}])));
  await up('&fresh=1');
  // ---- the addresses
  const A=await pg.evaluate(()=>({n:MAIL.addr.length,cb:MAIL.cboxes.length,mine:MAIL.mine&&MAIL.mine.label,labels:MAIL.addr.map(a=>a.name+' · '+a.label),homeless:(WALKERS.list||[]).filter(w=>!w.home).map(w=>w.N.key),resNo:CITY.residents.filter(r=>!r.addr).map(r=>r.key),noBox:MAIL.addr.filter(a=>!a.box).map(a=>a.id),dup:MAIL.addr.length-new Set(MAIL.addr.map(a=>a.label)).size}));
  console.log('addresses:\n  '+A.labels.join('\n  '));
  rec('every door an address, every address a box',A.n>=30&&!A.noBox.length,A.n+' addresses, '+A.cb+' collection boxes'+(A.noBox.length?', no box: '+A.noBox.join():''));
  rec('no two addresses the same',A.dup===0);
  rec('every resident and townsperson has a home address',!A.homeless.length&&!A.resNo.length,A.homeless.concat(A.resNo).join());
  rec('you have a box',!!A.mine,A.mine);
  rec('a welcome notice on its way to you',await pg.evaluate(()=>MAIL.L.some(l=>l.to===MAIL.mine.id&&/WELCOME/.test(l.subject))));
  // ---- you post four pieces
  const posted=await pg.evaluate(()=>{ const me=MAIL.mine.id, res=CITY.residents[0].addr, walker=WALKERS.list.find(w=>w.home&&w.home.b.id==='apts'||w.home)||null; window.__W=walker;
    const t=(o,tag)=>{ const l=MAIL.post(Object.assign({from:me,at:me},o)); if(l)l.tag=tag; return !!l; };
    return [t({to:'bodega',subject:'AN ORDER',body:'Please keep some apples for me.'},'shop'),t({to:res.id,kind:'POSTCARD',subject:'HELLO NEIGHBOUR',body:'Hi!'},'res'),t({to:walker.home.id,kind:'PARCEL',subject:'A GIFT',body:'For you.'},'parcel'),t({to:'nowhere',toLabel:'99 NOWHERE LANE',subject:'LOST',body:'?'},'bad'),MAIL.you.cash]; });
  rec('you posted four pieces, stamps paid',posted.slice(0,4).every(x=>x)&&posted[4]===100-7,'your money now $'+posted[4]);
  rec('your box\'s flag is up',await pg.evaluate(()=>MAIL.meFL&&(()=>{ const m=new __dbg.THREE.Matrix4(); MAIL.meFL.getMatrixAt(MAIL.mine.flag,m); const s=new __dbg.THREE.Vector3(); s.setFromMatrixScale(m); return s.y>s.z; })()));
  await pg.evaluate(()=>{ const s=MAIL.mine.b.step; STORE.goTo(s.x,s.z+2*__dbg.cv().TILE,'up'); }); await pg.waitForTimeout(4000); await pg.screenshot({path:OUT+'/mail_yourbox.png'});
  // ---- day 0: the afternoon collection (collection boxes only), then night
  await hour(15.9); await hour(16.05); let t=await carrierDone(); console.log('  afternoon collection',t>=0?(t/1000).toFixed(0)+' s':'never finished');
  await hour(20.4); await hour(20.6); console.log('  evening letters written:',await pg.evaluate(()=>MAIL.L.filter(l=>l.state==='posted').length),'pieces waiting to be collected');
  await passMidnight();
  // ---- day 1: sort, round (yours collected; the welcome delivered)
  await hour(7.9); await hour(8.05); await hour(9.4); await hour(9.6); t=await carrierDone(); console.log('  day 1 round',t>=0?(t/1000).toFixed(0)+' s':'never finished');
  let s=await S(); rec('the 9:30 round took your pieces from your box',['shop','res','parcel','bad'].every(k=>s[k].state==='collected'),JSON.stringify(Object.fromEntries(Object.entries(s).map(([k,v])=>[k,v.state]))));
  rec('the welcome notice reached your box',await pg.evaluate(()=>MAIL.L.some(l=>l.to===MAIL.mine.id&&/WELCOME/.test(l.subject)&&l.state==='delivered')));
  await passMidnight();
  // ---- day 2: the sort returns the bad one; the round delivers
  await hour(7.9); await hour(8.05); s=await S(); rec('the 8:00 sort returned the letter to no address',s.bad.ret&&s.bad.to===await pg.evaluate(()=>MAIL.mine.id),s.bad.h.slice(-1)[0]);
  await hour(9.4); await hour(9.6); t=await carrierDone(); console.log('  day 2 round',t>=0?(t/1000).toFixed(0)+' s':'never finished');
  s=await S(); rec('delivered: the bodega\'s letter, the postcard, the parcel, the returned one',['shop','res','parcel','bad'].every(k=>s[k].state==='delivered'||s[k].state==='read'),JSON.stringify(Object.fromEntries(Object.entries(s).map(([k,v])=>[k,v.state]))));
  rec('the parcel waits on the step',await pg.evaluate(()=>MAIL.mePC.count)>0);
  console.log('  the history of the bodega\'s letter:\n    '+s.shop.h.join('\n    '));
  await hour(9.95); await hour(10.05); s=await S(); rec('the bodega read its mail at 10',s.shop.state==='read');
  rec('the bodega wrote back',await pg.evaluate(()=>MAIL.L.some(l=>l.from==='bodega'&&l.to===MAIL.mine.id&&/^RE: AN ORDER/.test(l.subject))));
  // ---- the townsperson walks home to his box for the parcel
  const tw=Date.now(); let read=false; while(Date.now()-tw<300000){ s=await S(); if(s.parcel.state==='read'){ read=true; break; } await pg.waitForTimeout(4000); }
  rec('the townsperson walked home and took in his parcel',read,read?((Date.now()-tw)/1000).toFixed(0)+' s':await pg.evaluate(()=>JSON.stringify({kind:__W.kind,state:__W.state,mail:__W.mail})));
  // ---- rent: day 3 is a bill day (every third); bills sorted and delivered the same morning; the people pay by mail; city hall banks it next morning
  await passMidnight(); const tr0=await pg.evaluate(()=>CIVIC.ledger.treasury);
  await hour(7.9); await hour(8.05); const bills=await pg.evaluate(()=>MAIL.L.filter(l=>l.kind==='BILL'&&l.state==='sorted').length); rec('city hall\'s rent bills sorted for the round',bills>=10,bills+' bills');
  await hour(9.4); await hour(9.6); await carrierDone(); await hour(20.5); await hour(20.7);
  const tw2=Date.now(); while(Date.now()-tw2<240000){ if(await pg.evaluate(()=>MAIL.L.filter(l=>l.kind==='PAYMENT'&&l.from!==MAIL.mine.id).length>=2))break; await pg.waitForTimeout(4000); }
  const pays=await pg.evaluate(()=>MAIL.L.filter(l=>l.kind==='PAYMENT').map(l=>l.state)); rec('tenants mailed their rent payments',pays.length>=2,pays.length+' payments: '+pays.join());
  // you pay yours in the panel
  await pg.evaluate(()=>{ MAIL.open(); }); await pg.waitForTimeout(800);
  const opened=await pg.evaluate(()=>{ const P=document.getElementById('mailp'); const row=[...P.querySelectorAll('[data-l]')].find(d=>/RENT/.test(d.textContent)); if(!row)return 'no rent bill in your box: '+[...P.querySelectorAll('[data-l]')].map(d=>d.textContent.slice(0,40)).join(' | '); row.click(); return 'ok'; }); await pg.waitForTimeout(500);
  await pg.screenshot({path:OUT+'/mail_panel_bill.png'});
  const paid=opened==='ok'&&await pg.evaluate(()=>{ const b=document.querySelector('#mailp [data-a="pay"]'); if(!b)return false; b.click(); return MAIL.L.some(l=>l.kind==='PAYMENT'&&l.from===MAIL.mine.id); });
  rec('you paid your rent from the panel',paid,opened);
  // the payments travel: collected on the next round, sorted, delivered to city hall, banked when it reads at 9
  await passMidnight(); await hour(7.9); await hour(8.05); await hour(9.4); await hour(9.6); await carrierDone(); await passMidnight(); await hour(7.9); await hour(8.05); await hour(8.95); await hour(9.05); await hour(9.4); await hour(9.6); await carrierDone(); await hour(23.0); await passMidnight(); await hour(8.95); await hour(9.05);
  const tr1=await pg.evaluate(()=>CIVIC.ledger.treasury), banked=await pg.evaluate(()=>MAIL.L.filter(l=>l.kind==='PAYMENT'&&l.state==='read').length);
  rec('city hall banked the payments',banked>=2,banked+' read · treasury $'+tr0+' → $'+tr1);
  // the panel's write view
  await pg.evaluate(()=>{ document.querySelector('#mailp [data-v="write"]').click(); }); await pg.waitForTimeout(300); await pg.screenshot({path:OUT+'/mail_panel_write.png'});
  const nOpts=await pg.evaluate(()=>document.querySelectorAll('#mwto option').length); rec('you can write to every other address',nOpts===A.n-1,nOpts+' choices');
  // ---- the save over a reload
  const before=await pg.evaluate(()=>{ MAIL.save(); return {n:MAIL.L.length,cash:MAIL.you.cash,day:MAIL.day(),mine:MAIL.L.filter(l=>l.to===MAIL.mine.id).length}; });
  await up('&keepmail=1'); const after=await pg.evaluate(()=>({n:MAIL.L.length,cash:MAIL.you.cash,day:MAIL.day(),mine:MAIL.L.filter(l=>l.to===MAIL.mine.id).length}));
  rec('the mail kept over a reload',after.n>=before.n-1&&after.cash===before.cash&&after.mine>=before.mine&&after.day>=before.day,JSON.stringify(before)+' → '+JSON.stringify(after));
  const stats=await pg.evaluate(()=>MAILDBG()); console.log('the post now:',JSON.stringify(stats));
  await pg.evaluate(()=>{ const T=__dbg.cv().TILE, cb=MAIL.cboxes[0]; STORE.goTo(cb.x,cb.z+2.5*T,'up'); }); await pg.waitForTimeout(4000); await pg.screenshot({path:OUT+'/mail_collectionbox.png'});
  rec('no page errors',!Object.keys(errs).length,JSON.stringify(errs));
  await b.close(); process.exit(R.some(r=>!r[1])?1:0); })();
