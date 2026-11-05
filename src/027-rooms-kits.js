// THE ROOMS' KITS: the diner, the bar, the music room, the moon shrine, the page rooms' cottage and the octopus room.
import {SHARED} from './003-shx.js';
import {vwV, wvV} from './003b-systems.js';
import {CAT_DEPTS, CAT_INFO, CATALOG, cvNoise, hash, KIND_OF, LAMPS, LBLD, LIFE, prop, sh, sided, speck, STORY, T, woodCol, zShift} from './014-gamekit.js';
import {DEEPW, PRESETS, SQLV, STOREK} from './023-west-kits.js';
import {barKit} from './026z-barkit.js';
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

  function stool(x,y){ SHARED.PNAME='bar stool'; const bs=[];
    bs.push(...round(x,y,0,2,.24,(dx,dy,z,top)=>top?(Math.hypot(dx,dy)>.2?DP.poleL:DP.pole):sh(DP.pole,.8),1,.04));
    bs.push(pb(x-.035,y-.035,x+.035,y+.035,2,12,DP.pole,{nb:1,fi:(Y,z)=>DP.pole,fj:(X,z)=>DP.poleL}));
    bs.push(...round(x,y,7,8,.15,(dx,dy,z,top)=>top?DP.poleL:DP.pole,1,.04).map(b=>Object.assign(b,{top:(X,Y)=>Math.hypot(X-x,Y-y)>.11?DP.poleL:null})));
    bs.push(...round(x,y,12,14,.1,()=>DP.pole,2,.04));
    bs.push(...round(x,y,14,18,z=>.21+(z<1?-.02:z>3?-.02:0),(dx,dy,z,top)=>{ const r=Math.hypot(dx,dy); if(top)return r>.17?DP.redL:r<.05?DP.redH:r<.12&&(dx+dy)<-.03?DP.redL:DP.red; return z<1?DP.redK:z>3?DP.redL:Math.atan2(dy,dx)>1.6?DP.redH:DP.red; },1,.04));
    return prop(bs); }

  function fridge(x,y){ SHARED.PNAME='drinks fridge'; const D=.78, W=.92, Z=64, x1=x+D, y1=y+W, bs=[], t=.05, F=DP.white;
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

  function airCooler(x,y){ '@later'; SHARED.PNAME='air cooler'; const w=.5, Z=30, G=[150,156,154];
    return prop([fb(x,y,x+w,y+w,0,Z,G,(s,a,row,L,h)=>row<2?sh(G,1.1):row>h-4?sh(G,.7):row>8&&row<h-8&&a>3&&a<L-3?((row>>1)&1?sh(G,.62):sh(G,1.05)):G,
      (X,Y)=>edge(X,Y,x,y,x+w,y+w)<.05?sh(G,1.1):(Math.floor((X-x)*S/2)&1)?sh(G,.6):G,{foot:1})]); }

  
  
  
  function table(x,y,k){ SHARED.PNAME='round table'; const bs=[];
    bs.push(...round(x,y,0,2,.3,(dx,dy,z,top)=>top?DP.blackL:DP.black,1,.04));
    bs.push(pb(x-.05,y-.05,x+.05,y+.05,2,19,DP.black,{nb:1,fj:()=>DP.blackL}));
    bs.push(...round(x,y,19,22,.46,(dx,dy,z,top)=>{ const r=Math.hypot(dx,dy); if(top)return r>.42?DP.woodL:pcVn(dx*12,dy*12,91)<.3?DP.woodD:DP.wood; return z>2?DP.woodL:DP.woodD; },1,.04));
    if(k)bs.push(pb(x+.08,y-.12,x+.16,y-.04,22,27,[200,224,214],{nb:1,top:()=>[200,170,90]}),pb(x-.18,y+.06,x-.04,y+.2,22,23,DP.white,{top:(X,Y)=>Math.hypot(X-(x-.11),Y-(y+.13))<.03?DP.ink:DP.white}));
    return prop(bs); }
  

  
  
  

  function neon(x,y,word){ SHARED.PNAME='neon sign'; const cw=4, L=(word.length*4-1)*cw+16, w=L/S, Z0=0, h=(5*cw+12)/H, bs=[];
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
  
  function doubleDoors(x,y,stick){ '@later'; SHARED.PNAME='double doors'; const L=2.1, Z=76, bs=[];
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
  function woodDoor(x,y){ '@later'; SHARED.PNAME='door'; const L=1.3, Z=76;
    const A=pic(Math.round(L*S),Z*H,put=>{ const w=Math.round(L*S), h=Z*H, lw=w/2;
      box(put,0,0,w,h,DP.wood); box(put,0,0,w,3,DP.woodL);
      for(const o of [0,lw]){ box(put,o,0,o+1,h,DP.woodK); for(const [y0,y1] of [[12,70],[82,h-12]]){ box(put,o+6,y0,o+lw-6,y1,DP.woodD); box(put,o+7,y0+1,o+lw-7,y1-1,DP.wood); box(put,o+7,y0+1,o+lw-7,y0+2,DP.woodL); }
        for(let y=4;y<h;y+=9)if(hash(o,y,99)<.5)box(put,o+3+Math.floor(hash(o,y,98)*(lw-8)),y,o+5+Math.floor(hash(o,y,98)*(lw-8)),y+1,DP.woodD); }
      box(put,lw-8,74,lw-4,78,DP.gold); box(put,lw+4,74,lw+8,78,DP.gold); });
    return prop([fb(x,y,x+.06,y+L,0,Z,DP.wood,(s,a,row)=>s==='px'?A(a,row):DP.wood,DP.wood,{foot:1}),
      fb(x-.02,y-.08,x+.09,y,0,Z+3,DP.woodD,()=>DP.woodD,DP.woodL,{foot:1}),fb(x-.02,y+L,x+.09,y+L+.08,0,Z+3,DP.woodD,()=>DP.woodD,DP.woodL,{foot:1}),fb(x-.02,y-.08,x+.09,y+L+.08,Z,Z+3,DP.woodD,(s,a,row)=>row<1?DP.woodL:DP.woodD,DP.woodL)],null,{hang:0,walk:true,high:true}); }
  
  
  
  function tv(x,y){ SHARED.PNAME='TV'; const L=.86, Z=22;
    const A=pic(Math.round(L*S),Z*H,put=>{ const w=Math.round(L*S), h=Z*H; box(put,0,0,w,h,DP.black); box(put,3,3,w-3,h-3,lit([40,130,60]));
      for(let y=3;y<h-3;y+=6)box(put,3,y,w-3,y+1,lit([50,150,70])); box(put,3,3,w-3,10,lit([30,40,90])); for(let i=0;i<14;i++)box(put,3+hash(i,1,101)*(w-8),5+hash(i,2,101)*4,5+hash(i,1,101)*(w-8),7+hash(i,2,101)*4,lit([220,220,230]));
      for(let i=0;i<6;i++){ const px=6+hash(i,3,101)*(w-12), py=14+hash(i,4,101)*(h-22); box(put,px,py,px+2,py+5,lit(i<3?[220,40,40]:[240,240,240])); }
      box(put,w-14,h-8,w-4,h-4,lit([20,20,30])); });
    const p=prop([fb(x,y,x+.12,y+L,0,Z,DP.black,(s,a,row)=>s==='px'?A(a,row):DP.blackL,DP.blackL,{foot:1,em:1}),pb(x,y+L/2-.08,x+.05,y+L/2+.08,-6,0,DP.blackL)],null,{hang:0,walk:true,high:true});
    LAMPS.push({own:1,room:1,x:x+.9,y:y+L/2,z:Z/2,r:3.5,c:[.55,.8,1],prop:p}); return p; }
  

  function soffit(x,y,L,W){ '@later'; SHARED.PNAME='soffit'; const Z0=106+DZ, Z1=126+DZ, rc=.6, bs=[], x1=x+L, y1=y+W;
    const face=(s,a,row,Lf,h)=>s==='px'||s==='py'?(row<12?(row<1?[200,90,70]:[176,64,46]):row<13?[110,40,30]:row>h-2?[120,84,52]:[176,132,86]):[150,110,70];
    for(let X=x;X<x1-1e-6;X+=.04){ const m=X+.02, yy=m>x1-rc?(y1-rc)+Math.sqrt(Math.max(0,rc*rc-(m-(x1-rc))**2)):y1;
      bs.push(fb(X,y,X+.04,yy,Z0,Z1,[176,64,46],face,(XX,YY)=>edge(XX,YY,x,y,x1,yy)<.06?[150,110,70]:pcVn(XX*3,YY*3,102)<.4?[118,124,104]:[126,132,112],{nb:1,foot:1})); }
    return prop(bs,null,{hang:Z0,walk:true,high:true}); }

  function fan(x,y){ '@later'; SHARED.PNAME='ceiling fan'; const Zc=126+DZ, bs=[], R=1.15, Zb=106+DZ;
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

STOREK.diner={dinerFloorCol,dinerWall};
}

{
function theatreSconce(x,y,n){ '@later'; SHARED.PNAME='wall light'; const B=[110,82,40], A=[255,176,92], bx=x+n[0]*.03;
  return prop([{x0:bx-.03,y0:y-.12,x1:bx+.03,y1:y+.12,z0:58,z1:76,foot:1,c:B,top:()=>B,fi:()=>sh(B,.8),fj:()=>B},
    {x0:bx+n[0]*.06-.06,y0:y-.1,x1:bx+n[0]*.06+.06,y1:y+.1,z0:62,z1:72,foot:0,em:1,c:A,top:()=>[255,214,150],fi:()=>A,fj:()=>sh(A,.92)}],null,{high:true}); }
{
const {FP,H,S,art,F3,txt,pcVn,pcLathe,lit,tone,box,disc,DP,T3,fb,pb,edge,pic,round,BZ,BT,BD,BO,PL,panel,topCol,glassesRow,barStraight,barRound,barCorner,BOTS,leather,sofa,armchair,rug,LEAF,leavesArt,plant,exitSign,blinds,POSTERS,poster,cupboard,up}=barKit(onBar);
 
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  
  
  
  
  function onBar(k,x,x1,y0,y1,bs){ '@later'; const z=BZ+BT, m=(x+x1)/2, yc=(y0+y1)/2+.1;
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
  
  
  
  const FLH=[3,4,4,3,2,4,3,4];
  const flame=(zz,FL)=>{ if(typeof LIFE==='undefined'||LIFE.mode!==1)return null; const hh=FLH[FL.ph]; if(zz>=hh)return null; return lit(zz<1?[255,236,190]:zz<hh-1?[255,190,74]:[246,128,40]); };
  const tcandle=(cx,cy,z,FL)=>[...round(cx,cy,z,z+4,.07,(dx,dy,zz,top)=>top?lit([236,210,170]):lit(zz<1?[150,30,24]:[214,60,48]),1,.03),pb(cx-.012,cy-.012,cx+.012,cy+.012,z+4,z+5,[30,26,24],{nb:1}),
    {x0:cx-.03,y0:cy-.03,x1:cx+.03,y1:cy+.03,z0:z+5,z1:z+10,c:[255,200,90],foot:0,nb:1,life:1,top:()=>null,fi:(v,zz)=>flame(zz-z-5,FL),fj:(u,zz)=>flame(zz-z-5,FL)}];
  const flick=(p,FL,seed)=>{ p.life=t=>{ FL.ph=Math.floor(hash(Math.floor(t*7),seed,425)*8); }; p.lifeKey=()=>FL.ph; };
  function table(x,y,k){ SHARED.PNAME='round table'; const bs=[];
    bs.push(...round(x,y,0,2,.3,(dx,dy,z,top)=>top?DP.blackL:DP.black,1,.04));
    bs.push(pb(x-.05,y-.05,x+.05,y+.05,2,19,DP.black,{nb:1,fj:()=>DP.blackL}));
    bs.push(...round(x,y,19,22,.46,(dx,dy,z,top)=>{ const r=Math.hypot(dx,dy); if(top)return r>.42?DP.woodL:pcVn(dx*12,dy*12,91)<.3?DP.woodD:DP.wood; return z>2?DP.woodL:DP.woodD; },1,.04));
    if(k)bs.push(pb(x+.08,y-.12,x+.16,y-.04,22,27,[200,224,214],{nb:1,top:()=>[200,170,90]}),pb(x-.18,y+.06,x-.04,y+.2,22,23,DP.white,{top:(X,Y)=>Math.hypot(X-(x-.11),Y-(y+.13))<.03?DP.ink:DP.white}));
    const FL={ph:0}; bs.push(...tcandle(x+.16,y+.16,22,FL)); const p=prop(bs); flick(p,FL,Math.round(x*7+y*13)); LAMPS.push({own:1,room:1,day:true,x,y,z:30,r:2.4,c:[.72,.4,.15],prop:p}); return p; }
  

  
  
  
  const BARDARK=true, lt=c=>BARDARK?c:lit(c);
  function neon(x,y,word){ SHARED.PNAME='neon sign'; const cw=4, L=(word.length*4-1)*cw+16, w=L/S, Z0=0, h=(5*cw+12)/H, bs=[];
    const A=pic(L,5*cw+12,put=>{ [...word].forEach((ch,i)=>{ const g=F3[ch]; for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(g[r*3+q]==='1'){ const X=8+(i*4+q)*cw, Y=6+r*cw;
      box(put,X-1,Y-1,X+cw+1,Y+cw+1,BARDARK?[96,40,38]:lit([210,60,52])); } });
      [...word].forEach((ch,i)=>{ const g=F3[ch], on=(r,q)=>r>=0&&r<5&&q>=0&&q<3&&g[r*3+q]==='1'; for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(on(r,q)){ const X=8+(i*4+q)*cw, Y=6+r*cw; box(put,X,Y,X+cw,Y+cw,BARDARK?[120,58,54]:lit([255,150,130])); }
        for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(on(r,q)){ const X=8+(i*4+q)*cw, Y=6+r*cw; const core=BARDARK?[140,74,70]:lit([255,244,226]); box(put,X+1,Y+1,X+cw-1,Y+cw-1,core);
          if(on(r,q+1))box(put,X+cw-1,Y+1,X+cw+1,Y+cw-1,core); if(on(r+1,q))box(put,X+1,Y+cw-1,X+cw-1,Y+cw+1,core); } }); });
    bs.push(fb(x,y,x+.05,y+w,Z0,Z0+h,[40,20,20],(s,a,row)=>s==='px'?A(a,row)||(row<1||row>=(5*cw+12)-1?[70,40,36]:[44,22,20]):[44,22,20],[60,34,30],{foot:1,em:BARDARK?0:1}));
    const G=.9, gh=16;
    if(!BARDARK)bs.push(fb(x-.004,y-G,x+.002,y+w+G,Z0-gh,Z0+h+gh,[200,80,60],(s,a,row)=>{ if(s!=='px')return null; const u=a/S-G, zz=h+gh-row/H, d=Math.hypot(Math.max(0,-u,u-w),Math.max(0,-zz,zz-h)/FP), f=Math.max(0,1-d/G);
      const i=a>>1, j=row>>1, on=f>.6||f>.3&&((i+j)&1)||f>.08&&!(i&1)&&!(j&1); return on?lit([Math.round(170+85*f),Math.round(116-30*f),Math.round(96-30*f)]):null; },()=>null,{nb:1,em:1}));
    const p=prop(bs,null,{hang:Z0,walk:true,high:true}); LAMPS.push({own:1,room:1,x:x+.6,y:y+w/2,z:h/2,r:5.5,c:[1.5,.36,.28],prop:p,off:BARDARK?1:0}); return p; }
  
  
  
  
  function tv(x,y){ SHARED.PNAME='TV'; const L=.86, Z=22;
    const A=pic(Math.round(L*S),Z*H,put=>{ const w=Math.round(L*S), h=Z*H; box(put,0,0,w,h,DP.black); if(BARDARK){ box(put,3,3,w-3,h-3,[22,26,30]); for(let i=0;i<5;i++)box(put,6+i*3,5+i,8+i*3,6+i,[44,50,58]); return; }
      box(put,3,3,w-3,h-3,lit([40,130,60]));
      for(let y=3;y<h-3;y+=6)box(put,3,y,w-3,y+1,lit([50,150,70])); box(put,3,3,w-3,10,lit([30,40,90])); for(let i=0;i<14;i++)box(put,3+hash(i,1,101)*(w-8),5+hash(i,2,101)*4,5+hash(i,1,101)*(w-8),7+hash(i,2,101)*4,lit([220,220,230]));
      for(let i=0;i<6;i++){ const px=6+hash(i,3,101)*(w-12), py=14+hash(i,4,101)*(h-22); box(put,px,py,px+2,py+5,lit(i<3?[220,40,40]:[240,240,240])); }
      box(put,w-14,h-8,w-4,h-4,lit([20,20,30])); });
    const p=prop([fb(x,y,x+.12,y+L,0,Z,DP.black,(s,a,row)=>s==='px'?A(a,row):DP.blackL,DP.blackL,{foot:1,em:BARDARK?0:1}),pb(x,y+L/2-.08,x+.05,y+L/2+.08,-6,0,DP.blackL)],null,{hang:0,walk:true,high:true});
    LAMPS.push({own:1,room:1,x:x+.9,y:y+L/2,z:Z/2,r:3.5,c:[.55,.8,1],prop:p,off:BARDARK?1:0}); return p; }
  function barCandle(x,y){ SHARED.PNAME='candle'; const FL={ph:0}, bs=tcandle(x,y,BZ+BT,FL); for(const b of bs)if(b.z0===BZ+BT)b.foot=1; const p=prop(bs,null,{hang:BZ+BT}); flick(p,FL,Math.round(x*11+y*17)); LAMPS.push({own:1,room:1,day:true,x,y,z:BZ+BT+8,r:2.6,c:[.72,.4,.15],prop:p}); return p; }
  function consoleTV(x,y){ '@later'; SHARED.PNAME='console TV'; const W=.76, D=.48, x0=x-W/2, x1=x+W/2, y0=y-D/2, y1=y+D/2, LZ=7, CZ=34, wood=[104,66,38], woodD=[70,44,26], woodL=[138,92,54], bs=[];
    for(const [lx,ly] of [[x0+.06,y0+.06],[x1-.1,y0+.06],[x0+.06,y1-.1],[x1-.1,y1-.1]])bs.push(pb(lx,ly,lx+.04,ly+.04,0,LZ,woodD));
    bs.push(pb(x0,y0,x1,y1,LZ,LZ+CZ,wood,{top:(X,Y)=>(X-x0)*24%6<1?woodD:woodL,fs:(nx,ny,X,Y,z)=>{ const u=nx?Y-y0:X-x0, zr=z-LZ;
      if(ny>0){ const a=(X-x0)/W; if(zr<9&&a>.12&&a<.88)return (Math.floor(a*W*24)+Math.floor(zr))%2?[86,74,58]:[110,96,74];
        if(zr<11&&zr>=9&&(Math.abs(a-.7)<.04||Math.abs(a-.82)<.04))return [210,196,160];
        if(zr>=12&&zr<CZ-3&&a>.1&&a<.9)return [26,28,30]; }
      return zr>CZ-2?woodL:zr<1?woodD:hash(Math.floor(u*24),Math.floor(zr/3),4711)<.08?woodD:wood; }}));
    for(const s of [-1,1])bs.push(pb(x+s*.04-.008,y-.008,x+s*.04+.008,y+.008,LZ+CZ,LZ+CZ+2,[40,40,44]),pb(x+s*.18-.006,y-.006,x+s*.18+.006,y+.006,LZ+CZ+2,LZ+CZ+15,[170,172,176],{nb:1}));
    const p=prop(bs,null,{});
    const TUBE={x0:x0+W*.1,x1:x0+W*.9,y:y1+.002,z0:LZ+12,z1:LZ+CZ-3};
    p.lifeDraw=(Dd,Wd,Hd,ox,oy,t,K=1)=>{ const [fa,fb2]=vwV(0,1); if(fa+fb2<=0)return;
      const zb=LVZ(V.lv), wf=Math.round((TUBE.x1-TUBE.x0)*24*K), hf=Math.round((TUBE.z1-TUBE.z0)*K), fl=.88+.12*hash(Math.floor(t*14),3,4713), roll=(t*.13)%1;
      for(let i=0;i<wf;i++){ const u=(i+.5)/wf, X=TUBE.x0+u*(TUBE.x1-TUBE.x0), [vx,vy]=vw(X,TUBE.y), bx=((vx-vy)*HW-ox)*K, by=((vx+vy)*HH-oy)*K;
        for(let j=0;j<hf;j++){ const v=(j+.5)/hf, z=TUBE.z1-v*(TUBE.z1-TUBE.z0), X2=Math.floor(bx), Y2=Math.floor(by-(z-zb)*K); if(X2<0||Y2<0||X2>=Wd||Y2>=Hd)continue;
          const cu=Math.min(u,1-u), cv=Math.min(v,1-v); if(cu<.06&&cv<.06&&Math.hypot(.06-cu,.06-cv)>.06)continue;
          let g=crtShow(u,v,t); g*=fl*(1-.35*Math.max(0,1-Math.min(cu,cv)*9))*((j%2)?.82:1)*(Math.abs(v-roll)<.04?1.12:1); g+=(hash(i,j,Math.floor(t*20))-.5)*.08;
          const c=Math.max(0,Math.min(255,40+g*215)), k=(Y2*Wd+X2)*4; Dd[k]=c*.94; Dd[k+1]=c*.97; Dd[k+2]=Math.min(255,c*1.04+6); Dd[k+3]=255; } } };
    LAMPS.push({own:1,room:1,day:true,x,y:y1+.6,z:LZ+22,r:3.2,c:[.36,.4,.46],prop:p}); return p; }
  function crtShow(u,v,t){ '@later'; const sc=Math.floor(t/7)%4, s=t%7, bg=.26;
    if(sc===0){ const r=Math.hypot(u-.5,(v-.45)*1.2), a=Math.atan2(v-.45,u-.5)+s*.6; if(r<.18)return .95; if(r<.42&&Math.floor((a+Math.PI)/(Math.PI*2)*16)%2)return .62-r*.6; return v>.78&&v<.86&&u>.2&&u<.8&&Math.floor(u*30)%3?.8:bg; }
    if(sc===1){ const curt=Math.floor(u*14)%2?.3:.22, hx=.5+Math.sin(s*.7)*.03, mouth=Math.floor(s*6)%2;
      const head=Math.hypot((u-hx)/.1,(v-.3)/.13)<1, body=v>.42&&Math.abs(u-hx)<.2-(v-.42)*.0, shirt=body&&Math.abs(u-hx)<.05*(1-(v-.42)*1.6)&&v<.62;
      if(Math.abs(u-.38)<.012&&v>.4)return .7; if(Math.hypot((u-.38)/.03,(v-.4)/.04)<1)return .85;
      if(head)return Math.abs(u-hx)<.03&&Math.abs(v-.36)<.012*(1+mouth)?.08:Math.abs(v-.27)<.01&&Math.abs(Math.abs(u-hx)-.04)<.012?.1:.82; if(v<.22&&Math.hypot((u-hx)/.11,(v-.22)/.07)<1)return .05;
      if(shirt)return .92; if(body)return .12; return curt; }
    if(sc===2){ const sw=Math.sin(s*2.2)*.05, fig=(cx,tall)=>Math.hypot((u-cx)/.05,(v-(.88-tall))/.06)<1||Math.abs(u-cx)<.05-(v-(.95-tall))*.02&&v>.95-tall+.06&&v<.92;
      if(fig(.42+sw,.55)||fig(.58+sw,.5))return .06; const r=Math.hypot(u-.5-sw,(v-.7)*1.4); return r<.34?.75-r:bg*(v>.92?1.6:1); }
    { const bx=.5, k=s*2.4, balls=[0,1,2].map(i=>{ const ph=(k+i*2.1)%(Math.PI*2); return [bx+Math.cos(ph)*.16,.42-Math.abs(Math.sin(ph))*.24]; });
      for(const [bu,bv] of balls)if(Math.hypot(u-bu,v-bv)<.035)return .95; if(Math.hypot((u-bx)/.07,(v-.52)/.09)<1)return .8; if(v>.6&&Math.abs(u-bx)<.12-(v-.6)*.1)return .1; return v>.88?.4:bg; } }
  

  function soffit(x,y,L,W){ '@later'; SHARED.PNAME='soffit'; const Z0=106, Z1=126, rc=.6, bs=[], x1=x+L, y1=y+W;
    const face=(s,a,row,Lf,h)=>s==='px'||s==='py'?(row<12?(row<1?[200,90,70]:[176,64,46]):row<13?[110,40,30]:row>h-2?[120,84,52]:[176,132,86]):[150,110,70];
    for(let X=x;X<x1-1e-6;X+=.04){ const m=X+.02, yy=m>x1-rc?(y1-rc)+Math.sqrt(Math.max(0,rc*rc-(m-(x1-rc))**2)):y1;
      bs.push(fb(X,y,X+.04,yy,Z0,Z1,[176,64,46],face,(XX,YY)=>edge(XX,YY,x,y,x1,yy)<.06?[150,110,70]:pcVn(XX*3,YY*3,102)<.4?[118,124,104]:[126,132,112],{nb:1,foot:1})); }
    return prop(bs,null,{hang:Z0,walk:true,high:true}); }

  function fan(x,y){ '@later'; SHARED.PNAME='ceiling fan'; const Zc=126, bs=[], R=1.15, Zb=106;
    bs.push(pb(x-.02,y-.02,x+.02,y+.02,108,Zc,DP.black,{nb:1,foot:1}));
    bs.push(...round(x,y,104,110,z=>.13-(z>4?.04:0),(dx,dy,z,top)=>top?DP.blackL:z>2&&z<3.5?[180,40,36]:Math.atan2(dy,dx)>1.4?DP.blackL:DP.black,1,.03));
    bs.push(...round(x,y,92,104,z=>.17*Math.sqrt(Math.max(.05,1-((z-7)/7)**2)),(dx,dy,z,top)=>z>10?lt([200,190,170]):lt(z<4?[255,250,226]:Math.atan2(dy,dx)>1.2?[255,252,236]:[250,236,200]),1,.03).map(b=>Object.assign(b,{em:BARDARK?0:1})));
    bs.push({x0:x-R,y0:y-R,x1:x+R,y1:y+R,z0:Zb,z1:Zb+.5,c:[0,0,0],foot:1,nb:1,top:()=>null,fi:()=>null,fj:()=>null,ghost:1});
    const p=prop(bs,null,{hang:92,walk:true,high:true,lifeK:2});
    const BL=[[120,78,46],[150,100,60],[90,56,30]];
    p.lifeDraw=(D,W,Hh,ox,oy,t,K=1)=>{ const hub=p.boxes.find(b=>b.ghost); if(!hub)return; const cx=(hub.x0+hub.x1)/2, cy=(hub.y0+hub.y1)/2, z=hub.z0-LVZ(V.lv), a0=t*5.2;
      for(let k=0;k<4;k++){ const a=a0+k*Math.PI/2, ca=Math.cos(a), sa=Math.sin(a);
        for(let r=.16;r<R;r+=.012/K)for(let q=-1;q<=1;q+=.25/K){ const wd=r<.3?.05:.11+.02*Math.sin((r-.3)/(R-.3)*3), X=cx+ca*r-sa*q*wd, Y=cy+sa*r+ca*q*wd, [vx,vy]=vw(X,Y);
          const px=Math.floor(((vx-vy)*HW-ox)*K), py=Math.floor(((vx+vy)*HH-z-oy)*K); if(px<0||py<0||px>=W||py>=Hh)continue;
          const c=r<.3?DP.black:Math.abs(q)>.8||r>R-.03?BL[2]:q<-.3?BL[1]:BL[0], i=(py*W+px)*4; D[i]=c[0]; D[i+1]=c[1]; D[i+2]=c[2]; D[i+3]=255; } } };
    LAMPS.push({own:1,room:1,x,y,z:96,r:9.5,c:[.9,.88,.68],prop:p}); return p; }


  function stage(x,y,L,W){ '@later'; SHARED.PNAME='stage'; const Z=14, x1=x+L, y1=y+W, K=[22,20,22], G=[188,146,58], bs=[];
    bs.push(fb(x,y,x1,y1,0,Z,K,(s,a,row,Lf,h)=>row<2?G:row>h-2?[12,10,12]:(a%(S*.5|0))<1?[34,30,32]:K,(X,Y)=>edge(X,Y,x,y,x1,y1)<.04?G:(Math.floor(Y*S/5)&1)?[30,26,30]:[36,32,36],{foot:1}));
    bs.push(fb(x+L/2-.5,y1,x+L/2+.5,y1+.3,0,7,K,(s,a,row)=>row<1?G:K,(X,Y)=>edge(X,Y,x+L/2-.5,y1,x+L/2+.5,y1+.3)<.03?G:[36,32,36],{foot:1}));
    return prop(bs,null,{stands:[{x0:x,y0:y,x1,y1,z:Z}]}); }
  function micStand(x,y,z0,len,cord){ '@later'; SHARED.PNAME=cord?'microphone cord':'microphone stand'; const bs=[], Z=v=>z0+v, CH=[208,210,214], CR=[22,20,24], IR=[40,38,44];
    if(!cord){
    for(let r=0;r<4;r++){ const w=.09-r*.018; bs.push(fb(x-w,y-w*.8,x+w,y+w*.8,Z(r*.5),Z(r*.5+.5),IR,()=>IR,r===3?[70,68,76]:IR,{foot:r===0?1:0})); }
    bs.push(fb(x-.022,y-.022,x+.022,y+.022,Z(2),Z(34),CH,(s,a,row)=>row%5===0?[240,242,246]:CH,CH));
    bs.push(fb(x-.03,y-.03,x+.03,y+.03,Z(33),Z(35.5),IR,()=>IR,IR));
    for(let k=0;k<5;k++)bs.push(fb(x-.024,y-.03-k*.022,x+.024,y-.008-k*.022,Z(35.2+k*.35),Z(36.4+k*.35),CR,()=>CR,CR));
    bs.push(fb(x-.032,y-.17,x+.032,y-.118,Z(36.4),Z(39),CH,(s,a,row)=>(a+row)&1?[150,152,158]:[230,232,236],(X,Y)=>((X*90|0)+(Y*90|0))&1?[150,152,158]:[230,232,236]));
    bs.push(fb(x+.022,y-.012,x+.04,y+.012,Z(1),Z(34),CR,()=>CR,CR)); }
    let px=x+.04, py=y; for(let i=1;i<=Math.round(len*40);i++){ const u=i/(len*40), cx=x+.04+Math.sin(u*7.5)*.16*(1-u*.6), cy=y-u*len;
      bs.push(fb(Math.min(px,cx)-.016,Math.min(py,cy)-.016,Math.max(px,cx)+.016,Math.max(py,cy)+.016,Z(0),Z(.6),CR,()=>CR,[34,32,36],{foot:i===1?1:0})); px=cx; py=cy; }
    return prop(bs,null,cord?{walk:true}:{}); }
  function guitarCase(x,y,z0){ '@later'; SHARED.PNAME='open guitar case'; const bs=[], Z=v=>z0+v, L=.92, K=[26,22,22], KH=[60,54,52], RD=[138,22,34];
    const w=u=>u<.2?.36*Math.sqrt(Math.max(.08,1-((u-.2)/.21)**2)):u<.4?.36-.09*Math.sin((u-.2)/.2*Math.PI/2):u<.52?.27+.04*Math.sin((u-.4)/.12*Math.PI/2):u<.62?.31-.18*(u-.52)/.1:.13;
    const N=28, x0=x-L/2, HL=Math.round(.36*33.9*.94);
    for(let i=0;i<N;i++){ const u=(i+.5)/N, W=Math.min(.36,w(u)), X0=x0+L*i/N, X1=x0+L*(i+1)/N, Y0=y-W/2, Y1=y+W/2;
      bs.push(fb(X0,Y0,X1,Y1,Z(0),Z(3.5),K,(s,a,row)=>row<1?KH:K,(X,Y)=>{ const e=Math.min(Y-Y0,Y1-Y,i===0?X-X0:1,i===N-1?X1-X:1); if(e<.022)return KH;
        const h=hash(X*80|0,Y*80|0,377); if(h<.012)return [214,180,80]; if(h<.02)return [200,202,206]; if(Math.abs(X-(x0+.3))<.05&&Math.abs(Y-y-.03)<.03)return [96,128,84];
        return h<.5?RD:[118,16,28]; },{foot:1}));
      for(let k=0;k<HL;k++){ const yb=Y0-(k+1)/HL*W*.34; bs.push(fb(X0,yb,X1,yb+W*.34/HL+.004,Z(3.5+k),Z(4.5+k),K,(s,a,row)=>s==='py'?(k===HL-1?KH:RD):K,k===HL-1?KH:K)); } }
    for(const u of [.15,.55,.85])bs.push(fb(x0+L*u-.012,y+.16,x0+L*u+.012,y+.185,Z(1),Z(2.6),[214,176,72],()=>[190,150,60],[226,190,96]));
    return prop(bs,null,{}); }
  function stageCloth(x,y,L){ SHARED.PNAME='stage cloth'; return prop([fb(x,y,x+L,y+.06,0,112,[16,14,18],(s,a,row)=>(a%14<2)?[10,8,10]:[18,16,20],[16,14,18],{foot:1})],null,{hang:0,walk:true,high:true}); }
  function grand(x,y,z0){ '@later'; SHARED.PNAME='grand piano'; const W=1.32, L=1.62, x0=x-W/2, x1=x+W/2, y1=y-.136, y0=y1-L, bs=[], Z=v=>z0+v;
    const K=[20,18,22], KH=[64,60,70], tail=t=>y0+L*.55*Math.pow(Math.max(0,Math.min(1,(t-.18)/.82)),1.35)*(1-.0*t);
    const lac=(s,a,row,Lf,h)=>row<1?KH:(a%9===4&&row<h-2)?[30,28,34]:K;
    const N=30; for(let i=0;i<N;i++){ const ta=i/N, tb=(i+1)/N, X0=x0+W*ta, X1=x0+W*tb, Y0=tail((ta+tb)/2);
      bs.push(fb(X0,Y0,X1,y1,Z(17),Z(30.5),K,lac,(X,Y)=>{ const t=(X-x0)/W, e=Math.min(X-x0,x1-X,Y-tail(t),y1-Y); return e<.035?KH:(Math.floor((X+Y)*30)%7===0?[30,28,34]:K); },{foot:i===0||i===N-1?1:0})); }
    bs.push(fb(x-.36,y1-.24,x+.36,y1-.2,Z(30.5),Z(41),K,(s,a,row,Lf,h)=>s==='py'&&row>1&&row<h-1&&Math.abs(a-Lf/2)<Lf*.22?(row%3===1?[150,146,136]:[232,228,214]):row<1?KH:K,KH));
    bs.push(fb(x-.55,y1,x+.55,y+.02,Z(17),Z(20.3),K,lac,[40,36,40],{foot:1}));
    bs.push(fb(x-.55,y1-.06,x+.55,y1,Z(20.3),Z(24.5),K,lac,KH));
    for(const s of [-1,1])bs.push(fb(s<0?x-.66:x+.55,y1,s<0?x-.55:x+.66,y+.02,Z(17),Z(23),K,lac,KH,{foot:1}));
    for(const [lx,ly] of [[x0+.12,y1-.1],[x1-.12,y1-.1],[x0+.45,y0+.32]])bs.push(fb(lx-.05,ly-.05,lx+.05,ly+.05,Z(0),Z(17),K,(s,a,row,Lf,h)=>row>h-2?[200,160,70]:lac(s,a,row,Lf,h),K,{foot:1}));
    bs.push(fb(x-.06,y-.16,x+.06,y-.12,Z(1),Z(17),K,lac,K));
    for(const d of [-.045,0,.045])bs.push(fb(x+d-.014,y-.12,x+d+.014,y-.04,Z(1.5),Z(2.5),[200,160,70],()=>[168,128,52],[226,190,96]));
    return prop(bs,null,{}); }

  function poolTable(x,y){ '@later'; SHARED.PNAME='pool table'; const hx=1.08, hy=.62, x0=x-hx, x1=x+hx, y0=y-hy, y1=y+hy, bs=[];
    const FE=[26,90,56], FED=[16,60,40], FEL=[40,112,72], WD=[88,56,32], WK=[52,34,20], WL=[150,104,64], RL=[26,20,18];
    const ZL=15, ZA=19, ZB=19.6, ZR=22;
    for(const lx of [x0+.15,x1-.15])for(const ly of [y0+.15,y1-.15])bs.push(fb(lx-.075,ly-.075,lx+.075,ly+.075,0,ZL,WK,(s,a,row,L,h)=>row<2?WD:row>h-2?RL:a%6<1?WK:WD,WD,{foot:1}));
    for(const [ax0,ay0,ax1,ay1] of [[x0,y0,x1,y0+.15],[x0,y1-.15,x1,y1],[x0,y0,x0+.15,y1],[x1-.15,y0,x1,y1]])
      bs.push(fb(ax0,ay0,ax1,ay1,ZL,ZA,WD,(s,a,row,L,h)=>row<1?WL:row>h-2?WK:hash(a,row,311)<.06?WK:[96,62,36],WD,{foot:0}));
    const bx0=x0+.15, by0=y0+.15, bx1=x1-.15, by1=y1-.15;
    bs.push(fb(bx0,by0,bx1,by1,ZA,ZB,FE,()=>FED,(X,Y)=>{ const e=edge(X,Y,bx0,by0,bx1,by1); if(e<.03)return FED; const n=pcVn(X*8,Y*8,312); return n<.25?FED:n>.86?FEL:FE; },{foot:0}));
    const pk=.11, pockets=[[bx0,by0],[bx1,by0],[bx0,by1],[bx1,by1],[x,by0],[x,by1]];
    const railSeg=(rx0,ry0,rx1,ry1)=>{ if(rx1-rx0<.02||ry1-ry0<.02)return; bs.push(fb(rx0,ry0,rx1,ry1,ZA,ZR,WD,(s,a,row,L,h)=>row<1?FE:row<2?FED:row>h-2?WK:a%5<1?WK:WD,(X,Y)=>edge(X,Y,rx0,ry0,rx1,ry1)<.025?WL:WD)); };
    for(const ry of [[by0-.07,by0],[by1,by1+.07]]){ railSeg(bx0+pk,ry[0],x-pk,ry[1]); railSeg(x+pk,ry[0],bx1-pk,ry[1]); }
    for(const rx of [[bx0-.07,bx0],[bx1,bx1+.07]])railSeg(rx[0],by0+pk,rx[1],by1-pk);
    for(const [px,py] of pockets)bs.push(...round(px,py,ZA-1,ZR,()=>pk*.92,(dx,dy,z,top)=>top?(Math.hypot(dx,dy)<pk*.6?[8,6,6]:RL):RL,3,.04));
    const BALL=[[230,60,50],[60,110,220],[240,200,60],[120,60,160],[230,120,40],[40,140,80],[160,30,40],[32,30,36],[120,160,230],[230,170,40]];
    const ballAt=(bx,by,cc)=>bs.push(...round(bx,by,ZB,ZB+1.4,z=>.028*Math.sqrt(Math.max(.06,1-((z-.7)/.72)**2)),()=>cc,2,.022));
    let bi=0; const ax=x+hx*.42;
    for(let r=0;r<4;r++)for(let c=0;c<=r;c++)ballAt(ax+r*.06,y+(c-r/2)*.06,BALL[bi++%BALL.length]);
    ballAt(x-hx*.5,y+.1,[240,240,236]);
    let px0=x-.78, py0=y-hy-.05; for(let i=1;i<=16;i++){ const t=i/16, cx=x-.78+t*1.68, cy=y-hy-.05+t*.1, w=.013+.011*(1-t);
      bs.push(pb(Math.min(px0,cx)-w,Math.min(py0,cy)-w,Math.max(px0,cx)+w,Math.max(py0,cy)+w,ZR+.3,ZR+.3+w*2,t<.1?[30,24,20]:t>.88?[60,40,28]:[196,166,108],{nb:1})); px0=cx; py0=cy; }
    const PZ=52; bs.push(pb(x-.02,y-.02,x+.02,y+.02,PZ+9,106,[30,30,32],{nb:1,foot:0}));
    bs.push(fb(x-.52,y-.13,x+.52,y+.13,PZ+7,PZ+9,[36,42,36],()=>[26,32,26],[52,58,52],{nb:1}));
    bs.push(fb(x-.52,y-.12,x+.52,y+.12,PZ,PZ+7,[32,38,32],(s,a,row,L,h)=>row>h-2?[16,20,16]:[44,52,44],()=>null,{nb:1}));
    bs.push(fb(x-.5,y-.1,x+.5,y+.1,PZ-.6,PZ,lt([255,218,150]),()=>lt([255,224,160]),lt([255,214,146]),{nb:1,em:1}));
    const p=prop(bs,null,{solids:[{x0,y0,x1,y1}]}); LAMPS.push({own:1,room:1,day:true,x,y,z:PZ,r:4.6,c:[1,.84,.5],prop:p}); return p; }
  function dartboard(x,y){ '@later'; SHARED.PNAME='dartboard'; const D=.44, Z=10.6, w=Math.round(D*S), h=Math.round(Z*H);
    const CAB=[40,30,24], BL=[224,212,176], BK=[28,24,22], RE=[182,42,40], GR=[38,120,70], WI=[158,158,164];
    const A=pic(w,h,put=>{ const cx=w/2, cy=h/2, R=Math.min(cx,cy)-1;
      for(let Y=0;Y<h;Y++)for(let X=0;X<w;X++){ const dx=X-cx+.5, dy=Y-cy+.5, r=Math.hypot(dx,dy); if(r>R){ if(r<R+2)put(X,Y,BK); continue; }
        const a=(Math.atan2(dy,dx)+Math.PI)/(Math.PI*2), seg=Math.floor(a*20+.5)%20, light=seg&1, rr=r/R; let c;
        if(rr<.07)c=RE; else if(rr<.13)c=GR; else if(rr>.9)c=light?RE:GR; else if(rr>.55&&rr<.62)c=light?RE:GR; else c=light?BL:BK;
        if(Math.abs((a*20+.5)%1-.5)<.035&&rr>.13)c=WI; put(X,Y,c); } });
    const bs=[fb(x,y-.03,x+.05,y+D+.03,-.03,Z+.03,CAB,(s,a,row,L,hh)=>s!=='px'?CAB:(a<2||a>=L-2||row<2||row>=hh-2?[54,42,34]:A(a-1,hh-1-row)||CAB),[56,44,36],{foot:1})];
    for(const [fy,fz,fc] of [[.5,.6,[220,60,60]],[.44,.52,[240,220,70]],[.56,.5,[70,160,220]]]){ const cy=y+fy*D, cz=fz*Z;
      bs.push(pb(x+.04,cy-.006,x+.14,cy+.006,cz,cz+.012,[182,182,188],{nb:1}),fb(x+.13,cy-.022,x+.2,cy+.022,cz-.018,cz+.018,fc,()=>sh(fc,.75),fc,{nb:1})); }
    return prop(bs,null,{hang:0,walk:true,high:true}); }
  function staircase(x,y){ '@later'; SHARED.PNAME='staircase'; const W=1.6, steps=13, run=.26, rise=5.2, top=steps*rise, x1=x+W, bs=[];
    const WD=[104,66,38], WK=[60,38,22], WL=[150,104,64], RUN=[84,52,30];
    for(let i=0;i<steps;i++){ const sy=y+i*run, z=top-(i+1)*rise;
      bs.push(fb(x,sy,x1,sy+run+.05,z,z+rise,WD,(s,a,row,L,h)=>row>h-2?WL:row<1?WK:(s==='py'?RUN:a%7<1?WK:WD),(X,Y)=>edge(X,Y,x,sy,x1,sy+run+.05)<.03?WL:hash(Math.floor(X*40),Math.floor(Y*40),331)<.1?WK:WD,{foot:i===steps-1?1:0})); }
    for(const sx of [x-.07,x1])bs.push(fb(sx,y,sx+.07,y+steps*run,0,top,WK,(s,a,row)=>row<1?WD:WK,WD,{foot:1}));
    for(let i=0;i<steps;i+=2){ const sy=y+i*run, z=top-(i+1)*rise; bs.push(pb(x1+.01,sy+.08,x1+.07,sy+.15,z+rise,z+rise+13,WD,{nb:1,top:()=>WL})); }
    for(let i=0;i<steps;i++){ const sy=y+i*run, z=top-(i+1)*rise; bs.push(fb(x1,sy,x1+.08,sy+run+.05,z+rise+13,z+rise+15,WD,()=>WK,WL,{nb:1})); }
    bs.push(fb(x,y-.72,x1,y,top-rise,top,WD,(s,a,row,L,h)=>row>h-2?WL:row<1?WK:WD,WL,{foot:0}));
    bs.push(fb(x+.32,y-.74,x1-.32,y-.68,top,top+30,[72,46,28],(s,a,row,L,h)=>a<2||a>L-2||row<2||row>h-2?WK:Math.abs(a-L/2)<2?WK:[94,60,36],[58,38,22]));
    const p=prop(bs,null,{solids:[{x0:x-.07,y0:y,x1:x1+.08,y1:y+steps*run}]});
    LAMPS.push({own:1,room:1,day:true,x:x+W/2,y:y-.3,z:top+12,r:4.4,c:[.52,.62,.9],prop:p}); return p; }

  var barFloorCol=(x,y)=>{ const c=woodCol(x,y); return [c[0]*.5|0,c[1]*.4|0,c[2]*.34|0]; };
  var barWall=(q,nx,ny,X,Y,z,f)=>{ const u=nx?Y:X, zz=z%STORY; if(zz<4)return sh([30,18,16],f); if(zz<38)return sh((u*24|0)%16<1?[68,22,20]:zz>35?[112,40,34]:[88,30,26],f);
    if(zz<40)return sh([150,112,58],f); if(zz>112)return sh([26,20,26],f); return sh(speck([74,46,60],u,z/24,97),f); };

  
  const C={'bar counter':(x,y)=>barStraight(x-.9,y-BD/2,1.8,null),'bar counter: ashtray':(x,y)=>barStraight(x-.9,y-BD/2,1.8,0),
    'bar counter: bottle':(x,y)=>barStraight(x-.9,y-BD/2,1.8,1),'bar counter: glass':(x,y)=>barStraight(x-.9,y-BD/2,1.8,2),
    'bar round end':(x,y)=>barRound(x-.56,y-.56),'bar corner':(x,y)=>barCorner(x-BD/2,y-1.5,3.02),'back bar':(x,y)=>backBar(x-2.6,y-.31,5.2),
    'bar stool':(x,y)=>stool(x,y),'bar fridge':(x,y)=>fridge(x-.39,y-.46),
    'red leather sofa':(x,y)=>sofa(x-.46,y-1.1),'red leather armchair':(x,y)=>armchair(x-.47,y-.475),'bar table':(x,y)=>table(x,y,1),
    'red rug':(x,y)=>rug(x-1.9,y-.65,3.8,1.3),'potted palm':(x,y)=>plant(x,y,true),'potted plant':(x,y)=>plant(x,y,false),
    'neon sign: BAR':(x,y)=>up(neon(x-.03,y-.62,'BAR'),86),'neon sign: LIVE':(x,y)=>up(neon(x-.03,y-.79,'LIVE'),86),'exit sign, lit':(x,y)=>up(exitSign(x-.05,y-.31),90),
    'bar window blinds':(x,y)=>up(blinds(x-.02,y-.65,1.3,70),34),'bar blinds':(x,y)=>up(blinds(x-.02,y-2.3,4.6,72),30),'TV on a bracket':(x,y)=>up(tv(x-.06,y-.43),74),'black cupboard':(x,y)=>cupboard(x-.31,y-.46),
    'bar soffit':(x,y)=>soffit(x-4.4,y-1.4,8.8,2.8),'ceiling fan':(x,y)=>fan(x,y),'small stage':(x,y)=>stage(x-1.6,y-1.1,3.2,2.2),'stage cloth':(x,y)=>stageCloth(x-1.8,y-.03,3.6),
    'stage':(x,y)=>stage(x-2.2,y-1.3,4.4,2.6),'wide stage cloth':(x,y)=>stageCloth(x-2.4,y-.03,4.8),'grand piano':(x,y)=>grand(x,y,0),'grand piano on a stage':(x,y)=>grand(x,y,14),
    'candle on the bar':(x,y)=>barCandle(x,y),'console TV':(x,y)=>consoleTV(x,y),
    'pool table':(x,y)=>poolTable(x,y),'dartboard':(x,y)=>up(dartboard(x-.025,y-.22),48),'staircase':(x,y)=>staircase(x-.8,y),
    'microphone stand on a stage':(x,y)=>micStand(x,y,14,1.6),'microphone cord on a stage':(x,y)=>micStand(x,y,14,1.6,true),'microphone stand':(x,y)=>micStand(x,y,0,1.2),'open guitar case':(x,y)=>guitarCase(x,y,0)};
  for(const n of Object.keys(POSTERS))C['poster: '+n]=(x,y)=>{ const [L,h]=n==='moon shrine'?[.62,40]:n==='night painting'?[.5,30]:n==='190 street'?[.5,30]:[.55,34]; return up(poster(x-.02,y-L/2,n,L,h),n==='190 street'?42:n==='ghost sale'?50:46); };
  Object.assign(CATALOG,C);
  CAT_DEPTS.push(['bar','Bar']);
  const info=(no,name,price,desc,mat)=>({no:'B-7'+String(no).padStart(2,'0'),name,dept:'bar',price,desc,mat});
  Object.assign(CAT_INFO,{
    'bar counter':info(1,'Bar Counter',1800,'A run of oxblood bar, a step along its foot, shelves of glasses on the inside.','oak, lacquer'),
    'bar counter: ashtray':info(2,'Bar Counter with an Ashtray',1820,'The bar, an ashtray, the napkins and the sauces out.','oak, lacquer'),
    'bar counter: bottle':info(3,'Bar Counter with a Bottle',1810,'The bar, a bottle of beer and a glass left on it.','oak, lacquer'),
    'bar counter: glass':info(4,'Bar Counter with a Glass',1805,'The bar, a glass on a mat.','oak, lacquer'),
    'bar round end':info(5,'Bar Counter, Round End',1400,'The bar\'s end, curving back to the wall.','oak, lacquer'),
    'bar corner':info(6,'Bar Counter, Corner',2200,'The bar turning back to the wall, the till on it.','oak, lacquer'),
    'back bar':info(7,'Back Bar',3400,'Cupboards under a steel top: a sink, a row of bottles, glasses on towels.','oak, steel'),
    'bar stool':info(8,'Bar Stool',120,'A red cushion on a green pole.','steel, vinyl'),
    'bar fridge':info(9,'Drinks Fridge',900,'A glass-door fridge of bottles and cans, lit blue.','steel, glass'),
    'red leather sofa':info(11,'Red Leather Sofa',1600,'A deep red sofa with rolled arms.','leather, oak'),
    'red leather armchair':info(12,'Red Leather Armchair',800,'A club chair, its back in channels.','leather, oak'),
    'bar table':info(13,'Round Table',260,'A small round table on one foot, a glass, an ashtray and a candle on it.','walnut, cast iron'),
    'red rug':info(14,'Red Runner',180,'A long deep red rug.','wool'),
    'potted palm':info(15,'Potted Palm',140,'A big spiky palm in a clay pot.','living'),
    'potted plant':info(16,'Potted Plant',90,'A tall spiky plant in a grey pot.','living'),
    'neon sign: BAR':info(17,'Neon Sign, BAR',650,'BAR in red tube. It glows.','glass, neon'),
    'neon sign: LIVE':info(18,'Neon Sign, LIVE',700,'LIVE in red tube. It glows.','glass, neon'),
    'exit sign, lit':info(19,'Exit Sign',45,'EXIT, lit.','plastic'),
    'bar window blinds':info(22,'Window Blinds',60,'Blinds drawn in a wood frame.','aluminium, oak'),
    'bar blinds':info(23,'Bar Blinds',180,'A wide window of blinds, drawn.','aluminium, oak'),
    'TV on a bracket':info(24,'TV on a Bracket',300,'A small set high on the wall, the game on.','plastic, glass'),
    'black cupboard':info(25,'Black Cupboard',110,'A low black cupboard, straws and a cup on it.','steel'),
    'bar soffit':info(26,'Bar Soffit',900,'A dropped ceiling over the bar, its edge banded red.','plaster, oak'),
    'ceiling fan':info(27,'Ceiling Fan',240,'Four wooden blades that turn, a frosted globe that lights.','steel, oak, glass'),
    'small stage':info(34,'Small Stage',1500,'A low black stage with a gilt edge.','pine'),
    'stage cloth':info(35,'Stage Cloth',300,'A black cloth hung in folds, a stage\'s backing.','velvet'),
    'stage':info(36,'Stage',2400,'A black stage with a gilt edge, room for a piano and a player.','pine'),'wide stage cloth':info(37,'Wide Stage Cloth',420,'A wide black cloth hung in folds.','velvet'),
    'grand piano':info(38,'Grand Piano',42000,'A six-foot grand in black lacquer, the lid down.','spruce, maple, iron, felt'),'grand piano on a stage':info(39,'Grand Piano (on a stage)',42000,'The grand, standing on a stage.','spruce, maple, iron, felt'),
    'microphone stand':info(40,'Microphone Stand',160,'A chrome stand, a microphone at a singer\'s mouth, its cord over the floor.','steel, chrome'),'microphone stand on a stage':info(41,'Microphone Stand (on a stage)',160,'The stand, on a stage.','steel, chrome'),'microphone cord on a stage':info(43,'Microphone Cord (on a stage)',20,'A black cord over the stage to the wall.','rubber, copper'),
    'open guitar case':info(42,'Open Guitar Case',120,'A hard case lying open, red plush, a few coins in it.','wood, vinyl, plush'),
    'candle on the bar':info(43,'Candle on the Bar',12,'A candle in red glass, standing on the counter.','wax, glass'),'console TV':info(44,'Console TV',380,'A walnut set on four legs, rabbit ears on top, a late show on in black and white.','walnut, glass, cloth'),
    'pool table':info(45,'Pool Table',3200,'A slate bed under green felt, six pockets, a rack of balls and a cue, a low light over it.','slate, oak, felt'),
    'dartboard':info(46,'Dartboard',70,'A board in twenty beds with a red bull, three darts in it.','sisal, wire'),
    'staircase':info(47,'Staircase',1800,'A wooden flight up to a door, the street light spilling down it.','oak'),
    'poster: koi night':info(28,'Poster, Koi Night',15,'The koi pond on the moon shrine\'s roof, by night.','paper'),
    'poster: ghost sale':info(29,'Poster, Ghost Shop',15,'The ghost shop\'s sale.','paper'),
    'poster: hover taxi':info(30,'Poster, Hover Taxi',15,'Every 30 seconds, down the street.','paper'),
    'poster: moon shrine':info(31,'Poster, Moon Shrine',20,'The shrine on the roof.','paper'),
    'poster: 190 street':info(32,'Poster, 190 Street',15,'The line to 190 Street.','paper'),
    'poster: night painting':info(33,'Painting, Night',90,'A small dark painting of the river at night.','oil, canvas')});
  for(const k of Object.keys(C))KIND_OF[k]=k; }
const IMC={spruce:[222,184,122],spruceD:[196,156,98],rose:[92,48,30],roseD:[70,36,22],maple:[214,170,110],mahog:[128,62,34],mahogD:[98,44,24],ebony:[26,22,20],ivory:[236,228,206],
  black:[24,24,28],chrome:[200,202,210],chromeD:[130,132,140],red:[176,30,26],redD:[120,18,16],burst:[200,90,28],brass:[200,160,70],brassD:[150,112,40],bronze:[196,150,60],steel:[188,190,198],
  head:[232,226,210],shell:[150,24,22],shellD:[110,16,14],wood:[150,96,52],woodD:[110,66,34],varnish:[176,86,30],varnishD:[130,58,18],felt:[60,40,40],silver:[210,212,220],string:[220,220,224]};
const imB=(x0,y0,x1,y1,z0,z1,c,o={})=>sided({x0,y0,x1,y1,z0,z1,c,foot:z0===0?1:0,top:()=>sh(c,1.08),fs:(nx,ny,X,Y,z,k)=>sh(c,k),...o});
function imFlat(B,x,y,z0,z1,w,d,c,cs,face){ for(let z=z0;z<z1;z++){ const h=w(z-z0); if(h<=0)continue; B.push(imB(x-h,y-d,x+h,y+d,z,z+1,c,{foot:z===0?1:0,top:()=>sh(c,1.05),
  fs:(nx,ny,X,Y,zz,k)=>{ if(ny>0){ const f=face&&face(X-x,z-z0); return sh(f||c,k); } return sh(cs,k*(ny<0?.9:1)); }})); } }
function imRound(B,x,y,z0,z1,r,c,o={}){ '@later'; for(let z=z0;z<z1;z++){ const R=r(z-z0); if(R<=0)continue; const d=R*.41;
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
const imGuitarProp=(name,o)=>(x,y)=>{ SHARED.PNAME=name; const p=prop(imGuitar(x,y,o),null,{music:name}); return imOpts(p,name); };
function imAmp(B,x,y){ '@later'; const c=IMC.black; B.push(imB(x-.26,y-.15,x+.26,y+.15,0,15,c,{fs:(nx,ny,X,Y,z,k)=>ny>0&&z>2&&z<11&&Math.abs(X-x)<.22?sh(hash(Math.floor(X*48),Math.floor(z),4501)<.3?[60,58,54]:[44,42,40],k):ny>0&&z>=12?sh(IMC.chromeD,k):sh(c,k)}));
  for(let i=0;i<4;i++)B.push(imB(x-.18+i*.1,y+.13,x-.16+i*.1,y+.16,12,14,IMC.chrome)); }
function imHarp(x,y){ '@later'; SHARED.PNAME='harp'; const B=[], c=IMC.varnish, H=44;
  B.push(imB(x-.32,y-.12,x+.32,y+.12,0,3,IMC.varnishD));
  B.push(imB(x-.3,y-.04,x-.24,y+.04,3,H,c));
  for(let i=0;i<14;i++){ const xx=x-.24+i*.04; const zt=H-2-Math.round(Math.sin(i/13*Math.PI)*4)-i*.6; B.push(imB(xx,y-.04,xx+.04,y+.04,zt,zt+4,c)); }
  for(let z=3;z<H-6;z++){ const xx=x+.28-(z-3)/(H-9)*.48; B.push(imB(xx,y-.06,xx+.06,y+.06,z,z+1,IMC.spruceD,{fs:(nx,ny,X,Y,zz,k)=>sh(ny!==0?IMC.spruce:IMC.varnish,k)})); }
  B.push(imB(x-.24,y-.002,x+.3,y+.002,3,H-3,IMC.string,{top:()=>null,fs:(nx,ny,X,Y,z,k)=>{ if(!ny)return null; const i=Math.floor((X-(x-.24))/.016); if(Math.abs((X-(x-.24))-(i+.5)*.016)>.004)return null;
    const zb=3+((x+.28)-(x-.24+(i+.5)*.016))/.48*(H-9), zt=H-6-i*.18; const zz=z+3; if(zz<zb||zz>zt)return null; return sh(i%7===0?[180,40,40]:i%7===3?[40,60,120]:IMC.string,k); }}));
  const p=prop(B,null,{music:'harp'}); return imOpts(p,'harp'); }
function imBowed(x,y,name){ '@later'; SHARED.PNAME=name; const B=[], v=name==='violin', s=v?.48:1, z0=v?14:3, L=Math.round((v?20:46)), lb=v?.1:.22, ub=v?.085:.18;
  if(v)B.push(imB(x-.18,y-.14,x+.18,y+.14,0,12,IMC.black,{fs:(nx,ny,X,Y,z,k)=>sh(z>10?[50,50,56]:IMC.black,k)}));
  else B.push(imB(x-.01,y-.01,x+.01,y+.01,0,3,IMC.chrome));
  const wb=z=>{ const u=z/L, lob=lb*Math.sqrt(Math.max(0,1-((u-.27)/.29)**2)), upb=ub*Math.sqrt(Math.max(0,1-((u-.75)/.27)**2)); return Math.max(lob,upb,u>.48&&u<.56?ub*.62:0); };
  const face=(X,z)=>{ const u=z/L; if(Math.abs(Math.abs(X)-lb*.42)<.012&&u>.32&&u<.6)return IMC.black; if(Math.abs(X)<.025&&u>.4)return IMC.ebony; if(Math.abs(z-L*.45)<.6&&Math.abs(X)<lb*.5)return IMC.maple; return Math.abs(X)>wb(z)*.8?IMC.varnishD:null; };
  imFlat(B,x,y,z0,z0+L,wb,v?.03:.07,IMC.varnish,IMC.varnishD,face);
  const nk=v?10:20; for(let z=z0+L;z<z0+L+nk;z++)B.push(imB(x-.018*(v?1:1.4),y-.02,x+.018*(v?1:1.4),y+.02,z,z+1,IMC.varnishD,{fs:(nx,ny,X,Y,zz,k)=>sh(ny>0?IMC.ebony:IMC.varnishD,k)}));
  B.push(imB(x-.03,y-.03,x+.03,y+.03,z0+L+nk,z0+L+nk+(v?3:5),IMC.varnishD));
  if(!v)for(let z=6;z<52;z++){ const xx=x+.28-(z-6)*.002; B.push(imB(xx,y+.1,xx+.012,y+.12,z,z+1,z<9?IMC.ebony:[120,80,50])); }
  const p=prop(B,null,{music:name}); return imOpts(p,name); }
function imPipe(x,y,name){ '@later'; SHARED.PNAME=name; const B=[], f=name==='flute';
  B.push(imB(x-.3,y-.12,x+.3,y+.12,0,14,IMC.black,{top:(X,Y)=>Math.abs(Y-y)<.05?[34,22,40]:[30,30,34],fs:(nx,ny,X,Y,z,k)=>sh(z>12?[50,50,56]:IMC.black,k)}));
  if(f){ B.push(imB(x-.28,y-.012,x+.28,y+.012,14,15,IMC.silver,{top:(X,Y)=>Math.abs(((X-x)*48)%3)<.8&&X>x-.1?IMC.chromeD:IMC.silver})); }
  else { B.push(imB(x-.03,y-.03,x+.03,y+.03,14,16,IMC.black)); for(let z=16;z<27;z++){ const r=z>25?.022:.016; B.push(imB(x-r,y-r,x+r,y+r,z,z+1,IMC.maple,{fs:(nx,ny,X,Y,zz,k)=>sh(ny>0&&z>17&&z<24&&z%2===0?IMC.black:IMC.maple,k)})); } }
  const p=prop(B,null,{music:name}); return imOpts(p,name); }
const IMKITBAR={k:1.1,sp:1.35};
function imDrums(x,y,dz=0,k=1,sp=1){ '@later'; SHARED.PNAME=dz?'drum kit on a stage':'drum kit'; const B=[], i2t=i=>i*.0254/.9/2*k, sh2=IMC.shell, hd=IMC.head, zk=z=>Math.round(z*k);
  { const r=i2t(22), cz=Math.round(r*24*1.1); for(let z=0;z<2*cz;z++){ const h=Math.sqrt(Math.max(0,cz*cz-(z-cz+.5)**2))/24/1.1; B.push(imB(x-h,y+.02,x+h,y+.02+.4*k,z,z+1,sh2,{foot:z===0?1:0,fs:(nx,ny,X,Y,zz,k)=>sh(ny>0?(Math.hypot(X-x,(z-cz)/24/1.1)>h*.9?IMC.chrome:hd):sh2,k)})); } }
  const drum=(dx,dy,inch,z0,dep)=>{ const r=i2t(inch); dx*=sp; dy*=sp; z0=zk(z0); dep=zk(dep); imRound(B,x+dx,y+dy,z0,z0+dep,()=>r,sh2,{side:(z)=>z===0||z===dep-1?IMC.chrome:sh2,top:()=>hd}); if(z0>0)B.push(imB(x+dx-.01,y+dy-.01,x+dx+.01,y+dy+.01,0,z0,IMC.chrome)); };
  drum(-.42,-.1,14,16,4); drum(-.12,.12,10,24,6); drum(.14,.12,12,24,7); drum(.46,-.08,16,0,15);
  const cym=(dx,dy,inch,z)=>{ const r=i2t(inch); dx*=sp; dy*=sp; z=zk(z); B.push(imB(x+dx-.008,y+dy-.008,x+dx+.008,y+dy+.008,0,z,IMC.chrome)); imRound(B,x+dx,y+dy,z,z+1,()=>r,IMC.bronze,{top:(X,Y)=>Math.hypot(X,Y)<r*.22?IMC.brassD:hash(Math.floor(Math.hypot(X,Y)*90),0,4502)<.4?IMC.bronze:IMC.brass}); };
  cym(-.62,.0,14,22); imRound(B,x-.62*sp,y,zk(20),zk(20)+1,()=>i2t(14),IMC.bronze); cym(-.42,.34,16,40); cym(.56,.3,20,36);
  if(!dz)B.push(imB(x-.12,y-.52,x+.12,y-.34,0,13,IMC.black,{top:()=>[40,40,44]}));
  const p=prop(dz?B.map(b=>zShift(b,dz)):B,null,{music:'drum kit'}); return imOpts(p,'drum kit'); }
function imBarsProp(x,y,name){ '@later'; SHARED.PNAME=name; const B=[], I={xylophone:[32,.62,26,[150,74,44]],marimba:[37,.95,26,[140,66,40]],glockenspiel:[30,.28,16,[226,228,236]]}[name], [n,hw,zt,col]=I, nat=Math.round(n*7/12), bw=2*hw/nat;
  const top=(X,Y,back)=>{ const i=Math.floor((X-(x-hw))/bw), f=(X-(x-hw))/bw-i; if(f<.12||f>.88)return null; const L=.2*Math.sqrt(1-i/nat*.55)*(name==='glockenspiel'?.6:1); if(back){ if([2,6].includes(i%7)||f<.5)return null; return Math.abs(Y-(y-.08-L/2))<L/2?col:null; } return Math.abs(Y-(y+L/2))<L/2?col:null; };
  const edge=(X,back,k)=>{ const i=Math.floor((X-(x-hw))/bw), f=(X-(x-hw))/bw-i; if(f<.12||f>.88||back&&([2,6].includes(i%7)||f<.5))return null; return sh(col,k*.8); };
  B.push(imB(x-hw,y+.0,x+hw,y+.3,zt,zt+2,col,{top:(X,Y)=>top(X,Y,false),fs:(nx,ny,X,Y,z,k)=>ny?edge(X,false,k):null}));
  B.push(imB(x-hw,y-.3,x+hw,y-.0,zt+3,zt+5,col,{top:(X,Y)=>top(X,Y,true),fs:(nx,ny,X,Y,z,k)=>ny?edge(X,true,k):null}));
  for(const sx of [-1,1])for(const sy of [-1,1])B.push(imB(x+sx*(hw-.03)-.02,y+sy*.2-.02,x+sx*(hw-.03)+.02,y+sy*.2+.02,0,zt,IMC.woodD));
  B.push(imB(x-hw,y-.24,x+hw,y-.2,zt-2,zt,IMC.woodD),imB(x-hw,y+.2,x+hw,y+.24,zt-2,zt,IMC.woodD));
  if(name==='marimba')B.push(imB(x-hw+.05,y+.12,x+hw-.05,y+.14,4,zt-2,IMC.brass,{fs:(nx,ny,X,Y,z,k)=>{ if(!ny)return sh(IMC.brass,k); const i=Math.floor((X-(x-hw))/bw), f=(X-(x-hw))/bw-i; const L=(zt-6)*Math.sqrt(1-i/nat*.75); return f>.25&&f<.75&&z>(zt-6)-L?sh(f<.4?IMC.bronze:IMC.brassD,k):null; },top:()=>null}));
  const p=prop(B,null,{music:name}); return imOpts(p,name); }
function imBells(x,y){ '@later'; SHARED.PNAME='tubular bells'; const B=[], hw=.7, H=56;
  for(const s of [-1,1])B.push(imB(x+s*hw-.03,y-.16,x+s*hw+.03,y+.16,0,2,IMC.black),imB(x+s*hw-.02,y-.02,x+s*hw+.02,y+.02,2,H,IMC.black));
  B.push(imB(x-hw,y-.02,x+hw,y+.02,H-3,H,IMC.black));
  for(let i=0;i<18;i++){ const tx=x-hw+.1+i*(2*hw-.2)/17, L=Math.round(44*Math.sqrt(1/Math.pow(2,i/12))); B.push(imB(tx-.02,y-.02,tx+.02,y+.02,H-4-L,H-4,[226,196,120],{fs:(nx,ny,X,Y,z,k)=>sh(z>L-3?[240,214,140]:nx>0?[180,146,70]:[226,196,120],k)})); }
  const p=prop(B,null,{music:'tubular bells'}); return imOpts(p,'tubular bells'); }
function imKalimba(x,y){ '@later'; SHARED.PNAME='kalimba'; const B=[];
  B.push(imB(x-.16,y-.16,x+.16,y+.16,0,14,IMC.black,{fs:(nx,ny,X,Y,z,k)=>sh(z>12?[50,50,56]:IMC.black,k)}));
  B.push(imB(x-.08,y-.1,x+.08,y+.1,14,16,IMC.wood,{top:(X,Y)=>{ const u=(X-(x-.08))/.16, i=Math.floor(u*9); if(Y<y+.04&&Y>y-.08+Math.abs(u-.5)*.1&&(u*9-i)>.3&&(u*9-i)<.75)return IMC.steel; if(Math.abs(Y-(y+.04))<.008)return IMC.chromeD; return Math.hypot(X-x,Y-(y+.07))<.02?IMC.black:IMC.wood; }}));
  const p=prop(B,null,{music:'kalimba'}); return imOpts(p,'kalimba'); }
function imPan(x,y){ '@later'; SHARED.PNAME='steel pan'; const B=[], r=.32;
  for(const a of [0,2.1,4.2])B.push(imB(x+Math.cos(a)*.24-.01,y+Math.sin(a)*.24-.01,x+Math.cos(a)*.24+.01,y+Math.sin(a)*.24+.01,0,24,IMC.black));
  imRound(B,x,y,24,30,z=>r-(5-z)*.004,IMC.chrome,{side:(z)=>z===5?IMC.silver:IMC.chromeD,top:(X,Y)=>{ const d=Math.hypot(X,Y)/r, a=Math.atan2(Y,X); const ring=d>.62?0:d>.3?1:2, n=[12,12,3][ring], f=((a/(2*Math.PI)*n)%1+1)%1; return (f<.08||f>.92)||Math.abs(d-.62)<.04||Math.abs(d-.3)<.04?IMC.chromeD:IMC.silver; }});
  const p=prop(B,null,{music:'steel pan'}); return imOpts(p,'steel pan'); }
function imOpts(p,kind){ p.opts=()=>typeof imThingOpts==='function'?imThingOpts(p,kind):[]; return p; }
Object.assign(CATALOG,{'classical guitar':imGuitarProp('classical guitar',{L:17,lb:.21,ub:.16,c:IMC.spruce,cs:IMC.rose,kind:'hole',hole:.08,ring:IMC.mahog}),
  'steel-string guitar':imGuitarProp('steel-string guitar',{L:18,lb:.23,ub:.17,c:IMC.spruce,cs:IMC.mahog,kind:'hole',hole:.085,burst:IMC.burst,ring:IMC.black}),
  'electric guitar':(x,y)=>{ SHARED.PNAME='electric guitar'; const B=imGuitar(x-.18,y,{L:14,lb:.19,ub:.15,c:IMC.red,cs:IMC.redD,kind:'pick',hc:IMC.black}); imAmp(B,x+.22,y+.02); return imOpts(prop(B,null,{music:'electric guitar'}),'electric guitar'); },
  'bass guitar':(x,y)=>{ SHARED.PNAME='bass guitar'; const B=imGuitar(x-.18,y,{L:15,lb:.2,ub:.15,c:IMC.burst,cs:IMC.black,kind:'pick',burst:IMC.black,neck:22,hc:IMC.black}); imAmp(B,x+.22,y+.02); return imOpts(prop(B,null,{music:'bass guitar'}),'bass guitar'); },
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
SHARED.PNAME='object';

STOREK.bar={barFloorCol,barWall,theatreSconce};
}

{
const MSP={stone:[122,124,104],stoneD:[86,90,76],stoneL:[150,150,126],moss:[78,112,46],mossL:[118,150,58],mossD:[44,70,34],grass:[86,128,52],
  wood:[148,56,36],woodD:[96,34,24],woodL:[176,78,48],black:[30,26,26],paper:[255,206,128],paperD:[214,140,70],pink:[238,150,182],pinkL:[252,204,220],
  pinkD:[176,88,120],water:[40,170,170],waterL:[120,236,214],waterD:[16,96,108],statue:[138,146,126],statueD:[88,96,84],gold:[236,206,120],
  rock:[116,122,108],rockD:[76,82,74],fern:[38,74,44],fernL:[70,112,58],cope:[150,146,136]};
const msMix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t], msCl=(x,a=0,b=1)=>x<a?a:x>b?b:x;
function msVn(x,y,s=0){ const i=Math.floor(x), j=Math.floor(y), fx=x-i, fy=y-j, u=fx*fx*(3-2*fx), v=fy*fy*(3-2*fy);
  const a=hash(i,j,s), b=hash(i+1,j,s), c=hash(i,j+1,s), d=hash(i+1,j+1,s); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; }
const msFbm=(x,y,s=0)=>msVn(x,y,s)*.55+msVn(x*2.1,y*2.1,s+7)*.28+msVn(x*4.3,y*4.3,s+13)*.17;
const msRound=c=>[Math.round(c[0]),Math.round(c[1]),Math.round(c[2])];
function msFlag(u,v){ '@later'; const row=Math.floor(v/.52), s0=hash(row,3)*.6, col=Math.floor((u+s0)/.68), fu=(u+s0)/.68-col, fv=v/.52-row, mo=msFbm(u*1.7,v*1.7,5);
  if(Math.min(fu,1-fu)*.68<.035||Math.min(fv,1-fv)*.52<.035)return mo>.42?sh(MSP.mossD,.9+hash(u*40,v*40)*.2):sh(MSP.stoneD,.6);
  let c=sh(msMix(MSP.stone,MSP.stoneL,hash(col,row,9)*.6),.86+hash(col,row,4)*.24); if(Math.min(fu,1-fu,fv,1-fv)<.08)c=sh(c,.9);
  if(msFbm(u*6,v*6,2)>.66)c=sh(c,.82); if(Math.abs(msVn(u*5+col,v*5,8)-.5)<.012)c=sh(c,.6);
  if(mo>.56)c=msMix(c,hash(u*48,v*48,1)>.7?MSP.mossL:MSP.moss,msCl((mo-.56)*6)); return c; }
function msBlock(a,z,top){ '@later'; const row=Math.floor((top-z)/10), sa=a+hash(row,5)*.4, bi=Math.floor(sa/.62), fa=sa/.62-bi, fz=(top-z)/10-row;
  let c=msMix(MSP.stoneD,MSP.stone,hash(bi,row,2)*.7+.15); if(Math.min(fa,1-fa)*.62*24<.7||Math.min(fz,1-fz)*10<.8)c=sh(MSP.stoneD,.55);
  const mo=msFbm(a*2,z/22,11)+(top-z<5?.3:0)-(top-z)/90; if(mo>.55)c=msMix(c,hash(a*40,z,3)>.6?MSP.mossL:MSP.moss,msCl((mo-.55)*5));
  if(msVn(a*9,z/6,4)>.8)c=sh(c,.78); return c; }
const msStone=(x0,y0,x1,y1,z0,z1,o={})=>sided({x0,y0,x1,y1,z0,z1,c:MSP.stone,foot:1,...o,fs:o.fs||((nx,ny,X,Y,zr,k)=>sh(msBlock(nx?Y:X,zr,z1-z0),k*1.2)),top:o.top||((X,Y)=>msFlag(X-x0,Y-y0))});
function msLathe(cx,cy,z0,z1,rf,col,dz=2,dw=.035){ '@later'; const out=[];
  for(let z=z0;z<z1-1e-9;z+=dz){ const za=z, zb=Math.min(z1,z+dz), r=rf((za+zb)/2-z0); if(!(r>.004))continue; const n=Math.max(1,Math.round(2*r/dw)), w=2*r/n;
    for(let i=0;i<n;i++){ const xa=cx-r+i*w, xm=xa+w/2-cx, hy=Math.sqrt(Math.max(0,r*r-xm*xm)); if(hy<w*.3)continue;
      out.push(sided({x0:xa,y0:cy-hy,x1:xa+w,y1:cy+hy,z0:za,z1:zb,c:MSP.stone,foot:za===z0?1:0,nb:1,
        fs:(nx,ny,X,Y,zr)=>col(X-cx,Y-cy,za+zr-z0,(X-cx)/r,(Y-cy)/r,0),top:(X,Y)=>col(X-cx,Y-cy,zb-z0,(X-cx)/r*.6,(Y-cy)/r*.6,1)})); } }
  return out; }
const msShade=(c,nx,ny,top)=>sh(c,top?1:.72+.28*msCl(.5-.5*nx*.6+.5*ny*.5));
const msEll=(cx,cy,zc,rx,rz,col)=>msLathe(cx,cy,zc-rz,zc+rz,z=>{ const t=(z-rz)/rz; return rx*Math.sqrt(Math.max(0,1-t*t)); },col);
let MST=0;
const msFlick=k=>.86+.14*Math.sin(MST*7.3+k*1.7)*Math.sin(MST*3.1+k);
const msLife=(p,k)=>{ p.life=t=>{ MST=t; }; p.lifeKey=()=>Math.floor(MST*8)%16; p.fl=k; return p; };
const msPut=(name,bs,o={})=>{ SHARED.PNAME=name; return prop(bs,null,{fine:true,...o}); };
const msLamp=(l,p)=>Object.defineProperty(Object.assign(l,{own:1,day:true,prop:p}),'up',{get(){ return this.z-lc('lamps','height'); },enumerable:true});
function msTerrace(x,y,z0=0){ return msPut('stone terrace',[msStone(x,y,x+5.56,y+5.38,z0,z0+26)]); }
function msSteps(x,y,z0=0){ '@later'; const sw=[msStone(x-.25,y,x,y+1.2,z0,z0+23),msStone(x+2.4,y,x+2.65,y+1.2,z0,z0+23)];
  return msPut('mossy steps',[msStone(x,y,x+2.4,y+.6,z0,z0+19),msStone(x,y+.6,x+2.4,y+1.2,z0,z0+12),...sw],{solids:sw,stands:[{x0:x,y0:y,x1:x+2.4,y1:y+.6,z:z0+19},{x0:x,y0:y+.6,x1:x+2.4,y1:y+1.2,z:z0+12}]}); }
function msPlaza(x,y,z0=0){ '@later'; const cx=2.78, cy=2.8; return msPut('spiral stone plaza',[msStone(x,y,x+5.56,y+5.6,z0,z0+5,{top:(X,Y)=>{ const u=X-x, v=Y-y, du=u-cx, dv=v-cy, r=Math.hypot(du,dv);
  if(r<1.55){ const th=Math.atan2(dv,du), g=(((r/.2-th/(2*Math.PI))%1)+1)%1; let c=msMix(MSP.stone,MSP.stoneL,.45+hash(Math.floor(r*8),Math.floor(th*6),3)*.25);
    if(r>1.42)c=sh(MSP.stoneD,.8); else if(r>1.32)c=msMix(MSP.stone,MSP.stoneL,.5); else if(g<.16)c=sh(MSP.stoneD,.66); else if(g<.24)c=sh(MSP.stoneL,1.05);
    if(msFbm(u*3,v*3,6)>.62)c=msMix(c,MSP.moss,.55); return c; }
  return msFlag(u,v); }})],{flat:false,walk:true,stands:[{x0:x,y0:y,x1:x+5.56,y1:y+5.6,z:z0+5}]}); }
function msPlinth(x,y,z0=0){ '@later'; return msPut('statue plinth',[...msLathe(x,y,z0,z0+8,()=>1.02,(dx,dy,z,nx,ny,top)=>msShade(top?msFlag(dx,dy):msBlock(Math.atan2(dy,dx)*1.02,z,8),nx,ny,top)),
  ...msLathe(x,y,z0+8,z0+18,z=>.82+z*.012,(dx,dy,z,nx,ny,top)=>{ const th=Math.atan2(dy,dx), pe=(((th/(2*Math.PI))*16)%1+1)%1;
    let c=msMix(MSP.statueD,MSP.statue,.7); if(Math.abs(pe-.5)*2>1-z/12)c=sh(c,.72); else c=msMix(c,MSP.stoneL,.25); return msShade(c,nx,ny,top); })]); }
function msStatueCol(dx,dy,z,nx,ny,top,head){ '@later'; const th=Math.atan2(dy,dx);
  let c=msMix(MSP.statueD,MSP.statue,.55+.45*Math.sin(th*11+z*.06+msVn(z/10,th,2)*2)*.5+.2);
  if(z>8&&z<50&&Math.abs(((z+Math.sin(th*3)*4)%13)-6.5)<.5)c=sh(c,.8);
  if(msFbm(dx*4+z/30,dy*4,12)>.7&&(top||z<40))c=msMix(c,MSP.moss,.5); if(msVn(dx*20,z/4,7)>.84)c=sh(c,.7);
  if(head&&ny>.55){ const dz=z-head, du=dx*32; if(Math.abs(dz-2)<.6&&Math.abs(Math.abs(du)-2.4)<1.6)c=sh(c,.6); if(Math.abs(du)<.6&&dz<1&&dz>-4)c=sh(c,.82); if(Math.abs(dz+6.5)<.5&&Math.abs(du)<1.5)c=sh(c,.65); }
  return msShade(c,nx,ny,top); }
function msStatue(x,y,z0=0){ '@later'; const S0=z0, col=(ox,oy,hd)=>(dx,dy,z,nx,ny,top)=>msStatueCol(dx+ox,dy+oy,z,nx,ny,top,hd);
  const bs=[...msLathe(x,y,S0,S0+8,()=>.48,col(0,0)),...msLathe(x,y,S0+8,S0+50,z=>.44-z*.0033,col(0,0)),
    ...msEll(x,y,S0+58,.3,14,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+44,nx,ny,top)),...msEll(x,y,S0+71,.42,8,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+63,nx,ny,top)),
    ...msEll(x-.37,y+.06,S0+52,.14,24,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+28,nx,ny,top)),...msEll(x+.37,y+.06,S0+52,.14,24,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+28,nx,ny,top)),
    ...msEll(x+.4,y+.16,S0+62,.1,12,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+50,nx,ny,top)),...msEll(x+.45,y+.27,S0+50,.07,6,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+44,nx,ny,top)),
    ...msEll(x-.25,y+.2,S0+64,.12,8,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+56,nx,ny,top)),...msEll(x-.14,y+.29,S0+65,.07,5,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+60,nx,ny,top)),
    ...msEll(x,y-.1,S0+84,.21,22,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy,z+62,nx,ny,top)),
    ...msLathe(x,y+.02,S0+76,S0+82,()=>.085,col(0,0)),...msEll(x,y+.05,S0+91,.17,13,(dx,dy,z,nx,ny,top)=>msStatueCol(dx,dy-.0,z+78,nx,ny,top,91)),
    ...msLathe(x,y+.02,S0+100,S0+106,z=>.16-z*.004,col(0,0)),...msLathe(x,y+.02,S0+106,S0+118,z=>.14-z*.0075,col(0,0)),
    ...msLathe(x+.48,y+.28,S0+10,S0+102,()=>.032,()=>[56,40,34]),...msEll(x+.48,y+.28,S0+106,.07,7,col(0,0)),
    sided({x0:x-.9,y0:y-.34,x1:x+.9,y1:y-.32,z0:S0+60,z1:S0+124,c:MSP.gold,em:1,life:1,fs:(nx,ny,X,Y,zr)=>{
      if(!ny)return null; const d=Math.hypot((X-x)*32,zr-32); const f=LIFE.mode===1?.85+.15*Math.sin(MST*1.4):1;
      if(Math.abs(d-26)<.9)return msRound(sh(MSP.gold,f)); if(Math.abs(d-22)<.35&&hash(Math.floor(Math.atan2(zr-32,X-x)*40),1)>.3)return msRound(sh(MSP.gold,.8*f)); return null; },top:()=>null})];
  const p=msPut('moon shrine statue',bs); LAMPS.push(msLamp({x,y:y-.2,z:S0+92,r:2.2,c:[1,.85,.5]},p)); return msLife(p,20); }
function msPaperFace(k,round,z0,z1){ return (nx,ny,X,Y,zr)=>{ const h=z1-z0; if(zr<1.5||zr>h-1.5)return MSP.black;
  const f=LIFE.mode===1?msFlick(k):1; if(zr%6<.8)return msRound(sh(MSP.paperD,f)); return msRound(sh(msMix(MSP.paperD,MSP.paper,1-Math.abs(zr/h-.5)*.7),f)); }; }
function msGate(x,y,z0=0){ '@later'; const wood=(nx,ny,X,Y,zr,k,post)=>{ const a=nx?Y:X; let c=msMix(MSP.wood,MSP.woodL,msVn(a*30,zr/3,2)*.4); if(msVn(a*10,zr/12,9)>.72)c=msMix(c,MSP.woodD,.7); return sh(c,k*1.25); };
  const top=(X,Y)=>{ const c=msMix(MSP.woodD,MSP.wood,.5); return msFbm(X*5,Y*5,4)>.45?msMix(c,hash(X*50,Y*50)>.6?MSP.mossL:MSP.moss,.85):c; };
  const beam=(x0,y0,x1,y1,za,zb)=>sided({x0,y0,x1,y1,z0:z0+za,z1:z0+zb,c:MSP.wood,fs:wood,top});
  const post=px=>msLathe(px,y,z0,z0+122,z=>z<10?.17:.15-z*.00016,(dx,dy,z,nx,ny,tp)=>{ if(z<10)return msShade(MSP.black,nx,ny,tp);
    const th=Math.atan2(dy,dx), s=(((th/(2*Math.PI)+z/46+msVn(z/14,px,3)*.3)%1)+1)%1; let c=msMix(MSP.wood,MSP.woodL,msVn(th*3,z/3,2)*.4);
    if(Math.abs(s-.5)<.07&&z<110)c=hash(Math.floor(z),Math.floor(th*8),5)>.55?MSP.mossL:MSP.moss; else if(Math.abs(s-.5)<.16&&hash(Math.floor(z/3),Math.floor(th*10),7)>.82&&z<116)c=MSP.grass;
    return msShade(c,nx,ny,tp); },2,.04);
  const ls=[], bs=[...post(x-1.75),...post(x+1.75),beam(x-2.05,y-.1,x+2.05,y+.1,88,98),beam(x-2.25,y-.15,x+2.25,y+.15,110,120),beam(x-2.55,y-.2,x+2.55,y+.2,120,130),
    beam(x-2.72,y-.2,x-2.3,y+.2,126,136),beam(x+2.3,y-.2,x+2.72,y+.2,126,136),beam(x-.12,y-.07,x+.12,y+.07,98,110)];
  for(const [lx,k] of [[x-1,2],[x+1,3]]){ bs.push(sided({x0:lx-.02,y0:y-.02,x1:lx+.02,y1:y+.02,z0:z0+70,z1:z0+88,c:MSP.black,fs:()=>MSP.black}));
    bs.push(...msLathe(lx,y,z0+44,z0+70,()=>.13,(dx,dy,z,nx,ny,top)=>top?MSP.woodD:msPaperFace(k,1,0,26)(nx,ny,0,0,z)).map(b=>({...b,em:1,life:1})));
    ls.push({x:lx,y,z:z0+58,r:3,c:[1,.66,.32]}); }
  for(const [bx,bz,r,rz] of [[x-2.38,138,.32,10],[x-2,136,.2,8],[x+2.15,138,.3,10],[x-1.7,92,.14,7]])bs.push(...msEll(bx,y,z0+bz,r,rz,msBloom));
  const p=msLife(msPut('moon shrine gate',bs,{solids:[x-1.75,x+1.75].map(px=>({x0:px-.17,y0:y-.17,x1:px+.17,y1:y+.17,z0,z1:z0+122}))}),2);
  for(const l of ls)LAMPS.push(msLamp(l,p)); return p; }
function msHangingLantern(x,y,z0=0){ '@later'; const bs=[sided({x0:x-.02,y0:y-.02,x1:x+.02,y1:y+.02,z0:z0+26,z1:z0+40,c:MSP.black,fs:()=>MSP.black}),
  ...msLathe(x,y,z0,z0+26,()=>.13,(dx,dy,z,nx,ny,top)=>top?MSP.woodD:msPaperFace(9,1,0,26)(nx,ny,0,0,z)).map(b=>({...b,em:1,life:1}))];
  const p=msLife(msPut('hanging paper lantern',bs),9); LAMPS.push(msLamp({x,y,z:z0+14,r:3,c:[1,.66,.32]},p)); return p; }
function msBloom(dx,dy,z,nx,ny,top){ '@later'; const cs=.05, gu=dx/cs, gv=dy/cs, gz=z/(cs*32), iu=Math.floor(gu), iv=Math.floor(gv), iz=Math.floor(gz); let best=9, bk=0, bu=0, bv=0;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){ const cu=iu+a, cv=iv+b, cz=iz+c, d=(gu-cu-hash(cu,cv,cz*7+1))**2+(gv-cv-hash(cu,cv,cz*7+2))**2+(gz-cz-hash(cu,cv,cz*7+3))**2;
    if(d<best){ best=d; bk=hash(cu,cv,cz*7+5); bu=gu-cu; bv=gv-cv; } }
  if(best<.2){ const pet=Math.cos(Math.atan2(bv,bu)*5+bk*6)*.5+.5; if(best<.012)return [250,226,170]; if(best>.08+.1*pet)return sh(MSP.pinkD,.8); return msRound(msMix(bk>.5?MSP.pink:MSP.pinkL,MSP.pinkD,msCl(best*3-.1))); }
  return msShade(best>.34&&hash(iu,iv,iz)>.6?[74,48,52]:sh(MSP.pinkD,.7),nx,ny,top); }
function msBlossom(x,y,z0=0,r=.3,rz=10){ return msPut('blossom clump',[...msEll(x,y,z0+rz,r,rz,msBloom),...msEll(x+r*.6,y-r*.3,z0+rz*.8,r*.6,rz*.7,msBloom)],{walk:true}); }
function msPost(x,y,z0=0,vine=false){ '@later'; const bs=[msStone(x-.14,y-.14,x+.14,y+.14,z0,z0+53,{fs:(nx,ny,X,Y,zr,k)=>{ const a=nx?Y:X; let c=msBlock(a,zr,53);
    if(vine&&Math.abs(((a*30+zr/5)%6)-3)<.9)c=hash(Math.floor(zr),3)>.5?MSP.moss:MSP.mossL; return sh(c,k*1.2); }}),
  msStone(x-.18,y-.18,x+.18,y+.18,z0+53,z0+59),...msLathe(x,y,z0+59,z0+71,z=>.16-z*.0117,(dx,dy,z,nx,ny,top)=>msShade(msBlock(Math.atan2(dy,dx)*.3,z,12),nx,ny,top))];
  return msPut(vine?'stone post with vines':'square stone post',bs); }
function msGroundLantern(x,y,z0=0,k=4){ '@later'; const bs=[sided({x0:x-.13,y0:y-.13,x1:x+.13,y1:y+.13,z0:z0+3,z1:z0+23,c:MSP.paper,em:1,life:1,foot:1,fs:(nx,ny,X,Y,zr)=>{ const a=nx?Y-y:X-x;
    if(Math.abs(a)>.105)return MSP.woodD; return msPaperFace(k,0,0,20)(nx,ny,X,Y,zr); },top:()=>MSP.woodD}),
  sided({x0:x-.17,y0:y-.17,x1:x+.17,y1:y+.17,z0:z0+23,z1:z0+26,c:MSP.woodD,fs:()=>MSP.woodD,top:()=>sh(MSP.woodD,1.2)}),
  ...[[-1,-1],[1,1],[-1,1],[1,-1]].map(([a,b])=>sided({x0:x+a*.11-.02,y0:y+b*.11-.02,x1:x+a*.11+.02,y1:y+b*.11+.02,z0,z1:z0+3,c:MSP.woodD,foot:1,fs:()=>MSP.woodD}))];
  const p=msLife(msPut('paper ground lantern',bs),k); LAMPS.push(msLamp({x,y,z:z0+14,r:3.2,c:[1,.68,.34]},p)); return p; }
function msFloatingLantern(x,y,z0=0){ return msPut('floating pond lantern',[sided({x0:x-.12,y0:y-.12,x1:x+.12,y1:y+.12,z0,z1:z0+2,c:[70,46,34],foot:1,fs:()=>[70,46,34]}),
  sided({x0:x-.1,y0:y-.1,x1:x+.1,y1:y+.1,z0:z0+2,z1:z0+16,c:MSP.paper,em:1,fs:msPaperFace(13,0,0,14),top:()=>[90,60,40]})]); }
function msToro(x,y,z0=0){ '@later'; const st=(dx,dy,z,nx,ny,top)=>msShade(msMix(msBlock(Math.atan2(dy,dx)*.4,z,60),MSP.stone,.3),nx,ny,top);
  const bs=[...msEll(x,y,z0+4,.38,6,msRockCol),...msLathe(x,y,z0+8,z0+14,()=>.17,st),...msLathe(x,y,z0+14,z0+34,()=>.075,st),
    msStone(x-.2,y-.2,x+.2,y+.2,z0+34,z0+38),
    sided({x0:x-.15,y0:y-.15,x1:x+.15,y1:y+.15,z0:z0+38,z1:z0+54,c:MSP.stone,em:1,life:1,fs:(nx,ny,X,Y,zr,k)=>{ const a=nx?Y-y:X-x;
      if(Math.abs(a)<.08&&zr>3&&zr<13){ const f=LIFE.mode===1?msFlick(12):1; return msRound(sh(MSP.paper,f)); } return LIFE.mode===1?null:sh(msBlock(a,zr,16),k*1.2); },top:()=>MSP.stone}),
    msStone(x-.26,y-.26,x+.26,y+.26,z0+54,z0+57),...msLathe(x,y,z0+57,z0+68,z=>.33-z*.026,st),...msEll(x,y,z0+70,.05,4,st)];
  const p=msLife(msPut('stone garden lantern',bs),12); LAMPS.push(msLamp({x,y,z:z0+46,r:2.6,c:[1,.7,.36]},p)); return p; }
function msRockCol(dx,dy,z,nx,ny,top){ let c=msMix(MSP.rockD,MSP.rock,msVn(z/5+dx*3,dy*3,4)); if(Math.abs(((z+msVn(dx*4,dy*4,1)*8)%9)-4.5)<.7)c=sh(c,.72);
  if(top&&msFbm(dx*3,dy*3,9)>.3)c=msMix(MSP.moss,MSP.mossL,hash(dx*40,dy*40,z)*.6); return msShade(c,nx,ny,top); }
function msRock(x,y,z0=0){ return msPut('mossy cliff rock',[...msEll(x,y,z0+24,.55,24,msRockCol),...msEll(x+.65,y-.23,z0+16,.42,16,msRockCol),...msEll(x-.25,y+.75,z0+14,.34,14,msRockCol),...msEll(x+.15,y-.1,z0+44,.32,12,msRockCol)]); }
function msFern(x,y,z0=0,r=.45,rz=12){ '@later'; return msPut('fern bush',msEll(x,y,z0+rz*.5,r,rz,(dx,dy,z,nx,ny,top)=>{ const th=Math.atan2(dy,dx), rr=Math.hypot(dx,dy)/r, s=((th/(2*Math.PI))*9+x*7)%1, d=Math.abs(((s%1)+1)%1-.5)*2, lf=Math.sin(rr*60)*.5+.5;
  if(d>.55+.17*lf*(1-rr)+(rr<.25?.5:0))return null; let c=msMix(MSP.fern,MSP.fernL,msCl(1-d*1.3)*(top?1:.5)); if(lf>.85&&d<.3)c=sh(MSP.fernL,1.1); return msRound(c); }),{walk:true}); }
function msTuft(x,y,z0=0,r=.14,h=8){ '@later'; return msPut('moss and grass tuft',msLathe(x,y,z0,z0+h,z=>r*(1-z/h*.6),(dx,dy,z,nx,ny,top)=>{ const th=Math.atan2(dy,dx), b=((th/(2*Math.PI))*14+hash(x*9,y*9)*3)%1;
  if(Math.abs(((b%1)+1)%1-.5)*2>1-z/h*.9)return null; return msRound(msMix(MSP.mossD,z/h>.6?MSP.mossL:MSP.grass,z/h)); },1.5,.03),{walk:true}); }
function msMarker(x,y,z0=0){ return msPut('wooden marker post',[...msLathe(x,y,z0,z0+52,()=>.045,()=>[66,40,30]),sided({x0:x-.22,y0:y-.03,x1:x+.22,y1:y+.03,z0:z0+40,z1:z0+44,c:[66,40,30],fs:()=>[66,40,30]})]); }
function msStepStone(x,y,z0=0){ return msPut('mossy walkway stone',[msStone(x,y,x+1,y+.7,z0,z0+7.5)],{hang:1}); }
function msParapet(x0,y0,x1,y1,z0=0,ox=0,oy=1){ '@later'; const ax=ox?1:0, vine=(nx,ny,X,Y,zr)=>{ if((ox&&nx!==ox)||(oy&&ny!==oy))return null; const a=ax?Y:X, s=Math.floor(a*9), len=10+hash(s,ax?3:7)*90; if(hash(s,4,ax)<.45)return null;
    const aa=a*9-s+Math.sin(zr/9+s)*.22; if(zr<126-len||Math.abs(aa-.5)>.18+(hash(Math.floor(zr/3),s)>.7?.22:0))return null; return hash(Math.floor(zr/2),s,2)>.5?MSP.moss:MSP.mossD; };
  const top=(X,Y)=>{ let c=msMix(MSP.cope,MSP.stone,.4+hash(Math.floor((X+Y)*3),2)*.3); return msFbm(X*3,Y*3,14)>.5?msMix(c,MSP.moss,.75):c; };
  const vx=ox>0?x1+T:ox<0?x0-T-.02:null, vy=oy>0?y1+T:oy<0?y0-T-.02:null;
  const vb=ax?{x0:vx,x1:vx+.02,y0:y0+.1,y1:y1-.1}:{x0:x0+.1,x1:x1-.1,y0:vy,y1:vy+.02};
  return msPut('mossy parapet',[msStone(x0,y0,x1,y1,z0,z0+16,{top}),...(MS_VINES?[sided({...vb,z0:z0-110,z1:z0+16,c:MSP.moss,nb:1,fs:vine,top:()=>null})]:[])],{walk:true}); }
const MS_VINES=false;
function msPond(x,y,w,d,z0=0,K=.2){ '@later'; const zw=z0+7;
  const p=msPut('moon pond',[msStone(x,y,x+w,y+K,z0,zw),msStone(x,y+d-K,x+w,y+d,z0,zw),msStone(x,y+K,x+K,y+d-K,z0,zw),msStone(x+w-K,y+K,x+w,y+d-K,z0,zw)],{flat:false});
  LAMPS.push(msLamp({x:x+w/2,y:y+d/2,z:zw+4,r:3.6,c:[.3,.95,.85]},p)); return p; }
const MSKOI=[{c:[232,98,48],m:[250,244,236],a:1.2,b:1,z:.4,hd:0,sp:.22,tail:0,face:1,up:0}];
for(const k of MSKOI){ const c=v=>v.map(q=>q/255), b=c(k.c); k.pal={b,m:c(k.m),t:b,f:b.map(q=>q*.55+.45),e:[.04,.04,.05]}; }
const MSFL=[[0,.05],[2.1,.04],[4.2,.06]];
const MSLANT=["..ddddd..",".dPPPPPd.","dpPPPPPpd","dPPPPPPPd","dbbbbbbbd","dPPPPPPPd","dpPPPPPpd","dPPPPPPPd",".wwwwwww.","..wwwww.."];
Object.assign(CATALOG,{'stone terrace':(x,y)=>msTerrace(x-2.78,y-2.69),'mossy steps':(x,y)=>msSteps(x-1.2,y-.6),'spiral stone plaza':(x,y)=>msPlaza(x-2.78,y-2.8),
  'statue plinth':(x,y)=>msPlinth(x,y),'moon shrine statue':(x,y)=>msStatue(x,y),'moon shrine gate':(x,y)=>msGate(x,y),'hanging paper lantern':(x,y)=>msHangingLantern(x,y,60),
  'blossom clump':(x,y)=>msBlossom(x,y),'square stone post':(x,y)=>msPost(x,y),'stone post with vines':(x,y)=>msPost(x,y,0,true),'paper ground lantern':(x,y)=>msGroundLantern(x,y),
  'floating pond lantern':(x,y)=>msFloatingLantern(x,y),'stone garden lantern':(x,y)=>msToro(x,y),'mossy cliff rock':(x,y)=>msRock(x,y),'fern bush':(x,y)=>msFern(x,y),
  'moss and grass tuft':(x,y)=>msTuft(x,y),'wooden marker post':(x,y)=>msMarker(x,y),'mossy walkway stone':(x,y)=>msStepStone(x-.5,y-.35),'moon pond':(x,y)=>msPond(x-2.7,y-1.7,5.4,3.4),
  'mossy parapet':(x,y)=>msParapet(x-3,y-.11,x+3,y+.11)});
if(!CAT_DEPTS.some(d=>d[0]==='shrine'))CAT_DEPTS.push(['shrine','Moon shrine']);
Object.assign(CAT_INFO,{
  'moon shrine gate':{no:'G-401',name:'Vine-Wrapped Red Gate',dept:'shrine',price:12000,desc:'Red timber shrine gate with two hanging lanterns.',mat:'cedar, lacquer, paper'},
  'moon shrine statue':{no:'G-402',name:'Robed Stone Statue',dept:'shrine',price:18000,desc:'Carved stone figure with a staff and a gold halo.',mat:'granite, gold leaf'},
  'statue plinth':{no:'G-403',name:'Lotus Plinth',dept:'shrine',price:3500,desc:'Stone drum with a carved lotus.',mat:'granite'},
  'mossy steps':{no:'G-404',name:'Mossy Stone Steps',dept:'shrine',price:2200,desc:'Two stone steps with side walls.',mat:'stone'},
  'spiral stone plaza':{no:'G-405',name:'Spiral-Carved Stone Plaza',dept:'shrine',price:6500,desc:'Flagstone plaza with a carved spiral.',mat:'stone'},
  'mossy walkway stone':{no:'G-406',name:'Mossy Stepping Stone',dept:'shrine',price:180,desc:'Flat stepping stone.',mat:'stone'},
  'square stone post':{no:'G-407',name:'Square Stone Post',dept:'shrine',price:900,desc:'Stone post with a pointed cap.',mat:'stone'},
  'stone post with vines':{no:'G-408',name:'Stone Post with Vines',dept:'shrine',price:950,desc:'Stone post with ivy.',mat:'stone'},
  'wooden marker post':{no:'G-409',name:'Wooden Marker Post',dept:'shrine',price:120,desc:'Wooden post with a crossbar.',mat:'wood'},
  'paper ground lantern':{no:'L-501',name:'Paper Ground Lantern',dept:'shrine',price:85,desc:'Wood-framed paper floor lantern.',mat:'wood, paper'},
  'hanging paper lantern':{no:'L-502',name:'Hanging Paper Lantern',dept:'shrine',price:40,desc:'Round paper lantern on a cord.',mat:'paper, bamboo'},
  'floating pond lantern':{no:'L-503',name:'Floating Pond Lantern',dept:'shrine',price:15,desc:'Paper lantern on a wooden float.',mat:'paper, wood'},
  'stone garden lantern':{no:'L-504',name:'Stone Garden Lantern',dept:'shrine',price:1400,desc:'Carved stone lantern on a mossy rock.',mat:'granite'},
  'moon pond':{no:'W-601',name:'Koi Pond Kerb',dept:'shrine',price:9000,desc:'Stone kerb round a koi pond (the water is the land\'s: water squares).',mat:'stone'},
  'blossom clump':{no:'W-604',name:'Pink Blossom Clump',dept:'shrine',price:60,desc:'Flowering cherry shrub.',mat:'living'},
  'moss and grass tuft':{no:'W-605',name:'Moss & Grass Tuft',dept:'shrine',price:8,desc:'Clump of moss and grass.',mat:'living'},
  'fern bush':{no:'W-606',name:'Dark Fern Bush',dept:'shrine',price:35,desc:'Shade fern.',mat:'living'},
  'mossy cliff rock':{no:'W-607',name:'Mossy Cliff Rock',dept:'shrine',price:750,desc:'Boulder cluster with moss.',mat:'stone, moss'},
  'stone terrace':{no:'G-410',name:'Stone Terrace',dept:'shrine',price:8500,desc:'Raised stone platform.',mat:'stone'},
  'mossy parapet':{no:'G-411',name:'Mossy Parapet Section',dept:'shrine',price:900,desc:'Six-tile run of low stone wall with hanging vines.',mat:'stone, ivy'}});
for(const k of ['moon shrine gate','moon shrine statue','statue plinth','mossy steps','spiral stone plaza','mossy walkway stone','square stone post','stone post with vines','wooden marker post',
  'paper ground lantern','hanging paper lantern','floating pond lantern','stone garden lantern','moon pond','blossom clump','moss and grass tuft','fern bush','mossy cliff rock','stone terrace','mossy parapet'])if(!KIND_OF[k])KIND_OF[k]=k;
PRESETS['Preset Moon Shrine 1']=[['mossy parapet',3,.11,0],['mossy parapet',3,15.89,2],...[3.22,8,12.78].flatMap(v=>[['mossy parapet',.11,v,3],['mossy parapet',5.89,v,1]]),['stone terrace',3,2.91,0],['mossy steps',3,6.2,0],['spiral stone plaza',3,9.6,0],['moon pond',3,14.19,0],
  ['mossy cliff rock',.85,.85,0],['statue plinth',3,2.7,0],['moon shrine statue',3,2.7,0],['moon shrine gate',3,5.25,0],['wooden marker post',5,1.25,0],
  ['square stone post',5.4,7.2,0],['stone post with vines',.6,7.2,0],['square stone post',.6,12,0],['stone post with vines',5.4,12,0],
  ['paper ground lantern',1.25,7.3,0],['paper ground lantern',4.75,7.3,0],['paper ground lantern',1.6,11.9,0],['paper ground lantern',4.4,11.9,0],['paper ground lantern',1,4.9,0],
  ['mossy walkway stone',4.4,13.1,0],['mossy walkway stone',4.5,14.1,0],['mossy walkway stone',4.45,15.15,0],['stone garden lantern',.78,15.2,0],
  ['fern bush',5.2,15.25,0],['fern bush',.48,6.55,0],['fern bush',5.52,6.4,0],['blossom clump',.55,5.3,0],['blossom clump',5.45,5.25,0],['blossom clump',.45,9.6,0],['blossom clump',2.2,1.4,0]];

STOREK.shrine={MSP,msStone,msGate,msStatue,msToro,msBlossom,msFloatingLantern,msFern,msBlock,msFlag};
}

{
const PGK=(()=>{ const ZS=27, TX=24, E1=1<<24, E2=2<<24, SKY=3<<24, FIRE=4<<24, GLOW=5<<24;
  const C=s=>parseInt(s.slice(1),16);
  const shd=(c,k)=>{ const r=Math.min(255,((c>>16)&255)*k)|0,g=Math.min(255,((c>>8)&255)*k)|0,b=Math.min(255,(c&255)*k)|0; return (c&0x7f000000)|(r<<16)|(g<<8)|b; };
  const mix=(a,b,t)=>{ const r=((a>>16)&255)*(1-t)+((b>>16)&255)*t,g=((a>>8)&255)*(1-t)+((b>>8)&255)*t,bb=(a&255)*(1-t)+(b&255)*t; return (a&0x7f000000)|(r<<16)|(g<<8)|bb; };
  const hh=(x,y,s)=>{ let h=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul((s|0)+7,1442695041); h=Math.imul(h^(h>>>13),1274126177); h^=h>>>16; return (h>>>0)/4294967296; };
  const n1=(t,s)=>{ const i=Math.floor(t),f=t-i,a=hh(i,s,9),b=hh(i+1,s,9),u=f*f*(3-2*f); return a+(b-a)*u; };
  const sstep=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
  let RS=12345; const rnd=()=>{ RS=(Math.imul(RS,1103515245)+12345)>>>0; return RS/4294967296; }, rr=(a,b)=>a+(b-a)*rnd(), seed=s=>{ RS=s; };
  const ITEMS={}; let cur=null, SCN=null;
  const scene=(name,LX,LY,WH,holes,o)=>{ SCN={name,LX,LY,WH,holes:holes||[],...(o||{})}; };
  const item=(name,o)=>{ cur=ITEMS[name]||(ITEMS[name]={name,prims:[],lamps:[],flames:[],o:o||{},scn:SCN,room:SCN&&SCN.name}); };
  const add=p=>{ if(cur)cur.prims.push(p); return p; };
  const box=(x0,y0,z0,x1,y1,z1,c,o)=>add(Object.assign({t:0,x0:Math.min(x0,x1),y0:Math.min(y0,y1),z0,x1:Math.max(x0,x1),y1:Math.max(y0,y1),z1,c},o||{}));
  const cyl=(cx,cy,r0,z0,z1,c,o,r1)=>add(Object.assign({t:1,cx,cy,r0,r1:r1===undefined?r0:r1,z0,z1,c},o||{}));
  const ell=(cx,cy,cz,rx,ry,rz,c,o)=>add(Object.assign({t:2,cx,cy,cz,rx,ry,rz,c},o||{}));
  const lamp=(x,y,z,r,col,I,fl,o)=>{ if(cur)cur.lamps.push({x,y,z,r,col,I,fl:fl||0,o:o||{}}); return 0; };
  const flame=(x,y,z)=>{ if(cur)cur.flames.push({x,y,z,s:cur.flames.length}); };
  const wood=(base,o={})=>{ const sd=o.seed||1,lite=o.lite||1.12,dark=o.dark||0.8,pl=o.plank||0,along=o.along||'v';
    return (f,u,v,W,H)=>{ '@later'; let a,b; if(f==='T'){ a=along==='u'?u:v; b=along==='u'?v:u; } else { a=(f==='S'||f==='N'||along==='v')?v:u; b=a===v?u:v; }
      const bi=Math.floor(b/(o.gw||2)); let k=0.93+0.1*hh(bi,0,sd)+0.05*Math.sin(a*0.3+bi*2.3);
      if(hh(bi,Math.floor(a/7),sd+5)<0.05)k*=0.82; if(pl&&Math.floor(b)%pl===0)k*=0.72;
      if(!o.nobev){ if(v<1||u<1)k*=lite; else if(v>H-1.1||u>W-1.1)k*=dark; } return shd(base,k); }; };
  const PAL={trim:C('#a28a5a'),red:C('#6e2f26'),redL:C('#8a4232'),redD:C('#4a1d18'),leaf:C('#2f6a34'),leafL:C('#4c9441'),leafD:C('#1f4a26'),teal:C('#2c6656'),tealL:C('#43876c'),
    pump:C('#d9741c'),pumpL:C('#f2a03a'),pumpD:C('#a8520f'),stem:C('#4e6a2a'),glass:C('#d6d4c2'),glassD:C('#a9aa98'),cork:C('#b4945e'),wax:C('#e6dbbf'),waxD:C('#c4b593'),
    gold:C('#94722c'),paper:C('#ece4cc'),terra:C('#b05a3a'),soil:C('#3a2a1c')};
  const candle=(x,y,z,h,r)=>{ r=r||0.04; cyl(x,y,r,z,z+h,(f,u,v,W,H)=>f==='T'?((u-W/2)**2+(v-H/2)**2<1?PAL.waxD:PAL.wax):shd(PAL.wax,(v<1.2?1.08:1)*(hh(u,v>>1,4)<0.08?0.9:1)*(Math.abs(u%(W)-W*0.2)<1?1.12:1)),{small:1}); flame(x,y,z+h); };
  const jar=(x,y,z,r,h,fill,o)=>{ o=o||{};
    cyl(x,y,r,z,z+h,(f,u,v,W,H)=>{ '@later'; if(f==='T')return PAL.glassD; const fl=v/H; let c=PAL.glass;
      if(fill!==undefined&&fl>(o.lvl||0.35)){ c=mix(PAL.glass,fill,0.75); if(hh(u>>1,v>>1,11)<0.15)c=shd(c,0.8); }
      if(o.label&&fl>0.45&&fl<0.75&&(u%W)<W*0.45)c=(fl<0.5||fl>0.7)?PAL.paper:C('#d8ccb0');
      const hl=(u%W)/W; if(hl>0.1&&hl<0.16)c=shd(c,1.25); if(v<1)c=shd(c,1.1); return c; },{small:1});
    cyl(x,y,r*0.78,z+h,z+h+Math.max(0.035,h*0.14),(f,u,v,W,H)=>f==='T'?shd(PAL.cork,1.08):shd(PAL.cork,v<1?1.1:0.92+0.1*hh(u,v,2)),{small:1}); };
  const bookLying=(x0,y0,z0,x1,y1,h,col,o)=>{ o=o||{}; return box(x0,y0,z0,x1,y1,z0+h,(f,u,v,W,H)=>{ if(f==='T')return shd(col,(u<1||v<1)?1.15:(u>W-1||v>H-1)?0.75:1);
    if(v<1||v>H-1)return shd(col,0.85); if(f===o.spine)return (u>2&&u<3)?PAL.gold:shd(col,0.9); return (Math.floor(v)%2?PAL.paper:C('#cfc6a8')); },{small:1}); };
  const bookStand=(x0,y0,z0,x1,y1,h,col,spine)=>box(x0,y0,z0,x1,y1,z0+h,(f,u,v,W,H)=>{ if(f==='T')return (u<1||u>W-1||v<1||v>H-1)?shd(col,0.8):PAL.paper;
    if(f===spine){ if((v>2&&v<3)||(v>H-4&&v<H-3))return PAL.gold; return shd(col,u<1?1.18:u>W-1?0.75:1); } return shd(col,0.85); },{small:1});
  const leafE=(x,y,z,rx,ry,rz,col,o)=>ell(x,y,z,rx,ry,rz,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ const d=lx*lx+ly*ly, ax=rx>ry?ly:lx;
    let c=col; if(Math.abs(ax)<0.12&&d<0.7)c=shd(col,1.22); if(d>0.78)c=shd(col,0.72); if(lz>0.5&&d<0.25)c=shd(c,1.08); return c; },Object.assign({small:1},o||{}));
  const pot=(x,y,z,r,h,col,o)=>{ col=col||PAL.terra; cyl(x,y,r*0.78,z,z+h,(f,u,v,W,H)=>{ if(f==='T')return hh(u,v,5)<0.2?C('#4a3624'):PAL.soil; if(v<3)return shd(col,v<1?1.2:1.05); return shd(col,(Math.floor(u)%11===0?0.85:1)*(v>H-1.2?0.8:1)); },o,r); };
  const fern=(x,y,z,s,col,o)=>{ col=col||PAL.teal; for(let i=0;i<7;i++){ const a=i/7*6.283+rr(-0.3,0.3), len=s*rr(0.75,1.1);
    for(let k=1;k<=5;k++){ const t=k/5, d=len*t, zz=z+s*0.5*Math.sin(t*2.6)-0.05*t; leafE(x+Math.cos(a)*d,y+Math.sin(a)*d,zz,s*0.13*(1.1-t*0.4),s*0.13*(1.1-t*0.4),0.03,k%2?col:shd(col,1.15),o); } } };
  const pothos=(x,y,z,len,dir,o)=>{ let px=x,py=y,pz=z; const [dx,dy]=dir; for(let k=0;k<len*9;k++){ px+=dx*0.025+rr(-0.02,0.02); py+=dy*0.025+rr(-0.02,0.02); pz-=0.11;
    const c=rnd()<0.4?PAL.leafL:rnd()<0.5?PAL.leaf:C('#5aa548'); leafE(px+rr(-0.06,0.06),py+rr(-0.06,0.06),pz,0.075,0.075,0.035,c,o); } };
  const pumpkin=(x,y,z,r,h)=>{ ell(x,y,z+h/2,r,r,h/2,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ const a=Math.atan2(ly,lx), rib=Math.cos(a*8); let c=rib>0.75?PAL.pumpD:rib<-0.2?PAL.pump:PAL.pumpL; if(rib<-0.85)c=shd(PAL.pump,0.92); if(lz>0.75&&lx*lx+ly*ly<0.12)c=PAL.pumpD; return c; },{small:r<0.2});
    cyl(x,y,r*0.12,z+h*0.92,z+h*1.2,PAL.stem,{small:1},r*0.08); };
  const vase=(x,y,z,r,h,col)=>cyl(x,y,r,z,z+h,(f,u,v,W,H)=>f==='T'?shd(col,0.6):shd(col,((u%W)/W>0.12&&(u%W)/W<0.2)?1.3:1),{small:1},r*0.6);
  const flowers=(x,y,z,s,col,colL,n)=>{ for(let i=0;i<(n||9);i++){ const a=rr(0,6.28),d=rr(0,s*0.6); ell(x+Math.cos(a)*d,y+Math.sin(a)*d,z+rr(0,s*0.5),s*0.22,s*0.22,s*0.18,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>lz>0.3&&lx*lx+ly*ly<0.1?C('#f0d060'):(lz>0.2?colL:col),{small:1}); } };
  const wallClock=(cx,cz,col,colD,tick)=>{ const LY=SCN.LY; box(cx-0.36,LY-0.07,cz-0.36,cx+0.36,LY,cz+0.36,(f,u,v,W,H,x,y,z)=>{ '@later'; const dx=x-cx,dz=z-cz,d=Math.hypot(dx,dz); if(d>0.36)return -1; if(d>0.3)return d>0.34?colD:col; if(d<0.025)return tick;
    const ang=Math.atan2(dx,dz); for(let k=0;k<12;k++){ const a=k/12*6.283; if(Math.abs(Math.sin(ang-a))*d<0.012&&Math.cos(ang-a)>0&&d>0.24)return tick; }
    const hand=(a,len,w)=>Math.cos(ang-a)>0&&d<len&&Math.abs(Math.sin(ang-a))*d<w; if(hand(10.17/12*6.283,0.17,0.02)||hand(2/12*6.283,0.25,0.013))return 0x2a2620; return 0xe0d6b8; },{wall:'S'}); };
  const frameArt=(f,u,v,W,H,inner)=>{ if(u<2||v<2||u>W-2||v>H-2)return (u<1||v<1)?PAL.redL:PAL.redD; if(u<3||v<3||u>W-3||v>H-3)return PAL.trim; return inner(u-3,v-3,W-6,H-6); };
  const drapes=(name,wall,rod,spans,cols,amp,sd)=>{ seed(sd); const list=[], alongX=wall==='N';
    for(const [a,b,lmax,lmin] of spans){ let x=a; while(x<b){ const w=rr(0.07,0.13); list.push({a:x,w,len:rr(lmin,lmax),ph:rr(0,6.28),amp:rr(amp[0],amp[1]),c:cols[Math.floor(rnd()*cols.length)]}); x+=w*0.8; } }
    let P0=null, L=[1,1,1], litAt=-1e9;
    const strip=(d,a,b,z0,z1,c,o)=>alongX?box(a,0.03,z0,b,0.06,z1,c,o):box(0.03,a,z0,0.06,b,z1,c,o);
    item(name,{wall:1,drape:(dx,dy,near)=>{ '@later'; const out=[];
      for(const d of list){ const hem=Math.min(0.5,d.len*0.4), zt=(rod-d.len+hem)*ZS, zb=(rod-d.len)*ZS, r=alongX?{x0:d.a-0.1+dx,x1:d.a+d.w+0.1+dx,y0:0.03+dy,y1:0.06+dy}:{x0:0.03+dx,x1:0.06+dx,y0:d.a-0.1+dy,y1:d.a+d.w+0.1+dy};
        out.push(sided({...r,z0:zb,z1:zt,c:[0,0,0],nb:1,life:1,top:()=>null,
          fs:(nx,ny,X,Y,z,k)=>{ if(LIFE.mode!==1||(alongX?!ny:!nx)||near(wall))return null; const f=LIFE.f||0, zr=z/((zt-zb)||1), off=d.amp*(1-zr)*1.6*Math.sin(f/8*6.283+d.ph), a=(alongX?X-dx:Y-dy)-d.a-off;
            if(a<0||a>d.w||(z<2+2*hh(Math.floor(a*TX),3,d.a*99)))return null;
            if(P0&&typeof lightEnv==='function'){ const now=performance.now(); if(now-litAt>1000){ litAt=now; const env=lightEnv(P0.x0-.5,P0.y0-.5,P0.x1+.5,P0.y1+.5,false,0); L=env?lightAt(env,(P0.x0+P0.x1)/2,(P0.y0+P0.y1)/2,(zb+zt)/48,null).map(v=>Math.max(.12,Math.min(1.1,v))):[1,1,1]; } }
            const fold=Math.sin(a*TX*1.1+d.ph), c=shd(d.c,fold>0.6?1.2:fold<-0.6?0.78:1); return [Math.round(((c>>16)&255)*L[0]*k),Math.round(((c>>8)&255)*L[1]*k),Math.round((c&255)*L[2]*k)]; }})); }
      return out; },setP:p=>{ P0=p; }});
    for(const d of list){ const hem=Math.min(0.5,d.len*0.4); strip(d,d.a,d.a+d.w,rod-d.len+hem,rod,(f,u,v,W,H)=>{ const fold=Math.sin(u*1.1+d.ph); return shd(d.c,fold>0.6?1.2:fold<-0.6?0.78:1); },{small:1,wall}); }
    return list; };
  const beads=(name,top,strings)=>{ let P0=null;
    item(name,{wall:1,drape:(dx,dy,near)=>strings.map(s=>{ const x=0.05+dx, y0=s.y-0.12+dy, y1=s.y+0.14+dy, zb=(top-s.len-0.1)*ZS, zt=(top-s.len*0.45)*ZS;
      return sided({x0:x,x1:x+0.03,y0,y1,z0:zb,z1:zt,c:[0,0,0],nb:1,life:1,top:()=>null,fs:(nx,ny,X,Y,z,k)=>{ if(LIFE.mode!==1||!nx||near('W'))return null; const f=LIFE.f||0, zz=zb+z, L=(top*ZS-zz)/ZS, th=0.05*Math.sin(f/8*6.283+s.y*3), sy=s.y+Math.sin(th)*L, a=Y-dy-sy;
        if(Math.abs(a)<0.006)return tone([58,50,38],k);
        for(let k2=0;k2<s.cols.length;k2++){ const bz=(top-0.35-k2*(s.len-0.3)/s.cols.length)*ZS; if(bz>zt||bz<zb)continue; const r=(k2===2?0.04:0.028); if(Math.abs(a)<r&&Math.abs(zz-bz)<r*ZS*1.4)return tone(rgb(C(s.cols[k2])),k); }
        return null; }}); }),setP:p=>{ P0=p; }});
    for(const s of strings){ box(0.05,s.y,top-s.len*0.45,0.07,s.y+0.012,top,0x3a3226,{small:1,wall:'W'});
      s.cols.forEach((col,k)=>{ const z=top-0.35-k*(s.len-0.3)/s.cols.length; if(z<top-s.len*0.45)return; ell(0.07,s.y+0.007,z,k===2?0.04:0.028,k===2?0.04:0.028,k===2?0.07:0.03,C(col),{small:1,wall:'W'}); }); } };
  const tone=(c,k)=>!c?null:c.e||k===1?c:[Math.round(c[0]*k),Math.round(c[1]*k),Math.round(c[2]*k)];
  const rgb=c=>{ if(c<0||c===undefined||c===null)return null; const k=c>>>24, o=[(c>>16)&255,(c>>8)&255,c&255]; return k===0?o:Object.assign(o,{e:1}); };
  const flick=(x,y,f)=>hh(Math.floor(x*97),Math.floor(y*89),f);
  const fireCol=(X,z,f)=>{ const q=Math.max(0,Math.min(1,0.55+0.45*Math.sin(X*31+f*1.7)*Math.cos(z*0.4-f*2.3)+0.2*(flick(X,z,f)-0.5)));
    return Object.assign([255,Math.round(40+q*q*190),Math.round(q*q*q*90)],{e:1}); };
  const faceUV=(p,f,x,y,z)=>{ '@later'; switch(f){ case 'T':return [(x-p.x0)*TX,(y-p.y0)*TX,(p.x1-p.x0)*TX,(p.y1-p.y0)*TX];
      case 'E':return [(p.y1-y)*TX,(p.z1-z)*TX,(p.y1-p.y0)*TX,(p.z1-p.z0)*TX]; case 'W':return [(y-p.y0)*TX,(p.z1-z)*TX,(p.y1-p.y0)*TX,(p.z1-p.z0)*TX];
      case 'S':return [(x-p.x0)*TX,(p.z1-z)*TX,(p.x1-p.x0)*TX,(p.z1-p.z0)*TX]; default:return [(p.x1-x)*TX,(p.z1-z)*TX,(p.x1-p.x0)*TX,(p.z1-p.z0)*TX]; } };
  const paint=(p,f,x,y,z)=>{ if(typeof p.c!=='function')return p.c; const [u,v,W,H]=faceUV(p,f,x,y,z);
    return p.c(f,u,v,W,H,x,y,z,(x-p.x0)/((p.x1-p.x0)||1),(y-p.y0)/((p.y1-p.y0)||1),(z-p.z0)/((p.z1-p.z0)||1)); };
  const vis=i=>{ const a=wvV(1,0), c=wvV(0,1); return a[i]||c[i]; };
  const near=w=>w==='W'?vis(0)<0:w==='E'?vis(0)>0:w==='N'?vis(1)<0:w==='S'?vis(1)>0:false, nearIn=S=>S&&S.full?()=>false:w=>near(S&&S.turn?turnW(w,S.turn):w);
  const turnW=(w,r)=>{ let [x,y]=w==='W'?[-1,0]:w==='E'?[1,0]:w==='N'?[0,-1]:[0,1]; for(let k=0;k<r;k++)[x,y]=[-y,x]; return x<0?'W':x>0?'E':y<0?'N':'S'; };
  const asGame=(c,X,z,live)=>{ if(c<0||c===undefined)return null; const k=c>>>24; if(k===3)return null; if(k===4)return fireCol(X,z,live?LIFE.f||0:0); if(live)return null; return rgb(c); };
  const wallOfPrim=(p,S)=>{ if(p.wall)return p.wall; const [x0,y0,x1,y1,z0]=p.t===0?[p.x0,p.y0,p.x1,p.y1,p.z0]:p.t===1?[p.cx-p.r0,p.cy-p.r0,p.cx+p.r0,p.cy+p.r0,p.z0]:[p.cx-p.rx,p.cy-p.ry,p.cx+p.rx,p.cy+p.ry,p.cz-p.rz];
    if(!S||z0<=1.0)return null; return x1<0.45?'W':y1<0.45?'N':x0>S.LX-0.45?'E':y0>S.LY-0.45?'S':null; };
  const inHole=(p,S,f,X,Y,z)=>{ if(!S||!p.wallOf)return false; for(const h of S.holes){ if(h.wall!==p.wallOf)continue; const a=(h.wall==='W'||h.wall==='E')?Y:X; if(a>h.a0&&a<h.a1&&z<h.z1)return true; } return false; };
  function gameBoxes(it,dx,dy){ '@later'; const out=[], S=it.scn, near=nearIn(S);
    for(const p of it.prims){ const live=!!p.fire, hw=wallOfPrim(p,S), only=p.cutOnly;
      const gone=()=>(hw&&near(hw))||(only&&!near(only));
      if(p.t===0){
        if(p.floor){ out.push({x0:p.x0+dx,y0:p.y0+dy,x1:p.x1+dx,y1:p.y1+dy,z0:0,z1:0.3,c:[0,0,0],foot:1,nb:1,top:(X,Y)=>LIFE.mode===1?null:rgb(paint(p,'T',X-dx,Y-dy,p.z1)),fi:()=>null,fj:()=>null}); continue; }
        const lift=it.o.flat?0.4:0;
        const mk=(z0,z1,c,keep)=>sided({x0:p.x0+dx,y0:p.y0+dy,x1:p.x1+dx,y1:p.y1+dy,z0,z1,c:c||[0,0,0],foot:z0<=0.5?1:0,nb:p.sh?0:1,life:live?1:0,
          top:(X,Y)=>{ if(LIFE.mode===1||gone()||(keep&&!keep()))return null; return rgb(paint(p,'T',X-dx,Y-dy,p.z1)); },
          fs:(nx,ny,X,Y,z,k)=>{ if(gone()||(keep&&!keep()))return null; const f=nx>0?'E':nx<0?'W':ny>0?'S':'N', zu=(z0+z)/ZS-lift/ZS; if(inHole(p,S,f,X-dx,Y-dy,zu))return null; const c=paint(p,f,X-dx,Y-dy,zu);
            if(LIFE.mode===1)return live?asGame(c,X+Y,z,1):null; return tone(asGame(c,X+Y,z,0),k); }});
        const c0=typeof p.c==='number'?rgb(p.c):[120,110,100];
        if(p.wallOf){
          const cutH=(p.cutH||0.12)*ZS, top=p.z1*ZS, cut={...p,c:p.cutC||p.c};
          out.push(sided({x0:p.x0+dx,y0:p.y0+dy,x1:p.x1+dx,y1:p.y1+dy,z0:0,z1:cutH,c:c0||[0,0,0],foot:1,nb:1,
            top:(X,Y)=>near(p.wallOf)?rgb(paint(cut,'T',X-dx,Y-dy,p.cutH||0.12)):null,
            fs:(nx,ny,X,Y,z,k)=>{ const f=nx>0?'E':nx<0?'W':ny>0?'S':'N', zu=z/ZS; if(inHole(p,S,f,X-dx,Y-dy,zu))return null; const pp=near(p.wallOf)?{...cut,z1:p.cutH||0.12}:p; return tone(asGame(paint(pp,f,X-dx,Y-dy,zu),X+Y,z,0),k); }}));
          out.push(mk(cutH,top,c0,()=>!near(p.wallOf))); continue; }
        out.push(mk(p.z0*ZS+lift,p.z1*ZS+lift,c0)); }
      else {
        const z0=(p.t===1?p.z0:p.cz-p.rz)*ZS, z1=(p.t===1?p.z1:p.cz+p.rz)*ZS, cx=p.cx, cy=p.cy, lift=it.o.flat?0.4:0;
        const rad=zz=>{ const zu=zz/ZS; if(p.t===1)return [p.r0+(p.r1-p.r0)*(zu-p.z0)/((p.z1-p.z0)||1)]; const q=1-((zu-p.cz)/p.rz)**2; return q<=0?[0]:[p.rx*Math.sqrt(q),p.ry*Math.sqrt(q)]; };
        const col=(X,Y,zu,top)=>{ let c; if(typeof p.c==='number')c=p.c;
          else if(p.t===1){ const rm=Math.max(p.r0,p.r1); if(top){ const r1=p.r1; c=p.c('T',(X-cx+r1)*TX,(Y-cy+r1)*TX,2*r1*TX,2*r1*TX,X,Y,zu,(X-cx)/rm,(Y-cy)/rm,(zu-p.z0)/((p.z1-p.z0)||1)); }
            else { const circ=2*Math.PI*rm*TX; c=p.c('S',(Math.atan2(Y-cy,X-cx)/(2*Math.PI)+0.5)*circ,(p.z1-zu)*TX,circ,(p.z1-p.z0)*TX,X,Y,zu,(X-cx)/rm,(Y-cy)/rm,(zu-p.z0)/((p.z1-p.z0)||1)); } }
          else { const lx=(X-cx)/p.rx, ly=(Y-cy)/p.ry, lz=(zu-p.cz)/p.rz; c=p.c('E',(Math.atan2(ly,lx)/(2*Math.PI)+0.5)*2*Math.PI*Math.max(p.rx,p.ry)*TX,(p.cz+p.rz-zu)*TX,1,1,X,Y,zu,lx,ly,lz); }
          return c; };
        const dz=Math.max(1,Math.min(2,(z1-z0)/2)), dw=Math.max(0.03,Math.min(0.06,(p.t===1?Math.max(p.r0,p.r1):Math.max(p.rx,p.ry))/3));
        for(let z=z0;z<z1-1e-9;z+=dz){ const za=z, zb=Math.min(z1,z+dz), r=rad((za+zb)/2), rx=r[0], ry=r.length>1?r[1]:r[0]; if(!(rx>.004&&ry>.004))continue;
          const n=Math.max(1,Math.round(2*rx/dw)), w=2*rx/n;
          for(let i=0;i<n;i++){ const xa=-rx+i*w, xm=xa+w/2, hy=ry*Math.sqrt(Math.max(0,1-(xm/rx)**2)); if(hy<w*.3)continue;
            out.push(sided({x0:cx+xa+dx,y0:cy-hy+dy,x1:cx+xa+w+dx,y1:cy+hy+dy,z0:za+lift,z1:zb+lift,c:[90,90,90],foot:za<=0.5?1:0,nb:1,
              fs:(nx,ny,X,Y,zr,k)=>LIFE.mode===1||gone()?null:tone(asGame(col(X-dx,Y-dy,(za+zr)/ZS,0),0,0,0),k*(0.86+0.14*Math.abs(nx?(Y-dy-cy)/(hy||1):(X-dx-cx)/(rx||1)))),
              top:(X,Y)=>LIFE.mode===1||gone()?null:asGame(col(X-dx,Y-dy,zb/ZS,1),0,0,0)})); } } } }
    for(const fl of it.flames){ const x=fl.x+dx, y=fl.y+dy, z=fl.z*ZS, w=S?(fl.x<0.45?'W':fl.y<0.45?'N':fl.x>S.LX-0.45?'E':fl.y>S.LY-0.45?'S':null):null;
      out.push(sided({x0:x-.018,y0:y-.018,x1:x+.018,y1:y+.018,z0:z,z1:z+7,c:[255,200,100],nb:1,em:1,life:1,top:()=>null,
        fs:(nx,ny,X,Y,zr)=>{ if(w&&fl.z>1&&near(w))return null; const f=LIFE.mode===1?(LIFE.f||0):0, ht=f%3===2?6:f%3===1?5:4, k=Math.floor(zr);
          if(k>=ht)return null; if(LIFE.mode!==1&&k>=3)return null; return Object.assign(k<2?[255,240,176]:k<4?[255,200,96]:[240,138,48],{e:1}); }})); }
    return out; }
  function register(dept,info){ for(const it of Object.values(ITEMS)){ if(it.done)continue; it.done=1;
      const fp=it.prims.filter(p=>p.t!==0||p.z0<=0.05), bx=fp.length?fp:it.prims, xs=[], ys=[];
      for(const p of bx){ if(p.t===0){ xs.push(p.x0,p.x1); ys.push(p.y0,p.y1); } else { const r=p.t===1?Math.max(p.r0,p.r1):p.rx, ry=p.t===1?r:p.ry; xs.push(p.cx-r,p.cx+r); ys.push(p.cy-ry,p.cy+ry); } }
      const cx=(Math.min(...xs)+Math.max(...xs))/2, cy=(Math.min(...ys)+Math.max(...ys))/2, o=it.o, name=it.name, S=it.scn;
      const high=it.prims.every(p=>wallOfPrim(p,S)||p.wall||(p.t===0?p.z0:p.t===1?p.z0:p.cz-p.rz)>1.0), walls=it.prims.filter(p=>p.wallOf);
      it.c=[cx,cy];
      CATALOG[name]=(x,y)=>{ '@later'; SHARED.PNAME=name; const dx=x-cx, dy=y-cy, bs=gameBoxes(it,dx,dy);
        if(!bs.some(b=>b.z0===0||b.foot))for(const b of bs)b.foot=1;
        const moving=it.flames.length||it.prims.some(p=>p.fire)||o.drape;
        let lf=0; const opts={...(o.wall||high?{walk:true,high:true,hang:Math.max(0,Math.round(Math.min(...it.prims.map(p=>p.t===2?p.cz-p.rz:p.z0))*ZS))}:{}),...(o.flat||o.floor?{flat:true,walk:true}:{}),...(o.walk?{walk:true}:{}),...(o.stands?{walk:true,stands:o.stands.map(([a,b,c,d,z])=>({x0:a+dx,y0:b+dy,x1:c+dx,y1:d+dy,z}))}:{}),
          ...(moving?{life:t=>{ lf=Math.floor(t*8)%8; LIFE.f=lf; },lifeKey:()=>lf}:{})};
        if(walls.length){ const sol=[]; for(const p of walls){ const along=p.x1-p.x0>p.y1-p.y0, lo=along?p.x0:p.y0, hi=along?p.x1:p.y1, hs=(S?S.holes:[]).filter(h=>h.wall===p.wallOf).sort((a,b)=>a.a0-b.a0); let a=lo;
            for(const h of hs){ if(h.a0>a)sol.push(along?{x0:a+dx,x1:h.a0+dx,y0:p.y0+dy,y1:p.y1+dy}:{x0:p.x0+dx,x1:p.x1+dx,y0:a+dy,y1:h.a0+dy}); a=Math.max(a,h.a1); }
            if(hi>a)sol.push(along?{x0:a+dx,x1:hi+dx,y0:p.y0+dy,y1:p.y1+dy}:{x0:p.x0+dx,x1:p.x1+dx,y0:a+dy,y1:hi+dy}); }
          opts.solids=sol; }
        else if(o.parts)opts.solids=it.prims.filter(p=>p.t===0&&p.solid).map(p=>({x0:p.x0+dx,y0:p.y0+dy,x1:p.x1+dx,y1:p.y1+dy}));
        if(o.drape)bs.push(...o.drape(dx,dy,nearIn(S)));
        const p=prop(bs,null,opts); if(o.setP)o.setP(p);
        for(const L of it.lamps){ const k=L.I; LAMPS.push({own:1,...(L.o.sw?{}:{room:1,day:true}),x:L.x+dx,y:L.y+dy,z:L.z*ZS,up:L.z*ZS-66,r:L.r,c:[L.col[0]*k,L.col[1]*k,L.col[2]*k],prop:p}); }
        return p; };
      KIND_OF[name]=name; CAT_INFO[name]={...(info[name]||{no:dept.slice(0,2).toUpperCase()+'-'+name.length,name:name[0].toUpperCase()+name.slice(1),price:50,desc:'',mat:''}),dept}; } }
  const put=(D,W,H,x,y,c,a=255)=>{ x=Math.floor(x); y=Math.floor(y); if(x<0||y<0||x>=W||y>=H)return; const i=(y*W+x)*4; if(a<255&&D[i+3]){ const t=a/255; D[i]+=(c[0]-D[i])*t; D[i+1]+=(c[1]-D[i+1])*t; D[i+2]+=(c[2]-D[i+2])*t; D[i+3]=Math.max(D[i+3],a); return; } D[i]=c[0]; D[i+1]=c[1]; D[i+2]=c[2]; D[i+3]=a; };
  const seen=()=>{ const a=wvV(1,0), c=wvV(0,1); return [a[0]||c[0],a[1]||c[1]]; };
  function moving(name,draw){ '@later'; const mk=CATALOG[name], it=ITEMS[name];
    CATALOG[name]=(x,y)=>{ const p=mk(x,y), dx=x-it.c[0], dy=y-it.c[1]; let L=[1,1,1], litAt=-1e9;
      const at=(lx,ly)=>{ const q=[lx+dx,ly+dy]; return p.ed?p.ed(q[0],q[1]):q; };
      const S={p,at,
        scr:(lx,ly,lz,ox,oy,K)=>{ const [X,Y]=at(lx,ly), [vx,vy]=vw(X,Y); return [((vx-vy)*HW-ox)*K,((vx+vy)*HH-(lz*ZS+LVZ(p.lv||0)-LVZ(V.lv))-oy)*K]; },
        faces:(nx,ny)=>{ const o=at(0,0), q=at(nx,ny), s=seen(); return (q[0]-o[0])*s[0]>0.5||(q[1]-o[1])*s[1]>0.5; },
        light:(lx,ly,lz)=>{ const now=performance.now(); if(now-litAt>1000&&typeof lightEnv==='function'){ litAt=now; const [X,Y]=at(lx,ly), env=lightEnv(X-.5,Y-.5,X+.5,Y+.5,false,LVZ(p.lv||0)); L=env?lightAt(env,X,Y,(lz*ZS+LVZ(p.lv||0))/24,null).map(v=>Math.max(.15,Math.min(1.2,v))):[1,1,1]; } return L; }};
      p.lifeDraw=(D,W,H,ox,oy,t,K=1)=>draw(D,W,H,ox,oy,t,K,S); return p; }; }
  const water=(cx,cy,r,rimZ,wi,cfg={})=>{ '@later'; let Wb=null, lv=0; const HT=0.75, w=DEEPW.WATERS[wi], amp=w.waves.reduce((t,v)=>t+v[1],0)*(cfg.height??1);
    return (D,W,H,ox,oy,t,K,S,life)=>{ if(!Wb){ Wb=DEEPW.body(2*r,2*r,HT,wi,{...DEEPW.DEFAULTS,timer:0,bare:true,...cfg,life}); lv=Math.max(0.5,HT-amp-0.08); }
      const Z0=rimZ*ZS-lv*DEEPW.ZPX+LVZ(S.p.lv||0)-LVZ(V.lv); Wb.draw(D,W,H,ox,oy,K,t,(a,b)=>S.at(cx-r+a,cy-r+b),Z0,false,[],null);
      const [ex,ey]=S.scr(cx,cy,rimZ,ox,oy,K), A=r*0.97*Math.SQRT2*HW*K, B=r*0.97*Math.SQRT2*HH*K;
      for(let y=Math.max(0,Math.floor(ey-B-6*K));y<Math.min(H,Math.ceil(ey+B+HT*DEEPW.ZPX*K+6*K));y++)for(let x=Math.max(0,Math.floor(ex-A-3*K));x<Math.min(W,Math.ceil(ex+A+3*K));x++){ const u=(x+0.5-ex)/A, v=(y+0.5-ey)/B; if(u*u+v*v>1)D[(y*W+x)*4+3]=0; } }; };
  const roomPieces=name=>Object.values(ITEMS).filter(it=>it.room===name).map(it=>[it.name,it.c[0],it.c[1]]);
  return {C,shd,mix,hh,n1,sstep,rnd,rr,seed,wood,item,scene,box,cyl,ell,lamp,flame,register,put,moving,water,roomPieces,wallClock,beads,ITEMS,ZS,TX,E1,E2,SKY,FIRE,GLOW,tone,rgb,PAL,candle,jar,bookLying,bookStand,leafE,pot,fern,pothos,pumpkin,vase,flowers,frameArt,drapes}; })();
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
  return (f,u,v,W,H,x,y,z)=>{ '@later';
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
  box(0,0,-0.45,LX,LY,0,(f,u,v,W,H,x,y)=>{ '@later';
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
    (f,u,v,x,y,z)=>{ '@later'; if(f!=='S')return; const hw=winHalf(z), dx=Math.abs(x-WIN.mx);
      if(z>WIN.z0-0.06&&z<WIN.z1+0.06&&hw>-1&&dx<hw+0.07){ if(inWin(x,z)){ return onMullion(x,z)?(Math.abs(x-WIN.mx)<0.015||Math.abs(z-WIN.mz)<0.015?PAL.oakL:PAL.oak):SKY|0x8090a0; } return dx>hw+0.04?PAL.oakD:PAL.oak; }
      if(z>WIN.zs&&z<WIN.z1+0.1&&dx<0.07&&winHalf(z)<0.07)return PAL.oak; });
  const wallE=wallPaint((a)=>0.15+0.3*n1(a*1.2,8)+0.4*sstep(1.5,0,a),37,(f,u,v,x,y,z)=>{ '@later'; if(f!=='W')return;
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
  { const ys=7.85, ye=9.95; 
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
    box(x0,y0,h-0.13,x1,y1,h,(f,u,v,W,H,x,y,z)=>{ '@later'; let k=0.95+0.08*hh(Math.floor(u/12),0,7);
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
  cyl(2.55,2.15,0.95,0,0.015,(f,u,v,W,H)=>{ const d=Math.hypot(u-W/2,v-H/2)/(W/2); return shd(d>0.9?PAL.purpleD:PAL.purple,0.95+0.08*hh(u,v,3)); },{solid:0,occ:0});
  item('patterned rug, purple and gold',{flat:1});
  box(3.5,2.1,0,7.3,5.3,0.02,(f,u,v,W,H)=>{ '@later'; if(f!=='T')return PAL.purpleD;
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
    box(x0,y0,0.12,x1,y1,1.2,(f,u,v,W,H)=>{ '@later'; if(f!=='S')return Wc(f,u,v,W,H);
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
    box(x0,y0,0.33,x1,y1,1.0,(f,u,v,W,H,x,y,z)=>{ '@later'; let c=PAL.iron; if(u<1.2||v<1.2)c=PAL.ironL; else if(u>W-1.2||v>H-1.2)c=PAL.ironD;
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
    box(x0,y0,0.12,x1,y1,h-0.06,(f,u,v,W,H)=>{ '@later'; if(f==='E'){ if(v<1.5||v>H-1.5||u<1.5||u>W-1.5)return PAL.amberD; if(v>3&&v<H-3&&u>3&&u<W-3){ if(u<4||u>W-4||v<4||v>H-4)return shd(PAL.amber,0.78); if(Math.abs(u-W/2)<1&&Math.abs(v-7)<1.5)return PAL.goldL; return shd(PAL.amber,1.05+0.05*hh(Math.floor(u/6),Math.floor(v),3)); } } return Wa(f,u,v,W,H); });
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
    for(const [a,b,y] of panels) box(a,y,0.05,b,y+0.06,2.1,(f,u,v,W,H,x,yy,z)=>{ '@later'; const top=2.1-0.18*Math.sqrt(Math.max(0,1-((x-(a+b)/2)/((b-a)/2))**2)); if(z>2.1-0.18+ (0.18-(2.1-top)) && z>top)return -1;
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
    const tiles=(f,u,v,W,H,x,y,z)=>{ '@later'; if(f==='T'){ const cr=Math.floor(x*3), t=y*2+(cr%2)*0.5, fx=x*3-cr, ft=t-Math.floor(t); if(fx<0.14||ft<0.1)return TILED; return shd(hh(cr,Math.floor(t),19)<0.15?TILEL:TILE,0.9+0.14*hh(cr,Math.floor(t),23)); }
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
const OCTB=LBLD[1];
const OCTR={b:OCTB,lv:SQLV.octo,x0:OCTB.x0+T,y0:OCTB.y0+T,x1:OCTB.x1-T,y1:OCTB.y1-T,H:STORY-8,cx:OCTB.x0+5.5,cy:OCTB.y1-2.6,in:[OCTB.x0-T,OCTB.y0-T,OCTB.x1+T,OCTB.y1+T]};
const OCC={wallD:[24,27,35],wall:[31,35,45],wallL:[39,44,56],skirt:[12,13,16],skirtL:[26,28,33],band:[18,20,25],floor:[[22,23,27],[28,29,34],[34,35,41],[41,42,48]],fleck:[58,60,66],
  wood:[78,48,30],woodD:[48,30,20],woodL:[104,68,42],brass:[204,164,84],brassD:[132,100,46],ink:[46,34,20],rim:[18,19,22],post:[26,28,30]};
function octoWall(q,nx,ny,X,Y,z,f){ '@later'; const c=OCC, u=nx?Y:X;
  if(z<0)return sh(c.skirt,f); if(z<7)return sh(z>=6?c.skirtL:c.skirt,f); if(z>=OCTR.H-3)return sh(c.band,f);
  const n=(cvNoise(u/2.2,z/40,401)*3+cvNoise(u*1.4,z/14,403)*2+cvNoise(u*4,z/5,405))/6+(hash(Math.floor(u*24),Math.floor(z),407)-.5)*.06;
  return sh(n<.42?c.wallD:n<.6?c.wall:c.wallL,f); }
function octoFloorCol(x,y){ const c=OCC, n=(cvNoise(x/4,y/4,411)*3+cvNoise(x*1.2,y*1.2,413)*2+cvNoise(x*3.5,y*3.5,415))/6+(hash(Math.floor(x*24),Math.floor(y*24),417)-.5)*.07;
  if(hash(Math.floor(x*24),Math.floor(y*24),419)>.993)return c.fleck; return c.floor[n<.38?0:n<.5?1:n<.62?2:3]; }
const OCTK={LX:4.4,LY:1.6,Z0:30,ZT:86};
function octoTank(x,y){ '@later'; SHARED.PNAME='octopus tank'; const {LX,LY,Z0,ZT}=OCTK, x1=x+LX, y1=y+LY, c=OCC;
  const plaque=(X,zr)=>{ const u=Math.floor((X-x-LX/2+.6)*24), v=Math.floor(Z0-6-zr); if(u<0||u>28||v<0||v>13)return null;
    if(u===0||u===28||v===0||v===13)return c.brassD; if(u===1||v===1)return sh(c.brass,1.15);
    return v===4&&u>4&&u<24&&hash(u,4,421)>.15||(v===8||v===10)&&u>3&&u<25&&hash(u,v,423)>.35?c.ink:c.brass; };
  const cab=sided({x0:x,y0:y,x1,y1,z0:0,z1:Z0,c:c.wood,top:()=>c.woodL,
    fs:(nx,ny,X,Y,zr,k)=>{ if(ny>0){ const f=plaque(X,zr); if(f)return sh(f,k*1.15); }
      const a=nx?Y-y:X-x; let col;
      if(zr<3)col=c.woodD; else if(zr>=Z0-2)col=c.woodL; else col=sh(c.wood,.92+.16*cvNoise(a*1.5,zr/3,425));
      return sh(col,k*1.2); }});
  const e=.035, fr=(x0,y0,xb,yb,z0,z1,col)=>({x0,y0,x1:xb,y1:yb,z0,z1,c:col,foot:0});
  const frame=[fr(x,y,x+e,y+e,Z0,ZT,c.post),fr(x1-e,y,x1,y+e,Z0,ZT,c.post),fr(x,y1-e,x+e,y1,Z0,ZT,c.post),fr(x1-e,y1-e,x1,y1,Z0,ZT,c.post),
    fr(x,y,x1,y+e,ZT-1.6,ZT,c.rim),fr(x,y1-e,x1,y1,ZT-1.6,ZT,c.rim),fr(x,y,x+e,y1,ZT-1.6,ZT,c.rim),fr(x1-e,y,x1,y1,ZT-1.6,ZT,c.rim),fr(x,y,x1,y1,Z0,Z0+1,c.rim)];
  const p=prop([cab,...frame],null,{lifeK:1,lifeFast:true});
  p.octo={x,y,LX,LY,Z0,ZT,HT:(ZT-Z0)/DEEPW.ZPX}; return p; }

STOREK.octo={OCTK,OCC,octoWall,octoFloorCol,octoTank};
}
