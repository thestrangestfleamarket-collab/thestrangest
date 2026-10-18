

{
const KEEPR=(B=>({b:B,x0:B.x0+T,x1:B.x1-T,y0:B.y0+T,y1:B.y1-T,cx:(B.x0+B.x1)/2,cy:(B.y0+B.y1)/2,my:(B.y0+B.y1)/2,H:B.h-4,in:[B.x0-T,B.y0-T,B.x1+T,B.y1+T],
  torches:[{w:'b',u:1.6},{w:'b',u:7.7},{w:'l',u:2.2},{w:'l',u:7.4},{w:'r',u:1.3},{w:'r',u:8},{w:'f',u:1.8},{w:'f',u:7.6}],
  holes:[{w:'b',u:.7},{w:'b',u:3.9},{w:'l',u:.5},{w:'l',u:3.6},{w:'r',u:4.9},{w:'r',u:8.2},{w:'f',u:6.9},{w:'f',u:8.6}],chains:[{w:'b',u:3.1,l:46},{w:'r',u:2.6,l:34},{w:'l',u:.9,l:40}],
  door:{w:'r',u:6.6},slit:{w:'b',u:4.65},tally:{w:'l',u:4.9},banners:[{w:'b',u:6.2},{w:'r',u:3.4}],ivy:[{w:'b',u:.3,h:96},{w:'l',u:8.5,h:110},{w:'f',u:.8,h:70}],
  cracks:[{w:'b',u:3.9,z:110},{w:'b',u:8.6,z:80},{w:'l',u:1.4,z:100},{w:'r',u:5.6,z:90},{w:'f',u:6.4,z:100}]}))(LBLD.find(b=>b.id==='lcastle'));
const KPP={ash:[[138,130,116],[150,142,126],[144,138,128],[158,148,130],[132,126,116]],mortar:[104,98,88],trim:[184,174,150],trimD:[160,150,128],dark:[16,14,18],
  moss:[74,92,52],mossD:[56,74,44],mould:[96,100,84],lichen:[156,152,112],lead:[96,104,110],leadL:[112,120,126]};
function keepStone(u,z,seed){ const j=Math.floor(z/12), zz=z-j*12, L=20+Math.floor(hash(j,1,seed)*15), o=hash(j,0,seed)*L, k=Math.floor((u+o)/L), uu=(u+o)-k*L;
  if(zz<1||uu<1)return KPP.mortar;
  let c=KPP.ash[Math.floor(hash(j,k,seed+1)*5)]; if(zz>=11)c=sh(c,1.08); else if(zz<2)c=sh(c,.9);
  const g=hash(Math.floor(u),Math.floor(z),seed+2); if(g<.06)c=sh(c,.88); else if(g>.97)c=sh(c,1.07); return c; }
function keepWeather(c,u,z,seed){ const s=cvNoise(u/9,z/150,seed+7); if(s>.64)c=sh(c,1-(s-.64)*.9);
  if(hash(Math.floor(u/2),Math.floor(z/2),seed+8)<.004)return KPP.lichen;
  if(z<30){ const p=(30-z)/30, n=hash(Math.floor(u/2),Math.floor(z/2),seed+9); if(n<p*p*.5)return n<p*.1?KPP.moss:KPP.mossD; if(n>1-p*.15)return KPP.mould; c=sh(c,1-p*.22); }
  return c; }
function keepArch(du,z,zs,r,P){ const a=Math.abs(du), w=6;
  if(z>=zs){ const d=Math.hypot(du,z-zs); if(d<r)return P.dark; if(d>=r+w)return null; const t=Math.atan2(z-zs,du)/(Math.PI/9), k=Math.floor(t); return t-k<.1||d>=r+w-1?P.mortar:k&1?P.a:P.b; }
  if(a>=r&&a<r+w){ const j=Math.floor(z/12); return z-j*12<1?P.mortar:(j&1)?P.a:P.b; }
  return null; }
const KARCH={out:{dark:KPP.dark,mortar:KPP.mortar,a:KPP.trim,b:KPP.trimD},in:{dark:DGP.dark,mortar:DGP.mo,a:DGP.hi,b:DGP.st[1]}};
function keepLight(du,z,w,z0,z1){ const a=Math.abs(du), r=w/2; if(z<z0-3||z>z1+r+4||a>r+4)return null;
  if(z<z0){ return a<r+3?(z>=z0-1?KPP.trim:KPP.trimD):null; }
  if(z<z1)return a<r?KPP.dark:a<r+3?((Math.floor(z/8)&1)?KPP.trim:KPP.trimD):null;
  const d=Math.hypot(du,z-z1); return d<r?KPP.dark:d<r+3.5?(Math.floor(Math.atan2(z-z1,du)*4)&1?KPP.trim:KPP.trimD):null; }
function keepBay(du,z,door){ const a=Math.abs(du);
  if(z<STORY){ if(door||a>6||z<34||z>82)return null; if(a<1.5&&z>=40&&z<76)return KPP.dark; return z<38||z>=78||a>=4.5?KPP.trimD:du<0?KPP.trim:sh(KPP.trim,.86); }
  if(z<2*STORY)return keepLight(du,z,12,168,196);
  if(z<3*STORY){ if(a<1.5&&z>=290&&z<328)return (Math.floor(z/6)&1)?KPP.trim:KPP.trimD;
    const c=keepLight(du-6.5,z,8,290,322)||keepLight(du+6.5,z,8,290,322); if(c)return c;
    if(z>=322){ const d=Math.hypot(du,z-322); if(d>=13.5&&d<17)return Math.floor(Math.atan2(z-322,du)*5)&1?KPP.trim:KPP.trimD; }
    return null; }
  return keepLight(du,z,8,420,444); }
function keepOutWall(b,nx,ny,X,Y,z,f,cap){ const face=ny>0?'f':ny<0?'b':nx>0?'r':'l', u=(nx?Y-b.y0:X-b.x0)*24, L=(nx?b.y1-b.y0:b.x1-b.x0)*24, seed=face.charCodeAt(0)*13;
  if(z>=cap-4)return sh(KPP.trim,z<cap-3?f*.72:f);
  if(face==='f'){ const c=keepArch(u-(KEEPC.door-b.x0)*24,z,96,16.8,KARCH.out); if(c)return sh(c,f); }
  for(let i=0;i<3;i++){ const c=keepBay(u-L*(i+.5)/3,z,face==='f'&&i===1); if(c)return sh(c,f); }
  for(const s of [STORY,2*STORY,3*STORY])if(z>=s-1&&z<s+4)return sh(z<s?KPP.mortar:z>=s+3?sh(KPP.trim,1.08):KPP.trim,f);
  for(const [w,iu,h] of [['f',1.6,160],['r',6.2,120],['f',8.2,70]])if(face===w){ const c=dgnIvy(u-iu*24,z-2,h,seed+iu); if(c)return sh(c,f); }
  let c=z<24?(z>=21?KPP.trimD:sh(keepStone(u*.7,z*.6,seed+3),.9)):keepStone(u,z,seed);
  return sh(keepWeather(c,u,z,seed),f); }
function keepInWall(q,nx,ny,X,Y,z,f){ const R=KEEPR, dim=z>170?Math.max(.38,1-(z-170)/420):1;
  if(Math.abs(Y-R.my)<T+.02){ let c=null; for(const a of KEEPC.arches)if(!c)c=keepArch((X-a)*24,z,110,19.2,KARCH.in);
    if(!c){ const u=(nx?Y:X)*24, seed=ny>0?51:53; c=dgnRidge(u,z,R.H)||dgnFoot(u,z,seed)||sh(dgnStone(u,z,seed),dgnDamp(u,z,seed,R.H)); }
    return sh(c,f*dim); }
  if(ny<0&&Math.abs(Y-R.y1)<.06){ const c=keepArch((X-KEEPC.door)*24,z,96,16.8,KARCH.in); if(c)return sh(c,f); }
  const c=dungeonWall(q,nx,ny,X,Y,z,f,R); return c.e||dim===1?c:sh(c,dim); }
const keepFloorCol=(x,y)=>dungeonFloorCol(x,y,KEEPR);

const KMK={};
(()=>{
const C=KPP, KH=STORY*4;
const kTop=(X,Y)=>{ const j=Math.floor(Y*2.5), o=(j&1)*.2, i=Math.floor(X*2.5+o), fx=X*2.5+o-i, fy=Y*2.5-j; if(fx<.07||fy<.07)return C.mortar; return sh(C.ash[Math.floor(hash(i,j,4301)*5)],1.04); };
function kb(x0,y0,x1,y1,z0,z1,seed,o={},paint){ return sided({x0,y0,x1,y1,z0,z1,c:C.ash[1],foot:z0===0?1:0,top:kTop,...o,
  fs:(nx,ny,X,Y,zr,k)=>{ const u=(nx?Y:X)*24, z=zr+z0, p=paint&&paint(nx,ny,u,z,X,Y); if(p)return p.e?p:sh(p,k); return sh(keepWeather(keepStone(u,z,seed),u,z,seed),k); }}); }
function merlons(B,axis,a,b,s,e,z0,seed){ const n=Math.max(1,Math.round((e-s)/.85)), step=(e-s)/n;
  for(let i=0;i<n;i++){ const m0=s+i*step+step*.18, m1=m0+step*.64; B.push(axis==='x'?kb(m0,a,m1,b,z0,z0+26,seed,{foot:0}):kb(a,m0,b,m1,z0,z0+26,seed,{foot:0})); } }
KMK.curtain=(ax,ay,bx,by,H,out)=>{ PNAME='curtain wall'; const X=ay===by, t=.45, B=[], sd=Math.round(ax*7+ay*13), o=out[1]==='+'?1:-1;
  const [x0,y0,x1,y1]=X?[ax,ay-t,bx,ay+t]:[ax-t,ay,ax+t,by];
  const paint=(nx,ny,u,z)=>{ if((X?ny:nx)!==o)return null; const k=Math.floor(u/67), du=u-k*67-33;
    if(Math.abs(du)<1.5&&z>=118&&z<150)return C.dark; if(Math.abs(du)<4&&z>=114&&z<154)return z<117||z>=151||Math.abs(du)>=3?C.trimD:C.trim;
    for(const pz of [62,124,176])if(z>=pz&&z<pz+3&&Math.abs(((u+11)%36)-18)<1.5)return C.dark; return null; };
  B.push(kb(x0,y0,x1,y1,0,H,sd,{},paint));
  const s=X?x0:y0, e=X?x1:y1, a=o>0?(X?y1:x1)-.3:(X?y0:x0), b=a+.3;
  B.push(X?kb(x0,a,x1,b,H,H+10,sd,{foot:0}):kb(a,y0,b,y1,H,H+10,sd,{foot:0})); merlons(B,X?'x':'y',a,b,s,e,H+10,sd);
  const f0=o>0?(X?y1:x1):(X?y0:x0)-.16;
  B.push(X?kb(x0,f0,x1,f0+.16,0,22,sd+1):kb(f0,y0,f0+.16,y1,0,22,sd+1));
  return prop(B,null,{solids:[{x0:Math.min(x0,X?x0:f0),y0:Math.min(y0,X?f0:y0),x1:Math.max(x1,X?x1:f0+.16),y1:Math.max(y1,X?f0+.16:y1)}]}); };
KMK.drum=(cx,cy,r,H,seed=0)=>{ PNAME='drum tower'; const B=[], sd=4400+seed;
  const face=(X,Y,z,k)=>{ const a=Math.atan2(Y-cy,X-cx), u=(a+Math.PI)*r*24, rk=.86+.2*Math.cos(a-2.2);
    for(const [az,z0] of [[.6,96],[2.3,96],[-1.4,96],[1.4,190],[-.4,190],[3,190]]){ const du=u-(az+Math.PI)*r*24; if(Math.abs(du)<1.5&&z>=z0&&z<z0+34)return sh(C.dark,k); if(Math.abs(du)<4&&z>=z0-4&&z<z0+38)return sh(z<z0||z>=z0+34||Math.abs(du)>=3?C.trimD:C.trim,k*rk); }
    return sh(keepWeather(keepStone(u,z,sd),u,z,sd),k*rk); };
  const slices=(R,z0,z1,top)=>{ const n=Math.max(4,Math.round(2*R/.2)), w=2*R/n;
    for(let i=0;i<n;i++){ const xa=cx-R+i*w, xm=xa+w/2, hy=Math.sqrt(Math.max(0,R*R-(xm-cx)**2)); if(hy<.06)continue;
      B.push(sided({x0:xa,y0:cy-hy,x1:xa+w,y1:cy+hy,z0,z1,c:C.ash[1],foot:z0===0?1:0,top,fs:(nx,ny,X,Y,zr,k)=>face(X,Y,zr+z0,k)})); } };
  slices(r+.16,0,24,kTop); slices(r,24,H,(X,Y)=>Math.hypot(X-cx,Y-cy)<r-.5?(hash(Math.floor(X*6),Math.floor(Y*3),4403)<.5?C.lead:C.leadL):kTop(X,Y));
  const n=Math.max(8,Math.round(2*Math.PI*r/.85)); for(let i=0;i<n;i+=1){ if(i&1)continue; const a=i/n*2*Math.PI, mx=cx+Math.cos(a)*(r-.22), my=cy+Math.sin(a)*(r-.22);
    B.push(sided({x0:mx-.2,y0:my-.2,x1:mx+.2,y1:my+.2,z0:H,z1:H+26,c:C.ash[1],foot:0,top:kTop,fs:(nx,ny,X,Y,zr,k)=>face(X,Y,zr+H,k)})); }
  const q=r*.72; return prop(B,null,{solids:[{x0:cx-q,y0:cy-r,x1:cx+q,y1:cy+r},{x0:cx-r,y0:cy-q,x1:cx+r,y1:cy+q}]}); };
KMK.turret=(cx,cy,sx,sy)=>{ PNAME='keep turret'; const B=[], o=1, n=1, sd=4500+Math.round(cx*3+cy*5), X0=Math.min(cx+sx*o,cx-sx*n), X1=Math.max(cx+sx*o,cx-sx*n), Y0=Math.min(cy+sy*o,cy-sy*n), Y1=Math.max(cy+sy*o,cy-sy*n);
  const paint=(nx,ny,u,z,X,Y)=>{ const e=nx?Math.min(Y-Y0,Y1-Y):Math.min(X-X0,X1-X); if(e<.32&&z>=24){ const j=Math.floor(z/12), long=j&1; if(e<(long?.32:.2))return z-j*12<1?C.mortar:long?C.trim:C.trimD; }
    const m=nx?(Y0+Y1)/2:(X0+X1)/2, du=((nx?Y:X)-m)*24; for(let s=0;s<5;s++){ const z0=70+s*STORY; if(Math.abs(du)<1.5&&z>=z0&&z<z0+26)return C.dark; } return null; };
  const ax0=sx>0?cx:cx+sx*o, ax1=sx>0?cx+sx*o:cx, ay0=sy>0?cy:cy+sy*o, ay1=sy>0?cy+sy*o:cy;
  const A={x0:ax0,y0:Y0,x1:ax1,y1:Y1}, Bq={x0:sx>0?cx-n:cx,y0:ay0,x1:sx>0?cx:cx+n,y1:ay1};
  B.push(kb(A.x0,A.y0,A.x1,A.y1,0,KH,sd,{},paint),kb(Bq.x0,Bq.y0,Bq.x1,Bq.y1,0,KH,sd,{},paint));
  B.push(kb(X0,Y0,X1,Y1,KH,KH+110,sd,{foot:0,top:(X,Y)=>Math.min(X-X0,X1-X,Y-Y0,Y1-Y)>.35?(hash(Math.floor(X*6),Math.floor(Y*3),4503)<.5?C.lead:C.leadL):kTop(X,Y)},paint));
  for(const [a,b,s,e,ax] of [[Y0,Y0+.3,X0,X1,'x'],[Y1-.3,Y1,X0,X1,'x'],[X0,X0+.3,Y0+.3,Y1-.3,'y'],[X1-.3,X1,Y0+.3,Y1-.3,'y']])merlons(B,ax,a,b,s,e,KH+110,sd);
  return prop(B,null,{solids:[A,Bq]}); };
KMK.parapet=(b,side)=>{ PNAME='keep parapet'; const B=[], t=.3, x0=b.x0-T, x1=b.x1+T, y0=b.y0-T, y1=b.y1+T, n=1, z0=470, z1=KH+26, sd=4600;
  const corb=(nx,ny,u,z)=>z<z0+12?((Math.floor(u/12)&1)?C.dark:z<z0+2?C.trimD:C.trim):z>=z1-3?C.trim:null;
  const q={f:[x0+n,y1,x1-n,y1+t],b:[x0+n,y0-t,x1-n,y0],l:[x0-t,y0+n,x0,y1-n],r:[x1,y0+n,x1+t,y1-n]}[side];
  B.push(kb(q[0],q[1],q[2],q[3],z0,z1,sd,{foot:1},corb)); if(side==='f'||side==='b')merlons(B,'x',q[1],q[3],q[0],q[2],z1,sd); else merlons(B,'y',q[0],q[2],q[1],q[3],z1,sd);
  return prop(B,null,{walk:1}); };
KMK.keepFace=(b,side,gap)=>{ PNAME='keep face'; const B=[], S=[], x0=b.x0-T, x1=b.x1+T, y0=b.y0-T, y1=b.y1+T, n=1, X=side==='f'||side==='b', o=side==='f'||side==='r'?1:-1, sd=4700+side.charCodeAt(0);
  const at=X?(o>0?y1:y0):(o>0?x1:x0), s=X?x0+n:y0+n, e=X?x1-n:y1-n, L=X?b.x1-b.x0:b.y1-b.y0, m0=X?b.x0:b.y0;
  const bx=(a0,a1,d,z0,z1)=>{ const p=o>0?[at,at+d]:[at-d,at]; const q=X?{x0:a0,y0:p[0],x1:a1,y1:p[1]}:{x0:p[0],y0:a0,x1:p[1],y1:a1}; B.push(kb(q.x0,q.y0,q.x1,q.y1,z0,z1,sd)); return q; };
  for(const f of [1/3,2/3]){ const m=m0+L*f; S.push(bx(m-.25,m+.25,.14,24,470)); }
  const runs=gap?[[s,gap[0]],[gap[1],e]]:[[s,e]];
  for(const [a0,a1] of runs){ S.push(bx(a0,a1,.3,0,8)); bx(a0,a1,.2,8,16); bx(a0,a1,.1,16,24); }
  return prop(B,null,{solids:S}); };
KMK.gate=(gx,wy,H)=>{ PNAME='gatehouse'; const y0=wy-.5, y1=wy+1.1, w=.65, sd=4800, ps=[];
  const arch=(nx,ny,u,z)=>ny>0||ny<0?keepArch(u-gx*24,z,104,15.6,KARCH.out):null;
  const leaf=(x0,x1)=>sided({x0,y0:y0+.05,x1,y1:y1-.05,z0:0,z1:100,c:DGP.oak,foot:1,top:()=>DGP.oakD,fs:(nx,ny,X,Y,z,k)=>{ const u=(nx?Y:X)*24; if([12,48,84].some(b=>z>=b&&z<b+4))return sh(z-Math.floor(z)<.5&&Math.floor(u)%6===0?DGP.ironL:DGP.iron,k); return sh(Math.floor(u)%7===0?DGP.oakD:hash(Math.floor(u),Math.floor(z/3),4801)<.15?DGP.oakL:DGP.oak,k); }});
  for(const [a,b,l0,l1] of [[gx-.9,gx-w,gx-w,gx-w+.08],[gx+w,gx+.9,gx+w-.08,gx+w]]){ const B=[kb(a,y0,b,y1,0,H,sd,{},arch),leaf(l0,l1)]; merlons(B,'x',y1-.3,y1,a,b,H,sd); ps.push(prop(B,null,{solids:[{x0:Math.min(a,l0),y0,x1:Math.max(b,l1),y1}]})); }
  const B=[kb(gx-w,y0,gx+w,y1,104,H,sd,{foot:1},arch)];
  B.push(sided({x0:gx-w,y0:wy+.36,x1:gx+w,y1:wy+.46,z0:84,z1:104,c:DGP.iron,foot:0,top:()=>DGP.iron,fs:(nx,ny,X,Y,z,k)=>{ const u=(nx?Y:X)*24, g=((u%6)+6)%6;
    if(z<4)return g<1.5&&z>=4-(1.5-Math.abs(g-.75))*4?sh(DGP.ironL,k):null; return g<1.5||Math.floor(z)%6<1.5?sh(z%6<1?DGP.ironL:DGP.iron,k):null; }}));
  merlons(B,'x',y1-.3,y1,gx-w,gx+w,H,sd); ps.push(prop(B,null,{walk:1})); return ps; };
KMK.well=(x,y)=>{ PNAME='well'; const r=.55, d=.16, B=[], top=(X,Y)=>{ const q=Math.hypot(X-x,Y-y); return q<.34?C.dark:q<.38?C.mortar:kTop(X,Y); };
  B.push(kb(x-r,y-r+d,x+r,y+r-d,0,22,4901,{top}),kb(x-r+d,y-r,x+r-d,y+r,0,22,4901,{top}));
  const wood=(x0,y0,x1,y1,z0,z1)=>({x0,y0,x1,y1,z0,z1,foot:0,c:DGP.oak,top:()=>DGP.oakL,fi:()=>sh(DGP.oak,.7),fj:()=>sh(DGP.oak,.86)});
  B.push(wood(x-.44,y-.04,x-.36,y+.04,22,66),wood(x+.36,y-.04,x+.44,y+.04,22,66),wood(x-.48,y-.05,x+.48,y+.05,66,71));
  B.push({x0:x-.012,y0:y-.012,x1:x+.012,y1:y+.012,z0:30,z1:66,foot:0,nb:1,c:[150,128,90],top:()=>null,fi:()=>[132,112,78],fj:()=>[150,128,90]});
  B.push({x0:x+.18,y0:y+.3,x1:x+.34,y1:y+.46,z0:22,z1:30,foot:0,c:DGP.oak,top:()=>DGP.oakD,fi:(v,z)=>z>27?DGP.iron:sh(DGP.oak,.7),fj:(u,z)=>z>27?DGP.iron:sh(DGP.oak,.86)});
  return prop(B,null,{}); };
KMK.bars=(x0,y0,x1,y1)=>{ PNAME='iron bars'; const X=y0===y1, t=.03, h=96, I=DGP.iron, IL=DGP.ironL, B=[], ib=(a,b,c,d,z0,z1,cl)=>({x0:a,y0:b,x1:c,y1:d,z0,z1,foot:z0===0?1:0,nb:1,c:cl,top:()=>IL,fi:()=>sh(cl,.7),fj:()=>sh(cl,.86)});
  const L=X?x1-x0:y1-y0, n=Math.round(L/.2); for(let i=0;i<=n;i++){ const m=(X?x0:y0)+L*i/n; B.push(X?ib(m-t,y0-t,m+t,y0+t,0,h,I):ib(x0-t,m-t,x0+t,m+t,0,h,I)); }
  for(const [z0,c] of [[0,DGP.rust],[44,I],[h-4,I]])B.push(X?ib(x0,y0-t*1.6,x1,y0+t*1.6,z0,z0+4,c):ib(x0-t*1.6,y0,x0+t*1.6,y1,z0,z0+4,c));
  return prop(B,null,{solids:[X?{x0,y0:y0-.06,x1,y1:y0+.06}:{x0:x0-.06,y0,x1:x0+.06,y1}]}); };
KMK.gravel=(x0,y0,x1,y1)=>{ PNAME='gravel'; const G=[[120,114,104],[134,128,118],[108,102,94],[96,92,86]];
  const top=(X,Y)=>{ const e=Math.min(X-x0,x1-X,Y-y0,y1-Y), n=hash(Math.floor(X*24),Math.floor(Y*24),4951); if(e<.12&&n<.5-e*3)return null; return G[n<.08?3:n<.3?2:n>.85?1:0]; };
  return prop([{x0,y0,x1,y1,z0:0,z1:1,c:G[0],foot:1,nb:1,top,fi:()=>null,fj:()=>null}],null,{walk:true,lift:1}); };
})();

STOREK.keep={KEEPR,keepOutWall,keepInWall,keepFloorCol,KMK,DGP};
}

}

{
