const RIGNPC={};
{ const V1=new THREE.Vector3(), M1=new THREE.Matrix4();
  RIGNPC.make=(def,o)=>{ const bones=[], by={};
    for(const [n,pa,at] of def.bones){ const B=new THREE.Bone(); B.name=n; B.userData.at=at; const P=pa&&by[pa];
      if(P){ const q=P.userData.at; B.position.set(at[0]-q[0],at[1]-q[1],at[2]-q[2]); P.add(B); } else B.position.set(at[0],at[1],at[2]);
      B.userData.rest=B.position.clone(); by[n]=B; bones.push(B); }
    bones[0].updateMatrixWorld(true); const skeleton=new THREE.Skeleton(bones);
    let n=0; for(const p of def.parts)for(const s of p.of)n+=s.P.length/3;
    const P=new Float32Array(n*3), C=new Float32Array(n*3), R=new Float32Array(n), SI=new Uint16Array(n*4), SW=new Float32Array(n*4), ranges={}; let at=0, top=0;
    def.parts.forEach((p,pi)=>{ const start=at, bi=bones.indexOf(by[p.bone]); for(const s of p.of){ P.set(s.P,at*3); C.set(s.C,at*3); at+=s.P.length/3; }
      R.fill(pi,start,at); for(let i=start;i<at;i++){ SI[i*4]=bi; SW[i*4]=1; top=Math.max(top,P[i*3+1]); } ranges[p.name]={start,count:at-start}; });
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setAttribute('color',new THREE.BufferAttribute(C,3)); geo.setAttribute('reg',new THREE.BufferAttribute(R,1));
    geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4)); geo.setAttribute('skinWeight',new THREE.BufferAttribute(SW,4));
    const SP=Object.entries(def.springs||{}).map(([b,s])=>({B:by[b],k:s.k||60,c:s.c||7,f:s.f||0,s:s.s||0,y:s.y||0,lim:s.lim||.8,x:0,z:0,w:0,vx:0,vz:0,vw:0}));
    const c={B:by,t:0,mv:0,dist:0,still:0,spd:0,af:0,as:0,turn:0,look:0,lookTo:0,lookT:3+Math.random()*5,o,
      kick:(b,ax,v)=>{ const s=SP.find(q=>q.B===by[b]); if(s)s['v'+ax]+=v; },
      at:(b,p,out)=>{ const B=by[b], q=B.userData.at; bones[0].updateMatrixWorld(true); out.set(p[0]-q[0],p[1]-q[1],p[2]-q[2]).applyMatrix4(B.matrixWorld); return bones[0].worldToLocal(out); }};
    let px=null, pz=0, ph=0, svx=0, svz=0, pvx=0, pvz=0;
    const anim=(dt,moving,st,s)=>{ if(!dt)return; c.t+=dt; c.st=st; c.sheet=N.sheet; c.dt=dt;
      if(px===null||Math.hypot(st.x-px,st.z-pz)>TILE){ px=st.x; pz=st.z; ph=st.h; }
      const vx=(st.x-px)/dt, vz=(st.z-pz)/dt, k=1-Math.exp(-dt/.12); px=st.x; pz=st.z; svx+=(vx-svx)*k; svz+=(vz-svz)*k;
      const ax=(svx-pvx)/dt*.84/TILE, az=(svz-pvz)/dt*.84/TILE; pvx=svx; pvz=svz; const sh=Math.sin(st.h), ch=Math.cos(st.h);
      c.af=ax*sh+az*ch; c.as=ax*ch-az*sh; c.spd=Math.hypot(svx,svz)*.84/TILE; c.dist+=Math.hypot(vx,vz)*dt/s;
      const dh=((st.h-ph+Math.PI*3)%(Math.PI*2))-Math.PI; ph=st.h; c.turn+=(dh/dt-c.turn)*Math.min(1,dt*6);
      c.mv=Math.max(0,Math.min(1,c.mv+(moving?dt:-dt)*6)); c.still=moving?0:c.still+dt;
      if(!moving&&(c.lookT-=dt)<=0){ c.lookT=4+Math.random()*7; c.lookTo=Math.random()<.4?0:(Math.random()-.5)*1.2; } if(moving)c.lookTo=0; c.look+=(c.lookTo-c.look)*Math.min(1,dt*3);
      for(const B of bones){ B.position.copy(B.userData.rest); B.rotation.set(0,0,0); B.scale.set(1,1,1); }
      def.pose(c,dt,moving);
      const n=Math.min(4,Math.ceil(dt/.017)), h=dt/n;
      for(const q of SP){ const tx=q.f*c.af, tz=q.s*c.as, tw=q.y*c.as;
        for(let i=0;i<n;i++){ q.vx+=(q.k*(tx-q.x)-q.c*q.vx)*h; q.vz+=(q.k*(tz-q.z)-q.c*q.vz)*h; q.vw+=(q.k*(tw-q.w)-q.c*q.vw)*h; q.x+=q.vx*h; q.z+=q.vz*h; q.w+=q.vw*h; }
        q.x=Math.max(-q.lim,Math.min(q.lim,q.x)); q.z=Math.max(-q.lim,Math.min(q.lim,q.z)); q.w=Math.max(-q.lim,Math.min(q.lim,q.w));
        if(!moving&&Math.abs(q.x)+Math.abs(q.z)+Math.abs(q.w)<.004&&Math.abs(q.vx)+Math.abs(q.vz)+Math.abs(q.vw)<.03){ q.x=q.z=q.w=q.vx=q.vz=q.vw=0; }
        q.B.rotation.x+=q.x; q.B.rotation.z+=q.z; q.B.rotation.y+=q.w; } };
    const N=makeNPC(null,Object.assign({names:def.parts.map(p=>p.name),rank:def.parts.map(p=>p.rank||0),geo,skin:{bones,skeleton},tall:top,anim},o));
    N.B=by; N.parts=ranges; N.tris=n/3; N.rig=c;
    const p0=N.push; let bumped=false; N.push=p=>{ const d=Math.hypot(p.x-N.st.x,p.z-N.st.z); if(d<N.st.R+.3){ if(!bumped){ bumped=true; for(const q of SP){ q.vx+=(Math.random()-.5)*6; q.vz+=(Math.random()-.5)*6; } } } else if(d>N.st.R+.45)bumped=false; p0(p); };
    const base=Float32Array.from(P), baseC=Float32Array.from(C);
    N.reshape=(name,{scale=[1,1,1],move=[0,0,0]}={})=>{ const r=ranges[name]; if(!r)return; const A=geo.attributes.position.array; let cx=0, cy=0, cz=0;
      for(let i=r.start;i<r.start+r.count;i++){ cx+=base[i*3]; cy+=base[i*3+1]; cz+=base[i*3+2]; } cx/=r.count; cy/=r.count; cz/=r.count;
      for(let i=r.start;i<r.start+r.count;i++){ A[i*3]=cx+(base[i*3]-cx)*scale[0]+move[0]; A[i*3+1]=cy+(base[i*3+1]-cy)*scale[1]+move[1]; A[i*3+2]=cz+(base[i*3+2]-cz)*scale[2]+move[2]; }
      geo.attributes.position.needsUpdate=true; N.renorm(); };
    N.recolour=(name,col)=>{ const r=ranges[name]; if(!r)return; const A=geo.attributes.color.array; for(let i=r.start;i<r.start+r.count;i++)for(let j=0;j<3;j++)A[i*3+j]=col?col[j]:baseC[i*3+j]; geo.attributes.color.needsUpdate=true; };
    return N; };
  RIGNPC.walk=(c,{legs=['legL','legR'],arms=['armL','armR'],body='hips',leg=.5,arm=.45,bob=.025,rock=.04}={})=>{ const B=c.B, ph=c.st.ph, m=c.mv, sw=Math.sin(ph)*m;
    if(c.sheet){ if(arms[0])B[arms[0]].rotation.z=-1.25; if(arms[1])B[arms[1]].rotation.z=1.25; if(legs[0]){ B[legs[0]].rotation.z=-.22; B[legs[1]].rotation.z=.22; } return; }
    if(legs[0]){ B[legs[0]].rotation.x=-sw*leg; B[legs[1]].rotation.x=sw*leg; }
    if(arms[0]){ B[arms[0]].rotation.x=sw*arm; B[arms[1]].rotation.x=-sw*arm; B[arms[0]].rotation.z=-.08; B[arms[1]].rotation.z=.08; }
    B[body].position.y+=Math.abs(Math.cos(ph))*bob*m; B[body].rotation.z=Math.sin(ph)*rock*m; B[body].rotation.y=sw*.06;
    if(m<1)B[body].position.y+=Math.sin(c.t*1.7)*.003*(1-m); };
  RIGNPC.hold=i=>QS.get('toonhold')?{brain:(dt,you,st)=>{ const cx=cam.position.x-you.x, cz=cam.position.z-you.z, d=Math.hypot(cx,cz)||1, k=(i-2)*1.25*TILE;
    st.to=null; st.hold=true; st.x=you.x-cz/d*k; st.z=you.z+cx/d*k; st.face={x:cam.position.x,z:cam.position.z}; }}:{}; }
