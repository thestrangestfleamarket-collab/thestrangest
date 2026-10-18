// ---- THE UAL MANNEQUIN'S KIT: the UAL1 animation library's standard body (his Drive's UAL1_Standard.glb: an Unreal-style rig of 65 bones
// with its 43 clips, baked as the creatures are, tools/creatures-bake.py with SIMP=0.5 -> data/ual.json: 6,872 triangles, half the file's), read
// once and shared (UALK): his mesh, his rig, his clips and a mixer's way of playing them. Used by the playable mannequin (playas.js, GRAPHICS'
// AVATAR). (Owner, 18 Oct 2026: "remoev these droids from game completely": the four security droids that walked this body round the loop,
// and the six civic droids made from it (civic.js), are gone; this file was npc-droids.js.) Nothing is drawn or run here ----
{ const D=UAL.ual, b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), f32=s=>new Float32Array(b(s).buffer), i16=s=>new Int16Array(b(s).buffer), u16=s=>new Uint16Array(b(s).buffer);
  const pts=M=>{ const q=i16(M.p), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3]; return P; };
  const geomOf=M=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pts(M),3)); g.setAttribute('color',new THREE.BufferAttribute(b(M.c),3,true)); g.setIndex(new THREE.BufferAttribute(u16(M.i),1));
    g.setAttribute('reg',new THREE.BufferAttribute(Float32Array.from(b(M.r)),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(M.n),1));
    g.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(b(M.j),4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(b(M.w),4,true)); return g; };
  const rigOf=R=>{ const bones=R.names.map((n,i)=>{ const B=new THREE.Bone(); B.name=n; B.position.fromArray(R.t[i]); B.quaternion.fromArray(R.q[i]); if(R.s)B.scale.fromArray(R.s[i]); return B; });
    R.parent.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); }); const ibm=f32(R.ibm); return {bones,skeleton:new THREE.Skeleton(bones,bones.map((_,i)=>new THREE.Matrix4().fromArray(ibm,i*16)))}; };
  const clipsOf=()=>{ const BN=D.rig.names, out={}; for(const [name,Cl] of Object.entries(D.clips)){ const T=Array.from({length:Cl.n},(_,k)=>k*Cl.dur/(Cl.n-1)), Q=i16(Cl.q), tracks=[];
      BN.forEach((bn,j)=>{ const v=new Float32Array(Cl.n*4); for(let k=0;k<Cl.n;k++)for(let c=0;c<4;c++)v[k*4+c]=Q[(k*BN.length+j)*4+c]/32000; tracks.push(new THREE.QuaternionKeyframeTrack(bn+'.quaternion',T,v)); });
      for(const [bn,p] of Object.entries(Cl.p))if(bn!=='root')tracks.push(new THREE.VectorKeyframeTrack(bn+'.position',T,f32(p)));   // (the root's own travel, if any, never: he goes where makeNPC walks him)
      out[name]=new THREE.AnimationClip(name,Cl.dur,tracks); } return out; };
  const CLIPS=clipsOf(), WALK=1.35, RUNU=5;   // (how far the formal walk and the sprint carry him a second at their own pace, in metres: the clips are in place, so his pace sets the clip's)
  // HIS MOVES: every clip an action on his mixer, faded in and out; under it his going (the beat's walk, the sprint, or standing), over it one
  // move at a time (a stun shot, a jab, a word on the radio) played through once (the guards' own way, npc-skel.js)
  const Anim=mixer=>{ const A={}, W={}, act=n=>A[n]||(A[n]=mixer.clipAction(CLIPS[n])); const M={base:'Idle_Loop',ts:1,once:null};
    M.play=(n,o={})=>{ const a=act(n); a.reset(); a.setLoop(THREE.LoopOnce,1); a.clampWhenFinished=true; a.timeScale=o.speed||1; a.play(); W[n]=W[n]||0; M.once={n,t:0,d:CLIPS[n].duration/(o.speed||1),hold:o.hold,then:o.then,at:o.at,fired:false}; };
    M.clear=()=>{ M.once=null; };
    M.update=dt=>{ const O=M.once; if(O){ O.t+=dt; if(O.at&&!O.fired&&O.t>=O.at[0]*O.d){ O.fired=true; O.at[1](); } if(O.t>=O.d&&!O.hold){ M.once=null; O.then&&O.then(); } }
      const tgt=M.once?M.once.n:M.base; act(M.base).timeScale=M.ts;
      for(const n of new Set([...Object.keys(W),tgt])){ const a=act(n); W[n]=W[n]??0; W[n]+=((n===tgt?1:0)-W[n])*Math.min(1,dt*10);
        if(W[n]>.01){ if(!a.isRunning()&&n!==(M.once&&M.once.n)){ a.setLoop(THREE.LoopRepeat,Infinity); a.play(); } a.setEffectiveWeight(W[n]); } else{ a.stop(); delete W[n]; } }
      mixer.update(dt); };
    return M; };
  window.UALK={D,geomOf,rigOf,CLIPS,Anim};   // (the mannequin's kit, shared: you as him, src/playas.js)
  window.SCN=()=>({scene,pos,W3,THREE}); window.SUNV=()=>CLOCK.sunV;   /* (a test's reach into the page) */
  window.CAMAT=(x,y,z,k=1.6)=>{ UI.setFree(true); UI.camT.set(x,y,z); ppu=ppuTo=PPU*k; };   /* (a test's look anywhere: the free camera on a point) */ }
