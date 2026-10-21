const PFARM={};
{ const T=TILE, B=RINGX.bound, cvn=SHARED.BOD.g.cvNoise, hash=SHARED.BOD.g.hash, ss=(a,b,v)=>{ const t=Math.max(0,Math.min(1,(v-a)/(b-a))); return t*t*(3-2*t); };
  const xa=PFAR.x/T, ya=PFAR.y/T, xe=B.x1/T, zn=B.z1/T, xl=PFAR.z/T+12, zl=PFAR.w/T+12, y0=SHARED.BOD.YS(0);
  const past=(x,z)=>Math.max(x-xe,z-zn);
  const H=(x,z)=>{ const d=past(x,z), e=Math.min(x-xa,z-ya), n=cvn(x/34,z/34,601)*.55+cvn(x/14,z/14,603)*.33+cvn(x/6,z/6,605)*.12;
    return (ss(7,30,d)*ss(0,16,e)*(2.4+8*ss(24,120,d))*Math.pow(Math.max(0,(n-.24)/.76),1.3)-.12*(1-ss(5,6,d)))*T; };
  const LAWN=[[46,86,38],[56,102,44],[66,116,50],[78,130,56]], ROCK=[[104,104,100],[122,120,114]], P=[], C=[], c=new THREE.Color(), V=(x,z)=>[x*T,y0+H(x,z),z*T];
  const tri=(a,b,d)=>{ const ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2], vx=d[0]-a[0], vy=d[1]-a[1], vz=d[2]-a[2], nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, ny1=Math.abs(ny)/Math.hypot(nx,ny,nz);
    const cx=(a[0]+b[0]+d[0])/3/T, cz=(a[2]+b[2]+d[2])/3/T, k=cvn(cx/9,cz/9,607)*.8+hash(Math.floor(cx),Math.floor(cz),609)*.2, col=ny1<.8&&k>.35?ROCK[k>.6?1:0]:LAWN[Math.min(3,Math.floor(k*4.6))];
    c.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(const p of ny>0?[a,b,d]:[a,d,b]){ P.push(...p); C.push(c.r,c.g,c.b); } };
  const chunk=(x0,z0,x1,z1)=>{ const dm=Math.max(0,past(x0,z0)), s=dm<22?2:dm<64?4:dm<130?8:12, nx=Math.ceil((x1-x0)/s), nz=Math.ceil((z1-z0)/s), gx=i=>Math.min(x1,x0+i*s), gz=j=>Math.min(z1,z0+j*s);
    for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){ const a=V(gx(i),gz(j)), b=V(gx(i+1),gz(j)), d=V(gx(i+1),gz(j+1)), e=V(gx(i),gz(j+1)); tri(a,b,d); tri(a,d,e); }
    const sk=(p,q)=>{ const pd=[p[0],p[1]-1.5*T,p[2]], qd=[q[0],q[1]-1.5*T,q[2]]; tri(p,q,qd); tri(p,qd,pd); };
    for(let i=0;i<nx;i++){ sk(V(gx(i),z0),V(gx(i+1),z0)); sk(V(gx(i),z1),V(gx(i+1),z1)); } for(let j=0;j<nz;j++){ sk(V(x0,gz(j)),V(x0,gz(j+1))); sk(V(x1,gz(j)),V(x1,gz(j+1))); } };
  const S=24, area=(x0,z0,x1,z1)=>{ for(let x=x0;x<x1;x+=S)for(let z=z0;z<z1;z+=S)chunk(x,z,Math.min(x1,x+S),Math.min(z1,z+S)); };
  area(xa,zn+5,xl,zl); area(xe+5,ya,xl,zn+5);
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals(); g.computeBoundingSphere();
  const mat=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,side:THREE.DoubleSide}); mat.defines={PFAR:''};
  const M=new THREE.Mesh(g,mat); M.visible=false; (MAPG.bodega||scene).add(M); PFARM.mesh=M; PFARM.tris=P.length/9; PFARM.r=PFAR;
  SYS.add('ring',(dt)=>{ M.visible=MISTE.x>.5; },'134a-parkfar');
  window.PFARM=PFARM; }
