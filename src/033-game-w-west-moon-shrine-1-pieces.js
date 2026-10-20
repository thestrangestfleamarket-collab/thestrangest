const MSP={stone:[122,124,104],stoneD:[86,90,76],stoneL:[150,150,126],moss:[78,112,46],mossL:[118,150,58],mossD:[44,70,34],grass:[86,128,52],
  wood:[148,56,36],woodD:[96,34,24],woodL:[176,78,48],black:[30,26,26],paper:[255,206,128],paperD:[214,140,70],pink:[238,150,182],pinkL:[252,204,220],
  pinkD:[176,88,120],water:[40,170,170],waterL:[120,236,214],waterD:[16,96,108],statue:[138,146,126],statueD:[88,96,84],gold:[236,206,120],
  rock:[116,122,108],rockD:[76,82,74],fern:[38,74,44],fernL:[70,112,58],cope:[150,146,136]};
const msMix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t], msCl=(x,a=0,b=1)=>x<a?a:x>b?b:x;
function msVn(x,y,s=0){ const i=Math.floor(x), j=Math.floor(y), fx=x-i, fy=y-j, u=fx*fx*(3-2*fx), v=fy*fy*(3-2*fy);
  const a=hash(i,j,s), b=hash(i+1,j,s), c=hash(i,j+1,s), d=hash(i+1,j+1,s); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; }
const msFbm=(x,y,s=0)=>msVn(x,y,s)*.55+msVn(x*2.1,y*2.1,s+7)*.28+msVn(x*4.3,y*4.3,s+13)*.17;
const msRound=c=>[Math.round(c[0]),Math.round(c[1]),Math.round(c[2])];
function msFlag(u,v){ '@later'; const row=Math.floor(v/.52), s0=hash(row,3)*.6, col=Math.floor((u+s0)/.68), fu=(u+s0)/.68-col, fv=v/.52-row, mo=msFbm(u*1.7,v*1.7,5);
  if(Math.min(fu,1-fu)*.68<.035||Math.min(fv,1-fv)*.52<.035)return mo>.42?sh(MSP.mossD,.9+hash(u*40,v*40)*.2):sh(MSP.stoneD,.6);
  let c=sh(msMix(MSP.stone,MSP.stoneL,hash(col,row,9)*.6),.86+hash(col,row,4)*.24); if(Math.min(fu,1-fu,fv,1-fv)<.08)c=sh(c,.9);
  if(msFbm(u*6,v*6,2)>.66)c=sh(c,.82); if(Math.abs(msVn(u*5+col,v*5,8)-.5)<.012)c=sh(c,.6);
  if(mo>.56)c=msMix(c,hash(u*48,v*48,1)>.7?MSP.mossL:MSP.moss,msCl((mo-.56)*6)); return c; }
function msBlock(a,z,top){ '@later'; const row=Math.floor((top-z)/10), sa=a+hash(row,5)*.4, bi=Math.floor(sa/.62), fa=sa/.62-bi, fz=(top-z)/10-row;
  let c=msMix(MSP.stoneD,MSP.stone,hash(bi,row,2)*.7+.15); if(Math.min(fa,1-fa)*.62*24<.7||Math.min(fz,1-fz)*10<.8)c=sh(MSP.stoneD,.55);
  const mo=msFbm(a*2,z/22,11)+(top-z<5?.3:0)-(top-z)/90; if(mo>.55)c=msMix(c,hash(a*40,z,3)>.6?MSP.mossL:MSP.moss,msCl((mo-.55)*5));
  if(msVn(a*9,z/6,4)>.8)c=sh(c,.78); return c; }
const msStone=(x0,y0,x1,y1,z0,z1,o={})=>sided({x0,y0,x1,y1,z0,z1,c:MSP.stone,foot:1,...o,fs:o.fs||((nx,ny,X,Y,zr,k)=>sh(msBlock(nx?Y:X,zr,z1-z0),k*1.2)),top:o.top||((X,Y)=>msFlag(X-x0,Y-y0))});
function msLathe(cx,cy,z0,z1,rf,col,dz=2,dw=.035){ '@later'; const out=[];
  for(let z=z0;z<z1-1e-9;z+=dz){ const za=z, zb=Math.min(z1,z+dz), r=rf((za+zb)/2-z0); if(!(r>.004))continue; const n=Math.max(1,Math.round(2*r/dw)), w=2*r/n;
    for(let i=0;i<n;i++){ const xa=cx-r+i*w, xm=xa+w/2-cx, hy=Math.sqrt(Math.max(0,r*r-xm*xm)); if(hy<w*.3)continue;
      out.push(sided({x0:xa,y0:cy-hy,x1:xa+w,y1:cy+hy,z0:za,z1:zb,c:MSP.stone,foot:za===z0?1:0,nb:1,
        fs:(nx,ny,X,Y,zr)=>col(X-cx,Y-cy,za+zr-z0,(X-cx)/r,(Y-cy)/r,0),top:(X,Y)=>col(X-cx,Y-cy,zb-z0,(X-cx)/r*.6,(Y-cy)/r*.6,1)})); } }
  return out; }
const msShade=(c,nx,ny,top)=>sh(c,top?1:.72+.28*msCl(.5-.5*nx*.6+.5*ny*.5));
const msEll=(cx,cy,zc,rx,rz,col)=>msLathe(cx,cy,zc-rz,zc+rz,z=>{ const t=(z-rz)/rz; return rx*Math.sqrt(Math.max(0,1-t*t)); },col);
let MST=0;
const msFlick=k=>.86+.14*Math.sin(MST*7.3+k*1.7)*Math.sin(MST*3.1+k);
const msLife=(p,k)=>{ p.life=t=>{ MST=t; }; p.lifeKey=()=>Math.floor(MST*8)%16; p.fl=k; return p; };
const msPut=(name,bs,o={})=>{ PNAME=name; return prop(bs,null,{fine:true,...o}); };
const msLamp=(l,p)=>Object.defineProperty(Object.assign(l,{own:1,day:true,prop:p}),'up',{get(){ return this.z-lc('lamps','height'); },enumerable:true});
function msTerrace(x,y,z0=0){ return msPut('stone terrace',[msStone(x,y,x+5.56,y+5.38,z0,z0+26)]); }
function msSteps(x,y,z0=0){ '@later'; const sw=[msStone(x-.25,y,x,y+1.2,z0,z0+23),msStone(x+2.4,y,x+2.65,y+1.2,z0,z0+23)];
  return msPut('mossy steps',[msStone(x,y,x+2.4,y+.6,z0,z0+19),msStone(x,y+.6,x+2.4,y+1.2,z0,z0+12),...sw],{solids:sw,stands:[{x0:x,y0:y,x1:x+2.4,y1:y+.6,z:z0+19},{x0:x,y0:y+.6,x1:x+2.4,y1:y+1.2,z:z0+12}]}); }
function msPlaza(x,y,z0=0){ '@later'; const cx=2.78, cy=2.8; return msPut('spiral stone plaza',[msStone(x,y,x+5.56,y+5.6,z0,z0+5,{top:(X,Y)=>{ const u=X-x, v=Y-y, du=u-cx, dv=v-cy, r=Math.hypot(du,dv);
  if(r<1.55){ const th=Math.atan2(dv,du), g=(((r/.2-th/(2*Math.PI))%1)+1)%1; let c=msMix(MSP.stone,MSP.stoneL,.45+hash(Math.floor(r*8),Math.floor(th*6),3)*.25);
    if(r>1.42)c=sh(MSP.stoneD,.8); else if(r>1.32)c=msMix(MSP.stone,MSP.stoneL,.5); else if(g<.16)c=sh(MSP.stoneD,.66); else if(g<.24)c=sh(MSP.stoneL,1.05);
    if(msFbm(u*3,v*3,6)>.62)c=msMix(c,MSP.moss,.55); return c; }
  return msFlag(u,v); }})],{flat:false,walk:true,stands:[{x0:x,y0:y,x1:x+5.56,y1:y+5.6,z:z0+5}]}); }
function msPlinth(x,y,z0=0){ '@later'; return msPut('statue plinth',[...msLathe(x,y,z0,z0+8,()=>1.02,(dx,dy,z,nx,ny,top)=>msShade(top?msFlag(dx,dy):msBlock(Math.atan2(dy,dx)*1.02,z,8),nx,ny,top)),
  ...msLathe(x,y,z0+8,z0+18,z=>.82+z*.012,(dx,dy,z,nx,ny,top)=>{ const th=Math.atan2(dy,dx), pe=(((th/(2*Math.PI))*16)%1+1)%1;
    let c=msMix(MSP.statueD,MSP.statue,.7); if(Math.abs(pe-.5)*2>1-z/12)c=sh(c,.72); else c=msMix(c,MSP.stoneL,.25); return msShade(c,nx,ny,top); })]); }
function msStatueCol(dx,dy,z,nx,ny,top,head){ '@later'; const th=Math.atan2(dy,dx);
  let c=msMix(MSP.statueD,MSP.statue,.55+.45*Math.sin(th*11+z*.06+msVn(z/10,th,2)*2)*.5+.2);
  if(z>8&&z<50&&Math.abs(((z+Math.sin(th*3)*4)%13)-6.5)<.5)c=sh(c,.8);
  if(msFbm(dx*4+z/30,dy*4,12)>.7&&(top||z<40))c=msMix(c,MSP.moss,.5); if(msVn(dx*20,z/4,7)>.84)c=sh(c,.7);
  if(head&&ny>.55){ const dz=z-head, du=dx*32; if(Math.abs(dz-2)<.6&&Math.abs(Math.abs(du)-2.4)<1.6)c=sh(c,.6); if(Math.abs(du)<.6&&dz<1&&dz>-4)c=sh(c,.82); if(Math.abs(dz+6.5)<.5&&Math.abs(du)<1.5)c=sh(c,.65); }
  return msShade(c,nx,ny,top); }
function msStatue(x,y,z0=0){ '@later'; const S0=z0, col=(ox,oy,hd)=>(dx,dy,z,nx,ny,top)=>msStatueCol(dx+ox,dy+oy,z,nx,ny,top,hd);
  const bs=[...msLathe(x,y,S0,S0+8,()=>.48,col(0,0)),...msLathe(x,y,S0+8,S0+50,z=>.44-z*.0033,col(0,0)),
    ...msEll(x,y,S0+58,.3,14,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+44,nx,ny,top)),...msEll(x,y,S0+71,.42,8,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+63,nx,ny,top)),
    ...msEll(x-.37,y+.06,S0+52,.14,24,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+28,nx,ny,top)),...msEll(x+.37,y+.06,S0+52,.14,24,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+28,nx,ny,top)),
    ...msEll(x+.4,y+.16,S0+62,.1,12,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+50,nx,ny,top)),...msEll(x+.45,y+.27,S0+50,.07,6,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+44,nx,ny,top)),
    ...msEll(x-.25,y+.2,S0+64,.12,8,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+56,nx,ny,top)),...msEll(x-.14,y+.29,S0+65,.07,5,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+60,nx,ny,top)),
    ...msEll(x,y-.1,S0+84,.21,22,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+62,nx,ny,top)),
    ...msLathe(x,y+.02,S0+76,S0+82,()=>.085,col(0,0)),...msEll(x,y+.05,S0+91,.17,13,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy-.0,z+78,nx,ny,top,91)),
    ...msLathe(x,y+.02,S0+100,S0+106,z=>.16-z*.004,col(0,0)),...msLathe(x,y+.02,S0+106,S0+118,z=>.14-z*.0075,col(0,0)),
    ...msLathe(x+.48,y+.28,S0+10,S0+102,()=>.032,()=>[56,40,34]),...msEll(x+.48,y+.28,S0+106,.07,7,col(0,0)),
    sided({x0:x-.9,y0:y-.34,x1:x+.9,y1:y-.32,z0:S0+60,z1:S0+124,c:MSP.gold,em:1,life:1,fs:(nx,ny,X,Y,zr)=>{
      if(!ny)return null; const d=Math.hypot((X-x)*32,zr-32); const f=LIFE.mode===1?.85+.15*Math.sin(MST*1.4):1;
      if(Math.abs(d-26)<.9)return msRound(sh(MSP.gold,f)); if(Math.abs(d-22)<.35&&hash(Math.floor(Math.atan2(zr-32,X-x)*40),1)>.3)return msRound(sh(MSP.gold,.8*f)); return null; },top:()=>null})];
  const p=msPut('moon shrine statue',bs); LAMPS.push(msLamp({x,y:y-.2,z:S0+92,r:2.2,c:[1,.85,.5]},p)); return msLife(p,20); }
function msPaperFace(k,round,z0,z1){ return (nx,ny,X,Y,zr)=>{ const h=z1-z0; if(zr<1.5||zr>h-1.5)return MSP.black;
  const f=LIFE.mode===1?msFlick(k):1; if(zr%6<.8)return msRound(sh(MSP.paperD,f)); return msRound(sh(msMix(MSP.paperD,MSP.paper,1-Math.abs(zr/h-.5)*.7),f)); }; }
function msGate(x,y,z0=0){ '@later'; const wood=(nx,ny,X,Y,zr,k,post)=>{ const a=nx?Y:X; let c=msMix(MSP.wood,MSP.woodL,msVn(a*30,zr/3,2)*.4); if(msVn(a*10,zr/12,9)>.72)c=msMix(c,MSP.woodD,.7); return sh(c,k*1.25); };
  const top=(X,Y)=>{ const c=msMix(MSP.woodD,MSP.wood,.5); return msFbm(X*5,Y*5,4)>.45?msMix(c,hash(X*50,Y*50)>.6?MSP.mossL:MSP.moss,.85):c; };
  const beam=(x0,y0,x1,y1,za,zb)=>sided({x0,y0,x1,y1,z0:z0+za,z1:z0+zb,c:MSP.wood,fs:wood,top});
  const post=px=>msLathe(px,y,z0,z0+122,z=>z<10?.17:.15-z*.00016,(dx,dy,z,nx,ny,tp)=>{ if(z<10)return msShade(MSP.black,nx,ny,tp);
    const th=Math.atan2(dy,dx), s=(((th/(2*Math.PI)+z/46+msVn(z/14,px,3)*.3)%1)+1)%1; let c=msMix(MSP.wood,MSP.woodL,msVn(th*3,z/3,2)*.4);
    if(Math.abs(s-.5)<.07&&z<110)c=hash(Math.floor(z),Math.floor(th*8),5)>.55?MSP.mossL:MSP.moss; else if(Math.abs(s-.5)<.16&&hash(Math.floor(z/3),Math.floor(th*10),7)>.82&&z<116)c=MSP.grass;
    return msShade(c,nx,ny,tp); },2,.04);
  const ls=[], bs=[...post(x-1.75),...post(x+1.75),beam(x-2.05,y-.1,x+2.05,y+.1,88,98),beam(x-2.25,y-.15,x+2.25,y+.15,110,120),beam(x-2.55,y-.2,x+2.55,y+.2,120,130),
    beam(x-2.72,y-.2,x-2.3,y+.2,126,136),beam(x+2.3,y-.2,x+2.72,y+.2,126,136),beam(x-.12,y-.07,x+.12,y+.07,98,110)];
  for(const [lx,k] of [[x-1,2],[x+1,3]]){ bs.push(sided({x0:lx-.02,y0:y-.02,x1:lx+.02,y1:y+.02,z0:z0+70,z1:z0+88,c:MSP.black,fs:()=>MSP.black}));
    bs.push(...msLathe(lx,y,z0+44,z0+70,()=>.13,(dx,dy,z,nx,ny,top)=>top?MSP.woodD:msPaperFace(k,1,0,26)(nx,ny,0,0,z)).map(b=>({...b,em:1,life:1})));
    ls.push({x:lx,y,z:z0+58,r:3,c:[1,.66,.32]}); }
  for(const [bx,bz,r,rz] of [[x-2.38,138,.32,10],[x-2,136,.2,8],[x+2.15,138,.3,10],[x-1.7,92,.14,7]])bs.push(...msEll(bx,y,z0+bz,r,rz,msBloom));
  const p=msLife(msPut('moon shrine gate',bs,{solids:[x-1.75,x+1.75].map(px=>({x0:px-.17,y0:y-.17,x1:px+.17,y1:y+.17,z0,z1:z0+122}))}),2);
  for(const l of ls)LAMPS.push(msLamp(l,p)); return p; }
function msHangingLantern(x,y,z0=0){ '@later'; const bs=[sided({x0:x-.02,y0:y-.02,x1:x+.02,y1:y+.02,z0:z0+26,z1:z0+40,c:MSP.black,fs:()=>MSP.black}),
  ...msLathe(x,y,z0,z0+26,()=>.13,(dx,dy,z,nx,ny,top)=>top?MSP.woodD:msPaperFace(9,1,0,26)(nx,ny,0,0,z)).map(b=>({...b,em:1,life:1}))];
  const p=msLife(msPut('hanging paper lantern',bs),9); LAMPS.push(msLamp({x,y,z:z0+14,r:3,c:[1,.66,.32]},p)); return p; }
function msBloom(dx,dy,z,nx,ny,top){ '@later'; const cs=.05, gu=dx/cs, gv=dy/cs, gz=z/(cs*32), iu=Math.floor(gu), iv=Math.floor(gv), iz=Math.floor(gz); let best=9, bk=0, bu=0, bv=0;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){ const cu=iu+a, cv=iv+b, cz=iz+c, d=(gu-cu-hash(cu,cv,cz*7+1))**2+(gv-cv-hash(cu,cv,cz*7+2))**2+(gz-cz-hash(cu,cv,cz*7+3))**2;
    if(d<best){ best=d; bk=hash(cu,cv,cz*7+5); bu=gu-cu; bv=gv-cv; } }
  if(best<.2){ const pet=Math.cos(Math.atan2(bv,bu)*5+bk*6)*.5+.5; if(best<.012)return [250,226,170]; if(best>.08+.1*pet)return sh(MSP.pinkD,.8); return msRound(msMix(bk>.5?MSP.pink:MSP.pinkL,MSP.pinkD,msCl(best*3-.1))); }
  return msShade(best>.34&&hash(iu,iv,iz)>.6?[74,48,52]:sh(MSP.pinkD,.7),nx,ny,top); }
function msBlossom(x,y,z0=0,r=.3,rz=10){ return msPut('blossom clump',[...msEll(x,y,z0+rz,r,rz,msBloom),...msEll(x+r*.6,y-r*.3,z0+rz*.8,r*.6,rz*.7,msBloom)],{walk:true}); }
function msPost(x,y,z0=0,vine=false){ '@later'; const bs=[msStone(x-.14,y-.14,x+.14,y+.14,z0,z0+53,{fs:(nx,ny,X,Y,zr,k)=>{ const a=nx?Y:X; let c=msBlock(a,zr,53);
    if(vine&&Math.abs(((a*30+zr/5)%6)-3)<.9)c=hash(Math.floor(zr),3)>.5?MSP.moss:MSP.mossL; return sh(c,k*1.2); }}),
  msStone(x-.18,y-.18,x+.18,y+.18,z0+53,z0+59),...msLathe(x,y,z0+59,z0+71,z=>.16-z*.0117,(dx,dy,z,nx,ny,top)=>msShade(msBlock(Math.atan2(dy,dx)*.3,z,12),nx,ny,top))];
  return msPut(vine?'stone post with vines':'square stone post',bs); }
function msGroundLantern(x,y,z0=0,k=4){ '@later'; const bs=[sided({x0:x-.13,y0:y-.13,x1:x+.13,y1:y+.13,z0:z0+3,z1:z0+23,c:MSP.paper,em:1,life:1,foot:1,fs:(nx,ny,X,Y,zr)=>{ const a=nx?Y-y:X-x;
    if(Math.abs(a)>.105)return MSP.woodD; return msPaperFace(k,0,0,20)(nx,ny,X,Y,zr); },top:()=>MSP.woodD}),
  sided({x0:x-.17,y0:y-.17,x1:x+.17,y1:y+.17,z0:z0+23,z1:z0+26,c:MSP.woodD,fs:()=>MSP.woodD,top:()=>sh(MSP.woodD,1.2)}),
  ...[[-1,-1],[1,1],[-1,1],[1,-1]].map(([a,b])=>sided({x0:x+a*.11-.02,y0:y+b*.11-.02,x1:x+a*.11+.02,y1:y+b*.11+.02,z0,z1:z0+3,c:MSP.woodD,foot:1,fs:()=>MSP.woodD}))];
  const p=msLife(msPut('paper ground lantern',bs),k); LAMPS.push(msLamp({x,y,z:z0+14,r:3.2,c:[1,.68,.34]},p)); return p; }
function msFloatingLantern(x,y,z0=0){ return msPut('floating pond lantern',[sided({x0:x-.12,y0:y-.12,x1:x+.12,y1:y+.12,z0,z1:z0+2,c:[70,46,34],foot:1,fs:()=>[70,46,34]}),
  sided({x0:x-.1,y0:y-.1,x1:x+.1,y1:y+.1,z0:z0+2,z1:z0+16,c:MSP.paper,em:1,fs:msPaperFace(13,0,0,14),top:()=>[90,60,40]})]); }
function msToro(x,y,z0=0){ '@later'; const st=(dx,dy,z,nx,ny,top)=>msShade(msMix(msBlock(Math.atan2(dy,dx)*.4,z,60),MSP.stone,.3),nx,ny,top);
  const bs=[...msEll(x,y,z0+4,.38,6,msRockCol),...msLathe(x,y,z0+8,z0+14,()=>.17,st),...msLathe(x,y,z0+14,z0+34,()=>.075,st),
    msStone(x-.2,y-.2,x+.2,y+.2,z0+34,z0+38),
    sided({x0:x-.15,y0:y-.15,x1:x+.15,y1:y+.15,z0:z0+38,z1:z0+54,c:MSP.stone,em:1,life:1,fs:(nx,ny,X,Y,zr,k)=>{ const a=nx?Y-y:X-x;
      if(Math.abs(a)<.08&&zr>3&&zr<13){ const f=LIFE.mode===1?msFlick(12):1; return msRound(sh(MSP.paper,f)); } return LIFE.mode===1?null:sh(msBlock(a,zr,16),k*1.2); },top:()=>MSP.stone}),
    msStone(x-.26,y-.26,x+.26,y+.26,z0+54,z0+57),...msLathe(x,y,z0+57,z0+68,z=>.33-z*.026,st),...msEll(x,y,z0+70,.05,4,st)];
  const p=msLife(msPut('stone garden lantern',bs),12); LAMPS.push(msLamp({x,y,z:z0+46,r:2.6,c:[1,.7,.36]},p)); return p; }
function msRockCol(dx,dy,z,nx,ny,top){ let c=msMix(MSP.rockD,MSP.rock,msVn(z/5+dx*3,dy*3,4)); if(Math.abs(((z+msVn(dx*4,dy*4,1)*8)%9)-4.5)<.7)c=sh(c,.72);
  if(top&&msFbm(dx*3,dy*3,9)>.3)c=msMix(MSP.moss,MSP.mossL,hash(dx*40,dy*40,z)*.6); return msShade(c,nx,ny,top); }
function msRock(x,y,z0=0){ return msPut('mossy cliff rock',[...msEll(x,y,z0+24,.55,24,msRockCol),...msEll(x+.65,y-.23,z0+16,.42,16,msRockCol),...msEll(x-.25,y+.75,z0+14,.34,14,msRockCol),...msEll(x+.15,y-.1,z0+44,.32,12,msRockCol)]); }
function msFern(x,y,z0=0,r=.45,rz=12){ '@later'; return msPut('fern bush',msEll(x,y,z0+rz*.5,r,rz,(dx,dy,z,nx,ny,top)=>{ const th=Math.atan2(dy,dx), rr=Math.hypot(dx,dy)/r, s=((th/(2*Math.PI))*9+x*7)%1, d=Math.abs(((s%1)+1)%1-.5)*2, lf=Math.sin(rr*60)*.5+.5;
  if(d>.55+.17*lf*(1-rr)+(rr<.25?.5:0))return null; let c=msMix(MSP.fern,MSP.fernL,msCl(1-d*1.3)*(top?1:.5)); if(lf>.85&&d<.3)c=sh(MSP.fernL,1.1); return msRound(c); }),{walk:true}); }
function msTuft(x,y,z0=0,r=.14,h=8){ '@later'; return msPut('moss and grass tuft',msLathe(x,y,z0,z0+h,z=>r*(1-z/h*.6),(dx,dy,z,nx,ny,top)=>{ const th=Math.atan2(dy,dx), b=((th/(2*Math.PI))*14+hash(x*9,y*9)*3)%1;
  if(Math.abs(((b%1)+1)%1-.5)*2>1-z/h*.9)return null; return msRound(msMix(MSP.mossD,z/h>.6?MSP.mossL:MSP.grass,z/h)); },1.5,.03),{walk:true}); }
function msMarker(x,y,z0=0){ return msPut('wooden marker post',[...msLathe(x,y,z0,z0+52,()=>.045,()=>[66,40,30]),sided({x0:x-.22,y0:y-.03,x1:x+.22,y1:y+.03,z0:z0+40,z1:z0+44,c:[66,40,30],fs:()=>[66,40,30]})]); }
function msStepStone(x,y,z0=0){ return msPut('mossy walkway stone',[msStone(x,y,x+1,y+.7,z0,z0+7.5)],{hang:1}); }
function msParapet(x0,y0,x1,y1,z0=0,ox=0,oy=1){ '@later'; const ax=ox?1:0, vine=(nx,ny,X,Y,zr)=>{ if((ox&&nx!==ox)||(oy&&ny!==oy))return null; const a=ax?Y:X, s=Math.floor(a*9), len=10+hash(s,ax?3:7)*90; if(hash(s,4,ax)<.45)return null;
    const aa=a*9-s+Math.sin(zr/9+s)*.22; if(zr<126-len||Math.abs(aa-.5)>.18+(hash(Math.floor(zr/3),s)>.7?.22:0))return null; return hash(Math.floor(zr/2),s,2)>.5?MSP.moss:MSP.mossD; };
  const top=(X,Y)=>{ let c=msMix(MSP.cope,MSP.stone,.4+hash(Math.floor((X+Y)*3),2)*.3); return msFbm(X*3,Y*3,14)>.5?msMix(c,MSP.moss,.75):c; };
  const vx=ox>0?x1+T:ox<0?x0-T-.02:null, vy=oy>0?y1+T:oy<0?y0-T-.02:null;
  const vb=ax?{x0:vx,x1:vx+.02,y0:y0+.1,y1:y1-.1}:{x0:x0+.1,x1:x1-.1,y0:vy,y1:vy+.02};
  return msPut('mossy parapet',[msStone(x0,y0,x1,y1,z0,z0+16,{top}),...(MS_VINES?[sided({...vb,z0:z0-110,z1:z0+16,c:MSP.moss,nb:1,fs:vine,top:()=>null})]:[])],{walk:true}); }
const MS_VINES=false;
