const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'alleyout', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,60); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,3000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(6000);
  const shot=async(n,f,w=4000)=>{ try{ if(f)await pg.evaluate(f); await pg.waitForTimeout(w); await pg.screenshot({path:path.join(OUT,n+'.png')}); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  const cost=()=>pg.evaluate(()=>{ const r=__dbg.renderer, i=r.info; let bt=0, bg=0, bo=0; const g=__dbg.scene.getObjectByName('block'); if(g)g.traverse(o=>{ if(!o.geometry)return; bo++; const c=o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count; bt+=(o.isLine||o.isLineSegments?c/2:c/3)*(o.isInstancedMesh?o.count:1); });
    return {calls:i.render.calls,tris:i.render.triangles,geoms:i.memory.geometries,tex:i.memory.textures,progs:(i.programs||[]).length,sceneTris:__dbg.tris(),lamps:__dbg.lamps.length,recs:__dbg.LITE.recs.length,sol:__dbg.SOL.up.length,blockObjs:bo,blockTris:Math.round(bt),blockVis:g?g.visible:null,alley:window.ALLEYDBG?ALLEYDBG():null}; });
  rep.startCost=await cost();
  rep.start=await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD, T=window.TILE||__dbg.cv().TILE, y=__dbg.you(); return {tile:[+(y.x/T+B.OX).toFixed(2),+(y.z/T+B.OY).toFixed(2)],OX:B.OX,OY:B.OY,MAP:B.MAP,CURB:B.CURB,FAR:B.FAR,T}; });
  rep.layout=await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD, T=__dbg.cv().TILE, tx=x=>+(x/T+B.OX).toFixed(2), ty=z=>+(z/T+B.OY).toFixed(2);
    const near=__dbg.SOL.up.filter(s=>{ const a=tx(s[0]),c=tx(s[2]),b=ty(s[1]),d=ty(s[3]); return d>-125&&b<-60&&(c>195||a<-40||(a<105&&c>92)); }).map(s=>[tx(s[0]),ty(s[1]),tx(s[2]),ty(s[3])]);
    return {block:window.BLOCKDBG&&BLOCKDBG(),gates:window.GATESDBG&&GATESDBG().gaps,stair:__dbg.MAPK.MAPSTAIR&&{x0:__dbg.MAPK.MAPSTAIR.x0,x1:__dbg.MAPK.MAPSTAIR.x1},near:near.slice(0,80),bank:__dbg.MAPK.RING.bank,ff:__dbg.MAPK.RING.ff}; });
  const go=(x,y)=>pg.evaluate(([x,y])=>{ const B=__dbg.MAPK.BOD; STORE.goTo(B.XS(x),B.ZS(y),'up'); },[x,y]);
  await shot('start');
  await go(99,-62); await pg.mouse.move(480,270); for(let i=0;i<4;i++){ await pg.mouse.wheel(0,600); await pg.waitForTimeout(150); }
  await shot('street99'); rep.street99=await cost();
  for(const k of [1,2,3]){ await pg.keyboard.press('q'); await shot('street99-q'+k,null,2500); }
  await pg.keyboard.press('q');
  for(const [n,x,y] of [['east',214,-95.9],['west',-51.5,-95.9],['gate99',99,-91.5],['mid94',94,-95.9],['mid130',130,-95.9],['prom',100,-115]]){ await go(x,y); await shot(n); rep['at_'+n]={pos:await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD, T=__dbg.cv().TILE, y=__dbg.you(); return [+(y.x/T+B.OX).toFixed(2),+(y.z/T+B.OY).toFixed(2)]; }),cost:await cost()};
    if(n==='mid94'||n==='east'){ for(const k of [1,2]){ await pg.keyboard.press('q'); await shot(n+'-q'+k,null,2500); } await pg.keyboard.press('q'); await pg.keyboard.press('q'); } }
  await go(94,-95.9); await pg.keyboard.press('v'); await shot('mid94-behind',()=>__dbg.face(Math.PI/2),4000); await pg.keyboard.press('v'); await pg.keyboard.press('v');
  await go(99,-62); await shot('street-back',null,4000); rep.backCost=await cost();
  fin(); await b.close(); })();
