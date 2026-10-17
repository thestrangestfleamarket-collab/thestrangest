// THE CITY'S SPINE, CHECKED (src/city.js): the addresses listed; a route from the pawns' spot on the far sidewalk to every door on the street
// level (found, its length, the ms); villager_m sent to the bodega's door at 3 tiles a second, watched till he's there (never standing in a
// solid on the way), then to the park's gate and the castle's gatehouse; a job posted, taken by him and done; a schedule entry fired as the
// clock passes its hour; no page errors. Shots: argv[2] (a folder), world_*.png
// node tests/worldcheck.cjs <out folder>   (in the cloud's software rendering the game runs at a few frames a second, so each errand takes minutes)
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]||'.', b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}), pg=await b.newPage({viewport:{width:1280,height:820}}), errs=[];
  pg.on('pageerror',e=>{ errs.push(e.message); console.log('pageerror:',e.message); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?npcwait=99&hour=13&hideme=1',{timeout:180000});
  for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(4000);
  const T=await pg.evaluate(()=>__dbg.cv().TILE);
  // the addresses
  const P=await pg.evaluate(()=>CITY.places().map(p=>({id:p.id,name:p.name,lv:p.lv,x:+(p.door.x).toFixed(1),z:+(p.door.z).toFixed(1),stacked:!!p.stacked})));
  console.log('places:',P.length); for(const p of P)console.log('  ',p.id,'·',p.name,'·',p.lv,'· door at',(p.x/T).toFixed(1),(p.z/T).toFixed(1),'tiles',p.stacked?'(stacked: no way on foot)':'');
  // a route to each from where villager_m stands
  const from=await pg.evaluate(()=>{ const N=__dbg.NPCS.find(n=>n.key==='villager_m'); return {x:N.st.x,z:N.st.z,lv:N.lv}; }); console.log('villager_m at',(from.x/T).toFixed(1),(from.z/T).toFixed(1),from.lv);
  for(const p of P){ if(p.stacked||p.lv!=='up')continue; const r=await pg.evaluate(([f,id])=>{ const P=CITY.place(id), r=CITY.route('up',f,P.door); return r?{pts:r.pts.length,cells:r.cells,len:+(r.len).toFixed(1),ms:+CITY.ms.toFixed(1)}:null; },[from,p.id]);
    console.log('route to',p.id+':',r?`${r.pts} turns over ${r.cells} cells, ${(r.len/T).toFixed(1)} tiles, ${r.ms} ms`:'NO WAY'); }
  // a route underground, from the platform's spot a few tiles along it
  { const r=await pg.evaluate(()=>{ const P=CITY.place('platform'), r=CITY.route('down',P.door,{x:P.door.x+8*__dbg.cv().TILE,z:P.door.z}); return r?{pts:r.pts.length,len:+(r.len/__dbg.cv().TILE).toFixed(1),ms:+CITY.ms.toFixed(1)}:null; }); console.log('route on the platform:',r?`${r.pts} turns, ${r.len} tiles, ${r.ms} ms`:'NO WAY'); }
  // sent: to the bodega's door, the park's gate, the castle's gatehouse; watched
  const errand=async(id,ms)=>{ const r=await pg.evaluate(id=>{ window.__done=null; const r=CITY.errand('villager_m',id,3); const N=__dbg.NPCS.find(n=>n.key==='villager_m'); if(N.errand)N.errand.then=ok=>{ window.__done=ok; }; return r&&{len:r.len,pts:r.pts.length}; },id);
    if(!r){ console.log('errand to',id,': NO WAY'); return; } let inSolid=0, far=0, t=0;
    for(;t<ms;t+=500){ await pg.waitForTimeout(500); const s=await pg.evaluate(()=>{ const N=__dbg.NPCS.find(n=>n.key==='villager_m'); return {done:window.__done,x:N.st.x,z:N.st.z,far:!!N.far,hit:!!CLIP.hit(__dbg.SOL.up,N.st.x,N.st.z,.3*__dbg.cv().TILE)}; }); if(s.hit)inSolid++; if(s.far)far++; if(s.done!=null){ var last=s; break; } }
    const d=await pg.evaluate(id=>{ const N=__dbg.NPCS.find(n=>n.key==='villager_m'), P=CITY.place(id); return Math.hypot(N.st.x-P.door.x,N.st.z-P.door.z)/__dbg.cv().TILE; },id);
    console.log('errand to',id+':',(r.len/T).toFixed(1),'tiles,',r.pts,'turns ·',last?(last.done?'ARRIVED':'GAVE UP'):'STILL WALKING','after',(t/1000).toFixed(1),'s · ends',d.toFixed(2),'tiles from the door · in a solid',inSolid,'of the looks · out of sight',far,'looks'); };
  await errand('bodega',420000);
  await pg.evaluate(()=>{ const N=__dbg.NPCS.find(n=>n.key==='villager_m'); STORE.goTo(N.st.x+2*__dbg.cv().TILE,N.st.z+2*__dbg.cv().TILE,'up'); __dbg.cam(null,.9,null); }); await pg.waitForTimeout(1500); await pg.screenshot({path:out+'/world_bodega.png'});
  await errand('park',420000);
  await pg.evaluate(()=>{ const N=__dbg.NPCS.find(n=>n.key==='villager_m'); STORE.goTo(N.st.x+2*__dbg.cv().TILE,N.st.z+2*__dbg.cv().TILE,'up'); }); await pg.waitForTimeout(1500); await pg.screenshot({path:out+'/world_park.png'});
  await errand('castle',600000);
  await pg.evaluate(()=>{ const N=__dbg.NPCS.find(n=>n.key==='villager_m'); STORE.goTo(N.st.x+2*__dbg.cv().TILE,N.st.z+2*__dbg.cv().TILE,'up'); }); await pg.waitForTimeout(1500); await pg.screenshot({path:out+'/world_castle.png'});
  // the board and the schedule
  const bs=await pg.evaluate(()=>{ const j=CITY.post('parcel','house',{to:'3B'}), k=CITY.post('parcel','dojo',{}), N=__dbg.NPCS.find(n=>n.key==='villager_m'); const t=CITY.take('parcel','villager_m',{x:N.st.x,z:N.st.z}); const open1=CITY.open('parcel').length; CITY.done(t); const open2=CITY.open('parcel').length;
    let fired=0; CITY.at(13.5,()=>fired++,'test'); CITY.setHour(13.4); CITY.tick(0,{x:0,z:0}); CITY.setHour(13.6); CITY.tick(0,{x:0,z:0}); CITY.tick(0,{x:0,z:0}); CITY.setHour(13.7); CITY.tick(0,{x:0,z:0});
    return {posted:[j.id,j.place,j.state],taken:t&&[t.id,t.place,t.by,t.state],open1,open2,fired,errands:CITY.jobs.filter(q=>q.kind==='errand').map(q=>q.place+':'+q.state)}; });
  console.log('board: posted',JSON.stringify(bs.posted),'· taken (the nearer)',JSON.stringify(bs.taken),'· open after taking',bs.open1,'· after done',bs.open2,'· errands',JSON.stringify(bs.errands));
  console.log('schedule: fired',bs.fired,'time(s) as the clock passed 13:30 (1 wanted)');
  console.log('page errors:',errs.length); await b.close(); })().catch(e=>{ console.error(e); process.exit(1); });
