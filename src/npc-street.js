// ---- THE STREET'S CHARACTERS FROM THE OWNER'S MODELS (owner, 17 Oct 2026: the G folder's .glb files, "importing them into the new game as new
// characters, give him physics, animations for walking, waving, running, jumping, using (grabbing something), idle positions"; "put them all in
// street walking around ... they should wander as their own npcs. they will be part of the market later"): the snow leopard with his long white
// hair, his shorts and his tail; the grumpy cat in his yellow raincoat reading his newspaper; the plastic-bag ghost, hollow, the brown tote
// floating inside him. Each the owner's own model (Meshy AI), remade as one clean skin (its surface sampled into voxels, closed, a smooth
// surface pulled off: tools/skin-bake.py) of some thousands of triangles, coloured face by face from its own texture, no outlines.
// Each has BONES (a tree of segments, every corner weighted to the nearest two with a soft band at the joints: a three.js SkinnedMesh) and
// MOVES on them: idle (breath, a look round, a weight shift, the tail, the hem), walk, run, jump, wave, use (a reach and a grab), made for his
// kind: the leopard on two legs, the cat waddling on his paws in his sitting pose, the ghost gliding. His BODY is a capsule in a physics engine
// (Rapier, the Walker's: a world of the street's ground, its kerbs, its walls and its furniture): gravity, the kerb a step down and a hop up, you
// push him and he pushes you, the three never through each other; a jump is a real push off the ground. Without the engine (not loaded yet,
// or it failed) he walks on the ground as the fish and the bear do.
// The ITEMS from the same folder (the brown tote, the retro cyborg terminal, the pixel pantry power-up, and the cat's ink bottle cut out of his
// model) stand on the sidewalk as things (a double click walks up and names them); the tote floats inside the ghost. Shaded as the fish and
// the bear (npc-map): the Walker's light, close tones, SELF when the menu says. They wander the street (the sidewalk mostly, over the road
// now and then), stop, look at you when you come near, wave back when you wave, hop the kerb, and use the things they come to. ----
const STREET={npcs:[],items:[],ready:false}; window.STREET=STREET;   // (a test's look)
{ const b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), fl=s=>new Float32Array(b(s).buffer), YS=ZU*24/TILE, D2R=Math.PI/180;
  // ---- the skin as makeNPC (npc-map) takes it: positions, colours, each corner's part (his main bone), the bones' indices and weights
  function skinGeo(D){ const geo=new THREE.BufferGeometry(), P=fl(D.p), n=P.length/3; geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setAttribute('color',new THREE.BufferAttribute(b(D.c),3,true));
    geo.setAttribute('reg',new THREE.BufferAttribute(D.r?Float32Array.from(b(D.r)):new Float32Array(n),1)); geo.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(n),1));
    if(D.w){ const W=b(D.w), WT=fl(D.wt), si=new Float32Array(n*4), sw=new Float32Array(n*4); for(let i=0;i<n;i++){ si[i*4]=W[i*2]; si[i*4+1]=W[i*2+1]; sw[i*4]=WT[i*2]; sw[i*4+1]=WT[i*2+1]; }
      geo.setAttribute('skinIndex',new THREE.BufferAttribute(si,4)); geo.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4)); }
    return geo; }
  // see-through (the ghost, a plastic bag): his front skin alone, drawn after what's inside him, in both his materials (flat and lamp-lit)
  function glass(N,a){ for(const m of [N.flat,N.toon]){ m.transparent=true; m.depthWrite=false; m.side=THREE.FrontSide; m.needsUpdate=true; } N.toon.opacity=a; N.flat.uniforms.uA={value:a};
    N.flat.fragmentShader=N.flat.fragmentShader.replace('uniform vec3 uL,uTint;','uniform vec3 uL,uTint; uniform float uA;').replace('gl_FragColor=vec4(c*uTint,1.);','gl_FragColor=vec4(c*uTint,uA);'); N.me.castShadow=false; N.me.renderOrder=2; }
  // ---- THE BODY IN THE ENGINE: one world for the street (scene units; its verticals as drawn): the ground in bands (the sidewalks, the road a kerb
  // down), the walls and the furniture (the map's fixed boxes), the street's edges, the stairs' opening stopped (they're not going down there), you
  // as a capsule that moves as you do; each character a capsule that can't tip over, driven by where he wants to go, gravity on him
  const SP={world:null,R:null,acc:0,you:null,bodies:[]};
  SP.build=()=>{ const R=SP.R; if(!R||SP.world)return; const w=SP.world=new R.World({x:0,y:-12,z:0}); w.timestep=1/90;
    const fixedBody=w.createRigidBody(R.RigidBodyDesc.fixed()), box=(x0,y0,z0,x1,y1,z1)=>w.createCollider(R.ColliderDesc.cuboid((x1-x0)/2,(y1-y0)/2,(z1-z0)/2).setTranslation((x0+x1)/2,(y0+y1)/2,(z0+z1)/2).setFriction(0.6),fixedBody);
    // the ground in bands along z (its height changes only across the street)
    const G=MODS.bodega.ground, xm=(BOUND.x0+BOUND.x1)/2; let z0=BOUND.z0-2, g0=G(xm,BOUND.z0); for(let z=BOUND.z0;z<=BOUND.z1+2.001;z+=0.02){ const g=z>BOUND.z1+2?NaN:G(xm,z); if(g!==g0||isNaN(g)){ box(BOUND.x0-4,g0-1,z0,BOUND.x1+4,g0,z); z0=z; g0=g; } }
    for(const [x0,z0,y0,x1,z1,y1] of FIX.up)box(x0,y0,z0,x1,Math.max(y0+.05,y1),z1);
    box(BOUND.x0-1,-2,BOUND.z0-4,BOUND.x0,4,BOUND.z1+4); box(BOUND.x1,-2,BOUND.z0-4,BOUND.x1+1,4,BOUND.z1+4); box(BOUND.x0-4,-2,BOUND.z0-1,BOUND.x1+4,4,BOUND.z0); box(BOUND.x0-4,-2,BOUND.z1,BOUND.x1+4,4,BOUND.z1+1);
    const S=MAPSTAIR, sx=(S.x0-72)*TILE, sx1=(S.x1-72)*TILE, sz=(S.y0+77)*TILE, sz1=(S.y1+77)*TILE; box(sx-.3,-2,sz-.3,sx1+.3,0.02,sz1+.3);   // (the stairs' opening, stopped)
    SP.you=w.createRigidBody(R.RigidBodyDesc.kinematicPositionBased().setTranslation(pos.x,py+1.1,pos.z)); w.createCollider(R.ColliderDesc.capsule(0.75,0.32),SP.you);
    for(const N of STREET.npcs)N.embody(); STREET.ready=true; };
  SP.step=(dt,you,yy)=>{ const w=SP.world; if(!w)return; SP.you.setNextKinematicTranslation({x:you.x,y:yy+1.1,z:you.z}); SP.acc=Math.min(SP.acc+dt,4/90);
    while(SP.acc>=1/90){ SP.acc-=1/90; for(const N of STREET.npcs)N.drive(1/90); w.step(); } };
  // ---- A CHARACTER: his skin on his bones, his kind's moves, his body, his mind
  function makeChar(D,o){ const geo=skinGeo(D);
    // his bones: each at its head, hanging from its parent's; the skin bound to them at rest (makeNPC binds)
    const bones=D.bones.map(()=>new THREE.Bone()), BN={}; D.bones.forEach(([nm,p,h],i)=>{ BN[nm]=bones[i]; const ph=p>=0?D.bones[p][2]:[0,0,0]; bones[i].position.set(h[0]-ph[0],h[1]-ph[1],h[2]-ph[2]); bones[i].name=nm; if(p>=0)bones[p].add(bones[i]); });
    const N=makeNPC(null,{key:o.key,name:o.name,names:D.bones.map(bn=>bn[0]),lv:'up',group:'bodega',geo,skin:{bones,skeleton:new THREE.Skeleton(bones)},tall:1,rank:D.bones.map(()=>0),metres:o.metres,x:o.at[0],z:o.at[1],
      lane:{x0:o.at[0],x1:o.at[0],z0:o.at[1],z1:o.at[1]},ground:(x,z)=>MODS.bodega.ground(x,z),radius:o.radius,speed:o.speed,stride:0,rock:0,bob:0});
    if(o.glass)glass(N,o.glass); N.kind=o.kind; const g=N.g, body=N.body, H=N.H, s=body.scale.x, me=N.me; N.H=H*YS; N.BN=BN; N.inner=new THREE.Group(); body.add(N.inner);   // (inner: what he carries inside, the ghost's tote)
    // ---- his mind's state: where he is (his feet), his heading, what he's doing
    const YOU=st, ns=Object.assign(N.st,{y:0,h:0,to:null,wait:2+Math.random()*3,t:Math.random()*10,run:0,moving:false,move:null,look:0,lookTo:0,vy:0,ground:true,held:0,waved:0,item:null});   // (N.st: makeNPC's x, z, h, ph, R, v; the rest his mind's)
    // ---- his body in the engine: a capsule that can't tip, his feet its bottom
    let rb=null; const half=Math.max(.05,N.H/2-ns.R);
    N.embody=()=>{ const R=SP.R, w=SP.world; if(!w||rb)return; rb=w.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(ns.x,ns.y+half+ns.R+.05,ns.z).lockRotations().setLinearDamping(0.2).setCcdEnabled(true).setGravityScale(o.kind==='sheet'?0.15:1));
      w.createCollider(R.ColliderDesc.capsule(half,ns.R).setFriction(0.4).setDensity(o.kind==='sheet'?0.3:1),rb); SP.bodies.push(rb); };
    const want={x:0,z:0}; let jumpV=0;
    N.drive=h=>{ if(!rb)return; const v=rb.linvel(), p=rb.translation(), hit=SP.world.castRay(new SP.R.Ray({x:p.x,y:p.y,z:p.z},{x:0,y:-1,z:0}),half+ns.R+.08,true,undefined,undefined,undefined,rb);
      ns.ground=!!hit; const k=ns.ground?Math.min(1,h*18):Math.min(1,h*3), vy=jumpV?jumpV:v.y; rb.setLinvel({x:v.x+(want.x-v.x)*k,y:vy,z:v.z+(want.z-v.z)*k},true); jumpV=0;
      if(o.kind==='sheet'&&!jumpV){ const fl=ns.y-MODS.bodega.ground(ns.x,ns.z); if(fl<o.hover+.04)rb.setLinvel({x:v.x+(want.x-v.x)*k,y:(o.hover-fl)*5,z:v.z+(want.z-v.z)*k},true); } };   // (the ghost held a little off the ground)
    // ---- his moves: the kind's poses, a move laid over the walk for its while
    const POSE={}, MOVES=KINDS[o.kind];
    const setPose=(P,ry)=>{ for(const k in BN){ const r=P[k]; BN[k].rotation.set(r?r[0]*D2R:0,(r?r[1]:0)*D2R+(k==='head'?ry:0),r?r[2]*D2R:0); } body.position.y=(P.root||0)*s*YS; };
    N.act=name=>{ if(ns.move&&ns.move.name!=='idle')return false; const M=MOVES[name]; if(!M)return false; ns.move={name,t:0,T:M.T,pose:M.pose,done:false}; return true; };
    const mix=(A,B,w)=>{ const O={}; for(const k in A)O[k]=A[k]; for(const k in B){ const a=A[k], b=B[k]; O[k]=k==='root'?(a||0)*(1-w)+b*w:a?[a[0]+(b[0]-a[0])*w,a[1]+(b[1]-a[1])*w,a[2]+(b[2]-a[2])*w]:[b[0]*w,b[1]*w,b[2]*w]; } return O; };
    // ---- each frame: his mind, then his body (the engine's or the ground's), then his pose
    const WALK={sidewalk:null}; const lane=()=>{ if(WALK.sidewalk)return WALK.sidewalk; const G=MODS.bodega.ground, xm=(BOUND.x0+BOUND.x1)/2; let zc=null, zf=null; for(let z=BOUND.z0;z<BOUND.z1;z+=0.02){ const g=G(xm,z); if(zc==null&&g<-.01)zc=z; if(zc!=null&&zf==null&&g>-.01&&z>zc)zf=z; }
      return WALK.sidewalk={zc,zf,z0:zc-3.6*TILE}; };
    const S=MAPSTAIR, inStairs=(x,z)=>x>(S.x0-72)*TILE-.6&&x<(S.x1-72)*TILE+.6&&z>(S.y0+77)*TILE-.6&&z<(S.y1+77)*TILE+.6;
    const free=(x,z)=>{ if(x<BOUND.x0+.8||x>BOUND.x1-.8||z<BOUND.z0+.8||z>BOUND.z1-.8||inStairs(x,z)||BOD.inside(x,z)||MODS.pool.inside(x,z))return false; const r=ns.R+.25;
      for(const [x0,z0,x1,z1] of SOL.up){ if(x>x0-r&&x<x1+r&&z>z0-r&&z<z1+r)return false; } return true; };
    const pick=()=>{ const L=lane(); for(let i=0;i<30;i++){ const u=Math.random(), far=L.zf!=null&&u<.2, road=L.zf!=null&&!far&&u<.3, x=BOUND.x0+1+Math.random()*(BOUND.x1-BOUND.x0-2), z=far?L.zf+.5+Math.random()*(BOUND.z1-L.zf-1.3):road?L.zc+.4+Math.random()*(L.zf-L.zc-.8):L.z0+Math.random()*(L.zc-.4-L.z0);
        if(free(x,z)&&Math.hypot(x-ns.x,z-ns.z)>2*TILE&&!STREET.npcs.some(q=>q!==N&&Math.hypot(x-q.st.x,z-q.st.z)<2)){ ns.to={x,z}; ns.run=Math.hypot(x-ns.x,z-ns.z)>9*TILE&&Math.random()<.6?1:0; return; } } ns.wait=2; };
    N.tick=(dt,you)=>{ ns.t+=dt; const dx=you.x-ns.x, dz=you.z-ns.z, dy=Math.hypot(dx,dz), near=dy<3.5*TILE; let want_h=ns.h; ns.moving=false;
      const mv=ns.move; if(mv){ mv.t+=dt; if(mv.t>=mv.T)ns.move=null; }
      if(!ns.move){ if(ns.to){ const ex=ns.to.x-ns.x, ez=ns.to.z-ns.z, d=Math.hypot(ex,ez); if(d<.12){ ns.to=null; ns.wait=1.5+Math.random()*4; if(ns.item){ ns.h=Math.atan2(ns.item.x-ns.x,ns.item.z-ns.z); N.act('use'); ns.item=null; } }
          else{ want_h=Math.atan2(ex,ez); const turn=Math.abs(((want_h-ns.h+Math.PI*3)%(Math.PI*2))-Math.PI); if(turn<.6){ ns.moving=true; const sp=ns.v*(ns.run?1.9:1); want.x=ex/d*sp; want.z=ez/d*sp;
              // held up (you, the others, a wall he can't get round): after a while, somewhere else; a kerb in his way: a hop
              if(ns.held>1.6){ ns.to=null; ns.held=0; ns.wait=1; } } else { want.x=want.z=0; } } }
        else{ want.x=want.z=0; if(near){ want_h=Math.atan2(dx,dz); if(YOU.move&&YOU.move.name==='wave'&&ns.t-ns.waved>4){ ns.waved=ns.t; N.act('wave'); } }
          if((ns.wait-=dt)<=0){ const u=Math.random(); if(near&&u<.25)N.act('wave'); else if(u<.4)N.act('jump'); else if(u<.55&&o.uses){ const it=STREET.items.filter(I=>o.uses.includes(I.key)); const I=it[Math.floor(Math.random()*it.length)]; if(I){ const a=Math.atan2(I.x-ns.x,I.z-ns.z); ns.to={x:I.x-Math.sin(a)*(ns.R+I.R+.2),z:I.z-Math.cos(a)*(ns.R+I.R+.2)}; ns.item=I; ns.run=0; } }
            else if(u<.65)N.act('use'); else pick(); if(!ns.to)ns.wait=1.5+Math.random()*3; } } }
      else{ want.x=want.z=0; if(ns.move.name==='jump'&&!ns.move.done&&ns.move.t>ns.move.T*0.28){ ns.move.done=true; if(rb&&ns.ground)jumpV=o.jump; else if(!rb)ns.vy=o.jump; } }
      if(rb){ const p=rb.translation(); const mx=p.x-ns.x, mz=p.z-ns.z; ns.x=p.x; ns.z=p.z; ns.y=p.y-half-ns.R; if(ns.moving){ const went=Math.hypot(mx,mz), exp=Math.hypot(want.x,want.z)*dt; ns.held=went<exp*.3?ns.held+dt:0; } }
      else{ const g=MODS.bodega.ground(ns.x,ns.z); if(ns.moving){ const nx=ns.x+want.x*dt, nz=ns.z+want.z*dt; if(Math.hypot(you.x-nx,you.z-nz)<ns.R+.35||NPCS.some(q=>q!==N&&q.blocks(nx,nz,ns.R))||!free(nx,nz))ns.held+=dt; else{ ns.x=nx; ns.z=nz; ns.held=0; } }
        if(ns.vy||ns.y>g+1e-3){ ns.vy-=12*dt; ns.y=Math.max(g,ns.y+ns.vy*dt); if(ns.y<=g){ ns.y=g; ns.vy=0; } } else ns.y=g; }
      let dh=((want_h-ns.h+Math.PI*3)%(Math.PI*2))-Math.PI; ns.h+=dh*Math.min(1,dt*4);
      ns.ph+=dt*(ns.moving?o.stride*(ns.run?1.5:1):0);
      ns.lookTo=near&&!ns.moving?Math.max(-.7,Math.min(.7,((Math.atan2(dx,dz)-ns.h+Math.PI*3)%(Math.PI*2))-Math.PI)):0; ns.look+=(ns.lookTo-ns.look)*Math.min(1,dt*3);
      // the pose: the kind's walk or stand, his move laid over it as it rises and falls
      let P=ns.moving?MOVES.walk(ns.ph,ns.run,ns.t):MOVES.idle(ns.t); if(ns.move){ const u=ns.move.t/ns.move.T, w=Math.min(1,u/.15,(1-u)/.15)*1; P=mix(P,ns.move.pose(u,ns.t),Math.max(0,w)); }
      setPose(P,ns.look); g.position.set(ns.x,ns.y,ns.z); g.rotation.set(0,ns.h,0); if(N.carry)N.carry(ns); };
    STREET.npcs.push(N); return N; }
  // ---- AN ITEM: a thing standing on the sidewalk (or carried): its skin, shaded the same, named for a double click
  function makeItem(D,o){ const N=makeNPC(null,{key:o.key,name:o.name,names:['all'],lv:'up',group:'bodega',geo:skinGeo(D),tall:1,rank:[0],metres:o.metres,x:o.at?o.at[0]:0,z:o.at?o.at[1]:0,lane:{x0:0,x1:0,z0:0,z1:0},ground:(x,z)=>MODS.bodega.ground(x,z),radius:.1,speed:0,stride:0,rock:0,bob:0});
    const g=N.g, s=N.body.scale.x; N.x=N.st.x; N.z=N.st.z; N.R=Math.max(D.wide,D.deep)*s/2; N.st.R=N.R; N.H=N.H*YS; N.tick=()=>{}; N.blocks=()=>false;
    if(o.at){ g.position.set(N.x,MODS.bodega.ground(N.x,N.z),N.z); g.rotation.y=o.turn||0; SOL.up.push([N.x-N.R*.8,N.z-N.R*.8,N.x+N.R*.8,N.z+N.R*.8]); FIX.up.push([N.x-N.R*.8,N.z-N.R*.8,0,N.x+N.R*.8,N.z+N.R*.8,N.H]); }
    else { N.push=()=>{}; N.shadowPass=()=>{}; }   // (carried: inside whoever carries it, in his shadow pass)
    STREET.items.push(N); return N; }
  // ---- THE KINDS AND THEIR MOVES: a pose is each bone's turn (degrees about x, y, z, in his own frame: x his right, y up, z his front) and root,
  // his whole body's lift (his units). idle(t) and walk(phase, running, t) are his stance and his gait; the others are moves of T seconds, pose(u)
  const sn=(a,p=0)=>Math.sin(a+p), cs=(a,p=0)=>Math.cos(a+p), up=x=>Math.max(0,x), bell=(u,a,b)=>u<a?u/a:u>b?(1-u)/(1-b):1;
  const KINDS={
    // ON TWO LEGS (the snow leopard): his legs swing from the hips, the knee bends on the swing, the arms counter the legs (the hanging one more:
    // the other is held out before him), his tail sways and bounces; standing he breathes, shifts his weight, looks about, his tail curls
    biped:{
      idle:t=>({chest:[2*sn(t*1.5),0,0],head:[2*sn(t*1.5,1),8*sn(t*.37),0],hips:[0,0,2.5*sn(t*.41)],tail1:[0,14*sn(t*.9),4*sn(t*.5)],tail2:[0,18*sn(t*.9,-.7),0],tail3:[0,22*sn(t*.9,-1.4),0],armL:[0,0,3*sn(t*.8)],root:0}),
      walk:(ph,run,t)=>{ const a=run?1.6:1, k=run?12:0; return {hips:[k,0,3*sn(ph)*a],chest:[k*.4,4*sn(ph)*a,0],head:[-k*.5,0,0],thighL:[32*sn(ph)*a,0,0],thighR:[-32*sn(ph)*a,0,0],shinL:[50*up(-sn(ph,-.5))*a,0,0],shinR:[50*up(sn(ph,-.5))*a,0,0],
        footL:[-8*sn(ph,.4),0,0],footR:[8*sn(ph,.4),0,0],armL:[-22*sn(ph)*a,0,4],foreL:[-14*up(-sn(ph))*a,0,0],armR:[10*sn(ph)*a,0,0],tail1:[6*up(cs(ph*2))*a,12*sn(ph),0],tail2:[8*up(cs(ph*2))*a,16*sn(ph,-.6),0],tail3:[0,20*sn(ph,-1.2),0],root:.012*Math.abs(sn(ph))*a}; },
      wave:{T:1.8,pose:(u,t)=>({armL:[0,0,-150],foreL:[0,0,-30+28*sn(u*22)],head:[0,-20,0]})},
      jump:{T:1.1,pose:u=>{ const c=u<.28?u/.28:u>.78?(1-u)/.22:0, air=u>.28&&u<.78?1:0; return {hips:[14*c,0,0],thighL:[-40*c-30*air,0,0],thighR:[-40*c-30*air,0,0],shinL:[70*c+50*air,0,0],shinR:[70*c+50*air,0,0],armL:[-30*air,0,10*c+30*air],armR:[-40*air,0,0],tail1:[20*air,0,0],tail2:[20*air,0,0],root:-.1*c}; }},
      use:{T:1.5,pose:u=>{ const r=bell(u,.3,.65); return {hips:[14*r,0,0],chest:[8*r,0,0],head:[12*r,0,0],armR:[22*r,0,0],foreR:[10*r-20*(u>.45&&u<.7?1:0),0,0],armL:[-10*r,0,0]}; }}},
    // SITTING (the grumpy cat): no legs to speak of under the coat, he waddles on his paws, rocking, his ears up; sitting he breathes, nods over his
    // paper, his ears twitch; he reads (use), waves with his free paw, hops with his ears flapping
    sitter:{
      idle:t=>({chest:[2*sn(t*1.3),0,0],head:[8+3*sn(t*1.3,1),6*sn(t*.3),0],earL:[0,0,sn(t*2.1)>.95?-20:0],earR:[0,0,sn(t*1.7,2)>.95?20:0],paper:[3*sn(t*.9),0,0],root:0}),
      walk:(ph,run,t)=>{ const a=run?1.5:1, k=run?12:0; return {hips:[k,0,8*sn(ph)*a],chest:[k*.3,0,-3*sn(ph)*a],head:[-k*.4,0,-4*sn(ph)*a],footL:[-28*up(sn(ph))*a,0,0],footR:[-28*up(-sn(ph))*a,0,0],earL:[0,0,-6*up(sn(ph*2))],earR:[0,0,6*up(sn(ph*2))],armL:[6*sn(ph),0,0],root:.02*Math.abs(sn(ph))*a}; },
      wave:{T:1.8,pose:(u,t)=>({armL:[-30,0,-120],handL:[0,0,-20+25*sn(u*22)],head:[-5,15,0]})},
      jump:{T:1.1,pose:u=>{ const c=u<.28?u/.28:u>.78?(1-u)/.22:0, air=u>.28&&u<.78?1:0; return {hips:[6*c,0,0],head:[-10*air,0,0],earL:[0,0,-45*air+10*c],earR:[0,0,45*air-10*c],footL:[-40*air,0,0],footR:[-40*air,0,0],armL:[-20*air,0,-20*air],root:-.06*c}; }},
      use:{T:2.2,pose:u=>{ const r=bell(u,.25,.7); return {armL:[-28*r,0,0],armR:[-28*r,0,0],handL:[-10*r,0,0],handR:[-10*r,0,0],paper:[-20*r,0,0],head:[18*r+2*sn(u*20)*r,-6*r,0]}; }}},
    // A SHEET (the plastic-bag ghost): he hovers and glides, leaning into the way he goes, his hem trailing and fluttering; his arm stumps wave
    // and reach; a jump is a rise; using is lifting the tote inside him
    sheet:{
      idle:t=>({hips:[0,0,3*sn(t*1.3)],chest:[2*sn(t*.9),4*sn(t*.5),0],head:[2*sn(t*.9,.5),6*sn(t*.33),0],hem:[4*sn(t*3),0,4*cs(t*2.3)],armL:[0,0,-6*sn(t*1.1)],armR:[0,0,6*sn(t*1.1,1)],root:.03*sn(t*2)}),
      walk:(ph,run,t)=>{ const a=run?2.2:1; return {hips:[8*a,0,2*sn(ph)],chest:[2*a,0,0],hem:[-10*a+3*sn(ph*2),0,3*cs(ph*2)],armL:[0,8*a,-6*sn(ph)],armR:[0,-8*a,6*sn(ph)],root:.03*sn(ph)+.02}; },
      wave:{T:1.8,pose:(u,t)=>({armR:[0,-10,65+14*sn(u*22)],head:[0,10,0]})},
      jump:{T:1.4,pose:u=>{ const r=bell(u,.3,.6); return {armL:[0,0,-45*r],armR:[0,0,45*r],hem:[10*r,0,0],head:[-6*r,0,0],root:0}; }},
      use:{T:2,pose:u=>{ const r=bell(u,.3,.7); return {armL:[0,55*r,-10*r],armR:[0,-55*r,10*r],head:[14*r,0,0]}; }}}};
  // ---- THE OWNER'S CHARACTERS AND THINGS, on the street: the ghost by the pool room's door; the power-up on the sidewalk by the shop fronts
  // (the snow leopard, the grumpy cat with his ink bottle and the retro cyborg terminal: deleted, owner 17 Oct 2026, "delete the phone head
  // character, the cheetah and the catnewspaper characters from game completely")
  STREET.start=()=>{ const L=(()=>{ const G=MODS.bodega.ground, xm=(BOUND.x0+BOUND.x1)/2; let zc=null; for(let z=BOUND.z0;z<BOUND.z1;z+=0.02)if(G(xm,z)<-.01){ zc=z; break; } return zc; })(), sw=L-1.6*TILE;
    const gho=makeChar(GHOSTD,{key:'ghost',name:'PLASTIC BAG GHOST',kind:'sheet',metres:1.7,at:[14*TILE,sw],radius:.45,speed:.6,stride:6,jump:4.8,glass:.74,hover:.12});
    // the tote inside the ghost, floating, rising when he lifts it
    const tote=makeItem(TOTE,{key:'tote',name:'BROWN TOTE',metres:.55}); gho.inner.add(tote.g); tote.g.scale.setScalar(1/gho.body.scale.x); tote.g.scale.y=1/gho.body.scale.y; tote.g.position.set(0,.22,0); tote.me.renderOrder=1;
    gho.carry=ns=>{ const lift=ns.move&&ns.move.name==='use'?bell(ns.move.t/ns.move.T,.3,.7):0; tote.g.position.set(0,.22+.03*Math.sin(ns.t*1.7)+.3*lift,.02*Math.cos(ns.t*1.1)); tote.g.rotation.y=.2*Math.sin(ns.t*.6); };
    makeItem(POWERUP,{key:'powerup',name:'PIXEL PANTRY POWER-UP',metres:.9,at:[9.5*TILE,sw-1.3*TILE],turn:-Math.PI*.15});
    // the engine, when it's here (the Walker's loader; without it they walk on the ground)
    STREET.PB=PB; PB.load(); const go=()=>{ if(PB.R&&!SP.world){ SP.R=PB.R; try{ SP.build(); }catch(e){ console.warn('street physics',e); SP.world=null; } } }; go(); if(!SP.world)(PB.onReady=PB.onReady||[]).push(go); };
  STREET.tick=(dt,you,yy)=>{ if(SP.world)SP.step(dt,you,yy); };
}
