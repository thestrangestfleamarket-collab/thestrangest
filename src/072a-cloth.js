// THE DRAPE (cloth): a sheet of points held by their neighbours (verlet), some pinned to what carries it, falling, swinging and pushed out of the bodies it touches; the curtains and the clothes hang on it.
const DRAPE={};
{ // a sheet: X now, Xp a step ago, X0 its shape (what it is tied back to), C pairs of points held at their rest lengths L, pin 1 where something holds it (its X is set from outside before each step)
  DRAPE.make=(X0,C,pin)=>{ const n=X0.length/3, L=new Float32Array(C.length/2);
    for(let q=0;q<C.length;q+=2){ const a=C[q]*3, b=C[q+1]*3; L[q/2]=Math.hypot(X0[a]-X0[b],X0[a+1]-X0[b+1],X0[a+2]-X0[b+2]); }
    return {n,X0:Float32Array.from(X0),X:Float32Array.from(X0),Xp:Float32Array.from(X0),C,L,pin:pin||new Uint8Array(n),still:0}; };
  // a grid's neighbours, across then down; with shear both diagonals too, so it doesn't fold like a ladder
  DRAPE.grid=(nx,ny,shear)=>{ const C=[]; for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){ const a=j*nx+i; if(i<nx-1)C.push(a,a+1); if(j<ny-1)C.push(a,a+nx); if(shear&&i<nx-1&&j<ny-1)C.push(a,a+nx+1,a+1,a+nx); } return C; };
  // a body the cloth can't go into: {cy:1,x,z,r,y0,y1} an upright cylinder, or {a:[x,y,z],b:[x,y,z],r} a capsule
  const out=(X,a,b)=>{ if(b.cy){ const dx=X[a]-b.x, dz=X[a+2]-b.z, d=Math.hypot(dx,dz); if(d<b.r&&X[a+1]>b.y0&&X[a+1]<b.y1){ const k=(b.r-d)/(d||1); X[a]+=dx*k; X[a+2]+=dz*k; } return; }
    const A=b.a, B=b.b, ux=B[0]-A[0], uy=B[1]-A[1], uz=B[2]-A[2], uu=ux*ux+uy*uy+uz*uz||1e-9, px=X[a]-A[0], py=X[a+1]-A[1], pz=X[a+2]-A[2];
    let t=(px*ux+py*uy+pz*uz)/uu; t=t<0?0:t>1?1:t; const dx=px-ux*t, dy=py-uy*t, dz=pz-uz*t, d=Math.hypot(dx,dy,dz);
    if(d<b.r&&d>1e-6){ const k=(b.r-d)/d; X[a]+=dx*k; X[a+1]+=dy*k; X[a+2]+=dz*k; } };
  // one step of h seconds. o: g its fall (up is +), dm how much speed it keeps, ks how hard it is tied back to its shape, it constraint passes,
  // push(i,a,F) a point's own push this step (added into F), col the bodies, post 1 to keep it out of them again after the constraints (clothes on a body)
  const F=[0,0,0];
  DRAPE.step=(c,h,o)=>{ const {X,Xp,X0,n,C,L,pin}=c, g=(o.g??0)*h*h, dm=o.dm??.97, ks=o.ks??0, col=o.col, push=o.push; let mv=0;
    for(let i=0;i<n;i++){ if(pin[i])continue; const a=i*3, vx=(X[a]-Xp[a])*dm, vy=(X[a+1]-Xp[a+1])*dm, vz=(X[a+2]-Xp[a+2])*dm; Xp[a]=X[a]; Xp[a+1]=X[a+1]; Xp[a+2]=X[a+2];
      F[0]=F[1]=F[2]=0; if(push)push(i,a,F);
      X[a]+=vx+(X0[a]-X[a])*ks+F[0]; X[a+1]+=vy+g+(X0[a+1]-X[a+1])*ks+F[1]; X[a+2]+=vz+(X0[a+2]-X[a+2])*ks+F[2];
      if(col)for(let k=0;k<col.length;k++)out(X,a,col[k]);
      mv=Math.max(mv,Math.abs(vx)+Math.abs(vy)+Math.abs(vz)); }
    for(let it=o.it??3;it-- >0;)for(let q=0;q<C.length;q+=2){ const i=C[q], j=C[q+1], pi=pin[i], pj=pin[j]; if(pi&&pj)continue;
      const a=i*3, b=j*3, dx=X[b]-X[a], dy=X[b+1]-X[a+1], dz=X[b+2]-X[a+2], d=Math.hypot(dx,dy,dz)||1e-6, e=(d-L[q/2])/d, wa=pi?0:pj?1:.5, wb=1-wa;
      X[a]+=dx*e*wa; X[a+1]+=dy*e*wa; X[a+2]+=dz*e*wa; X[b]-=dx*e*wb; X[b+1]-=dy*e*wb; X[b+2]-=dz*e*wb; }
    if(o.post&&col)for(let i=0;i<n;i++)if(!pin[i])for(let k=0;k<col.length;k++)out(X,i*3,col[k]);
    c.still=mv<2e-5?c.still+1:0; return mv; };
  // dropped where it should be with no speed (a jump, a teleport, its first frame)
  DRAPE.settle=(c,X)=>{ c.X.set(X); c.Xp.set(X); c.still=0; };
  // the sheet into its mesh's positions (normals and bounds with it)
  DRAPE.out=(c,g)=>{ const P=g.attributes.position; P.array.set(c.X); P.needsUpdate=true; g.computeVertexNormals(); g.computeBoundingSphere(); }; }
export {DRAPE};
