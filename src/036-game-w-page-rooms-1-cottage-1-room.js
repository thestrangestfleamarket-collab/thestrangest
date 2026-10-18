(()=>{ const {C,shd,mix,hh,n1,sstep,rnd,rr,seed,wood,item,scene,box,cyl,ell,lamp,candle,jar,bookLying,bookStand,leafE,pot,fern,pothos,pumpkin,vase,flowers,frameArt,drapes,beads,wallClock,E1,E2,SKY,FIRE,GLOW,TX}=PGK; const self={};
  const LX=9, LY=12, WH=3.8; scene('cottage',LX,LY,WH,[{wall:'E',a0:8.55,a1:9.85,z1:2.3}],{full:true});
  const PAL={
  plaster:C('#55602f'),plasterD:C('#434d24'),plasterL:C('#66703a'),moss:C('#3f5a25'),trim:C('#a28a5a'),trimD:C('#6e5c3a'),
  floor:C('#3b3a1f'),floorD:C('#2a2913'),floorL:C('#47452a'),
  red:C('#6e2f26'),redL:C('#8a4232'),redD:C('#4a1d18'),
  amber:C('#86501f'),amberL:C('#a4682a'),amberD:C('#5c3412'),
  oak:C('#7a4520'),oakL:C('#965a2a'),oakD:C('#55301a'),
  table:C('#6f5c40'),tableL:C('#8b7652'),tableD:C('#4c3e2a'),
  bark:C('#55372a'),barkD:C('#3a2419'),ring:C('#8e6c4a'),
  leaf:C('#2f6a34'),leafL:C('#4c9441'),leafD:C('#1f4a26'),leafH:C('#78b85a'),
  teal:C('#2c6656'),tealL:C('#43876c'),tealD:C('#1d4a3e'),
  pump:C('#d9741c'),pumpL:C('#f2a03a'),pumpD:C('#a8520f'),stem:C('#4e6a2a'),
  glass:C('#d6d4c2'),glassD:C('#a9aa98'),cork:C('#b4945e'),
  wax:C('#e6dbbf'),waxD:C('#c4b593'),
  purple:C('#5c3550'),purpleL:C('#74466a'),purpleD:C('#40243a'),gold:C('#94722c'),goldL:C('#b48e3a'),
  iron:C('#4a4e58'),ironL:C('#6a707c'),ironD:C('#30333b'),
  drape:C('#2f5a2b'),drapeL:C('#44783a'),drapeD:C('#1f3c1d'),
  cream:C('#e4dcc0'),paper:C('#ece4cc'),terra:C('#b05a3a'),terraD:C('#8a4028'),terraL:C('#c8714a'),soil:C('#3a2a1c'),
  violet:C('#7a4aa8'),violetL:C('#a070d0'),pink:C('#e070b0'),pinkL:C('#f4a0d0'),lilac:C('#b070c8'),lilacL:C('#d8a0e0'),
};
function wallPaint(ivyAt,seed,opening){
  return (f,u,v,W,H,x,y,z)=>{
    if(f==='T'){ return (v<2||v>H-2)?PAL.trimD:shd(PAL.trim,0.92+0.12*hh(u>>1,v,seed)); }
    if(opening){const o=opening(f,u,v,x,y,z); if(o!==undefined)return o;}
    if(v<3)return v<1?shd(PAL.trim,1.1):PAL.trimD;
    const ui=Math.floor(u),vi=Math.floor(v);
    const cs=6, cu=Math.floor(u/cs), cv=Math.floor(v/cs);
    for(let du=-1;du<=1;du++)for(let dv=-1;dv<=1;dv++){
      const a=cu+du,b=cv+dv; if(b<0)continue;
      const strand=ivyAt(a*cs/TX,b*cs/TX)*(H)*(0.25+0.75*hh(a,77,seed)), dens=b*cs<strand?0.85:0;
      if(hh(a,b,seed)>=dens)continue;
      const lu=a*cs+3+(hh(a,b,seed+1)-0.5)*4, lv=b*cs+3+(hh(a,b,seed+2)-0.5)*4;
      const ang=hh(a,b,seed+3)*6.28, ca=Math.cos(ang), sa=Math.sin(ang);
      const qx=(u-lu)*ca+(v-lv)*sa, qy=-(u-lu)*sa+(v-lv)*ca, rr2=(qx*qx)/(4.2*4.2)+(qy*qy)/(2.8*2.8)+Math.abs(qx)*0.02;
      if(rr2<1){ const tone=hh(a,b,seed+4); let c=tone<0.33?PAL.leafD:tone<0.75?PAL.leaf:PAL.leafL; if(rr2>0.7)c=shd(c,0.7); else if(qy<-1.2&&qx<0)c=shd(c,1.25); if(Math.abs(qy)<0.5&&rr2<0.6)c=shd(c,1.18); return c; }
    }
    const sc=Math.floor(u/cs); const st=ivyAt(sc*cs/TX,0)*H*(0.25+0.75*hh(sc,77,seed));
    if(v<st&&Math.abs(u-(sc*cs+3+Math.sin(v*0.25+sc)*1.5))<0.6)return PAL.leafD;
    let k=0.94+0.07*hh(ui>>1,0,seed)+0.05*hh(ui,vi>>2,seed);
    const streak=n1(u*0.18,seed)*n1(v*0.03+u*0.01,seed+1); if(streak>0.45)k*=0.86;
    if(hh(ui>>2,vi>>3,seed+9)<0.08)k*=0.9;
    k*=1-0.18*sstep(0.55,1,v/H);
    let c=shd(PAL.plaster,k);
    const m=n1(u*0.07,seed+3)*n1(v*0.05,seed+4); if(m>0.42)c=mix(c,PAL.moss,Math.min(1,(m-0.42)*4));
    if(v>H-3)c=shd(c,0.72);
    return c;};
}


  item('herb cottage floor',{floor:1});
  box(0,0,-0.45,LX,LY,0,(f,u,v,W,H,x,y)=>{
    if(f!=='T')return shd(PAL.floorD,0.7+0.1*hh(u>>2,v,1));
    const pw=12, col=Math.floor(u/pw), off=hh(col,0,3)*60, row=Math.floor((v+off)/58);
    let k=0.92+0.12*hh(col,row,4)+0.04*Math.sin(v*0.21+col);
    if(u%pw<1)k*=0.62; else if(u%pw<2)k*=1.08; if((v+off)%58<1)k*=0.66;
    if(hh(Math.floor(u),Math.floor(v/5),6)<0.03)k*=0.85;
    return shd(PAL.floor,k);},{floor:1,occ:0});

  const WIN={x0:5.3,x1:6.8,z0:1.2,z1:2.85,zs:2.3,mx:6.05,mz:1.92};
  const winHalf=z=>{const hw=(WIN.x1-WIN.x0)/2; if(z<=WIN.zs)return hw; const t=(z-WIN.zs)/(WIN.z1-WIN.zs); return t>=1?-1:hw*Math.sqrt(Math.max(0,1-t*t))*(1-0.35*t);};
  const inWin=(x,z)=>z>WIN.z0&&z<WIN.z1&&Math.abs(x-WIN.mx)<winHalf(z);
  const onMullion=(x,z)=>Math.abs(x-WIN.mx)<0.035||Math.abs(z-WIN.mz)<0.035;
  const wallW=wallPaint((a,b)=>{const y=LY-a; return 0.18+0.7*sstep(8.5,11.5,y)+0.25*sstep(2,0,y)+0.15*n1(y*1.3,2);},11);
  const wallN=wallPaint((a)=>{const x=a; return 0.16+0.45*sstep(2.5,0,x)+0.3*sstep(8,9,x)+0.15*n1(x*1.5,5)-0.2*sstep(5,5.4,x)*sstep(7,6.6,x);},23,
    (f,u,v,x,y,z)=>{ if(f!=='S')return; const hw=winHalf(z), dx=Math.abs(x-WIN.mx);
      if(z>WIN.z0-0.06&&z<WIN.z1+0.06&&hw>-1&&dx<hw+0.07){ if(inWin(x,z)){ return onMullion(x,z)?(Math.abs(x-WIN.mx)<0.015||Math.abs(z-WIN.mz)<0.015?PAL.oakL:PAL.oak):SKY|0x8090a0; } return dx>hw+0.04?PAL.oakD:PAL.oak; }
      if(z>WIN.zs&&z<WIN.z1+0.1&&dx<0.07&&winHalf(z)<0.07)return PAL.oak; });
  const wallE=wallPaint((a)=>0.15+0.3*n1(a*1.2,8)+0.4*sstep(1.5,0,a),37,(f,u,v,x,y,z)=>{ if(f!=='W')return;
      if(y>8.5&&y<9.9&&z<2.35+0.25*Math.sqrt(Math.max(0,1-((y-9.2)/0.7)**2))){ const dy=y-8.5; if(y<8.56||y>9.84||z>2.3+0.25*Math.sqrt(Math.max(0,1-((y-9.2)/0.7)**2))-0.05)return PAL.oakD;
        if(Math.abs(z-0.5)<0.05||Math.abs(z-1.9)<0.05)return (Math.abs(dy-0.35)<0.3)?PAL.ironD:PAL.oakD;
        if(Math.abs(y-9.62)<0.05&&Math.abs(z-1.05)<0.06)return PAL.goldL; return shd(PAL.oak,(Math.floor(dy*TX)%7===0?0.75:0.95+0.08*hh(Math.floor(dy*TX/7),Math.floor(z*4),4))); } });
  const wallS=wallPaint((a)=>0.2+0.6*sstep(7.5,9,LX-a)*0+0.6*sstep(1.6,0,a)+0.2*n1(a,9),41);
  item('herb cottage wall, west');
  box(-0.25,-0.25,-0.45,0,LY,WH,wallW,{wallOf:'W',occ:1});
  item('herb cottage wall, north');
  box(-0.25,-0.25,-0.45,LX,0,WH,wallN,{wallOf:'N',occ:1});
  item('herb cottage wall, east');
  box(LX,-0.25,-0.45,LX+0.25,LY+0.25,WH,wallE,{wallOf:'E',occ:1});
  item('herb cottage wall, south');
  box(-0.25,LY,-0.45,LX+0.25,LY+0.25,WH,wallS,{wallOf:'S',occ:1});

  item('window sill and branch rod');
  box(WIN.x0-0.12,0,WIN.z0-0.1,WIN.x1+0.12,0.16,WIN.z0-0.02,wood(PAL.oak,{seed:5}),{wall:'N'});
  { let x=WIN.x0-0.55, z=WIN.z1+0.16; while(x<WIN.x1+0.6){ const z2=z+Math.sin(x*3.1)*0.025; box(x,0.04,z2,x+0.09,0.12,z2+0.075,(f,u,v)=>shd(PAL.bark,(v<1?1.25:0.95)*(hh(u,v,8)<0.15?0.8:1)),{wall:'N',small:1}); x+=0.085; }
    box(WIN.x1+0.25,0.05,WIN.z1+0.22,WIN.x1+0.3,0.11,WIN.z1+0.42,PAL.bark,{wall:'N',small:1});
    for(const tx of [WIN.x0+0.15,WIN.mx-0.05,WIN.x1-0.2]) box(tx,0.03,WIN.z1+0.12,tx+0.06,0.13,WIN.z1+0.28,PAL.cork,{wall:'N',small:1}); }

  item('wall shelves with jars and candles');
  function wallShelf(y0,y1,z,d){ d=d||0.28; box(0,y0,z-0.06,d,y1,z,wood(PAL.red,{seed:Math.floor(z*10)}),{wall:'W'});
    for(const yy of [y0+0.1,y1-0.16]) box(0,yy,z-0.24,0.05,yy+0.06,z-0.06,PAL.redD,{wall:'W',small:1}); }
  wallShelf(0.25,1.45,2.75); bookLying(0.04,0.33,2.75,0.24,0.78,0.09,C('#7a2a2a'),{spine:'E'}); bookLying(0.06,0.37,2.84,0.22,0.72,0.07,C('#c8b890'),{spine:'E'});
  jar(0.14,1.0,2.75,0.08,0.19,C('#b03a2a'),{wall:'W'}); jar(0.14,1.25,2.75,0.07,0.15);
  wallShelf(0.2,1.2,2.15); box(0.03,0.32,2.15,0.07,0.62,2.45,(f,u,v,W,H)=>frameArt(f,u,v,W,H,(a,b,w,h)=>((a-w/2)**2/9+(b-h/2)**2/16<1)?PAL.leafL:C('#c8b070')),{wall:'W',small:1});
  box(0.03,0.68,2.15,0.07,0.92,2.37,(f,u,v,W,H)=>frameArt(f,u,v,W,H,(a,b,w,h)=>(Math.abs(a-w/2)<1.5&&b>2)?PAL.leaf:C('#d8c890')),{wall:'W',small:1}); candle(0.15,1.05,2.15,0.16);
  wallShelf(3.85,5.1,2.3); box(0.03,4.0,2.3,0.07,4.3,2.58,(f,u,v,W,H)=>frameArt(f,u,v,W,H,(a,b)=>C('#d4b440')),{wall:'W',small:1});
  box(0.03,4.38,2.3,0.07,4.66,2.56,(f,u,v,W,H)=>frameArt(f,u,v,W,H,(a,b,w,h)=>(b>h*0.4&&Math.abs(a-w/2)<b*0.4)?PAL.leafL:C('#c8c090')),{wall:'W',small:1}); candle(0.15,4.86,2.3,0.14); candle(0.17,4.98,2.3,0.09);
  wallShelf(3.0,4.35,1.72); bookLying(0.04,3.08,1.72,0.25,3.6,0.1,C('#5a3a2a'),{spine:'E'}); jar(0.14,3.85,1.72,0.08,0.17,C('#e8e8e0')); jar(0.14,4.12,1.72,0.08,0.2,C('#b8402e'),{label:1});
  item('portrait in a red frame');
  box(0,6.78,2.72,0.06,7.45,3.5,(f,u,v,W,H)=>f!=='E'?PAL.redD:frameArt(f,u,v,W,H,(a,b,w,h)=>{ const cx=w/2; if((a-cx)**2/16+(b-h*0.33)**2/20<1)return C('#c8a888'); if(b>h*0.5&&Math.abs(a-cx)<w*0.32+(b-h*0.5)*0.4)return C('#3a2a2a'); return C('#8a7a58');}),{wall:'W'});
  item('herb garland');
  { const ys=7.85, ye=9.95; let last=null;
    for(let y=ys;y<=ye;y+=0.06){ const t=(y-ys)/(ye-ys), z=2.95-0.42*Math.sin(t*Math.PI); box(0.02,y,z,0.06,y+0.065,z+0.04,PAL.cork,{wall:'W',small:1}); }
    const hang=(y,kind)=>{ const t=(y-ys)/(ye-ys), z=2.95-0.42*Math.sin(t*Math.PI);
      box(0.03,y,z-0.18,0.05,y+0.02,z,PAL.cork,{wall:'W',small:1});
      if(kind==='bundle'){ box(0.02,y-0.06,z-0.42,0.1,y+0.08,z-0.18,(f,u,v,W,H)=>v<3?PAL.cork:shd(PAL.cream,0.9+0.15*hh(u,v,3)),{wall:'W',small:1}); box(0.02,y-0.04,z-0.5,0.09,y+0.06,z-0.42,C('#7a8a4a'),{wall:'W',small:1}); }
      if(kind==='grapes'){ for(let i=0;i<7;i++)ell(0.07,y+rr(-0.05,0.05),z-0.25-rr(0,0.18),0.035,0.035,0.035,i%2?PAL.violet:C('#5a3a8a'),{wall:'W',small:1}); }
      if(kind==='apple'){ ell(0.08,y,z-0.3,0.07,0.07,0.065,C('#b03030'),{wall:'W',small:1}); }
      if(kind==='sprig'){ for(let i=0;i<5;i++)leafE(0.06,y+rr(-0.06,0.06),z-0.2-i*0.05,0.04,0.05,0.02,PAL.leaf,{wall:'W'}); } };
    hang(8.0,'sprig'); hang(8.3,'apple'); hang(8.75,'bundle'); hang(9.15,'grapes'); hang(9.5,'bundle'); hang(9.8,'sprig'); }

  item('ivy along the walls');
  function ivyClump(x,y,z,n,wall,spread){ for(let i=0;i<n;i++){ const c=rnd()<0.35?PAL.leafL:rnd()<0.6?PAL.leaf:PAL.leafD; leafE(x+rr(-spread[0],spread[0]),y+rr(-spread[1],spread[1]),z-rr(0,spread[2]),0.09,0.09,0.04,c,{wall,solid:0}); } }
  for(let y=8.8;y<12;y+=0.35)ivyClump(0.1,y,WH-0.1,7,'W',[0.06,0.2,0.5+0.9*sstep(9,11.5,y)]);
  for(let y=0.4;y<3.2;y+=0.5)ivyClump(0.1,y,WH-0.1,5,'W',[0.06,0.2,0.4]);
  ivyClump(0.12,10.6,2.0,18,'W',[0.06,0.5,0.9]);
  for(let x=0.3;x<2.6;x+=0.4)ivyClump(x,0.1,WH-0.1,6,'N',[0.2,0.06,0.5+0.6*sstep(2.6,0.5,x)]);
  for(let x=7.6;x<9;x+=0.4)ivyClump(x,0.1,WH-0.1,5,'N',[0.2,0.06,0.4]);
  pothos(8.85,0.12,WH-0.2,2.2,[0,0.05],{wall:'N'}); pothos(8.75,0.1,WH-0.2,1.4,[-0.2,0.05],{wall:'N'});
  for(let y=1;y<12;y+=0.6)ivyClump(LX-0.1,y,WH-0.1,4,'E',[0.06,0.25,0.35]);
  for(let x=0.5;x<9;x+=0.5)ivyClump(x,LY-0.1,WH-0.1,4,'S',[0.25,0.06,0.3+0.8*sstep(2,0.3,x)]);

  item('fiddle-leaf fig');
  pot(0.75,0.78,0,0.36,0.58,PAL.terra);
  cyl(0.75,0.78,0.035,0.55,2.5,PAL.bark,{solid:0});
  for(let i=0;i<24;i++){ const a=i*2.4, h=0.95+i*0.085+rr(-0.08,0.08), d=0.18+rr(0,0.3)*(1-i/30); const big=rr(0.17,0.25);
    const c=i<6?PAL.tealD:rnd()<0.5?PAL.teal:PAL.tealL; leafE(0.75+Math.cos(a)*d,0.78+Math.sin(a)*d,h,rnd()<0.5?big:big*0.75,rnd()<0.5?big:big*0.75,0.05,c,{solid:0}); }

  item('round table with pink flowers');
  function roundTable(x,y,r,h,col){ cyl(x,y,r,h-0.07,h,wood(col,{seed:9,along:'u'}));
    cyl(x,y,r*0.98,h-0.12,h-0.07,shd(col,0.75)); cyl(x,y,0.06,0.18,h-0.12,wood(col,{seed:3}));
    for(let i=0;i<3;i++){ const a=i*2.094+0.5; for(let k=0;k<4;k++){ const d=0.08+k*0.07; box(x+Math.cos(a)*d-0.03,y+Math.sin(a)*d-0.03,0.2-k*0.05,x+Math.cos(a)*d+0.03,y+Math.sin(a)*d+0.03,0.26-k*0.04,shd(col,0.9),{small:1}); } } }
  roundTable(1.85,0.75,0.48,0.92,PAL.red);
  vase(1.7,0.6,0.92,0.08,0.3,C('#c8d8d0')); for(let i=0;i<3;i++)cyl(1.7+rr(-0.03,0.03),0.6+rr(-0.03,0.03),0.012,1.15,1.35,PAL.leaf,{small:1}); flowers(1.7,0.6,1.36,0.32,PAL.pink,PAL.pinkL,12);
  jar(2.05,0.88,0.92,0.17,0.36,C('#cfe0c8'),{lvl:0.1}); for(let i=0;i<6;i++)leafE(2.05+rr(-0.08,0.08),0.88+rr(-0.08,0.08),1.0+rr(0,0.22),0.07,0.05,0.04,PAL.leafL);
  jar(2.42,1.35,0,0.1,0.32,C('#e8e4d8')); jar(2.22,1.62,0,0.08,0.22,C('#d8d0c0'));

  item('work table with candles');
  { const x0=0.05,x1=0.98,y0=1.55,y1=4.45,h=0.98;
    box(x0,y0,h-0.08,x1,y1,h,wood(PAL.amberD,{seed:14,along:'v',gw:3}));
    box(x0+0.04,y0+0.04,h-0.2,x1-0.04,y1-0.04,h-0.08,shd(PAL.amberD,0.8));
    for(const [lx,ly] of [[x0+0.05,y0+0.05],[x1-0.12,y0+0.05],[x0+0.05,y1-0.12],[x1-0.12,y1-0.12]]) box(lx,ly,0,lx+0.07,ly+0.07,h-0.2,wood(PAL.amberD,{seed:2}));
    pot(0.5,1.98,h,0.17,0.2); fern(0.5,1.98,h+0.2,0.42,PAL.teal);
    candle(0.8,2.35,h,0.18); candle(0.66,2.52,h,0.12); candle(0.82,2.58,h,0.08);
    box(0.3,2.85,h,0.86,3.65,h+0.04,wood(C('#7a4a2a'),{seed:21}),{small:1});
    box(0.42,2.95,h+0.04,0.48,3.45,h+0.055,PAL.ironL,{small:1}); box(0.42,3.45,h+0.04,0.48,3.62,h+0.065,PAL.redD,{small:1});
    for(let i=0;i<7;i++)leafE(0.65+rr(-0.08,0.08),3.15+rr(-0.25,0.25),h+0.07,0.06,0.04,0.02,i%2?PAL.leafL:PAL.leaf);
    for(let i=0;i<5;i++)leafE(0.55+rr(-0.1,0.1),4.05+rr(-0.12,0.12),h+0.05,0.07,0.05,0.025,PAL.tealL);
    jar(0.3,4.25,h,0.07,0.16,C('#c04030'));
  }
  lamp(0.75,2.45,1.32,2.4,[1,0.62,0.3],0.85,1);

  item('books and a leaning frame');
  bookLying(0.95,4.62,0,1.45,5.05,0.1,C('#8a2a2a'),{spine:'S'}); bookLying(0.98,4.66,0.1,1.4,5.0,0.08,C('#d8c8a0'),{spine:'S'}); bookLying(1.0,4.7,0.18,1.36,4.98,0.07,C('#3a4a6a'),{spine:'S'});
  box(0.05,4.72,0,0.14,5.28,0.66,(f,u,v,W,H)=>frameArt(f,u,v,W,H,(a,b,w,h)=>{ if(Math.abs(a-w/2)<1&&b>3)return PAL.leafD; if(((a-w/2)**2+(b-h*0.4)**2)<14)return PAL.leafL; return C('#c8b888');}));

  item('red bookshelf');
  { const x0=0.05,x1=0.95,y0=6.1,y1=8.45,h=2.62,t=0.07, W_=wood(PAL.red,{seed:31}), Wd=wood(PAL.redD,{seed:32});
    box(x0,y0,0,x1,y0+t,h,W_); box(x0,y1-t,0,x1,y1,h,W_); box(x0,y0,0,0.12,y1,h,Wd);
    box(x0,y0,h-t,x1+0.04,y1,h,W_); box(x0,y0,0,x1,y1,0.14,W_);
    const shelves=[0.14,0.78,1.4,2.0];
    for(const s of shelves.slice(1)) box(0.12,y0+t,s-0.05,x1,y1-t,s,W_);
    jar(0.45,8.15,h,0.11,0.3,C('#e8e4d4')); jar(0.6,7.9,h,0.09,0.2,C('#e0dccc'));
    pumpkin(0.5,7.25,h,0.26,0.36); jar(0.45,6.45,h,0.07,0.1,C('#3a8a4a'));
    { let y=6.2; const cols=['#3a4a7a','#c8b890','#2a5a4a','#6a3a6a','#d8d0b8','#3a3a5a','#8a2a2a','#4a6a8a','#c8a050','#2a3a5a','#5a4a7a'];
      let i=0; while(y<8.2){ const w=rr(0.06,0.1), hb=rr(0.42,0.52); bookStand(0.2,y,2.0,0.82,y+w,hb,C(cols[i%cols.length]),'E'); y+=w+0.004; i++; } }
    bookStand(0.25,6.2,1.4,0.85,6.34,0.4,C('#8a2a28'),'E'); box(0.6,6.24,1.62,0.86,6.3,1.7,(f,u,v,W,H)=>C('#e8d8b0'),{small:1});
    ell(0.55,6.95,1.47,0.25,0.25,0.08,(f,u,v,W,H,x,y,z,lx,ly,lz)=>lz>0.6?C('#a8b8a0'):PAL.cream,{small:1});
    bookLying(0.3,7.4,1.4,0.85,8.1,0.08,C('#2a4a5a'),{spine:'E'}); bookLying(0.32,7.45,1.48,0.82,8.05,0.07,C('#c8c0a8'),{spine:'E'}); bookLying(0.35,7.5,1.55,0.8,8.0,0.06,C('#5a2a2a'),{spine:'E'});
    bookLying(0.36,7.6,1.61,0.76,7.9,0.06,C('#2a3a5a'),{spine:'E'});
    box(0.35,6.25,0.78,0.85,6.95,0.82,(f,u,v,W,H)=>f==='T'?(Math.abs(v-H/2)<0.8?C('#a89878'):((Math.floor(u)%3===0&&u>3&&u<W-3)?C('#b8b098'):PAL.paper)):C('#c8b898'),{small:1});
    jar(0.45,7.25,0.78,0.09,0.22,C('#e8e8e0')); jar(0.6,7.5,0.78,0.08,0.18,C('#3a8a4a'));
    bookLying(0.3,7.8,0.78,0.85,8.35,0.08,C('#3a4a5a'),{spine:'E'}); bookLying(0.33,7.85,0.86,0.8,8.3,0.07,C('#8a2a2a'),{spine:'E'});
    jar(0.5,6.45,0.14,0.09,0.2,C('#e0dccc')); jar(0.55,6.75,0.14,0.08,0.24,C('#e0e0d8'));
  }
  item('lily in a red pot');
  cyl(1.3,8.95,0.2,0,0.5,(f,u,v,W,H)=>f==='T'?PAL.soil:shd(C('#b8302a'),v<2?1.2:(Math.floor(u)%13===0?0.85:1)),{},0.24);
  for(let i=0;i<12;i++){ const a=i*0.9; const h=0.7+rr(0,0.85); leafE(1.3+Math.cos(a)*rr(0.08,0.25),8.95+Math.sin(a)*rr(0.08,0.25),h,0.09,0.09,0.22,i%3?PAL.leaf:PAL.leafL,{solid:0}); }

  item('round table with violets');
  roundTable(0.88,9.95,0.5,0.9,PAL.red);
  vase(0.72,9.8,0.9,0.07,0.2,C('#b8d0d8')); flowers(0.72,9.8,1.12,0.26,PAL.violet,PAL.violetL,10); for(let i=0;i<4;i++)leafE(0.72+rr(-0.12,0.12),9.8+rr(-0.12,0.12),1.08,0.07,0.05,0.02,PAL.leaf);
  bookLying(0.82,9.92,0.9,1.25,10.32,0.07,C('#3a5a5a'),{spine:'S'}); bookLying(0.85,9.95,0.97,1.22,10.28,0.06,C('#8a2a3a'),{spine:'S'}); bookLying(0.87,9.97,1.03,1.2,10.26,0.06,C('#2a4a3a'),{spine:'S'});
  box(0.9,10.0,1.09,1.18,10.24,1.1,PAL.paper,{small:1});
  jar(1.5,10.45,0,0.19,0.46,C('#c8dcc0'),{lvl:0.05}); for(let i=0;i<8;i++)leafE(1.5+rr(-0.1,0.1),10.45+rr(-0.1,0.1),0.12+rr(0,0.3),0.07,0.06,0.04,i%2?PAL.leafL:PAL.leaf);
  pot(1.85,10.85,0,0.16,0.18,C('#e8e4dc')); for(let i=0;i<8;i++)leafE(1.85+rr(-0.12,0.12),10.85+rr(-0.12,0.12),0.25+rr(0,0.18),0.08,0.08,0.04,PAL.leafL);

  item('tree stump with pumpkins');
  cyl(0.95,11.2,0.82,0,1.25,(f,u,v,W,H)=>{ if(f==='T'){ const d=Math.hypot(u-W/2,v-H/2); if(d>W/2-2)return PAL.barkD; return shd(PAL.ring,(Math.floor(d/2.5)%2?0.86:1)*(hh(u,v,4)<0.05?0.85:1)); }
    const ridge=Math.floor(u/3); return shd(PAL.bark,(ridge%2?0.82:1)*(0.9+0.15*hh(ridge,Math.floor(v/6),2))*(v<1.5?1.15:1)); },{},0.7);
  for(let i=0;i<6;i++){ const a=i*1.05+0.3; ell(0.95+Math.cos(a)*0.8,11.2+Math.sin(a)*0.8,0.08,0.32,0.32,0.14,(f,u,v)=>shd(PAL.bark,0.9+0.15*hh(u>>2,v,3)),{}); }
  pumpkin(0.8,11.05,1.25,0.32,0.4); pumpkin(1.2,11.45,1.25,0.26,0.32); pumpkin(1.05,10.75,1.25,0.16,0.18);
  for(let i=0;i<10;i++)leafE(0.95+rr(-0.5,0.5),11.2+rr(-0.5,0.5),1.3+rr(0,0.15),0.12,0.12,0.04,i%2?PAL.leaf:PAL.leafL);
  candle(1.45,10.95,1.25,0.2); candle(1.55,11.1,1.25,0.12);
  lamp(1.5,11.0,1.6,2.4,[1,0.62,0.3],0.85,1);

  item('long table on tree roots');
  { const x0=1.9,x1=3.1,y0=3.9,y1=8.8,h=0.9;
    box(x0,y0,h-0.13,x1,y1,h,(f,u,v,W,H,x,y,z)=>{ let k=0.95+0.08*hh(Math.floor(u/12),0,7);
        if(f==='T'){ if(Math.floor(u)%11===0)k*=0.72; if(hh(Math.floor(u/3),Math.floor(v/9),8)<0.07)k*=0.8; k*=0.95+0.05*Math.sin(v*0.15+u*0.4); if(u<1||v<1)k*=1.15; if(u>W-1||v>H-1)k*=0.8; return shd(PAL.table,k*1.05); }
        return shd(PAL.tableD,(v<1.2?1.3:1)*(0.9+0.1*hh(u>>1,v,2))); });
    for(const ly of [4.8,7.9]){ cyl(2.5,ly,0.36,0,h-0.13,(f,u,v,W,H)=>shd(PAL.bark,(Math.floor(u/3)%2?0.82:1)*(0.9+0.12*hh(u>>2,v>>3,5))),{},0.26);
      for(let i=0;i<5;i++){ const a=i*1.26+0.4; ell(2.5+Math.cos(a)*0.45,ly+Math.sin(a)*0.45,0.07,0.26,0.26,0.1,(f,u,v)=>shd(PAL.bark,0.85+0.2*hh(u>>2,v,4)),{}); } }
    cyl(2.45,4.3,0.11,h,h+0.04,C('#3a8a6a')); cyl(2.45,4.3,0.03,h+0.04,h+0.45,(f,u,v)=>shd(C('#4aa07a'),(Math.floor(v/4)%2?0.85:1.05)));
    ell(2.45,4.3,h+0.2,0.07,0.07,0.07,C('#3a8a6a'));
    const L1=lamp(2.45,4.3,h+0.55,3.8,[1,0.82,0.55],1.25,0);
    cyl(2.45,4.3,0.26,h+0.42,h+0.72,(f,u,v,W,H)=>GLOW|shd(C('#e8e0c0'),(Math.floor(u/4)%2?0.92:1)*(v>H-1.5?0.85:1)),{lr:L1,small:1},0.13);
    candle(2.72,4.75,h,0.2); candle(2.56,4.9,h,0.14); candle(2.82,5.0,h,0.1); candle(2.66,5.08,h,0.07);
    lamp(2.7,4.9,h+0.32,2.4,[1,0.62,0.3],0.85,1);
    for(const [bx,by] of [[2.3,7.55],[2.52,7.85],[2.75,7.4]]) cyl(bx,by,0.07,h,h+0.05,(f,u,v,W,H)=>f==='T'?(Math.hypot(u-W/2,v-H/2)<2?C('#c04a2a'):PAL.cream):PAL.cream,{small:1},0.09);
    fern(3.25,5.15,0,0.32,PAL.leafL); fern(3.3,7.6,0,0.36,PAL.leaf); fern(1.75,6.0,0,0.25,PAL.teal);
  }

  item('round purple rug',{flat:1});
