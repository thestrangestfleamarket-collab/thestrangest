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
  const M=BOD.MAP, X=BOD.XS, Z=BOD.ZS, PARKL={x0:X(PARK.x0+PARK.ox+2),x1:X(PARK.x1+PARK.ox-2),z0:Z(PARK.y0+PARK.oy+1.5),z1:Z(PARK.y1+PARK.oy-1)}, ALL={x0:X(M.x0+2),x1:X(M.x1-2),z0:Z(-76.3),z1:Z(PARK.y1+PARK.oy-1)},   /* (the park as the map's layout has it: park.js) */
    HOLE=[X(MAPSTAIR.x0-.6),Z(MAPSTAIR.y0),X(MAPSTAIR.x1+.6),Z(MAPSTAIR.y1+.6)], free=(x,z,R)=>!(x>HOLE[0]-R&&x<HOLE[2]+R&&z>HOLE[1]-R&&z<HOLE[3]+R)&&!SOL.up.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R);
  // each kind: its clips for going and standing, its pace (its own units a second at the clip's own pace), the height it keeps (a flyer), when it's out
  const KIND={Rat:{walk:'Rat_Walk',run:'Rat_Run',idle:'Rat_Idle',pace:3,lane:ALL,night:.6},Frog:{walk:'Frog_Jump',idle:'Frog_Idle',pace:2.4,lane:PARKL,hop:[.33,.78]},Slime:{walk:'Slime_Walk',idle:'Slime_Idle',pace:1.2,lane:PARKL,turn:-Math.PI/2},
    Snake:{walk:'Snake_Walk',idle:'Snake_Idle',pace:2,lane:PARKL},Spider:{walk:'Spider_Walk',idle:'Spider_Idle',pace:3,lane:PARKL},Bat:{walk:'Bat_Flying',idle:'Bat_Flying',pace:3,lane:PARKL,fly:[6,13],night:1},Wasp:{walk:'Wasp_Flying',idle:'Wasp_Flying',pace:3,lane:PARKL,fly:[1,2.5],day:1,turn:-Math.PI/2}};   // (hop: the part of the jump's clip it's in the air, the only time it moves; turn: a model that faces its pack's x, not forward)
  // THEIR PATTERNS (owner, 18 Oct 2026: "the frogs and spiders etc are all 1 solid color, need to be more realistic patterns and colors and
  // shades, depth"): each face its own colour, from its kind's pattern at the face's middle in the model's rest (the mesh unshared, so a mark has a
  // hard pixel edge): the spider's dark brown banded legs and a pale chevron down its abdomen, the frog's green back blotched dark over a cream
  // belly, the rat's mottled grey-brown with a darker spine and pale belly, the snake's diamonds, the wasp's stripes and veined wings, the bat's
  // fur and leathery wings with their veins, the slime's bubbles; every one darker underneath and toward its foot (the depth), lighter on its back.
  // Painted once at load; the same triangles (a few more points), no new program
  const PAINT=(()=>{ const hh=(x,y,z)=>{ const v=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return v-Math.floor(v); }, vn=(x,y,z)=>{ const i=Math.floor(x), j=Math.floor(y), k=Math.floor(z), f=x-i, g=y-j, e=z-k, s=t=>t*t*(3-2*t), u=s(f), v=s(g), w=s(e), L=(a,b,t)=>a+(b-a)*t;
      return L(L(L(hh(i,j,k),hh(i+1,j,k),u),L(hh(i,j+1,k),hh(i+1,j+1,k),u),v),L(L(hh(i,j,k+1),hh(i+1,j,k+1),u),L(hh(i,j+1,k+1),hh(i+1,j+1,k+1),u),v),w); };
    const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t], mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
    // (q: the face's middle over the model's box, 0 to 1 each way; n: its normal; c: the pack's colour; r: its part; P: the middle itself)
    const K={
      Spider:(q,n,c,r,P)=>{ if(r===1)return c; const d=Math.hypot(q[0]-.5,q[2]-.48), body=d<.2&&q[1]>.25, abd=body&&q[2]<.45;
        let o=[58,44,34]; if(!body){ o=Math.floor(d*30+vn(P[0]*2,0,P[2]*2)*.6)%3===0?[132,100,66]:[50,38,30]; }   // (the legs: pale rings between the dark)
        else if(abd&&n[1]>.2){ const ch=Math.abs(q[0]-.5)*6+q[2]*10; if((ch%1)<.28&&Math.abs(q[0]-.5)<.09)o=[168,136,92]; else if(Math.abs(q[0]-.5)<.02)o=[118,90,62]; }   // (the chevrons down its back)
        return mul(o,.86+.28*vn(P[0]*6,P[1]*6,P[2]*6)); },
      Frog:(q,n,c,r,P)=>{ if(r>=2)return c; const belly=n[1]<-.25||q[1]<.2;
        if(r===1||belly)return mul(mix([226,214,160],[200,190,128],vn(P[0]*4,P[1]*4,P[2]*4)),1);
        const b=vn(P[0]*2.2+3,P[1]*2.2,P[2]*2.2), side=n[1]<.35; let o=b>.62?[40,78,34]:b>.55?[56,96,42]:[92,146,58]; if(side)o=mix(o,[150,160,84],.35);
        if(Math.abs(q[0]-.5)<.03&&n[1]>.5)o=[150,178,90]; return mul(o,.9+.2*vn(P[0]*9,P[1]*9,P[2]*9)); },   // (a pale line down its spine)
      Rat:(q,n,c,r,P)=>{ if(r===1)return mul(c,.85+.25*q[1]); const f=vn(P[0]*5,P[1]*5,P[2]*5), belly=n[1]<-.3;
        let o=mix([86,76,68],[124,112,98],f); if(belly)o=[176,166,150]; else if(n[1]>.6&&Math.abs(q[0]-.5)<.12)o=mul(o,.78); return o; },
      Snake:(q,n,c,r,P)=>{ if(r>=2&&r!==3)return c; if(r===3)return c; const belly=n[1]<-.3;
        if(belly)return [214,200,150]; const a=P[1]*3.2+Math.atan2(P[2]-.3,P[0])*.8, d=Math.abs((a%1+1)%1-.5)*2, l=Math.abs(n[0])*1.1;   // (along it and round it)
        const dm=d+l*.6; return dm<.55?[52,66,36]:dm<.7?[176,160,96]:mul([96,120,62],.9+.2*vn(P[0]*5,P[1]*5,P[2]*5)); },
      Wasp:(q,n,c,r,P)=>{ if(r===3){ const v=Math.abs(Math.sin(P[0]*9+P[2]*5))<.12||Math.abs(Math.sin(P[2]*14))<.1; return v?[90,110,118]:[176,214,226]; }   // (the wings: veins)
        if(r===2||r===1){ const back=q[0]<.42; return back&&Math.floor(P[0]*5.5+10)%2===0?[30,26,22]:r===2?[230,190,60]:[200,96,30]; } return c; },
      Bat:(q,n,c,r,P)=>{ if(r>=2)return c; const wing=Math.abs(q[0]-.5)>.18;
        if(wing){ const v=Math.abs(Math.sin(Math.atan2(P[1]-3,P[0])*7))<.14; return v?[24,18,28]:mix([62,44,58],[86,62,70],vn(P[0]*3,P[1]*3,P[2]*3)); }   // (the leather between the fingers' bones)
        return r===1?mix([140,104,70],[170,130,84],vn(P[0]*6,P[1]*6,P[2]*6)):mix([60,44,40],[84,62,52],vn(P[0]*6,P[1]*6,P[2]*6)); },
      Slime:(q,n,c,r,P)=>{ if(r===1)return c; const b=vn(P[0]*3,P[1]*3,P[2]*3); let o=mix([70,150,64],[136,214,104],q[1]); if(b>.68)o=[176,236,150]; if(n[1]>.75&&q[1]>.8)o=[214,250,196]; return o; } };
    return (key,g)=>{ const f=K[key]; if(!f)return g; g=g.toNonIndexed(); const p=g.attributes.position.array, c=g.attributes.color.array, R=g.attributes.reg.array;
      let lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9]; for(let i=0;i<p.length;i+=3)for(let j=0;j<3;j++){ lo[j]=Math.min(lo[j],p[i+j]); hi[j]=Math.max(hi[j],p[i+j]); }
      const A=new THREE.Vector3(), B=new THREE.Vector3(), C_=new THREE.Vector3();
      for(let t=0;t<p.length/9;t++){ const i=t*9; A.fromArray(p,i); B.fromArray(p,i+3); C_.fromArray(p,i+6); const P=[(A.x+B.x+C_.x)/3,(A.y+B.y+C_.y)/3,(A.z+B.z+C_.z)/3], N=B.clone().sub(A).cross(C_.clone().sub(A)).normalize();
        const q=[0,1,2].map(j=>(P[j]-lo[j])/Math.max(1e-6,hi[j]-lo[j])), col=[c[i],c[i+1],c[i+2]].map(v=>v*(c instanceof Uint8Array?1:255)), o=f(q,[N.x,N.y,N.z],col,Math.round(R[t*3]),P);
        const dep=(.68+.32*Math.min(1,q[1]*1.6))*(N.y>.5?1.06:N.y<-.3?.78:1);   // (the depth: darker toward its foot and underneath)
        for(let k=0;k<3;k++)for(let j=0;j<3;j++){ const v=Math.max(0,Math.min(255,o[j]*dep)); c[i+k*3+j]=c instanceof Uint8Array?Math.round(v):v/255; } }
      g.attributes.color.needsUpdate=true; return g; }; })();
  const CREATS=[]; window.CREATS=CREATS;
  // (key, name, metres tall, where it starts (bodega tiles), its pace in tiles a second, which way the pack's model faces (a turn))
  const CH=[['Rat','RAT',.22,[60,-73.5],.9,0],['Rat','RAT',.22,[95,-62.5],.9,0],['Rat','RAT',.22,[110,-50],.9,0],['Frog','FROG',.28,[70,-44],.35,0],['Frog','FROG',.26,[75,-50],.35,0],
    ['Slime','SLIME',.45,[62,-40],.25,0],['Snake','SNAKE',.42,[90,-47],.3,0],['Spider','SPIDER',.4,[57,-52],.45,0],['Spider','SPIDER',.36,[99,-41],.45,0],
    ['Bat','BAT',.55,[72,-45],1.1,0],['Bat','BAT',.5,[85,-50],1.1,0],['Bat','BAT',.6,[60,-40],1.1,0],['Wasp','WASP',.22,[64,-55],.8,0],['Wasp','WASP',.2,[80,-57],.8,0],['Wasp','WASP',.2,[102,-44],.8,0]];
  for(const [key,name,metres,[tx,tz],speed,turn] of CH){ const D=C[key], K=KIND[key], rig=rigOf(D.rig), CL=clipsOf(D), mixer=new THREE.AnimationMixer(rig.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CL[n]));
    const st2={fly:K.fly?K.fly[0]+Math.random()*(K.fly[1]-K.fly[0]):0,hid:false,t:Math.random()*10}; let cur=null;
    const N=makeNPC(null,{key:key.toLowerCase(),name,names:D.mesh.parts,lv:'up',group:'bodega',geo:PAINT(key,geomOf(D.mesh)),skin:rig,tall:D.tall,rank:D.mesh.parts.map(()=>0),metres,x:X(tx),z:Z(tz),lane:K.lane,free,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.12,speed,stride:0,rock:0,bob:0,
      pick:K.fly?st=>{ const L=K.lane; st.to={x:L.x0+Math.random()*(L.x1-L.x0),z:L.z0+Math.random()*(L.z1-L.z0)}; st2.fly=K.fly[0]+Math.random()*(K.fly[1]-K.fly[0]); }
        // (THE WATERING HOLE, owner 18 Oct 2026: "the toads and other life will drink from it": a walker of the park, now and then, to the pond's edge
        // to drink (st2.drink: there, facing the water, a long while); else a spot of its own ground)
        :st=>{ const P=window.POND, L=K.lane; st2.drink=false; st.face=null; if(P&&P.ready&&K.lane===PARKL&&Math.random()<.4){ const e=P.edge(); if(free(e.x,e.z,.12*TILE)){ st.to=e; st2.drink=true; return; } }
          for(let k=0;k<12;k++){ const p={x:L.x0+Math.random()*(L.x1-L.x0),z:L.z0+Math.random()*(L.z1-L.z0)}; if(free(p.x,p.z,.12*TILE)){ st.to=p; return; } } st.to=null; st.wait=1; },
      anim:(dt,moving,st,sc)=>{ st2.t+=dt;
        // out by day or by night: a bat sleeps the day away, a wasp the night (gone from sight, kept still); a rat is out more after dark
        const dark=CLOCK.dark(), out=K.night===1?dark:K.day?!dark:true; if(out===st2.hid){ st2.hid=!out; N.g.visible=out; st.hold=!out; if(!out)st.to=null; }
        if(!out)return;
        if(st2.drink&&!st.to&&window.POND&&POND.c){ st.face={x:POND.c.x,z:POND.c.z}; st.wait=Math.max(st.wait||0,6); st2.drink=false; }   // (at the water: facing it, a long drink)
        const run=K.run&&moving&&st.v>1.2*TILE, want=moving?(run?K.run:K.walk):K.idle; if(want!==cur){ const a=act(want); a.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.2).play(); if(cur)act(cur).fadeOut(.2); cur=want; }
        if(K.hop){ const a=act(cur), ph=(a.time/a.getClip().duration)%1, air=moving&&ph>K.hop[0]&&ph<K.hop[1]; st.v=speed*TILE*(air?1/(K.hop[1]-K.hop[0]):.004); a.timeScale=1; }   // (a hopper: still on the ground, its whole way in the air)
        else act(cur).timeScale=moving?Math.max(.6,st.v/(K.pace*sc)):1; mixer.update(dt);
        // a flyer: up at its height, bobbing, its wings' clip always; its heading a bank
        if(K.fly){ N.g.position.y+=st2.fly*TILE/.84*.5+Math.sin(st2.t*2.1)*.15; N.body.rotation.z=moving?Math.sin(st2.t*1.3)*.15:0; } }});
    N.g.rotation.order='YXZ'; N.me.rotation.y=turn+(K.turn||0); N.me.position.set(0,0,0);   // (a pack's model that faces another way: turned on its own mesh)
    if(K.fly){ N.blocks=()=>false; N.push=()=>{}; N.st.v=speed*TILE; }
    N.mixer=mixer; CREATS.push(N); }
  window.CREATDBG=()=>CREATS.map(N=>({key:N.key,x:+N.st.x.toFixed(1),z:+N.st.z.toFixed(1),y:+N.g.position.y.toFixed(2),to:!!N.st.to,vis:N.g.visible})); }
