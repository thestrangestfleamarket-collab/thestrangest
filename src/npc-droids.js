// ---- THE SECURITY DROIDS (owner, 17 Oct 2026: "make them security droids, they protect the market"): the UAL1 animation library's standard
// body (his Drive's UAL1_Standard.glb: an Unreal-style rig of 65 bones with its 43 clips, baked as the creatures are, tools/creatures-bake.py
// with SIMP=0.5 → data/ual.json: 6,872 triangles each, half the file's) made a droid: the body gunmetal, the joints lit cyan (the glowing part,
// lit by nothing: uEye), no texture. Four of them, each marching a beat (the shops' sidewalk's two halves, the far sidewalk, the road's middle)
// at the formal walk, on guard at each end looking one way and the other. A troublemaker on the street (npc-skel.js's, up the subway stairs
// after dark): every droid near sprints to him and stuns him with a beam from his hand (Spell_Simple_Shoot, a cyan bolt: the guards' shoot),
// or a jab up close; he falls as the guards' blows fell him; then a word on the radio (Idle_Talking_Loop) and back to the beat.
// ?ualclip=<name> holds them all in that clip for a look; ?sheet=droid1 his sheet (A_TPose) ----
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
  // THE DROID'S COLOURS: the file's body part gunmetal (a blue-grey, a little lighter at the top), its joints the glowing part (cyan, uEye)
  const GEO=geomOf(D.mesh); { const c=GEO.attributes.color.array, R=GEO.attributes.reg.array, P=GEO.attributes.position.array, JT=D.mesh.parts.indexOf('M_Joints');
    for(let i=0;i<R.length;i++){ if(R[i]===JT){ c[i*3]=70; c[i*3+1]=230; c[i*3+2]=255; } else{ const k=.9+.25*Math.min(1,Math.max(0,P[i*3+1]/1.83)); c[i*3]=84*k; c[i*3+1]=92*k; c[i*3+2]=104*k; } } }
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
  const {TROUBLE,shoot,free,SEE,RUN,LANE,T_,Z_,d2}=GUARDX, HOLD=QS.get('ualclip'), DROIDS=[]; window.DROIDS=DROIDS;
  const BEAM=[.35,1,1], STUN={reach:5.5,at:.5,dmg:.55}, JAB={reach:.8,at:.4,dmg:.4};
  // (name, his beat in bodega tiles: the shops' sidewalk's two halves by the kerb, the far sidewalk, the road's middle)
  const CH=[['DROID 1',[[53,-74.6],[79,-74.6]]],['DROID 2',[[81,-74.6],[106,-74.6]]],['DROID 3',[[55,-61.7],[104,-61.7]]],['DROID 4',[[52,-69.3],[106,-69.3]]]];
  CH.forEach(([name,beat],i)=>{ const rig=rigOf(D.rig), mixer=new THREE.AnimationMixer(rig.bones[0]), an=Anim(mixer), G={beat:beat.map(([x,y])=>({x:T_(x),z:Z_(y)})),leg:0,mode:'patrol',cool:0,look:Math.random()*6};
    const N=makeNPC(null,{key:'droid'+(i+1),name,names:D.mesh.parts,lv:'up',group:'bodega',geo:GEO,skin:rig,tall:D.tall,eye:D.mesh.parts.indexOf('M_Joints'),eyeC:'.27,.9,1.',rank:D.mesh.parts.map(()=>0),metres:1.9,x:G.beat[0].x,z:G.beat[0].z,lane:LANE,free,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.3,speed:.5,stride:0,rock:0,bob:0,
      pick:st=>{ G.leg^=1; const p=G.beat[G.leg]; st.to={x:p.x,z:p.z+(Math.random()-.5)*.3*TILE}; st.v=G.walkV; },
      brain:(dt,you,st,N)=>{ if(HOLD){ st.to=null; st.hold=true; return; }
        G.walkV=G.walkV||st.v; G.cool-=dt; G.look+=dt;
        const T=TROUBLE.filter(t=>t.mode==='come'||t.mode==='fight').map(t=>[t,d2(t.st,st)]).filter(([,d])=>d<SEE).sort((p,q)=>p[1]-q[1])[0];
        if(T){ const [t,d]=T, R=STUN.reach*TILE; G.mode='fight'; N.alert=true; st.hold=true;
          if(an.once){ st.to=null; st.face={x:t.st.x,z:t.st.z}; return; }   // (mid-move)
          if(d>R){ const k=(d-R*.8)/d; st.to={x:st.x+(t.st.x-st.x)*k,z:st.z+(t.st.z-st.z)*k}; st.v=d>R+2*TILE&&!N.tired?RUN:G.walkV*1.6; st.face=null; }
          else{ st.to=null; st.face={x:t.st.x,z:t.st.z}; const off=Math.abs(((Math.atan2(t.st.x-st.x,t.st.z-st.z)-st.h+Math.PI*3)%(Math.PI*2))-Math.PI);
            if(G.cool<=0&&off<.35){ G.cool=1.5+Math.random()*.6; const S=d<JAB.reach*TILE?JAB:STUN;
              an.play(S===JAB?'Punch_Jab':'Spell_Simple_Shoot',{at:[S.at,()=>{ if(S===STUN)shoot(N,t,BEAM,S.dmg); else if(d2(t.st,st)<R*1.5)t.knock(N,S.dmg); }]}); } }
          return; }
        if(G.mode==='fight'){ G.mode='report'; st.to=null; st.face=null; if(typeof LINES!=='undefined')LINES.say(N,'report'); an.play('Idle_Talking_Loop',{then:()=>{ G.mode='patrol'; st.hold=false; st.wait=.5; N.alert=false; }}); return; }
        if(G.mode==='report')return;
        // on his beat: at an end, on guard, looking one way and the other
        N.alert=!st.to; if(st.to)st.h0=null; else{ if(st.h0==null)st.h0=st.h; const a=st.h0+Math.sin(G.look*.7)*1.1; st.face={x:st.x+Math.sin(a),z:st.z+Math.cos(a)}; } },
      anim:(dt,moving,st,sc)=>{ const run=moving&&st.v>1.2*TILE; N.sta=run?Math.max(0,N.sta-dt/14):Math.min(1,N.sta+dt/8); if(N.sta<=0)N.tired=true; if(N.tired&&N.sta>.33)N.tired=false;
        if(HOLD&&HOLD!=='T'){ an.base=HOLD; an.ts=1; an.update(dt); return; }
        if(N.sheet||HOLD==='T'){ an.base='A_TPose'; an.ts=0; an.update(dt); return; }   // (his sheet: still, the T)
        an.base=moving?(run?'Sprint_Loop':'Walk_Formal_Loop'):'Idle_Loop'; an.ts=moving?st.v/((run?RUNU:WALK)*sc):1; an.update(dt); }});
    N.mixer=mixer; N.an=an; N.guard=G; DROIDS.push(N); });
  window.DROIDCAM=(i=0,k=1.6)=>{ const N=DROIDS[i]; UI.setFree(true); UI.camT.set(N.st.x,N.g.position.y+N.H*.5,N.st.z); ppu=ppuTo=PPU*k; };   /* (a test's look: the free camera on one's middle) */
  window.DROIDDBG=()=>DROIDS.map(N=>({key:N.key,mode:N.guard.mode,x:+(N.st.x/TILE).toFixed(1),z:+(N.st.z/TILE).toFixed(1),to:!!N.st.to,act:N.an.once&&N.an.once.n,base:N.an.base,vis:N.g.visible})); }
