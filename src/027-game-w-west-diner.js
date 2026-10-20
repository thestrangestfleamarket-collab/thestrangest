{
{
const {FP,H,S,art,F3,txt,pcVn,pcLathe,lit,tone,box,disc,DP,T3,fb,pb,edge,pic,round,BZ,BT,BD,BO,PL,panel,topCol,glassesRow,barStraight,barRound,barCorner,BOTS,leather,sofa,armchair,rug,LEAF,leavesArt,plant,exitSign,blinds,POSTERS,poster,cupboard,up}=barKit(onBar);
 
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  const DZ=(()=>{ const b=LBLD.find(b=>b.id==='ldiner'); return b?b.h-4-126:0; })();

  
  
  
  
  function onBar(k,x,x1,y0,y1,bs){ '@later'; const z=BZ+BT, m=(x+x1)/2, yc=(y0+y1)/2+.1;
    if(k===0){ bs.push(fb(m-.5,yc-.04,m-.5+.22,yc+.04,z,z+9,[240,200,60],(s,a,row)=>row<2?[60,60,60]:((a+row)>>2)&1?[240,200,60]:[220,70,50],[60,60,60]),
        fb(m-.15,yc-.08,m+.08,yc+.08,z,z+7,DP.red,(s,a,row)=>row<1?DP.redD:(s==='py'||s==='ny')&&row>3&&row<10?DP.white:DP.red,DP.white),
        pb(m+.2,yc-.06,m+.42,yc+.06,z,z+2,DP.chromeD),pb(m+.22,yc-.04,m+.27,yc+.01,z+2,z+8,[180,40,30],{nb:1}),pb(m+.3,yc-.04,m+.35,yc+.01,z+2,z+8,[220,180,60],{nb:1}),pb(m+.36,yc-.02,m+.41,yc+.03,z+2,z+7,[60,40,30],{nb:1}));
      bs.push(fb(m+.5,y0+.18,m+.85,y0+.5,z,z+.5,[40,40,40],(s,a,row)=>[40,40,40],(X,Y)=>((Math.floor(X*S/3)+Math.floor(Y*S/3))&1)?[34,34,34]:[70,70,70])); }
    if(k===1){ bs.push(fb(m-.3,yc-.04,m-.22,yc+.04,z,z+6,[200,40,40],(s,a,row)=>row<1?DP.chromeL:row>4&&row<8?DP.white:[200,40,40],DP.chrome,{nb:1}),
        pb(m-.18,yc-.04,m-.1,yc+.04,z,z+6,[160,40,44],{nb:1,top:()=>DP.chromeL}),fb(m-.05,yc-.12,m+.22,yc+.1,z,z+1.5,DP.white,()=>DP.whiteD,(X,Y)=>hash(Math.floor(X*S),Math.floor(Y*S),76)<.2?DP.whiteD:DP.white),
        pb(m+.42,yc,m+.5,yc+.08,z,z+5,[210,226,214],{nb:1,top:()=>[200,170,90]})); }
    if(k===2){ bs.push(pb(m+.2,yc-.02,m+.28,yc+.06,z,z+5,[210,226,214],{nb:1,top:()=>[236,240,236]}),pb(m+.12,yc-.08,m+.36,yc+.12,z,z+.5,[230,226,212])); } }
  
  
  

  
  function backBar(x,y,L){ PNAME='back bar'; const y1=y+.62, bs=[], z=26, sx=x+.45, sw=1;
    bs.push(fb(x,y,x+L,y1,0,z-2,DP.wood,(s,a,row,Lf,h)=>{ const c=a%(S*.8|0); if(row<3)return DP.woodD; if(row>h-6)return DP.woodK; if(c<2)return DP.woodK; if(c===2)return DP.woodL; return row%22<1?DP.woodD:(c>S*.8-6&&c<S*.8-4&&row>10&&row<14?DP.chromeL:DP.wood); },DP.wood,{foot:1}));
    bs.push(fb(x,y,sx,y1,z-2,z,DP.steel,(s,a,row)=>row<1?DP.steelL:DP.steel,(X,Y)=>edge(X,Y,x,y,sx,y1)<.02?DP.steelL:DP.steel),
      fb(sx+sw,y,x+L,y1,z-2,z,DP.steel,(s,a,row)=>row<1?DP.steelL:DP.steel,(X,Y)=>edge(X,Y,sx+sw,y,x+L,y1)<.02?DP.steelL:hash(Math.floor(X*S),Math.floor(Y*S),77)<.03?DP.steelD:DP.steel),
      fb(sx,y,sx+sw,y+.08,z-2,z,DP.steel,()=>DP.steelL,DP.steelL),fb(sx,y1-.1,sx+sw,y1,z-2,z,DP.steel,()=>DP.steelL,DP.steelL),
      pb(sx,y+.08,sx+sw,y1-.1,z-8,z-7,DP.steelD,{top:(X,Y)=>Math.hypot(X-sx-sw/2,Y-(y+y1)/2)<.04?DP.ink:DP.steelD}),
      pb(sx+sw/2-.03,y+.02,sx+sw/2+.03,y+.08,z,z+9,DP.chromeL),pb(sx+sw/2-.03,y+.08,sx+sw/2+.03,y+.22,z+7,z+9,DP.chromeL));
    bs.push(fb(sx+sw+.05,y+.25,sx+sw+.6,y+.55,z,z+.6,[220,220,210],()=>[200,200,190],[226,226,216]));
    for(let i=0;i<4;i++)bs.push(pb(sx+sw+.09+i*.12,y+.32,sx+sw+.16+i*.12,y+.4,z+.6,z+5,[196,220,222],{nb:1,top:()=>[230,240,240]}));
    bs.push(fb(x,y,x+L,y+.2,z,z+3,DP.woodD,(s,a,row)=>row<1?DP.woodL:DP.woodD,DP.wood));
    for(let X=x+.06,i=0;X<x+L-1.05;i++){ const t=hash(i,3,78), [c,cl]=BOTS[Math.floor(hash(i,4,78)*BOTS.length)], w=.06+t*.03, h=10+Math.floor(hash(i,5,78)*8), yy=y+.04+hash(i,6,78)*.06, zz=z+3;
      bs.push(fb(X,yy,X+w,yy+w,zz,zz+h,c,(s,a,row,Lf,hh)=>row>hh*.45&&row<hh*.75&&a>0&&a<Lf-1?lit(sh([240,230,200],.75)):a<1?lit(cl):c,c,{nb:1}),
        pb(X+w/2-.012,yy+w/2-.012,X+w/2+.012,yy+w/2+.012,zz+h,zz+h+4+(t<.3?2:0),c,{nb:1,top:()=>t<.5?DP.gold:DP.ink})); X+=w+.03+hash(i,7,78)*.03; }
    const cx=x+L-.95;
    bs.push(fb(cx,y+.02,cx+.62,y+.58,z,z+22,DP.steel,(s,a,row,Lf,h)=>{ if(row<2)return DP.steelL; if(s==='py'){ if(row>4&&row<10&&a>4&&a<Lf-4)return lit([170,214,232]); if(row>12&&row<h-8&&a>6&&a<Lf-6)return row>h-12?DP.steelD:DP.black; if(row>=h-8)return DP.steelD; } return (a&7)===0?DP.steelD:DP.steel; },
      (X,Y)=>edge(X,Y,cx,y+.02,cx+.62,y+.58)<.03?DP.steelL:DP.steel));
    bs.push(pb(cx+.22,y+.44,cx+.34,y+.52,z+3,z+8,DP.white,{nb:1,top:()=>[60,40,30]}));
    for(let i=0;i<5;i++)bs.push(pb(cx-.22,y+.25,cx-.12,y+.35,z+i*3,z+i*3+3,i&1?DP.whiteD:DP.white,{nb:1}));
    for(let i=0;i<3;i++)bs.push(pb(cx-.42,y+.28,cx-.3,y+.4,z+i*3.5,z+i*3.5+3.5,i&1?DP.whiteD:DP.white,{nb:1}));
    return prop(bs); }

  function stool(x,y){ PNAME='bar stool'; const bs=[];
    bs.push(...round(x,y,0,2,.24,(dx,dy,z,top)=>top?(Math.hypot(dx,dy)>.2?DP.poleL:DP.pole):sh(DP.pole,.8),1,.04));
    bs.push(pb(x-.035,y-.035,x+.035,y+.035,2,12,DP.pole,{nb:1,fi:(Y,z)=>DP.pole,fj:(X,z)=>DP.poleL}));
    bs.push(...round(x,y,7,8,.15,(dx,dy,z,top)=>top?DP.poleL:DP.pole,1,.04).map(b=>Object.assign(b,{top:(X,Y)=>Math.hypot(X-x,Y-y)>.11?DP.poleL:null})));
    bs.push(...round(x,y,12,14,.1,()=>DP.pole,2,.04));
    bs.push(...round(x,y,14,18,z=>.21+(z<1?-.02:z>3?-.02:0),(dx,dy,z,top)=>{ const r=Math.hypot(dx,dy); if(top)return r>.17?DP.redL:r<.05?DP.redH:r<.12&&(dx+dy)<-.03?DP.redL:DP.red; return z<1?DP.redK:z>3?DP.redL:Math.atan2(dy,dx)>1.6?DP.redH:DP.red; },1,.04));
    return prop(bs); }

  function fridge(x,y){ PNAME='drinks fridge'; const D=.78, W=.92, Z=64, x1=x+D, y1=y+W, bs=[], t=.05, F=DP.white;
    const shade=(s,a,row,L,h)=>row<2?sh(F,1.06):row>h-14?(((row>>1)&1)&&a>4&&a<L-4?DP.black:DP.whiteD):F;
    bs.push(fb(x,y,x1,y+t,0,Z,F,shade,F,{foot:1}),fb(x,y1-t,x1,y1,0,Z,F,shade,F,{foot:1}),fb(x,y,x+t,y1,0,Z,F,shade,F,{foot:1}));
    bs.push(fb(x,y,x1,y1,0,7,F,(s,a,row,L)=>s==='px'?(((row>>1)&1)&&a>4&&a<L-4?DP.black:DP.whiteD):F,F,{foot:1}));
    bs.push(fb(x,y,x1,y1,Z-6,Z,F,(s,a,row,L)=>row<1?sh(F,1.08):s==='px'&&a>L-14&&a<L-4&&row>1&&row<5?[190,40,40]:s==='px'&&row===5?DP.whiteD:F,(X,Y)=>edge(X,Y,x,y,x1,y1)<.03?sh(F,1.06):F));
    const glowB=lit([110,170,236]), glowL=lit([200,240,255]);
    bs.push(fb(x+t,y+t,x+t+.02,y1-t,7,Z-6,glowB,(s,a,row)=>row%30<2?glowL:glowB,glowB,{em:1}));
    bs.push(fb(x+t,y+t,x1-.08,y+t+.02,7,Z-6,glowB,(s,a,row)=>lit([150,200,246]),glowB,{em:1}),fb(x+t,y1-t-.02,x1-.08,y1-t,7,Z-6,glowB,()=>lit([150,200,246]),glowB,{em:1}));
    const shelves=[7,20,33,46];
    for(const z of shelves){ bs.push(fb(x+t,y+t,x1-.08,y1-t,z,z+1,glowL,()=>glowL,glowL,{em:1}));
      for(let i=0,Y=y+t+.04;Y<y1-t-.1;i++){ const k=hash(i,z,79), can=k<.4, w=can?.08:.07, h=can?7:11, cc=can?[[230,60,60],[60,120,220],[240,200,60]][i%3]:[[120,200,120],[240,240,236],[230,150,60],[120,170,240]][i%4];
        for(const X of [x+.2,x+.42])bs.push(fb(X,Y,X+w,Y+w,z+1,z+1+h,cc,(s,a,row,L,hh)=>row>hh*.35&&row<hh*.7?lit(sh(cc,1.15)):can&&row<1?lit([210,214,220]):lit(cc),lit(cc),{nb:1}));
        if(!can)bs.push(pb(x+.2+w/2-.012,Y+w/2-.012,x+.2+w/2+.012,Y+w/2+.012,z+1+h,z+4+h,lit([240,240,240]),{nb:1}),pb(x+.42+w/2-.012,Y+w/2-.012,x+.42+w/2+.012,Y+w/2+.012,z+1+h,z+4+h,lit([240,240,240]),{nb:1}));
        Y+=w+.05; } }
    bs.push(fb(x1-.06,y,x1,y1,7,Z-6,F,(s,a,row,L,h)=>{ if(s!=='px')return F; if(a<6||a>L-6||row<4||row>h-4)return a>L-9&&a<L-6&&row>h*.3&&row<h*.6?DP.chromeD:F; return null; },F));
    bs.push(pb(x1-.08,y1-.12,x1-.06,y1-.08,30,52,DP.chromeL));
    const p=prop(bs); LAMPS.push({own:1,room:1,x:x1+.5,y:(y+y1)/2,z:30,r:3.2,c:[.45,.7,1],prop:p}); return p; }

  function airCooler(x,y){ '@later'; PNAME='air cooler'; const w=.5, Z=30, G=[150,156,154];
    return prop([fb(x,y,x+w,y+w,0,Z,G,(s,a,row,L,h)=>row<2?sh(G,1.1):row>h-4?sh(G,.7):row>8&&row<h-8&&a>3&&a<L-3?((row>>1)&1?sh(G,.62):sh(G,1.05)):G,
      (X,Y)=>edge(X,Y,x,y,x+w,y+w)<.05?sh(G,1.1):(Math.floor((X-x)*S/2)&1)?sh(G,.6):G,{foot:1})]); }

  
  
  
  function table(x,y,k){ PNAME='round table'; const bs=[];
    bs.push(...round(x,y,0,2,.3,(dx,dy,z,top)=>top?DP.blackL:DP.black,1,.04));
    bs.push(pb(x-.05,y-.05,x+.05,y+.05,2,19,DP.black,{nb:1,fj:()=>DP.blackL}));
    bs.push(...round(x,y,19,22,.46,(dx,dy,z,top)=>{ const r=Math.hypot(dx,dy); if(top)return r>.42?DP.woodL:pcVn(dx*12,dy*12,91)<.3?DP.woodD:DP.wood; return z>2?DP.woodL:DP.woodD; },1,.04));
    if(k)bs.push(pb(x+.08,y-.12,x+.16,y-.04,22,27,[200,224,214],{nb:1,top:()=>[200,170,90]}),pb(x-.18,y+.06,x-.04,y+.2,22,23,DP.white,{top:(X,Y)=>Math.hypot(X-(x-.11),Y-(y+.13))<.03?DP.ink:DP.white}));
    return prop(bs); }
  

  
  
  

  function neon(x,y,word){ PNAME='neon sign'; const cw=4, L=(word.length*4-1)*cw+16, w=L/S, Z0=0, h=(5*cw+12)/H, bs=[];
    const A=pic(L,5*cw+12,put=>{ [...word].forEach((ch,i)=>{ const g=F3[ch]; for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(g[r*3+q]==='1'){ const X=8+(i*4+q)*cw, Y=6+r*cw;
      box(put,X-1,Y-1,X+cw+1,Y+cw+1,lit([210,60,52])); } });
      [...word].forEach((ch,i)=>{ const g=F3[ch], on=(r,q)=>r>=0&&r<5&&q>=0&&q<3&&g[r*3+q]==='1'; for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(on(r,q)){ const X=8+(i*4+q)*cw, Y=6+r*cw; box(put,X,Y,X+cw,Y+cw,lit([255,150,130])); }
        for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(on(r,q)){ const X=8+(i*4+q)*cw, Y=6+r*cw; box(put,X+1,Y+1,X+cw-1,Y+cw-1,lit([255,244,226]));
          if(on(r,q+1))box(put,X+cw-1,Y+1,X+cw+1,Y+cw-1,lit([255,244,226])); if(on(r+1,q))box(put,X+1,Y+cw-1,X+cw-1,Y+cw+1,lit([255,244,226])); } }); });
    bs.push(fb(x,y,x+.05,y+w,Z0,Z0+h,[40,20,20],(s,a,row)=>s==='px'?A(a,row)||(row<1||row>=(5*cw+12)-1?[70,40,36]:[44,22,20]):[44,22,20],[60,34,30],{foot:1,em:1}));
    const G=.9, gh=16;
    bs.push(fb(x-.004,y-G,x+.002,y+w+G,Z0-gh,Z0+h+gh,[200,80,60],(s,a,row)=>{ if(s!=='px')return null; const u=a/S-G, zz=h+gh-row/H, d=Math.hypot(Math.max(0,-u,u-w),Math.max(0,-zz,zz-h)/FP), f=Math.max(0,1-d/G);
      const i=a>>1, j=row>>1, on=f>.6||f>.3&&((i+j)&1)||f>.08&&!(i&1)&&!(j&1); return on?lit([Math.round(170+85*f),Math.round(116-30*f),Math.round(96-30*f)]):null; },()=>null,{nb:1,em:1}));
    const p=prop(bs,null,{hang:Z0,walk:true,high:true}); LAMPS.push({own:1,room:1,x:x+.6,y:y+w/2,z:h/2,r:5.5,c:[1.5,.36,.28],prop:p}); return p; }
  
  function doubleDoors(x,y,stick){ '@later'; PNAME='double doors'; const L=2.1, Z=76, bs=[];
    const A=pic(Math.round(L*S),Z*H,put=>{ const w=Math.round(L*S), h=Z*H, lw=w/2;
      box(put,0,0,w,h,DP.woodD); box(put,0,0,w,4,DP.woodL); box(put,0,0,4,h,DP.woodL); box(put,w-4,0,w,h,DP.woodK);
      for(const o of [4,lw+1]){ box(put,o,4,o+lw-5,h,DP.wood); box(put,o+lw-6,4,o+lw-5,h,DP.woodK);
        box(put,o+8,14,o+lw-13,86,DP.woodK); box(put,o+10,16,o+lw-15,84,[22,28,30]); for(let y=18;y<82;y+=7)box(put,o+11,y,o+lw-16,y+1,[40,48,52]);
        box(put,o+6,h-16,o+lw-11,h-14,DP.woodK); }
      const st=(cx,cy,word,c1,c2)=>{ disc(put,cx,cy,13,8,lit([240,240,236])); disc(put,cx,cy,12,7,c1); disc(put,cx,cy,9,4.5,c2); T3(put,word,cx-word.length*2+1,cy-2,lit([255,255,255]),1); };
      st(4+lw/2-2,48,stick[0],[200,40,40],[40,70,170]); st(lw+1+lw/2-2,36,stick[1],[40,70,170],[200,40,40]); });
    bs.push(fb(x,y,x+.06,y+L,0,Z,DP.woodD,(s,a,row)=>s==='px'?A(a,row):DP.woodD,DP.woodD,{foot:1}));
    bs.push(fb(x-.02,y-.1,x+.1,y,0,Z+4,DP.woodD,(s,a,row)=>row<2?DP.woodL:DP.woodD,DP.woodL,{foot:1}),fb(x-.02,y+L,x+.1,y+L+.1,0,Z+4,DP.woodD,(s,a,row)=>row<2?DP.woodL:DP.woodD,DP.woodL,{foot:1}),
      fb(x-.02,y-.1,x+.1,y+L+.1,Z,Z+4,DP.woodD,(s,a,row)=>row<2?DP.woodL:DP.woodD,DP.woodL));
    for(const [a,b] of [[y+.12,y+L/2-.15],[y+L/2+.15,y+L-.12]]){ bs.push(pb(x+.1,a,x+.14,b,35,37,DP.chromeL));
      for(const e of [a,b-.04])bs.push(pb(x+.06,e,x+.12,e+.04,34,38,DP.chrome)); }
    return prop(bs,null,{hang:0,walk:true,high:true}); }
  function woodDoor(x,y){ '@later'; PNAME='door'; const L=1.3, Z=76;
    const A=pic(Math.round(L*S),Z*H,put=>{ const w=Math.round(L*S), h=Z*H, lw=w/2;
      box(put,0,0,w,h,DP.wood); box(put,0,0,w,3,DP.woodL);
      for(const o of [0,lw]){ box(put,o,0,o+1,h,DP.woodK); for(const [y0,y1] of [[12,70],[82,h-12]]){ box(put,o+6,y0,o+lw-6,y1,DP.woodD); box(put,o+7,y0+1,o+lw-7,y1-1,DP.wood); box(put,o+7,y0+1,o+lw-7,y0+2,DP.woodL); }
        for(let y=4;y<h;y+=9)if(hash(o,y,99)<.5)box(put,o+3+Math.floor(hash(o,y,98)*(lw-8)),y,o+5+Math.floor(hash(o,y,98)*(lw-8)),y+1,DP.woodD); }
      box(put,lw-8,74,lw-4,78,DP.gold); box(put,lw+4,74,lw+8,78,DP.gold); });
    return prop([fb(x,y,x+.06,y+L,0,Z,DP.wood,(s,a,row)=>s==='px'?A(a,row):DP.wood,DP.wood,{foot:1}),
      fb(x-.02,y-.08,x+.09,y,0,Z+3,DP.woodD,()=>DP.woodD,DP.woodL,{foot:1}),fb(x-.02,y+L,x+.09,y+L+.08,0,Z+3,DP.woodD,()=>DP.woodD,DP.woodL,{foot:1}),fb(x-.02,y-.08,x+.09,y+L+.08,Z,Z+3,DP.woodD,(s,a,row)=>row<1?DP.woodL:DP.woodD,DP.woodL)],null,{hang:0,walk:true,high:true}); }
  
  
  
  function tv(x,y){ PNAME='TV'; const L=.86, Z=22;
    const A=pic(Math.round(L*S),Z*H,put=>{ const w=Math.round(L*S), h=Z*H; box(put,0,0,w,h,DP.black); box(put,3,3,w-3,h-3,lit([40,130,60]));
      for(let y=3;y<h-3;y+=6)box(put,3,y,w-3,y+1,lit([50,150,70])); box(put,3,3,w-3,10,lit([30,40,90])); for(let i=0;i<14;i++)box(put,3+hash(i,1,101)*(w-8),5+hash(i,2,101)*4,5+hash(i,1,101)*(w-8),7+hash(i,2,101)*4,lit([220,220,230]));
      for(let i=0;i<6;i++){ const px=6+hash(i,3,101)*(w-12), py=14+hash(i,4,101)*(h-22); box(put,px,py,px+2,py+5,lit(i<3?[220,40,40]:[240,240,240])); }
      box(put,w-14,h-8,w-4,h-4,lit([20,20,30])); });
    const p=prop([fb(x,y,x+.12,y+L,0,Z,DP.black,(s,a,row)=>s==='px'?A(a,row):DP.blackL,DP.blackL,{foot:1,em:1}),pb(x,y+L/2-.08,x+.05,y+L/2+.08,-6,0,DP.blackL)],null,{hang:0,walk:true,high:true});
    LAMPS.push({own:1,room:1,x:x+.9,y:y+L/2,z:Z/2,r:3.5,c:[.55,.8,1],prop:p}); return p; }
  

  function soffit(x,y,L,W){ '@later'; PNAME='soffit'; const Z0=106+DZ, Z1=126+DZ, rc=.6, bs=[], x1=x+L, y1=y+W;
    const face=(s,a,row,Lf,h)=>s==='px'||s==='py'?(row<12?(row<1?[200,90,70]:[176,64,46]):row<13?[110,40,30]:row>h-2?[120,84,52]:[176,132,86]):[150,110,70];
    for(let X=x;X<x1-1e-6;X+=.04){ const m=X+.02, yy=m>x1-rc?(y1-rc)+Math.sqrt(Math.max(0,rc*rc-(m-(x1-rc))**2)):y1;
      bs.push(fb(X,y,X+.04,yy,Z0,Z1,[176,64,46],face,(XX,YY)=>edge(XX,YY,x,y,x1,yy)<.06?[150,110,70]:pcVn(XX*3,YY*3,102)<.4?[118,124,104]:[126,132,112],{nb:1,foot:1})); }
    return prop(bs,null,{hang:Z0,walk:true,high:true}); }

  function fan(x,y){ '@later'; PNAME='ceiling fan'; const Zc=126+DZ, bs=[], R=1.15, Zb=106+DZ;
    bs.push(pb(x-.02,y-.02,x+.02,y+.02,108+DZ,Zc,DP.black,{nb:1,foot:1}));
    bs.push(...round(x,y,104+DZ,110+DZ,z=>.13-(z>4?.04:0),(dx,dy,z,top)=>top?DP.blackL:z>2&&z<3.5?[180,40,36]:Math.atan2(dy,dx)>1.4?DP.blackL:DP.black,1,.03));
    bs.push(...round(x,y,92+DZ,104+DZ,z=>.17*Math.sqrt(Math.max(.05,1-((z-7)/7)**2)),(dx,dy,z,top)=>z>10?lit([200,190,170]):lit(z<4?[255,250,226]:Math.atan2(dy,dx)>1.2?[255,252,236]:[250,236,200]),1,.03).map(b=>Object.assign(b,{em:1})));
    bs.push({x0:x-R,y0:y-R,x1:x+R,y1:y+R,z0:Zb,z1:Zb+.5,c:[0,0,0],foot:1,nb:1,top:()=>null,fi:()=>null,fj:()=>null,ghost:1});
    const p=prop(bs,null,{hang:92+DZ,walk:true,high:true,lifeK:2});
    const BL=[[120,78,46],[150,100,60],[90,56,30]];
    p.lifeDraw=(D,W,Hh,ox,oy,t,K=1)=>{ const hub=p.boxes.find(b=>b.ghost); if(!hub)return; const cx=(hub.x0+hub.x1)/2, cy=(hub.y0+hub.y1)/2, z=hub.z0-LVZ(V.lv), a0=t*5.2;
      for(let k=0;k<4;k++){ const a=a0+k*Math.PI/2, ca=Math.cos(a), sa=Math.sin(a);
        for(let r=.16;r<R;r+=.012/K)for(let q=-1;q<=1;q+=.25/K){ const wd=r<.3?.05:.11+.02*Math.sin((r-.3)/(R-.3)*3), X=cx+ca*r-sa*q*wd, Y=cy+sa*r+ca*q*wd, [vx,vy]=vw(X,Y);
          const px=Math.floor(((vx-vy)*HW-ox)*K), py=Math.floor(((vx+vy)*HH-z-oy)*K); if(px<0||py<0||px>=W||py>=Hh)continue;
          const c=r<.3?DP.black:Math.abs(q)>.8||r>R-.03?BL[2]:q<-.3?BL[1]:BL[0], i=(py*W+px)*4; D[i]=c[0]; D[i+1]=c[1]; D[i+2]=c[2]; D[i+3]=255; } } };
    LAMPS.push({own:1,room:1,x,y,z:96+DZ,r:9.5,c:[.9,.88,.68],prop:p}); return p; }

  
  const C={'diner bar counter':(x,y)=>barStraight(x-.9,y-BD/2,1.8,null),'diner bar counter: menu':(x,y)=>barStraight(x-.9,y-BD/2,1.8,0),
    'diner bar counter: can':(x,y)=>barStraight(x-.9,y-BD/2,1.8,1),'diner bar counter: glass':(x,y)=>barStraight(x-.9,y-BD/2,1.8,2),
    'diner bar round end':(x,y)=>barRound(x-.56,y-.56),'diner bar corner':(x,y)=>barCorner(x-BD/2,y-1.5,3.02),'diner back bar':(x,y)=>backBar(x-2.6,y-.31,5.2),
    'diner bar stool':(x,y)=>stool(x,y),'diner drinks fridge':(x,y)=>fridge(x-.39,y-.46),'diner air cooler':(x,y)=>airCooler(x-.25,y-.25),
    'diner red leather sofa':(x,y)=>sofa(x-.46,y-1.1),'diner red leather armchair':(x,y)=>armchair(x-.47,y-.475),'diner table':(x,y)=>table(x,y,1),
    'diner red rug':(x,y)=>rug(x-1.9,y-.65,3.8,1.3),'diner potted palm':(x,y)=>plant(x,y,true),'diner potted plant':(x,y)=>plant(x,y,false),
    'diner neon sign: BAR':(x,y)=>up(neon(x-.03,y-.62,'BAR'),86),'diner neon sign: DINER':(x,y)=>up(neon(x-.03,y-.96,'DINER'),86),'diner exit sign':(x,y)=>up(exitSign(x-.05,y-.31),90),
    'diner double doors':(x,y)=>doubleDoors(x-.03,y-1.05,['SONII','WAYWARD']),'diner door':(x,y)=>woodDoor(x-.03,y-.65),'diner window blinds':(x,y)=>up(blinds(x-.02,y-.65,1.3,70),34),
    'diner bar blinds':(x,y)=>up(blinds(x-.02,y-2.3,4.6,72),30),'diner TV on a bracket':(x,y)=>up(tv(x-.06,y-.43),74),'diner black cupboard':(x,y)=>cupboard(x-.31,y-.46),
    'diner soffit':(x,y)=>soffit(x-4.4,y-1.4,8.8,2.8),'diner ceiling fan':(x,y)=>fan(x,y)};
  for(const n of Object.keys(POSTERS))C['diner poster: '+n]=(x,y)=>{ const [L,h]=n==='moon shrine'?[.62,40]:n==='night painting'?[.5,30]:n==='190 street'?[.5,30]:[.55,34]; return up(poster(x-.02,y-L/2,n,L,h),n==='190 street'?42:n==='ghost sale'?50:46); };
  Object.assign(CATALOG,C);
  if(!CAT_DEPTS.some(d=>d[0]==='diner'))CAT_DEPTS.push(['diner','Diner']);
  const info=(no,name,price,desc,mat)=>({no,name,dept:'diner',price,desc,mat});
  Object.assign(CAT_INFO,{
    'diner bar counter':info('D-701','Bar Counter',1800,'A run of oxblood bar, a step along its foot, shelves of glasses on the inside.','oak, lacquer'),
    'diner bar counter: menu':info('D-702','Bar Counter with Menus',1820,'The bar, with the menu stand, the napkins and the sauces out.','oak, lacquer'),
    'diner bar counter: can':info('D-703','Bar Counter with a Can',1810,'The bar, a can and a glass left on it.','oak, lacquer'),
    'diner bar counter: glass':info('D-704','Bar Counter with a Glass',1805,'The bar, a glass on a mat.','oak, lacquer'),
    'diner bar round end':info('D-705','Bar Counter, Round End',1400,'The bar\'s end, curving back to the wall.','oak, lacquer'),
    'diner bar corner':info('D-706','Bar Counter, Corner',2200,'The bar turning back to the wall, the till on it.','oak, lacquer'),
    'diner back bar':info('D-707','Back Bar',3400,'Cupboards under a steel top: a sink, a row of bottles, the coffee machine.','oak, steel'),
    'diner bar stool':info('D-708','Bar Stool',120,'A red cushion on a green pole.','steel, vinyl'),
    'diner drinks fridge':info('D-709','Drinks Fridge',900,'A glass-door fridge of bottles and cans, lit blue.','steel, glass'),
    'diner air cooler':info('D-710','Air Cooler',150,'A grey box that hums.','steel'),
    'diner red leather sofa':info('D-711','Red Leather Sofa',1600,'A deep red sofa with rolled arms.','leather, oak'),
    'diner red leather armchair':info('D-712','Red Leather Armchair',800,'A club chair, its back in channels.','leather, oak'),
    'diner table':info('D-713','Round Table',260,'A small round table on one foot, a glass and an ashtray on it.','walnut, cast iron'),
    'diner red rug':info('D-714','Red Runner',180,'A long deep red rug.','wool'),
    'diner potted palm':info('D-715','Potted Palm',140,'A big spiky palm in a clay pot.','living'),
    'diner potted plant':info('D-716','Potted Plant',90,'A tall spiky plant in a grey pot.','living'),
    'diner neon sign: BAR':info('D-717','Neon Sign, BAR',650,'BAR in red tube. It glows.','glass, neon'),
    'diner neon sign: DINER':info('D-718','Neon Sign, DINER',780,'DINER in red tube. It glows.','glass, neon'),
    'diner exit sign':info('D-719','Exit Sign',45,'EXIT, lit.','plastic'),
    'diner double doors':info('D-720','Double Doors',1200,'Two dark wood doors with windows and push bars, stickers on the glass.','oak, glass, steel'),
    'diner door':info('D-721','Wooden Door',600,'A pair of narrow panelled doors.','oak'),
    'diner window blinds':info('D-722','Window Blinds',60,'Blinds drawn in a wood frame.','aluminium, oak'),
    'diner bar blinds':info('D-723','Bar Blinds',180,'A wide window of blinds, drawn.','aluminium, oak'),
    'diner TV on a bracket':info('D-724','TV on a Bracket',300,'A small set high on the wall, the game on.','plastic, glass'),
    'diner black cupboard':info('D-725','Black Cupboard',110,'A low black cupboard, straws and a cup on it.','steel'),
    'diner soffit':info('D-726','Bar Soffit',900,'A dropped ceiling over the bar, its edge banded red.','plaster, oak'),
    'diner ceiling fan':info('D-727','Ceiling Fan',240,'Four wooden blades that turn, a frosted globe that lights.','steel, oak, glass'),
    'diner poster: koi night':info('D-728','Poster, Koi Night',15,'The koi pond on the moon shrine\'s roof, by night.','paper'),
    'diner poster: ghost sale':info('D-729','Poster, Ghost Shop',15,'The ghost shop\'s sale.','paper'),
    'diner poster: hover taxi':info('D-730','Poster, Hover Taxi',15,'Every 30 seconds, down the street.','paper'),
    'diner poster: moon shrine':info('D-731','Poster, Moon Shrine',20,'The shrine on the roof.','paper'),
    'diner poster: 190 street':info('D-732','Poster, 190 Street',15,'The line to 190 Street.','paper'),
    'diner poster: night painting':info('D-733','Painting, Night',90,'A small dark painting of the river at night.','oil, canvas')});
  for(const k of Object.keys(C))KIND_OF[k]=k;
  PRESETS['Preset Diner 1']=[['diner soffit',4.5,1.5,0],['diner back bar',5.2,.42,0],['diner bar blinds',5.2,.08,1],['diner black cupboard',1.6,.42,1],['diner TV on a bracket',1.65,.13,1],
    ['diner bar round end',1.84,2.56,0],['diner bar counter: menu',3.3,2.66,0],['diner bar counter: can',5.1,2.66,0],['diner bar counter: glass',6.9,2.66,0],['diner bar corner',8.26,1.6,0],
    ...[2.7,3.85,5,6.15,7.3].map(x=>['diner bar stool',x,3.62,0]),['diner drinks fridge',.5,5.75,0],['diner air cooler',.35,6.55,0],
    ['diner red rug',2.1,4.55,0],['diner red rug',11.9,3.2,1],['diner red leather sofa',3.1,6.25,3],['diner table',4.6,5.1,0],['diner red leather armchair',5.75,4.7,2],['diner table',6.1,6.25,0],['diner red leather armchair',7.25,6.3,2],
    ['diner potted palm',.75,1.2,0],['diner potted plant',12.85,.75,0],
    ['diner double doors',.12,3.65,0],['diner neon sign: BAR',.12,4.55,0],['diner exit sign',.12,3.2,0],['diner window blinds',.12,1.2,0],['diner poster: koi night',.12,6.5,0],['diner poster: ghost sale',.12,2.15,0],
    ['diner door',12.15,.12,1],['diner neon sign: DINER',12.15,.12,1],['diner poster: moon shrine',10.55,.12,1],['diner poster: 190 street',11.2,.12,1],['diner poster: night painting',13.15,.12,1],['diner ceiling fan',5.3,3.2,0]]; }
const dinerVn=(x,y)=>{ const i=Math.floor(x), j=Math.floor(y), fx=x-i, fy=y-j, a=hash(i,j,63), b=hash(i+1,j,63), c=hash(i,j+1,63), d=hash(i+1,j+1,63); return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy; };
function dinerFloorCol(x,y){ const a=x*2, b=y*2, i=Math.floor(a), j=Math.floor(b), h=hash(i,j,64), m=dinerVn(x*9,y*9);
  if(a-i<.04||b-j<.04)return [146,130,104];
  return speck(h<.33?[200,184,152]:h<.66?[192,176,144]:[208,194,162],x*3+m*.6,y*3,65); }
function dinerWall(q,nx,ny,X,Y,z,f){ '@later'; const u=nx?Y:X, zz=z%STORY, top=q.h-4, b=((u*48)%6+6)%6;
  return sh(zz<4?[50,34,22]:zz<34?(b<1?[62,40,24]:b<2?[118,80,50]:speck([96,64,40],u,zz/24,61)):zz<37?[122,84,52]:zz<38?[60,40,24]:zz>=top-8?(zz<top-7?[60,40,24]:[110,74,46]):speck(dinerVn(u*3,zz/16)<.5?[206,196,160]:[198,188,152],u,zz/24,62),f); }
{ const B=LBLD.find(b=>b.id==='ldiner'); if(B){ B.floorOf=lv=>lv?null:dinerFloorCol; B.inWall=dinerWall; } }
