const PARTSNPC={};
{ const D2R=Math.PI/180, M4=new THREE.Matrix4(), E=new THREE.Euler(), Q=new THREE.Quaternion(), UP=new THREE.Vector3(0,1,0), V=new THREE.Vector3();
  const shape=(g,col,at,sz,rot)=>{ g=g.toNonIndexed(); if(sz)g.scale(sz[0],sz[1],sz[2]); if(rot)g.applyMatrix4(M4.makeRotationFromEuler(E.set(rot[0]*D2R,rot[1]*D2R,rot[2]*D2R))); if(at)g.translate(at[0],at[1],at[2]);
    const P=g.attributes.position.array, m=P.length/3, C=new Float32Array(m*3); for(let i=0;i<m;i++){ const c=typeof col==='function'?col(P[i*3],P[i*3+1],P[i*3+2]):col; C[i*3]=c[0]; C[i*3+1]=c[1]; C[i*3+2]=c[2]; } return {P,C}; };
  const limb=(a,b,r0,r1,col,seg=8)=>{ const d=V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(); d.normalize(); const g=new THREE.CylinderGeometry(r1,r0,L,seg).toNonIndexed(); g.translate(0,L/2,0); Q.setFromUnitVectors(UP,d); g.applyQuaternion(Q); g.translate(a[0],a[1],a[2]); return shape(g,col); };
  const sph=(r,w=8,h=6)=>new THREE.SphereGeometry(r,w,h), cyl=(r0,r1,h,s=8)=>new THREE.CylinderGeometry(r0,r1,h,s), box=(x,y,z)=>new THREE.BoxGeometry(x,y,z), torus=(r,t,a=6,b=16)=>new THREE.TorusGeometry(r,t,a,b);
  const capsule=(r,l,cs=4,rs=10)=>new THREE.CapsuleGeometry(r,l,cs,rs), shell=(r0,r1,h,seg,t0,tl)=>new THREE.CylinderGeometry(r0,r1,h,seg,1,true,t0,tl), blob=(rx,ry,rz,w=12,h=8)=>{ const g=new THREE.SphereGeometry(1,w,h); g.scale(rx,ry,rz); return g; };
  const tbox=(w0,d0,w1,d1,h,ox=0,oz=0)=>{ const a=w0/2, b=d0/2, c=w1/2, d=d1/2, pyr=!w1&&!d1;
    const V=[-a,0,-b, a,0,-b, a,0,b, -a,0,b, ox-c,h,oz-d, ox+c,h,oz-d, ox+c,h,oz+d, ox-c,h,oz+d];
    const I=pyr?[0,1,2, 0,2,3, 3,2,6, 1,0,4, 2,1,5, 0,3,7]:[0,1,2, 0,2,3, 4,6,5, 4,7,6, 3,2,6, 3,6,7, 1,0,4, 1,4,5, 2,1,5, 2,5,6, 0,3,7, 0,7,4];
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(V,3)); g.setIndex(I); return g; };
  const flatten=(geo,ranges,parts)=>{ const P=geo.attributes.position.array, Nn=geo.attributes.normal.array;
    for(const p of parts){ if(!p.flat)continue; const r=ranges[p.name]; for(let i=r.start;i<r.start+r.count;i+=3){ const a=i*3, ax=P[a], ay=P[a+1], az=P[a+2], bx=P[a+3]-ax, by=P[a+4]-ay, bz=P[a+5]-az, cx=P[a+6]-ax, cy=P[a+7]-ay, cz=P[a+8]-az;
      let nx=by*cz-bz*cy, ny=bz*cx-bx*cz, nz=bx*cy-by*cx; const l=Math.hypot(nx,ny,nz)||1; nx/=l; ny/=l; nz/=l; for(let k=0;k<9;k+=3){ Nn[a+k]=nx; Nn[a+k+1]=ny; Nn[a+k+2]=nz; } } }
    geo.attributes.normal.needsUpdate=true; };
  const hsh=(x,y,z)=>{ const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return s-Math.floor(s); };
  const noise=(x,y,z,k=7)=>{ x*=k; y*=k; z*=k; const x0=Math.floor(x), y0=Math.floor(y), z0=Math.floor(z), fx=x-x0, fy=y-y0, fz=z-z0, s=t=>t*t*(3-2*t), l=(a,b,t)=>a+(b-a)*t, c=(dx,dy,dz)=>hsh(x0+dx,y0+dy,z0+dz);
    return l(l(l(c(0,0,0),c(1,0,0),s(fx)),l(c(0,1,0),c(1,1,0),s(fx)),s(fy)),l(l(c(0,0,1),c(1,0,1),s(fx)),l(c(0,1,1),c(1,1,1),s(fx)),s(fy)),s(fz)); };
  PARTSNPC.T={shape,limb,sph,cyl,box,torus,capsule,shell,blob,tbox,noise,D2R};
  PARTSNPC.make=(parts,o)=>{ let n=0; for(const p of parts)for(const c of p.of)n+=c.P.length/3;
    const P=new Float32Array(n*3), C=new Float32Array(n*3), R=new Float32Array(n), ranges={}; let at=0;
    const F=new Float32Array(n);
    parts.forEach((p,pi)=>{ const start=at; for(const c of p.of){ P.set(c.P,at*3); C.set(c.C,at*3); at+=c.P.length/3; } R.fill(pi,start,at); if(p.fab)F.fill(p.fab,start,at); ranges[p.name]={start,count:at-start}; });
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setAttribute('color',new THREE.BufferAttribute(C,3)); geo.setAttribute('reg',new THREE.BufferAttribute(R,1)); geo.setAttribute('fab',new THREE.BufferAttribute(F,1));
    const N=makeNPC(null,Object.assign({names:parts.map(p=>p.name),rank:parts.map(p=>p.rank||0),geo},o));
    const base=Float32Array.from(geo.attributes.position.array), baseC=Float32Array.from(C);
    N.parts=ranges; N.tris=n/3;
    if(parts.some(p=>p.flat)){ const smooth=N.renorm; N.renorm=()=>{ smooth(); flatten(geo,ranges,parts); }; N.renorm(); }
    N.reshape=(name,{scale=[1,1,1],move=[0,0,0],pivot}={})=>{ const r=ranges[name]; if(!r)return; const A=geo.attributes.position.array; let cx=0, cy=0, cz=0;
      if(pivot)[cx,cy,cz]=pivot; else{ for(let i=r.start;i<r.start+r.count;i++){ cx+=base[i*3]; cy+=base[i*3+1]; cz+=base[i*3+2]; } cx/=r.count; cy/=r.count; cz/=r.count; }
      for(let i=r.start;i<r.start+r.count;i++){ A[i*3]=cx+(base[i*3]-cx)*scale[0]+move[0]; A[i*3+1]=cy+(base[i*3+1]-cy)*scale[1]+move[1]; A[i*3+2]=cz+(base[i*3+2]-cz)*scale[2]+move[2]; }
      geo.attributes.position.needsUpdate=true; N.renorm(); };
    N.recolour=(name,col)=>{ const r=ranges[name]; if(!r)return; const A=geo.attributes.color.array; for(let i=r.start;i<r.start+r.count;i++){ A[i*3]=col?col[0]:baseC[i*3]; A[i*3+1]=col?col[1]:baseC[i*3+1]; A[i*3+2]=col?col[2]:baseC[i*3+2]; } geo.attributes.color.needsUpdate=true; };
    return N; };
  window.RESHAPE=(key,part,scale,move)=>{ const N=NPCS.find(q=>q.key===key); if(N&&N.reshape)N.reshape(part,{scale,move}); };
  PARTSNPC.LANE=STLANE;
  { const HOLE=[BOD.XS(MAPSTAIR.x0-.6),BOD.ZS(MAPSTAIR.y0),BOD.XS(MAPSTAIR.x1+.6),BOD.ZS(MAPSTAIR.y1+.6)];
    PARTSNPC.free=(x,z,R)=>!(x>HOLE[0]-R&&x<HOLE[2]+R&&z>HOLE[1]-R&&z<HOLE[3]+R)&&!SOL.up.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R); }
  PARTSNPC.street=(x,y)=>({lv:'up',group:'bodega',x:BOD.XS(x),z:BOD.ZS(y),lane:PARTSNPC.LANE,free:stfree,roam:true,ground:(x,z)=>MODS.bodega.ground(x,z)}); }
