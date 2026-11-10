// THE PHYSICS EXTRAS: trigger zones (the dartboard, the trash cans), ragdolls for the townsfolk (a fast thing or a vehicle knocks them over), VEH (Rapier's raycast vehicle for anything you drive) and the go-kart on it.
import {SHARED, THREE} from './003-shx.js';
import {BAG, FORAGE, GPH, INSPECT, keys, NPCS, PB, PHYS, pos, RIDE, SFX, SPEED, st, VLOOK} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {FIX, SYS, TILE} from './006-map-pre.js';
import {OBJS} from './008-batch.js';
const VEH={};   // what you drive on Rapier's raycast vehicle (VEH.make below); the go-kart's here, the cars' in 150p-cars
{ const T=TILE, M1=T/.84, say=(t,c)=>SAY(t,c||'#e8e2cc');
  /* ---------- trigger zones: a sensor that notices a loose thing coming in; the dartboard scores a throw, an upright trash can swallows small things ---------- */
  const ZN=new Map(), boards=new Set(), cans=new Map(); let zt=0, nO=0;
  const zones=()=>{ '@later'; const P=GPH.phys(); if(!P)return; const {R,world,fb}=P;
    for(;nO<OBJS.length;nO++){ const o=OBJS[nO]; if(o.name!=='dartboard'||boards.has(o)||!o.parts.length)continue; boards.add(o); const a=[1e9,1e9,1e9], b=[-1e9,-1e9,-1e9];
      for(const p of o.parts){ const A=p.me.geometry.attributes.position.array; for(let v=p.v0;v<p.v0+6;v++)for(let k=0;k<3;k++){ const q=A[v*3+k]; if(q<a[k])a[k]=q; if(q>b[k])b[k]=q; } }
      const h=[0,1,2].map(k=>Math.max(.12*T,(b[k]-a[k])/2)), c=[0,1,2].map(k=>(a[k]+b[k])/2), thin=b[0]-a[0]<b[2]-a[2]?0:2;
      const co=world.createCollider(R.ColliderDesc.cuboid(...h).setTranslation(...c).setSensor(true).setActiveEvents(R.ActiveEvents.COLLISION_EVENTS).setCollisionGroups(0x00040001),fb);
      ZN.set(co.handle,{kind:'dart',c,r:Math.max(...h.filter((_,k)=>k!==thin)),thin}); }
    for(const it of GPH.loose()){ if(it.name!=='trash can'||!it.rb||it.gone)continue; const was=cans.get(it); if(was&&was.rb===it.rb)continue;
      const co=world.createCollider(R.ColliderDesc.cylinder(it.h[1]*.2,Math.min(it.h[0],it.h[2])*.7).setTranslation(0,it.h[1]*.6,0).setSensor(true).setActiveEvents(R.ActiveEvents.COLLISION_EVENTS).setCollisionGroups(0x00040001),it.rb);
      cans.set(it,{rb:it.rb}); ZN.set(co.handle,{kind:'can',it}); } };
  const enter=(z,it)=>{ '@later'; if(!it||it.gone||it===GPH.heldNow()||!it.rb)return; const p=it.rb.translation();
    if(z.kind==='dart'){ if(performance.now()-(it.thrown||0)>3000)return; const d=Math.hypot(...[0,1,2].map(k=>k===z.thin?0:[p.x,p.y,p.z][k]-z.c[k]))/z.r, pts=d<.08?50:d<.18?25:d<.6?15:5;
      it.rb.setLinvel({x:0,y:0,z:0},true); it.rb.setAngvel({x:0,y:0,z:0},true); say(pts===50?'BULLSEYE! 50.':'THE BOARD: '+pts+'.','#f2c14e'); if(SFX.play)SFX.play('clunk',{vol:.6,pitch:1.4,at:p}); }
    else if(z.kind==='can'){ const c=z.it; if(it===c||it.heavy||it.m>8||!c.rb)return; const r=c.rb.rotation(), up=1-2*(r.x*r.x+r.z*r.z); if(up<.8)return; GPH.bin(it); say('IN THE CAN.'); } };
  GPH.coll.push((h1,h2,on)=>{ if(!on||!PHYS.on('zones'))return; const a=ZN.get(h1), b=ZN.get(h2); if(a)enter(a,GPH.ofCollider(h2)); if(b)enter(b,GPH.ofCollider(h1)); });

  /* ---------- ragdolls: a townsperson knocked over falls as a body of eleven parts on Rapier joints, lies a moment, then gets up ---------- */
  const RAGS=new Set(), Q=new THREE.Quaternion(), M4=new THREE.Matrix4(), V=new THREE.Vector3(), V2=new THREE.Vector3();
  const v3=p=>new THREE.Vector3(p.x,p.y,p.z);
  PHYS.knock=(N,dir,k=1)=>{ '@later'; if(!PHYS.on('rag')||!PB.R||N.rag||N.mode==='hidden'||!N.B||!N.B.J||!N.B.m||RAGS.size>=4)return false; const R=PB.R, J=N.B.J, m=N.B.m, RG=RIG; if(!J.pelvis||!m.Rb)return false;
    const world=new R.World({x:0,y:-(RG.G?RG.G():280),z:0}); world.timestep=1/120; const gy=Math.min(...['toeL','toeR','heelL','heelR'].map(n=>J[n]?J[n].y:0));
    world.createCollider(R.ColliderDesc.cuboid(400,5,400).setTranslation(0,gy-5,0).setFriction(1.1).setCollisionGroups(0x00010002));
    const W=n=>v3(J[n]), bs={}, list=[], hd=N.st.hd||0, ch=Math.cos(hd), sn=Math.sin(hd), push={x:(dir.x*ch-dir.z*sn)*90*k,y:30*k,z:(dir.x*sn+dir.z*ch)*90*k};
    const mk=(name,at,X,Y,Z,joints,shapes,kg)=>{ const p=W(at); M4.makeBasis(v3(X),v3(Y),v3(Z)); Q.setFromRotationMatrix(M4);
      const rb=world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(p.x,p.y,p.z).setRotation({x:Q.x,y:Q.y,z:Q.z,w:Q.w}).setLinearDamping(.3).setAngularDamping(1.4).setCcdEnabled(true));
      for(const [h,c] of shapes)world.createCollider(R.ColliderDesc.cuboid(...h).setTranslation(...c).setMass(kg/shapes.length).setFriction(.9).setCollisionGroups(0x00020001),rb);
      const iq=Q.clone().invert(), jl={}; for(const n of joints)if(J[n])jl[n]=W(n).sub(p).applyQuaternion(iq); rb.setLinvel(push,true); const b={name,rb,jl}; bs[name]=b; list.push(b); return b; };
    const orth=(xr,z)=>{ const x=v3(xr).sub(z.clone().multiplyScalar(v3(xr).dot(z))).normalize(); return [x,z.clone().cross(x),z]; }, limb=(a,b,xr)=>orth(xr,W(b).sub(W(a)).normalize());
    const H=RG.HIPX, U=RG.UPPER, F=RG.FORE+4, TH=RG.THIGH, SL=RG.SHIN+RG.ANKLE;
    mk('pelvis','pelvis',m.Rb.x,m.Rb.y,m.Rb.z,['pelvis','spine','hipL','hipR'],[[[H+2,3,2.5],[0,0,0]]],12);
    mk('chest','chest',m.Ru.x,m.Ru.y,m.Ru.z,['chest','neck','clavL','clavR','shoulderL','shoulderR'],[[[7,5,2.8],[0,0,0]]],22);
    mk('head','head',m.Rh.x,m.Rh.y,m.Rh.z,['headBase','head','headTop'],[[[5.5,6.5,5.5],[0,1,0]]],5);
    for(const n of 'LR'){ mk('upperArm'+n,'shoulder'+n,...limb('shoulder'+n,'elbow'+n,m.Ru.x),['elbow'+n],[[[2,2,U/2],[0,0,U/2]]],2.5);
      mk('forearm'+n,'elbow'+n,...limb('elbow'+n,'wrist'+n,m.Ru.x),['wrist'+n],[[[1.8,1.8,F/2],[0,0,F/2]]],2);
      mk('thigh'+n,'hip'+n,...limb('hip'+n,'knee'+n,m.Rb.x),['knee'+n],[[[3.2,3.2,TH/2],[0,0,TH/2]]],8);
      mk('shin'+n,'knee'+n,...limb('knee'+n,'ankle'+n,m.Rb.x),['ankle'+n,'heel'+n,'ball'+n,'toe'+n],[[[2.8,2.8,SL/2],[0,0,SL/2]],[[1.8,3,1.3],[0,1.5,SL-1.3]]],5); }
    const pin=(a,b,k)=>{ const A=bs[a], B=bs[b], w=W(k), la=(o,p)=>{ const t=o.rb.translation(), r=o.rb.rotation(); return p.clone().sub(v3(t)).applyQuaternion(Q.set(r.x,r.y,r.z,r.w).invert()); };
      const j=world.createImpulseJoint(R.JointData.spherical(la(A,w),la(B,w)),A.rb,B.rb,true); j.setContactsEnabled(false); };
    pin('pelvis','chest','spine'); pin('chest','head','neck');
    for(const n of 'LR'){ pin('chest','upperArm'+n,'shoulder'+n); pin('upperArm'+n,'forearm'+n,'elbow'+n); pin('pelvis','thigh'+n,'hip'+n); pin('thigh'+n,'shin'+n,'knee'+n); }
    let t=0, acc=0; const ax=(r,x,y,z)=>{ Q.set(r.x,r.y,r.z,r.w); return RG.V(...V.set(x,y,z).applyQuaternion(Q).toArray()); };
    const R0={N,world,t:()=>t}; RAGS.add(R0); if(SFX.play)SFX.play('thud',{vol:.6,vary:.2});
    let tl=performance.now(); const t0=tl; N.rag=()=>{ const now=performance.now(), dt=Math.min(.1,(now-tl)/1000); tl=now; t+=dt; acc=Math.min(acc+dt,4/120); while(acc>=1/120){ world.step(); acc-=1/120; }
      const v=bs.chest.rb.linvel(); if(now-t0>6000||t>2.5&&Math.hypot(v.x,v.y,v.z)<3){ N.rag=null; RAGS.delete(R0); world.free(); return null; }
      const J2={}, m2={foot:{},hf:{},fist:{}}; for(const b of list){ const p=b.rb.translation(), r=b.rb.rotation(); Q.set(r.x,r.y,r.z,r.w); for(const k in b.jl){ V2.copy(b.jl[k]).applyQuaternion(Q); J2[k]=RG.V(p.x+V2.x,p.y+V2.y,p.z+V2.z); } }
      const fr=b=>{ const r=bs[b].rb.rotation(); return {x:ax(r,1,0,0),y:ax(r,0,1,0),z:ax(r,0,0,1)}; };
      m2.Rb=m2.Rp=fr('pelvis'); m2.Ru=m2.Rc=fr('chest'); m2.Rh=fr('head');
      for(const n of 'LR'){ const s=fr('shin'+n); m2.foot[n]={x:m2.Rb.x,y:RG.V(-s.z.x,-s.z.y,-s.z.z),z:s.y}; m2.hf[n]=RG.hand(J2,n,n==='L'?1:-1,RG.nrm(RG.sub(J2['wrist'+n],J2['elbow'+n])),m2.Ru,{fist:0}); m2.fist[n]=0; }
      return {J:J2,m:m2,head:J2.head,lift:0}; };
    return true; };
  // what knocks one over: a loose thing flying into them, or the kart
  const knockNear=(x,y,z,vx,vz,sp,r,k)=>{ for(const N of NPCS.extra||[]){ if(!N.on||N.rag||!N.st)continue; const s=N.st, dx=s.x-x, dz=s.z-z; if(Math.hypot(dx,dz)>r||y<(s.y||0)-.2*T||y>(s.y||0)+2*M1)continue;
      if(PHYS.knock(N,{x:vx/sp,z:vz/sp},k))return N; } return null; };

  /* ---------- the go-kart: a RIDE kind; with VEHICLE PHYSICS on, Rapier's raycast vehicle drives it (four wheels, suspension, grip), else it glides like a board ---------- */
  FORAGE.add({names:{kart:'THE GO-KART'}});
  /* ---------- VEH: Rapier's raycast vehicle for anything you drive (the go-kart, the cars): a body box, four wheels (two front that steer, two rear that drive), suspension and grip; W goes, S brakes then backs, A and D steer ---------- */
  // a spec, in world units: half [x,y,z] of the body box, cy its centre over the rigid body, lift where it starts over your feet, mass, wheels [fl,fr,rl,rr] [x,y,z], r their radius, rest and travel of the springs,
  // engine and reverse forces, vmax and vback, brake and idle braking, steer (the most) and steerFade (the speed it halves at), knockR (how near a townsfolk is knocked), and for drawing: down (the mesh under the body), wy (a wheel's height in the mesh), unit (the mesh's scale)
  const LIVE=new Set(), VQ=new THREE.Quaternion(), VV=new THREE.Vector3();
  // V.size(S2): a new spec (the owner resized its look); while someone drives it, it waits for the next boarding
  VEH.make=S0=>{ const V={on:false,rb:null,vc:null,steer:0,sp:0,S:S0,next:null};
    V.size=S2=>{ if(V.on)V.next=S2; else V.S=S2; };
    V.build=()=>{ '@later'; const P=GPH.phys(); if(!P)return false; const S=V.S, {R,world}=P, y=SHARED.py+S.lift, h0=V.hd!=null?V.hd:SHARED.heading, x0=V.x!=null?V.x:pos.x, z0=V.z!=null?V.z:pos.z;
      V.rb=world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(x0,y,z0).setRotation({x:0,y:Math.sin(h0/2),z:0,w:Math.cos(h0/2)}).setLinearDamping(.15).setAngularDamping(1.2).setCanSleep(false));
      world.createCollider(R.ColliderDesc.cuboid(S.half[0],S.half[1],S.half[2]).setTranslation(0,S.cy||0,0).setMass(S.mass).setFriction(.4).setCollisionGroups(0x00010005),V.rb);
      const vc=V.vc=world.createVehicleController(V.rb); try{ vc.indexUpAxis=1; vc.setIndexForwardAxis=2; }catch(e){}
      for(const w of S.wheels)vc.addWheel({x:w[0],y:w[1],z:w[2]},{x:0,y:-1,z:0},{x:-1,y:0,z:0},S.rest,S.r);
      for(let i=0;i<S.wheels.length;i++){ vc.setWheelSuspensionStiffness(i,S.stiff||40); vc.setWheelSuspensionCompression(i,4); vc.setWheelSuspensionRelaxation(i,3); vc.setWheelFrictionSlip(i,S.grip||2.2); vc.setWheelMaxSuspensionTravel(i,S.travel); vc.setWheelSideFrictionStiffness(i,1); }
      V.on=true; LIVE.add(V); return true; };
    V.drop=()=>{ const P=GPH.phys(); if(P&&V.vc){ try{ P.world.removeVehicleController(V.vc); }catch(e){} try{ P.world.removeRigidBody(V.rb); }catch(e){} } V.vc=V.rb=null; V.on=false; LIVE.delete(V); if(V.next){ V.S=V.next; V.next=null; } };
    // each frame while ridden: you go where it is; false hands the ride back to the board's own glide (VEHICLE PHYSICS off, or no physics yet)
    V.step=R=>{ '@later'; const S=V.S; if(!PHYS.on('veh')||!PB.R||!GPH.phys()){ if(V.on)V.drop(); return false; } if(!V.on&&!V.build())return false;
      const p=V.rb.translation(), r=V.rb.rotation(), g=SHARED.groundY(p.x,p.z); if(!isFinite(g)||p.y<g-2*T){ V.drop(); return false; }
      pos.x=p.x; pos.z=p.z; VQ.set(r.x,r.y,r.z,r.w); VV.set(0,0,1).applyQuaternion(VQ); R.hd=SHARED.heading=Math.atan2(VV.x,VV.z); V.sp=V.vc.currentVehicleSpeed(); R.v=Math.abs(V.sp); R.lift=0;
      if(R.v>2*T){ const v=V.rb.linvel(); if(knockNear(p.x,p.y,p.z,v.x,v.z,Math.hypot(v.x,v.z)||1,S.knockR,Math.min(1.6,R.v/(4*T))))V.rb.setLinvel({x:v.x*.6,y:v.y,z:v.z*.6},true); }
      return true; };
    V.place=(m,w)=>{ '@later'; if(!V.on)return false; const S=V.S, r=V.rb.rotation(), p=V.rb.translation(); m.quaternion.set(r.x,r.y,r.z,r.w); m.position.set(p.x,p.y-S.down,p.z);
      for(let i=0;i<4;i++){ const ww=w[i]; ww.rotation.set(V.vc.wheelRotation(i)||0,i<2?V.vc.wheelSteering(i)||0:0,0,'YXZ'); const L=V.vc.wheelSuspensionLength(i); if(L!=null)ww.position.y=S.wy+(S.rest-L)/S.unit; } return true; };
    return V; };
  // flying one yourself (the helicopter, the hover cars): F {x,y,z,hd,vf,vy,turn,pitch,bank,down} moved a step by what is pressed (f forward, tr turn, v up), slowed against a building or set on its roof, kept inside the map's edges
  VEH.fly=(F,dt,o)=>{ const k=Math.min(1,dt*1.5), g0=o.surf(F.x,F.z,F.y), air=F.y>g0+.05*o.mv;
    F.vy+=((o.ready?o.v*o.vup:-.5*o.vup)-F.vy)*Math.min(1,dt*2.5); F.turn+=(o.tr*o.turn-F.turn)*Math.min(1,dt*3);
    if(air||o.v>0&&o.ready){ F.vf+=((o.f>0?o.f*o.vmax:o.f*o.vback)-F.vf)*k*.6; F.hd+=F.turn*dt; } else { F.vf*=Math.exp(-dt*6); if(o.ready)F.hd+=F.turn*dt*.3; }
    const ox=F.x, oz=F.z, oy=F.y; F.x+=Math.sin(F.hd)*F.vf*dt; F.z+=Math.cos(F.hd)*F.vf*dt; F.y=Math.min(o.top,F.y+F.vy*dt);
    if(o.B){ F.x=Math.max(o.B.x0,Math.min(o.B.x1,F.x)); F.z=Math.max(o.B.z0,Math.min(o.B.z1,F.z)); }
    const r=o.r; for(const b of FIX.up){ if(F.x+r<b[0]||F.x-r>b[3]||F.z+r<b[1]||F.z-r>b[4])continue; if(F.y>=b[5]-.05*o.mv||F.y+o.tall<b[2])continue; if(oy>=b[5]-.05*o.mv){ F.y=b[5]; continue; } F.x=ox; F.z=oz; F.vf*=-.2; break; }
    const g=o.surf(F.x,F.z,F.y); if(F.y<g){ F.y=g; F.vy=Math.max(0,F.vy); } F.down=F.y<g+.05*o.mv&&Math.abs(F.vf)<o.slow;
    F.pitch+=(Math.min(1,F.vf/o.vref)*.22-F.pitch)*Math.min(1,dt*3); F.bank+=((F.down?0:-F.turn*.35*Math.min(1,Math.abs(F.vf)/o.bankAt))-F.bank)*Math.min(1,dt*3); };
  // the ground something that flies stands on: the ground, or the top of whatever solid is under it (a roof)
  VEH.surf=(x,z,y=1e9,r=1.2*M1,mv=1)=>{ let g=SHARED.groundY(x,z); for(const f of FIX.up){ if(x+r<f[0]||x-r>f[3]||z+r<f[1]||z-r>f[4])continue; if(f[5]>g&&f[5]<=y+.6*mv)g=f[5]; } return g; };
  GPH.ext.push(()=>LIVE.size>0);
  GPH.pre.push(h=>{ '@later'; for(const V of LIVE){ const S=V.S, vc=V.vc, f=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0), sd=(keys.has('a')||keys.has('arrowleft')?1:0)-(keys.has('d')||keys.has('arrowright')?1:0), sp=vc.currentVehicleSpeed(), K=SPEED.of(S.cat||'cars');
    V.steer+=(sd*S.steer/(1+Math.abs(sp)/S.steerFade)-V.steer)*Math.min(1,h*8); const back=f<0&&sp>.3*M1, eng=back||f>0&&sp>S.vmax*K||f<0&&sp<-S.vback*K?0:f*(f>0?S.engine:S.reverse)*K;
    for(const i of [0,1])vc.setWheelSteering(i,V.steer); for(const i of [2,3])vc.setWheelEngineForce(i,eng); for(let i=0;i<4;i++)vc.setWheelBrake(i,back?S.brake:f?0:S.idle); vc.updateVehicle(h,undefined,0x00010005); } });

  /* ---------- the go-kart: a RIDE kind on VEH; with VEHICLE PHYSICS off it glides like a board ---------- */
  FORAGE.add({names:{kart:'THE GO-KART'}});
  const POSE={k:'kart',steer:0,z:0};
  const mat=c=>new THREE.MeshLambertMaterial({color:c}), WH=.15, WX=.36, WZ=.5;
  const make=()=>{ '@later'; const G=new THREE.Group(), red=mat(0xc8302a), blk=mat(0x1c1c1e), gr=mat(0x8a8c90), seat=mat(0x2a2e3a);
    const M=(geo,m,x,y,z)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); o.castShadow=true; G.add(o); return o; };
    M(new THREE.BoxGeometry(.62,.07,1.25),gr,0,.12,0); M(new THREE.BoxGeometry(.5,.12,.34),red,0,.2,.5); M(new THREE.BoxGeometry(.66,.1,.22),red,0,.17,-.55);
    M(new THREE.BoxGeometry(.4,.06,.36),seat,0,.2,-.18); M(new THREE.BoxGeometry(.4,.32,.06),seat,0,.36,-.36);
    const col=M(new THREE.CylinderGeometry(.015,.015,.3,6),gr,0,.3,.24); col.rotation.x=-.9; const sw=M(new THREE.TorusGeometry(.09,.015,6,14),blk,0,.42,.16); sw.rotation.x=-.65; G.userData.sw=sw;
    G.userData.wh=[[WX,WZ],[-WX,WZ],[WX,-WZ],[-WX,-WZ]].map(([x,z])=>{ const w=new THREE.Group(); w.position.set(x,WH,z); const t=new THREE.Mesh(new THREE.CylinderGeometry(WH,WH,.12,12),blk); t.rotation.z=Math.PI/2; t.castShadow=true; w.add(t);
      const h=new THREE.Mesh(new THREE.CylinderGeometry(WH*.45,WH*.45,.13,8),gr); h.rotation.z=Math.PI/2; w.add(h); G.add(w); return w; });
    G.scale.setScalar(T); return G; };
  // its vehicle at the size the owner gave its look (VLOOK 'kart'): the body, wheels and springs grow with it
  const kartSpec=(ls=1)=>{ const s0=M1*.84*ls; return {half:[.31*s0,.1*s0,.62*s0],lift:.35*s0,mass:140,wheels:[[WX,WZ],[-WX,WZ],[WX,-WZ],[-WX,-WZ]].map(([x,z])=>[x*s0,-.02*s0,z*s0]),r:WH*s0,rest:.14*s0,travel:.1*s0,
    engine:260*M1,reverse:150*M1,vmax:8*M1,vback:2.5*M1,brake:6*M1,idle:.6*M1,steer:.5,steerFade:4*M1,cat:'kart',knockR:.55*M1*ls,down:.31*T*ls,wy:WH,unit:T*ls}; };
  const KR=VEH.make(kartSpec(VLOOK.scaleOf('kart')));
  VLOOK.on(id=>{ if(!id||id==='kart')KR.size(kartSpec(VLOOK.scaleOf('kart'))); });
  // a kart as a RIDE kind on its vehicle V: the item you carry (KR), or one boarded where it stands (the fair's rentals, VEH.kartKind); crash: the speed a sudden stop throws you out at
  const kartKind=(V,o={})=>{ const k={name:'GO-KART',hint:'E SETS IT DOWN AND YOU GET IN. W GOES, S BRAKES AND BACKS, A AND D STEER, E GETS OUT.',onSay:'YOU SET THE KART DOWN AND SQUEEZE IN.',held:.3,
    make, cat:'kart', lift:.001, acc:3.4, turn:2.2, drag:.8, knock:99, hop:false, V,
    on:()=>{ if(!PB.R)PB.load(); }, off:()=>V.drop(),
    pose:R=>{ POSE.steer=V.on?V.steer*2:Math.max(-1,Math.min(1,R.lean*2)); return POSE; },
    step:(R,dt)=>{ if(!V.step(R)){ V.was=0; return false; } st.ride=POSE; const v=Math.abs(V.sp), w=V.was||0; V.was=v; if(k.crash&&w>k.crash&&v<w*.4)RIDE.off('YOU HIT IT HARD AND FLY OUT OVER THE FRONT.',true); return true; },
    place:(m,R,t)=>{ const w=m.userData.wh; if(!(R===RIDE&&V.place(m,w))){ if(R===RIDE)m.position.y=SHARED.py; for(let i=0;i<4;i++)w[i].rotation.x+=R.v*.02; }
      if(m.userData.sw)m.userData.sw.rotation.z=-(R===RIDE&&V.on?V.steer:R.lean)*2; },...o}; return k; };
  VEH.kartKind=kartKind; VEH.kart={make,spec:()=>KR.S};
  if(INSPECT&&INSPECT.kinds)INSPECT.kinds.push({is:id=>id==='kart',make:()=>{ const g=make(); g.scale.setScalar(1); g.traverse(c=>{ c.userData.ownMat=true; }); return g; }});   // its own model on the ground, on a shelf, inspected
  // the kart you carry (owner, 10 Nov 2026): E sets it down a step in front of you, where there is room, and you get in there; a hit at speed (4.5 m/s) throws you out over the front (fly) and the kart stays where it hit, on the ground to pick up
  const clear=(x,z,r)=>{ for(const b of SHARED.solids)if(x>b[0]-r&&x<b[2]+r&&z>b[1]-r&&z<b[3]+r)return false; const g=SHARED.groundY(x,z); return isFinite(g)&&Math.abs(g-SHARED.py)<.5*T; };
  const setDown=()=>{ const S=KR.S, h=SHARED.heading, r=Math.max(S.half[0],S.half[2]); KR.was=0;
    for(const f of [1,.6,.3]){ const d=(S.half[2]+.45*M1)*f, x=pos.x+Math.sin(h)*d, z=pos.z+Math.cos(h)*d; let ok=clear(x,z,r);
      for(let a=.25*T;ok&&a<d;a+=.25*T)ok=clear(pos.x+Math.sin(h)*a,pos.z+Math.cos(h)*a,.15*T); if(ok){ pos.x=x; pos.z=z; SHARED.py=SHARED.groundY(x,z); return; } } };
  RIDE.kind('kart',kartKind(KR,{crash:4.5*M1,knock:4.5*M1/T,fly:2.5,
    on:()=>{ if(!PB.R)PB.load(); setDown(); },
    off:(id,fall)=>{ const p=KR.rb?KR.rb.translation():{x:pos.x,z:pos.z}; KR.drop(); if(fall&&BAG.drop)BAG.drop('kart',1,{x:p.x,z:p.z,y:SHARED.groundY(p.x,p.z)}); }}));

  // each frame: zones kept up to date, a flying loose thing knocks over who it hits
  SYS.add('life',dt=>{ if(!GPH.phys())return; if((zt-=dt)<=0){ zt=1; if(PHYS.on('zones'))zones(); }
    if(PHYS.on('rag'))for(const it of GPH.active()){ if(!it.rb||it.rb.isSleeping()||it===GPH.heldNow())continue; const v=it.rb.linvel(), sp=Math.hypot(v.x,v.z); if(sp<3*T)continue;
      const p=it.rb.translation(); if(knockNear(p.x,p.y,p.z,v.x,v.z,sp,.4*M1+Math.max(it.h[0],it.h[2]),Math.min(1.4,sp*it.m/(40*T))))it.rb.setLinvel({x:-v.x*.25,y:v.y,z:-v.z*.25},true); } },'150o-physmore');
  window.PHYSDBG=()=>({zones:[...ZN.values()].map(z=>z.kind),boards:[...ZN.values()].filter(z=>z.kind==='dart').map(z=>z.c.map(v=>+v.toFixed(2))),rags:RAGS.size,ragt:[...RAGS].map(r=>+r.t().toFixed(2)),kart:KR.on&&{sp:+KR.sp.toFixed(2),at:(p=>[p.x,p.y,p.z].map(v=>+v.toFixed(2)))(KR.rb.translation())},cfg:PHYS.cfg});
  window.PHYSKNOCK=(i=0)=>{ const L=(NPCS.extra||[]).filter(N=>N.on&&N.mode!=='hidden'&&N.B).sort((a,b)=>Math.hypot(a.st.x-pos.x,a.st.z-pos.z)-Math.hypot(b.st.x-pos.x,b.st.z-pos.z)); const N=L[i]; return N?{name:N.name,ok:PHYS.knock(N,{x:1,z:0},1)}:null; };
}
export {VEH};
