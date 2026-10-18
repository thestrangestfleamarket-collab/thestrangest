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
  const MAP={x0:RING.wx0,x1:172+MAINX.e,y0:B00.y0,y1:FAR+12},   /* (x1 70 further east, y1: the far sidewalk 12 tiles deep: 3, then 6, owner 18 Oct 2026, "double the size of the siewalk on the central park side"; 12, the same day, "make sidewalk on central park side 2x bigger": map-pre.js's MAINX, NORTHY) */ POOLX=82, AV=AVE, RG=RING;   /* (x0: on west to the loop's west street, 17 Oct 2026) */   // (the street's run: on east past the apartment building and the Avenue's mouth, 17 Oct 2026; the pool room's west wall as it was)
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
    // (owner, 18 Oct 2026: "more varied slightly, uneven bricks, cracks random": each brick's length its own, its joints moved up to a texel and a
    // half either way; a little warmer or cooler brick to brick; a hairline crack now and then stepping down through the joints and bricks)
    const k=Math.floor(z/5), zz=z-k*5, e=u*24/11+(k&1)*.5, jt=q=>(hash(q,k,37)-.5)*.26, b0=Math.floor(e), bi=e<b0+jt(b0)?b0-1:b0, l=bi+jt(bi), uu=e, bx=(e-l)/(1+jt(bi+1)-jt(bi)), hb=hash(bi,k,11), hp=hash(Math.floor(u*24),Math.floor(z),13);
    if(zz<1||bx<1/11)return rlf(sh(mt('mortar',sh(hp<.3?[118,110,100]:[132,124,112],.62)),f),zz<1?2:3);
    if((zz===4||zz===1)&&(bx<2/11||bx>10/11)&&hash(bi,k,15)<.3)return sh(mt('mortar',[104,96,88]),f*.7);   // (a chipped corner)
    let b=sh(c,.9+hb*.2); if(hb<.05)b=sh(c,.62); else if(hb>.96)b=sh(c,1.22);
    b=sh(b,(zz===4?1.1:zz===1?.84:1)*(.94+.12*hp)*(1-.18*Math.max(0,1-(z-11)/60)*cvNoise(u*1.7,z/40,17)));
    if(Math.abs(cvNoise(u*24/8,z/8,41)-.5)<.025&&cvNoise(u*24/34,z/34,43)>.66)b=sh(b,.6);   // (a crack)
    const w=(hash(bi,k,39)-.5)*.12; b=[b[0]*(1+w),b[1],b[2]*(1-w)];
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
  BOD.g={bodegaWall,grain,speck,COPE,DTBRICK,hash,grassCol,lawnCol,kerbFace,cvNoise}; BOD.CURB=CURB; BOD.FAR=FAR;   // (the game's painters the look's builder asks for)
  BOD.gbox=gbox; BOD.faceTex=faceTex; BOD.bq=bq; BOD.C=C; BOD.facade=facade; BOD.FRAME=FRAME; BOD.place=place; BOD.placeAt=placeAt; BOD.MAP=MAP; BOD.K={MKS,CATALOG,PROPS,STUDIO,LSEED,STORY,sh};   // (place: the apartment house's furniture is set the same way, apts.js)
  // CROSSWALKS (owner, 17 Oct 2026, mockup 1): white bars over the road at the park's gate and across the Avenue's mouth, over the Avenue at its mouth
  // and at the park's east gate; each a run [a0, a1, axis]: the bars across the axis, long along the way people walk, a little worn
  const PCX=(50-MAINX.w+LAY.e('park')[0]+AV.x0+LAY.e('park')[2])/2+LAY.o('park').x, PCY=(MAP.y1+RG.ny0)/2+LAY.o('park').y, GATE=[PCX-3.5,PCX+3.5], EGATE=[PCY-2,PCY+2];   // (the park's middle, its gates: park.js)
  // ---- THE STREET'S WORKS (owner, 18 Oct 2026): "rounded" kerbs at the loop's corners and the Avenue's mouth; "add bike lines"; "make sure
  // they have curbs and drains and sewers in right spots". All painted into the ground's and the kerbs' pictures (no new faces but the curves'
  // few, no lights, no programs). The roads in the street's tiles, the four the loop has (groundY's own): the main street, the Avenue, the west
  // street, the north street; a corner's square of KR tiles either side of it
  const KR=1.6, RR=[[MAP.x0,CURB,MAP.x1,FAR],[AV.r0,FAR,AV.r1,RG.nr1],[RG.wr0,FAR,RG.wr1,RG.nr1],[RG.wr0,RG.nr0,AV.r1,RG.nr1]];
  // ROUNDED CORNERS: where two roads meet, the sidewalk's corner a quarter circle of KR (cv: the sidewalk's outer corner, cut back, the road in;
  // else the sidewalk's inner corner, filled out, the road's corner rounded); s: the way from the corner into its square (the sidewalk's for a cut
  // corner, the road's for a filled one); C its circle's middle. The six where the loop's inner block and the west street's and the Avenue's mouths
  // stand on the road, the two the outer sidewalks wrap round at the north street's ends
  const CORN=[[RG.wr0,FAR,-1,1,1],[RG.wr1,FAR,1,1,1],[AV.r0,FAR,-1,1,1],[AV.r1,FAR,1,1,1],[RG.wr1,RG.nr0,1,-1,1],[AV.r0,RG.nr0,-1,-1,1],[RG.wr0,RG.nr1,1,-1,0],[AV.r1,RG.nr1,-1,-1,0]].map(([x,y,sx,sy,cv])=>({x,y,sx,sy,cv,cx:x+sx*KR,cy:y+sy*KR}));
  const inQ=(c,x,y)=>{ const u=(x-c.x)*c.sx, v=(y-c.y)*c.sy; return u>=0&&u<=KR&&v>=0&&v<=KR; };
  // the road (a kerb down) at a spot: the four roads, the corners' curves; groundY's, the pictures', the land's hole all from this one
  const ROADAT=(x,y)=>{ let r=false; for(const b of RR)if(x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]){ r=true; break; } for(const c of CORN)if(inQ(c,x,y)&&Math.hypot(x-c.cx,y-c.cy)>KR)return !!c.cv; return r; };
  // the kerb's granite top, the .16 of sidewalk along every edge that meets a road, round the curves too (its joints along the arc): on every
  // sidewalk's edge, not only where a strip was laid ("make sure they have curbs": the far sidewalk's ends at the west street and the Avenue had none)
  const KB=.16, NR=RR.map(b=>[b[0]-KR-.3,b[1]-KR-.3,b[2]+KR+.3,b[3]+KR+.3]), KX=kerbCol('x'), KY=kerbCol('y');
  const kerbAt=(x,y)=>{ if(!NR.some(b=>x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]))return null;
    for(const c of CORN)if(inQ(c,x,y)){ const d=Math.hypot(x-c.cx,y-c.cy); if(c.cv?d>KR-KB:d<KR+KB)return KX(Math.atan2(y-c.cy,x-c.cx)*KR+c.x*7,y); return null; }
    if(ROADAT(x+KB,y)||ROADAT(x-KB,y))return KY(x,y); if(ROADAT(x,y+KB)||ROADAT(x,y-KB))return KX(x,y); return null; };
  const SW=f=>(x,y)=>{ if(ROADAT(x,y))return null; const v=f(x,y); return v&&(kerbAt(x,y)||v); };   // (a sidewalk's painter: open over the road, its kerb along it)
  // THE CROSSINGS (owner, 17 Oct 2026, mockup 1; the bars across the axis, long along the way people walk, a little worn): [a0, a1, axis, the road's
  // edges across]; those by a rounded corner set back past its curve
  const XW=[[GATE[0],GATE[1],'x',CURB,FAR],[AV.r1+.3,AV.x1-.3,'x',CURB,FAR],[RG.wx0+.3,RG.wr0-.3,'x',CURB,FAR],
    [FAR+KR+.3,FAR+KR+1.9,'y',AV.r0,AV.r1],[EGATE[0],EGATE[1],'y',AV.r0,AV.r1],[EGATE[0],EGATE[1],'y',RG.wr0,RG.wr1],[FAR+KR+.3,FAR+KR+1.9,'y',RG.wr0,RG.wr1],
    [GATE[0],GATE[1],'x',RG.nr0,RG.nr1],[RG.wr0+KR+.2,RG.wr0+KR+1.8,'x',RG.nr0,RG.nr1],[AV.r1-KR-1.8,AV.r1-KR-.2,'x',RG.nr0,RG.nr1]];
  const inX=(ax,e,a,m)=>XW.some(w=>w[2]===ax&&e>=w[3]-.01&&e<=w[4]+.01&&a>w[0]-m&&a<w[1]+m);
  // (NYC's ladder, owner 18 Oct 2026, "use NYC markings": two white rails across the road at the crossing's sides, wide rungs between them along
  // the traffic, a rung's width apart)
  const bars=(x,y)=>{ for(const [a0,a1,ax,l0,h0] of XW){ const u=ax==='x'?x:y, v=ax==='x'?y:x; if(u<=a0||u>=a1||v<=l0+.15||v>=h0-.15)continue;
      const W=()=>{ const n=grain(x,y,39,2.2); return n<.3?[150,148,142]:[196,194,186]; };
      if(u<a0+.1||u>a1-.1)return W(); if(u>a0+.25&&u<a1-.25&&(Math.floor((v-l0-.15)/.5)&1)===0)return W(); return null; } return null; };
  // BIKE LANES, NEW YORK'S WAY (owner, 18 Oct 2026: "add bike lines"; then "not green bike lanes. use NYC markings"): along both kerbs of every
  // road of the loop, bare asphalt from the kerb, 1.44 tiles wide, a solid white line on its road side; every 22 tiles the white bicycle and,
  // ahead of it, two chevrons pointing the way it runs (traffic's way: the kerb on its right); the line dashed past a side street's mouth,
  // stopped at the curves and the crossings. [axis, the kerb's line, into the road (+1 / -1), from, to, dashed stretches]
  const LN=[['x',CURB,1,MAP.x0+.5,MAP.x1-.5,[[RG.wr0,RG.wr1],[AV.r0,AV.r1]]],['x',FAR,-1,RG.wr1+KR,AV.r0-KR],['x',FAR,-1,AV.r1+KR,MAP.x1-.5],
    ['y',AV.r0,1,FAR+KR,RG.nr0-KR],['y',AV.r1,-1,FAR+KR,RG.nr0],['y',RG.wr0,1,FAR+KR,RG.nr0],['y',RG.wr1,-1,FAR+KR,RG.nr0-KR],
    ['x',RG.nr0,1,RG.wr1+KR,AV.r0-KR],['x',RG.nr1,-1,RG.wr1,AV.r0]];
  const sd=(px,py,ax,ay,bx,by)=>{ const dx=bx-ax, dy=by-ay, t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy))); return Math.hypot(px-ax-t*dx,py-ay-t*dy); };
  // the stencil: a bicycle (two wheels, its frame, the bars and the saddle) about a tile long, u along the lane, w across it (up toward the road)
  const BIKE=[[-.27,-.08,0,-.06],[0,-.06,-.08,.12],[-.27,-.08,-.08,.12],[-.08,.12,.17,.12],[.17,.12,0,-.06],[.17,.12,.27,-.08],[.17,.12,.15,.2],[.11,.2,.21,.2],[-.14,.14,-.02,.14]];
  const bike=(u,w)=>Math.abs(Math.hypot(u+.27,w+.08)-.15)<.035||Math.abs(Math.hypot(u-.27,w+.08)-.15)<.035||BIKE.some(s=>sd(u,w,...s)<.032);
  const chev=(u,w)=>{ const q=Math.abs(w); return q<.3&&[0,.2].some(c=>Math.abs(u-c+q*.9)<.045); };   // (two chevrons, their points ahead: u the way it runs)
  const WHITE=(x,y,hp)=>{ const n=grain(x,y,611,1.1); return hp<.05?[170,168,160]:n<.3?[188,186,178]:[212,210,202]; };
  const lane=(x,y)=>{ for(const [ax,e,dir,a0,a1,dash] of LN){ const a=ax==='x'?x:y, d=((ax==='x'?y:x)-e)*dir; if(d<.12||d>=1.44||a<a0||a>a1)continue;
      if(inX(ax,e,a,.35))return null;
      const hp=hash(Math.floor(x*24),Math.floor(y*24),613), worn=cvNoise(x*1.7,y*1.7,615)>.78&&hp<.55;
      if(d>=1.32)return worn||dash&&dash.some(r=>a>r[0]-.2&&a<r[1]+.2)&&(Math.floor(a/1.2)&1)?null:WHITE(x,y,hp);   // (the line: worn where the tyres run)
      const t=ax==='x'?dir:-dir, k=Math.round((a-a0-8)/22), sa=a0+8+k*22;
      if(k>=0&&sa<a1-2){ const u=(a-sa)*t; if(u>-.75&&u<.25&&bike(u+.25,d-.74)||u>.45&&u<1&&chev(u-.6,d-.74))return WHITE(x,y,hp); }
      return null; } return null; };
  // THE ROAD'S OWN LINES (NYC): the double yellow down each road's middle (two lines a hand wide, a hand apart), broken at the crossings and through
  // the junctions; a white stop bar across the half of the road whose traffic comes to a crossing (none just out of a junction)
  const JX=[[RG.wr0,CURB,RG.wr1,FAR],[AV.r0,CURB,AV.r1,FAR],[RG.wr0,RG.nr0,RG.wr1,RG.nr1],[AV.r0,RG.nr0,AV.r1,RG.nr1]], inJ=(x,y,m)=>JX.some(b=>x>b[0]-m&&x<b[2]+m&&y>b[1]-m&&y<b[3]+m);
  const YEL=[[190,156,54],[212,176,62]];
  const marks=(x,y)=>{ const hp=hash(Math.floor(x*24),Math.floor(y*24),617);
    for(const b of RR){ if(!(x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]))continue; const ax=b[2]-b[0]>b[3]-b[1]?'x':'y', a=ax==='x'?x:y, v=ax==='x'?y:x, m=ax==='x'?(b[1]+b[3])/2:(b[0]+b[2])/2, q=Math.abs(v-m);
      if(q>.06&&q<.19&&!inJ(x,y,.3)&&!inX(ax,m,a,1.1))return cvNoise(x*1.7,y*1.7,619)>.8&&hp<.5?null:YEL[grain(x,y,621,1.1)<.4?0:1]; break; }
    for(const [a0,a1,ax,l0,h0] of XW){ const u=ax==='x'?x:y, v=ax==='x'?y:x, m=(l0+h0)/2; if(v<=l0+.12||v>=h0-.12||inJ(x,y,1.5))continue;   // ('x': eastbound in the low half meets it before a0; 'y': northbound in the high half)
      const lo=ax==='x'; if(u>a0-1.05&&u<a0-.7&&(lo?v<m-.2:v>m+.2)||u>a1+.7&&u<a1+1.05&&(lo?v>m+.2:v<m-.2))return WHITE(x,y,hp); }
    return null; };
  // DRAINS AND SEWERS: a storm drain's grate in the gutter where the kerb has its inlet (drain(): the kerb's face, below), every 28 tiles along each
  // kerb and just before each corner's curve, the water's last stop before it; the sewer's round iron covers in the traffic lanes every 40 tiles and
  // in the middle of each crossing of two roads. Each a painter over its few tiles, found by a two-tile grid so the road's painting stays quick
  const IX=new Map(), at2=(x,y)=>Math.floor(x/2)+','+Math.floor(y/2), feat=(x0,y0,x1,y1,f)=>{ for(let i=Math.floor(x0/2);i<=Math.floor(x1/2);i++)for(let j=Math.floor(y0/2);j<=Math.floor(y1/2);j++){ const k=i+','+j; (IX.get(k)||IX.set(k,[]).get(k)).push(f); } };
  const MH=[], DR=[];
  const manhole=(cx,cy)=>{ MH.push([cx,cy]); feat(cx-.45,cy-.45,cx+.45,cy+.45,(x,y)=>{ const dx=x-cx, dy=y-cy, r=Math.hypot(dx,dy); if(r>=.42)return null;
    if(r>.35)return dx+dy<0?[78,76,72]:[40,40,42];   // (the frame: lit toward the top of the picture)
    if(r>.32)return [26,26,28];   // (the gap round the lid)
    const rs=hash(Math.floor(cx*7),Math.floor(cy*7),621); if(Math.abs(r-.2)<.022)return [36,36,38]; if(r<.07)return [86,84,80];   // (a ring cast in it, the boss)
    const q=((Math.floor((dx+1)*24/3)+Math.floor((dy+1)*24/3))&1); let c=q?[98,95,90]:[62,61,59]; if(r>.24&&hash(Math.floor(x*24),Math.floor(y*24),623)<.12+.15*rs)c=[110,76,52];   // (the waffle; rust round its edge)
    return c; }); };
  const drain=(ax,e,dir,a)=>{ DR.push({ax,e,a}); const x0=ax==='x'?a-.6:Math.min(e,e+dir*.45), x1=ax==='x'?a+.6:Math.max(e,e+dir*.45), y0=ax==='x'?Math.min(e,e+dir*.45):a-.6, y1=ax==='x'?Math.max(e,e+dir*.45):a+.6;
    feat(x0,y0,x1,y1,(x,y)=>{ const u=(ax==='x'?x:y)-a, w=((ax==='x'?y:x)-e)*dir; if(Math.abs(u)>=.55||w<0||w>=.42)return null;
      if(Math.abs(u)>.47||w>.34)return [54,54,56]; return Math.floor((u+.55)*24)%3===0?[18,18,20]:[76,76,78]; }); };   // (an iron frame, bars across the flow)
  // the kerbs' faces down to the road: straight lengths to each curve, the curves after (KA); the two ends of the main street's road too
  BOD.kerbs=[{ax:'x',at:CURB,a0:MAP.x0,a1:MAP.x1,n:1},{ax:'x',at:FAR,a0:MAP.x0,a1:RG.wr0-KR,n:-1,e1:1},{ax:'x',at:FAR,a0:RG.wr1+KR,a1:AV.r0-KR,n:-1,e0:1,e1:1},{ax:'x',at:FAR,a0:AV.r1+KR,a1:MAP.x1,n:-1,e0:1},
    {ax:'y',at:AV.r0,a0:FAR+KR,a1:RG.nr0-KR,n:1,e0:1,e1:1},{ax:'y',at:AV.r1,a0:FAR+KR,a1:RG.nr1-KR,n:-1,e0:1,e1:1},
    {ax:'y',at:RG.wr0,a0:FAR+KR,a1:RG.nr1-KR,n:1,e0:1,e1:1},{ax:'y',at:RG.wr1,a0:FAR+KR,a1:RG.nr0-KR,n:-1,e0:1,e1:1},
    {ax:'x',at:RG.nr0,a0:RG.wr1+KR,a1:AV.r0-KR,n:1,e0:1,e1:1},{ax:'x',at:RG.nr1,a0:RG.wr0+KR,a1:AV.r1-KR,n:-1,e0:1,e1:1},
    {ax:'y',at:MAP.x0,a0:CURB,a1:FAR,n:1},{ax:'y',at:MAP.x1,a0:CURB,a1:FAR,n:-1}].map(k=>({z0:RD,z1:0,...k}));
  for(const k of BOD.kerbs){ if(k.at===MAP.x0||k.at===MAP.x1)continue; const ds=[]; if(k.e0)ds.push(k.a0+1); if(k.e1)ds.push(k.a1-1);
    for(let a=k.a0+14;a<k.a1-8;a+=28)if(ds.every(b=>Math.abs(b-a)>10))ds.push(a);
    for(const a of ds)if(a>k.a0+.6&&a<k.a1-.6&&!inX(k.ax,k.at,a,1.2))drain(k.ax,k.at,k.n,a); }
  { const yc=(CURB+FAR)/2, xw=(RG.wr0+RG.wr1)/2, xa=(AV.r0+AV.r1)/2, yn=(RG.nr0+RG.nr1)/2, ok=(x,y)=>!XW.some(w=>{ const u=w[2]==='x'?x:y, v=w[2]==='x'?y:x; return u>w[0]-1.2&&u<w[1]+1.2&&v>w[3]&&v<w[4]; });
    for(const [x,y] of [[xw,yc],[xa,yc],[xw,yn],[xa,yn]])manhole(x,y);   // (in the middle of each crossing of two roads)
    let k=0; for(let x=MAP.x0+20;x<MAP.x1-4;x+=40,k++)if(ok(x,yc)&&Math.abs(x-xw)>8&&Math.abs(x-xa)>8)manhole(x,yc+(k&1?1.6:-1.6));
    k=0; for(let y=FAR+20;y<RG.nr0-5;y+=40,k++)for(const xm of [xw,xa])if(ok(xm,y))manhole(xm+(k&1?1.6:-1.6),y);
    k=0; for(let x=RG.wr1+20;x<AV.r0-5;x+=40,k++)if(ok(x,yn))manhole(x,yn+(k&1?1.6:-1.6)); }
  // the road's painter: a manhole or a drain's grate, else a crossing's bars, else the bike lane, else the asphalt; nothing off the road
  const RW=(x,y)=>{ if(!ROADAT(x,y))return null; const L=IX.get(at2(x,y)); if(L)for(const f of L){ const v=f(x,y); if(v)return v; } return bars(x,y)||lane(x,y)||marks(x,y)||roadCol(x,y,0); };
  // a kerb's face with a drain's inlet: the dark mouth under its lit top, a lip of granite at its foot
  BOD.kerbFaceAt=(k,a,z,H)=>{ for(const d of DR)if(d.ax===k.ax&&d.e===k.at&&Math.abs(a-d.a)<.5){ if(z>=H-1)break; if(Math.abs(a-d.a)>.44)return [96,94,88]; return z<1?[120,116,108]:[14,14,16]; } return kerbFace(a,z,H); };
  // the curves' faces, KA (each a few straight pieces along its arc, its length along for the granite's joints), the land's holes for the roads
  // (map-post.js: the main street with the west street's and the Avenue's lengths up to the north street, one outline round their corners'
  // curves; the north street another, its two filled corners round)
  const arc=(c,rev,n=6)=>{ const a0=Math.atan2(-c.sy,0), a1=Math.atan2(0,-c.sx); let dl=a1-a0; while(dl>Math.PI)dl-=2*Math.PI; while(dl<-Math.PI)dl+=2*Math.PI;
    const P=[]; for(let i=0;i<=n;i++){ const t=a0+dl*i/n; P.push([c.cx+Math.cos(t)*KR,c.cy+Math.sin(t)*KR]); } return rev?P.reverse():P; };   // (from its point on the corner's y line to its point on its x line)
  BOD.kerbArcs=CORN.map(c=>({P:arc(c),z0:RD,z1:0}));
  { const C=(x,y)=>CORN.find(c=>c.x===x&&c.y===y), M=MAP;
    BOD.roadPolys=[[[M.x0,CURB],[M.x1,CURB],[M.x1,FAR],...arc(C(AV.r1,FAR)),[AV.r1,RG.nr0],...arc(C(AV.r0,RG.nr0)),...arc(C(AV.r0,FAR),1),...arc(C(RG.wr1,FAR)),...arc(C(RG.wr1,RG.nr0),1),[RG.wr0,RG.nr0],...arc(C(RG.wr0,FAR),1),[M.x0,FAR]],
      [[RG.wr0,RG.nr0],[AV.r1,RG.nr0],...arc(C(AV.r1,RG.nr1),1),...arc(C(RG.wr0,RG.nr1))]]; }
  // the corners' squares: a cut corner's the road's picture (its curve's road), a filled corner's the sidewalk's
  const PATCH=CORN.map(c=>({id:'corner',x0:Math.min(c.x,c.cx),y0:Math.min(c.y,c.cy),x1:Math.max(c.x,c.cx),y1:Math.max(c.y,c.cy),z:c.cv?RD:0,col:c.cv?RW:SW(slabCol),tex:null,rep:2}));
  // THE STREET'S SIGNS (owner, 18 Oct 2026: "use NYC markings and street signs etc everywhere"; drawn into the street's pictures, bodbuild.js):
  // at every corner a galvanized post with the two streets' green name blades crossed at its top (and two across the main street from the side
  // streets' mouths); a STOP sign where the west street and the Avenue come down to the main street; along every kerb every 24 tiles a post with a
  // NO PARKING plate, every third a SPEED LIMIT 25; each three quarters of a tile in from the kerb (clear of the street lights' feet)
  const SG=[], NM={main:'MARKET ST',west:'WEST ST',north:'NORTH ST',ave:'THE AVE'}, CN=[['main','west'],['main','west'],['main','ave'],['main','ave'],['north','west'],['north','ave'],['north','west'],['north','ave']];
  CORN.forEach((c,i)=>{ const k=c.cv?KR-1.2:KR+1.2; SG.push({kind:'name',x:c.cx-c.sx*k/Math.SQRT2,y:c.cy-c.sy*k/Math.SQRT2,ax:NM[CN[i][0]],ay:NM[CN[i][1]]}); });
  SG.push({kind:'name',x:RG.wr1+1,y:CURB-.75,ax:NM.main,ay:NM.west},{kind:'name',x:AV.r0-1,y:CURB-.75,ax:NM.main,ay:NM.ave});
  for(const i of [0,2]){ const c=CORN[i]; SG.push({kind:'stop',x:c.x+c.sx*.75,y:c.y+c.sy*(KR+2.4),n:[0,1]}); }   // (facing the traffic coming south)
  { let q=0; for(const k of BOD.kerbs){ if(k.at===MAP.x0||k.at===MAP.x1)continue; for(let a=k.a0+6;a<k.a1-4;a+=24){ if(inX(k.ax,k.at,a,2)||inJ(k.ax==='x'?a:k.at,k.ax==='x'?k.at:a,2))continue;
      const p=k.at-k.n*.75; SG.push({kind:q++%3===2?'speed':'nopark',x:k.ax==='x'?a:p,y:k.ax==='x'?p:a,n:k.ax==='x'?[1,0]:[0,1]}); } } }
  BOD.signs=SG;
  BOD.road={KR,CORN,RR,at:ROADAT,MH,DR,LN}; window.STREETQ=()=>({...BOD.road,XS:BOD.XS,ZS:BOD.ZS,CURB,FAR,MAP,AV,RG,corner:typeof DRESS!=='undefined'&&DRESS.corner});   // (the corner light and a test's look: dress.js, tests)
  // ---- THE GROUND: the shop's sealed concrete (and the office's), the sidewalk's slabs, the kerb, the street's asphalt, the far kerb and sidewalk, grass in the gaps
  BOD.grounds=[
    {id:'shop',bld:true,x0:B0.x0,y0:B0.y0,x1:B0.x1,y1:B0.y1,z:.15,col:(x,y)=>bodegaFloorCol(x,y),tex:'concrete_floor_worn_001',tint:[112,116,124],rep:3},
    {id:'walk',x0:MAP.x0,y0:W,x1:MAP.x1,y1:CURB-.16,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'kerb',x0:MAP.x0,y0:CURB-.16,x1:MAP.x1,y1:CURB,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'road',x0:MAP.x0,y0:CURB,x1:MAP.x1,y1:FAR,z:RD,col:RW,tex:'asphalt_02',tint:[62,64,68],rep:3},
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
    {id:'aveRoad',x0:AV.r0,y0:FAR,x1:AV.r1,y1:RG.nr0,z:RD,col:RW,tex:'asphalt_02',tint:[62,64,68],rep:3},
    {id:'aveKE',x0:AV.r1,y0:MAP.y1,x1:AV.r1+.16,y1:RG.nr1,z:0,col:kerbCol('y'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'aveE',x0:AV.r1+.16,y0:MAP.y1,x1:AV.x1,y1:AV.ey1,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},
    // THE WEST STREET and THE NORTH STREET (the loop, 17 Oct 2026): as the Avenue: an outer sidewalk, its kerb, the road a kerb down, the inner
    // kerb and sidewalk along the park; the corners' outer squares sidewalk; a crosswalk at each of the park's gates
    {id:'kerb2w',x0:MAP.x0,y0:FAR,x1:RG.wr0,y1:FAR+.16,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'wstW',x0:RG.wx0,y0:FAR+.16,x1:RG.wr0-.16,y1:RG.nr1,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'wstKW',x0:RG.wr0-.16,y0:FAR+.16,x1:RG.wr0,y1:RG.nr1,z:0,col:kerbCol('y'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'wstRoad',x0:RG.wr0,y0:FAR,x1:RG.wr1,y1:RG.nr0,z:RD,col:RW,tex:'asphalt_02',tint:[62,64,68],rep:3},
    {id:'wstKE',x0:RG.wr1,y0:MAP.y1,x1:RG.wr1+.16,y1:RG.nr0-.16,z:0,col:kerbCol('y'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'wstE',x0:RG.wr1+.16,y0:MAP.y1,x1:RG.wx1,y1:RG.nr0-.16,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'nthS',x0:RG.wr1,y0:RG.ny0,x1:AV.r0,y1:RG.nr0-.16,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'nthKS',x0:RG.wr1,y0:RG.nr0-.16,x1:AV.r0,y1:RG.nr0,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'nthRoad',x0:RG.wr0,y0:RG.nr0,x1:AV.r1,y1:RG.nr1,z:RD,col:RW,tex:'asphalt_02',tint:[62,64,68],rep:3},
    {id:'nthKN',x0:RG.wr0,y0:RG.nr1,x1:AV.r1,y1:RG.nr1+.16,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'nthN',x0:RG.wx0,y0:RG.nr1+.16,x1:AV.r1+.16,y1:RG.ny1,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'ghostst',bld:true,x0:GHOSTK.GSK.o[0]+.2,y0:GHOSTK.GSK.o[1]+8.3*GHOSTK.GSK.s-8.75*4/3,x1:GHOSTK.GSK.o[0]+10.4,y1:GHOSTK.GSK.o[1]+8.3*GHOSTK.GSK.s,z:.1,col:(x,y)=>GHOSTK.gsFloor(x,y)||lawnCol(x,y),tex:null,rep:2},   // (Ghost Street's paving: the kit's own, gsFloor)
    {id:'grassW',x0:MAP.x0,y0:B00.y0,x1:B0.x0,y1:W,z:0,col:holed(lawnCol),tex:null,rep:2},...PATCH].map(g=>g.id==='corner'||g.bld||g.id==='alley'||g.id==='grassW'||g.col===RW?g:{...g,col:SW(g.col)});   // (every sidewalk and kerb strip its kerb along the road and open over a curve's road: SW)   // (the lot west of the bodega, the stairs' hole in it: the park's lawn, as all grass is; the land's sheet lies under every other gap)
  // the kerbs' faces down to the road
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
  groundY=(x,z)=>{ const gx=x/TILE+OX, gy=z/TILE+OY; return ROADAT(gx,gy)?YS(RD):(window.HILL?HILL(x,z):0); }   /* (the park's hills: park.js) */;   // (the road a kerb down: the loop's four sides, round their corners' curves, so a step down the kerb follows it: ROADAT)   // (the road a kerb down: the street's, and the Avenue's north from it)
  BOD.inside=(x,z)=>{ const gx=x/TILE/K+OX, gy=z/TILE/K+OY; return gx>B0.x0&&gx<B0.x1&&gy>B0.y0&&gy<B0.y1; };
}
}
