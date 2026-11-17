// HULL DOWN's trees: THE MARKET's tree maker (its src/060b-trees.js, copied in) and the pictures drawn from its trees for the cards (put into main.js by tools/edge.cjs)
const TREEGEN={};
{ const TD=A0.MT, V=T.Vector3, UP=new V(0,1,0);
  const acc=()=>({P:[],N:[],C:[],K:[],U:[]});
  const put=(A,g,col,kind)=>{ const q=g.index?g.toNonIndexed():g, p=q.attributes.position.array, n=q.attributes.normal.array, u=q.attributes.uv&&q.attributes.uv.array, nv=p.length/3;
    for(let i=0;i<p.length;i++){ A.P.push(p[i]); A.N.push(n[i]); }
    for(let i=0;i<nv;i++){ A.C.push(col[0],col[1],col[2]); A.U.push(u?u[i*2]:0,u?u[i*2+1]:0); }
    for(let t=0;t<nv/3;t++)A.K.push(kind); if(q!==g)q.dispose(); g.dispose(); };
  const seg=(a,b,r0,r1,sides)=>{ const d=new V().subVectors(b,a), L=d.length(), g=new T.CylinderGeometry(r1,r0,L,sides,1,true); g.translate(0,L/2,0); g.applyQuaternion(new T.Quaternion().setFromUnitVectors(UP,d.normalize())); g.translate(a.x,a.y,a.z); return g; };
  // leaves light as one rounded crown: normals lean out of the crown, colour darker low and inside
  const crown=(A,from,c,rad,k)=>{ for(let i=from;i<A.P.length;i+=3){ const vx=A.P[i]-c.x, vy=(A.P[i+1]-c.y)*1.3, vz=A.P[i+2]-c.z, l=Math.hypot(vx,vy,vz)||1;
      const nx=A.N[i]*(1-k)+vx/l*k, ny=A.N[i+1]*(1-k)+vy/l*k, nz=A.N[i+2]*(1-k)+vz/l*k, m=Math.hypot(nx,ny,nz)||1; A.N[i]=nx/m; A.N[i+1]=ny/m; A.N[i+2]=nz/m;
      const h=Math.max(0,Math.min(1,(A.P[i+1]-(c.y-rad))/(2*rad))), d=Math.min(1,Math.hypot(A.P[i]-c.x,A.P[i+2]-c.z)/rad), f=.72+.3*h+.1*d; A.C[i]*=f; A.C[i+1]*=f; A.C[i+2]*=f; } };
  // a recipe's parts: 0 a branch segment, 1 a round clump, 2 a faceted bunch, 3 a leaf card
  TREEGEN.assemble=rec=>{ const A=acc(), LB=[]; let L0=-1;
    for(const q of rec.pr){ const t=q[0];
      if(t===0){ LB.push(q.slice(1,9)); put(A,seg(new V(q[1],q[2],q[3]),new V(q[4],q[5],q[6]),q[7],q[8],q[9]),[q[10],q[11],q[12]],1); continue; }
      if(L0<0)L0=A.P.length; let g;
      if(t===3){ g=new T.PlaneGeometry(q[4],q[4]); g.rotateX(q[5]); g.rotateY(q[6]); g.rotateZ(q[7]); }
      else{ g=t===1?new T.SphereGeometry(1,6,4):new T.IcosahedronGeometry(1,0); if(t===2)g.computeVertexNormals(); g.scale(q[4],q[5],q[6]); g.rotateY(q[7]); }
      g.translate(q[1],q[2],q[3]); put(A,g,[q[8],q[9],q[10]],0); }
    if(L0>=0)crown(A,L0,new V(rec.c[0],rec.c[1],rec.c[2]),rec.c[3],rec.kN);
    let H=0, wd=0; for(let i=0;i<A.P.length;i+=3){ H=Math.max(H,A.P[i+1]); wd=Math.max(wd,Math.hypot(A.P[i],A.P[i+2])); } H=H||1;
    const p=new Float32Array(A.P.length); for(let i=0;i<p.length;i++)p[i]=A.P[i]/H;
    return {p,n:new Float32Array(A.N),c:new Uint8ClampedArray(A.C),k:new Uint8Array(A.K),uv:new Float32Array(A.U),metres:1,tris:A.K.length,H,wide:2*wd/H,trunk:rec.tr/H,limbs:LB.map(l=>l.map(v=>v/H))}; };
  // limbs: every woody segment [ax,ay,az,bx,by,bz,ra,rb] in the model's own units, for what climbs the tree
  const LIMBS=S=>(S.lb||[]).map(([ax,ay,az,bx,by,bz,r])=>[ax,ay,az,bx,by,bz,r,r*.7]);
  // a tree's low bake from its summary: one faceted 20-sided clump per leaf clump, an open five-sided limb per limb, coloured per vertex
  TREEGEN.low=(S,trunk)=>{ const A=acc(), q=new T.Quaternion(), C=new T.IcosahedronGeometry(1,0), L=new T.CylinderGeometry(.7,1,1,5,1,true);
    for(const [ax,ay,az,bx,by,bz,r] of S.lb){ const d=new V(bx-ax,by-ay,bz-az), len=d.length(); if(len<1e-4)continue; const g=L.clone(); g.scale(r,len,r); g.translate(0,len/2,0); g.applyQuaternion(q.setFromUnitVectors(UP,d.normalize())); g.translate(ax,ay,az); put(A,g,S.bc,1); }
    const lo=Math.min(...S.cl.map(c=>c[1]-c[3])), hi=Math.max(...S.cl.map(c=>c[1]+c[3]))||1;
    for(const [x,y,z,r,R,G,B] of S.cl){ const g=C.clone(); g.scale(r,r*.82,r); g.translate(x,y,z); const f=.74+.32*(y-lo)/Math.max(1e-3,hi-lo); put(A,g,[R*f,G*f,B*f],0); }
    C.dispose(); L.dispose(); let H=0, wd=0; for(let i=0;i<A.P.length;i+=3){ H=Math.max(H,A.P[i+1]); wd=Math.max(wd,Math.hypot(A.P[i],A.P[i+2])); }
    return {p:new Float32Array(A.P),c:new Uint8ClampedArray(A.C),k:new Uint8Array(A.K),metres:1,tris:A.K.length,H:H||1,wide:2*wd,rad:wd,trunk,sum:S,limbs:LIMBS(S)}; };
  // the leaf card: small leaves in three tones on a ragged round, and a solid strip on the right for the limbs
  // the leaf picture: two halves, the bold leaves (left) and fine, smaller ones (right); a tree's cards use one half; the white strip at the right edge colours limbs and cores
  let LT=null; TREEGEN.leaf=()=>{ if(LT)return LT; const leaves=(N,n,L0,L1)=>{ const cv=document.createElement('canvas'); cv.width=cv.height=N; const g=cv.getContext('2d'); g.scale(N/64,N/64); let a=7; const R=()=>{ a=(a*16807)%2147483647; return a/2147483647; };
      g.fillStyle='#fff'; g.fillRect(58,0,6,64);
      for(let i=0;i<n;i++){ const t=R()*6.283, r=23*Math.sqrt(R()), v=[255,235,205][Math.floor(R()*3)], L=L0+R()*L1; g.save(); g.translate(29+Math.cos(t)*r,32+Math.sin(t)*r); g.rotate(R()*6.283);
        g.fillStyle=`rgb(${v*.58|0},${v*.62|0},${v*.55|0})`; g.beginPath(); g.ellipse(0,0,L+1,L*.55+1,0,0,6.283); g.fill(); g.fillStyle=`rgb(${v},${v},${v})`; g.beginPath(); g.ellipse(0,0,L,L*.55,0,0,6.283); g.fill(); g.restore(); }
      return cv; };
    const cv=document.createElement('canvas'); cv.width=256; cv.height=128; const g=cv.getContext('2d'); g.imageSmoothingEnabled=false; g.drawImage(leaves(64,60,3.2,2.2),0,0,128,128); g.drawImage(leaves(128,150,1.8,1.4),128,0);
    LT=new T.CanvasTexture(cv); LT.magFilter=LT.minFilter=T.NearestFilter; LT.generateMipmaps=false; LT.encoding=T.sRGBEncoding; return LT; };
  // a tree as leaf cards (owner's pick A, 27 Oct 2026): cards scattered through each clump of its summary, lit as one round crown, darker inside; open limbs under them. lite: fewer, bigger, single cards
  // look 0-3 (owner, 1 Nov 2026: all four, at random): 1 fine leaves (smaller, more cards on the fine half of the picture), 2 airy (no dark core, fewer cards), 3 both
  TREEGEN.cards=(S,trunk,seed,lite,look=0)=>{ const fine=look&1, airy=look&2; const A=acc(), LB=LIMBS(S), Q=new T.Quaternion(), E=new T.Euler(), Y90=new T.Quaternion().setFromAxisAngle(UP,Math.PI/2), e=new V(), o=new V(), n=new V(); let a=seed*7919+13; const R=()=>{ a=(a*16807)%2147483647; return a/2147483647; };
    const bc=S.bc||[90,70,50], L=new T.CylinderGeometry(.7,1,1,5,1,true);
    for(const [ax,ay,az,bx,by,bz,r] of S.lb){ const d=new V(bx-ax,by-ay,bz-az), len=d.length(); if(len<1e-4)continue; const g=L.clone(); g.scale(r,len,r); g.translate(0,len/2,0); g.applyQuaternion(Q.setFromUnitVectors(UP,d.normalize())); g.translate(ax,ay,az);
      const u=g.attributes.uv.array; for(let i=0;i<u.length;i+=2){ u[i]=.97; u[i+1]=.5; } put(A,g,bc,1); }
    // a vase tree's trunk flares into lobed roots at its foot (owner, 2 Nov 2026, of a plain block of a trunk)
    if(S.vase&&S.lb[0]){ const r=S.lb[0][6], h=.07, g=new T.CylinderGeometry(r*1.08,r*1.8,h,9,2,true), P=g.attributes.position; for(let i=0;i<P.count;i++){ const x=P.getX(i), z=P.getZ(i), y=P.getY(i), t=(y+h/2)/h, k=1+.22*(1-t)*Math.max(0,Math.sin(Math.atan2(z,x)*4.5+1)); P.setXYZ(i,x*k,y,z*k); }
      g.computeVertexNormals(); g.translate(S.lb[0][0],S.lb[0][1]+h/2,S.lb[0][2]); const u=g.attributes.uv.array; for(let i=0;i<u.length;i+=2){ u[i]=.97; u[i+1]=.5; } put(A,g,bc,1); }
    // branches through the crown: the trunk carries on up to the crown's middle, and a tapering limb, bent once, reaches out into each clump
    { const r0=Math.max(.012,(S.lb[0]&&S.lb[0][6])||.03)*1.6, lo=Math.min(...S.cl.map(q=>q[1]-q[3])), cy0=S.cl.reduce((a,q)=>a+q[1],0)/S.cl.length, B=new T.CylinderGeometry(1,1,1,5,1,true);
      const limb=(a,b,ra,rb)=>{ const d=new V().subVectors(b,a), len=d.length(); if(len<1e-4)return; LB.push([a.x,a.y,a.z,b.x,b.y,b.z,ra,rb]); const g=B.clone(), P=g.attributes.position; for(let i=0;i<P.count;i++){ const t=P.getY(i)+.5, r=ra+(rb-ra)*t; P.setXYZ(i,P.getX(i)*r,t*len,P.getZ(i)*r); }
        g.computeVertexNormals(); g.applyQuaternion(Q.setFromUnitVectors(UP,d.normalize())); g.translate(a.x,a.y,a.z); const u=g.attributes.uv.array; for(let i=0;i<u.length;i+=2){ u[i]=.97; u[i+1]=.5; } put(A,g,bc,2); };
      const base=new V(0,lo*.6,0), top=new V(0,cy0,0); if(!S.vase)limb(base,top,r0*.85,r0*.4);
      // a vase tree's limbs set out from the nearest end of its own arching branches, not from a trunk through the crown
      const ends=S.vase?S.lb.map(q=>new V(q[3],q[4],q[5])):null, from=(x,y,z)=>{ const e=new V(x,y,z); let b=ends[0], bd=1e9; for(const q of ends){ const d=q.distanceTo(e); if(d<bd){ bd=d; b=q; } } return b.clone(); };
      S.cl.forEach(([x,y,z,r],i)=>{ const f=Math.max(.15,Math.min(.9,(y-base.y)/Math.max(1e-3,top.y-base.y)*.7)), st=ends?from(x,y,z):new V().lerpVectors(base,top,f), end=new V(x,y,z), out=new V(x,0,z); if(out.lengthSq()>1e-6)end.addScaledVector(out.normalize(),r*.75);
        const mid=new V().lerpVectors(st,end,.5); mid.y+=r*.25+R()*r*.2; mid.x+=(R()-.5)*r*.3; mid.z+=(R()-.5)*r*.3; limb(st,mid,r0*.5,r0*.32); limb(mid,end,r0*.32,r0*.12);
        const tw=new V(end.x+(R()-.5)*r*.8,end.y+r*.3,end.z+(R()-.5)*r*.8); limb(mid,tw,r0*.2,r0*.07); }); B.dispose(); }
    // a round dark core well inside the cards (never poking through them) so the crown has bulk; airy crowns have none
    if(!airy&&!S.hollow){ const C=new T.IcosahedronGeometry(1,1); for(const [x,y,z,r,Rc,Gc,Bc] of S.cl){ const g=C.clone(); g.scale(r*.6,r*.52,r*.6); g.translate(x,y,z); const u=g.attributes.uv.array; for(let i=0;i<u.length;i+=2){ u[i]=.97; u[i+1]=.5; } put(A,g,[Rc*.5,Gc*.5,Bc*.5],0); } C.dispose(); }
    L.dispose(); let cx=0, cy=0, cz=0, w=0; for(const q of S.cl){ const k=q[3]*q[3]; cx+=q[0]*k; cy+=q[1]*k; cz+=q[2]*k; w+=k; } const cc=new V(cx/w,cy/w,cz/w); let cr=1e-3; for(const q of S.cl)cr=Math.max(cr,cc.distanceTo(new V(q[0],q[1],q[2]))+q[3]);
    const RL=Math.max(...S.cl.map(q=>Math.hypot(q[0],q[2])+q[3])), CF=S.card||1, D=(lite?700:2240)*[1,1.8,.6,1.1][look]/(CF*CF), SZ=(lite?.19:.135)*cr/.45*[1,.62,1,.7][look]*CF, VQ=[[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]];
    const quad=(q,sz,col)=>{ n.copy(o).sub(cc).normalize().lerp(UP,.15).normalize(); for(const [x,y] of VQ){ e.set(x*sz/2,y*sz/2,0).applyQuaternion(q).add(o); const h=Math.hypot(e.x,e.z); if(h>RL){ e.x*=RL/h; e.z*=RL/h; } A.P.push(e.x,e.y,e.z); A.N.push(n.x,n.y,n.z); A.C.push(...col); A.U.push((x+1)/2*.44+(fine?.5:0),(y+1)/2); } A.K.push(0,0); };
    // a hollow crown (the elms, owner 2 Nov 2026: "the inside should be empty enough to climb"): leaves only on each clump's outer half, none in the open middle round the trunk and its leaders
    const HR=S.hollow?RL*.55:0, HY=cc.y+cr*.3;
    for(const [qx,qy,qz,qr,Rc,Gc,Bc] of S.cl){ const r=qr*1.15, m=Math.max(3,Math.round(D*qr*qr*(.45/cr)**2)), ox=qx/(Math.hypot(qx,qz)||1), oz=qz/(Math.hypot(qx,qz)||1);
      for(let i=0;i<m;i++){ e.set(R()*2-1,R()*2-1,R()*2-1).normalize(); if(HR&&e.x*ox+e.z*oz<-.2)e.set(-e.x,e.y,-e.z); o.set(qx,qy,qz).addScaledVector(e,r*(lite?.55+.45*Math.sqrt(R()):HR?.7+.3*Math.sqrt(R()):.45+.55*Math.sqrt(R()))); if(HR&&o.y<HY&&Math.hypot(o.x,o.z)<HR)continue;
        const dp=Math.min(1,o.distanceTo(cc)/cr), tp=Math.max(0,Math.min(1,(o.y-cc.y+cr)/(2*cr))), f=(.68+.42*dp*dp+.25*tp)*(.9+R()*.2), col=[Rc*f,Gc*f,Bc*f], sz=SZ*(.75+R()*.5);
        Q.setFromEuler(E.set(R()*6.28,R()*6.28,R()*6.28)); quad(Q,sz,col); if(!lite)quad(Q.clone().multiply(Y90),sz,col); } }
    let H=0, wd=0; for(let i=0;i<A.P.length;i+=3){ H=Math.max(H,A.P[i+1]); wd=Math.max(wd,Math.hypot(A.P[i],A.P[i+2])); }
    return {p:new Float32Array(A.P),n:new Float32Array(A.N),c:new Uint8ClampedArray(A.C),k:new Uint8Array(A.K),uv:new Float32Array(A.U),metres:1,tris:A.K.length,H:H||1,wide:2*wd,rad:wd,trunk,sum:S,cards:1,limbs:LB}; };
  const cache={};
  TREEGEN.get=(set,i)=>{ const key=set+i; if(cache[key])return cache[key]; const rec=TD[set][i]; if(!rec.pr)return cache[key]={p:new Float32Array(0),n:new Float32Array(0),c:new Uint8ClampedArray(0),k:new Uint8Array(0),uv:new Float32Array(0),metres:1,tris:0,H:1,wide:rec.wide,trunk:rec.tr,sum:rec.sum}; const m=TREEGEN.assemble(rec); if(rec.sum)m.sum=rec.sum; return cache[key]=m; };
  TREEGEN.count=set=>(TD[set]||[]).length; TREEGEN.old=TD.old||{};
}
// a market tree drawn from two sides into pictures for a pair of crossed cards: its width for a height of one, and the two pictures
const MTREE={n:0,bake(set,i){
  const rec=A0.MT[set][i],m=rec.sum?TREEGEN.cards(rec.sum,rec.tr,7+i*13+set.length,false,0):TREEGEN.get(set,i),H=rec.sum?m.H:1,g=new T.BufferGeometry(),p=new Float32Array(m.p.length),c=new Float32Array(m.c.length);
  let wd=0;for(let k=0;k<p.length;k+=3){p[k]=m.p[k]/H;p[k+1]=m.p[k+1]/H;p[k+2]=m.p[k+2]/H;wd=Math.max(wd,Math.abs(p[k]),Math.abs(p[k+2]));}for(let k=0;k<c.length;k++)c[k]=Math.pow(m.c[k]/255,2.2);
  g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(m.n,3));g.setAttribute('color',new T.BufferAttribute(c,3));{const uv=new Float32Array(m.uv);if(!rec.sum)for(let t=0;t<m.k.length;t++)for(let v=0;v<3;v++){const q=(t*3+v)*2;if(m.k[t]){uv[q]=.97;uv[q+1]=.5;}else uv[q]*=.44;}g.setAttribute('uv',new T.BufferAttribute(uv,2));}
  const mat=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide,map:TREEGEN.leaf(),alphaTest:.5}),sc=new T.Scene(),mesh=new T.Mesh(g,mat);sc.add(mesh);
  const sun=new T.DirectionalLight(0xfff0d8,1.9);sun.position.set(.6,.9,.7);sc.add(sun,new T.HemisphereLight(0xbfd4ff,0x4a4030,.85));
  const w=Math.max(.2,wd*2.06),cam=new T.OrthographicCamera(-w/2,w/2,.52,-.51,.1,20),tm=renderer.toneMapping,cc=renderer.getClearColor(new T.Color()).clone(),ca=renderer.getClearAlpha(),tex=[],rts=[];renderer.toneMapping=T.NoToneMapping;renderer.setClearColor(0x2a3a1c,0);
  for(const a of[0,Math.PI/2]){const rt=new T.WebGLRenderTarget(512,512,{depthBuffer:true});rt.texture.generateMipmaps=true;rt.texture.minFilter=T.LinearMipmapLinearFilter;rt.texture.anisotropy=4;cam.position.set(Math.sin(a)*8,.5,Math.cos(a)*8);cam.lookAt(0,.5,0);renderer.setRenderTarget(rt);renderer.clear();renderer.render(sc,cam);tex.push(rt.texture);rts.push(rt);}
  renderer.setRenderTarget(null);renderer.toneMapping=tm;renderer.setClearColor(cc,ca);g.dispose();mat.dispose();MTREE.n++;return{w,tex,rts};}};
// THE MARKET's big park trees (its src/144d-bigtrees.js, copied in): a thick lumpy trunk with roots, one massive branch and four to eight smaller ones, a dense crown of leaf puffs; in metres, standing at the origin
const BIGT=(()=>{
  const hs=(a,b)=>{const s=Math.sin(a*127.1+b*311.7)*43758.5453;return s-Math.floor(s);};
  const KIND={A:{h:62,r0:3.2,r1:.5,br:[[13,0,1.9],[14,7,1.5],[15,14,1.1],[15.5,20,.8],[16.5,26,.5]]},B:{h:58,r0:3,r1:.5,br:[[8,0,2],[11.5,6,1.6],[15.5,12,1.25],[20,18,.9],[24.5,24,.55]]},C:{h:55,r0:3.6,r1:.55,br:[[6,0,2.1],[5.2,7,1.7],[4.4,14,1.35],[4.8,20,1],[6.5,25,.7],[9,29,.45]]}};
  const GREEN=[[.37,.6,.32],[.43,.67,.36],[.5,.72,.4],[.31,.54,.28]];
  const tube=(pts,P)=>{const c=new T.CatmullRomCurve3(pts.map(q=>new T.Vector3(q[0],q[1],q[2]))),n=Math.max(8,pts.length*8),rad=pts.map(q=>q[3]);
    const geo=new T.TubeGeometry(c,n,1,12,false),ps=geo.attributes.position,nr=geo.attributes.normal;
    for(let i=0;i<=n;i++){const u=i/n,f=u*(pts.length-1),k=Math.min(pts.length-2,Math.floor(f)),r=rad[k]+(rad[k+1]-rad[k])*(f-k),cp=c.getPointAt(u);
      for(let j=0;j<=12;j++){const a=i*13+j,w=1+.08*Math.sin(j*2.1+i*.7)+.05*Math.sin(j*5.3);ps.setXYZ(a,cp.x+nr.getX(a)*r*w,cp.y+nr.getY(a)*r*w,cp.z+nr.getZ(a)*r*w);}}
    const A=geo.toNonIndexed().attributes.position.array;for(let i=0;i<A.length;i++)P.push(A[i]);geo.dispose();};
  const make=(kind,i)=>{const M=1,sz=1,PK=1,S=KIND[kind],x=0,y=0,z=0,face=i*1.9,dx=Math.cos(face),dz=Math.sin(face),P=[],puffs=[];let nl=0;
    const rAt=h=>S.r0+(S.r1-S.r0)*Math.pow(Math.max(0,h)/S.h,.7),at=(h,a,d)=>[x+Math.cos(a)*d,y+h*M,z+Math.sin(a)*d];
    const puff=(px,py,pz,r)=>{const q=Math.hypot(px-x,pz-z),need=(rAt((py-y)/M)+1.5)*M+r*.5;if(q<need){const k=need/(q||1);px=x+(px-x)*k;pz=z+(pz-z)*k;}puffs.push([px,py,pz,r,Math.floor(hs(i,puffs.length)*4)]);};
    const trunk=[];for(let k=0;k<=8;k++){const u=k/8;trunk.push([x+Math.sin(u*3+face)*.4*M*u,y+u*S.h*M-.5*M,z+Math.cos(u*2.3+face)*.3*M*u,rAt(u*S.h)*M*(k?1:1.35)]);}tube(trunk,P);
    const branch=(pts,big)=>{tube(pts,P);nl+=pts.length-1;const c=new T.CatmullRomCurve3(pts.map(q=>new T.Vector3(q[0],q[1],q[2]))),L=c.getLength(),n=Math.max(3,Math.round(L/(1.2*M)*sz));
      for(let k=0;k<n;k++){const u=.25+.75*(k+.5)/n,p=c.getPointAt(u),s=i*31+nl*7+k;for(let j=0;j<4;j++){const t=s*5+j,r=(1.6+1.4*hs(t,1))*M*(big?1.3:1)*PK,a=hs(t,2)*6.28,d=(.6+2.6*hs(t,3))*M;
        puff(p.x+Math.cos(a)*d,p.y+(.4+2.4*hs(t,4))*M-(j===3?1.2*M:0),p.z+Math.sin(a)*d,r);}}};
    branch(S.br.map(([h,d,r])=>[x+dx*d*M-dz*Math.sin(d*.25)*1.2*M,y+h*M,z+dz*d*M+dx*Math.sin(d*.25)*1.2*M,r*M]),true);
    const L0=S.br[S.br.length-1][1],R0=S.br[0][2],nb=4+Math.floor(hs(i,9)*5);
    for(let k=0;k<nb;k++){const s=.25+.25*hs(i,20+k),a=face+.9+k/nb*(6.28-1.8)+(hs(i,40+k)-.5)*.5,h=S.h*(.18+.55*(k+hs(i,60+k))/nb),L=L0*s,r=Math.min(R0*s*1.1,rAt(h)*.8),up=.25+.55*hs(i,80+k),pts=[];
      for(let q=0;q<=4;q++){const u=q/4;pts.push([...at(h+L*up*u*(.6+.4*u),a,L*u*M),Math.max(.12,r*(1-.75*u))*M]);}branch(pts,false);}
    for(let k=0;k<6;k++){const a=k/6*6.28+.4+face;tube([[x,y+2.5*M,z,1.6*M],[...at(.3,a,4*M),.9*M],[...at(-.3,a,6.5*M),.25*M]],P);}
    for(let h=S.h*.55;h<S.h+4;h+=1.4/sz){const w=1-Math.max(0,(h-S.h*.9)/(S.h*.1+4))*.6,n=9+Math.floor(hs(i,h)*4);for(let k=0;k<n;k++){const a=hs(i,h+k)*6.28;puff(...at(h,a,(rAt(h)+1.5+6*w*hs(h,k))*M),(2+1.8*hs(k,h))*M*PK);}}
    return{P:new Float32Array(P),puffs};};
  // one of them drawn from two sides for a pair of crossed cards
  const bake=(kind,i)=>{const t=make(kind,i),sc=new T.Scene(),grp=new T.Group(),geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(t.P,3));geo.computeVertexNormals();
    grp.add(new T.Mesh(geo,new T.MeshLambertMaterial({color:new T.Color(0x6a5040).convertSRGBToLinear(),flatShading:true})));
    const PG=new T.IcosahedronGeometry(1,1),IM=new T.InstancedMesh(PG,new T.MeshLambertMaterial({color:0xffffff}),t.puffs.length),m4=new T.Matrix4(),q=new T.Quaternion(),v=new T.Vector3(),s=new T.Vector3(),c=new T.Color(),EU=new T.Euler();let H=0,wd=0;
    t.puffs.forEach(([x,y,z,r,k],j)=>{IM.setMatrixAt(j,m4.compose(v.set(x,y,z),q.setFromEuler(EU.set(j*2.399%6.283,j*1.618%6.283,j*.737%6.283)),s.setScalar(r)));const G=GREEN[k];IM.setColorAt(j,c.setRGB(Math.pow(G[0],2.2),Math.pow(G[1],2.2),Math.pow(G[2],2.2)));H=Math.max(H,y+r);wd=Math.max(wd,Math.abs(x)+r,Math.abs(z)+r);});
    grp.add(IM);grp.scale.setScalar(1/H);sc.add(grp);const sun=new T.DirectionalLight(0xfff0d8,1.9);sun.position.set(.6,.9,.7);sc.add(sun,new T.HemisphereLight(0xbfd4ff,0x3a3426,.75));
    const w=wd*2.04/H,cam=new T.OrthographicCamera(-w/2,w/2,.52,-.51,.1,20),tm=renderer.toneMapping,cc=renderer.getClearColor(new T.Color()).clone(),ca=renderer.getClearAlpha(),tex=[],rts=[];renderer.toneMapping=T.NoToneMapping;renderer.setClearColor(0x2a3a1c,0);
    for(const a of[0,Math.PI/2]){const rt=new T.WebGLRenderTarget(512,512,{depthBuffer:true});rt.texture.generateMipmaps=true;rt.texture.minFilter=T.LinearMipmapLinearFilter;rt.texture.anisotropy=4;cam.position.set(Math.sin(a)*8,.5,Math.cos(a)*8);cam.lookAt(0,.5,0);renderer.setRenderTarget(rt);renderer.clear();renderer.render(sc,cam);tex.push(rt.texture);rts.push(rt);}
    renderer.setRenderTarget(null);renderer.toneMapping=tm;renderer.setClearColor(cc,ca);geo.dispose();PG.dispose();return{w,tex,rts,puffs:t.puffs.length};};
  return{make,bake,KIND};
})();
