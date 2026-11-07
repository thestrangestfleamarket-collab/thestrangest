// EVERY MOVE SHARED (owner, 7 Nov 2026: "make sure all players can see all other players moves and emotes, flying, dancing, etc. all moves and player actions shared in real time"):
// the website's own worker (wrangler dev) with two players logged in side by side; ALICE moves, emotes, dances, flies, fights, rides; BOB's page shows each on ALICE's body.
// Run: node tests/mmo.cjs (needs dist/g: python3 build.py; slow: software rendering)
const {chromium}=require('playwright'), {spawn}=require('child_process');
const PORT=8797, BASE='http://127.0.0.1:'+PORT;
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
(async()=>{
  const w=spawn('npx',['wrangler','dev','--port',String(PORT),'--ip','127.0.0.1','--var','DEV_AUTH:1','--show-interactive-dev-session=false'],{stdio:['ignore','pipe','pipe'],detached:true,env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
  let log=''; w.stdout.on('data',d=>log+=d); w.stderr.on('data',d=>log+=d);
  const quit=c=>{ try{ process.kill(-w.pid,'SIGKILL'); }catch(e){ try{ w.kill('SIGKILL'); }catch(_){} } process.exit(c); };   // (the worker's whole group: wrangler leaves workerd running otherwise) process.on('unhandledRejection',e=>{ console.log('FAIL '+String(e&&e.stack||e).slice(0,600)); quit(1); });
  let up=false; for(let i=0;i<120&&!up;i++){ await new Promise(r=>setTimeout(r,1000)); up=await fetch(BASE+'/').then(r=>r.ok).catch(()=>false); }
  if(!up){ console.log('FAIL: the worker never started\n'+log.slice(-2000)); quit(1); }
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}), errs=[];
  const open=async who=>{ const c=await b.newContext({viewport:{width:640,height:360}}); await c.addCookies([{name:'tsfm-pass',value:'dev:'+who,url:BASE}]); const p=await c.newPage(); p.on('pageerror',e=>errs.push(who+': '+e.message.slice(0,200)));
    await p.goto(BASE+'/?fresh=1&hour=13'); await p.waitForFunction(()=>window.__started&&window.ONLINE&&ONLINE.on,null,{timeout:400000}); return p; };
  const A=await open('alice'), B=await open('bob');
  for(const p of [A,B])await p.evaluate(()=>{ __dbg.UI.goTo(SHARED.BOD.XS(150),SHARED.BOD.ZS(-60),'up'); });
  // B's view of A: the one other player
  const seen=f=>B.evaluate(f=>{ const o=[...ONLINE.others.values()][0]; if(!o)return null; return (0,eval)('('+f+')')(o); },String(f));
  const until=async(f,ms=15000)=>{ const t0=Date.now(); let v; while(Date.now()-t0<ms){ v=await seen(f).catch(()=>null); if(v&&v.ok)return v; await B.waitForTimeout(400); } return v||{}; };
  await B.evaluate(()=>{ window.__in=[]; const f=ONLINE.feed; ONLINE.feed=m=>{ if(m&&/^(act|ps|trk|ride)$/.test(m.t))window.__in.push({...m,at:performance.now()}); return f(m); }; });
  const got=f=>B.evaluate(f=>window.__in.filter((0,eval)('('+f+')')).length,String(f));
  let r=await until(o=>({ok:o.s&&o.s.length>0,n:o.s&&o.s.length,name:o.name}),40000);
  ok(r.ok,'BOB sees ALICE on the street ('+JSON.stringify(r)+')');
  const ONLY=process.env.ONLY||''; if(ONLY==='skate')console.log('(only the skateboard part)');
  if(!ONLY){
  // walking: her position moves on his screen
  const at0=await seen(o=>{ const s=o.s[o.s.length-1]; return s&&[s.x,s.z]; });
  await A.evaluate(()=>{ __dbg.UI.goTo(SHARED.BOD.XS(156),SHARED.BOD.ZS(-60),'up'); });
  r=await until(new Function('o','const s=o.s[o.s.length-1]; return {ok:!!s&&Math.hypot(s.x-('+at0[0]+'),s.z-('+at0[1]+'))>3,at:s&&[s.x,s.z]};'));
  ok(r.at&&at0&&Math.hypot(r.at[0]-at0[0],r.at[1]-at0[1])>3,'she walks and he sees her move ('+JSON.stringify(at0)+' to '+JSON.stringify(r.at)+')');
  // emote, dance (the old clips and the avatar's own)
  for(const n of ['greet','dance','pf_Bop','sitGround']){
    const can=await A.evaluate(async n=>{ await MOTION.ensure(); return MOTION.play(n); },n).catch(e=>String(e));
    r=await until(new Function('o','return {ok:!!(o.S&&o.S.move&&/'+n+'/.test(o.S.move.name||""))||!!(o.S&&o.S.mc&&/'+n+'/.test(String(o.S.mc.n||o.S.mc))),move:o.S&&o.S.move&&o.S.move.name,mc:o.S&&o.S.mc&&(o.S.mc.n||String(o.S.mc))}'));
    ok(r.ok,'she plays '+n+' and he sees it ('+JSON.stringify({played:can,...r})+')');
    await A.evaluate(()=>MOTION.stop()); await A.waitForTimeout(600); }
  // flying
  await A.evaluate(()=>__dbg.UI.setFly(true));
  await A.evaluate(()=>{ window.__flyT=setInterval(()=>{ SHARED.py+=1; },100); });
  r=await until(o=>({ok:!!(o.S&&o.S.fly),fly:o.S&&o.S.fly,y:o.s[o.s.length-1]&&o.s[o.s.length-1].y,heard:window.__in.filter(m=>m.t==='ps'&&m.s&&m.s.fly).length}));
  ok(r.ok,'she flies and he sees her flying ('+JSON.stringify(r)+')');
  await A.evaluate(()=>{ clearInterval(window.__flyT); __dbg.UI.setFly(false); });
  // a punch and a kick (the keys)
  for(const [k,n] of [['j','punch'],['k','kick']]){
    await A.keyboard.down(k); await A.waitForTimeout(200); await A.keyboard.up(k);
    await A.waitForTimeout(1500); const g=await got('m=>m.t==="act"&&m.k==="'+k.toUpperCase()+'"&&m.on');
    ok(g>0,'she throws a '+n+' and it reaches him ('+g+' key moves)'); }
  // a jump
  await A.keyboard.down(' '); await A.waitForTimeout(150); await A.keyboard.up(' ');
  await A.waitForTimeout(1500); const gj=await got('m=>m.t==="act"&&m.k===" "&&m.on');
  ok(gj>0,'she jumps and it reaches him ('+gj+' jump key moves)');
  }
  // a skateboard and its tricks: the board under her and the ollie and kickflip on his screen
  await B.evaluate(()=>{ const h=ONLINE.hear.trk; window.__trk=[]; ONLINE.hear.trk=m=>{ window.__trk.push(m); if(h)h(m); }; });
  await A.evaluate(()=>{ window.__sent=[]; const f=ONLINE.send; ONLINE.send=m=>{ if(m&&m.t==='trk')window.__sent.push(m); return f(m); }; });
  const rode=await A.evaluate(async()=>{ FORAGE.give('skateboard'); for(let i=0;i<40&&!RIDE.kinds.skateboard;i++)await new Promise(r=>setTimeout(r,250)); WIELD.set('skateboard'); return RIDE.mount('skateboard')!==false&&RIDE.on==='skateboard'; });   // (held first, as a player does: a board you ride is the one in your hand)
  r=await until(o=>({ok:!!(window.RIDEDBG&&RIDEDBG().theirs.some(t=>t.b==='skateboard'))}),10000);
  ok(rode&&r.ok,'she gets on her skateboard and he sees her on it ('+JSON.stringify({rode,...r})+')');
  await A.keyboard.down('w'); await A.waitForTimeout(1500); await A.keyboard.down(' '); await A.waitForTimeout(450); await A.keyboard.up(' '); await A.waitForTimeout(60); await A.keyboard.down('j'); await A.waitForTimeout(120); await A.keyboard.up('j'); await A.waitForTimeout(1500); await A.keyboard.up('w');
  const T=await B.evaluate(()=>({n:window.__trk.length,s:[...new Set(window.__trk.map(m=>m.s))],fk:[...new Set(window.__trk.map(m=>m.fk).filter(Boolean))]}));
  const S=await A.evaluate(()=>({sent:window.__sent.length,s:[...new Set(window.__sent.map(m=>m.s))],fk:[...new Set(window.__sent.map(m=>m.fk).filter(Boolean))],rs:RIDE.s,on:RIDE.on,view:__dbg.UI.view}));
  console.log('ALICE sent',JSON.stringify(S));
  ok(T.s.includes('air'),'her ollie reaches his screen ('+JSON.stringify(T)+')');
  ok(T.fk.length>0,'and her flip ('+JSON.stringify(T.fk)+')');
  await A.evaluate(()=>RIDE.off&&RIDE.off());
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  console.log(bad?bad+' failed':'every shared move checked'); await b.close(); quit(bad?1:0); })();
