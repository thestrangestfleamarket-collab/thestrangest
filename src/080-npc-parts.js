// CHARACTERS IN PARTS: the shape kit (boxes, blobs, curves traced from a photo, lathes, tubes, skin weights) and PARTSNPC.street for the street's walkers.
import {SHARED, THREE} from './003-shx.js';
import {NPCS, PONDS} from './003b-systems.js';
import {MODS, SOL} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
import {stfree, STHOLE, STLANE} from './076-npc-map.js';
const PARTSNPC={};
{ const D2R=Math.PI/180, M4=new THREE.Matrix4(), E=new THREE.Euler(), Q=new THREE.Quaternion(), UP=new THREE.Vector3(0,1,0), V=new THREE.Vector3();
  const shape=(g,col,at,sz,rot)=>{ g=g.toNonIndexed(); if(sz)g.scale(sz[0],sz[1],sz[2]); if(rot)g.applyMatrix4(M4.makeRotationFromEuler(E.set(rot[0]*D2R,rot[1]*D2R,rot[2]*D2R))); if(at)g.translate(at[0],at[1],at[2]);
    const P=g.attributes.position.array, m=P.length/3, C=new Float32Array(m*3); for(let i=0;i<m;i++){ const c=typeof col==='function'?col(P[i*3],P[i*3+1],P[i*3+2]):col; C[i*3]=c[0]; C[i*3+1]=c[1]; C[i*3+2]=c[2]; } return {P,C}; };
  const limb=(a,b,r0,r1,col,seg=8)=>{ const d=V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(); d.normalize(); const g=new THREE.CylinderGeometry(r1,r0,L,seg).toNonIndexed(); g.translate(0,L/2,0); Q.setFromUnitVectors(UP,d); g.applyQuaternion(Q); g.translate(a[0],a[1],a[2]); return shape(g,col); };
  const sph=(r,w=8,h=6)=>new THREE.SphereGeometry(r,w,h), cyl=(r0,r1,h,s=8)=>new THREE.CylinderGeometry(r0,r1,h,s), box=(x,y,z)=>new THREE.BoxGeometry(x,y,z), torus=(r,t,a=6,b=16)=>new THREE.TorusGeometry(r,t,a,b);
  const capsule=(r,l,cs=4,rs=10)=>new THREE.CapsuleGeometry(r,l,cs,rs), shell=(r0,r1,h,seg,t0,tl)=>new THREE.CylinderGeometry(r0,r1,h,seg,1,true,t0,tl), blob=(rx,ry,rz,w=12,h=8)=>{ const g=new THREE.SphereGeometry(1,w,h); g.scale(rx,ry,rz); return g; };
  const tbox=(w0,d0,w1,d1,h,ox=0,oz=0)=>{ '@later'; const a=w0/2, b=d0/2, c=w1/2, d=d1/2, pyr=!w1&&!d1;
    const V=[-a,0,-b, a,0,-b, a,0,b, -a,0,b, ox-c,h,oz-d, ox+c,h,oz-d, ox+c,h,oz+d, ox-c,h,oz+d];
    const I=pyr?[0,1,2, 0,2,3, 3,2,6, 1,0,4, 2,1,5, 0,3,7]:[0,1,2, 0,2,3, 4,6,5, 4,7,6, 3,2,6, 3,6,7, 1,0,4, 1,4,5, 2,1,5, 2,5,6, 0,3,7, 0,7,4];
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(V,3)); g.setIndex(I); return g; };
  const flatten=(geo,ranges,parts)=>{ '@later'; const P=geo.attributes.position.array, Nn=geo.attributes.normal.array;
    for(const p of parts){ if(!p.flat)continue; const r=ranges[p.name]; for(let i=r.start;i<r.start+r.count;i+=3){ const a=i*3, ax=P[a], ay=P[a+1], az=P[a+2], bx=P[a+3]-ax, by=P[a+4]-ay, bz=P[a+5]-az, cx=P[a+6]-ax, cy=P[a+7]-ay, cz=P[a+8]-az;
      let nx=by*cz-bz*cy, ny=bz*cx-bx*cz, nz=bx*cy-by*cx; const l=Math.hypot(nx,ny,nz)||1; nx/=l; ny/=l; nz/=l; for(let k=0;k<9;k+=3){ Nn[a+k]=nx; Nn[a+k+1]=ny; Nn[a+k+2]=nz; } } }
    geo.attributes.normal.needsUpdate=true; };
  const hsh=(x,y,z)=>{ const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return s-Math.floor(s); };
  const noise=(x,y,z,k=7)=>{ x*=k; y*=k; z*=k; const x0=Math.floor(x), y0=Math.floor(y), z0=Math.floor(z), fx=x-x0, fy=y-y0, fz=z-z0, s=t=>t*t*(3-2*t), l=(a,b,t)=>a+(b-a)*t, c=(dx,dy,dz)=>hsh(x0+dx,y0+dy,z0+dz);
    return l(l(l(c(0,0,0),c(1,0,0),s(fx)),l(c(0,1,0),c(1,1,0),s(fx)),s(fy)),l(l(c(0,0,1),c(1,0,1),s(fx)),l(c(0,1,1),c(1,1,1),s(fx)),s(fy)),s(fz)); };
  const spl=(pts,n)=>{ '@later'; const o=[], m=pts.length-1; for(let i=0;i<=n;i++){ const t=i/n*m, k=Math.min(m-1,Math.floor(t)), f=t-k, p0=pts[Math.max(0,k-1)], p1=pts[k], p2=pts[k+1], p3=pts[Math.min(m,k+2)];
      o.push(p1.map((_,j)=>.5*(2*p1[j]+(-p0[j]+p2[j])*f+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*f*f+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*f*f*f))); } return o; };
  const prof=pts=>{ const S=spl(pts,160); return {S,y0:S[0][1],y1:S[160][1],R:y=>{ for(let i=1;i<=160;i++){ const a=S[i-1], b=S[i]; if((y-a[1])*(y-b[1])<=0&&a[1]!==b[1])return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]); } return 0; }}; };
  const surf=(nu,nv,f,keep)=>{ '@later'; const P=[], I=[]; for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)P.push(...f(i/nu,j/nv));
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){ if(keep&&!keep((i+.5)/nu,(j+.5)/nv))continue; const a=j*(nu+1)+i, b=a+1, c=a+nu+1, d=c+1; I.push(a,c,b, b,c,d); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setIndex(I); return g; };
  const lathe=(pf,nu,nv,{sx=1,sz=1,d,keep}={})=>{ const S=spl(pf.S||pf,nv); return surf(nu,nv,(u,v)=>{ const q=S[Math.round(v*nv)], a=u*Math.PI*2, p=[q[0]*sx*Math.sin(a),q[1],q[0]*sz*Math.cos(a)]; return d?d(p,u,v):p; },keep); };
  const tube=(path,rad,nu,nv,{up=[0,1,0],sx=1,sz=1,d}={})=>{ '@later'; const C=spl(path,nv), R=spl(rad.map(r=>[r]),nv), T=new THREE.Vector3(), U=new THREE.Vector3(), Bv=new THREE.Vector3(), Nv=new THREE.Vector3();
    return surf(nu,nv,(u,v)=>{ const j=Math.round(v*nv), a=C[Math.max(0,j-1)], b=C[Math.min(nv,j+1)]; T.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize(); U.set(...up);
      Bv.copy(U).addScaledVector(T,-U.dot(T)).normalize(); Nv.crossVectors(Bv,T); const t=u*Math.PI*2, r=Math.max(0,R[j][0]), c=C[j];
      const p=[0,1,2].map(k=>c[k]+(Nv.getComponent(k)*Math.cos(t)*sx+Bv.getComponent(k)*Math.sin(t)*sz)*r); return d?d(p,u,v):p; }); };
  const skin=(s,fn)=>{ const P=s.P, n=P.length/3; s.W=[]; for(let i=0;i<n;i++)s.W.push(fn(P[i*3],P[i*3+1],P[i*3+2])); return s; };
  const ss=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
  PARTSNPC.T={shape,limb,sph,cyl,box,torus,capsule,shell,blob,tbox,noise,D2R,spl,prof,surf,lathe,tube,skin,ss};
  window.RESHAPE=(key,part,scale,move)=>{ const N=NPCS.find(q=>q.key===key); if(N&&N.reshape)N.reshape(part,{scale,move}); };
  PARTSNPC.LANE=STLANE;
  { const HOLE=STHOLE;
    PARTSNPC.free=(x,z,R)=>!(x>HOLE[0]-R&&x<HOLE[2]+R&&z>HOLE[1]-R&&z<HOLE[3]+R)&&!SOL.up.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R)&&!FOUNT.wet(x,z,R)&&!PONDS.wet(x,z,R); }
  PARTSNPC.street=(x,y)=>({lv:'up',group:'bodega',x:SHARED.BOD.XS(x),z:SHARED.BOD.ZS(y),lane:PARTSNPC.LANE,free:stfree,roam:true,ground:(x,z)=>MODS.bodega.ground(x,z)}); }
export {PARTSNPC};
