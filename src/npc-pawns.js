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
  const HOLD=QS.get('pawnclip'), WALKC=QS.get('pawnwalk')||'UAL_Walk_Loop', IDLEC=QS.get('pawnidle')||'UAL_Idle_Loop', WALK=1.6, RUNU=5.5, STILLC=new Set(['UAL_Idle_Loop','idle_a','idle_b','sit_floor_idle_a']);   // (how far the walk and the sprint carry one a second at their own pace, in his units)
  const PAWNL=[]; window.PAWNL=PAWNL;
  // THE CITY'S STAFF (owner, 17 Oct 2026, the services run by bots: civic.js): eight of the pawns in uniform, a tint laid over the pack's colours
  // (their shading kept): the officers navy, the firefighters red, the carrier blue, the works crew orange, the clerk grey, the medic white
  const UNIFORM={};   /* (no uniforms now: the city's staff are droids, civic.js; the pawns walk the city as themselves) */
  const dressed=(g,t)=>{ if(!t)return g; const c=g.attributes.color.array; for(let i=0;i<c.length;i+=3){ const l=(c[i]*.3+c[i+1]*.59+c[i+2]*.11)/255; for(let j=0;j<3;j++)c[i+j]=Math.min(255,c[i+j]*.4+t[j]*255*.6*(.3+.7*l)); } return g; };
  // THE TOWNSPEOPLE (owner, 17 Oct 2026: "have people walking through park, exploring the city ... i want it to feel lived in"): three more of
  // each of the four people (hero_m/f, villager_m/f), each in clothes of his own (each part not skin-coloured turned round the colour wheel by a
  // number of its own, a little lighter or darker), the same one shared clip set; their minds are walkers.js's. Cost: about 1,400 triangles
  // each, only where seen (the far ones not drawn)
  const hs=(i,j)=>{ const v=Math.sin(i*12.9898+j*78.233)*43758.5453; return v-Math.floor(v); };
  const recloth=(g,seed)=>{ const c=g.attributes.color.array, R=g.attributes.reg.array, sum={}, col=new THREE.Color(), hsl={};
    for(let i=0;i<R.length;i++){ const r=R[i], S=sum[r]||(sum[r]=[0,0,0,0]); S[0]+=c[i*3]; S[1]+=c[i*3+1]; S[2]+=c[i*3+2]; S[3]++; }
    const skin=r=>{ const S=sum[r], R_=S[0]/S[3]/255, G_=S[1]/S[3]/255, B_=S[2]/S[3]/255; return R_>.42&&R_>G_&&G_>B_&&R_-B_>.12&&G_/R_>.55&&G_/R_<.92; };
    const turn={}; for(const r in sum)turn[r]=skin(+r)?null:[hs(seed,+r),.75+hs(seed,+r+9)*.5];
    for(let i=0;i<R.length;i++){ const t=turn[R[i]]; if(!t)continue; col.setRGB(c[i*3]/255,c[i*3+1]/255,c[i*3+2]/255); col.getHSL(hsl); col.setHSL((hsl.h+t[0])%1,Math.min(1,hsl.s*1.1+.08),Math.min(.9,hsl.l*t[1])); c[i*3]=col.r*255; c[i*3+1]=col.g*255; c[i*3+2]=col.b*255; } return g; };
  // THE ROCK GOLEMS (owner, 18 Oct 2026: "i want these people to all be changed to look like rock golems textuer, gray, rock, they all hang out
  // together in middle of central park"): the twelve townspeople carved in stone: each face of the mesh its own grey from a noise through the
  // body (four greys, warm and cool), the seams between stones dark, a lit chip on what faces up, a fleck of lichen now and then, darker toward
  // the feet; the eyes left their own (the darkest part). Their way of life is walkers.js's 'golem': the park's round, together
  const golem=(g,seed)=>{ g=g.toNonIndexed(); const p=g.attributes.position.array, c=g.attributes.color.array, A=new THREE.Vector3(), B=new THREE.Vector3(), C=new THREE.Vector3(), hy=g.boundingBox||(g.computeBoundingBox(),g.boundingBox);
    const n3=(x,y,z)=>{ const v=Math.sin(x*12.9898+y*78.233+z*37.719+seed*7.1)*43758.5453; return v-Math.floor(v); }, vn=(x,y,z)=>{ const i=Math.floor(x), j=Math.floor(y), k=Math.floor(z), f=x-i, gg=y-j, e=z-k, s=t=>t*t*(3-2*t), u=s(f), v=s(gg), w=s(e), L=(a,b,t)=>a+(b-a)*t;
      return L(L(L(n3(i,j,k),n3(i+1,j,k),u),L(n3(i,j+1,k),n3(i+1,j+1,k),u),v),L(L(n3(i,j,k+1),n3(i+1,j,k+1),u),L(n3(i,j+1,k+1),n3(i+1,j+1,k+1),u),v),w); };
    const ST=[[134,132,128],[112,111,108],[96,97,99],[150,147,140]], h0=hy.min.y, hh=Math.max(1e-6,hy.max.y-hy.min.y), sc=6/hh;
    for(let t=0;t<p.length/9;t++){ const i=t*9; A.fromArray(p,i); B.fromArray(p,i+3); C.fromArray(p,i+6); const m=[(A.x+B.x+C.x)/3*sc,(A.y+B.y+C.y)/3*sc,(A.z+B.z+C.z)/3*sc], ny=B.clone().sub(A).cross(C.clone().sub(A)).normalize().y;
      const l0=(c[i]*.3+c[i+1]*.59+c[i+2]*.11)/255; if(l0<.09)continue;   // (the eyes, the darkest: kept)
      const cell=vn(m[0]*1.3,m[1]*1.3,m[2]*1.3), seam=Math.abs(vn(m[0]*2.1+5,m[1]*2.1,m[2]*2.1)-.5)<.045; let o=ST[Math.floor(cell*3.99)];
      if(seam)o=[58,57,56]; else if(ny>.55&&n3(t,1,2)<.25)o=[172,170,164]; else if(n3(t,3,4)<.025)o=[96,112,74];
      const k=(.62+.38*Math.min(1,((A.y+B.y+C.y)/3-h0)/hh*1.5))*(ny<-.4?.75:1); for(let v=0;v<3;v++)for(let j=0;j<3;j++)c[i+v*3+j]=Math.min(255,o[j]*k); }
    g.attributes.color.needsUpdate=true; return g; };
  const PEOPLE=['hero_m','hero_f','villager_m','villager_f'], ALL=[...Object.keys(PW).map(k=>[k,k,0]),...[1,2,3].flatMap(n=>PEOPLE.map(k=>[k+'_'+n,k,n]))];
  ALL.forEach(([key,kind,copy],i)=>{ const D=PW[kind], rig=rigOf(D.rig), mixer=new THREE.AnimationMixer(rig.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CLIPS[n])); let cur=null;
    const N=makeNPC(null,{key,name:key.toUpperCase().replace('_',' '),names:D.mesh.parts,lv:'up',group:'bodega',geo:copy?golem(geomOf(D.mesh),copy*7+i):dressed(geomOf(D.mesh),UNIFORM[key]),skin:rig,tall:D.tall,rank:D.mesh.parts.map(()=>0),metres:1.35,x:BOD.XS(66+(i%12)*4.4+(copy?1.7*copy:0)),z:BOD.ZS(i%2?BOD.FAR+.8:-73.6),lane:STLANE,free:stfree,roam:true,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.3,speed:.5,stride:0,rock:0,bob:0,...(!copy&&/^(skeleton|ogre)/.test(key)&&DUN()||{}),   /* (the four skeletons in the castle's dungeon, owner 18 Oct 2026: npc-map.js's DUN; the four ogres, the armoured knights, with them: "make sure these skel knights are in dungon") */
      brain:HOLD?(dt,you,st)=>{ st.to=null; st.hold=true; }:undefined,
      anim:(dt,moving,st,sc)=>{ let want, ts=1;
        if(HOLD)want=HOLD; else if(N.sheet)want='UAL_A_TPose'; else{ const run=moving&&st.v>(N.gait?2.4:1.2)*TILE; const fast=moving&&N.gaitU>2.5; want=moving?(run&&!fast?'UAL_Sprint_Loop':N.gait||WALKC):N.dwell||N.idle||IDLEC; if(moving)ts=Math.max(.6,Math.min(1.8,st.v/((run&&!fast?RUNU:N.gaitU||WALK)*sc)));   /* (N.gait, N.gaitU, N.idle, N.dwell: his own walk, its pace, his own idle, what he does where he stops: walkers.js) */ }
        if(want!==cur){ const a=act(want); a.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.2).play(); if(cur)act(cur).fadeOut(.2); cur=want; st.calm=.4; st.shift=7+Math.random()*8; }
        // STANDING STILL (owner, 18 Oct 2026, after the mushroom seller's crawling shadow: "now check other characters"): a plain breathing idle,
        // standing or sat on the grass, played on and on slid his outline and his own shadow's edge a pixel every frame; it plays only into its
        // fade and for a second and a half's shift of weight every 7 to 15 s, held still between (the Walker's way); talking, cheering, a find, as before
        if(!moving&&!HOLD&&!N.sheet&&STILLC.has(cur)){ if((st.calm-=dt)<=0){ if((st.shift-=dt)<=0){ st.calm=1.5; st.shift=7+Math.random()*8; } else ts=0; } }
        act(cur).timeScale=N.sheet&&!HOLD?0:ts; mixer.update(dt); }});
    N.mixer=mixer; N.kind=kind; PAWNL.push(N); });
  window.PAWNCAM=(i=0,k=1.6)=>{ const N=PAWNL[i]; UI.setFree(true); UI.camT.set(N.st.x,N.g.position.y+N.H*.5,N.st.z); ppu=ppuTo=PPU*k; };   /* (a test's look) */
  window.PAWNDBG=()=>PAWNL.map(N=>({key:N.key,x:+N.st.x.toFixed(1),z:+N.st.z.toFixed(1),to:!!N.st.to,vis:N.g.visible})); }
