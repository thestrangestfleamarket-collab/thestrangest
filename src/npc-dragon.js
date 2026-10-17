// ---- THE DRAGON (owner, 17 Oct 2026, Dragon2.glb in his G folder: rigged, with its own clips): an old dragon who keeps the road, walking it
// up and down with his menacing walk, stopping to look about; when you come close he rears and snaps (his attack clip), then thinks better of
// it; now and then he takes off (his ground-to-fly clip) and flies a slow loop over the street before landing where he was going. Baked by
// tools/kit-bake.py into data/dragon.json (the skeletons' format, npc-skel.js's reader: his bones, his skin coloured from his texture, his
// clips); made by makeNPC (lit by the lamps, shaded like the rest) with his own ways on top ----
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
  // the road and the far sidewalk, his beat (the street's kerbs found as the characters find them)
  const G=MODS.bodega.ground, xm=(BOUND.x0+BOUND.x1)/2; let zc=null, zf=null; for(let z=BOUND.z0;z<BOUND.z1;z+=0.02){ const g=G(xm,z); if(zc==null&&g<-.01)zc=z; if(zc!=null&&zf==null&&g>-.01&&z>zc)zf=z; }
  const LANE={x0:BOUND.x0+3,x1:BOUND.x1-3,z0:zc+.8,z1:zf-.8};
  let w=0, mode='ground', air=0, airTo=0, snap=0;
  const N=makeNPC(null,{key:'dragon',name:'THE DRAGON',names:M.parts,lv:'up',group:'bodega',geo:geomOf(M),skin:rig,tall:M.tall,eye:-1,rank:[0],metres:3.2,x:xm+4,z:(zc+zf)/2,lane:LANE,ground:(x,z)=>G(x,z),radius:.9,speed:.7,stride:0,rock:0,bob:0,
    anim:(dt,moving,st,s)=>{ // the walk fades in as he goes; in the air the flying loop; the attack over whatever he's doing
      const flying=mode==='air'; w+=((moving&&!flying?1:0)-w)*Math.min(1,dt*5); walk.setEffectiveWeight(w); fly.setEffectiveWeight(flying?1:0); idle.setEffectiveWeight(flying?0:1-w); walk.timeScale=1.1; mixer.update(dt); } });
  // his own ways over makeNPC's walk: the snap at you, the flight
  const tick0=N.tick, st=N.st, YOU=typeof pos!=='undefined'?pos:null;
  N.tick=(dt,you)=>{ tick0(dt,you); const d=Math.hypot(you.x-st.x,you.z-st.z);
    if(mode==='ground'&&d<2.6*TILE&&snap<=0&&!attack.isRunning()){ attack.reset().play(); snap=9+Math.random()*8; st.to=null; st.wait=1.6; }
    snap-=dt;
    if(mode==='ground'&&!st.to&&st.wait<.1&&Math.random()<dt*.06){ mode='lift'; lift.reset().play(); st.wait=1e9; airTo=4.5; }
    if(mode==='lift'){ if(!lift.isRunning()){ mode='air'; lift.stop(); st.to={x:LANE.x0+Math.random()*(LANE.x1-LANE.x0),z:LANE.z0+Math.random()*(LANE.z1-LANE.z0)}; st.v=1.6*TILE; air=0; } }
    if(mode==='air'){ air+=(airTo-air)*Math.min(1,dt*1.2); if(!st.to&&airTo>0){ airTo=0; } if(airTo===0&&air<.08){ mode='ground'; air=0; st.v=.7*TILE; st.wait=2+Math.random()*3; } }
    N.g.position.y+=air; };
  N.mixer=mixer; }
