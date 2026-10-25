// THE TREES' MODELS: TREEGEN puts the park's baked trees and bushes (data/trees.json, grown by tools/trees-bake.cjs) together as unit-height models in the park's baked format.
import {THREE} from './003-shx.js';
const TREEGEN={};
{ const TD=__DATA__("data/trees.json"), V=THREE.Vector3, UP=new V(0,1,0);
  const acc=()=>({P:[],N:[],C:[],K:[],U:[]});
  const put=(A,g,col,kind)=>{ const q=g.index?g.toNonIndexed():g, p=q.attributes.position.array, n=q.attributes.normal.array, u=q.attributes.uv&&q.attributes.uv.array, nv=p.length/3;
    for(let i=0;i<p.length;i++){ A.P.push(p[i]); A.N.push(n[i]); }
    for(let i=0;i<nv;i++){ A.C.push(col[0],col[1],col[2]); A.U.push(u?u[i*2]:0,u?u[i*2+1]:0); }
    for(let t=0;t<nv/3;t++)A.K.push(kind); if(q!==g)q.dispose(); g.dispose(); };
  const seg=(a,b,r0,r1,sides)=>{ const d=new V().subVectors(b,a), L=d.length(), g=new THREE.CylinderGeometry(r1,r0,L,sides,1,true); g.translate(0,L/2,0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP,d.normalize())); g.translate(a.x,a.y,a.z); return g; };
  // leaves light as one rounded crown: normals lean out of the crown, colour darker low and inside
  const crown=(A,from,c,rad,k)=>{ for(let i=from;i<A.P.length;i+=3){ const vx=A.P[i]-c.x, vy=(A.P[i+1]-c.y)*1.3, vz=A.P[i+2]-c.z, l=Math.hypot(vx,vy,vz)||1;
      const nx=A.N[i]*(1-k)+vx/l*k, ny=A.N[i+1]*(1-k)+vy/l*k, nz=A.N[i+2]*(1-k)+vz/l*k, m=Math.hypot(nx,ny,nz)||1; A.N[i]=nx/m; A.N[i+1]=ny/m; A.N[i+2]=nz/m;
      const h=Math.max(0,Math.min(1,(A.P[i+1]-(c.y-rad))/(2*rad))), d=Math.min(1,Math.hypot(A.P[i]-c.x,A.P[i+2]-c.z)/rad), f=.72+.3*h+.1*d; A.C[i]*=f; A.C[i+1]*=f; A.C[i+2]*=f; } };
  // a recipe's parts: 0 a branch segment, 1 a round clump, 2 a faceted bunch, 3 a leaf card
  TREEGEN.assemble=rec=>{ const A=acc(); let L0=-1;
    for(const q of rec.pr){ const t=q[0];
      if(t===0){ put(A,seg(new V(q[1],q[2],q[3]),new V(q[4],q[5],q[6]),q[7],q[8],q[9]),[q[10],q[11],q[12]],1); continue; }
      if(L0<0)L0=A.P.length; let g;
      if(t===3){ g=new THREE.PlaneGeometry(q[4],q[4]); g.rotateX(q[5]); g.rotateY(q[6]); g.rotateZ(q[7]); }
      else{ g=t===1?new THREE.SphereGeometry(1,6,4):new THREE.IcosahedronGeometry(1,0); if(t===2)g.computeVertexNormals(); g.scale(q[4],q[5],q[6]); g.rotateY(q[7]); }
      g.translate(q[1],q[2],q[3]); put(A,g,[q[8],q[9],q[10]],0); }
    if(L0>=0)crown(A,L0,new V(rec.c[0],rec.c[1],rec.c[2]),rec.c[3],rec.kN);
    let H=0, wd=0; for(let i=0;i<A.P.length;i+=3){ H=Math.max(H,A.P[i+1]); wd=Math.max(wd,Math.hypot(A.P[i],A.P[i+2])); } H=H||1;
    const p=new Float32Array(A.P.length); for(let i=0;i<p.length;i++)p[i]=A.P[i]/H;
    return {p,n:new Float32Array(A.N),c:new Uint8ClampedArray(A.C),k:new Uint8Array(A.K),uv:new Float32Array(A.U),metres:1,tris:A.K.length,H,wide:2*wd/H,trunk:rec.tr/H}; };
  const cache={};
  TREEGEN.get=(set,i)=>{ const key=set+i; if(cache[key])return cache[key]; const rec=TD[set][i], m=TREEGEN.assemble(rec); if(rec.sum)m.sum=rec.sum; return cache[key]=m; };
  TREEGEN.count=set=>(TD[set]||[]).length; TREEGEN.old=TD.old||{};
}
export {TREEGEN};
