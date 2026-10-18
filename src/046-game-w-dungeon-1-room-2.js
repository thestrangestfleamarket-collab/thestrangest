const DGN=(B=>({b:B,x0:B.x0+T,x1:B.x1-T,y0:B.y0+T,y1:B.y1-T,cx:(B.x0+B.x1)/2,cy:(B.y0+B.y1)/2,H:B.h-4,in:[B.x0-T,B.y0-T,B.x1+T,B.y1+T],
  torches:[{w:'b',u:2.6},{w:'b',u:10.2},{w:'l',u:2.4},{w:'l',u:8.2},{w:'r',u:3.2},{w:'r',u:8},{w:'f',u:6.4}],
  holes:[{w:'b',u:.7},{w:'b',u:5.3},{w:'l',u:9.9},{w:'l',u:5.1},{w:'r',u:6.3},{w:'r',u:.9}],chains:[{w:'b',u:7.9,l:46},{w:'r',u:1.3,l:34},{w:'f',u:2.2,l:40},{w:'f',u:10.6,l:28}],
  door:{w:'l',u:5.4},slit:{w:'b',u:6.4},tally:{w:'r',u:4.9},banners:[{w:'r',u:9.6},{w:'f',u:4.3}],ivy:[{w:'b',u:1.4,h:96},{w:'b',u:12,h:70},{w:'l',u:.9,h:110},{w:'f',u:8.6,h:60},{w:'r',u:.5,h:80}],
  cracks:[{w:'b',u:4,z:110},{w:'b',u:9,z:80},{w:'l',u:3.3,z:100},{w:'l',u:7.7,z:60},{w:'r',u:2.2,z:118},{w:'r',u:7,z:90},{w:'f',u:1.1,z:100},{w:'f',u:9.4,z:84}]}))(LBLD.find(b=>b.id==='ldungeon'));
const DGP={st:[[72,68,64],[80,76,70],[64,60,58],[76,70,62]],hi:[98,94,88],lo:[46,44,42],mo:[20,19,19],dark:[9,9,11],moss:[56,74,44],mossL:[74,96,54],mould:[48,52,44],
  cob:[[70,66,62],[78,74,68],[62,58,56],[74,68,60],[66,64,62]],joint:[20,18,18],dust:[108,100,86],straw:[150,124,62],strawD:[112,90,44],bone:[190,180,156],
  iron:[44,42,44],ironL:[78,76,78],rust:[96,58,34],oak:[72,48,28],oakL:[92,64,38],oakD:[50,32,18],web:[142,140,132],webL:[170,168,160],ivy:[46,78,40],ivyL:[70,108,54],ivyD:[30,52,28],vine:[58,50,34],ban:[112,34,38],banD:[80,22,28],banL:[138,52,54],gold:[168,138,60],night:[14,18,30],moon:[40,48,70],soot:[14,13,13]};
const dgnLit=c=>Object.assign([...c],{e:1});
function dgnStone(u,z,seed){ const j=Math.floor(z/14), zz=z-j*14, L=24+Math.floor(hash(j,1,seed)*19), o=hash(j,0,seed)*L, k=Math.floor((u+o)/L), uu=(u+o)-k*L;
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
function dgnWeb(du,dz,r,seed){ if(du<0||dz<0||du>r||dz>r)return null; const d=Math.hypot(du,dz), a=Math.atan2(dz,du); if(d>r)return null;
  const spoke=Math.abs(((a*7/(Math.PI/2))%1)-.5)>.46&&d<r*(.75+.25*hash(Math.floor(a*7/(Math.PI/2)),0,seed)), ring=(d%7)<.9&&hash(Math.floor(d/7),Math.floor(a*20),seed)<.75;
  if(spoke||ring)return d>r*.8?DGP.web:DGP.webL; return hash(Math.floor(du),Math.floor(dz),seed+9)<.03?DGP.web:null; }
function dgnChain(du,dz,l){ const a=Math.abs(du); if(dz>7||dz<-l-6)return null;
  if(dz>=0)return Math.hypot(du,dz-3.5)<3.6&&Math.hypot(du,dz-3.5)>1.8?DGP.ironL:null;
  const k=Math.floor(-dz/4), wide=k&1, v=-dz-k*4; if(-dz<=l){ if(wide)return a<2.2&&a>.8&&!(v<.6&&a>1.6)?(v<1.5?DGP.ironL:DGP.iron):null; return a<1?(v<1?DGP.ironL:DGP.iron):null; }
  const q=Math.hypot(du,dz+l+3); return q<4.2&&q>2.6?(dz+l+3>1?DGP.ironL:DGP.rust):null; }
function dgnDoor(du,dz){ const a=Math.abs(du); if(dz>=92||a>=23)return null;
  if(dz>=76||a>=15){ const j=Math.floor(dz/12), o=(j&1)*8, k=Math.floor((a+o)/16); if((dz%12)<1.2||((a+o)%16)<1.2)return DGP.mo; return (j+k)&1?DGP.hi:DGP.st[1]; }
  if(a>=14)return DGP.dark;
  const pl=Math.floor((du+14)/5.6), pu=(du+14)-pl*5.6; let c=pu<.6?DGP.oakD:[DGP.oak,DGP.oakL,DGP.oak,DGP.oakL,DGP.oak][pl]||DGP.oak;
  if(hash(Math.floor(du),Math.floor(dz/3),77)<.12)c=sh(c,.86);
  for(const bz of [8,36,64]){ if(dz>=bz&&dz<bz+5){ const r=Math.floor((du+14)/7), ru=(du+14)-r*7; return (ru>2.6&&ru<4.4&&dz>=bz+1.5&&dz<bz+3.5)?DGP.ironL:(dz<bz+1||dz>=bz+4)?DGP.rust:DGP.iron; } }
  if(dz>=44&&dz<58&&a<6){ if(a>=5||dz<45||dz>=57)return DGP.iron; return (Math.floor(du+6)%3===1)?DGP.iron:DGP.dark; }
  const h=Math.hypot(du-7,dz-26); if(h<3.4&&h>2)return dz-26>0?DGP.ironL:DGP.rust; if(Math.hypot(du-7,dz-30)<1.4)return DGP.iron;
  return c; }
function dgnSlit(du,dz){ const a=Math.abs(du); if(dz<84||dz>=112||a>=12)return null;
  if(dz>=108||dz<88||a>=8){ return ((Math.floor(dz/6)+(du>0))&1)?DGP.hi:DGP.st[0]; }
  if(dz>=106||a>=7)return DGP.dark;
  if(a<7&&Math.abs(((du+7)%4.7)-2.35)<.6)return DGP.iron;
  return dgnLit(dz>100&&hash(Math.floor(du),Math.floor(dz),81)<.15?DGP.moon:DGP.night); }
function dgnSoot(du,dz,seed){ if(dz<0||dz>40)return 1; const w=4+dz*.35, a=Math.abs(du)/w; if(a>1)return 1; const k=(1-a)*(1-dz/40); return 1-k*(.5+.3*hash(Math.floor(du),Math.floor(dz),seed)); }
function dgnTally(du,dz){ if(du<0||du>52||dz<46||dz>=62)return null; const row=dz>=54?0:1, z=dz-(row?46:54), g=Math.floor(du/13), gu=du-g*13; if(row===1&&g>2)return null;
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
function dgnBanner(du,dz,seed){ const a=Math.abs(du); if(dz<-3||a>15)return null;
  if(dz<1)return a>14?DGP.ironL:Math.hypot(a-15,dz+1.5)<2?DGP.ironL:DGP.iron;
  const hem=38+10*Math.sin(du/3.1+seed)+7*hash(Math.floor(du/2),0,seed); if(dz>hem)return null;
  if(dz>hem-14&&hash(Math.floor(du/2),Math.floor(dz/3),seed+2)<(dz-hem+14)/16)return null;
  if(hash(Math.floor(du),Math.floor(dz),seed+3)<.04)return null;
  if(a>12)return DGP.gold; if(dz<4)return DGP.gold;
  const tw=Math.abs(du)<4&&dz>14&&dz<30, cr=dz>=10&&dz<14&&Math.abs(du)<5&&(Math.floor(du+5)%3!==1||dz>=12);
  if(tw||cr)return (Math.floor(du+4)%2===Math.floor(dz)%2)?DGP.gold:sh(DGP.gold,.86);
  return hash(Math.floor(du/3),Math.floor(dz/3),seed+4)<.3?DGP.banD:dz>24?DGP.banD:DGP.ban; }
function dungeonWall(q,nx,ny,X,Y,z,f,R=DGN){ const e=.06, H=R.H, w=ny>0&&Math.abs(Y-R.y0)<e?'b':ny<0&&Math.abs(Y-R.y1)<e?'f':nx>0&&Math.abs(X-R.x0)<e?'l':'r';
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
function dungeonFloorCol(x,y,R=DGN){ const S=.26, px=x-R.x0, py=y-R.y0, j=Math.floor(py/S), o=(j&1)*S/2, i=Math.floor((px+o)/S);
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
