// THE WEST SUBWAY'S PIECES: the old game's subway car (benches, poles, doors, windows, light strips, litter) and station (column, bench, lit sign, signal) as catalog kinds for the old rooms; the car's walls and the ride are not here.
import {SHARED} from './003-shx.js';
import {CAT_INFO, CATALOG, chunkAtL, hash, KIND_OF, LAMPS, LIFE, mt, prop, ROT, sh, sided, speck, T, zShift} from './014-gamekit.js';
const westSubway=()=>{ '@oldkits';
const UH=96, LVZ=()=>0, envNear=()=>null, lightAt=null, concreteCol=()=>[150,148,144], CHARMIN=.2, toS=(x,y)=>[x,y], vw=()=>[0,0], boxBounds=()=>[0,0,1,1], rasterBox=()=>{};   // the old engine's lighting, raster and level helpers: not here
// =====================================================================================
// THE WEST END'S SUBWAY, 1: THE STATION (back from the archive, owner 16 Oct 2026: the archived places "bring all of these back and put on
// map"; the station as the owner had it, 11 Oct 2026, "make the subway station look exactly like this", reference/rooms/subway-station-target.webp,
// and the loop, "a track that goes around ... underground", mockups/subway-loop-a.png). The old world's station, its loop and its car (archive
// 21-world-map-1-block's UCH, 21-world-map-3-walls' station walls, 22's station tiles, 23-station, 49-subway-day1's car) laid whole under the
// West End (WSUB.o: the old plan moved, every place in it the same distance), so the station runs along y as it did. One room SY0-SY1: the
// platform AVE-PLAT, one track out to the curved tiled wall at TW, the train's tunnel at both ends; at its south end the platform runs on as
// the dark exit tunnel, the way up (47-west-subway). The far platform (E_PLAT-E_AVE, the old 190 Street's) mirrors it, its exit passage at
// its south end; the two tracks joined round by the tunnel, dark and walkable, so the train runs one way round. Here the plan, the floors,
// the walls' tiles, the station's things and the train's outside, all made from code; the car you ride in: 23-w-west-subway-2-car; the
// stairs down from the sidewalk: 23-w-west-subway-3-entrance; all of it placed: 26-zzzzzzzzzzzz-west-subway; the train running and riding
// it: 47-west-subway.
// =====================================================================================
const WSUB=(()=>{ const ox=-90, oy=-105;   // (the old plan's x 60-114, y -4.8-68.7 to x -30-24, y -109.8 to -36.3: under the West End's street and its north row)
  const AVE=60+ox, PLAT=66+ox, TW=70.4+ox, SY0=19.2+oy, SY1=44.7+oy, END=64+oy, TUN=24, E_PLAT=108+ox, E_AVE=114+ox, ETW=103.6+ox;
  const W={o:[ox,oy],AVE,PLAT,TW,SY0,SY1,END,TUN,TUN0:PLAT,TUN1:TW,E_PLAT,E_AVE,ETW,LOOPW:TW-PLAT,
    TRACKS:[68.1+ox,E_PLAT-(68.1-PLAT)],                  // the middle of each platform's track (its rails 1.4 apart)
    TSTEPS:[[SY0+.4,SY0+1.6],[SY1-1.6,SY1-.4]],         // steps from the tracks up to the platform, at both its ends (the near platform's)
    D1Y:32+oy, CARL:22.4, CARW:1.8, LDR:[-5.9,0,5.8],   // where the train's middle stops; the car's length and half width; its doors from its middle
    SCAR:{x0:-11.2,y0:-20,x1:11.2,y1:-16.4}};           // THE CAR you ride in (23-w-west-subway-2-car), a room of its own deep in the ground south of the loop, where nothing else is
  const mod=(a,n)=>((a%n)+n)%n;
  // pixel art and lettering for the subway's own pictures (the old world's kit: a picture W x H, art(x, y) its colour or null; 3 x 5 letters, k pixels each)
  W.art=(Wd,H,draw)=>{ const a=new Array(Wd*H).fill(null); draw((x,y,c)=>{ x=Math.floor(x); y=Math.floor(y); if(c&&x>=0&&y>=0&&x<Wd&&y<H)a[y*Wd+x]=c; }); return (x,y)=>x>=0&&y>=0&&x<Wd&&y<H?a[y*Wd+x]:null; };
  const F3={A:'010101111101101',B:'110101110101110',C:'111100100100111',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'111100101101111',H:'101101111101101',I:'111010010010111',J:'001001001101111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'111101101101111',P:'111101111100100',Q:'111101101111001',R:'111101110101101',S:'111100111001111',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001111001111',4:'101101111001001',5:'111100111001111',6:'111100111101111',7:'111001001001001',8:'111101111101111',9:'111101111001111','-':'000000111000000','.':'000000000000010','&':'010101010101011'};
  W.txt=(put,s,x0,y0,c,k=2)=>{ [...s].forEach((ch,i)=>{ const g=F3[ch]; if(!g)return; for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(g[r*3+q]==='1')for(let a=0;a<k;a++)for(let b=0;b<k;b++)put(x0+(i*4+q)*k+a,y0+r*k+b,c); }); };
  // the floor's height underground: the tracks lie 32 lower, with a few steps up to the platform at each of its ends (30's floorZ asks fzAt)
  W.fzAt=(x,y)=>x<PLAT+.75&&W.TSTEPS.some(([a,b])=>y>=a&&y<b)?-8*(1+Math.floor((x-PLAT)/.25)):-32;
  // THE PLATFORM (the owner's picture): a mustard strip of raised dots at the edge, then big marble tiles in a checker, faint veins
  W.platformCol=(x,y)=>{ const e=x>=E_PLAT-.5?x-E_PLAT:PLAT-x;   // (how far from its edge: the far platform's edge is on its west)
    if(e<=.06)return mt('lines',[214,180,72]); if(e<=.8){ const u=mod(x*6,1)-.5, v=mod(y*6,1)-.5; return mt('lines',u*u+v*v<.08?[176,148,74]:[150,124,56]); }
    const i=Math.floor(x), j=Math.floor(y); if(x-i<.04||y-j<.04)return mt('platform',[158,161,166]);
    const n=hash(Math.floor(x*5),Math.floor(y*5),101), c=(i+j)&1?[216,218,222]:[188,191,198]; return mt('platform',n<.035?sh(c,.84):n>.93?sh(c,.97):c); };
  W.platEdge=(u,z)=>sh(mt('concrete',[128,126,120]),z>-3?1:.7);   // its edge, dropping to the track bed
  // THE TRACK BED: dark ballast, wooden sleepers every 1.25 tiles, two steel rails (light along the middle) with rusty clips
  W.tracksCol=(x,y)=>{ for(const t of W.TRACKS){ const d=Math.abs(x-t), r=Math.abs(d-.7);
      if(r<.07)return mt('rails',r<.025?[200,202,208]:[120,122,128]); if(r<.13&&mod(y,1.25)<.32)return mt('rails',[128,72,44]); if(d<.95&&mod(y,1.25)<.32)return mt('ballast',[74,44,32]); }
    const n=hash(Math.floor(x*10),Math.floor(y*10),103); return mt('ballast',n<.3?[30,30,34]:n<.6?[22,22,26]:[40,40,44]); };
  // THE STATION'S WALLS: square tiles 0.63 a side in pale grey, charcoal up to a man's shoulder, each tile a touch lighter or darker; a black
  // top. z from the platform (the track bed is 32 lower)
  W.tile=(u,z,f)=>{ const T6=.63*24, i=Math.floor(u*24/T6), k=Math.floor((z+32)/T6), g=(u*24/T6-i)<.11||((z+32)/T6-k)<.11, low=z<36;
    const c=low?(g?[40,42,46]:[60,62,68]):(g?[142,146,152]:[186,190,197]); return sh(mt('subtile',c),f*(.95+.1*hash(i,k,107))); };
  // the curved track wall: the same tiles bent into a shallow hollow (darker toward its foot and its top), three framed posters of the
  // station's own (made up: a teal car in the night, a grey sea, a bright comic), red cables on brackets below the platform
  const PW=4.5, PZ0=17, PZ1=64, POSTERS=[[SY0+1.55,'car'],[SY0+9.96,'sea'],[SY0+18.35,'comic']];
  const posterCol=(kind,a,z)=>{ const w=PW*24, h=PZ1-PZ0, x=a*24, y=PZ1-z;
    if(x<1.2||x>w-1.2||y<1.2||y>h-1.2)return [24,24,28]; if(x<2.4||x>w-2.4||y<2.4||y>h-2.4)return [92,94,100];
    const u=x/w, v=y/h, n=hash(Math.floor(x),Math.floor(y),151);
    if(kind==='car'){ const r=Math.hypot((u-.62)*2.2,(v-.55)*1.4); return r<.42?(r<.3?[60,190,180]:[30,120,130]):v>.78?[22,40,70]:n<.06?[120,170,220]:[18,30,62]; }
    if(kind==='sea'){ const wv=Math.sin(u*40+v*8)*.5+Math.sin(u*13-v*21); return v<.32?[150,166,176]:Math.hypot(u-.55,v-.6)<.04?[220,180,90]:wv>.9?[132,150,160]:v<.5?[92,112,124]:[70,90,104]; }
    return v<.28?(u>.15&&u<.75&&Math.floor(u*w/5)%2===0&&v>.08&&v<.22?[230,190,30]:[244,240,232]):Math.hypot(u-.62,v-.62)<.22?(u>.62?[200,50,40]:[40,80,170]):u<.3&&v>.5?[230,140,40]:[244,240,232]; };
  W.tube=(u,z,f,posters)=>{ if(posters)for(const [a0,k] of POSTERS)if(u>=a0&&u<a0+PW&&z>=PZ0&&z<PZ1)return sh(posterCol(k,u-a0,z),f);
    if(z<-8&&z>-28){ if(Math.abs(z+14)<.8||Math.abs(z+20)<.8)return sh([150,40,34],f); if(mod(u,3.2)<.15)return sh([30,30,34],f); }
    const t=Math.max(0,Math.min(1,(z+32)/(94+32))), bend=.82+.18*Math.sin(Math.PI*t);         // the hollow: lit full in the middle of its curve
    return sh(W.tile(u,z,1),f*bend); };
  // (22's wallPieces asks a wall's own painter, w.paint(nx, ny, x, y, z from its level's floor, shade): the station's in its tiles, as 22 had them)
  W.wallPaint=kind=>kind==='stile'?(nx,ny,X,Y,z)=>W.tile(nx?Y:X,z,nx?.8:1):kind==='tube'||kind==='tubeP'?(nx,ny,X,Y,z)=>W.tube(nx?Y:X,z,nx?.8:1,kind==='tubeP'):(nx,ny,X,Y,z)=>sh(concreteCol(nx?Y:X,z/24),nx?.8:1);
  // ---- THE STATION'S THINGS (23-station): two tiled columns, each with a dome camera and an amber LED board on a bracket (PLEASE MIND THE
  // GAP / TRAIN ARRIVING / 14:03), four steel benches facing the track, where the picture has them (its tiles are this game's tiles: y = SY0 +
  // the picture's x, x = TW - the picture's y); the TO STREET sign over the exit tunnel, a red signal in each tunnel mouth (23-pack-objects-4-station)
  const SZ=-UH, SC6={steel:[136,140,148],steelL:[176,180,188],dark:[38,38,44],cap:[16,16,20],cam:[62,64,70],lens:[10,10,14],board:[14,12,12],dot:[255,168,40],dotDim:[60,36,14]};
  const LED35={P:'111101111100100',L:'100100100100111',E:'111100110100111',A:'010101111101101',S:'011100010001110',M:'101111111101101',I:'111010010010111',O:'111101101101111',U:'101101101101111',
    N:'101111111111101',D:'110101101101110',T:'111010010010010',H:'101101111101101',G:'011100101101011',R:'110101110101101',V:'101101101101010',W:'101101111111101',' ':'000000000000000',C:'111100100100111',K:'101101110101101',
    0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001011001111',4:'101101111001001',':':'000010000010000','^':'010111010010010'};
  const LEDTXT=['PLEASE MIND THE GAP','TRAIN ARRIVING','14:03'];
  // a column, 0.7 square from the platform to the ceiling: charcoal tiles to the shoulder, pale above, a black cap; its camera on the
  // platform side (-x), its board on a bracket toward +y
  W.column=(x0,y0)=>{ SHARED.PNAME='station column'; const x1=x0+.7, y1=y0+.7, tile=(u,z,f)=>sh(W.tile(u,z-SZ,1),f), by0=y1+.12, by1=by0+1.6, bx=x0+.3, LW=by1-by0;
    const led=(nx,Y,z)=>{ let a=(Y-by0)*24*2; if(nx>0)a=LW*48-a; const r=Math.floor((SZ+74-z)*2);   // in half pixels: along the board (read left to right from either side), down from its top
      for(let l=0;l<3;l++){ const t=LEDTXT[l], w=t.length*4, x=Math.floor(a-(LW*48-w)/2), yy=r-6-l*9; if(yy<0||yy>=5||x<0||x>=w)continue;
        const g=LED35[t[Math.floor(x/4)]], q=x%4; return q<3&&g&&g[yy*3+q]==='1'?SC6.dot:SC6.dotDim; } return SC6.board; };
    return prop([sided({x0,y0,x1,y1,z0:SZ,z1:-6,c:[186,190,197],foot:1,top:()=>SC6.cap,fs:(nx,ny,X,Y,zr)=>tile(nx?Y:X,zr+SZ,nx?.8:1)}),
      {x0,y0,x1,y1,z0:-6,z1:0,c:SC6.cap,foot:1},
      {x0:x0-.09,y0:y0+.27,x1:x0,y1:y0+.43,z0:SZ+66,z1:SZ+72,c:SC6.cam,fi:(y,z)=>Math.hypot((y-y0-.35)*24,z-68.5)<1.6?SC6.lens:sh(SC6.cam,.7),fj:()=>sh(SC6.cam,.85),foot:0},   // the dome camera (z: from the platform, its picture lowered)
      {x0:bx-.02,y0:y1,x1:bx+.02,y1:by0,z0:SZ+71,z1:SZ+73,c:SC6.dark,foot:0},                                        // the bracket
      sided({x0:bx-.07,y0:by0,x1:bx+.07,y1:by1,z0:SZ+56,z1:SZ+74,c:SC6.board,em:1,foot:0,top:()=>SC6.board,fs:(nx,ny,X,Y,zr)=>nx?led(nx,Y,zr+SZ+56):SC6.board})],null,{lv:-1}); };
  // a bench: steel slats on two black legs, a back on the platform's side, arms at both ends and in the middle; it faces the track
  W.bench=(x,y0)=>{ SHARED.PNAME='station bench'; const y1=y0+2.8, c=SC6, slat=(u,z,f)=>sh(Math.floor(u*24/1.5)%2?c.steel:c.steelL,f);
    const leg=y=>({x0:x+.1,y0:y,x1:x+.6,y1:y+.1,z0:SZ,z1:SZ+11,c:c.dark,foot:1}), arm=y=>({x0:x+.06,y0:y,x1:x+.66,y1:y+.06,z0:SZ+13,z1:SZ+17,c:c.dark,foot:0});
    return prop([leg(y0+.25),leg(y1-.35),
      {x0:x+.08,y0,x1:x+.66,y1,z0:SZ+11,z1:SZ+13,c:c.steel,foot:1,top:(X,Y)=>Math.floor((Y-y0)*24/1.5)%2?c.steel:c.steelL,fi:()=>sh(c.steel,.7),fj:()=>sh(c.steel,.85)},
      {x0:x,y0,x1:x+.08,y1,z0:SZ+13,z1:SZ+24,c:c.steel,fi:(Y,z)=>slat(Y,z,.75),fj:(X,z)=>slat(X,z,.9),foot:0},
      arm(y0),arm(y0+1.37),arm(y1-.06)],null,{lv:-1}); };
  // lettering on a face along y, read left to right from whichever side the camera sees (3 x 5 letters, a plate W x H art px)
  const plate=(W0,H0,s,ink,bg,rim)=>{ const a=new Array(W0*H0).fill(null), x0=Math.floor((W0-s.length*4+1)/2), y0=Math.floor((H0-5)/2);
    for(let y=0;y<H0;y++)for(let x=0;x<W0;x++)a[y*W0+x]=x<1||x>=W0-1||y<1||y>=H0-1?rim:bg;
    [...s].forEach((ch,i)=>{ const g=LED35[ch]; if(g)for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(g[r*3+q]==='1')a[(y0+r)*W0+x0+i*4+q]=ink; });
    return (x,y)=>x>=0&&y>=0&&x<W0&&y<H0?a[y*W0+x]:null; };
  const faceX=(y0,len,zt,A,els)=>(v,z)=>A(Math.floor((ROT<2?y0+len-v:v-y0)*24),Math.floor(zt-z))||els(v,z);   // (seen from +x at turns 0 and 1: read the other way)
  const QS={iron:[40,42,48],plate:[16,16,20],ink:[236,236,230],red:[236,44,40],lamp:[30,30,34]};
  // a lit sign hung from the ceiling on two rods, its words on both long sides
  W.litSign=(x,y,t)=>{ SHARED.PNAME='lit sign'; const w=t.length*4+5, H=12, L=w/24, y0=y-L/2, A=plate(w,H,t,QS.ink,QS.plate,QS.iron);
    return prop([{x0:x-.03,y0,x1:x+.03,y1:y0+L,z0:80,z1:80+H,c:QS.plate,em:1,foot:1,fi:faceX(y0,L,80+H,A,()=>QS.plate),fj:()=>QS.iron,top:()=>QS.iron},
      ...[y0+.15,y0+L-.2].map(p=>({x0:x-.015,x1:x+.015,y0:p,y1:p+.05,z0:80+H,z1:UH,c:QS.iron,foot:0}))],null,{walk:true}); };
  // a track signal on a post: a black head with a red lamp (n: facing +y, down the track toward the platform)
  W.signal=(x,y,n)=>{ SHARED.PNAME='tunnel signal'; return prop([{x0:x-.05,y0:y-.05,x1:x+.05,y1:y+.05,z0:0,z1:44,c:QS.iron},{x0:x-.14,y0:y-.1,x1:x+.14,y1:y+.1,z0:44,z1:60,c:QS.lamp,foot:1},
      {x0:x-.08,y0:n?y+.1:y-.14,x1:x+.08,y1:n?y+.14:y-.1,z0:48,z1:56,c:QS.red,em:1,foot:1}],null,{walk:true}); };
  // ---- THE TRAIN, OUTSIDE (49-subway-day1's car, the owner's station picture: one long car): made of boxes along y round 0, 0, its nose
  // toward -y (z from the track bed, the platform 32 up): bogies and a dark underframe; the body to the eave, the barrel roof as thin slices
  // narrowing to the crest, its ends rounding more toward the top; gunmetal sides with a sheen under the eave, seams, an olive band low
  // down, big rounded windows, three double doors a side (on the platform's side they slide open: f, 0 to 4); at each end three windows, an
  // end door, red lamps, and on the nose warm headlamps. Its picture is painted from the boxes for each view angle and door frame (sided
  // faces, so each side is itself), a strip at a time (carJob, 47-west-subway), lit where the train stops, its lamps glowing.
  const CC={side:[104,108,118],sheen:[150,156,168],seam:[78,82,90],band:[70,80,46],bandL:[96,108,62],eave:[34,36,42],glass:[28,36,50],glassL:[92,110,138],rim:[196,202,212],
    under:[26,26,30],ribL:[116,122,134],ribD:[56,58,66],cap:[150,156,168],inside:[226,214,160],red:[240,56,40],head:[255,222,140],frame:[60,62,70]};
  const CQ=c=>c.length>3?c:c.map(v=>v&~7);                                             // colours in steps of 8: it stays pixel art
  W.carBoxes=(f,e=0)=>{   // e: at the far platform, whose side is +x: the doors open that side
    const L=W.CARL/2, Wd=W.CARW, DR=W.LDR, DW=.62, open=f/4*.56, EAVE=78, CREST=96;
    const side=(a,z,plat)=>{ for(const m of DR){ const d=Math.abs(a-m);
        if(d<DW&&z>=32&&z<76){ if(plat&&d<open)return CC.inside; const dd=(d-open)*24, lw=(DW-open)*24; if(dd<.7||dd>lw-.7||z>75)return CC.frame;
          return z>=50&&z<70&&dd>2.4&&dd<lw-2.4?((dd+z)%11<2?CC.glassL:CC.glass):CC.side; } }
      if(z<34)return CC.under; if(z>=EAVE-1)return CC.eave; if(z>=36&&z<42)return z>=40?CC.bandL:CC.band;
      for(let k=0;k<DR.length+1;k++){ const a0=(k?DR[k-1]+DW:-L)+.55, a1=(k<DR.length?DR[k]-DW:L)-.55; if(a1-a0<.8||a<a0||a>a1||z<50||z>=70)continue;
        const e2=Math.min(a-a0,a1-a)*24, ez=Math.min(z-50,69.9-z); if(e2<2.5&&ez<2.5&&Math.hypot(2.5-e2,2.5-ez)>2.5)continue;   // (rounded corners)
        return e2<.9||ez<.9?CC.rim:((a*24+z)%13<2?CC.glassL:CC.glass); }
      if(Math.abs(((a+L)%2.86+2.86)%2.86)<.05)return CC.seam; return z>=70?CC.sheen:CC.side; };
    const end=(b,z,nose)=>{ const p=Math.abs(b)*24; if(z<34)return CC.under; if(p>Wd*24-1.2)return CC.rim;
      if(p<6&&z>=32&&z<76)return z>=52&&z<70&&p<4.5?CC.glass:CC.frame;                                // the end door
      if(z>=52&&z<70&&p>8&&p<Wd*24-4)return Math.abs(p-(8+Wd*24-4)/2)<.7?CC.rim:CC.glass;                  // its windows either side
      if(Math.hypot(p-Wd*24+8,z-48)<2.2)return [...CC.red,1]; if(nose&&Math.hypot(p-Wd*24+8,z-40)<2.2)return [...CC.head,1]; return CC.side; };
    const box=(x0,x1,y0,y1,z0,z1,c,o={})=>sided({x0,x1,y0,y1,z0,z1,c,top:o.top||(()=>c),fs:(nx,ny,X,Y,zr)=>{ const z=zr+z0, v=(nx?o.side&&o.side(Y,z,e?nx>0:nx<0):o.end&&o.end(X,z,ny<0))||c; return CQ(v.length>3?v:sh(v,nx?.74:.88)); }});
    const out=[];
    for(const m of [-7.8,7.8])out.push(box(-Wd+.4,Wd-.4,m-1.6,m+1.6,0,12,CC.under,{side:(a,z)=>[m-1.2,m+1.2].some(c=>Math.hypot((a-c)*24,z-6)<5.5)?[44,44,50]:CC.under}));
    out.push(box(-1.45,1.45,-L+.6,L-.6,7,34,CC.under,{side:(a,z)=>hash(Math.floor(a*2),Math.floor(z/8),161)<.3?[40,40,46]:CC.under}));
    out.push(box(-Wd,Wd,-L,L,30,EAVE,CC.side,{side,end}));
    for(let z=EAVE;z<CREST;z+=3){ const t=(z+1.5-EAVE)/(CREST-EAVE), w=Wd*Math.sqrt(Math.max(.02,1-t*t)), r=.3+.35*t;   // the barrel roof, its ends rounding more toward the crest
      out.push(box(-w,w,-L+r,L-r,z,Math.min(CREST,z+3),CC.ribL,{side:()=>CC.ribD,end:()=>CC.cap,top:(X,Y)=>{ const e2=Math.min(Y+L,L-Y); return e2<1.4?(e2<.7?CC.rim:CC.cap):Math.floor((X+Wd)*24/4.8)%2?CC.ribL:CC.ribD; }})); }
    return out; };
  // its picture (on the page only: a canvas), painted a strip of rows at a time so no frame waits on it (step(ms): strips until that much
  // time is spent; true when it's done, the canvas in .c; false for good if the view has turned meanwhile, .dead), lit like a character at
  // the stop, never brighter than its own colours; its lamps glow
  W.carJob=(f,e=0)=>{ const rot=ROT, bs=W.carBoxes(f,e), [x0,y0,x1,y1]=boxBounds(bs), w=x1-x0, h=y1-y0, px=new Uint8ClampedArray(w*h*4), gp=new Uint8Array(w*h), dep=new Float32Array(w*h).fill(-1e9); let row=0;
    const L={K:1,x:x0,y:y0,w,h:4,putG(X,Y,c,de){ X-=x0; Y-=y0; if(X<0||Y<0||X>=w||Y>=h)return; const q=Y*w+X; if(de<dep[q])return; dep[q]=de; px[q*4]=c[0]; px[q*4+1]=c[1]; px[q*4+2]=c[2]; px[q*4+3]=255; gp[q]=c.length>3?1:0; }};
    return {c:null,dead:false,step(ms){ if(ROT!==rot){ this.dead=true; return false; } const t0=performance.now();
      while(row<h&&performance.now()-t0<ms){ L.y=y0+row; for(const b of bs)rasterBox(L,b); row+=4; } if(row<h)return false;   // (4 rows of the picture: rasterBox paints only what falls in L's rows)
      const tx=W.TRACKS[e], env=envNear(tx,W.D1Y), Lc=env?lightAt(env,tx,W.D1Y,(LVZ(-1)+20)/24,null).map(v=>Math.max(CHARMIN,Math.min(1,v))):[.6,.6,.6];
      for(let q=0;q<w*h;q++)if(px[q*4+3]&&!gp[q]){ px[q*4]*=Lc[0]; px[q*4+1]*=Lc[1]; px[q*4+2]*=Lc[2]; }
      const c=document.createElement('canvas'); c.width=w; c.height=h; c.getContext('2d').putImageData(new ImageData(px,w,h),0,0);
      const [sx,sy]=toS(...vw(0,0)); c.ox=x0-sx; c.oy=y0-sy; this.c=c; return true; }}; };
  return W; })();

// =====================================================================================
// THE WEST END'S SUBWAY, 2: THE CAR YOU RIDE IN (back from the archive, 26-zzzzzzzzzzz-subway-car; owner, 11 Oct 2026: his picture of a car's
// bench, "inside is an 1980s nyc subway", mockup B: stainless walls, orange and yellow bucket seats, tags, scratched glass; "make it a real
// scene"; "lighting darker, more gritty vibes, 80s nyc, shadows, flicker, atmosphere, dust, debris, realistic lived in, concrete, metallic").
// Once Day 1's first scene; now the inside of the loop's train: board it at an open door and you're in here (47-west-subway). The room is
// WSUB.SCAR (23-w-west-subway-1-station; its chunk and its four steel walls placed in 26-zzzzzzzzzzzz-west-subway), its walls painted here
// (carWall, asked by 22 as the wall's own painter), its floor here (carFloorCol). Along each long wall: three double doors, a bench of
// moulded seats between each two, two windows over each bench, ad cards over the windows, a strip light under the ceiling's curve; a pole
// in the middle of each doorway; grab bars over the benches; the end walls with their storm door, small windows and the car's number. Tags
// everywhere, grime, rust under the windows, gum and butts and newspaper on the floor, a can and a bag left behind.
// MOVING (through the objects' life, as the tanks' creatures, 24): every window and door glass shows the tunnel going by, close-up brick,
// cables, work lamps streaking past, smeared when the train is fast; at a stop the station's tiles; the platform's doors slide open; one
// strip light flickers; dust floats in the light. CARV is the ride: the loop's train on everyone's clock (47-west-subway). No image: all drawn
// here; its things made by carPlace, from 26-zzzzzzzzzzzz-west-subway (after every other object, so no other object's number changes).
// =====================================================================================
{ const SCAR=WSUB.SCAR, CARV=WSUB.carv={s:0,v:9,open:0,st0:1e9,st1:1e9,t:0};   // the ride (47-west-subway sets it from the loop's clock): where the train is along the line (tiles), its speed (tiles/s), the platform doors (0-1), where a station starts and ends
const SCXC=(SCAR.x0+SCAR.x1)/2, SCYC=(SCAR.y0+SCAR.y1)/2, SCN=SCAR.y0+T, SCS=SCAR.y1-T;   // the middle; the long walls' inside faces
const SCDOOR=[-5.9,0,5.8].map(d=>SCXC+d), SCDW=.62, SCDF=.72;                           // the doors (as Day 1's car has them), the opening's half width, its frame's
const SCSEG=[[SCAR.x0+T,SCDOOR[0]-SCDF],[SCDOOR[0]+SCDF,SCDOOR[1]-SCDF],[SCDOOR[1]+SCDF,SCDOOR[2]-SCDF],[SCDOOR[2]+SCDF,SCAR.x1-T]];   // the stretches of wall between them
const SCWIN=SCSEG.flatMap(([a,b])=>{ const m=(a+b)/2, q=(b-a)/4, w=(b-a)/2-.36; return [[m-q-w/2,m-q+w/2],[m+q-w/2,m+q+w/2]]; });   // two windows over each bench
const SCWZ=[36,64], SCBD=.62;                                                           // the windows' height (art px from the floor); the benches' depth (tiles)
const scLit=c=>Object.assign([...c],{e:1});
const scK=(c,k)=>[c[0]*k,c[1]*k,c[2]*k];
const scMix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
// ---- the palette: grimy stainless, black rubber, the seats, the tags' inks
const SCP={steel:[150,152,148],steelL:[178,180,176],steelD:[112,114,112],rub:[26,26,28],glass:[30,34,36],kick:[64,64,62],ceil:[96,98,94],cove:[160,162,156],
  orange:[214,104,30],yellow:[226,170,40],grille:[40,40,40],base:[62,62,60],pole:[196,198,196],rust:[120,72,44]};
const SCINK=[[22,22,26],[36,56,168],[182,36,44],[104,46,146],[214,214,220],[26,110,60]];
// ---- tags: made-up names in marker, loops and drips (no real writers' names). A tag is 4-6 letters, each a stroke up and down
// with a lean, an underline swash; its strokes kept per seed
const SCTAG=new Map();
function scTagSegs(seed){ let s=SCTAG.get(seed); if(s)return s; s=[]; const n=4+Math.floor(hash(seed,1,701)*3); let x=1;
  for(let k=0;k<n;k++){ const h=6+hash(seed,k,703)*5, a=hash(seed,k,705)*2, b=1.5+hash(seed,k,707)*2.5, lp=hash(seed,k,709);
    s.push([x,0,x+a,h],[x+a,h,x+a+b,lp<.5?0:h*.4]); if(lp>=.5)s.push([x+a+b,h*.4,x+a+b+1.2,0]); x+=a+b+1.5+hash(seed,k,711)*1.5; }
  s.push([0,-1.5,x+2,-.5+hash(seed,9,713)]); s.w=x+3; SCTAG.set(seed,s); return s; }
const scSegD=(u,v,[x0,y0,x1,y1])=>{ const dx=x1-x0, dy=y1-y0, l=dx*dx+dy*dy||1, t=Math.max(0,Math.min(1,((u-x0)*dx+(v-y0)*dy)/l)); return Math.hypot(u-x0-t*dx,v-y0-t*dy); };
// the ink at a point on a wall (a: along it in art px, z: up from the floor), or null: tags in cells 40 x 14, about half of them used
function scTag(a,z,k,dens=.5){ const ci=Math.floor(a/40), cj=Math.floor((z-4)/14); if(cj<0)return null; const seed=Math.floor(hash(ci,cj,k)*1e6);
  if(hash(ci,cj,k+1)>dens)return null; const sc=.8+hash(ci,cj,k+2)*.6, u=(a-ci*40-2)/sc, v=(z-4-cj*14-3)/sc, segs=scTagSegs(seed);
  if(u<-1||u>segs.w||v<-3||v>12)return null;
  for(const g of segs)if(scSegD(u,v,g)<.55/sc+.15){ const c=SCINK[Math.floor(hash(seed,3,717)*SCINK.length)]; return c; }
  if(hash(seed,5,719)<.35){ for(const g of segs)if(g[1]===0&&Math.abs(u-g[0])<.3&&v<0&&v>-2-hash(Math.floor(g[0]),seed,721)*6)return SCINK[Math.floor(hash(seed,3,717)*SCINK.length)]; }   // drips
  return null; }
// ---- the ad cards over the windows: made-up ads (no real brands), 44 x 20 fine pixels each, drawn once
const SCCARD=[['BAIL BONDS','24 HRS',[232,214,60],[20,20,24]],['LEARN TO','TYPE',[40,70,140],[240,236,220]],['DR ROSS','FEET',[236,232,220],[170,40,40]],
  ['CALL NOW','555 0142',[200,60,40],[250,240,220]],['NIGHT','SCHOOL',[30,30,34],[230,190,60]],['LOTTO','TONIGHT',[60,140,80],[250,250,240]],['HAIR','CLINIC',[220,170,200],[60,30,60]],['JOBS','JOBS JOBS',[250,250,246],[30,60,150]]].map(([a,b,bg,fg])=>
  WSUB.art(44,20,put=>{ for(let y=0;y<20;y++)for(let x=0;x<44;x++)put(x,y,bg); WSUB.txt(put,a,22-a.length*2,3,fg,1); WSUB.txt(put,b,22-b.length*2,11,fg,1); for(let x=3;x<41;x++)put(x,9,scK(fg,.8));
    for(let i=0;i<14;i++)put(hash(i,a.length,723)*44|0,hash(i,b.length,725)*20|0,scK(bg,.82)); }));   // (scuffs)
const SCNUM=WSUB.art(30,12,put=>{ for(let y=0;y<12;y++)for(let x=0;x<30;x++)put(x,y,[20,20,22]); WSUB.txt(put,'8417',2,3,[226,226,220],1); WSUB.txt(put,'8417',17,3,[226,226,220],1); });   // the car's number (made up)
const SCSIGN=WSUB.art(26,10,put=>{ for(let y=0;y<10;y++)for(let x=0;x<26;x++)put(x,y,[230,200,50]); WSUB.txt(put,'NO',2,2,[20,20,20],1); WSUB.txt(put,'LEAN',10,2,[20,20,20],1); });   // a sticker on the door
// grime: darker low down, smudges, a sheen up high
function scGrime(c,a,z,k){ const n=hash(Math.floor(a/7),Math.floor(z/5),k), m=hash(Math.floor(a*2),Math.floor(z*2),k+1);
  let f=.78+.22*Math.min(1,z/60); if(n<.12)f*=.82; if(m<.04)f*=.86; else if(m>.985)f*=1.08; return scK(c,f); }
// a window's or a glass's outline: rounded corners (r art px); returns 0 outside, 1 rubber, 2 glass
function scRound(a,z,a0,a1,z0,z1,r=4){ if(a<a0||a>a1||z<z0||z>z1)return 0; const e=Math.min(a-a0,a1-a), ez=Math.min(z-z0,z1-z);
  if(e<r&&ez<r&&Math.hypot(r-e,r-ez)>r)return 0; return e<1.2||ez<1.2||(e<r&&ez<r&&Math.hypot(r-e,r-ez)>r-1.2)?1:2; }
// ---- THE WALLS (22 asks: carWall(nx, ny, x, y, z from the floor, shade)): the inside faces painted, the outside plain dark
function carWall(nx,ny,X,Y,z,f){ const px=X+nx*.15, py=Y+ny*.15;
  if(!(px>SCAR.x0&&px<SCAR.x1&&py>SCAR.y0&&py<SCAR.y1))return sh([44,44,46],f);
  const c=ny?scLong(ny>0?0:1,X,z):scEnd(nx>0?0:1,Y,z); return c.e?c:sh(mt('frame',c),f); }
function scLong(side,x,z){ const a=(x-SCAR.x0)*24, k=811+side*10;
  if(z>=84)return scK(SCP.ceil,.9+.1*hash(Math.floor(a/24),0,k));                        // the ceiling's start, its panels
  if(z>=77){ const t=(z-77)/7; return scK(SCP.cove,1.04-.18*t); }                                // the cove, curving up
  for(const d of SCDOOR)if(Math.abs(x-d)<SCDF)return scDoorFace(side,x-d,z,a,k);
  if(z>=66&&z<77){ if(z<67||z>=76)return SCP.steelD; const i=Math.floor((x-SCAR.x0)/.95), u=(x-SCAR.x0-i*.95)*48;   // the ad rail, a card in each frame
    if(u<2.4||u>46)return SCP.steelD; const card=SCCARD[Math.floor(hash(i,side,731)*SCCARD.length)], q=card(Math.floor(u-2.4),Math.floor((76-z)*2));
    if(q&&hash(i,side,733)<.3){ const t=scTag(a,z,k+3,.7); if(t)return t; } return q||SCP.steelD; }
  for(const [w0,w1] of SCWIN){ const r=scRound(a,z,(w0-SCAR.x0)*24,(w1-SCAR.x0)*24,SCWZ[0],SCWZ[1]); if(r===1)return SCP.rub; if(r===2)return SCP.glass;
    const e=Math.min(Math.abs(a-(w0-SCAR.x0)*24),Math.abs(a-(w1-SCAR.x0)*24)); if(a>(w0-SCAR.x0)*24-2.5&&a<(w1-SCAR.x0)*24+2.5&&z>SCWZ[0]-2.5&&z<SCWZ[1]+2.5)return SCP.steelL;   // its bright trim
    if(e<1.5&&z<SCWZ[0]&&z>SCWZ[0]-14-hash(Math.floor(a),side,735)*12&&hash(Math.floor(a*2),side,737)<.5)return scMix(SCP.steel,SCP.rust,.55); }   // rust run down from its corners
  if(z<5)return (Math.floor(a*2)+Math.floor(z*2))%3?SCP.kick:scK(SCP.kick,.8);                    // the kick plate, its tread
  const t=scTag(a,z,k); if(t)return t;
  if(z<35)return scGrime(Math.floor(a*2)%3?SCP.steel:SCP.steelD,a,z,k);                            // the fluted panel low down
  return scGrime(Math.floor(a/24)%2&&Math.abs(a%24-12)<.5?SCP.steelD:SCP.steel,a,z,k); }          // the panels between the windows, their seams
// a double door, from inside (u: tiles from its middle): its frame, the two leaves meeting on a rubber edge, a window in each, a sticker
function scDoorFace(side,u,z,a,k){ const q=Math.abs(u);
  if(z>=76){ if(z>=77.5&&z<83.5&&q<.6){ const lu=(u+.6)*24; return z>=80&&z<81.2?(side?[60,140,70]:[226,120,40]):Math.abs(lu%5-2.5)<.7&&Math.abs(z-80.6)<1.4?[30,30,30]:[214,210,198]; }   // the route strip over it (made up)
    return SCP.steelD; }
  if(q>=SCDW)return q>SCDF-.04?SCP.rub:scGrime(SCP.steel,a,z,k);
  if(q<.02)return SCP.rub;
  return scLeaf(side,q,z,a,k); }
function scLeaf(side,q,z,a,k){ const lw=(q-.04)*24, r=scRound(lw,z,2.8,12.2,38,66,3); if(r===1)return SCP.rub; if(r===2)return SCP.glass;
  if(z<6)return SCP.kick; if(!side&&lw>3&&lw<16&&z>=26&&z<31){ const s=SCSIGN(Math.floor((lw-3)*2),Math.floor((31-z)*2)); if(s)return s; }
  const t=scTag(a,z,k+5,.35); if(t)return t; return scGrime(Math.floor(lw*2)%5?SCP.steelL:SCP.steel,a,z,k); }
// an end wall from inside (y along it): the storm door with its window, a small window each side, the car's number over the door
function scEnd(side,y,z){ const a=(y-SCAR.y0)*24, dy=y-SCYC, q=Math.abs(dy), k=861+side*10;
  if(z>=84)return SCP.ceil; if(z>=77)return scK(SCP.cove,1.04-.18*(z-77)/7);
  if(q<.55&&z<76){ if(q>.5)return SCP.rub; const r=scRound((dy+.5)*24,z,5,19,38,66,3); if(r===1)return SCP.rub; if(r===2)return Math.abs(((dy+.5)*24+z*.6)%14-3)<1?[52,58,60]:SCP.glass;
    if(Math.abs(dy-.38)<.04&&z>34&&z<40)return [40,40,40]; return scGrime(SCP.steelL,a,z,k); }
  if(q<.55&&z>=76)return SCP.steelD;
  if(q>=.75&&q<1.45){ const r=scRound((q-.75)*24,z,0,16.8,40,62,3); if(r===1)return SCP.rub; if(r===2)return SCP.glass; }
  if(q<.7&&z>=66&&z<72){ const s=SCNUM(Math.floor((dy+.62)*24*2)%30,Math.floor((72-z)*2)); if(s&&q<.62)return s; }
  if(z<5)return SCP.kick; const t=scTag(a,z,k,.7); if(t)return t; return scGrime(Math.floor(a*2)%3?SCP.steel:SCP.steelD,a,z,k); }
// ---- THE FLOOR: worn speckled grey, a path worn lighter down the middle, dark under the benches, grime at the walls, the doors'
// treads; and what's been dropped: newspaper pages, gum, cigarette butts, wrappers, a dried spill
const SCDEB=[]; for(let i=0;i<70;i++){ const h=j=>hash(i,j,751), x=SCAR.x0+.3+h(1)*(SCAR.x1-SCAR.x0-.6), y=SCN+.1+h(2)*(SCS-SCN-.2), r=h(3);
  SCDEB.push(r<.07?{k:'paper',x,y,w:.36+h(4)*.2,h:.26+h(5)*.12,s:h(6)-.5}:r<.4?{k:'gum',x,y,r:.02+h(4)*.025}:r<.72?{k:'butt',x,y,d:h(4)<.5}:r<.9?{k:'wrap',x,y,c:[[190,40,40],[230,200,60],[60,100,180],[240,240,236]][Math.floor(h(5)*4)]}:{k:'stain',x,y,r:.2+h(4)*.25}); }
function carFloorCol(x,y){ const n=hash(Math.floor(x*48),Math.floor(y*48),761), dw=Math.min(y-SCN,SCS-y);
  let c=n<.12?[62,60,58]:n<.2?[98,96,90]:n>.97?[130,126,118]:[78,76,72];
  for(const d of DEBAT(x,y)){ const dx=x-d.x, dy=y-d.y;
    if(d.k==='paper'){ const u=dx+dy*d.s, v=dy-dx*d.s*.3; if(Math.abs(u)<d.w/2&&Math.abs(v)<d.h/2){ const ln=Math.floor((v+d.h/2)*48); return mt('concrete',Math.abs(u)<.015||ln%3===0&&Math.abs(u)>.04?[120,118,110]:[178,174,162]); } }
    else if(d.k==='gum'){ if(Math.hypot(dx,dy*1.4)<d.r)return mt('concrete',[44,42,42]); }
    else if(d.k==='butt'){ const u=d.d?dx:dy, v=d.d?dy:dx; if(u>-.03&&u<.03&&Math.abs(v)<.012)return mt('concrete',u>.012?[200,120,60]:[226,218,200]); }
    else if(d.k==='wrap'){ if(Math.abs(dx)<.05&&Math.abs(dy)<.035)return mt('concrete',hash(Math.floor(x*48),Math.floor(y*48),763)<.3?scK(d.c,.7):d.c); }
    else if(d.k==='stain'){ const r=Math.hypot(dx,dy*1.6)+.05*Math.sin(Math.atan2(dy,dx)*5+d.r*9); if(r<d.r)c=scK(c,.8); } }
  for(const d of SCDOOR)if(Math.abs(x-d)<SCDW&&dw<.3)return mt('frame',Math.floor(x*48)%3?[118,120,116]:[88,90,88]);   // the doors' treads
  if(Math.abs(y-SCYC)<.8)c=scK(c,1.08+.06*Math.sin(x*9+hash(Math.floor(x*4),0,765)*3));                // the path worn down the middle
  if(dw<SCBD+.02&&SCSEG.some(([a,b])=>x>a&&x<b))c=scK(c,.5);                                     // under the benches
  else if(dw<SCBD+.16&&SCSEG.some(([a,b])=>x>a&&x<b))c=scK(c,.78);
  if(dw<.08)c=scK(c,.72);
  return mt('concrete',c); }
const DEBB=new Map(); for(const d of SCDEB)for(let i=Math.floor(d.x-.4);i<=Math.floor(d.x+.4);i++)(DEBB.get(i)||DEBB.set(i,[]).get(i)).push(d);
const DEBNONE=[], DEBAT=(x,y)=>DEBB.get(Math.floor(x))||DEBNONE;
// ---- A BENCH: a row of moulded bucket seats on a heater, its back against the wall (face 1: the wall on its -y side, facing +y;
// -1 the other way), the seats orange and yellow in turn, gum and a slash or two, tags; a steel end panel and a pole at each end
// that meets a doorway (ends: [at x0, at x1]); a grab bar over it
function scBench(x,y,len,face=1,ends=[true,true]){ SHARED.PNAME='subway bench'; const n=Math.max(1,Math.round(len/.78)), sw=len/n, D=SCBD, w0=face>0?y:y+D, bs=[];
  const d=Y=>face>0?Y-y:y+D-Y, Y0=d0=>face>0?y+d0:y+D-d0, seatC=X=>Math.floor((X-x)/sw)%2?SCP.yellow:SCP.orange;
  const front=(nx,ny)=>ny===face;
  bs.push(sided({x0:x,y0:Math.min(Y0(.06),Y0(.5)),x1:x+len,y1:Math.max(Y0(.06),Y0(.5)),z0:0,z1:11,c:SCP.base,foot:1,top:()=>SCP.base,   // the heater under it
    fs:(nx,ny,X,Yp,z,k)=>front(nx,ny)&&z>2&&z<9?scK(Math.floor((X-x)*48)%3?SCP.grille:[70,70,68],k):scK(SCP.base,k)}));
  bs.push(sided({x0:x,y0:Math.min(Y0(.04),Y0(D)),x1:x+len,y1:Math.max(Y0(.04),Y0(D)),z0:11,z1:17,c:SCP.orange,foot:1,                    // the seats
    top:(X,Yp)=>{ const u=(X-x)%sw/sw, v=d(Yp)/D, e=Math.min(u,1-u); if(e<.04)return [70,40,20]; const s=seatC(X), g=hash(Math.floor(X*48),Math.floor(Yp*48),771);
      if(g<.012)return [40,36,34]; if(Math.abs(u-.5)<.012&&v>.3&&v<.7&&hash(Math.floor((X-x)/sw),3,773)<.25)return [50,30,20];   // gum; a knife slash
      return scK(s,.86+.2*Math.hypot(u-.5,v-.55)*1.4+(v>.9?.12:0)); },
    fs:(nx,ny,X,Yp,z,k)=>scK(front(nx,ny)?scK(seatC(X),.8):SCP.base,k)}));
  bs.push(sided({x0:x,y0:Math.min(Y0(0),Y0(.14)),x1:x+len,y1:Math.max(Y0(0),Y0(.14)),z0:17,z1:37,c:SCP.orange,foot:0,top:X=>scK(seatC(X),1.12),   // the backs
    fs:(nx,ny,X,Yp,z,k)=>{ if(!front(nx,ny))return scK(nx?SCP.base:scK(seatC(X),.7+.2*(z/20)),k); const u=(X-x)%sw/sw, e=Math.min(u,1-u); if(e<.03)return scK([70,40,20],k);
      const a=(X-x)*24, t=scTag(a,z+20,887+face,.45); if(t&&z>4)return scK(t,k); return scK(seatC(X),k*(.9+.18*(z/20)-(e<.1?.08:0))); }}));
  ends.forEach((on,i)=>{ if(!on)return; const ex=i?x+len-.05:x;                                    // an end panel, its top front corner rounded, and its pole
    bs.push(sided({x0:ex,y0:Math.min(Y0(0),Y0(.74)),x1:ex+.05,y1:Math.max(Y0(0),Y0(.74)),z0:0,z1:42,c:SCP.steel,foot:1,top:()=>SCP.steelL,
      fs:(nx,ny,X,Yp,z,k)=>{ const dd=d(Yp)*24, r=8; if(dd>17.8-r&&z>42-r&&Math.hypot(dd-(17.8-r),z-(42-r))>r)return null; if(dd>16.6||z>40.6)return scK(SCP.steelL,k);
        return scK(scGrime(Math.floor(dd*2)%4?SCP.steel:SCP.steelD,dd,z,901),k); }}));
    const px=i?x+len-.03:x+.03, py=Y0(.78); bs.push(scPoleBox(px,py,0,88),{x0:px-.025,y0:Math.min(py,Y0(.55)),x1:px+.025,y1:Math.max(py,Y0(.55)),z0:74,z1:75.5,c:SCP.pole,foot:0}); });
  bs.push({x0:x,y0:Y0(.55)-.025,x1:x+len,y1:Y0(.55)+.025,z0:74,z1:75.5,c:SCP.pole,foot:0,top:()=>SCP.pole,fi:()=>[150,152,150],fj:()=>[176,178,176]});   // the grab bar
  return prop(bs); }
// a steel pole, floor to ceiling, shiny where hands hold it
function scPoleBox(x,y,z0,z1){ return sided({x0:x-.035,y0:y-.035,x1:x+.035,y1:y+.035,z0,z1,c:SCP.pole,foot:1,top:()=>SCP.pole,
  fs:(nx,ny,X,Y,z,k)=>{ const a=(nx?Y-y:X-x)*24; return scK(a>.3?[226,228,224]:a<-.4?[120,122,120]:z>28&&z<62?[206,206,198]:SCP.pole,k); }}); }
function scPole(x,y){ SHARED.PNAME='subway pole'; return prop([{x0:x-.08,y0:y-.08,x1:x+.08,y1:y+.08,z0:0,z1:1,c:[90,92,90]},scPoleBox(x,y,0,88),{x0:x-.06,y0:y-.06,x1:x+.06,y1:y+.06,z0:87,z1:88,c:[90,92,90],foot:0}]); }
// litter: a crushed soda can on its side, a ball of newspaper, a bottle in a brown paper bag
function scCan(x,y){ SHARED.PNAME='soda can'; const c=[[200,40,40],[60,120,200],[230,200,60]][Math.floor(hash(Math.round(x*9),Math.round(y*9),781)*3)];
  return prop([sided({x0:x-.11,y0:y-.05,x1:x+.11,y1:y+.05,z0:0,z1:3,c,foot:1,top:X=>Math.abs(X-x)>.08?[190,190,186]:c,fs:(nx,ny,X,Y,z,k)=>scK(nx?[180,180,176]:Math.abs(X-x)<.03?[230,230,226]:c,k)})]); }
function scPaper(x,y){ SHARED.PNAME='crumpled newspaper'; const bs=[]; for(let i=0;i<4;i++){ const h=j=>hash(i,j,Math.round(x*7+y*13)), r=.05+h(1)*.04, ox=(h(2)-.5)*.1, oy=(h(3)-.5)*.1;
    bs.push({x0:x+ox-r,y0:y+oy-r,x1:x+ox+r,y1:y+oy+r,z0:0,z1:2+h(4)*3,c:[182,178,166],foot:1,top:(X,Y)=>hash(Math.floor(X*48),Math.floor(Y*48),783)<.3?[120,118,110]:[190,186,174],fi:()=>[140,138,128],fj:()=>[162,158,148]}); }
  return prop(bs); }
function scBag(x,y){ SHARED.PNAME='bottle in a paper bag'; const B=[150,112,72];
  return prop([{x0:x-.07,y0:y-.07,x1:x+.07,y1:y+.07,z0:0,z1:9,c:B,foot:1,top:()=>[120,88,56],fi:()=>[118,88,58],fj:()=>[140,104,68]},
    {x0:x-.03,y0:y-.03,x1:x+.03,y1:y+.03,z0:9,z1:14,c:[50,90,50],foot:0,top:()=>[200,200,190],fi:()=>[36,70,40],fj:()=>[60,110,60]}]); }
// ---- MOVING THINGS (the objects' life): what the glass shows outside, at a point on a long wall (side 0 north, the platform's
// side; 1 south), s along the line (tiles), z up from the floor. The tunnel: close-up brick, sooty, lit at the windows' height by
// the train's own light; cables, a caged work lamp every 9 tiles, a signal now and then; fast, the brick smears into streaks and the
// lamps into lines. At the station: its tiles (the platform's wall with its band and columns; the track side darker).
function scOutside(side,s,z){ const v=CARV.v, B=v*3, sm=Math.max(0,Math.min(1,(B-3)/9)), lk=.36+.46*Math.exp(-(((z-50)/15)**2));
  let c;
  if(s>=CARV.st0&&s<CARV.st1){ if(side===0){ const row=Math.floor(z/3), tx=s/.25+(row&1)*.5, ti=Math.floor(tx), g=z%3<.6||tx-ti<.1;   // the platform's tiled wall
      const band=z>=49&&z<57, edge=Math.abs(z-48.5)<.6||Math.abs(z-57.5)<.6, base=band?[128,46,40]:edge?[178,152,96]:[196,190,172];
      const sharp=g&&!band?[150,146,134]:scK(base,.88+.12*hash(ti,row,791)), soft=scK(base,band?1:.94); c=scMix(sharp,soft,sm);
      const cm=((s%3)+3)%3; if(cm<.42){ const e=Math.min(cm,.42-cm)*24; c=scMix(e<1?[30,34,44]:[52,58,72],c,sm*.7); }   // a column in front
      c=scK(c,.86*(z<20?.8:1)); }
    else{ const row=Math.floor(z/4), tx=s/.3, g=z%4<.7||tx-Math.floor(tx)<.08; c=scMix(g?[44,46,48]:scK([86,90,94],.8+.2*hash(Math.floor(tx),row,793)),[74,78,82],sm); c=scK(c,.6); } }
  else{ const row=Math.floor(z/4), bx=(s+(row&1)*.25)/.5, col=Math.floor(bx), fu=bx-col, mort=z%4<1||fu<.085;   // brick, 12 x 4 art px
    const h=hash(col,row,795), br=h<.08?[52,34,30]:scMix([104,50,36],[82,40,32],hash(col,row,797)), sharp=mort?[42,38,34]:br, soft=scK([88,44,34],.92+.1*hash(row,7,799));
    c=scMix(sharp,soft,sm); c=scK(c,lk*(1-.35*Math.max(0,(z-66)/20))*(z<12?.7:1));
    if(side===0&&(Math.abs(z-58.2)<.9||Math.abs(z-61)<.6))c=[20,20,22];                               // the cable runs
    if(side===1){ const ni=((s%14)+14)%14; if(ni<1.2&&z>14&&z<70)c=scK(c,.35); const sg=((s+6)%15+15)%15; if(sg<.14&&Math.abs(z-52)<1.4)c=scLit(hash(Math.floor(s/15),1,801)<.5?[240,40,30]:[40,230,90]); }   // a niche; a signal
    if(sm<.4&&((s%6)+6)%6<.3&&z>40&&z<44)c=[200,200,190];                                              // a stencilled marker
    const l=((s+4.5)%9+9)%9-4.5, dp=Math.abs(l)*24, core=dp<2+B&&Math.abs(z-48)<2;                       // a work lamp, its glow
    if(core)return scLit([255,228,168]); const gl=Math.exp(-((dp/(9+B))**2)-(((z-48)/11)**2)); c=[c[0]+130*gl,c[1]+92*gl,c[2]+44*gl]; }
  return c; }
// the glass: the outside, a faint reflection of the inside in streaks, scratches in it (scratchiti)
function scGlass(side,X,z,a){ let c=scOutside(side,CARV.s+(X-SCAR.x0),z); const q=((a+z*.8)%31+31)%31; if(q<2.2)c=scMix(c,[150,160,152],.16);
  const si=Math.floor(a/18), sj=Math.floor(z/9); if(hash(si,sj,805+side)<.22){ const u=a-si*18, v=z-sj*9, m=hash(si,sj,807)-.5; if(u>2&&u<15&&Math.abs(v-4-m*(u-8)*.8)<.3)c=scMix(c,[190,192,186],.7); }
  return scLit(c.map(Math.round)); }
// the light a sliding door's leaf gets (the room's light at the doorway; worked out once on the page)
let SCDL=null; const scDoorLight=()=>SCDL||(SCDL=typeof lightAt==='function'?lightAt(envNear(SCXC,SCN+.2),SCXC,SCN+.2,(LVZ(-1)+40)/24,[0,1,0]).map(v=>Math.max(.2,Math.min(1,v))):[.6,.6,.6]);
// the platform seen through an open door: its yellow edge, its floor, its tiled wall
function scPlatform(X,z){ if(z<2.5)return scLit(Math.floor((X-SCAR.x0)*48)%4?[190,166,62]:[120,104,40]); if(z<16)return scLit(scK([132,132,128],.8+.012*z).map(Math.round)); return scLit(scOutside(0,CARV.s+(X-SCAR.x0),z).map(Math.round)); }
// a window's moving glass: a thin box on the wall's inside face; its own picture is the glass (as the wall's), the life layer the outside
function scWin(x0,x1,side,yw=side?SCS:SCN){ SHARED.PNAME='subway car window'; const y0=side?yw-.02:yw, y1=side?yw:yw+.02, A0=(x0-SCAR.x0)*24, A1=(x1-SCAR.x0)*24;
  const p=prop([sided({x0,y0,x1,y1,z0:SCWZ[0],z1:SCWZ[1],c:SCP.glass,life:1,foot:1,top:()=>null,fs:(nx,ny,X,Y,zr)=>{ if(ny!==(side?-1:1))return null;
    const a=(X-SCAR.x0)*24, z=zr+SCWZ[0]; if(scRound(a,z,A0,A1,SCWZ[0],SCWZ[1])!==2)return null; return LIFE.mode===1?scGlass(side,X,z,a):SCP.glass; }})],null,{high:true,walk:true,noLine:true});
  p.life=scLife; return p; }
// a door's moving parts: its two windows always, and on the platform's side, at the stop, the leaves sliding into the wall and the
// platform beyond (the leaves drawn here only while they move or stand open; shut, the wall's painted ones show)
function scDoorLife(xc,side,yw=side?SCS:SCN){ SHARED.PNAME='subway car door'; const y0=side?yw-.02:yw, y1=side?yw:yw+.02;
  const p=prop([sided({x0:xc-SCDW,y0,x1:xc+SCDW,y1,z0:0,z1:76,c:SCP.glass,life:1,foot:1,top:()=>null,fs:(nx,ny,X,Y,z)=>{ if(ny!==(side?-1:1))return null;
    const u=X-xc, q=Math.abs(u), o=side?0:CARV.open*(SCDW-.02), a=(X-SCAR.x0)*24;
    if(LIFE.mode!==1){ const r=scRound((q-.04)*24,z,2.8,12.2,38,66,3); return q>.02&&r===2?SCP.glass:null; }
    if(q<o)return scPlatform(X,z);
    const lq=q-o; if(lq<.02)return o>0?scLit([20,20,22]):null; const r=scRound((lq-.04)*24,z,2.8,12.2,38,66,3);
    if(r===2)return o>0?scLit(scK(scPlatform(X,z),.9).map(Math.round)):scGlass(side,X,z,a);
    if(!o)return null; const L=scDoorLight(), c=scLeaf(side,lq,z,a,821+side*10); return scLit([c[0]*L[0],c[1]*L[1],c[2]*L[2]].map(Math.round)); }})],null,{high:true,walk:true,noLine:true});
  p.life=scLife; return p; }
function scLife(t){ CARV.t=t; }   // (where it is along the line: the loop's clock, 47-west-subway)
// a strip light under the ceiling's curve along a wall (glowing); one stretch of one of them flickers
function scStrip(x0,x1,side,fl,yw=side?SCS:SCN){ SHARED.PNAME='subway car light'; const y0=side?yw-.24:yw, y1=side?yw:yw+.24, TUBE=scLit([214,230,220]);
  const flick=()=>{ const f=Math.floor(CARV.t*8); return hash(f,0,831)<.18||(hash(Math.floor(CARV.t/3),0,833)<.25&&hash(f,1,835)<.6); };
  const p=prop([sided({x0,y0,x1,y1,z0:79,z1:84,c:SCP.steelD,life:fl?1:0,foot:1,top:()=>SCP.steelD,fs:(nx,ny,X,Y,z)=>{
    if(ny!==(side?-1:1)&&nx===0)return LIFE.mode===1?null:SCP.steelD; if(nx)return LIFE.mode===1?null:SCP.steelD;
    const on=z>.8&&z<4.2, rib=Math.floor((X-x0)*48)%6===0;
    if(LIFE.mode===1)return fl&&on&&X>fl[0]&&X<fl[1]&&flick()?[58,62,60]:null;
    return on?(rib?scLit([170,184,176]):TUBE):SCP.steelD; }})],null,{high:true,walk:true,noLine:true});
  if(fl){ p.life=scLife; p.lifeKey=()=>flick()?1:0; } return p; }
// dust floating in the light down the middle of the car: specks on a sheet of air, drifting, brighter under the lights
function scDust(){ SHARED.PNAME='dust in the air'; const y=SCYC;
  const p=prop([sided({x0:SCAR.x0+.4,y0:y-.005,x1:SCAR.x1-.4,y1:y+.005,z0:8,z1:80,c:[0,0,0],life:1,em:1,foot:1,top:()=>null,fs:(nx,ny,X,Y,zr)=>{
    if(LIFE.mode!==1||nx)return null; const t=CARV.t, ci=Math.floor(X*3.3), h=j=>hash(ci,j,841), cz=Math.floor(zr/6);
    if(hash(ci,cz,843)>.06)return null; const sx=(ci+.5+.4*Math.sin(t*.3*(.5+h(1))+h(2)*6))/3.3, sz=cz*6+3+2.5*Math.sin(t*.21*(.5+h(3))+cz+h(4)*6);
    if(Math.abs(X-sx)*24>.55||Math.abs(zr-sz)>.55)return null; const near=Math.exp(-((((X-SCXC)%2.8+4.2)%2.8-1.4)**2)*1.2);
    return scLit(scK([206,212,200],.22+.38*near*(zr/72)).map(Math.round)); }})],null,{walk:true,noLine:true});
  p.life=scLife; return p; }
// ---- the car's things (on level -1: made at the floor and lowered, as an added object is, 22's makeItem)
const scDown=p=>{ p.boxes=p.boxes.map(b=>zShift(b,-UH)); p.lv=-1; p.chunk=chunkAtL((p.x0+p.x1)/2,(p.y0+p.y1)/2,-1); return p; };
WSUB.carPlace=()=>{
  SCSEG.forEach(([a,b],i)=>{ const ends=[i>0,i<3]; scDown(scBench(a+.02,SCN,b-a-.04,1,ends)); scDown(scBench(a+.02,SCS-SCBD,b-a-.04,-1,ends)); });
  for(const d of SCDOOR)scDown(scPole(d,SCYC));
  for(const [w0,w1] of SCWIN)for(const s of [0,1])scDown(scWin(w0,w1,s));
  for(const d of SCDOOR)for(const s of [0,1])scDown(scDoorLife(d,s));
  SCSEG.forEach(([a,b],i)=>{ for(const s of [0,1])scDown(scStrip(a+.1,b-.1,s,i===2&&s===1?[a+.6,a+2.2]:null)); });
  scDown(scDust());
  scDown(scCan(SCAR.x0+3.1,SCYC+.5)); scDown(scCan(SCDOOR[2]+1.6,SCN+.9)); scDown(scPaper(SCDOOR[1]-1.4,SCYC-.3)); scDown(scPaper(SCAR.x1-1.2,SCS-.95)); scDown(scBag(SCAR.x0+.45,SCS-.85));
  for(let i=0;i<8;i++)LAMPS.push({x:SCAR.x0+1.4+i*2.8,y:SCYC,z:-UH+83,r:5.2,c:i===5?[.5,.58,.54]:[.86,.98,.9],room:true,own:true});   // the strip lights' light: cold, dim, one weak (by the flickering tube)
};
const SIDE=(y,R)=>R&&y>(R.y0+R.y1)/2?1:0;   // a piece on a car's wall: north (0) or south (1) by the room's middle; its plane is the piece's own y
CATALOG['subway bench']=(x,y,R)=>{ const s=SIDE(y,R); return scBench(x-2.2,y-SCBD/2,4.4,s?-1:1,[true,true]); }; CATALOG['subway pole']=(x,y)=>scPole(x,y);
CATALOG['soda can']=(x,y)=>scCan(x,y); CATALOG['crumpled newspaper']=(x,y)=>scPaper(x,y); CATALOG['bottle in a paper bag']=(x,y)=>scBag(x,y);
CATALOG['subway car window']=(x,y,R)=>{ const s=SIDE(y,R); return scWin(x-.95,x+.95,s,s?y+.01:y-.01); }; CATALOG['subway car door']=(x,y,R)=>{ const s=SIDE(y,R); return scDoorLife(x,s,s?y+.01:y-.01); };
CATALOG['subway car light']=(x,y,R)=>{ const s=SIDE(y,R); return scStrip(x-2.15,x+2.15,s,null,s?y+.12:y-.12); };
CATALOG['station column']=(x,y)=>WSUB.column(x-.35,y-.35); CATALOG['station bench']=(x,y)=>WSUB.bench(x,y-1.4); CATALOG['lit sign']=(x,y)=>WSUB.litSign(x,y,'190 ST'); CATALOG['tunnel signal']=(x,y)=>WSUB.signal(x,y,[0,1]);
Object.assign(CAT_INFO,{
  'subway bench':{no:'S-801',name:'Subway Bench',dept:'street',price:1800,desc:'Three moulded seats, orange and yellow, on a heater, an end panel and a pole at each end. Tagged.',mat:'fibreglass, stainless steel'},
  'subway pole':{no:'S-802',name:'Subway Pole',dept:'street',price:120,desc:'A stainless pole, floor to ceiling, worn bright where hands hold it.',mat:'stainless steel'},
  'soda can':{no:'H-341',name:'Crushed Soda Can',dept:'stock',price:0,desc:'Empty, on its side.',mat:'aluminium'},
  'crumpled newspaper':{no:'H-342',name:'Crumpled Newspaper',dept:'stock',price:0,desc:'Yesterday’s paper, balled up.',mat:'newsprint'}});
for(const k of ['subway bench','subway pole','soda can','crumpled newspaper','bottle in a paper bag','subway car window','subway car door','subway car light','station column','station bench','lit sign','tunnel signal'])KIND_OF[k]=k;
WSUB.carWall=carWall; WSUB.carFloor=carFloorCol; WSUB.car={xc:SCXC,yc:SCYC,n:SCN,doors:SCDOOR,dw:SCDW}; }   // (what the placing, 22's walls and the ride ask for)

// =====================================================================================
// THE WEST END'S SUBWAY, 3: THE STAIRS DOWN FROM THE SIDEWALK (owner, 16 Oct 2026: the subway "bring all of these back and put on map"; the
// spot on the West End's north sidewalk past the dojo's garden, WEND.subway in 21-world-map-5-0-west-plan). A New York stairwell as the old
// world's way down was (its steps going down into the dark, the stone round them, archive 21-world-map-2-ground's marketCol and 21-world-map-3-walls'
// parapet), made a real one: a hole in the sidewalk (landWest leaves its squares nothing) a tile past its head, the steps going down in it to
// a lit doorway under the sidewalk, tiled walls either side with a handrail on each, seen through the hole (p.sunk, 43, as the tunnel's open cut
// is); round it green iron railings, open at the head, and at the head a green globe lamp on a post either side (green: open all night); a
// SUBWAY plate on the railing across its far end. Step onto the head and you're asked down (47-west-subway: the fade to the platform). Made
// by WSUB.entrance, from 26-zzzzzzzzzzzz-west-subway (after every other object).
// =====================================================================================
WSUB.entrance=s=>{ const x0=s.x0+1, x1=s.x1, y0=s.y0, y1=s.y1, N=12, run=(x1-x0)/N, D=N*8, lit=c=>Object.assign([...c],{e:1});
  const G={iron:[34,70,50],ironL:[52,98,70],ironD:[22,46,34],tile:[214,208,190],grout:[150,146,132],dirt:[120,112,96],tread:[150,146,138],nose:[74,76,80],riser:[104,100,94],cope:[158,154,144],globe:[96,214,130],globeL:[200,255,214],globeD:[40,140,74],plate:[22,22,24],ink:[238,238,232]};
  const wall=(u,z,f)=>{ const i=Math.floor(u*24/6), k=Math.floor(-z/3), g=(u*24/6-i)<.17||(-z/3-k)<.34;   // the walls: small cream tiles, grimier low down and toward the foot of the steps
    let c=g?G.grout:sh(G.tile,.94+.08*hash(i,k,331)); if(z<-D+18)c=sh(c,.72); const d=hash(Math.floor(u*24/3),Math.floor(-z/4),333); if(d<.08)c=sh(c,.86);
    return sh(c,f*(.8+.2*Math.max(0,1+z/D))); };
  SHARED.PNAME='subway stairs'; const bs=[];
  for(let k=0;k<N;k++){ const a=x0+k*run, t=-8*(k+1), dk=Math.max(.45,1-k*.045);   // each step: its tread, a steel nosing at its edge, its riser; darker as they go down
    bs.push({x0:a,y0:y0+.12,x1:a+run,y1:y1-.12,z0:-D-8,z1:t,c:G.tread,foot:0,nb:1,top:(X)=>sh(mt('stairs',a+run-X<.05?G.nose:speck(G.tread,X,y0,341)),dk),fi:(Y,z)=>sh(G.riser,dk*.8),fj:(X,z)=>sh(G.riser,dk)}); }
  // the end under the sidewalk: the doorway into the station, lit, its tiles round it
  const door=(Y,z)=>{ const m=(y0+y1)/2, q=Math.abs(Y-m)*24; if(q<14&&z<-D+66){ if(q>12.5||z>-D+64.5)return [60,62,66]; const k=1-(z+D)/66; return lit([Math.round(170+70*k),Math.round(150+60*k),Math.round(96+40*k)]); } return wall(Y,z,.8); };
  bs.push(sided({x0:x1,y0,x1:x1+.3,y1,z0:-D-8,z1:0,c:G.tile,foot:0,nb:1,top:()=>G.cope,fs:(nx,ny,X,Y,z)=>nx<0?door(Y,z-D-8):sh(G.tile,.6)}));
  // the walls either side (their tops the stone round the hole) and a handrail along each, stepped down with the steps
  for(const [a,b,n] of [[y0,y0+.12,1],[y1-.12,y1,-1]]){ bs.push(sided({x0,y0:a,x1,y1:b,z0:-D-8,z1:0,c:G.tile,foot:0,nb:1,top:()=>G.cope,fs:(nx,ny,X,Y,z)=>ny===n?wall(X,z-D-8,1):sh(G.tile,.6)}));
    const ry=n>0?b:a-.04; for(let k=0;k<N;k++){ const xa=x0+k*run; bs.push({x0:xa,y0:ry,x1:xa+run,y1:ry+.04,z0:-8*(k+1)+30,z1:-8*(k+1)+32,c:G.ironL,foot:0,nb:1,top:()=>G.ironL,fi:()=>G.iron,fj:()=>G.ironD}); } }
  LAMPS.push({x:(x0+x1)/2+1,y:(y0+y1)/2,z:2,r:3,c:[1,.9,.72]});   // the stairwell's own lights on its walls, warm, spilling up out of it
  const well=prop([{x0:s.x0+1,y0,x1,y1,z0:0,z1:.01,foot:1,nb:1,top:()=>null,fi:()=>null,fj:()=>null},...bs],null,{walk:true,noLine:true}); well.sunk={x0,y0,x1,y1};
  // ---- above: the railings, the globes, the plate
  SHARED.PNAME='subway railing'; const R=[], bar=(X,Y,z,along)=>{ const u=(along?X:Y)*24; return z>=27||z<3||Math.abs(u-Math.round(u/4)*4)<.6?G.iron:null; };   // a top and a bottom rail, bars every 4 px
  for(const [a,b] of [[y0-.04,y0+.04],[y1-.04,y1+.04]])R.push(sided({x0,y0:a,x1,y1:b,z0:0,z1:30,c:G.iron,foot:1,nb:1,top:()=>G.ironL,fs:(nx,ny,X,Y,z)=>{ const c=bar(X,Y,z,1); return c&&sh(c,ny?1:.8); }}));
  R.push(sided({x0:x1-.04,y0,x1:x1+.04,y1,z0:0,z1:30,c:G.iron,foot:1,nb:1,top:()=>G.ironL,fs:(nx,ny,X,Y,z)=>{ const c=bar(X,Y,z,0); return c&&sh(c,nx?.8:1); }}));
  for(let X=x0;X<=x1+1e-6;X+=(x1-x0)/4)for(const Y of [y0,y1])R.push({x0:X-.05,y0:Y-.05,x1:X+.05,y1:Y+.05,z0:0,z1:33,c:G.iron,foot:1,top:()=>G.ironL,fi:()=>G.ironD,fj:()=>G.iron});   // its posts
  for(const Y of [(y0+y1)/2-.6,(y0+y1)/2+.6])R.push({x0:x1-.05,y0:Y-.05,x1:x1+.05,y1:Y+.05,z0:0,z1:33,c:G.iron,foot:1,top:()=>G.ironL,fi:()=>G.ironD,fj:()=>G.iron});
  // the plate on the far end's railing: SUBWAY, white on black, read from either side
  const pw=Math.round((y1-y0-.5)*24), PH=11, P=WSUB.art(pw,PH,put=>{ for(let y=0;y<PH;y++)for(let x=0;x<pw;x++)put(x,y,y<1||y>=PH-1?G.iron:G.plate); WSUB.txt(put,'SUBWAY',Math.floor((pw-23)/2),3,G.ink,1); });
  const py0=y0+.25; R.push(sided({x0:x1-.03,y0:py0,x1:x1+.03,y1:py0+pw/24,z0:31,z1:31+PH,c:G.plate,foot:0,top:()=>G.iron,fs:(nx,ny,X,Y,z)=>nx?(P(Math.floor((nx<0?Y-py0:py0+pw/24-Y)*24),Math.floor(PH-z))||G.plate):G.iron}));
  prop(R,null,{walk:true});
  // the globes at the head, either side: a green post, the green glass globe on top (lit), its cap
  SHARED.PNAME='subway globe'; for(const Y of [y0,y1]){ const X=x0, g=(u,z,f)=>{ const q=Math.hypot(u*24,z-5); return q<1.8?G.globeL:sh(G.globe,f*(1-.03*q)); };
    prop([{x0:X-.06,y0:Y-.06,x1:X+.06,y1:Y+.06,z0:0,z1:60,c:G.iron,foot:1,top:()=>G.ironL,fi:()=>G.ironD,fj:()=>G.iron},
      {x0:X-.09,y0:Y-.09,x1:X+.09,y1:Y+.09,z0:60,z1:62,c:G.ironD,foot:0},
      sided({x0:X-.2,y0:Y-.2,x1:X+.2,y1:Y+.2,z0:62,z1:72,c:G.globe,em:1,foot:0,top:(u,v)=>Math.hypot(u-X,v-Y)<.08?lit(G.ironD):lit(G.globeL),fs:(nx,ny,u,v,z)=>lit(g(nx?v-Y:u-X,z,nx?.82:1).map(Math.round))}),
      {x0:X-.06,y0:Y-.06,x1:X+.06,y1:Y+.06,z0:72,z1:75,c:G.ironD,foot:0}],null,{walk:true});
    LAMPS.push({x:X,y:Y,z:67,r:3,c:[.42,1,.58]}); } };

};
export {westSubway};
