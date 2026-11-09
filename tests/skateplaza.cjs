// THE SKATE PLAZA (src/111fda-skateplaza.js): node tests/skateplaza.cjs [out folder]. In Section B, beside the skate park: built in the open, on GO TO; its ledges are ground and grind lines; the pool's rim is ground and a grind line, its water walled off; L on a ledge grinds it; after dark its tube lamps light.
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=300000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(400))if(await pg.evaluate(f))return true; return false; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=22&sec=B',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  rec('in Section B the plaza is built, its grind lines with the skate park\'s',await U(()=>window.PLAZA&&PLAZA.ready&&PLAZA.dbg().built&&PLAZA.dbg().rails>=15&&window.SKATE&&SKATE.ready&&SKATE.rails.length>PLAZA.dbg().rails));
  rec('GO TO lists it',await pg.evaluate(()=>__dbg.UI.places().some(p=>p[0]==='THE SKATE PLAZA')));
  await pg.evaluate(()=>{ const [x,z]=PLAZA.dbg().at(0,11); __dbg.UI.goTo(x,z,0,Math.PI); });
  await U(()=>SHARED.LVL==='up',60000);
  let d=await pg.evaluate(()=>{ const D=PLAZA.dbg(), L=D.ledge, [x,z]=D.at((L[0]+L[2])/2,(L[1]+L[3])/2), [fx,fz]=D.at(0,0); return {top:SHARED.groundY(x,z),floor:SHARED.groundY(fx,fz)}; });
  rec('a ledge is ground above the paving',d.top>0&&Math.abs(d.floor)<.05,JSON.stringify(d));
  d=await pg.evaluate(()=>{ const P=PLAZA.dbg().pool, T=__dbg.cv().TILE, [rx,rz]=PLAZA.dbg().at(P.u,P.v+P.r+P.w/2), [wx,wz]=PLAZA.dbg().at(P.u,P.v); return {rim:SHARED.groundY(rx,rz),wet:PLAZA.dbg().solid(wx,wz),rails:PLAZA.dbg().poolRails}; });
  rec('the pool: its rim is ground to stand and grind on, its water walled off',d.rim>0&&d.wet&&d.rails>=20,JSON.stringify(d));
  rec('after dark its tube lamps light',await U(()=>{ const D=PLAZA.dbg(); return D.lit&&D.lamps===D.lampN; },30000));
  d=await pg.evaluate(()=>{ const T=__dbg.cv().TILE, r=SKATE.rails.find(q=>q.plaza&&q.kind===1), mx=(r.a[0]+r.b[0])/2, mz=(r.a[2]+r.b[2])/2, hd=Math.atan2(r.b[0]-r.a[0],r.b[2]-r.a[2]);
    FORAGE.give('skateboard',1); WIELD.set('skateboard'); RIDE.mount('skateboard'); window.__k=(k,on)=>dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{key:k,bubbles:true,cancelable:true}));
    window.__sim=n=>{ for(let i=0;i<n;i++)RIDE.steer(1/30,0,0); return TRICKSDBG(); };
    __dbg.UI.goTo(mx,mz,0,hd); RIDE.hd=hd; RIDE.md=hd; RIDE.v=2*T; RIDE.s='air'; RIDE.vert=false; RIDE.vh=RIDE.v; RIDE.gy=SHARED.groundY(mx+3*T,mz); RIDE.z=r.a[1]-RIDE.gy+.3*T; RIDE.vz=0;
    __k('l',true); const g=__sim(1); __k('l',false); const t=__sim(4); return {g:g.s,t:t.s,combo:t.combo}; });
  rec('L by a plaza ledge grinds it',d.g==='grind',JSON.stringify(d));
  if(OUT){ require('fs').mkdirSync(OUT,{recursive:true});
    await pg.evaluate(()=>{ __k(' ',true); __sim(1); __k(' ',false); for(let i=0;i<90&&RIDE.on&&TRICKSDBG().s!=='roll';i++)__sim(1); if(RIDE.on)RIDE.mount&&WIELD.set(null); const [x,z]=PLAZA.dbg().at(-2,12.5); __dbg.UI.goTo(x,z,0,Math.PI); __dbg.UI.setView('third'); SHARED.pitchTo=SHARED.pitch=.2; SHARED.yawTo=SHARED.yaw=SHARED.heading; });
    await U(()=>!document.getElementById('loading'),120000); await wait(4000); await pg.screenshot({path:OUT+'/plaza-night.png'});
    await pg.evaluate(()=>{ const [x,z]=PLAZA.dbg().at(15,4); __dbg.UI.goTo(x,z,0,-Math.PI/2); SHARED.yawTo=SHARED.yaw=SHARED.heading; }); await wait(4000); await pg.screenshot({path:OUT+'/plaza-night2.png'}); }
  const E=Object.keys(errs); rec('no page errors',!E.length,E.join(' | '));
  await b.close(); console.log(bad?bad+' failed':'all skate plaza checks passed'); process.exit(bad?1:0); })().catch(e=>{ console.log('ERR',e); process.exit(1); });
