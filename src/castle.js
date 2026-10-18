// ---- THE CASTLE AND ITS DUNGEON (owner, 17 Oct 2026: "lets bring back ... the castle, the dungeon under the castle (only 1 level)"; "expand
// central park but the castle on the left back end"): the old game's castle (its stone and its pieces, 23-w-dungeon-3-castle-1-stone and
// -2-pieces, embedded by build.py word for word: BOD.KC) in the park's back-left corner, set out as the old game set it (26-zzzzzzzzzzzzzzz-castle):
// the curtain wall in lengths between four drum towers, the gatehouse between its two drums in the front wall (toward the street), the bailey's
// grass inside, the gravel from the gate to the stairwell, its rim, the well. UNDER THE BAILEY, at the subway's depth, ONE DUNGEON: the old
// castle's great hall, its room dressed by the dungeon's own painters (23-w-dungeon-1-room: the stone in courses, the torches' soot, chains, the
// mice's holes, webs, banners, ivy, cracks; the cobbled floor, its drain), its things from the dungeon's catalog (23-w-dungeon-2-things: the
// arcade of three round arches, two columns, the brazier, barrels, crates, straw, bones, skulls), reached by twelve steps down from the bailey
// as the subway's stairs go down from the sidewalk. The torches' flames are live ones (fire.js), each a flickering warm light (the game's moving
// pictures don't run); the mice and the dust in the air (moving pictures) are left out. Underground only the dungeon and the station are drawn ----
// a box of the game's painted in the street's frame (as gbox, bodega.js, but at the street's own size, not the buildings' tenth bigger; dy lifts
// it to the dungeon's depth)
// (ys: its height squeezed, the castle's half: each side's picture half as many rows, each row a strip of two of the painter's, so its pixels stay square)
const gboxS=(b,kind='L',dy=0,ys=1)=>{ const X=BOD.XS, Z=BOD.ZS, Y=z=>BOD.YS(z*ys)+dy, {faceTex,bq,C}=BOD, {x0,x1,y0,y1,z0,z1}=b; if(b.foot&&z1-z0<.05)return; const k=(b.em?2:1)*ys, H=Math.max(1,Math.round((z1-z0)*k));
  if(b.em&&kind==='L')kind='B';
  const side=(nx,ny,P,Q,z)=>C(b.fs?b.fs(nx,ny,P,Q,z-z0,nx?.68:.84):nx&&b.fi?b.fi(Q,z):ny&&b.fj?b.fj(P,z):b.c);
  if(z1-z0>=.5){
    for(const nx of [-1,1]){ const x=nx<0?x0:x1; if(y1-y0<.004)continue; bq([X(x),Y(z0),Z(nx<0?y1:y0)],[X(x),Y(z0),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y1:y0)],
      faceTex((y1-y0)*24*k,H,(i,j)=>{ const t=(i+.5)/((y1-y0)*24*k); return side(nx,0,x,nx<0?y1-t*(y1-y0):y0+t*(y1-y0),z1-(j+.5)/k); }),kind); }
    for(const ny of [-1,1]){ const y=ny<0?y0:y1; if(x1-x0<.004)continue; bq([X(ny<0?x0:x1),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z1),Z(y)],[X(ny<0?x0:x1),Y(z1),Z(y)],
      faceTex((x1-x0)*24*k,H,(i,j)=>{ const t=(i+.5)/((x1-x0)*24*k); return side(0,ny,ny<0?x0+t*(x1-x0):x1-t*(x1-x0),y,z1-(j+.5)/k); }),kind); } }
  if(x1-x0>.004&&y1-y0>.004)bq([X(x0),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y0)],[X(x0),Y(z1),Z(y0)],
    faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(b.top?b.top(x0+(i+.5)/24,y0+(j+.5)/24):b.c)),kind); };
const castleMat=(k,map,emap,pl)=>new THREE.MeshLambertMaterial({map,emissiveMap:emap||null,emissive:emap?new THREE.Color(1,1,1):new THREE.Color(0,0,0),alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:pl?[pl]:[]});
// where a thing stands solid: its own solids, else its footprint (base: the level's floor)
const castleSolid=(lv,p,base,ys=1)=>{ const X=BOD.XS, Z=BOD.ZS, Y=z=>BOD.YS(z*ys); if(p.walk)return; const h=Math.max(...p.boxes.map(b=>b.z1));
  for(const s of p.solids||[p]){ SOL[lv].push([X(s.x0),Z(s.y0),X(s.x1),Z(s.y1)]); FIX[lv].push([X(s.x0),Z(s.y0),base,X(s.x1),Z(s.y1),base+Math.max(.05,Y(h))]); } };
// ---- THE CASTLE on the park's lawn
// HALF HEIGHT (owner, 18 Oct 2026: "the castle should be half height. it is for the woodlan creatuers who live here, not normal size charaters"):
// its footprint as it was, every piece built at half its height (CYS: the curtain, the drums, the gatehouse and its arch, the rim, the well), its
// solids with it; the stair down and the dungeon under it as they were. ITS WALLS FALL TO THEIR FOOT WHEN YOU'RE IN THE BAILEY (owner: "same rulse
// apply for the castle, when you walk in the walls fall at bottom so you can see yuorself"): each side's pieces (its curtain, its drums, the
// gatehouse with the front) a mesh of its own, cut to its foot as the bodega's walls are while you're half a tile inside the bailey
const CYS=.5;
grab('castle',()=>{ const K=BOD.KC, KP=BOD.K.PROPS, X=BOD.XS, Z=BOD.ZS, Y=BOD.YS, [bx0,bx1,by0,by1]=CASTLE.b, H=200, r=1.4, gx=CASTLE.gate, wy=by0, S=CASTLE.stair, n0=KP.length;
  const run=(a,b,fn)=>{ const n=Math.max(1,Math.round((b-a)/4)), s=(b-a)/n; for(let i=0;i<n;i++)fn(a+i*s,a+(i+1)*s); };
  run(bx0+r,bx1-r,(a,b)=>K.KMK.curtain(a,by1,b,by1,H,'y+')); run(by0+r,by1-r,(a,b)=>K.KMK.curtain(bx0,a,bx0,b,H,'x-')); run(by0+r,by1-r,(a,b)=>K.KMK.curtain(bx1,a,bx1,b,H,'x+'));
  run(bx0+r,gx-3.1,(a,b)=>K.KMK.curtain(a,wy,b,wy,H,'y-')); run(gx+3.1,bx1-r,(a,b)=>K.KMK.curtain(a,wy,b,wy,H,'y-'));
  [[bx0,by0],[bx1,by0],[bx0,by1],[bx1,by1]].forEach(([x,y],i)=>K.KMK.drum(x,y,r,270,i));
  K.KMK.drum(gx-2,wy-.25,1.1,290,4); K.KMK.drum(gx+2,wy-.25,1.1,290,5); K.KMK.gate(gx,wy,250);
  // the stairwell's rim (open at its front, the way in from the gate), the gravel from the gate to it, the well
  K.KMK.rim(S.x0-.3,S.y1,S.x1+.3,S.y1+.3); K.KMK.rim(S.x0-.3,S.y0,S.x0,S.y1); K.KMK.rim(S.x1,S.y0,S.x1+.3,S.y1);
  K.KMK.gravel(gx-.65,wy+.6,S.x1+.6,S.y0-.2); K.KMK.gravel(gx-.65,wy-.3,gx+.65,wy+.6); K.KMK.well(bx1-3,by1-4);   /* (east of the stairwell: the keep stands in the bailey's west half, store.js) */
  const made=KP.slice(n0); BATCH.cast=true;
  // (each piece to its side by where it stands: the nearest of the four walls' lines within a drum's reach, else the bailey's own, never cut)
  const SIDE={f:[0,1],b:[0,-1],w:[1,0],e:[-1,0]}, PL={}, sideOf=p=>{ const bs=p.boxes; if(!bs.length)return 'L'; const cx=(Math.min(...bs.map(b=>b.x0))+Math.max(...bs.map(b=>b.x1)))/2, cy=(Math.min(...bs.map(b=>b.y0))+Math.max(...bs.map(b=>b.y1)))/2;
    const d={f:Math.abs(cy-by0),b:Math.abs(cy-by1),w:Math.abs(cx-bx0),e:Math.abs(cx-bx1)}; let k=null; for(const s in d)if(d[s]<r+.8&&(!k||d[s]<d[k]))k=s; return k?'K'+k:'L'; };
  for(const p of made){ BATCH.tag=OBJ('castle',p.name); const kd=sideOf(p); if(kd!=='L'&&!PL[kd])PL[kd]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); for(const b of p.boxes)gboxS(b,kd,0,CYS); } BATCH.tag=null;
  BATCH.build((k,map,emap)=>castleMat(k,map,emap,PL[k])); BATCH.cast=false;
  { const M=BATCH.meshes||{}, m=.5*TILE, inB=()=>LVL==='up'&&pos.x>X(bx0)+m&&pos.x<X(bx1)-m&&pos.z>Z(by0)+m&&pos.z<Z(by1)-m; MODS.castleIn=inB;
    for(const k in PL)for(const me of BATCH.all(M,k)){ const s=SIDE[k[1]]; cutWalls.push({pl:PL[k],nx:s[0],nz:s[1],foot:Y(6),me,when:inB}); } BATCH.meshes={}; }
  for(const p of made)castleSolid('up',p,0,CYS);
  MODS.castle={BOUND:{x0:X(bx0-r),x1:X(bx1+r),z0:Z(by0-r),z1:Z(by1+r)}}; });
// ---- THE STAIR DOWN: twelve steps from the bailey to the hall (as the subway's, map-post.js, but descending toward the park's back), its side
// walls (both levels), a lamp over it; seen from both levels, cut down to your feet while you're on it
grab('castlestairs',()=>{ const X=BOD.XS, Z=BOD.ZS, Y=BOD.YS, S=CASTLE.stair, sd=STN.DY, n=S.steps, rise=S.depth/n, rn=(S.y1-S.y0)/n, P=[], Cc=[], c3=new THREE.Color();
  const quad=(a,b,c,d,col)=>{ c3.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(const v of [a,b,c,a,c,d]){ P.push(...v); Cc.push(c3.r,c3.g,c3.b); } };
  const box=(x0,y0,z0,x1,y1,z1,col)=>{ const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[Y(z0),Y(z1)], dk=col.map(v=>v*.8), lt=col.map(v=>Math.min(255,v*1.08));
    quad([a,f,d],[b,f,d],[b,f,c],[a,f,c],lt); quad([a,e,d],[b,e,d],[b,f,d],[a,f,d],col); quad([b,e,c],[a,e,c],[a,f,c],[b,f,c],col); quad([a,e,c],[a,e,d],[a,f,d],[a,f,c],dk); quad([b,e,d],[b,e,c],[b,f,c],[b,f,d],dk); };
  const ST=[88,84,78], ST2=[74,70,66];
  for(let k=0;k<n;k++){ const yA=S.y0+k*rn, yB=S.y0+(k+1)*rn, zt=-(k+1)*rise, zr=-k*rise, [a,b]=[X(S.x0),X(S.x1)];
    quad([a,Y(zt),Z(yB)],[b,Y(zt),Z(yB)],[b,Y(zt),Z(yA)],[a,Y(zt),Z(yA)],(k&1)?ST:ST2);                    // the tread
    quad([b,Y(zt),Z(yA)],[a,Y(zt),Z(yA)],[a,Y(zr),Z(yA)],[b,Y(zr),Z(yA)],ST2.map(v=>v*.82)); }            // the riser, facing the gate
  for(const x of [S.x0-.2,S.x1])box(x,S.y0,-S.depth,x+.2,S.y1,0,ST2);                                     // the side walls, the hall's floor to the bailey
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.computeVertexNormals();
  MODS.castleStairCut=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
  const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,clippingPlanes:[MODS.castleStairCut]})); m.receiveShadow=true; m.castShadow=true; scene.add(m);
  for(const lv of ['up','down'])for(const x of [S.x0-.2,S.x1]){ const base=lv==='down'?sd:0; SOL[lv].push([X(x),Z(S.y0),X(x+.2),Z(S.y1)]); FIX[lv].push([X(x),Z(S.y0),base,X(x+.2),Z(S.y1),base+Y(lv==='down'?98:30)]); }
  const L=new THREE.PointLight(new THREE.Color(1,.82,.58),5,7*TILE,1.6); L.position.set(X((S.x0+S.x1)/2),Y(-44),Z((S.y0+S.y1)/2)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L); });
// ---- THE DUNGEON: the great hall under the bailey
grab('dungeon',()=>{ const K=BOD.KC, KP=BOD.K.PROPS, Kc=K.CATALOG, X=BOD.XS, Z=BOD.ZS, Y=BOD.YS, {faceTex,bq,C}=BOD, {hash}=BOD.g, D=K.DGN, B=D.b, dy=STN.DY, T=.1, n0=KP.length, l0=K.LAMPS.length;
  // the walls: four boxes whose faces the dungeon paints by their normal and place (dungeonWall); the floor its cobbles (dungeonFloorCol)
  const wall=(x0,y0,x1,y1)=>({x0,y0,x1,y1,z0:0,z1:D.H+4,c:K.DGP.st[1],top:()=>K.DGP.lo,fs:(nx,ny,Xp,Yp,z,k)=>K.dungeonWall(null,nx,ny,Xp,Yp,z,k,D)});
  const WB=[wall(B.x0-T,B.y0-T,B.x1+T,B.y0+T),wall(B.x0-T,B.y1-T,B.x1+T,B.y1+T),wall(B.x0-T,B.y0+T,B.x0+T,B.y1-T),wall(B.x1-T,B.y0+T,B.x1+T,B.y1-T)];
  bq([X(D.x0),Y(.3)+dy,Z(D.y1)],[X(D.x1),Y(.3)+dy,Z(D.y1)],[X(D.x1),Y(.3)+dy,Z(D.y0)],[X(D.x0),Y(.3)+dy,Z(D.y0)],faceTex((D.x1-D.x0)*24,(D.y1-D.y0)*24,(i,j)=>C(K.dungeonFloorCol(D.x0+(i+.5)/24,D.y0+(j+.5)/24,D))),'L');
  // what stands in it: the old great hall's things at the same places in this room (26-zzzzzzzzzzzzzzz-castle), the torches where the walls paint for them
  const ox=D.x0, oy=D.y0, w=.8, ar=[3,7,11].map(v=>ox+v), ay=oy+7.8, arch=ar.map(x=>[x,84,w*24]);
  { let a=D.x0; for(const x of ar){ K.KMK.dblock(a,ay-.2,x-w,ay+.2,0,126,arch); a=x+w; } K.KMK.dblock(a,ay-.2,D.x1,ay+.2,0,126,arch); for(const x of ar)K.KMK.dblock(x-w,ay-.2,x+w,ay+.2,84,126,arch,true); }
  for(const [x,y] of [[3,2.8],[9.6,2.8]])Kc['stone column'](ox+x,oy+y); Kc['brazier'](ox+8.2,oy+8.6);
  for(const [x,y] of [[5.2,12.2],[5.9,12.2],[5.5,11.5]])Kc['oak barrel'](ox+x,oy+y); for(const [x,y] of [[13.3,12.5],[13.3,11.7],[12.5,12.5]])Kc['crate'](ox+x,oy+y);
  Kc['straw'](ox+4.1,oy+9.6); Kc['bones'](ox+9.1,oy+9.4); Kc['skull'](ox+.8,oy+.6); Kc['bone pile'](ox+.5,oy+4.2);
  for(const t of D.torches){ const [x,y]=t.w==='b'?[D.x0+t.u,D.y0+.16]:t.w==='f'?[D.x0+t.u,D.y1-.16]:t.w==='l'?[D.x0+.16,D.y0+t.u]:[D.x1-.16,D.y0+t.u]; Kc['wall torch'](x,y,t.w); }
  const made=KP.slice(n0); BATCH.cast=true; BATCH.tag=OBJ('dungeon','the hall'); for(const b of WB)gboxS(b,'L',dy);
  for(const p of made){ BATCH.tag=OBJ('dungeon',p.name); for(const b of p.boxes)gboxS(b,'L',dy); } BATCH.tag=null;
  BATCH.build(castleMat); BATCH.cast=false;
  for(const b of WB){ SOL.down.push([X(b.x0),Z(b.y0),X(b.x1),Z(b.y1)]); FIX.down.push([X(b.x0),Z(b.y0),dy,X(b.x1),Z(b.y1),dy+Y(D.H)]); }
  for(const p of made)castleSolid('down',p,dy);
  // THE LIGHTS: the torches' and the brazier's (live flames over the torches' heads and on the coals, embers and smoke going up: fire.js; each
  // light flickering with its flame), and the hall's own cool light (the game's LAMPS, as the dungeon's catalog made them); twice the dojo's
  // candles: the old game counted lamps twice (docs/OLD-LOOK.md), and the stone is dark
  const LF=[];
  const light=l=>{ const cm=Math.max(...l.c), L=new THREE.PointLight(new THREE.Color(l.c[0]/cm,l.c[1]/cm,l.c[2]/cm),22*cm*Math.min(1.2,l.r/5),l.r*TILE*1.4,1.6); L.position.set(X(l.x),Y(l.z)+dy,Z(l.y)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L); return L; };
  for(const l of K.LAMPS.slice(l0)){ const L=light(l); if(l.flick)LF.push(L); }
  FLAME.props(made,X,z=>Y(z)+dy,Z,LF);
  light({x:D.cx,y:D.cy,z:70,r:11,c:[.4,.46,.6]});   // (the torches and the fill brighter, owner 17 Oct 2026 "fix": the hall was near black)
  MODS.dungeon={B,ground:()=>dy,inside:(x,z)=>x>X(B.x0)&&x<X(B.x1)&&z>Z(B.y0)&&z<Z(B.y1),
    tick(){}}; });   // (its flames and their lights: fire.js)
