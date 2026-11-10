// MESH2MOTION'S CLIPS ON OUR RIGS: a Mesh2Motion rig's CC0 clips (mesh2motion-app's static/assets/<rig>/: skeleton.glb, animations/*.glb,
// meshopt-packed) retold on one of our baked characters, keeping its own skin and bones. Each mapped bone turns in the world as its
// Mesh2Motion bone turns from its rest; a wing's arm first takes the Mesh2Motion rest's direction (our dragon rests wings up, theirs flat), its hand
// kept whole (the fingers' fan holds the membrane), turning only as much more than the arm as the Mesh2Motion hand does.
// node tools/m2m-bake.cjs <mesh2motion-app/static/assets> <dragon|spider|fox|farm|horse>   (writes the clips into the character's data file and its data/full copy,
// read from the full one; then python3 tools/trim-clips.py)
const fs=require('fs'), path=require('path');
const R=path.join(__dirname,'..'), NM=path.join(R,'node_modules/three/');
const [ASSETS,WHO='dragon']=process.argv.slice(2);
const RIGS={
  dragon:{ files:['data/dragon.json','data/full/dragon.json'], char:'Dragon', root:'Body', hips:'hips', fps:24,
    clips:{'fly-flap':'Fly_Flap','hover':'Hover','take-off':'Take_Off','land':'Land','fly-fire':'Fly_Fire','fire-breath':'Fire_Breath','idle':'Idle','roar':'Roar','sleep':'Sleep','walk':'Walk'},
    map:{ Body_001:'hips', Body_002:'spine_1', Body_003:'spine_3', Head:'spine_4', Head_001:'head', Head_002:'mouth_upper', Head_003:'mouth_lower',
      LegFront_L_001:'front_leg_collar_r', LegFront_L_002:'front_leg_r', LegFront_L_003:'front_ankle_r',
      LegFront_R_001:'front_leg_collar_l', LegFront_R_002:'front_leg_l', LegFront_R_003:'front_ankle_l',
      LegBack_L_001:'back_leg_r', LegBack_L_002:'back_ankle_r', LegBack_L_003:'back_foot_r',
      LegBack_R_001:'back_leg_l', LegBack_R_002:'back_ankle_l', LegBack_R_003:'back_foot_l',
      Tail:'tail_1', Tail_001:'tail_2', Tail_002:'tail_4', Tail_003:'tail_5', Tail_004:'tail_6' },
    wings:{ L:'l', R:'r' },
    wing:{ '':'shoulder', _005:'wing_1', _006:'wing_2' }, hand:{ _007:'wing_4', _010:'wing_4', _013:'wing_4', _016:'wing_4', _008:'wing_5' },
    base:{ clip:'Flying_loop', for:['Fly_Flap','Fly_Fire'] },
    wingOf:(s,k)=>'Body_002_'+s+k, lead:['', '_009'], trail:['_012','_015','_018','_020','_022'],
    tLead:['wing_1','wing_tip'], tTrail:['wing_feather_1_tip','wing_feather_2_tip','wing_feather_3_tip','wing_feather_4_tip','wing_feather_5_tip'] },
  fox:{ files:['data/fauna.json'], keys:['Fox','Dog','Wolf'], fps:12, root:'Hips', hips:'hips', clips:{'sit':'Sit','bark':'Bark','howl':'Howl'},
    map:{ Hips:'hips', Spine:'spine_2', Chest:'spine_3', Neck:'spine_4', Head:'head', Jaw:'mouth', LeftEar:'ear_1_l', RightEar:'ear_1_r', Tail:'tail_1', TailTip:'tail_3',
      ...Object.fromEntries(['Left','Right'].flatMap(sd=>{ const s=sd==='Left'?'l':'r'; return [['FrontUpLeg','front_leg_upper'],['FrontElbow','front_leg_lower'],['FrontLeg','front_leg_ankle'],['FrontFoot','front_leg_foot'],
        ['HindUpLeg','back_leg_upper'],['HindLeg','back_leg_lower'],['HindHock','back_leg_ankle'],['HindFoot','back_leg_foot']].map(([o,t])=>[sd+o,t+'_'+s]); })) } },
  farm:{ dir:'fox', files:['data/fauna.json'], keys:['Cow','Pig'], fps:12, root:'Hips', hips:'hips', clips:{'sleep':'Sleep'}, map:null },
  horse:{ files:['data/fauna.json'], keys:['Horse','WildHorse','Mule'], fps:12, root:'Hips', hips:'hips', clips:{'eating':'Graze','sleep':'Sleep'},
    map:{ Hips:'hips', Spine:'spine_2', Chest:'spine_3', Neck:'spine_5', Head:'head', Jaw:'mouth', LeftEar:'ear_1_l', RightEar:'ear_1_r', Tail:'tail_1', TailTip:'tail_3',
      ...Object.fromEntries(['Left','Right'].flatMap(sd=>{ const s=sd==='Left'?'l':'r'; return [['FrontUpLeg','front_leg_upper'],['FrontLeg','front_leg_lower'],['FrontFoot','front_leg_ankle'],
        ['HindUpLeg','back_leg_upper'],['HindLeg','back_leg_lower'],['HindHock','back_leg_ankle'],['HindFoot','back_leg_foot']].map(([o,t])=>[sd+o,t+'_'+s]); })) } },
  spider:{ files:['data/creatures.json','data/full/creatures.json'], key:'Spider', fps:24, pose:true, clips:{'hit':'Spider_Hit'},
    map:{ Body:'hips', Thorax:'spine_1', Head:'head', Abdomen:'tail_1', ...Object.fromEntries(['L','R'].flatMap(sd=>[['Front','a'],['MidFront','b'],['MidBack','c'],['Back','d']]
      .flatMap(([o,t])=>['','2','3'].map((k,i)=>[o+'Leg'+k+'_'+sd,'leg_'+t+'_'+(i+1)+'_'+sd.toLowerCase()])))) } } };
RIGS.farm.map=RIGS.fox.map;
(async()=>{ for(const KEY of (RIGS[WHO].keys||[RIGS[WHO].key])){ const C={...RIGS[WHO],key:KEY,clips:RIGS[WHO].keys?Object.fromEntries(Object.entries(RIGS[WHO].clips).map(([f,n])=>[f,KEY+'_'+n])):RIGS[WHO].clips};
  const THREE=await import(NM+'build/three.module.js'), {GLTFLoader}=await import(NM+'examples/jsm/loaders/GLTFLoader.js'), {MeshoptDecoder}=await import(NM+'examples/jsm/libs/meshopt_decoder.module.js');
  const dir=path.join(ASSETS,C.dir||WHO), L=new GLTFLoader(); L.setMeshoptDecoder(MeshoptDecoder);
  const load=f=>new Promise((ok,no)=>{ const b=fs.readFileSync(f); L.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'',ok,no); });
  const of=d=>C.key?d[C.key]:d, D=of(JSON.parse(fs.readFileSync(path.join(R,C.files[C.files.length-1])))), RG=D.rig, BN=RG.names, NB=BN.length, JI=Object.fromEntries(BN.map((n,i)=>[n,i]));
  const V=a=>new THREE.Vector3(...a), Q=a=>new THREE.Quaternion(...a);
  // our rest is the bind pose (the skin's own; the rig's stored pose is another, used when `pose`), in the rig's space: the bind matrices carry the armature's uniform scale
  const IB=new Float32Array((u=>u.buffer.slice(u.byteOffset,u.byteOffset+u.length))(Buffer.from(RG.ibm,'base64'))), OW=[], OP=[], LQ=[], SC=[];
  BN.forEach((n,i)=>{ const m=new THREE.Matrix4().fromArray(IB,i*16).invert(), p=new THREE.Vector3(), q=new THREE.Quaternion(), s=new THREE.Vector3(); m.decompose(p,q,s); OW[i]=q; OP[i]=p; SC[i]=s.x; });
  const P0=OP[0].clone(); BN.forEach((n,i)=>{ OP[i].sub(P0).multiplyScalar(1/SC[i]).add(V(RG.t[0])); const p=RG.parent[i]; LQ[i]=p<0?OW[i].clone():OW[p].clone().invert().multiply(OW[i]);
    if(!C.pose&&p>=0&&Math.abs(OP[i].distanceTo(OP[p])-V(RG.t[i]).length())>1e-3)console.log(' (bind length differs: '+n+')'); });
  if(C.pose)BN.forEach((n,i)=>{ const p=RG.parent[i], q=Q(RG.q[i]), t=V(RG.t[i]); LQ[i]=q;   // (or the rig's stored pose, when that is the one to start from)
    if(p<0){ OW[i]=q; OP[i]=t; } else { OW[i]=OW[p].clone().multiply(q); OP[i]=t.multiply(V(RG.s[p]||[1,1,1])).applyQuaternion(OW[p]).add(OP[p]); } });
  // a base pose for some clips (flying: body level, legs tucked, from our own flight clip's first frame), the wings left out
  const isWing=n=>Object.keys(C.wings||{}).some(sd=>n.startsWith(C.wingOf(sd,''))), BASE={};
  if(C.base){ const B=D.clips[C.base.clip], q=new Int16Array((u=>u.buffer.slice(u.byteOffset,u.byteOffset+u.length))(Buffer.from(B.q,'base64'))), bq=[], bw=[];
    BN.forEach((n,i)=>{ const p=RG.parent[i]; bq[i]=isWing(n)?LQ[i]:new THREE.Quaternion(q[i*4],q[i*4+1],q[i*4+2],q[i*4+3]).normalize(); bw[i]=p<0?bq[i].clone():bw[p].clone().multiply(bq[i]); });
    const bp=B.p&&B.p[C.root]?new Float32Array((u=>u.buffer.slice(u.byteOffset,u.byteOffset+12))(Buffer.from(B.p[C.root],'base64'))):null; BASE.lq=bq; BASE.w=bw; BASE.root=bp?V([...bp]):null; }
  const T0=(await load(path.join(dir,'skeleton.glb'))).scene; T0.updateMatrixWorld(true);
  const wq=o=>o.getWorldQuaternion(new THREE.Quaternion()), wp=o=>o.getWorldPosition(new THREE.Vector3());
  const tb=(S,n)=>{ const o=S.getObjectByName(n); if(!o)throw 'no Mesh2Motion bone '+n; return o; };
  const MAP={...C.map}, ALIGN={};
  for(const [s,ts] of Object.entries(C.wings||{}))for(const [k,tn] of Object.entries(C.wing))MAP[C.wingOf(s,k)]=tn+'_'+ts;
  const REL={}; for(const [s,ts] of Object.entries(C.wings||{}))for(const [k,tn] of Object.entries(C.hand||{}))REL[C.wingOf(s,k)]=tn+'_'+ts;
  for(const n in {...MAP,...REL})if(!(n in JI))throw 'no bone of ours '+n;
  const tOf=i=>MAP[BN[i]]||REL[BN[i]];
  // the wings' rest: each bone's own direction and its wing's plane, ours to theirs
  const frame=(d,nrm)=>{ const x=d.clone().normalize(), y=nrm.clone().addScaledVector(x,-nrm.dot(x)).normalize(), z=x.clone().cross(y); return new THREE.Matrix4().makeBasis(x,y,z); };
  const kid=(i)=>BN.findIndex((_,j)=>RG.parent[j]===i), tkid=o=>o.children.find(c=>c.isBone)||o.children[0];
  for(const [s,ts] of Object.entries(C.wings||{})){
    const op=k=>OP[JI[C.wingOf(s,k)]], tp=n=>wp(tb(T0,n+'_'+ts)), avg=a=>a.reduce((m,v)=>m.add(v),new THREE.Vector3()).multiplyScalar(1/a.length);
    const oN=op(C.lead[1]).sub(op(C.lead[0])).cross(avg(C.trail.map(op)).sub(op(C.lead[0]))).normalize();
    const tN=tp(C.tLead[1]).sub(tp(C.tLead[0])).cross(avg(C.tTrail.map(tp)).sub(tp(C.tLead[0]))).normalize();
    for(const k in C.wing){ const i=JI[C.wingOf(s,k)], c=kid(i), t=tb(T0,C.wing[k]+'_'+ts), tc=tkid(t);
      const Fo=frame(c<0?OP[i].clone().sub(OP[RG.parent[i]]):OP[c].clone().sub(OP[i]),oN), Ft=frame(wp(tc).sub(wp(t)),tN);
      ALIGN[i]=new THREE.Quaternion().setFromRotationMatrix(Ft.multiply(Fo.transpose())); } }
  const TQ0={}; for(const n of new Set([...Object.values(MAP),...Object.values(REL)]))TQ0[n]=wq(tb(T0,n)); const H0=C.root?wp(tb(T0,C.hips)):null, KY=!C.root?0:OP[JI[Object.keys(MAP).find(n=>MAP[n]===C.hips)]].y/H0.y;
  console.log(WHO,NB,'bones;',Object.keys(MAP).length,'follow Mesh2Motion; hips ratio',KY.toFixed(3));
  const out={};
  for(const [f,name] of Object.entries(C.clips)){
    const g=await load(path.join(dir,'animations',f+'.glb')), S=g.scene, A=g.animations[0], mx=new THREE.AnimationMixer(S), ac=mx.clipAction(A); ac.setLoop(THREE.LoopOnce); ac.clampWhenFinished=true; ac.play();   // (once: its last frame, not its first again)
    const dur=A.duration, n=Math.max(2,Math.round(dur*C.fps)+1), q=new Int16Array(n*NB*4), P=new Float32Array(n*3), TB={}; for(const t in TQ0)TB[t]=tb(S,t); const dR=t=>wq(TB[t]).multiply(TQ0[t].clone().invert()); const HB=C.root?tb(S,C.hips):null;
    const b=C.base&&C.base.for.includes(name)?BASE:null, RW=b?b.w:OW, RL=b?b.lq:LQ, R0=b&&b.root?b.root:C.root&&OP[JI[C.root]];
    for(let k=0;k<n;k++){ mx.setTime(k/(n-1)*dur); S.updateMatrixWorld(true); const W=[];
      for(let i=0;i<NB;i++){ const p=RG.parent[i], tn=MAP[BN[i]]; let w;
        if(tn){ w=dR(tn); if(ALIGN[i])w.multiply(ALIGN[i]).multiply(OW[i]); else w.multiply(RW[i]); }
        else if(REL[BN[i]]){ w=dR(REL[BN[i]]).multiply(dR(tOf(p)).invert()).multiply(W[p]).multiply(LQ[i]); }
        else w=(p<0?new THREE.Quaternion():W[p].clone()).multiply(RL[i]);
        W[i]=w; const l=p<0?w.clone():W[p].clone().invert().multiply(w); l.normalize();
        for(let c=0;c<4;c++)q[(k*NB+i)*4+c]=Math.round([l.x,l.y,l.z,l.w][c]*32000); }
      if(C.root){ const d=wp(HB).sub(H0).multiplyScalar(KY), t0=R0; P.set([t0.x+d.x,t0.y+d.y,t0.z+d.z],k*3); } }
    for(let i=0;i<NB;i++)for(let k=1;k<n;k++){ const a=(k*NB+i)*4, b=((k-1)*NB+i)*4; if(q[a]*q[b]+q[a+1]*q[b+1]+q[a+2]*q[b+2]+q[a+3]*q[b+3]<0)for(let c=0;c<4;c++)q[a+c]=-q[a+c]; }
    out[name]={dur:+dur.toFixed(4),n,q:Buffer.from(q.buffer).toString('base64'),p:C.root?{[C.root]:Buffer.from(P.buffer).toString('base64')}:{}};
    console.log(' ',f,'->',name,dur.toFixed(2)+'s',n,'frames'); }
  for(const file of C.files){ const d0=JSON.parse(fs.readFileSync(path.join(R,file))), d=of(d0); if(d.rig.names.join()!==BN.join())throw file+': another rig';
    Object.assign(d.clips,out); fs.writeFileSync(path.join(R,file),JSON.stringify(d0)); console.log(file,fs.statSync(path.join(R,file)).size,'bytes,',Object.keys(d.clips).length,'clips'); } }
})().catch(e=>{ console.error(e); process.exit(1); });
