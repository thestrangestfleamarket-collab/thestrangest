// node tests/citysim.cjs <out folder>: the civic tower's droids called out by day (a fire by the tower, you fainting, a full can, a letter) and the town's walkers tracked for three minutes (each moved, the park visited, none stuck). The police check here sends a troublemaker by day, when they only live after dark: tests/policesim.cjs is the real one
// the civic droids and the town's walkers, played through: each service called, each walker tracked for being stuck
const {chromium}=require('playwright'); const S=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:900,height:600}}); const errs={};
  pg.on('pageerror',e=>{ errs[e.message.slice(0,160)]=(errs[e.message.slice(0,160)]||0)+1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12'); for(let i=0;i<200&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000); await pg.waitForTimeout(5000);
  const until=async(fn,ms)=>{ const t=Date.now(); while(Date.now()-t<ms){ if(await pg.evaluate(fn).catch(()=>false))return Date.now()-t; await pg.waitForTimeout(3000); } return -1; };
  const res=[]; const rec=(name,ok,info)=>{ res.push([name,ok,info]); console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); };
  rec('six droids at the tower',await pg.evaluate(()=>Object.keys(CIVIC.staff).length===6&&Object.values(CIVIC.staff).every(S=>S.N&&S.N.key.startsWith('civ_'))),await pg.evaluate(()=>Object.keys(CIVIC.staff).join(',')));
  // walkers: positions every 10 s for 3 minutes; stuck = going but moved < 1 tile in 30 s
  const track={}; const snap=async()=>{ const d=await pg.evaluate(()=>WALKDBG()); for(const w of d)(track[w.key]=track[w.key]||[]).push(w); return d; };
  // FIRE near the tower
  await pg.evaluate(()=>{ const t=CIVIC.tower, T=__dbg.cv().TILE; CIVIC.fire({x:(t.x0+t.x1)/2+6*T,z:t.z0-6*T,what:'sim fire'}); });
  let jetSeen=false; const t0=Date.now(); let out=-1;
  while(Date.now()-t0<240000){ await snap(); const s=await pg.evaluate(()=>({jet:CIVIC.jet.me.count,out:CIVIC.fires.every(f=>f.out)||!CIVIC.fires.length})); if(s.jet>0)jetSeen=true; if(s.out){ out=Date.now()-t0; break; } await pg.waitForTimeout(5000); }
  rec('fire droid puts the fire out with water',out>=0&&jetSeen,'out after '+(out/1000).toFixed(0)+' s, jet seen '+jetSeen);
  rec('fire droid goes home',await until(()=>CIVIC.staff.fire1.state==='free',180000)>=0);
  // MEDIC: you faint near the tower
  await pg.evaluate(()=>{ const t=CIVIC.tower, T=__dbg.cv().TILE; STORE.goTo((t.x0+t.x1)/2-8*T,t.z0-5*T,'up'); }); await pg.waitForTimeout(2000); await pg.evaluate(()=>CIVIC.tryFaint());
  let beam=false; const tm=Date.now(); let med=-1; while(Date.now()-tm<240000){ await snap(); const s=await pg.evaluate(()=>({b:CIVIC.beam.visible,ok:CIVIC.log.some(e=>/brought you round/.test(e.what))})); if(s.b)beam=true; if(s.ok){ med=Date.now()-tm; break; } await pg.waitForTimeout(2000); }
  rec('medic droid brings you round',med>=0,'after '+(med/1000).toFixed(0)+' s, beam seen '+beam);
  // WORKS: a full can; MAIL: a letter and the round
  await pg.evaluate(()=>CIVIC.tryCan()); const wk=await until(()=>CIVIC.cans[0].fill===0&&CITY.open('trash').length===0,300000); rec('works droid empties a can',wk>=0,'after '+(wk/1000).toFixed(0)+' s');
  await pg.evaluate(()=>{ CIVIC.send('you','SIM','HELLO','test'); CITY.setHour(9.4); }); await pg.waitForTimeout(1500); await pg.evaluate(()=>CITY.setHour(9.6));
  const ml=await until(()=>CIVIC.box('you').length>0,300000); rec('mail droid delivers your letter',ml>=0,'after '+(ml/1000).toFixed(0)+' s');
  // POLICE: a troublemaker by hand if the guards' code allows
  const pol=await pg.evaluate(()=>{ const TR=window.GUARDX&&GUARDX.TROUBLE; if(!TR||!TR.length)return 'no troublemaker to send'; const t=TR[0], P=CIVIC.staff.officer1.N; t.mode='come'; t.st.x=P.st.x+3*__dbg.cv().TILE; t.st.z=P.st.z; t.g.visible=true; return 'sent'; });
  let pl=-1; if(pol==='sent')pl=await until(()=>CIVIC.log.some(e=>/POLICE DROID/.test(e.what)),180000); rec('police droid answers a troublemaker',pl>=0,pol+(pl>=0?', after '+(pl/1000).toFixed(0)+' s':''));
  // walkers' report
  await snap(); const keys=Object.keys(track); let stuck=[], kinds={}, parks=0;
  for(const k of keys){ const a=track[k]; kinds[a[0].kind]=(kinds[a[0].kind]||0)+1; if(a.some(w=>w.park))parks++;
    for(let i=0;i+3<a.length;i++){ const p=a[i], q=a[i+3]; if(p.state==='going'&&q.state==='going'&&Math.hypot(p.x-q.x,p.y-q.y)<1){ stuck.push(k+'@'+p.x+','+p.y); break; } } }
  const moved=keys.filter(k=>{ const a=track[k]; return Math.hypot(a[0].x-a[a.length-1].x,a[0].y-a[a.length-1].y)>5; }).length;
  rec('walkers: every one moved over 5 tiles',moved===keys.length,moved+' of '+keys.length+' · kinds '+JSON.stringify(kinds));
  rec('walkers: some went into the park',parks>=3,parks+' visited it');
  rec('walkers: none stuck on the way',stuck.length===0,stuck.join(' '));
  const st=await pg.evaluate(()=>{ const s={}; for(const w of WALKDBG())s[w.state]=(s[w.state]||0)+1; return s; }); console.log('walker states now',JSON.stringify(st));
  rec('no page errors',!Object.keys(errs).length,JSON.stringify(errs));
  await pg.screenshot({path:S+'/citysim.png'}); await b.close(); process.exit(res.some(r=>!r[1])?1:0); })();
