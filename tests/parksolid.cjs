// THE PARK'S THINGS ARE SOLID: benches, rails, bins and lamps stop you; you can sit on a bench and stay sat; the playground is gone: node tests/parksolid.cjs dist/market.html
const {chromium}=require('playwright'), page=process.argv[2]||'dist/market.html';
(async()=>{ const b=await chromium.launch({...(process.env.PWEXE?{executablePath:process.env.PWEXE}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:640}}); const errs=[];
  pg.on('pageerror',e=>{ errs.push(e.message); console.log('pageerror:',e.message); });
  await pg.goto('file://'+require('path').resolve(page)+'?hour=12&fresh=1&at=100,40',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<480;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started&&!!window.PARKPFDBG&&PARKPFDBG().done&&!!(window.FOUNT&&FOUNT.bedAt)).catch(()=>false))break; } await pg.waitForTimeout(3000);
  const D=await pg.evaluate(()=>PARKPFDBG()); console.log('park',JSON.stringify({things:D.things,solids:D.solids,seats:D.seats,skipped:D.skipped.length}));
  if(!(D.solids>600))errs.push('too few solids: '+D.solids); if(!(D.seats>=30))errs.push('too few seats: '+D.seats);   // 37 park benches since the owner's halving (9 Nov 2026)
  const C=await pg.evaluate(()=>PARKPFCHK()); console.log('check',JSON.stringify(C)); if(C.mallBlocked)errs.push('the mall is blocked');
  const R=await pg.evaluate(async()=>{ const U=__dbg.UI, th=U.things.find(t=>t.name==='BENCH'), p=th.obj.position;
    const out={}; U.goTo(p.x+2.5,p.z,'up'); await new Promise(r=>setTimeout(r,800)); out.inside=SHARED.solids.some(s=>p.x>s[0]&&p.x<s[2]&&p.z>s[1]&&p.z<s[3]);
    SHARED.target=p.clone(); await new Promise(r=>setTimeout(r,500)); th.act(); await new Promise(r=>setTimeout(r,1500)); const q=USE.test.pos(); out.sat=!!USE.test.sit(); out.seat=!!USE.seat;   // sat down from a walk (owner, 9 Nov 2026: his stride slid him off the bench)
    await new Promise(r=>setTimeout(r,4000)); const q2=USE.test.pos(); out.stays=!!USE.test.sit()&&!!USE.seat&&Math.hypot(q2[0]-q[0],q2[2]-q[2])<.05; return out; }).catch(e=>({err:String(e)}));
  console.log('bench',JSON.stringify(R)); if(!R.inside)errs.push('a bench is not solid'); if(!R.sat)errs.push('could not sit on a bench'); if(!R.stays)errs.push('slid off the bench');
  await b.close(); if(errs.length){ console.log('FAIL',errs.join(' | ')); process.exit(1); } console.log('ok'); })();
