// THE BAR, THE LOUNGE (src/146zca-lounge.js, data/bar.json): node tests/lounge.cjs [out folder]. In through its door off the map: its Polyfork pieces stand, the octopus is at his kit on the stage
// and drumming while you are in (shown when in view), the counter sells drinks, pool and darts are games, the jukebox rests or wakes the drummer, the seats and staff spots are inside and clear, you go back out; no page error.
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader'],...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{})}); const pg=await b.newPage({viewport:{width:1200,height:760}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=180000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(500))if(await pg.evaluate(f).catch(()=>false))return true; return false; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=22',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.evaluate(()=>{ for(const k in LOUNGE.dbg)if(!(k in window))window[k]=LOUNGE.dbg[k]; });
  rec('the bar is a door on the Hudson row with an inside',await pg.evaluate(()=>!!(ROOMS.off.bar&&MSHOP.at.bar)));
  await pg.evaluate(()=>ROOMS.enter('bar'));
  const inn=await U(()=>ROOMS.offIn&&ROOMS.offIn()==='bar'&&!(window.FADE&&FADE.busy)&&__dbg.UI.things.some(t=>t.obj&&t.obj.parent&&t.name==='THE BAR (DRINKS)'));
  await U(()=>LOUNGEDBG().geo,120000);   // its Polyfork pieces come after the room itself (slower on a busy runner)
  rec('you go in; the lounge is built',inn,JSON.stringify(await pg.evaluate(()=>LOUNGEDBG())));
  const live=n=>pg.evaluate(n=>__dbg.UI.things.filter(t=>t.obj&&t.obj.parent&&t.name===n).length,n);
  let L=-1; for(let i=0;i<60&&L<15;i++){ L=await pg.evaluate(()=>{ const s=new Set(); scene.traverse(o=>{ if(o.isMesh&&o.geometry&&o.material&&o.material===KIT.mat)s.add(o.geometry.uuid); }); return s.size; }).catch(()=>-1); if(L<15)await pg.waitForTimeout(500); }   // (the pieces come with their data, a moment after the room)
  rec('its Polyfork pieces stand (back bar, counter, stools, booths, stage, piano, pool table, jukebox ...)',L>=15,'kinds '+L);
  await U(()=>LOUNGEDBG().drum&&DRM.on,30000); await wait(3000);
  const o=await pg.evaluate(()=>{ const b=ROOMS.off.bar.box, a=DRM.at, d=LOUNGEDBG(); return {d,inside:!!a&&a.x>b.x0&&a.x<b.x1&&a.z>b.z0&&a.z<b.z1,vis:!!(DRM.g&&DRM.g.parent)&&VIS.why(DRM.g).every(w=>w==='perf'),drawn:DRM.g?DRM.g.children[0].count:0}; });
  rec('the octopus is at his kit on the stage, drumming while you are in',o.inside&&o.vis&&o.d.on&&o.d.live&&o.drawn>20,JSON.stringify(o));
  await U(()=>WORKERSDBG().some(w=>w.k==='w_badger'&&w.made)&&BODIES.by.w_badger&&BODIES.by.w_badger.npc,90000);
  const bd=await pg.evaluate(()=>{ const N=BODIES.by.w_badger&&BODIES.by.w_badger.npc, s=ROOMS.off.bar.spots.TAPS; return N?{d:+Math.hypot(N.st.x-s.x,N.st.z-s.z).toFixed(2),parent:!!N.g.parent}:null; });
  rec('the badger is back, at the taps behind the counter',!!bd&&bd.d<.3&&bd.parent,JSON.stringify(bd));
  const g=await pg.evaluate(()=>{ const th=n=>__dbg.UI.things.find(t=>t.obj&&t.obj.parent&&t.name.startsWith(n)), r={};
    th('THE BAR (DRINKS)').act(); r.drinks=!!SHOPS.cur&&SHOPS.cur.key==='w_badger'&&['d_ale','d_stout','d_cola'].every(k=>CHARS.trade({key:'w_badger'}).sells.includes(k)&&!ARCHI(k)); if(SHOPS.close)SHOPS.close();
    th('POOL TABLE').act(); r.pool=!!MINI.on&&MINI.on.title==='POOL'; MINI.close();
    th('DARTS').act(); r.darts=!!MINI.on&&MINI.on.title==='DARTS: 301'; MINI.close();
    th('THE JUKEBOX').act(); r.rest=!DRM.on; th('THE JUKEBOX').act(); r.back=DRM.on; return r; });
  rec('the badger sells ale, stout and cola at the counter; pool and darts are games; the jukebox rests and wakes the drummer',g.drinks&&g.pool&&g.darts&&g.rest&&g.back,JSON.stringify(g));
  const seats={stools:await live('A BAR STOOL'),booths:await live('A VELVET BOOTH'),chairs:await live('A CHAIR')};
  const p=await pg.evaluate(()=>{ const R=ROOMS.off.bar, b=R.box, sol=SHARED.solids, inB=p=>p.x>b.x0&&p.x<b.x1&&p.z>b.z0&&p.z<b.z1, free=p=>!sol.some(r=>p.x>r[0]&&p.x<r[2]&&p.z>r[1]&&p.z<r[3]);
    return {spots:Object.keys(R.spots||{}).length,seats:(R.seats||[]).length,in:Object.values(R.spots||{}).concat(R.seats||[]).every(inB),blocked:Object.entries(R.spots||{}).filter(([,p])=>!free(p)).map(([k])=>k).concat((R.seats||[]).filter(p=>p.y==null&&!free(p)).map(()=>'standing'))}; });
  rec('seats to sit on (stools, booths, chairs); staff spots and places inside, standing ones clear',seats.stools===7&&seats.booths===3&&seats.chairs===8&&p.spots>=3&&p.seats>=10&&p.in&&!p.blocked.length,JSON.stringify({seats,p}));
  // the grand piano and the octopus's kit played where they stand: you sit at it, the book's panel shows, none in your bag; you get up and it's as it was
  for(const [n,id] of [['THE GRAND PIANO','piano'],['THE DRUM KIT','drums']]){
    const q=await pg.evaluate(async([n,id])=>{ const t=__dbg.UI.things.find(t=>t.obj&&t.obj.parent&&t.name.startsWith(n)); if(!t)return {thing:false}; for(const k of ['piano','drums'])delete INV.items[k]; const P0={x:__dbg.you().x,z:__dbg.you().z}, oct=DRM.on, gy0=SHARED.groundY(DRM.at.x,DRM.at.z);
      t.act(); await new Promise(r=>setTimeout(r,1500)); const P=INSTR.ME, me=__dbg.you(), want=INSTR.ME.place&&INSTR.ME.place.at(), sel=document.querySelector('#inp #insong');
      const r={thing:true,on:INSTR.kindOn()===id,place:!!P.place,seated:!!want&&Math.hypot(me.x-want.x,me.z-want.z)<.05,sat:P.H&&P.H.W?+(new P.H.G.position.constructor().setFromMatrixPosition(P.H.W[0]).y/P.H.k).toFixed(2):null,
        panel:!document.getElementById('inp').hidden,book:!!sel&&sel.options.length>0,bag:FORAGE.has(id),shown:P.H?P.H.G.visible:null,flag:ONLINE.mine.ins(),octo:id==='drums'?DRM.taken&&VIS.hidden(DRM.g,'play')&&DRM.on===oct:null,up:id==='drums'?+(SHARED.groundY(DRM.at.x,DRM.at.z)-gy0).toFixed(2):null};
      await new Promise(r=>setTimeout(r,1500)); r.still=INSTR.kindOn()===id;
      t.act(); await new Promise(r=>setTimeout(r,500)); const me2=__dbg.you(); r.off=!INSTR.on()&&document.getElementById('inp').hidden; r.back=Math.hypot(me2.x-P0.x,me2.z-P0.z)<.05; r.octoBack=id==='drums'?DRM.on===oct&&!DRM.taken&&!VIS.hidden(DRM.g,'play')&&SHARED.groundY(DRM.at.x,DRM.at.z)===gy0:null; r.bag2=FORAGE.has(id); return r; },[n,id]);
    rec(`${n.toLowerCase()} plays where it stands: it seats you at it${id==='drums'?' (the octopus steps off, you on his throne up on the stage)':''}, the book's panel shows, none in your bag, the room's own played (yours not set down); you get up where you were and it's as it was`,
      q.thing&&q.on&&q.place&&q.seated&&q.sat>.4&&q.sat<.65&&q.panel&&q.book&&!q.bag&&q.shown===false&&/k$/.test(q.flag||'')&&q.still&&q.off&&q.back&&!q.bag2&&(id!=='drums'||q.octo&&q.up>0&&q.octoBack),JSON.stringify(q)); }
  if(OUT){ require('fs').mkdirSync(OUT,{recursive:true});
    for(const [n,u,v,hd] of [['stage',.5,.62,Math.PI],['bar',.55,.55,-Math.PI/2],['room',.5,.9,Math.PI]]){
      await pg.evaluate(([u,v,hd])=>{ const R=MSHOP.at.bar.R, B=SHARED.BOD, x=B.X(R.x0+(R.x1-R.x0)*u), z=B.Z(R.y0+(R.y1-R.y0)*v); __dbg.UI.goTo(x,z,0,hd); const UI=__dbg.UI; UI.setView('third'); SHARED.yawTo=SHARED.yaw=hd+Math.PI; SHARED.pitchTo=SHARED.pitch=.25; },[u,v,hd]);
      await wait(3500); await pg.screenshot({path:OUT+'/lounge-'+n+'.png'}); } }
  await pg.evaluate(()=>ROOMS.exit('bar')); await U(()=>!(ROOMS.offIn&&ROOMS.offIn()==='bar')&&!(window.FADE&&FADE.busy),60000);
  rec('you go back out; the drummer stops',await pg.evaluate(()=>!(ROOMS.offIn&&ROOMS.offIn())&&!(DRM.live&&DRM.live())));
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,v])=>v+'× '+k).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'ALL PASS'); process.exit(bad?1:0); })();
