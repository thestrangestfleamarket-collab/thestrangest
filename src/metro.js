// ---- THE METRO (owner, 17 Oct 2026: "look in google drive for metro station" ... "lets make that the subway in the new game. make sure it has
// an exit and its really unground. use anything else we have that makes it flesh out and feel real"; 18 Oct 2026: "i want to bring the metro
// into the map and move the current subway station off map"): his Drive's Metro_PSX kit (data/metro.json, tools/metro-bake.py) assembled into the
// Market's subway, a terminus 30 feet under the row behind the sidewalk (the kit's own exit: a railed opening on the lot between the apartment
// house and the bodega, its top at the sidewalk's back edge, a flight down, a corridor turning and sloping down to the platform). The kit's four
// cross-sections make a 64 m platform (track, tactile edge, tiles, the tiled back wall, a concrete ceiling) under the bodega and Ghost Street,
// the exit at its west end and a staff closet at its east, the track running on east into a dark tunnel; the kit's car waits at the platform
// with its doors open (the platform's side), shuts them with a chime and pulls away into the tunnel, and a while later comes back out of the
// dark, slows and opens up again (its rumble rises and falls with it); its ticket gates across the platform's end, the ticket machine, the
// metro map and posters on the wall, the vending machine, benches, bins, tube lights under the ceiling (each a lamp, LITE's eight nearest
// lit), tiled columns down the middle. The kit's textures stay textures, shrunk to the world's grain (about 18 texels a metre, nearest), no
// atlas since they tile; lit by the lamps like the rest, the old look's shade by facing. The ceilings are shown only from under them
// (OVERHEAD), the walls between you and the camera cut to their foot (cutWalls, as every room's), the exit's walls cut to your feet while
// you're on its stairs. Cost (measured, 18 Oct 2026): some 22,000 triangles in all (the car 9,200 and its doors 2,500 of them, drawn only
// underground), 26 textures, the batch's one Lambert program (no new one), 22 lamps among LITE's (no new light); nothing runs while you're on
// the street but the train's clock waiting. The kit's metres are the world's metres times 1.15 (as the characters are drawn). The West End
// station it replaced (station.js, wsub.js) is kept off the map: AWAY's 'station' (map-pre.js), ?bring=station builds it instead of this ----
METRO=(()=>{ const D=METROD, S=1.15, SURF=11.55, PLAT=1.4;   // (SURF: the kit's y at the sidewalk, the top of the exit's roof slab; PLAT: its platform's floor)
  // the kit's axes to the map's: its x (track to back wall) north along the map's y, its z (along the platform) east to west; the opening's
  // open end (kit x 28.4, the flight's top) on the sidewalk's back edge (y -77: the whole opening on the lot behind it, 18 Oct 2026, so the
  // sidewalk stays clear to walk), its middle (kit z 76.25) at tile 62, between the apartment house (to 57.9) and the bodega (from 76); moved
  // with the subway's layout (LAY: the map editor)
  const o=LAY.o('subway'), OXT=62+o.x, OYT=-76.9+o.y, XM=28.4, ZM=76.25, X0=(OXT-72)*TILE+S*ZM, Z0=(OYT+77)*TILE-S*XM;
  const M={S,SURF,PLAT,X0,Z0,DY:S*(PLAT-SURF)-.03, X:(kx,kz)=>X0-S*kz, Z:(kx,kz)=>Z0+S*kx, Y:ky=>S*(ky-SURF)-.03, KX:(x,z)=>(z-Z0)/S, KZ:(x,z)=>(X0-x)/S};
  // THE EXIT'S FLOORS: the kit's height under a spot (its slope, its turn, its treads), from the baked height map, the four cells round it blended
  const H=D.hf, HA=Uint8Array.from(atob(H.h),c=>c.charCodeAt(0)), hv=(i,j)=>{ if(i<0||j<0||i>=H.nx||j>=H.nz)return null; const v=HA[j*H.nx+i]; return v===255?null:v/250*10.2+PLAT; };
  M.hf=(x,z)=>{ const kx=M.KX(x,z), kz=M.KZ(x,z), u=(kx-H.x0)/H.step, v=(kz-H.z0)/H.step, i=Math.floor(u), j=Math.floor(v), fu=u-i, fv=v-j;
    const a=hv(i,j), b=hv(i+1,j), c=hv(i,j+1), d=hv(i+1,j+1), n=hv(Math.round(u),Math.round(v)); if(n==null)return null;
    const f=(p,q,t)=>p==null?q:q==null?p:p+(q-p)*t; return f(f(a,b,fu),f(c,d,fu),fv)??n; };
  M.ground=(x,z)=>{ const h=M.hf(x,z); return h!=null?M.Y(h):M.DY; };   // (underground: the platform's floor, or the exit's where its floors are)
  // THE OPENING on the lot, from the kit's railing round it (MAPSTAIR: a hole in the street's and the land's ground; where you're on the
  // stairs: in the opening, or anywhere in the exit's hall once you're down, lv the level asked about: yours, or a character's: lives.js); the
  // ground there from the height map (nothing under you: the level's)
  { const R=D.pieces.Railing, kx0=9.0, kx1=28.6, kz0=58.6, kz1=79.2; M.hall=(x,z)=>{ const kx=M.KX(x,z), kz=M.KZ(x,z); return kx>=kx0&&kx<=kx1&&kz>=kz0&&kz<=kz1; };
    Object.assign(MAPSTAIR,{x0:M.X(0,R.hi[2])/TILE+72,x1:M.X(0,R.lo[2])/TILE+72,y0:M.Z(R.lo[0],0)/TILE-77,y1:M.Z(R.hi[0],0)/TILE-77,
      has:(x,z,lv)=>{ const kx=M.KX(x,z), kz=M.KZ(x,z); return (kx>=R.lo[0]-.2&&kx<=R.hi[0]+.2&&kz>=R.lo[2]-.2&&kz<=R.hi[2]+.2)||((lv||LVL)==='down'&&M.hall(x,z)); },
      ground:(x,z,lv)=>{ const h=M.hf(x,z); return h!=null?M.Y(h):(lv||LVL)==='down'?M.DY:0; }}); }
  M.D=D; window.METRO=M; return M; })();   // (window's: a test's look)
{ const {S,X,Y,Z,DY,PLAT}=METRO, D=METRO.D, TX={}, MATS={}, b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), i16=s=>new Int16Array(b(s).buffer);
  // the kit's textures (its PNGs, shrunk at the bake), nearest, tiling
  for(const k in D.tex){ const t=D.tex[k], im=new Image(), tex=new THREE.Texture(im); im.onload=()=>{ tex.needsUpdate=true; }; im.src='data:image/png;base64,'+t.png;
    tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.NearestMipmapNearestFilter; tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.colorSpace=THREE.SRGBColorSpace; tex.flipY=false; TX[k]=tex; }
  // one material a kit material and a use (a wall cut by its own plane needs its own): Lambert with the picture, as the batch's (one program with it)
  const WHITE=(()=>{ const c=document.createElement('canvas'); c.width=c.height=2; const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,2,2); const t=new THREE.CanvasTexture(c); return t; })();
  const mat=(mi,use,pl)=>{ const key=mi+':'+use; if(!pl&&MATS[key])return MATS[key]; const m=D.mats[mi], glass=m.name==='Glass';
    const o={map:m.tex!=null?TX[m.tex]:WHITE,alphaTest:glass?0:.5,side:THREE.DoubleSide,color:glass?new THREE.Color(.72,.8,.9):new THREE.Color(...m.col)};
    if(m.emis!=null){ o.emissiveMap=TX[m.emis]; o.emissive=new THREE.Color(1,1,1); o.emissiveIntensity=1.6; }
    if(glass){ o.transparent=true; o.opacity=.35; o.depthWrite=false; }
    const r=new THREE.MeshLambertMaterial(o); if(pl)r.clippingPlanes=pl; else MATS[key]=r; return r; };
  // A PIECE'S TRIANGLES placed in the kit's space (moved by dx, dy, dz; turned yaw about its own middle), each sorted into a bucket by its material
  // and its part: the ceiling (shown only from under it), a wall by the way it faces out (the kit's walls face in: out is the other way), the rest
  const tris=key=>{ const p=D.pieces[key]; if(p._P)return p; const q=i16(p.p), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*p.sc+p.lo[i%3];
    const u=i16(p.uv), U=new Float32Array(u.length); for(let i=0;i<u.length;i++)U[i]=u[i]/512; p._P=P; p._U=U; return p; };
  const put=(B,key,o={})=>{ const p=tris(key), P=p._P, U=p._U, cx=(p.lo[0]+p.hi[0])/2, cz=(p.lo[2]+p.hi[2])/2, c=Math.cos(o.yaw||0), s=Math.sin(o.yaw||0), dx=o.dx||0, dy=o.dy||0, dz=o.dz||0, arch=!!o.arch;
    for(const [mi,st,n] of p.g){ const mn=D.mats[mi].name; for(let t=st;t<st+n;t+=3){ const v=[], w=[]; for(let k=0;k<3;k++){ const i=(t+k)*3, lx=P[i]-cx, lz=P[i+2]-cz, kx=cx+lx*c+lz*s+dx, ky=P[i+1]+dy, kz=cz-lx*s+lz*c+dz; v.push(kx,ky,kz); w.push(U[(t+k)*2],U[(t+k)*2+1]); }
        let use=o.use||'body';   // (o.use: every face one part, the car's: cut as a wall)
        if(arch){ const ax=v[3]-v[0], ay=v[4]-v[1], az=v[5]-v[2], bx=v[6]-v[0], by=v[7]-v[1], bz=v[8]-v[2], nx=ay*bz-az*by, ny=az*bx-ax*bz, nz=ax*by-ay*bx, ln=Math.hypot(nx,ny,nz)||1, cy=(v[1]+v[4]+v[7])/3;
          if(mn==='ConcreteBare'&&cy>5.8)use=cy>9?'ceilH':'ceil'; else if(Math.abs(ny/ln)<.3&&cy>(o.floor??1.4)+.35){ const ox=-nx/ln, oz=-nz/ln; use=Math.abs(ox)>Math.abs(oz)?(ox>0?'w+x':'w-x'):(oz>0?'w+z':'w-z'); } }
        const k=mi+'|'+use; let bk=B[k]; if(!bk)bk=B[k]={mi,use,P:[],U:[]}; for(let k2=0;k2<9;k2+=3)bk.P.push(X(v[k2],v[k2+2]),Y(v[k2+1]),Z(v[k2],v[k2+2])); bk.U.push(...w); } } };
  // a quad of my own into a bucket (the kit's materials on the tunnel, the end walls, the gate row's filler): four corners in the kit's space, uvs
  const quad=(B,mi,use,a,bq,c,d,uv)=>{ const k=mi+'|'+use; let bk=B[k]; if(!bk)bk=B[k]={mi,use,P:[],U:[]}; for(const v of [a,bq,c,a,c,d])bk.P.push(X(v[0],v[2]),Y(v[1]),Z(v[0],v[2])); const [u0,v0,u1,v1]=uv; bk.U.push(u0,v0,u1,v0,u1,v1,u0,v0,u1,v1,u0,v1); };
  const MI=Object.fromEntries(D.mats.map((m,i)=>[m.name,i]));
  // THE BUCKETS INTO MESHES: one a material and a part; a ceiling onto OVERHEAD at its height; a wall onto cutWalls with its own plane and the way
  // it faces into the room, as cutWalls take it (the kit's x north, its z west: a wall out +x faces in south, nz -1; out +z faces in east,
  // nx 1); foot: where a cut wall is cut to
  const flush=(B,grp,o={})=>{ const out=[]; for(const k in B){ const bk=B[k], g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(bk.P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(bk.U,2)); g.computeVertexNormals();
      const wall=bk.use[0]==='w', pl=wall?[new THREE.Plane(new THREE.Vector3(0,-1,0),1e6)]:null;
      const me=new THREE.Mesh(g,mat(bk.mi,bk.use,pl)); me.castShadow=!!o.shadow; me.receiveShadow=true; me.frustumCulled=true; grp.add(me); out.push(me);
      if(bk.use==='ceil'||bk.use==='ceilH'){ g.computeBoundingBox(); OVERHEAD.push({o:me,y:g.boundingBox.min.y+.02}); }
      if(wall){ const dir={'w+x':[0,-1],'w-x':[0,1],'w+z':[1,0],'w-z':[-1,0]}[bk.use], w={pl:pl[0],nx:dir[0],nz:dir[1],me,when:o.when}; if(o.foot!=null)w.foot=o.foot; else Object.defineProperty(w,'foot',{get:()=>py+.35}); cutWalls.push(w); } }
    return out; };
  // a solid in the kit's space (x0..x1 across, z0..z1 along), its height over its floor, onto a level's lists
  const sol=(L,F,x0,z0,x1,z1,h,base=0)=>{ const a=X(0,z1), c=X(0,z0), e=Z(x0,0), f=Z(x1,0); L.push([Math.min(a,c),Math.min(e,f),Math.max(a,c),Math.max(e,f)]); F.push([Math.min(a,c),Math.min(e,f),base,Math.max(a,c),Math.max(e,f),base+h*S]); };
  const lamp=(grp,kx,ky,kz,i=5,reach=9)=>{ const L=new THREE.PointLight(new THREE.Color(.64,.68,.8),i,reach*TILE,1.6); L.position.set(X(kx,kz),Y(ky),Z(kx,kz)); L.userData.i0=i; grp.add(L); lamps.push(L); return L; };
  METRO.put=put; METRO.flush=flush; METRO.quad=quad; METRO.sol=sol; METRO.lamp=lamp; METRO.MI=MI; METRO.mat=mat; METRO.tris=tris;

  // ==== THE STATION (the level under the street: built here, in the 'down' group) ====
  const B={}, PR={}, LI={}, grp=scene;   // (B: the architecture; PR: the things; LI: the tube lights, overhead)
  // the four cross-sections end to end (the kit shows them apart), the exit's at the west end as the kit has it (z 41 to 78.8), the rest
  // east of it: St_02 (17.6 m), St_01 (12.5), St (16.7, the staff closet at its end); the platform from z -5.83 to 58.63
  const SEG=[['St_02',41-33.43],['St_01',23.36-11.81],['St',10.85+5.19]]; const Z_S=-5.83, Z_N=58.63;   // (St_03, the exit's with the platform's west section, is built in the exit: METRO.exit)
  for(const [k,dz] of SEG)put(B,k,{dz,arch:true});
  // the ends: a tiled wall across the platform's east end beside the closet, a lintel over the track's mouth; the buffer wall where the track
  // meets the exit's corridor at the west; the tunnel east: the track bed running on under bare concrete into the dark, capped far off
  const TT=MI.tile_tile, CB=MI.ConcreteBare, RR=MI.road_rails;
  quad(B,TT,'w-z',[12.1,PLAT,Z_S],[10.25,PLAT,Z_S],[10.25,6.11,Z_S],[12.1,6.11,Z_S],[0,0,.55,1]);
  quad(B,TT,'w-z',[10.25,4.5,Z_S],[5.66,4.5,Z_S],[5.66,6.64,Z_S],[10.25,6.64,Z_S],[0,0,1.4,.45]);
  quad(B,TT,'w+z',[5.66,0,Z_N],[10.25,0,Z_N],[10.25,6.64,Z_N],[5.66,6.64,Z_N],[0,0,1.4,1.4]);
  { const ZT=-64, L=Z_S-ZT; quad(B,RR,'body',[10.55,0,Z_S],[5.66,0,Z_S],[5.66,0,ZT],[10.55,0,ZT],[.01,Z_S*.154,.99,ZT*.154]);
    quad(B,CB,'body',[5.66,0,Z_S],[5.66,0,ZT],[5.66,4.5,ZT],[5.66,4.5,Z_S],[0,0,L/4.7,.96]); quad(B,CB,'body',[10.55,0,ZT],[10.55,0,Z_S],[10.55,4.5,Z_S],[10.55,4.5,ZT],[0,0,L/4.7,.96]);
    quad(B,CB,'body',[5.66,4.5,Z_S],[10.55,4.5,Z_S],[10.55,4.5,ZT],[5.66,4.5,ZT],[0,0,1.04,L/4.7]); quad(B,CB,'body',[5.66,0,ZT],[10.55,0,ZT],[10.55,4.5,ZT],[5.66,4.5,ZT],[0,0,1.04,.96]); }
  // THE THINGS: columns down the platform's middle; the gates across its end at the corridor's foot (open: their flaps left out, a low tiled
  // filler to the wall and the edge); the ticket machine and the map by the gates, the vending machine, benches, bins and posters along the back
  // wall (each turned to face the platform: its front faces the kit's -z, turned a quarter to face -x; what stands on the floor set on the
  // platform's, the kit's display floor a hand higher); tube lights under the ceiling in two rows
  const BW=18.9, EDGE=10.25;
  for(const z of [4,14,24,34,44]){ put(PR,'Column',{dx:14.57-12.305,dz:z-5.545}); sol(solids,fixed,14.12,z-.47,15.02,z+.47,4.7); }
  const GZ=52.5, gp=D.pieces.gate; for(const x of [10.9,12.9,14.9,16.9]){ put(PR,'gate',{dx:x+.5,dz:GZ+13.19,dy:PLAT-gp.lo[1]}); sol(solids,fixed,x-.22,GZ-.72,x+.22,GZ+.72,1.1); }
  quad(B,TT,'body',[17.1,PLAT,GZ],[BW,PLAT,GZ],[BW,PLAT+1.05,GZ],[17.1,PLAT+1.05,GZ],[0,0,.55,.2]); quad(B,TT,'body',[EDGE,PLAT,GZ],[10.7,PLAT,GZ],[10.7,PLAT+1.05,GZ],[EDGE,PLAT+1.05,GZ],[0,0,.15,.2]);
  sol(solids,fixed,17.1,GZ-.08,BW,GZ+.08,1.05); sol(solids,fixed,EDGE,GZ-.08,10.7,GZ+.08,1.05);
  const wallThing=(key,z,o={})=>{ const p=D.pieces[key], w=p.hi[0]-p.lo[0], d=p.hi[2]-p.lo[2], cx=(p.lo[0]+p.hi[0])/2, cz=(p.lo[2]+p.hi[2])/2, x=BW-d/2-.03;   // (turned a quarter: its width along z, its depth along x, its back on the wall)
    put(PR,key,{yaw:Math.PI/2,dx:x-cx,dz:z-cz,dy:o.floor?PLAT-p.lo[1]:0,use:o.floor?undefined:'w+x'});   /* (what hangs on the wall cut with it: its back showed dark where the wall was cut away) */ if(o.solid)sol(solids,fixed,x-d/2,z-w/2,BW,z+w/2,p.hi[1]-p.lo[1]); };
  wallThing('ticket_machine',49.2,{solid:true,floor:true}); wallThing('metro_map',47.1); wallThing('Vending_machine',8,{solid:true,floor:true});
  for(const z of [17,33,41])wallThing('Chair',z,{solid:true,floor:true});
  for(const z of [4,25,45.5])wallThing('trash_can',z,{solid:true,floor:true});
  { const pairs=[[12,'Poster_01','Poster_05'],[21,'Poster_02','Poster_06'],[30,'Poster_03','Poster_07'],[38,'Poster_04','Poster_08']]; for(const [z,a,c] of pairs){ wallThing(a,z); wallThing(c,z); } }
  const tube=(grp2,kx,kz,ceil,o={})=>{ const p=D.pieces.light, cx=(p.lo[0]+p.hi[0])/2, cz=(p.lo[2]+p.hi[2])/2; put(grp2,'light',{dx:kx-cx,dz:kz-cz,dy:ceil-p.hi[1]-.02}); return lamp(o.grp||scene,kx,ceil-.4,kz,o.i||16,o.reach||10); };   // (as bright as the old station's platform, 18 Oct 2026: 5 left it in the dark)
  for(let z=-2;z<=54;z+=8){ tube(LI,16.9,z,6.11); tube(LI,12.3,z+4,6.11); }
  // the walls' cut: to a hand over the platform's floor; the ceilings over the platform overhead
  flush(B,grp,{foot:Y(PLAT)+.3}); flush(PR,grp,{shadow:true}); const lm=flush(LI,grp); for(const m of lm)OVERHEAD.push({o:m,y:Y(6.0)});
  // where you can't walk: the track (the platform's edge a drop you don't take), the back wall, the ends, the closet, the exit hall's walls
  sol(solids,fixed,4.5,-70,EDGE,Z_N+1,1.4); sol(solids,fixed,BW,Z_S-1,BW+.6,Z_N,4.7); sol(solids,fixed,EDGE,Z_S-.5,BW+.6,Z_S,4.7); sol(solids,fixed,12.0,Z_S,BW+.6,-1.5,4.7);
  sol(solids,fixed,9.0,Z_N,9.54,79.5,9); sol(solids,fixed,17.89,Z_N,28.9,73.7,9); sol(solids,fixed,9.0,78.64,28.9,79.5,9); sol(solids,fixed,BW,Z_N-.3,BW+.6,Z_N+.5,4.7);
  BOUND={x0:X(0,79.5),x1:X(0,Z_S-.5),z0:Z(5.0,0),z1:Z(28.9,0)};
  // the station's footprint (its own ground inside it; the loop's tunnel, at its own depth, outside it: map-post's MODS.station)
  METRO.inside=(x,z)=>x>BOUND.x0&&x<BOUND.x1&&z>BOUND.z0&&z<BOUND.z1;
  // THE TRAIN: the kit's car (its doors each their own mesh, sliding apart), at its stop (its platform side half a metre off the platform's edge,
  // its floor at the platform's); its clock: 50 s at the stop with its doors open, a chime and the doors shut, away east into the tunnel,
  // 45 s gone, back out of the dark slowing to its stop, the doors open; still while the street's above you (the clock waits)
  const TR={g:new THREE.Group(),doors:[],state:'stop',t:50,x:0,v:0,open:1}; METRO.train=TR; grp.add(TR.g);
  // (the car cut to its floor, as a wall is, while the camera's on the track's side of you: from there it stood between the view and the
  // platform, 18 Oct 2026; its faces as a wall facing south, kit -x, each with its own plane)
  { const CB2={}, cp=D.pieces.car, cdx=8.1-(cp.lo[0]+cp.hi[0])/2, cdz=25.9-(cp.lo[2]+cp.hi[2])/2, cdy=PLAT-1.44, cut={shadow:true,foot:Y(PLAT)+.3}; put(CB2,'car',{dx:cdx,dz:cdz,dy:cdy,use:'w-x'}); flush(CB2,TR.g,cut);
    // (only the platform's side opens: door6 to door11 and door13; the far side's leaves, door0 to door5 and door12, stay shut)
    const OPEN={door0:0,door1:0,door2:0,door3:0,door4:0,door5:0,door6:-1,door7:1,door8:-1,door9:1,door10:-1,door11:1,door12:0,door13:1};
    for(const k in OPEN){ const DB={}; put(DB,k,{dx:cdx,dz:cdz,dy:cdy,use:'w-x'}); const ms=flush(DB,TR.g,cut); if(OPEN[k])TR.doors.push({ms,k:OPEN[k]}); }
    TR.x0=X(0,25.9); TR.stopX=0; }
  // its sound: a rumble (noise through a low pass) rising and falling with its speed, fading with its distance; a two-note chime as the doors
  // shut; through the page's one AudioContext (SFX's, sfx.js), at its effects' level and only while they're on
  const SNDM={}; const ac=()=>typeof SFX!=='undefined'&&SFX.live?SFX.live():null, lvl=()=>typeof SFX!=='undefined'?(SFX.on===false?0:(SFX.vol??1)):1;
  const rumble=g=>{ const c=ac(); if(!c)return; if(!SNDM.r){ const n=c.sampleRate*2, buf=c.createBuffer(1,n,c.sampleRate), d=buf.getChannelData(0); for(let i=0;i<n;i++)d[i]=Math.random()*2-1; const src=c.createBufferSource(); src.buffer=buf; src.loop=true;
      const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=160; const gn=c.createGain(); gn.gain.value=0; src.connect(lp); lp.connect(gn); gn.connect(c.destination); src.start(); SNDM.r={gn,g:0}; }
    g*=lvl(); if(Math.abs(g-SNDM.r.g)<.002)return; SNDM.r.g=g; SNDM.r.gn.gain.setTargetAtTime(g,c.currentTime,.1); };   // (set only when it changes: at rest, at rest)
  const chime=()=>{ const c=ac(); if(!c)return; const t=c.currentTime, L=lvl(); for(const [f,at] of [[660,0],[520,.3]]){ const o=c.createOscillator(), g=c.createGain(); o.frequency.value=f; o.type='sine'; g.gain.setValueAtTime(0,t+at); g.gain.linearRampToValueAtTime(.12*L+1e-4,t+at+.02); g.gain.exponentialRampToValueAtTime(.0001,t+at+.5); o.connect(g); g.connect(c.destination); o.start(t+at); o.stop(t+at+.55); } };
  TR.tick=(dt,you)=>{ const on=MAPG.down.visible; if(!on){ if(SNDM.r)rumble(0); return; }
    const T=TR, AMAX=1.3, VMAX=14*S, FAR=78, dt1=Math.min(dt,.1);
    if(T.state==='stop'){ if((T.t-=dt1)<=0){ T.state='closing'; T.t=1.8; if(Math.hypot(T.x0-you.x,you.z-Z(8.1,0))<40)chime(); } }
    else if(T.state==='closing'){ T.open=Math.max(0,T.open-dt1/1.6); if((T.t-=dt1)<=0){ T.state='leave'; T.v=0; } }
    else if(T.state==='leave'){ T.v=Math.min(VMAX,T.v+AMAX*S*dt1); T.x+=T.v*dt1; if(T.x>FAR){ T.state='away'; T.t=45; T.g.visible=false; } }
    else if(T.state==='away'){ if((T.t-=dt1)<=0){ T.state='arrive'; T.x=FAR; T.v=VMAX; T.g.visible=true; } }
    else if(T.state==='arrive'){ const d=Math.max(0,T.x); T.v=Math.min(VMAX,Math.max(.6,Math.sqrt(2*AMAX*S*d))); T.x-=T.v*dt1; if(T.x<=0){ T.x=0; T.v=0; T.state='opening'; T.t=1.8; } }
    else if(T.state==='opening'){ T.open=Math.min(1,T.open+dt1/1.6); if((T.t-=dt1)<=0){ T.state='stop'; T.t=50; } }
    T.g.position.x=T.x; const e=T.open<.5?2*T.open*T.open:1-2*(1-T.open)*(1-T.open); for(const d of T.doors)for(const m of d.ms)m.position.x=-S*.86*d.k*e;
    const dist=Math.hypot(T.x0+T.x-you.x,you.z-Z(8.1,0)); rumble(T.g.visible?Math.min(1,T.v/VMAX)*Math.max(0,1-dist/55)*.45:0); };
  // THE PLATFORM'S LANE for the characters who wander it (the bear): along it between the columns and the back wall, in the world; its
  // spot (the menu's THE PLATFORM, the city's address, the gold skeleton's bed: lives.js)
  METRO.lane={x0:X(0,50),x1:X(0,0),z0:Z(15.3,0),z1:Z(18.2,0)}; METRO.at=(kx,kz)=>({x:X(kx,kz),z:Z(kx,kz)});
  // THE WAY DOWN, for a character walked there (lives.js): the opening's top, down the flight, along the corridor's turn and slope, through the
  // middle gate, onto the platform (the level his: 'down' once he's below the street)
  METRO.path=[[27.6,76.2,'up'],[24.5,76.2,'up'],[19.5,76.2,'down'],[15.5,76.2,'down'],[13.9,72,'down'],[13.9,60,'down'],[13.9,52.5,'down'],[15,46,'down'],[15,30,'down']].map(([kx,kz,lv])=>lv==='down'?{x:X(kx,kz),z:Z(kx,kz),lv}:{x:X(kx,kz),z:Z(kx,kz)});
  // ==== THE EXIT (the 'stairs' group: always shown, so from the street you see down the hole; its floors in the kit's height map) ====
  METRO.exit=()=>{ const E={}, LE={}; MODS.stairCut=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
    put(E,'St_03',{arch:true});   // (the kit's exit piece carries the platform's west section with it: the one piece, drawn here)
    const when=()=>LVL==='down'||inStair(pos.x,pos.z)!=null; flush(E,scene,{when});
    // the railing round the opening, at the street: its own group, hidden once you're well down the flight (from the corridor and the platform
    // it hung in the dark over you, the street round it gone: map-post's UNDER)
    { const RL={}, g=new THREE.Group(); put(RL,'Railing',{}); flush(RL,g); scene.add(g); METRO.rail=g; }
    // its lights: tubes down the corridor and over the flight (the level under the street's: lit only while that's shown), and a warm lamp over
    // the opening, so the way down is lit from the street
    for(const [x,z] of [[13.7,61],[13.7,69],[13.7,76.5]])tube(LE,x,z,11.07,{grp:MAPG.down});
    tube(LE,23,76.2,11.07,{grp:MAPG.down});
    { const L=lamp(scene,27.2,13.6,76.25,5,7); L.color.setRGB(1,.92,.78); }
    const lm=flush(LE,scene); for(const m of lm)OVERHEAD.push({o:m,y:Y(10.9)});
    // where you can't walk at the top: the railing's three sides, the open end free; its two long sides on the level below too (over the flight's
    // own walls), not its deep end (it crosses the flight's foot: it stopped him there on the way down, 18 Oct 2026)
    for(const [L,F] of [[SOL.up,FIX.up],[SOL.down,FIX.down]]){ sol(L,F,18.3,73.45,28.6,73.85,1.2); sol(L,F,18.3,78.6,28.6,79.0,1.2); } sol(SOL.up,FIX.up,18.3,73.45,18.7,79.0,1.2); };
}
