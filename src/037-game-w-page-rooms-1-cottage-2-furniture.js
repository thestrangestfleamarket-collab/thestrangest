  cyl(2.55,2.15,0.95,0,0.015,(f,u,v,W,H)=>{ const d=Math.hypot(u-W/2,v-H/2)/(W/2); return shd(d>0.9?PAL.purpleD:PAL.purple,0.95+0.08*hh(u,v,3)); },{solid:0,occ:0});
  item('patterned rug, purple and gold',{flat:1});
  box(3.5,2.1,0,7.3,5.3,0.02,(f,u,v,W,H)=>{ if(f!=='T')return PAL.purpleD;
    if(u<3||u>W-3){ return (Math.floor(v)%2)?((u<1||u>W-1)?-1:C('#9a8c70')):-1; }
    const a=u-3,b=v,Wi=W-6,Hi=H; const ex=Math.min(a,Wi-a,b,Hi-b);
    if(ex<2)return PAL.purpleD; if(ex<4)return ((Math.floor(a/2)+Math.floor(b/2))%2)?PAL.gold:PAL.purpleD; if(ex<5)return PAL.purpleD;
    const cx=Wi/2,cy=Hi/2, ax=Math.abs(a-cx)/cx, by=Math.abs(b-cy)/cy, arm=Math.min(ax,by)<0.1?0.1:Math.min(ax,by)<0.2?0.05:0, dm=Math.max(ax,by)-arm;
    if(dm<0.16)return ((Math.floor(a/2)+Math.floor(b/2))%3===0)?C('#5a4458'):C('#8a7a88');
    if(dm<0.2)return PAL.purpleD;
    if(dm<0.46){ if((Math.floor(a)%5===2)&&(Math.floor(b)%5===2))return PAL.purpleD; return shd(PAL.gold,0.95+0.1*hh(a>>1,b>>1,3)); }
    if(dm<0.5)return C('#5a3a22');
    if(((Math.floor(a)+Math.floor(b))%7===0)&&((Math.floor(a)-Math.floor(b))%7===0))return PAL.goldL;
    return shd(PAL.purple,0.95+0.07*hh(a>>1,b>>1,6)); },{solid:0,occ:0});
  item('purple doormat',{flat:1});
  box(5.6,6.1,0,7.05,6.85,0.018,(f,u,v,W,H)=>{ if(u<2||u>W-2)return Math.floor(v)%2?C('#a89880'):C('#6a5a4a'); return shd(C('#5a3a4a'),(v<2||v>H-2)?0.8:0.95+0.08*hh(u,v>>1,4)); },{solid:0,occ:0});

  item('apothecary cabinet');
  { const x0=2.7,x1=4.5,y0=0.05,y1=0.95,h=3.0, Wc=wood(PAL.oak,{seed:41}), Wd=wood(PAL.oakD,{seed:42});
    for(const fx of [x0+0.1,x1-0.18]) box(fx,y1-0.18,0,fx+0.08,y1-0.08,0.12,PAL.oakD,{small:1});
    box(x0,y0,0.12,x1,y1,1.2,(f,u,v,W,H)=>{ if(f!=='S')return Wc(f,u,v,W,H);
        const half=W/2, a=u<half?u:u-half; if(u<1.2||Math.abs(u-half)<0.6||u>W-1.2||v<1.2||v>H-1.2)return PAL.oakD;
        if(a>4&&a<half-4&&v>4&&v<H-4){ const inner=(a<6||a>half-6||v<6||v>H-6); if(inner)return shd(PAL.oak,0.82); if(Math.abs(a-(u<half?half-8:8))<1&&Math.abs(v-H/2)<5)return PAL.goldL; return shd(PAL.oak,1.05+0.05*hh(Math.floor(a),Math.floor(v/5),3)); }
        return Wc(f,u,v,W,H); });
    box(x0,y0,1.2,x0+0.08,y1,h,Wc); box(x1-0.08,y0,1.2,x1,y1,h,Wc); box(x0,y0,1.2,x1,y0+0.06,h,Wd);
    box(x0-0.05,y0,h-0.1,x1+0.05,y1+0.05,h,Wc);
    for(const s of [1.2,1.75,2.32]) box(x0+0.08,y0+0.06,s,x1-0.08,y1-0.04,s+0.05,Wc);
    jar(3.05,0.5,1.25,0.09,0.18,C('#b03a2a'),{label:1}); jar(3.35,0.5,1.25,0.08,0.15,C('#e8e8e0')); candle(3.75,0.6,1.25,0.16); candle(3.92,0.55,1.25,0.1); jar(4.2,0.5,1.25,0.07,0.12,C('#3a8a4a'));
    { let x=2.95; const cols=['#5a3a7a','#3a3a6a','#7a5a9a','#2a2a5a','#6a4a8a','#4a4a7a','#8a7aa8']; let i=0; while(x<3.9){ const w=rr(0.06,0.09); bookStand(x,0.3,1.8,x+w,0.85,rr(0.36,0.46),C(cols[i%cols.length]),'S'); x+=w; i++; } }
    jar(4.15,0.55,1.8,0.08,0.2,C('#e0dccc'));
    candle(3.0,0.6,2.37,0.2); candle(3.15,0.55,2.37,0.13); pot(3.8,0.55,2.37,0.13,0.14); fern(3.8,0.55,2.51,0.28,PAL.teal);
    box(x0+0.1,y0+0.1,h,x1-0.4,y1-0.04,h+0.02,PAL.purple,{small:1}); box(x0+0.1,y1-0.06,h-0.25,x1-0.4,y1-0.02,h,PAL.purpleD,{small:1});
    vase(3.9,0.45,h,0.07,0.22,C('#4a8a9a')); flowers(3.9,0.45,h+0.26,0.25,PAL.violet,PAL.violetL,10);
    ell(3.45,0.5,h+0.12,0.13,0.13,0.11,C('#3a6a4a'),{small:1}); ell(3.45,0.5,h+0.24,0.05,0.05,0.03,C('#4a7a5a'),{small:1}); box(3.55,0.47,h+0.1,3.65,0.53,h+0.15,C('#3a6a4a'),{small:1});
    candle(2.92,0.45,h,0.22); candle(3.05,0.6,h,0.14);
    lamp(3.0,0.6,h+0.35,2.2,[1,0.62,0.3],0.75,1); lamp(3.85,0.65,1.5,1.6,[1,0.62,0.3],0.6,1);
    pothos(4.55,0.4,h,1.6,[0.15,0.05],{solid:0});
  }

  item('writing desk with a pink lamp');
  { const x0=5.45,x1=7.55,y0=0.05,y1=1.05,h=1.1, Wr=wood(PAL.red,{seed:51,along:'u'});
    box(x0,y0,h-0.07,x1,y1,h,Wr); box(x0+0.05,y0+0.05,h-0.25,x1-0.05,y1-0.03,h-0.07,(f,u,v,W,H)=>{ if(f==='S'&&v>2&&v<H-2&&Math.abs(u-W/2)<W*0.3){ if(Math.abs(u-W/2)<1.5&&Math.abs(v-H/2)<1)return PAL.goldL; return shd(PAL.red,(u-W*0.2<1.2||W*0.8-u<1.2)?0.7:1.05); } return shd(PAL.redD,1);});
    for(const [lx,ly] of [[x0+0.05,y0+0.05],[x1-0.12,y0+0.05],[x0+0.05,y1-0.12],[x1-0.12,y1-0.12]]) box(lx,ly,0,lx+0.07,ly+0.07,h-0.25,wood(PAL.red,{seed:3}));
    bookLying(5.55,0.35,h,5.95,0.85,0.1,C('#a83a3a'),{spine:'S'}); bookLying(5.58,0.38,h+0.1,5.92,0.82,0.08,C('#d8c8a8'),{spine:'S'}); bookLying(5.6,0.4,h+0.18,5.9,0.8,0.08,C('#8a2a2a'),{spine:'S'});
    candle(5.75,0.6,h+0.26,0.18);
    lamp(5.75,0.62,h+0.6,2.3,[1,0.62,0.3],0.8,1);
    ell(6.25,0.4,h+0.12,0.13,0.13,0.12,C('#3a6a5a'),{small:1}); ell(6.25,0.4,h+0.25,0.05,0.05,0.03,C('#4a8a6a'),{small:1}); box(6.36,0.37,h+0.12,6.48,0.43,h+0.18,C('#3a6a5a'),{small:1});
    box(6.0,0.55,h,6.75,1.0,h+0.03,(f,u,v,W,H)=>f==='T'?(Math.abs(u-W/2)<0.8?C('#a89878'):((Math.floor(v)%3===0&&v>3&&v<H-3&&u%(W/2)>3&&u%(W/2)<W/2-3)?C('#8a8070'):PAL.paper)):C('#c8b898'),{small:1});
    box(6.6,0.62,h+0.03,6.95,0.95,h+0.035,(f,u,v,W,H)=>(Math.floor(v)%3===0&&u>2&&u<W-2)?C('#9a9080'):C('#f0ead8'),{small:1});
    cyl(7.25,0.5,0.1,h,h+0.04,C('#c86a6a')); cyl(7.25,0.5,0.03,h+0.04,h+0.36,C('#d88a8a'));
    const L0=lamp(7.25,0.5,h+0.5,3.4,[1,0.58,0.52],1.1,0);
    cyl(7.25,0.5,0.22,h+0.32,h+0.56,(f,u,v,W,H)=>GLOW|shd(C('#e8a0a0'),(Math.floor(u/4)%2?0.9:1)*(v>H-1.5?0.85:1)),{lr:L0,small:1},0.1);
    bookLying(6.2,0.25,0,6.75,0.75,0.1,C('#3a5a7a'),{spine:'S'}); bookLying(6.22,0.28,0.1,6.72,0.72,0.09,C('#d8d0b8'),{spine:'S'}); bookLying(6.25,0.3,0.19,6.7,0.7,0.09,C('#8a3a3a'),{spine:'S'}); bookLying(6.28,0.32,0.28,6.68,0.68,0.08,C('#2a3a5a'),{spine:'S'});
  }

  item('wood stove');
  { const x0=7.75,x1=8.75,y0=0.3,y1=1.2;
    const STOVE_L=lamp(8.25,1.45,0.6,4.2,[1,0.45,0.16],1.5,2);
    self.fireLamp=STOVE_L;
  for(const [lx,ly] of [[x0+0.05,y0+0.05],[x1-0.15,y0+0.05],[x0+0.05,y1-0.15],[x1-0.15,y1-0.15]]) box(lx,ly,0,lx+0.1,ly+0.1,0.28,PAL.ironD,{});
    box(x0-0.05,y0-0.05,0.25,x1+0.05,y1+0.05,0.33,PAL.iron);
    box(x0,y0,0.33,x1,y1,1.0,(f,u,v,W,H,x,y,z)=>{ let c=PAL.iron; if(u<1.2||v<1.2)c=PAL.ironL; else if(u>W-1.2||v>H-1.2)c=PAL.ironD;
        if(f==='S'){
          const half=W/2,a=u<half?u:u-half; if(a>2&&a<half-2&&v>3&&v<H-3){ if(a<3||a>half-3||v<4||v>H-4)return PAL.ironL;
            if(v>H*0.45&&v<H-6&&(Math.floor(a)%3!==0))return FIRE|0;  return shd(PAL.iron,0.85); }
          if(Math.abs(u-half)<0.6)return PAL.ironD; }
        if(hh(u,v,4)<0.05)c=shd(c,0.85); return c; },{lr:STOVE_L,fire:1});
    cyl(8.25,0.75,0.5,1.0,1.18,(f,u,v,W,H)=>f==='T'?shd(PAL.iron,Math.hypot(u-W/2,v-H/2)<4?0.7:1.05):shd(PAL.iron,v<1.2?1.2:1),{},0.42);
    cyl(8.25,0.75,0.2,1.18,1.25,PAL.ironL);
    cyl(8.25,0.55,0.12,1.25,2.75,(f,u,v)=>shd(PAL.iron,(Math.floor(v)%14===0?0.7:1)*(((u%12)<2)?1.25:1)));
    box(8.13,0.0,2.62,8.37,0.55,2.86,PAL.iron,{small:1}); box(8.1,0.0,2.6,8.4,0.08,2.88,PAL.ironD,{small:1});
  }

  item('potted fern');
  pot(8.55,2.95,0,0.22,0.3,PAL.terra); fern(8.55,2.95,0.3,0.45,PAL.teal);
  item('low chest with candles');
  { const x0=7.9,x1=8.75,y0=4.2,y1=6.4,h=1.0, Wa=wood(PAL.amber,{seed:61,along:'u'});
    for(const [lx,ly] of [[x0,y0],[x1-0.08,y0],[x0,y1-0.08],[x1-0.08,y1-0.08]]) box(lx,ly,0,lx+0.08,ly+0.08,0.12,PAL.amberD,{small:1});
    box(x0,y0,0.12,x1,y1,h-0.06,(f,u,v,W,H)=>{ if(f==='E'){ if(v<1.5||v>H-1.5||u<1.5||u>W-1.5)return PAL.amberD; if(v>3&&v<H-3&&u>3&&u<W-3){ if(u<4||u>W-4||v<4||v>H-4)return shd(PAL.amber,0.78); if(Math.abs(u-W/2)<1&&Math.abs(v-7)<1.5)return PAL.goldL; return shd(PAL.amber,1.05+0.05*hh(Math.floor(u/6),Math.floor(v),3)); } } return Wa(f,u,v,W,H); });
    box(x0-0.03,y0-0.03,h-0.06,x1+0.03,y1+0.03,h,wood(PAL.amberL,{seed:62,along:'v'}));
    bookLying(8.15,5.35,h,8.65,5.95,0.08,C('#a83a3a'),{spine:'E'}); bookLying(8.18,5.4,h+0.08,8.6,5.9,0.07,C('#e0d4b8'),{spine:'E'});
    candle(8.4,5.65,h+0.15,0.2); candle(8.3,4.8,h,0.18); candle(8.45,4.95,h,0.12); candle(8.25,5.05,h,0.08);
    lamp(8.35,5.1,h+0.4,2.5,[1,0.62,0.3],0.85,1);
    pothos(8.0,4.45,h+0.05,1.1,[-0.25,0.08],{solid:0}); for(let i=0;i<8;i++)leafE(8.05+rr(-0.1,0.15),4.45+rr(-0.15,0.2),h+0.05,0.09,0.09,0.04,i%2?PAL.leafL:PAL.leaf);
  }

  item('little table with jars');
  { const x0=3.3,x1=4.8,y0=11.0,y1=11.8,h=0.85;
    box(x0,y0,h-0.07,x1,y1,h,wood(PAL.red,{seed:71,along:'u'})); box(x0+0.04,y0+0.04,h-0.18,x1-0.04,y1-0.04,h-0.07,PAL.redD);
    for(const [lx,ly] of [[x0+0.04,y0+0.04],[x1-0.11,y0+0.04],[x0+0.04,y1-0.11],[x1-0.11,y1-0.11]]) box(lx,ly,0,lx+0.07,ly+0.07,h-0.18,wood(PAL.red,{seed:4}));
    jar(3.5,11.25,h,0.09,0.32,C('#c84a3a')); jar(3.7,11.2,h,0.1,0.36,C('#e8e8e0')); jar(3.62,11.5,h,0.08,0.24,C('#e0dccc'),{label:1}); jar(3.88,11.55,h,0.07,0.15,C('#d0ccbc'));
    pot(4.3,11.3,h,0.16,0.18); fern(4.3,11.3,h+0.18,0.38,PAL.teal);
    candle(4.55,11.65,h,0.16); candle(4.65,11.55,h,0.1);
    lamp(4.6,11.6,h+0.35,2.3,[1,0.62,0.3],0.8,1);
  }
  item('lilac in a pot');
  pot(5.35,11.45,0,0.2,0.32,C('#d0c8b0')); for(let i=0;i<6;i++)cyl(5.35+rr(-0.1,0.1),11.45+rr(-0.1,0.1),0.012,0.3,0.75,PAL.leafD,{small:1});
  for(let i=0;i<4;i++){ const cx=5.35+rr(-0.18,0.18),cy=11.45+rr(-0.18,0.18),cz=rr(0.75,1.05); for(let k=0;k<7;k++)ell(cx+rr(-0.06,0.06),cy+rr(-0.06,0.06),cz+k*0.03-0.1,0.07-k*0.006,0.07-k*0.006,0.06,(f,u,v,W,H,x,y,z,lx,ly,lz)=>lz>0.2?PAL.lilacL:PAL.lilac,{small:1}); }
  for(let i=0;i<6;i++)leafE(5.35+rr(-0.25,0.25),11.45+rr(-0.25,0.25),0.4+rr(0,0.3),0.08,0.06,0.03,PAL.leaf);
  jar(4.95,11.75,0,0.12,0.22,C('#e8e4dc'));
  item('folding screen');
  { const panels=[[6.1,6.75,11.32],[6.78,7.43,11.44],[7.46,8.11,11.32]];
    for(const [a,b,y] of panels) box(a,y,0.05,b,y+0.06,2.1,(f,u,v,W,H,x,yy,z)=>{ const top=2.1-0.18*Math.sqrt(Math.max(0,1-((x-(a+b)/2)/((b-a)/2))**2)); if(z>2.1-0.18+ (0.18-(2.1-top)) && z>top)return -1;
        if(f==='T')return PAL.oakD; if(u<2.5||u>W-2.5||v>H-3||z>top-0.08||Math.abs(z-0.5)<0.04)return (u<1||v<1)?PAL.oakL:shd(PAL.oak,0.85);
        if(z<0.5)return shd(PAL.oak,0.75); const q=hh(Math.floor(u/4),Math.floor(v/4),9); const flo=((u%8)-4)**2+((v%8)-4)**2<5;
        if(flo&&q<0.25)return C('#6a4a8a'); if(flo&&q<0.45)return C('#2a5a5a'); if(Math.abs((u+v*0.6)%9-4)<0.5)return C('#2a3a5a'); return shd(C('#1e2240'),0.9+0.15*hh(u>>1,v>>1,3)); },{});
    for(const [a,b,y] of panels){ box(a+0.04,y-0.02,0,a+0.1,y+0.08,0.06,PAL.oakD,{small:1}); box(b-0.1,y-0.02,0,b-0.04,y+0.08,0.06,PAL.oakD,{small:1}); }
  }

  item('door step, cottage');
  box(LX-0.05,8.45,0,LX,9.95,0.05,PAL.oakD,{wall:'E',small:1});
  item('shelf with a candle and jars');
  box(LX-0.3,6.5,1.9,LX,7.6,1.96,wood(PAL.red,{seed:81}),{wall:'E'}); candle(LX-0.15,6.75,1.96,0.15); jar(LX-0.15,7.1,1.96,0.08,0.2,C('#b8402e')); jar(LX-0.15,7.35,1.96,0.07,0.14);
  item('cottage wall clock');
  wallClock(3.0,2.6,PAL.oak,PAL.oakD,PAL.ironD);
  item('shelf with jars and a candle');
  box(LX*0.62,LY-0.3,1.85,LX*0.62+1.2,LY,1.91,wood(PAL.red,{seed:91}),{wall:'S'}); jar(LX*0.62+0.2,LY-0.15,1.91,0.08,0.22,C('#3a8a4a')); jar(LX*0.62+0.45,LY-0.15,1.91,0.09,0.18,C('#e8e4d8')); candle(LX*0.62+0.85,LY-0.15,1.91,0.16);
  item('framed flower print');
  box(1.6,LY-0.05,1.6,2.3,LY,2.4,(f,u,v,W,H)=>frameArt(f,u,v,W,H,(a,b,w,h)=>{ if(Math.abs(a-w/2)<0.8&&b>h*0.3)return PAL.leafD; if(((a-w/2)**2/30+(b-h*0.35)**2/14)<1)return C('#a84a5a'); return C('#d8cca8');}),{wall:'S'});


  drapes('green drapes','N',WIN.z1+0.18,[[WIN.x0-0.45,WIN.x0+0.55,1.75,1.0],[WIN.x0+0.55,WIN.x1-0.35,0.75,0.35],[WIN.x1-0.4,WIN.x1+0.5,1.55,0.9]],[PAL.drapeL,PAL.drape,PAL.drapeD],[0.03,0.07],4242);
  const BEADS=[{y:2.45,len:1.25,cols:['#8a6a4a','#e8e4d0','#3a9a4a','#e8e4d0','#8a6a4a']},{y:2.68,len:1.55,cols:['#e8e4d0','#b08a5a','#e8e4d0','#b08a5a','#e8e4d0','#8a6a4a']},{y:2.92,len:1.35,cols:['#e8e4d0','#3a5ab0','#e8e4d0','#6a5a9a','#e8e4d0']},{y:3.15,len:1.6,cols:['#b08a5a','#e8e4d0','#8a6a4a','#e8e4d0','#6a4a8a','#5a3a7a']}];
  beads('bead strings',WH-0.05,BEADS);
  CAT_DEPTS.push(['cottage','Herb Cottage']);
  const info=(no,name,price,desc,mat)=>({no,name,price,desc,mat});
  { const {item,box,C,shd,hh}=PGK, LX=9, LY=12, WH=3.8, N=6, RISE=2.0, SX=LX/2/N, DZ=RISE/N, OV=0.45;
    const TILE=C('#b0583a'), TILED=C('#7e3a24'), TILEL=C('#c86f4a'), PLAS=C('#55602f'), PLASD=C('#434d24'), OAK=C('#7a4520'), OAKD=C('#55301a');
    const tiles=(f,u,v,W,H,x,y,z)=>{ if(f==='T'){ const cr=Math.floor(x*3), t=y*2+(cr%2)*0.5, fx=x*3-cr, ft=t-Math.floor(t); if(fx<0.14||ft<0.1)return TILED; return shd(hh(cr,Math.floor(t),19)<0.15?TILEL:TILE,0.9+0.14*hh(cr,Math.floor(t),23)); }
      if(f==='N'||f==='S')return shd(z>WH+RISE-DZ*1.5?TILED:PLAS,0.92+0.1*hh(Math.floor(x*4),Math.floor(z*6),29));
      return shd(TILED,(Math.floor(y*2)%2?0.9:1)); };
    item('herb cottage roof');
    box(-OV,-OV,WH-0.25,0.08,LY+OV,WH+0.05,OAK); box(LX-0.08,-OV,WH-0.25,LX+OV,LY+OV,WH+0.05,OAK);
    for(let i=0;i<N;i++){ const o=i?0:OV; box(i*SX-o,-OV,WH+i*DZ,LX-i*SX+o,LY+OV,WH+(i+1)*DZ,tiles); }
    box(LX/2-0.18,-OV-0.1,WH+RISE,LX/2+0.18,LY+OV+0.1,WH+RISE+0.22,(f)=>f==='T'?OAK:OAKD); }
  PGK.register('cottage',{
    'herb cottage floor':info('HC-101','Herb cottage floor',900,"Worn dark planks, the whole room's floor.",'oak'),
    'herb cottage wall, west':info('HC-102','Herb cottage wall, west',1200,'Damp plaster under ivy, a wooden trim along the top.','plaster, ivy'),
    'herb cottage wall, north':info('HC-103','Herb cottage wall, north',1100,'Plaster and ivy with the arched window in it.','plaster, ivy, glass'),
    'herb cottage wall, east':info('HC-104','Herb cottage wall, east',900,'Plaster and ivy with the round-topped door in it.','plaster, oak'),
    'herb cottage wall, south':info('HC-105','Herb cottage wall, south',900,'Plaster with ivy at one end.','plaster, ivy'),
    'window sill and branch rod':info('HC-106','Window sill and branch rod',45,'A sill under the window and a crooked branch for the drapes.','oak, branch'),
    'green drapes':info('HC-107','Green drapes',55,'Ragged green drapes. They stir.','linen'),
    'wall shelves with jars and candles':info('HC-108','Wall shelves with jars and candles',180,'Four little shelves of books, jars, frames and candles.','cherry, glass, wax'),
    'bead strings':info('HC-109','Bead strings',30,'Strings of glass and wooden beads. They swing.','glass, wood, twine'),
    'portrait in a red frame':info('HC-110','Portrait in a red frame',60,"Somebody's grandmother, probably.",'cherry, canvas'),
    'herb garland':info('HC-111','Herb garland',25,'Twine with drying bundles, grapes and an apple.','twine, herbs'),
    'ivy along the walls':info('HC-112','Ivy along the walls',40,'Ivy along the wall tops, thick at one end.','ivy'),
    'fiddle-leaf fig':info('HC-113','Fiddle-leaf fig',85,'A tall fig with big teal leaves.','clay, leaves'),
    'round table with pink flowers':info('HC-114','Round table with pink flowers',160,'A red pedestal table: pink flowers, a jar with a plant in it, two jars below.','cherry, glass'),
    'work table with candles':info('HC-115','Work table with candles',260,'Cutting board, knife, herbs, a fern and three candles.','oak, wax, steel'),
    'books and a leaning frame':info('HC-116','Books and a leaning frame',30,'Three books on the floor and a botanical print against the wall.','paper'),
    'red bookshelf':info('HC-117','Red bookshelf',420,'Four shelves of books, jars and a bowl, a pumpkin on top.','cherry, paper, glass'),
    'lily in a red pot':info('HC-118','Lily in a red pot',35,'Tall leaves in a red pot.','clay, leaves'),
    'round table with violets':info('HC-119','Round table with violets',150,'Violets in a vase and a stack of books.','cherry, glass, paper'),
    'tree stump with pumpkins':info('HC-120','Tree stump with pumpkins',120,'A stump with its roots, three pumpkins and two candles.','oak, pumpkin, wax'),
    'long table on tree roots':info('HC-121','Long table on tree roots',780,'A long rough plank on two root stumps: a cream lamp, candles, bowls, ferns at its feet.','oak, wax, ceramic'),
    'round purple rug':info('HC-122','Round purple rug',90,'A round rug in plum.','wool'),
    'patterned rug, purple and gold':info('HC-123','Patterned rug, purple and gold',340,'A wool rug with a gold medallion and fringed ends.','wool'),
    'purple doormat':info('HC-124','Purple doormat',25,'A small fringed mat.','wool'),
    'apothecary cabinet':info('HC-125','Apothecary cabinet',640,'Oak cupboard and open shelves: jars, purple books, candles, violets and a teapot on top.','oak, glass, wax'),
    'writing desk with a pink lamp':info('HC-126','Writing desk with a pink lamp',380,'An open book, a green kettle, books and a pink lamp.','cherry, paper, glass'),
    'wood stove':info('HC-127','Wood stove',900,'Cast iron on short legs, its pipe into the wall, a fire in its grate.','cast iron'),
    'potted fern':info('HC-128','Potted fern',30,'A fern in a clay pot.','clay, fern'),
    'low chest with candles':info('HC-129','Low chest with candles',300,'An amber chest: books, candles, a pothos spilling over.','pine, wax'),
    'little table with jars':info('HC-130','Little table with jars',140,'Jars of this and that, a fern and two candles.','cherry, glass, wax'),
    'lilac in a pot':info('HC-131','Lilac in a pot',40,'Purple lilac in a cream pot, a jar beside it.','clay, lilac'),
    'folding screen':info('HC-132','Folding screen',260,'Three arched panels, dark blue with flowers.','oak, lacquer'),
    'door step, cottage':info('HC-133','Door step, cottage',10,'A worn sill at the door.','oak'),
    'shelf with a candle and jars':info('HC-134','Shelf with a candle and jars',60,'A small red shelf, a candle and two jars.','cherry, glass'),
    'cottage wall clock':info('HC-135','Cottage wall clock',45,'A round clock in a wooden rim.','oak, enamel'),
    'shelf with jars and a candle':info('HC-136','Shelf with jars and a candle',60,'A red shelf, two jars and a candle.','cherry, glass'),
    'framed flower print':info('HC-137','Framed flower print',30,'A red flower, framed.','paper'),
    'herb cottage roof':info('HC-138','Herb cottage roof',120,'A pitched roof of clay tiles over oak eaves.','clay, oak')});
  PRESETS['Preset Herb Cottage 1']=PGK.roomPieces('cottage').map(([k,x,y])=>[k,+x.toFixed(3),+y.toFixed(3),0]); })();

STOREK.cottage={PGK};
}

{
