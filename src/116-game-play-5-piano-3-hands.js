const PK={W:0.698,Y:21.4,Z:10,LW:4.46,LB:2.8,PIV:9};
const pkX=m=>(25.5-pnWhite(m))*PK.W;
const PKEYS=[]; for(let m=21;m<=108;m++)PKEYS.push(m);
const PNPIECES=(J,base)=>{ const {V,add,sub,mul,len,box,rcone}=RIG, out=[];
  for(const p of base){ const n=p.n;
    if(n==='torso')out.push(Object.assign({},p,{paint:q=>{ if(q.z<1.4)return null; const ax=Math.abs(q.x);
      if(q.y>31.4&&ax<2.4)return 'linen'; if(Math.abs(q.y-30.8)<.3+ax*.18&&ax<1.6)return 'tie';
      if(q.y>23.5&&ax<(q.y-23.5)*.4){ if(ax<.22&&((q.y*1.6)|0)%3===0)return 'tie'; return 'linen'; }
      if(q.y>23.5&&ax<(q.y-23.5)*.4+.7)return 'vest'; return null; }}));
    else if(/^(sleeve|upperArm|forearm)[LR]$/.test(n)){ const W=J['wrist'+n.slice(-1)]; out.push(Object.assign({},p,{m:'shirt',paint:n.startsWith('forearm')?q=>len(sub(q,W))<1.1?'linen':null:null})); }
    else out.push(p); }
  out.push({n:'bench',on:'prop',m:'wood',d:q=>Math.min(box(q,V(0,10.6,-1.5),V(11.4,.5,5.4)),...[[10,2.9],[10,-5.9],[-10,2.9],[-10,-5.9]].map(([x,z])=>rcone(q,V(x,0,z),V(x,10.2,z),.6,.5))),paint:q=>null,bb:[-12.5,12.5,-1,12,-8,5]},
    {n:'benchTop',on:'prop',m:'cover',d:q=>box(q,V(0,11.85,-1.5),V(11,.75,5)),bb:[-12,12,10.5,13,-7.5,4.5]});
  { const W2=21.4, ZF=14.4, ZL=52.5, far=x=>{ const t=(W2-x)/(2*W2), f=Math.pow(Math.max(0,Math.min(1,(t-.18)/.82)),1.35); return ZF+ZL*(1-.55*f); }, LS=19.5/33.7;
    out.push({n:'pnCase',on:'prop',m:'wood',d:q=>Math.max(ZF-q.z,q.z-far(q.x),17-q.y,q.y-30.5,Math.abs(q.x)-W2),bb:[-W2-1,W2+1,16,32,ZF-1,ZF+ZL+1]},
      {n:'pnDesk',on:'prop',m:'wood',d:q=>box(q,V(0,35.7,ZF+8.1),V(11.7,5.3,.6)),paint:q=>q.z<ZF+7.8&&Math.abs(q.x)<5.5&&q.y>31.5&&q.y<40?'paper':null,bb:[-13,13,29,42,ZF+6,ZF+10]},
      {n:'pnBed',on:'prop',m:'wood',d:q=>Math.min(box(q,V(0,18.65,11.9),V(17.8,1.65,2.6)),box(q,V(0,22.4,15.35),V(17.8,2.1,.95)),box(q,V(19.6,20,11.9),V(1.8,3,2.6)),box(q,V(-19.6,20,11.9),V(1.8,3,2.6))),bb:[-22,22,16,25,8.5,17]},
      {n:'pnLegs',on:'prop',m:'wood',d:q=>Math.min(rcone(q,V(17.5,0,17.6),V(17.5,17,17.6),1.7,1.7),rcone(q,V(-17.5,0,17.6),V(-17.5,17,17.6),1.7,1.7),rcone(q,V(6.8,0,56.5),V(6.8,17,56.5),1.7,1.7)),paint:q=>q.y<1?'gold':null,bb:[-20,20,-1,18,15,59]}); }
  for(const m of PKEYS){ const b=pnBlack(m); out.push(b?{n:'pk'+m,on:'prop',m:'hole',d:q=>box(q,V(0,-.6,-PK.LB/2),V(.205,.6,PK.LB/2)),bb:[-.5,.5,-1.5,.3,-PK.LB-.4,.4]}
    :{n:'pk'+m,on:'prop',m:'paper',d:q=>box(q,V(0,-.5,-PK.LW/2),V(.32,.5,PK.LW/2)),bb:[-.6,.6,-1.3,.3,-PK.LW-.4,.4]}); }
  return out; };
const PNKF={}; const pkFrame=(m,u)=>{ const {V}=RIG, b=pnBlack(m), y=PK.Y+(b?.4:0), zb=PK.Z+PK.LW, th=u*0.3/(PK.PIV+(b?PK.LB:PK.LW)), s=Math.sin(th), c=Math.cos(th);
  return {o:V(pkX(m),y-PK.PIV*s,zb+PK.PIV-PK.PIV*c),x:V(1,0,0),y:V(0,c,-s),z:V(0,s,c)}; };
for(const m of PKEYS)PNKF[m]=pkFrame(m,0);
const PKBENCH={o:RIG.V(0,0,0),x:RIG.V(1,0,0),y:RIG.V(0,1,0),z:RIG.V(0,0,1)};
Object.assign(POSES,{pianoSit:{root:[0,15,0],L:{ik:[RIG.FOOTX+.8,RIG.ANKLE,8]},R:{ik:[-RIG.FOOTX-.5,RIG.ANKLE+.8,8.5]}},
  pianoPed:{root:[0,15,0],L:{ik:[RIG.FOOTX+.8,RIG.ANKLE,8]},R:{ik:[-RIG.FOOTX-.5,RIG.ANKLE+.2,8.5]}},
  pianoRest:{root:[0,15,0],bend:-2,L:{ik:[RIG.FOOTX+.8,RIG.ANKLE,8]},R:{ik:[-RIG.FOOTX-.5,RIG.ANKLE,8.5]},hands:{L:[4.6,17.8,7.4],R:[-4.6,17.8,7.4]}}});
const PNS={t:0,sent:0,song:0,c:null};
function pnSet(i){ PNS.song=i; PNS.c=pnCompile(PNBOOK[i]); PNS.t=0; PNS.sent=0; }
const pkAt=(m,u,f)=>RIG.V(pkX(m),PK.Y+(pnBlack(m)?.4:0)+.32-u*.3,pnBlack(m)?13.1:f===1?11.0:11.5), pkOver=(m,f)=>RIG.add(pkAt(m,0,f),RIG.V(0,1.3,-.3));
const pkDown=(n,t)=>t<n.t0-0.04||t>n.t1+0.05?0:t<n.t0?(t-(n.t0-0.04))/0.04:t<=n.t1?1:1-(t-n.t1)/0.05;
function pnFingers(h,t){ const ns=PNS.c[h], out=[], w=[]; const home=f=>h==='R'?60+[0,2,4,5,7][f-1]:48+[7,5,4,2,0][f-1];
  for(let f=1;f<=5;f++){ let cur=null, prev=null, next=null; for(const n of ns){ if(n.f!==f)continue; if(n.t0-0.04<=t&&t<=n.t1){ cur=n; } else if(n.t1<t)prev=n; else if(n.t0-0.04>t){ next=n; break; } }
    if(cur){ out[f]=pkAt(cur.m,pkDown(cur,t),f); w[f]=1; continue; }
    if(next&&next.t0-0.04-t<0.12){ const u=gtSm(1-(next.t0-0.04-t)/0.12); out[f]=gtMix(pkOver(next.m,f),pkAt(next.m,0,f),u); w[f]=0.15+0.85*u; continue; }
    if(prev&&t-prev.t1<0.1){ const u=gtSm((t-prev.t1)/0.1); out[f]=gtMix(pkAt(prev.m,pkDown(prev,t),f),pkOver(prev.m,f),u); w[f]=1-0.85*u; continue; }
    const a=prev?prev.t1+0.1:t-1, b=next?next.t0-0.16:t+1, A=pkOver(prev?prev.m:next?next.m:home(f),f), B=pkOver(next?next.m:prev?prev.m:home(f),f);
    out[f]=gtMix(A,B,gtSm((t-a)/Math.max(0.05,b-a))); w[f]=0.15; }
  out.w=w; return out; }
const PNH={L:{y:[0,-.3,.954],z:[1,0,0]},R:{y:[0,-.3,.954],z:[-1,0,0]}}, PNPOLE={L:RIG.V(1,-1,-.3),R:RIG.V(-1,-1,-.3)}, PNSH=13.3+15;
function pnPose(t){ const {V,add,mul,sub}=RIG, T={L:pnFingers('L',t),R:pnFingers('R',t)}, off={L:V(0,0,0),R:V(0,0,0)}, K={};
  const pd=PNS.c.ped.find(p=>p.dn-0.08<=t&&t<p.up+0.05), pu=pd?gtSm(Math.min((t-(pd.dn-0.08))/0.08,(pd.up+0.05-t)/0.05)):0;
  const base=RIG.mix(castPose('pianoSit'),castPose('pianoPed'),pu);
  for(const n of 'LR'){ let x=0, W=0; for(let f=1;f<=5;f++){ x+=T[n][f].x*T[n].w[f]; W+=T[n].w[f]; } K[n]=V(x/W+(n==='L'?-1.2:1.2),PK.Y+2.6,8.4); }
  const yh=RIG.nrm(V(...PNH.L.y)); let P;
  for(let it=0;it<6;it++){ P=JSON.parse(JSON.stringify(base)); P.bend=2*RIG.D; P.nod=-16*RIG.D; P.look=(K.L.x+K.R.x)/2*0.018;
    for(const n of 'LR'){ gtArm(P,n,add(add(K[n],off[n]),mul(yh,-2.1)),PNPOLE[n],PNSH); P[n].hf=PNH[n]; P[n].hfw=1; }
    pnFing(P,RIG.build(P,null),T); if(it==5)break; const B2=RIG.build(P,null);
    for(const n of 'LR'){ let m=V(0,0,0), W=0; for(let i=0;i<5;i++){ const w=T[n].w[i+1]; m=add(m,mul(sub(T[n][i+1],B2.J['k'+i+'3'+n]),w)); W+=w; }
      off[n]=add(off[n],mul(m,1/Math.max(W,1e-6))); const l=RIG.len(off[n]); if(l>3)off[n]=mul(off[n],3/l); } }
  P._T=T; return P; }
const pnFing=(P,B,T)=>{ for(const n of 'LR'){ const s=n==='L'?1:-1; P[n].fg=[0,1,2,3,4].map(i=>gtReach(RIG.digitBase(B.m.hf[n],s,i),i,T[n][i+1])); } };
function pnKeys(t){ const pr=Object.assign({},PNKF); for(const n of PNS.c.notes){ if(n.t0-0.05>t)break; if(n.t1+0.06<t)continue; const u=pkDown(n,t); if(u>0)pr['pk'+n.m]=pkFrame(n.m,u); } pr.bench=pr.benchTop=PKBENCH; return pr; }
window.__piano={PNS,PNBOOK,PNA,set:pnSet,compile:pnCompile,pose:pnPose,keys:pnKeys,x:pkX};
