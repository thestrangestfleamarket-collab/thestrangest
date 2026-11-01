// THE STREET KIT (MKS): the old game's street makers: kit, furniture, city and catalog.
import {SHARED} from './003-shx.js';
import {NEONS} from './006-map-pre.js';
import {CAT_DEPTS, CAT_INFO, CATALOG, hash, KIND_OF, LAMPS, LIFE, LSEED, mt, prop, sh, sided, speck, STORY} from './014-gamekit.js';
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
MK.awning=(x0,x1,y,z,ca,cb,name,sub,ink=[250,246,230],ink2)=>{ '@later'; SHARED.PNAME='awning'; const d=.9, W=Math.round((x1-x0)*FP), lines=[[name,ink,2,sub?3:8]]; if(sub)lines.push([sub,ink2||ink,sub.length*4>W/1.2?1:2,15]);
  const same=ca.join()===cb.join(), val0=face(W,26,ca,lines,FL(y),x0,z-4,x1-x0), val=(u,zz)=>{ const k=Math.floor((u-x0)*FP/6); if(zz<z-28&&((k&1)?zz<z-28:zz<z-29))return null; const c=val0(u,zz); return c&&hash(Math.floor(u*24),Math.floor(zz),88)<.08?sh(c,.9):c; }, top=(u,v)=>{ const n=hash(Math.floor(u*12),Math.floor(v*12),87); return same?(n<.12?sh(ca,.92):n>.96?sh(ca,1.06):ca):Math.floor(((u-x0)*FP)/6)&1?ca:cb; };
  return prop([WF(x0,x1,y),Bw(x0,x1,y,-.1,d,z-4,z,ca,{foot:0,top,fj:(u,z2)=>sh(ca,.9),fi:(v,z2)=>sh(cb,.7)}),
    Bw(x0,x1,y,d-.08,d,z-30,z-4,cb,{foot:0,fj:val,fi:()=>sh(cb,.7),top:()=>cb}),
    Bw(x0+.05,x0+.11,y,d-.06,d,0,z-24,[60,62,66],{foot:0}),Bw(x1-.11,x1-.05,y,d-.06,d,0,z-24,[60,62,66],{foot:0})],null,{solids:[Bw(x0+.05,x0+.11,y,d-.06,d,0,z-24,[0,0,0]),Bw(x1-.11,x1-.05,y,d-.06,d,0,z-24,[0,0,0])]}); };
MK.gatebox=(x0,x1,y,z)=>{ SHARED.PNAME='security gate'; const c=[96,100,106]; return prop([WF(x0,x1,y),Bw(x0,x1,y,0,.3,z,z+12,c,{foot:0,fj:(u,zz)=>(Math.floor(zz-z)&1)?sh(c,.85):sh(c,1.08),fi:()=>sh(c,.7),top:()=>sh(c,.9)})]); };
MK.bell=(x,y,z)=>{ SHARED.PNAME='door bell'; return prop([WF(x-.1,x+.1,y),Bw(x-.02,x+.02,y,0,.14,z+6,z+8,[60,60,64],{foot:0,nb:1}),Bw(x-.06,x+.06,y,.06,.16,z,z+6,[220,180,90],{foot:0,fj:(u,zz)=>zz<z+2?[160,120,50]:[220,180,90]})]); };
MK.signbox=(x0,x1,y,z0,z1,bg,fg,s,lit,k=2)=>{ SHARED.PNAME='shop sign'; const W=Math.round((x1-x0)*FP), H=z1-z0, f=face(W,H,(x,y2)=>Math.min(x,W-1-x,y2,H-1-y2)<1?sh(bg,.6):bg,[[s,fg,k,Math.floor((H-5*k)/2)]],FL(y),x0,z1,x1-x0);
  const p=prop([WF(x0,x1,y),Bw(x0,x1,y,0,.12,z0,z1,bg,{foot:0,em:lit?1:0,fj:f,fi:()=>sh(bg,.6),top:()=>sh(bg,.8)})]); if(lit)LAMPS.push({x:(x0+x1)/2,y:y+.4*WD(y),z:z0,r:3,c:[1,.9,.7],prop:p}); return p; };
MK.neon=(x,y,z,s,c,k=2)=>{ SHARED.PNAME='neon sign'; const W=tw(s,k)+4, cells=[]; txt((a,b)=>cells.push([a,b]),s,2,2,c,k);
  const p=prop([WF(x-.3,x+.3,y)]); NEONS.push({x,y,z,W,cells,c,k}); LAMPS.push({x,y:y+.3*WD(y),z,r:2.2,c:[c[0]/255,c[1]/255,c[2]/255],prop:p,neon:true}); return p; };
MK.poster=(x0,x1,y,z0,z1,bg,lines)=>{ SHARED.PNAME='poster'; const W=Math.round((x1-x0)*FP), H=z1-z0, f=face(W,H,(x,y2)=>Math.min(x,W-1-x,y2,H-1-y2)<1?sh(bg,.7):bg,lines.map(([s,c,k,yy])=>[s,c,k||1,yy]),FL(y),x0,z1,x1-x0);
  return prop([WF(x0,x1,y),Bw(x0,x1,y,0,.02,z0,z1,bg,{foot:0,fj:f,fi:()=>null,top:()=>null})]); };
MK.posters=(x0,x1,y,z0,n,seed)=>{ '@later'; SHARED.PNAME='posters'; const bs=[WF(x0,x1,y)]; const C=[[220,70,60],[240,200,70],[60,120,200],[240,240,230],[40,160,120],[230,120,40],[200,80,160]];
  for(let i=0;i<n;i++){ const h=hash(i,seed,1), w=.35+hash(i,seed,2)*.35, hh=12+hash(i,seed,3)*18, px=x0+h*(x1-x0-w), pz=z0+hash(i,seed,4)*30, c=C[Math.floor(hash(i,seed,5)*C.length)];
    bs.push(Bw(px,px+w,y,0,.02,pz,pz+hh,c,{foot:0,fj:(u,z)=>{ const e=Math.min(u-px,px+w-u), ez=Math.min(z-pz,pz+hh-z); return e<.04||ez<1?sh(c,.75):(Math.floor(z/3)&1)&&Math.abs(u-px-w/2)<w*.3&&z>pz+2&&z<pz+hh-3?sh(c,.55):c; },fi:()=>null,top:()=>null})); }
  return prop(bs); };
MK.ghostsign=(x0,x1,y,z0,z1,s1,s2)=>{ '@later'; SHARED.PNAME='painted sign'; const W=Math.round((x1-x0)*FP), H=z1-z0, A=art(W,H,put=>{ for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++)if(hash(xx,yy,77)<.6)put(xx,yy,[232,226,206]); txt(put,s1,Math.floor((W-tw(s1,2))/2),4,[170,60,50],2); txt(put,s2,Math.floor((W-tw(s2,2))/2),18,[60,80,120],2); });
  const f=onFace(x0,z1,A,()=>null,FL(y),x1-x0); return prop([WF(x0,x1,y),Bw(x0,x1,y,0,.01,z0,z1,[0,0,0],{foot:0,fj:(u,z)=>{ const c=f(u,z); return c&&hash(Math.floor(u*24),Math.floor(z),78)<.7?c:null; },fi:()=>null,top:()=>null})]); };
MK.graffiti=(x0,x1,y,z0,s,c1,c2)=>{ '@later'; SHARED.PNAME='graffiti'; const W=Math.round((x1-x0)*FP), A=art(W,40,put=>{ txt(put,s,Math.floor((W-tw(s,3))/2)+2,12,c2,3); txt(put,s,Math.floor((W-tw(s,3))/2),10,c1,3); for(let i=0;i<40;i++)put(hash(i,1,5)*W,hash(i,2,5)*40,i&1?c1:c2); });
  const f=onFace(x0,z0+40,A,()=>null,FL(y),x1-x0); return prop([WF(x0,x1,y),Bw(x0,x1,y,-.08,.01,z0,z0+40,c1,{foot:0,fj:f,fi:()=>null,top:()=>null})]); };
MK.litwin=(x0,x1,y,z0,z1,c)=>{ '@later'; SHARED.PNAME='lit window'; const p=prop([WF(x0,x1,y),Bw(x0,x1,y,-.11,-.09,z0,z1,c,{foot:0,em:1,fj:(u,z)=>hash(Math.floor(u*8),Math.floor(z/6),9)<.85?c:sh(c,.8),fi:()=>null,top:()=>null})]); LAMPS.push({x:(x0+x1)/2,y:y+.5*WD(y),z:(z0+z1)/2,r:2.5,c:[1,.9,.72],prop:p}); return p; };
MK.ac=(x,y,z)=>{ '@later'; SHARED.PNAME='window AC'; const c=[168,170,166]; return prop([WF(x-.36,x+.36,y),Bw(x-.36,x+.36,y,-.12,.4,z,z+18,c,{foot:0,fj:(u,zz)=>zz<z+12&&Math.abs(u-x)<.3?((Math.floor(zz)&1)?sh(c,.55):sh(c,.8)):sh(c,.95),fi:()=>sh(c,.62),top:()=>sh(c,.9)}),Bw(x-.4,x+.4,y,.38,.42,z-2,z,[80,82,86],{foot:0})]); };
MK.walllamp=(x,y,z,c=[255,230,170])=>{ '@later'; SHARED.PNAME='door lamp'; const p=prop([WF(x-.15,x+.15,y),Bw(x-.04,x+.04,y,0,.3,z+10,z+13,[60,62,66],{foot:0}),Bw(x-.14,x+.14,y,.06,.32,z,z+10,c,{foot:0,em:1,top:()=>[60,62,66]})]); LAMPS.push({x,y:y+.35*WD(y),z:z+4,r:3.5,c:[c[0]/255,c[1]/255,c[2]/255],prop:p}); return p; };
MK.pipe=(x,y,h)=>{ SHARED.PNAME='drainpipe'; const c=[64,66,70]; return prop([WF(x-.1,x+.1,y),Bw(x-.05,x+.05,y,.02,.12,0,h-6,c,{foot:0}),Bw(x-.05,x+.05,y,.02,.24,h-6,h,c,{foot:0}),Bw(x-.08,x+.08,y,0,.16,8,12,sh(c,.9),{foot:0}),Bw(x-.08,x+.08,y,0,.16,70,74,sh(c,.9),{foot:0})]); };
MK.meterbox=(x,y,z)=>{ SHARED.PNAME='meter box'; const c=[120,122,118]; return prop([WF(x-.2,x+.2,y),Bw(x-.2,x+.2,y,0,.18,z,z+22,c,{foot:0,fj:(u,zz)=>Math.abs(u-x)<.09&&Math.abs(zz-z-14)<3?[40,42,44]:(zz-z)<2||(zz-z)>20?sh(c,.7):c}),Bw(x-.3,x-.2,y,0,.05,z+18,z+21,[60,60,60],{foot:0})]); };
MK.number=(x,y,z,s)=>{ SHARED.PNAME='house number'; const W=tw(s)+6; return prop([WF(x-.2,x+.2,y),Bw(x-W/FP/2,x+W/FP/2,y,0,.02,z,z+9,[40,38,36],{foot:0,fj:face(W,9,[40,38,36],[[s,[230,220,180],1,2]],FL(y),x-W/FP/2,z+9,W/FP)})]); };
MK.fireescape=(x0,x1,y,z,ladder)=>{ '@later'; SHARED.PNAME='fire escape'; const c=[52,54,58], d=.75, bs=[WF(x0,x1,y),Bw(x0,x1,y,0,d,z,z+3,c,{foot:0,top:(u,v)=>(Math.floor(u*8)&1)?sh(c,.8):c})];
  for(const [a,b] of [[x0,x0+.04],[x1-.04,x1]])bs.push(Bw(a,b,y,0,d,z+3,z+32,c,{foot:0}));
  bs.push(Bw(x0,x1,y,d-.04,d,z+30,z+33,c,{foot:0}),Bw(x0,x0+.04,y,0,d,z+30,z+33,c,{foot:0}),Bw(x1-.04,x1,y,0,d,z+30,z+33,c,{foot:0}));
  for(let u=x0+.2;u<x1-.1;u+=.22)bs.push(Bw(u,u+.03,y,d-.03,d,z+3,z+30,c,{foot:0}));
  if(ladder){ const lx=x1-.5; bs.push(Bw(lx,lx+.04,y,d-.14,d-.1,z-ladder,z+2,c,{foot:0}),Bw(lx+.36,lx+.4,y,d-.14,d-.1,z-ladder,z+2,c,{foot:0})); for(let k=z-ladder+6;k<z;k+=9)bs.push(Bw(lx,lx+.4,y,d-.13,d-.1,k,k+2,c,{foot:0})); }
  return prop(bs); };
MK.washing=(x0,x1,y,z)=>{ '@later'; SHARED.PNAME='clothesline'; const bs=[WF(x0,x1,y),Bw(x0,x1,y,.3,.32,z,z+1,[200,200,196],{foot:0})], C=[[230,230,220],[200,80,80],[80,120,200],[240,220,120],[120,180,120]];
  for(let i=0;i<Math.floor((x1-x0)/.5);i++){ const u=x0+.2+i*.5, w=.2+hash(i,3,2)*.15, h=10+hash(i,4,2)*8; bs.push(Bw(u,u+w,y,.28,.34,z-h,z,C[i%C.length],{foot:0})); } return prop(bs); };
MK.pole=(x,y)=>{ '@later'; SHARED.PNAME='utility pole'; const c=[96,78,58]; const bs=[Bx(x-.1,y-.1,x+.1,y+.1,0,165,c,{fj:(u,z)=>(Math.floor(z/7)&1)?sh(c,.9):c,fi:(u,z)=>(Math.floor(z/7)&1)?sh(c,.6):sh(c,.68)})]; for(const z of [138,152])bs.push(Bx(x-.7,y-.04,x+.7,y+.04,z,z+4,sh(c,.9),{foot:0})); for(const z of [142,156])for(const u of [x-.55,x-.25,x+.25,x+.55])bs.push(Bx(u-.03,y-.03,u+.03,y+.03,z,z+4,[120,140,150],{foot:0})); return prop(bs); };
MK.wires=(x0,x1,y,n=3)=>{ '@later'; SHARED.PNAME='overhead wires'; const air=o=>({c:[0,0,0],nb:1,top:()=>null,fi:()=>null,fj:()=>null,...o}), bs=[air({x0:x0+.1,y0:y-.6,x1:x0+.7,y1:y+.1,z0:133,z1:165,foot:1}),air({x0:x1-1.3,y0:y-.6,x1:x1-.1,y1:y+.1,z0:133,z1:165,foot:1}),air({x0:x0+.1,y0:y-.6,x1:x1-.1,y1:y+.1,z0:133,z1:165,foot:0})];
  const p=prop(bs), span=(x1-x0-.2)*24, rec=CLOTH.sheet('wire '+Math.round(span),{w:span,h:0,nt:Math.max(6,Math.round(span/18)),nz:1,pin:'ends',wind:50,slack:1.001,iter:40}), S={}; CLOTH.still(p,(x0+x1)/2,y-.25,149);
  p.lifeDraw=(D,W,H,ox,oy,t,K)=>{ const [lv,fr]=CLOTH.frame(p,rec,t), L=CLOTH.light(p,S,t,(x0+x1)/2,y-.25,112), c=[30*Math.min(1,L[0]),30*Math.min(1,L[1]),34*Math.min(1,L[2])];
    for(let k=0;k<n;k++){ const v=y-.55+k*.3, z0=162-(k&1)*13; CLOTH.strand(D,W,H,ox,oy,K,rec,lv,fr,(a,d,z)=>[x0+.1+a/24,v+d/24,z0-z],c,2); } };
  return p; };
MK.cable=(x0,x1,y,z)=>{ SHARED.PNAME='wall cable'; return prop([WF(x0,x1,y),Bw(x0,x1,y,.02,.05,z,z+1.5,[30,30,34],{foot:0}),Bw(x0,x0+.1,y,0,.06,z-14,z+2,[60,60,64],{foot:0})]); };
MK.bulb=(x,y,z,c=[255,214,150])=>{ SHARED.PNAME='bare bulb'; const p=prop([WF(x-.1,x+.1,y),Bw(x-.02,x+.02,y,.4,.44,z+4,z+30,[40,40,44],{foot:0}),Bw(x-.08,x+.08,y,.34,.5,z-6,z+4,c,{foot:0,em:1})]); LAMPS.push({x,y:y+.45*WD(y),z,r:3,c:[1,.84,.6],prop:p}); return p; };
MK.tvglow=(x0,x1,y,z0,z1)=>{ '@later'; SHARED.PNAME='TV glow'; const c=[120,170,255]; const p=prop([WF(x0,x1,y),Bw(x0,x1,y,-.11,-.09,z0,z1,c,{foot:0,em:1,fj:(u,z)=>hash(Math.floor(u*10),Math.floor(z/5),19)<.5?sh(c,.6):c,fi:()=>null,top:()=>null})]); LAMPS.push({x:(x0+x1)/2,y:y+.5*WD(y),z:(z0+z1)/2,r:2,c:[.5,.7,1],prop:p}); return p; };
MK.lantern=(x,y,z,c=[255,120,90])=>{ '@later'; SHARED.PNAME='paper lantern'; const p=prop([WF(x-.15,x+.15,y),Bw(x-.01,x+.01,y,.5,.52,z+14,z+30,[40,40,44],{foot:0}),Bw(x-.16,x+.16,y,.36,.66,z,z+14,c,{foot:0,em:1,fj:(u,zz)=>(Math.floor(zz)&1)?sh(c,.9):c,fi:()=>sh(c,.85)})]); LAMPS.push({x,y:y+.5*WD(y),z:z+6,r:2.5,c:[1,.5,.4],prop:p}); return p; };
MK.flag=(x,y,z)=>{ '@later'; SHARED.PNAME='flag'; const bs=[WF(x-.1,x+.1,y),Bw(x-.03,x+.03,y,0,.9,z,z+2,[70,72,76],{foot:0}),Bw(x-.02,x+.02,y,.85,.9,z-10,z+2,[70,72,76],{foot:0})];
  bs.push(Bw(x-.28,x+.28,y,.26,.9,z-15,z,[0,0,0],{foot:0,nb:1,top:()=>null,fi:()=>null,fj:()=>null}));
  const p=prop(bs), rec=CLOTH.sheet('flag',{w:.6*24,h:14,nt:8,nz:6,pin:'top',wind:90}), S={}, d=WD(y), w=WS(y); CLOTH.still(p,x,w+d*.5,z-7);
  p.lifeDraw=(D,W,H,ox,oy,t,K)=>{ const [lv,fr]=CLOTH.frame(p,rec,t), L=CLOTH.light(p,S,t,x,w+d*.5,z-7), col=(k,i,j)=>{ const c=i<3&&j<3?((i+j)&1?[240,240,240]:[60,80,160]):(j&1)?[240,240,240]:[200,60,60], q=sh(c,.75+.5*k); return [q[0]*L[0],q[1]*L[1],q[2]*L[2]]; };
    CLOTH.draw(D,W,H,ox,oy,K,rec,lv,fr,(a,dd,zz)=>[x+dd/24,w+d*(.28+a/24),z-zz],col); };
  return p; };
MK.windowstuff=(x0,x1,y,z)=>{ '@later'; SHARED.PNAME='window display'; const bs=[WF(x0,x1,y)], C=[[220,60,60],[240,200,60],[60,160,80],[80,120,220],[240,240,230],[230,140,50]];
  for(let i=0;i<6;i++){ const u=x0+.08+i*(x1-x0-.16)/6, w=(x1-x0-.16)/6-.04, h=8+hash(i,8,3)*10; bs.push(Bw(u,u+w,y,-.1,.08,z,z+h,C[i%6],{foot:0,fj:(a,zz)=>Math.abs(zz-z-h/2)<1.5?sh(C[i%6],.6):C[i%6]})); } return prop(bs); };
MK.produce=(x,y,w,flip)=>{ '@later'; SHARED.PNAME='produce stand'; const bs=[], F=[[220,60,50],[240,170,40],[90,170,60],[240,220,80],[160,60,120],[230,120,60],[70,140,70],[250,90,40]], wd=[150,110,70], L=.06;
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
MK.icebox=(x,y)=>{ SHARED.PNAME='ice chest'; const c=[236,238,240]; return prop([Bx(x,y,x+.9,y+.7,0,34,c,{fj:()=>c,fi:()=>sh(c,.7),top:()=>sh(c,.92)}),Bx(x,y,x+.9,y+.7,34,38,[70,110,210],{foot:0})]); };
MK.newsrack=(x,y)=>{ SHARED.PNAME='newspaper rack'; const c=[120,122,126], P=[226,224,214], t=.04, bs=[];
  for(const [u,v] of [[x,y],[x+.5-t,y],[x,y+.4-t],[x+.5-t,y+.4-t]])bs.push(Bx(u,v,u+t,v+t,0,28,sh(c,.9)));
  bs.push(Bx(x,y,x+.5,y+t,26,28,c,{foot:0}));
  for(let k=0;k<3;k++){ const z=3+k*9; bs.push(Bx(x+t,y+t,x+.5-t,y+.4-t,z,z+1,sh(c,.8),{foot:0}),Bx(x+t,y+.4-t,x+.5-t,y+.4,z,z+3,c,{foot:0}));
    for(let s=0;s<2;s++)for(let q=0;q<2+((k+s)&1);q++){ const u=x+.06+s*.2+hash(k,s*4+q,7)*.02, v=y+.06+hash(k,s*4+q,8)*.03;
      bs.push(Bx(u,v,u+.18,v+.26,z+1+q,z+2+q,sh(P,.94+q*.03),{foot:0,fj:()=>sh(P,.8),fi:()=>sh(P,.7),top:(a,b)=>{ const r=Math.floor((b-v)*24); return r>0&&r<2?[60,60,66]:(r&1)&&r>2&&hash(Math.floor(a*24),r,k+s)<.6?[110,110,116]:sh(P,.94+q*.03); }})); } }
  return prop(bs); };
MK.buckets=(x,y)=>{ '@later'; SHARED.PNAME='flower buckets'; const bs=[], C=[[230,70,90],[240,210,70],[250,250,240],[240,130,60]];
  for(let i=0;i<4;i++){ const u=x+(i%2)*.42, v=y+Math.floor(i/2)*.42, g=[60,62,66], t=.04;
    bs.push(Bx(u,v,u+.36,v+.36,0,2,g,{foot:1,top:()=>[26,27,30]}),Bx(u,v,u+.36,v+t,2,14,g),Bx(u,v+.36-t,u+.36,v+.36,2,14,g),Bx(u,v+t,u+t,v+.36-t,2,14,g),Bx(u+.36-t,v+t,u+.36,v+.36-t,2,14,g));
    for(let k=0;k<5;k++){ const a=u+.08+hash(i,k,21)*.18, b=v+.08+hash(i,k,22)*.18, h=19+Math.floor(hash(i,k,23)*8), bc=sh(C[i],.85+hash(i,k,24)*.25);
      bs.push(Bx(a,b,a+.042,b+.042,2,h,[70,120,70],{foot:0,nb:1}),Bx(a-.03,b-.03,a+.072,b+.072,h,h+3,bc,{foot:0,nb:1,top:(p,q)=>Math.abs(p-a-.021)<.02&&Math.abs(q-b-.021)<.02?sh(bc,.7):sh(bc,1.08)})); } } return prop(bs); };
MK.milkcrates=(x,y,n=3)=>{ '@later'; SHARED.PNAME='milk crates'; const C=[[200,50,50],[50,80,200],[230,200,60]], bs=[], t=.05; for(let k=0;k<n;k++){ const c=C[k%3], a=x+(k%2)*.02, b=y+(k%2)*.02, e=x+.5, f=y+.5, m=(a+e)/2, mv=(b+f)/2, z=k*12, o={foot:0};
  bs.push(Bx(a,b,e,f,z,z+2,c,{foot:k===0,top:(u,v)=>((Math.floor(u*20)+Math.floor(v*20))&1)?sh(c,.6):c}));
  for(const [u,v] of [[a,b],[e-t,b],[a,f-t],[e-t,f-t],[m-t/2,b],[m-t/2,f-t],[a,mv-t/2],[e-t,mv-t/2]])bs.push(Bx(u,v,u+t,v+t,z+2,z+12,c,o));
  for(const [zz,h] of [[z+10,2],[z+6,1]])bs.push(Bx(a,b,e,b+t,zz,zz+h,c,o),Bx(a,f-t,e,f,zz,zz+h,c,o),Bx(a,b+t,a+t,f-t,zz,zz+h,sh(c,.9),o),Bx(e-t,b+t,e,f-t,zz,zz+h,sh(c,.9),o)); }
  return prop(bs); };
MK.waterjugs=(x,y)=>{ '@later'; SHARED.PNAME='water jugs'; const bs=[]; for(let i=0;i<4;i++){ const u=x+(i%2)*.36, v=y+Math.floor(i/2)*.36; bs.push(Bx(u,v,u+.3,v+.3,0,14,[150,200,230],{foot:1,fj:(a,z)=>z>12?[90,140,200]:z>10?[200,230,245]:[150,200,230]}),Bx(u+.1,v+.1,u+.2,v+.2,14,17,[90,140,200],{foot:0})); } return prop(bs); };
MK.handtruck=(x,y)=>{ '@later'; SHARED.PNAME='hand truck'; const c=[200,60,40]; return prop([Bx(x,y,x+.5,y+.08,0,36,c),Bx(x,y,x+.5,y+.3,0,3,c),Bx(x+.02,y+.02,x+.14,y+.14,0,8,[40,40,44]),Bx(x+.36,y+.02,x+.48,y+.14,0,8,[40,40,44]),Bx(x+.02,y+.1,x+.48,y+.56,3,22,[190,150,100],{foot:0,...planks('crates',[190,150,100],6)})]); };
MK.cardboard=(x,y)=>{ SHARED.PNAME='cardboard boxes'; const c=[196,160,110], bs=[Bx(x,y,x+.7,y+.5,0,18,c,{...planks('crates',c,30)}),Bx(x+.1,y+.6,x+.6,y+1,0,14,sh(c,.95),{...planks('crates',c,30)}),Bx(x+.05,y+.05,x+.55,y+.45,18,30,sh(c,.9),{foot:0,top:(u,v)=>Math.abs(u-x-.3)<.03?sh(c,.7):c})]; return prop(bs); };
MK.trashbags=(x,y,n=4)=>{ '@later'; SHARED.PNAME='trash bags'; const bs=[]; for(let i=0;i<n;i++){ const u=x+hash(i,1,11)*.8, v=y+hash(i,2,11)*.6, w=.36+hash(i,3,11)*.2, h=14+hash(i,4,11)*8, c=[36,38,42]; bs.push(Bx(u,v,u+w,v+w*.9,0,h,c,{top:(a,b)=>hash(Math.floor(a*20),Math.floor(b*20),i)<.15?[70,72,78]:c,fj:(a,z)=>z>h-3?[60,62,66]:hash(Math.floor(a*20),Math.floor(z/2),i)<.1?[58,60,66]:c,fi:()=>[26,28,30]})); } return prop(bs); };
MK.shoppingcart=(x,y)=>{ '@later'; SHARED.PNAME='shopping cart'; const c=[150,152,156]; const bs=[Bx(x,y,x+.5,y+.9,0,6,[50,50,54]),Bx(x,y,x+.5,y+.9,12,30,c,{foot:0,fj:(u,z)=>((Math.floor(u*24)+Math.floor(z/2))&1)?null:c,fi:(u,z)=>((Math.floor(u*24)+Math.floor(z/2))&1)?null:sh(c,.7),top:(u,v)=>((Math.floor(u*24)+Math.floor(v*24))&1)?null:c}),Bx(x-.04,y+.85,x+.54,y+.9,30,33,[40,40,44],{foot:0})]; return prop(bs); };
MK.bike=(x,y,alongX,c=[60,80,160])=>{ '@later'; SHARED.PNAME='bicycle'; const W=.12, bs=alongX?[Bx(x,y,x+.3,y+W,0,20,[30,30,34]),Bx(x+.8,y,x+1.1,y+W,0,20,[30,30,34]),Bx(x+.25,y+.02,x+.85,y+.1,14,18,c,{foot:0}),Bx(x+.45,y+.02,x+.55,y+.1,18,30,c,{foot:0}),Bx(x+.4,y-.1,x+.6,y+.22,30,32,[40,40,44],{foot:0}),Bx(x+.9,y-.15,x+1,y+.27,28,30,[40,40,44],{foot:0})]
  :[Bx(x,y,x+W,y+.3,0,20,[30,30,34]),Bx(x,y+.8,x+W,y+1.1,0,20,[30,30,34]),Bx(x+.02,y+.25,x+.1,y+.85,14,18,c,{foot:0}),Bx(x+.02,y+.45,x+.1,y+.55,18,30,c,{foot:0}),Bx(x-.1,y+.4,x+.22,y+.6,30,32,[40,40,44],{foot:0}),Bx(x-.15,y+.9,x+.27,y+1,28,30,[40,40,44],{foot:0})]; return prop(bs); };
MK.scooter=(x,y)=>{ '@later'; SHARED.PNAME='scooter'; const c=[200,70,60]; return prop([Bx(x,y,x+.25,y+.3,0,12,[30,30,34]),Bx(x+1.1,y,x+1.35,y+.3,0,12,[30,30,34]),Bx(x+.2,y+.02,x+1.15,y+.28,8,22,c,{foot:0,fi:()=>sh(c,.7),fj:(u,z)=>z>18?sh(c,.6):c}),Bx(x+.5,y+.04,x+1,y+.26,22,30,[40,40,44],{foot:0}),Bx(x+1.1,y+.02,x+1.2,y+.28,22,36,[80,82,86],{foot:0}),Bx(x+1.05,y-.1,x+1.25,y+.4,36,38,[40,40,44],{foot:0})]); };
MK.newsstand=(x,y)=>{ '@later'; SHARED.PNAME='newsstand'; const c=[60,120,80], d=sh(c,.72), X=x+2, Y=y+1.3, T=.08, H=70, wood=[120,98,72];
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
MK.trashbasket=(x,y)=>{ '@later'; SHARED.PNAME='wire basket'; const c=[80,110,76], t=.04, e=x+.6, f=y+.6, bs=[Bx(x,y,e,f,0,3,[50,50,54],{top:()=>[36,38,42]})];
  for(const [zz,h] of [[25,3],[14,1]])bs.push(Bx(x,y,e,y+t,zz,zz+h,c,{foot:0}),Bx(x,f-t,e,f,zz,zz+h,c,{foot:0}),Bx(x,y+t,x+t,f-t,zz,zz+h,sh(c,.85),{foot:0}),Bx(e-t,y+t,e,f-t,zz,zz+h,sh(c,.85),{foot:0}));
  for(let i=0;i<4;i++){ const s=x+i*.15, q=y+i*.15; bs.push(Bx(s,y,s+t,y+t,3,25,c,{foot:0}),Bx(e-t-s+x,f-t,e-s+x,f,3,25,c,{foot:0}),Bx(x,f-t-q+y,x+t,f-q+y,3,25,c,{foot:0}),Bx(e-t,q,e,q+t,3,25,c,{foot:0})); }
  const L=[[[200,40,40],.09,.09,8],[[236,236,226],.1,.1,9],[[220,218,206],.16,.12,4],[[150,110,70],.18,.12,6]];
  for(let k=0;k<3;k++){ const [lc,w,d,h]=L[Math.floor(hash(Math.floor(x*7),Math.floor(y*7),k+60)*4)], u=x+.08+hash(Math.floor(x*7),Math.floor(y*7),k+63)*(.42-w), v=y+.08+k*.14;
    bs.push(Bx(u,v,u+w,v+d,3,3+h,lc,{foot:0,nb:1,top:()=>sh(lc,.9)})); }
  return prop(bs); };
MK.hydrant=(x,y,f=1)=>{ '@later'; SHARED.PNAME='fire hydrant'; const R=[196,40,34], RD=[132,22,22], RL=[232,84,64], I=[56,54,56], IL=[96,94,96], S=[186,190,196], SD=[120,124,132], CH=[78,78,82];
  const bs=[];
  const round=(x0,y0,x1,y1,z0,z1,c,cd,cl,o)=>Bx(x0,y0,x1,y1,z0,z1,c,{foot:0,...o,top:()=>cl,
    fi:(Y,z)=>{ const t=(Y-y0)/(y1-y0); return sh(t<.22||t>.82?cd:t<.42?cl:c,.66); }, fj:(X,z)=>{ const t=(X-x0)/(x1-x0); return sh(t<.18||t>.78?cd:t<.38?cl:c,.84); }});
  bs.push(Bx(x-.2,y-.2,x+.2,y+.2,0,3,I,{top:()=>IL,fi:(Y,z)=>sh(z>=1&&z<2&&(Math.floor((Y-y)*40)&7)===2?IL:I,.66),fj:(X,z)=>sh(z>=1&&z<2&&(Math.floor((X-x)*40)&7)===2?IL:I,.84)}));
  for(const [h,z0,z1,c,cd,cl] of [[.15,3,21,R,RD,RL],[.17,21,24,RD,sh(RD,.8),R],[.15,24,27,R,RD,RL],[.12,27,30,R,RD,RL],[.08,30,32,RD,sh(RD,.8),R]])
    bs.push(round(x-h,y-h*.7,x+h,y+h*.7,z0,z1,c,cd,cl),round(x-h*.7,y-h,x+h*.7,y+h,z0,z1,c,cd,cl));
  bs.push(Bx(x-.045,y-.035,x+.045,y+.035,32,35,S,{foot:0,top:()=>S,fi:()=>sh(S,.66),fj:()=>sh(S,.84)}),Bx(x-.03,y-.05,x+.03,y+.05,32,35,S,{foot:0,top:()=>S,fi:()=>sh(SD,.8),fj:()=>sh(S,.84)}));
  for(const s of [-1,1]){ const a=x+s*.15, b=x+s*.23, c=x+s*.27;
    bs.push(Bx(Math.min(a,b),y-.06,Math.max(a,b),y+.06,13,18,R,{foot:0,top:()=>RL,fi:()=>sh(R,.66),fj:()=>sh(R,.84)}),
      Bx(Math.min(b,c),y-.075,Math.max(b,c),y+.075,12,19,S,{foot:0,top:()=>S,fi:(Y,z)=>sh(z>17||z<13?SD:S,.7),fj:()=>sh(SD,.84)}),
      Bx(Math.min(a,c),y+.075,Math.max(a,c),y+.1,9,10,CH,{foot:0,nb:1}),Bx(Math.min(a,a+s*.03),y+.075,Math.max(a,a+s*.03),y+.1,9,13,CH,{foot:0,nb:1})); }
  const p0=y+f*.11, p1=y+f*.2, p2=y+f*.25, p3=y+f*.28;
  bs.push(Bx(x-.08,Math.min(p0,p1),x+.08,Math.max(p0,p1),11,19,R,{foot:0,top:()=>RL,fi:()=>sh(R,.66),fj:()=>sh(R,.84)}),
    Bx(x-.1,Math.min(p1,p2),x+.1,Math.max(p1,p2),10,20,S,{foot:0,top:()=>S,fi:()=>sh(SD,.7),fj:(X,z)=>sh(z>18||z<12?SD:S,.84)}),
    Bx(x-.035,Math.min(p2,p3),x+.035,Math.max(p2,p3),13,17,SD,{foot:0}));
  return prop(bs); };
MK.mailbox=(x,y)=>{ SHARED.PNAME='mailbox'; const c=[40,70,160]; return prop([Bx(x-.2,y-.2,x+.2,y+.2,0,6,[50,50,54]),Bx(x-.3,y-.3,x+.3,y+.3,6,32,c,{foot:0,fj:(u,z)=>z>26?sh(c,.8):Math.abs(u-x)<.2&&z>14&&z<22?sh(c,.6):c,fi:()=>sh(c,.62),top:()=>sh(c,.9)}),Bx(x-.3,y-.3,x+.3,y+.3,32,36,sh(c,.95),{foot:0})]); };
MK.meter=(x,y)=>{ SHARED.PNAME='parking meter'; return prop([Bx(x-.04,y-.04,x+.04,y+.04,0,34,[70,72,78]),Bx(x-.12,y-.08,x+.12,y+.08,34,48,[150,152,158],{foot:0,fj:(u,z)=>z>38&&z<45&&Math.abs(u-x)<.08?[220,200,80]:[150,152,158]})]); };
MK.payphone=(x,y,flip)=>{ '@later'; SHARED.PNAME='pay phone'; const c=[90,92,96], d=[30,30,34], o={foot:0}; return prop([Bx(x-.05,y-.05,x+.05,y+.05,0,28,[70,72,78]),Bx(x-.35,y-.25,x+.35,y+.25,28,32,[50,50,54],o),
  Bx(x-.3,y-.22,x+.3,y-.18,32,52,c,o),Bx(x-.3,y-.18,x-.26,y+.04,32,52,c,o),Bx(x+.26,y-.18,x+.3,y+.04,32,52,c,o),Bx(x-.4,y-.3,x+.4,y+.3,52,56,[40,110,200],o),
  Bx(x-.12,y-.18,x+.12,y-.04,35,49,[150,152,158],o),
  Bx(x-.06,y-.04,x+.04,y-.02,38,44,[206,206,210],{...o,fj:(u,z)=>Math.floor((u-x+.06)*24)%2===1&&Math.floor(z)%2===1?[50,50,56]:[206,206,210]}),Bx(x+.05,y-.04,x+.09,y-.02,45,47,[60,62,66],o),
  Bx(x-.17,y-.08,x-.12,y-.04,46,47,[60,60,64],o),Bx(x-.2,y-.09,x-.14,y-.03,37,47,d,o),
  Bx(x-.19,y-.07,x-.148,y-.028,33,37,d,o),Bx(x-.19,y-.07,x-.1,y-.028,33,35,d,o)]); };
MK.signpost=(x,y,s1,s2)=>{ '@later'; SHARED.PNAME='street sign'; const g=[22,104,62], wh=[240,242,236], bs=[Bx(x-.03,y-.03,x+.03,y+.03,0,88,[70,72,78])];
  const plate=(s,alongX,z1)=>{ const W=tw(s)+10, H=11, w=W/FP/2, a0=(alongX?x:y)-w, A=art(W,H,put=>{ for(let r=0;r<H;r++)for(let q=0;q<W;q++)put(q,r,g); for(let q=1;q<W-1;q++){ put(q,1,wh); put(q,H-2,wh); } txt(put,s,5,3,wh,1); });
    bs.push(sided({...(alongX?Bx(x-w,y-.02,x+w,y+.02,z1-H,z1,g):Bx(x-.02,y-w,x+.02,y+w,z1-H,z1,g)),foot:0,fs:(nx,ny,X,Y,z,k)=>{ if(alongX?!ny:!nx)return sh(g,k);
      const u=alongX?X:Y; return A(Math.floor((alongX?ny<0:nx>0)?(a0+2*w-u)*FP:(u-a0)*FP),Math.floor(H-z))||g; }})); };
  if(s1)plate(s1,true,112); if(s2)plate(s2,false,100); return prop(bs); };
MK.busstop=(x,y)=>{ '@later'; SHARED.PNAME='bus stop'; return prop([Bx(x-.03,y-.03,x+.03,y+.03,0,78,[70,72,78]),Bx(x-.7,y-.02,x+.7,y+.02,54,78,[240,240,236],{foot:0,fj:face(34,24,[240,240,236],[['BUS',[30,30,34],2,1],['STOP',[30,30,34],2,12]],FL(y),x-.7,78,1.4)}),Bx(x-.5,y-.02,x+.5,y+.02,42,54,[200,50,50],{foot:0,fj:face(24,12,[200,50,50],[['M11',[250,250,250],2,1]],FL(y),x-.5,54,1)})]); };
MK.bollard=(x,y)=>{ SHARED.PNAME='bollard'; const c=[60,62,66]; return prop([Bx(x-.1,y-.1,x+.1,y+.1,0,26,c),Bx(x-.12,y-.12,x+.12,y+.12,26,30,sh(c,1.2),{foot:0})]); };
MK.manhole=(x,y)=>{ SHARED.PNAME='manhole cover'; const c=[90,88,84]; return prop([Bx(x-.4,y-.4,x+.4,y+.4,0,1,c,{top:(u,v)=>{ const d=Math.hypot(u-x,v-y); return d>.4?null:d>.36?sh(c,.6):((Math.floor(u*16)+Math.floor(v*16))&1)?sh(c,.85):c; }})],null,{walk:true}); };
MK.grate=(x,y,w,d)=>{ SHARED.PNAME='subway grate'; const c=[70,70,74]; return prop([Bx(x,y,x+w,y+d,0,1,c,{top:(u,v)=>(Math.floor((v-y)*24)&1)?[30,30,34]:c})],null,{walk:true}); };
MK.puddle=(x,y,w,d)=>{ '@later'; SHARED.PNAME='puddle'; return prop([Bx(x,y,x+w,y+d,0,.5,[90,100,110],{top:(u,v)=>{ const a=(u-x-w/2)/(w/2), b=(v-y-d/2)/(d/2), r=a*a+b*b; return r>1||hash(Math.floor(u*8),Math.floor(v*8),41)<r*.5?null:hash(Math.floor(u*24),Math.floor(v*24),43)<.06?[150,160,170]:[92,100,112]; }})],null,{walk:true}); };
MK.litter=(x,y,n=6,seed=1)=>{ '@later'; SHARED.PNAME='litter'; const bs=[], C=[[230,230,220],[200,190,160],[220,200,80],[180,180,176]]; for(let i=0;i<n;i++){ const u=x+hash(i,1,seed)*2, v=y+hash(i,2,seed)*2, w=.08+hash(i,3,seed)*.12; bs.push(Bx(u,v,u+w,v+w*.6,0,1,C[i%4],{foot:1})); } return prop(bs,null,{walk:true}); };
MK.chalk=(x,y)=>{ SHARED.PNAME='chalk hopscotch'; const c=[220,210,190]; return prop([Bx(x,y,x+.8,y+3,0,.5,c,{top:(u,v)=>{ const a=u-x, b=v-y, cell=Math.floor(b/.6), e=Math.min(a,.8-a), eb=Math.min(b-cell*.6,.6-(b-cell*.6)); return e<.05||eb<.04?c:null; }})],null,{walk:true}); };
MK.pigeons=(x,y,n=5)=>{ SHARED.PNAME='pigeons'; const bs=[]; for(let i=0;i<n;i++){ const u=x+hash(i,1,21)*1.6, v=y+hash(i,2,21)*1.2, c=i%3?[120,120,130]:[170,170,176]; bs.push(Bx(u,v,u+.16,v+.1,0,5,c,{foot:1,top:()=>sh(c,1.1)}),Bx(u+.14,v+.02,u+.2,v+.08,5,8,[80,80,90],{foot:0})); } return prop(bs); };
MK.bikerack=(x,y)=>{ SHARED.PNAME='bike rack'; const c=[70,72,78]; return prop([Bx(x-.04,y,x+.04,y+.08,0,26,c),Bx(x-.04,y+.72,x+.04,y+.8,0,26,c),Bx(x-.04,y,x+.04,y+.8,26,30,c,{foot:0})]); };
MK.standpipe=(x,y)=>{ SHARED.PNAME='standpipe'; const c=[180,60,50]; return prop([Bx(x-.08,y-.08,x+.08,y+.08,0,22,c),Bx(x-.26,y-.1,x+.26,y+.1,22,34,c,{foot:0}),Bx(x-.24,y-.14,x-.12,y+.14,26,30,[200,170,60],{foot:0}),Bx(x+.12,y-.14,x+.24,y+.14,26,30,[200,170,60],{foot:0})]); };
MK.dumpster=(x,y,c=[40,110,70])=>{ '@later'; SHARED.PNAME='dumpster'; return prop([Bx(x,y,x+1.6,y+1,0,6,[40,40,44]),Bx(x,y,x+1.6,y+1,6,40,c,{foot:0,fj:(u,z)=>z<12||(Math.floor((u-x)*24)%12<1)?sh(c,.75):c,fi:()=>sh(c,.62),top:()=>sh(c,.9)}),Bx(x-.02,y-.02,x+1.62,y+1.02,40,46,sh(c,.85),{foot:0,top:(u,v)=>(Math.floor((u-x)*2)&1)?sh(c,.8):sh(c,.9)}),Bx(x-.08,y+.3,x+1.68,y+.7,20,48,[40,40,44],{foot:0,fj:()=>null,fi:()=>[40,40,44],top:()=>null})]); };
MK.pallets=(x,y)=>{ SHARED.PNAME='pallets'; const c=[170,140,100], bs=[]; for(let k=0;k<3;k++)bs.push(Bx(x,y,x+1,y+1,k*5,k*5+5,c,{foot:k===0,fj:(u,z)=>(z-k*5)<2?sh(c,.6):c,fi:(u,z)=>(z-k*5)<2?sh(c,.5):sh(c,.7),top:(u,v)=>(Math.floor((u-x)*7)&1)?sh(c,.75):c})); return prop(bs); };
MK.tires=(x,y)=>{ '@later'; SHARED.PNAME='tires'; const bs=[]; for(let k=0;k<3;k++)bs.push(Bx(x,y,x+.6,y+.6,k*9,k*9+9,[36,36,40],{foot:k===0,top:(u,v)=>{ const d=Math.hypot(u-x-.3,v-y-.3); return d>.3?null:d<.14?(k<2?[26,26,30]:[50,50,54]):(Math.floor(d*40)&1)?[44,44,48]:[36,36,40]; },fj:(u,z)=>(Math.floor(z)-k*9)%3===0?[48,48,52]:[36,36,40]})); return prop(bs); };
MK.drum=(x,y,c=[60,80,150])=>{ SHARED.PNAME='oil drum'; return prop([Bx(x,y,x+.6,y+.6,0,36,c,{top:(u,v)=>Math.hypot(u-x-.3,v-y-.3)>.3?null:sh(c,.9),fj:(u,z)=>z%12<1.5?sh(c,.7):c,fi:(u,z)=>z%12<1.5?sh(c,.5):sh(c,.62)})]); };
MK.umbrella=(x,y,ca,cb)=>{ '@later'; SHARED.PNAME='umbrella'; const bs=[Bx(x-.2,y-.2,x+.2,y+.2,0,4,[60,60,64]),Bx(x-.03,y-.03,x+.03,y+.03,4,70,[90,92,96],{foot:0})]; for(let k=0;k<4;k++){ const r=1-k*.22; bs.push(Bx(x-r,y-r,x+r,y+r,70+k*6,76+k*6,ca,{foot:0,top:(u,v)=>{ const a=Math.atan2(v-y,u-x); return Math.hypot(u-x,v-y)>r?null:ca; },fj:()=>sh(ca,.8),fi:()=>sh(ca,.6)})); } return prop(bs); };
MK.stringlights=(x0,x1,y,z,c=[255,220,140])=>{ '@later'; SHARED.PNAME='string lights'; const bs=[Bx(x0,y-.05,x1,y+.05,0,.01,[0,0,0],{foot:1,top:()=>null,fi:()=>null,fj:()=>null}),Bx(x0,y-.02,x1,y,z,z+1,[40,40,44],{foot:0})]; for(let u=x0+.3;u<x1;u+=.6)bs.push(Bx(u,y-.05,u+.08,y+.03,z-4,z-1,c,{foot:0,em:1})); const p=prop(bs); LAMPS.push({x:(x0+x1)/2,y,z,r:Math.min(6,(x1-x0)/2),c:[1,.86,.55],prop:p}); return p; };
MK.banner=(x0,x1,y,z,s,bg,fg)=>{ SHARED.PNAME='banner'; const W=Math.round((x1-x0)*FP); return prop([Bx(x0,y-.05,x1,y+.05,0,.01,[0,0,0],{foot:1,top:()=>null,fi:()=>null,fj:()=>null}),Bx(x0,y-.04,x1,y,z-14,z,bg,{foot:0,fj:face(W,14,bg,[[s,fg,2,2]],0,x0,z,x1-x0),fi:()=>sh(bg,.7),top:()=>bg})]); };
MK.rug=(x,y,w,d,ca,cb)=>{ '@later'; SHARED.PNAME='rug of wares'; const bs=[Bx(x,y,x+w,y+d,0,1,ca,{top:(u,v)=>Math.min(u-x,x+w-u,v-y,y+d-v)<.08?cb:((Math.floor((u-x)*4)+Math.floor((v-y)*4))&1)?ca:sh(ca,.9)})]; const C=[[200,180,80],[120,80,60],[80,120,160],[200,200,190],[60,60,64]]; for(let i=0;i<7;i++){ const u=x+.15+hash(i,1,51)*(w-.5), v=y+.15+hash(i,2,51)*(d-.5), s=.15+hash(i,3,51)*.2; bs.push(Bx(u,v,u+s,v+s,1,3+hash(i,4,51)*8,C[i%5],{foot:0})); } return prop(bs); };
MK.watertank=(x,y,z,fy)=>{ '@later'; SHARED.PNAME='water tower'; const c=[120,90,60], bs=[WF(x-.6,x+.6,fy)]; for(const [a,b] of [[x-.55,y-.55],[x+.45,y-.55],[x-.55,y+.45],[x+.45,y+.45]])bs.push(Bx(a,b,a+.1,b+.1,z,z+30,[60,60,64],{foot:0}));
  bs.push(Bx(x-.6,y-.6,x+.6,y+.6,z+30,z+34,[60,60,64],{foot:0}),Bx(x-.55,y-.55,x+.55,y+.55,z+34,z+70,c,{foot:0,fj:(u,zz)=>Math.hypot(u-x,0)>.5?null:zz%12<1.5?[60,60,64]:(Math.floor((u-x+.55)*24)%4<1)?sh(c,.8):c,fi:(u,zz)=>zz%12<1.5?[50,50,54]:(Math.floor((u-y+.55)*24)%4<1)?sh(c,.6):sh(c,.7),top:(u,v)=>Math.hypot(u-x,v-y)>.55?null:sh(c,.9)}));
  for(let k=0;k<4;k++){ const r=.55-k*.13; bs.push(Bx(x-r,y-r,x+r,y+r,z+70+k*5,z+75+k*5,[70,72,78],{foot:0,top:(u,v)=>Math.hypot(u-x,v-y)>r?null:[80,82,88],fj:()=>[66,68,74],fi:()=>[56,58,64]})); } return prop(bs); };
MK.roofac=(x,y,z,fy)=>{ '@later'; SHARED.PNAME='rooftop AC'; const c=[160,162,160]; return prop([WF(x-.6,x+.6,fy),Bx(x-.6,y-.5,x+.6,y+.5,z,z+28,c,{foot:0,fj:(u,zz)=>zz>z+6&&zz<z+22&&Math.abs(u-x)<.45?((Math.floor(zz)&1)?sh(c,.55):sh(c,.8)):c,fi:()=>sh(c,.62),top:(u,v)=>Math.hypot(u-x,v-y)<.3?((Math.floor(u*20)+Math.floor(v*20))&1?[60,60,64]:[90,90,94]):sh(c,.9)})]); };
MK.vent=(x,y,z,fy,h=20)=>{ SHARED.PNAME='roof vent'; const c=[150,150,154]; return prop([WF(x-.15,x+.15,fy),Bx(x-.12,y-.12,x+.12,y+.12,z,z+h,c,{foot:0}),Bx(x-.2,y-.2,x+.2,y+.2,z+h,z+h+5,sh(c,.9),{foot:0}),Bx(x-.1,y-.26,x+.1,y-.1,z+h-2,z+h+4,sh(c,.7),{foot:0})]); };
MK.chimney=(x,y,z,fy)=>{ SHARED.PNAME='chimney'; return prop([WF(x-.2,x+.2,fy),Bx(x-.2,y-.2,x+.2,y+.2,z,z+24,[120,70,56],{foot:0,fj:(u,zz)=>brickCol(u,zz,1,1e9),fi:(u,zz)=>brickCol(u,zz,.8,1e9),top:()=>[70,60,56]}),Bx(x-.24,y-.24,x+.24,y+.24,z+24,z+27,[150,146,136],{foot:0})]); };
MK.antenna=(x,y,z,fy)=>{ SHARED.PNAME='TV antenna'; const c=[150,150,156], bs=[WF(x-.3,x+.3,fy),Bx(x-.02,y-.02,x+.02,y+.02,z,z+50,[90,90,96],{foot:0})]; for(let k=0;k<4;k++){ const w=.2+k*.12; bs.push(Bx(x-w,y-.01,x+w,y+.01,z+46-k*6,z+47-k*6,c,{foot:0})); } bs.push(Bx(x-.01,y-.3,x+.01,y+.3,z+40,z+41,c,{foot:0})); return prop(bs); };
MK.bulkhead=(x,y,z,fy)=>{ '@later'; SHARED.PNAME='roof door'; return prop([WF(x-.5,x+.5,fy),Bx(x-.5,y-.5,x+.5,y+.5,z,z+40,[110,66,52],{foot:0,fj:(u,zz)=>Math.abs(u-x)<.25&&zz<z+32?[50,46,44]:brickCol(u,zz,1,1e9),fi:(u,zz)=>brickCol(u,zz,.8,1e9),top:()=>[70,66,62]}),Bx(x-.55,y-.55,x+.55,y+.55,z+40,z+44,[90,90,94],{foot:0})]); };
MK.skylight=(x,y,z,fy)=>{ SHARED.PNAME='skylight'; return prop([WF(x-.5,x+.5,fy),Bx(x-.5,y-.4,x+.5,y+.4,z,z+8,[80,82,86],{foot:0,top:(u,v)=>Math.min(Math.abs(u-x)-.5,Math.abs(v-y)-.4)>-.06||Math.abs(u-x)<.02?[80,82,86]:[90,130,160]})]); };
MK.coop=(x,y,z,fy)=>{ '@later'; SHARED.PNAME='pigeon coop'; const c=[120,110,90], o={foot:0}, w=[150,154,156], pg=[160,160,170], bd=planks('crates',c,6); const bs=[WF(x-.6,x+.6,fy),
  Bx(x-.6,y-.5,x+.6,y+.5,z,z+2,c,{foot:0,top:(u,v)=>hash(Math.floor(u*24),Math.floor(v*24),71)<.08?[214,212,200]:sh(c,.8)}),
  Bx(x-.6,y-.5,x+.6,y-.42,z+2,z+30,c,{...o,...bd}),Bx(x-.6,y-.42,x-.52,y+.5,z+2,z+30,c,{...o,...bd}),Bx(x+.52,y-.42,x+.6,y+.5,z+2,z+30,c,{...o,...bd}),
  Bx(x-.65,y-.55,x+.65,y+.55,z+30,z+33,[90,88,84],o)];
  bs.push(Bx(x-.03,y+.44,x+.03,y+.5,z+2,z+30,sh(c,.9),o));
  for(const [zz,h] of [[z+2,3],[z+27,3]])bs.push(Bx(x-.52,y+.46,x+.52,y+.5,zz,zz+h,sh(c,.9),o));
  for(let i=1;i<10;i++){ const u=x-.52+i*.104; if(Math.abs(u-x)>.07)bs.push(Bx(u-.021,y+.47,u+.021,y+.49,z+5,z+27,w,o)); }
  bs.push(Bx(x-.52,y-.04,x+.52,y,z+12,z+14,sh(c,1.1),o),Bx(x-.52,y-.36,x+.52,y-.32,z+21,z+23,sh(c,1.1),o));
  for(const u of [x-.3,x+.12]){ bs.push(Bx(u,y-.07,u+.15,y+.03,z+14,z+18,pg,o),Bx(u+.1,y-.05,u+.16,y+.01,z+18,z+20,sh(pg,.8),o)); }
  for(let i=0;i<3;i++)bs.push(Bx(x-.5+i*.4,y-.3,x-.36+i*.4,y-.2,z+33,z+38,pg,o)); return prop(bs); };
MK.billboard=(x0,x1,y,z,fy,s1,s2,bg,fg)=>{ '@later'; SHARED.PNAME='billboard'; const W=Math.round((x1-x0)*FP), bs=[WF(x0,x1,fy),Bx(x0+.1,y-.1,x0+.16,y,z,z+40,[70,72,78],{foot:0}),Bx(x1-.16,y-.1,x1-.1,y,z,z+40,[70,72,78],{foot:0}),Bx(x0,y-.06,x1,y,z+30,z+70,bg,{foot:0,fj:face(W,40,bg,[[s1,fg,3,6],[s2,fg,2,26]],0,x0,z+70,x1-x0),fi:()=>[60,60,64],top:()=>[70,72,78]})];
  for(const u of [x0+.5,(x0+x1)/2,x1-.5])bs.push(Bx(u-.1,y-.3,u+.1,y-.06,z+70,z+74,[70,72,78],{foot:0}),Bx(u-.08,y-.3,u+.08,y-.14,z+66,z+70,[255,240,200],{foot:0,em:1})); const p=prop(bs); LAMPS.push({x:(x0+x1)/2,y:y-.5,z:z+60,r:3,c:[1,.95,.8],prop:p}); return p; };
MK.roofpots=(x,y,z,fy)=>{ '@later'; SHARED.PNAME='roof garden'; const bs=[WF(x-.5,x+.5,fy)]; for(let i=0;i<3;i++){ const u=x-.4+i*.4; bs.push(Bx(u,y-.15,u+.3,y+.15,z,z+10,[160,90,60],{foot:0}),Bx(u+.05,y-.1,u+.25,y+.1,z+10,z+22,[70,130,60],{foot:0,top:(a,b)=>hash(Math.floor(a*20),Math.floor(b*20),i)<.5?[100,170,80]:[70,130,60]})); } return prop(bs); };
MK.roofjunk=(x,y,z,fy)=>{ '@later'; SHARED.PNAME='roof clutter'; return prop([WF(x-.5,x+.5,fy),Bx(x-.5,y-.3,x+.1,y+.3,z,z+9,[36,36,40],{foot:0,top:(u,v)=>Math.hypot(u-x+.2,v-y)>.3?null:Math.hypot(u-x+.2,v-y)<.13?[60,60,64]:[36,36,40]}),Bx(x+.1,y-.4,x+.6,y+.1,z,z+16,[150,110,70],{foot:0,...planks('crates',[150,110,70],6)})]); };
const GREENS=[[62,118,60],[78,140,70],[46,92,50],[98,158,82],[54,104,56]];
MK.ivy=(x,y,h,w=1.4,seed=1)=>{ '@later'; SHARED.PNAME='ivy'; const x0=x-w, x1=x+w; return prop([WF(x0,x1,y),Bw(x0,x1,y,.02,.05,0,h,[0,0,0],{foot:0,top:()=>null,fi:()=>null,fj:(u,z)=>{ const du=Math.abs(u-x)/w, t=z/h, stem=Math.abs(u-x-.25*Math.sin(z/22+seed))<.05;
  const d=(1-t)*(1-du*du)*.9+(stem?.4:0); const n=hash(Math.floor(u*24),Math.floor(z),seed*3+5); if(n>d)return null; return GREENS[Math.floor(hash(Math.floor(u*12),Math.floor(z/2),seed+9)*5)]; }})]); };
MK.windowbox=(x,y,z,c=[200,70,80])=>{ '@later'; SHARED.PNAME='window box'; return prop([WF(x-.6,x+.6,y),Bw(x-.6,x+.6,y,0,.26,z,z+8,[110,66,46],{foot:0,fj:(u,zz)=>zz>z+6?[130,80,56]:[110,66,46]}),Bw(x-.56,x+.56,y,.02,.24,z+8,z+16,GREENS[0],{foot:0,top:(u,v)=>{ const n=hash(Math.floor(u*20),Math.floor(v*20),44); return n<.3?c:n<.4?[250,240,200]:GREENS[Math.floor(n*5)%5]; },fj:(u,zz)=>hash(Math.floor(u*20),Math.floor(zz),45)<.25?c:GREENS[Math.floor(hash(Math.floor(u*12),Math.floor(zz/2),46)*5)],fi:()=>sh(GREENS[2],.8)})]); };
MK.pot=(x,y,r=.3,c=[170,96,62],h=12)=>{ SHARED.PNAME='plant pot'; return prop([Bx(x-r,y-r,x+r,y+r,0,h,c,{top:(u,v)=>Math.hypot(u-x,v-y)>r?null:[60,44,34],fj:(u,z)=>z>h-3?sh(c,1.1):c,fi:(u,z)=>z>h-3?sh(c,.8):sh(c,.65)}),...leaves(x,y,h,r*1.3,Math.round(x*5+y*3))]); };
MK.hanging=(x,y,z)=>{ '@later'; SHARED.PNAME='hanging plant'; return prop([WF(x-.2,x+.2,y),Bw(x-.01,x+.01,y,.5,.52,z+8,z+30,[60,60,64],{foot:0}),Bw(x-.18,x+.18,y,.33,.69,z,z+8,[150,86,56],{foot:0}),Bw(x-.3,x+.3,y,.22,.8,z-16,z+10,GREENS[1],{foot:0,top:(u,v)=>hash(Math.floor(u*20),Math.floor(v*20),51)<.35?null:GREENS[Math.floor(hash(Math.floor(u*20),Math.floor(v*20),52)*5)],fj:(u,zz)=>hash(Math.floor(u*20),Math.floor(zz/2),53)<.45?null:GREENS[Math.floor(hash(Math.floor(u*20),Math.floor(zz/2),54)*5)],fi:(u,zz)=>hash(Math.floor(u*20),Math.floor(zz/2),55)<.45?null:sh(GREENS[Math.floor(hash(Math.floor(u*20),Math.floor(zz/2),56)*5)],.75)})]); };
const leaves=(x,y,z,r,seed)=>[0,1,2].map(k=>{ const rr=r*(1-k*.3), g=GREENS[(Math.abs(seed)+k)%5]; return Bx(x-rr,y-rr,x+rr,y+rr,z+k*7,z+k*7+8,g,{foot:0,nb:1,top:(u,v)=>Math.hypot(u-x,v-y)>rr?null:hash(Math.floor(u*16),Math.floor(v*16),seed+k)<.3?sh(g,1.15):g,fj:(u,zz)=>hash(Math.floor(u*16),Math.floor(zz/2),seed+7+k)<.25?null:g,fi:(u,zz)=>hash(Math.floor(u*16),Math.floor(zz/2),seed+11+k)<.25?null:sh(g,.7)}); });
MK.weeds=(x,y,n=8,seed=2)=>{ '@later'; SHARED.PNAME='weeds'; const bs=[]; for(let i=0;i<n;i++){ const u=x+Math.round(hash(i,1,seed)*3), v=y+Math.round(hash(i,2,seed)*3), a=hash(i,3,seed)*.9, b=hash(i,4,seed)*.9, ww=.06+hash(i,5,seed)*.08, h=2+hash(i,6,seed)*4; const along=hash(i,7,seed)<.5; bs.push(Bx(along?u+a:u+.0,along?v+.0:v+b,along?u+a+ww:u+.06,along?v+.06:v+b+ww,0,h,GREENS[i%5],{foot:1,fi:()=>sh(GREENS[i%5],.7)})); } return prop(bs); };
MK.moss=(x0,x1,y,seed=3)=>{ SHARED.PNAME='moss'; return prop([WF(x0,x1,y),Bw(x0,x1,y,.02,.04,0,10,[0,0,0],{foot:0,top:()=>null,fi:()=>null,fj:(u,z)=>hash(Math.floor(u*24),Math.floor(z),seed)<(10-z)/10*.5?[66,96,52]:null})]); };
MK.rust=(x,y,z,w=.4,h=24)=>{ SHARED.PNAME='rust streak'; return prop([WF(x-w,x+w,y),Bw(x-w,x+w,y,.02,.03,z-h,z,[0,0,0],{foot:0,top:()=>null,fi:()=>null,fj:(u,zz)=>{ const du=Math.abs(u-x)/w, t=(z-zz)/h; return hash(Math.floor(u*24),Math.floor(zz),62)<(1-du)*(1-t)*.7?[122,72,40]:null; }})]); };
MK.plywood=(x,y,z0=32,z1=76)=>{ SHARED.PNAME='boarded window'; const c=[170,140,96]; return prop([WF(x-.72,x+.72,y),Bw(x-.72,x+.72,y,-.12,-.04,z0,z1,c,{foot:0,fj:(u,zz)=>(zz-z0)%22<1||Math.abs(u-x)<.02?sh(c,.7):hash(Math.floor(u*24),Math.floor(zz/3),63)<.1?sh(c,.9):c,fi:()=>sh(c,.7),top:()=>sh(c,.8)})]); };
MK.stain=(x,y,r=.6,seed=4)=>{ SHARED.PNAME='stain'; return prop([Bx(x-r,y-r,x+r,y+r,0,.5,[0,0,0],{top:(u,v)=>{ const d=Math.hypot(u-x,v-y)/r; return d<1&&hash(Math.floor(u*12),Math.floor(v*12),seed)<(1-d)*.8?[118,112,100]:null; }})]); };
MK.crack=(x,y,seed=5)=>{ SHARED.PNAME='cracked slab'; return prop([Bx(x,y,x+1,y+1,0,.5,[0,0,0],{top:(u,v)=>{ const a=u-x, b=v-y, c=.5+.25*Math.sin(b*9+seed)+.1*Math.sin(b*23); return Math.abs(a-c)<.03||hash(Math.floor(u*24),Math.floor(v*24),seed)<.02?[110,104,94]:null; }})]); };
MK.patch=(x,y,w,d)=>{ SHARED.PNAME='asphalt patch'; return prop([Bx(x,y,x+w,y+d,0,.5,[76,74,72],{top:(u,v)=>hash(Math.floor(u*14),Math.floor(v*14),66)<.1?[88,86,84]:[76,74,72]})]); };
MK.chair=(x,y)=>{ '@later'; SHARED.PNAME='folding chair'; const c=[150,80,60]; return prop([Bx(x,y,x+.06,y+.06,0,13,[60,60,64]),Bx(x+.44,y,x+.5,y+.06,0,13,[60,60,64]),Bx(x,y+.44,x+.06,y+.5,0,13,[60,60,64]),Bx(x+.44,y+.44,x+.5,y+.5,0,13,[60,60,64]),Bx(x,y,x+.5,y+.5,16,19,c,{foot:0}),Bx(x,y,x+.5,y+.06,19,40,c,{foot:0,fj:(u,z)=>(Math.floor(z/4)&1)?sh(c,.85):c})]); };
MK.table=(x,y)=>{ '@later'; SHARED.PNAME='dominoes table'; const c=[60,110,90]; const bs=[Bx(x+.04,y+.04,x+.1,y+.1,0,20,[60,60,64]),Bx(x+.9,y+.9,x+.96,y+.96,0,20,[60,60,64]),Bx(x,y,x+1,y+1,20,22,c,{foot:0})]; for(let i=0;i<7;i++){ const u=x+.15+hash(i,1,71)*.6, v=y+.15+hash(i,2,71)*.6; bs.push(Bx(u,v,u+.16,v+.08,22,24,[236,232,220],{foot:0,top:(a,b)=>hash(Math.floor(a*60),Math.floor(b*60),i)<.3?[30,30,34]:[236,232,220]})); } return prop(bs); };
MK.radio=(x,y,z=0)=>{ '@later'; SHARED.PNAME='radio'; const c=[80,70,60]; return prop([Bx(x,y,x+.4,y+.2,z,z+12,c,{foot:z===0,fj:(u,zz)=>Math.abs(u-x-.12)<.06&&zz>z+3&&zz<z+9?[40,40,44]:u>x+.24&&zz>z+3&&zz<z+9?((Math.floor(zz)&1)?[50,50,54]:[90,80,70]):c}),Bx(x+.3,y+.1,x+.32,y+.12,z+12,z+28,[160,160,166],{foot:0})]); };
MK.broom=(x,y)=>{ SHARED.PNAME='broom'; return prop([Bx(x,y,x+.14,y+.1,0,8,[180,150,80],{fj:(u,z)=>((Math.floor(u*60))&1)?[150,120,60]:[180,150,80]}),Bx(x+.05,y+.03,x+.09,y+.07,8,48,[120,96,60],{foot:0})]); };
MK.bucket=(x,y)=>{ SHARED.PNAME='mop bucket'; const c=[230,200,60]; return prop([Bx(x,y,x+.4,y+.4,0,16,c,{top:(u,v)=>Math.hypot(u-x-.2,v-y-.2)>.2?null:[90,100,110],fj:(u,z)=>z>13?sh(c,1.05):c}),Bx(x+.3,y+.3,x+.34,y+.34,16,46,[120,100,70],{foot:0}),Bx(x+.26,y+.26,x+.38,y+.38,12,18,[200,200,196],{foot:0})]); };
MK.bowl=(x,y)=>{ SHARED.PNAME='cat bowl'; return prop([Bx(x,y,x+.2,y+.2,0,3,[200,60,60],{top:(u,v)=>Math.hypot(u-x-.1,v-y-.1)>.1?null:[120,90,60]})]); };
MK.hose=(x,y)=>{ SHARED.PNAME='coiled hose'; const c=[60,120,70]; return prop([Bx(x,y,x+.5,y+.5,0,5,c,{top:(u,v)=>{ const d=Math.hypot(u-x-.25,v-y-.25); return d>.25||d<.08?null:(Math.floor(d*40)&1)?sh(c,.8):c; },fj:(u,z)=>(Math.floor(z)&1)?sh(c,.8):c})]); };
MK.chalkboard=(x,y,l1,l2)=>{ '@later'; SHARED.PNAME='chalkboard'; const c=[40,44,42]; return prop([Bx(x,y,x+2,y+.4,0,34,[120,86,56],{fj:(u,z)=>{ const e=Math.min(u-x,x+2-u), ez=Math.min(z,34-z); if(e<.06||ez<2)return [120,86,56]; return face(44,30,c,[[l1,[220,220,210],2,4],[l2,[220,200,120],2,16]],0,x+.06,32,1.88)(u,z)||c; },fi:()=>[90,64,40],top:()=>[120,86,56]})]); };
MK.papers=(x,y)=>{ '@later'; SHARED.PNAME='newspaper stack'; const bs=[]; for(let k=0;k<4;k++)bs.push(Bx(x+(k&1)*.03,y+(k>>1)*.03,x+.5+(k&1)*.03,y+.36+(k>>1)*.03,k*2.5,k*2.5+2.5,[226,224,214],{foot:k===0,fj:(u,z)=>[200,198,190],top:(u,v)=>hash(Math.floor(u*20),Math.floor(v*20),k)<.3?[90,90,94]:[226,224,214]})); bs.push(Bx(x+.02,y-.02,x+.5,y+.4,10,10.8,[40,40,44],{foot:0})); return prop(bs); };
MK.cup=(x,y,z=0)=>{ SHARED.PNAME='coffee cup'; return prop([Bx(x,y,x+.12,y+.12,z,z+6,[70,110,200],{foot:z===0,top:()=>[240,240,236]})]); };
MK.stoop=(x,y)=>{ SHARED.PNAME='stoop'; const c=[150,146,136]; return prop([Bx(x,y,x+1.6,y+.5,0,8,c,{fj:()=>sh(c,.8),fi:()=>sh(c,.62),top:(u,v)=>speck(c,u,v,73)}),Bx(x,y,x+1.6,y+.25,8,16,c,{foot:0,fj:()=>sh(c,.8),fi:()=>sh(c,.62),top:(u,v)=>speck(c,u,v,74)})]); };
const STEEL=[96,98,104], STEELD=[70,72,78], YH=[206,164,30], CONC=[150,146,138], ROADC=[64,64,70], DARK=[22,22,24];
const glow=c=>Object.assign([...c],{e:1});
const SIGNAL=()=>{ const t=(performance.now()/1000)%60; return {main:t<28?0:t<32?1:2,cross:t<34?2:t<56?0:1}; };
const lifeOn=()=>LIFE.mode===1;
const flipOf=f=>f[1]<0||f[0]>0?1:0;
const faceArt=(b,f,A,W,zt,back)=>sided({...b,fs:(nx,ny,X,Y,zr)=>{ if(nx!==f[0]||ny!==f[1])return back; const along=f[0]?Y:X, a0=f[0]?b.y0:b.x0, len=f[0]?b.y1-b.y0:b.x1-b.x0, u=flipOf(f)?a0+len-along:along-a0;
  return A(Math.floor(u*FP-(len*FP-W)/2),Math.floor(zt-(zr+b.z0))); }});
MK.signal=(x,y,arm,heads,grp,peds=[])=>{ '@later'; SHARED.PNAME='traffic signal'; const bs=[Bx(x-.08,y-.08,x+.08,y+.08,0,156,STEEL,{fj:(u,z)=>z<10?STEELD:STEEL}),Bx(x-.1,y-.1,x+.1,y+.1,156,159,STEELD,{foot:0})];
  if(arm){ const [ax,ay]=arm; bs.push(Bx(Math.min(x,ax)-.03,Math.min(y,ay)-.03,Math.max(x,ax)+.03,Math.max(y,ay)+.03,150,153,STEEL,{foot:0,nb:1})); }
  const head=(hx,hy,z1,f)=>{ const s=.2, d=.08, X0=f[0]?hx-d:hx-s, X1=f[0]?hx+d:hx+s, Y0=f[0]?hy-s:hy-d, Y1=f[0]?hy+s:hy+d, bp=.29, bk=d+.012;
    bs.push(Bx(X0,Y0,X1,Y1,z1-38,z1,YH,{foot:0,top:()=>sh(YH,.8)}),Bx(hx-.015,hy-.015,hx+.015,hy+.015,z1,z1+3,STEELD,{foot:0,nb:1}));
    bs.push(f[0]?Bx(hx-f[0]*bk-.008,hy-bp,hx-f[0]*bk+.008,hy+bp,z1-42,z1+3,DARK,{foot:0,nb:1}):Bx(hx-bp,hy-f[1]*bk-.008,hx+bp,hy-f[1]*bk+.008,z1-42,z1+3,DARK,{foot:0,nb:1}));
    [[255,52,40],[255,190,40],[60,230,120]].forEach((c,i)=>{ const z0=z1-12*(i+1), z9=z0+10, zc=z0+5, o=f[0]?{x0:f[0]>0?X1:X0-.012,x1:f[0]>0?X1+.012:X0,y0:hy-.17,y1:hy+.17}:{y0:f[1]>0?Y1:Y0-.012,y1:f[1]>0?Y1+.012:Y0,x0:hx-.17,x1:hx+.17};
      const round=(X,Y,z)=>{ const du=((f[0]?Y-hy:X-hx)*FP), dz=z+z0-zc+.5; return du*du+dz*dz<=18; };
      bs.push(sided({...o,z0,z1:z9,c:DARK,foot:0,nb:1,fs:(nx,ny,X,Y,z,k)=>nx===f[0]&&ny===f[1]?(round(X,Y,z)?sh(c,.22):sh(YH,k)):sh(YH,k),top:()=>YH}));
      bs.push(sided({...o,z0,z1:z9,c:DARK,foot:0,nb:1,life:1,top:()=>null,fs:(nx,ny,X,Y,z)=>{ if(!lifeOn()||nx!==f[0]||ny!==f[1]||!round(X,Y,z))return null; const s=SIGNAL()[grp]; return 2-s===i?glow(c):null; }}));
      const v=f[0]?{x0:f[0]>0?X1:X0-.08,x1:f[0]>0?X1+.08:X0,y0:hy-.17,y1:hy+.17}:{y0:f[1]>0?Y1:Y0-.08,y1:f[1]>0?Y1+.08:Y0,x0:hx-.17,x1:hx+.17};
      bs.push(Bx(v.x0,v.y0,v.x1,v.y1,z9,z9+2,DARK,{foot:0,nb:1})); }); };
  for(const h of heads){ head(h.at[0],h.at[1],148,h.f); head(x+h.f[0]*.2,y+h.f[1]*.2,128,h.f); }
  const AW=art(16,18,put=>txt(put,'WALK',0,7,[244,244,238],1)), AD=art(16,18,put=>{ txt(put,'DONT',0,3,[255,120,40],1); txt(put,'WALK',0,11,[255,120,40],1); });
  for(const q of peds){ const f=q.f, w=16/FP/2, c=[x+f[0]*.16,y+f[1]*.16], b={x0:f[0]?c[0]-.05:c[0]-w,x1:f[0]?c[0]+.05:c[0]+w,y0:f[0]?c[1]-w:c[1]-.05,y1:f[0]?c[1]+w:c[1]+.05,z0:74,z1:92,c:DARK,foot:0};
    bs.push(faceArt({...b,top:()=>DARK},f,()=>DARK,16,92,DARK));
    bs.push(sided({...b,x0:f[0]>0?b.x1:f[0]<0?b.x0-.012:b.x0,x1:f[0]>0?b.x1+.012:f[0]<0?b.x0:b.x1,y0:f[1]>0?b.y1:f[1]<0?b.y0-.012:b.y0,y1:f[1]>0?b.y1+.012:f[1]<0?b.y0:b.y1,nb:1,life:1,top:()=>null,
      fs:(nx,ny,X,Y,zr)=>{ if(!lifeOn()||nx!==f[0]||ny!==f[1])return null; const walk=SIGNAL()[q.on]===2, A=walk?AW:AD, along=f[0]?Y:X, a0=f[0]?b.y0:b.x0, u=flipOf(f)?a0+2*w-along:along-a0, c=A(Math.floor(u*FP),Math.floor(92-(zr+74))); return c?glow(c):null; }})); }
  const p=prop(bs); p.life=()=>{}; p.lifeStill=1; p.lifeKey=()=>{ const s=SIGNAL(); return s.main*3+s.cross; }; return p; };
MK.psign=(x,y,f,W,H,z1,bg,lines,post=true)=>{ '@later'; SHARED.PNAME='street sign'; const w=W/FP/2, A=art(W,H,put=>{ for(let r=0;r<H;r++)for(let q=0;q<W;q++)put(q,r,bg); if(typeof lines==='function')return lines(put,W,H); for(let r=0;r<H;r++)for(let q=0;q<W;q++)if(r===0||q===0||r===H-1||q===W-1)put(q,r,sh(bg,.75)); for(const [s,c,k,yy] of lines)txt(put,s,Math.floor((W-tw(s,k))/2),yy,c,k); });
  const b={x0:f[0]?x-.02:x-w,x1:f[0]?x+.02:x+w,y0:f[0]?y-w:y-.02,y1:f[0]?y+w:y+.02,z0:z1-H,z1,c:bg,foot:0,nb:1}, px=x-f[0]*.05, py=y-f[1]*.05;
  const bs=[faceArt({...b,top:()=>[150,150,154]},f,A,W,z1,[150,150,154])]; if(post)bs.unshift(Bx(px-.025,py-.025,px+.025,py+.025,0,z1-3,STEELD)); return prop(bs); };
const SIGNFACE=(()=>{ const R=[200,36,36], K=[20,20,22];
  const border=(put,W,H,c,i=1)=>{ for(let q=i+1;q<W-i-1;q++){ put(q,i,c); put(q,H-1-i,c); } for(let r=i+1;r<H-i-1;r++){ put(i,r,c); put(W-1-i,r,c); } };
  const mid=(W,s,k)=>Math.floor((W-tw(s,k))/2);
  return {
    noParking:hours=>(put,W,H)=>{ border(put,W,H,R); txt(put,'NO',mid(W,'NO',2),4,R,2); txt(put,'PARKING',mid(W,'PARKING',1),17,R,1); txt(put,hours,mid(W,hours,1),25,R,1);
      const y=H-8, a=5, b=W-6; for(let q=a;q<=b;q++)put(q,y,R); for(let d=1;d<=2;d++){ put(a+d,y-d,R); put(a+d,y+d,R); put(b-d,y-d,R); put(b-d,y+d,R); } },
    speedLimit:n=>(put,W,H)=>{ border(put,W,H,K); txt(put,'SPEED',mid(W,'SPEED',1),4,K,1); txt(put,'LIMIT',mid(W,'LIMIT',1),11,K,1); txt(put,n,mid(W,n,3),18,K,3); },
    noPedestrians:()=>(put,W,H)=>{ border(put,W,H,K); const cx=(W-1)/2, cy=(H-1)/2, r=Math.min(W,H)/2-3;
      const man=[[0,-7],[-1,-7],[1,-7],[0,-8],[0,-6],[0,-5],[0,-4],[0,-3],[0,-2],[0,-1],[-1,-4],[-2,-3],[-3,-2],[1,-4],[2,-3],[3,-3],[0,0],[-1,1],[-2,2],[-2,3],[-3,4],[1,1],[2,2],[2,3],[3,4]];
      for(const [dx,dy] of man)put(Math.round(cx+dx),Math.round(cy+dy+1),K);
      for(let r0=0;r0<H;r0++)for(let q=0;q<W;q++){ const d=Math.hypot(q-cx,r0-cy); if(d<=r&&d>r-2.2)put(q,r0,R); if(d<r-1&&Math.abs((q-cx)-(r0-cy))<1.2)put(q,r0,R); } } }; })();
MK.signFace=SIGNFACE;
MK.gantry=(x,y0,y1,f,panels)=>{ '@later'; SHARED.PNAME='sign gantry'; const bs=[Bx(x-.08,y0-.08,x+.08,y0+.08,0,176,STEEL),Bx(x-.08,y1-.08,x+.08,y1+.08,0,176,STEEL),Bx(x-.05,y0,x+.05,y1,170,176,STEEL,{foot:0}),Bx(x-.04,y0,x+.04,y1,160,163,STEEL,{foot:0,nb:1})];
  for(const P of panels){ const W=Math.round((P.b-P.a)*FP), H=40, bg=P.bg||[30,110,62], A=art(W,H,put=>{ for(let r=0;r<H;r++)for(let q=0;q<W;q++)put(q,r,(r<1||q<1||r>H-2||q>W-2||r===2||q===2||r===H-3||q===W-3)?[236,236,230]:bg); for(const [s,c,k,yy] of P.lines)txt(put,s,Math.floor((W-tw(s,k))/2),yy,c||[236,236,230],k); });
    bs.push(faceArt({x0:x+f[0]*.06-.03,x1:x+f[0]*.06+.03,y0:P.a,y1:P.b,z0:126,z1:166,c:bg,foot:0,top:()=>[90,92,96]},f,A,W,166,[90,92,96])); }
  return prop(bs,null,{solids:[{x0:x-.08,y0:y0-.08,x1:x+.08,y1:y0+.08},{x0:x-.08,y0:y1-.08,x1:x+.08,y1:y1+.08}]}); };
MK.cobra=(x,y,dy)=>{ '@later'; SHARED.PNAME='street light'; const ey=y+dy*1.8, bs=[Bx(x-.07,y-.07,x+.07,y+.07,0,148,STEEL,{fj:(u,z)=>z<12?STEELD:STEEL}),Bx(x-.03,Math.min(y,ey),x+.03,Math.max(y,ey),144,147,STEEL,{foot:0,nb:1}),
    Bx(x-.11,ey-.26,x+.11,ey+.26,138,146,[150,150,156],{foot:0,top:()=>[170,170,176]}),Bx(x-.08,ey-.2,x+.08,ey+.2,137,138,[255,206,140],{foot:0,em:1,nb:1})];
  const p=prop(bs); LAMPS.push({x,y:ey,z:136,r:6,c:[1,.78,.5],prop:p}); return p; };
const RW=[214,212,204], RY=[222,184,52];
MK.mark=(x0,y0,x1,y1,f,name)=>{ SHARED.PNAME=name; return prop([Bx(x0,y0,x1,y1,0,.5,RW,{nb:1,top:(u,v)=>{ const k=f(u-x0,v-y0); return k==='w'?mt('lines',speck(RW,u,v,47)):k==='y'?mt('lines',speck(RY,u,v,49)):null; }})],null,{walk:true}); };
const turnArrow=(a,c)=>{ a=Math.floor(a*8)/8; c=Math.floor(c*8)/8; if(a<0||a>2.3)return false; if(Math.abs(c)<.1&&a<1.6)return true; if(a>=1.6&&Math.abs(c)<.32*(2.3-a)/.7)return true;
  return c>0&&c<.45&&a>=.7&&a<.9||c>=.45&&c<.8&&Math.abs(a-.8)<.32*(.8-c)/.35; };
MK.rail=(x0,y0,x1,y1,z=0)=>{ '@later'; SHARED.PNAME='railing'; const bs=[], ax=Math.abs(x1-x0)>=Math.abs(y1-y0), L=ax?Math.abs(x1-x0):Math.abs(y1-y0), n=Math.max(1,Math.round(L));
  for(let i=0;i<=n;i++){ const t=i/n, px=x0+(x1-x0)*t, py=y0+(y1-y0)*t; bs.push(Bx(px-.04,py-.04,px+.04,py+.04,z,z+36,STEELD,{foot:z?0:1})); }
  for(const h of [18,33])bs.push(Bx(Math.min(x0,x1)-.02,Math.min(y0,y1)-.02,Math.max(x0,x1)+.02,Math.max(y0,y1)+.02,z+h,z+h+3,STEEL,{foot:0,nb:1}));
  if(z)bs.unshift(FOOT(Math.min(x0,x1),Math.min(y0,y1),Math.max(.05,Math.abs(x1-x0)),Math.max(.05,Math.abs(y1-y0)))); return prop(bs); };
MK.cutseg=(T,ya,yb)=>{ '@later'; SHARED.PNAME='tunnel cut'; const dep=y=>T.d*(T.y1-y)/(T.y1-T.y0), Z0=-T.d-20, bs=[{...FOOT(T.x0,yb,T.x1-T.x0,ya-yb),nb:1}], m=(T.x0+T.x1)/2;
  const road=(u,v)=>Math.abs(u-m+.14)<.06||Math.abs(u-m-.14)<.06?[214,176,48]:mt('road',[62,63,68]);
  for(let y=yb;y<ya-1e-6;y+=.5){ const z=-Math.round(dep(y+.25)); bs.push(Bx(T.x0+.4,y,T.x1-.4,Math.min(ya,y+.5),z-3,z,ROADC,{foot:0,nb:1,top:road,fi:()=>[54,54,58],fj:(u,zz)=>road(u,y)})); }
  const wall=(u,z)=>{ const j=Math.floor(u*2)!==Math.floor((u+.04)*2)||z>-3; return j?sh(CONC,.8):sh(mt('concrete',CONC),hash(Math.floor(u*8),Math.floor(z/4),71)<.1?.9:1); };
  for(const [a,b] of [[T.x0,T.x0+.4],[T.x1-.4,T.x1]])bs.push(Bx(a,yb,b,ya,Z0,0,CONC,{foot:0,nb:1,top:()=>sh(CONC,1.08),fi:wall,fj:wall}));
  for(let y=Math.ceil(yb/4)*4;y<ya;y+=4)for(const x of [T.x0+.4,T.x1-.4])bs.push(Bx(x-.06,y-.15,x+.06,y+.15,-Math.round(dep(y))+40,-Math.round(dep(y))+44,[240,240,236],{foot:0,em:1,nb:1}));
  if(yb<=T.y0+1e-6){ const W=Math.round((T.x1-T.x0)*FP), H=T.d+20, mw=Math.round((T.x1-T.x0-1.6)*FP), mh=64, mx=Math.round((W-mw)/2), bot=H-20,
      A=art(W,H,put=>{ for(let r=0;r<H;r++)for(let q=0;q<W;q++)put(q,r,(Math.floor(q/12)+Math.floor(r/8))&1?sh(CONC,.9):CONC);
        for(let r=bot-mh;r<bot;r++)for(let q=mx;q<mx+mw;q++){ const k=bot-mh+6-r, cut=k>0?k:0; if(q<mx+cut||q>=mx+mw-cut)continue; put(q,r,r>bot-mh+8?DARK:[34,34,38]); }
        for(let q=mx-2;q<mx+mw+2;q++){ put(q,bot-mh-2,sh(CONC,.7)); put(q,bot-mh-1,sh(CONC,.7)); }
        txt(put,'HUDSON TUNNEL',Math.floor((W-tw('HUDSON TUNNEL',2))/2),bot-mh-16,[236,236,230],2);
        for(const q of [mx-10,mx+mw+6])for(let r=bot-40;r<bot-32;r++)for(let k=0;k<4;k++)put(q+k,r,glow([255,244,220])); });
    bs.push(Bx(T.x0,T.y0,T.x1,T.y0+.4,Z0,0,CONC,{foot:0,nb:1,top:()=>sh(CONC,1.08),fi:wall,fj:(u,z)=>A(Math.floor((u-T.x0)*FP),Math.floor(-z))||CONC})); }
  const p=prop(bs); p.sunk={x0:T.x0,y0:T.y0,x1:T.x1,y1:T.y1}; return p; };
MK.brgseg=(B,ya,yb)=>{ '@later'; SHARED.PNAME='bridge'; const D=B.deck, bs=[], st=[], so=[], m=(B.x0+B.x1)/2;
  const top=(u,v)=>u<B.x0+1.3||u>B.x1-1.3?mt('concrete',[166,162,154]):Math.abs(u-m+.14)<.06||Math.abs(u-m-.14)<.06?[214,176,48]:mt('road',[62,63,68]);
  const ret=(u,z)=>hash(Math.floor(u*6),Math.floor(z/5),83)<.08?sh(CONC,.88):Math.floor(z/16)!==Math.floor((z+1)/16)?sh(CONC,.8):CONC;
  const surf=y0=>Math.min(D,3*Math.max(1,Math.round((B.y1-y0)*2)));
  for(let y=ya;y>yb+1e-6;y-=.5){ const y0=Math.max(yb,y-.5), z=y0<B.y0-1e-6?D:surf(y0); const over=y0<B.y0-1e-6;
    if(!over){ bs.push(Bx(B.x0,y0,B.x1,y,0,z,CONC,{top,fi:ret,fj:(u,zz)=>zz>z-4?sh(top(u,y0),.86):ret(u,zz)})); if(y0<=B.y0+1e-6)so.push({x0:B.x0,y0:B.y0,x1:B.x1,y1:B.y0+.3,z0:0,z1:D-16}); }
    else bs.push(Bx(B.x0,y0,B.x1,y,D-12,D,CONC,{foot:0,top,fi:()=>sh(CONC,.8),fj:()=>sh(CONC,.7)}));
    for(const [a,b] of [[B.x0,B.x0+.3],[B.x1-.3,B.x1]]){ bs.push(Bx(a,y0,b,y,z,z+18,CONC,{foot:0,top:()=>sh(CONC,1.1),fi:ret,fj:ret})); so.push({x0:a,y0,x1:b,y1:y,z0:over?D-12:0,z1:z+18}); }
    st.push({x0:B.x0+.3,y0,x1:B.x1-.3,y1:y,z}); }
  for(const py of [-112.5,-117.5])if(py<ya&&py>yb)bs.push(Bx(B.x0+.7,py-.4,B.x1-.7,py+.4,-6,D-12,CONC,{foot:0,top:()=>CONC,fi:ret,fj:ret}));
  if(!bs.some(b=>b.z0===0||b.foot))bs.unshift(FOOT(B.x0,yb,B.x1-B.x0,ya-yb));
  const p=prop(bs); p.stands=st; p.solids=so; return p; };
MK.brglamp=(x,y,z)=>{ '@later'; SHARED.PNAME='bridge lamp'; const p=prop([FOOT(x-.1,y-.1,.2,.2),Bx(x-.06,y-.06,x+.06,y+.06,z,z+84,STEEL,{foot:0}),Bx(x-.16,y-.16,x+.16,y+.16,z+84,z+92,[150,150,156],{foot:0}),Bx(x-.1,y-.1,x+.1,y+.1,z+83,z+84,[255,206,140],{foot:0,em:1,nb:1})]);
  p.solids=[]; LAMPS.push({x,y,z:z+82,r:5,c:[1,.78,.5],prop:p}); return p; };
const ST=STORY, K=(kind,no,price,desc,mk)=>{ CATALOG[kind]=mk; CAT_INFO[kind]={no:'S-'+no,name:kind.replace(/\b\w/g,c=>c.toUpperCase()),dept:'street',price,desc,mat:'street'}; KIND_OF[kind]=kind; };
const G=[[220,60,50],[240,240,230]];
[['fire hydrant',901,1200,'A red fire hydrant, 0.8 m, two caps.',(x,y)=>MK.hydrant(x,y)],['mailbox',902,900,'A blue mailbox on its legs.',(x,y)=>MK.mailbox(x,y)],['parking meter',903,400,'A parking meter on its post.',(x,y)=>MK.meter(x,y)],
 ['pay phone',904,1500,'A pay phone on a post, its blue cap.',(x,y)=>MK.payphone(x,y)],['street sign',905,300,'A street sign on its post, two green plates up out of reach.',(x,y)=>MK.signpost(x,y,'BROOME','ORCHARD')],['bus stop',906,600,'A bus stop sign on its post.',(x,y)=>MK.busstop(x,y)],
 ['bollard',907,250,'An iron bollard.',(x,y)=>MK.bollard(x,y)],['manhole cover',908,350,'A round iron manhole cover, flush with the street.',(x,y)=>MK.manhole(x,y)],['subway grate',909,800,'An iron grate in the sidewalk, 2 by 1.',(x,y)=>MK.grate(x-1,y-.5,2,1)],
 ['storm drain',910,500,'A storm drain at the curb: a slotted iron grate, 1 by half.',(x,y)=>MK.grate(x-.5,y-.25,1,.5)],['puddle',911,0,'Rainwater lying on the ground.',(x,y)=>MK.puddle(x-.6,y-.4,1.2,.8)],['litter',912,0,'Litter blown into a corner.',(x,y)=>MK.litter(x-1,y-1)],
 ['chalk hopscotch',913,0,'A hopscotch court in chalk.',(x,y)=>MK.chalk(x-.4,y-1.5)],['pigeons',914,0,'Five pigeons on the ground.',(x,y)=>MK.pigeons(x-.8,y-.6)],['bike rack',915,300,'An iron bike rack.',(x,y)=>MK.bikerack(x,y-.4)],
 ['standpipe',916,700,'A red standpipe with two brass caps.',(x,y)=>MK.standpipe(x,y)],['dumpster',917,1800,'A green dumpster with its lid.',(x,y)=>MK.dumpster(x-.8,y-.5)],['pallets',918,60,'Three pallets stacked.',(x,y)=>MK.pallets(x-.5,y-.5)],
 ['tires',919,90,'Three tires stacked.',(x,y)=>MK.tires(x-.3,y-.3)],['oil drum',920,80,'A blue oil drum.',(x,y)=>MK.drum(x-.3,y-.3)],['wire basket',921,250,'A wire trash basket, 0.9 m.',(x,y)=>MK.trashbasket(x-.3,y-.3)],
 ['cardboard boxes',923,0,'Flattened cardboard and a box.',(x,y)=>MK.cardboard(x-.35,y-.5)],['milk crates',924,30,'Three milk crates stacked.',(x,y)=>MK.milkcrates(x-.25,y-.25)],
 ['newspaper rack',925,200,'A rack of newspapers.',(x,y)=>MK.newsrack(x-.25,y-.2)],['newsstand',926,6000,'A green newsstand, its papers and magazines.',(x,y)=>MK.newsstand(x-1,y-.65)],['produce stand',927,400,'Tiers of crates of produce.',(x,y)=>MK.produce(x-1,y-.45,2)],
 ['ice chest',928,300,'An ice chest, its blue lid.',(x,y)=>MK.icebox(x-.45,y-.35)],['flower buckets',929,80,'Four buckets of flowers.',(x,y)=>MK.buckets(x-.4,y-.4)],['water jugs',930,20,'Four water jugs.',(x,y)=>MK.waterjugs(x-.35,y-.35)],
 ['hand truck',931,120,'A red hand truck with a crate.',(x,y)=>MK.handtruck(x-.25,y-.3)],['shopping cart',932,150,'A shopping cart.',(x,y)=>MK.shoppingcart(x-.25,y-.45)],['bicycle',933,250,'A bicycle leant up.',(x,y)=>MK.bike(x-.55,y,true)],
 ['scooter',934,1800,'A red scooter.',(x,y)=>MK.scooter(x-.65,y-.15)],['weeds',936,0,'Weeds in the cracks.',(x,y)=>MK.weeds(x-1.5,y-1.5)],
 ['stain',937,0,'A stain on the ground.',(x,y)=>MK.stain(x,y)],['cracked slab',938,0,'A cracked paving slab.',(x,y)=>MK.crack(x-.5,y-.5)],['asphalt patch',939,0,'A patch of darker tar.',(x,y)=>MK.patch(x-.8,y-.6,1.6,1.2)],
 ['folding chair',940,30,'A folding chair.',(x,y)=>MK.chair(x-.25,y-.25)],['dominoes table',941,60,'A table with a game of dominoes on it.',(x,y)=>MK.table(x-.5,y-.5)],['radio',942,40,'A radio on the ground.',(x,y)=>MK.radio(x-.2,y-.1)],
 ['broom',943,15,'A broom leant up.',(x,y)=>MK.broom(x,y)],['mop bucket',944,25,'A yellow mop bucket.',(x,y)=>MK.bucket(x-.2,y-.2)],['cat bowl',945,5,'A cat bowl.',(x,y)=>MK.bowl(x-.1,y-.1)],['coiled hose',946,30,'A hose coiled up.',(x,y)=>MK.hose(x-.25,y-.25)],
 ['newspaper stack',947,0,'A stack of newspapers tied up.',(x,y)=>MK.papers(x-.25,y-.2)],['coffee cup',948,2,'A coffee cup left behind.',(x,y)=>MK.cup(x,y)],['stoop',949,2500,'Two stone steps.',(x,y)=>MK.stoop(x-.8,y-.25)],
 ['utility pole',950,3000,'A wooden utility pole with two crossarms and their insulators.',(x,y)=>MK.pole(x,y)],['overhead wires',951,0,'Three wires slung between poles, 6 tiles.',(x,y)=>MK.wires(x-3,x+3,y)],['umbrella',952,120,'A market umbrella.',(x,y)=>MK.umbrella(x,y,[200,60,50],[240,240,230])],
 ['string lights',953,40,'A string of lights.',(x,y)=>MK.stringlights(x-2,x+2,y,60)],['rug of wares',954,0,'A rug with wares laid out.',(x,y)=>MK.rug(x-1,y-.75,2,1.5,[150,60,50],[220,200,120])],
 ['window AC',960,400,'An air conditioner stuck out of a window.',(x,y)=>MK.ac(x,y,ST+42)],['drainpipe',961,300,'A drainpipe down the wall.',(x,y)=>MK.pipe(x,y,ST-6)],['fire escape',962,8000,'A fire escape landing, its ladder down.',(x,y)=>MK.fireescape(x-2,x+2,y,ST+10,60)],
 ['clothesline',963,20,'Washing on a line.',(x,y)=>MK.washing(x-2,x+2,y,ST+30)],['wall cable',964,0,'A cable stapled along a wall.',(x,y)=>MK.cable(x-2,x+2,y,80)],['bare bulb',965,10,'A bare bulb on its cord.',(x,y)=>MK.bulb(x,y,70)],
 ['door lamp',966,60,'A lamp over a door.',(x,y)=>MK.walllamp(x,y,80)],['paper lantern',967,15,'A paper lantern.',(x,y)=>MK.lantern(x,y,70)],['flag',968,40,'A flag on its pole.',(x,y)=>MK.flag(x,y,90)],
 ['posters',969,0,'Posters pasted on a wall.',(x,y)=>MK.posters(x-1.5,x+1.5,y,20,6,Math.round(x*7+y*3))],['painted sign',970,0,'An old painted ad fading on the brick.',(x,y)=>MK.ghostsign(x-2,x+2,y,60,100,'COLD','SODA')],['graffiti',971,0,'A tag on a wall.',(x,y)=>MK.graffiti(x-1.5,x+1.5,y,10,'ZEK',[240,60,120],[40,40,44])],
 ['awning',972,900,'A striped awning, its valance.',(x,y)=>MK.awning(x-1.5,x+1.5,y,72,G[0],G[1],'','')],['shop sign',973,700,'A sign box over a door, lit.',(x,y)=>MK.signbox(x-1.2,x+1.2,y,76,92,[40,40,44],[240,220,120],'OPEN',true)],['neon sign',974,500,'A neon word in a window.',(x,y)=>MK.neon(x,y,50,'OPEN',[255,80,80])],
 ['lit window',975,0,'A window lit at night.',(x,y)=>MK.litwin(x-.6,x+.6,y,30,70,[255,230,170])],['meter box',976,150,'A meter box on the wall.',(x,y)=>MK.meterbox(x,y,30)],['house number',977,10,'A house number by the door.',(x,y)=>MK.number(x,y,80,'127')],
 ['boarded window',978,0,'A window boarded up with plywood.',(x,y)=>MK.plywood(x,y)],['ivy',979,0,'Ivy climbing a wall.',(x,y)=>MK.ivy(x,y,80)],['window box',980,60,'A window box of flowers.',(x,y)=>MK.windowbox(x,y,40)],
 ['plant pot',981,40,'A pot with a plant.',(x,y)=>MK.pot(x,y)],['hanging plant',982,30,'A plant hanging in its pot.',(x,y)=>MK.hanging(x,y,70)],['moss',983,0,'Moss along the foot of a wall.',(x,y)=>MK.moss(x-1,x+1,y)],
 ['rust streak',985,0,'A rust streak down a wall.',(x,y)=>MK.rust(x,y,60)],
 ['water tower',990,30000,'A wooden water tower on its legs, on a roof.',(x,y)=>MK.watertank(x,y,ST,y)],['rooftop AC',991,5000,'An air conditioning unit on a roof.',(x,y)=>MK.roofac(x,y,ST,y)],['roof vent',992,200,'A vent stack on a roof.',(x,y)=>MK.vent(x,y,ST,y)],
 ['chimney',993,1500,'A brick chimney.',(x,y)=>MK.chimney(x,y,ST,y)],['TV antenna',994,80,'A TV antenna on a roof.',(x,y)=>MK.antenna(x,y,ST,y)],['roof door',995,2000,'The bulkhead door out onto a roof.',(x,y)=>MK.bulkhead(x,y,ST,y)],
 ['skylight',996,1200,'A skylight in a roof.',(x,y)=>MK.skylight(x,y,ST,y)],['pigeon coop',997,400,'A pigeon coop on a roof.',(x,y)=>MK.coop(x,y,ST,y)],['billboard',998,0,'A billboard on a roof, lit.',(x,y)=>MK.billboard(x-2,x+2,y,ST,y,'SODA','ICE COLD',[240,240,230],[200,40,40])],
 ['roof garden',999,100,'Pots of plants on a roof.',(x,y)=>MK.roofpots(x,y,ST,y)],['roof clutter',989,0,'A tire and a crate left on a roof.',(x,y)=>MK.roofjunk(x,y,ST,y)]].forEach(([k,no,p,d,mk])=>K(k,no,p,d,mk));
{ const WH=[240,240,236], lane=(a,w)=>a>=0&&a<w;
  [['traffic signal',1001,9000,'A steel signal pole, its mast arm over the lane, a three-lens head under the arm and one on the pole, a walk signal. The lights change on a minute.',(x,y)=>MK.signal(x,y,[x,y+1.8],[{at:[x,y+1.8],f:[1,0]}],'main',[{f:[0,1],on:'main'}])],
   ['walk signal',1002,2500,'A steel pole with a lettered WALK / DONT WALK head, lit in its turn.',(x,y)=>MK.signal(x,y,null,[],'main',[{f:[0,1],on:'main'}])],
   ['guide gantry',1003,40000,'A green guide sign gantry over a two-lane street, 7 tiles across.',(x,y)=>MK.gantry(x,y-3.5,y+3.5,[1,0],[{a:y-3.5,b:y,lines:[['HUDSON',null,2,6],['TUNNEL',null,2,18],['NEW JERSEY',null,1,31]]},{a:y,b:y+3.5,lines:[['BRIDGE',null,2,8],['TO N.J.',null,1,22],['KEEP LEFT',null,1,31]]}])],
   ['no pedestrians sign',1004,150,'A NO PEDESTRIANS sign on its post: the walking figure in a red ring, slashed.',(x,y)=>MK.psign(x,y,[0,1],30,30,104,WH,MK.signFace.noPedestrians())],
   ['speed limit sign',1005,150,'A SPEED LIMIT 30 sign on its post.',(x,y)=>MK.psign(x,y,[0,1],26,36,108,WH,MK.signFace.speedLimit('30'))],
   ['no parking sign',1006,120,'A NO PARKING 8AM-6PM sign on its post.',(x,y)=>MK.psign(x,y,[0,1],32,44,110,WH,MK.signFace.noParking('8AM-6PM'))],
   ['street light',1007,4000,'A cobra-head street light, its arm out over the street, sodium orange at night.',(x,y)=>MK.cobra(x,y,1)],
   ['crosswalk',1008,0,'A crosswalk: two white lines across a street, 7 tiles.',(x,y)=>MK.mark(x-1,y-3.5,x+1,y+3.5,a=>lane(a,.25)||lane(a-1.75,.25)?'w':null,'crosswalk')],
   ['stop line',1009,0,'A white stop bar across a lane, 3 tiles.',(x,y)=>MK.mark(x-.15,y-1.5,x+.15,y+1.5,()=>'w','stop line')],
   ['lane line',1010,0,'A dashed white lane line, 6 tiles.',(x,y)=>MK.mark(x-3,y-.06,x+3,y+.06,a=>a%2<1.2?'w':null,'lane line')],
   ['double yellow line',1011,0,'The double yellow down the middle of a street, 6 tiles.',(x,y)=>MK.mark(x-3,y-.2,x+3,y+.2,(a,b)=>Math.abs(b-.06)<.06||Math.abs(b-.34)<.06?'y':null,'double yellow line')],
   ['turn arrow',1012,0,'A white arrow in a lane: ahead and turn right.',(x,y)=>MK.mark(x-1.15,y-.8,x+1.15,y+.8,(a,b)=>turnArrow(a,b-.8)?'w':null,'turn arrow')]].forEach(([k,no,p,d,mk])=>K(k,no,p,d,mk)); }
CAT_DEPTS.push(['street','Street']);
return MK; })();
export {MKS};
