// THE PARK: its layout, the forest (instanced trees with sway in the shader), paths and the park wall.
import {SHARED, THREE} from './003-shx.js';
import {B64, F32} from './003a-skin.js';
import {BATCH, CLIP, CLOCK, CULL, DN, LEVELS, LITE, NPCS, PARK, PERFX, pos, ROOMS, UI, VIS, WED, WEEDS} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {CASTLE, CLIPX, EASTX, FADE, FIX, grab, lamps, LAY, LEVEL, MAINX, MAPG, MODS, NORTHX, NORTHY, PARKGX, PARKLAKE, PARKRY, QS, SOL, SYS, TILE, ZU} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
import {OBJ, PEEK} from './008-batch.js';
import {BRICKS} from './014-gamekit.js';
import {BLOCKS} from './038zb-blocks.js';
import {FOREST, PROPS} from './039-bodega.js';
import {GCAVE} from './060-cave.js';
import {FOUNT} from './060a-fount.js';
import {TREEGEN} from './060b-trees.js';
PARK.noTrees=QS.get('trees')!=='1';   // no trees on the map yet (the park's, the street's, the skyline's); ?trees=1 shows them
window.PARK=Object.assign(PARK,{x0:50,x1:108,y0:-61+NORTHY,y1:12.5+NORTHY+NORTHX,gate:[92.5,99.5],round:[96,-47,7]});
PARK.sway={value:0}; PARK.windK={value:1}; PARK.swayAt={value:new THREE.Vector4(0,0,0,25*TILE)};
PARK.TRK=1.65; PARK.tick=()=>{ PARK.sway.value=performance.now()/1000; const A=PARK.swayAt.value; A.x=pos.x; A.y=SHARED.py??pos.y; A.z=pos.z; if(NPCS.R)A.w=NPCS.R; };
PARK.Q=[]; PARK.in=false; PARK.ready=false; PARK.onShow=[]; PARK.later=f=>PARK.ready?PARK.run(f):PARK.Q.push(f);
await grab('parkwall',async()=>{ const PO=LAY.o('park'), PE=LAY.e('park'); PARK.ox=PO.x; PARK.oy=PO.y; PARK.x0=50-MAINX.w+PE[0]; PARK.x1=EASTX+PE[2]; PARK.y0+=PE[1]; PARK.y1+=PE[3]; const X=x=>SHARED.BOD.XS(x+PO.x), Z=y=>SHARED.BOD.ZS(y+PO.y), Y=SHARED.BOD.YS, {hash,grain,speck,grassCol}=SHARED.BOD.g, P=PARK, U=TILE/.84, f32=F32, b8=B64;
  P.round=[PARKGX,PARKRY,7]; P.gate=[PARKGX-5,PARKGX+5]; P.lake=PARKLAKE; const RX=x=>x-96+P.round[0], RY=y=>y+47+P.round[1];
  const WA=3; P.wobX=y=>P.armX(y)-P.round[0]; P.wobY=x=>P.armY(x)-P.round[1];
  const CF=CASTLE.b[3]-PO.y+1, CGX=CASTLE.gate-PO.x, CL=[CASTLE.lot[0]-PO.x,CASTLE.lot[2]-PO.y,CASTLE.lot[1]-PO.x,CASTLE.lot[3]-PO.y], inCL=(x,y,m=0)=>x>CL[0]-m&&x<CL[2]+m&&y>CL[1]-m&&y<CL[3]+m, [LX,LY,LR]=P.lake, [RX0,RY0]=P.round;
  const SEG=P.segs=LEVEL.paths.map(q=>[q.a[0]-PO.x,q.a[1]-PO.y,q.b[0]-PO.x,q.b[1]-PO.y]);
  const sgd=(x,y,a,b)=>{ const dx=b[0]-a[0], dy=b[1]-a[1], t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1))); return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t); };
  const segD=P.segD=(x,y)=>{ let m=1e9; for(let si=0;si<SEG.length;si++){ const [ax,ay,bx,by]=SEG[si]; if(si===1&&P.bend&&x>P.bend.x0&&x<P.bend.x1){ const L=P.bend.L; for(let i=0;i<3;i++)m=Math.min(m,sgd(x,y,L[i],L[i+1])); continue; } const dx=bx-ax, dy=by-ay, L=Math.hypot(dx,dy), ux=dx/L, uy=dy/L, px=x-ax, py=y-ay, s=px*ux+py*uy; let d; if(s<=0)d=Math.hypot(px,py); else if(s>=L)d=Math.hypot(x-bx,y-by); else d=Math.abs(px*-uy+py*ux-WA*Math.sin(2*Math.PI*Math.round(L/70)*s/L)); if(d<m)m=d; } return m; };
  P.armY=x=>{ const [ax,ay,bx]=SEG[1], L=bx-ax; return ay+WA*Math.sin(2*Math.PI*Math.round(L/70)*(x-ax)/L); }; P.armX=y=>{ const [ax,ay,,by]=SEG[0], L=by-ay; return ax+WA*Math.sin(2*Math.PI*Math.round(L/70)*(y-ay)/L); };
  const pd=P.pd=(x,y)=>{ const [cx,cy,r]=P.round; return Math.min(segD(x,y)-3.6,Math.hypot(x-cx,y-cy)-r,FOUNT.trackD(x,y)); };
  const path=(x,y)=>pd(x,y)<0;   P.path=path; FOUNT.at(P);
  const HK=[[LX-LR-1,LY-LR-1,LX+LR+1,LY+LR+1],[CL[0]-1.5,CL[1]-1.5,CL[2]+1.5,CL[3]+1.5],[RX(90)-3,RY(-41.5)-3,RX(102)+3,RY(-41.5)+3],...(typeof GCAVE!=='undefined'?GCAVE.keep(P):[]),...(LEVEL.parkPlaces.sites||[]).map(q=>[q.x-q.w/2-2,q.y-q.d/2-2,q.x+q.w/2+2,q.y+q.d/2+2])];
  const ss=(a,b,v)=>{ const t=Math.max(0,Math.min(1,(v-a)/(b-a))); return t*t*(3-2*t); }, cvn=SHARED.BOD.g.cvNoise;
  P.hill=(x,y)=>{ if(x<P.x0||x>P.x1||y<P.y0||y>P.y1)return 0; const [cx,cy,r]=P.round;
    let d=Math.min(pd(x,y),x-P.x0-1.5,P.x1-x-1.5,y-P.y0-9,P.y1-y-1.5,FOUNT.away(x,y)); if(d<=0)return 0;
    for(const b of HK){ const e=Math.max(b[0]-x,x-b[2],b[1]-y,y-b[3]); if(e<d)d=e; if(d<=0)return 0; }
    const n=cvn(x/12,y/12,501)*.7+cvn(x/5,y/5,503)*.3; return 1.6*TILE*ss(0,6,d)*Math.max(0,(n-.33)/.67); };
  const BK=P.brook=(()=>{ const K=[...((LEVEL.parkPlaces.brook&&LEVEL.parkPlaces.brook.pts)||[]).map(p=>[p[0],p[1]]),[LX,LY]], Q=[]; let bs=null;
    { const [ax,ay]=K[0], l=Math.hypot(ax-K[1][0],ay-K[1][1]), ux=(ax-K[1][0])/l, uy=(ay-K[1][1])/l; for(let a=-1.3;a<=1.3;a+=.05){ const dx=ux*Math.cos(a)-uy*Math.sin(a), dy=ux*Math.sin(a)+uy*Math.cos(a); let t=0; while(t<40&&FOUNT.lake(ax+dx*t,ay+dy*t)>=0)t+=.25; if(t>=40)continue; let ok=true; for(let u=0;u<=t+4;u+=.5)if(FOUNT.ter(ax+dx*u,ay+dy*u)<7)ok=false; if(ok&&(!bs||t<bs[0]))bs=[t,dx,dy]; } if(bs)K.unshift([ax+bs[1]*(bs[0]+4),ay+bs[2]*(bs[0]+4)]); }
    for(let i=0;i<K.length-1;i++){ const a=K[Math.max(0,i-1)], b=K[i], c=K[i+1], d=K[Math.min(K.length-1,i+2)]; for(let k=0;k<16;k++){ const t=k/16, f=j=>.5*(2*b[j]+(c[j]-a[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t*t+(3*b[j]-a[j]-3*c[j]+d[j])*t*t*t); Q.push([f(0),f(1)]); } } Q.push(K[K.length-1]);
    const acc=[0]; for(let i=1;i<Q.length;i++)acc.push(acc[i-1]+Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1])); const SL=acc[acc.length-1], N=Math.round(SL/.5), C=[];
    for(let k=0,j=0;k<=N;k++){ const s=k*SL/N; while(j<Q.length-2&&acc[j+1]<s)j++; const t=(s-acc[j])/(acc[j+1]-acc[j]||1); C.push([Q[j][0]+(Q[j+1][0]-Q[j][0])*t,Q[j][1]+(Q[j+1][1]-Q[j][1])*t,s]); }
    const sK=bs?acc[16]:0; let kC=0; while(kC<N&&FOUNT.lake(C[kC][0],C[kC][1])<0)kC++; const sC=C[kC][2], LK=-.22+(.5*ZU-.004)*.84/TILE;
    const RF=[20,47,74,101,127,150].map(r=>Math.round(sK+r*(SL-sK)/185)), B=1.4, W=s=>1.45+.3*Math.sin((s-sK)*.13+1)+.15*Math.sin((s-sK)*.41)+1.8*(1-ss(sC,sC+8,s))+(LR-1.45-B)*ss(SL-2.2*LR,SL-.4*LR,s),
      L=s=>-.3-RF.reduce((a,r)=>a+.045*ss(r-.5,r+.5,s),0)+(LK+.3)*(1-ss(sW-.25,sW+.25,s)), D=s=>.42-L(s)+.5*ss(SL-18,SL-6,s), G=new Map(), gk=(i,j)=>i*4096+j, st=[];
    for(let k=0;k<N;k++){ const [x0,y0]=C[k], [x1,y1]=C[k+1], r=W(C[k][2])+B+6; for(let i=Math.floor((Math.min(x0,x1)-r)/4);i<=Math.floor((Math.max(x0,x1)+r)/4);i++)for(let j=Math.floor((Math.min(y0,y1)-r)/4);j<=Math.floor((Math.max(y0,y1)+r)/4);j++){ const g=gk(i,j); if(!G.has(g))G.set(g,[]); G.get(g).push(k); } }
    const q=(x,y)=>{ const l=G.get(gk(Math.floor(x/4),Math.floor(y/4))); if(!l)return null; let bd=1e9, bs=0, sg=1;
      for(const k of l){ const [x0,y0,s0]=C[k], [x1,y1,s1]=C[k+1], vx=x1-x0, vy=y1-y0, t=Math.max(0,Math.min(1,((x-x0)*vx+(y-y0)*vy)/(vx*vx+vy*vy))), d=Math.hypot(x-x0-vx*t,y-y0-vy*t); if(d<bd){ bd=d; bs=s0+(s1-s0)*t; sg=vx*(y-y0)-vy*(x-x0)>0?1:-1; } } return [bd,bs,sg]; };
    const h=(x,y)=>{ const r=q(x,y); if(!r)return null; const [d,s]=r, w=W(s), e=d-w; if(e>=B)return null; let v=-D(s)*(1-ss(-.6*w,B,e));
      for(const o of st){ const u=Math.hypot(x-o[0],y-o[1]); if(u<o[2])v=Math.max(v,o[3]); } return v; };
    const nrm=k=>{ const a=C[Math.max(0,k-1)], b=C[Math.min(N,k+1)], l=Math.hypot(b[0]-a[0],b[1]-a[1]); return [-(b[1]-a[1])/l,(b[0]-a[0])/l]; };
    const rim=m=>{ '@later'; const o=[], r=k=>W(C[k][2])+B+m, side=(k,f)=>{ const [nx,ny]=nrm(k); o.push([C[k][0]+f*nx*r(k),C[k][1]+f*ny*r(k)]); }, cap=(k,off)=>{ const [nx,ny]=nrm(k), a=Math.atan2(ny,nx)+off; for(let i=1;i<12;i++){ const t=a-i/12*Math.PI; o.push([C[k][0]+Math.cos(t)*r(k),C[k][1]+Math.sin(t)*r(k)]); } };
      for(let k=0;k<=N;k++)side(k,1); cap(N,0); for(let k=N;k>=0;k--)side(k,-1); cap(0,Math.PI); return o; };
    let kM=kC; const out=k=>{ const [nx,ny]=nrm(k), c=C[k], w=W(c[2])+B+.2; for(let f=-1;f<=1;f+=.25)if(FOUNT.lake(c[0]+nx*f*w,c[1]+ny*f*w)<.05)return false; return true; }; while(kM<N&&!out(kM))kM++; const m=C[kM][2], sW=m+2.5;
    const ks=C.map((c,k)=>Math.abs(c[1]-RY0)<3.6?k:-1).filter(k=>k>=0), km=ks[ks.length>>1], yc=C[km][1], xc=C[km][0], S=W(C[km][2])+B+.6, br={k:km,yc,xc,S,H:.55}, hump=(x,y)=>{ const t=Math.hypot(x-xc,y-yc)/(S+2); return t>=1||segD(x,y)>=3.6?0:br.H*.5*(1+Math.cos(Math.PI*t)); };
    return {C,SL,N,B,W,L,D,RF,q,h,st,nrm,rim,br,hump,m,kM,sW,sK,wet:(x,y,m=0)=>{ const r=q(x,y); return !!r&&r[0]<W(r[1])+B+m; }}; })();
  // the path goes straight over the bridge; the stream runs square to it there
  { const {xc,yc,S}=BK.br, U=S+2, D=9, y0=P.armY, cl=Math.hypot(2*(U+D),y0(xc+U+D)-y0(xc-U-D)), ax=2*(U+D)/cl, ay=(y0(xc+U+D)-y0(xc-U-D))/cl, ex=xc-ax*U, ey=yc-ay*U, fx=xc+ax*U, fy=yc+ay*U, L=[[ex-D,y0(ex-D)],[ex,ey],[fx,fy],[fx+D,y0(fx+D)]];
    BK.br.ax=ax; BK.br.ay=ay; P.bend={L,x0:L[0][0],x1:L[3][0]};
    P.armY=x=>{ if(x<=L[0][0]||x>=L[3][0])return y0(x); for(let i=0;i<3;i++){ const p=L[i], q=L[i+1]; if(x<=q[0])return p[1]+(q[1]-p[1])*(x-p[0])/(q[0]-p[0]||1); } return y0(x); }; }
  FOUNT.S.rocks=FOUNT.S.rocks.filter(r=>!BK.wet(r[0],r[1],.6));
  P.wetHole=()=>{ '@later'; const Lp=FOUNT.S.poly, R=BK.rim(-.3), keep=(A,f)=>{ const n=A.length; for(let j=0;j<n;j++)if(f(A[(j+n-1)%n])&&!f(A[j])){ const o=[]; for(let i=0;i<n&&!f(A[(j+i)%n]);i++)o.push(A[(j+i)%n]); return o; } return null; };
    const a=keep(Lp,([x,y])=>BK.wet(x,y,-.3)), b=keep(R,([x,y])=>FOUNT.lake(x,y)<0); if(!a||!b)return [Lp,R]; const d=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]), e=a[a.length-1], br=b.slice().reverse();
    return [[...a,...(d(e,b[0])+d(b[b.length-1],a[0])<d(e,br[0])+d(br[br.length-1],a[0])?b:br)]]; };
  P.campAt=()=>{ if(P.camp0)return P.camp0; const S=FOUNT.S, F=FOUNT, L=S.L, [cx,cy]=P.round; let best=null, bd=1e9;
    for(const [x0,y0] of S.poly){ if(x0>=L.cx-.5||y0>=L.cy-.5)continue; const e=.25, gx=F.lake(x0+e,y0)-F.lake(x0-e,y0), gy=F.lake(x0,y0+e)-F.lake(x0,y0-e), n=Math.hypot(gx,gy)||1, nx=gx/n, ny=gy/n, x=x0+nx*2.8, y=y0+ny*2.8;
      if(x<P.x0+6||x>P.x1-6||y<P.y0+6||y>P.y1-6||F.lake(x,y)<2.2||F.ter(x,y)<4.5||BK.wet(x,y,3.5)||pd(x,y)<3.4||S.rocks.some(r=>Math.hypot(r[0]-x,r[1]-y)<1.8))continue;
      const d=Math.hypot(x-cx,y-cy); if(d<bd){ bd=d; best={x,y,nx,ny}; } }
    P.camp0=best||{x:S.C.x+S.R+6,y:S.C.y,nx:1,ny:0}; S.oaks=S.oaks.filter(o=>Math.hypot(o[1]-P.camp0.x,o[2]-P.camp0.y)>10); return P.camp0; };
  { const c=P.campAt(); HK.push([c.x-5,c.y-5,c.x+5,c.y+5]); }
  { const h0=P.hill; P.hill=(x,y)=>{ const r=BK.q(x,y); if(!r)return h0(x,y); const e=r[0]-BK.W(r[1])-BK.B; if(path(x,y))return BK.hump(x,y)*TILE/.84; if(e>=0)return h0(x,y)*ss(0,5,e); return BK.h(x,y)*TILE/.84; }; }
  window.HILL=MODS.hill=(wx,wz)=>{ const g=window.PARK; return g&&g.hill?g.hill(SHARED.BOD.MX(wx)-(g.ox||0),SHARED.BOD.MY(wz)-(g.oy||0)):0; };
  const [rcx,rcy,rr]=P.round, smx=(a,b,k)=>{ const h=Math.max(k-Math.abs(a-b),0)/k; return Math.max(a,b)+h*h*k/4; };
  const dep=(x,y)=>smx(3.6-segD(x,y),rr-Math.hypot(x-rcx,y-rcy),2), eo=(x,y)=>{ const n=1.3*(cvn(x/4.5,y/4.5,421)-.5)+.6*(cvn(x/1.4,y/1.4,423)-.5)-.12; return n>.12?.12+(n-.12)*.35:n; }, vis=P.vis=(x,y)=>dep(x,y)+eo(x,y);
  const SC=.36, GR=.05, STN=[[112,109,102],[126,122,113],[140,135,124],[102,104,104],[134,124,108]], TF=[[40,72,32],[54,92,40],[72,114,50],[96,138,62]], SOIL=[[78,66,50],[66,56,44]], KC=new Map();
  const cell=(x,y)=>{ const gx=Math.floor(x/SC), gy=Math.floor(y/SC); let d1=9, d2=9, u=0, v=0, sx=0, sy=0;
    for(let i=-1;i<2;i++)for(let j=-1;j<2;j++){ const a=gx+i, b=gy+j, cx=(a+.1+.8*hash(a,b,401))*SC, cy=(b+.1+.8*hash(a,b,403))*SC, d=Math.hypot(x-cx,y-cy)/(.74+.56*hash(a,b,405)**2);
      if(d<d1){ d2=d1; d1=d; u=a; v=b; sx=cx; sy=cy; } else if(d<d2)d2=d; } return [d2-d1,u,v,sx,sy]; };
  const keep=(u,v,sx,sy)=>{ const id=u*65536+v; let r=KC.get(id); if(r!==undefined)return r; const k=vis(sx,sy), h=hash(u,v,407);
    r=(k>.5?h>.012:k>0?h>.4*(1-k/.5):k>-.45&&h<.1*(1+k/.45))?k:null; KC.set(id,r); return r; };
  const tuft=(x,y,pv)=>{ const a=Math.floor(x*2), b=Math.floor(y*2), h=hash(a,b,441); if(h>.06+.6*Math.max(0,1-pv/1.1))return null;
    const tx=(a+.15+.7*hash(a,b,443))/2, ty=(b+.15+.7*hash(a,b,445))/2, r=.07+.05*hash(a,b,447), dx=x-tx, dy=y-ty, d=Math.hypot(dx,dy); if(d>r)return null;
    const ang=Math.atan2(dy,dx)*5/Math.PI+hash(a,b,449)*9, bl=Math.abs(ang-Math.round(ang)); if(d>r*.35&&bl>.28)return null;
    return TF[d<r*.35?1:d<r*.7?(bl<.12?3:2):(hash(Math.floor(x*24),Math.floor(y*24),451)<.5?2:3)]; };
  const hexCol=(x,y)=>{ const pv=vis(x,y); if(pv<-.8)return null; const tf=pv>-.25?tuft(x,y,pv):null; if(tf)return tf;
    const [e,u,v,sx,sy]=cell(x,y), px=hash(Math.floor(x*24),Math.floor(y*24),453), ks=keep(u,v,sx,sy);
    if(ks===null){ if(pv<0||pv<.6&&hash(u,v,411)<.45)return null; return px<.3?TF[px<.12?0:1]:SOIL[px<.7?0:1]; }
    if(ks<.35&&hash(u,v,409)<.35){ const a=hash(u,v,410)*6.283; if((x-sx)*Math.cos(a)+(y-sy)*Math.sin(a)>.03)return pv<0?null:px<.4?TF[1]:SOIL[0]; }
    const mo=cvn(x/2.2,y/2.2,431);
    if(e<GR){ if(mo>.6)return [[44,70,34],[56,86,40]][px<.5?0:1]; if(px<.5*Math.max(0,.9-pv))return TF[px<.15?0:1]; return [[66,66,56],[58,60,52]][px<.7?0:1]; }
    let c=STN[Math.floor(hash(u,v,413)*5)]; const t=hash(u,v,415); if(t<.06)c=[164,156,138]; else if(t>.95)c=[86,86,86];
    const l=(x-sx)*-.45+(y-sy)*-.9; let f=cvn(x/7,y/7,433)>.64?.92:1;
    if(e<GR+.05){ if(l<=0&&mo>.52)return [56,86,42]; f*=l>0?1.13:.8; } else if(e>GR+.17&&l>.02)f*=1.05;
    if(hash(u,v,419)<.09){ const a=hash(u,v,421)*3.14, s=(x-sx)*Math.cos(a)+(y-sy)*Math.sin(a), q=-(x-sx)*Math.sin(a)+(y-sy)*Math.cos(a); if(Math.abs(q-.25*Math.abs(s))<.022&&e>GR+.02)f*=.62; }
    return [c[0]*f,c[1]*f,c[2]*f]; };
  const CS=(S=>({x0:S.x0-PO.x,x1:S.x1-PO.x,y0:S.y0-PO.y,y1:S.y1-PO.y}))(CASTLE.stair), groundCol=(x,y)=>x>=CS.x0&&x<CS.x1&&y>=CS.y0&&y<CS.y1?null:hexCol(x,y);
  const flat=(x0,y0,x1,y1,z,col)=>SHARED.BOD.bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],SHARED.BOD.faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>SHARED.BOD.C(col(x0+(i+.5)/24,y0+(j+.5)/24))),'G');
  { const [cx,cy,r]=P.round, w=4.6+WA, R=r+1, T3=P.tufts=[], strips=(x0,y0,x1,y1,ax)=>{ const a0=ax?x0:y0, a1=ax?x1:y1, V=(t,q)=>ax?vis(t,q):vis(q,t);
      for(let s=ax?y0:x0, e=ax?y1:x1; s<e; s++){ const s1=Math.min(e,s+1), m=(s+s1)/2; let lo=1e9, hi=-1e9; for(let t=a0;t<a1;t+=1/8)for(let q=0;q<5;q++)if(V(t,s+(s1-s)*q/4)>-.8){ lo=Math.min(lo,t); hi=Math.max(hi,t); }
        if(hi<lo)continue; lo=Math.max(a0,Math.floor(lo*24-2)/24); hi=Math.min(a1,Math.ceil(hi*24+3)/24); ax?flat(lo,s,hi,s1,0,groundCol):flat(s,lo,s1,hi,0,groundCol);
        for(const [b,d,f] of [[lo,1/24,lo>a0+.01],[hi,-1/24,hi<a1-.01]]){ if(!f||hash(Math.floor(m*7),Math.floor(b*7),461)>.6)continue; let t=b; while(V(t,m)<.08&&Math.abs(t-b)<3)t+=d; if(Math.abs(t-b)<3)T3.push(ax?[t,m,hash(Math.floor(m*7),3,463)]:[m,t,hash(Math.floor(m*7),5,463)]); } } };
    strips(cx-w,P.y0+.5,cx+w,cy-R,1); const part=(x0,y0,x1,y1,ax)=>{ const a=ax?y0:x0, b=ax?y1:x1; for(let s=a;s<b;s+=8){ const e=Math.min(b,s+8); PARK.later(()=>ax?strips(x0,s,x1,e,1):strips(s,y0,e,y1,0)); } };
    part(cx-R,cy-R,cx+R,cy+R,1);
    for(const [ax,ay,bx,by] of SEG){ const v=Math.abs(by-ay)>=Math.abs(bx-ax), x0=Math.max(P.x0,Math.min(ax,bx)-w), x1=Math.min(P.x1,Math.max(ax,bx)+w), y0=Math.max(P.y0+.5,Math.min(ay,by)-w), y1=Math.min(P.y1,Math.max(ay,by)+w);
      if(ax===cx&&bx===cx){ part(cx-w,cy+R,cx+w,y1,1); continue; } if(ay===cy&&by===cy){ part(x0,cy-w,cx-R,cy+w,0); part(cx+R,cy-w,x1,cy+w,0); continue; }
      let X0=x0, X1=x1, Y0=y0, Y1=y1; if(Math.min(ax,bx)>=cx-1)X0=Math.max(X0,cx+w); if(Math.max(ax,bx)<=cx+1)X1=Math.min(X1,cx-w); if(Math.min(ay,by)>=cy-1)Y0=Math.max(Y0,cy+w); if(Math.max(ay,by)<=cy+1)Y1=Math.min(Y1,cy-w); if(X1>X0&&Y1>Y0)part(X0,Y0,X1,Y1,v?1:0); } }
  const stone=(i,j,k,H=99,cap=false)=>BRICKS.face(i,j,k,H,cap);
  const capSide=(i,j,h)=>{ const n=grain(i/24,j/24,91,1.2), c=(j===0?1.2:j>=h-1?.62:1)*(124+20*n); return speck([c,c,c*.96],i/24,j/24,93); };
  const face=(a,b,c,d,w,h,fn)=>SHARED.BOD.bq(a,b,c,d,SHARED.BOD.faceTex(w,h,(i,j)=>SHARED.BOD.C(fn(i,j))),'G');
  const block=(x0,y0,x1,y1,z0,z1,k,top,jo=0,HT,SF)=>{ if((top==='post'||top==='cap')&&HT===undefined){ x0-=PG; x1+=PG; y0-=PG; y1+=PG; }
    if(top==='post'&&HT===undefined){ block(x0,y0,x1,y1,z0,z1,k,'post',0,z1-z0);
      BRICKS.quoins(x0,y0,x1,y1,z0,z1,k,(bx0,by0,bx1,by1,zb,zt,paint)=>block(bx0,by0,bx1,by1,zb,zt,k,()=>[92,90,86],0,zt-zb,paint));
      return; }
    if(x1-x0>40){ const n=Math.ceil((x1-x0)/40), d=(x1-x0)/n; for(let i=0;i<n;i++)block(x0+i*d,y0,x0+(i+1)*d,y1,z0,z1,k,top,jo,HT,SF); return; } const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[Y(z0),Y(z1)], w=x1-x0, dp=y1-y0;
    const W=w*24, D=dp*24, H=z1-z0, sideF=SF?SF:top==='cap'?(i,j)=>capSide(i,j,H):(i,j,kk)=>stone(i,j+jo,kk,HT||H,top==='post'||HT!==undefined);
    face([a,f,d],[b,f,d],[b,f,c],[a,f,c],W,D,typeof top==='function'&&!top.cope?top:((i,j)=>{ const tv=top&&top.cope?top(i,j):null; if(tv)return tv; const n=grain(i/24,j/24,k+5,1.2), ed=Math.min(i,j,W-1-i,D-1-j); let c=118+22*n; if(ed<1)c*=(i<1||j<1)?1.18:.8; else if(ed<2)c*=1.06;
      else if(top===undefined||top.cope){ const L=W>=D?W:D, u=W>=D?i:j, v=W>=D?j:i, DV=W>=D?D:W; let s0=0, n0=0, len=0; for(;;){ len=14+Math.floor(9*hash(n0,k,131)); if(s0+len>u)break; s0+=len; n0++; } const p=u-s0;
        if(p===0)c*=.55; else if(p===1)c*=1.1; else if(p===len-1)c*=.86; c*=.93+.14*hash(n0,k,133); if(hash(n0,k,135)<.18&&Math.abs(p-len*.5+(v-DV/2)*.6)<.6)c*=.72; }
      return speck([c,c,c*.96],i/24,j/24,k+7); }));
    face([a,e,c],[b,e,c],[b,f,c],[a,f,c],W,H,(i,j)=>sideF(i,j,k,W,H)); face([b,e,d],[a,e,d],[a,f,d],[b,f,d],W,H,(i,j)=>sideF(i,j,k+1,W,H));
    face([a,e,d],[a,e,c],[a,f,c],[a,f,d],D,H,(i,j)=>sideF(i,j,k+2,D,H)); face([b,e,c],[b,e,d],[b,f,d],[b,f,c],D,H,(i,j)=>sideF(i,j,k+3,D,H)); };
  const WH=96, GS=1.25, PH=Math.round(150*GS), PG=.22, T=1.5, PW=2.4, [g0,g1]=P.gate, RUNS=[], PIERS=[], LEAVES=[];
  const ashlar=(ch,l0,lv)=>(i,j,k,W,H)=>{ const co=Math.floor(j/ch), w=j-co*ch, u=i+Math.floor(hash(co,k,7)*l0); let s0=0, n=0, len=0; for(;;){ len=l0+Math.floor(lv*hash(n,co,k+3)); if(s0+len>u)break; s0+=len; n++; } const p=u-s0;
    let c=124+18*grain(i/24,j/24,k,1.2)+(hash(n,co,k+5)-.5)*40, wm=hash(n,co,k+9)-.5;
    const joint=w===ch-1||p===0; if(joint)c*=.5; else if(w===0)c*=1.16; else if(p===1)c*=1.07; else if(p===len-1||w===ch-2)c*=.86;
    if(!joint&&hash(i,j,k+11)>.992)c*=.7; if(!joint&&hash(n,co,k+15)<.08&&(p<3||w<2))c*=.78;
    const dn=j/H; c*=1-.3*dn*dn; const sc=i>>1, sl=H*(.15+.7*hash(sc,k,621)); if(hash(sc>>2,k,623)<.3&&hash(sc,k,625)<.6&&j<sl)c*=.8;
    const bl=cvn(i/40,j/26,k+627); if(bl>.64)c*=.86; let col=[c*(1+wm*.08),c,c*(.97-wm*.07)]; if(bl<.26)col=[col[0]*1.06,col[1]*1.02,col[2]*.9];
    if(joint&&dn>.5&&hash(i>>1,j,k+13)<.5)col=[58,78,44]; else if(hash(i>>1,j>>1,k+17)>.986)col=[150,156,108];
    return speck(col,i/24,j/24,k+23); };
  const wallF=ashlar(7,10,8), rusF=(i,j,k,W,H)=>{ const ch=14, co=Math.floor(j/ch), w=j-co*ch, u=i+(co&1)*13; let s0=0, n=0, len=0; for(;;){ len=22+Math.floor(12*hash(n,co,k+3)); if(s0+len>u)break; s0+=len; n++; } const p=u-s0;
    let c=122+16*grain(i/24,j/24,k,1.2)+(hash(n,co,k+5)-.5)*34; if(w<2)c*=.42; else if(w===2)c*=1.18; else if(w===ch-1)c*=.78; else if(p===0)c*=.62; else if(p===1)c*=1.06; else if(hash(i,j,k+11)>.993)c*=.7;
    c*=1-.26*(j/H)*(j/H); const sc=i>>1; if(hash(sc>>2,k,631)<.35&&hash(sc,k,633)<.55&&j<H*(.1+.5*hash(sc,k,635)))c*=.82;
    let col=[c*1.02,c,c*.95]; if(w<2&&j/H>.6&&hash(i>>1,j,k+13)<.5)col=[58,78,44]; else if(hash(i>>1,j>>1,k+17)>.988)col=[150,156,108]; return speck(col,i/24,j/24,k+23); };
  // ivy over about a quarter of the park's stone, climbing from the ground in patches (the buildings' own ivy painter)
  const IVP=new Map(), ivyOf=(k,W)=>{ let L=IVP.get(k); if(L)return L; L=[]; const len=W/BLOCKS.PX; let u=hash(k,1,441)*1.5;
    while(u<len){ const w=1.2+hash(k,Math.floor(u*7),443)*2.6; if(hash(k,Math.floor(u*3),447)<.7)L.push({a0:u,a1:u+w,hf:.65+.35*hash(k,Math.floor(u),449),seed:(k*13+Math.floor(u*5))%997,fall:.6}); u+=w+.6+hash(k,Math.floor(u*11),451)*2.2; }
    IVP.set(k,L); return L; };
  const ivy=F=>(i,j,k,W,H)=>{ const u=i/BLOCKS.PX, z=H-1-j; for(const Q of ivyOf(k,W)){ if(u<Q.a0||u>Q.a1)continue; Q.h=H*Q.hf; const c=BLOCKS.ivy(u,z,Q); if(c)return speck(c,i/24,j/24,k+29); } return F(i,j,k,W,H); }, wallI=ivy(wallF), rusI=ivy(rusF);
  const WQ=BATCH.queue({make:(k,m,e)=>BM(k,m,e),cast:true,group:()=>MAPG.parkwall||scene,tile:24*TILE});   // (in 24-tile pieces: only those in view drawn)
  const wall=(x0,y0,x1,y1,k)=>{ if(x1-x0<=.05||y1-y0<=.05)return; const ax=x1-x0>=y1-y0, L=ax?x1-x0:y1-y0, n=Math.ceil(L/36);
    for(let p=0;p<n;p++){ const a=(ax?x0:y0)+L*p/n, b=(ax?x0:y0)+L*(p+1)/n, [qx0,qy0,qx1,qy1]=ax?[a,y0,b,y1]:[x0,a,x1,b], kp=k*7+p*5, W=(qx1-qx0)*24, D=(qy1-qy0)*24;
      RUNS.push([qx0,qy0,qx1,qy1,kp]); const wx=v=>SHARED.BOD.XS(v+PO.x), wz=v=>SHARED.BOD.ZS(v+PO.y); WQ.add(wx(qx0),wz(qy0),wx(qx1),wz(qy1),()=>block(qx0,qy0,qx1,qy1,0,WH,kp,undefined,0,WH,wallI)); } };
  const pier=(x0,y0,x1,y1,k)=>{ const B=(e,z0,z1,kk,top,SF)=>block(x0-e,y0-e,x1+e,y1+e,z0,z1,kk,top,0,z1-z0,SF), st=()=>[118,116,110];
    B(.14,0,18,k,st,rusI); B(.08,18,22,k+4,'cap'); B(0,22,PH-24,k+8,st,rusI); B(.06,PH-24,PH-20,k+12,'cap'); B(0,PH-20,PH,k+16,st,rusF);
    B(.1,PH,PH+5,k+20,'cap'); B(.2,PH+5,PH+9,k+24,'cap'); B(.32,PH+9,PH+14,k+28,'cap'); B(.18,PH+14,PH+18,k+32,'cap');
    PIERS.push([(x0+x1)/2,(y0+y1)/2,x0,y0,x1,y1]); };
  wall(P.x0,P.y0,g0-PW,P.y0+T,11); wall(g1+PW,P.y0,P.x1,P.y0+T,15);
  pier(g0-PW,P.y0-.3,g0,P.y0+T+.6,21); pier(g1,P.y0-.3,g1+PW,P.y0+T+.6,25);
  LEAVES.push([g0,P.y0+T+.85,-1,'x',(g1-g0)/2],[g1,P.y0+T+.85,1,'x',(g1-g0)/2]);
  PARK.look=[X(g1+1.8),Z(P.y0-1.6)];
  const EL=(LEVEL.edge&&LEVEL.edge.lines)||[], onEdge=(ax,v)=>EL.some(l=>ax==='x'?l[0]===l[2]&&Math.abs(l[0]-v-PO.x)<1:l[1]===l[3]&&Math.abs(l[1]-v-PO.y)<1), openE=PARK.openE=onEdge('x',P.x1), openN=PARK.openN=onEdge('y',P.y1);   // a side on the map's edge has no wall, only the forcefield (owner, 7 Nov 2026)
  if(openE)PARK.wallOn=[P.x1+PO.x,P.y0+PO.y,P.y0+T+PO.y];   // Market St's wall carries on past the mirror's reach (069a) (owner, 8 Nov 2026: "i dont see the parkwall out of bounds")
  const EG=PARK.egate=[P.round[1]-1.5,P.round[1]+1.5], ex=P.x1-T;
  if(!openE){ wall(ex,P.y0+T,P.x1,EG[0]-PW,31); wall(ex,EG[1]+PW,P.x1,P.y1,35);
  pier(ex-.6,EG[0]-PW,P.x1+.3,EG[0],41); pier(ex-.6,EG[1],P.x1+.3,EG[1]+PW,45);
  LEAVES.push([ex-.85,EG[0],-1,'y',1.5],[ex-.85,EG[1],1,'y',1.5]); }
  const CB=[CASTLE.b[0]-PO.x,CASTLE.b[1]-PO.x,CASTLE.b[2]-PO.y,CASTLE.b[3]-PO.y], wx=P.x0, ny=P.y1-T, WG=PARK.wgate=[P.round[1]-(g1-g0)/2,P.round[1]+(g1-g0)/2], NG=PARK.ngate=[P.round[0]-3.5,P.round[0]+3.5];
  const cw=CB[0]<=wx+T+.5, wTop=cw?Math.min(P.y1,CB[2]):ny, nLeft=CB[3]<P.y1-T-1?P.x0:Math.max(P.x0,CB[1]);   // the west wall breaks for the castle only where the castle stands on it
  wall(wx,P.y0+T,wx+T,WG[0]-PW,51); wall(wx,WG[1]+PW,wx+T,wTop,55); if(cw&&CB[3]<P.y1-T-1)wall(wx,CB[3],wx+T,ny,59);
  pier(wx-.3,WG[0]-PW,wx+T+.6,WG[0],57); pier(wx-.3,WG[1],wx+T+.6,WG[1]+PW,61);
  LEAVES.push([wx+T+.85,WG[0],-1,'y',(WG[1]-WG[0])/2],[wx+T+.85,WG[1],1,'y',(WG[1]-WG[0])/2]);
  if(!openN){ wall(nLeft,ny,NG[0]-PW,P.y1,65); wall(NG[1]+PW,ny,openE?P.x1:P.x1-T,P.y1,69);
  pier(NG[0]-PW,ny-.6,NG[0],P.y1+.3,71); pier(NG[1],ny-.6,NG[1]+PW,P.y1+.3,75);
  LEAVES.push([NG[0],ny-.85,-1,'x',3.5],[NG[1],ny-.85,1,'x',3.5]); }
  { const M=TILE/.84, VS=ZU*24/TILE, mv=m=>m*M*VS, top=Y(WH), rnd=(a,b,c)=>hash(a,b,c);
    const cut=(g,f)=>{ const N=g.attributes.normal.array, k=[]; for(let t=0;t<N.length/9;t++)if(!f(N[t*9+1]))k.push(t); for(const n of ['position','normal']){ const A=g.attributes[n].array, D=new Float32Array(k.length*9); k.forEach((t,j)=>D.set(A.subarray(t*9,t*9+9),j*9)); g.setAttribute(n,new THREE.BufferAttribute(D,3)); } return g; };
    const pick=(()=>{ const sh=cut(new THREE.BoxGeometry(.042*M,1,.042*M).translate(0,.5,0).toNonIndexed(),y=>Math.abs(y)>.9), cl=new THREE.BoxGeometry(.07*M,.025,.07*M).translate(0,.985,0).toNonIndexed(), tp=cut(new THREE.ConeGeometry(.05*M,.17,4).rotateY(Math.PI/4).translate(0,1.08,0).toNonIndexed(),y=>y<-.9), g=new THREE.BufferGeometry();
      for(const a of ['position','normal']){ const A=sh.attributes[a].array, B=cl.attributes[a].array, Cc=tp.attributes[a].array, C=new Float32Array(A.length+B.length+Cc.length); C.set(A); C.set(B,A.length); C.set(Cc,A.length+B.length); g.setAttribute(a,new THREE.BufferAttribute(C,3)); } return g; })();
    const unit=new THREE.BoxGeometry(1,1,1), iron=new THREE.MeshLambertMaterial({color:0xffffff}), glass=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.62,depthWrite:false}), core=new THREE.MeshBasicMaterial({color:0xffffff});
    const IR=[0x23272a,0x1e2225,0x272b2e,0x2a2420], m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), V=THREE.Vector3, col=new THREE.Color();
    const put=(P_,B_)=>{ if(P_.length){ const me=new THREE.InstancedMesh(pick,iron,P_.length); P_.forEach(([x,y,z,h,lean,ax,c,yaw],i)=>{ q.setFromEuler(e.set(ax==='x'?lean:0,yaw||0,ax==='x'?0:lean)); me.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(1,h,1))); me.setColorAt(i,col.setHex(c)); });
        me.computeBoundingSphere(); me.castShadow=true; me.receiveShadow=true; scene.add(me); PARK.iron=(PARK.iron||0)+P_.length*28; }
      if(B_.length){ const me=new THREE.InstancedMesh(unit,iron,B_.length); B_.forEach(([x,y,z,sx,sy,sz,c,yaw],i)=>{ me.setMatrixAt(i,m4.compose(new V(x,y,z),q.setFromAxisAngle(new V(0,1,0),yaw||0),new V(sx,sy,sz))); me.setColorAt(i,col.setHex(c)); });
        me.computeBoundingSphere(); me.castShadow=true; me.receiveShadow=true; scene.add(me); PARK.iron=(PARK.iron||0)+B_.length*12; return me; } };
    const SP=.19, RH=mv(1.5);
    for(const [x0,y0,x1,y1,k] of RUNS){ const ax=x1-x0>=y1-y0?'x':'y', L=ax==='x'?x1-x0:y1-y0, c0=ax==='x'?(y0+y1)/2:(x0+x1)/2, s0=ax==='x'?x0:y0, NP=Math.ceil(L/16);
      for(let pc=0;pc<NP;pc++){ const a=s0+L*pc/NP, b=s0+L*(pc+1)/NP, Pk=[], Bx=[], at=(u,v)=>ax==='x'?[X(u),Z(v)]:[X(v),Z(u)];
        for(let u=a+SP/2;u<b;u+=SP){ const n=Math.round(u/SP); if(rnd(n,k,301)<.02)continue;
          const [wx_,wz_]=at(u,c0), r=rnd(n,k,303), lean=r<.05?(rnd(n,k,305)-.5)*.3:0; Pk.push([wx_,top,wz_,RH*(r<.03?.85:1),lean,ax==='x'?'z':'x',r<.15?IR[3]:IR[n%3]]); }
        const [cx,cz]=at((a+b)/2,c0), len=(b-a)*TILE; for(const hh of [.1,.84])Bx.push([cx,top+RH*hh,cz,ax==='x'?len:.045*M,.045*M*VS,ax==='x'?.045*M:len,IR[0]]);
        for(let u=Math.ceil(a/2.857)*2.857;u<b;u+=2.857){ const [px,pz]=at(u,c0); Bx.push([px,top+RH*.52,pz,.09*M,RH*1.04,.09*M,IR[1]],[px,top+RH*1.07,pz,.13*M,.13*M*VS*1.4,.13*M,IR[1]],[px,top+RH*1.13,pz,.06*M,.1*M*VS*2.2,.06*M,IR[1]]); }
        put(Pk,Bx); } }
    const GP=[], GB=[];
    for(const [hx,hy,dir,ax,w] of LEAVES){ const at=(u)=>ax==='x'?[X(hx+dir*u),Z(hy)]:[X(hy),Z(hx+dir*u)], H=mv(3.3);
      for(let u=.08;u<w-.04;u+=.17){ const [x,z]=at(u); GP.push([x,0,z,H,0,'x',IR[(Math.round(u*7))%3]]); }
      const [cx,cz]=at(w/2), len=w*TILE; for(const hh of [.08,.55,.9])GB.push([cx,H*hh,cz,ax==='x'?len:.06*M,.06*M*VS,ax==='x'?.06*M:len,IR[0]]);
      for(const u of [0,w]){ const [x,z]=at(u); GB.push([x,H*.5,z,.09*M,H*1.02,.09*M,IR[1]]); }
      for(let u=.3;u<w-.2;u+=.6){ const [x,z]=at(u); GB.push([x,H*.73,z,ax==='x'?.27*M:.045*M,.27*M*VS,ax==='x'?.045*M:.27*M,IR[2]]); }
      const [a1,b1]=at(0), [a2,b2]=at(w); SOL.up.push([Math.min(a1,a2)-.09*M,Math.min(b1,b2)-.09*M,Math.max(a1,a2)+.09*M,Math.max(b1,b2)+.09*M]); FIX.up.push([Math.min(a1,a2)-.09*M,Math.min(b1,b2)-.09*M,0,Math.max(a1,a2)+.09*M,Math.max(b1,b2)+.09*M,H]); }
    put(GP,GB);
    // the lake's rail (owner, 2 Nov 2026, his picture of the reservoir: "add this rail around the lake"): iron pickets between posts along the water side of the
    // running track, the whole shore inside the park; open where the brook leaves the lake, where a path reaches the water, and at three gates for swimmers
    { const S=FOUNT.S, RO=FOUNT.TRACK[0]-FOUNT.TRACK[1]-.55, L=[]; let acc=0, prev=null;
      for(let i=0;i<S.shore.length;i++){ const [sx,sy]=S.shore[i], n=S.nrm(sx,sy), x=sx+n[0]*RO, y=sy+n[1]*RO; if(x>S.wx1+2.5||y>S.wy1+2.5)continue; if(prev)acc+=Math.hypot(x-prev[0],y-prev[1]); prev=[x,y]; L.push([x,y,acc]); }
      const TOT=acc, GATES=[.25,.5,.75].map(f=>f*TOT), open_=(x,y,s)=>BK.wet(x,y,1.4)||segD(x,y)<4.6||GATES.some(g=>Math.abs(s-g)<1.6)||FOUNT.bridgeD(x,y)<1.2, at_=s=>{ let j=0; while(j<L.length-1&&L[j+1][2]<s)j++; const a=L[j], b=L[Math.min(L.length-1,j+1)], t=b[2]>a[2]?(s-a[2])/(b[2]-a[2]):0; return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]; };
      const H=mv(1.2), Pk=[], Bx=[], POST=2.4, RB=.055*M; let posts=0;
      for(let s0=0;s0+POST<=TOT+.01;s0+=POST){ const s1=s0+POST, [ax,ay]=at_(s0), [bx,by]=at_(s1), [mx,my]=at_((s0+s1)/2); if(open_(mx,my,(s0+s1)/2)){ if(!open_(...at_(s0-.1),s0-.1))Bx.push([X(ax),H*.52,Z(ay),.1*M,H*1.06,.1*M,IR[1]],[X(ax),H*1.08,Z(ay),.14*M,.14*M*VS*1.3,.14*M,IR[1]]); continue; }
        const wx0=X(ax), wz0=Z(ay), wx1=X(bx), wz1=Z(by), yaw=-Math.atan2(wz1-wz0,wx1-wx0), len=Math.hypot(wx1-wx0,wz1-wz0);
        Bx.push([wx0,H*.52,wz0,.1*M,H*1.06,.1*M,IR[1]],[wx0,H*1.08,wz0,.14*M,.14*M*VS*1.3,.14*M,IR[1]]); posts++;
        for(const hh of [.12,.9])Bx.push([(wx0+wx1)/2,H*hh,(wz0+wz1)/2,len,RB*VS,RB,IR[0],yaw]);
        for(let u=.19;u<POST-.1;u+=.19){ const t=u/POST, px=wx0+(wx1-wx0)*t, pz=wz0+(wz1-wz0)*t, k=Math.round((s0+u)*7); Pk.push([px,0,pz,H*.98,0,'x',IR[k%3],yaw]); }
        for(let k=0;k<3;k++){ const t0=k/3, t1=(k+1)/3, xa=wx0+(wx1-wx0)*t0, xb=wx0+(wx1-wx0)*t1, za=wz0+(wz1-wz0)*t0, zb=wz0+(wz1-wz0)*t1, e=.06*M; SOL.up.push([Math.min(xa,xb)-e,Math.min(za,zb)-e,Math.max(xa,xb)+e,Math.max(za,zb)+e]); FIX.up.push([Math.min(xa,xb)-e,Math.min(za,zb)-e,0,Math.max(xa,xb)+e,Math.max(za,zb)+e,H]); } }
      put(Pk,Bx); PARK.rail={posts,len:TOT}; }
    // a gateway's arch: two rails and their pickets, end posts, CENTRAL PARK in iron letters on a bowed bar, ivy over its end and down its post; laid out along the gate (ax), at its line c0, reading td along it from outside
    const arch=(q0,q1,c0,ax,td,main)=>{ const m=(q0+q1)/2, len=(q1-q0)*TILE, B=[], at=(a,y,c,sa,sy,sc,col)=>B.push(ax==='x'?[X(m)+a,y,Z(c0)+c,sa,sy,sc,col]:[X(c0)+c,y,Z(m)+a,sc,sy,sa,col]), bar=(h,t)=>at(0,Y(GS*h),0,len,Y(GS*t),.1*M,IR[0]);
      bar(124,4); bar(140,4); for(let u=q0+.25;u<q1-.1;u+=.25){ const n=Math.round(u*4); at((u-m)*TILE,Y(GS*132),0,.035*M,Y(GS*12),.035*M,IR[n%3]); if(Math.abs(u-m)>1.5)at((u-m)*TILE,Y(GS*(146+(n%2?3:0))),0,.03*M,Y(GS*(n%2?10:5)),.03*M,IR[1]); }
      for(const u of [q0+.05,q1-.05])at((u-m)*TILE,Y(GS*134),0,.1*M,Y(GS*26),.1*M,IR[1]);
      { const FONT={C:['.###','#...','#...','#...','.###'],E:['####','#...','###.','#...','####'],N:['#..#','##.#','#.##','#..#','#..#'],T:['###','.#.','.#.','.#.','.#.'],R:['###.','#..#','###.','#.#.','#..#'],A:['.##.','#..#','####','#..#','#..#'],L:['#...','#...','#...','#...','####'],P:['###.','#..#','###.','#...','#...'],K:['#..#','#.#.','##..','#.#.','#..#']};
        const txt='CENTRAL PARK', cols=[...txt].reduce((a,ch)=>a+(ch===' '?2:FONT[ch][0].length+1),0), half=len*.44, step=half*2/cols, px=step*.95, py=px*1.25, pz=.07*M, hb=Y(GS*147), ah=Y(GS*13)*1.25;
        let u=-half; for(const ch of txt){ if(ch===' '){ u+=2*step; continue; } const G=FONT[ch], w=G[0].length, tc=(u+w*step/2)/half, base=hb+ah*(1-tc*tc);
          for(let r=0;r<5;r++)for(let c=0;c<w;c++)if(G[r][c]==='#')at(td*(u+(c+.5)*step),base+(4.5-r)*py,0,step*.96,py*1.04,pz,IR[0]); u+=(w+1)*step; }
        for(let i=0;i<24;i++){ const tm=-1+(i+.5)/12, w=half*1.06/12; at(tm*half*1.06,hb-Y(GS*4)+ah*(1-tm*tm),0,w+.005,px*1.3,pz*1.2,IR[1]); }
        // ivy over the sign's far end and hanging down that post
        { const LV=[0x2e4e24,0x426c2c,0x5c8838], lr=(a,b)=>hash(a,b,601);
          for(let i=0;i<80;i++){ const tm=-1.06+.8*lr(i,3), s=(.07+.07*lr(i,7))*M; at(-td*tm*half*1.06+(lr(i,11)-.5)*.1*M,hb+ah*(1-tm*tm)+(lr(i,5)-.62)*py*6.5,(lr(i,9)-.5)*pz*3,s,s*VS,s,LV[i%3]); }
          for(let k=0;k<4;k++){ const a0=td*(m-(q0+.12+k*.18))*TILE, n=4+Math.floor(lr(k,13)*6); for(let i=0;i<n;i++){ const s=(.06+.05*lr(k*9+i,15))*M; at(a0+(lr(k*9+i,17)-.5)*.08*M,hb-i*s*VS*1.6,(lr(k*9+i,19)-.5)*pz*2,s,s*VS,s,LV[(k+i)%3]); } } }
        if(main)PARK.sign={x:X(m),y:hb+ah*.5,z:Z(c0),top:hb+ah+py*5,out:[X(m),Z(c0-4)]}; (PARK.arches=PARK.arches||[]).push([X(ax==='x'?m:c0),Z(ax==='x'?c0:m),ax]); }
      put([],B); };
    arch(g0,g1,P.y0+.42,'x',-1,true); arch(WG[0],WG[1],wx+.42,'y',1,false);   // the west gate as the main one, turned to face West St
    const LB=[], LG=[], LC_=[], HL=[], LBP=[], LGP=[];
    for(const [x,y] of PIERS){ const wx_=X(x), wz_=Z(y), t=Y(PH+18), K=1.4, b=(h0,h,w,c=IR[0])=>LB.push([wx_,t+mv((h0+h/2)*K),wz_,w*M*K,mv(h*K),w*M*K,c]);
      b(0,.22,.62,IR[1]); b(.22,.05,.5); b(.27,.05,.4); b(.32,.62,.07);
      b(.94,.04,.44,IR[2]); b(.95,.06,.5); b(1.01,.06,.4); b(1.07,.06,.3); b(1.13,.06,.2); b(1.19,.08,.1,IR[1]); b(1.27,.16,.04,IR[1]);
      LG.push([wx_,t+mv(.935*K),wz_,.38*M*K,mv(.01*K),.38*M*K]); LC_.push([wx_,t+mv(.93*K),wz_,.12*M*K,mv(.005*K),.12*M*K]); HL.push([wx_,t+mv(.85*K),wz_]); const pv={k:'gate lantern',x:wx_,y:t,z:wz_}; while(LBP.length<LB.length)LBP.push(pv); LGP.push(Object.assign({},pv)); }
    { const me=put([],LB); if(me)WED.meshes.push({place:'park',me,items:LBP}); }
    if(LG.length){ const box=(L_,mat)=>{ const me=new THREE.InstancedMesh(unit,mat,L_.length); L_.forEach(([x,y,z,sx,sy,sz],i)=>me.setMatrixAt(i,m4.compose(new V(x,y,z),q.identity(),new V(sx,sy,sz)))); me.computeBoundingSphere(); scene.add(me); return me; };
      PARK.lanterns=box(LG,glass); WED.meshes.push({place:'park',me:PARK.lanterns,items:LGP},{place:'park',me:box(LC_,core),items:LGP.map(o=>({k:o.k,x:o.x,y:o.y,z:o.z}))});
      const HT=(()=>{ const W=48, cv=document.createElement('canvas'); cv.width=cv.height=W; const g=cv.getContext('2d'), im=g.createImageData(W,W), Bm=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
        for(let j=0;j<W;j++)for(let i=0;i<W;i++){ const d=Math.hypot((i+.5)/W*2-1,(j+.5)/W*2-1), t=(Bm[(j%4)*4+i%4]+.5)/16, a=d<.14?1:d<.3+(t-.5)*.06?.42:d<.55+(t-.5)*.08?.2:d<.9+(t-.5)*.08?.08:0, o=(j*W+i)*4; im.data[o]=255; im.data[o+1]=d<.14?236:204; im.data[o+2]=d<.14?190:130; im.data[o+3]=a*255; }
        g.putImageData(im,0,0); const tx=new THREE.CanvasTexture(cv); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.generateMipmaps=false; tx.colorSpace=THREE.SRGBColorSpace; return tx; })();
      const hm=new THREE.SpriteMaterial({map:HT,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}), SPR=[], LL=[];
      for(const [x,y,z] of HL){ const s=new THREE.Sprite(hm); s.position.set(x,y,z); s.scale.set(2.6*M,2.6*M,1); s.renderOrder=2; s.visible=false; SPR.push(s);
        const L=new THREE.PointLight(new THREE.Color(1,.8,.52),24,12*TILE,1.6); L.position.set(x,y,z); L.userData.i0=24; L.intensity=0; scene.add(L); lamps.push(L); LL.push(L); LGP[LL.length-1].follow=[L,s]; }
      const lit=()=>{ let d=false; try{ d=CLOCK.dark(); }catch(_){ } glass.color.setHex(d?0xffc978:0x6e6656); core.color.setHex(d?0xfff6dc:0x8a7e66); for(const s of SPR)s.visible=d; for(const L of LL.concat(PARK.hoods||[]))L.intensity=d?L.userData.i0*(DN?DN.lk:1):0; }; lit(); SYS.every(lit,2000,'061-park lamps'); PARK.lampLit=lit; } }
  const TL=[0,1,2,3].includes(+QS.get('treelook'))&&QS.get('treelook')!==null?+QS.get('treelook'):2;
  const treeLook=sh=>{ sh.vertexShader='attribute vec3 aTr; varying vec3 vTr; varying vec3 vLw;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vTr=aTr; vLw=transformed;')
      .replace('#include <shadowmap_vertex>',THREE.ShaderChunk.shadowmap_vertex.replace(/(directional|point)LightShadows\[ i \]\.shadowNormalBias/g,'($&+aTr.z*.35)'));
    let f='varying vec3 vTr; varying vec3 vLw; float TW=0., TSH=1.;\nfloat lfH(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }\n'+sh.fragmentShader
      .replace('diffuseColor.rgb*=wn.y>=max(wn.x,wn.z)?1.:','diffuseColor.rgb*=vTr.z>.5&&'+(TL>1)+'?1.:wn.y>=max(wn.x,wn.z)?1.:');
    if(TL>1)f=f.replace('#include <lights_lambert_pars_fragment>',THREE.ShaderChunk.lights_lambert_pars_fragment.replace('float dotNL = saturate( dot( geometryNormal, directLight.direction ) );','float dotNL = saturate( ( dot( geometryNormal, directLight.direction ) + TW ) / ( 1. + TW ) );'))
      .replace('#include <shadowmap_pars_fragment>',THREE.ShaderChunk.shadowmap_pars_fragment.replace(/return mix\( 1\.0, shadow, shadowIntensity \);/g,'return mix( 1., shadow, shadowIntensity * TSH );'))
      .replace('#include <lights_fragment_begin>','if(vTr.z>.5){ TW=.45; TSH=.7; }\n#include <lights_fragment_begin>')
      .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n if(vTr.z>.5){ float ao=mix(.5,1.,floor(smoothstep(0.,1.,.62*vTr.x+.38*vTr.y)*2.+.5)/2.); reflectedLight.directDiffuse*=mix(1.,ao,.6); reflectedLight.indirectDiffuse*=ao; }');
    sh.fragmentShader=f; };
  const BATCHED=(g,RG,mat)=>{ const n=RG.length-1; if(QS.get('bm')==='0'||n<2)return new THREE.Mesh(g,mat); const me=new THREE.BatchedMesh(n,RG[n],0,mat), names=Object.keys(g.attributes), I=new THREE.Matrix4(), ID=me.userData.ids=[];
    for(let i=0;i<n;i++){ const a=RG[i], b=RG[i+1]; ID[i]=-1; if(b<=a)continue; const G=new THREE.BufferGeometry(); for(const k of names){ const A=g.attributes[k], z=A.itemSize; G.setAttribute(k,new THREE.BufferAttribute(A.array.slice(a*z,b*z),z,A.normalized)); } me.setMatrixAt(ID[i]=me.addInstance(me.addGeometry(G)),I); }
    me.sortObjects=false; return me; };
  const CK={}, CARDS=(key,lite,look=0)=>{ const q=key+(lite===2?'.cl':'.c')+look; if(q in CK)return CK[q]; const D=F[key]; return CK[q]=D&&D.sum?TREEGEN.cards(D.sum,D.trunk,key.length*31+key.charCodeAt(key.length-1),lite===2,look):null; };
  const OLD=['Elder1','OakTree1','OakTree2','OakTree3','Willow1'], OWN=k=>OLD.includes(k);   // the old trees with their own leaves (owner, 7 Nov 2026)
  const F=Object.assign({},FOREST,PROPS), mesh=(list,leafy,solid=true,sway=false,opt={})=>{ if(opt.cards)opt.map=TREEGEN.leaf(); const P3=[], C3=[], SW=[], TR=[], LF=[], RN=[], RG=[], IT=[], CN=[], UV=[], c=new THREE.Color(); for(const [key,x,y,m,turn,lift] of list){ const p0=P3.length; RG.push(p0/3); const ph=hash(Math.round(x*7),Math.round(y*7),131)*6.28; const D=opt.cards&&!OWN(key)&&CARDS(key,opt.cards,Math.floor(hash(Math.round(x*7),Math.round(y*7),977)*4)%4)||F[key], p=f32(D.p), col=b8(D.c), k=b8(D.k), s=m/.84*TILE, ca=Math.cos(turn||0), sa=Math.sin(turn||0), ox=X(x), oz=Z(y), oy=(lift||0)/.84*TILE+P.hill(x,y), LBW=(D.limbs||[]).map(([ax,ay,az,bx,by,bz,ra,rb])=>[ox+(ax*ca-az*sa)*s,ay*s+oy,oz+(ax*sa+az*ca)*s,ox+(bx*ca-bz*sa)*s,by*s+oy,oz+(bx*sa+bz*ca)*s,ra*s,rb*s]);
      const nt=opt.noTrunk&&/^OakTree/.test(key)&&!OWN(key); for(let i=0;i<p.length;i+=3){ const px=p[i]*s, py=p[i+1]*s+oy, pz=p[i+2]*s; if(nt&&k[Math.floor(i/9)]===1)P3.push(ox,oy,oz); else P3.push(ox+px*ca-pz*sa,py,oz+px*sa+pz*ca); if(sway)SW.push(k[Math.floor(i/9)]===0?Math.max(0,p[i+1])*s:0,ph); if(TL)LF.push(col[i+1]>col[i]*1.08&&col[i+1]>col[i+2]*1.08?1:0); const t=Math.floor(i/9), tq=D.cards?t>>1:t, sh=k[t]===0?.86+.28*hash(tq,x*7,y*3):k[t]===2?.9+.2*hash(t,x*5,y*9):.92+.16*hash(t,x*3,y*5);
        c.setRGB(col[i]/255*sh,col[i+1]/255*sh,col[i+2]/255*sh,THREE.SRGBColorSpace); C3.push(c.r,c.g,c.b); }
      if(D.n)CN.push([p0,D.n,ca,sa]); if(opt.map){ const u=D.uv; for(let i=0,n=p.length/3;i<n;i++)UV.push(u?u[i*2]:0,u?u[i*2+1]:0); }
      if(TL){ const q0=p0/3, q1=P3.length/3; let y0=1e9, y1=-1e9, cx=0, cz=0, n=0, r1=1e-3; for(let v=q0;v<q1;v++)if(LF[v]){ y0=Math.min(y0,P3[v*3+1]); y1=Math.max(y1,P3[v*3+1]); cx+=P3[v*3]; cz+=P3[v*3+2]; n++; } cx/=n||1; cz/=n||1;
        for(let v=q0;v<q1;v++)if(LF[v])r1=Math.max(r1,Math.hypot(P3[v*3]-cx,P3[v*3+2]-cz)); const cy=(y0+y1)/2, ry=Math.max(1e-3,(y1-y0)/2);
        for(let v=q0;v<q1;v++){ TR.push(LF[v]?(P3[v*3+1]-y0)/Math.max(1e-3,y1-y0):0,LF[v]?Math.hypot(P3[v*3]-cx,P3[v*3+2]-cz)/r1:0,LF[v]); RN.push((P3[v*3]-cx)/(r1*r1),(P3[v*3+1]-cy)/(ry*ry),(P3[v*3+2]-cz)/(r1*r1)); } }
      { let t=oy, r=0; for(let v=p0+1;v<P3.length;v+=3)if(P3[v]>t)t=P3[v]; const hm=(oy+t)/2; for(let v=p0;v<P3.length;v+=3)if(P3[v+1]>hm)r=Math.max(r,Math.hypot(P3[v]-ox,P3[v+2]-oz)); const D=[]; for(let v=p0/3;v<P3.length/3;v++){ const y=P3[v*3+1]-oy; if(!LF[v]&&y>.6*TILE&&y<1.6*TILE)D.push(Math.hypot(P3[v*3]-ox,P3[v*3+2]-oz)); } D.sort((a,b)=>a-b);   // tr: the bark's radius at reaching height
        const tr=D.length?D[D.length>>1]:0; let fork=0; if(tr)for(let v=p0/3;v<P3.length/3;v++)if(k[Math.floor((v-p0/3)/3)]!==0&&Math.hypot(P3[v*3]-ox,P3[v*3+2]-oz)<1.8*tr)fork=Math.max(fork,P3[v*3+1]-oy);   // fork: how high the bark goes straight up
        IT.push({k:key,x:ox,z:oz,y:oy,top:t,r,tr,fork,v0:p0/3,v1:P3.length/3,P:P3,LF,lb:LBW}); }   // v0..v1 of P: its own triangles, for what touches it
      if(!opt.far)CLIPX.push({place:'park',name:key,P:P3.slice(p0)});
      if(solid){ const r=Math.max(.3,D.trunk*s*.5*(opt.noTrunk?PARK.TRK:1)), sb=[ox-r,oz-r,ox+r,oz+r], fb=[ox-r,oz-r,0,ox+r,oz+r,leafy?Y(60):s*.9]; SOL.up.push(sb); FIX.up.push(fb); const it=IT[IT.length-1]; if(it){ it.sol=sb; it.fix=fb; } } }   // the item keeps its footprint, so the world editor can move it
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P3,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C3,3)); g.computeVertexNormals();
    if(CN.length){ const N=g.attributes.normal.array; for(const [j0,n,ca,sa] of CN)for(let i=0;i<n.length;i+=3){ const j=j0+i; N[j]=n[i]*ca-n[i+2]*sa; N[j+1]=n[i+1]; N[j+2]=n[i]*sa+n[i+2]*ca; } }
    if(opt.map)g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2)); if(sway)g.setAttribute('aSw',new THREE.Float32BufferAttribute(SW,2)); if(TL)g.setAttribute('aTr',new THREE.Float32BufferAttribute(TR,3));
    if(TL>1){ const N=g.attributes.normal.array; for(let v=0;v<LF.length;v++)if(LF[v]){ let x=RN[v*3], y=RN[v*3+1], z=RN[v*3+2]; const l=Math.hypot(x,y,z)||1; x=x/l*.8+N[v*3]*.2; y=y/l*.8+N[v*3+1]*.2; z=z/l*.8+N[v*3+2]*.2; const m=Math.hypot(x,y,z)||1; N[v*3]=x/m; N[v*3+1]=y/m; N[v*3+2]=z/m; } }
    const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,shadowSide:THREE.BackSide}); if(opt.map){ mat.map=opt.map; mat.alphaTest=.5; }
    const SR='sr=1.-smoothstep(uSwAt.w*.85,uSwAt.w,distance(transformed.xz,uSwAt.xz))', SWG=sway&&(sway===2?'{ float h=aSw.x, '+SR+', g=(.7+.3*sin(uSw*.23+aSw.y))*uWk*sr; transformed.x+=sin(uSw*2.3+aSw.y)*h*.12*g; transformed.z+=sin(uSw*1.9+aSw.y*1.7)*h*.08*g; }':'{ float h=aSw.x*aSw.x*.1, '+SR+', g=(.7+.3*sin(uSw*.23+aSw.y))*uWk*sr; transformed.x+=sin(uSw*1.6+aSw.y)*h*.035*g; transformed.z+=sin(uSw*1.2+aSw.y*1.7)*h*.025*g; }'), swayV=sh=>{ sh.uniforms.uSw=PARK.sway; sh.uniforms.uWk=PARK.windK; sh.uniforms.uSwAt=PARK.swayAt; sh.vertexShader='attribute vec2 aSw; uniform vec4 uSwAt; uniform float uSw,uWk;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n '+SWG); };
    if(leafy&&!PARK.leafN){ PARK.leafN={value:0}; PARK.season={value:new THREE.Vector4(.5,.5,.5,0)}; PARK.seasonD={value:0}; SYS.add('life',()=>{ const h=CLOCK.h??12, c=x=>Math.max(0,Math.min(1,x)); PARK.leafN.value=1-c((h-5)/2)*c((20-h)/2); },'061-leafnight'); }
    // leaves by moonlight: darker and greyer as the day goes, so a crown never glows at night
    const leafN=sh=>{ sh.uniforms.uLeafN=PARK.leafN; sh.uniforms.uSeason=PARK.season; sh.uniforms.uSeasonD=PARK.seasonD; sh.fragmentShader='uniform float uLeafN,uSeasonD; uniform vec4 uSeason;\n'+sh.fragmentShader.replace('#include <opaque_fragment>','{ outgoingLight=mix(outgoingLight,outgoingLight*uSeason.rgb*2.,uSeason.w); float l=dot(outgoingLight,vec3(.3,.59,.11)); outgoingLight=mix(outgoingLight,vec3(l),uSeasonD); outgoingLight=mix(outgoingLight,vec3(l)*vec3(.85,.95,1.08),.5*uLeafN)*(1.-.5*uLeafN); }\n#include <opaque_fragment>'); };
    // the handover band (lod: 'near' the whole tree, 'far' its stand-in): across PARK.lodBand both are drawn, each pixel kept by one of them, a square dither between
    const lodH=sh=>{ '@later'; sh.uniforms.uLodAt=PARK.lodAt; sh.uniforms.uLodBand=PARK.lodBand; sh.vertexShader='uniform vec3 uLodAt; varying float vLodD;\n'+sh.vertexShader.replace('#include <project_vertex>','vLodD=distance((modelMatrix*vec4(transformed,1.)).xz,uLodAt.xz);\n#include <project_vertex>');
      sh.fragmentShader='uniform vec2 uLodBand; varying float vLodD;\n'+sh.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\n{ vec2 q=floor(gl_FragCoord.xy*.5), h=mod(q,2.), l=mod(floor(q*.5),2.); float by=(4.*mod(h.x*2.+h.y*3.,4.)+mod(l.x*2.+l.y*3.,4.)+.5)/16., lf=smoothstep(uLodBand.x,uLodBand.y,vLodD); if('+(opt.lod==='far'?'by>=lf':'by<lf')+')discard; }'); };
    if(sway||TL||leafy||opt.lod){ mat.onBeforeCompile=sh=>{ if(TL)treeLook(sh); if(sway)swayV(sh); if(leafy)leafN(sh); if(opt.lod)lodH(sh); }; mat.customProgramCacheKey=()=>'oaksway'+sway+'tl'+TL+'lf'+!!leafy+'lod'+(opt.lod||''); }
    if(leafy)PEEK.mark(g,new Uint8Array(g.attributes.position.count).fill(5)); RG.push(P3.length/3); const me=BATCHED(g,RG,mat); if(leafy||opt.cards)me.userData.tall=1; if(leafy)for(const o of IT)PEEK.box(me,o.x-o.r,o.y,o.z-o.r,o.x+o.r,o.top,o.z+o.r); me.userData.P=P3; me.userData.LF=LF; me.userData.items=IT; me.castShadow=true; me.receiveShadow=TL!==2;
    if(opt.map){ const M=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:opt.map,alphaTest:.5}); if(sway||opt.lod){ M.onBeforeCompile=sh=>{ if(sway)swayV(sh); if(opt.lod)lodH(sh); }; M.customProgramCacheKey=()=>'leafd'+sway+'lod'+(opt.lod||''); } me.customDepthMaterial=M; }
    if(sway&&TL)for(const [k,M] of [['customDepthMaterial',new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking})],['customDistanceMaterial',new THREE.MeshDistanceMaterial()]]){ M.onBeforeCompile=swayV; M.customProgramCacheKey=()=>'oakswayd'+sway; me[k]=M; }
    // a shadow-only stand-in: drawn into the shadow maps by its own depth materials, never into the picture (its own material fails every depth test)
    if(opt.caster){ me.material=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false,depthFunc:THREE.NeverDepth}); me.receiveShadow=false;
      for(const [k,M] of [['customDepthMaterial',new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:opt.map,alphaTest:.5})],['customDistanceMaterial',new THREE.MeshDistanceMaterial({map:opt.map,alphaTest:.5})]]){ if(sway){ M.onBeforeCompile=swayV; M.customProgramCacheKey=()=>'leafsh'+sway+k; } me[k]=M; } }
    if(me.isBatchedMesh&&!opt.far){ const ids=[]; for(let i=0;i+1<RG.length;i++)if(RG[i+1]>RG[i])ids.push(i); WED.meshes.push({place:'park',me,items:IT,ids}); }
    if(!me.isBatchedMesh)me.userData.cull=1;
    scene.add(me); return me; };
  const TREEY=12+4.6; PARK.mesh=mesh; PARK.lodAt={value:pos}; PARK.lodBand={value:new THREE.Vector2(1e9,1e9+1)};
  for(const S of ['A','C','AL','CL','E','K'])for(let i=0;i<TREEGEN.count(S);i++)F['G'+S+i]=TREEGEN.get(S,i);
  for(const k in TREEGEN.old)if(F[k])F[k].sum=TREEGEN.old[k];
  const gk=(x,y,sd,low)=>{ const h=k=>hash(Math.round(x*3),Math.round(y*3),sd+k); if(h(0)<.5)return null; const S=(h(1)<.5?'A':'C')+(low?'L':''); return 'G'+S+Math.floor(h(2)*TREEGEN.count(S)); };
  const TREES=(()=>{ const out=[], RR=[], KEEP=[[LX-LR-2,LY-LR-2,LX+LR+2,LY+LR+2],[CL[0]-1.5,CL[1]-1.5,CL[2]+1.5,CL[3]+1.5],[P.gate[0]-16,P.y0,P.gate[1]+8,P.y0+12],(c=>[c.x-7,c.y-7,c.x+7,c.y+7])(P.campAt()),[RX(90)-3,RY(-41.5)-3,RX(102)+3,RY(-41.5)+3],...(typeof GCAVE!=='undefined'?GCAVE.keep(P):[]),...(LEVEL.parkPlaces.sites||[]).map(q=>[q.x-q.w/2-2,q.y-q.d/2-2,q.x+q.w/2+2,q.y+q.d/2+2])];
    const [cx,cy]=P.round, W=k=>/^Oak/.test(k)?.42:F[k].wide*.45, add=(k,x,y,m,t)=>{ out.push([k,+x.toFixed(1),+y.toFixed(1),+m.toFixed(1),+t.toFixed(2)]); RR.push(m*W(k)); }, near=(x,y,r,f,g)=>out.some((o,j)=>Math.hypot(o[1]-x,o[2]-y)<Math.max(g,(RR[j]+r)*f)),
      ok=(x,y,r)=>!(pd(x,y)<3+r||y<P.y0+TREEY+4||y>P.y1-r-8||x<P.x0+r+10||x>P.x1-r-10||Math.hypot(x-cx,y-cy)<P.round[2]+r+6||KEEP.some(b=>x>b[0]-r&&x<b[2]+r&&y>b[1]-r&&y<b[3]+r)||BK.wet(x,y,r)||FOUNT.lake(x,y)<r*.35+1.5||FOUNT.ter(x,y)<r+.5);
    // as thick as Central Park (owner, 8 Nov 2026, his photos of the Mall, the Gapstow pond and the park from the air): rows down both sides of every path, their crowns meeting over it; trees along the lake's track and the brook; woods between, crowns touching, in drifts; open lawns round the giants and where the woods thin
    { const BIG=(LEVEL.bigTrees||[]).filter(o=>o.kind).map(o=>[o.x-PO.x,o.y-PO.y]), PF={greenhouse:9,torii:5,zen:9,archbridge:8,creekbridge:7,woodbridge:7,logbridge:6,trestle:8,redbarn:7,picket:2.6,picnictable:3,canoe:3,kayak:3,skiff:3};
      const C=8, GR=new Map(), cell=(x,y)=>Math.floor(x/C)+','+Math.floor(y/C), put=(x,y,r)=>{ const q=cell(x,y); if(!GR.has(q))GR.set(q,[]); GR.get(q).push([x,y,r]); }, around=(x,y,R,f)=>{ const n=Math.ceil(R/C); for(let i=-n;i<=n;i++)for(let j=-n;j<=n;j++)for(const e of GR.get(cell(x+i*C,y+j*C))||[])if(f(e))return true; return false; };
      const TH=new Map(); for(const o of LEVEL.things||[]){ const k=String(o.k||''); if(!/^p:/.test(k))continue; const r=PF[k.slice(2)]||.5, x=o.x-PO.x, y=o.y-PO.y, q=cell(x,y); if(!TH.has(q))TH.set(q,[]); TH.get(q).push([x,y,r]); }
      const onThing=(x,y,r)=>{ for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)for(const [a,b,s] of TH.get(cell(x+i*C,y+j*C))||[])if(Math.hypot(a-x,b-y)<s+r)return true; return false; };
      const giant=(x,y,r,g=22)=>BIG.some(([a,b])=>Math.hypot(a-x,b-y)<g+r), crowd=(x,y,r,f,g)=>around(x,y,16,([a,b,s])=>Math.hypot(a-x,b-y)<Math.max(g,(s+r)*f));
      const keep=(x,y,r)=>KEEP.some(b=>x>b[0]-r&&x<b[2]+r&&y>b[1]-r&&y<b[3]+r)||x<P.x0+8||x>P.x1-8||y<P.y0+TREEY||y>P.y1-6||Math.hypot(x-cx,y-cy)<P.round[2]+r+4;
      const place=(k,x,y,m,t)=>{ add(k,x,y,m,t); put(x,y,m*W(k)); };
      const vn=(x,y,c,sd)=>{ const gx=Math.floor(x/c), gy=Math.floor(y/c), u0=x/c-gx, v0=y/c-gy, u=u0*u0*(3-2*u0), v=v0*v0*(3-2*v0), h=(i,j)=>hash(gx+i+500,gy+j+500,sd), a=h(0,0), b=h(1,0), c2=h(0,1), d=h(1,1); return a+(b-a)*u+(c2-a)*v+(a-b-c2+d)*u*v; };
      const wood=(x,y)=>.65*vn(x,y,40,401)+.35*vn(x,y,15,409), OAK=['OakTree1','OakTree2','OakTree3','Elder1'], kind=(a,b,c)=>OAK[Math.floor(hash(a,b,c)*OAK.length)%OAK.length];
      const row=(x,y,k,m,n)=>{ const r=m*W(k); if(pd(x,y)<1.6||FOUNT.lake(x,y)<2||BK.wet(x,y,1)||FOUNT.ter(x,y)<2||keep(x,y,0)||giant(x,y,0,15)||onThing(x,y,.6)||crowd(x,y,r,.45,6))return; place(k,x,y,m,hash(n,7,231)*6.28); };
      // the paths' rows: the Mall's trees, the trunk just off the path's edge, one each side every 9 tiles
      let n=0; for(const [ax,ay,bx,by] of P.segs){ const L=Math.hypot(bx-ax,by-ay), ux=(bx-ax)/L, uy=(by-ay)/L, NW=Math.round(L/70);
        for(let s=4;s<L-2;s+=9)for(const sd of [-1,1]){ n++; const w=WA*Math.sin(2*Math.PI*NW*s/L), off=sd*8.5+w+(hash(n,3,233)-.5), x=ax+ux*s-uy*off, y=ay+uy*s+ux*off; row(x,y,kind(n,5,235),5.25*(2+.4*hash(n,9,237)),n); } }
      // the lake's track: oaks behind it and willows leaning to the water
      { const S=FOUNT.S; for(let i=0;i<S.shore.length;i+=5){ n++; const [x,y]=S.shore[i], q=S.nrm(x,y), d=FOUNT.TRACK[0]+FOUNT.TRACK[1]+3+hash(n,11,239)*2.5, wl=hash(n,13,241)<.4; row(x+q[0]*d,y+q[1]*d,wl?'Willow1':kind(n,15,243),5.25*(wl?1.3+.3*hash(n,17,245):1.5+.5*hash(n,17,245)),n); } }
      // the brook's banks
      { const B=(LEVEL.parkPlaces.brook&&LEVEL.parkPlaces.brook.pts)||[]; for(let i=0;i+1<B.length;i++){ const [ax,ay]=[B[i][0]-PO.x,B[i][1]-PO.y], [bx,by]=[B[i+1][0]-PO.x,B[i+1][1]-PO.y], L=Math.hypot(bx-ax,by-ay)||1, ux=(bx-ax)/L, uy=(by-ay)/L;
        for(let s=0;s<L;s+=7)for(const sd of [-1,1]){ n++; const off=sd*(5+hash(n,19,247)*3), x=ax+ux*s-uy*off, y=ay+uy*s+ux*off; row(x,y,hash(n,21,249)<.5?'Willow1':kind(n,23,251),5.25*(1.3+.4*hash(n,25,253)),n); } } }
      // the woods: thick where the drift is high, thinning to open lawn; never a crown over a path
      for(let i=0;i<40000;i++){ const x=P.x0+(P.x1-P.x0)*hash(i,31,261), y=P.y0+(P.y1-P.y0)*hash(i,33,263), w=wood(x,y); if(w<.4||hash(i,35,265)>Math.min(1,(w-.4)*6))continue;
        const k=kind(i,37,267), m=5.25*(1.4+.8*hash(i,39,269)), r=m*W(k); if(!ok(x,y,r*.7)||keep(x,y,r*.5)||giant(x,y,r)||onThing(x,y,r*.4)||crowd(x,y,r,.72,4))continue; place(k,x,y,m,hash(i,41,271)*6.28); } }
    { const FY=[P.y1+6,P.y1+20,P.y1+36], XA=P.x0-16, XB=P.x1+16, BACK=out.back=[]; let n=0; for(const [ri,fy] of FY.entries())for(let x=XA+9*ri+6;x<XB;x+=18,n++){ const k=hash(n,201,3)<.3?'Elder'+(1+n%2):'OakTree'+(1+n%3), m=5.25*(1.1+.25*hash(n,203,5)), xx=x+(hash(n,205,7)-.5)*9, yy=fy+(hash(n,207,9)-.5)*8; BACK.push([k,+xx.toFixed(1),+yy.toFixed(1),+m.toFixed(1),+(hash(n,209,11)*6.28).toFixed(2)]); } }
    const R0=out.length; let edgeOK;
    // a dense ring of tall trees just inside the wall, right round the park, so from outside only trees show at the edge
    { const TK=OLD.filter(k=>k!=='Willow1');   // no willows on the wall (owner, 7 Nov 2026)
      const gap=(v,g,pad)=>g&&v>g[0]-pad&&v<g[1]+pad, PAD=4.5;
      edgeOK=(x,y)=>!(FOUNT.lake(x,y)<2.4||FOUNT.ter(x,y)<2.2||BK.wet(x,y,2)||path(x,y)||inCL(x,y,1));
      // one row along the wall, each crown just clear of the next (owner: "this size and distance from each other")
      const lowR=k=>{ const q=k+'.low'; if(!F[q])F[q]=TREEGEN.low(F[k].sum,F[k].trunk); return F[q].rad/.84; }; let s=5000;
      const row=(a0,a1,at,g)=>{ let u=a0, prev=0; for(;;){ const k=TK[Math.floor(hash(s,1,11)*TK.length)%TK.length], m=5.25*(1.6+.6*hash(s,2,13)), r=lowR(k)*m; u+=(prev+r)/2+.3; if(u>a1-r)break; prev=r;
        const [x,y]=at(u,r+1.1), sd=s++; if(gap(u,g,PAD+r)||!edgeOK(x,y)||KEEP.some(b=>x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]))continue; add(k,x,y,m,hash(sd,4,19)*6.28); } };
      row(P.x0+1,P.x1-1,(u,o)=>[u,P.y0+o],P.gate); if(!PARK.openN)row(P.x0+1,P.x1-1,(u,o)=>[u,P.y1-o],PARK.ngate);
      const RM=Math.max(...TK.map(k=>lowR(k)*9))*2;   // the side rows leave the corners to the end rows
      row(P.y0+RM,P.y1-RM,(u,o)=>[P.x0+o,u],PARK.wgate); if(!PARK.openE)row(P.y0+RM,P.y1-RM,(u,o)=>[P.x1-o,u],PARK.egate); }
    // the edge ring baked low, its crowns kept inside the wall and clear of the gateways: moved in or along, else shrunk to fit, else left out
    { const low=k=>{ const q=k+'.low'; if(!F[q])F[q]=TREEGEN.low(F[k].sum,F[k].trunk); return q; }, M=.6, w0=[P.x0+T,P.x1-T,P.y0+T,P.y1-T], D=7;
      const GB=[[P.gate,0,w0[2],1],[PARK.ngate,0,w0[3],-1],[PARK.wgate,1,w0[0],1],[PARK.egate,1,w0[1],-1]].filter(g=>g[0]).map(([g,ax,f,sg])=>{ const a=Math.min(f,f+D*sg), b=Math.max(f,f+D*sg); return ax?[a,g[0]-PW,b,g[1]+PW,1]:[g[0]-PW,a,g[1]+PW,b,0]; });
      const bd=(x,y,b)=>Math.hypot(x-Math.max(b[0],Math.min(b[2],x)),y-Math.max(b[1],Math.min(b[3],y))), fit=(x,y)=>Math.min(x-w0[0],w0[1]-x,y-w0[2],w0[3]-y,...GB.map(b=>bd(x,y,b)))-M;
      const slide=(x,y,r)=>{ for(const b of GB){ if(bd(x,y,b)>=r+M)continue; if(b[4])y=y<(b[1]+b[3])/2?b[1]-r-M:b[3]+r+M; else x=x<(b[0]+b[2])/2?b[0]-r-M:b[2]+r+M; }
        return [Math.max(w0[0]+r+M,Math.min(w0[1]-r-M,x)),Math.max(w0[2]+r+M,Math.min(w0[3]-r-M,y))]; };
      for(let i=out.length-1;i>=R0;i--){ const e=out[i]; if(!F[e[0]].sum)continue; const r=F[low(e[0])].rad*e[3]/.84, [x,y]=slide(e[1],e[2],r);
        if(edgeOK(x,y)&&fit(x,y)>=r-.01){ e[1]=+x.toFixed(1); e[2]=+y.toFixed(1); continue; }
        const m=e[3]*Math.max(0,fit(e[1],e[2]))/r; if(m<3){ out.splice(i,1); continue; } if(e[5])e[5]*=m/e[3]; e[3]=+m.toFixed(1); }
      PARK.ringN=out.length-R0; }
    for(const e of out.back){ const k=gk(e[1],e[2],219,false); if(k)e[0]=k; }
    return out; })();
  // the oaks' trunks: a tapering, slightly bent stem with rounded root flares at its foot and a few limbs into the crown, in a bark texture; a ring of small wild flowers round each foot
  const trunks=(()=>{ let bark=null; const barkTex=()=>{ if(bark)return bark; const W=64, H=256, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d'); let a=11; const R=()=>{ a=(a*16807)%2147483647; return a/2147483647; };
      g.fillStyle='#d8d0c4'; g.fillRect(0,0,W,H); for(let i=0;i<70;i++){ const x=R()*W, w=1+R()*2.5, y=R()*H, h=30+R()*120, sh=R(); g.fillStyle=sh<.5?'rgba(70,58,48,.55)':'rgba(120,104,90,.45)'; g.fillRect(x,y,w,h); if(y+h>H)g.fillRect(x,y-H,w,h); }
      for(let i=0;i<40;i++){ g.fillStyle='rgba(60,50,40,.5)'; g.fillRect(R()*W,R()*H,3+R()*6,1); } for(let i=0;i<300;i++){ g.fillStyle=R()<.5?'rgba(255,255,255,.12)':'rgba(0,0,0,.12)'; g.fillRect(R()*W,R()*H,1,1+R()*3); }
      bark=new THREE.CanvasTexture(cv); bark.wrapS=bark.wrapT=THREE.RepeatWrapping; bark.colorSpace=THREE.SRGBColorSpace; bark.magFilter=THREE.NearestFilter; return bark; };
    // one trunk shape per seed: rings up a bent stem, the radius tapering, lobed and flared into roots at the foot
    const shape=(seed,top)=>{ let a=seed*7919+1; const R=()=>{ a=(a*16807)%2147483647; return a/2147483647; }, RS=10, RH=9, P=[], UV=[], I=[], r0=.042*PARK.TRK, bx=(R()-.5)*.05, bz=(R()-.5)*.05, ph=R()*6.28, nl=5;
      const ring=(y,rad,cx,cz,lob,v)=>{ const b=P.length/3; for(let i=0;i<=RS;i++){ const t=i/RS*Math.PI*2, w=1+lob*Math.max(0,Math.cos(nl*t+ph))**3+.06*Math.sin(3*t+ph*2); P.push(cx+Math.cos(t)*rad*w,y,cz+Math.sin(t)*rad*w); UV.push(i/RS*2,v); } return b; };
      const tube=(rows)=>{ for(let j=0;j<rows.length-1;j++){ const a0=rows[j], a1=rows[j+1]; for(let i=0;i<RS;i++)I.push(a0+i,a1+i,a0+i+1,a0+i+1,a1+i,a1+i+1); } };
      const rows=[]; for(let j=0;j<=RH;j++){ const t=j/RH, y=t*top, fl=Math.max(0,1-t/.18), rad=r0*(1-.42*t)*(1+1.1*fl*fl), lob=1.4*fl*fl; rows.push(ring(y-(j?0:.01),rad,bx*t*t,bz*t*t,lob,y*14)); } tube(rows);
      // limbs: from the upper stem out and up into the crown
      const limb=(sx,sy,sz,ex,ey,ez,ra,rb)=>{ const lr=[]; for(let j=0;j<=3;j++){ const u=j/3, sag=Math.sin(u*Math.PI)*.025; lr.push(ring(sy+(ey-sy)*u+sag,ra+(rb-ra)*u,sx+(ex-sx)*u,sz+(ez-sz)*u,0,(sy+(ey-sy)*u)*14)); } tube(lr); };
      for(let l=0,n=4+Math.floor(R()*2);l<n;l++){ const t0=.38+R()*.4, az=ph+l/n*6.28+R()*.5, len=.26+R()*.16, y0=t0*top, sx=bx*t0*t0, sz=bz*t0*t0, ex=sx+Math.cos(az)*len, ez=sz+Math.sin(az)*len, ey=y0+len*.45, rr=r0*.55;
        limb(sx,y0,sz,ex,ey,ez,rr,rr*.45); const fa=az+(R()<.5?-1:1)*(.5+R()*.4), fl=len*(.45+R()*.25); limb(ex,ey,ez,ex+Math.cos(fa)*fl,ey+fl*.6,ez+Math.sin(fa)*fl,rr*.45,rr*.15); limb(ex,ey,ez,ex+Math.cos(az)*fl*.8,ey+fl*.35,ez+Math.sin(az)*fl*.8,rr*.4,rr*.12); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2)); g.setIndex(I); g.computeVertexNormals(); return g; };
    const FLW=[[.95,.93,.86],[.98,.84,.25],[.72,.55,.9],[.95,.6,.7],[.6,.75,.98]];
    return list=>{ const oaks=list.filter(e=>/^OakTree/.test(e[0])); if(!oaks.length)return null; const grp=new THREE.Group(), gims=grp.userData.ims=[], ZERO=new THREE.Matrix4().makeScale(0,0,0), byK=new Map(), M=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), S=new THREE.Vector3(), up=new THREE.Vector3(0,1,0), c=new THREE.Color();
      for(const e of oaks){ if(!byK.has(e[0]))byK.set(e[0],[]); byK.get(e[0]).push(e); }
      const mat=new THREE.MeshLambertMaterial({map:barkTex()}); let fl=[];
      for(const [key,L] of byK){ const D=F[key], kk=b8(D.k), pp=f32(D.p), cc=b8(D.c); let top=0, t0=-1; for(let t=0;t<kk.length;t++)if(kk[t]===1){ if(t0<0)t0=t; for(let v=0;v<3;v++)top=Math.max(top,pp[t*9+v*3+1]); }
        const bc=t0<0?[90,70,50]:[cc[t0*9],cc[t0*9+1],cc[t0*9+2]], geo=shape(key.length*31+key.charCodeAt(7),Math.min(.55,top*.8)), im=new THREE.InstancedMesh(geo,mat,L.length), _cx=new Float32Array(L.length), _cz=new Float32Array(L.length), _m0=[];
        L.forEach(([k2,x,y,m,turn,lift],i)=>{ const s=m/.84*TILE; Q.setFromAxisAngle(up,turn||0); im.setMatrixAt(i,M.compose(V.set(X(x),(lift||0)/.84*TILE+P.hill(x,y),Z(y)),Q,S.set(s,s,s))); _cx[i]=X(x); _cz[i]=Z(y); _m0.push(M.clone()); const j=.85+.3*hash(Math.round(x*7),Math.round(y*7),157);
          im.setColorAt(i,c.setRGB(bc[0]/255*j*1.25,bc[1]/255*j*1.25,bc[2]/255*j*1.25,THREE.SRGBColorSpace));
          for(let f=0,nf=4+Math.floor(hash(i,Math.round(x),163)*6);f<nf;f++){ const a=hash(Math.round(x*9)+f,Math.round(y*9),167)*6.28, d=(.09+.12*hash(f,Math.round(x*5),171))*s; fl.push([X(x)+Math.cos(a)*d,Z(y)+Math.sin(a)*d,x,y,FLW[Math.floor(hash(f,Math.round(y*5),173)*FLW.length)],a]); } });
        im.castShadow=true; im.receiveShadow=true; im.computeBoundingSphere(); im.userData.cx=_cx; im.userData.cz=_cz; im.userData.m0=_m0; im.userData.vis=new Uint8Array(L.length).fill(1); gims.push(im); grp.add(im); }
      // the flowers: a stem and a little head each, standing out of the grass at the trunk's foot
      fl=fl.filter(([wx,wz,x,y])=>!path(x,y)&&!BK.wet(x,y,.3)); if(fl.length){ const sg=new THREE.CylinderGeometry(.012*TILE,.016*TILE,1,4,1,true).translate(0,.5,0), hg=new THREE.IcosahedronGeometry(.06*TILE,0), lm=new THREE.MeshLambertMaterial(), hm=new THREE.MeshLambertMaterial({flatShading:true});
        const st=new THREE.InstancedMesh(sg,lm,fl.length), hd=new THREE.InstancedMesh(hg,hm,fl.length);
        fl.forEach(([wx,wz,x,y,col,a],i)=>{ const h=(.5+.35*hash(i,7,177))*TILE, gy=SHARED.groundY?SHARED.groundY(wx,wz):P.hill(x,y); st.setMatrixAt(i,M.compose(V.set(wx,gy,wz),Q.setFromAxisAngle(up,a),S.set(1,h,1))); st.setColorAt(i,c.setRGB(.25,.45,.18,THREE.SRGBColorSpace));
          hd.setMatrixAt(i,M.compose(V.set(wx,gy+h,wz),Q,S.set(1,.7,1))); hd.setColorAt(i,c.setRGB(col[0],col[1],col[2],THREE.SRGBColorSpace)); });
        st.receiveShadow=hd.receiveShadow=true; grp.add(st,hd); grp.flowers=fl.length; }
      grp.userData.cull=(far,px,pz)=>{ '@later'; for(const im of gims){ const cx=im.userData.cx, cz=im.userData.cz, m0=im.userData.m0, vis=im.userData.vis; let ch=false; for(let i=0;i<cx.length;i++){ const sh=Math.hypot(cx[i]-px,cz[i]-pz)<=far?1:0; if(sh!==vis[i]){ im.setMatrixAt(i,sh?m0[i]:ZERO); vis[i]=sh; ch=true; } } if(ch)im.instanceMatrix.needsUpdate=true; } };
      scene.add(grp); return grp; }; })();
  // round every big tree's foot (owner, 2 Nov 2026: "tufts, flowers, mushrooms, etc. eco system around larger trees"): wild flowers in the grass and mushrooms in the roots' shade, beside the tufts
  const feet=list=>{ '@later'; const fl=[], mu=[], FLW=[[.95,.93,.86],[.98,.84,.25],[.72,.55,.9],[.95,.6,.7],[.6,.75,.98]], MU=[[.78,.2,.16],[.62,.44,.3],[.86,.78,.62],[.55,.36,.24]];
    for(const [k,x,y,m] of list){ if(!/^G[EK]/.test(k))continue; const s=m/.84*TILE, rw=Math.max(.3*TILE,F[k].trunk*s*.5), sx=Math.round(x*7), sy=Math.round(y*7);
      for(let f=0,nf=12+Math.floor(hash(sx,sy,301)*10);f<nf;f++){ const a=hash(sx+f,sy,303)*6.28, d=rw+(.4+2.6*Math.sqrt(hash(f,sx,305)))*TILE; fl.push([X(x)+Math.cos(a)*d,Z(y)+Math.sin(a)*d,x+Math.cos(a)*d/TILE,y+Math.sin(a)*d/TILE,FLW[Math.floor(hash(f,sy,307)*FLW.length)],a]); }
      for(let f=0,nf=4+Math.floor(hash(sx,sy,311)*6);f<nf;f++){ const a=hash(sx+f,sy,313)*6.28, d=rw+(.15+.9*hash(f,sx,315))*TILE; mu.push([X(x)+Math.cos(a)*d,Z(y)+Math.sin(a)*d,x+Math.cos(a)*d/TILE,y+Math.sin(a)*d/TILE,MU[Math.floor(hash(f,sy,317)*MU.length)],(.6+.7*hash(f,sy,319))]); } }
    const ok=([,,x,y])=>!path(x,y)&&!BK.wet(x,y,.3), F1=fl.filter(ok), M1=mu.filter(ok); if(!F1.length&&!M1.length)return null;
    const grp=new THREE.Group(), M=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), S=new THREE.Vector3(), up=new THREE.Vector3(0,1,0), c=new THREE.Color(), gy=(wx,wz,x,y)=>SHARED.groundY?SHARED.groundY(wx,wz):P.hill(x,y);
    const inst=(geo,mat,n,fn)=>{ const im=new THREE.InstancedMesh(geo,mat,n); for(let i=0;i<n;i++)fn(im,i); im.receiveShadow=true; grp.add(im); return im; };
    if(F1.length){ const sg=new THREE.CylinderGeometry(.012*TILE,.016*TILE,1,4,1,true).translate(0,.5,0), hg=new THREE.IcosahedronGeometry(.06*TILE,0), H=F1.map((q,i)=>(.4+.35*hash(i,9,321))*TILE);
      inst(sg,new THREE.MeshLambertMaterial(),F1.length,(im,i)=>{ const [wx,wz,x,y,,a]=F1[i]; im.setMatrixAt(i,M.compose(V.set(wx,gy(wx,wz,x,y),wz),Q.setFromAxisAngle(up,a),S.set(1,H[i],1))); im.setColorAt(i,c.setRGB(.25,.45,.18,THREE.SRGBColorSpace)); });
      inst(hg,new THREE.MeshLambertMaterial({flatShading:true}),F1.length,(im,i)=>{ const [wx,wz,x,y,col]=F1[i]; im.setMatrixAt(i,M.compose(V.set(wx,gy(wx,wz,x,y)+H[i],wz),Q.identity(),S.set(1,.7,1))); im.setColorAt(i,c.setRGB(col[0],col[1],col[2],THREE.SRGBColorSpace)); }); }
    if(M1.length){ const sg=new THREE.CylinderGeometry(.035*TILE,.045*TILE,.12*TILE,6,1).translate(0,.06*TILE,0), cg=new THREE.SphereGeometry(.11*TILE,8,4,0,6.283,0,1.5).scale(1,.6,1);
      inst(sg,new THREE.MeshLambertMaterial(),M1.length,(im,i)=>{ const [wx,wz,x,y,,k]=M1[i]; im.setMatrixAt(i,M.compose(V.set(wx,gy(wx,wz,x,y),wz),Q.identity(),S.set(k,k,k))); im.setColorAt(i,c.setRGB(.9,.86,.76,THREE.SRGBColorSpace)); });
      inst(cg,new THREE.MeshLambertMaterial({flatShading:true}),M1.length,(im,i)=>{ const [wx,wz,x,y,col,k]=M1[i]; im.setMatrixAt(i,M.compose(V.set(wx,gy(wx,wz,x,y)+.11*TILE*k,wz),Q.setFromAxisAngle(up,i),S.set(k,k,k))); im.setColorAt(i,c.setRGB(col[0],col[1],col[2],THREE.SRGBColorSpace)); }); }
    grp.userData.flowers=F1.length; grp.userData.mushrooms=M1.length; (MAPG.park||scene).add(grp); return grp; };
  const NOTREES=QS.get('trees')==='0';   // no trees placed yet (owner, 5 Nov 2026); ?trees=1 shows them
  PARK.trunksOf=trunks;
  const NI=TREES.length-PARK.ringN, INO=[], INC=[]; PARK.later(()=>{ PARK.trees=NOTREES||!INO.length?null:mesh(INO,true,true,true,{lod:'near'}); PARK.cards=NOTREES||!INC.length?null:mesh(INC,true,true,true,{noTrunk:1,cards:1}); PARK.trunks=INC.length?trunks(INC):null; PARK.feet=INO.length+INC.length?feet(INO.concat(INC)):null;   // only the ring along the wall, no trees inside (owner, 7 Nov 2026)
    if(PARK.trees&&WEEDS){ const F=WEEDS.feet=WEEDS.feet||[]; for(const it of PARK.trees.userData.items||[])if(it.sol)F.push([it.x,it.z,(it.sol[2]-it.sol[0])/2]); } if(WEEDS&&WEEDS.lawnDrop)WEEDS.lawnDrop(P.rect()); });
  PARK.ring=NOTREES?null:mesh(TREES,true,true,false,{}); PARK.ringTrunks=null;   // the old trees in their own leaves, the ring and the park's woods in one mesh
  // the ring cheap from far off (owner, 8 Nov 2026: "simplify the other park trees too"): each tree whole within 30 tiles of you; further off its plain shape, a round crown (twenty triangles) on a six-sided trunk, all of them one draw; a tree moved in the world editor stays whole
  if(PARK.ring&&PARK.ring.isBatchedMesh){ const R=PARK.ring, IT=R.userData.items||[], ID=R.userData.ids||[], n=IT.length, GR=[[.29,.47,.24],[.35,.53,.28],[.25,.42,.22],[.4,.58,.3]];
    const crown=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),n), trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.7,1,1,6,1,true).translate(0,.5,0),new THREE.MeshLambertMaterial({color:0x5b4636}),n);
    const M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), S3=new THREE.Vector3(), Z=new THREE.Matrix4().makeScale(0,0,0), c=new THREE.Color(), shape=[];
    IT.forEach((it,i)=>{ const h=Math.max(1,(it.top||it.y+4*TILE)-it.y), r=Math.max(.6*TILE,it.r||2*TILE), g=GR[Math.floor(hash(Math.round(it.x*3),Math.round(it.z*3),77)*4)];
      shape[i]=[M4.compose(V.set(it.x,it.y+h*.62,it.z),Q,S3.set(r*.95,h*.42,r*.95)).clone(),M4.compose(V.set(it.x,it.y-.2*TILE,it.z),Q,S3.set(Math.max(.18*TILE,(it.tr||r*.08)),h*.5,Math.max(.18*TILE,(it.tr||r*.08)))).clone()];
      crown.setColorAt(i,c.setRGB(g[0],g[1],g[2],THREE.SRGBColorSpace)); crown.setMatrixAt(i,Z); trunk.setMatrixAt(i,Z); });
    for(const m of [crown,trunk]){ m.userData.noSmallCull=1; m.castShadow=true; m.receiveShadow=true; m.frustumCulled=false; (R.parent||scene).add(m); } PARK.ringFar=crown;
    const NEAR=30*TILE, near=new Uint8Array(n).fill(2); let lx=1e9, lz=1e9;
    PARK.ringLod=()=>{ if(Math.hypot(pos.x-lx,pos.z-lz)<TILE)return; lx=pos.x; lz=pos.z; const ed=R.userData.edited, gone=R.userData.gone; let ch=false;
      for(let i=0;i<n;i++){ const id=ID[i]; if(id==null||id<0)continue; const it=IT[i], nr=(ed&&ed.has(id))||Math.hypot(it.x-pos.x,it.z-pos.z)-(it.r||0)<NEAR?1:0; if(nr===near[i])continue; near[i]=nr; ch=true;
        if(!(gone&&gone.has(id)))R.setVisibleAt(id,!!nr); crown.setMatrixAt(i,nr||(gone&&gone.has(id))?Z:shape[i][0]); trunk.setMatrixAt(i,nr||(gone&&gone.has(id))?Z:shape[i][1]); }
      if(ch){ crown.instanceMatrix.needsUpdate=trunk.instanceMatrix.needsUpdate=true; } };
    SYS.every(()=>PARK.ringLod(),300,'061-park the ring near or far'); }
  { let c0={}, L=[]; PARK.treeItems=()=>{ if(c0!==PARK.trees){ c0=PARK.trees; L=[PARK.trees,PARK.ring,PARK.cards].filter(Boolean).flatMap(m=>m.userData.items||[]); } return L; }; }
  PARK.oaks=NOTREES?[]:TREES.slice(NI).map(([k,x,y,m])=>[X(x),Z(y),m]);
  // seen from outside the park, and the rows past its north wall: the same leaf-card trees, the fewer bigger cards, still
  P.stand=NOTREES||!INO.length?null:mesh(INO,true,false,false,{far:1,lod:'far'}); P.standFar=null;   // no trees outside the park for now (owner, 7 Nov 2026)
  // far trees simple (owner, 30 Oct 2026): a park tree is drawn whole within 25 tiles of you and as its leaf-card stand-in further off, the two dithered into each other over the 4 tiles round that (4 Nov 2026, no pop); none past the haze; a tree moved in the world editor keeps every tree whole
  { const NEAR=25*TILE; let lx=1e9, lz=1e9, lr=-1, li=null, lk=1;
    const set=(me,id,on)=>{ if(id>=0&&!(me.userData.gone&&me.userData.gone.has(id)))me.setVisibleAt(id,on); };
    PARK.lod=()=>{ const A=PARK.trees, B=P.stand, R=PARK.ring, inn=!!P.in; if(!A||!A.isBatchedMesh||!B||!B.isBatchedMesh)return; B.visible=true;
      if(Math.hypot(pos.x-lx,pos.z-lz)<TILE&&CULL.R===lr&&inn===li&&(SHARED.lodK||1)===lk)return; lx=pos.x; lz=pos.z; lr=CULL.R; li=inn; lk=SHARED.lodK||1; const far=CULL.R>0?CULL.R:1e9, ed=A.userData.edited, all=!!(ed&&ed.size), BW=2*TILE, NR=NEAR*(SHARED.lodK||1), b0=all?1e9:inn?NR-BW:-1e9; PARK.lodBand.value.set(b0,all?1e9+1:inn?NR+BW:-1e9+1);
      A.userData.items.forEach((it,i)=>{ const d=Math.hypot(it.x-pos.x,it.z-pos.z)-it.r, keep=!!(ed&&ed.has(A.userData.ids[i])), past=d>far&&!keep, near=all||inn&&d<NR+BW, stand=!all&&(!inn||d>NR-BW);
        set(A,A.userData.ids[i],near&&!past); set(B,B.userData.ids[i],stand&&!past); });
      for(const M of [R,P.standFar])if(M&&M.isBatchedMesh)M.userData.items.forEach((it,i)=>set(M,M.userData.ids[i],Math.hypot(it.x-pos.x,it.z-pos.z)-it.r<=far));
      for(const G of [PARK.trunks,PARK.ringTrunks])if(G&&G.userData.cull)G.userData.cull(far,pos.x,pos.z); };
    PARK.lodReset=()=>{ lx=1e9; }; SYS.add('life',()=>PARK.lod(),'061-treelod'); }
  // the park's small things only near (owner, 8 Nov 2026: "yes drop the small props past 70 tiles"): every repeated small thing in the park (tufts, flowers, mushrooms, posts, lamps: each under 1.5 tiles) drawn only within 70 tiles of you; the trees and the big pieces always
  { const R=70*TILE, Z=new THREE.Matrix4().makeScale(0,0,0), M=new THREE.Matrix4(), V=new THREE.Vector3(), Q=new THREE.Quaternion(), SC=new THREE.Vector3(), L=[], seen=new WeakSet(); let lx=1e9, lz=1e9, scanT=0;
    const take=im=>{ if(seen.has(im))return; seen.add(im); if(im.userData.noSmallCull||im.count<20)return; const g=im.geometry; if(!g.boundingSphere)g.computeBoundingSphere(); let big=0; const n=im.count, cx=new Float32Array(n), cz=new Float32Array(n), m0=new Float32Array(n*16);
      for(let i=0;i<n;i++){ im.getMatrixAt(i,M); M.premultiply(im.matrixWorld); M.decompose(V,Q,SC); cx[i]=V.x; cz[i]=V.z; if(g.boundingSphere.radius*Math.max(SC.x,SC.y,SC.z)>1.5*TILE)big++; im.getMatrixAt(i,M); M.toArray(m0,i*16); }
      if(big>n*.1)return; L.push({im,n,cx,cz,m0,vis:new Uint8Array(n).fill(1),ver:im.instanceMatrix.version}); };
    PARK.smallCull=()=>{ if((scanT-=1)<=0){ scanT=15; for(const G of new Set([MAPG.parkwall,MAPG.park,...scene.children.filter(c=>/^park(wall)?$/.test(c.name))]))if(G)G.traverse(o=>{ if(o.isInstancedMesh)take(o); }); }
      if(Math.hypot(pos.x-lx,pos.z-lz)<2*TILE)return; lx=pos.x; lz=pos.z;
      for(const e of L){ const im=e.im; if(im.instanceMatrix.version!==e.ver){ for(let i=0;i<e.n&&i<im.count;i++)if(e.vis[i]){ im.getMatrixAt(i,M); M.toArray(e.m0,i*16); } }   // (someone else moved them: their places kept)
        let ch=false; for(let i=0;i<e.n&&i<im.count;i++){ const on=Math.hypot(e.cx[i]-pos.x,e.cz[i]-pos.z)<R?1:0; if(on===e.vis[i])continue; e.vis[i]=on; ch=true; im.setMatrixAt(i,on?M.fromArray(e.m0,i*16):Z); }
        if(ch)im.instanceMatrix.needsUpdate=true; e.ver=im.instanceMatrix.version; } };
    SYS.every(()=>PARK.smallCull(),300,'061-park the small things only near');
    window.SMALLCULLDBG=()=>({meshes:L.length,all:L.reduce((a,e)=>a+e.n,0),shown:L.reduce((a,e)=>a+e.vis.reduce((x,v)=>x+v,0),0)}); }
  window.PARKDBG=()=>({oaks:PARK.oaks,trees:TREES,back:TREES.back,TL,progs:renderer.info.programs.length});
  PARK.later(()=>{ '@park'; PARK.rocks=mesh([['BigRock3',87.5,-37,2.6,1.8],['BigRock5',126,-41,2.4,.2],['Rock_12',55.5,-41,1,1],['Rock1',111,-41,.6,2],['BigRock1',66,-35,2,1.1]].map(([k,x,y,...r])=>[k,RX(x),RY(y),...r]),false);
  { const UG=[['bush1',1.1],['bush2',1.2],['bush3',1.3],['bush4',1.5],['bush5',1.1],['flower1',.5],['flower2',.7],['flower3',.3],['flower4',.7],['flower5',.35],['flower6',.8],['grass1',.5],['grass2',.6],['grass1',.45],['grass2',.55],['mushroom1',.3],['mushroom2',.35],['mushroom3',.3],['mushroom4',.25],['stone2',.5],['stone3',.2],['stones1',.25]];
    const list=[]; for(let i=0;i<90;i++){ const x=P.x0+2+hash(i,3,91)*(P.x1-P.x0-4), y=P.y1-NORTHX-1-Math.pow(hash(i,7,93),1.6)*(P.y1-NORTHX-P.y0-3); if(path(x,y)||path(x+1,y)||path(x-1,y)||path(x,y+1)||path(x,y-1)||BK.wet(x,y,1)||hash(i,11,95)<.3||FOUNT.away(x,y)<0)continue; if(x>67&&x<77&&y>-44+NORTHY&&y<-24+NORTHY)continue; if(Math.hypot(x-P.campAt().x,y-P.campAt().y)<4)continue; if(GCAVE.keep(P).some(b=>x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]))continue; if(inCL(x,y,1))continue;
      const [k,m]=UG[Math.floor(hash(i,13,97)*UG.length)]; if(/^(bush|flower)/.test(k))continue; list.push([k,x,y,m*(.8+.4*hash(i,17,99)),hash(i,19,101)*6.28]); }
    list.push(...[['log1',65,-41,.5,.4],['log2',86,-40.5,.6,1.2],['log3',104,-39,.6,2.6],['fence1',57,-41,.8,0],['fence1',126,-41,.8,1.57],['pmushroom1',62.5,-36.5,.6,0],['pmushroom2',63.5,-36.2,.5,1],['pmushroom3',61.8,-35.5,.55,2]].map(([k,x,y,...r])=>[k,RX(x),RY(y),...r]));
    const isPlant=k=>/^(bush|flower|grass)/.test(k);
    PARK.under=mesh(list.filter(e=>isPlant(e[0])),false,false,2); PARK.underStill=mesh(list.filter(e=>!isPlant(e[0])),false,false,false);
    const CF=P.campAt(), wa=(dx,dy)=>Math.atan2(Z(dy)-Z(0),X(dx)-X(0)), cpt=(a,b)=>[CF.x+CF.nx*a-CF.ny*b,CF.y+CF.ny*a+CF.nx*b], LOG=cpt(1.75,-.2), WP=cpt(.25,1.7);
    PARK.camp=mesh([['campfire',CF.x,CF.y,.13,0],['woodpile',WP[0],WP[1],.5,.6+wa(WP[0]-CF.x,WP[1]-CF.y)-wa(1.5,-1.1)]],false,true); PARK.fire={x:X(CF.x),z:Z(CF.y),y:.3};
    { const L=new THREE.PointLight(new THREE.Color(1,.6,.25),26,9*TILE,1.6); L.position.set(X(CF.x),.5*TILE,Z(CF.y)); L.userData.fire=1; scene.add(L); PARK.fireL=L;
      PARK.flame=FLAME.add({kind:'bed',name:'campfire',x:X(CF.x),y:.12*TILE,z:Z(CF.y),w:.78*TILE,h:.95*TILE,embers:4,smoke:2.2,sk:1.3,light:L,seed:5}); }
    PARK.more=mesh([['pillar1',90,-41.5,3.2,.3],['pillar2',102,-41.5,2.6,1.2],
      ].map(([k,x,y,...r])=>[k,RX(x),RY(y),...r]).concat([['sitlog',LOG[0],LOG[1],.5,.4+wa(LOG[0]-CF.x,LOG[1]-CF.y)-wa(-1.5,-.9)]]),false,false); PARK.sitlog=[X(LOG[0]),Z(LOG[1])];
    // the lawn keeps off what lies on the ground (rocks, logs, stones, the campfire and its woodpile, the pillars)
    if(WEEDS.keepOff)WEEDS.keepOff([PARK.rocks,PARK.underStill,PARK.camp,PARK.more].filter(Boolean).flatMap(m=>m.userData.items||[]).map(it=>[it.x,it.z,it.k==='campfire'?1.1*TILE:Math.max(.5*TILE,it.r*1.15)]));
    for(const [x,y,m] of [[RX(90),RY(-41.5),3.2],[RX(102),RY(-41.5),2.6]]){ const r=.35*m/.84*.2; SOL.up.push([X(x)-r,Z(y)-r,X(x)+r,Z(y)+r]); FIX.up.push([X(x)-r,Z(y)-r,0,X(x)+r,Z(y)+r,m/.84*TILE]); } }
  });
  // the paths' kerb: a row of straight stone bricks along both edges of every path (following its bends) and round the plaza, where the cobbles meet the grass
  PARK.later(()=>{ '@park'; const L=[], step=.5, BW=.46, ok=(x,y)=>Math.abs(pd(x,y))<.18&&!BK.wet(x,y,.4)&&FOUNT.lake(x,y)>.6&&x>P.x0+1&&x<P.x1-1&&y>P.y0+1&&y<P.y1-1;
    const lay=(x,y,ux,uy)=>{ if(!ok(x,y))return; if(L.some(b=>Math.abs(b[0]-x)<.3&&Math.abs(b[1]-y)<.3))return; L.push([x,y,Math.atan2(uy,ux)]); };
    for(const [ax,ay,bx,by] of SEG){ const dx=bx-ax, dy=by-ay, Ln=Math.hypot(dx,dy), ux=dx/Ln, uy=dy/Ln, k=2*Math.PI*Math.round(Ln/70)/Ln;
      for(const sd of [-1,1]){ let px=null, py=0, run=step; for(let t=0;t<=Ln;t+=.05){ const n=WA*Math.sin(k*t)+3.6*sd, x=ax+ux*t-uy*n, y=ay+uy*t+ux*n; if(px!==null)run+=Math.hypot(x-px,y-py); px=x; py=y; if(run<step)continue; run=0; const d=WA*k*Math.cos(k*t); lay(x,y,ux-uy*d,uy+ux*d); } } }
    { const [cx,cy,r]=P.round, n=Math.ceil(2*Math.PI*r/step); for(let i=0;i<n;i++){ const a=i/n*2*Math.PI; lay(cx+Math.cos(a)*r,cy+Math.sin(a)*r,-Math.sin(a),Math.cos(a)); } }
    if(!L.length)return; const g=new THREE.BoxGeometry(1,1,1), m=new THREE.MeshLambertMaterial(), im=new THREE.InstancedMesh(g,m,L.length), M=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), S=new THREE.Vector3(), c=new THREE.Color(), up=new THREE.Vector3(0,1,0);
    L.forEach(([x,y,a],i)=>{ const h=hash(Math.round(x*9),Math.round(y*9),71), hh=(.09+.03*h)*TILE; Q.setFromAxisAngle(up,-a+(h-.5)*.06); S.set(BW*TILE,hh,(.2+.03*hash(i,3,73))*TILE); V.set(X(x),P.hill(x,y)+hh/2-.02*TILE,Z(y)); im.setMatrixAt(i,M.compose(V,Q,S));
      const k=.82+.3*hash(i,5,79); im.setColorAt(i,c.setRGB(.56*k,.54*k,.5*k,THREE.SRGBColorSpace)); });
    im.castShadow=true; im.receiveShadow=true; im.computeBoundingSphere(); scene.add(im); PARK.kerb=im;
    WED.meshes.push({place:'park',me:im,items:L.map((_,i)=>{ im.getMatrixAt(i,M); const e=M.elements; return {k:'kerb brick',x:e[12],y:e[13],z:e[14]}; })}); });
  // the oaks' trunks and the flowers at their feet in the world editor: a trunk shares its crown's key, so the two move and go together
  PARK.later(()=>{ '@park'; const M=new THREE.Matrix4(), cr=new Map(), at=(x,z)=>Math.round(x*10)+','+Math.round(z*10); for(const t of [PARK.trees,PARK.ring])for(const it of (t&&t.userData.items)||[])cr.set(at(it.x,it.z),it);
    for(const g of [PARK.trunks,PARK.ringTrunks]){ if(!g)continue; const fl=g.flowers?g.children.slice(-2):[];
      for(const me of g.children){ if(!me.isInstancedMesh)continue; const items=[]; for(let i=0;i<me.count;i++){ (fl.length&&fl.includes(me)?fl[0]:me).getMatrixAt(i,M); const e=M.elements, c=fl.includes(me)?null:cr.get(at(e[12],e[14]));
          items.push(c?{k:c.k,x:c.x,y:c.y,z:c.z}:{k:fl.includes(me)?'flower':'tree trunk',x:e[12],y:e[13],z:e[14]}); } WED.meshes.push({place:'park',me,items}); } } });
  // the running track (owner, 2 Nov 2026: "you should be able to jog around it"): a ribbon of worn cinder path along the shore, planks where it crosses the brook's head
  PARK.later(()=>{ '@park'; const S=FOUNT.S, [OFF,HW]=FOUNT.TRACK, tex=(fn)=>{ const cv=document.createElement('canvas'); cv.width=cv.height=48; const g=cv.getContext('2d'), id=g.createImageData(48,48); for(let y=0;y<48;y++)for(let x=0;x<48;x++){ const c=fn(x,y), k=(y*48+x)*4; id.data[k]=c[0]; id.data[k+1]=c[1]; id.data[k+2]=c[2]; id.data[k+3]=255; } g.putImageData(id,0,0);
      const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; };
    const cinder=tex((x,y)=>{ const h=hash(x,y,811), e=Math.min(y,47-y); let v=96+34*h; if(e<2)v=e<1?62:118; else if(h>.93)v=70; else if(h<.05)v=128; return [v*1.02,v*.97,v*.9]; });
    const plank=tex((x,y)=>{ const ro=Math.floor(x/12), j=x%12===0||(y+ro*7)%24===0, t=hash(ro,Math.floor((y+ro*7)/24),813), v=j?66:(116+38*t)*(x%12===1?1.08:x%12===11?.88:1); return [v,v*.9,v*.74]; });
    const G=[[],[]], I=[[],[]], U=[[],[]], LIFT=.014*TILE, n=[0,0]; let acc=0, prev=null, pw=-1;
    const pair=(w,sx,sy,nn,join)=>{ for(const f of [-1,1]){ const x=sx+nn[0]*(OFF+f*HW), y=sy+nn[1]*(OFF+f*HW); G[w].push(X(x),P.hill(x,y)+LIFT,Z(y)); U[w].push(acc/1.4,(f+1)/2); } const b=n[w]*2; if(join)I[w].push(b-2,b,b-1,b-1,b,b+1); n[w]++; };
    for(let i=0;i<S.shore.length;i+=2){ const [sx,sy]=S.shore[i]; if(sx>S.wx1+2.5||sy>S.wy1+2.5)continue; const nn=S.nrm(sx,sy); if(prev)acc+=Math.hypot(sx-prev[0],sy-prev[1]); prev=[sx,sy];
      const w=BK.wet(sx+nn[0]*OFF,sy+nn[1]*OFF,2.2)?1:0; if(pw>=0&&pw!==w)pair(pw,sx,sy,nn,true); pair(w,sx,sy,nn,pw===w); pw=w; }
    for(const w of [0,1]){ if(!I[w].length)continue; const gm=new THREE.BufferGeometry(); gm.setAttribute('position',new THREE.Float32BufferAttribute(G[w],3)); gm.setAttribute('uv',new THREE.Float32BufferAttribute(U[w],2)); gm.setIndex(I[w]); gm.computeVertexNormals();
      const me=new THREE.Mesh(gm,new THREE.MeshLambertMaterial({map:w?plank:cinder,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})); me.receiveShadow=true; (MAPG.park||scene).add(me); PARK[w?'trackDeck':'track']=me; } });
  PARK.later(()=>{ '@park'; const LP=[]; { const S=FOUNT.S, [OFF,HW]=FOUNT.TRACK; for(let i=28;i<S.shore.length;i+=56){ const [x,y]=S.shore[i], n=S.nrm(x,y), k=OFF+HW+1.2; LP.push([x+n[0]*k,y+n[1]*k]); } } { const [cx,cy]=P.round; for(let y=P.y0+4;y<P.y1-2;y+=13)if(Math.abs(y-cy)>9){ let v=y; while(BK.wet(P.armX(v)+(LP.length%2?4.2:-4.2),v,.8))v+=1.5; LP.push([P.armX(v)+(LP.length%2?4.2:-4.2),v]); } for(let x=P.x0+6;x<P.x1-4;x+=16)if(Math.abs(x-cx)>9){ let u=x; while(BK.wet(u,P.armY(u)+(LP.length%2?4.2:-4.2),.8))u+=1.5; LP.push([u,P.armY(u)+(LP.length%2?4.2:-4.2)]); }
    for(const [ax,ay,bx,by] of SEG.slice(2)){ const L=Math.hypot(bx-ax,by-ay), ux=(bx-ax)/L, uy=(by-ay)/L; for(let s=9;s<L-4;s+=16){ const f=LP.length%2?4.2:-4.2, x=ax+ux*s-uy*f, y=ay+uy*s+ux*f; if(x>P.x0+2&&x<P.x1-2&&y>P.y0+2&&y<P.y1-2&&!BK.wet(x,y,.8)&&FOUNT.lake(x,y)>1&&Math.hypot(x-cx,y-cy)>9)LP.push([x,y]); } }
    LP.push(...FOUNT.S.lamps); { const r=P.round[2]+1.4, n=Math.max(4,Math.round(2*Math.PI*r/12)); for(let i=0;i<n;i++){ const t=(i+.5)/n*2*Math.PI; LP.push([cx+Math.cos(t)*r,cy+Math.sin(t)*r]); } }
    // each lamp just off its path's edge, never on a path, in water or against a trunk, and none crowding another
    const ok=[], snap=(x,y)=>{ for(let k=0;k<14;k++){ const d=pd(x,y); if(d>=.5&&d<2.5)break; const e=.05, gx=pd(x+e,y)-pd(x-e,y), gy=pd(x,y+e)-pd(x,y-e), g=Math.hypot(gx,gy)||1, s=d<.5?.4:-.4; x+=gx/g*s; y+=gy/g*s; } return [x,y]; };
    for(const q of LP){ const [x,y]=snap(q[0],q[1]), d=pd(x,y); if(d<.5||d>2.6||BK.wet(x,y,.8)||FOUNT.lake(x,y)<1||inCL(x,y,1)||x<P.x0+2||x>P.x1-2||y<P.y0+2||y>P.y1-2)continue;
      if(TREES.some(t=>Math.hypot(t[1]-x,t[2]-y)<1.6)||ok.some(o=>Math.hypot(o[0]-x,o[1]-y)<9))continue; ok.push([x,y]); }
    // a pair at the drawbridge's foot, either side of the way up to the gate
    for(const sd of [-1,1]){ const [x,y]=snap(CASTLE.gate-PO.x+sd*2.4,CL[1]-1.8); if(inCL(x,y,.2)||pd(x,y)<.5)continue; for(let i=ok.length-1;i>=0;i--)if(Math.hypot(ok[i][0]-x,ok[i][1]-y)<6)ok.splice(i,1); ok.push(Object.assign([x,y],{gate:1})); }
    // the park's one kind of lamp post, a third fewer (owner, 9 Nov 2026: "more sparse by 33%"): the most crowded one goes, until two in three are left
    { const nn=o=>ok.reduce((m,q)=>q===o?m:Math.min(m,Math.hypot(q[0]-o[0],q[1]-o[1])),1e9); for(let want=Math.round(ok.length*2/3);ok.length>want;){ let bi=0, bd=1e9; ok.forEach((o,i)=>{ const d=nn(o); if(d<bd&&!o.gate){ bd=d; bi=i; } }); ok.splice(bi,1); } }
    LP.length=0; LP.push(...ok); }
  // the park lamp (owner, 28 Oct 2026): a dark metal post and a metal hood; the bulb hides under the hood, so only its light on the ground shows
  const MET=(c0,c1)=>(i,j)=>{ const t=(i*7+j*3)%11<2?1.12:1; return [c0*t|0,c1*t|0,(c1+6)*t|0]; };
  for(const [x,y] of LP){ const h0=172; const o=BATCH.tag=OBJ('park','park lamp'); block(x-.11,y-.11,x+.11,y+.11,0,10,35,()=>[44,46,50],0,10,MET(40,42)); block(x-.055,y-.055,x+.055,y+.055,10,h0,31,()=>[40,42,46],0,h0-10,(i,j)=>[34+(i%5===0?14:0),36+(i%5===0?14:0),42+(i%5===0?14:0)]);
    for(const [w,z0,z1,c] of [[.07,h0-4,h0,52],[.3,h0,h0+2,62],[.25,h0+2,h0+4,74],[.17,h0+4,h0+6,86],[.07,h0+6,h0+9,70]])block(x-w,y-w,x+w,y+w,z0,z1,35,()=>[c+30,c+34,c+40],0,z1-z0,MET(c,c+4));
    { const w=.2, yb=Y(h0-.2), tx=SHARED.BOD.faceTex(6,6,(i,j)=>i<1||i>4||j<1||j>4?[90,88,84]:[255,236,190,1]); SHARED.BOD.bq([X(x-w),yb,Z(y-w)],[X(x+w),yb,Z(y-w)],[X(x+w),yb,Z(y+w)],[X(x-w),yb,Z(y+w)],tx,'G'); SHARED.BOD.bq([X(x-w),yb,Z(y+w)],[X(x+w),yb,Z(y+w)],[X(x+w),yb,Z(y-w)],[X(x-w),yb,Z(y-w)],tx,'G'); }
    const L=new THREE.PointLight(new THREE.Color(1,.86,.62),70,12*TILE,1.6); L.position.set(X(x),Y(h0-6),Z(y)); L.userData.i0=L.intensity; L.userData.near=.3*TILE; L.intensity=0; (PARK.hoods||(PARK.hoods=[])).push(L); scene.add(L); lamps.push(L);   // lit by night only, with the path lamps (lampLit)
    o.sol=[X(x-.1),Z(y-.1),X(x+.1),Z(y+.1)]; o.fix=[X(x-.1),Z(y-.1),0,X(x+.1),Z(y+.1),Y(h0)]; o.follow=[L]; SOL.up.push(o.sol); FIX.up.push(o.fix); } BATCH.tag=null; if(WEEDS.addFeet)WEEDS.addFeet(LP.map(([x,y])=>[X(x),Z(y),.15*TILE,.6*TILE])); });
  const sol=(x0,y0,x1,y1,h)=>{ SOL.up.push([X(x0),Z(y0),X(x1),Z(y1)]); FIX.up.push([X(x0),Z(y0),0,X(x1),Z(y1),Y(h)]); };
  for(const [x0,y0,x1,y1] of RUNS)sol(x0,y0,x1,y1,WH); for(const [,,x0,y0,x1,y1] of PIERS)sol(x0-.14,y0-.14,x1+.14,y1+.14,PH+18);
  const BM=(k,map,emap)=>new THREE.MeshLambertMaterial({map,emissiveMap:emap||null,emissive:emap?new THREE.Color(1,1,1):new THREE.Color(0,0,0),alphaTest:.5,side:THREE.DoubleSide});
  BATCH.cast=true; BATCH.build(BM); BATCH.cast=false;
  PARK.later(()=>FOUNT.paint({flat,X,Z,Y,hash,grain,speck}));
  PARK.later(()=>{ BATCH.cast=true; BATCH.build(BM); BATCH.cast=false; });
  MODS.park={BOUND:{x0:X(P.x0+.3),x1:X(P.x1-.3),z0:Z(P.y0),z1:Z(P.y1-.3)},inside:()=>false}; });
PARK.later(()=>GCAVE.build&&GCAVE.build());
await grab('park',async()=>{});
{ const G=MAPG.park, P=PARK, brk=()=>SYS.yield();
  G.visible=false; let busy=false, lx=null, lz=null;
  P.G=G; P.run=f=>{ const n0=scene.children.length; try{ f(); }catch(e){ console.warn('PARK: a part not built',e); } for(const o of scene.children.slice(n0))G.add(o);
    const L=[]; G.traverse(o=>{ if(o.isPointLight&&!o.userData.pool)L.push(o); }); for(const l of L){ l.userData.grp=G; l.castShadow=false; l.removeFromParent(); if(!LITE.recs.includes(l))LITE.recs.push(l); } };
  P.at=(x,z)=>[x/TILE+SHARED.BOD.OX-P.ox,z/TILE+SHARED.BOD.OY-P.oy];
  P.within=(x,z,m=0)=>{ const [px,py]=P.at(x,z), b=CASTLE.b, c=[b[0]-P.ox,b[2]-P.oy,b[1]-P.ox,b[3]-P.oy]; return px>P.x0+m&&px<P.x1-m&&py>P.y0+m&&py<P.y1-m||px>c[0]+m&&px<c[2]-m&&py>c[1]+m&&py<c[3]-m; };
  P.rect=()=>{ const a=SHARED.BOD.XS(P.x0+P.ox-2), b=SHARED.BOD.XS(P.x1+P.ox+2), c=SHARED.BOD.ZS(P.y0+P.oy-2), d=SHARED.BOD.ZS(P.y1+P.oy+2); return [Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]; };
  P.box=()=>{ const r=P.rect(), b=CASTLE.b, B=SHARED.BOD, xs=[B.XS(b[0]),B.XS(b[1])], zs=[B.ZS(b[2]),B.ZS(b[3])]; return [Math.min(r[0],...xs),Math.min(r[1],...zs),Math.max(r[2],...xs),Math.max(r[3],...zs)]; };   // the park and the castle, in the world
  P.steps=[]; P.load=async()=>{ FADE.note('DOWNLOADING THE PARK'); await LOAD('park'); const t0=performance.now(), N0=P.Q.length; while(P.Q.length){ FADE.note('BUILDING THE PARK',N0-P.Q.length,N0); const t=performance.now(); P.run(P.Q.shift()); P.steps.push(Math.round(performance.now()-t)); await brk(); } P.ready=true; FADE.note(null); scene.updateMatrixWorld();
    for(const f of [()=>ROOMS.reset(),()=>CLIP.run(),()=>PERFX.chunk(),()=>CULL.scan()])try{ f(); }catch(e){ console.warn('PARK',e); } P.ms=Math.round(performance.now()-t0); };
  P.show=on=>{ '@later'; P.in=on; VIS.hide(G,'park',true); VIS.hide(G,'park',!(on&&SHARED.LVL==='up')); if(P.stand)P.stand.visible=!on||!!(PARK.trees&&PARK.trees.isBatchedMesh&&P.stand.isBatchedMesh); if(PARK.lodReset)PARK.lodReset(); if(MODS.landHoles)MODS.landHoles(on); if(WEEDS&&WEEDS.lawnDrop)WEEDS.lawnDrop(P.rect()); for(const f of P.onShow)try{ f(on); }catch(e){ console.warn('PARK',e); } };
  const go=async(on,jump)=>{ busy=true; await FADE.run(on?'ENTERING CENTRAL PARK':'LEAVING CENTRAL PARK',async()=>{ P.hold=true; try{ if(on&&!P.ready)await P.load(); } finally{ P.hold=false; } P.show(on); },{cut:jump,hold:140}); busy=false; };
  { const load0=P.load; let once=null; P.load=()=>once||(once=load0()); }
  P.due=()=>!P.ready&&SHARED.floor==='up'&&P.within(pos.x,pos.z,-20); FADE.arrive.push(async()=>{ if(P.due()&&!P.hold){ P.hold=true; try{ await P.load(); } finally{ P.hold=false; } } });
  let bg=false; const NEAR=14;   // the park is drawn (and loaded quietly first) from this many tiles outside its wall, so its gates show the real inside
  P.door=(py,p)=>{ if(busy||!SYS.started||SHARED.LVL!=='up'||SHARED.floor!=='up'||LEVELS.way||UI.freeCam)return; const jump=lx!=null&&Math.hypot(p.x-lx,p.z-lz)>2*TILE; lx=p.x; lz=p.z;
    if(!P.ready&&!bg&&P.within(p.x,p.z,-NEAR-6)){ bg=true; P.load().finally(()=>{ bg=false; }); }
    const w=P.within(p.x,p.z,P.in?-NEAR-.35:-NEAR+.35); if(w===P.in)return; if(w&&!P.ready&&!bg||jump)go(w,jump); else if(!w||P.ready)P.show(w); };
  window.PARKPLACE=()=>({in:P.in,ready:P.ready,busy,ms:P.ms,steps:P.steps,left:P.Q.length,kids:G.children.length}); }
