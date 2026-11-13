// THE BATCH: BATCH packs painted pictures into atlases and merges them into few meshes; BATCH.queue paints far things later, near ones first; OBJ and OBJS name the objects made.
import {SHARED, THREE} from './003-shx.js';
import {BATCH, ED, LEVELS, PARK, pos, UI} from './003b-systems.js';
import {renderer, RH, RW, scene} from './004-main.js';
import {QS, SYS, TILE} from './006-map-pre.js';
window.BATCH=BATCH;
const OBJS=[]; const OBJ=(place,name)=>{ const o={id:place+':'+OBJS.length,place,name,parts:[]}; OBJS.push(o); return o; };
BATCH.all=(M,k)=>Object.keys(M||{}).filter(q=>q===k||q.startsWith(k+'~')).map(q=>M[q]);
BATCH.add=(pos,uv,cv,ecv,kind)=>{ BATCH.items.push({pos,uv,cv,ecv,kind,obj:BATCH.tag}); };
// no two faces in one place (6 Nov 2026 rule): a later flat face cuts its rectangle out of any earlier one lying in its plane and facing its way, so the two never fight for the same pixels; two facing each other (a box against a wall) both lose what they share
BATCH.TOL=.003;
BATCH.uncover=(it,REG=null)=>{ const TOL=BATCH.TOL, R=[], B=new Map();
  const rect=o=>{ const p=o.pos; let ax=-1; for(let a=0;a<3;a++){ let f=true; for(let i=3;i<18;i+=3)if(Math.abs(p[i+a]-p[a])>1e-5){ f=false; break; } if(f){ ax=a; break; } } if(ax<0)return null;
    const sa=(ax+1)%3, ta=(ax+2)%3, S=[], T=[]; for(let i=0;i<18;i+=3){ S.push(p[i+sa]); T.push(p[i+ta]); } const s0=Math.min(...S), s1=Math.max(...S), t0=Math.min(...T), t1=Math.max(...T); if(s1-s0<1e-4||t1-t0<1e-4)return null;
    for(let v=0;v<6;v++)if(Math.min(Math.abs(S[v]-s0),Math.abs(S[v]-s1))>1e-5||Math.min(Math.abs(T[v]-t0),Math.abs(T[v]-t1))>1e-5)return null;
    const ex=(i,a)=>p[i*3+a], ux=ex(1,sa)-ex(0,sa), uy=ex(1,ta)-ex(0,ta), vx=ex(2,sa)-ex(0,sa), vy=ex(2,ta)-ex(0,ta), sg=Math.sign(ux*vy-uy*vx); if(!sg)return null;
    const C={}; for(let v=0;v<6;v++)C[(S[v]-s0<(s1-s0)/2?0:1)+2*(T[v]-t0<(t1-t0)/2?0:1)]=[o.uv[v*2],o.uv[v*2+1]]; if(!C[0]||!C[1]||!C[2]||!C[3])return null;
    const aff=Math.abs(C[3][0]-(C[1][0]+C[2][0]-C[0][0]))<1e-4&&Math.abs(C[3][1]-(C[1][1]+C[2][1]-C[0][1]))<1e-4;
    return {ax,sa,ta,c:p[ax],sg,s0,s1,t0,t1,S,T,C,aff}; };
  const key=(r,d)=>r.ax+':'+(Math.round(r.c/TOL)+d), PX=new Map(), solid=(o,q,a0,a1,b0,b1)=>{ const cv=o.cv; let D=PX.get(cv); if(!D){ D=cv instanceof ImageData?cv.data:cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; PX.set(cv,D); }
    const uv=(s,t)=>{ const fs=(s-q.s0)/(q.s1-q.s0), ft=(t-q.t0)/(q.t1-q.t0), C=q.C; return [C[0][0]+fs*(C[1][0]-C[0][0])+ft*(C[2][0]-C[0][0]),C[0][1]+fs*(C[1][1]-C[0][1])+ft*(C[2][1]-C[0][1])]; }, A=uv(a0,b0), B=uv(a1,b1), W=cv.width, H=cv.height;
    const x0=Math.max(0,Math.floor(Math.min(A[0],B[0])*W)), x1=Math.min(W,Math.ceil(Math.max(A[0],B[0])*W)), y0=Math.max(0,Math.floor((1-Math.max(A[1],B[1]))*H)), y1=Math.min(H,Math.ceil((1-Math.min(A[1],B[1]))*H));
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(D[(y*W+x)*4+3]<128)return false; return true; };   // a cutter with holes where it meets (a railing, a window, a leaf) cuts nothing there
  it.forEach((o,i)=>{ const r=rect(o); R.push(r); if(r){ const k=key(r,0); (B.get(k)||B.set(k,[]).get(k)).push(i); } });
  const out=[];
  it.forEach((o,i)=>{ const r=R[i]; if(!r||!r.aff){ out.push(o); return; } let P=[[r.s0,r.s1,r.t0,r.t1]];
    if(REG)for(let d=-1;d<=1&&P.length;d++)for(const q of REG.get(key(r,d))||[]){ if(Math.abs(q.c-r.c)>TOL||q.s1<=r.s0||q.s0>=r.s1||q.t1<=r.t0||q.t0>=r.t1)continue;   // a face this queue built before keeps its place
      const N=[]; for(const [a0,a1,b0,b1] of P){ const c0=Math.max(a0,q.s0), c1=Math.min(a1,q.s1), e0=Math.max(b0,q.t0), e1=Math.min(b1,q.t1); if(c1-c0<1e-4||e1-e0<1e-4){ N.push([a0,a1,b0,b1]); continue; }
        if(c0-a0>1e-4)N.push([a0,c0,b0,b1]); if(a1-c1>1e-4)N.push([c1,a1,b0,b1]); if(e0-b0>1e-4)N.push([c0,c1,b0,e0]); if(b1-e1>1e-4)N.push([c0,c1,e1,b1]); } P=N; }
    for(let d=-1;d<=1&&P.length;d++)for(const j of B.get(key(r,d))||[]){ const q=R[j]; if(j===i||!P.length||q.sg===r.sg&&j<i)continue; if(Math.abs(q.c-r.c)>TOL||q.s1<=r.s0||q.s0>=r.s1||q.t1<=r.t0||q.t0>=r.t1||!q.aff||!solid(it[j],q,Math.max(r.s0,q.s0),Math.min(r.s1,q.s1),Math.max(r.t0,q.t0),Math.min(r.t1,q.t1)))continue;
      const N=[]; for(const [a0,a1,b0,b1] of P){ const c0=Math.max(a0,q.s0), c1=Math.min(a1,q.s1), e0=Math.max(b0,q.t0), e1=Math.min(b1,q.t1); if(c1-c0<1e-4||e1-e0<1e-4){ N.push([a0,a1,b0,b1]); continue; }
        if(c0-a0>1e-4)N.push([a0,c0,b0,b1]); if(a1-c1>1e-4)N.push([c1,a1,b0,b1]); if(e0-b0>1e-4)N.push([c0,c1,b0,e0]); if(b1-e1>1e-4)N.push([c0,c1,e1,b1]); } P=N; }
    if(P.length===1&&P[0][0]===r.s0&&P[0][1]===r.s1&&P[0][2]===r.t0&&P[0][3]===r.t1){ out.push(o); return; }
    const uv=(s,t)=>{ const fs=(s-r.s0)/(r.s1-r.s0), ft=(t-r.t0)/(r.t1-r.t0), C=r.C; return [C[0][0]+fs*(C[1][0]-C[0][0])+ft*(C[2][0]-C[0][0]),C[0][1]+fs*(C[1][1]-C[0][1])+ft*(C[2][1]-C[0][1])]; };
    for(const [a0,a1,b0,b1] of P){ const pos=o.pos.slice(), U=o.uv.slice(); for(let v=0;v<6;v++){ const s=r.S[v]-r.s0<(r.s1-r.s0)/2?a0:a1, t=r.T[v]-r.t0<(r.t1-r.t0)/2?b0:b1; pos[v*3+r.sa]=s; pos[v*3+r.ta]=t; const w=uv(s,t); U[v*2]=w[0]; U[v*2+1]=w[1]; }
      out.push({...o,pos,uv:U}); } });
  if(REG)for(const o of out){ const q=rect(o); if(q&&q.aff&&solid(o,q,q.s0,q.s1,q.t0,q.t1)){ const k=key(q,0), L=REG.get(k), e={ax:q.ax,c:q.c,s0:q.s0,s1:q.s1,t0:q.t0,t1:q.t1}; if(L)L.push(e); else REG.set(k,[e]); if(BATCH.REGADD)BATCH.REGADD.push([k,e]); } }
  return out; };
// the same rule for loose triangles (a builder's own merged soup): P its positions (three a corner, no index), A {name:[array,size]} the other corners' values; a later triangle cuts itself out of any earlier one in its plane facing its way; two facing each other (one solid resting on another) both lose what they share, which is inside; returns {P,A,at} (A the arrays alone; the same arrays and no at when nothing met)
BATCH.unfight=(P,A={},opp=true,R=null)=>{ const t0=performance.now(), r=BATCH.unfight0(P,A,opp,R); BATCH.unfight.ms=(BATCH.unfight.ms||0)+performance.now()-t0; BATCH.unfight.n=(BATCH.unfight.n||0)+P.length/9; return r; };   // its time and triangles kept for the budget
// a face's plane and the 4-unit cells its box covers: the keys it is filed under (numbers, into K; two that meet by chance are told apart by the checks after), so a face meets only the faces near it in its plane
BATCH.unfightKeys=(x,y,z,d,b,o,K)=>{ const TOL=BATCH.TOL, e=TOL, h0=Math.imul(Math.round(x*200),73856093)^Math.imul(Math.round(y*200),19349663)^Math.imul(Math.round(z*200),83492791)^Math.imul(Math.round(d/TOL),668265263);
  const i0=Math.floor((b[o]-e)/4), i1=Math.floor((b[o+3]+e)/4), j0=Math.floor((b[o+1]-e)/4), j1=Math.floor((b[o+4]+e)/4), k0=Math.floor((b[o+2]-e)/4), k1=Math.floor((b[o+5]+e)/4); let n=0; if((i1-i0+1)*(j1-j0+1)*(k1-k0+1)>K.length)return 0;   // (a face too big to file is left as it is)
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)for(let k=k0;k<=k1;k++)K[n++]=h0^Math.imul(i,2246822519)^Math.imul(j,3266489917)^Math.imul(k,374761393); return n; };
// one face's plane, depth and box from three corners at Q[o..o+8] into N, D, BX at j; false for a sliver
BATCH.unfightFace=(Q,o,N,D,BX,j)=>{ const ux=Q[o+3]-Q[o], uy=Q[o+4]-Q[o+1], uz=Q[o+5]-Q[o+2], vx=Q[o+6]-Q[o], vy=Q[o+7]-Q[o+1], vz=Q[o+8]-Q[o+2]; let x=uy*vz-uz*vy, y=uz*vx-ux*vz, z=ux*vy-uy*vx; const l=Math.hypot(x,y,z); if(l<1e-9)return false;
  x/=l; y/=l; z/=l; N[j*3]=x; N[j*3+1]=y; N[j*3+2]=z; D[j]=x*Q[o]+y*Q[o+1]+z*Q[o+2]; const b=j*6; BX[b]=Math.min(Q[o],Q[o+3],Q[o+6]); BX[b+1]=Math.min(Q[o+1],Q[o+4],Q[o+7]); BX[b+2]=Math.min(Q[o+2],Q[o+5],Q[o+8]); BX[b+3]=Math.max(Q[o],Q[o+3],Q[o+6]); BX[b+4]=Math.max(Q[o+1],Q[o+4],Q[o+7]); BX[b+5]=Math.max(Q[o+2],Q[o+5],Q[o+8]); return true; };
BATCH.unfight0=(P,A={},opp=true,R=null)=>{ const TOL=BATCH.TOL, n=P.length/9, N=new Float64Array(n*3), D=new Float64Array(n), BX=new Float64Array(n*6), ok=new Uint8Array(n), B=new Map(), drop=new Uint8Array(n), keys=Object.keys(A); let any=false;
  const K=BATCH.unfightKeys.K||(BATCH.unfightKeys.K=new Int32Array(1<<16)), file=(G,i,x,y,z,d,bx,o)=>{ const c=BATCH.unfightKeys(x,y,z,d,bx,o,K); for(let q=0;q<c;q++){ const k=K[q], L=G.get(k); if(L)L.push(i); else G.set(k,[i]); } };
  for(let i=0;i<n;i++){ if(!BATCH.unfightFace(P,i*9,N,D,BX,i))continue; ok[i]=1; file(B,i,N[i*3],N[i*3+1],N[i*3+2],D[i],BX,i*6); }
  const LO={P,N,D,BX,st:new Int32Array(n)}; if(R&&R.st.length<R.n)R.st=new Int32Array(R.n*2+64);
  const CS=[], CJ=[], near=(i,s,G,S,all,me)=>{ const st=S.st, q=D[i]*s/TOL, nb=q-Math.round(q)>0?1:-1;
    for(const dd of [0,nb]){ const c=BATCH.unfightKeys(N[i*3]*s,N[i*3+1]*s,N[i*3+2]*s,D[i]*s+dd*TOL,BX,i*6,K); for(let w=0;w<c;w++){ const L=G.get(K[w]); if(L)for(const j of L)if((all||s<0||j>i)&&st[j]!==me){ st[j]=me; CS.push(S); CJ.push(j); } } } };
  const cands=i=>{ const me=BATCH.unfightKeys.t=((BATCH.unfightKeys.t|0)+1)|0; CS.length=0; CJ.length=0; near(i,1,B,LO,false,me); if(opp)near(i,-1,B,LO,false,me); if(R&&R.n){ near(i,1,R.B,R,true,me); if(opp)near(i,-1,R.B,R,true,me); } return CS.length; };
  const area=p=>{ let s=0; for(let k=0;k<p.length;k++){ const a=p[k], b=p[(k+1)%p.length]; s+=a[0]*b[1]-b[0]*a[1]; } return s/2; };
  const clip=(p,a,b,sg,keepIn)=>{ const f=q=>sg*((b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0])), out=[]; for(let k=0;k<p.length;k++){ const P0=p[k], P1=p[(k+1)%p.length], f0=f(P0), f1=f(P1), i0=keepIn?f0>=0:f0<0, i1=keepIn?f1>=0:f1<0; if(i0)out.push(P0); if(i0!==i1){ const t=f0/(f0-f1); out.push([P0[0]+t*(P1[0]-P0[0]),P0[1]+t*(P1[1]-P0[1])]); } } return out; };
  const pieces=new Map(); let np=0;
  for(let i=0;i<n;i++){ if(!ok[i]||!cands(i))continue; const x=N[i*3], y=N[i*3+1], z=N[i*3+2], ax=Math.abs(x)>=Math.abs(y)&&Math.abs(x)>=Math.abs(z)?0:Math.abs(y)>=Math.abs(z)?1:2, s0=(ax+1)%3, s1=(ax+2)%3, b=i*6, q=v=>[P[v*3+s0],P[v*3+s1]];
    let L=null; const nc=CS.length, cs=CS.slice(), cj=CJ.slice();
    for(let w=0;w<nc;w++){ const S=cs[w], j=cj[w], SN=S.N, dn=SN[j*3]*x+SN[j*3+1]*y+SN[j*3+2]*z; if(Math.abs(dn)<.9999||Math.abs(S.D[j]-Math.sign(dn)*D[i])>TOL)continue; const c=S.BX, e=j*6; if(c[e]>BX[b+3]+TOL||c[e+3]<BX[b]-TOL||c[e+1]>BX[b+4]+TOL||c[e+4]<BX[b+1]-TOL||c[e+2]>BX[b+5]+TOL||c[e+5]<BX[b+2]-TOL)continue;
      if(!L)L=[[q(i*3),q(i*3+1),q(i*3+2)]]; const sq=v=>[S.P[v*3+s0],S.P[v*3+s1]], C=[sq(j*3),sq(j*3+1),sq(j*3+2)], sg=area(C)>0?1:-1, nl=[];
      for(const p of L){ let rest=p; const bits=[]; for(let e=0;e<3&&rest.length>2;e++){ const a=C[e], bb=C[(e+1)%3], out=clip(rest,a,bb,sg,false); if(out.length>2&&Math.abs(area(out))>1e-7)bits.push(out); rest=clip(rest,a,bb,sg,true); }
        if(rest.length<3||Math.abs(area(rest))<1e-6)nl.push(p); else nl.push(...bits); }
      L=nl; if(!L.length)break; }
    if(!L)continue; drop[i]=1; any=true; const T=[q(i*3),q(i*3+1),q(i*3+2)], den=(T[1][1]-T[2][1])*(T[0][0]-T[2][0])+(T[2][0]-T[1][0])*(T[0][1]-T[2][1]);
    const bar=pt=>{ const w0=((T[1][1]-T[2][1])*(pt[0]-T[2][0])+(T[2][0]-T[1][0])*(pt[1]-T[2][1]))/den, w1=((T[2][1]-T[0][1])*(pt[0]-T[2][0])+(T[0][0]-T[2][0])*(pt[1]-T[2][1]))/den; return [w0,w1,1-w0-w1]; };
    const ps=[]; for(const p of L)for(let k=1;k+1<p.length;k++)ps.push([bar(p[0]),bar(p[k]),bar(p[k+1])]); pieces.set(i,ps); np+=ps.length; }
  const keep=(Q,res)=>{ if(R)BATCH.unfight.reg(R,Q); return res; };
  if(!any){ const UA={}; for(const k of keys)UA[k]=A[k][0]; return keep(P,{P,A:UA,at:null}); }
  const kept=n-drop.reduce((s,v)=>s+v,0), m=kept+np, at=new Int32Array(n+1), NP=new Float32Array(m*9), NA={}; for(const k of keys)NA[k]=[new Float32Array(m*3*A[k][1]),A[k][1]];
  let t=0; const put=(i,W)=>{ for(let v=0;v<3;v++){ const w=W[v]; for(let c=0;c<3;c++)NP[(t*3+v)*3+c]=w[0]*P[i*9+c]+w[1]*P[i*9+3+c]+w[2]*P[i*9+6+c]; for(const k of keys){ const [S,sz]=A[k], [O]=NA[k]; for(let c=0;c<sz;c++)O[(t*3+v)*sz+c]=w[0]*S[(i*3)*sz+c]+w[1]*S[(i*3+1)*sz+c]+w[2]*S[(i*3+2)*sz+c]; } } t++; };
  const I3=[[1,0,0],[0,1,0],[0,0,1]]; for(let i=0;i<n;i++){ at[i]=t; if(!drop[i])put(i,I3); else for(const W of pieces.get(i))put(i,W); } at[n]=t;
  for(const k of keys)NA[k]=NA[k][0]; return keep(NP,{P:NP,A:NA,at}); };
// the same for a geometry (indexed or not): its own attributes carried over; the geometry itself back when nothing met
BATCH.unfightGeo=(g,R=null)=>{ const u=g.index?g.toNonIndexed():g, at=u.attributes, A={}; for(const k in at)if(k!=='position')A[k]=[at[k].array,at[k].itemSize]; const F=BATCH.unfight(at.position.array,A,true,R); if(!F.at){ if(u!==g)u.dispose(); return g; }
  const h=new THREE.BufferGeometry(); h.setAttribute('position',new THREE.BufferAttribute(F.P,3)); for(const k in A)h.setAttribute(k,new THREE.BufferAttribute(F.A[k],A[k][1])); if(u!==g)u.dispose(); g.dispose(); return h; };
// a register of faces already built (R: BATCH.unfight.R()), so one builder's faces also give way to another's built before (whole outsides that stay, never insides that come and go)
BATCH.unfight.R=()=>({n:0,P:new Float32Array(9*1024),N:new Float64Array(3*1024),D:new Float64Array(1024),BX:new Float64Array(6*1024),B:new Map(),st:new Int32Array(1024)});
BATCH.OUT=BATCH.unfight.R();   // the street's outsides (facades, the Hudson shops)
BATCH.unfight.reg=(R,Q)=>{ const m=Q.length/9, need=R.n+m; if(need>R.D.length){ const c=Math.max(need,R.D.length*2), g=(a,k)=>{ const b=new a.constructor(c*k); b.set(a); return b; }; R.P=g(R.P,9); R.N=g(R.N,3); R.D=g(R.D,1); R.BX=g(R.BX,6); }
  const K=BATCH.unfightKeys.K||(BATCH.unfightKeys.K=new Int32Array(1<<16));
  for(let o=0;o<Q.length;o+=9){ const j=R.n; if(!BATCH.unfightFace(Q,o,R.N,R.D,R.BX,j))continue; for(let c=0;c<9;c++)R.P[j*9+c]=Q[o+c]; R.n++;
    const c=BATCH.unfightKeys(R.N[j*3],R.N[j*3+1],R.N[j*3+2],R.D[j],R.BX,j*6,K); for(let q=0;q<c;q++){ const k=K[q], L=R.B.get(k); if(L)L.push(j); else R.B.set(k,[j]); } } };
BATCH.build=(make)=>{ const it=BATCH.items; if(!it.length)return; const AW=2048;
  for(const o of it)if(o.cv.width+2>AW)console.warn('BATCH: a picture '+o.cv.width+' wide, over the atlas ('+AW+'): split it');
  const MAXH=BATCH.MAXH||8192, KS={}; it.forEach((o,i)=>(KS[o.kind]||(KS[o.kind]=[])).push(i)); let x=0, y=0, sh=0, pg=0; const PH=[];
  const fit=(L,x,y,sh)=>{ for(const i of L){ const w=it[i].cv.width+2, h=it[i].cv.height+2; if(x+w>AW){ x=0; y+=sh; sh=0; } if(y+h>MAXH)return false; x+=w; sh=Math.max(sh,h); } return true; };
  for(const k in KS){ const L=KS[k].sort((a,b)=>it[b].cv.height-it[a].cv.height); if(y+sh>0&&!fit(L,x,y,sh)&&fit(L,0,0,0)){ PH[pg]=y+sh; pg++; x=0; y=0; sh=0; }
    for(const i of L){ const o=it[i], w=o.cv.width+2, h=o.cv.height+2; if(x+w>AW){ x=0; y+=sh; sh=0; } if(y+h>MAXH&&y>0){ PH[pg]=y+sh; pg++; x=0; y=0; sh=0; } o.ax=x; o.ay=y; o.pg=pg; x+=w; sh=Math.max(sh,h); } }
  PH[pg]=y+sh; let AHs=[]; const PGS=it.map(o=>o.pg); { const u=BATCH.uncover(it,BATCH.REG); it.length=0; for(const o of u)it.push(o); }
  for(let p=0;p<=pg;p++){ const ip=it.filter(o=>o.pg===p); if(!ip.length)continue;
  const AH=PH[p], atlas=document.createElement('canvas'); atlas.width=AW; atlas.height=AH; const AD=new ImageData(AW,AH); AHs.push(AH);
  const anyE=ip.some(o=>o.ecv), eat=anyE?document.createElement('canvas'):null, ED=anyE?new ImageData(AW,AH):null; if(eat){ eat.width=AW; eat.height=AH; for(let q=3;q<ED.data.length;q+=4)ED.data[q]=255; }
  const px=cv=>cv instanceof ImageData?cv.data:cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
  const put=(D,cv,ax,ay)=>{ const w=cv.width, h=cv.height, s=px(cv), A=D.data, ln=(r,c)=>((ay+r)*AW+ax+c)*4;
    for(let r=0;r<h;r++){ const row=s.subarray(r*w*4,(r+1)*w*4); A.set(row,ln(r+1,1)); if(r===0)A.set(row,ln(0,1)); if(r===h-1)A.set(row,ln(h+1,1));
      A.set(s.subarray(r*w*4,r*w*4+4),ln(r+1,0)); A.set(s.subarray((r+1)*w*4-4,(r+1)*w*4),ln(r+1,w+1)); } };
  for(const o of ip){ put(AD,o.cv,o.ax,o.ay); if(o.ecv)put(ED,o.ecv,o.ax,o.ay); }
  atlas.getContext('2d').putImageData(AD,0,0); if(eat)eat.getContext('2d').putImageData(ED,0,0);
  const tex=c=>{ const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const map=tex(atlas), emap=eat?tex(eat):null;
  const kinds={}; for(const o of ip)(kinds[o.kind]||(kinds[o.kind]=[])).push(o);
  // (BATCH.tile: a kind's faces cut by map tile, a mesh each, so the far ones go unseen and undrawn; opted into by a queue's tile)
  const parts={}; for(const k in kinds){ if(!(BATCH.tile>0)){ parts[k]=[k,kinds[k]]; continue; } const by={};
    for(const o of kinds[k]){ const q=o.pos, cx=(q[0]+q[3]+q[6]+q[9]+q[12]+q[15])/6, cz=(q[2]+q[5]+q[8]+q[11]+q[14]+q[17])/6, t=Math.floor(cx/BATCH.tile)+','+Math.floor(cz/BATCH.tile); (by[t]||(by[t]=[])).push(o); }
    const ts=Object.keys(by); for(const t of ts)parts[ts.length>1?k+'~t'+t:k]=[k,by[t]]; }
  for(const pk in parts){ const [k,L]=parts[pk], P=new Float32Array(L.length*18), U=new Float32Array(L.length*12);
    L.forEach((o,n)=>{ P.set(o.pos,n*18); const w=o.cv.width, h=o.cv.height; for(let q=0;q<6;q++){ const u=o.uv[q*2], v=o.uv[q*2+1]; U[n*12+q*2]=(o.ax+1+u*w)/AW; U[n*12+q*2+1]=1-(o.ay+1+(1-v)*h)/AH; } });
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setAttribute('uv',new THREE.BufferAttribute(U,2)); geo.computeVertexNormals();
    geo.setAttribute('aCol',new THREE.BufferAttribute(new Float32Array(L.length*18).fill(1),3)); geo.setAttribute('aOp',new THREE.BufferAttribute(new Float32Array(L.length*6).fill(1),1));
    const mat=make(k,map,emap); BATCH.tintable(mat); const me=new THREE.Mesh(geo,mat); PEEK.batch(me,L); me.userData.objOf=L.map(o=>o.obj); L.forEach((o,n)=>{ if(o.obj)o.obj.parts.push({me,v0:n*6,e:!!o.ecv}); }); me.receiveShadow=true; me.castShadow=!!BATCH.cast; scene.add(me); (BATCH.meshes||(BATCH.meshes={}))[p?pk+'~'+p:pk]=me; } }
  BATCH.stats={faces:it.length,pages:AHs.length,atlas:AHs.map(h=>AW+'x'+h).join(','),split:Object.keys(KS).filter(k=>new Set(KS[k].map(i=>PGS[i])).size>1)}; (BATCH.log||(BATCH.log=[])).push(BATCH.stats); BATCH.items=[]; };

BATCH.tintable=m=>{ const prev=m.onBeforeCompile; m.onBeforeCompile=(sh,r)=>{ if(prev)prev(sh,r);
    sh.vertexShader='attribute vec3 aCol; attribute float aOp; varying vec3 vCol; varying float vOp;\n'+sh.vertexShader.replace('void main() {','void main() { vCol=aCol; vOp=aOp;');
    sh.fragmentShader='varying vec3 vCol; varying float vOp;\n'+sh.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      diffuseColor.rgb*=vCol; if(vOp<.999){ if(fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453)>vOp)discard; }`); if(!m.isMeshBasicMaterial)sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n      totalEmissiveRadiance*=vCol;'); };
  const k0=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):()=>''; m.customProgramCacheKey=()=>k0()+'|tint'; };
const PEEK=window.PEEK={uDP:{x:0,y:0,z:-2,w:.1},uDF:{x:0,y:0,z:0,w:0},uDK:{x:0,y:1,z:1e9,w:0},uRS:new THREE.Vector2(1,1),boxes:[],k:0,on:QS.get('dither')!=='0',ray:new THREE.Ray(),V:new THREE.Vector3(),W:new THREE.Vector3(),H:new THREE.Vector3()};
if(PEEK.on)for(const k of ['lambert','basic']){ const S=THREE.ShaderLib[k]; S.uniforms.uDP={value:PEEK.uDP}; S.uniforms.uDK={value:PEEK.uDK}; S.uniforms.uRS={value:PEEK.uRS}; S.uniforms.uDF={value:PEEK.uDF};
  S.vertexShader='attribute float aWl; varying vec4 vDc; varying vec2 vDo; varying float vWl, vWy; varying vec2 vWxz;\n'+S.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vDc=gl_Position; vWl=aWl; { vec4 o=projectionMatrix*viewMatrix*vec4(floor(cameraPosition.x/64.)*64.,0.,floor(cameraPosition.z/64.)*64.,1.); vDo=isOrthographic?o.xy/o.w:vec2(0.); } vec4 wq=vec4(transformed,1.);\n#ifdef USE_INSTANCING\n wq=instanceMatrix*wq;\n#endif\n vec4 wm=modelMatrix*wq; vWy=wm.y; vWxz=wm.xz;');
  S.fragmentShader='uniform vec4 uDP, uDK, uDF; uniform vec2 uRS; varying vec4 vDc; varying vec2 vDo; varying float vWl, vWy; varying vec2 vWxz;\nfloat dB2(vec2 a){ a=floor(a); return fract(dot(a,vec2(.5,a.y*.75))); }\n'+S.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
  if(uDK.w>0.&&vWl>4.5&&vWy>uDK.z){ vec3 dn=vDc.xyz/vDc.w; if(dn.z<uDP.z&&dB2((gl_FragCoord.xy-floor((vDo*.5+.5)*uRS))*.5)*.25+dB2(gl_FragCoord.xy-floor((vDo*.5+.5)*uRS))<uDK.w*1.5)discard; }
  if(uDK.x>0.&&vWl>1.5&&(vWl<2.5||vWy>uDK.z)&&(vWl>2.5||dot(vWxz-uDF.xy,uDF.zw)>0.)){ vec3 dn=vDc.xyz/vDc.w; vec2 dq=dn.xy-uDP.xy; dq.x*=uDK.y; float dr=length(dq)/uDP.w, th=uDK.x*(dr<.7?.8:.4); if(vWl>3.5&&dr<.8)th=uDK.x*1.5; if(dr<1.&&dn.z<uDP.z&&dB2((gl_FragCoord.xy-floor((vDo*.5+.5)*uRS))*.5)*.25+dB2(gl_FragCoord.xy-floor((vDo*.5+.5)*uRS))<th)discard; }`); }
PEEK.box=(me,x0,y0,z0,x1,y1,z1)=>{ const e=.7*TILE/.84; PEEK.boxes.push({me,b:new THREE.Box3(new THREE.Vector3(Math.min(x0,x1)-e,Math.min(y0,y1)-e,Math.min(z0,z1)-e),new THREE.Vector3(Math.max(x0,x1)+e,Math.max(y0,y1)+e,Math.max(z0,z1)+e))}); };
// aWl: 2 a wall (dithered open round you), 3 a roof, 4 leaves (open fully round you: many layers of cards never dither through, 2 Nov 2026)
PEEK.mark=(g,A)=>{ g.setAttribute('aWl',new THREE.BufferAttribute(A||new Uint8Array(g.attributes.position.count).fill(2),1)); return g; };
PEEK.whole=me=>{ PEEK.mark(me.geometry); me.updateMatrixWorld(); const b=new THREE.Box3().setFromObject(me); if(!b.isEmpty())PEEK.box(me,b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z); };
PEEK.batch=(me,L)=>{ const M=TILE/.84, q=.05*TILE, C=6*M, G={}, K=[], V=PEEK.V, grp=(k,v,nx,nz)=>G[k]||(G[k]={v,nx,nz,b:new THREE.Box3(),t0:1e9,t1:-1e9});
  L.forEach((o,n)=>{ const p=o.pos, ax=p[3]-p[0], ay=p[4]-p[1], az=p[5]-p[2], bx=p[6]-p[0], by=p[7]-p[1], bz=p[8]-p[2]; let nx=ay*bz-az*by, ny=az*bx-ax*bz, nz=ax*by-ay*bx; const l=Math.hypot(nx,ny,nz); K.push(null); if(l<1e-12||Math.abs(ny/l)>=.15)return; nx/=l; nz/=l;
    const h=Math.hypot(nx,nz); nx/=h; nz/=h; if(nx<-1e-3||(Math.abs(nx)<=1e-3&&nz<0)){ nx=-nx; nz=-nz; } const k='v'+Math.round(nx*40)+','+Math.round(nz*40)+','+Math.round((nx*p[0]+nz*p[2])/q), g=grp(k,1,nx,nz); K[n]=k;
    for(let i=0;i<18;i+=3){ g.b.expandByPoint(V.set(p[i],p[i+1],p[i+2])); const t=-nz*p[i]+nx*p[i+2]; g.t0=Math.min(g.t0,t); g.t1=Math.max(g.t1,t); } });
  for(const k in G){ const g=G[k], b=g.b; g.w=b.max.y-b.min.y>=2.2*M&&g.t1-g.t0>=1.2*M?2:0; }
  L.forEach((o,n)=>{ if(K[n]&&G[K[n]].w)return; const p=o.pos; let y=1e9, x=0, z=0; for(let i=0;i<18;i+=3){ y=Math.min(y,p[i+1]); x+=p[i]/6; z+=p[i+2]/6; } if(y<2.4*M){ K[n]=null; return; }
    const k='r'+Math.floor(x/C)+','+Math.floor(z/C), g=grp(k,0); K[n]=k; for(let i=0;i<18;i+=3)g.b.expandByPoint(V.set(p[i],p[i+1],p[i+2])); });
  let any=false; for(const k in G){ const g=G[k], b=g.b; if(!g.v)g.w=Math.max(b.max.x-b.min.x,b.max.z-b.min.z)>=2*M?3:0; if(g.w){ any=true; PEEK.box(me,b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z); } }
  if(!any)return; const A=new Uint8Array(L.length*6); K.forEach((k,n)=>{ if(k)A.fill(G[k].w,n*6,n*6+6); }); PEEK.mark(me.geometry,A); };
PEEK.tick=dt=>{ const on=PEEK.on&&!PEEK.off&&UI.view!=='first'&&!UI.freeCam&&!ED.on&&PEEK.boxes.length, M=TILE/.84, c=PEEK.V.set(pos.x,SHARED.py+1.1*TILE,pos.z), R=PEEK.ray, W=PEEK.W, H=PEEK.H, P=PEEK.uDP, K=PEEK.uDK;
  PEEK.uRS.set(RW,RH);   // the see-through's dots move with the world, not the screen, so they never crawl as you walk (owner, 9 Nov 2026)
  R.origin.copy(c); if(UI.persp)R.direction.copy(SHARED.cam.position).sub(c).normalize(); else R.direction.set(0,0,1).applyQuaternion(SHARED.cam.quaternion);
  let cov=false; if(on){ const far=UI.persp?c.distanceTo(SHARED.cam.position):1e5; W.copy(c).project(SHARED.cam); if(far>1.5*M&&Math.abs(W.x)<1.1&&Math.abs(W.y)<1.1&&W.z<1)for(const o of PEEK.boxes){ const me=o.me; if(!me.visible||(me.parent&&!me.parent.visible)||!LEVELS.drawn(me))continue; if(R.intersectBox(o.b,H)&&H.distanceTo(c)<far){ cov=true; break; } } }
  PEEK.k=Math.max(0,Math.min(1,PEEK.k+(cov?dt:-dt)/.25)); PEEK.cov=cov; { const dx=R.direction.x, dz=R.direction.z, l=Math.hypot(dx,dz)||1; PEEK.uDF.x=pos.x; PEEK.uDF.y=pos.z; PEEK.uDF.z=dx/l; PEEK.uDF.w=dz/l; }   // a wall opens only on the camera's side of you, never behind you K.x=PEEK.k; K.y=RW/RH; K.z=SHARED.py+2.6*TILE;
  const out=PEEK.on&&!PEEK.off&&UI.view!=='first'&&!UI.freeCam&&!ED.on&&!(PARK.within&&PARK.within(pos.x,pos.z,0));   // outside the park its trees never stand between the camera and you (owner, 8 Nov 2026)
  PEEK.w=Math.max(0,Math.min(1,(PEEK.w||0)+(out?dt:-dt)/.25)); K.w=PEEK.w; if(K.w){ H.copy(c).addScaledVector(R.direction,.5*M).project(SHARED.cam); P.z=H.z; } if(!PEEK.k)return;
  W.copy(c).project(SHARED.cam); H.set(1,0,0).applyQuaternion(SHARED.cam.quaternion).multiplyScalar((UI.persp?1.6:2.6)*M).add(c).project(SHARED.cam); P.w=Math.max(1e-4,Math.min(.6,Math.hypot((H.x-W.x)*RW/RH,H.y-W.y))); P.x=W.x; P.y=W.y;
  H.copy(c).addScaledVector(R.direction,.5*M).project(SHARED.cam); P.z=H.z; };
PEEK.stat=()=>({boxes:PEEK.boxes.length,k:PEEK.k,w:PEEK.w||0,cov:!!PEEK.cov,progs:renderer.info.programs.length});
BATCH.queues=[]; BATCH.VIEW=20*TILE; BATCH.reach=()=>[48*TILE,64*TILE]; BATCH.at=()=>pos;   // painted within reach()[0] of BATCH.at() (you; in a room off the map where its windows look out, 130), dropped past reach()[1] (the haze range sets them, 134e), all dropped while it is null (a room with no window out)
BATCH.queue=({make,cast=false,group,post,R,done,tile})=>{ const q={jobs:[],R:R||BATCH.VIEW,hold:[],hn:0,gt:0,dt:0,pend:[],groups:[],settled:false}, gd=(j,x,z)=>Math.hypot(Math.max(j.x0-x,0,x-j.x1),Math.max(j.z0-z,0,z-j.z1));
  const paint=L=>{ const keep=BATCH.items.splice(0), tg=BATCH.tag; BATCH.tag=null; for(const j of L){ q.jobs.splice(q.jobs.indexOf(j),1); j.go(); q.pend.push(j); q.hn++; } q.hold.push(...BATCH.items.splice(0)); BATCH.items=keep; BATCH.tag=tg; q.settled=false; };
  const flush=()=>{ if(!q.hold.length)return; const keep=BATCH.items.splice(0), m0=BATCH.meshes, c0=BATCH.cast; BATCH.meshes={}; BATCH.items=q.hold; q.hold=[]; q.hn=0;
    BATCH.cast=cast; const t0=BATCH.tile, r0=BATCH.REG; BATCH.tile=tile||0; BATCH.REG=q.reg||(q.reg=new Map()); const ra=BATCH.REGADD=[]; try{ BATCH.build(make); } finally{ BATCH.tile=t0; BATCH.REG=r0; BATCH.REGADD=null; } BATCH.cast=c0; const M=BATCH.meshes||{}; BATCH.meshes=m0; BATCH.items=keep; const g=group(); for(const k in M)g.add(M[k]); if(post)post(M); q.groups.push({ms:Object.values(M),jobs:q.pend.splice(0),reg:ra}); };   // each queue's register: its later pieces give way to its earlier ones
  // a dropped group frees its meshes and pictures; its patches go back on the list, painted again when you come near
  const drop=G=>{ '@later'; for(const me of G.ms){ me.removeFromParent(); PEEK.boxes=PEEK.boxes.filter(b=>b.me!==me); me.geometry.dispose(); for(const m of [].concat(me.material)){ for(const k of ['map','emissiveMap'])if(m[k]){ m[k].dispose(); m[k].image=null; } m.dispose(); } }
    for(const [k,e] of G.reg||[]){ const L=q.reg&&q.reg.get(k), i=L?L.indexOf(e):-1; if(i>=0)L.splice(i,1); }   // a dropped piece's faces leave the register
    q.groups.splice(q.groups.indexOf(G),1); q.jobs.push(...G.jobs); q.dropped=true; };
  q.add=(x0,z0,x1,z1,go)=>q.jobs.push({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),go});
  q.near=(x,z,r=q.R)=>{ if(!BATCH.at())return; const L=q.jobs.filter(j=>gd(j,x,z)<r); if(L.length){ paint(L); flush(); } };
  q.tick=dt=>{ if(q.dropped){ q.dropped=false; SYS.run('perfBounds'); }   // the culling lists forget what was dropped
    const A=BATCH.at(); if(!A){ flush(); while(q.groups.length)drop(q.groups[0]); return; }
    if((q.dt+=dt||0)>1){ q.dt=0; const K=BATCH.reach()[1]; for(const G of [...q.groups])if(G.jobs.every(j=>gd(j,A.x,A.z)>K))drop(G); }
    if(!q.jobs.length&&!q.hold.length)return; q.near(A.x,A.z); if((q.gt+=dt)<.05)return; q.gt=0;
    const t0=performance.now(); while(performance.now()-t0<6){ let b=null, bd=BATCH.reach()[0]; for(const j of q.jobs){ const d=gd(j,A.x,A.z); if(d<bd){ bd=d; b=j; } } if(!b)break; paint([b]); }
    const P=BATCH.reach()[0], more=q.jobs.some(j=>gd(j,A.x,A.z)<P); if(q.hn>=24||!more){ flush(); if(!more&&!q.settled){ q.settled=true; if(done)done(); } } };
  q.rush=(ms,r)=>{ const A=BATCH.at(); if(!A)return; const P=Math.min(BATCH.reach()[0],r||Infinity), t0=performance.now(); while(performance.now()-t0<ms){ let b=null, bd=P; for(const j of q.jobs){ const d=gd(j,A.x,A.z); if(d<bd){ bd=d; b=j; } } if(!b)break; paint([b]); } flush(); };   // behind a loading screen: as much as fits in ms
  q.left=r=>{ const A=BATCH.at(); if(!A)return 0; const P=Math.min(BATCH.reach()[0],r||Infinity); return q.jobs.filter(j=>gd(j,A.x,A.z)<P).length; };
  q.kept=()=>{ const A=BATCH.at()||pos, K=BATCH.reach()[1]; return q.groups.every(G=>G.jobs.some(j=>gd(j,A.x,A.z)<=K+1)); };
  BATCH.queues.push(q); return q; };
BATCH.kept=()=>BATCH.queues.every(q=>q.kept());
BATCH.rush=(ms,r)=>{ for(const q of BATCH.queues)q.rush(ms/BATCH.queues.length,r); };
BATCH.left=r=>BATCH.queues.reduce((n,q)=>n+q.left(r),0);   // squares still to paint within reach (the loading screens' bars, FADE)   // (for the checks: nothing kept past reach)
BATCH.near=(x,z)=>{ for(const q of BATCH.queues)q.near(x,z); };
BATCH.tick=dt=>{ for(const q of BATCH.queues)q.tick(dt); };
SYS.add('near',(x,z)=>BATCH.near(x,z),'008-batch');
export {OBJ, OBJS, PEEK};
