// THE CARS: the racing-cars kit's six cars (data/cars.json, CC0) parked on Market St (their spots in data/world.json's cars); double-click one to get in and drive it (a RIDE kind boarded where it stands, on VEH: W goes, S brakes and backs, A and D steer); GET OUT (or F) parks it where it stands. The section's server keeps where each car is parked and who drives it, so everyone sees the same cars, one driver a car.
import {SHARED, THREE} from './003-shx.js';
import {CARLAMPS, CARX, FLOW, keys, ONLINE, PB, pos, RADIO, RIDE, ROOMS, SFX, SKY, SPEED, st, UI, VLOOK} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer, scene} from './004-main.js';
import {LEVEL, MODS, SOL, SYS, TILE, ZU} from './006-map-pre.js';
import {RIVER} from './066-river.js';
import {VEH} from './150o-physmore.js';
const CARD=__LAZY__("data/cars.json"), RADJ=__LAZY__("data/radio.json"), RFILE={jazz:__FILE__("data/radio/jazz.mp3"),dance:__FILE__("data/radio/dance.mp3"),rag:__FILE__("data/radio/rag.mp3"),opera:__FILE__("data/radio/opera.mp3")};
{ const T=TILE, M0=T/.84, BIG=1.4, M1=M0*BIG, say=(t,c)=>SAY(t,c||'#e8e2cc'), X=SHARED.BOD.XS, Z=SHARED.BOD.ZS;
  const CARS=new Map(), KINDS={}; let DATA=null, mine=null, want=null;
  const CAR={cars:CARS,kinds:KINDS,get driving(){ return mine; }}; window.CARS=MODS.cars=CAR;
  // a car parked past the map's edges (owner, 8 Nov 2026: "move all the cars past the edge of forcefield on street, parked") is only seen: no one gets in where no one can walk
  const EB=(()=>{ const L=(LEVEL.edge&&LEVEL.edge.lines)||[]; if(!L.length)return null; const xs=L.flatMap(l=>[l[0],l[2]]), ys=L.flatMap(l=>[l[1],l[3]]); return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]; })();
  const inMap=C=>{ if(!EB||C.moor)return true; const gx=SHARED.BOD.MX(C.x), gy=SHARED.BOD.MY(C.z); return gx>EB[0]&&gx<EB[2]&&gy>EB[1]&&gy<EB[3]; };
  for(const c of LEVEL.cars||[])CARS.set(c.id,{id:c.id,model:c.model,x:X(c.x),z:Z(c.y),hd:(c.hd||0)*Math.PI/180,by:null,mesh:null,sol:null,moor:c.moor||null});

  /* ---------- the kit's meshes: a part's groups by material (int16 positions over its box, int8 normals, sRGB colours, uint16 indices) ---------- */
  const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const part=G=>{ const g=new THREE.Group(); for(const q of G){ const P=new Int16Array(b64(q.p).buffer), Nn=new Int8Array(b64(q.n).buffer), Cc=b64(q.c), I=new Uint16Array(b64(q.i).buffer), n=P.length/3, p=new Float32Array(n*3), nn=new Float32Array(n*3), c=new Float32Array(n*3);
      for(let v=0;v<n;v++)for(let k=0;k<3;k++){ p[v*3+k]=P[v*3+k]*q.s[k]+q.o[k]; nn[v*3+k]=Nn[v*3+k]/127; c[v*3+k]=Math.pow(Cc[v*3+k]/255,2.2); }
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(p,3)); geo.setAttribute('normal',new THREE.BufferAttribute(nn,3)); geo.setAttribute('color',new THREE.BufferAttribute(c,3)); geo.setIndex(new THREE.BufferAttribute(I,1));
      const mat=q.m&&!q.e&&MADE[q.m]?made(q.m):q.m==='jet'?new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false}):new THREE.MeshLambertMaterial({vertexColors:true,...(q.e?{emissive:new THREE.Color(q.e[0],q.e[1],q.e[2]),emissiveIntensity:Math.min(2,q.k||1)}:{})}), me=new THREE.Mesh(geo,mat); me.castShadow=me.receiveShadow=true; if(q.t)me.userData.t=q.t; g.add(me); } return g; };
  // what a group is made of (its m, tools/fliers-bake.py): paint and chrome shine with the sky in them (one small picture of a sky, made once), rubber does not
  let ENV=null; const MADE={paint:{metalness:.35,roughness:.3},chrome:{metalness:1,roughness:.16},rubber:{metalness:0,roughness:.9}}, MATS={};
  const env=()=>{ if(ENV)return ENV; const e=new THREE.Scene(), g=new THREE.SphereGeometry(40,24,12), p=g.attributes.position, c=new Float32Array(p.count*3), up=new THREE.Color(0x3f78c8), hz=new THREE.Color(0xe9dcc6), dn=new THREE.Color(0x3a3834), k=new THREE.Color();
    for(let i=0;i<p.count;i++){ const h=p.getY(i)/40; if(h>=0)k.copy(hz).lerp(up,Math.pow(h,.5)); else k.copy(hz).multiplyScalar(.6).lerp(dn,Math.pow(-h,.35)); c[i*3]=k.r; c[i*3+1]=k.g; c[i*3+2]=k.b; }
    g.setAttribute('color',new THREE.BufferAttribute(c,3)); e.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
    const sun=new THREE.Mesh(new THREE.SphereGeometry(5,10,8),new THREE.MeshBasicMaterial({color:0xffffff})); sun.material.color.multiplyScalar(5); sun.position.set(14,26,10); e.add(sun);
    const pm=new THREE.PMREMGenerator(renderer); ENV=pm.fromScene(e,.03).texture; pm.dispose(); GLASS.envMap=ENV; GLASS.needsUpdate=true; return ENV; };
  const made=m=>MATS[m]||(MATS[m]=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,envMap:env(),envMapIntensity:1,...MADE[m]}));
  CAR.shine=k=>{ for(const m in MATS)MATS[m].envMapIntensity=k; if(ENV)GLASS.envMapIntensity=k; };
  // the glass: see-through, faintly tinted, both sides; the body drawn from inside too (the shell's inside is its pillars and roof from the seat)
  const GLASS=new THREE.MeshStandardMaterial({color:0xbfdfe8,transparent:true,opacity:.24,roughness:.05,metalness:.2,side:THREE.DoubleSide,depthWrite:false});
  const glassPart=G=>{ const g=part(G); g.traverse(o=>{ if(o.isMesh){ o.material=GLASS; o.castShadow=false; o.renderOrder=2; } }); return g; };
  // each car's trim: [seats, door panels and dash, carpet, headliner]
  const TRIM={'muscle-car-60s':[0x6e3f2a,0xcdb48e,0x2a2420,0xe0d6c2],'wedge-coupe-80s':[0x3a3d44,0x7d838c,0x1e2024,0xb8bcc2],'station-wagon-70s':[0x8a5a36,0xc9a77c,0x3a2a1e,0xe2d6bf],'pickup-truck-70s':[0x5a4636,0xb59b78,0x2b2622,0xd6cab2],'camper-van':[0x6b7a4a,0xd9d2b4,0x2f2a24,0xece6d0],'police-cruiser-80s':[0x2f4a6e,0x46628a,0x1c222c,0xcfd6dc],'taxi-coupe':[0x5a3a26,0x3a342c,0x1e1c1a,0xd8d0bc],'taxi-pod':[0x5a3a26,0x3a342c,0x1e1c1a,0xd8d0bc],'ambulance':[0x3d5a78,0xdfe3e6,0x2a3038,0xf0f0ec],'police-flier':[0x2f4a6e,0x46628a,0x1c222c,0xcfd6dc]};
  const dialTex=()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'); g.fillStyle='#14161a'; g.beginPath(); g.arc(64,64,62,0,7); g.fill(); g.strokeStyle='#e8e2d0'; g.lineWidth=3;
    for(let i=0;i<=10;i++){ const a=Math.PI*(.8+1.4*i/10); g.beginPath(); g.moveTo(64+Math.cos(a)*50,64+Math.sin(a)*50); g.lineTo(64+Math.cos(a)*58,64+Math.sin(a)*58); g.stroke(); }
    g.strokeStyle='#e0482c'; g.lineWidth=4; g.beginPath(); g.moveTo(64,64); g.lineTo(64+Math.cos(Math.PI*1.15)*46,64+Math.sin(Math.PI*1.15)*46); g.stroke(); g.fillStyle='#c9a250'; g.beginPath(); g.arc(64,64,6,0,7); g.fill(); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  // the radio's face, one a car: the station's call letters and the playing record lit amber, dark when it is off
  const radioFace=()=>{ const c=document.createElement('canvas'); c.width=256; c.height=96; const g=c.getContext('2d'), t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
    const draw=(top,sub)=>{ const gr=g.createLinearGradient(0,0,0,96); gr.addColorStop(0,'#d8dade'); gr.addColorStop(1,'#8a8e94'); g.fillStyle=gr; g.fillRect(0,0,256,96);
      g.fillStyle=top?'#1a1208':'#0a0806'; g.fillRect(56,14,144,46); if(top){ g.fillStyle='#ffb347'; g.font='bold 24px monospace'; g.fillText(top,64,38); g.font='11px monospace'; g.fillText((sub||'').slice(0,20),64,54); }
      g.fillStyle='#2a2c30'; for(let i=0;i<5;i++)g.fillRect(64+i*26,66,20,14); g.fillStyle='#0c0d0f'; g.beginPath(); g.arc(28,48,18,0,7); g.arc(228,48,18,0,7); g.fill(); t.needsUpdate=true; };
    draw('',''); return {t,draw}; };
  let DIAL=null;
  // the inside, fitted to the cabin the bake cut open (cab: its half width, window line, ends and roof): carpet, headliner, door panels with armrests and handles, the dashboard (two lit gauges, the radio), the steering wheel on its column, pedals, mirror, visors, the seats with their seat belts, the cabin's back wall
  const cabin=(model,K,width)=>{ const C=TRIM[model]; if(!C||!K)return null; const g=new THREE.Group(), L=o=>new THREE.MeshLambertMaterial({...o,emissive:new THREE.Color(o.color).multiplyScalar(.28)}), mSeat=L({color:C[0]}), mTrim=L({color:C[1]}), mCarpet=L({color:C[2]}), mHead=L({color:C[3],side:THREE.DoubleSide}), mDark=L({color:0x1a1b1e}), mBelt=L({color:0x4a4e56}), mChrome=new THREE.MeshStandardMaterial({color:0xd0d4d8,metalness:.8,roughness:.25,envMap:SKY.probe||null,envMapIntensity:.65});
    const bx=(w,h,d,m,x,y,z,rx=0)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); me.position.set(x,y,z); me.rotation.x=rx; me.castShadow=me.receiveShadow=true; g.add(me); return me; };
    const UP=new THREE.Vector3(0,1,0), strap=(a,b)=>{ const d=new THREE.Vector3().subVectors(b,a), me=new THREE.Mesh(new THREE.BoxGeometry(.055,d.length(),.01),mBelt); me.position.copy(a).addScaledVector(d,.5); me.quaternion.setFromUnitVectors(UP,d.normalize()); g.add(me); };
    const hw=Math.min(K.hw,width/2-.16), belt=K.belt, roof=K.roof-.06, zf=K.z1, zr=K.z0, fl=K.fl||.32, DD=K.dd||Math.max(.36,Math.min(.62,(zf-zr)*.28)), dashB=zf-DD, drv=Math.min(.4,hw-.32), V=(x,y,z)=>new THREE.Vector3(x,y,z);
    const seatZ=K.seat??Math.max(zr+.45,dashB-.82), rearZ=K.rear??seatZ-.98, rear=K.rear!=null||(K.rows!==1&&rearZ-.38>zr), bench=/muscle|wagon|pickup|cruiser|taxi/.test(model), WZ=Math.max(seatZ+.42,dashB-.26);   // WZ: the steering wheel, a forearm in front of the seat
    bx(hw*2,.04,zf-zr,mCarpet,0,fl,(zf+zr)/2);   // the carpet
    bx(hw*2,belt-fl,.04,mTrim,0,(belt+fl)/2,zr+.02);   // the cabin's back wall
    if(roof-belt>.25){ const hl=bx(hw*2-.1,.03,(zf-zr)*.7,mHead,0,roof-.08,(zf+zr)/2); hl.userData.head=1; }   // the headliner, well under the roof
    if(!K.doors)for(const sd of [-1,1]){ bx(.05,belt-fl,zf-zr-.06,mTrim,sd*hw,(belt+fl)/2,(zf+zr)/2); bx(.12,.05,.6,mSeat,sd*(hw-.07),belt-.16,seatZ+.1); bx(.03,.03,.12,mChrome,sd*(hw-.04),belt-.07,seatZ+.42); }   // door panels, armrests, handles
    // the dashboard: up to the window line and on to the windscreen, the hood over the gauges, two lit dials before the driver, the radio in the middle, a glovebox line
    bx(hw*2,belt-fl-.1,DD+.02,mTrim,0,(belt+fl+.1)/2,dashB+DD/2); bx(hw*2,.05,DD+.04,mDark,0,belt-.02,dashB+DD/2);
    bx(.42,.07,.14,mDark,drv,belt+.01,dashB+.05);
    DIAL=DIAL||dialTex(); for(const dx of [-.1,.1]){ const d=new THREE.Mesh(new THREE.CircleGeometry(.07,24),new THREE.MeshBasicMaterial({map:DIAL})); d.position.set(drv+dx,belt-.09,dashB-.005); d.rotation.y=Math.PI; g.add(d); }
    const RF=radioFace(); const rd=new THREE.Mesh(new THREE.PlaneGeometry(.26,.1),new THREE.MeshBasicMaterial({map:RF.t})); rd.position.set(0,belt-.15,dashB-.005); rd.rotation.y=Math.PI; g.add(rd);
    bx(.3,.005,.01,mDark,-drv,belt-.2,dashB-.003);
    // the steering wheel on its column, turned by the steering
    const sw=new THREE.Group(); sw.position.set(drv,belt-.06,WZ); sw.rotation.x=-1.0; g.add(sw);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.17,.018,8,28),mDark); sw.add(rim); for(const a of [0,2.1,4.2]){ const sp=new THREE.Mesh(new THREE.BoxGeometry(.15,.022,.012),mChrome); sp.position.set(Math.cos(a)*.08,Math.sin(a)*.08,0); sp.rotation.z=a; sw.add(sp); }
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.03,16),mChrome); hub.rotation.x=Math.PI/2; sw.add(hub);
    const col=new THREE.Mesh(new THREE.CylinderGeometry(.025,.03,.3,10),mDark); col.position.set(drv,belt-.11,(WZ+dashB)/2); col.rotation.x=-1.0+Math.PI/2; g.add(col);
    bx(.03,.12,.03,mChrome,drv+.11,belt-.05,(WZ+dashB)/2,-.5);   // the column shifter
    const ped=[-.12,0,.1].map(dx=>bx(.07,.02,.09,mDark,drv+dx,fl+.12,dashB+.1,-.9));   // the pedals
    if(roof-belt>.25){ bx(.2,.06,.02,mDark,0,roof-.13,zf-.3); for(const sd of [-1,1])bx(.36,.02,.18,mHead,sd*.33,roof-.08,zf-.33); }   // the mirror and the sun visors
    // the seats: a bench or two buckets in front, a bench behind when there's room; a three-point belt for each place, its buckle by the hip
    const seat=(x,w,z)=>{ bx(w,.14,.5,mSeat,x,fl+.04,z); bx(w,.55,.12,mSeat,x,fl+.36,z-.27,-.18); if(!bench)bx(w*.6,.16,.1,mSeat,x,fl+.72,z-.33); };
    const belt3=(x,z,sd)=>{ const top=V(sd*(hw-.06),Math.min(roof-.12,fl+.7),z-.2), hip=V(x-sd*.2,fl+.14,z-.02), out=V(sd*(hw-.07),fl+.14,z-.02); strap(top,hip); strap(out,hip); bx(.05,.05,.03,mChrome,hip.x,hip.y,hip.z); };
    if(bench)seat(0,hw*2-.12,seatZ); else for(const x of [drv,-drv])seat(x,.5,seatZ); for(const x of [drv,-drv])belt3(x,seatZ,Math.sign(x));
    if(rear){ seat(0,hw*2-.12,rearZ); for(const x of [drv,-drv])belt3(x,rearZ,Math.sign(x)); }
    if(CARX.cabin)CARX.cabin(model,g,{bx,hw,belt,roof,zf,zr,fl,dashB,drv,seatZ,rearZ,mDark,mChrome,mTrim,mSeat});
    g.userData={sw,ped,radio:RF,seat:V(drv,fl+.11,Math.max(seatZ-.08,WZ-.32)),fit:Math.max(.6,Math.min(1,(roof-.08-fl-.11)*BIG/1.01)),eye:V(drv,Math.max(belt+.22,roof-.13),seatZ-.12)}; return g; };
  // a car in metres under one group scaled to the world: its body, a wheel at each corner (fl, fr, rl, rr; the right ones turned round), forward +z
  const build=model=>{ const D=DATA.cars[model], G=new THREE.Group(), B=part(D.body); B.name='BODY'; B.traverse(o=>{ if(o.isMesh)o.material.side=THREE.DoubleSide; }); G.add(B); if(D.glass&&D.glass.length){ const GL=glassPart(D.glass); GL.name='GLASS'; G.add(GL); const I=cabin(model,D.cab,D.size[0]); if(I){ I.name='INSIDE'; G.add(I); G.userData.cab=I.userData; } }
    const PT={}; for(const p of D.parts||[]){ const o=new THREE.Group(), b=part(p.g); o.name=p.n; o.position.set(p.at[0],p.at[1],p.at[2]); b.traverse(q=>{ if(q.isMesh)q.material.side=THREE.DoubleSide; }); o.add(b); if(p.gl&&p.gl.length)o.add(glassPart(p.gl)); G.add(o); PT[p.n]=o; }
    if(CARX.build)CARX.build(model,D,G,PT); const W=part(D.wheel), wh=D.wheels.map((w,i)=>{ const o=new THREE.Group(); o.name='WHEEL '+['FL','FR','RL','RR'][i]; o.position.set(w[0],w[1],w[2]); const inner=i?W.clone():W; if(i===1||i===3)inner.rotation.y=Math.PI; o.add(inner); G.add(o); return o; });
    G.userData.wh=wh; G.scale.setScalar(M1); CAR.cab(G); return VLOOK.dress('car:'+model,G); };

  /* ---------- each model a RIDE kind boarded where it stands, on VEH ---------- */
  const POSE={k:'car',steer:0,z:0};
  const MV=M0*ZU*24/TILE, EDGE=EB&&{x0:Math.min(X(EB[0]),X(EB[2])),x1:Math.max(X(EB[0]),X(EB[2])),z0:Math.min(Z(EB[1]),Z(EB[3])),z1:Math.max(Z(EB[1]),Z(EB[3]))}, surf=(x,z,y)=>VEH.surf(x,z,y,1.2*M0,MV);
  const flyKind=model=>{ const D=DATA.cars[model], F={x:0,y:0,z:0,hd:0,vf:0,vy:0,turn:0,pitch:0,bank:0,down:true};
    const k=KINDS[model]={name:D.name,world:true,cat:'cars',fly:true,F,V:{on:false,steer:0,drop:()=>{}},hint:'SPACE UP · SHIFT DOWN · W GO · S BACK · A D TURN',seat:(m,o)=>{ const c=m.userData.cab; return c?o.copy(c.seat):o.set(0,.5,0); },fit:m=>{ const c=m.userData.cab; return c?c.fit:1; },make:()=>build(model),lift:.001,hop:false,knock:1e9,ease:1e3,dry:true,
      on:()=>{ Object.assign(F,{x:pos.x,z:pos.z,y:surf(pos.x,pos.z),hd:SHARED.heading,vf:0,vy:0,turn:0,pitch:0,bank:0,down:true}); }, off:()=>{},
      pose:()=>{ POSE.steer=F.turn*.4; return POSE; }, floor:(g,R)=>R.y!=null?R.y:g,
      step:(R,dt)=>{ const f=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0), tr=(keys.has('a')||keys.has('arrowleft')?1:0)-(keys.has('d')||keys.has('arrowright')?1:0), v=(keys.has(' ')?1:0)-(keys.has('shift')||keys.has('c')?1:0);
        VEH.fly(F,dt,{f,tr,v,ready:true,vmax:24*M0*SPEED.of('cars'),vback:5*M0,vup:5*MV,turn:1.2,top:120*MV,B:EDGE,surf,r:1.6*M0,mv:MV,slow:1.5*M0,bankAt:8*M0,tall:2*MV,vref:24*M0}); k.V.steer=F.turn*.3; k.V.on=!F.down;
        pos.x=F.x; pos.z=F.z; R.hd=SHARED.heading=F.hd; R.v=Math.abs(F.vf); R.y=F.y; st.move=null; st.ride=POSE; return true; },
      place:(m,R,t)=>{ const cb=m.userData.cab; if(R===RIDE){ k.m=m; m.rotation.set(F.pitch*.6,F.hd,F.bank); if(cb)cb.sw.rotation.z=F.turn*1.5; } if(CARX.place)CARX.place(model,m,R===RIDE?mine:null); } };
    RIDE.kind('car:'+model,k); return k; };
  // a car that dives (dive in its model: the submersible) rides under the river: W and S go and back, A and D turn, SPACE rises, SHIFT sinks, from the surface to just over the bed
  const top=D=>RIVER.box.lv-D.draft*M1, bedOf=(x,z)=>RIVER.box.lv-RIVER.depthAt(x,z)*M0;
  const diveKind=model=>{ const D=DATA.cars[model], F={x:0,y:0,z:0,hd:0,vf:0,vy:0,turn:0,down:true}; let hT=0;
    const k=KINDS[model]={name:D.name,world:true,cat:'cars',dive:true,F,V:{on:false,steer:0,drop:()=>{}},hint:'SPACE UP · SHIFT DOWN · W GO · S BACK · A D TURN',seat:(m,o)=>o.set(D.seat[0],D.seat[1],D.seat[2]),fit:()=>.8,make:()=>build(model),lift:.001,hop:false,knock:1e9,ease:1e3,dry:true,
      on:()=>{ Object.assign(F,{x:pos.x,z:pos.z,y:top(D),hd:SHARED.heading,vf:0,vy:0,turn:0,down:true}); }, off:()=>{}, pose:()=>POSE, floor:(g,R)=>R.y!=null?R.y:g,
      step:(R,dt)=>{ const f=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0), tr=(keys.has('a')||keys.has('arrowleft')?1:0)-(keys.has('d')||keys.has('arrowright')?1:0), v=(keys.has(' ')?1:0)-(keys.has('shift')||keys.has('c')?1:0), K=SPEED.of('cars');
        F.vf+=((f>0?4.5:2)*f*M0*K-F.vf)*Math.min(1,dt*1.2); F.vy+=(v*2.2*M0*K-F.vy)*Math.min(1,dt*1.6); F.turn+=(tr*.9-F.turn)*Math.min(1,dt*2.5); F.hd+=F.turn*dt;
        const nx=F.x+Math.sin(F.hd)*F.vf*dt, nz=F.z+Math.cos(F.hd)*F.vf*dt, m=2.2*M1; if(RIVER.over(nx-m,nz-m)&&RIVER.over(nx+m,nz+m)&&!(RIVER.onPier&&RIVER.onPier(nx,nz,m*.8))){ F.x=nx; F.z=nz; } else F.vf*=-.2;
        const y1=top(D), y0=Math.min(y1,bedOf(F.x,F.z)+.45*M1); F.y=Math.max(y0,Math.min(y1,F.y+F.vy*dt)); if(F.y<=y0||F.y>=y1)F.vy=0; F.down=F.y>=y1-.15*M1; k.depth=(y1-F.y)/M0; if(k.depth>2&&!k.lit&&mine&&CARX.parts){ k.lit=1; if(!(CARX.parts.bits(mine)&256))CARX.parts.toggle(mine,'head'); } if(k.depth<1)k.lit=0; FLOW.craft=!!(mine&&CARX.parts&&CARX.parts.bits(mine)&256); k.V.steer=F.turn*.3; k.V.on=!F.down;
        pos.x=F.x; pos.z=F.z; R.hd=SHARED.heading=F.hd; R.v=Math.abs(F.vf)+Math.abs(F.vy); R.y=F.y; st.move=null; st.ride=POSE;
        if((hT-=dt)<=0){ hT=.4; HUD.querySelector('span').textContent=k.name+' · DEPTH '+Math.round(k.depth)+' M · '+k.hint; } return true; },
      place:(m,R,t)=>{ if(R===RIDE){ k.m=m; m.rotation.set(-F.vy/(2.2*M0)*.12,F.hd,-F.turn*.08); const w=m.userData.wh; for(let i=0;i<4;i++)w[i].children[0].rotation.z+=(i<2?F.vf/(4.5*M0):F.vy/(2.2*M0)+F.vf/(9*M0))*.5+.02; } if(CARX.place)CARX.place(model,m,R===RIDE?mine:null); } };
    RIDE.kind('car:'+model,k); return k; };
  // its vehicle at the size the owner gave its look (VLOOK 'car:<model>'): the body, wheels and springs grow with it
  const specFor=model=>{ const D=DATA.cars[model], [w,h,L]=D.size, r=D.r, rest=.15, top=D.low+h, S=M1*VLOOK.scaleOf('car:'+model);
    return {half:[w*.46*S,(top-.25)/2*S,L*.47*S],cy:((top+.25)/2-r)*S,lift:(r+.05)*S,mass:1200,wheels:D.wheels.map(q=>[q[0]*S,(q[1]-r+rest)*S,q[2]*S]),r:r*S,rest:rest*S,travel:.12*S,stiff:30,grip:3,
      engine:2400*M0,reverse:1200*M0,vmax:20*M0,vback:4*M0,brake:50*M0,idle:5*M0,steer:.55,steerFade:8*M0,knockR:1.6*S,down:r*S,wy:D.wheels[0][1],unit:S}; };
  const kindFor=model=>{ if(KINDS[model])return KINDS[model]; if(DATA.cars[model].dive)return diveKind(model); if(DATA.cars[model].fly)return flyKind(model); const D=DATA.cars[model], V=VEH.make(specFor(model));
    const k=KINDS[model]={name:D.name,world:true,cat:'cars',V,seat:(m,o)=>{ const c=m.userData.cab; return c?o.copy(c.seat):o.set(0,.5,0); }, fit:m=>{ const c=m.userData.cab; return c?c.fit:1; },make:()=>build(model),lift:.001,acc:4,turn:1.4,drag:1.2,knock:99,hop:false,ease:20,
      on:()=>{ if(!PB.R)PB.load(); }, off:()=>V.drop(),
      pose:R=>{ POSE.steer=V.on?V.steer*2:0; return POSE; },
      step:(R,dt)=>{ if(!V.step(R))return false; st.ride=POSE; return true; },
      place:(m,R,t)=>{ const w=m.userData.wh, cb=m.userData.cab; if(cb)cb.sw.rotation.z=(R===RIDE&&V.on?V.steer:0)*5; if(R===RIDE)k.m=m; if(CARX.place)CARX.place(model,m,R===RIDE?mine:null); if(R===RIDE&&V.place(m,w))return; m.position.y=SHARED.groundY(m.position.x,m.position.z); for(let i=0;i<4;i++)w[i].rotation.x+=(R.v||0)*.02; } };
    RIDE.kind('car:'+model,k); return k; };

  /* ---------- parked: drawn where the section says, solid, a thing to double-click ---------- */
  const yOf=C=>DATA.cars[C.model].dive&&RIVER.box?top(DATA.cars[C.model]):SHARED.groundY(C.x,C.z);
  const at=C=>{ if(!C.mesh)return; C.mesh.position.set(C.x,yOf(C),C.z); C.mesh.rotation.set(0,C.hd,0); C.mesh.visible=!C.by;
    const D=DATA.cars[C.model], ls=VLOOK.scaleOf('car:'+C.model), hw=D.size[0]/2*M1*ls, hl=D.size[2]/2*M1*ls, c=Math.abs(Math.cos(C.hd)), s=Math.abs(Math.sin(C.hd)), ex=hw*c+hl*s, ez=hw*s+hl*c;
    if(!C.sol){ C.sol=[0,0,0,0]; SOL.up.push(C.sol); } if(C.by){ C.sol[0]=C.sol[2]=C.sol[1]=C.sol[3]=-1e7; return; } C.sol[0]=C.x-ex; C.sol[1]=C.z-ez; C.sol[2]=C.x+ex; C.sol[3]=C.z+ez; };
  const moorAt=C=>{ if(!C.moor||C.moored||!RIVER.box||RIVER.fpier==null)return false; C.moored=1; if(!(ONLINE.world||{})['car:'+C.id]){ C.x=RIVER.fpier+C.moor[0]*T; C.z=RIVER.box.z1-C.moor[1]*T; C.hd=Math.PI; } return true; };
  const show=()=>{ for(const C of CARS.values()){ if(!DATA.cars[C.model])continue; moorAt(C); kindFor(C.model); if(!C.mesh){ C.mesh=build(C.model); C.mesh.userData.anyRoom=false; scene.add(C.mesh); const D=DATA.cars[C.model];
        if(inMap(C)&&CARX.things)CARX.things(C,D);
        if(inMap(C))UI.thing({name:D.name,obj:C.mesh,reach:1.8*M1+D.size[2]/2*M1,near:3*M1+D.size[2]/2*M1,tall:D.size[1]*M1,act:()=>getIn(C.id)}); } at(C); } };
  const fromWorld=(k,v)=>{ const C=CARS.get(k.slice(4)); if(!C||typeof v!=='string')return; const a=v.split(',').map(Number); if(a.length<3||!a.every(isFinite))return; C.x=a[0]; C.z=a[1]; C.hd=a[2]; at(C); };
  SYS.add('world',(k,v)=>{ if(typeof k==='string'&&k.startsWith('car:'))fromWorld(k,v); },'150p-cars');
  SYS.add('hi',m=>{ for(const C of CARS.values())C.by=m.cars&&m.cars[C.id]||null; for(const k in ONLINE.world||{})if(k.startsWith('car:'))fromWorld(k,ONLINE.world[k]); if(DATA)for(const C of CARS.values())at(C); },'150p-cars');

  /* ---------- in and out ---------- */
  const HUD=document.createElement('div'); HUD.id='carhud'; HUD.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:12;display:none;gap:10px;align-items:center;padding:6px 10px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#ece5d3;background:#0e1016e0;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  const BTN='font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 8px;cursor:pointer';
  HUD.innerHTML='<span></span><button data-r style="'+BTN+'">RADIO (T)</button><button data-o style="'+BTN+'">GET OUT (F)</button>'; document.body.appendChild(HUD); HUD.querySelector('[data-o]').onclick=()=>getOut(); HUD.querySelector('[data-r]').onclick=()=>RAD.next();
  const board=id=>{ '@later'; const C=CARS.get(id), k=C&&kindFor(C.model); if(!k)return; C.by=ONLINE.me||'me'; at(C); pos.x=C.x; pos.z=C.z; SHARED.py=SHARED.groundY(C.x,C.z); SHARED.heading=C.hd; k.V.x=C.x; k.V.z=C.z; k.V.hd=C.hd;
    if(!RIDE.mount('car:'+C.model)){ C.by=null; at(C); if(ONLINE.on)ONLINE.send({t:'car',k:id,on:0}); return; } k.V.x=k.V.z=k.V.hd=null; mine=C; UI.distMin=Math.max(1.2*TILE,DATA.cars[C.model].size[0]*M1); CAR.v0=UI.view; UI.setView('third'); HUD.querySelector('span').textContent=k.name+' · '+(k.hint||'W GO · S BRAKE · A D STEER · Q E LOOK'); HUD.style.display='flex'; say('YOU GET IN THE '+k.name+'.');
    SFX.play('car_door_open',{vol:.8}); SFX.play('car_door_close',{vol:.8,delay:.6}); SFX.play('car_start',{vol:.7,delay:1}); };
  const getIn=id=>{ '@later'; const C=CARS.get(id); if(!C||!DATA||!inMap(C))return; if(DATA.cars[C.model].dive&&!RIVER.box)return; if(mine)return; if(RIDE.on)return say('GET OFF WHAT YOU ARE RIDING FIRST.','#c8a090'); if(C.by&&C.by!==ONLINE.me)return say('SOMEONE IS DRIVING IT.','#c8a090');
    if(ONLINE.on&&ONLINE.me){ want=id; ONLINE.send({t:'car',k:id,on:1}); setTimeout(()=>{ if(want===id){ want=null; say('THE CAR DID NOT ANSWER. TRY AGAIN.','#c8a090'); } },4000); } else board(id); };
  const getOut=()=>{ '@later'; const C=mine; if(!C)return; { const k=KINDS[C.model]; if(k&&k.fly&&!(k.F.down&&k.F.y<=SHARED.groundY(pos.x,pos.z)+.1*MV))return say('LAND ON THE STREET FIRST: SHIFT TAKES YOU DOWN.','#c8a090'); if(k&&k.dive&&!k.F.down)return say('COME UP FIRST: SPACE TAKES YOU TO THE SURFACE.','#c8a090'); } SFX.play('car_stop',{vol:.7}); SFX.play('car_door_open',{vol:.8,delay:.5}); SFX.play('car_door_close',{vol:.8,delay:1.1}); RAD.tune(C,0); mine=null; UI.distMin=null; HUD.style.display='none'; C.x=pos.x; C.z=pos.z; C.hd=SHARED.heading; C.by=null; RIDE.off('YOU GET OUT AND LEAVE IT PARKED.'); if(CAR.v0&&CAR.v0!==UI.view)UI.setView(CAR.v0); CAR.v0=null; if(ONLINE.on)ONLINE.send({t:'car',k:C.id,on:0,at:[C.x,C.z,C.hd]}); at(C);
    const D=DATA.cars[C.model], s=(D.size[0]/2*VLOOK.scaleOf('car:'+C.model)+.7)*M1; pos.x=C.x-Math.cos(C.hd)*s; pos.z=C.z+Math.sin(C.hd)*s; SHARED.py=SHARED.groundY(pos.x,pos.z); };
  // the car you drive carries its lamps (150pc), measured once from its model standing straight
  const DIMS={}; CARLAMPS.src.push(out=>{ const C=mine; if(!C||!C.mesh)return; const m=C.mesh; let d=DIMS[C.model]; if(!d){ const r=m.rotation.y, p=m.position.clone(); m.rotation.set(0,0,0); m.position.set(0,0,0); const b=new THREE.Box3().setFromObject(m); m.rotation.set(0,r,0); m.position.copy(p); m.updateMatrixWorld(); d=DIMS[C.model]=[b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z,b.min.y]; }
    if(DATA.cars[C.model].dive){ if(CARX.parts&&CARX.parts.bits(C)&256)out.push({x:pos.x,y:SHARED.py,z:pos.z,r:SHARED.heading,dim:d,own:true,fly:true,always:true}); return; } out.push({x:pos.x,y:SHARED.py,z:pos.z,r:SHARED.heading,dim:d,own:!!DATA.cars[C.model].marks,sp:RIDE.v||0,me:1}); });
  CAR.getIn=getIn; CAR.getOut=getOut; CAR.data=()=>DATA; CAR.hud=HUD; CAR.own=m=>!!(DATA&&DATA.cars[m]&&DATA.cars[m].marks); CAR.flies=m=>!!(DATA&&DATA.cars[m]&&DATA.cars[m].fly); CAR.fliers=()=>DATA?Object.keys(DATA.cars).filter(m=>DATA.cars[m].fly):[]; CAR.build=m=>DATA&&DATA.cars[m]?build(m):null;
  ONLINE.hear.car=m=>{ '@later'; const C=CARS.get(m.k); if(!C){ for(const f of VEH.hear||[])f(m); return; }   // another thing you drive on the same lock (the helicopters, VEH.hear)
  if(m.no){ if(want===m.k){ want=null; say('SOMEONE IS DRIVING IT.','#c8a090'); } C.by=m.by; if(DATA)at(C); return; }
    if(typeof m.at==='string')fromWorld('car:'+m.k,m.at); if(m.by&&m.by===ONLINE.me){ if(want===m.k){ want=null; board(m.k); } return; } if(mine===C&&!m.by)return; if(!!C.by!==!!m.by&&C.mesh)SFX.play('car_door_close',{at:{x:C.x,z:C.z},vol:.8,far:14*T}); C.by=m.by||null; if(DATA)at(C); };
  addEventListener('keydown',e=>{ if(!mine||e.repeat||/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||''))return; const k=(e.key||'').toLowerCase(); if(k==='f'){ e.preventDefault(); getOut(); } else if(k==='t'){ e.preventDefault(); RAD.next(); } });
  /* ---------- the radio: four stations of public-domain records (data/radio.json, the Library of Congress's National Jukebox), each one loop that
     plays the same moment for everyone (the clock's seconds); the driver tunes it (T or RADIO), kept in the section's world as radio:<car>;
     a car plays only while someone drives it (getting out turns it off); heard full in the car, muffled through its body out to 25 tiles ---------- */
  const RAD={data:null,ctx:null,ch:{},vol:.8,asked:false};
  const stOf=C=>+((ONLINE.world||{})['radio:'+C.id])||0, station=n=>RAD.data&&RAD.data.stations[n-1];
  const nowAt=S=>{ const t=(Date.now()/1000)%S.len; let k=S.tracks[0]; for(const q of S.tracks)if(q.at<=t)k=q; return {t,k}; };
  const faces=C=>{ const out=[]; if(C.mesh&&C.mesh.userData.cab)out.push(C.mesh.userData.cab.radio); const k=KINDS[C.model]; if(mine===C&&k&&k.m&&k.m.userData.cab)out.push(k.m.userData.cab.radio); return out; };
  const showRadio=C=>{ '@later'; const S=station(stOf(C)); for(const f of faces(C))if(f){ const n=S?nowAt(S).k:null; f.draw(S?S.call:'',n?n.title:''); }
    if(mine===C){ const k=KINDS[C.model], n=S&&nowAt(S).k; HUD.querySelector('span').textContent=k.name+(S?' · '+S.call+' '+S.name+(n?' · '+n.title.toUpperCase()+(n.year?' ('+n.year+')':''):''):' · '+(k.hint||'W GO · S BRAKE · A D STEER · Q E LOOK')); HUD.querySelector('[data-r]').textContent=S?'RADIO: '+S.call+' (T)':'RADIO (T)'; } };
  RAD.tune=(C,n)=>{ if(!C)return; if(stOf(C)===n)return; ONLINE.put('radio:'+C.id,n); showRadio(C); };
  RAD.next=()=>{ '@later'; if(!mine)return; wake(); if(!RAD.data){ if(!RAD.asked){ RAD.asked=true; RADJ().then(d=>{ RAD.data=d; RAD.next(); }).catch(e=>console.warn('CARS: the radio did not load',e)); } return; }
    const n=(stOf(mine)+1)%(RAD.data.stations.length+1); RAD.tune(mine,n); const S=station(n); say(S?'THE RADIO: '+S.call+', '+S.name+'.':'THE RADIO IS OFF.'); };
  const wake=()=>{ if(RAD.data)RAD.ctx=SFX.wake(); };
  addEventListener('pointerdown',wake); addEventListener('keydown',wake);
  const chan=S=>{ '@later'; let c=RAD.ch[S.id]; if(c||!RAD.ctx)return c; const a=new Audio(RFILE[S.id]); a.preload='auto'; a.loop=true; const x=RAD.ctx, src=x.createMediaElementSource(a), lp=x.createBiquadFilter(), g=x.createGain(), pan=SFX.spot(x,true);
    lp.type='lowpass'; lp.frequency.value=900; g.gain.value=0; src.connect(lp); lp.connect(g); g.connect(pan); pan.connect(SFX.out(x)); return RAD.ch[S.id]={a,lp,g,pan,quiet:0,chk:0}; };
  const NOW=()=>performance.now()/1000;
  // the radio you hear best, told to the device (Media Session): its name on the lock screen, the next-track key turning your car's dial
  let mKey='', mT=0; const media=()=>{ const MS=navigator.mediaSession; if(!MS||!window.MediaMetadata||NOW()<mT)return; mT=NOW()+1; let S=null, k=0; for(const q of RAD.data.stations){ const b=RAD.best[q.id]; if(b&&b.k>k){ k=b.k; S=q; } }
    const n=S&&nowAt(S).k, key=S?S.id+'|'+(n?n.title:''):''; if(key===mKey)return; mKey=key;
    MS.metadata=S?new MediaMetadata({title:n&&n.title?n.title+(n.year?' ('+n.year+')':''):S.name,artist:S.call+' '+S.name,album:'THE MARKET RADIO'}):null; MS.playbackState=S?'playing':'none';
    try{ MS.setActionHandler('nexttrack',S?()=>RAD.next():null); }catch(e){} };
  let rT=0, fT=0;
  // a room's source (a jukebox): heard whole by whoever is in its room; one with its own set (an apartment's radio, 150fb) keeps its station (st), volume (vol), where it is heard (here) and where it stands (at: quieter as you walk away, gone at R)
  const inRoom=s=>s.here?!!s.here():!!s.room&&((ROOMS.offIn&&ROOMS.offIn()===s.room)||!!(ROOMS.cur&&ROOMS.cur.id===s.room));
  const sOf=s=>s.st?(+s.st()||0):stOf(s);
  RADIO.load=()=>RAD.data?Promise.resolve(RAD.data):RADJ().then(d=>{ RAD.data=d; RAD.asked=true; wake(); return d; });
  RADIO.wake=()=>wake(); RADIO.nowAt=S=>nowAt(S).k;
  RADIO.now=id=>{ const s=RADIO.src.get(id), S=s&&station(sOf(s)); if(!S)return null; const n=nowAt(S).k; return {call:S.call,name:S.name,title:n?n.title:''}; };
  RADIO.next=id=>{ '@later'; const s=RADIO.src.get(id); if(!s)return 0; wake(); if(!RAD.data){ if(!RAD.asked){ RAD.asked=true; RADJ().then(d=>{ RAD.data=d; RADIO.next(id); }).catch(()=>{}); } return 0; }
    const n=(stOf(s)+1)%(RAD.data.stations.length+1); ONLINE.put('radio:'+id,n); const S=station(n); say(S?'THE JUKEBOX: '+S.call+', '+S.name+'.':'THE JUKEBOX IS OFF.'); return n; };
  SYS.add('life',dt=>{ if((!DATA&&!RADIO.src.size)||(rT-=dt||0)>0)return; rT=.1; const on=[...CARS.values()].filter(C=>stOf(C)&&(C===mine||C.by)), rooms=[...RADIO.src.values()].filter(s=>sOf(s)&&inRoom(s));
    if((on.length||rooms.length)&&!RAD.data&&!RAD.asked){ RAD.asked=true; RADJ().then(d=>{ RAD.data=d; for(const C of CARS.values())showRadio(C); }).catch(()=>{}); }
    if(!RAD.data)return; if((fT-=.1)<=0){ fT=2; for(const C of CARS.values())if(stOf(C)||C===mine)showRadio(C); }
    const up=SHARED.LVL==='up'&&!ROOMS.cur, best={};
    for(const C of on){ const S=station(stOf(C)); if(!S)continue; let x=C.x, z=C.z, inside=C===mine;
      if(!inside){ const o=ONLINE.others&&ONLINE.others.get(C.by), g=o&&o.fig&&o.fig.g; if(g){ x=g.position.x; z=g.position.z; } }
      const d=inside?0:Math.hypot(pos.x-x,pos.z-z)/T, k=inside?1:up?.55*Math.max(0,1-d/25)**1.5:0; if(k>((best[S.id]||{}).k||0))best[S.id]={k,inside,x,z}; } for(const s of rooms){ const S=station(sOf(s)); if(!S)continue; let k=s.vol??.7, x=pos.x, z=pos.z, pan=false;
      if(s.at){ const p=s.at(); if(p){ const d=Math.hypot(pos.x-p.x,pos.z-p.z); k*=Math.max(0,1-d/(s.R||10*T))**1.4; x=p.x; z=p.z; pan=true; } }
      if(k>((best[S.id]||{}).k||0))best[S.id]={k,inside:true,pan,x,z}; } RAD.best=best; media();
    for(const S of RAD.data.stations){ const b=best[S.id], c=b&&b.k>0?chan(S):RAD.ch[S.id]; if(!c)continue; const x=RAD.ctx, t=x.currentTime;
      if(b&&b.k>0){ c.quiet=0; const nw=NOW(); c.g.gain.setTargetAtTime(b.k*RAD.vol,t,.25); c.lp.frequency.setTargetAtTime(b.inside?16000:900,t,.2);
        if(!b.inside||b.pan)c.pan.to(b.x,SHARED.py+TILE,b.z); else c.pan.to();
        const want=(Date.now()/1000)%S.len; if(c.a.paused){ try{ c.a.currentTime=want; }catch(e){} c.a.play().catch(()=>{}); c.chk=nw+3; }
        else if(nw>c.chk){ c.chk=nw+3; const off=Math.abs(c.a.currentTime-want); if(off>1.5&&off<S.len-1.5)try{ c.a.currentTime=want; }catch(e){} } }
      else { c.g.gain.setTargetAtTime(0,t,.2); if(!c.a.paused){ if(!c.quiet)c.quiet=NOW(); else if(NOW()-c.quiet>1.5){ c.a.pause(); c.quiet=0; } } } } },'150p-cars');
  SYS.add('world',k=>{ if(typeof k==='string'&&k.startsWith('radio:')){ const C=CARS.get(k.slice(6)); if(C&&RAD.data)showRadio(C); } },'150p-cars');
  CAR.radio=()=>({loaded:!!RAD.data,best:RAD.best,ctx:RAD.ctx&&RAD.ctx.state,mine:mine&&stOf(mine),ch:Object.fromEntries(Object.entries(RAD.ch).map(([k,c])=>[k,{paused:c.a.paused,t:+c.a.currentTime.toFixed(1),want:RAD.data?+((Date.now()/1000)%RAD.data.stations.find(S=>S.id===k).len).toFixed(1):null,g:+c.g.gain.value.toFixed(2),src:c.a.src.slice(-30)}]))});
  // the ride ended some other way (a fall, a crash): the car parks where it stopped
  SYS.add('life',()=>{ if(FLOW.craft&&!(mine&&KINDS[mine.model]&&KINDS[mine.model].dive&&RIDE.on))FLOW.craft=false; },'150p-cars');
  SYS.add('life',()=>{ if(mine&&!(RIDE.on&&RIDE.on==='car:'+mine.model)){ const C=mine; RAD.tune(C,0); mine=null; UI.distMin=null; HUD.style.display='none'; C.x=pos.x; C.z=pos.z; C.hd=SHARED.heading; C.by=null; if(ONLINE.on)ONLINE.send({t:'car',k:C.id,on:0,at:[C.x,C.z,C.hd]}); if(DATA)at(C); } },'150p-cars');

  // the ground's height is only true near you: a parked car within reach is set on it again now and then
  // a car's inside (seats, dash, belts) is drawn only near you or the camera, in the world (not in a studio or a template)
  const CABS=new Set(), CW=new THREE.Vector3(), NEAR=12*M0; CAR.cab=m=>{ const I=m.getObjectByName('INSIDE'); if(I)CABS.add(I); };
  let cT=0; SYS.add('life',dt=>{ if(!CABS.size||(cT-=dt||0)>0)return; cT=.25; const c=SHARED.cam&&SHARED.cam.position;
    for(const I of CABS){ let r=I; while(r.parent)r=r.parent; if(r!==scene)continue; I.parent.getWorldPosition(CW); I.visible=Math.hypot(CW.x-pos.x,CW.z-pos.z)<NEAR||!!c&&CW.distanceTo(c)<NEAR; } },'150p-carcabs');
  let gT=0; SYS.add('life',dt=>{ if(!DATA||(gT-=dt||0)>0)return; gT=.5; for(const C of CARS.values())if(moorAt(C))at(C); for(const C of CARS.values())if(C.mesh&&C.mesh.visible&&Math.hypot(C.x-pos.x,C.z-pos.z)<60*T)C.mesh.position.y=yOf(C); },'150p-cars');
  /* ---------- the kit fetched after the start ---------- */
  // copies the owner parks (ADMIN > VEHICLE EDITOR, the map's newcars): added and taken away while you play
  CAR.add=c=>{ if(!c||CARS.has(c.id))return; CARS.set(c.id,{id:c.id,model:c.model,x:X(c.x),z:Z(c.y),hd:(c.hd||0)*Math.PI/180,by:null,mesh:null,sol:null,copy:true}); if(DATA)show(); };
  CAR.remove=id=>{ const C=CARS.get(id); if(!C||C.by)return; CARS.delete(id); if(C.mesh){ scene.remove(C.mesh); for(let i=UI.things.length-1;i>=0;i--)if(UI.things[i].obj===C.mesh||UI.things[i].car===C)UI.things.splice(i,1); } if(C.sol)C.sol[0]=C.sol[1]=C.sol[2]=C.sol[3]=-1e7; };
  VLOOK.on(id=>{ if(DATA&&(!id||id.startsWith('car:'))){ for(const C of CARS.values())at(C); for(const m in KINDS)if((!id||id==='car:'+m)&&KINDS[m].V.size)KINDS[m].V.size(specFor(m)); } });
  let asked=false; SYS.add('life',()=>{ if(asked||!SYS.started)return; asked=true; CARD().then(d=>{ DATA=d; for(const m in d.cars)VLOOK.kind('car:'+m,{name:d.cars[m].name,grp:'CARS YOU DRIVE',make:()=>build(m),park:m,traffic:m}); show(); }).catch(e=>console.warn('CARS: the kit did not load',e)); },'150p-cars');
  CAR.dbg=()=>({loaded:!!DATA,cars:[...CARS.values()].map(C=>({id:C.id,model:C.model,x:+(C.x/T+SHARED.BOD.OX).toFixed(1),z:+(C.z/T+SHARED.BOD.OY).toFixed(1),hd:+C.hd.toFixed(2),by:C.by,shown:!!(C.mesh&&C.mesh.visible)})),driving:mine&&mine.id,veh:mine?!!KINDS[mine.model].V.on:false,rb:mine&&KINDS[mine.model].V.rb?(()=>{ const V=KINDS[mine.model].V, p=V.rb.translation(), r=V.rb.rotation(); return {p:[p.x/T+SHARED.BOD.OX,p.y/T,p.z/T+SHARED.BOD.OY].map(v=>+v.toFixed(2)),r:[r.x,r.y,r.z,r.w].map(v=>+v.toFixed(2)),sp:+(V.sp/T).toFixed(2)}; })():null,v:+((RIDE.v||0)/T).toFixed(2)});
}
