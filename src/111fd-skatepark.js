// THE SKATE PARK: the Polyfork skatepark kit at full size, out in the open in a section's Central Park (sections.places in data/world.json: Section B's, its gate on West St): the kit's own park (data/skatepark.json, tools/skatepark-bake.py), its floodlights lighting it after dark, one of each of its skaters on your rig (data/skaters.json), the board skaters riding the kit's skateboard (data/skateboard.json), the scooter kid and the BMX rider theirs (data/skaterides.json); its decks, ramps and ledges are ground to walk and ride.
import {SHARED, THREE} from './003-shx.js';
import {CLIP, CLOCK, FORAGE, RIDE, ROOMS, SHOPS, TRICKS, W3} from './003b-systems.js';
import {scene} from './004-main.js';
import {SECTIONS, SOL, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
const SKATE={rails:[]}; window.SKATE=SKATE;
{ const DATA=__LAZY__("data/skatepark.json"), BODS=__LAZY__("data/skaters.json"), BOARD=__LAZY__("data/skateboard.json"), RIDES=__LAZY__("data/skaterides.json");
  const MH=TILE/.84, MV=ZU*24/.84, I16=s=>{ const b=atob(s), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i); return u.buffer; };
  const NAMES={'skate-filmer':'THE FILMER','street-skater':'A STREET SKATER','veteran-pool-skater':'THE POOL VETERAN','vert-skater':'A VERT SKATER','roller-skater':'THE ROLLER SKATER','skate-coach':'THE COACH',
    'beginner-kid-skater':'A KID ON A BOARD','scooter-kid':'A KID ON A SCOOTER','bmx-rider':'A BMX RIDER','graffiti-artist':'THE GRAFFITI ARTIST','longboarder':'A LONGBOARDER','skate-shop-owner':'THE SKATE SHOP OWNER'};
  // a packed mesh (lo, sc, int16 corners, uint8 colours, uint32 triangles) placed by f(x,y,z) -> world
  const geo=(M,f,col='c')=>{ '@later'; const Q=new Int16Array(I16(M.p)), C=new Uint8Array(I16(M[col])), P=new Float32Array(Q.length), v=[0,0,0];
    for(let i=0;i<Q.length;i+=3){ for(let k=0;k<3;k++)v[k]=(Q[i+k]+32500)*M.sc+M.lo[k]; const w=f(v[0],v[1],v[2]); P[i]=w[0]; P[i+1]=w[1]; P[i+2]=w[2]; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3,true)); g.setIndex(new THREE.BufferAttribute(new Uint32Array(I16(M.i)),1)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
  const MAT=()=>new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});
  // the skateboard (the kit's cruiser) as a RIDE kind: what the board skaters stand on, posed by the rig's skate stance and push
  const RIDERS={'street-skater':['skate',3.2],'veteran-pool-skater':['skate',3],'vert-skater':['skate',3.4],'beginner-kid-skater':['skate',2],'longboarder':['skate',3.6],'scooter-kid':['scoot',2.6],'bmx-rider':['bmx',4.2]};   // who rides what, how fast (m/s)
  let BD=null; const SPOSE={k:'skate',push:-1,brake:false,goofy:false,z:0};
  const deckH=()=>RIG.RIDEG.deck*(W3.group&&W3.group.scale.y||.046);
  const SKATEK={name:'SKATEBOARD',cat:'skate',hint:'E SETS IT DOWN AND YOU STEP ON. WASD RIDES, SPACE OLLIES, J FLIPS, K GRABS, L GRINDS, I MANUALS (? FOR ALL OF IT), E STEPS OFF.',onSay:'YOU DROP THE BOARD AND STEP ON.',held:.6,acc:2.6,turn:2.6,drag:.6,knock:5,hop:3,
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
  // the BMX for anyone (owner, 7 Nov 2026: "make the BMX rideable"): the BMX rider's bike, ridden by you as the hoverboard is (data/items.json bmx, grants bmx); others see you on it
  const BMXP={...BMXK,name:'BMX',cat:'skate',hint:'E SETS IT DOWN AND YOU GET ON. WASD PEDALS AND STEERS, SPACE HOPS, E GETS OFF.',onSay:'YOU SWING A LEG OVER THE BMX.',held:.5,acc:2.2,turn:2.2,drag:.5,knock:5,hop:2.6,
    make:()=>{ const m=BMXK.make(); m.scale.setScalar(TILE/.84*.75); return m; },
    place:(m,R,t,c)=>BMXK.place(m,R,t,c||{g:W3.group,S:(BODIES.by[BODIES.pick()]||{}).S||1})};
  SKATE.bmx=BMXP;
  // anyone can own one: the skate shop sells it (data/items.json skateboard, grants skate; the shop owner's trade in characters.json)
  SYS.onStart(()=>{ FORAGE.add({names:{skateboard:'SKATEBOARD',bmx:'A BMX'}}); RIDES().then(r=>{ RD=RD||r; if(RIDE.kind&&!RIDE.kinds.bmx)RIDE.kind('bmx',BMXP); }).catch(e=>console.warn('BMX',e)); BOARD().then(b=>{ BD=b; if(RIDE.kind&&!RIDE.kinds.skate)RIDE.kind('skate',SKATEK); }).catch(e=>console.warn('SKATE board',e)); },'111fd-skateboard');

  // the park, out in the open in its section's Central Park (sections.places in data/world.json): built when you are in that section, its gate facing where the entry says
  const S=(SECTIONS.places||[]).find(q=>q.id==='skatepark'), GX=0, GZ=32.5;   // its gateway, in the park's metres (tools/skatepark-bake.py)
  let D=null, G=null, SK=null, LIT=null, LAMPS=[], SOLS=[], GR=null, tick=null, Y0=0, WX=0, WZ=0, B=null;
  const F={n:[0,1],s:[0,-1],e:[1,0],w:[-1,0]}[S&&S.face]||[0,1], R_=[F[1],-F[0]], TH=Math.atan2(F[0],F[1]);   // the way the gate faces (the park's +z) and its +x, in the world
  const LAMPI=26, wx_=(x,z)=>WX+(R_[0]*x+F[0]*z)*MH, wz_=(x,z)=>WZ+(R_[1]*x+F[1]*z)*MH, wy_=y=>(y-Y0)*MV;
  const at=(x,z)=>[wx_(x,z),wz_(x,z)];
  SKATE.ground=(x,z)=>{ const g=D&&D.ground; if(!g)return 0; const dx=(x-WX)/MH, dz=(z-WZ)/MH, i=Math.floor((dx*R_[0]+dz*R_[1]-g.x0)/g.cs), j=Math.floor((dx*F[0]+dz*F[1]-g.z0)/g.cs); if(i<0||j<0||i>=g.nx||j>=g.nz)return 0; return wy_(g.y0+g.H[j*g.nx+i]*g.dy); };
  const need=()=>Promise.all([LOAD('skatepark'),DATA().then(d=>{ D=d; if(!D.ground.H)D.ground.H=new Uint16Array(I16(D.ground.h)); Y0=D.gate.y; }),BOARD().then(b=>{ BD=b; if(RIDE.kind&&!RIDE.kinds.skate)RIDE.kind('skate',SKATEK); }),RIDES().then(r=>{ RD=r; })]);
  const build=()=>{ '@skatepark';
    G=new THREE.Group(); G.name='skatepark'; scene.add(G); const f=(x,y,z)=>[wx_(x,z),wy_(y),wz_(x,z)];
    for(const M of D.mesh){ const m=new THREE.Mesh(geo(M,f),MAT()); m.castShadow=m.receiveShadow=true; G.add(m); }
    { const day=geo(D.glow,f), night=day.clone(); night.setAttribute('color',new THREE.BufferAttribute(new Uint8Array(I16(D.glow.night)),3,true));
      const m=new THREE.Mesh(day,MAT()), nm=new THREE.MeshBasicMaterial({vertexColors:true}); m.receiveShadow=true; G.add(m); LIT={m,day,night,dm:m.material,nm,on:null}; }
    // walls: the cells a body can't pass
    { const g=D.ground, S=new Uint16Array(I16(D.solid)); SOLS=[]; for(let k=0;k<S.length;k+=4){ const a=at(g.x0+S[k]*g.cs,g.z0+S[k+1]*g.cs), c=at(g.x0+S[k+2]*g.cs,g.z0+S[k+3]*g.cs); SOLS.push([Math.min(a[0],c[0]),Math.min(a[1],c[1]),Math.max(a[0],c[0]),Math.max(a[1],c[1])]); } SOL.up.push(...SOLS); }
    GR={...B,ground:SKATE.ground}; ROOMS.grounds.push(GR);
    // the top skaters: a board by the gate with the section's ten best combos (the shared score table), read when it is built
    { const cv=document.createElement('canvas'); cv.width=256; cv.height=192; const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace;
      const draw=L=>{ const c=cv.getContext('2d'); c.fillStyle='#14161c'; c.fillRect(0,0,256,192); c.strokeStyle='#f2c14e'; c.lineWidth=4; c.strokeRect(4,4,248,184); c.textAlign='center'; c.fillStyle='#f2c14e'; c.font='bold 15px monospace'; c.fillText('TOP SKATERS',128,26);
        c.font='12px monospace'; (L&&L.length?L:[]).slice(0,10).forEach((e,i)=>{ c.textAlign='left'; c.fillStyle=i?'#d8dae2':'#7dffa4'; c.fillText((i+1+'.').padEnd(4)+e.ini,22,48+i*14); c.textAlign='right'; c.fillText(String(e.score),234,48+i*14); });
        if(!L||!L.length){ c.fillStyle='#8a8f9c'; c.fillText('NO COMBOS YET. BE THE FIRST.',128,100); } tx.needsUpdate=true; };
      draw(null); if(TRICKS.top)TRICKS.top().then(draw).catch(()=>{});
      const sign=new THREE.Mesh(new THREE.BoxGeometry(2*MH,1.5*MV,.06*MH),[MAT(),MAT(),MAT(),MAT(),new THREE.MeshBasicMaterial({map:tx}),new THREE.MeshBasicMaterial({map:tx})]), sp=at(GX+4.2,GZ-2.6);
      sign.geometry.deleteAttribute('color'); sign.material.forEach((m,i)=>{ if(i<4){ m.vertexColors=false; m.color.set(0x2a2d36); } }); sign.position.set(sp[0],wy_(1.6),sp[1]); sign.rotation.y=Math.PI+TH; G.add(sign);
      const post=new THREE.Mesh(new THREE.BoxGeometry(.1*MH,.9*MV,.1*MH),new THREE.MeshLambertMaterial({color:0x2a2d36})); post.position.set(sp[0],wy_(.45),sp[1]); G.add(post); }
    SKATE.rails.push(...(D.rails||[]).map(r=>{ const a=at(r[0],r[2]), b=at(r[3],r[5]); return {a:[a[0],wy_(r[1]),a[1]],b:[b[0],wy_(r[4]),b[1]],kind:r[6]}; }));   // the grind lines, in the world
    // the skaters, each where the kit stood them; they mill about near their spot
    BODS().then(J=>{ if(!G)return; SK={g:new THREE.Group(),list:[]}; SK.g.name='skaters'; scene.add(SK.g);
      D.people.forEach((p,i)=>{ const k=p.key==='skate-shop-owner'?'skateshop':'skater'+i, b=J.bodies['s'+p.b]; if(!b)return; BODIES.add({...BODIES.rebakedBody(J,'s'+p.b,{}),key:k,label:NAMES[p.key]||'A SKATER',root:SK.g,size:b.height/1.8,hd:p.hd+TH,ground:SKATE.ground,...(RIDERS[p.key]?{ride:KINDS[RIDERS[p.key][0]],rideSpeed:RIDERS[p.key][1]}:{})});
        const N=BODIES.by[k].npc, s=N.st, q=at(p.x,p.z); s.x=q[0]; s.z=q[1]; s.hd=p.hd+TH; s.home={x:s.x,z:s.z,r:(RIDERS[p.key]?7:1.6)*TILE}; N.free=(x,z)=>x>B.x0&&x<B.x1&&z>B.z0&&z<B.z1&&!CLIP.hit(SOL.up,x,z,.25*TILE); N.on=true; SK.list.push(N); }); if(SHOPS.sync)SHOPS.sync(); }).catch(e=>console.warn('SKATE skaters',e));
    tick=()=>{ const n=CLOCK.dark?CLOCK.dark():false; if(LIT&&LIT.on!==n){ LIT.on=n; LIT.m.geometry=n?LIT.night:LIT.day; LIT.m.material=n?LIT.nm:LIT.dm; for(const l of LAMPS)l.intensity=n?LAMPI:0; } };
    return ROOMS.part(G,()=>{ LAMPS=(D.lamps||[]).map(([x,y,z])=>{ const l=new THREE.PointLight(0xffe2b0,0,52*MH,1), q=at(x,z); l.position.set(q[0],wy_(y),q[1]); scene.add(l); return l; }); },null); };   // the floodlights: part records them into the lights you get the nearest of
  SKATE.LAMPI=LAMPI; SKATE.dbg=()=>({shop:!!(SHOPS.bound&&SHOPS.bound.has('skateshop')),lamps:LAMPS.filter(l=>l.intensity>0).length,built:!!G,solids:SOLS.length,grounds:ROOMS.grounds.length,skaters:SK?SK.list.filter(N=>N.on).length:0,riding:SK?SK.list.filter(N=>N.board&&N.RS&&N.RS.v>0).length:0,boards:SK?SK.list.filter(N=>N.board).length:0,people:D?D.people.length:0,lit:LIT&&LIT.on,gate:at(GX,GZ+3),at});
  SYS.add('dress',()=>tick&&tick(),'111fd-skatepark');   // the lamps follow the clock
  // in its section, it is built as the start ends
  if(S&&SECTIONS.home.id===S.section){ WX=SHARED.BOD.XS(S.x); WZ=SHARED.BOD.ZS(S.y); const a=at(-24,-34), c=at(24,34); B={x0:Math.min(a[0],c[0]),z0:Math.min(a[1],c[1]),x1:Math.max(a[0],c[0]),z1:Math.max(a[1],c[1])};
    STORE.places.push(['THE SKATE PARK',...at(GX,GZ+3),'up','see',null,null,[S.x,S.y]]);   // GO TO: outside its gate; the map names it at its middle
    SYS.onStart(()=>need().then(()=>{ build(); SKATE.ready=true; }).catch(e=>console.warn('SKATE park',e)),'111fd-skatepark'); }
}
export {SKATE};
