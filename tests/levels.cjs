// THE LEVELS CHECK: node tests/levels.cjs [out-dir]. Stands on the street, the subway platform and the dungeon's first level, and fails if
// anything drawn there lies outside that level (a street building over the station, a plant in the dark), or if the subway stairs show above the station's ceiling.
const {chromium}=require('playwright'), path=require('path'), out=process.argv[2]||'.';
const fails=[], ok=(c,m)=>{ if(!c){ fails.push(m); console.log((process.env.GITHUB_ACTIONS?'::error title=levels::':'FAIL ')+m); } else console.log('ok   '+m); };
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:1000,height:700}}), errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,300)));
  await pg.goto('file://'+path.resolve('dist/market.html')+'?fresh=1&hour=21'); await pg.waitForFunction(()=>window.__started,null,{timeout:300000}); await pg.waitForTimeout(3000);
  const until=(f,ms=180000)=>pg.waitForFunction(f,null,{timeout:ms,polling:250}).then(()=>true,()=>false);
  const leaks=(box)=>pg.evaluate(box=>{ const D=__dbg, T=D.THREE, sc=D.scene, H=LEVELS.hide(), B=new T.Box3(), bad=[], seen=new Set();
    const shown=o=>{ for(let q=o;q;q=q.parent)if(!q.visible)return false; return true; };
    for(const t of sc.children){ if(!t.visible||t.isLight||t.isCamera||t.userData.level==='*'||t.userData.cullOf)continue;
      t.traverse(o=>{ if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite)||!shown(o)||o.material&&o.material.visible===false)return; B.setFromObject(o); if(B.isEmpty())return;
        const fit=B.max.x>box.x0&&B.min.x<box.x1&&B.max.z>box.z0&&B.min.z<box.z1&&B.max.y>box.y0&&B.min.y<box.y1;
        if(!fit){ const k=(t.name||t.type)+'/'+(o.name||o.type); if(!seen.has(k)){ seen.add(k); bad.push(k+' y '+B.min.y.toFixed(1)+'..'+B.max.y.toFixed(1)+' x '+((B.min.x+B.max.x)/2).toFixed(0)+' z '+((B.min.z+B.max.z)/2).toFixed(0)); } } }); }
    LEVELS.show(H); return bad; },box);
  const here=()=>pg.evaluate(()=>({cur:LEVELS.cur,lvl:__dbg.lvl(),zone:ZONES.cur&&ZONES.cur.id}));

  ok((await here()).cur==='street','the start is on the street level');
  ok(await pg.evaluate(()=>{ const H=LEVELS.hide(), r=!__dbg.MAPG.down.visible&&!__dbg.MAPG.dungeon.visible; LEVELS.show(H); return r; }),'on the street the station and the dungeon are not drawn');

  await pg.evaluate(()=>{ const p=METRO.plat; __dbg.UI.goTo(p.x,p.z,'down'); }); await until(()=>LEVELS.cur==='station'); await pg.waitForTimeout(2500);
  const s=await here(); ok(s.cur==='station'&&s.zone==='station','on the platform the level is the station ('+JSON.stringify(s)+')');
  const SB=await pg.evaluate(()=>{ const B=__dbg.MAPK.MODS.station.BOUND, L=LEVELS.of.station, m=1.13*3; return {x0:B.x0-m,x1:B.x1+m,z0:B.z0-m,z1:B.z1+m,y0:L.ceil-40,y1:L.ceil+.05}; });
  const ls=await leaks(SB); ok(!ls.length,'nothing outside the station is drawn from the platform'+(ls.length?': '+ls.slice(0,12).join(' | '):''));
  ok(await pg.evaluate(()=>Math.abs(__dbg.MAPK.MODS.stairCut.constant-LEVELS.of.station.ceil)<1e-6),'from the platform the subway stairs are cut at the station ceiling');
  ok(await pg.evaluate(()=>{ const H=LEVELS.hide(), r=__dbg.MAPG.down.visible&&!__dbg.MAPG.stairs.visible&&!__dbg.MAPG.bodega.visible; LEVELS.show(H); return r; }),'the station is drawn, the street and its stairs are not (no stairs in the station, owner 22 Oct 2026)');
  await pg.evaluate(()=>__dbg.cam(null,null,6)); await pg.waitForTimeout(2500); await pg.screenshot({path:out+'/levels-station.png'});

  await pg.evaluate(()=>DUNGEON.go(1)); const inD=await until(()=>LEVELS.cur==='dungeon'&&DUNGEON.level===1); await pg.waitForTimeout(2500);
  ok(inD,'the dungeon is its own level ('+JSON.stringify(await here())+')');
  if(inD){ const DB=await pg.evaluate(()=>{ const B=__dbg.MAPK.MODS.dungeon.bound(__dbg.pos()[0],__dbg.pos()[2]), m=1.13*3; return {x0:B.x0-m,x1:B.x1+m,z0:B.z0-m,z1:B.z1+m,y0:-60,y1:60}; });
    const ld=await leaks(DB); ok(!ld.length,'nothing outside the dungeon level is drawn there'+(ld.length?': '+ld.slice(0,12).join(' | '):''));
    await pg.screenshot({path:out+'/levels-dungeon.png'}); }

  await pg.evaluate(()=>__dbg.UI.goTo(-2.2,3.2,'up')); await until(()=>LEVELS.cur==='street'); ok((await here()).cur==='street','back on the street level');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  await b.close(); console.log(fails.length?fails.length+' failed':'all level checks passed'); process.exit(fails.length?1:0); })();
