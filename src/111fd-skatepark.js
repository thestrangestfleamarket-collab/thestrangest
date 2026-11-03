// THE SKATE PARK: the Polyfork skatepark kit at full size, a place off the map you go into by its gateway in Central Park (parkPlaces.skatepark in data/world.json): the kit's own park (data/skatepark.json, tools/skatepark-bake.py) under its own sky, its lamps lit after dark, one of each of its skaters on your rig (data/skaters.json); its decks, ramps and ledges are ground to walk and ride.
import {SHARED, THREE} from './003-shx.js';
import {CLIP, CLOCK, PARK, ROOMS} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLDK, LEVEL, MAPG, MODS, OFFDX, SOL, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
const SKATE={}; window.SKATE=SKATE;
{ const DATA=__LAZY__("data/skatepark.json"), BODS=__LAZY__("data/skaters.json"), GATE=__LAZY__("data/skategate.json");
  const MH=TILE/.84, MV=ZU*24/.84, I16=s=>{ const b=atob(s), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i); return u.buffer; };
  const NAMES={'skate-filmer':'THE FILMER','street-skater':'A STREET SKATER','veteran-pool-skater':'THE POOL VETERAN','vert-skater':'A VERT SKATER','roller-skater':'THE ROLLER SKATER','skate-coach':'THE COACH',
    'beginner-kid-skater':'A KID ON A BOARD','scooter-kid':'A KID ON A SCOOTER','bmx-rider':'A BMX RIDER','graffiti-artist':'THE GRAFFITI ARTIST','longboarder':'A LONGBOARDER','skate-shop-owner':'THE SKATE SHOP OWNER'};
  // a packed mesh (lo, sc, int16 corners, uint8 colours, uint32 triangles) placed by f(x,y,z) -> world
  const geo=(M,f,col='c')=>{ const Q=new Int16Array(I16(M.p)), C=new Uint8Array(I16(M[col])), P=new Float32Array(Q.length), v=[0,0,0];
    for(let i=0;i<Q.length;i+=3){ for(let k=0;k<3;k++)v[k]=(Q[i+k]+32500)*M.sc+M.lo[k]; const w=f(v[0],v[1],v[2]); P[i]=w[0]; P[i+1]=w[1]; P[i+2]=w[2]; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3,true)); g.setIndex(new THREE.BufferAttribute(new Uint32Array(I16(M.i)),1)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
  const MAT=()=>new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});

  // the park, off the map west of the sections; you come in just inside its gateway
  const WX=SHARED.BOD.X(1700+OFFDX/BLDK), WZ=SHARED.BOD.Z(-45), B={x0:WX-27*MH,x1:WX+27*MH,z0:WZ-37*MH,z1:WZ+37*MH}, GX=0, GZ=32.5;   // its footprint and its gateway, in the park's metres (tools/skatepark-bake.py)
  let D=null, G=null, SK=null, LIT=null, SOLS=[], GR=null, tick=null, Y0=0;
  const wx_=x=>WX+x*MH, wz_=z=>WZ+z*MH, wy_=y=>(y-Y0)*MV;
  SKATE.ground=(x,z)=>{ const g=D&&D.ground; if(!g)return 0; const i=Math.floor(((x-WX)/MH-g.x0)/g.cs), j=Math.floor(((z-WZ)/MH-g.z0)/g.cs); if(i<0||j<0||i>=g.nx||j>=g.nz)return 0; return wy_(g.y0+g.H[j*g.nx+i]*g.dy); };
  const need=()=>Promise.all([LOAD('skatepark'),DATA().then(d=>{ D=d; if(!D.ground.H)D.ground.H=new Uint16Array(I16(D.ground.h)); Y0=D.gate.y; })]);
  const build=()=>{ '@skatepark';
    G=new THREE.Group(); G.name='skatepark'; scene.add(G); const f=(x,y,z)=>[wx_(x),wy_(y),wz_(z)];
    for(const M of D.mesh){ const m=new THREE.Mesh(geo(M,f),MAT()); m.castShadow=m.receiveShadow=true; G.add(m); }
    { const day=geo(D.glow,f), night=day.clone(); night.setAttribute('color',new THREE.BufferAttribute(new Uint8Array(I16(D.glow.night)),3,true));
      const m=new THREE.Mesh(day,MAT()), nm=new THREE.MeshBasicMaterial({vertexColors:true}); m.receiveShadow=true; G.add(m); LIT={m,day,night,dm:m.material,nm,on:null}; }
    // the sky over it and the green past its edge (kept by the room's dark: anyRoom)
    const sky=new THREE.Mesh(new THREE.SphereGeometry(260*MH,24,12,0,Math.PI*2,0,Math.PI/2),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{n:{value:0}},
      vertexShader:'varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader:'uniform float n; varying vec3 vP; void main(){ float y=max(0.0,vP.y); vec3 d=mix(vec3(.78,.86,.9),vec3(.36,.6,.86),smoothstep(0.0,.6,y)), k=mix(vec3(.1,.12,.2),vec3(.02,.03,.07),smoothstep(0.0,.6,y)); gl_FragColor=vec4(mix(d,k,n),1.0); }'}));
    sky.position.set(WX,wy_(-8),WZ); sky.userData.anyRoom=1; G.add(sky);
    const fs=new THREE.Shape([[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>new THREE.Vector2(x*250*MH,y*250*MH))); fs.holes.push(new THREE.Path([[-24,34],[24,34],[24,-34],[-24,-34]].map(([x,y])=>new THREE.Vector2(x*MH,y*MH))));   // the green round the park, its footprint cut out (the bowl sits below it)
    const far=new THREE.Mesh(new THREE.ShapeGeometry(fs),new THREE.MeshLambertMaterial({color:0x5f7a3a})); far.rotation.x=-Math.PI/2; far.position.set(WX,wy_(-.02),WZ); far.userData.anyRoom=1; far.receiveShadow=true; G.add(far);
    // walls: the cells a body can't pass, as solids while you are in
    { const g=D.ground, S=new Uint16Array(I16(D.solid)); SOLS=[]; for(let k=0;k<S.length;k+=4){ const a=wx_(g.x0+S[k]*g.cs), b=wz_(g.z0+S[k+1]*g.cs), c=wx_(g.x0+S[k+2]*g.cs), d=wz_(g.z0+S[k+3]*g.cs); SOLS.push([a,b,c,d]); } SOL.up.push(...SOLS); }
    GR={...B,ground:SKATE.ground}; ROOMS.grounds.push(GR);
    // the skaters, each where the kit stood them; they mill about near their spot
    if(SK)scene.add(SK.g); else BODS().then(J=>{ if(!G)return; SK={g:new THREE.Group(),list:[]}; SK.g.name='skaters'; scene.add(SK.g);
      D.people.forEach((p,i)=>{ const k='skater'+i, b=J.bodies['s'+p.b]; if(!b)return; BODIES.add({...BODIES.rebakedBody(J,'s'+p.b,{}),key:k,label:NAMES[p.key]||'A SKATER',root:SK.g,size:b.height/1.8,hd:p.hd,ground:SKATE.ground});
        const N=BODIES.by[k].npc, s=N.st; s.x=wx_(p.x); s.z=wz_(p.z); s.hd=p.hd; s.home={x:s.x,z:s.z,r:1.6*TILE}; N.free=(x,z)=>x>B.x0&&x<B.x1&&z>B.z0&&z<B.z1&&!CLIP.hit(SOL.up,x,z,.25*TILE); N.on=true; SK.list.push(N); }); }).catch(e=>console.warn('SKATE skaters',e));
    if(SK)for(const N of SK.list)N.on=true;
    tick=()=>{ const n=CLOCK.dark?CLOCK.dark():false; if(LIT&&LIT.on!==n){ LIT.on=n; LIT.m.geometry=n?LIT.night:LIT.day; LIT.m.material=n?LIT.nm:LIT.dm; } sky.material.uniforms.n.value+=((n?1:0)-sky.material.uniforms.n.value)*.05; };
    return ROOMS.part(G,()=>{},null); };
  const unbuild=()=>{ for(const b of SOLS){ const i=SOL.up.indexOf(b); if(i>=0)SOL.up.splice(i,1); } SOLS=[]; const gi=ROOMS.grounds.indexOf(GR); if(gi>=0)ROOMS.grounds.splice(gi,1); GR=null; tick=null;
    if(SK){ for(const N of SK.list)N.on=false; SK.g.removeFromParent(); }
    if(G){ G.traverse(c=>{ if(c.geometry)c.geometry.dispose(); if(c.material)c.material.dispose(); }); if(LIT){ LIT.day.dispose(); LIT.night.dispose(); LIT.nm.dispose(); LIT.dm.dispose(); } G.removeFromParent(); G=null; LIT=null; } };
  SKATE.dbg=()=>({built:!!G,solids:SOLS.length,grounds:ROOMS.grounds.length,skaters:SK?SK.list.filter(N=>N.on).length:0,people:D?D.people.length:0,lit:LIT&&LIT.on,door:SKATE.door,at:(x,z)=>[wx_(x),wz_(z)]});
  SYS.add('dress',()=>tick&&tick(),'111fd-skatepark');   // the lamps and the sky follow the clock while it is built
  const gin=[wx_(GX),wz_(GZ-3)];

  // the gateway in Central Park: the door
  PARK.later(()=>{ '@park'; const S=LEVEL.parkPlaces&&LEVEL.parkPlaces.skatepark; if(!S)return; const P=PARK, X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0));
    const F={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0]}[S.face]||[0,1], wx=X(S.x), wz=Z(S.y), fx=X(S.x+F[0])-wx, fz=Z(S.y+F[1])-wz, fl=Math.hypot(fx,fz), f=[fx/fl,fz/fl], r=[f[1],-f[0]], y0=MODS.bodega.ground(wx,wz);
    const at=(lx,lz)=>[wx+(r[0]*lx+f[0]*lz)*MH,wz+(r[1]*lx+f[1]*lz)*MH], door=at(0,1.6);
    SKATE.door=[door[0],y0,door[1]];
    GATE().then(G=>{ const g=new THREE.Mesh(geo(G,(x,y,z)=>{ const q=at(x,z); return [q[0],y0+y*MV,q[1]]; }),MAT()); g.name='the skate park gateway'; g.castShadow=g.receiveShadow=true; (MAPG.park||scene).add(g);
      SKATE.gateSol=[]; for(const sx of [-1,1]){ const a=at(sx*3.4-.4,-.4), b=at(sx*3.4+.4,.4); SKATE.gateSol.push([Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])]); } SOL.up.push(...SKATE.gateSol); }).catch(e=>console.warn('SKATE gate',e));
    ROOMS.off.skatepark={name:'THE SKATE PARK',noCeil:1,clearAir:1,box:{x0:B.x0,z0:B.z0,x1:B.x1,z1:B.z1,y0:-12*MV,y1:40*MV},need,build,unbuild,
      spawn:[gin[0],gin[1],0,Math.PI],out:[door[0],door[1],0,Math.atan2(f[0],f[1])],door:SKATE.door,exit:[wx_(GX),0,wz_(GZ+.1)],exitName:'OUT TO THE PARK'};
    if(STORE.places)STORE.places.push(['THE SKATE PARK',door[0],door[1]+.8*TILE,'up']);
    ROOMS.reset&&ROOMS.reset(); SKATE.ready=true; });
}
