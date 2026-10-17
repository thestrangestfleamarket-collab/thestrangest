// ---- GHOST STREET, A THIRD TALLER, AND ITS DOJO (owner, 17 Oct 2026: "make the ghost street building 33% taller, with bigger door, and the
// inside should look like the dojo (from other map)"): the kit's wooden shop (23-w-ghost-street, read by build.py) stood a third taller: the
// ground floor 84 to 112 art px, the floor above 74 to 98 (its window raised with it), the tiled roof 156-196 to 208-261 (build.py: the kit's
// own roof made at the new height, so its tiles stay whole pixels), the eave, its sign and cooler and the door curtain lifted with the wall.
// Its ground floor is now hollow: four walls (outside, the kit's planks and posts, their art lengthened where it's plain wood; inside, the
// dojo's shoji) round a real doorway two tiles wide and 100 px high (the bodega's 1.56 x 94). Inside, the old West End dojo's hall
// (23-w-west-dojo-1-hall, its makers word for word: BOD.GDJ): tatami in a border of polished boards, the cushion in the middle, shoji walls
// (dark lattice over wooden skirting, posts, the beam, plaster over it, round lattice windows, a lattice transom over the door), the alcove
// (tokonoma) with its scroll and the plum branch, the rack of practice swords, a paper lantern (andon) each side of the door, a big candle in
// each corner, incense on two walls. Lit only by its flames: the candles flicker, the lanterns burn still, and only while you're in it.
// The room joins ROOMS (only it drawn while you're in it) and the cutaway (its walls cut to their foot between you and the camera) ----
// (gdShape: called by bodega.js as Ghost Street is set, before its pieces are painted and made solid; a declaration, so it's there early)
function gdShape(GS,K,LAMPS){ const G=GS.filter(p=>p.name==='ghost street shop'); if(!G.length)return;
  BOD.GDK={fs:G[0].boxes[0].fs,top:G[0].boxes[0].top,o:K.o,s:K.s};   // (the ground floor's painters, for the new walls' outsides and the ceiling's top)
  for(const p of G)GS.splice(GS.indexOf(p),1);   // (the solid ground floor out: the walls below take its place)
  // the floor above: 112 to 210, its art at its own pixels (plain bands repeated: the panels under the window, the dark wood over it)
  const R=z=>z<118?z-28:z<130?90:z<186?z-40:z<202?150:z-52;
  for(const p of GS){ if(p.name==='ghost street shop, upstairs'){ for(const b of p.boxes){ const f=b.fs, z0=b.z0; b.z0=112; b.z1=210; b.fs=(nx,ny,x,y,z,k)=>f(nx,ny,x,y,R(Math.floor(z+112))+.5-z0,k); }
      for(const l of LAMPS)if(l.prop===p)l.z+=40; }   // (the lit window's lamp with its window)
    if(p.name==='ghost street eave'||p.name==='door curtain')for(const b of p.boxes){ b.z0+=28; b.z1+=28; } } }   // (each box's art counts from its own foot)
{ const {X,Y,Z,gbox,faceTex,bq,C}=BOD, J=BOD.GDJ, GK=BOD.GDK, {hash}=BOD.g, sh=BOD.K.sh;
  if(GK){ const o=GK.o, s=GK.s, X0=o[0]+.6*s, X1=o[0]+7.4*s, Y0=o[1]+.2*s, Y1=o[1]+3.2*s, T=.2, H=112, DH=100, dx0=X0+95/24, dx1=X0+143/24;
    const xi0=X0+T, xi1=X1-T, yi0=Y0+T, yi1=Y1-T, cx=(xi0+xi1)/2, cy=(yi0+yi1)/2, WD=J.DJWOOD, POST=[112,56,54];
    J.setDJ({H:110});   // (the alcove's post up to the beam)
    const TK=[xi0+5.2,xi1-.95];   // (the alcove, on the back wall)
    // INSIDE, THE DOJO'S WALLS (its shoji at this hall's height): a along the wall (tiles from its inside corner), z art px; L its length; door, the
    // doorway's a0, a1; win, the round windows' middles; alc, the alcove's a0, a1 (plaster behind the scroll)
    const wood=(f=1)=>sh(WD,f);
    function shoji(a,z,L,door,win,alc){ const n=Math.max(1,Math.round(L/2)), sp=L/n, pa=a-Math.floor(a/sp)*sp;
      if(door&&a>door[0]-.1&&a<door[1]+.1){ if(z<DH+4)return wood(z<DH+1?.8:1.12);   // the jambs and the lintel
        if(z>=104&&z<111&&a>door[0]+.05&&a<door[1]-.05)return (a*8)%1<.22||z%4.5<1.2?wood(1.15):[40,30,26]; }   // the transom's lattice (ranma), dark between
      if(z>=103)return sh(J.DJPLA,.94+.06*hash(Math.floor(a*20),Math.floor(z/2),721));   // plaster
      if(z>=96)return wood(z<97.5?.8:1.12);   // the beam (nageshi)
      if(alc&&a>alc[0]&&a<alc[1])return z<10?wood(.7):sh(J.DJPLA,.8+.05*hash(Math.floor(a*20),Math.floor(z/2),722));   // the alcove's plaster back
      for(const w of win){ const r=Math.hypot((a-w)*24,z-56); if(r<19.5){ if(r>=17.5)return wood(); return ((a-w)*24+40)%7<1.3||(z+40)%7<1.3?wood(1.2):[92,96,120]; } }   // a round window (marumado), the night through its paper
      if(pa<.09||pa>sp-.09||a<.09||a>L-.09)return wood();   // posts
      if(z<10)return wood(z<1?.6:(a*6)%1<.08?.75:1.05);   // the skirting (koshi-ita)
      if(z<11.5||z>94.5||(a*4)%1<.07||z%10.5<1)return wood(1.25);   // the shoji's frame and lattice
      return sh(J.DJPAP,.94+.06*hash(Math.floor(a*12),Math.floor(z/3),723)); }   // paper
    // THE WALLS: boxes whose inside face is the dojo's, outside the kit's (its art lengthened: plain wood repeated from 56 up, so a door's
    // frame, the top beam and the bay window's panels stay whole), their ends and tops plain wood; each wall its own kind, cut on its own
    const RO=z=>z<56?z:z-28, tone=(c,k)=>c.map(v=>Math.round(v*k));
    const out=(nx,ny,x,y,z,k)=>{ if(ny>0){ const a=Math.floor((x-X0)*24); if(a>=92&&a<146&&z<DH+4&&(z>=DH||a<95||a>=143))return tone(POST,k); }   // the new doorway's frame
      return GK.fs(nx,ny,x,y,RO(Math.floor(z))+.5,k); };
    const WALLS={back:{n:[0,1],al:x=>x-xi0,L:xi1-xi0,win:[2.2],alc:[TK[0]-xi0-.12,TK[1]-xi0]},front:{n:[0,-1],al:x=>x-xi0,L:xi1-xi0,win:[],door:[dx0-xi0,dx1-xi0]},
      west:{n:[1,0],al:y=>y-yi0,L:yi1-yi0,win:[(yi1-yi0)/2]},east:{n:[-1,0],al:y=>y-yi0,L:yi1-yi0,win:[]}};
    const wbox=(id,x0,y0,x1,y1,z0,z1)=>{ const w=WALLS[id]; return {id,x0,y0,x1,y1,z0,z1,c:WD,top:()=>sh(WD,1.1),fs:(nx,ny,x,y,zr,k)=>{ const z=zr+z0;
      if(nx===w.n[0]&&ny===w.n[1])return shoji(w.al(nx?y:x),z,w.L,w.door,w.win,w.alc);
      if(nx===-w.n[0]&&ny===-w.n[1])return out(nx,ny,x,y,z,k);
      return wood(.9); }}; };
    const WB=[wbox('back',X0,Y0,X1,Y0+T,0,H),wbox('west',X0,Y0+T,X0+T,Y1-T,0,H),wbox('east',X1-T,Y0+T,X1,Y1-T,0,H),
      wbox('front',X0,Y1-T,dx0,Y1,0,H),wbox('front',dx1,Y1-T,X1,Y1,0,H),wbox('front',dx0,Y1-T,dx1,Y1,DH,H)];
    BATCH.tag=OBJ('bodega','ghost street shop'); for(const b of WB)gbox(b,'GD'+b.id);
    // the ground floor's roof (the kit's, at the new height): over the whole building, seen from outside (cut away inside with the room above)
    const flat=(x0,y0,x1,y1,z,col,kind)=>bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y1-(j+.5)/24))),kind);
    flat(X0,Y0,X1,Y1,H+.5,GK.top,'GDL');   // (a hair over the walls' tops)
    // THE FLOOR: polished boards round the walls, tatami (pale straw, woven along the mat, dark cloth down its long sides) in the old pattern
    // (no four corners meeting): across the room a mat each way in turn, 1 + 2 + 1 + 2 + 1 tiles; the cushion (zabuton) in the middle; a sill
    // of boards through the doorway
    const BX=(xi1-xi0-7)/2, BY=(yi1-yi0-2)/2, SEG=[[0,1,0],[1,3,1],[3,4,0],[4,6,1],[6,7,0]];
    const floorCol=(x,y)=>{ const u=x-xi0-BX, v=y-yi0-BY;
      if(u<0||u>=7||v<0||v>=2){ const al=Math.min(x-xi0,xi1-x)<Math.min(y-yi0,yi1-y), a=al?y:x, b=al?x:y, k=Math.floor(b*5), n=hash(k,Math.floor(a*1.3+k*.37),701);   // boards along the wall
        return sh(J.DJBRD,(b*5)%1<.1?.72:.9+.18*n); }
      const zx=Math.abs(x-cx), zy=Math.abs(y-cy); if(zx<.42&&zy<.42)return Math.max(zx,zy)>.37?[70,76,120]:Math.max(zx,zy)<.05?[34,38,66]:sh([52,58,98],.95+.1*hash(Math.floor(x*14),Math.floor(y*14),717));
      const g=SEG.find(q=>u>=q[0]&&u<q[1]), across=g[2], p=across?v%1:(u-g[0])%1, q=across?u-g[0]:v;   // p: across the mat, q: along it (2 long)
      const edge=p<.035||p>.965, end=q<.02||q>1.98, w=hash(Math.floor(p*30),Math.floor(q*9)+Math.floor(across?v:u-g[0])*31,703);
      return edge?[64,58,40]:end?sh(J.DJTAT,.8):sh(J.DJTAT,(Math.floor(p*30)&1?.94:1)*(.96+.06*w)); };
    flat(xi0,yi0,xi1,yi1,.4,floorCol,'GDL'); flat(dx0,Y1-T,dx1,Y1,.4,(x,y)=>sh(J.DJBRD,(x*5)%1<.1?.72:1),'GDL');
    // WHAT STANDS IN IT (the dojo's own makers): the alcove, the sword rack on the east wall, a candle in each corner, a lantern each side of
    // the door, incense on the west and back walls
    const ITEMS=[J.djTokonoma(TK[0],yi0,TK[1]),J.djBokkenRack(xi1,yi0+1.2,yi0+2.2)], CAND=[[xi0+.5,yi0+.5],[xi1-.5,yi0+.5],[xi0+.5,yi1-.5],[xi1-.5,yi1-.5]], AND=[[dx0-.6,yi1-.45],[dx1+.6,yi1-.45]];
    for(const [x,y] of CAND)ITEMS.push(J.djCandle(x,y)); for(const [x,y] of AND)ITEMS.push(J.djAndon(x,y));
    ITEMS.push(J.djIncense(xi0,yi0+1.8,[1,0]),J.djIncense(xi0+3.6,yi0,[0,1]));
    for(const p of ITEMS){ BATCH.tag=OBJ('bodega',p.name); for(const b of p.boxes)gbox(b,'GDL'); } BATCH.tag=null;
    // built: each wall's faces their own mesh (clipped to its foot when it stands between you and the camera, while you're in), the rest one
    const PLN={}; for(const id in WALLS)PLN[id]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
    BATCH.cast=true;
    BATCH.build((k,map,emap)=>{ const pl=PLN[k.slice(2)], cp=pl?{clippingPlanes:[pl]}:{};
      if(k==='B')return new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5});
      return new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{}),...cp}); });
    BATCH.cast=false; const KM=BATCH.meshes; BATCH.meshes={}; if(KM.B)KM.B.castShadow=false;
    const ix0=X(xi0), ix1=X(xi1), iz0=Z(yi0), iz1=Z(yi1), inside=()=>pos.x>ix0&&pos.x<ix1&&pos.z>iz0&&pos.z<iz1;
    for(const id in WALLS)if(KM['GD'+id])cutWalls.push({pl:PLN[id],nx:WALLS[id].n[0],nz:WALLS[id].n[1],foot:Y(8),me:KM['GD'+id],when:inside});
    // where you can't walk: the walls (the doorway open), the alcove's raised floor, the rack, the candles and the lanterns
    const sol=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
    for(const b of WB)if(b.z0===0)sol(b.x0,b.y0,b.x1,b.y1,H);
    for(const p of ITEMS){ const bs=p.boxes.filter(b=>b.z0<30&&b.z1-b.z0>3); if(!bs.length||/incense/.test(p.name))continue;
      sol(Math.min(...bs.map(b=>b.x0)),Math.min(...bs.map(b=>b.y0)),Math.max(...bs.map(b=>b.x1)),Math.max(...bs.map(b=>b.y1)),Math.max(...bs.map(b=>b.z1))); }
    // THE FLAMES: the candles' (a flame of two blocks over each, flickering a step at a time, its light with it) and the lanterns' (still);
    // their light only while you're in the hall (the walls would not keep it in)
    const LT=[], FM=new THREE.MeshBasicMaterial({color:new THREE.Color(1,.62,.24)}), FC=new THREE.MeshBasicMaterial({color:new THREE.Color(1,.92,.62)});
    const light=(x,y,z,c,r,fl)=>{ const cm=Math.max(...c), L=new THREE.PointLight(new THREE.Color(c[0]/cm,c[1]/cm,c[2]/cm),0,r*TILE*1.25,1.6); L.position.set(X(x),Y(z),Z(y)); scene.add(L); LT.push({L,i:7*cm*Math.min(1.2,r/5),fl,s:Math.round(x*7+y*13)}); return LT[LT.length-1]; };
    for(const [x,y] of CAND){ const l=light(x,y,34,[.85,.42,.17],4,1), g=new THREE.Group(), w=.06*TILE*BLDK;
      const f=new THREE.Mesh(new THREE.BoxGeometry(w,Y(10),w),FM), c=new THREE.Mesh(new THREE.BoxGeometry(w*.5,Y(5),w*.5),FC); f.position.y=Y(5); c.position.y=Y(3); g.add(f,c); g.position.set(X(x),Y(30),Z(y)); scene.add(g); l.g=g; }
    for(const [x,y] of AND)light(x,y,20,[.66,.34,.14],4.8,0);
    let was=null;
    BOD.GD={r:[xi0,yi0,xi1,yi1],door:[(dx0+dx1)/2,Y1],H:110,inside,tick(){ const t=performance.now()/1000, inn=inside();
      for(const l of LT){ const k=l.fl?.8+.08*Math.floor(hash(Math.floor(t*10),l.s,425)*5):1; if(l.g)l.g.scale.set(1,.8+.1*Math.floor(hash(Math.floor(t*10),l.s,425)*5)/2,1);
        if(inn||was!==inn)l.L.intensity=inn?l.i*k:0; } was=inn; }}; } }
