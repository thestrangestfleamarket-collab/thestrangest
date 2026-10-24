// THE BEDROOM KIT: the old game's bedroom pieces as catalog kinds; loads with the old rooms' kits on the first jump.
import {CAT_DEPTS, CAT_INFO, CATALOG, hash, KIND_OF, LAMPS, LBLD, mt, prop, sh, speck, T} from './014-gamekit.js';
const bedroomKit=()=>{ '@oldkits';
  const DET=2, newsOpen=()=>{};   // the old renderer's detail level (full) and the market news: not here
// =====================================================================================
// THE BEDROOM (owner, 13 Oct 2026, his picture: "new scene for game. every item real, with physics and in game. rotatable room. put it next
// to the gym. real lighting"; "4 x 3, true to picture"): a small room behind the park's gym (LBLD 'lbed', 21-world-map-5-land), 3.9 x 3.04
// inside, its ceiling 74 art px up, a wall standing out 0.31 x 0.8 in its back left corner (a chimney breast's). Here its look: the walls,
// cream plaster with the picture's framed prints and posters hung on them, drawn by hand from it (at this size the picture's pixels are two to
// an art pixel: drawn at that, shown at the scenery's detail by fours, bedCanvas), the vines of the hanging pot climbing the back wall, the string
// lights by the pink poster (they glow); the floor, honey boards. Its things (the furniture and everything on it, all real bodies): 47-
// physics-4-bedroom. Characters someone else owns, in the picture, left out (owner, 13 Oct 2026: "remove the trademarked characters").
// =====================================================================================
const BEDR=(B=>({b:B,x0:B.x0+T,y0:B.y0+T,x1:B.x1-T,y1:B.y1-T,jx:.31,jy:.8,H:B.h-4}))(LBLD.find(b=>b.id==='lbed'));
// a wall's picture, painted once: W x H fine pixels, c along the wall from its back end, q up from the floor (both in fine pixels: 48 a
// tile along, 2 an art pixel up); null where it's plain plaster
function bedCanvas(W,H,draw){ const a=new Array(W*H).fill(null), px=(c,q,col)=>{ c=Math.floor(c); q=Math.floor(q); if(c>=0&&c<W&&q>=0&&q<H&&col)a[q*W+c]=col; };
  const g={px,box:(c0,q0,c1,q1,col)=>{ for(let q=Math.floor(q0);q<q1;q++)for(let c=Math.floor(c0);c<c1;c++)px(c,q,col); },
    disc:(cx,cq,rx,rq,col)=>{ for(let q=Math.floor(cq-rq);q<=cq+rq;q++)for(let c=Math.floor(cx-rx);c<=cx+rx;c++)if(((c+.5-cx)/rx)**2+((q+.5-cq)/rq)**2<=1)px(c,q,col); },
    frame:(c0,q0,c1,q1,w,col)=>{ g.box(c0,q0,c1,q0+w,col); g.box(c0,q1-w,c1,q1,col); g.box(c0,q0,c0+w,q1,col); g.box(c1-w,q0,c1,q1,col); },
    line:(c0,q0,c1,q1,col)=>{ const n=Math.ceil(Math.max(Math.abs(c1-c0),Math.abs(q1-q0)))+1; for(let i=0;i<=n;i++)px(c0+(c1-c0)*i/n,q0+(q1-q0)*i/n,col); },
    shape:(c0,q0,rows,pal)=>rows.forEach((r,j)=>[...r].forEach((k,i)=>{ if(k!=='.')px(c0+i,q0+rows.length-1-j,pal[k]); }))};   // (rows top first, a letter a colour)
  draw(g); const get=(c,q)=>{ c=Math.floor(c); q=Math.floor(q); return c>=0&&c<W&&q>=0&&q<H?a[q*W+c]:null; };
  // at the scenery's detail (DET 1: an art pixel is two of these), each art pixel the colour most of its four have, if two or more aren't plaster
  const a1=[]; for(let q=0;q<H;q+=2)for(let c=0;c<W;c+=2){ const n=new Map(); let best=null, bn=1; for(const [i,j] of [[0,0],[1,0],[0,1],[1,1]]){ const v=get(c+i,q+j); if(!v)continue; const k=v.join()+(v.e?'e':''), m=(n.get(k)||0)+1; n.set(k,m); if(m>bn||m===bn&&!best){ best=v; bn=m; } }
    a1[(q>>1)*Math.ceil(W/2)+(c>>1)]=[...n.values()].reduce((s,v)=>s+v,0)>=2?best:null; }
  const W1=Math.ceil(W/2); return (c,q)=>DET>=2?get(c,q):(c>=0&&q>=0&&c<W&&q<H?a1[(Math.floor(q)>>1)*W1+(Math.floor(c)>>1)]:null); }
const bedGlow=c=>{ const o=c.slice(); o.e=1; return o; };   // a colour that glows (a string light's bulb: never shaded, 20's e)
// THE PICTURE'S WALL THINGS, by wall. The left wall (its x0 face): the pastel print of little dark fish, the black frame with the white swan,
// the two small frames, a round sticker, the orange plaque, two snapshots; the hook the headphones hang on (they're a body: 47-physics-4)
const BEDART={
  left:bedCanvas(146,148,g=>{
    // the print: a thin silver frame, a white mat, pastel washes of pink, green and lemon, nine little dark fish swimming across
    g.box(70,96,113,134,[118,120,132]); g.box(71,97,112,133,[200,202,212]); g.box(72,98,111,132,[250,250,244]); g.box(74,100,109,130,[240,236,214]);
    for(const [c,q,w,h,col] of [[76,121,9,5,[246,196,206]],[86,124,8,4,[200,236,180]],[96,118,11,5,[246,196,206]],[78,110,10,5,[200,236,180]],[90,108,9,6,[248,240,180]],
      [100,104,7,6,[200,236,180]],[76,101,8,4,[248,240,180]],[88,101,10,4,[246,196,206]],[102,125,6,4,[248,240,180]]])g.box(c,q,c+w,q+h,col);
    for(const [c,q,s] of [[80,124,1],[94,126,-1],[104,121,1],[83,113,-1],[96,112,1],[105,106,-1],[79,104,1],[92,103,-1],[100,128,1]])
      g.shape(c-2,q-1,s>0?['.k.k','kkkk','k.k.']:['k.k.','kkkk','.k.k'],{k:[58,70,72]});
    // the swan: a black frame on a cream edge, dark green inside, a white swan with its neck curved
    g.box(120,68,140,99,[238,232,198]); g.box(121,69,139,98,[26,36,34]); g.box(123,71,137,96,[44,62,56]);
    g.shape(125,74,['....ww....','...w..w...','..w....w..','...ww..w..','.....w.w..','....ww.w..','...wwwww..','.wwwwwwww.','wwwwwwwww.','.wwwwwww..','..wwwww...'],{w:[226,232,222]});
    g.box(128,86,130,93,[226,232,222]); g.px(129,93,[226,232,222]); g.px(128,94,[226,232,222]); g.px(127,94,[30,30,30]);
    // the small dark frame with a red flower, a round sticker under it
    g.box(80,73,91,91,[34,50,46]); g.box(81,74,90,90,[236,226,190]); g.box(83,76,88,88,[80,112,72]); g.disc(85.5,83,2,2,[204,62,52]); g.px(85,83,[240,200,90]); g.box(85,77,86,81,[56,90,52]);
    g.disc(84.5,67,3,3,[72,66,196]); g.disc(84.5,67,1.5,1.5,[156,96,206]);
    // the white frame, teal inside, a dark cat sitting
    g.box(59,66,75,89,[150,150,156]); g.box(60,67,75,89,[246,246,242]); g.box(62,69,73,87,[122,194,184]);
    g.shape(63,70,['..k...k...','..kk.kk...','..kkkkk...','..kwkwk...','..kkkkk...','...kkk....','..kkkkk...','.kkkkkkk..','.kkkkkkk..','kkkkkkkk..','kkkkkkkkk.','.kkkkkkk.k','..kkkkk..k'],{k:[38,48,60],w:[220,230,160]});
    // the orange plaque: a pointed wooden shape on a dark edge
    g.shape(57,95,['..d...','.dod..','.dod..','doood.','doood.','doood.','doood.','doood.','dooood','dooood','dooood','dooood','dooood','dooood','dooood','dooood','dooood','dooood','dooood','dooood','dddddd'],{d:[86,42,30],o:[224,144,72]});
    g.box(59,100,61,112,[244,180,104]);
    // two snapshots, brown frames
    g.box(55,52,63,62,[150,98,52]); g.box(56,53,62,61,[110,170,176]); g.box(56,53,62,56,[90,130,92]);
    g.box(55,41,62,51,[176,120,64]); g.box(56,42,61,50,[220,200,150]); g.box(57,43,60,47,[96,140,190]);
    // the headphones' hook
    g.box(107,80,109,82,[120,124,130]); g.px(107,82,[120,124,130]); }),
  // the chimney breast's face: the red poster in its dark frame, a red beast on cream, a dark band of shapes along its foot (no words)
  jog:bedCanvas(39,148,g=>{
    g.box(6,44,36,87,[34,48,44]); g.box(8,46,34,85,[250,240,204]);
    g.shape(10,56,['......rr.......','.....rRRr..kk..','....rRRRRrkkk..','...rRRRwRRrk...','..rrRRRRRRrr...','.rRRRRRRRRRRr..','.rRRRrRRRRRRRk.','rRRRr.rRRRRRRkk','RRRr...rRRRRrk.','rRr....rRRRRr..','.r....rRRRRr...','.....rRRRRRk...','....rRRRRRkk...','....rRRRRk.....','...kkRRRk......','..kk.kkk.......','.kk..kk........','kk...k.........','k..............'],
      {r:[150,36,30],R:[214,74,44],w:[250,220,120],k:[24,22,24]});
    g.box(9,47,33,54,[40,40,44]); for(let c=10;c<32;c+=4){ g.box(c,49,c+2,52,[176,172,150]); g.px(c+1,50,[40,40,44]); } }),
  // the back wall: the blue poster in a wide white frame (a mosaic diamond of pastel squares), the pink poster (a girl with a gold crown,
  // the room's own), the string lights hanging either side of it
  back:bedCanvas(188,148,g=>{
    g.box(76,80,105,126,[214,206,184]); g.box(77,81,104,125,[252,248,232]); g.box(80,84,101,122,[44,92,190]); g.box(80,84,81,122,[60,108,204]);
    const P=[[246,140,60],[236,170,180],[160,200,170],[176,184,214],[220,96,110],[150,170,200],[196,140,180],[120,60,80],[230,200,110],[98,160,90]];
    for(let q=88;q<119;q++){ const w=Math.round(9-Math.abs(q-103.5)*.55); for(let c=90.5-w;c<90.5+w;c++){ const k=Math.floor(hash(Math.floor(c/2),Math.floor(q/2),521)*P.length); g.px(c,q,P[k]); } }
    g.disc(90.5,108,3,3,[202,120,170]); g.disc(90.5,97,3,2.5,[200,100,130]); g.px(90,100,[140,30,50]); g.px(93,95,[140,30,50]); g.px(88,93,[14,60,86]);
    g.box(148,52,184,93,[214,206,190]); g.box(149,53,183,92,[252,250,240]); g.box(151,55,181,90,[240,176,204]);
    for(let k=0;k<70;k++){ const c=151+hash(k,1,611)*29, q=55+hash(k,2,611)*34, col=[[120,110,210],[250,210,90],[236,110,90],[130,190,236],[250,236,240]][k%5]; g.box(c,q,c+2,q+1,col); }
    g.disc(166,70,10,12,[94,52,40]); g.box(156,55,176,66,[94,52,40]); g.disc(166,73,7,8,[248,214,190]); g.box(159,71,173,80,[94,52,40]);
    g.box(162,72,165,74,[40,30,30]); g.box(168,72,171,74,[40,30,30]); g.px(163,73,[250,250,250]); g.px(169,73,[250,250,250]); g.box(161,69,163,70,[240,150,150]); g.box(170,69,172,70,[240,150,150]);
    g.box(165,67,168,68,[150,60,60]); g.box(160,55,173,60,[44,98,170]); g.box(163,57,170,60,[240,240,236]); g.box(165,55,168,57,[44,98,170]);
    g.shape(158,79,['y...y...y','yy.yyy.yy','yyyyyyyyy','yryyyyyby','yyyyyyyyy'],{y:[246,206,60],r:[220,50,60],b:[60,120,220]});
    // the string lights: two strands of fine wire, a warm bulb every few pixels, from under the shelf (47-physics-4) down past the poster
    for(const [c,q0,q1] of [[146,48,98],[185,34,99]]){ for(let q=q0;q<q1;q++)g.px(c,q,[236,226,196]); for(let q=q1-3;q>q0;q-=7)g.px(c,q,bedGlow([255,236,180])); }
    for(let c=146;c<=185;c++){ const q=98-Math.sin((c-146)/39*Math.PI)*3; g.px(c,q,[236,226,196]); if((c-146)%7===3)g.px(c,q,bedGlow([255,236,180])); }
    // the hanging pot's hook at the top
    g.box(38,143,42,145,[150,150,156]); })};
// THE VINES: the pothos in the hanging pot (47-physics-4) climbing out along the back wall, both ways, and round onto the chimney breast:
// a stem that wanders, a heart-shaped leaf every few pixels, two greens; painted over the wall pictures
const BEDVINE=(()=>{ const m=new Map(), L=[[96,170,66],[60,128,52],[150,200,96]], put=(w,c,q,k)=>m.set(w+','+Math.floor(c)+','+Math.floor(q),L[k]);
  const run=(w,c,q,dc,n,s,droop)=>{ for(let i=0;i<n;i++){ c+=dc; q+=Math.sin(i*.4+s)*.6-droop; put(w,c,q,1);
      if(i%5===2){ const up=hash(i,s*10|0,701)<.5?1:-1; put(w,c,q+up,0); put(w,c+1,q+up,0); put(w,c,q+up*2,0); put(w,c+1,q+up*2,2); put(w,c-1,q+up,0); } } };
  run('back',40,100,1,60,0,.05); run('back',40,100,-1,24,1,.1); run('back',62,98,.4,26,2,.7); run('back',30,96,-.3,30,3,.8); run('back',96,96,.6,40,4,.35); run('back',44,92,.2,22,5,.9);
  run('jog',38,104,-1,30,2,.1); run('jog',20,100,-.3,16,1,.6);
  const at=(w,c,q)=>m.get(w+','+c+','+q);   // (at DET 1, any of an art pixel's four)
  return (w,c,q)=>{ c=Math.floor(c); q=Math.floor(q); if(DET>=2)return at(w,c,q)||null; c&=~1; q&=~1; return at(w,c,q)||at(w,c+1,q)||at(w,c,q+1)||at(w,c+1,q+1)||null; }; })();
// a wall's colour inside (facadeCol, 22): q the building, the face's normal, the point, z from the floor, f its shade
function bedWall(q,nx,ny,X,Y,z,f){ const R=BEDR, e=.06, Q=z*2; let w=null, c=0;
  if(nx>0&&Math.abs(X-R.x0)<e){ w='left'; c=(Y-R.y0)*48; }
  else if(nx>0&&Math.abs(X-R.x0-R.jx)<e&&Y<R.y0+R.jy+e){ w='jog'; c=(Y-R.y0)*48; }
  else if(ny>0&&Math.abs(Y-R.y0)<e){ w='back'; c=(X-R.x0)*48; }
  if(w){ const v=BEDVINE(w,c,Q); if(v)return sh(v,f); const a=BEDART[w](c,Q); if(a)return a.e?a:sh(a,f); }
  if(z<1)return sh([188,150,104],f);                                           // where the wall meets the boards
  return sh(speck([255,246,206],nx?Y:X,z/24,93),f); }
// THE FLOOR: honey boards running along x, 0.16 wide (four art pixels), each a shade of its own, a darker seam between them, their ends
// staggered (a board 0.9 to 1.6 long)
function bedFloorCol(x,y){ const u=x-BEDR.x0, v=y-BEDR.y0, j=Math.floor(v/.16), L=.9+hash(j,0,731)*.7, o=hash(j,1,731)*L, k=Math.floor((u+o)/L);
  if(v-j*.16<1/48)return mt('wood',[186,118,48]);
  if((u+o)-k*L<1/48)return mt('wood',[158,98,42]);
  const n=hash(j,k,733); return mt('wood',speck(n<.33?[204,135,65]:n<.66?[196,126,56]:[212,146,70],x,y,735)); }

// THE BEDROOM'S PIECES IN THE CATALOG (owner, 14 Oct 2026: "do the catalog"; "real physics, anywhere"; "the furniture and the special
// things"): sixteen of the bedroom's pieces (23-w-bedroom), each one bought, put down anywhere and taken up again like any object. The object is
// only its place: an empty picture the size of the piece (nothing painted, no shadow, not in your way), so the editor and the bag can pick it,
// move it, turn it; what you see are the piece's real bodies, made by the bedroom's own makers where it stands (47-physics-7-placed). Each:
// pc, its maker (BRPIECE, 47-physics-4-bedroom-2-pieces); o, where it stands in the bedroom (its middle, from the room's back corner); s, its
// size (tiles); h, its height (art px); zb, how high it stands in the room (on the cube shelf, on the bed: art px), set on the floor here; a,
// the maker's own; l, its light [dx, dy, z, reach, colour] (the lava lamp's glow, the CRT's), turned with it
const BRKINDS={
  'music desk':{pc:['desk','deskgear'],o:[.39,2.015],s:[.66,1.5],h:29},
  'monitor':{pc:'monitor',o:[.22,1.98],s:[.12,.67],h:17,zb:21.5},
  'speaker on stand':{pc:'speaker',o:[.18,1.1],s:[.22,.2],h:34,a:[.18,1.1]},
  'teal stool':{pc:'stool',o:[1.36,2.06],s:[.26,.26],h:15},
  'synth on stand':{pc:'synth',o:[1.5,1.42],s:[1.1,.48],h:19},
  'crt on cart':{pc:'crt',o:[.72,.45],s:[.57,.57],h:45,l:[.23,.25,30,1.8,[.4,.7,.66]]},
  'bookcase with books':{pc:'bookcase',o:[1.44,.164],s:[.38,.32],h:41},
  'low shelf':{pc:'lowshelf',o:[2.02,.214],s:[.72,.42],h:19},
  'cube shelf':{pc:'cube',o:[2.72,.189],s:[.3,.37],h:34},
  'bed with pillows':{pc:'bed',o:[3.29,1.915],s:[1.18,1.69],h:14},
  'terrarium':{pc:'terrarium',o:[3.5,.3],s:[.7,.5],h:21},
  'wall shelf with pothos':{pc:'wallshelf',o:[3.35,.15],s:[1.02,.3],h:60},
  'floor plant':{pc:'plant',o:[3.02,.33],s:[.2,.2],h:18},
  'hanging pot':{pc:'hangpot',o:[.82,.1],s:[.3,.3],h:74},
  'lava lamp':{pc:'lava',o:[2.68,.165],s:[.15,.15],h:16,zb:34,l:[0,0,10,2.4,[.3,.95,.9]]},
  'teddy bear':{pc:'teddy',o:[3.3,1.45],s:[.14,.14],h:5,zb:10.5}};
for(const [k,I] of Object.entries(BRKINDS)){ KIND_OF[k]=k;
  CATALOG[k]=(x,y)=>{ const [w,d]=I.s, p=prop([{x0:x-w/2,y0:y-d/2,x1:x+w/2,y1:y+d/2,z0:0,z1:I.h,c:[0,0,0],top:()=>null,fi:()=>null,fj:()=>null,nb:1}],null,{solids:[],piece:k,name:k});
    if(I.l)LAMPS.push({x:x+I.l[0],y:y+I.l[1],z:I.l[2],r:I.l[3],c:I.l[4],prop:p,day:true,own:1}); if(I.pc==='crt')p.opts=()=>[['watch the news',()=>newsOpen()]]; return p; }; }   // (the CRT: the market news, 47-news)   // (own: its own reach, height and colour, not the street lamps', 42)
CAT_DEPTS.push(['bedroom','Bedroom']);
{ const I=(no,name,price,desc,mat)=>({no:'P-9'+String(no).padStart(2,'0'),name,dept:'bedroom',price,desc,mat});
  Object.assign(CAT_INFO,{
  'music desk':I(1,'Music Desk',180,'Dark green steel and warm wood, a deep board for a keyboard; comes with its gear: an orange keyboard, a drum pad, a little synth, effect boxes and a postcard.','steel, wood, plastic'),
  'monitor':I(2,'Monitor',200,'A flat black screen on a neck and a foot. Off.','plastic, glass'),
  'speaker on stand':I(3,'Speaker on Stand',220,'A dark green box clamped on a tall pole. Top-heavy: it topples if you bump it.','wood, steel'),
  'teal stool':I(4,'Stool',40,'A teal cushion on four dark legs.','steel, foam, cloth'),
  'synth on stand':I(5,'Synth on X-Stand',650,'Five octaves, a panel of knobs, wooden cheeks, on a steel X-stand.','steel, wood, plastic'),
  'crt on cart':I(6,'CRT on a Cart',300,'A white steel cart with four consoles on its shelves, the old set on top showing its picture, a plant and a toy dinosaur.','steel, glass, plastic'),
  'bookcase with books':I(7,'Bookcase with Books',150,'Red-brown, five shelves, every book its own; a box and a plant on top.','wood, paper'),
  'low shelf':I(8,'Low Shelf',90,'Light wood, games and records in it, a console and a pad on top.','wood, plastic, vinyl'),
  'cube shelf':I(9,'Cube Shelf',70,'Tall and narrow, five cubes, white bins in four and a red toy car in one.','wood, plastic'),
  'bed with pillows':I(10,'Bed with Pillows',400,'A white mattress with a teal stripe, a dark teal duvet in soft folds, two striped pillows.','steel, cotton'),
  'terrarium':I(11,'Terrarium with Gecko',350,'A glass tank on a low bench: sand, a branch, a flat stone and a leopard gecko who walks about and climbs.','glass, wood, sand'),
  'wall shelf with pothos':I(12,'Wall Shelf with Pothos',45,'A board on two brackets, a pothos in a clay pot and four books on it. Goes on a wall.','wood, steel, clay'),
  'floor plant':I(13,'Floor Plant',35,'Tall pointed leaves out of a white pot.','ceramic, plant'),
  'hanging pot':I(14,'Hanging Pot',30,'A terracotta pot of trailing pothos on three cords. It swings when you brush it.','clay, cord, plant'),
  'lava lamp':I(15,'Lava Lamp',25,'Real wax in real water: warmed by the bulb it rises, cools and sinks. Glows teal.','glass, steel, wax'),
  'teddy bear':I(16,'Teddy Bear',15,'Brown, soft, a pale muzzle.','plush')}); }

};
export {bedroomKit};
