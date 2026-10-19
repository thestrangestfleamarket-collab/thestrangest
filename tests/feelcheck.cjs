// FEEL LAB acceptance: node tests/feelcheck.cjs [out-dir]; the new controller (087b-e) driven in the page, in its yard
const {chromium}=require('playwright'), fs=require('fs');
(async()=>{ const out=process.argv[2]||'feelcheck'; fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}), pg=await b.newPage({viewport:{width:1100,height:760}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=13&fresh=1&feel=1&feelpanel=0',{timeout:180000}); await pg.waitForFunction(()=>window.__started,null,{timeout:180000});
  await pg.waitForFunction(()=>FEEL.ready,null,{timeout:60000}); await pg.evaluate(()=>FEEL.yard.go(0)); await pg.waitForTimeout(2500);
  const R=await pg.evaluate(()=>{ const Y=FEEL.yard, S=FEEL.S, IN=FEEL.IN, H=FEEL.H, c=FEEL.cfg, o=Y.o, r={}; FEEL.hold=true;
    const put=(x,y,z,f=Math.PI)=>{ S.p.set(o.x+x,y,o.z+z); S.prev.copy(S.p); S.v.set(0,0,0); S.face=f; S.gnd=true; S.lastG=S.t; S.jumped=false; S.buf=-1; S.air=0; S.jumpT=0; IN.x=0; IN.z=0; IN.run=false; IN.press=0; S.held=false; FEEL.sim(3); };
    const go=(n,x,z,run=false,f)=>FEEL.sim(n,(i,I,s)=>{ I.x=x; I.z=z; I.run=run; if(f)f(i,I,s); });
    const hs=t=>Math.hypot(t.vx,t.vz), L=a=>a[a.length-1], rx=v=>v-o.x, rz=v=>v-o.z, f3=v=>+v.toFixed(3);
    put(0,0,14); const st=go(90,1,0,true); put(0,0,14); const dg=go(90,1,1,true);
    r.diagonal={straight:f3(Math.max(...st.map(hs))),diagonal:f3(Math.max(...dg.map(hs))),straightKeysLen:1,diagonalKeysLen:f3(Math.SQRT2)};
    const stop=run=>{ put(-10,0,15); go(90,1,0,run); const x0=S.p.x; let n=0; const tr=go(120,0,0); for(const t of tr){ n++; if(hs(t)<.01)break; } return {from:run?c.run:c.walk,slid:f3(S.p.x-x0),time:f3(n*H),expected:f3((run?c.run:c.walk)**2/2/c.brake)}; };
    r.stop={run:stop(true),walk:stop(false)};
    { put(-10,0,15); go(90,1,0,true); const x0=S.p.x; const tr=go(90,-1,0,true); const k=tr.findIndex(t=>t.vx<0), k2=tr.findIndex(t=>t.vx<-c.run*.9); r.reverse={turnedAfter:f3((k+1)*H),slidForward:f3(Math.max(...tr.map(t=>t.x))-x0),fullSpeedBackAfter:f3((k2+1)*H)}; }
    { put(-6,0,-9); const tr=go(150,.6,-.8,true); const zmin=Math.min(...tr.map(t=>rz(t.z))); r.wallSlide={minZ:f3(zmin),wallFace:-11.6,radius:c.radius,alongSpeed:f3(L(tr).vx),moved:f3(rx(L(tr).x)+6),touching:tr.filter(t=>t.w).length}; }
    { put(-12,0,-9); const tr=go(240,-1,-1,true); const last=tr.slice(-60), jit=Math.max(...last.map(t=>t.x))-Math.min(...last.map(t=>t.x))+Math.max(...last.map(t=>t.z))-Math.min(...last.map(t=>t.z));
      r.insideCorner={at:[f3(rx(L(tr).x)),f3(rz(L(tr).z))],expect:[f3(-13.6+c.radius),f3(-11.6+c.radius)],jitterLast1s:f3(jit)}; }
    { put(2.8,0,-1); const tr=go(180,0,-1,false); r.outsideCorner={maxXbesidePillar:f3(Math.max(...tr.filter(t=>rz(t.z)<-3.5&&rz(t.z)>-5.5).map(t=>rx(t.x)))),pillarWest:3,endZ:f3(rz(L(tr).z)),passedPillar:rz(L(tr).z)<-6}; }
    { put(-7.35,0,3); const tr=go(300,0,-1,false); const xs=tr.map(t=>rx(t.x)); r.passage={width:.9,endZ:f3(rz(L(tr).z)),through:rz(L(tr).z)<-6,xRange:[f3(Math.min(...xs)),f3(Math.max(...xs))]}; }
    { put(9.5,0,10); const tr=go(240,0,-1,false); const on=tr.filter(t=>rz(t.z)<7.5&&rz(t.z)>2.5); r.ramp14={topY:f3(L(tr).y),maxY:f3(Math.max(...tr.map(t=>t.y))),airStepsOnRamp:on.filter(t=>!t.g).length,stepsOnRamp:on.length}; }
    { put(-10,0,13); const tr=go(240,0,-1,false); r.ramp40={maxY:f3(Math.max(...tr.map(t=>t.y))),top:1.678}; }
    { put(-14.5,0,13); const tr=go(240,0,-1,true); r.slope55={maxY:f3(Math.max(...tr.map(t=>t.y))),top:2.856,endZ:f3(rz(L(tr).z))}; }
    { put(-6,0,6,Math.PI/2); const s0=S.steps; const tr=go(240,1,0,false); r.steps={riser:.2,maxY:f3(Math.max(...tr.map(t=>t.y))),top:1.2,stepUps:S.steps-s0}; }
    { put(-.3,0,6,Math.PI/2); const tr=go(180,1,0,false); r.block45={maxX:f3(Math.max(...tr.map(t=>rx(t.x)))),blockFace:.5,maxY:f3(Math.max(...tr.map(t=>t.y)))}; }
    { put(11,1.5,-1,Math.PI/2); const l0=FEEL.ev.land; const tr=go(150,1,0,false); const k=tr.findIndex(t=>!t.g); let dy=0; for(let i=1;i<tr.length;i++)dy=Math.max(dy,Math.abs(tr[i].y-tr[i-1].y)); r.ledge={leftGroundAt:k,airSteps:tr.filter(t=>!t.g).length,endY:f3(L(tr).y),landed:FEEL.ev.land-l0,maxDropPerStep:f3(dy),maxFallPerStep:f3(c.fallMax*H)}; }
    const coy=delay=>{ put(13.6,1.5,-1,Math.PI/2); let left=-1, jumped=false, landed=false; FEEL.sim(120,(i,I,s)=>{ I.x=1; I.z=0; if(left<0&&!s.gnd)left=i; if(left>=0&&i>left+2&&s.gnd)landed=true; if(left>=0&&i===left+Math.round(delay/H))I.press=1; if(s.v.y>1&&!landed)jumped=true; }); return jumped; };
    r.coyote={window:c.coyote,at50ms:coy(.05),at90ms:coy(.09),at150ms:coy(.15),at300ms:coy(.3)};
    const buf=before=>{ put(11,1.5,-1); S.p.y=3.5; S.prev.copy(S.p); S.gnd=false; let pressed=false, jumpedAfterLand=false, landAt=-1; const pre=FEEL.sim(200).findIndex(t=>t.g); put(11,1.5,-1); S.p.y=3.5; S.prev.copy(S.p); S.gnd=false; S.lastG=-9;
      FEEL.sim(200,(i,I,s)=>{ if(!pressed&&i===pre-Math.round(before/H)){ I.press=1; pressed=true; } if(landAt<0&&s.gnd)landAt=i; if(landAt>=0&&s.v.y>1)jumpedAfterLand=true; }); return jumpedAfterLand; };
    r.buffer={window:c.buffer,at50msBefore:buf(.05),at100msBefore:buf(.1),at200msBefore:buf(.2),at400msBefore:buf(.4)};
    { put(0,0,15); let jumps=0, prev=0; FEEL.sim(240,(i,I,s)=>{ if(i===0)I.press=1; s.held=true; }); const n=FEEL.ev.jump; FEEL.sim(240,(i,I,s)=>{ s.held=true; }); r.heldJump={extraJumpsWhileHeld2s:FEEL.ev.jump-n}; }
    { put(0,0,15); const tr=FEEL.sim(90,(i,I,s)=>{ if(i===0)I.press=1; s.held=true; }); r.jumpHeight={set:c.jumpH,peak:f3(Math.max(...tr.map(t=>t.y)))}; put(0,0,15); const t2=FEEL.sim(90,(i,I,s)=>{ if(i===0)I.press=1; s.held=i<5; }); r.shortHop={peak:f3(Math.max(...t2.map(t=>t.y)))}; }
    { put(-2,0,-2); const hc=FEEL.hgt()+.3; const tr=FEEL.sim(60,(i,I,s)=>{ if(i===0)I.press=1; s.held=true; }); r.lowCeiling={ceiling:f3(hc),height:f3(FEEL.hgt()),maxY:f3(Math.max(...tr.map(t=>t.y))),hitCeiling:tr.some(t=>t.c),headTopMax:f3(Math.max(...tr.map(t=>t.y))+FEEL.hgt())}; }
    const fr=fps=>{ put(-10,0,15); let acc=0, pend=false, pressed=false, peak=0, x0=S.p.x, xs=0; const dt=1/fps, frames=Math.round(2.5*fps);
      for(let f=0;f<frames;f++){ const t=f*dt; if(!pressed&&t>=1.5-1e-9){ pend=true; pressed=true; } acc+=dt; while(acc>=H-1e-9){ acc-=H; FEEL.sim(1,(i,I,s)=>{ I.x=t<1-1e-9?1:0; I.run=true; if(pend){ I.press=1; pend=false; } s.held=true; }); }
        if(t<1.5)xs=S.p.x-x0; peak=Math.max(peak,S.p.y); }
      return {fps,travelled:f3(xs),jumpPeak:f3(peak)}; };
    r.frameRates=[30,60,120,144].map(fr);
    FEEL.hold=false; FEEL.yard.go(0); return r; });
  const ok=(n,v)=>console.log((v?'PASS ':'FAIL ')+n);
  console.log(JSON.stringify(R,null,1));
  ok('diagonal max speed equals straight',Math.abs(R.diagonal.straight-R.diagonal.diagonal)<.01);
  ok('run stop under 0.5 m',R.stop.run.slid<.5); ok('reversal under 0.3 s and slide under 0.4 m',R.reverse.turnedAfter<.3&&R.reverse.slidForward<.4);
  ok('wall: no penetration, slides',R.wallSlide.minZ>=-11.6+R.wallSlide.radius-.02&&R.wallSlide.moved>3); ok('inside corner settles',R.insideCorner.jitterLast1s<.01);
  ok('outside corner slides round',R.outsideCorner.passedPillar&&R.outsideCorner.maxXbesidePillar<=3-R.wallSlide.radius+.01); ok('narrow passage passes',R.passage.through);
  ok('14° ramp climbed, grounded',R.ramp14.topY>1.45&&R.ramp14.airStepsOnRamp<=3); ok('40° climbed',R.ramp40.maxY>1.6); ok('55° refused',R.slope55.maxY<.8);
  ok('0.2 m steps climbed',R.steps.maxY>1.15); ok('0.45 m block refused',R.block45.maxY<.05&&R.block45.maxX<.2);
  ok('ledge: falls, lands',R.ledge.airSteps>5&&R.ledge.landed>=1&&Math.abs(R.ledge.endY)<.01&&R.ledge.maxDropPerStep<=R.ledge.maxFallPerStep+.01);
  ok('coyote inside window only',R.coyote.at50ms&&R.coyote.at90ms&&!R.coyote.at150ms&&!R.coyote.at300ms);
  ok('buffer inside window only',R.buffer.at50msBefore&&R.buffer.at100msBefore&&!R.buffer.at200msBefore&&!R.buffer.at400msBefore);
  ok('held jump never re-jumps',R.heldJump.extraJumpsWhileHeld2s===0); ok('jump height matches',Math.abs(R.jumpHeight.peak-R.jumpHeight.set)<.05); ok('short hop lower',R.shortHop.peak<R.jumpHeight.peak*.7);
  ok('low ceiling stops the head',R.lowCeiling.hitCeiling&&R.lowCeiling.headTopMax<=R.lowCeiling.ceiling+.02);
  const F=R.frameRates, sp=k=>Math.max(...F.map(x=>x[k]))-Math.min(...F.map(x=>x[k])); ok('same at 30/60/120/144 fps (travel within 1 cm, jump within 1 cm)',sp('travelled')<.01&&sp('jumpPeak')<.01);
  const L=await pg.evaluate(async()=>{ const D=__dbg, A=FEEL.A, r={}; FEEL.yard.go(0); await new Promise(f=>setTimeout(f,600));
    const C=A.C, fl=C.mx.getRoot().getObjectByName('foot_l'), fr=C.mx.getRoot().getObjectByName('foot_r'), V=new D.THREE.Vector3();
    const walk=async(key,run,ms)=>{ const ks=D.cv; dispatchEvent(new KeyboardEvent('keydown',{key})); if(run)dispatchEvent(new KeyboardEvent('keydown',{key:'Shift'})); const tr=[]; const t0=performance.now();
      await new Promise(done=>{ const f=()=>{ const n=performance.now(); const fp=[fl,fr].map(b=>b.getWorldPosition(V).clone()); tr.push({t:n,hs:FEEL.hs,mode:A.mode,ph:A.ph,feet:fp,idle:A.act.Idle_Loop.time,w:{...A.w}}); if(n-t0<ms)requestAnimationFrame(f); else done(); }; requestAnimationFrame(f); });
      dispatchEvent(new KeyboardEvent('keyup',{key})); if(run)dispatchEvent(new KeyboardEvent('keyup',{key:'Shift'})); return tr; };
    const w=await walk('w',false,2500); let back=0; for(let i=1;i<w.length;i++){ const d=w[i].ph-w[i-1].ph; if(d<0&&d>-.5)back++; } r.phaseRestarts=back; r.walkModes=[...new Set(w.map(x=>x.mode))];
    FEEL.hold=true; const g=C.g, P=new D.THREE.Vector3(), clips={}, R0=C.mx.getRoot(), pts=x=>['foot_','ball_','ball_leaf_'].map(n=>R0.getObjectByName(n+x)).filter(Boolean);
    for(const n of ['Walk_Loop','Jog_Fwd_Loop','Sprint_Loop']){ for(const a of Object.values(A.act)){ a.setEffectiveWeight(0); a.timeScale=0; } const a=A.act[n]; a.setEffectiveWeight(1); const du=a.getClip().duration, N=96, F=[];
      for(let k=0;k<=N;k++){ a.time=k/N*du; C.mx.update(0); g.updateMatrixWorld(true); F.push(['l','r'].map(x=>{ let lo=null; for(const q of pts(x)){ q.getWorldPosition(P); g.worldToLocal(P); const v=[P.z/FEEL.MH,P.y/FEEL.MV]; if(!lo||v[1]<lo[1])lo=v; } return lo; })); }
      const mn=Math.min(...F.flat().map(q=>q[1])), sp=[]; for(let k=1;k<=N;k++)for(const q of [0,1]){ const a1=F[k][q], a0=F[k-1][q]; if(a1[1]<=F[k][1-q][1]&&a1[1]<mn+.04&&a0[1]<mn+.04)sp.push(-(a1[0]-a0[0])/(du/N)); }
      sp.sort((x,y)=>x-y); clips[n]={duration:+du.toFixed(3),footSpeedInStance:+sp[sp.length>>1].toFixed(2)}; }
    A.C=null; FEEL.hold=false; r.clips=clips; r.refs={walkRef:FEEL.cfg.walkRef,jogRef:FEEL.cfg.jogRef,sprintRef:FEEL.cfg.sprintRef};
    D.UI.setView('follow'); D.cam(0,.3,null,null); await new Promise(f=>setTimeout(f,900));
    FEEL.yard.go(1); await new Promise(f=>setTimeout(f,500)); dispatchEvent(new KeyboardEvent('keydown',{key:'w'})); dispatchEvent(new KeyboardEvent('keydown',{key:'Shift'}));
    const t0=performance.now(); while(FEEL.S.p.z-FEEL.yard.o.z>-11.2&&performance.now()-t0<20000)await new Promise(f=>setTimeout(f,100)); const reached=FEEL.S.p.z-FEEL.yard.o.z, tail=[];
    for(let i=0;i<25;i++){ await new Promise(f=>requestAnimationFrame(f)); tail.push({hs:FEEL.hs,mode:A.mode,w:{...A.w}}); } dispatchEvent(new KeyboardEvent('keyup',{key:'w'})); dispatchEvent(new KeyboardEvent('keyup',{key:'Shift'}));
    r.wall={reachedZ:+reached.toFixed(2),hs:+Math.max(...tail.slice(-10).map(x=>x.hs)).toFixed(2),modes:[...new Set(tail.slice(-10).map(x=>x.mode))],locoWeight:+Math.max(...tail.slice(-10).map(x=>x.w.Walk_Loop+x.w.Jog_Fwd_Loop+x.w.Sprint_Loop)).toFixed(2)};
    dispatchEvent(new KeyboardEvent('keydown',{key:'d'})); await new Promise(f=>setTimeout(f,300)); const before=[...D.cv().keys]; dispatchEvent(new Event('blur')); await new Promise(f=>setTimeout(f,300)); r.blur={before,after:[...D.cv().keys],inputAfter:[FEEL.IN.x,FEEL.IN.z]}; dispatchEvent(new KeyboardEvent('keyup',{key:'d'}));
    const good=FEEL.exp(), saved=JSON.parse(good); r.importBad=[FEEL.imp('{nope'),FEEL.imp('{"walk":"fast"}'),FEEL.imp('{"walk":99}'),FEEL.imp('{"zoom":1}'),FEEL.imp('[1,2]')]; FEEL.cfg.walk=3.3; r.importGood=FEEL.imp(good); r.roundTrip=FEEL.cfg.walk===saved.walk;
    return r; });
  console.log(JSON.stringify(L,null,1));
  ok('walk anim phase never restarts',L.phaseRestarts===0); ok('clip refs within 15% of the clips\' own foot speed',['walkRef','jogRef','sprintRef'].every((k,i)=>{ const m=Object.values(L.clips)[i].footSpeedInStance; return Math.abs(L.refs[k]-m)/m<.15; })); ok('against a wall: not running in place',L.wall.hs<.3&&L.wall.locoWeight<.3);
  ok('blur clears held keys',L.blur.after.length===0&&L.blur.inputAfter[0]===0); ok('import rejects bad, takes good',L.importBad.every(m=>/NOT/.test(m))&&L.roundTrip);
  await pg.evaluate(()=>{ FEEL.yard.go(1); __dbg.UI.setView('follow'); __dbg.cam(Math.PI,0.15,null,null); }); await pg.waitForTimeout(2500);
  const CAM=await pg.evaluate(()=>{ const c=__dbg.camO().position, o=FEEL.yard.o; return {camZ:+(c.z/FEEL.MH-o.z).toFixed(2),wallBack:-12,hit:FEEL.camHit}; });
  console.log(JSON.stringify(CAM)); ok('camera kept out of the wall',CAM.camZ>-11.6||!CAM.hit);
  await pg.screenshot({path:out+'/camera-wall.png'});
  await pg.evaluate(()=>{ FEEL.yard.go(0); __dbg.UI.setView('follow'); FEEL.setDbg(true); }); await pg.waitForTimeout(2000); await pg.screenshot({path:out+'/follow-debug.png'});
  await pg.evaluate(()=>{ __dbg.UI.setView('iso'); FEEL.setDbg(false); FEEL.yard.go(0); }); await pg.waitForTimeout(2000); await pg.screenshot({path:out+'/iso.png'});
  console.log('page errors',Object.keys(errs)); await b.close(); })();
