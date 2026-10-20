const barKit=onBar=>{
const FP=24, H=2, S=FP*H;
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
function exitSign(x,y){ PNAME='exit sign'; const w=.62, h=8;
    const p=prop([fb(x,y,x+.1,y+w,0,h,[214,206,186],(s,a,row,L)=>{ if(s!=='px')return [190,180,160]; const A=(a-6)>>1, R=(row-3)>>1; if(row<1||row>=2*h-1||a<1||a>=L-1)return [150,140,120]; return A>=0&&R>=0&&R<5&&'EXIT'.split('').some((ch,i)=>{ const q=A-i*4; return q>=0&&q<3&&F3[ch][R*3+q]==='1'; })?lit([240,80,60]):[226,220,200]; },[200,190,170],{foot:1,em:1})],null,{hang:0,walk:true,high:true});
    LAMPS.push({own:1,room:1,x:x+.3,y:y+w/2,z:h/2,r:1.2,c:[1,.4,.3],prop:p}); return p; }
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
function cupboard(x,y){ PNAME='cupboard'; const D=.62, L=.92, Z=34, bs=[];
    bs.push(fb(x,y,x+D,y+L,0,Z,DP.black,(s,a,row,Lf,h)=>row<2?DP.blackL:s==='px'&&(Math.abs(a-Lf/2)<1||row>h-4)?[16,16,18]:s==='px'&&row>20&&row<26&&Math.abs(a-Lf/2)<5&&Math.abs(a-Lf/2)>2?DP.chromeL:DP.black,(X,Y)=>edge(X,Y,x,y,x+D,y+L)<.03?DP.blackL:[40,42,46],{foot:1}));
    bs.push(...round(x+.3,y+.3,Z,Z+9,.09,(dx,dy,z,top)=>top?[214,200,170]:Math.atan2(dy,dx)>1.5?[220,226,224]:[180,190,188],1,.04));
    for(let i=0;i<5;i++){ const a=x+.26+(i%3)*.04, b=y+.26+(i>>1)*.04; bs.push(pb(a,b,a+.015,b+.015,Z+9,Z+15,[[240,240,240],[220,60,60],[60,140,220]][i%3],{nb:1})); }
    bs.push(pb(x+.28,y+.6,x+.38,y+.7,Z,Z+7,[200,40,40],{nb:1,top:()=>[120,20,20]}));
    return prop(bs); }
const up=(p,dz)=>{ p.boxes=p.boxes.map(b=>zShift(b,dz)); for(const l of LAMPS)if(l.prop===p)l.z+=dz; p.hang=(p.hang||0)+dz; return p; };
return {FP,H,S,art,F3,txt,pcVn,pcLathe,lit,tone,box,disc,DP,T3,fb,pb,edge,pic,round,BZ,BT,BD,BO,PL,panel,topCol,glassesRow,barStraight,barRound,barCorner,BOTS,leather,sofa,armchair,rug,LEAF,leavesArt,plant,exitSign,blinds,POSTERS,poster,cupboard,up}; };
