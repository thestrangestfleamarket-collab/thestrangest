const GTF=(()=>{ const {V,add,mul,nrm,cross,dot,sub}=RIG, y=nrm(V(0.9,0.38,0.12)), z0=V(-0.1,0.16,1), z=nrm(sub(z0,mul(y,dot(z0,y)))), x=cross(y,z);
  return {o:V(-4,22.5,8.2),x,y,z}; })();
const gtAt=(x,y,z)=>RIG.add(GTF.o,RIG.add(RIG.add(RIG.mul(GTF.x,x),RIG.mul(GTF.y,y)),RIG.mul(GTF.z,z)));
const gtStr=(i,y,z)=>gtAt(GT.sx(i,y),y,z);
const GTH=(()=>{ const {add,mul,nrm}=RIG, L={y:GTF.z,z:nrm(add(mul(GTF.x,-0.225),mul(GTF.y,-0.974)))}, R={y:nrm(add(GTF.x,mul(GTF.z,-0.017))),z:nrm(add(add(mul(GTF.x,-0.008),mul(GTF.y,-0.891)),mul(GTF.z,-0.454)))};
  const arr=v=>[v.x,v.y,v.z]; return {L,R,hf:{L:{y:arr(L.y),z:arr(L.z)},R:{y:arr(R.y),z:arr(R.z)}}}; })();
const gtMix=(a,b,u)=>RIG.add(RIG.mul(a,1-u),RIG.mul(b,u)), gtSm=u=>{ u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u); };
const GTPRESS=GT.FB+0.3, GTHOVER=GT.FB+1.0;
function gtLeft(t){ const out=[]; out.w=[]; for(let f=1;f<=4;f++){ let cur=null, prev=null, next=null;
    for(const q of GTLH){ if(q.f!==f)continue; if(q.t0<=t&&t<q.t1){ if(!cur||q.s>cur.s)cur=q; } else if(q.t1<=t)prev=q; else if(!next&&q.t0>t)next=q; }
    const press=q=>gtStr(q.s,GT.mid(q.k),GTPRESS), hover=q=>q?gtStr(q.s,GT.mid(q.k),GTHOVER):gtStr(3,GT.mid(Math.round(gtPosAt(t))+f-1),GTHOVER);
    if(cur){ out[f]=press(cur); out.w[f]=1; continue; }
    if(next&&next.t0-t<0.1){ const u=gtSm(1-(next.t0-t)/0.1); out[f]=gtMix(hover(next),press(next),u); out.w[f]=0.1+0.9*u; continue; }
    if(prev&&t-prev.t1<0.08){ const u=gtSm((t-prev.t1)/0.08); out[f]=gtMix(press(prev),hover(prev),u); out.w[f]=1-0.9*u; continue; }
    const a=(prev?prev.t1:t)+0.08, b=(next?next.t0:t+1)-0.1; out[f]=gtMix(hover(prev||next),hover(next||prev),gtSm((t-a)/Math.max(0.05,b-a))); out.w[f]=0.1; }
  for(let f=1;f<=4;f++)for(let g=f+1;g<=4;g++){ const d=RIG.sub(out[g],out[f]), along=RIG.dot(d,GTF.y), off=RIG.len(d); if(off>=0.42)continue; const push=(0.42-off)/2*(along<0?-1:1); out[f]=RIG.add(out[f],RIG.mul(GTF.y,-push)); out[g]=RIG.add(out[g],RIG.mul(GTF.y,push)); }
  return out; }
const GTRH={p:0,i:1,m:2,a:3}, GTHOME=[5,3,2,1], GTYP=[GT.YP+1.3,GT.YP+0.65,GT.YP,GT.YP-0.6];
function gtRight(t){ const out=[]; out.w=[]; for(const r in GTRH){ const d=GTRH[r]; let last=null, next=null;
    for(const n of GTTUNE){ if(n.r!==r)continue; if(n.t<=t)last=n; else { next=n; break; } }
    const yp=GTYP[d], z0=s=>GT.sz(yp)+0.3, s=next?next.s:last?last.s:GTHOME[d];
    const rest=gtStr(s,yp,z0(s)+0.3), on=n=>gtStr(n.s,yp,z0(n.s)-0.02), thru=n=>RIG.add(gtStr(n.s,yp,z0(n.s)+0.15),RIG.mul(GTF.x,(d==0?1:-1)*(0.25+0.4*n.amp)));
    if(last&&t-last.t<0.06){ out[d]=gtMix(on(last),thru(last),gtSm((t-last.t)/0.06)); out.w[d]=1; continue; }
    if(next&&next.t-t<0.16){ const u=gtSm(1-(next.t-t)/0.16); out[d]=gtMix(last&&t-last.t<0.3?thru(last):rest,on(next),u); out.w[d]=0.1+0.9*u; continue; }
    if(last&&t-last.t<0.3){ const u=gtSm((t-last.t-0.06)/0.24); out[d]=gtMix(thru(last),rest,u); out.w[d]=1-0.9*u; continue; }
    out[d]=rest; out.w[d]=0.1; }
  let pv=null, nx=null; for(const e of GTSTRUM){ if(e.t0<=t)pv=e; else { nx=e; break; } }
  const end=pv?pv.t0+pv.T:-9, near=pv&&t<end+0.15||nx&&nx.t0-t<0.15||pv&&nx&&nx.t0-end<0.7;
  if(near){ const z=GT.sz(GT.YS)+0.24, sw=(e,u)=>gtAt(e.x0+(e.x1-e.x0)*u,GT.YS,z), up=(e,u)=>RIG.add(sw(e,u),RIG.mul(GTF.z,0.45));
    let T; if(pv&&t<=end)T=sw(pv,(t-pv.t0)/pv.T);
    else if(nx&&t>=nx.t0-0.04)T=gtMix(up(nx,0),sw(nx,0),gtSm((t-(nx.t0-0.04))/0.04));
    else { const a=pv?end:t-1, b=nx?nx.t0-0.04:end+0.15; T=gtMix(pv?up(pv,1):out[1],nx?up(nx,0):out[1],gtSm((t-a)/Math.max(0.05,b-a))); }
    out[1]=T; out.w[1]=1; out[2]=RIG.add(RIG.add(T,RIG.mul(GTF.y,-0.55)),RIG.mul(GTF.z,0.35)); out[3]=RIG.add(RIG.add(T,RIG.mul(GTF.y,-1.05)),RIG.mul(GTF.z,0.6));
    out[0]=RIG.add(RIG.add(T,RIG.mul(GTF.y,1.0)),RIG.add(RIG.mul(GTF.z,0.3),RIG.mul(GTF.x,-0.4))); out.w[0]=out.w[2]=out.w[3]=0.03; }
  return out; }
function gtReach(B0,i,T){ const {sub,dot,nrm,add,mul}=RIG, d=sub(T,B0.K), L=RIG.DIG[i][3], db=dot(d,B0.b), sp=Math.max(-0.8,Math.min(0.8,dot(d,B0.e)/Math.max(0.4,db)));
  const u=nrm(add(B0.b,mul(B0.e,sp))), c=nrm(sub(B0.c,mul(u,dot(B0.c,u)))), A=dot(d,u), C=dot(d,c), r=Math.hypot(A,C);
  const tip=b=>{ let t=0,x=0,y=0; for(const [l,q] of [[L[0],0],[L[1],b],[L[2],b*0.7]]){ t+=q; x+=l*Math.cos(t); y+=l*Math.sin(t); } return [x,y]; };
  let lo=0, hi=115*RIG.D; if(Math.hypot(...tip(0))<=r)hi=0; else for(let k=0;k<18;k++){ const m=(lo+hi)/2; if(Math.hypot(...tip(m))>r)lo=m; else hi=m; }
  const [tx,ty]=tip(hi), a=Math.atan2(C,A)-Math.atan2(ty,tx); return [Math.max(-45*RIG.D,Math.min(100*RIG.D,a)),hi,hi*0.7,sp]; }
const gtG=p=>GT.SOLID(gtLocal(p));
const gtNrm=(f,p)=>{ const {V,nrm}=RIG, e=0.05; return nrm(V(f(V(p.x+e,p.y,p.z))-f(V(p.x-e,p.y,p.z)),f(V(p.x,p.y+e,p.z))-f(V(p.x,p.y-e,p.z)),f(V(p.x,p.y,p.z+e))-f(V(p.x,p.y,p.z-e)))); };
const gtLocal=p=>{ const d=RIG.sub(p,GTF.o); return RIG.V(RIG.dot(d,GTF.x),RIG.dot(d,GTF.y),RIG.dot(d,GTF.z)); };
function gtDigit(hf,s,i,T0){ let T=T0, fg=null; for(let k=0;k<20;k++){ const B0=RIG.digitBase(hf,s,i); fg=gtReach(B0,i,T); const J=RIG.digitFK(B0,i,fg), r=RIG.DIG[i][4]; let inWood=null;
    for(let j=1;j<=3&&!inWood;j++){ const a=J[j-1],b=J[j]; for(const u of [0.5,1]){ const p=RIG.add(a,RIG.mul(RIG.sub(b,a),u)); if(GT.SOLID(gtLocal(p))<r[j]*0.7){ inWood=p; break; } } }
    if(!inWood)break; T=RIG.add(T,RIG.mul(gtNrm(gtG,inWood),0.12)); } return fg; }
function gtArm(P,n,T,pole,sy=13.3+RIG.STAND){ const {V,sub,add,mul,len,nrm,dot}=RIG, s=n=='L'?1:-1, U=7.4, F=6.3, S=V(s*6.8,sy,0), d0=sub(T,S);
  const Lr=Math.min(U+F-.05,Math.max(Math.abs(U-F)+.5,len(d0))), u=nrm(d0), a=(U*U-F*F+Lr*Lr)/(2*Lr), h=Math.sqrt(Math.max(0,U*U-a*a));
  let pl=nrm(sub(pole,mul(u,dot(pole,u)))); const E=add(mul(u,a),mul(pl,h)), Wr=mul(u,Lr), fa=nrm(sub(Wr,E)), ua=nrm(E);
  const ang=v=>[Math.atan2(v.z,-v.y),Math.asin(Math.max(-1,Math.min(1,s*v.x)))]; P[n].ua=ang(ua); P[n].fa=ang(fa); }
const GTPOLE={L:RIG.V(0.5,-1,0.45),R:RIG.V(-1.7,0.2,-0.2)};
const gtBodyD=J=>{ const B=RIG.shell(J,0,null,null).filter(q=>/^(torso|hips|thigh|neck)/.test(q.n)); return p=>{ let d=1e9; for(const q of B){ const v=q.d(p); if(v<d)d=v; } return d; }; };
function gtArmPts(J,n){ const {add,mul,sub}=RIG, S=J['shoulder'+n],E=J['elbow'+n],W=J['wrist'+n],H=J['handO'+n]||W,K=J['k20'+n], o=[];
  for(const u of [0.45,0.75,1]) o.push([add(S,mul(sub(E,S),u)),2.58-0.18*u,0,u,false]);
  for(const u of [0.25,0.5,0.75,1]) o.push([add(E,mul(sub(W,E),u)),2.4-1.55*u,u,1-u,true]);
  for(const u of [0.45,0.9]) o.push([add(H,mul(sub(K,H),u)),0.55,1,0,true]);
  return o; }
function gtSolid(J,body){ const {V,add,sub,mul,len}=RIG, push={L:{w:V(0,0,0),e:V(0,0,0)},R:{w:V(0,0,0),e:V(0,0,0)}}, pts={L:gtArmPts(J,'L'),R:gtArmPts(J,'R')};
  for(const n of 'LR'){ const q=push[n], hit=(N,pen,sw,se)=>{ q.w=add(q.w,mul(N,pen*sw)); q.e=add(q.e,mul(N,pen*se)); };
    for(const [p,r,sw,se,b] of pts[n]){ let d=gtG(p); if(d<r)hit(gtNrm(gtG,p),r-d,sw,se);
      if(b){ d=body(p); if(d<r)hit(gtNrm(body,p),r-d,sw,se);
        for(const [p2,r2,,,b2] of pts[n=='L'?'R':'L']) if(b2){ const v=sub(p,p2), l=len(v); if(l<r+r2)hit(l>1e-6?mul(v,1/l):V(0,1,0),(r+r2-l)/2,sw,se); } } } }
  return push; }
function gtApart(hf,s,fg){ const {add,mul,sub,len}=RIG, pts=i=>{ const J=RIG.digitFK(RIG.digitBase(hf,s,i),i,fg[i]); return [add(J[1],mul(sub(J[2],J[1]),0.5)),J[2],add(J[2],mul(sub(J[3],J[2]),0.5)),J[3]]; };
  const gap=(i,k)=>{ const A=pts(i),Bp=pts(k), r=(RIG.DIG[i][4][2]+RIG.DIG[k][4][2])*0.68; let m=1e9; for(const a of A)for(const b of Bp)m=Math.min(m,len(sub(a,b))-r); return m; };
  for(let round=0;round<4;round++){ let moved=false; for(let i=0;i<5;i++)for(let k=i+1;k<5;k++){ const g=gap(i,k); if(g>=0)continue; const f=fg[k], sp=f[3];
      f[3]=Math.min(0.8,sp+0.06); const up=gap(i,k); f[3]=Math.max(-0.8,sp-0.06); const dn=gap(i,k); f[3]=up>=dn?Math.min(0.8,sp+0.06):Math.max(-0.8,sp-0.06); moved=true; }
    if(!moved)break; }
  return fg; }
const GTREST=RIG.fgOf({}), GTFLAT=[0,-0.08,0,0.06,0.12].map(sp=>[0,0,0,sp]);
const gtClear=(hf,s,i,f)=>{ const r=RIG.DIG[i][4]; f=f.slice(); for(let k=0;k<10;k++){ const J=RIG.digitFK(RIG.digitBase(hf,s,i),i,f); let ok=true; for(let j=1;j<=3&&ok;j++)if(gtG(J[j])<r[j]*0.7)ok=false; if(ok)break; f[0]=Math.max(-45*RIG.D,f[0]-6*RIG.D); } return f; };
function gtDigitFrom(hf,s,i,T,from,w){ const fg=gtDigit(hf,s,i,T), r=RIG.DIG[i][4]; for(let u=gtSm((w-0.1)/0.9);u<=1.001;u+=0.2){ const m=from.map((v,j)=>v+(fg[j]-v)*Math.min(1,u)), J=RIG.digitFK(RIG.digitBase(hf,s,i),i,m);
    let ok=true; for(let j=1;j<=3&&ok;j++)if(GT.SOLID(gtLocal(J[j]))<r[j]*0.7)ok=false; if(ok)return m; } return fg; }
function gtPose(t){ const {add,mul,sub,dot,V,nrm}=RIG, T={L:gtLeft(t),R:gtRight(t)}, strum=GTSTRUM.some(e=>t>e.t0-.3&&t<e.t0+e.T+.3), off={L:V(0,0,0),R:V(0,0,0)}, sol={L:V(0,0,0),R:V(0,0,0)}, el={L:V(0,0,0),R:V(0,0,0)}; let P, body=null;
  let yw=0, W0=0; for(let f=1;f<=4;f++){ const w=T.L.w[f]||0; yw+=dot(sub(T.L[f],GTF.o),GTF.y)*w; W0+=w; }
  const yc=(GT.mid(Math.round(gtPosAt(t))+1)+GT.mid(Math.round(gtPosAt(t))+2))/2, yT=W0>0.5?(yw/W0)*0.85+yc*0.15:yc, Wr={L:gtAt(2.54,yT-0.43,-1.33),R:gtAt(...GTWR.R)};
  for(let it=0;it<7;it++){ P=JSON.parse(JSON.stringify(castPose('stand'))); P.bend=0; P.side=0; P.nod=-17*RIG.D; P.look=14*RIG.D; P.cyaw=-4*RIG.D;
    for(const n of 'LR'){ gtArm(P,n,add(add(Wr[n],off[n]),sol[n]),nrm(add(GTPOLE[n],mul(el[n],2)))); P[n].hf=GTH.hf[n]; P[n].hfw=1; }
    const B=RIG.build(P,null); if(!body)body=gtBodyD(B.J);
    T.yT=yT; gtFing(P,B,T);
    const ps=gtSolid(B.J,body); for(const n of 'LR'){ sol[n]=add(sol[n],mul(ps[n].w,1.2)); el[n]=add(el[n],ps[n].e); }
    if(it==6)break; const B2=RIG.build(P,null);
    for(const n of 'LR'){ let m=V(0,0,0), W=0; for(let i=n=='L'?1:0;i<(n=='L'?5:4);i++){ const w=T[n].w[i]||0; m=add(m,mul(sub(T[n][i],B2.J['k'+i+'3'+n]),w)); W+=w; }
      off[n]=add(off[n],mul(m,1/Math.max(W,1e-6))); const l=RIG.len(off[n]), mx=n=='L'?1.6:strum?3.2:1.0; if(l>mx)off[n]=mul(off[n],mx/l); } }
  for(let k=0;k<3;k++){ const ps=gtSolid(RIG.build(P,null).J,body); let big=0; for(const n of 'LR'){ big=Math.max(big,RIG.len(ps[n].w),RIG.len(ps[n].e)); sol[n]=add(sol[n],mul(ps[n].w,1.2)); el[n]=add(el[n],ps[n].e); }
    if(big<0.02)break; for(const n of 'LR')gtArm(P,n,add(add(Wr[n],off[n]),sol[n]),nrm(add(GTPOLE[n],mul(el[n],2)))); }
  P._T=T; return P; }
function gtFing(P,B,T){ const yT=T.yT;
  P.L.fg=gtApart(B.m.hf.L,1,[0,1,2,3,4].map(i=>i?T.L[i]?gtDigitFrom(B.m.hf.L,1,i,T.L[i],GTREST[i],Math.max(0.6,T.L.w[i]||0)):gtClear(B.m.hf.L,1,i,GTREST[i]):gtDigit(B.m.hf.L,1,0,gtAt(-0.15,yT,-0.95))));
  P.R.fg=gtApart(B.m.hf.R,-1,[0,1,2,3,4].map(i=>i<4&&T.R[i]?gtDigitFrom(B.m.hf.R,-1,i,T.R[i],GTFLAT[i],T.R.w[i]||0):gtClear(B.m.hf.R,-1,i,GTFLAT[i]))); }

function npcSpring(a,P,dt,items){ const S=a.sp||(a.sp={}), h=Math.min(dt,.05), n=Math.max(1,Math.ceil(h*120)), d=h/n;
  for(const [k,get,set,w] of items){ const tg=get(P).flat(); let st=S[k]; if(!st||st.x.length!==tg.length){ const fr=a.P&&a.P!==P?get(a.P):null; st=S[k]={x:(fr?fr.flat():tg).slice(),v:tg.map(()=>0)}; }
    for(let i=0;i<tg.length;i++){ let x=st.x[i], v=st.v[i]; for(let j=0;j<n;j++){ v+=(w*w*(tg[i]-x)-2*w*v)*d; x+=v*d; } st.x[i]=x; st.v[i]=v; }
    set(P,st.x); } }
const NPCARMS=[['Lua',P=>P.L.ua,(P,x)=>{ P.L.ua=[x[0],x[1]]; },10],['Lfa',P=>P.L.fa,(P,x)=>{ P.L.fa=[x[0],x[1]]; },15],['Rua',P=>P.R.ua,(P,x)=>{ P.R.ua=[x[0],x[1]]; },10],['Rfa',P=>P.R.fa,(P,x)=>{ P.R.fa=[x[0],x[1]]; },15]];
const NPCFING=[['Lfg',P=>P.L.fg,(P,x)=>{ P.L.fg=[0,1,2,3,4].map(i=>x.slice(i*4,i*4+4)); },38],['Rfg',P=>P.R.fg,(P,x)=>{ P.R.fg=[0,1,2,3,4].map(i=>x.slice(i*4,i*4+4)); },38]];
const GTSLUNG={o:RIG.V(-1.8,19.2,7.0)};

CAST.walker={id:'walker',name:'the Walker',own:true,tall:69,cos:(J,base)=>base.concat([GT.PIECE]),look:{}};
{ const c=CAST.walker; c.ramp=RIG.ramp32(c.look); c.dens=Math.round(52*c.tall*.0254/1.75)/52; c.cloud=null; c.baker=null; }
function gtStep(a,dt,now){ if(!a.playing){ castStep(a,dt,now); if(a.B)gtSlung(a,a.B); return; }
  GTS.t+=dt; const t=GTS.t, P=gtPose(t); npcSpring(a,P,dt,NPCARMS); gtFing(P,RIG.build(P,null),P._T); npcSpring(a,P,dt,NPCFING); a.t+=dt;
  a.P=P; a.pose='guitar'; a.to='guitar'; const B=RIG.settle(RIG.build(P,null),0); B.head=B.J.head; B.props={guitar:GTF}; a.B=B;
  for(let i=0;i<6;i++)GTS.env[i]*=Math.exp(-dt*(i>2?0.9:1.6));
  while(GTS.i<GTTUNE.length&&GTTUNE[GTS.i].t<=t){ const n=GTTUNE[GTS.i++]; GTS.env[n.s-1]=1; }
  for(const q of GTDAMP)if(q.t<=t&&q.t>t-dt)GTS.env[q.s-1]*=0.1;
  gtSound(a,t); }
function gtSound(a,t){ if(PLAY221.seeking)return; const ok=GTPHYS.model?gtPhys():gtAudio(); if(!ok)return; const c=SND.ctx, ct=c.currentTime, A=t+0.1, when=x=>ct+Math.max(0,x-t)+0.03;
  const d=Math.hypot(a.x-P.x,a.y-P.y); GTA.g.gain.setTargetAtTime(SND.on?0.42*Math.max(0.2,1-d/9):0,ct,0.05);
  { const [sx]=toS(...vw(a.x,a.y)), [px]=toS(...vw(P.x,P.y)); GTA.pan.pan.setTargetAtTime(Math.max(-0.8,Math.min(0.8,(sx-px)/120)),ct,0.1); }
  while(GTS.sent<GTEV.length&&GTEV[GTS.sent].t<=A){ const e=GTEV[GTS.sent++]; if(e.t<t-0.05)continue;
    if(e.n)gtPlay(e.n.s,e.n.at,when(e.t),e.n.amp,e.n.tone,e.n.r); else gtMute(e.s,when(e.t),0.04); } }
function gtStop(){ if(!SND.ctx)return; for(let s=1;s<=6;s++)gtMute(s,SND.ctx.currentTime,0.15); }
function gtSlung(a,B){ const {V,nrm,cross,sub,mul,dot}=RIG, y=nrm(V(0.75,0.62,0.1)), z0=V(-0.2,0.1,1), z=nrm(sub(z0,mul(y,dot(z0,y)))); B.props.guitar={o:GTSLUNG.o,x:cross(y,z),y,z}; }
window.__gtStep=gtStep; window.__guitar={GTA,GTS,get GTTUNE(){ return GTTUNE; },get GTLH(){ return GTLH; },get GTSTRUM(){ return GTSTRUM; },GTBOOK,get song(){ return GTSONG; },set:gtSet,next:gtNext,PLAY221,PLAYA,get SND(){ return SND; },pre:()=>PLAY221.pre,hz:gtHz,get pm(){ return GTPM; }};
