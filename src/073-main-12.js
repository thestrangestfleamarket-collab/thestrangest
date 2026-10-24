// THE BODY PHYSICS: the ragdoll (RAG, ragStep) and the player's physics step (phyStep), with its small vector maths.
import {SHARED, THREE} from './003-shx.js';
import {ONLINE, PH, pos, RAG, st, vwV, wvV} from './003b-systems.js';
import {PPU} from './004-main.js';
import {cutWalls, FIX} from './006-map-pre.js';
import {AX, AY, PICH, PW, uimg, VS} from './071-main-11.js';
import {OUTL} from './072-walker3d.js';

OUTL.hidden=()=>cutWalls.filter(w=>w.pl.constant<1e5).map(w=>w.me);

const P={x:0,y:0}, PERF=null, TL=33.9/PPU; Object.assign(PH,{st,hd:0});
const PHG=11.7, PHH=1/120;
const v3a=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], v3s=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]], v3k=(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
  v3d=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2], v3x=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const qMat=([w,x,y,z])=>[1-2*(y*y+z*z),2*(x*y-w*z),2*(x*z+w*y),2*(x*y+w*z),1-2*(x*x+z*z),2*(y*z-w*x),2*(x*z-w*y),2*(y*z+w*x),1-2*(x*x+y*y)];
const mV=(m,v)=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]],
  mTV=(m,v)=>[m[0]*v[0]+m[3]*v[1]+m[6]*v[2],m[1]*v[0]+m[4]*v[1]+m[7]*v[2],m[2]*v[0]+m[5]*v[1]+m[8]*v[2]];
const qAxis=(ax,a)=>{ const s=Math.sin(a/2), n=Math.hypot(...ax)||1; return [Math.cos(a/2),ax[0]/n*s,ax[1]/n*s,ax[2]/n*s]; },
  qMul=(a,b)=>[a[0]*b[0]-a[1]*b[1]-a[2]*b[2]-a[3]*b[3],a[0]*b[1]+a[1]*b[0]+a[2]*b[3]-a[3]*b[2],a[0]*b[2]-a[1]*b[3]+a[2]*b[0]+a[3]*b[1],a[0]*b[3]+a[1]*b[2]-a[2]*b[1]+a[3]*b[0]];
function phyBody(o){ '@later'; const vol=p=>p.t==='box'?8*p.h[0]*p.h[1]*p.h[2]:p.t==='cyl'?2*Math.PI*p.r*p.r*p.hh:p.t==='ell'?4/3*Math.PI*p.r[0]*p.r[1]*p.r[2]:4/3*Math.PI*p.r**3, V=o.parts.reduce((t,p)=>t+vol(p),0);
  const cm=o.parts.reduce((a,p)=>v3a(a,v3k(p.c,vol(p)/V)),[0,0,0]), I=[0,0,0], b={mu:.5,e:.15,...o,q:(o.q||[1,0,0,0]).slice(),v:[0,0,0],w:[0,0,0],awake:false,rest:0,iM:1/o.m};
  for(const p of b.parts){ p.c=v3s(p.c,cm); const m=o.m*vol(p)/V, [x,y,z]=p.c, own=p.t==='box'?[(p.h[1]**2+p.h[2]**2)/3,(p.h[0]**2+p.h[2]**2)/3,(p.h[0]**2+p.h[1]**2)/3]:
      p.t==='cyl'?[(3*p.r*p.r+4*p.hh*p.hh)/12,(3*p.r*p.r+4*p.hh*p.hh)/12,p.r*p.r/2]:p.t==='ell'?[(p.r[1]**2+p.r[2]**2)/5,(p.r[0]**2+p.r[2]**2)/5,(p.r[0]**2+p.r[1]**2)/5]:[.4*p.r*p.r,.4*p.r*p.r,.4*p.r*p.r];
    I[0]+=m*(own[0]+y*y+z*z); I[1]+=m*(own[1]+x*x+z*z); I[2]+=m*(own[2]+x*x+y*y); }
  b.iI=I.map(v=>1/v); b.m3=qMat(b.q); b.x=v3a(o.at,mV(b.m3,cm)); b.ball=b.parts.length===1&&b.parts[0].t==='ball';
  b.pts=[]; for(const p of b.parts){ if(p.t==='box'){ const [a,c,d]=p.h; if(d<.01){ for(const i of [-1,1])for(const j of [-1,1])b.pts.push(v3a(p.c,[i*a,j*c,0])); continue; }
      for(const i of [-1,0,1])for(const j of [-1,0,1])for(const k of [-1,0,1])if(!!i+!!j+!!k>=2)b.pts.push(v3a(p.c,[i*a,j*c,k*d])); }
    if(p.t==='cyl')for(const k of [-1,1])for(let i=0;i<12;i++)b.pts.push(v3a(p.c,[Math.cos(i*Math.PI/6)*p.r,Math.sin(i*Math.PI/6)*p.r,k*p.hh])); }
  b.rad=Math.max(...b.parts.map(p=>Math.hypot(...p.c)+(p.t==='box'?Math.hypot(...p.h):p.t==='cyl'?Math.hypot(p.r,p.hh):p.t==='ell'?Math.max(...p.r):p.r)));
  b.home={x:b.x.slice(),q:b.q.slice()}; return b; }
const phyWake=b=>{ if(b&&b.iM&&!b.awake){ b.awake=true; b.rest=0; } };
const phyW=(b,l)=>v3a(b.x,mV(b.m3,l)), phyL=(b,w)=>mTV(b.m3,v3s(w,b.x));
const phyIw=(b,v)=>{ const l=mTV(b.m3,v); return mV(b.m3,[l[0]*b.iI[0],l[1]*b.iI[1],l[2]*b.iI[2]]); };
function phyIn(p,P,sk=0){ '@later'; const x=P[0]-p.c[0], y=P[1]-p.c[1], z=P[2]-p.c[2];
  if(p.t==='box'){ const dx=p.h[0]+sk-Math.abs(x), dy=p.h[1]+sk-Math.abs(y), dz=p.h[2]+sk-Math.abs(z); if(dx<=0||dy<=0||dz<=0)return null;
    return dx<dy&&dx<dz?[dx-sk,[x<0?-1:1,0,0]]:dy<dz?[dy-sk,[0,y<0?-1:1,0]]:[dz-sk,[0,0,z<0?-1:1]]; }
  if(p.t==='cyl'){ const r=Math.hypot(x,y), dr=p.r+sk-r, dz=p.hh+sk-Math.abs(z); if(dr<=0||dz<=0)return null; return dr<dz?[dr-sk,r>1e-6?[x/r,y/r,0]:[1,0,0]]:[dz-sk,[0,0,z<0?-1:1]]; }
  return null; }
function phyNear(p,P){ const x=P[0]-p.c[0], y=P[1]-p.c[1], z=P[2]-p.c[2], cl=(v,h)=>Math.max(-h,Math.min(h,v));
  if(p.t==='box')return v3a(p.c,[cl(x,p.h[0]),cl(y,p.h[1]),cl(z,p.h[2])]);
  const r=Math.hypot(x,y), k=r>p.r?p.r/r:1; return v3a(p.c,[x*k,y*k,cl(z,p.hh)]); }
let PHYZ0=0; const PHYOU={m:null,vel:[0,0,0],px:null,py:null,D:.2,hit:0,hitN:null,strikes:[]};
function phyYouNow(dt){ const Y=PHYOU; if(!Y.m)Y.m=new Uint8Array(PW*PICH); for(let i=0;i<PW*PICH;i++)Y.m[i]=(uimg[i]>>>24)>100?1:0;
  if(Y.px!=null&&dt>0){ const vx=(P.x-Y.px)/dt, vy=(P.y-Y.py)/dt; Y.vel=Math.hypot(vx,vy)>8||RAG.on?[0,0,0]:[vx,vy,0]; } Y.px=P.x; Y.py=P.y; }
function phyYouIn(p){ '@later'; const Y=PHYOU, Mk=Y.m; if(!Mk)return null; const a=view0.a, rx=Math.cos(a), rz=-Math.sin(a), fx=Math.sin(a), fz=Math.cos(a);
  const dx=p[0]*TL-pos.x, dz=-p[1]*TL-pos.z, dd=dx*fx+dz*fz, Dw=Y.D*TL; if(Math.abs(dd)>=Dw)return null;
  const fi=AX+(dx*rx+dz*rz)*PPU, fj=AY-((p[2]-PHYZ0)*TL-SHARED.py)*PPU/VS, i=Math.floor(fi), j=Math.floor(fj); if(i<0||j<0||i>=PW||j>=PICH||!Mk[j*PW+i])return null;
  let l=i, r=i, c=j; while(l>=0&&Mk[j*PW+l])l--; while(r<PW&&Mk[j*PW+r])r++; while(c>=0&&Mk[c*PW+i])c--;
  const L=(fi-l-1)/PPU, R=(r-fi)/PPU, U=(fj-c-1)*VS/PPU, F=Dw-Math.abs(dd), m=Math.min(L,R,U,F), s=dd<0?-1:1;
  const n=m===F?[fx*s,0,fz*s]:m===U?[0,1,0]:m===L?[-rx,0,-rz]:[rx,0,rz]; return [m/TL,[n[0],-n[2],n[1]]]; }
const phyFast=b=>v3d(b.v,b.v)+v3d(b.w,b.w)*b.rad*b.rad>=.02&&!(b.held>.25);
function phyContacts(bs,st){ const Y=PHYOU, cs=[], add=(A,B,p,n,d)=>cs.push({A,B,p,n,d,mu:B&&B!==PHYOU?Math.sqrt(A.mu*B.mu):A.mu,e:B&&B!==PHYOU?Math.max(A.e,B.e):A.e}), fast=phyFast;
  for(const b of bs)b.wp=null; const wp=b=>b.wp||(b.wp=b.pts.map(l=>phyW(b,l)));
  for(let i=0;i<bs.length;i++){ const A=bs[i];
    if(A.awake){ const W=A.ball?null:wp(A);
      if(A.ball){ const r=A.parts[0].r, c=A.x; if(c[2]<r)add(A,null,[c[0],c[1],0],[0,0,1],r-c[2]);
        for(const q of st)if(c[0]>q[0]-r&&c[0]<q[3]+r&&c[1]>q[1]-r&&c[1]<q[4]+r&&c[2]>q[2]-r&&c[2]<q[5]+r){ const n=[c[0]-Math.max(q[0],Math.min(q[3],c[0])),c[1]-Math.max(q[1],Math.min(q[4],c[1])),c[2]-Math.max(q[2],Math.min(q[5],c[2]))], d=Math.hypot(...n); if(d<r&&d>1e-6)add(A,null,v3s(c,v3k(n,r/d)),v3k(n,1/d),r-d); } }
      else for(const p of W){ if(p[2]<0)add(A,null,p,[0,0,1],-p[2]);
        for(const q of st)if(p[0]>q[0]&&p[0]<q[3]&&p[1]>q[1]&&p[1]<q[4]&&p[2]>q[2]&&p[2]<q[5]){ const e=[p[0]-q[0],q[3]-p[0],p[1]-q[1],q[4]-p[1],p[2]-q[2],q[5]-p[2]], k=e.indexOf(Math.min(...e));
          add(A,null,p,[[-1,0,0],[1,0,0],[0,-1,0],[0,1,0],[0,0,-1],[0,0,1]][k],e[k]); } } }
    for(let j=i+1;j<bs.length;j++){ const B=bs[j]; if(!A.awake&&!B.awake||A.nc&&A.nc.has(B))continue; const dx=v3s(A.x,B.x); if(v3d(dx,dx)>(A.rad+B.rad)**2)continue;
      let touch=false; const SK=.012;
      if(A.ball&&B.ball){ const d=Math.hypot(...dx), r=A.parts[0].r+B.parts[0].r; touch=d<r+SK; if(d<r&&d>1e-6){ const n=v3k(dx,1/d); add(A,B,v3s(A.x,v3k(n,A.parts[0].r)),n,r-d); } }
      else if(A.ball||B.ball){ const [Ba,O]=A.ball?[A,B]:[B,A], r=Ba.parts[0].r, c=phyL(O,Ba.x);
        for(const p of O.parts){ if(p.t==='ell')continue; const q=phyNear(p,c), d0=v3s(c,q), d=Math.hypot(...d0), inn=d<1e-6&&phyIn(p,c); if(d<r+SK)touch=true;
          if(inn)add(Ba,O,phyW(O,q),mV(O.m3,inn[1]),inn[0]+r); else if(d<r)add(Ba,O,phyW(O,q),mV(O.m3,v3k(d0,1/d)),r-d); } }
      else for(const [X,Y] of [[A,B],[B,A]]){ const R2=(Y.rad+2*SK)**2, c=Y.x; for(const pw of wp(X)){ const ex=pw[0]-c[0], ey=pw[1]-c[1], ez=pw[2]-c[2]; if(ex*ex+ey*ey+ez*ez>R2)continue;
        const pl=phyL(Y,pw); for(const p of Y.parts){ const h=phyIn(p,pl,SK); if(h){ touch=true; if(h[0]>0)add(X,Y,pw,mV(Y.m3,h[1]),h[0]); } } } }
      if(touch){ if(A.awake&&fast(A))phyWake(B); if(B.awake&&fast(B))phyWake(A); } }
    if(!A.shut&&PHYOU.m&&PHYOU.vel[0]**2+PHYOU.vel[1]**2>.01&&Math.abs(A.x[0]-P.x)<A.rad+.6&&Math.abs(A.x[1]-P.y)<A.rad+.6){ const n0=cs.length;
      const pts=A.ball?[[0,0,0],[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[.6,.6,0],[-.6,.6,0],[.6,-.6,0],[-.6,-.6,0]].map(d=>v3a(A.x,v3k(d,A.parts[0].r))):A.pts.map(l=>phyW(A,l));
      for(const p of pts){ const h=phyYouIn(p); if(h)add(A,PHYOU,p,h[1],h[0]); }
      if(cs.length>n0){ phyWake(A); A.you=.3; const hit=A.m>=10?A.m*Math.max(0,-v3d(A.v,cs[n0].n)):0; if(hit>(Y.hit||0)){ Y.hit=hit; Y.hitN=cs[n0].n; } } }
    if(!A.shut&&Y.strikes&&Y.strikes.length&&Math.abs(A.x[0]-P.x)<A.rad+1.2&&Math.abs(A.x[1]-P.y)<A.rad+1.2){ let any=false;
      for(const s of Y.strikes){ const c=phyL(A,s.p); for(const p of A.parts){ if(p.t==='ell')continue; let q; if(p.t==='ball'){ const d0=v3s(c,p.c), l=Math.hypot(...d0); if(l<1e-6)continue; q=v3a(p.c,v3k(d0,p.r/l)); } else q=phyNear(p,c);
          const d0=v3s(q,c), d=Math.hypot(...d0); if(d>=s.r)continue; let n; if(d>1e-6)n=mV(A.m3,v3k(d0,1/d)); else{ const h=phyIn(p,c); n=h?mV(A.m3,h[1]):[0,0,1]; }
          cs.push({A,B:PHYOU,p:phyW(A,q),n,d:s.r-d,mu:A.mu,e:A.e,yv:s.v}); any=true; } }
      if(any){ phyWake(A); A.you=.3; } } }
  return cs.filter(c=>c.A.awake||c.B&&c.B.awake); }
const phyVel=(b,r)=>!b?[0,0,0]:b===PHYOU?PHYOU.vel:v3a(b.v,v3x(b.w,r));
function phySolve(cs,h,js){ const dyn=b=>!!b&&b!==PHYOU&&b.awake, R=[], Q=[];
  const row=(A,B,d,ra,rb)=>{ '@later'; const da=dyn(A), db=dyn(B), r={d,A:da?A:null,B:db?B:null,you:B===PHYOU,g:B===PHYOU?A.give??1:1,j:0,lo:-1e9,hi:1e9,goal:0};
    if(da){ r.ra=ra; r.ia=phyIw(A,ra); } if(db){ r.rb=rb; r.ib=phyIw(B,rb); }
    const dd=v3d(d,d); r.k=1/((da?A.iM*dd+v3d(ra,r.ia):0)+(db?B.iM*dd+v3d(rb,r.ib):0)||1e9); return r; };
  for(const c of cs){ const A=c.A, B=c.B, ra=v3s(c.p,A.x), rb=B&&B!==PHYOU?v3s(c.p,B.x):[0,0,0];
    const vr=v3s(phyVel(A,ra),c.yv||phyVel(B,B&&B!==PHYOU?rb:null)), vn=v3d(vr,c.n); let t=v3s(vr,v3k(c.n,vn)), tl=Math.hypot(...t);
    if(tl<1e-6){ t=Math.abs(c.n[2])<.9?v3x(c.n,[0,0,1]):v3x(c.n,[1,0,0]); tl=Math.hypot(...t); }
    const t1=v3k(t,1/tl), t2=v3x(c.n,t1), n=row(A,B,c.n,v3x(ra,c.n),v3x(rb,c.n)); n.goal=Math.max(vn<-.6?-c.e*vn:0,Math.min(1.2,Math.max(0,c.d-.004)*.25/h))*n.g; n.mu=c.mu; n.lo=0;
    const f1=row(A,B,t1,v3x(ra,t1),v3x(rb,t1)), f2=row(A,B,t2,v3x(ra,t2),v3x(rb,t2)); if(c.yv){ n.yv=f1.yv=f2.yv=c.yv; } R.push(n,f1,f2); }
  if(js)for(const J of js){ const A=J.A, B=J.B; if(!dyn(A)&&!dyn(B))continue; const pa=phyW(A,J.la), pb=B?phyW(B,J.lb):J.w, ra=v3s(pa,A.x), rb=B?v3s(pb,B.x):[0,0,0], e=v3s(pa,pb);
    for(const d of [[1,0,0],[0,1,0],[0,0,1]]){ const r=row(A,B,d,v3x(ra,d),v3x(rb,d)); r.goal=-Math.max(-2,Math.min(2,v3d(e,d)*.25/h)); Q.push(r); }
    const L=J.lim; if(L){ const wa=mV(A.m3,L.a), wb=B?mV(B.m3,L.b):L.b, ang=Math.acos(Math.max(-1,Math.min(1,v3d(wa,wb)))); if(ang>L.max){ const n0=v3x(wa,wb), nl=Math.hypot(...n0);
      if(nl>1e-6){ const n=v3k(n0,1/nl), r=row(A,B,[0,0,0],n,n); r.lo=0; r.goal=Math.min(2,(ang-L.max)*.25/h); Q.push(r); } } } }
  const vel=r=>{ '@later'; const d=r.d, A=r.A, B=r.B; let v=0; if(A)v+=A.v[0]*d[0]+A.v[1]*d[1]+A.v[2]*d[2]+A.w[0]*r.ra[0]+A.w[1]*r.ra[1]+A.w[2]*r.ra[2];
      if(B)v-=B.v[0]*d[0]+B.v[1]*d[1]+B.v[2]*d[2]+B.w[0]*r.rb[0]+B.w[1]*r.rb[1]+B.w[2]*r.rb[2]; else if(r.you){ const y=r.yv||PHYOU.vel; v-=(y[0]*d[0]+y[1]*d[1]+y[2]*d[2])*r.g; } return v; },
    push=(r,j)=>{ '@later'; const d=r.d, A=r.A, B=r.B; if(A){ const m=A.iM*j; A.v[0]+=d[0]*m; A.v[1]+=d[1]*m; A.v[2]+=d[2]*m; A.w[0]+=r.ia[0]*j; A.w[1]+=r.ia[1]*j; A.w[2]+=r.ia[2]*j; }
      if(B){ const m=B.iM*j; B.v[0]-=d[0]*m; B.v[1]-=d[1]*m; B.v[2]-=d[2]*m; B.w[0]-=r.ib[0]*j; B.w[1]-=r.ib[1]*j; B.w[2]-=r.ib[2]*j; } },
    go=r=>{ const j0=r.j; r.j=Math.max(r.lo,Math.min(r.hi,j0+(r.goal-vel(r))*r.k)); if(r.j!==j0)push(r,r.j-j0); };
  for(let it=0;it<10;it++){ for(const r of Q)go(r);
    for(let i=0;i<R.length;i+=3){ const n=R[i]; go(n); const lim=n.mu*n.j; for(const r of [R[i+1],R[i+2]]){ r.lo=-lim; r.hi=lim; go(r); } } } }
function phyJointFix(js){ '@later'; for(let it=0;it<8;it++)for(const J of js){ const A=J.A, B=J.B, da=A.awake, db=!!B&&B.awake; if(!da&&!db)continue;
    const e=v3s(phyW(A,J.la),B?phyW(B,J.lb):J.w), wa=da?A.iM:0, wb=db?B.iM:0, s=wa+wb; if(!s)continue;
    if(da)A.x=v3s(A.x,v3k(e,wa/s)); if(db)B.x=v3a(B.x,v3k(e,wb/s)); } }
const phyJoin=(A,la,B,lb,w,lim)=>{ if(B){ (A.nc||(A.nc=new Set())).add(B); (B.nc||(B.nc=new Set())).add(A); } return {A,la,B,lb,w,lim}; };
function phyStep(bs,st,h,wind,js){
  if(js)for(const J of js){ const A=J.A, B=J.B; if(B){ if(A.awake&&phyFast(A))phyWake(B); if(B.awake&&phyFast(B))phyWake(A); } }
  for(const b of bs){ if(!b.awake)continue; b.v[2]-=PHG*h;
    const a=wind?wind(b.x):null, va=a?v3s(b.v,a):b.v;
    if(b.drag){ const n=mV(b.m3,[0,0,1]), vn=v3d(va,n), vt=v3s(va,v3k(n,vn)), s=Math.hypot(...va);
      b.v=v3s(b.v,v3k(v3a(v3k(n,vn*b.drag[0]),v3k(vt,b.drag[1])),Math.min(1,h)));
      b.w=v3a(v3k(b.w,1-Math.min(1,3*h)),[(Math.random()-.5)*s*60*h,(Math.random()-.5)*s*60*h,(Math.random()-.5)*s*20*h]); }
    else{ if(a)b.v=v3a(b.v,v3k(v3s(a,b.v),(b.air||.02)*h)); b.v=v3k(b.v,1-.05*h); b.w=v3k(b.w,1-(b.ball?.9:.3)*h); } }
  const cs=phyContacts(bs,st); phySolve(cs,h,js);
  for(const b of bs){ if(!b.awake)continue; const s=Math.hypot(...b.v); if(s>8)b.v=v3k(b.v,8/s); const ws=Math.hypot(...b.w); if(ws>40)b.w=v3k(b.w,40/ws);
    b.x=v3a(b.x,v3k(b.v,h)); if(ws>1e-9){ b.q=qMul(qAxis(b.w,ws*h),b.q); const n=Math.hypot(...b.q); b.q=b.q.map(v=>v/n); } b.m3=qMat(b.q); }
  if(js)phyJointFix(js);
  for(const b of bs){ if(!b.awake)continue;
    if(b.you>0)b.you-=h;
    if(!b.ref||Math.abs(b.x[0]-b.ref[0])+Math.abs(b.x[1]-b.ref[1])+Math.abs(b.x[2]-b.ref[2])>.05||Math.abs(b.q[0]*b.rq[0]+b.q[1]*b.rq[1]+b.q[2]*b.rq[2]+b.q[3]*b.rq[3])<.9995){ b.ref=b.x.slice(); b.rq=b.q.slice(); b.held=0; } else b.held+=h;
    const still=v3d(b.v,b.v)+v3d(b.w,b.w)*b.rad*b.rad<.02;
    if(!(b.you>0)&&(still&&(b.rest+=h)>.25||b.held>.4)){ b.awake=false; b.v=[0,0,0]; b.w=[0,0,0]; b.held=0; } else if(!still)b.rest=0; }
  return cs; }
const view0={a:Math.PI/4}; let STATIC=[], PHYROOMS=[];
Object.assign(RAG,{on:false,bodies:[],joints:[],t:0,hd:0,blend:null,acc:0,trip:false,hit:null,held:null,toss:null,ko:0}); window.RAGON=()=>RAG.on;
const RT=48/Math.SQRT2/(48/(33.9*Math.SQRT2)), RZ=24*RIG.PX/RT;
const ragW=(p,hd=RAG.hd)=>{ const q=RIG.yaw(p,hd), du=(q.x+q.z)/(Math.SQRT2*RT), dv=(q.z-q.x)/(Math.SQRT2*RT), [dx,dy]=wvV(du,dv); return [P.x+dx,P.y+dy,q.y/RT]; },
  ragWv=p=>{ const q=RIG.yaw(p,RAG.hd), du=(q.x+q.z)/Math.SQRT2, dv=(q.z-q.x)/Math.SQRT2, [dx,dy]=wvV(du,dv), n=Math.hypot(dx,dy,q.y)||1; return [dx/n,dy/n,q.y/n]; },
  ragR=(w,o=P,hd=RAG.hd)=>{ const [du,dv]=vwV(w[0]-o.x,w[1]-o.y); return RIG.yaw(RIG.V((du-dv)*RT/Math.SQRT2,w[2]*RT,(du+dv)*RT/Math.SQRT2),-hd); },
  ragRv=(w,hd=RAG.hd)=>{ const [du,dv]=vwV(w[0],w[1]); return RIG.yaw(RIG.V((du-dv)/Math.SQRT2,w[2],(du+dv)/Math.SQRT2),-hd); };
function ragQ(X,Y,Z){ '@later'; const m=[X[0],Y[0],Z[0],X[1],Y[1],Z[1],X[2],Y[2],Z[2]], t=m[0]+m[4]+m[8]; let q;
  if(t>0){ const s=Math.sqrt(t+1)*2; q=[s/4,(m[7]-m[5])/s,(m[2]-m[6])/s,(m[3]-m[1])/s]; }
  else if(m[0]>m[4]&&m[0]>m[8]){ const s=Math.sqrt(1+m[0]-m[4]-m[8])*2; q=[(m[7]-m[5])/s,s/4,(m[1]+m[3])/s,(m[2]+m[6])/s]; }
  else if(m[4]>m[8]){ const s=Math.sqrt(1+m[4]-m[0]-m[8])*2; q=[(m[2]-m[6])/s,(m[1]+m[3])/s,s/4,(m[5]+m[7])/s]; }
  else{ const s=Math.sqrt(1+m[8]-m[0]-m[4])*2; q=[(m[3]-m[1])/s,(m[2]+m[6])/s,(m[5]+m[7])/s,s/4]; }
  const n=Math.hypot(...q); return q.map(v=>v/n); }
const ragN=v=>{ const n=Math.hypot(...v)||1; return [v[0]/n,v[1]/n,v[2]/n]; }, ragOrth=(x,z)=>ragN(v3s(x,v3k(z,v3d(x,z))));
function ragStart(B,J0,dt,shove){ '@later'; const J=B.J, m=B.m, u=1/RT, bs=[], js=[], W=k=>ragW(J[k]), st=PH.st; RAG.hd=PH.hd; RAG.t=0; RAG.acc=0; RAG.blend=null;
  const vOf=k=>J0&&J0[k]&&dt>0?v3k(v3s(W(k),ragW(J0[k])),1/dt):[0,0,0];
  const mk=(name,parts,kg,at,X,Y,Z,joints,a,b)=>{ const o=phyBody({parts,m:kg,at:W(at),q:ragQ(X,Y,Z),mu:.8,e:.05,give:.2}); o.name=name; o.jl={}; for(const k of joints)o.jl[k]=phyL(o,W(k));
    o.v=vOf(a); if(b){ const d=v3s(W(b),W(a)), l2=v3d(d,d); if(l2>1e-6)o.w=v3k(v3x(d,v3s(vOf(b),vOf(a))),1/l2); o.v=v3k(v3a(o.v,vOf(b)),.5); } phyWake(o); bs.push(o); return o; };
  const ax=M=>[ragWv(M.x),ragWv(M.y),ragWv(M.z)], limb=(a,b,xr)=>{ const z=ragN(v3s(W(b),W(a))), x=ragOrth(xr,z); return [x,v3x(z,x),z]; };
  const [px,py,pz]=ax(m.Rb), [cx,cy,cz]=ax(m.Ru), [hx,hy,hz]=ax(m.Rh), H=RIG.HIPX*u;
  const pel=mk('pelvis',[{t:'box',c:[0,0,0],h:[H+2*u,3*u,2.5*u]}],12,'pelvis',px,py,pz,['pelvis','spine','hipL','hipR'],'pelvis','spine');
  const che=mk('chest',[{t:'box',c:[0,0,0],h:[7*u,5*u,2.8*u]}],22,'chest',cx,cy,cz,['chest','neck','clavL','clavR','shoulderL','shoulderR'],'spine','neck');
  const hed=mk('head',[{t:'ball',c:[0,u,0],r:7.5*u}],5,'head',hx,hy,hz,['headBase','head','headTop'],'headBase','headTop');
  const pin=(A,B,k,lim)=>{ const w=W(k); js.push(phyJoin(A,phyL(A,w),B,phyL(B,w),null,lim)); }, D=RIG.D;
  pin(che,pel,'spine',{a:[0,1,0],b:[0,1,0],max:25*D}); pin(hed,che,'neck',{a:[0,1,0],b:[0,1,0],max:35*D});
  for(const n of 'LR'){ const s=n==='L'?1:-1;
    const [ux,uy,uz]=limb('shoulder'+n,'elbow'+n,cx), ua=mk('upperArm'+n,[{t:'cyl',c:[0,0,RIG.UPPER*u/2],r:2*u,hh:RIG.UPPER*u/2}],2.5,'shoulder'+n,ux,uy,uz,['elbow'+n],'shoulder'+n,'elbow'+n);
    const [fx,fy,fz]=limb('elbow'+n,'wrist'+n,cx), fl=(RIG.FORE+4)*u, fa=mk('forearm'+n,[{t:'cyl',c:[0,0,fl/2],r:1.8*u,hh:fl/2}],2,'elbow'+n,fx,fy,fz,['wrist'+n],'elbow'+n,'wrist'+n);
    const [tx,ty,tz]=limb('hip'+n,'knee'+n,px), th=mk('thigh'+n,[{t:'cyl',c:[0,0,RIG.THIGH*u/2],r:3.2*u,hh:RIG.THIGH*u/2}],8,'hip'+n,tx,ty,tz,['knee'+n],'hip'+n,'knee'+n);
    const [sx,sy,sz]=limb('knee'+n,'ankle'+n,px), sl=(RIG.SHIN+RIG.ANKLE)*u, sh=mk('shin'+n,[{t:'cyl',c:[0,0,sl/2],r:2.8*u,hh:sl/2},{t:'box',c:[0,1.5*u,sl-1.3*u],h:[1.8*u,3*u,1.3*u]}],5,'knee'+n,sx,sy,sz,['ankle'+n,'heel'+n,'ball'+n,'toe'+n],'knee'+n,'ankle'+n);
    pin(ua,che,'shoulder'+n,{a:[0,0,1],b:ragN([s*.5,-.85,.15]),max:100*D}); pin(fa,ua,'elbow'+n,{a:[0,0,1],b:[0,Math.sin(60*D),Math.cos(60*D)],max:60*D});
    pin(th,pel,'hip'+n,{a:[0,0,1],b:[0,-1,0],max:80*D}); pin(sh,th,'knee'+n,{a:[0,0,1],b:[0,-Math.sin(65*D),Math.cos(65*D)],max:65*D}); }
  if(shove)for(const o of [che,hed])o.v=v3a(o.v,shove);
  RAG.bodies=bs; RAG.joints=js; RAG.on=true; RAG.trip=false; st.target=0; if(P.tx!=null)clearWalk(); }
function ragStep(dt){ '@later'; const t0=performance.now(), R=PHYROOMS.find(r=>r.on&&P.x>r.x0&&P.x<r.x1&&P.y>r.y0&&P.y<r.y1), st=R?(RAG.stR===R?RAG.st:(RAG.stR=R,RAG.st=R.st.map(b=>[b[0],b[1],b[2]*RZ,b[3],b[4],b[5]*RZ]))):[];
  const now=performance.now();
  if(RAG.toss){ const [x,y]=RAG.toss; RAG.toss=null; for(const b of RAG.bodies){ b.v=v3a(b.v,[x*5,y*5,2.6]); phyWake(b); } RAG.t=Math.min(RAG.t,.5); }
  if(RAG.held){ const H=RAG.held, o=ONLINE.others.get(H.by);
    if(!o||now-H.at>10000)RAG.held=null;
    else{ const [cx,cy]=ONLINE.at(o,now), f=ONLINE.V[o.d|0], n=Math.hypot(f[0],f[1]), T=[cx+f[0]/n*.55,cy+f[1]/n*.55,1.05], ch=RAG.bodies.find(b=>b.name==='chest');
      if(ch){ const d=v3s(T,ch.x); ch.v=v3a(v3k(ch.v,.8),v3k(d,2.2)); } for(const b of RAG.bodies)phyWake(b); RAG.t=Math.min(RAG.t,.5); } }
  RAG.acc+=Math.min(dt,.05); let n=0; while(RAG.acc>=PHH&&n<6){ RAG.acc-=PHH; n++; phyStep(RAG.bodies,st,PHH,null,RAG.joints); } if(n>=6)RAG.acc=0;
  if(RAG.t>1&&!RAG.held)for(const b of RAG.bodies){ b.v=v3k(b.v,Math.max(0,1-3*dt)); b.w=v3k(b.w,Math.max(0,1-3*dt)); }
  const pel=RAG.bodies[0], w=phyW(pel,pel.jl.pelvis); P.x=w[0]; P.y=w[1]; RAG.t+=dt;
  if(!RAG.held&&!(RAG.ko>now)&&(RAG.t>.6&&RAG.bodies.every(b=>!b.awake)||RAG.t>5))ragEnd();
  if(PERF)PERF.add('you: ragdoll',performance.now()-t0); }
const ragPose=()=>ragPoseOf(RAG.bodies,P,RAG.hd);
// any ragdoll's pose (yours, or another player's from its bodies' x, m3 and joint offsets), about origin o in physics space, facing hd
function ragPoseOf(bodies,o,hd){ '@later'; const J={}, m={foot:{},hf:{},fist:{}}, V=RIG.V, M3=(x,y,z)=>({x:ragRv(x,hd),y:ragRv(y,hd),z:ragRv(z,hd)}), ax=b=>[[b.m3[0],b.m3[3],b.m3[6]],[b.m3[1],b.m3[4],b.m3[7]],[b.m3[2],b.m3[5],b.m3[8]]];
  for(const b of bodies)for(const k in b.jl)J[k]=ragR(phyW(b,b.jl[k]),o,hd);
  const by={}; for(const b of bodies)by[b.name]=b; const [px,py,pz]=ax(by.pelvis), [cx,cy,cz]=ax(by.chest), [hx,hy,hz]=ax(by.head);
  m.Rb=M3(px,py,pz); m.Rp=m.Rb; m.Ru=M3(cx,cy,cz); m.Rc=m.Ru; m.Rh=M3(hx,hy,hz);
  for(const n of 'LR'){ const [sx,sy,sz]=ax(by['shin'+n]); m.foot[n]={x:m.Rb.x,y:ragRv(v3k(sz,-1),hd),z:ragRv(sy,hd)};
    const fa=RIG.nrm(RIG.sub(J['wrist'+n],J['elbow'+n])); m.hf[n]=RIG.hand(J,n,n==='L'?1:-1,fa,m.Ru,{fist:0}); m.fist[n]=0; }
  return {J,m,head:J.head,lift:0}; }
function ragEnd(){ '@later'; const st=PH.st, by={}; for(const b of RAG.bodies)by[b.name]=b; const pel=phyW(by.pelvis,by.pelvis.jl.pelvis), che=phyW(by.chest,by.chest.jl.chest), dx=che[0]-pel[0], dy=che[1]-pel[1];
  if(Math.hypot(dx,dy)>.05){ const [u,v]=vwV(dx,dy); RAG.hd=PH.hd=Math.atan2(u-v,u+v); }
  const fall=RIG.MOVES.fall, lie=fall.k.find(k=>k.t>fall.topple.T+.5), rz=lie.P.root.z, [u,v]=[(Math.sin(PH.hd)+Math.cos(PH.hd))/2,(Math.cos(PH.hd)-Math.sin(PH.hd))/2], [wx,wy]=wvV(u,v), nw=Math.hypot(wx,wy);
  P.x=pel[0]-wx/nw*rz/RT; P.y=pel[1]-wy/nw*rz/RT; const J0=ragPose().J;
  RAG.on=false; RAG.bodies=[]; RAG.joints=[]; RIG.act(st,'F'); if(st.move&&st.move.name==='fall')st.move.t=lie.t; RAG.blend={J0,t:performance.now()}; PH.d0=st.dist; }
function ragStrikes(B,J0,dt){ const S=[]; if(!J0||!(dt>0)||RAG.on){ PHYOU.strikes=S; return; } const hd=PH.hd;
  for(const [k,r] of [['wristL',.09],['wristR',.09],['ballL',.1],['ballR',.1]]){ const a=B.J[k], b=J0[k]; if(!a||!b)continue; const p=ragW(a,hd), v=v3k(v3s(p,ragW(b,hd)),1/dt), sp=Math.hypot(...v3s(v,PHYOU.vel)); if(sp>1.5&&sp<12)S.push({p,r,v}); }
  PHYOU.strikes=S; }
function ragBlend(B){ const b=RAG.blend; if(!b)return; const k=(performance.now()-b.t)/350; if(k>=1){ RAG.blend=null; return; } const w=k*k*(3-2*k);
  for(const n in B.J)if(b.J0[n]){ const a=b.J0[n], c=B.J[n]; B.J[n]=RIG.V(a.x+(c.x-a.x)*w,a.y+(c.y-a.y)*w,a.z+(c.z-a.z)*w); } B.head=B.J.head; }
STATIC=SHARED.fixed.map(([x0,z0,y0,x1,z1,y1])=>[x0/TL,-z1/TL,y0/TL,x1/TL,-z0/TL,y1/TL]); PHYROOMS=[{on:true,x0:-1e9,x1:1e9,y0:-1e9,y1:1e9,st:STATIC.map(b=>[b[0],b[1],b[2]/RZ,b[3],b[4],b[5]/RZ])}];
function setPhys(lv){ STATIC=FIX[lv].map(([x0,z0,y0,x1,z1,y1])=>[x0/TL,-z1/TL,y0/TL,x1/TL,-z0/TL,y1/TL]); PHYROOMS[0].st=STATIC.map(b=>[b[0],b[1],b[2]/RZ,b[3],b[4],b[5]/RZ]); }

const loose=[]; const CM=new THREE.Matrix3().set(1,0,0,0,0,1,0,-1,0), CMT=CM.clone().transpose(), m3t=new THREE.Matrix3(), m4t=new THREE.Matrix4();
function looseDraw(){ for(const b of loose){ const m=b.m3; m3t.set(m[0],m[1],m[2],m[3],m[4],m[5],m[6],m[7],m[8]).premultiply(CM).multiply(CMT);
  m4t.setFromMatrix3(m3t).setPosition(b.x[0]*TL,b.x[2]*TL,-b.x[1]*TL); b.g.matrix.copy(m4t); b.g.matrixWorldNeedsUpdate=true; } }
export {loose, looseDraw, P, PHH, PHYOU, phyStep, phyYouNow, qMat, ragBlend, ragPose, ragPoseOf, ragStart, ragStep, ragStrikes, setPhys, STATIC, TL, view0};
