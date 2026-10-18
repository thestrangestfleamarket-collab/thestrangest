// ---- THE TWELVE PAWNS (owner, 17 Oct 2026, the twelve .fbx characters in his Drive: hero_m, hero_f, villager_m, villager_f, ogre,
// ogre_mage, ogre_guard_light, ogre_guard_heavy, skeleton_mage, skeleton_reaper, skeleton_guard_light, skeleton_guard_heavy; "match this same
// rig skeleton ... give them all the same stuff"): chibi figures on one rig (RigPawn: 16 bones, the hands free of any arm), each with the
// pack's own 58 clips and, retold onto their bones, the UAL1 library's 43 (UAL_<name>: tools/retarget-ual.py; the twelve share one clip set,
// hero_m's). Baked by tools/creatures-bake.py into data/pawns.json, coloured from their materials, shaded as the others (makeNPC). They walk
// the whole street as every new character does, on the UAL walk and idle. ?pawnclip=<name> holds them all in a clip; ?sheet=<key> a sheet ----
{ const PW=PAWNS, b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), f32=s=>new Float32Array(b(s).buffer), i16=s=>new Int16Array(b(s).buffer), u16=s=>new Uint16Array(b(s).buffer);
  const pts=M=>{ const q=i16(M.p), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3]; return P; };
  const geomOf=M=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pts(M),3)); g.setAttribute('color',new THREE.BufferAttribute(b(M.c),3,true)); g.setIndex(new THREE.BufferAttribute(u16(M.i),1));
    g.setAttribute('reg',new THREE.BufferAttribute(Float32Array.from(b(M.r)),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(M.n),1));
    g.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(b(M.j),4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(b(M.w),4,true)); return g; };
  const rigOf=R=>{ const bones=R.names.map((n,i)=>{ const B=new THREE.Bone(); B.name=n; B.position.fromArray(R.t[i]); B.quaternion.fromArray(R.q[i]); if(R.s)B.scale.fromArray(R.s[i]); return B; });
    R.parent.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); }); const ibm=f32(R.ibm); return {bones,skeleton:new THREE.Skeleton(bones,bones.map((_,i)=>new THREE.Matrix4().fromArray(ibm,i*16)))}; };
  const R0=PW.hero_m.rig, CLD=PW.hero_m.clips, CLIPS={};
  for(const [name,Cl] of Object.entries(CLD)){ const BN=R0.names, T=Array.from({length:Cl.n},(_,k)=>k*Cl.dur/(Cl.n-1)), Q=i16(Cl.q), tracks=[];
    BN.forEach((bn,j)=>{ const v=new Float32Array(Cl.n*4); for(let k=0;k<Cl.n;k++)for(let c=0;c<4;c++)v[k*4+c]=Q[(k*BN.length+j)*4+c]/32000; tracks.push(new THREE.QuaternionKeyframeTrack(bn+'.quaternion',T,v)); });
    for(const [bn,p] of Object.entries(Cl.p))if(bn!=='root')tracks.push(new THREE.VectorKeyframeTrack(bn+'.position',T,f32(p)));
    CLIPS[name]=new THREE.AnimationClip(name,Cl.dur,tracks); }
  const HOLD=QS.get('pawnclip'), WALKC=QS.get('pawnwalk')||'UAL_Walk_Loop', IDLEC=QS.get('pawnidle')||'UAL_Idle_Loop', WALK=1.6, RUNU=5.5;   // (how far the walk and the sprint carry one a second at their own pace, in his units)
  const PAWNL=[]; window.PAWNL=PAWNL;
  // THE CITY'S STAFF (owner, 17 Oct 2026, the services run by bots: civic.js): eight of the pawns in uniform, a tint laid over the pack's colours
  // (their shading kept): the officers navy, the firefighters red, the carrier blue, the works crew orange, the clerk grey, the medic white
  const UNIFORM={};   /* (no uniforms now: the city's staff are droids, civic.js; the pawns walk the city as themselves) */
  const dressed=(g,t)=>{ if(!t)return g; const c=g.attributes.color.array; for(let i=0;i<c.length;i+=3){ const l=(c[i]*.3+c[i+1]*.59+c[i+2]*.11)/255; for(let j=0;j<3;j++)c[i+j]=Math.min(255,c[i+j]*.4+t[j]*255*.6*(.3+.7*l)); } return g; };
  Object.keys(PW).forEach((key,i)=>{ const D=PW[key], rig=rigOf(D.rig), mixer=new THREE.AnimationMixer(rig.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CLIPS[n])); let cur=null;
    const N=makeNPC(null,{key,name:key.toUpperCase().replace('_',' '),names:D.mesh.parts,lv:'up',group:'bodega',geo:dressed(geomOf(D.mesh),UNIFORM[key]),skin:rig,tall:D.tall,rank:D.mesh.parts.map(()=>0),metres:1.35,x:BOD.XS(66+i*4.4),z:BOD.ZS(i%2?-63.2:-73.6),lane:STLANE,free:stfree,roam:true,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.3,speed:.5,stride:0,rock:0,bob:0,
      brain:HOLD?(dt,you,st)=>{ st.to=null; st.hold=true; }:undefined,
      anim:(dt,moving,st,sc)=>{ let want, ts=1;
        if(HOLD)want=HOLD; else if(N.sheet)want='UAL_A_TPose'; else{ const run=moving&&st.v>1.2*TILE; want=moving?(run?'UAL_Sprint_Loop':WALKC):IDLEC; if(moving)ts=Math.max(.6,st.v/((run?RUNU:WALK)*sc)); }
        if(want!==cur){ const a=act(want); a.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.2).play(); if(cur)act(cur).fadeOut(.2); cur=want; }
        act(cur).timeScale=N.sheet&&!HOLD?0:ts; mixer.update(dt); }});
    N.mixer=mixer; PAWNL.push(N); });
  window.PAWNCAM=(i=0,k=1.6)=>{ const N=PAWNL[i]; UI.setFree(true); UI.camT.set(N.st.x,N.g.position.y+N.H*.5,N.st.z); ppu=ppuTo=PPU*k; };   /* (a test's look) */
  window.PAWNDBG=()=>PAWNL.map(N=>({key:N.key,x:+N.st.x.toFixed(1),z:+N.st.z.toFixed(1),to:!!N.st.to,vis:N.g.visible})); }
