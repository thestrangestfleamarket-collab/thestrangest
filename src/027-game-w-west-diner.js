{ const FP=24, H=2, S=FP*H;
  const art=(W,Hh,draw)=>{ const a=new Array(W*Hh).fill(null); draw((x,y,c)=>{ x=Math.floor(x); y=Math.floor(y); if(c&&x>=0&&y>=0&&x<W&&y<Hh)a[y*W+x]=c; }); return (x,y)=>x>=0&&y>=0&&x<W&&y<Hh?a[y*W+x]:null; };
  const F3={A:'010101111101101',B:'110101110101110',C:'111100100100111',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'111100101101111',H:'101101111101101',I:'111010010010111',J:'001001001101111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'111101101101111',P:'111101111100100',Q:'111101101111001',R:'111101110101101',S:'111100111001111',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001111001111',4:'101101111001001',5:'111100111001111',6:'111100111101111',7:'111001001001001',8:'111101111101111',9:'111101111001111','-':'000000111000000','.':'000000000000010','&':'010101010101011',"'":'010010000000000','!':'010010010000010','$':'111110111011111'};
  const txt=(put,s,x0,y0,c,k=2)=>{ [...s].forEach((ch,i)=>{ const g=F3[ch]; if(!g)return; for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(g[r*3+q]==='1')for(let a=0;a<k;a++)for(let b=0;b<k;b++)put(x0+(i*4+q)*k+a,y0+r*k+b,c); }); };
  const pcVn=(x,y,s=0)=>{ const i=Math.floor(x), j=Math.floor(y), fx=x-i, fy=y-j, u=fx*fx*(3-2*fx), v=fy*fy*(3-2*fy); const a=hash(i,j,s), b=hash(i+1,j,s), c=hash(i,j+1,s), d=hash(i+1,j+1,s); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
  function pcLathe(cx,cy,z0,z1,rf,col,dz=2,dw=.04,alt=false){ const out=[]; let si=0;
    for(let z=z0;z<z1-1e-9;z+=dz,si++){ const za=z, zb=Math.min(z1,z+dz), r=rf((za+zb)/2-z0); if(!(r>.004))continue; const n=Math.max(1,Math.round(2*r/dw)), w=2*r/n, sw=alt&&(si&1);
      for(let i=0;i<n;i++){ const xa=-r+i*w, xm=xa+w/2, hy=Math.sqrt(Math.max(0,r*r-xm*xm)); if(hy<w*.3)continue;
        const b=sw?{x0:cx-hy,y0:cy+xa,x1:cx+hy,y1:cy+xa+w}:{x0:cx+xa,y0:cy-hy,x1:cx+xa+w,y1:cy+hy};
        out.push(sided({...b,z0:za,z1:zb,c:[90,90,90],foot:0,nb:1,fs:(nx,ny,X,Y,zr)=>col(X-cx,Y-cy,za+zr-z0,0),top:(X,Y)=>col(X-cx,Y-cy,zb-z0,1)})); } }
    return out; }
  const lit=c=>Object.assign([...c],{e:1});
  const tone=(c,k)=>!c?null:c.e||k===1?c:[Math.round(c[0]*k),Math.round(c[1]*k),Math.round(c[2]*k)];
  const box=(put,x0,y0,x1,y1,c)=>{ for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)put(x,y,c); };
  const disc=(put,cx,cy,rx,ry,c,ring)=>{ for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){ const d=((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2; if(d<=1&&(!ring||d>ring))put(x,y,c); } };
  const DP={red:[176,46,38],redL:[214,86,70],redH:[240,136,116],redD:[120,28,24],redK:[72,16,12],
    bar:[128,32,28],barL:[176,58,46],barD:[86,20,16],barTop:[112,46,38],barTopL:[164,86,70],plinth:[136,74,56],plinthD:[96,50,38],
    wood:[124,80,50],woodL:[160,110,70],woodD:[84,54,32],woodK:[50,32,18],
    chrome:[156,166,162],chromeL:[226,232,230],chromeD:[74,84,82],pole:[54,70,60],poleL:[110,130,118],
    steel:[176,184,184],steelL:[226,232,232],steelD:[104,112,112],black:[30,32,34],blackL:[64,68,72],
    white:[226,228,222],whiteD:[176,180,174],cream:[214,204,170],
    rug:[148,34,30],rugD:[110,24,22],rugL:[170,50,42],
    pot:[172,114,82],potD:[132,82,58],potL:[204,144,108],soil:[48,34,24],
    ink:[30,24,22],gold:[220,180,90]};
  const T3=(put,s,x,y,c,k=1)=>txt(put,s,x,y,c,k);
  const fb=(x0,y0,x1,y1,z0,z1,c,f,top,o)=>sided({x0,y0,x1,y1,z0,z1,c,foot:0,...o,top:typeof top==='function'?top:()=>top||c,
    fs:(nx,ny,X,Y,z,k)=>{ const h=z1-z0, side=nx>0?'px':nx<0?'nx':ny>0?'py':'ny', a=nx>0?(y1-Y)*S:nx<0?(Y-y0)*S:ny>0?(X-x0)*S:(x1-X)*S;
      return tone(f(side,Math.floor(a),Math.floor((h-z)*H),Math.round((nx?y1-y0:x1-x0)*S),Math.round(h*H)),k); }});
  const pb=(x0,y0,x1,y1,z0,z1,c,o)=>({x0,y0,x1,y1,z0,z1,c,foot:0,...o});
  const edge=(X,Y,x0,y0,x1,y1)=>Math.min(X-x0,x1-X,Y-y0,y1-Y);
  const pic=(w,h,draw)=>art(w,h,draw);
  const round=(cx,cy,z0,z1,r,col,dz=2,dw=.04)=>pcLathe(cx,cy,z0,z1,typeof r==='function'?r:()=>r,col,dz,dw);
  const DZ=(()=>{ const b=LBLD.find(b=>b.id==='ldiner'); return b?b.h-4-126:0; })();

  const BZ=25, BT=3, BD=.92, BO=.12, PL=.22;
  const panel=(row,h,a)=>{ const z=(h-row)/H; if(z>BZ-5)return z>BZ-1?DP.barD:z>BZ-4.5?(a%40<1?DP.bar:DP.barL):DP.barD; if(z<1)return DP.redK; return (a%32<2)?DP.barD:(a%32<4)?DP.bar:hash(a>>2,row>>3,71)<.04?DP.barL:DP.bar; };
  const topCol=(e,X,Y)=>e<.03?DP.barTopL:e<.05?DP.barTop:hash(Math.floor(X*S),Math.floor(Y*S),72)<.02?DP.barTopL:pcVn(X*6,Y*6,73)<.3?sh(DP.barTop,.9):DP.barTop;
  const glassesRow=(x0,x1,y,z,bs)=>{ for(let x=x0;x<x1-.08;x+=.13+hash(Math.floor(x*40),3,74)*.05){ const t=hash(Math.floor(x*50),5,75); bs.push(pb(x,y,x+.07,y+.07,z,z+(t<.5?6:8),t<.3?[200,226,230]:t<.6?[176,204,196]:[226,214,170],{nb:1,top:()=>[236,244,244]})); } };
  function onBar(k,x,x1,y0,y1,bs){ const z=BZ+BT, m=(x+x1)/2, yc=(y0+y1)/2+.1;
    if(k===0){ bs.push(fb(m-.5,yc-.04,m-.5+.22,yc+.04,z,z+9,[240,200,60],(s,a,row)=>row<2?[60,60,60]:((a+row)>>2)&1?[240,200,60]:[220,70,50],[60,60,60]),
        fb(m-.15,yc-.08,m+.08,yc+.08,z,z+7,DP.red,(s,a,row)=>row<1?DP.redD:(s==='py'||s==='ny')&&row>3&&row<10?DP.white:DP.red,DP.white),
        pb(m+.2,yc-.06,m+.42,yc+.06,z,z+2,DP.chromeD),pb(m+.22,yc-.04,m+.27,yc+.01,z+2,z+8,[180,40,30],{nb:1}),pb(m+.3,yc-.04,m+.35,yc+.01,z+2,z+8,[220,180,60],{nb:1}),pb(m+.36,yc-.02,m+.41,yc+.03,z+2,z+7,[60,40,30],{nb:1}));
      bs.push(fb(m+.5,y0+.18,m+.85,y0+.5,z,z+.5,[40,40,40],(s,a,row)=>[40,40,40],(X,Y)=>((Math.floor(X*S/3)+Math.floor(Y*S/3))&1)?[34,34,34]:[70,70,70])); }
    if(k===1){ bs.push(fb(m-.3,yc-.04,m-.22,yc+.04,z,z+6,[200,40,40],(s,a,row)=>row<1?DP.chromeL:row>4&&row<8?DP.white:[200,40,40],DP.chrome,{nb:1}),
        pb(m-.18,yc-.04,m-.1,yc+.04,z,z+6,[160,40,44],{nb:1,top:()=>DP.chromeL}),fb(m-.05,yc-.12,m+.22,yc+.1,z,z+1.5,DP.white,()=>DP.whiteD,(X,Y)=>hash(Math.floor(X*S),Math.floor(Y*S),76)<.2?DP.whiteD:DP.white),
        pb(m+.42,yc,m+.5,yc+.08,z,z+5,[210,226,214],{nb:1,top:()=>[200,170,90]})); }
    if(k===2){ bs.push(pb(m+.2,yc-.02,m+.28,yc+.06,z,z+5,[210,226,214],{nb:1,top:()=>[236,240,236]}),pb(m+.12,yc-.08,m+.36,yc+.12,z,z+.5,[230,226,212])); } }
  function barStraight(x,y,L,k){ PNAME='bar counter'; const y1=y+BD, bs=[];
    bs.push(fb(x,y1-BO-.12,x+L,y1-BO,0,BZ,DP.bar,(s,a,row,Lf,h)=>s==='py'?panel(row,h,a):DP.woodD,DP.barD,{foot:1}));
    bs.push(fb(x,y1-BO,x+L,y1-BO+PL,0,5,DP.plinth,(s,a,row)=>row<1?sh(DP.plinth,1.15):row>8?DP.plinthD:DP.plinth,(X,Y)=>edge(X,Y,x,y1-BO,x+L,y1-BO+PL)<.02?sh(DP.plinth,1.2):DP.plinth,{foot:1}));
    bs.push(fb(x,y,x+L,y1,BZ,BZ+BT,DP.barTop,(s,a,row)=>row<1?DP.barTopL:row>4?DP.barD:DP.barTop,(X,Y)=>topCol(Math.min(y1-Y,Y-y),X,Y)));
    for(const z of [1,13])bs.push(fb(x+.02,y+.12,x+L-.02,y1-BO-.12,z,z+1.5,DP.woodD,()=>DP.woodK,DP.wood,{foot:z===1?1:0}));
    bs.push(fb(x,y+.12,x+.05,y1-BO-.12,0,BZ,DP.woodD,()=>DP.woodD,DP.woodD,{foot:1}),fb(x+L-.05,y+.12,x+L,y1-BO-.12,0,BZ,DP.woodD,()=>DP.woodD,DP.woodD,{foot:1}));
    glassesRow(x+.1,x+L-.05,y+.2,2.5,bs); glassesRow(x+.12,x+L-.05,y+.25,14.5,bs);
    if(k!=null)onBar(k,x,x+L,y,y1,bs);
    return prop(bs,null,{solids:[{x0:x,y0:y+.1,x1:x+L,y1:y1-BO+PL}]}); }
  function barRound(x,y){ PNAME='bar counter'; const R=1.12, cx=x+R, cy=y, bs=[], dw=.04;
    for(let X=x;X<cx-1e-6;X+=dw){ const m=X+dw/2-cx, hy=r=>Math.sqrt(Math.max(0,r*r-m*m)), ri=R-BD;
      const ang=Math.atan2(hy(R),-m), a=Math.floor(ang*R*S);
      bs.push(fb(X,cy+hy(ri+.12),X+dw,cy+hy(R-BO),0,BZ,DP.bar,(s,aa,row,Lf,h)=>s==='ny'||s==='nx'&&m>-ri?DP.woodD:panel(row,h,a),DP.barD,{foot:1,nb:1}));
      bs.push(fb(X,cy+hy(R-BO),X+dw,cy+hy(R-BO+PL),0,5,DP.plinth,(s,aa,row)=>row<1?sh(DP.plinth,1.15):row>8?DP.plinthD:DP.plinth,sh(DP.plinth,1.1),{foot:1,nb:1}));
      bs.push(fb(X,cy+hy(ri),X+dw,cy+hy(R),BZ,BZ+BT,DP.barTop,(s,aa,row)=>row<1?DP.barTopL:row>4?DP.barD:DP.barTop,(XX,YY)=>topCol(Math.min(Math.abs(Math.hypot(XX-cx,YY-cy)-R),Math.abs(Math.hypot(XX-cx,YY-cy)-ri)),XX,YY),{nb:1})); }
    bs.push(fb(x,cy-.02,x+BD,cy,0,BZ,DP.woodD,()=>DP.woodD,DP.woodD,{foot:1}));
    return prop(bs,null,{solids:[{x0:x,y0:cy,x1:cx,y1:cy+R-BO+PL}]}); }
  function barCorner(x,y,len){ PNAME='bar counter'; const x1=x+BD, y1=y+len, rc=.42, bs=[];
    const inR=(X,Y,o)=>{ const ox=x1-rc, oy=y1-rc; return X<=ox||Y<=oy||Math.hypot(X-ox,Y-oy)<=rc-o; };
    for(let Y=y;Y<y1-1e-6;Y+=.04){ const ym=Y+.02, cut=ym>y1-rc?(x1-rc)+Math.sqrt(Math.max(0,rc*rc-(ym-(y1-rc))**2)):x1;
      bs.push(fb(x+.12,Y,cut-BO,Y+.04,0,BZ,DP.bar,(s,a,row,Lf,h)=>s==='px'?panel(row,h,Math.floor((y1-Y)*S)):DP.woodD,DP.barD,{foot:1,nb:1}));
      bs.push(fb(cut-BO,Y,cut-BO+PL,Y+.04,0,5,DP.plinth,(s,a,row)=>row<1?sh(DP.plinth,1.15):row>8?DP.plinthD:DP.plinth,sh(DP.plinth,1.1),{foot:1,nb:1}));
      bs.push(fb(x,Y,cut,Y+.04,BZ,BZ+BT,DP.barTop,(s,a,row)=>row<1?DP.barTopL:row>4?DP.barD:DP.barTop,(X,YY)=>topCol(Math.min(X-x,cut-X,y1-YY+(YY>y1-.05?0:1)),X,YY),{nb:1})); }
    for(let X=x+.12;X<x1-BO-rc;X+=.04)bs.push(fb(X,y1-BO-.12,X+.04,y1-BO,0,BZ,DP.bar,(s,a,row,Lf,h)=>s==='py'?panel(row,h,Math.floor((X-x)*S)):DP.woodD,DP.barD,{foot:1,nb:1}),
      fb(X,y1-BO,X+.04,y1-BO+PL,0,5,DP.plinth,(s,a,row)=>row<1?sh(DP.plinth,1.15):row>8?DP.plinthD:DP.plinth,sh(DP.plinth,1.1),{foot:1,nb:1}));
    const z=BZ+BT, tx=x+.18, ty=y+.25;
    bs.push(fb(tx,ty,tx+.48,ty+.42,z,z+11,DP.cream,(s,a,row,L)=>row<1?sh(DP.cream,1.08):s==='px'&&row>4&&row<12&&a>L*.15&&a<L*.45?lit([90,230,120]):s==='px'&&row>13&&row<20&&a>L*.5&&a<L*.85?((a>>1)&1?[150,140,120]:DP.cream):row>19?sh(DP.cream,.85):DP.cream,
      (X,Y)=>(Math.floor((X-tx)*S/3)&1)&&Y-ty>.1&&Y-ty<.3?[190,180,150]:sh(DP.cream,1.05)));
    bs.push(pb(x+.3,y1-.55,x+.37,y1-.48,z,z+5,[210,226,214],{nb:1,top:()=>[220,200,120]}));
    glassesRow(x+.2,x+.6,y+1.2,2.5,bs);
    return prop(bs,null,{solids:[{x0:x,y0:y,x1:x1-BO+PL,y1:y1-BO+PL}]}); }

  const BOTS=[[[150,90,30],[200,140,60]],[[40,110,50],[90,170,90]],[[200,214,206],[240,248,244]],[[150,30,30],[210,70,60]],[[90,60,30],[150,110,60]],[[220,180,60],[250,226,120]],[[40,60,120],[90,120,200]]];
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

  function airCooler(x,y){ PNAME='air cooler'; const w=.5, Z=30, G=[150,156,154];
    return prop([fb(x,y,x+w,y+w,0,Z,G,(s,a,row,L,h)=>row<2?sh(G,1.1):row>h-4?sh(G,.7):row>8&&row<h-8&&a>3&&a<L-3?((row>>1)&1?sh(G,.62):sh(G,1.05)):G,
      (X,Y)=>edge(X,Y,x,y,x+w,y+w)<.05?sh(G,1.1):(Math.floor((X-x)*S/2)&1)?sh(G,.6):G,{foot:1})]); }

  const leather=(c,u,v,s)=>{ const n=pcVn(u,v,s); return n>.78?DP.redH:n>.62?DP.redL:n<.18?DP.redD:c; };
  function sofa(x,y){ PNAME='sofa'; const D=.92, L=2.2, x1=x+D, y1=y+L, bs=[], R=DP.red;
    const lf=(seed)=>(s,a,row,Lf,h)=>row<2?DP.redL:row>h-3?DP.redK:leather(R,a/9,row/9,seed);
    bs.push(fb(x+.08,y+.22,x1,y1-.22,0,6,DP.redD,(s,a,row)=>row<1?DP.red:DP.redK,DP.redD,{foot:1}));
    for(const [a,b] of [[y+.24,y+L/2],[y+L/2,y1-.24]])bs.push(fb(x+.3,a+.01,x1-.02,b-.01,6,14,R,lf(81),(X,Y)=>{ const e=edge(X,Y,x+.3,a,x1-.02,b); return e<.04?DP.redL:leather(R,X*9,Y*9,82); }));
    bs.push(fb(x,y+.22,x+.32,y1-.22,0,27,R,(s,a,row,Lf,h)=>{ if(row<2)return DP.redH; if(row<6)return DP.redL; if(row<8)return DP.redD;
        if(row<h-14&&(a%16===8&&row%16===12))return DP.redK; if(row<h-14&&((a+8)%16<1||((a%16)-8)**2+((row%16)-12)**2<5&&(a%16)!==8))return DP.redD; return row>h-4?DP.redK:leather(R,a/7,row/7,83); },
      (X,Y)=>(X-x)>.24||(X-x)<.06?DP.redL:DP.redH,{foot:1}));
    for(const [a,b] of [[y,y+.24],[y1-.24,y1]])bs.push(fb(x,a,x1,b,0,20,R,(s,a2,row,Lf,h)=>row<3?DP.redL:row<5?DP.redH:(s==='px'&&Math.hypot(a2-Lf/2,row-11)<8)?(Math.hypot(a2-Lf/2,row-11)<6?DP.redL:DP.redD):row>h-3?DP.redK:leather(R,a2/9,row/9,86),
      (X,Y)=>Math.abs(Y-(a+b)/2)<.05?DP.redH:DP.redL,{foot:1}));
    return prop(bs); }
  function armchair(x,y){ PNAME='armchair'; const R0=.47, Ri=.3, cx=x+.47, cy=y+.475, bs=[], C=DP.red;
    const fs=(X0,Y0)=>(s,a,row,Lf,h)=>{ const nx=s==='px'?1:s==='nx'?-1:0, ny=s==='py'?1:s==='ny'?-1:0, inner=(X0-cx)*nx+(Y0-cy)*ny<0, ang=Math.floor((Math.atan2(Y0-cy,X0-cx)+3.2)*R0*S);
      if(row<2)return DP.redH; if(row<4)return DP.redL; if(row>h-3)return DP.redK; if(inner)return ang%9<2?DP.redD:ang%9<4?DP.redL:C; return leather(C,ang/8,row/8,94); };
    for(let Y=cy-R0;Y<cy+R0-1e-6;Y+=.04){ const m=Y+.02-cy, ox=Math.sqrt(Math.max(0,R0*R0-m*m)), ix=Math.abs(m)<Ri?Math.sqrt(Ri*Ri-m*m):null, xf=Math.min(cx+ox,cx+.42);
      const segs=ix!=null?[[cx-ox,cx-ix]]:[[cx-ox,cx-ox*.3],[cx-ox*.3,cx+ox*.3],[cx+ox*.3,xf]];
      for(const [a,b] of segs){ if(b-a<.01)continue; const xm=(a+b)/2-cx, h=Math.round(19+10*Math.max(0,-xm/R0));
        bs.push(fb(a,Y,b,Y+.04,0,h,C,fs((a+b)/2,Y+.02),(X,YY)=>DP.redL,{foot:1,nb:1})); } }
    bs.push(fb(cx-.3,cy-Ri+.02,cx+.42,cy+Ri-.02,0,13,C,(s,a,row,L,h)=>row<2?DP.redL:row>h-12?DP.redD:leather(C,a/8,row/8,95),(X,Y)=>{ const e=edge(X,Y,cx-.3,cy-Ri+.02,cx+.42,cy+Ri-.02); return e<.04?DP.redL:leather(C,X*9,Y*9,96); },{foot:1}));
    return prop(bs); }
  function table(x,y,k){ PNAME='round table'; const bs=[];
    bs.push(...round(x,y,0,2,.3,(dx,dy,z,top)=>top?DP.blackL:DP.black,1,.04));
    bs.push(pb(x-.05,y-.05,x+.05,y+.05,2,19,DP.black,{nb:1,fj:()=>DP.blackL}));
    bs.push(...round(x,y,19,22,.46,(dx,dy,z,top)=>{ const r=Math.hypot(dx,dy); if(top)return r>.42?DP.woodL:pcVn(dx*12,dy*12,91)<.3?DP.woodD:DP.wood; return z>2?DP.woodL:DP.woodD; },1,.04));
    if(k)bs.push(pb(x+.08,y-.12,x+.16,y-.04,22,27,[200,224,214],{nb:1,top:()=>[200,170,90]}),pb(x-.18,y+.06,x-.04,y+.2,22,23,DP.white,{top:(X,Y)=>Math.hypot(X-(x-.11),Y-(y+.13))<.03?DP.ink:DP.white}));
    return prop(bs); }
  function rug(x,y,L,W){ PNAME='rug'; const x1=x+L, y1=y+W;
    return prop([pb(x,y,x1,y1,0,.5,DP.rug,{foot:1,top:(X,Y)=>{ const e=edge(X,Y,x,y,x1,y1); if(e<.03)return DP.rugD; if(e<.14&&e>.1)return DP.rugD; const n=hash(Math.floor(X*48),Math.floor(Y*48),92); return n<.12?DP.rugD:n>.94?DP.rugL:pcVn(X*4,Y*4,93)<.25?sh(DP.rug,.92):DP.rug; },fi:()=>DP.rugD,fj:()=>DP.rugD})],null,{walk:true,flat:true}); }

  const LEAF=[[24,60,34],[36,84,44],[56,110,56],[86,140,70],[20,44,28]];
  function leavesArt(Wp,Hp,seed,n,len,droop,z0f){ return pic(Wp,Hp,put=>{ const cx=Wp/2;
    for(let i=0;i<n;i++){ const s=hash(i,seed,94)*2-1, side=Math.sign(s)||1, el=.25+hash(i,seed,95)*1.15, L=len*(.55+.45*hash(i,seed,96)), base=Hp*(z0f+(1-z0f)*hash(i,seed,97)*.25);
      for(let t=0;t<1;t+=.004){ const d=side*Math.cos(el)*L*t*(.3+.7*Math.abs(s)), h=Math.sin(el)*L*t-droop*L*t*t*(1.2-el*.4), X=cx+d, Y=base-h, w=Math.max(.6,2.4*(1-t));
        for(let o=-w;o<=w;o+=.5){ const c=LEAF[Math.min(4,Math.floor((1-t*.4)*2+hash(i,seed,98)*2+(o>0?1:0)))]; put(X,Y+o,t>.92&&o>0?LEAF[4]:c); } } } }); }
  function plant(x,y,big){ PNAME=big?'potted palm':'potted plant'; const r=big?.36:.28, ph=big?20:24, Hp=big?220:190, Wp=big?160:110, bs=[];
    bs.push(...round(x,y,0,ph,z=>r*(.78+.22*z/ph)+(z>ph-2?.03:0),(dx,dy,z,top)=>top?(Math.hypot(dx,dy)>r-.02?DP.potL:DP.soil):z>ph-2?DP.potL:Math.atan2(dy,dx)>1.4?DP.potL:z<2?DP.potD:big?DP.pot:[184,176,160],2,.04));
    if(big)bs.push(...round(x,y,0,1.5,r+.08,(dx,dy,z,top)=>top?DP.potL:DP.potD,1.5,.05));
    bs.push(pb(x-.03,y-.03,x+.03,y+.03,ph,ph+(big?30:14),[90,70,40],{nb:1}));
    const A=[0,1,2,3].map(k=>leavesArt(Wp,Hp,k*13+(big?1:7),big?26:20,big?Hp*.55:Hp*.62,big?.55:.25,.12)), Wt=Wp/S, zt=ph+(big?18:4)+Hp/H*.12;
    const pane=(k,alongX)=>{ const L2=Wt/2; return fb(alongX?x-L2:x-.004,alongX?y-.004:y-L2,alongX?x+L2:x+.004,alongX?y+.004:y+L2,zt+Hp/H*.12-Hp/H,zt+Hp/H*.12,LEAF[2],(s,a,row)=>{ const ff=(s==='nx'||s==='ny')?A[k]((Wp-1-a),row):A[k](a,row); return ff||null; },()=>null,{nb:1}); };
    bs.push(pane(0,true),pane(1,false),pane(2,true),pane(3,false));
    bs[bs.length-2].x0+=.01; bs[bs.length-2].x1+=.01; bs[bs.length-1].y0+=.01; bs[bs.length-1].y1+=.01;
    return prop(bs,null,{solids:[{x0:x-r,y0:y-r,x1:x+r,y1:y+r}]}); }

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
  function exitSign(x,y){ PNAME='exit sign'; const w=.62, h=8;
    const p=prop([fb(x,y,x+.1,y+w,0,h,[214,206,186],(s,a,row,L)=>{ if(s!=='px')return [190,180,160]; const A=(a-6)>>1, R=(row-3)>>1; if(row<1||row>=2*h-1||a<1||a>=L-1)return [150,140,120]; return A>=0&&R>=0&&R<5&&'EXIT'.split('').some((ch,i)=>{ const q=A-i*4; return q>=0&&q<3&&F3[ch][R*3+q]==='1'; })?lit([240,80,60]):[226,220,200]; },[200,190,170],{foot:1,em:1})],null,{hang:0,walk:true,high:true});
    LAMPS.push({own:1,room:1,x:x+.3,y:y+w/2,z:h/2,r:1.2,c:[1,.4,.3],prop:p}); return p; }
  function doubleDoors(x,y,stick){ PNAME='double doors'; const L=2.1, Z=76, bs=[];
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
  function woodDoor(x,y){ PNAME='door'; const L=1.3, Z=76;
    const A=pic(Math.round(L*S),Z*H,put=>{ const w=Math.round(L*S), h=Z*H, lw=w/2;
      box(put,0,0,w,h,DP.wood); box(put,0,0,w,3,DP.woodL);
      for(const o of [0,lw]){ box(put,o,0,o+1,h,DP.woodK); for(const [y0,y1] of [[12,70],[82,h-12]]){ box(put,o+6,y0,o+lw-6,y1,DP.woodD); box(put,o+7,y0+1,o+lw-7,y1-1,DP.wood); box(put,o+7,y0+1,o+lw-7,y0+2,DP.woodL); }
        for(let y=4;y<h;y+=9)if(hash(o,y,99)<.5)box(put,o+3+Math.floor(hash(o,y,98)*(lw-8)),y,o+5+Math.floor(hash(o,y,98)*(lw-8)),y+1,DP.woodD); }
      box(put,lw-8,74,lw-4,78,DP.gold); box(put,lw+4,74,lw+8,78,DP.gold); });
    return prop([fb(x,y,x+.06,y+L,0,Z,DP.wood,(s,a,row)=>s==='px'?A(a,row):DP.wood,DP.wood,{foot:1}),
      fb(x-.02,y-.08,x+.09,y,0,Z+3,DP.woodD,()=>DP.woodD,DP.woodL,{foot:1}),fb(x-.02,y+L,x+.09,y+L+.08,0,Z+3,DP.woodD,()=>DP.woodD,DP.woodL,{foot:1}),fb(x-.02,y-.08,x+.09,y+L+.08,Z,Z+3,DP.woodD,(s,a,row)=>row<1?DP.woodL:DP.woodD,DP.woodL)],null,{hang:0,walk:true,high:true}); }
  function blinds(x,y,L,Z){ PNAME='window blinds'; const S2=[132,128,104], S1=[108,104,84];
    return prop([fb(x,y,x+.04,y+L,0,Z,S2,(s,a,row,Lf,h)=>s!=='px'?S1:row<4||row>h-4||a<4||a>Lf-4?DP.woodD:(row%8<2?[40,38,30]:row%8<3?S1:row%8===7?sh(S2,1.15):S2),S1,{foot:1}),
      fb(x,y-.06,x+.08,y,0,Z,DP.woodD,()=>DP.woodD,DP.wood,{foot:1}),fb(x,y+L,x+.08,y+L+.06,0,Z,DP.woodD,()=>DP.woodD,DP.wood,{foot:1}),fb(x,y-.06,x+.1,y+L+.06,-3,0,DP.woodD,(s,a,row)=>row<1?DP.woodL:DP.woodD,DP.woodL),
      fb(x,y-.06,x+.08,y+L+.06,Z,Z+3,DP.woodD,()=>DP.woodD,DP.wood)],null,{hang:0,walk:true,high:true}); }
  const POSTERS={
    'koi night':(put,w,h)=>{ box(put,0,0,w,h,[40,70,140]); disc(put,w/2,h*.42,w*.32,w*.32,[250,210,80]); disc(put,w/2,h*.42,w*.22,w*.22,[40,70,140]);
      for(const [cx,cy,c] of [[w*.35,h*.62,[240,110,50]],[w*.62,h*.7,[244,236,224]]]){ disc(put,cx,cy,7,4,c); box(put,cx+6,cy-2,cx+10,cy+3,c); }
      box(put,3,h-22,w-3,h-3,[250,236,200]); T3(put,'KOI',6,h-20,[40,70,140],1); T3(put,'NIGHT',6,h-12,[200,60,40],1); },
    'ghost sale':(put,w,h)=>{ box(put,0,0,w,h,[24,24,28]); disc(put,w/2,h*.4,w*.28,h*.22,[230,232,236]); box(put,w*.22,h*.4,w*.78,h*.62,[230,232,236]);
      for(let i=0;i<4;i++)disc(put,w*.28+i*w*.15,h*.62,w*.07,w*.07,[24,24,28]); box(put,w*.4,h*.34,w*.44,h*.4,[24,24,28]); box(put,w*.56,h*.34,w*.6,h*.4,[24,24,28]);
      T3(put,'GHOST',5,6,[250,90,90],1); T3(put,'SHOP',5,h-14,[230,232,236],1); },
    'hover taxi':(put,w,h)=>{ box(put,0,0,w,h,[240,150,40]); box(put,4,h*.35,w-4,h*.55,[250,220,60]); box(put,8,h*.27,w-10,h*.37,[60,60,70]); for(let x=8;x<w-8;x+=6)put(x,h*.6,[200,90,30]);
      box(put,6,h*.58,w-6,h*.6,[200,90,30]); T3(put,'HOVER',5,5,[30,30,40],1); T3(put,'TAXI',5,13,[30,30,40],1); T3(put,'30S',w-16,h-10,[255,255,255],1); },
    'moon shrine':(put,w,h)=>{ box(put,0,0,w,h,[120,26,30]); disc(put,w/2,h*.3,w*.3,w*.3,[250,236,200]); disc(put,w/2+5,h*.27,w*.24,w*.26,[120,26,30]);
      box(put,w*.3,h*.55,w*.7,h*.57,[30,20,20]); box(put,w*.36,h*.57,w*.4,h*.8,[30,20,20]); box(put,w*.6,h*.57,w*.64,h*.8,[30,20,20]); box(put,w*.26,h*.52,w*.74,h*.54,[30,20,20]);
      T3(put,'MOON',w/2-8,h-24,[250,236,200],1); T3(put,'SHRINE',w/2-12,h-16,[250,236,200],1); T3(put,'ROOF',w/2-8,h-8,[240,180,90],1); },
    '190 street':(put,w,h)=>{ box(put,0,0,w,h,[236,232,220]); box(put,0,0,w,12,[40,90,170]); T3(put,'190',4,3,[255,255,255],1); box(put,w/2-1,14,w/2+1,h-6,[40,160,80]); box(put,6,h/2,w-6,h/2+2,[220,60,50]);
      for(const [cx,cy] of [[w/2,20],[w/2,h/2+1],[w/2,h-10],[10,h/2+1],[w-10,h/2+1]])disc(put,cx,cy,3,3,[30,30,30],.3); },
    'night painting':(put,w,h)=>{ for(let y=0;y<h;y++)box(put,0,y,w,y+1,[18+y/h*30|0,26+y/h*30|0,60+y/h*20|0]); for(let i=0;i<20;i++)put(hash(i,1,100)*w,hash(i,2,100)*h*.5,[220,220,200]);
      disc(put,w*.7,h*.22,5,5,[240,230,190]); for(let x=0;x<w;x++){ const t=h*.7+Math.sin(x*.15)*4+Math.sin(x*.4)*2; box(put,x,t,x+1,h,[14,20,30]); } } };
  function poster(x,y,name,L,Hh){ PNAME='poster'; const w=Math.round(L*S), h=Hh*H, A=pic(w,h,put=>POSTERS[name](put,w,h));
    return prop([fb(x,y,x+.04,y+L,0,Hh,[40,30,24],(s,a,row,Lf,hh)=>s!=='px'?[40,30,24]:a<2||a>=Lf-2||row<2||row>=hh-2?[40,30,24]:A(a,row)||[200,200,200],[60,46,34],{foot:1})],null,{hang:0,walk:true,high:true}); }
  function tv(x,y){ PNAME='TV'; const L=.86, Z=22;
    const A=pic(Math.round(L*S),Z*H,put=>{ const w=Math.round(L*S), h=Z*H; box(put,0,0,w,h,DP.black); box(put,3,3,w-3,h-3,lit([40,130,60]));
      for(let y=3;y<h-3;y+=6)box(put,3,y,w-3,y+1,lit([50,150,70])); box(put,3,3,w-3,10,lit([30,40,90])); for(let i=0;i<14;i++)box(put,3+hash(i,1,101)*(w-8),5+hash(i,2,101)*4,5+hash(i,1,101)*(w-8),7+hash(i,2,101)*4,lit([220,220,230]));
      for(let i=0;i<6;i++){ const px=6+hash(i,3,101)*(w-12), py=14+hash(i,4,101)*(h-22); box(put,px,py,px+2,py+5,lit(i<3?[220,40,40]:[240,240,240])); }
      box(put,w-14,h-8,w-4,h-4,lit([20,20,30])); });
    const p=prop([fb(x,y,x+.12,y+L,0,Z,DP.black,(s,a,row)=>s==='px'?A(a,row):DP.blackL,DP.blackL,{foot:1,em:1}),pb(x,y+L/2-.08,x+.05,y+L/2+.08,-6,0,DP.blackL)],null,{hang:0,walk:true,high:true});
    LAMPS.push({own:1,room:1,x:x+.9,y:y+L/2,z:Z/2,r:3.5,c:[.55,.8,1],prop:p}); return p; }
  function cupboard(x,y){ PNAME='cupboard'; const D=.62, L=.92, Z=34, bs=[];
    bs.push(fb(x,y,x+D,y+L,0,Z,DP.black,(s,a,row,Lf,h)=>row<2?DP.blackL:s==='px'&&(Math.abs(a-Lf/2)<1||row>h-4)?[16,16,18]:s==='px'&&row>20&&row<26&&Math.abs(a-Lf/2)<5&&Math.abs(a-Lf/2)>2?DP.chromeL:DP.black,(X,Y)=>edge(X,Y,x,y,x+D,y+L)<.03?DP.blackL:[40,42,46],{foot:1}));
    bs.push(...round(x+.3,y+.3,Z,Z+9,.09,(dx,dy,z,top)=>top?[214,200,170]:Math.atan2(dy,dx)>1.5?[220,226,224]:[180,190,188],1,.04));
    for(let i=0;i<5;i++){ const a=x+.26+(i%3)*.04, b=y+.26+(i>>1)*.04; bs.push(pb(a,b,a+.015,b+.015,Z+9,Z+15,[[240,240,240],[220,60,60],[60,140,220]][i%3],{nb:1})); }
    bs.push(pb(x+.28,y+.6,x+.38,y+.7,Z,Z+7,[200,40,40],{nb:1,top:()=>[120,20,20]}));
    return prop(bs); }

  function soffit(x,y,L,W){ PNAME='soffit'; const Z0=106+DZ, Z1=126+DZ, rc=.6, bs=[], x1=x+L, y1=y+W;
    const face=(s,a,row,Lf,h)=>s==='px'||s==='py'?(row<12?(row<1?[200,90,70]:[176,64,46]):row<13?[110,40,30]:row>h-2?[120,84,52]:[176,132,86]):[150,110,70];
    for(let X=x;X<x1-1e-6;X+=.04){ const m=X+.02, yy=m>x1-rc?(y1-rc)+Math.sqrt(Math.max(0,rc*rc-(m-(x1-rc))**2)):y1;
      bs.push(fb(X,y,X+.04,yy,Z0,Z1,[176,64,46],face,(XX,YY)=>edge(XX,YY,x,y,x1,yy)<.06?[150,110,70]:pcVn(XX*3,YY*3,102)<.4?[118,124,104]:[126,132,112],{nb:1,foot:1})); }
    return prop(bs,null,{hang:Z0,walk:true,high:true}); }

  function fan(x,y){ PNAME='ceiling fan'; const Zc=126+DZ, bs=[], R=1.15, Zb=106+DZ;
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

  const up=(p,dz)=>{ p.boxes=p.boxes.map(b=>zShift(b,dz)); for(const l of LAMPS)if(l.prop===p)l.z+=dz; p.hang=(p.hang||0)+dz; return p; };
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
function dinerWall(q,nx,ny,X,Y,z,f){ const u=nx?Y:X, zz=z%STORY, top=q.h-4, b=((u*48)%6+6)%6;
  return sh(zz<4?[50,34,22]:zz<34?(b<1?[62,40,24]:b<2?[118,80,50]:speck([96,64,40],u,zz/24,61)):zz<37?[122,84,52]:zz<38?[60,40,24]:zz>=top-8?(zz<top-7?[60,40,24]:[110,74,46]):speck(dinerVn(u*3,zz/16)<.5?[206,196,160]:[198,188,152],u,zz/24,62),f); }
{ const B=LBLD.find(b=>b.id==='ldiner'); if(B){ B.floorOf=lv=>lv?null:dinerFloorCol; B.inWall=dinerWall; } }
