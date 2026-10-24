// THE WITCH'S BEDROOM KIT: the old game's room, its pieces as catalog kinds; loads with the old rooms' kits on the first jump.
import {CAT_DEPTS, CAT_INFO, CATALOG, hash, KIND_OF, LAMPS, LBLD, LIFE, mt, prop, sh, sided, speck, STORY, T, zShift} from './014-gamekit.js';
import {SQLV} from './023-west-kits.js';
const witchBedroom=()=>{ '@oldkits';
// =====================================================================================
// THE WITCH'S BEDROOM (owner, 15 Oct 2026, her picture: "create walkable scene of this room, html5 graphics only (no actual image) each
// object its own thing, rotating room 4 angles"). A small bedroom of its own out in the blackness below the crystal cavern (LBLD 'lwitch',
// 21-world-map-5-land: off the map, the map tab's jump list takes you there), 9.8 by 7.4 inside and 96 art px high (a ceiling about 3.3 m
// up, as the picture's tall window and hanging vines want), every piece drawn by hand in code from the picture (the picture a guide for
// shape and colour only, as the owner's rules have it: nothing cut from it). Here its look: the walls, striped wallpaper in two plums with
// a dark skirting; on the back wall the tall window in its red frame (the night sky through it: a deep blue crossed by paler bands of
// cloud, stars, one lit window far off; the red curtains either side are things of their own, part 2), and the pothos vines trailing down from the ceiling along the
// left wall and the back; the floor, honey boards running along the room. Its things, each a catalog item at real size, and the room laid
// out as the picture has it: 23-w-witch-bedroom-2-things. The girl reading on the bed is a character, not the world, so she is left out
// (the player takes her place); the room is drawn as she would find it.
// =====================================================================================
// ON THE SQUARE'S 4TH FLOOR (owner, 16 Oct 2026: "witch gets 4"): the whole floor hers (21-world-map-5-land's SQLV), 14.8 by 6.8 inside, up to its ceiling;
// her room as it was set in its west 9 tiles (the elevator's shaft past it), squeezed a tenth along and a twelfth across (26-zzz-witch-placed's u)
const WRB=LBLD[1];
const WR={b:WRB,lv:SQLV.witch,x0:WRB.x0+T,y0:WRB.y0+T,x1:WRB.x1-T,y1:WRB.y1-T,H:STORY-8,cx:WRB.x0+4.5,cy:(WRB.y0+WRB.y1)/2,in:[WRB.x0-T,WRB.y0-T,WRB.x1+T,WRB.y1+T]};
const WRC={plum:[56,42,82],plumL:[70,54,100],plumD:[40,30,62],skirt:[34,24,46],board:[222,158,64],boardL:[232,172,76],boardD:[208,142,54],seam:[180,116,40],
  sky:[36,58,118],skyL:[66,104,160],skyB:[92,140,190],star:[226,236,255],frame:[160,38,44],frameD:[96,22,30],frameL:[200,70,70],sill:[120,32,40],
  curt:[206,40,52],curtD:[156,24,40],curtL:[238,78,78],leaf:[92,160,58],leafL:[140,204,86],leafD:[58,110,42],stem:[70,112,46],far:[250,214,120]};
const wrLit=c=>Object.assign([...c],{e:1});   // a colour that glows: never shaded (the stars, the candle, the lamp's bloom)
// a pothos leaf: a heart of three greens pointing down, drawn on a wall picture at c, q (fine px), s its size (1 or 2), flipped or not
function wrLeaf(g,c,q,s,fl){ const rows=['.LLL.LLL.','LLLlLlLLL','LLLLLLLLL','.DLLLLLD.','..DLLLD..','...DLD...','....D....'], P={L:WRC.leaf,l:WRC.leafL,D:WRC.leafD};
  rows.forEach((r,j)=>[...r].forEach((k,i)=>{ if(k==='.')return; const col=P[k]; for(let a=0;a<s;a++)for(let b=0;b<s;b++)g.px(c+(fl?-i:i)*s+a,q-j*s-b,col); })); }
// a vine: a stem wandering from c, q along dc, dq (fine px a step) for n steps, drooping, a leaf every few steps alternating sides
function wrVine(g,c,q,dc,dq,n,s,size=2){ for(let i=0;i<n;i++){ c+=dc+Math.sin(i*.5+s)*.5; q+=dq-Math.abs(Math.sin(i*.3+s))*.4; g.px(c,q,WRC.stem); g.px(c,q-1,WRC.stem);
    if(i%9===4)wrLeaf(g,c+(i%18<9?2:-2),q-2,size,i%18>=9); } }
// THE WALL PICTURES (bedCanvas, 23-w-bedroom: c along the wall from its back end in fine px, 48 a tile; q up from the floor, 2 an art px)
const WRART={
  // the left wall (its x0 face): the vines trailing down from the ceiling over its back half, where the shelf hangs
  left:bedCanvas(Math.round((WR.y1-WR.y0)*48),WR.H*2,g=>{ const H=WR.H*2;
    wrVine(g,28,H-2,.9,-1.6,40,1); wrVine(g,46,H-2,-.3,-2.2,46,2); wrVine(g,64,H-2,1.2,-1.4,54,3); wrVine(g,88,H-2,.2,-2.6,36,4); wrVine(g,110,H-2,-.8,-1.8,30,5);
    wrVine(g,130,H-2,1,-2,44,6); wrVine(g,150,H-2,-.4,-1.5,26,7); wrVine(g,166,H-2,.6,-2.4,50,8); wrVine(g,18,H-2,-.2,-1.2,30,9); }),
  // the back wall (its y0 face): the window in its red frame, the sky through it, vines down from the ceiling
  back:bedCanvas(Math.round((WR.x1-WR.x0)*48),WR.H*2,g=>{ const H=WR.H*2, c=WRC, c0=4.14*48, c1=8.37*48, q0=30*2, q1=88*2;
    // the sky: deep blue, paler bands of cloud sloping up to the right (stepped a pixel at a time), stars, a lit window far off
    g.box(c0,q0,c1,q1,c.sky);
    for(let q=q0;q<q1;q++)for(let cc=c0;cc<c1;cc++){ const d=(cc-c0)*.55+(q-q0); const m=((d%64)+64)%64; if(m<9)g.px(cc,q,c.skyL); else if(m<13)g.px(cc,q,c.skyB); else if(m>58)g.px(cc,q,c.skyL); }
    for(let k=0;k<34;k++){ const cc=c0+6+hash(k,1,1601)*(c1-c0-12), q=q0+6+hash(k,2,1601)*(q1-q0-12); g.px(cc,q,wrLit(c.star)); if(k%4===0){ g.px(cc+1,q,wrLit(c.star)); g.px(cc,q+1,wrLit(c.star)); } }
    g.box(c0+150,q0+56,c0+158,q0+76,wrLit(c.far)); g.box(c0+153,q0+56,c0+155,q0+76,wrLit([226,180,90]));
    // the frame: a dark outline, red bars, a lighter edge along the top of each, a cross bar and an upright
    const bar=(a0,b0,a1,b1)=>{ g.box(a0-2,b0-2,a1+2,b1+2,c.frameD); g.box(a0,b0,a1,b1,c.frame); g.box(a0,b1-2,a1,b1,c.frameL); };
    bar(c0-10,q0-6,c1+10,q0+2); bar(c0-10,q1-2,c1+10,q1+6); bar(c0-10,q0-6,c0-2,q1+6); bar(c1+2,q0-6,c1+10,q1+6); bar(c0+108,q0,c0+116,q1); bar(c0,q0+62,c1,q0+70);
    g.box(c0-14,q0-10,c1+14,q0-6,c.sill); g.box(c0-14,q0-6,c1+14,q0-4,[150,44,52]);   // the sill
    wrVine(g,12,H-2,.8,-2,40,11); wrVine(g,40,H-2,-.5,-1.6,30,12); wrVine(g,70,H-2,1,-2.4,46,13); wrVine(g,100,H-2,.3,-1.8,34,14); wrVine(g,130,H-2,-.6,-2.2,38,15);
    wrVine(g,160,H-2,.9,-1.5,28,16); wrVine(g,c1+60,H-2,-.4,-2,30,17); wrVine(g,c1+30,H-2,.5,-1.6,24,18); })};
// a wall's colour inside (facadeCol, 22): q the building, the face's normal, the point, z from the floor, f its shade. Striped paper in two
// plums, a stripe a third of a tile wide (8 art px), a speck here and there; the dark skirting at the foot
function witchWall(q,nx,ny,X,Y,z,f){ const R=WR, e=.06, Q=z*2, c=WRC; let w=null, cc=0;
  if(nx>0&&Math.abs(X-R.x0)<e){ w='left'; cc=(Y-R.y0)*48; } else if(ny>0&&Math.abs(Y-R.y0)<e){ w='back'; cc=(X-R.x0)*48; }
  if(w){ const a=WRART[w](cc,Q); if(a)return a.e?a:sh(a,f); }
  if(z<3)return sh(c.skirt,f*(z<1?.8:1));
  const u=nx?Y:X, s=Math.floor(u*3+(ny?0:1)), odd=((s%2)+2)%2, n=hash(Math.floor(u*24),Math.floor(z),1603);
  const base=odd?c.plumL:c.plum; return sh(n<.02?c.plumD:n>.985?sh(base,1.08):base,f); }
// THE FLOOR: honey boards running along the room (x), 0.42 wide, each a shade of its own, a darker seam between them, their ends staggered
function witchFloorCol(x,y){ const u=x-WR.x0, v=y-WR.y0, j=Math.floor(v/.42), L=1.2+hash(j,0,1605)*1, o=hash(j,1,1605)*L, k=Math.floor((u+o)/L), c=WRC;
  if(v-j*.42<1/48)return mt('wood',c.seam);
  if((u+o)-k*L<1/48)return mt('wood',sh(c.seam,.92));
  const n=hash(j,k,1607); return mt('wood',speck(n<.33?c.board:n<.66?c.boardL:c.boardD,x,y,1609)); }

// =====================================================================================
// THE WITCH'S BEDROOM, part 2: its furniture, each piece a catalog item at real size (the walker is about 50 art px tall, a tile 24 along a
// face), boxes whose faces are painted by hand from the picture (sided, 22): the bed (a low dark frame, the magenta spread hanging in
// scallops, two cream pillows printed with little leaves, the cat cushion; its headboard a low bookcase with a row of books standing on it
// and the purple moon book lying by them), the bedside table (a drawer with a brass knob), the fortune table under its teal cloth, the
// crystal ball on its brass ring, the fairy sprout (a little plant whose buds glow), the three picture frames, the candle on its saucer
// (its flame flickers as the mood candles' do), the wall shelf and its books, the red curtains, the dark red ledge under the window,
// the plants in their terracotta pots (a bushy one, a cactus with pink buds, a small one), the bloom lamp (a tall stand with a glowing
// yellow flower at its top), and the broom. The floor things, the catalog and the room laid out: part 3.
// =====================================================================================
const WFC={wood:[104,58,46],woodL:[138,84,58],woodD:[74,40,34],spread:[162,34,104],spreadD:[128,22,84],spreadL:[184,52,122],pillow:[242,226,198],pillowD:[214,194,164],
  print:[160,96,40],printG:[110,150,60],cushion:[42,38,48],white:[236,236,240],brass:[222,178,78],brassD:[160,120,48],cloth:[38,112,102],clothD:[28,86,80],clothL:[62,150,136],
  ball:[204,208,236],ballL:[244,246,255],ballD:[160,164,210],pot:[178,72,40],potL:[206,96,54],potD:[130,50,30],leaf:[92,160,58],leafL:[140,204,86],leafD:[58,110,42],
  cact:[76,150,70],cactL:[110,186,96],cactD:[52,112,50],bud:[222,66,170],bloom:[255,222,96],bloomD:[236,170,50],broom:[200,152,84],straw:[216,176,84],strawD:[186,140,58],
  curt:[206,40,52],curtD:[156,24,40],curtL:[238,78,78],ledge:[112,30,42],ledgeD:[88,20,32],ledgeL:[140,42,56],wax:[236,226,202],frameO:[216,112,40],frameOD:[160,72,24],
  frameP:[72,44,110],frameR:[200,60,60],cream:[244,232,206]};
// a box whose faces are painted: f(nx, ny, u, z, h, k, X, Y) gives a colour (shaded unless lit), null for the body colour with its bevel
// (a light top row, a dark foot, the odd speck), or false for nothing (a hole); top(X, Y) the top (the body colour lightened by default)
const WB=(x0,y0,x1,y1,z0,z1,c,o={})=>sided({x0,y0,x1,y1,z0,z1,c,foot:z0===0?1:0,top:o.top||(()=>sh(c,1.12)),...(o.x||{}),
  fs:(nx,ny,X,Y,z,k)=>{ const h=z1-z0, u=nx?Y-y0:X-x0, r=o.f?o.f(nx,ny,u,z,h,k,X,Y):null; if(r===false)return null; if(r)return r.e?r:sh(r,k);
    const n=hash(Math.floor((nx?Y:X)*24),Math.floor(z),1611); return sh(z>h-1.5?sh(c,1.15):z<1?sh(c,.82):n<.03?sh(c,.92):c,k); }});
// a rounded block (an octagon's footprint): two boxes crossed, hx, hy its half sizes, d the corners cut
const WO=(B,cx,cy,hx,hy,d,z0,z1,c,o)=>{ B.push(WB(cx-hx,cy-hy+d,cx+hx,cy+hy-d,z0,z1,c,o),WB(cx-hx+d,cy-hy,cx+hx-d,cy+hy,z0,z1,c,o)); };
// a disc's top: the colour within the ellipse at cx, cy, nothing outside it
const wDisc=(cx,cy,rx,ry,col)=>(X,Y)=>((X-cx)/rx)**2+((Y-cy)/ry)**2>1?null:typeof col==='function'?col(X,Y):col;
// a piece lifted dz art px (its boxes and its lights): a thing set on a table or a crate
function wLift(p,dz){ if(!dz)return p; p.boxes=p.boxes.map(b=>zShift(b,dz)); for(const l of LAMPS)if(l.prop===p)l.z+=dz; return p; }
// a row of books standing along y from y0 (or along x from x0 when ax): each its own colour, thickness and height, a pale page edge on top
function wBooks(B,x0,y0,z0,n,ax,seed){ const C=[[150,40,44],[48,96,112],[120,36,56],[196,150,96],[70,60,120],[40,110,90],[200,170,60],[90,30,30]]; let at=0;
  for(let i=0;i<n;i++){ const t=.1+.05*hash(i,1,seed), h=12+Math.round(6*hash(i,2,seed)), c=C[Math.floor(hash(i,3,seed)*C.length)], d=.28+.04*hash(i,4,seed);
    const bx=ax?[x0+at,y0,x0+at+t,y0+d]:[x0,y0+at,x0+d,y0+at+t];
    B.push(WB(bx[0],bx[1],bx[2],bx[3],z0,z0+h,c,{top:()=>[232,222,196],f:(nx,ny,u,z,hh,k)=>{ const spine=ax?!!ny:!!nx; if(!spine)return z>1&&z<hh-1&&(Math.floor(u*24)+Math.floor(z))%2?[232,222,196]:[200,190,166];
      return z>hh-3||z<2?sh(c,.8):Math.floor(z)%6===3&&u*24>1?sh(c,1.25):null; }})); at+=t+.01; } }
// THE BED: its head against a wall along y (x0 its head end). A dark frame on four feet, the magenta spread over the mattress hanging to
// a scalloped hem, the frame's dark showing under the scallops; the two pillows (cream, rounded, little leaves printed on them: a brown
// dot with a green tip); the cat cushion at the foot (a dark square: a white cat and a black cat curled together on it); the headboard
// a low bookcase, books standing in a row on it and the moon book lying flat (purple, a gold crescent)
function witchBed(x,y){ PNAME='witch bed'; const c=WFC, B=[], L=2.5, W=1.8, x0=x, y0=y, x1=x+L, y1=y+W;
  for(const [a,b] of [[x0+.5,y0+.05],[x1-.2,y0+.05],[x0+.5,y1-.2],[x1-.2,y1-.2]])B.push(WB(a,b,a+.15,b+.15,0,8,c.woodD));
  B.push(WB(x0+.45,y0,x1,y1,6,14,c.wood,{top:()=>c.woodL}));
  const hem=(u,z)=>z<3+2.5*Math.abs(Math.sin(u*24/5.5*Math.PI/2));   // the scallops: the spread ends short of the floor in a wavy line
  B.push(WB(x0+.42,y0-.03,x1+.03,y1+.03,4,22,c.spread,{top:(X,Y)=>{ const n=hash(Math.floor(X*24),Math.floor(Y*24),1621); return n<.03?c.spreadD:n>.97?c.spreadL:c.spread; },
    f:(nx,ny,u,z,h,k)=>{ if(hem(u,z))return false; const fold=Math.floor(u*24/4)%3; return z>h-2?c.spreadL:fold===0?c.spreadD:fold===2?c.spreadL:null; }}));
  // the pillows: rounded, printed; a dark seam where their cases open at the wall end
  const pillow=(py)=>WO(B,x0+.78,py,.3,.36,.08,22,30,c.pillow,{top:(X,Y)=>{ const i=Math.floor(X*24/5), j=Math.floor(Y*24/5), n=hash(i,j,1623), a=Math.floor(X*24)%5, b=Math.floor(Y*24)%5;
      if(n<.5){ if(a===2&&b>=2&&b<=3)return c.print; if(a===3&&b===1)return c.printG; } return c.pillow; },
    f:(nx,ny,u,z,h,k)=>z<1?c.pillowD:z>h-1.5?[250,240,216]:(Math.floor(u*24)%7===3&&z>2&&z<5)?c.print:null});
  pillow(y0+.42); pillow(y1-.42);
  // the cat cushion
  B.push(WB(x1-.72,y0+.7,x1-.22,y0+1.2,22,27,c.cushion,{top:(X,Y)=>{ const a=(X-(x1-.47))*24, b=(Y-(y0+.95))*24; if(Math.abs(a)>5||Math.abs(b)>5)return [60,56,66];
      const dw=Math.hypot(a+1.5,b-.5), dk=Math.hypot(a-2.5,b+1.5); if(dw<3.2)return dk<1.2?[30,28,34]:c.white; if(dk<2.6)return [26,24,30]; return [60,56,66]; }}));
  // the headboard bookcase, its row of books and the moon book
  B.push(WB(x0,y0-.05,x0+.45,y1+.05,0,30,c.wood,{top:()=>c.woodL,f:(nx,ny,u,z,h,k)=>nx>0&&z>4&&z<26&&u>.08&&u<W+.02?[58,32,28]:null}));
  B.push(WB(x0,y0-.05,x0+.45,y1+.05,30,32,c.woodL));
  wBooks(B,x0+.08,y0+.55,32,8,0,1625);
  B.push(WB(x0+.06,y0+.08,x0+.4,y0+.4,32,36,[120,40,120],{top:(X,Y)=>{ const a=(X-(x0+.23))*24, b=(Y-(y0+.24))*24, r=Math.hypot(a,b), r2=Math.hypot(a-1.2,b-.6); return r<2.6&&r2>2.2?c.brass:[132,46,132]; },
    f:(nx,ny,u,z)=>z<1?[90,26,90]:z>2.5?[150,60,150]:[236,226,196]}));
  return prop(B); }
// THE BEDSIDE TABLE: against a wall along y, a drawer in its x1 face with a brass knob, four turned feet; 0.9 by 0.65, 26 high
function bedsideTable(x,y){ PNAME='bedside table'; const c=WFC, B=[], x1=x+.65, y1=y+.9;
  for(const [a,b] of [[x+.04,y+.05],[x1-.14,y+.05],[x+.04,y1-.15],[x1-.14,y1-.15]])B.push(WB(a,b,a+.1,b+.1,0,10,c.woodD));
  B.push(WB(x+.02,y+.02,x1,y1,10,24,c.wood,{f:(nx,ny,u,z,h,k)=>{ if(nx>0){ if(z>3&&z<11&&u>.08&&u<.82){ const kn=Math.abs(u-.45)<.03&&z>6&&z<8.5; return kn?c.brass:z<4||z>10||u<.1||u>.8?c.woodD:null; } return null; }
      return z>h-2?c.woodL:null; }}));
  B.push(WB(x,y,x1+.02,y1+.02,24,26,c.woodL,{top:()=>c.woodL}));
  return prop(B); }
// THE FORTUNE TABLE: a small dark table under a teal cloth that hangs over its edges in folds, not quite to the floor; 1.2 by 0.9, 24 high
function fortuneTable(x,y){ PNAME='fortune table'; const c=WFC, B=[], x1=x+.9, y1=y+1.2;
  for(const [a,b] of [[x+.08,y+.1],[x1-.2,y+.1],[x+.08,y1-.2],[x1-.2,y1-.2]])B.push(WB(a,b,a+.12,b+.12,0,22,c.woodD));
  B.push(WB(x,y,x1,y1,22,24,c.wood));
  B.push(WB(x-.06,y-.06,x1+.06,y1+.06,8,25,c.cloth,{top:(X,Y)=>{ const n=hash(Math.floor(X*24/3),Math.floor(Y*24/3),1627); return n<.12?c.clothD:n>.9?c.clothL:c.cloth; },
    f:(nx,ny,u,z,h,k)=>{ const drop=2+3*hash(Math.floor(u*24/6),0,1629); if(z<drop)return false; const fold=Math.floor(u*24/5)%3; return z>h-1?c.clothL:fold===0?c.clothD:fold===2?c.clothL:null; }}));
  return prop(B); }
// THE CRYSTAL BALL: a glass sphere on a brass ring (stepped rounds, a bright highlight up its left); it glows faintly
function crystalBall(x,y){ PNAME='crystal ball'; const c=WFC, B=[]; WO(B,x,y,.17,.17,.05,0,2,c.brass,{top:()=>c.brassD});
  const g=(col,f)=>wrLit(sh(col,f));   // (it glows softly: its own rounds would shadow its faces otherwise, and in the picture it is the palest thing in the room)
  const sph=(hw,z0,z1,d)=>WO(B,x,y,hw,hw,d,z0,z1,c.ball,{top:wDisc(x,y,hw,hw,(X,Y)=>X-x<-hw*.3&&Y-y<-hw*.3?g(c.ballL,.9):g(c.ball,.8)),f:(nx,ny,u,z,h,k,X,Y)=>{ const t=(nx?Y-y:X-x)/hw; return t<-.25&&t>-.7&&z>h*.3?g(c.ballL,.85):t>.6?g(c.ballD,.6):g(c.ball,k>.8?.72:.62); }});
  sph(.1,2,4,.03); sph(.14,4,7,.04); sph(.16,7,13,.05); sph(.14,13,16,.04); sph(.09,16,18,.03);
  return prop(B); }
// THE FAIRY SPROUT: a little plant in a tiny pot, a few leaves on a thin stem, three buds that glow (a small warm light)
function fairySprout(x,y){ PNAME='fairy sprout'; const c=WFC, B=[]; WO(B,x,y,.1,.1,.03,0,4,c.pot,{top:()=>[70,46,30]});
  B.push(WB(x-.012,y-.012,x+.012,y+.012,4,16,[70,112,46]));
  for(const [dx,dy,z] of [[.06,0,8],[-.06,.02,11],[.02,-.07,13]])B.push(WB(x+dx-.05,y+dy-.03,x+dx+.05,y+dy+.03,z,z+2,c.leaf,{top:()=>c.leafL}));
  for(const [dx,dy,z] of [[.08,.03,15],[-.07,-.04,17],[0,.08,19]])B.push(WB(x+dx-.025,y+dy-.025,x+dx+.025,y+dy+.025,z,z+2,c.bloom,{top:()=>wrLit([255,236,150]),f:()=>wrLit([255,210,90])}));
  const p=prop(B); LAMPS.push({x,y,z:18,r:1.6,c:[.7,.5,.2],own:1,room:1,day:true,in:WR.in,prop:p}); return p; }
// THE PICTURE FRAMES, standing against a wall (their backs to x0, their fronts the +x face), each a thin box: the big orange one in an
// ornate border round a dark portrait (a face in the dark with a red mouth), the purple one with a white star, the small red one on cream
function pictureFrame(x,y,kind){ PNAME=kind==='star'?'star frame':kind==='small'?'small frame':'ornate frame'; const c=WFC, w=kind==='ornate'?.5:kind==='star'?.34:.28, h=kind==='ornate'?20:kind==='star'?12:10, B=[];
  const face=(u,z)=>{ const a=u*24, b=z, ea=Math.min(a,w*24-a), eb=Math.min(b,h-b), e=Math.min(ea,eb);
    if(kind==='ornate'){ if(e<1)return c.frameOD; if(e<3)return (Math.floor(a)+Math.floor(b))%2?c.frameO:c.frameOD; const fa=a-w*12, fb=b-h/2; if(Math.hypot(fa,fb*1.2)<3.5)return Math.abs(fb-1.2)<.6&&Math.abs(fa)<1.2?[210,60,70]:[70,44,60]; return hash(Math.floor(a),Math.floor(b),1631)<.05?[200,190,220]:[44,32,64]; }
    if(kind==='star'){ if(e<1.2)return [120,80,150]; if(e<2)return c.frameP; const fa=Math.abs(a-w*12), fb=Math.abs(b-h/2); return fa+fb<2.2||(fa<.8&&fb<2.8)||(fb<.8&&fa<2.8)?c.white:[60,36,96]; }
    if(e<1)return c.frameR; if(e<2)return c.cream; const fa=a-w*12, fb=b-h/2; return Math.hypot(fa,fb)<2?[210,50,60]:[236,214,196]; };
  B.push(WB(x,y,x+.04,y+w,0,h,c.frameOD,{top:()=>c.frameOD,f:(nx,ny,u,z)=>nx>0?face(u,z):null}));
  return prop(B); }
// THE CANDLE on its saucer: cream wax, its rim melted down, a wick, and its flame: a moving picture (drawn only in the life layer, a
// step at a time, as the mood candles' are: 23-w-studio-mood), its small warm light
const WFLH=[3,4,4,3,2,4,3,4];
function saucerCandle(x,y){ PNAME='saucer candle'; const c=WFC, B=[], FL={ph:0}, seed=Math.round(x*7+y*13); WO(B,x,y,.16,.16,.05,0,1,c.cream,{top:wDisc(x,y,.16,.16,(X,Y)=>Math.hypot(X-x,Y-y)>.12?[220,206,176]:c.cream)});
  B.push(WB(x-.05,y-.05,x+.05,y+.05,1,12,c.wax,{top:()=>[200,186,160],f:(nx,ny,u,z,h)=>z>h-2?sh(c.wax,.86):hash(Math.floor(u*24),Math.floor(z),1635)<.12?sh(c.wax,1.06):null}));
  B.push(WB(x-.012,y-.012,x+.012,y+.012,12,13,[30,26,24]));
  B.push(sided({x0:x-.03,y0:y-.03,x1:x+.03,y1:y+.03,z0:13,z1:18,c:[255,200,90],foot:1,nb:1,life:1,top:()=>null,fs:(nx,ny,X,Y,z,k)=>{ if(typeof LIFE==='undefined'||LIFE.mode!==1)return null;
    const ph=FL.ph, hh=WFLH[ph]; if(z>=hh)return null; const tt=(nx?Y-y:X-x)/.06+.5; if(ph%3===1&&z>=hh-1&&tt<.5)return null; return wrLit(z<1?[255,236,190]:z<hh-1?[255,190,74]:[246,128,40]); }}));
  const p=prop(B); p.life=t=>{ FL.ph=Math.floor(hash(Math.floor(t*7),seed,425)*8); }; p.lifeKey=()=>FL.ph;
  LAMPS.push({x,y,z:16,r:2.8,c:[.72,.4,.15],own:1,room:1,day:true,in:WR.in,prop:p}); return p; }
// THE WALL SHELF: a dark plank along y on two brackets, hung 58 art px up a wall (x0 at the wall), five books standing on it
function wallShelf(x,y){ PNAME='wall shelf'; const c=WFC, B=[];
  B.push(WB(x,y,x+.42,y+2.2,58,61,c.wood,{top:()=>c.woodL,x:{foot:1}}));
  for(const by of [y+.3,y+1.7]){ B.push(WB(x,by,x+.3,by+.08,52,58,c.woodD),WB(x,by,x+.18,by+.08,48,52,c.woodD)); }
  wBooks(B,x+.08,y+.12,61,5,0,1633);
  return prop(B,null,{hang:48,walk:true,high:true}); }
// A RED CURTAIN: hung from the ceiling beside the window (0.7 along x, thin), velvet red in folds, gathered in toward the floor
function redCurtain(x,y){ PNAME='red curtain'; const c=WFC, B=[], H=WR.H-2;
  const fold=(u,z,h)=>{ const w=z<24?.4+.6*z/24:1, mid=.35, a=(u-mid)/w+mid; if(a<0||a>.7)return false; const f=Math.floor(a*24/3)%3; return f===0?c.curtD:f===1?c.curt:c.curtL; };
  B.push(WB(x,y,x+.7,y+.14,8,H,c.curt,{top:()=>c.curtD,x:{foot:1},f:(nx,ny,u,z,h)=>ny?fold(u,z,h):z<24?false:null}));
  return prop(B,null,{hang:8,walk:true,high:true}); }
// THE WINDOW LEDGE: the low dark red cabinet under the window (along x, 0.5 deep, 30 high), two panels in its front, a lighter top
function windowLedge(x,y,L=4.9){ PNAME='window ledge'; const c=WFC, B=[];
  B.push(WB(x,y,x+L,y+.5,0,28,c.ledge,{f:(nx,ny,u,z,h)=>{ if(ny<=0)return null; const a=u*24, s=L*24/2, pa=a%s; return z>4&&z<24&&pa>4&&pa<s-4?(z<6||z>22||pa<6||pa>s-6?c.ledgeD:null):null; }}));
  B.push(WB(x-.02,y-.02,x+L+.02,y+.52,28,30,c.ledgeL,{top:()=>c.ledgeL}));
  return prop(B); }
// A TERRACOTTA POT: a stepped round, a rim, dark earth on top; hw its half width
function wPot(B,x,y,hw,h){ const c=WFC; WO(B,x,y,hw*.8,hw*.8,hw*.25,0,h*.3,c.potD); WO(B,x,y,hw*.9,hw*.9,hw*.28,h*.3,h*.8,c.pot,{top:()=>c.pot}); WO(B,x,y,hw,hw,hw*.3,h*.8,h,c.potL,{top:wDisc(x,y,hw,hw,(X,Y)=>Math.hypot(X-x,Y-y)>hw*.75?c.potL:[70,46,30])}); }
// THE PLANTS: a bushy one (a round mass of leaves in three greens, ragged at its edges), a cactus (a ribbed green column with two arms and
// pink buds at its tops), a small one (a few leaves on stems)
function leafMass(B,x,y,hw,z0,z1,seed){ const c=WFC, lf=(u,z,h)=>{ const n=hash(Math.floor(u*24/2),Math.floor(z/2),seed); if((z>h-4||z<2)&&n<.5)return false; return n<.3?c.leafD:n<.55?c.leaf:n<.7?c.leafL:n<.76?false:c.leaf; };
  WO(B,x,y,hw,hw,hw*.35,z0,z1,c.leaf,{top:wDisc(x,y,hw,hw,(X,Y)=>{ const n=hash(Math.floor(X*24/2),Math.floor(Y*24/2),seed+1); return n<.3?c.leafD:n<.6?c.leaf:c.leafL; }),f:(nx,ny,u,z,h)=>lf(u,z,h)}); }
function pottedPlant(x,y,kind='bush'){ PNAME=kind==='cactus'?'cactus pot':kind==='small'?'small plant':'bushy plant'; const c=WFC, B=[], seed=Math.round(x*5+y*7);
  if(kind==='bush'){ wPot(B,x,y,.22,9); leafMass(B,x,y,.42,9,30,1641+seed); leafMass(B,x+.06,y-.04,.3,30,38,1643+seed); }
  else if(kind==='cactus'){ wPot(B,x,y,.2,8); const rib=(u,z,h)=>{ const r=Math.floor(u*24)%4; return z>h-1?c.cactL:r===0?c.cactD:r===2?c.cactL:null; };
    WO(B,x,y,.12,.12,.04,8,30,c.cact,{top:()=>c.cactL,f:(nx,ny,u,z,h)=>rib(u,z,h)}); WO(B,x+.17,y+.02,.07,.07,.02,16,27,c.cact,{f:(nx,ny,u,z,h)=>rib(u,z,h)}); WO(B,x-.16,y-.03,.06,.06,.02,14,23,c.cact,{f:(nx,ny,u,z,h)=>rib(u,z,h)});
    for(const [dx,dy,z] of [[.02,-.04,30],[-.05,.05,29],[.17,.02,27],[-.16,-.03,23]])B.push(WB(x+dx-.03,y+dy-.03,x+dx+.03,y+dy+.03,z,z+3,c.bud,{top:()=>[240,110,200]})); }
  else{ wPot(B,x,y,.14,7); B.push(WB(x-.012,y-.012,x+.012,y+.012,7,22,[70,112,46]));
    for(const [dx,dy,z] of [[.1,0,12],[-.1,.04,15],[.03,-.1,18],[-.04,.1,20]])B.push(WB(x+dx-.07,y+dy-.04,x+dx+.07,y+dy+.04,z,z+2,c.leaf,{top:()=>c.leafL})); }
  return prop(B); }
// THE BLOOM LAMP: a tall thin dark stand with a pot at its top, leaves spreading from it, and a yellow flower that glows (a warm light)
function bloomLamp(x,y){ PNAME='bloom lamp'; const c=WFC, B=[]; WO(B,x,y,.16,.16,.05,0,3,c.woodD); B.push(WB(x-.035,y-.035,x+.035,y+.035,3,62,c.woodD));
  WO(B,x,y,.17,.17,.05,62,72,c.pot,{top:()=>[70,46,30]}); WO(B,x,y,.14,.14,.04,58,62,c.potD);
  for(const [dx,dy,z,l] of [[.2,.04,70,.12],[-.2,-.02,72,.14],[.05,.2,71,.1],[-.04,-.2,73,.12],[.14,-.14,69,.1]])B.push(WB(x+dx-l,y+dy-.05,x+dx+l,y+dy+.05,z,z+2,c.leaf,{top:()=>c.leafL}));
  B.push(WB(x-.02,y-.02,x+.02,y+.02,72,80,[70,112,46]));
  WO(B,x,y,.2,.2,.07,80,84,c.bloom,{top:wDisc(x,y,.2,.2,(X,Y)=>wrLit(Math.hypot(X-x,Y-y)<.08?c.bloomD:c.bloom)),f:(nx,ny,u,z)=>wrLit(z<1?c.bloomD:c.bloom)});
  const p=prop(B); LAMPS.push({x,y,z:86,r:3.6,c:[.9,.7,.3],own:1,room:1,day:true,in:WR.in,prop:p}); return p; }
// THE BROOM: leaning in a corner: a pale wooden handle (stepped over a little as it rises), a bound head of straw at the floor
function broom(x,y){ PNAME='broom'; const c=WFC, B=[];
  WO(B,x,y,.16,.11,.04,0,16,c.straw,{top:()=>c.strawD,f:(nx,ny,u,z)=>z>13?[120,70,40]:Math.floor(u*24)%2?c.strawD:null});
  for(let i=0;i<5;i++){ const dx=-i*.03, dy=-i*.02; B.push(WB(x+dx-.035,y+dy-.035,x+dx+.035,y+dy+.035,16+i*14,30+i*14,c.broom,{top:()=>c.broom})); }
  return prop(B); }

// =====================================================================================
// THE WITCH'S BEDROOM, part 3: the things on its floor (the witch's hat, the satchel, the flowered rug and the black cat asleep on it,
// the teal blanket thrown down, the open sketchbook, the two pink crates with their stickers, the stack of records on one, the record
// player, the record sleeve on the boards), the catalog's Witch's Bedroom department. The room laid out as the picture has it: 26-zzz-witch-placed.
// =====================================================================================
const WTC={hat:[48,66,172],hatL:[74,98,206],hatD:[34,46,130],band:[204,40,56],spark:[244,248,255],bag:[200,98,42],bagL:[222,124,60],bagD:[150,66,30],
  rug:[238,152,164],rugD:[214,118,140],flower:[228,98,122],flowerC:[250,204,166],cat:[38,32,42],catL:[58,50,64],catD:[24,20,28],white:[232,232,238],
  teal:[40,146,134],tealD:[28,112,104],tealL:[70,178,162],page:[246,244,238],ink:[150,124,96],wing:[206,176,226],crate:[226,182,172],crateD:[196,148,140],crateL:[240,204,194],
  slot:[70,50,56],vinyl:[30,28,34],vinylL:[58,56,64],yellow:[242,212,62],walnut:[82,46,32],walnutL:[110,66,44],brass:[222,178,78],sleeve:[44,74,172],sleeveL:[80,120,210]};
// THE WITCH'S HAT: a wide round brim with a red band, the cone in rounded steps leaning over at its tip, white sparkles on it
function witchHat(x,y){ PNAME='witch hat'; const c=WTC, B=[], sp=(u,z,seed)=>{ const a=Math.floor(u*24), b=Math.floor(z), i=Math.floor(a/5), j=Math.floor(b/5), n=hash(i,j,seed); if(n>.3)return null;
    const ca=i*5+2, cb=j*5+2, da=Math.abs(a-ca), db=Math.abs(b-cb); return (da===0&&db<=1)||(db===0&&da<=1)?c.spark:null; };
  WO(B,x,y,.46,.4,.14,0,2,c.hat,{top:wDisc(x,y,.46,.4,(X,Y)=>{ const r=Math.hypot((X-x)/.46,(Y-y)/.4); if(r>.86)return c.hatD; const n=hash(Math.floor(X*24/4),Math.floor(Y*24/4),1651); return n<.12&&Math.floor(X*24)%4===2&&Math.floor(Y*24)%4===2?c.spark:c.hat; }),f:(nx,ny,u,z)=>z<1?c.hatD:c.hatL});
  WO(B,x,y,.3,.26,.08,2,5,c.band,{top:()=>c.band,f:()=>c.band});
  const cone=[[.26,.22,5,10,0,0],[.2,.17,10,15,.02,0],[.15,.13,15,19,.05,.01],[.1,.09,19,23,.1,.02],[.07,.06,23,26,.17,.03],[.05,.045,26,28,.24,.04]];
  cone.forEach(([hx,hy,z0,z1,dx,dy],i)=>WO(B,x+dx,y+dy,hx,hy,hx*.3,z0,z1,c.hat,{top:()=>c.hatL,f:(nx,ny,u,z)=>sp(u,z+z0,1653+i)||(z>z1-z0-1?c.hatL:null)}));
  return prop(B); }
// THE SATCHEL: a leather bag lying flat, its flap over the front, a brass clasp, the strap coiled beside it
function satchel(x,y){ PNAME='satchel'; const c=WTC, B=[]; WO(B,x+.31,y+.21,.31,.21,.06,0,8,c.bag,{top:wDisc(x+.31,y+.21,.31,.21,(X,Y)=>Y-y>.24?c.bagL:c.bag),f:(nx,ny,u,z,h)=>z>h-1?c.bagL:z<1?c.bagD:null});
  B.push(WB(x+.04,y+.26,x+.58,y+.44,8,9,c.bagL,{top:()=>c.bagL})); B.push(WB(x+.27,y+.36,x+.35,y+.42,9,10,c.brass,{top:()=>c.brass}));
  B.push(WB(x+.62,y+.1,x+.72,y+.5,0,2,c.bagD,{top:()=>c.bagD}));
  return prop(B); }
// THE FLOWERED RUG: a round pink rug with a darker edge, five-petal flowers with cream hearts strewn over it; you walk on it (flat: drawn
// before what lies on it, as the cottage's rugs are: stackOrder, 43)
function flowerRug(x,y){ PNAME='flower rug'; const c=WTC, r=1.1, cx=x+r, cy=y+r, FL=[[-.45,-.3],[.4,-.45],[.5,.35],[-.35,.5],[.05,.05]];
  const top=wDisc(cx,cy,r,r,(X,Y)=>{ const d=Math.hypot(X-cx,Y-cy); if(d>r-.07)return c.rugD;
    for(const [a,b] of FL){ const fx=cx+a, fy=cy+b, dd=Math.hypot(X-fx,Y-fy); if(dd<.07)return c.flowerC; if(dd<.24){ const ang=Math.atan2(Y-fy,X-fx), pet=Math.cos(ang*5)*.07+.17; if(dd<pet)return c.flower; } }
    return hash(Math.floor(X*24),Math.floor(Y*24),1655)<.02?c.rugD:c.rug; });
  return prop([WB(x,y,x+2*r,y+2*r,0,1,c.rug,{top,f:()=>false})],null,{walk:true,flat:1}); }
// THE SLEEPING CAT: black, curled on its side, its head tucked to its paws, ears up, the tail round its haunch, white paws
function sleepingCat(x,y){ PNAME='sleeping cat'; const c=WTC, B=[], fur=(u,z,h)=>z>h-1.5?c.catL:z<1?c.catD:hash(Math.floor(u*24),Math.floor(z),1657)<.06?c.catL:null;
  WO(B,x+.42,y+.26,.42,.26,.12,0,8,c.cat,{top:wDisc(x+.42,y+.26,.42,.26,(X,Y)=>hash(Math.floor(X*24),Math.floor(Y*24),1659)<.08?c.catL:c.cat),f:(nx,ny,u,z,h)=>fur(u,z,h)});
  WO(B,x+.1,y+.4,.16,.14,.05,1,10,c.cat,{top:()=>c.catL,f:(nx,ny,u,z,h)=>fur(u,z,h)});
  B.push(WB(x+.0,y+.3,x+.05,y+.35,10,13,c.cat),WB(x+.15,y+.28,x+.2,y+.33,10,13,c.cat));
  B.push(WB(x+.08,y+.5,x+.18,y+.56,0,2,c.white,{top:()=>c.white}),WB(x+.2,y+.52,x+.3,y+.58,0,2,c.white,{top:()=>c.white}));
  B.push(WB(x+.72,y+.06,x+.9,y+.14,0,3,c.cat,{top:()=>c.catL}),WB(x+.84,y+.14,x+.9,y+.4,1,3,c.cat,{top:()=>c.catL}));
  return prop(B); }
// THE TEAL BLANKET: thrown down in a heap: a ragged flat spread with folds, two humps where it bunches; you walk over it
function tealBlanket(x,y){ PNAME='teal blanket'; const c=WTC, B=[], W=2.4, D=1.6, cx=x+W/2, cy=y+D/2;
  const edge=(X,Y)=>{ const a=(X-cx)/(W/2), b=(Y-cy)/(D/2), ang=Math.atan2(b,a), r=Math.hypot(a,b); return r<.72+.22*Math.sin(ang*3+1)*Math.cos(ang*2)+.08*Math.sin(ang*7); };
  const col=(X,Y)=>{ const f=Math.sin(X*24/5+Y*24/7)+Math.sin(X*24/3-Y*24/9); return f>1.2?c.tealL:f<-1.1?c.tealD:hash(Math.floor(X*24),Math.floor(Y*24),1661)<.03?c.tealD:c.teal; };
  B.push(WB(x,y,x+W,y+D,0,2,c.teal,{top:(X,Y)=>edge(X,Y)?col(X,Y):null,f:(nx,ny,u,z,h,k,X,Y)=>false}));
  WO(B,cx-.3,cy+.1,.5,.3,.14,2,5,c.teal,{top:col,f:(nx,ny,u,z)=>z<1?c.tealD:c.teal}); WO(B,cx+.5,cy-.3,.3,.22,.1,2,4,c.teal,{top:col,f:(nx,ny,u,z)=>z<1?c.tealD:c.teal});
  return prop(B,null,{walk:true,flat:1}); }
// THE SKETCHBOOK: lying open on the boards, a dragonfly drawn on its right page in brown ink, its wings washed lilac; you walk over it
function sketchbook(x,y){ PNAME='sketchbook'; const c=WTC;
  const top=(X,Y)=>{ const a=(X-x)*24, b=(Y-y)*24; if(a<0||a>18||b<0||b>12)return null; if(Math.abs(a-9)<.6)return [200,196,186]; if(a<1||a>17||b<1||b>11)return [220,216,206];
    if(a>9){ const fa=a-13.5, fb=b-6; if(Math.abs(fa)<.6&&Math.abs(fb)<4)return c.ink; if(Math.abs(fb-1)<1.6&&Math.abs(fa)<3.2&&Math.abs(fa)>.6)return c.wing; if(Math.abs(fb+1.2)<1.2&&Math.abs(fa)<2.6&&Math.abs(fa)>.6)return c.wing; if(Math.hypot(fa,fb-4.2)<.9)return c.ink; }
    else if(hash(Math.floor(a),Math.floor(b),1663)<.04)return [226,222,210]; return c.page; };
  return prop([WB(x,y,x+.75,y+.5,0,1,c.page,{top,f:()=>[214,210,200]})],null,{walk:true,flat:1}); }
// A PINK CRATE: a cardboard box with a hand slot in its +y face, its lid flaps folded over, stickers on it; sd picks the stickers
function pinkCrate(x,y,sd=0){ PNAME='pink crate'; const c=WTC, B=[], S=[[120,160,220],[240,120,120],[240,200,80],[120,200,160]];
  const stick=(u,z,face,seed)=>{ for(let i=0;i<3;i++){ const a=4+hash(i,face,seed)*12, b=2+hash(i,face+1,seed)*10, w=2+Math.round(hash(i,face+2,seed)*3); if(u*24>a&&u*24<a+w+1&&z>b&&z<b+w)return S[(i+sd+face)%4]; } return null; };
  B.push(WB(x,y,x+.9,y+.8,0,16,c.crate,{top:(X,Y)=>Math.abs(Y-y-.4)<.02?c.crateD:Y-y<.4?c.crateL:c.crate,
    f:(nx,ny,u,z,h,k)=>{ if(ny>0&&z>8&&z<10.5&&u>.3&&u<.6)return c.slot; const s=stick(u,z,ny?1:3,1665+sd); if(s)return s; return z>h-1?c.crateL:z<1?c.crateD:Math.floor(z)===5&&ny?c.crateD:null; }}));
  B.push(WB(x+.08,y+.05,x+.82,y+.4,16,17,c.crateL,{top:()=>c.crateL}),WB(x+.08,y+.42,x+.82,y+.76,16,17,c.crate,{top:()=>c.crate}));
  return prop(B); }
// A STACK OF RECORDS: six discs in and out of their sleeves, the top one a yellow sleeve with a dark scrawl on it (a drawn flourish,
// no maker's name), a black disc showing under it
function recordStack(x,y){ PNAME='record stack'; const c=WTC, B=[], cx=x+.3, cy=y+.3, S=[[200,60,70],[70,120,200],[240,240,230],[40,110,90]];
  for(let i=0;i<5;i++){ const col=i%2?c.vinyl:S[i>>1], dx=.02*Math.sin(i*2.1), dy=.02*Math.cos(i*1.7); WO(B,cx+dx,cy+dy,.3,.3,.09,i*1.4,i*1.4+1.4,col,{top:()=>col,f:()=>col}); }
  WO(B,cx+.03,cy-.02,.29,.29,.09,7,8.4,c.vinyl,{top:wDisc(cx+.03,cy-.02,.29,.29,(X,Y)=>{ const d=Math.hypot(X-cx-.03,Y-cy+.02); return d<.06?[180,60,60]:Math.floor(d*120)%3===0?c.vinylL:c.vinyl; })});
  B.push(WB(cx-.27,cy-.25,cx+.27,cy+.29,8.4,9.6,c.yellow,{top:(X,Y)=>{ const a=(X-cx)*24, b=(Y-cy)*24; const s=Math.sin(a*.9)*2.2; return Math.abs(b-s)<.7&&Math.abs(a)<5?[50,46,70]:Math.abs(b-s-1.4)<.5&&a>-2&&a<3?[50,46,70]:c.yellow; },f:()=>c.yellow}));
  return prop(B); }
// THE RECORD PLAYER: a walnut box with brass corners, a black platter on top, a brass tone arm across it
function recordPlayer(x,y){ PNAME='record player'; const c=WTC, B=[], cx=x+.42, cy=y+.32;
  B.push(WB(x,y,x+.9,y+.62,0,10,c.walnut,{top:()=>c.walnutL,f:(nx,ny,u,z,h)=>z>h-1?c.walnutL:(u*24<2||u*24>(nx?.62:.9)*24-2)&&z<3?c.brass:null}));
  for(const [a,b] of [[x,y],[x+.82,y],[x,y+.54],[x+.82,y+.54]])B.push(WB(a,b,a+.08,b+.08,10,11,c.brass,{top:()=>c.brass}));
  WO(B,cx,cy,.26,.26,.08,10,12,c.vinyl,{top:wDisc(cx,cy,.26,.26,(X,Y)=>{ const d=Math.hypot(X-cx,Y-cy); return d<.03?c.brass:Math.floor(d*120)%4===0?c.vinylL:c.vinyl; }),f:()=>c.vinyl});
  B.push(WB(x+.7,y+.08,x+.78,y+.16,10,15,c.brass,{top:()=>c.brass}),WB(x+.4,y+.1,x+.76,y+.14,14,15,c.brass,{top:()=>c.brass}));
  return prop(B); }
// A RECORD SLEEVE on the floor: a blue square sleeve, a pale figure printed on it; you walk over it
function recordSleeve(x,y){ PNAME='record sleeve'; const c=WTC;
  const top=(X,Y)=>{ const a=(X-x)*24, b=(Y-y)*24; if(a<0||a>14||b<0||b>14)return null; if(a<1||a>13||b<1||b>13)return c.sleeveL; const fa=a-7, fb=b-6; if(Math.hypot(fa,fb+2.5)<1.8)return [236,206,180]; if(Math.abs(fa)<2.4&&fb>-1&&fb<4)return [230,200,160]; return c.sleeve; };
  return prop([WB(x,y,x+.6,y+.6,0,1,c.sleeve,{top,f:()=>c.sleeveL})],null,{walk:true,flat:1}); }
// ---- THE CATALOG: each piece an item (placed where clicked, at real size); the frames, the candle, the ball and the sprout stand on
// the floor there (set them on a table with the editor's height, or as the room is laid out below)
CATALOG['witch bed']=(x,y)=>witchBed(x-1.25,y-.9); CATALOG['bedside table']=(x,y)=>bedsideTable(x-.32,y-.45); CATALOG['fortune table']=(x,y)=>fortuneTable(x-.45,y-.6);
CATALOG['crystal ball']=(x,y)=>crystalBall(x,y); CATALOG['fairy sprout']=(x,y)=>fairySprout(x,y); CATALOG['ornate frame']=(x,y)=>pictureFrame(x,y-.25,'ornate');
CATALOG['star frame']=(x,y)=>pictureFrame(x,y-.17,'star'); CATALOG['small frame']=(x,y)=>pictureFrame(x,y-.14,'small'); CATALOG['saucer candle']=(x,y)=>saucerCandle(x,y);
CATALOG['wall shelf']=(x,y)=>wallShelf(x,y-1.1); CATALOG['red curtain']=(x,y)=>redCurtain(x-.35,y); CATALOG['window ledge']=(x,y)=>windowLedge(x-2.45,y-.25);
CATALOG['bushy plant']=(x,y)=>pottedPlant(x,y,'bush'); CATALOG['cactus pot']=(x,y)=>pottedPlant(x,y,'cactus'); CATALOG['small plant']=(x,y)=>pottedPlant(x,y,'small');
CATALOG['bloom lamp']=(x,y)=>bloomLamp(x,y); CATALOG['broom']=(x,y)=>broom(x,y); CATALOG['witch hat']=(x,y)=>witchHat(x,y); CATALOG['satchel']=(x,y)=>satchel(x-.36,y-.25);
CATALOG['flower rug']=(x,y)=>flowerRug(x-1.1,y-1.1); CATALOG['sleeping cat']=(x,y)=>sleepingCat(x-.45,y-.3); CATALOG['teal blanket']=(x,y)=>tealBlanket(x-1.2,y-.8);
CATALOG['sketchbook']=(x,y)=>sketchbook(x-.37,y-.25); CATALOG['pink crate']=(x,y)=>pinkCrate(x-.45,y-.4,Math.round(x+y)); CATALOG['record stack']=(x,y)=>recordStack(x-.3,y-.3);
CATALOG['record player']=(x,y)=>recordPlayer(x-.45,y-.31); CATALOG['record sleeve']=(x,y)=>recordSleeve(x-.3,y-.3);
if(!CAT_DEPTS.some(d=>d[0]==="Witch's Bedroom"))CAT_DEPTS.push(["Witch's Bedroom","Witch's Bedroom"]);   // ([key, name]: the book reads pairs, 50-menu-2)
{ const D="Witch's Bedroom", I=[['witch bed',1901,'Witch\'s bed','$640','A low bed under a magenta spread, two leaf-print pillows, a cat cushion; its headboard a bookcase.'],
  ['bedside table',1902,'Bedside table','$95','A dark little table with one drawer and a brass knob.'],['fortune table',1903,'Fortune table','$120','A small table under a teal cloth.'],
  ['crystal ball',1904,'Crystal ball','$260','A glass sphere on a brass ring. It shows you yourself, mostly.'],['fairy sprout',1905,'Fairy sprout','$30','A little plant whose buds glow at night.'],
  ['ornate frame',1906,'Ornate frame','$48','A gilt frame round a dark portrait.'],['star frame',1907,'Star frame','$18','A purple frame with a white star.'],['small frame',1908,'Small frame','$12','A little red frame on cream.'],
  ['saucer candle',1909,'Saucer candle','$6','A cream candle on a saucer; it flickers.'],['wall shelf',1910,'Wall shelf','$55','A dark shelf on two brackets, five books on it.'],
  ['red curtain',1911,'Red curtain','$70','A red velvet curtain, floor length.'],['window ledge',1912,'Window ledge','$180','A low dark red cabinet to go under a window.'],
  ['bushy plant',1913,'Bushy plant','$35','A round leafy plant in a terracotta pot.'],['cactus pot',1914,'Cactus','$22','A ribbed cactus with pink buds, in a pot.'],['small plant',1915,'Small plant','$14','A few leaves on a stem, in a little pot.'],
  ['bloom lamp',1916,'Bloom lamp','$140','A tall plant stand whose yellow flower glows.'],['broom',1917,'Broom','$24','A straw broom. It has not flown yet.'],
  ['witch hat',1918,'Witch\'s hat','$45','A blue pointed hat with a red band and white sparkles, its tip bent over.'],['satchel',1919,'Satchel','$85','A leather bag, dropped where it was taken off.'],
  ['flower rug',1920,'Flower rug','$75','A round pink rug strewn with flowers.'],['sleeping cat',1921,'Sleeping cat','$0','A black cat, asleep. Not for sale; she comes and goes.'],
  ['teal blanket',1922,'Teal blanket','$40','A teal blanket thrown down in a heap.'],['sketchbook',1923,'Sketchbook','$15','An open sketchbook, a dragonfly drawn in it.'],
  ['pink crate',1924,'Pink crate','$8','A pink cardboard box with stickers.'],['record stack',1925,'Record stack','$60','Six records, the top one in a yellow sleeve.'],
  ['record player',1926,'Record player','$220','A walnut record player with brass corners.'],['record sleeve',1927,'Record sleeve','$12','A blue record sleeve on the floor.']];
  for(const [k,n,name,price,line] of I){ CAT_INFO[k]={n,name,dept:D,price,line}; KIND_OF[k]=k; } }
// the room laid out as the picture has it: 26-zzz-witch-placed (made last, so no other object's or lamp's number changes)
PNAME='object';

};
export {witchBedroom};
