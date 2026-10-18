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
{ const K=BOD.STOREK, {X,Y,Z,gbox,faceTex,bq,C,place,facade}=BOD, {CATALOG,PROPS,LAMPS,PRESETS,LBLD,T,sh,hash}=K, {grain,speck,lawnCol:grassCol}=BOD.g;   // (every grass the park's lawn)
  const B_=id=>LBLD.find(b=>b.id===id);
  // (moved on the map's layout, LAY: the Diner and the Bar each on its own, the keep and the rooms stacked on the apartments with them, the shrine
  // with the park; the game's tiles here a tenth bigger, so a map tile is 1/BLDK of them)
  const LG=k=>{ const o=LAY.o(k); return [o.x/BLDK,o.y/BLDK]; }, AO=LG('apartments');
  for(const [id,k] of [['ldiner','diner'],['lbodega2','bar'],['lcastle','apartments']]){ const b=B_(id), [dx,dy]=LG(k); if(b&&!b.laid){ b.x0+=dx; b.x1+=dx; b.y0+=dy; b.y1+=dy; b.laid=1; } }
  // (sized on the map's layout, LAY.s: the room's box grown or shrunk about the middle of its front, its things spread with it; lifted, LAY.h, in tiles:
  // built as the stacked rooms are, its floor, solids and ground its own: the map editor's RAISE / LOWER and GROW / SHRINK, mapedit.js)
  for(const [id,k] of [['ldiner','diner'],['lbodega2','bar']]){ const b=B_(id), sc=LAY.s(k); if(b&&!b.sized){ b.sized=1; b.s=sc; if(sc!==1){ const m=(b.x0+b.x1)/2, f=b.y1; b.x0=m+(b.x0-m)*sc; b.x1=m+(b.x1-m)*sc; b.y0=f+(b.y0-f)*sc; } } }
  const laid=(k,fn)=>{ const h=LAY.h(k); return h?lift(h*TILE/ZU/BLDK,fn):fn(); };   // (h map tiles up, in the game's px: Y(z)=z*ZU*BLDK)
  const PLATE={x0:334,y0:-100,x1:456,y1:-70};   // (the storeroom's floor, bodega tiles)
  const flat=(x0,y0,x1,y1,z,col,kind)=>bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y1-(j+.5)/24))),kind);
  const put=(kind,x,y,rot=0)=>{ const f=CATALOG[kind]; if(!f){ console.warn('store: no',kind); return null; } const p=f(+x.toFixed(3),+y.toFixed(3)); if(!p)return null; p.kind=kind; place(p,rot); return p; };
  const sol=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
  const roofCol=(x,y)=>{ const n=grain(x,y,61,1.4); return speck(n<.35?[50,50,52]:n>.7?[66,64,62]:[58,57,57],x,y,63); };
  const planes={}, cuts=[];
  // (The rooms once STACKED ON THE APARTMENTS' roof, the herb cottage, the octopus tank, the keep and the butterfly house, stand on the ground
  // now, each where it makes sense: owner, 17 Oct 2026, "mockup 1". The lift that raised them, and the stacked floors' ground and solids, are gone.)
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
    FLAME.props(props,X,Y,Z,lamps);   // (its candles', torches' and brazier's flames, live: fire.js; each light flickering with its own)
    const dx=door?(door.w==='f'||door.w==='b'?door.a:door.w==='w'?B.x0+1.2:B.x1-1.2):(B.x0+B.x1)/2, dy=door?(door.w==='f'?B.y1-1.2:door.w==='b'?B.y0+1.2:door.a):(B.y0+B.y1)/2;   // (just inside its door, or the middle of one with none; owner 17 Oct 2026 "fix": the Diner's spot stood outside behind a street light, the shrine's behind its wall)
    const R={id,name,B,x0:X(B.x0),x1:X(B.x1),z0:Z(B.y0),z1:Z(B.y1),y0:-1,y1:Y(B.h),walls:!!look.in||!!o.pieceWalls,at:{x:X(dx),z:Z(dy)},dw:door||null}; R.inside=(x,z)=>x>R.x0&&x<R.x1&&z>R.z0&&z<R.z1&&py>R.y0-.3&&py<R.y1;   /* (by your height too: the stacked rooms share their ground) */
    STORE.rooms.push(R); const pl=STORE.places.find(q=>q[0]===name); if(pl){ pl[1]=R.at.x; pl[2]=R.at.z; pl[3]='up'; } else STORE.places.push([name,R.at.x,R.at.z,'up']); return R; };

  // THE DINER: Preset Diner 1 from its room's corner (its west wall at x 0, the bar's back wall at y 0), the room's door in its front
  // (off the map, owner 18 Oct 2026: "i dont want any other buildings or rooms on map": the Diner, the Bar, the Aquarium, the community garden, the
  // keep and the Avenue's shells are built only when brought back, AWAY in map-pre.js; ?bring=diner,bar for a look)
  if(!AWAY.has('diner')){ const B=B_('ldiner'), sc=B.s||1; laid('diner',()=>room('diner','THE DINER',B,{floor:K.diner.dinerFloorCol,in:K.diner.dinerWall},{w:'f',a:B.x0+9.5*sc,wd:1.56,h:94},B=>{ PRESETS['Preset Diner 1'].forEach(([k,dx,dy,r])=>put(k,B.x0+dx*sc,B.y0+dy*sc,r)); })); }

  // THE BAR, as 26-zzz-bar sets it out: the bar down the left wall, the back bar and soffit, five stools, the fridge, the stage in the back
  // right corner under LIVE with its cloth, the grand (turned to the room) and the drum kit on it, the sofa, the armchairs and the tables
  // along the right wall, posters, the TV, two fans, a palm by the door, the wall lights, the spot over the stage; then AT NIGHT
  // (26-zzzzzzzzzzzzzzzz-bar-night): every light off but the tables' candles and the exit sign, faint; three candles on the counter, the
  // console TV, the smoker's ember. Where the musicians go: STORE.bar (the stage, the piano's keys, the drums, the singer, the guitarist)
  if(!AWAY.has('bar')){ const B=B_('lbodega2'); laid('bar',()=>room('bar','THE BAR',B,{floor:K.bar.barFloorCol,in:K.bar.barWall},{w:'f',a:(B.x0+B.x1)/2,wd:1.56,h:94},(B,l0)=>{ const L=B.x0+T, R=B.x1-T, Kb=B.y0+T, F=B.y1-T, m=(B.x0+B.x1)/2, yE=F-1.35, along=x=>yE-(x-1.84);
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
      STORE.bar={B,stage:{x:SX,y:SY,z:14+LAY.h('bar')*TILE/ZU/BLDK},piano:{x:PX,y:PY,keys:PY-1.736},drums:{x:SX+.35,y:Kb+1.25},gtr:{x:SX-.35,y:Kb+2.35},singer:{x:SX+.8,y:Kb+2.4},stools}; })); }

  // THE MOON SHRINE: Preset Moon Shrine 1 from its back corner, on grass (the pond's kerb here; its water: water3d's second body)
  { const O=[69+LAY.o('park').x/BLDK,-45.9+(LAY.o('park').y+NORTHY)/BLDK];   /* (+NORTHY: with the park, 18 Oct 2026) */ STORE.shrineO=O;   /* (in Central Park's back-west lawn, owner 17 Oct 2026: XS 68.7-75.3, -42.8 to -25.2) */ room('shrine','THE MOON SHRINE',{x0:O[0],y0:O[1],x1:O[0]+6,y1:O[1]+16,h:0},{floor:grassCol},null,()=>{ PRESETS['Preset Moon Shrine 1'].forEach(([k,dx,dy,r])=>put(k,O[0]+dx,O[1]+dy,r)); },{z:.05});
    STORE.pond={x0:O[0]+.5,y0:O[1]+12.6,x1:O[0]+5.5,y1:O[1]+15.6,z:4}; }
  // THE SHRINE OPENED (owner, 17 Oct 2026: "steps and gap", when its parapets, solid since the hitboxes, closed it): a gap in the east parapet,
  // its middle piece taken away (toward the park's round), and the terrace climbed by its steps: the plaza, the steps and the terrace are
  // floors you stand on (STORE.shrineGround: the plaza a little up, the steps a slope, the terrace its top), their solids gone, the things on
  // the terrace still solid, its front edge beside the steps a drop you can't climb. Run once the hitboxes are made (build.py, after CLIP.run)
  STORE.shrineFix=()=>{ const bb=o=>{ const lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9]; for(const p of o.parts){ const P=p.me.geometry.attributes.position.array; for(let v=p.v0;v<p.v0+6;v++)for(let a=0;a<3;a++){ lo[a]=Math.min(lo[a],P[v*3+a]); hi[a]=Math.max(hi[a],P[v*3+a]); } } return {o,lo,hi}; };
    const all=OBJS.filter(o=>/^store:shrine/.test(o.id||'')&&o.parts.length).map(bb), one=n=>all.find(b=>b.o.name===n); if(!all.length)return;
    // (a rect cut out of every solid it touches: what's left of each box kept, up to four pieces)
    const cut=(x0,z0,x1,z1)=>{ const sub=(L,get,make)=>{ for(let i=L.length-1;i>=0;i--){ const [a0,c0,a1,c1]=get(L[i]); if(a1<=x0||a0>=x1||c1<=z0||c0>=z1)continue; const f=L[i]; L.splice(i,1);
        if(a0<x0)L.push(make(f,a0,c0,x0,c1)); if(a1>x1)L.push(make(f,x1,c0,a1,c1)); if(c0<z0)L.push(make(f,Math.max(a0,x0),c0,Math.min(a1,x1),z0)); if(c1>z1)L.push(make(f,Math.max(a0,x0),z1,Math.min(a1,x1),c1)); } };
      sub(SOL.up,b=>b,(f,a0,c0,a1,c1)=>[a0,c0,a1,c1]); sub(FIX.up,f=>[f[0],f[1],f[3],f[4]],(f,a0,c0,a1,c1)=>[a0,c0,f[2],a1,c1,f[5]]); };
    const sol=(x0,z0,x1,z1,h)=>{ SOL.up.push([x0,z0,x1,z1]); FIX.up.push([x0,z0,0,x1,z1,h]); };
    // the gap: the east parapet's middle piece, its faces left out (as the world editor hides a thing) and its solid gone
    const east=all.filter(b=>b.o.name==='mossy parapet'&&b.lo[0]>0&&b.hi[2]-b.lo[2]>3).sort((a,b)=>a.lo[2]-b.lo[2]), mid=east[1];
    if(mid){ for(const p of mid.o.parts){ const A=p.me.geometry.attributes.aOp; if(!A)continue; for(let v=p.v0;v<p.v0+6;v++)A.setX(v,0); A.needsUpdate=true; }
      const g0=east[0].hi[2], g1=east[2]?east[2].lo[2]:mid.hi[2]; cut(mid.lo[0]-.3,g0+.01,mid.hi[0]+.3,g1-.01); STORE.shrineGap=[mid.lo[0],g0,mid.hi[0],g1]; }
    // the floors: the plaza, the steps (a slope from the plaza up to the terrace), the terrace; what stands on the terrace stays solid
    const ter=one('stone terrace'), st=one('mossy steps'), pl=one('spiral stone plaza'); if(!ter||!st||!pl)return;
    cut(ter.lo[0],ter.lo[2],ter.hi[0],ter.hi[2]); cut(st.lo[0],st.lo[2],st.hi[0],st.hi[2]);
    { const g=one('moon shrine gate'); if(g){ cut(g.lo[0],g.lo[2],g.hi[0],g.hi[2]); sol(g.lo[0],g.lo[2],g.lo[0]+.45,g.hi[2],g.hi[1]); sol(g.hi[0]-.45,g.lo[2],g.hi[0],g.hi[2],g.hi[1]); } }   // (the gate: its two posts, the way under it open)
    for(const b of all){ if(b===ter||b===st||b===pl||/parapet|pond|walkway|fern|blossom|shrine gate/.test(b.o.name))continue; const cx=(b.lo[0]+b.hi[0])/2, cz=(b.lo[2]+b.hi[2])/2;
      if(cx>ter.lo[0]&&cx<ter.hi[0]&&cz>ter.lo[2]&&cz<ter.hi[2]+.6&&b.hi[1]-b.lo[1]>.4)sol(b.lo[0],b.lo[2],b.hi[0],b.hi[2],b.hi[1]); }   // (the statue, its plinth, the rock, the post, the lantern, the gate's posts)
    const e=.12; sol(ter.lo[0],ter.hi[2]-e,st.lo[0],ter.hi[2]+e,ter.hi[1]); sol(st.hi[0],ter.hi[2]-e,ter.hi[0],ter.hi[2]+e,ter.hi[1]);   // (the terrace's front, a drop beside the steps)
    const T=ter.hi[1], S0=pl.hi[1], in_=(b,x,z)=>x>=b.lo[0]&&x<=b.hi[0]&&z>=b.lo[2]&&z<=b.hi[2];
    STORE.shrineGround=(x,z)=>{ if(in_(ter,x,z))return T; if(in_(st,x,z))return S0+(T-S0)*Math.max(0,Math.min(1,(st.hi[2]-z)/(st.hi[2]-st.lo[2]))); if(in_(pl,x,z))return S0; return null; }; };

  // (faster opening, 17 Oct 2026: the page froze while all of this was painted. These four rooms are built after the game opens, one a
  // moment, then batched on their own; going to one of them first finishes them at once: STORE.ensure)
  const STEPS=[]; for(const [n,k] of [['THE HERB COTTAGE','garden'],['THE AQUARIUM','aquarium'],['THE KEEP','keep'],['THE BUTTERFLIES','garden']])if(!AWAY.has(k))STORE.places.push([n,0,0,'up']);
  // THE HERB COTTAGE: every piece where the page put it, from the room's corner (its own floor, walls, roof and door step among them)
  // THE COMMUNITY GARDEN (owner, 17 Oct 2026, mockup 1): the lot between the apartment house and the bodega, the subway stairs on the sidewalk
  // before it (no door behind them): the herb cottage at its west, the butterfly garden beside it at its east; its fence and gate: dress.js
  const GARDEN=STORE.garden={cottage:[72-15/BLDK,-77-14.6/BLDK],house:[72-4.6/BLDK,-77-9.2/BLDK]};   // (the game's tiles: the cottage 9 x 12 from its corner, the butterfly plot 8 x 7)
  if(!AWAY.has('garden'))STEPS.push(()=>{ const O=GARDEN.cottage, R=room('cottage','THE HERB COTTAGE',{x0:O[0],y0:O[1],x1:O[0]+9,y1:O[1]+12,h:96},{floor:grassCol},null,()=>{ PRESETS['Preset Herb Cottage 1'].forEach(([k,dx,dy,r])=>put(k,O[0]+dx,O[1]+dy,r)); },
      {z:.05,pieceWalls:{'herb cottage wall, west':['w',1,0],'herb cottage wall, east':['e',-1,0],'herb cottage wall, north':['b',0,1],'herb cottage wall, south':['f',0,-1]}});
    R.at={x:-4.6*TILE,z:1.6*TILE}; const pl=STORE.places.find(q=>q[0]===R.name); if(pl){ pl[1]=R.at.x; pl[2]=R.at.z; } });   // (its menu spot the garden's gate on the sidewalk, not the front's middle: the subway stairs' hole is there)   // (its own walls cut to their foot between you and the camera while you're in; its roof hidden then)

  // THE OCTOPUS TANK'S ROOM: dark blue-grey plaster, a polished concrete floor, no light but the tank's; the tank in the middle, its glow in the
  // room from the lights along the foot of its glass (its water: water3d's third body)
  // THE AQUARIUM (owner, 17 Oct 2026, mockup 1): the octopus tank's room a storefront on the street between the Diner and the Bar, its door on
  // the sidewalk (the game's tiles 97.6 to 112.4, 14.8 wide, its front the row's line)
  if(!AWAY.has('aquarium'))STEPS.push(()=>{ const B={id:'locto',x0:97.6,y0:-84,x1:112.4,y1:-77,h:130}, O=K.octo; room('octo','THE AQUARIUM',B,{floor:O.octoFloorCol,in:O.octoWall},{w:'f',a:(B.x0+B.x1)/2,wd:1.56,h:94},B=>{ const {LX,LY,Z0,ZT}=O.OCTK, x=B.x0+5.5-LX/2, y=B.y1-2.6-LY/2, p=O.octoTank(x,y); place(p,0);
      for(const [lx,ly,i] of [[x+LX/2,y-.35,0],[x+LX/2,y+LY+.35,1],[x-.35,y+LY/2,2],[x+LX+.35,y+LY/2,3]])LAMPS.push({own:1,room:1,day:true,x:lx,y:ly,z:Z0+4,r:i<2?4.2:3,c:[.5,.72,.95]});
      STORE.tank={x0:x+.035,y0:y+.035,x1:x+LX-.035,y1:y+LY-.035,z:ZT-4,bed:Z0+1}; }); STORE.tank.dz=0; });

  // THE KEEP: the great tower from the archive, as 26-zzzzzzzzz-keep set it out: its walls of dressed stone (keepOutWall), its door in the
  // front, its corner turrets, parapet, pilasters and plinth, the gravel to its door, the well; inside, the dungeon's walls (keepInWall) and
  // cobbles, the cross wall across its middle with its three arches, and the dungeon's things where the walls paint for them
  // THE KEEP IN THE CASTLE'S BAILEY (owner, 17 Oct 2026, mockup 1: "the keep goes to the castle's bailey across the street, where a keep belongs"):
  // in the bailey's west half, behind the dungeon's stairwell, its door toward the gatehouse (the bailey's front, the smaller y); it goes with the
  // castle on the map's layout. Its box the game's (lcastle, 9.5 x 9, 520 tall), set here in the game's tiles from the bailey's street tiles
  if(!AWAY.has('keep'))STEPS.push(()=>{ const B=B_('lcastle'), [cx,cy]=LG('castle'); Object.assign(B,{x0:51.09+cx,x1:60.59+cx,y0:-22.9+cy,y1:-13.9+cy});   /* (world: x -23 to -12.5, z 59.5 to 69.4, its turrets a tile out; the stairwell east of it at x -10.5) */
    const KK=K.keep, KC={door:B.x0+4.75,arches:[B.x0+2.1,B.x0+4.75,B.x0+7.4]}, my=(B.y0+B.y1)/2, lead=(x,y)=>{ const n=grain(x,y,67,1.2); return n<.4?[74,76,80]:n>.7?[90,92,96]:[82,84,88]; };
    room('keep','THE KEEP',B,{floor:KK.keepFloorCol,in:KK.keepInWall,out:(nx,ny,Xx,Yy,z,f,cap)=>KK.keepOutWall(B,nx,ny,Xx,Yy,z,f,cap),cope:[184,174,150],roof:lead},{w:'b',a:KC.door,wd:1.4,h:96},B=>{ const M=KK.KMK;
      M.turret(B.x0-T,B.y0-T,-1,-1); M.turret(B.x1+T,B.y0-T,1,-1); M.turret(B.x0-T,B.y1+T,-1,1); M.turret(B.x1+T,B.y1+T,1,1);
      for(const s of ['f','b','l','r'])M.parapet(B,s);
      M.keepFace(B,'b',[KC.door-1,KC.door+1]); M.keepFace(B,'f'); M.keepFace(B,'l'); M.keepFace(B,'r');
      M.gravel(KC.door-.75,B.y0-3.2,KC.door+.75,B.y0-T-.3);   /* (the gravel from its door toward the gate; the bailey's own well stays: castle.js) */
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
      {xw:[['x','x',my,B.x0+T,B.x1-T,1,KC.arches.map(a=>({a0:a-.8,a1:a+.8,z0:0,z1:110})),true]]}); });

  // THE BUTTERFLY HOUSE (the living rooms' atrium, 23-w-studio-mood: a mesh cube on a walnut stand, moss, leaves and a flower of nectar) on
  // its own plot; its two butterflies and the flight of the others: butterflies.js
  if(!AWAY.has('garden'))STEPS.push(()=>{ const O=GARDEN.house; STORE.houseAt=[O[0]+4,O[1]+3.5]; STORE.houseZ=0; room('butterflies','THE BUTTERFLIES',{x0:O[0],y0:O[1],x1:O[0]+8,y1:O[1]+7,h:0},{floor:grassCol},null,()=>{ const p=put('butterfly house',O[0]+4,O[1]+3.5); if(p)p.bf=[12,21]; STORE.bfHouse=p; },{z:.05}); });   // (the community garden's east plot, beside the cottage)

  // THE AVENUE'S ROW (owner, 17 Oct 2026: "have the street on right side go up and fill the right side of that street with places as well. pull
  // from old game and map and logically think what we need there"; his pick, mockup 1): the old game's buildings along the Avenue's east side,
  // their doors on its sidewalk, south to north: MARKET · LOUNGE on the corner (the flea market itself, the lounge upstairs), the MUSEUM OF EARTH
  // facing the park's east gate, LUCKY 7 and THE YELLOW AWNING (shops with rooms upstairs), an alley, then past the park's end the MOVIE
  // THEATRE with the ARCADE, the PLAYHOUSE, and 221B BAKER STREET closing the north end by Cherry Station's stairs (to come). FOR NOW EACH IS ITS
  // SHELL: the row's brick with its windows and door, a plain room inside under one lamp, its roof; the old game's own insides come building by
  // building (each was built to face the main street, so each needs a quarter turn as it's set out: not yet written). Built after the game
  // opens with the rooms above, batched with them; no characters on the Avenue yet
  const AVR=[['market','MARKET · LOUNGE',17.6,33.6,16,230],['museum','MUSEUM OF EARTH',33.6,59.6,26,210],['lucky','LUCKY 7',59.6,70.6,11,200],['yellow','THE YELLOW AWNING',70.6,81.6,11,200],
    ['theatre','MOVIE THEATRE · ARCADE',87.6,103.6,16,260],['playhouse','PLAYHOUSE',103.6,115.6,12,220],['baker','221B BAKER STREET',115.6,126,12,230]];   // (id, name, its run along the Avenue in the map's tiles from the street's building line, its depth, its height in art px)
  { const AX=72+(AVE.x1-72)/BLDK, plaster=(B,nx,ny,Xw,Yw,z,f)=>sh(z<8?[118,112,102]:[168,160,146],f*(z<8?.9:1)), conc=(x,y)=>{ const n=grain(x,y,71,1.3); return n<.4?[92,90,86]:n>.7?[104,102,98]:[98,96,92]; };   // (AX: the east sidewalk's edge, the street's tile 166.5, in the game's tiles)
    if(!AWAY.has('avenue'))for(const [id,name,z0,z1,d,h] of AVR){ STORE.places.push([name,0,0,'up']);
      STEPS.push(()=>{ const B={id:'lav_'+id,x0:AX,y0:-77+z0/BLDK+.1,x1:AX+d,y1:-77+z1/BLDK-.1,h}; room('av_'+id,name,B,{floor:conc,in:plaster},{w:'w',a:(B.y0+B.y1)/2,wd:1.56,h:94},(B,l0)=>{ LAMPS.push({own:1,room:1,day:true,x:(B.x0+B.x1)/2,y:(B.y0+B.y1)/2,z:Math.min(h-20,120),r:Math.max(6,.75*Math.max(d,(z1-z0)/BLDK)),c:[1,.9,.75]}); }); }); } }   // (its one lamp's reach by the room's size: the museum is 26 tiles across)

  // LIGHTNING FAST VCR REPAIR (owner, 18 Oct 2026, his photo: "add this as a new building mockup for game", then "off map"; the mockup:
  // https://claude.ai/artifact/RqccsVVLmsmXFPhs4P9NDx): a one-storey block on its own asphalt lot far east of the map, where the storeroom stood,
  // out of sight of it (the view bounded to the store while you're there); the menu's STORED row takes you in. Its front speckled tan stucco
  // between brown pilasters (boxes, standing out of it), the band under the coping, two white-framed windows, the light box of a sign (its words
  // painted once from a canvas), the door with its little 3110; its sides and back grey concrete block, a gooseneck lamp and a camera by the
  // front corner, the meter; a chain-link fence and gate across the side yard, barbed wire on top (its mesh cut out: the batch's alphaTest);
  // the bed along the front, its curb, mulch and five bare shrubs. The sign a lit box (glowing, the batch's own); inside the repair shop (below). Some
  // 3,000 triangles, three lamps (LITE's: the room's, the bench's, the gooseneck's), no new program; built after the game opens with the rooms above
  STORE.places.push(['VCR REPAIR',0,0,'up']);
  STEPS.push(()=>{ const B={id:'lvcr',x0:380,y0:-92,x1:394,y1:-82,h:270}, H=B.h, hs=hash, P=[.2,2.5,4.95,7.9,10.05], WIN=[[.45,2.2],[5.2,7.6]], WZ=[42,118];
    const sto=(i,j)=>{ const r=hs(i,j,811); return r<.34?[214,200,182]:r<.56?[230,220,206]:r<.72?[186,164,142]:r<.82?[150,124,102]:r<.92?[246,242,234]:[112,94,80]; };
    const blk=(u,z)=>{ const r=Math.floor(z/5), i=Math.floor(u*24+(r&1)*5), c=Math.floor(i/10); if(i%10===9||Math.floor(z)%5===4)return [160,161,161]; const v=196+hs(c,r,812)*14; return [v,v,v-3]; };
    const front=(x,z,f)=>{ const u=x-B.x0;
      if(z>=H-5)return sh([88,82,78],f); if(z>=H-12)return sh([138,104,88],f);
      for(const [a,b] of WIN)if(u>a&&u<b&&z>WZ[0]&&z<WZ[1]){ const fr=u<a+.09||u>b-.09||z<WZ[0]+3||z>WZ[1]-3||Math.abs(u-(a+b)/2)<.04; if(fr)return sh([240,240,236],f);
        return sh((u-a)*24+(WZ[1]-z)*.5>8&&(u-a)*24+(WZ[1]-z)*.5<12?[104,114,124]:[58,65,72],f); }
      if(Math.abs(u-10.85)<.32&&z>104&&z<112)return sh(z>106&&z<110&&hs(Math.floor(x*24),Math.floor(z),813)<.45?[50,50,50]:[233,230,223],f);   // (3110)
      const s=sto(Math.floor(x*24),Math.floor(z)); return sh(z<10?sh(s,.8+.02*z):s,f); };
    const out=(nx,ny,Xw,Yw,z,f,cap)=>ny>0?front(Xw,z,f):sh(z<20?sh(blk(nx?Yw:Xw,z),.82+.009*z):blk(nx?Yw:Xw,z),f);
    // the sign's face: painted once, sampled by the box's front
    const SX0=B.x0+3.1, SX1=B.x0+8.5, SZ0=146, SZ1=246, sw=Math.round((SX1-SX0)*24), shh=SZ1-SZ0, cvs=document.createElement('canvas'); cvs.width=sw; cvs.height=shh;
    const g=cvs.getContext('2d'); g.fillStyle='#eef1f4'; g.fillRect(0,0,sw,shh);
    g.save(); g.translate(sw*.54,shh*.22); g.rotate(-.12); g.transform(1,0,-.22,1,0,0); g.textAlign='center'; g.textBaseline='middle'; g.font='900 25px Impact,"Arial Black",sans-serif';
    g.lineWidth=3; g.strokeStyle='#0d1c55'; g.strokeText('LIGHTNING',0,0); g.fillStyle='#2547b8'; g.fillText('LIGHTNING',0,0); g.strokeText('FAST',18,25); g.fillText('FAST',18,25); g.restore();
    g.save(); g.translate(sw*.3,shh*.78); g.rotate(-.12); g.fillStyle='#111'; g.fillRect(-30,-14,62,24); g.fillStyle='#e6e6e6'; g.fillRect(-25,-10,15,10);
    g.fillStyle='#c8202a'; g.fillRect(-22,4,104,16); g.fillStyle='#fff'; g.font='bold 12px "Arial Black",Arial,sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('VCR REPAIR',30,12); g.restore();
    const SD=g.getImageData(0,0,sw,shh).data, sig=(x,z)=>{ const i=Math.max(0,Math.min(sw-1,Math.floor((x-SX0)*24))), j=Math.max(0,Math.min(shh-1,Math.floor(SZ1-z))), k=(j*sw+i)*4; return [SD[k],SD[k+1],SD[k+2]]; };
    const conc=(x,y)=>{ const n=grain(x,y,814,1.2); return n<.4?[170,168,160]:n>.7?[186,184,176]:[178,176,168]; }, asph=(x,y)=>{ const r=hs(Math.floor(x*24),Math.floor(y*24),815); return r<.03?[118,118,122]:sh([66,67,71],.94+r*.12); };
    const mulchC=(x,y)=>{ const r=hs(Math.floor(x*24),Math.floor(y*24),816); return r<.4?[150,92,52]:r<.7?[118,70,40]:r<.88?[176,118,70]:[84,56,36]; };
    for(const [a,b,c,d] of [[B.x0-8,B.y1,B.x1+10,B.y1+8],[B.x0-8,B.y0-4,B.x1+10,B.y0],[B.x0-8,B.y0,B.x0,B.y1],[B.x1,B.y0,B.x1+10,B.y1]])flat(a,b,c,d,.1,asph,'L');   // (the lot in four round the shop: one piece's middle inside it was an interior's, drawn only near the door: interiors.js)
    flat(B.x0+8,B.y1,B.x1+.5,B.y1+2.2,.6,conc,'L'); flat(B.x1,B.y0,B.x1+2,B.y1,.6,conc,'L');   // (the concrete aprons: before the door, along the side)
    const vinyl=(x,y)=>{ const i=Math.floor(x*2), j=Math.floor(y*2), r=hs(Math.floor(x*24),Math.floor(y*24),820); return sh((i+j)&1?[150,152,150]:[196,196,190],r<.04?.9:1); };   // (the shop's floor: vinyl tiles, half a tile each, scuffed)
    room('vcr','VCR REPAIR',B,{floor:vinyl,in:(B,nx,ny,Xw,Yw,z,f)=>sh(z<8?[118,112,102]:[200,196,186],f*(z<8?.9:1)),out,cope:[88,82,78]},{w:'f',a:B.x0+10.85,wd:1.56,h:94},(B,l0)=>{
      const thing=(name,boxes,o={})=>PROPS.push({kind:name,name,boxes,...o}), bx=(x0,y0,x1,y1,z0,z1,c,more={})=>({x0,y0,x1,y1,z0,z1,c,...more});
      thing('pilasters',P.map(u=>bx(B.x0+u-.22,B.y1,B.x0+u+.22,B.y1+.16,0,H-12,[138,104,88])),{walk:1});
      thing('sign',[bx(SX0-.08,B.y1,SX1+.08,B.y1+.22,SZ0-4,SZ1+4,[198,204,212]),bx(SX0,B.y1+.22,SX1,B.y1+.26,SZ0,SZ1,[238,240,244],{em:1,fs:(nx,ny,X_,Y_,z,s)=>ny>0?sig(X_,SZ0+z):sh([198,204,212],s)})],{high:1});
      thing('window sills',WIN.map(([a,b])=>bx(B.x0+a-.1,B.y1,B.x0+b+.1,B.y1+.22,WZ[0]-4,WZ[0],[208,208,202])),{high:1});
      const ex=B.x1, ez=B.y1-1.4, arm=[112,116,120];   // the gooseneck, the camera, the meter on the east wall by the front corner
      thing('gooseneck lamp',[bx(ex,ez-.06,ex+.12,ez+.06,H-24,H-14,arm),bx(ex,ez-.04,ex+1,ez+.04,H-14,H-11,arm),bx(ex+.92,ez-.04,ex+1,ez+.04,H-24,H-11,arm),bx(ex+.74,ez-.22,ex+1.18,ez+.22,H-32,H-24,[93,98,102])],{high:1});
      LAMPS.push({own:1,x:ex+.96,y:ez,z:H-36,r:15,c:[1,.86,.62]});   // (the gooseneck's light on the side yard: the one lamp outside)
      thing('camera',[bx(ex,ez-1.2,ex+.3,ez-.9,H-80,H-72,[226,226,223])],{high:1});
      thing('meter',[bx(ex,B.y0+4.2,ex+.22,B.y0+4.7,30,46,[63,110,168])],{high:1});
      // the side yard's fence: posts, the top rail, the mesh (a diamond cut out), the gate's middle post, barbed wire
      const fy=B.y0+4.6, fx0=B.x1, fx1=B.x1+9, post=[169,173,177], mesh=(nx,ny,X_,Y_,z)=>{ const a=Math.floor(X_*24)+Math.floor(z), b=Math.floor(X_*24)-Math.floor(z); return (((a%6)+6)%6===0||((b%6)+6)%6===0)?[195,199,203]:null; };
      thing('chain-link fence',[...[fx0+.05,fx0+4,fx1].map(x=>bx(x-.06,fy-.06,x+.06,fy+.06,0,74,post)),bx(fx0,fy-.03,fx1,fy+.03,64,67,post),bx(fx0,fy-.01,fx1,fy+.01,2,64,post,{fs:mesh}),
        ...[70,75,80].map(z=>bx(fx0,fy-.05,fx1,fy-.04,z,z+.6,[120,122,124]))],{solids:[{x0:fx0,y0:fy-.1,x1:fx1,y1:fy+.1}]});
      // the bed along the front: its curb, the mulch, five bare shrubs of upright twigs
      const by0=B.y1+.16, by1=B.y1+2.1, bx0=B.x0, bx1=B.x0+7.4, tw=[90,68,54];
      thing('planter',[bx(bx0,by0,bx1,by1,0,6,[185,183,176],{top:(x,y)=>x>bx0+.15&&x<bx1-.15&&y>by0+.1&&y<by1-.15?mulchC(x,y):[185,183,176]})],{walk:1});
      const tws=[]; for(const [cx,s] of [[.7,.9],[1.9,1.1],[3.4,1.3],[4.9,.8],[6.3,1]])for(let i=0;i<8;i++){ const x=bx0+cx+(hs(i,cx*10,817)-.5)*.9*s, y=by0+.95+(hs(i,cx*10,818)-.5)*.7*s, h=(18+hs(i,cx*10,819)*22)*s; tws.push(bx(x-.025,y-.025,x+.025,y+.025,6,6+h,tw)); }
      thing('bare shrubs',tws,{walk:1});
      // INSIDE (owner, 18 Oct 2026: "yes", to a counter and shelves of VCRs): the counter across the front room with the till, a deck being looked
      // at and a stack of tapes; three steel shelving units along the back wall full of VCRs waiting (black, silver, grey, a slot and a light each,
      // some gaps); the repair bench along the west wall with an old TV showing static, a deck open on its green board, the iron in its stand and
      // a bench lamp, a stool before it; cardboard boxes by the east wall; a poster. Its own solids from its boxes (room's rule); no new program
      const vcr=(x,y,z,c,led)=>bx(x,y,x+.72,y+.6,z,z+11,c,{top:()=>sh(c,1.12),fs:(nx,ny,P,Q,zz,s)=>{ if(ny<=0)return sh(c,s); const u=(P-x)/.72;
        if(zz>4&&zz<6.5&&u>.18&&u<.66)return [18,18,20]; if(led&&zz>6&&zz<8&&u>.8&&u<.86)return led; if(zz<1.5)return sh(c,.7); return c; }});
      const VC=[[34,34,38],[158,160,164],[74,74,80],[40,38,44],[132,128,120]], LED=[[90,220,120],[230,80,60],null];
      const steel=[118,124,130], SL=[4,38,72,106,140,174], sy0=B.y0+.12, sy1=B.y0+1.02;
      for(let k=0;k<3;k++){ const sx0=B.x0+.4+k*4.45, sx1=sx0+4.25, bs=[bx(sx0,sy0,sx0+.08,sy1,0,180,steel),bx(sx1-.08,sy0,sx1,sy1,0,180,steel),bx(sx0,sy0,sx1,sy0+.05,0,180,[96,100,106])];
        for(const z of SL)bs.push(bx(sx0,sy0,sx1,sy1,z-3,z,steel));
        for(let si=0;si<SL.length-1;si++)for(let n=0;n<5;n++){ const r=hs(k*31+si,n,821); if(r<.12)continue; const x=sx0+.18+n*.8+(r-.5)*.06; bs.push(vcr(x,sy1-.68,SL[si],VC[Math.floor(r*97)%VC.length],LED[Math.floor(r*53)%LED.length]));
          if(r>.8&&si<SL.length-2)bs.push(vcr(x+.02,sy1-.66,SL[si]+11,VC[Math.floor(r*41)%VC.length],null)); }   // (now and then one stacked on another)
        thing('shelving of VCRs',bs); }
      // the counter: wood-panelled front, a laminate top; on it the till, a deck, tapes
      const cy0=B.y1-4.6, cy1=B.y1-3.9, cx0=B.x0+1.6, cx1=B.x0+8.6, wood=[112,80,54];
      thing('counter',[bx(cx0,cy0,cx1,cy1,0,40,wood,{top:()=>[200,194,180],fs:(nx,ny,P,Q,z,s)=>sh(z>37?[200,194,180]:(Math.floor((nx?Q:P)*24)%12===0)?[84,58,40]:wood,s)})]);
      thing('till',[bx(cx1-1.2,cy0+.1,cx1-.55,cy1-.1,40,50,[58,58,62]),bx(cx1-1.1,cy0+.2,cx1-.65,cy0+.32,50,57,[40,40,44]),bx(cx1-1.06,cy0+.33,cx1-.69,cy0+.35,51,56,[110,230,140],{em:1})],{high:1});
      thing('deck on the counter',[vcr(cx0+2.4,cy0+.06,40,[150,150,154],[90,220,120])],{high:1});
      const tp=[]; for(let i=0;i<6;i++)tp.push(bx(cx0+.3+(i%2)*.05,cy0+.15,cx0+.75+(i%2)*.05,cy0+.4,40+i*3,43+i*3,[26,26,28],{fs:(nx,ny,P,Q,z,s)=>nx===0&&z>.8&&z<2.2?[236,232,220]:sh([26,26,28],s)})); thing('tapes',tp,{high:1});
      // the repair bench along the west wall, the TV, the open deck, the iron, the lamp; the stool
      const wx0=B.x0+.12, wx1=B.x0+1.2, wy0=B.y0+1.8, wy1=B.y0+7, tvy=wy0+.9;
      thing('repair bench',[bx(wx0,wy0,wx1,wy1,0,36,[92,74,58],{top:()=>[132,108,84]})]);
      thing('old TV',[bx(wx0+.05,tvy-.45,wx0+.9,tvy+.45,36,60,[72,66,60]),bx(wx0+.9,tvy-.34,wx0+.94,tvy+.34,40,57,[140,160,200],{em:1,fs:(nx,ny,P,Q,z)=>{ const r=hs(Math.floor(Q*48),Math.floor(z*2),822); return r<.3?[60,70,96]:r<.7?[140,156,196]:[214,222,236]; }})],{high:1});
      thing('open deck',[bx(wx0+.15,wy0+2,wx0+.85,wy0+2.75,36,40,[150,150,154],{top:(x,y)=>{ const r=hs(Math.floor(x*24),Math.floor(y*24),823); return r<.12?[200,180,90]:r<.2?[40,40,40]:[46,112,64]; }})],{high:1});
      thing('iron and stand',[bx(wx0+.3,wy0+3.3,wx0+.55,wy0+3.55,36,39,[60,60,64]),bx(wx0+.38,wy0+3.38,wx0+.47,wy0+3.47,39,50,[180,60,40])],{high:1});
      thing('bench lamp',[bx(wx0+.1,wy0+4.2,wx0+.3,wy0+4.4,36,38,[50,52,56]),bx(wx0+.17,wy0+4.27,wx0+.23,wy0+4.33,38,62,[50,52,56]),bx(wx0+.15,wy0+4.25,wx0+.75,wy0+4.35,60,62,[50,52,56]),bx(wx0+.55,wy0+4.1,wx0+.85,wy0+4.5,54,60,[66,120,96])],{high:1});
      LAMPS.push({own:1,room:1,day:true,x:wx0+.7,y:wy0+4.3,z:52,r:4,c:[1,.85,.6]});   // (the bench lamp's pool on the work)
      thing('stool',[bx(wx1+.45,wy0+2.1,wx1+.85,wy0+2.5,0,28,[60,60,66],{top:()=>[150,40,36]})]);
      // boxes by the east wall, a poster beside the door
      const cb=[176,136,92], tape=(nx,ny,P,Q,z,s)=>Math.abs(z-6)<1||Math.abs((nx?Q:P)%1-.5)<.04?[206,180,130]:sh(cb,s);
      thing('cardboard boxes',[bx(B.x1-1.3,B.y0+2,B.x1-.15,B.y0+3,0,26,cb,{fs:tape,top:(x,y)=>Math.abs(y-(B.y0+2.5))<.05?[206,180,130]:cb}),bx(B.x1-1.2,B.y0+2.1,B.x1-.3,B.y0+2.9,26,46,sh(cb,.92),{fs:tape})]);
      thing('poster',[bx(B.x1-.13,B.y1-6.2,B.x1-.11,B.y1-5,50,96,[30,60,150],{fs:(nx,ny,P,Q,z)=>z>36?[220,40,50]:z>30?[245,240,230]:[30,60,150]})],{high:1});
      LAMPS.push({own:1,room:1,day:true,x:(B.x0+B.x1)/2,y:(B.y0+B.y1)/2,z:H-40,r:13,c:[1,.92,.8]}); }); });

  // THE WATER'S BEDS: the koi pond's, half a metre down, dark mud and its banks; the tank's is its stand's top. The water itself, below, once built
  { const P=STORE.pond, bed=(x,y)=>{ const n=grain(x,y,911,.8); return n<.4?[38,44,30]:n>.7?[58,64,44]:[46,52,36]; }, BK=[52,46,34], zb=-14;
    flat(P.x0,P.y0,P.x1,P.y1,zb,bed,'L');
    for(const [a,b,c,d] of [[P.x0,P.y0,P.x1,P.y0],[P.x1,P.y0,P.x1,P.y1],[P.x1,P.y1,P.x0,P.y1],[P.x0,P.y1,P.x0,P.y0]])bq([X(a),Y(zb),Z(b)],[X(c),Y(zb),Z(d)],[X(c),Y(P.z+1),Z(d)],[X(a),Y(P.z+1),Z(b)],faceTex(Math.hypot(c-a,d-b)*24,P.z+1-zb,(i,j)=>C(sh(BK,.8+.2*hash(i,j,913)))),'L'); }
  // (the storeroom's own floor, far east, is gone: every room now stands on the map, so it held nothing and cost two million pixels to paint)
  // built: each wall's faces their own mesh (cut to its foot when it stands between you and the camera, while you're in its room), each roof
  // its own (hidden while you're in), the rest one; the things throw their lamps' shadows
  const bake=()=>{ BATCH.cast=true;
  BATCH.build((k,map,emap)=>{ const pl=planes[k], cp=pl?{clippingPlanes:[pl]}:{};
    if(k==='B')return new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5});
    return new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{}),...cp}); });
  BATCH.cast=false; const M=BATCH.meshes||{}; BATCH.meshes={}; if(M.G)M.G.castShadow=false;
  for(const c of cuts.splice(0)){ const me=M[c.kind], R=STORE.rooms.find(r=>r.id===c.id); if(me)cutWalls.push({pl:planes[c.kind],nx:c.nx,nz:c.nz,foot:Y(8),me,when:()=>R.inside(pos.x,pos.z)}); }
  for(const R of STORE.rooms){ const me=M['R'+R.id]; if(me)STORE.roofs.push({me,R}); }
  return M; };
  const M=bake();
  STORE.bound={x0:X(PLATE.x0),x1:X(PLATE.x1),z0:Z(PLATE.y0),z1:Z(PLATE.y1)};
  STORE.inStore=(x,z)=>x>STORE.bound.x0&&x<STORE.bound.x1&&z>STORE.bound.z0&&z<STORE.bound.z1;
  STORE.meshes=M; STORE.stats=BATCH.stats; STORE.XYZ={X,Y,Z};   // (a test's reach)
  // THE WATER (the hard rule: real liquids only): the koi pond and the tank, each a body of its own (water3d.js), stepped and seen through while
  // you're near; the tank's glass round its water, four panes you see through (as the bodega's windows)
  { const P=STORE.pond; WATER.body({name:'pond',X0:X(P.x0),X1:X(P.x1),Z0:Z(P.y0),Z1:Z(P.y1),lvl:Y(P.z),GX:120,GY:72,dep:()=>0.6});
} 
  // THE BUTTERFLIES (butterflies.js): in the butterfly house its pair (two of the twenty rarest, the game's picks); over the shrine's garden a
  // flight of six of New York's, blossom to fern to lantern to the statue's halo
  { const O=STORE.shrineO, at=(dx,dy,z)=>[X(O[0]+dx),Y(z),Z(O[1]+dy)], PERCH=[at(.55,5.3,16),at(5.45,5.25,16),at(.45,9.6,16),at(2.2,1.4,16),at(5.2,15.25,10),at(.48,6.55,10),at(5.52,6.4,10),at(1.25,7.3,30),at(4.75,7.3,30),at(3,2.7,62)];
    [0,2,4,6,8,10].forEach((k,i)=>{ const b=BF.add(k,PERCH); b.at=b.to=i%PERCH.length; b.g.position.set(...PERCH[b.at]); });
 } 
  // THE STACKED ROOMS, BUILT AFTER THE GAME OPENS: one room a moment (its painting kept aside), then batched on their own meshes, their
  // lights given to LITE, their rooms to ROOMS, the tank's water and glass, the butterfly house's pair
  { const pend=[]; let done=false;
    const lit=()=>{ if(!LITE.recs.length)return; const nl=[]; scene.traverse(o=>{ if(o.isPointLight&&!o.userData.pool)nl.push(o); }); for(const L of nl){ L.userData.grp=null; L.castShadow=false; L.removeFromParent(); LITE.recs.push(L); } };   // (as LITE.init does: never a new light in the scene, so nothing recompiles)
    const step=()=>{ STEPS.shift()(); pend.push(...BATCH.items.splice(0)); lit(); };
    const finish=()=>{ if(done)return; done=true; while(STEPS.length)step(); if(!pend.length)return; BATCH.items=pend; Object.assign(STORE.meshes,bake());   /* (nothing to bake when every one of them is off the map) */
      const Tk=STORE.tank; if(Tk){ WATER.body({name:'tank',X0:X(Tk.x0),X1:X(Tk.x1),Z0:Z(Tk.y0),Z1:Z(Tk.y1),lvl:Y(Tk.z+(Tk.dz||0)),GX:110,GY:40,dep:()=>(Tk.z-Tk.bed)/50*1.8});
    const gm=new THREE.MeshLambertMaterial({color:new THREE.Color(.5,.62,.7),transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}), gh=Y(Tk.z+4)-Y(Tk.bed), gy=(Y(Tk.z+4)+Y(Tk.bed))/2+Y(Tk.dz||0)-Y(0);
    for(const [x,z,w,ry] of [[(Tk.x0+Tk.x1)/2,Tk.y0,Tk.x1-Tk.x0,0],[(Tk.x0+Tk.x1)/2,Tk.y1,Tk.x1-Tk.x0,0],[Tk.x0,(Tk.y0+Tk.y1)/2,Tk.y1-Tk.y0,Math.PI/2],[Tk.x1,(Tk.y0+Tk.y1)/2,Tk.y1-Tk.y0,Math.PI/2]]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w*TILE*BLDK,gh),gm); m.position.set(X(x),gy,Z(z)); m.rotation.y=ry; scene.add(m); }  }
      if(STORE.houseAt){ const H=STORE.houseAt, hp=(dx,dy,z)=>[X(H[0]+dx),Y(z+(STORE.houseZ||0)),Z(H[1]+dy)], HP=[hp(-.16,-.09,38),hp(-.12,.07,41),hp(.18,.09,37),hp(.13,-.1,35),hp(-.06,0,44),hp(.06,0,44),hp(.08,-.11,32),hp(-.24,0,47),hp(.24,0,47),hp(0,-.17,49)];
    [12,21].forEach((k,i)=>{ const b=BF.add(k,HP); b.at=b.to=i*4; b.g.position.set(...HP[b.at]); }); }
      if(ROOMS.reset)ROOMS.reset(); if(window.CLIP)window.CLIP.run(); if(typeof INTERIORS!=='undefined')INTERIORS.build(); };   // (INTERIORS: the new rooms' insides drawn only near their doors: interiors.js)   // (CLIP: their things made solid on their own floors, as the rest were at load: clip.js)
    STORE.ensure=finish;
    const run=()=>{ if(done)return; if(STEPS.length){ step(); setTimeout(run,60); } else finish(); };
    STORE.later=()=>setTimeout(run,1500); }   // (started once the game runs: build.py)
}