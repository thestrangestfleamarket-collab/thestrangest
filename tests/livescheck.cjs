// NPC LIVES' CHECK (src/lives.js): node tests/livescheck.cjs [out] loads THE MARKET with ?lives=1 at one in the afternoon, then at seven in the
// evening, then at eleven at night: prints every character's state, his place and whether he's drawn, screenshots the street (out-13.png,
// out-19.png, out-23.png), and checks: no page errors; every character near you is still drawn (or hidden by the room you're in) and the near
// ones on the street still walk; the far ones' numbers move them. Then the clock run fast (a day in two minutes) for a minute: the places
// change, nobody's stuck, how many waypoints had to be skipped (LIVES.skips). Prints the cost: LIVES.tick's milliseconds a frame, and the
// picture's triangles and draw calls with every character forced near against the rule (far ones not drawn). Exits 1 on a failure
const {chromium}=require('playwright'); const out=process.argv[2]||'lives';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; }); pg.on('console',m=>{ if(m.type()==='error')console.log('console error:',m.text().slice(0,200)); });
  let bad=0; const fail=s=>{ bad++; console.log('FAIL: '+s); };
  const load=async h=>{ await pg.goto('file://'+process.cwd()+'/dist/market.html?lives=1&hour='+h,{waitUntil:'commit',timeout:180000});
    let up=false; for(let i=0;i<300&&!(up=await pg.evaluate(()=>!!window.__started&&!!window.LIVES&&LIVES.ready).catch(()=>false));i++)await pg.waitForTimeout(1000);
    if(!up){ fail('the page never started at hour '+h+' '+JSON.stringify(errs)); return false; } await pg.waitForTimeout(6000); return true; };
  const list=()=>pg.evaluate(()=>LIVES.dbg());
  const show=(h,L)=>{ console.log('--- hour '+h+': '+L.length+' characters, '+L.filter(r=>r.drawn).length+' drawn, '+L.filter(r=>r.far).length+' far');
    for(const r of L)console.log('  '+(r.key+'                ').slice(0,16)+' '+(r.state+'         ').slice(0,9)+' '+(r.place+'              ').slice(0,14)+' '+(r.drawn?'drawn':'-    ')+' '+r.lv+' '+r.x+','+r.z+' y'+r.y); };
  for(const h of [13,19,23]){ if(!await load(h))continue;
    if(h===13){ const P=await pg.evaluate(()=>LIVES.places()); console.log('places: '+P.map(p=>p.id+'('+p.lv+(p.door?'':', no door')+', '+p.path.length+' waypoints)').join(', '));
      // (each place's way in walked straight, waypoint to waypoint, by a villager: a leg a solid crosses is a mistake in the place's path)
      // (a leg below ground checked against the station's or the dungeon's solids: the stair's foot and beyond)
      const legs=await pg.evaluate(()=>{ const out=[], T=__dbg.cv().TILE; for(const p of LIVES.places()){ if(!p.door)continue; const w=[p.door,...p.path], N=__dbg.NPCS.find(n=>n.life); let lv='up';
        for(let k=1;k<w.length;k++){ lv=w[k].lv||'up'; const h=LIVES.legHit(N.key,w[k-1],w[k],lv); if(h)out.push(p.id+' leg '+k+' ('+lv+') at '+h.at.map(v=>+(v/T).toFixed(2))+' box '+h.box.map(v=>+(v/T).toFixed(2))); } } return out; });
      console.log('legs through a solid: '+(legs.length?legs.join('; '):'none')); if(legs.length>2)fail('a place\'s way in crosses solids: '+legs.join('; ')); }
    const A=await list(); await pg.waitForTimeout(6000); const B=await list(); show(h,B);
    const near=B.filter(r=>!r.far), lives=B.filter(r=>r.place!=='beat'&&r.place!=='platform');
    for(const r of near){ const vis=await pg.evaluate(i=>{ const N=__dbg.NPCS[i]; return N.g.visible||N._rh||N.mode==='hidden'||!N.g.parent.visible; },B.indexOf(r)); if(!vis)fail(r.key+' is near and not drawn at hour '+h); }   // (by his index: the troublemakers share the Rogue's key)
    const moved=B.filter(r=>{ const a=A.find(q=>q.key===r.key); return a&&Math.hypot(a.x-r.x,a.z-r.z)>.3; });
    console.log('moved over 6 s: '+moved.length+' ('+moved.filter(r=>r.far).length+' of them far): '+moved.map(r=>r.key).join(' '));
    if(!moved.some(r=>!r.far))fail('no near character walked at hour '+h); if(B.filter(r=>r.far).length>3&&!moved.some(r=>r.far))fail('no far character\'s numbers moved at hour '+h);
    if(h===23&&!lives.some(r=>r.state==='sleeping'))fail('nobody asleep at eleven at night');
    if(h===13&&!lives.some(r=>r.place!=='street'&&!/^to /.test(r.place)))fail('nobody at a place at one in the afternoon');
    await pg.evaluate(()=>__dbg.cam(null,null,9)); await pg.waitForTimeout(2500); await pg.screenshot({path:out+'-'+h+'.png'}); await pg.evaluate(()=>__dbg.cam(null,null,__dbg.cv().PPU));   // (the street from further out, then the view as it was)
    if(h===19){ // the cost: LIVES' time a frame; the picture with every character near against the rule
      const ms=await pg.evaluate(()=>({ms:+LIVES.ms.toFixed(3),step:+LIVES.stepMs.toFixed(3)}));
      const info=async f=>{ await pg.evaluate(f=>{ LIVES.force=f; },f); await pg.waitForTimeout(1500); return pg.evaluate(()=>new Promise(res=>{ const I=__dbg.renderer.info; I.autoReset=false; I.reset(); let n=0; const f=()=>{ if(++n<6)return requestAnimationFrame(f); const r={tri:Math.round(I.render.triangles/5),calls:Math.round(I.render.calls/5),far:__dbg.NPCS.filter(n=>n.far).length}; I.autoReset=true; res(r); }; requestAnimationFrame(f); })); };   // (the whole frame's: every pass, the shadow maps too, over five frames)
      const allNear=await info('near'), half=await info('half'), rule=await info(null);
      console.log('cost: LIVES.tick '+ms.ms+' ms a frame on average (a 4 Hz step '+ms.step+' ms); a frame all near: '+allNear.tri+' triangles, '+allNear.calls+' draw calls; every other one far ('+half.far+'): '+half.tri+' triangles, '+half.calls+' calls, saved '+(allNear.tri-half.tri)+' and '+(allNear.calls-half.calls)+'; by the rule ('+rule.far+' of '+(await list()).length+' far): '+rule.tri+' triangles, '+rule.calls+' calls; saved '+(allNear.tri-rule.tri)+' triangles, '+(allNear.calls-rule.calls)+' calls');
      // the clock run fast: a day in two minutes, a minute of it; the places change and nobody's stuck
      await pg.evaluate(()=>{ __dbg.CLOCK.speed=48; __dbg.CLOCK.run=true; }); const seen=new Set(); let skips=0;
      for(let k=0;k<12;k++){ await pg.waitForTimeout(5000); const L=await list(); for(const r of L)seen.add(r.key+':'+r.place.replace(/^to /,'')); skips=await pg.evaluate(()=>LIVES.skips); const hh=await pg.evaluate(()=>+__dbg.CLOCK.h.toFixed(1)); console.log('  '+hh+'h: '+L.filter(r=>/^to /.test(r.place)).length+' on their way, '+L.filter(r=>r.drawn).length+' drawn, skips '+skips); }
      const places={}; for(const s of seen){ const [k,p]=s.split(':'); (places[k]=places[k]||[]).push(p); }
      const multi=Object.values(places).filter(v=>v.length>1).length; console.log('over the fast day: '+multi+' characters were seen in more than one place; waypoints skipped (held up over eight seconds): '+skips);
      if(multi<5)fail('the day went by and only '+multi+' characters changed place'); if(skips>10)fail('too many waypoints skipped: '+skips+' (a route through a solid?)');
      await pg.evaluate(()=>{ __dbg.CLOCK.run=false; }); } }
  console.log('page errors',JSON.stringify(errs)); if(Object.keys(errs).length)bad++;
  console.log(bad?'FAIL: '+bad:'PASS'); await b.close(); process.exit(bad?1:0); })();
