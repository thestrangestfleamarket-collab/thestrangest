// ---- THE BODEGA AND ITS BIT OF STREET (the game's: LBLD 'lbodega', 21-world-map-5-land; its things 23-w-bodega-shop, placed as 26-bodega places
// them; its front dressed as 26-zzz-downtown dresses it; the street light 23-w-street-3-city's cobra-head; the goods 47-physics-5-goods). The game's
// own code makes every object (GAMEKIT below: its helpers, then its files word for word); here each of its boxes is built in 3D.
// On the map (owner, 16 Oct 2026: "a small map with only the subway, pool and bodega, next to each other"): its street run long past it both ways,
// the subway's stairs down in the sidewalk west of it, the pool room east of it ----
const BOD={meshes:[], walls:{}, lamps:[]};
{
/*GAMEKIT*/
{ // (the map's own names in a scope of their own: the game's files above have some of the same)
  const B0=LBLD[0], BODOFF=B0.y0+3.75, W=LSEED.walk, CURB=LSEED.street, FAR=LSEED.grass, RD=-4;   // (the road 4 art px below the sidewalk: a kerb you step down)
  const OX=(B0.x0+B0.x1)/2, OY=B0.y1, K=BLDK, X=x=>(x-OX)*TILE*K, Z=y=>(y-OY)*TILE*K, Y=z=>z*ZU*K, XS=x=>(x-OX)*TILE, ZS=y=>(y-OY)*TILE, YS=z=>z*ZU; Object.assign(BOD,{X,Z,Y,XS,ZS,YS,OX,OY,B0,BODOFF});   // (X Z Y: the building, a tenth bigger from its front's middle, BLDK; XS ZS YS: the street, as it was)
  const MAP={x0:50,x1:108,y0:B0.y0,y1:FAR+3}, POOLX=82;   // (the street's run; the pool room's west wall)
  // the subway's stairs (MAPSTAIR, the map's: tiles) a hole in the ground; elsewhere the ground's own colour
  const holed=f=>(x,y)=>x>=MAPSTAIR.x0&&x<MAPSTAIR.x1&&y>=MAPSTAIR.y0&&y<MAPSTAIR.y1?null:f(x,y);
  // ---- the painting of a face: fn(i, j) its colour, null (a hole) or glowing (.e, or four long); the colours and the glow as two canvases
  const C=v=>v?((v.e||v.length>3)?[...v.slice(0,3).map(x=>Math.max(0,Math.min(255,Math.round(x)))),1]:v.map(x=>Math.max(0,Math.min(255,Math.round(x))))):null;
  const faceTex=(w,h,fn)=>{ w=Math.max(1,Math.round(w)); h=Math.max(1,Math.round(h)); const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'), im=g.createImageData(w,h);
    let ie=null, ge=null;
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){ const v=fn(i,j), k=(j*w+i)*4; if(!v)continue; im.data[k]=v[0]; im.data[k+1]=v[1]; im.data[k+2]=v[2]; im.data[k+3]=255;
      if(v.length>3){ if(!ie){ ge=document.createElement('canvas'); ge.width=w; ge.height=h; ie=new ImageData(w,h); } ie.data[k]=v[0]; ie.data[k+1]=v[1]; ie.data[k+2]=v[2]; ie.data[k+3]=255; } }
    g.putImageData(im,0,0); if(ie)ge.getContext('2d').putImageData(ie,0,0); return {map:{image:c},em:ie?{image:ge}:null}; };
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
  function place(p,rot){ const o={boxes:p.boxes,x0:p.x0,y0:p.y0,x1:p.x1,y1:p.y1,solids:p.solids}, r=((rot%4)+4)%4, cx=(o.x0+o.x1)/2, cy=(o.y0+o.y1)/2, ncx=cx, ncy=cy;
    const fw=(x,y)=>{ let dx=x-cx, dy=y-cy; for(let k=0;k<r;k++)[dx,dy]=[-dy,dx]; return [ncx+dx,ncy+dy]; };
    const bw=(x,y)=>{ let dx=x-ncx, dy=y-ncy; for(let k=0;k<r;k++)[dx,dy]=[dy,-dx]; return [cx+dx,cy+dy]; };
    const rect=b=>{ const a=fw(b.x0,b.y0), c=fw(b.x1,b.y1); return {x0:Math.min(a[0],c[0]),x1:Math.max(a[0],c[0]),y0:Math.min(a[1],c[1]),y1:Math.max(a[1],c[1])}; };
    if(r)p.boxes=o.boxes.map(b=>{ const nb={...b,...rect(b)}, fi0=b.fi||(()=>sh(b.c,.62)), fj0=b.fj||(()=>sh(b.c,.8));
      if(b.top)nb.top=(x,y)=>b.top(...bw(x,y));
      if(b.fs){ nb.fs=(nx,ny,x,y,z,k)=>{ for(let q=0;q<r;q++)[nx,ny]=[ny,-nx]; return b.fs(nx,ny,...bw(x,y),z,k); }; return sided(nb); }
      nb.fi=(y,z)=>{ const [ox,oy]=bw(ncx,y); return fi0(r&1?ox:oy,z); }; nb.fj=(x,z)=>{ const [ox,oy]=bw(x,ncy); return fj0(r&1?oy:ox,z); }; return nb; });
    Object.assign(p,rect(o)); if(o.solids&&r)p.solids=o.solids.map(b=>({...b,...rect(b)}));
    for(const l of LAMPS)if(l.prop===p){ l.at0=l.at0||[l.x,l.y]; [l.x,l.y]=fw(...l.at0); } }
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
  function facade(nx,ny,X_,Y_,z,f,cap){ const u=nx?Y_:X_, c=DTBRICK;
    if(z>=cap-4)return sh(mt('cope',COPE),z<cap-3?f*.72:f);
    if(z>=cap-20){ const r=cap-4-z, t=sh(mt('cope',COPE),f); if(r<3)return sh(t,1.08); if(r<5)return sh(t,.62); if(r<10)return (Math.floor(u*24/3)&1)?sh(t,.95):sh(t,.55); if(r<12)return sh(t,.7); if(r<15)return t; }
    { const s=z%STORY; if(z>STORY-4&&(s<4||s>=STORY-2)){ const t=sh(mt('cope',speck([170,162,148],u,z/24,97)),f); return s>=STORY-2?sh(mt('mortar',sh(c,.6)),f*.6):s===3?sh(t,1.12):s===0?sh(t,.8):t; } }
    if(z<8)return sh(mt('cope',speck([150,146,136],u,z/24,95)),f*(z<1?.8:1));
    if(z<11)return sh(mt('cope',[150,146,136]),f*(z<9?1.1:.9));
    const k=Math.floor(z/5), zz=z-k*5, uu=u*24/11+(k&1)*.5, bi=Math.floor(uu);
    if(zz<1||uu-bi<1/11)return rlf(sh(mt('mortar',sh(c,.6)),f),zz<1?2:3);
    return rlf(sh(mt('brick',sh(c,.9+hash(bi,k,11)*.2)),f),zz>=4?1:0); }
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
  put('counter','long counter',B.x1-1.05,B.y0+5.4,1); put('cigs','cigarette rack',B.x1-.22,B.y0+5.0,1,1); put('radio','radio',B.x1-.24,B.y0+4.0,1,1);
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
  put('mat-out','door mat',m,W+.75); }   // (the mat outside the door: 26-zzz-downtown's door mats)
  // THE FRONT AND THE STREET, as 26-zzz-downtown dresses them (and the cobra-head street light the city had along the row, 26-zzzz-city, here at x 71)
  const FRONT=[], ROOF=[], STREET=[];
  { const M=MKS, bo=B0, bm=(bo.x0+bo.x1)/2, n0=PROPS.length;
    M.pipe(bo.x0+.2,W,bo.h-6);
    // (the DELI awning and the COFFEE sign gone: owner, 17 Oct 2026, "remove the awning and coffee sign from bodega"; to be replaced)
    M.neon(bo.x0+1.5,W,64,'OPEN',[255,90,110]); M.signbox(bo.x0+.45,bo.x0+2.3,W,36,48,[250,250,246],[40,80,200],'LOTTO',false);
    M.gatebox(bo.x0+.2,bo.x1-.2,W,114); M.bell(bm,W,98); M.meterbox(bo.x0+.9,W,30); M.number(bo.x0+1.6,W,82,'66'); M.moss(bo.x0+.3,bo.x0+3,W);
    for(const p of PROPS.slice(n0))FRONT.push(p);
    // (the street's things, gone: the ice box, the papers, the milk crates, the standpipe and the cobra-head street light; owner, 17 Oct 2026: "remove trash can and all
    // street items (like poles and street lights) all will be replaced". STREET stays, empty, for what replaces them)
    const n2=PROPS.length, R=(f,x,y,z,...a)=>{ const p=f(x,y,z,W,...a); p.solids=[]; return p; };
    R(M.vent,bo.x0+3,bo.y0+5,bo.h); R(M.antenna,bo.x0+8,bo.y0+3.5,bo.h); R(M.roofac,bo.x0+6,bo.y0+7.5,bo.h); for(const p of PROPS.slice(n2))ROOF.push(p); }
  BOD.O=O; BOD.FRONT=FRONT; BOD.STREET=STREET; BOD.ROOF=ROOF; BOD.MAP=MAP; BOD.RD=RD;
  // which wall a hung thing is on (it goes with that wall where the wall is cut away)
  const wallOf=p=>{ const cx=(p.x0+p.x1)/2, cy=(p.y0+p.y1)/2; let best=null, bd=.5; for(const w of WALLS){ const a=w.ax==='x'?cx:cy, d=Math.abs((w.ax==='x'?cy:cx)-w.at); if(a>=w.a0-.2&&a<=w.a1+.2&&d<bd){ bd=d; best=w; } } return best; };
  BOD.kindOf=p=>{ if(ROOF.includes(p))return 'R'; if(FRONT.includes(p))return 'Hfront'; if(p.high){ const w=wallOf(p); if(w)return 'H'+w.id; } return 'L'; };
  BOD.paintProps=()=>{ for(const p of [...Object.values(O),...FRONT,...STREET,...ROOF]){ const k=BOD.kindOf(p); BATCH.tag=OBJ('bodega',p.name); for(const b of p.boxes)gbox(b,k); } BATCH.tag=null; };   // (each thing tagged: the world editor)
  BOD.g={bodegaWall,grain,speck,COPE,DTBRICK,hash};   // (the game's painters the look's builder asks for)
  BOD.gbox=gbox; BOD.faceTex=faceTex; BOD.bq=bq; BOD.C=C; BOD.facade=facade; BOD.FRAME=FRAME; BOD.place=place; BOD.MAP=MAP; BOD.K={MKS,CATALOG,PROPS,STUDIO,LSEED,STORY,sh};   // (place: the apartment house's furniture is set the same way, apts.js)
  // ---- THE GROUND: the shop's sealed concrete (and the office's), the sidewalk's slabs, the kerb, the street's asphalt, the far kerb and sidewalk, grass in the gaps
  BOD.grounds=[
    {id:'shop',bld:true,x0:B0.x0,y0:B0.y0,x1:B0.x1,y1:B0.y1,z:.15,col:(x,y)=>bodegaFloorCol(x,y),tex:'concrete_floor_worn_001',tint:[112,116,124],rep:3},
    {id:'walk',x0:MAP.x0,y0:W,x1:MAP.x1,y1:CURB-.16,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'kerb',x0:MAP.x0,y0:CURB-.16,x1:MAP.x1,y1:CURB,z:0,col:()=>[178,174,164],tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'road',x0:MAP.x0,y0:CURB,x1:MAP.x1,y1:FAR,z:RD,col:(x,y)=>roadCol(x,y,0),tex:'asphalt_02',tint:[62,64,68],rep:3},
    {id:'kerb2',x0:MAP.x0,y0:FAR,x1:MAP.x1,y1:FAR+.16,z:0,col:()=>[178,174,164],tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'walk2',x0:MAP.x0,y0:FAR+.16,x1:MAP.x1,y1:MAP.y1,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'grassW',x0:MAP.x0,y0:B0.y0,x1:B0.x0,y1:W,z:0,col:holed(grassCol),tex:null,rep:2},
    {id:'grassE',x0:B0.x1,y0:B0.y0,x1:POOLX,y1:W,z:0,col:grassCol,tex:null,rep:2}];
  // the kerbs' faces down to the road
  BOD.kerbs=[{ax:'x',at:CURB,a0:MAP.x0,a1:MAP.x1,z0:RD,z1:0,n:1},{ax:'x',at:FAR,a0:MAP.x0,a1:MAP.x1,z0:RD,z1:0,n:-1}];
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
  for(const p of [...Object.values(O),...STREET]){ if(p.high||/mat$|^door mat|bags|fly|tube|bell|clock|calendar|cord|mirror|phone|flap|dock|radio|cigs|chair/.test(p.key||p.name||''))continue;
    const bs=p.boxes.filter(b=>!b.nb&&b.z0<30&&b.z1-b.z0>3); if(!bs.length)continue; const r={x0:Math.min(...bs.map(b=>b.x0)),y0:Math.min(...bs.map(b=>b.y0)),x1:Math.max(...bs.map(b=>b.x1)),y1:Math.max(...bs.map(b=>b.y1))};
    sol(r.x0,r.y0,r.x1,r.y1,Math.max(...bs.map(b=>b.z1))); }
  BOUND={x0:XS(MAP.x0),x1:XS(MAP.x1),z0:Z(B0.y0),z1:ZS(MAP.y1)};
  groundY=(x,z)=>{ const gy=z/TILE+OY; return gy>CURB&&gy<FAR?YS(RD):0; };
  BOD.inside=(x,z)=>{ const gx=x/TILE/K+OX, gy=z/TILE/K+OY; return gx>B0.x0&&gx<B0.x1&&gy>B0.y0&&gy<B0.y1; };
}
}
