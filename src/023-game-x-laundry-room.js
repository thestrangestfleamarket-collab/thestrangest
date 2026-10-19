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
function laundryTile(u,z,f){ const c=LAC; if(z<3)return sh(c.skirt,f); const uu=((u%24)+24)%24, zz=(((z-3)%26)+26)%26;
  if(uu<1||zz<1)return sh(c.joint,f); const b=uu<2.5||zz>=23.5?c.tileL:uu>=22.5||zz<2.5?c.tileD:c.tile, s=hash(Math.floor(u),Math.floor(z),1607);
  return sh(s<.02?sh(b,.95):b,f); }
(()=>{ const {FP,rect,fb,worn,metal}=STUDIO.kit, c=LAC, hi={foot:1};
function washerDryer(x,y,f=[1,0]){ PNAME='stacked washer and dryer'; const r=rect(x,y,f,.8,.75), B=[];
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
function laundryBasket(x,y,f=[1,0]){ PNAME='laundry basket'; const r=rect(x,y,f,.45,.45), H=22, B=[], w=.11;
  const weave=(s,t,z)=>{ if(z<1.5)return sh(c.basketD,.9); if(z>=H-2)return c.basketD; const a=Math.floor(t*11), b=Math.floor(z/2); return (a+b)&1?c.basket:hash(a,b,1619)<.5?c.basketD:sh(c.basket,.92); };
  B.push(fb(r,0,1,0,1,0,2,c.basketD,null,()=>c.basketD));
  for(const [t0,t1,d0,d1] of [[0,w,0,1],[1-w,1,0,1],[w,1-w,0,w],[w,1-w,1-w,1]])B.push(fb(r,t0,t1,d0,d1,2,H,c.basket,weave,()=>c.basketD,hi));
  B.push(fb(r,w,1-w,w,1-w,2,H+3,c.wash,(s,t,z)=>z<H-4?sh(c.wash,.8):c.wash,(t,d,X,Y)=>{ const n=hash(Math.floor(X*48),Math.floor(Y*48),1621); return n<.15?sh(c.wash,.86):n>.9?c.wash:sh(c.wash,.95); },hi));
  return prop(B); }
function utilitySink(x,y,f=[1,0]){ PNAME='utility sink'; const r=rect(x,y,f,1.1,.6), B=[], Z=24, BZ=10, w=.07;
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
function roundMirror(x,y,f=[1,0]){ PNAME='round mirror'; const r=rect(x,y,f,.45,.05), Z=36, H=16;
  const face=(s,t,z,len)=>{ const a=(t-.5)*len*FP, m=Math.hypot(a,z-H/2); if(m>7.5)return null; if(s!=='f'||m>6.3)return c.ring; return a+z-H/2<-5?sh(c.body,1.14):hash(Math.floor(a),Math.floor(z),1629)<.04?sh(c.body,1.1):c.body; };
  return prop([fb(r,0,1,0,1,Z,Z+H,c.ring,face,()=>null,hi)],null,{walk:true}); }
function wallPlanter(x,y,f=[1,0]){ PNAME='wall planter'; const r=rect(x,y,f,.4,.3), Z=40, B=[];
  B.push(fb(r,.1,.9,.3,1,Z,Z+9,c.pot,(s,t,z)=>z>7?sh(c.pot,.85):z<1?sh(c.pot,.8):worn(c.pot,t,z,1631),()=>[70,52,38],hi),fb(r,.4,.6,.85,1,Z-4,Z,c.handle,null,null,hi));
  for(const [t0,t1,d0,d1,z0,h,col] of [[.2,.35,.4,.6,Z+9,10,c.stalk],[.45,.58,.5,.7,Z+9,13,c.stalk],[.62,.8,.45,.65,Z+9,8,c.stalk],[.3,.5,.55,.8,Z+9,6,sh(c.stalk,.85)],
    [.18,.36,.4,.6,Z+19,5,c.bloom],[.44,.6,.5,.7,Z+22,6,c.bloom],[.6,.82,.45,.65,Z+17,5,c.bloom]])B.push(fb(r,t0,t1,d0,d1,z0,z0+h,col,(s,t,z)=>hash(Math.floor(t*10),Math.floor(z),1633)<.25?sh(col,.82):col,null,hi));
  return prop(B,null,{walk:true}); }
function hangingCabinet(x,y,f=[1,0]){ PNAME='hanging cabinet'; const r=rect(x,y,f,.75,.5), Z=56, H=24;
  const face=(s,t,z,len)=>{ if(s==='b')return c.cabD; if(s!=='f')return worn(c.cab,t,z,1635); const a=t*len*FP, W=len*FP;
    if(a<1||a>=W-1||z<1||z>=H-1)return c.cabD; return a>=W-4&&a<W-2.5&&z>=H*.4&&z<H*.4+6?c.handle:worn(c.cabL,t,z,1635); };
  return prop([fb(r,0,1,0,1,Z,Z+H,c.cab,face,()=>c.cabD,hi)],null,{high:true,walk:true}); }
function hangingCabinetWide(x,y,f=[1,0]){ PNAME='hanging cabinet, wide'; const r=rect(x,y,f,1.3,.5), Z=62, H=20, B=[];
  const face=(s,t,z,len)=>{ if(s==='b')return c.cabD; if(s!=='f')return worn(c.cab,t,z,1637); const a=t*len*FP, W=len*FP;
    if(a<1||a>=W-1||z<1||z>=H-1||Math.abs(a-W/2)<.6)return c.cabD; return Math.abs(Math.abs(a-W/2)-3)<1&&z>=H*.4&&z<H*.4+6?c.handle:worn(c.cabL,t,z,1637); };
  B.push(fb(r,0,1,0,1,Z,Z+H,c.cab,face,()=>c.cabD,hi));
  B.push(fb(r,0,1,0,1,Z-10,Z-8,c.cab,null,()=>c.cabL,hi),fb(r,0,1,.85,1,Z-8,Z,c.cabD,null,null,hi),fb(r,0,.05,0,1,Z-8,Z,c.cab,null,null,hi),fb(r,.95,1,0,1,Z-8,Z,c.cab,null,null,hi));
  return prop(B,null,{high:true,walk:true}); }
function supplyCupboard(x,y,f=[1,0]){ PNAME='supply cupboard'; const r=rect(x,y,f,1.1,.5), Z=40, H=30, B=[], side=(s,t,z)=>worn(c.cab,t,z,1639);
  B.push(fb(r,0,1,.88,1,Z,Z+H,c.cabD,(s,t,z)=>s==='f'?sh(c.cabD,.85):side(s,t,z),()=>c.cabD,hi));
  B.push(fb(r,0,1,0,1,Z,Z+2,c.cab,side,()=>sh(c.cabL,.9),hi),fb(r,0,1,0,1,Z+H-2,Z+H,c.cab,side,()=>c.cabL,hi),fb(r,0,.05,0,1,Z+2,Z+H-2,c.cab,side,null,hi),fb(r,.95,1,0,1,Z+2,Z+H-2,c.cab,side,null,hi));
  B.push(fb(r,.05,.95,.3,.88,Z+15,Z+17,c.cab,side,()=>c.cabL,hi));
  B.push(fb(r,.6,.9,.35,.8,Z+2,Z+13,c.red,(s,t,z)=>z>10?sh(c.red,.8):z>6&&z<9?c.blue:worn(c.red,t,z,1641),()=>sh(c.red,.9),hi),fb(r,.7,.8,.5,.65,Z+13,Z+15,c.blue,null,null,hi));
  B.push(fb(r,.2,.45,.4,.8,Z+2,Z+11,c.wash,(s,t,z)=>z>8?sh(c.wash,.9):c.wash,null,hi));
  B.push(fb(r,.12,.4,.28,.34,Z+6,Z+18,c.wash,(s,t,z)=>hash(Math.floor(t*8),Math.floor(z/2),1643)<.2?sh(c.wash,.85):c.wash,null,hi));
  return prop(B,null,{high:true,walk:true}); }
function basketShelf(x,y,f=[1,0]){ PNAME='basket shelf'; const r=rect(x,y,f,1.4,.55), B=[], side=(s,t,z)=>worn(c.white,t,z,1645);
  B.push(fb(r,0,1,0,1,0,3,c.whiteD,null,()=>c.whiteD),fb(r,0,1,.9,1,3,26,c.whiteD,(s,t,z)=>s==='f'?sh(c.whiteD,.9):side(s,t,z),()=>c.white,hi),
    fb(r,0,.04,0,.9,3,26,c.white,side,()=>c.white,hi),fb(r,.96,1,0,.9,3,26,c.white,side,()=>c.white,hi),fb(r,.04,.96,0,.9,12,14,c.white,side,()=>c.white,hi),fb(r,.04,.96,0,.9,24,26,c.white,side,()=>c.white,hi));
  const wick=seed=>(s,t,z)=>{ if(z<1||z>=9)return c.wickD; const a=Math.floor(t*14), b=Math.floor(z/2); return (a+b)&1?c.wick:hash(a,b,seed)<.5?c.wickD:c.wickL; };
  for(const [t0,t1,seed,cl] of [[.08,.48,1647,[84,122,170]],[.52,.92,1649,null]])B.push(fb(r,t0,t1,.12,.85,26,36,c.wick,wick(seed),(t,d,X,Y)=>{ const n=hash(Math.floor(X*48),Math.floor(Y*48),seed); return cl&&Math.hypot(t-.5,(d-.5)*.8)<.3?(n<.3?sh(cl,.85):cl):n<.3?c.wickD:c.wick; },hi));
  B.push(fb(r,.1,.5,.2,.8,14,24,c.olive,(s,t,z)=>z>8?sh(c.olive,.85):worn(c.olive,t,z,1651),()=>sh(c.olive,.9),hi),fb(r,.55,.9,.25,.8,14,22,c.brown,(s,t,z)=>worn(c.brown,t,z,1653),()=>sh(c.brown,.9),hi));
  return prop(B); }
const F3L={T:'111010010010010',U:'101101101101111'};
function tallShelfUnit(x,y,f=[0,1]){ PNAME='tall shelf unit'; const r=rect(x,y,f,.8,.55), H=72, B=[], side=(s,t,z)=>worn(c.dark,t,z,1655), top=()=>c.darkL;
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
function darkRug(x,y,f=[0,1]){ PNAME='dark patterned rug'; const r=rect(x,y,f,2.6,3.6), W=2.6*FP, D=3.6*FP;
  return prop([fb(r,0,1,0,1,0,1,c.rug,()=>c.rugD,(t,d,X,Y)=>{ const u=t*W, v=d*D, e=Math.min(u,W-u,v,D-v), n=hash(Math.floor(X*48),Math.floor(Y*48),1661);
    if(e<1.5)return mt('carpet',c.rugM); if(e<3)return mt('carpet',c.rugD);
    const a=((u+v)%52+52)%52, b=((u-v)%52+52)%52; if(a<1.3||b<1.3||Math.abs(u-W/2)<.8)return mt('carpet',c.rugL);
    return mt('carpet',n<.2?c.rugD:n>.94?sh(c.rug,1.1):c.rug); })],null,{walk:true,flat:true}); }
function ventGrille(x,y,f=[1,0]){ PNAME='vent grille'; const r=rect(x,y,f,.6,.05), Z=52, H=12;
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
PNAME='object';

const PRESETS={}; let GHOSTK=null;
{
