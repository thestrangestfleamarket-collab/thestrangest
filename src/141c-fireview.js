{ const APTS=MODS.apts, F=window.FIREV, T=TILE, KK=BLDK, {X,Y,Z}=BOD, hs=BOD.g.hash, sh=BOD.K.sh, bq=BOD.bq, {CX,WY,HZ,S}=F, A=APTS.A, RZ=APTS.RZ, U=u=>A.x0+u, V=v=>A.y0+v;
  const ix=x=>x/(T*KK)+BOD.OX, iy=z=>z/(T*KK)+BOD.OY, cl=v=>Math.max(0,Math.min(1,v)), nk=()=>cl((4-CLOCK.elev())/8);
  const L0=CX-3.6, L1=CX+3.6, DO=1.65, STP={x0:CX-.8,x1:CX+.8,y1:WY+.42,z:14}, LX=CX+2.6, AWX=24.7;
  const onL=(x,z)=>{ const u=ix(x), v=iy(z); return u>L0-.3&&u<L1+.3&&v>WY-.4&&v<WY+DO+.4; };
  const G=new THREE.Group(); G.visible=false; scene.add(G); const MATS=[]; let light=null, CARS=null, busy=false, lp=null;
  F.on=false; F.G=G;
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), frames=k=>new Promise(r=>{ const f=()=>--k<=0?r():requestAnimationFrame(f); requestAnimationFrame(f); });
  const fade=async(txt,fn)=>{ busy=true; const el=document.getElementById('subfade'); el.textContent=txt; el.style.pointerEvents='auto'; el.style.opacity='1'; if(keys.clear)keys.clear(); target=null; await wait(340); await frames(2);
    fn(); await frames(3); await wait(260); el.style.opacity='0'; el.style.pointerEvents='none'; await wait(360); busy=false; };
  F.out=()=>{ if(busy)return; fade(F.built?'YOUR FIRE ESCAPE':'LOADING YOUR FIRE ESCAPE...',()=>{ STORE.offGo(F.name); UI.goTo(X(CX),Z(WY+1.05),Y(HZ)); heading=0; }); };
  F.back=()=>{ if(busy)return; fade('YOUR APARTMENT',()=>{ if(USE.seat){ USE.seat=null; st.sit=null; } UI.goTo(X(U(AWX)),Z(V(1.1)),APTS.lvY(2)); heading=0; }); };
  const hit=(w,h,d,x,y,z)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false})); m.position.set(x,y,z); scene.add(m); return m; };
  UI.thing({name:'YOUR FIRE ESCAPE',ghost:1,obj:hit(1.1*T*KK,BOD.Y(52),.3*T,X(U(AWX)),BOD.Y(2*S+68+RZ),Z(V(.2))),reach:1.4*T,near:2.6*T,tall:1.4*T,act:()=>{ if(APTS.in&&APTS.floor()===2)F.out(); }});
  const F3={Y:'101101010010010',O:'111101101101111',U:'101101101101111',R:'110101110101101',A:'010101111101101',P:'110101110100100',T:'111010010010010',M:'101111101101101',E:'111100110100111',N:'110101101101101'};
  const plaque=(()=>{ const txt='YOUR APARTMENT', W=61, H=9, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d'); g.fillStyle='#7a5a24'; g.fillRect(0,0,W,H); g.fillStyle='#c8a050'; g.fillRect(1,1,W-2,H-2);
    let x=3; g.fillStyle='#2a1e10'; for(const ch of txt){ const q=F3[ch]; if(q)for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(q[r*3+c]==='1')g.fillRect(x+c,2+r,1,1); x+=ch===' '?2:4; }
    const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(W/24*T*KK,BOD.Y(H)),new THREE.MeshLambertMaterial({map:t,clippingPlanes:[APTS.HP,APTS.LP]})); m.position.set(X(U(23.4)),BOD.Y(2*S+105+RZ),Z(V(5.6)+.1)+.01); scene.add(m); return m; })();
  const P3=(x,y,z)=>[X(x),Y(z),Z(y)];
  const tx=(w,h,fn)=>{ const im=new ImageData(w,h), d=im.data; let ie=null, e=null;
    for(let j=0,k=0;j<h;j++)for(let i=0;i<w;i++,k+=4){ const v=fn(i,j); if(!v)continue; d[k]=v[0]; d[k+1]=v[1]; d[k+2]=v[2]; d[k+3]=255; if(v.length>3){ if(!ie){ ie=new ImageData(w,h); e=ie.data; } e[k]=v[3]; e[k+1]=v[4]; e[k+2]=v[5]; e[k+3]=255; } }
    return {map:{image:im},em:ie?{image:ie}:null}; };
  const box=(b,p=8,k='F')=>{ const {x0,x1,y0,y1,z0,z1}=b, sk=b.sk||'', H=Math.max(1,Math.round((z1-z0)*p/24));
    const fs=(nx,ny,x,y,z)=>b.fs?b.fs(nx,ny,x,y,z-z0,nx?.68:.84,p):sh(b.c,nx?.68:.84);
    const vf=(a,bb,c,d,len,at)=>{ const W=Math.max(1,Math.round(len*p)); bq(a,bb,c,d,tx(W,H,(i,j)=>at((i+.5)/W,z1-(j+.5)*(z1-z0)/H)),k); };
    if(z1-z0>.4){
      if(!sk.includes('w')&&y1>y0)vf(P3(x0,y0,z0),P3(x0,y1,z0),P3(x0,y1,z1),P3(x0,y0,z1),y1-y0,(t,z)=>fs(-1,0,x0,y0+t*(y1-y0),z));
      if(!sk.includes('e')&&y1>y0)vf(P3(x1,y1,z0),P3(x1,y0,z0),P3(x1,y0,z1),P3(x1,y1,z1),y1-y0,(t,z)=>fs(1,0,x1,y1-t*(y1-y0),z));
      if(!sk.includes('n')&&x1>x0)vf(P3(x1,y0,z0),P3(x0,y0,z0),P3(x0,y0,z1),P3(x1,y0,z1),x1-x0,(t,z)=>fs(0,-1,x1-t*(x1-x0),y0,z));
      if(!sk.includes('s')&&x1>x0)vf(P3(x0,y1,z0),P3(x1,y1,z0),P3(x1,y1,z1),P3(x0,y1,z1),x1-x0,(t,z)=>fs(0,1,x0+t*(x1-x0),y1,z)); }
    if(!sk.includes('t')&&x1-x0>.01&&y1-y0>.01){ const W=Math.max(1,Math.round((x1-x0)*p)), Hh=Math.max(1,Math.round((y1-y0)*p));
      bq(P3(x0,y1,z1),P3(x1,y1,z1),P3(x1,y0,z1),P3(x0,y0,z1),tx(W,Hh,(i,j)=>{ const x=x0+(i+.5)*(x1-x0)/W, y=y0+(j+.5)*(y1-y0)/Hh; return b.top?b.top(x,y):b.c; }),k); } };
  const GLASS=[34,38,46], WARM=[255,206,140], STEEL=[34,36,40], CUR=[[220,200,170],[180,120,110],[150,170,200],[230,230,220],[120,150,110]], AWN=[[150,40,36],[40,90,60],[40,60,120],[200,140,40],[120,40,90]];
  const BRK=[[150,70,56],[120,78,58],[176,150,110],[150,148,140],[104,72,62],[138,94,70],[96,98,104]];
  const brick=(c,u,z,f,lo,sd)=>{ const r=Math.floor(z/6), q=u*24+(r&1)*6, b=Math.floor(q/12), n=hs(b,r,sd);
    if(!lo&&(z-r*6<1||q-b*12<1))return sh(c,f*.66); return sh(c,f*(.86+.22*n)*(hs(Math.floor(q/40),Math.floor(z/30),sd+1)<.15?.9:1)); };
  const tar=(x,y)=>{ const n=hs(Math.floor(x*6),Math.floor(y*6),61); return n<.3?[50,50,52]:n>.7?[66,64,62]:[58,57,57]; };
  const shop=(o,u,zz,f,lo)=>{ const cu=(o.x0+o.x1)/2, du=Math.abs(u-cu), sd=o.sd, aw=AWN[Math.floor(hs(sd,1,3)*AWN.length)], lit=hs(sd,2,4)<.8;
    if(Math.min(u-o.x0,o.x1-u)<.3)return sh(o.st,f*.9);
    if(zz<8)return sh(o.st,f*.7);
    if(zz<86){ if(du<.55)return du>.5||zz>82?[30,30,32]:zz>66?(lit?[...GLASS,255,226,170]:GLASS):sh([70,50,38],f);
      if(((u-o.x0)%1.6)<.07||zz>82||zz<11)return [40,40,44]; const sv=zz%18<2?[60,56,52]:[70,84,92]; return lit?[...sv,236,206,150]:sv; }
    if(zz<104){ const s=(Math.floor((u-o.x0)*24/8)&1)?aw:[230,226,214]; return sh(s,f*(zz<88?.6:zz>101?1.1:1)); }
    if(zz<122){ const sc=AWN[(Math.floor(hs(sd,5,6)*5)+2)%5], q=zz-104, w=Math.floor((u-o.x0)*24/5), on=q>4&&q<14&&du<(o.x1-o.x0)*.32&&hs(w,Math.floor(q/3),sd+7)<.6;
      if(q<2||q>16)return [30,28,26]; return on?[236,230,214,255,240,200]:sh(sc,f); }
    return brick(o.c,u,zz+o.zb,f,lo,sd); };
  const fac=o=>(nx,ny,x,y,z,f,p)=>{ const lo=p<16, u=nx?y:x, c=o.c, sd=o.sd;
    if(z>=o.top-14){ const q=z-(o.top-14); return sh(o.st,f*(q<3?.62:q>11?1.1:q<6?.82:.98)); }
    if(nx||(o.blank&&ny===o.blank))return brick(c,u,z,f,lo,sd);
    if(z<o.zb)return sh(o.st,f*(z<2?.6:.9));
    const s=Math.floor((z-o.zb)/S), zz=z-o.zb-s*S;
    if(s===0&&o.shop&&ny===o.shop)return shop(o,u,zz,f,lo);
    if(s===0&&o.door!=null&&Math.abs(u-o.door)<.62){ const d=Math.abs(u-o.door); if(zz<100)return d>.56||zz>97?[40,36,34]:zz>80?[...GLASS,255,214,150]:sh([92,60,40],f*(Math.floor((u-o.door)*24)%6===0?.8:1)); }
    const k=Math.round((u-o.c0)/o.bay), cu=o.c0+k*o.bay, du=Math.abs(u-cu), hw=.55;
    if(cu-o.x0<.75||o.x1-cu<.75||(s===0&&o.door!=null&&Math.abs(cu-o.door)<1))return brick(c,u,z,f,lo,sd);
    const fr=o.fw&&k===0&&s>0, z0=fr?3:40, z1=96;
    if(du<hw+.14&&zz>=z1&&zz<z1+6)return sh(o.st,f*(zz===z1+5?1.12:.94));
    if(!fr&&du<hw+.14&&zz<z0&&zz>=z0-5)return sh(o.st,f*(zz===z0-1?1.12:.86));
    if(du<hw&&zz>=z0&&zz<z1){ if(du>hw-.07||zz<z0+2||zz>=z1-2||Math.abs(zz-(fr?62:68))<1||(fr&&du<.04))return [46,42,40];
      const ln=o.mine&&fr&&s===4?1:hs(k+97,s,sd)<o.lit, cur=hs(k+31,s,sd+5), cc=CUR[Math.floor(cur*CUR.length)], cs=cur<.6&&du>hw*.5, dc=cs?sh(cc,.7):((Math.floor(u*24)+zz)%9===0?[58,64,74]:GLASS);
      if(!ln)return dc; const n=.86+.14*hs(Math.floor(u*8),Math.floor(zz/4),sd+9), wc=cs?[cc[0],cc[1]*.8,cc[2]*.6]:WARM; return [...dc,wc[0]*n,wc[1]*n,wc[2]*n]; }
    return brick(c,u,z,f,lo,sd); };
  const bld=(x0,x1,y0,y1,n,o,p=8)=>{ const zb=o.zb||0, top=zb+n*S+16, O={x0,x1,top,zb,c:o.c,st:o.st||[170,162,148],sd:o.sd,c0:o.c0??(x0+1.3+((x1-x0-2.6)%2.6)/2),bay:2.6,lit:o.lit??.35,shop:o.shop,door:o.door,fw:o.fw,blank:o.blank,mine:o.mine};
    box({x0,x1,y0,y1,z0:0,z1:top,sk:o.sk,fs:fac(O),top:o.roof||tar},p,'F'); return O; };
  const railP=(x0,x1,y0,y1,z,p)=>{ const al=x1-x0>y1-y0, a0=al?x0:y0; box({x0,x1,y0,y1,z0:z,z1:z+33,fs:(nx,ny,x,y,zr)=>{ const a=al?x:y; return zr>=30||(zr>=14&&zr<16)||((a-a0)%.36)<.05?STEEL:null; },top:()=>STEEL},p,'L'); };
  const ladder=(x,y,za,zb,p)=>box({x0:x-.22,x1:x+.22,y0:y,y1:y+.04,z0:za,z1:zb,fs:(nx,ny,X_,Y_,zr)=>Math.abs(X_-x)>.17||zr%12<2?STEEL:null,top:()=>STEEL},p,'L');
  const escape=(x0,x1,yw,zs,lx,p,mine)=>{ const g=p<16?6:12;
    zs.forEach((z,i)=>{ const hole=i>0;
      box({x0,x1,y0:yw,y1:yw+DO,z0:z-3,z1:z,c:STEEL,top:(x,y)=>hole&&Math.abs(x-lx)<.3&&y>yw+.7&&y<yw+1.15?null:((x*g)%1<.4||(y*g)%1<.4)?STEEL:null},p,'L');
      box({x0,x1,y0:yw+DO-.06,y1:yw+DO,z0:z-9,z1:z-3,c:STEEL},p,'L'); for(let u=x0+.3;u<x1;u+=2.4)box({x0:u,x1:u+.06,y0:yw,y1:yw+DO,z0:z-12,z1:z-3,c:STEEL},p,'L');
      railP(x0,x1,yw+DO-.04,yw+DO,z,p); railP(x0,x0+.04,yw,yw+DO,z,p); railP(x1-.04,x1,yw,yw+DO,z,p);
      if(i<zs.length-1)ladder(lx,yw+.9,z,zs[i+1]+2,p); });
    ladder(lx,yw+.9,zs[0]-110,zs[0],p); };
  const tree=(x,y)=>{ const LF=[[52,92,44],[64,108,50],[44,78,40]], lf=(x_,y_,z)=>sh(LF[Math.floor(hs(Math.floor(x_*8+z/6),Math.floor(y_*8),51)*3)],1);
    box({x0:x-.07,x1:x+.07,y0:y-.07,y1:y+.07,z0:4,z1:62,c:[70,52,40]},8,'L');
    box({x0:x-.8,x1:x+.8,y0:y-.8,y1:y+.8,z0:52,z1:96,fs:(nx,ny,X_,Y_,z,f)=>sh(lf(X_,Y_,z),f),top:(x_,y_)=>lf(x_,y_,0)},8,'L');
    box({x0:x-.5,x1:x+.5,y0:y-.5,y1:y+.5,z0:96,z1:116,fs:(nx,ny,X_,Y_,z,f)=>sh(lf(X_,Y_,z),f*1.05),top:(x_,y_)=>sh(lf(x_,y_,3),1.1)},8,'L'); };
  const car=(x,y,c,dir)=>{ const L=.95, w=.4; box({x0:x-L,x1:x+L,y0:y-w,y1:y+w,z0:6,z1:22,c,fs:(nx,ny,X_,Y_,z,f)=>z<3?[24,24,26]:sh(c,f),top:()=>sh(c,1.05)},8,'L');
    box({x0:x-L*.5+dir*.1,x1:x+L*.45+dir*.1,y0:y-w*.86,y1:y+w*.86,z0:22,z1:34,c,fs:(nx,ny,X_,Y_,z,f)=>z<10?[44,52,62]:sh(c,f),top:()=>sh(c,1.1)},8,'L'); };
  const lamps=[]; for(let i=0;i<12;i++){ lamps.push([CX-66+i*12,WY+2.75,1]); lamps.push([CX-60+i*12,WY+12.25,-1]); }
  const pool=(x,y)=>{ let b=0; for(const [lx,ly,s] of lamps){ const d=Math.hypot(x-lx,(y-(ly+s*.8))*1.25); if(d<1.1)return 2; if(d<1.9)b=1; } return b; };
  const lit2=(c,b)=>b===2?[...c,58,46,26]:b===1?[...c,28,22,12]:c;
  const AVE0=CX+24, AVE1=CX+33;
  const road=(x,y)=>{ const n=hs(Math.floor(x*8),Math.floor(y*8),81), v=y-WY; let c=n<.25?[46,48,52]:n>.85?[62,62,66]:[54,56,60];
    const ca=x>AVE0-3&&x<AVE1+3; if(!ca&&Math.abs(Math.abs(v-7.5)-.1)<.05)c=[200,170,60];
    if(!ca&&(Math.abs(v-4.25)<.04||Math.abs(v-10.75)<.04))c=[176,176,170];
    if((x>AVE0-3&&x<AVE0-.6||x>AVE1+.6&&x<AVE1+3)&&(Math.floor(v*2.2)&1)&&v>3.3&&v<11.7)c=[190,190,184];
    const mx=((x-CX)%17+17)%17; if(Math.hypot(mx-8,v-6)<.35)c=Math.hypot(mx-8,v-6)<.3?[40,40,42]:[30,30,32];
    return lit2(c,pool(x,y)); };
  const ave=(x,y)=>{ const n=hs(Math.floor(x*8),Math.floor(y*8),83), v=x-(AVE0+AVE1)/2; let c=n<.25?[46,48,52]:n>.85?[62,62,66]:[54,56,60]; if(Math.abs(Math.abs(v)-.1)<.05)c=[200,170,60]; return c; };
  const walk=(x,y)=>{ const n=hs(Math.floor(x*8),Math.floor(y*8),85), j=((x-CX)%1.4+1.4)%1.4<.12||((y-WY)%1.4+1.4)%1.4<.12; return lit2(j?[132,128,122]:sh([164,160,152],.95+.1*n),pool(x,y)); };
  const make=(k,map,emap)=>{ const m=new THREE.MeshLambertMaterial({map,alphaTest:.5,side:k==='F'?THREE.FrontSide:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:0}:{})}); if(emap)MATS.push(m); return m; };
  const sol=STORE.kit.sol;
  F.build=()=>{ if(F.built)return; const keep=BATCH.items.splice(0), km=BATCH.meshes, kc=BATCH.cast; BATCH.meshes={}; BATCH.cast=true; BATCH.tag=null;
    const R=(i,j)=>hs(i,j,907);
    bld(CX-9,CX+9,WY-12,WY,6,{c:[132,64,50],sd:11,c0:CX,fw:1,mine:1,lit:.4,door:CX+5.2,zb:28,sk:'nwe',st:[178,170,156]},24);
    box({x0:CX+4.5,x1:CX+5.9,y0:WY,y1:WY+1.1,z0:0,z1:24,c:[150,146,136],top:(x,y)=>sh([150,146,136],(y-WY)*24%9<1?.8:1)},12,'L');
    escape(L0,L1,WY,[S+28,2*S+28,3*S+28],LX,12); escape(L0,L1,WY,[HZ,HZ+S],LX,24,1);
    box({x0:STP.x0,x1:STP.x1,y0:WY,y1:STP.y1,z0:HZ-3,z1:HZ+STP.z,c:[160,154,142],top:(x,y)=>sh([168,162,150],hs(Math.floor(x*24),Math.floor(y*24),77)<.1?.9:1)},24,'L');
    for(const [x,y,c] of [[L0+.45,WY+.4,[150,74,50]],[L1-.55,WY+.45,[90,96,110]],[L1-1.15,WY+.35,[150,74,50]]]){ box({x0:x-.18,x1:x+.18,y0:y-.18,y1:y+.18,z0:HZ,z1:HZ+12,c},24,'L');
      box({x0:x-.24,x1:x+.24,y0:y-.24,y1:y+.24,z0:HZ+12,z1:HZ+26,fs:(nx,ny,X_,Y_,z,f)=>sh(hs(Math.floor(X_*24),Math.floor(z/3),59)<.5?[60,110,52]:[46,90,44],f),top:(x_,y_)=>hs(Math.floor(x_*24),Math.floor(y_*24),58)<.5?[72,128,60]:[52,98,46]},24,'L'); }
    let x=CX+9, j=0; while(x<CX+72){ const w=8+Math.floor(R(j,1)*8), n=j===0?6:3+Math.floor(R(j,2)*6), c=BRK[Math.floor(R(j,3)*BRK.length)];
      bld(x,x+w,WY-12,WY-(R(j,4)<.3?.3:0),n,{c,sd:20+j,lit:.3,shop:R(j,5)<.5?1:0,door:R(j,5)<.5?null:x+w/2,zb:R(j,6)<.5?28:0}); if(R(j,7)<.5&&n>3)escape(x+1,x+w-1,WY-(R(j,4)<.3?.3:0),Array.from({length:n-1},(_,q)=>(q+1)*S+(R(j,6)<.5?28:0)),x+w-2.2,8); x+=w; j++; }
    x=CX-9; j=0; while(x>CX-72){ const w=8+Math.floor(R(j,11)*8), n=j===0?6:3+Math.floor(R(j,12)*6), c=BRK[Math.floor(R(j,13)*BRK.length)];
      bld(x-w,x,WY-12,WY-(R(j,14)<.3?.3:0),n,{c,sd:40+j,lit:.3,shop:R(j,15)<.5?1:0,door:R(j,15)<.5?null:x-w/2,zb:R(j,16)<.5?28:0}); if(R(j,17)<.5&&n>3)escape(x-w+1,x-1,WY-(R(j,14)<.3?.3:0),Array.from({length:n-1},(_,q)=>(q+1)*S+(R(j,16)<.5?28:0)),x-w+2.2,8); x-=w; j++; }
    const ACR=[[CX-72,AVE0-3],[AVE1+3,CX+72]]; j=0;
    for(const [a,b] of ACR){ let xx=a; while(xx<b-3){ let w=7+Math.floor(R(j,21)*8); if(b-xx-w<5)w=b-xx; const n=3+Math.floor(R(j,22)*2.6), c=BRK[Math.floor(R(j,23)*BRK.length)], y0=WY+15, y1=WY+27, top=n*S+16;
        bld(xx,xx+w,y0,y1,n,{c,sd:60+j,lit:.35,shop:-1});
        for(const [p0,p1,q0,q1] of [[xx,xx+w,y0,y0+.25],[xx,xx+w,y1-.25,y1],[xx,xx+.25,y0,y1],[xx+w-.25,xx+w,y0,y1]])box({x0:p0,x1:p1,y0:q0,y1:q1,z0:top,z1:top+10,c:[150,144,134]},8,'L');
        if(R(j,24)<.5){ const tx_=xx+1.6+R(j,25)*(w-3.2), ty=y0+3+R(j,26)*6, WD=[118,84,58];
          for(const [dx,dy] of [[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6]])box({x0:tx_+dx-.05,x1:tx_+dx+.05,y0:ty+dy-.05,y1:ty+dy+.05,z0:top,z1:top+44,c:[40,38,36]},8,'L');
          box({x0:tx_-.8,x1:tx_+.8,y0:ty-.8,y1:ty+.8,z0:top+44,z1:top+110,c:WD,fs:(nx,ny,X_,Y_,z,f)=>sh(z%22<2?[50,46,44]:WD,f*((Math.floor((nx?Y_:X_)*24/3))%2?.92:1)),top:()=>[70,60,52]},8,'L');
          box({x0:tx_-.55,x1:tx_+.55,y0:ty-.55,y1:ty+.55,z0:top+110,z1:top+122,c:[70,60,52]},8,'L'); box({x0:tx_-.25,x1:tx_+.25,y0:ty-.25,y1:ty+.25,z0:top+122,z1:top+130,c:[60,52,46]},8,'L'); }
        if(R(j,27)<.6){ const bx=xx+1+R(j,28)*(w-3.5); box({x0:bx,x1:bx+2,y0:y0+5,y1:y0+7.4,z0:top,z1:top+44,fs:(nx,ny,X_,Y_,z,f)=>ny<0&&Math.abs(X_-bx-1)<.4&&z<34?[60,46,38]:brick(c,nx?Y_:X_,z,f,1,7),top:tar},8,'F'); }
        for(let q=0;q<2;q++)if(R(j,30+q)<.6){ const ax=xx+1+R(j,32+q)*(w-2), ay=y0+1+R(j,34+q)*10; box({x0:ax-.35,x1:ax+.35,y0:ay-.25,y1:ay+.25,z0:top,z1:top+12,c:[150,152,156]},8,'L'); }
        { const chx=xx+w-1.2; box({x0:chx,x1:chx+.6,y0:y1-1.4,y1:y1-.8,z0:top,z1:top+30,fs:(nx,ny,X_,Y_,z,f)=>brick(c,nx?Y_:X_,z,f,1,8),top:()=>[30,28,26]},8,'F'); }
        xx+=w; j++; } }
    box({x0:CX-110,x1:CX+110,y0:WY,y1:WY+3,z0:0,z1:4,c:[164,160,152],top:walk,fs:(nx,ny,X_,Y_,z,f)=>sh([150,146,136],f)},8,'F');
    box({x0:CX-110,x1:CX+110,y0:WY+3,y1:WY+12,z0:-2,z1:0,c:[54,56,60],top:road,sk:'nswe'},8,'F');
    for(const [a,b] of [[CX-110,AVE0],[AVE1,CX+110]])box({x0:a,x1:b,y0:WY+12,y1:WY+15,z0:0,z1:4,c:[164,160,152],top:walk,fs:(nx,ny,X_,Y_,z,f)=>sh([150,146,136],f)},8,'F');
    box({x0:AVE0,x1:AVE1,y0:WY+12,y1:WY+130,z0:-2,z1:0,c:[54,56,60],top:ave,sk:'nswe'},8,'F');
    for(const [a,b] of [[AVE0-3,AVE0],[AVE1,AVE1+3]])box({x0:a,x1:b,y0:WY+15,y1:WY+130,z0:0,z1:4,c:[164,160,152],top:walk,fs:(nx,ny,X_,Y_,z,f)=>sh([150,146,136],f)},8,'F');
    for(const [lx,ly,s] of lamps){ const PC=[36,44,40]; box({x0:lx-.07,x1:lx+.07,y0:ly-.07,y1:ly+.07,z0:4,z1:150,c:PC},8,'L'); box({x0:lx-.04,x1:lx+.04,y0:Math.min(ly,ly+s*.85),y1:Math.max(ly,ly+s*.85),z0:144,z1:149,c:PC},8,'L');
      box({x0:lx-.16,x1:lx+.16,y0:ly+s*.8-.12,y1:ly+s*.8+.12,z0:134,z1:146,c:[200,196,170],fs:(nx,ny,X_,Y_,z,f)=>z<4?[210,206,180,255,238,190]:sh(PC,f),top:()=>PC},8,'L'); }
    for(let i=0;i<14;i++){ const tx_=CX-63+9*i; if(tx_>AVE0-4&&tx_<AVE1+4)continue; tree(tx_,WY+13.5); }
    const PCOL=[[150,40,36],[220,220,214],[40,60,110],[30,30,32],[200,170,60],[90,110,90],[140,140,146]];
    for(let i=0;i<54;i++){ const far=i%2, xx=CX-70+Math.floor(i/2)*5.2+(far?2.6:0); if(R(i,40)<.35)continue; if(far&&xx>AVE0-4&&xx<AVE1+4)continue; car(xx,far?WY+11.4:WY+3.6,PCOL[Math.floor(R(i,41)*PCOL.length)],far?-1:1); }
    BATCH.build(make); BATCH.cast=kc; for(const me of Object.values(BATCH.meshes||{}))G.add(me); BATCH.meshes=km; BATCH.items=keep;
    if(FAR3.mesh){ const Lb=[], c0y=WY+8;
      for(let bi=-6;bi<=5;bi++)for(let bj=-6;bj<=6;bj++){ const x0=CX+33+24*bi; if((bj===0||bj===-1)&&x0+15>CX-72&&x0<CX+72)continue;
        const rowY=bj>=0?[WY+15+20*bj,WY+29+20*bj]:[WY-14+20*(bj+1),WY+20*(bj+1)];
        let xx=x0; while(xx<x0+15-1){ const w=Math.min(x0+15-xx,4+R(bi*31+xx,bj)*5), cx=xx+w/2, cy=(rowY[0]+rowY[1])/2, d=Math.hypot(cx-CX,cy-c0y); xx+=w; if(d>112||d<26)continue;
          let h=(5+10*cl((d-30)/80)+R(cx,cy)*7)*S; if(d>55&&R(cy,cx)<.14)h*=1.8+R(cx,cy+1); Lb.push([cx,cy,w-.4,rowY[1]-rowY[0]-.6,h]); } }
      const g=new THREE.BoxGeometry(1,1,1).translate(0,.5,0), m=new THREE.InstancedMesh(g,FAR3.mesh.material,Lb.length), aV=new Float32Array(Lb.length), aS=new Float32Array(Lb.length), m4=new THREE.Matrix4(), cc=new THREE.Color(1,1,1);
      Lb.forEach(([x_,y_,w,d,h],i)=>{ m.setMatrixAt(i,m4.makeScale(w*T*KK,Y(h),d*T*KK).setPosition(X(x_),0,Z(y_))); m.setColorAt(i,cc); aV[i]=Math.floor(hs(i,3,71)*8); aS[i]=hs(i,5,72)*97; });
      g.setAttribute('aV',new THREE.InstancedBufferAttribute(aV,1)); g.setAttribute('aS',new THREE.InstancedBufferAttribute(aS,1)); m.frustumCulled=false; G.add(m); F.mid=Lb.length; }
    { const g=new THREE.PlaneGeometry(300*T*KK,300*T*KK).rotateX(-Math.PI/2), m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:new THREE.Color('rgb(52,54,58)')})); m.position.set(X(CX),Y(-3),Z(WY+8)); m.receiveShadow=true; G.add(m); }
    if(FAR3.panels){ const g=FAR3.panels.geometry.clone(); g.computeBoundingBox(); const b=g.boundingBox, cx=(b.min.x+b.max.x)/2, cz=(b.min.z+b.max.z)/2, s=125*T*KK/((b.max.x-b.min.x)/2), E=1.9;
      g.translate(-cx,-E,-cz); g.scale(s,s,s); g.translate(X(CX),E,Z(WY+8)); const m=new THREE.Mesh(g,FAR3.panels.material); m.frustumCulled=false; m.renderOrder=-1; G.add(m); }
    { const parts=[], add=(w,h,d,x,y,z,c)=>{ const g=new THREE.BoxGeometry(w,h,d).toNonIndexed(); g.translate(x,y,z); parts.push([g,c]); }, merge=()=>{ const P=[],N=[],C=[]; for(const [g,c] of parts.splice(0)){ P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array); for(let i=0;i<g.attributes.position.count;i++)C.push(...c); }
        const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); return g; };
      const L=1.9*T*KK, W=.8*T*KK, z0=Y(5), hb=Y(16), hc=Y(12), N=10;
      add(L,hb,W,0,z0+hb/2,0,[1,1,1]); add(L*.5,hc,W*.9,-L*.04,z0+hb+hc/2,0,[.3,.34,.4]); for(const a of [-1,1])for(const b of [-1,1])add(.36*T*KK,Y(9),.1*T*KK,a*L*.32,Y(4.5),b*W*.47,[.06,.06,.07]);
      const gb=merge(); for(const b of [-1,1]){ add(.03*T,Y(4),.14*T,L/2+.01,z0+Y(10),b*W*.32,[1,.95,.78]); add(.03*T,Y(4),.14*T,-L/2-.01,z0+Y(10),b*W*.32,[.95,.12,.08]); } const gl=merge();
      const body=new THREE.InstancedMesh(gb,new THREE.MeshLambertMaterial({vertexColors:true}),N), lit=new THREE.InstancedMesh(gl,new THREE.MeshBasicMaterial({vertexColors:true}),N), cc=new THREE.Color();
      const CC=[[.6,.08,.06],[.85,.85,.82],[.08,.14,.4],[.05,.05,.06],[.9,.7,.1],[.25,.4,.3],[.5,.5,.55]];
      const list=[...Array(N)].map((_,i)=>({x:CX-80+R(i,50)*160,d:i%2?-1:1,v:4+R(i,51)*3}));
      list.forEach((c,i)=>{ body.setColorAt(i,cc.setRGB(...CC[i%CC.length])); lit.setColorAt(i,cc.setRGB(1,1,1)); }); body.frustumCulled=lit.frustumCulled=false; body.castShadow=true; G.add(body,lit);
      const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), p3=new THREE.Vector3(), s1=new THREE.Vector3(1,1,1);
      CARS=(dt,k)=>{ list.forEach((c,i)=>{ c.x+=c.d*c.v*dt; if(c.x>CX+82)c.x-=164; if(c.x<CX-82)c.x+=164; q.setFromAxisAngle(up,c.d>0?0:Math.PI); m4.compose(p3.set(X(c.x),0,Z(WY+(c.d>0?5.85:9.15))),q,s1); body.setMatrixAt(i,m4); lit.setMatrixAt(i,m4); });
        body.instanceMatrix.needsUpdate=true; lit.instanceMatrix.needsUpdate=true; lit.visible=k>.4; }; CARS(0,0); }
    sol(L0-1,WY-.3,L1+1,WY,HZ+120); sol(L0-.12,WY+DO-.06,L1+.12,WY+DO+.06,HZ+33); sol(L0-.12,WY,L0+.04,WY+DO,HZ+33); sol(L1-.04,WY,L1+.12,WY+DO,HZ+33); sol(LX-.25,WY+.84,LX+.25,WY+.98,HZ+33);
    for(const [x_,y_] of [[L0+.45,WY+.4],[L1-.55,WY+.45],[L1-1.15,WY+.35]])sol(x_-.22,y_-.22,x_+.22,y_+.22,HZ+26);
    light=new THREE.PointLight(0xffc890,0,7*T,1.6); light.position.set(X(CX),Y(HZ+70),Z(WY+.4)); scene.add(light);
    UI.thing({name:'BACK INSIDE',ghost:1,obj:hit(1.2*T*KK,Y(94),.4*T,X(CX),Y(HZ+47),Z(WY+.15)),reach:1.4*T,near:2.6*T,tall:2.2*T,act:()=>F.back()});
    UI.thing({name:'SIT ON THE STEP',ghost:1,obj:hit(1.6*T*KK,Y(16),.45*T,X(CX),Y(HZ+8),Z(WY+.22)),reach:1.3*T,near:2.4*T,tall:.6*T,act:()=>F.sit()});
    const pl=STORE.places.find(q=>q[0]===F.name); if(pl){ pl[1]=X(CX); pl[2]=Z(WY+1.05); pl[3]=Y(HZ); }
    F.built=true; };
  F.sit=()=>{ if(!F.on)return; const x=X(CX), z=Z(WY+.5); USE.seat={back:pos.clone(),x,z}; pos.x=x; pos.z=z; target=null; heading=0; st.sit={z:Math.max(2,Y(STP.z)/(ZU*W3.SZ*(W3.BH||1)))}; };
  const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>{ if(F.built&&onL(x,z)){ const u=ix(x), v=iy(z); return Y(HZ+(u>STP.x0&&u<STP.x1&&v<STP.y1?STP.z:0)); } return sg0?sg0(x,z):null; };
  const into=(u0,v0,u,v)=>Math.abs(u-u0)<.5&&v<v0&&Math.cos(heading)<-.6&&lp&&Math.hypot(pos.x-lp.x,pos.z-lp.z)>1e-4;
  const t0=CLOCK.tick; CLOCK.tick=dt=>{ t0(dt); const on=F.built&&LVL==='up'&&onL(pos.x,pos.z);
    if(on!==F.on){ F.on=on; G.visible=on; }
    plaque.visible=!(APTS.in&&iy(pos.z)<V(5.6));
    if(!busy&&!on&&APTS.in&&APTS.floor()===2&&into(U(AWX),V(.55),ix(pos.x),iy(pos.z)))F.out();
    if(!on){ if(light)light.intensity=0; lp={x:pos.x,z:pos.z}; return; }
    if(FAR3.mesh)FAR3.mesh.visible=false; if(FAR3.panels)FAR3.panels.visible=false; if(FAR3.trees)FAR3.trees.visible=false; if(FAR3.FU)FAR3.FU.uMK.value=0; MISTE.x=0; if(SKY.U.uMistK)SKY.U.uMistK.value=0; if(scene.fog===FAR3.fog)scene.fog=null;
    const k=nk(); for(const m of MATS)m.emissiveIntensity=1.3*k; light.intensity=1.4*k; if(CARS)CARS(dt,k);
    if(!busy&&!USE.seat&&into(CX,WY+.45,ix(pos.x),iy(pos.z)))F.back(); lp={x:pos.x,z:pos.z}; };
  window.FIREDBG=()=>({built:F.built,on:F.on,mid:F.mid,mats:MATS.length,meshes:G.children.length,pos:[+ix(pos.x).toFixed(2),+iy(pos.z).toFixed(2)],py:+py.toFixed(2),apt:{in:APTS.in,floor:APTS.floor()}});
}
