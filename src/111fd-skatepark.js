// THE SKATE PARK: the Polyfork skatepark kit at full size, a place off the map you go into by its gateway in Central Park (parkPlaces.skatepark in data/world.json): the kit's own park (data/skatepark.json, tools/skatepark-bake.py) under its own sky, its floodlights lighting it after dark, one of each of its skaters on your rig (data/skaters.json), the board skaters riding the kit's skateboard (data/skateboard.json), the scooter kid and the BMX rider theirs (data/skaterides.json); its decks, ramps and ledges are ground to walk and ride.
import {SHARED, THREE} from './003-shx.js';
import {CLIP, CLOCK, FORAGE, PARK, RIDE, ROOMS, SHOPS, TRICKS, W3} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLDK, LEVEL, MAPG, MODS, OFFDX, SOL, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
const SKATE={rails:[]}; window.SKATE=SKATE;
{ const DATA=__LAZY__("data/skatepark.json"), BODS=__LAZY__("data/skaters.json"), GATE=__LAZY__("data/skategate.json"), BOARD=__LAZY__("data/skateboard.json"), RIDES=__LAZY__("data/skaterides.json");
  const MH=TILE/.84, MV=ZU*24/.84, I16=s=>{ const b=atob(s), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i); return u.buffer; };
  const NAMES={'skate-filmer':'THE FILMER','street-skater':'A STREET SKATER','veteran-pool-skater':'THE POOL VETERAN','vert-skater':'A VERT SKATER','roller-skater':'THE ROLLER SKATER','skate-coach':'THE COACH',
    'beginner-kid-skater':'A KID ON A BOARD','scooter-kid':'A KID ON A SCOOTER','bmx-rider':'A BMX RIDER','graffiti-artist':'THE GRAFFITI ARTIST','longboarder':'A LONGBOARDER','skate-shop-owner':'THE SKATE SHOP OWNER'};
  // a packed mesh (lo, sc, int16 corners, uint8 colours, uint32 triangles) placed by f(x,y,z) -> world
  const geo=(M,f,col='c')=>{ const Q=new Int16Array(I16(M.p)), C=new Uint8Array(I16(M[col])), P=new Float32Array(Q.length), v=[0,0,0];
    for(let i=0;i<Q.length;i+=3){ for(let k=0;k<3;k++)v[k]=(Q[i+k]+32500)*M.sc+M.lo[k]; const w=f(v[0],v[1],v[2]); P[i]=w[0]; P[i+1]=w[1]; P[i+2]=w[2]; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3,true)); g.setIndex(new THREE.BufferAttribute(new Uint32Array(I16(M.i)),1)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
  const MAT=()=>new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});
  // the skateboard (the kit's cruiser) as a RIDE kind: what the board skaters stand on, posed by the rig's skate stance and push
  const RIDERS={'street-skater':['skate',3.2],'veteran-pool-skater':['skate',3],'vert-skater':['skate',3.4],'beginner-kid-skater':['skate',2],'longboarder':['skate',3.6],'scooter-kid':['scoot',2.6],'bmx-rider':['bmx',4.2]};   // who rides what, how fast (m/s)
  let BD=null; const SPOSE={k:'skate',push:-1,brake:false,goofy:false,z:0};
  const deckH=()=>RIG.RIDEG.deck*(W3.group&&W3.group.scale.y||.046);
  const SKATEK={name:'SKATEBOARD',hint:'A CLICK SETS IT DOWN AND YOU STEP ON. WASD RIDES, SPACE OLLIES, J FLIPS, K GRABS, L GRINDS, I MANUALS (? FOR ALL OF IT), A CLICK STEPS OFF.',onSay:'YOU DROP THE BOARD AND STEP ON.',held:.6,acc:2.6,turn:2.6,drag:.6,knock:5,hop:3,
    make:()=>{ const m=new THREE.Mesh(geo(BD,(x,y,z)=>[x*MH,y*MV,z*MH]),MAT()); m.castShadow=true; m.userData.top=BD.top*MV; return m; },
    floor:(g,R)=>TRICKS.floor?TRICKS.floor(g,R,BD.top*MV-deckH()):g+BD.top*MV-deckH()+(R.z||0),   // you stand on the deck, its wheels on the ground (or a rail's top)
    step:(R,dt,inp)=>TRICKS.step?TRICKS.step(R,dt,inp):false,   // ridden by you: the tricks move it
    pose:R=>{ let p=R.push; if(p==null){ const up=R.v>(R.pv||0)+1e-4&&R.v<4.5*TILE; R.pv=R.v; R.pt=up?(R.pt||0)+.022:0; p=up?R.pt%1:-1; } SPOSE.push=p; SPOSE.brake=!(R.v>.2*TILE); SPOSE.z=R.z||0; if(TRICKS.pose)TRICKS.pose(R,SPOSE); return SPOSE; },   // pushes off while it gathers speed
    place:(m,R)=>{ m.position.y-=m.userData.top||0; m.rotation.z=Math.max(-.25,Math.min(.25,-(R.lean||0)*.3)); if(TRICKS.place)TRICKS.place(m,R); }};
  SKATE.board=SKATEK;
  // the scooter kid's scooter and the BMX rider's bike (the kit's own): drawn at their rider's scale, wheels on the ground; the BMX at .75 so its cranks, seat and bars meet the rig's bike pose
  let RD=null; const VPOSE={k:'scoot',push:-1,brake:false,z:0}, BPOSE={k:'bike',c:0,brake:false,z:0};
  const vehicle=(key,fit,ahead)=>({make:()=>{ const m=new THREE.Mesh(geo(RD[key],(x,y,z)=>[x,y,z]),MAT()); m.castShadow=true; return m; },
    place:(m,R,t,c)=>{ if(!c)return; const u=c.g.scale.y, k=c.S*u*fit, a=m.rotation.y, f=ahead(u,k); m.scale.setScalar(k); m.position.y-=RIG.RIDEG.deck*u; m.position.x+=Math.sin(a)*f; m.position.z+=Math.cos(a)*f; }});
  const SCOOTK={name:'SCOOTER',...vehicle('scooter',1,(u,k)=>-.12*k),
    pose:R=>{ VPOSE.push=R.push==null?-1:R.push; VPOSE.brake=!(R.v>.2*TILE); VPOSE.z=0; return VPOSE; }};   // you stand toward its front, the bars a reach ahead
  const BMXK={name:'BMX',...vehicle('bmx',.75,(u,k)=>RIG.RIDEG.bb[1]*u+.125*k),
    pose:R=>{ BPOSE.c=(BPOSE.c||0)+(R.v/TILE)*.14; BPOSE.brake=!(R.v>.2*TILE); return BPOSE; }};   // its cranks under the rig's: they turn as it rolls
  const KINDS={skate:SKATEK,scoot:SCOOTK,bmx:BMXK};
  // anyone can own one: the skate shop sells it (data/items.json skateboard, grants skate; the shop owner's trade in characters.json)
  SYS.onStart(()=>{ FORAGE.add({names:{skateboard:'SKATEBOARD'}}); BOARD().then(b=>{ BD=b; if(RIDE.kind&&!RIDE.kinds.skate)RIDE.kind('skate',SKATEK); }).catch(e=>console.warn('SKATE board',e)); },'111fd-skateboard');

  // the park, off the map west of the sections; you come in just inside its gateway
  const WX=SHARED.BOD.X(1700+OFFDX/BLDK), WZ=SHARED.BOD.Z(-45), B={x0:WX-27*MH,x1:WX+27*MH,z0:WZ-37*MH,z1:WZ+37*MH}, GX=0, GZ=32.5;   // its footprint and its gateway, in the park's metres (tools/skatepark-bake.py)
  let D=null, G=null, SK=null, LIT=null, LAMPS=[], SOLS=[], GR=null, tick=null, Y0=0;
  const LAMPI=26, wx_=x=>WX+x*MH, wz_=z=>WZ+z*MH, wy_=y=>(y-Y0)*MV;
  SKATE.ground=(x,z)=>{ const g=D&&D.ground; if(!g)return 0; const i=Math.floor(((x-WX)/MH-g.x0)/g.cs), j=Math.floor(((z-WZ)/MH-g.z0)/g.cs); if(i<0||j<0||i>=g.nx||j>=g.nz)return 0; return wy_(g.y0+g.H[j*g.nx+i]*g.dy); };
  const need=()=>Promise.all([LOAD('skatepark'),DATA().then(d=>{ D=d; if(!D.ground.H)D.ground.H=new Uint16Array(I16(D.ground.h)); Y0=D.gate.y; }),BOARD().then(b=>{ BD=b; if(RIDE.kind&&!RIDE.kinds.skate)RIDE.kind('skate',SKATEK); }),RIDES().then(r=>{ RD=r; })]);
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
    // the top skaters: a board by the gate with the section's ten best combos (the shared score table), read each time you come in
    { const cv=document.createElement('canvas'); cv.width=256; cv.height=192; const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace;
      const draw=L=>{ const c=cv.getContext('2d'); c.fillStyle='#14161c'; c.fillRect(0,0,256,192); c.strokeStyle='#f2c14e'; c.lineWidth=4; c.strokeRect(4,4,248,184); c.textAlign='center'; c.fillStyle='#f2c14e'; c.font='bold 15px monospace'; c.fillText('TOP SKATERS',128,26);
        c.font='12px monospace'; (L&&L.length?L:[]).slice(0,10).forEach((e,i)=>{ c.textAlign='left'; c.fillStyle=i?'#d8dae2':'#7dffa4'; c.fillText((i+1+'.').padEnd(4)+e.ini,22,48+i*14); c.textAlign='right'; c.fillText(String(e.score),234,48+i*14); });
        if(!L||!L.length){ c.fillStyle='#8a8f9c'; c.fillText('NO COMBOS YET. BE THE FIRST.',128,100); } tx.needsUpdate=true; };
      draw(null); if(TRICKS.top)TRICKS.top().then(draw).catch(()=>{});
      const sign=new THREE.Mesh(new THREE.BoxGeometry(2*MH,1.5*MV,.06*MH),[MAT(),MAT(),MAT(),MAT(),new THREE.MeshBasicMaterial({map:tx}),new THREE.MeshBasicMaterial({map:tx})]);
      sign.geometry.deleteAttribute('color'); sign.material.forEach((m,i)=>{ if(i<4){ m.vertexColors=false; m.color.set(0x2a2d36); } }); sign.position.set(wx_(GX+4.2),wy_(1.6),wz_(GZ-2.6)); sign.rotation.y=Math.PI; G.add(sign);
      const post=new THREE.Mesh(new THREE.BoxGeometry(.1*MH,.9*MV,.1*MH),new THREE.MeshLambertMaterial({color:0x2a2d36})); post.position.set(wx_(GX+4.2),wy_(.45),wz_(GZ-2.6)); G.add(post); }
    SKATE.rails=(D.rails||[]).map(r=>({a:[wx_(r[0]),wy_(r[1]),wz_(r[2])],b:[wx_(r[3]),wy_(r[4]),wz_(r[5])],kind:r[6]}));   // the grind lines, in the world, while it is built
    // the skaters, each where the kit stood them; they mill about near their spot
    if(SK)scene.add(SK.g); else BODS().then(J=>{ if(!G)return; SK={g:new THREE.Group(),list:[]}; SK.g.name='skaters'; scene.add(SK.g);
      D.people.forEach((p,i)=>{ const k=p.key==='skate-shop-owner'?'skateshop':'skater'+i, b=J.bodies['s'+p.b]; if(!b)return; BODIES.add({...BODIES.rebakedBody(J,'s'+p.b,{}),key:k,label:NAMES[p.key]||'A SKATER',root:SK.g,size:b.height/1.8,hd:p.hd,ground:SKATE.ground,...(RIDERS[p.key]?{ride:KINDS[RIDERS[p.key][0]],rideSpeed:RIDERS[p.key][1]}:{})});
        const N=BODIES.by[k].npc, s=N.st; s.x=wx_(p.x); s.z=wz_(p.z); s.hd=p.hd; s.home={x:s.x,z:s.z,r:(RIDERS[p.key]?7:1.6)*TILE}; N.free=(x,z)=>x>B.x0&&x<B.x1&&z>B.z0&&z<B.z1&&!CLIP.hit(SOL.up,x,z,.25*TILE); N.on=true; SK.list.push(N); }); if(SHOPS.sync)SHOPS.sync(); }).catch(e=>console.warn('SKATE skaters',e));
    if(SK)for(const N of SK.list)N.on=true;
    tick=()=>{ const n=CLOCK.dark?CLOCK.dark():false; if(LIT&&LIT.on!==n){ LIT.on=n; LIT.m.geometry=n?LIT.night:LIT.day; LIT.m.material=n?LIT.nm:LIT.dm; for(const l of LAMPS)l.intensity=n?LAMPI:0; } sky.material.uniforms.n.value+=((n?1:0)-sky.material.uniforms.n.value)*.05; };
    return ROOMS.part(G,()=>{ LAMPS=(D.lamps||[]).map(([x,y,z])=>{ const l=new THREE.PointLight(0xffe2b0,0,52*MH,1); l.position.set(wx_(x),wy_(y),wz_(z)); scene.add(l); return l; }); },null); };   // the floodlights: part records them into the lights you get the nearest of
  const unbuild=()=>{ LAMPS=[]; SKATE.rails=[]; for(const b of SOLS){ const i=SOL.up.indexOf(b); if(i>=0)SOL.up.splice(i,1); } SOLS=[]; const gi=ROOMS.grounds.indexOf(GR); if(gi>=0)ROOMS.grounds.splice(gi,1); GR=null; tick=null;
    if(SK){ for(const N of SK.list)N.on=false; SK.g.removeFromParent(); }
    if(G){ G.traverse(c=>{ if(c.geometry)c.geometry.dispose(); if(c.material)c.material.dispose(); }); if(LIT){ LIT.day.dispose(); LIT.night.dispose(); LIT.nm.dispose(); LIT.dm.dispose(); } G.removeFromParent(); G=null; LIT=null; } };
  SKATE.LAMPI=LAMPI; SKATE.dbg=()=>({shop:!!(SHOPS.bound&&SHOPS.bound.has('skateshop')),lamps:LAMPS.filter(l=>l.intensity>0).length,built:!!G,solids:SOLS.length,grounds:ROOMS.grounds.length,skaters:SK?SK.list.filter(N=>N.on).length:0,riding:SK?SK.list.filter(N=>N.board&&N.RS&&N.RS.v>0).length:0,boards:SK?SK.list.filter(N=>N.board).length:0,people:D?D.people.length:0,lit:LIT&&LIT.on,door:SKATE.door,at:(x,z)=>[wx_(x),wz_(z)]});
  SYS.add('dress',()=>tick&&tick(),'111fd-skatepark');   // the lamps and the sky follow the clock while it is built
  const gin=[wx_(GX),wz_(GZ-3)];

  // the gateway in Central Park: the door
  PARK.later(()=>{ '@park'; const S=LEVEL.parkPlaces&&LEVEL.parkPlaces.skatepark; if(!S)return; const P=PARK, X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0));
    const F={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0]}[S.face]||[0,1], wx=X(S.x), wz=Z(S.y), fx=X(S.x+F[0])-wx, fz=Z(S.y+F[1])-wz, fl=Math.hypot(fx,fz), f=[fx/fl,fz/fl], r=[f[1],-f[0]], y0=MODS.bodega.ground(wx,wz);
    const at=(lx,lz)=>[wx+(r[0]*lx+f[0]*lz)*MH,wz+(r[1]*lx+f[1]*lz)*MH], door=at(0,1.6);
    SKATE.door=[door[0],y0,door[1]];
    GATE().then(G=>{ const g=new THREE.Mesh(geo(G,(x,y,z)=>{ const q=at(x,z); return [q[0],y0+y*MV,q[1]]; }),MAT()); g.name='the skate park gateway'; g.castShadow=g.receiveShadow=true; (MAPG.park||scene).add(g);
      SKATE.gateSol=[]; for(const sx of [-1,1]){ const a=at(sx*3.4-.4,-.4), b=at(sx*3.4+.4,.4); SKATE.gateSol.push([Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])]); } SOL.up.push(...SKATE.gateSol); }).catch(e=>console.warn('SKATE gate',e));
    ROOMS.off.skatepark={name:'THE SKATE PARK',noCeil:1,clearAir:1,outdoor:1,box:{x0:B.x0,z0:B.z0,x1:B.x1,z1:B.z1,y0:-12*MV,y1:40*MV},need,build,unbuild,
      spawn:[gin[0],gin[1],0,Math.PI],out:[door[0],door[1],0,Math.atan2(f[0],f[1])],door:SKATE.door,exit:[wx_(GX),0,wz_(GZ+.1)],exitName:'OUT TO THE PARK'};
    if(STORE.places)STORE.places.push(['THE SKATE PARK',door[0],door[1]+.8*TILE,'up']);
    ROOMS.reset&&ROOMS.reset(); SKATE.ready=true; });
}
export {SKATE};
