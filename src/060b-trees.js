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
  // a tree's low bake from its summary: one faceted 20-sided clump per leaf clump, an open five-sided limb per limb, coloured per vertex
  TREEGEN.low=(S,trunk)=>{ const A=acc(), q=new THREE.Quaternion(), C=new THREE.IcosahedronGeometry(1,0), L=new THREE.CylinderGeometry(.7,1,1,5,1,true);
    for(const [ax,ay,az,bx,by,bz,r] of S.lb){ const d=new V(bx-ax,by-ay,bz-az), len=d.length(); if(len<1e-4)continue; const g=L.clone(); g.scale(r,len,r); g.translate(0,len/2,0); g.applyQuaternion(q.setFromUnitVectors(UP,d.normalize())); g.translate(ax,ay,az); put(A,g,S.bc,1); }
    const lo=Math.min(...S.cl.map(c=>c[1]-c[3])), hi=Math.max(...S.cl.map(c=>c[1]+c[3]))||1;
    for(const [x,y,z,r,R,G,B] of S.cl){ const g=C.clone(); g.scale(r,r*.82,r); g.translate(x,y,z); const f=.74+.32*(y-lo)/Math.max(1e-3,hi-lo); put(A,g,[R*f,G*f,B*f],0); }
    C.dispose(); L.dispose(); let H=0, wd=0; for(let i=0;i<A.P.length;i+=3){ H=Math.max(H,A.P[i+1]); wd=Math.max(wd,Math.hypot(A.P[i],A.P[i+2])); }
    return {p:new Float32Array(A.P),c:new Uint8ClampedArray(A.C),k:new Uint8Array(A.K),metres:1,tris:A.K.length,H:H||1,wide:2*wd,rad:wd,trunk,sum:S}; };
  // the leaf card: small leaves in three tones on a ragged round, and a solid strip on the right for the limbs
  let LT=null; TREEGEN.leaf=()=>{ if(LT)return LT; const N=64, cv=document.createElement('canvas'); cv.width=cv.height=N; const g=cv.getContext('2d'); let a=7; const R=()=>{ a=(a*16807)%2147483647; return a/2147483647; };
    g.fillStyle='#fff'; g.fillRect(58,0,6,N);
    for(let i=0;i<60;i++){ const t=R()*6.283, r=23*Math.sqrt(R()), v=[255,235,205][Math.floor(R()*3)], L=3.2+R()*2.2; g.save(); g.translate(29+Math.cos(t)*r,32+Math.sin(t)*r); g.rotate(R()*6.283);
      g.fillStyle=`rgb(${v*.58|0},${v*.62|0},${v*.55|0})`; g.beginPath(); g.ellipse(0,0,L+1,L*.55+1,0,0,6.283); g.fill(); g.fillStyle=`rgb(${v},${v},${v})`; g.beginPath(); g.ellipse(0,0,L,L*.55,0,0,6.283); g.fill(); g.restore(); }
    LT=new THREE.CanvasTexture(cv); LT.magFilter=LT.minFilter=THREE.NearestFilter; LT.generateMipmaps=false; LT.colorSpace=THREE.SRGBColorSpace; return LT; };
  // a tree as leaf cards (owner's pick A, 27 Oct 2026): cards scattered through each clump of its summary, lit as one round crown, darker inside; open limbs under them. lite: fewer, bigger, single cards
  TREEGEN.cards=(S,trunk,seed,lite)=>{ const A=acc(), Q=new THREE.Quaternion(), E=new THREE.Euler(), Y90=new THREE.Quaternion().setFromAxisAngle(UP,Math.PI/2), e=new V(), o=new V(), n=new V(); let a=seed*7919+13; const R=()=>{ a=(a*16807)%2147483647; return a/2147483647; };
    const bc=S.bc||[90,70,50], L=new THREE.CylinderGeometry(.7,1,1,5,1,true);
    for(const [ax,ay,az,bx,by,bz,r] of S.lb){ const d=new V(bx-ax,by-ay,bz-az), len=d.length(); if(len<1e-4)continue; const g=L.clone(); g.scale(r,len,r); g.translate(0,len/2,0); g.applyQuaternion(Q.setFromUnitVectors(UP,d.normalize())); g.translate(ax,ay,az);
      const u=g.attributes.uv.array; for(let i=0;i<u.length;i+=2){ u[i]=.97; u[i+1]=.5; } put(A,g,bc,1); }
    // a faceted core under the cards (the old trees' clumps, a little smaller and darker) so the crown has bulk
    { const C=new THREE.IcosahedronGeometry(1,0); for(const [x,y,z,r,Rc,Gc,Bc] of S.cl){ const g=C.clone(); g.scale(r*.85,r*.72,r*.85); g.translate(x,y,z); const u=g.attributes.uv.array; for(let i=0;i<u.length;i+=2){ u[i]=.97; u[i+1]=.5; } put(A,g,[Rc*.62,Gc*.62,Bc*.62],0); } C.dispose(); }
    L.dispose(); let cx=0, cy=0, cz=0, w=0; for(const q of S.cl){ const k=q[3]*q[3]; cx+=q[0]*k; cy+=q[1]*k; cz+=q[2]*k; w+=k; } const cc=new V(cx/w,cy/w,cz/w); let cr=1e-3; for(const q of S.cl)cr=Math.max(cr,cc.distanceTo(new V(q[0],q[1],q[2]))+q[3]);
    const RL=Math.max(...S.cl.map(q=>Math.hypot(q[0],q[2])+q[3])), D=lite?700:2240, SZ=(lite?.16:.107)*cr/.45, VQ=[[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]];
    const quad=(q,sz,col)=>{ n.copy(o).sub(cc).normalize().lerp(UP,.15).normalize(); for(const [x,y] of VQ){ e.set(x*sz/2,y*sz/2,0).applyQuaternion(q).add(o); const h=Math.hypot(e.x,e.z); if(h>RL){ e.x*=RL/h; e.z*=RL/h; } A.P.push(e.x,e.y,e.z); A.N.push(n.x,n.y,n.z); A.C.push(...col); A.U.push((x+1)/2*.88,(y+1)/2); } A.K.push(0,0); };
    for(const [qx,qy,qz,qr,Rc,Gc,Bc] of S.cl){ const r=qr*1.15, m=Math.max(3,Math.round(D*qr*qr*(.45/cr)**2));
      for(let i=0;i<m;i++){ e.set(R()*2-1,R()*2-1,R()*2-1).normalize(); o.set(qx,qy,qz).addScaledVector(e,r*(lite?.55+.45*Math.sqrt(R()):.35+.65*Math.sqrt(R())));
        const dp=Math.min(1,o.distanceTo(cc)/cr), tp=Math.max(0,Math.min(1,(o.y-cc.y+cr)/(2*cr))), f=(.68+.42*dp*dp+.25*tp)*(.9+R()*.2), col=[Rc*f,Gc*f,Bc*f], sz=SZ*(.75+R()*.5);
        Q.setFromEuler(E.set(R()*6.28,R()*6.28,R()*6.28)); quad(Q,sz,col); if(!lite)quad(Q.clone().multiply(Y90),sz,col); } }
    let H=0, wd=0; for(let i=0;i<A.P.length;i+=3){ H=Math.max(H,A.P[i+1]); wd=Math.max(wd,Math.hypot(A.P[i],A.P[i+2])); }
    return {p:new Float32Array(A.P),n:new Float32Array(A.N),c:new Uint8ClampedArray(A.C),k:new Uint8Array(A.K),uv:new Float32Array(A.U),metres:1,tris:A.K.length,H:H||1,wide:2*wd,rad:wd,trunk,sum:S,cards:1}; };
  const cache={};
  TREEGEN.get=(set,i)=>{ const key=set+i; if(cache[key])return cache[key]; const rec=TD[set][i], m=TREEGEN.assemble(rec); if(rec.sum)m.sum=rec.sum; return cache[key]=m; };
  TREEGEN.count=set=>(TD[set]||[]).length; TREEGEN.old=TD.old||{};
}
export {TREEGEN};
