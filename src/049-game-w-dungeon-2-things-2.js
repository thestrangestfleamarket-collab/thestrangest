(()=>{
const C=DGP, lit=dgnLit, o3=c=>({c,nb:1,top:()=>sh(c,1.12),fi:()=>sh(c,.7),fj:()=>sh(c,.86)});
const FLH=[10,12,11,13,9,12,10,13], flick=(p,FL,seed)=>{ p.life=t=>{ FL.ph=Math.floor(hash(Math.floor(t*7),seed,425)*8); }; p.lifeKey=()=>FL.ph; };
function lathe(cx,cy,z0,z1,rf,col,dz=2,dw=.04){ const out=[];
  for(let z=z0;z<z1-1e-9;z+=dz){ const za=z, zb=Math.min(z1,z+dz), r=rf((za+zb)/2-z0); if(!(r>.004))continue; const n=Math.max(1,Math.round(2*r/dw)), w=2*r/n;
    for(let i=0;i<n;i++){ const xa=-r+i*w, xm=xa+w/2, hy=Math.sqrt(Math.max(0,r*r-xm*xm)); if(hy<w*.3)continue;
      out.push(sided({x0:cx+xa,y0:cy-hy,x1:cx+xa+w,y1:cy+hy,z0:za,z1:zb,c:[90,90,90],foot:0,nb:1,fs:(nx,ny,X,Y,zr)=>col(X-cx,Y-cy,za+zr-z0,0),top:(X,Y)=>col(X-cx,Y-cy,zb-z0,1)})); } }
  return out; }
const stone=(u,z,seed)=>{ const g=hash(Math.floor(u),Math.floor(z),seed); return g<.07?sh(C.st[1],.84):g>.95?C.hi:C.st[1]; };
function skull(cx,cy,z,r=.14){ const h=r*46, bone=(u,v)=>{ const e=u*u+((v-.55)*1.9)**2; if(e>1)return null;
    if(v<.22&&Math.abs(u)<.6)return (Math.floor(u*8)&1)?C.bone:sh(C.bone,.8);
    if(v<.3)return sh(C.bone,.72); if(Math.hypot((Math.abs(u)-.42)/.22,(v-.52)/.14)<1)return C.dark;
    if(Math.abs(u)<.08&&v>.3&&v<.44)return C.dark; return e>.72?sh(C.bone,.82):v>.7&&u<-.1?sh(C.bone,1.08):C.bone; };
  return {x0:cx-r,y0:cy-r*.85,x1:cx+r,y1:cy+r*.85,z0:z,z1:z+h,foot:z===0?1:0,c:C.bone,top:(X,Y)=>{ const u=(X-cx)/r, v=(Y-cy)/(r*.85); return u*u+v*v>1?null:Math.abs(u)<.06&&v<0?sh(C.bone,.8):sh(C.bone,1.06); },
    fi:(y,zz)=>{ const c=bone((y-cy)/(r*.85),(zz-z)/h); return c&&sh(c,.74); },fj:(x,zz)=>{ const c=bone((x-cx)/r,(zz-z)/h); return c&&sh(c,.88); }}; }
CATALOG['skull']=(x,y)=>{ PNAME='skull'; return prop([skull(x,y,0)],null,{}); };
CAT_INFO['skull']={no:'P-951',name:'Skull',dept:'Dungeon',price:0,desc:'A human skull on the stones, its sockets dark. Whose, nobody left to say.',mat:'bone'};
function bone(x,y,len,alongX,z,seed){ const w=.1, L=len/2, sh2=hash(seed,1,0)<.5?.94:1.04, col=sh(C.bone,sh2);
  const shape=(a,b)=>{ const A=Math.abs(a), B=Math.abs(b); if(A>L)return null; if(A>L-.06)return Math.hypot((A-(L-.03))/.05,b/.05)<1||Math.hypot((A-(L-.03))/.05,(B-.03)/.04)<1?col:null; return B<.022?col:null; };
  const b={x0:alongX?x-L:x-w/2,y0:alongX?y-w/2:y-L,x1:alongX?x+L:x+w/2,y1:alongX?y+w/2:y+L,z0:z,z1:z+1.6,foot:z===0?1:0,nb:1,c:col,top:(X,Y)=>shape(alongX?X-x:Y-y,alongX?Y-y:X-x),
    fi:(Y,zz)=>shape(alongX?0:Y-y,alongX?Y-y:0)&&sh(col,.72),fj:(X,zz)=>shape(alongX?X-x:0,alongX?0:X-x)&&sh(col,.86)}; return b; }
function ribs(x,y,z){ return {x0:x-.22,y0:y-.16,x1:x+.22,y1:y+.16,z0:z,z1:z+1,foot:z===0?1:0,nb:1,c:C.bone,top:(X,Y)=>{ const u=X-x, v=Y-y; if(Math.abs(u)<.02&&v>-.14&&v<.14)return sh(C.bone,.9);
    for(let k=0;k<4;k++){ const r=.06+k*.045, d=Math.abs(Math.hypot(u*1.3,v)-r); if(d<.012&&v>-.02)return k&1?C.bone:sh(C.bone,.92); } return null; },fi:()=>null,fj:()=>null}; }
CATALOG['bone pile']=(x,y)=>{ PNAME='bone pile'; const s=Math.round(x*13+y*7);
  return prop([bone(x-.05,y+.1,.5,true,0,s),bone(x+.12,y-.12,.42,false,0,s+1),ribs(x-.2,y-.1,0),bone(x+.02,y+.02,.46,true,1.6,s+2),skull(x+.14,y+.1,2.6,.12)],null,{}); };
CAT_INFO['bone pile']={no:'P-952',name:'Bone Pile',dept:'Dungeon',price:0,desc:'Long bones crossed over a rib cage, a skull on top of the heap.',mat:'bone'};
CATALOG['bones']=(x,y)=>{ PNAME='bones'; const s=Math.round(x*11+y*5); return prop([bone(x,y,.46,hash(s,0,0)<.5,0,s),bone(x+.1,y-.14,.3,hash(s,0,0)>=.5,0,s+3)],null,{walk:1}); };
CAT_INFO['bones']={no:'P-953',name:'Bones',dept:'Dungeon',price:0,desc:'Two long bones dropped on the stones. You walk over them.',mat:'bone'};
CATALOG['wall torch']=(x,y,dir)=>{ PNAME='wall torch'; const R=DGN; dir=dir||[['b',y-R.y0],['f',R.y1-y],['l',x-R.x0],['r',R.x1-x]].sort((a,b)=>a[1]-b[1])[0][0];
  const nx=dir==='l'?1:dir==='r'?-1:0, ny=dir==='b'?1:dir==='f'?-1:0, FL={ph:0}, B=[], I=C.iron, IL=C.ironL;
  const bx=(ax,ay,bx2,by2,z0,z1,c,o)=>({x0:Math.min(ax,bx2),y0:Math.min(ay,by2),x1:Math.max(ax,bx2),y1:Math.max(ay,by2),z0,z1,foot:0,nb:1,c,top:()=>sh(c,1.1),fi:()=>sh(c,.7),fj:()=>sh(c,.86),...o});
  B.push(bx(x-nx*.16-.02,y-ny*.16-.02,x+.02,y+.02,62,64.5,I,{foot:1}));
  B.push(bx(x-.05,y-.05,x+.05,y+.05,62,67,IL)); B.push(bx(x-.035,y-.035,x+.035,y+.035,67,69,I));
  B.push(bx(x-.025,y-.025,x+.025,y+.025,52,74,[96,78,54],{fi:(v,z)=>sh([96,78,54],.7+.04*((z|0)&1)),fj:(u,z)=>sh([96,78,54],.86)}));
  B.push(bx(x-.05,y-.05,x+.05,y+.05,74,82,[36,30,26],{fi:(v,z)=>hash(Math.floor(v*48),z|0,31)<.3?[52,44,36]:[36,30,26],fj:(u,z)=>hash(Math.floor(u*48),z|0,33)<.3?[52,44,36]:[36,30,26]}));
  const flame=(du,zz)=>{ if(typeof LIFE==='undefined'||LIFE.mode!==1)return null; const h=FLH[FL.ph], lean=(FL.ph%3-1)*.12; if(zz<0||zz>=h)return null;
    const w=.075*Math.pow(1-zz/h,.55)*(1+.2*Math.sin(zz*1.7+FL.ph)), a=Math.abs(du-lean*zz/h); if(a>w)return null;
    return lit(zz<2?[255,236,170]:a<w*.4&&zz<h*.6?[255,224,120]:a>w*.75||zz>h*.8?[236,92,30]:[255,170,50]); };
  B.push({x0:x-.09,y0:y-.09,x1:x+.09,y1:y+.09,z0:82,z1:96,c:[255,170,50],foot:0,nb:1,life:1,top:()=>null,fi:(v,z)=>flame(v-y,z-82),fj:(u,z)=>flame(u-x,z-82)});
  const p=prop(B,null,{walk:1}); flick(p,FL,Math.round(x*7+y*13)); LAMPS.push({x,y,z:88,r:4.8,c:[.98,.61,.29],own:1,room:1,day:true,prop:p,flick:1}); return p; };
CAT_INFO['wall torch']={no:'P-954',name:'Wall Torch',dept:'Dungeon',price:30,desc:'A pitch torch in an iron bracket, burning; the wall above it black with its soot.',mat:'iron, ash, pitch'};
function mover(kind,bx,draw,o){ PNAME=kind; const p=prop([{...bx,foot:1,nb:1,c:[0,0,0],top:()=>null,fi:()=>null,fj:()=>null}],null,{walk:1,...o});
  const S={K:1,D:null,W:0,H:0,ox:0,oy:0}, LC=new Map();
  const g={light:(x,y,z,glow)=>{ const k=Math.round(x*2)+','+Math.round(y*2); let L=LC.get(k); if(!L||g.t-L.t>1){ const env=envNear(x,y); L={t:g.t,c:env?lightAt(env,x,y,(LVZ(p.lv)+z)/24,null).map(v=>glow+(1-glow)*Math.max(v,CHARMIN)):[1,1,1]}; LC.set(k,L); } return L.c; },
    at:(x,y,z)=>{ const [vx,vy]=vw(x,y); return [Math.round((vx-vy)*HW-S.ox)*S.K,Math.round((vx+vy)*HH-LVZ(p.lv)-z-S.oy)*S.K]; },
    px:(x,y,z,c,L)=>{ const [fx,fy]=g.at(x,y,z), K=S.K; for(let j=0;j<K;j++)for(let i=0;i<K;i++){ const X=fx+i, Y=fy-1-j; if(X<0||Y<0||X>=S.W||Y>=S.H)continue; const q=(Y*S.W+X)*4; S.D[q]=c.e?c[0]:c[0]*L[0]; S.D[q+1]=c.e?c[1]:c[1]*L[1]; S.D[q+2]=c.e?c[2]:c[2]*L[2]; S.D[q+3]=255; } },
    dir:(x,y,dx,dy)=>{ const a=g.at(x,y,0), b=g.at(x+dx,y+dy,0); return b[0]>=a[0]?1:-1; } };
  p.lifeDraw=(D,W,H,ox,oy,t,K)=>{ S.D=D; S.W=W; S.H=H; S.ox=ox; S.oy=oy; S.K=K; g.t=t; draw(g,t); }; return p; }
CATALOG['dust in the air']=(x,y)=>mover('dust in the air',{x0:x-.6,y0:y-.6,x1:x+.6,y1:y+.6,z0:0,z1:110},(g,t)=>{ const s=Math.round(x*5+y*3);
  for(let i=0;i<22;i++){ const a=hash(s,i,901)*6.28, r=.12+hash(s,i,903)*.46, sp=.6+hash(s,i,905)*1.2, ph=hash(s,i,907)*40, u=(t*sp*.08+ph)%1;
    const mx=x+Math.cos(a+t*.1*sp)*r+.05*Math.sin(t*1.3+i), my=y+Math.sin(a+t*.1*sp)*r+.05*Math.cos(t*1.1+i), mz=60+u*48+4*Math.sin(t*.7+i);
    const near=Math.max(0,1-Math.hypot(mx-x,my-y,(mz-88)/24)/.7), b=.35+.65*near; if(hash(s,i,909)<.3&&Math.sin(t*2+i)<0)continue;
    g.px(mx,my,mz,[Math.min(255,150+105*b),Math.min(255,110+100*b),70+60*b],[1,1,1]); } },{});
CAT_INFO['dust in the air']={no:'P-955',name:'Dust in the Air',dept:'Dungeon',price:0,desc:'Motes drifting in the torchlight, caught by it now and then.',mat:'dust'};
CATALOG['mouse run']=(x0,y0,x1,y1)=>{ const ax=Math.abs(x1-x0)>Math.abs(y1-y0), len=ax?x1-x0:y1-y0, nx=ax?.3:0, ny=ax?0:.3, s=Math.round(x0*9+y0*17);
  const M=[0,1,2].map(i=>({u:hash(s,i,11)<.5?0:1,st:'in',t0:-hash(s,i,13)*9,dir:1,v:0,sp:0,ph:hash(s,i,15)*6.28,nose:0})), G=[90,86,84], GL=[122,118,114], GD=[60,56,56], PK=[200,120,120], EY=[12,10,12];
  let last=-1;
  return mover('mouse run',{x0:Math.min(x0,x1)-(ax?0:.15),y0:Math.min(y0,y1)-(ax?.15:0),x1:Math.max(x0,x1)+(ax?0:.15),y1:Math.max(y0,y1)+(ax?.15:0),z0:0,z1:6},(g,t)=>{ const dt=last<0?0:Math.min(.5,t-last); last=t;
    M.forEach((m,i)=>{ const r=hash(Math.floor(t*4)+i*7,s,21);
      if(m.st==='in'){ if(t>m.t0&&r<.25){ m.st='run'; m.dir=m.u<.5?1:-1; m.sp=1.4+hash(s,i+Math.floor(t),23); m.v=0; } return; }
      if(m.st==='run'){ m.u+=m.dir*m.sp*dt/len; if(m.u<=0||m.u>=1){ m.u=m.u<=0?0:1; m.st='in'; m.t0=t+2+hash(s,i+Math.floor(t),25)*8; return; }
        if(r<.06){ m.st='sniff'; m.t0=t+.4+hash(s,i+Math.floor(t),27)*1.2; } }
      else if(m.st==='sniff'){ if(t>m.t0){ m.st='run'; m.dir=hash(s,i+Math.floor(t*3),29)<.7?m.dir:-m.dir; m.sp=1.2+hash(s,i+Math.floor(t),31)*1.4; } }
      const mx=x0+(ax?m.u*len:0), my=y0+(ax?0:m.u*len), d=g.dir(mx,my,ax?m.dir:0,ax?0:m.dir), L=g.light(mx,my,2,.1), run=m.st==='run', ph=run?Math.floor(t*14)&1:0;
      const P=(du,dz,c)=>g.px(mx+(ax?du/24:0),my+(ax?0:du/24),dz,c,L);
      const f=d*(ax?m.dir:m.dir), B=-f;
      P(f*2,0,GD); P(B*1,0,GD); if(run)P(ph?f*1:B*2,0,GD);
      for(let k=-1;k<=2;k++)P(f*k,1,k===2?G:G); P(f*2,1,GD); P(B*2,1,G);
      for(let k=-1;k<=1;k++)P(f*k,2,GL); P(f*0,3,run&&ph?GL:G);
      P(f*3,1,m.st==='sniff'&&(Math.floor(t*10)&1)?PK:G); P(f*2,2,EY);
      const fl=run?(ph?1:0):(Math.floor(t*3+i)&1); for(let k=3;k<=6;k++)P(B*k,k>4?fl:0,k>5?GD:G); }); },{}); };
CAT_INFO['mouse run']={no:'P-956',name:'Mice',dept:'Dungeon',price:0,desc:'Three mice between two holes in the wall: out, a dash, a sniff, a dash, and back in.',mat:'mouse'};
CATALOG['stone column']=(x,y)=>{ PNAME='stone column'; const H=DGN.H, B=[], hw=.3, d=.09;
  const face=(nx,ny,X,Y,z,k,hi)=>{ const u=(nx?Y-y:X-x)*24, a=Math.abs(u); let c=stone(u+(nx?0:50),z,41); if(a>hw*24-3)c=u>0?C.hi:C.lo; if(hi&&z>H-30){ const w=dgnWeb(hw*24-a,H-5-z,14,43+(nx?1:0)); if(w)return sh(w,k); } return sh(c,k); };
  const oct=(h,z0,z1,hi)=>{ B.push(sided({x0:x-h,y0:y-h+d,x1:x+h,y1:y+h-d,z0,z1,foot:z0===0?1:0,c:C.st[1],top:()=>C.hi,fs:(nx,ny,X,Y,z,k)=>face(nx,ny,X,Y,z+z0,k,hi)}));
    B.push(sided({x0:x-h+d,y0:y-h,x1:x+h-d,y1:y+h,z0,z1,foot:z0===0?1:0,c:C.st[1],top:()=>C.hi,fs:(nx,ny,X,Y,z,k)=>face(nx,ny,X,Y,z+z0,k,hi)})); };
  oct(hw+.12,0,5); oct(hw+.06,5,9); oct(hw,9,H-18,true); oct(hw+.05,H-18,H-13); oct(hw+.1,H-13,H-8); oct(hw+.15,H-8,H-3);
  return prop(B,null,{}); };
CAT_INFO['stone column']={no:'P-957',name:'Stone Column',dept:'Dungeon',price:600,desc:'An eight-sided column of rough stone, ridged at its edges, stepped at its foot and its head; cobwebs in its corners.',mat:'stone'};
CATALOG['oak barrel']=(x,y)=>{ PNAME='oak barrel'; const H=28, OK=[C.oakD,C.oak,C.oakL];
  const col=(dx,dy,z,top)=>{ if(top){ const k=Math.floor((dy+.3)/.08); return Math.hypot(dx,dy)>.24?C.oakD:((dy+.3)-k*.08<.012)?C.oakD:k&1?C.oak:sh(C.oak,1.06); }
    const a=Math.atan2(dy,dx), st=Math.floor((a+Math.PI)/(2*Math.PI/14)), c=OK[Math.floor(hash(st,0,51)*3)], e=((a+Math.PI)%(2*Math.PI/14))<.07;
    for(const hz of [4,14,24])if(z>=hz&&z<hz+3)return z<hz+1?C.ironL:(hash(st,hz,53)<.3?C.rust:C.iron);
    return e?C.oakD:hash(st,z|0,55)<.08?sh(c,.88):c; };
  return prop([...lathe(x,y,0,H,z=>.24+.05*Math.sin(Math.PI*z/H),col,2,.04)].map((b,i)=>i===0?{...b,foot:1}:b),null,{}); };
CAT_INFO['oak barrel']={no:'P-958',name:'Oak Barrel',dept:'Dungeon',price:40,desc:'An oak barrel bound with three rusted hoops. Whatever was in it is long gone.',mat:'oak, iron'};
CATALOG['crate']=(x,y)=>{ PNAME='crate'; const w=.36, H=16, planks=(u,z,k)=>{ const row=Math.floor(z/4), seam=(z%4)<.7, pu=Math.floor((u+.5)*24); let c=[C.oak,C.oakL,sh(C.oak,.9)][row%3]; if(seam)c=C.oakD; if(pu%7===3&&(z%4)>1.5&&(z%4)<2.5&&row%3!==1)c=C.ironL; if(hash(pu,z|0,61)<.1)c=sh(c,.88); return sh(c,k); };
  return prop([sided({x0:x-w,y0:y-w,x1:x+w,y1:y+w,z0:0,z1:H,foot:1,c:C.oak,top:(X,Y)=>{ const k=Math.floor((Y-y+w)/.12); return ((Y-y+w)-k*.12)<.015?C.oakD:hash(Math.floor(X*40),Math.floor(Y*40),63)<.3?sh(C.dust,.9):sh(C.oakL,.92); },fs:(nx,ny,X,Y,z,k)=>planks(nx?Y-y:X-x,z,k)})],null,{}); };
CAT_INFO['crate']={no:'P-959',name:'Crate',dept:'Dungeon',price:12,desc:'A plank crate, nailed shut, dust on its lid.',mat:'wood'};
CATALOG['iron chest']=(x,y)=>{ PNAME='iron chest'; const W=.42, D=.26, H=12, LH=5;
  const band=(u,z,k,lid)=>{ const bu=Math.abs(((u+W)%(W*.95))-W*.475); if(bu<.025)return sh(z%3<1?C.ironL:C.iron,k); return null; };
  const side=(nx,ny,X,Y,z,k,lid)=>{ const u=nx?Y-y:X-x; const b=band(u,z,k); if(b)return b; if(ny>0&&!lid&&Math.abs(u)<.05&&z>H-6){ if(Math.abs(u)<.012&&z>H-5&&z<H-2)return C.dark; return sh(C.ironL,k); }
    if(lid&&z<1)return sh(C.ironL,k); return sh(hash(Math.floor(u*48),z|0,71)<.12?C.oakD:(Math.floor(z/3)&1)?C.oak:sh(C.oak,.94),k); };
  return prop([sided({x0:x-W,y0:y-D,x1:x+W,y1:y+D,z0:0,z1:H,foot:1,c:C.oak,top:()=>C.oak,fs:(nx,ny,X,Y,z,k)=>side(nx,ny,X,Y,z,k,false)}),
    sided({x0:x-W-.02,y0:y-D-.02,x1:x+W+.02,y1:y+D+.02,z0:H,z1:H+LH,foot:0,c:C.oak,top:(X,Y)=>band(X-x,0,1)||(Math.abs(Math.abs(Y-y)-D*.5)<.015?C.oakD:C.oakL),fs:(nx,ny,X,Y,z,k)=>side(nx,ny,X,Y,z,k,true)})],null,{}); };
CAT_INFO['iron chest']={no:'P-960',name:'Iron-Banded Chest',dept:'Dungeon',price:80,desc:'An oak chest banded with iron, its lock plate rusted shut.',mat:'oak, iron'};
CATALOG['brazier']=(x,y)=>{ PNAME='brazier'; const FL={ph:0}, B=[], I=C.iron, IL=C.ironL;
  for(let k=0;k<3;k++){ const a=k*2.094+.5, lx=x+Math.cos(a)*.2, ly=y+Math.sin(a)*.2; B.push({x0:lx-.025,y0:ly-.025,x1:lx+.025,y1:ly+.025,z0:0,z1:12,foot:1,nb:1,c:I,top:()=>IL,fi:()=>sh(I,.7),fj:()=>sh(I,.86)}); }
  const coal=(dx,dy,z,top)=>{ if(!top)return z<1||z>8?IL:hash(Math.floor(Math.atan2(dy,dx)*6),z|0,81)<.1?C.rust:I; const r=Math.hypot(dx,dy); if(r>.25)return IL; const n=hash(Math.floor(dx*60),Math.floor(dy*60),83); return n<.2?lit([250,110,30]):n<.3?lit([180,60,20]):n<.5?[40,28,24]:[26,20,18]; };
  B.push(...lathe(x,y,10,19,z=>.15+z*.018,coal,1.5,.035));
  const ember=(du,dv,z)=>{ if(typeof LIFE==='undefined'||LIFE.mode!==1)return null; if(z<0||z>=2.5||Math.hypot(du,dv)>.26)return null; const n=hash(Math.floor(du*50),Math.floor(dv*50)+FL.ph,85); return n<.25?lit(n<.08?[255,200,90]:[250,110,30]):null; };
  B.push({x0:x-.26,y0:y-.26,x1:x+.26,y1:y+.26,z0:18.5,z1:21,c:[250,110,30],foot:0,nb:1,life:1,top:()=>null,fi:(v,z)=>ember(v-y,0,z-18.5),fj:(u,z)=>ember(u-x,0,z-18.5)});
  const p=prop(B,null,{}); flick(p,FL,Math.round(x*11+y*7)); LAMPS.push({x,y,z:24,r:3.6,c:[.85,.32,.11],own:1,room:1,day:true,prop:p,flick:1}); return p; };
CAT_INFO['brazier']={no:'P-961',name:'Brazier',dept:'Dungeon',price:60,desc:'An iron bowl of coals on three legs, the embers breathing red.',mat:'iron, coal'};
CATALOG['gibbet']=(x,y)=>{ PNAME='gibbet'; const H=DGN.H, Z0=44, Z1=78, hw=.22, I=C.iron, IL=C.ironL;
  const bars=(nx,ny,X,Y,z,k)=>{ const u=((nx?Y-y:X-x)+hw)*24, zz=z; if(zz<2||zz>=Z1-Z0-2||Math.abs(zz-(Z1-Z0)/2)<1.2)return sh(zz%2<1?IL:I,k); return (Math.floor(u)%4===0)?sh(I,k*(1+.1*(Math.floor(u)%8===0))):null; };
  const B=[sided({x0:x-hw,y0:y-hw,x1:x+hw,y1:y+hw,z0:Z0,z1:Z1,foot:1,c:I,top:(X,Y)=>Math.hypot(X-x,Y-y)>hw*.9||Math.abs(X-x)<.015||Math.abs(Y-y)<.015?IL:null,fs:bars}),
    {x0:x-hw+.02,y0:y-hw+.02,x1:x+hw-.02,y1:y+hw-.02,z0:Z0,z1:Z0+1.5,foot:0,nb:1,c:I,top:()=>sh(I,1.2),fi:()=>sh(I,.7),fj:()=>sh(I,.86)},skull(x,y,Z0+1.5,.11),
    {x0:x-.02,y0:y-.02,x1:x+.02,y1:y+.02,z0:Z1,z1:H-3,foot:0,nb:1,c:I,top:()=>null,fi:(v,z)=>(Math.floor(z/3)&1)?IL:I,fj:(u,z)=>(Math.floor(z/3)&1)?sh(IL,.9):sh(I,.9)}];
  return prop(B,null,{walk:1}); };
CAT_INFO['gibbet']={no:'P-962',name:'Gibbet',dept:'Dungeon',price:0,desc:'An iron cage on a chain from the ceiling, a skull at the bottom of it. Walk under it if you dare.',mat:'iron, bone'};
CATALOG['straw']=(x,y)=>{ PNAME='straw'; const w=.4, d=.3, s=Math.round(x*7+y*3);
  const st=(u,v)=>{ if((u/w)**2+(v/d)**2>1)return null; for(let k=0;k<14;k++){ const a=hash(s,k,91)*3.14, cu=(hash(s,k,93)-.5)*w*1.4, cv=(hash(s,k,95)-.5)*d*1.4, t=(u-cu)*Math.cos(a)+(v-cv)*Math.sin(a), n=Math.abs(-(u-cu)*Math.sin(a)+(v-cv)*Math.cos(a)); if(n<.012&&Math.abs(t)<.16)return k&1?C.straw:C.strawD; } return sh(C.strawD,.8); };
  return prop([{x0:x-w,y0:y-d,x1:x+w,y1:y+d,z0:0,z1:2.5,foot:1,nb:1,c:C.strawD,top:(X,Y)=>st(X-x,Y-y),fi:(Y,z)=>Math.abs(Y-y)<d*.9?sh(hash(Math.floor(Y*48),z|0,97)<.5?C.straw:C.strawD,.72):null,fj:(X,z)=>Math.abs(X-x)<w*.9?sh(hash(Math.floor(X*48),z|0,99)<.5?C.straw:C.strawD,.86):null}],null,{walk:1}); };
CAT_INFO['straw']={no:'P-963',name:'Straw',dept:'Dungeon',price:2,desc:'A heap of old straw, dry and pale. Something sleeps in it.',mat:'straw'};
CATALOG['sarcophagus']=(x,y)=>{ PNAME='sarcophagus'; const W=.8, D=.34, H=16, LH=6, S1=C.st[1];
  const side=(nx,ny,X,Y,z,k)=>{ const u=(nx?Y-y:X-x)*24; let c=stone(u,z,101); if(z<2)c=C.lo; if(z>=6&&z<9){ const q=Math.floor(u/6); return sh((q&1)?C.lo:C.hi,k); } return sh(c,k); };
  const top=(X,Y)=>{ const u=X-x, v=Y-y, bu=W-Math.abs(u), bv=D-Math.abs(v), b=Math.min(bu*1.4,bv*2.4); if(b<.025)return C.lo; if(b<.045)return C.mo; if(Math.abs(v)<.02&&u>-W*.6&&u<W*.4||Math.abs(u+W*.2)<.02&&Math.abs(v)<D*.55)return C.mo; return hash(Math.floor(X*40),Math.floor(Y*40),103)<.08?C.lo:C.hi; };
  return prop([sided({x0:x-W,y0:y-D,x1:x+W,y1:y+D,z0:0,z1:H,foot:1,c:S1,top:()=>S1,fs:side}),sided({x0:x-W-.04,y0:y-D-.04,x1:x+W+.04,y1:y+D+.04,z0:H,z1:H+LH,foot:0,c:C.hi,top,fs:(nx,ny,X,Y,z,k)=>sh(z<1?C.lo:z>LH-1.5?C.hi:stone((nx?Y-y:X-x)*24,z,105),k)})],null,{}); };
CAT_INFO['sarcophagus']={no:'P-964',name:'Stone Sarcophagus',dept:'Dungeon',price:500,desc:'A coffer of dressed stone under a heavy lid, a cross cut in it. Sealed.',mat:'stone'};
if(!CAT_DEPTS.some(d=>d[0]==='Dungeon'))CAT_DEPTS.push(['Dungeon','Dungeon']);
})();
