const APTS={EMPTY:true};
{ const {X,Z,faceTex,bq,C,facade,FRAME,place}=BOD,
  RZ=APTS.RZ=28, Y=z=>BOD.Y(z+RZ), gbox=(b,k)=>BOD.gbox({...b,z0:b.z0+RZ,z1:b.z1+RZ},k), R0=APTS.R0=BOD.Y(RZ)-BOD.Y(0), {speck,hash}=BOD.g, {MKS,CATALOG,PROPS,STUDIO,LSEED,STORY,sh}=BOD.K, S=STORY, ST=3, AH=ST*S, W=LSEED.walk, T=.1;
  const A=(o=>({x0:50.4+o.x/BLDK,x1:76.4+o.x/BLDK,y0:W-14+o.y/BLDK,y1:W+o.y/BLDK}))(LAY.o('house')), m=(A.x0+A.x1)/2, H={y0:A.y0+5.6,y1:A.y0+8.4}, DW=.78, DH=94;
  APTS.A=A; APTS.H=H; const TEX={}; for(const k in TEXTURES)TEX[k]={w:TEXTURES[k].w,h:TEXTURES[k].h,c:B64(TEXTURES[k].c)};
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
  const vn=(u,v,k)=>{ const i=Math.floor(u), j=Math.floor(v), q=t=>t*t*(3-2*t), a=q(u-i), b=q(v-j), h=(x,y)=>hash(x,y,k); return (h(i,j)+(h(i+1,j)-h(i,j))*a)*(1-b)+(h(i,j+1)+(h(i+1,j+1)-h(i,j+1))*a)*b; };
  const gr=(x,y,k,s=1)=>(vn(x/(5*s),y/(5*s),k)*3+vn(x/(1.7*s),y/(1.7*s),k+2)*2+vn(x*2.3/s,y*2.3/s,k+4))/6, ck=(x,y,k,s,w,on)=>vn(x/(s*4),y/(s*4),k+1)>on&&Math.abs(vn(x/s,y/s,k)-.5)<w;
  const TN=BRICKS.TINT, blk=(bi,bc,f,fx,fy,W,Hh)=>{ const n=hash(bi,bc,19), tn=TN[Math.floor(hash(bi,bc,23)*TN.length)];
    let k=(.85+.24*n)*(1+.16*(gr(fx/24+bi*1.3,fy/24+bc*.7,bc+3,1.2)-.5)); if(Hh===13)k*=1+.22*(gr(fx/5+bi*7,fy/5+bc*3,bc+5,.6)-.5); if(fy===Hh-1)k*=1.1; else if(fy<=2)k*=.9; if(fx<=1)k*=1.04; else if(fx>=W-2)k*=.92;
    if((fx<=1||fx>=W-2)&&(fy<=2||fy>=Hh-2)&&hash(bi,bc,27)<.5)k*=.8; if(hash(Math.floor(fx+bi*31),Math.floor(fy+bc*17),29)<.03)k*=.78;
    return sh([LS[0]*tn[0],LS[1]*tn[1],LS[2]*tn[2]],f*k); };
  const rock=(base,sd,bw=.6,bh=9,mid)=>{ const P=(a,z,f)=>{ const ui=a*24, bc=Math.floor(z/bh), p=ui+(bc&1)*bw*12, bi=Math.floor(p/(bw*24)), fx=p-bi*bw*24, fy=z-bc*bh;
      if(fy<1||fx<1)return sh(base,f*.7); const tn=TN[Math.floor(hash(bi,bc,sd+2)*TN.length)]; let k=(.9+.16*hash(bi,bc,sd))*(1+.14*(gr(ui/24,z/24,sd+4,1)-.5))*(z<5?.8+.04*z:1);
      if(fy>=bh-1)k*=1.08; if(hash(Math.floor(ui),Math.floor(z),sd+6)<.035)k*=.78; if(ck(ui/24,z/24,sd+8,1,.012,.6))k*=.7; return sh([base[0]*tn[0],base[1]*tn[1],base[2]*tn[2]],f*k); };
    return {fs:(nx,ny,X_,Y_,z,f)=>P(nx?Y_:X_,z,f),top:(x,y)=>{ let k=1+.12*(gr(x,y,sd+10,.5)-.5); if(mid)k*=1+.1*Math.max(0,1-Math.abs(x-mid[0])/mid[1]); if(hash(Math.floor(x*24),Math.floor(y*24),sd+12)<.04)k*=.84; return sh(base,k); }}; };
  const weather=(c,u,z,cap,holes)=>{ const ui=u*24; let k=1+.07*(vn(ui/40,z/40,91)-.5);
    for(const h of holes){ const hw=(h.a1-h.a0)*12, ax=Math.abs((u-(h.a0+h.a1)/2)*24); if(ax<hw&&z>=h.z0&&z<h.z1)return c;
      if(!h.door&&ax<hw+3&&z<h.z0-1&&z>h.z0-70&&vn(ui/1.7,h.z0/9,95)>.5)k*=1-.22*(1-(h.z0-z)/70)*(1-ax/(hw+3)*.5); }
    if(z<cap-30&&z>cap-110&&vn(ui/2.2,3,97)>.56)k*=1-.16*(1-(cap-30-z)/80);
    if(z<40)k*=.8+.2*z/40+.06*(vn(ui/6,z/6,99)-.5);
    if(ck(ui/24,z/24,101,1.4,.008,.62))k*=.68;
    const o=sh(c,k); if(z<16&&vn(ui/5,z/4,103)>.6-.01*z){ const w=.45*(1-z/16); return [o[0]*(1-w)+70*w,o[1]*(1-w)+92*w,o[2]*(1-w)+52*w]; } return o; };
  const stone=(u,z,f,cap,holes,a0,a1)=>weather(stone0(u,z,f,cap,holes,a0,a1),u,z,cap,holes);
  const stone0=(u,z,f,cap,holes,a0,a1)=>{
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
    if(z<S-8){ const c=Math.floor(z/13), zz=z%13, p=ui+(c&1)*15; if(zz<2)return sh(LS,f*.5); if(p%30<2)return sh(LS,f*(p%30<1?.55:.75)); return blk(Math.floor(p/30),c+100,f*(z<10?.86:1),p%30,zz,30,13); }
    const s=z%S; if(s>=S-6||s<1)return sh(LS,f*(s===S-6?.66:s===0?1.14:1));
    const c=Math.floor(z/11), p=ui+(c&1)*13; if(z%11===0||p%26<1)return sh(LS,f*.8); return blk(Math.floor(p/26),c,f,p%26,z%11,26,11); };
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
  const steel=[34,36,40], FWU=[1.6,4.9,8.1,11.4,14.6,17.9,21.1,24.4], BWU=[1.3,3.95,6.55,9.2,16.8,19.45,22.05,24.7], DI=.85, DO=1.65, RF=4.4, RD=5.3;
  const ESC=[{yf:A.y1,o:1,walk:[4.9,8.1]},{yf:A.y0,o:-1,walk:[3.95,6.55]}].map(F=>{ const ua=.8, d0=ua+.3, d1=d0+RD, f0=d1+1.2, f1=f0+RF; return {...F,ua,d0,d1,f0,f1,ub:f1+.6,k:0}; });
  const hole=(u,lv,fw)=>({a0:A.x0+u-.55,a1:A.x0+u+.55,z0:lv*S+(fw?3:42),z1:lv*S+94,fw});
  const door={a0:m-DW,a1:m+DW,z0:0,z1:DH,door:true}, holesF=[door], holesB=[];
  for(let lv=0;lv<ST;lv++){ for(const u of FWU)if(lv||Math.abs(A.x0+u-m)>2)holesF.push(hole(u,lv,lv&&ESC[0].walk.includes(u))); for(const u of BWU)holesB.push(hole(u,lv,lv&&ESC[1].walk.includes(u))); }
  const outer=(id,ax,at,a0,a1,holes,inS,nx,nz)=>wall({id,ax,at,a0,a1,z0:0,z1:AH,holes,cut:true,nx,nz,rev:[120,115,106],paint:(s,u,z)=>s===inS?plaster(u,z%S,ax==='x'?.84:.68,false):stone(u,z,ax==='x'?1:.8,AH,ax==='x'?holes:(BLC[at]||(BLC[at]=blinds(a0+.3,a1-.3,Math.round(at*10)))),a0+(ax==='y'?T:0),a1-(ax==='y'?T:0))});
  { let seed=3; for(const h of [...holesF,...holesB])if(!h.door){ h.lit=hash(seed++,1,9)<.55; h.seed=seed; } }
  outer('front','x',A.y1,A.x0,A.x1,holesF,-1,0,-1); outer('back','x',A.y0,A.x0,A.x1,holesB,1,0,1); outer('west','y',A.x0,A.y0-T,A.y1+T,[],1,1,0); outer('east','y',A.x1,A.y0-T,A.y1+T,[],-1,-1,0);
  for(const h of holesF)if(!h.door&&!h.fw)pane({ax:'x',at:A.y1},h,h.lit,h.seed); for(const h of holesB)if(!h.fw)pane({ax:'x',at:A.y0},h,h.lit,h.seed);
  const SOLS=[]; APTS.sol=SOLS; for(let lv=0;lv<ST;lv++)SOLS[lv]=[];
  const U=u=>A.x0+u, V=v=>A.y0+v;
  for(const F of ESC){ const Yd=d=>F.yf+F.o*d, B=(u0,u1,d0,d1,z0,z1,top)=>gbox({x0:U(u0),x1:U(u1),y0:Math.min(Yd(d0),Yd(d1)),y1:Math.max(Yd(d0),Yd(d1)),z0,z1,c:steel,foot:0,top:top?(x,y)=>(Math.floor(x*10)+Math.floor(y*10))&1?sh(steel,.6):steel:null},'A');
    const rs=(lv,u0,u1,d0,d1)=>{ const a=Z(Yd(d0)), b=Z(Yd(d1)); SOLS[lv].push([X(U(u0)),Math.min(a,b),X(U(u1)),Math.max(a,b)]); };
    const rail=(lv,u0,u1,d0,d1)=>{ rs(lv,u0,u1,d0,d1); const z=lv*S, al=u1-u0>d1-d0, L=al?u1-u0:d1-d0, n=Math.max(1,Math.round(L/.36));
      B(u0,u1,d0,d1,z+30,z+33); B(u0,u1,d0,d1,z+14,z+16); for(let i=0;i<=n;i++){ const t=i/n*L; al?B(u0+t-.02,u0+t+.02,d0,d1,z,z+30):B(u0,u1,d0+t-.02,d0+t+.02,z,z+30); } };
    for(const lv of [1,2]){ const z=lv*S; B(F.ua,F.ub,0,DI,z-3,z,1);
      if(lv===1)B(F.d1,F.f0,DI,DO,z-3,z,1); else { B(F.ua,F.f0,DI,DO,z-3,z,1); B(F.f1,F.ub,DI,DO,z-3,z,1); }
      B(F.ua,F.ub,DO-.06,DO,z-9,z); for(let u=F.ua+.3;u<F.ub;u+=2.4)B(u,u+.06,0,DO,z-12,z-3);
      rail(lv,F.ua,F.ub,DO-.05,DO); rail(lv,F.ua,F.ua+.05,0,DO); rail(lv,F.ub-.05,F.ub,0,DO);
      if(lv===1){ rail(1,F.ua,F.d1-.1,DI-.025,DI+.025); rail(1,F.f0+.6,F.ub,DI-.025,DI+.025); } else { rail(2,F.f0,F.f1-.7,DI-.025,DI+.025); rail(2,F.f0-.025,F.f0+.025,DI,DO); } }
    rs(0,F.d0+.4,F.d1,DI-.025,DI+.025); rs(0,F.d0+.4,F.d1,DO-.05,DO);
    for(let i=0;i<12;i++){ const h=S+(i+1)*S/12, a=F.f0+i*RF/12, b=a+RF/12; B(a,b,DI+.04,DO-.04,h-2,h,1);
      for(const [d0,d1] of [[DI,DI+.04],[DO-.04,DO]]){ B(a,b,d0,d1,h-10,h); B(a,b,d0,d1,h+30,h+32); if(i%4===3)B(b-.03,b,d0,d1,h,h+30); } } }
  { const L=LS, ST2=[134,128,118], g=b=>gbox({...b,c:b.c||L,...rock(b.c||L,61,.9,14)},'A'), xa=A.x0, xb=A.x1, yf=A.y1, yb=A.y0;
    g({x0:xa-.1,x1:xb+.1,y0:yf,y1:yf+.1,z0:S-8,z1:S}); g({x0:xa-.1,x1:xa,y0:yb,y1:yf,z0:S-8,z1:S}); g({x0:xb,x1:xb+.1,y0:yb,y1:yf,z0:S-8,z1:S});
    const z=S+22, b0=xa+13.1; g({x0:b0,x1:xb-.08,y0:yf,y1:yf+.42,z0:z,z1:z+6});
    for(let x=b0+.3;x<xb-.3;x+=1.2)g({x0:x-.07,x1:x+.07,y0:yf,y1:yf+.32,z0:z-12,z1:z,c:ST2});
    const peds=[b0+.1,xa+16.25,xa+19.5,xa+22.75,xb-.25]; for(const x of peds)g({x0:x-.15,x1:x+.15,y0:yf+.04,y1:yf+.38,z0:z+6,z1:z+34});
    for(let i=0;i+1<peds.length;i++){ const p0=peds[i]+.15, p1=peds[i+1]-.15, n=Math.max(1,Math.round((p1-p0)/.2)); g({x0:p0,x1:p1,y0:yf+.1,y1:yf+.32,z0:z+6,z1:z+9,c:ST2});
      for(let k=0;k<n;k++){ const x=p0+(k+.5)*(p1-p0)/n; g({x0:x-.035,x1:x+.035,y0:yf+.17,y1:yf+.25,z0:z+9,z1:z+30,c:ST2}); g({x0:x-.055,x1:x+.055,y0:yf+.15,y1:yf+.27,z0:z+13,z1:z+21,c:ST2}); }
      g({x0:p0,x1:p1,y0:yf+.08,y1:yf+.34,z0:z+30,z1:z+35}); }
    const zc=AH-14; g({x0:xa-.4,x1:xb+.4,y0:yf,y1:yf+.4,z0:zc,z1:AH}); g({x0:xa-.4,x1:xb+.4,y0:yb-.4,y1:yb,z0:zc,z1:AH}); g({x0:xa-.4,x1:xa,y0:yb,y1:yf,z0:zc,z1:AH}); g({x0:xb,x1:xb+.4,y0:yb,y1:yf,z0:zc,z1:AH});
    for(let x=xa-.2;x<=xb+.2;x+=.45)g({x0:x-.05,x1:x+.05,y0:yf,y1:yf+.3,z0:zc-7,z1:zc,c:ST2});
    for(let y=yb+.2;y<=yf;y+=.45)for(const [x0,x1] of [[xa-.3,xa],[xb,xb+.3]])g({x0,x1,y0:y-.05,y1:y+.05,z0:zc-7,z1:zc,c:ST2}); }
  const boards=(x,y)=>{ const i=Math.floor(y*8), j=Math.floor(x*.7+i*.37), n=hash(j,i,41); return sh([150,112,76],.86+.22*n+(y*8-i<.08?-.2:0)); };
  const roofCol=(x,y)=>{ const n=hash(Math.floor(x*6),Math.floor(y*6),61); return n<.3?[50,50,52]:n>.7?[66,64,62]:[58,57,57]; };
  const flat=(x0,y0,x1,y1,z,col,up=true)=>bq(...(up?[[X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)]]:[[X(x0),Y(z),Z(y0)],[X(x1),Y(z),Z(y0)],[X(x1),Y(z),Z(y1)],[X(x0),Y(z),Z(y1)]]),faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y1-(j+.5)/24))),'A');
  APTS.floors=ST; APTS.DX=m;
  const SE=[10.5,13], LIGHTS=[]; APTS.lights=LIGHTS;
  const sol=(lv,u0,v0,u1,v1)=>{ const b=[X(U(u0)),Z(V(v0)),X(U(u1)),Z(V(v1))], r=[Math.min(b[0],b[2]),Math.min(b[1],b[3]),Math.max(b[0],b[2]),Math.max(b[1],b[3])]; SOLS[lv].push(r); return r; };
  APTS.U=U; APTS.V=V; APTS.lsol=sol;
  const DLV=[]; {
    const check=(x,y)=>{ const i=Math.floor((x-A.x0)*2), j=Math.floor((y-A.y0)*2), e=((x-A.x0)*2-i)<.07||((y-A.y0)*2-j)<.07; return e?[120,118,112]:(i+j)&1?[30,30,32]:[226,224,216]; };
    const carpet=(x,y)=>{ const u=x-A.x0, v=y-A.y0, n=hash(Math.floor(x*12),Math.floor(y*12),71), e=Math.abs(v-5.75)<.06||Math.abs(v-8.25)<.06; return v>5.6&&v<8.4||u>10.5&&u<15.5&&v>2.55&&v<5.6?(e&&u<10.4||e&&u>15.6?[176,140,70]:n<.2?[110,30,36]:[128,36,42]):boards(x,y); };
    const SH=[[0,2.55,26,14],[0,0,10.5,2.55],[15.5,0,26,2.55]];
    const iw=(lv,id,ax,at,a0,a1,holes,look)=>{ const z=lv*S; return wall({id:id+lv,ax,at,a0,a1,z0:z,z1:z+S-4,holes:holes.map(h=>({...h,z0:z,z1:z+DH,door:true})),cut:true,inner:true,nx:ax==='y'?1:0,nz:ax==='x'?1:0,foot:z+8,
      paint:(sd,u,zz)=>look?look(u,zz-z,ax==='x'?.84:.68):plaster(u,zz-z,ax==='x'?.84:.68,false)}); };
    const wsol=(lv,ax,at,a0,a1,holes)=>{ let a=a0; for(const h of [...holes].sort((p,q)=>p.a0-q.a0)){ if(h.a0>a)(ax==='x'?sol(lv,a-A.x0,at-A.y0-T,h.a0-A.x0,at-A.y0+T):sol(lv,at-A.x0-T,a-A.y0,at-A.x0+T,h.a0-A.y0)); a=h.a1; } if(a1>a)(ax==='x'?sol(lv,a-A.x0,at-A.y0-T,a1-A.x0,at-A.y0+T):sol(lv,at-A.x0-T,a-A.y0,at-A.x0+T,a1-A.y0)); };
    const wl=(lv,id,ax,at,a0,a1,holes,look)=>{ iw(lv,id,ax,at,a0,a1,holes,look); wsol(lv,ax,at,a0,a1,holes); };
    const dark=(u,zz,f)=>sh([92,96,102],f), ED=SE.map(s=>({a0:U(s+.3),a1:U(s+2.2)})), dr=c=>({a0:U(c-.55),a1:U(c+.55),c});
    for(let lv=0;lv<ST;lv++){ const z=lv*S;
      if(!lv)flat(A.x0,A.y0,A.x1,A.y1,1,check); else for(const r of SH)flat(U(r[0]),V(r[1]),U(r[2]),V(r[3]),z,carpet);
      if(lv<ST-1)for(const r of SH)flat(U(r[0]),V(r[1]),U(r[2]),V(r[3]),z+S-4,()=>[228,226,220],false);
      for(const u of [10.5,13,15.5])wl(lv,'sh'+u,'y',U(u),V(0),V(2.55),[],dark);
      wl(lv,'shF','x',V(2.55),U(10.5),U(15.5),ED,(u,zz,f)=>zz<DH+10&&ED.some(d=>u>d.a0-.1&&u<d.a1+.1)?sh([150,152,156],f):sh([92,96,102],f));
      for(const s of SE)for(const u of [s+.12,s+2.38])gbox({x0:U(u-.03),x1:U(u+.03),y0:V(1),y1:V(1.1),z0:z,z1:z+S,c:[70,72,78]},'A');
      if(!lv)continue;
      const FD=[3.25,9.75,16.25,22.75].map(dr), BD=[2.6,7.9,18.1,23.4].map(dr);
      wl(lv,'cF','x',V(8.4),U(0)+T,U(26)-T,FD); wl(lv,'cBw','x',V(5.6),U(0)+T,U(10.5),BD.slice(0,2)); wl(lv,'cBe','x',V(5.6),U(15.5),U(26)-T,BD.slice(2));
      for(const u of [6.5,13,19.5])wl(lv,'pF'+u,'y',U(u),V(8.4),V(14)-T,[]); for(const u of [5.25,20.75])wl(lv,'pB'+u,'y',U(u),V(0)+T,V(5.6),[]); for(const u of [10.5,15.5])wl(lv,'hS'+u,'y',U(u),V(2.55),V(5.6),[]);
      for(const [d,v,s] of [...FD.map(d=>[d,8.4,1]),...BD.map(d=>[d,5.6,-1])])DLV.push({lv,d,v,s}); } }
  for(let lv=1;lv<ST;lv++)for(const [y,hs] of [[A.y1,holesF],[A.y0,holesB]]){ let a=A.x0-T; for(const h of hs.filter(h=>h.fw&&Math.floor(h.z0/S)===lv)){ SOLS[lv].push([X(a),Z(y-T),X(h.a0),Z(y+T)]); a=h.a1; } SOLS[lv].push([X(a),Z(y-T),X(A.x1+T),Z(y+T)]); }
  flat(A.x0,A.y0,A.x1,A.y1,AH,roofCol); flat(A.x0,A.y0,A.x1,A.y1,AH-4,()=>[228,226,220],false);
  { const L=(lv,u,v,c,i)=>LIGHTS.push({x:X(U(u)),y:Y(lv*S+S-14),z:Z(V(v)),c,i});
    for(const [u,v] of [[5,7],[13,9.5],[21,7],[13,4]])L(0,u,v,0xf6ecd8,8);
    for(let lv=1;lv<ST;lv++){ for(const u of [4,13,22])L(lv,u,7,0xf2ead6,6); L(lv,13,4,0xf2ead6,5);
      for(const u of [3.25,9.75,16.25,22.75])L(lv,u,11.2,0xffd9a8,5); for(const u of [2.6,7.9,18.1,23.4])L(lv,u,2.8,0xffd9a8,5); } }
  const ST0={x0:door.a0-.25,x1:door.a1+.25,y0:A.y1,land:.85,tr:.42,n:3}; ST0.y1=A.y1+ST0.land+ST0.n*ST0.tr; APTS.ST0=ST0;
  { const BS=[98,95,90], NO=[136,131,122], CH=[86,84,80], IRN=[28,30,34], top=i=>(RZ+1)*(ST0.n-i)/(ST0.n+1), MID=[(ST0.x0+ST0.x1)/2,(ST0.x1-ST0.x0)/2], g=b=>BOD.gbox(b.c===IRN?b:{...b,...rock(b.c,b.c===CH?67:63,.7,9,b.c===CH?null:MID)},'A');
    BOD.gbox({x0:A.x0-.04,x1:A.x1+.04,y0:A.y0-.04,y1:A.y1+.04,z0:0,z1:RZ,c:BS,...rock(BS,65,.9,14)},'A');
    g({x0:ST0.x0,x1:ST0.x1,y0:ST0.y0,y1:ST0.y0+ST0.land,z0:0,z1:RZ+1,c:BS}); g({x0:ST0.x0,x1:ST0.x1,y0:ST0.y0+ST0.land-.06,y1:ST0.y0+ST0.land,z0:RZ-1,z1:RZ+1,c:NO});
    for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr, h=top(i); g({x0:ST0.x0,x1:ST0.x1,y0,y1:y0+ST0.tr,z0:0,z1:h,c:BS}); g({x0:ST0.x0,x1:ST0.x1,y0:y0+ST0.tr-.06,y1:y0+ST0.tr,z0:h-2,z1:h,c:NO}); }
    for(const [c0,c1] of [[ST0.x0-.22,ST0.x0],[ST0.x1,ST0.x1+.22]]){ g({x0:c0,x1:c1,y0:ST0.y0,y1:ST0.y0+ST0.land,z0:0,z1:RZ+7,c:CH});
      for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr; g({x0:c0,x1:c1,y0,y1:y0+ST0.tr,z0:0,z1:top(i)+7,c:CH}); }
      const xm=(c0+c1)/2, rail=(y0,y1,z)=>g({x0:xm-.03,x1:xm+.03,y0,y1,z0:z,z1:z+2,c:IRN}), post=(y,z0,z1)=>g({x0:xm-.025,x1:xm+.025,y0:y-.025,y1:y+.025,z0,z1,c:IRN});
      rail(ST0.y0,ST0.y0+ST0.land,RZ+7+26); for(let y=ST0.y0+.12;y<ST0.y0+ST0.land;y+=.18)post(y,RZ+7,RZ+7+26);
      for(let i=0;i<ST0.n;i++){ const y0=ST0.y0+ST0.land+i*ST0.tr, z=top(i)+7; rail(y0,y0+ST0.tr,z+26); post(y0+ST0.tr*.3,z,z+26); post(y0+ST0.tr*.75,z,z+26); }
      g({x0:xm-.06,x1:xm+.06,y0:ST0.y1-.12,y1:ST0.y1,z0:top(ST0.n-1)+7,z1:top(ST0.n-1)+7+34,c:IRN}); } }
  const SY=Y(S)-Y(0), ix=x=>x/(TILE*BLDK)+BOD.OX, iy=z=>z/(TILE*BLDK)+BOD.OY, TOL=Y(24)-Y(0);
  const EG=(x,z)=>{ if(!window.POSOK||Math.abs(x-pos.x)+Math.abs(z-pos.z)>.5*TILE)return null; const u=ix(x)-A.x0;
    for(const F of ESC){ const d=(iy(z)-F.yf)*F.o; if(d<0||d>DO||u<F.ua||u>F.ub)continue; const Q=d<DI?[S,2*S]:[];
      if(d>=DI){ if(u>=F.d1&&u<=F.f0)Q.push(S); if(u<=F.f0||u>=F.f1)Q.push(2*S); if(u>=F.f0&&u<=F.f1)Q.push(S+S*(u-F.f0)/RF);
        if(u>=F.d0&&u<=F.d1){ if(F.k>.95)Q.push(-RZ+(S+RZ)*(u-F.d0)/RD); else if(F.k<.05)Q.push(S); } }
      let b=null; for(const c of Q)if(Y(c)<=py+TOL&&(b==null||c>b))b=c; return b==null||b<2-RZ?null:Y(b); }
    return null; };
  APTS.stoop=(x,z)=>{ const u=ix(x), v=iy(z); if(u<ST0.x0||u>ST0.x1||v<ST0.y0||v>=ST0.y1)return EG(x,z); const t=v-ST0.y0; if(t<ST0.land)return Y(1);
    const i=Math.floor((t-ST0.land)/ST0.tr); return BOD.Y((RZ+1)*(ST0.n-i)/(ST0.n+1)); };
  BATCH.build((k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5,clippingPlanes:[HP,LP]}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:[HP,LP],...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{})}));
  const AM=Object.values(BATCH.meshes); BATCH.meshes={}; APTS.meshes=AM.concat(WALLM); for(const me of AM){ me.castShadow=true; me.receiveShadow=true; }
  const WS=[], osol=(x0,y0,x1,y1,zt,w)=>{ const r=[X(x0),Z(y0),X(x1),Z(y1)]; solids.push(r); if(w)WS.push(r); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
  osol(A.x0-T,A.y1-T,door.a0,A.y1+T,AH,1); osol(door.a1,A.y1-T,A.x1+T,A.y1+T,AH,1); osol(A.x0-T,A.y0-T,A.x1+T,A.y0+T,AH,1); osol(A.x0-T,A.y0,A.x0+T,A.y1,AH); osol(A.x1-T,A.y0,A.x1+T,A.y1,AH);
  for(const [c0,c1] of [[ST0.x0-.22,ST0.x0],[ST0.x1,ST0.x1+.22]])osol(c0,ST0.y0,c1,ST0.y1,0);
  const EB=ESC.map(F=>{ const a=Z(F.yf), b=Z(F.yf+F.o*(DO+.05)); return [X(U(F.ua-.05)),Math.min(a,b),X(U(F.ub+.05)),Math.max(a,b)]; });
  const base=(lv,e)=>lv||e?SOL.up.filter(s=>WS.includes(s)?!lv:!EB.some(b=>s[0]<b[2]&&s[2]>b[0]&&s[1]<b[3]&&s[3]>b[1])):SOL.up;
  for(const L of LIGHTS){ const P=new THREE.PointLight(L.c,0,6.5*TILE,1.6); P.position.set(L.x,L.y,L.z); P.userData.i0=L.i; P.userData.in=cur=>!!cur&&APTS.in&&P.position.y>cur.y0-.3&&P.position.y<cur.y1-.5; scene.add(P); L.light=P; }
  const mat=c=>new THREE.MeshLambertMaterial({color:c,clippingPlanes:[HP,LP]}), bx=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(Math.abs(w)||.001,Math.abs(h)||.001,Math.abs(d)||.001),m);
  const reg=o=>{ o.ghost=1; const f=()=>{ try{ UI.thing(o); }catch(e){ setTimeout(f,400); } }; setTimeout(f,0); };
  const STEEL=mat(0x8c9098), DARKS=mat(0x5a5e66), IRON=mat(0x22242a), WOOD=mat(0x7a5236), BRASS=mat(0xc8a050), LITB=new THREE.MeshBasicMaterial({color:0xffd27a,clippingPlanes:[HP,LP]}), HIT=new THREE.MeshBasicMaterial({visible:false});
  const fz=Math.sign(Z(V(2.5))-Z(V(.2)))||1, HH=Y(S-16)-Y(0), th=Y(3)-Y(0), lh=Y(DH)-Y(0), FN=['LOBBY','2ND FLOOR','3RD FLOOR','4TH FLOOR','5TH FLOOR'];
  const inCab=E=>Math.abs(py-Y(E.z))<SY*.5&&pos.x>E.cx-E.W/2&&pos.x<E.cx+E.W/2&&pos.z>E.cz-E.D/2&&pos.z<E.cz+E.D/2;
  const ELS=SE.map(s0=>{ const x0=X(U(s0+.05)), x1=X(U(s0+2.35)), cx=(x0+x1)/2, cz=(Z(V(.2))+Z(V(2.5)))/2, W=Math.abs(x1-x0), D=Math.abs(Z(V(2.5))-Z(V(.2))), cw=W/2;
    const cab=new THREE.Group(), add=(me,x,y,z)=>{ me.position.set(x,y,z); cab.add(me); return me; };
    add(bx(W,th,D,STEEL),0,th/2,0); add(bx(W,HH,.04,DARKS),0,HH/2,-fz*D/2); add(bx(.04,HH,D,DARKS),-W/2,HH/2,0); add(bx(.04,HH,D,DARKS),W/2,HH/2,0); add(bx(W,.04,D,STEEL),0,HH,0); add(bx(W*.5,.02,D*.5,LITB),0,HH-.03,0);
    add(bx(W-.1,.04,.02,STEEL),0,Y(36)-Y(0),-fz*(D/2-.04));
    const cl=[-1,1].map(k=>add(bx(cw,HH,.03,STEEL),k*cw/2,HH/2,fz*(D/2-.02)));
    add(bx(.03,Y(30)-Y(0),.2,mat(0x2a2c30)),W/2-.03,Y(48)-Y(0),fz*(D/2-.3));
    cab.position.set(cx,Y(1),cz); scene.add(cab);
    const cable=bx(.03,1,.03,IRON); cable.geometry.translate(0,.5,0); const cwt=bx(W*.5,Y(40)-Y(0),.08,IRON); scene.add(cable,cwt); cable.position.set(cx,0,cz); cwt.position.set(cx-W*.2,0,Z(V(.1)));
    const dx0=X(U(s0+.3)), dx1=X(U(s0+2.2)), lw=Math.abs(dx1-dx0)/2, dzl=Z(V(2.55)), leaves=[], gaps=[];
    const E={z:1,to:null,ph:'idle',door:0,wait:0,at:0,cab,cx,cz,W,D,leaves,gaps};
    for(let lv=0;lv<ST;lv++){ const y=Y(lv*S+DH/2)+(lv?0:Y(1)-Y(0)), a=bx(lw,lh,.05,STEEL), b=bx(lw,lh,.05,STEEL); a.position.set(Math.min(dx0,dx1)+lw/2,y,dzl); b.position.set(Math.max(dx0,dx1)-lw/2,y,dzl); scene.add(a,b); leaves.push([a,b]);
      gaps.push(sol(lv,s0+.3,2.45,s0+2.2,2.65));
      const ix_=X(U(s0+2.36)), hb=bx(.35,Y(30)-Y(0),.25,HIT), bt=bx(.06,Y(12)-Y(0),.03,BRASS), ln=bx(.3,Y(6)-Y(0),.02,LITB); hb.position.set(ix_,Y(lv*S+48),Z(V(2.7))); bt.position.set(ix_,Y(lv*S+48),Z(V(2.58))+fz*.02); ln.position.set((dx0+dx1)/2,Y(lv*S+DH+5),Z(V(2.58))+fz*.02); scene.add(hb,bt,ln);
      reg({name:'CALL THE ELEVATOR',obj:hb,reach:1.1*TILE,near:2.4*TILE,tall:1*TILE,act:()=>{ if(APTS.floor()===lv)E.call(lv); }});
      const pb=add(bx(.035,.05,.05,LITB),W/2-.05,Y(38+lv*7)-Y(0),fz*(D/2-.3)), ph=add(bx(.22,Y(6)-Y(0),.22,HIT),W/2-.12,pb.position.y,pb.position.z);
      reg({name:FN[lv],obj:ph,reach:.7*TILE,near:1.4*TILE,tall:.5*TILE,act:()=>{ if(inCab(E))E.go(lv); }}); }
    const G0=gaps.map(g=>g.slice());
    E.call=lv=>{ if(E.ph==='moving'||E.ph==='closing')return; if(E.at===lv){ E.ph='opening'; E.wait=0; } else { E.to=lv; E.ph=E.door>0?'closing':'moving'; } };
    E.go=lv=>{ if(lv===E.at){ E.ph='opening'; return; } E.to=lv; E.ph='closing'; };
    E.tick=dt=>{ if(E.ph==='opening'){ E.door=Math.min(1,E.door+dt/.9); if(E.door>=1){ E.ph='open'; E.wait=0; } }
      else if(E.ph==='open'){ E.wait+=dt; if(E.wait>6&&!inCab(E))E.ph='closingIdle'; }
      else if(E.ph==='closing'||E.ph==='closingIdle'){ E.door=Math.max(0,E.door-dt/.9); if(E.door<=0)E.ph=E.ph==='closing'&&E.to!=null?'moving':'idle'; }
      else if(E.ph==='moving'){ const tz=E.to*S+1, d=tz-E.z, v=60*dt*Math.min(1,.25+Math.abs(d)/40); if(Math.abs(d)<=v){ E.z=tz; E.at=E.to; E.to=null; E.ph='opening'; } else { E.z+=Math.sign(d)*v; E.at=Math.round((E.z-1)/S); } }
      cab.position.y=Y(E.z); const top=Y(E.z)+HH; cable.position.y=top; cable.scale.y=Math.max(.01,Y(AH)-top); cwt.position.y=Y(AH-60-(E.z-1));
      cl[0].position.x=-cw/2-E.door*cw*.9; cl[1].position.x=cw/2+E.door*cw*.9;
      for(let lv=0;lv<ST;lv++){ const o=lv===E.at&&E.ph!=='moving'?E.door:0, [a,b]=leaves[lv], g=gaps[lv]; a.position.x=Math.min(dx0,dx1)+lw/2-o*lw*.95; b.position.x=Math.max(dx0,dx1)-lw/2+o*lw*.95;
        if(o>.85){ g[0]=g[2]=1e9; } else { g[0]=G0[lv][0]; g[2]=G0[lv][2]; } } };
    return E; });
  { const css=document.createElement('style'); css.textContent='#elevp{position:fixed;right:24px;top:50%;transform:translateY(-50%);font:12px var(--pixel,monospace);color:#ffe3a6;background:#1c1d21;border:2px solid #6a6e78;padding:10px 12px;z-index:15;flex-direction:column;gap:6px;user-select:none}#elevp:not([hidden]){display:flex}#elevp[hidden]{display:none}#elevp .btn{min-width:110px}'; document.head.appendChild(css); }
  const PN=document.createElement('div'); PN.id='elevp'; PN.hidden=true; PN.setAttribute('role','dialog'); PN.setAttribute('aria-label','Elevator');
  PN.innerHTML='<div>ELEVATOR</div>'+[...Array(ST)].map((_,i)=>`<button class="btn" data-f="${i}">${FN[i]}</button>`).join(''); document.body.appendChild(PN);
  PN.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{ const E=ELS.find(inCab); if(E)E.go(+b.dataset.f); });
  window.ELVDBG=()=>ELS.map(E=>({z:E.z,ph:E.ph,at:E.at,door:+E.door.toFixed(2)})); window.ELV=ELS;
  const DL=DLV.map(o=>{ const x0=X(U(o.d.c-.55)), x1=X(U(o.d.c+.55)), w=Math.abs(x1-x0), z=Z(V(o.v)), pv=new THREE.Group(), leaf=bx(w*.96,lh,.05,WOOD), kb=bx(.05,Y(4)-Y(0),.1,BRASS);
    leaf.position.set(w*.48,lh/2,0); kb.position.set(w*.86,Y(46)-Y(0),0); pv.add(leaf,kb); pv.position.set(Math.min(x0,x1),Y(o.lv*S),z); scene.add(pv); leaf.castShadow=leaf.receiveShadow=true;
    return {...o,pv,a:0,at:{x:(x0+x1)/2,z},sg:-o.s*(Math.sign(Z(V(1))-Z(V(0)))||1)}; });
  const DROP=ESC.map(F=>{ const xt=X(U(F.d1)), L=Math.abs(xt-X(U(F.d0))), Hh=Y(S)-Y(-RZ), w=Math.abs(Z(F.yf+F.o*DO)-Z(F.yf+F.o*DI))-.04, th_=Math.atan2(Hh,L), len=Math.hypot(L,Hh), g=new THREE.Group(), n=15;
    for(const k of [-1,1]){ for(const dy of [0,Y(32)-Y(0)]){ const s=bx(len,dy?.03:.08,.03,IRON); s.position.set(-L/2,-Hh/2+dy,k*w/2); s.rotation.z=th_; g.add(s); } }
    for(let i=0;i<n;i++){ const t=bx(L/n*1.05,.025,w,IRON); t.position.set(-L+(i+.5)*L/n,-Hh+(i+1)*Hh/(n+1),0); g.add(t); }
    const cwg=bx(.18*TILE,Y(26)-Y(0),.18*TILE,IRON); cwg.position.set(.25*TILE,-Y(10)+Y(0),0); g.add(cwg);
    g.position.set(xt,Y(S),(Z(F.yf+F.o*DI)+Z(F.yf+F.o*DO))/2); scene.add(g); g.traverse(o=>{ if(o.isMesh)o.castShadow=true; });
    return {F,g,th:th_,foot:{x:X(U(F.d0)),z:(Z(F.yf+F.o*DI)+Z(F.yf+F.o*DO))/2}}; });
  APTS.inside=(x,z)=>{ const a=X(A.x0), b=X(A.x1), c=Z(A.y0), d=Z(A.y1); return x>Math.min(a,b)&&x<Math.max(a,b)&&z>Math.min(c,d)&&z<Math.max(c,d); };
  APTS.lvY=lv=>R0+lv*SY; APTS.lvOf=y=>Math.max(0,Math.min(ST-1,Math.floor((y-R0)/SY+.08)));
  APTS.floor=()=>window.POSOK?APTS.lvOf(py):0;
  const gnd=(x,z,yy)=>{ for(const E of ELS){ const s=SE[ELS.indexOf(E)], a=X(U(s)), b=X(U(s+2.5)), c=Z(V(0)), d=Z(V(2.55)); if(x>Math.min(a,b)&&x<Math.max(a,b)&&z>Math.min(c,d)&&z<Math.max(c,d))return Y(E.z)+.02; }
    const f=Math.max(0,Math.min(ST-1,Math.floor((yy-R0)/SY+.08))); return R0+SY*f+(f===0?Y(1)-Y(0):0); };
  APTS.ground=(x,z)=>!window.POSOK?R0:x==null?R0+SY*APTS.floor():gnd(x,z,py);
  APTS.SY=SY; APTS.in=false; APTS.esc=false; let was=-1, dl=performance.now();
  APTS.tick=()=>{ const inside=APTS.inside(pos.x,pos.z), eg=!inside&&LVL==='up'&&EG(pos.x,pos.z)!=null, inn=inside||eg, lv=APTS.floor(), now=performance.now(), dt=Math.min(.1,(now-dl)/1000); dl=now; APTS.in=inn; APTS.esc=eg;
    for(const E of ELS)E.tick(dt);
    { const E=ELS.find(inCab); PN.hidden=!(inside&&E&&(E.ph==='open'||E.ph==='idle')); }
    for(const D of DL){ const want=inside&&lv===D.lv&&Math.hypot(pos.x-D.at.x,pos.z-D.at.z)<1.6*TILE?1:0; if(want===D.a)continue; D.a=want>D.a?Math.min(1,D.a+dt/.5):Math.max(0,D.a-dt/.7); D.pv.rotation.y=D.sg*1.45*D.a; }
    for(const D of DROP){ const F=D.F, want=eg||py<R0+SY*.5&&Math.hypot(pos.x-D.foot.x,pos.z-D.foot.z)<3*TILE?1:0; if(want===F.k)continue; F.k=want>F.k?Math.min(1,F.k+dt/.8):Math.max(0,F.k-dt/1.6); D.g.rotation.z=-D.th*(1-F.k); }
    const key=(inside?1:0)+(eg?2:0)+lv*4; if(key!==was){ was=key; HP.constant=inn?R0+SY*lv+SY*.93:1e6; LP.constant=inside&&lv>0?-(R0+SY*lv-.02):1e6; for(const L of LIGHTS)L.light.intensity=inn?L.i:0; return inn?base(lv,eg).concat(SOLS[lv]):SOL[LVL]||SOL.up; } return null; };
  window.HOUSEAT=(dy=0)=>[BOD.X(m),BOD.Z(A.y1+dy)];
  window.APTSDBG=()=>({in:APTS.in,esc:APTS.esc,floor:APTS.floor(),py,pos:[+pos.x.toFixed(2),+pos.z.toFixed(2)],door:+X(m).toFixed(1),drop:ESC.map(F=>+F.k.toFixed(2))});
  APTS.rects=lv=>[[A.x0,A.y0,A.x1,A.y1]];
  MODS.apts=APTS; }
