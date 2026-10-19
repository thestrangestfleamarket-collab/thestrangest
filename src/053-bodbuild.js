BODB={};
{ const {X,Y,Z,B0,BODOFF}=BOD, {bodegaWall,grain,speck,COPE,hash}=BOD.g, H=B0.h, KINDS={};
  const inside=()=>BOD.inside(pos.x,pos.z); BODB.inside=inside;
  const paint=(w,s,u,z)=>{ const nx=w.ax==='y'?s:0, ny=w.ax==='x'?s:0, Xw=w.ax==='y'?w.at+s*.1:u, Yw=w.ax==='x'?w.at+s*.1:u;
    return (!w.outer||s===w.inS)?bodegaWall(null,nx,ny,Xw,Yw,z,1):BOD.facade(nx,ny,Xw,Yw,z,1,w.H); };
  const wallPt=(w,s,a,z)=>w.ax==='x'?[X(a),Y(z),Z(w.at+s*.1)]:[X(w.at+s*.1),Y(z),Z(a)];
  const planes={}; for(const w of BOD.WALLS)planes[w.id]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
  const glassMat=new THREE.MeshLambertMaterial({color:new THREE.Color(.5,.62,.7),transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false});
  for(const w of BOD.WALLS){ const as=new Set([w.a0,w.a1]), zs=new Set([0,w.H]), kind='W'+w.id;
    for(const h of w.holes){ as.add(Math.max(w.a0,h.a0)); as.add(Math.min(w.a1,h.a1)); zs.add(h.z0); zs.add(h.z1); }
    const A=[...as].sort((p,q)=>p-q), Zs=[...zs].sort((p,q)=>p-q);
    for(const s of [-1,1])for(let i=0;i+1<A.length;i++)for(let j=0;j+1<Zs.length;j++){ const a0=A[i], a1=A[i+1], z0=Zs[j], z1=Zs[j+1];
      if(w.holes.some(h=>(a0+a1)/2>h.a0&&(a0+a1)/2<h.a1&&(z0+z1)/2>h.z0&&(z0+z1)/2<h.z1))continue;
      BOD.bq(wallPt(w,s,a0,z0),wallPt(w,s,a1,z0),wallPt(w,s,a1,z1),wallPt(w,s,a0,z1),BOD.faceTex((a1-a0)*24,z1-z0,(ii,jj)=>BOD.C(paint(w,s,a0+(ii+.5)/24,z1-jj-.5))),kind); }
    const pt=(a,z,o)=>w.ax==='x'?[X(a),Y(z),Z(w.at+o)]:[X(w.at+o),Y(z),Z(a)], fr=(P,len,hg,c)=>BOD.bq(...P,BOD.faceTex(Math.max(1,len*24),Math.max(1,hg),()=>c),kind);
    fr([pt(w.a0,w.H,-.1),pt(w.a1,w.H,-.1),pt(w.a1,w.H,.1),pt(w.a0,w.H,.1)],w.a1-w.a0,5,COPE);
    for(const h of w.holes){ for(const a of [h.a0,h.a1])fr([pt(a,h.z0,-.1),pt(a,h.z0,.1),pt(a,h.z1,.1),pt(a,h.z1,-.1)],.2,h.z1-h.z0,BOD.FRAME);
      fr([pt(h.a0,h.z1,-.1),pt(h.a1,h.z1,-.1),pt(h.a1,h.z1,.1),pt(h.a0,h.z1,.1)],h.a1-h.a0,5,BOD.FRAME); if(h.z0>0)fr([pt(h.a0,h.z0,-.1),pt(h.a1,h.z0,-.1),pt(h.a1,h.z0,.1),pt(h.a0,h.z0,.1)],h.a1-h.a0,5,BOD.FRAME);
      if(h.glass&&!h.door){ const m=new THREE.Mesh(new THREE.PlaneGeometry((h.a1-h.a0)*TILE,Y(h.z1)-Y(h.z0)),glassMat.clone()); m.material.clippingPlanes=[planes[w.id]];
        if(w.ax==='x')m.position.set(X((h.a0+h.a1)/2),Y((h.z0+h.z1)/2),Z(w.at)); else{ m.position.set(X(w.at),Y((h.z0+h.z1)/2),Z((h.a0+h.a1)/2)); m.rotation.y=Math.PI/2; } scene.add(m); } } }
  const roofCol=(x,y)=>{ const n=grain(x,y,61,1.4); return speck(n<.35?[50,50,52]:n>.7?[66,64,62]:[58,57,57],x,y,63); };
  const flat=(x0,y0,x1,y1,z,col,kind,S)=>{ if(x1-x0>80||y1-y0>80){ for(let a=x0;a<x1;a+=80)for(let b=y0;b<y1;b+=80)flat0(a,b,Math.min(x1,a+80),Math.min(y1,b+80),z,col,kind,S); return; } return flat0(x0,y0,x1,y1,z,col,kind,S); };
  const flat0=(x0,y0,x1,y1,z,col,kind,S)=>{ const X=S?BOD.XS:BOD.X, Y=S?BOD.YS:BOD.Y, Z=S?BOD.ZS:BOD.Z; return BOD.bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],BOD.faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>BOD.C(col(x0+(i+.5)/24,y0+(j+.5)/24))),kind); };
  flat(B0.x0,B0.y0,B0.x1,B0.y1,H,roofCol,'R');
  for(const g of BOD.grounds)flat(g.x0,g.y0,g.x1,g.y1,g.z,g.col,'G',!g.bld);
  { const X=BOD.XS, Y=BOD.YS, Z=BOD.ZS; for(const k of BOD.kerbs){ const P=(a,z)=>k.ax==='y'?[X(k.at),Y(z),Z(a)]:[X(a),Y(z),Z(k.at)]; for(let a0=k.a0;a0<k.a1;a0+=80){ const a1=Math.min(k.a1,a0+80), H=k.z1-k.z0; BOD.bq(P(a0,k.z0),P(a1,k.z0),P(a1,k.z1),P(a0,k.z1),BOD.faceTex((a1-a0)*24,H,(i,j)=>BOD.kerbFaceAt(k,a0+(i+.5)/24,H-1-j,H)),'G'); } }
    for(const k of BOD.kerbArcs){ const H=k.z1-k.z0; let s=0; for(let i=0;i+1<k.P.length;i++){ const [x0,y0]=k.P[i], [x1,y1]=k.P[i+1], L=Math.hypot(x1-x0,y1-y0), s0=s; s+=L;
      BOD.bq([X(x0),Y(k.z0),Z(y0)],[X(x1),Y(k.z0),Z(y1)],[X(x1),Y(k.z1),Z(y1)],[X(x0),Y(k.z1),Z(y0)],BOD.faceTex(L*24,H,(ii,j)=>BOD.g.kerbFace(k.P[0][0]*7+s0+(ii+.5)/24,H-1-j,H)),'G'); } } }
  { const X=BOD.XS, Y=BOD.YS, Z=BOD.ZS, {RP,D,col}=BOD.ramps, RD=BOD.RD, H=-RD;
    for(const r of RP){ const P=(u,w,z)=>{ const q=r.ax==='x'?[u,r.e+r.dir*w]:[r.e+r.dir*w,u]; return [X(q[0]),Y(z),Z(q[1])]; }, W=r.u1-r.u0;
      const a=P(r.u0,0,RD), b=P(r.u1,0,RD), c=P(r.u1,D,0), d=P(r.u0,D,0), up=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])>0, tx=BOD.faceTex(W*24,D*24,(i,j)=>col((i+.5)/24,D-(j+.5)/24,W));
      if(up)BOD.bq(a,b,c,d,tx,'G'); else BOD.bq(b,a,d,c,tx,'G');
      for(const u of [r.u0,r.u1])BOD.bq(P(u,0,RD),P(u,D,0),P(u,D,0),P(u,0,0),BOD.faceTex(D*24,H,(i,j)=>BOD.g.kerbFace(u*7+i/24,H-1-j,H)),'G'); } }
  BOD.streetSigns();
  BOD.paintProps();
  BATCH.cast=true;
  BATCH.build((k,map,emap)=>{ const pl=k[0]==='W'||k[0]==='H'?planes[k.slice(1)]:null, cp=pl?{clippingPlanes:[pl]}:{};
    if(k==='B')return new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5,...cp});
    return new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.4}:{}),...cp}); });
  BATCH.cast=false; Object.assign(KINDS,BATCH.meshes); BATCH.meshes={};
  for(const me of BATCH.all(KINDS,'G'))me.castShadow=false;
  for(const U of BATCH.all(KINDS,'U')){ const O=BOD.O, zs=Object.values(O).filter(p=>/fluorescent tube/.test(p.name||'')).flatMap(p=>p.boxes.map(b=>b.z0)); OVERHEAD.push({o:U,y:BOD.Y(Math.min(...zs))}); }
  BODB.roof=BATCH.all(KINDS,'R');
  const NRM={front:[0,-1],back:[0,1],west:[1,0],east:[-1,0],office:[0,1]};
  for(const w of BOD.WALLS)for(const me of BATCH.all(KINDS,'W'+w.id))cutWalls.push({pl:planes[w.id],nx:NRM[w.id][0],nz:NRM[w.id][1],foot:Y(8),me,when:inside});
  { const {GOOD,GLAY}=BOD, O=BOD.O, list=[];
    const row=(p,f,zpx,items)=>{ const along=f[0]?1:0, a1=along?p.y1:p.x1, yaw=Math.atan2(-f[0],f[1]); let a=(along?p.y0:p.x0)+.08, last=null;
      for(const [k,n,...args] of items){ if(last&&last!==k)a+=.04; last=k;
        for(let i=0;i<n;i++){ const g=GOOD[k](...args), e=g.parts.map(q=>q.t==='box'?[q.h[0],q.h[1]]:[q.r,q.r]), w=Math.max(...e.map(v=>v[0])), d=Math.max(...e.map(v=>v[1]));
          if(a+2*w>a1-.06)return; const fr=f[0]+f[1]>0?(along?p.x1:p.y1)-.04-d:(along?p.x0:p.y0)+.04+d;
          list.push({g,k,x:along?fr:a+w,y:along?a+w:fr,z:zpx+.05,yaw:yaw+(hash(list.length,k.length,5)-.5)*.12}); a+=2*w+.015; } } };
    const lay=(k,f,zs,rows)=>{ const p=O[k]; if(p)rows.forEach((r,i)=>row(p,f,zs[i],r)); };
    const SZ=[14,32,50,68], FZ=[7,23,36,49];
    for(const i of [1,2,3])lay('fridge'+i,[1,0],FZ,GLAY['fridge'+i]);
    lay('wl1',[1,0],SZ,GLAY.aisle1a); lay('wl2',[1,0],SZ,GLAY.aisle1b); lay('wr1',[-1,0],SZ,GLAY.aisle2a); lay('wb3',[0,1],SZ,GLAY.aisle2b); lay('wl3',[1,0],SZ,GLAY.aisle2a);
    lay('wb1',[0,1],SZ,GLAY.back1); lay('wb2',[0,1],SZ,GLAY.back2);
    { const c=O.counter, F=BOD.food, z=30; for(let i=0;i<3;i++)list.push({g:GOOD.fishfood(),k:'fishfood',x:F.x-.08+i*.16*(i%2?1:.5),y:F.y+(i===2?.15:0),z,yaw:0});
      const along=c.y1-c.y0>c.x1-c.x0, cx=(c.x0+c.x1)/2, cy=(c.y0+c.y1)/2; let a=(along?c.y0:c.x0)+.95;
      for(const [k,n,...args] of GLAY.counter)for(let i=0;i<n;i++){ list.push({g:GOOD[k](...args),k,x:along?cx-.12+i*.02:a,y:along?a:cy,z,yaw:along?Math.PI/2:0}); a+=(k==='bananas'?.36:.09); } }
    const P=[], N=[], Cc=[], col=new THREE.Color();
    const emit=(it,pa,tri)=>{ const cs=Math.cos(it.yaw), sn=Math.sin(it.yaw), q=[0,1,2].map(i=>tri[i][0]).reduce((s,v)=>[s[0]+v[0]/3,s[1]+v[1]/3,s[2]+v[2]/3],[0,0,0]);
      const c=pa.mat(q,tri[0][1])||[200,200,200]; col.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace);
      for(const [p,n] of tri){ const lx=p[0]+pa.c[0], ly=p[1]+pa.c[1], lz=p[2]+pa.c[2], gx=it.x+lx*cs-ly*sn, gy=it.y+lx*sn+ly*cs;
        P.push(X(gx),Y(it.z+lz*24),Z(gy)); N.push(n[0]*cs-n[1]*sn,n[2],n[0]*sn+n[1]*cs); Cc.push(col.r,col.g,col.b); } };
    const quad=(it,pa,a,b,c,d,n)=>{ emit(it,pa,[[a,n],[b,n],[c,n]]); emit(it,pa,[[a,n],[c,n],[d,n]]); };
    const GL=BOD.goods=[]; for(const it of list){ const v0=P.length/3; for(const pa of it.g.parts){
      if(pa.t==='box'){ const [hx,hy,hz]=pa.h, NZ=6, NA=3;
        for(const [ax,s] of [[0,1],[0,-1],[1,1],[1,-1]]){ const n=ax?[0,s,0]:[s,0,0], ha=ax?hx:hy;
          for(let i=0;i<NA;i++)for(let j=0;j<NZ;j++){ const u0=-ha+2*ha*i/NA, u1=-ha+2*ha*(i+1)/NA, z0=-hz+2*hz*j/NZ, z1=-hz+2*hz*(j+1)/NZ; const pt=(u,z)=>ax?[u,s*hy,z]:[s*hx,u,z]; quad(it,pa,pt(u0,z0),pt(u1,z0),pt(u1,z1),pt(u0,z1),n); } }
        for(const s of [1,-1])quad(it,pa,[-hx,-hy,s*hz],[hx,-hy,s*hz],[hx,hy,s*hz],[-hx,hy,s*hz],[0,0,s]); }
      else if(pa.t==='cyl'){ const r=pa.r, hh=pa.hh, NS=10, NZ=6;
        for(let i=0;i<NS;i++){ const a0=i/NS*2*Math.PI, a1=(i+1)/NS*2*Math.PI, am=(a0+a1)/2, n=[Math.cos(am),Math.sin(am),0];
          for(let j=0;j<NZ;j++){ const z0=-hh+2*hh*j/NZ, z1=-hh+2*hh*(j+1)/NZ; quad(it,pa,[Math.cos(a0)*r,Math.sin(a0)*r,z0],[Math.cos(a1)*r,Math.sin(a1)*r,z0],[Math.cos(a1)*r,Math.sin(a1)*r,z1],[Math.cos(a0)*r,Math.sin(a0)*r,z1],n); }
          for(const s of [1,-1])emit(it,pa,[[[0,0,s*hh],[0,0,s]],[[Math.cos(a0)*r,Math.sin(a0)*r,s*hh],[0,0,s]],[[Math.cos(a1)*r,Math.sin(a1)*r,s*hh],[0,0,s]]]); } } }
      GL.push({k:it.k,m:it.g.m||.5,v0,v1:P.length/3}); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
    const me=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); me.receiveShadow=true; me.userData.goods=true; scene.add(me); BOD.goodsMesh=me; }
  const HALO=(c,W,H)=>{ const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d'), im=g.createImageData(W,H), B=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
    for(let j=0;j<H;j++)for(let i=0;i<W;i++){ const dx=(i+.5)/W*2-1, dy=(j+.5)/H*2-1, d=Math.hypot(dx,dy), t=(s0=>s0-Math.floor(s0))(Math.sin(i*12.9898+j*78.233)*43758.5453), s=d<.42+(t-.5)*.12?.5:d<.68+(t-.5)*.14?.26:d<.96+(t-.5)*.12?.1:0, q=(j*W+i)*4;
      im.data[q]=c[0]; im.data[q+1]=c[1]; im.data[q+2]=c[2]; im.data[q+3]=Math.round(s*255); }
    g.putImageData(im,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  for(const N of NEONS){ const n=N.cells.length/4, k=1/24, geo=new THREE.BoxGeometry(2*k*TILE,Y(2)-Y(0),2*k*TILE*.8), me=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:new THREE.Color(N.c[0]/255*1.1,N.c[1]/255*1.1,N.c[2]/255*1.1)}),n), m4=new THREE.Matrix4(); let i=0;
    for(const [a,b] of N.cells){ if(a%2||b%2)continue; m4.makeTranslation(X(N.x-N.W*k/2+(a+1)*k),Y(N.z+7-(b+1)),Z(N.y-.08)); me.setMatrixAt(i++,m4); }
    me.count=i; me.castShadow=false; me.receiveShadow=false; scene.add(me);
    { const w=N.W*k*TILE*2, h=(Y(14)-Y(0))*2.6, m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:HALO(N.c,Math.round(N.W*k*24*2/1.2),Math.round(14*2.6/1.2)),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
      const at=new THREE.Vector3(X(N.x),Y(N.z),Z(N.y-.08)), f=new THREE.Vector3(); m.position.copy(at); m.renderOrder=2;
      m.onBeforeRender=(r,s,c)=>{ m.quaternion.copy(c.quaternion); c.getWorldDirection(f); m.position.copy(at).addScaledVector(f,-.3); m.updateMatrixWorld(); }; scene.add(m); } }
  for(const l of BOD.LAMPS){ const cm=Math.max(...l.c); if(!(cm>0))continue; const L=new THREE.PointLight(new THREE.Color(l.c[0]/cm,l.c[1]/cm,l.c[2]/cm),7*cm*Math.min(1.2,l.r/5),l.r*TILE*1.25,1.6);
    L.position.set(X(l.x),Y(l.z),Z(l.y)); L.userData.i0=L.intensity; L.userData.both=!!l.neon; scene.add(L); lamps.push(L); }
}
