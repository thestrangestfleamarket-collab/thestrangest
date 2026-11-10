// THE PHYSICS EXTRAS (090a-physx, 150-loose, 150o-physmore): the PHYSICS rows in GRAPHICS; loose things with real shapes push and sleep; a hanging thing sways;
// you stand on a loose thing; a townsperson knocked over falls as a ragdoll and gets up; the go-kart drives on Rapier's vehicle; each one off turns it off. No page errors.
// node tests/physx.cjs   (software rendering: a few minutes)
const {chromium}=require('playwright');
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
const wait=(pg,ms)=>pg.waitForTimeout(ms);
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:640}}), errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='warning'&&/^SYS /.test(m.text()))errs.push(m.text()); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=14&physics=1&at=79.6,1.6',{timeout:180000});
  for(let i=0;i<200&&!await pg.evaluate(()=>!!window.__started).catch(()=>false);i++)await wait(pg,1000);
  for(let i=0;i<60&&!await pg.evaluate(()=>GOODSDBG().built).catch(()=>false);i++)await wait(pg,1000);
  // a stack of milk crates of its own beside you (the street's were a loose thing until the bodega's front became a painted block)
  await pg.evaluate(()=>{ const p=__dbg.pos(), M=__dbg.cv().TILE/.84, W=__dbg.W3.mesh, g=new W.geometry.constructor(), A=W.geometry.attributes.position.constructor, P=[], y0=SHARED.groundY(p[0]+1.2*M,p[2]+1.6*M);
    for(const x of [-.25,.25])for(const y of [0,.6])for(const z of [-.25,.25])P.push(p[0]+1.2*M+x*M,y0+y*M,p[2]+1.6*M+z*M); const I=[0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3];
    g.setAttribute('position',new A(new Float32Array(P),3)); g.setIndex(I); g.computeVertexNormals(); const m=new W.constructor(g,W.material); __dbg.scene.add(m); GPH.add(m,{name:'milk crates',m:3}); });
  for(let i=0;i<60&&!await pg.evaluate(()=>GOODSDBG().active>0).catch(()=>false);i++)await wait(pg,1000);
  await wait(pg,1500);
  const ui=await pg.evaluate(()=>{ const B=document.querySelector('#menu [data-p="graphics"] #dphx'); return {rows:B?B.querySelectorAll('[data-px]').length:0,cfg:PHYS.cfg}; });
  ok(ui.rows>=10&&Object.values(ui.cfg).every(v=>v>0),`GRAPHICS has the PHYSICS rows (${ui.rows} controls), all on to start ${JSON.stringify(ui.cfg)}`);
  const s0=await pg.evaluate(()=>({d:GOODSDBG(),c:LOOSE.nearest('milk crates')})); ok(s0.d.built&&s0.c,'Rapier 0.19 is up and the milk crates are a body ('+s0.d.active+' bodies)');
  await pg.evaluate(()=>LOOSE.push('milk crates',2,3,1)); await wait(pg,400); const mid=await pg.evaluate(()=>LOOSE.nearest('milk crates'));
  let c1=null; for(let t=0;t<30000;t+=500){ await wait(pg,500); c1=await pg.evaluate(()=>LOOSE.nearest('milk crates')); if(!c1.awake)break; }
  ok(mid.awake&&Math.hypot(c1.at[0]-s0.c.at[0],c1.at[2]-s0.c.at[2])>.2&&!c1.awake,`shoved, the crates fly (${Math.hypot(c1.at[0]-s0.c.at[0],c1.at[2]-s0.c.at[2]).toFixed(2)}) and sleep`);
  // standing on it: a low heavy block in your way; the controller steps you up onto it
  await pg.evaluate(()=>{ const p=__dbg.pos(), W=__dbg.W3.mesh, g=new W.geometry.constructor(), A=W.geometry.attributes.position.constructor, P=[]; for(const x of [-.7,.7])for(const y of [0,.2])for(const z of [-.7,.7])P.push(p[0]+x,y,p[2]+1.8+z);
    g.setAttribute('position',new A(new Float32Array(P),3)); const m=new W.constructor(g,W.material); __dbg.scene.add(m); GPH.add(m,{name:'test step',m:60}); __dbg.go(p[0],p[2]+3.6); });
  let up=0; for(let t=0;t<40000&&up<.08;t+=1000){ await wait(pg,1000); up=await pg.evaluate(()=>__dbg.pos()[1]); }
  ok(up>.08,`walking onto a low block steps you up onto it (feet at ${up.toFixed(2)}, its top 0.20)`);
  ok(errs.length===0,'no page errors so far '+errs.join(' | '));
  // a ragdoll
  const near=await pg.evaluate(()=>{ const L=(__dbg.npcs().extra||[]).filter(N=>N.on&&N.mode!=='hidden'&&N.B&&N.st); if(!L.length)return null; const N=L[0]; __dbg.go(N.st.x+1.2,N.st.z); return {name:N.name,x:N.st.x,z:N.st.z}; });
  if(near){ await wait(pg,4000); const k=await pg.evaluate(()=>PHYSKNOCK(0)); await wait(pg,1500); const r1=await pg.evaluate(()=>PHYSDBG().rags);
    ok(k&&k.ok&&r1===1,`${k&&k.name} knocked over falls as a ragdoll (${JSON.stringify(k)}, ${r1} ragdolls)`);
    await wait(pg,8000); ok(await pg.evaluate(()=>PHYSDBG().rags)===0,'and gets up again'); }
  else console.log('note no one in today\'s cast has a jointed body, so no one can be knocked over (dormant until they do: owner, 7 Nov 2026)');
  // the kart
  await pg.evaluate(()=>__dbg.go(59.9,1.6)); await wait(pg,2000);
  const m=await pg.evaluate(()=>{ FORAGE.give('kart',1); WIELD.set('kart'); return RIDE.mount('kart'); }); await wait(pg,1000);
  await pg.keyboard.down('w'); let k1={d:null}; for(let i=0;i<12;i++){ await wait(pg,500); const q=await pg.evaluate(()=>({d:PHYSDBG().kart,p:__dbg.pos(),r:RIDEDBG()})); if(q.d&&(!k1.d||Math.abs(q.d.sp)>=Math.abs(k1.d.sp)))k1=q; } await pg.keyboard.up('w'); await wait(pg,1500);
  ok(m&&k1.d&&Math.abs(k1.d.sp)>.15,`in the go-kart, W drives it on Rapier's wheels (speed ${k1.d&&k1.d.sp}, ${JSON.stringify(k1.r)})`);
  await pg.evaluate(()=>RIDE.off()); await wait(pg,500); ok(!(await pg.evaluate(()=>PHYSDBG().kart)),'getting out takes the kart out of the world');
  // switched off: a vehicle glides like a board, no ragdolls
  await pg.evaluate(()=>{ PHYS.set('veh',0); PHYS.set('rag',0); RIDE.mount('kart'); }); await pg.keyboard.down('w'); let k2={v:0}; for(let i=0;i<10;i++){ await wait(pg,500); const q=await pg.evaluate(()=>({d:PHYSDBG().kart,v:RIDEDBG().v})); if(q.v>=k2.v)k2=q; } await pg.keyboard.up('w');
  ok(!k2.d&&k2.v>0,`VEHICLE PHYSICS off: the kart rides without Rapier (speed ${k2.v})`); await pg.evaluate(()=>RIDE.off());
  ok(await pg.evaluate(()=>{ const N=Object.values(BODIES.by).map(b=>b.npc).filter(Boolean).find(N=>N.on&&N.B); return !N||!PHYS.knock(N,{x:1,z:0},1); }),'RAGDOLLS off: nobody falls');
  await pg.evaluate(()=>{ for(const [k,,,d] of PHYS.rows)PHYS.set(k,d); });
  ok(errs.length===0,'no page errors '+errs.join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'all ok'); process.exit(bad?1:0); })();
