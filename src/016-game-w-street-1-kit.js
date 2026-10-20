const MKS=(()=>{ const MK={}, FP=24;
const art=(W,H,draw)=>{ const a=new Array(W*H).fill(null); draw((x,y,c)=>{ x=Math.floor(x); y=Math.floor(y); if(c&&x>=0&&y>=0&&x<W&&y<H)a[y*W+x]=c; }); return (x,y)=>x>=0&&y>=0&&x<W&&y<H?a[y*W+x]:null; };
const onFace=(a0,zt,A,els,flip=0,len=0)=>(u,z)=>{ const x=Math.floor(flip?(a0+len-u)*FP:(u-a0)*FP), c=A(x,Math.floor(zt-z)); return c||els(u,z); };
const planks=(k,c,n)=>({c,fi:(y,z)=>sh(mt(k,c),(Math.floor(z/n)&1?.6:.66)*(z%n<1?.8:1)),fj:(x,z)=>sh(mt(k,c),(Math.floor(z/n)&1?.8:.86)*(z%n<1?.8:1))});
const Bx=(x0,y0,x1,y1,z0,z1,c,o)=>({x0,y0,x1,y1,z0,z1,c,...(Math.min(x1-x0,y1-y0)<.08||z1-z0<2?{nb:1}:{}),...o});
const FOOT=(x,y,w,d)=>({x0:x,y0:y,x1:x+w,y1:y+d,z0:0,z1:.01,foot:1,top:()=>null,fi:()=>null,fj:()=>null});
const WD=y=>y<LSEED.street?1:-1, WS=y=>y+.1*WD(y);
const WF=(x0,x1,y)=>WD(y)>0?FOOT(x0,y-.05,x1-x0,.35):FOOT(x0,y-.3,x1-x0,.35);
const Bw=(x0,x1,y,d0,d1,z0,z1,c,o)=>{ const w=WS(y), d=WD(y); return d>0?Bx(x0,w+d0,x1,w+d1,z0,z1,c,o):Bx(x0,w-d1,x1,w-d0,z0,z1,c,o); };
const FL=y=>WD(y)<0?1:0;
const F3={A:'010101111101101',B:'110101110101110',C:'111100100100111',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'111100101101111',H:'101101111101101',I:'111010010010111',J:'001001001101111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'111101101101111',P:'111101111100100',Q:'111101101111001',R:'111101110101101',S:'111100111001111',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001111001111',4:'101101111001001',5:'111100111001111',6:'111100111101111',7:'111001001001001',8:'111101111101111',9:'111101111001111','-':'000000111000000','.':'000000000000010','&':'010101010101011',"'":'010010000000000','!':'010010010000010','$':'111110111011111'};
function txt(put,s,x0,y0,c,k=2){ [...s].forEach((ch,i)=>{ const g=F3[ch]; if(!g)return; for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(g[r*3+q]==='1')for(let a=0;a<k;a++)for(let b=0;b<k;b++)put(x0+(i*4+q)*k+a,y0+r*k+b,c); }); }
const tw=(s,k=1)=>(s.length*4-1)*k;
function face(W,H,bg,lines,flip,a0,zt,len){ const A=art(W,H,put=>{ for(let y=0;y<H;y++)for(let x=0;x<W;x++)put(x,y,typeof bg==='function'?bg(x,y):bg); for(const [s,c,k,y] of lines)txt(put,s,Math.floor((W-tw(s,k))/2),y,c,k); });
  return onFace(a0,zt,A,()=>null,flip,len); }
MK.awning=(x0,x1,y,z,ca,cb,name,sub)=>{ PNAME='awning'; const d=.9, W=Math.round((x1-x0)*FP), lines=[[name,[250,246,230],2,sub?3:8]]; if(sub)lines.push([sub,[250,246,230],2,15]);
  const same=ca.join()===cb.join(), val0=face(W,26,ca,lines,FL(y),x0,z-4,x1-x0), val=(u,zz)=>{ const k=Math.floor((u-x0)*FP/6); if(zz<z-28&&((k&1)?zz<z-28:zz<z-29))return null; const c=val0(u,zz); return c&&hash(Math.floor(u*24),Math.floor(zz),88)<.08?sh(c,.9):c; }, top=(u,v)=>{ const n=hash(Math.floor(u*12),Math.floor(v*12),87); return same?(n<.12?sh(ca,.92):n>.96?sh(ca,1.06):ca):Math.floor(((u-x0)*FP)/6)&1?ca:cb; };
  return prop([WF(x0,x1,y),Bw(x0,x1,y,-.1,d,z-4,z,ca,{foot:0,top,fj:(u,z2)=>sh(ca,.9),fi:(v,z2)=>sh(cb,.7)}),
    Bw(x0,x1,y,d-.08,d,z-30,z-4,cb,{foot:0,fj:val,fi:()=>sh(cb,.7),top:()=>cb}),
    Bw(x0+.05,x0+.11,y,d-.06,d,0,z-24,[60,62,66],{foot:0}),Bw(x1-.11,x1-.05,y,d-.06,d,0,z-24,[60,62,66],{foot:0})],null,{solids:[Bw(x0+.05,x0+.11,y,d-.06,d,0,z-24,[0,0,0]),Bw(x1-.11,x1-.05,y,d-.06,d,0,z-24,[0,0,0])]}); };
MK.gatebox=(x0,x1,y,z)=>{ PNAME='security gate'; const c=[96,100,106]; return prop([WF(x0,x1,y),Bw(x0,x1,y,0,.3,z,z+12,c,{foot:0,fj:(u,zz)=>(Math.floor(zz-z)&1)?sh(c,.85):sh(c,1.08),fi:()=>sh(c,.7),top:()=>sh(c,.9)})]); };
MK.bell=(x,y,z)=>{ PNAME='door bell'; return prop([WF(x-.1,x+.1,y),Bw(x-.02,x+.02,y,0,.14,z+6,z+8,[60,60,64],{foot:0,nb:1}),Bw(x-.06,x+.06,y,.06,.16,z,z+6,[220,180,90],{foot:0,fj:(u,zz)=>zz<z+2?[160,120,50]:[220,180,90]})]); };
MK.signbox=(x0,x1,y,z0,z1,bg,fg,s,lit)=>{ PNAME='shop sign'; const W=Math.round((x1-x0)*FP), H=z1-z0, f=face(W,H,(x,y2)=>Math.min(x,W-1-x,y2,H-1-y2)<1?sh(bg,.6):bg,[[s,fg,2,Math.floor((H-10)/2)]],FL(y),x0,z1,x1-x0);
  const p=prop([WF(x0,x1,y),Bw(x0,x1,y,0,.12,z0,z1,bg,{foot:0,em:lit?1:0,fj:f,fi:()=>sh(bg,.6),top:()=>sh(bg,.8)})]); if(lit)LAMPS.push({x:(x0+x1)/2,y:y+.4*WD(y),z:z0,r:3,c:[1,.9,.7],prop:p}); return p; };
MK.neon=(x,y,z,s,c)=>{ PNAME='neon sign'; const W=tw(s,2)+4, cells=[]; txt((a,b)=>cells.push([a,b]),s,2,2,c,2);
  const p=prop([WF(x-.3,x+.3,y)]); NEONS.push({x,y,z,W,cells,c}); LAMPS.push({x,y:y+.3*WD(y),z,r:2.2,c:[c[0]/255,c[1]/255,c[2]/255],prop:p,neon:true}); return p; };
MK.posters=(x0,x1,y,z0,n,seed)=>{ PNAME='posters'; const bs=[WF(x0,x1,y)]; const C=[[220,70,60],[240,200,70],[60,120,200],[240,240,230],[40,160,120],[230,120,40],[200,80,160]];
  for(let i=0;i<n;i++){ const h=hash(i,seed,1), w=.35+hash(i,seed,2)*.35, hh=12+hash(i,seed,3)*18, px=x0+h*(x1-x0-w), pz=z0+hash(i,seed,4)*30, c=C[Math.floor(hash(i,seed,5)*C.length)];
    bs.push(Bw(px,px+w,y,0,.02,pz,pz+hh,c,{foot:0,fj:(u,z)=>{ const e=Math.min(u-px,px+w-u), ez=Math.min(z-pz,pz+hh-z); return e<.04||ez<1?sh(c,.75):(Math.floor(z/3)&1)&&Math.abs(u-px-w/2)<w*.3&&z>pz+2&&z<pz+hh-3?sh(c,.55):c; },fi:()=>null,top:()=>null})); }
  return prop(bs); };
MK.ghostsign=(x0,x1,y,z0,z1,s1,s2)=>{ PNAME='painted sign'; const W=Math.round((x1-x0)*FP), H=z1-z0, A=art(W,H,put=>{ for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++)if(hash(xx,yy,77)<.6)put(xx,yy,[232,226,206]); txt(put,s1,Math.floor((W-tw(s1,2))/2),4,[170,60,50],2); txt(put,s2,Math.floor((W-tw(s2,2))/2),18,[60,80,120],2); });
  const f=onFace(x0,z1,A,()=>null,FL(y),x1-x0); return prop([WF(x0,x1,y),Bw(x0,x1,y,0,.01,z0,z1,[0,0,0],{foot:0,fj:(u,z)=>{ const c=f(u,z); return c&&hash(Math.floor(u*24),Math.floor(z),78)<.7?c:null; },fi:()=>null,top:()=>null})]); };
MK.graffiti=(x0,x1,y,z0,s,c1,c2)=>{ PNAME='graffiti'; const W=Math.round((x1-x0)*FP), A=art(W,40,put=>{ txt(put,s,Math.floor((W-tw(s,3))/2)+2,12,c2,3); txt(put,s,Math.floor((W-tw(s,3))/2),10,c1,3); for(let i=0;i<40;i++)put(hash(i,1,5)*W,hash(i,2,5)*40,i&1?c1:c2); });
  const f=onFace(x0,z0+40,A,()=>null,FL(y),x1-x0); return prop([WF(x0,x1,y),Bw(x0,x1,y,-.08,.01,z0,z0+40,c1,{foot:0,fj:f,fi:()=>null,top:()=>null})]); };
MK.litwin=(x0,x1,y,z0,z1,c)=>{ PNAME='lit window'; const p=prop([WF(x0,x1,y),Bw(x0,x1,y,-.11,-.09,z0,z1,c,{foot:0,em:1,fj:(u,z)=>hash(Math.floor(u*8),Math.floor(z/6),9)<.85?c:sh(c,.8),fi:()=>null,top:()=>null})]); LAMPS.push({x:(x0+x1)/2,y:y+.5*WD(y),z:(z0+z1)/2,r:2.5,c:[1,.9,.72],prop:p}); return p; };
MK.ac=(x,y,z)=>{ PNAME='window AC'; const c=[168,170,166]; return prop([WF(x-.36,x+.36,y),Bw(x-.36,x+.36,y,-.12,.4,z,z+18,c,{foot:0,fj:(u,zz)=>zz<z+12&&Math.abs(u-x)<.3?((Math.floor(zz)&1)?sh(c,.55):sh(c,.8)):sh(c,.95),fi:()=>sh(c,.62),top:()=>sh(c,.9)}),Bw(x-.4,x+.4,y,.38,.42,z-2,z,[80,82,86],{foot:0})]); };
MK.walllamp=(x,y,z,c=[255,230,170])=>{ PNAME='door lamp'; const p=prop([WF(x-.15,x+.15,y),Bw(x-.04,x+.04,y,0,.3,z+10,z+13,[60,62,66],{foot:0}),Bw(x-.14,x+.14,y,.06,.32,z,z+10,c,{foot:0,em:1,top:()=>[60,62,66]})]); LAMPS.push({x,y:y+.35*WD(y),z:z+4,r:3.5,c:[c[0]/255,c[1]/255,c[2]/255],prop:p}); return p; };
MK.pipe=(x,y,h)=>{ PNAME='drainpipe'; const c=[64,66,70]; return prop([WF(x-.1,x+.1,y),Bw(x-.05,x+.05,y,.02,.12,0,h-6,c,{foot:0}),Bw(x-.05,x+.05,y,.02,.24,h-6,h,c,{foot:0}),Bw(x-.08,x+.08,y,0,.16,8,12,sh(c,.9),{foot:0}),Bw(x-.08,x+.08,y,0,.16,70,74,sh(c,.9),{foot:0})]); };
MK.meterbox=(x,y,z)=>{ PNAME='meter box'; const c=[120,122,118]; return prop([WF(x-.2,x+.2,y),Bw(x-.2,x+.2,y,0,.18,z,z+22,c,{foot:0,fj:(u,zz)=>Math.abs(u-x)<.09&&Math.abs(zz-z-14)<3?[40,42,44]:(zz-z)<2||(zz-z)>20?sh(c,.7):c}),Bw(x-.3,x-.2,y,0,.05,z+18,z+21,[60,60,60],{foot:0})]); };
MK.number=(x,y,z,s)=>{ PNAME='house number'; const W=tw(s)+6; return prop([WF(x-.2,x+.2,y),Bw(x-W/FP/2,x+W/FP/2,y,0,.02,z,z+9,[40,38,36],{foot:0,fj:face(W,9,[40,38,36],[[s,[230,220,180],1,2]],FL(y),x-W/FP/2,z+9,W/FP)})]); };
MK.fireescape=(x0,x1,y,z,ladder)=>{ PNAME='fire escape'; const c=[52,54,58], d=.75, bs=[WF(x0,x1,y),Bw(x0,x1,y,0,d,z,z+3,c,{foot:0,top:(u,v)=>(Math.floor(u*8)&1)?sh(c,.8):c})];
  for(const [a,b] of [[x0,x0+.04],[x1-.04,x1]])bs.push(Bw(a,b,y,0,d,z+3,z+32,c,{foot:0}));
  bs.push(Bw(x0,x1,y,d-.04,d,z+30,z+33,c,{foot:0}),Bw(x0,x0+.04,y,0,d,z+30,z+33,c,{foot:0}),Bw(x1-.04,x1,y,0,d,z+30,z+33,c,{foot:0}));
  for(let u=x0+.2;u<x1-.1;u+=.22)bs.push(Bw(u,u+.03,y,d-.03,d,z+3,z+30,c,{foot:0}));
  if(ladder){ const lx=x1-.5; bs.push(Bw(lx,lx+.04,y,d-.14,d-.1,z-ladder,z+2,c,{foot:0}),Bw(lx+.36,lx+.4,y,d-.14,d-.1,z-ladder,z+2,c,{foot:0})); for(let k=z-ladder+6;k<z;k+=9)bs.push(Bw(lx,lx+.4,y,d-.13,d-.1,k,k+2,c,{foot:0})); }
  return prop(bs); };
MK.washing=(x0,x1,y,z)=>{ PNAME='clothesline'; const bs=[WF(x0,x1,y),Bw(x0,x1,y,.3,.32,z,z+1,[200,200,196],{foot:0})], C=[[230,230,220],[200,80,80],[80,120,200],[240,220,120],[120,180,120]];
  for(let i=0;i<Math.floor((x1-x0)/.5);i++){ const u=x0+.2+i*.5, w=.2+hash(i,3,2)*.15, h=10+hash(i,4,2)*8; bs.push(Bw(u,u+w,y,.28,.34,z-h,z,C[i%C.length],{foot:0})); } return prop(bs); };
MK.pole=(x,y)=>{ PNAME='utility pole'; const c=[96,78,58]; const bs=[Bx(x-.1,y-.1,x+.1,y+.1,0,165,c,{fj:(u,z)=>(Math.floor(z/7)&1)?sh(c,.9):c,fi:(u,z)=>(Math.floor(z/7)&1)?sh(c,.6):sh(c,.68)})]; for(const z of [138,152])bs.push(Bx(x-.7,y-.04,x+.7,y+.04,z,z+4,sh(c,.9),{foot:0})); for(const z of [142,156])for(const u of [x-.55,x-.25,x+.25,x+.55])bs.push(Bx(u-.03,y-.03,u+.03,y+.03,z,z+4,[120,140,150],{foot:0})); return prop(bs); };
MK.wires=(x0,x1,y,n=3)=>{ PNAME='overhead wires'; const air=o=>({c:[0,0,0],nb:1,top:()=>null,fi:()=>null,fj:()=>null,...o}), bs=[air({x0:x0+.1,y0:y-.6,x1:x0+.7,y1:y+.1,z0:133,z1:165,foot:1}),air({x0:x1-1.3,y0:y-.6,x1:x1-.1,y1:y+.1,z0:133,z1:165,foot:1}),air({x0:x0+.1,y0:y-.6,x1:x1-.1,y1:y+.1,z0:133,z1:165,foot:0})];
  const p=prop(bs), span=(x1-x0-.2)*24, rec=CLOTH.sheet('wire '+Math.round(span),{w:span,h:0,nt:Math.max(6,Math.round(span/18)),nz:1,pin:'ends',wind:50,slack:1.001,iter:40}), S={}; CLOTH.still(p,(x0+x1)/2,y-.25,149);
  p.lifeDraw=(D,W,H,ox,oy,t,K)=>{ const [lv,fr]=CLOTH.frame(p,rec,t), L=CLOTH.light(p,S,t,(x0+x1)/2,y-.25,112), c=[30*Math.min(1,L[0]),30*Math.min(1,L[1]),34*Math.min(1,L[2])];
    for(let k=0;k<n;k++){ const v=y-.55+k*.3, z0=162-(k&1)*13; CLOTH.strand(D,W,H,ox,oy,K,rec,lv,fr,(a,d,z)=>[x0+.1+a/24,v+d/24,z0-z],c,2); } };
  return p; };
MK.cable=(x0,x1,y,z)=>{ PNAME='wall cable'; return prop([WF(x0,x1,y),Bw(x0,x1,y,.02,.05,z,z+1.5,[30,30,34],{foot:0}),Bw(x0,x0+.1,y,0,.06,z-14,z+2,[60,60,64],{foot:0})]); };
MK.bulb=(x,y,z,c=[255,214,150])=>{ PNAME='bare bulb'; const p=prop([WF(x-.1,x+.1,y),Bw(x-.02,x+.02,y,.4,.44,z+4,z+30,[40,40,44],{foot:0}),Bw(x-.08,x+.08,y,.34,.5,z-6,z+4,c,{foot:0,em:1})]); LAMPS.push({x,y:y+.45*WD(y),z,r:3,c:[1,.84,.6],prop:p}); return p; };
MK.tvglow=(x0,x1,y,z0,z1)=>{ PNAME='TV glow'; const c=[120,170,255]; const p=prop([WF(x0,x1,y),Bw(x0,x1,y,-.11,-.09,z0,z1,c,{foot:0,em:1,fj:(u,z)=>hash(Math.floor(u*10),Math.floor(z/5),19)<.5?sh(c,.6):c,fi:()=>null,top:()=>null})]); LAMPS.push({x:(x0+x1)/2,y:y+.5*WD(y),z:(z0+z1)/2,r:2,c:[.5,.7,1],prop:p}); return p; };
MK.lantern=(x,y,z,c=[255,120,90])=>{ PNAME='paper lantern'; const p=prop([WF(x-.15,x+.15,y),Bw(x-.01,x+.01,y,.5,.52,z+14,z+30,[40,40,44],{foot:0}),Bw(x-.16,x+.16,y,.36,.66,z,z+14,c,{foot:0,em:1,fj:(u,zz)=>(Math.floor(zz)&1)?sh(c,.9):c,fi:()=>sh(c,.85)})]); LAMPS.push({x,y:y+.5*WD(y),z:z+6,r:2.5,c:[1,.5,.4],prop:p}); return p; };
MK.flag=(x,y,z)=>{ PNAME='flag'; const bs=[WF(x-.1,x+.1,y),Bw(x-.03,x+.03,y,0,.9,z,z+2,[70,72,76],{foot:0}),Bw(x-.02,x+.02,y,.85,.9,z-10,z+2,[70,72,76],{foot:0})];
  bs.push(Bw(x-.28,x+.28,y,.26,.9,z-15,z,[0,0,0],{foot:0,nb:1,top:()=>null,fi:()=>null,fj:()=>null}));
  const p=prop(bs), rec=CLOTH.sheet('flag',{w:.6*24,h:14,nt:8,nz:6,pin:'top',wind:90}), S={}, d=WD(y), w=WS(y); CLOTH.still(p,x,w+d*.5,z-7);
  p.lifeDraw=(D,W,H,ox,oy,t,K)=>{ const [lv,fr]=CLOTH.frame(p,rec,t), L=CLOTH.light(p,S,t,x,w+d*.5,z-7), col=(k,i,j)=>{ const c=i<3&&j<3?((i+j)&1?[240,240,240]:[60,80,160]):(j&1)?[240,240,240]:[200,60,60], q=sh(c,.75+.5*k); return [q[0]*L[0],q[1]*L[1],q[2]*L[2]]; };
    CLOTH.draw(D,W,H,ox,oy,K,rec,lv,fr,(a,dd,zz)=>[x+dd/24,w+d*(.28+a/24),z-zz],col); };
  return p; };
MK.windowstuff=(x0,x1,y,z)=>{ PNAME='window display'; const bs=[WF(x0,x1,y)], C=[[220,60,60],[240,200,60],[60,160,80],[80,120,220],[240,240,230],[230,140,50]];
  for(let i=0;i<6;i++){ const u=x0+.08+i*(x1-x0-.16)/6, w=(x1-x0-.16)/6-.04, h=8+hash(i,8,3)*10; bs.push(Bw(u,u+w,y,-.1,.08,z,z+h,C[i%6],{foot:0,fj:(a,zz)=>Math.abs(zz-z-h/2)<1.5?sh(C[i%6],.6):C[i%6]})); } return prop(bs); };
MK.produce=(x,y,w,flip)=>{ PNAME='produce stand'; const bs=[], F=[[220,60,50],[240,170,40],[90,170,60],[240,220,80],[160,60,120],[230,120,60],[70,140,70],[250,90,40]], wd=[150,110,70], L=.06;
  for(const [v0,h] of [[0,41],[.44,20],[.84,10]])for(const u of [x,x+w-L])bs.push(Bx(u,y+v0,u+L,y+v0+L,0,h,sh(wd,.8),{foot:1}));
  const crate=(u0,u1,v0,v1,z0,row,i)=>{ const c=F[(i+row*3)%F.length], cw=sh(wd,1.08), t=.04;
    bs.push(Bx(u0,v0,u1,v1,z0,z0+1,sh(wd,.7),{foot:0}),
      Bx(u0,v1-t,u1,v1,z0+1,z0+3,cw,{foot:0}),Bx(u0,v1-t,u1,v1,z0+5,z0+7,cw,{foot:0}),Bx(u0,v0,u1,v0+t,z0+1,z0+7,cw,{foot:0}),
      Bx(u0,v0+t,u0+t,v1-t,z0+1,z0+7,sh(cw,.95),{foot:0}),Bx(u1-t,v0+t,u1,v1-t,z0+1,z0+7,sh(cw,.95),{foot:0}));
    const ix=u0+t, iy=v0+t, iw=u1-u0-2*t, id=v1-v0-2*t, s=.1;
    for(const [n,dz,k] of [[3,0,0],[2,3,1],[1,6,2]]){ const gx=(iw-s)/Math.max(1,n-1)*(n>1?1:0), gy=(id-s)/Math.max(1,n-1)*(n>1?1:0), ox=n>1?0:(iw-s)/2, oy=n>1?0:(id-s)/2;
      for(let a=0;a<n;a++)for(let b=0;b<n;b++){ const h=hash(i*7+a,row*5+b,k+41), fc=sh(c,.82+h*.3), fx=ix+ox+(k?(iw-s)*.25*(n>1?1:0):0)+a*gx*(k?.5:1), fy=iy+oy+(k?(id-s)*.25*(n>1?1:0):0)+b*gy*(k?.5:1);
        bs.push(Bx(fx,fy,fx+s,fy+s,z0+1+dz,z0+4+dz,fc,{foot:0,nb:1,top:()=>sh(fc,1.12)})); } } };
  const n=Math.floor(w/.5), cr=(w-2*L)/n;
  for(const [row,v0,v1,z] of [[0,.46,.9,8],[1,.04,.46,18]]){ bs.push(Bx(x+L,y+v0,x+w-L,y+v1,z,z+2,wd,{foot:0,...planks('crates',wd,2)}));
    for(let i=0;i<n;i++)crate(x+L+i*cr+.02,x+L+(i+1)*cr-.02,y+v0+.03,y+v1-.03,z+2,row,i); }
  bs.push(Bx(x-.02,y-.02,x+w+.02,y+.5,38,41,[80,82,86],{foot:0})); return prop(bs); };
MK.icebox=(x,y)=>{ PNAME='ice chest'; const c=[236,238,240]; return prop([Bx(x,y,x+.9,y+.7,0,34,c,{fj:()=>c,fi:()=>sh(c,.7),top:()=>sh(c,.92)}),Bx(x,y,x+.9,y+.7,34,38,[70,110,210],{foot:0})]); };
MK.newsrack=(x,y)=>{ PNAME='newspaper rack'; const c=[120,122,126], P=[226,224,214], t=.04, bs=[];
  for(const [u,v] of [[x,y],[x+.5-t,y],[x,y+.4-t],[x+.5-t,y+.4-t]])bs.push(Bx(u,v,u+t,v+t,0,28,sh(c,.9)));
  bs.push(Bx(x,y,x+.5,y+t,26,28,c,{foot:0}));
  for(let k=0;k<3;k++){ const z=3+k*9; bs.push(Bx(x+t,y+t,x+.5-t,y+.4-t,z,z+1,sh(c,.8),{foot:0}),Bx(x+t,y+.4-t,x+.5-t,y+.4,z,z+3,c,{foot:0}));
    for(let s=0;s<2;s++)for(let q=0;q<2+((k+s)&1);q++){ const u=x+.06+s*.2+hash(k,s*4+q,7)*.02, v=y+.06+hash(k,s*4+q,8)*.03;
      bs.push(Bx(u,v,u+.18,v+.26,z+1+q,z+2+q,sh(P,.94+q*.03),{foot:0,fj:()=>sh(P,.8),fi:()=>sh(P,.7),top:(a,b)=>{ const r=Math.floor((b-v)*24); return r>0&&r<2?[60,60,66]:(r&1)&&r>2&&hash(Math.floor(a*24),r,k+s)<.6?[110,110,116]:sh(P,.94+q*.03); }})); } }
  return prop(bs); };
MK.buckets=(x,y)=>{ PNAME='flower buckets'; const bs=[], C=[[230,70,90],[240,210,70],[250,250,240],[240,130,60]];
  for(let i=0;i<4;i++){ const u=x+(i%2)*.42, v=y+Math.floor(i/2)*.42, g=[60,62,66], t=.04;
    bs.push(Bx(u,v,u+.36,v+.36,0,2,g,{foot:1,top:()=>[26,27,30]}),Bx(u,v,u+.36,v+t,2,14,g),Bx(u,v+.36-t,u+.36,v+.36,2,14,g),Bx(u,v+t,u+t,v+.36-t,2,14,g),Bx(u+.36-t,v+t,u+.36,v+.36-t,2,14,g));
    for(let k=0;k<5;k++){ const a=u+.08+hash(i,k,21)*.18, b=v+.08+hash(i,k,22)*.18, h=19+Math.floor(hash(i,k,23)*8), bc=sh(C[i],.85+hash(i,k,24)*.25);
      bs.push(Bx(a,b,a+.042,b+.042,2,h,[70,120,70],{foot:0,nb:1}),Bx(a-.03,b-.03,a+.072,b+.072,h,h+3,bc,{foot:0,nb:1,top:(p,q)=>Math.abs(p-a-.021)<.02&&Math.abs(q-b-.021)<.02?sh(bc,.7):sh(bc,1.08)})); } } return prop(bs); };
MK.milkcrates=(x,y,n=3)=>{ PNAME='milk crates'; const C=[[200,50,50],[50,80,200],[230,200,60]], bs=[], t=.05; for(let k=0;k<n;k++){ const c=C[k%3], a=x+(k%2)*.02, b=y+(k%2)*.02, e=x+.5, f=y+.5, m=(a+e)/2, mv=(b+f)/2, z=k*12, o={foot:0};
  bs.push(Bx(a,b,e,f,z,z+2,c,{foot:k===0,top:(u,v)=>((Math.floor(u*20)+Math.floor(v*20))&1)?sh(c,.6):c}));
  for(const [u,v] of [[a,b],[e-t,b],[a,f-t],[e-t,f-t],[m-t/2,b],[m-t/2,f-t],[a,mv-t/2],[e-t,mv-t/2]])bs.push(Bx(u,v,u+t,v+t,z+2,z+12,c,o));
  for(const [zz,h] of [[z+10,2],[z+6,1]])bs.push(Bx(a,b,e,b+t,zz,zz+h,c,o),Bx(a,f-t,e,f,zz,zz+h,c,o),Bx(a,b+t,a+t,f-t,zz,zz+h,sh(c,.9),o),Bx(e-t,b+t,e,f-t,zz,zz+h,sh(c,.9),o)); }
  return prop(bs); };
MK.waterjugs=(x,y)=>{ PNAME='water jugs'; const bs=[]; for(let i=0;i<4;i++){ const u=x+(i%2)*.36, v=y+Math.floor(i/2)*.36; bs.push(Bx(u,v,u+.3,v+.3,0,14,[150,200,230],{foot:1,fj:(a,z)=>z>12?[90,140,200]:z>10?[200,230,245]:[150,200,230]}),Bx(u+.1,v+.1,u+.2,v+.2,14,17,[90,140,200],{foot:0})); } return prop(bs); };
MK.handtruck=(x,y)=>{ PNAME='hand truck'; const c=[200,60,40]; return prop([Bx(x,y,x+.5,y+.08,0,36,c),Bx(x,y,x+.5,y+.3,0,3,c),Bx(x+.02,y+.02,x+.14,y+.14,0,8,[40,40,44]),Bx(x+.36,y+.02,x+.48,y+.14,0,8,[40,40,44]),Bx(x+.02,y+.1,x+.48,y+.56,3,22,[190,150,100],{foot:0,...planks('crates',[190,150,100],6)})]); };
MK.cardboard=(x,y)=>{ PNAME='cardboard boxes'; const c=[196,160,110], bs=[Bx(x,y,x+.7,y+.5,0,18,c,{...planks('crates',c,30)}),Bx(x+.1,y+.6,x+.6,y+1,0,14,sh(c,.95),{...planks('crates',c,30)}),Bx(x+.05,y+.05,x+.55,y+.45,18,30,sh(c,.9),{foot:0,top:(u,v)=>Math.abs(u-x-.3)<.03?sh(c,.7):c})]; return prop(bs); };
MK.trashbags=(x,y,n=4)=>{ PNAME='trash bags'; const bs=[]; for(let i=0;i<n;i++){ const u=x+hash(i,1,11)*.8, v=y+hash(i,2,11)*.6, w=.36+hash(i,3,11)*.2, h=14+hash(i,4,11)*8, c=[36,38,42]; bs.push(Bx(u,v,u+w,v+w*.9,0,h,c,{top:(a,b)=>hash(Math.floor(a*20),Math.floor(b*20),i)<.15?[70,72,78]:c,fj:(a,z)=>z>h-3?[60,62,66]:hash(Math.floor(a*20),Math.floor(z/2),i)<.1?[58,60,66]:c,fi:()=>[26,28,30]})); } return prop(bs); };
MK.shoppingcart=(x,y)=>{ PNAME='shopping cart'; const c=[150,152,156]; const bs=[Bx(x,y,x+.5,y+.9,0,6,[50,50,54]),Bx(x,y,x+.5,y+.9,12,30,c,{foot:0,fj:(u,z)=>((Math.floor(u*24)+Math.floor(z/2))&1)?null:c,fi:(u,z)=>((Math.floor(u*24)+Math.floor(z/2))&1)?null:sh(c,.7),top:(u,v)=>((Math.floor(u*24)+Math.floor(v*24))&1)?null:c}),Bx(x-.04,y+.85,x+.54,y+.9,30,33,[40,40,44],{foot:0})]; return prop(bs); };
MK.bike=(x,y,alongX,c=[60,80,160])=>{ PNAME='bicycle'; const W=.12, bs=alongX?[Bx(x,y,x+.3,y+W,0,20,[30,30,34]),Bx(x+.8,y,x+1.1,y+W,0,20,[30,30,34]),Bx(x+.25,y+.02,x+.85,y+.1,14,18,c,{foot:0}),Bx(x+.45,y+.02,x+.55,y+.1,18,30,c,{foot:0}),Bx(x+.4,y-.1,x+.6,y+.22,30,32,[40,40,44],{foot:0}),Bx(x+.9,y-.15,x+1,y+.27,28,30,[40,40,44],{foot:0})]
  :[Bx(x,y,x+W,y+.3,0,20,[30,30,34]),Bx(x,y+.8,x+W,y+1.1,0,20,[30,30,34]),Bx(x+.02,y+.25,x+.1,y+.85,14,18,c,{foot:0}),Bx(x+.02,y+.45,x+.1,y+.55,18,30,c,{foot:0}),Bx(x-.1,y+.4,x+.22,y+.6,30,32,[40,40,44],{foot:0}),Bx(x-.15,y+.9,x+.27,y+1,28,30,[40,40,44],{foot:0})]; return prop(bs); };
MK.scooter=(x,y)=>{ PNAME='scooter'; const c=[200,70,60]; return prop([Bx(x,y,x+.25,y+.3,0,12,[30,30,34]),Bx(x+1.1,y,x+1.35,y+.3,0,12,[30,30,34]),Bx(x+.2,y+.02,x+1.15,y+.28,8,22,c,{foot:0,fi:()=>sh(c,.7),fj:(u,z)=>z>18?sh(c,.6):c}),Bx(x+.5,y+.04,x+1,y+.26,22,30,[40,40,44],{foot:0}),Bx(x+1.1,y+.02,x+1.2,y+.28,22,36,[80,82,86],{foot:0}),Bx(x+1.05,y-.1,x+1.25,y+.4,36,38,[40,40,44],{foot:0})]); };
MK.newsstand=(x,y)=>{ PNAME='newsstand'; const c=[60,120,80], d=sh(c,.72), X=x+2, Y=y+1.3, T=.08, H=70, wood=[120,98,72];
  const panel=(u,z)=>z>H-3||z<3||Math.abs(((u-x)*FP)%16-8)>7.4?sh(c,.84):c;
  const bs=[Bx(x,y,X,Y,0,2,d,{top:()=>[70,66,60]}),
    Bx(x,y,X,y+T,0,H,c,{fj:panel,ns:'back'}),Bx(X-T,y,X,Y,0,H,c,{fi:()=>sh(c,.62),ns:'side'}),
    Bx(x,y,x+T,y+.2,0,H,c,{ns:'side'}),Bx(x,y+.8,x+T,Y,0,H,c,{ns:'side'}),Bx(x,y+.2,x+T,y+.8,58,H,c,{foot:0,ns:'side'}),
    Bx(x+.015,y+.2,x+.06,y+.8,2,58,d,{foot:0,fi:(v,z)=>Math.abs(z-30)<12&&Math.abs(v-(y+.5))<.18?sh(c,.6):d}),Bx(x-.03,y+.68,x+.015,y+.73,28,31,[196,196,186],{foot:0}),
    ...[[14,.36],[30,.3],[46,.24]].map(([z,dp])=>Bx(x+T,y+T,X-T,y+T+dp,z,z+2,wood,{foot:0,ns:'shelf',top:(u,v)=>(Math.floor(u*FP)%9===0?sh(wood,.82):wood)})),
    Bx(x+.6,y+.5,x+.82,y+.72,0,20,[70,70,74],{foot:0,top:()=>[150,60,50]}),
    Bx(x+T,Y-T,X-T,Y,0,30,c,{fj:panel}),Bx(x+.04,Y-.42,X-.04,Y+.1,30,33,[176,172,160],{foot:0,ns:'counter'}),
    Bx(X-.42,Y-.34,X-.14,Y-.12,33,39,[52,52,56],{foot:0,top:()=>[88,88,92]}),
    Bx(x+T,Y-.1,X-T,Y,60,H,sh(c,.9),{foot:0,fj:(u,z)=>(z&1)?sh(c,.78):sh(c,.95)}),
    Bx(x+.98,y+.62,x+1.02,y+.66,63,H,[40,40,40],{foot:0}),Bx(x+.96,y+.6,x+1.04,y+.68,59,63,[255,236,170],{foot:0,em:1}),
    Bx(x-.1,y-.1,X+.1,Y+.4,H,H+5,[70,72,76],{foot:0,top:()=>[90,92,96]}),
    Bx(x,Y+.3,X,Y+.4,58,H,[230,60,50],{foot:0,fj:face(48,12,[230,60,50],[['NEWS',[250,240,220],2,1]],0,x,H,2)})];
  return prop(bs,null,{newsstand:1}); };

