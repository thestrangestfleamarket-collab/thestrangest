// ---- THE STOREROOM (owner, 17 Oct 2026: "brng back diner and bar with all musicians, the moonshrine, the herb cottage, the octopus tank,
// castle keep, butterflies ... dont add them to the map yet just bring to this new game and all items"): the game's own rooms, built by
// the game's own makers (build.py reads their files word for word into the kit: BOD.STOREK) and set out here far east of the map, out of
// sight of it, on one dark concrete floor: a storeroom. Not on the map: the view can't slide to it and nothing leads there; the menu's
// STORED row takes you to each to look. Each room as the game has it: the Diner (Preset Diner 1 in its 13.5 x 7 room, its stone floor,
// its beadboard walls), the Bar (the Diner's pieces made a bar's, set out as 26-zzz-bar sets them, its stage with the grand and the drum
// kit, at night: only the candles lit), the Moon Shrine (Preset Moon Shrine 1 on grass), the Herb Cottage (every piece where the page put
// it, its own walls and roof), the Octopus Tank's room (dark plaster, polished concrete, the tank on its stand with its plaque), the Keep
// (the great tower from the game's archive: its stone, slits, windows and door, its turrets, parapet and pilasters; inside, the dungeon's
// walls and cobbles, the cross wall's three arches, torches, columns, the brazier, barrels, bones, a cell), and a butterfly house.
// Each room's walls are built as the bodega's (their faces painted by the game's painters, cut to their foot when they stand between you
// and the camera while you're in), its roof hidden while you're in, its things each box painted, its lamps point lights, its things and
// walls solid. The water (the shrine's koi pond, the tank), the butterflies in flight and the bar's musicians: their own files ----
{ const K=BOD.STOREK, {X,Y,Z,gbox,faceTex,bq,C,place,facade}=BOD, {CATALOG,PROPS,LAMPS,PRESETS,LBLD,T,sh,hash}=K, {grain,speck,grassCol}=BOD.g;
  const B_=id=>LBLD.find(b=>b.id===id);
  const PLATE={x0:334,y0:-100,x1:456,y1:-70};   // (the storeroom's floor, bodega tiles)
  const flat=(x0,y0,x1,y1,z,col,kind)=>bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y1-(j+.5)/24))),kind);
  const put=(kind,x,y,rot=0)=>{ const f=CATALOG[kind]; if(!f){ console.warn('store: no',kind); return null; } const p=f(+x.toFixed(3),+y.toFixed(3)); if(!p)return null; p.kind=kind; place(p,rot); return p; };
  const sol=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
  const roofCol=(x,y)=>{ const n=grain(x,y,61,1.4); return speck(n<.35?[50,50,52]:n>.7?[66,64,62]:[58,57,57],x,y,63); };
  const planes={}, cuts=[];
  // A ROOM: B its building (tiles, h its walls' height); look: floor(x, y) its floor's colour, in(q, nx, ny, X, Y, z, f) its walls' inside,
  // out(nx, ny, X, Y, z, f, cap) their outside (the row's brick unless its own), roof; door {w: 'f' 'b' 'w' 'e', a: along, wd, h}; set(B, l0)
  // places its things (the game's catalog); o.xw: inner walls [id, ax, at, a0, a1, inS, holes, inner]; o.open: no walls of its own (a garden)
  const room=(id,name,B,look,door,set,o={})=>{ const n0=PROPS.length, l0=LAMPS.length; set(B,l0); const props=PROPS.slice(n0), lam=LAMPS.slice(l0);
    // (a room whose walls and roof are pieces of its own, the cottage's: each wall's boxes their own kind, cut as a built wall is; the roof's hidden while you're in: o.pieceWalls)
    for(const p of props){ BATCH.tag=OBJ('store:'+id,p.name||p.kind); const pw=o.pieceWalls&&o.pieceWalls[p.kind], kind=pw?'W'+id+':'+pw[0]:o.pieceWalls&&/roof/.test(p.kind||'')?'R'+id:'L';
      if(pw&&!planes[kind]){ planes[kind]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); cuts.push({kind,nx:pw[1],nz:pw[2],id}); }
      for(const b of p.boxes)gbox(b,kind); } BATCH.tag=null;   // (each thing tagged: the world editor)
    if(look.floor)flat(B.x0,B.y0,B.x1,B.y1,o.z??.15,look.floor,'L');
    if(look.in){ const H=B.h, walls=[['f','x',B.y1,B.x0,B.x1,-1],['b','x',B.y0,B.x0,B.x1,1],['w','y',B.x0,B.y0-T,B.y1+T,1],['e','y',B.x1,B.y0-T,B.y1+T,-1]].concat(o.xw||[]);
      for(const [wid,ax,at,a0,a1,inS,holes0,inner] of walls){ const holes=(holes0||[]).concat(door&&door.w===wid?[{a0:door.a-door.wd/2,a1:door.a+door.wd/2,z0:0,z1:door.h}]:[]), kind='W'+id+':'+wid, pl=planes[kind]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
        const paint=(s,u,z)=>{ const nx=ax==='y'?s:0, ny=ax==='x'?s:0, Xw=ax==='y'?at+s*.1:u, Yw=ax==='x'?at+s*.1:u; return (inner||s===inS)?look.in(B,nx,ny,Xw,Yw,z,1):(look.out||facade)(nx,ny,Xw,Yw,z,1,H); };
        const pt=(a,z,off)=>ax==='x'?[X(a),Y(z),Z(at+off)]:[X(at+off),Y(z),Z(a)];
        const as=new Set([a0,a1]), zs=new Set([0,H]); for(const h of holes){ as.add(Math.max(a0,h.a0)); as.add(Math.min(a1,h.a1)); zs.add(h.z0); zs.add(h.z1); }
        const A=[...as].sort((p,q)=>p-q), Zs=[...zs].sort((p,q)=>p-q);
        for(const s of [-1,1])for(let i=0;i+1<A.length;i++)for(let j=0;j+1<Zs.length;j++){ const u0=A[i], u1=A[i+1], z0=Zs[j], z1=Zs[j+1]; if(holes.some(h=>(u0+u1)/2>h.a0&&(u0+u1)/2<h.a1&&(z0+z1)/2>h.z0&&(z0+z1)/2<h.z1))continue;
          bq(pt(u0,z0,s*.1),pt(u1,z0,s*.1),pt(u1,z1,s*.1),pt(u0,z1,s*.1),faceTex((u1-u0)*24,z1-z0,(ii,jj)=>C(paint(s,u0+(ii+.5)/24,z1-jj-.5))),kind); }
        const fr=(P,len,hg,c)=>bq(...P,faceTex(Math.max(1,len*24),Math.max(1,hg),()=>c),kind), cope=look.cope||BOD.g.COPE, FR=BOD.FRAME;
        fr([pt(a0,H,-.1),pt(a1,H,-.1),pt(a1,H,.1),pt(a0,H,.1)],a1-a0,5,cope);
        for(const h of holes){ for(const a of [h.a0,h.a1])fr([pt(a,h.z0,-.1),pt(a,h.z0,.1),pt(a,h.z1,.1),pt(a,h.z1,-.1)],.2,h.z1-h.z0,FR); fr([pt(h.a0,h.z1,-.1),pt(h.a1,h.z1,-.1),pt(h.a1,h.z1,.1),pt(h.a0,h.z1,.1)],h.a1-h.a0,5,FR); }
        // where you can't walk: the wall, but its ways through
        let a=a0; const ds=holes.filter(h=>h.z0===0).sort((p,q)=>p.a0-q.a0), seg=(p,q)=>{ if(q-p<.01)return; if(ax==='x')sol(p,at-.1,q,at+.1,H); else sol(at-.1,p,at+.1,q,H); }; for(const d of ds){ seg(a,d.a0); a=d.a1; } seg(a,a1);
        cuts.push({kind,nx:ax==='y'?inS:0,nz:ax==='x'?inS:0,id}); }
      flat(B.x0-.1,B.y0-.1,B.x1+.1,B.y1+.1,H,look.roof||roofCol,'R'+id); }
    // its things' solids (the bodega's rule: what stands on the floor, low and tall enough; a thing with its own say, its own; a wall, box by box)
    for(const p of props){ if(p.high||p.walk)continue;
      if(p.solids){ for(const s of p.solids)sol(s.x0,s.y0,s.x1,s.y1,60); continue; }
      const bs=p.boxes.filter(b=>!b.nb&&b.z0<30&&b.z1-b.z0>3); if(!bs.length)continue;
      if(/wall|parapet/.test(p.kind||p.name||'')){ for(const b of bs)sol(b.x0,b.y0,b.x1,b.y1,b.z1); continue; }
      const r={x0:Math.min(...bs.map(b=>b.x0)),y0:Math.min(...bs.map(b=>b.y0)),x1:Math.max(...bs.map(b=>b.x1)),y1:Math.max(...bs.map(b=>b.y1))}; sol(r.x0,r.y0,r.x1,r.y1,Math.max(...bs.map(b=>b.z1))); }
    // its lights: the game's lamps as its things made them, their shadows drawn once
    for(const l of lam){ if(l.off||!(l.r>0))continue; const cm=Math.max(...l.c); if(!(cm>0))continue; const L=new THREE.PointLight(new THREE.Color(l.c[0]/cm,l.c[1]/cm,l.c[2]/cm),7*cm*Math.min(1.2,l.r/5),l.r*TILE*1.25,1.6);
      L.position.set(X(l.x),Y(l.z),Z(l.y)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L);
      if(l.r>=3||l.neon){ L.castShadow=true; L.shadow.mapSize.set(256,256); L.shadow.camera.near=.05; L.shadow.camera.far=l.r*TILE*1.3; L.shadow.bias=-.004; L.shadow.normalBias=.06; L.shadow.autoUpdate=false; L.shadow.needsUpdate=true; } }
    const dx=door?(door.w==='f'||door.w==='b'?door.a:door.w==='w'?B.x0-1.2:B.x1+1.2):(B.x0+B.x1)/2, dy=door?(door.w==='f'?B.y1+1.2:door.w==='b'?B.y0-1.2:door.a):B.y1+1.5;
    const R={id,name,B,x0:X(B.x0),x1:X(B.x1),z0:Z(B.y0),z1:Z(B.y1),y0:-1,y1:Y(B.h),walls:!!look.in||!!o.pieceWalls,at:{x:X(dx),z:Z(dy)}}; R.inside=(x,z)=>x>R.x0&&x<R.x1&&z>R.z0&&z<R.z1;
    STORE.rooms.push(R); STORE.places.push([name,R.at.x,R.at.z,'up']); return R; };

  // THE DINER: Preset Diner 1 from its room's corner (its west wall at x 0, the bar's back wall at y 0), the room's door in its front
  { const B=B_('ldiner'); room('diner','THE DINER',B,{floor:K.diner.dinerFloorCol,in:K.diner.dinerWall},{w:'f',a:B.x0+9.5,wd:1.56,h:94},B=>{ PRESETS['Preset Diner 1'].forEach(([k,dx,dy,r])=>put(k,B.x0+dx,B.y0+dy,r)); }); }

  // THE BAR, as 26-zzz-bar sets it out: the bar down the left wall, the back bar and soffit, five stools, the fridge, the stage in the back
  // right corner under LIVE with its cloth, the grand (turned to the room) and the drum kit on it, the sofa, the armchairs and the tables
  // along the right wall, posters, the TV, two fans, a palm by the door, the wall lights, the spot over the stage; then AT NIGHT
  // (26-zzzzzzzzzzzzzzzz-bar-night): every light off but the tables' candles and the exit sign, faint; three candles on the counter, the
  // console TV, the smoker's ember. Where the musicians go: STORE.bar (the stage, the piano's keys, the drums, the singer, the guitarist)
  { const B=B_('lbodega2'); room('bar','THE BAR',B,{floor:K.bar.barFloorCol,in:K.bar.barWall},{w:'f',a:(B.x0+B.x1)/2,wd:1.56,h:94},(B,l0)=>{ const L=B.x0+T, R=B.x1-T, Kb=B.y0+T, F=B.y1-T, m=(B.x0+B.x1)/2, yE=F-1.35, along=x=>yE-(x-1.84);
      put('back bar',L+.42,along(5.2),3); put('bar soffit',L+1.5,along(4.5),3); put('neon sign: BAR',L+.08,Kb+2.3,0);
      put('bar round end',L+2.56,yE,3); put('bar counter: ashtray',L+2.66,along(3.3),3); put('bar counter: bottle',L+2.66,along(5.1),3); put('bar counter: glass',L+2.66,along(6.9),3); put('bar corner',L+1.6,along(8.26),3);
      const stools=[2.7,3.85,5,6.15,7.3].map(x=>{ put('bar stool',L+3.62,along(x)); return {x:L+3.62,y:along(x)}; });
      put('bar fridge',L+.4,Kb+1.0); put('potted plant',L+.5,Kb+2.7);
      const SX=R-2.5, SY=Kb+1.4; put('wide stage cloth',SX,Kb+.07,0); put('stage',SX,SY); put('neon sign: LIVE',SX+1.0,Kb+.16,1);
      const PX=SX-1.4, PY=Kb+2.686; put('grand piano on a stage',PX,PY,2); put('drum kit on a stage',SX+.35,Kb+1.25,0);
      put('red leather sofa',R-.46,Kb+4.6,2); put('red rug',R-1.7,Kb+4.6,1); put('bar table',R-1.55,Kb+4.6); put('red leather armchair',R-2.6,Kb+3.85); put('red leather armchair',R-2.6,Kb+5.35);
      put('bar table',R-1.5,Kb+8.0); put('red leather armchair',R-.55,Kb+8.0,2); put('red leather armchair',R-2.45,Kb+8.0);
      put('bar table',R-1.5,F-1.5); put('red leather armchair',R-.55,F-1.5,2); put('red leather armchair',R-2.45,F-1.5);
      put('poster: moon shrine',R-.02,Kb+3.2,2); put('poster: ghost sale',R-.02,Kb+6.5,2); put('poster: koi night',R-.02,Kb+11.3,2); put('poster: night painting',L+.02,F-3.6,0);
      put('TV on a bracket',R-.06,F-3.0,2); put('black cupboard',R-.31,F-3.0,2);
      put('exit sign, lit',m,F-.05,3); put('red rug',m,F-1.1,0); put('potted palm',L+.8,F-.75);
      put('ceiling fan',m,Kb+4.2); put('ceiling fan',m,F-4.2);
      for(const [i,y] of [[0,Kb+1.9],[1,Kb+5.0],[2,Kb+8.0],[3,F-2.0]]){ const x=i<3?R:L, n=i<3?[-1,0]:[1,0]; K.bar.theatreSconce(x,y,n); LAMPS.push({x:x+n[0]*.35,y,z:68,r:3.2,c:[1,.62,.34],room:true,own:true,day:true}); }
      LAMPS.push({x:SX,y:SY,z:108,r:5.5,c:[1.3,1.05,.66],room:true,own:true,day:true});
      for(const l of LAMPS.slice(l0)){ const k=l.prop&&(l.prop.kind||l.prop.name)||''; if(k==='bar table')continue; if(k==='exit sign, lit'){ l.c=l.c.map(v=>v*.45); continue; } l.off=1; }
      for(const x of [2.5,4.3,6.1])put('candle on the bar',L+2.76,along(x)); put('console TV',L+6.3,Kb+7.4);
      LAMPS.push({own:1,room:1,day:true,x:stools[1].x,y:stools[1].y,z:38,r:1.4,c:[.9,.36,.1]});
      STORE.bar={B,stage:{x:SX,y:SY,z:14},piano:{x:PX,y:PY,keys:PY-1.736},drums:{x:SX+.35,y:Kb+1.25},gtr:{x:SX-.35,y:Kb+2.35},singer:{x:SX+.8,y:Kb+2.4},stools}; }); }

  // THE MOON SHRINE: Preset Moon Shrine 1 from its back corner, on grass (the pond's kerb here; its water: water3d's second body)
  { const O=[69,-45.9]; STORE.shrineO=O;   /* (in Central Park's back-west lawn, owner 17 Oct 2026: XS 68.7-75.3, -42.8 to -25.2) */ room('shrine','THE MOON SHRINE',{x0:O[0],y0:O[1],x1:O[0]+6,y1:O[1]+16,h:0},{floor:grassCol},null,()=>{ PRESETS['Preset Moon Shrine 1'].forEach(([k,dx,dy,r])=>put(k,O[0]+dx,O[1]+dy,r)); },{z:.05});
    STORE.pond={x0:O[0]+.5,y0:O[1]+12.6,x1:O[0]+5.5,y1:O[1]+15.6,z:4}; }

  // THE HERB COTTAGE: every piece where the page put it, from the room's corner (its own floor, walls, roof and door step among them)
  { const O=[376,-89]; room('cottage','THE HERB COTTAGE',{x0:O[0],y0:O[1],x1:O[0]+9,y1:O[1]+12,h:96},{floor:grassCol},null,()=>{ PRESETS['Preset Herb Cottage 1'].forEach(([k,dx,dy,r])=>put(k,O[0]+dx,O[1]+dy,r)); },
      {z:.05,pieceWalls:{'herb cottage wall, west':['w',1,0],'herb cottage wall, east':['e',-1,0],'herb cottage wall, north':['b',0,1],'herb cottage wall, south':['f',0,-1]}}); }   // (its own walls cut to their foot between you and the camera while you're in; its roof hidden then)

  // THE OCTOPUS TANK'S ROOM: dark blue-grey plaster, a polished concrete floor, no light but the tank's; the tank in the middle, its glow in the
  // room from the lights along the foot of its glass (its water: water3d's third body)
  { const B={id:'locto',x0:404,y0:-84,x1:419,y1:-77,h:130}, O=K.octo; room('octo','THE OCTOPUS TANK',B,{floor:O.octoFloorCol,in:O.octoWall},{w:'f',a:(B.x0+B.x1)/2,wd:1.56,h:94},B=>{ const {LX,LY,Z0,ZT}=O.OCTK, x=B.x0+5.5-LX/2, y=B.y1-2.6-LY/2, p=O.octoTank(x,y); place(p,0);
      for(const [lx,ly,i] of [[x+LX/2,y-.35,0],[x+LX/2,y+LY+.35,1],[x-.35,y+LY/2,2],[x+LX+.35,y+LY/2,3]])LAMPS.push({own:1,room:1,day:true,x:lx,y:ly,z:Z0+4,r:i<2?4.2:3,c:[.5,.72,.95]});
      STORE.tank={x0:x+.035,y0:y+.035,x1:x+LX-.035,y1:y+LY-.035,z:ZT-4,bed:Z0+1}; }); }

  // THE KEEP: the great tower from the archive, as 26-zzzzzzzzz-keep set it out: its walls of dressed stone (keepOutWall), its door in the
  // front, its corner turrets, parapet, pilasters and plinth, the gravel to its door, the well; inside, the dungeon's walls (keepInWall) and
  // cobbles, the cross wall across its middle with its three arches, and the dungeon's things where the walls paint for them
  { const B=B_('lcastle'), KK=K.keep, KC={door:430.75,arches:[428.1,430.75,433.4]}, my=(B.y0+B.y1)/2, lead=(x,y)=>{ const n=grain(x,y,67,1.2); return n<.4?[74,76,80]:n>.7?[90,92,96]:[82,84,88]; };
    room('keep','THE KEEP',B,{floor:KK.keepFloorCol,in:KK.keepInWall,out:(nx,ny,Xx,Yy,z,f,cap)=>KK.keepOutWall(B,nx,ny,Xx,Yy,z,f,cap),cope:[184,174,150],roof:lead},{w:'f',a:KC.door,wd:1.4,h:96},B=>{ const M=KK.KMK;
      M.turret(B.x0-T,B.y0-T,-1,-1); M.turret(B.x1+T,B.y0-T,1,-1); M.turret(B.x0-T,B.y1+T,-1,1); M.turret(B.x1+T,B.y1+T,1,1);
      for(const s of ['f','b','l','r'])M.parapet(B,s);
      M.keepFace(B,'f',[KC.door-1,KC.door+1]); M.keepFace(B,'b'); M.keepFace(B,'l'); M.keepFace(B,'r');
      M.gravel(KC.door-.75,B.y1+T+.3,KC.door+.75,B.y1+3.2); M.well(B.x0-1.2,B.y1+1.4);
      const R=KK.KEEPR, x0=R.x0, y0=R.y0, x1=R.x1, y1=R.y1, at=(w,u,d)=>w==='b'?[x0+u,y0+d]:w==='f'?[x0+u,y1-d]:w==='l'?[x0+d,y0+u]:[x1-d,y0+u];
      for(const t of R.torches){ const [x,y]=at(t.w,t.u,.16); CATALOG['wall torch'](x,y,t.w); CATALOG['dust in the air'](x+(t.w==='l'?.5:t.w==='r'?-.5:0),y+(t.w==='b'?.5:t.w==='f'?-.5:0)); }
      for(const [x,y] of [[2.3,2.2],[7,2.2],[2.3,6.6],[7,6.6]])CATALOG['stone column'](x0+x,y0+y);
      CATALOG['brazier'](x0+4.65,y0+1.7); CATALOG['sarcophagus'](x0+6.3,y0+.9); CATALOG['two candles'](x0+7.1,y0+.5);
      for(const [x,y] of [[.45,.45],[1.08,.5],[.7,1.1]])CATALOG['oak barrel'](x0+x,y0+y); for(const [x,y] of [[.45,.45],[1.08,.5]])CATALOG['oak barrel'](x0+x,y1-y);
      for(const [x,y] of [[2,.5],[2.75,.5],[2.35,1.2]])CATALOG['crate'](x0+x,y0+y);
      CATALOG['iron chest'](x1-1.2,y1-.6);
      for(const [x,y] of [[1.5,3.6],[5.6,8.2]])CATALOG['straw'](x0+x,y0+y); CATALOG['straw'](x1-.9,y0+2);
      for(const [x,y] of [[3.3,.5],[8.8,3.4],[6.9,7.9],[3.6,6]])CATALOG['skull'](x0+x,y0+y);
      CATALOG['bone pile'](x0+.6,y0+3); CATALOG['bone pile'](x1-1.6,y1-2.2);
      for(const [x,y] of [[3.9,3.4],[6,5.6],[8.4,1.2],[2.2,7.8]])CATALOG['bones'](x0+x,y0+y);
      M.bars(x1-1.7,y0,x1-1.7,R.my-T);
      CATALOG['mouse run'](x0+.7,y0+.14,x0+3.9,y0+.14); CATALOG['mouse run'](x0+.14,y0+.5,x0+.14,y0+3.6); CATALOG['mouse run'](x1-.14,y0+4.9,x1-.14,y0+8.2); CATALOG['mouse run'](x0+6.9,y1-.14,x0+8.6,y1-.14);
      const o={own:1,room:1,day:true}; LAMPS.push({x:R.cx,y:R.cy,z:70,r:9,c:[.24,.28,.38],...o}); LAMPS.push({x:x0+R.slit.u,y:y0+.4,z:100,r:3,c:[.3,.36,.52],...o}); },
      {xw:[['x','x',my,B.x0+T,B.x1-T,1,KC.arches.map(a=>({a0:a-.8,a1:a+.8,z0:0,z1:110})),true]]}); }

  // THE BUTTERFLY HOUSE (the living rooms' atrium, 23-w-studio-mood: a mesh cube on a walnut stand, moss, leaves and a flower of nectar) on
  // its own plot; its two butterflies and the flight of the others: butterflies.js
  { const O=[444,-84]; STORE.houseAt=[O[0]+4,O[1]+3.5]; room('butterflies','THE BUTTERFLIES',{x0:O[0],y0:O[1],x1:O[0]+8,y1:O[1]+7,h:0},{floor:grassCol},null,()=>{ const p=put('butterfly house',O[0]+4,O[1]+3.5); if(p)p.bf=[12,21]; STORE.bfHouse=p; },{z:.05}); }

  // THE WATER'S BEDS: the koi pond's, half a metre down, dark mud and its banks; the tank's is its stand's top. The water itself, below, once built
  { const P=STORE.pond, bed=(x,y)=>{ const n=grain(x,y,911,.8); return n<.4?[38,44,30]:n>.7?[58,64,44]:[46,52,36]; }, BK=[52,46,34], zb=-14;
    flat(P.x0,P.y0,P.x1,P.y1,zb,bed,'L');
    for(const [a,b,c,d] of [[P.x0,P.y0,P.x1,P.y0],[P.x1,P.y0,P.x1,P.y1],[P.x1,P.y1,P.x0,P.y1],[P.x0,P.y1,P.x0,P.y0]])bq([X(a),Y(zb),Z(b)],[X(c),Y(zb),Z(d)],[X(c),Y(P.z+1),Z(d)],[X(a),Y(P.z+1),Z(b)],faceTex(Math.hypot(c-a,d-b)*24,P.z+1-zb,(i,j)=>C(sh(BK,.8+.2*hash(i,j,913)))),'L'); }
  // the storeroom's floor under it all, dark concrete (four sheets, each within the atlas's width)
  const plateCol=(x,y)=>{ const n=grain(x,y,901,1.6); return speck(n<.34?[44,45,49]:n>.7?[58,58,62]:[51,52,56],x,y,903); };
  for(let x=PLATE.x0;x<PLATE.x1;x+=30.5)flat(x,PLATE.y0,Math.min(PLATE.x1,x+30.5),PLATE.y1,0,plateCol,'G');
  // built: each wall's faces their own mesh (cut to its foot when it stands between you and the camera, while you're in its room), each roof
  // its own (hidden while you're in), the rest one; the things throw their lamps' shadows
  BATCH.cast=true;
  BATCH.build((k,map,emap)=>{ const pl=planes[k], cp=pl?{clippingPlanes:[pl]}:{};
    if(k==='B')return new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5});
    return new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{}),...cp}); });
  BATCH.cast=false; const M=BATCH.meshes||{}; BATCH.meshes={}; if(M.G)M.G.castShadow=false;
  for(const c of cuts){ const me=M[c.kind], R=STORE.rooms.find(r=>r.id===c.id); if(me)cutWalls.push({pl:planes[c.kind],nx:c.nx,nz:c.nz,foot:Y(8),me,when:()=>R.inside(pos.x,pos.z)}); }
  for(const R of STORE.rooms){ const me=M['R'+R.id]; if(me)STORE.roofs.push({me,R}); }
  STORE.bound={x0:X(PLATE.x0),x1:X(PLATE.x1),z0:Z(PLATE.y0),z1:Z(PLATE.y1)};
  STORE.inStore=(x,z)=>x>STORE.bound.x0&&x<STORE.bound.x1&&z>STORE.bound.z0&&z<STORE.bound.z1;
  STORE.meshes=M; STORE.stats=BATCH.stats; STORE.XYZ={X,Y,Z};   // (a test's reach)
  // THE WATER (the hard rule: real liquids only): the koi pond and the tank, each a body of its own (water3d.js), stepped and seen through while
  // you're near; the tank's glass round its water, four panes you see through (as the bodega's windows)
  { const P=STORE.pond; WATER.body({name:'pond',X0:X(P.x0),X1:X(P.x1),Z0:Z(P.y0),Z1:Z(P.y1),lvl:Y(P.z),GX:120,GY:72,dep:()=>0.6});
    const Tk=STORE.tank; WATER.body({name:'tank',X0:X(Tk.x0),X1:X(Tk.x1),Z0:Z(Tk.y0),Z1:Z(Tk.y1),lvl:Y(Tk.z),GX:110,GY:40,dep:()=>(Tk.z-Tk.bed)/50*1.8});
    const gm=new THREE.MeshLambertMaterial({color:new THREE.Color(.5,.62,.7),transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}), gh=Y(Tk.z+4)-Y(Tk.bed), gy=(Y(Tk.z+4)+Y(Tk.bed))/2;
    for(const [x,z,w,ry] of [[(Tk.x0+Tk.x1)/2,Tk.y0,Tk.x1-Tk.x0,0],[(Tk.x0+Tk.x1)/2,Tk.y1,Tk.x1-Tk.x0,0],[Tk.x0,(Tk.y0+Tk.y1)/2,Tk.y1-Tk.y0,Math.PI/2],[Tk.x1,(Tk.y0+Tk.y1)/2,Tk.y1-Tk.y0,Math.PI/2]]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w*TILE*BLDK,gh),gm); m.position.set(X(x),gy,Z(z)); m.rotation.y=ry; scene.add(m); } } 
  // THE BUTTERFLIES (butterflies.js): in the butterfly house its pair (two of the twenty rarest, the game's picks); over the shrine's garden a
  // flight of six of New York's, blossom to fern to lantern to the statue's halo
  { const O=STORE.shrineO, at=(dx,dy,z)=>[X(O[0]+dx),Y(z),Z(O[1]+dy)], PERCH=[at(.55,5.3,16),at(5.45,5.25,16),at(.45,9.6,16),at(2.2,1.4,16),at(5.2,15.25,10),at(.48,6.55,10),at(5.52,6.4,10),at(1.25,7.3,30),at(4.75,7.3,30),at(3,2.7,62)];
    [0,2,4,6,8,10].forEach((k,i)=>{ const b=BF.add(k,PERCH); b.at=b.to=i%PERCH.length; b.g.position.set(...PERCH[b.at]); });
    const H=STORE.houseAt, hp=(dx,dy,z)=>[X(H[0]+dx),Y(z),Z(H[1]+dy)], HP=[hp(-.16,-.09,38),hp(-.12,.07,41),hp(.18,.09,37),hp(.13,-.1,35),hp(-.06,0,44),hp(.06,0,44),hp(.08,-.11,32),hp(-.24,0,47),hp(.24,0,47),hp(0,-.17,49)];
    [12,21].forEach((k,i)=>{ const b=BF.add(k,HP); b.at=b.to=i*4; b.g.position.set(...HP[b.at]); }); } }
