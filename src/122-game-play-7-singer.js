const SINGMIC=(()=>{ const {V,rcone,ell,rbox,box}=RIG;
  return [{n:'mic',on:'prop',m:'tie',d:q=>rcone(q,V(0,-.2,0),V(0,3.0,0),.36,.55),bb:[-1,1,-.8,3.6,-1,1]},
    {n:'micGrille',on:'prop',m:'metal',d:q=>ell(q,V(0,3.65,0),V(.78,.86,.78)),paint:q=>((q.x*3+20|0)+(q.y*3|0)+(q.z*3+20|0))%2?'metal':'hole',bb:[-1.2,1.2,2.5,4.8,-1.2,1.2]},
    {n:'ampBox',on:'prop',m:'tie',d:q=>Math.min(rbox(q,V(13,6,-5),V(6.5,6,3.5),.45),rcone(q,V(10.6,12.4,-5),V(15.4,12.4,-5),.45,.45)),bb:[5.5,20.5,-.5,13.5,-9.5,-.5]},
    {n:'ampGrille',on:'prop',m:'cover',d:q=>box(q,V(13,5.0,-1.45),V(5.7,4.3,.14)),paint:q=>((q.x*2.2+40|0)+(q.y*2.2|0))%2?'cover':'tie',bb:[6.5,19.5,.2,9.8,-2.2,-.8]},
    {n:'ampPanel',on:'prop',m:'metal',d:q=>box(q,V(13,10.55,-1.45),V(5.9,.95,.14)),bb:[6.5,19.5,9.2,12,-2.2,-.8]},
    {n:'ampKnobs',on:'prop',m:'linen',d:q=>{ let d=ell(q,V(17.7,10.55,-1.15),V(.34,.34,.3)); for(let i=0;i<5;i++)d=Math.min(d,ell(q,V(8.6+i*1.55,10.55,-1.1),V(.42,.42,.35))); return d; },paint:q=>q.x>17.2?'tie':null,bb:[7.5,18.5,9.6,11.5,-1.8,-.4]},
    {n:'ampLight',on:'prop',m:'ember',d:q=>ell(q,V(16.4,10.55,-1.15),V(.32,.32,.3)),bb:[15.6,17.2,9.8,11.4,-1.8,-.5]}]; })();
const SINGF={o:RIG.V(0,0,0),x:RIG.V(1,0,0),y:RIG.V(0,1,0),z:RIG.V(0,0,1)}, SINGJACK=RIG.V(17.7,10.55,-1.0);
Object.assign(POSES,{
  singA:{root:[.4,RIG.STAND-.1,0],pyaw:3,side:-1.3,L:{ik:[RIG.FOOTX+.4,RIG.ANKLE,.6]},R:{ik:[-RIG.FOOTX+.2,RIG.ANKLE,-.4],fist:.92},hands:{R:[-1.7,33.3,8.0]},nod:2},
  singB:{root:[-.4,RIG.STAND-.1,0],pyaw:-3,side:1.3,L:{ik:[RIG.FOOTX+.2,RIG.ANKLE,-.3],fist:.15},R:{ik:[-RIG.FOOTX+.4,RIG.ANKLE,.7],fist:.92},hands:{R:[-1.3,33.7,8.4],L:[6.8,24.5,6.2]},nod:-1},
  singC:{root:[.2,RIG.STAND-.2,.2],pyaw:1,side:-.6,bend:3,L:{ik:[RIG.FOOTX+.4,RIG.ANKLE,.6]},R:{ik:[-RIG.FOOTX+.2,RIG.ANKLE,-.4],fist:.92},hands:{R:[-1.9,33.0,7.8],L:[2.4,28.4,5.8]},nod:5}});
function singMic(B){ const {add,sub,mul,nrm,cross,V}=RIG, F=RIG.frameOf('head',B), M=add(F.o,add(mul(F.y,-5.2),mul(F.z,7.4))), p=B.J.palmR, y=nrm(sub(M,p));
  let x=cross(y,V(0,0,1)); if(RIG.len(x)<.2)x=cross(y,V(1,0,0)); x=nrm(x); return {o:add(p,mul(y,.2)),x,y,z:cross(x,y)}; }
const CORDN=52, CORDL=1.4, CORDG=9.8/0.03365;
function cordNew(a){ const {V,add,mul,sub}=RIG, A=add(a.mic.o,mul(a.mic.y,-.3)), B=SINGJACK, pts=[];
  for(let i=0;i<CORDN;i++){ const u=i/(CORDN-1), floor=Math.sin(u*Math.PI); const p=add(add(mul(A,1-u),mul(B,u)),V(Math.sin(u*9)*3,-floor*14,floor*7)); pts.push({p,q:{...p}}); }
  a.cord=pts; for(let i=0;i<240;i++)cordStep(a,1/60); }
function cordStep(a,dt){ const P=a.cord, A=RIG.add(a.mic.o,RIG.mul(a.mic.y,-.3)), J=SINGJACK, g=CORDG*dt*dt, S=WOMAN.SKIRT.gown;
  for(const c of P){ const p=c.p, q=c.q, onF=p.y<=.32, k=.985, f=onF?.55:1; const vx=(p.x-q.x)*k*f, vy=(p.y-q.y)*k, vz=(p.z-q.z)*k*f; q.x=p.x; q.y=p.y; q.z=p.z; p.x+=vx; p.y+=vy-g; p.z+=vz; }
  for(let it=0;it<12;it++){
    P[0].p={...A}; P[CORDN-1].p={...J};
    for(let i=0;i<CORDN-1;i++){ const a1=P[i].p, b1=P[i+1].p, dx=b1.x-a1.x, dy=b1.y-a1.y, dz=b1.z-a1.z, d=Math.hypot(dx,dy,dz)||1e-6, e=(d-CORDL)/d*.5, w0=i===0?0:1, w1=i+1===CORDN-1?0:1, s=e/Math.max(1e-6,(w0+w1)/2);
      a1.x+=dx*s*w0*.5; a1.y+=dy*s*w0*.5; a1.z+=dz*s*w0*.5; b1.x-=dx*s*w1*.5; b1.y-=dy*s*w1*.5; b1.z-=dz*s*w1*.5; }
    for(let i=1;i<CORDN-2;i++){ const a1=P[i].p, b1=P[i+2].p, dx=b1.x-a1.x, dy=b1.y-a1.y, dz=b1.z-a1.z, d=Math.hypot(dx,dy,dz)||1e-6; if(d>=CORDL*1.6)continue; const s=(d-CORDL*1.6)/d*.06;
      a1.x+=dx*s; a1.y+=dy*s; a1.z+=dz*s; b1.x-=dx*s; b1.y-=dy*s; b1.z-=dz*s; }
    for(let i=1;i<CORDN-1;i++){ const p=P[i].p; if(p.y<.3)p.y=.3;
      if(p.y<22){ const ax=S.a(Math.max(S.hem,p.y))+.3, bz=ax*.7, r=Math.hypot(p.x/ax,(p.z+.4)/bz); if(r<1){ p.x/=r; p.z=(p.z+.4)/r-.4; } }
      if(p.x>6.3&&p.x<19.7&&p.y<12.6&&p.z>-8.7&&p.z<-1.3){ const o=[[p.x-6.3,'x',6.3],[19.7-p.x,'x',19.7],[12.6-p.y,'y',12.6],[p.z+8.7,'z',-8.7],[-1.3-p.z,'z',-1.3]].sort((m,n)=>m[0]-n[0])[0]; p[o[1]]=o[2]; } } } }
function singStep(a,dt){ if(!a.B)return; a.mic=singMic(a.B); for(const n of ['ampBox','ampGrille','ampPanel','ampKnobs','ampLight'])a.B.props[n]=SINGF; a.B.props.mic=a.B.props.micGrille=a.mic;
  if(!a.cord)cordNew(a); const h=Math.min(dt,.05)/2; cordStep(a,h); cordStep(a,h);
  let s=0; for(const c of a.cord)s+=Math.round(c.p.x*4)*7+Math.round(c.p.y*4)*13+Math.round(c.p.z*4); a.sigx=s; }
function cordDraw(a,yawA,r){ if(!a.cord)return; const k=a.c.dens*r, W=(a.c.W||CIW)*r, H=(a.c.H||CIH)*r, AX=(a.c.AX||CAX)*r, AY=(a.c.AY||CAY)*r, dep=RIG.depth(W*H), buf=a.buf; if(!dep)return;
  for(let i=0;i<CORDN-1;i++){ const A=a.cord[i].p, B=a.cord[i+1].p, n=Math.max(2,Math.ceil(CORDL*k*1.4));
    for(let j=0;j<=n;j++){ const u=j/n, p=RIG.project(RIG.V(A.x+(B.x-A.x)*u,A.y+(B.y-A.y)*u,A.z+(B.z-A.z)*u),yawA), x=Math.floor(AX+p[0]*k), y=Math.floor(AY+p[1]*k); if(x<0||y<0||x>=W||y>=H)continue;
      const q=y*W+x; if(buf[q]&&dep[q]<p[2]-0.3)continue; buf[q]=(i+j)%9===0?0xff403a3c:0xff1a1618; } } }
