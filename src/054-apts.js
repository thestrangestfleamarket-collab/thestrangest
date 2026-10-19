const APTS={};
{ const {X,Z,faceTex,bq,C,facade,FRAME,place}=BOD,
  RZ=APTS.RZ=28, Y=z=>BOD.Y(z+RZ), gbox=(b,k)=>BOD.gbox({...b,z0:b.z0+RZ,z1:b.z1+RZ},k), R0=APTS.R0=BOD.Y(RZ)-BOD.Y(0), {speck,hash}=BOD.g, {MKS,CATALOG,PROPS,STUDIO,LSEED,STORY,sh}=BOD.K, S=STORY, ST=5, AH=ST*S, W=LSEED.walk, T=.1;
  const A=(o=>({x0:50.4+o.x/BLDK,x1:57.9+o.x/BLDK,y0:W-14+o.y/BLDK,y1:W+o.y/BLDK}))(LAY.o('house')), m=(A.x0+A.x1)/2, H={y0:A.y0+5.6,y1:A.y0+8.4}, hm=(H.y0+H.y1)/2, DW=.78, DH=94;
  const HOLLOW=false;
  const LOBBY=true, CORE={st:[0,0,2.55,4.15],el:[5,0,7.5,2.55]};
  APTS.A=A; APTS.H=H; const TEX={}; for(const k in TEXTURES)TEX[k]={w:TEXTURES[k].w,h:TEXTURES[k].h,c:Uint8Array.from(atob(TEXTURES[k].c),c=>c.charCodeAt(0))};
  const tex=(nm,i,j)=>{ const t=TEX[nm], k=(((j%t.h)+t.h)%t.h)*t.w+(((i%t.w)+t.w)%t.w), c=t.c; return [c[k*3],c[k*3+1],c[k*3+2]]; };
  const STONE=[176,168,152], brick=(u,z,f,cap,holes)=>{ if(z>=cap-20)return facade(0,1,u,0,z,f,cap);
    if(z<10)return sh(speck(tex('concrete',Math.floor(u*24),Math.floor(z)),u,z/24,95),f*(z<1?.8:1));
    const s=z%S; if(z>S-4&&(s<4||s>=S-2)){ const t=sh(STONE,f); return s>=S-2?sh(t,.6):s===3?sh(t,1.12):s===0?sh(t,.8):t; }
    for(const h of holes){ if(u>h.a0-.14&&u<h.a1+.14){ if(z>=h.z1&&z<h.z1+5)return sh(STONE,f*(z===h.z1+4?1.1:.95)); if(z<h.z0&&z>=h.z0-4)return sh(STONE,f*(z===h.z0-1?1.1:.9)); } }
    return sh(tex('brick',Math.floor(u*24),Math.floor(z)),f*(.96+.08*hash(Math.floor(u*24/9),Math.floor(z/5),11))); };
  const LS=[150,144,132], GL=[255,214,150], BAR=[30,28,26];
  const glass=(dx,dz,hw,hh,lit,seed)=>{
    const tr=hh*.68, ax=Math.abs(dx); if(ax>hw-1.5||dz<1.5||dz>hh-1.5||ax<1||Math.abs(dz-tr)<1.2||(dz>tr&&Math.abs(ax-hw/2)<.8))return BAR;
    if(lit){ const n=hash(Math.floor(dx+40),Math.floor(dz/3),seed); return [GL[0],GL[1]*(.94+.06*n),GL[2]*(.9+.12*n),1]; } return (Math.floor(dx)+Math.floor(dz))%7===0?[54,60,70]:[34,38,46]; };
  const fan=(dx,dz,r,lit,seed)=>{
    const d=Math.hypot(dx,dz), a=Math.atan2(dz,dx); if(d>r-1.5||dz<1.2||Math.abs(d-r*.45)<.9||Math.abs(Math.sin(a*3))<.12*12/Math.max(d,1))return BAR;
    return lit?[GL[0],GL[1],GL[2]*.95,1]:[38,42,50]; };
  const stone=(u,z,f,cap,holes,a0,a1)=>{
    const ui=u*24, tone=(i,k)=>.94+.1*hash(i,k,19);
    if(z>=cap-30){ const zz=z-(cap-30); return sh(LS,f*(zz<10?(zz>=9?1.1:.92):zz<16?((Math.floor(ui/3)&1)?.55:1.04):zz>=29?1.14:zz<18?.62:.98)); }
    for(const h of holes){ const cx=(h.a0+h.a1)/2, dx=(u-cx)*24, hw=(h.a1-h.a0)*12, ax=Math.abs(dx), lv=Math.floor(h.z0/S);
      if(h.blind&&ax<hw&&z>=h.z0&&z<h.z1)return glass(dx,z-h.z0,hw,h.z1-h.z0,h.lit,h.seed);
      if(h.door){ const r=hw, dz=z-h.z1; if(dz>=0&&ax<r+6&&dz<r+7){ const d=Math.hypot(dx,dz); if(d<r)return fan(dx,dz,r,true,7); if(d<r+6){ const sg=Math.atan2(dz,dx)/(Math.PI/9); return ax<3&&d<r+7?sh(LS,f*1.1):sh(LS,f*(sg-Math.floor(sg)<.12?.6:1.02)); } }
        if(ax>=hw&&ax<hw+5&&z<h.z1)return sh(LS,f*(ax<hw+1?.6:Math.floor(z/13)%2?1.04:.96)); continue; }
      const arch=lv===1&&!h.blind, dz=z-h.z1;
      if(arch&&dz>=0&&ax<hw+7&&dz<hw+8){ const d=Math.hypot(dx,dz); if(d<hw)return fan(dx,dz,hw,h.lit,h.seed); if(d<hw+6){ if(ax<3)return sh(LS,f*(d>hw+5?.7:1.12)); const sg=Math.atan2(dz,dx)/(Math.PI/7); return sh(LS,f*(sg-Math.floor(sg)<.14?.62:d>hw+5?.75:1.02)); } }
      if(ax<hw+4&&z>=h.z0-5&&z<h.z1+(arch?0:3)&&!(ax<hw&&z>=h.z0&&z<h.z1)){ if(z<h.z0)return sh(LS,f*(z===h.z0-1?1.16:z<h.z0-3?.6:.95)); return sh(LS,f*(ax<hw+1?.55:ax>hw+3?.8:1.08)); }
      if(!arch&&lv>=2&&ax<hw+7&&dz>=3&&dz<10)return sh(LS,f*(dz===9?1.16:dz<5?.55:1));
      if(!arch&&lv===0&&ax<hw+4&&dz>=0&&dz<9){ if(ax<3)return sh(LS,f*1.1); const sl=(dx*(1+dz/(hw*1.5)))/5; return sh(LS,f*(sl-Math.floor(sl)<.2?.62:1)); }
      if(ax<hw&&z<h.z0-5&&z>h.z0-50&&hash(Math.floor(ui/2),7,h.seed|0)<.5)f*=.93; }
    const dq=Math.min(u-a0,a1-u), q=Math.floor(z/22);
    if(z>=S-8&&z<S)return sh(LS,f*(z===S-1?1.15:z===S-8?.6:1.02));
    if(dq<((q&1)?.36:.56)){ const qz=z%22; return sh(LS,f*1.06*(qz<2?.58:qz===21?1.12:Math.abs(dq-((q&1)?.36:.56))<.05?.62:tone(q,dq<.2?1:2))); }
    if(z<S-8){ const c=Math.floor(z/13), zz=z%13, p=ui+(c&1)*15; if(zz<2)return sh(LS,f*.5); return sh(LS,f*(zz===12?1.12:p%30<1?.68:tone(Math.floor(p/30),c)*(z<10?.86:1))); }
    const s=z%S; if(s>=S-6||s<1)return sh(LS,f*(s===S-6?.66:s===0?1.14:1));
    const c=Math.floor(z/11), p=ui+(c&1)*13; if(z%11===0||p%26<1)return sh(LS,f*.84); return sh(LS,f*tone(Math.floor(p/26),c)); };
  const BLC={}, blinds=(a0,a1,seed)=>{ const o=[]; for(let lv=1;lv<ST;lv++)for(const k of [.22,.5,.78]){ const c=a0+(a1-a0)*k; o.push({a0:c-.55,a1:c+.55,z0:lv*S+42,z1:lv*S+94,blind:true,seed:seed+lv*7+k*10|0,lit:hash(seed,lv,k*10|0)<.4}); } return o; };
  const plaster=(u,z,f,tiled)=>{ if(z<6)return sh([96,70,48],f*(z<1?.7:z>4?1.15:1)); if(z>S-10)return sh([200,196,186],f*.9);
    if(tiled&&z<60){ const i=Math.floor(u*24/9), k=Math.floor((z-6)/9), g=(u*24/9-i)<.12||((z-6)/9-k)<.12; return sh(g?[190,188,180]:(i+k)&1?[236,234,226]:[228,226,216],f); }
    const n=hash(Math.floor(u*24),Math.floor(z),33); return sh(n<.04?[206,200,186]:n>.97?[224,218,206]:[214,208,196],f); };
  const HP=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6), LP=new THREE.Plane(new THREE.Vector3(0,1,0),1e6); APTS.HP=HP; APTS.LP=LP; const WALLM=[];
  const pt=(w,s,a,z)=>w.ax==='x'?[X(a),Y(z),Z(w.at+s*T)]:[X(w.at+s*T),Y(z),Z(a)];
  const wallMesh=(a,b,c,d,tx,planes)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3)); g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2)); g.computeVertexNormals();
    const mk=cv=>{ const t=new THREE.CanvasTexture(cv); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestMipmapNearestFilter; t.generateMipmaps=true; t.colorSpace=THREE.SRGBColorSpace; return t; };
    const mat=new THREE.MeshLambertMaterial({map:mk(tx.map.image),alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:planes,...(tx.em?{emissiveMap:mk(tx.em.image),emissive:0xffffff,emissiveIntensity:1.2}:{})});
    const me=new THREE.Mesh(g,mat); me.receiveShadow=true; me.castShadow=true; scene.add(me); WALLM.push(me); return me; };
  function wall(w){ const as=new Set([w.a0,w.a1]), zs=new Set([w.z0,w.z1]); for(const h of w.holes){ as.add(Math.max(w.a0,h.a0)); as.add(Math.min(w.a1,h.a1)); zs.add(h.z0); zs.add(h.z1); }
    const Aa=[...as].sort((p,q)=>p-q), Zs=[...zs].sort((p,q)=>p-q), pl=w.cut?new THREE.Plane(new THREE.Vector3(0,-1,0),1e6):null, planes=pl?[pl,HP,LP]:[HP,LP];
    if(w.cut)for(const s of [-1,1]){ const W_=(w.a1-w.a0)*24, tx=faceTex(W_,w.z1-w.z0,(ii,jj)=>{ const u=w.a0+(ii+.5)/24, z=w.z1-jj-.5; for(const h of w.holes)if(u>h.a0&&u<h.a1&&z>h.z0&&z<h.z1)return null; return C(w.paint(s,u,z)); });
      wallMesh(pt(w,s,w.a0,w.z0),pt(w,s,w.a1,w.z0),pt(w,s,w.a1,w.z1),pt(w,s,w.a0,w.z1),tx,planes); }
    else for(const s of [-1,1])for(let i=0;i+1<Aa.length;i++)for(let j=0;j+1<Zs.length;j++){ const a0=Aa[i], a1=Aa[i+1], z0=Zs[j], z1=Zs[j+1];
      if(w.holes.some(h=>(a0+a1)/2>h.a0&&(a0+a1)/2<h.a1&&(z0+z1)/2>h.z0&&(z0+z1)/2<h.z1))continue;
      const tx=faceTex((a1-a0)*24,z1-z0,(ii,jj)=>C(w.paint(s,a0+(ii+.5)/24,z1-jj-.5)));
      if(w.cut)wallMesh(pt(w,s,a0,z0),pt(w,s,a1,z0),pt(w,s,a1,z1),pt(w,s,a0,z1),tx,planes); else bq(pt(w,s,a0,z0),pt(w,s,a1,z0),pt(w,s,a1,z1),pt(w,s,a0,z1),tx,'A'); }
    const fr=(P,len,hg,c)=>bq(...P,faceTex(Math.max(1,len*24),Math.max(1,hg),()=>c),'A'), e=(a,z,o)=>w.ax==='x'?[X(a),Y(z),Z(w.at+o)]:[X(w.at+o),Y(z),Z(a)];
    fr([e(w.a0,w.z1,-T),e(w.a1,w.z1,-T),e(w.a1,w.z1,T),e(w.a0,w.z1,T)],w.a1-w.a0,5,w.cut?LS:[200,196,186]);
    for(const h of w.holes){ for(const a of [h.a0,h.a1])fr([e(a,h.z0,-T),e(a,h.z0,T),e(a,h.z1,T),e(a,h.z1,-T)],.2,h.z1-h.z0,h.door?[88,62,44]:w.rev||FRAME);
      fr([e(h.a0,h.z1,-T),e(h.a1,h.z1,-T),e(h.a1,h.z1,T),e(h.a0,h.z1,T)],h.a1-h.a0,5,h.door?[88,62,44]:w.rev||FRAME); if(h.z0>0)fr([e(h.a0,h.z0,-T),e(h.a1,h.z0,-T),e(h.a1,h.z0,T),e(h.a0,h.z0,T)],h.a1-h.a0,5,w.rev||FRAME); }
    if(pl){ const o={pl,foot:Y(w.foot||8),when:()=>APTS.in};
      if(w.inner){ const at=w.ax==='x'?Z(w.at):X(w.at); if(w.ax==='x'){ o.nx=0; Object.defineProperty(o,'nz',{get:()=>Math.sign(pos.z-at)||1}); } else { o.nz=0; Object.defineProperty(o,'nx',{get:()=>Math.sign(pos.x-at)||1}); } } else { o.nx=w.nx; o.nz=w.nz; }
      cutWalls.push(o); } w.pl=pl; return w; }
  const pane=(w,h,lit,seed)=>{ const cur=hash(seed,2,7)<.5, cc=[[220,200,170],[180,120,110],[150,170,200],[230,230,220]][seed%4], hw=(h.a1-h.a0)*12, hh=h.z1-h.z0;
    bq(pt(w,0,h.a0,h.z0),pt(w,0,h.a1,h.z0),pt(w,0,h.a1,h.z1),pt(w,0,h.a0,h.z1),faceTex(hw*2,hh,(i,j)=>{ const dx=i+.5-hw, g=glass(dx,hh-j-.5,hw,hh,lit,seed);
      if(g===BAR)return g; const u=(i+.5)/(hw*2); if(cur&&(u<.2||u>.8))return lit?[cc[0]*.8,cc[1]*.8,cc[2]*.8,1]:sh(cc,.35); return g; }),'A'); };
  const steel=[52,54,58], ESC=[];
  const escape=(y,out,z,x0,x1,ladder)=>{ const d=.75, Y0=out>0?y:y-d, Y1=out>0?y+d:y, B=(a,b,c,dd,z0,z1,col)=>gbox({x0:a,y0:c,x1:b,y1:dd,z0,z1,c:col,foot:0,top:(u,v)=>(Math.floor(u*8)&1)?sh(col,.8):col},'A');
    B(x0,x1,Y0,Y1,z,z+3,steel); for(const [a,b] of [[x0,x0+.04],[x1-.04,x1]])B(a,b,Y0,Y1,z+3,z+32,steel);
    const Yo=out>0?[Y1-.04,Y1]:[Y0,Y0+.04]; B(x0,x1,Yo[0],Yo[1],z+30,z+33,steel); for(let u=x0+.2;u<x1-.1;u+=.22)B(u,u+.03,Yo[0],Yo[1],z+3,z+30,steel);
    if(ladder){ const lx=x1-.5, Yl=out>0?[Y1-.14,Y1-.1]:[Y0+.1,Y0+.14]; B(lx,lx+.04,Yl[0],Yl[1],z-ladder,z+2,steel); B(lx+.36,lx+.4,Yl[0],Yl[1],z-ladder,z+2,steel); for(let k=z-ladder+6;k<z;k+=9)B(lx,lx+.4,Yl[0],Yl[1],k,k+2,steel); }
    ESC.push([x0,x1,Y0,Y1,z]); };
  const WIN=(z)=>[A.x0+1.5,m,A.x1-1.5].map(x=>({a0:x-.55,a1:x+.55,z0:z+42,z1:z+94})), holesF=[], holesB=[];
  const door={a0:A.x1-1.0-DW,a1:A.x1-1.0+DW,z0:0,z1:DH,door:true};
  holesF.push(door,...[A.x0+1.5,m].map(x=>({a0:x-.55,a1:x+.55,z0:42,z1:94}))); for(let lv=1;lv<ST;lv++)holesF.push(...WIN(lv*S)); for(let lv=0;lv<ST;lv++)holesB.push(...WIN(lv*S));
  const moss=(u,z,f)=>{ if(z<6)return sh([110,92,58],f*(z<1?.7:z>4?1.15:1)); if(z>S-6)return sh([162,138,90],f*(z>S-2?.8:1)); const n=hash(Math.floor(u*24/3),Math.floor(z/3),37), m2=hash(Math.floor(u*24),Math.floor(z),38); return sh(n<.3?[67,77,36]:n>.8?[102,112,58]:[85,96,47],f*(m2<.05?.9:1)); };
  const outer=(id,ax,at,a0,a1,holes,inS,nx,nz)=>wall({id,ax,at,a0,a1,z0:0,z1:AH,holes,cut:true,nx,nz,rev:[120,115,106],paint:(s,u,z)=>s===inS?(HOLLOW&&z<S?moss(u,z,ax==='x'?.84:.68):plaster(u,z%S,ax==='x'?.84:.68,false)):stone(u,z,ax==='x'?1:.8,AH,ax==='x'?holes:(BLC[at]||(BLC[at]=blinds(a0+.3,a1-.3,Math.round(at*10)))),a0+(ax==='y'?T:0),a1-(ax==='y'?T:0))});
  { let seed=3; for(const h of [...holesF,...holesB])if(!h.door){ h.lit=hash(seed++,1,9)<.55; h.seed=seed; } }
  outer('front','x',A.y1,A.x0,A.x1,holesF,-1,0,-1); outer('back','x',A.y0,A.x0,A.x1,holesB,1,0,1); outer('west','y',A.x0,A.y0-T,A.y1+T,[],1,1,0); outer('east','y',A.x1,A.y0-T,A.y1+T,[],-1,-1,0);
  for(const h of holesF)if(!h.door)pane({ax:'x',at:A.y1},h,h.lit,h.seed); for(const h of holesB)pane({ax:'x',at:A.y0},h,h.lit,h.seed);
  for(let lv=1;lv<ST;lv++)escape(A.y0,-1,lv*S+38,A.x0+.9,A.x1-.9,lv===1?70:S-36);
  { const L=LS, ST2=[134,128,118], g=b=>gbox({...b,c:b.c||L},'A'), xa=A.x0, xb=A.x1, yf=A.y1, yb=A.y0;
    g({x0:xa-.1,x1:xb+.1,y0:yf,y1:yf+.1,z0:S-8,z1:S}); g({x0:xa-.1,x1:xa,y0:yb,y1:yf,z0:S-8,z1:S}); g({x0:xb,x1:xb+.1,y0:yb,y1:yf,z0:S-8,z1:S});
    const z=S+22; g({x0:xa+.08,x1:xb-.08,y0:yf,y1:yf+.42,z0:z,z1:z+6});
    for(let x=xa+.4;x<xb-.3;x+=1.2)g({x0:x-.07,x1:x+.07,y0:yf,y1:yf+.32,z0:z-12,z1:z,c:ST2});
    const peds=[xa+.25,(xa+1.5+m)/2,(m+xb-1.5)/2,xb-.25]; for(const x of peds)g({x0:x-.15,x1:x+.15,y0:yf+.04,y1:yf+.38,z0:z+6,z1:z+34});
    for(let i=0;i+1<peds.length;i++){ const p0=peds[i]+.15, p1=peds[i+1]-.15, n=Math.max(1,Math.round((p1-p0)/.2)); g({x0:p0,x1:p1,y0:yf+.1,y1:yf+.32,z0:z+6,z1:z+9,c:ST2});
      for(let k=0;k<n;k++){ const x=p0+(k+.5)*(p1-p0)/n; g({x0:x-.035,x1:x+.035,y0:yf+.17,y1:yf+.25,z0:z+9,z1:z+30,c:ST2}); g({x0:x-.055,x1:x+.055,y0:yf+.15,y1:yf+.27,z0:z+13,z1:z+21,c:ST2}); }
      g({x0:p0,x1:p1,y0:yf+.08,y1:yf+.34,z0:z+30,z1:z+35}); }
    const zc=AH-14; g({x0:xa-.4,x1:xb+.4,y0:yf,y1:yf+.4,z0:zc,z1:AH}); g({x0:xa-.4,x1:xb+.4,y0:yb-.4,y1:yb,z0:zc,z1:AH}); g({x0:xa-.4,x1:xa,y0:yb,y1:yf,z0:zc,z1:AH}); g({x0:xb,x1:xb+.4,y0:yb,y1:yf,z0:zc,z1:AH});
    for(let x=xa-.2;x<=xb+.2;x+=.45)g({x0:x-.05,x1:x+.05,y0:yf,y1:yf+.3,z0:zc-7,z1:zc,c:ST2});
    for(let y=yb+.2;y<=yf;y+=.45)for(const [x0,x1] of [[xa-.3,xa],[xb,xb+.3]])g({x0,x1,y0:y-.05,y1:y+.05,z0:zc-7,z1:zc,c:ST2}); }
  const boards=(x,y)=>{ const i=Math.floor(y*8), j=Math.floor(x*.7+i*.37), n=hash(j,i,41); return sh([150,112,76],.86+.22*n+(y*8-i<.08?-.2:0)); };
  const lino=(x,y)=>{ const n=hash(Math.floor(x*12),Math.floor(y*12),43); return n<.1?[96,100,96]:[112,116,110]; };
  const tiles=(x,y)=>{ const i=Math.floor(x*3), j=Math.floor(y*3); return (x*3-i<.06||y*3-j<.06)?[150,150,146]:(i+j)&1?[212,210,200]:[196,194,186]; };
  const roofCol=(x,y)=>{ const n=hash(Math.floor(x*6),Math.floor(y*6),61); return n<.3?[50,50,52]:n>.7?[66,64,62]:[58,57,57]; };
  const flat=(x0,y0,x1,y1,z,col,up=true)=>bq(...(up?[[X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)]]:[[X(x0),Y(z),Z(y0)],[X(x1),Y(z),Z(y0)],[X(x1),Y(z),Z(y1)],[X(x0),Y(z),Z(y1)]]),faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y1-(j+.5)/24))),'A');
  const rooms=lv=>{ const x0=A.x0, x1=A.x1, yl=A.y1-3, bx1=lv===0?A.x1-1.5:A.x1; return {liv:{x0,x1:bx1,y0:yl,y1:A.y1},kit:{x0,x1:x0+3.2,y0:H.y1,y1:yl},bath:{x0:x0+3.2,x1:x0+4.6,y0:H.y1,y1:yl},bed:{x0:x0+4.6,x1:bx1,y0:H.y1,y1:yl},pass:lv===0?{x0:bx1,x1,y0:H.y1,y1:A.y1}:null}; };
  const STX=[A.x0+.5,A.x1-.5], STY=[H.y0+.1,H.y0+1.3];
  APTS.floors=HOLLOW?1:ST;
  const SOLS=[]; APTS.sol=SOLS; for(let lv=0;lv<ST;lv++)SOLS[lv]=[];
  const FLATS=[]; APTS.flats=FLATS;
  if(LOBBY){ const U=u=>A.x0+u, V=v=>A.y0+v, sol=(lv,u0,v0,u1,v1)=>{ const b=[X(U(u0)),Z(V(v0)),X(U(u1)),Z(V(v1))]; SOLS[lv].push([Math.min(b[0],b[2]),Math.min(b[1],b[3]),Math.max(b[0],b[2]),Math.max(b[1],b[3])]); return SOLS[lv][SOLS[lv].length-1]; };
    APTS.U=U; APTS.V=V; APTS.lsol=sol;
    const check=(x,y)=>{ const i=Math.floor((x-A.x0)*2), j=Math.floor((y-A.y0)*2), e=((x-A.x0)*2-i)<.07||((y-A.y0)*2-j)<.07; return e?[120,118,112]:(i+j)&1?[30,30,32]:[226,224,216]; };
    const carpet=(x,y)=>{ const u=x-A.x0, n=hash(Math.floor(x*12),Math.floor(y*12),71), run=u>2.95&&u<4.55, edge=Math.abs(u-2.95)<.06||Math.abs(u-4.55)<.06; return edge?[176,140,70]:run?(n<.2?[110,30,36]:[128,36,42]):(n<.2?[92,90,88]:[104,102,98]); };
    const conc=(x,y)=>{ const n=hash(Math.floor(x*10),Math.floor(y*10),73); return n<.2?[118,118,114]:[132,132,128]; };
    const slab=(lv,col)=>{ const z=lv?lv*S:1; if(!lv){ flat(A.x0,A.y0,A.x1,A.y1,z,col); return; }
      flat(U(0),V(4.15),U(7.5),V(14),z,col); flat(U(2.55),V(0),U(5),V(4.15),z,conc); flat(U(5),V(2.55),U(7.5),V(4.15),z,conc); };
    const ceil=lv=>{ const z=lv*S+S-4, c=()=>[228,226,220]; if(lv===ST-1)return; flat(U(0),V(4.15),U(7.5),V(14),z,c,false); flat(U(2.55),V(0),U(5),V(4.15),z,c,false); flat(U(5),V(2.55),U(7.5),V(4.15),z,c,false); };
    const fdoor=(u,z,dd)=>{ for(const d of dd){ if(u>d.a0&&u<d.a1&&z<DH){ const fr=u-d.a0<.08||d.a1-u<.08||z>DH-5; if(fr)return [70,52,38]; if(Math.abs(u-(d.a1-.18))<.05&&Math.abs(z-46)<3)return [200,170,90];
        if(d.n&&Math.abs(u-(d.a0+d.a1)/2)<.16&&Math.abs(z-74)<5)return (Math.floor((u-d.a0)*24)+Math.floor(z))%3===0?[220,200,120]:[96,70,50]; return [110,78,52]; } } return null; };
    const iw=(lv,id,ax,at,a0,a1,holes,dd,nx,nz,look)=>{ const z=lv*S; return wall({id:id+lv,ax,at,a0,a1,z0:z,z1:z+S-4,holes:holes.map(h=>({...h,z0:z,z1:z+DH,door:true})),cut:true,inner:true,nx,nz,foot:z+8,
      paint:(sd,u,zz)=>{ const d=fdoor(u,zz-z,dd); return d?sh(d,ax==='x'?.84:.68):look?look(u,zz-z,ax==='x'?.84:.68,sd):plaster(u,zz-z,ax==='x'?.84:.68,false); }}); };
    const wsol=(lv,ax,at,a0,a1,holes)=>{ let a=a0; for(const h of [...holes].sort((p,q)=>p.a0-q.a0)){ if(h.a0>a)(ax==='x'?sol(lv,a-A.x0,at-A.y0-T,h.a0-A.x0,at-A.y0+T):sol(lv,at-A.x0-T,a-A.y0,at-A.x0+T,h.a0-A.y0)); a=h.a1; } if(a1>a)(ax==='x'?sol(lv,a-A.x0,at-A.y0-T,a1-A.x0,at-A.y0+T):sol(lv,at-A.x0-T,a-A.y0,at-A.x0+T,a1-A.y0)); };
    const wainscot=(u,z,f)=>z<6?sh([60,44,34],f):z<40?sh((Math.floor(u*24/6)&1)?[118,84,56]:[126,90,60],f*(z>37?1.15:1)):plaster(u,z,f,false);
    for(let lv=0;lv<ST;lv++){ const z=lv*S;
      slab(lv,lv===0?check:lv===1?boards:carpet); ceil(lv);
      if(lv<ST-1){ const N=10, L=2.8, h=S/2, step=c=>(x,y)=>c;
        for(let i=0;i<N;i++){ gbox({x0:U(.15),x1:U(1.25),y0:V(4.15-(i+1)*L/N),y1:V(4.15-i*L/N),z0:z,z1:z+(i+1)*h/N,c:[150,146,138]},'A');
          gbox({x0:U(1.45),x1:U(2.55),y0:V(1.35+i*L/N),y1:V(1.35+(i+1)*L/N),z0:z+h-8+i*h/N,z1:z+h+(i+1)*h/N,c:[150,146,138]},'A'); }
        gbox({x0:U(.15),x1:U(2.55),y0:V(.15),y1:V(1.35),z0:z+h-8,z1:z+h,c:[140,136,128]},'A');
        gbox({x0:U(1.25),x1:U(1.45),y0:V(1.35),y1:V(4.15),z0:z,z1:z+h+44,c:[96,70,52]},'A'); }
      gbox({x0:U(2.55),x1:U(2.61),y0:V(.15),y1:V(4.15),z0:z,z1:z+40,c:[60,50,44]},'A');
      sol(lv,1.25,1.35,1.45,4.15); sol(lv,2.53,.15,2.63,4.1); if(lv===ST-1)sol(lv,.15,4.1,1.3,4.25);
      iw(lv,'shaftW','y',U(5),V(0),V(2.55),[],[],1,0,(u,zz,f)=>sh([92,96,102],f)); wsol(lv,'y',U(5),V(0),V(2.55),[]);
      iw(lv,'shaftF','x',V(2.55),U(5),U(7.5),[{a0:U(5.3),a1:U(7.2)}],[],0,1,(u,zz,f)=>zz<DH+10&&u>U(5.2)&&u<U(7.3)?sh([150,152,156],f):sh([92,96,102],f)); wsol(lv,'x',V(2.55),U(5),U(7.5),[{a0:U(5.3),a1:U(7.2)}]);
      if(lv===0){
        iw(0,'gL','y',U(2.65),V(5.3),V(8),[],[{a0:V(6),a1:V(7.2),n:1}],1,0); wsol(0,'y',U(2.65),V(5.3),V(8),[]);
        iw(0,'gLf','x',V(8),U(0),U(2.65),[],[{a0:U(.7),a1:U(1.9),n:1}],0,1); wsol(0,'x',V(8),U(0),U(2.65),[]);
        iw(0,'gLb','x',V(5.3),U(0),U(2.65),[],[],0,-1); wsol(0,'x',V(5.3),U(1.3),U(2.65),[]);
        iw(0,'gR','y',U(4.85),V(3.7),V(8),[],[{a0:V(4.6),a1:V(5.8),n:1}],-1,0); wsol(0,'y',U(4.85),V(3.7),V(8),[]);
        iw(0,'gRf','x',V(8),U(4.85),U(7.5),[],[],0,1); wsol(0,'x',V(8),U(4.85),U(7.5),[]);
        iw(0,'gRb','x',V(3.7),U(4.85),U(7.5),[],[],0,-1); wsol(0,'x',V(3.7),U(4.85),U(7.5),[]); }
      else if(lv===1){
        iw(1,'cot','x',V(5.3),U(0),U(7.5),[{a0:U(3.05),a1:U(4.45)}],[],0,1,(u,zz,f)=>zz<S-6&&zz>5?sh([85,96,47],f*(hash(Math.floor(u*8),Math.floor(zz/3),37)<.3?.85:1)):sh([110,92,58],f)); wsol(1,'x',V(5.3),U(0),U(7.5),[{a0:U(3.05),a1:U(4.45)}]); }
      else {
        const nm=lv+1, dL=[{a0:V(7),a1:V(8.2),n:nm+'A'},{a0:V(11.2),a1:V(12.4),n:nm+'B'}], dR=[{a0:V(6.2),a1:V(7.4),n:nm+'C'},{a0:V(11.2),a1:V(12.4),n:nm+'D'}];
        const plate=(dd,hs)=>(u,zz,f,sd)=>{ if(sd!==hs)return plaster(u,zz,f,false); for(const d of dd)if(Math.abs(u-(d.a0+d.a1)/2)<.2&&zz>DH+5&&zz<DH+13){ const e=Math.abs(u-(d.a0+d.a1)/2)>.17||zz<DH+6||zz>DH+11; return sh(e?[120,92,40]:(Math.floor((u-d.a0)*24)+Math.floor(zz))%3===0?[40,30,24]:[206,170,84],f); } return wainscot(u,zz,f); };
        const wL=iw(lv,'hL','y',U(2.65),V(5.3),V(14),dL,[],1,0,plate(dL,1)); wsol(lv,'y',U(2.65),V(5.3),V(14),dL);
        iw(lv,'hLb','x',V(5.3),U(0),U(2.65),[],[],0,-1,wainscot); wsol(lv,'x',V(5.3),U(1.3),U(2.65),[]);
        const wR=iw(lv,'hR','y',U(4.85),V(3.7),V(14),dR,[],-1,0,plate(dR,-1)); wsol(lv,'y',U(4.85),V(3.7),V(14),dR);
        iw(lv,'hRb','x',V(3.7),U(4.85),U(7.5),[],[],0,-1,wainscot); wsol(lv,'x',V(3.7),U(4.85),U(7.5),[]);
        iw(lv,'pL','x',V(9.7),U(0),U(2.65),[],[],0,1); wsol(lv,'x',V(9.7),U(0),U(2.65),[]); iw(lv,'pR','x',V(9.7),U(4.85),U(7.5),[],[],0,1); wsol(lv,'x',V(9.7),U(4.85),U(7.5),[]);
        for(const [dd,w,uh,sd] of [[dL,wL,2.65,-1],[dR,wR,4.85,1]])for(const d of dd)FLATS.push({lv,n:d.n,uh,sd,v0:d.a0-A.y0,v1:d.a1-A.y0,pl:w.pl,gap:sol(lv,uh-.12,d.a0-A.y0,uh+.12,d.a1-A.y0)}); } }
    for(let r=0;r<4;r++)for(let c=0;c<5;c++)gbox({x0:U(.02),x1:U(.1),y0:V(9+c*.3),y1:V(9.28+c*.3),z0:40+r*12,z1:50+r*12,c:(r+c)%3?[176,140,64]:[190,152,72]},'A');
    gbox({x0:U(.1),x1:U(.6),y0:V(11.4),y1:V(13),z0:0,z1:18,c:[90,62,40]},'A'); gbox({x0:U(.1),x1:U(.25),y0:V(11.4),y1:V(13),z0:18,z1:40,c:[90,62,40]},'A'); sol(0,.1,11.4,.6,13);
    gbox({x0:U(4.95),x1:U(5.45),y0:V(8.2),y1:V(8.7),z0:0,z1:16,c:[150,80,50]},'A'); gbox({x0:U(4.9),x1:U(5.5),y0:V(8.15),y1:V(8.75),z0:16,z1:44,c:[46,110,52]},'A'); sol(0,4.95,8.2,5.45,8.7);
    gbox({x0:U(2.6),x1:U(2.66),y0:V(8.3),y1:V(9.1),z0:40,z1:78,c:[30,30,34]},'A');
    APTS.floorsBuilt=true; }
  for(let lv=0;lv<ST;lv++){ if(LOBBY)continue; if(HOLLOW){ if(lv===0)flat(A.x0,A.y0,A.x1,A.y1,1,boards); continue; } const z=lv*S, R=rooms(lv), Ym=y=>2*hm-y;
    { const zf=lv>0?z:1; for(const [r,col] of [[R.liv,boards],[R.bed,boards],[R.kit,tiles],[R.bath,tiles]]){ flat(r.x0,r.y0,r.x1,r.y1,zf,col); flat(r.x0,Ym(r.y1),r.x1,Ym(r.y0),zf,col); }
      flat(A.x0,H.y0,A.x1,H.y1,lv>0?z:1,lino);
      if(R.pass)flat(R.pass.x0,R.pass.y0,R.pass.x1,R.pass.y1,zf,lino); }
    flat(A.x0,A.y0,A.x1,A.y1,z+S-4,()=>[228,226,220],false);
    const room=(id,ax,at,a0,a1,holes,tiledA,tiledB,nx,nz)=>wall({id:id+lv,ax,at,a0,a1,z0:z,z1:z+S-4,holes:holes.map(h=>({...h,z0:h.z0+z,z1:h.z1+z})),cut:true,inner:true,nx,nz,foot:z+8,paint:(s,u,zz)=>plaster(u,zz-z,ax==='x'?.84:.68,s>0?tiledA:tiledB)});
    const dr=a=>({a0:a-DW,a1:a+DW,z0:0,z1:DH,door:true}), yl=R.liv.y0;
    room('hallF','x',H.y1,A.x0+T,A.x1-T,[dr(A.x0+1.5),...(R.pass?[dr(A.x1-.75)]:[])],true,false,0,1); room('hallB','x',H.y0,A.x0+T,A.x1-T,[dr(A.x1-1.5)],false,true,0,-1);
    for(const f of [1,-1]){ const Yf=y=>f>0?y:Ym(y), yL=Yf(yl), s=f>0?1:-1, bx1=R.bed.x1;
      room('liv'+f,'x',yL,A.x0+T,bx1-T,[dr(A.x0+1.6),dr(A.x0+3.9),dr(A.x0+5.4)],f<0,f>0,0,s);
      room('kit'+f,'y',R.kit.x1,Math.min(yL,Yf(H.y1)),Math.max(yL,Yf(H.y1)),[],true,true,1,0); room('bath'+f,'y',R.bath.x1,Math.min(yL,Yf(H.y1)),Math.max(yL,Yf(H.y1)),[],true,false,-1,0);
      if(R.pass&&f>0)room('pass','y',R.pass.x0,H.y1,A.y1-T,[],false,false,-1,0); } }
  flat(A.x0,A.y0,A.x1,A.y1,AH,roofCol); flat(A.x0,A.y0,A.x1,A.y1,AH-4,()=>[228,226,220],false);
  const FD={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]}; const LIGHTS=[]; APTS.lights=LIGHTS;
  const put=(kind,x,y,d,z,lv,sol)=>{ const f=CATALOG[kind]; if(!f){ console.warn('no',kind); return null; } const n0=PROPS.length; STUDIO.face(d?FD[d]:null,z); let p; try{ p=f(+x.toFixed(3),+y.toFixed(3)); }finally{ STUDIO.face(null); } if(!p)return null; place(p,0);
    const add0=BATCH.add, dy=Y(lv*S)-Y(0); BATCH.add=(pos,...r)=>{ for(let i=1;i<18;i+=3)pos[i]+=dy; add0(pos,...r); }; BATCH.tag=OBJ('apartments',p.name); try{ for(const b of p.boxes)gbox(b,'A'); }finally{ BATCH.add=add0; BATCH.tag=null; }
    const bs=p.boxes.filter(b=>!b.nb&&b.z0<30&&b.z1-b.z0>3); if(bs.length&&sol!==false){ const r={x0:Math.min(...bs.map(b=>b.x0)),y0:Math.min(...bs.map(b=>b.y0)),x1:Math.max(...bs.map(b=>b.x1)),y1:Math.max(...bs.map(b=>b.y1))}; SOLS[lv].push([X(r.x0),Z(r.y0),X(r.x1),Z(r.y1)]); }
    PROPS.length=n0; return p; };
  if(LOBBY){ const U=APTS.U, V=APTS.V, L=(lv,u,v,c,i)=>LIGHTS.push({x:X(U(u)),y:Y(lv*S+S-14),z:Z(V(v)),c,i});
    L(0,2,11,0xf6ecd8,8); L(0,5.5,11,0xf6ecd8,8); L(0,3.75,6,0xf2ead6,6); for(let lv=0;lv<ST;lv++)L(lv,3.75,2.2,0xf2ead6,5);
    for(let lv=2;lv<ST;lv++){ L(lv,3.75,7.5,0xf2ead6,6); L(lv,3.75,12,0xf2ead6,6); }
    for(const F of FLATS){ const lv=F.lv, s=F.sd, back=F.v1<9.7, v0=back?(F.uh<3?5.3:3.7):9.7, v1=back?9.7:14, k=FLATS.indexOf(F), tw=s<0?'E':'W', out=s<0?'W':'E', P=(a,v)=>[U(F.uh+s*a),V(v)];
      F.v0r=v0; F.v1r=v1; F.home={u:F.uh+s*1.0,v:(F.v0+F.v1)/2};
      put('fridge',...P(2.13,v0+.48),'S',0,lv); put('sink and counter',...P(1.0,v0+.44),'S',0,lv); put('wall shelf with plant',...P(1.0,v0+.14),'S',0,lv);
      put('dining table',...P(1.85,v0+1.55),'N',0,lv); put('stool',...P(1.85,v0+2.2),'N',0,lv);
      put('single bed',...P(2.05,v1-1.2),tw,0,lv); put('poster',...P(2.52,v1-1.2),tw,0,lv); put('wardrobe',...P(.4,v1-.75),out,0,lv); put('floor lamp',...P(.3,v0+1.0),null,0,lv);
      if(k%3===1)put('vacuum',...P(1.1,v1-.35),'N',0,lv); if(back&&F.uh>3)put('TV on a low stand',...P(2.25,v0+2.8),tw,0,lv);
      L(lv,F.uh+s*1.3,(v0+v1)/2,0xffd9a8,6); }
    const lh=Y(DH-1)-Y(0), DMs=new Map(), dmat=pl=>{ if(!DMs.has(pl))DMs.set(pl,[new THREE.MeshLambertMaterial({color:0x7a5236,clippingPlanes:[pl,HP,LP]}),new THREE.MeshLambertMaterial({color:0xc8a050,clippingPlanes:[pl,HP,LP]})]); return DMs.get(pl); };
    for(const F of FLATS){ const [m0,m1]=dmat(F.pl), x=X(U(F.uh)), z0=Z(V(F.v0)), len=Z(V(F.v1))-z0, pv=new THREE.Group(), leaf=new THREE.Mesh(new THREE.BoxGeometry(.06,lh,Math.abs(len)*.96),m0), kb=new THREE.Mesh(new THREE.BoxGeometry(.16,Y(4)-Y(0),.08),m1);
      leaf.position.set(0,lh/2,len*.5); kb.position.set(0,Y(46)-Y(0),len*.86); pv.add(leaf,kb); pv.position.set(x,Y(F.lv*S),z0); scene.add(pv); leaf.castShadow=leaf.receiveShadow=true;
      F.pv=pv; F.rs=F.sd*Math.sign(len)*Math.sign(X(A.x0+1)-X(A.x0)); F.open=0; F.keep=0; F.by=0; F.g0=F.gap.slice(); F.at={x,z:z0+len/2};
      const reg=()=>{ try{ UI.thing({name:'DOOR '+F.n,obj:leaf,reach:1.2*TILE,near:2*TILE,tall:1*TILE,act:()=>{ F.keep=F.keep>0?0:12; }}); }catch(e){ setTimeout(reg,400); } }; setTimeout(reg,0); } }
  for(let lv=0;lv<ST;lv++){ if(LOBBY)continue; if(HOLLOW){ if(lv===0)for(const [fx,i] of [[.3,8],[.7,8]])LIGHTS.push({x:X(A.x0+(A.x1-A.x0)*fx),y:Y(S-14),z:Z(hm),c:0xf2ead6,i}); continue; } const R=rooms(lv), x0=A.x0, yl=R.liv.y0, y1=A.y1, hy=H.y1, bx1=R.bed.x1, k=lv*7;
    for(const f of [1,-1]){ const Yf=y=>f>0?y:2*hm-y;
      LIGHTS.push({x:X(x0+2.6),y:Y(lv*S+S-14),z:Z(Yf(y1-1.5)),c:0xffd9a8,i:9},{x:X(x0+1.6),y:Y(lv*S+S-14),z:Z(Yf(hy+1.2)),c:0xfff2dc,i:6}); }
    LIGHTS.push({x:X(m),y:Y(lv*S+S-14),z:Z(hm),c:0xf2ead6,i:7},{x:X(x0+1.2),y:Y(lv*S+S-14),z:Z(hm),c:0xf2ead6,i:5},{x:X(A.x1-1.2),y:Y(lv*S+S-14),z:Z(hm),c:0xf2ead6,i:5}); }
  const ST0={x0:door.a0-.25,x1:door.a1+.25,y0:A.y1,land:.85,tr:.42,n:3}; ST0.y1=A.y1+ST0.land+ST0.n*ST0.tr; APTS.ST0=ST0;
  { const BS=[98,95,90], NO=[136,131,122], CH=[86,84,80], IRN=[28,30,34], top=i=>(RZ+1)*(ST0.n-i)/(ST0.n+1), g=b=>BOD.gbox(b,'A');
    BOD.gbox({x0:A.x0-.04,x1:A.x1+.04,y0:A.y0-.04,y1:A.y1+.04,z0:0,z1:RZ,c:BS},'A');
    g({x0:ST0.x0,x1:ST0.x1,y0:ST0.y0,y1:ST0.y0+ST0.land,z0:0,z1:RZ+1,c:BS}); g({x0:ST0.x0,x1:ST0.x1,y0:ST0.y0+ST0.land-.06,y1:ST0.y0+ST0.land,z0:RZ-1,z1:RZ+1,c:NO});
    for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr, h=top(i); g({x0:ST0.x0,x1:ST0.x1,y0,y1:y0+ST0.tr,z0:0,z1:h,c:BS}); g({x0:ST0.x0,x1:ST0.x1,y0:y0+ST0.tr-.06,y1:y0+ST0.tr,z0:h-2,z1:h,c:NO}); }
    for(const [c0,c1] of [[ST0.x0-.22,ST0.x0],[ST0.x1,ST0.x1+.22]]){ g({x0:c0,x1:c1,y0:ST0.y0,y1:ST0.y0+ST0.land,z0:0,z1:RZ+7,c:CH});
      for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr; g({x0:c0,x1:c1,y0,y1:y0+ST0.tr,z0:0,z1:top(i)+7,c:CH}); }
      const xm=(c0+c1)/2, rail=(y0,y1,z)=>g({x0:xm-.03,x1:xm+.03,y0,y1,z0:z,z1:z+2,c:IRN}), post=(y,z0,z1)=>g({x0:xm-.025,x1:xm+.025,y0:y-.025,y1:y+.025,z0,z1,c:IRN});
      rail(ST0.y0,ST0.y0+ST0.land,RZ+7+26); for(let y=ST0.y0+.12;y<ST0.y0+ST0.land;y+=.18)post(y,RZ+7,RZ+7+26);
      for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr, z=top(i)+7; rail(y0,y0+ST0.tr,z+26); post(y0+ST0.tr*.3,z,z+26); post(y0+ST0.tr*.75,z,z+26); }
      g({x0:xm-.06,x1:xm+.06,y0:ST0.y1-.12,y1:ST0.y1,z0:top(ST0.n-1)+7,z1:top(ST0.n-1)+7+34,c:IRN}); } }
  { const ix=x=>x/(TILE*BLDK)+BOD.OX, iy=z=>z/(TILE*BLDK)+BOD.OY;
    APTS.stoop=(x,z)=>{ const u=ix(x), v=iy(z); if(u<ST0.x0||u>ST0.x1||v<ST0.y0||v>=ST0.y1)return null; const t=v-ST0.y0; if(t<ST0.land)return Y(1);
      const i=Math.floor((t-ST0.land)/ST0.tr); return BOD.Y((RZ+1)*(ST0.n-i)/(ST0.n+1)); }; }
  BATCH.build((k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5,clippingPlanes:[HP,LP]}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:[HP,LP],...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{})}));
  const AM=Object.values(BATCH.meshes); BATCH.meshes={}; APTS.meshes=AM.concat(WALLM); for(const me of AM){ me.castShadow=true; me.receiveShadow=true; }
  const sol=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
  sol(A.x0-T,A.y1-T,door.a0,A.y1+T,AH); sol(door.a1,A.y1-T,A.x1+T,A.y1+T,AH); sol(A.x0-T,A.y0-T,A.x1+T,A.y0+T,AH); sol(A.x0-T,A.y0,A.x0+T,A.y1,AH); sol(A.x1-T,A.y0,A.x1+T,A.y1,AH);
  for(const [c0,c1] of [[ST0.x0-.22,ST0.x0],[ST0.x1,ST0.x1+.22]])sol(c0,ST0.y0,c1,ST0.y1,0);
  for(let lv=0;lv<ST;lv++){ if(HOLLOW||LOBBY)continue; const R=rooms(lv), yl=R.liv.y0, seg=(ax,at,a0,a1,holes)=>{ let a=a0; for(const h of [...holes].sort((p,q)=>p.a0-q.a0)){ if(h.a0>a)SOLS[lv].push(ax==='x'?[X(a),Z(at-T),X(h.a0),Z(at+T)]:[X(at-T),Z(a),X(at+T),Z(h.a0)]); a=h.a1; } if(a1>a)SOLS[lv].push(ax==='x'?[X(a),Z(at-T),X(a1),Z(at+T)]:[X(at-T),Z(a),X(at+T),Z(a1)]); };
    const dr=a=>({a0:a-DW,a1:a+DW}); seg('x',H.y1,A.x0,A.x1,[dr(A.x0+1.5),...(R.pass?[dr(A.x1-.75)]:[])]); seg('x',H.y0,A.x0,A.x1,[dr(A.x1-1.5)]);
    for(const f of [1,-1]){ const Yf=y=>f>0?y:2*hm-y, yL=Yf(yl), ya=Math.min(yL,Yf(H.y1)), yb=Math.max(yL,Yf(H.y1)); seg('x',yL,A.x0,R.bed.x1,[dr(A.x0+1.6),dr(A.x0+3.9),dr(A.x0+5.4)]); seg('y',R.kit.x1,ya,yb,[]); seg('y',R.bath.x1,ya,yb,[]); if(R.pass&&f>0)seg('y',R.pass.x0,H.y1,A.y1,[]); } }
  if(HOLLOW||LOBBY){ const CL=LOBBY?1:0, CY0=LOBBY?A.y0+5.4:A.y0, dz=Y(CL*S)-Y(0), K=BOD.STOREK, CAT=K.CATALOG, PRE=K.PRESETS['Preset Herb Cottage 1']||[], WX=A.x1-A.x0, WY=A.y1-CY0, E=1.1, n0=K.LAMPS.length, MADE=[];
    APTS.cotLv=CL; APTS.cotS=CL*S;
    const mu=(c,h,L,W)=>c-h<E?c:c+h>L-E?W-(L-c):E+(c-E)*(W-2*E)/(L-2*E);
    const put=(k,x,y,rot=0,sx=1)=>{ const f=CAT[k]; if(!f)return null; const p=f(+x.toFixed(3),+y.toFixed(3)); if(!p)return null;
      if(sx!==1){ const sc=v=>x+(v-x)*sx; for(const b of p.boxes){ b.x0=sc(b.x0); b.x1=sc(b.x1); } p.x0=sc(p.x0); p.x1=sc(p.x1); if(p.solids)for(const b of p.solids){ b.x0=sc(b.x0); b.x1=sc(b.x1); } }
      p.kind=k; place(p,rot);
      if(!/window sill|drapes/.test(k)&&p.boxes.length){ const m0=.12, bx0=Math.min(...p.boxes.map(b=>b.x0)), bx1=Math.max(...p.boxes.map(b=>b.x1)), by0=Math.min(...p.boxes.map(b=>b.y0)), by1=Math.max(...p.boxes.map(b=>b.y1));
        const dx=bx1>A.x1-m0?A.x1-m0-bx1:bx0<A.x0+m0?A.x0+m0-bx0:0, dy=by1>A.y1-m0?A.y1-m0-by1:by0<A.y0+m0?A.y0+m0-by0:0;
        if(dx||dy){ for(const b of [...p.boxes,...(p.solids||[])]){ b.x0+=dx; b.x1+=dx; b.y0+=dy; b.y1+=dy; } p.x0+=dx; p.x1+=dx; p.y0+=dy; p.y1+=dy; } }
      const add0=BATCH.add; if(dz)BATCH.add=(ps,...r)=>{ for(let i=1;i<18;i+=3)ps[i]+=dz; add0(ps,...r); }; BATCH.tag=OBJ('apartments','cottage: '+k); try{ for(const b of p.boxes)gbox(b,'A'); }finally{ BATCH.add=add0; BATCH.tag=null; } MADE.push(p); return p; };
    const SKIP=/herb cottage (floor|wall|roof)|ivy along|door step|window sill and branch rod|green drapes/, MOVE=LOBBY?{'apothecary cabinet':[A.x1-.06,CY0+5.2,1],'folding screen':[A.x1-.2,A.y1-2.1,1],'framed flower print':[A.x0+1.4,CY0+.03,0],'cottage wall clock':[A.x0+2.62,A.y1-.04,0],'shelf with jars and a candle':[A.x0+5,A.y1-.15,0],'writing desk with a pink lamp':[A.x0+5.6,CY0+.5,0]}:{'apothecary cabinet':[A.x1-.06,A.y0+9.8,1],'folding screen':[A.x1-.2,A.y0+11.9,1],'framed flower print':[A.x0+2.62,A.y0+.03,0],'cottage wall clock':[A.x0+2.62,A.y1-.04,0],'shelf with jars and a candle':[A.x0+5,A.y1-.15,0]};
    for(const [k,x,y] of PRE){ if(SKIP.test(k))continue; if(MOVE[k]){ put(k,...MOVE[k]); continue; } const f=CAT[k]; if(!f)continue; const p0=f(0,0); if(!p0)continue; const cx=A.x0+mu(x,(p0.x1-p0.x0)/2,9,WX), cy=CY0+mu(y,(p0.y1-p0.y0)/2,12,WY); if(LOBBY&&cx>A.x0+2.9&&cx<A.x0+4.6&&cy<CY0+1.6)continue; put(k,cx,cy); }
    for(const [x,back] of LOBBY?[[A.x0+1.5,0],[m,0],[A.x1-1.5,0]]:[[A.x0+1.5,1],[m,1],[A.x1-1.5,1],[A.x0+1.5,0],[m,0]]){ const y=back?A.y0:A.y1; put('window sill and branch rod',x,back?y+.08:y-.08,back?0:2,.56); put('green drapes',x,back?y+.045:y-.045,back?0:2,.6); }
    if(LOBBY){ for(const [u,v] of [[2,4],[5.5,4],[3.75,7.5]])LIGHTS.push({x:X(A.x0+u),y:Y(S+S-14),z:Z(CY0+v),c:0xffd2a0,i:6}); } else for(const L of LIGHTS){ L.c=0xffd2a0; L.i=6; }
    K.LAMPS.slice(n0).filter(l=>!l.off&&l.r>0&&Math.max(...l.c)>0).sort((a,b)=>b.r-a.r).slice(0,6).forEach(l=>{ const cm=Math.max(...l.c); LIGHTS.push({x:X(l.x),y:Y(l.z+CL*S),z:Z(l.y),c:new THREE.Color(l.c[0]/cm,l.c[1]/cm,l.c[2]/cm).getHex(),i:5*cm*Math.min(1.2,l.r/5),flame:1}); });
    K.LAMPS.length=n0; APTS.made=MADE;
    BATCH.build((k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5,clippingPlanes:[HP,LP]}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:[HP,LP],...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{})}));
    { const CM=Object.values(BATCH.meshes); BATCH.meshes={}; for(const me of CM){ me.castShadow=true; me.receiveShadow=true; } APTS.meshes=APTS.meshes.concat(CM); }
    APTS.home={x:X(A.x0+WX*.42),z:Z(CY0+WY*.55),y:Y(CL*S),hd:0}; }
  for(const L of LIGHTS){ const P=new THREE.PointLight(L.c,0,(L.flame?4:6.5)*TILE,1.6); P.position.set(L.x,L.y,L.z); P.userData.i0=L.i; P.userData.in=cur=>!!cur&&APTS.in&&P.position.y>cur.y0-.3&&P.position.y<cur.y1-.5; scene.add(P); L.light=P; }
  if((HOLLOW||LOBBY)&&APTS.made&&typeof FLAME!=='undefined'&&FLAME.props)FLAME.props(APTS.made,X,z=>Y(z+(APTS.cotS||0)),Z,LIGHTS.filter(L=>L.flame).map(L=>L.light));
  let ELV=null;
  if(LOBBY){ const U=APTS.U, V=APTS.V, mat=c=>new THREE.MeshLambertMaterial({color:c,clippingPlanes:[HP,LP]}), bx=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(Math.abs(w),Math.abs(h),Math.abs(d)),m);
    const STEEL=mat(0x8c9098), DARKS=mat(0x5a5e66), cx=(X(U(5.05))+X(U(7.35)))/2, cz=(Z(V(.2))+Z(V(2.5)))/2, W=Math.abs(X(U(7.35))-X(U(5.05))), D=Math.abs(Z(V(2.5))-Z(V(.2))), fz=Math.sign(Z(V(2.5))-Z(V(.2)))||1, HH=Y(S-16)-Y(0), th=Y(3)-Y(0);
    const cab=new THREE.Group(); const fl=bx(W,th,D,STEEL); fl.position.y=th/2; const bk=bx(W,HH,.04,DARKS); bk.position.set(0,HH/2,-fz*D/2);
    const sl=bx(.04,HH,D,DARKS); sl.position.set(-W/2,HH/2,0); const sr=sl.clone(); sr.position.x=W/2; const cl=bx(W,.04,D,STEEL); cl.position.y=HH;
    const pnl=bx(.03,Y(26)-Y(0),.18,mat(0x2a2c30)); pnl.position.set(W/2-.03,Y(48)-Y(0),fz*D/2-.25);
    for(let i=0;i<ST;i++){ const b=bx(.035,.05,.05,new THREE.MeshBasicMaterial({color:0xffd27a,clippingPlanes:[HP,LP]})); b.position.set(W/2-.05,Y(38+i*5)-Y(0),fz*D/2-.25); cab.add(b); }
    cab.add(fl,bk,sl,sr,cl,pnl); cab.position.set(cx,Y(1),cz); scene.add(cab);
    const dx0=X(U(5.3)), dx1=X(U(7.2)), lw=Math.abs(dx1-dx0)/2, dzl=Z(V(2.55)), leaves=[], gaps=[];
    for(let lv=0;lv<ST;lv++){ const a=bx(lw,Y(DH)-Y(0),.05,STEEL), b=bx(lw,Y(DH)-Y(0),.05,STEEL), y=Y(lv*S+DH/2)+(lv?0:Y(1)-Y(0)); a.position.set(Math.min(dx0,dx1)+lw/2,y,dzl); b.position.set(Math.max(dx0,dx1)-lw/2,y,dzl); scene.add(a,b); leaves.push([a,b]);
      gaps.push(APTS.lsol(lv,5.3,2.45,7.2,2.65)); }
    const G0=gaps.map(g=>g.slice());
    ELV={z:1,to:null,ph:'idle',door:0,wait:0,at:0,last:performance.now(),cab};
    const setDoors=()=>{ for(let lv=0;lv<ST;lv++){ const o=lv===ELV.at?ELV.door:0, [a,b]=leaves[lv]; a.position.x=Math.min(dx0,dx1)+lw/2-o*lw*.95; b.position.x=Math.max(dx0,dx1)-lw/2+o*lw*.95; const g=gaps[lv];
      if(o>.85){ g[0]=g[2]=1e9; } else { g[0]=G0[lv][0]; g[2]=G0[lv][2]; } } };
    ELV.call=lv=>{ if(ELV.ph==='moving'||ELV.ph==='closing')return; if(ELV.at===lv){ ELV.ph='opening'; ELV.wait=0; } else { ELV.to=lv; ELV.ph=ELV.door>0?'closing':'moving'; } };
    ELV.go=lv=>{ if(lv===ELV.at){ ELV.ph='opening'; return; } ELV.to=lv; ELV.ph='closing'; };
    const inCab=()=>{ const x=pos.x, z=pos.z; return Math.abs(py-Y(ELV.z))<SY*.5&&x>cx-W/2&&x<cx+W/2&&z>cz-D/2&&z<cz+D/2; };
    const css=document.createElement('style'); css.textContent='#elevp{position:fixed;right:24px;top:50%;transform:translateY(-50%);font:12px var(--pixel,monospace);color:#ffe3a6;background:#1c1d21;border:2px solid #6a6e78;padding:10px 12px;z-index:15;flex-direction:column;gap:6px;user-select:none}#elevp:not([hidden]){display:flex}#elevp[hidden]{display:none}#elevp .btn{min-width:110px}';
    document.head.appendChild(css); const P=document.createElement('div'); P.id='elevp'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Elevator');
    P.innerHTML='<div>ELEVATOR</div>'+[...Array(ST)].map((_,i)=>`<button class="btn" data-f="${i}">${i?['','2ND','3RD','4TH','5TH'][i]+' FLOOR':'LOBBY'}</button>`).join(''); document.body.appendChild(P);
    P.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>ELV.go(+b.dataset.f));
    for(let lv=0;lv<ST;lv++){ const hb=bx(.35,Y(30)-Y(0),.25,new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(U(7.1)),Y(lv*S+48),Z(V(2.7))); scene.add(hb);
      const bt=bx(.06,Y(12)-Y(0),.03,mat(0xcaa860)); bt.position.set(X(U(7.05)),Y(lv*S+48),Z(V(2.58))+fz*.02); scene.add(bt);
      const reg=()=>{ try{ UI.thing({name:'ELEVATOR',obj:hb,reach:1.1*TILE,near:2.4*TILE,tall:1*TILE,act:()=>{ if(APTS.floor()===lv)ELV.call(lv); }}); }catch(e){ setTimeout(reg,400); } }; setTimeout(reg,0); }
    ELV.tick=(lv,inside)=>{ const now=performance.now(), dt=Math.min(.1,(now-ELV.last)/1000); ELV.last=now;
      if(ELV.ph==='opening'){ ELV.door=Math.min(1,ELV.door+dt/.9); if(ELV.door>=1){ ELV.ph='open'; ELV.wait=0; } }
      else if(ELV.ph==='open'){ ELV.wait+=dt; if(ELV.wait>6&&!inCab())ELV.ph='closingIdle'; }
      else if(ELV.ph==='closing'||ELV.ph==='closingIdle'){ ELV.door=Math.max(0,ELV.door-dt/.9); if(ELV.door<=0)ELV.ph=ELV.ph==='closing'&&ELV.to!=null?'moving':'idle'; }
      else if(ELV.ph==='moving'){ const tz=ELV.to*S+1, d=tz-ELV.z, st=60*dt; if(Math.abs(d)<=st){ ELV.z=tz; ELV.at=ELV.to; ELV.to=null; ELV.ph='opening'; } else { ELV.z+=Math.sign(d)*st; ELV.at=Math.round((ELV.z-1)/S); } }
      cab.position.y=Y(ELV.z); setDoors();
      P.hidden=!(inside&&inCab()&&(ELV.ph==='open'||ELV.ph==='idle')); };
    window.ELVDBG=()=>({z:ELV.z,ph:ELV.ph,at:ELV.at,door:+ELV.door.toFixed(2)}); window.ELV=ELV; }
  const SY=Y(S)-Y(0), x0s=X(A.x0), x1s=X(A.x1), z0s=Z(A.y0), z1s=Z(A.y1), sx0=X(STX[0]), sx1=X(STX[1]), sz0=Z(STY[0]), sz1=Z(STY[1]);
  APTS.inside=(x,z)=>x>x0s&&x<x1s&&z>z0s&&z<z1s;
  APTS.floor=()=>HOLLOW?0:APTS.lvOf(py);
  const tz=v=>Z(A.y0+v), ux=u=>X(A.x0+u), su0=Math.min(ux(0),ux(2.55)), su1=Math.max(ux(0),ux(2.55)), sv0=Math.min(tz(0),tz(4.15)), sv1=Math.max(tz(0),tz(4.15));
  const eu0=Math.min(ux(5),ux(7.5)), eu1=Math.max(ux(5),ux(7.5)), ev0=Math.min(tz(0),tz(2.55)), ev1=Math.max(tz(0),tz(2.55)), U1=X(A.x0+1)-X(A.x0), V1=Z(A.y0+1)-Z(A.y0);
  const gnd=(x,z,yy,cab)=>R0+gnd0(x,z,yy-R0,cab), gnd0=(x,z,yy,cab)=>{
    if(x>su0&&x<su1&&z>sv0&&z<sv1){ const u=(x-X(A.x0))/U1, v=(z-Z(A.y0))/V1, h=S/2; let h0;
      if(v<=1.35)h0=h; else if(u<1.35)h0=Math.max(0,Math.min(1,(4.15-v)/2.8))*h; else h0=h+Math.max(0,Math.min(1,(v-1.35)/2.8))*h;
      const lv=Math.max(0,Math.min(ST-2,Math.round((yy-(Y(h0)-Y(0)))/SY))); return Y(h0+lv*S)-Y(0)+(lv===0&&h0<1?Y(1)-Y(0):0); }
    if(cab&&ELV&&x>eu0&&x<eu1&&z>ev0&&z<ev1)return Y(ELV.z)-Y(0)+.02;
    const f=Math.max(0,Math.min(ST-1,Math.floor(yy/SY+.08))); return SY*f+(f===0?Y(1)-Y(0):0); };
  APTS.ground=(x,z)=>!LOBBY||x==null?R0+SY*APTS.floor():gnd(x,z,py,true);
  APTS.gnd=(x,z,yy)=>gnd(x,z,yy,false);
  APTS.flat=n=>FLATS.find(F=>F.n===n);
  APTS.way=F=>{ const P=[[6.5,13.3],[3.75,11],[3.75,5.0],[2.0,4.6]]; for(let l=0;l<F.lv;l++)P.push([.7,4.6],[.7,1.5],[.7,.75],[2.0,.75],[2.0,4.0],[2.0,4.6]);
    P.push([3.75,5.2],[3.75,(F.v0+F.v1)/2],[F.uh+F.sd*.5,(F.v0+F.v1)/2],[F.home.u,F.home.v]); return P.map(([u,v])=>({x:X(A.x0+u),z:Z(A.y0+v)})); };
  APTS.lvY=lv=>R0+lv*SY; APTS.lvOf=y=>Math.max(0,Math.min(ST-1,Math.floor((y-R0)/SY+.08)));
  APTS.SY=SY; APTS.in=false; let was=false, lvWas=-1;
  let dl=performance.now();
  APTS.tick=()=>{ const inside=APTS.inside(pos.x,pos.z), lv=APTS.floor(); APTS.in=inside; if(ELV)ELV.tick(lv,inside);
    { const now=performance.now(), dt=Math.min(.1,(now-dl)/1000); dl=now; for(const F of FLATS){ if(F.keep>0)F.keep-=dt; if(F.by>0)F.by-=dt;
      const want=F.keep>0||F.by>0||inside&&lv===F.lv&&Math.hypot(pos.x-F.at.x,pos.z-F.at.z)<1.5*TILE?1:0; if(want===F.open)continue;
      F.open=want>F.open?Math.min(1,F.open+dt/.5):Math.max(0,F.open-dt/.7); F.pv.rotation.y=F.rs*1.45*F.open; const g=F.gap; if(F.open>.45){ g[0]=g[2]=1e9; } else { g[0]=F.g0[0]; g[2]=F.g0[2]; } } }
    if(inside!==was||lv!==lvWas){ was=inside; lvWas=lv; HP.constant=inside?R0+SY*lv+SY*.93:1e6; LP.constant=inside&&lv>0?-(R0+SY*lv-.02):1e6; for(const L of LIGHTS)L.light.intensity=inside?L.i:0; return inside?SOL.up.concat(SOLS[lv]):SOL[LVL]||SOL.up; } return null; };
  window.APTS_F=()=>FLATS.map(F=>[F.n,+F.open.toFixed(2),F.gap[0]>1e8?'gap open':'shut']);
  window.HOUSEAT=(dy=0)=>[BOD.X(m),BOD.Z(A.y1+dy)];
  window.APTSDBG=()=>({in:APTS.in,floor:APTS.floor(),py,pos:[+pos.x.toFixed(2),+pos.z.toFixed(2)],box:[+x0s.toFixed(1),+z0s.toFixed(1),+x1s.toFixed(1),+z1s.toFixed(1)],hall:[+Z(H.y0).toFixed(1),+Z(H.y1).toFixed(1)],door:+X((door.a0+door.a1)/2).toFixed(1)});
  APTS.rects=lv=>{ if(LOBBY)return [[A.x0,A.y0,A.x1,A.y1]]; if(HOLLOW)return lv?[]:[[A.x0,A.y0,A.x1,A.y1]]; const R=rooms(lv), Ym=y=>2*hm-y, out=[[A.x0,H.y0,A.x1,H.y1]]; for(const k of ['liv','kit','bath','bed','pass']){ const r=R[k]; if(!r)continue; out.push([r.x0,r.y0,r.x1,r.y1]); if(k!=='pass')out.push([r.x0,Ym(r.y1),r.x1,Ym(r.y0)]); } return out; };
  MODS.apts=APTS; }
