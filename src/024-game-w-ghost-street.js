const FP=24;
const hash2=(a,b)=>Math.floor(hash(a,b,0)*4294967296);
function rng32(seed){ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function foNoise(x,y,seed){ const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,h=(a,b)=>(hash2(a+seed*7919,b)&0xffff)/65535;
  const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1); return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy; }
function foBlob(P,cx,cy,rx,ry,pal,seed){ '@later';
  for(let y=Math.floor(cy-ry-2);y<=cy+ry+2;y++)for(let x=Math.floor(cx-rx-2);x<=cx+rx+2;x++){
    const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry,n=(hash2((x>>1)+seed*31,(y>>1)+seed*17)%1000)/1000; if(nx*nx+ny*ny+(n-.5)*.44>1)continue;
    const l=nx*.55-ny*.78+(n-.5)*.7+((hash2(x+seed,y)&7)===0?.3:0); P.put(x,y,pal[l>.66?3:l>.14?2:l>-.4?1:0]); } }
var GSK={o:[LSEED.x0-10.67,LSEED.walk-9.35*4/3],s:4/3,WL:3.2};
GSK.HOME=[GSK.o[0]+.4*GSK.s,GSK.o[1]+4.1*GSK.s,GSK.o[0]+7.8*GSK.s,GSK.o[1]+9.1*GSK.s];
function gsFloor(x,y){ '@later'; if(!GSK)return null; const o=GSK.o; const s=GSK.s, u=(x-o[0])/s, v=(y-o[1])/s, WL=GSK.WL;
  if(u<-.1||u>8||v<.2||v>9.35)return null;
  const row=Math.floor(v/1.05), cu=(u+(Math.floor(hash(row,5,0)*4294967296)%100)/100*1.7)/1.7, col=Math.floor(cu), fu=cu-col, fv=v/1.05-row, k=Math.floor(hash(col,row,0)*4294967296)%3;
  const S=[[124,120,128],[114,110,120],[146,142,148],[78,76,86]], X=Math.floor(x*FP), Y=Math.floor(y*FP);
  let c=fu<.03||fv<.055?S[3]:fu>.965||fv>.94?S[2]:Math.floor(hash(X,Y,0)*4294967296)%23===0?S[3]:S[k===0?1:0];
  if(v>9.15)c=v>9.3?[96,92,100]:[150,146,150];
  if(u>3.55&&u<5.05&&v<WL+.42)c=v>WL+.36?[150,148,160]:[128,126,140];
  if(u>2.0&&u<2.9&&v>7.5&&v<8.0)c=Math.floor((u-2.0)*32)%4<2?[30,30,38]:[96,96,108];
  return mt('pavement',c); }
{ const s=GSK.s, WL=GSK.WL;
  const QD={wood:[176,116,80],woodDark:[136,82,68],post:[112,56,54],panel:[198,148,92],panelDark:[164,114,80],
    roof:[92,58,72],roofDark:[64,42,60],roofLight:[138,80,76],roofLit:[206,118,88],
    blue:[58,88,128],blueDark:[44,66,104],blueLight:[86,124,152],ochre:[208,152,82],teal:[80,120,124],tealDark:[56,90,102],tealLight:[114,154,152],
    warm:[[255,204,108],[250,160,84]],pink:[[248,152,132],[236,120,126]],drape:[[214,118,126],[176,86,110]],soil:[52,42,40],edge:[118,110,118],
    leaf:[[22,44,40],[34,66,52],[54,94,64],[96,136,86]],bloom:[[226,104,140],[252,170,182]]};
  const lit=c=>Object.assign([...c],{e:1});
  const tone=(c,k)=>!c?null:c.e||k===1?c:[Math.round(c[0]*k),Math.round(c[1]*k),Math.round(c[2]*k)];
  const mix=(a,b,t)=>[Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),Math.round(a[2]+(b[2]-a[2])*t)];
  const shade=(c,k)=>[Math.round(c[0]*k),Math.round(c[1]*k),Math.round(c[2]*k)];
  const H2=(a,b)=>Math.floor(hash(a,b,0)*4294967296);
  const GPUT=(PN,bs,o2)=>{ PNAME=PN; return prop(bs,o2&&o2.extra,o2&&o2.o); };
  function kbox(o,u0,v0,u1,v1,z0,z1,f){ const X=u=>o[0]+u*s, Y=v=>o[1]+v*s, c=f.c||QD.wood;
    const b=sided({x0:X(u0),y0:Y(v0),x1:X(u1),y1:Y(v1),z0,z1,c,foot:f.foot??(z0===0?1:0),nb:f.nb,
      top:f.top?(x,y)=>f.top((x-o[0])/s,(y-o[1])/s):()=>c,
      fs:(nx,ny,x,y,z,k)=>{ const zz=Math.floor(z+z0), g=ny>0?f.fv:nx>0?f.fu:ny<0?f.fb:f.fw;
        const a=ny>0?(x-X(f.au0??u0))*FP:nx>0?(y-Y(v0))*FP:ny<0?(X(f.au1??u1)-x)*FP:(Y(v1)-y)*FP, col=g?g(Math.floor(a),zz):c;
        return col===undefined?tone(c,k):tone(col,k); }});
    return b; }
  function kroof(o,u0,u1,vb,vf,ze,zr,wall,orn){ const n=Math.max(2,Math.round((zr-ze)/5)), vm=(vb+vf)/2, half=(vf-vb)/2, out=[];
    const zs=v=>zr-(zr-ze)*Math.abs(v-vm)/half;
    const tile=(sA,t)=>{ const row=Math.floor(t/5); let c=t%5===0||(sA+row*3)%7===0?QD.roofDark:t%5===1?QD.roofLight:QD.roof; if(t<2)c=QD.roofLit; return c; };
    const end=(v,z)=>{ const d=zs(v)-z; if(d<1)return QD.roofLight; if(d<4)return QD.roofDark; const w=wall&&wall(v,z); return w||shade(QD.roofDark,.6); };
    for(let k=0;k<n;k++){ const d=half*k/n, z0=ze+k*(zr-ze)/n, z1=k===n-1?zr+2:z0+(zr-ze)/n+.5, r=n-1-k;
      out.push(kbox(o,u0,vb+d,u1,vf-d,z0,z1,{c:QD.roof,foot:k?0:1,
        top:(u,v)=>k===n-1?(Math.abs(v-vm)<.06?QD.roofLit:QD.roofLight):tile(Math.floor((u-u0)*32),r*5+1+Math.floor(Math.abs(Math.abs(v-vm)-(half-d-half/n))/(half/n)*3)),
        fv:(a,z)=>tile(a,r*5+Math.min(4,Math.max(0,Math.floor(z1-z)))), fb:(a,z)=>tile(a,r*5+Math.min(4,Math.max(0,Math.floor(z1-z)))),
        fu:(a,z)=>end(vb+d+a/32,z), fw:(a,z)=>end(vf-d-a/32,z)})); }
    if(orn){ for(let q=u0+.35;q<u1-.4;q+=.8)out.push(kbox(o,q-.06,vm-.06,q+.06,vm+.06,zr+2,zr+8,{c:QD.roofDark,foot:0,top:()=>QD.roofLit}));
      for(const [u,du] of [[u0,1],[u1,-1]])for(const v of [vb,vf])for(let j=0;j<3;j++){ const uu=u+du*j*.05, z=ze+j*2+(j>1?1:0);
        out.push(kbox(o,Math.min(uu,uu+du*.08),v-.06,Math.max(uu,uu+du*.08),v+.06,z,z+3,{c:QD.roofDark,foot:0,top:()=>j===2?QD.roofLit:QD.roofDark})); } }
    return out; }
  function klean(o,u0,u1,vw,vo,zw,zo){ const n=Math.max(2,Math.round((zw-zo)/4)), out=[];
    for(let k=0;k<n;k++){ const z0=zo+k*(zw-zo)/n, z1=z0+(zw-zo)/n+.5, v1=vo-(vo-vw)*k/n;
      out.push(kbox(o,u0,vw,u1,v1,z0,z1,{c:QD.roof,foot:k?0:1,top:(u,v)=>(Math.floor((u-u0)*32)+k*3)%7===0?QD.roofDark:k===0&&v1-v<.05?QD.roofLit:QD.roof,
        fv:(a,z)=>k===0?(z1-z<1.2?QD.roofLit:QD.roofDark):(a+k*3)%7===0?QD.roofDark:QD.roofLight,fu:()=>QD.roofDark,fw:()=>QD.roofDark,fb:()=>QD.roofDark})); }
    return out; }
  function onPlane(c,alongX,n){ '@later'; const nv=vwV(alongX?0:n,alongX?n:0); if(nv[0]<=0&&nv[1]<=0)return null;
    const p0=alongX?vw(0,c):vw(c,0), p1=alongX?vw(1,c):vw(c,1), dq=(p1[0]-p1[1])-(p0[0]-p0[1]); if(Math.abs(dq)<1e-9)return null;
    return (sx,sy)=>{ const w=(sx/HW-(p0[0]-p0[1]))/dq, vx=p0[0]+(p1[0]-p0[0])*w, vy=p0[1]+(p1[1]-p0[1])*w; return [w,(vx+vy)*HH-sy]; }; }
  const lifeLit=(p,x,y,z)=>{ const now=performance.now(); if(now-(p.litAt||-1e9)>1000){ p.litAt=now; const env=lightEnv(x-.5,y-.5,x+.5,y+.5,false,0); p.L=env?lightAt(env,x,y,z/24,null).map(v=>Math.max(.12,Math.min(1.1,v))):[1,1,1]; } return p.L; };
  function lifeFace(D,W,Hh,ox,oy,K,o,u0,alongX,c,n,a0,a1,z0,z1,f,L){ '@later'; const at=onPlane(c,alongX,n); if(!at)return; const lo=(alongX?o[0]:o[1])+u0*s;
    const pts=[[a0,z0],[a1,z0],[a0,z1],[a1,z1]].map(([a,z])=>{ const w=lo+a/FP, [vx,vy]=alongX?vw(w,c):vw(c,w); return [(vx-vy)*HW,(vx+vy)*HH-z]; });
    const X0=Math.max(0,Math.floor((Math.min(...pts.map(p=>p[0]))-ox)*K)-1), X1=Math.min(W,Math.ceil((Math.max(...pts.map(p=>p[0]))-ox)*K)+1), Y0=Math.max(0,Math.floor((Math.min(...pts.map(p=>p[1]))-oy)*K)-1), Y1=Math.min(Hh,Math.ceil((Math.max(...pts.map(p=>p[1]))-oy)*K)+1);
    for(let py=Y0;py<Y1;py++)for(let px=X0;px<X1;px++){ const [w,z]=at(ox+(px+.5)/K,oy+(py+.5)/K), a=Math.floor((w-lo)*FP), zz=Math.floor(z); if(a<a0||a>=a1||zz<z0||zz>=z1)continue;
      const col=f(a,zz); if(!col)continue; const i=(py*W+px)*4, m=col.e?[1,1,1]:L; D[i]=Math.min(255,col[0]*m[0]); D[i+1]=Math.min(255,col[1]*m[1]); D[i+2]=Math.min(255,col[2]*m[2]); D[i+3]=255; } }

  function shopGround(o,w){ const bs=[kbox(o,w?.6:4,.2,w?4:7.4,WL,0,84,{c:QD.wood,au0:.6,au1:7.4,
      fv:(a,z)=>{ '@later'; if(a>=99&&a<138&&z<72)return z>=70||a<101||a>=136?QD.post:mix([40,28,54],[74,46,62],z/70);
        if(a<3||a>=215||Math.abs(a-93)<2||Math.abs(a-144)<2||z>=80)return QD.post;
        if(a>=10&&a<90&&z<12)return a===10||a===89||z===11||a%20===10?QD.panelDark:QD.panel;
        return z>64?(a%8===0?shade(QD.woodDark,.8):shade(QD.woodDark,.94)):a%8===0?QD.woodDark:H2(a,z>>3)%9===0?shade(QD.wood,.93):QD.wood; },
      fu:(a,z)=>a%8===0||z>80||z===40?QD.woodDark:QD.wood, fw:(a,z)=>a%8===0||z>80||z===40?QD.woodDark:QD.wood,
      fb:(a,z)=>a<3||a>=215||z>=80?QD.post:a>=150&&a<178&&z>=30&&z<52?(a<152||a>=176||z<32||z>=50?QD.post:[60,44,62]):a%8===0?QD.woodDark:QD.wood,
      top:(u,v)=>(u<1.4||u>6.6)&&v<WL?(Math.floor(v*32)%5===0?QD.roofDark:QD.roof):QD.roof})];
    return GPUT('ghost street shop',bs); }
  const DSEQ=[0,1,2,1,0,0,3,2,1,0,1,2,3,0];
  const winCol=(a,z,f)=>{ '@later'; const sway=[0,1,2,1][f], lt=[0,.06,.1,.03][f], g=mix(QD.warm[1],QD.warm[0],Math.min(1,(z-106)/34+lt));
    if(a===32||a===33)return QD.post; const hem=109+((a+sway)%5===0?2:0), dr=a>=3&&a<17+sway||a>=36+(sway>>1)&&a<55+sway;
    return lit(dr&&z>hem?((a+sway)%4===0?mix(QD.drape[1],g,.25):mix(QD.drape[0],g,.3)):g); };
  function shopUpper(o){ const bs=[kbox(o,1.4,.3,6.6,WL,84,158,{c:QD.wood,foot:1,
      fv:(a,z)=>{ '@later'; if(a<3||a>=163||Math.abs(a-85)<2||z<88||z>=154)return QD.post;
        if(a>=10&&a<80&&z>=104&&z<146)return a<12||a>=78||z<106||z>=144?QD.post:winCol(a-12,z,0);
        if(a>=92&&a<156&&z>=104&&z<146){ if(a<94||a>=154||z<106||z>=144)return QD.post; const dx=a-124, dz=z-125, r=Math.hypot(dx,dz);
          return r<12&&r>3&&Math.abs(Math.cos(Math.atan2(dz,dx)*2.5))>.55||a%16===0?[190,140,92]:[212,164,104]; }
        return z<104?(a%21===3||z===103?QD.panelDark:QD.panel):z>146?shade(QD.woodDark,.85):a%8===0?QD.woodDark:QD.wood; },
      fu:(a,z)=>a%8===0||z===158?QD.woodDark:QD.wood, fw:(a,z)=>a%8===0?QD.woodDark:QD.wood,
      fb:(a,z)=>a<3||a>=163||z<88||z>=154?QD.post:a>=60&&a<106&&z>=108&&z<140?(a<62||a>=104||z<110||z>=138||a===83?QD.post:[70,52,70]):a%8===0?QD.woodDark:QD.wood})];
    const p=GPUT('ghost street shop, upstairs',bs,{o:{lifeK:2,hang:84,walk:true}});
    p.lifeDraw=(D,W,Hh,ox,oy,t,K=1)=>{ const f=DSEQ[Math.floor(t*3)%DSEQ.length]; lifeFace(D,W,Hh,ox,oy,K,o,1.4,true,o[1]+WL*s,1,12,78,106,144,(a,z)=>winCol(a-12,z,f),[1,1,1]); };
    LAMPS.push({x:o[0]+2.84*s,y:o[1]+WL*s+.35,z:125,r:3.2,c:[1,.66,.34],prop:p}); return p; }
  function shopRoof(o){ const wall=(v,z)=>Math.abs(v-1.75)<1.45*(1-(z-210)/49)&&z>=210&&z<259?(Math.floor(v*32)%8===0||z===210?QD.woodDark:QD.wood):null;
    return GPUT('ghost street shop roof',kroof(o,.9,7.1,-.45,3.95,208,261,wall,true),{o:{walk:true,hang:208}}); }
  const FANC=(a,z,f)=>{ '@later'; const d=Math.hypot(a-30.5,z-89.5); if(d<11){ if(d>9.5)return QD.blueLight; if(d<2)return QD.blue; const th=Math.atan2(z-89.5,a-30.5)+f*Math.PI/9;
      return((th%(Math.PI/3))+Math.PI/3)%(Math.PI/3)<.36?QD.blue:[24,28,50]; } return a<17&&a>2&&z%4===2&&z>80?(z>94&&a<12?QD.ochre:QD.blueDark):undefined; };
  function shopEave(o){ const bs=klean(o,.3,7.7,WL,3.8,84,72);
    bs.push(kbox(o,2.3,3.4,2.38,3.5,78,84,{c:QD.blueDark,foot:0}),kbox(o,4.0,3.4,4.08,3.5,78,84,{c:QD.blueDark,foot:0}));
    bs.push(kbox(o,2.0,3.48,4.375,3.52,82,108,{c:QD.blue,foot:0,top:()=>QD.blueDark,fb:()=>QD.blueDark,fu:()=>QD.blueDark,fw:()=>QD.blueDark,
      fv:(a,z)=>{ '@later'; if(a<2||a>=74||z<84||z>=106)return QD.blueDark; const dx=a-19, dz=z-95, r=Math.hypot(dx,dz);
        if(r<10)return r<2?QD.blue:Math.abs(Math.cos(Math.atan2(dz,dx)*3))>.42||r<4?QD.ochre:QD.blue;
        const m=a-36, y=105-z; return m>=0&&m<14&&(y===4||y===12||m===6&&y>2&&y<18||y>12&&(m===2||m===11)||y===17&&m>1&&m<12)||m>=19&&m<33&&(y===6||m===26&&y>2&&y<19||y>8&&y<16&&(m===21||m===31)||y===15&&m>20&&m<32)?QD.ochre:(a+z)%9===0?QD.blueLight:QD.blue; }}));
    bs.push(kbox(o,4.9,3.3,6.3,3.75,76,104,{c:QD.blue,foot:0,top:()=>QD.blueLight,fu:()=>QD.blueDark,fv:(a,z)=>FANC(a,z,0)}));
    const p=GPUT('ghost street eave',bs,{o:{walk:true,lifeK:2,hang:72}});
    p.lifeDraw=(D,W,Hh,ox,oy,t,K=1)=>{ const f=Math.floor(t*10)%3, L=lifeLit(p,o[0]+5.6*s,o[1]+3.75*s,90); lifeFace(D,W,Hh,ox,oy,K,o,4.9,true,o[1]+3.75*s,1,19,42,78,101,(a,z)=>{ const d=Math.hypot(a-30.5,z-89.5); return d<9.5?FANC(a,z,f):null; },L); };
    return p; }
  function bayWindow(o){ const glass=(a,z,w)=>{ if(a<2||a>=w-2||z<14||z>=52||a%18===0||a%18===1||z===33)return QD.post; const g=mix(QD.pink[1],QD.pink[0],(z-14)/38);
      return lit(z<30&&foNoise(a/5,z/6,4)>.56?mix(g,[200,96,116],.6):(a+z)%23===0?mix(g,[255,220,200],.5):g); };
    const bs=[kbox(o,1.0,WL,3.3,3.62,12,54,{c:QD.post,foot:1,fv:(a,z)=>glass(a,z,74),fu:(a,z)=>a<2||a>=11||z<14||z>=52?QD.post:lit(mix(QD.pink[1],QD.pink[0],(z-14)/50)),fw:(a,z)=>a<2||a>=11||z<14||z>=52?QD.post:lit(mix(QD.pink[1],QD.pink[0],(z-14)/50))}),
      ...klean(o,.85,3.45,WL,3.95,62,53)];
    const p=GPUT('ghost street bay window',bs); LAMPS.push({x:o[0]+2.15*s,y:o[1]+3.62*s+.3,z:33,r:2.6,c:[1,.5,.52],prop:p}); return p; }
  const NZ=18, NOREN=(a,z,f)=>{ z-=NZ; const sq=Math.floor(a/8), q=a%8, hem=39+((sq+f)%4===0?1:0)+((sq*3+f)%5===0?1:0);
    if(z>=53&&z<55)return QD.post; if(z<hem||z>=53||q===7&&z<50)return null; return q>1&&q<5&&z>43&&z<48?[150,172,214]:q===0?QD.blueDark:[62,86,142]; };
  function doorCurtain(o){ const short=(a,z)=>z-NZ<41?null:NOREN(a,z,1);
    const bs=[kbox(o,3.7,3.22,4.9,3.25,36+NZ,56+NZ,{c:[62,86,142],foot:1,nb:1,top:()=>QD.post,fv:short,fb:(a,z)=>short(37-a,z),fu:()=>null,fw:()=>null})];
    const p=GPUT('door curtain',bs,{o:{walk:true,lifeK:2,hang:36+NZ}});
    p.lifeDraw=(D,W,Hh,ox,oy,t,K=1)=>{ const f=Math.floor(t*12/5)%4, L=lifeLit(p,o[0]+4.3*s,o[1]+3.3*s,40+NZ); lifeFace(D,W,Hh,ox,oy,K,o,3.7,true,o[1]+3.25*s,1,0,38,36+NZ,42+NZ,(a,z)=>NOREN(a,z,f),L); };
    return p; }
  function drinksMachine(o){ const COLS=[[230,80,90],[70,130,220],[70,180,130],[246,190,80],[236,120,190],[150,110,220]];
    const bs=[kbox(o,5.3,3.25,6.65,3.85,0,60,{c:QD.teal,top:()=>QD.tealLight,
      fv:(a,z)=>{ '@later'; if(a>=13&&a<40&&z>=20&&z<56){ if(a===13||a===39||z===20||z===55)return QD.tealDark; const sh2=(z-21)%9, k=Math.floor((a-15)/6), q=(a-15)%6;
          if(sh2===0)return lit([170,176,206]); if(sh2>0&&sh2<8&&q>0&&q<5&&k<4)return lit(sh2===7?[250,250,255]:COLS[H2(k,Math.floor((z-21)/9))%6]); return lit([222,206,242]); }
        if(a>=3&&a<11){ if(z>=44&&z<50)return[34,52,78]; if(z>=26&&z<33&&a>3&&a<10)return lit([236,100,100]); if(z===38||z===40)return QD.tealDark; }
        if(a>=5&&a<39&&z>=4&&z<15)return z===14||a===5||a===38?QD.tealDark:[44,72,108];
        return a===0||a===42||z===0?QD.tealDark:QD.teal; },
      fu:(a,z)=>z<60&&z>40&&z%3===0&&a>3&&a<16?shade(QD.tealDark,.8):QD.teal, fw:()=>QD.teal, fb:(a,z)=>z>40&&z<56&&z%3===0&&a>4&&a<38?QD.tealDark:QD.teal})];
    const p=GPUT('drinks machine',bs); LAMPS.push({x:o[0]+5.98*s,y:o[1]+3.85*s+.3,z:38,r:2.2,c:[.78,.72,1],prop:p}); return p; }
  function bed(o,u0,v0,u1,v1,lanterns,seed){ const X=u=>o[0]+u*s, Y=v=>o[1]+v*s, R=rng32(seed), n=Math.max(3,Math.round((u1-u0+v1-v0)*2.4)), along=u1-u0>v1-v0;
    const leaves=[]; for(let i=0;i<n;i++){ const t=(i+.5)/n, u=u0+.25+(u1-u0-.5)*(along?t:R()), v=v0+.2+(v1-v0-.4)*(along?R():t); leaves.push([u,v,12+R()*6,8+R()*5,Math.floor(R()*999),[0,1,2,3,4].map(()=>[(R()-.5)*20,6+R()*10])]); }
    const box=kbox(o,u0,v0,u1,v1,0,5,{c:QD.edge,top:()=>QD.soil});
    const r=Math.hypot(u1-u0,v1-v0)*s/2+.6, cx=X((u0+u1)/2), cy=Y((v0+v1)/2);
    const p=GPUT('planted bed',[box],{extra:{bounds:{x0:cx-r,y0:cy-r,x1:cx+r,y1:cy+r,z0:0,z1:40},paint(L){ for(const [u,v,rx,ry,sd,bl] of leaves){ const [px,py]=edPt(X(u),Y(v)), [sx,sy]=toS(...vw(px,py)), bx=Math.round(sx), by=Math.round(sy-8);
          const P={put:(X2,Y2,c)=>L.put(X2,Y2,c,1e9,[px,py,Math.max(5,by-Y2+8),1])}; foBlob(P,bx,by-5,rx,ry,QD.leaf,sd);
          for(const [dx,dy] of bl){ const qx=Math.round(bx+dx), qy=Math.round(by-dy); P.put(qx,qy,QD.bloom[1]); P.put(qx+1,qy,QD.bloom[0]); P.put(qx,qy+1,QD.bloom[0]); } }
        for(const [u,v] of lanterns){ const [px,py]=edPt(X(u),Y(v)), [sx,sy]=toS(...vw(px,py)), cx2=Math.round(sx), cy2=Math.round(sy-14);
          for(let y=-5;y<=5;y++)for(let x=-5;x<=5;x++)if(x*x+y*y<=27)L.put(cx2+x,cy2+y,lit(y===-2||y===2?[255,232,176]:y===0?[255,250,236]:[255,164,160]),1e9,[px,py,14-y,1]); } }},o:{noLine:true}});
    for(const [u,v] of lanterns)LAMPS.push({x:X(u),y:Y(v),z:14,r:1.8,c:[1,.62,.6],prop:p}); return p; }
  function rowHouse(o,u0,v0,u1,v1,wh,rh,seed){ '@later'; const lu=Math.round((u1-u0)*32);
    const face=(a,z,L)=>{ if(z>=wh)return null; const win=a%48>12&&a%48<34&&z>34&&z<70;
      return win?(H2(Math.floor(a/48),seed)%5<2?lit(QD.warm[0]):[84,58,78]):a<2||a>=L-2||z>=wh-3||a%48===4?QD.post:a%8===0||z>wh-9?QD.woodDark:QD.wood; };
    const end=(a,z)=>a%8===0||z===wh?QD.woodDark:QD.wood;
    const bs=[kbox(o,u0,v0,u1,v1,0,wh,{c:QD.wood,fv:(a,z)=>face(a,z,lu),fb:(a,z)=>face(a,z,lu),fu:end,fw:end})];
    const half=(v1-v0)/2+.35, vm=(v0+v1)/2, wall=(v,z)=>Math.abs(v-vm)<(v1-v0)/2*(1-(z-wh)/rh)&&z>=wh?(Math.floor(v*32)%8===0?QD.woodDark:QD.wood):null;
    bs.push(...kroof(o,u0-.35,u1+.35,vm-half,vm+half,wh-5,wh+rh,wall,false));
    const p=GPUT('wooden row house',bs); for(let a=12;a<lu-12;a+=48)if(H2(Math.floor(a/48),seed)%5<2)LAMPS.push({x:o[0]+(u0+(a+11)/32)*s,y:o[1]+v1*s+.3,z:52,r:2,c:[1,.7,.4],prop:p});
    return p; }
  function pole(o,u,v,to){ '@later'; const X=u2=>o[0]+u2*s, Y=v2=>o[1]+v2*s, H=168, PD=[86,58,48];
    const bs=[kbox(o,u-.07,v-.07,u+.07,v+.07,0,H,{c:PD,top:()=>shade(PD,1.1)}),kbox(o,u-.6,v-.05,u+.6,v+.05,H-14,H-9,{c:PD,foot:0}),
      ...[-.5,.5].map(d=>kbox(o,u+d-.03,v-.03,u+d+.03,v+.03,H-9,H-5,{c:[200,200,190],foot:0}))];
    const ends=[[u-.5,v,H-5],[u+.5,v,H-5]], wires=to.map(([u2,v2,z2],i)=>[ends[i%2],[u2,v2,z2]]);
    const xs=[u,...to.map(t=>t[0])].map(X), ys=[v,...to.map(t=>t[1])].map(Y), b={x0:Math.min(...xs)-.5,y0:Math.min(...ys)-.5,x1:Math.max(...xs)+.5,y1:Math.max(...ys)+.5,z0:0,z1:H+4};
    return GPUT('utility pole',bs,{extra:{bounds:b,paint(L){ for(const [a,c] of wires){ const [ax,ay]=edPt(X(a[0]),Y(a[1])), [cx,cy]=edPt(X(c[0]),Y(c[1])), n=Math.ceil(Math.hypot(cx-ax,cy-ay)*40);
          for(let k=0;k<=n;k++){ const t=k/n, x=ax+(cx-ax)*t, y=ay+(cy-ay)*t, z=a[2]+(c[2]-a[2])*t-Math.sin(Math.PI*t)*14, [sx,sy]=toS(...vw(x,y)); L.put(Math.round(sx),Math.round(sy-z),[40,32,40],x+y,[x,y,z,1]); } } }}}); }

  const at=(u0,v0,u1,v1,mk)=>(x,y)=>mk([x-(u0+u1)/2*s,y-(v0+v1)/2*s]);
  const PIECES={'ghost street shop':[.6,.2,4,WL,o=>shopGround(o,true)],'ghost street shop, east end':[4,.2,7.4,WL,o=>shopGround(o,false)],'ghost street shop, upstairs':[1.4,.3,6.6,WL,shopUpper],'ghost street shop roof':[.9,-.45,7.1,3.95,shopRoof],
    'ghost street eave':[.3,WL,7.7,3.8,shopEave],'ghost street bay window':[1.0,WL,3.3,3.62,bayWindow],'door curtain':[3.7,3.22,4.9,3.25,doorCurtain],
    'drinks machine':[5.3,3.25,6.65,3.85,drinksMachine],
    'planted bed with lanterns':[.9,4.15,3.1,4.8,o=>bed(o,.9,4.15,3.1,4.8,[[1.5,4.5],[2.5,4.4]],11)],'long planted bed':[.35,5.4,1.1,8.3,o=>bed(o,.35,5.4,1.1,8.3,[[.7,6.9]],12)],
    'small planted bed':[6.95,3.3,7.6,4.0,o=>bed(o,6.95,3.3,7.6,4.0,[],13)],
    'wooden row house':[7.55,.3,12.6,3.1,o=>rowHouse(o,7.55,.3,12.6,3.1,92,44,7)],'wooden row house, narrow':[-3.5,.3,.45,3.1,o=>rowHouse(o,-3.5,.3,.45,3.1,96,44,5)],
    'utility pole':[9.33,8.53,9.47,8.67,o=>pole(o,9.4,8.6,[[7.4,3.9,150],[12.6,2.6,100]])]};
  for(const k in PIECES){ const [u0,v0,u1,v1,mk]=PIECES[k]; CATALOG[k]=at(u0,v0,u1,v1,mk); KIND_OF[k]=k; }
  if(!CAT_DEPTS.some(d=>d[0]==='ghoststreet'))CAT_DEPTS.push(['ghoststreet','Ghost Street']);
  const info=(no,name,price,desc,mat)=>({no,name,dept:'ghoststreet',price,desc,mat});
  Object.assign(CAT_INFO,{'ghost street shop':info('GS-101','Wooden Shop, Ground Floor',22000,'Plank front, a doorway, panels under the bay.','cedar, cypress'),
    'ghost street shop, east end':info('GS-114','Wooden Shop, Ground Floor East',16000,'The rest of the plank front and the doorway.','cedar, cypress'),
    'ghost street shop, upstairs':info('GS-102','Wooden Shop, Upper Floor',26000,'A lit window with drapes, a shutter with a faded flower.','cedar, paper'),
    'ghost street shop roof':info('GS-103','Tiled Roof',14000,'Clay tiles, a ridge of ornaments, corners turned up.','fired clay'),
    'ghost street eave':info('GS-104','Shop Eave with Sign',3200,'A low tiled eave, a blue sign, a cooler whose fan turns.','clay, steel, wood'),
    'ghost street bay window':info('GS-105','Bay Window',2400,'Pink-lit panes in a wooden frame.','wood, glass'),
    'door curtain':info('GS-106','Door Curtain',85,'Five blue strips over a doorway. They stir.','cotton'),
    'drinks machine':info('GS-107','Drinks Machine',4200,'A teal machine, its window of bottles lit.','steel, glass'),
    'planted bed with lanterns':info('GS-108','Planted Bed with Lanterns',340,'Dark leaves, pink blossom, two paper lanterns.','stone, living, paper'),
    'long planted bed':info('GS-109','Long Planted Bed',380,'Dark leaves, pink blossom, a paper lantern.','stone, living, paper'),
    'small planted bed':info('GS-110','Small Planted Bed',120,'Dark leaves and pink blossom in a stone edge.','stone, living'),
    'wooden row house':info('GS-111','Wooden Row House',160000,'Planks, a tiled roof, some windows lit.','cedar, clay'),
    'wooden row house, narrow':info('GS-112','Narrow Row House',120000,'A narrower one of the row.','cedar, clay'),
    'utility pole':info('GS-113','Utility Pole',1800,'A wooden pole, a crossbar, its wires.','wood, copper')});
  PRESETS['Preset Ghost Street 1']=Object.keys(PIECES).map(k=>{ const [u0,v0,u1,v1]=PIECES[k]; return [k,+(((u0+u1)/2+3.5)*s).toFixed(3),+(((v0+v1)/2+.45)*s).toFixed(3),0]; }); }

GHOSTK={GSK,gsFloor};
}

{
