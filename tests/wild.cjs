// THE PARK'S CREATURES (087-npc-creatures, 144f-wild): real sizes, the wasps leave their nest by day, spiders in their own webs, frogs by the pond dive when you come near, bats out only at night, and watching one logs it in the journal.   node tests/wild.cjs
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:900,height:600}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; if(errs[e.message]===1)console.log('pageerror:',e.message); });
  let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=14&fresh=1',{timeout:180000});
  await pg.waitForFunction(()=>window.__started&&window.CREATS&&CREATS.length>20,null,{timeout:180000});
  await pg.evaluate(async()=>{ const U=async(f,ms=200000)=>{ for(const t=Date.now();Date.now()-t<ms;await new Promise(r=>setTimeout(r,250)))if(f())return true; return false; }; const B=__dbg.MAPK.BOD, P=PARK; STORE.goTo(B.XS(P.round[0]+(P.ox||0)+3),B.ZS(P.round[1]+(P.oy||0)+3),'up'); await U(()=>PARK.ready&&PARK.in&&!(window.FADE&&FADE.busy)); WX.hold='CLEAR'; DN.set('day'); });
  await pg.waitForFunction(()=>CREATS.nest&&CREATS.filter(N=>N.wild&&N.wild.set).length>=27,null,{timeout:120000,polling:1000}).catch(()=>{});
  const E=f=>pg.evaluate(f), go=(x,z)=>E(`STORE.goTo(${x},${z},'up')`);
  const size=await E(()=>{ const WU=__dbg.cv().TILE/.84, o={}; for(const N of CREATS){ const k=N.key.replace(/#?\d+$/,''); o[k]=Math.max(o[k]||0,N.H/WU); } return o; });
  console.log('heights (m)',JSON.stringify(size));
  ok(size.wasp<.04&&size.spider<.03&&size.frog<.08&&size.rat<.12&&size.bat<.15&&size.snake<.08,'every creature at its real size');
  const webs=await E(()=>CREATS.filter(N=>N.key.startsWith('spider')).map(N=>N.web&&N.web.x.toFixed(1)+','+N.web.z.toFixed(1)+','+N.web.y.toFixed(1)));
  ok(webs.every(Boolean)&&new Set(webs).size===webs.length,'every spider in its own web ('+webs.length+')');
  const nest=await E(()=>CREATS.nest&&{x:CREATS.nest.x,z:CREATS.nest.z}); const trees=await E(()=>((window.PARK&&PARK.trees)||[]).length); ok(!!nest||!trees,'the wasps have a nest (none without the park trees)');
  if(nest){ await go(nest.x+2,nest.z+2); await E(()=>{ for(const N of CREATS)if(N.key.startsWith('wasp'))N.wild.c=0; }); let out=0; for(let i=0;i<30&&!out;i++){ await pg.waitForTimeout(1000); out=await E(()=>CREATS.filter(N=>N.key.startsWith('wasp')&&/go|hover/.test(N.wild.mode)).length); }
    ok(out>0,'wasps leave the nest for food by day'); }
  const fr=await E(()=>{ const P=POND, F=CREATS.filter(N=>N.key.startsWith('frog')); return {d:F.map(N=>Math.hypot(N.st.x-P.c.x,N.st.z-P.c.z)-P.r),x:F[0].st.x,z:F[0].st.z,WU:__dbg.cv().TILE/.84}; });
  ok(fr.d.every(d=>d>-.2*fr.WU&&d<2.5*fr.WU),'frogs sit by the pond');
  await go(fr.x+5*fr.WU,fr.z); await pg.waitForTimeout(3000);
  await E(`(()=>{ const N=CREATS.find(N=>N.key.startsWith('frog')); STORE.goTo(N.st.x+.8*${fr.WU},N.st.z,'up'); })()`);
  let dived=false; for(let i=0;i<10&&!dived;i++){ await pg.waitForTimeout(1000); dived=await E(()=>{ const N=CREATS.find(N=>N.key.startsWith('frog')); return N.st.inT!=null||!!N.st.goIn; }); }
  ok(dived,'a frog dives when you come near');
  const watched=await E(async()=>{ const T=__dbg.cv().TILE, N=CREATS.find(N=>N.key.startsWith('spider')&&N.web); STORE.goTo(N.st.x+2.5*T,N.st.z,'up'); for(let t=0;t<60&&WILDDBG().spd>.05;t++)await new Promise(r=>setTimeout(r,500)); WILD.watch(N); for(let t=0;t<12;t++){ WILD.ff(1); if(WILDDBG().seen.spider)return true; await new Promise(r=>setTimeout(r,1000)); } return JSON.stringify(WILDDBG()); });
  ok(watched===true,'watching a spider logs it in the journal ('+watched+')');
  const sq=await E(()=>SQDBG2()); ok(sq.built&&sq.n===6&&sq.shown||!trees,'six grey squirrels about the park trees by day: '+JSON.stringify(sq));
  const day=await E(()=>CREATS.filter(N=>N.key.startsWith('bat')).filter(N=>N.body.visible&&!N.far).length); ok(day===0,'no bats by day');
  await E(()=>{ DN.set('night'); }); const hub=await E(()=>({x:POND.c.x,z:POND.c.z})); await go(hub.x,hub.z+4);
  let bats=[]; for(let i=0;i<20&&!bats.some(b=>b[0]&&b[1]>2);i++){ await pg.waitForTimeout(1000); bats=await E(()=>{ const WU=__dbg.cv().TILE/.84; return CREATS.filter(N=>N.key.startsWith('bat')&&!N.far).map(N=>[N.body.visible,N.wild.hy/WU]); }); }
  console.log('bats',JSON.stringify(bats)); ok(bats.some(b=>b[0]&&b[1]>2),'bats hunt high at night');
  const wn=await E(()=>CREATS.filter(N=>N.key.startsWith('wasp')&&!N.far&&!/home|in/.test(N.wild.mode)).length); ok(wn===0,'wasps go home at night');
  const ff=await E(async()=>{ for(let t=0;t<30&&!(FFLYDBG().built&&FFLYDBG().shown);t++)await new Promise(r=>setTimeout(r,500)); const o={d:FFLYDBG()}; FORAGE.S.sk.ento=1000; FORAGE.give('jar_s',1);
    const th=__dbg.UI.things.find(t=>t.name==='FIREFLIES'); STORE.goTo(th.obj.position.x+T0(),th.obj.position.z,'up'); await new Promise(r=>setTimeout(r,2500)); th.act(); o.jar=FORAGE.has('jar_fly'); o.seen=WILD.seen('firefly');
    for(let t=0;t<20&&!FFLYDBG().lamp;t++)await new Promise(r=>setTimeout(r,500)); o.lamp=FFLYDBG().lamp; DN.set('day'); for(let t=0;t<30&&FORAGE.has('jar_fly');t++)await new Promise(r=>setTimeout(r,500)); o.after=FORAGE.has('jar_fly'); o.back=FORAGE.has('jar_s'); return o;
    function T0(){ return __dbg.cv().TILE; } });
  console.log('fireflies',JSON.stringify(ff));
  const fz=await E(async()=>{ const th=__dbg.UI.things.find(t=>t.name==='FIREFLIES'), T=__dbg.cv().TILE, at=(y)=>{ STORE.goTo(th.obj.position.x+2*T,th.obj.position.z,y); }; at('up'); await new Promise(r=>setTimeout(r,2500)); const iso=FFLYDBG().size; __dbg.UI.setView('third'); await new Promise(r=>setTimeout(r,4000)); const close=FFLYDBG().size; __dbg.UI.setView('iso'); return {iso,close}; });
  ok(fz.iso<4&&fz.close<=5&&fz.close>=1,'fireflies are specks a few centimetres across, not big fixed dots from the overhead view (owner, 8 Nov 2026): '+JSON.stringify(fz)); ok(ff.d.built&&ff.d.shown&&ff.jar===1&&ff.seen>0&&ff.lamp&&ff.after===0&&ff.back>=1,'fireflies blink at night; a jar of them glows while you carry it and lets them go at dawn');
  ok(!Object.keys(errs).length,'no page errors '+JSON.stringify(errs));
  await b.close(); process.exit(bad?1:0); })();
