// ---- HIS BODY IN A PHYSICS ENGINE (owner, 17 Oct 2026: "can we try another physics engine for our avatar? ... it seems to be stiff"; his pick:
// a physics body). Rapier (free, open source, from its CDN) runs fifteen solid parts of him (hips, chest, head, the arms' three parts, the legs'
// three), each a box the size of its own piece, joined at his joints, under gravity, standing on the ground under him. His animation (every
// move the rig has) is no longer drawn as it is: it's where each part is pulled toward, a pull with give, so he sways, lags a touch, settles,
// and the weight shows; when he goes down (F, or something heavy into him) the pull lets go and he falls as a body falls, then is drawn back
// up into his moves. LOOSE in the menu sets how much give. His pieces ride their parts; the skeleton's lengths and his shape stay his own ----
const PB={on:false,ready:false,loose:0.5};
{ const R=RIG, PCS=W3.pcs, KEYS=['hips','torso','head','upperArmL','forearmL','handL','upperArmR','forearmR','handR','thighL','shinL','shoeL','thighR','shinR','shoeR'];
  const PARENT={torso:'hips',head:'torso',upperArmL:'torso',forearmL:'upperArmL',handL:'forearmL',upperArmR:'torso',forearmR:'upperArmR',handR:'forearmR',thighL:'hips',shinL:'thighL',shoeL:'shinL',thighR:'hips',shinR:'thighR',shoeR:'shinR'};
  // each piece of him rides one part
  const partOf=n=>{ const s=n.slice(-1), sd=s==='L'||s==='R'?s:''; if(/^(head|hair|beard|brow|eye|nose|ear|mouth)/.test(n))return 'head'; if(n==='neck'||n==='torso')return 'torso'; if(n==='hips')return 'hips';
    if(/^(sleeve|upperArm)/.test(n))return 'upperArm'+sd; if(/^forearm/.test(n))return 'forearm'+sd; if(/^(hand|fing)/.test(n))return 'hand'+sd; if(/^thigh/.test(n))return 'thigh'+sd; if(/^shin/.test(n))return 'shin'+sd; if(/^shoe/.test(n))return 'shoe'+sd; return 'torso'; };
  const PART=PCS.map(P=>KEYS.indexOf(partOf(P.n)));
  const M=(F,out=new THREE.Matrix4())=>out.set(F.x.x,F.y.x,F.z.x,F.o.x, F.x.y,F.y.y,F.z.y,F.o.y, F.x.z,F.y.z,F.z.z,F.o.z, 0,0,0,1);
  // each part's box: its own piece's size in its frame (from his mesh at rest), a little smaller so the parts don't jam at the joints
  const g=W3.mesh.geometry, PA=g.attributes.position.array, PI=g.attributes.pidx.array, BOX=KEYS.map(()=>[1e9,1e9,1e9,-1e9,-1e9,-1e9]);
  for(let i=0;i<PI.length;i++){ const p=PCS[PI[i]|0]; if(p.n!==KEYS[PART[PI[i]|0]])continue; const b=BOX[PART[PI[i]|0]]; for(let k=0;k<3;k++){ b[k]=Math.min(b[k],PA[i*3+k]); b[k+3]=Math.max(b[k+3],PA[i*3+k]); } }
  let RAPIER=null, world=null, bodies=[], ground=null, acc=0, need=true;
  const S=new THREE.Matrix4(), T=new THREE.Matrix4(), Q=new THREE.Quaternion(), P=new THREE.Vector3(), Sc=new THREE.Vector3(), tgt=KEYS.map(()=>({p:new THREE.Vector3(),q:new THREE.Quaternion(),m:new THREE.Matrix4(),p0:new THREE.Vector3(),v:new THREE.Vector3()})), q0=new THREE.Quaternion(), dq=new THREE.Quaternion(), ax=new THREE.Vector3();
  // where each part should be: his pose's frame for it, where he stands, turned to his heading (in his own units, the world's scaled to him)
  // (and how fast each is going: his walk's own speed handed to the part, so the body keeps up with the legs and only the give lags)
  function targets(B,x,y,z,hd,dt){ T.makeRotationY(hd).setPosition(x*PPU,y/ZU,z*PPU); KEYS.forEach((k,i)=>{ const t=tgt[i]; t.p0.copy(t.p); t.m.multiplyMatrices(T,M(R.frameOf(k,B))); t.m.decompose(t.p,t.q,Sc); t.v.subVectors(t.p,t.p0).divideScalar(Math.max(dt,1e-3)); if(t.v.length()>600)t.v.set(0,0,0); }); }
  function build(){ const G=R.G?R.G():280; world=new RAPIER.World({x:0,y:-G,z:0}); world.timestep=1/120;
    ground=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased()); world.createCollider(RAPIER.ColliderDesc.cuboid(400,5,400).setTranslation(0,-5,0).setFriction(1.2).setCollisionGroups(0x00020001),ground);
    bodies=KEYS.map((k,i)=>{ const t=tgt[i], b=BOX[i], rb=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(t.p.x,t.p.y,t.p.z).setRotation({x:t.q.x,y:t.q.y,z:t.q.z,w:t.q.w}).setLinearDamping(0.6).setAngularDamping(1.5).setCcdEnabled(/^(hand|shoe)/.test(k)));
      const h=[0,1,2].map(q=>Math.max(0.6,(b[q+3]-b[q])/2*0.82)), c=[0,1,2].map(q=>(b[q+3]+b[q])/2);
      world.createCollider(RAPIER.ColliderDesc.cuboid(...h).setTranslation(...c).setFriction(0.9).setDensity(1).setCollisionGroups(0x00010002),rb); return rb; });   // (his parts touch the ground, not each other)
    KEYS.forEach((k,i)=>{ const p=PARENT[k]; if(!p)return; const j=KEYS.indexOf(p), at=tgt[i].p, inv=new THREE.Matrix4().copy(tgt[j].m).invert(), a1=at.clone().applyMatrix4(inv);
      world.createImpulseJoint(RAPIER.JointData.spherical({x:a1.x,y:a1.y,z:a1.z},{x:0,y:0,z:0}),bodies[j],bodies[i],true); }); need=false; }
  function reset(){ bodies.forEach((rb,i)=>{ const t=tgt[i]; rb.setTranslation(t.p,true); rb.setRotation(t.q,true); rb.setLinvel({x:0,y:0,z:0},true); rb.setAngvel({x:0,y:0,z:0},true); }); }
  // each step: every part drawn toward where his move has it; the hips held to where he stands (not when he's down); the ground under him
  function drive(h,down){ const stiff=0.06+0.5*(1-PB.loose), limp=down?0.015:stiff;
    bodies.forEach((rb,i)=>{ const t=tgt[i], r=rb.rotation(); q0.set(r.x,r.y,r.z,r.w); dq.copy(t.q).multiply(q0.clone().invert()); if(dq.w<0){ dq.x=-dq.x; dq.y=-dq.y; dq.z=-dq.z; dq.w=-dq.w; }
      const an=2*Math.acos(Math.min(1,dq.w)), s=Math.sqrt(Math.max(1e-9,1-dq.w*dq.w)); ax.set(dq.x/s,dq.y/s,dq.z/s); const w=rb.angvel(), k=(i===0&&!down?Math.max(limp,0.35):limp)*an/h;
      rb.setAngvel({x:w.x+(ax.x*k-w.x)*0.6,y:w.y+(ax.y*k-w.y)*0.6,z:w.z+(ax.z*k-w.z)*0.6},true);
      if(!down){ const p=rb.translation(), v=rb.linvel(), kp=(i===0?0.35:/^(torso|head)$/.test(KEYS[i])?0.1:0.04)*(0.4+0.6*(1-PB.loose))/h, f=t.v;   // (the hips held to where he is, his chest and head a little, the rest gently; every part going his speed)
        rb.setLinvel({x:v.x+((t.p.x-p.x)*kp+f.x-v.x)*0.7,y:v.y+((t.p.y-p.y)*kp+f.y-v.y)*0.7,z:v.z+((t.p.z-p.z)*kp+f.z-v.z)*0.7},true); } }); }
  PB.step=(dt,B,x,y,z,hd,gy,down)=>{ if(!PB.on||!PB.ready||ED.anim)return false; targets(B,x,y,z,hd,dt); if(need){ build(); }
    if(tgt[0].p.distanceTo(bodies[0].translation())>40)reset();   // (taken somewhere: the map, the stairs' level, a teleport)
    ground.setNextKinematicTranslation({x:x*PPU,y:gy/ZU,z:z*PPU}); acc=Math.min(acc+dt,6/120);
    while(acc>=1/120){ acc-=1/120; drive(1/120,down); world.step(); }
    // his pieces where their parts are (each riding its part as his pose has it); he in the world as his units scaled, not turned (the parts are)
    W3.group.position.set(0,0,0); W3.group.rotation.set(0,0,0); W3.group.scale.set(1/PPU,ZU,1/PPU); W3.L.applyAxisAngle(new THREE.Vector3(0,1,0),hd); W3.G.value.identity();
    const Fb=KEYS.map((k,i)=>{ const rb=bodies[i], p=rb.translation(), r=rb.rotation(); return new THREE.Matrix4().compose(P.set(p.x,p.y,p.z),Q.set(r.x,r.y,r.z,r.w),Sc.set(1,1,1)); });
    const Bm=KEYS.map(k=>M(R.frameOf(k,B)).invert());
    PCS.forEach((pc,i)=>{ const j=PART[i]; if(j<0)return; const O=new THREE.Matrix4().multiplyMatrices(Bm[j],M(R.frameOf(pc.on||pc.n,B))); const PM=W3.PM.value[i].multiplyMatrices(Fb[j],O);
      if(W3.E&&W3.E[i])W3.applyE(PM,W3.E[i],new THREE.Vector3().setFromMatrixPosition(PM)); });
    return true; };
  PB.load=()=>{ if(RAPIER||PB.loading)return; PB.loading=true; import('https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.12.0/rapier.es.js').then(async m=>{ RAPIER=m.default||m; await RAPIER.init(); PB.ready=true; need=true; PB.R=RAPIER; (PB.onReady||[]).forEach(f=>f()); /* (the street's characters take the engine too: npc-street) */ }).catch(e=>{ console.warn('physics body: Rapier did not load',e); PB.on=false; }); };
  PB.set=on=>{ PB.on=on; if(on){ PB.load(); need=true; } try{ localStorage.setItem('market-physbody',on?'1':'0'); }catch(e){} };
  let on0=true; try{ const v=localStorage.getItem('market-physbody'); if(v!=null)on0=v==='1'; const l=localStorage.getItem('market-loose'); if(l!=null)PB.loose=+l; }catch(e){} PB.set(on0);
}
