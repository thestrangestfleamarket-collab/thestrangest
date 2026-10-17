// ---- THE UAL MANNEQUIN (owner, 17 Oct 2026, his Drive's UAL1_Standard.glb, "can you show me what that would look like in game?"): the
// animation library's standard body (an Unreal-style rig of 65 bones, fingers and all) with its 43 clips (idle, walk, jog, sprint, crouch,
// jump, swim, sit, dance, punches, a sword, a pistol, a spell, hits, a death), baked as the creatures are (tools/creatures-bake.py, OUT=data/ual.json)
// and walked through makeNPC like the skeletons: his own clips under his pace, an idle when he stands. His colours the file's two flat materials
// (the orange body, the purple joints), no texture; 13,744 triangles as the file has them (not yet cut to half: a preview). He walks the whole
// street. ?ualclip=Dance_Loop (or any clip's name) holds him in that clip, for a look ----
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
  const WALK=1.35, JOG=2.6, SPRINT=5;   // (how far each clip carries him a second at its own pace, in metres: the clips are in place, so his pace sets the clip's)
  const rig=rigOf(D.rig), CL=clipsOf(), mixer=new THREE.AnimationMixer(rig.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CL[n])); let cur=null;
  const HOLD=QS.get('ualclip');
  const N=makeNPC(null,{key:'ual',name:'MANNEQUIN',names:D.mesh.parts,lv:'up',group:'bodega',geo:geomOf(D.mesh),skin:rig,tall:D.tall,rank:D.mesh.parts.map(()=>0),metres:1.83,x:BOD.XS(72),z:BOD.ZS(-70),lane:STLANE,free:stfree,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.3,speed:.6,stride:0,rock:0,bob:0,
    brain:HOLD?(dt,you,st)=>{ st.to=null; st.hold=true; }:undefined,
    anim:(dt,moving,st,sc)=>{ let want, ts=1;
      if(N.sheet||HOLD==='T')want='A_TPose'; else if(HOLD)want=HOLD; else{ const run=moving&&st.v>1.2*TILE, sprint=moving&&st.v>2.6*TILE; want=moving?(sprint?'Sprint_Loop':run?'Jog_Fwd_Loop':'Walk_Loop'):'Idle_Loop'; if(moving)ts=Math.max(.6,st.v/((sprint?SPRINT:run?JOG:WALK)*sc)); }
      if(want!==cur){ const a=act(want); a.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.2).play(); if(cur)act(cur).fadeOut(.2); cur=want; }
      act(cur).timeScale=N.sheet?0:ts; mixer.update(dt); }});
  N.mixer=mixer; window.UALN=N; window.UALCAM=(k=1.5)=>{ UI.setFree(true); UI.camT.set(N.st.x,N.g.position.y+N.H*.5,N.st.z); ppu=ppuTo=PPU*k; }; /* (a test's look: the free camera on his middle) */ window.UALDBG=()=>({key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),to:!!N.st.to,vis:N.g.visible,clip:cur}); }
