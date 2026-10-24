// THE TREE MAKER: TREEGEN grows trees (round clumps, small bunches) and bushes (leaf bunches) as unit-height models in the park's baked format, each with a summary for the street's stand-ins.
import {THREE} from './003-shx.js';
const TREEGEN={};
{ const mul=a=>()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  const V=THREE.Vector3, UP=new V(0,1,0);
  const PALS=[[[63,107,47],[85,133,59],[111,158,71]],[[79,95,42],[102,118,58],[130,144,74]],[[92,122,42],[120,154,54],[152,183,74]],
    [[47,90,46],[63,114,64],[87,138,79]],[[70,104,44],[95,138,55],[122,166,74]],[[59,100,64],[79,127,79],[108,154,95]]];
  const BARK=[[90,70,50],[78,61,44],[102,80,58],[87,74,60]];
  const acc=()=>({P:[],N:[],C:[],K:[],U:[]});
  const put=(A,g,col,kind)=>{ const q=g.index?g.toNonIndexed():g, p=q.attributes.position.array, n=q.attributes.normal.array, u=q.attributes.uv&&q.attributes.uv.array, nv=p.length/3;
    for(let i=0;i<p.length;i++){ A.P.push(p[i]); A.N.push(n[i]); }
    for(let i=0;i<nv;i++){ A.C.push(col[0],col[1],col[2]); A.U.push(u?u[i*2]:0,u?u[i*2+1]:0); }
    for(let t=0;t<nv/3;t++)A.K.push(kind); if(q!==g)q.dispose(); g.dispose(); };
  const seg=(a,b,r0,r1,sides)=>{ const d=new V().subVectors(b,a), L=d.length(), g=new THREE.CylinderGeometry(r1,r0,L,sides,1,true); g.translate(0,L/2,0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP,d.normalize())); g.translate(a.x,a.y,a.z); return g; };
  const skel=(R,o)=>{ const segs=[], tips=[];
    const grow=(p,dir,len,rad,depth)=>{ const mid=p.clone().addScaledVector(dir,len*.5).add(new V((R()-.5)*len*.14,0,(R()-.5)*len*.14));
      const d2=dir.clone().add(new V((R()-.5)*.35,(R()-.3)*.2,(R()-.5)*.35)).normalize(), end=mid.clone().addScaledVector(d2,len*.5), rm=rad*.86, re=rad*o.taper;
      segs.push([p,mid,rad,rm,depth],[mid,end,rm,re,depth]);
      if(depth===0){ tips.push({p:end,d:d2,len}); return; }
      const kids=o.kids[0]+Math.floor(R()*(o.kids[1]-o.kids[0]+1)), az0=R()*6.283;
      for(let i=0;i<kids;i++){ const az=az0+i/kids*6.283+(R()-.5)*.9, el=o.spread*(.65+R()*.6), side=new V(Math.cos(az),0,Math.sin(az)), nd=d2.clone().multiplyScalar(Math.cos(el)).addScaledVector(side,Math.sin(el));
        nd.y+=o.up*(.7+R()*.6); nd.normalize(); grow(mid.clone().lerp(end,.45+R()*.55),nd,len*(o.lenK+R()*.14),re*.78,depth-1); }
      if(R()<o.lead)grow(end,d2.clone().add(new V(0,.35,0)).normalize(),len*(o.lenK+.05),re*.85,depth-1); };
    grow(new V(0,0,0),new V((R()-.5)*o.lean,1,(R()-.5)*o.lean).normalize(),o.trunk,o.r,o.depth);
    return {segs,tips}; };
  // leaves light as one rounded crown: normals lean out of the crown, colour darker low and inside
  const crown=(A,from,c,rad,k)=>{ for(let i=from;i<A.P.length;i+=3){ const vx=A.P[i]-c.x, vy=(A.P[i+1]-c.y)*1.3, vz=A.P[i+2]-c.z, l=Math.hypot(vx,vy,vz)||1;
      const nx=A.N[i]*(1-k)+vx/l*k, ny=A.N[i+1]*(1-k)+vy/l*k, nz=A.N[i+2]*(1-k)+vz/l*k, m=Math.hypot(nx,ny,nz)||1; A.N[i]=nx/m; A.N[i+1]=ny/m; A.N[i+2]=nz/m;
      const h=Math.max(0,Math.min(1,(A.P[i+1]-(c.y-rad))/(2*rad))), d=Math.min(1,Math.hypot(A.P[i]-c.x,A.P[i+2]-c.z)/rad), f=.72+.3*h+.1*d; A.C[i]*=f; A.C[i+1]*=f; A.C[i+2]*=f; } };
  const cluster=(CL,K)=>{ if(CL.length<=K)return CL.map(p=>p.slice()); const S=[CL[0]];
    while(S.length<K){ let best=null, bd=-1; for(const p of CL){ let d=1e9; for(const s of S)d=Math.min(d,Math.hypot(p[0]-s[0],p[1]-s[1],p[2]-s[2])); if(d>bd){ bd=d; best=p; } } S.push(best); }
    const G=S.map(()=>[]); for(const p of CL){ let bi=0, bd=1e9; S.forEach((s,i)=>{ const d=Math.hypot(p[0]-s[0],p[1]-s[1],p[2]-s[2]); if(d<bd){ bd=d; bi=i; } }); G[bi].push(p); }
    return G.filter(g=>g.length).map(g=>{ const m=[0,0,0,0,0,0,0]; for(const p of g)for(let i=0;i<7;i++)m[i]+=p[i]/g.length; let r=0; for(const p of g)r=Math.max(r,Math.hypot(p[0]-m[0],p[1]-m[1],p[2]-m[2])+p[3]*.8); m[3]=r*.85; return m; }); };
  // unit height, the baked format: p/n triangle soup, c colours 0-255, k a kind a triangle (0 leaf, 1 bark)
  const pack=(A,extra)=>{ let H=0; for(let i=1;i<A.P.length;i+=3)H=Math.max(H,A.P[i]); H=H||1; const p=new Float32Array(A.P.length); for(let i=0;i<p.length;i++)p[i]=A.P[i]/H;
    return Object.assign({p,n:new Float32Array(A.N),c:new Uint8ClampedArray(A.C),k:new Uint8Array(A.K),uv:new Float32Array(A.U),metres:1,tris:A.K.length},extra(H)); };
  let tex=null;
  TREEGEN.leafTex=()=>{ if(tex)return tex; const S=128, cv=document.createElement('canvas'); cv.width=cv.height=S; const g=cv.getContext('2d'), R=mul(7);
    for(let i=0;i<22;i++){ const a=R()*6.283, r=18+R()*36, x=S/2+Math.cos(a)*r*.9, y=S/2+Math.sin(a)*r*.9, L=13+R()*9, W=6+R()*3, sh=R();
      g.save(); g.translate(x,y); g.rotate(a+(R()-.5)*1.2); g.beginPath(); g.ellipse(0,0,L,W,0,0,6.283); g.fillStyle=sh<.33?'#9c9c9c':sh<.7?'#c9c9c9':'#eeeeee'; g.fill();
      g.strokeStyle='rgba(40,40,40,.55)'; g.lineWidth=1.5; g.stroke(); g.beginPath(); g.moveTo(-L*.8,0); g.lineTo(L*.8,0); g.strokeStyle='rgba(60,60,60,.45)'; g.lineWidth=1; g.stroke(); g.restore(); }
    tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace; tex.magFilter=THREE.NearestFilter; return tex; };
  // a tree: 'clumps' (a few big round clumps at the branch ends) or 'bunches' (many small faceted bunches along the outer branches)
  TREEGEN.model=(style,seed)=>{ const R=mul(seed), A=acc(), clumps=style==='clumps', h=7+R()*2.5, pal=PALS[Math.floor(R()*PALS.length)], bc=BARK[Math.floor(R()*BARK.length)], shape=R();
    const o={trunk:h*(.36+R()*.1),r:.2+R()*.1,depth:clumps?2:3,kids:[2,3],spread:.55+R()*.45,lenK:.62+R()*.1,up:shape<.3?.55:shape<.7?.35:.2,taper:.72,lead:clumps?.7+R()*.25:.3+R()*.25,lean:.25};
    const sk=skel(R,o), LB=[];
    for(const [a,b,r0,r1,dp] of sk.segs){ if(!clumps&&dp===0)continue; const j=.9+R()*.2; put(A,seg(a,b,Math.max(.03,r0),Math.max(.02,r1),dp===o.depth?6:4),[bc[0]*j,bc[1]*j,bc[2]*j],1); if(dp>=o.depth-1)LB.push([a,b,r0]); }
    const L0=A.P.length, c=new V(); for(const t of sk.tips)c.add(t.p); c.divideScalar(sk.tips.length||1); let rad=1.5; for(const t of sk.tips)rad=Math.max(rad,t.p.distanceTo(c));
    const CL=[];
    for(const t of sk.tips){ const base=pal[Math.floor(R()*3)], j=.88+R()*.24, cb=[base[0]*j,base[1]*j,base[2]*j], n=R()<.2?2:1;
      for(let i=0;i<n;i++){ const s=clumps?(.95+R()*.6)*(i?.7:1):.5+R()*.38, g=clumps?new THREE.SphereGeometry(1,7,5):new THREE.IcosahedronGeometry(1,0); if(!clumps)g.computeVertexNormals();
        const sx=s*(1+R()*.3), sy=s*(clumps?.78+R()*.17:.7+R()*.3), sz=s*(1+R()*.3); g.scale(sx,sy,sz); g.rotateY(R()*6.283);
        const back=clumps?0:R()*.9*t.len*.5, w=clumps?s*1.1:.7, px=t.p.x-t.d.x*back+(R()-.5)*w, py=t.p.y-t.d.y*back+(R()-(clumps?.2:.4))*(clumps?s*.7:.5), pz=t.p.z-t.d.z*back+(R()-.5)*w;
        g.translate(px,py,pz); const k2=.92+R()*.16; put(A,g,[cb[0]*k2,cb[1]*k2,cb[2]*k2],0); CL.push([px,py,pz,(sx+sy+sz)/3,cb[0]*.92,cb[1]*.92,cb[2]*.92]); } }
    crown(A,L0,c,rad,clumps?.35:.6);
    return pack(A,H=>{ let wd=0; for(let i=0;i<A.P.length;i+=3)wd=Math.max(wd,Math.hypot(A.P[i],A.P[i+2]));
      return {wide:2*wd/H,trunk:2*o.r/H,sum:{cl:cluster(CL,clumps?8:7).map(m=>[m[0]/H,m[1]/H,m[2]/H,m[3]/H,m[4],m[5],m[6]]),lb:LB.map(([a,b,r])=>[a.x/H,a.y/H,a.z/H,b.x/H,b.y/H,b.z/H,r/H]),bc}}; }); };
  // a bush: a few stems from one root, a low dome of leaf bunches on crossed cards, full to the ground
  TREEGEN.bush=seed=>{ const R=mul(seed), A=acc(), H=1.2+R()*.5, W=1.7+R()*.9, D=W*(.8+R()*.3), pal=PALS[Math.floor(R()*PALS.length)], bc=BARK[Math.floor(R()*BARK.length)], c=new V(0,H*.42,0);
    for(let i=0,ns=4+Math.floor(R()*3);i<ns;i++){ const az=i/ns*6.283+R()*.8, sp=.35+R()*.45; put(A,seg(new V((R()-.5)*.15,0,(R()-.5)*.15),new V(Math.cos(az)*W*.5*sp,H*(.55+R()*.35),Math.sin(az)*D*.5*sp),.06,.03,4),bc,1); }
    const L0=A.P.length;
    for(let i=0,nb=16+Math.floor(R()*8);i<nb;i++){ const az=R()*6.283, y=-.55+R()*1.5, rr=Math.sqrt(Math.max(0,1-Math.min(1,y*y)))*(.72+R()*.3), base=pal[Math.floor(R()*3)], j=.88+R()*.24;
      const cx=Math.cos(az)*rr*W*.5, cz=Math.sin(az)*rr*D*.5, cy=Math.max(.18,c.y+y*H*.6);
      for(let k=0,nc=3+Math.floor(R()*3);k<nc;k++){ const s=.45+R()*.3, g=new THREE.PlaneGeometry(s,s); g.rotateX(R()*6.283); g.rotateY(R()*6.283); g.rotateZ(R()*6.283);
        g.translate(cx+(R()-.5)*.35,Math.max(.12,cy+(R()-.4)*.3),cz+(R()-.5)*.35); const k2=.9+R()*.2; put(A,g,[base[0]*j*k2,base[1]*j*k2,base[2]*j*k2],0); } }
    crown(A,L0,c,Math.max(W,H)*.5,.85);
    return pack(A,Hn=>({wide:W/Hn,trunk:.7*W/Hn})); };
}
export {TREEGEN};
