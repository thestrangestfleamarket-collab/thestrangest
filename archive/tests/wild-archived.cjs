// THE WILD CHECK'S LINES FOR CREATURES NO LONGER IN THE PARK (owner, 10 Nov 2026: "Archive those lines"): the wasps, spiders, frogs and bats went to the pet shops (8 Nov 2026), so tests/wild.cjs no longer asks for them.
// Put these back into tests/wild.cjs (before its squirrels line) when they live in the park again.
  ok(size.wasp<.04&&size.spider<.03&&size.frog<.08&&size.bat<.15&&size.snake<.08,'every creature at its real size');
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
  const day=await E(()=>CREATS.filter(N=>N.key.startsWith('bat')).filter(N=>N.body.visible&&!N.far).length); ok(day===0,'no bats by day');
  await E(()=>{ DN.set('night'); }); const hub=await E(()=>({x:POND.c.x,z:POND.c.z})); await go(hub.x,hub.z+4);
  let bats=[]; for(let i=0;i<20&&!bats.some(b=>b[0]&&b[1]>2);i++){ await pg.waitForTimeout(1000); bats=await E(()=>{ const WU=__dbg.cv().TILE/.84; return CREATS.filter(N=>N.key.startsWith('bat')&&!N.far).map(N=>[N.body.visible,N.wild.hy/WU]); }); }
  console.log('bats',JSON.stringify(bats)); ok(bats.some(b=>b[0]&&b[1]>2),'bats hunt high at night');
  const wn=await E(()=>CREATS.filter(N=>N.key.startsWith('wasp')&&!N.far&&!/home|in/.test(N.wild.mode)).length); ok(wn===0,'wasps go home at night');
