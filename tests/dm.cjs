// THE DUNGEON MASTER: node tests/dm.cjs dist/market.html [shots dir]. The dungeon starts empty; Shift+Y opens the panel; creatures of every group put in from it, set up, tried: drawn with their own bodies, sizes and behaviours, fighting you; a new room laid out and walked into.
const {chromium}=require('playwright'), path=require('path'), page=process.argv[2]||'dist/market.html', SH=process.argv[3]||'';
const fails=[], ok=(c,m)=>{ if(!c){ fails.push(m); console.log((process.env.GITHUB_ACTIONS?'::error title=dm::':'FAIL ')+m); } else console.log('ok   '+m); };
(async()=>{ const b=await chromium.launch({...(process.env.PWEXE?{executablePath:process.env.PWEXE}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1100,height:700},deviceScaleFactor:SH?2:1}), errs=[];
  pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(/dungeon body|chunk .* not loaded/.test(m.text()))errs.push(m.text()); });
  await pg.goto('file://'+path.resolve(page)+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.evaluate(()=>DUNGEON.go(1)); await pg.waitForFunction(()=>DUNDBG().objs>0&&!DUNDBG().busy&&window.DUNMOBS&&DUNMOBS.MS.g,null,{timeout:240000}); await pg.waitForTimeout(3000);
  const A=await pg.evaluate(()=>({m:DUNMOBS.MS.m.length,sl:DUNMOBDBG().slimes.length,cb:DUNMOBDBG().cb.length}));
  ok(A.m===0&&A.sl===0&&A.cb===0,'the dungeon starts with no creatures '+JSON.stringify(A));
  await pg.evaluate(()=>__dbg.UI.setView('third')); await pg.keyboard.press('Shift+Y'); await pg.waitForFunction(()=>window.DM&&DM.open&&DM.P&&!DM.P.hidden,null,{timeout:60000});
  ok(true,'Shift+Y opens the dungeon master');
  const G=await pg.evaluate(()=>{ DM.P.querySelector('[data-tab="mobs"]').click(); return [...DM.P.querySelectorAll('[data-grp]')].map(b=>b.dataset.grp); });
  ok(['SLIMES','CREATURES','ANIMALS','DINOSAURS','BUGS','PAWNS'].every(g=>G.includes(g)),'every group of bodies to pick from '+G.join(','));
  // one of each kind of body, beside you, set up from the panel's own buttons and fields
  const PUT=[['SLIMES','s:red'],['CREATURES','cr:Spider'],['ANIMALS','fa:Bear'],['DINOSAURS','fa:Raptor'],['PAWNS','pw:skeleton_guard_heavy'],['PAWNS','pw:golem'],['PAWNS','pw:ogre_mage']];
  for(const [i,[g,id]] of PUT.entries()){ await pg.evaluate(([g,id,i])=>{ const P=DM.P, c=s=>P.querySelector(s).click(); c('[data-tab="mobs"]'); c('[data-grp="'+g+'"]'); c('[data-pick="'+id+'"]');
      const H=SHARED.heading; SHARED.heading=H+(i-3)*.42; c('#dmfeet'); SHARED.heading=H; },[g,id,i]); }
  const N=await pg.evaluate(()=>DM.draft.mobs.map(e=>e.key));
  ok(N.length===PUT.length,'each one put in beside you '+N.join(','));
  await pg.evaluate(()=>{ const P=DM.P, e=DM.draft.mobs.find(q=>q.key==='fa:Bear'); DM.sel=e; DM.tab='props'; DM.show(); const set=(k,v)=>{ const f=P.querySelector('[data-k="'+k+'"]'); if(f.type==='checkbox')f.checked=!!v; else f.value=v; f.dispatchEvent(new Event('change',{bubbles:true})); };
    set('name','THE CAVE BEAR'); set('hp',20); set('size',1.6); set('beh','guard'); set('n',2); });
  const E=await pg.evaluate(()=>DM.draft.mobs.find(q=>q.key==='fa:Bear'));
  ok(E.name==='THE CAVE BEAR'&&E.hp===20&&E.size===1.6&&E.beh==='guard'&&E.n===2,'its properties set from the panel '+JSON.stringify({n:E.name,hp:E.hp,size:E.size,beh:E.beh,count:E.n}));
  if(SH)await pg.screenshot({path:path.join(SH,'dm-panel.png')});
  await pg.evaluate(()=>DM.P.querySelector('#dmtry').click()); await pg.waitForTimeout(6000);
  const T=await pg.evaluate(()=>{ const D=DUNMOBDBG(); return {m:DUNMOBS.MS.m.length,sl:D.slimes.length,cb:D.cb.sort(),trying:!!DUNMOBS.trying}; });
  ok(T.trying&&T.m===8&&T.sl===1&&['fa:Bear','fa:Raptor','cr:Spider','pw:skeleton_guard_heavy','pw:golem','pw:ogre_mage'].every(k=>T.cb.includes(k)),'TRY IT: every one stands in the dungeon with its own body '+JSON.stringify(T));
  const big=await pg.evaluate(()=>{ const r=[...DUNMOBS.MS.m].find(m=>m.key==='fa:Bear'); return r&&r.mhp; }); ok(big===20,'the bear as set: 20 health');
  const V0=await pg.evaluate(()=>__dbg.VIT.hp); let V1=V0; for(let i=0;i<40&&V1>=V0;i++){ await pg.waitForTimeout(1000); V1=await pg.evaluate(()=>__dbg.VIT.hp); }
  ok(V1<V0,'they fight you ('+V0.toFixed(2)+' → '+V1.toFixed(2)+')');
  if(SH){ await pg.evaluate(()=>{ DM.toggle(false); __dbg.VIT.hp=1; }); await pg.waitForTimeout(1500); await pg.screenshot({path:path.join(SH,'dm-creatures.png')}); await pg.evaluate(()=>DM.toggle(true)); await pg.waitForTimeout(800); }
  // the layout: a new room joined by a corridor, tried, walked into
  const L=await pg.evaluate(async()=>{ const d=DM.draft, n0=d.map.length, W=Math.max(...d.map.map(q=>q[3])); d.map.push(['',W,6,W+6,10,.3,1],['THE DM ROOM',W+6,0,W+20,16,.6,0]); DM.show();
    DM.P.querySelector('#dmtry').click(); await new Promise(r=>setTimeout(r,4000)); const D=__dbg.MAPK.MODS.dungeon, k=D.rooms.length, R=D.lay(k).R;
    __dbg.UI.goTo(SHARED.BOD.XS((R.x0+R.x1)/2),SHARED.BOD.ZS((R.y0+R.y1)/2),'down'); await new Promise(r=>setTimeout(r,1500)); return {n0,n:k,room:D.room,name:D.lay(k).nm,objs:DUNDBG().objs}; });
  ok(L.n===L.n0+2&&L.room===L.n&&L.name==='THE DM ROOM','a new room laid out, built and walked into '+JSON.stringify(L));
  if(SH){ await pg.evaluate(()=>{ DM.tab='layout'; DM.room=DM.draft.map.length; DM.show(); }); await pg.waitForTimeout(800); await pg.screenshot({path:path.join(SH,'dm-layout.png')}); }
  await pg.evaluate(()=>DM.P.querySelector('#dmstop').click()); await pg.waitForTimeout(4000);
  const S=await pg.evaluate(()=>({m:DUNMOBS.MS.m.length,rooms:__dbg.MAPK.MODS.dungeon.rooms.length,trying:!!DUNMOBS.trying}));
  ok(!S.trying&&S.m===0&&S.rooms===26,'STOP TRYING: back to the published dungeon (empty, the built-in layout) '+JSON.stringify(S));
  ok(!errs.length,'no page errors '+errs.slice(0,3).join(' | '));
  await b.close(); console.log(fails.length?fails.length+' FAILED':'all dungeon master checks passed'); process.exit(fails.length?1:0); })();
