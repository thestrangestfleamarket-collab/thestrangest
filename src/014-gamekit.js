// THE GAME KIT: the old game's painters and prop makers that every place shares (hash, sh, prop, LAMPS, CATALOG, PNAME); needs nothing.
import {SHARED} from './003-shx.js';
const hash=(a,b,c=0)=>{ let h=(a*374761393+b*668265263+c*2147483647)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
const sh=(c,f)=>{ const o=[Math.min(255,c[0]*f),Math.min(255,c[1]*f),Math.min(255,c[2]*f)]; if(c.e)o.e=c.e; return o; }, mt=(k,c)=>c, TEXUV=[0,0], rlf=(c,t)=>c;
function cvNoise(u,v,k){ const i=Math.floor(u), j=Math.floor(v), fu=u-i, fv=v-j, su=fu*fu*(3-2*fu), sv=fv*fv*(3-2*fv), a=hash(i,j,k), b=hash(i+1,j,k), c=hash(i,j+1,k), d=hash(i+1,j+1,k); return (a+(b-a)*su)*(1-sv)+(c+(d-c)*su)*sv; }
let ROT=0; const LIFE={mode:0}; const STORY=130, T=.1, FP=24, chunkAtL=()=>null, LAMPS=[], CATALOG={}, CAT_INFO={}, CAT_DEPTS=[], WORLD={}, KIND_OF={};
const PROPL=[]; SHARED.PNAME='object';
function prop(boxes,extra,o){ const fp=boxes.filter(b=>b.z0===0||b.foot);
  const p={boxes,extra,x0:Math.min(...fp.map(b=>b.x0)),y0:Math.min(...fp.map(b=>b.y0)),x1:Math.max(...fp.map(b=>b.x1)),y1:Math.max(...fp.map(b=>b.y1)),lv:0,id:PROPL.length,name:SHARED.PNAME,...o};
  p.chunk=chunkAtL((p.x0+p.x1)/2,(p.y0+p.y1)/2,p.lv); PROPL.push(p); return p; }
const sided=b=>b; function zShift(b,dz){ const nb={...b,z0:b.z0+dz,z1:b.z1+dz}; return b.fs?sided(nb):nb; }
const SQB={lv:-1,hall:{x0:78.5,x1:93.5,y0:-85.2,y1:-77},gym:{x0:78.5,x1:101.24,y0:-99.74,y1:-85.2},lau:{x0:93.5,x1:99.2,y0:-85.2,y1:-77,h:88,lv:-1},H:126,pool:{x0:78.5,x1:101.24,y0:-99.5,y1:-85.5,lv:-2}};
const LSEED={x0:66,split:76,a0:78.5,x1:93.5,c0:96,deep:-104.5,back:-89.5,walk:-77,street:-70,grass:-64+14,end:-56+14,
  b2:106,sr:[108.5,119.1],sx0:40,sx1:118,px0:40,px1:118,pend:-28,gym:[70,80],gy1:-46,pool:[80,97],pyp:-44,theatre:[46,66],ty1:-36.5,py0:-58,py1:-38,paths:[[74,77],[88,90],[54,57],[105,107]],
  play:[100,112,-58,-42],
  bed:[70,74.1,-39.9,-36.66],bedPath:[[42,44,-64,-34],[42,73,-36,-34]],arcade:[46,66,-58,-47.5],
  mkt:[121.6,132.1,-97.4,-77],mktWalk:[132.1,134.6],
  mus:[120,146,-13.5,7.5],musFront:[132.5,146,-55,-44],musPort:-58};
const KCITY={tun:{x0:44,x1:51,y0:-104.5,y1:-79,d:90},brg:{x0:140,x1:147,y0:-104.5,y1:-79,deck:96},yc:(LSEED.street+LSEED.grass)/2,wX:[[41.3,43.6],[51.4,53.7]],eX:[[137.4,139.7]],xMouth:[-77,-74.6]};
const LBLD=[{id:'lbodega',x0:LSEED.split-8,y0:LSEED.walk-14,x1:LSEED.split,y1:LSEED.walk,h:130,st:1,c:[150,70,56]},{id:'lapts',x0:LSEED.a0,y0:LSEED.walk-7,x1:LSEED.x1,y1:LSEED.walk,h:130,st:1},{id:'lbodega3',x0:.8,y0:-58,x1:8.8,y1:-44,h:130,st:1}];
const landK=(x,y)=>y>=LSEED.street&&y<LSEED.grass?3:y>=LSEED.walk||y>=LSEED.grass?5:1;
const SLAB=[[156,152,144],[148,144,136],[162,158,150]], SEAM=[131,126,115];
const BRICK=[[146,80,63],[137,73,58],[154,88,70],[128,68,54]], MORTAR=[92,54,45], COPE=[182,176,164];
function woodCol(x,y){ const r=Math.floor(y*4), o=hash(r,0,13)*3, b=Math.floor(x/1.5+o);
  const c=[[150,112,72],[142,104,66],[156,118,78]][Math.floor(hash(b,r,17)*3)]; return mt('wood',(y*4-r)<.08||(x/1.5+o-b)<.03?sh(c,.75):c); }
function speck(c,x,y,k){ const n=hash(Math.floor(x*24),Math.floor(y*24),k); return n<.018?sh(c,.9):n>.988?sh(c,1.05):c; }
function grain(x,y,k,s=1){ return (cvNoise(x/(5*s),y/(5*s),k)*3+cvNoise(x/(1.7*s),y/(1.7*s),k+2)*2+cvNoise(x*2.3/s,y*2.3/s,k+4))/6+(hash(Math.floor(x*48),Math.floor(y*48),k+6)-.5)*.07; }
function crack(x,y,k,s=1.6,w=.007,on=.55){ return cvNoise(x/(s*4),y/(s*4),k+1)>on&&Math.abs(cvNoise(x/s,y/s,k)-.5)<w; }
function spot(x,y,k,s,r,p){ const i=Math.floor(x/s), j=Math.floor(y/s); if(hash(i,j,k)>p)return false; const cx=(i+.2+hash(i,j,k+1)*.6)*s, cy=(j+.2+hash(i,j,k+2)*.6)*s; return Math.hypot(x-cx,(y-cy))<r; }
const GROUT=[86,82,74], WEEDC=[[70,104,50],[92,128,60],[58,86,42],[112,140,70]];
const SLB=2.4;
// the sidewalk: New York's 5 ft flags, worn: patched, tipped, stained, gum, cracks, broken corners, weeds in the joints and cracks (a weed pixel carries .w, where THE STREET'S WEAR stands its tufts)
function slabCol(x,y){ const i=Math.floor(x/SLB), j=Math.floor(y/SLB), fx=x/SLB-i, fy=y/SLB-j, ex=Math.min(fx,1-fx)*SLB, ey=Math.min(fy,1-fy)*SLB, e=Math.min(ex,ey), px=Math.floor(x*24), py=Math.floor(y*24), hp=hash(px,py,405), n=grain(x,y,301,.9);
  const green=cvNoise(x/2.2,y/2.2,415)+(landK(x+.8,y)===1||landK(x-.8,y)===1||landK(x,y+.8)===1||landK(x,y-.8)===1?.25:0), weed=k=>{ const c=WEEDC[Math.floor(hash(px,py,k)*4)], o=[c[0],c[1],c[2]]; o.w=1; return mt('pavement',o); };
  if(e<.03){ if(green>.62&&hp<.6)return weed(417); return mt('pavement',hp<.4?[78,76,72]:[92,89,84]); }
  const k=hash(i,j,7); let b=k<.1?[186,183,176]:k>.7?[124,120,113]:SLAB[Math.floor(hash(i,j,9)*3)]; if(e<.11)b=sh(b,1.07);
  let t=1+(hash(i,j,421)-.5)*.06*(fx-.5)+(hash(i,j,423)-.5)*.06*(fy-.5); if(hash(i,j,425)<.22){ t+=(fx-.5)*.18; if(fx<.05)t*=.7; }
  let c=sh(b,t*(.93+.12*n)); const g=Math.max(0,cvNoise(x/3.5,y/3.5,427)-.55)*.4+Math.max(0,cvNoise(x/1.2,y/1.2,429)-.72)*.6; c=sh(c,1-g);
  { const cx=fx<.5?0:1, cy=fy<.5?0:1, ci=i+cx, cj=j+cy, dx=Math.abs(fx-cx)*SLB, dy=Math.abs(fy-cy)*SLB, rr=.16+hash(ci,cj,431)*.26, dd=Math.hypot(dx,dy)*(.8+.5*cvNoise(Math.atan2(dy,dx)*3,ci,433));
    if(hash(ci,cj,435)<.35&&dd<rr){ if(dd>rr-.035)return mt('pavement',sh(c,.5)); if(green>.5&&cvNoise(x*3,y*3,437)>.5)return weed(439); return mt('pavement',sh([c[0]*.5+60,c[1]*.5+56,c[2]*.5+50],.75+.3*hash(px,py,441))); } }
  if(hash(i,j,305)<.5){ const an=hash(i,j,307)*Math.PI, d=Math.abs((fx-hash(i,j,309))*SLB*Math.sin(an)-(fy-.5)*SLB*Math.cos(an))+(cvNoise(x*6,y*6,311)-.5)*.06;
    if(d<.022){ if(green>.45&&cvNoise(x/1.5,y/1.5,313)<.8&&hp<.45)return weed(315); return mt('pavement',sh(c,.5)); } if(d<.04)c=sh(c,.9); }
  if(e<.06&&green>.7&&hp<.5)return weed(419);
  const gd=.55+.6*Math.exp(-(((cvNoise(x/9,y/9,317)-.5)*6)**2)), s=spot(x,y,319,.21,.032,.1*gd)||spot(x,y,321,.37,.045,.045*gd)?(hash(px,py,323)<.6?[58,56,54]:sh(c,.7)):null; if(s)return mt('pavement',s);
  if(spot(x,y,309,3.1,.55,.1))c=sh(c,.8);
  return mt('pavement',speck(c,x,y,3)); }
// the kerb: worn concrete, 6 in. wide, in 1.5-tile lengths, its road edge chipped and dark
function kerbCol(ax){ return (x,y)=>{ const a=ax==='y'?y:x, px=Math.floor(x*24), py=Math.floor(y*24), hp=hash(px,py,431), n=grain(x,y,433,.8);
  if(((a%1.5)+1.5)%1.5<.035)return mt('kerb',[90,88,84]); const c=sh([164,160,152],.88+.14*n+(hash(Math.floor(a/1.5),0,435)-.5)*.1-Math.max(0,cvNoise(a/2,0,445)-.6)*.5); return mt('kerb',hp<.05?sh(c,.7):hp>.97?sh(c,1.1):c); }; }
function kerbFace(a,z,H){ const hp=hash(Math.floor(a*24),z,437), n=grain(a,z/24,439,.8); if(((a%1.5)+1.5)%1.5<.035)return [72,70,66];
  let c=sh([150,146,138],.86+.16*n); if(z>=H-1)c=cvNoise(a*2,0,441)>.55?sh(c,.62):sh(c,1.12); else if(z<1)c=sh(c,.5); else if(z<3)c=sh(c,.68+.08*z-(cvNoise(a/1.5,0,443)>.6?.12:0)); return hp<.06?sh(c,.75):c; }
function roadCol(x,y,w){ const c=w?[86,87,90]:[62,64,68], n=grain(x,y,37,1.3), S=LSEED, yc=KCITY.yc;
  if(crack(x,y,141,1.5,w?.012:.007,w?.4:.56))return mt('road',sh(c,.7));
  const p=cvNoise(x/3.2,y/3.2,143); if(!w&&p>.76)return mt('road',speck(p<.765?[44,45,48]:[54,55,58],x,y,145));
  if(!w&&y>=S.street&&y<S.grass&&Math.abs(Math.abs(y-yc)-1.6)<.45&&cvNoise(x/1.1,y/1.1,147)>.72)return mt('road',speck(sh(c,.82),x,y,149));
  return mt('road',speck(n<.34?sh(c,.92):n>.68?sh(c,w?1.08:1.06):c,x,y,41)); }
const DTBRICK=[118,50,44];

// the lawns: the edge-ring tree crowns' greens (with how often each shows); tuftCol paints them as faceted tufts seen from above, lit from one side
const TUFTC=[[65,103,55,1528],[81,123,53,2924],[95,127,55,1761],[89,141,57,3121],[105,140,60,1844],[99,156,63,2692],[116,154,66,1357],[115,172,70,1093]], TUFTW=TUFTC.reduce((a,c)=>a+c[3],0);
const tuftPick=r=>{ r*=TUFTW; for(const c of TUFTC)if((r-=c[3])<0)return c; return TUFTC[0]; };
const TQ=new Int32Array(128*128*2).fill(-1e9), TP=new Float32Array(128*128*6);   // each tuft's spot, turn and colour, kept while the painter is near it
function tuftCol(x,y){ const u=x/.5, v=y/.5, i0=Math.floor(u), j0=Math.floor(v); let d1=9, d2=9, bq=0, bi=0, bj=0;
  for(let j=j0-1;j<=j0+1;j++)for(let i=i0-1;i<=i0+1;i++){ const q=((j&127)<<7|(i&127)), t=q*6; if(TQ[q*2]!==i||TQ[q*2+1]!==j){ TQ[q*2]=i; TQ[q*2+1]=j; const px=i+.1+.8*hash(i,j,601), py=j+.1+.8*hash(i,j,603), c=tuftPick(hash(i,j,609)*.35+cvNoise(px/4.4,py/4.4,611)*.65), m=.55+.3*cvNoise(px/9,py/9,613);
      TP[t]=px; TP[t+1]=py; TP[t+2]=hash(i,j,605)*6.2832; TP[t+3]=c[0]*m; TP[t+4]=c[1]*m; TP[t+5]=c[2]*m; }   // in clumps of light and dark that still show far off; darker than the colours, as the standing tufts read
    const d=(u-TP[t])*(u-TP[t])+(v-TP[t+1])*(v-TP[t+1]); if(d<d1){ d2=d1; d1=d; bq=t; bi=i; bj=j; } else if(d<d2)d2=d; }
  const r=Math.sqrt(d1), e=Math.sqrt(d2)-r, rot=TP[bq+2], a=Math.atan2(v-TP[bq+1],u-TP[bq])-rot, k=Math.floor((a/6.2832-Math.floor(a/6.2832))*5), out=r>.32, ca=(k+.5+(out?.5:0))/5*6.2832+rot, t=out?.9:.4;
  const nx=Math.cos(ca)*t, ny=Math.sin(ca)*t, s=(.62+.5*Math.max(0,(-.45*nx-.55*ny+.7)/Math.sqrt(nx*nx+ny*ny+1))+.1*(hash(bi*5+k+(out?7:0),bj,607)-.5))*(e<.07?.72:r>.62?.82:1);
  return [Math.min(255,TP[bq+3]*s),Math.min(255,TP[bq+4]*s),Math.min(255,TP[bq+5]*s)]; }
function lawnCol(x,y){ return tuftCol(x,y); }
function grassCol(x,y){ return mt('grass',tuftCol(x,y)); }

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
BRICKS.quoins=(x0,y0,x1,y1,z0,z1,k,box)=>{ '@later'; for(let r=0;r*6<z1-z0;r++){ const zt=z1-r*6, zb=Math.max(z0,zt-5); if(zt-zb<2)continue;
  for(const [cx,sx] of [[x0,-1],[x1,1]])for(const [cy,sy] of [[y0,-1],[y1,1]]){ const sd=k*977+r*31+(sx+1)*5+(sy+1), lx=(r+(sx>0)+(sy>0))&1, L=.38+.08*hash(sd,1,1), S=.2+.06*hash(sd,2,1), pr=.012+.04*hash(sd,3,1), ex=lx?L:S, ey=lx?S:L;
    box(sx<0?cx-pr:cx-ex,sy<0?cy-pr:cy-ey,sx<0?cx+ex:cx+pr,sy<0?cy+ey:cy+pr,zb,zt,BRICKS.one(sd)); } } };
export {BRICKS, CAT_DEPTS, CAT_INFO, CATALOG, COPE, crack, cvNoise, DTBRICK, FP, grain, grassCol, hash, kerbCol, kerbFace, KIND_OF, LAMPS, lawnCol, LBLD, LIFE, LSEED, mt, prop, PROPL, rlf, roadCol, ROT, sh, sided, slabCol, speck, spot, SQB, STORY, T, TUFTC, tuftCol, woodCol, zShift};
