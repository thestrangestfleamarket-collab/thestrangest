// ---- THE BODEGA'S GOODS, REAL (owner, 18 Oct 2026: "did you take away the phsyics from the game? i want every item in the bodega to be real";
// the old game's 47-physics-5-goods had every good a body you could knock off its shelf): every good on the shelves, in the coolers and on the
// counter (bodbuild.js's one goods mesh, BOD.goods its corners a good) is a rigid body in Rapier (the same build physbody.js uses, fetched from
// jsDelivr only once you come within a few tiles of the bodega's door). They start asleep, each where the shelf put it; you push what you walk
// into (your body a capsule in the world), a punch or a kick sends what's before you flying, and a double click on a good picks it up into your
// hand (the rig's own carry) and a double click anywhere throws it there. The fixtures' boxes are solid to them (all but a box a good stands
// inside, which would push it out: the coolers' cases), the floor, the walls (their doorways open). A good that moves rewrites only its own
// corners in the mesh (rotated and moved from where it stood); asleep, nothing is done. Cost: no triangles more, no light, no program; the world
// steps (120 a second) only while you're near the bodega and something is awake; GOODSDBG()
const GPH={};
{ const T=TILE; let R=null, world=null, loading=false, items=[], me=null, P0=null, N0=null, you=null, held=null, acc=0, lastHit=null, built=false;
  const near=()=>{ if(!BOD.B0||LVL!=='up')return false; const B=BOD.B0, x0=BOD.X(B.x0)-4*T, x1=BOD.X(B.x1)+4*T, z0=BOD.Z(B.y0)-4*T, z1=BOD.Z(B.y1)+4*T; return pos.x>x0&&pos.x<x1&&pos.z>z0&&pos.z<z1; };
  const load=()=>{ if(R||loading)return; loading=true; import('https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.12.0/rapier.es.js').then(async m=>{ R=m.default||m; await R.init(); build(); }).catch(e=>{ console.warn('GOODS: physics not loaded',e); loading=false; }); };
  // each good's box at rest (from its own corners), its middle and half sizes
  const prep=()=>{ me=BOD.goodsMesh; if(!me||!BOD.goods)return false; const g=me.geometry, pa=g.attributes.position; pa.setUsage(THREE.DynamicDrawUsage); g.attributes.normal.setUsage(THREE.DynamicDrawUsage);
    P0=pa.array.slice(); N0=g.attributes.normal.array.slice();
    items=BOD.goods.map((G,i)=>{ let a=[1e9,1e9,1e9], b=[-1e9,-1e9,-1e9]; for(let v=G.v0;v<G.v1;v++)for(let k=0;k<3;k++){ const q=P0[v*3+k]; if(q<a[k])a[k]=q; if(q>b[k])b[k]=q; }
      return {i,k:G.k,m:G.m,v0:G.v0,v1:G.v1,c:[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],h:[(b[0]-a[0])/2,(b[1]-a[1])/2,(b[2]-a[2])/2],rb:null,moved:false}; });
    g._bvhDyn=true; g.computeBoundingSphere(); g.boundingSphere.radius+=30*T; g.boundingBox=null;   // (it changes as goods move: three's own rays, and bounds big enough for a good thrown out of the door)
    me.frustumCulled=false; return true; };
  const inside=(b,it)=>{ const c=it.c,h=it.h, e=.004; return b[0]<c[0]+h[0]-e&&b[3]>c[0]-h[0]+e&&b[1]<c[1]+h[1]-e&&b[4]>c[1]-h[1]+e&&b[2]<c[2]+h[2]-e&&b[5]>c[2]-h[2]+e; };
  function build(){ if(!prep()){ loading=false; return; } world=new R.World({x:0,y:-11.5,z:0}); world.timestep=1/120;
    const fix=world.createRigidBody(R.RigidBodyDesc.fixed()), X=BOD.X, Y=BOD.Y, Z=BOD.Z, B=BOD.B0;
    const solid=(x0,y0,z0,x1,y1,z1)=>{ const bx=[Math.min(x0,x1),Math.min(y0,y1),Math.min(z0,z1),Math.max(x0,x1),Math.max(y0,y1),Math.max(z0,z1)];
      if(bx[3]-bx[0]<1e-3||bx[4]-bx[1]<1e-3||bx[5]-bx[2]<1e-3)return; if(items.some(it=>inside(bx,it)))return;   // (never a box a good stands in: it would be shot out of it)
      world.createCollider(R.ColliderDesc.cuboid((bx[3]-bx[0])/2,(bx[4]-bx[1])/2,(bx[5]-bx[2])/2).setTranslation((bx[0]+bx[3])/2,(bx[1]+bx[4])/2,(bx[2]+bx[5])/2).setFriction(.7),fix); };
    const fy=Y(0); world.createCollider(R.ColliderDesc.cuboid(80*T,.5,80*T).setTranslation(X((B.x0+B.x1)/2),fy-.5,Z((B.y0+B.y1)/2)).setFriction(.8),fix);   // (the floor, and the sidewalk out of the door)
    for(const p of Object.values(BOD.O||{}))for(const b of p.boxes||[]){ if(b.nb||!(b.z1>b.z0))continue; solid(X(b.x0),Y(b.z0),Z(b.y0),X(b.x1),Y(b.z1),Z(b.y1)); }
    for(const w of BOD.WALLS||[]){ let a=w.a0; const ds=w.holes.filter(h=>h.door).sort((p,q)=>p.a0-q.a0);
      const seg=(a0,a1)=>{ if(a1-a0<.01)return; if(w.ax==='x')solid(X(a0),Y(0),Z(w.at-.1),X(a1),Y(w.H),Z(w.at+.1)); else solid(X(w.at-.1),Y(0),Z(a0),X(w.at+.1),Y(w.H),Z(a1)); };
      for(const d of ds){ seg(a,d.a0); a=d.a1; } seg(a,w.a1); }
    for(const it of items){ const rb=world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(...it.c).setCanSleep(true).setSleeping(true).setLinearDamping(.15).setAngularDamping(.3).setCcdEnabled(true));
      const vol=8*it.h[0]*it.h[1]*it.h[2]; world.createCollider(R.ColliderDesc.cuboid(it.h[0]*.97,it.h[1]*.97,it.h[2]*.97).setDensity(Math.max(.05,it.m/Math.max(vol,1e-4))).setFriction(.6).setRestitution(.15),rb); it.rb=rb; }
    you=world.createRigidBody(R.RigidBodyDesc.kinematicPositionBased().setTranslation(pos.x,py+.8,pos.z));
    world.createCollider(R.ColliderDesc.capsule(.45,.3*T),you); built=true; GPH.ready=true; }
  // a good's corners from where its body is now
  const Q=new THREE.Quaternion(), V=new THREE.Vector3();
  const draw=it=>{ const t=it.rb.translation(), r=it.rb.rotation(); Q.set(r.x,r.y,r.z,r.w); const pa=me.geometry.attributes.position, na=me.geometry.attributes.normal, A=pa.array, NA=na.array;
    for(let v=it.v0;v<it.v1;v++){ const o=v*3; V.set(P0[o]-it.c[0],P0[o+1]-it.c[1],P0[o+2]-it.c[2]).applyQuaternion(Q); A[o]=V.x+t.x; A[o+1]=V.y+t.y; A[o+2]=V.z+t.z; V.set(N0[o],N0[o+1],N0[o+2]).applyQuaternion(Q); NA[o]=V.x; NA[o+1]=V.y; NA[o+2]=V.z; }
    pa.addUpdateRange(it.v0*3,(it.v1-it.v0)*3); na.addUpdateRange(it.v0*3,(it.v1-it.v0)*3); pa.needsUpdate=na.needsUpdate=true; it.moved=true; };
  // where his right hand carries a thing (the rig's carry: the arm out before him at the chest)
  const hand=()=>({x:pos.x+Math.sin(heading)*.42*T+Math.cos(heading)*-.12*T,y:py+1.0*T*(typeof W3!=='undefined'&&W3.SZ?W3.SZ:1),z:pos.z+Math.cos(heading)*.42*T-Math.sin(heading)*-.12*T});
  // a strike's reach: what stands before him at a fist's or a foot's height, pushed away from him
  const STRIKE=/jab|cross|upper|hook|slap|punch|kick|sweep|round/i;   // (the rig's names: jab, cross, upperCut, frontKick, legSweep...)
  const strike=()=>{ const s=(st.up&&STRIKE.test(st.up.name)&&st.up)||(st.move&&STRIKE.test(st.move.name)&&st.move); if(!s||s===lastHit||s.t<.08)return; lastHit=s;
    const kick=/kick|sweep|round/i.test(s.name), inB=(x,z)=>{ const B=BOD.B0; return x>BOD.X(B.x0)&&x<BOD.X(B.x1)&&z>BOD.Z(B.y0)&&z<BOD.Z(B.y1); }, me0=inB(pos.x,pos.z), fx=Math.sin(heading), fz=Math.cos(heading), hy=py+(kick?.45:1.05)*T;
    for(const it of items){ if(it===held)continue; const p=it.rb.translation(), dx=p.x-pos.x, dz=p.z-pos.z, d=Math.hypot(dx,dz), f=(dx*fx+dz*fz)/(d||1);
      if(d<1.1*T&&f>.35&&Math.abs(p.y-hy)<.7*T&&inB(p.x,p.z)===me0){   // (never through the shop's walls)
        const k=(kick?5.5:3.8)*it.rb.mass(); it.rb.wakeUp(); it.rb.applyImpulse({x:fx*k,y:k*.35,z:fz*k},true); it.rb.applyTorqueImpulse({x:(Math.random()-.5)*k*.02,y:(Math.random()-.5)*k*.02,z:(Math.random()-.5)*k*.02},true); } } };
  GPH.tick=dt=>{ if(!near()){ return; } if(!built){ load(); return; }
    you.setNextKinematicTranslation({x:pos.x,y:py+.8,z:pos.z}); strike();
    if(held){ const h=hand(); held.rb.setNextKinematicTranslation(h); held.rb.setNextKinematicRotation({x:0,y:Math.sin(heading/2),z:0,w:Math.cos(heading/2)}); }
    acc=Math.min(acc+dt,1/20); let n=0; while(acc>=1/120&&n<6){ world.step(); acc-=1/120; n++; }
    for(const it of items){ if(it.rb.isSleeping()&&it!==held)continue; draw(it); if(it===held)continue;
      // AT REST, AT REST (the budget's 8th rule): still enough for a third of a second, it sleeps where it lies (no creeping, no jitter in a pile)
      const v=it.rb.linvel(), w=it.rb.angvel(); if(v.x*v.x+v.y*v.y+v.z*v.z<.0225&&w.x*w.x+w.y*w.y+w.z*w.z<.16){ if((it.still=(it.still||0)+dt)>.33){ it.rb.sleep(); it.still=0; } } else it.still=0; } };
  // PICK UP AND THROW: a double click on a good (nearer than any other thing) walks him up to it and takes it in his hand; holding one, a double
  // click anywhere throws it toward that spot (an arc, harder the further)
  GPH.pick=ray=>{ if(!built)return null;
    if(held){ const pl=new THREE.Plane(new THREE.Vector3(0,1,0),-py), g=new THREE.Vector3(); if(!ray.ray.intersectPlane(pl,g))return null; const it=held, o=new THREE.Object3D(); o.position.copy(g);
      return {d:0,th:{name:'THROW',obj:o,reach:1e9,act:()=>{ held=null; RIG.release(st,'carry'); it.rb.setBodyType(R.RigidBodyType.Dynamic,true); const h=hand(), dx=g.x-h.x, dz=g.z-h.z, d=Math.max(.5,Math.hypot(dx,dz)), sp=Math.min(9,3+d*.9);
        it.rb.setLinvel({x:dx/d*sp,y:2.6+d*.25,z:dz/d*sp},true); it.rb.setAngvel({x:(Math.random()-.5)*6,y:(Math.random()-.5)*6,z:(Math.random()-.5)*6},true); }}}; }
    const hits=ray.intersectObject(me,false); if(!hits.length)return null; const v=hits[0].face.a, it=items.find(q=>v>=q.v0&&v<q.v1); if(!it)return null;
    const o=new THREE.Object3D(), p=it.rb.translation(); o.position.set(p.x,p.y,p.z);
    return {d:hits[0].distance,th:{name:it.k.toUpperCase(),obj:o,reach:.85*T,near:1.6*T,tall:.4*T,act:()=>{ if(held)return; held=it; it.rb.setBodyType(R.RigidBodyType.KinematicPositionBased,true); RIG.act(st,'carry'); }}}; };
  GPH.init=()=>{ if(typeof USE==='undefined'){ setTimeout(GPH.init,500); return; } const p0=USE.pick; USE.pick=ray=>{ const a=p0(ray), b=GPH.pick(ray); return b&&(!a||b.d<=a.d)?b:a; };   // (the nearer of a thing of the world's and a good)
    const t0=CLOCK.tick; CLOCK.tick=dt=>{ t0(dt); GPH.tick(dt); }; };
  // (a test's: take the nearest good into his hand; throw it at a spot)
  window.GOODSGRAB=()=>{ let b=null, bd=1e9; for(const it of items){ const p=it.rb.translation(), d=Math.hypot(p.x-pos.x,p.z-pos.z); if(d<bd){ bd=d; b=it; } } if(!b)return null; held=b; b.rb.setBodyType(R.RigidBodyType.KinematicPositionBased,true); RIG.act(st,'carry'); return b.k; };
  window.GOODSTHROW=(dx,dz)=>{ const rc=new THREE.Raycaster(new THREE.Vector3(pos.x+dx,py+5,pos.z+dz),new THREE.Vector3(0,-1,0)); const r=GPH.pick(rc); if(r)r.th.act(); return !!r; };
  window.GOODSAT=i=>{ const p=items[i].rb.translation(); return [p.x,p.y,p.z]; };
  window.GOODSDBG=()=>({built,n:items.length,awake:items.filter(it=>it.rb&&!it.rb.isSleeping()).length,moved:items.filter(it=>it.moved).length,held:held&&held.k});
  window.GOODSHIT=(k=4,r=3)=>{ for(const it of items){ const p=it.rb.translation(); if(Math.hypot(p.x-pos.x,p.z-pos.z)<r*T){ it.rb.wakeUp(); it.rb.applyImpulse({x:(Math.random()-.5)*k*it.rb.mass(),y:k*.5*it.rb.mass(),z:(Math.random()-.5)*k*it.rb.mass()},true); } } };   // (a test's shove)
}
