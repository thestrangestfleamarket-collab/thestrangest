// ---- THE BODEGA AND ITS BIT OF STREET (the game's: LBLD 'lbodega', 21-world-map-5-land; its things 23-w-bodega-shop, placed as 26-bodega places
// them; its front dressed as 26-zzz-downtown dresses it; the street light 23-w-street-3-city's cobra-head; the goods 47-physics-5-goods). The game's
// own code makes every object (GAMEKIT below: its helpers, then its files word for word); here each of its boxes is built in 3D.
// On the map (owner, 16 Oct 2026: "a small map with only the subway, pool and bodega, next to each other"): its street run long past it both ways,
// the subway's stairs down in the sidewalk west of it, the pool room east of it ----
const BOD={meshes:[], walls:{}, lamps:[]};
{
/*GAMEKIT*/
{ // (the map's own names in a scope of their own: the game's files above have some of the same)
  const B0=LBLD[0], B00={...B0}, W=LSEED.walk, CURB=LSEED.street, FAR=LSEED.grass, RD=-4;   // (the road 4 art px below the sidewalk: a kerb you step down)
  const OX=(B00.x0+B00.x1)/2, OY=B00.y1, K=BLDK, X=x=>(x-OX)*TILE*K, Z=y=>(y-OY)*TILE*K, Y=z=>z*ZU*K, XS=x=>(x-OX)*TILE, ZS=y=>(y-OY)*TILE, YS=z=>z*ZU; Object.assign(BOD,{X,Z,Y,XS,ZS,YS,OX,OY,B0});   // (X Z Y: the building, a tenth bigger from its front's middle, BLDK; XS ZS YS: the street, as it was)
  const MAP={x0:RING.wx0,x1:172,y0:B00.y0,y1:FAR+3}, POOLX=82, AV=AVE, RG=RING;   /* (x0: on west to the loop's west street, 17 Oct 2026) */   // (the street's run: on east past the apartment building and the Avenue's mouth, 17 Oct 2026; the pool room's west wall as it was)
  // (moved on the map's layout, LAY: the building itself in the game's tiles, the world's middle (OX, OY: its front's middle as it was) and the street staying put; a tenth bigger, so a tile on the map is 1/BLDK of the game's)
  { const o=LAY.o('bodega'); B0.x0+=o.x/K; B0.x1+=o.x/K; B0.y0+=o.y/K; B0.y1+=o.y/K; }
  const BODOFF=B0.y0+3.75; BOD.BODOFF=BODOFF;
  // the subway's stairs (MAPSTAIR, the map's: tiles) a hole in the ground; elsewhere the ground's own colour
  const holed=f=>(x,y)=>[MAPSTAIR,...RING.stairs].some(S=>x>=S.x0&&x<S.x1&&y>=S.y0&&y<S.y1)?null:f(x,y);   /* (and the loop subway's stairs: sub.js) */
  // ---- the painting of a face: fn(i, j) its colour, null (a hole) or glowing (.e, or four long); the colours and the glow as two canvases
  // (faster, 17 Oct 2026: no canvas a face and no new colour a pixel: the face's pixels straight into an ImageData, rounded there; the batch
  // copies them into its atlas. C only marks a glowing colour)
  const C=v=>v&&v.e&&v.length===3?[v[0],v[1],v[2],1]:v;
  const faceTex=(w,h,fn)=>{ w=Math.max(1,Math.round(w)); h=Math.max(1,Math.round(h)); const im=new ImageData(w,h), d=im.data; let ie=null, e=null;
    for(let j=0,k=0;j<h;j++)for(let i=0;i<w;i++,k+=4){ const v=fn(i,j); if(!v)continue; d[k]=Math.round(v[0]); d[k+1]=Math.round(v[1]); d[k+2]=Math.round(v[2]); d[k+3]=255;
      if(v.length>3){ if(!ie){ ie=new ImageData(w,h); e=ie.data; } e[k]=d[k]; e[k+1]=d[k+1]; e[k+2]=d[k+2]; e[k+3]=255; } }
    return {map:{image:im},em:ie?{image:ie}:null}; };
  const bq=(a,b,c,d,tx,kind)=>BATCH.add([...a,...b,...c,...a,...c,...d],[0,0,1,0,1,1,0,0,1,1,0,1],tx.map.image,tx.em?tx.em.image:null,kind);
  // ---- ONE OF THE GAME'S BOXES (x, y in tiles, z art px): top(X, Y); fs(nx, ny, X, Y, z from its foot, shade) or fi(Y, z), fj(X, z); else its colour
  function gbox(b,kind='L'){ const {x0,x1,y0,y1,z0,z1}=b; if(b.foot&&z1-z0<.05)return; const k=b.em?2:1, H=Math.max(1,(z1-z0)*k);
    if(b.em&&kind==='L')kind='B';
    const side=(nx,ny,P,Q,z)=>C(b.fs?b.fs(nx,ny,P,Q,z-z0,nx?.68:.84):nx&&b.fi?b.fi(Q,z):ny&&b.fj?b.fj(P,z):b.c);
    if(z1-z0>=.5){
      for(const nx of [-1,1]){ const x=nx<0?x0:x1; if(y1-y0<.004)continue; bq([X(x),Y(z0),Z(nx<0?y1:y0)],[X(x),Y(z0),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y1:y0)],
        faceTex((y1-y0)*24*k,H,(i,j)=>{ const t=(i+.5)/((y1-y0)*24*k); return side(nx,0,x,nx<0?y1-t*(y1-y0):y0+t*(y1-y0),z1-(j+.5)/k); }),kind); }
      for(const ny of [-1,1]){ const y=ny<0?y0:y1; if(x1-x0<.004)continue; bq([X(ny<0?x0:x1),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z1),Z(y)],[X(ny<0?x0:x1),Y(z1),Z(y)],
        faceTex((x1-x0)*24*k,H,(i,j)=>{ const t=(i+.5)/((x1-x0)*24*k); return side(0,ny,ny<0?x0+t*(x1-x0):x1-t*(x1-x0),y,z1-(j+.5)/k); }),kind); } }
    if(x1-x0>.004&&y1-y0>.004)bq([X(x0),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y0)],[X(x0),Y(z1),Z(y0)],
      faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(b.top?b.top(x0+(i+.5)/24,y0+(j+.5)/24):b.c)),kind); }
  // ---- placing a thing as the game's placeProp does (22-props-layers-1-props): turned a quarter at a time round its middle, its paint and its lights with it
  // (placeAt: the same turn about a given middle (cx, cy) onto another (ncx, ncy): a whole room's things turned together, store.js's turned rooms;
  // place: a thing turned about its own middle, as the game's placeProp does)
  function place(p,rot){ const o={boxes:p.boxes,x0:p.x0,y0:p.y0,x1:p.x1,y1:p.y1,solids:p.solids}; placeAt(p,rot,(o.x0+o.x1)/2,(o.y0+o.y1)/2,(o.x0+o.x1)/2,(o.y0+o.y1)/2,true); }
  function placeAt(p,rot,cx,cy,ncx,ncy,own){ const o={boxes:p.boxes,x0:p.x0,y0:p.y0,x1:p.x1,y1:p.y1,solids:p.solids}, r=((rot%4)+4)%4;
    const fw=(x,y)=>{ let dx=x-cx, dy=y-cy; for(let k=0;k<r;k++)[dx,dy]=[-dy,dx]; return [ncx+dx,ncy+dy]; };
    const bw=(x,y)=>{ let dx=x-ncx, dy=y-ncy; for(let k=0;k<r;k++)[dx,dy]=[dy,-dx]; return [cx+dx,cy+dy]; };
    const rect=b=>{ const a=fw(b.x0,b.y0), c=fw(b.x1,b.y1); return {x0:Math.min(a[0],c[0]),x1:Math.max(a[0],c[0]),y0:Math.min(a[1],c[1]),y1:Math.max(a[1],c[1])}; };
    if(r)p.boxes=o.boxes.map(b=>{ const nb={...b,...rect(b)}, fi0=b.fi||(()=>sh(b.c,.62)), fj0=b.fj||(()=>sh(b.c,.8));
      if(b.top)nb.top=(x,y)=>b.top(...bw(x,y));
      if(b.fs){ nb.fs=(nx,ny,x,y,z,k)=>{ for(let q=0;q<r;q++)[nx,ny]=[ny,-nx]; return b.fs(nx,ny,...bw(x,y),z,k); }; return sided(nb); }
      nb.fi=(y,z)=>{ const [ox,oy]=bw(ncx,y); return fi0(r&1?ox:oy,z); }; nb.fj=(x,z)=>{ const [ox,oy]=bw(x,ncy); return fj0(r&1?oy:ox,z); }; return nb; });
    Object.assign(p,rect(o)); if(o.solids&&(r||cx!==ncx||cy!==ncy))p.solids=o.solids.map(b=>({...b,...rect(b)}));
    if(own)for(const l of LAMPS)if(l.prop===p){ l.at0=l.at0||[l.x,l.y]; [l.x,l.y]=fw(...l.at0); } }   // (a thing's own turn carries its lamps; a room's turn moves every lamp once, itself)
  // ---- THE WALLS (21-world-map-3-walls, -5-land): .2 thick on the building's edge (its inside face .1 in), STORY high; the front's shop windows
  // and glass door (shop(): the door 1.2 wide in the middle, a window each side from .35 in, 16 to 94 up); the back office's wall across behind
  // the shop, its doorway behind the counter. Each wall's faces in pieces round its holes, the edges of its holes (frames) too
  const WALLS=[];
  const wall=(id,ax,at,a0,a1,H,holes,inS,outS,outer)=>{ WALLS.push({id,ax,at,a0,a1,H,holes,inS,outS,outer}); };
  { const B=B0, m=(B.x0+B.x1)/2, d=(m0)=>({a0:m0-.78,a1:m0+.78,z0:0,z1:94,door:true});   // (the doors 1.3 times: 1.56 wide, 94 high)
    const cuts=[B.x0+.35,m-.95,m+.95,B.x1-.35], win=[]; for(let i=0;i+1<cuts.length;i+=2)win.push({a0:cuts[i],a1:cuts[i+1],z0:16,z1:94,glass:true});
    wall('front','x',B.y1,B.x0,B.x1,B.h,[{...d(m),glass:true},...win],-1,1,true);
    wall('back','x',B.y0,B.x0,B.x1,B.h,[],1,-1,true);
    wall('west','y',B.x0,B.y0-T,B.y1+T,B.h,[],1,-1,true);
    wall('east','y',B.x1,B.y0-T,B.y1+T,B.h,[],-1,1,true);
    wall('office','x',BODOFF,B.x0+T,B.x1-T,B.h-4,[d(B.x1-.95)],1,-1,false); }
  BOD.WALLS=WALLS;
  // ---- the game's painting of a wall: inside, the bodega's painted cinder block (bodegaWall); outside, the row's brick (22's facadeCol: the plinth,
  // its water table, the courses, the cornice and its cope)
  function facade(nx,ny,X_,Y_,z,f,cap,brick){ const u=nx?Y_:X_, c=brick||DTBRICK;   // (brick: a building's own colour, else the row's)
    if(z>=cap-4)return sh(mt('cope',COPE),z<cap-3?f*.72:f);
    if(z>=cap-20){ const r=cap-4-z, t=sh(mt('cope',COPE),f); if(r<3)return sh(t,1.08); if(r<5)return sh(t,.62); if(r<10)return (Math.floor(u*24/3)&1)?sh(t,.95):sh(t,.55); if(r<12)return sh(t,.7); if(r<15)return t; }
    { const s=z%STORY; if(z>STORY-4&&(s<4||s>=STORY-2)){ const t=sh(mt('cope',speck([170,162,148],u,z/24,97)),f); return s>=STORY-2?sh(mt('mortar',sh(c,.6)),f*.6):s===3?sh(t,1.12):s===0?sh(t,.8):t; } }
    if(z<8)return sh(mt('cope',speck([150,146,136],u,z/24,95)),f*(z<1?.8:1));
    if(z<11)return sh(mt('cope',[150,146,136]),f*(z<9?1.1:.9));
    // (the brick, real: owner, 18 Oct 2026, "the bricks arent really textured": the mortar set back (a darker joint, the brick over it throwing a
    // texel of shade on the course below), each brick its own tone and a grain across it, its top lit, a corner chipped now and then, a burnt
    // dark one or a pale one here and there, grime rising from the foot of the wall)
    const k=Math.floor(z/5), zz=z-k*5, uu=u*24/11+(k&1)*.5, bi=Math.floor(uu), bx=uu-bi, hb=hash(bi,k,11), hp=hash(Math.floor(u*24),Math.floor(z),13);
    if(zz<1||bx<1/11)return rlf(sh(mt('mortar',sh(hp<.3?[118,110,100]:[132,124,112],.62)),f),zz<1?2:3);
    if((zz===4||zz===1)&&(bx<2/11||bx>10/11)&&hash(bi,k,15)<.3)return sh(mt('mortar',[104,96,88]),f*.7);   // (a chipped corner)
    let b=sh(c,.9+hb*.2); if(hb<.05)b=sh(c,.62); else if(hb>.96)b=sh(c,1.22);
    b=sh(b,(zz===4?1.1:zz===1?.84:1)*(.94+.12*hp)*(1-.18*Math.max(0,1-(z-11)/60)*cvNoise(u*1.7,z/40,17)));
    return rlf(sh(mt('brick',b),f),zz>=4?1:0); }
  const FRAME=[70,72,78];
  // ---- THE OBJECTS, as 26-bodega puts them (its keys, kinds, places and turns, word for word)
  const O={}, HUNG=[];
  const put=(key,kind,x,y,rot=0,hung)=>{ const f=CATALOG[kind]; if(!f){ console.warn('no',kind); return; } const n0=PROPS.length; const p=f(+x.toFixed(3),+y.toFixed(3)); if(!p)return; p.key=key; p.kind=kind; place(p,rot); if(hung)p.high=true; O[key]=p; };
  { const B={...B0,y0:BODOFF}, m=(B.x0+B.x1)/2;
  put('mat','door mat',m,B.y1-.5);
  put('wb1','shop shelf',B.x0+1.1,B.y0+.36); put('wb2','shop shelf',B.x0+3.1,B.y0+.36); put('wb3','shop shelf',B.x0+5.1,B.y0+.36);
  for(const [i,dy] of [[1,1.0],[2,1.95],[3,2.9]])put('fridge'+i,'drinks fridge',B.x0+.5,B.y0+dy);
  put('wl1','shop shelf',B.x0+.36,B.y0+4.45,3); put('wl2','shop shelf',B.x0+.36,B.y0+6.55,3);
  put('wr1','shop shelf',B.x1-.36,B.y0+2.2,1);
  put('counter','long counter',B.x1-1.05,B.y0+5.4,1); put('cigs','cigarette rack',B.x1-.22,B.y0+5.0,1,1); O.cigs.boxes=O.cigs.boxes.map(b=>b.foot?b:zShift(b,42));   // (hung higher, 42 px: it sat over the Fox's head behind the counter, 17 Oct 2026) put('radio','radio',B.x1-.24,B.y0+4.0,1,1);
  put('lotto','lottery machine',B.x1-1.05,B.y0+4.15,1); put('jar','candy jar',B.x1-1.05,B.y0+4.62); put('bags','paper bags',B.x1-.5,B.y0+7.3); put('phone','wall phone',B.x1-.15,B.y0+7.3,0,1);
  put('clock','wall clock',B.x0+3.1,B.y0+.14,0,1); put('mirror','convex mirror',B.x0+.42,B.y0+.15,0,1); put('calendar','calendar',B.x0+.11,B.y0+1.95,0,1); put('cord','extension cord',B.x0+.11,B.y0+.12,0,1);
  put('tube1','fluorescent tube',m,B.y0+2.5); put('tube2','fluorescent tube',m,B.y0+6.5);
  put('fan','box fan',B.x0+5.1,B.y0+.36); put('fly','fly strip',m-.8,B.y0+4.5); put('bell','door bell',m,B.y1-.24);
  put('news','newspaper rack',B.x0+.6,B.y1-.5); put('dock','drone box',B.x1-.45,B.y0+.45); put('flap','drone flap',B.x1-1.1,B.y1);
  put('wl3','shop shelf',B.x0+.36,B.y0+8.5,3);
  put('mat-fox','counter mat',B.x1-.42,B.y0+5.3); put('mat-run','rubber mat',B.x1-1.75,B.y0+5.3,1);
  { const y0=B0.y0, x0=B0.x0; put('of-desk','desk',x0+1.4,y0+.75); put('of-chair','office chair',x0+1.4,y0+1.6); put('of-pc','home computer',x0+1.4,y0+.6);
    put('of-shelf','shelves with boxes',x0+4.6,y0+.5); put('of-boxes','cardboard boxes',x0+6.6,y0+.7); put('of-sink','utility sink',x0+.55,y0+2.6,3);
    put('of-clock','wall clock',x0+3.2,y0+.29); put('of-tube','fluorescent tube',x0+3.6,y0+1.9); }
  BOD.food={x:B.x1-1.05,y:B.y0+6.3};
  put('mat-out','door mat',m,B0.y1+.75); }   // (the mat outside the door: 26-zzz-downtown's door mats)
  // THE FRONT AND THE STREET, as 26-zzz-downtown dresses them (and the cobra-head street light the city had along the row, 26-zzzz-city, here at x 71)
  const FRONT=[], ROOF=[], STREET=[], GHOSTST=[];
  { const M=MKS, bo=B0, bm=(bo.x0+bo.x1)/2, n0=PROPS.length;
    M.pipe(bo.x0+.2,bo.y1,bo.h-6);
    // (the DELI awning and the COFFEE sign gone: owner, 17 Oct 2026, "remove the awning and coffee sign from bodega"; to be replaced)
    M.neon(bo.x0+1.5,bo.y1,64,'OPEN',[255,90,110]); M.signbox(bo.x0+.45,bo.x0+2.3,bo.y1,36,48,[250,250,246],[40,80,200],'LOTTO',false);
    M.gatebox(bo.x0+.2,bo.x1-.2,bo.y1,114); M.bell(bm,bo.y1,98); M.meterbox(bo.x0+.9,bo.y1,30); M.number(bo.x0+1.6,bo.y1,82,'66'); M.moss(bo.x0+.3,bo.x0+3,bo.y1);
    for(const p of PROPS.slice(n0))FRONT.push(p);
    // (the street's things, gone: the ice box, the papers, the milk crates, the standpipe and the cobra-head street light; owner, 17 Oct 2026: "remove trash can and all
    // street items (like poles and street lights) all will be replaced". STREET stays, empty, for what replaces them)
    // GHOST STREET (owner, 17 Oct 2026: "bring in ghost street from old map"): the kit's wooden shop and its front as the old map had them
    // ("Preset Ghost Street 1": the two ground-floor pieces, the floor above, the tiled roof, the eave with its sign and cooler, the bay window,
    // the door curtain, the drinks machine, the planted beds and their lanterns; not the row houses or the pole), east of the apartment
    // building, its front to the street, its paved forecourt out to the sidewalk (GHOSTK.GSK.o: the kit's corner)
    { const K=GHOSTK.GSK, s=K.s; { const o=LAY.o('ghost'); K.o=[131+o.x/BLDK,W-8.3*s+o.y/BLDK]; }   /* (moved east, owner 17 Oct 2026: the Diner and the Bar between it and the apartments) */ const n3=PROPS.length;
      for(const [k,dx,dy] of PRESETS['Preset Ghost Street 1'])if(!/row house|utility pole/.test(k))CATALOG[k](K.o[0]-3.5*s+dx,K.o[1]-.45*s+dy);
      for(const p of PROPS.slice(n3))GHOSTST.push(p); BOD.GHOSTST=GHOSTST; BOD.GSK=K; gdShape(GHOSTST,K,LAMPS);
      // THE VENDING MACHINES (owner, 17 Oct 2026: "pull in vending machines with real depth from old game, put them in front of ghost street dojo"):
      // the market lounge's two, white and dark red, built as the real thing (a cabinet of sides, back and top round a hollow; the window real
      // glass over lit shelves of cans, each can its own box; the pickup flap a real hollow under a hanging flap; a lamp in the glass:
      // 23-w-y-market-lounge-4-street, word for word, through build.py), in a row east of the dojo's door against its front, beside the kit's teal machine, their windows to the street
      { const n4=PROPS.length, X0=K.o[0]+.6*s, DX=X0+(95+143)/48, Y1=K.o[1]+3.2*s;   /* (the dojo's door's middle and its front: ghostdojo.js's measures) */
        CATALOG['vending machine, red'](DX+2.6,Y1+.55,[0,1]); CATALOG['vending machine, white'](DX+3.85,Y1+.55,[0,1]);   /* (a row east of the door with the kit's teal machine: west of it the bay window juts out) */ for(const p of PROPS.slice(n4))STREET.push(p); } }   // (a third taller, its ground floor a dojo you walk into: ghostdojo.js)
    const n2=PROPS.length, R=(f,x,y,z,...a)=>{ const p=f(x,y,z,bo.y1,...a); p.solids=[]; return p; };
    R(M.vent,bo.x0+3,bo.y0+5,bo.h); R(M.antenna,bo.x0+8,bo.y0+3.5,bo.h); R(M.roofac,bo.x0+6,bo.y0+7.5,bo.h); for(const p of PROPS.slice(n2))ROOF.push(p); }
  BOD.O=O; BOD.FRONT=FRONT; BOD.STREET=STREET; BOD.ROOF=ROOF; BOD.MAP=MAP; BOD.RD=RD;
  // which wall a hung thing is on (it goes with that wall where the wall is cut away)
  const wallOf=p=>{ const cx=(p.x0+p.x1)/2, cy=(p.y0+p.y1)/2; let best=null, bd=.5; for(const w of WALLS){ const a=w.ax==='x'?cx:cy, d=Math.abs((w.ax==='x'?cy:cx)-w.at); if(a>=w.a0-.2&&a<=w.a1+.2&&d<bd){ bd=d; best=w; } } return best; };
  BOD.kindOf=p=>{ if(/fluorescent tube/.test(p.name||''))return 'U'; if(ROOF.includes(p))return 'R';   // (U: hung overhead, seen only from under it)
    if(FRONT.includes(p))return 'Hfront'; if(p.high){ const w=wallOf(p); if(w)return 'H'+w.id; } return 'L'; };
  BOD.paintProps=()=>{ for(const p of [...Object.values(O),...FRONT,...STREET,...ROOF,...GHOSTST]){ const k=BOD.kindOf(p); BATCH.tag=OBJ('bodega',p.name); for(const b of p.boxes)gbox(b,k); } BATCH.tag=null; };   // (each thing tagged: the world editor)
  BOD.g={bodegaWall,grain,speck,COPE,DTBRICK,hash,grassCol,lawnCol}; BOD.CURB=CURB; BOD.FAR=FAR;   // (the game's painters the look's builder asks for)
  BOD.gbox=gbox; BOD.faceTex=faceTex; BOD.bq=bq; BOD.C=C; BOD.facade=facade; BOD.FRAME=FRAME; BOD.place=place; BOD.placeAt=placeAt; BOD.MAP=MAP; BOD.K={MKS,CATALOG,PROPS,STUDIO,LSEED,STORY,sh};   // (place: the apartment house's furniture is set the same way, apts.js)
  // CROSSWALKS (owner, 17 Oct 2026, mockup 1): white bars over the road at the park's gate and across the Avenue's mouth, over the Avenue at its mouth
  // and at the park's east gate; each a run [a0, a1, axis]: the bars across the axis, long along the way people walk, a little worn
  const PCX=(50+LAY.e('park')[0]+AV.x0+LAY.e('park')[2])/2+LAY.o('park').x, PCY=(FAR+3+RG.ny0)/2+LAY.o('park').y, GATE=[PCX-3.5,PCX+3.5], EGATE=[PCY-2,PCY+2];   // (the park's middle, its gates: park.js)
  const zebra=(x,y,runs)=>{ const c=roadCol(x,y,0); for(const [a0,a1,ax,l0,h0] of runs){ const u=ax==='x'?x:y, v=ax==='x'?y:x, lo=l0!=null?l0+.4:ax==='x'?CURB+.4:AV.r0+.4, hi=h0!=null?h0-.4:ax==='x'?FAR-.4:AV.r1-.4;
      if(u>a0&&u<a1&&v>lo&&v<hi&&(Math.floor((u-a0)/.6)&1)===0){ const n=grain(x,y,39,2.2); return n<.3?[150,148,142]:[196,194,186]; } } return c; };
  // ---- THE GROUND: the shop's sealed concrete (and the office's), the sidewalk's slabs, the kerb, the street's asphalt, the far kerb and sidewalk, grass in the gaps
  BOD.grounds=[
    {id:'shop',bld:true,x0:B0.x0,y0:B0.y0,x1:B0.x1,y1:B0.y1,z:.15,col:(x,y)=>bodegaFloorCol(x,y),tex:'concrete_floor_worn_001',tint:[112,116,124],rep:3},
    {id:'walk',x0:MAP.x0,y0:W,x1:MAP.x1,y1:CURB-.16,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'kerb',x0:MAP.x0,y0:CURB-.16,x1:MAP.x1,y1:CURB,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'road',x0:MAP.x0,y0:CURB,x1:MAP.x1,y1:FAR,z:RD,col:(x,y)=>zebra(x,y,[[GATE[0],GATE[1],'x'],[AV.r1+.3,AV.x1-.3,'x'],[RG.wx0+.3,RG.wr0-.3,'x']]),tex:'asphalt_02',tint:[62,64,68],rep:3},
    // THE BACK ALLEY (owner, 17 Oct 2026, mockup 1): a service lane behind the whole row, worn asphalt, the fire escapes' side
    {id:'alley',x0:MAP.x0,y0:-101,x1:MAP.x1,y1:-96,z:0,col:(x,y)=>roadCol(x,y,1),tex:'asphalt_02',tint:[86,87,90],rep:3},
    // (the far kerb and sidewalk in two, either side of the Avenue's mouth, where its road runs into the street's; the Avenue's own: its two
    // sidewalks, its road a kerb down, its kerb strips, north from the far sidewalk's line to its end; its west sidewalk along the park's east wall)
    {id:'kerb2',x0:RG.wr1,y0:FAR,x1:AV.r0,y1:FAR+.16,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'walk2',x0:RG.wr1,y0:FAR+.16,x1:AV.r0,y1:MAP.y1,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'kerb2e',x0:AV.r1,y0:FAR,x1:MAP.x1,y1:FAR+.16,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'walk2e',x0:AV.r1,y0:FAR+.16,x1:MAP.x1,y1:MAP.y1,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'aveW',x0:AV.x0,y0:MAP.y1,x1:AV.r0-.16,y1:RG.nr0-.16,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'aveKW',x0:AV.r0-.16,y0:MAP.y1,x1:AV.r0,y1:RG.nr0-.16,z:0,col:kerbCol('y'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'aveRoad',x0:AV.r0,y0:FAR,x1:AV.r1,y1:RG.nr0,z:RD,col:(x,y)=>zebra(x,y,[[FAR+.2,FAR+1.8,'y'],[EGATE[0],EGATE[1],'y']]),tex:'asphalt_02',tint:[62,64,68],rep:3},
    {id:'aveKE',x0:AV.r1,y0:MAP.y1,x1:AV.r1+.16,y1:RG.nr1,z:0,col:kerbCol('y'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'aveE',x0:AV.r1+.16,y0:MAP.y1,x1:AV.x1,y1:AV.ey1,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},
    // THE WEST STREET and THE NORTH STREET (the loop, 17 Oct 2026): as the Avenue: an outer sidewalk, its kerb, the road a kerb down, the inner
    // kerb and sidewalk along the park; the corners' outer squares sidewalk; a crosswalk at each of the park's gates
    {id:'kerb2w',x0:MAP.x0,y0:FAR,x1:RG.wr0,y1:FAR+.16,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'wstW',x0:RG.wx0,y0:FAR+.16,x1:RG.wr0-.16,y1:RG.nr1,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'wstKW',x0:RG.wr0-.16,y0:FAR+.16,x1:RG.wr0,y1:RG.nr1,z:0,col:kerbCol('y'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'wstRoad',x0:RG.wr0,y0:FAR,x1:RG.wr1,y1:RG.nr0,z:RD,col:(x,y)=>zebra(x,y,[[EGATE[0],EGATE[1],'y',RG.wr0,RG.wr1],[FAR+.2,FAR+1.8,'y',RG.wr0,RG.wr1]]),tex:'asphalt_02',tint:[62,64,68],rep:3},
    {id:'wstKE',x0:RG.wr1,y0:MAP.y1,x1:RG.wr1+.16,y1:RG.nr0-.16,z:0,col:kerbCol('y'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'wstE',x0:RG.wr1+.16,y0:MAP.y1,x1:RG.wx1,y1:RG.nr0-.16,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'nthS',x0:RG.wr1,y0:RG.ny0,x1:AV.r0,y1:RG.nr0-.16,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'nthKS',x0:RG.wr1,y0:RG.nr0-.16,x1:AV.r0,y1:RG.nr0,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'nthRoad',x0:RG.wr0,y0:RG.nr0,x1:AV.r1,y1:RG.nr1,z:RD,col:(x,y)=>zebra(x,y,[[GATE[0],GATE[1],'x',RG.nr0,RG.nr1],[RG.wr0+.2,RG.wr0+1.8,'x',RG.nr0,RG.nr1],[AV.r1-1.8,AV.r1-.2,'x',RG.nr0,RG.nr1]]),tex:'asphalt_02',tint:[62,64,68],rep:3},
    {id:'nthKN',x0:RG.wr0,y0:RG.nr1,x1:AV.r1,y1:RG.nr1+.16,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'nthN',x0:RG.wx0,y0:RG.nr1+.16,x1:AV.r1+.16,y1:RG.ny1,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'ghostst',bld:true,x0:GHOSTK.GSK.o[0]+.2,y0:GHOSTK.GSK.o[1]+8.3*GHOSTK.GSK.s-8.75*4/3,x1:GHOSTK.GSK.o[0]+10.4,y1:GHOSTK.GSK.o[1]+8.3*GHOSTK.GSK.s,z:.1,col:(x,y)=>GHOSTK.gsFloor(x,y)||lawnCol(x,y),tex:null,rep:2},   // (Ghost Street's paving: the kit's own, gsFloor)
    {id:'grassW',x0:MAP.x0,y0:B00.y0,x1:B0.x0,y1:W,z:0,col:holed(lawnCol),tex:null,rep:2}];   // (the lot west of the bodega, the stairs' hole in it: the park's lawn, as all grass is; the land's sheet lies under every other gap)
  // the kerbs' faces down to the road
  BOD.kerbs=[{ax:'x',at:CURB,a0:MAP.x0,a1:MAP.x1,z0:RD,z1:0,n:1},{ax:'x',at:FAR,a0:MAP.x0,a1:RG.wr0,z0:RD,z1:0,n:-1},{ax:'x',at:FAR,a0:RG.wr1,a1:AV.r0,z0:RD,z1:0,n:-1},{ax:'x',at:FAR,a0:AV.r1,a1:MAP.x1,z0:RD,z1:0,n:-1},
    {ax:'y',at:AV.r0,a0:FAR,a1:RG.nr0,z0:RD,z1:0,n:1},{ax:'y',at:AV.r1,a0:FAR,a1:RG.nr1,z0:RD,z1:0,n:-1},
    {ax:'y',at:RG.wr0,a0:FAR,a1:RG.nr1,z0:RD,z1:0,n:1},{ax:'y',at:RG.wr1,a0:FAR,a1:RG.nr0,z0:RD,z1:0,n:-1},
    {ax:'x',at:RG.nr0,a0:RG.wr1,a1:AV.r0,z0:RD,z1:0,n:1},{ax:'x',at:RG.nr1,a0:RG.wr0,a1:AV.r1,z0:RD,z1:0,n:-1}];   // (the loop's: the far kerb open at the west street's and the Avenue's mouths, each side's two kerbs, the north street's)   // (the far kerb open at the Avenue's mouth; the Avenue's two kerbs, and its end)
  // ---- the lights: the game's LAMPS as its objects made them (the tubes, the coolers, the neon, the street light), each a point light here
  BOD.LAMPS=LAMPS.filter(l=>!l.off&&l.r>0);
  // ---- the goods (47-physics-5-goods: their kinds, colours and rows, word for word)
/*GOODS*/
  BOD.GOOD=GOOD; BOD.GLAY=GLAY; BOD.GC=GC;
  // where you can't walk: the walls (but their doorways), the fixtures standing on the floor, the square, the street light's pole
  const sol=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
  for(const w of WALLS){ let a=w.a0; const ds=w.holes.filter(h=>h.door).sort((p,q)=>p.a0-q.a0);
    const seg=(a0,a1)=>{ if(a1-a0<.01)return; if(w.ax==='x')sol(a0,w.at-.1,a1,w.at+.1,w.H); else sol(w.at-.1,a0,w.at+.1,a1,w.H); };
    for(const d of ds){ seg(a,d.a0); a=d.a1; } seg(a,w.a1); }
  for(const p of [...Object.values(O),...STREET,...GHOSTST]){ if(p.high||/mat$|^door mat|bags|fly|tube|bell|clock|calendar|cord|mirror|phone|flap|dock|radio|cigs|chair/.test(p.key||p.name||''))continue;
    const bs=p.boxes.filter(b=>!b.nb&&b.z0<30&&b.z1-b.z0>3); if(!bs.length)continue; const r={x0:Math.min(...bs.map(b=>b.x0)),y0:Math.min(...bs.map(b=>b.y0)),x1:Math.max(...bs.map(b=>b.x1)),y1:Math.max(...bs.map(b=>b.y1))};
    sol(r.x0,r.y0,r.x1,r.y1,Math.max(...bs.map(b=>b.z1))); }
  BOUND={x0:XS(MAP.x0),x1:XS(MAP.x1),z0:Z(B00.y0),z1:ZS(MAP.y1)};
  groundY=(x,z)=>{ const gx=x/TILE+OX, gy=z/TILE+OY; return (gy>CURB&&gy<FAR&&gx>MAP.x0&&gx<MAP.x1)||(gx>AV.r0&&gx<AV.r1&&gy>=FAR&&gy<RG.nr1)||(gx>RG.wr0&&gx<RG.wr1&&gy>=FAR&&gy<RG.nr1)||(gy>RG.nr0&&gy<RG.nr1&&gx>RG.wr0&&gx<AV.r1)?YS(RD):0; };   // (the road a kerb down: the loop's four sides)   // (the road a kerb down: the street's, and the Avenue's north from it)
  BOD.inside=(x,z)=>{ const gx=x/TILE/K+OX, gy=z/TILE/K+OY; return gx>B0.x0&&gx<B0.x1&&gy>B0.y0&&gy<B0.y1; };
}
}
