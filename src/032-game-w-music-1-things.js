const IMC={spruce:[222,184,122],spruceD:[196,156,98],rose:[92,48,30],roseD:[70,36,22],maple:[214,170,110],mahog:[128,62,34],mahogD:[98,44,24],ebony:[26,22,20],ivory:[236,228,206],
  black:[24,24,28],chrome:[200,202,210],chromeD:[130,132,140],red:[176,30,26],redD:[120,18,16],burst:[200,90,28],brass:[200,160,70],brassD:[150,112,40],bronze:[196,150,60],steel:[188,190,198],
  head:[232,226,210],shell:[150,24,22],shellD:[110,16,14],wood:[150,96,52],woodD:[110,66,34],varnish:[176,86,30],varnishD:[130,58,18],felt:[60,40,40],silver:[210,212,220],string:[220,220,224]};
const imB=(x0,y0,x1,y1,z0,z1,c,o={})=>sided({x0,y0,x1,y1,z0,z1,c,foot:z0===0?1:0,top:()=>sh(c,1.08),fs:(nx,ny,X,Y,z,k)=>sh(c,k),...o});
function imFlat(B,x,y,z0,z1,w,d,c,cs,face){ for(let z=z0;z<z1;z++){ const h=w(z-z0); if(h<=0)continue; B.push(imB(x-h,y-d,x+h,y+d,z,z+1,c,{foot:z===0?1:0,top:()=>sh(c,1.05),
  fs:(nx,ny,X,Y,zz,k)=>{ if(ny>0){ const f=face&&face(X-x,z-z0); return sh(f||c,k); } return sh(cs,k*(ny<0?.9:1)); }})); } }
function imRound(B,x,y,z0,z1,r,c,o={}){ for(let z=z0;z<z1;z++){ const R=r(z-z0); if(R<=0)continue; const d=R*.41;
  const fs=(nx,ny,X,Y,zz,k)=>sh(o.side?o.side(z-z0,X-x,Y-y):c,k), top=z===z1-1&&o.top?(X,Y)=>o.top(X-x,Y-y):()=>sh(c,1.08);
  B.push(imB(x-R,y-R+d,x+R,y+R-d,z,z+1,c,{fs,top,foot:z===0?1:0}),imB(x-R+d,y-R,x+R-d,y+R,z,z+1,c,{fs,top,foot:z===0?1:0})); } }
function imStand(B,x,y,h,w=.16){ const c=IMC.black; B.push(imB(x-w,y-.12,x-w+.04,y+.08,0,2,c),imB(x+w-.04,y-.12,x+w,y+.08,0,2,c),imB(x-.02,y-.14,x+.02,y-.1,0,h,c),imB(x-.08,y-.14,x+.08,y-.1,h-2,h,c)); }
function imGuitar(x,y,o){ '@later'; const B=[], z0=3, L=o.L, wb=z=>{ const u=z/L; if(o.round){ const r=o.round, dz=z-L/2; return Math.sqrt(Math.max(0,r*r-(dz/(L/2)*r)**2)); }
    const lob=o.lb*Math.sqrt(Math.max(0,1-((u-.3)/.32)**2)), upb=o.ub*Math.sqrt(Math.max(0,1-((u-.76)/.26)**2)); return Math.max(lob,upb,u>.5&&u<.62?o.ub*.82:0); };
  const face=(X,z)=>{ const u=z/L;
    if(o.kind==='hole'&&Math.hypot(X,(z-L*.68)/40)<o.hole)return Math.hypot(X,(z-L*.68)/40)>o.hole*.75?o.ring||IMC.roseD:IMC.black;
    if(o.kind==='head'&&Math.hypot(X,(z-L/2)/40)<o.round*.86)return IMC.head;
    if(o.kind==='pick'&&(Math.abs(z-L*.5)<1||Math.abs(z-L*.28)<1)&&Math.abs(X)<.07)return IMC.black;
    if(Math.abs(z-L*.2)<.6&&Math.abs(X)<o.lb*.45)return o.kind==='head'?IMC.chrome:IMC.ebony;
    if(o.burst&&Math.abs(X)>wb(z)*.72)return o.burst; return null; };
  imStand(B,x,y-.02,z0+L*.62|0); imFlat(B,x,y,z0,z0+L,wb,.05,o.c,o.cs,face);
  const nk=o.neck||(L*.95|0), nw=o.nw||.03; for(let z=z0+L;z<z0+L+nk;z++)B.push(imB(x-nw,y-.025,x+nw,y+.025,z,z+1,IMC.mahog,{fs:(nx,ny,X,Y,zz,k)=>sh(ny>0?IMC.ebony:IMC.mahog,k)}));
  B.push(imB(x-nw*1.5,y-.03,x+nw*1.5,y+.03,z0+L+nk,z0+L+nk+(o.hs||5),o.hc||IMC.mahogD));
  return B; }
const imGuitarProp=(name,o)=>(x,y)=>{ PNAME=name; const p=prop(imGuitar(x,y,o),null,{music:name}); return imOpts(p,name); };
function imAmp(B,x,y){ '@later'; const c=IMC.black; B.push(imB(x-.26,y-.15,x+.26,y+.15,0,15,c,{fs:(nx,ny,X,Y,z,k)=>ny>0&&z>2&&z<11&&Math.abs(X-x)<.22?sh(hash(Math.floor(X*48),Math.floor(z),4501)<.3?[60,58,54]:[44,42,40],k):ny>0&&z>=12?sh(IMC.chromeD,k):sh(c,k)}));
  for(let i=0;i<4;i++)B.push(imB(x-.18+i*.1,y+.13,x-.16+i*.1,y+.16,12,14,IMC.chrome)); }
function imHarp(x,y){ '@later'; PNAME='harp'; const B=[], c=IMC.varnish, H=44;
  B.push(imB(x-.32,y-.12,x+.32,y+.12,0,3,IMC.varnishD));
  B.push(imB(x-.3,y-.04,x-.24,y+.04,3,H,c));
  for(let i=0;i<14;i++){ const xx=x-.24+i*.04; const zt=H-2-Math.round(Math.sin(i/13*Math.PI)*4)-i*.6; B.push(imB(xx,y-.04,xx+.04,y+.04,zt,zt+4,c)); }
  for(let z=3;z<H-6;z++){ const xx=x+.28-(z-3)/(H-9)*.48; B.push(imB(xx,y-.06,xx+.06,y+.06,z,z+1,IMC.spruceD,{fs:(nx,ny,X,Y,zz,k)=>sh(ny!==0?IMC.spruce:IMC.varnish,k)})); }
  B.push(imB(x-.24,y-.002,x+.3,y+.002,3,H-3,IMC.string,{top:()=>null,fs:(nx,ny,X,Y,z,k)=>{ if(!ny)return null; const i=Math.floor((X-(x-.24))/.016); if(Math.abs((X-(x-.24))-(i+.5)*.016)>.004)return null;
    const zb=3+((x+.28)-(x-.24+(i+.5)*.016))/.48*(H-9), zt=H-6-i*.18; const zz=z+3; if(zz<zb||zz>zt)return null; return sh(i%7===0?[180,40,40]:i%7===3?[40,60,120]:IMC.string,k); }}));
  const p=prop(B,null,{music:'harp'}); return imOpts(p,'harp'); }
function imBowed(x,y,name){ '@later'; PNAME=name; const B=[], v=name==='violin', s=v?.48:1, z0=v?14:3, L=Math.round((v?20:46)), lb=v?.1:.22, ub=v?.085:.18;
  if(v)B.push(imB(x-.18,y-.14,x+.18,y+.14,0,12,IMC.black,{fs:(nx,ny,X,Y,z,k)=>sh(z>10?[50,50,56]:IMC.black,k)}));
  else B.push(imB(x-.01,y-.01,x+.01,y+.01,0,3,IMC.chrome));
  const wb=z=>{ const u=z/L, lob=lb*Math.sqrt(Math.max(0,1-((u-.27)/.29)**2)), upb=ub*Math.sqrt(Math.max(0,1-((u-.75)/.27)**2)); return Math.max(lob,upb,u>.48&&u<.56?ub*.62:0); };
  const face=(X,z)=>{ const u=z/L; if(Math.abs(Math.abs(X)-lb*.42)<.012&&u>.32&&u<.6)return IMC.black; if(Math.abs(X)<.025&&u>.4)return IMC.ebony; if(Math.abs(z-L*.45)<.6&&Math.abs(X)<lb*.5)return IMC.maple; return Math.abs(X)>wb(z)*.8?IMC.varnishD:null; };
  imFlat(B,x,y,z0,z0+L,wb,v?.03:.07,IMC.varnish,IMC.varnishD,face);
  const nk=v?10:20; for(let z=z0+L;z<z0+L+nk;z++)B.push(imB(x-.018*(v?1:1.4),y-.02,x+.018*(v?1:1.4),y+.02,z,z+1,IMC.varnishD,{fs:(nx,ny,X,Y,zz,k)=>sh(ny>0?IMC.ebony:IMC.varnishD,k)}));
  B.push(imB(x-.03,y-.03,x+.03,y+.03,z0+L+nk,z0+L+nk+(v?3:5),IMC.varnishD));
  if(!v)for(let z=6;z<52;z++){ const xx=x+.28-(z-6)*.002; B.push(imB(xx,y+.1,xx+.012,y+.12,z,z+1,z<9?IMC.ebony:[120,80,50])); }
  const p=prop(B,null,{music:name}); return imOpts(p,name); }
function imPipe(x,y,name){ '@later'; PNAME=name; const B=[], f=name==='flute';
  B.push(imB(x-.3,y-.12,x+.3,y+.12,0,14,IMC.black,{top:(X,Y)=>Math.abs(Y-y)<.05?[34,22,40]:[30,30,34],fs:(nx,ny,X,Y,z,k)=>sh(z>12?[50,50,56]:IMC.black,k)}));
  if(f){ B.push(imB(x-.28,y-.012,x+.28,y+.012,14,15,IMC.silver,{top:(X,Y)=>Math.abs(((X-x)*48)%3)<.8&&X>x-.1?IMC.chromeD:IMC.silver})); }
  else { B.push(imB(x-.03,y-.03,x+.03,y+.03,14,16,IMC.black)); for(let z=16;z<27;z++){ const r=z>25?.022:.016; B.push(imB(x-r,y-r,x+r,y+r,z,z+1,IMC.maple,{fs:(nx,ny,X,Y,zz,k)=>sh(ny>0&&z>17&&z<24&&z%2===0?IMC.black:IMC.maple,k)})); } }
  const p=prop(B,null,{music:name}); return imOpts(p,name); }
const IMKITBAR={k:1.1,sp:1.35};
function imDrums(x,y,dz=0,k=1,sp=1){ PNAME=dz?'drum kit on a stage':'drum kit'; const B=[], i2t=i=>i*.0254/.9/2*k, sh2=IMC.shell, hd=IMC.head, zk=z=>Math.round(z*k);
  { const r=i2t(22), cz=Math.round(r*24*1.1); for(let z=0;z<2*cz;z++){ const h=Math.sqrt(Math.max(0,cz*cz-(z-cz+.5)**2))/24/1.1; B.push(imB(x-h,y+.02,x+h,y+.02+.4*k,z,z+1,sh2,{foot:z===0?1:0,fs:(nx,ny,X,Y,zz,k)=>sh(ny>0?(Math.hypot(X-x,(z-cz)/24/1.1)>h*.9?IMC.chrome:hd):sh2,k)})); } }
  const drum=(dx,dy,inch,z0,dep)=>{ const r=i2t(inch); dx*=sp; dy*=sp; z0=zk(z0); dep=zk(dep); imRound(B,x+dx,y+dy,z0,z0+dep,()=>r,sh2,{side:(z)=>z===0||z===dep-1?IMC.chrome:sh2,top:()=>hd}); if(z0>0)B.push(imB(x+dx-.01,y+dy-.01,x+dx+.01,y+dy+.01,0,z0,IMC.chrome)); };
  drum(-.42,-.1,14,16,4); drum(-.12,.12,10,24,6); drum(.14,.12,12,24,7); drum(.46,-.08,16,0,15);
  const cym=(dx,dy,inch,z)=>{ const r=i2t(inch); dx*=sp; dy*=sp; z=zk(z); B.push(imB(x+dx-.008,y+dy-.008,x+dx+.008,y+dy+.008,0,z,IMC.chrome)); imRound(B,x+dx,y+dy,z,z+1,()=>r,IMC.bronze,{top:(X,Y)=>Math.hypot(X,Y)<r*.22?IMC.brassD:hash(Math.floor(Math.hypot(X,Y)*90),0,4502)<.4?IMC.bronze:IMC.brass}); };
  cym(-.62,.0,14,22); imRound(B,x-.62*sp,y,zk(20),zk(20)+1,()=>i2t(14),IMC.bronze); cym(-.42,.34,16,40); cym(.56,.3,20,36);
  if(!dz)B.push(imB(x-.12,y-.52,x+.12,y-.34,0,13,IMC.black,{top:()=>[40,40,44]}));
  const p=prop(dz?B.map(b=>zShift(b,dz)):B,null,{music:'drum kit'}); return imOpts(p,'drum kit'); }
function imBarsProp(x,y,name){ '@later'; PNAME=name; const B=[], I={xylophone:[32,.62,26,[150,74,44]],marimba:[37,.95,26,[140,66,40]],glockenspiel:[30,.28,16,[226,228,236]]}[name], [n,hw,zt,col]=I, nat=Math.round(n*7/12), bw=2*hw/nat;
  const top=(X,Y,back)=>{ const i=Math.floor((X-(x-hw))/bw), f=(X-(x-hw))/bw-i; if(f<.12||f>.88)return null; const L=.2*Math.sqrt(1-i/nat*.55)*(name==='glockenspiel'?.6:1); if(back){ if([2,6].includes(i%7)||f<.5)return null; return Math.abs(Y-(y-.08-L/2))<L/2?col:null; } return Math.abs(Y-(y+L/2))<L/2?col:null; };
  const edge=(X,back,k)=>{ const i=Math.floor((X-(x-hw))/bw), f=(X-(x-hw))/bw-i; if(f<.12||f>.88||back&&([2,6].includes(i%7)||f<.5))return null; return sh(col,k*.8); };
  B.push(imB(x-hw,y+.0,x+hw,y+.3,zt,zt+2,col,{top:(X,Y)=>top(X,Y,false),fs:(nx,ny,X,Y,z,k)=>ny?edge(X,false,k):null}));
  B.push(imB(x-hw,y-.3,x+hw,y-.0,zt+3,zt+5,col,{top:(X,Y)=>top(X,Y,true),fs:(nx,ny,X,Y,z,k)=>ny?edge(X,true,k):null}));
  for(const sx of [-1,1])for(const sy of [-1,1])B.push(imB(x+sx*(hw-.03)-.02,y+sy*.2-.02,x+sx*(hw-.03)+.02,y+sy*.2+.02,0,zt,IMC.woodD));
  B.push(imB(x-hw,y-.24,x+hw,y-.2,zt-2,zt,IMC.woodD),imB(x-hw,y+.2,x+hw,y+.24,zt-2,zt,IMC.woodD));
  if(name==='marimba')B.push(imB(x-hw+.05,y+.12,x+hw-.05,y+.14,4,zt-2,IMC.brass,{fs:(nx,ny,X,Y,z,k)=>{ if(!ny)return sh(IMC.brass,k); const i=Math.floor((X-(x-hw))/bw), f=(X-(x-hw))/bw-i; const L=(zt-6)*Math.sqrt(1-i/nat*.75); return f>.25&&f<.75&&z>(zt-6)-L?sh(f<.4?IMC.bronze:IMC.brassD,k):null; },top:()=>null}));
  const p=prop(B,null,{music:name}); return imOpts(p,name); }
function imBells(x,y){ '@later'; PNAME='tubular bells'; const B=[], hw=.7, H=56;
  for(const s of [-1,1])B.push(imB(x+s*hw-.03,y-.16,x+s*hw+.03,y+.16,0,2,IMC.black),imB(x+s*hw-.02,y-.02,x+s*hw+.02,y+.02,2,H,IMC.black));
  B.push(imB(x-hw,y-.02,x+hw,y+.02,H-3,H,IMC.black));
  for(let i=0;i<18;i++){ const tx=x-hw+.1+i*(2*hw-.2)/17, L=Math.round(44*Math.sqrt(1/Math.pow(2,i/12))); B.push(imB(tx-.02,y-.02,tx+.02,y+.02,H-4-L,H-4,[226,196,120],{fs:(nx,ny,X,Y,z,k)=>sh(z>L-3?[240,214,140]:nx>0?[180,146,70]:[226,196,120],k)})); }
  const p=prop(B,null,{music:'tubular bells'}); return imOpts(p,'tubular bells'); }
function imKalimba(x,y){ '@later'; PNAME='kalimba'; const B=[];
  B.push(imB(x-.16,y-.16,x+.16,y+.16,0,14,IMC.black,{fs:(nx,ny,X,Y,z,k)=>sh(z>12?[50,50,56]:IMC.black,k)}));
  B.push(imB(x-.08,y-.1,x+.08,y+.1,14,16,IMC.wood,{top:(X,Y)=>{ const u=(X-(x-.08))/.16, i=Math.floor(u*9); if(Y<y+.04&&Y>y-.08+Math.abs(u-.5)*.1&&(u*9-i)>.3&&(u*9-i)<.75)return IMC.steel; if(Math.abs(Y-(y+.04))<.008)return IMC.chromeD; return Math.hypot(X-x,Y-(y+.07))<.02?IMC.black:IMC.wood; }}));
  const p=prop(B,null,{music:'kalimba'}); return imOpts(p,'kalimba'); }
function imPan(x,y){ '@later'; PNAME='steel pan'; const B=[], r=.32;
  for(const a of [0,2.1,4.2])B.push(imB(x+Math.cos(a)*.24-.01,y+Math.sin(a)*.24-.01,x+Math.cos(a)*.24+.01,y+Math.sin(a)*.24+.01,0,24,IMC.black));
  imRound(B,x,y,24,30,z=>r-(5-z)*.004,IMC.chrome,{side:(z)=>z===5?IMC.silver:IMC.chromeD,top:(X,Y)=>{ const d=Math.hypot(X,Y)/r, a=Math.atan2(Y,X); const ring=d>.62?0:d>.3?1:2, n=[12,12,3][ring], f=((a/(2*Math.PI)*n)%1+1)%1; return (f<.08||f>.92)||Math.abs(d-.62)<.04||Math.abs(d-.3)<.04?IMC.chromeD:IMC.silver; }});
  const p=prop(B,null,{music:'steel pan'}); return imOpts(p,'steel pan'); }
function imOpts(p,kind){ p.opts=()=>typeof imThingOpts==='function'?imThingOpts(p,kind):[]; return p; }
Object.assign(CATALOG,{'classical guitar':imGuitarProp('classical guitar',{L:17,lb:.21,ub:.16,c:IMC.spruce,cs:IMC.rose,kind:'hole',hole:.08,ring:IMC.mahog}),
  'steel-string guitar':imGuitarProp('steel-string guitar',{L:18,lb:.23,ub:.17,c:IMC.spruce,cs:IMC.mahog,kind:'hole',hole:.085,burst:IMC.burst,ring:IMC.black}),
  'electric guitar':(x,y)=>{ PNAME='electric guitar'; const B=imGuitar(x-.18,y,{L:14,lb:.19,ub:.15,c:IMC.red,cs:IMC.redD,kind:'pick',hc:IMC.black}); imAmp(B,x+.22,y+.02); return imOpts(prop(B,null,{music:'electric guitar'}),'electric guitar'); },
  'bass guitar':(x,y)=>{ PNAME='bass guitar'; const B=imGuitar(x-.18,y,{L:15,lb:.2,ub:.15,c:IMC.burst,cs:IMC.black,kind:'pick',burst:IMC.black,neck:22,hc:IMC.black}); imAmp(B,x+.22,y+.02); return imOpts(prop(B,null,{music:'bass guitar'}),'bass guitar'); },
  'ukulele':imGuitarProp('ukulele',{L:9,lb:.12,ub:.09,c:IMC.mahog,cs:IMC.mahogD,kind:'hole',hole:.045,neck:8,hs:3}),
  'banjo':imGuitarProp('banjo',{L:11,round:.18,c:IMC.chrome,cs:IMC.wood,kind:'head',neck:20}),
  'mandolin':imGuitarProp('mandolin',{L:10,lb:.13,ub:.08,c:IMC.spruce,cs:IMC.mahog,kind:'hole',hole:.04,burst:IMC.burst,neck:9,hs:3}),
  'harp':(x,y)=>imHarp(x,y),'violin':(x,y)=>imBowed(x,y,'violin'),'cello':(x,y)=>imBowed(x,y,'cello'),'flute':(x,y)=>imPipe(x,y,'flute'),'recorder':(x,y)=>imPipe(x,y,'recorder'),
  'drum kit':(x,y)=>imDrums(x,y),'drum kit on a stage':(x,y)=>imDrums(x,y,14,IMKITBAR.k,IMKITBAR.sp),'xylophone':(x,y)=>imBarsProp(x,y,'xylophone'),'marimba':(x,y)=>imBarsProp(x,y,'marimba'),'glockenspiel':(x,y)=>imBarsProp(x,y,'glockenspiel'),
  'tubular bells':(x,y)=>imBells(x,y),'kalimba':(x,y)=>imKalimba(x,y),'steel pan':(x,y)=>imPan(x,y)});
if(!CAT_DEPTS.some(d=>d[0]==='Music'))CAT_DEPTS.push(['Music','Music']);
const IMPRICE={'classical guitar':180,'steel-string guitar':260,'electric guitar':420,'bass guitar':380,'ukulele':60,'banjo':240,'mandolin':200,'harp':950,'violin':320,'cello':1200,'flute':450,'recorder':25,
  'drum kit':650,'xylophone':380,'marimba':1600,'glockenspiel':95,'tubular bells':1100,'kalimba':35,'steel pan':290};
Object.assign(CAT_INFO,Object.fromEntries(Object.entries({'classical guitar':'Nylon strings, a spruce top and rosewood back: the guitar the bar\'s guitarist plays.','steel-string guitar':'A dreadnought: phosphor bronze strings, a sunburst spruce top, a big voice.',
  'electric guitar':'A red solid body with two pickups, and a little valve amp to play it through.','bass guitar':'Four long strings, a sunburst body, and its amp.','ukulele':'A soprano ukulele in mahogany, tuned G C E A.',
  'banjo':'Five strings on a drum head, tuned to open G.','mandolin':'Four pairs of steel strings tuned in fifths, a sunburst top.','harp':'A lever harp of thirty-four strings, C2 to A6: the Cs red, the Fs blue.',
  'violin':'A violin on its stand: spruce, maple and a deep varnish.','cello':'A cello on its pin, with its bow.','flute':'A silver flute on black velvet.','recorder':'A pearwood recorder in its stand, baroque fingered.',
  'drum kit':'A five-piece kit: kick, snare, two toms, a floor tom, hi-hats, a crash and a ride.','xylophone':'Rosewood bars, bright and dry.','marimba':'Four octaves of rosewood bars over brass resonators.',
  'glockenspiel':'Steel bars, struck with brass mallets: a bell-like ring.','tubular bells':'Eighteen brass tubes hanging in their frame.','kalimba':'Seventeen steel tines on a wooden box: a thumb piano.','steel pan':'A tenor pan on its stand, its notes hammered into the bowl.'})
  .map(([k,line],i)=>[k,{n:2001+i,name:k[0].toUpperCase()+k.slice(1),dept:'Music',price:'$'+IMPRICE[k],line}])));
for(const k of Object.keys(IMPRICE))KIND_OF[k]=k;
CAT_INFO['drum kit on a stage']={n:2020,name:'Drum kit on a stage',dept:'Music',price:'$650',line:'The bar\'s kit, up on its stage: the drummer\'s.'}; KIND_OF['drum kit on a stage']='drum kit on a stage';
PNAME='object';

STOREK.bar={barFloorCol,barWall,theatreSconce};
}

{
