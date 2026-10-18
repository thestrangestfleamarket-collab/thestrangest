// ---- THE METRO (owner, 17 Oct 2026: "look in google drive for metro station" ... "lets make that the subway in the new game"; 18 Oct 2026:
// "i want to bring the metro into the map and move the current subway station off map"; then "simplify the subway station layout, stairs go
// down to the platform, one big room with tunnels, etc. too many random walls and things going on"): his Drive's Metro_PSX kit
// (data/metro.json, tools/metro-bake.py) for its textures and its things, the station itself laid out here, plainly: ONE HALL 30 feet under the
// row behind the sidewalk, 84 m long, the track down its south side and the platform along it; ONE STRAIGHT FLIGHT from the railed opening on
// the lot between the apartment house and the bodega (its top at the sidewalk's back edge) down through the hall's back wall onto the
// platform's middle; THE TUNNELS, the track running out of each end of the hall into the dark. No corridor, no gates, no closet, no lower
// ceilings: a back wall, a far wall, two end walls, one ceiling. The kit's car waits opposite the stairs with its doors open (the platform's
// side), shuts them with a chime and pulls away east into the tunnel, and a while later comes back out of the dark, slows and opens up again
// (its rumble rises and falls with it). Along the back wall the ticket machine and the map by the stairs, the vending machine, benches, bins
// and posters; a row of tiled columns; tube lights under the ceiling (each a lamp, LITE's eight nearest lit); a TO STREET sign each side of
// the stairs. The kit's textures stay textures, shrunk to the world's grain (about 18 texels a metre, nearest), each laid at the kit's own
// scale; lit by the lamps like the rest. The ceiling is shown only from under it (OVERHEAD), the walls between you and the camera cut to their
// foot (cutWalls, as every room's), the stairwell's walls cut to your feet while you're on the flight. Cost: some 12,000 triangles in all (the
// car 9,200 and its doors 2,500 of them, drawn only underground), the hall itself under 300; the batch's one Lambert program (no new one), some
// 16 lamps among LITE's (no new light); nothing runs while you're on the street but the train's clock waiting. The kit's metres are the
// world's metres times 1.15 (as the characters are drawn). The West End station (station.js, wsub.js) is kept off the map: AWAY's 'station'
// (map-pre.js), ?bring=station builds it instead of this ----
METRO=(()=>{ const D=METROD, S=1.15, SURF=11.55, PLAT=1.4;   // (SURF: the kit's y at the sidewalk, the top of the exit's roof slab; PLAT: its platform's floor)
  // the kit's axes to the map's: its x (track to back wall) north along the map's y, its z (along the platform) east to west; the opening's
  // open end (kit x 28.4, the flight's top) on the sidewalk's back edge (y -77: the whole opening on the lot behind it, 18 Oct 2026, so the
  // sidewalk stays clear to walk), its middle (kit z 76.25) at tile 62, between the apartment house (to 57.9) and the bodega (from 76); moved
  // with the subway's layout (LAY: the map editor)
  const o=LAY.o('subway'), OXT=62+o.x, OYT=-76.9+o.y, XM=28.4, ZM=76.25, X0=(OXT-72)*TILE+S*ZM, Z0=(OYT+77)*TILE-S*XM;
  const M={S,SURF,PLAT,X0,Z0,DY:S*(PLAT-SURF)-.03, X:(kx,kz)=>X0-S*kz, Z:(kx,kz)=>Z0+S*kx, Y:ky=>S*(ky-SURF)-.03, KX:(x,z)=>(z-Z0)/S, KZ:(x,z)=>(X0-x)/S};
  // THE HALL'S MEASURES in the kit's metres: the track's far wall (TW), the platform's edge (EDGE), the back wall (BW: the opening's inner end),
  // the hall's ends (Z_S east, Z_N west: the opening in the middle), the ceiling (CEIL); THE FLIGHT straight down from the opening's open end
  // (FX1) to the platform (FX0), between the opening's sides (FZ0, FZ1), NST steps
  const R=D.pieces.Railing, BW=R.lo[0], FZ0=R.lo[2], FZ1=R.hi[2], FX1=R.hi[0], NST=24, RISE=(SURF-PLAT)/NST, RUN=.505, FX0=FX1-NST*RUN, CZ=(FZ0+FZ1)/2;
  Object.assign(M,{TW:5.66,EDGE:10.25,BW,CEIL:6.25,Z_S:CZ-42,Z_N:CZ+42,FX0,FX1,FZ0,FZ1,NST,RISE,RUN,CZ});
  // the flight's floor under a spot: tread by tread (the top tread level with the sidewalk), null off the flight
  M.hf=(x,z)=>{ const kx=M.KX(x,z), kz=M.KZ(x,z); if(kz<FZ0-.05||kz>FZ1+.05||kx<FX0||kx>FX1+.4)return null; return PLAT+Math.min(NST,Math.floor((kx-FX0)/RUN)+1)*RISE; };
  M.ground=(x,z)=>{ const h=M.hf(x,z); return h!=null?M.Y(h):M.DY; };   // (underground: the platform's floor, or the flight's where it is)
  // THE OPENING on the lot, the kit's railing round it (MAPSTAIR: a hole in the street's and the land's ground; where you're on the stairs: in
  // the opening, or anywhere on the flight and a step off its foot once you're down, lv the level asked about: yours, or a character's: lives.js)
  M.hall=(x,z)=>{ const kx=M.KX(x,z), kz=M.KZ(x,z); return kx>=FX0-1&&kx<=FX1+.2&&kz>=FZ0-.3&&kz<=FZ1+.3; };
  Object.assign(MAPSTAIR,{x0:M.X(0,R.hi[2])/TILE+72,x1:M.X(0,R.lo[2])/TILE+72,y0:M.Z(R.lo[0],0)/TILE-77,y1:M.Z(R.hi[0],0)/TILE-77,
    has:(x,z,lv)=>{ const kx=M.KX(x,z), kz=M.KZ(x,z); return (kx>=R.lo[0]-.2&&kx<=R.hi[0]+.2&&kz>=R.lo[2]-.2&&kz<=R.hi[2]+.2)||((lv||LVL)==='down'&&M.hall(x,z)); },
    ground:(x,z,lv)=>{ const h=M.hf(x,z); return h!=null?M.Y(h):(lv||LVL)==='down'?M.DY:0; }});
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
      if(bk.use.slice(0,4)==='ceil'){ g.computeBoundingBox(); OVERHEAD.push({o:me,y:g.boundingBox.min.y+.02}); }
      if(wall){ const dir={'w+x':[0,-1],'w-x':[0,1],'w+z':[1,0],'w-z':[-1,0]}[bk.use], w={pl:pl[0],nx:dir[0],nz:dir[1],me,when:o.when}; if(o.foot!=null)w.foot=o.foot; else Object.defineProperty(w,'foot',{get:()=>py+.35}); cutWalls.push(w); } }
    return out; };
  // a solid in the kit's space (x0..x1 across, z0..z1 along), its height over its floor, onto a level's lists
  const sol=(L,F,x0,z0,x1,z1,h,base=0)=>{ const a=X(0,z1), c=X(0,z0), e=Z(x0,0), f=Z(x1,0); L.push([Math.min(a,c),Math.min(e,f),Math.max(a,c),Math.max(e,f)]); F.push([Math.min(a,c),Math.min(e,f),base,Math.max(a,c),Math.max(e,f),base+h*S]); };
  const lamp=(grp,kx,ky,kz,i=5,reach=9)=>{ const L=new THREE.PointLight(new THREE.Color(.64,.68,.8),i,reach*TILE,1.6); L.position.set(X(kx,kz),Y(ky),Z(kx,kz)); L.userData.i0=i; grp.add(L); lamps.push(L); return L; };
  METRO.put=put; METRO.flush=flush; METRO.quad=quad; METRO.sol=sol; METRO.lamp=lamp; METRO.MI=MI; METRO.mat=mat; METRO.tris=tris;

  // ==== THE STATION (the level under the street: built here, in the 'down' group) ====
  const B={}, PR={}, LI={}, BT={}, grp=scene;   // (B: the hall; PR: the things; LI: the tube lights, overhead; BT: the tunnels' walls and roofs)
  const {TW,EDGE,BW,CEIL,Z_S,Z_N,FX0,FX1,FZ0,FZ1,CZ}=METRO, TZ0=Z_S-60, TZ1=Z_N+40, TH=4.5;   // (the tunnels: 60 m east, the car's way out and back, 40 m west; TH their roof)
  const TT=MI.tile_tile, CB=MI.ConcreteBare, RR=MI.road_rails, TI=MI.Tiles, TP=MI.TactilePaving;
  // plain quads in the kit's space, the texture at the kit's own scale (k: its repeats a metre): a floor (y), a wall across x, a wall across z
  const fl=(Bk,mi,use,x0,z0,x1,z1,y,k)=>quad(Bk,mi,use,[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1],[x0*k,z0*k,x1*k,z1*k]);
  const wx=(Bk,mi,use,x,z0,z1,y0,y1,k)=>quad(Bk,mi,use,[x,y0,z0],[x,y0,z1],[x,y1,z1],[x,y1,z0],[z0*k,(y0-1.11)*k,z1*k,(y1-1.11)*k]);
  const wz=(Bk,mi,use,z,x0,x1,y0,y1,k)=>quad(Bk,mi,use,[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z],[x0*k,(y0-1.11)*k,x1*k,(y1-1.11)*k]);
  // THE HALL: the track bed and the platform (its edge, the tactile strip, its tiles); the far wall behind the track, the back wall (open where
  // the flight comes through), the two end walls (each open over the track: a tunnel's mouth); the one ceiling
  quad(B,RR,'body',[10.55,0,TZ0],[TW,0,TZ0],[TW,0,TZ1],[10.55,0,TZ1],[.01,TZ0*.154,.99,TZ1*.154]);
  wx(B,TI,'body',EDGE,Z_S,Z_N,0,PLAT,.165); fl(B,TI,'body',EDGE,Z_S,10.55,Z_N,PLAT,.165); fl(B,TP,'body',10.55,Z_S,11.31,Z_N,PLAT,.44); fl(B,TI,'body',11.31,Z_S,BW,Z_N,PLAT,.165);
  wx(B,TT,'w-x',TW,Z_S,Z_N,0,CEIL,.18); wx(B,TT,'w+x',BW,Z_S,FZ0,PLAT,CEIL,.18); wx(B,TT,'w+x',BW,FZ1,Z_N,PLAT,CEIL,.18);
  for(const [z,u] of [[Z_S,'w-z'],[Z_N,'w+z']]){ wz(B,TT,u,z,10.55,BW,PLAT,CEIL,.18); wz(B,TT,u,z,TW,10.55,TH,CEIL,.18); }
  fl(B,CB,'ceil',TW,Z_S,BW,Z_N,CEIL,.223);
  // THE TUNNELS: their walls and roofs their own (while you ride the car through one, its walls are cut to the car's floor as a room's are and
  // its roof is overhead, so the view from above finds you in the car); each capped far off in the dark
  for(const [a,c] of [[TZ0,Z_S],[Z_N,TZ1]]){ wx(BT,CB,'w-x',TW,a,c,0,TH,.223); wx(BT,CB,'w+x',10.55,a,c,0,TH,.223); fl(BT,CB,'ceilT',TW,a,10.55,c,TH,.223); }
  for(const z of [TZ0,TZ1])wz(B,CB,'body',z,TW,10.55,0,TH,.223);
  // THE THINGS: a row of columns down the platform's middle (none before the stairs); along the back wall the ticket machine and the map by the
  // stairs, the vending machine, benches, bins and posters (each turned to face the platform: its front faces the kit's -z, turned a quarter
  // to face -x; what stands on the floor set on the platform's, the kit's display floor a hand higher); tube lights under the ceiling
  const CX=14.4; for(let z=Z_S+7;z<Z_N-3;z+=12){ if(Math.abs(z-CZ)<8)continue; put(PR,'Column',{dx:CX-12.305,dz:z-5.545}); sol(solids,fixed,CX-.45,z-.47,CX+.45,z+.47,4.85); }
  const wallThing=(key,z,o={})=>{ const p=D.pieces[key], w=p.hi[0]-p.lo[0], d=p.hi[2]-p.lo[2], cx=(p.lo[0]+p.hi[0])/2, cz=(p.lo[2]+p.hi[2])/2, x=BW-d/2-.03;   // (turned a quarter: its width along z, its depth along x, its back on the wall)
    put(PR,key,{yaw:Math.PI/2,dx:x-cx,dz:z-cz,dy:o.floor?PLAT-p.lo[1]:0,use:o.floor?undefined:'w+x'});   /* (what hangs on the wall cut with it: its back showed dark where the wall was cut away) */ if(o.solid)sol(solids,fixed,x-d/2,z-w/2,BW,z+w/2,p.hi[1]-p.lo[1]); };
  wallThing('ticket_machine',FZ0-1.4,{solid:true,floor:true}); wallThing('metro_map',FZ0-3.2); wallThing('Vending_machine',FZ1+2,{solid:true,floor:true});
  // the benches: seats a double click sits him on (use.js, as the old station's were): where each stands, in the world
  METRO.seats=[]; for(const z of [CZ-24,CZ-12,CZ+14,CZ+26]){ wallThing('Chair',z,{solid:true,floor:true}); const d=D.pieces.Chair.hi[2]-D.pieces.Chair.lo[2], kx=BW-d/2-.03; METRO.seats.push({x:X(kx,z),z:Z(kx,z),y:Y(PLAT),w:S*(D.pieces.Chair.hi[0]-D.pieces.Chair.lo[0]),d:S*d}); }
  for(const z of [CZ-18,CZ+20])wallThing('trash_can',z,{solid:true,floor:true});
  { const pairs=[[CZ-30,'Poster_01','Poster_05'],[CZ-8,'Poster_02','Poster_06'],[CZ+8,'Poster_03','Poster_07'],[CZ+32,'Poster_04','Poster_08']]; for(const [z,a,c] of pairs){ wallThing(a,z); wallThing(c,z); } }
  const tube=(grp2,kx,kz,ceil,o={})=>{ const p=D.pieces.light, cx=(p.lo[0]+p.hi[0])/2, cz=(p.lo[2]+p.hi[2])/2; put(grp2,'light',{dx:kx-cx,dz:kz-cz,dy:ceil-p.hi[1]-.02}); return lamp(o.grp||scene,kx,ceil-.4,kz,o.i||16,o.reach||10); };   // (as bright as the old station's platform, 18 Oct 2026: 5 left it in the dark)
  for(let z=Z_S+5,i=0;z<Z_N;z+=10,i++)tube(LI,i%2?16.6:12.4,z,CEIL);
  // the walls' cut: to a hand over the platform's floor; the ceiling overhead
  flush(B,grp,{foot:Y(PLAT)+.3}); flush(BT,grp,{foot:Y(PLAT)+.3,when:()=>!!METRO.train.ride}); METRO.things=flush(PR,grp,{shadow:true});   // (things: the benches' faces for use.js's seat finder)
  { const lm=flush(LI,grp); for(const m of lm)OVERHEAD.push({o:m,y:Y(CEIL-.2)}); }
  // THE WAY OUT SIGNED (owner, 18 Oct 2026: a TO STREET sign): a black sign hung from the ceiling across the platform each side of the stairs,
  // TO STREET with an arrow ahead on the side away from them, in the white pixel letters of the street's signs (3x5, a texel each, painted once
  // into a picture the kit's grain has: 18 texels a metre), its letters lit a little from inside; two dark rods up to the ceiling. Not overhead
  // (OVERHEAD): it hangs low enough to read from the isometric view
  { const G={T:'111010010010010',O:'010101101101010',S:'011100010001110',R:'110101110101101',E:'111100110100111','^':'0010001110101010010000100'};
    const pic=w=>{ const W=49, H=11, c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d'), im=g.createImageData(W,H), D2=im.data;
      const px=(i,j,r,gg,b)=>{ const k=(j*W+i)*4; D2[k]=r; D2[k+1]=gg; D2[k+2]=b; D2[k+3]=255; };
      for(let j=0;j<H;j++)for(let i=0;i<W;i++){ const edge=i===0||j===0||i===W-1||j===H-1; edge?px(i,j,70,72,76):px(i,j,18,18,20); }
      if(w){ for(let j=0;j<5;j++)for(let i=0;i<5;i++)if(G['^'][j*5+i]==='1')px(3+i,3+j,236,238,232);   // (the arrow: straight ahead)
        [...w].forEach((ch,n)=>{ const gl=G[ch]; if(gl)for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(gl[j*3+i]==='1')px(11+n*4+i,3+j,236,238,232); }); }
      g.putImageData(im,0,0); const t=new THREE.CanvasTexture(c); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
    const sm=w=>{ const t=pic(w); return new THREE.MeshLambertMaterial({map:t,emissiveMap:t,emissive:new THREE.Color(1,1,1),emissiveIntensity:.35,alphaTest:.5,side:THREE.DoubleSide}); }, dark=new THREE.MeshLambertMaterial({map:WHITE,color:new THREE.Color(.16,.17,.19),alphaTest:.5,side:THREE.DoubleSide});   // (as the kit's own are made: their programs, no new one)
    const kx=14.4, y0=3.85, wm=49/18, hm=11/18, MS=sm('TO STREET'), MB=sm('');
    METRO.signs=[[FZ0-5,0],[FZ1+5,1]].map(([kz,far])=>{ const sg=new THREE.Mesh(new THREE.BoxGeometry(.05*S,hm*S,wm*S),[far?MB:MS,far?MS:MB,dark,dark,dark,dark]);   // (its +x face east, the kit's -z: the east sign's lettered side faces the east platform, the west sign's the west)
      sg.position.set(X(kx,kz),Y(y0+hm/2),Z(kx,kz)); sg.receiveShadow=true; grp.add(sg);
      for(const d of [-1,1]){ const rod=new THREE.Mesh(new THREE.BoxGeometry(.03*S,(CEIL-y0-hm)*S,.03*S),dark); rod.position.set(X(kx+d*wm*.4,kz),Y((CEIL+y0+hm)/2),Z(kx+d*wm*.4,kz)); grp.add(rod); } return sg; });
    METRO.sign=METRO.signs[0]; }
  // where you can't walk: the track (the platform's edge a drop you don't take), the back wall either side of the stairs, the ends, the
  // flight's sides (its parapets in the hall, its walls under the opening)
  sol(solids,fixed,4.5,TZ0,EDGE,TZ1,1.4); const TRK=solids[solids.length-1];
  sol(solids,fixed,BW,Z_S-1,BW+.6,FZ0-.2,6); sol(solids,fixed,BW,FZ1+.2,BW+.6,Z_N+1,6); sol(solids,fixed,EDGE,Z_S-.5,BW+.6,Z_S,6); sol(solids,fixed,EDGE,Z_N,BW+.6,Z_N+.5,6);
  sol(solids,fixed,FX0,FZ0-.2,FX1+.2,FZ0+.05,9); sol(solids,fixed,FX0,FZ1-.05,FX1+.2,FZ1+.2,9);
  BOUND={x0:X(0,Z_N+.5),x1:X(0,Z_S-.5),z0:Z(TW-.6,0),z1:Z(FX1+.5,0)}; const BX1=BOUND.x1, BD=BOUND;
  // the station's footprint (its own ground inside it; the loop's tunnel, at its own depth, outside it: map-post's MODS.station)
  METRO.inside=(x,z)=>x>BOUND.x0&&x<BOUND.x1&&z>BOUND.z0&&z<BOUND.z1;
  // THE TRAIN: the kit's car (its doors each their own mesh, sliding apart), at its stop (its platform side half a metre off the platform's edge,
  // its floor at the platform's); its clock: 50 s at the stop with its doors open, a chime and the doors shut, away east into the tunnel,
  // 45 s gone, back out of the dark slowing to its stop, the doors open; still while the street's above you (the clock waits)
  const TR={g:new THREE.Group(),doors:[],state:'stop',t:50,x:0,v:0,open:1}; METRO.train=TR; grp.add(TR.g);
  // (the car cut to its floor, as a wall is, while the camera's on the track's side of you: from there it stood between the view and the
  // platform, 18 Oct 2026; its faces as a wall facing south, kit -x, each with its own plane)
  const c1=cutWalls.length;
  { const CB2={}, cp=D.pieces.car, cdx=8.1-(cp.lo[0]+cp.hi[0])/2, cdz=CZ-(cp.lo[2]+cp.hi[2])/2, cdy=PLAT-1.44, cut={shadow:true,foot:Y(PLAT)+.3}; put(CB2,'car',{dx:cdx,dz:cdz,dy:cdy,use:'w-x'}); flush(CB2,TR.g,cut);
    // (only the platform's side opens: door6 to door11 and door13; the far side's leaves, door0 to door5 and door12, stay shut)
    const OPEN={door0:0,door1:0,door2:0,door3:0,door4:0,door5:0,door6:-1,door7:1,door8:-1,door9:1,door10:-1,door11:1,door12:0,door13:1};
    for(const k in OPEN){ const DB={}; put(DB,k,{dx:cdx,dz:cdz,dy:cdy,use:'w-x'}); const ms=flush(DB,TR.g,cut); if(OPEN[k])TR.doors.push({ms,k:OPEN[k]}); }
    TR.x0=X(0,CZ); TR.stopX=0; }
  // RIDING THE CAR (owner, 18 Oct 2026, "go all", the Metro's open items: "riding the car"): standing in it when its doors shut, you go with it:
  // out into the tunnel and back to the platform (the one station: it comes back out of the dark, slows, opens), carried each frame by its own
  // move before you walk (build.py runs its clock first in the frame), the car cut to its floor (as a room's walls) and the tunnel's walls
  // and roof with it, so the view from above finds you in it; a lamp in it, lit only while you ride (one of LITE's eight). Its solids follow
  // it: with its doors open at the platform the track's box is the track round the car, the car's far side and its platform side between its
  // three pairs of doors (a gap at each); shut, its platform side whole: in it you can't walk out but through an open door, nor out of it
  // through a wall; gone, the track whole again. Nothing a frame when it changes nothing (the boxes set only when the car moves or the doors
  // change)
  TR.cuts=cutWalls.slice(c1);
  const DC=CZ-25.9, CI={x0:6.42,x1:9.8,z0:14.65+DC,z1:35.25+DC}, DOORZ=[[18.15,19.65],[25.15,26.65],[32.12,33.65]].map(([a,b])=>[a+DC,b+DC]), XB=[];   // (the car's inside, in the kit; its doorways on the platform's side: measured at the kit's stop, z 25.9, moved to the one opposite the stairs)
  for(let i=0;i<6;i++){ const b=[1e6,1e6,1e6,1e6]; solids.push(b); XB.push(b); }
  const setB=(b,x0,z0,x1,z1)=>{ const a=X(0,z1), c=X(0,z0), e=Z(x0,0), f=Z(x1,0); b[0]=Math.min(a,c); b[1]=Math.min(e,f); b[2]=Math.max(a,c); b[3]=Math.max(e,f); };
  const off=b=>{ b[0]=b[1]=b[2]=b[3]=1e6; };
  let LAY0='';
  const lay=(mode,dz)=>{ const key=mode+(mode==='ride'?dz.toFixed(3):''); if(key===LAY0)return; LAY0=key; for(const b of XB)off(b);
    if(mode==='closed'){ setB(TRK,4.5,TZ0,EDGE,TZ1); return; }
    setB(TRK,4.5,TZ0,EDGE,CI.z0+dz); setB(XB[0],4.5,CI.z1+dz,EDGE,TZ1); setB(XB[1],4.5,CI.z0+dz,CI.x0,CI.z1+dz);   // (the track either side of the car, and its far side)
    if(mode==='ride'){ setB(XB[2],CI.x1,CI.z0+dz,EDGE,CI.z1+dz); return; }
    let z=CI.z0; DOORZ.forEach(([a,b],i)=>{ setB(XB[2+i],CI.x1,z,EDGE,a); z=b; }); setB(XB[5],CI.x1,z,EDGE,CI.z1); };   // (open: its side between the doorways)
  const inCar=(x,z,dz)=>{ const kx=METRO.KX(x,z), kz=METRO.KZ(x,z); return kx>CI.x0-.1&&kx<CI.x1+.2&&kz>CI.z0+dz&&kz<CI.z1+dz; };
  const RL=lamp(grp,8.1,4.2,CZ,0,6); RL.userData.i0=6; METRO.inCar=(x,z)=>inCar(x,z,-TR.x/S);
  // its sound: a rumble (noise through a low pass) rising and falling with its speed, fading with its distance; a two-note chime as the doors
  // shut; through the page's one AudioContext (SFX's, sfx.js), at its effects' level and only while they're on
  const SNDM={}; const ac=()=>typeof SFX!=='undefined'&&SFX.live?SFX.live():null, lvl=()=>typeof SFX!=='undefined'?(SFX.on===false?0:(SFX.vol??1)):1;
  const rumble=g=>{ const c=ac(); if(!c)return; if(!SNDM.r){ const n=c.sampleRate*2, buf=c.createBuffer(1,n,c.sampleRate), d=buf.getChannelData(0); for(let i=0;i<n;i++)d[i]=Math.random()*2-1; const src=c.createBufferSource(); src.buffer=buf; src.loop=true;
      const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=160; const gn=c.createGain(); gn.gain.value=0; src.connect(lp); lp.connect(gn); gn.connect(c.destination); src.start(); SNDM.r={gn,g:0}; }
    g*=lvl(); if(Math.abs(g-SNDM.r.g)<.002)return; SNDM.r.g=g; SNDM.r.gn.gain.setTargetAtTime(g,c.currentTime,.1); };   // (set only when it changes: at rest, at rest)
  const chime=()=>{ const c=ac(); if(!c)return; const t=c.currentTime, L=lvl(); for(const [f,at] of [[660,0],[520,.3]]){ const o=c.createOscillator(), g=c.createGain(); o.frequency.value=f; o.type='sine'; g.gain.setValueAtTime(0,t+at); g.gain.linearRampToValueAtTime(.12*L+1e-4,t+at+.02); g.gain.exponentialRampToValueAtTime(.0001,t+at+.5); o.connect(g); g.connect(c.destination); o.start(t+at); o.stop(t+at+.55); } };
  TR.tick=(dt,you)=>{ const on=MAPG.down.visible; if(!on){ if(SNDM.r)rumble(0); return; }
    const T=TR, AMAX=1.3, VMAX=14*S, FAR=78, dt1=Math.min(dt,.1), x0=T.x;
    if(T.state==='stop'){ if((T.t-=dt1)<=0){ T.state='closing'; T.t=1.8; if(Math.hypot(T.x0-you.x,you.z-Z(8.1,0))<40)chime();
        if(LVL==='down'&&!(typeof RAG!=='undefined'&&RAG.on)&&inCar(you.x,you.z,0)){ T.ride=true; BD.x1=X(0,TZ0); RL.intensity=RL.userData.i0; } } }   // (aboard as the doors shut: you ride; the map's bound out along the tunnel with you)
    else if(T.state==='closing'){ T.open=Math.max(0,T.open-dt1/1.6); if((T.t-=dt1)<=0){ T.state='leave'; T.v=0; } }
    else if(T.state==='leave'){ T.v=Math.min(VMAX,T.v+AMAX*S*dt1); T.x+=T.v*dt1; if(T.x>FAR){ T.x=Math.min(T.x,FAR+2); T.state='away'; T.t=T.ride?6:45; T.v=0; if(!T.ride)T.g.visible=false; } }   // (with you aboard: a short wait in the dark, the car kept)
    else if(T.state==='away'){ if((T.t-=dt1)<=0){ T.state='arrive'; T.x=FAR; T.v=VMAX; T.g.visible=true; } }
    else if(T.state==='arrive'){ const d=Math.max(0,T.x); T.v=Math.min(VMAX,Math.max(.6,Math.sqrt(2*AMAX*S*d))); T.x-=T.v*dt1; if(T.x<=0){ T.x=0; T.v=0; T.state='opening'; T.t=1.8; } }
    else if(T.state==='opening'){ T.open=Math.min(1,T.open+dt1/1.6); if((T.t-=dt1)<=0){ T.state='stop'; T.t=50;
        if(T.ride){ T.ride=false; BD.x1=BX1; RL.intensity=0; } } }   // (back at the platform, the doors open: off you get)
    // carried: you go as far as the car went, kept in it (its boxes moved with it); its lamp with it
    if(T.ride){ you.x+=T.x-x0; if(target)target.x+=T.x-x0;   /* (where a double click sent you in the car goes with it) */ if(!inCar(you.x,you.z,-T.x/S)){ const kx=Math.max(CI.x0+.35,Math.min(CI.x1-.35,METRO.KX(you.x,you.z))), kz=Math.max(CI.z0+.35,Math.min(CI.z1-.35,METRO.KZ(you.x,you.z)+T.x/S))-T.x/S; you.x=X(kx,kz); you.z=Z(kx,kz); } RL.position.set(X(8.1,CZ)+T.x,Y(4.2),Z(8.1,0)); }
    const see=!!T.ride||LVL==='down'&&inCar(you.x,you.z,-T.x/S); if(see!==T.see){ T.see=see; for(const w of T.cuts)w.always=see; }   // (in the car, riding or not: it's cut to its floor so you see yourself in it)
    lay(T.ride?'ride':(T.state==='stop'||T.state==='opening'&&T.open>.5)?'open':'closed',-T.x/S);
    T.g.position.x=T.x; const e=T.open<.5?2*T.open*T.open:1-2*(1-T.open)*(1-T.open); for(const d of T.doors)for(const m of d.ms)m.position.x=-S*.86*d.k*e;
    const dist=Math.hypot(T.x0+T.x-you.x,you.z-Z(8.1,0)); rumble(T.g.visible?Math.min(1,T.v/VMAX)*Math.max(0,1-dist/55)*.45:0); };
  // THE PLATFORM'S LANE for the characters who wander it: along it between the columns and the back wall, east of the stairs, in the world;
  // its spot (the menu's THE PLATFORM, the city's address, the gold skeleton's bed: lives.js)
  METRO.lane={x0:X(0,CZ-8),x1:X(0,Z_S+2),z0:Z(15.2,0),z1:Z(17.6,0)}; METRO.at=(kx,kz)=>({x:X(kx,kz),z:Z(kx,kz)}); METRO.plat=METRO.at(15.5,CZ-14);
  // THE WAY DOWN, for a character walked there (lives.js): the opening's top, straight down the flight, off its foot onto the platform (the
  // level his: 'down' once he's below the street)
  METRO.path=[[FX1-.4,CZ,'up'],[FX1-2.5,CZ,'up'],[BW+2,CZ,'down'],[FX0-.5,CZ,'down'],[13.2,CZ-6,'down'],[15.5,CZ-14,'down']].map(([kx,kz,lv])=>lv==='down'?{x:X(kx,kz),z:Z(kx,kz),lv}:{x:X(kx,kz),z:Z(kx,kz)});
  // ==== THE STAIRS (the 'stairs' group: always shown, so from the street you see down the hole) ====
  // one straight flight of tiled treads and risers from the opening's open end down through the hall's back wall to the platform; under the
  // opening its walls rise to the street (cut to your feet while you're on it), in the hall a low parapet each side, the back wall's face over
  // the way through; the kit's railing round the opening at the street
  METRO.exit=()=>{ const E={}, EW={}, LE={}, P=.2, PH=.95; MODS.stairCut=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
    const {NST,RISE,RUN,SURF}=METRO, nose=kx=>PLAT+RISE+(kx-FX0)/RUN*RISE;   // (the line along the treads' front edges)
    for(let i=0;i<NST;i++){ const x0=FX0+i*RUN, y1=PLAT+(i+1)*RISE; fl(E,TI,'body',x0,FZ0,x0+RUN,FZ1,y1,.19); wx(E,TI,'body',x0,FZ0,FZ1,y1-RISE,y1,.19); }
    // the parapets in the hall (their inside, outside, sloping top and foot), and the walls under the opening, up to the street
    for(const [zi,zo] of [[FZ0,FZ0-P],[FZ1,FZ1+P]]){ const t0=nose(FX0)+PH-RISE, t1=nose(BW)+PH;
      for(const z of [zi,zo])quad(E,TT,'body',[FX0,PLAT,z],[BW,PLAT,z],[BW,t1,z],[FX0,t0,z],[FX0*.18,0,BW*.18,(t1-PLAT)*.18]);
      quad(E,TI,'body',[FX0,t0,zo],[BW,t1,zo],[BW,t1,zi],[FX0,t0,zi],[0,0,(BW-FX0)*.19,P*.19]);
      quad(E,TT,'body',[FX0,PLAT,zo],[FX0,PLAT,zi],[FX0,t0,zi],[FX0,t0,zo],[0,0,P*.18,(t0-PLAT)*.18]);
      quad(EW,TT,zi===FZ0?'w-z':'w+z',[BW,nose(BW)-1,zi],[FX1+.2,SURF-.6,zi],[FX1+.2,SURF,zi],[BW,SURF,zi],[BW*.18,(nose(BW)-2.11)*.18,(FX1+.2)*.18,(SURF-1.11)*.18]); }
    wx(EW,TT,'w+x',BW,FZ0,FZ1,CEIL,SURF,.18);   // (the back wall's face over the way through: cut as the hall's back wall is)
    // (its walls cut as a room's when you're on it; from the hall below they're cut away whatever the view's angle: from there they stood up
    // over the back wall, outside the hall)
    const when=()=>LVL==='down'||inStair(pos.x,pos.z)!=null, c1=cutWalls.length; flush(E,scene); flush(EW,scene,{when});
    for(const w of cutWalls.slice(c1))Object.defineProperty(w,'always',{get:()=>LVL==='down'&&inStair(pos.x,pos.z)==null});
    // the railing round the opening, at the street: its own group, hidden once you're well down the flight (from the platform it hung in the
    // dark over you, the street round it gone: map-post's UNDER)
    { const RL={}, g=new THREE.Group(); put(RL,'Railing',{}); flush(RL,g); scene.add(g); METRO.rail=g; }
    // its lights: one over the middle of the flight (the level under the street's: lit only while that's shown), and a warm lamp over the
    // opening, so the way down is lit from the street
    lamp(MAPG.down,(BW+FX1)/2,8.6,CZ,8,8);
    { const L=lamp(scene,FX1-1.2,13.6,CZ,5,7); L.color.setRGB(1,.92,.78); }
    // where you can't walk at the top: the railing's three sides, the open end free; its two long sides on the level below too
    for(const [L,F] of [[SOL.up,FIX.up],[SOL.down,FIX.down]]){ sol(L,F,BW-.2,FZ0-.22,FX1+.2,FZ0+.18,1.2); sol(L,F,BW-.2,FZ1-.21,FX1+.2,FZ1+.19,1.2); } sol(SOL.up,FIX.up,BW-.2,FZ0-.22,BW+.2,FZ1+.19,1.2); };
}
