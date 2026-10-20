BODB={};
{ const {X,Y,Z,B0,BODOFF}=BOD, {bodegaWall,grain,speck,COPE,hash}=BOD.g, H=B0.h, KINDS={};
  const inside=()=>BOD.inside(pos.x,pos.z)||!!(window.ROOMS&&ROOMS.cur&&ROOMS.cur.lz==='bodega'); BODB.inside=inside;
  const paint=(w,s,u,z)=>{ const nx=w.ax==='y'?s:0, ny=w.ax==='x'?s:0, Xw=w.ax==='y'?w.at+s*.1:u, Yw=w.ax==='x'?w.at+s*.1:u;
    return (!w.outer||s===w.inS)?bodegaWall(null,nx,ny,Xw,Yw,z,1):BOD.facade(nx,ny,Xw,Yw,z,1,w.H); };
  const wallPt=(w,s,a,z)=>w.ax==='x'?[X(a),Y(z),Z(w.at+s*.1)]:[X(w.at+s*.1),Y(z),Z(a)];
  const planes={}; for(const w of BOD.WALLS)planes[w.id]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
  const glassMat=new THREE.MeshLambertMaterial({color:new THREE.Color(.09,.11,.14),side:THREE.DoubleSide});
  const wallF=(w,inn)=>{ const as=new Set([w.a0,w.a1]), zs=new Set([0,w.H]), kind='W'+w.id;
    for(const h of w.holes){ as.add(Math.max(w.a0,h.a0)); as.add(Math.min(w.a1,h.a1)); zs.add(h.z0); zs.add(h.z1); }
    const A=[...as].sort((p,q)=>p-q), Zs=[...zs].sort((p,q)=>p-q);
    for(const s of [-1,1]){ if((!w.outer||s===w.inS)!==inn)continue; for(let i=0;i+1<A.length;i++)for(let j=0;j+1<Zs.length;j++){ const a0=A[i], a1=A[i+1], z0=Zs[j], z1=Zs[j+1];
      if(w.holes.some(h=>(a0+a1)/2>h.a0&&(a0+a1)/2<h.a1&&(z0+z1)/2>h.z0&&(z0+z1)/2<h.z1))continue;
      BOD.bq(wallPt(w,s,a0,z0),wallPt(w,s,a1,z0),wallPt(w,s,a1,z1),wallPt(w,s,a0,z1),BOD.faceTex((a1-a0)*24,z1-z0,(ii,jj)=>BOD.C(paint(w,s,a0+(ii+.5)/24,z1-jj-.5))),kind); } } };
  const wallR=w=>{ const kind='W'+w.id, pt=(a,z,o)=>w.ax==='x'?[X(a),Y(z),Z(w.at+o)]:[X(w.at+o),Y(z),Z(a)], fr=(P,len,hg,c)=>BOD.bq(...P,BOD.faceTex(Math.max(1,len*24),Math.max(1,hg),()=>c),kind);
    fr([pt(w.a0,w.H,-.1),pt(w.a1,w.H,-.1),pt(w.a1,w.H,.1),pt(w.a0,w.H,.1)],w.a1-w.a0,5,COPE);
    for(const h of w.holes){ for(const a of [h.a0,h.a1])fr([pt(a,h.z0,-.1),pt(a,h.z0,.1),pt(a,h.z1,.1),pt(a,h.z1,-.1)],.2,h.z1-h.z0,BOD.FRAME);
      fr([pt(h.a0,h.z1,-.1),pt(h.a1,h.z1,-.1),pt(h.a1,h.z1,.1),pt(h.a0,h.z1,.1)],h.a1-h.a0,5,BOD.FRAME); if(h.z0>0)fr([pt(h.a0,h.z0,-.1),pt(h.a1,h.z0,-.1),pt(h.a1,h.z0,.1),pt(h.a0,h.z0,.1)],h.a1-h.a0,5,BOD.FRAME);
      if(h.glass&&!h.door){ const m=new THREE.Mesh(new THREE.PlaneGeometry((h.a1-h.a0)*TILE,Y(h.z1)-Y(h.z0)),glassMat.clone()); m.material.clippingPlanes=[planes[w.id]];
        if(w.ax==='x')m.position.set(X((h.a0+h.a1)/2),Y((h.z0+h.z1)/2),Z(w.at)); else{ m.position.set(X(w.at),Y((h.z0+h.z1)/2),Z((h.a0+h.a1)/2)); m.rotation.y=Math.PI/2; } scene.add(m); } } };
  for(const w of BOD.WALLS)if(w.outer){ wallF(w,false); wallR(w); }
  const {cvNoise}=BOD.g, sh=BOD.K.sh, RW=B0.x1-B0.x0, RH=B0.y1-B0.y0, PATCH=[[1.2,2.5,3.6,4.4,0],[4.6,8.2,7.1,9.6,0],[2.1,10.6,3.4,11.5,1],[5.3,1.1,6.9,2.3,2],[.7,6.4,1.7,8.8,2],[5.9,5.2,6.6,5.9,0]], POND=[[3.2,6.3,1.2,.8],[6.2,12.1,.9,.6],[1.5,12.7,.7,.5],[4.5,3.4,.5,.4]];
  const roofCol=(x,y)=>{ const u=x-B0.x0, v=y-B0.y0, i=Math.floor(x*24), j=Math.floor(y*24), h1=hash(i,j,71), sN=Math.floor(v/1.45), sv=v-sN*1.45, wob=(cvNoise(u*3,sN,73)-.5)*.07;
    let c=sh([[50,50,52],[57,56,56],[45,45,48],[54,53,50]][Math.floor(hash(sN,1,75)*4)],.9+.2*grain(x,y,61,1.4));
    if(h1<.16)c=sh(c,1.38); else if(h1<.22)c=[c[0]*1.24,c[1]*1.14,c[2]]; else if(h1>.97)c=sh(c,.7);
    if(Math.abs(sv-.05-wob)<.03)c=sh(c,.6); else if(Math.abs(sv-.11-wob)<.03&&cvNoise(u*2,sN,77)>.45)c=sh(c,1.3);
    for(const [a,b,c2,d,k] of PATCH){ const e=.07*(cvNoise(u*4,v*4,79)-.5); if(u>a+e&&u<c2-e&&v>b+e&&v<d-e){ const ed=Math.min(u-a-e,c2-e-u,v-b-e,d-e-v); c=k===1?(h1<.3?[124,126,124]:h1<.55?[158,160,156]:[144,146,144]):k===2?[40,37,36]:[33,33,36]; if(k!==1&&h1<.08)c=sh(c,1.7); if(ed<.06)c=sh(c,k===1?.78:1.5); } }
    for(const [cu,cv,ru,rv] of POND){ const d=Math.hypot((u-cu)/ru,(v-cv)/rv)+cvNoise(u*1.6,v*1.6,81)*.7+cvNoise(u*5,v*5,82)*.25-.47; if(d<1.04){ if(d>.97&&cvNoise(u*6,v*6,84)>.35)c=sh([100,95,84],.9+.2*h1); else if(d<.97)c=sh(c,d<.6?.7:.8); } }
    { const dx=u-(RW*.5+1.4), dy=v-(RH*.55+.3); if(dx>-.2&&dx<1.6&&dy>-.1&&dy<.9){ const rr=cvNoise(u*3,v*3,89); if(rr>.45)c=sh(c,.7+.3*rr); } }
    const ed=Math.min(u,RW-u,v,RH-v); if(ed<.55){ if(hash(i>>1,j>>1,83)<.3*(1-ed/.55))c=hash(i,j,85)<.55?[60,78,44]:[96,78,52]; else c=sh(c,.86); }
    if(hash(i,j,87)<.003)c=[214,212,204]; if(hash(i>>2,j>>2,91)<.004)c=[150,120,70];
    return c; };
  const flat=(x0,y0,x1,y1,z,col,kind,S)=>{ if(x1-x0>80||y1-y0>80){ for(let a=x0;a<x1;a+=80)for(let b=y0;b<y1;b+=80)flat0(a,b,Math.min(x1,a+80),Math.min(y1,b+80),z,col,kind,S); return; } return flat0(x0,y0,x1,y1,z,col,kind,S); };
  const CSIG=new WeakMap(), csig=f=>{ let v=CSIG.get(f); if(v==null){ const t=String(f); let h=2166136261; for(let i=0;i<t.length;i++)h=Math.imul(h^t.charCodeAt(i),16777619); v=(h>>>0).toString(36)+t.length; CSIG.set(f,v); } return v; };
  const flat0=(x0,y0,x1,y1,z,col,kind,S)=>{ if(window.FLATLOG){ const k=kind+' '+String(col).slice(0,90); FLATLOG[k]=(FLATLOG[k]||0)+(x1-x0)*(y1-y0)*576; } const X=S?BOD.XS:BOD.X, Y=S?BOD.YS:BOD.Y, Z=S?BOD.ZS:BOD.Z; const fn=(i,j)=>BOD.C(col(x0+(i+.5)/24,y0+(j+.5)/24)), w=Math.max(1,Math.round((x1-x0)*24)), h=Math.max(1,Math.round((y1-y0)*24)), k=kind+'|'+(S?1:0)+'|'+x0+','+y0+','+x1+','+y1+','+z+'|'+csig(col); const im=PAINTC.get(k,w,h,fn); let tx; if(im)tx={map:{image:im},em:null}; else { tx=BOD.faceTex((x1-x0)*24,(y1-y0)*24,fn); if(!tx.em)PAINTC.put(k,tx.map.image); } return BOD.bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],tx,kind); };
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
  await PAINTC.ready;
  for(const g of BOD.grounds)if(g.id!=='shop')flat(g.x0,g.y0,g.x1,g.y1,g.z,g.col,'G',!g.bld);
  { const X=BOD.XS, Y=BOD.YS, Z=BOD.ZS; for(const k of BOD.kerbs){ const P=(a,z)=>k.ax==='y'?[X(k.at),Y(z),Z(a)]:[X(a),Y(z),Z(k.at)]; for(let a0=k.a0;a0<k.a1;a0+=80){ const a1=Math.min(k.a1,a0+80), H=k.z1-k.z0; BOD.bq(P(a0,k.z0),P(a1,k.z0),P(a1,k.z1),P(a0,k.z1),BOD.faceTex((a1-a0)*24,H,(i,j)=>BOD.kerbFaceAt(k,a0+(i+.5)/24,H-1-j,H)),'G'); } }
    for(const k of BOD.kerbArcs){ const H=k.z1-k.z0; let s=0; for(let i=0;i+1<k.P.length;i++){ const [x0,y0]=k.P[i], [x1,y1]=k.P[i+1], L=Math.hypot(x1-x0,y1-y0), s0=s; s+=L;
      BOD.bq([X(x0),Y(k.z0),Z(y0)],[X(x1),Y(k.z0),Z(y1)],[X(x1),Y(k.z1),Z(y1)],[X(x0),Y(k.z1),Z(y0)],BOD.faceTex(L*24,H,(ii,j)=>BOD.g.kerbFace(k.P[0][0]*7+s0+(ii+.5)/24,H-1-j,H)),'G'); } } }
  { const X=BOD.XS, Y=BOD.YS, Z=BOD.ZS, {RP,D,col}=BOD.ramps, RD=BOD.RD, H=-RD;
    for(const r of RP){ const P=(u,w,z)=>{ const q=r.ax==='x'?[u,r.e+r.dir*w]:[r.e+r.dir*w,u]; return [X(q[0]),Y(z),Z(q[1])]; }, W=r.u1-r.u0;
      const a=P(r.u0,0,RD), b=P(r.u1,0,RD), c=P(r.u1,D,0), d=P(r.u0,D,0), up=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])>0, tx=BOD.faceTex(W*24,D*24,(i,j)=>col((i+.5)/24,D-(j+.5)/24,W));
      if(up)BOD.bq(a,b,c,d,tx,'G'); else BOD.bq(b,a,d,c,tx,'G');
      for(const u of [r.u0,r.u1])BOD.bq(P(u,0,RD),P(u,D,0),P(u,D,0),P(u,0,0),BOD.faceTex(D*24,H,(i,j)=>BOD.g.kerbFace(u*7+i/24,H-1-j,H)),'G'); } }
  BOD.streetSigns();
  { const fw=BOD.WALLS.find(w=>w.id==='front'), dh=fw.holes.find(h=>h.door), a0=dh.a0, a1=dh.a1, yf=fw.at, AL=[156,158,156], d=Z(yf+1)>Z(yf)?1:-1;
    const gw=(x0,x1,z0,z1,c=AL,e=.06,o=0)=>BOD.gbox({x0,x1,y0:yf-e+o,y1:yf+e+o,z0,z1,c,fs:(nx,ny,P,Q,z,k)=>sh(c,k*(.92+.12*hash(Math.floor(P*48),Math.floor(z),301))),top:()=>c},'Wfront');
    gw(a0,a0+.07,0,94,AL,.1); gw(a1-.07,a1,0,94,AL,.1); gw(a0,a1,88,94,AL,.1); gw(a0+.07,a1-.07,78,81); gw(a0+.5,a0+.57,0,78); gw(a0+.07,a0+.5,0,8);
    for(const [x0,x1,z0,z1,c] of [[a0+.12,a0+.42,60,66,[200,40,36]],[a0+.12,a0+.42,63,64,[240,236,226]],[a0+.14,a0+.26,50,54,[40,80,170]],[a0+.28,a0+.4,50,54,[236,190,40]],[a0+.16,a0+.36,20,26,[236,232,220]]])gw(x0,x1,z0,z1,c,.006,.065*d);
    const win=fw.holes.filter(h=>h.glass&&!h.door); for(const [k,h] of win.entries()){ const L=h.a1-h.a0, st=k?[[.1,.5,20,27,[30,60,150]],[.55,.85,20,24,[200,40,36]],[L-.6,L-.25,20,30,[236,232,214]],[L-.55,L-.3,26,27,[60,60,60]]]:[[L-.45,L-.15,20,26,[60,140,70]],[L-.42,L-.18,22,23,[240,240,230]],[.2,.4,82,88,[236,232,220]]];
      for(const [u0,u1,z0,z1,c] of st)gw(h.a0+u0,h.a0+u1,z0,z1,c,.006,.105*d); gw(h.a0,h.a1,h.z0,h.z0+2,[96,98,98],.12); }
    const hx=a1-.07, lw=(a0+.57)-hx, U=v=>X(hx+v)-X(hx), Hh=v=>Y(v)-Y(0), cl=[planes.front], mat=new THREE.MeshLambertMaterial({clippingPlanes:cl}), BXS=[], bx=(u0,u1,z0,z1,dp,c)=>BXS.push([(U(u0)+U(u1))/2,(Hh(z0)+Hh(z1))/2,0,Math.abs(U(u1)-U(u0)),Hh(z1)-Hh(z0),dp,c]);
    bx(0,.07*Math.sign(lw),0,78,.05,0x9c9e9c); bx(lw-.07*Math.sign(lw),lw,0,78,.05,0x9c9e9c); bx(0,lw,72,78,.05,0x9c9e9c); bx(0,lw,0,12,.06,0xb4b6b4); bx(.1*Math.sign(lw),lw-.1*Math.sign(lw),38,41,.12,0x6e706e);
    for(const [u0,u1,z0,z1,c] of [[.15,.45,62,68,0xc8282a],[.17,.43,64.5,65.5,0xf0ece2],[.5,.62,52,55,0x2850a8],[.64,.76,52,55,0xe8b828],[.3,.55,45,47,0xf0ece2]])bx(u0*Math.sign(lw),u1*Math.sign(lw),z0,z1,.07,c);
    const lf=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,BXS.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), cc=new THREE.Color(); BXS.forEach(([x,y,z,a,b,c2,col],i)=>{ lf.setMatrixAt(i,m4.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(a,b,c2*TILE))); lf.setColorAt(i,cc.setHex(col)); });
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(U(lw))-.12*TILE,Hh(60)),glassMat.clone()); gl.material.clippingPlanes=cl; gl.position.set(U(lw)/2,Hh(42),0);
    const sl=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(X(a0+.5)-X(a0+.07)),Hh(70)),glassMat.clone()); sl.material.clippingPlanes=cl; sl.position.set((X(a0+.07)+X(a0+.5))/2,Hh(43),Z(yf)); scene.add(sl);
    const tr=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(X(a1-.07)-X(a0+.07)),Hh(7)),glassMat.clone()); tr.material.clippingPlanes=cl; tr.position.set((X(a0)+X(a1))/2,Hh(84.5),Z(yf)); scene.add(tr);
    const leaf=new THREE.Group(); leaf.add(lf,gl); leaf.position.set(X(hx),0,Z(yf)); lf.castShadow=true; scene.add(leaf);
    const cx=(X(a0)+X(a1))/2, cz=Z(yf), sg=-d*Math.sign(U(lw)); let ang=0;
    BODB.door={leaf,a:()=>ang}; BODB.tick=dt=>{ const near=Math.hypot(pos.x-cx,pos.z-cz)<1.5*TILE||((window.WALKERS&&WALKERS.list)||[]).some(W=>W.N&&W.N.st&&Math.hypot(W.N.st.x-cx,W.N.st.z-cz)<1.4*TILE);
      const to=near?1.35:0; ang+=(to-ang)*Math.min(1,dt*(near?5:2.2)); if(!near&&ang<.01)ang=0; leaf.rotation.y=sg*ang; }; }
  { const fw=BOD.WALLS.find(w=>w.id==='front'), dh=fw.holes.find(h=>h.door), ca=new THREE.Mesh(new THREE.PlaneGeometry(X(dh.a1)-X(dh.a0),Y(dh.z1)-Y(0)),new THREE.MeshBasicMaterial({color:0x07070a}));
    ca.position.set((X(dh.a0)+X(dh.a1))/2,Y(dh.z1)/2,Z(fw.at-.35)); ca.raycast=()=>{}; scene.add(ca); BODB.card=ca; }
  BOD.paintProps([...BOD.FRONT,...BOD.STREET,...BOD.ROOF,...(BOD.GHOSTST||[])]);
  const MK=(k,map,emap)=>{ const pl=k[0]==='W'||k[0]==='H'?planes[k.slice(1)]:null, cp=pl?{clippingPlanes:[pl]}:{};
    if(k==='B')return new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5,...cp});
    return new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.4}:{}),...cp}); };
  const NRM={front:[0,-1],back:[0,1],west:[1,0],east:[-1,0],office:[0,1]};
  const post=M=>{ for(const me of BATCH.all(M,'G'))me.castShadow=false;
    for(const U of BATCH.all(M,'U')){ const O=BOD.O, zs=Object.values(O).filter(p=>/fluorescent tube/.test(p.name||'')).flatMap(p=>p.boxes.map(b=>b.z0)); OVERHEAD.push({o:U,y:BOD.Y(Math.min(...zs))}); }
    for(const w of BOD.WALLS)for(const me of BATCH.all(M,'W'+w.id))cutWalls.push({pl:planes[w.id],nx:NRM[w.id][0],nz:NRM[w.id][1],foot:Y(8),me,when:inside}); };
  BATCH.cast=true; BATCH.build(MK); BATCH.cast=false; Object.assign(KINDS,BATCH.meshes); BATCH.meshes={}; post(KINDS);
  BODB.roof=BATCH.all(KINDS,'R');
  const goods=()=>{ const {GOOD,GLAY}=BOD, O=BOD.O, list=[];
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
    const tc=(pa,tri)=>pa.mat([0,1,2].map(i=>tri[i][0]).reduce((s,v)=>[s[0]+v[0]/3,s[1]+v[1]/3,s[2]+v[2]/3],[0,0,0]),tri[0][1])||[200,200,200];
    const emit=(it,pa,tri,c=tc(pa,tri))=>{ const cs=Math.cos(it.yaw), sn=Math.sin(it.yaw); col.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace);
      for(const [p,n] of tri){ const lx=p[0]+pa.c[0], ly=p[1]+pa.c[1], lz=p[2]+pa.c[2], gx=it.x+lx*cs-ly*sn, gy=it.y+lx*sn+ly*cs;
        P.push(X(gx),Y(it.z+lz*24),Z(gy)); N.push(n[0]*cs-n[1]*sn,n[2],n[0]*sn+n[1]*cs); Cc.push(col.r,col.g,col.b); } };
    const quad=(it,pa,a,b,c,d,n)=>{ emit(it,pa,[[a,n],[b,n],[c,n]]); emit(it,pa,[[a,n],[c,n],[d,n]]); };
    const same=C=>C.every(c=>c[0]===C[0][0]&&c[1]===C[0][1]&&c[2]===C[0][2]);
    const sheet=(it,pa,Q,n,A,B,Cq,D)=>{ const T=Q.flatMap(([a,b,c,d])=>[[[a,n],[b,n],[c,n]],[[a,n],[c,n],[d,n]]]), C=T.map(t=>tc(pa,t));
      if(same(C)){ emit(it,pa,[[A,n],[B,n],[Cq,n]],C[0]); emit(it,pa,[[A,n],[Cq,n],[D,n]],C[0]); } else T.forEach((t,k)=>emit(it,pa,t,C[k])); };
    const GL=BOD.goods=[]; for(const it of list){ const v0=P.length/3; for(const pa of it.g.parts){
      if(pa.t==='box'){ const [hx,hy,hz]=pa.h, NZ=6, NA=3;
        for(const [ax,s] of [[0,1],[0,-1],[1,1],[1,-1]]){ const n=ax?[0,s,0]:[s,0,0], ha=ax?hx:hy, pt=(u,z)=>ax?[u,s*hy,z]:[s*hx,u,z], Q=[];
          for(let i=0;i<NA;i++)for(let j=0;j<NZ;j++){ const u0=-ha+2*ha*i/NA, u1=-ha+2*ha*(i+1)/NA, z0=-hz+2*hz*j/NZ, z1=-hz+2*hz*(j+1)/NZ; Q.push([pt(u0,z0),pt(u1,z0),pt(u1,z1),pt(u0,z1)]); }
          sheet(it,pa,Q,n,pt(-ha,-hz),pt(ha,-hz),pt(ha,hz),pt(-ha,hz)); }
        for(const s of [1,-1])quad(it,pa,[-hx,-hy,s*hz],[hx,-hy,s*hz],[hx,hy,s*hz],[-hx,hy,s*hz],[0,0,s]); }
      else if(pa.t==='cyl'){ const r=pa.r, hh=pa.hh, NS=10, NZ=6;
        for(let i=0;i<NS;i++){ const a0=i/NS*2*Math.PI, a1=(i+1)/NS*2*Math.PI, am=(a0+a1)/2, n=[Math.cos(am),Math.sin(am),0];
          const pc=(a,z)=>[Math.cos(a)*r,Math.sin(a)*r,z], Q=[]; for(let j=0;j<NZ;j++){ const z0=-hh+2*hh*j/NZ, z1=-hh+2*hh*(j+1)/NZ; Q.push([pc(a0,z0),pc(a1,z0),pc(a1,z1),pc(a0,z1)]); } sheet(it,pa,Q,n,pc(a0,-hh),pc(a1,-hh),pc(a1,hh),pc(a0,hh));
          for(const s of [1,-1])emit(it,pa,[[[0,0,s*hh],[0,0,s]],[[Math.cos(a0)*r,Math.sin(a0)*r,s*hh],[0,0,s]],[[Math.cos(a1)*r,Math.sin(a1)*r,s*hh],[0,0,s]]]); } } }
      GL.push({k:it.k,m:it.g.m||.5,v0,v1:P.length/3}); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
    const me=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); me.receiveShadow=true; me.userData.goods=true; (MAPG.bodega||scene).add(me); BOD.goodsMesh=me; };
  const HALO=(c,W,H)=>{ const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d'), im=g.createImageData(W,H), B=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
    for(let j=0;j<H;j++)for(let i=0;i<W;i++){ const dx=(i+.5)/W*2-1, dy=(j+.5)/H*2-1, d=Math.hypot(dx,dy), t=(s0=>s0-Math.floor(s0))(Math.sin(i*12.9898+j*78.233)*43758.5453), s=d<.42+(t-.5)*.12?.5:d<.68+(t-.5)*.14?.26:d<.96+(t-.5)*.12?.1:0, q=(j*W+i)*4;
      im.data[q]=c[0]; im.data[q+1]=c[1]; im.data[q+2]=c[2]; im.data[q+3]=Math.round(s*255); }
    g.putImageData(im,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  for(const N of NEONS){ const n=N.cells.length/4, k=1/24, geo=new THREE.BoxGeometry(2*k*TILE,Y(2)-Y(0),2*k*TILE*.8), me=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:new THREE.Color(N.c[0]/255*1.1,N.c[1]/255*1.1,N.c[2]/255*1.1)}),n), m4=new THREE.Matrix4(); let i=0;
    for(const [a,b] of N.cells){ if(a%2||b%2)continue; m4.makeTranslation(X(N.x-N.W*k/2+(a+1)*k),Y(N.z+7-(b+1)),Z(N.y-.08)); me.setMatrixAt(i++,m4); }
    me.count=i; N.me=me; me.castShadow=false; me.receiveShadow=false; scene.add(me);
    { const w=N.W*k*TILE*2, h=(Y(14)-Y(0))*2.6, m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:HALO(N.c,Math.round(N.W*k*24*2/1.2),Math.round(14*2.6/1.2)),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
      const at=new THREE.Vector3(X(N.x),Y(N.z),Z(N.y-.08)), f=new THREE.Vector3(); m.position.copy(at); m.renderOrder=2;
      m.onBeforeRender=(r,s,c)=>{ m.quaternion.copy(c.quaternion); c.getWorldDirection(f); m.position.copy(at).addScaledVector(f,-.3); m.updateMatrixWorld(); }; scene.add(m); N.halo=m; } }
  const inB=l=>l.x>B0.x0&&l.x<B0.x1&&l.y>B0.y0&&l.y<B0.y1;
  const lampsOf=inn=>{ for(const l of BOD.LAMPS){ const cm=Math.max(...l.c); if(!(cm>0)||inB(l)!==inn)continue; const L=new THREE.PointLight(new THREE.Color(l.c[0]/cm,l.c[1]/cm,l.c[2]/cm),7*cm*Math.min(1.2,l.r/5),l.r*TILE*1.25,1.6);
    L.position.set(X(l.x),Y(l.z),Z(l.y)); L.userData.i0=L.intensity; L.userData.both=!!l.neon; lamps.push(L); if(inn&&LITE.recs.length){ L.userData.grp=MAPG.bodega||null; LITE.recs.push(L); } else scene.add(L); } };
  lampsOf(false);
  BODB.build=()=>{ if(BODB.built)return; BODB.built=1; const keep=BATCH.items.splice(0), m0=BATCH.meshes; BATCH.meshes={};
    for(const w of BOD.WALLS){ wallF(w,true); if(!w.outer)wallR(w); }
    const g=BOD.grounds.find(q=>q.id==='shop'); if(g)flat(g.x0,g.y0,g.x1,g.y1,g.z,g.col,'G',!g.bld);
    BOD.paintProps(Object.values(BOD.O));
    BATCH.cast=true; BATCH.build(MK); BATCH.cast=false; const M=BATCH.meshes||{}; BATCH.meshes=m0; BATCH.items=keep;
    for(const k in M)(MAPG.bodega||scene).add(M[k]); post(M); goods(); lampsOf(true);
    if(window.ROOMS&&ROOMS.lazy.bodega)ROOMS.lazy.bodega.done=true; if(window.ROOMS)ROOMS.reset(); if(window.CLIP)CLIP.run(); };
}
