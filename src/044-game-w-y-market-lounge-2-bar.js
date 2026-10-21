const MLK=(()=>{ const {rect,sub,fb,worn,metal}=STUDIO.kit, FP=24, H=2, lit=c=>Object.assign([...c],{e:1});
  const art=(W,HT,draw)=>{ '@later'; W=Math.ceil(W*H); HT=Math.ceil(HT*H); const a=new Array(W*HT).fill(null); draw((x,y,c)=>{ x=Math.floor(x); y=Math.floor(y); if(c&&x>=0&&y>=0&&x<W&&y<HT)a[y*W+x]=c; },(x0,y0,x1,y1,c)=>{ for(let y=Math.floor(y0);y<y1;y++)for(let x=Math.floor(x0);x<x1;x++)if(c&&x>=0&&y>=0&&x<W&&y<HT)a[y*W+x]=c; });
    return {W,HT,at:(x,y)=>x>=0&&y>=0&&x<W&&y<HT?a[y*W+x]:null}; };
  const onF=(A,ht,els)=>(s,t,z,len)=>s==='f'?A.at(Math.max(0,Math.floor((1-t)*len*FP*H-1e-6)),Math.floor((ht-z)*H)):els(s,t,z,len);
  const C={white:[226,228,230],whiteD:[170,176,182],glass:[150,196,236],shelf:[190,222,240],top:[224,198,142],topL:[238,216,166],wood:[148,108,58],woodD:[112,78,40],woodL:[172,130,76],
    red:[198,30,42],redD:[150,18,30],redL:[222,70,80],chrome:[178,180,186],chromeD:[118,120,126],black:[34,34,38],blackL:[62,62,68],screen:[46,58,78],screenL:[90,120,160],key:[72,72,78],mesh:[54,54,60],
    poster:[26,22,28],paper:[236,232,222],can:[70,170,80],bottle:[220,220,224],daruma:[200,40,40]};
  const bottles=[[60,140,70],[96,172,86],[150,90,40],[200,52,52],[66,120,200],[228,228,230],[214,170,60],[170,60,120]];
  function fridge(x,y,f=[1,0]){ '@later'; SHARED.PNAME='lounge fridge'; const r=rect(x,y,f,4.7,.6), HT=125, B=[], W=C.white;
    const fr=(s,t,z,len)=>{ const m=Math.min(t,1-t)*len*FP; if(z<6)return sh(W,.6); if(z>HT-7)return sh(W,1.04); if(s==='f'&&m>3&&z>10&&z<HT-10)return null; return worn(W,t,z,31); };
    B.push(fb(r,0,1,0,1,0,10,W,(s,t,z,len)=>z<2?sh(W,.5):z<4&&(Math.floor(t*len*FP/2)&1)?[60,62,66]:W,null,{}));
    B.push(fb(r,0,1,.9,1,10,HT,W,(s,t,z)=>s==='f'?lit(C.glass):worn(W,t,z,33),()=>W,{foot:1}));
    for(const [a,b] of [[0,.03],[.97,1]])B.push(fb(r,a,b,0,1,10,HT,W,(s,t,z)=>worn(W,t,z,35),()=>W,{foot:1}));
    B.push(fb(r,0,1,0,1,HT-7,HT,W,(s,t,z)=>worn(W,t,z,37),(t,d)=>d>.9||d<.1||t<.02||t>.98?C.whiteD:W,{foot:1}));
    for(const z of [10,58])B.push(fb(r,.03,.97,.06,.9,z,z+2,C.shelf,(s)=>s==='f'?lit([170,210,236]):C.shelf,()=>lit(C.shelf),{foot:1}));
    for(const z of [12,60])for(let i=0;i<16;i++){ const n=hash(i,z,41), c=bottles[Math.floor(n*8)], t0=.05+i*.057+n*.01, w=.03+hash(i,z,43)*.012, h=28+hash(i,z,45)*12;
      B.push(fb(r,t0,t0+w,.3,.75,z,z+h-6,c,(s,t,zz)=>zz>8&&zz<14?[236,232,220]:t<.3?sh(c,1.25):t>.8?sh(c,.7):c,()=>c,{foot:1}),fb(r,t0+w*.3,t0+w*.7,.4,.65,z+h-6,z+h,c,(s,t,zz)=>zz>4?[224,204,88]:sh(c,.9),()=>[224,204,88],{foot:1})); }
    B.push(fb(r,.02,.98,.02,.98,10,HT-7,W,fr,null,{foot:1}));
    B.push(fb(r,.78,.88,.3,.7,HT,HT+12,C.daruma,(s,t,z)=>z>4&&z<10&&Math.abs(t-.5)<.3?C.paper:z<2?C.redD:C.daruma,()=>C.daruma,{foot:1}),fb(r,.6,.68,.35,.65,HT,HT+9,[70,120,210],(s,t,z)=>z>7?[220,230,240]:[70,120,210],()=>[220,230,240],{foot:1}));
    const p=prop(B); LAMPS.push({own:1,room:1,x:r.cx+f[0]*.9,y:r.cy+f[1]*.9,z:60,r:3.4,c:[.5,.72,1],prop:p,day:true}); return p; }
  const barTop=(t,d,X,Y)=>{ const e=Math.min(t,1-t,d,1-d); return e<.03?C.woodL:sh(mt('wood',C.top),.96+.08*hash(Math.floor(X*12),Math.floor(Y*12),49)); };
  const barBody=r=>{ '@later'; const L=r.W, B=[], fw=(s,t,z)=>s==='b'||s==='f'?sh(C.woodD,s==='f'?.9:1):worn(mt('wood',C.wood),t,z,47), lo=x=>x/L, thin=lo(.11);
    B.push(fb(r,0,1,0,1,32,36,C.top,(s,t,z)=>z>2?C.topL:C.top,barTop,{foot:1}));
    B.push(fb(r,thin,1-thin,.1,.18,3,32,C.wood,fw,()=>C.wood,{foot:1}),fb(r,thin,1-thin,.14,.18,0,3,C.woodD,(s)=>sh(C.woodD,.8),()=>C.woodD,{foot:1}));
    const n=Math.max(1,Math.round(L*FP/32)), m=lo(4/FP);
    for(let i=0;i<n;i++)B.push(fb(r,thin+(1-2*thin)*i/n+m,thin+(1-2*thin)*(i+1)/n-m,.05,.1,6,29,C.wood,(s,t,z)=>s==='f'?sh(worn(mt('wood',C.wood),t,z+6,48),1.08):C.woodD,()=>C.woodL,{foot:1,nb:1}));
    for(const [a,b] of [[0,thin],[1-thin,1]])B.push(fb(r,a,b,.1,.98,0,32,C.wood,(s,t,z)=>worn(mt('wood',C.wood),t,z,46),()=>C.woodD,{foot:1}));
    for(const z of [2,15])B.push(fb(r,thin,1-thin,.18,.94,z,z+1.5,C.woodD,()=>sh(C.woodD,.85),()=>C.wood,{foot:1,nb:1}));
    for(let x=.2;x<L-.2;x+=.3){ const k=hash(Math.floor(x*10),1,111), gc=k<.5?[200,226,230]:[176,204,196], t0=lo(x);
      B.push(fb(r,t0,t0+lo(.08),.8+k*.06,.85+k*.06,16.5,16.5+(k<.3?6:5),gc,(s,t,z)=>t<.3?sh(gc,1.15):gc,()=>[236,244,244],{foot:1,nb:1})); }
    for(let x=.3;x<L-.25;x+=.42+hash(Math.floor(x*10),2,113)*.1){ const k=hash(Math.floor(x*10),3,115), c=bottles[Math.floor(k*8)], t0=lo(x);
      B.push(fb(r,t0,t0+lo(.09),.82,.88,3.5,10.5,c,(s,t,z)=>z>2&&z<5?[236,232,220]:t<.3?sh(c,1.25):c,()=>c,{foot:1,nb:1}),fb(r,t0+lo(.025),t0+lo(.065),.84,.86,10.5,13,c,null,()=>[224,204,88],{foot:1,nb:1})); }
    B.push(fb(r,thin,1-thin,.95,.98,26,27.5,C.chrome,(s,t,z)=>metal(C.chrome,t,z),()=>C.chrome,{foot:1,nb:1}));
    return B; };
  function bar(x,y,f=[1,0]){ SHARED.PNAME='lounge bar'; return prop(barBody(rect(x,y,f,5.3,1.4))); }
  function barEnd(x,y,f=[0,1]){ SHARED.PNAME='bar end counter'; const r=rect(x,y,f,2.2,1.4); return prop([...barBody(r),fb(r,.6,.7,.4,.55,36,46,C.can,(s,t,z)=>z>8?[200,210,200]:t<.3?sh(C.can,1.3):C.can,()=>[200,210,200],{foot:1})],null,{part:'lounge bar'}); }
  function stool(x,y){ '@later'; SHARED.PNAME='red bar stool'; const r=rect(x,y,[0,1],.7,.7), rd=(t,d)=>Math.hypot(t-.5,d-.5);
    return prop([fb(r,.15,.85,.15,.85,0,2,C.chromeD,null,(t,d)=>rd(t,d)<.35?C.chrome:null),fb(r,.44,.56,.44,.56,2,23,C.chrome,(s,t,z)=>metal(t<.4?sh(C.chrome,1.15):C.chrome,t,z),null,{foot:1}),
      fb(r,.05,.95,.05,.95,23,29,C.red,(s,t,z)=>z<2?C.redD:z>4?C.redL:C.red,(t,d)=>{ const q=rd(t,d); return q>.45?null:q>.4?C.redD:q<.15?C.redL:C.red; },{foot:1})]); }
  const monitor=(r,t0,t1,d,z0,B,wide=1)=>{ '@later'; const w=(t1-t0), sc=art(wide*24,16,(px,bx)=>{ bx(0,0,wide*48,32,C.black); bx(2,2,wide*48-2,28,lit(C.screen)); bx(5,5,wide*48-8,8,lit(C.screenL)); bx(5,10,wide*24,12,lit([70,96,130])); for(let i=0;i<4;i++)bx(8,14+i*3,8+hash(i,0,51)*wide*30,15+i*3,lit([120,150,190])); });
    B.push(fb(r,t0+w*.4,t0+w*.6,d-.03,d+.03,z0,z0+4,C.black,null,null,{foot:1}),fb(r,t0+w*.47,t0+w*.53,d-.02,d+.02,z0+4,z0+8,C.black,null,null,{foot:1}),
      fb(r,t0,t1,d-.02,d+.02,z0+8,z0+24,C.black,onF(sc,16,()=>C.black),()=>C.black,{foot:1})); };
  const keyboard=(r,t0,t1,d0,d1,z0,B)=>B.push(fb(r,t0,t1,d0,d1,z0,z0+1.5,C.black,null,(t,d,X,Y)=>(Math.floor(X*60)+Math.floor(Y*60))&1?C.key:C.black,{foot:1}));
  function pcDesk(x,y,f=[1,0]){ '@later'; SHARED.PNAME='PC desk'; const r=rect(x,y,f,2,.9), B=[], T=26, dk=(s,t,z)=>worn(C.black,t,z,53);
    B.push(fb(r,0,1,0,1,T-2,T,C.black,(s,t,z)=>z>1?C.blackL:C.black,()=>C.black)); for(const [a,b] of [[.03,.08],[.92,.97]])B.push(fb(r,a,b,.1,.9,0,T-2,C.black,dk,null,{foot:1}));
    monitor(r,.3,.7,.78,T,B); keyboard(r,.25,.75,.25,.5,T,B); B.push(fb(r,.82,.9,.3,.45,T,T+2,C.blackL,null,null,{foot:1})); return prop(B); }
  function officeChair(x,y,f=[1,0]){ '@later'; SHARED.PNAME='office chair'; const r=rect(x,y,f,.7,.7);
    return prop([fb(r,.1,.9,.1,.9,0,2,C.blackL,null,(t,d)=>{ const a=Math.atan2(d-.5,t-.5), q=Math.hypot(t-.5,d-.5); return q<.08||q<.4&&Math.abs(((a*5/Math.PI/2)%1+1)%1-.5)<.14?C.blackL:null; }),
      fb(r,.45,.55,.45,.55,2,16,C.black,null,null,{foot:1}),fb(r,.08,.92,.1,.9,16,21,C.black,(s,t,z)=>z>3?C.mesh:C.black,()=>C.mesh,{foot:1}),
      fb(r,.12,.88,.85,.95,21,50,C.black,(s,t,z)=>z<3?C.black:Math.min(t,1-t)<.08||z>26?C.black:C.mesh,()=>C.black,{foot:1}),
      fb(r,.02,.1,.3,.7,28,33,C.black,null,null,{foot:1}),fb(r,.9,.98,.3,.7,28,33,C.black,null,null,{foot:1})]); }
  function longDesk(x,y,f=[1,0]){ '@later'; SHARED.PNAME='mezzanine desk'; const r=rect(x,y,f,4,1), B=[], T=26, dk=(s,t,z)=>worn(C.black,t,z,55);
    B.push(fb(r,0,1,0,1,T-2,T,C.black,(s,t,z)=>z>1?C.blackL:C.black,()=>C.black)); for(const [a,b] of [[.02,.05],[.95,.98]])B.push(fb(r,a,b,.1,.9,0,T-2,C.black,dk,null,{foot:1}));
    monitor(r,.08,.3,.8,T,B); monitor(r,.34,.66,.8,T,B,1.4); monitor(r,.7,.92,.8,T,B); keyboard(r,.12,.3,.3,.5,T,B); keyboard(r,.4,.6,.3,.5,T,B); B.push(fb(r,.66,.72,.35,.48,T,T+2,C.blackL,null,null,{foot:1}));
    B.push(fb(r,.72,.98,.6,.95,T,T+40,C.black,(s,t,z)=>s==='f'&&z>30&&z<36&&t>.2&&t<.8?lit([80,200,120]):worn(C.black,t,z,57),()=>C.black,{foot:1})); return prop(B); }
  function gamingChair(x,y,f=[1,0]){ '@later'; SHARED.PNAME='gaming chair'; const r=rect(x,y,f,.8,.8), q=(t,d)=>Math.hypot(t-.5,d-.5);
    return prop([fb(r,.08,.92,.08,.92,0,2,C.blackL,null,(t,d)=>q(t,d)<.08||q(t,d)<.42&&Math.abs((((Math.atan2(d-.5,t-.5)*5/Math.PI/2)%1)+1)%1-.5)<.14?C.blackL:null),fb(r,.45,.55,.45,.55,2,14,C.black,null,null,{foot:1}),
      fb(r,.08,.92,.1,.9,14,22,C.black,(s,t,z)=>z>2&&z<6?C.mesh:C.black,()=>C.mesh,{foot:1}),fb(r,.1,.9,.84,.98,22,64,C.black,(s,t,z)=>Math.min(t,1-t)<.12?C.blackL:z>36?C.black:C.mesh,()=>C.black,{foot:1}),
      fb(r,.3,.7,.8,.98,64,72,C.black,null,null,{foot:1}),fb(r,0,.1,.3,.7,22,34,C.black,null,null,{foot:1}),fb(r,.9,1,.3,.7,22,34,C.black,null,null,{foot:1})]); }
  function floorBottle(x,y){ SHARED.PNAME='bottle'; const r=rect(x,y,[0,1],.16,.16), c=C.bottle; return prop([fb(r,.2,.8,.2,.8,0,10,c,(s,t,z)=>z>3&&z<6?[70,120,210]:t<.3?sh(c,1.1):sh(c,.9)),fb(r,.38,.62,.38,.62,10,14,c,null,null,{foot:1})]); }
  return {art,onF,lit,C,fridge,bar,barEnd,stool,pcDesk,officeChair,longDesk,gamingChair,floorBottle,rect,sub,fb,worn,metal}; })();
