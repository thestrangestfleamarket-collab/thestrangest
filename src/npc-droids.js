// ---- THE SECURITY DROIDS (owner, 17 Oct 2026: "make them security droids, they protect the market"): the UAL1 animation library's standard
// body (his Drive's UAL1_Standard.glb: an Unreal-style rig of 65 bones with its 43 clips, baked as the creatures are, tools/creatures-bake.py
// with SIMP=0.5 → data/ual.json: 6,872 triangles each, half the file's) made a droid: three greys (below), no texture. Four of them, each marching a beat (the shops' sidewalk's two halves, the far sidewalk, the road's middle)
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
  // THE DROID'S COLOURS (owner, 18 Oct 2026: "instead of grey and blue make them 3 shades of grey, more realistic shades and shadows"): his
  // plates three greys, face by face (the mesh unshared, so each plate keeps a hard edge): a pale grey on what faces up and on his chest and head,
  // a mid grey on his sides, a dark grey on his joints and what faces down; darker toward his feet (the depth), a plate here and there a step off
  // its neighbours (worn and replaced); nothing glows
  const GEO=geomOf(D.mesh).toNonIndexed(); { const c=GEO.attributes.color.array, R=GEO.attributes.reg.array, P=GEO.attributes.position.array, JT=D.mesh.parts.indexOf('M_Joints'), A=new THREE.Vector3(), B=new THREE.Vector3(), C=new THREE.Vector3();
    const G3=[[176,178,180],[122,124,127],[66,68,71]];
    for(let t=0;t<R.length/3;t++){ const i=t*9; A.fromArray(P,i); B.fromArray(P,i+3); C.fromArray(P,i+6); const ny=B.clone().sub(A).cross(C.clone().sub(A)).normalize().y, y=(A.y+B.y+C.y)/3/1.83, h=Math.abs(Math.sin(Math.round(A.x*9)*12.9898+Math.round(A.y*9)*78.233+Math.round(A.z*9)*37.719)*43758.5453)%1;
      let g=R[t*3]===JT?2:ny<-.35?2:ny>.45||(y>.55&&y<.75&&Math.abs(A.x)<.14)?0:1; if(h<.08&&g<2)g++;
      const k=(.74+.3*Math.min(1,y*1.4))*(ny>.45?1.05:1); for(let v=0;v<3;v++)for(let j=0;j<3;j++)c[i+v*3+j]=Math.min(255,G3[g][j]*k); } }
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
  // STANDING EASY (as the mannequin's, playas.js): the pack's Idle_Loop stands guarded, fists up and knees bent; over it, while he stands, his
  // arms hang by his sides, his legs straight under him, his back up, his feet kept on the ground; eased in and out
  const Relax=(N,rig)=>{ const V=THREE.Vector3, bone=n=>rig.bones[D.rig.names.indexOf(n)], wq=new THREE.Quaternion(), pq=new THREE.Quaternion(), dq=new THREE.Quaternion(), q0=new THREE.Quaternion(), fq=new THREE.Quaternion(), A=new V(), B=new V(), P1=new V(), P2=new V(), DOWN=new V(0,-1,0);
    const aim=(b,c,dir)=>{ b.getWorldPosition(A); c.getWorldPosition(B); dq.setFromUnitVectors(B.sub(A).normalize(),dir); b.getWorldQuaternion(wq); b.parent.getWorldQuaternion(pq); b.quaternion.copy(pq.invert().multiply(dq.multiply(wq))); b.updateMatrixWorld(true); };
    const blend=(b,c,dir,w)=>{ q0.copy(b.quaternion); aim(b,c,dir); if(w<1){ b.quaternion.slerpQuaternions(q0,b.quaternion.clone(),w); b.updateMatrixWorld(true); } };
    const out=(a,b)=>{ bone(a).getWorldPosition(P1); bone(b).getWorldPosition(P2); P2.sub(P1); P2.y=0; return P2.normalize().clone(); }, footY=()=>{ bone('foot_l').getWorldPosition(P1); bone('foot_r').getWorldPosition(P2); return Math.min(P1.y,P2.y); };
    let rx=0; return (dt,on)=>{ rx+=((on?1:0)-rx)*Math.min(1,dt*6); if(rx<.01)return; N.g.updateMatrixWorld(true); const f=new V(Math.sin(N.st.h),0,Math.cos(N.st.h)), y0=footY();
      blend(bone('spine_02'),bone('neck_01'),new V(0,1,0).addScaledVector(f,.05).normalize(),rx*.7);
      for(const sd of ['l','r']){ const o=out('spine_03','upperarm_'+sd); blend(bone('upperarm_'+sd),bone('lowerarm_'+sd),DOWN.clone().addScaledVector(o,.14).addScaledVector(f,.02).normalize(),rx); blend(bone('lowerarm_'+sd),bone('hand_'+sd),DOWN.clone().addScaledVector(o,.06).addScaledVector(f,.16).normalize(),rx); }
      for(const sd of ['l','r']){ const ft=bone('foot_'+sd); ft.getWorldQuaternion(fq); const o=out('pelvis','thigh_'+sd); blend(bone('thigh_'+sd),bone('calf_'+sd),DOWN.clone().addScaledVector(o,.03).normalize(),rx); blend(bone('calf_'+sd),ft,DOWN.clone().addScaledVector(f,-.02).normalize(),rx);
        ft.parent.getWorldQuaternion(pq); ft.quaternion.copy(pq.invert().multiply(fq)); ft.updateMatrixWorld(true); }
      N.g.position.y+=y0-footY(); }; };
  const {TROUBLE,shoot,free,SEE,RUN,LANE,T_,Z_,d2}=GUARDX, HOLD=QS.get('ualclip'), DROIDS=[]; window.DROIDS=DROIDS;
  const BEAM=[.35,1,1], STUN={reach:5.5,at:.5,dmg:.55}, JAB={reach:.8,at:.4,dmg:.4};
  // THEIR BEAT (owner, 18 Oct 2026: "they patrol all around the edges of the map"): one round of the loop's outer sidewalks, the four corners
  // (the shops' sidewalk, the Avenue's east one, the north street's outer one, the west street's outer one: bodega tiles, read from the map's own
  // numbers so a longer street takes them with it), each droid starting a quarter of the way round from the last, all going the same way
  const RD=[[RING.wx0+1.6,-74.4],[AVE.x1-1.6,-74.4],[AVE.x1-1.6,RING.ny1-1.6],[RING.wx0+1.6,RING.ny1-1.6]];
  const CH=[0,1,2,3].map(k=>['DROID '+(k+1),[0,1,2,3].map(j=>RD[(k+j)%4])]);
  CH.forEach(([name,beat],i)=>{ let relax=()=>{}; const rig=rigOf(D.rig), mixer=new THREE.AnimationMixer(rig.bones[0]), an=Anim(mixer), G={beat:beat.map(([x,y])=>({x:T_(x),z:Z_(y)})),leg:0,mode:'patrol',cool:0,look:Math.random()*6,hold:performance.now()/1000+180,going:false};
    const N=makeNPC(null,{key:'droid'+(i+1),name,names:D.mesh.parts,lv:'up',group:'bodega',geo:GEO,skin:rig,tall:D.tall,eye:-1,rank:D.mesh.parts.map(()=>0),metres:1.9,x:G.beat[0].x,z:G.beat[0].z,lane:LANE,free,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.3,speed:1.05,stride:0,rock:0,bob:0,
      // (owner, 18 Oct 2026: "all be on diff corners of map patrolling. stop at corner for 3 mins, then switch to other corner. repeat": each at his
      // own corner, three minutes there looking about, then all four move on round the loop to the next, so they're always on four corners)
      pick:st=>{ const now=performance.now()/1000; if(G.going){ G.going=false; G.hold=now+180; } if(G.hold>now){ st.to=null; st.wait=G.hold-now; return; }
        G.leg=(G.leg+1)%G.beat.length; G.going=true; const p=G.beat[G.leg]; st.to={x:p.x,z:p.z+(Math.random()-.5)*.3*TILE}; st.v=G.walkV; },
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
        an.base=moving?(run?'Sprint_Loop':'Walk_Loop'):'Idle_Loop'; an.ts=moving?st.v/((run?RUNU:WALK)*sc):1; an.update(dt); relax(dt,!moving&&!an.once); }});   // (a plain walk and standing easy, owner 18 Oct 2026: "the cyborgs should all stand normal. walk normla")
    relax=Relax(N,rig); N.mixer=mixer; N.an=an; N.guard=G; DROIDS.push(N); });
  window.UALK={D,geomOf,rigOf,CLIPS,Anim};   // (the mannequin's kit, shared: you as him, src/playas.js)
  window.SCN=()=>({scene,pos,W3,THREE}); window.SUNV=()=>CLOCK.sunV;   /* (a test's reach into the page) */
  window.CAMAT=(x,y,z,k=1.6)=>{ UI.setFree(true); UI.camT.set(x,y,z); ppu=ppuTo=PPU*k; };   /* (a test's look anywhere: the free camera on a point) */
  window.DROIDCAM=(i=0,k=1.6)=>{ const N=DROIDS[i]; UI.setFree(true); UI.camT.set(N.st.x,N.g.position.y+N.H*.5,N.st.z); ppu=ppuTo=PPU*k; };   /* (a test's look: the free camera on one's middle) */
  window.DROIDDBG=()=>DROIDS.map(N=>({key:N.key,mode:N.guard.mode,x:+(N.st.x/TILE).toFixed(1),z:+(N.st.z/TILE).toFixed(1),to:!!N.st.to,act:N.an.once&&N.an.once.n,base:N.an.base,vis:N.g.visible})); }
