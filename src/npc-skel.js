// ---- THE SKELETONS (owner, 17 Oct 2026, "can you add these characters into game": Kay Lousberg's KayKit Skeletons 1.1, CC0, free for anything):
// the Warrior, the Mage, the Minion and the Rogue, each with the pack's bones (23) and the pack's own clips, an idle and a walk, so he stands
// breathing and walks on his own legs (tools/skeletons-bake.py reads the .glb files into data/skel.json). Coloured from the pack's palette
// at each point, no texture, shaded as the fish and the bear are (makeNPC: tones in bands, the clothes' shadows, SELF), his eyes a glow lit by
// nothing. They walk the street, anywhere on it, the sidewalks and the road; each armed as the pack arms them
// (the Warrior his blade and a shield, the Mage his staff, the Rogue his crossbow, the Minion bare-handed), the gear held in the rig's hand
// slots. Double-click one and you walk up and wave, as to the others (editor.js's THINGS) ----
{ const S=SKEL, b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), f32=s=>new Float32Array(b(s).buffer), i16=s=>new Int16Array(b(s).buffer), u16=s=>new Uint16Array(b(s).buffer);
  const BN=S.rig.names.map(n=>n.replace(/\./g,'_')), JI=Object.fromEntries(BN.map((n,i)=>[n,i]));   // (a dot in a bone's name would read as a property's: three.js's tracks)
  // a mesh from the bake: its points (16-bit over its box), its colours, its part at each point; with its bones' indices and weights when rigged
  const pts=M=>{ const q=i16(M.p), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3]; return P; };
  const geomOf=(M,rigged)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pts(M),3)); g.setAttribute('color',new THREE.BufferAttribute(b(M.c),3,true)); g.setIndex(new THREE.BufferAttribute(u16(M.i),1));
    g.setAttribute('reg',new THREE.BufferAttribute(M.r?Float32Array.from(b(M.r)):new Float32Array(M.n),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(M.n),1));
    if(rigged){ g.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(b(M.j),4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(b(M.w),4,true)); } return g; };
  // the rig: its bones in their rest pose, each under its parent; its bind matrices
  const rigOf=()=>{ const R=S.rig, bones=R.names.map((n,i)=>{ const B=new THREE.Bone(); B.name=BN[i]; B.position.fromArray(R.t[i]); B.quaternion.fromArray(R.q[i]); return B; });
    R.parent.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); }); const ibm=f32(R.ibm); return {bones,skeleton:new THREE.Skeleton(bones,bones.map((_,i)=>new THREE.Matrix4().fromArray(ibm,i*16)))}; };
  // the clips, 24 frames a second: every bone's turn, and the places of the few bones that move (the hips, the legs' tops)
  const CLIPS={}; for(const [name,C] of Object.entries(S.clips)){ const T=Array.from({length:C.n},(_,k)=>k*C.dur/(C.n-1)), Q=i16(C.q), tracks=[];
    BN.forEach((bn,j)=>{ const v=new Float32Array(C.n*4); for(let k=0;k<C.n;k++)for(let c=0;c<4;c++)v[k*4+c]=Q[(k*BN.length+j)*4+c]/32000; tracks.push(new THREE.QuaternionKeyframeTrack(bn+'.quaternion',T,v)); });
    for(const [bn,p] of Object.entries(C.p))tracks.push(new THREE.VectorKeyframeTrack(bn.replace(/\./g,'_')+'.position',T,f32(p)));
    CLIPS[name]=new THREE.AnimationClip(name,C.dur,tracks); }
  // the far sidewalk (bodega tiles: the road's far kerb to the map's edge, the street's whole run), the street's ground under it
  // ON THE STREET, WALKING AROUND (owner, 17 Oct 2026: "the new skeleton characters should be on street walking around"): the whole street, the
  // shops' sidewalk to the far one and the road between, anywhere on it; never into a wall, the subway's stairs, the musician or each other
  const LANE={x0:BOD.X(52),x1:BOD.X(106),z0:BOD.Z(-76.3),z1:BOD.Z(-61.2)}, HOLE=[BOD.X(MAPSTAIR.x0-.6),BOD.Z(MAPSTAIR.y0),BOD.X(MAPSTAIR.x1+.6),BOD.Z(MAPSTAIR.y1+.6)],
    free=(x,z,R)=>!(x>HOLE[0]-R&&x<HOLE[2]+R&&z>HOLE[1]-R&&z<HOLE[3]+R)&&!SOL.up.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R), WALK=.87;   // (WALK: how far a walk clip carries him a second at its own pace, in his own units: the clips are in place, so his pace sets the clip's)
  const CH=[ ['Warrior','WARRIOR',58,1.55,'Walking_A','Idle_A',.55,[['Blade','handslot_r'],['Shield_Large_A','handslot_l']]],
             ['Mage','MAGE',69,1.5,'Walking_C','Idle_B',.42,[['Staff','handslot_r']]],
             ['Minion','MINION',82,1.4,'Walking_B','Idle_A',.6,[]],
             ['Rogue','ROGUE',95,1.5,'Walking_A','Idle_B',.5,[['Crossbow','handslot_r']]] ];
  for(const [key,name,tx,metres,walkN,idleN,speed,gear] of CH){ const M=S.chars[key], rig=rigOf(), mixer=new THREE.AnimationMixer(rig.bones[0]);
    const idle=mixer.clipAction(CLIPS[idleN]), walk=mixer.clipAction(CLIPS[walkN]); idle.play(); walk.play(); walk.setEffectiveWeight(0); idle.time=Math.random()*idle.getClip().duration; let w=0;
    // (his helmet, hat, hood, cape and cloak lie over him: their shadow on what's under, as the coats' on the fish and the bear)
    const N=makeNPC(null,{key:key.toLowerCase(),name,names:M.parts,lv:'up',group:'bodega',geo:geomOf(M,true),skin:rig,tall:2.166,eye:M.eye,rank:M.parts.map(p=>/Helmet|Hat|Hood|Cape|Cloak/.test(p)?2:0),
      metres,x:BOD.X(tx),z:BOD.Z({58:-67,69:-65.5,82:-68.5,95:-66}[tx]),lane:LANE,free,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.4,speed,stride:0,rock:0,bob:0,
      // the walk fades in as he goes and out as he stops, at the pace his feet would carry him; the idle under it
      anim:(dt,moving,st,s)=>{ if(QS.get('skelrest'))return; w+=((moving?1:0)-w)*Math.min(1,dt*6); walk.setEffectiveWeight(w); idle.setEffectiveWeight(1-w); walk.timeScale=st.v/(WALK*s); mixer.update(dt); }});   // (?skelrest: a test's look at the rest pose)
    for(const [gn,slot] of gear){ const m=new THREE.Mesh(geomOf(S.gear[gn],false),N.me.material); m.castShadow=true; rig.bones[JI[slot]].add(m); }
    N.mixer=mixer; }
  window.SKELDBG=()=>NPCS.filter(N=>N.mixer).map(N=>({key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),to:!!N.st.to,bones:N.me.skeleton.bones.length})); }
