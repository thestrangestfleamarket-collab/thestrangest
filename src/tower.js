// ---- THE SQUIRREL'S TOWER (owner, 18 Oct 2026: "remove the tower from the dungeon/castle area, make it 3x small put it in corner of central
// park near main, small squirel in knight armor with sword on top"): the keep (THE KEEP, off the map in store.js; nothing of it in the castle)
// made again at a third of its size in the park's front-left corner, inside the walls by the main street: 3.2 x 3 tiles and 173 px (5 m) high,
// its four corner turrets standing a little higher, a crenellated parapet round its lead roof. Its faces are the keep's own painter
// (keepOutWall, the game's archive, word for word in the kit) read three of its pixels to one of ours (the darkest of three, so the mortar,
// the slits and the windows stay), so it's the keep in little: its courses, string courses, slits, round-headed windows and its door, the
// door now a squirrel's. On its roof stands the knight (npc-squirrel.js). Solid; no way in. Placed from PARK at run time (GCAVE.keep, cave.js),
// built a moment after the game runs. Cost: some 60 faces (120 triangles) in their own batch, one draw, no light ----
const GTOWER={}; window.GTOWER=GTOWER;
{ const H=173, TH=192, PH=12;   // (its walls a third of the keep's 520 px; the turrets and the merlons over them)
  // where its roof is, for the knight's feet: world units, from the site (npc-squirrel.js asks before it's built)
  GTOWER.site=()=>{ const S=GCAVE.S; if(!S)return null; const P=PARK, t=S.tw; return {x:BOD.XS(t.x+P.ox),z:BOD.ZS(t.y+P.oy),w:t.w*TILE,d:t.d*TILE,top:BOD.YS(H)}; };
  const build=()=>{ const P=PARK, t=GCAVE.S.tw, X=x=>BOD.XS(x+P.ox), Z=y=>BOD.ZS(y+P.oy), Y=BOD.YS, {bq,faceTex,C}=BOD, K=BOD.STOREK.keep, sh=BOD.K.sh;
    const x0=t.x-t.w/2, x1=t.x+t.w/2, y0=t.y-t.d/2, y1=t.y+t.d/2;
    // the keep's painter at three to one: its box the game's (KEEPC's: the door's arch at its front's middle), a point here 3x from our corner
    const KB={x0:426,x1:435.5,y0:-86,y1:-77,h:520}, lum=c=>c[0]+c[1]+c[2];
    const paint=(face,u,z,cap=520)=>{ let best=null; for(let k=0;k<3;k++){ const U=(u*3+k)/24, Zb=z*3+k, nx=face==='l'?-1:face==='r'?1:0, ny=face==='f'?1:face==='b'?-1:0;
        const c=K.keepOutWall(KB,nx,ny,nx?(nx<0?KB.x0:KB.x1):KB.x0+U,ny?(ny>0?KB.y1:KB.y0):KB.y0+U,Zb,1,cap); if(!best||lum(c)<lum(best))best=c; } return best; };
    const lead=(i,j)=>{ const n=Math.sin(i*12.9898+j*78.233)*43758.5453%1; return Math.abs(n)<.3?[74,76,80]:Math.abs(n)>.8?[90,92,96]:[82,84,88]; };
    // a box: its four sides painted (the face each side shows: f the keep's front with its door, toward the park; b its back, to the street; l west, r east), its top (fn)
        const box=(a0,b0,a1,b1,z0,z1,top,cap,off=[0,0])=>{ const [A,Bx,Cz,D]=[X(a0),X(a1),Z(b0),Z(b1)], [e,f]=[Y(z0),Y(z1)], W=(a1-a0)*24, Dp=(b1-b0)*24, Hh=z1-z0;
      const tex=(w,face,u0)=>faceTex(w,Hh,(i,j)=>C(paint(face,u0+i+.5,z1-j-.5,cap)));
      bq([A,e,Cz],[Bx,e,Cz],[Bx,f,Cz],[A,f,Cz],tex(W,'b',off[0]),'G');   // (the street's side, y0: the keep's back)
      bq([Bx,e,D],[A,e,D],[A,f,D],[Bx,f,D],tex(W,'f',off[0]),'G');   // (the park's side, y1: the keep's front, its door into the park)
      bq([A,e,D],[A,e,Cz],[A,f,Cz],[A,f,D],tex(Dp,'l',off[1]),'G');
      bq([Bx,e,Cz],[Bx,e,D],[Bx,f,D],[Bx,f,Cz],tex(Dp,'r',off[1]),'G');
      bq([A,f,D],[Bx,f,D],[Bx,f,Cz],[A,f,Cz],faceTex(W,Dp,(i,j)=>C(top(i,j))),'G'); };
    const trim=()=>[184,174,150];
    BATCH.tag=OBJ('park','the squirrel\'s tower');
    box(x0,y0,x1,y1,0,H,lead,520,[0,0]);   // (the tower)
    // the corner turrets: a little out from each corner and up past the parapet, their own merlons
    const TW=.62, TO=.18; for(const [cx,cy] of [[x0,y0],[x1,y0],[x0,y1],[x1,y1]]){ const a=cx-TW/2+(cx===x0?-TO:TO), b=cy-TW/2+(cy===y0?-TO:TO);
      box(a,b,a+TW,b+TW,0,TH,trim,600,[cx===x0?0:(x1-x0)*24-TW*24,cy===y0?0:(y1-y0)*24-TW*24]);
      for(const [mx,my] of [[a,b],[a+TW-.18,b],[a,b+TW-.18],[a+TW-.18,b+TW-.18]])box(mx,my,mx+.18,my+.18,TH,TH+PH,trim,TH+PH+4); }
    // the parapet's merlons along each side between the turrets
    const M=.2, G=.42; for(let x=x0+TW*.6;x<x1-TW*.6-M;x+=G){ box(x,y0,x+M,y0+.16,H,H+PH,trim,H+PH+4); box(x,y1-.16,x+M,y1,H,H+PH,trim,H+PH+4); }
    for(let y=y0+TW*.6;y<y1-TW*.6-M;y+=G){ box(x0,y,x0+.16,y+M,H,H+PH,trim,H+PH+4); box(x1-.16,y,x1,y+M,H,H+PH,trim,H+PH+4); }
    BATCH.tag=null;
    BATCH.cast=true; BATCH.build((k,map,emap)=>new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide})); BATCH.cast=false;
    const Ms=BATCH.meshes||{}; BATCH.meshes={}; for(const me of Object.values(Ms)){ if(MAPG.park)MAPG.park.add(me); GTOWER.me=me; }
    // where you can't walk: the tower and its turrets
    const sol=(a0,b0,a1,b1,h)=>{ SOL.up.push([X(a0),Z(b0),X(a1),Z(b1)]); FIX.up.push([X(a0),Z(b0),0,X(a1),Z(b1),Y(h)]); };
    sol(x0-TO,y0-TO,x1+TO,y1+TO,TH); GTOWER.ready=true; };
  const go=()=>{ if(!window.__started||typeof GCAVE==='undefined'||!GCAVE.S||!PARK.fire)return setTimeout(go,400); setTimeout(()=>{ try{ build(); }catch(e){ console.warn('TOWER: not built',e); } },600); };
  go(); }
