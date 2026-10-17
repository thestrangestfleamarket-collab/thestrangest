// ---- THE POOL ROOM FROM OUTSIDE: its brick (the row's, as the bodega's), its door on the sidewalk, its roof; cut with its walls while you're inside ----
grab('poolout',()=>{ const P=POOLR, X=P.X, Z=P.Z, Y=P.Y, H=P.H, DOOR=[17.22,18.78], cw=MODS.pool.cut;   // (cw: the room's four walls' cuts: west, east, back, front)
  const face=(pts,w,h,fn,pl)=>{ const c=document.createElement('canvas'); c.width=Math.round(w); c.height=Math.round(h); const g=c.getContext('2d'), im=g.createImageData(c.width,c.height);
    for(let j=0;j<c.height;j++)for(let i=0;i<c.width;i++){ const v=fn(i,j), k=(j*c.width+i)*4; if(!v)continue; im.data[k]=v[0]; im.data[k+1]=v[1]; im.data[k+2]=v[2]; im.data[k+3]=255; } g.putImageData(im,0,0);
    const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace;
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute([...pts[0],...pts[1],...pts[2],...pts[0],...pts[2],...pts[3]],3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2)); geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:t,alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:pl?[pl]:[]})); m.receiveShadow=true; scene.add(m); return m; };
  const brick=(nx,ny,u,v,z)=>BOD.C(BOD.facade(nx,ny,nx?v:u,nx?u:v,z,1,H));
  // west and east (along y), back and front (along x); a fifth of a tile out from the room's inside face
  face([[X(P.x0-.2),Y(0),Z(P.y1)],[X(P.x0-.2),Y(0),Z(P.y0)],[X(P.x0-.2),Y(H),Z(P.y0)],[X(P.x0-.2),Y(H),Z(P.y1)]],P.y1*24,H,(i,j)=>brick(-1,0,P.y1-(i+.5)/24,P.x0,H-j-.5),cw[0].pl);
  face([[X(P.x1+.2),Y(0),Z(P.y0)],[X(P.x1+.2),Y(0),Z(P.y1)],[X(P.x1+.2),Y(H),Z(P.y1)],[X(P.x1+.2),Y(H),Z(P.y0)]],P.y1*24,H,(i,j)=>brick(1,0,(i+.5)/24,P.x1,H-j-.5),cw[1].pl);
  face([[X(P.x1),Y(0),Z(P.y0-.2)],[X(P.x0),Y(0),Z(P.y0-.2)],[X(P.x0),Y(H),Z(P.y0-.2)],[X(P.x1),Y(H),Z(P.y0-.2)]],P.x1*24,H,(i,j)=>brick(0,-1,P.x1-(i+.5)/24,P.y0,H-j-.5),cw[2].pl);
  face([[X(P.x0),Y(0),Z(P.y1+.2)],[X(P.x1),Y(0),Z(P.y1+.2)],[X(P.x1),Y(H),Z(P.y1+.2)],[X(P.x0),Y(H),Z(P.y1+.2)]],P.x1*24,H,(i,j)=>{ const u=(i+.5)/24, z=H-j-.5; return u>=DOOR[0]&&u<DOOR[1]&&z<94?null:brick(0,1,u,P.y1,z); },cw[3].pl);
  // the door's frame through the wall's thickness
  const fm=new THREE.MeshLambertMaterial({color:new THREE.Color(70/255,72/255,78/255),clippingPlanes:[cw[3].pl]});
  for(const u of DOOR){ const m=new THREE.Mesh(new THREE.BoxGeometry(.06,Y(94),.2*TILE),fm); m.position.set(X(u),Y(47),Z(P.y1+.1)); scene.add(m); }
  { const m=new THREE.Mesh(new THREE.BoxGeometry((DOOR[1]-DOOR[0])*TILE*BLDK,.06,.2*TILE),fm); m.position.set(X((DOOR[0]+DOOR[1])/2),Y(94),Z(P.y1+.1)); scene.add(m); }
  // the roof: the tar of a flat roof, its cope round it; hidden while you're inside
  const roof=new THREE.Mesh(new THREE.BoxGeometry((P.x1-P.x0+.4)*TILE,.08,(P.y1-P.y0+.4)*TILE),new THREE.MeshLambertMaterial({color:new THREE.Color(.2,.2,.21)})); roof.position.set(X((P.x0+P.x1)/2),Y(H)+.04,Z((P.y0+P.y1)/2)); scene.add(roof); MODS.pool.roof=roof; });
// ---- THE SUBWAY'S STAIRS: from the sidewalk (its top at the street's side) twelve steps down to the station's exit tunnel, its side walls, a
// green rail round the opening (as New York's stairs down have) but at its top, open to the sidewalk ----
grab('stairs',()=>{ const S=MAPSTAIR, X=x=>(x-72)*TILE, Z=y=>(y+77)*TILE, Y=z=>z*ZU, n=S.steps, rise=S.depth/n, run=(S.y1-S.y0)/n;
  const P=[], Cc=[], c3=new THREE.Color();
  const quad=(a,b,c,d,col)=>{ c3.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(const v of [a,b,c,a,c,d]){ P.push(...v); Cc.push(c3.r,c3.g,c3.b); } };
  const box=(x0,y0,z0,x1,y1,z1,col)=>{ const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[Y(z0),Y(z1)], dk=col.map(v=>v*.8), lt=col.map(v=>Math.min(255,v*1.08));
    quad([a,f,d],[b,f,d],[b,f,c],[a,f,c],lt); quad([a,e,d],[b,e,d],[b,f,d],[a,f,d],col); quad([b,e,c],[a,e,c],[a,f,c],[b,f,c],col); quad([a,e,c],[a,e,d],[a,f,d],[a,f,c],dk); quad([b,e,d],[b,e,c],[b,f,c],[b,f,d],dk); };
  const CON=[132,128,120], CON2=[118,114,108], RAIL=[52,84,62];
  // the steps (each a block from its tread down to the tunnel's floor), the landing at the foot
  // (each step its tread and its riser, nothing under them: cut down to your feet, nothing hollow shows)
  for(let k=0;k<n;k++){ const yA=S.y1-(k+1)*run, yB=S.y1-k*run, zt=-(k+1)*rise, zr=-k*rise, [a,b]=[X(S.x0),X(S.x1)];
    quad([a,Y(zt),Z(yB)],[b,Y(zt),Z(yB)],[b,Y(zt),Z(yA)],[a,Y(zt),Z(yA)],(k&1)?CON:CON2);                      // the tread
    quad([a,Y(zt),Z(yB)],[b,Y(zt),Z(yB)],[b,Y(zr),Z(yB)],[a,Y(zr),Z(yB)],CON2.map(v=>v*.82));                   // the riser, facing the street
    quad([a,Y(zt),Z(yB-.03)],[b,Y(zt),Z(yB-.03)],[b,Y(zt+1.2),Z(yB-.03)],[a,Y(zt+1.2),Z(yB-.03)],[196,170,64]); }   // (the yellow nosing on each step's edge)
  // the side walls, from the tunnel's floor to a rail's height over the sidewalk; the rail round the back and the sides
  for(const x of [S.x0-.2,S.x1]){ box(x,S.y0,-S.depth,x+.2,S.y1,0,CON2); box(x,S.y0,0,x+.2,S.y1,30,RAIL); }
  box(S.x0-.2,S.y0-.2,0,S.x1+.2,S.y0,30,RAIL);
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.computeVertexNormals();
  // (cut down to your feet while you're on them, so the walls and the steps above you don't stand between you and the camera)
  MODS.stairCut=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
  const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,clippingPlanes:[MODS.stairCut]})); m.receiveShadow=true; m.castShadow=true; scene.add(m);
  // a lamp over the stairs, so the way down is lit
  for(const [y,z,c,i] of [[S.y1-.3,60,[1,.92,.78],5],[S.y0+.5,-40,[.5,.54,.64],6]]){ const L=new THREE.PointLight(new THREE.Color(...c),i,7*TILE,1.6); L.position.set(X((S.x0+S.x1)/2),Y(z),Z(y)); L.userData.i0=L.intensity;
    L.castShadow=true; L.shadow.mapSize.set(256,256); L.shadow.camera.near=.05; L.shadow.camera.far=7*TILE; L.shadow.bias=-.004; L.shadow.normalBias=.06; L.shadow.autoUpdate=false; L.shadow.needsUpdate=true;   // (its shadows, drawn once: the walls keep its light in the stairwell, as the shop's lamps; owner, 17 Oct 2026, every light checked)
    scene.add(L); lamps.push(L); }
  // (and the exit tunnel's own cool light, as the platform's: the stairs' foot to the platform)
  for(const y of [-83.5,-88.5]){ const L=new THREE.PointLight(new THREE.Color(.5,.54,.64),6,8*TILE,1.6); L.position.set(X((S.x0+S.x1)/2),Y(-98+88),Z(y)); L.userData.i0=L.intensity; MAPG.down.add(L); lamps.push(L); }
  // where you can't walk: the side walls (both levels), the back rail (on the street)
  const sol=(lv,x0,y0,x1,y1,h)=>{ SOL[lv].push([X(x0),Z(y0),X(x1),Z(y1)]); FIX[lv].push([X(x0),Z(y0),0,X(x1),Z(y1),h]); };
  for(const lv of ['up','down'])for(const x of [S.x0-.2,S.x1])sol(lv,x,S.y0,x+.2,S.y1,Y(30));
  sol('up',S.x0-.2,S.y0-.2,S.x1+.2,S.y0,Y(30)); });
// ---- ONE GROUND FOR THE MAP: on the stairs, the step under you; underground, the station's floor; on the street, the street's (its road a kerb down)
const inStair=(x,z)=>{ const gx=x/TILE+72, gy=z/TILE-77, S=MAPSTAIR; return gx>=S.x0&&gx<S.x1&&gy>=S.y0&&gy<S.y1?gy:null; };
groundY=(x,z)=>{ const s=inStair(x,z), S=MAPSTAIR; if(s!=null){ const k=Math.min(S.steps,Math.max(1,Math.floor((S.y1-s)/((S.y1-S.y0)/S.steps))+1)); return -k*S.depth/S.steps*ZU; }
  return LVL==='down'?MODS.station.ground(x,z):MODS.bodega.ground(x,z); };
BOUND={x0:Math.min(MODS.bodega.BOUND.x0,MODS.station.BOUND.x0),x1:Math.max(MODS.bodega.BOUND.x1,MODS.pool.BOUND.x1),z0:Math.min(MODS.station.BOUND.z0,MODS.pool.BOUND.z0),z1:MODS.bodega.BOUND.z1};
// the light of the open air at night over the street, the station's own underground
const HEMI=new THREE.HemisphereLight(0x55607a,0x14110e,.3); scene.add(HEMI);
// HIS SHADOWS: two shadow-casting stand-ins for the two lamps nearest him (on his level)
SHL.push(...[0,1].map(()=>{ const L=new THREE.PointLight(0xffffff,0,8*TILE,1.6); L.castShadow=true; L.shadow.mapSize.set(512,512); L.shadow.camera.near=0.1; L.shadow.camera.far=14; L.shadow.bias=-0.003; scene.add(L); return L; }));
scene.background=new THREE.Color(0x050507);
// THE LEVEL YOU'RE ON (from your height): its walls, its ground, its places shown; on the stairs, both
// (on the stairs: the station shown below you; the street hidden once you're halfway down, as a room's walls are when you're in it)
const MAPLV=(py,pos)=>{ const lv=py<-1.6?'down':'up', st=inStair(pos.x,pos.z)!=null;
  MAPG.down.visible=lv==='down'||st; for(const k of ['bodega','pool','poolout'])MAPG[k].visible=lv==='up'&&!(st&&py<-1);
  MODS.stairCut.constant=st?py+.25:1e6;
  if(lv===LVL)return false; LVL=lv; solids=SOL[lv]; fixed=FIX[lv]; HEMI.color.set(lv==='down'?0x8a93a8:0x55607a); HEMI.groundColor.set(lv==='down'?0x1a1814:0x14110e); HEMI.intensity=lv==='down'?.1:.3; return true; };

// (a test's look inside)
window.MAPDBG=()=>({LVL,cut:MODS.stairCut.constant,vis:Object.fromEntries(Object.entries(MAPG).map(([k,g])=>[k,g.visible])),stairLamp:lamps.filter(L=>L.parent===MAPG.stairs).map(L=>L.intensity),py:typeof py!=='undefined'?py:null,pos:typeof pos!=='undefined'?[pos.x,pos.z]:null});
