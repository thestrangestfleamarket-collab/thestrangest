// the game's helpers the bodega's, the street kit's and the office furniture's code ask for, as the game has them (20-projection-layers, 21-world-map-2-ground,
// 21-world-map-5-land, 22-props-layers-1-props, 23-w-crystal-cavern's cvNoise; the textures tab at its defaults, so mt is the colour). Copied, not rewritten.
const hash=(a,b,c=0)=>{ let h=(a*374761393+b*668265263+c*2147483647)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
const sh=(c,f)=>{ const o=[Math.min(255,c[0]*f),Math.min(255,c[1]*f),Math.min(255,c[2]*f)]; if(c.e)o.e=c.e; return o; }, mt=(k,c)=>c, CURMAT=0, TEXUV=[0,0], rlf=(c,t)=>c;
function cvNoise(u,v,k){ const i=Math.floor(u), j=Math.floor(v), s=t=>t*t*(3-2*t), su=s(u-i), sv=s(v-j), a=hash(i,j,k), b=hash(i+1,j,k), c=hash(i,j+1,k), d=hash(i+1,j+1,k); return (a+(b-a)*su)*(1-sv)+(c+(d-c)*su)*sv; }
let ROT=0; const LIFE={mode:0}; const STORY=130, T=.1, FP=24, chunkAtL=()=>null, LAMPS=[], CATALOG={}, CAT_INFO={}, CAT_DEPTS=[], WORLD={}, KIND_OF={};
const PROPS=[]; let PNAME='object';
function prop(boxes,extra,o){ const fp=boxes.filter(b=>b.z0===0||b.foot);
  const p={boxes,extra,x0:Math.min(...fp.map(b=>b.x0)),y0:Math.min(...fp.map(b=>b.y0)),x1:Math.max(...fp.map(b=>b.x1)),y1:Math.max(...fp.map(b=>b.y1)),lv:0,id:PROPS.length,name:PNAME,...o};
  p.chunk=chunkAtL((p.x0+p.x1)/2,(p.y0+p.y1)/2,p.lv); PROPS.push(p); return p; }
const sided=b=>b, cutOut=f=>null;
const SQB={lv:-1,hall:{x0:78.5,x1:93.5,y0:-85.2,y1:-77},gym:{x0:78.5,x1:101.24,y0:-99.74,y1:-85.2},lau:{x0:93.5,x1:99.2,y0:-85.2,y1:-77,h:88,lv:-1},H:126,pool:{x0:78.5,x1:101.24,y0:-99.5,y1:-85.5,lv:-2}};
const LSEED={x0:66,split:76,a0:78.5,x1:93.5,c0:96,deep:-104.5,back:-89.5,walk:-77,street:-71,grass:-64,end:-56,   // (deep: the apartment building's back, 27.5 tiles from its front)
  // (the row spaced out, owner 15 Oct 2026, "all buildings have gap", mockups/rooms-on-map-v3.png C2: 2.5 tiles of grass between each building and the next: the bodega x0..split, the apartments a0..x1, the bar c0..b2; 221B on the row too, hall and sr below)
  b2:106,sr:[108.5,119.1],sx0:40,sx1:118,px0:40,px1:118,pend:-28,gym:[70,80],gy1:-46,pool:[80,97],pyp:-44,theatre:[46,66],ty1:-36.5,py0:-58,py1:-38,paths:[[74,77],[88,90],[54,57],[105,107]],   // (real sizes, owner 15 Oct 2026, mockups/downtown-v1-sizes.png: the gym 10 x 12 ("the gym is insanely big"), the pool room 17 x 14 round its 13 x 10 basin, the arcade 16 wide; py1 stays the park row's old depth for the bedroom's path)
  play:[100,112,-58,-42],
  bed:[70,74.1,-39.9,-36.66],bedPath:[[42,44,-64,-34],[42,73,-36,-34]],arcade:[46,66,-58,-47.5],
  mkt:[121.6,132.1,-97.4,-77],mktWalk:[132.1,134.6],
  mus:[120,146,-13.5,7.5],musFront:[132.5,146,-55,-44],musPort:-58};   // (the museum: its front on the park row past the room creator, its portico on the far sidewalk; the museum itself off the map past the dungeon: owner 16 Oct 2026, his pick C of mockups/museum-place-v2.png)   // (the market and lounge past 221B at the row's east end, 2.5 of grass from it as the row is spaced, the land widened to 136 for it (LANDB, 20): owner 15 Oct 2026, merging #517; 10.5 x 20.4 as its picture's door scales it, its market side on a sidewalk and a street to the land's edge: owner, 15 Oct 2026)   // (the second bodega's far side; the sidewalk and street; the park; the gym (14 x 17: owner, 13 Oct 2026, "make gym 25% smaller"), the pool room and the theatre (against the smaller gym's wall), their paths; the playhouse past the pool, the park, the
  // sidewalk and the street grown east to it: owner, 14 Oct 2026, his pick C of mockups/playhouse-place-options.png)
const CITY={tun:{x0:44,x1:51,y0:-104.5,y1:-79,d:90},brg:{x0:140,x1:147,y0:-104.5,y1:-79,deck:96},yc:(LSEED.street+LSEED.grass)/2,wX:[[41.3,43.6],[51.4,53.7]],eX:[[137.4,139.7]],xMouth:[-77,-74.6]};
// the land's buildings this map has (21-world-map-5-land's LB: the bodega, 8 x 14, its back office behind; the square's corner east of it; the second bodega for its code)
const LBLD=[{id:'lbodega',x0:LSEED.split-8,y0:LSEED.walk-14,x1:LSEED.split,y1:LSEED.walk,h:130,st:1,c:[150,70,56]},{id:'lapts',x0:LSEED.a0,y0:LSEED.walk-7,x1:LSEED.x1,y1:LSEED.walk,h:130,st:1},{id:'lbodega3',x0:.8,y0:-58,x1:8.8,y1:-44,h:130,st:1}];
// the ground's kind at a point (landK: 1 grass, 3 the street, 5 the pavement): the sidewalks either side of the street, grass in the gaps between buildings
const landK=(x,y)=>y>=LSEED.street&&y<LSEED.grass?3:y>=LSEED.walk||y>=LSEED.grass?5:1;
const SLAB=[[168,163,150],[161,156,143],[173,168,155]], SEAM=[131,126,115];
const BRICK=[[146,80,63],[137,73,58],[154,88,70],[128,68,54]], MORTAR=[92,54,45], COPE=[182,176,164];
function speck(c,x,y,k){ const n=hash(Math.floor(x*24),Math.floor(y*24),k); return n<.018?sh(c,.9):n>.988?sh(c,1.05):c; }
// NATURAL GRAIN (owner, 15 Oct 2026: "real depth in natural ways, not lined up in a block pattern"; 16 Oct 2026: "do the make more natural
// thing again, do another pass, deep dive"): the ground's light and dark from shapes of their own, never tones picked square by square.
// grain: the lawn's field (cvNoise, 23-w-crystal-cavern: smooth value noise) in three octaves, s its scale, with a pixel's dither so a cut
// through it is a ragged line of pixels, not a contour; crack: a thin line along one level of a noise field, only where a second, broad
// field lets it (so cracks wander, branch and stop, as real ones do); spot: a hashed point in a cell r across, the cell s tiles square
function grain(x,y,k,s=1){ return (cvNoise(x/(5*s),y/(5*s),k)*3+cvNoise(x/(1.7*s),y/(1.7*s),k+2)*2+cvNoise(x*2.3/s,y*2.3/s,k+4))/6+(hash(Math.floor(x*48),Math.floor(y*48),k+6)-.5)*.07; }
function crack(x,y,k,s=1.6,w=.007,on=.55){ return cvNoise(x/(s*4),y/(s*4),k+1)>on&&Math.abs(cvNoise(x/s,y/s,k)-.5)<w; }
function spot(x,y,k,s,r,p){ const i=Math.floor(x/s), j=Math.floor(y/s); if(hash(i,j,k)>p)return false; const cx=(i+.2+hash(i,j,k+1)*.6)*s, cy=(j+.2+hash(i,j,k+2)*.6)*s; return Math.hypot(x-cx,(y-cy))<r; }
function slabCol(x,y){ const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j;            // the pavement: its slabs each their own tone, weathered
  // across them as real pavement is: stains and rain-darkened patches that run over the seams (grain), a hairline crack in some slabs, old
  // gum pressed flat in dark spots, and the seams grown green where the grass is near
  const n=grain(x,y,301,1.2), seam=fx<.043||fy<.043;
  if(seam){ if(n>.6&&landK(x+.6,y)===1||n>.6&&landK(x-.6,y)===1||n>.6&&landK(x,y+.6)===1||n>.6&&landK(x,y-.6)===1)return mt('pavement',hash(Math.floor(x*48),Math.floor(y*48),303)<.5?[96,118,70]:[84,104,62]); return mt('pavement',SEAM); }
  if(hash(i,j,305)<.14&&crack(x,y,307,.9,.012,.3))return mt('pavement',sh(SEAM,.92));
  if(spot(x,y,309,.25,.025,.07))return mt('pavement',[108,104,98]);
  const c=SLAB[Math.floor(hash(i,j,7)*3)]; return mt('pavement',speck(n<.3?sh(c,.94):n<.36&&hash(Math.floor(x*48),Math.floor(y*48),311)<.5?sh(c,.94):n>.72?sh(c,1.03):c,x,y,3)); }
function roadCol(x,y,w){ const c=w?[86,87,90]:[62,64,68], n=grain(x,y,37,1.3), S=LSEED, yc=CITY.yc;
  if(crack(x,y,141,1.5,w?.012:.007,w?.4:.56))return mt('road',sh(c,.7));
  const p=cvNoise(x/3.2,y/3.2,143); if(!w&&p>.76)return mt('road',speck(p<.765?[44,45,48]:[54,55,58],x,y,145));   // a tar patch, its rim
  if(!w&&y>=S.street&&y<S.grass&&Math.abs(Math.abs(y-yc)-1.6)<.45&&cvNoise(x/1.1,y/1.1,147)>.72)return mt('road',speck(sh(c,.82),x,y,149));   // oil in the lane
  return mt('road',speck(n<.34?sh(c,.92):n>.68?sh(c,w?1.08:1.06):c,x,y,41)); }
const DTBRICK=[118,50,44];
const FOOT=(x,y,w,d)=>({x0:x,y0:y,x1:x+w,y1:y+d,z0:0,z1:.01,foot:1,top:()=>null,fi:()=>null,fj:()=>null});   // an invisible footprint (things on walls and roofs stand in the street for stacking)

const GRASSP=[[62,100,50],[76,116,58],[90,132,66],[104,146,74]], GRASSL=[128,168,88], GRASSS=[50,84,42];   // the lawn's four tones, hollow to rise; a tuft's lit blades and its shade
const GRASSY=[[96,104,54],[110,116,60],[124,128,68],[136,138,76]], GEARTH=[[104,88,64],[118,100,74]], GTROD=.32;
function grassCol(x,y){ const n=(cvNoise(x/5,y/5,29)*3+cvNoise(x/1.7,y/1.7,31)*2+cvNoise(x*2.3,y*2.3,33))/6+(hash(Math.floor(x*48),Math.floor(y*48),35)-.5)*.07, dz=hash(Math.floor(x*48),Math.floor(y*48),53);
  // the trodden edge: how near the nearest ground that isn't lawn is (four looks, a quarter tile apart)
  let e=1; for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]])for(const d of [.08,.16,.24,GTROD]){ const k=landK(x+a*d,y+b*d); if(k&&k!==1){ e=Math.min(e,d/GTROD); break; } }
  if(e<1&&n*.6+dz*.4>e*1.1+.25)return mt('grass',GEARTH[dz<.5?0:1]);
  const dry=cvNoise(x/13,y/13,51)+(dz-.5)*.05>.63, P=dry?GRASSY:GRASSP; let c=P[n<.4?0:n<.49?1:n<.58?2:3];
  for(const b of LBLD){ const dx=Math.max(b.x0-x,x-b.x1), dy=Math.max(b.y0-y,y-b.y1); if(dx<.2&&dy<.2&&Math.max(dx,dy)>0&&Math.max(dx,dy)<.2-dz*.08){ c=sh(P[0],.88); break; } }   // the wall's foot
  const cx=Math.floor(x*5), cy=Math.floor(y*5), h=hash(cx,cy,37); if(h<.15+n*.6){ const tx=(cx+.2+hash(cx,cy,39)*.6)/5, ty=(cy+.2+hash(cx,cy,41)*.6)/5, dx=x-tx, dy=y-ty;
    if(dx>=0&&dx<.055&&dy>=-.03&&dy<.03)c=dry?[150,148,92]:GRASSL; else if(dx>=.03&&dx<.085&&dy>=.03&&dy<.07)c=GRASSS; }
  const fl=cvNoise(x/4,y/4,55); if(fl>.62&&!dry){ const i=Math.floor(x*3), j=Math.floor(y*3), q=hash(i,j,57); if(q<.35){ const fx=(i+.2+hash(i,j,59)*.6)/3, fy=(j+.2+hash(i,j,61)*.6)/3, ax=Math.round((x-fx)*48), ay=Math.round((y-fy)*48);
    if(q<.12){ if(ax===0&&ay===0)return mt('grass',[236,200,64]); if(Math.abs(ax)+Math.abs(ay)===1)return mt('grass',[238,238,230]); }   // a daisy
    else if(ax===0&&ay===0||ax===1&&ay===0||ax===0&&ay===1)return mt('grass',sh(GRASSP[0],.86)); } }   // a clover leaf
  return mt('grass',c); }
