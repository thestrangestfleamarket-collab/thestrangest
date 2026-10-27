// RIGNPC: a character rig from bones and parts (smooth skin weights, see-through parts) or a baked skinned mesh; its springs, walk and limbs.
import {SHARED, THREE} from './003-shx.js';
import {B64} from './003a-skin.js';
import {QS, TILE} from './006-map-pre.js';
import {makeNPC} from './076-npc-map.js';
const RIGNPC={};
{ const V1=new THREE.Vector3(), M1=new THREE.Matrix4();
  RIGNPC.make=(def,o)=>{ const bones=[], by={}, GL=(def.parts||[]).filter(p=>p.glass); def=Object.assign({},def,{parts:(def.parts||[]).filter(p=>!p.glass)});
    for(const [n,pa,at] of def.bones){ const B=new THREE.Bone(); B.name=n; B.userData.at=at; const P=pa&&by[pa];
      if(P){ const q=P.userData.at; B.position.set(at[0]-q[0],at[1]-q[1],at[2]-q[2]); P.add(B); } else B.position.set(at[0],at[1],at[2]);
      B.userData.rest=B.position.clone(); by[n]=B; bones.push(B); }
    bones[0].updateMatrixWorld(true); const skeleton=new THREE.Skeleton(bones);
    let n=0, P, C, R, SI, SW, ranges={}, top=0;
    if(def.mesh){ const m=def.mesh; n=m.P.length/3; P=m.P; C=m.C; SI=m.SI; SW=m.SW; R=new Float32Array(n); const L=m.parts||[['body',0,n]]; def.parts=L.map(q=>({name:q[0],rank:q[3]||0})); L.forEach((q,k)=>{ ranges[q[0]]={start:q[1],count:q[2]}; R.fill(k,q[1],q[1]+q[2]); }); for(let i=0;i<n;i++)top=Math.max(top,P[i*3+1]); }
    else{ for(const p of def.parts)for(const s of p.of)n+=s.P.length/3;
      P=new Float32Array(n*3); C=new Float32Array(n*3); R=new Float32Array(n); SI=new Uint16Array(n*4); SW=new Float32Array(n*4); let at=0;
    def.parts.forEach((p,pi)=>{ const start=at, bi=bones.indexOf(by[p.bone]); for(const s of p.of){ P.set(s.P,at*3); C.set(s.C,at*3); at+=s.P.length/3; }
      R.fill(pi,start,at); let k=start; for(const s of p.of){ const n=s.P.length/3; for(let i=0;i<n;i++,k++){ const w=s.W&&s.W[i]; if(w){ for(let j=0;j<w.length/2&&j<4;j++){ SI[k*4+j]=bones.indexOf(by[w[j*2]]); SW[k*4+j]=w[j*2+1]; } } else{ SI[k*4]=bi; SW[k*4]=1; } top=Math.max(top,P[k*3+1]); } } ranges[p.name]={start,count:at-start}; }); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setAttribute('color',new THREE.BufferAttribute(C,3)); geo.setAttribute('reg',new THREE.BufferAttribute(R,1)); if(def.mesh)geo.setIndex(new THREE.BufferAttribute(def.mesh.I,1));
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
    N.B=by; N.parts=ranges; N.tris=def.mesh?def.mesh.I.length/3:n/3; N.rig=c;
    if(def.glass){ const q=def.glass, gg=new THREE.BufferGeometry(), B=by[q.bone], a=B.userData.at; gg.setAttribute('position',new THREE.BufferAttribute(q.P,3)); gg.setIndex(new THREE.BufferAttribute(q.I,1)); gg.translate(-a[0],-a[1],-a[2]);
      const gm=new THREE.Mesh(gg,new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(...q.c,THREE.SRGBColorSpace),transparent:true,opacity:q.a,depthWrite:false,side:THREE.DoubleSide})); gm.renderOrder=2; B.add(gm); N.tris+=q.I.length/3; }
    if(GL.length){ const P2=[], C2=[], S2=[], W2=[]; for(const p of GL){ const bi=bones.indexOf(by[p.bone]); for(const s of p.of){ const m=s.P.length/3; for(let i=0;i<m;i++){ const w=s.W&&s.W[i];
        P2.push(s.P[i*3],s.P[i*3+1],s.P[i*3+2]); C2.push(s.C[i*3],s.C[i*3+1],s.C[i*3+2],s.C[i*3]+s.C[i*3+1]+s.C[i*3+2]>2.95?.6:.14); S2.push(w?bones.indexOf(by[w[0]]):bi,w&&w[2]?bones.indexOf(by[w[2]]):0,0,0); W2.push(w?w[1]:1,w&&w[2]?w[3]:0,0,0); } } }
      const g2=new THREE.BufferGeometry(); g2.setAttribute('position',new THREE.Float32BufferAttribute(P2,3)); g2.setAttribute('color',new THREE.Float32BufferAttribute(C2,4)); g2.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(S2,4)); g2.setAttribute('skinWeight',new THREE.Float32BufferAttribute(W2,4));
      const gm=new THREE.SkinnedMesh(g2,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide})); gm.frustumCulled=false; N.me.parent.add(gm); gm.bind(skeleton,N.me.bindMatrix); N.glass=gm; N.tris+=P2.length/9; }
    const p0=N.push; let bumped=false; N.push=p=>{ const d=Math.hypot(p.x-N.st.x,p.z-N.st.z); if(d<N.st.R+.3){ if(!bumped){ bumped=true; for(const q of SP){ q.vx+=(Math.random()-.5)*6; q.vz+=(Math.random()-.5)*6; } } } else if(d>N.st.R+.45)bumped=false; p0(p); };
    const base=Float32Array.from(P), baseC=Float32Array.from(C);
    N.reshape=(name,{scale=[1,1,1],move=[0,0,0]}={})=>{ '@later'; const r=ranges[name]; if(!r)return; const A=geo.attributes.position.array; let cx=0, cy=0, cz=0;
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
  const pts=M=>{ const q=new Int16Array(B64(M.p).buffer), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3]; return P; };
  RIGNPC.glb=D=>{ const c=B64(D.c), C=new Float32Array(c.length); for(let i=0;i<c.length;i++)C[i]=c[i]/255; const w=B64(D.w), SW=new Float32Array(w.length); for(let i=0;i<w.length;i++)SW[i]=w[i]/255;
    return {bones:D.bones, mesh:{P:pts(D),C,I:new Uint16Array(B64(D.i).buffer),SI:Uint16Array.from(B64(D.j)),SW,parts:D.parts}, glass:D.glass&&{P:pts(D.glass),I:new Uint16Array(B64(D.glass.i).buffer),c:D.glass.c,a:D.glass.a,bone:D.glass.bone}}; };
  RIGNPC.limbs=(c,o={})=>{ const B=c.B, ph=c.st.ph, m=c.mv, sw=Math.sin(ph)*m;
    RIGNPC.walk(c,Object.assign({body:'hips'},o));
    if(c.sheet)return;
    for(const [s,k] of [['L',1],['R',-1]]){ const kn=B['knee'+s], el=B['elbow'+s], ft=B['foot'+s];
      if(kn)kn.rotation.x=Math.max(0,Math.sin(ph+(k>0?0:Math.PI)+.9))*.75*m; if(ft&&kn)ft.rotation.x=-kn.rotation.x*.45;
      if(el)el.rotation.x=-.18-Math.max(0,-sw*k)*.35; }
    if(B.chest)B.chest.rotation.y=-sw*.08; if(B.head)B.head.rotation.y=c.look; };
  RIGNPC.hold=i=>QS.get('toonhold')?{brain:(dt,you,st)=>{ const cx=SHARED.cam.position.x-you.x, cz=SHARED.cam.position.z-you.z, d=Math.hypot(cx,cz)||1, k=(i-2)*1.25*TILE;
    st.to=null; st.hold=true; st.x=you.x-cz/d*k; st.z=you.z+cx/d*k; st.face={x:SHARED.cam.position.x,z:SHARED.cam.position.z}; }}:{}; }
export {RIGNPC};
