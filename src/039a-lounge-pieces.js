// THE LOUNGE'S PIECES: the old game's lounge part 2 (the white sofa and coffee table, the big TV, the speaker, the small fridge, the boxes, the grille, the arcade cabinets, the red stool) as catalog kinds for the old rooms; registered on the first jump.
import {SHARED} from './003-shx.js';
import {CAT_DEPTS, CAT_INFO, CATALOG, hash, KIND_OF, LAMPS, mt, prop, sh} from './014-gamekit.js';
import {STOREK} from './023-west-kits.js';
const loungePieces=()=>{ '@oldkits';
  const MLK=STOREK.lounge.MLK, {art,onF,lit,C,rect,fb,worn,metal}=MLK, FP=24;
  const W=[232,232,236], WD=[196,198,206], WL=[244,244,248], CARD=[196,160,104], CARDD=[150,116,70], LEAF=[76,150,70], LEAFD=[46,106,50], POT=[146,88,60], GRILL=[58,58,62];
  const white=(k)=>(s,t,z)=>{ const c=worn(W,t,z,k); return s==='b'?sh(c,.9):c; };
  // THE SOFA: 7 tiles long, 1.6 deep, white: a low base, the seat, a back and two arms, three seat cushions and two loose cushions (the arms
  // and back rounded with a lighter top row and a shadow line); its front is the side it faces
  function sofa(x,y,f=[1,0]){ SHARED.PNAME='white sofa'; const r=rect(x,y,f,7,1.6), B=[], R=(k)=>(s,t,z,len)=>{ const c=worn(W,t,z,k); if(z<2)return WD; return s==='t'?WL:c; };
    B.push(fb(r,0,1,0,1,0,16,W,(s,t,z)=>z<3?[120,120,126]:white(61)(s,t,z),()=>W));                                   // the base and seat
    B.push(fb(r,.06,.94,.7,1,16,40,W,(s,t,z,len)=>{ const u=t*len*FP%56; return s==='f'&&(u<1.5||z<2)?WD:z>36?WL:worn(W,t,z,63); },()=>WL,{foot:1}));   // the back, its three sections
    for(const [a,b] of [[0,.07],[.93,1]])B.push(fb(r,a,b,0,1,16,30,W,R(65),()=>WL,{foot:1}));                           // the arms
    for(let i=0;i<3;i++)B.push(fb(r,.08+i*.285,.36+i*.285,.08,.7,16,22,W,(s,t,z)=>z>4?WL:z<1?WD:W,(t,d)=>Math.min(t,1-t,d,1-d)<.06?WD:WL,{foot:1}));   // the seat cushions
    B.push(fb(r,.6,.75,.45,.7,22,34,W,(s,t,z)=>s==='f'&&Math.abs(t-.5)<.1&&z>3&&z<9?WD:W,()=>WL,{foot:1}),fb(r,.4,.55,.5,.7,22,32,W,null,()=>WL,{foot:1}));   // the loose cushions
    return prop(B); }
  // THE BACKPACK: khaki, a flap, a strap, leaning on the sofa's end
  function backpack(x,y,f=[1,0]){ SHARED.PNAME='backpack'; const r=rect(x,y,f,.5,.4), c=[134,124,94], d=[96,88,66];
    return prop([fb(r,.1,.9,.1,.9,0,16,c,(s,t,z)=>z<2?d:s==='f'&&z>9&&z<11?d:worn(c,t,z,67),()=>c),fb(r,.2,.8,.2,.8,16,22,c,(s,t,z)=>z>4?d:c,()=>d,{foot:1}),fb(r,.4,.6,.5,.9,22,26,d,null,null,{foot:1})]); }
  // THE COFFEE TABLE: white, 2.5 long, low, on four short legs; on it two cups, a bottle of sauce, a red cup and a slice of pizza on a plate
  function coffeeTable(x,y,f=[1,0]){ SHARED.PNAME='white coffee table'; const r=rect(x,y,f,2.5,1.1), B=[];
    B.push(fb(r,0,1,0,1,12,15,W,(s,t,z)=>z>2?WL:white(69)(s,t,z),()=>WL)); for(const [a,b,c,d] of [[.03,.08,.05,.15],[.92,.97,.05,.15],[.03,.08,.85,.95],[.92,.97,.85,.95]])B.push(fb(r,a,b,c,d,0,12,WD,null,null,{foot:1}));
    B.push(fb(r,.25,.31,.35,.5,15,21,[236,236,232],null,null,{foot:1}),fb(r,.36,.42,.4,.55,15,20,[70,110,190],null,null,{foot:1}),fb(r,.5,.54,.3,.4,15,25,[190,40,30],(s,t,z)=>z>19?[240,220,120]:[190,40,30],null,{foot:1}),
      fb(r,.58,.66,.45,.65,15,21,[200,40,40],null,()=>[220,80,80],{foot:1}),fb(r,.7,.9,.3,.7,15,16,[244,240,232],null,(t,d)=>t>.74&&t<.88&&Math.abs(d-.5)<(t-.74)*2?[226,160,60]:[244,240,232],{foot:1})); return prop(B); }   // (the slice: a wedge)
  // AN OPEN PIZZA BOX: its lid up, the last slices in it
  function pizzaBox(x,y,f=[0,1]){ SHARED.PNAME='pizza box'; const r=rect(x,y,f,.9,.9), c=[226,214,186]; return prop([fb(r,0,1,.1,1,0,3,c,null,(t,d)=>d<.2?c:hash(Math.floor(t*9),Math.floor(d*9),71)<.35?[222,150,50]:[236,196,90]),fb(r,0,1,.95,1,3,22,c,(s,t,z)=>s==='f'?sh(c,.92):c,()=>c,{foot:1})],null,{walk:true,flat:true}); }
  // THE PAPER BAG: brown, crumpled at the top
  function paperBag(x,y){ SHARED.PNAME='paper bag'; const r=rect(x,y,[0,1],.5,.4), c=[176,134,82]; return prop([fb(r,.1,.9,.1,.9,0,14,c,(s,t,z)=>z>10&&hash(Math.floor(t*12),z,73)<.4?sh(c,.8):worn(c,t,z,75),()=>sh(c,.9))]); }
  // THE TV: a 6-tile screen on a low black stand, a game box and a white speaker bar on the stand; its screen lit (a game paused)
  function tv(x,y,f=[-1,0]){ SHARED.PNAME='big TV'; const r=rect(x,y,f,6,.9), B=[], K=C.black, scr=art(6*24,60,(px,bx)=>{ bx(0,0,288,120,K); bx(4,4,284,112,lit([38,46,64])); bx(20,20,268,80,lit([60,90,130])); bx(40,30,120,60,lit([150,110,70])); bx(170,50,250,70,lit([80,160,100])); for(let i=0;i<9;i++)bx(30+i*28,96,50+i*28,104,lit([200,200,210])); });
    B.push(fb(r,0,1,0,1,0,10,K,(s,t,z)=>z<1?[20,20,22]:worn(K,t,z,77),()=>[44,44,48])); B.push(fb(r,.45,.55,.4,.6,10,14,K,null,null,{foot:1}));
    B.push(fb(r,.02,.98,.45,.55,14,74,K,onF(scr,60,()=>K),()=>K,{foot:1}));
    B.push(fb(r,.78,.92,.1,.35,10,16,K,(s,t,z)=>s==='f'&&z>2&&z<4&&t>.3&&t<.5?lit([80,200,120]):worn(K,t,z,79),()=>K,{foot:1}),fb(r,.1,.4,.1,.3,10,13,W,null,()=>WL,{foot:1}));
    const p=prop(B); LAMPS.push({own:1,room:1,x:r.cx+f[0]*1.2,y:r.cy+f[1]*1.2,z:44,r:3,c:[.5,.7,1],prop:p,day:true}); return p; }
  // THE WHITE SPEAKER: a tall thin column by the TV's end
  function speaker(x,y,f=[-1,0]){ SHARED.PNAME='tall speaker'; const r=rect(x,y,f,.4,.4); return prop([fb(r,.1,.9,.1,.9,0,34,W,(s,t,z)=>s==='f'&&z>4&&z<30&&(Math.floor(z/2)&1)&&Math.abs(t-.5)<.3?WD:white(81)(s,t,z),()=>WL)]); }
  // THE SMALL FRIDGE: white, a door with a handle, a lit panel
  function smallFridge(x,y,f=[-1,0]){ SHARED.PNAME='small fridge'; const r=rect(x,y,f,1,1); return prop([fb(r,0,1,0,1,0,58,W,(s,t,z)=>z<3?[110,110,116]:s==='f'&&t>.8&&t<.86&&z>20&&z<44?WD:s==='f'&&z>38&&z<40?WD:white(83)(s,t,z),(t,d)=>Math.min(t,1-t,d,1-d)<.04?WD:W)]); }
  // THE PALM: a terracotta pot, a stem, fronds (each a thin box rising out)
  function palm(x,y){ SHARED.PNAME='potted palm'; const r=rect(x,y,[0,1],.9,.9), B=[fb(r,.3,.7,.3,.7,0,14,POT,(s,t,z)=>z>11?sh(POT,1.2):z<2?sh(POT,.7):worn(POT,t,z,85),()=>[70,50,36]),fb(r,.46,.54,.46,.54,14,30,[110,90,50],null,null,{foot:1})];
    for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, dx=Math.cos(a)*.3, dy=Math.sin(a)*.3; B.push(fb(r,.5+dx-.06,.5+dx+.06,.5+dy-.06,.5+dy+.06,26+i%2*6,34+i%2*6,LEAF,(s,t,z)=>z>5?LEAFD:LEAF,()=>i%2?LEAFD:LEAF,{foot:1}),fb(r,.5+dx*.5-.05,.5+dx*.5+.05,.5+dy*.5-.05,.5+dy*.5+.05,30,40,LEAF,null,()=>LEAF,{foot:1})); }
    return prop(B); }
  // THE BOXES: three cardboard boxes, two on the floor and one on them, taped, a label each
  function boxes(x,y,f=[0,1]){ SHARED.PNAME='cardboard boxes'; const r=rect(x,y,f,1.4,1.3), bx=(t0,t1,d0,d1,z0,h,k)=>fb(r,t0,t1,d0,d1,z0,z0+h,CARD,(s,t,z,len)=>{ const c=worn(mt('crates',CARD),t,z,k); return s==='f'&&z>h*.3&&z<h*.5&&t>.15&&t<.4?[224,224,220]:Math.abs(t-.5)*len*FP<1?CARDD:c; },(t,d)=>Math.abs(t-.5)<.04?CARDD:sh(mt('crates',CARD),.92),{foot:z0>0?1:0});
    return prop([bx(0,.55,0,1,0,26,87),bx(.6,1,.1,.9,0,20,89),bx(.08,.5,.1,.9,26,22,91)]); }
  // THE FLOOR GRILLE: a dark iron grating let into the floor
  function grille(x,y,f=[0,1]){ SHARED.PNAME='floor grille'; const r=rect(x,y,f,1.5,1); return prop([fb(r,0,1,0,1,0,1,GRILL,null,(t,d,X,Y)=>{ const e=Math.min(t,1-t,d*1.5,(1-d)*1.5); return e<.05?[86,86,92]:((X*40|0)+(Y*40|0))%3===0?[26,26,30]:GRILL; })],null,{walk:true,flat:true}); }
  // THE ARCADE CABINET: a white candy cabinet 1.5 wide, 1.3 deep and 83 high, its trim pink (or green), a lit screen, a control panel with lit
  // buttons and two sticks, a kick plate, a marquee; the back and sides plain white with a vent
  function arcade(x,y,f=[0,1],green=0){ SHARED.PNAME=green?'arcade cabinet, green':'arcade cabinet, pink'; const r=rect(x,y,f,1.5,1.3), T=green?[110,220,80]:[236,70,160], TD=sh(T,.7), B=[];
    const front=art(36,83,(px,bx)=>{ bx(0,0,72,166,W); bx(0,150,72,166,[120,120,126]); bx(4,154,68,160,[80,80,86]); bx(0,0,72,4,T); bx(0,4,3,166,TD); bx(69,4,72,166,TD);   // the body, the kick, the trim
      bx(6,10,66,24,lit([250,240,230])); bx(10,13,62,21,lit(T));                                                                                             // the marquee
      bx(8,30,64,86,[20,20,24]); bx(12,34,60,82,lit([40,48,72])); bx(16,38,56,50,lit([90,140,200])); bx(18,60,32,78,lit([230,120,80])); bx(40,58,54,78,lit([120,200,120])); bx(16,52,56,54,lit([240,240,120]));   // the screen: two fighters
      bx(6,92,66,112,[200,202,208]); bx(6,92,66,95,[228,228,232]); for(const cx of [20,52]){ bx(cx-2,98,cx+2,110,[60,60,66]); bx(cx-4,96,cx+4,100,[30,30,34]); }   // the panel, the sticks
      for(let i=0;i<3;i++){ bx(26+i*6,100,30+i*6,104,lit(T)); bx(26+i*6,106,30+i*6,110,lit([240,220,80])); }                                             // the buttons
      bx(6,118,66,146,[214,216,222]); bx(10,122,62,142,W); });
    B.push(fb(r,0,1,0,1,0,83,W,onF(front,83,(s,t,z)=>z<4?[120,120,126]:s==='b'&&z>50&&z<70&&(Math.floor(z/2)&1)?WD:white(93)(s,t,z)),(t,d)=>d>.6?W:WL));
    B.push(fb(r,0,1,0,.4,83,88,W,(s,t,z)=>s==='f'?lit(T):W,()=>WL,{foot:1}));   // the top's lip, lit pink in front
    const p=prop(B); LAMPS.push({own:1,room:1,x:r.cx+f[0]*1,y:r.cy+f[1]*1,z:50,r:2.4,c:green?[.5,1,.6]:[1,.5,.8],prop:p,day:true}); return p; }
  // THE LITTLE RED STOOL: a red padded square on four chrome legs
  function redStool(x,y){ SHARED.PNAME='red stool'; const r=rect(x,y,[0,1],.7,.5), B=[fb(r,0,1,0,1,13,19,C.red,(s,t,z)=>z<2?C.redD:z>4?C.redL:C.red,(t,d)=>Math.min(t,1-t,d*1.4,(1-d)*1.4)<.06?C.redD:C.red)];
    for(const [a,b,c,d] of [[.05,.12,.08,.22],[.88,.95,.08,.22],[.05,.12,.78,.92],[.88,.95,.78,.92]])B.push(fb(r,a,b,c,d,0,13,C.chrome,(s,t,z)=>metal(C.chrome,t,z),null,{foot:1})); return prop(B); }
  const K={'white sofa':(x,y)=>sofa(x,y),'backpack':(x,y)=>backpack(x,y),'white coffee table':(x,y)=>coffeeTable(x,y),'pizza box':(x,y)=>pizzaBox(x,y),'paper bag':(x,y)=>paperBag(x,y),'big TV':(x,y)=>tv(x,y),'tall speaker':(x,y)=>speaker(x,y),
    'small fridge':(x,y)=>smallFridge(x,y),'cardboard boxes':(x,y)=>boxes(x,y),'floor grille':(x,y)=>grille(x,y),'arcade cabinet, pink':(x,y)=>arcade(x,y,[0,1],0),'arcade cabinet, green':(x,y)=>arcade(x,y,[0,1],1),'red stool':(x,y)=>redStool(x,y)};
  const I={'white sofa':['L-010',1400,'A white three-seater, two loose cushions.','leatherette'],'backpack':['L-011',60,'A khaki backpack left leaning.','canvas'],'white coffee table':['L-012',180,'A low white table with cups, a bottle of sauce and a slice of pizza.','lacquered wood'],
    'pizza box':['L-013',14,'An open pizza box, the last slices in it.','cardboard'],'paper bag':['L-014',1,'A brown paper bag, crumpled.','paper'],'big TV':['L-015',1600,'A big flat screen on a low black stand, a games box and a speaker bar on it; the screen glows.','glass, plastic'],
    'tall speaker':['L-016',320,'A tall white speaker column.','plastic'],'small fridge':['L-017',260,'A small white fridge.','steel'],'cardboard boxes':['L-019',6,'Three cardboard boxes, taped, stacked.','cardboard'],'floor grille':['L-020',90,'An iron grating let into the floor.','iron'],
    'arcade cabinet, pink':['L-021',2400,'A white candy cabinet with pink trim, two sticks and six buttons; its screen glows.','steel, plastic'],'arcade cabinet, green':['L-022',2400,'A white candy cabinet with green trim; its screen glows.','steel, plastic'],'red stool':['L-023',40,'A little red padded stool on chrome legs.','vinyl, chrome']};
  for(const k in K){ if(CATALOG[k])continue; CATALOG[k]=K[k]; KIND_OF[k]=k; const [no,price,desc,mat]=I[k]; CAT_INFO[k]={no,name:k.replace(/\b\w/g,c=>c.toUpperCase()),dept:'lounge',price,desc,mat}; }
  if(!CAT_DEPTS.some(d=>d[0]==='lounge'))CAT_DEPTS.push(['lounge','Lounge']);
  Object.assign(MLK,{sofa,backpack,coffeeTable,pizzaBox,paperBag,tv,speaker,smallFridge,palm,boxes,grille,arcade,redStool});
};
export {loungePieces};
