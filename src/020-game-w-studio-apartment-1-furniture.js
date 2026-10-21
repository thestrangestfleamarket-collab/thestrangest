const STUDIO=(()=>{ const FP=24;
const art=(W,H,draw)=>{ const a=new Array(W*H).fill(null); draw((x,y,c)=>{ x=Math.floor(x); y=Math.floor(y); if(c&&x>=0&&y>=0&&x<W&&y<H)a[y*W+x]=c; }); return (x,y)=>x>=0&&y>=0&&x<W&&y<H?a[y*W+x]:null; };
const AP={oak:[118,86,52],walnut:[88,60,40],pine:[152,122,80],black:[30,30,32],steel:[146,148,146],steelD:[98,100,100],white:[220,218,210],cream:[204,196,176],
  cloth:[88,96,106],clothD:[64,70,78],blanket:[74,92,118],red:[132,50,42],leaf:[72,120,60],leafD:[48,88,44],rug:[124,70,58],rugD:[92,50,42],mat:[76,62,50],
  screen:[24,28,36],paper:[216,206,186],enamel:[226,224,218],enamelD:[164,166,164],chrome:[196,200,204],card:[168,138,96],plastic:[58,60,66],terra:[150,88,60],glow:[214,194,140]};
let FACE=null, ONZ=0;
const FDIR={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]};
const XP=()=>ROT<2, YP=()=>ROT===0||ROT===3;
function rect(cx,cy,f,W,D){ f=FACE||f; const r=[f[1],-f[0]], at=(t,d)=>[cx+(t-.5)*W*r[0]+(.5-d)*D*f[0],cy+(t-.5)*W*r[1]+(.5-d)*D*f[1]];
  const b={cx,cy,f,W,D,at}; Object.assign(b,sub(b,0,1,0,1)); return b; }
function sub(b,t0,t1,d0,d1){ const p=b.at(t0,d0), q=b.at(t1,d1); return {x0:Math.min(p[0],q[0]),x1:Math.max(p[0],q[0]),y0:Math.min(p[1],q[1]),y1:Math.max(p[1],q[1])}; }
function fb(r,t0,t1,d0,d1,z0,z1,c,paint,top,o){ const f=r.f, s=sub(r,t0,t1,d0,d1), w=s.x1-s.x0, d=s.y1-s.y0;
  const sd=(nx,ny)=>nx===f[0]&&ny===f[1]?'f':nx===-f[0]&&ny===-f[1]?'b':nx===-f[1]&&ny===f[0]?'l':'r';
  const col=(side,t,z,len,k)=>{ const q=paint?paint(side,t<0?0:t>.9999?.9999:t,z-z0,len):c; return q&&(q.e?q:sh(q,k)); };
  return {...s,z0,z1,c,fi:(v,z)=>{ const n=XP()?1:-1; return col(sd(n,0),n>0?(v-s.y0)/d:(s.y1-v)/d,z,d,.62); },
    fj:(u,z)=>{ const n=YP()?1:-1; return col(sd(0,n),n>0?(s.x1-u)/w:(u-s.x0)/w,z,w,.8); },
    top:top?(X,Y)=>{ const dx=X-r.cx, dy=Y-r.cy; return top(.5+(dx*f[1]-dy*f[0])/r.W,.5-(dx*f[0]+dy*f[1])/r.D,X,Y); }:()=>paint?paint('t',0,z1-z0,0):c,...o}; }
const worn=(c,t,z,k=1)=>{ const n=hash(Math.floor(t*60),Math.floor(z),k); return z<2.5?sh(c,.82):n<.03?sh(c,.86):n>.985?sh(c,1.07):c; };
const grain=(c,a,z,k=5)=>sh(c,.95+.09*hash(Math.floor(a/2),Math.floor(z/32),k));
const boards=(c,X,Y,n=.3)=>sh(c,((X/n)%1+1)%1<.06||((Y/n)%1+1)%1<.06?.78:.96+.08*hash(Math.floor(X/n),Math.floor(Y/n),9));
const wood=(k,c,t,z,len)=>worn(mt('wood',grain(c,t*len*FP,z,k)),t,z,k);
const metal=(c,t,z,k=3)=>worn(mt('frame',c),t,z,k);

function aptMat(x,y,f=[0,1]){ '@later'; SHARED.PNAME='entrance mat'; const r=rect(x,y,f,1,.66), c=AP.mat;
  return prop([fb(r,0,1,0,1,0,1,c,null,(t,d,X,Y)=>{ const e=Math.min(t,1-t,d*.66,(1-d)*.66), n=hash(Math.floor(X*48),Math.floor(Y*48),3), m=Math.hypot(t-.5,(d-.5)*.66);
    return mt('carpet',e<.05?sh(c,.6):n<.4?sh(c,.9):n>.9?sh(c,1.1):m<.2?sh(c,1.06):c); })],null,{walk:true,flat:true}); }
function wardrobe(x,y,f=[0,1]){ '@later'; SHARED.PNAME='wardrobe'; const r=rect(x,y,f,1.2,.55), H=82, c=AP.oak;
  const P=(s,t,z,len)=>{ const k=wood(7,c,t,z,len); if(z<4)return sh(k,.55); if(z>H-5)return sh(k,.8);
    if(s==='f'){ const m=Math.abs(t-.5)*len*FP; if(m<.5)return sh(k,.4); if(z>34&&z<44&&m>1.2&&m<3)return z<35||z>43?AP.steelD:metal(AP.chrome,t,z);
      if(z>8&&z<H-8&&m>3&&m<len*FP/2-2.5&&(z<9.5||z>H-9.5||m<3.8||m>len*FP/2-3.3))return sh(k,.76); }
    return k; };
  return prop([fb(r,0,1,0,1,0,H,c,P,()=>sh(mt('wood',c),.92))]); }
function wallShelves(x,y,f=[0,1]){ SHARED.PNAME='shelves with boxes'; const r=rect(x,y,f,.9,.32), Z=56, pine=AP.pine, bs=[], wd=k=>sh(mt('wood',pine),k);
  const board=z=>bs.push(fb(r,0,1,0,1,z,z+2,pine,(s,t,zz,len)=>s==='b'?sh(pine,.7):wood(11,pine,t,z+zz,len),(t,d,X,Y)=>boards(mt('wood',pine),X,Y,.5),{foot:1}));
  for(const z of [Z,Z+16,Z+32])board(z); for(const [a,b] of [[0,.04],[.96,1]])bs.push(fb(r,a,b,0,1,Z+2,Z+32,pine,(s,t,z)=>wd(.94),null,{foot:1}));
  const box=(t0,t1,d0,d1,z,h,c)=>bs.push(fb(r,t0,t1,d0,d1,z,z+h,c,(s,t,zz)=>{ const k=worn(mt('crates',c),t,zz,13); return s==='f'&&zz>h*.35&&zz<h*.65?sh(k,.88):s==='t'?k:sh(k,.95); },()=>{ return sh(mt('crates',c),.9); },{foot:1}));
  box(.07,.5,.1,.95,Z+2,11,AP.card); box(.56,.93,.15,.9,Z+2,9,sh(AP.card,.9)); box(.1,.62,.2,.9,Z+18,8,sh(AP.card,1.05));
  bs.push(fb(r,.7,.92,.3,.85,Z+18,Z+21,AP.paper,(s,t,z)=>z%2<1?sh(AP.paper,.8):AP.paper,null,{foot:1}));
  return prop(bs,null,{high:true,walk:true}); }
function vacuum(x,y,f=[0,1]){ '@later'; SHARED.PNAME='vacuum'; const r=rect(x,y,f,.38,.34), bag=AP.red, pl=AP.plastic;
  return prop([fb(r,0,1,0,1,0,7,pl,(s,t,z)=>z<2?sh(pl,.6):worn(pl,t,z,17)),fb(r,.3,.7,.55,.95,7,38,bag,(s,t,z)=>worn(mt('carpet',sh(bag,.9+.1*Math.sin(z*.8))),t,z,19),null,{foot:1}),
    fb(r,.44,.56,.7,.82,38,52,AP.steel,(s,t,z)=>metal(AP.steel,t,z),null,{foot:1}),fb(r,.25,.75,.68,.84,52,55,pl,null,null,{foot:1}),
    fb(r,.12,.22,.1,.3,7,26,pl,null,null,{foot:1}),fb(r,.12,.3,.3,.6,24,28,pl,null,null,{foot:1})]); }
function tvStand(x,y,f=[0,1]){ '@later'; SHARED.PNAME='TV on a low stand'; const r=rect(x,y,f,1.4,.5), c=AP.walnut, H=14;
  const P=(s,t,z,len)=>{ const k=wood(21,c,t,z,len); if(z<2)return sh(k,.6); if(s==='f'){ const m=Math.abs(t-.5)*len*FP; if(m<.5)return sh(k,.45); if(z>5&&z<8&&m>1.5&&m<3.5)return AP.steelD; } return k; };
  const scr=(s,t,z)=>{ if(s!=='f'||z<2||z>22||t<.05||t>.95)return worn(AP.black,t,z,23); const n=hash(Math.floor(t*40),Math.floor(z/3),25); return n<.1?sh(AP.screen,1.4):sh(AP.screen,.8+.4*t); };
  const p=prop([fb(r,0,1,0,1,0,H,c,P,(t,d,X,Y)=>boards(mt('wood',c),X,Y,.7)),fb(r,.14,.86,.42,.56,H,H+24,AP.black,scr,()=>AP.black,{foot:1}),fb(r,.4,.6,.35,.65,H,H+2,AP.black,null,null,{foot:1})]);
  p.opts=()=>[['watch the news',()=>newsOpen()]]; return p; }
function aptPoster(x,y,f=[0,1]){ '@later'; SHARED.PNAME='poster'; const r=rect(x,y,f,.7,.04), z0=48, H=26, W=Math.round(.7*FP), paper=AP.paper, ink=[44,40,48], red=AP.red;
  const A=art(W,H,put=>{ for(let yy=0;yy<H;yy++)for(let a=0;a<W;a++){ const z=H-1-yy; let c=hash(a,yy,27)<.06?sh(paper,.9):paper;
      if(z>=16&&z<24&&a>2&&a<W-3){ const d=Math.hypot(a-W*.5,(z-20)*1.5); c=d<5?red:d<6.5?ink:c; }
      if(z>=6&&z<13&&a>2&&a<W-3&&(z===7||z===10||z===12)&&hash(a,z,29)>.3)c=ink;
      if(z<4&&a<3&&z<3-a)c=null; if((a===1||a===W-2)&&z===H-2)c=AP.steelD; put(a,yy,c); } });
  return prop([fb(r,0,1,0,1,z0,z0+H,paper,(s,t,z,len)=>s==='f'?A(Math.floor(t*len*FP),Math.floor(H-1-z))||null:sh(paper,.7),null,{foot:1})],null,{high:true,walk:true}); }
function plantShelf(x,y,f=[0,1]){ '@later'; SHARED.PNAME='wall shelf with plant'; const r=rect(x,y,f,.6,.24), Z=62, pine=AP.pine;
  const leaf=(t0,t1,d0,d1,z,h,c)=>fb(r,t0,t1,d0,d1,z,z+h,c,(s,t,zz)=>hash(Math.floor(t*20),Math.floor(zz),31)<.3?sh(c,.8):c,null,{foot:1});
  return prop([fb(r,0,1,0,1,Z,Z+2,pine,(s,t,z,len)=>wood(33,pine,t,z,len),(t,d,X,Y)=>boards(mt('wood',pine),X,Y,.6),{foot:1}),
    fb(r,.1,.16,.4,.9,Z-6,Z,AP.steelD,null,null,{foot:1}),fb(r,.84,.9,.4,.9,Z-6,Z,AP.steelD,null,null,{foot:1}),
    fb(r,.36,.64,.3,.8,Z+2,Z+9,AP.terra,(s,t,z)=>z>6?sh(AP.terra,.8):worn(AP.terra,t,z,35),()=>[52,40,30],{foot:1}),
    leaf(.3,.7,.2,.85,Z+9,5,AP.leaf),leaf(.2,.45,.1,.6,Z+7,6,AP.leafD),leaf(.55,.85,.3,.95,Z+8,4,AP.leafD),leaf(.1,.3,.5,.9,Z+1,6,AP.leaf),leaf(.4,.6,.5,.7,Z+13,4,AP.leaf)],null,{high:true,walk:true}); }
function bookcase(x,y,f=[0,1]){ '@later'; SHARED.PNAME='bookcase'; const r=rect(x,y,f,1.2,.5), H=92, c=AP.oak;
  const face=(s,t,z,len)=>{ if(s!=='f')return wood(43,c,t,z,len); const a=t*len*FP; if(a<2||a>=len*FP-2||z<3||z>=H-3)return grain(c,a,z,37); return (z-3)%22<2?sh(grain(c,a,z,37),.9):sh(c,.5); };
  return prop([fb(r,0,1,0,1,0,3,c,face,()=>sh(mt('wood',c),.9)),fb(r,0,1,.9,1,3,H,c,(s,t,z,len)=>s==='f'?sh(c,.5):wood(43,c,t,z,len),()=>sh(mt('wood',c),.9)),
    fb(r,0,.06,0,.9,3,H,c,(s,t,z,len)=>wood(43,c,t,z,len),()=>sh(mt('wood',c),.9)),fb(r,.94,1,0,.9,3,H,c,(s,t,z,len)=>wood(43,c,t,z,len),()=>sh(mt('wood',c),.9)),
    ...[25,47,69].map(z=>fb(r,.06,.94,0,.9,z-2,z,c,(s,t,zz,len)=>sh(grain(c,t*len*FP,zz,37),.9),()=>sh(mt('wood',c),.95))),fb(r,0,1,0,1,H-3,H,c,(s,t,z,len)=>wood(43,c,t,z,len),()=>sh(mt('wood',c),.9))]); }
