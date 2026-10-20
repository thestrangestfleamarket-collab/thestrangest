const dgnRoom=LBLD=>{
const DGN=(B=>({b:B,x0:B.x0+T,x1:B.x1-T,y0:B.y0+T,y1:B.y1-T,cx:(B.x0+B.x1)/2,cy:(B.y0+B.y1)/2,H:B.h-4,in:[B.x0-T,B.y0-T,B.x1+T,B.y1+T],
  torches:[{w:'b',u:2.6},{w:'b',u:10.2},{w:'l',u:2.4},{w:'l',u:8.2},{w:'r',u:3.2},{w:'r',u:8},{w:'f',u:6.4}],
  holes:[{w:'b',u:.7},{w:'b',u:5.3},{w:'l',u:9.9},{w:'l',u:5.1},{w:'r',u:6.3},{w:'r',u:.9}],chains:[{w:'b',u:7.9,l:46},{w:'r',u:1.3,l:34},{w:'f',u:2.2,l:40},{w:'f',u:10.6,l:28}],
  door:{w:'l',u:5.4},slit:{w:'b',u:6.4},tally:{w:'r',u:4.9},banners:[{w:'r',u:9.6},{w:'f',u:4.3}],ivy:[{w:'b',u:1.4,h:96},{w:'b',u:12,h:70},{w:'l',u:.9,h:110},{w:'f',u:8.6,h:60},{w:'r',u:.5,h:80}],
  cracks:[{w:'b',u:4,z:110},{w:'b',u:9,z:80},{w:'l',u:3.3,z:100},{w:'l',u:7.7,z:60},{w:'r',u:2.2,z:118},{w:'r',u:7,z:90},{w:'f',u:1.1,z:100},{w:'f',u:9.4,z:84}]}))(LBLD.find(b=>b.id==='ldungeon'));
const DGP={st:[[72,68,64],[80,76,70],[64,60,58],[76,70,62]],hi:[98,94,88],lo:[46,44,42],mo:[20,19,19],dark:[9,9,11],moss:[56,74,44],mossL:[74,96,54],mould:[48,52,44],
  cob:[[70,66,62],[78,74,68],[62,58,56],[74,68,60],[66,64,62]],joint:[20,18,18],dust:[108,100,86],straw:[150,124,62],strawD:[112,90,44],bone:[190,180,156],
  iron:[44,42,44],ironL:[78,76,78],rust:[96,58,34],oak:[72,48,28],oakL:[92,64,38],oakD:[50,32,18],web:[142,140,132],webL:[170,168,160],ivy:[46,78,40],ivyL:[70,108,54],ivyD:[30,52,28],vine:[58,50,34],ban:[112,34,38],banD:[80,22,28],banL:[138,52,54],gold:[168,138,60],night:[14,18,30],moon:[40,48,70],soot:[14,13,13]};
const dgnLit=c=>Object.assign([...c],{e:1});
function dgnStone(u,z,seed){ '@later'; const j=Math.floor(z/14), zz=z-j*14, L=24+Math.floor(hash(j,1,seed)*19), o=hash(j,0,seed)*L, k=Math.floor((u+o)/L), uu=(u+o)-k*L;
  if(zz<1.5||uu<1.5)return DGP.mo;
  if((uu<3||uu>=L-1.5)&&(zz<3||zz>=12.5))return DGP.mo;
  const n=hash(j,k,seed+1); let c=DGP.st[Math.floor(n*4)];
  if(zz>=12.5)c=DGP.hi; else if(zz<3)c=DGP.lo;
  const g=hash(Math.floor(u),Math.floor(z),seed+2); if(g<.06)c=sh(c,.84); else if(g>.96)c=sh(c,1.1);
  if(hash(k,j,seed+3)<.18&&Math.hypot(uu-L*hash(k,j,seed+4),zz-7)<2.2)c=DGP.lo;
  return c; }
function dgnDamp(u,z,seed,H){ let f=1; const s=Math.floor(u/70), su=s*70+10+hash(s,0,seed)*50, len=H*(.3+hash(s,1,seed)*.5);
  if(hash(s,2,seed)<.55&&z>H-len){ const w=su+2.5*Math.sin(z/11+s), d=Math.abs(u-w); if(d<4)f*=.72+.07*d; }
  if(z<34)f*=1-(34-z)/34*.3; return f; }
function dgnFoot(u,z,seed){ if(z>=30)return null; const p=(30-z)/30, n=(cvNoise(u/14,z/7,seed+5)*2+cvNoise(u/5,z/3,seed+6))/3+(hash(Math.floor(u),Math.floor(z),seed+7)-.5)*.08;
  if(n<p*.62)return n<p*.62-.12?DGP.mossL:DGP.moss; if(n>1-p*.3)return DGP.mould; return null; }
function dgnWeb(du,dz,r,seed){ '@later'; if(du<0||dz<0||du>r||dz>r)return null; const d=Math.hypot(du,dz), a=Math.atan2(dz,du); if(d>r)return null;
  const spoke=Math.abs(((a*7/(Math.PI/2))%1)-.5)>.46&&d<r*(.75+.25*hash(Math.floor(a*7/(Math.PI/2)),0,seed)), ring=(d%7)<.9&&hash(Math.floor(d/7),Math.floor(a*20),seed)<.75;
  if(spoke||ring)return d>r*.8?DGP.web:DGP.webL; return hash(Math.floor(du),Math.floor(dz),seed+9)<.03?DGP.web:null; }
function dgnChain(du,dz,l){ '@later'; const a=Math.abs(du); if(dz>7||dz<-l-6)return null;
  if(dz>=0)return Math.hypot(du,dz-3.5)<3.6&&Math.hypot(du,dz-3.5)>1.8?DGP.ironL:null;
  const k=Math.floor(-dz/4), wide=k&1, v=-dz-k*4; if(-dz<=l){ if(wide)return a<2.2&&a>.8&&!(v<.6&&a>1.6)?(v<1.5?DGP.ironL:DGP.iron):null; return a<1?(v<1?DGP.ironL:DGP.iron):null; }
  const q=Math.hypot(du,dz+l+3); return q<4.2&&q>2.6?(dz+l+3>1?DGP.ironL:DGP.rust):null; }
function dgnDoor(du,dz){ '@later'; const a=Math.abs(du); if(dz>=92||a>=23)return null;
  if(dz>=76||a>=15){ const j=Math.floor(dz/12), o=(j&1)*8, k=Math.floor((a+o)/16); if((dz%12)<1.2||((a+o)%16)<1.2)return DGP.mo; return (j+k)&1?DGP.hi:DGP.st[1]; }
  if(a>=14)return DGP.dark;
  const pl=Math.floor((du+14)/5.6), pu=(du+14)-pl*5.6; let c=pu<.6?DGP.oakD:[DGP.oak,DGP.oakL,DGP.oak,DGP.oakL,DGP.oak][pl]||DGP.oak;
  if(hash(Math.floor(du),Math.floor(dz/3),77)<.12)c=sh(c,.86);
  for(const bz of [8,36,64]){ if(dz>=bz&&dz<bz+5){ const r=Math.floor((du+14)/7), ru=(du+14)-r*7; return (ru>2.6&&ru<4.4&&dz>=bz+1.5&&dz<bz+3.5)?DGP.ironL:(dz<bz+1||dz>=bz+4)?DGP.rust:DGP.iron; } }
  if(dz>=44&&dz<58&&a<6){ if(a>=5||dz<45||dz>=57)return DGP.iron; return (Math.floor(du+6)%3===1)?DGP.iron:DGP.dark; }
  const h=Math.hypot(du-7,dz-26); if(h<3.4&&h>2)return dz-26>0?DGP.ironL:DGP.rust; if(Math.hypot(du-7,dz-30)<1.4)return DGP.iron;
  return c; }
function dgnSlit(du,dz){ '@later'; const a=Math.abs(du); if(dz<84||dz>=112||a>=12)return null;
  if(dz>=108||dz<88||a>=8){ return ((Math.floor(dz/6)+(du>0))&1)?DGP.hi:DGP.st[0]; }
  if(dz>=106||a>=7)return DGP.dark;
  if(a<7&&Math.abs(((du+7)%4.7)-2.35)<.6)return DGP.iron;
  return dgnLit(dz>100&&hash(Math.floor(du),Math.floor(dz),81)<.15?DGP.moon:DGP.night); }
function dgnSoot(du,dz,seed){ if(dz<0||dz>40)return 1; const w=4+dz*.35, a=Math.abs(du)/w; if(a>1)return 1; const k=(1-a)*(1-dz/40); return 1-k*(.5+.3*hash(Math.floor(du),Math.floor(dz),seed)); }
function dgnTally(du,dz){ '@later'; if(du<0||du>52||dz<46||dz>=62)return null; const row=dz>=54?0:1, z=dz-(row?46:54), g=Math.floor(du/13), gu=du-g*13; if(row===1&&g>2)return null;
  if(z>=2&&z<7&&gu>1&&gu<10&&Math.abs(((gu-1)%2.2)-1.1)>.6)return DGP.lo; if(gu>.5&&gu<10.5&&Math.abs(z-(4.5+(gu-5.5)*.4))<.7&&!(row===1&&g===2))return DGP.lo; return null; }
const dgnHole=(du,dz)=>{ const a=Math.abs(du); if(dz>=5.5||a>=4)return null; if(dz<4.6*Math.sqrt(Math.max(0,1-(a/3.6)**2)))return DGP.dark; return a<4&&dz<5?DGP.lo:null; };
function dgnCrack(du,dz,seed){ if(dz>0||dz<-70||Math.abs(du)>40)return false; const t=-dz, w=du-(6*Math.sin(t/9+seed)+t*.25*(hash(seed,0,0)-.5)), f=du-(t*.7-14+3*Math.sin(t/5));
  return Math.abs(w)<(t<40?1.3:.8)||t>24&&t<58&&Math.abs(f)<.8; }
const dgnWorn=(u,z,seed)=>z>36&&z<74&&hash(Math.floor(u/24),Math.floor(z/16),seed+13)<.25&&hash(Math.floor(u/3),Math.floor(z/3),seed+14)<.5;
function dgnRidge(u,z,H){ if(z>=H-16&&z<H-3){ const zz=z-(H-16); if(zz<2)return DGP.dark; if(zz>=11)return DGP.hi; const k=Math.floor((u+8)/18); return (u+8)-k*18<1.2?DGP.mo:zz<4?DGP.lo:DGP.st[(k&1)*2]; }
  if(z>=8&&z<11)return z>=10?DGP.hi:DGP.lo; return null; }
function dgnIvy(du,dz,h,seed){ const a=Math.abs(du); if(dz<0||dz>h||a>26)return null; const w=5*Math.sin(dz/13+seed), d=Math.abs(du-w);
  if(d<1.4&&dz<h-8)return DGP.vine;
  const j=Math.floor(dz/9), side=(j&1)?1:-1, bl=8+6*hash(j,0,seed), bu=w+side*Math.min(bl,(dz-j*9)*2); if(dz-j*9<4&&Math.abs(du-bu)<1&&(du-w)*side>0&&(du-w)*side<bl)return DGP.vine;
  for(let k=0;k<3;k++){ const lu=w+side*(3+k*5+hash(j,k,seed)*3), lz=j*9+2-k*2.5, q=Math.hypot((du-lu)/3.2,(dz-lz)/2.6); if(q<1&&hash(j,k,seed+1)<.85)return q<.5&&(k+j)&1?DGP.ivyL:q>.8?DGP.ivyD:DGP.ivy; }
  return null; }
function dgnBanner(du,dz,seed){ '@later'; const a=Math.abs(du); if(dz<-3||a>15)return null;
  if(dz<1)return a>14?DGP.ironL:Math.hypot(a-15,dz+1.5)<2?DGP.ironL:DGP.iron;
  const hem=38+10*Math.sin(du/3.1+seed)+7*hash(Math.floor(du/2),0,seed); if(dz>hem)return null;
  if(dz>hem-14&&hash(Math.floor(du/2),Math.floor(dz/3),seed+2)<(dz-hem+14)/16)return null;
  if(hash(Math.floor(du),Math.floor(dz),seed+3)<.04)return null;
  if(a>12)return DGP.gold; if(dz<4)return DGP.gold;
  const tw=Math.abs(du)<4&&dz>14&&dz<30, cr=dz>=10&&dz<14&&Math.abs(du)<5&&(Math.floor(du+5)%3!==1||dz>=12);
  if(tw||cr)return (Math.floor(du+4)%2===Math.floor(dz)%2)?DGP.gold:sh(DGP.gold,.86);
  return hash(Math.floor(du/3),Math.floor(dz/3),seed+4)<.3?DGP.banD:dz>24?DGP.banD:DGP.ban; }
function dungeonWall(q,nx,ny,X,Y,z,f,R=DGN){ '@later'; const e=.06, H=R.H, w=ny>0&&Math.abs(Y-R.y0)<e?'b':ny<0&&Math.abs(Y-R.y1)<e?'f':nx>0&&Math.abs(X-R.x0)<e?'l':'r';
  const u=(nx?Y-R.y0:X-R.x0)*24, L=(nx?R.y1-R.y0:R.x1-R.x0)*24, seed=w.charCodeAt(0);
  if(z<0)return sh(DGP.mo,f); if(z>=H-3)return sh(DGP.lo,f);
  const put=c=>c&&c.e?c:sh(c,f*dgnDamp(u,z,seed,H));
  let c=null;
  if(w===R.door.w){ c=dgnDoor(u-R.door.u*24,z); if(c)return put(c); }
  if(w===R.slit.w){ c=dgnSlit(u-R.slit.u*24,z); if(c)return put(c); }
  if(w===R.tally.w){ c=dgnTally(u-R.tally.u*24,z); if(c)return put(c); }
  for(const h of R.holes)if(h.w===w){ c=dgnHole(u-h.u*24,z); if(c)return put(c); }
  for(const ch of R.chains)if(ch.w===w){ c=dgnChain(u-ch.u*24,z-100,ch.l); if(c)return put(c); }
  c=dgnWeb(u,H-3-z,30,seed*3)||dgnWeb(L-u,H-3-z,24,seed*5); if(c)return put(c);
  for(const b of R.banners)if(b.w===w){ c=dgnBanner(u-b.u*24,106-z,seed*17+b.u); if(c)return put(c); }
  for(const v of R.ivy)if(v.w===w){ c=dgnIvy(u-v.u*24,z-8,v.h,seed*19+v.u); if(c)return put(c); }
  c=dgnRidge(u,z,H); if(c)return put(c);
  c=dgnFoot(u,z,seed); if(c)return put(c);
  let s=1; for(const t of R.torches)if(t.w===w)s*=dgnSoot(u-t.u*24,z-94,seed*7);
  for(const k of R.cracks)if(k.w===w&&dgnCrack(u-k.u*24,z-k.z,seed*23+k.u))return put(DGP.mo);
  c=dgnStone(u,z,seed*11); if(dgnWorn(u,z,seed))c=sh([c[0]+30,c[1]+28,c[2]+24],.92);
  return put(sh(c,s)); }
function dungeonFloorCol(x,y,R=DGN){ '@later'; const S=.26, px=x-R.x0, py=y-R.y0, j=Math.floor(py/S), o=(j&1)*S/2, i=Math.floor((px+o)/S);
  const dx=x-R.cx-1, dy=y-R.cy+.6, dr=Math.hypot(dx,dy);
  if(dr<.36){ if(dr>.32)return DGP.iron; const bar=Math.abs(((dx+.36)%.09)-.045)<.015||Math.abs(dy)<.015; return bar?(dy<0?DGP.ironL:DGP.rust):DGP.dark; }
  let best=null, bd=1; for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){ const jj=j+b, ii=i+a, oo=(jj&1)*S/2, cxs=(ii+.5)*S-oo+(hash(ii,jj,1601)-.5)*S*.3, cys=(jj+.5)*S+(hash(ii,jj,1603)-.5)*S*.3;
    const r=S*(.36+hash(ii,jj,1605)*.14), d=Math.hypot(px-cxs,py-cys)/r; if(d<bd){ bd=d; best={ii,jj,cxs,cys,r}; } }
  const wall=Math.min(px,py,R.x1-x,R.y1-y);
  if(bd>=1){ const n=hash(Math.floor(x*24),Math.floor(y*24),1607); return wall<1.2&&n<.5-wall*.3?DGP.moss:n>.985?DGP.bone:DGP.joint; }
  let c=DGP.cob[Math.floor(hash(best.ii,best.jj,1609)*5)]; const lx=(px-best.cxs)/best.r, ly=(py-best.cys)/best.r, k=-.5*lx-.5*ly;
  c=sh(c,bd>.78?.8:k>.3?1.1:k<-.3?.9:1);
  if(hash(Math.floor(x*24),Math.floor(y*24),1611)<.05)c=sh(c,.88);
  if(hash(best.ii,best.jj,1623)<.12&&Math.abs(ly-lx*(hash(best.ii,best.jj,1625)-.5)*2)<.14)c=DGP.joint;
  const damp=(cvNoise(x/2.4,y/2.4,1613)*2+cvNoise(x/.9,y/.9,1614))/3+(hash(Math.floor(x*24),Math.floor(y*24),1612)-.5)*.06; if(damp<.42)c=sh(c,damp<.34?.78:.89);
  if(dr<1.6)c=sh(c,.72+dr*.17);
  if(wall<.45){ const n=hash(Math.floor(x*24),Math.floor(y*24),1615); if(n<(.45-wall)*1.4)c=n<.08?DGP.dust:[(c[0]+DGP.dust[0])/2,(c[1]+DGP.dust[1])/2,(c[2]+DGP.dust[2])/2]; }
  const sx=Math.floor(x*2), sy=Math.floor(y*2); if(hash(sx,sy,1617)<.1){ const ax=hash(sx,sy,1619)*.5-.25, ay=hash(sx,sy,1621)*.5-.25, u=(x-sx/2-.25), v=(y-sy/2-.25);
    const t=u*Math.cos(ax*6)+v*Math.sin(ax*6), n=Math.abs(-u*Math.sin(ax*6)+v*Math.cos(ax*6)); if(n<.012&&Math.abs(t-ay*.3)<.14)return t>0?DGP.straw:DGP.strawD; }
  return c; }
return {DGP,dgnLit,DGN,dgnWeb,dgnIvy,dgnRidge,dgnFoot,dgnStone,dgnDamp,dungeonWall,dungeonFloorCol}; };
const dgnThings=(CATALOG,CAT_INFO,LAMPS,CAT_DEPTS,DGP,dgnLit,DGN,dgnWeb)=>{
const C=DGP, lit=dgnLit;
const FLH=[10,12,11,13,9,12,10,13], flick=(p,FL,seed)=>{ p.life=t=>{ FL.ph=Math.floor(hash(Math.floor(t*7),seed,425)*8); }; p.lifeKey=()=>FL.ph; };
function lathe(cx,cy,z0,z1,rf,col,dz=2,dw=.04){ '@later'; const out=[];
  for(let z=z0;z<z1-1e-9;z+=dz){ const za=z, zb=Math.min(z1,z+dz), r=rf((za+zb)/2-z0); if(!(r>.004))continue; const n=Math.max(1,Math.round(2*r/dw)), w=2*r/n;
    for(let i=0;i<n;i++){ const xa=-r+i*w, xm=xa+w/2, hy=Math.sqrt(Math.max(0,r*r-xm*xm)); if(hy<w*.3)continue;
      out.push(sided({x0:cx+xa,y0:cy-hy,x1:cx+xa+w,y1:cy+hy,z0:za,z1:zb,c:[90,90,90],foot:0,nb:1,fs:(nx,ny,X,Y,zr)=>col(X-cx,Y-cy,za+zr-z0,0),top:(X,Y)=>col(X-cx,Y-cy,zb-z0,1)})); } }
  return out; }
const stone=(u,z,seed)=>{ const g=hash(Math.floor(u),Math.floor(z),seed); return g<.07?sh(C.st[1],.84):g>.95?C.hi:C.st[1]; };
function skull(cx,cy,z,r=.14){ '@later'; const h=r*46, bone=(u,v)=>{ const e=u*u+((v-.55)*1.9)**2; if(e>1)return null;
    if(v<.22&&Math.abs(u)<.6)return (Math.floor(u*8)&1)?C.bone:sh(C.bone,.8);
    if(v<.3)return sh(C.bone,.72); if(Math.hypot((Math.abs(u)-.42)/.22,(v-.52)/.14)<1)return C.dark;
    if(Math.abs(u)<.08&&v>.3&&v<.44)return C.dark; return e>.72?sh(C.bone,.82):v>.7&&u<-.1?sh(C.bone,1.08):C.bone; };
  return {x0:cx-r,y0:cy-r*.85,x1:cx+r,y1:cy+r*.85,z0:z,z1:z+h,foot:z===0?1:0,c:C.bone,top:(X,Y)=>{ const u=(X-cx)/r, v=(Y-cy)/(r*.85); return u*u+v*v>1?null:Math.abs(u)<.06&&v<0?sh(C.bone,.8):sh(C.bone,1.06); },
    fi:(y,zz)=>{ const c=bone((y-cy)/(r*.85),(zz-z)/h); return c&&sh(c,.74); },fj:(x,zz)=>{ const c=bone((x-cx)/r,(zz-z)/h); return c&&sh(c,.88); }}; }
CATALOG['skull']=(x,y)=>{ PNAME='skull'; return prop([skull(x,y,0)],null,{}); };
CAT_INFO['skull']={no:'P-951',name:'Skull',dept:'Dungeon',price:0,desc:'A human skull on the stones, its sockets dark. Whose, nobody left to say.',mat:'bone'};
function bone(x,y,len,alongX,z,seed){ '@later'; const w=.1, L=len/2, sh2=hash(seed,1,0)<.5?.94:1.04, col=sh(C.bone,sh2);
  const shape=(a,b)=>{ const A=Math.abs(a), B=Math.abs(b); if(A>L)return null; if(A>L-.06)return Math.hypot((A-(L-.03))/.05,b/.05)<1||Math.hypot((A-(L-.03))/.05,(B-.03)/.04)<1?col:null; return B<.022?col:null; };
  const b={x0:alongX?x-L:x-w/2,y0:alongX?y-w/2:y-L,x1:alongX?x+L:x+w/2,y1:alongX?y+w/2:y+L,z0:z,z1:z+1.6,foot:z===0?1:0,nb:1,c:col,top:(X,Y)=>shape(alongX?X-x:Y-y,alongX?Y-y:X-x),
    fi:(Y,zz)=>shape(alongX?0:Y-y,alongX?Y-y:0)&&sh(col,.72),fj:(X,zz)=>shape(alongX?X-x:0,alongX?0:X-x)&&sh(col,.86)}; return b; }
function ribs(x,y,z){ '@later'; return {x0:x-.22,y0:y-.16,x1:x+.22,y1:y+.16,z0:z,z1:z+1,foot:z===0?1:0,nb:1,c:C.bone,top:(X,Y)=>{ const u=X-x, v=Y-y; if(Math.abs(u)<.02&&v>-.14&&v<.14)return sh(C.bone,.9);
    for(let k=0;k<4;k++){ const r=.06+k*.045, d=Math.abs(Math.hypot(u*1.3,v)-r); if(d<.012&&v>-.02)return k&1?C.bone:sh(C.bone,.92); } return null; },fi:()=>null,fj:()=>null}; }
CATALOG['bone pile']=(x,y)=>{ PNAME='bone pile'; const s=Math.round(x*13+y*7);
  return prop([bone(x-.05,y+.1,.5,true,0,s),bone(x+.12,y-.12,.42,false,0,s+1),ribs(x-.2,y-.1,0),bone(x+.02,y+.02,.46,true,1.6,s+2),skull(x+.14,y+.1,2.6,.12)],null,{}); };
CAT_INFO['bone pile']={no:'P-952',name:'Bone Pile',dept:'Dungeon',price:0,desc:'Long bones crossed over a rib cage, a skull on top of the heap.',mat:'bone'};
CATALOG['bones']=(x,y)=>{ PNAME='bones'; const s=Math.round(x*11+y*5); return prop([bone(x,y,.46,hash(s,0,0)<.5,0,s),bone(x+.1,y-.14,.3,hash(s,0,0)>=.5,0,s+3)],null,{walk:1}); };
CAT_INFO['bones']={no:'P-953',name:'Bones',dept:'Dungeon',price:0,desc:'Two long bones dropped on the stones. You walk over them.',mat:'bone'};
CATALOG['wall torch']=(x,y,dir)=>{ '@later'; PNAME='wall torch'; const R=DGN; dir=dir||[['b',y-R.y0],['f',R.y1-y],['l',x-R.x0],['r',R.x1-x]].sort((a,b)=>a[1]-b[1])[0][0];
  const nx=dir==='l'?1:dir==='r'?-1:0, ny=dir==='b'?1:dir==='f'?-1:0, FL={ph:0}, B=[], I=C.iron, IL=C.ironL;
  const bx=(ax,ay,bx2,by2,z0,z1,c,o)=>({x0:Math.min(ax,bx2),y0:Math.min(ay,by2),x1:Math.max(ax,bx2),y1:Math.max(ay,by2),z0,z1,foot:0,nb:1,c,top:()=>sh(c,1.1),fi:()=>sh(c,.7),fj:()=>sh(c,.86),...o});
  B.push(bx(x-nx*.16-.02,y-ny*.16-.02,x+.02,y+.02,62,64.5,I,{foot:1}));
  B.push(bx(x-.05,y-.05,x+.05,y+.05,62,67,IL)); B.push(bx(x-.035,y-.035,x+.035,y+.035,67,69,I));
  B.push(bx(x-.025,y-.025,x+.025,y+.025,52,74,[96,78,54],{fi:(v,z)=>sh([96,78,54],.7+.04*((z|0)&1)),fj:(u,z)=>sh([96,78,54],.86)}));
  B.push(bx(x-.05,y-.05,x+.05,y+.05,74,82,[36,30,26],{fi:(v,z)=>hash(Math.floor(v*48),z|0,31)<.3?[52,44,36]:[36,30,26],fj:(u,z)=>hash(Math.floor(u*48),z|0,33)<.3?[52,44,36]:[36,30,26]}));
  const flame=(du,zz)=>{ if(typeof LIFE==='undefined'||LIFE.mode!==1)return null; const h=FLH[FL.ph], lean=(FL.ph%3-1)*.12; if(zz<0||zz>=h)return null;
    const w=.075*Math.pow(1-zz/h,.55)*(1+.2*Math.sin(zz*1.7+FL.ph)), a=Math.abs(du-lean*zz/h); if(a>w)return null;
    return lit(zz<2?[255,236,170]:a<w*.4&&zz<h*.6?[255,224,120]:a>w*.75||zz>h*.8?[236,92,30]:[255,170,50]); };
  B.push({x0:x-.09,y0:y-.09,x1:x+.09,y1:y+.09,z0:82,z1:96,c:[255,170,50],foot:0,nb:1,life:1,top:()=>null,fi:(v,z)=>flame(v-y,z-82),fj:(u,z)=>flame(u-x,z-82)});
  const p=prop(B,null,{walk:1}); flick(p,FL,Math.round(x*7+y*13)); LAMPS.push({x,y,z:88,r:4.8,c:[.98,.61,.29],own:1,room:1,day:true,prop:p,flick:1}); return p; };
CAT_INFO['wall torch']={no:'P-954',name:'Wall Torch',dept:'Dungeon',price:30,desc:'A pitch torch in an iron bracket, burning; the wall above it black with its soot.',mat:'iron, ash, pitch'};
function mover(kind,bx,draw,o){ '@later'; PNAME=kind; const p=prop([{...bx,foot:1,nb:1,c:[0,0,0],top:()=>null,fi:()=>null,fj:()=>null}],null,{walk:1,...o});
  const S={K:1,D:null,W:0,H:0,ox:0,oy:0}, LC=new Map();
  const g={light:(x,y,z,glow)=>{ const k=Math.round(x*2)+','+Math.round(y*2); let L=LC.get(k); if(!L||g.t-L.t>1){ const env=envNear(x,y); L={t:g.t,c:env?lightAt(env,x,y,(LVZ(p.lv)+z)/24,null).map(v=>glow+(1-glow)*Math.max(v,CHARMIN)):[1,1,1]}; LC.set(k,L); } return L.c; },
    at:(x,y,z)=>{ const [vx,vy]=vw(x,y); return [Math.round((vx-vy)*HW-S.ox)*S.K,Math.round((vx+vy)*HH-LVZ(p.lv)-z-S.oy)*S.K]; },
    px:(x,y,z,c,L)=>{ const [fx,fy]=g.at(x,y,z), K=S.K; for(let j=0;j<K;j++)for(let i=0;i<K;i++){ const X=fx+i, Y=fy-1-j; if(X<0||Y<0||X>=S.W||Y>=S.H)continue; const q=(Y*S.W+X)*4; S.D[q]=c.e?c[0]:c[0]*L[0]; S.D[q+1]=c.e?c[1]:c[1]*L[1]; S.D[q+2]=c.e?c[2]:c[2]*L[2]; S.D[q+3]=255; } },
    dir:(x,y,dx,dy)=>{ const a=g.at(x,y,0), b=g.at(x+dx,y+dy,0); return b[0]>=a[0]?1:-1; } };
  p.lifeDraw=(D,W,H,ox,oy,t,K)=>{ S.D=D; S.W=W; S.H=H; S.ox=ox; S.oy=oy; S.K=K; g.t=t; draw(g,t); }; return p; }
CATALOG['dust in the air']=(x,y)=>mover('dust in the air',{x0:x-.6,y0:y-.6,x1:x+.6,y1:y+.6,z0:0,z1:110},(g,t)=>{ const s=Math.round(x*5+y*3);
  for(let i=0;i<22;i++){ const a=hash(s,i,901)*6.28, r=.12+hash(s,i,903)*.46, sp=.6+hash(s,i,905)*1.2, ph=hash(s,i,907)*40, u=(t*sp*.08+ph)%1;
    const mx=x+Math.cos(a+t*.1*sp)*r+.05*Math.sin(t*1.3+i), my=y+Math.sin(a+t*.1*sp)*r+.05*Math.cos(t*1.1+i), mz=60+u*48+4*Math.sin(t*.7+i);
    const near=Math.max(0,1-Math.hypot(mx-x,my-y,(mz-88)/24)/.7), b=.35+.65*near; if(hash(s,i,909)<.3&&Math.sin(t*2+i)<0)continue;
    g.px(mx,my,mz,[Math.min(255,150+105*b),Math.min(255,110+100*b),70+60*b],[1,1,1]); } },{});
CAT_INFO['dust in the air']={no:'P-955',name:'Dust in the Air',dept:'Dungeon',price:0,desc:'Motes drifting in the torchlight, caught by it now and then.',mat:'dust'};
CATALOG['mouse run']=(x0,y0,x1,y1)=>{ '@later'; const ax=Math.abs(x1-x0)>Math.abs(y1-y0), len=ax?x1-x0:y1-y0, nx=ax?.3:0, ny=ax?0:.3, s=Math.round(x0*9+y0*17);
  const M=[0,1,2].map(i=>({u:hash(s,i,11)<.5?0:1,st:'in',t0:-hash(s,i,13)*9,dir:1,v:0,sp:0,ph:hash(s,i,15)*6.28,nose:0})), G=[90,86,84], GL=[122,118,114], GD=[60,56,56], PK=[200,120,120], EY=[12,10,12];
  let last=-1;
  return mover('mouse run',{x0:Math.min(x0,x1)-(ax?0:.15),y0:Math.min(y0,y1)-(ax?.15:0),x1:Math.max(x0,x1)+(ax?0:.15),y1:Math.max(y0,y1)+(ax?.15:0),z0:0,z1:6},(g,t)=>{ const dt=last<0?0:Math.min(.5,t-last); last=t;
    M.forEach((m,i)=>{ const r=hash(Math.floor(t*4)+i*7,s,21);
      if(m.st==='in'){ if(t>m.t0&&r<.25){ m.st='run'; m.dir=m.u<.5?1:-1; m.sp=1.4+hash(s,i+Math.floor(t),23); m.v=0; } return; }
      if(m.st==='run'){ m.u+=m.dir*m.sp*dt/len; if(m.u<=0||m.u>=1){ m.u=m.u<=0?0:1; m.st='in'; m.t0=t+2+hash(s,i+Math.floor(t),25)*8; return; }
        if(r<.06){ m.st='sniff'; m.t0=t+.4+hash(s,i+Math.floor(t),27)*1.2; } }
      else if(m.st==='sniff'){ if(t>m.t0){ m.st='run'; m.dir=hash(s,i+Math.floor(t*3),29)<.7?m.dir:-m.dir; m.sp=1.2+hash(s,i+Math.floor(t),31)*1.4; } }
      const mx=x0+(ax?m.u*len:0), my=y0+(ax?0:m.u*len), d=g.dir(mx,my,ax?m.dir:0,ax?0:m.dir), L=g.light(mx,my,2,.1), run=m.st==='run', ph=run?Math.floor(t*14)&1:0;
      const P=(du,dz,c)=>g.px(mx+(ax?du/24:0),my+(ax?0:du/24),dz,c,L);
      const f=d*(ax?m.dir:m.dir), B=-f;
      P(f*2,0,GD); P(B*1,0,GD); if(run)P(ph?f*1:B*2,0,GD);
      for(let k=-1;k<=2;k++)P(f*k,1,k===2?G:G); P(f*2,1,GD); P(B*2,1,G);
      for(let k=-1;k<=1;k++)P(f*k,2,GL); P(f*0,3,run&&ph?GL:G);
      P(f*3,1,m.st==='sniff'&&(Math.floor(t*10)&1)?PK:G); P(f*2,2,EY);
      const fl=run?(ph?1:0):(Math.floor(t*3+i)&1); for(let k=3;k<=6;k++)P(B*k,k>4?fl:0,k>5?GD:G); }); },{}); };
CAT_INFO['mouse run']={no:'P-956',name:'Mice',dept:'Dungeon',price:0,desc:'Three mice between two holes in the wall: out, a dash, a sniff, a dash, and back in.',mat:'mouse'};
CATALOG['stone column']=(x,y)=>{ '@later'; PNAME='stone column'; const H=DGN.H, B=[], hw=.3, d=.09;
  const face=(nx,ny,X,Y,z,k,hi)=>{ const u=(nx?Y-y:X-x)*24, a=Math.abs(u); let c=stone(u+(nx?0:50),z,41); if(a>hw*24-3)c=u>0?C.hi:C.lo; if(hi&&z>H-30){ const w=dgnWeb(hw*24-a,H-5-z,14,43+(nx?1:0)); if(w)return sh(w,k); } return sh(c,k); };
  const oct=(h,z0,z1,hi)=>{ B.push(sided({x0:x-h,y0:y-h+d,x1:x+h,y1:y+h-d,z0,z1,foot:z0===0?1:0,c:C.st[1],top:()=>C.hi,fs:(nx,ny,X,Y,z,k)=>face(nx,ny,X,Y,z+z0,k,hi)}));
    B.push(sided({x0:x-h+d,y0:y-h,x1:x+h-d,y1:y+h,z0,z1,foot:z0===0?1:0,c:C.st[1],top:()=>C.hi,fs:(nx,ny,X,Y,z,k)=>face(nx,ny,X,Y,z+z0,k,hi)})); };
  oct(hw+.12,0,5); oct(hw+.06,5,9); oct(hw,9,H-18,true); oct(hw+.05,H-18,H-13); oct(hw+.1,H-13,H-8); oct(hw+.15,H-8,H-3);
  return prop(B,null,{}); };
CAT_INFO['stone column']={no:'P-957',name:'Stone Column',dept:'Dungeon',price:600,desc:'An eight-sided column of rough stone, ridged at its edges, stepped at its foot and its head; cobwebs in its corners.',mat:'stone'};
CATALOG['oak barrel']=(x,y)=>{ '@later'; PNAME='oak barrel'; const H=28, OK=[C.oakD,C.oak,C.oakL];
  const col=(dx,dy,z,top)=>{ if(top){ const k=Math.floor((dy+.3)/.08); return Math.hypot(dx,dy)>.24?C.oakD:((dy+.3)-k*.08<.012)?C.oakD:k&1?C.oak:sh(C.oak,1.06); }
    const a=Math.atan2(dy,dx), st=Math.floor((a+Math.PI)/(2*Math.PI/14)), c=OK[Math.floor(hash(st,0,51)*3)], e=((a+Math.PI)%(2*Math.PI/14))<.07;
    for(const hz of [4,14,24])if(z>=hz&&z<hz+3)return z<hz+1?C.ironL:(hash(st,hz,53)<.3?C.rust:C.iron);
    return e?C.oakD:hash(st,z|0,55)<.08?sh(c,.88):c; };
  return prop([...lathe(x,y,0,H,z=>.24+.05*Math.sin(Math.PI*z/H),col,2,.04)].map((b,i)=>i===0?{...b,foot:1}:b),null,{}); };
CAT_INFO['oak barrel']={no:'P-958',name:'Oak Barrel',dept:'Dungeon',price:40,desc:'An oak barrel bound with three rusted hoops. Whatever was in it is long gone.',mat:'oak, iron'};
CATALOG['crate']=(x,y)=>{ '@later'; PNAME='crate'; const w=.36, H=16, planks=(u,z,k)=>{ const row=Math.floor(z/4), seam=(z%4)<.7, pu=Math.floor((u+.5)*24); let c=[C.oak,C.oakL,sh(C.oak,.9)][row%3]; if(seam)c=C.oakD; if(pu%7===3&&(z%4)>1.5&&(z%4)<2.5&&row%3!==1)c=C.ironL; if(hash(pu,z|0,61)<.1)c=sh(c,.88); return sh(c,k); };
  return prop([sided({x0:x-w,y0:y-w,x1:x+w,y1:y+w,z0:0,z1:H,foot:1,c:C.oak,top:(X,Y)=>{ const k=Math.floor((Y-y+w)/.12); return ((Y-y+w)-k*.12)<.015?C.oakD:hash(Math.floor(X*40),Math.floor(Y*40),63)<.3?sh(C.dust,.9):sh(C.oakL,.92); },fs:(nx,ny,X,Y,z,k)=>planks(nx?Y-y:X-x,z,k)})],null,{}); };
CAT_INFO['crate']={no:'P-959',name:'Crate',dept:'Dungeon',price:12,desc:'A plank crate, nailed shut, dust on its lid.',mat:'wood'};
CATALOG['iron chest']=(x,y)=>{ '@later'; PNAME='iron chest'; const W=.42, D=.26, H=12, LH=5;
  const band=(u,z,k,lid)=>{ const bu=Math.abs(((u+W)%(W*.95))-W*.475); if(bu<.025)return sh(z%3<1?C.ironL:C.iron,k); return null; };
  const side=(nx,ny,X,Y,z,k,lid)=>{ const u=nx?Y-y:X-x; const b=band(u,z,k); if(b)return b; if(ny>0&&!lid&&Math.abs(u)<.05&&z>H-6){ if(Math.abs(u)<.012&&z>H-5&&z<H-2)return C.dark; return sh(C.ironL,k); }
    if(lid&&z<1)return sh(C.ironL,k); return sh(hash(Math.floor(u*48),z|0,71)<.12?C.oakD:(Math.floor(z/3)&1)?C.oak:sh(C.oak,.94),k); };
  return prop([sided({x0:x-W,y0:y-D,x1:x+W,y1:y+D,z0:0,z1:H,foot:1,c:C.oak,top:()=>C.oak,fs:(nx,ny,X,Y,z,k)=>side(nx,ny,X,Y,z,k,false)}),
    sided({x0:x-W-.02,y0:y-D-.02,x1:x+W+.02,y1:y+D+.02,z0:H,z1:H+LH,foot:0,c:C.oak,top:(X,Y)=>band(X-x,0,1)||(Math.abs(Math.abs(Y-y)-D*.5)<.015?C.oakD:C.oakL),fs:(nx,ny,X,Y,z,k)=>side(nx,ny,X,Y,z,k,true)})],null,{}); };
CAT_INFO['iron chest']={no:'P-960',name:'Iron-Banded Chest',dept:'Dungeon',price:80,desc:'An oak chest banded with iron, its lock plate rusted shut.',mat:'oak, iron'};
CATALOG['brazier']=(x,y)=>{ '@later'; PNAME='brazier'; const FL={ph:0}, B=[], I=C.iron, IL=C.ironL;
  for(let k=0;k<3;k++){ const a=k*2.094+.5, lx=x+Math.cos(a)*.2, ly=y+Math.sin(a)*.2; B.push({x0:lx-.025,y0:ly-.025,x1:lx+.025,y1:ly+.025,z0:0,z1:12,foot:1,nb:1,c:I,top:()=>IL,fi:()=>sh(I,.7),fj:()=>sh(I,.86)}); }
  const coal=(dx,dy,z,top)=>{ if(!top)return z<1||z>8?IL:hash(Math.floor(Math.atan2(dy,dx)*6),z|0,81)<.1?C.rust:I; const r=Math.hypot(dx,dy); if(r>.25)return IL; const n=hash(Math.floor(dx*60),Math.floor(dy*60),83); return n<.2?lit([250,110,30]):n<.3?lit([180,60,20]):n<.5?[40,28,24]:[26,20,18]; };
  B.push(...lathe(x,y,10,19,z=>.15+z*.018,coal,1.5,.035));
  const ember=(du,dv,z)=>{ if(typeof LIFE==='undefined'||LIFE.mode!==1)return null; if(z<0||z>=2.5||Math.hypot(du,dv)>.26)return null; const n=hash(Math.floor(du*50),Math.floor(dv*50)+FL.ph,85); return n<.25?lit(n<.08?[255,200,90]:[250,110,30]):null; };
  B.push({x0:x-.26,y0:y-.26,x1:x+.26,y1:y+.26,z0:18.5,z1:21,c:[250,110,30],foot:0,nb:1,life:1,top:()=>null,fi:(v,z)=>ember(v-y,0,z-18.5),fj:(u,z)=>ember(u-x,0,z-18.5)});
  const p=prop(B,null,{}); flick(p,FL,Math.round(x*11+y*7)); LAMPS.push({x,y,z:24,r:3.6,c:[.85,.32,.11],own:1,room:1,day:true,prop:p,flick:1}); return p; };
CAT_INFO['brazier']={no:'P-961',name:'Brazier',dept:'Dungeon',price:60,desc:'An iron bowl of coals on three legs, the embers breathing red.',mat:'iron, coal'};
CATALOG['gibbet']=(x,y)=>{ '@later'; PNAME='gibbet'; const H=DGN.H, Z0=44, Z1=78, hw=.22, I=C.iron, IL=C.ironL;
  const bars=(nx,ny,X,Y,z,k)=>{ const u=((nx?Y-y:X-x)+hw)*24, zz=z; if(zz<2||zz>=Z1-Z0-2||Math.abs(zz-(Z1-Z0)/2)<1.2)return sh(zz%2<1?IL:I,k); return (Math.floor(u)%4===0)?sh(I,k*(1+.1*(Math.floor(u)%8===0))):null; };
  const B=[sided({x0:x-hw,y0:y-hw,x1:x+hw,y1:y+hw,z0:Z0,z1:Z1,foot:1,c:I,top:(X,Y)=>Math.hypot(X-x,Y-y)>hw*.9||Math.abs(X-x)<.015||Math.abs(Y-y)<.015?IL:null,fs:bars}),
    {x0:x-hw+.02,y0:y-hw+.02,x1:x+hw-.02,y1:y+hw-.02,z0:Z0,z1:Z0+1.5,foot:0,nb:1,c:I,top:()=>sh(I,1.2),fi:()=>sh(I,.7),fj:()=>sh(I,.86)},skull(x,y,Z0+1.5,.11),
    {x0:x-.02,y0:y-.02,x1:x+.02,y1:y+.02,z0:Z1,z1:H-3,foot:0,nb:1,c:I,top:()=>null,fi:(v,z)=>(Math.floor(z/3)&1)?IL:I,fj:(u,z)=>(Math.floor(z/3)&1)?sh(IL,.9):sh(I,.9)}];
  return prop(B,null,{walk:1}); };
CAT_INFO['gibbet']={no:'P-962',name:'Gibbet',dept:'Dungeon',price:0,desc:'An iron cage on a chain from the ceiling, a skull at the bottom of it. Walk under it if you dare.',mat:'iron, bone'};
CATALOG['straw']=(x,y)=>{ '@later'; PNAME='straw'; const w=.4, d=.3, s=Math.round(x*7+y*3);
  const st=(u,v)=>{ if((u/w)**2+(v/d)**2>1)return null; for(let k=0;k<14;k++){ const a=hash(s,k,91)*3.14, cu=(hash(s,k,93)-.5)*w*1.4, cv=(hash(s,k,95)-.5)*d*1.4, t=(u-cu)*Math.cos(a)+(v-cv)*Math.sin(a), n=Math.abs(-(u-cu)*Math.sin(a)+(v-cv)*Math.cos(a)); if(n<.012&&Math.abs(t)<.16)return k&1?C.straw:C.strawD; } return sh(C.strawD,.8); };
  return prop([{x0:x-w,y0:y-d,x1:x+w,y1:y+d,z0:0,z1:2.5,foot:1,nb:1,c:C.strawD,top:(X,Y)=>st(X-x,Y-y),fi:(Y,z)=>Math.abs(Y-y)<d*.9?sh(hash(Math.floor(Y*48),z|0,97)<.5?C.straw:C.strawD,.72):null,fj:(X,z)=>Math.abs(X-x)<w*.9?sh(hash(Math.floor(X*48),z|0,99)<.5?C.straw:C.strawD,.86):null}],null,{walk:1}); };
CAT_INFO['straw']={no:'P-963',name:'Straw',dept:'Dungeon',price:2,desc:'A heap of old straw, dry and pale. Something sleeps in it.',mat:'straw'};
CATALOG['sarcophagus']=(x,y)=>{ '@later'; PNAME='sarcophagus'; const W=.8, D=.34, H=16, LH=6, S1=C.st[1];
  const side=(nx,ny,X,Y,z,k)=>{ const u=(nx?Y-y:X-x)*24; let c=stone(u,z,101); if(z<2)c=C.lo; if(z>=6&&z<9){ const q=Math.floor(u/6); return sh((q&1)?C.lo:C.hi,k); } return sh(c,k); };
  const top=(X,Y)=>{ const u=X-x, v=Y-y, bu=W-Math.abs(u), bv=D-Math.abs(v), b=Math.min(bu*1.4,bv*2.4); if(b<.025)return C.lo; if(b<.045)return C.mo; if(Math.abs(v)<.02&&u>-W*.6&&u<W*.4||Math.abs(u+W*.2)<.02&&Math.abs(v)<D*.55)return C.mo; return hash(Math.floor(X*40),Math.floor(Y*40),103)<.08?C.lo:C.hi; };
  return prop([sided({x0:x-W,y0:y-D,x1:x+W,y1:y+D,z0:0,z1:H,foot:1,c:S1,top:()=>S1,fs:side}),sided({x0:x-W-.04,y0:y-D-.04,x1:x+W+.04,y1:y+D+.04,z0:H,z1:H+LH,foot:0,c:C.hi,top,fs:(nx,ny,X,Y,z,k)=>sh(z<1?C.lo:z>LH-1.5?C.hi:stone((nx?Y-y:X-x)*24,z,105),k)})],null,{}); };
CAT_INFO['sarcophagus']={no:'P-964',name:'Stone Sarcophagus',dept:'Dungeon',price:500,desc:'A coffer of dressed stone under a heavy lid, a cross cut in it. Sealed.',mat:'stone'};
if(!CAT_DEPTS.some(d=>d[0]==='Dungeon'))CAT_DEPTS.push(['Dungeon','Dungeon']);
};
