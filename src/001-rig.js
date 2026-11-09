
// the Walker: the rig (skeleton, gaits, IK, foot-lock, moves), the SDF body baker, and the software rasterizer
const WDRAWN={"pal":["#9c9873","#5e4e4d","#ddb8a3","#353e47","#6e4e39","#1c252e","#362827","#4b4936","#382c20","#533127","#38424b","#68533e","#b4896e","#4e3f30","#838060","#362720","#433531","#73635d","#685855","#564747","#312424","#c9a797","#dfbba5","#4e4042","#413429","#775842","#b7978c","#644735","#a78882","#3e3c2e","#2d2122","#8e8a6b","#817d63","#a29d79","#76715c","#8b8767","#444232","#5b4031","#6d6952","#8b7070","#987b78","#95705f","#303842","#2c333d","#242a34","#b98f74","#171e28","#282e39","#1a212b","#4c2c24","#42494f","#564435","#2e241b","#5f4b39","#4f3e31","#33281e","#777459","#533a2d","#2b3238","#362a23","#47392c","#2a2119","#151b25","#3b2f26","#43342b","#31231e","#39362b","#452822","#635f4c","#5e3d31","#6b6655","#3f241f","#333c46","#45382b","#e1bfa8","#473a3d","#a47c66","#57543f","#343128","#2e3640","#454d53","#4c342a","#2a313c","#886658","#5a4a3a","#725d47","#625c4f","#48382e","#2f2c25","#131922"],"role":["shirt","hair","skin","pants","skin","pants","hair","shirt","shoes","skin","pants","shoes","skin","shoes","shirt","shoes","hair","hair","hair","hair","hair","skin","skin","hair","shoes","skin","skin","skin","skin","shirt","hair","shirt","shirt","shirt","shirt","shirt","shirt","skin","shirt","skin","skin","skin","pants","pants","pants","skin","pants","pants","pants","skin","pants","shoes","shoes","shoes","shoes","shoes","shirt","skin","pants","shoes","shoes","shoes","pants","shoes","shoes","shoes","shirt","skin","shirt","skin","shirt","skin","pants","shoes","skin","hair","skin","shirt","shirt","pants","pants","skin","pants","skin","shoes","shoes","shirt","shoes","shirt","pants"]};
const RIG=(()=>{
const V=(x,y,z)=>({x,y,z}),add=(a,b)=>V(a.x+b.x,a.y+b.y,a.z+b.z),sub=(a,b)=>V(a.x-b.x,a.y-b.y,a.z-b.z),mul=(a,k)=>V(a.x*k,a.y*k,a.z*k),
  dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z,len=a=>Math.sqrt(dot(a,a)),nrm=a=>mul(a,1/(len(a)||1)),
  cross=(a,b)=>V(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x),
  yaw=(v,t)=>V(v.x*Math.cos(t)+v.z*Math.sin(t),v.y,-v.x*Math.sin(t)+v.z*Math.cos(t)),D=Math.PI/180,ZERO=V(0,0,0);
const PITCH=12*D,K=1.028,PX=1/(K*Math.cos(PITCH)),ACROSS=48/(33.9*Math.SQRT2)/K,TILT=24/(33.9*Math.SQRT2)/K;
const limb=(a,b,s)=>V(s*Math.sin(b),-Math.cos(b)*Math.cos(a),Math.cos(b)*Math.sin(a));
const smooth=t=>t*t*(3-2*t);

const rotX=(v,t)=>V(v.x,v.y*Math.cos(t)-v.z*Math.sin(t),v.y*Math.sin(t)+v.z*Math.cos(t)),rotZ=(v,t)=>V(v.x*Math.cos(t)+v.y*Math.sin(t),-v.x*Math.sin(t)+v.y*Math.cos(t),v.z);
const M3=(x,y,z)=>({x,y,z}),app=(m,v)=>add(add(mul(m.x,v.x),mul(m.y,v.y)),mul(m.z,v.z)),cat=(a,b)=>M3(app(a,b.x),app(a,b.y),app(a,b.z));
const turn=(yw,roll,pitch)=>{ const f=v=>yaw(rotZ(rotX(v,pitch),roll),yw); return M3(f(V(1,0,0)),f(V(0,1,0)),f(V(0,0,1))); };
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));

const ANKLE=4.2,FOOTX=2.97,STAND=18;
const LEG0={hx:4.35,pel:[5.2,4.6],hr:3.1,th:[3.15,3.4],sh:[3.34,3.2,3.07],shoe:null,sy:3.3,bar:2.3,col:[2.6,2.4],slv:[2.9,2.8]};
const BODYS={A:{so:6.3,sq:.9,r1:5.6,r2:6.1},B:{so:7.4,sq:.9,r1:5.4,r2:5.6},C:{so:7.4,sq:.72,r1:4.9,r2:5.7},D:{so:8,sq:.75,r1:5,r2:6.2},
  C1:{so:7.4,sq:.72,r1:4.9,r2:5.7,hx:3.9,pel:[4.9,4.5],hr:3,th:[3.45,2.75],sh:[2.7,2.85,2.1],shoe:{r:.5}},
  S1:{so:7.4,sq:.72,r1:4.9,r2:5.7,hx:3.9,pel:[4.9,4.5],hr:3,th:[3.45,2.75],sh:[2.7,2.85,2.1],shoe:{r:.5},bar:1.9,col:[2.6,2.0],slv:[2.66,2.6]},
  S2:{so:7.1,sq:.72,r1:4.9,r2:5.7,hx:3.9,pel:[4.9,4.5],hr:3,th:[3.45,2.75],sh:[2.7,2.85,2.1],shoe:{r:.5},sy:2.5,bar:1.8,col:[2.7,1.9],slv:[2.64,2.58]},
  S2F:{so:7.1,sq:.72,r1:4.9,r2:5.7,hx:3.4,pel:[4.8,4.4],hr:2.9,th:[3.35,2.7],sh:[2.62,2.66,2.05],shoe:{r:.5},sy:2.5,bar:1.8,col:[2.7,1.9],slv:[2.64,2.58]},
  S4:{so:8.2,sq:.78,r1:5.2,r2:6.2,hx:3.7,pel:[5,4.6],hr:3.1,th:[3.8,3],sh:[2.9,2.9,2.2],shoe:{r:.5},sy:3,bar:2.7,col:[2.9,2],slv:[3,2.9]},
  S3:{so:7.0,sq:.72,r1:4.9,r2:5.7,hx:3.9,pel:[4.9,4.5],hr:3,th:[3.45,2.75],sh:[2.7,2.85,2.1],shoe:{r:.5},sy:2.2,bar:1.5,col:[2.9,1.8],slv:[2.6,2.55],r2:5.5},

  C2:{so:7.4,sq:.72,r1:4.9,r2:5.7,hx:3.7,pel:[4.8,4.3],hr:2.8,th:[3.2,2.5],sh:[2.45,2.6,1.9],shoe:{r:.3}},
  C3:{so:7.4,sq:.72,r1:4.9,r2:5.7,hx:4.0,pel:[5,4.6],hr:3.1,th:[3.7,2.85],sh:[2.75,3.1,2.15],shoe:{r:.4}}};
const BODY={...LEG0,...(BODYS[(typeof location!=='undefined'&&new URLSearchParams(location.search).get('body')||'S4').toUpperCase()]||BODYS.S4)};
const RIGP0={bones:{thigh:6.9,shin:6.5,upper:7.4,fore:6.3,spine:[0,5,0],chest:[0,10,0],neck:[0,14,0],headBase:[0,16.5,0.1],head:[0,25.2,0.5],headTop:[0,34,0.3],
  clav:[1.5,3,0],shoulder:[BODY.so,BODY.sy,0],hip:[BODY.hx,-0.4,0],hand:[0,0,0],handSize:1},pieces:{}};
let RIGP=JSON.parse(JSON.stringify(RIGP0)),RIGGEN=0,THIGH,SHIN,UPPER,FORE,HIPX,HIP;
function rigSet(o){ const d=JSON.parse(JSON.stringify(RIGP0)); if(o&&o.bones) for(const k in d.bones) if(o.bones[k]!=null) d.bones[k]=o.bones[k]; if(o&&o.pieces) d.pieces=JSON.parse(JSON.stringify(o.pieces));
  RIGP=d; ({thigh:THIGH,shin:SHIN,upper:UPPER,fore:FORE,hip:HIP}=d.bones); HIPX=HIP[0]; if(RIGGEN++){ REST=null; STUDIOC=null; for(const k in POSEC) delete POSEC[k]; } return d; }
rigSet(null);
const rigGet=()=>JSON.parse(JSON.stringify(RIGP)),rigDefault=()=>JSON.parse(JSON.stringify(RIGP0));
let G=289;
const RIGT={blend:4,start:3.5,moves:1,combo:1};
const WALK={cycle:0.729,stance:0.58,stride:18,lean:2,bounce:1,arm:1,elbow:1,sway:1,twist:1,knee:1,width:1},RUN={cycle:0.461,stance:0.4,stride:20,lean:10,bounce:1,arm:1,elbow:1,sway:1,twist:1,knee:1,width:1};
const OVL={fn:null};
const GAITV=3;
function gaitOf(r){ const g={}; for(const k in WALK) g[k]=WALK[k]+(RUN[k]-WALK[k])*r; g.speed=g.stride/(g.stance*g.cycle); return g; }
const CYCLE=WALK.cycle,SPEED=gaitOf(0).speed;
const fwv=a=>V(0,Math.sin(a),Math.cos(a)),dnv=a=>V(0,-Math.cos(a),Math.sin(a));
const loop=pts=>u=>{ u=((u%1)+1)%1; const n=pts.length,at=i=>{ const k=((i%n)+n)%n,w=Math.floor(i/n); return [pts[k][0]+w,pts[k][1]]; };
  let i=n-1; for(let k=0;k<n;k++) if(pts[k][0]>u){ i=k-1; break; } if(u<pts[0][0]) i=-1;
  const [t0,p0]=at(i-1),[t1,p1]=at(i),[t2,p2]=at(i+1),[t3,p3]=at(i+2),x=(u-t1)/(t2-t1),m1=(p2-p0)/(t2-t0)*(t2-t1),m2=(p3-p1)/(t3-t1)*(t2-t1);
  return (2*x**3-3*x*x+1)*p1+(x**3-2*x*x+x)*m1+(-2*x**3+3*x*x)*p2+(x**3-x*x)*m2; };
const LAB={
  walk:{stance:0.6,hip:loop([[0,30],[0.1,26],[0.2,17],[0.3,8],[0.4,-2],[0.5,-9],[0.56,-10],[0.62,-4],[0.7,10],[0.8,25],[0.87,31],[0.94,31]]),
    knee:loop([[0,4],[0.07,12],[0.14,17],[0.24,12],[0.36,6],[0.44,6],[0.52,15],[0.6,38],[0.68,56],[0.72,60],[0.78,55],[0.86,35],[0.93,12]]),
    foot:loop([[0,15],[0.05,6],[0.09,0],[0.34,0],[0.42,-6],[0.5,-18],[0.57,-32],[0.61,-38],[0.66,-30],[0.74,-12],[0.84,2],[0.93,12]])},
  run:{stance:0.4,hip:loop([[0,32],[0.1,25],[0.2,10],[0.3,-5],[0.4,-14],[0.48,-12],[0.58,5],[0.7,30],[0.82,48],[0.9,45],[0.96,38]]),
    knee:loop([[0,22],[0.1,38],[0.2,30],[0.32,18],[0.4,22],[0.5,55],[0.6,90],[0.68,100],[0.78,85],[0.88,45],[0.95,26]]),
    foot:loop([[0,10],[0.06,0],[0.2,0],[0.3,-12],[0.4,-34],[0.5,-38],[0.6,-24],[0.75,-5],[0.88,5],[0.96,10]])}};
function lab(k,q,ST,r){ const at=G0=>{ const s0=G0.stance; return G0[k](q<ST?q/ST*s0:s0+(q-ST)/(1-ST)*(1-s0)); }; return lerp(at(LAB.walk),at(LAB.run),r)*D; }
function planted(u,fa,x,h){ const z=(0.5-u)*h;
  return fa>0?add(sub(V(x,0,z-1.1),mul(dnv(fa),ANKLE)),mul(fwv(fa),1.1)):fa<0?sub(sub(V(x,0,z+1.9),mul(dnv(fa),ANKLE)),mul(fwv(fa),1.9)):V(x,ANKLE,z); }
const legReach=(h,k)=>V(0,-THIGH*Math.cos(h)-SHIN*Math.cos(h-k),THIGH*Math.sin(h)+SHIN*Math.sin(h-k));
const drive=(q,w)=>Math.cos(2*Math.PI*q)*w;
const phases=ph=>({L:(ph+0.25)%1,R:(ph+0.75)%1});

const neutral=()=>({root:V(0,STAND,0),yaw:0,roll:0,pitch:0,pv:0,pyaw:0,cyaw:0,bend:0,side:0,nod:0,look:0,
  L:{ua:[9*D,8*D],fa:[19*D,8*D],fist:0,th:[0,0],sh:[0,0],foot:0},R:{ua:[9*D,8*D],fa:[19*D,8*D],fist:0,th:[0,0],sh:[0,0],foot:0}});
const lerp=(a,b,u)=>a+(b-a)*u,lerp2=(a,b,u)=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],lerpV=(a,b,u)=>V(lerp(a.x,b.x,u),lerp(a.y,b.y,u),lerp(a.z,b.z,u));
function mix(A,B,u){ const P={root:lerpV(A.root,B.root,u)};
  for(const k of ['yaw','roll','pitch','pv','pyaw','cyaw','bend','side','nod','look']) P[k]=lerp(A[k],B[k],u);
  for(const n of 'LR'){ const a=A[n],b=B[n]; P[n]={ua:lerp2(a.ua,b.ua,u),fa:lerp2(a.fa,b.fa,u),fist:lerp(a.fist,b.fist,u),th:lerp2(a.th,b.th,u),sh:lerp2(a.sh,b.sh,u),foot:lerp(a.foot,b.foot,u)};
    if(a.ik&&b.ik){ P[n].ik=lerpV(a.ik,b.ik,u); P[n].kp=a.kp||b.kp; }
    if(a.fg||b.fg){ const fa=fgOf(a),fb=fgOf(b); P[n].fg=fa.map((d,i)=>d.map((v,j)=>lerp(v,fb[i][j],u))); }
    if(a.hf||b.hf){ const wa=a.hf?(a.hfw==null?1:a.hfw):0,wb=b.hf?(b.hfw==null?1:b.hfw):0; P[n].hfw=lerp(wa,wb,u);
      P[n].hf=a.hf&&b.hf?{y:a.hf.y.map((v,j)=>lerp(v,b.hf.y[j],u)),z:a.hf.z.map((v,j)=>lerp(v,b.hf.z[j],u))}:(b.hf||a.hf); } }
  for(const n of 'LR') if(P[n].ik) legIK(P,n,n=='L'?1:-1,P[n].ik,P[n].kp);
  return P; }
const hipAt=(P,s)=>{ const Rb=turn(P.yaw,P.roll,P.pitch),pv=V(0,P.pv,0); return [add(add(P.root,pv),app(Rb,sub(yaw(V(s*HIP[0],HIP[1],HIP[2]),P.pyaw),pv))),Rb]; };
function legIK(P,n,s,A,kp){ const [H,Rb]=hipAt(P,s),d=sub(A,H),dl=Math.min(len(d),THIGH+SHIN-1e-6),u=nrm(d);
  const f0=app(Rb,yaw(V(0,0,1),P.pyaw)); const fwd=kp?add(app(Rb,kp),mul(f0,.35)):f0;   // (a knee's given way leans a little forward: one given almost along the leg doesn't flip side to side)
  const ca=clamp((THIGH*THIGH+dl*dl-SHIN*SHIN)/(2*THIGH*dl),-1,1),pole=nrm(sub(fwd,mul(u,dot(fwd,u))));
  const Kn=add(H,add(mul(u,THIGH*ca),mul(pole,THIGH*Math.sqrt(1-ca*ca)))),A2=add(H,mul(u,dl));
  const ang=v=>{ const l=nrm(v),x=dot(l,Rb.x),y=dot(l,Rb.y),z=dot(l,Rb.z); return [Math.atan2(z,-y),Math.asin(clamp(s*x,-1,1))]; };
  P[n].th=ang(sub(Kn,H)); P[n].sh=ang(sub(A2,Kn)); }

function armIK(P,n,s,A){ const {J,m}=build(P),S=J['shoulder'+n],d=sub(A,S),dl=Math.min(len(d),UPPER+FORE-1e-6),u=nrm(d);
  const ca=clamp((UPPER*UPPER+dl*dl-FORE*FORE)/(2*UPPER*dl),-1,1),out=app(m.Ru,V(s,-0.5,-0.3)),pole=nrm(sub(out,mul(u,dot(out,u))));
  const E=add(S,add(mul(u,UPPER*ca),mul(pole,UPPER*Math.sqrt(1-ca*ca)))),A2=add(S,mul(u,dl));
  const ang=v=>{ const l=nrm(v),x=dot(l,m.Ru.x),y=dot(l,m.Ru.y),z=dot(l,m.Ru.z); return [Math.atan2(z,-y),Math.asin(clamp(s*x,-1,1))]; };
  P[n].ua=ang(sub(E,S)); P[n].fa=ang(sub(A2,E)); }
function gripIK(st,P,G=st.climb.grip){ const W=st.world,c=Math.cos(W.hd),s=Math.sin(W.hd);   // hands and feet onto holds given in the world
  const toL=p=>{ const dx=(p.x-W.x)*W.kx,dz=(p.z-W.z)*W.kx; return V(dx*c-dz*s,(p.y-W.y)*W.ky,dx*s+dz*c); }, nL=p=>nrm(V(p.nx*c-p.nz*s,p.ny,p.nx*s+p.nz*c));
  for(const n of 'LR'){ const g=G[n],sd=n=='L'?1:-1; if(!g) continue;
    if(g.f){ const A=add(add(toL(g.f),mul(nL(g.f),2.6)),V(0,1.2,0)); P[n].ik=A; P[n].kp=V(sd*.8,.3,1); legIK(P,n,sd,A,P[n].kp); P[n].foot=-35*D; }   // knees out round the trunk, soles flat on the bark
    if(g.h){ armIK(P,n,sd,add(add(toL(g.h),mul(nL(g.h),1.3)),V(0,-1.6,0))); P[n].fist=g.hf??1; } } }
function footLock(st,P,AK,LK,w){ const W=st.world,c=Math.cos(W.hd),s=Math.sin(W.hd),
    toW=b=>({x:W.x+(b.x*c+b.z*s)/W.kx,z:W.z+(-b.x*s+b.z*c)/W.kx}), toL=p=>{ const dx=(p.x-W.x)*W.kx,dz=(p.z-W.z)*W.kx; return V(dx*c-dz*s,0,dx*s+dz*c); },
    up=p=>Math.max(-8,((p.y??W.gnd(p.x,p.z))-W.y)*W.ky), at=b=>{ const p=toW(b); p.y=Math.max(...[-1.1,0,3].map(dz=>{ const q=toW(add(b,V(0,0,dz))); return W.gnd(q.x,q.z); })); p.hd=W.hd; return p; },
    FY=50*D, fyOf=f=>{ let d=Math.atan2(Math.sin(f.hd-W.hd),Math.cos(f.hd-W.hd)); if(Math.abs(d)>FY){ d=Math.sign(d)*FY; f.hd=W.hd+d; } return d; };
  const F=st.fk||(st.fk={}), dt=Math.min(0.1,Math.max(0,W.t-(st.fkT??W.t))); if(W.t-(st.fkT??-9)>0.3) for(const n of 'LR') F[n]=null;
  st.fkT=W.t; const stand=w===0&&!st.move;
  if(stand){
    const S=n=>V((n=='L'?1:-1)*FOOTX,0,0);
    for(const n of 'LR'){ if(!F[n]) F[n]={...at(S(n)),on:1}; const d=toL(F[n]); if(len(sub(d,S(n)))>14) F[n]={...at(S(n)),on:1}; }
    const sp=st.fstep; if(sp){ sp.t+=dt/0.2; if(sp.t>=1){ F[sp.n]={...sp.to,on:1}; st.fstep=null; } }
    if(!st.fstep){ let far=null,fd=0.9; for(const n of 'LR'){ const d=len(sub(toL(F[n]),S(n))); if(d>fd){ fd=d; far=n; } } if(far) st.fstep={n:far,t:0,from:{...F[far]},to:at(S(far))}; }
    for(const n of 'LR'){ const sp=st.fstep&&st.fstep.n==n?st.fstep:null, off=sub(AK[n],S(n)); let b,y;
      let fy; if(sp){ const e=smooth(Math.min(1,sp.t)),p={x:lerp(sp.from.x,sp.to.x,e),z:lerp(sp.from.z,sp.to.z,e)}; b=toL(p); y=lerp(up(sp.from),up(sp.to),e)+2.2*Math.sin(Math.PI*e); fy=lerp(fyOf(sp.from),0,e); }
      else { b=toL(F[n]); y=up(F[n]); fy=fyOf(F[n]); }
      AK[n]=add(add(b,yaw(off,fy)),V(0,y,0)); P[n].fyaw=fy; } }
  else { st.fstep=null;
    for(const n of 'LR'){ const k=LK[n]; if(!k) continue;
      if(k.on){
        const q=F[n]&&F[n].quick?F[n]:null; if(q){
          q.t+=dt/0.16; const e=smooth(Math.min(1,q.t)),b1=sub(AK[n],k.off),to=add(AK[n],V(0,up(toW(b1)),0)); AK[n]=add(lerpV(add(toL(q),V(0,q.ly,0)),to,e),V(0,1.5*Math.sin(Math.PI*e),0)); P[n].fyaw=lerp(q.fy,0,e); if(q.t>=1) F[n]=null; continue; }
        if(!F[n]||!F[n].on){ const b0=sub(AK[n],k.off); F[n]={...at(b0),on:1}; }
        const fy=F[n].fy=fyOf(F[n]); AK[n]=add(add(toL(F[n]),yaw(k.off,fy)),V(0,up(F[n]),0)); P[n].fyaw=fy; }
      else {
        if(F[n]&&F[n].on) F[n].on=0; const e=smooth(k.e), lift=F[n]?sub(toL(F[n]),k.b0):V(0,0,0), y0=F[n]?up(F[n]):0, y1=up(toW(k.b1));
        AK[n]=add(add(AK[n],mul(lift,1-e)),V(0,lerp(y0,y1,e)+(y1>y0?2*Math.sin(Math.PI*e):0),0)); P[n].fyaw=lerp(F[n]&&F[n].fy||0,0,e); } } }
  st.fdn=Math.min(0,...'LR'.split('').map(n=>AK[n].y-ANKLE));
  const Lg=THIGH+SHIN-1e-4; let drop=0;
  for(const s2 of [1,-1]){ const n=s2>0?'L':'R',[H]=hipAt(P,s2),d=sub(AK[n],H),dh=Math.hypot(d.x,d.z); if(len(d)>Lg&&dh<Lg) drop=Math.max(drop,(H.y-AK[n].y)-Math.sqrt(Lg*Lg-dh*dh)); }
  if(drop>1e-3) P.root=add(P.root,V(0,-Math.min(5,st.smooth?drop:Math.ceil(drop/PX)*PX),0));
  if(st.smooth&&st.world){ const t=st.world.t, y=P.root.y; if(st.rT!=null&&t>st.rT&&t-st.rT<.2){ st.rY+=(y-st.rY)*(1-Math.exp(-(t-st.rT)*(y<st.rY?30:14))); P.root=V(P.root.x,st.rY,P.root.z); } else st.rY=y; st.rT=t; }
  for(const s2 of [1,-1]){ const n=s2>0?'L':'R',[H]=hipAt(P,s2),d=sub(AK[n],H); if(len(d)>Lg+0.02){ const v=nrm(d),A=add(H,mul(v,Lg)); st.fslide=(st.fslide||0)+1;
      if(F[n]&&F[n].on&&!stand&&LK[n]&&LK[n].on){ const p=toW(V(A.x,0,A.z)); st.fquick=(st.fquick||0)+1; F[n]={x:p.x,z:p.z,y:F[n].y,hd:F[n].hd,ly:A.y,fy:F[n].fy||0,on:0,quick:1,t:0}; } AK[n]=A; } }
  return true; }
function walkPose(st,abd){ const r=st.run||0,rs=r*r,g=gaitOf(r); if(st.smooth){ const s2=g.stance-.1*r; g.stride*=s2/g.stance; g.stance=s2; } const w=st.w,ST=g.stance,h=g.stride*w/(st.anim||1),q=phases(st.ph),P=neutral(),sw=drive(q.L,w)-drive(q.R,w);
  const fa=(n,qq)=>lab('foot',qq,ST,rs)*w,kn=(qq)=>lab('knee',qq,ST,rs)*w;
  P.pyaw=-3*D*sw*(1+0.5*r)*g.twist; P.cyaw=2.5*D*sw*(1+r)*g.twist; P.look=-0.7*P.cyaw;
  P.bend=(g.lean+1.2*Math.sin(4*Math.PI*(q.L-0.05)))*D*w; P.nod=-0.6*P.bend;
  const sway=0.9*g.sway*w*(1-0.6*r)*Math.sin(2*Math.PI*q.L);
  P.roll=-4*D*g.sway*w*(1-0.4*r)*Math.sin(2*Math.PI*(q.L+0.07)); P.side=-P.roll;
  const hipOff=s=>yaw(V(s*HIP[0],HIP[1],HIP[2]),P.pyaw),feet={},reachY=(s,A,k)=>{ const o=add(V(sway,0,0),hipOff(s)),L2=THIGH*THIGH+SHIN*SHIN+2*THIGH*SHIN*Math.cos(k);
    return A.y-o.y+Math.sqrt(Math.max(0,L2-(A.x-o.x)**2-(A.z-o.z)**2)); };
  let py=null; const AK={},LK={};
  for(const s of [1,-1]){ const n=s>0?'L':'R',x=s*FOOTX*g.width,qq=q[n];
    if(qq<ST){ const a=fa(n,qq),A=planted(qq/ST,a,x,h); feet[n]={A,a,b:V(x,0,(0.5-qq/ST)*h)}; const y=reachY(s,A,kn(qq)); py=py==null?y:Math.min(py,y); } }
  if(py==null){
    const n=q.L<q.R?'L':'R',o=n=='L'?'R':'L',v=((q[n]-ST)/(0.5-ST)),A0=planted(1,fa(n,ST-1e-6),(n=='L'?1:-1)*FOOTX,h),A1=planted(0,fa(o,0),(o=='L'?1:-1)*FOOTX,h);
    const vv=clamp(v,0,1), yB=reachY(o=='L'?1:-1,A1,kn(0)); py=st.smooth&&st.pyS!=null?lerp(st.pyS,yB,vv)+.8*Math.sin(Math.PI*vv):lerp(reachY(n=='L'?1:-1,A0,kn(ST-1e-6)),yB,vv); } else if(st.smooth)st.pyS=py;
  py=Math.min(STAND,py); P.root=V(sway,STAND-Math.max(0,st.smooth?(STAND-py)*g.bounce:Math.round((STAND-py)*g.bounce/PX)*PX),0);
  for(const s of [1,-1]){ const n=s>0?'L':'R',x=s*FOOTX*g.width,qq=q[n];
    let A,a; if(feet[n]){ ({A,a}=feet[n]); LK[n]={on:1,off:sub(A,feet[n].b)}; }
    else {
      const v=(qq-ST)/(1-ST),e=smooth(Math.min(1,v*(1+.4*rs))),A0=planted(1,fa(n,ST-1e-6),x,h),A1=planted(0,fa(n,0),x,h),H=add(P.root,hipOff(s));
      const F=qq2=>legReach(lab('hip',qq2,ST,rs)*w*g.knee,kn(qq2)*g.knee),F0=F(ST),F1=F(1-1e-6),Fv=F(qq);
      a=fa(n,qq); A=add(lerpV(A0,A1,e),sub(Fv,lerpV(F0,F1,e))); A=V(x,Math.max(A.y,Math.cos(a)*ANKLE+Math.max(Math.sin(a)*1.1,-Math.sin(a)*1.9)+0.1*w),A.z); LK[n]={on:0,e,b0:V(x,0,-0.5*h),b1:V(x,0,0.5*h)};
      if(st.smooth&&typeof GAIT!=='undefined'){ const lg=(G,f)=>GK(G,(n=='L'?0:0.5)+G.st+(1-G.st)*v,f)*D, th=[0,1].map(j=>lg(GAIT.walk,c=>c[n].th[j])*(1-rs)+lg(GAIT.run,c=>c[n].th[j])*rs), sh=[0,1].map(j=>lg(GAIT.walk,c=>c[n].sh[j])*(1-rs)+lg(GAIT.run,c=>c[n].sh[j])*rs);
        const Am=add(add(H,mul(limb(th[0],th[1],s),THIGH)),mul(limb(Math.min(sh[0],th[0]),sh[1],s),SHIN)), k=Math.sin(Math.PI*v)**2*w; A=V(x,Math.max(A.y,lerp(A.y,Am.y,k)),lerp(A.z,lerp(A.z,Am.z,k),1)); } }
    legIK(P,n,s,A); AK[n]=A; P[n].foot=a;
    const sh=(lerp(-8,9,rs)*w+3*(1-w)-w*lerp(16,36,rs)*g.arm*Math.cos(2*Math.PI*(qq-0.04)))*D,el=(10+g.elbow*w*(lerp(2,64,rs)+lerp(20,24,rs)*(0.5+0.5*Math.cos(2*Math.PI*(qq-0.62)))))*D,b=abd?abd[n]:0;
    P[n].ua=[sh,b+6*D*(1-w)]; P[n].fa=[sh+el+8*D*(1-w),b+3*D*(1-w)]; }
  if(st.smooth&&typeof GAIT!=='undefined'){ const u=q.L, m=f=>gv(u,rs,f)*D, mx=(x,y)=>x+(y-x)*w;
    for(const k of ['yaw','roll','pitch','side','bend','cyaw','nod'])P[k]=mx(P[k],m(c=>c[k])); P.pyaw=mx(P.pyaw,0); P.look=mx(P.look,-0.5*P.cyaw);
    for(const n of 'LR'){ const b=abd?abd[n]:0; P[n].ua=[mx(P[n].ua[0],m(c=>c[n].ua[0])),mx(P[n].ua[1],m(c=>c[n].ua[1])+b)]; P[n].fa=[mx(P[n].fa[0],m(c=>c[n].fa[0])),mx(P[n].fa[1],m(c=>c[n].fa[1])+b)]; } }
  if(st.smooth){ P.bend*=1-.45*rs; const nd=Math.max(-3*D,Math.min(6*D,P.nod)); st.ndS=st.ndS==null?nd:st.ndS+(nd-st.ndS)*.06; P.nod=st.ndS; }
  const bk=st.bank||0; if(bk){ const L=STAND-ANKLE; P.roll+=bk; P.root=add(P.root,V(L*Math.sin(bk),-L*(1-Math.cos(bk))-2*FOOTX*Math.abs(Math.sin(bk)),0)); P.side-=0.3*bk; }
  const so=st.stop; if(so){ const t=so.t,k=so.a*Math.exp(-t/0.3)*Math.cos(2*Math.PI*t/0.8),dip=t<0.3?so.a*Math.sin(Math.PI*t/0.3):0;
    P.bend+=10*D*k; P.nod-=5*D*k; P.root=add(P.root,V(0,-1.5*dip,2.2*k));
    for(const n of 'LR'){ P[n].ua=[P[n].ua[0]+10*D*k,P[n].ua[1]]; P[n].fa=[P[n].fa[0]+14*D*k,P[n].fa[1]]; } }
  const lk=st._lk&&st.world&&footLock(st,P,AK,LK,w);
  if(bk||so||lk) for(const n of 'LR') legIK(P,n,n=='L'?1:-1,AK[n]);
  return P; }

function build(P,dev){ const J={},m={},Rb=turn(P.yaw,P.roll,P.pitch),pv=V(0,P.pv,0),W=p=>add(add(P.root,pv),app(Rb,sub(p,pv)));
  const RB=RIGP.bones,S0=V(...RB.spine),Ru=turn(0,P.side,P.bend),U=p=>add(S0,app(Ru,sub(p,S0))),N0=V(...RB.neck),Rn=turn(P.look,0,P.nod),Hd=p=>U(add(N0,app(Rn,sub(p,N0))));
  J.pelvis=W(ZERO); J.spine=W(S0); J.chest=W(U(V(...RB.chest))); J.neck=W(U(N0)); J.headBase=W(Hd(V(...RB.headBase))); J.head=W(Hd(V(...RB.head))); J.headTop=W(Hd(V(...RB.headTop)));
  m.Rb=Rb; m.Ru=cat(Rb,Ru); m.Rh=cat(m.Ru,Rn); m.Rc=cat(m.Ru,turn(P.cyaw,0,0)); m.Rp=cat(Rb,turn(P.pyaw,0,0)); m.foot={}; m.hf={}; m.fist={}; m.fg={};
  for(const s of [1,-1]){ const n=s>0?'L':'R',g=P[n];
    const H=J['hip'+n]=W(yaw(V(s*HIP[0],HIP[1],HIP[2]),P.pyaw)),Kn=J['knee'+n]=add(H,mul(app(Rb,limb(g.th[0],g.th[1],s)),THIGH)),A=J['ankle'+n]=add(Kn,mul(app(Rb,limb(Math.min(g.sh[0],g.th[0]),g.sh[1],s)),SHIN));
    const Rf=g.fyaw!=null?turn(g.fyaw,0,0):Rb,fw=app(Rf,fwv(g.foot)),dn=app(Rf,dnv(g.foot)); m.foot[n]=M3(Rf.x,mul(dn,-1),fw);
    J['heel'+n]=add(add(A,mul(dn,ANKLE)),mul(fw,-1.1)); J['ball'+n]=add(add(A,mul(dn,ANKLE)),mul(fw,1.9)); J['toe'+n]=add(J['ball'+n],mul(fw,1.1));
    const C=V(...RB.chest),cl=RB.clav,so=RB.shoulder; J['clav'+n]=W(U(add(C,yaw(V(s*cl[0],cl[1],cl[2]),P.cyaw)))); const S=J['shoulder'+n]=W(U(add(C,yaw(V(s*so[0],so[1],so[2]),P.cyaw))));
    const ua=app(m.Ru,limb(g.ua[0],g.ua[1],s)),fa=app(m.Ru,limb(g.fa[0],g.fa[1],s)),E=J['elbow'+n]=add(S,mul(ua,UPPER)); J['wrist'+n]=add(E,mul(fa,FORE));
    m.hf[n]=hand(J,n,s,dev&&dev[n]?nrm(add(fa,dev[n])):fa,m.Ru,g); m.fist[n]=g.fist; m.fg[n]=g.fg; }
  return {J,m}; }
const DIG=[[0.55,-0.85,0.45,[1.15,0.8,0.62],[0.5,0.44,0.4,0.36]],
  [2.05,-0.95,0,[1.05,0.66,0.52],[0.42,0.38,0.35,0.32]],[2.15,-0.32,0,[1.15,0.74,0.56],[0.43,0.39,0.36,0.33]],
  [2.05,0.3,0,[1.08,0.7,0.54],[0.41,0.37,0.34,0.31]],[1.85,0.85,0,[0.85,0.52,0.45],[0.36,0.33,0.3,0.28]]];
const FREST=[[10,15,10,0],[10,18,10,-0.18],[12,22,12,-0.06],[14,25,13,0.08],[16,28,14,0.22]],FFIST=[[35,40,30,0],[85,100,60,0],[88,100,60,0],[90,100,60,0.02],[92,100,60,0.05]];
const fgOf=g=>g.fg||FREST.map((d,i)=>d.map((v,j)=>(j<3?D:1)*lerp(v,FFIST[i][j],clamp(g.fist||0,0,1))));
function digitBase(F,s,i){ const HS=RIGP.bones.handSize,[y,z,o]=DIG[i].map((v,q)=>q<3?v*HS:v),pn=mul(F.x,-s),K=add(F.o,add(add(mul(F.y,y),mul(F.z,z)),mul(pn,o)));
  if(i>0) return {K,b:F.y,c:pn,e:F.z};
  const b=nrm(add(add(mul(F.y,0.55),mul(F.z,-0.75)),mul(pn,0.35))),c0=nrm(add(mul(F.z,0.75),mul(pn,0.65))),c=nrm(sub(c0,mul(b,dot(c0,b))));
  return {K,b,c,e:nrm(cross(b,c))}; }
let LITE=false, FAR=true; const DIGC=new Map(), F1={o:V(0,0,0),x:V(1,0,0),y:V(0,1,0),z:V(0,0,1)}, HANDL=DIG[2][0]+DIG[2][3][0]+DIG[2][3][1]+DIG[2][3][2]-0.6;
function digitAt(F,s,i,f){ const k=s+'|'+i+'|'+f[0]+','+f[1]+','+f[2]+','+f[3]+'|'+RIGP.bones.handSize; let L=DIGC.get(k); if(!L){ L=digitFK(digitBase(F1,s,i),i,f); if(DIGC.size>4000)DIGC.clear(); DIGC.set(k,L); }
  return L.map(p=>add(F.o,add(add(mul(F.x,p.x),mul(F.y,p.y)),mul(F.z,p.z)))); }
function digitFK(B0,i,f){ const u=nrm(add(B0.b,mul(B0.e,f[3]))),c=nrm(sub(B0.c,mul(u,dot(B0.c,u)))),L=DIG[i][3],HS=RIGP.bones.handSize,out=[B0.K]; let p=B0.K,t=0;
  for(let j=0;j<3;j++){ t+=f[j]; p=add(p,mul(add(mul(u,Math.cos(t)),mul(c,Math.sin(t))),L[j]*HS)); out.push(p); } return out; }
function hand(J,n,s,f,Ru,g){ const W=J['wrist'+n],F0=limbFrame(W,add(W,f),Ru.x,Ru.z); let F=F0;
  if(g.hf&&(g.hfw==null?1:g.hfw)>0){ const w=g.hfw==null?1:g.hfw,y=nrm(add(mul(F0.y,1-w),mul(app(Ru,V(...g.hf.y)),w))),z1=add(mul(F0.z,1-w),mul(app(Ru,V(...g.hf.z)),w)),z=nrm(sub(z1,mul(y,dot(z1,y)))); F={o:W,x:cross(y,z),y,z}; }
  const ho=RIGP.bones.hand; if(ho[0]||ho[1]||ho[2]) F={o:add(W,add(add(mul(F.x,s*ho[0]),mul(F.y,ho[1])),mul(F.z,ho[2]))),x:F.x,y:F.y,z:F.z};
  J['handO'+n]=F.o; J['palm'+n]=add(F.o,mul(F.y,1.2));
  if(FAR){ J['fingers'+n]=add(F.o,mul(F.y,HANDL*RIGP.bones.handSize)); return F; }
  const fg=fgOf(g); for(let i=0;i<5;i++){ if(LITE&&i!==2)continue; digitAt(F,s,i,fg[i]).forEach((p,j)=>J['k'+i+j+n]=p); }
  J['fingers'+n]=J['k23'+n]; return F; }
const BONES=[['pelvis','spine'],['spine','chest'],['chest','neck'],['neck','headBase'],['headBase','head'],['head','headTop'],['pelvis','hipL'],['pelvis','hipR']];
for(const n of 'LR'){ BONES.push(['chest','clav'+n],['clav'+n,'shoulder'+n],['shoulder'+n,'elbow'+n],['elbow'+n,'wrist'+n],
  ['hip'+n,'knee'+n],['knee'+n,'ankle'+n],['ankle'+n,'heel'+n],['ankle'+n,'toe'+n]);
  for(let i=0;i<5;i++){ BONES.push(['wrist'+n,'k'+i+'0'+n]); for(let j=0;j<3;j++) BONES.push(['k'+i+j+n,'k'+i+(j+1)+n]); } }

function rcone(p,a,b,r1,r2){ const ba=sub(b,a),l2=dot(ba,ba),rr=r1-r2,a2=l2-rr*rr,il2=1/l2,pa=sub(p,a),y=dot(pa,ba),z=y-l2,
  xv=sub(mul(pa,l2),mul(ba,y)),x2=dot(xv,xv),y2=y*y*l2,z2=z*z*l2,k=Math.sign(rr)*rr*rr*x2;
  if(Math.sign(z)*a2*z2>k) return Math.sqrt(x2+z2)*il2-r2; if(Math.sign(y)*a2*y2<k) return Math.sqrt(x2+y2)*il2-r1; return (Math.sqrt(x2*a2*il2)+y*rr)*il2-r1; }
function ell(p,c,r){ const q=V((p.x-c.x)/r.x,(p.y-c.y)/r.y,(p.z-c.z)/r.z),k0=len(q),k1=len(V(q.x/r.x,q.y/r.y,q.z/r.z)); return k0*(k0-1)/(k1||1e-6); }
function box(p,c,h){ const q=V(Math.abs(p.x-c.x)-h.x,Math.abs(p.y-c.y)-h.y,Math.abs(p.z-c.z)-h.z); return len(V(Math.max(q.x,0),Math.max(q.y,0),Math.max(q.z,0)))+Math.min(Math.max(q.x,q.y,q.z),0); }
const rbox=(p,c,h,r)=>box(p,c,V(h.x-r,h.y-r,h.z-r))-r;
const sq=(p,c,k)=>V(p.x,p.y,c.z+(p.z-c.z)/k);

let FINEHAND=false;
const RAMP={shirt:['#a9a57e','#9c9873','#838060','#4b4936'],skin:['#e6c4b0','#ddb8a3','#b4896e','#6e4e39'],hair:['#6a5958','#5e4e4d','#4a3d3c','#362827'],
  pants:['#434e58','#38424b','#2c343c','#1c252e'],shoes:['#77614a','#68533e','#4e3f30','#382c20'],
  mouth:['#6e2f2c','#5c2624','#431a19','#2a0f0f'],teeth:['#f4efe4','#e8e1d3','#c9bfae','#7d7466'],
  tie:['#a83a32','#923029','#72241f','#3c1210'],collar:['#e6e2d6','#d6d2c4','#b4ae9e','#6e6a5e'],
  coat:['#5c524a','#51483f','#3f3731','#231e1a'],linen:['#f4f0e4','#e8e3d4','#c8c2ae','#7a7464'],vest:['#6e5c46','#62513d','#4b3e2f','#2b231a'],
  gold:['#f4dc8a','#e0bc58','#ae8a34','#5e4518'],fur:['#f0e8dc','#e4dccd','#c4b9a6','#6e6456'],
  fur2:['#9a5634','#8a4a2c','#6c3820','#3a1e10'],wood:['#8a5a36','#7a4e2e','#5e3c22','#2e1e10'],metal:['#e4e6e8','#cfd2d6','#9a9ea4','#4a4e54'],
  paper:['#f6f0dc','#ece4ca','#ccc2a2','#7e7458'],ember:['#ffd890','#ffb050','#e07028','#7a2c10'],cover:['#a8402e','#983624','#76281a','#40140c'],
  glass:['#e6f0f4','#cfdde4','#9fb0b8','#56646a'],
  spruce:['#ee9e4a','#d67a32','#a65020','#56280e'],rose:['#5a3626','#4a2c1e','#341e14','#180c06'],hole:['#2a1c12','#20150c','#160e08','#0a0604'],
  gold:['#f8dc7a','#e6b844','#ac7e26','#5a4012'],pewter:['#cccdd4','#a9aab2','#73747c','#3a3b42'],tuner:['#8cbcee','#5a90d2','#2e5c9c','#142e52']};
const mouthPaint=(p,H,M)=>{ if(!M||M.o<=0.05) return box(p,add(H,V(0,-5.95,5.2)),V(M?M.w:1.7,0.6,3.2))<0?'skin':null;
  const h=Math.max(M.o/2,0.35),cy=-5.95-M.o/2+0.35; if(box(p,add(H,V(0,cy,5.2)),V(M.w,h,3.2))<0) return M.o>0.5&&p.y-H.y>cy+h-0.5?'teeth':'mouth';
  return box(p,add(H,V(0,cy,5.2)),V(M.w+0.6,h+0.6,3.2))<0?'skin':null; };
function headPieces(H,lift,mouth){ const P=[];
  const nape=p=>1.7*Math.max(0,Math.min(1,(H.y-2.0-p.y)/4.5))*Math.max(0,Math.min(1,(H.z-0.5-p.z)/4.5));
  P.push({n:'head',m:'skin',d:p=>Math.min(rbox(p,H,V(6.0,7.8,6.3),4.6)+nape(p),rcone(p,add(H,V(0,-6,1.6)),add(H,V(0,-10.5,0.2)),2.4,2.2),ell(p,add(H,V(6.3,-1.8,-0.8)),V(0.8,1.45,0.95)),ell(p,add(H,V(-6.3,-1.8,-0.8)),V(0.8,1.45,0.95)),rbox(p,add(H,V(0,-2.6,6.35)),V(0.95,1.75,1.25),0.45))});
  P.push({n:'hair',m:'hair',d:p=>Math.min(Math.max(rbox(p,add(H,V(0,0.3+lift/2,-1.0)),V(6.65,8.2+lift/2,7.6),5.0),-box(p,add(H,V(0,-2.8,5.5)),V(4.8,6.0,3.4)),-box(p,add(H,V(0,-3.8,6.2)),V(10,8,5)),H.y-3.0-p.y),
    Math.max(rbox(p,add(H,V(0,0.3+lift/2,-1.0)),V(6.65,8.2+lift/2,7.6),5.0),ell(p,add(H,V(0,-3.6,-4.4)),V(3.4,3.8,3.2))))});
  P.push({n:'beard',m:'hair',d:p=>Math.max(H.z-1.2-p.z,Math.min(rbox(p,add(H,V(0,-0.9,0.2)),V(6.4,8.1,6.6),4.8),rcone(p,add(H,V(-2.8,-6.6,0.9)),add(H,V(2.8,-6.6,0.9)),2.3,2.3)),p.y-(H.y-4.1)),
    paint:p=>mouthPaint(p,H,mouth)||(box(V(Math.abs(p.x-H.x)+H.x,p.y,p.z),add(H,V(3.1,-4.35,7.3)),V(1.0,0.3,1.4))<0?'skin':null) });
  return P; }
const suitPaint=(p,J)=>{ if(p.z<1.5) return null; const ax=Math.abs(p.x-J.chest.x), y=p.y; if(y>31.2&&y<33.4&&ax<1.15||y>22.5&&y<=31.2&&ax<0.65+(31.2-y)*0.04) return 'tie'; return y>27&&ax<(34.4-y)*0.32?'collar':null; };
const smin=(a,b,k)=>{ const h=Math.max(k-Math.abs(a-b),0)/k; return Math.min(a,b)-h*h*k/4; };
function bodyPieces(J,suit){ const P=[];
  P.push({n:'torso',m:'shirt',d:p=>Math.max(smin(Math.min(rcone(sq(p,J.chest,BODY.sq),add(J.pelvis,V(0,1.4,0)),J.chest,BODY.r1,BODY.r2),rcone(p,J.shoulderL,J.shoulderR,BODY.bar,BODY.bar)),Math.min(rcone(p,add(J.neck,V(0,1.8,-0.3)),J.shoulderL,BODY.col[0],BODY.col[1]),rcone(p,add(J.neck,V(0,1.8,-0.3)),J.shoulderR,BODY.col[0],BODY.col[1])),2),J.pelvis.y-0.6-p.y),...(suit?{paint:p=>suitPaint(p,J)}:{})});
  P.push({n:'hips',m:'pants',d:p=>Math.min(rcone(sq(p,J.pelvis,0.8),add(J.hipL,V(0,0.5,0)),add(J.hipR,V(0,0.5,0)),BODY.hr,BODY.hr),rcone(sq(p,J.pelvis,0.8),add(J.pelvis,V(0,0.6,0)),add(J.pelvis,V(0,-1,0)),BODY.pel[0],BODY.pel[1]))});
  for(const n of 'LR') P.push({n:'thigh'+n,m:'pants',d:p=>rcone(p,J['hip'+n],J['knee'+n],BODY.th[0],BODY.th[1])});
  return P; }
const calf=(J,n)=>add(J['knee'+n],mul(sub(J['ankle'+n],J['knee'+n]),0.32));
function shoeBox(p,J,n,r){ const H=J['heel'+n],T=J['toe'+n],f=nrm(sub(T,H)),u=nrm(sub(V(0,1,0),mul(f,f.y))),w=cross(f,u),d=sub(p,H),a=dot(d,f),b=dot(d,w),c=dot(d,u);
  const a0=-1.9,a1=len(sub(T,H))+1.7,t=Math.max(0,Math.min(1,(a-a0)/(a1-a0))),hw=t<.6?2.05+.45*t/.6:2.5-.5*(t-.6)/.4,top=3.6-1.5*t,c0=-0.6;
  const q=[Math.abs(a-(a0+a1)/2)-((a1-a0)/2-r),Math.abs(b)-(hw-r),Math.abs(c-(c0+top)/2)-((top-c0)/2-r)];
  return Math.hypot(Math.max(q[0],0),Math.max(q[1],0),Math.max(q[2],0))+Math.min(Math.max(q[0],q[1],q[2]),0)-r; }
function shell(J,lift,mouth,suit){ const fine=FINEHAND, P=headPieces(J.head,lift||0,mouth).concat(bodyPieces(J,suit));
  P.push({n:'neck',m:'skin',d:p=>rcone(p,J.neck,J.headBase,2.7,2.0)});
  for(const n of 'LR'){ const S=J['shoulder'+n],E=J['elbow'+n],W=J['wrist'+n];
    P.push({n:'sleeve'+n,m:'shirt',d:p=>rcone(p,S,add(S,mul(sub(E,S),0.3)),BODY.slv[0],BODY.slv[1])});
    P.push({n:'upperArm'+n,m:suit?'shirt':'skin',d:p=>rcone(p,S,E,2.58,2.4)});
    P.push({n:'forearm'+n,m:suit?'shirt':'skin',d:p=>rcone(p,E,W,2.4,fine?0.85:2.1)});
    if(FAR&&!fine){ const Wh=J['handO'+n]||W, tip=J['fingers'+n]; P.push({n:'hand'+n,m:'skin',d:p=>Math.min(rcone(p,add(Wh,mul(sub(tip,Wh),0.3)),tip,2.3,2.0),rcone(p,Wh,add(Wh,mul(sub(tip,Wh),0.3)),0.95,2.3))}); }
    else{
    const k=(i,j)=>J['k'+i+j+n],Wh=J['handO'+n]||W,H0=add(Wh,mul(sub(k(2,0),Wh),0.12)),tip=k(2,3);
    const K2=k(2,0),ha=nrm(sub(K2,Wh)),hb0=sub(k(4,0),k(1,0)),hn=nrm(cross(ha,hb0)),hb=cross(hn,ha),hc=add(add(Wh,mul(sub(K2,Wh),0.5)),mul(ha,0.2)),hl=len(sub(K2,Wh))/2+0.5,palm=p=>{ const d=sub(p,hc),qx=Math.abs(dot(d,ha))-hl,qy=Math.abs(dot(d,hb))-0.8,qz=Math.abs(dot(d,hn))-0.25; return Math.hypot(Math.max(qx,0),Math.max(qy,0),Math.max(qz,0))+Math.min(Math.max(qx,qy,qz),0)-0.2; };
    P.push({n:'hand'+n,m:'skin',d:p=>Math.min(fine?palm(p):rcone(p,add(Wh,mul(sub(k(2,0),Wh),0.3)),tip,2.3,2.0),rcone(p,Wh,H0,0.85,0.85),...[1,2,3,4].map(i=>rcone(p,add(Wh,mul(sub(k(i,0),Wh),0.2)),k(i,0),0.72,DIG[i][4][0]+0.04)),rcone(p,H0,k(0,1),0.8,DIG[0][4][1]))});
    for(let i=0;i<5;i++) for(let j=0;j<3;j++){ const r=DIG[i][4]; P.push({n:'fing'+i+j+n,m:'skin',d:p=>rcone(p,k(i,j),k(i,j+1),r[j]*(fine?0.68:1),r[j+1]*(fine?0.68:1))}); } }
    P.push({n:'shin'+n,m:'pants',d:p=>Math.max(BODY.shoe?smin(rcone(p,J['knee'+n],calf(J,n),BODY.sh[0],BODY.sh[1]),rcone(p,calf(J,n),J['ankle'+n],BODY.sh[1],BODY.sh[2]),1):rcone(p,J['knee'+n],J['ankle'+n],3.34,3.07),J['ankle'+n].y-1.6-p.y)});
    const up=k=>add(J[k+n],V(0,1.9,0));
    P.push({n:'shoe'+n,m:'shoes',d:BODY.shoe?p=>Math.min(shoeBox(p,J,n,BODY.shoe.r),rcone(p,J['ankle'+n],up('heel'),BODY.sh[2]+.3,2.2)):p=>Math.min(rcone(p,up('heel'),add(J['toe'+n],V(0,1.5,0)),2.535,2.08),rcone(p,J['ankle'+n],up('heel'),2.86,2.535))}); }
  return P; }

const FR=(o,m)=>({o,x:m.x,y:m.y,z:m.z});
function limbFrame(a,b,ref,alt){ const y=nrm(sub(b,a)); let z=cross(ref,y); if(len(z)<0.2) z=cross(alt,y); z=nrm(z); return {o:a,x:cross(y,z),y,z}; }
function frameOf(n,B){ const {J,m}=B,side=n.charAt(n.length-1);
  if(/^(head|hair|beard|ear)/.test(n)) return FR(B.head||J.head,m.Rh);
  if(n=='neck'||n=='torso') return FR(J.chest,m.Rc);
  if(n=='hips') return FR(J.pelvis,m.Rp);
  if(/^(sleeve|upperArm)/.test(n)) return limbFrame(J['shoulder'+side],J['elbow'+side],m.Ru.x,m.Ru.z);
  if(/^forearm/.test(n)) return limbFrame(J['elbow'+side],J['wrist'+side],m.Ru.x,m.Ru.z);
  if(/^hand/.test(n)) return m.hf[side];
  if(/^fing/.test(n)){ const i=n.charAt(4),j=+n.charAt(5); return limbFrame(J['k'+i+j+side],J['k'+i+(j+1)+side],m.Ru.x,m.Ru.z); }
  if(/^thigh/.test(n)) return limbFrame(J['hip'+side],J['knee'+side],m.Rb.x,m.Rb.z);
  if(/^shin/.test(n)) return limbFrame(J['knee'+side],J['ankle'+side],m.Rb.x,m.Rb.z);
  return FR(J['ankle'+side],m.foot[side]); }

const FLOOR=[['head',8.6],
  ['headTop',1],['chest',5.4],['spine',5.2],['pelvis',4.4],['neck',2.3]];
for(const n of 'LR') FLOOR.push(['shoulder'+n,2.4],['elbow'+n,2.0],['wrist'+n,1.7],['palm'+n,1.6],['knee'+n,3.0],['ankle'+n,2.6],['heel'+n,0],['ball'+n,0],['toe'+n,-0.6],['fingers'+n,0.4]);
for(const n of 'LR') for(let i=0;i<5;i++) if(i!=2) FLOOR.push(['k'+i+'3'+n,0.3]);
function settle(B,fl,drop,sm){ fl=fl||0; let lift=0; for(const [k,r] of FLOOR) if(B.J[k]) lift=Math.max(lift,r-(B.J[k].y-fl));
  const y=B.J.pelvis.y+lift-fl; let dy=sm?lift:STAND+Math.ceil((y-STAND)/PX-0.05)*PX-y+lift;
  if(drop&&!sm){ let g=1e9; for(const [k,r] of FLOOR) if(B.J[k]) g=Math.min(g,B.J[k].y+dy-r-fl); if(g>0&&g<PX) dy-=g; }
  if(dy){ for(const k in B.J) B.J[k]=add(B.J[k],V(0,dy,0)); if(B.m&&B.m.hf) for(const s in B.m.hf) B.m.hf[s]={...B.m.hf[s],o:add(B.m.hf[s].o,V(0,dy,0))}; } return B; }

function armPoints(J,n){ const E=J['elbow'+n],W=J['wrist'+n];
  return [[E,2.4],[add(E,mul(sub(W,E),0.5)),2.28],[W,2.1],[J['palm'+n],1.2],[J['fingers'+n],0.4]]; }
function clearArms(st,dev){
  // this clearance search probes the pose up to ~13 times a frame; a still Walker's answer never changes, so cache it (owner's "at rest stays still").
  // only a fully still pose (w==0) repeats frame to frame, and then it's phase-independent; while moving, the probe is cheap and unchanged, so skip the cache machinery.
  let key=null;
  if(st.w===0){ key=st.run+'|'+(st.anim||1)+'|'+(st.smooth?1:0)+'|'+(st.bank||0)+'|'+(st.stop?st.stop.t:-1)+'|'+RIGGEN+'|'+(FAR?1:0);
    const c=st._abdC;
    // a hit only lands while fully still, where walkPose's nod smoothing eases toward 0: replay the exact decay the skipped probes would have applied, so the pose is bit-identical.
    if(c&&c.key===key){ if(st.smooth) st.ndS=st.ndS==null?0:st.ndS*Math.pow(0.94,c.n); return c.abd; } }
  const abd={L:0,R:0}; let n=0;
  const clips=(nn,a)=>{ abd[nn]=a; LITE=true; const B=build(walkPose(st,abd),dev); LITE=false; n++; for(const [p,r] of armPoints(B.J,nn)) for(const k of ['torso','hips','thighL','thighR']) if(pieceD(k,B,p)<r+0.05) return true; return false; };
  for(const nn of 'LR'){ let lo=0,hi=40*D; if(!clips(nn,0)){ abd[nn]=0; continue; }
    for(let i=0;i<(FAR?6:9);i++){ const a=(lo+hi)/2; if(clips(nn,a)) lo=a; else hi=a; } abd[nn]=hi; }
  if(key!=null) st._abdC={key,abd,n}; return abd; }
const ARMBODY=['torso','hips','thighL','thighR'];
function armClips(B,n){ for(const [p,r] of armPoints(B.J,n)) for(const k of ARMBODY) if(pieceD(k,B,p)<r+0.02) return true; return false; }
function clearPose(P,dev){ let B=build(P,dev);
  for(const n of 'LR'){ if(!armClips(B,n)) continue; const b0=[P[n].ua[1],P[n].fa[1]],sgn=1; let lo=0,hi=45*D;
    const at=(e,lite)=>{ P[n].ua[1]=b0[0]+e; P[n].fa[1]=b0[1]+e; LITE=!!lite; const b=build(P,dev); LITE=false; return b; };
    for(let i=0;i<(FAR?6:8);i++){ const e=(lo+hi)/2; if(armClips(at(e,true),n)) lo=e; else hi=e; } B=at(hi); }
  return B; }
function clearUpright(){ const st={ph:0,w:0},abd={L:0,R:0},body=bodyPieces(build(walkPose(st,null),null).J);
  const clips=(n,a)=>{ abd[n]=a; const {J}=build(walkPose(st,abd),null); for(const [p,r] of armPoints(J,n)) for(const b of body) if(b.d(p)<r+0.05) return true; return false; };
  for(const n of 'LR'){ let lo=0,hi=40*D; if(!clips(n,0)){ abd[n]=0; continue; } for(let i=0;i<9;i++){ const a=(lo+hi)/2; if(clips(n,a)) lo=a; else hi=a; } abd[n]=hi; }
  return abd; }
let REST=null; const restOf=()=>REST||(REST=(()=>{ const B=build(walkPose({ph:0,w:0},clearUpright()),null),d={}; for(const p of shell(B.J)) d[p.n]=p.d; return {B,d}; })());
function pieceD(n,B,p){ const R=restOf(),F=frameOf(n,B),Fr=frameOf(n,R.B),l=sub(p,F.o); return R.d[n](add(Fr.o,add(add(mul(Fr.x,dot(l,F.x)),mul(Fr.y,dot(l,F.y))),mul(Fr.z,dot(l,F.z))))); }
function overlaps(B,why){ const {J}=B; let n=0,worst=0;
  const test=(p,r,names,what)=>{ for(const k of names){ const d=pieceD(k,B,p)-r; if(d<0){ n++; worst=Math.min(worst,d); if(why) why.push(what+'>'+k+' '+d.toFixed(2)); } } };
  for(const s of 'LR'){ armPoints(J,s).forEach(([p,r],i)=>test(p,r,['torso','hips','thighL','thighR','head','beard'],'arm'+s+i));
    const o=s=='L'?'R':'L',K=J['knee'+s],A=J['ankle'+s];
    for(const [p,r,w] of [[K,3.0,'knee'],[add(K,mul(sub(A,K),0.5)),2.8,'shin'],[A,2.6,'ankle']]) test(p,r,['thigh'+o,'shin'+o,'shoe'+o],w+s);
    test(K,3.0,['torso'],'knee'+s); }
  return {n,worst}; }

const SL=[FOOTX,ANKLE,0],SR=[-FOOTX,ANKLE,0];
const GUARD={root:[0,17.3,0],pyaw:-5,cyaw:-8,nod:4,L:{ua:[48,14],fa:[150,-10],fist:1,ik:[FOOTX,ANKLE,1]},R:{ua:[42,16],fa:[148,-12],fist:1,ik:[-FOOTX,ANKLE,-1]}};
const BGUARD={root:[0,17,0],pyaw:-6,cyaw:-10,nod:8,L:{ua:[64,18],fa:[164,-16],fist:1,ik:[FOOTX,ANKLE,1]},R:{ua:[58,20],fa:[162,-18],fist:1,ik:[-FOOTX,ANKLE,-1]}};
const STANDK={root:[0,STAND,0],yaw:0,roll:0,pitch:0,pv:0,pyaw:0,cyaw:0,bend:0,side:0,nod:0,look:0,L:{ua:[9,8],fa:[19,8],fist:0,ik:SL,foot:0},R:{ua:[9,8],fa:[19,8],fist:0,ik:SR,foot:0}};
const ANG=['yaw','roll','pitch','pyaw','cyaw','bend','side','nod','look'];
const EASE={io:smooth,lin:t=>t,in:t=>t*t,out:t=>1-(1-t)*(1-t)};
function apply(P,c){ P=JSON.parse(JSON.stringify(P));
  for(const k in c){ if(k=='L'||k=='R'){ const g=P[k],x=c[k]; for(const j in x){ if(j=='ik'){ g.ik=V(...x.ik); } else if(j=='th'||j=='sh'){ g[j]=x[j].map(a=>a*D); delete g.ik; } else if(j=='ua'||j=='fa') g[j]=x[j].map(a=>a*D); else if(j=='foot') g.foot=x.foot*D; else g[j]=x[j]; } }
    else if(k=='root') P.root=V(...c.root); else if(ANG.includes(k)) P[k]=c[k]*D; else P[k]=c[k]; }
  for(const n of 'LR') if(P[n].ik) legIK(P,n,n=='L'?1:-1,P[n].ik,P[n].kp);
  return P; }
const START=(()=>{ const P=neutral(); P.L.ik=V(...SL); P.R.ik=V(...SR); legIK(P,'L',1,P.L.ik); legIK(P,'R',-1,P.R.ik); return P; })();
function move(def){ let P=START; def.k=def.keys.map(([t,c,e])=>({t,P:(P=apply(P,c||{})),e:EASE[e||'io']})); def.dur=def.dur||def.k[def.k.length-1].t; return def; }
function spinTable(T,turns,tuck){ const N=240,I=u=>1-0.55*keyAt(tuck,u),tab=[0]; let a=0; for(let i=1;i<=N;i++){ a+=1/I(i/N); tab.push(a); } return tab.map(v=>v/tab[N]*turns*2*Math.PI); }
const keyAt=(ks,u)=>{ if(u<=ks[0][0]) return ks[0][1]; for(let i=1;i<ks.length;i++) if(u<=ks[i][0]){ const [a,va]=ks[i-1],[b,vb]=ks[i]; return lerp(va,vb,smooth((u-a)/(b-a))); } return ks[ks.length-1][1]; };
function jumpMove(o){ const g=o.g||G,T=(o.v0+Math.sqrt(o.v0*o.v0+2*g*(o.drop||0)))/g,t0=o.t0,at=u=>t0+u*T,keys=[];
  for(const [t,c,e] of o.keys) keys.push([typeof t=='string'?at(+t.slice(1)):t>=100?at(1)+(t-100):t,c,e]);
  const d=move({...o,keys,src:o,air:{t0,T,v0:o.v0,g,c:o.pivot||0,vz:o.vz||0,spin:o.turns?spinTable(T,o.turns,o.tuck):null}});
  if(o.drop) d.kl=d.k.map(K=>Math.abs(K.t-at(1))<1e-9?{...K,P:{...K.P,root:V(K.P.root.x,K.P.root.y-o.drop,K.P.root.z)}}:K);
  return d; }
function topple(){ const tab=[]; let a=3*D,w=0.7,t=0; const h=1/240; while(a<84*D){ w+=G/26*Math.sin(a)*h; a+=w*h; t+=h; tab.push(a); } return {T:t,tab}; }
const FALL=topple();
const air=(c)=>c;
const MOCAP=__DATA__("data/moves.json");
const GAIT=__DATA__("data/gait.json"), GK=(G,u,f)=>{ const k=G.keys,n=k.length,x=(((u%1)+1)%1)*n,i=Math.floor(x),t=x-i,a=f(k[i]),b=f(k[(i+1)%n]); return a+(b-a)*t; }, gv=(u,r,f)=>GK(GAIT.walk,u,f)*(1-r)+GK(GAIT.run,u,f)*r;
const MOVES={
  jump:MOCAP&&MOCAP.jump?jumpMove({v0:87,t0:MOCAP.jump.t0,airv:{J:'airPunch',K:'flyingKick'},keys:MOCAP.jump.keys}):jumpMove({v0:87,t0:0.16,airv:{J:'airPunch',K:'flyingKick'},keys:[
    [0,{}],[0.1,{root:[0,14.5,0.5],bend:18,nod:6,L:{ua:[-25,30],fa:[-15,30]},R:{ua:[-25,30],fa:[-15,30]}}],
    [0.16,{root:[0,STAND,0],bend:0,nod:0,L:{ua:[60,14],fa:[72,14],th:[0,0],sh:[0,0],foot:-30},R:{ua:[60,14],fa:[72,14],th:[0,0],sh:[0,0],foot:-30}},'in'],
    ['u0.25',{L:{ua:[140,20],fa:[150,20],th:[30,4],sh:[-25,4],foot:-15},R:{ua:[140,20],fa:[150,20],th:[30,4],sh:[-25,4],foot:-15}}],
    ['u0.6',{L:{ua:[100,26],fa:[106,26],th:[42,5],sh:[-30,5]},R:{ua:[100,26],fa:[106,26],th:[42,5],sh:[-30,5]}}],
    ['u0.9',{L:{ua:[62,30],fa:[72,30],th:[12,2],sh:[0,2],foot:8},R:{ua:[62,30],fa:[72,30],th:[12,2],sh:[0,2],foot:8}}],
    ['u1',{L:{ik:SL,foot:0},R:{ik:SR,foot:0}}],
    [100.09,{root:[0,14,0.5],bend:16,L:{ua:[40,26],fa:[56,26]},R:{ua:[40,26],fa:[56,26]}},'out'],
    [100.34,{root:[0,STAND,0],bend:0,L:{ua:[9,8],fa:[19,8]},R:{ua:[9,8],fa:[19,8]}}]]}),
  runJump:jumpMove({v0:70,t0:0.06,ph:0.25,keys:[[0,{}],
    [0.06,{root:[0,STAND-1.2,0.6],bend:10,nod:-2,L:{th:[-24,2],sh:[-8,2],foot:-24,ua:[38,14],fa:[84,14]},R:{th:[52,4],sh:[-72,4],foot:-10,ua:[-34,14],fa:[46,14]}},'in'],
    ['u0.45',{root:[0,STAND,0.4],bend:9,nod:-2,L:{th:[-38,2],sh:[-64,2],foot:-28,ua:[30,14],fa:[80,14]},R:{th:[62,4],sh:[-44,4],foot:-4,ua:[-28,14],fa:[50,14]}}],
    ['u0.85',{root:[0,STAND,0.4],bend:8,L:{th:[-22,2],sh:[-74,2],foot:-20,ua:[22,14],fa:[76,14]},R:{th:[34,3],sh:[-12,3],foot:6,ua:[-16,14],fa:[56,14]}}],
    ['u1',{root:[0,STAND-.6,0.4],R:{ik:[-FOOTX,ANKLE,2.5],foot:0}}],
    [100.07,{root:[0,STAND-1.4,0.5],bend:10,L:{th:[2,2],sh:[-80,2]}},'out']]}),
  jab:move({lead:'R',combo:{J:'cross',K:'frontKick'},window:[0.2,0.42],keys:[[0,{}],[0.08,GUARD],
    [0.15,{root:[0,17.2,1],cyaw:-22,pyaw:-9,nod:0,L:{ua:[86,3],fa:[86,-1]}},'out'],[0.21,{}],[0.32,GUARD],[0.42,{}]]}),
  cross:move({lead:'R',combo:{J:'uppercut',K:'frontKick'},window:[0.22,0.44],keys:[[0,GUARD],
    [0.16,{root:[0,17,1.5],cyaw:26,pyaw:12,nod:0,R:{ua:[86,-1],fa:[86,-5],foot:0}},'out'],[0.23,{}],[0.34,GUARD],[0.44,{}]]}),
  uppercut:move({lead:'R',combo:{J:'jab',K:'roundhouse'},window:[0.28,0.5],keys:[[0,GUARD],
    [0.12,{root:[0,15.6,0.5],bend:9,cyaw:-14,L:{ua:[28,10],fa:[72,-4]}}],
    [0.22,{root:[0,17.6,1],bend:-6,nod:-6,L:{ua:[72,6],fa:[172,-6]}},'out'],[0.3,{}],[0.42,GUARD],[0.5,{}]]}),
  slap:move({lead:'R',window:[0.3,0.5],keys:[[0,{}],[0.11,{root:[0,17.2,0.5],cyaw:-26,pyaw:-9,nod:2,R:{ua:[76,-58],fa:[70,-62],fist:0}}],
    [0.2,{root:[0,17.2,1],cyaw:30,pyaw:13,nod:0,R:{ua:[88,42],fa:[84,46],fist:0}},'out'],[0.28,{}],[0.5,{}]]}),
  frontKick:move({stop:20,keep:.35,ex:.5,combo:{K:'roundhouse',J:'jab'},window:[0.46,0.7],keys:[[0,{}],[0.06,GUARD],
    [0.16,{root:[0.9,17.4,0],bend:-11,R:{th:[62,8],sh:[-22,8],foot:0}}],
    [0.26,{bend:-17,R:{th:[62,4],sh:[60,4],foot:28}},'out'],[0.34,{}],
    [0.46,{bend:-11,R:{th:[62,8],sh:[-22,8],foot:0}}],[0.58,{root:[0,17.3,0],bend:0,R:{ik:[-FOOTX,ANKLE,-1]}}],[0.7,GUARD]]}),
  roundhouse:move({stop:20,keep:.3,ex:.62,combo:{J:'jab',K:'frontKick'},window:[0.62,0.82],keys:(()=>{ const r=(y,lean)=>{ const t=y*D; return [FOOTX-3.2*Math.cos(t)+lean*Math.cos(t),17.3,3.2*Math.sin(t)-lean*Math.sin(t)]; };
    return [[0,GUARD],[0.12,{root:r(55,0.6),yaw:55,roll:6,L:{ik:[FOOTX,ANKLE,0]},R:{th:[70,28],sh:[-12,28]}}],
      [0.22,{root:r(130,1),yaw:130,roll:16,R:{th:[30,70],sh:[30,70],foot:10}},'lin'],[0.32,{root:r(200,1.2),yaw:200,roll:22,R:{th:[12,86],sh:[12,86]}},'lin'],
      [0.44,{root:r(280,1.2),yaw:280,roll:20,R:{th:[16,84],sh:[16,84]}},'lin'],[0.56,{root:r(340,0.8),yaw:340,roll:10,R:{th:[60,24],sh:[-18,24],foot:0}},'lin'],
      [0.68,{root:r(360,0),yaw:360,roll:0,R:{ik:[-FOOTX,ANKLE,-1]}}],[0.82,{...GUARD,yaw:360}]]; })()}),
  backflip:jumpMove({v0:105,t0:0.2,turns:-1,pivot:9,vz:-12,tuck:[[0,0],[0.18,1],[0.6,1],[0.84,0],[1,0]],keys:[
    [0,{}],[0.1,{root:[0,13.6,0],bend:24,nod:6,L:{ua:[-30,12],fa:[-20,12]},R:{ua:[-30,12],fa:[-20,12]}}],
    [0.2,{root:[0,STAND,0],bend:-6,nod:-8,L:{ua:[100,24],fa:[110,24],th:[0,0],sh:[0,0],foot:-30},R:{ua:[100,24],fa:[110,24],th:[0,0],sh:[0,0],foot:-30}},'in'],
    ['u0.18',{bend:14,nod:6,L:{ua:[64,24],fa:[84,24],th:[95,13],sh:[-32,13],foot:-20},R:{ua:[64,24],fa:[84,24],th:[95,13],sh:[-32,13],foot:-20}}],
    ['u0.6',{}],['u0.84',{bend:0,nod:0,L:{ua:[95,34],fa:[95,34],th:[12,3],sh:[0,3],foot:0},R:{ua:[95,34],fa:[95,34],th:[12,3],sh:[0,3],foot:0}}],
    ['u1',{L:{ik:SL},R:{ik:SR}}],[100.1,{root:[0,13.8,0.5],bend:20,L:{ua:[70,30],fa:[80,30]},R:{ua:[70,30],fa:[80,30]}},'out'],
    [100.38,{root:[0,STAND,0],bend:0,L:{ua:[9,8],fa:[19,8]},R:{ua:[9,8],fa:[19,8]}}]]}),
  frontflip:jumpMove({v0:105,t0:0.2,turns:1,pivot:9,vz:24,tuck:[[0,0],[0.16,1],[0.62,1],[0.86,0],[1,0]],keys:[
    [0,{}],[0.1,{root:[0,13.6,0.5],bend:30,nod:10,L:{ua:[-30,12],fa:[-20,12]},R:{ua:[-30,12],fa:[-20,12]}}],
    [0.2,{root:[0,STAND,0],bend:10,L:{ua:[100,24],fa:[110,24],th:[0,0],sh:[0,0],foot:-30},R:{ua:[100,24],fa:[110,24],th:[0,0],sh:[0,0],foot:-30}},'in'],
    ['u0.16',{bend:24,nod:12,L:{ua:[62,24],fa:[82,24],th:[96,13],sh:[-32,13],foot:-20},R:{ua:[62,24],fa:[82,24],th:[96,13],sh:[-32,13],foot:-20}}],
    ['u0.62',{}],['u0.86',{bend:4,nod:0,L:{ua:[100,34],fa:[100,34],th:[14,3],sh:[0,3],foot:0},R:{ua:[100,34],fa:[100,34],th:[14,3],sh:[0,3],foot:0}}],
    ['u1',{bend:0,L:{ik:SL},R:{ik:SR}}],[100.1,{root:[0,13.8,0.5],bend:22,L:{ua:[60,30],fa:[72,30]},R:{ua:[60,30],fa:[72,30]}},'out'],
    [100.38,{root:[0,STAND,0],bend:0,L:{ua:[9,8],fa:[19,8]},R:{ua:[9,8],fa:[19,8]}}]]}),
  fall:move({topple:FALL,travel:true,keep:0,ex:FALL.T+2.15,keys:(()=>{ const T=FALL.T; return [[0,{}],
    [T*0.35,{nod:-10,L:{ua:[60,20],fa:[70,20]},R:{ua:[40,20],fa:[50,20],th:[-20,2],sh:[-50,2],foot:-30}}],
    [T*0.8,{nod:-24,L:{ua:[100,30],fa:[100,26]},R:{ua:[100,30],fa:[100,26]}}],
    [T,{root:[0,1.3,17.9],pitch:84,L:{th:[0,0],sh:[0,0],foot:-50},R:{th:[-6,2],sh:[-10,2],foot:-50}}],
    [T+0.18,{root:[0,1,18.3],pitch:90,nod:-30,L:{ua:[86,40],fa:[30,40],foot:-70},R:{ua:[86,40],fa:[30,40],foot:-70}},'out'],
    [T+1.0,{nod:-36}],
    [T+1.35,{root:[0,6,16.5],pitch:68,nod:-30,L:{ua:[92,24],fa:[92,24]},R:{ua:[92,24],fa:[92,24]}}],
    [T+1.75,{root:[0,9.5,11],pitch:38,nod:-14,L:{th:[-38,6],sh:[-128,6],foot:-60},R:{th:[-38,6],sh:[-128,6],foot:-60}}],
    [T+2.15,{root:[0,10.5,8.5],pitch:0,bend:16,nod:0,L:{th:[88,4],sh:[0,4],foot:0,ua:[40,20],fa:[60,10]},R:{th:[0,2],sh:[-92,2],foot:-60,ua:[20,12],fa:[30,12]}}],
    [T+2.6,{root:[0,STAND,8.5],bend:0,L:{ik:[FOOTX,ANKLE,9],ua:[9,8],fa:[19,8]},R:{ik:[-FOOTX,ANKLE,8.5],ua:[9,8],fa:[19,8]}}]]; })()}),
  roll:move({travel:true,keep:.8,ex:.92,keys:[[0,{}],
    [0.16,{root:[0,11,2],bend:36,nod:26,L:{ua:[84,24],fa:[84,24]},R:{ua:[84,24],fa:[84,24]}}],
    [0.28,{root:[0,8,6],pitch:45,bend:30,nod:40,L:{th:[80,12],sh:[-30,12],ua:[70,30],fa:[80,30]},R:{th:[80,12],sh:[-30,12],ua:[70,30],fa:[80,30]}}],
    [0.46,{root:[0,6,12],pitch:150,L:{th:[105,12],sh:[-25,12]},R:{th:[105,12],sh:[-25,12]}},'lin'],
    [0.64,{root:[0,6,19],pitch:255},'lin'],
    [0.8,{root:[0,8,24],pitch:330,bend:24,nod:20},'lin'],
    [0.92,{root:[0,11,27],pitch:360,bend:20,nod:6,L:{ik:[FOOTX,ANKLE,28],ua:[60,20],fa:[70,20]},R:{ik:[-FOOTX,ANKLE,28],ua:[60,20],fa:[70,20]}}],
    [1.12,{root:[0,STAND,28],bend:0,nod:0,L:{ua:[9,8],fa:[19,8]},R:{ua:[9,8],fa:[19,8]}}]]}),
  legSweep:move({blend:0.14,stop:20,keep:.2,ex:.6,keys:(()=>{ const r=y=>{ const t=y*D; return [FOOTX-3.2*Math.cos(t),9,3.2*Math.sin(t)]; }, LEG=(y,d=12)=>{ const t=y*D; return {ik:[FOOTX-d*Math.cos(t),ANKLE,d*Math.sin(t)],foot:0}; };
    return [[0,{root:[0,10.5,-1],bend:24,nod:-10,L:{ua:[58,16],fa:[80,10]},R:{ua:[58,16],fa:[80,10]}}],[0.1,{root:r(0),bend:30,nod:-4,L:{ik:[FOOTX,ANKLE,0],ua:[30,40],fa:[50,30],fist:1},R:{...LEG(0),ua:[30,40],fa:[50,30],fist:1}}],
      [0.2,{root:r(90),yaw:90,R:LEG(90)},'lin'],[0.3,{root:r(180),yaw:180,R:LEG(180)},'lin'],[0.4,{root:r(270),yaw:270,R:LEG(270)},'lin'],
      [0.52,{root:r(350),yaw:350,R:LEG(350,8)}],[0.64,{root:[0,13,0],yaw:360,bend:12,R:{ik:[-FOOTX,ANKLE,-1]}}],[0.82,{...GUARD,yaw:360}]]; })()}),
  block:move({hold:0.12,keys:[[0,GUARD],[0.12,{root:[0,16.4,-0.8],bend:6,nod:10,cyaw:0,pyaw:0,L:{ua:[100,26],fa:[168,-18],fist:1},R:{ua:[96,26],fa:[170,-18],fist:1}},'out'],[0.34,GUARD]]}),
  crouch:move({stop:1e3,keep:.2,ex:.36,combo:{J:'uppercut',K:'legSweep'},window:[0,0.5],hold:0.22,keys:[[0,{}],[0.22,{root:[0,10.5,-1],bend:24,nod:-10,L:{ua:[58,16],fa:[80,10]},R:{ua:[58,16],fa:[80,10]}}],[0.5,{root:[0,STAND,0],bend:0,nod:0,L:{ua:[9,8],fa:[19,8]},R:{ua:[9,8],fa:[19,8]}}]]}),
  guard:move({lead:'R',hold:0.12,keys:[[0,GUARD],[0.12,BGUARD,'out'],[0.4,{}]]}),
  hook:move({lead:'R',window:[0.24,0.48],keys:[[0,BGUARD],[0.12,{root:[0,17.2,0.6],cyaw:-18,pyaw:-8,nod:0,L:{ua:[70,-30],fa:[110,-25],fist:1}}],
    [0.2,{root:[0,17,1],cyaw:34,pyaw:16,L:{ua:[88,-48],fa:[96,-10],fist:1}},'out'],[0.26,{}],[0.38,BGUARD],[0.48,{}]]}),
  flinch:move({lead:'R',keys:[[0,BGUARD],[0.07,{root:[0,17.6,-1.2],nod:-16,cyaw:14,bend:-7},'out'],[0.32,BGUARD],[0.4,{}]]}),
  wave:move({lead:'R',keys:[[0,{}],[0.25,{look:-8,nod:-4,R:{ua:[150,34],fa:[168,22]}}],[0.4,{R:{fa:[146,42]}}],[0.55,{R:{fa:[176,8]}}],[0.7,{R:{fa:[146,42]}}],[0.85,{R:{fa:[176,8]}}],[1.0,{R:{fa:[146,42]}}],[1.2,{R:{fa:[168,22]}}],[1.5,{look:0,nod:0,R:{ua:[9,8],fa:[19,8]}}]]}),
};
MOVES.cartwheel=(()=>{ const C=(t,roll,yaw,side,z,a,b,l,r,o)=>[t,{root:[0,STAND,z],roll,yaw,side,L:{ua:[0,a],fa:[0,a],th:[0,l],sh:[0,l],foot:0},R:{ua:[0,b],fa:[0,b],th:[0,r],sh:[0,r],foot:0},...o}];
  const m=move({travel:true,keep:.1,ex:.86,keys:[[0,{}],C(.1,8,-70,10,6,150,150,28,-4,{bend:4}),C(.22,62,-90,35,17,112,165,38,22,{nod:-20}),C(.34,122,-90,35,27,150,175,45,40,{nod:-45,bend:-10}),
    C(.46,182,-90,14,36,168,182,45,45,{nod:-55,bend:-14}),C(.58,248,-90,-8,45,176,168,40,52,{nod:-40,bend:-8}),C(.7,308,-84,-18,53,150,118,28,50,{nod:-10,bend:0}),C(.82,360,-40,-4,58,60,50,8,10,{nod:0,bend:6}),
    [.98,{root:[0,STAND,60],yaw:0,side:0,bend:0,L:{ik:[FOOTX,ANKLE,62],ua:[9,8],fa:[19,8]},R:{ik:[-FOOTX,ANKLE,58],ua:[9,8],fa:[19,8]}}]]}),k=[],n=Math.round(m.dur/.04),SUP=/^(palm|fingers|heel|ball|toe)/; let r0=0,off=0,pq=null,pw=0;
  for(let i=0;i<=n;i++){ const t=m.dur*i/n,P=moveAtOf({def:m,t}); P.roll=r0=r0+wrap(P.roll-r0);
    if(i){ const J=build(P).J; let lo=1e9,q=null,qy=1e9; for(const [j,r] of FLOOR) if(J[j]){ const y=J[j].y-r; lo=Math.min(lo,y); if(SUP.test(j)&&y<qy){ qy=y; q=j; } }
      if(q===pq) off=pw-J[q].z; pq=q; pw=J[q].z+off; P.root=V(P.root.x,P.root.y-lo,P.root.z+off); }
    k.push({t,P,e:smooth}); }
  for(let i=n-1;i>0;i--) k[i].P.root=V(k[i].P.root.x,Math.max(k[i].P.root.y,k[i+1].P.root.y-3.6),k[i].P.root.z);
  m.k=k; m.slow=.75; m.again=1; return m; })();
const DIVES={};
function diveMove(drop){ const k=Math.round(drop); if(DIVES[k]) return DIVES[k]; const A=(ua,fa,c)=>({L:{ua,fa,...c},R:{ua,fa,...c}});
  return DIVES[k]=jumpMove({v0:95,t0:0.6,turns:0.42,pivot:9,vz:16,drop:k,entry:true,
    load:[[0,0],[0.16,0.4],[0.3,0],[0.46,1],[0.6,0],[1,0]],tuck:[[0,0],[0.25,0.6],[0.55,0.6],[0.85,0],[1,0]],keys:[
    [0,{}],[0.16,{root:[0,16.4,0.4],bend:10,...A([-35,16],[-25,16])}],[0.3,{root:[0,STAND,0],bend:0,...A([70,14],[80,14],{foot:-15})}],
    [0.46,{root:[0,13.8,0.6],bend:22,nod:8,...A([-45,18],[-35,18],{foot:0})}],
    [0.6,{root:[0,STAND,0],bend:-4,nod:-6,...A([165,17],[170,17],{th:[0,0],sh:[0,0],foot:-30})},'in'],
    ['u0.25',{bend:40,nod:20,...A([115,12],[110,12],{th:[85,4],sh:[85,4],foot:-40})}],['u0.55',{}],
    ['u0.85',{bend:0,nod:6,...A([178,17],[180,16],{th:[0,2],sh:[0,2],foot:-50})}],['u1',{}]]}); }
const CANNONS={};
function cannonMove(drop){ const k=Math.round(drop); if(CANNONS[k]) return CANNONS[k]; const A=(ua,fa,c)=>({L:{ua,fa,...c},R:{ua,fa,...c}});
  return CANNONS[k]=jumpMove({v0:92,t0:0.3,vz:34,drop:k,entry:true,tuck:[[0,0],[0.2,1],[0.8,1],[1,0.6]],keys:[
    [0,{}],[0.14,{root:[0,14,0.5],bend:24,nod:8,...A([-30,20],[-20,20])}],
    [0.3,{root:[0,STAND,0],bend:-6,nod:-6,...A([80,20],[90,20],{th:[0,0],sh:[0,0],foot:-30})},'in'],
    ['u0.3',{bend:46,nod:30,...A([60,30],[130,24],{th:[120,14],sh:[-130,10],foot:-20})}],['u0.75',{}],
    ['u1',{bend:20,nod:10,...A([40,24],[60,24],{th:[60,10],sh:[-50,8],foot:-30})}]]}); }
const climbOut=()=>{ const A=(ua,fa,c)=>({L:{ua,fa,...c},R:{ua,fa,...c}}); return move({deck:true,travel:true,blend:0.25,below:44,keys:[[0,{root:[0,-25,0],nod:-10,...A([60,40],[80,30],{th:[40,22],sh:[-40,18],foot:-25})}],
  [0.3,{root:[0,-20,-1],...A([168,26],[174,20],{th:[20,10],sh:[-20,10]})}],
  [0.65,{root:[0,-6,-2],bend:12,...A([40,32],[100,22])}],
  [0.95,{root:[0,3,0],bend:34,...A([8,22],[8,22]),L:{ua:[8,22],fa:[8,22],th:[100,8],sh:[-24,8],foot:0}}],
  [1.25,{root:[0,12,3],bend:20,L:{ik:[FOOTX,ANKLE,5]},R:{th:[60,6],sh:[-40,6]}}],
  [1.6,{root:[0,STAND,6],bend:0,nod:0,L:{ik:[FOOTX,ANKLE,6],ua:[9,8],fa:[19,8]},R:{ik:[-FOOTX,ANKLE,6],ua:[9,8],fa:[19,8],foot:0}}]]}); };
MOVES.climb=climbOut();
const grabMove=n=>{ const s=n=='R'?1:-1; return move({keys:[[0,{}],[0.24,{bend:5,nod:-4,cyaw:10*s,[n]:{ua:[104,6],fa:[108,2]}},'out'],[0.3,{[n]:{fist:1}}],
  [0.48,{root:[0,STAND,0.8],bend:9,cyaw:16*s,[n]:{ua:[94,18],fa:[96,14]}}],[0.58,{[n]:{fist:0}}],[0.78,{root:[0,STAND,0],bend:0,nod:0,cyaw:0,[n]:{ua:[9,8],fa:[19,8]}}]]}); };
MOVES.grab=grabMove('R'); MOVES.grabL=grabMove('L');
MOVES.carry=move({hold:0.24,keys:[[0,{}],[0.24,{R:{ua:[104,6],fa:[108,2],fist:1}},'out'],[0.5,{R:{ua:[9,8],fa:[19,8],fist:0}}]]});
MOVES.mantle=(()=>{ const m=climbOut(); m.deck=false; return m; })();
// THE CLIMB FROM MOTION CAPTURE (owner, 8 Nov 2026: "lets redo the climbing animation, based it on real climbing animations"; his pick CMU: data/moves.json climb):
// a ladder climber's cycle, one cycle a rise of height climbed (up or down), its second half the first mirrored; on bark each hand and foot holds where climbHolds put it
const CLIMB=MOCAP&&MOCAP.climb?(()=>{ const C=MOCAP.climb, mir=c=>{ const m={...c,root:[-c.root[0],c.root[1],c.root[2]],L:c.R,R:c.L}; for(const k of ['yaw','roll','side','cyaw']) m[k]=-c[k]; return m; };
  const P=[...C.keys,...C.keys.map(mir)].map(c=>apply(neutral(),c)), up=Math.max(0,...P.map(p=>{ const J=build(p,null).J; return Math.max(...FLOOR.map(([k,r])=>J[k]?r-J[k].y:0)); }));   // (raised so no foot dips under his floor)
  for(const p of P) p.root=V(p.root.x,p.root.y+up,p.root.z); const at={}; for(const k in C.at) at[k]={...C.at[k],lo:C.at[k].lo+up,hi:C.at[k].hi+up};
  return {...C,at,P,gap:(at.hL.z+1.3+at.fL.z+2.6)/2}; })():null;   // gap: how far ahead the bark is, between where his hands and his feet hold (gripIK's offsets)
const reaching=(a,f)=>((f-a.t0)%1+1)%1<((a.t1-a.t0)%1+1)%1;
function climbPose(st){ const C=st.climb,per=C.per||CLIMB.rise,f=(((C.ph??C.z)/per)%1+1)%1,n=CLIMB.P.length,x=f*n,i=Math.floor(x),M=mix(CLIMB.P[i],CLIMB.P[(i+1)%n],x-i);
  M.root=V(M.root.x,M.root.y+C.z,M.root.z); M.L.fist=reaching(CLIMB.at.hL,f)?.2:1; M.R.fist=reaching(CLIMB.at.hR,f)?.2:1;
  if(C.grip&&st.world) gripIK(st,M); return M; }
// the holds on bark, from the height climbed: a limb's n-th hold is where the recording has it as its n-th reach ends (hold(x, y): the page finds the bark
// there, x out and y up from the body); between its reach's t0 and t1 it goes from one hold to the next, arcing out from the bark, the hand open. Kept
// still part way, it finishes the reach (or goes back), and takes it up again as the climb goes on
function climbHolds(st,dt,hold){ const C=st.climb,A=CLIMB.at,per=C.per||CLIMB.rise,P=C.ph/per,G=C.gs||(C.gs={P,L:{},ov:0}),ov0=G.ov;
  G.ov=clamp(G.ov+(P!==G.P?-dt/.15:dt/.3),0,1); G.P=P;
  for(const k in A){ const a=A[k],S=G.L[k]||(G.L[k]={H:{}}),h=k[0]=='h',w=((a.t1-a.t0)%1+1)%1,u=P-a.t1,m=Math.floor(u),q=u-m;
    const at=j=>S.H[j]||(S.H[j]=hold(a.x,(j+a.t1)*per+a.hi+(h?1.6:-1.2)-C.ph));
    let e=q>1-w?(q-1+w)/w:0; if(!ov0) S.end=Math.round(e); e+=(S.end-e)*G.ov; const F=at(m); let p=F;
    if(e>0){ const T=at(m+1),s=e*e*(3-2*e),r=Math.sin(Math.PI*e)*Math.min(1.5,.15*Math.hypot(T.x-F.x,T.y-F.y,T.z-F.z)),l=(x,y)=>x+(y-x)*s;
      p=e>=1?T:{x:l(F.x,T.x)+T.nx*r,y:l(F.y,T.y),z:l(F.z,T.z)+T.nz*r,nx:T.nx,ny:T.ny,nz:T.nz}; }
    for(const j in S.H) if(+j!==m&&+j!==m+1) delete S.H[j];
    S.p=p; S.e=e; S.hf=h?1-.8*Math.sin(Math.PI*e):1; }
  C.grip={L:{h:G.L.hL.p,f:G.L.fL.p,hf:G.L.hL.hf},R:{h:G.L.hR.p,f:G.L.fR.p,hf:G.L.hR.hf}}; return C.grip; }
const PICKS={};
function pickMove(h,z){ const k=clamp(Math.round(h/2)*2,0,50),q=clamp(Math.round(z/2)*2,4,16),key=k+','+q; if(PICKS[key]) return PICKS[key];
  const G=(d,a)=>({root:[0,STAND-7*d,-1.5*d],bend:44*d,nod:12*d,L:{ik:[FOOTX,ANKLE,2.5*d],ua:[9+30*d,14],fa:[19+60*d,10]},R:{ik:[-FOOTX,ANKLE,-2.5*d],ua:[a,-6],fa:[a+8,-8],fist:0}});
  let best=null;
  for(let d=0;d<=1.001&&!(best&&best.e<2);d+=.25) for(let a=-40;a<=170;a+=5){ const J=build(apply(START,G(d,a))).J,f=J.fingersR,e=Math.abs(f.y-k-1)+Math.abs(f.z-q)*.6+d; if(!best||e<best.e) best={e,d,a}; }
  return PICKS[key]=move({lead:'R',keep:.1,ex:.5,keys:[[0,{}],[.3,G(best.d,best.a)],[.36,{R:{fist:1}}],
    [.62,{root:[0,STAND,0],bend:0,nod:0,L:{ik:SL,ua:[9,8],fa:[19,8]},R:{ik:SR,ua:[9,8],fa:[19,8],fist:0}}]]}); }
const UPS={},DOWNS={},LEAPS={};
function upMove(h){ const k=Math.round(h); if(UPS[k]) return UPS[k]; const lo=STAND-k, R=(ua,fa)=>({ua:[ua,12],fa:[fa,10]});
  return UPS[k]=move({travel:true,blend:0.15,below:k,keys:[
    [0,{root:[0,lo,0],L:{ik:[FOOTX,ANKLE-k,0]},R:{ik:[-FOOTX,ANKLE-k,0]}}],
    [0.14,{root:[0,lo-3,0.5],bend:22,nod:4,L:{...R(Math.min(170,95+k),Math.min(175,110+k)),ik:[FOOTX,ANKLE-k,0]},R:{...R(Math.min(170,95+k),Math.min(175,110+k)),ik:[-FOOTX,ANKLE-k,0]}}],
    [0.34,{root:[0,lo+k*0.7,2],bend:30,L:{...R(40,90),th:[95,6],sh:[-30,6],foot:0},R:{...R(40,90),th:[10,6],sh:[-25,6]}}],
    [0.56,{root:[0,STAND-3,4],bend:16,L:{...R(20,40),ik:[FOOTX,ANKLE,4]},R:{...R(20,40),th:[55,6],sh:[-35,6]}}],
    [0.78,{root:[0,STAND,5],bend:0,nod:0,L:{ik:[FOOTX,ANKLE,5],ua:[9,8],fa:[19,8]},R:{ik:[-FOOTX,ANKLE,5],ua:[9,8],fa:[19,8],foot:0}}]]}); }
function hopDown(h){ const k=Math.round(h); if(DOWNS[k]) return DOWNS[k]; const arm=(ua,fa)=>({L:{ua:[ua,30],fa:[fa,30]},R:{ua:[ua,30],fa:[fa,30]}});
  return DOWNS[k]=jumpMove({v0:45,t0:0.1,drop:k,vz:45,keys:[[0,{}],[0.1,{root:[0,15.5,0.5],bend:14,nod:4}],
    ['u0.5',{root:[0,STAND,0],bend:0,...arm(60,70)}],['u1',{L:{ik:[FOOTX,ANKLE-k,0]},R:{ik:[-FOOTX,ANKLE-k,0]}}],
    [100.1,{root:[0,13-k,0.5],bend:18,L:{ik:[FOOTX,ANKLE-k,0],ua:[40,20],fa:[56,20]},R:{ik:[-FOOTX,ANKLE-k,0],ua:[40,20],fa:[56,20]}},'out'],
    [100.34,{root:[0,STAND-k,0],bend:0,L:{ik:[FOOTX,ANKLE-k,0],ua:[9,8],fa:[19,8]},R:{ik:[-FOOTX,ANKLE-k,0],ua:[9,8],fa:[19,8]}}]]}); }
function leapMove(h){ const k=Math.round(h); if(LEAPS[k]) return LEAPS[k]; const arm=(ua,fa,s=20)=>({L:{ua:[ua,s],fa:[fa,s]},R:{ua:[ua,s],fa:[fa,s]}});
  return LEAPS[k]=jumpMove({v0:110,t0:0.28,drop:k,vz:70,tuck:[[0,0],[0.5,0],[0.8,0.5],[1,0.5]],keys:[[0,{}],[0.16,{root:[0,13.5,0.5],bend:26,nod:6,...arm(-20,-10,14)}],
    [0.28,{root:[0,STAND,1],bend:-6,nod:-4,...arm(110,120,30),L:{ua:[110,30],fa:[120,30],th:[0,0],sh:[0,0],foot:-30},R:{ua:[110,30],fa:[120,30],th:[0,0],sh:[0,0],foot:-30}},'in'],
    ['u0.4',{bend:-10,...arm(120,130,60)}],['u0.85',{bend:20,nod:10,L:{ua:[60,30],fa:[80,30],th:[70,10],sh:[-40,10],foot:-10},R:{ua:[60,30],fa:[80,30],th:[70,10],sh:[-40,10],foot:-10}}],
    ['u1',{L:{ik:[FOOTX,ANKLE-k,2]},R:{ik:[-FOOTX,ANKLE-k,2]}}],
    [100.25,{root:[0,9-k,-1],bend:34,nod:8,L:{ik:[FOOTX,ANKLE-k,3],ua:[50,40],fa:[60,40]},R:{ik:[-FOOTX,ANKLE-k,3],ua:[50,40],fa:[60,40]}},'out'],
    [100.9,{root:[0,STAND-k,0],bend:0,nod:0,L:{ik:[FOOTX,ANKLE-k,0],ua:[9,8],fa:[19,8]},R:{ik:[-FOOTX,ANKLE-k,0],ua:[9,8],fa:[19,8]}}]]}); }
const WALLHITS={},WALLRUNS={};
function wallHitMove(h,vy){ const hh=Math.max(3,Math.round(h)),v0=Math.round(vy/15)*15,k=hh+','+v0; if(WALLHITS[k]) return WALLHITS[k]; const up=STAND+hh;
  return WALLHITS[k]=jumpMove({v0,t0:0,drop:hh,vz:0,blend:0.1,keys:[
    [0,{root:[0,up,0],bend:-4,nod:8,L:{ua:[120,22],fa:[140,18],th:[20,4],sh:[-30,4],foot:-8},R:{ua:[120,22],fa:[140,18],th:[20,4],sh:[-30,4],foot:-8}}],
    ['u0.3',{bend:-8,nod:12,L:{ua:[128,20],fa:[150,16],th:[30,4],sh:[-42,4],foot:-12},R:{ua:[124,20],fa:[146,16],th:[24,4],sh:[-36,4],foot:-12}}],
    ['u0.8',{bend:0,nod:4,L:{ua:[70,22],fa:[40,20],th:[12,2],sh:[-10,2],foot:4},R:{ua:[70,22],fa:[40,20],th:[12,2],sh:[-10,2],foot:4}}],
    ['u1',{root:[0,up,0],L:{ik:SL,foot:0},R:{ik:SR,foot:0}}],
    [100.09,{root:[0,14,0.5],bend:16,L:{ua:[40,26],fa:[56,26]},R:{ua:[40,26],fa:[56,26]}},'out'],
    [100.34,{root:[0,STAND,0],bend:0,L:{ua:[9,8],fa:[19,8]},R:{ua:[9,8],fa:[19,8]}}]]}); }
function wallRunMove(h){ const hh=Math.max(0,Math.round(h)); if(WALLRUNS[hh]) return WALLRUNS[hh]; const rise=26,top=STAND+hh+rise;
  const stepK=(t,y,lead)=>[t,{root:[0,y,1],bend:14,nod:-6,L:{ua:[lead?110:60,18],fa:[lead?120:70,18],th:[lead?70:20,5],sh:[lead?-70:-25,5],foot:lead?-20:5},R:{ua:[lead?60:110,18],fa:[lead?70:120,18],th:[lead?20:70,5],sh:[lead?-25:-70,5],foot:lead?5:-20}}];
  return WALLRUNS[hh]=jumpMove({v0:70,t0:0.42,drop:hh+rise,vz:40,blend:0.1,keys:[
    stepK(0,STAND+hh,true),stepK(0.14,STAND+hh+rise*0.35,false),stepK(0.28,STAND+hh+rise*0.7,true),
    [0.42,{root:[0,top,0],bend:-10,nod:-4,L:{ua:[140,20],fa:[150,20],th:[35,4],sh:[-45,4],foot:-15},R:{ua:[140,20],fa:[150,20],th:[35,4],sh:[-45,4],foot:-15}},'in'],
    ['u0.5',{bend:4,nod:2,L:{ua:[90,26],fa:[100,26],th:[40,5],sh:[-30,5]},R:{ua:[90,26],fa:[100,26],th:[40,5],sh:[-30,5]}}],
    ['u0.9',{L:{ua:[62,30],fa:[72,30],th:[12,2],sh:[0,2],foot:8},R:{ua:[62,30],fa:[72,30],th:[12,2],sh:[0,2],foot:8}}],
    ['u1',{root:[0,top,0],L:{ik:SL,foot:0},R:{ik:SR,foot:0}}],
    [100.09,{root:[0,14,0.5],bend:16,L:{ua:[40,26],fa:[56,26]},R:{ua:[40,26],fa:[56,26]}},'out'],
    [100.34,{root:[0,STAND,0],bend:0,L:{ua:[9,8],fa:[19,8]},R:{ua:[9,8],fa:[19,8]}}]]}); }
function hangPose(st){ const H=st.hang,a=2*Math.PI*H.t/24,s=Math.sin(a),P=neutral();
  P.root=V(0,H.z+STAND,H.side?-1:0); P.nod=-14*D; P.pitch=(H.side?0:6*s)*D; P.bend=4*D;
  for(const [n,k] of [['L',1],['R',-1]]){ const r=H.side?0:k*s;
    P[n].ua=[(176-24*Math.max(0,r))*D,(H.side?18+8*Math.max(0,k*s):18)*D]; P[n].fa=[(178-16*Math.max(0,r))*D,6*D]; P[n].fist=1;
    P[n].th=[(10+6*k*s)*D,6*D]; P[n].sh=[(2+4*k*s)*D,6*D]; P[n].foot=-20*D; }
  if(H.grip&&st.world){ P.nod=-26*D; gripIK(st,P,H.grip); }   // hands onto the branch's holds
  return P; }

function sitPose(st){ const P=neutral(); P.root=V(0,st.sit.z+2,0); P.bend=-5*D; P.nod=-4*D;
  for(const n of "LR"){ P[n].th=[88*D,6*D]; P[n].sh=[6*D,4*D]; P[n].foot=4*D; P[n].ua=[22*D,16*D]; P[n].fa=[74*D,6*D]; P[n].fist=0; }
  return P; }

const RIDEG={bb:[5.6,0.4],crank:3.1,seat:[16.6,-3.6],bar:[19.4,9.6],deck:4.2,sit:4.5};
function ridePose(st){ const R=st.ride,P=neutral(),z=R.z||0;
  if(R.k==='bike'){
    P.root=V(0,RIDEG.seat[0]+1.4,RIDEG.seat[1]); P.bend=(R.brake?20:26)*D; P.nod=-12*D; P.pitch=0;
    for(const [n,k,ph] of [['L',1,0],['R',-1,Math.PI]]){ const a=R.c+ph, py=RIDEG.bb[0]+RIDEG.crank*Math.cos(a), pz=RIDEG.bb[1]+RIDEG.crank*Math.sin(a);
      P[n].ik=V(k*2.7,py+3.9,pz-1.4); P[n].foot=-8*D;
      P[n].ua=[58*D,9*D]; P[n].fa=[(R.brake?70:74)*D,4*D]; P[n].fist=1; } }
  else if(R.k==='skate'){
    const cr=Math.min(1.6,R.crouch||0), dk=RIDEG.deck+ANKLE, p=R.push, knee=(R.brake?5.4:4.2)+cr*4.5; P.yaw=(R.goofy?-78:78)*D; P.pyaw=0; P.cyaw=-10*D*(R.goofy?-1:1); P.nod=-4*D; P.bend=(10+cr*8+(R.lean||0))*D;   // crouch: winding up or tucked; lean: a manual
    P.root=V(0,STAND-knee-(p>=0?2.2*Math.sin(Math.PI*p):0)+dk-ANKLE+z,0);
    const f=R.goofy?'R':'L', b=R.goofy?'L':'R', s=R.goofy?-1:1;
    P[f].ik=V(0.6*s,dk+z,4.4); P[f].foot=0;
    if(p>=0){ const dn=Math.min(1,Math.sin(Math.PI*p)*1.6); P[b].ik=V(-3.4*s,dk-dn*RIDEG.deck+z*(1-dn),1.5-8*p); P[b].foot=-6*D*dn; }
    else { P[b].ik=V(-0.6*s,dk+z,-4.2); P[b].foot=0; }
    for(const [n,k] of [['L',1],['R',-1]]){ P[n].ua=[(28+(p>=0?10:0))*D,(34+(R.brake?6:0))*D]; P[n].fa=[44*D,30*D]; P[n].fist=0; }
    if(R.grab){ const g=R.grab==='nose'||R.grab==='melon'?f:b; P[g].ua=[-8*D,12*D]; P[g].fa=[6*D,8*D]; P[g].fist=1; } }   // a grab: the hand down to the board
  else if(R.k==='scoot'){   // a kick scooter: facing forward, the front foot on the deck, the back one kicking, both hands on the bars
    const dk=RIDEG.deck+ANKLE, p=R.push, knee=R.brake?4.6:3.6; P.nod=-6*D; P.bend=14*D;
    P.root=V(0,STAND-knee-(p>=0?1.6*Math.sin(Math.PI*p):0)+dk-ANKLE+z,0);
    P.L.ik=V(1.2,dk+z,1.4); P.L.foot=0;
    if(p>=0){ const dn=Math.min(1,Math.sin(Math.PI*p)*1.6); P.R.ik=V(-1.4,dk-dn*RIDEG.deck+z*(1-dn),-1-7*p); P.R.foot=-6*D*dn; }
    else { P.R.ik=V(-1.2,dk+z,-2.6); P.R.foot=0; }
    for(const n of 'LR'){ P[n].ua=[40*D,8*D]; P[n].fa=[30*D,4*D]; P[n].fist=1; } }
  else if(R.k==='kart'){
    P.root=V(0,6+z,-1.5); P.bend=-16*D; P.nod=-6*D;
    for(const [n,k] of [['L',1],['R',-1]]){ P[n].th=[82*D,5*D]; P[n].sh=[14*D,2*D]; P[n].foot=-12*D; P[n].ua=[50*D,12*D]; P[n].fa=[58*D,(4+(R.steer||0)*26*k)*D]; P[n].fist=1; } }
  else if(R.k==='car'){
    P.root=V(0,RIDEG.sit,0); P.bend=-30*D; P.nod=4*D;
    for(const [n,k] of [['L',1],['R',-1]]){ P[n].th=[84*D,6*D]; P[n].sh=[22*D,2*D]; P[n].foot=-8*D; P[n].ua=[58*D,14*D]; P[n].fa=[50*D,(6+(R.steer||0)*26*k)*D]; P[n].fist=1; } }
  else if(R.k==='zip'){
    P.root=V(0,z+STAND,0); P.nod=-10*D; P.pitch=(R.sway||0); P.bend=6*D;
    for(const n of 'LR'){ P[n].ua=[174*D,14*D]; P[n].fa=[178*D,6*D]; P[n].fist=1; P[n].th=[26*D,4*D]; P[n].sh=[18*D,4*D]; P[n].foot=-14*D; } }
  else if(R.k==='tramp'){
    const sink=Math.min(0,z), up=R.vz>0?1:0, h=Math.max(0,z);
    P.root=V(0,STAND+z-(sink<0?Math.min(4,-sink*0.12):0),0); P.nod=(up?-6:6)*D;
    for(const [n,k] of [['L',1],['R',-1]]){ P[n].ik=V(k*FOOTX*(h>2?0.7:1),ANKLE+z,0); P[n].foot=(h>2?-30:0)*D;
      const arm=sink<0?40:up?150:70; P[n].ua=[arm*D,(sink<0?12:22)*D]; P[n].fa=[(arm+10)*D,8*D]; P[n].fist=0; } }
  for(const n of 'LR')if(P[n].ik)legIK(P,n,n=='L'?1:-1,P[n].ik);
  return lift(P,floorOf(st)); }

const AIRV={
  flyingKick:air({bend:-16,cyaw:-10,L:{th:[70,12],sh:[-36,12],foot:-10,ua:[70,34],fa:[70,34],fist:1},R:{th:[64,5],sh:[60,5],foot:25,ua:[-24,24],fa:[-6,24],fist:1}}),
  airPunch:air({bend:18,nod:-6,cyaw:20,R:{ua:[84,-2],fa:[84,-5],fist:1,th:[10,3],sh:[-60,3]},L:{ua:[-30,18],fa:[-10,18],fist:1,th:[24,4],sh:[-48,4]}}),
  roll:air({yaw:-90,nod:-20,L:{ua:[0,150],fa:[0,150],th:[0,38],sh:[0,38],foot:0},R:{ua:[0,150],fa:[0,150],th:[0,38],sh:[0,38],foot:0}}),
  pitch:air({bend:26,nod:12,L:{ua:[62,24],fa:[82,24],th:[96,13],sh:[-32,13],foot:-20},R:{ua:[62,24],fa:[82,24],th:[96,13],sh:[-32,13],foot:-20}}),
};
for(const n of ['jab','cross','uppercut'])MOVES['b'+n]=move({lead:MOVES[n].lead,window:MOVES[n].window,keys:MOVES[n].keys.map(([t,c,e])=>[t,c===GUARD?BGUARD:c,e])});
const KEYMOVE={J:'jab',K:'frontKick',N:'slap',' ':'jump',Q:'backflip',G:'backflip',E:'frontflip',F:'fall',R:'roll',C:'crouch',V:'wave',B:'block',X:'legSweep',U:'cartwheel'};

function flow(K,i,x){ const a=K[Math.max(0,i-2)],b=K[i-1],c=K[i],d=K[Math.min(K.length-1,i+1)],tb=b.t,tc=c.t,ta=a===b?tb-(tc-tb):a.t,td=d===c?tc+(tc-tb):d.t,dt=tc-tb;
  const H=(p0,p1,p2,p3)=>{ const m1=(p2-p0)/(tc-ta)*dt,m2=(p3-p1)/(td-tb)*dt,x2=x*x,x3=x2*x; return (2*x3-3*x2+1)*p1+(x3-2*x2+x)*m1+(-2*x3+3*x2)*p2+(x3-x2)*m2; };
  const A=(a===b?b:a).P,B=b.P,C=c.P,Dd=(d===c?c:d).P,P={root:V(H(A.root.x,B.root.x,C.root.x,Dd.root.x),H(A.root.y,B.root.y,C.root.y,Dd.root.y),H(A.root.z,B.root.z,C.root.z,Dd.root.z))};
  for(const k of ['yaw','roll','pitch','pv','pyaw','cyaw','bend','side','nod','look']) P[k]=H(A[k],B[k],C[k],Dd[k]);
  for(const n of 'LR'){ const g=f=>[0,1].map(j=>H(A[n][f][j],B[n][f][j],C[n][f][j],Dd[n][f][j]));
    P[n]={ua:g('ua'),fa:g('fa'),th:g('th'),sh:g('sh'),fist:clamp(H(A[n].fist,B[n].fist,C[n].fist,Dd[n].fist),0,1),foot:H(A[n].foot,B[n].foot,C[n].foot,Dd[n].foot)};
    if(B[n].ik&&C[n].ik){ const a2=A[n].ik||B[n].ik,d2=Dd[n].ik||C[n].ik,b2=B[n].ik,c2=C[n].ik; P[n].ik=V(H(a2.x,b2.x,c2.x,d2.x),H(a2.y,b2.y,c2.y,d2.y),H(a2.z,b2.z,c2.z,d2.z)); legIK(P,n,n=='L'?1:-1,P[n].ik); } }
  return P; }
const moveAt=st=>moveAtOf(st.move);
function moveAtOf(mv){ const def=mv.def,t=Math.min(mv.t,def.dur),ks=def.kl&&t>def.air.t0+def.air.T?def.kl:def.k; let i=1; while(i<ks.length-1&&ks[i].t<t) i++;
  const A=ks[i-1],B=ks[i],x=B.t>A.t?clamp((t-A.t)/(B.t-A.t),0,1):1; let P=B.e===smooth?flow(ks,i,x):mix(A.P,B.P,B.e(x));
  const a=def.air; if(a&&t>=a.t0&&t<=a.t0+a.T){ const tau=t-a.t0,i2=Math.min(240,Math.round(tau/a.T*240));
    P.root=V(P.root.x,P.root.y+(a.v0*tau-a.g*tau*tau/2)*(mv.hi||1),P.root.z); P.pv=a.c; if(a.spin) P.pitch+=a.spin[i2];
    if(mv.variant){ const v=mv.variant,w=Math.min(1,(t-v.t)/0.08)*(1-smooth(clamp((tau/a.T-0.8)/0.17,0,1))); if(w>0){ const Q=apply(P,AIRV[v.name]); P=mix(P,Q,w); } }
    for(const n of 'LR') delete P[n].ik; }
  const tp=def.topple; if(tp&&t<tp.T){ const th=tp.tab[Math.min(tp.tab.length-1,Math.round(t*240))]; P.pitch=th; P.root=V(0,STAND*Math.cos(th),STAND*Math.sin(th)); for(const n of 'LR') if(P[n].ik) legIK(P,n,n=='L'?1:-1,P[n].ik,P[n].kp); }
  for(const k of ['yaw','roll','pitch']) P[k]=wrap(P[k]);
  return P; }
const mirror=P=>{ const Q=JSON.parse(JSON.stringify(P)); Q.root=V(-P.root.x,P.root.y,P.root.z); for(const k of ['yaw','roll','pyaw','cyaw','side','look']) Q[k]=-P[k];
  Q.L=JSON.parse(JSON.stringify(P.R)); Q.R=JSON.parse(JSON.stringify(P.L)); for(const n of 'LR'){ if(Q[n].ik) Q[n].ik=V(-Q[n].ik.x,Q[n].ik.y,Q[n].ik.z); if(Q[n].hf) Q[n].hf={y:[-Q[n].hf.y[0],Q[n].hf.y[1],Q[n].hf.y[2]],z:[-Q[n].hf.z[0],Q[n].hf.z[1],Q[n].hf.z[2]]}; } return Q; };
const lift=(P,y)=>{ P.root=V(P.root.x,P.root.y+y,P.root.z); for(const n of 'LR') if(P[n].ik) P[n].ik=V(P[n].ik.x,P[n].ik.y+y,P[n].ik.z); return P; };
const floorOf=st=>st.water?st.water.floor:0;
const armsOf=d=>{ const o={}; for(const n of 'LR')o[n]=d.k.some(k=>['ua','fa'].some(f=>Math.abs(k.P[n][f][0]-START[n][f][0])+Math.abs(k.P[n][f][1]-START[n][f][1])>1e-3)); return o; };
function upLayer(st,P){ const u=st.up; if(!u)return P; if(st.water&&st.water.in||st.climb||st.hang||st.ride){ st.up=null; return P; }
  if(u.prev){ if(u.t<0.08){ st.up=u.prev; P=upLayer(st,P); st.up=u; } else u.prev=null; }
  const d=u.def, U=moveAtOf(u), k=smooth(clamp(u.t/0.08,0,1))*(1-smooth(clamp((u.t-(d.dur-0.14))/0.14,0,1))); if(k<=0)return P; const arms=d.arms||(d.arms=armsOf(d));
  for(const n of 'LR')if(arms[n]){ const a=P[n],b=U[n]; a.ua=lerp2(a.ua,b.ua,k); a.fa=lerp2(a.fa,b.fa,k); a.fist=lerp(a.fist,b.fist,k); }
  for(const f of ['cyaw','nod','look'])P[f]=lerp(P[f],U[f],k); return P; }
function aimLayer(st,P){ const A=st.aim; if(!A||!(A.w>0)||st.water&&st.water.in||st.climb||st.hang||st.ride||st.sit) return P;
  const R=cat(turn(P.yaw,P.roll,P.pitch),turn(0,P.side,P.bend)),v=nrm(A.v),x=dot(v,R.x),y=dot(v,R.y),z=dot(v,R.z),n=st.hand==='L'?'L':'R',a=Math.atan2(z,-y),b=Math.asin(clamp(n==='L'?x:-x,-1,1)),w=A.w,H=P[n];
  H.ua=lerp2(H.ua,[a,b],w); H.fa=lerp2(H.fa,[a+.2,b],w); H.fist=lerp(H.fist,1,w); P.cyaw=lerp(P.cyaw,clamp(Math.atan2(x,z)*.3,-.5,.5),w); return P; }
function gripLayer(st,P){ const G=st.grip; if(!G||st.water&&st.water.in||st.climb||st.hang||st.ride||st.sit)return P;   // one hand on a hold (a train's pole or rail), given in the body's own frame
  const s=G.side>0?1:-1,n=s>0?'L':'R'; armIK(P,n,s,V(G.x,G.y,G.z)); P[n].fist=1; return P; }
const flying=st=>!!(st.fly&&st.fly.k>1e-3);
const rawPose=st=>{ const P=gripLayer(st,aimLayer(st,upLayer(st,rawPose0(st)))); if(!flying(st)) return P; const k=smooth(clamp(st.fly.k,0,1)); return k<1?mixW(P,flyPose(st),k):flyPose(st); };
// FLYING like a superhero: upright and bobbing at a hover, one fist up going up, laid out flat with a fist ahead going forward (nose up climbing, down diving), the legs together trailing
function flyPose(st){ const F=st.fly,t=F.t||0,f=smooth(clamp(F.f||0,0,1)),u=clamp(F.u||0,-1,1),b=Math.sin(t*2.2);
  const H=neutral(); H.root=V(0,STAND+0.8*b,0); H.pitch=(6+2*b)*D; H.nod=-4*D;
  for(const [n,s] of [['L',0],['R',Math.PI]]){ H[n].ua=[(14+4*Math.sin(t*1.7+s))*D,24*D]; H[n].fa=[(34+5*Math.sin(t*1.7+s))*D,22*D]; H[n].fist=.6;
    H[n].th=[(n=='L'?8:2)*D,5*D]; H[n].sh=[(n=='L'?-22:-10)*D,5*D]; H[n].foot=-45*D; }
  const U=neutral(); U.root=V(0,STAND,0); U.pitch=-2*D; U.nod=-10*D;
  U.R.ua=[176*D,4*D]; U.R.fa=[178*D,4*D]; U.R.fist=1; U.L.ua=[6*D,10*D]; U.L.fa=[12*D,10*D]; U.L.fist=1;
  for(const n of 'LR'){ U[n].th=[-2*D,2*D]; U[n].sh=[(n=='L'?-8:-3)*D,2*D]; U[n].foot=-65*D; }
  const D0=neutral(); D0.root=V(0,STAND,0); D0.pitch=4*D; D0.nod=14*D;
  for(const n of 'LR'){ D0[n].ua=[(40)*D,46*D]; D0[n].fa=[(62)*D,44*D]; D0[n].fist=.3; D0[n].th=[(n=='L'?14:6)*D,6*D]; D0[n].sh=[(n=='L'?-30:-14)*D,6*D]; D0[n].foot=-40*D; }
  const S=neutral(), lean=lerp(84,u>0?40:118,Math.abs(u)), w=Math.sin(t*9)*(.5+.5*f); S.root=V(0,STAND,0); S.pitch=lean*D; S.roll=(st.bank||0)*2.2+1.5*D*Math.sin(t*1.3); S.nod=-58*D;
  S.R.ua=[174*D,5*D]; S.R.fa=[177*D,5*D]; S.R.fist=1; S.L.ua=[(8+2*w)*D,12*D]; S.L.fa=[14*D,12*D]; S.L.fist=1;
  S.L.th=[(-6+1.5*w)*D,3*D]; S.L.sh=[-26*D,3*D]; S.R.th=[(-3-1.5*w)*D,3*D]; S.R.sh=[-6*D,3*D]; S.L.foot=S.R.foot=-72*D;
  const V0=u>0?mixW(H,U,smooth(u)):mixW(H,D0,smooth(-u)); return mixW(V0,S,f); }
// a hand-made move drawn from a recording (LOOK[name] = a recorded move's name, filled by MOTION): its own clock, travel and air kept, the pose the recording's at the same share of the way through
const LOOK={};
function lookAt(st){ const m=st.move, L=LOOK[m.name]&&MOVES[LOOK[m.name]]; if(!L||m.def.air)return m.name.startsWith('mc_')?wrapPose(moveAt(st)):moveAt(st);
  const P=moveAtOf({def:L,t:Math.min(1,m.t/m.def.dur)*L.dur}); if(m.def.travel)P.root=V(P.root.x,P.root.y,P.root.z+moveAt(st).root.z); return wrapPose(P); }
// a recorded pose's angles back within a turn (the keys run on past 180 to stay continuous): the same body, and a blend to or from it takes the short way
const wrapA=a=>a-2*Math.PI*Math.round(a/(2*Math.PI));
function wrapPose(P){ for(const k of ['yaw','roll','pitch','side','bend','cyaw','nod','look'])if(typeof P[k]==='number')P[k]=wrapA(P[k]);
  for(const n of 'LR'){ const H=P[n]; if(!H)continue; for(const k of ['ua','fa','th','sh'])if(Array.isArray(H[k]))H[k]=H[k].map(v=>typeof v==='number'?wrapA(v):v); if(typeof H.foot==='number')H.foot=wrapA(H.foot); } return P; }   // (a move that carries you: the recording drawn where the move has got to)
function rawPose0(st){ const Wt=st.water,W=Wt&&Wt.in?swimPose(st):st.climb?climbPose(st):st.hang?hangPose(st):st.ride?ridePose(st):st.sit?sitPose(st):lift(walkPose(st,st.abd),floorOf(st));
  if(st.move){ const M=lift(lookAt(st),st.move.floor),u=smooth(clamp(st.move.t/(st.move.def.blend||0.1),0,1)); return u<1?mix(st.move.from,M,u):M; }
  if(st.out){ const u=smooth(clamp(st.out.t/(st.out.T||.12),0,1)),O=st.out.y0!=null?lift(JSON.parse(JSON.stringify(st.out.pose)),Wt.y-st.out.y0):st.out.pose; return mix(O,W,u); }
  return W; }

function water(st,o){ const W=st.water||(st.water={in:false,y:0,vy:0,ph:0,t:0,swim:0,under:0,back:0,load:0,events:[]}); Object.assign(W,o); return W; }
const sinD=a=>Math.sin(a*D);
function swimPose(st){ const W=st.water,ph=W.ph,a=2*Math.PI*ph;
  const T=neutral(),C=neutral(),U=neutral();
  T.root=V(0,W.y,0); T.pitch=10*D; T.nod=-12*D;
  for(const [n,s0] of [['L',0],['R',Math.PI]]){ T[n].ua=[50*D,(40+14*Math.sin(a))*D]; T[n].fa=[80*D,(25+22*Math.sin(a))*D];
    T[n].th=[(40+12*Math.sin(a+s0))*D,22*D]; T[n].sh=[(-40+18*Math.cos(a+s0))*D,18*D]; T[n].foot=-25*D; }
  C.root=V(0,W.y,0); C.pitch=90*D; C.roll=32*D*Math.sin(a); C.nod=-14*D; C.look=-70*D*Math.pow(Math.max(0,Math.sin(a-0.3)),2);
  for(const [n,o] of [['L',0],['R',180]]){ const ang=((180-360*ph+o)%360+360)%360-180;
    C[n].ua=[ang*D,18*D]; C[n].fa=[(ang-60*sinD(ang)-15*Math.tanh(6*sinD(ang)))*D,18*D]; C[n].fist=0;
    const k=6*Math.PI*ph+(n=='R'?Math.PI:0),th=6+14*Math.sin(k); C[n].th=[th*D,5*D]; C[n].sh=[(th-14-14*Math.max(0,Math.sin(k+1.2)))*D,5*D]; C[n].foot=-70*D; }
  U.root=V(0,W.y,0); U.pitch=(90+6*Math.sin(a))*D; U.nod=-10*D;
  const BA=loop([[0,178],[0.15,178],[0.32,120],[0.45,60],[0.55,40],[0.7,178]]),BB=loop([[0,20],[0.15,20],[0.32,62],[0.45,30],[0.55,22],[0.7,20]]),BE=loop([[0,0],[0.15,0],[0.32,30],[0.45,95],[0.55,110],[0.7,0]]);
  const LT=loop([[0,0],[0.5,0],[0.62,34],[0.72,6],[0.82,0]]),LB=loop([[0,4],[0.5,4],[0.62,24],[0.72,30],[0.82,4]]),LS=loop([[0,0],[0.5,0],[0.62,-96],[0.72,-4],[0.82,0]]);
  for(const n of 'LR'){ U[n].ua=[BA(ph)*D,BB(ph)*D]; U[n].fa=[(BA(ph)+BE(ph))*D,BB(ph)*D]; U[n].th=[LT(ph)*D,LB(ph)*D]; U[n].sh=[LS(ph)*D,LB(ph)*D]; U[n].foot=-70*D; }
  const F=neutral(),b=Math.sin(W.t*1.3); F.root=V(0,W.y,0); F.pitch=82*D; F.roll=3*D*Math.sin(W.t*0.8); F.nod=12*D;
  for(const [n,s0] of [['L',0],['R',Math.PI]]){ F[n].ua=[(112+4*Math.sin(W.t*0.9+s0))*D,40*D]; F[n].fa=[(124+4*Math.sin(W.t*0.9+s0))*D,42*D];
    F[n].th=[(24+3*b)*D,12*D]; F[n].sh=[(12+3*b)*D,12*D]; F[n].foot=-50*D; }
  const S=neutral(); S.root=V(0,W.y,0); S.pitch=-78*D; S.roll=4*D*Math.sin(W.t*0.5); S.nod=-10*D;
  for(const [n,s0] of [['L',0],['R',Math.PI]]){ S[n].ua=[(28+6*Math.sin(W.t*0.6+s0))*D,(58+5*Math.sin(W.t*0.45+s0))*D]; S[n].fa=[(52+6*Math.sin(W.t*0.6+s0))*D,(50+4*Math.sin(W.t*0.45+s0))*D];
    S[n].th=[(14+4*Math.sin(W.t*0.4+s0))*D,16*D]; S[n].sh=[(-12+4*Math.sin(W.t*0.4+s0))*D,16*D]; S[n].foot=-20*D; }
  return mixW(mixW(mixW(T,C,smooth(W.swim)),U,smooth(W.under)),W.supine?S:F,smooth(W.back)); }
const mixW=(A,B,u)=>{ const P=mix(A,B,u); for(const n of 'LR'){ const s=n=='L'?1:-1; for(const k of ['ua','fa']){ const v=nrm(add(mul(limb(...A[n][k],s),1-u),mul(limb(...B[n][k],s),u))),a=Math.atan2(v.z,-v.y);
  P[n][k]=[P[n][k][0]+wrap(a-P[n][k][0]),Math.asin(clamp(s*v.x,-1,1))]; } } return P; };
function waterTick(st,h){ const W=st.water; if(!W||W.level==null){ if(W) W.in=false; return; }
  const lvl=W.level;
  if(!W.in&&!st.move&&W.floor<lvl-30){ W.in=true; W.y=st.last?st.last.root.y:STAND; W.vy=0; W.swim=0; W.under=0; W.back=0; W.float=false; st.w=0; if(st.last) st.out={pose:JSON.parse(JSON.stringify(st.last)),t:0,T:0.3}; }
  if(!W.in||st.move) return;
  st.w=0; W.t+=h; W.swim+=((W.go?1:0)-W.swim)*Math.min(1,h*2); W.under+=((W.dive?1:0)-W.under)*Math.min(1,h*1.4); W.back+=((W.float?1:0)-W.back)*Math.min(1,h*1.5);
  W.ph=(W.ph+h*(1+0.5*(W.fast||0))/lerp(lerp(1.4,1.2,W.swim),1.6,W.under))%1;
  const target=lerp(lerp(lerp(lvl-21+0.5*Math.sin(W.t*4.5),lvl-2.4,W.swim),lvl-(W.deep||Math.max(24,lvl-W.floor-10)),W.under),lvl-3.5+0.6*Math.sin(W.t*1.3),W.back),y0=W.y;
  if(W.y>lvl+4) W.vy-=G*h;
  else W.vy+=(30*(target-W.y)-4*W.vy-0.02*W.vy*Math.abs(W.vy))*h;
  W.y+=W.vy*h; if(W.y<W.floor+6){ W.y=W.floor+6; W.vy=Math.max(0,W.vy); }
  if(y0>lvl-4&&W.y<=lvl-4&&W.vy<-15){ if(!W.sp) W.events.push({k:'splash',z:0,v:-W.vy}); W.sp=0; }
  st.dist+=(34*W.swim*(1-W.under)+22*W.under*(W.go?1:0))*(1+0.6*(W.fast||0))*h; }

const SPR={head:[260,22]};
function create(){ return {ph:0,w:0,target:0,run:0,runTarget:0,dist:0,acc:0,abd:{L:0,R:0},move:null,out:null,next:null,up:null,upNext:null,mv:0,last:null,
  head:{x:0,v:0,a0:null,a1:null}}; }
function handed(st,def){ if(!def||!def.lead||(st.hand||'R')===def.lead) return def; return def.mir||(def.mir={...def,lead:st.hand,mir:null,arms:null,k:def.k.map(K=>({...K,P:mirror(K.P)}))}); }
const pace=st=>gaitOf(st.run).speed*((st.wk||1)+((st.rk||1)-(st.wk||1))*st.run);
function begin(st,name,dd){ const def=handed(st,dd||MOVES[name]),from=JSON.parse(JSON.stringify(st.out&&!(st.out.t>0)?st.out.pose:st.last||rawPose(st))),om=st.move;   // (straight after a move ends: from its last pose, its travel already taken into the step)
  if(om){ const z=from.root.z; st.dist+=z-(om.zc||0); from.root=V(from.root.x,from.root.y,0); }
  st.move={def,name,t:0,from,held:true,variant:null,floor:def.deck?0:floorOf(st),hi:def.air&&!def.src.drop?st.hi||1:1}; st.out=null; st.next=null;
  if(def.below!=null) st.move.base=Math.min(floorOf(st)-def.below,from.root.y-STAND);
  st.mvw=Math.max(pace(st)*st.w,om?.9*st.mv:0); st.mv=def.air?st.mvw+def.air.vz:st.mvw*0.9; }
const ARMMOVES=new Set(['jab','cross','uppercut','block','wave']);
function beginUp(st,name){ const pv=st.up; if(pv)pv.prev=null; st.up={def:handed(st,MOVES[name]),name,t:0,held:true,prev:pv}; st.upNext=null; }   // (prev: the arm move it follows, blended from)
const carries=m=>!!(m&&m.def.travel&&!m.def.below&&!m.def.deck);
const free=m=>{ const d=m.def; return d.below==null&&!d.deck&&!m.wall&&!(d.src&&(d.src.drop||d.src.entry)); };
const pick=(st,n)=>n=='jump'&&st.w>.6&&st.run>.4?'runJump':n;
function act(st,key){ const W=st.water;
  if(key=='climb'){ if(W&&W.in&&!st.move) begin(st,'climb'); return; }
  if(key=='mantle'){ if(!st.move){ st.climb=null; st.hang=null; begin(st,'mantle'); } return; }
  if(key=='grab'||key=='grabL'){ if(!st.move&&!(W&&W.in)) begin(st,key); return; }
  if(key=='carry'){ if(!(st.up&&st.up.name=='carry')&&!(W&&W.in)) beginUp(st,'carry'); return; }
  if(key&&key.up!=null){ if(!st.move) begin(st,'up',upMove(key.up)); return; }
  if(key&&key.hop!=null){ if(!st.move) begin(st,'hop',hopDown(key.hop)); return; }
  if(key&&key.wallHit!=null){ begin(st,'wallHit',wallHitMove(key.wallHit,key.vy)); st.move.wall=true; return; }
  if(key&&key.wallRun!=null){ begin(st,'wallRun',wallRunMove(key.wallRun)); st.move.wall=true; return; }
  if(key&&key.pick!=null){ begin(st,'pick',pickMove(key.pick,key.z||10)); return; }
  if(key&&key.leap!=null){ if(!st.move) begin(st,'leap',leapMove(key.leap)); return; }
  if(W&&W.in) return;
  if(key==' '&&W&&W.board&&!st.move&&W.level!=null){ begin(st,'dive',diveMove(W.floor+STAND+9-(W.level+12))); return; }
  if(key==' '&&W&&W.edge&&!st.move&&W.level!=null){ begin(st,'cannonball',cannonMove(W.floor+STAND+9-(W.level+12))); return; }
  const name=KEYMOVE[key]; if(!name) return; const mv=st.move;
  if(ARMMOVES.has(name)&&!(st.climb||st.hang||st.ride)){ if(mv){ const d=mv.def,a=d.air; if(a&&d.airv&&d.airv[key]&&!mv.variant&&mv.t>a.t0&&mv.t<a.t0+a.T*0.75){ mv.variant={name:d.airv[key],t:mv.t}; return; } }
    if(mv&&!st.up&&mv.def.combo&&ARMMOVES.has(mv.def.combo[key])&&(!mv.def.window||mv.t>=mv.def.window[0]*RIGT.combo)){ beginUp(st,mv.def.combo[key]); return; }   // a body move's arm follow-up (crouch, then J: an uppercut)
    const u=st.up; if(!u||name=='block'){ beginUp(st,name); return; } const ud=u.def; if(ud.combo&&ARMMOVES.has(ud.combo[key])){ if(u.t>=ud.window[0]*RIGT.combo) beginUp(st,ud.combo[key]); else st.upNext=ud.combo[key]; } else st.upNext=name; return; }
  if(MOVES[name]&&MOVES[name].again&&(st.climb||st.hang||st.ride)) return;
  if(!mv){ begin(st,pick(st,name)); return; }
  const d=mv.def,a=d.air,airborne=!!a&&mv.t>=a.t0&&mv.t<a.t0+a.T;
  // the one rule for body moves: a move runs to its end, and a key does nothing meanwhile except what the move itself allows (its in-air variant, its combo follow-up) or a fall
  if(a&&d.airv&&d.airv[key]&&!mv.variant&&airborne&&mv.t<a.t0+a.T*0.75){ mv.variant={name:d.airv[key],t:mv.t}; return; }
  if(name=='fall'){ begin(st,'fall'); return; }
  if(d.combo&&d.combo[key]&&free(mv)&&!airborne&&(!d.window||mv.t>=d.window[0]*RIGT.combo)) begin(st,d.combo[key]); }
function release(st,key){ if(key=='carry'){ if(st.up&&st.up.name=='carry') st.up.held=false; return; } if(st.move&&KEYMOVE[key]==st.move.name) st.move.held=false; if(st.up&&KEYMOVE[key]==st.up.name) st.up.held=false; }
function tick(st,h){ st.run+=(st.runTarget-st.run)*Math.min(1,h*RIGT.blend); const g=gaitOf(st.run);
  if(st.up){ const u=st.up,d=u.def; if(!(d.hold&&u.held&&u.t+h>=d.hold)) u.t+=h*RIGT.moves*(st.anim||1); else u.t=d.hold; if(st.upNext&&d.window&&u.t>=d.window[0]*RIGT.combo) beginUp(st,st.upNext); else if(u.t>=d.dur){ st.up=null; if(st.upNext) beginUp(st,st.upNext); } }
  if(st.move){ const mv=st.move,d=mv.def,a=d.air,fr=free(mv);
    if(!(d.hold&&mv.held&&mv.t+h>=d.hold)) mv.t+=d.air?h:h*RIGT.moves*(st.anim||1)*(d.slow||1); else mv.t=d.hold;
    if(st.next&&fr&&!(a&&mv.t<a.t0+a.T)) begin(st,pick(st,st.next));
    else if(d.air&&st.water&&(d.entry||st.water.level!=null&&st.water.floor<st.water.level-30)&&mv.t>=d.air.t0+d.air.T){
      const M=lift(moveAt(st),mv.floor),W=st.water,vy=d.air.v0-d.air.g*d.air.T; st.out={pose:JSON.parse(JSON.stringify(M)),t:0,T:0.9};
      W.in=true; W.y=M.root.y; W.vy=vy; W.under=1; W.swim=0; W.ph=0.15; W.sp=1; st.out.y0=W.y; W.events.push({k:'splash',z:6,v:-vy}); st.move=null; st.mv*=0.3; }
    else if(mv.t>=d.dur||(st.target>0||d.again&&mv.held)&&fr&&mv.t>=(d.ex??(a?a.t0+a.T+.04:d.dur*.8))){ if(mv.name=='climb'&&st.water){ st.water.in=false; st.water.floor=0; }
      const O=lift(lookAt(st),mv.floor),z=moveAt(st).root.z; st.dist+=z-(mv.zc||0); O.root=V(O.root.x,O.root.y,0); st.out={pose:O,t:0,T:.12};
      const nx=st.next||(d.again&&mv.held&&!st.climb&&!st.hang?mv.name:null); st.move=null; if(st.target>0){ const J=build(O).J; st.ph=d.ph??(J.ankleL.z>J.ankleR.z?.75:.25); } if(nx) begin(st,pick(st,nx)); }
    const m=st.move,P0=pace(st)*st.target;
    if(!m) st.mv=0;
    else if(m.def.air){ const a=m.def.air; if(m.t>a.t0+a.T){ if(!m.down){ m.down=1; st.mv=st.mvw||0; } if(st.target>0&&free(m)) st.mv+=(P0-st.mv)*Math.min(1,h*8); else if(m.def.ph==null) st.mv*=Math.exp(-14*h); }
      else if(m.t>=a.t0&&st.target>0&&free(m)) st.mv+=(P0+a.vz-st.mv)*Math.min(1,h*2); }
    else if(st.target>0&&free(m)) st.mv+=(P0*(m.def.keep??.5)-st.mv)*Math.min(1,h*6); else st.mv*=Math.exp(-(m.def.stop||1.2)*h);
    if(carries(st.move)){ const zn=moveAt(st).root.z, zc=st.move.zc||0; st.dist+=zn-zc; st.move.zc=zn; }
    if(st.move&&st.move.def.drift) st.dist+=st.move.def.drift*h; }   // a glide (an in-place recording that goes somewhere: the moonwalk), rig units a second along the facing
  else { if(st.out) st.out.t+=h; if(st.out&&st.out.t>(st.out.T||.12)) st.out=null; }
  const w0=st.w;
  st.w+=(st.target-st.w)*Math.min(1,h*RIGT.start); if(Math.abs(st.w-st.target)<1e-3||st.snap&&!st.move) st.w=st.target;
  if(w0>0.3&&st.target===0&&!st.move&&!(st.water&&st.water.in)) st.stop={t:0,a:Math.min(1,w0)*(0.7+0.5*st.run)};
  if(st.stop){ st.stop.t+=h; if(st.stop.t>=1||st.target>0||st.move) st.stop=null; }
  { const v=g.speed*st.w*((st.wk||1)+((st.rk||1)-(st.wk||1))*st.run), mx=(9+9*st.run)*D, to=st.move||st.target===0?0:Math.max(-mx,Math.min(mx,Math.atan(v*(st.yr||0)/G)));
    st.bank=(st.bank||0)+(to-(st.bank||0))*Math.min(1,h*7); if(to===0&&Math.abs(st.bank)<0.05*D) st.bank=0; }
  if(st.water) st.water.load=st.move&&st.move.def.load&&st.move.t<st.move.def.air.t0?keyAt(st.move.def.load,st.move.t):0;
  waterTick(st,h); if(st.fly){ const F=st.fly; F.k=clamp(F.k+(F.on?1:-1)*h*2.5,0,1); F.t=(F.t||0)+h; if(!F.on&&!F.k) st.fly=null; }
  const sk=(st.wk||1)+((st.rk||1)-(st.wk||1))*st.run, walked=st.move?0:g.speed*st.w*h*sk; st.wd=(st.wd||0)+walked;
  st.ph=(st.ph+h*sk*(st.anim||1)/g.cycle)%1; st.dist+=walked+(st.move&&st.move.def.air&&st.move.t<st.move.def.air.t0?(st.move.def.entry?0:st.mvw||0):st.mv)*h;
  const P=rawPose(st); st.last=P; const B=build(P,null),H=st.head;
  if(H.a0==null){ H.a0=H.a1=B.J.head.y; }
  const acc=(B.J.head.y-2*H.a1+H.a0)/(h*h); H.a0=H.a1; H.a1=B.J.head.y;
  { const s=st.head,[k,c]=SPR.head; s.v+=(-k*s.x-c*s.v-acc)*h; s.x=clamp(s.x+s.v*h,-1.5,1.5); } }
function step(st,dt){ if(st.target>0&&!st.went&&st.w<0.3&&!st.move){ st.ph=0; st.wd=0; } st.went=st.target>0;
  const T=Math.min(dt,0.25),n=Math.ceil(T*120-1e-6); for(let i=0;i<n;i++) tick(st,T/n); return st; }
const WSTEP=4.75;
function pose(st,inPlace){ const busy=st.move||st.out,P=JSON.parse(JSON.stringify(st.last||rawPose(st))),dev={};
  for(const n of 'LR') dev[n]=ZERO;
  const swimming=st.water&&st.water.in||!!st.climb||!!st.hang||!!st.ride||!!st.sit||flying(st);
  if(!st.move&&!swimming) st.abd=clearArms(st,dev); st.fdn=0; if(!busy&&!swimming){ st._lk=1; Object.assign(P,lift(walkPose(st,st.abd),floorOf(st))); st._lk=0; gripLayer(st,aimLayer(st,upLayer(st,P))); if(st.sign)st.sign(P); }
  if(st.move&&st.move.def.travel) P.root=V(P.root.x,P.root.y,inPlace?0:P.root.z-(carries(st.move)?st.move.zc||0:0));
  if(OVL.fn)OVL.fn(st,P);
  const B=settle(busy||st.up||(st.water&&st.water.in)?clearPose(P,dev):build(P,dev),st.move&&st.move.base!=null?st.move.base:floorOf(st)+(busy?0:st.fdn||0),busy,st.smooth);
  const hp=st.head.x/PX; if(st.smooth)st.hpx=hp; else if(st.hpx==null||Math.abs(hp-st.hpx)>0.75) st.hpx=Math.round(hp); B.head=add(B.J.head,V(0,st.hpx*PX,0));
  B.lift=0;
  if(!busy&&!swimming&&!st.up&&!st.sit) B.walkF=st.w>0.05&&st.target>0?Math.floor((st.wd||0)/WSTEP)%8:-1;
  const m=st.move; B.anim=swimming||st.sit?null:m?(!m.variant&&STUDIO.includes(m.name)?m.name+'/'+Math.floor(m.t*10):null):st.up&&!st.out?(st.w<0.05&&STUDIO.includes(st.up.name)?st.up.name+'/'+Math.floor(st.up.t*10):null):B.walkF!=null?(B.walkF<0?'stand/0':'walk/'+B.walkF):null;
  if(st.sign)B.anim=null; st.B=B;
  B.seat=!!(st.sit||st.ride&&/^(kart|car|bike)$/.test(st.ride.k));   // seated: a body of other proportions sits where the rig sits (111a)
  return B; }

const PIECES=['head','hair','beard','neck','torso','hips'].concat(...['L','R'].map(n=>['sleeve','upperArm','forearm','hand','thigh','shin','shoe'].map(k=>k+n)),
  ...['L','R'].map(n=>[0,1,2,3,4].flatMap(i=>[0,1,2].map(j=>'fing'+i+j+n))));
const SHAPE={};
const IDF={o:ZERO,x:V(1,0,0),y:V(0,1,0),z:V(0,0,1)};
let RAWBAKE=false;
function fitPts(n,raw){ const e=RIGP.pieces[n]; if(!e) return raw; const o=e.o||[0,0,0],sc=e.s||[1,1,1],r=e.r||[0,0,0],R=turn(r[1]*D,r[2]*D,r[0]*D),out=new Float32Array(raw.length);
  for(let i=0;i<raw.length;i+=6){ const p=app(R,V(raw[i]*sc[0],raw[i+1]*sc[1],raw[i+2]*sc[2])),g=nrm(app(R,V(raw[i+3]/sc[0],raw[i+4]/sc[1],raw[i+5]/sc[2])));
    out[i]=p.x+o[0]; out[i+1]=p.y+o[1]; out[i+2]=p.z+o[2]; out[i+3]=g.x; out[i+4]=g.y; out[i+5]=g.z; } return out; }
function refit(cloud){ for(const n of PIECES){ const c=cloud[n]; if(c&&c.raw) c.pts=fitPts(n,c.raw); } return cloud; }
function bake(h,dens,mouth,only,suit,cos){ const b=baker(h,dens,mouth,only,suit,cos); let r; do r=b.next(); while(!r.done); return r.value; }
function* baker(h,dens,mouth,only,suit,cos){ const t0=Date.now(),R=restOf().B;
  FINEHAND=h<0.3; const base=shell(R.J,0,mouth,suit); FINEHAND=false;
  const pieces=(cos?cos(R.J,base):base).filter(P=>!only||only.includes(P.n)),inset=0.5*PX/dens,out={names:cos?pieces.map(P=>P.n):PIECES},ctr=V(0,26,0);
  for(const P of pieces){ const F=P.on=='prop'?IDF:frameOf(SHAPE[P.n]||P.on||P.n,R),pts=[],mats=[],seen=new Set(),C=1.5,bb=P.bb||[-13,13,-1,55,-11,13];
    for(let x=bb[0];x<=bb[1];x+=C) for(let y=bb[2];y<=bb[3];y+=C){ yield null; for(let z=bb[4];z<=bb[5];z+=C){ if(Math.abs(P.d(V(x,y,z)))>C*0.9) continue;
      for(let i=Math.ceil((x-C/2)/h);i<=Math.floor((x+C/2)/h);i++) for(let j=Math.ceil((y-C/2)/h);j<=Math.floor((y+C/2)/h);j++) for(let k=Math.ceil((z-C/2)/h);k<=Math.floor((z+C/2)/h);k++){
        const key=(i+500)*1e6+(j+500)*1e3+(k+500); if(seen.has(key)) continue; seen.add(key);
        const p=V(i*h,j*h,k*h),d=P.d(p); if(Math.abs(d)>h*0.6) continue;
        const e=0.02,g=nrm(V(P.d(V(p.x+e,p.y,p.z))-P.d(V(p.x-e,p.y,p.z)),P.d(V(p.x,p.y+e,p.z))-P.d(V(p.x,p.y-e,p.z)),P.d(V(p.x,p.y,p.z+e))-P.d(V(p.x,p.y,p.z-e))));
        const s=sub(sub(p,mul(g,d)),mul(g,inset)),l=sub(s,F.o);
        pts.push(dot(l,F.x),dot(l,F.y),dot(l,F.z),dot(g,F.x),dot(g,F.y),dot(g,F.z)); mats.push(MATS.indexOf(P.paint&&P.paint(p)||P.m)); } } }
    let c=ZERO; for(let i=0;i<pts.length;i+=6) c=add(c,add(F.o,add(add(mul(F.x,pts[i]),mul(F.y,pts[i+1])),mul(F.z,pts[i+2]))));
    const raw=new Float32Array(pts); out[P.n]={pts:fitPts(P.n,raw),mats:new Uint8Array(mats),apart:mul(sub(mul(c,6/Math.max(6,pts.length)),ctr),0.45),on:P.on,grp:P.grp}; if(RAWBAKE) out[P.n].raw=raw; yield P.n; }
  out.drawn=false;
  out.ms=Date.now()-t0; out.count=Object.values(out).reduce((a,v)=>a+(v&&v.pts?v.pts.length/6:0),0); return out; }

let VPITCH=null;
function cam(yawA){ if(VPITCH!=null){ const uy=Math.cos(PITCH)*Math.cos(VPITCH)/Math.cos(Math.PI/6), uz=-TILT*Math.sin(VPITCH)/Math.sin(Math.PI/6), n=Math.hypot(uy,uz);
    return {r:yaw(V(ACROSS,0,0),-yawA),u:yaw(V(0,uy,uz),-yawA),f:yaw(V(0,uz/n,-uy/n),-yawA)}; }
  const n=Math.hypot(Math.cos(PITCH),TILT); return {r:yaw(V(ACROSS,0,0),-yawA),u:yaw(V(0,Math.cos(PITCH),-TILT),-yawA),f:yaw(V(0,-TILT/n,-Math.cos(PITCH)/n),-yawA)}; }
function project(p,yawA){ const c=cam(yawA); return [dot(p,c.r)*K,-dot(p,c.u)*K,dot(p,c.f)]; }
const LIGHT=nrm(V(-0.55,0.75,0.5)),hex=c=>0xff000000|parseInt(c.slice(5,7),16)<<16|parseInt(c.slice(3,5),16)<<8|parseInt(c.slice(1,3),16);
RAMP.lips=['#d4948a','#c4827a','#a26660','#5e3a36']; RAMP.hairHi=['#8a7674','#7c6967','#625150','#463837']; RAMP.hairLo=['#4e403f','#443736','#352a29','#251c1b']; RAMP.sole=['#3a2c22','#30241b','#251b14','#140e0a']; RAMP.eye=['#5a3a26','#4c311f','#3c2618','#24160d']; RAMP.eyeW=['#f4f0e8','#e8e2d6','#c8c0b0','#8a8274']; RAMP.pupil=['#2a1c18','#241814','#1c120f','#100a08']; RAMP.lid=['#b4896e','#a67c62','#8e6650','#5e4232']; RAMP.under=['#b9c3d0','#a8b2c0','#86909e','#525a66']; const MATS=Object.keys(RAMP),RAMP32=MATS.map(k=>RAMP[k].map(hex));
const BUF={};
function ramp32(look){ return MATS.map(m=>{ const t=look&&look[m], o=RAMP[m], c=h=>[1,3,5].map(j=>parseInt(h.slice(j,j+2),16)), b=c(o[1]);
  return (/^#[0-9a-f]{6}$/i.test(t||'')?o.map(h=>'#'+c(h).map((v,j)=>Math.min(255,Math.round(c(t)[j]*v/(b[j]||1))).toString(16).padStart(2,'0')).join('')):o).map(hex); }); }
function tint(look){ ramp32(look).forEach((r,i)=>RAMP32[i]=r); }
const DRAWNP={head:['head','hair','beard','neck'],torso:['torso']},DRAWNB={head:6,torso:3.5};
const OUTS={w:1,col:'',tone:0,a:100}; try{ if(localStorage.getItem('isowalk-outline')==='0')OUTS.w=0; Object.assign(OUTS,JSON.parse(localStorage.getItem('isowalk-outline2')||'{}')||{}); }catch(e){}
let OUTL=OUTS.w>0;
const OUTC={hair:'#433531',skin:'#775842',shirt:'#57543f',pants:'#1c252e',shoes:'#382c20'},OUTX=['#2b3238','#43342b','#45382b'];
const outPal=role=>{ const L=h=>[1,3,5].reduce((a,j)=>a+parseInt(h.slice(j,j+2),16),0); return WDRAWN.pal.map((h,k)=>L(h)<=L(OUTC[role[k]])||OUTX.includes(h)); };
let OUTP=null;
function lineCol(c,rim){ let r=c&255,g=(c>>8)&255,b=(c>>16)&255; if(OUTS.col&&rim){ const h=OUTS.col; r=parseInt(h.slice(1,3),16); g=parseInt(h.slice(3,5),16); b=parseInt(h.slice(5,7),16); }
  const t=OUTS.tone/10,m=t<0?0:255,u=Math.abs(t); r=Math.round(r+(m-r)*u); g=Math.round(g+(m-g)*u); b=Math.round(b+(m-b)*u);
  return (Math.round(Math.max(0,Math.min(100,OUTS.a))*2.55)<<24>>>0|b<<16|g<<8|r)>>>0; }
function unline(fr,role){ const out=outPal(role);
  return fr.map(g=>{ const h=Int8Array.from(g); for(let i=0;i<1920;i++){ const e=g[i]; if(e<0||!out[e]) continue; const x=i%32,y=(i/32)|0; let best=null;
    for(let r=1;r<=4&&!best;r++) for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){ if(Math.max(Math.abs(dx),Math.abs(dy))!==r) continue; const X=x+dx,Y=y+dy; if(X<0||Y<0||X>=32||Y>=60) continue; const f=g[Y*32+X]; if(f<0||out[f]) continue;
      const c=[role[f]!==role[e]?1:0,Math.abs(dx)+Math.abs(dy),f]; if(!best||c[0]<best[0]||c[0]===best[0]&&(c[1]<best[1]||c[1]===best[1]&&c[2]<best[2])) best=c; }
    if(best) h[i]=best[2]; } return h; }); }
const DRAWNF={};
function drawnFrames(){ const key=OUTL?1:0; if(DRAWNF[key]) return DRAWNF[key]; const raw=Uint8Array.from(atob(WDRAWN.data),ch=>ch.charCodeAt(0)),o=WDRAWN.offs,role=WDRAWN.role; let fr=[];
  for(let i=0;i<o.length-1;i++){ const g=new Int8Array(32*60).fill(-1); let p=o[i],x=0,y=0; while(p<o[i+1]){ const c=raw[p],n=raw[p+1]; p+=2; if(c) g.fill(c-1,y*32+x,y*32+x+n); x+=n; if(x>=32){ x=0; y++; } } fr.push(g); }
  if(!OUTL) fr=unline(fr,role);
  const top=(g,r)=>{ for(let i=0;i<g.length;i++) if(g[i]>=0&&(!r||role[g[i]]==r)) return (i/32)|0; return 99; },lum=k=>[1,3,5].reduce((a,j)=>a+parseInt(WDRAWN.pal[k].slice(j,j+2),16),0),cut=[];
  for(let v=0;v<5;v++){ let f0=0,b=1e9; for(let f=0;f<8;f++){ const t=top(fr[v*8+f])*100+top(fr[v*8+f],'shirt'); if(t<b){ b=t; f0=f; } }
    for(const t of [0,1]){ const g=fr[t*40+v*8+f0],st=top(g,'shirt'),hd=new Int8Array(32*60).fill(-1),sh=new Int8Array(32*60).fill(-1);
      for(let i=0;i<g.length;i++) if(g[i]>=0){ if(role[g[i]]=='shirt') sh[i]=g[i]; else if(((i/32)|0)<=st+2) hd[i]=g[i]; }
      for(let y=0;y<60;y++){ let a=-1,z=-1; const n={}; for(let x=0;x<32;x++){ const k=sh[y*32+x]; if(k<0) continue; if(a<0) a=x; z=x; if(lum(k)>350) n[k]=(n[k]||0)+1; }
        const best=Object.keys(n).sort((p,q)=>n[q]-n[p])[0]; if(a>=0&&best!=null) for(let x=a+1;x<z;x++) if(sh[y*32+x]<0) sh[y*32+x]=+best; }
      cut[v*2+t]=[hd,sh]; } }
  for(const t of [0,1]) for(let v=0;v<5;v++){ const g=Int8Array.from(fr[t*40+v*8]);
    if(v===4){ const m=fr[(1-t)*40+v*8]; for(let y=42;y<60;y++) for(let x=0;x<16;x++) g[y*32+x]=m[y*32+31-x]; }
    if(v===3) for(let y=59;y>50;y--) g.copyWithin(y*32,(y-1)*32,y*32);
    if(v<3){ const f=v?4:0,s=fr[t*40+v*8+f],m=fr[(1-t)*40+v*8+f],keep=v?1:0,leg=(h,i)=>h[i]>=0&&(role[h[i]]=='pants'||role[h[i]]=='shoes'),top=h=>{ for(let i=960;i<1920;i++) if(h[i]>=0&&role[h[i]]=='pants') return (i/32)|0; return 60; },dy=top(g)-top(s);
      let Y=0; for(let i=0;i<1920;i++) if(g[i]>=0&&role[g[i]]=='skin') Y=((i/32)|0)+1;
      for(let i=Y*32;i<1920;i++) if(leg(g,i)) g[i]=-1;
      if(v===2) for(let i=Y*32;i<1920;i++){ const j=i-dy*32; if(j>=0&&j<1920&&leg(s,j)&&g[i]<0) g[i]=s[j]; }
      else for(let y=Y;y<60;y++) for(let x=0;x<32;x++){ const j=(y-dy)*32+x; if(j<0||j>=1920) continue;
        if((x>=16?1:0)===keep){ if(leg(s,j)&&g[y*32+x]<0) g[y*32+x]=s[j]; } else { const k=(y-dy)*32+31-x; if(leg(m,k)&&g[y*32+x]<0) g[y*32+x]=m[k]; } } }
    fr.push(g); }
  return DRAWNF[key]={fr,cut}; }
function drawnOf(B,c){ const o={hide:{}},R=restOf().B,view=F=>{ const sc=Math.round(Math.atan2(dot(F.z,c.r),-dot(F.z,c.f))/(Math.PI/4)); return {view:Math.abs(sc),flip:sc<0&&sc>-4}; };
  if(B.walkF!=null){ const F=frameOf('hips',B); if(F.y.y>=0.87){ o.all={...view(F),f:B.walkF,z:dot(B.J.pelvis,c.f)}; for(const n of PIECES) o.hide[n]=1; return o; } }
  for(const g of ['head','torso']){ const F=frameOf(g,B),ux=dot(F.y,c.r),uy=dot(F.y,c.u),tip=F.y.y<0.87; if(tip&&Math.hypot(ux,uy)<0.8) continue;
    const now=g=='head'?B.head||B.J.head:B.J.chest,rest=g=='head'?R.J.head:R.J.chest;
    o[g]={...view(tip?{z:V(0,0,1)}:F),d:sub(now,rest),z:dot(now,c.f)-DRAWNB[g],rot:tip?((Math.round(Math.atan2(ux,uy)/(Math.PI/2))%4)+4)%4:0,px:16+dot(rest,c.r)*K,py:56-dot(rest,c.u)*K}; for(const n of DRAWNP[g]) o.hide[n]=1; }
  return o; }
const V8=['S','SE','E','NE','N','NW','W','SW'],V8YAW=[0,35,90,145,180,-145,-90,-35],WPX={rows:{},cache:{},off:false};
const STUDIO=['stand','walk','jump','jab','cross','uppercut','frontKick','roundhouse','backflip','frontflip','fall','roll','legSweep','block','crouch','wave'];
let WPALC=null; const wpal=()=>WPALC||(WPALC=(()=>{ const c=[],r=[],seen=new Set(),add=(h,m)=>{ if(seen.has(h+m)) return; seen.add(h+m); c.push(h); r.push(m); };
  WDRAWN.pal.forEach((h,i)=>add(h,WDRAWN.role[i])); for(const m of ['hair','skin','shirt','pants','shoes']) RAMP[m].forEach(h=>add(h,m)); return {c,r}; })());
const wpxGet=key=>{ if(!(key in WPX.rows)) return null; let g=WPX.cache[key]; if(!g){ g=WPX.cache[key]=new Int8Array(64*100).fill(-1); const b=Uint8Array.from(atob(WPX.rows[key]),ch=>ch.charCodeAt(0)); for(let i=0,p=0;i<b.length;i+=2){ if(b[i]) g.fill(b[i]-1,p,p+b[i+1]); p+=b[i+1]; } } return g; };
const wpxPack=g=>{ let s=''; for(let p=0;p<g.length;){ const v=g[p]; let n=1; while(n<255&&p+n<g.length&&g[p+n]===v) n++; s+=String.fromCharCode(v+1,n); p+=n; } return btoa(s); };
const studioAnims=()=>STUDIO.map(n=>[n,n=='stand'?1:n=='walk'?8:Math.max(1,Math.ceil(MOVES[n].dur*10))]);
const POSEC={};
function frameAt(name,f){ if(name=='stand'||name=='walk'||name=='run'){ const st=create(); if(name!='stand'){ st.target=1; st.w=1; st.ph=f/8; if(name=='run'){ st.run=1; st.runTarget=1; } } return pose(st,true); }
  const c=POSEC[name]||(POSEC[name]=(()=>{ const st=create(),out=[]; (ARMMOVES.has(name)?beginUp:begin)(st,name); const m=st.move||st.up,n=Math.max(1,Math.ceil(m.def.dur*10)); m.held=false;
    for(let i=0;i<n;i++){ const T=Math.min(i/10,m.def.dur-1e-3); while((st.move||st.up)&&(st.move||st.up).t<T) tick(st,1/120); out.push(pose(st,true)); } return out; })());
  return c[Math.min(f,c.length-1)]; }
function studioBase(name,f,v){ const B=frameAt(name,f),img=new Uint32Array(64*100),c=cam(V8YAW[v]*D),g=V(B.J.pelvis.x,0,B.J.pelvis.z),{c:pc}=wpal();
  WPX.off=true; draw(B,STUDIOCLOUD(),V8YAW[v]*D,img,64,100,32-Math.round(dot(g,c.r)*K),92+Math.round(dot(g,c.u)*K),1,false,RAMP32); WPX.off=false;
  const idx=new Map(pc.map((h,i)=>[hex(h)>>>0,i])),out=new Int8Array(64*100).fill(-1);
  for(let i=0;i<img.length;i++){ const v32=img[i]>>>0; if(!(v32>>>24)) continue; let k=idx.get(v32); if(k==null){ let b=1e9; pc.forEach((h,j)=>{ const u=hex(h),d=[0,8,16].reduce((a,sh)=>a+(((u>>sh)&255)-((v32>>sh)&255))**2,0); if(d<b){ b=d; k=j; } }); idx.set(v32,k); } out[i]=k; }
  return out; }
let STUDIOC=null; const STUDIOCLOUD=()=>STUDIOC||(STUDIOC=bake(0.5,1));
function drawnCols(ramp){ const {c:pc,r:pr}=wpal(); return pc.map((h,i)=>{ const m=MATS.indexOf(pr[i]),t=ramp[m][1],ch=(v,sh)=>(v>>sh)&255;
  return 0xff000000|[0,8,16].reduce((a,sh)=>a|Math.min(255,Math.round(ch(t,sh)*ch(hex(h),sh)/(ch(hex(RAMP[MATS[m]][1]),sh)||1)))<<sh,0); }); }
let STY={}; const LIGHTR=nrm(V(0.55,0.75,0.5)), LIGHTT=nrm(V(0,1,0.25)), STYTINT={cool:[70,100,190],warm:[130,80,40],purple:[110,60,150]}, BAY=[.125,.625,.875,.375];
function styLevels(ramp,N,tint){ const T=STYTINT[tint], ch=(v,s)=>(v>>s)&255;
  return ramp.map(r=>{ const st=[r[0],r[1],r[2],0xff000000|(((ch(r[2],16)+ch(r[3],16))>>1)<<16)|(((ch(r[2],8)+ch(r[3],8))>>1)<<8)|((ch(r[2],0)+ch(r[3],0))>>1)];
    return Array.from({length:N},(_,n)=>{ const q=n*3/(N-1), a=Math.min(2,Math.floor(q)), f=q-a, m=T?Math.max(0,q-1)/2*.5:0;
      return (0xff000000|[0,8,16].reduce((o,s)=>{ let v=ch(st[a],s)*(1-f)+ch(st[a+1],s)*f; if(T)v=v*(1-m)+T[[0,1,2][s/8]]*m; return o|Math.round(v)<<s; },0))>>>0; }); }); }
const TXH=(a,b)=>{ let h=(a*374761393+b*668265263)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
const TXN=(x,y)=>{ const X=Math.floor(x),Y=Math.floor(y),fx=x-X,fy=y-Y,s=t=>t*t*(3-2*t),a=TXH(X,Y),b=TXH(X+1,Y),c=TXH(X,Y+1),d=TXH(X+1,Y+1); return a+(b-a)*s(fx)+(c-a)*s(fy)+(a-b-c+d)*s(fx)*s(fy); };
const txMix=(v,c,a)=>(0xff000000|[0,8,16].reduce((o,s,i)=>o|Math.round(((v>>s)&255)*(1-a)+c[i]*a)<<s,0))>>>0, txK=(v,f)=>(0xff000000|[0,8,16].reduce((o,s)=>o|Math.min(255,Math.round(((v>>s)&255)*f))<<s,0))>>>0,
  txL=(v,a)=>(0xff000000|[0,8,16].reduce((o,s)=>o|Math.round(((v>>s)&255)+(255-((v>>s)&255))*a)<<s,0))>>>0;
const TXHT=[1,1,0,1, 1,0,0,0, 0,0,0,1, 1,0,1,1], TXPR={star:['..#..','.###.','#####','.#.#.','#...#'],heart:['.#.#.','#####','#####','.###.','..#..'],seven:['#####','...#.','..#..','.#...','.#...'],band:['#####','#####','.....','#####','#####']};
function txPix(v,T,k,i,j,pu,pv,pz,l,pn,bb,h,ramp,skin){ const sz=T.sz||1, U=Math.floor(pu/sz), Vv=Math.floor(pv/sz);
  switch(T.p){ case 'hstripe': if(Vv&1)v=txK(v,.6); break; case 'vstripe': if(U&1)v=txK(v,.6); break; case 'checks': if((U+Vv)&1)v=txK(v,.6); break;
    case 'plaid': { const a=((U%4)+4)%4===0, b=((Vv%4)+4)%4===0; if(a&&b)v=txK(v,.6); else if(a||b)v=txK(v,.8); break; }
    case 'dots': { const a=((U%3)+3)%3, b=(((Vv+(Math.floor(U/3)&1))%3)+3)%3; if(a===1&&b===1)v=txL(v,.6); break; }
    case 'houndstooth': if(TXHT[(((Vv%4)+4)%4)*4+((U%4)+4)%4])v=txK(v,.62); break;
    case 'camo': { const n=TXN(pu/(5*sz),pv/(5*sz)); v=n<.35?txMix(txK(v,.6),[70,80,50],.35):n<.6?txMix(v,[110,105,70],.3):v; break; }
    case 'tiedye': { const t=(Math.sin(pu*.32+pv*.21+Math.sin(pv*.27)*2)+1)*3, c=[[200,60,90],[230,150,50],[230,220,80],[80,180,110],[70,120,210],[150,80,190],[200,60,90]][Math.floor(t)]; v=txMix(v,c,.45); break; }
    case 'gradient': v=txL(v,Math.max(0,Math.min(.35,(pv+20)/90))); break; }
  switch(T.f){ case 'denim': v=((Math.floor(pu)+Math.floor(pv))%3+3)%3===0?txL(txMix(v,[60,90,140],.3),.22):txMix(v,[50,75,120],.25); break; case 'knit': if((Math.floor(pu)&1)===0&&((Math.floor(pv)+(Math.floor(pu/2)&1))&1)===0)v=txK(v,.86); break;
    case 'flannel': { const a=(Math.floor(pu/3)&1)^(Math.floor(pv/3)&1); if(a)v=txK(v,.88); if(((Math.floor(pu)%6)+6)%6===0)v=txL(v,.12); break; }
    case 'leather': v=l>.5?txL(v,.22):txK(v,.92); break; case 'corduroy': v=Math.floor(pu)&1?txK(v,.75):txL(v,.16); break; case 'satin': if(l>0)v=txL(v,.18*l); break; }
  if(T.sh==='satin'&&l>.3)v=txL(v,.15); else if(T.sh==='metal'){ if(l>.72)v=txMix(v,[250,250,245],.65); else if(l<0)v=txK(v,.82); }
  switch(T.w){ case 'patches': { const cx=Math.floor(pu/6), cy=Math.floor(pv/6); if(TXH(cx+91,cy)<.14){ const ex=((Math.floor(pu)%6)+6)%6, ey=((Math.floor(pv)%6)+6)%6; v=(ex===0||ey===0)&&((ex+ey)&1)?txL(v,.45):txL(v,.25); } break; }
    case 'holes': if(TXH(Math.floor(pu)+7,Math.floor(pv))<.035)v=skin; break; case 'frayed': if(h&&(Math.floor(pu)+Math.floor(pv))&1)v=txL(v,.3); break;
    case 'dirt': if(TXH(Math.floor(pu)+3,Math.floor(pv)+11)<.18)v=txMix(v,[120,95,60],.6); break;
    case 'faded': { const g=((v&255)+((v>>8)&255)+((v>>16)&255))/3; v=txL(txMix(v,[g,g,g],.4),.12); break; } }
  if(T.pr&&TXPR[T.pr]&&pn==='torso'&&pz>0&&bb){ const [x0,y0,x1,y1]=bb, w=x1-x0+1, s5=Math.max(1,Math.round(w/14)), px=Math.floor((i-(x0+w/2-2.5*s5))/s5), py=Math.floor((j-(y0+(y1-y0)*.18))/s5);
    if(T.pr==='pocket'){ const qx=i-(x0+Math.round(w*.62)), qy=j-(y0+Math.round((y1-y0)*.16)), q=3*s5; if(qx>=0&&qy>=0&&qx<q&&qy<q&&(qx===0||qy===q-1||qx===q-1||qy===0))v=txK(v,.68); }
    else if(px>=0&&py>=0&&px<5&&py<5&&TXPR[T.pr][py][px]==='#')v=txMix(v,[236,232,220],.85); }
  if(T.h&&bb&&pn==='hair'){ const [x0,y0,x1,y1]=bb, f=(j-y0)/Math.max(1,y1-y0);
    if(T.h==='streaks'&&((Math.floor(pu)%4)+4)%4===0)v=txL(v,.28); else if(T.h==='highlights'&&f<.4)v=txL(v,.22); else if(T.h==='twotone'&&f>.5)v=txMix(v,[214,180,120],.55); else if(T.h==='tips'&&f>.72)v=txMix(v,[70,120,220],.6); }
  if(T.s&&bb){ const [x0,y0,x1,y1]=bb, fx=(i-x0)/Math.max(1,x1-x0), fy=(j-y0)/Math.max(1,y1-y0);
    if(T.s==='freckles'&&pn==='head'&&fy>.3&&fy<.62&&TXH(Math.floor(pu)*3+1,Math.floor(pv)*7)<.24)v=txK(v,.74);
    else if(T.s==='blush'&&pn==='head'&&fy>.55&&fy<.75&&(fx<.38||fx>.62))v=txMix(v,[230,120,120],.32);
    else if(T.s==='stubble'&&pn==='head'&&fy>.68&&((i+j)&1))v=txK(v,.8);
    else if(T.s==='tattoo'&&/^(upperArm|forearm)/.test(pn)&&((Math.floor(pu)+Math.floor(pv))%4+4)%4===0)v=txMix(v,[40,80,90],.6); }
  return v; }
let SHADE=0, SOFT=null; const LIN={};
const LMAP=new Float32Array(160*160), LID=new Int16Array(160*160), LC=0.6;
function draw(P,cloud,yawA,img,W,H,ax,ay,dens,apart,ramp=RAMP32,hide){ const Y=STY, c=cam(yawA),L=yaw(Y.light==='right'?LIGHTR:Y.light==='top'?LIGHTT:LIGHT,-yawA),s=K*dens,N=W*H,sh=Y.lv!=null?Y.lv:SHADE;
  const O0=Y.ol?{...OUTS,on:OUTL}:null; if(O0){ if(Y.ol==='none')OUTL=false; else{ Object.assign(OUTS,Y.ol==='bold'?{col:'#101014',w:2}:Y.ol==='light'?{col:'#f2ead2',w:1}:{col:'#101014',w:1}); OUTL=true; } }
  let b=BUF[N]; if(!b){ b=BUF[N]={pu:new Float32Array(N),pv:new Float32Array(N),pz:new Float32Array(N),rm:new Uint8Array(N),lt:new Float32Array(N),dep:new Float32Array(N),id:new Int16Array(N),tone:new Uint8Array(N),mat:new Uint8Array(N),fix:new Uint8Array(N),dzh:new Float32Array(N),dzt:new Float32Array(N),col:new Uint32Array(N)}; const ks=Object.keys(BUF); if(ks.length>4)delete BUF[ks[0]]; }
  const {pu,pv,pz,rm,lt,dep,id,tone,mat,fix,dzh,dzt,col}=b; const TX=Y.tx||null, AW=Y.rim?mul(c.r,dot(L,c.r)>0?-1:1):null; dep.fill(1e9); id.fill(-1); fix.fill(0); if(cloud.drawn){ dzh.fill(1e9); dzt.fill(1e9); } img.fill(0); let drawn=0;
  const old=cloud.drawn&&dens>=1&&!apart&&!P.props&&typeof WDRAWN!='undefined'?drawnOf(P,c):null;
  let ov=null; if(old&&P.anim&&!WPX.off){ const fw=V(0,0,1),sc=Math.round(Math.atan2(dot(fw,c.r),-dot(fw,c.f))/(Math.PI/4)),g=wpxGet(P.anim+'/'+(sc+8)%8);
    if(g){ const G=V(P.J.pelvis.x,0,P.J.pelvis.z); ov={g,x:Math.round(ax)+Math.round(dot(G,c.r)*s),y:Math.round(ay)-Math.round(dot(G,c.u)*s),z:dot(P.J.pelvis,c.f)}; old.all=old.all||{}; } }
  const names=cloud.names||PIECES, frames=[];
  names.forEach((name,pi)=>{ const piece=cloud[name]; if(!piece||hide&&hide[name]||old&&old.all) return; const F=piece.on=='world'?IDF:piece.on=='prop'?P.props&&P.props[name]:frameOf(piece.on||name,P); if(!F) return;
    frames.push([piece,F,piece.grp?names.indexOf(piece.grp):dens<2&&name.startsWith('fing')?names.indexOf('hand'+name.slice(-1)):pi,old&&old.hide[name]?(DRAWNP.head.includes(name)?dzh:dzt):null]); });
  const lu=nrm(cross(L,Math.abs(L.y)<0.9?V(0,1,0):V(1,0,0))),lv=cross(L,lu);
  if(sh>=2){ LMAP.fill(-1e9); for(const [piece,F,pid] of frames){ const o=apart?add(F.o,piece.apart):F.o,pts=piece.pts;
      const ux=dot(F.x,lu),uy=dot(F.y,lu),uz=dot(F.z,lu),u0=dot(o,lu),vx=dot(F.x,lv),vy=dot(F.y,lv),vz=dot(F.z,lv),v0=dot(o,lv),wx=dot(F.x,L),wy=dot(F.y,L),wz=dot(F.z,L),w0=dot(o,L);
      for(let i=0;i<pts.length;i+=6){ const lx=pts[i],ly=pts[i+1],lz=pts[i+2],cu=Math.floor((u0+lx*ux+ly*uy+lz*uz)/LC)+80,cv=Math.floor((v0+lx*vx+ly*vy+lz*vz)/LC)+80; if(cu<0||cv<0||cu>=160||cv>=160)continue;
        const w=w0+lx*wx+ly*wy+lz*wz,q=cv*160+cu; if(w>LMAP[q]){ LMAP[q]=w; LID[q]=pid; } } } }
  for(const [piece,F,pi,under] of frames){ const o=apart?add(F.o,piece.apart):F.o,pts=piece.pts,mats=piece.mats,pc=piece.col||null;
    const xr=dot(F.x,c.r)*s,yr=dot(F.y,c.r)*s,zr=dot(F.z,c.r)*s,x0=dot(o,c.r)*s+ax, xu=-dot(F.x,c.u)*s,yu=-dot(F.y,c.u)*s,zu=-dot(F.z,c.u)*s,y0=-dot(o,c.u)*s+ay,
      xf=dot(F.x,c.f),yf=dot(F.y,c.f),zf=dot(F.z,c.f),d0=dot(o,c.f), xl=dot(F.x,L),yl=dot(F.y,L),zl=dot(F.z,L),
      lim=TX&&/^(sleeve|upperArm|forearm|hand|fing|thigh|shin|shoe)/.test(names[pi]||''),
      ux=dot(F.x,lu),uy=dot(F.y,lu),uz=dot(F.z,lu),u0=dot(o,lu),vx=dot(F.x,lv),vy=dot(F.y,lv),vz=dot(F.z,lv),v0=dot(o,lv),w0=dot(o,L), ax_=AW?dot(F.x,AW):0,ay_=AW?dot(F.y,AW):0,az_=AW?dot(F.z,AW):0;
    for(let i=0;i<pts.length;i+=6){ const nx=pts[i+3],ny=pts[i+4],nz=pts[i+5]; if(nx*xf+ny*yf+nz*zf>0.05) continue;
      const lx=pts[i],ly=pts[i+1],lz=pts[i+2],sx=x0+lx*xr+ly*yr+lz*zr,sy=y0+lx*xu+ly*yu+lz*zu; if(sx<0||sy<0||sx>=W||sy>=H) continue;
      const k=(sy|0)*W+(sx|0),z=d0+lx*xf+ly*yf+lz*zf; if(under){ if(z<under[k]) under[k]=z; continue; } if(z>=dep[k]) continue;
      const l=nx*xl+ny*yl+nz*zl; dep[k]=z; id[k]=pi; mat[k]=mats[i/6]; col[k]=pc?pc[i/6]:0; lt[k]=l; if(TX){ pu[k]=lx*K; pv[k]=(lim?lz:ly)*K; pz[k]=lz; } if(AW)rm[k]=nx*xf+ny*yf+nz*zf>-0.6&&nx*ax_+ny*ay_+nz*az_>0.4?1:0; drawn++;
      if(!sh){ tone[k]=l>0.62?0:l>-0.3?1:2; continue; }
      let t=l>0.55?0:l>0.05?1:l>-0.4?2:4;
      if(sh>=2&&t<2){ const cu=Math.floor((u0+lx*ux+ly*uy+lz*uz)/LC)+80,cv=Math.floor((v0+lx*vx+ly*vy+lz*vz)/LC)+80; const q=cv*160+cu; if(cu>=0&&cv>=0&&cu<160&&cv<160&&LID[q]!==pi&&w0+lx*xl+ly*yl+lz*zl<LMAP[q]-1){ t=2; lt[k]=Math.min(l,-.17); } }
      tone[k]=t; } }
  let cols=null; const arm=names.map(n=>/^(sleeve|upperArm|forearm|hand|fing)/.test(n)),leg=names.map(n=>/^(thigh|shin|shoe)/.test(n)?n.slice(-1):''),fin=names.map(n=>/^(hand|fing)/.test(n)),splatR=(g,flip,fx,fy,z,pi,dz,rot,px,py,zc,hd)=>{ const cx=fx+(px-16)*dens,cy=fy+(py-56)*dens,r=Math.ceil(64*dens);
    for(let Y=Math.max(0,Math.floor(cy-r));Y<Math.min(H,Math.ceil(cy+r));Y++) for(let X=Math.max(0,Math.floor(cx-r));X<Math.min(W,Math.ceil(cx+r));X++){ let dx=(X+0.5-cx)/dens,dy=(Y+0.5-cy)/dens;
      for(let k=0;k<rot;k++){ const t=dx; dx=dy; dy=-t; } let sx=Math.floor(px+dx); const sy=Math.floor(py+dy); if(flip) sx=31-sx; if(sx<0||sy<0||sx>=32||sy>=60) continue; const ci=g[sy*32+sx]; if(ci<0) continue;
      const k=Y*W+X,zk=dz&&dz[k]<1e9?dz[k]:z,a=id[k]>=0&&arm[id[k]]; if(a?(hd?dep[k]<zc-3:dep[k]<zc+3):zk>=dep[k]) continue; dep[k]=Math.min(zk,dep[k]); id[k]=pi; fix[k]=ci+1; drawn++; } };
  const splat=(g,flip,fx,fy,z,pi,dz,gw=32,gh=60,gx=16,gy=56)=>{ const xa=Math.max(0,Math.ceil(fx-gx*dens-0.5)),xb=Math.min(W,Math.ceil(fx+(gw-gx)*dens-0.5)),ya=Math.max(0,Math.ceil(fy-gy*dens-0.5)),yb=Math.min(H,Math.ceil(fy+(gh-gy)*dens-0.5));
    for(let Y=ya;Y<yb;Y++){ const sy=Math.floor((Y+0.5-fy)/dens+gy); if(sy<0||sy>=gh) continue;
      for(let X=xa;X<xb;X++){ let sx=Math.floor((X+0.5-fx)/dens+gx); if(flip) sx=gw-1-sx; if(sx<0||sx>=gw) continue; const ci=g[sy*gw+sx]; if(ci<0) continue;
        const k=Y*W+X,zk=dz&&dz[k]<1e9?dz[k]:z; if(zk>=dep[k]) continue; dep[k]=zk; id[k]=pi; fix[k]=ci+1; drawn++; } } };
  if(ov) splat(ov.g,false,ov.x,ov.y,ov.z,names.indexOf('torso'),null,64,100,32,92);
  else if(old){ const D=drawnFrames();
    if(old.all){ const a=old.all; splat(a.f<0?D.fr[80+(a.flip?5:0)+a.view]:D.fr[(a.flip?40:0)+a.view*8+a.f],a.flip,Math.round(ax),Math.round(ay),a.z,names.indexOf('torso')); }
    for(const g of ['head','torso']){ const o=old[g]; if(!o) continue; splatR(D.cut[o.view*2+(o.flip?1:0)][g=='head'?0:1],o.flip,Math.round(ax)+Math.round(dot(o.d,c.r)*s),Math.round(ay)+Math.round(-dot(o.d,c.u)*s),o.z,names.indexOf(DRAWNP[g][0]),g=='head'?dzh:dzt,o.rot,o.px,o.py,o.z+DRAWNB[g],g=='head'); } }
  const deep=sh?ramp.map(r=>{ const a=r[2],e=r[3]; return 0xff000000|((((a>>16)&255)+((e>>16)&255))>>1)<<16|((((a>>8)&255)+((e>>8)&255))>>1)<<8|(((a&255)+(e&255))>>1); }):null;
  const soft=SOFT?names.map(n=>SOFT.test(n)):null;
  const BB=TX?names.map(()=>null):null; if(TX)for(let j=0;j<H;j++) for(let i=0;i<W;i++){ const h=id[j*W+i]; if(h<0)continue; const b=BB[h]||(BB[h]=[i,j,i,j]); if(i<b[0])b[0]=i; if(j<b[1])b[1]=j; if(i>b[2])b[2]=i; if(j>b[3])b[3]=j; }
  const TXT=TX?MATS.map(m=>TX[m]||null):null, SKIN=ramp[MATS.indexOf('skin')][2], txAt=(v,k,i,j,h,e)=>{ const T=TXT[mat[k]]; return T?txPix(v,T,k,i,j,pu[k],pv[k],pz[k],lt[k],names[h].replace(/[LR]$/,''),BB[names.indexOf(T.h?'hair':T.s?'head':'torso')]||BB[h],e,ramp,SKIN):v; };
  const SN=Y.tones||(Y.tint||Y.dith?4:0), lev=SN?styLevels(ramp,SN,Y.tint):null, stp=(k,i,j)=>{ const f=Math.max(0,Math.min(3,(0.8-lt[k])/0.47))*(SN-1)/3, b=Math.floor(f); return Math.min(SN-1,Y.dith?(f-b>BAY[(j&1)*2+(i&1)]?b+1:b):Math.round(f)); };
  const styled=OUTL&&(OUTS.col||OUTS.tone||OUTS.a<100||OUTS.w>1),lin=styled?(LIN[N]||(LIN[N]=new Uint32Array(N))):null; if(lin) lin.fill(0); if(styled&&!OUTP) OUTP=outPal(WDRAWN.role);
  for(let j=0;j<H;j++) for(let i=0;i<W;i++){ const k=j*W+i,h=id[k]; if(h<0) continue; let crease=false; if(fix[k]){ const c=(cols||(cols=drawnCols(ramp)))[fix[k]-1]; img[k]=styled&&OUTP[fix[k]-1]?(lin[k]=lineCol(c,i+1>=W||i<1||j+1>=H||j<1||id[k+1]<0||id[k-1]<0||id[k+W]<0||id[k-W]<0)):c; continue; } let edge=false;
    for(const kk of [i+1<W?k+1:-1,i>0?k-1:-1,j+1<H?k+W:-1,j>0?k-W:-1]){ if(kk<0||id[kk]<0||fix[kk]&&WDRAWN.role[fix[kk]-1]!==MATS[mat[k]]){ edge=true; break; }
      if(id[kk]!==h&&(dep[kk]-dep[k]>(mat[kk]===mat[k]?3.5:1.6)||leg[h]&&leg[id[kk]]&&leg[h]!==leg[id[kk]]&&dep[kk]>=dep[k])){ edge=true; break; }
      if(id[kk]!==h&&fin[h]&&fin[id[kk]]&&(dep[kk]<dep[k]-0.5||Math.abs(dep[kk]-dep[k])<=0.5&&id[kk]<h)) crease=true; }
    if(col[k]){ const v=col[k],f=edge&&OUTL?0.3:lev?1-stp(k,i,j)*0.45/(SN-1):tone[k]==4?0.55:tone[k]==2?0.7:tone[k]==1?0.86:1; img[k]=(0xff000000|Math.round(((v>>16)&255)*f)<<16|Math.round(((v>>8)&255)*f)<<8|Math.round((v&255)*f))>>>0; if(TX&&!(edge&&OUTL))img[k]=txAt(img[k],k,i,j,h,edge); continue; }
    if(soft&&soft[h]){ const t=tone[k]; img[k]=t===0?ramp[mat[k]][1]:t===1?ramp[mat[k]][2]:deep?deep[mat[k]]:ramp[mat[k]][3]; continue; }
    img[k]=edge&&OUTL&&!(soft&&soft[h])?(styled?(lin[k]=lineCol(ramp[mat[k]][3],i+1>=W||i<1||j+1>=H||j<1||id[k+1]<0||id[k-1]<0||id[k+W]<0||id[k-W]<0)):ramp[mat[k]][3]):crease?(deep?deep[mat[k]]:ramp[mat[k]][2]):tone[k]==4?deep[mat[k]]:ramp[mat[k]][!sh&&tone[k]==0&&dens<2?1:tone[k]];
    if(lev&&!(edge&&OUTL&&!(soft&&soft[h]))&&!crease)img[k]=lev[mat[k]][stp(k,i,j)];
    if(TX&&!(edge&&OUTL&&!(soft&&soft[h])))img[k]=txAt(img[k],k,i,j,h,edge); }
  for(let p=1;p<(OUTL?OUTS.w:0);p++){ const was=lin.slice();
    for(let j=0;j<H;j++) for(let i=0;i<W;i++){ const k=j*W+i; if(img[k]>>>24) continue; let c=0;
      for(const kk of [i+1<W?k+1:-1,i>0?k-1:-1,j+1<H?k+W:-1,j>0?k-W:-1]) if(kk>=0&&was[kk]){ c=was[kk]; break; }
      if(c){ img[k]=c; lin[k]=c; } } }
  if(AW)for(let k=0;k<N;k++){ if(id[k]<0||!rm[k]||fix[k])continue; const v=img[k]; if((v&0xffffff)===(ramp[mat[k]][3]&0xffffff))continue;
    img[k]=(0xff000000|[0,8,16].reduce((o,s)=>o|Math.round(((v>>s)&255)+(255-((v>>s)&255))*[.42,.38,.3][s/8])<<s,0))>>>0; }
  if(O0){ OUTL=O0.on; delete O0.on; Object.assign(OUTS,O0); }
  return drawn; }

const travel=st=>{ const m=st.move,z=m&&m.def.travel?m.def.k[m.def.k.length-1].P.root.z:0; return z&&st.last?clamp(st.last.root.z/z,0,1):1; };
const JUMP0=MOVES.jump.src;
function tune(o){ G=o.g;
  for(const k in MOVES){ const s=MOVES[k].src; if(!s)continue; if(k!=='jump'){ MOVES[k]=jumpMove(s); continue; }
    const v0=4*o.jh/o.jT, g=8*o.jh/(o.jT*o.jT), keys=JUMP0.keys.map(([t,c,e])=>[typeof t=='string'?t:t>=100?100+(t-100)*o.rec/.34:t*o.crouch/JUMP0.t0,c,e]);
    MOVES.jump=jumpMove({...JUMP0,v0,g,t0:o.crouch,keys}); } }
return {rbox,ell,rcone,box,OVL,LOOK,begin,beginUp,legIK,START,mkMove:move,ARMMOVES,fine:v=>{ FINEHAND=!!v; },farOnly:v=>{ FAR=!!v; },restOf,IDF,viewPitch:v=>{ VPITCH=v; },far:v=>{ FAR=!!v; DIGC.clear(); },create,step,pose,act,release,beginUp,tune,WPX,V8,wpal,wpxGet,wpxPack,studioAnims,studioBase,RIGT,WALK,RUN,G:()=>G,water,travel,handed,bake,baker,draw,depth:N=>BUF[N]&&BUF[N].dep,pid:N=>BUF[N]&&BUF[N].id,tint,ramp32,project,overlaps,build,walkPose,shell,MOVES,GAITV,KEYMOVE,gaitOf,BONES,PIECES,RAMP,SPEED,CYCLE,PX,V,D,
  apply,STANDK,RIDEG,mix,clearPose,settle,rcone,ell,box,rbox,add,sub,mul,nrm,cross,dot,len,STAND,ANKLE,FOOTX,frameOf,MATS,
  DIG,digitBase,digitFK,fgOf,hand,yaw,get THIGH(){ return THIGH; },get SHIN(){ return SHIN; },get UPPER(){ return UPPER; },get FORE(){ return FORE; },get HIPX(){ return HIPX; },
  get RIGP(){ return RIGP; },get RIGGEN(){ return RIGGEN; },rigSet,rigGet,rigDefault,refit,CLIMB,climbHolds,fitPts,frameAt,rawBake:v=>{ RAWBAKE=!!v; },cam,K,shade:n=>{ if(n!=null)SHADE=n; return SHADE; },style:s=>{ const o=STY; if(s!==undefined)STY=s||{}; return o; },soft:v=>{ if(v!==undefined)SOFT=v; return SOFT; },outline:o=>{ if(o){ Object.assign(OUTS,o); OUTL=OUTS.w>0; try{ localStorage.setItem('isowalk-outline2',JSON.stringify(OUTS)); }catch(e){} } return OUTS; }};
})();
if(typeof module!=='undefined') module.exports=RIG;

