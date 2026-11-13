// THE WEST KITS: the laundry room, the ghost street and the west dojo's hall.
import {SHARED} from './003-shx.js';
import {vwV} from './003b-systems.js';
import {WROW} from './006-map-pre.js';
import {CAT_DEPTS, CAT_INFO, CATALOG, hash, KIND_OF, LAMPS, LBLD, LIFE, LSEED, mt, prop, PROPL, sh, sided, SQB, STORY, T} from './014-gamekit.js';
import {STUDIO} from './020-studio-kit.js';
const LAUB=SQB.lau;
const LAU={b:LAUB,x0:LAUB.x0+T,x1:LAUB.x1-T,y0:LAUB.y0+T,y1:LAUB.y1-T,H:LAUB.h-4,cx:(LAUB.x0+LAUB.x1)/2,cy:(LAUB.y0+LAUB.y1)/2,in:[LAUB.x0-T,LAUB.y0-T,LAUB.x1+T,LAUB.y1+T]};
const LAC={tile:[226,224,216],tileL:[240,239,234],tileD:[204,202,194],joint:[182,174,162],skirt:[118,98,94],
  board:[123,81,70],boardL:[134,92,78],boardD:[104,62,52],seam:[72,46,44],
  frame:[91,62,49],mull:[137,104,80],pane:[253,253,249],blind:[177,154,140],blindD:[150,118,100],valance:[79,53,41],cord:[220,214,200],
  body:[176,168,176],bodyD:[150,140,150],panel:[96,70,78],ring:[142,130,134],drum:[74,58,62],drumL:[138,128,130],steel:[196,200,204],
  cab:[159,150,157],cabL:[174,167,172],cabD:[128,118,128],handle:[88,60,60],
  white:[244,246,246],whiteD:[214,206,200],pink:[226,212,207],pinkD:[194,135,119],
  basket:[210,122,126],basketD:[172,90,96],wash:[248,248,247],
  wick:[163,136,100],wickD:[128,102,75],wickL:[190,166,128],
  dark:[56,49,52],darkL:[76,66,68],darkD:[38,26,28],
  rug:[58,42,54],rugD:[44,30,40],rugL:[139,101,110],rugM:[96,66,80],
  red:[206,62,52],blue:[62,84,178],orange:[224,118,44],olive:[120,128,62],amber:[196,124,48],brown:[134,96,60],yellow:[206,184,70],grey:[150,150,156],
  pot:[230,208,140],stalk:[196,160,110],bloom:[208,68,54]};
const lauLit=c=>Object.assign([...c],{e:1});
const LAUWIN={u0:38,u1:84,z0:30,z1:78};
(()=>{ const {FP,rect,fb,worn,metal}=STUDIO.kit, c=LAC, hi={foot:1};
function washerDryer(x,y,f=[1,0]){ '@later'; SHARED.PNAME='stacked washer and dryer'; const r=rect(x,y,f,.8,.75), B=[];
  const machine=(z0,h,seed)=>{ const PZ=h-7;
    const front=(s,t,z,len)=>{ if(s==='b')return sh(c.bodyD,.9); if(s!=='f')return z<1.5?sh(c.body,.6):worn(c.body,t,z,seed);
      const a=t*len*FP, W=len*FP, m=Math.hypot(a-W/2,(z-PZ/2)*1.05);
      if(z>=PZ){ if(z<PZ+1||z>=h-1)return sh(c.panel,.8); if(z>=PZ+2.5&&z<PZ+4.5){ if(a>=2&&a<4)return lauLit(c.red); if(a>=5&&a<7)return lauLit(c.blue); } return Math.abs(a-W*.78)<1.6&&z>=PZ+2&&z<PZ+5.5?c.ring:c.panel; }
      if(m<6)return null;
      if(m<7.5)return m<6.8?sh(c.ring,1.08):sh(c.ring,.8);
      return z<1.5?sh(c.body,.6):worn(c.body,t,z,seed); };
    B.push(fb(r,0,1,0,1,z0,z0+h,c.body,front,()=>sh(c.body,1.04),z0?hi:undefined));
    B.push(fb(r,.15,.85,.14,.6,z0+2,z0+PZ-1,c.drum,(s,t,z,len)=>{ if(s!=='f')return c.drum; const a=(t-.5)*len*FP, m=Math.hypot(a,(z-(PZ/2-2))*1.05);
      return m<2?c.drumL:m<5?(hash(Math.floor(a),Math.floor(z),seed+1)<.14?c.wash:c.drum):sh(c.drumL,.8); },null,hi)); };
  machine(0,26,1613); machine(26,26,1617); return prop(B); }
function laundryBasket(x,y,f=[1,0]){ '@later'; SHARED.PNAME='laundry basket'; const r=rect(x,y,f,.45,.45), H=22, B=[], w=.11;
  const weave=(s,t,z)=>{ if(z<1.5)return sh(c.basketD,.9); if(z>=H-2)return c.basketD; const a=Math.floor(t*11), b=Math.floor(z/2); return (a+b)&1?c.basket:hash(a,b,1619)<.5?c.basketD:sh(c.basket,.92); };
  B.push(fb(r,0,1,0,1,0,2,c.basketD,null,()=>c.basketD));
  for(const [t0,t1,d0,d1] of [[0,w,0,1],[1-w,1,0,1],[w,1-w,0,w],[w,1-w,1-w,1]])B.push(fb(r,t0,t1,d0,d1,2,H,c.basket,weave,()=>c.basketD,hi));
  B.push(fb(r,w,1-w,w,1-w,2,H+3,c.wash,(s,t,z)=>z<H-4?sh(c.wash,.8):c.wash,(t,d,X,Y)=>{ const n=hash(Math.floor(X*48),Math.floor(Y*48),1621); return n<.15?sh(c.wash,.86):n>.9?c.wash:sh(c.wash,.95); },hi));
  return prop(B); }
function utilitySink(x,y,f=[1,0]){ SHARED.PNAME='utility sink'; const r=rect(x,y,f,1.1,.6), B=[], Z=24, BZ=10, w=.07;
  const cab=(s,t,z,len)=>{ const k=worn(c.white,t,z,1623); if(z<3)return sh(c.whiteD,.8); if(s!=='f')return k; const a=t*len*FP, W=len*FP;
    if(z>=Z-1||(z>=Z-8&&z<Z-7)||(Math.abs(a-W/2)<.6&&z<Z-8)||a<1||a>=W-1)return c.whiteD;
    if(z>=Z-5.5&&z<Z-3.5&&Math.abs(a-W/2)<4)return c.pinkD; if(z>=Z-15&&z<Z-12&&(Math.abs(a-W*.42)<1||Math.abs(a-W*.58)<1))return c.pinkD;
    return k; };
  B.push(fb(r,0,1,0,1,0,Z,c.white,cab,()=>c.whiteD));
  B.push(fb(r,0,1,0,1,Z,Z+3,c.pink,null,(t,d,X,Y)=>hash(Math.floor(X*48),Math.floor(Y*48),1627)<.08?sh(c.pink,.9):c.pink,hi));
  const bas=(s,t,z)=>z>=BZ-1?c.white:z<1?c.whiteD:worn(c.white,t,z,1625);
  for(const [t0,t1,d0,d1] of [[0,w,0,1],[1-w,1,0,1],[w,1-w,0,w*1.3],[w,1-w,1-w*1.3,1]])B.push(fb(r,t0,t1,d0,d1,Z,Z+BZ,c.white,bas,()=>c.white,hi));
  const T0=Z+BZ; B.push(fb(r,.47,.53,.86,.94,T0,T0+11,c.steel,(s,t,z)=>metal(c.steel,t,z),()=>c.steel,hi),fb(r,.48,.52,.62,.9,T0+9,T0+11,c.steel,null,()=>sh(c.steel,1.05),hi),
    fb(r,.48,.52,.6,.64,T0+6,T0+9,c.steel,null,null,hi),fb(r,.42,.58,.88,.92,T0+11,T0+13,c.steel,null,null,hi));
  return prop(B); }
function roundMirror(x,y,f=[1,0]){ '@later'; SHARED.PNAME='round mirror'; const r=rect(x,y,f,.45,.05), Z=36, H=16;
  const face=(s,t,z,len)=>{ const a=(t-.5)*len*FP, m=Math.hypot(a,z-H/2); if(m>7.5)return null; if(s!=='f'||m>6.3)return c.ring; return a+z-H/2<-5?sh(c.body,1.14):hash(Math.floor(a),Math.floor(z),1629)<.04?sh(c.body,1.1):c.body; };
  return prop([fb(r,0,1,0,1,Z,Z+H,c.ring,face,()=>null,hi)],null,{walk:true}); }
function wallPlanter(x,y,f=[1,0]){ '@later'; SHARED.PNAME='wall planter'; const r=rect(x,y,f,.4,.3), Z=40, B=[];
  B.push(fb(r,.1,.9,.3,1,Z,Z+9,c.pot,(s,t,z)=>z>7?sh(c.pot,.85):z<1?sh(c.pot,.8):worn(c.pot,t,z,1631),()=>[70,52,38],hi),fb(r,.4,.6,.85,1,Z-4,Z,c.handle,null,null,hi));
  for(const [t0,t1,d0,d1,z0,h,col] of [[.2,.35,.4,.6,Z+9,10,c.stalk],[.45,.58,.5,.7,Z+9,13,c.stalk],[.62,.8,.45,.65,Z+9,8,c.stalk],[.3,.5,.55,.8,Z+9,6,sh(c.stalk,.85)],
    [.18,.36,.4,.6,Z+19,5,c.bloom],[.44,.6,.5,.7,Z+22,6,c.bloom],[.6,.82,.45,.65,Z+17,5,c.bloom]])B.push(fb(r,t0,t1,d0,d1,z0,z0+h,col,(s,t,z)=>hash(Math.floor(t*10),Math.floor(z),1633)<.25?sh(col,.82):col,null,hi));
  return prop(B,null,{walk:true}); }
function hangingCabinet(x,y,f=[1,0]){ '@later'; SHARED.PNAME='hanging cabinet'; const r=rect(x,y,f,.75,.5), Z=56, H=24;
  const face=(s,t,z,len)=>{ if(s==='b')return c.cabD; if(s!=='f')return worn(c.cab,t,z,1635); const a=t*len*FP, W=len*FP;
    if(a<1||a>=W-1||z<1||z>=H-1)return c.cabD; return a>=W-4&&a<W-2.5&&z>=H*.4&&z<H*.4+6?c.handle:worn(c.cabL,t,z,1635); };
  return prop([fb(r,0,1,0,1,Z,Z+H,c.cab,face,()=>c.cabD,hi)],null,{high:true,walk:true}); }
function hangingCabinetWide(x,y,f=[1,0]){ '@later'; SHARED.PNAME='hanging cabinet, wide'; const r=rect(x,y,f,1.3,.5), Z=62, H=20, B=[];
  const face=(s,t,z,len)=>{ if(s==='b')return c.cabD; if(s!=='f')return worn(c.cab,t,z,1637); const a=t*len*FP, W=len*FP;
    if(a<1||a>=W-1||z<1||z>=H-1||Math.abs(a-W/2)<.6)return c.cabD; return Math.abs(Math.abs(a-W/2)-3)<1&&z>=H*.4&&z<H*.4+6?c.handle:worn(c.cabL,t,z,1637); };
  B.push(fb(r,0,1,0,1,Z,Z+H,c.cab,face,()=>c.cabD,hi));
  B.push(fb(r,0,1,0,1,Z-10,Z-8,c.cab,null,()=>c.cabL,hi),fb(r,0,1,.85,1,Z-8,Z,c.cabD,null,null,hi),fb(r,0,.05,0,1,Z-8,Z,c.cab,null,null,hi),fb(r,.95,1,0,1,Z-8,Z,c.cab,null,null,hi));
  return prop(B,null,{high:true,walk:true}); }
function supplyCupboard(x,y,f=[1,0]){ '@later'; SHARED.PNAME='supply cupboard'; const r=rect(x,y,f,1.1,.5), Z=40, H=30, B=[], side=(s,t,z)=>worn(c.cab,t,z,1639);
  B.push(fb(r,0,1,.88,1,Z,Z+H,c.cabD,(s,t,z)=>s==='f'?sh(c.cabD,.85):side(s,t,z),()=>c.cabD,hi));
  B.push(fb(r,0,1,0,1,Z,Z+2,c.cab,side,()=>sh(c.cabL,.9),hi),fb(r,0,1,0,1,Z+H-2,Z+H,c.cab,side,()=>c.cabL,hi),fb(r,0,.05,0,1,Z+2,Z+H-2,c.cab,side,null,hi),fb(r,.95,1,0,1,Z+2,Z+H-2,c.cab,side,null,hi));
  B.push(fb(r,.05,.95,.3,.88,Z+15,Z+17,c.cab,side,()=>c.cabL,hi));
  B.push(fb(r,.6,.9,.35,.8,Z+2,Z+13,c.red,(s,t,z)=>z>10?sh(c.red,.8):z>6&&z<9?c.blue:worn(c.red,t,z,1641),()=>sh(c.red,.9),hi),fb(r,.7,.8,.5,.65,Z+13,Z+15,c.blue,null,null,hi));
  B.push(fb(r,.2,.45,.4,.8,Z+2,Z+11,c.wash,(s,t,z)=>z>8?sh(c.wash,.9):c.wash,null,hi));
  B.push(fb(r,.12,.4,.28,.34,Z+6,Z+18,c.wash,(s,t,z)=>hash(Math.floor(t*8),Math.floor(z/2),1643)<.2?sh(c.wash,.85):c.wash,null,hi));
  return prop(B,null,{high:true,walk:true}); }
function basketShelf(x,y,f=[1,0]){ '@later'; SHARED.PNAME='basket shelf'; const r=rect(x,y,f,1.4,.55), B=[], side=(s,t,z)=>worn(c.white,t,z,1645);
  B.push(fb(r,0,1,0,1,0,3,c.whiteD,null,()=>c.whiteD),fb(r,0,1,.9,1,3,26,c.whiteD,(s,t,z)=>s==='f'?sh(c.whiteD,.9):side(s,t,z),()=>c.white,hi),
    fb(r,0,.04,0,.9,3,26,c.white,side,()=>c.white,hi),fb(r,.96,1,0,.9,3,26,c.white,side,()=>c.white,hi),fb(r,.04,.96,0,.9,12,14,c.white,side,()=>c.white,hi),fb(r,.04,.96,0,.9,24,26,c.white,side,()=>c.white,hi));
  const wick=seed=>(s,t,z)=>{ if(z<1||z>=9)return c.wickD; const a=Math.floor(t*14), b=Math.floor(z/2); return (a+b)&1?c.wick:hash(a,b,seed)<.5?c.wickD:c.wickL; };
  for(const [t0,t1,seed,cl] of [[.08,.48,1647,[84,122,170]],[.52,.92,1649,null]])B.push(fb(r,t0,t1,.12,.85,26,36,c.wick,wick(seed),(t,d,X,Y)=>{ const n=hash(Math.floor(X*48),Math.floor(Y*48),seed); return cl&&Math.hypot(t-.5,(d-.5)*.8)<.3?(n<.3?sh(cl,.85):cl):n<.3?c.wickD:c.wick; },hi));
  B.push(fb(r,.1,.5,.2,.8,14,24,c.olive,(s,t,z)=>z>8?sh(c.olive,.85):worn(c.olive,t,z,1651),()=>sh(c.olive,.9),hi),fb(r,.55,.9,.25,.8,14,22,c.brown,(s,t,z)=>worn(c.brown,t,z,1653),()=>sh(c.brown,.9),hi));
  return prop(B); }
const F3L={T:'111010010010010',U:'101101101101111'};
function tallShelfUnit(x,y,f=[0,1]){ '@later'; SHARED.PNAME='tall shelf unit'; const r=rect(x,y,f,.8,.55), H=72, B=[], side=(s,t,z)=>worn(c.dark,t,z,1655), top=()=>c.darkL;
  const rail=(s,t,z,len)=>{ if(s!=='f')return side(s,t,z); const a=Math.floor(t*len*FP)-2, rz=z-1; if(a>=0&&rz>=0&&rz<5){ const g=F3L['TUTU'[Math.floor(a/4)]], k=a%4; if(g&&k<3&&g[(4-Math.floor(rz))*3+k]==='1')return c.darkL; } return side(s,t,z); };
  B.push(fb(r,0,1,.9,1,0,H,c.darkD,(s,t,z)=>s==='f'?sh(c.darkD,.9):side(s,t,z),top),fb(r,0,.06,0,.9,0,H,c.dark,side,top),fb(r,.94,1,0,.9,0,H,c.dark,side,top));
  for(const z of [0,15,29,43,57])B.push(fb(r,.06,.94,0,.9,z,z+2,c.dark,side,top,z?hi:undefined));
  B.push(fb(r,.06,.94,0,.9,H-7,H,c.dark,rail,top,hi));
  const jar=(t0,t1,d0,d1,z,h,col)=>B.push(fb(r,t0,t1,d0,d1,z,z+h,col,(s,t,zz)=>zz>h-2?sh(col,.7):zz>h*.6&&zz<h*.6+2?sh(col,1.2):worn(col,t,zz,1657),()=>sh(col,.8),hi));
  B.push(fb(r,.15,.85,.15,.8,59,70,c.orange,(s,t,z)=>z<3?c.blue:worn(c.orange,t,z,1659),()=>sh(c.orange,.9),hi));
  jar(.12,.45,.2,.75,45,9,c.olive); B.push(fb(r,.5,.88,.15,.8,45,52,c.grey,(s,t,z)=>Math.floor(z/2)%2?sh(c.grey,.85):c.grey,()=>c.grey,hi));
  jar(.1,.36,.2,.7,31,8,c.brown); jar(.4,.64,.25,.7,31,10,c.amber); jar(.68,.9,.2,.7,31,7,c.amber);
  for(const [z,col] of [[17,c.yellow],[20,sh(c.yellow,.9)],[23,c.yellow]])B.push(fb(r,.12,.88,.15,.8,z,z+3,col,(s,t,zz)=>zz<1?sh(col,.75):col,()=>col,hi));
  B.push(fb(r,1,1.08,.3,.42,40,52,c.grey,(s,t,z)=>z>9?c.darkL:z<3?sh(c.grey,.8):c.grey,()=>c.grey,hi));
  return prop(B); }
function darkRug(x,y,f=[0,1]){ '@later'; SHARED.PNAME='dark patterned rug'; const r=rect(x,y,f,2.6,3.6), W=2.6*FP, D=3.6*FP;
  return prop([fb(r,0,1,0,1,0,1,c.rug,()=>c.rugD,(t,d,X,Y)=>{ const u=t*W, v=d*D, e=Math.min(u,W-u,v,D-v), n=hash(Math.floor(X*48),Math.floor(Y*48),1661);
    if(e<1.5)return mt('carpet',c.rugM); if(e<3)return mt('carpet',c.rugD);
    const a=((u+v)%52+52)%52, b=((u-v)%52+52)%52; if(a<1.3||b<1.3||Math.abs(u-W/2)<.8)return mt('carpet',c.rugL);
    return mt('carpet',n<.2?c.rugD:n>.94?sh(c.rug,1.1):c.rug); })],null,{walk:true,flat:true}); }
function ventGrille(x,y,f=[1,0]){ '@later'; SHARED.PNAME='vent grille'; const r=rect(x,y,f,.6,.05), Z=52, H=12;
  return prop([fb(r,0,1,0,1,Z,Z+H,c.ring,(s,t,z,len)=>{ if(s!=='f')return c.ring; const a=t*len*FP, W=len*FP; if(a<1.5||a>=W-1.5||z<1.5||z>=H-1.5)return c.ring; return Math.floor(z)%3===1?c.panel:sh(c.body,.95); },()=>c.ring,hi)],null,{high:true,walk:true}); }
const K={'stacked washer and dryer':washerDryer,'laundry basket':laundryBasket,'utility sink':utilitySink,'round mirror':roundMirror,'wall planter':wallPlanter,'hanging cabinet':hangingCabinet,
  'hanging cabinet, wide':hangingCabinetWide,'supply cupboard':supplyCupboard,'basket shelf':basketShelf,'tall shelf unit':tallShelfUnit,'dark patterned rug':darkRug,'vent grille':ventGrille};
for(const k in K){ CATALOG[k]=(x,y)=>K[k](x,y); KIND_OF[k]=k; }
CAT_DEPTS.push(['laundry','Laundry Room']);
const I=(no,name,price,desc,mat)=>({no:'L-'+String(no).padStart(2,'0'),name,dept:'laundry',price,desc,mat});
Object.assign(CAT_INFO,{'stacked washer and dryer':I(1,'Stacked Washer and Dryer',1299,'Two front loaders, the dryer on the washer. The drums show through the portholes.','steel, enamel, glass'),
  'laundry basket':I(2,'Laundry Basket',14,'Pink woven plastic, full of white washing.','plastic, cotton'),
  'utility sink':I(3,'Utility Sink',349,'A white cabinet with a deep basin on top and a chrome tap.','enamel, chrome'),
  'round mirror':I(4,'Round Mirror',39,'A small round mirror in a dark rim. Hangs on a wall.','glass'),
  'wall planter':I(5,'Wall Planter',22,'A cream pot on a bracket, dry stalks and red blooms in it. Hangs on a wall.','ceramic'),
  'hanging cabinet':I(6,'Hanging Cabinet',89,'A lilac-grey wall cabinet with one door.','pine, paint'),
  'hanging cabinet, wide':I(7,'Hanging Cabinet, Wide',149,'Two doors over an open shelf. Hangs on a wall.','pine, paint'),
  'supply cupboard':I(8,'Supply Cupboard',69,'Open at the front: a red jug, a bottle and a cloth in it. Hangs on a wall.','pine, paint'),
  'basket shelf':I(9,'Basket Shelf',119,'A low white unit with two wicker baskets on top and boxes under.','pine, wicker'),
  'tall shelf unit':I(10,'Tall Shelf Unit',179,'Dark grey, five shelves of jars, boxes and towels. TUTU on the rail.','steel, paint'),
  'dark patterned rug':I(11,'Dark Patterned Rug',120,'Plum-black wool with pale lines in big diamonds.','wool'),
  'vent grille':I(12,'Vent Grille',18,'A grey grille with dark slats. Hangs on a wall.','steel')}); })();
SHARED.PNAME='object';

// ♨, the hot spring sign: a bowl with three wisps of steam rising from it, cell (i,j) from the top left
const ONSEN=['...#....#....#...','..#....#....#....','..#....#....#....','...#....#....#...','....#....#....#..','....#....#....#..','...#....#....#...','..#....#....#....','.................','#...............#','#...............#','.#.............#.','.##...........##.','..###.......###..','....#########....','.................','.................'];
ONSEN.at=(i,j)=>j>=0&&j<ONSEN.length&&i>=0&&ONSEN[j][i]==='#';
const PRESETS={}; SHARED.GHOSTK=null;
{
const FP=24;
const hash2=(a,b)=>Math.floor(hash(a,b,0)*4294967296);
function rng32(seed){ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function foNoise(x,y,seed){ const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,h=(a,b)=>(hash2(a+seed*7919,b)&0xffff)/65535;
  const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1); return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy; }
function foBlob(P,cx,cy,rx,ry,pal,seed){ '@later';
  for(let y=Math.floor(cy-ry-2);y<=cy+ry+2;y++)for(let x=Math.floor(cx-rx-2);x<=cx+rx+2;x++){
    const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry,n=(hash2((x>>1)+seed*31,(y>>1)+seed*17)%1000)/1000; if(nx*nx+ny*ny+(n-.5)*.44>1)continue;
    const l=nx*.55-ny*.78+(n-.5)*.7+((hash2(x+seed,y)&7)===0?.3:0); P.put(x,y,pal[l>.66?3:l>.14?2:l>-.4?1:0]); } }
var GSK={o:[LSEED.x0-10.67,LSEED.walk-9.35*4/3],s:4/3,WL:3.2};
GSK.HOME=[GSK.o[0]+.4*GSK.s,GSK.o[1]+4.1*GSK.s,GSK.o[0]+7.8*GSK.s,GSK.o[1]+9.1*GSK.s];
function gsFloor(x,y){ '@later'; if(!GSK)return null; const o=GSK.o; const s=GSK.s, u=(x-o[0])/s, v=(y-o[1])/s, WL=GSK.WL;
  if(u<-.1||u>8||v<.2||v>9.35)return null;
  const row=Math.floor(v/1.05), cu=(u+(Math.floor(hash(row,5,0)*4294967296)%100)/100*1.7)/1.7, col=Math.floor(cu), fu=cu-col, fv=v/1.05-row, k=Math.floor(hash(col,row,0)*4294967296)%3;
  const S=[[124,120,128],[114,110,120],[146,142,148],[78,76,86]], X=Math.floor(x*FP), Y=Math.floor(y*FP);
  let c=fu<.03||fv<.055?S[3]:fu>.965||fv>.94?S[2]:Math.floor(hash(X,Y,0)*4294967296)%23===0?S[3]:S[k===0?1:0];
  if(v>9.15)c=v>9.3?[96,92,100]:[150,146,150];
  if(u>3.55&&u<5.05&&v<WL+.42)c=v>WL+.36?[150,148,160]:[128,126,140];
  if(u>2.0&&u<2.9&&v>7.5&&v<8.0)c=Math.floor((u-2.0)*32)%4<2?[30,30,38]:[96,96,108];
  return mt('pavement',c); }
{ const s=GSK.s, WL=GSK.WL;
  const QD={wood:[176,116,80],woodDark:[136,82,68],post:[112,56,54],panel:[198,148,92],panelDark:[164,114,80],
    roof:[92,58,72],roofDark:[64,42,60],roofLight:[138,80,76],roofLit:[206,118,88],
    blue:[58,88,128],blueDark:[44,66,104],blueLight:[86,124,152],ochre:[208,152,82],teal:[80,120,124],tealDark:[56,90,102],tealLight:[114,154,152],
    warm:[[255,204,108],[250,160,84]],pink:[[248,152,132],[236,120,126]],drape:[[214,118,126],[176,86,110]],soil:[52,42,40],edge:[118,110,118],
    leaf:[[22,44,40],[34,66,52],[54,94,64],[96,136,86]],bloom:[[226,104,140],[252,170,182]]};
  const lit=c=>Object.assign([...c],{e:1});
  const tone=(c,k)=>!c?null:c.e||k===1?c:[Math.round(c[0]*k),Math.round(c[1]*k),Math.round(c[2]*k)];
  const mix=(a,b,t)=>[Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),Math.round(a[2]+(b[2]-a[2])*t)];
  const shade=(c,k)=>[Math.round(c[0]*k),Math.round(c[1]*k),Math.round(c[2]*k)];
  const H2=(a,b)=>Math.floor(hash(a,b,0)*4294967296);
  const GPUT=(PN,bs,o2)=>{ SHARED.PNAME=PN; return prop(bs,o2&&o2.extra,o2&&o2.o); };
  function kbox(o,u0,v0,u1,v1,z0,z1,f){ const X=u=>o[0]+u*s, Y=v=>o[1]+v*s, c=f.c||QD.wood;
    const b=sided({x0:X(u0),y0:Y(v0),x1:X(u1),y1:Y(v1),z0,z1,c,foot:f.foot??(z0===0?1:0),nb:f.nb,
      top:f.top?(x,y)=>f.top((x-o[0])/s,(y-o[1])/s):()=>c,
      fs:(nx,ny,x,y,z,k)=>{ const zz=Math.floor(z+z0), g=ny>0?f.fv:nx>0?f.fu:ny<0?f.fb:f.fw;
        const a=ny>0?(x-X(f.au0??u0))*FP:nx>0?(y-Y(v0))*FP:ny<0?(X(f.au1??u1)-x)*FP:(Y(v1)-y)*FP, col=g?g(Math.floor(a),zz):c;
        return col===undefined?tone(c,k):tone(col,k); }});
    return b; }
  function kroof(o,u0,u1,vb,vf,ze,zr,wall,orn){ const n=Math.max(2,Math.round((zr-ze)/5)), vm=(vb+vf)/2, half=(vf-vb)/2, out=[];
    const zs=v=>zr-(zr-ze)*Math.abs(v-vm)/half;
    const tile=(sA,t)=>{ const row=Math.floor(t/5); let c=t%5===0||(sA+row*3)%7===0?QD.roofDark:t%5===1?QD.roofLight:QD.roof; if(t<2)c=QD.roofLit; return c; };
    const end=(v,z)=>{ const d=zs(v)-z; if(d<1)return QD.roofLight; if(d<4)return QD.roofDark; const w=wall&&wall(v,z); return w||shade(QD.roofDark,.6); };
    for(let k=0;k<n;k++){ const d=half*k/n, z0=ze+k*(zr-ze)/n, z1=k===n-1?zr+2:z0+(zr-ze)/n+.5, r=n-1-k;
      out.push(kbox(o,u0,vb+d,u1,vf-d,z0,z1,{c:QD.roof,foot:k?0:1,
        top:(u,v)=>k===n-1?(Math.abs(v-vm)<.06?QD.roofLit:QD.roofLight):tile(Math.floor((u-u0)*32),r*5+1+Math.floor(Math.abs(Math.abs(v-vm)-(half-d-half/n))/(half/n)*3)),
        fv:(a,z)=>tile(a,r*5+Math.min(4,Math.max(0,Math.floor(z1-z)))), fb:(a,z)=>tile(a,r*5+Math.min(4,Math.max(0,Math.floor(z1-z)))),
        fu:(a,z)=>end(vb+d+a/32,z), fw:(a,z)=>end(vf-d-a/32,z)})); }
    if(orn){ for(let q=u0+.35;q<u1-.4;q+=.8)out.push(kbox(o,q-.06,vm-.06,q+.06,vm+.06,zr+2,zr+8,{c:QD.roofDark,foot:0,top:()=>QD.roofLit}));
      for(const [u,du] of [[u0,1],[u1,-1]])for(const v of [vb,vf])for(let j=0;j<3;j++){ const uu=u+du*j*.05, z=ze+j*2+(j>1?1:0);
        out.push(kbox(o,Math.min(uu,uu+du*.08),v-.06,Math.max(uu,uu+du*.08),v+.06,z,z+3,{c:QD.roofDark,foot:0,top:()=>j===2?QD.roofLit:QD.roofDark})); } }
    return out; }
  function klean(o,u0,u1,vw,vo,zw,zo){ const n=Math.max(2,Math.round((zw-zo)/4)), out=[];
    for(let k=0;k<n;k++){ const z0=zo+k*(zw-zo)/n, z1=z0+(zw-zo)/n+.5, v1=vo-(vo-vw)*k/n;
      out.push(kbox(o,u0,vw,u1,v1,z0,z1,{c:QD.roof,foot:k?0:1,top:(u,v)=>(Math.floor((u-u0)*32)+k*3)%7===0?QD.roofDark:k===0&&v1-v<.05?QD.roofLit:QD.roof,
        fv:(a,z)=>k===0?(z1-z<1.2?QD.roofLit:QD.roofDark):(a+k*3)%7===0?QD.roofDark:QD.roofLight,fu:()=>QD.roofDark,fw:()=>QD.roofDark,fb:()=>QD.roofDark})); }
    return out; }
  function onPlane(c,alongX,n){ '@later'; const nv=vwV(alongX?0:n,alongX?n:0); if(nv[0]<=0&&nv[1]<=0)return null;
    const p0=alongX?vw(0,c):vw(c,0), p1=alongX?vw(1,c):vw(c,1), dq=(p1[0]-p1[1])-(p0[0]-p0[1]); if(Math.abs(dq)<1e-9)return null;
    return (sx,sy)=>{ const w=(sx/HW-(p0[0]-p0[1]))/dq, vx=p0[0]+(p1[0]-p0[0])*w, vy=p0[1]+(p1[1]-p0[1])*w; return [w,(vx+vy)*HH-sy]; }; }
  const lifeLit=(p,x,y,z)=>{ const now=performance.now(); if(now-(p.litAt||-1e9)>1000){ p.litAt=now; const env=lightEnv(x-.5,y-.5,x+.5,y+.5,false,0); p.L=env?lightAt(env,x,y,z/24,null).map(v=>Math.max(.12,Math.min(1.1,v))):[1,1,1]; } return p.L; };
  function lifeFace(D,W,Hh,ox,oy,K,o,u0,alongX,c,n,a0,a1,z0,z1,f,L){ '@later'; const at=onPlane(c,alongX,n); if(!at)return; const lo=(alongX?o[0]:o[1])+u0*s;
    const pts=[[a0,z0],[a1,z0],[a0,z1],[a1,z1]].map(([a,z])=>{ const w=lo+a/FP, [vx,vy]=alongX?vw(w,c):vw(c,w); return [(vx-vy)*HW,(vx+vy)*HH-z]; });
    const X0=Math.max(0,Math.floor((Math.min(...pts.map(p=>p[0]))-ox)*K)-1), X1=Math.min(W,Math.ceil((Math.max(...pts.map(p=>p[0]))-ox)*K)+1), Y0=Math.max(0,Math.floor((Math.min(...pts.map(p=>p[1]))-oy)*K)-1), Y1=Math.min(Hh,Math.ceil((Math.max(...pts.map(p=>p[1]))-oy)*K)+1);
    for(let py=Y0;py<Y1;py++)for(let px=X0;px<X1;px++){ const [w,z]=at(ox+(px+.5)/K,oy+(py+.5)/K), a=Math.floor((w-lo)*FP), zz=Math.floor(z); if(a<a0||a>=a1||zz<z0||zz>=z1)continue;
      const col=f(a,zz); if(!col)continue; const i=(py*W+px)*4, m=col.e?[1,1,1]:L; D[i]=Math.min(255,col[0]*m[0]); D[i+1]=Math.min(255,col[1]*m[1]); D[i+2]=Math.min(255,col[2]*m[2]); D[i+3]=255; } }

  function shopGround(o,w){ const bs=[kbox(o,w?.6:4,.2,w?4:7.4,WL,0,84,{c:QD.wood,au0:.6,au1:7.4,
      fv:(a,z)=>{ '@later'; if(a>=99&&a<138&&z<72)return z>=70||a<101||a>=136?QD.post:mix([40,28,54],[74,46,62],z/70);
        if(a<3||a>=215||Math.abs(a-93)<2||Math.abs(a-144)<2||z>=80)return QD.post;
        if(a>=10&&a<90&&z<12)return a===10||a===89||z===11||a%20===10?QD.panelDark:QD.panel;
        return z>64?(a%8===0?shade(QD.woodDark,.8):shade(QD.woodDark,.94)):a%8===0?QD.woodDark:H2(a,z>>3)%9===0?shade(QD.wood,.93):QD.wood; },
      fu:(a,z)=>a%8===0||z>80||z===40?QD.woodDark:QD.wood, fw:(a,z)=>a%8===0||z>80||z===40?QD.woodDark:QD.wood,
      fb:(a,z)=>a<3||a>=215||z>=80?QD.post:a>=150&&a<178&&z>=30&&z<52?(a<152||a>=176||z<32||z>=50?QD.post:[60,44,62]):a%8===0?QD.woodDark:QD.wood,
      top:(u,v)=>(u<1.4||u>6.6)&&v<WL?(Math.floor(v*32)%5===0?QD.roofDark:QD.roof):QD.roof})];
    return GPUT('ghost street shop',bs); }
  const DSEQ=[0,1,2,1,0,0,3,2,1,0,1,2,3,0];
  const winCol=(a,z,f)=>{ '@later'; const sway=[0,1,2,1][f], lt=[0,.06,.1,.03][f], g=mix(QD.warm[1],QD.warm[0],Math.min(1,(z-106)/34+lt));
    if(a===32||a===33)return QD.post; const hem=109+((a+sway)%5===0?2:0), dr=a>=3&&a<17+sway||a>=36+(sway>>1)&&a<55+sway;
    return lit(dr&&z>hem?((a+sway)%4===0?mix(QD.drape[1],g,.25):mix(QD.drape[0],g,.3)):g); };
  function shopUpper(o){ const bs=[kbox(o,1.4,.3,6.6,WL,84,158,{c:QD.wood,foot:1,
      fv:(a,z)=>{ '@later'; if(a<3||a>=163||Math.abs(a-85)<2||z<88||z>=154)return QD.post;
        if(a>=10&&a<80&&z>=104&&z<146)return a<12||a>=78||z<106||z>=144?QD.post:winCol(a-12,z,0);
        if(a>=92&&a<156&&z>=104&&z<146){ if(a<94||a>=154||z<106||z>=144)return QD.post; const dx=a-124, dz=z-125, r=Math.hypot(dx,dz);
          return r<12&&r>3&&Math.abs(Math.cos(Math.atan2(dz,dx)*2.5))>.55||a%16===0?[190,140,92]:[212,164,104]; }
        return z<104?(a%21===3||z===103?QD.panelDark:QD.panel):z>146?shade(QD.woodDark,.85):a%8===0?QD.woodDark:QD.wood; },
      fu:(a,z)=>a%8===0||z===158?QD.woodDark:QD.wood, fw:(a,z)=>a%8===0?QD.woodDark:QD.wood,
      fb:(a,z)=>a<3||a>=163||z<88||z>=154?QD.post:a>=60&&a<106&&z>=108&&z<140?(a<62||a>=104||z<110||z>=138||a===83?QD.post:[70,52,70]):a%8===0?QD.woodDark:QD.wood})];
    const p=GPUT('ghost street shop, upstairs',bs,{o:{lifeK:2,hang:84,walk:true}});
    p.lifeDraw=(D,W,Hh,ox,oy,t,K=1)=>{ const f=DSEQ[Math.floor(t*3)%DSEQ.length]; lifeFace(D,W,Hh,ox,oy,K,o,1.4,true,o[1]+WL*s,1,12,78,106,144,(a,z)=>winCol(a-12,z,f),[1,1,1]); };
    LAMPS.push({x:o[0]+2.84*s,y:o[1]+WL*s+.35,z:125,r:3.2,c:[1,.66,.34],prop:p}); return p; }
  function shopRoof(o){ const wall=(v,z)=>Math.abs(v-1.75)<1.45*(1-(z-210)/49)&&z>=210&&z<259?(Math.floor(v*32)%8===0||z===210?QD.woodDark:QD.wood):null;
    return GPUT('ghost street shop roof',kroof(o,.9,7.1,-.45,3.95,208,261,wall,true),{o:{walk:true,hang:208}}); }
  const FANC=(a,z,f)=>{ '@later'; const d=Math.hypot(a-30.5,z-89.5); if(d<11){ if(d>9.5)return QD.blueLight; if(d<2)return QD.blue; const th=Math.atan2(z-89.5,a-30.5)+f*Math.PI/9;
      return((th%(Math.PI/3))+Math.PI/3)%(Math.PI/3)<.36?QD.blue:[24,28,50]; } return a<17&&a>2&&z%4===2&&z>80?(z>94&&a<12?QD.ochre:QD.blueDark):undefined; };
  function shopEave(o){ const bs=klean(o,.3,7.7,WL,3.8,84,72);
    bs.push(kbox(o,2.3,3.4,2.38,3.5,78,84,{c:QD.blueDark,foot:0}),kbox(o,4.0,3.4,4.08,3.5,78,84,{c:QD.blueDark,foot:0}));
    bs.push(kbox(o,2.0,3.48,4.375,3.52,82,108,{c:QD.blue,foot:0,top:()=>QD.blueDark,fb:()=>QD.blueDark,fu:()=>QD.blueDark,fw:()=>QD.blueDark,
      fv:(a,z)=>{ '@later'; if(a<2||a>=74||z<84||z>=106)return QD.blueDark; return ONSEN.at(a-29,104-z)?QD.ochre:(a+z)%9===0?QD.blueLight:QD.blue; }}));   // ♨, no words (owner, 13 Nov 2026)
    bs.push(kbox(o,4.9,3.3,6.3,3.75,76,104,{c:QD.blue,foot:0,top:()=>QD.blueLight,fu:()=>QD.blueDark,fv:(a,z)=>FANC(a,z,0)}));
    const p=GPUT('ghost street eave',bs,{o:{walk:true,lifeK:2,hang:72}});
    p.lifeDraw=(D,W,Hh,ox,oy,t,K=1)=>{ const f=Math.floor(t*10)%3, L=lifeLit(p,o[0]+5.6*s,o[1]+3.75*s,90); lifeFace(D,W,Hh,ox,oy,K,o,4.9,true,o[1]+3.75*s,1,19,42,78,101,(a,z)=>{ const d=Math.hypot(a-30.5,z-89.5); return d<9.5?FANC(a,z,f):null; },L); };
    return p; }
  function bayWindow(o){ const glass=(a,z,w)=>{ if(a<2||a>=w-2||z<14||z>=52||a%18===0||a%18===1||z===33)return QD.post; const g=mix(QD.pink[1],QD.pink[0],(z-14)/38);
      return lit(z<30&&foNoise(a/5,z/6,4)>.56?mix(g,[200,96,116],.6):(a+z)%23===0?mix(g,[255,220,200],.5):g); };
    const bs=[kbox(o,1.0,WL,3.3,3.62,12,54,{c:QD.post,foot:1,fv:(a,z)=>glass(a,z,74),fu:(a,z)=>a<2||a>=11||z<14||z>=52?QD.post:lit(mix(QD.pink[1],QD.pink[0],(z-14)/50)),fw:(a,z)=>a<2||a>=11||z<14||z>=52?QD.post:lit(mix(QD.pink[1],QD.pink[0],(z-14)/50))}),
      ...klean(o,.85,3.45,WL,3.95,62,53)];
    const p=GPUT('ghost street bay window',bs); LAMPS.push({x:o[0]+2.15*s,y:o[1]+3.62*s+.3,z:33,r:2.6,c:[1,.5,.52],prop:p}); return p; }
  const NZ=18, NOREN=(a,z,f)=>{ z-=NZ; const sq=Math.floor(a/8), q=a%8, hem=39+((sq+f)%4===0?1:0)+((sq*3+f)%5===0?1:0);
    if(z>=53&&z<55)return QD.post; if(z<hem||z>=53||q===7&&z<50)return null; return q>1&&q<5&&z>43&&z<48?[150,172,214]:q===0?QD.blueDark:[62,86,142]; };
  function doorCurtain(o){ const short=(a,z)=>z-NZ<41?null:NOREN(a,z,1);
    const bs=[kbox(o,3.7,3.22,4.9,3.25,36+NZ,56+NZ,{c:[62,86,142],foot:1,nb:1,top:()=>QD.post,fv:short,fb:(a,z)=>short(37-a,z),fu:()=>null,fw:()=>null})];
    const p=GPUT('door curtain',bs,{o:{walk:true,lifeK:2,hang:36+NZ}});
    p.lifeDraw=(D,W,Hh,ox,oy,t,K=1)=>{ const f=Math.floor(t*12/5)%4, L=lifeLit(p,o[0]+4.3*s,o[1]+3.3*s,40+NZ); lifeFace(D,W,Hh,ox,oy,K,o,3.7,true,o[1]+3.25*s,1,0,38,36+NZ,42+NZ,(a,z)=>NOREN(a,z,f),L); };
    return p; }
  function drinksMachine(o){ const COLS=[[230,80,90],[70,130,220],[70,180,130],[246,190,80],[236,120,190],[150,110,220]];
    const bs=[kbox(o,5.3,3.25,6.65,3.85,0,60,{c:QD.teal,top:()=>QD.tealLight,
      fv:(a,z)=>{ '@later'; if(a>=13&&a<40&&z>=20&&z<56){ if(a===13||a===39||z===20||z===55)return QD.tealDark; const sh2=(z-21)%9, k=Math.floor((a-15)/6), q=(a-15)%6;
          if(sh2===0)return lit([170,176,206]); if(sh2>0&&sh2<8&&q>0&&q<5&&k<4)return lit(sh2===7?[250,250,255]:COLS[H2(k,Math.floor((z-21)/9))%6]); return lit([222,206,242]); }
        if(a>=3&&a<11){ if(z>=44&&z<50)return[34,52,78]; if(z>=26&&z<33&&a>3&&a<10)return lit([236,100,100]); if(z===38||z===40)return QD.tealDark; }
        if(a>=5&&a<39&&z>=4&&z<15)return z===14||a===5||a===38?QD.tealDark:[44,72,108];
        return a===0||a===42||z===0?QD.tealDark:QD.teal; },
      fu:(a,z)=>z<60&&z>40&&z%3===0&&a>3&&a<16?shade(QD.tealDark,.8):QD.teal, fw:()=>QD.teal, fb:(a,z)=>z>40&&z<56&&z%3===0&&a>4&&a<38?QD.tealDark:QD.teal})];
    const p=GPUT('drinks machine',bs); LAMPS.push({x:o[0]+5.98*s,y:o[1]+3.85*s+.3,z:38,r:2.2,c:[.78,.72,1],prop:p}); return p; }
  function bed(o,u0,v0,u1,v1,lanterns,seed){ const X=u=>o[0]+u*s, Y=v=>o[1]+v*s, R=rng32(seed), n=Math.max(3,Math.round((u1-u0+v1-v0)*2.4)), along=u1-u0>v1-v0;
    const leaves=[]; for(let i=0;i<n;i++){ const t=(i+.5)/n, u=u0+.25+(u1-u0-.5)*(along?t:R()), v=v0+.2+(v1-v0-.4)*(along?R():t); leaves.push([u,v,12+R()*6,8+R()*5,Math.floor(R()*999),[0,1,2,3,4].map(()=>[(R()-.5)*20,6+R()*10])]); }
    const box=kbox(o,u0,v0,u1,v1,0,5,{c:QD.edge,top:()=>QD.soil});
    const r=Math.hypot(u1-u0,v1-v0)*s/2+.6, cx=X((u0+u1)/2), cy=Y((v0+v1)/2);
    const p=GPUT('planted bed',[box],{extra:{bounds:{x0:cx-r,y0:cy-r,x1:cx+r,y1:cy+r,z0:0,z1:40},paint(L){ for(const [u,v,rx,ry,sd,bl] of leaves){ const [px,py]=edPt(X(u),Y(v)), [sx,sy]=toS(...vw(px,py)), bx=Math.round(sx), by=Math.round(sy-8);
          const P={put:(X2,Y2,c)=>L.put(X2,Y2,c,1e9,[px,py,Math.max(5,by-Y2+8),1])}; foBlob(P,bx,by-5,rx,ry,QD.leaf,sd);
          for(const [dx,dy] of bl){ const qx=Math.round(bx+dx), qy=Math.round(by-dy); P.put(qx,qy,QD.bloom[1]); P.put(qx+1,qy,QD.bloom[0]); P.put(qx,qy+1,QD.bloom[0]); } }
        for(const [u,v] of lanterns){ const [px,py]=edPt(X(u),Y(v)), [sx,sy]=toS(...vw(px,py)), cx2=Math.round(sx), cy2=Math.round(sy-14);
          for(let y=-5;y<=5;y++)for(let x=-5;x<=5;x++)if(x*x+y*y<=27)L.put(cx2+x,cy2+y,lit(y===-2||y===2?[255,232,176]:y===0?[255,250,236]:[255,164,160]),1e9,[px,py,14-y,1]); } }},o:{noLine:true}});
    for(const [u,v] of lanterns)LAMPS.push({x:X(u),y:Y(v),z:14,r:1.8,c:[1,.62,.6],prop:p}); return p; }
  function rowHouse(o,u0,v0,u1,v1,wh,rh,seed){ '@later'; const lu=Math.round((u1-u0)*32);
    const face=(a,z,L)=>{ if(z>=wh)return null; const win=a%48>12&&a%48<34&&z>34&&z<70;
      return win?(H2(Math.floor(a/48),seed)%5<2?lit(QD.warm[0]):[84,58,78]):a<2||a>=L-2||z>=wh-3||a%48===4?QD.post:a%8===0||z>wh-9?QD.woodDark:QD.wood; };
    const end=(a,z)=>a%8===0||z===wh?QD.woodDark:QD.wood;
    const bs=[kbox(o,u0,v0,u1,v1,0,wh,{c:QD.wood,fv:(a,z)=>face(a,z,lu),fb:(a,z)=>face(a,z,lu),fu:end,fw:end})];
    const half=(v1-v0)/2+.35, vm=(v0+v1)/2, wall=(v,z)=>Math.abs(v-vm)<(v1-v0)/2*(1-(z-wh)/rh)&&z>=wh?(Math.floor(v*32)%8===0?QD.woodDark:QD.wood):null;
    bs.push(...kroof(o,u0-.35,u1+.35,vm-half,vm+half,wh-5,wh+rh,wall,false));
    const p=GPUT('wooden row house',bs); for(let a=12;a<lu-12;a+=48)if(H2(Math.floor(a/48),seed)%5<2)LAMPS.push({x:o[0]+(u0+(a+11)/32)*s,y:o[1]+v1*s+.3,z:52,r:2,c:[1,.7,.4],prop:p});
    return p; }
  function pole(o,u,v,to){ '@later'; const X=u2=>o[0]+u2*s, Y=v2=>o[1]+v2*s, H=168, PD=[86,58,48];
    const bs=[kbox(o,u-.07,v-.07,u+.07,v+.07,0,H,{c:PD,top:()=>shade(PD,1.1)}),kbox(o,u-.6,v-.05,u+.6,v+.05,H-14,H-9,{c:PD,foot:0}),
      ...[-.5,.5].map(d=>kbox(o,u+d-.03,v-.03,u+d+.03,v+.03,H-9,H-5,{c:[200,200,190],foot:0}))];
    const ends=[[u-.5,v,H-5],[u+.5,v,H-5]], wires=to.map(([u2,v2,z2],i)=>[ends[i%2],[u2,v2,z2]]);
    const xs=[u,...to.map(t=>t[0])].map(X), ys=[v,...to.map(t=>t[1])].map(Y), b={x0:Math.min(...xs)-.5,y0:Math.min(...ys)-.5,x1:Math.max(...xs)+.5,y1:Math.max(...ys)+.5,z0:0,z1:H+4};
    return GPUT('utility pole',bs,{extra:{bounds:b,paint(L){ for(const [a,c] of wires){ const [ax,ay]=edPt(X(a[0]),Y(a[1])), [cx,cy]=edPt(X(c[0]),Y(c[1])), n=Math.ceil(Math.hypot(cx-ax,cy-ay)*40);
          for(let k=0;k<=n;k++){ const t=k/n, x=ax+(cx-ax)*t, y=ay+(cy-ay)*t, z=a[2]+(c[2]-a[2])*t-Math.sin(Math.PI*t)*14, [sx,sy]=toS(...vw(x,y)); L.put(Math.round(sx),Math.round(sy-z),[40,32,40],x+y,[x,y,z,1]); } } }}}); }

  const at=(u0,v0,u1,v1,mk)=>(x,y)=>mk([x-(u0+u1)/2*s,y-(v0+v1)/2*s]);
  const PIECES={'ghost street shop':[.6,.2,4,WL,o=>shopGround(o,true)],'ghost street shop, east end':[4,.2,7.4,WL,o=>shopGround(o,false)],'ghost street shop, upstairs':[1.4,.3,6.6,WL,shopUpper],'ghost street shop roof':[.9,-.45,7.1,3.95,shopRoof],
    'ghost street eave':[.3,WL,7.7,3.8,shopEave],'ghost street bay window':[1.0,WL,3.3,3.62,bayWindow],'door curtain':[3.7,3.22,4.9,3.25,doorCurtain],
    'drinks machine':[5.3,3.25,6.65,3.85,drinksMachine],
    'planted bed with lanterns':[.9,4.15,3.1,4.8,o=>bed(o,.9,4.15,3.1,4.8,[[1.5,4.5],[2.5,4.4]],11)],'long planted bed':[.35,5.4,1.1,8.3,o=>bed(o,.35,5.4,1.1,8.3,[[.7,6.9]],12)],
    'small planted bed':[6.95,3.3,7.6,4.0,o=>bed(o,6.95,3.3,7.6,4.0,[],13)],
    'wooden row house':[7.55,.3,12.6,3.1,o=>rowHouse(o,7.55,.3,12.6,3.1,92,44,7)],'wooden row house, narrow':[-3.5,.3,.45,3.1,o=>rowHouse(o,-3.5,.3,.45,3.1,96,44,5)],
    'utility pole':[9.33,8.53,9.47,8.67,o=>pole(o,9.4,8.6,[[7.4,3.9,150],[12.6,2.6,100]])]};
  for(const k in PIECES){ const [u0,v0,u1,v1,mk]=PIECES[k]; CATALOG[k]=at(u0,v0,u1,v1,mk); KIND_OF[k]=k; }
  if(!CAT_DEPTS.some(d=>d[0]==='ghoststreet'))CAT_DEPTS.push(['ghoststreet','Ghost Street']);
  const info=(no,name,price,desc,mat)=>({no,name,dept:'ghoststreet',price,desc,mat});
  Object.assign(CAT_INFO,{'ghost street shop':info('GS-101','Wooden Shop, Ground Floor',22000,'Plank front, a doorway, panels under the bay.','cedar, cypress'),
    'ghost street shop, east end':info('GS-114','Wooden Shop, Ground Floor East',16000,'The rest of the plank front and the doorway.','cedar, cypress'),
    'ghost street shop, upstairs':info('GS-102','Wooden Shop, Upper Floor',26000,'A lit window with drapes, a shutter with a faded flower.','cedar, paper'),
    'ghost street shop roof':info('GS-103','Tiled Roof',14000,'Clay tiles, a ridge of ornaments, corners turned up.','fired clay'),
    'ghost street eave':info('GS-104','Shop Eave with Sign',3200,'A low tiled eave, a blue sign, a cooler whose fan turns.','clay, steel, wood'),
    'ghost street bay window':info('GS-105','Bay Window',2400,'Pink-lit panes in a wooden frame.','wood, glass'),
    'door curtain':info('GS-106','Door Curtain',85,'Five blue strips over a doorway. They stir.','cotton'),
    'drinks machine':info('GS-107','Drinks Machine',4200,'A teal machine, its window of bottles lit.','steel, glass'),
    'planted bed with lanterns':info('GS-108','Planted Bed with Lanterns',340,'Dark leaves, pink blossom, two paper lanterns.','stone, living, paper'),
    'long planted bed':info('GS-109','Long Planted Bed',380,'Dark leaves, pink blossom, a paper lantern.','stone, living, paper'),
    'small planted bed':info('GS-110','Small Planted Bed',120,'Dark leaves and pink blossom in a stone edge.','stone, living'),
    'wooden row house':info('GS-111','Wooden Row House',160000,'Planks, a tiled roof, some windows lit.','cedar, clay'),
    'wooden row house, narrow':info('GS-112','Narrow Row House',120000,'A narrower one of the row.','cedar, clay'),
    'utility pole':info('GS-113','Utility Pole',1800,'A wooden pole, a crossbar, its wires.','wood, copper')});
  PRESETS['Preset Ghost Street 1']=Object.keys(PIECES).map(k=>{ const [u0,v0,u1,v1]=PIECES[k]; return [k,+(((u0+u1)/2+3.5)*s).toFixed(3),+(((v0+v1)/2+.45)*s).toFixed(3),0]; }); }

SHARED.GHOSTK={GSK,gsFloor};
}

{
var DJ=null;
const djE=c=>Object.assign([...c],{e:1});
const djBx=(x0,y0,x1,y1,z0,z1,c,o)=>({x0,y0,x1,y1,z0,z1,c,...(Math.min(x1-x0,y1-y0)<.08||z1-z0<2?{nb:1}:{}),...o});
const DJLEAVES=[['....##....','...####...','.########.','##########','##########','.########.','..######..','...####...','....##....'],
  ['......###.','....#####.','..#######.','.########.','#########.','.#######..','..#####...','...###....','....#.....']];
const DJLEAF=[[18,28,26],[30,48,38],[52,76,46],[86,108,52],[128,140,58],[176,170,66],[214,196,96],[240,222,130]];
function djLeaf(u,v,s,light,dens=.85,gapOK=0){ '@later'; const CW=7, CH=6, cj0=Math.floor(v/CH); let best=null, bj=-1e9;
  for(let cj=cj0-1;cj<=cj0+1;cj++){ const off=(cj&1)*CW/2, ci0=Math.floor((u-off)/CW);
    for(let ci=ci0-1;ci<=ci0+1;ci++){ const h=hash(ci,cj,s); if(h>dens)continue; const k=hash(ci,cj,s+1), m=DJLEAVES[k<.5?0:1], fl=k>.75,
        ox=ci*CW+off+Math.floor(hash(ci,cj,s+2)*3)-2, oy=cj*CH+Math.floor(hash(ci,cj,s+3)*3)-2, du=Math.floor(u)-ox, dv=Math.floor(v)-oy;
      if(du<0||dv<0||du>9||dv>8)continue; const col=fl?9-du:du; if(m[dv][col]!=='#'||cj<=bj)continue;
      const edge=(a,b)=>{ const c=fl?9-a:a; return b<0||b>8||c<0||c>9||m[b][c]!=='#'; };
      let L=light*6+(h/dens-.5)*1.6+.5; if(edge(du-1,dv)||edge(du,dv-1))L+=1.3; if(edge(du+1,dv)||edge(du,dv+1))L-=2.2; if(dv>3&&(col===4||col===5))L-=.9;
      best=DJLEAF[Math.max(0,Math.min(7,Math.round(L)))]; bj=cj; } }
  return best||(gapOK?null:DJLEAF[Math.max(0,Math.round(light*2))]); }
function djLathe(cx,cy,z0,z1,rf,col,dz=2,dw=.04){ '@later'; const out=[];
  for(let z=z0;z<z1-1e-9;z+=dz){ const za=z, zb=Math.min(z1,z+dz), r=rf((za+zb)/2-z0); if(!(r>.004))continue; const n=Math.max(1,Math.round(2*r/dw)), w=2*r/n;
    for(let i=0;i<n;i++){ const xa=-r+i*w, xm=xa+w/2, hy=Math.sqrt(Math.max(0,r*r-xm*xm)); if(hy<w*.3)continue;
      out.push(sided({x0:cx+xa,y0:cy-hy,x1:cx+xa+w,y1:cy+hy,z0:za,z1:zb,c:[90,90,90],foot:0,nb:1,fs:(nx,ny,X,Y,zr)=>col(X-cx,Y-cy,za+zr-z0,0),top:(X,Y)=>col(X-cx,Y-cy,zb-z0,1)})); } }
  return out; }
const DJTAT=[178,166,112], DJBRD=[128,84,50], DJWOOD=[70,48,34], DJPAP=[226,218,196], DJPLA=[204,192,164];
const DJWIN=[-4,4], DJPAN=[[-3,-2],[2,3]];
function djAndon(x,y){ '@later'; SHARED.PNAME='andon'; const w=.17, P=(a,z)=>(Math.abs(a)>w-.025||z<9||z>27.5||Math.abs(z-18)<.6)?sh(DJWOOD,1.1):djE(z<12?[230,150,80]:[255,206,140]);
  const p=prop([djBx(x-w,y-w,x+w,y+w,0,6,DJWOOD,{top:()=>sh(DJWOOD,.8)}),{x0:x-w,y0:y-w,x1:x+w,y1:y+w,z0:6,z1:29,foot:0,c:DJWOOD,top:()=>djE([255,226,170]),fi:(v,z)=>P(v-y,z),fj:(u,z)=>P(u-x,z)}]);
  LAMPS.push({x,y,z:20,r:4.8,c:[.66,.34,.14],own:1,room:1,day:true,prop:p}); return p; }
const DJFLH=[9,11,10,12,8,11,9,12];
function djCandle(x,y){ '@later'; SHARED.PNAME='dojo candle'; const LK=[30,24,22], WX=[234,224,198], FL={ph:0}, s=Math.round(x*7+y*13);
  const wax=(a,z,f)=>z>14?djE(sh([240,206,150],(.3+.6*(z-14)/9)*(hash(Math.floor(a*30),Math.floor(z/2),753)<.12?.86:1))):sh(WX,f*(hash(Math.floor(a*30),Math.floor(z/2),753)<.12?.86:1));
  const flame=(du,zz)=>{ if(typeof LIFE==='undefined'||LIFE.mode!==1)return null; const h=DJFLH[FL.ph], lean=(FL.ph%3-1)*.012; if(zz<0||zz>=h)return null;
    const w=.03*Math.pow(1-zz/h,.55), a=Math.abs(du-lean*zz); if(a>w)return null; return djE(zz<2?[255,244,190]:a<w*.4&&zz<h*.6?[255,224,120]:a>w*.75||zz>h*.8?[236,112,40]:[255,186,80]); };
  const p=prop([djBx(x-.2,y-.2,x+.2,y+.2,0,7,LK,{top:()=>sh(LK,1.4)}),...djLathe(x,y,7,30,z=>.11-(z>21?(z-21)*.004:0),(dx,dy,z,top)=>top?djE(sh([250,220,160],.9)):wax(dx+dy,z,.95),1.5,.035),
    {x0:x-.04,y0:y-.04,x1:x+.04,y1:y+.04,z0:30,z1:43,foot:0,nb:1,life:1,c:[255,186,80],top:()=>null,fi:(v,z)=>flame(v-y,z-30),fj:(u,z)=>flame(u-x,z-30)}],null,{walk:0});
  p.life=t=>{ FL.ph=Math.floor(hash(Math.floor(t*10),s,425)*8); }; p.lifeKey=()=>FL.ph;
  LAMPS.push({x,y,z:34,r:4,c:[.85,.42,.17],own:1,room:1,day:true,prop:p,flick:1}); return p; }
function djIncense(x,y,n){ '@later'; SHARED.PNAME='incense'; const BR=[120,88,48], ST=[96,52,40], bx=x+n[0]*.12, by=y+n[1]*.12;
  const bs=[{x0:x-.1+Math.min(0,n[0]*.2),y0:y-.1+Math.min(0,n[1]*.2),x1:x+.1+Math.max(0,n[0]*.2),y1:y+.1+Math.max(0,n[1]*.2),z0:24,z1:26,c:[70,48,34],foot:1},djBx(bx-.06,by-.06,bx+.06,by+.06,26,29,BR,{foot:0,top:()=>[150,146,138]})];
  for(const [ox,oy,h] of [[-.025,0,12],[.02,.02,10],[0,-.025,11]]){ bs.push(djBx(bx+ox-.008,by+oy-.008,bx+ox+.008,by+oy+.008,29,29+h,ST,{foot:0}),djBx(bx+ox-.01,by+oy-.01,bx+ox+.01,by+oy+.01,29+h,30+h,djE([255,110,50]),{foot:0,em:1})); }
  return prop(bs,null,{walk:1,cutN:[-n[0],-n[1]]}); }
function djHanging(x,y,n,kind){ '@later'; SHARED.PNAME='hanging plant'; const TC=[166,92,56], seed=761+kind*7, G=[[64,110,52],[96,140,70],[52,96,60],[110,150,64]][kind%4], L=kind%4;
  const leaf=(a,z,top)=>{ const c=djLeaf(a*48,(60-z)*2,seed,top?.7:.5,.8,1); return c?sh(c,L===1?1.1:1):null; };
  const bs=[djBx(x-.006,y-.006,x+.006,y+.006,44,56,[60,50,40],{foot:0}),...djLathe(x,y,37,44,z=>.08+.03*z/7,(dx,dy,z,top)=>top?[70,56,40]:sh(TC,z>5?1.08:.9),1,.03)];
  for(let i=0;i<7;i++){ const ang=i/7*6.28, r=.07+.05*hash(i,kind,763), cx=x+Math.cos(ang)*r, cy=y+Math.sin(ang)*r, len=10+18*hash(i,kind,765);
    bs.push({x0:cx-.035,y0:cy-.035,x1:cx+.035,y1:cy+.035,z0:44-len,z1:46,foot:0,nb:1,c:G,top:(X,Y)=>leaf(X+Y,46,1)||G,fi:(v,z)=>leaf(v*1.7,z,0),fj:(u,z)=>leaf(u*1.7+.5,z,0)}); }
  bs[0].foot=1; return prop(bs,null,{walk:1,cutN:[-n[0],-n[1]]}); }
function djTokonoma(x0,y,x1){ '@later'; SHARED.PNAME='tokonoma'; const D=.85, DK=[58,36,24], cx=(x0+x1)/2-.4;
  const scroll=(u,z)=>{ const a=(u-cx)*24, s=z-34; if(Math.abs(a)>8||z<14||z>56)return null; if(z<15.5)return sh([92,66,40],.8); if(Math.abs(a)>6.5||z>52||z<18)return sh([62,66,78],.8);
    const r=Math.hypot(a,s), th=Math.atan2(s,a), wdt=.9+.9*(.5+.5*Math.sin(th+.8)); return Math.abs(r-4.6)<wdt&&th>-2.6?[34,30,30]:sh([228,220,198],.8); };
  const bs=[djBx(x0,y,x1,y+D,0,5,DK,{top:(X,Y)=>sh(DK,1.1+.08*Math.sin(X*9)),fi:()=>sh(DK,.62),fj:()=>sh(DK,.7)}),
    djBx(x0-.12,y,x0+.06,y+.18,0,DJ.H-14,[150,112,70],{fi:(v,z)=>sh([150,112,70],.62*(.9+.15*Math.sin(z*.7))),fj:(u,z)=>sh([150,112,70],.8*(.9+.15*Math.sin(z*.7)))}),
    {x0:cx-.4,y0:y+.01,x1:cx+.4,y1:y+.03,z0:14,z1:57,foot:0,nb:1,c:[228,220,198],top:()=>null,fi:()=>null,fj:(u,z)=>scroll(u,z)},
    djBx(x1-.75,y+.3,x1-.45,y+.6,5,12,[40,40,46],{top:()=>[24,24,28]})];
  for(const [dx,dy,z0,z1] of [[0,0,12,30],[.08,-.04,22,34],[-.07,.03,18,27]])bs.push(djBx(x1-.62+dx,y+.44+dy,x1-.58+dx,y+.48+dy,z0,z1,[70,50,38],{foot:0}));
  for(let i=0;i<9;i++){ const h=hash(i,3,741), bx=x1-.6+(hash(i,5,743)-.5)*.3, by=y+.46+(hash(i,7,745)-.5)*.2, z=20+h*15; bs.push(djBx(bx-.03,by-.03,bx+.03,by+.03,z,z+2,[236,168,182],{foot:0,top:()=>[250,206,214]})); }
  return prop(bs,null,{cutN:[0,-1]}); }
function djBokkenRack(x,y0,y1){ '@later'; SHARED.PNAME='bokken rack'; const W=[150,110,66], DK=[66,46,32], bs=[djBx(x-.14,y0,x,y0+.1,0,46,DK),djBx(x-.14,y1-.1,x,y1,0,46,DK)];
  for(const z of [16,24,32,40])bs.push(djBx(x-.12,y0-.12,x-.04,y1+.12,z,z+2,W,{foot:0,fi:(v,z)=>sh(Math.abs(v-y1-.05)<.06?[40,30,26]:W,.62)}));
  bs.push(djBx(x-.1,y1+.3,x-.04,y1+.36,0,60,[120,88,52]),djBx(x-.1,y1+.48,x-.04,y1+.54,0,58,[120,88,52]));
  return prop(bs,null,{cutN:[1,0]}); }
DJ=null&&(()=>{ const g=WEND.dojo, r=WEND.row.find(q=>q[0]==='ldojo'), h={x0:r[2],x1:r[3],y0:r[4],y1:r[5]};
  return {x0:g.x0,y0:g.y0,x1:g.x1,y1:g.y1,gate:g.gate,h,c:[(h.x0+h.x1)/2,(h.y0+h.y1)/2],T,H:72,DH:56,dw:1.5}; })();

SHARED.BOD.GDJ={djAndon,djCandle,djIncense,djHanging,djTokonoma,djBokkenRack,djLeaf,DJTAT,DJBRD,DJWOOD,DJPAP,DJPLA,setDJ:v=>{ DJ=v; }};
}

const STOREK={LAMPS,PRESETS,CATALOG,PROPS:PROPL,LBLD,T,STORY,hash,sh,sided,prop,LSEED}; const SQLV={octo:0}; const DEEPW={ZPX:24};
LBLD.push({id:'ldiner',label:'DINER',x0:106.5,y0:-84,x1:120,y1:-77,h:130,st:1,c:[176,62,56]},{id:'lbodega2',label:'BAR',x0:WROW.bar.x0,y0:WROW.bar.y0,x1:WROW.bar.x1,y1:WROW.bar.y1,h:130,st:1,c:[146,96,64]},{id:'ldungeon',label:'THE DUNGEON',x0:500,y0:-58,x1:513,y1:-47,h:130,st:1,c:[60,56,52]},{id:'lcastle',label:'THE KEEP',x0:88.75,y0:-94,x1:98.25,y1:-85,h:520,st:4,tall:4,c:[150,142,126]});
const KEEPC={k:[426,435.5,-86,-77],door:430.75,arches:[428.1,430.75,433.4],b:[422,439,-90,-73],gate:430.5};
export {DEEPW, KEEPC, ONSEN, PRESETS, SQLV, STOREK};
