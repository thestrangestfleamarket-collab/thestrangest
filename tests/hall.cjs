// YOUR FRONT DOOR AND THE CALLBOX (150n-callbox.js): no hall, stairs or lift; your front door takes you out to the stoop; no mailbox or notice board in it (owner, 13 Nov 2026); the callbox on the street lists you, rings a neighbour, and the buzzer answers. node tests/hall.cjs [dist/market.html] [shots-dir]
const {chromium}=require('playwright'), SHOTS=process.argv[3];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:900,height:620}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+require('path').resolve(process.argv[2]||'dist/market.html')+'?npcwait=99&hour=13&fresh=1',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(3000);
  const fails=[], ok=(c,m)=>{ if(!c)fails.push(m); console.log((c?'ok  ':'FAIL')+' '+m); }, until=async(f,n=120)=>{ for(let i=0;i<n;i++){ if(await pg.evaluate(f).catch(()=>false))return true; await pg.waitForTimeout(500); } return false; }, clear=()=>until(()=>{ const f=document.getElementById('subfade'); return !f||f.style.opacity!=='1'; });
  await until(()=>HALLDBG().things.includes('CALLBOX'));
  let d=await pg.evaluate(()=>HALLDBG()); ok(d.things.includes('CALLBOX'),'a callbox hangs by the house\'s street door');
  if(SHOTS){ await pg.evaluate(()=>{ const c=CALLBOX.at, h=HOUSEAT(3.2); __dbg.ui().goTo(h[0]+(c[0]-HOUSEAT(0)[0]),h[1],c[1]-1.35); __dbg.ui().setView('first'); __dbg.face(APTSDBG?Math.atan2(c[0]-pos0()[0],c[2]-pos0()[1]):0); function pos0(){ return APTSDBG().pos; } }).catch(()=>{}); await pg.waitForTimeout(6000); await pg.screenshot({path:SHOTS+'/callbox-street.png'}); }
  // the callbox: it opens with you on it; ringing sends the ask; no answer, yes and no
  d=await pg.evaluate(async()=>{ const sent=[]; ONLINE.on=true; ONLINE.send=m=>{ if(m.t==='ring')sent.push(m); }; ONLINE.visit=(id,n)=>{ window.__visit=[id,n]; }; HALLDBG().use('CALLBOX'); await new Promise(r=>setTimeout(r,400));
    const you=/\(YOU\)/.test(document.getElementById('callbox').textContent), go=!!document.querySelector('#callbox [data-a=in]'); CALLBOX.ringTo('n1','Mira'); const ringing=HALLDBG().ring; ONLINE.hear.ring({op:'no',from:'n1'}); const afterNo=HALLDBG().ring;
    CALLBOX.ringTo('n2','Otis'); ONLINE.hear.ring({op:'yes',from:'n2'}); return {panel:true,you,go,sent,ringing,afterNo,visit:window.__visit,open:HALLDBG().panel}; });
  ok(d.you&&d.go,'the callbox lists you with GO IN');
  ok(d.sent.length===2&&d.sent[0].t==='ring'&&d.sent[0].op==='ask'&&d.sent[0].to==='n1'&&d.ringing==='n1'&&d.afterNo===null,'RING asks the neighbour through the block; NOT NOW ends it ('+JSON.stringify(d.sent[0])+')');
  ok(d.visit&&d.visit[0]==='n2'&&!d.open,'buzzed in, you go to their flat and the callbox closes ('+JSON.stringify(d.visit)+')');
  d=await pg.evaluate(()=>{ const sent=[]; ONLINE.send=m=>{ if(m.t==='ring')sent.push(m); }; ONLINE.hear.ring({op:'ask',from:'n3',name:'June'}); const up=HALLDBG().buzzer, txt=document.getElementById('buzzer').textContent; document.querySelector('#buzzer [data-a=yes]').click(); return {up,txt,sent,down:!HALLDBG().buzzer}; });
  ok(d.up&&/JUNE IS AT YOUR DOOR/.test(d.txt)&&d.sent[0]&&d.sent[0].op==='yes'&&d.sent[0].to==='n3'&&d.down,'your buzzer says who is at the door; LET IN answers yes ('+JSON.stringify(d.sent[0])+')');
  // inside: no hall; the front door, no mailbox or notice board
  await pg.evaluate(()=>window.ENTERAPT()); await until(()=>HALLDBG().real&&HALLDBG().built&&HALLDBG().things.includes('FRONT DOOR')); await clear(); await pg.waitForTimeout(1500);
  d=await pg.evaluate(()=>HALLDBG());
  ok(d.real&&d.things.includes('FRONT DOOR')&&!d.things.includes('YOUR MAILBOX')&&!d.things.includes('THE NOTICE BOARD'),'in your flat: the front door, no mailbox or notice board (owner, 13 Nov 2026) ('+d.things.join(', ')+')');
  ok(!d.things.includes('ELEVATOR')&&!d.things.includes('STAIRS DOWN TO THE STREET'),'no lift and no stairs');
  if(SHOTS){ await pg.evaluate(()=>{ __dbg.ui().setView('first'); __dbg.face(Math.PI); }); await pg.waitForTimeout(6000); await pg.screenshot({path:SHOTS+'/frontdoor-inside.png'}); }
  await pg.evaluate(()=>HALLDBG().use('FRONT DOOR')); await until(()=>!HALLDBG().real); await clear(); await pg.waitForTimeout(1000);
  d=await pg.evaluate(()=>({real:HALLDBG().real,apt:APTSDBG(),home:window.HOUSEAT(.9)}));
  ok(!d.real&&Math.hypot(d.apt.pos[0]-d.home[0],d.apt.pos[1]-d.home[1])<3,'your front door takes you out to the stoop ('+d.apt.pos+' vs '+d.home.map(v=>+v.toFixed(1))+')');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  await b.close(); console.log(fails.length?fails.length+' failed':'hall: all good'); process.exit(fails.length?1:0); })();
