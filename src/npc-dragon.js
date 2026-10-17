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
  const rigOf=()=>{ const R=S.rig, bones=R.names.map((n,i)=>{ const B=new THREE.Bone(); B.name=n; B.position.fromArray(R.t[i]); B.quaternion.fromArray(R.q[i]); if(R.s)B.scale.fromArray(R.s[i]); return B; });
    R.parent.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); }); const ibm=f32(R.ibm); return {bones,skeleton:new THREE.Skeleton(bones,bones.map((_,i)=>new THREE.Matrix4().fromArray(ibm,i*16)))}; };
  const CLIPS={}; for(const [name,C] of Object.entries(S.clips)){ const T=Array.from({length:C.n},(_,k)=>k*C.dur/(C.n-1)), Q=i16(C.q), tracks=[];
    BN.forEach((bn,j)=>{ const v=new Float32Array(C.n*4); for(let k=0;k<C.n;k++)for(let c=0;c<4;c++)v[k*4+c]=Q[(k*BN.length+j)*4+c]/32000; tracks.push(new THREE.QuaternionKeyframeTrack(bn+'.quaternion',T,v)); });
    for(const [bn,p] of Object.entries(C.p))tracks.push(new THREE.VectorKeyframeTrack(bn+'.position',T,f32(p)));
    CLIPS[name]=new THREE.AnimationClip(name,C.dur,tracks); }
  // ---- THE DRAGONS (owner, 17 Oct 2026: "lets make the dragons all green (4 shades) and 20% as big, have them flying all around city and mostly
  // park. add 10 of them. they breath large fire balls"): ten, each a fifth his old size, his colours made four greens (dark to light, by
  // how light each part was); each flies his own way, mostly over the green round the street (the park), sometimes over the street, now and
  // then down onto a ledge a while; and now and then breathes a large fireball down ahead of him: a burning ball (glowing, lighting the
  // ground, sparks trailing) that bursts where it lands; on you, it hurts (VIT.hurt), as on anyone (their hp) ----
  const M=S.chars.Dragon, GR=['#0d2410','#163a19','#225023','#2f6630'].map(h=>new THREE.Color(h));
  const greenGeo=()=>{ const g=geomOf(M), c=g.attributes.color, n=c.count, L=new Float32Array(n); for(let i=0;i<n;i++)L[i]=c.getX(i)*.3+c.getY(i)*.59+c.getZ(i)*.11;
    const so=[...L].sort((a,b)=>a-b), q=[so[Math.floor(n*.25)],so[Math.floor(n*.5)],so[Math.floor(n*.75)]], arr=new Uint8Array(n*3);
    for(let i=0;i<n;i++){ const k=L[i]<q[0]?0:L[i]<q[1]?1:L[i]<q[2]?2:3, C=GR[k]; arr[i*3]=C.r*255; arr[i*3+1]=C.g*255; arr[i*3+2]=C.b*255; }   // (sRGB numbers as the bake wrote them)
    g.setAttribute('color',new THREE.BufferAttribute(arr,3,true)); return g; };
  const B0=BOD.B0, TI=TILE, PER=[
    {x:BOD.X(54.1),z:BOD.Z(B0.y1)-.6*TI,y:BOD.Y(650),h:0},{x:BOD.X((B0.x0+B0.x1)/2),z:BOD.Z(B0.y1)-.6*TI,y:BOD.Y(B0.h),h:0},
    {x:POOLR.X(8),z:POOLR.Z(POOLR.y1)-.6*TI,y:POOLR.Y(POOLR.H),h:0},{x:POOLR.X(21),z:POOLR.Z(POOLR.y1)-.6*TI,y:POOLR.Y(POOLR.H),h:0}];
  // where they fly: the park (the green behind the row and past the far sidewalk) mostly, the street now and then
  const sky=()=>{ const r=Math.random(), x=BOUND.x0+Math.random()*(BOUND.x1-BOUND.x0);
    return r<.4?{x,z:BOUND.z0-(4+Math.random()*22)*TI}:r<.75?{x,z:BOUND.z1+(3+Math.random()*20)*TI}:{x,z:BOUND.z0+Math.random()*(BOUND.z1-BOUND.z0)}; };
  const ease=(a,b,k)=>a+(b-a)*k, turnTo=(h,want,max)=>{ let d=((want-h+Math.PI*3)%(Math.PI*2))-Math.PI; d=Math.max(-max,Math.min(max,d)); return [h+d,d]; };
  // ---- THE FIREBALLS: a pool of them, two lights shared (so no light comes or goes: no stall)
  const haloTex=(c,W)=>{ const cv=document.createElement('canvas'); cv.width=cv.height=W; const g=cv.getContext('2d'), im=g.createImageData(W,W), Bm=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
    for(let j=0;j<W;j++)for(let i=0;i<W;i++){ const d=Math.hypot((i+.5)/W*2-1,(j+.5)/W*2-1), t=(Bm[(j%4)*4+i%4]+.5)/16, a=d<.35+(t-.5)*.1?.9:d<.6+(t-.5)*.12?.45:d<.95+(t-.5)*.1?.15:0, q=(j*W+i)*4; im.data[q]=c[0]; im.data[q+1]=c[1]; im.data[q+2]=c[2]; im.data[q+3]=a*255; }
    g.putImageData(im,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const HT=haloTex([255,150,40],24), FL=[0,1].map(()=>{ const L=new THREE.PointLight(0xff8a30,0,7*TI,1.6); MAPG.bodega.add(L); return L; });
  // (the ball itself a live flame, churning, sparks shed behind it and thrown out where it lands: fire.js; the halo the game's stepped glow round it)
  const FB=[];
  const fire=(from,dir)=>{ let f=FB.find(f=>!f.on); if(!f){ f={g:new THREE.Group()};
      const h=new THREE.Mesh(new THREE.PlaneGeometry(1.6*TI,1.6*TI),new THREE.MeshBasicMaterial({map:HT,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false})); h.onBeforeRender=(r,s,cm)=>{ h.quaternion.copy(cm.quaternion); h.updateMatrixWorld(); };
      f.g.add(h); MAPG.bodega.add(f.g); f.fl=FLAME.add({kind:'ball',x:0,y:0,z:0,w:.95*TI,h:.95*TI,parent:f.g}); FB.push(f); }
    f.on=f.fl.on=true; f.t=0; f.g.visible=true; f.g.position.copy(from); f.v=dir.clone(); };
  const spark=(p,v,life)=>FLAME.part(4,p.x,p.y,p.z,v.x,v.y,v.z,life,.11*TI,undefined,G*1.6);
  const burst=p=>{ for(let k=0;k<18;k++){ const a=Math.random()*Math.PI*2, u=Math.random(); spark(p,new THREE.Vector3(Math.cos(a)*u*3*TI,(1+Math.random()*2.5)*TI,Math.sin(a)*u*3*TI),.6+Math.random()*.6); }
    for(let k=0;k<4;k++)FLAME.puff(p.x+(Math.random()-.5)*.5*TI,p.y+.2*TI,p.z+(Math.random()-.5)*.5*TI,2.2);
    const hit=(x,z)=>Math.hypot(x-p.x,z-p.z)<1.3*TI; if(LVL==='up'&&hit(pos.x,pos.z))VIT.hurt(.25); for(const N of NPCS)if(N.lv==='up'&&N.key!=='dragon'&&N.g.visible&&hit(N.st.x,N.st.z))N.hp=Math.max(0,N.hp-.25); };
  const G=9.8/.84*TI*.35;   // (a fireball falls gently: a third of a stone's fall)
  FIRE={tick:dt=>{ let li=0;
    for(const f of FB){ if(!f.on)continue; f.t+=dt; f.v.y-=G*dt; f.g.position.addScaledVector(f.v,dt); const q=f.g.position; f.fl.x=q.x; f.fl.y=q.y; f.fl.z=q.z;
      if(Math.random()<dt*30)spark(q,new THREE.Vector3((Math.random()-.5)*.6*TI,.4*TI,(Math.random()-.5)*.6*TI),.4);
      if(li<2){ FL[li].position.copy(f.g.position); FL[li].intensity=6; li++; }
      const gy=MODS.bodega.ground(f.g.position.x,f.g.position.z); if(f.g.position.y<=gy+.2*TI||f.t>6){ f.on=f.fl.on=false; f.g.visible=false; burst(f.g.position.clone().setY(gy+.1)); } }
    for(;li<2;li++)FL[li].intensity=0;
  }};
  // ---- HIS FLIGHT (owner, 17 Oct 2026: "the dragons need better flying animations in air ... they should also fly 3x slower and hang out longer.
  // they faintly glow at night"): over his one flying loop, flight as a big bird has it: a few slow beats, then a long glide on his wings held
  // out (the loop's frame where they're widest, found once here), beating again as he sinks; climbing nose up, sinking nose down; his head
  // leading into a turn, his tail trailing out of it and swaying as a rudder; a third the speed he had, longer in the air and on the ledges;
  // at night a faint glow of his own
  const GLIDE=(()=>{ const r=rigOf(), mx=new THREE.AnimationMixer(r.bones[0]), a=mx.clipAction(CLIPS.Flying_loop); a.play(); const g=new THREE.Group(); g.add(r.bones[0]);
    const L=r.bones.filter(b=>/^Body_002_L_/.test(b.name)), R=r.bones.filter(b=>/^Body_002_R_/.test(b.name)), v=new THREE.Vector3(); let best=0, bt=0;
    for(let k=0;k<32;k++){ const t=k/32*CLIPS.Flying_loop.duration; mx.setTime(t); g.updateMatrixWorld(true); let s=0; for(const b of L.concat(R)){ b.getWorldPosition(v); s+=Math.abs(v.x); } if(s>best){ best=s; bt=t; } } return bt; })();
  const GLC=new THREE.Color(), UP=new THREE.Vector3(0,1,0), qa=new THREE.Quaternion(), wq=new THREE.Quaternion(), ax=new THREE.Vector3();
  const bend=(b,axis,ang)=>{ if(!b||!ang)return; b.getWorldQuaternion(wq); ax.copy(axis).applyQuaternion(wq.invert()).normalize(); b.quaternion.multiply(qa.setFromAxisAngle(ax,ang)); b.updateMatrixWorld(true); };   // (a bone turned about a world axis, over his clip)
  // ---- ONE DRAGON
  const make=(i)=>{ const rig=rigOf(), mixer=new THREE.AnimationMixer(rig.bones[0]), act=n=>mixer.clipAction(CLIPS[n]);
    const idle=act('Idle_loop'), fly=act('Flying_loop'), lift=act('GroundToFly'), attack=act('Attack');
    idle.play(); fly.play(); fly.time=Math.random()*CLIPS.Flying_loop.duration; lift.setLoop(THREE.LoopOnce); lift.clampWhenFinished=true;
    const D={mode:'fly',p:PER[i%PER.length],t:0,y:0,bank:0,pitch:0,v:.8*TI,to:sky(),fly:60+Math.random()*100,cruise:BOD.Y(240+Math.random()*420),breath:6+Math.random()*14,snap:0,style:'flap',bt:Math.random()*3,gl:0,turn:0,climb:0,tw:0}; D.y=D.cruise;
    const BN_=n=>rig.bones.find(b=>b.name===n), TAIL=['Tail','Tail_001','Tail_002','Tail_003','Tail_004'].map(BN_), NECK=['Head','Head_001','Head_002'].map(BN_), FW=new THREE.Vector3(), RT=new THREE.Vector3();
    let wI=0, wF=1, wL=0; const s0=sky();
    const N=makeNPC(null,{key:'dragon',name:'A DRAGON',names:M.parts,lv:'up',group:'bodega',geo:greenGeo(),skin:rig,tall:M.tall,eye:-1,rank:[0],metres:.64,x:s0.x,z:s0.z,lane:{x0:s0.x,x1:s0.x,z0:s0.z,z1:s0.z},ground:()=>0,radius:.3,speed:0,stride:0,rock:0,bob:0,noSelf:true,
      anim:(dt)=>{ const k=Math.min(1,dt*3); wI=ease(wI,D.mode==='perch'?1:0,k); wF=ease(wF,D.mode==='fly'||D.mode==='come'?1:0,k); wL=ease(wL,D.mode==='lift'?1:0,Math.min(1,dt*8));
        idle.setEffectiveWeight(wI); fly.setEffectiveWeight(wF); lift.setEffectiveWeight(wL); attack.setEffectiveWeight(D.snap>0?1:0);
        D.gl+=((D.style==='glide'&&D.mode==='fly'?1:0)-D.gl)*Math.min(1,dt*1.5); fly.timeScale=(D.mode==='come'?.5:.62)*(1-D.gl);
        if(D.gl>.02){ const L=CLIPS.Flying_loop.duration; let dd=GLIDE-fly.time; dd-=Math.round(dd/L)*L; fly.time+=dd*Math.min(1,dt*2.5*D.gl); }   // (gliding: the wings eased to their widest and held)
        mixer.update(dt);
        if(D.mode!=='perch'){ N.g.updateMatrixWorld(true); FW.set(Math.sin(st.h),0,Math.cos(st.h)); RT.set(Math.cos(st.h),0,-Math.sin(st.h)); D.tw+=dt;
          TAIL.forEach((b,k)=>{ bend(b,UP,-D.turn*.18*(k+1)/3+Math.sin(D.tw*1.1+k*.7)*.05*(1+D.gl)); bend(b,RT,D.climb*.08); });   // (the tail: out of the turn, a slow rudder's sway)
          NECK.forEach((b,k)=>bend(b,UP,D.turn*.12)); } } });
    N.push=()=>{}; N.blocks=()=>false;
    const tick0=N.tick, st=N.st; st.hold=true; st.h=Math.random()*6; N.g.rotation.order='YXZ';
    N.tick=(dt,you)=>{ st.to=null; st.face=null; tick0(dt,you); let turn=0; D.snap-=dt;
      { const g=CLOCK.dark()?.35:0; N.toon.emissive.lerp(GLC.setRGB(.04*g,.2*g,.06*g),Math.min(1,dt*.5)); }   // (at night a faint glow of his own)
      const y0=D.y;
      if(D.mode==='perch'){ st.x=D.p.x; st.z=D.p.z; st.h=ease(st.h,D.p.h,Math.min(1,dt*2)); D.y=ease(D.y,D.p.y,Math.min(1,dt*4)); D.v=0;
        if((D.t-=dt)<=0){ D.mode='lift'; lift.reset(); lift.play(); D.t=0; } }
      else if(D.mode==='lift'){ D.t+=dt; D.y+=dt*.6*TI; D.v=ease(D.v,.5*TI,dt); if(D.t>CLIPS.GroundToFly.duration){ D.mode='fly'; D.to=sky(); D.fly=75+Math.random()*90; lift.stop(); } }
      else if(D.mode==='fly'){ D.fly-=dt; D.v=ease(D.v,(D.style==='glide'?.95:.8)*TI,dt*.5); const want=Math.atan2(D.to.x-st.x,D.to.z-st.z), r=turnTo(st.h,want,.28*dt); st.h=r[0]; turn=r[1]/Math.max(dt,1e-3);
        if((D.bt-=dt)<=0||D.style==='glide'&&D.y<D.cruise-1.6*TI){ D.style=D.style==='flap'?'glide':'flap'; D.bt=D.style==='glide'?4+Math.random()*7:2.5+Math.random()*3; }   // (a few beats, then a long glide; beating again when he's sunk too low)
        D.y+=(D.style==='flap'?.22:-.16)*TI*dt; D.y=ease(D.y,Math.max(D.cruise-1.8*TI,Math.min(D.cruise+1.8*TI,D.y)),dt); if(Math.hypot(D.to.x-st.x,D.to.z-st.z)<3*TI)D.to=sky();
        // a fireball: down ahead of him, now and then
        if((D.breath-=dt)<=0){ D.breath=8+Math.random()*18; D.snap=.6; const fw=new THREE.Vector3(Math.sin(st.h),0,Math.cos(st.h)), hp=new THREE.Vector3(st.x,D.y+.2*TI,st.z).addScaledVector(fw,.5*TI);
          fire(hp,fw.multiplyScalar(4.5*TI).add(new THREE.Vector3(0,-1.2*TI,0))); }
        if(D.fly<=0){ D.p=PER[Math.floor(Math.random()*PER.length)]; D.mode='come'; D.style='flap'; } }
      else if(D.mode==='come'){ const dx=D.p.x-st.x, dz=D.p.z-st.z, d=Math.hypot(dx,dz);
        if(d>.2*TI){ const r=turnTo(st.h,Math.atan2(dx,dz),(d<3*TI?.7:.3)*dt); st.h=r[0]; turn=r[1]/Math.max(dt,1e-3); D.v=ease(D.v,d<3*TI?Math.max(.15*TI,d*.25):.8*TI,dt*1.2); D.y=ease(D.y,D.p.y+Math.min(d,5*TI)*.3,dt*.8); }
        else{ D.mode='perch'; D.t=40+Math.random()*70; } }
      if(D.mode!=='perch'){ st.x+=Math.sin(st.h)*D.v*dt; st.z+=Math.cos(st.h)*D.v*dt; }
      D.turn=ease(D.turn,turn,Math.min(1,dt*2)); D.climb=ease(D.climb,(D.y-y0)/Math.max(dt,1e-3)/TI,Math.min(1,dt*2));
      D.bank=ease(D.bank,Math.max(-.5,Math.min(.5,-turn*1.4)),Math.min(1,dt*1.5));
      N.g.position.set(st.x,D.y,st.z); N.g.rotation.set(D.mode==='perch'?0:-Math.max(-.3,Math.min(.3,D.climb*.5)),st.h,D.mode==='perch'?0:D.bank); };   // (nose up climbing, down sinking; banked into a turn)
    N.mixer=mixer; N.D=D; return N; };
  const DR=[]; for(let i=0;i<10;i++)DR.push(make(i));
  window.DRAGONDBG=()=>DR.map(N=>({mode:N.D.mode,x:+N.st.x.toFixed(1),y:+N.D.y.toFixed(1),z:+N.st.z.toFixed(1)}));   // (a test's look)
}
