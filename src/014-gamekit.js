const hash=(a,b,c=0)=>{ let h=(a*374761393+b*668265263+c*2147483647)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
const sh=(c,f)=>{ const o=[Math.min(255,c[0]*f),Math.min(255,c[1]*f),Math.min(255,c[2]*f)]; if(c.e)o.e=c.e; return o; }, mt=(k,c)=>c, TEXUV=[0,0], rlf=(c,t)=>c;
function cvNoise(u,v,k){ const i=Math.floor(u), j=Math.floor(v), s=t=>t*t*(3-2*t), su=s(u-i), sv=s(v-j), a=hash(i,j,k), b=hash(i+1,j,k), c=hash(i,j+1,k), d=hash(i+1,j+1,k); return (a+(b-a)*su)*(1-sv)+(c+(d-c)*su)*sv; }
let ROT=0; const LIFE={mode:0}; const STORY=130, T=.1, FP=24, chunkAtL=()=>null, LAMPS=[], CATALOG={}, CAT_INFO={}, CAT_DEPTS=[], WORLD={}, KIND_OF={};
const PROPS=[]; let PNAME='object';
function prop(boxes,extra,o){ const fp=boxes.filter(b=>b.z0===0||b.foot);
  const p={boxes,extra,x0:Math.min(...fp.map(b=>b.x0)),y0:Math.min(...fp.map(b=>b.y0)),x1:Math.max(...fp.map(b=>b.x1)),y1:Math.max(...fp.map(b=>b.y1)),lv:0,id:PROPS.length,name:PNAME,...o};
  p.chunk=chunkAtL((p.x0+p.x1)/2,(p.y0+p.y1)/2,p.lv); PROPS.push(p); return p; }
const sided=b=>b; function zShift(b,dz){ const nb={...b,z0:b.z0+dz,z1:b.z1+dz}; return b.fs?sided(nb):nb; }
const SQB={lv:-1,hall:{x0:78.5,x1:93.5,y0:-85.2,y1:-77},gym:{x0:78.5,x1:101.24,y0:-99.74,y1:-85.2},lau:{x0:93.5,x1:99.2,y0:-85.2,y1:-77,h:88,lv:-1},H:126,pool:{x0:78.5,x1:101.24,y0:-99.5,y1:-85.5,lv:-2}};
const LSEED={x0:66,split:76,a0:78.5,x1:93.5,c0:96,deep:-104.5,back:-89.5,walk:-77,street:-70,grass:-64+14,end:-56+14,
  b2:106,sr:[108.5,119.1],sx0:40,sx1:118,px0:40,px1:118,pend:-28,gym:[70,80],gy1:-46,pool:[80,97],pyp:-44,theatre:[46,66],ty1:-36.5,py0:-58,py1:-38,paths:[[74,77],[88,90],[54,57],[105,107]],
  play:[100,112,-58,-42],
  bed:[70,74.1,-39.9,-36.66],bedPath:[[42,44,-64,-34],[42,73,-36,-34]],arcade:[46,66,-58,-47.5],
  mkt:[121.6,132.1,-97.4,-77],mktWalk:[132.1,134.6],
  mus:[120,146,-13.5,7.5],musFront:[132.5,146,-55,-44],musPort:-58};
const CITY={tun:{x0:44,x1:51,y0:-104.5,y1:-79,d:90},brg:{x0:140,x1:147,y0:-104.5,y1:-79,deck:96},yc:(LSEED.street+LSEED.grass)/2,wX:[[41.3,43.6],[51.4,53.7]],eX:[[137.4,139.7]],xMouth:[-77,-74.6]};
const LBLD=[{id:'lbodega',x0:LSEED.split-8,y0:LSEED.walk-14,x1:LSEED.split,y1:LSEED.walk,h:130,st:1,c:[150,70,56]},{id:'lapts',x0:LSEED.a0,y0:LSEED.walk-7,x1:LSEED.x1,y1:LSEED.walk,h:130,st:1},{id:'lbodega3',x0:.8,y0:-58,x1:8.8,y1:-44,h:130,st:1}];
const landK=(x,y)=>y>=LSEED.street&&y<LSEED.grass?3:y>=LSEED.walk||y>=LSEED.grass?5:1;
const SLAB=[[168,163,150],[161,156,143],[173,168,155]], SEAM=[131,126,115];
const BRICK=[[146,80,63],[137,73,58],[154,88,70],[128,68,54]], MORTAR=[92,54,45], COPE=[182,176,164];
function woodCol(x,y){ const r=Math.floor(y*4), o=hash(r,0,13)*3, b=Math.floor(x/1.5+o);
  const c=[[150,112,72],[142,104,66],[156,118,78]][Math.floor(hash(b,r,17)*3)]; return mt('wood',(y*4-r)<.08||(x/1.5+o-b)<.03?sh(c,.75):c); }
function speck(c,x,y,k){ const n=hash(Math.floor(x*24),Math.floor(y*24),k); return n<.018?sh(c,.9):n>.988?sh(c,1.05):c; }
function grain(x,y,k,s=1){ return (cvNoise(x/(5*s),y/(5*s),k)*3+cvNoise(x/(1.7*s),y/(1.7*s),k+2)*2+cvNoise(x*2.3/s,y*2.3/s,k+4))/6+(hash(Math.floor(x*48),Math.floor(y*48),k+6)-.5)*.07; }
function crack(x,y,k,s=1.6,w=.007,on=.55){ return cvNoise(x/(s*4),y/(s*4),k+1)>on&&Math.abs(cvNoise(x/s,y/s,k)-.5)<w; }
function spot(x,y,k,s,r,p){ const i=Math.floor(x/s), j=Math.floor(y/s); if(hash(i,j,k)>p)return false; const cx=(i+.2+hash(i,j,k+1)*.6)*s, cy=(j+.2+hash(i,j,k+2)*.6)*s; return Math.hypot(x-cx,(y-cy))<r; }
const GROUT=[86,82,74], WEEDS=[[70,104,50],[92,128,60],[58,86,42],[112,140,70]];
const SLB=2;
function slabCol(x,y){ const wy=(y+(cvNoise(x*1.3+9,y*1.3,403)-.5)*.08)/SLB, j=Math.floor(wy), wx=(x+(cvNoise(x*1.3,y*1.3,401)-.5)*.08)/SLB+hash(j,0,425)*.6;
  const i=Math.floor(wx), fx=wx-i, fy=wy-j, ex=Math.min(fx,1-fx)*SLB, ey=Math.min(fy,1-fy)*SLB, e=Math.min(ex,ey), n=grain(x,y,301,1.2), px=Math.floor(x*24), py=Math.floor(y*24), hp=hash(px,py,405);
  const ci=Math.round(wx), cj=Math.round(wy), chip=ex<.14&&ey<.14&&hash(ci,cj,411)<.4&&Math.hypot(ex,ey)<.07+hash(ci,cj,413)*.07;
  const green=cvNoise(x/2.2,y/2.2,415)+(landK(x+.8,y)===1||landK(x-.8,y)===1||landK(x,y+.8)===1||landK(x,y-.8)===1?.2:0);
  if(e<.042||chip){ if(green>.7&&hp<.7)return mt('pavement',WEEDS[Math.floor(hash(px,py,417)*4)]); return mt('pavement',hp<.2?sh(GROUT,.86):hp>.9?sh(GROUT,1.1):GROUT); }
  if(e<.07&&green>.78&&hp<.35)return mt('pavement',WEEDS[Math.floor(hash(px,py,419)*4)]);
  if(hash(i,j,305)<.16&&crack(x,y,307,.9,.014,.3)){ if(green>.55&&hp<.5)return mt('pavement',WEEDS[(px+py)&3]); return mt('pavement',sh(GROUT,.95)); }
  if(spot(x,y,309,.25,.025,.07))return mt('pavement',[108,104,98]);
  let c=SLAB[Math.floor(hash(i,j,7)*3)]; const tx=(hash(i,j,421)-.5)*.12, ty=(hash(i,j,423)-.5)*.12; c=sh(c,1+tx*(fx-.5)*2+ty*(fy-.5)*2);
  if(e<.084)c=sh(c,(fx*SLB<.084||fy*SLB<.084)?1.08:.86);
  return mt('pavement',speck(n<.3?sh(c,.93):n<.36&&hp<.5?sh(c,.94):n>.72?sh(c,1.04):c,x,y,3)); }
function kerbCol(ax){ return (x,y)=>{ const a=ax==='y'?y:x, px=Math.floor(x*24), py=Math.floor(y*24), hp=hash(px,py,431), n=grain(x,y,433,.8);
  if(((a%1.5)+1.5)%1.5<.042)return mt('kerb',GROUT); const c=sh([178,174,164],.9+.16*n+(hash(Math.floor(a/1.5),0,435)-.5)*.08); return mt('kerb',hp<.03?sh(c,.75):hp>.97?sh(c,1.12):c); }; }
function kerbFace(a,z,H){ const hp=hash(Math.floor(a*24),z,437), n=grain(a,z/24,439,.8); if(((a%1.5)+1.5)%1.5<.042)return GROUT;
  let c=sh([150,146,138],.88+.18*n); if(z>=H-1)c=sh(c,1.15); else if(z<1)c=sh(c,.62); else if(z<2)c=sh(c,.8); return hp<.05?sh(c,.8):c; }
function roadCol(x,y,w){ const c=w?[86,87,90]:[62,64,68], n=grain(x,y,37,1.3), S=LSEED, yc=CITY.yc;
  if(crack(x,y,141,1.5,w?.012:.007,w?.4:.56))return mt('road',sh(c,.7));
  const p=cvNoise(x/3.2,y/3.2,143); if(!w&&p>.76)return mt('road',speck(p<.765?[44,45,48]:[54,55,58],x,y,145));
  if(!w&&y>=S.street&&y<S.grass&&Math.abs(Math.abs(y-yc)-1.6)<.45&&cvNoise(x/1.1,y/1.1,147)>.72)return mt('road',speck(sh(c,.82),x,y,149));
  return mt('road',speck(n<.34?sh(c,.92):n>.68?sh(c,w?1.08:1.06):c,x,y,41)); }
const DTBRICK=[118,50,44];

const GRASSP=[[62,100,50],[76,116,58],[90,132,66],[104,146,74]], GRASSL=[128,168,88], GRASSS=[50,84,42];
const GRASSY=[[96,104,54],[110,116,60],[124,128,68],[136,138,76]], GEARTH=[[104,88,64],[118,100,74]], GTROD=.32;
const LAWN=[[46,86,38],[56,102,44],[66,116,50],[78,130,56]];
function lawnCol(x,y){ return LAWN[cvNoise(x/9,y/9,301)>.58?2:1]; }
function grassCol(x,y){ const n=(cvNoise(x/5,y/5,29)*3+cvNoise(x/1.7,y/1.7,31)*2+cvNoise(x*2.3,y*2.3,33))/6+(hash(Math.floor(x*48),Math.floor(y*48),35)-.5)*.07, dz=hash(Math.floor(x*48),Math.floor(y*48),53);
  let e=1; for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]])for(const d of [.08,.16,.24,GTROD]){ const k=landK(x+a*d,y+b*d); if(k&&k!==1){ e=Math.min(e,d/GTROD); break; } }
  if(e<1&&n*.6+dz*.4>e*1.1+.25)return mt('grass',GEARTH[dz<.5?0:1]);
  const dry=cvNoise(x/13,y/13,51)+(dz-.5)*.05>.63, P=dry?GRASSY:GRASSP; let c=P[n<.4?0:n<.49?1:n<.58?2:3];
  for(const b of LBLD){ const dx=Math.max(b.x0-x,x-b.x1), dy=Math.max(b.y0-y,y-b.y1); if(dx<.2&&dy<.2&&Math.max(dx,dy)>0&&Math.max(dx,dy)<.2-dz*.08){ c=sh(P[0],.88); break; } }
  const cx=Math.floor(x*5), cy=Math.floor(y*5), h=hash(cx,cy,37); if(h<.15+n*.6){ const tx=(cx+.2+hash(cx,cy,39)*.6)/5, ty=(cy+.2+hash(cx,cy,41)*.6)/5, dx=x-tx, dy=y-ty;
    if(dx>=0&&dx<.055&&dy>=-.03&&dy<.03)c=dry?[150,148,92]:GRASSL; else if(dx>=.03&&dx<.085&&dy>=.03&&dy<.07)c=GRASSS; }
  const fl=cvNoise(x/4,y/4,55); if(fl>.62&&!dry){ const i=Math.floor(x*3), j=Math.floor(y*3), q=hash(i,j,57); if(q<.35){ const fx=(i+.2+hash(i,j,59)*.6)/3, fy=(j+.2+hash(i,j,61)*.6)/3, ax=Math.round((x-fx)*48), ay=Math.round((y-fy)*48);
    if(q<.12){ if(ax===0&&ay===0)return mt('grass',[236,200,64]); if(Math.abs(ax)+Math.abs(ay)===1)return mt('grass',[238,238,230]); }
    else if(ax===0&&ay===0||ax===1&&ay===0||ax===0&&ay===1)return mt('grass',sh(GRASSP[0],.86)); } }
  return mt('grass',c); }

const BRICKS=window.BRICKS={};
BRICKS.TINT=[[1,1,1],[1.05,1,.93],[.95,.98,1.05],[1.07,1.02,.88],[.99,.96,.95],[1.02,1.03,.98]];
BRICKS.face=(i,j,k,H=99,cap=false)=>{ const row=Math.floor(j/6), fy=j-row*6, off=Math.floor(hash(row,k,29)*10), jt=b=>Math.round((hash(b,row,k+31)-.5)*4), e=i+off, b0=Math.floor(e/10), cb=e<b0*10+jt(b0)?b0-1:b0, Lc=cb*10+jt(cb), Wc=(cb+1)*10+jt(cb+1)-Lc, fx=e-Lc,
    m=fy===5||fx===Wc-1, n=hash(cb,row,k), hp=hash(i,j,k+11), t=j/H;
  let c, tn=[1,1,1]; if(m){ c=62+8*n; if(t>.6&&hash(Math.floor(i/3),row,k+13)<.4&&hp<.6)return [58+12*hp,80+16*hp,46]; }
  else{ const cn=(fx===0||fx===Wc-2)&&(fy===0||fy===4)&&hash(cb,row,k+17)<.45; if(cn)c=70+8*n;
    else{ c=(108+22*n)*(1+.06*(grain(i/24,j/24,k+1,1.5)-.5)); if(fy===0)c*=1.1; else if(fy===4)c*=.86; if(fx===0)c*=1.04; else if(fx===Wc-2)c*=.93; }
    tn=BRICKS.TINT[Math.floor(hash(cb,row,k+33)*BRICKS.TINT.length)]; }
  c*=.84+.16*(1-Math.max(0,Math.min(1,(t-.72)/.28))); if(cap&&j<3)c*=.7+.1*j;
  if(Math.abs(cvNoise(i/7,j/7,k+40)-.5)<.025&&cvNoise(i/30,j/30,k+41)>.66)c*=.72;
  return [c*tn[0],c*tn[1],c*tn[2]]; };
BRICKS.one=sd=>{ const n=hash(sd,7,3), tn=BRICKS.TINT[Math.floor(hash(sd,9,5)*BRICKS.TINT.length)]; return (i,j,kk,w,h)=>{ let c=(106+24*n)*(1+.05*(grain(i/24,j/24,sd,1.5)-.5)); if(j===0)c*=1.1; else if(j>=h-1)c*=.86; if(i===0||i>=w-1)c*=.8; return [c*tn[0],c*tn[1],c*tn[2]]; }; };
BRICKS.quoins=(x0,y0,x1,y1,z0,z1,k,box)=>{ for(let r=0;r*6<z1-z0;r++){ const zt=z1-r*6, zb=Math.max(z0,zt-5); if(zt-zb<2)continue;
  for(const [cx,sx] of [[x0,-1],[x1,1]])for(const [cy,sy] of [[y0,-1],[y1,1]]){ const sd=k*977+r*31+(sx+1)*5+(sy+1), lx=(r+(sx>0)+(sy>0))&1, L=.38+.08*hash(sd,1,1), S=.2+.06*hash(sd,2,1), pr=.012+.04*hash(sd,3,1), ex=lx?L:S, ey=lx?S:L;
    box(sx<0?cx-pr:cx-ex,sy<0?cy-pr:cy-ey,sx<0?cx+ex:cx+pr,sy<0?cy+ey:cy+pr,zb,zt,BRICKS.one(sd)); } } };
