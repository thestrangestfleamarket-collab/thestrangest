// THE POLYFORK AVATAR'S WALK (owner, 5 Nov 2026: "walking is very glitchy ... use real physics to have the player walk on the actual ground with smooth leg movements"; his pick:
// recorded clips with the feet on the ground): Polyfork's own Mixamo clips (.polyfork/anim/clips.json, polyfork.dev/anim/clips.json) played on Polyfork's skeleton here,
// each frame written as every avatar bone's move from the arms-down bind (tools/pfavatar-bake.mjs) to .polyfork/anim-raw.json; tools/pfavatar-pack.py puts it in the figures' data.
// Run: node tools/pfavatar-anim.mjs (after pfavatar-bake.mjs)
import fs from 'fs'; import path from 'path'; import * as THREE from 'three';
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..'), PF=path.join(ROOT,'.polyfork');
const BASE='holidaymaker-in-a-sun-2ba5e5', J=JSON.parse(fs.readFileSync(path.join(PF,'anim','clips.json'),'utf8')), CLIPS=Object.keys(J);   // every clip in Polyfork's library (owner, 7 Nov 2026: "yes lets use mixamo", his pick: Polyfork's 44)
// clips that travel or lie down keep the hips where the clip has them; the rest stand, their feet kept where they stand
const MOVING=new Set(['Walk','Jog','Run','Walk formal','Walk carrying','Swimming','Treading water','Kick','Sit down','Stand up','Sitting','Sitting talking','Driving']);
// each avatar bone (the rig's 15) follows one of Polyfork's
const MAP={hips:'Hips',torso:'Spine1',head:'Head',upperArmL:'LeftArm',forearmL:'LeftForeArm',handL:'LeftHand',upperArmR:'RightArm',forearmR:'RightForeArm',handR:'RightHand',
  thighL:'LeftUpLeg',shinL:'LeftLeg',shoeL:'LeftFoot',thighR:'RightUpLeg',shinR:'RightLeg',shoeR:'RightFoot'};
const BONES=Object.keys(MAP);
const ARMS=[['LeftShoulder',-12],['LeftArm',-60],['RightShoulder',12],['RightArm',60]], ZA=new THREE.Vector3(0,0,1);
const M=await import(path.join(PF,'patched',BASE+'.mjs'));
const out={bones:BONES,clips:{}};
for(const [f,fig] of [['m','masculine'],['f','feminine']]){
  globalThis.__pfHook=(fn,c)=>fn({...c,wear:{}}); const g=M.createAsset({figure:fig,build:1.02,expression:'neutral'}); globalThis.__pfHook=null; g.updateMatrixWorld(true);
  const by={}; g.traverse(n=>{ if(n.isBone&&!by[n.name])by[n.name]=n; });
  const hv=new THREE.Vector3(); by.Head.getWorldPosition(hv); const s=1.52/hv.y;   // (metres as the pieces: sized before the legs shorten)
  // the same legs as the pieces (tools/pfavatar-pack.py LEG): knees and ankles 15% nearer along the leg, the hips lowered as much, the feet where they were
  { const LEG=0.85, H=new THREE.Vector3(), F=new THREE.Vector3(); by.LeftUpLeg.getWorldPosition(H); by.LeftFoot.getWorldPosition(F);
    for(const s of ['Left','Right']){ by[s+'Leg'].position.multiplyScalar(LEG); by[s+'Foot'].position.multiplyScalar(LEG); }
    by.Hips.position.y-=(1-LEG)*(H.y-F.y); g.updateMatrixWorld(true); }
  const rest={}; for(const n in by)rest[n]={q:by[n].quaternion.clone(),p:by[n].position.clone()};
  // the bind: arms down, as the pieces were baked
  for(const [nm,deg] of ARMS){ const b=by[nm], pq=new THREE.Quaternion(); b.parent.getWorldQuaternion(pq); b.quaternion.premultiply(pq.clone().invert().multiply(new THREE.Quaternion().setFromAxisAngle(ZA,deg*Math.PI/180)).multiply(pq)); b.updateMatrixWorld(true); }
  g.updateMatrixWorld(true); const BIND=BONES.map(k=>by[MAP[k]].matrixWorld.clone().invert());
  const hip0=rest.Hips.p.y, ratio=hip0/0.95;
  out.clips[f]={};
  for(const name of CLIPS){ const C=J[name]; if(!C)throw new Error('no clip '+name); const n=C.times.length, Q=[], P=[], foot=[]; let plant=null;
    for(let i=0;i<n;i++){
      for(const nm in rest){ by[nm].quaternion.copy(rest[nm].q); by[nm].position.copy(rest[nm].p); }
      for(const [bn,v] of Object.entries(C.tracks)){ const b=by[bn]; if(b)b.quaternion.set(v[i*4],v[i*4+1],v[i*4+2],v[i*4+3]); }
      if(C.hips)by.Hips.position.y=hip0+C.hips[i*3+1]*ratio;   // the hips' bob kept, their travel dropped (the game moves you)
      g.updateMatrixWorld(true);
      // standing (Idle, Crouch): the hips shift under the sway so the feet stay where they stand (owner, 5 Nov 2026: "the character slides around in same spot when idle")
      if(!MOVING.has(name)){ const a=new THREE.Vector3(), c=new THREE.Vector3(); by.LeftFoot.getWorldPosition(a); by.RightFoot.getWorldPosition(c); const mid=a.add(c).multiplyScalar(.5);
        if(i===0)plant=mid.clone(); else { const d=plant.clone().sub(mid); d.y=0; const L=d.length(); if(L>1e-9)d.transformDirection(by.Hips.parent.matrixWorld.clone().invert()).multiplyScalar(L/(by.Hips.parent.getWorldScale(new THREE.Vector3()).x||1));
          by.Hips.position.x+=d.x; by.Hips.position.z+=d.z; g.updateMatrixWorld(true); } }
      BONES.forEach((k,j)=>{ const D=by[MAP[k]].matrixWorld.clone().multiply(BIND[j]), q=new THREE.Quaternion(), p=new THREE.Vector3(), sc=new THREE.Vector3(); D.decompose(p,q,sc);
        Q.push(...q.toArray().map(x=>+x.toFixed(5))); P.push(...p.toArray().map(x=>+(x*s).toFixed(5))); });
      const a=new THREE.Vector3(), c=new THREE.Vector3(); by.LeftFoot.getWorldPosition(a); by.RightFoot.getWorldPosition(c); foot.push([a.y*s,a.z*s,c.y*s,c.z*s]); }
    // how fast a planted foot slides back (metres a second): the speed you move at for this clip's feet to stay put
    const dt=C.times[1]-C.times[0]; let sp=0, k=0;
    for(let i=1;i<n;i++)for(const [y,z] of [[0,1],[2,3]]){ const lo=Math.min(...foot.map(r=>r[y])); if(foot[i][y]<lo+0.03){ sp+=-(foot[i][z]-foot[i-1][z])/dt; k++; } }
    // where in the cycle the left foot comes down (so walk and run blend in step)
    let contact=0; for(let i=1;i<n;i++)if(foot[i][0]<foot[i-1][0]&&foot[i][0]<Math.min(...foot.map(r=>r[0]))+0.03&&foot[(i-1+n)%n][0]>=foot[i][0]){ contact=i/n; break; }
    out.clips[f][name]={n,dur:+(C.times[n-1]+dt).toFixed(4),speed:+(k?sp/k:0).toFixed(4),contact:+contact.toFixed(4),q:Q,p:P};
    console.log(f,name,'frames',n,'dur',out.clips[f][name].dur,'speed',out.clips[f][name].speed,'contact',out.clips[f][name].contact); } }
fs.writeFileSync(path.join(PF,'anim-raw.json'),JSON.stringify(out));
