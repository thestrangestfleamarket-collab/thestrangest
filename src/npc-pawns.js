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
  const HOLD=QS.get('pawnclip'), WALKC=QS.get('pawnwalk')||'UAL_Walk_Loop', IDLEC=QS.get('pawnidle')||'UAL_Idle_Loop', WALK=1.6, RUNU=5.5, STILLC=new Set(['UAL_Idle_Loop','idle_a','idle_b','sit_floor_idle_a']);   /* (the plain breathing idles, standing or sat: held at rest, ASTEP) */   // (how far the walk and the sprint carry one a second at their own pace, in his units)
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
  // together in middle of central park"; then "make the rock golems look like rock texture like boulder, rock, etc? their texture looks like
  // triangles right now"): the twelve townspeople in stone; the stone is carved in the shader (rock in npc-map.js: boulders, cracks, grain,
  // lichen, moss low), so here each point is only his grey (one of four, warm or cool, his own) and flagged rock with his own seed (fab 2.x);
  // the eyes left their own (the darkest part). Their way of life is walkers.js's 'golem': the cave, together
  // the shape a boulder's too (owner, 18 Oct 2026: "avatars dont need to be so strict on triangles, they need to look right is #1"): every
  // face cut in four (each new point between two takes their colours, part and bones), every piece then rounded (Taubin smoothing over the
  // points welded where they meet, so nothing opens) and lumped (pushed out or in along its normal by a noise through him): the chibi's boxes
  // become heaped stones. Some 6,800 triangles a golem (was 1,700)
  const boulder=(g,seed)=>{ const A=g.attributes, P0=A.position.array, I0=g.index.array, n0=P0.length/3, mid=new Map(), add={p:[],c:[],r:[],j:[],w:[]}, I=[];
    const at=(a,b)=>{ const k=a<b?a*65536+b:b*65536+a; let m=mid.get(k); if(m!==undefined)return m; m=n0+add.p.length/3; mid.set(k,m);
      for(let x=0;x<3;x++){ add.p.push((P0[a*3+x]+P0[b*3+x])/2); add.c.push(A.color.array[a*3+x]); } add.r.push(A.reg.array[a]);
      const W={}; for(const v of [a,b])for(let x=0;x<4;x++){ const bi=A.skinIndex.array[v*4+x], wt=A.skinWeight.array[v*4+x]; if(wt)W[bi]=(W[bi]||0)+wt; }
      const top=Object.entries(W).sort((p,q)=>q[1]-p[1]).slice(0,4), sum=top.reduce((t,e)=>t+e[1],0)||1; for(let x=0;x<4;x++){ add.j.push(top[x]?+top[x][0]:0); add.w.push(top[x]?Math.round(top[x][1]/sum*255):0); } return m; };
    for(let t=0;t<I0.length;t+=3){ const a=I0[t],b=I0[t+1],c=I0[t+2], ab=at(a,b), bc=at(b,c), ca=at(c,a); I.push(a,ab,ca, ab,b,bc, ca,bc,c, ab,bc,ca); }
    const cat=(name,arr,T)=>{ const a=A[name], out=new T(a.array.length+arr.length); out.set(a.array); out.set(arr,a.array.length); g.setAttribute(name,new THREE.BufferAttribute(out,a.itemSize,a.normalized)); };
    cat('position',add.p,Float32Array); cat('color',add.c,Uint8Array); cat('reg',add.r,Float32Array); cat('sh',new Array(add.r.length).fill(0),Float32Array); cat('skinIndex',add.j,Uint8Array); cat('skinWeight',add.w,Uint8Array);
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(I),1));
    const P=g.attributes.position.array, n=P.length/3, wid=new Int32Array(n), keys=new Map(); for(let i=0;i<n;i++){ const k=Math.round(P[i*3]*1e3)+','+Math.round(P[i*3+1]*1e3)+','+Math.round(P[i*3+2]*1e3); if(!keys.has(k))keys.set(k,keys.size); wid[i]=keys.get(k); }
    const m=keys.size, X=new Float64Array(m*3), nb=Array.from({length:m},()=>new Set()); for(let i=0;i<n;i++)for(let x=0;x<3;x++)X[wid[i]*3+x]=P[i*3+x];
    for(let t=0;t<I.length;t+=3)for(let e=0;e<3;e++){ const u=wid[I[t+e]], v=wid[I[t+(e+1)%3]]; if(u!==v){ nb[u].add(v); nb[v].add(u); } }
    const pass=k=>{ const D=new Float64Array(m*3); for(let i=0;i<m;i++){ if(!nb[i].size)continue; for(const j of nb[i])for(let x=0;x<3;x++)D[i*3+x]+=X[j*3+x]; for(let x=0;x<3;x++)D[i*3+x]=D[i*3+x]/nb[i].size-X[i*3+x]; } for(let i=0;i<m*3;i++)X[i]+=k*D[i]; };
    for(let it=0;it<5;it++){ pass(.55); pass(-.58); }
    const NR=new Float64Array(m*3), V=(i,x)=>X[wid[i]*3+x];
    for(let t=0;t<I.length;t+=3){ const a=I[t],b=I[t+1],c=I[t+2], ux=V(b,0)-V(a,0),uy=V(b,1)-V(a,1),uz=V(b,2)-V(a,2), vx=V(c,0)-V(a,0),vy=V(c,1)-V(a,1),vz=V(c,2)-V(a,2), cx=uy*vz-uz*vy, cy=uz*vx-ux*vz, cz=ux*vy-uy*vx;
      for(const q of [a,b,c]){ NR[wid[q]*3]+=cx; NR[wid[q]*3+1]+=cy; NR[wid[q]*3+2]+=cz; } }
    const nz=(x,y,z)=>{ const v=Math.sin(x*12.9898+y*78.233+z*37.719+seed*3.1)*43758.5453; return v-Math.floor(v); }, vn=(x,y,z)=>{ const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),f=x-i,h=y-j,e=z-k,S=t=>t*t*(3-2*t),u=S(f),v=S(h),w=S(e),L=(p,q,t)=>p+(q-p)*t;
      return L(L(L(nz(i,j,k),nz(i+1,j,k),u),L(nz(i,j+1,k),nz(i+1,j+1,k),u),v),L(L(nz(i,j,k+1),nz(i+1,j,k+1),u),L(nz(i,j+1,k+1),nz(i+1,j+1,k+1),u),v),w); };
    for(let i=0;i<m;i++){ const l=Math.hypot(NR[i*3],NR[i*3+1],NR[i*3+2])||1, x=X[i*3],y=X[i*3+1],z=X[i*3+2], d=(vn(x*3,y*3,z*3)-.5)*.09+(vn(x*7+9,y*7,z*7)-.5)*.03; for(let q=0;q<3;q++)X[i*3+q]+=NR[i*3+q]/l*d; }
    for(let i=0;i<n;i++)for(let x=0;x<3;x++)P[i*3+x]=X[wid[i]*3+x]; return g; };
  const golem=(g,seed)=>{ g=boulder(g,seed); const c=g.attributes.color.array, n=c.length/3, F=new Float32Array(n), ST=[[138,135,130],[124,124,122],[112,114,118],[146,140,128]], o=ST[seed%4], sd=(seed*.618)%1*.98;
    for(let i=0;i<n;i++){ const l0=(c[i*3]*.3+c[i*3+1]*.59+c[i*3+2]*.11)/255; if(l0<.09)continue;   // (the eyes)
      for(let j=0;j<3;j++)c[i*3+j]=o[j]; F[i]=2+sd; }
    g.setAttribute('fab',new THREE.BufferAttribute(F,1)); g.attributes.color.needsUpdate=true; return g; };
  // REAL ARMS (owner, 18 Oct 2026: "their arms just float because they dont have arms, lets make sure everyone has real limbs in game"): the
  // pack's rig has free hands and no arm, so each pawn is given two arms of his own: an upper arm and a forearm a side, each a bone added to
  // his rig (children of the root, outside the clips) and a few plain shapes skinned to it in his one mesh. Each time his pose is worked out
  // the arm is solved onto it (two bones, the elbow out and back by his chest's turn): from the shoulder on his chest to the wrist of his hand,
  // bending at the elbow, stretched only if the clip throws the hand past its reach. The upper arm his chest's colour (a sleeve), the forearm
  // his hand's; the skeletons' thin bones in bone white, the ogres' thick. Cost: some 100 triangles a pawn, four bones, no light, no program
  const ARMR={skeleton:[.05,.045],ogre:[.12,.11]}, ARMV=new THREE.Vector3(), ARMQ=new THREE.Quaternion(), ARMM=new THREE.Matrix4(), ARMI=new THREE.Matrix4();
  const armsOf=(D,kind,rig,stone)=>{ const R=D.rig, M=D.mesh, ibm=f32(R.ibm), rest=i=>new THREE.Matrix4().fromArray(ibm,i*16).invert(), P=pts(M), J=b(M.j), W=b(M.w), C=b(M.c), RG=b(M.r), n=P.length/3;
    const dom=i=>{ let m=0; for(let k=1;k<4;k++)if(W[i*4+k]>W[i*4+m])m=k; return J[i*4+m]; }, SP=R.names.indexOf('DEF_spine'), HL=[R.names.indexOf('DEF_hand_L'),R.names.indexOf('DEF_hand_R')];
    const rad=stone?[.15,.14]:ARMR[kind.split('_')[0]]||[.085,.075], bony=kind.startsWith('skeleton'), G={p:[],c:[],r:[],j:[],w:[],i:[]}, sides=[];
    HL.forEach((hb,si)=>{ const sg=si?-1:1, H0=rest(hb); let wx=0,wy=0,wz=0,wn=0,hc=[0,0,0],hr=0, tc=[0,0,0],tn=0,tr=0,tx=0,ty=1.78;
      for(let i=0;i<n;i++){ const x=P[i*3],y=P[i*3+1],z=P[i*3+2], d=dom(i);
        if(d===hb&&Math.abs(x)<.9){ wx+=x; wy+=y; wz+=z; wn++; for(let k=0;k<3;k++)hc[k]+=C[i*3+k]; hr=RG[i]; }
        if(d===SP&&x*sg>0&&y>1.6&&y<1.92){ tx=Math.max(tx,x*sg); }}
      for(let i=0;i<n;i++){ const x=P[i*3],y=P[i*3+1]; if(dom(i)===SP&&x*sg>tx-.08&&y>1.6&&y<1.92){ for(let k=0;k<3;k++)tc[k]+=C[i*3+k]; tn++; tr=RG[i]; } }
      const Wr=new THREE.Vector3(wx/wn,wy/wn,wz/wn), S=new THREE.Vector3(sg*Math.max(.12,tx-rad[0]*.6),Math.min(Wr.y+.04,1.86),Wr.z*.5), L=Wr.distanceTo(S)/2;
      const hcol=hc.map(v=>v/wn), tcol=tn&&!bony?tc.map(v=>v/tn):hcol, S0=rest(SP), q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),Wr.clone().sub(S).normalize());
      const ua=new THREE.Bone(), fa=new THREE.Bone(); ua.name='ARM_up_'+'LR'[si]; fa.name='ARM_fore_'+'LR'[si]; rig.bones[0].add(ua,fa);
      const E=S.clone().lerp(Wr,.5), B0=[new THREE.Matrix4().compose(S,q,new THREE.Vector3(1,1,1)),new THREE.Matrix4().compose(E,q,new THREE.Vector3(1,1,1))];
      const bi=[rig.bones.length,rig.bones.length+1]; rig.bones.push(ua,fa); rig.skeleton=new THREE.Skeleton(rig.bones,[...rig.skeleton.boneInverses,...B0.map(m=>m.clone().invert())]);
      rig.bones[0].updateMatrix(); [ua,fa].forEach((B,k)=>ARMI.copy(rig.bones[0].matrix).invert().multiply(B0[k]).decompose(B.position,B.quaternion,B.scale));
      // the shapes: a six-sided tube a segment (tapered), a ball at the shoulder and at the elbow; skinned rigidly to its bone
      const tube=(bone,len,r0,r1,col,reg)=>{ const o=G.p.length/3, m=B0[bone-bi[0]];
        for(let e=0;e<2;e++)for(let a=0;a<6;a++){ const t=a/6*Math.PI*2, r=e?r1:r0; ARMV.set(Math.cos(t)*r,e*len,Math.sin(t)*r).applyMatrix4(m); G.p.push(ARMV.x,ARMV.y,ARMV.z); G.c.push(...col); G.r.push(reg); G.j.push(bone,0,0,0); G.w.push(255,0,0,0); }
        for(let a=0;a<6;a++){ const a1=(a+1)%6; G.i.push(o+a,o+6+a,o+a1, o+a1,o+6+a,o+6+a1); }
        for(let a=1;a<5;a++)G.i.push(o,o+a,o+a+1, o+6,o+6+a+1,o+6+a); };
      const ball=(bone,y,r,col,reg)=>{ const o=G.p.length/3, m=B0[bone-bi[0]]; for(const [x,yy,z] of [[r,0,0],[-r,0,0],[0,r,0],[0,-r,0],[0,0,r],[0,0,-r]]){ ARMV.set(x,y+yy,z).applyMatrix4(m); G.p.push(ARMV.x,ARMV.y,ARMV.z); G.c.push(...col); G.r.push(reg); G.j.push(bone,0,0,0); G.w.push(255,0,0,0); }
        for(const [a,c2] of [[0,2],[2,1],[1,3],[3,0]])G.i.push(o+a,o+c2,o+4, o+c2,o+a,o+5); };
      const dk=c=>c.map(v=>v*.85);
      ball(bi[0],0,rad[0]*1.15,tcol,tr); tube(bi[0],L,rad[0],rad[0]*.9,tcol,tr); ball(bi[1],0,rad[1]*1.1,bony?hcol:dk(tcol),bony?hr:tr); tube(bi[1],L*1.04,rad[1],rad[1]*.85,hcol,hr);
      sides.push({hb,ua,fa,L,sg, Sl:S.clone().applyMatrix4(S0.clone().invert()), Wl:Wr.clone().applyMatrix4(H0.clone().invert())}); });
    return {G,sides,SP}; };
  // solving them onto his pose (in his mesh's space: each bone's matrix up the chain to the root, so nothing waits on the scene's update)
  const armM=(B,out)=>{ out.identity(); for(let x=B;x&&x.isBone;x=x.parent){ x.updateMatrix(); out.premultiply(x.matrix); } return out; };
  const AS=new THREE.Vector3(), AW=new THREE.Vector3(), AE=new THREE.Vector3(), AD=new THREE.Vector3(), AP=new THREE.Vector3(), AX=new THREE.Vector3(), AZ=new THREE.Vector3(), SPM=new THREE.Matrix4(), HM=new THREE.Matrix4(), RTI=new THREE.Matrix4(), ONE=new THREE.Vector3();
  const armSet=(bone,from,to,k)=>{ AD.subVectors(to,from); const len=AD.length()||1e-6; AD.divideScalar(len); AZ.copy(AP).addScaledVector(AD,-AP.dot(AD)); if(AZ.lengthSq()<1e-8)AZ.set(0,0,1); AZ.normalize(); AX.crossVectors(AD,AZ);
    ARMM.makeBasis(AX,AD,AZ).setPosition(from); ARMM.scale(ONE.set(1,k,1)); ARMI.multiplyMatrices(RTI,ARMM).decompose(bone.position,bone.quaternion,bone.scale); };
  const armsSolve=(A,bones)=>{ const root=bones[0]; root.updateMatrix(); RTI.copy(root.matrix).invert(); armM(bones[A.SP],SPM);
    for(const s of A.sides){ AS.copy(s.Sl).applyMatrix4(SPM); AW.copy(s.Wl).applyMatrix4(armM(bones[s.hb],HM)); const d=AS.distanceTo(AW), L=s.L, k=Math.max(1,d/(2*L));
      AP.set(s.sg*.35,-.45,-1).transformDirection(SPM);   // (the elbow's way: out, down and back, turned as his chest turns)
      if(d>=2*L*.999)AE.lerpVectors(AS,AW,.5); else{ AD.subVectors(AW,AS).divideScalar(d); const a=d/2, h=Math.sqrt(Math.max(0,L*L-a*a)); AZ.copy(AP).addScaledVector(AD,-AP.dot(AD)).normalize(); AE.copy(AS).addScaledVector(AD,a).addScaledVector(AZ,h); }
      armSet(s.ua,AS,AE,k); armSet(s.fa,AE,AW,k); } };
  const withArms=(g,A)=>{ const G=A.G, o=g.attributes.position.count, cat=(name,arr,T,sz,norm)=>{ const a=g.attributes[name]; const out=new T(a.array.length+arr.length); out.set(a.array); out.set(arr,a.array.length); g.setAttribute(name,new THREE.BufferAttribute(out,sz,norm)); };
    cat('position',G.p,Float32Array,3); cat('color',G.c,Uint8Array,3,true); cat('reg',G.r,Float32Array,1); cat('sh',new Array(G.r.length).fill(0),Float32Array,1); cat('skinIndex',G.j,Uint8Array,4); cat('skinWeight',G.w,Uint8Array,4,true);
    const ix=g.index.array, I=new Uint32Array(ix.length+G.i.length); I.set(ix); for(let k=0;k<G.i.length;k++)I[ix.length+k]=G.i[k]+o; g.setIndex(new THREE.BufferAttribute(I,1)); return g; };
  const PEOPLE=['hero_m','hero_f','villager_m','villager_f'], ALL=[...Object.keys(PW).map(k=>[k,k,0]),...[1,2,3].flatMap(n=>PEOPLE.map(k=>[k+'_'+n,k,n]))];
  ALL.forEach(([key,kind,copy],i)=>{ const D=PW[kind], rig=rigOf(D.rig), AR=armsOf(D,kind,rig,!!copy), mixer=new THREE.AnimationMixer(rig.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CLIPS[n])); let cur=null;
    const N=makeNPC(null,{key,name:key.toUpperCase().replace('_',' '),names:D.mesh.parts,lv:'up',group:'bodega',geo:copy?golem(withArms(geomOf(D.mesh),AR),copy*7+i):dressed(withArms(geomOf(D.mesh),AR),UNIFORM[key]),skin:rig,tall:D.tall,rank:D.mesh.parts.map(()=>0),metres:1.35,x:BOD.XS(66+(i%12)*4.4+(copy?1.7*copy:0)),z:BOD.ZS(i%2?BOD.FAR+.8:-73.6),lane:STLANE,free:stfree,roam:true,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.3,speed:.5,stride:0,rock:0,bob:0,...(!copy&&/^(skeleton|ogre)/.test(key)&&QS.get('sheet')!==key&&DUN()||{}),   /* (the four skeletons in the castle's dungeon, owner 18 Oct 2026: npc-map.js's DUN; the four ogres, the armoured knights, with them: "make sure these skel knights are in dungon") */
      brain:HOLD?(dt,you,st)=>{ st.to=null; st.hold=true; }:undefined,
      anim:(dt,moving,st,sc)=>{ let want, ts=1;
        if(HOLD)want=HOLD; else if(N.sheet)want='UAL_A_TPose'; else{ const run=moving&&st.v>(N.gait?2.4:1.2)*TILE; const fast=moving&&N.gaitU>2.5; want=moving?(run&&!fast?'UAL_Sprint_Loop':N.gait||WALKC):N.dwell||N.idle||IDLEC; if(moving)ts=Math.max(.6,Math.min(1.8,st.v/((run&&!fast?RUNU:N.gaitU||WALK)*sc)));   /* (N.gait, N.gaitU, N.idle, N.dwell: his own walk, its pace, his own idle, what he does where he stops: walkers.js) */ }
        if(want!==cur){ const a=act(want); a.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.2).play(); if(cur)act(cur).fadeOut(.2); cur=want; }
        act(cur).timeScale=N.sheet&&!HOLD?0:ts; mixer.update(dt); armsSolve(AR,rig.bones); }});
    N.restless=()=>!!HOLD||cur===N.dwell&&!STILLC.has(cur)&&(cur!=='UAL_Idle_Talking_Loop'||!!(N.walker&&N.walker.talk));   // (at rest his idle is held (ASTEP, map-pre.js); what he stopped to do goes on: a talk with someone, a cheer, a find)
    N.mixer=mixer; N.kind=kind; PAWNL.push(N); });
  window.PAWNCAM=(i=0,k=1.6)=>{ const N=PAWNL[i]; UI.setFree(true); UI.camT.set(N.st.x,N.g.position.y+N.H*.5,N.st.z); ppu=ppuTo=PPU*k; };   /* (a test's look) */
  window.PAWNDBG=()=>PAWNL.map(N=>({key:N.key,x:+N.st.x.toFixed(1),z:+N.st.z.toFixed(1),to:!!N.st.to,vis:N.g.visible})); }
