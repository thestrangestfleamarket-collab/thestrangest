// ---- THE CREATURES (owner, 17 Oct 2026, "start importing google drive assets based on most recent and import into game"): the small animated
// animals of his packs (Easy Animated Enemy Pack: the rat, the frog, the snake, the spider, the wasp; Monster Pack Animated by Quaternius:
// the bat, the slime), each with the pack's own bones and clips (tools/creatures-bake.py → data/creatures.json), walked by them as the
// skeletons are (makeNPC with a skin and an anim). On the ground: rats that scurry the street and the park (more of them out after dark),
// frogs that hop about the park's round, a slime that wobbles over the lawn, a snake in the grass, spiders under the trees; in the air: bats
// over the park at night, wasps about the flowers by day; each sized to its real self (a rat a hand long, a bat a hand's span). Coloured as the
// packs colour them (their materials), shaded as the others (makeNPC) ----
{ const C=CREATURES, b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), f32=s=>new Float32Array(b(s).buffer), i16=s=>new Int16Array(b(s).buffer), u16=s=>new Uint16Array(b(s).buffer);
  const pts=M=>{ const q=i16(M.p), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3]; return P; };
  const geomOf=M=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pts(M),3)); g.setAttribute('color',new THREE.BufferAttribute(b(M.c),3,true)); g.setIndex(new THREE.BufferAttribute(u16(M.i),1));
    g.setAttribute('reg',new THREE.BufferAttribute(Float32Array.from(b(M.r)),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(M.n),1));
    g.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(b(M.j),4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(b(M.w),4,true)); return g; };
  const rigOf=R=>{ const bones=R.names.map((n,i)=>{ const B=new THREE.Bone(); B.name=n; B.position.fromArray(R.t[i]); B.quaternion.fromArray(R.q[i]); if(R.s)B.scale.fromArray(R.s[i]); return B; });   // (R.s: a root's size, the armature's over it)
    R.parent.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); }); const ibm=f32(R.ibm); return {bones,skeleton:new THREE.Skeleton(bones,bones.map((_,i)=>new THREE.Matrix4().fromArray(ibm,i*16)))}; };
  // its clips, 24 a second: every bone's turn, the places of the bones that move
  const clipsOf=D=>{ const BN=D.rig.names, out={}; for(const [name,Cl] of Object.entries(D.clips)){ const T=Array.from({length:Cl.n},(_,k)=>k*Cl.dur/(Cl.n-1)), Q=i16(Cl.q), tracks=[];
      BN.forEach((bn,j)=>{ const v=new Float32Array(Cl.n*4); for(let k=0;k<Cl.n;k++)for(let c=0;c<4;c++)v[k*4+c]=Q[(k*BN.length+j)*4+c]/32000; tracks.push(new THREE.QuaternionKeyframeTrack(bn+'.quaternion',T,v)); });
      for(const [bn,p] of Object.entries(Cl.p))tracks.push(new THREE.VectorKeyframeTrack(bn+'.position',T,f32(p)));
      out[name]=new THREE.AnimationClip(name,Cl.dur,tracks); } return out; };
  // the grounds they keep to: the park's lawn, the whole street and the park; where they may stand (not in a wall, a trunk, a rock, the stairs)
  const M=BOD.MAP, X=BOD.XS, Z=BOD.ZS, PARKL={x0:X(M.x0+2),x1:X(M.x1-2),z0:Z(PARK.y0+1.5),z1:Z(PARK.y1-1)}, ALL={x0:X(M.x0+2),x1:X(M.x1-2),z0:Z(-76.3),z1:Z(PARK.y1-1)},
    HOLE=[X(MAPSTAIR.x0-.6),Z(MAPSTAIR.y0),X(MAPSTAIR.x1+.6),Z(MAPSTAIR.y1+.6)], free=(x,z,R)=>!(x>HOLE[0]-R&&x<HOLE[2]+R&&z>HOLE[1]-R&&z<HOLE[3]+R)&&!SOL.up.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R);
  // each kind: its clips for going and standing, its pace (its own units a second at the clip's own pace), the height it keeps (a flyer), when it's out
  const KIND={Rat:{walk:'Rat_Walk',run:'Rat_Run',idle:'Rat_Idle',pace:3,lane:ALL,night:.6},Frog:{walk:'Frog_Jump',idle:'Frog_Idle',pace:2.4,lane:PARKL,hop:[.33,.78]},Slime:{walk:'Slime_Walk',idle:'Slime_Idle',pace:1.2,lane:PARKL,turn:-Math.PI/2},
    Snake:{walk:'Snake_Walk',idle:'Snake_Idle',pace:2,lane:PARKL},Spider:{walk:'Spider_Walk',idle:'Spider_Idle',pace:3,lane:PARKL},Bat:{walk:'Bat_Flying',idle:'Bat_Flying',pace:3,lane:PARKL,fly:[6,13],night:1},Wasp:{walk:'Wasp_Flying',idle:'Wasp_Flying',pace:3,lane:PARKL,fly:[1,2.5],day:1,turn:-Math.PI/2}};   // (hop: the part of the jump's clip it's in the air, the only time it moves; turn: a model that faces its pack's x, not forward)
  const CREATS=[]; window.CREATS=CREATS;
  // (key, name, metres tall, where it starts (bodega tiles), its pace in tiles a second, which way the pack's model faces (a turn))
  const CH=[['Rat','RAT',.22,[60,-73.5],.9,0],['Rat','RAT',.22,[95,-62.5],.9,0],['Rat','RAT',.22,[110,-50],.9,0],['Frog','FROG',.28,[70,-44],.35,0],['Frog','FROG',.26,[75,-50],.35,0],
    ['Slime','SLIME',.45,[62,-40],.25,0],['Snake','SNAKE',.42,[90,-47],.3,0],['Spider','SPIDER',.4,[57,-52],.45,0],['Spider','SPIDER',.36,[99,-41],.45,0],
    ['Bat','BAT',.55,[72,-45],1.1,0],['Bat','BAT',.5,[85,-50],1.1,0],['Bat','BAT',.6,[60,-40],1.1,0],['Wasp','WASP',.22,[64,-55],.8,0],['Wasp','WASP',.2,[80,-57],.8,0],['Wasp','WASP',.2,[102,-44],.8,0]];
  for(const [key,name,metres,[tx,tz],speed,turn] of CH){ const D=C[key], K=KIND[key], rig=rigOf(D.rig), CL=clipsOf(D), mixer=new THREE.AnimationMixer(rig.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CL[n]));
    const st2={fly:K.fly?K.fly[0]+Math.random()*(K.fly[1]-K.fly[0]):0,hid:false,t:Math.random()*10}; let cur=null;
    const N=makeNPC(null,{key:key.toLowerCase(),name,names:D.mesh.parts,lv:'up',group:'bodega',geo:geomOf(D.mesh),skin:rig,tall:D.tall,rank:D.mesh.parts.map(()=>0),metres,x:X(tx),z:Z(tz),lane:K.lane,free,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.12,speed,stride:0,rock:0,bob:0,
      pick:K.fly?st=>{ const L=K.lane; st.to={x:L.x0+Math.random()*(L.x1-L.x0),z:L.z0+Math.random()*(L.z1-L.z0)}; st2.fly=K.fly[0]+Math.random()*(K.fly[1]-K.fly[0]); }:undefined,
      anim:(dt,moving,st,sc)=>{ st2.t+=dt;
        // out by day or by night: a bat sleeps the day away, a wasp the night (gone from sight, kept still); a rat is out more after dark
        const dark=CLOCK.dark(), out=K.night===1?dark:K.day?!dark:true; if(out===st2.hid){ st2.hid=!out; N.g.visible=out; st.hold=!out; if(!out)st.to=null; }
        if(!out)return;
        const run=K.run&&moving&&st.v>1.2*TILE, want=moving?(run?K.run:K.walk):K.idle; if(want!==cur){ const a=act(want); a.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.2).play(); if(cur)act(cur).fadeOut(.2); cur=want; }
        if(K.hop){ const a=act(cur), ph=(a.time/a.getClip().duration)%1, air=moving&&ph>K.hop[0]&&ph<K.hop[1]; st.v=speed*TILE*(air?1/(K.hop[1]-K.hop[0]):.004); a.timeScale=1; }   // (a hopper: still on the ground, its whole way in the air)
        else act(cur).timeScale=moving?Math.max(.6,st.v/(K.pace*sc)):1; mixer.update(dt);
        // a flyer: up at its height, bobbing, its wings' clip always; its heading a bank
        if(K.fly){ N.g.position.y+=st2.fly*TILE/.84*.5+Math.sin(st2.t*2.1)*.15; N.body.rotation.z=moving?Math.sin(st2.t*1.3)*.15:0; } }});
    N.g.rotation.order='YXZ'; N.me.rotation.y=turn+(K.turn||0); N.me.position.set(0,0,0);   // (a pack's model that faces another way: turned on its own mesh)
    if(K.fly){ N.blocks=()=>false; N.push=()=>{}; N.st.v=speed*TILE; }
    N.mixer=mixer; CREATS.push(N); }
  window.CREATDBG=()=>CREATS.map(N=>({key:N.key,x:+N.st.x.toFixed(1),z:+N.st.z.toFixed(1),y:+N.g.position.y.toFixed(2),to:!!N.st.to,vis:N.g.visible})); }
