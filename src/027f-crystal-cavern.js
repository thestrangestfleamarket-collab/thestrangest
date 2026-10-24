// THE CRYSTAL CAVERN KIT: the old game's cavern pieces as catalog kinds; loads with the old rooms' kits on the first jump.
import {wvV} from './003b-systems.js';
import {CAT_DEPTS, CAT_INFO, CATALOG, hash, KIND_OF, LAMPS, LBLD, LIFE, mt, prop, sh, sided, T, zShift} from './014-gamekit.js';
const crystalCavern=()=>{ '@oldkits';
// =====================================================================================
// THE CRYSTAL CAVERN (owner, 14 Oct 2026, his picture: a level "based on this image", "fully rotatable", "real itemized", "full
// atmospheric elements", "a room off map you can teleport to", "only world in this image": no characters). A cave of its own out in the
// blackness past the orchestra hall (LBLD 'lcave', 21-world-map-5-land: off the map, the map tab's jump list takes you there), 11 by 8
// inside (owner: "2x smaller, but dont lose any of the stuff, just small space") and 230 art px high, every piece drawn by hand in code from the picture (the picture a guide for shape and colour only, as the
// owner's rules have it: nothing cut from it). The floor: big blue flagstones in dark joints, each catching a little light on its
// upper-left edge, darker toward the walls. The walls: rough violet rock in rounded courses, fading into the dark high up; on the back wall
// the great stone arch, two beams of cut stone meeting at the top over the keystone block and its floating gem. Its pieces, each a catalog
// item at real size: the crystal pillars (a stepped stone pedestal, a tall column of blue crystal in two banded collars, a blue light),
// the small crystal clusters in their collars, the keystone block and its gem (bobbing in the air, a cold light), boulders, cave ferns,
// and the wisps (little white lights that drift about the room: moving pictures). The loose stones (kicked about, real physics):
// 47-physics-9-cavern. The pink glowing things in the picture are creatures, not the world, so they are left out.
// =====================================================================================
const CAVB=LBLD.find(b=>b.id==='lcave');
const CAVE={b:CAVB,x0:CAVB.x0+T,x1:CAVB.x1-T,y0:CAVB.y0+T,y1:CAVB.y1-T,H:CAVB.h-4,cx:(CAVB.x0+CAVB.x1)/2,cy:(CAVB.y0+CAVB.y1)/2,in:[CAVB.x0-T,CAVB.y0-T,CAVB.x1+T,CAVB.y1+T]};
const CAVC={grout:[13,15,58],stone:[38,41,104],stoneL:[46,49,120],stoneD:[31,33,92],rim:[62,74,138],rock:[42,36,110],rockD:[28,22,84],rockL:[60,56,140],mortar:[14,8,48],
  beam:[52,58,142],beamL:[74,84,172],beamD:[34,38,110],cryst:[40,40,222],crystL:[104,104,232],crystD:[22,20,170],crystW:[196,200,250],
  collar:[116,116,140],collarL:[150,150,168],collarD:[78,80,104],gem:[150,210,255],gemW:[230,244,255],wisp:[216,214,222],fern:[96,61,166],fernL:[128,90,190],fernD:[60,40,150]};
const cvLit=c=>Object.assign([...c],{e:1});   // a colour that glows: never shaded (the crystals, the gem)
// the nearest of a jittered grid of points (s: the grid's step): how far to it and to the next, and its number (the flagstones, the rock)
function cvCell(u,v,s,k){ const i=Math.floor(u/s), j=Math.floor(v/s); let d1=9, d2=9, id=0, cu=0, cv=0;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){ const I=i+a, J=j+b, px=(I+.15+.7*hash(I,J,k))*s, py=(J+.15+.7*hash(I,J,k+1))*s, d=Math.hypot(u-px,v-py);
    if(d<d1){ d2=d1; d1=d; id=I*131+J*7; cu=px; cv=py; } else if(d<d2)d2=d; }
  return [d1,d2,id,cu,cv]; }
// THE FLOOR (owner, 14 Oct 2026: "real cobblestones with depth and shadow", "grout shadow depth, height of cobblestone"): flagstones
// about three-quarters of a tile across, each standing its own height out of the joints, three blues; every stone's edge is rounded, and
// the light comes from the screen's upper left whichever way the view turns (the view's own vector): the edge that rises toward it is
// lit, a bright rim along it, the far edge falls into the stone's own shadow, and the joint between darkens down into the gap, darker
// still on the shadowed side. A fleck here and there; darker within a tile and a half of the walls
// smooth noise (0-1) from the hashed grid, and THE GROUND'S HEIGHT (owner, 14 Oct 2026: "the heights of the ground ... more natural
// curvatures"): a bowl rising toward the walls with lesser humps and hollows over it, 6 to about 30 art px; the ground is built of
// half-tile cells at these heights (caveGround), each a whole art pixel high, so the curve is stepped a pixel at a time as the art is
function cvNoise(u,v,k){ const i=Math.floor(u), j=Math.floor(v), s=t=>t*t*(3-2*t), su=s(u-i), sv=s(v-j), a=hash(i,j,k), b=hash(i+1,j,k), c=hash(i,j+1,k), d=hash(i+1,j+1,k); return (a+(b-a)*su)*(1-sv)+(c+(d-c)*su)*sv; }
function caveHf(x,y){ const R=CAVE, ew=Math.min(x-R.x0,R.x1-x,y-R.y0,R.y1-y); return 6+8*cvNoise(x/2.2,y/2.2,1501)+4*cvNoise(x/1.1,y/1.1,1503)+2*cvNoise(x/.55,y/.55,1505)+9*Math.max(0,1-ew/2.5)**2; }
const caveH=(x,y)=>Math.max(2,Math.round(caveHf(x,y)));
function caveFloorCol(x,y){ const R=CAVE, c=CAVC, [d1,d2,id,cu,cv]=cvCell(x,y,.78,1401), g=d2-d1;
  const ew=Math.min(x-R.x0,R.x1-x,y-R.y0,R.y1-y), L=wvV(1,0), ln=Math.hypot(L[0],L[1])||1;
  const gx=caveHf(x+.1,y)-caveHf(x-.1,y), gy=caveHf(x,y+.1)-caveHf(x,y-.1), kw=(ew<1.5?.6+.4*ew/1.5:1)*(1+.03*(gx*L[0]+gy*L[1])/ln);   // the ground's slope: lit where it rises toward the light
  const nx=cu-x, ny=cv-y, nn=Math.hypot(nx,ny)||1, lit=-(nx*L[0]+ny*L[1])/(nn*ln);   // (+: this edge faces the light)
  const hgt=.7+.6*hash(id,1,1402);                                                         // how high the stone stands: its shadow and its lit rim the stronger
  if(g<.065){ const t=g/.065; return mt('cope',sh(c.grout,kw*(.3+.5*t*t)*(lit<0?.65:1))); }   // the joint: darkest down in it, darker under the stone's shadowed side
  const n=hash(id,0,1403), base=n<.33?c.stone:n<.66?c.stoneL:c.stoneD, s=g<.25?1-(g-.065)/.185:0;   // s: how steeply the rounded edge falls away here
  let k=1+.55*hgt*s*lit+.1*Math.max(0,1-d1/.35);                                                     // the slope toward or from the light; the stone's crown
  if(g<.065+.07*hgt*Math.max(0,-lit))k=.42;                                                          // the stone's own shadow, cast into the joint on its far side
  else if(g<.1&&lit>.2)k=1.35+.2*hgt;                                                                // the rim catching the light
  const f=hash(Math.floor(x*24),Math.floor(y*24),1405); return mt('cope',sh(f<.025?sh(base,.8):f>.985?sh(base,1.1):base,kw*Math.max(.3,k))); }
// a rock face: rounded stones in rounded courses, their tops catching the light, dark mortar between, dark at the foot, and above about half
// the height fading into the dark the way a cave's roof does (u along the face in tiles, z up it in art px, f the face's shade)
function caveRock(u,z,f,seed=1407){ const H=CAVE.H, v=z/24, [d1,d2,id,cu,cv]=cvCell(u,v*.8,.9,seed), g=d2-d1, c=CAVC;
  const dark=z>H*.42?Math.max(.22,1-(z-H*.42)/(H*.58)*.85):1, k=f*dark*(z<5?.7:1);
  if(g<.05)return sh(c.mortar,k);
  const n=hash(id,0,seed+2), base=n<.3?c.rockD:n<.65?c.rock:c.rockL;
  if(g<.11&&cv<v*.8)return sh(sh(base,1.3),k);
  const s=hash(Math.floor(u*24),Math.floor(z),seed+4); return sh(s<.03?sh(base,.78):s>.98?sh(base,1.12):base,k); }
// THE WALLS inside (facadeCol, 22): rock all round; on the back wall the arch, two beams of cut stone sloping up from the floor to meet
// over the keystone (joints a tile apart along them, a lit upper edge, a shadow line under them), the rock within them, darker rock without
function caveWall(q,nx,ny,X,Y,z,f){ const R=CAVE, e=.06, u=nx?Y:X, c=CAVC;
  if(z<0)return sh(c.rockD,f);
  if(ny>0&&Math.abs(Y-R.y0)<e){ const du=Math.abs(X-R.cx), zc=R.H-18-du*40, t=z-zc, along=Math.floor((du*40+z*.9)/26), jt=(du*40+z*.9)-along*26;
    if(zc>14&&Math.abs(t)<12){ const k=f*(z>R.H*.6?.8:1); if(jt<2)return sh(c.beamD,k); if(t>8)return sh(c.beamL,k); if(t<-8)return sh(c.beamD,k);
      const s=hash(Math.floor(X*24),Math.floor(z),1409); return sh(s<.04?sh(c.beam,.85):s>.97?sh(c.beam,1.1):c.beam,k); }
    if(zc>14&&t<-12&&t>-18)return sh(caveRock(u,z,f),.55);                                           // the shadow under the beam
    if(t>12)return sh(caveRock(u,z,f,1411),.62);                                                       // the dark beyond the arch
    return caveRock(u,z,f); }
  return caveRock(u,z,f,nx?1413:1415); }
// ---- the pieces: boxes, their faces by the side of the world they face (sided, 22); a rock face lit along its top, dark at its foot
const cvFace=(c,z,h,k,u,seed)=>{ const s=hash(Math.floor(u*24),Math.floor(z),seed); return sh(z>h-2?sh(c,1.3):z<1.5?sh(c,.7):s<.04?sh(c,.84):s>.97?sh(c,1.1):c,k); };
const cvTop=(c,seed)=>(X,Y)=>{ const s=hash(Math.floor(X*24),Math.floor(Y*24),seed); return s<.05?sh(c,1.18):s>.96?sh(c,.88):sh(c,1.08); };
const cvBox=(x0,y0,x1,y1,z0,z1,c,seed,o)=>sided({x0,y0,x1,y1,z0,z1,c,foot:z0===0?1:0,top:cvTop(c,seed),fs:(nx,ny,X,Y,z,k)=>cvFace(c,z,z1-z0,k,nx?Y:X,seed),...o});
// a rounded block: two boxes crossed (an octagon's footprint), hw its half width, the corners cut by d
const cvOct=(B,x,y,hw,d,z0,z1,c,seed,o)=>{ B.push(cvBox(x-hw,y-hw+d,x+hw,y+hw-d,z0,z1,c,seed,o),cvBox(x-hw+d,y-hw,x+hw-d,y+hw,z0,z1,c,seed+1,o)); };
// a crystal face: facets as bands of three blues up the face, a bright edge where two meet, the odd spark; it glows (lit), a little duller
// on the shadowed sides so it still reads as a solid thing
function cvCrystal(u,z,k,seed=1421){ const c=CAVC, b=Math.floor((u+.5)*5+seed%3)%3, base=b===0?c.crystL:b===1?c.cryst:c.crystD;
  const edge=(((Math.floor(u*24)+Math.floor(z)+seed)%37)+37)%37<2, spark=hash(Math.floor(u*24),Math.floor(z),seed)<.012;
  return cvLit(sh(spark||edge?c.crystW:base,k>.7?1:.86)); }
// a stone collar round a crystal: pale stone with a bevel, a square rune plate in the middle of each face (a dark grid carved in it)
function cvCollar(u,z,h,k){ const c=CAVC, cu=u-Math.round(u), plate=Math.abs(cu)<.22&&z>3&&z<h-3;
  if(plate){ const inner=Math.abs(cu)<.16&&z>5&&z<h-5, gx=Math.floor((cu+.16)*48/3), gz=Math.floor((z-5)/3); return sh(inner&&(gx+gz)%2===0&&hash(gx,gz,1423)<.75?c.collarD:c.collarL,k); }
  return sh(z>h-2?c.collarL:z<2?c.collarD:c.collar,k); }
// THE CRYSTAL PILLAR: a pedestal of three rounded steps of rock, the column of blue crystal on it (two collars round it, a pointed top),
// its light; the sparks across it move (a life picture of a few steps)
function crystalPillar(x,y){ PNAME='crystal pillar'; const B=[], c=CAVC, seed=Math.abs(Math.round(x*7+y*3));
  cvOct(B,x,y,1.2,.4,0,16,c.rock,seed); cvOct(B,x,y,.95,.3,16,30,c.rock,seed+2); cvOct(B,x,y,.7,.22,30,40,c.rockL,seed+4);
  const col=(hw,z0,z1)=>sided({x0:x-hw,y0:y-hw,x1:x+hw,y1:y+hw,z0,z1,c:c.cryst,foot:0,top:()=>cvLit(c.crystL),fs:(nx,ny,X,Y,z,k)=>cvCrystal((nx?Y-y:X-x)/hw*.5,z+z0,k,seed)});
  B.push(col(.5,40,196),col(.36,196,212),col(.22,212,224),col(.1,224,232));
  for(const z0 of [92,146])B.push(sided({x0:x-.62,y0:y-.62,x1:x+.62,y1:y+.62,z0,z1:z0+18,c:c.collar,foot:0,top:()=>c.collarL,fs:(nx,ny,X,Y,z,k)=>cvCollar((nx?Y-y:X-x)/1.24+.5,z,18,k)}));
  const FL={ph:0}; B.push(sided({x0:x-.5,y0:y-.5,x1:x+.5,y1:y+.5,z0:40,z1:196,c:c.crystW,foot:0,life:1,top:()=>null,
    fs:(nx,ny,X,Y,z,k)=>{ if(typeof LIFE==='undefined'||LIFE.mode!==1)return null; const u=Math.floor((nx?Y-y:X-x)*48), q=Math.floor(z/2); return hash(u,q,1431+FL.ph+seed)<.012?cvLit(c.crystW):null; }}));
  const p=prop(B,null,{cave:1}); p.life=t=>{ FL.ph=Math.floor(t*3)%6; }; p.lifeKey=()=>FL.ph;
  for(const [a,b] of [[1,1],[-1,-1]])LAMPS.push({x:x+a,y:y+b,z:170,r:12,c:[.6,.72,2.1],own:1,room:1,day:true,in:CAVE.in,prop:p}); return p; }   // (the crystal's own light, either side of the column: a light inside a thing lights none of its faces)
// A CRYSTAL CLUSTER: three shards of crystal standing out of a collar on the floor, a small blue light
function crystalCluster(x,y){ PNAME='crystal cluster'; const B=[], c=CAVC, seed=Math.abs(Math.round(x*5+y*11));
  const shard=(dx,dy,hw,h)=>{ const cx=x+dx, cy=y+dy, s=(a,z0,z1)=>sided({x0:cx-a,y0:cy-a,x1:cx+a,y1:cy+a,z0,z1,c:c.cryst,foot:z0===0?1:0,top:()=>cvLit(c.crystL),fs:(nx,ny,X,Y,z,k)=>cvCrystal((nx?Y-cy:X-cx)/a*.5,z+z0,k,seed+Math.round(dx*9))});
    B.push(s(hw,0,h),s(hw*.6,h,h+5),s(hw*.3,h+5,h+8)); };
  shard(-.2,-.08,.2,38); shard(.16,.12,.16,30); shard(.06,-.22,.12,22);
  B.push(sided({x0:x-.5,y0:y-.5,x1:x+.5,y1:y+.5,z0:12,z1:24,c:c.collar,foot:0,top:()=>c.collarL,fs:(nx,ny,X,Y,z,k)=>cvCollar((nx?Y-y:X-x)+.5,z,12,k)}));
  const p=prop(B,null,{cave:1}); LAMPS.push({x,y,z:16,r:4.5,c:[.5,.6,1.7],own:1,room:1,day:true,in:CAVE.in,prop:p}); return p; }
// THE KEYSTONE: a block of cut stone under the arch's top, a chevron carved on its faces, and the gem that floats over it, bobbing (a
// life picture of six steps), its cold light
function keystone(x,y){ PNAME='keystone'; const c=CAVC, seed=1441, B=[];
  const face=(u,z,h,k)=>{ const cu=u-Math.round(u), v=Math.abs(cu)*48, chev=z>h-24&&z<h-6&&Math.abs((h-6-z)-v)<2.2; return chev?sh(c.beamL,k*1.15):cvFace(c.beam,z,h,k,u,seed); };
  B.push(sided({x0:x-.7,y0:y-.55,x1:x+.7,y1:y+.55,z0:0,z1:30,c:c.beam,foot:1,top:cvTop(c.beamL,seed),fs:(nx,ny,X,Y,z,k)=>face((nx?Y-y:X-x)+.5,z,30,k)}));
  B.push(sided({x0:x-.5,y0:y-.4,x1:x+.5,y1:y+.4,z0:30,z1:36,c:c.beamD,foot:0,top:cvTop(c.beam,seed+2),fs:(nx,ny,X,Y,z,k)=>cvFace(c.beamD,z,6,k,nx?Y:X,seed+2)}));
  const FL={ph:0}, BOB=[0,1,2,3,2,1];
  B.push(sided({x0:x-.14,y0:y-.14,x1:x+.14,y1:y+.14,z0:44,z1:60,c:c.gem,foot:0,life:1,top:()=>null,
    fs:(nx,ny,X,Y,z,k)=>{ if(!nx||typeof LIFE==='undefined'||LIFE.mode!==1)return null; const zz=z-BOB[FL.ph]; if(zz<0||zz>=12)return null; const w=zz<6?zz/6:(12-zz)/6, u=Math.abs(nx?Y-y:X-x)/.14;
      if(u>w)return null; return cvLit(u<w*.4&&zz>3&&zz<9?c.gemW:c.gem); }}));
  const p=prop(B,null,{cave:1}); p.life=t=>{ FL.ph=Math.floor(t*4)%6; }; p.lifeKey=()=>FL.ph;
  LAMPS.push({x,y,z:52,r:5,c:[.8,1.2,2],own:1,room:1,day:true,in:CAVE.in,prop:p}); return p; }
// A BOULDER: a rounded rock in three rounded steps, s its size (tiles of half width), sd its seed
function boulder(x,y,s=.8,sd=0){ PNAME='boulder'; const B=[], c=CAVC, seed=1451+sd*3, n=hash(sd,1,1453), base=n<.4?c.rock:n<.7?c.rockD:c.rockL;
  cvOct(B,x,y,s,s*.3,0,Math.round(s*18),base,seed); cvOct(B,x+s*.1,y-s*.08,s*.78,s*.26,Math.round(s*18),Math.round(s*30),base,seed+2); cvOct(B,x+s*.16,y-s*.1,s*.5,s*.18,Math.round(s*30),Math.round(s*37),sh(base,1.08),seed+4);
  return prop(B,null,{cave:1}); }
// A CAVE FERN: fronds fanning up from the floor (purple, as the picture's), drawn on four thin crossed sheets so it reads from every turn;
// you walk through it
function caveFern(x,y){ PNAME='cave fern'; const c=CAVC, seed=Math.abs(Math.round(x*13+y*7)), H=28;
  const frond=(u,z,k)=>{ for(let j=-2;j<=2;j++){ const su=j*.1*z/H+(j?.012*Math.sin(z/5+j):0), d=Math.abs(u-su); if(d<.014&&z<H-2-Math.abs(j)*3)return sh(c.fernD,k);
      if(d<.06&&z>4&&z<H-3-Math.abs(j)*3&&Math.floor(z+j)%3!==1&&d>.014)return sh(Math.floor(z)%2?c.fern:c.fernL,k*(d<.035?1:.92)); } return null; };
  const sheet=(ax)=>sided({x0:ax?x-.03:x-.32,y0:ax?y-.32:y-.03,x1:ax?x+.03:x+.32,y1:ax?y+.32:y+.03,z0:0,z1:H,c:c.fern,foot:1,nb:1,top:()=>null,fs:(nx,ny,X,Y,z,k)=>nx?(ax?frond(Y-y,z,k):null):(ax?null:frond(X-x,z,k))});
  return prop([sheet(0),sheet(1)],null,{cave:1,walk:true,high:true}); }
// A WISP: a little white light that drifts about its spot, a moving picture drawn each step (lifeDraw, 24-pack-life); nothing of it is
// in the scenery's picture, only its place (an empty box: where its picture is)
function wisp(x,y,sd=0){ PNAME='wisp'; const c=CAVC, p=prop([{x0:x-.5,y0:y-.5,x1:x+.5,y1:y+.5,z0:0,z1:60,c:c.wisp,foot:1,top:()=>null,fi:()=>null,fj:()=>null}],null,{cave:1,walk:true,high:true});
  p.lifeDraw=(D,W,Hh,ox,oy,t,K=1)=>{ const fw=p.ed||((a,b)=>[a,b]), px=x+.4*Math.sin(t*.37+sd), py=y+.4*Math.cos(t*.29+sd*1.7), z=28+14*Math.sin(t*.51+sd*2.3), bright=.8+.2*Math.sin(t*2.1+sd);
    const [wx,wy]=fw(px,py), [vx,vy]=vw(wx,wy), sx=Math.round(((vx-vy)*HW-ox)*K), sy=Math.round(((vx+vy)*HH-z-oy)*K);
    const put=(a,b,col,al)=>{ for(let j=0;j<K;j++)for(let i=0;i<K;i++){ const X=sx+a*K+i, Y=sy+b*K+j; if(X<0||Y<0||X>=W||Y>=Hh)continue; const q=(Y*W+X)*4; D[q]=col[0]*bright; D[q+1]=col[1]*bright; D[q+2]=col[2]*bright; D[q+3]=al; } };
    for(const [a,b] of [[0,0],[1,0],[0,1],[1,1]])put(a,b,[255,255,255],255);
    for(const [a,b] of [[-1,0],[-1,1],[2,0],[2,1],[0,-1],[1,-1],[0,2],[1,2]])put(a,b,c.wisp,230);
    for(const [a,b] of [[-2,0],[-2,1],[3,0],[3,1],[0,-2],[1,-2],[0,3],[1,3],[-1,-1],[2,-1],[-1,2],[2,2]])put(a,b,[150,150,190],110); };
  return p; }
// THE GROUND: half-tile cells of rock at the height field's heights, their tops the flagstones, their sides rock (a ledge where one stands
// over its neighbour); you walk up and down them a step at a time (stands, 30-walking), and the loose stones lie on them (47-physics-9)
function caveGround(){ PNAME='cave floor'; const R=CAVE, cs=.5, nx=Math.round((R.x1-R.x0)/cs), ny=Math.round((R.y1-R.y0)/cs);
  for(let J=0;J<ny;J+=4)for(let I=0;I<nx;I+=4){ const B=[], st=[];
    for(let j=J;j<Math.min(ny,J+4);j++)for(let i=I;i<Math.min(nx,I+4);i++){ const x0=R.x0+i*cs, y0=R.y0+j*cs, x1=x0+cs, y1=y0+cs, h=caveH(x0+cs/2,y0+cs/2);
      B.push(sided({x0,y0,x1,y1,z0:0,z1:h,c:CAVC.stone,foot:1,top:(X,Y)=>caveFloorCol(X,Y),fs:(nx,ny,X,Y,z,k)=>cvFace(CAVC.rockD,z,h,k,nx?Y:X,1507)})); st.push({x0,y0,x1,y1,z:h}); }
    prop(B,null,{cave:1,walk:true,stands:st}); } }
// THE WALLS' ROCK (owner: "have the wall cave inwards, no rigid lines"): rings of rock ledges up the walls in bands 14 art px high, each
// band set further into the room than the one under it (a curve: 1.8 tiles in by the roof), its edge wandering along the wall and up it
// by noise, so no edge runs straight; cut from half-tile segments. The lowest band stands solid; the rest hang (high: taken down with the
// walls in front of you, as the walls are). The back wall keeps only its lowest band, so the arch painted on it shows in full (owner,
// 15 Oct 2026: "put the arch back in full")
function caveLedges(){ PNAME='cave rock'; const R=CAVE, H=R.H, band=14, seg=.5, ins=(u,z,k)=>.1+1.7*(z/H)**2+.3*cvNoise(u*1.3,z/30,1511+k);
  for(const [ax,at,sg,a0,a1,k] of [['y',R.y0,1,R.x0,R.x1,0],['y',R.y1,-1,R.x0,R.x1,1],['x',R.x0,1,R.y0,R.y1,2],['x',R.x1,-1,R.y0,R.y1,3]])
    for(let zb=0;zb<H-4;zb+=band*2){ if(k===0&&zb>0)continue; const B=[];   // (the back wall: only its foot band, so the arch shows in full: owner, 15 Oct 2026)
      for(const z0 of [zb,zb+band]){ if(z0>=H-4)continue; const z1=Math.min(z0+band,H-4);
        for(let u=a0;u<a1-1e-6;u+=seg){ const d=ins(u,z0+band/2,k), u1=Math.min(u+seg,a1), b0=at, b1=at+sg*d;
          const bx=ax==='y'?{x0:u,x1:u1,y0:Math.min(b0,b1),y1:Math.max(b0,b1)}:{y0:u,y1:u1,x0:Math.min(b0,b1),x1:Math.max(b0,b1)};
          B.push(sided({...bx,z0,z1,c:CAVC.rock,foot:z0===0?1:0,top:(X,Y)=>caveRock(ax==='y'?X:Y,z1,.9,1513+k),fs:(nx,ny,X,Y,z,kk)=>caveRock(nx?Y:X,z+z0,kk,1413+k)})); } }
      prop(B,null,zb===0?{cave:1}:{cave:1,walk:true,high:true}); } }
// a piece set on the ground where it stands (its boxes and its light lifted by the ground's height there)
function onGround(p){ const dz=caveH((p.x0+p.x1)/2,(p.y0+p.y1)/2); p.boxes=p.boxes.map(b=>zShift(b,dz)); for(const l of LAMPS)if(l.prop===p)l.z+=dz; return p; }
// ---- THE CATALOG: each piece an item (centred where clicked)
CATALOG['crystal pillar']=(x,y)=>crystalPillar(x,y); CATALOG['crystal cluster']=(x,y)=>crystalCluster(x,y); CATALOG['keystone']=(x,y)=>keystone(x,y);
CATALOG['boulder']=(x,y)=>boulder(x,y,.8,Math.round(x*3+y)); CATALOG['cave fern']=(x,y)=>caveFern(x,y); CATALOG['wisp']=(x,y)=>wisp(x,y,Math.round(x+y*2));
if(!CAT_DEPTS.some(d=>d[0]==='Crystal Cavern'))CAT_DEPTS.push(['Crystal Cavern','Crystal Cavern']);   // ([key, name]: the book reads pairs, 50-menu-2)
Object.assign(CAT_INFO,{'crystal pillar':{n:1801,name:'Crystal pillar',dept:'Crystal Cavern',price:'$2,400',line:'A column of blue crystal on a stone pedestal, banded in rune collars; it glows.'},
  'crystal cluster':{n:1802,name:'Crystal cluster',dept:'Crystal Cavern',price:'$380',line:'Three shards of blue crystal in a stone collar.'},
  'keystone':{n:1803,name:'Keystone',dept:'Crystal Cavern',price:'$900',line:'A block of cut stone with a chevron; a gem floats over it.'},
  'boulder':{n:1804,name:'Boulder',dept:'Crystal Cavern',price:'$120',line:'A rounded cave rock.'},
  'cave fern':{n:1805,name:'Cave fern',dept:'Crystal Cavern',price:'$18',line:'A purple fern of the deep caves.'},
  'wisp':{n:1806,name:'Wisp',dept:'Crystal Cavern',price:'$0',line:'A little white light that drifts about. Nobody knows what it is.'}});
for(const k of ['crystal pillar','crystal cluster','keystone','boulder','cave fern','wisp'])KIND_OF[k]=k;
// ---- THE ROOM AS THE PICTURE HAS IT: the pillars either side of the arch, the keystone under its top, boulders along the back and sides,
// the clusters at the sides and front corners, ferns by the pillars, five wisps; the loose stones: 47-physics-9-cavern. No light but the
// crystals' and the gem's (owner, 14 Oct 2026: "no light source above other than in scene, its in a dark cave roof")
// (three boulders and a cluster moved a step, 15 Oct 2026, out of the rock, the keystone and the pillar they stood in: 43-4)
{ const u=(a,b)=>[CAVE.x0+a,CAVE.y0+b], g=p=>onGround(p); caveGround(); caveLedges();
  g(crystalPillar(...u(1.8,1.7))); g(crystalPillar(...u(9.2,1.7))); g(keystone(...u(5.5,.85)));
  [[4,.65,.5,1],[7.2,.7,.55,2],[8.15,.55,.4,3],[.6,3.5,.45,4],[10.4,3.8,.45,5],[.5,6,.35,6],[10.5,6.2,.4,7],[3,.5,.35,8],[4.65,.45,.3,9]].forEach(([a,b,sz,sd])=>g(boulder(...u(a,b),sz,sd)));
  for(const [a,b] of [[.8,6.6],[10.1,6.6],[.5,4.6],[10.5,4.8],[2,7.4],[9,7.4]])g(crystalCluster(...u(a,b)));
  for(const [a,b] of [[2.6,.6],[8.6,.7],[.6,2.4],[10.4,2.3],[6.5,.5]])g(caveFern(...u(a,b)));
  [[2.5,2.5],[4.5,4],[7,2.8],[8.5,5],[4,6]].forEach(([a,b],i)=>g(wisp(...u(a,b),i))); }
PNAME='object';

};
export {crystalCavern};
