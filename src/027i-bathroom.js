// THE BATHROOM KIT: the old game's restroom pieces as catalog kinds; loads with the old rooms' kits on the first jump.
import {SHARED} from './003-shx.js';
import {CAT_DEPTS, CAT_INFO, CATALOG, hash, KIND_OF, LAMPS, LBLD, prop, sh, sided, speck, T} from './014-gamekit.js';
const bathroomKit=()=>{ '@oldkits';
// =====================================================================================
// THE BATHROOM (owner, 15 Oct 2026, his picture: "create walkable scene of this room, html5 graphics only (no actual image) each object its
// own thing, rotating room 4 angles"). A small bathroom of its own out in the blackness past the crystal cavern (LBLD 'lbath',
// 21-world-map-5-land: off the map, the map tab's jump list takes you there), 5.8 by 5.8 inside and 100 art px high, every pixel drawn by
// hand in code from the picture (a guide for shape and colour only, as the owner's rules have it: nothing cut from it). The walls: white
// square tiles to about knee height under a walnut rail, cream board panelling above, grooved every ten art px, a darker band at the top;
// on the left wall the two-pane window (its glass daylight-white, lit), on the back wall nothing but the panelling (the picture's TUTU mark
// is the artist's, left out). The floor: big white tiles a tile square in tan grout with a square at each crossing. Its things, each a catalog
// item at real size and placed as the picture has them: the toilet (its cistern up on the wall behind it, a pipe down), the wash basin (round,
// fluted pedestal), the potted monstera, the wall mirror, the towel rail and its towel, the brush stand (brush and plunger on a plate), the
// waste bin with its tissues, the floor drain. Two lights: the ceiling light and the window's day.
// =====================================================================================
const BATHB=LBLD.find(b=>b.id==='lbath');
const BATH={b:BATHB,x0:BATHB.x0+T,y0:BATHB.y0+T,x1:BATHB.x1-T,y1:BATHB.y1-T,H:BATHB.h-4,cx:(BATHB.x0+BATHB.x1)/2,cy:(BATHB.y0+BATHB.y1)/2,in:[BATHB.x0-T,BATHB.y0-T,BATHB.x1+T,BATHB.y1+T],
  win:[2.5,4.5,60,88],TZ:34};   // win: the window along the left wall (tiles from the back corner) and up it (art px); TZ: the tiles' top
const BTC={tile:[238,232,224],tileL:[246,242,236],tileD:[222,214,204],grout:[196,180,160],groutD:[172,152,132],rail:[146,112,84],railL:[178,142,108],railD:[104,78,58],
  board:[212,194,160],boardL:[224,208,176],groove:[112,92,70],cope:[150,128,104],floor:[242,236,228],floorD:[228,220,210],fgrout:[190,170,150],fgroutD:[168,148,128],
  frame:[118,90,64],frameL:[206,164,110],frameD:[62,48,40],glass:[252,252,250],
  china:[242,238,228],chinaL:[250,248,242],chinaD:[214,204,192],chinaS:[184,172,160],basin:[214,202,192],cistern:[150,124,113],cisternD:[112,90,84],lid:[200,184,200],lidL:[222,210,224],
  pot:[150,122,70],potD:[112,92,52],potB:[128,122,60],soil:[58,46,38],stem:[226,220,200],leaf:[104,140,58],leafL:[134,168,72],leafD:[70,96,44],
  dark:[52,46,50],mirror:[170,158,172],mirrorL:[204,194,206],mirrorD:[140,128,144],bar:[58,52,56],towel:[240,236,228],towelD:[212,204,194],
  plate:[122,84,52],pole:[112,88,56],poleD:[64,52,48],bin:[58,54,80],binL:[86,80,104],binD:[42,40,64],tissue:[214,180,190],tissueL:[246,236,238],shade:[244,240,226]};
const btLit=c=>Object.assign([...c],{e:1});   // a colour that glows: never shaded (the window's glass, the ceiling light's shade)
// THE WALLS inside (facadeCol, 22): tiles, the rail, the boards; the window on the left wall. u along the wall in tiles, z up it in art px
function bathWall(q,nx,ny,X,Y,z,f){ const R=BATH, c=BTC, e=.06, u=nx?Y:X, H=R.H;
  if(z<0)return sh(c.groutD,f);
  if(nx>0&&Math.abs(X-R.x0)<e){ const [w0,w1,z0,z1]=R.win, v=Y-R.y0;   // the window: a walnut frame, its inner edge catching the light low and right, a mullion, two panes of day
    if(v>=w0&&v<w1&&z>=z0&&z<z1){ const a=Math.floor((v-w0)*24), b=Math.floor(z1-1-z), W=(w1-w0)*24, ht=z1-z0, m=Math.abs(a-W/2)<1;
      if(a<2||a>=W-2||b<2||b>=ht-2)return sh(a>=W-2&&b<2?c.frameD:c.frame,f); if(m||b===ht-3||b===2)return sh(m?c.frame:b===2?c.frameD:c.frameL,f); if(a===2||a===W-3)return sh(a===2?c.frameD:c.frameL,f);
      return btLit(c.glass); } }
  if(z>=H-4)return sh(c.cope,f);                                                              // the band along the top
  if(z<R.TZ){ const a=(u-Math.floor(u))*24%12, b=z%12, ta=Math.floor(u*2), tb=Math.floor(z/12);   // the tiles: half a tile square in tan grout, a light top-left edge
    if(a<1||b>=11)return sh(c.grout,f); if(a<2||b>=10)return sh(c.tileL,f); if(a>=11||b<1)return sh(c.tileD,f); return sh(hash(ta,tb,1601)<.1?c.tileD:c.tile,f); }
  if(z<R.TZ+4)return sh(z===R.TZ+3?c.railL:z===R.TZ?c.railD:c.rail,f);                            // the rail
  const g=Math.floor(u*24)%10; return sh(g===0?c.groove:g===1?c.boardL:speck(c.board,u,z/24,1603),f); }   // the boards: a groove every ten, a lit edge beside it
// THE FLOOR: tiles a tile square, tan grout with a square at each crossing, a little warmer here and there
function bathFloorCol(x,y){ const c=BTC, u=x-Math.floor(x), v=y-Math.floor(y), du=Math.min(u,1-u), dv=Math.min(v,1-v), g=.04;
  if(du<g&&dv<g+.06||dv<g&&du<g+.06)return c.fgroutD; if(du<g||dv<g)return c.fgrout;
  const n=hash(Math.floor(x*24),Math.floor(y*24),1605); return n<.03?c.floorD:n>.985?[250,246,240]:c.floor; }
// ---- the pieces: boxes with faces by the side of the world they face (sided, 22)
const btFace=(c,z,h,k,u=0)=>sh(z>h-1.5?sh(c,1.12):z<1?sh(c,.8):c,k*(1-.14*u*u));   // a face: a lit top edge, a dark foot, darker toward its ends (u -1..1: it reads as round)
const btBox=(x0,y0,x1,y1,z0,z1,c,o={})=>sided({x0,y0,x1,y1,z0,z1,c,foot:z0===0?1:0,top:()=>sh(c,1.08),fs:(nx,ny,X,Y,z,k)=>btFace(c,z,z1-z0,k),...o});
// a round thing: two boxes crossed (an octagon's footprint, its corners cut by d), each face shaded toward its ends so it reads as a cylinder
const btRound=(B,x,y,hw,d,z0,z1,c,o={})=>{ const fs=(nx,ny,X,Y,z,k)=>(o.fs||((u,z,k)=>btFace(c,z,z1-z0,k,u)))((nx?Y-y:X-x)/hw,z,k);
  B.push(sided({x0:x-hw,y0:y-hw+d,x1:x+hw,y1:y+hw-d,z0,z1,c,foot:z0===0?1:0,top:o.top||(()=>sh(c,1.08)),fs}),sided({x0:x-hw+d,y0:y-hw,x1:x+hw-d,y1:y+hw,z0,z1,c,foot:z0===0?1:0,top:o.top||(()=>sh(c,1.08)),fs})); };
// THE TOILET: the round bowl (the seat ring on top, the water dark in it), its cistern up on the wall behind it under a lilac lid, the pipe down
function toilet(x,y){ SHARED.PNAME='toilet'; const B=[], c=BTC, wall=y-.46;   // (it stands with its back to a wall at y - .46)
  const top=(X,Y)=>{ const r=Math.hypot(X-x,Y-y); return r<.16?c.chinaS:r<.26?c.basin:r<.3?c.chinaD:sh(c.china,1.08); };
  btRound(B,x,y,.34,.12,0,14,c.china); btRound(B,x,y,.42,.14,14,18,c.china,{top});
  B.push(btBox(x-.32,wall,x+.32,wall+.26,52,70,c.cistern,{fs:(nx,ny,X,Y,z,k)=>btFace(z>16?c.cisternD:c.cistern,z,18,k)}));
  B.push(btBox(x-.28,wall+.02,x+.28,wall+.24,70,74,c.lid,{top:(X,Y)=>Math.abs(X-x)<.06&&Math.abs(Y-wall-.13)<.05?c.dark:c.lidL}));
  B.push(btBox(x-.04,wall,x+.04,wall+.1,18,52,c.chinaD,{foot:0}));
  return prop(B,null,{}); }
// THE WASH BASIN: a fluted pedestal, the round bowl on it (the basin dished in its top, the drain in the middle), the tap at its back
function washBasin(x,y){ SHARED.PNAME='wash basin'; const B=[], c=BTC;
  const flute=(u,z,k)=>{ const s=Math.floor((u+1)*9)%2; return btFace(s?c.chinaD:c.china,z,22,k,u); };
  const top=(X,Y)=>{ const r=Math.hypot(X-x,Y-y); return r<.05?c.dark:r<.3?sh(c.basin,1-.3*(.3-r)):r<.35?c.chinaD:sh(c.chinaL,1.02); };
  btRound(B,x,y,.36,.12,0,20,c.china,{fs:flute}); btRound(B,x,y,.46,.14,20,32,c.china,{top});
  B.push(btBox(x-.05,y-.4,x+.05,y-.3,32,40,c.dark,{foot:0}),btBox(x-.05,y-.4,x+.05,y-.2,38,41,c.dark,{foot:0}));
  return prop(B,null,{}); }
// THE POTTED MONSTERA: a two-tone pot, soil, three pale stems, and the big split leaves on two crossed sheets so they read from every turn;
// you walk through its leaves
function pottedMonstera(x,y){ SHARED.PNAME='potted monstera'; const B=[], c=BTC, HT=52;
  btRound(B,x,y,.22,.08,0,13,c.pot,{top:(X,Y)=>Math.hypot(X-x,Y-y)<.17?c.soil:c.potD,fs:(u,z,k)=>btFace(z>9?c.pot:z>3?c.potB:c.potD,z,13,k,u)});
  for(const [dx,dy,h] of [[-.05,.02,46],[.03,-.04,52],[.07,.05,40]])B.push(btBox(x+dx-.015,y+dy-.015,x+dx+.015,y+dy+.015,13,h,c.stem,{foot:0}));
  // a leaf: a heart with its lobes split, u across the sheet (tiles from the plant's middle), z up it
  const leaves=[[-.3,45,.42,14],[-.2,29,.3,10],[.32,37,.38,12]];   // [middle u, middle z, half width (tiles), half height (px)]
  const leaf=(u,z)=>{ for(const [lu,lz,hw,hh] of leaves){ const a=(u-lu)/hw, b=(z-lz)/hh; if(a*a+b*b>1)continue;
      if(b<-.1&&Math.abs(a)<.12)continue; if(Math.abs(a)>.35&&((Math.floor((b+1)*4)%2===0&&Math.abs(a)>.65)))continue;   // the split down the middle, the notches at the edges
      const vein=Math.abs(a)<.04||Math.abs(Math.abs(a)*2.2-Math.abs(b+.3))<.06; return vein?c.leafL:Math.abs(a)+Math.abs(b)>1.1?c.leafD:c.leaf; } return null; };
  const sheet=ax=>sided({x0:ax?x-.02:x-.6,y0:ax?y-.6:y-.02,x1:ax?x+.02:x+.6,y1:ax?y+.6:y+.02,z0:13,z1:HT+6,c:c.leaf,foot:0,nb:1,top:()=>null,
    fs:(nx,ny,X,Y,z,k)=>{ const col=nx?(ax?leaf(Y-y,z+13):null):(ax?null:leaf(X-x,z+13)); return col?sh(col,k):null; }});
  B.push(sheet(0),sheet(1)); return prop(B,null,{walk:true}); }
// THE WALL MIRROR: a dark frame and its glass, lighter toward the upper left with a streak across it; it hangs on a wall (you walk under it)
function wallMirror(x,y){ SHARED.PNAME='wall mirror'; const c=BTC, W=1.3, HT=36, Z0=46;
  const glass=(u,z,k)=>{ const a=(u+W/2)*24, b=HT-z, w=W*24; if(a<2||a>=w-2||b<2||b>=HT-2)return sh(c.dark,k); if(Math.abs(a-b*.9-6)<2)return sh(c.mirrorL,k);
    const t=(a/w+b/HT)/2; return sh(t<.35?c.mirrorL:t>.7?c.mirrorD:c.mirror,k); };
  return prop([sided({x0:x-W/2,y0:y,x1:x+W/2,y1:y+.06,z0:Z0,z1:Z0+HT,c:c.dark,foot:1,nb:1,top:()=>c.dark,fs:(nx,ny,X,Y,z,k)=>nx?sh(c.dark,k):glass(X-x,z,k)})],null,{walk:true,high:true}); }   // (high: taken down with its wall when that wall is in front of you)
// THE TOWEL RAIL: a dark bar on two brackets out from a wall, the towel folded over it (its folds, a hem); on a wall (you walk under it)
function towelRail(x,y){ SHARED.PNAME='towel rail'; const c=BTC, B=[], L=.8;
  for(const s of [-1,1])B.push(btBox(x,y+s*L/2-.03,x+.12,y+s*L/2+.03,46,49,c.bar,{foot:0,nb:1}));
  B.push(btBox(x+.1,y-L/2,x+.14,y+L/2,47,49,c.bar,{foot:1,nb:1}));
  B.push(sided({x0:x+.08,y0:y-.26,x1:x+.16,y1:y+.26,z0:30,z1:48,c:c.towel,foot:0,nb:1,top:()=>c.towel,fs:(nx,ny,X,Y,z,k)=>{ const u=Math.floor((Y-y+.26)*24); return sh(z<2?c.towelD:u%5===2?c.towelD:nx?c.towel:c.towelD,k); }}));
  return prop(B,null,{walk:true,high:true}); }   // (high: down with its wall, as the mirror)
// THE BRUSH STAND: the toilet brush and the plunger standing on a walnut plate, the brush's handle banded
function brushStand(x,y){ SHARED.PNAME='brush stand'; const c=BTC, B=[];
  B.push(btBox(x-.18,y-.18,x+.18,y+.18,0,2,c.dark,{top:()=>c.plate}));
  B.push(btBox(x-.08,y-.025,x-.03,y+.025,2,58,c.pole,{foot:0,fs:(nx,ny,X,Y,z,k)=>sh(Math.floor(z/4)%2?c.poleD:c.pole,k)}),btBox(x-.11,y-.06,x,y+.06,52,60,c.dark,{foot:0}));
  B.push(btBox(x+.05,y-.02,x+.09,y+.02,2,46,c.pole,{foot:0}),btBox(x+.03,y-.04,x+.11,y+.04,44,48,c.poleD,{foot:0}));
  return prop(B,null,{}); }
// THE WASTE BIN: a navy bucket, a lighter rim and a band round it, the tissues showing at the top
function wasteBin(x,y){ SHARED.PNAME='waste bin'; const c=BTC, B=[];
  const top=(X,Y)=>{ const r=Math.hypot(X-x,Y-y); return r>.16?c.binL:hash(Math.floor(X*48),Math.floor(Y*48),1607)<.4?c.tissueL:c.tissue; };
  btRound(B,x,y,.2,.07,0,18,c.bin,{top,fs:(u,z,k)=>btFace(z>16?c.binL:z>10&&z<12?c.binD:c.bin,z,18,k,u)}); return prop(B,null,{}); }
// THE FLOOR DRAIN: a round grate let into the floor, its holes in a ring; you walk over it
function floorDrain(x,y){ SHARED.PNAME='floor drain'; const c=BTC;
  const top=(X,Y)=>{ const r=Math.hypot(X-x,Y-y), a=Math.atan2(Y-y,X-x); return r>.17?null:r>.14?c.chinaS:r>.07&&Math.floor((a+Math.PI)/(Math.PI/4))%2===0?c.dark:r<.03?c.dark:c.chinaD; };
  return prop([sided({x0:x-.18,y0:y-.18,x1:x+.18,y1:y+.18,z0:0,z1:1,c:c.chinaS,foot:1,top,fs:()=>null})],null,{walk:true}); }
// ---- THE CATALOG: each piece an item (centred where clicked)
CATALOG['toilet']=(x,y)=>toilet(x,y); CATALOG['wash basin']=(x,y)=>washBasin(x,y); CATALOG['potted monstera']=(x,y)=>pottedMonstera(x,y); CATALOG['wall mirror']=(x,y)=>wallMirror(x,y);
CATALOG['towel rail']=(x,y)=>towelRail(x,y); CATALOG['brush stand']=(x,y)=>brushStand(x,y); CATALOG['waste bin']=(x,y)=>wasteBin(x,y); CATALOG['floor drain']=(x,y)=>floorDrain(x,y);
if(!CAT_DEPTS.some(d=>d[0]==='Bathroom'))CAT_DEPTS.push(['Bathroom','Bathroom']);   // ([key, name]: the book reads pairs, 50-menu-2)
Object.assign(CAT_INFO,{'toilet':{n:1901,name:'Toilet',dept:'Bathroom',price:'$240',line:'A round china bowl; its cistern hangs on the wall behind it.'},
  'wash basin':{n:1902,name:'Wash basin',dept:'Bathroom',price:'$180',line:'A round basin on a fluted pedestal.'},
  'potted monstera':{n:1903,name:'Potted monstera',dept:'Bathroom',price:'$35',line:'Three split leaves in a clay pot.'},
  'wall mirror':{n:1904,name:'Wall mirror',dept:'Bathroom',price:'$60',line:'A plain mirror in a dark frame.'},
  'towel rail':{n:1905,name:'Towel rail',dept:'Bathroom',price:'$22',line:'A dark rail with a white towel over it.'},
  'brush stand':{n:1906,name:'Brush stand',dept:'Bathroom',price:'$15',line:'A toilet brush and a plunger on a walnut plate.'},
  'waste bin':{n:1907,name:'Waste bin',dept:'Bathroom',price:'$12',line:'A navy bucket of tissues.'},
  'floor drain':{n:1908,name:'Floor drain',dept:'Bathroom',price:'$30',line:'A round grate let into the floor.'}});
for(const k of ['toilet','wash basin','potted monstera','wall mirror','towel rail','brush stand','waste bin','floor drain'])KIND_OF[k]=k;
// ---- THE ROOM AS THE PICTURE HAS IT: along the left wall from the back corner, the brush stand, the towel on its rail, the bin out from it
// under the window; along the back wall, the toilet under its cistern, the monstera before it, the basin at the right under the mirror; the
// drain in the floor's front half. The ceiling light toward the back right, where the picture's light falls from (a small round shade); the window's day just inside its glass
{ const R=BATH, u=(a,b)=>[R.x0+a,R.y0+b], c=BTC;
  brushStand(...u(.3,.9)); towelRail(...u(0,1.5)); wasteBin(...u(1.1,2.3)); toilet(...u(2.3,.5)); pottedMonstera(...u(3.2,1.3)); washBasin(...u(4.6,.75)); wallMirror(...u(4.5,0)); floorDrain(...u(1.7,3.3));
  SHARED.PNAME='ceiling light'; const B=[]; const lx=R.x0+5.2, ly=R.y0+1.9; btRound(B,lx,ly,.24,.08,R.H-3,R.H,c.shade,{top:()=>btLit(c.shade),fs:()=>btLit(c.shade)}); for(const b of B){ b.foot=1; b.nb=1; } const p=prop(B,null,{walk:true,high:true});
  LAMPS.push({x:lx,y:ly,z:R.H-6,r:14,c:[1.9,1.7,1.36],own:1,room:1,day:true,in:R.in,prop:p});
  LAMPS.push({x:R.x0+.5,y:R.y0+(R.win[0]+R.win[1])/2,z:(R.win[2]+R.win[3])/2,r:8,c:[1.2,1.2,1.3],own:1,room:1,day:true,in:R.in}); }
SHARED.PNAME='object';

};
export {bathroomKit};
