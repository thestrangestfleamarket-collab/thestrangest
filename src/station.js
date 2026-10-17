// ---- THE SUBWAY STATION (the game's West End station, 23-w-west-subway-1-station and its placing, 26-zzzzzzzzzzzz-west-subway): its plan,
// sizes and every surface's colours from the game's own code, word for word (WSUB below); here each of its boxes is built in 3D and each face
// painted by the game's painter for that face, 24 texels a tile along the ground and one per art pixel up, as the game paints its pictures ----
const SHL=[], cutWalls=[], lamps=[], trees=[], shopGroups=[]; let night=0, nightTo=0; const C1=new THREE.Color(), C2=new THREE.Color(); function applyTime(){}
const ZU=1/(PPU*Math.cos(Math.PI/6));          // an art pixel up, in world units (the game's verticals, seen at its 30 degrees, as tall as there)
const QS=new URLSearchParams(location.search), LAMPI=+(QS.get("lamp")||8), LAMPD=+(QS.get("decay")||1.6), TILE=33.9/PPU;                            // a tile along the ground, in world units (the Walker's 33.9 art pixels across)
const solids=[], fixed=[];                      // the walker's walls (x0,z0,x1,z1) and the physics' fixed boxes (x0,z0,y0,x1,z1,y1)
let BOUND, groundY;
{ // the game's helpers the station's code asks for (20-projection-layers, 21-world-map; the textures tab at its defaults, so mt is the colour)
  const hash=(a,b,c=0)=>{ let h=(a*374761393+b*668265263+c*2147483647)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const sh=(c,f)=>[Math.min(255,c[0]*f),Math.min(255,c[1]*f),Math.min(255,c[2]*f)], mt=(k,c)=>c, UH=98, ROT=0; let PNAME='';
  const concreteCol=(x,z)=>{ const n=hash(Math.floor(x*24),Math.floor(z*24),97), c=[124,122,116]; return n<.3?sh(c,.93):n>.85?sh(c,1.05):c; };
  const prop=(boxes,_,o)=>({boxes,...o}), sided=b=>b;
/*WSUB*/
  const W=WSUB, {AVE,PLAT,TW,SY0,SY1,END,TUN0,TUN1}=W, T=.25, OX=(AVE+PLAT)/2, OY=W.D1Y, SZ=-UH;
  // the game's ground (x, y in tiles, z in art px from the street, the platform at -98) to the scene: x to x, y to z, up to y
  const X=x=>(x-OX)*TILE, Z=y=>(y-OY)*TILE, Y=z=>(z-SZ)*ZU;
  // a face painted texel by texel: fn(i, j) its colour, null (a hole), or four long (it glows); its colours and its glow as two textures
  const faceTex=(w,h,fn)=>{ w=Math.max(1,Math.round(w)); h=Math.max(1,Math.round(h)); const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'), im=g.createImageData(w,h);
    let ge=null, ie=null, any=false;
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){ const v=fn(i,j), k=(j*w+i)*4; if(!v)continue; im.data[k]=v[0]; im.data[k+1]=v[1]; im.data[k+2]=v[2]; im.data[k+3]=255;
      if(v.length>3){ if(!ie){ const e=document.createElement('canvas'); e.width=w; e.height=h; ge=e; ie=new ImageData(w,h); } ie.data[k]=v[0]; ie.data[k+1]=v[1]; ie.data[k+2]=v[2]; ie.data[k+3]=255; any=true; } }
    g.putImageData(im,0,0); const mk=cv=>{ const t=new THREE.CanvasTexture(cv); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestMipmapNearestFilter; t.colorSpace=THREE.SRGBColorSpace; return t; };
    let em=null; if(any){ ge.getContext('2d').putImageData(ie,0,0); em=mk(ge); } return {map:mk(c),em}; };
  // a quad from four corners (bottom-left, bottom-right, top-right, top-left of its picture)
  // (shadow: it casts one; for now only the Walker does)
  const quad=(a,b,c,d,tx,lit,shadow=false,chara=false)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2)); g.computeVertexNormals();
    const m=chara?new THREE.MeshBasicMaterial({map:tx.map,alphaTest:.5,side:THREE.DoubleSide,color:new THREE.Color(.66,.69,.76)}):lit?new THREE.MeshLambertMaterial({map:tx.map,alphaTest:.5,side:THREE.DoubleSide,...(tx.em?{emissiveMap:tx.em,emissive:0xffffff,emissiveIntensity:1.6}:{})})
      :new THREE.MeshBasicMaterial({map:tx.map,alphaTest:.5,side:THREE.DoubleSide});
    const me=new THREE.Mesh(g,m); me.castShadow=shadow; me.receiveShadow=true; scene.add(me); return me; };
  // ONE OF THE GAME'S BOXES (x, y in tiles, z absolute art px): its top by top(X, Y); its sides by fs(nx, ny, X, Y, z from its foot, shade)
  // when it has one, else fi(Y, z) and fj(X, z) with z from the platform; else its colour. em: it glows (lit by nothing)
  const C=v=>v?(v.length>3?v:v.map(x=>Math.max(0,Math.min(255,Math.round(x))))):null;
  // (faster: the boxes' faces into the batch, one atlas and a few meshes; batch.js)
  const bq=(a,b,c,d,tx,lit,shadow,chara)=>BATCH.add([...a,...b,...c,...a,...c,...d],[0,0,1,0,1,1,0,0,1,1,0,1],tx.map.image,tx.em?tx.em.image:null,chara?'C':lit?'L':'B');
  function gbox(b,dz=0,ox=0,oy=0,chara=false){ const x0=b.x0+ox, x1=b.x1+ox, y0=b.y0+oy, y1=b.y1+oy, z0=b.z0+dz, z1=b.z1+dz, lit=!b.em, k=b.em?2:1, H=(z1-z0)*k;   // (k: a glowing board at the game's half pixels, where its letters are)
    const side=(nx,ny,P,Q,z)=>C(b.fs?b.fs(nx,ny,P-ox,Q-oy,z-z0,nx?.68:.84):nx&&b.fi?b.fi(Q-oy,z-SZ):ny&&b.fj?b.fj(P-ox,z-SZ):b.c);
    for(const nx of [-1,1]){ const x=nx<0?x0:x1; bq([X(x),Y(z0),Z(nx<0?y1:y0)],[X(x),Y(z0),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y1:y0)],
      faceTex((y1-y0)*24*k,H,(i,j)=>{ const t=(i+.5)/((y1-y0)*24*k); return side(nx,0,x,nx<0?y1-t*(y1-y0):y0+t*(y1-y0),z1-(j+.5)/k); }),lit,true,chara); }
    for(const ny of [-1,1]){ const y=ny<0?y0:y1; bq([X(ny<0?x0:x1),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z1),Z(y)],[X(ny<0?x0:x1),Y(z1),Z(y)],
      faceTex((x1-x0)*24*k,H,(i,j)=>{ const t=(i+.5)/((x1-x0)*24*k); return side(0,ny,ny<0?x0+t*(x1-x0):x1-t*(x1-x0),y,z1-(j+.5)/k); }),lit,true,chara); }
    bq([X(x0),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y0)],[X(x0),Y(z1),Z(y0)],
      faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(b.top?b.top(x0+(i+.5)/24-ox,y0+(j+.5)/24-oy):b.c)),lit,true,chara); }
  // a floor (its colour by floorCol(X, Y)) and an upright face along x or y (paint(u, z from the platform), null a hole)
  const floor=(x0,y0,x1,y1,z,col)=>quad([X(x0),Y(z+SZ),Z(y1)],[X(x1),Y(z+SZ),Z(y1)],[X(x1),Y(z+SZ),Z(y0)],[X(x0),Y(z+SZ),Z(y0)],faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y0+(j+.5)/24))),true,false);
  const cutaway=(me,nx,nz,foot)=>{ const pl=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); me.material.clippingPlanes=[pl]; cutWalls.push({pl,nx,nz,foot:Y(foot+SZ),me}); return me; };
  const wallY=(x,y0,y1,z0,z1,paint)=>quad([X(x),Y(z0+SZ),Z(y0)],[X(x),Y(z0+SZ),Z(y1)],[X(x),Y(z1+SZ),Z(y1)],[X(x),Y(z1+SZ),Z(y0)],faceTex((y1-y0)*24,z1-z0,(i,j)=>C(paint(y0+(i+.5)/24,z1-j-.5))),true);
  const wallX=(y,x0,x1,z0,z1,paint)=>quad([X(x0),Y(z0+SZ),Z(y)],[X(x1),Y(z0+SZ),Z(y)],[X(x1),Y(z1+SZ),Z(y)],[X(x0),Y(z1+SZ),Z(y)],faceTex((x1-x0)*24,z1-z0,(i,j)=>C(paint(x0+(i+.5)/24,z1-j-.5))),true);
  const solid=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt+SZ))]); };   // (zt: its top, from the platform)
  const stile=W.wallPaint('stile'), tubeP=W.wallPaint('tubeP'), conc=(u,z)=>sh(concreteCol(u,z/24),.9);
  // THE FLOORS: the platform (on as the exit tunnel), its edge down to the track bed, the track bed through the station and into both tunnels
  floor(AVE,SY0,PLAT,END,0,W.platformCol);
  wallY(PLAT,SY0,SY1,-32,0,(u,z)=>W.platEdge(u,z));
  floor(PLAT,SY0-12,TW,SY1+12,-32,W.tracksCol);
  // THE WALLS: the platform's tiled back wall, the curved track wall with its posters (32 deeper), the tiled wall across the north end, the
  // exit tunnel's concrete, the tunnels' sides; the arched mouths over the track at both ends (holes where the arch is)
  cutaway(wallY(AVE,SY0,END-8,0,UH,(u,z)=>stile(1,0,AVE,u,z)),1,0,8); cutaway(wallY(AVE,END-8,END,0,UH,conc),1,0,8);
  cutaway(wallY(TW,SY0,SY1,-32,UH,(u,z)=>tubeP(-1,0,TW,u,z)),-1,0,-24);
  cutaway(wallX(SY0,AVE,PLAT,0,UH,(u,z)=>stile(0,1,u,SY0,z)),0,1,8); cutaway(wallX(END,AVE,PLAT,0,UH,conc),0,-1,8); cutaway(wallY(PLAT,SY1,END,0,UH,conc),-1,0,8);
  const c0=(TUN0+TUN1)/2, half=(TUN1-TUN0)/2, inArch=(u,z)=>{ const d=Math.abs(u-c0)/half; return d<1&&z+32<40+88*Math.sqrt(1-d*d); };
  for(const y of [SY0,SY1])cutaway(wallX(y,PLAT,TW+2*T,-32,UH,(u,z)=>inArch(u,z)?null:stile(0,y===SY0?1:-1,u,y,z)),0,y===SY0?1:-1,-24);
  for(const [a,b] of [[SY0-12,SY0],[SY1,SY1+12]])for(const x of [TUN0,TUN1])cutaway(wallY(x,a,b,-32,56,conc),x===TUN0?1:-1,0,-24);
  // THE STATION'S THINGS, where the game places them: the steps from the track up to the platform, the two columns with their cameras and
  // LED boards, four benches, TO STREET over the exit tunnel, a red signal in each tunnel mouth
  for(const [a,b] of W.TSTEPS)for(let k=0;k<3;k++){ const c=[150,146,138]; gbox({x0:PLAT+k*.25,x1:PLAT+(k+1)*.25,y0:a,y1:b,z0:-UH-32,z1:-UH-8*(k+1),c,top:()=>c,fi:()=>sh(c,.62),fj:()=>sh(c,.8)}); }
  for(const a of [7.14,17.53]){ const p=W.column(TW-8.03,SY0+a); p.boxes.forEach(b=>gbox(b)); solid(TW-8.03,SY0+a,TW-8.03+.7,SY0+a+.7,UH); }
  for(const a of [3.46,8.83,13.7,19.3]){ const x=TW-7.72-.33, p=W.bench(x,SY0+a); p.boxes.forEach(b=>gbox(b)); solid(x,SY0+a,x+.66,SY0+a+2.8,24); }
  W.litSign(AVE+3,SY1-.9,'TO STREET ^').boxes.forEach(b=>gbox(b,-UH));
  W.signal(TUN0+.35,SY0-1.4,1).boxes.forEach(b=>gbox(b,-UH-32)); W.signal(TUN0+.35,SY1+1.4,0).boxes.forEach(b=>gbox(b,-UH-32));
  // THE TRAIN at its stop, doors shut: the game's car, box by box (its boxes along y round its middle, z from the track bed)
  W.carBoxes(0,0).forEach(b=>gbox(b,-UH-32,W.TRACKS[0],W.D1Y,true));   // (lit like a character at the stop, as the game lights it: never brighter than its own colours) solid(W.TRACKS[0]-W.CARW,W.D1Y-W.CARL/2,W.TRACKS[0]+W.CARW,W.D1Y+W.CARL/2,96-32);
  // THE LIGHTS, as the game lights it: dim cool white over the platform and over its track, every 6.4 tiles (LAMPS, 10 tiles' reach)
  for(let y=SY0+3.2;y<SY1;y+=6.4)for(const x of [AVE+2.6,AVE+8.4]){ const L=new THREE.PointLight(new THREE.Color(.5,.54,.64),LAMPI,10*TILE,LAMPD); L.position.set(X(x),Y(SZ+88),Z(y)); scene.add(L); lamps.push(L); }
  // HIS SHADOWS: the two lamps nearest him cast them (two shadow-casting lights stand in for those lamps, moved to them as he walks), hard-edged as pixels
  SHL.push(...[0,1].map(()=>{ const L=new THREE.PointLight(lamps[0].color,LAMPI,10*TILE,LAMPD); L.castShadow=true; L.shadow.mapSize.set(512,512); L.shadow.camera.near=0.1; L.shadow.camera.far=14; L.shadow.bias=-0.003; scene.add(L); return L; }));
  // where he can walk: the platform and the exit tunnel; down the steps onto the track and along it into the tunnels; never through a wall
  solid(AVE-1,SY0-12,AVE,END,UH); solid(TW,SY0-12,TW+1,SY1+12,UH); solid(AVE,SY0-1,PLAT,SY0,UH); solid(AVE,END,PLAT,END+1,UH);
  solid(PLAT,SY1,PLAT+.1,END,UH); solid(TUN0-1,SY0-12,TUN0,SY0,UH); solid(TUN0-1,SY1,TUN0,SY1+12,UH);
  { let y=SY0; for(const [a,b] of W.TSTEPS){ if(a>y)solid(PLAT-.05,y,PLAT+.05,a,0); y=b; } if(y<SY1)solid(PLAT-.05,y,PLAT+.05,SY1,0); }   // the platform's edge, but at the steps
  BOUND={x0:X(AVE),x1:X(TW),z0:Z(SY0-12),z1:Z(END)};
  BATCH.build((k,map,emap)=>k==='C'?new THREE.MeshBasicMaterial({map,alphaTest:.5,side:THREE.DoubleSide,color:new THREE.Color(.66,.69,.76)}):k==='B'?new THREE.MeshBasicMaterial({map,alphaTest:.5,side:THREE.DoubleSide})
    :new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.6}:{})}));
  groundY=(x,z)=>{ const gx=x/TILE+OX, gy=z/TILE+OY; if(gx<PLAT)return 0; const st=W.TSTEPS.find(([a,b])=>gy>=a&&gy<b); if(st&&gx<PLAT+.75)return -(8*(1+Math.floor((gx-PLAT)/.25)))*ZU; return -32*ZU; };
}
scene.background=new THREE.Color(0x050507);
scene.add(new THREE.HemisphereLight(0x8a93a8,0x1a1814,+(new URLSearchParams(location.search).get('amb')||0.1)));
