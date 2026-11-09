// THE SKATE PIT (src/111fda-skatepit.js): node tests/skatepit.cjs [out folder]. In Section B, deeper in the park: built in the open, on GO TO; the bowl sinks below the deck; rolling in on a board gains speed and its wall at speed throws you up past the coping, and you come back down; a deck ledge grinds; after dark its tube lamps light.
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=300000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(400))if(await pg.evaluate(f))return true; return false; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=22&sec=B',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  rec('in Section B the pit is built, its coping and ledges grind lines',await U(()=>window.PIT&&PIT.ready&&PIT.dbg().built&&PIT.dbg().coping>=40&&window.SKATE&&SKATE.ready));
  rec('GO TO lists it',await pg.evaluate(()=>__dbg.UI.places().some(p=>p[0]==='THE SKATE PIT')));
  await pg.evaluate(()=>{ const [x,z]=PIT.dbg().at(0,16); __dbg.UI.goTo(x,z,0,Math.PI); });
  await U(()=>SHARED.LVL==='up',60000);
  let d=await pg.evaluate(()=>{ const D=PIT.dbg(), [A]=D.lobes, [bx,bz]=D.at(A[0],A[1]), [dx,dz]=D.at(0,15.5), L=D.ledge, [lx,lz]=D.at((L[0]+L[2])/2,(L[1]+L[3])/2), T=__dbg.cv().TILE; return {bottom:SHARED.groundY(bx,bz)/T,deck:SHARED.groundY(dx,dz),ledge:SHARED.groundY(lx,lz)/T}; });
  rec('the deep end sinks well below the deck, a ledge stands on it',d.bottom<-2&&Math.abs(d.deck)<.05&&d.ledge>0,JSON.stringify(d));
  rec('after dark its tube lamps light',await U(()=>{ const D=PIT.dbg(); return D.lit&&D.lamps===D.lampN; },30000));
  // ride: from the deep end's floor toward its wall at speed: thrown up past the coping, back down, still on the board
  d=await pg.evaluate(()=>{ const T=__dbg.cv().TILE, D=PIT.dbg(), [A]=D.lobes, G=(x,z)=>SHARED.groundY(x,z);
    FORAGE.give('skateboard',1); WIELD.set('skateboard'); RIDE.mount('skateboard'); window.__k=(k,on)=>dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{key:k,bubbles:true,cancelable:true}));
    window.__sim=n=>{ for(let i=0;i<n;i++)RIDE.steer(1/30,0,0); return TRICKSDBG(); };
    const [x,z]=D.at(A[0]+2,A[1]), [wx,wz]=D.at(A[0]-A[2],A[1]), hd=Math.atan2(wx-x,wz-z);
    __dbg.UI.goTo(x,z,0,hd); RIDE.hd=hd; RIDE.md=hd; RIDE.s='roll'; RIDE.fakie=false; RIDE.v=6*T; RIDE.z=0; RIDE.vz=0; RIDE.gy=G(x,z); TRICKS.combo=null;
    let up=false, top=-1e9; for(let i=0;i<240&&RIDE.on;i++){ const q=__sim(1); if(q.s==='air'&&RIDE.vert){ up=true; top=Math.max(top,G(SHARED.pos?SHARED.pos.x:x,0)); } if(up&&q.s==='roll')return {up,back:Math.abs(Math.atan2(Math.sin(RIDE.md-hd),Math.cos(RIDE.md-hd)))>2.5,on:!!RIDE.on}; }
    return {up,on:!!RIDE.on}; });
  rec('its wall at speed throws you up past the coping',d.up,JSON.stringify(d));
  rec('and you come back down into the bowl, still on the board',d.on&&d.back,JSON.stringify(d));
  d=await pg.evaluate(()=>{ const T=__dbg.cv().TILE, r=SKATE.rails.find(q=>q.pit&&q.kind===1), mx=(r.a[0]+r.b[0])/2, mz=(r.a[2]+r.b[2])/2, hd=Math.atan2(r.b[0]-r.a[0],r.b[2]-r.a[2]);
    if(!RIDE.on){ WIELD.set('skateboard'); RIDE.mount('skateboard'); }
    __dbg.UI.goTo(mx,mz,0,hd); RIDE.hd=hd; RIDE.md=hd; RIDE.v=2*T; RIDE.s='air'; RIDE.vert=false; RIDE.vh=RIDE.v; RIDE.gy=SHARED.groundY(mx,mz+3*T); RIDE.z=r.a[1]-RIDE.gy+.3*T; RIDE.vz=0;
    __k('l',true); const g=__sim(1); __k('l',false); const t=__sim(4); return {g:g.s,t:t.s,combo:t.combo}; });
  rec('L by the deck ledge grinds it',d.g==='grind',JSON.stringify(d));
  if(OUT){ require('fs').mkdirSync(OUT,{recursive:true}); await U(()=>!document.getElementById('loading'),120000);
    await pg.evaluate(()=>{ __k(' ',true); __sim(1); __k(' ',false); for(let i=0;i<90&&RIDE.on&&TRICKSDBG().s!=='roll';i++)__sim(1); const [x,z]=PIT.dbg().at(-2,16); __dbg.UI.goTo(x,z,0,0); __dbg.UI.setView('third'); SHARED.pitchTo=SHARED.pitch=.2; SHARED.yawTo=SHARED.yaw=0; });
    await wait(4000); await pg.screenshot({path:OUT+'/pit-night.png'}); }
  const E=Object.keys(errs); rec('no page errors',!E.length,E.join(' | '));
  await b.close(); console.log(bad?bad+' failed':'all skate pit checks passed'); process.exit(bad?1:0); })().catch(e=>{ console.log('ERR',e); process.exit(1); });
