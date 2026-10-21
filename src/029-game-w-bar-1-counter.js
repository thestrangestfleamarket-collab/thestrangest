{
const {FP,H,S,art,F3,txt,pcVn,pcLathe,lit,tone,box,disc,DP,T3,fb,pb,edge,pic,round,BZ,BT,BD,BO,PL,panel,topCol,glassesRow,barStraight,barRound,barCorner,BOTS,leather,sofa,armchair,rug,LEAF,leavesArt,plant,exitSign,blinds,POSTERS,poster,cupboard,up}=barKit(onBar);
 
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  
  
  
  
  function onBar(k,x,x1,y0,y1,bs){ const z=BZ+BT, m=(x+x1)/2, yc=(y0+y1)/2+.1;
    if(k===0){ bs.push(pb(m-.56,yc-.1,m-.34,yc+.1,z,z+1.5,[40,40,44],{top:(X,Y)=>Math.hypot(X-(m-.45),Y-yc)<.06?[20,20,22]:[40,40,44]}),pb(m-.52,yc-.012,m-.38,yc+.012,z+1.5,z+2.2,[236,230,210],{nb:1,top:(X)=>X>m-.4?[250,150,60]:[236,230,210]}),
        fb(m-.15,yc-.08,m+.08,yc+.08,z,z+7,DP.red,(s,a,row)=>row<1?DP.redD:(s==='py'||s==='ny')&&row>3&&row<10?DP.white:DP.red,DP.white),
        pb(m+.2,yc-.06,m+.42,yc+.06,z,z+2,DP.chromeD),pb(m+.22,yc-.04,m+.27,yc+.01,z+2,z+8,[180,40,30],{nb:1}),pb(m+.3,yc-.04,m+.35,yc+.01,z+2,z+8,[220,180,60],{nb:1}),pb(m+.36,yc-.02,m+.41,yc+.03,z+2,z+7,[60,40,30],{nb:1}));
      bs.push(fb(m+.5,y0+.18,m+.85,y0+.5,z,z+.5,[40,40,40],(s,a,row)=>[40,40,40],(X,Y)=>((Math.floor(X*S/3)+Math.floor(Y*S/3))&1)?[34,34,34]:[70,70,70])); }
    if(k===1){ bs.push(fb(m-.3,yc-.04,m-.22,yc+.04,z,z+8,[118,64,30],(s,a,row)=>row<1?DP.ink:row>5&&row<9?DP.cream:[118,64,30],[92,48,24],{nb:1}),
        pb(m-.18,yc-.04,m-.1,yc+.04,z,z+6,[160,40,44],{nb:1,top:()=>DP.chromeL}),fb(m-.05,yc-.12,m+.22,yc+.1,z,z+1.5,DP.white,()=>DP.whiteD,(X,Y)=>hash(Math.floor(X*S),Math.floor(Y*S),76)<.2?DP.whiteD:DP.white),
        pb(m+.42,yc,m+.5,yc+.08,z,z+5,[210,226,214],{nb:1,top:()=>[200,170,90]})); }
    if(k===2){ bs.push(pb(m+.2,yc-.02,m+.28,yc+.06,z,z+5,[210,226,214],{nb:1,top:()=>[236,240,236]}),pb(m+.12,yc-.08,m+.36,yc+.12,z,z+.5,[230,226,212])); } }
  
  
  

  
  function backBar(x,y,L){ SHARED.PNAME='back bar'; const y1=y+.62, bs=[], z=26, sx=x+.45, sw=1;
    bs.push(fb(x,y,x+L,y1,0,z-2,DP.wood,(s,a,row,Lf,h)=>{ const c=a%(S*.8|0); if(row<3)return DP.woodD; if(row>h-6)return DP.woodK; if(c<2)return DP.woodK; if(c===2)return DP.woodL; return row%22<1?DP.woodD:(c>S*.8-6&&c<S*.8-4&&row>10&&row<14?DP.chromeL:DP.wood); },DP.wood,{foot:1}));
    bs.push(fb(x,y,sx,y1,z-2,z,DP.steel,(s,a,row)=>row<1?DP.steelL:DP.steel,(X,Y)=>edge(X,Y,x,y,sx,y1)<.02?DP.steelL:DP.steel),
      fb(sx+sw,y,x+L,y1,z-2,z,DP.steel,(s,a,row)=>row<1?DP.steelL:DP.steel,(X,Y)=>edge(X,Y,sx+sw,y,x+L,y1)<.02?DP.steelL:hash(Math.floor(X*S),Math.floor(Y*S),77)<.03?DP.steelD:DP.steel),
      fb(sx,y,sx+sw,y+.08,z-2,z,DP.steel,()=>DP.steelL,DP.steelL),fb(sx,y1-.1,sx+sw,y1,z-2,z,DP.steel,()=>DP.steelL,DP.steelL),
      pb(sx,y+.08,sx+sw,y1-.1,z-8,z-7,DP.steelD,{top:(X,Y)=>Math.hypot(X-sx-sw/2,Y-(y+y1)/2)<.04?DP.ink:DP.steelD}),
      pb(sx+sw/2-.03,y+.02,sx+sw/2+.03,y+.08,z,z+9,DP.chromeL),pb(sx+sw/2-.03,y+.08,sx+sw/2+.03,y+.22,z+7,z+9,DP.chromeL));
    bs.push(fb(sx+sw+.05,y+.25,sx+sw+.6,y+.55,z,z+.6,[220,220,210],()=>[200,200,190],[226,226,216]));
    for(let i=0;i<4;i++)bs.push(pb(sx+sw+.09+i*.12,y+.32,sx+sw+.16+i*.12,y+.4,z+.6,z+5,[196,220,222],{nb:1,top:()=>[230,240,240]}));
    bs.push(fb(x,y,x+L,y+.2,z,z+3,DP.woodD,(s,a,row)=>row<1?DP.woodL:DP.woodD,DP.wood));
    for(let X=x+.06,i=0;X<x+L-.98;i++){ const t=hash(i,3,78), [c,cl]=BOTS[Math.floor(hash(i,4,78)*BOTS.length)], w=.06+t*.03, h=10+Math.floor(hash(i,5,78)*8), yy=y+.04+hash(i,6,78)*.06, zz=z+3;
      bs.push(fb(X,yy,X+w,yy+w,zz,zz+h,c,(s,a,row,Lf,hh)=>row>hh*.45&&row<hh*.75&&a>0&&a<Lf-1?lt(sh([240,230,200],.75)):a<1?lt(cl):c,c,{nb:1}),
        pb(X+w/2-.012,yy+w/2-.012,X+w/2+.012,yy+w/2+.012,zz+h,zz+h+4+(t<.3?2:0),c,{nb:1,top:()=>t<.5?DP.gold:DP.ink})); X+=w+.03+hash(i,7,78)*.03; }
    bs.push(fb(x+L-.9,y+.25,x+L-.1,y+.55,z,z+.6,[220,220,210],()=>[200,200,190],[226,226,216]));
    for(let i=0;i<6;i++)bs.push(pb(x+L-.86+i*.12,y+.32,x+L-.79+i*.12,y+.4,z+.6,z+5,[196,220,222],{nb:1,top:()=>[230,240,240]}));
    return prop(bs); }

  function stool(x,y){ SHARED.PNAME='bar stool'; const bs=[];
    bs.push(...round(x,y,0,2,.24,(dx,dy,z,top)=>top?(Math.hypot(dx,dy)>.2?DP.poleL:DP.pole):sh(DP.pole,.8),1,.04));
    bs.push(pb(x-.035,y-.035,x+.035,y+.035,2,9,DP.pole,{nb:1,fi:(Y,z)=>DP.pole,fj:(X,z)=>DP.poleL}));
    bs.push(...round(x,y,5,6,.15,(dx,dy,z,top)=>top?DP.poleL:DP.pole,1,.04).map(b=>Object.assign(b,{top:(X,Y)=>Math.hypot(X-x,Y-y)>.11?DP.poleL:null})));
    bs.push(...round(x,y,9,11,.1,()=>DP.pole,2,.04));
    bs.push(...round(x,y,11,15,z=>.21+(z<1?-.02:z>3?-.02:0),(dx,dy,z,top)=>{ const r=Math.hypot(dx,dy); if(top)return r>.17?DP.redL:r<.05?DP.redH:r<.12&&(dx+dy)<-.03?DP.redL:DP.red; return z<1?DP.redK:z>3?DP.redL:Math.atan2(dy,dx)>1.6?DP.redH:DP.red; },1,.04));
    return prop(bs); }

  function fridge(x,y){ SHARED.PNAME='drinks fridge'; const D=.78, W=.92, Z=64, x1=x+D, y1=y+W, bs=[], t=.05, F=DP.white;
    const shade=(s,a,row,L,h)=>row<2?sh(F,1.06):row>h-14?(((row>>1)&1)&&a>4&&a<L-4?DP.black:DP.whiteD):F;
    bs.push(fb(x,y,x1,y+t,0,Z,F,shade,F,{foot:1}),fb(x,y1-t,x1,y1,0,Z,F,shade,F,{foot:1}),fb(x,y,x+t,y1,0,Z,F,shade,F,{foot:1}));
    bs.push(fb(x,y,x1,y1,0,7,F,(s,a,row,L)=>s==='px'?(((row>>1)&1)&&a>4&&a<L-4?DP.black:DP.whiteD):F,F,{foot:1}));
    bs.push(fb(x,y,x1,y1,Z-6,Z,F,(s,a,row,L)=>row<1?sh(F,1.08):s==='px'&&a>L-14&&a<L-4&&row>1&&row<5?[190,40,40]:s==='px'&&row===5?DP.whiteD:F,(X,Y)=>edge(X,Y,x,y,x1,y1)<.03?sh(F,1.06):F));
    const glowB=BARDARK?[30,38,48]:lit([110,170,236]), glowL=BARDARK?[46,56,68]:lit([200,240,255]);
    bs.push(fb(x+t,y+t,x+t+.02,y1-t,7,Z-6,glowB,(s,a,row)=>row%30<2?glowL:glowB,glowB,{em:BARDARK?0:1}));
    bs.push(fb(x+t,y+t,x1-.08,y+t+.02,7,Z-6,glowB,(s,a,row)=>BARDARK?glowL:lit([150,200,246]),glowB,{em:BARDARK?0:1}),fb(x+t,y1-t-.02,x1-.08,y1-t,7,Z-6,glowB,()=>BARDARK?glowL:lit([150,200,246]),glowB,{em:BARDARK?0:1}));
    const shelves=[7,20,33,46];
    for(const z of shelves){ bs.push(fb(x+t,y+t,x1-.08,y1-t,z,z+1,glowL,()=>glowL,glowL,{em:BARDARK?0:1}));
      for(let i=0,Y=y+t+.04;Y<y1-t-.1;i++){ const k=hash(i,z,79), can=k<.4, w=can?.08:.07, h=can?7:11, cc=can?[[230,60,60],[60,120,220],[240,200,60]][i%3]:[[120,200,120],[240,240,236],[230,150,60],[120,170,240]][i%4];
        for(const X of [x+.2,x+.42])bs.push(fb(X,Y,X+w,Y+w,z+1,z+1+h,cc,(s,a,row,L,hh)=>row>hh*.35&&row<hh*.7?lt(sh(cc,1.15)):can&&row<1?lt([210,214,220]):lt(cc),lt(cc),{nb:1}));
        if(!can)bs.push(pb(x+.2+w/2-.012,Y+w/2-.012,x+.2+w/2+.012,Y+w/2+.012,z+1+h,z+4+h,lt([240,240,240]),{nb:1}),pb(x+.42+w/2-.012,Y+w/2-.012,x+.42+w/2+.012,Y+w/2+.012,z+1+h,z+4+h,lt([240,240,240]),{nb:1}));
        Y+=w+.05; } }
    bs.push(fb(x1-.06,y,x1,y1,7,Z-6,F,(s,a,row,L,h)=>{ if(s!=='px')return F; if(a<6||a>L-6||row<4||row>h-4)return a>L-9&&a<L-6&&row>h*.3&&row<h*.6?DP.chromeD:F; return null; },F));
    bs.push(pb(x1-.08,y1-.12,x1-.06,y1-.08,30,52,DP.chromeL));
    const p=prop(bs); LAMPS.push({own:1,room:1,x:x1+.5,y:(y+y1)/2,z:30,r:3.2,c:[.45,.7,1],prop:p}); return p; }

