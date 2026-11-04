// THE FAIR'S RIDES: the Ferris wheel, the carousel, the swings, the pirate ship, the teacups, the scrambler, the drop tower, the slingshot, the roller coaster, the log flume, the haunted dark ride, the miniature railway and the sky ride, each registered with FAIR.ride (its place, its seats, its motion from the clock) and built with the fair; the tracked rides share one spline-track maker.
import {THREE} from './003-shx.js';
import {SFX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {TILE} from './006-map-pre.js';
import {PHOTOS} from './146m-newsreel.js';
import {FAIR} from './150q-fair.js';
{ const T=TILE, M=T/.84, V3=THREE.Vector3, UP=new V3(0,1,0), PI=Math.PI, TAU=PI*2, say=(t,c)=>SAY(t,c||'#e8e2cc');
  const ease=t=>t<=0?0:t>=1?1:t*t*(3-2*t), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const seatAt=(parent,x,y,z,ry=0)=>{ const s=new THREE.Object3D(); s.position.set(x,y,z); s.rotation.y=ry; parent.add(s); return s; };
  // a seat you can see: a bench with a back, its seat object on the cushion
  const bench=(K,parent,w,c,x,y,z,ry=0)=>{ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g); K.box(w,.12*M,.5*M,c,0,0,0,g); K.box(w,.55*M,.1*M,c,0,.3*M,-.25*M,g); return g; };
  /* ---------- a track: a closed spline in metres, a profile extruded along it, the frame at any point, cars placed by distance ---------- */
  const frame=(curve,u,P,R,Uv,Tg)=>{ curve.getPointAt(u,P); curve.getTangentAt(u,Tg).normalize(); R.crossVectors(Tg,UP); if(R.lengthSq()<1e-6)R.set(1,0,0); R.normalize(); Uv.crossVectors(R,Tg).normalize(); };
  const extrude=(curve,profile,n,closed=true)=>{ const P=new V3(), R=new V3(), U=new V3(), Tg=new V3(), np=profile.length, pos_=[], idx=[]; const rings=closed?n:n+1;
    for(let i=0;i<rings;i++){ frame(curve,(i%n)/n,P,R,U,Tg); for(const [dx,dy] of profile)pos_.push(P.x+R.x*dx+U.x*dy,P.y+R.y*dx+U.y*dy,P.z+R.z*dx+U.z*dy); }
    const segs=closed?n:n; for(let i=0;i<segs;i++){ const a=i*np, b=((i+1)%rings)*np; for(let j=0;j<np;j++){ const j2=(j+1)%np; idx.push(a+j,b+j,b+j2,a+j,b+j2,a+j2); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos_,3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
  const SQ=(r)=>[[-r,-r],[r,-r],[r,r],[-r,r]];
  const rails=(K,parent,curve,n,gauge=.9*M,c=0x8a8f98,r=.06*M)=>{ for(const s of [-1,1])parent.add(K.mesh(extrude(curve,SQ(r).map(([x,y])=>[x+s*gauge/2,y]),n),c,0,0,0)); };
  const ties=(K,parent,curve,n,w=1.3*M,c=0x5a4634)=>{ const geo=new THREE.BoxGeometry(w,.08*M,.2*M), I=new THREE.InstancedMesh(geo,K.mat(c),n), P=new V3(), R=new V3(), U=new V3(), Tg=new V3(), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), b=new THREE.Matrix4(), S=new V3(1,1,1);
    for(let i=0;i<n;i++){ frame(curve,i/n,P,R,U,Tg); b.makeBasis(R,U,Tg); q.setFromRotationMatrix(b); I.setMatrixAt(i,m4.compose(P.clone().addScaledVector(U,-.1*M),q,S)); } I.castShadow=true; parent.add(I); return I; };
  const supports=(K,parent,curve,n,c=0x6a6f78,minH=.6*M)=>{ const P=new V3(), R=new V3(), U=new V3(), Tg=new V3(), list=[]; for(let i=0;i<n;i++){ frame(curve,i/n,P,R,U,Tg); if(P.y>minH)list.push([P.x,P.y,P.z]); }
    if(!list.length)return; const geo=new THREE.BoxGeometry(.18*M,1,.18*M), I=new THREE.InstancedMesh(geo,K.mat(c),list.length), m4=new THREE.Matrix4(); list.forEach(([x,y,z],i)=>{ m4.makeScale(1,y-.15*M,1); m4.setPosition(x,(y-.15*M)/2,z); I.setMatrixAt(i,m4); }); I.castShadow=true; parent.add(I); };
  const place=(curve,u,obj,P,R,U,Tg,B)=>{ frame(curve,u,P,R,U,Tg); obj.position.copy(P); B.makeBasis(R,U,Tg); obj.quaternion.setFromRotationMatrix(B); };
  // a speed table along a loop: from a chain lift at vl to the summit, then by the fall from the highest point (a little lost each metre), never under vmin; gives s(t) and the run's length
  const profile=(curve,L,uLift,vl,vmin,loss=.9)=>{ const N=400, h=[], P=new V3(); let top=-1e9; for(let i=0;i<=N;i++){ curve.getPointAt(i/N,P); h.push(P.y); if(i/N>=uLift*.98&&P.y>top)top=P.y; }
    const S=[0]; let s=0, t=0; for(let i=0;i<N;i++){ const u=i/N, ds=L/N, hh=h[i]; const v=u<uLift?vl:Math.max(vmin,Math.sqrt(Math.max(0,2*9.81*(top-hh)))*loss); t+=ds/v; s+=ds; S.push(s); }
    return {run:t,at:tt=>{ const f=clamp(tt/t,0,1)*N; const i=Math.floor(f), k=f-i; if(i>=N)return L; return S[i]+(S[i+1]-S[i])*k; }}; };   // s(t) is a lookup by the time fraction, uniform in t is fine for the eye
  const loop=pts=>{ const c=new THREE.CatmullRomCurve3(pts.map(p=>new V3(p[0]*M,p[1]*M,p[2]*M)),true,'catmullrom',.5); c.arcLengthDivisions=600; return c; };

  /* ---------- THE FERRIS WHEEL: 16 gondolas on a 16 m wheel; two turns a ride; board the three lowest ---------- */
  FAIR.ride({id:'wheel',name:'FERRIS WHEEL',x:-90,y:186,hd:0,cycle:150,load:40,seats:16,price:2,solid:[6,3],reach:5*T,say:'YOU STEP INTO THE GONDOLA.',can:(R,i)=>R.seats[i].getWorldPosition(new V3()).y<3.2*M,
    make:(g,K)=>{ const Rw=8*M, hub=9.2*M, N=16, steel=K.mat(0x8a2a2a), white=K.mat(0xe8e4dc), seats=[]; const wheel=new THREE.Group(); wheel.position.y=hub; g.add(wheel);
      for(const s of [-1,1]){ for(const e of [-1,1]){ const h=Math.hypot(2.8*M,hub), leg=K.box(.3*M,h,.3*M,steel,e*1.4*M,hub/2,s*1.2*M,g); leg.rotation.z=e*Math.asin(2.8*M/h); } K.cyl(.9*M,.9*M,.3*M,steel,0,hub,s*1.2*M,g).rotation.x=PI/2; } K.box(.4*M,.3*M,2.6*M,steel,0,hub,0,g);
      for(const s of [-1,1]){ const rim=K.mesh(new THREE.TorusGeometry(Rw,.12*M,8,48),white,0,0,s*1.2*M,wheel); for(let i=0;i<N;i++){ const sp=K.box(.08*M,Rw,.08*M,steel,0,0,s*1.2*M,wheel); sp.rotation.z=i*TAU/N; sp.position.set(Math.sin(i*TAU/N)*Rw/2,Math.cos(i*TAU/N)*Rw/2,s*1.2*M); } }
      K.cyl(.5*M,.5*M,3*M,steel,0,0,0,wheel).rotation.x=PI/2;
      const COLS=[0xd84a3a,0xe9b53a,0x3a8ad8,0x4ab860,0xd86ab0,0xf0f0e8], gond=[];
      for(let i=0;i<N;i++){ const a=i*TAU/N, piv=new THREE.Object3D(); piv.position.set(Math.sin(a)*Rw,Math.cos(a)*Rw,0); wheel.add(piv); const cab=new THREE.Group(); cab.position.y=-.3*M; piv.add(cab);
        const c=K.mat(COLS[i%COLS.length]); K.box(1.6*M,.1*M,1.4*M,c,0,-1.1*M,0,cab); for(const s of [-1,1]){ K.box(.06*M,1.2*M,.06*M,c,s*.75*M,-.5*M,.65*M,cab); K.box(.06*M,1.2*M,.06*M,c,s*.75*M,-.5*M,-.65*M,cab); } K.box(1.8*M,.08*M,1.6*M,c,0,.1*M,0,cab); K.box(1.6*M,.35*M,.05*M,c,0,-.9*M,.7*M,cab); K.box(1.6*M,.35*M,.05*M,c,0,-.9*M,-.7*M,cab);
        bench(K,cab,1.4*M,0x3a3a44,0,-.9*M,-.35*M,0); seats.push(seatAt(cab,0,-.85*M,-.3*M,0)); gond.push({piv,a}); }
      K.lamp(g.position.x,hub,g.position.z+2.5*M,0xffd0a0,22,12);
      const a0=PI;   // gondola 0 at the bottom while it loads
      return {seats,tick:(run)=>{ const th=a0+TAU*2*ease(run); wheel.rotation.z=th; for(const q of gond)q.piv.rotation.z=-th; }}; }});

  /* ---------- THE CAROUSEL: 16 horses on poles under a striped canopy, rising and falling as it turns ---------- */
  FAIR.ride({id:'carousel',name:'CAROUSEL',x:-116,y:176,hd:0,cycle:95,load:30,seats:16,price:1,solid:[9,9],reach:7*T,say:'YOU SWING UP ONTO THE HORSE.',
    make:(g,K)=>{ const Rp=5.2*M, seats=[], turn=new THREE.Group(); g.add(turn); const floor=K.cyl(Rp,Rp,.25*M,K.mat(0xc8b890),0,.12*M,0,turn,32); K.cyl(.6*M,.7*M,4.2*M,K.mat(0xa83a2c),0,2.2*M,0,turn,12);
      const can=K.mesh(new THREE.ConeGeometry(Rp+.4*M,1.6*M,16,1,true),K.mat(0xd84a3a,{side:THREE.DoubleSide}),0,4.9*M,0,turn); K.mesh(new THREE.ConeGeometry(Rp+.4*M,1.6*M,16,1,true),K.mat(0xf0e6c8,{side:THREE.DoubleSide}),0,4.9*M+.02,0,turn).scale.set(.999,1,.999);
      K.cyl(Rp+.3*M,Rp+.3*M,.3*M,K.mat(0xe9b53a),0,4.25*M,0,turn,16);
      const HC=[0xf0ece0,0x3a3440,0xc87a3a,0xd8d0c8,0x7a4a3a,0xe8d8a0], horses=[];
      for(let i=0;i<16;i++){ const ring=i%2?Rp-1.1*M:Rp-2.4*M, a=i*TAU/16, px=Math.sin(a)*ring, pz=Math.cos(a)*ring; K.cyl(.035*M,.035*M,4*M,K.mat(0xe9b53a),px,2.2*M,pz,turn,8); const h=new THREE.Group(); h.position.set(px,1.1*M,pz); h.rotation.y=a+PI/2; turn.add(h);
        const c=K.mat(HC[i%HC.length]); K.box(.4*M,.45*M,1.1*M,c,0,0,0,h); K.box(.3*M,.5*M,.35*M,c,0,.35*M,.55*M,h); K.box(.28*M,.3*M,.5*M,c,0,.6*M,.75*M,h); for(const s of [-1,1]){ K.box(.1*M,.6*M,.1*M,c,s*.12*M,-.5*M,.4*M,h); K.box(.1*M,.6*M,.1*M,c,s*.12*M,-.5*M,-.4*M,h); }
        K.box(.42*M,.08*M,.5*M,K.mat(0xa83a2c),0,.26*M,-.05*M,h); seats.push(seatAt(h,0,.3*M,-.05*M,0)); horses.push({h,i}); }
      for(const a of [0,PI/2,PI,PI*1.5])K.lamp(g.position.x+Math.sin(a)*Rp,3.6*M,g.position.z+Math.cos(a)*Rp,0xffe0b0,10,5);
      return {seats,tick:(run,u)=>{ turn.rotation.y=TAU*3*ease(run); for(const q of horses)q.h.position.y=1.1*M+(run>0?Math.sin(u*3+q.i*1.3)*.35*M:0); }}; }});

  /* ---------- THE SWINGS: a chair-o-plane; twelve chairs on chains fly out as the crown spins ---------- */
  FAIR.ride({id:'swings',name:'SWING RIDE',x:-120,y:197,hd:0,cycle:80,load:28,seats:12,price:1,solid:[4,4],reach:7*T,pose:'car',say:'YOU SIT IN THE CHAIR AND THE BAR DROPS.',
    make:(g,K)=>{ const Hm=8.5*M, Rc=2.4*M, L=3.8*M, seats=[], chairs=[]; K.cyl(.35*M,.5*M,Hm,K.mat(0x3a4a8a),0,Hm/2,0,g,12); const crown=new THREE.Group(); crown.position.y=Hm; g.add(crown);
      K.cyl(Rc+.4*M,Rc+.4*M,.35*M,K.mat(0xe9b53a),0,0,0,crown,24); K.mesh(new THREE.ConeGeometry(Rc+.6*M,1.4*M,24),K.mat(0xd84a3a),0,.9*M,0,crown);
      for(let i=0;i<12;i++){ const a=i*TAU/12, piv=new THREE.Object3D(); piv.position.set(Math.sin(a)*Rc,-.1*M,Math.cos(a)*Rc); crown.add(piv); const ch=new THREE.Group(); piv.add(ch);
        for(const s of [-1,1])K.cyl(.012*M,.012*M,L,K.mat(0x9aa0a8),s*.28*M,-L/2,0,ch,4); const c=K.mat([0xd84a3a,0x3a8ad8,0xe9b53a,0x4ab860][i%4]); K.box(.6*M,.08*M,.5*M,c,0,-L,0,ch); K.box(.6*M,.5*M,.06*M,c,0,-L+.25*M,-.24*M,ch); K.box(.5*M,.05*M,.05*M,K.mat(0x202428),0,-L+.4*M,.2*M,ch);
        const st=seatAt(ch,0,-L+.04*M,-.05*M,0); st.rotation.y=PI; seats.push(st); chairs.push({piv,ch,a}); }
      for(const q of chairs)q.ax=new V3(Math.cos(q.a),0,-Math.sin(q.a));
      return {seats,tick:(run)=>{ const w=ease(Math.min(1,run*4))*ease(Math.min(1,(1-run)*4)); crown.rotation.y=TAU*4*(run-Math.sin(TAU*run)/(TAU*1.4)); const out=.95*w; for(const q of chairs){ q.ch.rotation.set(0,0,0); q.ch.rotateOnAxis(q.ax,-out); } crown.rotation.x=Math.sin(run*TAU*2)*.08*w; }}; }});

  /* ---------- THE PIRATE SHIP: a boat on an A-frame, swinging higher and higher, eight seats ---------- */
  FAIR.ride({id:'ship',name:'PIRATE SHIP',x:-103,y:176,hd:0,cycle:90,load:30,seats:8,price:2,solid:[12,5],reach:6*T,say:'YOU STRAP IN. THE SHIP CREAKS.',
    make:(g,K)=>{ const Hm=7.5*M, seats=[], steel=K.mat(0x4a4e58), wood=K.mat(0x6a4a2a); for(const s of [-1,1])for(const a of [-1,1]){ const leg=K.box(.25*M,Hm*1.06,.25*M,steel,a*Hm*.35,Hm/2,s*1.6*M,g); leg.rotation.z=-a*.33; } K.box(.3*M,.3*M,3.6*M,steel,0,Hm,0,g);
      const piv=new THREE.Group(); piv.position.y=Hm; g.add(piv); const boat=new THREE.Group(); boat.position.y=-5.4*M; piv.add(boat); for(const s of [-1,1])K.box(.08*M,5.4*M,.08*M,steel,0,2.7*M,s*1.2*M,boat);
      K.box(8*M,.9*M,2.2*M,wood,0,-.1*M,0,boat); K.box(8.6*M,.25*M,2.6*M,K.mat(0x8a5a2a),0,.45*M,0,boat); for(const e of [-1,1]){ const bow=K.box(1.2*M,1.6*M,2.2*M,wood,e*4.3*M,.6*M,0,boat); bow.rotation.z=-e*.5; }
      K.mesh(new THREE.PlaneGeometry(2.2*M,1.6*M),K.mat(0xf0ece0,{side:THREE.DoubleSide}),0,2.4*M,0,boat); K.cyl(.05*M,.05*M,3.4*M,wood,0,2.2*M,0,boat,6);
      for(let i=0;i<4;i++)for(const s of [-1,1]){ const x=(i-1.5)*1.8*M; bench(K,boat,1.1*M,0x3a3a44,x,.55*M,s*.6*M,s>0?PI:0); seats.push(seatAt(boat,x,.6*M,s*.65*M,s>0?PI:0)); }
      return {seats,tick:(run)=>{ const amp=ease(Math.min(1,run*2.5))*ease(Math.min(1,(1-run)*2.5)); piv.rotation.z=Math.sin(run*TAU*7)*1.25*amp; }}; }});

  /* ---------- THE TEACUPS: three turntables on one, nine cups that spin on their own ---------- */
  FAIR.ride({id:'cups',name:'TEACUPS',x:-90,y:-2,hd:0,cycle:75,load:26,seats:9,price:1,solid:[13,13],reach:8*T,say:'YOU SIT IN THE CUP. GRAB THE WHEEL.',
    make:(g,K)=>{ const Rp=6*M, seats=[], big=new THREE.Group(); g.add(big); K.cyl(Rp,Rp,.3*M,K.mat(0x4a7ab0),0,.15*M,0,big,32); const CC=[0xf0b0c8,0xa0e0d0,0xf0e0a0,0xc0b0f0,0xf0c0a0,0xb0e0a0,0xe0b0b0,0xa0c8f0,0xf0d8d0], cups=[]; let k=0;
      for(let t=0;t<3;t++){ const ta=t*TAU/3, tt=new THREE.Group(); tt.position.set(Math.sin(ta)*3.4*M,.3*M,Math.cos(ta)*3.4*M); big.add(tt); K.cyl(2.3*M,2.3*M,.2*M,K.mat(0xe9b53a),0,.1*M,0,tt,24);
        for(let c=0;c<3;c++){ const ca=c*TAU/3, cup=new THREE.Group(); cup.position.set(Math.sin(ca)*1.35*M,.2*M,Math.cos(ca)*1.35*M); tt.add(cup); const m=K.mat(CC[k%CC.length]); const wall=K.mesh(new THREE.CylinderGeometry(.85*M,.6*M,.9*M,16,1,true),K.mat(CC[k%CC.length],{side:THREE.DoubleSide}),0,.45*M,0,cup); K.cyl(.6*M,.6*M,.1*M,m,0,.05*M,0,cup,16);
          K.mesh(new THREE.TorusGeometry(.3*M,.03*M,6,16),K.mat(0x202428),0,.8*M,0,cup).rotation.x=PI/2; K.mesh(new THREE.TorusGeometry(.5*M,.12*M,8,16),m,0,.95*M,0,cup).rotation.x=PI/2;
          const sp=seatAt(cup,0,.42*M,-.3*M,0); seats.push(sp); cups.push({cup,s:1+(k%3)*.4,dir:k%2?1:-1}); k++; } cups.push({tt,dir:t%2?1:-1}); }
      return {seats,tick:(run)=>{ const w=ease(Math.min(1,run*3))*ease(Math.min(1,(1-run)*3)); big.rotation.y=TAU*2.5*run; for(const q of cups){ if(q.tt)q.tt.rotation.y=-TAU*4*run*q.dir; else q.cup.rotation.y=TAU*7*run*q.s*q.dir*w; } }}; }});

  /* ---------- THE SCRAMBLER: three arms, four cars each, the cars spun the other way ---------- */
  FAIR.ride({id:'scrambler',name:'SCRAMBLER',x:-106,y:197,hd:0,cycle:70,load:24,seats:12,price:1,solid:[11,11],reach:7*T,say:'YOU SLIDE IN. THE BAR CLICKS DOWN.',
    make:(g,K)=>{ const seats=[], hub=new THREE.Group(); hub.position.y=1.2*M; g.add(hub); K.cyl(.6*M,.8*M,1.2*M,K.mat(0x3a4a8a),0,.6*M,0,g,12); const arms=[];
      for(let a=0;a<3;a++){ const aa=a*TAU/3, arm=new THREE.Group(); arm.rotation.y=aa; hub.add(arm); K.box(3.2*M,.2*M,.3*M,K.mat(0xe9b53a),1.6*M,.8*M,0,arm); const sub=new THREE.Group(); sub.position.set(3.2*M,0,0); arm.add(sub); K.cyl(.2*M,.2*M,1*M,K.mat(0x3a4a8a),0,.4*M,0,sub,8);
        for(let c=0;c<4;c++){ const ca=c*TAU/4, car=new THREE.Group(); car.position.set(Math.sin(ca)*1.5*M,0,Math.cos(ca)*1.5*M); car.rotation.y=ca; sub.add(car); K.box(1.4*M,.1*M,.3*M,K.mat(0x8a8f98),-.75*M,.6*M,0,car);
          const col=K.mat([0xd84a3a,0x3a8ad8,0x4ab860,0xe9b53a][c]); K.box(1.1*M,.5*M,1*M,col,0,-.3*M,0,car); K.box(1.1*M,.7*M,.1*M,col,0,.1*M,-.5*M,car); seats.push(seatAt(car,0,-.05*M,-.15*M,0)); } arms.push(sub); }
      return {seats,tick:(run)=>{ const w=ease(Math.min(1,run*3))*ease(Math.min(1,(1-run)*3)); hub.rotation.y=TAU*6*run*w; for(const s of arms)s.rotation.y=-TAU*9*run*w; }}; }});

  /* ---------- THE DROP TOWER: eight seats ride a 22 m mast, hang at the top, fall and catch ---------- */
  FAIR.ride({id:'drop',name:'DROP TOWER',x:-83.5,y:80,hd:0,cycle:70,load:28,seats:8,price:2,solid:[5,5],reach:5*T,say:'THE HARNESS LOCKS. LOOK DOWN.',
    make:(g,K)=>{ const Hm=22*M, seats=[], steel=K.mat(0xb0b4bc); K.box(1*M,Hm,1*M,steel,0,Hm/2,0,g); for(let y=2*M;y<Hm;y+=2*M)K.box(1.4*M,.1*M,1.4*M,K.mat(0xd84a3a),0,y,0,g); K.box(2*M,.6*M,2*M,steel,0,Hm+.3*M,0,g);
      const car=new THREE.Group(); car.position.y=1.2*M; g.add(car); K.mesh(new THREE.TorusGeometry(1.6*M,.2*M,8,24),K.mat(0xe9b53a),0,0,0,car).rotation.x=PI/2; K.box(1.3*M,.6*M,1.3*M,steel,0,.3*M,0,car);
      for(let i=0;i<8;i++){ const a=i*TAU/8, s=new THREE.Group(); s.position.set(Math.sin(a)*1.9*M,0,Math.cos(a)*1.9*M); s.rotation.y=a; car.add(s); K.box(.6*M,.1*M,.5*M,K.mat(0x3a3a44),0,0,0,s); K.box(.6*M,.7*M,.1*M,K.mat(0x3a3a44),0,.35*M,-.25*M,s); K.box(.5*M,.08*M,.3*M,K.mat(0xd84a3a),0,.5*M,.1*M,s); seats.push(seatAt(s,0,.05*M,-.05*M,0)); }
      return {seats,tick:(run)=>{ let y; const top=Hm-2*M; if(run<.45)y=1.2*M+(top-1.2*M)*ease(run/.45); else if(run<.62)y=top; else if(run<.72){ const f=(run-.62)/.1; y=top-(top-2.2*M)*f*f; } else if(run<.82){ const f=(run-.72)/.1; y=2.2*M+Math.sin(f*PI)*5*M*(1-f); } else y=2.2*M-(2.2*M-1.2*M)*ease((run-.82)/.18); car.position.y=y; }}; }});

  /* ---------- THE SLINGSHOT: a two-seat pod fired up between two towers on its cords ---------- */
  FAIR.ride({id:'sling',name:'SLINGSHOT',x:-83.5,y:97,hd:0,cycle:60,load:30,seats:2,price:3,solid:[7,3],reach:5*T,say:'YOU STRAP INTO THE POD. BREATHE.',
    make:(g,K)=>{ const Hm=13*M, seats=[], steel=K.mat(0xd8d8e0); for(const s of [-1,1]){ K.box(.5*M,Hm,.5*M,steel,s*2.8*M,Hm/2,0,g); K.box(.9*M,.3*M,.9*M,K.mat(0xd84a3a),s*2.8*M,Hm,0,g); }
      const pod=new THREE.Group(); pod.position.y=1.1*M; g.add(pod); K.mesh(new THREE.SphereGeometry(.9*M,12,8,0,TAU,0,PI*.6),K.mat(0x3a8ad8,{side:THREE.DoubleSide}),0,.6*M,0,pod); K.cyl(.8*M,.8*M,.15*M,K.mat(0x202428),0,0,0,pod,12);
      for(const s of [-1,1]){ bench(K,pod,.6*M,0x3a3a44,s*.35*M,.1*M,0,0); seats.push(seatAt(pod,s*.35*M,.15*M,0,0)); }
      const cords=[]; for(const s of [-1,1]){ const c=K.cyl(.025*M,.025*M,1,K.mat(0xe9b53a),0,0,0,g,4); cords.push({c,s}); }
      const A=new V3(), B=new V3(), D=new V3();
      return {seats,tick:(run)=>{ let y=1.1*M; if(run>.2&&run<.9){ const f=(run-.2)/.7; y=1.1*M+Math.abs(Math.sin(f*PI*3))*Math.exp(-f*2.2)*24*M; } pod.position.y=y;
        for(const q of cords){ A.set(q.s*2.8*M,Hm,0); B.set(0,y+.4*M,0); D.subVectors(B,A); const L=D.length(); q.c.position.copy(A).addScaledVector(D,.5); q.c.scale.y=L; q.c.quaternion.setFromUnitVectors(UP,D.normalize()); } }}; }});

  /* ---------- THE ROLLER COASTER: a chain lift up the west side, the big drop, a helix and the hills home; a train of three cars ---------- */
  const COASTER=[[18,.6,-26],[10,.6,-26],[-2,.6,-25],[-12,1,-24],[-18,4,-20],[-21,9,-12],[-22,14,-2],[-22,16.5,6],[-21,15.5,12],[-17,6,18],[-12,1.2,22],[-6,2.5,24],[0,6,24],[6,9,22],[10,8,16],[9,4,10],[4,2,8],[-2,3.5,6],[-7,6,2],[-6,8.5,-4],[0,8,-8],[6,5,-10],[10,2.5,-12],[14,1.5,-16],[17,2.5,-20],[18,1.2,-24]].map(p=>[p[0]*.8,p[1],p[2]*.88]);
  FAIR.ride({id:'coaster',name:'ROLLER COASTER',x:-102,y:41,hd:0,cycle:120,load:30,seats:6,price:3,reach:5*T,near:12,say:'THE BAR LOCKS OVER YOUR LAP. THE CHAIN CATCHES.',photoAt:.33,
    make:(g,K,R)=>{ const curve=loop(COASTER), L=curve.getLength(), seats=[], n=360; rails(K,g,curve,n,1*M,0xc83a2a,.07*M); ties(K,g,curve,n,1.4*M,0x4a4a52); supports(K,g,curve,90,0x6a6f78);
      K.mesh(extrude(curve,SQ(.1*M).map(([x,y])=>[x,y-.25*M]),n),0x7a7f88,0,0,0,g);
      // the station: a platform either side of the track's start, a roof on posts
      const st=new THREE.Group(); st.position.set(11.2*M,0,-25*M); g.add(st); for(const s of [-1,1])K.box(10*M,.5*M,1.4*M,K.mat(0x8a8478),0,.25*M,s*1.6*M,st); for(const x of [-4,4])for(const s of [-1,1])K.box(.2*M,3.6*M,.2*M,K.mat(0x3a3a44),x*M,1.8*M,s*2.2*M,st); K.box(11*M,.2*M,5.4*M,K.mat(0xd84a3a),0,3.7*M,0,st);
      const sg=K.sign('THE STRANGEST COASTER',6*M,1*M,'#1a1418','#ffd36a',{glow:1}); sg.position.set(0,3.2*M,2.75*M); st.add(sg);
      const cars=[], P=new V3(), Rr=new V3(), U=new V3(), Tg=new V3(), B=new THREE.Matrix4();
      for(let c=0;c<3;c++){ const car=new THREE.Group(); g.add(car); const col=K.mat([0xd84a3a,0xe9b53a,0x3a8ad8][c]); K.box(1.3*M,.5*M,2*M,col,0,.45*M,0,car); K.box(1.4*M,.2*M,.4*M,K.mat(0x202428),0,.75*M,1*M,car); for(const s of [-1,1])for(const z of [-.7,.7])K.cyl(.14*M,.14*M,.1*M,K.mat(0x202428),s*.6*M,.2*M,z*M,car,10).rotation.z=PI/2;
        for(const z of [.35,-.55]){ K.box(1.1*M,.1*M,.5*M,K.mat(0x3a3a44),0,.7*M,z*M,car); K.box(1.1*M,.5*M,.08*M,K.mat(0x3a3a44),0,.95*M,(z-.25)*M,car); K.box(1*M,.06*M,.12*M,K.mat(0x202428),0,1.05*M,(z+.2)*M,car); seats.push(seatAt(car,0,.72*M,z*M,0)); } cars.push(car); }
      const pf=profile(curve,L,.33,2.2*M,3*M); R.def.cycle=Math.round(pf.run)+R.def.load; let shot=false, lastU=0;
      return {seats,tick:(run,u,stopped)=>{ const t=run*pf.run, s=pf.at(t); for(let c=0;c<3;c++){ const uc=(((s-c*2.3*M)/L)%1+1)%1; place(curve,uc,cars[c],P,Rr,U,Tg,B); }
        if(stopped)shot=false; else if(R.me!=null&&!shot&&run>R.def.photoAt){ shot=true; snap(R,cars[0]); } if(!stopped&&run<.33&&R.me!=null&&Math.floor(u*4)!==Math.floor(lastU*4)&&SFX.play)SFX.play('clunk',{vol:.25,pitch:1.4}); lastU=u; }}; }});
  // the ride photo: taken over the front car at the drop, kept with your photos
  const snap=(R,car)=>{ try{ const p=car.getWorldPosition(new V3()), q=car.getWorldQuaternion(new THREE.Quaternion()), f=new V3(0,0,1).applyQuaternion(q); const hd=Math.atan2(f.x,f.z), ph=PHOTOS.take(p.x+f.x*2.5*M,p.y+1.6*M,p.z+f.z*2.5*M,hd+PI,-.3,'THE '+R.def.name); ph.cap='THE '+R.def.name+' · '+ph.cap.split(' · ').pop(); PHOTOS.mine.push(ph); if(PHOTOS.save)PHOTOS.save(); say('THE CAMERA FLASHES. YOUR RIDE PHOTO IS IN YOUR PHOTOS.','#e8e2cc'); if(SFX.play)SFX.play('click',{vol:.5,pitch:1.6}); }catch(e){ console.warn('ride photo',e); } };

  /* ---------- THE LOG FLUME: logs float the trough, climb the lift, drop the chute into the splash pool ---------- */
  const FLUME=[[8,.6,-8],[8,.6,0],[8,.6,6],[4,.6,10],[-2,.8,10],[-6,3,8],[-8,7,2],[-8,8.5,-3],[-7,8.5,-6],[-4,2,-10],[0,.6,-11],[5,.6,-10]].map(p=>[p[0],p[1],p[2]*.9]);
  FAIR.ride({id:'flume',name:'LOG FLUME',x:-114,y:86,hd:0,cycle:80,load:26,seats:4,price:2,reach:5*T,near:10,say:'YOU SIT IN THE LOG. IT ROCKS.',photoAt:.78,
    make:(g,K,R)=>{ const curve=loop(FLUME), L=curve.getLength(), n=240, seats=[]; g.add(K.mesh(extrude(curve,[[-.9*M,.9*M],[-.9*M,0],[-.75*M,-.15*M],[.75*M,-.15*M],[.9*M,0],[.9*M,.9*M]],n),0x7a8a90,0,0,0)); const water=K.mesh(extrude(curve,[[-.8*M,.35*M],[.8*M,.35*M],[.8*M,.3*M],[-.8*M,.3*M]],n),new THREE.MeshLambertMaterial({color:0x3a8ad8,transparent:true,opacity:.75}),0,0,0,g);
      supports(K,g,curve,60,0x6a6f78,1*M); K.cyl(4*M,4*M,.5*M,K.mat(0x2a6ab0),0,.25*M,-9.9*M,g,24); K.cyl(4.2*M,4.2*M,.2*M,K.mat(0x8a8478),0,.05*M,-9.9*M,g,24);
      const st=new THREE.Group(); st.position.set(8*M,0,-1*M); g.add(st); for(const s of [-1,1])K.box(1.6*M,.4*M,8*M,K.mat(0x8a8478),s*1.8*M,.2*M,0,st); K.box(5*M,.2*M,9*M,K.mat(0x4ab860),0,3.4*M,0,st); for(const x of [-1,1])for(const z of [-1,1])K.box(.2*M,3.4*M,.2*M,K.mat(0x3a3a44),x*2.2*M,1.7*M,z*4*M,st);
      const logs=[], P=new V3(), Rr=new V3(), U=new V3(), Tg=new V3(), B=new THREE.Matrix4();
      for(let c=0;c<2;c++){ const log=new THREE.Group(); g.add(log); const body=K.cyl(.55*M,.55*M,3.2*M,K.mat(0x6a4a2a),0,.5*M,0,log,10); body.rotation.x=PI/2; K.box(1*M,.5*M,2.6*M,K.mat(0x8a5a2a),0,.8*M,0,log); for(const z of [.6,-.6]){ K.box(.8*M,.08*M,.5*M,K.mat(0x3a3a44),0,1.05*M,z*M,log); K.box(.8*M,.4*M,.08*M,K.mat(0x3a3a44),0,1.25*M,(z-.25)*M,log); seats.push(seatAt(log,0,1.08*M,z*M,0)); } logs.push(log); }
      const pf=profile(curve,L,.62,1.6*M,1.8*M); R.def.cycle=Math.round(pf.run)+R.def.load; const spl=K.mesh(new THREE.SphereGeometry(1.6*M,10,6),new THREE.MeshBasicMaterial({color:0xe8f4ff,transparent:true,opacity:.6}),0,0,0,g); spl.visible=false; let shot=false;
      return {seats,tick:(run,u,stopped)=>{ const s=pf.at(run*pf.run); for(let c=0;c<2;c++){ const uc=(((s-c*4*M)/L)%1+1)%1; place(curve,uc,logs[c],P,Rr,U,Tg,B); logs[c].rotation.z+=Math.sin(u*5+c)*.03; }
        const f=run; spl.visible=!stopped&&f>.8&&f<.86; if(spl.visible){ spl.position.copy(logs[0].position); spl.scale.setScalar(.5+(f-.8)*12); spl.material.opacity=.7-(f-.8)*10; } if(stopped)shot=false; else if(R.me!=null&&!shot&&run>R.def.photoAt){ shot=true; snap(R,logs[0]); } }}; }});

  /* ---------- THE HAUNTED DARK RIDE: cars crawl a loop through black walls past the things that jump out ---------- */
  const DARK=[[4,.3,-8],[4,.3,-2],[3,.3,3],[-1,.3,5],[-4,.3,2],[-4,.3,-3],[-2,.3,-6],[1,.3,-8]];
  FAIR.ride({id:'dark',name:'HAUNTED RIDE',x:-93,y:85,hd:0,cycle:75,load:24,seats:6,price:2,reach:5*T,near:10,solid:[14,19],op:[6,-11.5,0],say:'THE CAR JERKS FORWARD INTO THE DARK.',
    make:(g,K,R)=>{ const curve=loop(DARK), L=curve.getLength(), n=120, seats=[], blk=K.mat(0x121014), W=12*M, D=16*M, H=4*M; g.add(K.mesh(extrude(curve,[[-.5*M,.1*M],[.5*M,.1*M],[.5*M,-.1*M],[-.5*M,-.1*M]],n),0x303038,0,0,0));
      // the walls, a doorway on the south where the track comes and goes, bones and paint on the front
      K.box(W,H,.4*M,blk,0,H/2,D/2,g); K.box(.4*M,H,D,blk,-W/2,H/2,0,g); K.box(.4*M,H,D,blk,W/2,H/2,0,g); K.box(W*.5,H,.4*M,blk,-W*.25,H/2,-D/2,g); K.box(W*.15,H,.4*M,blk,W*.42,H/2,-D/2,g); K.box(W,.6*M,.4*M,blk,0,H-.3*M,-D/2,g);
      for(let i=0;i<4;i++)K.box(W,.25*M,.25*M,K.mat(0x2a2430),0,H-.1*M,-D/2+D*(i+.5)/4,g); const sg=K.sign('HAUNTED',5*M,1.3*M,'#0a0608','#a0ff80',{glow:1}); sg.position.set(0,H+.5*M,-D/2+.21*M); sg.rotation.y=PI; g.add(sg); K.box(6*M,1.6*M,.3*M,blk,0,H+.5*M,-D/2+.05*M,g);
      const spooks=[]; const spook=(x,z,ry,c,txt)=>{ const m=K.sign(txt,1.6*M,1.6*M,'#000000',c,{glow:1}); m.position.set(x*M,1.5*M,z*M); m.rotation.y=ry; m.visible=false; g.add(m); spooks.push({m,x:x*M,z:z*M,on:0}); };
      spook(4,1,PI/2,'#a0ff80','BOO'); spook(-1.5,5.2,PI,'#ff6060','☠'); spook(-4.6,-1,-PI/2,'#80c0ff','👁'); spook(-1,-6.6,0,'#ffd36a','!!');
      for(const q of spooks){ const l=K.lamp(g.position.x+q.x,2.2*M,g.position.z+q.z,0xa0ff80,6,0); q.l=l; }
      FAIR.post('dark',-93,76.5,0,0);
      const cars=[], P=new V3(), Rr=new V3(), U=new V3(), Tg=new V3(), B=new THREE.Matrix4();
      for(let c=0;c<3;c++){ const car=new THREE.Group(); g.add(car); K.box(1.3*M,.5*M,1.8*M,K.mat(0x3a2a44),0,.45*M,0,car); for(const z of [.3,-.5]){ K.box(1.1*M,.08*M,.5*M,K.mat(0x202428),0,.7*M,z*M,car); K.box(1.1*M,.5*M,.08*M,K.mat(0x202428),0,.95*M,(z-.25)*M,car); seats.push(seatAt(car,0,.72*M,z*M,0)); } cars.push(car); }
      return {seats,tick:(run,u,stopped)=>{ const s=run*L; for(let c=0;c<3;c++){ const uc=(((s-c*2.6*M)/L)%1+1)%1; place(curve,uc,cars[c],P,Rr,U,Tg,B); }
        for(const q of spooks){ const d=Math.hypot(cars[0].position.x-q.x,cars[0].position.z-q.z); const on=!stopped&&d<2.4*M; if(on&&!q.on){ q.on=1; if(R.me!=null&&SFX.play)SFX.play('boom',{vol:.25,pitch:1.8}); } if(!on)q.on=0; q.m.visible=on; q.l.intensity=on?8:0; } }}; }});

  /* ---------- THE MINIATURE RAILWAY: a little steam train round the coaster's field, six seats behind the engine ---------- */
  const RAIL=[[0,.3,25],[-10,.3,25],[-16,.3,23],[-17.5,.3,10],[-17.5,.3,-10],[-16,.3,-23],[0,.3,-25],[16,.3,-23],[17.5,.3,-10],[17.5,.3,10],[16,.3,23],[10,.3,25]];
  FAIR.ride({id:'rail',name:'MINIATURE RAILWAY',x:-102,y:41,hd:0,cycle:110,load:30,seats:6,price:1,reach:5*T,near:12,say:'ALL ABOARD. TOOT TOOT.',
    make:(g,K,R)=>{ const curve=loop(RAIL), L=curve.getLength(), n=300, seats=[]; rails(K,g,curve,n,.6*M,0x6a6f78,.04*M); ties(K,g,curve,220,.9*M,0x5a4634);
      const st=new THREE.Group(); st.position.set(0,0,25.6*M); g.add(st); K.box(7*M,.35*M,1.6*M,K.mat(0x8a8478),0,.17*M,1.3*M,st); K.box(7.4*M,.15*M,3.4*M,K.mat(0x4ab860),0,3*M,1.2*M,st); for(const x of [-1,1])K.box(.15*M,3*M,.15*M,K.mat(0x3a3a44),x*3.4*M,1.5*M,2.6*M,st); const sg=K.sign('FAIR HALT',2.4*M,.6*M); sg.position.set(0,2.4*M,2.65*M); st.add(sg);
      const train=[], P=new V3(), Rr=new V3(), U=new V3(), Tg=new V3(), B=new THREE.Matrix4();
      { const loco=new THREE.Group(); g.add(loco); const grn=K.mat(0x2a6a3a), blk=K.mat(0x202428); K.box(.9*M,.5*M,2.2*M,blk,0,.4*M,0,loco); K.cyl(.4*M,.4*M,1.4*M,grn,0,.9*M,.3*M,loco,12).rotation.x=PI/2; K.box(.9*M,.9*M,.7*M,grn,0,1*M,-.7*M,loco); K.cyl(.14*M,.18*M,.5*M,blk,0,1.55*M,.8*M,loco,8); K.box(.8*M,.08*M,.8*M,grn,0,1.5*M,-.7*M,loco); for(const s of [-1,1])for(const z of [-.6,.6])K.cyl(.22*M,.22*M,.1*M,blk,s*.48*M,.22*M,z*M,loco,10).rotation.z=PI/2; train.push(loco); }
      for(let c=0;c<3;c++){ const car=new THREE.Group(); g.add(car); const col=K.mat([0xd84a3a,0xe9b53a,0x3a8ad8][c]); K.box(.9*M,.3*M,1.8*M,col,0,.4*M,0,car); for(const s of [-1,1])for(const z of [-.6,.6])K.cyl(.18*M,.18*M,.08*M,K.mat(0x202428),s*.48*M,.18*M,z*M,car,10).rotation.z=PI/2; for(const z of [.35,-.5]){ bench(K,car,.8*M,0x3a3a44,0,.56*M,z*M,0); seats.push(seatAt(car,0,.6*M,z*M,0)); } train.push(car); }
      return {seats,tick:(run)=>{ const f=run, sm=L*(f<.1?f*f/.1*.5:f>.9?1-(1-f)*(1-f)/.1*.5:.05+(f-.1)*1.125); for(let c=0;c<4;c++){ const uc=(((sm+1.2*M-c*2.3*M)/L)%1+1)%1; place(curve,uc,train[c],P,Rr,U,Tg,B); } }}; }});

  /* ---------- THE SKY RIDE: chairs on a cable the length of the fair, low at the two stations, high over everything between ---------- */
  const SKY=(()=>{ const pts=[]; const x0=0, lift=12*M, low=2.8*M, Ly=(205-(-58))*T*.86; for(const s of [-1,1]){ const xx=x0+s*1.6*M; const seq=s<0?[[-Ly/2,low],[-Ly/2+8*M,lift],[0,lift],[Ly/2-8*M,lift],[Ly/2,low]]:[[Ly/2,low],[Ly/2-8*M,lift],[0,lift],[-Ly/2+8*M,lift],[-Ly/2,low]]; for(const [z,y] of seq)pts.push(new V3(xx,y,z)); }
    const c=new THREE.CatmullRomCurve3(pts,true,'catmullrom',.2); c.arcLengthDivisions=800; return c; })();
  FAIR.ride({id:'sky',name:'SKY RIDE',x:-125.5,y:73.5,hd:0,cycle:200,load:0,seats:14,price:2,anytime:true,reach:5*T,near:10,say:'THE CHAIR SCOOPS YOU UP.',can:(R,i)=>R.seats[i].getWorldPosition(new V3()).y<3.6*M,
    make:(g,K,R)=>{ const curve=SKY, L=curve.getLength(), seats=[]; g.add(K.mesh(extrude(curve,SQ(.025*M),400),0x303038,0,0,0));
      const P=new V3(); for(let i=0;i<=12;i++){ const u=i/12; curve.getPointAt(u*.5,P); if(P.y>5*M){ K.box(.35*M,P.y,.35*M,K.mat(0x8a8f98),0,P.y/2,P.z,g); K.box(4.2*M,.25*M,.35*M,K.mat(0x8a8f98),0,P.y+.1*M,P.z,g); for(const s of [-1,1])K.box(.3*M,.5*M,.3*M,K.mat(0x202428),s*1.6*M,P.y+.4*M,P.z,g); } }
      for(const s of [-1,1]){ const z=s*(205-(-58))*T*.43; K.box(5*M,.4*M,6*M,K.mat(0x8a8478),0,.2*M,z,g); K.box(5.4*M,.2*M,6.4*M,K.mat(0x3a8ad8),0,3.9*M,z,g); for(const x of [-1,1])for(const zz of [-1,1])K.box(.2*M,3.8*M,.2*M,K.mat(0x3a3a44),x*2.5*M,1.9*M,z+zz*2.9*M,g); FAIR.post(s<0?'skyS':'skyN',-125.5+2.6,73.5+z/T,s<0?0:PI,0); }
      const chairs=[], Rr=new V3(), U=new V3(), Tg=new V3(), B=new THREE.Matrix4();
      for(let i=0;i<14;i++){ const ch=new THREE.Group(); g.add(ch); K.cyl(.04*M,.04*M,1.6*M,K.mat(0x202428),0,-.8*M,0,ch,6); const sb=new THREE.Group(); sb.position.y=-1.6*M; ch.add(sb); const col=K.mat([0xd84a3a,0x3a8ad8,0xe9b53a][i%3]); K.box(1.3*M,.1*M,.5*M,col,0,0,0,sb); K.box(1.3*M,.6*M,.08*M,col,0,.3*M,-.25*M,sb); K.box(1.2*M,.06*M,.06*M,K.mat(0x202428),0,.45*M,.25*M,sb); seats.push(seatAt(sb,0,.05*M,-.05*M,0)); chairs.push(ch); }
      return {seats,tick:(run,u)=>{ const s=(u/R.def.cycle)*L; for(let i=0;i<14;i++){ const uc=(((s+i*L/14)/L)%1+1)%1; frame(curve,uc,P,Rr,U,Tg); chairs[i].position.copy(P); chairs[i].rotation.set(0,Math.atan2(Tg.x,Tg.z),0); } }}; }});
}
