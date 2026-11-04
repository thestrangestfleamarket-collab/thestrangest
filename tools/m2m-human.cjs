// MESH2MOTION'S HUMAN CLIPS AS RECORDINGS: each named clip of mesh2motion-app's static/assets/human (CC0, meshopt-packed) played on its
// skeleton and read as each joint's place a frame (metres, y up), in tools/mocap-read.py's format, for tools/m2m-moves.cjs to fit to the Walker.
// node tools/m2m-human.cjs <mesh2motion-app/static/assets/human> <out dir> [fps=30] [clip ...]   (no clips: all of them)
const fs=require('fs'), path=require('path'), NM=path.join(__dirname,'../node_modules/three/');
const [DIR,OUT,FPS='30',...ONLY]=process.argv.slice(2);
const JOINTS={pelvis:'pelvis',hipL:'thigh_l',hipR:'thigh_r',kneeL:'calf_l',kneeR:'calf_r',ankleL:'foot_l',ankleR:'foot_r',ballL:'ball_l',ballR:'ball_r',toeL:'ball_leaf_l',toeR:'ball_leaf_r',
  spine:'spine_02',chest:'spine_03',neck:'neck_01',headBase:'head',head:'head_leaf',shoulderL:'upperarm_l',shoulderR:'upperarm_r',elbowL:'lowerarm_l',elbowR:'lowerarm_r',wristL:'hand_l',wristR:'hand_r'};
(async()=>{
  const THREE=await import(NM+'build/three.module.js'), {GLTFLoader}=await import(NM+'examples/jsm/loaders/GLTFLoader.js'), {MeshoptDecoder}=await import(NM+'examples/jsm/libs/meshopt_decoder.module.js');
  const L=new GLTFLoader(); L.setMeshoptDecoder(MeshoptDecoder);
  const load=f=>new Promise((ok,no)=>{ const b=fs.readFileSync(f); L.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'',ok,no); });
  fs.mkdirSync(OUT,{recursive:true}); const files=(ONLY.length?ONLY.map(n=>n+'.glb'):fs.readdirSync(path.join(DIR,'animations')).filter(f=>f.endsWith('.glb'))).sort(), fps=+FPS, list=[];
  for(const f of files){ const g=await load(path.join(DIR,'animations',f)), S=g.scene, A=g.animations[0], mx=new THREE.AnimationMixer(S), ac=mx.clipAction(A); ac.setLoop(THREE.LoopOnce); ac.clampWhenFinished=true; ac.play();   // (once: its last frame, not its first again)
    const B=Object.fromEntries(Object.entries(JOINTS).map(([k,n])=>[k,S.getObjectByName(n)])); for(const k in B)if(!B[k])throw f+': no bone '+JOINTS[k];
    const n=Math.max(2,Math.round(A.duration*fps)+1), frames=[], p=new THREE.Vector3();
    for(let i=0;i<n;i++){ mx.setTime(Math.min(A.duration,i/fps)); S.updateMatrixWorld(true); const fr={}; for(const k in B)fr[k]=B[k].getWorldPosition(p).toArray().map(v=>+v.toFixed(4)); frames.push(fr); }
    const name=f.replace(/\.glb$/,''); fs.writeFileSync(path.join(OUT,name+'.json'),JSON.stringify({fps,src:'Mesh2Motion (CC0), human/'+name+' ("'+A.name+'")',dur:+A.duration.toFixed(3),frames}));
    list.push([name,A.name,+A.duration.toFixed(2)]); }
  console.log(list.length,'clips ->',OUT); if(list.length<=40)console.log(list.map(x=>x.join(' ')).join('\n'));
})().catch(e=>{ console.error(e); process.exit(1); });
