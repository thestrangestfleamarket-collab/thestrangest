// THE WEST AWNINGS KIT: Lucky 7's dining room and the Yellow Awning's gamer room as catalog kinds; loads with the old rooms' kits on the first jump.
import {SHARED} from './003-shx.js';
import {CAT_DEPTS, CAT_INFO, CATALOG, FP, KIND_OF, LAMPS, LBLD, LIFE, prop, sh, sided, speck, STORY, woodCol} from './014-gamekit.js';
import {PRESETS} from './023-west-kits.js';
const westAwnings=()=>{ '@oldkits';
  const brickCol=(u,z,f)=>sh([146,80,63],f), carpetCol=()=>[96,40,44], edPt=(x,y)=>[x,y], vw=(x,y)=>[x,y], toS=(x,y)=>[x,y];   // the old editor's and renderer's helpers: never reached here
// =====================================================================================
// THE WEST END'S TWO AWNINGS, THEIR ROOMS (owner, 16 Oct 2026: the archived rooms "bring all of these back and put on map"): the yellow-awning
// shop with the dining room upstairs, and Lucky 7 under its black awning with the gamer room upstairs, two of the six bodegas of the old north
// strip, each with its owner's home over it (archive/old-world/src/26-zzzzzzzzzzzzz-row, -zzzzzzzzzzzzzz-scenes). Their buildings are the
// West End's (WEND.row 'lyellow', 'llucky': 21-world-map-5-0-west-plan, -zz-west-end); the fronts, the stairs and everything set out:
// 26-zzzzzzzzzzzz-west-awnings. Here, as the north strip had them: the shop's boards and bare brick downstairs, the owner's home's carpet
// and plain plaster over a dark skirting upstairs (both buildings); then THE DINING ROOM's things (archive 23-w-dining-room, as they were).
// The gamer room's: 23-w-west-awnings-2-gamer.
// =====================================================================================
// the two buildings' floors (woodCol, carpetCol: 21-world-map-2-ground) and their walls inside
function awnWall(q,nx,ny,X,Y,z,f){ const u=nx?Y:X, lv=Math.max(0,Math.min(q.st-1,Math.floor(z/STORY))), zz=z-lv*STORY;
  if(!lv)return brickCol(u,z,f,q.h);                                                   // the shop: bare brick, as the strip's bodegas were inside
  if(zz<5)return sh([62,50,42],f); return sh(speck([204,196,180],u,zz/24,91),f); }   // the owner's home: plain plaster over a dark skirting
for(const b of LBLD)if(b.id==='lyellow'||b.id==='llucky'){ b.floorOf=lv=>lv?carpetCol:woodCol; b.inWall=awnWall; }
// THE DINING ROOM (owner, 12 Oct 2026: the walk kit's scene "diningroom.js", "add these to game map"; "dont add the tomato character or
// stand"): the kit's room drawn in code at the Walker's scale, its furniture brought into the game's boxes from the kit's own measures
// (a kit tile is 4/3 of the game's; heights in art px as they were): the dining table with its six white chairs, plates and two flower
// stems; the sideboard on its four feet (the niche, the drawers' lines and handles, a vase with a flower, two plates); the wall lamps
// (each a small lit box with its light thrown up and down the wall, a real light); the mirrors (a white frame, the glass, its gleam).
// Each is a catalog item (department Dining Room) and "Preset Dining Room 1" sets them out as the kit had them, against a wall at the
// set's back (-y; turned with it). The white mirrors are 'white wall mirror' now (the bathroom's dark one has the old name, 23-w-bathroom).
{ const s=4/3;
  const C={tableWood:[100,64,50],boardWood:[96,62,50],darkWood:[70,44,36],steel:[176,188,196],chair:[232,232,226],plate:[238,238,232],niche:[196,202,204],handle:[216,216,210],
    lamp:[242,240,232],glowUp:[250,240,212],mirrorFrame:[236,236,230],glass:[203,219,226],glassLight:[226,236,240],vase:[72,128,136],leaf:[96,128,84],petal:[242,240,230],pollen:[226,196,96]};
  const lit=c=>Object.assign([...c],{e:1});
  const sh2=(c,k)=>[Math.round(c[0]*k),Math.round(c[1]*k),Math.round(c[2]*k)];
  // a box in the kit's measures from the corner o (u, v kit tiles; z art px): the kit's mat(c), lit top, its two sides shaded
  const kb=(o,u0,v0,u1,v1,z0,z1,c,x)=>({x0:o[0]+u0*s,y0:o[1]+v0*s,x1:o[0]+u1*s,y1:o[1]+v1*s,z0,z1,c,foot:z0===0?1:0,top:()=>c,fi:()=>sh2(c,.68),fj:()=>sh2(c,.84),...x});
  // a disc lying flat (a plate): its top round, no sides
  const disc=(o,u,v,z,r,c)=>kb(o,u-r,v-r,u+r,v+r,z,z+.6,c,{foot:0,nb:1,top:(X,Y)=>Math.hypot(X-o[0]-u*s,Y-o[1]-v*s)<r*s?c:null,fi:()=>null,fj:()=>null});
  // THE TABLE AND ITS SIX CHAIRS (the kit's DINING block, u 2.25-3.95, v 2.6-4.4): the chairs' seats and backs, their legs splayed a little;
  // the table's four steel legs and its top; a plate either side at each place, two flower stems down the middle
  function diningSet(o){ SHARED.PNAME='dining table with six chairs'; const bs=[], seats=[2.95,3.5,4.05], h=.18;
    const chair=(uc,vc,back)=>{ for(const su of [-1,1])for(const sv of [-1,1])bs.push(kb(o,uc+su*.16-.015,vc+sv*.16-.015,uc+su*.16+.015,vc+sv*.16+.015,0,11,C.darkWood,{nb:1}));   // (nb: legs and plates cast no shadow, so they don't crowd the light's nearest boxes, 42)
      bs.push(kb(o,uc-h,vc-h,uc+h,vc+h,11,14,C.chair,{foot:0}));
      if(back<0)bs.push(kb(o,uc-h,vc-h,uc-h+.06,vc+h,14,30,C.chair,{foot:0})); else bs.push(kb(o,uc+h-.06,vc-h,uc+h,vc+h,14,30,C.chair,{foot:0})); };
    for(const v of seats)chair(2.45,v,-1);
    for(const u of [2.74,3.39])for(const v of [2.64,4.29])bs.push(kb(o,u,v,u+.07,v+.07,0,22,C.steel,{nb:1}));
    bs.push(kb(o,2.7,2.6,3.5,4.4,22,25,C.tableWood,{foot:0}));
    for(const v of seats)for(const u of [2.9,3.3])bs.push(disc(o,u,v,25,.1,C.plate));
    for(const v of [3.22,3.78])bs.push(kb(o,3.09,v-.01,3.11,v+.01,25,31,C.steel,{foot:0,nb:1}),kb(o,3.08,v-.02,3.12,v+.02,31,34,C.petal,{foot:0,nb:1,top:()=>C.pollen}));
    for(const v of seats)chair(3.75,v,1);
    return prop(bs); }
  // THE SIDEBOARD (u 2.3-3.9, v 0.06-0.5, on four feet): its front (+v) the kit's: the open niche with its shelf, the drawers' lines and
  // handles either side; a vase with a flower and two plates on top
  function sideboard(o){ SHARED.PNAME='sideboard'; const bs=[], fr=(a,z)=>{ const u=2.3+a/32; if(u>2.86&&u<3.34&&z>=7&&z<27)return z===16?sh2(C.niche,.72):C.niche;
      for(const [p,q] of [[2.36,2.8],[3.4,3.84]]){ if(u>p&&u<q&&(z===12||z===21))return sh2(C.boardWood,.57); if(Math.abs(u-(p+q)/2)<.08&&(z===7||z===16||z===24))return C.handle; } return C.boardWood; };
    for(const u of [2.35,3.77])for(const v of [.1,.38])bs.push(kb(o,u,v,u+.08,v+.08,0,4,C.darkWood,{nb:1}));
    bs.push(kb(o,2.3,.06,3.9,.5,3,30,C.boardWood,{foot:1,fj:(x,z)=>sh2(fr(Math.floor((x-o[0]-2.3*s)*FP),Math.floor(z)),.84)}));
    bs.push(kb(o,2.6,.22,2.7,.32,30,40,C.vase,{foot:0,nb:1}));
    for(const u of [3.42,3.7])bs.push(disc(o,u,.28,30,.09,C.plate));
    const p=prop(bs,{bounds:{x0:o[0]+2.2*s,y0:o[1],x1:o[0]+4*s,y1:o[1]+.6*s,z0:0,z1:56},paint(L){ const [x,y]=edPt(o[0]+2.65*s,o[1]+.27*s), [sx,sy]=toS(...vw(x,y)), X=Math.round(sx), Y=Math.round(sy-40), g=[x,y,44,1];
      for(const [dx,dy] of [[0,-1],[0,-2],[0,-3],[0,-4],[-1,-4],[-2,-5],[1,-3],[2,-4],[0,-5],[1,-6]])L.put(X+dx,Y+dy,C.leaf,1e9,g);         // the flower in the vase
      for(const [dx,dy] of [[-3,-7],[1,-9],[3,-6],[-1,-11]]){ for(const [a,b] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]])L.put(X+dx+a,Y+dy+b,C.petal,1e9,g); L.put(X+dx,Y+dy,C.pollen,1e9,g); } }});
    return p; }
  // A WALL LAMP: a small lit box on the wall (its back at -v), its light thrown up the wall and down it (painted light: the kit's two fans of
  // glow) and a real light, small and warm, on by day (own: its own settings in the lighting tab; room: a room's light, as the ceiling lights)
  function wallLamp(o){ SHARED.PNAME='wall lamp'; const uc=.5, glow=(x,z)=>{ const d=Math.abs(x-o[0]-uc*s)/s; return z>=70&&z<84&&d<.06+.24*(z-70)/14||z>=50&&z<60&&d<.06+.14*(60-z)/10?lit(C.glowUp):null; };
    const bs=[kb(o,uc-.32,0,uc+.32,.01,50,84,C.glowUp,{foot:1,nb:1,top:()=>null,fi:()=>null,fj:(x,z)=>glow(x,z)}),kb(o,uc-.08,0,uc+.08,.16,61,69,C.lamp,{foot:0,top:()=>lit(C.lamp),fi:()=>lit(sh2(C.lamp,.9)),fj:()=>lit(C.lamp)})];
    const p=prop(bs,null,{walk:true,hang:50,noLine:true}); LAMPS.push({x:o[0]+uc*s,y:o[1]+.35,z:66,r:3.5,c:[1,.9,.72],own:1,room:1,day:true,prop:p}); return p; }   // (a real light now: the archive's was the experimental mode's only, live)
  // A WALL MIRROR (its back at -v): a white frame, the glass inside it, a gleam across its upper corner
  function mirror(o,w){ SHARED.PNAME='wall mirror'; const L=w*s;
    const face=(x,z)=>{ const a=(x-o[0])/s; if(a<.07||a>w-.07||z<45||z>=71)return C.mirrorFrame; return (z-45)>(w-.07-a)/(w-.14)*26*1.4-4&&(z-45)<(w-.07-a)/(w-.14)*26*1.4+4?C.glassLight:C.glass; };
    return prop([{x0:o[0],y0:o[1],x1:o[0]+L,y1:o[1]+.04,z0:43,z1:73,c:C.mirrorFrame,foot:1,nb:1,top:()=>C.mirrorFrame,fi:()=>C.mirrorFrame,fj:(x,z)=>face(x,z)}],null,{walk:true,hang:43,noLine:true}); }   // (noLine: its white frame kept white, not outlined)
  Object.assign(CATALOG,{'dining table with six chairs':(x,y)=>diningSet([x-3.1*s,y-3.5*s]),'sideboard':(x,y)=>sideboard([x-3.1*s,y-.28*s]),
    'wall lamp':(x,y)=>wallLamp([x-.5*s,y-.08*s]),'white wall mirror':(x,y)=>mirror([x-.85*s/2,y-.02],.85),'wide wall mirror':(x,y)=>mirror([x-1.55*s/2,y-.02],1.55)});
  for(const k of ['dining table with six chairs','sideboard','wall lamp','white wall mirror','wide wall mirror'])KIND_OF[k]=k;
  if(!CAT_DEPTS.some(d=>d[0]==='dining'))CAT_DEPTS.push(['dining','Dining Room']);   // ([key, name]: the book reads pairs, 50-menu-2)
  const info=(no,name,price,desc,mat)=>({no,name,dept:'dining',price,desc,mat});
  Object.assign(CAT_INFO,{'dining table with six chairs':info('DR-101','Dining Table, Six Chairs',2400,'Walnut top on steel legs, six white chairs, set for six.','walnut, steel, ash'),
    'sideboard':info('DR-102','Sideboard',1100,'Low walnut sideboard: drawers, a niche, a vase on top.','walnut'),
    'wall lamp':info('DR-103','Wall Lamp',180,'A small sconce that throws its light up and down the wall.','steel, glass'),
    'white wall mirror':info('DR-104','Wall Mirror',220,'A white-framed mirror.','glass, wood'),'wide wall mirror':info('DR-105','Wide Wall Mirror',340,'A wider white-framed mirror.','glass, wood')});
  // the kit's room, its blue wall at the back (dy 0): the lamps and mirrors on it, the sideboard against it, the table out in the room
  PRESETS['Preset Dining Room 1']=[['wall lamp',.55*s,.08*s,0],['wall lamp',4.95*s,.08*s,0],['white wall mirror',1.925*s,.02,0],['wide wall mirror',3.625*s,.02,0],
    ['sideboard',3.1*s,.28*s,0],['dining table with six chairs',3.1*s,3.5*s,0]]; }

// =====================================================================================
// THE GAMER ROOM'S THINGS (the pack's, archive/old-world/src/25-gamer-room; in Lucky 7's owner's home, 26-zzzzzzzzzzzz-west-awnings): the
// pieces the room had, as they were: the arcade machine, the tube TV and the game console on the floor before it, the red couch facing it,
// the waste bin, the skateboard, the GAME OVER poster and the neon sign. They're the pack's own models: a few boxes (art pixels: x across,
// y toward its front, z up) with a picture for any face, so a turned item shows its other sides (its back, its vents). The screens and the
// neon move (12 steps a second, by the pack's rates): each step's picture made once and put up when the step changes (24-pack-life: life,
// lifeKey). The TV and the neon light the room, real lights now (the archive's were the experimental mode's only). Nothing copies a real
// game or product. Two kinds renamed where the catalog already has the name: 'tube TV' (the bar's TV is 'TV'), 'metal waste bin' (the
// bathroom's is 'waste bin'); the pack's other pieces (desks, speakers, the computer and the rest) stay in the archive.
// =====================================================================================
const QR = {
  black: [34, 32, 40], dark: [62, 58, 66], grey: [128, 128, 136], greyLight: [180, 182, 190], steel: [150, 156, 166],
  red: [206, 62, 46], redDark: [150, 40, 38], green: [70, 255, 110], pink: [255, 80, 200], cyan: [90, 230, 255], ice: [196, 250, 255], yellow: [255, 214, 70], orange: [255, 150, 60],
  screen: [22, 28, 58], sky: [60, 170, 190], hill: [120, 90, 190], ground: [200, 120, 70], sun: [255, 220, 110], board: [120, 176, 226], paper: [236, 226, 206]
};
const GR3 = { A: '010101111101101', R: '111101110101101', C: '111100100100111', D: '110101101101110', E: '111100110100111' };   // the marquee's small letters (the aquarium's 3x5, archived with it)
const GR5 = { A: '01110100011111110001' + '10001', E: '1111110000111101000011111', G: '0111110000101111000101111', M: '1000111011101011000110001',
  O: '0111010001100011000101110', R: '1111010001111101001010001', V: '1000110001100010101000100' };
const GR7 = { 8: '01110100011000101110100011000101110', 0: '01110100011000110001100011000101110', O: '01110100011000110001100011000101110', S: '01111100001000001110000010000111110',
  R: '11110100011000111110101001001010001', M: '10001110111010110101100011000110001' };                    // taller letters for the sign's small words
const grSh = (c, f) => [Math.round(c[0] * f), Math.round(c[1] * f), Math.round(c[2] * f)];
const grMx = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
function grHash(a, b) { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; }
const grE = (c, a) => { const o = a === undefined || a >= 1 ? [c[0], c[1], c[2]] : [c[0], c[1], c[2], Math.round(a * 255)]; o.e = 1; return o; };   // a colour that gives its own light (never shaded, not lit), optionally see-through
const grWord = (word, x, y, px, py) => {                              // is (px, py) on a letter of this word? rows count from the top
  if (px < x || py < y) return false;
  const k = Math.floor((px - x) / 4), cx = (px - x) % 4, row = py - y;
  return k < word.length && cx < 3 && row < 5 && GR3[word[k]][row * 3 + cx] === '1';
};
const grBig = (word, x, y, px, py, scale) => {                        // the same, in wider five-by-five letters
  if (px < x || py < y) return false;
  const s = scale || 1, k = Math.floor((px - x) / (6 * s)), cx = Math.floor(((px - x) % (6 * s)) / s), row = Math.floor((py - y) / s);
  return k < word.length && cx < 5 && row < 5 && GR5[word[k]][row * 5 + cx] === '1';
};
const grTall = (word, x, y, px, py) => {                               // the same, in five-by-seven letters
  if (px < x || py < y) return false;
  const k = Math.floor((px - x) / 6), cx = (px - x) % 6, row = py - y;
  return k < word.length && cx < 5 && row < 7 && GR7[word[k]][row * 5 + cx] === '1';
};
/* ---- pictures for faces. Each is fn(across, up, width, height, frame): across runs left to right as you face that side. ---- */
const grScreen = (pic, strip) => (a, k, w, h, f) => {                 // a glass screen inside a frame; "strip" leaves room for knobs at the right
  const sw = w - 4 - (strip || 0);
  if (strip && a >= w - strip - 1 && a < w - 2) return (a === w - strip + 1 && (k === h - 6 || k === h - 11)) ? QR.greyLight : (k < h >> 1 && k > 2 && k % 2 && a > w - strip) ? QR.black : null;
  return (a < 2 || a >= 2 + sw || k < 2 || k >= h - 2) ? null : grE(pic(a - 2, h - 3 - k, sw, h - 4, f));
};
const grGame = (x, y, w, h, f) => {                                   // an invented game: hills, a sun, floating blocks, a small square hopping along
  const ground = h - 4, hop = [0, 2, 3, 2][f % 4], mid = w >> 1;
  if (y >= ground) return (x + f) % 4 < 2 ? QR.ground : grSh(QR.ground, 0.75);
  if (x >= mid - 1 && x <= mid + 1 && y >= ground - 3 - hop && y < ground - hop) return [255, 255, 255];
  if (y > ground - 6 + Math.round(2.5 * Math.sin((x + f) * 0.45))) return QR.hill;
  if (y >= 6 && y < 8 && (x + f * 2) % 11 < 5) return QR.yellow;
  if (Math.hypot(x - (w - 6), y - 5) < 3) return QR.sun;
  return grMx(QR.sky, [30, 70, 130], y / h);
};
const grCabinet = (x, y, w, h, f) => {                                // the arcade's game: ledges, and a few bright things moving along them
  for (const [ly, c] of [[4, QR.pink], [9, QR.cyan], [14, QR.yellow]]) { if (y === ly && x > 1 && x < w - 2 && (x + ly) % 9 > 1) return [60, 110, 230]; if (y === ly - 1 && (x + f * (ly % 2 ? 1 : -1) + 40) % 13 === 3) return c; }
  return y >= h - 2 ? [200, 60, 60] : [10, 10, 18];
};
const grVents = (c) => (a, k, w, h) => (k > 2 && k < h - 3 && k % 2 && a > 3 && a < w - 4 ? c : null);           // slots in a back panel
const grOver = (a, k, w, h) => {                                      // the poster: GAME OVER, plain words on yellow
  const y = h - 1 - k;
  if (a === 0 || a === w - 1 || y === 0 || y === h - 1) return QR.paper;
  return (grBig('GAME', 2, 6, a, y) || grBig('OVER', 2, 14, a, y)) ? [60, 40, 20] : (y > h - 11 && (a + y) % 4 < 2) ? QR.orange : QR.yellow;
};
const grNeonThin = (x, y, f) => {                                     // "80's" and "ROOM": thin tubes (the whole sign is a 64 by 48 picture)
  if (grTall('80', 22, 5, x, y) || grTall('S', 36, 5, x, y) || (x === 34 && (y === 5 || y === 6))) return QR.ice;
  if (grTall('ROOM', 20, 28, x, y)) return f % 12 === 7 ? grSh(QR.cyan, 0.45) : QR.ice;
  return null;
};
const grNeonThick = (x, y, f) => {                                    // "GAMER", the ring round it, and a short arc
  if (grBig('GAMER', 3, 15, x, y, 2)) return f % 12 === 4 ? grSh(QR.pink, 0.8) : QR.pink;
  const d = Math.hypot(x - 31.5, (y - 23.5) * 1.02);
  if (Math.abs(d - 22.5) < 0.75 && (y < 13 || y > 26)) return QR.pink;
  if (Math.abs(d - 19.5) < 0.6 && y > 36 && x < 30) return QR.yellow;
  return null;
};
const grNeon = (a, k, w, h, f) => {                                   // the tubes, the haze close to the thick ones, and their light washing over the wall (the picture has a 14 pixel margin for it)
  const x = a - 14, y = h - 1 - k - 14, c = grNeonThin(x, y, f) || grNeonThick(x, y, f); if (c) return grE(c);
  let best = null, bd = 9;
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)); if (d < bd) { const q = grNeonThick(x + dx, y + dy, f); if (q) { bd = d; best = q; } } }
  if (best) return grE(best, [0, 0.46, 0.3, 0.2][bd]);
  const far = Math.hypot((x - 31.5) / 44, (y - 23.5) / 36);
  return far < 1 ? grE(QR.pink, 0.13 * Math.ceil((1 - far) * 3) / 3) : null;
};
/* ---- the items' shapes. A part is a box [x0, y0, z0, x1, y1, z1] (x across, y toward its front, z up), a colour, and pictures for its faces. ---- */
const grBox = (b, c, f) => ({ b, c, f });
const grAll = (fn) => ({ front: fn, back: fn, left: fn, right: fn });
const GRM = {
  arcade: () => {
    const trim = (a, k, w, h) => (a === 0 || a === w - 1) ? grE(QR.green) : null, cap = (a, k, w, h) => (a === 0 || a === w - 1 || k === h - 1) ? grE(QR.green) : null, foot = (a, k, w, h) => (a === 0 || a === w - 1 || k === 0) ? grE(QR.green) : null;
    return { w: 28, d: 32, h: 64, frames: 4, rate: 3, parts: [
      grBox([0, 0, 0, 28, 24, 27], QR.black, { front: (a, k, w, h) => (a > 3 && a < w - 4 && k > 3 && k < h - 4) ? QR.yellow : foot(a, k, w, h), left: foot, right: foot, back: (a, k, w, h) => (a === 0 || a === w - 1 || k === 0) ? grE(QR.green) : ((a === 5 || a === w - 6) && k > 4 && k < h - 4 || (k === 5 || k === h - 5) && a > 4 && a < w - 5) ? QR.dark : null }),
      grBox([0, 20, 27, 28, 32, 32], QR.black, { front: (a, k, w, h) => (k > 0 && k < h - 1 && a > 1 && a < w - 2) ? QR.orange : trim(a, k, w, h), left: (a, k, w, h) => (a === w - 1 || k === 0 || k === h - 1) ? grE(QR.green) : null, right: (a, k, w, h) => (a === 0 || k === 0 || k === h - 1) ? grE(QR.green) : null,
        top: (x, y, w, h) => (x === 0 || x === w - 1) ? grE(QR.green) : (y > 2 && y < 7 && x > 4 && x < 10) ? QR.dark : (y > 4 && y < 8 && x > 13 && x < 24 && x % 3 === 0) ? [QR.red, QR.cyan, QR.yellow][Math.floor(x / 3) % 3] : null }),
      grBox([6, 24, 32, 8, 26, 35], QR.red),
      grBox([0, 0, 32, 28, 20, 52], QR.black, { front: (a, k, w, h, f) => (a === 0 || a === w - 1) ? grE(QR.green) : grScreen(grCabinet)(a, k, w, h, f), left: trim, right: trim, back: (a, k, w, h) => (a === 0 || a === w - 1) ? grE(QR.green) : grVents(QR.dark)(a, k, w, h) }),
      grBox([0, 0, 52, 28, 25, 64], QR.black, { front: (a, k, w, h) => (k > 1 && k < h - 2 && a > 1 && a < w - 2) ? (grWord('ARCADE', 3, 4, a, h - 1 - k) ? grE(QR.yellow) : grE([196, 48, 60])) : cap(a, k, w, h), left: cap, right: cap, back: cap, top: (x, y, w, h) => (x === 0 || x === w - 1) ? grE(QR.green) : null })
    ] }; },
  tv: () => ({ w: 36, d: 26, h: 28, frames: 4, rate: 3, light: { r: 4, c: [.7, .98, 1.4] }, parts: [grBox([0, 0, 0, 36, 26, 28], QR.dark, { front: grScreen(grGame, 5), back: (a, k, w, h) => (a > 5 && a < w - 6 && k > 4 && k < h - 5 ? (k % 2 && a > 9 && a < w - 10 && k > 12 ? QR.black : [78, 74, 82]) : null), top: (x, y, w, h) => (y > 2 && y < 6 && x > 3 && x < w - 4 && x % 2 ? QR.black : null) })] }),
  console: () => ({ w: 15, d: 12, h: 4, parts: [grBox([0, 0, 0, 15, 12, 4], QR.greyLight, { front: (a, k, w) => (k === 1 && a > 1 && a < w - 2) ? QR.black : null, top: (x, y, w, h) => (y < h - 4 && y > 1 && x > 2 && x < w - 3) ? QR.grey : null })] }),
  board: () => ({ w: 10, d: 5, h: 54, parts: [grBox([0, 0, 0, 10, 2, 54], QR.board, { front: (a, k, w, h) => (a === 0 || a === w - 1 || k === 0 || k === h - 1) ? [236, 242, 250] : (a > 3 && a < 6 && k > 16 && k < h - 17) ? QR.pink : null }),
    ...[8, 42].flatMap((z) => [grBox([2, 2, z + 1, 8, 3, z + 3], QR.steel), grBox([0, 2, z, 2, 5, z + 4], QR.black), grBox([8, 2, z, 10, 5, z + 4], QR.black)])] }),
  couch: (w) => ({ w, d: 30, h: 29, parts: [grBox([0, 0, 0, w, 30, 11], QR.red, { top: (x, y, w2) => (w > 40 && x === (w2 >> 1) && y > 8) ? QR.redDark : null, front: (a, k, w2) => (w > 40 && a === (w2 >> 1) && k > 3) ? QR.redDark : null }), grBox([0, 0, 11, w, 8, 29], QR.red, { front: (a, k, w2, h2) => (w > 40 && a === (w2 >> 1)) ? QR.redDark : null }), grBox([0, 8, 11, 6, 30, 17], QR.red), grBox([w - 6, 8, 11, w, 30, 17], QR.red)] }),
  bin: () => ({ w: 11, d: 11, h: 15, parts: [grBox([0, 0, 0, 11, 11, 15], QR.grey, Object.assign({ top: (x, y, w, h) => (x > 0 && y > 0 && x < w - 1 && y < h - 1) ? QR.dark : null }, grAll((a, k, w, h) => (a % 3 === 1 && k < h - 2 ? QR.greyLight : null))))] }),
  poster: (w, h) => ({ w, d: 1, h, wall: true, parts: [grBox([0, 0, 0, w, 1, h], QR.paper, { front: grOver })] }),
  neon: () => ({ w: 92, d: 1, h: 76, wall: true, frames: 12, rate: 3, light: { r: 5.5, c: [1.6, .64, 1.28] }, parts: [grBox([0, 0, 0, 92, 1, 76], null, { front: grNeon })] })
};
// ---- a model as a game object. Its corner at x, y (tiles; the pack's 32 px a tile is 24 here, so a pixel is 1/24 tile
// and heights stay the same), its base z art px up. Its faces paint by the side of the world they face (see sided in 22),
// so they turn with it. Shading as the pack's: tops full, the y sides .84, the x sides .68; lit colours never shaded.
function grProp(name,M,x,y,z,o){ SHARED.PNAME=name; const S=1/FP, F=M.frames||0; let cur=0;
  const tone=(c,k)=>!c?null:c.e||k===1?c:grSh(c,k);
  const same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2]&&!a.e===!b.e;
  const boxes=M.parts.map((pt,i)=>{ const [x0,y0,z0,x1,y1,z1]=pt.b, fc=pt.f||{}, h=z1-z0, sides=['front','back','left','right'].some(s=>fc[s]);
    // a picture's pixel: in the world's picture the first step; in the moving layer (LIFE.mode 1) only what's lit and
    // differs from the first step (the rest is already in the world's picture)
    const pic=(fn,a,k,w,hh,sk)=>{ if(!F||LIFE.mode!==1)return tone(fn(a,k,w,hh,0),sk);
      const c=fn(a,k,w,hh,cur); return c&&c.e&&c.length<4&&!same(c,fn(a,k,w,hh,0))?c:null; };
    const plain=sk=>F&&LIFE.mode===1?null:pt.c?grSh(pt.c,sk):null;
    const fs=(nx,ny,X,Y,Z,sk)=>{ const nm=nx>0?'right':nx<0?'left':ny>0?'front':'back', fn=fc[nm]; if(!fn)return plain(sk);
      const px=Math.floor((X-x)*FP), py=Math.floor((Y-y)*FP), k=Math.floor(Z), fb=nm==='front'||nm==='back';
      const a=nm==='front'?px-x0:nm==='back'?x1-1-px:nm==='right'?y1-1-py:py-y0;
      return pic(fn,a,k,fb?x1-x0:y1-y0,h,sk)||plain(sk); };
    const top=(X,Y)=>{ if(!fc.top)return pt.c; const c=fc.top(Math.floor((X-x)*FP)-x0,Math.floor((Y-y)*FP)-y0,x1-x0,y1-y0,0); return c||pt.c; };
    return sided({x0:x+x0*S,y0:y+y0*S,x1:x+x1*S,y1:y+y1*S,z0:z+z0,z1:z+z1,c:pt.c,top,fs,foot:1,nb:pt.c?0:1,life:F&&sides?1:0}); });
  const p=prop(boxes,null,{...o,hang:M.wall?z:0,walk:!!(M.wall&&z>0||M.h<8),life:F?t=>{ cur=Math.floor(t*12/M.rate)%F; }:undefined,lifeKey:F?()=>cur:undefined});
  if(M.light)LAMPS.push({x:x+M.w*S/2,y:y+M.d*S+.15,z:z+M.h/2,r:M.light.r,c:M.light.c,own:1,room:1,day:true,prop:p}); return p; }   // (light: from just in front of its lit face, the screen, the tubes: inside the thing its own boxes shadow it)
// ---- into the catalog: [kind, what it's called, the model, its base height]. Made centred on where you click.
{ const GRK=[['arcade machine','arcade machine',GRM.arcade,0],['tube TV','TV',GRM.tv,0],['game console','game console',GRM.console,0],['couch','couch',()=>GRM.couch(66),0],
    ['metal waste bin','waste bin',GRM.bin,0],['skateboard','skateboard',GRM.board,0],['poster: GAME OVER','poster',()=>GRM.poster(27,34),44],['neon sign: 80s gamer room','neon sign',GRM.neon,26]];
  for(const [kind,name,mk,z] of GRK){ CATALOG[kind]=(x,y)=>{ const M=mk(); return grProp(name,M,Math.round((x-M.w/48)*FP)/FP,Math.round((y-M.d/48)*FP)/FP,z,{}); }; KIND_OF[kind]=kind; }
  if(!CAT_DEPTS.some(d=>d[0]==='gamer'))CAT_DEPTS.push(['gamer','Gamer room']);   // ([key, name]: the book reads pairs, 50-menu-2)
  // the book's pages: today's prices for the real thing (owner, 11 Oct 2026), one short line each
  const D={'arcade machine':['R-803','Arcade Machine',2500,'Upright arcade cabinet.','wood, glass'],'tube TV':['R-812','TV',120,'Tube TV.','plastic, glass'],
    'game console':['R-824','Game Console',120,'Home game console.','plastic'],'couch':['R-804','Couch',900,'Red two-seat couch.','fabric'],
    'metal waste bin':['R-809','Waste Bin',15,'Metal waste bin.','steel'],'skateboard':['R-811','Skateboard',90,'Complete skateboard.','wood, steel'],
    'poster: GAME OVER':['R-839','Poster, GAME OVER',20,'Art poster.','paper'],'neon sign: 80s gamer room':['R-836',"80's Gamer Room Neon Sign",350,'Neon wall sign.','glass, neon']};
  for(const k in D){ const [no,name,price,desc,mat]=D[k]; CAT_INFO[k]={no,name,dept:'gamer',price,desc,mat}; } }

};
export {westAwnings};
