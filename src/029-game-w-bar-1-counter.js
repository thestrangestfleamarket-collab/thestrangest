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

  const BZ=25, BT=3, BD=.92, BO=.12, PL=.22;
  const panel=(row,h,a)=>{ const z=(h-row)/H; if(z>BZ-5)return z>BZ-1?DP.barD:z>BZ-4.5?(a%40<1?DP.bar:DP.barL):DP.barD; if(z<1)return DP.redK; return (a%32<2)?DP.barD:(a%32<4)?DP.bar:hash(a>>2,row>>3,71)<.04?DP.barL:DP.bar; };
  const topCol=(e,X,Y)=>e<.03?DP.barTopL:e<.05?DP.barTop:hash(Math.floor(X*S),Math.floor(Y*S),72)<.02?DP.barTopL:pcVn(X*6,Y*6,73)<.3?sh(DP.barTop,.9):DP.barTop;
  const glassesRow=(x0,x1,y,z,bs)=>{ for(let x=x0;x<x1-.08;x+=.13+hash(Math.floor(x*40),3,74)*.05){ const t=hash(Math.floor(x*50),5,75); bs.push(pb(x,y,x+.07,y+.07,z,z+(t<.5?6:8),t<.3?[200,226,230]:t<.6?[176,204,196]:[226,214,170],{nb:1,top:()=>[236,244,244]})); } };
  function onBar(k,x,x1,y0,y1,bs){ const z=BZ+BT, m=(x+x1)/2, yc=(y0+y1)/2+.1;
    if(k===0){ bs.push(pb(m-.56,yc-.1,m-.34,yc+.1,z,z+1.5,[40,40,44],{top:(X,Y)=>Math.hypot(X-(m-.45),Y-yc)<.06?[20,20,22]:[40,40,44]}),pb(m-.52,yc-.012,m-.38,yc+.012,z+1.5,z+2.2,[236,230,210],{nb:1,top:(X)=>X>m-.4?[250,150,60]:[236,230,210]}),
        fb(m-.15,yc-.08,m+.08,yc+.08,z,z+7,DP.red,(s,a,row)=>row<1?DP.redD:(s==='py'||s==='ny')&&row>3&&row<10?DP.white:DP.red,DP.white),
        pb(m+.2,yc-.06,m+.42,yc+.06,z,z+2,DP.chromeD),pb(m+.22,yc-.04,m+.27,yc+.01,z+2,z+8,[180,40,30],{nb:1}),pb(m+.3,yc-.04,m+.35,yc+.01,z+2,z+8,[220,180,60],{nb:1}),pb(m+.36,yc-.02,m+.41,yc+.03,z+2,z+7,[60,40,30],{nb:1}));
      bs.push(fb(m+.5,y0+.18,m+.85,y0+.5,z,z+.5,[40,40,40],(s,a,row)=>[40,40,40],(X,Y)=>((Math.floor(X*S/3)+Math.floor(Y*S/3))&1)?[34,34,34]:[70,70,70])); }
    if(k===1){ bs.push(fb(m-.3,yc-.04,m-.22,yc+.04,z,z+8,[118,64,30],(s,a,row)=>row<1?DP.ink:row>5&&row<9?DP.cream:[118,64,30],[92,48,24],{nb:1}),
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
    for(let X=x+.06,i=0;X<x+L-.98;i++){ const t=hash(i,3,78), [c,cl]=BOTS[Math.floor(hash(i,4,78)*BOTS.length)], w=.06+t*.03, h=10+Math.floor(hash(i,5,78)*8), yy=y+.04+hash(i,6,78)*.06, zz=z+3;
      bs.push(fb(X,yy,X+w,yy+w,zz,zz+h,c,(s,a,row,Lf,hh)=>row>hh*.45&&row<hh*.75&&a>0&&a<Lf-1?lt(sh([240,230,200],.75)):a<1?lt(cl):c,c,{nb:1}),
        pb(X+w/2-.012,yy+w/2-.012,X+w/2+.012,yy+w/2+.012,zz+h,zz+h+4+(t<.3?2:0),c,{nb:1,top:()=>t<.5?DP.gold:DP.ink})); X+=w+.03+hash(i,7,78)*.03; }
    bs.push(fb(x+L-.9,y+.25,x+L-.1,y+.55,z,z+.6,[220,220,210],()=>[200,200,190],[226,226,216]));
    for(let i=0;i<6;i++)bs.push(pb(x+L-.86+i*.12,y+.32,x+L-.79+i*.12,y+.4,z+.6,z+5,[196,220,222],{nb:1,top:()=>[230,240,240]}));
    return prop(bs); }

  function stool(x,y){ PNAME='bar stool'; const bs=[];
    bs.push(...round(x,y,0,2,.24,(dx,dy,z,top)=>top?(Math.hypot(dx,dy)>.2?DP.poleL:DP.pole):sh(DP.pole,.8),1,.04));
    bs.push(pb(x-.035,y-.035,x+.035,y+.035,2,9,DP.pole,{nb:1,fi:(Y,z)=>DP.pole,fj:(X,z)=>DP.poleL}));
    bs.push(...round(x,y,5,6,.15,(dx,dy,z,top)=>top?DP.poleL:DP.pole,1,.04).map(b=>Object.assign(b,{top:(X,Y)=>Math.hypot(X-x,Y-y)>.11?DP.poleL:null})));
    bs.push(...round(x,y,9,11,.1,()=>DP.pole,2,.04));
    bs.push(...round(x,y,11,15,z=>.21+(z<1?-.02:z>3?-.02:0),(dx,dy,z,top)=>{ const r=Math.hypot(dx,dy); if(top)return r>.17?DP.redL:r<.05?DP.redH:r<.12&&(dx+dy)<-.03?DP.redL:DP.red; return z<1?DP.redK:z>3?DP.redL:Math.atan2(dy,dx)>1.6?DP.redH:DP.red; },1,.04));
    return prop(bs); }

  function fridge(x,y){ PNAME='drinks fridge'; const D=.78, W=.92, Z=64, x1=x+D, y1=y+W, bs=[], t=.05, F=DP.white;
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

