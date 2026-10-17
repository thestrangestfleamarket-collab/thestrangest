// ---- THE DRAGON (owner, 17 Oct 2026, Dragon2.glb in his G folder: rigged, with its own clips): an old dragon, calm, who lives on the roofs:
// perched on a building's front ledge, then gliding over the street, then down onto another ledge (below). Baked by tools/kit-bake.py into
// data/dragon.json (the skeletons' format, npc-skel.js's reader: his bones, his skin coloured from his texture, his clips); made by makeNPC
// (lit by the lamps, shaded like the rest) with his own ways on top ----
{ const S=DRAGON, b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), f32=s=>new Float32Array(b(s).buffer), i16=s=>new Int16Array(b(s).buffer), u16=s=>new Uint16Array(b(s).buffer);
  const BN=S.rig.names, JI=Object.fromEntries(BN.map((n,i)=>[n,i]));
  const pts=M=>{ const q=i16(M.p), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3]; return P; };
  const geomOf=M=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pts(M),3)); g.setAttribute('color',new THREE.BufferAttribute(b(M.c),3,true)); g.setIndex(new THREE.BufferAttribute(u16(M.i),1));
    g.setAttribute('reg',new THREE.BufferAttribute(new Float32Array(M.n),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(M.n),1));
    g.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(b(M.j),4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(b(M.w),4,true)); return g; };
  const rig=(()=>{ const R=S.rig, bones=R.names.map((n,i)=>{ const B=new THREE.Bone(); B.name=n; B.position.fromArray(R.t[i]); B.quaternion.fromArray(R.q[i]); if(R.s)B.scale.fromArray(R.s[i]); return B; });
    R.parent.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); }); const ibm=f32(R.ibm); return {bones,skeleton:new THREE.Skeleton(bones,bones.map((_,i)=>new THREE.Matrix4().fromArray(ibm,i*16)))}; })();
  const CLIPS={}; for(const [name,C] of Object.entries(S.clips)){ const T=Array.from({length:C.n},(_,k)=>k*C.dur/(C.n-1)), Q=i16(C.q), tracks=[];
    BN.forEach((bn,j)=>{ const v=new Float32Array(C.n*4); for(let k=0;k<C.n;k++)for(let c=0;c<4;c++)v[k*4+c]=Q[(k*BN.length+j)*4+c]/32000; tracks.push(new THREE.QuaternionKeyframeTrack(bn+'.quaternion',T,v)); });
    for(const [bn,p] of Object.entries(C.p))tracks.push(new THREE.VectorKeyframeTrack(bn+'.position',T,f32(p)));
    CLIPS[name]=new THREE.AnimationClip(name,C.dur,tracks); }
  const M=S.chars.Dragon, mixer=new THREE.AnimationMixer(rig.bones[0]), act=n=>mixer.clipAction(CLIPS[n]);
  const idle=act('Idle_loop'), walk=act('Walk_menacing_loop'), fly=act('Flying_loop'), lift=act('GroundToFly'), attack=act('Attack');
  idle.play(); walk.play(); fly.play(); walk.setEffectiveWeight(0); fly.setEffectiveWeight(0); lift.setLoop(THREE.LoopOnce); lift.clampWhenFinished=true; attack.setLoop(THREE.LoopOnce); attack.clampWhenFinished=false;
  // ---- CALM, IN THE AIR AND ON THE LEDGES (owner, 17 Oct 2026: "the dragon should be flying around, and perching on the ledges of buildings.
  // calm"): he sits a long while on a building's front ledge (the bodega's, the apartment building's, the apartment house's), looking out over
  // the street with his idle; then he lifts off (his take-off) and glides in slow wide turns over the roofs, banking into them, his wingbeat
  // slowed; after a while he comes round to a ledge, slows, sinks onto it and settles. He snaps at no one, and nothing on the ground meets him ----
  const B0=BOD.B0, TI=TILE, PER=[
    {x:BOD.X(54.1),z:BOD.Z(B0.y1)-.9*TI,y:BOD.Y(650),h:0},                        // the apartment house's roof, its front
    {x:BOD.X((B0.x0+B0.x1)/2),z:BOD.Z(B0.y1)-.9*TI,y:BOD.Y(B0.h),h:0},             // the bodega's
    {x:POOLR.X(8),z:POOLR.Z(POOLR.y1)-.9*TI,y:POOLR.Y(POOLR.H),h:0},               // the apartment building's, west and east
    {x:POOLR.X(21),z:POOLR.Z(POOLR.y1)-.9*TI,y:POOLR.Y(POOLR.H),h:0}];
  const D={mode:'perch',p:PER[Math.floor(Math.random()*PER.length)],t:12+Math.random()*20,y:0,bank:0,pitch:0,v:0,to:null,fly:0}; D.y=D.p.y;
  const ease=(a,b,k)=>a+(b-a)*k, turnTo=(h,want,max)=>{ let d=((want-h+Math.PI*3)%(Math.PI*2))-Math.PI; d=Math.max(-max,Math.min(max,d)); return [h+d,d]; };
  const sky=()=>({x:BOUND.x0+6*TI+Math.random()*(BOUND.x1-BOUND.x0-12*TI),z:BOUND.z0+4*TI+Math.random()*(BOUND.z1-BOUND.z0-6*TI)});
  let wI=1, wF=0, wL=0;
  const N=makeNPC(null,{key:'dragon',name:'THE DRAGON',names:M.parts,lv:'up',group:'bodega',geo:geomOf(M),skin:rig,tall:M.tall,eye:-1,rank:[0],metres:3.2,x:D.p.x,z:D.p.z,lane:{x0:D.p.x,x1:D.p.x,z0:D.p.z,z1:D.p.z},ground:()=>0,radius:.9,speed:0,stride:0,rock:0,bob:0,
    anim:(dt)=>{ const k=Math.min(1,dt*3); wI=ease(wI,D.mode==='perch'?1:0,k); wF=ease(wF,D.mode==='fly'||D.mode==='come'?1:0,k); wL=ease(wL,D.mode==='lift'?1:0,Math.min(1,dt*8));
      idle.setEffectiveWeight(wI); fly.setEffectiveWeight(wF); lift.setEffectiveWeight(wL); walk.setEffectiveWeight(0); fly.timeScale=D.mode==='come'?.5:.7; idle.timeScale=.8; mixer.update(dt); } });
  N.push=()=>{}; N.blocks=()=>false;   // (up on the roofs or in the air: nothing on the ground meets him)
  const tick0=N.tick, st=N.st; st.hold=true; st.h=D.p.h; N.g.rotation.order='YXZ';
  N.tick=(dt,you)=>{ st.to=null; st.face=null; tick0(dt,you); let turn=0;
    if(D.mode==='perch'){ st.x=D.p.x; st.z=D.p.z; st.h=ease(st.h,D.p.h,Math.min(1,dt*2)); D.y=ease(D.y,D.p.y,Math.min(1,dt*4)); D.v=0;
      if((D.t-=dt)<=0){ D.mode='lift'; lift.reset(); lift.setLoop(THREE.LoopOnce); lift.clampWhenFinished=true; lift.timeScale=.8; lift.play(); D.t=0; } }
    else if(D.mode==='lift'){ D.t+=dt; if(D.t>.5){ D.y+=dt*1.2*TI; D.v=ease(D.v,1.2*TI,dt); } if(D.t>CLIPS.GroundToFly.duration/.8){ D.mode='fly'; D.to=sky(); D.fly=25+Math.random()*25; lift.stop(); } }
    else if(D.mode==='fly'){ D.fly-=dt; D.v=ease(D.v,2.2*TI,dt*.8); const want=Math.atan2(D.to.x-st.x,D.to.z-st.z), r=turnTo(st.h,want,.45*dt); st.h=r[0]; turn=r[1]/Math.max(dt,1e-3);
      D.y=ease(D.y,BOD.Y(780)+Math.sin(performance.now()/5000)*TI,dt*.4); if(Math.hypot(D.to.x-st.x,D.to.z-st.z)<4*TI)D.to=sky();
      if(D.fly<=0){ let q; do q=PER[Math.floor(Math.random()*PER.length)]; while(q===D.p&&PER.length>1); D.p=q; D.mode='come'; } }
    else if(D.mode==='come'){ const dx=D.p.x-st.x, dz=D.p.z-st.z, d=Math.hypot(dx,dz);
      if(d>.25*TI){ const r=turnTo(st.h,Math.atan2(dx,dz),(d<5*TI?1.2:.5)*dt); st.h=r[0]; turn=r[1]/Math.max(dt,1e-3); D.v=ease(D.v,d<5*TI?Math.max(.4*TI,d*.5):2*TI,dt*1.5); D.y=ease(D.y,D.p.y+Math.min(d,6*TI)*.35,dt*1.2); }
      else{ D.mode='perch'; D.t=20+Math.random()*40; } }
    if(D.mode!=='perch'){ st.x+=Math.sin(st.h)*D.v*dt; st.z+=Math.cos(st.h)*D.v*dt; }
    D.bank=ease(D.bank,Math.max(-.5,Math.min(.5,-turn*.9)),Math.min(1,dt*2)); D.pitch=ease(D.pitch,D.mode==='lift'?-.15:0,Math.min(1,dt*2));
    N.g.position.set(st.x,D.y,st.z); N.g.rotation.set(D.pitch,st.h,D.mode==='perch'?0:D.bank); };
  window.DRAGONDBG=()=>({mode:D.mode,x:+st.x.toFixed(1),y:+D.y.toFixed(1),z:+st.z.toFixed(1),t:+D.t.toFixed(1)});   // (a test's look)
  if(QS.get('dragonfly'))D.t=1;
  N.mixer=mixer; }
