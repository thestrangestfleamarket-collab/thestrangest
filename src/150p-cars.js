// THE CARS: the racing-cars kit's six cars (data/cars.json, CC0) parked on Market St (their spots in data/world.json's cars); double-click one to get in and drive it (a RIDE kind boarded where it stands, on VEH: W goes, S brakes and backs, A and D steer); GET OUT (or F) parks it where it stands. The section's server keeps where each car is parked and who drives it, so everyone sees the same cars, one driver a car.
import {SHARED, THREE} from './003-shx.js';
import {ONLINE, PB, pos, RIDE, st, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {LEVEL, SOL, SYS, TILE} from './006-map-pre.js';
import {VEH} from './150o-physmore.js';
const CARD=__LAZY__("data/cars.json");
{ const T=TILE, M1=T/.84, say=(t,c)=>SAY(t,c||'#e8e2cc'), X=SHARED.BOD.XS, Z=SHARED.BOD.ZS;
  const CARS=new Map(), KINDS={}; let DATA=null, mine=null, want=null;
  const CAR={cars:CARS,kinds:KINDS,get driving(){ return mine; }}; window.CARS=CAR;
  for(const c of LEVEL.cars||[])CARS.set(c.id,{id:c.id,model:c.model,x:X(c.x),z:Z(c.y),hd:(c.hd||0)*Math.PI/180,by:null,mesh:null,sol:null});

  /* ---------- the kit's meshes: a part's groups by material (int16 positions over its box, int8 normals, sRGB colours, uint16 indices) ---------- */
  const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const part=G=>{ const g=new THREE.Group(); for(const q of G){ const P=new Int16Array(b64(q.p).buffer), Nn=new Int8Array(b64(q.n).buffer), Cc=b64(q.c), I=new Uint16Array(b64(q.i).buffer), n=P.length/3, p=new Float32Array(n*3), nn=new Float32Array(n*3), c=new Float32Array(n*3);
      for(let v=0;v<n;v++)for(let k=0;k<3;k++){ p[v*3+k]=P[v*3+k]*q.s[k]+q.o[k]; nn[v*3+k]=Nn[v*3+k]/127; c[v*3+k]=Math.pow(Cc[v*3+k]/255,2.2); }
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(p,3)); geo.setAttribute('normal',new THREE.BufferAttribute(nn,3)); geo.setAttribute('color',new THREE.BufferAttribute(c,3)); geo.setIndex(new THREE.BufferAttribute(I,1));
      const mat=new THREE.MeshLambertMaterial({vertexColors:true,...(q.e?{emissive:new THREE.Color(q.e[0],q.e[1],q.e[2]),emissiveIntensity:Math.min(2,q.k||1)}:{})}), me=new THREE.Mesh(geo,mat); me.castShadow=me.receiveShadow=true; g.add(me); } return g; };
  // the glass: see-through, faintly tinted, both sides; the body drawn from inside too (the shell's inside is its pillars and roof from the seat)
  const GLASS=new THREE.MeshStandardMaterial({color:0xbfdfe8,transparent:true,opacity:.24,roughness:.05,metalness:.2,side:THREE.DoubleSide,depthWrite:false});
  const glassPart=G=>{ const g=part(G); g.traverse(o=>{ if(o.isMesh){ o.material=GLASS; o.castShadow=false; o.renderOrder=2; } }); return g; };
  // each car's trim: [seats, door panels and dash, carpet, headliner]
  const TRIM={'muscle-car-60s':[0x6e3f2a,0xcdb48e,0x2a2420,0xe0d6c2],'wedge-coupe-80s':[0x3a3d44,0x7d838c,0x1e2024,0xb8bcc2],'station-wagon-70s':[0x8a5a36,0xc9a77c,0x3a2a1e,0xe2d6bf],'pickup-truck-70s':[0x5a4636,0xb59b78,0x2b2622,0xd6cab2],'camper-van':[0x6b7a4a,0xd9d2b4,0x2f2a24,0xece6d0]};
  const dialTex=()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'); g.fillStyle='#14161a'; g.beginPath(); g.arc(64,64,62,0,7); g.fill(); g.strokeStyle='#e8e2d0'; g.lineWidth=3;
    for(let i=0;i<=10;i++){ const a=Math.PI*(.8+1.4*i/10); g.beginPath(); g.moveTo(64+Math.cos(a)*50,64+Math.sin(a)*50); g.lineTo(64+Math.cos(a)*58,64+Math.sin(a)*58); g.stroke(); }
    g.strokeStyle='#e0482c'; g.lineWidth=4; g.beginPath(); g.moveTo(64,64); g.lineTo(64+Math.cos(Math.PI*1.15)*46,64+Math.sin(Math.PI*1.15)*46); g.stroke(); g.fillStyle='#c9a250'; g.beginPath(); g.arc(64,64,6,0,7); g.fill(); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  const radioTex=()=>{ const c=document.createElement('canvas'); c.width=256; c.height=96; const g=c.getContext('2d'); const gr=g.createLinearGradient(0,0,0,96); gr.addColorStop(0,'#d8dade'); gr.addColorStop(1,'#8a8e94'); g.fillStyle=gr; g.fillRect(0,0,256,96);
    g.fillStyle='#120c06'; g.fillRect(56,18,144,40); g.fillStyle='#ffb347'; g.font='bold 26px monospace'; g.fillText('88.1 FM',70,48); g.fillStyle='#ffb34766'; for(let i=0;i<12;i++)g.fillRect(62+i*11,52,2,4);
    g.fillStyle='#2a2c30'; for(let i=0;i<5;i++)g.fillRect(64+i*26,66,20,14); g.fillStyle='#0c0d0f'; g.beginPath(); g.arc(28,48,18,0,7); g.arc(228,48,18,0,7); g.fill(); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  let DIAL=null, RADIO=null;
  // the inside, fitted to the cabin the bake cut open (cab: its half width, window line, ends and roof): carpet, headliner, door panels with armrests and handles, the dashboard (two lit gauges, the radio), the steering wheel on its column, pedals, mirror, visors, the seats with their seat belts, the cabin's back wall
  const cabin=(model,K,width)=>{ const C=TRIM[model]; if(!C||!K)return null; const g=new THREE.Group(), L=o=>new THREE.MeshLambertMaterial({...o,emissive:new THREE.Color(o.color).multiplyScalar(.28)}), mSeat=L({color:C[0]}), mTrim=L({color:C[1]}), mCarpet=L({color:C[2]}), mHead=L({color:C[3],side:THREE.DoubleSide}), mDark=L({color:0x1a1b1e}), mBelt=L({color:0x4a4e56}), mChrome=new THREE.MeshStandardMaterial({color:0xd0d4d8,metalness:.8,roughness:.25});
    const bx=(w,h,d,m,x,y,z,rx=0)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); me.position.set(x,y,z); me.rotation.x=rx; me.castShadow=me.receiveShadow=true; g.add(me); return me; };
    const UP=new THREE.Vector3(0,1,0), strap=(a,b)=>{ const d=new THREE.Vector3().subVectors(b,a), me=new THREE.Mesh(new THREE.BoxGeometry(.055,d.length(),.01),mBelt); me.position.copy(a).addScaledVector(d,.5); me.quaternion.setFromUnitVectors(UP,d.normalize()); g.add(me); };
    const hw=Math.min(K.hw,width/2-.16), belt=K.belt, roof=K.roof-.06, zf=K.z1, zr=K.z0, fl=.32, DD=Math.max(.36,Math.min(.62,(zf-zr)*.28)), dashB=zf-DD, drv=Math.min(.4,hw-.32), V=(x,y,z)=>new THREE.Vector3(x,y,z);
    const seatZ=Math.max(zr+.45,dashB-.82), rearZ=seatZ-.98, rear=rearZ-.38>zr, bench=/muscle|wagon|pickup/.test(model), WZ=Math.max(seatZ+.42,dashB-.26);   // WZ: the steering wheel, a forearm in front of the seat
    bx(hw*2,.04,zf-zr,mCarpet,0,fl,(zf+zr)/2);   // the carpet
    bx(hw*2,belt-fl,.04,mTrim,0,(belt+fl)/2,zr+.02);   // the cabin's back wall
    if(roof-belt>.25){ const hl=bx(hw*2-.1,.03,(zf-zr)*.7,mHead,0,roof-.08,(zf+zr)/2); hl.userData.head=1; }   // the headliner, well under the roof
    for(const sd of [-1,1]){ bx(.05,belt-fl,zf-zr-.06,mTrim,sd*hw,(belt+fl)/2,(zf+zr)/2); bx(.12,.05,.6,mSeat,sd*(hw-.07),belt-.16,seatZ+.1); bx(.03,.03,.12,mChrome,sd*(hw-.04),belt-.07,seatZ+.42); }   // door panels, armrests, handles
    // the dashboard: up to the window line and on to the windscreen, the hood over the gauges, two lit dials before the driver, the radio in the middle, a glovebox line
    bx(hw*2,belt-fl-.1,DD+.02,mTrim,0,(belt+fl+.1)/2,dashB+DD/2); bx(hw*2,.05,DD+.04,mDark,0,belt-.02,dashB+DD/2);
    bx(.42,.07,.14,mDark,drv,belt+.01,dashB+.05);
    DIAL=DIAL||dialTex(); for(const dx of [-.1,.1]){ const d=new THREE.Mesh(new THREE.CircleGeometry(.07,24),new THREE.MeshBasicMaterial({map:DIAL})); d.position.set(drv+dx,belt-.09,dashB-.005); d.rotation.y=Math.PI; g.add(d); }
    RADIO=RADIO||radioTex(); const rd=new THREE.Mesh(new THREE.PlaneGeometry(.26,.1),new THREE.MeshBasicMaterial({map:RADIO})); rd.position.set(0,belt-.15,dashB-.005); rd.rotation.y=Math.PI; g.add(rd);
    bx(.3,.005,.01,mDark,-drv,belt-.2,dashB-.003);
    // the steering wheel on its column, turned by the steering
    const sw=new THREE.Group(); sw.position.set(drv,belt-.06,WZ); sw.rotation.x=-1.0; g.add(sw);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.17,.018,8,28),mDark); sw.add(rim); for(const a of [0,2.1,4.2]){ const sp=new THREE.Mesh(new THREE.BoxGeometry(.15,.022,.012),mChrome); sp.position.set(Math.cos(a)*.08,Math.sin(a)*.08,0); sp.rotation.z=a; sw.add(sp); }
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.03,16),mChrome); hub.rotation.x=Math.PI/2; sw.add(hub);
    const col=new THREE.Mesh(new THREE.CylinderGeometry(.025,.03,.3,10),mDark); col.position.set(drv,belt-.11,(WZ+dashB)/2); col.rotation.x=-1.0+Math.PI/2; g.add(col);
    bx(.03,.12,.03,mChrome,drv+.11,belt-.05,(WZ+dashB)/2,-.5);   // the column shifter
    for(const dx of [-.12,0,.1])bx(.07,.02,.09,mDark,drv+dx,fl+.12,dashB+.1,-.9);   // the pedals
    if(roof-belt>.25){ bx(.2,.06,.02,mDark,0,roof-.13,zf-.3); for(const sd of [-1,1])bx(.36,.02,.18,mHead,sd*.33,roof-.08,zf-.33); }   // the mirror and the sun visors
    // the seats: a bench or two buckets in front, a bench behind when there's room; a three-point belt for each place, its buckle by the hip
    const seat=(x,w,z)=>{ bx(w,.14,.5,mSeat,x,fl+.1,z); bx(w,.55,.12,mSeat,x,fl+.42,z-.27,-.18); if(!bench)bx(w*.6,.16,.1,mSeat,x,fl+.78,z-.33); };
    const belt3=(x,z,sd)=>{ const top=V(sd*(hw-.06),Math.min(roof-.12,fl+.76),z-.2), hip=V(x-sd*.2,fl+.2,z-.02), out=V(sd*(hw-.07),fl+.2,z-.02); strap(top,hip); strap(out,hip); bx(.05,.05,.03,mChrome,hip.x,hip.y,hip.z); };
    if(bench)seat(0,hw*2-.12,seatZ); else for(const x of [drv,-drv])seat(x,.5,seatZ); for(const x of [drv,-drv])belt3(x,seatZ,Math.sign(x));
    if(rear){ seat(0,hw*2-.12,rearZ); for(const x of [drv,-drv])belt3(x,rearZ,Math.sign(x)); }
    g.userData={sw,seat:V(drv,fl+.17,Math.max(seatZ-.08,WZ-.32)),fit:Math.max(.6,Math.min(1,(roof-.16-fl-.17)/1.07)),eye:V(drv,Math.max(belt+.22,roof-.13),seatZ-.12)}; return g; };
  // a car in metres under one group scaled to the world: its body, a wheel at each corner (fl, fr, rl, rr; the right ones turned round), forward +z
  const build=model=>{ const D=DATA.cars[model], G=new THREE.Group(), B=part(D.body); B.traverse(o=>{ if(o.isMesh)o.material.side=THREE.DoubleSide; }); G.add(B); if(D.glass&&D.glass.length){ const GL=glassPart(D.glass); G.add(GL); const I=cabin(model,D.cab,D.size[0]); if(I){ G.add(I); G.userData.cab=I.userData; } } const W=part(D.wheel), wh=D.wheels.map((w,i)=>{ const o=new THREE.Group(); o.position.set(w[0],w[1],w[2]); const inner=i?W.clone():W; if(i===1||i===3)inner.rotation.y=Math.PI; o.add(inner); G.add(o); return o; });
    G.userData.wh=wh; G.scale.setScalar(M1); return G; };

  /* ---------- each model a RIDE kind boarded where it stands, on VEH ---------- */
  const POSE={k:'car',steer:0,z:0};
  const kindFor=model=>{ if(KINDS[model])return KINDS[model]; const D=DATA.cars[model], [w,h,L]=D.size, r=D.r, rest=.15, top=D.low+h;
    const V=VEH.make({half:[w*.46*M1,(top-.25)/2*M1,L*.47*M1],cy:((top+.25)/2-r)*M1,lift:(r+.05)*M1,mass:1200,wheels:D.wheels.map(q=>[q[0]*M1,(q[1]-r+rest)*M1,q[2]*M1]),r:r*M1,rest:rest*M1,travel:.12*M1,stiff:30,grip:3,
      engine:2400*M1,reverse:1200*M1,vmax:20*M1,vback:4*M1,brake:50*M1,idle:5*M1,steer:.55,steerFade:8*M1,knockR:1.6*M1,down:r*M1,wy:D.wheels[0][1],unit:M1});
    const k=KINDS[model]={name:D.name,world:true,V,seat:(m,o)=>{ const c=m.userData.cab; return c?o.copy(c.seat):o.set(0,.5,0); }, fit:m=>{ const c=m.userData.cab; return c?c.fit:1; },make:()=>build(model),lift:.001,acc:4,turn:1.4,drag:1.2,knock:99,hop:false,ease:20,
      on:()=>{ if(!PB.R)PB.load(); }, off:()=>V.drop(),
      pose:R=>{ POSE.steer=V.on?V.steer*2:0; return POSE; },
      step:(R,dt)=>{ if(!V.step(R))return false; st.ride=POSE; return true; },
      place:(m,R,t)=>{ const w=m.userData.wh, cb=m.userData.cab; if(cb)cb.sw.rotation.z=(R===RIDE&&V.on?V.steer:0)*5; if(R===RIDE)k.m=m; if(R===RIDE&&V.place(m,w))return; m.position.y=SHARED.groundY(m.position.x,m.position.z); for(let i=0;i<4;i++)w[i].rotation.x+=(R.v||0)*.02; } };
    RIDE.kind('car:'+model,k); return k; };

  /* ---------- parked: drawn where the section says, solid, a thing to double-click ---------- */
  const at=C=>{ if(!C.mesh)return; C.mesh.position.set(C.x,SHARED.groundY(C.x,C.z),C.z); C.mesh.rotation.set(0,C.hd,0); C.mesh.visible=!C.by;
    const D=DATA.cars[C.model], hw=D.size[0]/2*M1, hl=D.size[2]/2*M1, c=Math.abs(Math.cos(C.hd)), s=Math.abs(Math.sin(C.hd)), ex=hw*c+hl*s, ez=hw*s+hl*c;
    if(!C.sol){ C.sol=[0,0,0,0]; SOL.up.push(C.sol); } if(C.by){ C.sol[0]=C.sol[2]=C.sol[1]=C.sol[3]=-1e7; return; } C.sol[0]=C.x-ex; C.sol[1]=C.z-ez; C.sol[2]=C.x+ex; C.sol[3]=C.z+ez; };
  const show=()=>{ for(const C of CARS.values()){ if(!DATA.cars[C.model])continue; kindFor(C.model); if(!C.mesh){ C.mesh=build(C.model); C.mesh.userData.anyRoom=false; scene.add(C.mesh); const D=DATA.cars[C.model];
        UI.thing({name:D.name,obj:C.mesh,reach:1.8*M1+D.size[2]/2*M1,near:3*M1+D.size[2]/2*M1,tall:D.size[1]*M1,act:()=>getIn(C.id)}); } at(C); } };
  const fromWorld=(k,v)=>{ const C=CARS.get(k.slice(4)); if(!C||typeof v!=='string')return; const a=v.split(',').map(Number); if(a.length<3||!a.every(isFinite))return; C.x=a[0]; C.z=a[1]; C.hd=a[2]; at(C); };
  SYS.add('world',(k,v)=>{ if(typeof k==='string'&&k.startsWith('car:'))fromWorld(k,v); },'150p-cars');
  SYS.add('hi',m=>{ for(const C of CARS.values())C.by=m.cars&&m.cars[C.id]||null; for(const k in ONLINE.world||{})if(k.startsWith('car:'))fromWorld(k,ONLINE.world[k]); if(DATA)for(const C of CARS.values())at(C); },'150p-cars');

  /* ---------- in and out ---------- */
  const HUD=document.createElement('div'); HUD.id='carhud'; HUD.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:12;display:none;gap:10px;align-items:center;padding:6px 10px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#ece5d3;background:#0e1016e0;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  HUD.innerHTML='<span></span><button style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 8px;cursor:pointer">GET OUT (F)</button>'; document.body.appendChild(HUD); HUD.querySelector('button').onclick=()=>getOut();
  const board=id=>{ const C=CARS.get(id), k=C&&kindFor(C.model); if(!k)return; C.by=ONLINE.me||'me'; at(C); pos.x=C.x; pos.z=C.z; SHARED.py=SHARED.groundY(C.x,C.z); SHARED.heading=C.hd; k.V.x=C.x; k.V.z=C.z; k.V.hd=C.hd;
    if(!RIDE.mount('car:'+C.model)){ C.by=null; at(C); if(ONLINE.on)ONLINE.send({t:'car',k:id,on:0}); return; } k.V.x=k.V.z=k.V.hd=null; mine=C; HUD.querySelector('span').textContent=k.name+' · W GO · S BRAKE · A D STEER'; HUD.style.display='flex'; say('YOU GET IN THE '+k.name+'.'); };
  const getIn=id=>{ const C=CARS.get(id); if(!C||!DATA)return; if(mine)return; if(RIDE.on)return say('GET OFF WHAT YOU ARE RIDING FIRST.','#c8a090'); if(C.by&&C.by!==ONLINE.me)return say('SOMEONE IS DRIVING IT.','#c8a090');
    if(ONLINE.on&&ONLINE.me){ want=id; ONLINE.send({t:'car',k:id,on:1}); setTimeout(()=>{ if(want===id){ want=null; say('THE CAR DID NOT ANSWER. TRY AGAIN.','#c8a090'); } },4000); } else board(id); };
  const getOut=()=>{ const C=mine; if(!C)return; mine=null; HUD.style.display='none'; C.x=pos.x; C.z=pos.z; C.hd=SHARED.heading; C.by=null; RIDE.off('YOU GET OUT AND LEAVE IT PARKED.'); if(ONLINE.on)ONLINE.send({t:'car',k:C.id,on:0,at:[C.x,C.z,C.hd]}); at(C);
    const D=DATA.cars[C.model], s=(D.size[0]/2+.7)*M1; pos.x=C.x-Math.cos(C.hd)*s; pos.z=C.z+Math.sin(C.hd)*s; SHARED.py=SHARED.groundY(pos.x,pos.z); };
  CAR.getIn=getIn; CAR.getOut=getOut; CAR.build=m=>DATA&&DATA.cars[m]?build(m):null;
  // in first person at the wheel, your eye is the driver's, in the seat behind the wheel
  const EYE=new THREE.Vector3(), Q=new THREE.Quaternion(), LOOK=new THREE.Quaternion().setFromEuler(new THREE.Euler(-.24,Math.PI,0,'YXZ'));   // the car looks along +z, a camera along -z
  SYS.add('cam',()=>{ if(!mine||UI.view!=='first')return; const k=KINDS[mine.model], m=k&&k.m, cb=m&&m.userData.cab; if(!cb||!m.visible)return; m.updateMatrixWorld(true); SHARED.cam.position.copy(m.localToWorld(EYE.copy(cb.eye))); SHARED.cam.quaternion.copy(m.getWorldQuaternion(Q)).multiply(LOOK); SHARED.cam.updateMatrixWorld(); },'150p-cars');
  ONLINE.hear.car=m=>{ const C=CARS.get(m.k); if(!C)return; if(m.no){ if(want===m.k){ want=null; say('SOMEONE IS DRIVING IT.','#c8a090'); } C.by=m.by; if(DATA)at(C); return; }
    if(typeof m.at==='string')fromWorld('car:'+m.k,m.at); if(m.by&&m.by===ONLINE.me){ if(want===m.k){ want=null; board(m.k); } return; } if(mine===C&&!m.by)return; C.by=m.by||null; if(DATA)at(C); };
  addEventListener('keydown',e=>{ if(!mine||e.repeat||/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||''))return; if((e.key||'').toLowerCase()==='f'){ e.preventDefault(); getOut(); } });
  // the ride ended some other way (a fall, a crash): the car parks where it stopped
  SYS.add('life',()=>{ if(mine&&!(RIDE.on&&RIDE.on==='car:'+mine.model)){ const C=mine; mine=null; HUD.style.display='none'; C.x=pos.x; C.z=pos.z; C.hd=SHARED.heading; C.by=null; if(ONLINE.on)ONLINE.send({t:'car',k:C.id,on:0,at:[C.x,C.z,C.hd]}); if(DATA)at(C); } },'150p-cars');

  // the ground's height is only true near you: a parked car within reach is set on it again now and then
  let gT=0; SYS.add('life',dt=>{ if(!DATA||(gT-=dt||0)>0)return; gT=.5; for(const C of CARS.values())if(C.mesh&&C.mesh.visible&&Math.hypot(C.x-pos.x,C.z-pos.z)<60*T)C.mesh.position.y=SHARED.groundY(C.x,C.z); },'150p-cars');
  /* ---------- the kit fetched after the start ---------- */
  let asked=false; SYS.add('life',()=>{ if(asked||!window.__started)return; asked=true; CARD().then(d=>{ DATA=d; show(); }).catch(e=>console.warn('CARS: the kit did not load',e)); },'150p-cars');
  CAR.dbg=()=>({loaded:!!DATA,cars:[...CARS.values()].map(C=>({id:C.id,model:C.model,x:+(C.x/T+SHARED.BOD.OX).toFixed(1),z:+(C.z/T+SHARED.BOD.OY).toFixed(1),hd:+C.hd.toFixed(2),by:C.by,shown:!!(C.mesh&&C.mesh.visible)})),driving:mine&&mine.id,veh:mine?!!KINDS[mine.model].V.on:false,rb:mine&&KINDS[mine.model].V.rb?(()=>{ const V=KINDS[mine.model].V, p=V.rb.translation(), r=V.rb.rotation(); return {p:[p.x/T+SHARED.BOD.OX,p.y/T,p.z/T+SHARED.BOD.OY].map(v=>+v.toFixed(2)),r:[r.x,r.y,r.z,r.w].map(v=>+v.toFixed(2)),sp:+(V.sp/T).toFixed(2)}; })():null,v:+((RIDE.v||0)/T).toFixed(2)});
}
