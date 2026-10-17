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
  W.column=(x0,y0)=>{ PNAME='station column'; const x1=x0+.7, y1=y0+.7, tile=(u,z,f)=>sh(W.tile(u,z-SZ,1),f), by0=y1+.12, by1=by0+1.6, bx=x0+.3, LW=by1-by0;
    const led=(nx,Y,z)=>{ let a=(Y-by0)*24*2; if(nx>0)a=LW*48-a; const r=Math.floor((SZ+74-z)*2);   // in half pixels: along the board (read left to right from either side), down from its top
      for(let l=0;l<3;l++){ const t=LEDTXT[l], w=t.length*4, x=Math.floor(a-(LW*48-w)/2), yy=r-6-l*9; if(yy<0||yy>=5||x<0||x>=w)continue;
        const g=LED35[t[Math.floor(x/4)]], q=x%4; return q<3&&g&&g[yy*3+q]==='1'?SC6.dot:SC6.dotDim; } return SC6.board; };
    return prop([sided({x0,y0,x1,y1,z0:SZ,z1:-6,c:[186,190,197],foot:1,top:()=>SC6.cap,fs:(nx,ny,X,Y,zr)=>tile(nx?Y:X,zr+SZ,nx?.8:1)}),
      {x0,y0,x1,y1,z0:-6,z1:0,c:SC6.cap,foot:1},
      {x0:x0-.09,y0:y0+.27,x1:x0,y1:y0+.43,z0:SZ+66,z1:SZ+72,c:SC6.cam,fi:(y,z)=>Math.hypot((y-y0-.35)*24,z-68.5)<1.6?SC6.lens:sh(SC6.cam,.7),fj:()=>sh(SC6.cam,.85),foot:0},   // the dome camera (z: from the platform, its picture lowered)
      {x0:bx-.02,y0:y1,x1:bx+.02,y1:by0,z0:SZ+71,z1:SZ+73,c:SC6.dark,foot:0},                                        // the bracket
      sided({x0:bx-.07,y0:by0,x1:bx+.07,y1:by1,z0:SZ+56,z1:SZ+74,c:SC6.board,em:1,foot:0,top:()=>SC6.board,fs:(nx,ny,X,Y,zr)=>nx?led(nx,Y,zr+SZ+56):SC6.board})],null,{lv:-1}); };
  // a bench: steel slats on two black legs, a back on the platform's side, arms at both ends and in the middle; it faces the track
  W.bench=(x,y0)=>{ PNAME='station bench'; const y1=y0+2.8, c=SC6, slat=(u,z,f)=>sh(Math.floor(u*24/1.5)%2?c.steel:c.steelL,f);
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
  W.litSign=(x,y,t)=>{ PNAME='lit sign'; const w=t.length*4+5, H=12, L=w/24, y0=y-L/2, A=plate(w,H,t,QS.ink,QS.plate,QS.iron);
    return prop([{x0:x-.03,y0,x1:x+.03,y1:y0+L,z0:80,z1:80+H,c:QS.plate,em:1,foot:1,fi:faceX(y0,L,80+H,A,()=>QS.plate),fj:()=>QS.iron,top:()=>QS.iron},
      ...[y0+.15,y0+L-.2].map(p=>({x0:x-.015,x1:x+.015,y0:p,y1:p+.05,z0:80+H,z1:UH,c:QS.iron,foot:0}))],null,{walk:true}); };
  // a track signal on a post: a black head with a red lamp (n: facing +y, down the track toward the platform)
  W.signal=(x,y,n)=>{ PNAME='tunnel signal'; return prop([{x0:x-.05,y0:y-.05,x1:x+.05,y1:y+.05,z0:0,z1:44,c:QS.iron},{x0:x-.14,y0:y-.1,x1:x+.14,y1:y+.1,z0:44,z1:60,c:QS.lamp,foot:1},
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
