// ---- THE POOL ROOM (the game's, 21-world-map-6-pool, 23-w-deep-water-5-pool, 26-gym, 47-pool): the hall 22.7 x 14 tiles and 150 art px high,
// its deck of grey half-tiles, white tiled walls with a blue band at their foot; the basin 13 x 5 tiles sunk in the deck, deep (some 4 m) at its
// west end, a slope, the shallow end and its three steps up, the lanes' dark lines on its floor; two ladders on each long side; lit only by the
// water's seven blue-white lamps in the basin's walls and a warm night light on each wall. The water itself: water3d below ----
const SHL=[], cutWalls=[], lamps=[], trees=[], shopGroups=[]; let night=0, nightTo=0; const C1=new THREE.Color(), C2=new THREE.Color(); function applyTime(){}
const ZU=1/(PPU*Math.cos(Math.PI/6)), QS=new URLSearchParams(location.search), LAMPI=1, LAMPD=1.6, TILE=33.9/PPU;
const solids=[], fixed=[]; let BOUND, groundY;
const POOLR={x0:0,y0:0,x1:22.74,y1:14,H:150}; Object.assign(POOLR,{bx0:3.5,by0:2+2.5,bx1:16.5,by1:7+2.5,HT:5});   // (the basin as the game has it, the room's middle across)
POOLR.LX=POOLR.bx1-POOLR.bx0; POOLR.LY=POOLR.by1-POOLR.by0; POOLR.level=-0.16*24;   // the water 4 art px under the deck
{ const hash=(a,b,c=0)=>{ let h=(a*374761393+b*668265263+c*2147483647)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const sh=(c,f)=>[Math.min(255,c[0]*f),Math.min(255,c[1]*f),Math.min(255,c[2]*f)];
  const P=POOLR, OX=(P.x0+P.x1)/2, OY=(P.y0+P.y1)/2;
  const X=x=>(x-OX)*TILE, Z=y=>(y-OY)*TILE, Y=z=>z*ZU; POOLR.X=X; POOLR.Z=Z; POOLR.Y=Y;
  const faceTex=(w,h,fn)=>{ w=Math.max(1,Math.round(w)); h=Math.max(1,Math.round(h)); const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'), im=g.createImageData(w,h);
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){ const v=fn(i,j), k=(j*w+i)*4; if(!v)continue; im.data[k]=v[0]; im.data[k+1]=v[1]; im.data[k+2]=v[2]; im.data[k+3]=255; }
    g.putImageData(im,0,0); const t=new THREE.CanvasTexture(c); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestMipmapNearestFilter; t.colorSpace=THREE.SRGBColorSpace; return {map:t}; };
  const mat=(tx,basin)=>{ const m=new THREE.MeshLambertMaterial({map:tx.map,alphaTest:.5,side:THREE.DoubleSide}); if(basin)WATER.caustic(m); return m; };
  const quad=(a,b,c,d,tx,basin)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2)); g.computeVertexNormals(); const me=new THREE.Mesh(g,mat(tx,basin)); me.receiveShadow=true; scene.add(me); return me; };
  const C=v=>v?v.map(x=>Math.max(0,Math.min(255,Math.round(x)))):null;
  const floor=(x0,y0,x1,y1,z,col)=>quad([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y0+(j+.5)/24))));
  const bq=(a,b,c,d,tx,basin)=>BATCH.add([...a,...b,...c,...a,...c,...d],[0,0,1,0,1,1,0,0,1,1,0,1],tx.map.image,null,basin?'K':'L');   // (faster: into the batch, batch.js)
  const wallY=(x,y0,y1,z0,z1,paint,basin)=>(basin?bq:quad)([X(x),Y(z0),Z(y0)],[X(x),Y(z0),Z(y1)],[X(x),Y(z1),Z(y1)],[X(x),Y(z1),Z(y0)],faceTex((y1-y0)*24,z1-z0,(i,j)=>C(paint(y0+(i+.5)/24,z1-j-.5))),basin);
  const wallX=(y,x0,x1,z0,z1,paint,basin)=>(basin?bq:quad)([X(x0),Y(z0),Z(y)],[X(x1),Y(z0),Z(y)],[X(x1),Y(z1),Z(y)],[X(x0),Y(z1),Z(y)],faceTex((x1-x0)*24,z1-z0,(i,j)=>C(paint(x0+(i+.5)/24,z1-j-.5))),basin);
  const cutaway=(me,nx,nz,foot)=>{ const pl=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); me.material.clippingPlanes=[pl]; cutWalls.push({pl,nx,nz,foot:Y(foot),me}); return me; };
  const solid=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
  // the game's colours: the deck (poolDeckCol: half-tile slabs, a thin joint, a light stone coping round the water), the walls (poolTile: white
  // tiles 6 art px, a blue band along the foot), the basin's tiles (white, the lanes' dark lines and the T's at their ends, the steps' nosing, the band at the waterline)
  const deckCol=(x,y)=>{ const e=Math.max(P.bx0-x,x-P.bx1,P.by0-y,y-P.by1); if(e<0)return null; if(e<.32)return e<.05?[120,124,122]:[214,210,198];
    const i=Math.floor(x*2), j=Math.floor(y*2), g=x*2-i<.05||y*2-j<.05; return g?[104,112,116]:[150,160,164]; };
  const PTW=[232,238,238], PTB=[62,112,164];
  const poolTile=(a,z,f=1)=>{ const k=Math.floor(a*8), c=z<14?PTB:PTW; if(z%6<1||a*8-k<.12)return sh(z<14?[40,70,104]:[150,158,160],f); return sh(c,f); };
  const LX=P.LX, LY=P.LY, HT=P.HT, zs=HT-1.16, sx0=LX*0.36, sx1=LX*0.6, st0=LX-1.5;
  const bedP=a=>a<sx0?0.04:a<sx1?0.04+(zs-0.04)*(1-Math.cos(Math.PI*(a-sx0)/(sx1-sx0)))/2:a<st0?zs:zs+(HT-zs)*Math.min(3,1+Math.floor((a-st0)/0.5))/4;
  POOLR.bedAt=a=>-(HT-bedP(Math.max(0,Math.min(LX,a))))*24;   // the floor under the water, art px from the deck
  const L1=LY/4, L2=LY/2, L3=LY*3/4, near=(b,r)=>Math.abs(b-L1)<r||Math.abs(b-L2)<r||Math.abs(b-L3)<r;
  const TILEC=[204,230,237], LANE=[26,46,87], NOSE=[51,77,128], BAND=[31,69,140];
  const bedTile=(a,b)=>{ const lane=a>0.6&&a<st0-0.3&&near(b,0.1), tee=(Math.abs(a-0.75)<0.07||Math.abs(a-st0+0.45)<0.07)&&near(b,0.35);
    return lane||tee?LANE:a>=st0&&Math.abs(((a-st0)%0.5)-0.04)<0.05?NOSE:TILEC; };
  const basinWall=(u,z)=>{ const k=Math.floor(u*5), g=u*5-k<.06||((z/24)*5)%1<.06; return z>-14?BAND:g?[172,196,204]:TILEC; };
  // THE DECK, a hole where the water is; THE ROOM'S WALLS, tiled, cut down to their foot when they stand between you and the camera
  floor(P.x0,P.y0,P.x1,P.y1,0,deckCol);
  cutaway(wallY(P.x0,P.y0,P.y1,0,P.H,(u,z)=>poolTile(u,z)),1,0,10); cutaway(wallY(P.x1,P.y0,P.y1,0,P.H,(u,z)=>poolTile(u,z)),-1,0,10);
  cutaway(wallX(P.y0,P.x0,P.x1,0,P.H,(u,z)=>poolTile(u,z)),0,1,10); cutaway(wallX(P.y1,P.x0,P.x1,0,P.H,(u,z)=>poolTile(u,z)),0,-1,10);
  // THE BASIN: its floor (deep, the slope, the shallow end, the steps) as one sheet bent to the bed, and its four walls down to it
  { const NA=Math.round(LX*20), g=new THREE.PlaneGeometry(1,1,NA,1), p=g.attributes.position, uv=g.attributes.uv;
    for(let i=0;i<p.count;i++){ const u=uv.getX(i), v=uv.getY(i), a=u*LX, b=(1-v)*LY; p.setXYZ(i,X(P.bx0+a),Y(POOLR.bedAt(a)),Z(P.by0+b)); }
    g.computeVertexNormals(); const tx=faceTex(LX*24,LY*24,(i,j)=>C(bedTile((i+.5)/24,(j+.5)/24))); tx.map.flipY=true;
    const m=new THREE.Mesh(g,mat(tx,true)); m.receiveShadow=true; scene.add(m); }
  const wallDeep=(a0,a1,side)=>{ for(let a=a0;a<a1-1e-6;a+=0.25){ const b=Math.min(a1,a+0.25), z0=Math.min(POOLR.bedAt(a),POOLR.bedAt(b));   // (in strips a quarter tile wide, down to the bed under each)
      wallX(side?P.by1:P.by0,P.bx0+a,P.bx0+b,z0,0,(u,z)=>basinWall(u,z),true); } };
  wallDeep(0,LX,0); wallDeep(0,LX,1);
  wallY(P.bx0,P.by0,P.by1,POOLR.bedAt(0),0,(u,z)=>basinWall(u,z),true); wallY(P.bx1,P.by0,P.by1,-2,0,(u,z)=>basinWall(u,z),true);
  // THE LADDERS (26-gym's poolLadder: two steel rails curving over the coping, rungs down into the water), two on each long side
  const steel=new THREE.MeshLambertMaterial({color:0xc8d2d8}); const bars=[], bar=(x0,y0,z0,x1,y1,z1)=>{ const g=new THREE.BoxGeometry(Math.abs(X(x1)-X(x0))||0.04,Math.abs(Y(z1)-Y(z0))||0.04,Math.abs(Z(y1)-Z(y0))||0.04).toNonIndexed(); g.translate((X(x0)+X(x1))/2,(Y(z0)+Y(z1))/2,(Z(y0)+Z(y1))/2); bars.push(g); };
  for(const x of [P.bx0+4.5,P.bx0+9.5])for(const [y,s] of [[P.by0,1],[P.by1,-1]]){ for(const dx of [-0.3,0.3]){ bar(x+dx,y-s*0.35,0,x+dx,y-s*0.35,30); bar(x+dx,y-s*0.35,30,x+dx,y+s*0.12,30); bar(x+dx,y+s*0.12,-40,x+dx,y+s*0.12,30); }
    for(const z of [-36,-24,-12])bar(x-0.3,y+s*0.12,z,x+0.3,y+s*0.12,z); solid(x-0.35,y-s*0.4-0.05,x+0.35,y-s*0.3+0.05,30); }
  { const P2=new Float32Array(bars.reduce((a,g)=>a+g.attributes.position.array.length,0)), N2=new Float32Array(P2.length); let o=0; for(const g of bars){ P2.set(g.attributes.position.array,o); N2.set(g.attributes.normal.array,o); o+=g.attributes.position.array.length; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P2,3)); g.setAttribute('normal',new THREE.BufferAttribute(N2,3)); const m=new THREE.Mesh(g,steel); m.castShadow=true; scene.add(m); }   // (all the ladders' bars, one mesh)
  // THE LIGHTS: the water's lamps, blue-white, set in the basin's long walls (a tile and seven tenths up from the deep end's floor) and its deep end;
  // a warm night light low on each of the room's walls (26-gym's poolNight: a small glow, two and a half tiles' reach)
  const lampDisc=(x,y,z)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.12,0.18),new THREE.MeshBasicMaterial({color:0xcfe8ff})); m.position.set(X(x),Y(z),Z(y)); scene.add(m); };
  const lz=-(HT-0.04-1.7)*24;
  for(const a of [2,5,8])for(const b of [0,LY]){ const L=new THREE.PointLight(new THREE.Color(.32,.68,1),+(QS.get('wl')||3.2),8*TILE,1.4); L.position.set(X(P.bx0+a),Y(lz),Z(P.by0+b+(b?-0.15:0.15))); L.userData.i0=L.intensity; scene.add(L); lamps.push(L); lampDisc(P.bx0+a,P.by0+b+(b?-0.02:0.02),lz); }
  { const L=new THREE.PointLight(new THREE.Color(.32,.68,1),+(QS.get('wl')||3.2),8*TILE,1.4); L.position.set(X(P.bx0+0.15),Y(-(HT-0.04-1.4)*24),Z(P.by0+LY/2)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L); }
  const night=(x,y,n)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.1,0.14),new THREE.MeshBasicMaterial({color:0xffd9a8})); m.position.set(X(x+n[0]*.06),Y(15),Z(y+n[1]*.06)); scene.add(m);
    const L=new THREE.PointLight(new THREE.Color(1,.72,.42),+(QS.get('nl')||1.6),2.4*TILE*1.8,1.6); L.position.set(X(x+n[0]*.3),Y(15),Z(y+n[1]*.3)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L); };
  const t=.06; night(P.x0+9,P.y1-t,[0,-1]); night(P.x0+3,P.y0+t,[0,1]); night(P.x0+t,P.y0+1,[1,0]); night(P.x1-t,P.y1-3,[-1,0]);
  // HIS SHADOWS: two shadow-casting stand-ins for the two lamps nearest him (lamps' own colour and strength copied as he moves)
  SHL.push(...[0,1].map(()=>{ const L=new THREE.PointLight(0xffffff,0,8*TILE,1.4); L.castShadow=true; L.shadow.mapSize.set(512,512); L.shadow.camera.near=0.1; L.shadow.camera.far=14; L.shadow.bias=-0.003; scene.add(L); return L; }));
  // where he walks: the deck and the room's walls; the water is walked into (the rig's water takes him from there)
  solid(P.x0-1,P.y0,P.x0,P.y1,P.H); solid(P.x1,P.y0,P.x1+1,P.y1,P.H); solid(P.x0,P.y0-1,P.x1,P.y0,P.H); solid(P.x0,P.y1,P.x1,P.y1+1,P.H);
  BOUND={x0:X(P.x0)+0.3,x1:X(P.x1)-0.3,z0:Z(P.y0)+0.3,z1:Z(P.y1)-0.3};
  groundY=()=>0;   // (the deck; in the basin the rig's own floor and water carry him down: its floor under him, its water's level)
  BATCH.build((k,map)=>{ const m=new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide}); if(k==='K')WATER.caustic(m); return m; });
  POOLR.inBasin=(x,z)=>{ const gx=x/TILE+OX-P.bx0, gy=z/TILE+OY-P.by0; return gx>0&&gx<LX&&gy>0&&gy<LY?[gx,gy]:null; };
}
scene.background=new THREE.Color(0x05070b);
scene.add(new THREE.HemisphereLight(0x5a6e88,0x10141a,+(QS.get('amb')||0.08)));
