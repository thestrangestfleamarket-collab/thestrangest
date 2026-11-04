// THE SKATE PARK AND THE SKATEBOARD'S TRICKS (src/111fd-skatepark.js, src/146ib-tricks.js): node tests/skate.cjs [out folder]. In Section B the skate park stands in the open; in it, on a bought board: pushing gains speed; SPACE held and let go pops an ollie, J in the air adds a kickflip, a clean landing banks the combo; I starts a manual; L by a rail grinds it; landing sideways bails; the trick keys never open your pack. The ride is stepped in the page as the game's loop does.
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0, d0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=300000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(400))if(await pg.evaluate(f))return true; return false; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12&sec=B',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  rec('in Section B the skate park stands in the open, its skaters and shop with it',await U(()=>{ const d=window.SKATE&&SKATE.ready&&SKATE.dbg(); return d&&d.built&&d.solids>0&&d.people>0&&d.boards===7&&d.shop; }));
  rec('no way in from a room: it is not off the map',await pg.evaluate(()=>!ROOMS.off.skatepark));
  d0=await pg.evaluate(()=>{ const [x,z]=SKATE.dbg().gate; __dbg.UI.goTo(x,z,0,0); return {sec:SHARED.SECTIONS.home.id,g:SHARED.groundY(x,z)}; });
  rec('its gate opens onto flat ground in Section B',d0.sec==='B'&&Math.abs(d0.g)<.05,JSON.stringify(d0));
  // the page's own steps: set the keys, step the ride as the game's loop does (forward = where the board heads)
  await pg.evaluate(()=>{ const D=SKATE.dbg(), [x,z]=D.at(0,4); __dbg.UI.goTo(x,z,0,0); SHARED.heading=0; FORAGE.give('skateboard',1); WIELD.set('skateboard'); RIDE.mount('skateboard');
    window.__k=(k,on)=>dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{key:k,bubbles:true,cancelable:true}));
    window.__sim=(n,o={})=>{ for(let i=0;i<n;i++){ const f=o.fwd?1:0; RIDE.steer(1/30,f*Math.sin(RIDE.md||RIDE.hd),f*Math.cos(RIDE.md||RIDE.hd)); } return TRICKSDBG(); }; });
  rec('you step on the board',await pg.evaluate(()=>TRICKSDBG().on));
  let d=await pg.evaluate(()=>__sim(60,{fwd:1})); rec('pushing gains speed',d.v>1.5,'v '+d.v);
  d=await pg.evaluate(()=>{ __k(' ',true); __sim(12,{fwd:1}); __k(' ',false); return __sim(2,{fwd:1}); }); rec('SPACE held and let go pops an ollie',d.s==='air'&&d.z>0,JSON.stringify(d.combo));
  d=await pg.evaluate(()=>{ __k('j',true); const r=__sim(1); __k('j',false); return r; }); rec('J in the air adds a kickflip',!!(d.combo&&d.combo.list.includes('KICKFLIP')&&d.flip),JSON.stringify(d.combo));
  d=await pg.evaluate(()=>{ for(let i=0;i<120&&TRICKSDBG().s==='air';i++)__sim(1); return __sim(30); }); rec('a clean landing banks the combo',d.s==='roll'&&!d.combo&&d.session>=300,'session '+d.session+' best '+d.best);
  d=await pg.evaluate(()=>{ if(FORAGE.PACK&&FORAGE.PACK.open&&FORAGE.PACK.toggle)FORAGE.PACK.toggle(); const p0=!!(FORAGE.PACK&&FORAGE.PACK.open); __k('i',true); const r=__sim(1); __k('i',false); return {...r,pack:!p0&&!!(FORAGE.PACK&&FORAGE.PACK.open)}; }); rec('I starts a manual (and leaves your pack shut)',d.s==='manual'&&!d.pack,d.s);
  d=await pg.evaluate(()=>{ __k('i',true); __sim(1); __k('i',false); return __sim(40); }); rec('I again ends it, back rolling',d.s==='roll',d.s);
  // a grab and a 180, then a revert as you land
  d=await pg.evaluate(()=>{ const D=SKATE.dbg(), [x,z]=D.at(0,4); __dbg.UI.goTo(x,z,0,0); RIDE.hd=0; RIDE.md=0; RIDE.s='roll'; RIDE.fakie=false; __sim(40,{fwd:1}); __k(' ',true); __sim(14,{fwd:1}); __k(' ',false); __sim(1);
    __k('k',true); __sim(3); __k('k',false); __k('d',true); let r; for(let i=0;i<120&&TRICKSDBG().s==='air';i++){ r=__sim(1); if(Math.abs(RIDE.spun||0)>=Math.PI*1.02)__k('d',false); } __k('d',false); const c=r&&r.combo;
    const landed=TRICKSDBG(); __k('l',true); const rv=__sim(1); __k('l',false); return {c,landed:landed.s,on:!!RIDE.on,rv:rv.combo}; });
  rec('K in the air grabs (INDY)',!!(d.c&&d.c.list.includes('INDY')),JSON.stringify(d.c));
  rec('A or D in the air spins: a 180 on landing',d.on&&!!(d.rv&&d.rv.list.includes('180')),JSON.stringify(d.rv));
  rec('L as you land reverts',d.on&&!!(d.rv&&d.rv.list.includes('REVERT')),JSON.stringify(d.rv));
  // a quarter pipe: rolling up a coping's ramp at speed throws you straight up, and you come down facing back down it
  d=await pg.evaluate(()=>{ const T=__dbg.cv().TILE, G=(x,z)=>SHARED.groundY(x,z); __sim(30);
    for(const r of SKATE.rails.filter(q=>q.kind===2)){ const mx=(r.a[0]+r.b[0])/2, mz=(r.a[2]+r.b[2])/2, dx=r.b[0]-r.a[0], dz=r.b[2]-r.a[2], l=Math.hypot(dx,dz), nx=-dz/l, nz=dx/l, M=T/.84;
      for(const sg of [1,-1]){ const lx=mx+nx*sg*3.2*M, lz=mz+nz*sg*3.2*M; if(G(lx,lz)>r.a[1]-.5*T)continue; const hd=Math.atan2(-nx*sg,-nz*sg);
        if(!RIDE.on){ WIELD.set('skateboard'); RIDE.mount('skateboard'); } __dbg.UI.goTo(lx,lz,0,hd); RIDE.hd=hd; RIDE.md=hd; RIDE.s='roll'; RIDE.fakie=false; RIDE.v=5*T; RIDE.z=0; RIDE.vz=0; RIDE.gy=G(lx,lz); TRICKS.combo=null;
        let up=false; for(let i=0;i<90&&RIDE.on;i++){ const q=__sim(1); if(q.s==='air'&&RIDE.vert)up=true; if(up&&q.s==='roll')return {up,back:Math.abs(Math.atan2(Math.sin(RIDE.md-hd),Math.cos(RIDE.md-hd)))>2.5,on:!!RIDE.on}; }
        if(up)return {up,on:!!RIDE.on}; } } return {up:false}; });
  rec('a quarter pipe at speed throws you up',d.up,JSON.stringify(d));
  rec('and you come back down it, still on the board',d.on&&d.back,JSON.stringify(d));
  // a grind: onto the steel rail, from above it
  d=await pg.evaluate(()=>{ const r=SKATE.rails.find(q=>q.kind===0)||SKATE.rails[0], mx=(r.a[0]+r.b[0])/2, mz=(r.a[2]+r.b[2])/2, hd=Math.atan2(r.b[0]-r.a[0],r.b[2]-r.a[2]);
    __dbg.UI.goTo(mx,mz,0,hd); RIDE.hd=hd; RIDE.md=hd; RIDE.v=2*__dbg.cv().TILE; RIDE.s='air'; RIDE.vert=false; RIDE.vh=RIDE.v; RIDE.z=.6*__dbg.cv().TILE; RIDE.vz=0; RIDE.gy=SHARED.groundY(mx,mz);
    __k('l',true); const g=__sim(1); __k('l',false); const t=__sim(6); return {g:g.s,t:t.s,combo:t.combo}; });
  rec('L by a rail grinds it',d.g==='grind'&&!!(d.combo&&d.combo.list.some(n=>/50-50|GRIND|SLIDE|5-0/.test(n))),JSON.stringify(d));
  d=await pg.evaluate(()=>{ __k(' ',true); __sim(1); __k(' ',false); return __sim(2); }); rec('SPACE on the rail ollies off it',d.s==='air',d.s);
  // a bail: in the air, turned sideways to where you are going, and down
  d=await pg.evaluate(()=>{ for(let i=0;i<120&&TRICKSDBG().s==='air'&&RIDE.on;i++)__sim(1); if(!RIDE.on)RIDE.mount('skateboard'); const T=__dbg.cv().TILE;
    RIDE.s='air'; RIDE.vert=false; RIDE.vh=1*T; RIDE.z=.3*T; RIDE.vz=0; RIDE.hd=(RIDE.md||0)+Math.PI/2; RIDE.flip=null; for(let i=0;i<60&&RIDE.on;i++)__sim(1); return {on:RIDE.on}; });
  rec('landing sideways bails you off the board',!d.on);
  if(OUT){ require('fs').mkdirSync(OUT,{recursive:true}); await pg.screenshot({path:OUT+'/skate.png'}); }
  const E=Object.keys(errs); rec('no page errors',!E.length,E.join(' | '));
  await b.close(); console.log(bad?bad+' failed':'all skate checks passed'); process.exit(bad?1:0); })().catch(e=>{ console.log('ERR',e); process.exit(1); });
