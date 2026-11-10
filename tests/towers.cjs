// THE WATCHTOWERS (owner, 10 Nov 2026: "remove the castle from the park completely ... watchtowers spread out ... the tiny woodland guards live in the towers and watch on top. 6 towers total"): the castle is gone, the stair down to the dungeon stays in its clearing, six towers stand, each guard is at its tower (on its roof, or at the stair tower's foot): node tests/towers.cjs dist/market.html
const {chromium}=require('playwright'), page=process.argv[2]||'dist/market.html';
(async()=>{ const b=await chromium.launch({...(process.env.PWEXE?{executablePath:process.env.PWEXE}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1000,height:640}}); const errs=[];
  pg.on('pageerror',e=>{ errs.push(e.message); console.log('pageerror:',e.message); });
  await pg.goto('file://'+require('path').resolve(page)+'?fresh=1&npcwait=99&hour=12&place=the dungeon stair',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<300;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started&&window.GTOWER&&GTOWER.ready&&window.GUARD&&GUARD.list&&GUARD.list.length).catch(()=>false))break; } await pg.waitForTimeout(6000);
  const R=await pg.evaluate(()=>{ const ids=GTOWER.IDS, at=ids.map(k=>GTOWER.at(k)), T=__dbg.cv().TILE, names=[]; __scene.traverse(o=>{ if(/castle (spires|torches)/.test(o.name))names.push(o.name); });
    const ways=window.LEVELS?LEVELS.ways.find(w=>w.id==='castle stairs'):null, G=GUARD.list.map(N=>{ const t=GTOWER.at(N.gd.tower); return {k:N.key,tower:N.gd.tower,top:!!N.gd.top,d:t?Math.hypot(N.st.x-t.x,N.st.z-t.z)/T:null,y:N.g.position.y,roof:t?t.top:null}; });
    return {at:at.map(a=>!!a),names,ways:!!ways,torches:__dbg.MAPK.MODS.castleTorches||0,G}; });
  const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)errs.push(m); };
  ok(R.at.every(Boolean)&&R.at.length===6,'six watchtowers stand ('+R.at.filter(Boolean).length+')');
  ok(!R.names.length&&!R.torches,'the castle is gone: no spires, no torches ('+R.names.join(', ')+')');
  ok(R.ways,'the stair down to the dungeon is still a way between the park and the dungeon');
  const top=R.G.filter(g=>g.top), foot=R.G.filter(g=>!g.top);
  ok(R.G.length===14&&R.G.every(g=>g.d!=null&&g.d<6),'every guard is at its tower ('+R.G.map(g=>g.k.replace('gd_','')+':'+g.tower+(g.d!=null?'@'+g.d.toFixed(1):'')).join(' ')+')');
  ok(top.length>=10&&top.every(g=>Math.abs(g.y-g.roof)<.05*Math.abs(g.roof)+.01),'the guards on the roofs stand on them ('+top.map(g=>g.y.toFixed(2)+'/'+g.roof.toFixed(2)).join(' ')+'; '+top.length+' up, '+foot.length+' at the stair tower\'s foot)');
  ok(!errs.filter(e=>!/^the /.test(e)&&!/^every|^six|^no /.test(e)).length,'no page errors');
  console.log(errs.length?errs.length+' failed':'all tower checks passed'); await b.close(); process.exit(errs.length?1:0); })();
