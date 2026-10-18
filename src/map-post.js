// ---- THE POOL ROOM FROM OUTSIDE: its brick (the row's, as the bodega's), its door on the sidewalk, its roof; cut with its walls while you're inside ----
grab('poolout',()=>{ const P=POOLR, X=P.X, Z=P.Z, Y=P.Y, H=P.H, DOOR=[21.97,23.53], cw=MODS.pool.cut;   // (cw: the room's four walls' cuts: west, east, back, front)
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
  const roof=new THREE.Mesh(new THREE.BoxGeometry((P.x1-P.x0+.4)*TILE*BLDK,.08,(P.y1-P.y0+.4)*TILE*BLDK),new THREE.MeshLambertMaterial({color:new THREE.Color(.2,.2,.21)})); roof.position.set(X((P.x0+P.x1)/2),Y(H)+.04,Z((P.y0+P.y1)/2)); scene.add(roof); MODS.pool.roof=roof; });
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
    scene.add(L); lamps.push(L); }
  // (and the exit tunnel's own cool light, as the platform's: the stairs' foot to the platform)
  for(const y of [S.y0-3.5,S.y0-8.5]){ const L=new THREE.PointLight(new THREE.Color(.5,.54,.64),6,8*TILE,1.6); L.position.set(X((S.x0+S.x1)/2),Y(-98+88),Z(y)); L.userData.i0=L.intensity; MAPG.down.add(L); lamps.push(L); }
  // where you can't walk: the side walls (both levels), the back rail (on the street)
  const sol=(lv,x0,y0,x1,y1,h)=>{ SOL[lv].push([X(x0),Z(y0),X(x1),Z(y1)]); FIX[lv].push([X(x0),Z(y0),0,X(x1),Z(y1),h]); };
  for(const lv of ['up','down'])for(const x of [S.x0-.2,S.x1])sol(lv,x,S.y0,x+.2,S.y1,Y(30));
  sol('up',S.x0-.2,S.y0-.2,S.x1+.2,S.y0,Y(30)); });
// ---- ONE GROUND FOR THE MAP: on the stairs, the step under you; underground, the station's floor; on the street, the street's (its road a kerb down)
// (two stairs down: the subway's from the sidewalk, descending toward the street's back (dir -1); the castle's from its bailey (dir 1): castle.js)
const STAIRS=[MAPSTAIR,CASTLE.stair,...RING.stairs], inStair=(x,z)=>{ const gx=x/TILE+72, gy=z/TILE-77; for(const S of STAIRS)if(gx>=S.x0&&gx<S.x1&&gy>=S.y0&&gy<S.y1)return {S,gy}; return null; };
groundY=(x,z)=>{ const s=inStair(x,z); if(s){ const S=s.S, t=S.dir>0?s.gy-S.y0:S.y1-s.gy, k=Math.min(S.steps,Math.max(1,Math.floor(t/((S.y1-S.y0)/S.steps))+1)); return -k*S.depth/S.steps*ZU; }
  { const st=LVL==='up'&&STORE.stackGround?STORE.stackGround(x,z):null; if(st!=null)return st; }
  { const sg=LVL==='up'&&STORE.shrineGround?STORE.shrineGround(x,z):null; if(sg!=null)return sg; }   // (the Moon Shrine's plaza, steps and terrace: store.js)   // (a floor stacked on the apartments: store.js)
  return LVL==='down'?(MODS.dungeon&&MODS.dungeon.inside(x,z)?MODS.dungeon.ground(x,z):MODS.station.ground(x,z)):MODS.apts&&MODS.apts.inside(x,z)?MODS.apts.ground(x,z):MODS.bodega.ground(x,z); };   // (in the apartment house: its floor under you, its stairs: apts.js)
BOUND={x0:Math.min(MODS.bodega.BOUND.x0,MODS.station.BOUND.x0),x1:Math.max(MODS.bodega.BOUND.x1,MODS.pool.BOUND.x1),z0:Math.min(MODS.station.BOUND.z0,MODS.pool.BOUND.z0),z1:Math.max(MODS.bodega.BOUND.z1,MODS.park.BOUND.z1)};   // (the park past the far sidewalk: park.js)
// (and every place the map's layout moved, wherever it put it, so the view can reach it: the bodega, the apartment house, the castle, Ghost Street,
// the Diner and the Bar; src/mapedit.js. Only a moved one: the street lights are spaced from these edges, dress.js)
{ const g=(k,x0,z0,x1,z1)=>{ if(!LAY.L[k])return; BOUND.x0=Math.min(BOUND.x0,x0); BOUND.z0=Math.min(BOUND.z0,z0); BOUND.x1=Math.max(BOUND.x1,x1); BOUND.z1=Math.max(BOUND.z1,z1); }, B=BOD.B0, A=MODS.apts.A, C=CASTLE.b, G=BOD.grounds.find(q=>q.id==='ghostst');
  g('bodega',BOD.X(B.x0),BOD.Z(B.y0),BOD.X(B.x1),BOD.Z(B.y1)); g('house',BOD.X(A.x0),BOD.Z(A.y0),BOD.X(A.x1),BOD.Z(A.y1)); g('castle',BOD.XS(C[0]),BOD.ZS(C[2]),BOD.XS(C[1]),BOD.ZS(C[3]));
  if(G)g('ghost',BOD.X(G.x0),BOD.Z(G.y0),BOD.X(G.x1),BOD.Z(G.y1)); for(const R of STORE.rooms)g(R.id,R.x0,R.z0,R.x1,R.z1); }
// the light of the open air at night over the street, the station's own underground
const HEMI=new THREE.HemisphereLight(0x55607a,0x14110e,.3); scene.add(HEMI);
// AT MOST EIGHT LAMPS LIGHT ANYTHING (owner, 17 Oct 2026, the budget: "render what is only absolutely needed"): every lamp the places made is a
// record (where it is, its colour, strength and reach; its own code still sets its strength: the flicker, on and off), taken out of the scene;
// eight lights stand in, put each quarter second on the eight lit lamps nearest you that can reach you (your level; a lamp in a room lights
// only that room, one outside only the outside, so with no walls' shadows nothing leaks through a wall), their strength copied every frame.
// The count never changes, so no shader is rebuilt for a lamp coming or going. The nearest casts the one lamp shadow (the sun the other);
// the two nearest are his light and shadow (SHL: walker3d.js, looks.js)
const LITE={N:8,pool:[],recs:[],sel:[],t:0,f:0,at:null}; window.LITE=LITE;   // (a test's look)
for(let i=0;i<LITE.N;i++){ const L=new THREE.PointLight(0xffffff,0,8*TILE,1.6); L.userData.pool=true; if(!i){ L.castShadow=true; L.shadow.mapSize.set(1024,1024); L.shadow.camera.near=.1; L.shadow.camera.far=14; L.shadow.bias=-.002; L.shadow.normalBias=.06; } scene.add(L); LITE.pool.push(L); }
SHL.push(LITE.pool[0],LITE.pool[1]);
// (once everything's made: every other lamp in the scene becomes a record, its level's group kept to know when it's shown)
LITE.init=()=>{ const top=o=>{ while(o.parent&&o.parent!==scene)o=o.parent; return o; };
  scene.traverse(o=>{ if(o.isPointLight&&!o.userData.pool)LITE.recs.push(o); });
  for(const L of LITE.recs){ const g=top(L); L.userData.grp=g===L?null:g; L.castShadow=false; L.removeFromParent(); } };
LITE.tick=(dt,x,y,z)=>{ const P=LITE.pool;
  LITE.t=Math.min(LITE.t-dt,.25); if(!(LITE.t>0)){ LITE.t=.25;   /* (a bad frame's dt, NaN or backwards, never leaves it stuck) */ const R=typeof ROOMS!=='undefined'?ROOMS:null, RB=R&&R.boxes?R.boxes():[], cur=R?R.cur:null, e=.5*TILE;
    const inB=(b,p,m)=>p.x>b.x0-m&&p.x<b.x1+m&&p.z>b.z0-m&&p.z<b.z1+m&&p.y>b.y0-e&&p.y<b.y1+e;
    LITE.sel=LITE.recs.filter(L=>L.intensity>0&&!L.userData.off&&(!L.userData.grp||L.userData.grp.visible)&&(L.userData.in?L.userData.in(cur):L.userData.both||(cur?inB(cur,L.position,e):!RB.some(b=>inB(b,L.position,-e)))))   /* (in: a lamp's own rule for which room it lights: the apartment house's floors, apts.js) */
      .map(L=>[(L.position.x-x)**2+(L.position.y-y)**2+(L.position.z-z)**2,L]).sort((p,q)=>p[0]-q[0]).slice(0,LITE.N);
    /* (held, owner 18 Oct 2026, the flicker under a light: the nearest of two lamps flipped as he walked, and with it the lamp whose shadow falls on him; the
       first now changes only for a lamp clearly nearer (a third nearer by distance squared), and every other lamp keeps the slot it had) */
    const S0=LITE.slots||(LITE.slots=[]), want=LITE.sel.map(p=>p[1]), dOf=L=>{ const p=LITE.sel.find(q=>q[1]===L); return p?p[0]:1e18; };
    let first=want[0]; if(S0[0]&&want.includes(S0[0])&&dOf(S0[0])<=dOf(first)*1.35)first=S0[0];
    const slots=new Array(LITE.N).fill(null); slots[0]=first||null; for(let i=1;i<LITE.N;i++)if(S0[i]&&S0[i]!==first&&want.includes(S0[i]))slots[i]=S0[i];
    for(const L of want){ if(slots.includes(L))continue; const i=slots.indexOf(null,1); if(i<0)break; slots[i]=L; }
    LITE.slots=slots; LITE.sel=slots.filter(Boolean); }
  for(let i=0;i<P.length;i++){ const S=P[i], L=(LITE.slots||LITE.sel)[i]; if(!L||!(L.intensity>0)){ S.intensity=0; continue; } S.position.copy(L.position); S.color.copy(L.color); S.intensity=L.intensity; S.distance=L.distance; S.decay=L.decay; }
  // its shadow drawn only while it lights something, every other frame (half the cost, a frame's lag unseen), and at once when it moves to another lamp
  /* (its shadow drawn again every frame something moves near it, never every other frame: a stale map on alternate frames made his shadow on himself
     stutter as he walked; when nothing near moves, not at all: at rest, at rest) */
  const L0=P[0], first=(LITE.slots||LITE.sel)[0]; let mv=LITE.at!==first||Math.abs(x-LITE.px)+Math.abs(y-LITE.py)+Math.abs(z-LITE.pz)>1e-4; LITE.at=first; LITE.px=x; LITE.py=y; LITE.pz=z;
  if(L0.intensity>0&&typeof NPCS!=='undefined'){ const r=(L0.distance||8*TILE)**2; for(const N of NPCS){ if(!N.g||!N.g.visible||!N.st)continue; const p=N.g.position, dx=p.x-L0.position.x, dz=p.z-L0.position.z; if(dx*dx+dz*dz>r)continue; const k=p.x*7.13+p.z*3.31+p.y*1.7+N.st.h; if(N._lk!==k){ N._lk=k; mv=true; } } }
  L0.shadow.autoUpdate=L0.intensity>0&&mv; };
scene.background=new THREE.Color(0x050507);
// THE LEVEL YOU'RE ON (from your height): its walls, its ground, its places shown; on the stairs, both
// (on the stairs: the station shown below you; the street hidden once you're halfway down, as a room's walls are when you're in it)
const MAPLV=(py,pos)=>{ const lv=py<-1.6?'down':'up', st=inStair(pos.x,pos.z)!=null;
  MAPG.down.visible=lv==='down'||st; if(MAPG.dungeon)MAPG.dungeon.visible=lv==='down'||st; for(const k of ['bodega','pool','poolout','park','castle'])if(MAPG[k])MAPG[k].visible=lv==='up'&&!(st&&py<-1);
  MODS.stairCut.constant=st?py+.25:1e6; if(MODS.castleStairCut)MODS.castleStairCut.constant=st?py+.25:1e6;
  if(lv===LVL)return false; LVL=lv; solids=SOL[lv]; fixed=FIX[lv]; HEMI.color.set(lv==='down'?0x8a93a8:0x55607a); HEMI.groundColor.set(lv==='down'?0x1a1814:0x14110e); HEMI.intensity=lv==='down'?.1:.3; return true; };

// THE STOREROOM (store.js, off the map): a room's roof hidden while you're in it; the view and his walk bounded by the store while he's
// there, by the map otherwise (its lamps: LITE's, as any room's: a lamp in a room lights only it)
{ const MB=BOUND; STORE.tick=()=>{ STORE.pos=pos; STORE.cur=ROOMS.cur?ROOMS.cur.id:null; STORE.nl=lamps.length; STORE.lon=LITE.sel.length;
    for(const r of STORE.roofs)r.me.visible=!r.R.inside(pos.x,pos.z); BOUND=STORE.inStore(pos.x,pos.z)?STORE.bound:MB; }; }
// (a test's look inside)
window.MAPDBG=()=>({LVL,cut:MODS.stairCut.constant,vis:Object.fromEntries(Object.entries(MAPG).map(([k,g])=>[k,g.visible])),stairLamp:lamps.filter(L=>L.parent===MAPG.stairs).map(L=>L.intensity),py:typeof py!=='undefined'?py:null,pos:typeof pos!=='undefined'?[pos.x,pos.z]:null});

// ---- THE LAND ROUND IT (owner, 17 Oct 2026: "fill in the rest with land (flat only for now) around"): past the map's edges, flat ground as far
// as the view can reach, the game's own grass (its painter, grassCol: noise cut into tones, tufts at hashed spots), a hair under the street's
// ground so the street lies on it; open where the ground goes down (the road, the subway's stairs, the pool's basin). One sheet, one texture
// (thirty-two tiles of grass, mirrored at its edges so it never shows a seam), lit and shadowed as the street is; shown with the street's level
{ const K=32, N=K*24, c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d'), im=g.createImageData(N,N), GC=BOD.g.lawnCol;   // (owner, 17 Oct 2026: "the same grass in park to extend everywhere there isnt something else": the park's lawn painter, not the game's grainy grass)
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const v=GC((i+.5)/24+200,(j+.5)/24+200), k=(j*N+i)*4; im.data[k]=v[0]; im.data[k+1]=v[1]; im.data[k+2]=v[2]; im.data[k+3]=255; }
  g.putImageData(im,0,0); const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping; t.repeat.set(1/K,1/K);
  // the sheet, in tiles (x across, -z up its plane: laid flat after), and its holes
  const XS=BOD.XS, ZS=BOD.ZS, M=BOD.MAP, tt=v=>v/TILE, R=220, cx=tt(XS((M.x0+M.x1)/2)), cz=tt(ZS(M.y0));
  // (moved and its edges moved on the map's layout, LAY: the sheet's four edges, in tiles; a hole only where the sheet still is)
  const LO=LAY.o('land'), LE=LAY.e('land'), LR=MODS.landR={x0:cx-R+LO.x+LE[0],z0:cz-R+LO.y+LE[1],x1:cx+R+LO.x+LE[2],z1:cz+R+LO.y+LE[3]};
  const sh=new THREE.Shape([[LR.x0,-LR.z0],[LR.x1,-LR.z0],[LR.x1,-LR.z1],[LR.x0,-LR.z1]].map(p=>new THREE.Vector2(...p)));
  const hole=(x0,z0,x1,z1)=>x0>LR.x0&&x1<LR.x1&&z0>LR.z0&&z1<LR.z1&&sh.holes.push(new THREE.Path([[x0,-z0],[x0,-z1],[x1,-z1],[x1,-z0]].map(p=>new THREE.Vector2(...p))));
  { const A=AVE, R=RING, rect=(x0,y0,x1,y1)=>{ const a=tt(XS(x0)), b=tt(XS(x1)), c=tt(ZS(y0)), d=tt(ZS(y1)); hole(Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)); };   // (the loop's four roads, a kerb down: four holes, none overlapping)
    rect(M.x0,BOD.CURB,M.x1,BOD.FAR); rect(A.r0,BOD.FAR,A.r1,R.nr0); rect(R.wr0,BOD.FAR,R.wr1,R.nr0); rect(R.wr0,R.nr0,A.r1,R.nr1); }
  hole(tt(XS(MAPSTAIR.x0)),tt(ZS(MAPSTAIR.y0)),tt(XS(MAPSTAIR.x1)),tt(ZS(MAPSTAIR.y1)));   // (the stairs down)
  for(const S of RING.stairs)hole(tt(XS(S.x0)),tt(ZS(S.y0)),tt(XS(S.x1)),tt(ZS(S.y1)));   // (the loop subway's: sub.js)
  { const S=CASTLE.stair; hole(tt(XS(S.x0)),tt(ZS(S.y0)),tt(XS(S.x1)),tt(ZS(S.y1))); }   // (the castle's stair down)
  hole(tt(POOLR.X(POOLR.bx0)),tt(POOLR.Z(POOLR.by0)),tt(POOLR.X(POOLR.bx1)),tt(POOLR.Z(POOLR.by1)));   // (the pool's basin)
  const geo=new THREE.ShapeGeometry(sh); geo.rotateX(-Math.PI/2); geo.scale(TILE,1,TILE); geo.translate(0,-.5*ZU,0);
  const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:t})); m.receiveShadow=true; MAPG.bodega.add(m); MODS.land=m; }
