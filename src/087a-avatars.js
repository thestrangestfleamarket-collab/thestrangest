const UAL=__DATA__("data/ual.json"), VROID=__LAZY__("data/vroid.json");
const AVS={kind:'walker',KINDS:['walker','mannequin','vroid'],NAME:{walker:'WALKER',mannequin:'MANNEQUIN',vroid:'VROID'},C:{}};
window.AVS=AVS;
{ const D=UAL.ual, RG=D.rig, BN=RG.names, PAR=RG.parent, BI=Object.fromEntries(BN.map((n,i)=>[n,i])), V=THREE.Vector3, Q=THREE.Quaternion;
  const b=s=>{ const t=atob(s), u=new Uint8Array(t.length); for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i); return u; }, f32=s=>new Float32Array(b(s).buffer), i16=s=>new Int16Array(b(s).buffer), u16=s=>new Uint16Array(b(s).buffer);
  const TT=C=>Array.from({length:C.n},(_,k)=>k*C.dur/(C.n-1));
  const clipsFor=kp=>{ const out={}; for(const [name,C] of Object.entries(D.clips)){ const t=TT(C), q=i16(C.q), tr=[];
      BN.forEach((bn,j)=>{ const v=new Float32Array(C.n*4); for(let k=0;k<C.n;k++)for(let c=0;c<4;c++)v[k*4+c]=q[(k*BN.length+j)*4+c]/32000; tr.push(new THREE.QuaternionKeyframeTrack(bn+'.quaternion',t,v)); });
      for(const [bn,p] of Object.entries(C.p))if(bn!=='root')tr.push(new THREE.VectorKeyframeTrack(bn+'.position',t,f32(p).map(x=>x*kp)));
      out[name]=new THREE.AnimationClip(name,C.dur,tr); } return out; };
  const rigOf=T=>{ const bones=BN.map((n,i)=>{ const B=new THREE.Bone(); B.name=n; B.position.fromArray(T[i]); B.quaternion.fromArray(RG.q[i]); return B; });
    PAR.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); }); return {bones,skeleton:new THREE.Skeleton(bones)}; };
  const geoOf=(P,C,SI,SW,I,R)=>{ const g=new THREE.BufferGeometry(), n=P.length/3; g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3,true));
    g.setAttribute('reg',new THREE.BufferAttribute(R||new Float32Array(n),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(n),1));
    g.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(SI,4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(SW,4,true)); g.setIndex(new THREE.BufferAttribute(I,1)); return g; };
  const Anim=(mixer,CL)=>{ const A={}, W={}, act=n=>A[n]||(A[n]=mixer.clipAction(CL[n])); const M={base:'Idle_Loop',ts:1};
    M.update=dt=>{ const tgt=CL[M.base]?M.base:'Idle_Loop'; act(tgt).timeScale=M.ts;
      for(const n of new Set([...Object.keys(W),tgt])){ const a=act(n); W[n]=W[n]??0; W[n]+=((n===tgt?1:0)-W[n])*Math.min(1,dt*10);
        if(W[n]>.01){ if(!a.isRunning()){ a.setLoop(THREE.LoopRepeat,Infinity); a.play(); } a.setEffectiveWeight(W[n]); } else{ a.stop(); delete W[n]; } }
      mixer.update(dt); };
    return M; };
  const relaxer=(bone,root,fw)=>{ const need=['spine_02','neck_01','spine_03','pelvis'].concat(...['l','r'].map(s=>['upperarm_','lowerarm_','hand_','thigh_','calf_','foot_'].map(k=>k+s))); if(need.some(n=>!bone(n)))return null;
    let rx=0; const DOWN=new V(0,-1,0), wq=new Q(), pq=new Q(), dq=new Q(), q0=new Q(), fq=new Q(), fpq=new Q(), A=new V(), B2=new V(), P1=new V(), P2=new V();
    const aim=(b_,c,dir)=>{ b_.getWorldPosition(A); c.getWorldPosition(B2); dq.setFromUnitVectors(B2.sub(A).normalize(),dir); b_.getWorldQuaternion(wq); b_.parent.getWorldQuaternion(pq); b_.quaternion.copy(pq.invert().multiply(dq.multiply(wq))); b_.updateMatrixWorld(true); };
    const blend=(b_,c,dir,w)=>{ q0.copy(b_.quaternion); aim(b_,c,dir); if(w<1){ b_.quaternion.slerpQuaternions(q0,b_.quaternion.clone(),w); b_.updateMatrixWorld(true); } };
    const outOf=(a,c)=>{ bone(a).getWorldPosition(P1); bone(c).getWorldPosition(P2); P2.sub(P1); P2.y=0; return P2.normalize().clone(); };
    const footY=()=>{ bone('foot_l').getWorldPosition(P1); bone('foot_r').getWorldPosition(P2); return Math.min(P1.y,P2.y); };
    return (dt,on)=>{ rx+=((on?1:0)-rx)*Math.min(1,dt*6); if(rx<.01)return; root.updateMatrixWorld(true); const f=fw(), y0=footY();
      blend(bone('spine_02'),bone('neck_01'),new V(0,1,0).addScaledVector(f,.05).normalize(),rx*.7);
      for(const sd of ['l','r']){ const o=outOf('spine_03','upperarm_'+sd);
        blend(bone('upperarm_'+sd),bone('lowerarm_'+sd),DOWN.clone().addScaledVector(o,.14).addScaledVector(f,.02).normalize(),rx);
        blend(bone('lowerarm_'+sd),bone('hand_'+sd),DOWN.clone().addScaledVector(o,.06).addScaledVector(f,.16).normalize(),rx); }
      for(const sd of ['l','r']){ const ft=bone('foot_'+sd); ft.getWorldQuaternion(fq); const o=outOf('pelvis','thigh_'+sd);
        blend(bone('thigh_'+sd),bone('calf_'+sd),DOWN.clone().addScaledVector(o,.03).normalize(),rx);
        blend(bone('calf_'+sd),ft,DOWN.clone().addScaledVector(f,-.02).normalize(),rx);
        ft.parent.getWorldQuaternion(fpq); ft.quaternion.copy(fpq.invert().multiply(fq)); ft.updateMatrixWorld(true); }
      root.position.y+=y0-footY(); }; };
  const fwd=()=>new V(Math.sin(heading),0,Math.cos(heading));
  const npcOf=(geo,rig,tall,names)=>{ const N=makeNPC(null,{key:'me',name:'YOU',names,eye:-1,lv:'up',group:'bodega',geo,skin:rig,tall,rank:names.map(()=>0),metres:1.85*(W3.SZ||1),x:pos.x,z:pos.z,radius:.3,speed:0,stride:0,rock:0,bob:0});
    NPCS.splice(NPCS.indexOf(N),1); if(N.g.parent)N.g.parent.remove(N.g); scene.add(N.g); NPCS.extra.push({g:N.g}); return N; };
  const BUILD={};
  const walkerRig=()=>{ const R=RIG, C={g:new THREE.Group(),sig:''}, M4=THREE.Matrix4;
    const fit=()=>{ const B0=R.build(R.walkPose({ph:0,w:0},null),null), J={}; for(const k in B0.J)J[k]=new V(B0.J[k].x,B0.J[k].y,B0.J[k].z);
      const sig=['hipL','kneeL','ankleL','shoulderL','elbowL','wristL','neck','headBase','k23L'].map(k=>J[k]?J[k].toArray().map(v=>v.toFixed(2)).join():'').join(); if(sig===C.sig)return; C.sig=sig; C.B0=B0;
      const r0=rigOf(RG.t); r0.bones[0].updateMatrixWorld(true); const P0=n=>new V().setFromMatrixPosition(r0.bones[BI[n]].matrixWorld);
      const T=RG.t.map(t=>new V().fromArray(t)), len=(n,l)=>T[BI[n]].setLength(l), d=(a,c)=>J[a].distanceTo(J[c]);
      const ksp=d('neck','pelvis')/P0('neck_01').distanceTo(P0('pelvis')), kh=J.hipL.y/P0('thigh_l').y;
      T[BI.pelvis].multiplyScalar(kh); for(const n of ['spine_01','spine_02','spine_03','neck_01','clavicle_l','clavicle_r'])T[BI[n]].multiplyScalar(ksp);
      len('Head',d('headBase','neck'));
      for(const [s,S] of [['l','L'],['r','R']]){ len('upperarm_'+s,d('shoulder'+S,'clav'+S)); len('lowerarm_'+s,d('elbow'+S,'shoulder'+S)); len('hand_'+s,d('wrist'+S,'elbow'+S));
        const kf=J['fingers'+S].distanceTo(J['wrist'+S])/P0('middle_04_leaf_'+s).distanceTo(P0('hand_'+s)); BN.forEach((n,i)=>{ if(n.endsWith('_'+s)&&/^(index|middle|pinky|ring|thumb)/.test(n))T[i].multiplyScalar(kf); });
        len('thigh_'+s,d('hip'+S,'pelvis')); len('calf_'+s,d('knee'+S,'hip'+S)); len('foot_'+s,d('ankle'+S,'knee'+S)); len('ball_'+s,d('ball'+S,'ankle'+S)); len('ball_leaf_'+s,Math.max(.5,d('toe'+S,'ball'+S))); }
      if(C.rig)C.g.remove(C.rig.bones[0]); const rig=rigOf(T.map(v=>v.toArray())); C.rig=rig; C.g.position.set(0,0,0); C.g.add(rig.bones[0]); C.g.updateMatrixWorld(true);
      const Pb=n=>new V().setFromMatrixPosition(rig.bones[BI[n]].matrixWorld), bone=n=>rig.bones[BI[n]];
      const basis=(dv,h)=>{ const x=dv.clone().normalize(), y=h.clone().addScaledVector(x,-h.dot(x)).normalize(); return new M4().makeBasis(x,y,new V().crossVectors(x,y)); };
      const al=(b_,ws,we,us,ue,o)=>{ const a=new V().subVectors(J[we],J[ws]), c=new V().subVectors(Pb(ue),Pb(us)), h=Math.abs(a.clone().normalize().z)<.7?new V(0,0,1):new V(0,1,0);
        const Rm=basis(c,h).multiply(basis(a,h).transpose()), A=new M4().makeTranslation(...Pb(o?o[1]:us).toArray()).multiply(Rm).multiply(new M4().makeTranslation(...J[o?o[0]:ws].clone().negate().toArray()));
        return {b:bone(b_),K:bone(b_).matrixWorld.clone().invert().multiply(A)}; };
      const head=al('Head','neck','headBase','neck_01','Head',['headBase','Head']), MAP={hips:al('pelvis','pelvis','spine','pelvis','spine_01'),torso:al('spine_03','chest','neck','spine_03','neck_01'),neck:al('neck_01','neck','headBase','neck_01','Head')};
      for(const [s,S] of [['l','L'],['r','R']]){ MAP['upperArm'+S]=MAP['sleeve'+S]=al('upperarm_'+s,'shoulder'+S,'elbow'+S,'upperarm_'+s,'lowerarm_'+s); MAP['forearm'+S]=al('lowerarm_'+s,'elbow'+S,'wrist'+S,'lowerarm_'+s,'hand_'+s);
        MAP['hand'+S]=al('hand_'+s,'wrist'+S,'fingers'+S,'hand_'+s,'middle_04_leaf_'+s); MAP['thigh'+S]=al('thigh_'+s,'hip'+S,'knee'+S,'thigh_'+s,'calf_'+s); MAP['shin'+S]=al('calf_'+s,'knee'+S,'ankle'+S,'calf_'+s,'foot_'+s); MAP['shoe'+S]=al('foot_'+s,'ankle'+S,'ball'+S,'foot_'+s,'ball_'+s); }
      C.P=W3.pcs.map(P=>{ const n=P.on||P.n, F=R.frameOf(n,B0), m=/^fing\d\d([LR])$/.exec(n);
        return {M:new M4().set(F.x.x,F.y.x,F.z.x,F.o.x,F.x.y,F.y.y,F.z.y,F.o.y,F.x.z,F.y.z,F.z.z,F.o.z,0,0,0,1),o:F.o,L:m?MAP['hand'+m[1]]:/^(head|hair|beard|ear|eyes)/.test(n)?head:MAP[n]}; });
      C.an=Anim(new THREE.AnimationMixer(rig.bones[0]),clipsFor(kh)); C.relax=relaxer(bone,C.g,()=>new V(0,0,1)); };
    const t4=new M4(), e4=new M4();
    C.fit=fit; C.pose=(dt,base,ts,lift)=>{ C.an.base=base; C.an.ts=ts; C.g.position.y=lift; C.an.update(dt*(base==='Idle_Loop'?st.anim||1:1)); if(C.relax)C.relax(dt,base==='Idle_Loop'); C.g.updateMatrixWorld(true);
      C.P.forEach((p,i)=>{ const PM=W3.PM.value[i]; if(!p.L||W3.HIDE[i]){ if(W3.HIDE[i])PM.makeScale(0,0,0); return; } e4.copy(p.M); if(W3.E&&W3.E[i]&&W3.applyE)W3.applyE(e4,W3.E[i],p.o); PM.multiplyMatrices(p.L.b.matrixWorld,t4.multiplyMatrices(p.L.K,e4)); }); };
    fit(); return C; };
  BUILD.mannequin=()=>{ const M=D.mesh, q=i16(M.p), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3];
    const geo=geoOf(P,b(M.c),b(M.j),b(M.w),u16(M.i),Float32Array.from(b(M.r))), rig=rigOf(RG.t), N=npcOf(geo,rig,D.tall,M.parts), bone=x=>rig.bones[BI[x]];
    const C={g:N.g,N,an:Anim(new THREE.AnimationMixer(rig.bones[0]),clipsFor(1)),relax:relaxer(bone,N.g,fwd),tris:M.tris,items:{}};
    const COL={skin:[222,180,150],briefs:[64,64,74],hair:[78,58,48],shirt:[156,152,115],jeans:[58,86,128],shoes:[70,52,40]}, THICK={hair:[.012,.03],shirt:[.012,0],jeans:[.009,0],shoes:[.014,0]};
    const Pp=geo.attributes.position.array, SI=geo.attributes.skinIndex.array, SW=geo.attributes.skinWeight.array, n=Pp.length/3, ibm=f32(RG.ibm), JP=BN.map((_,i)=>new V().setFromMatrixPosition(new THREE.Matrix4().fromArray(ibm,i*16).invert()));
    const dom=new Int32Array(n); for(let i=0;i<n;i++){ let bb=0,w=-1; for(let k=0;k<4;k++)if(SW[i*4+k]>w){ w=SW[i*4+k]; bb=SI[i*4+k]; } dom[i]=bb; }
    const H=BI.Head; let y0=1e9,y1=-1e9,z0=1e9,z1=-1e9; for(let i=0;i<n;i++)if(dom[i]===H){ y0=Math.min(y0,Pp[i*3+1]); y1=Math.max(y1,Pp[i*3+1]); z0=Math.min(z0,Pp[i*3+2]); z1=Math.max(z1,Pp[i*3+2]); }
    const along=(i,a,c)=>{ const A=JP[a], W=new V().subVectors(JP[c],A), l2=W.lengthSq()||1; return ((Pp[i*3]-A.x)*W.x+(Pp[i*3+1]-A.y)*W.y+(Pp[i*3+2]-A.z)*W.z)/l2; };
    const TG=new Array(n), crown=new Float32Array(n), Ty=JP[BI.thigh_l].y;
    for(let i=0;i<n;i++){ const nm=BN[dom[i]], y=Pp[i*3+1], z=Pp[i*3+2], t=new Set();
      if(nm==='Head'){ const u=(y-y0)/((y1-y0)||1), bk=(z1-z)/((z1-z0)||1); if(u>.6||(bk>.6&&u>.16)||(bk>.48&&u>.4)){ t.add('hair'); crown[i]=Math.max(0,(u-.55)/.45); } }
      if(/^spine|^clavicle/.test(nm))t.add('shirt');
      if(/^upperarm/.test(nm)){ const sd=nm.slice(-1); if(along(i,BI['upperarm_'+sd],BI['lowerarm_'+sd])<.55)t.add('shirt'); }
      if(nm==='pelvis'||/^thigh|^calf/.test(nm)){ if(!(/^calf/.test(nm)&&y<.1))t.add('jeans'); if(nm==='pelvis'||(/^thigh/.test(nm)&&y>Ty-.13))t.add('briefs'); if(nm==='pelvis'&&y>Ty+.12)t.add('shirt'); }
      if(/^foot|^ball/.test(nm)||(/^calf/.test(nm)&&y<.12))t.add('shoes');
      TG[i]=t; }
    const Cc=geo.attributes.color.array; for(let i=0;i<n;i++){ const c=TG[i].has('briefs')?COL.briefs:COL.skin; Cc[i*3]=c[0]; Cc[i*3+1]=c[1]; Cc[i*3+2]=c[2]; } geo.attributes.color.needsUpdate=true;
    const I0=geo.index.array.slice(), two=(a,c_,d,k)=>(TG[a].has(k)?1:0)+(TG[c_].has(k)?1:0)+(TG[d].has(k)?1:0)>=2;
    const nb=geo.clone(); nb.computeVertexNormals(); const Nn=nb.attributes.normal.array;
    for(const name of ['jeans','shoes','shirt','hair']){ const map=new Map(), idx=[];
      for(let f=0;f<I0.length;f+=3){ const a=I0[f],c_=I0[f+1],d=I0[f+2]; if(two(a,c_,d,name))for(const v of [a,c_,d]){ if(!map.has(v))map.set(v,map.size); idx.push(map.get(v)); } }
      const m=map.size, pp=new Float32Array(m*3), col=new Uint8Array(m*3), si=new Uint8Array(m*4), sw=new Uint8Array(m*4), [t0,t1]=THICK[name], K=COL[name];
      for(const [v,k] of map){ const o=t0+t1*crown[v]; for(let e=0;e<3;e++){ pp[k*3+e]=Pp[v*3+e]+Nn[v*3+e]*o; col[k*3+e]=K[e]; } for(let e=0;e<4;e++){ si[k*4+e]=SI[v*4+e]; sw[k*4+e]=SW[v*4+e]; } }
      const ig=geoOf(pp,col,si,sw,new Uint32Array(idx)); ig.setAttribute('fab',new THREE.BufferAttribute(new Float32Array(m).fill(name==='jeans'?1:0),1)); ig.computeVertexNormals();
      const me=new THREE.SkinnedMesh(ig,N.me.material); me.frustumCulled=false; me.castShadow=me.receiveShadow=true; N.body.add(me); me.bind(rig.skeleton,N.me.bindMatrix); C.items[name]=me; C.tris+=idx.length/3; }
    const keep=[]; for(let f=0;f<I0.length;f+=3){ const a=I0[f],c_=I0[f+1],d=I0[f+2]; if(!Object.keys(C.items).some(k=>two(a,c_,d,k)))keep.push(a,c_,d); } geo.setIndex(keep); C.tris+=keep.length/3-M.tris;
    return C; };
  const VMAP={hips:'pelvis',spine:'spine_01',chest:'spine_02',upperChest:'spine_03',neck:'neck_01',head:'Head'};
  for(const [s,S] of [['l','left'],['r','right']]){
    Object.assign(VMAP,{[S+'Shoulder']:'clavicle_'+s,[S+'UpperArm']:'upperarm_'+s,[S+'LowerArm']:'lowerarm_'+s,[S+'Hand']:'hand_'+s,[S+'UpperLeg']:'thigh_'+s,[S+'LowerLeg']:'calf_'+s,[S+'Foot']:'foot_'+s,[S+'Toes']:'ball_'+s,
      [S+'ThumbMetacarpal']:'thumb_01_'+s,[S+'ThumbProximal']:'thumb_02_'+s,[S+'ThumbDistal']:'thumb_03_'+s});
    for(const [f,u] of [['Index','index'],['Middle','middle'],['Ring','ring'],['Little','pinky']])Object.assign(VMAP,{[S+f+'Proximal']:u+'_01_'+s,[S+f+'Intermediate']:u+'_02_'+s,[S+f+'Distal']:u+'_03_'+s}); }
  const VINV=Object.fromEntries(Object.entries(VMAP).map(([a,c])=>[c,a]));
  const vrmClips=vrm=>{ const H=vrm.humanoid, NB=BN.length, rq=BN.map((_,i)=>new Q().fromArray(RG.q[i])), rw=[];
    for(let i=0;i<NB;i++)rw[i]=PAR[i]<0?rq[i].clone():rw[PAR[i]].clone().multiply(rq[i]);
    const rwi=rw.map(q=>q.clone().invert()), vb=[];
    for(const [hb,ub] of Object.entries(VMAP)){ const node=H.getNormalizedBoneNode(hb); if(node)vb.push({node,s:BI[ub]}); }
    const by=new Map(vb.map(v=>[v.node,v.s])); for(const v of vb){ let p=v.node.parent; v.p=-1; while(p){ if(by.has(p)){ v.p=by.get(p); break; } p=p.parent; } }
    const hipsN=H.getNormalizedBoneNode('hips'), hip0=hipsN.position.clone(), pr=new V().fromArray(RG.t[BI.pelvis]).applyQuaternion(rq[0]), k=hip0.y/pr.y, out={};
    for(const [name,C] of Object.entries(D.clips)){ const n=C.n, q=i16(C.q), t=TT(C), arr=vb.map(()=>new Float32Array(n*4)), hp=new Float32Array(n*3), P=C.p.pelvis?f32(C.p.pelvis):null;
      const w=Array.from({length:NB},()=>new Q()), dq=Array.from({length:NB},()=>new Q()), a=new Q(), c=new Q();
      for(let f=0;f<n;f++){
        for(let i=0;i<NB;i++){ const o=(f*NB+i)*4; a.set(q[o]/32000,q[o+1]/32000,q[o+2]/32000,q[o+3]/32000).normalize(); w[i].copy(PAR[i]<0?a:c.copy(w[PAR[i]]).multiply(a)); dq[i].copy(w[i]).multiply(rwi[i]); }
        vb.forEach((v,j)=>{ (v.p<0?c.copy(dq[v.s]):c.copy(dq[v.p]).invert().multiply(dq[v.s])).toArray(arr[j],f*4); });
        const pw=P?new V(P[f*3],P[f*3+1],P[f*3+2]).applyQuaternion(w[0]):pr.clone();
        hp[f*3]=hip0.x+(pw.x-pr.x)*k; hp[f*3+1]=hip0.y+(pw.y-pr.y)*k; hp[f*3+2]=hip0.z+(pw.z-pr.z)*k; }
      const tr=vb.map((v,j)=>new THREE.QuaternionKeyframeTrack(v.node.name+'.quaternion',t,arr[j])); tr.push(new THREE.VectorKeyframeTrack(hipsN.name+'.position',t,hp));
      out[name]=new THREE.AnimationClip(name,C.dur,tr); }
    return out; };
  BUILD.vroid=()=>{ const C={g:new THREE.Group(),tris:0,wait:true}; C.g.visible=false; scene.add(C.g); NPCS.extra.push({g:C.g});
    (async()=>{ const [{VRMLoaderPlugin},{GLTFLoader}]=await Promise.all([import('@pixiv/three-vrm'),import('three/addons/loaders/GLTFLoader.js')]), d=await VROID();
      const L=new GLTFLoader(); L.register(p=>new VRMLoaderPlugin(p)); const gl=await new Promise((ok,no)=>L.parse(b(d.glb).buffer,'',ok,no)), vrm=gl.userData.vrm, s=vrm.scene;
      s.traverse(o=>{ if(o.isMesh){ o.castShadow=o.receiveShadow=true; o.frustumCulled=false; if(o.geometry.index)C.tris+=o.geometry.index.count/3; for(const m of [].concat(o.material))if(m.isMToonMaterial){ m.shadingToonyFactor=.97; m.needsUpdate=true; } } });
      const tall=new THREE.Box3().setFromObject(s).max.y||1.6; s.scale.setScalar(1.75*(W3.SZ||1)*TILE/.84/tall); C.g.add(s);
      C.vrm=vrm; C.an=Anim(new THREE.AnimationMixer(s),vrmClips(vrm)); C.relax=relaxer(n=>vrm.humanoid.getNormalizedBoneNode(VINV[n]),C.g,fwd); C.wait=false; })().catch(e=>{ C.err=e.message; console.warn('VROID',e); });
    return C; };
  const MOVE={jump:'Jump_Loop',backflip:'Jump_Loop',frontflip:'Jump_Loop',jab:'Punch_Jab',cross:'Punch_Cross',hook:'Punch_Cross',uppercut:'Punch_Cross',slap:'Punch_Jab',frontKick:'Punch_Cross',roundhouse:'Punch_Cross',
    legSweep:'Crouch_Idle_Loop',fall:'Death01',roll:'Roll',block:'Spell_Simple_Idle_Loop',guard:'Spell_Simple_Idle_Loop',crouch:'Crouch_Idle_Loop',flinch:'Hit_Chest',wave:'Interact',dance:'Dance_Loop'};
  const MPS=TILE/.84; let lx=null, lz=null, sp=0;
  AVS.set=k=>{ if(!AVS.KINDS.includes(k))k='walker'; AVS.kind=k; if(k!=='walker'&&!AVS.C[k])AVS.C[k]=BUILD[k](); try{ SAVE.set('avatar',k); }catch(e){} if(AVS.draw)AVS.draw(); };
  const pick=()=>{ const mv=st.move&&st.move.name; let base='Idle_Loop', ts=1;
    if(st.water&&st.water.in)base=sp>.3?'Swim_Fwd_Loop':'Swim_Idle_Loop';
    else if(st.sit)base='Sitting_Idle_Loop';
    else if(mv)base=MOVE[mv]||null;
    else if(st.up&&MOVE[st.up.name])base=MOVE[st.up.name];
    else if(sp>.25){ const sk=(st.wk||1)+((st.rk||1)-(st.wk||1))*(st.run||0), sn=sp/sk;
      if(sn>3.6){ base='Sprint_Loop'; ts=sp/5; } else if(sn>2){ base='Jog_Fwd_Loop'; ts=sp/3.2; } else { base='Walk_Loop'; ts=sp/1.4; } }
    return [base,Math.max(.2,Math.min(4,ts*(st.anim||1)))]; };
  const jumpY=B=>{ const mv=st.move&&st.move.name; return mv&&/jump|flip/.test(mv)&&B&&B.J&&B.J.pelvis?Math.max(0,B.J.pelvis.y-18):0; };
  let fitT=0;
  AVS.tick=(dt,B)=>{ const k=AVS.kind, C=AVS.C[k], first=typeof UI!=='undefined'&&UI.view==='first', mine=k!=='walker'&&!!C&&!C.wait&&!C.err;
    for(const n in AVS.C){ const c=AVS.C[n]; if(c.g)c.g.visible=mine&&n===k&&!first&&!W3.hideMeQ; }
    if(!W3.hideMeQ&&W3.hideMe!==mine){ W3.hideMe=mine; if(!mine)W3.group.traverse(o=>{ if(o.isMesh)o.visible=true; }); }
    if(!dt)return;
    if(lx===null){ lx=pos.x; lz=pos.z; } const d=Math.hypot(pos.x-lx,pos.z-lz)/MPS/dt; lx=pos.x; lz=pos.z; sp+=(Math.min(d,9)-sp)*Math.min(1,dt*8);
    const [base,ts]=pick();
    if(k==='walker'){ if(!W3.pcs||RAG.on||(typeof ED!=='undefined'&&ED.on)||!base)return; if(!AVS.W)AVS.W=walkerRig(); if((fitT+=dt)>2){ fitT=0; AVS.W.fit(); } AVS.W.pose(dt,base,ts,jumpY(B)); return; }
    if(!mine)return;
    if(C.N&&C.items)for(const n in C.items)if(C.items[n].material!==C.N.me.material)C.items[n].material=C.N.me.material;
    C.g.position.set(pos.x,py+jumpY(B)*ZU*(W3.SZ||1)*(W3.BH||1),pos.z); C.g.rotation.set(0,RAG.on?RAG.hd:heading,0);
    const b0=RAG.on?'Death01':base||'Idle_Loop'; C.an.base=b0; C.an.ts=ts; C.an.update(dt*(b0==='Idle_Loop'?st.anim||1:1));
    if(C.relax)C.relax(dt,b0==='Idle_Loop'&&!RAG.on); if(C.vrm)C.vrm.update(dt); };
  AVS.draw=()=>document.querySelectorAll('[data-av]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.av===AVS.kind)));
  AVS.menu=()=>{ for(const row of document.querySelectorAll('#davpick'))if(!row.children.length){ row.innerHTML=AVS.KINDS.map(k=>`<button class="btn" data-av="${k}">${AVS.NAME[k]}</button>`).join('');
      row.onclick=e=>{ const x=e.target.closest('[data-av]'); if(x){ e.stopPropagation(); AVS.set(x.dataset.av); } }; } AVS.draw(); };
  window.AVSDBG=()=>{ const C=AVS.kind==='walker'?AVS.W:AVS.C[AVS.kind]; return {kind:AVS.kind,ready:!!C&&!C.wait,err:C&&C.err||null,base:C&&C.an&&C.an.base,tris:C&&C.tris?Math.round(C.tris):W3.tris,sp:+sp.toFixed(2),vis:!!C&&!!C.g&&C.g.visible}; };
  let k0=QS.get('avatar'); if(!k0)try{ k0=SAVE.get('avatar'); }catch(e){} if(k0&&AVS.KINDS.includes(k0)&&k0!=='walker')AVS.set(k0); }
