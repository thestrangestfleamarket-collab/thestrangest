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
  const {cvNoise}=BOD.g, sh=BOD.K.sh, RW=B0.x1-B0.x0, RH=B0.y1-B0.y0, PATCH=[[1.2,2.5,3.6,4.4,0],[4.6,8.2,7.1,9.6,0],[2.1,10.6,3.4,11.5,1],[5.3,1.1,6.9,2.3,2],[.7,6.4,1.7,8.8,2],[5.9,5.2,6.6,5.9,0]], POND=[[3.2,6.3,1.2,.8],[6.2,12.1,.9,.6],[1.5,12.7,.7,.5],[4.5,3.4,.5,.4]];
  const roofCol=(x,y)=>{ const u=x-B0.x0, v=y-B0.y0, i=Math.floor(x*24), j=Math.floor(y*24), h1=hash(i,j,71), sN=Math.floor(v/1.45), sv=v-sN*1.45, wob=(cvNoise(u*3,sN,73)-.5)*.07;
    let c=sh([[50,50,52],[57,56,56],[45,45,48],[54,53,50]][Math.floor(hash(sN,1,75)*4)],.9+.2*grain(x,y,61,1.4));
    if(h1<.16)c=sh(c,1.38); else if(h1<.22)c=[c[0]*1.24,c[1]*1.14,c[2]]; else if(h1>.97)c=sh(c,.7);
    if(Math.abs(sv-.05-wob)<.03)c=sh(c,.6); else if(Math.abs(sv-.11-wob)<.03&&cvNoise(u*2,sN,77)>.45)c=sh(c,1.3);
    for(const [a,b,c2,d,k] of PATCH){ const e=.07*(cvNoise(u*4,v*4,79)-.5); if(u>a+e&&u<c2-e&&v>b+e&&v<d-e){ const ed=Math.min(u-a-e,c2-e-u,v-b-e,d-e-v); c=k===1?(h1<.3?[124,126,124]:h1<.55?[158,160,156]:[144,146,144]):k===2?[40,37,36]:[33,33,36]; if(k!==1&&h1<.08)c=sh(c,1.7); if(ed<.06)c=sh(c,k===1?.78:1.5); } }
    for(const [cu,cv,ru,rv] of POND){ const d=Math.hypot((u-cu)/ru,(v-cv)/rv)+cvNoise(u*1.6,v*1.6,81)*.5-.25; if(d<1.05){ if(d>.95||Math.abs(d-.78)<.03||Math.abs(d-.55)<.025)c=[108,102,90]; else c=sh(c,.76); } }
    { const dx=u-(RW*.5+1.4), dy=v-(RH*.55+.3); if(dx>-.2&&dx<1.6&&dy>-.1&&dy<.9){ const rr=cvNoise(u*3,v*3,89); if(rr>.4)c=[86+30*rr,64+16*rr,44]; } }
    const ed=Math.min(u,RW-u,v,RH-v); if(ed<.55){ if(hash(i>>1,j>>1,83)<.3*(1-ed/.55))c=hash(i,j,85)<.55?[60,78,44]:[96,78,52]; else c=sh(c,.86); }
    if(hash(i,j,87)<.003)c=[214,212,204]; if(hash(i>>2,j>>2,91)<.004)c=[150,120,70];
    return c; };
  const flat=(x0,y0,x1,y1,z,col,kind,S)=>{ if(x1-x0>80||y1-y0>80){ for(let a=x0;a<x1;a+=80)for(let b=y0;b<y1;b+=80)flat0(a,b,Math.min(x1,a+80),Math.min(y1,b+80),z,col,kind,S); return; } return flat0(x0,y0,x1,y1,z,col,kind,S); };
  const flat0=(x0,y0,x1,y1,z,col,kind,S)=>{ const X=S?BOD.XS:BOD.X, Y=S?BOD.YS:BOD.Y, Z=S?BOD.ZS:BOD.Z; return BOD.bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],BOD.faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>BOD.C(col(x0+(i+.5)/24,y0+(j+.5)/24))),kind); };
  flat(B0.x0,B0.y0,B0.x1,B0.y1,H,roofCol,'R');
  { const gb=b=>BOD.gbox(b,'R'), t=.36, PH=23, red=(i,j,k)=>{ const c=BRICKS.face(i,j,k,PH), m=c[0]<84; return m?[c[0]*1.25,c[1]*1.2,c[2]*1.12]:[c[0]*1.22,c[1]*.58,c[2]*.48]; };
    const wall=(x0,y0,x1,y1)=>gb({x0,y0,x1,y1,z0:H,z1:H+PH,c:[120,60,48],fs:(nx,ny,P,Q,z,k)=>{ const u=nx?Q:P, i=Math.floor(u*24), j=Math.floor(PH-z), o=(nx>0&&x0>B0.x0+RW/2)||(nx<0&&x0<B0.x0+RW/2)||(ny>0&&y0>B0.y0+RH/2)||(ny<0&&y0<B0.y0+RH/2);
      if(!o&&z<6+3*cvNoise(u*2,0,231))return sh([34,34,36],k*(hash(i,j,233)<.1?1.4:1)); let c=red(i,j,(nx+2)*7+(ny+2)*3);
      if(j<5&&cvNoise(u*1.5,j/4,235)>.55)c=[c[0]*.6+76,c[1]*.6+72,c[2]*.6+66]; if(hash(i>>1,Math.floor(u/.9),237)<.07&&j<4+20*hash(i>>1,2,239))c=sh(c,.68);
      if(o&&cvNoise(u/1.2,z/12,241)>.74&&c[0]<110)c=[c[0]*.7+40,c[1]*.7+40,c[2]*.7+38]; return sh(c,k); }});
    const X0=B0.x0, X1=B0.x1, Y0=B0.y0, Y1=B0.y1; wall(X0,Y1-t,X1,Y1); wall(X0,Y0,X1,Y0+t); wall(X0,Y0+t,X0+t,Y1-t); wall(X1-t,Y0+t,X1,Y1-t);
    let sd=0; const cope=(ax,a0,a1,at)=>{ for(let a=a0;a<a1-.05;){ const L=Math.min(a1-a,.55+.35*hash(sd,1,243)), dz=hash(sd,2,245)*.8, sh0=(hash(sd,3,247)-.5)*.03, tn=.88+.18*hash(sd,4,249), cr=hash(sd,5,251)<.18, k0=sd++;
      const col=(P,Q)=>{ const w=ax==='x'?P-a:Q-a, i=Math.floor(w*24), hp=hash(Math.floor(P*24),Math.floor(Q*24),253); if(w<.03||L-w<.03)return [70,68,64]; if(cr&&Math.abs(w-L*.4-(ax==='x'?Q:P)*.6)<.02)return [80,78,74];
        if(cvNoise(P*5,Q*5,k0+255)>.72)return hp<.5?[150,152,108]:[176,174,150]; if(hp<.012)return [232,230,224]; return sh([168*tn,162*tn,150*tn],.94+.1*hp); };
      const c0=ax==='x'?{x0:a,x1:a+L,y0:at-t/2-.05+sh0,y1:at+t/2+.05+sh0}:{y0:a,y1:a+L,x0:at-t/2-.05+sh0,x1:at+t/2+.05+sh0};
      gb({...c0,z0:H+PH,z1:H+PH+3.4+dz,c:[160,154,144],top:col,fs:(nx,ny,P,Q,z,k)=>z<1?sh(col(P,Q),k*.62):sh(col(P,Q),k*(z>2.6?1.06:.94))}); a+=L; } };
    cope('x',X0,X1,Y1-t/2); cope('x',X0,X1,Y0+t/2); cope('y',Y0+t,Y1-t,X0+t/2); cope('y',Y0+t,Y1-t,X1-t/2);
    { const ax0=X0+RW*.5-.6, ax1=ax0+1.9, ay0=Y0+RH*.55-.55, ay1=ay0+1.3, AH=22, Z0=H+2.2, beige=[176,172,160];
      for(const yy of [ay0+.15,ay1-.25])gb({x0:ax0-.15,x1:ax1+.15,y0:yy,y1:yy+.1,z0:H,z1:Z0,c:[92,74,56],fs:(nx,ny,P,Q,z,k)=>sh(hash(Math.floor((nx?Q:P)*24),Math.floor(z),261)<.3?[70,56,44]:[96,78,58],k),top:(P,Q)=>hash(Math.floor(P*24),Math.floor(Q*24),263)<.25?[78,62,46]:[104,86,64]});
      const acs=(nx,ny,P,Q,z,k)=>{ const u=nx?Q-ay0:P-ax0, L=nx?ay1-ay0:ax1-ax0, w=Math.min(u,L-u), i=Math.floor(u*24), hp=hash(i,Math.floor(z),265), zr=AH-z;
        let c=beige; if(w<.07)c=sh(beige,u<.035||L-u<.035?.8:1.05); else if(zr<3)c=sh(beige,zr<1?1.12:1); else if(z<2)c=sh(beige,.7);
        else if(nx>0&&u>.3&&u<L-.3&&z>4&&z<16){ c=sh(beige,1.04); if(u<.33||u>L-.33||z<4.5||z>15.5)c=sh(beige,.72); if(Math.abs(u-.4)<.03&&(Math.floor(z)===6||Math.floor(z)===14))c=[60,60,58]; if(u>L*.5-.2&&u<L*.5+.2&&z>11&&z<14)c=hash(i,Math.floor(z*2),267)<.5?[230,228,220]:[40,40,48]; }
        else { c=(Math.floor(z)&1)?sh(beige,.5):sh(beige,.98); if(hash(i>>1,Math.floor(z/2),269)<.05)c=sh(beige,.4); }
        if(hash(i>>1,3,271)<.12&&z<4+10*hash(i>>1,5,273))c=[c[0]*.78+22,c[1]*.62+8,c[2]*.5]; return sh(c,k*(.95+.08*hp)); };
      const fcx=ax0+.55, fcy=(ay0+ay1)/2;
      gb({x0:ax0,x1:ax1,y0:ay0,y1:ay1,z0:Z0,z1:Z0+AH,c:beige,fs:acs,top:(P,Q)=>{ const d=Math.hypot(P-fcx,Q-fcy), a=Math.atan2(Q-fcy,P-fcx), hp=hash(Math.floor(P*24),Math.floor(Q*24),275);
        if(d<.46){ if(d<.07)return [96,96,94]; if(d>.42)return sh(beige,.62); if(Math.abs(((a/(Math.PI/2))%1+1)%1-.5)<.06/Math.max(.1,d))return [118,118,114]; return Math.floor(d*24)%3===0?[104,104,100]:[30,30,32]; }
        if(Math.abs(P-(ax0+1.1))<.02||Math.min(P-ax0,ax1-P,Q-ay0,ay1-Q)<.04)return sh(beige,.8); if(hp<.006)return [226,224,218]; if(cvNoise(P*4,Q*4,277)>.74)return [126,120,104]; return sh(beige,.96+.08*hp); }});
      gb({x0:ax1,x1:ax1+.38,y0:ay0+.35,y1:ay0+.75,z0:H,z1:H+12,c:[170,172,170],fs:(nx,ny,P,Q,z,k)=>sh(Math.floor(z)%4===0?[120,122,120]:hash(Math.floor((nx?Q:P)*24),Math.floor(z),279)<.2?[196,198,196]:[166,168,166],k),top:()=>[150,152,150]});
      gb({x0:ax1+.38,x1:X1-t,y0:ay0+.5,y1:ay0+.56,z0:H,z1:H+.9,c:[120,122,124]}); }
    { const sx0=X0+1.3, sx1=sx0+1.1, sy0=Y0+3.1, sy1=sy0+1.25, CH=7, gal=[146,148,146];
      gb({x0:sx0,x1:sx1,y0:sy0,y1:sy1,z0:H,z1:H+CH,c:gal,fs:(nx,ny,P,Q,z,k)=>{ const i=Math.floor((nx?Q:P)*24); if(z<2.4+cvNoise((nx?Q:P)*3,1,281))return sh([36,36,38],k); let c=hash(i>>2,Math.floor(z/3),283)<.15?[120,98,80]:sh(gal,.94+.1*hash(i,Math.floor(z),285)); if(z>CH-1.2)c=sh(c,1.12); return sh(c,k); },top:()=>gal});
      gb({x0:sx0+.05,x1:sx1-.05,y0:sy0+.05,y1:sy1-.05,z0:H+CH,z1:H+CH+1.4,c:[70,88,96],fs:(nx,ny,P,Q,z,k)=>sh([96,98,98],k),top:(P,Q)=>{ const u=P-sx0, v=Q-sy0, hp=hash(Math.floor(P*24),Math.floor(Q*24),287), e=Math.min(u-.05,sx1-.05-P,v-.05,sy1-.05-Q);
        if(e<.05||Math.abs(u-(sx1-sx0)/2)<.025||Math.abs(v-(sy1-sy0)/2)<.025)return [92,94,94]; if(Math.abs(((u+v)*24/5)%1-.5)<.1||Math.abs(((u-v)*24/5+100)%1-.5)<.1)return [104,118,124];
        if(e<.14&&hp<.6)return [60,62,56]; if(Math.abs(v-.3-u*.5)<.015&&u>.6)return [150,170,176]; if(cvNoise(u*5,v*5,289)>.76)return hp<.5?[96,82,48]:[70,86,46]; return hp<.5?[62,80,90]:[56,72,82]; }}); } }
  for(const g of BOD.grounds)flat(g.x0,g.y0,g.x1,g.y1,g.z,g.col,'G',!g.bld);
  { const X=BOD.XS, Y=BOD.YS, Z=BOD.ZS; for(const k of BOD.kerbs){ const P=(a,z)=>k.ax==='y'?[X(k.at),Y(z),Z(a)]:[X(a),Y(z),Z(k.at)]; for(let a0=k.a0;a0<k.a1;a0+=80){ const a1=Math.min(k.a1,a0+80), H=k.z1-k.z0; BOD.bq(P(a0,k.z0),P(a1,k.z0),P(a1,k.z1),P(a0,k.z1),BOD.faceTex((a1-a0)*24,H,(i,j)=>BOD.kerbFaceAt(k,a0+(i+.5)/24,H-1-j,H)),'G'); } }
    for(const k of BOD.kerbArcs){ const H=k.z1-k.z0; let s=0; for(let i=0;i+1<k.P.length;i++){ const [x0,y0]=k.P[i], [x1,y1]=k.P[i+1], L=Math.hypot(x1-x0,y1-y0), s0=s; s+=L;
      BOD.bq([X(x0),Y(k.z0),Z(y0)],[X(x1),Y(k.z0),Z(y1)],[X(x1),Y(k.z1),Z(y1)],[X(x0),Y(k.z1),Z(y0)],BOD.faceTex(L*24,H,(ii,j)=>BOD.g.kerbFace(k.P[0][0]*7+s0+(ii+.5)/24,H-1-j,H)),'G'); } } }
  { const X=BOD.XS, Y=BOD.YS, Z=BOD.ZS, {RP,D,col}=BOD.ramps, RD=BOD.RD, H=-RD;
    for(const r of RP){ const P=(u,w,z)=>{ const q=r.ax==='x'?[u,r.e+r.dir*w]:[r.e+r.dir*w,u]; return [X(q[0]),Y(z),Z(q[1])]; }, W=r.u1-r.u0;
      const a=P(r.u0,0,RD), b=P(r.u1,0,RD), c=P(r.u1,D,0), d=P(r.u0,D,0), up=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])>0, tx=BOD.faceTex(W*24,D*24,(i,j)=>col((i+.5)/24,D-(j+.5)/24,W));
      if(up)BOD.bq(a,b,c,d,tx,'G'); else BOD.bq(b,a,d,c,tx,'G');
      for(const u of [r.u0,r.u1])BOD.bq(P(u,0,RD),P(u,D,0),P(u,D,0),P(u,0,0),BOD.faceTex(D*24,H,(i,j)=>BOD.g.kerbFace(u*7+i/24,H-1-j,H)),'G'); } }
  { const X=BOD.XS, Y=BOD.YS, Z=BOD.ZS, G3={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',
      G:'011100101101011',H:'101101111101101',I:'111010010010111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',
      P:'110101110100100',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',Y:'101101010010010',
      2:'110001010100111',5:'111100110001110'};
    const txt=(s,i,j,sc=1)=>{ i=Math.floor(i/sc); j=Math.floor(j/sc); const c=Math.floor(i/4), g=G3[s[c]]; return !!g&&i%4<3&&j>=0&&j<5&&g[j*3+i%4]==='1'; }, tw=(s,sc=1)=>(s.length*4-1)*sc;
    const sbox=(x0,y0,x1,y1,z0,z1,face,c)=>{ const H=Math.max(1,Math.round(z1-z0)), F=(nx,ny,w)=>(i,j)=>face?face(nx,ny,i,j,Math.max(1,Math.round(w*24)),H):c;
      for(const nx of [-1,1]){ const x=nx<0?x0:x1; BOD.bq([X(x),Y(z0),Z(nx<0?y1:y0)],[X(x),Y(z0),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y1:y0)],BOD.faceTex((y1-y0)*24,H,F(nx,0,y1-y0)),'L'); }
      for(const ny of [-1,1]){ const y=ny<0?y0:y1; BOD.bq([X(ny<0?x0:x1),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z1),Z(y)],[X(ny<0?x0:x1),Y(z1),Z(y)],BOD.faceTex((x1-x0)*24,H,F(0,ny,x1-x0)),'L'); }
      BOD.bq([X(x0),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y0)],[X(x0),Y(z1),Z(y0)],BOD.faceTex((x1-x0)*24,(y1-y0)*24,()=>c),'L'); };
    const GALV=[150,154,158], pole=(x,y,h)=>sbox(x-.04,y-.04,x+.04,y+.04,0,h,(nx,ny,i,j,w,H)=>j<3?[120,124,128]:H-j<6?[110,112,114]:i===0?[172,176,180]:GALV,GALV);
    const plate=(x,y,n,w,z0,z1,paint)=>{ const t=.02, edge=[96,100,104], P=(nx,ny,i,j,W,H)=>(n[0]&&nx||n[1]&&ny)?paint(W-1-i,j,W,H):edge;
      n[0]?sbox(x-t,y-w/2,x+t,y+w/2,z0,z1,P,edge):sbox(x-w/2,y-t,x+w/2,y+t,z0,z1,P,edge); };
    const GRN=[22,104,62], WH=[236,238,232], RED=[196,36,40], BLK=[24,24,26];
    const blade=s=>(u,j,W,H)=>{ if(j===0||j===H-1||u===0||u===W-1)return WH; const o=Math.floor((W-tw(s))/2); return txt(s,u-o,j-1-Math.floor((H-7)/2))&&u>=o?WH:GRN; };
    BATCH.tag=OBJ('street','street signs');
    for(const g of BOD.signs){ const {x,y}=g;
      if(g.kind==='name'){ const o=g.np?48:0; if(!g.np){ pole(x,y,124); sbox(x-.05,y-.05,x+.05,y+.05,124,127,null,GALV); } plate(x,y,[0,1],1.75,104+o,113+o,blade(g.ax)); plate(x,y,[1,0],1.75,114+o,123+o,blade(g.ay)); }
      else if(g.kind==='stop'){ pole(x,y,82); plate(x,y,g.n,.8,82,103,(u,j,W,H)=>{ const cx=(W-1)/2, cy=(H-1)/2, dx=Math.abs(u-cx)/cx, dy=Math.abs(j-cy)/cy; if(dx+dy>1.45)return null; if(dx>.9||dy>.9||dx+dy>1.3)return WH;
          const o=Math.floor((W-tw('STOP'))/2); return txt('STOP',u-o,j-Math.floor((H-5)/2))&&u>=o?WH:RED; }); }
      else if(g.kind==='nopark'){ pole(x,y,88); plate(x,y,g.n,.55,70,88,(u,j,W,H)=>{ if(u===0||j===0||u===W-1||j===H-1)return RED; const cx=(W-1)/2, cy=(H-1)/2, r=Math.hypot((u-cx)*1.2,j-cy);
          if(r>4.6&&r<6.2||r<6.2&&Math.abs((u-cx)*1.2+(j-cy))<1.1)return RED; return txt('P',u-Math.floor(cx-1),j-Math.floor(cy-2))&&u>=Math.floor(cx-1)?BLK:WH; }); }
      else if(g.kind==='speed'){ pole(x,y,92); plate(x,y,g.n,1,62,92,(u,j,W,H)=>{ if(u===0||j===0||u===W-1||j===H-1)return BLK; if(u===1||j===1||u===W-2||j===H-2)return WH;
          for(const [s,r,sc] of [['SPEED',3,1],['LIMIT',9,1],['25',16,2]]){ const o=Math.floor((W-tw(s,sc))/2); if(u>=o&&txt(s,u-o,j-r,sc))return BLK; } return WH; }); } }
    BATCH.tag=null; }
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
