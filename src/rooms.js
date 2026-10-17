// ---- ONLY THE ROOM YOU'RE IN (owner, 17 Oct 2026: "you should only see the interior of the room your in", "the rest of the map should go black when
// you are in an interior"): inside a building, the room you stand in is all that's drawn; everything past its walls is cut away (six planes round
// it, for every material at once) and the sky goes black; the characters outside it are hidden. You can still zoom out and turn round it.
// The rooms: the bodega's shop and its back office, Ghost Street's dojo, the apartment building's (the gym, the core, the hallway, the pool hall, the lobby, the
// office), the apartment house's on the floor you're on ----
const ROOMS={cur:null};
{ const V=THREE.Vector3, PL=[0,1,2,3,4,5].map(()=>new THREE.Plane()), m=.14*TILE; let RL=null;
  const box=(X,Z,t,y0,y1)=>{ const a=X(t[0]), b=X(t[2]), c=Z(t[1]), d=Z(t[3]); return {x0:Math.min(a,b),x1:Math.max(a,b),z0:Math.min(c,d),z1:Math.max(c,d),y0,y1}; };
  const build=()=>{ RL=[]; const B=BOD.B0;
    RL.push(box(BOD.X,BOD.Z,[B.x0,BOD.BODOFF,B.x1,B.y1],-1,BOD.Y(B.h)),box(BOD.X,BOD.Z,[B.x0,B.y0,B.x1,BOD.BODOFF],-1,BOD.Y(B.h)));
    for(const t of POOLR.ROOMS||[])RL.push(box(POOLR.X,POOLR.Z,t,POOLR.Y(-150),POOLR.Y(POOLR.H)));
    if(BOD.GD)RL.push(box(BOD.X,BOD.Z,BOD.GD.r,-1,BOD.Y(BOD.GD.H)));   // (Ghost Street's dojo: ghostdojo.js)
    for(const R of STORE.rooms)if(R.walls)RL.push(R); };   // (the storeroom's rooms: store.js)
  ROOMS.boxes=()=>{ if(!RL)build(); return RL; };
  ROOMS.reset=()=>{ RL=null; };   // (the stacked rooms, built after the game opens: store.js)   // (the rooms, for the lamps: a lamp in one lights only it, map-post.js's LITE)
  const within=(b,x,z,e=0)=>x>b.x0-e&&x<b.x1+e&&z>b.z0-e&&z<b.z1+e;
  ROOMS.tick=()=>{ if(!RL)build(); let hit=null; if(typeof LOOKS!=='undefined'&&LOOKS.light)LOOKS.light();   // (his own shadow from the light really on him: looks.js)
    if(LVL==='up'&&!UI.freeCam&&!ED.on){
      // (owner, 17 Oct 2026: "when i first walk into interior its cutting off the back of my body too"): a room is yours once all of you is in it
      // (half a tile in from its walls); in a doorway, coming or going, nothing is cut
      const IN=-.55*TILE; hit=RL.find(b=>within(b,pos.x,pos.z,IN)&&py>b.y0-.3&&py<b.y1)||null;   /* (and by your height: the rooms stacked on the apartments share their ground) */
      const A=MODS.apts; if(!hit&&A&&A.in){ const lv=A.floor(), S=BOD.K.STORY; for(const t of A.rects(lv)){ const b=box(BOD.X,BOD.Z,t,BOD.Y(lv*S)-.5,BOD.Y((lv+1)*S)); if(within(b,pos.x,pos.z,IN)){ hit=b; break; } } } }
    ROOMS.cur=hit; if(BOD.GD)BOD.GD.tick(); if(MODS.dungeon)MODS.dungeon.tick();   // (the dungeon's torches flicker: castle.js)   // (the dojo's flames: lit only while you're in it)
    // THE LIGHTS OVERHEAD (owner, 17 Oct 2026: "dont show over head lights in any view unless looking up at them"): only from under them
    for(const h of OVERHEAD)h.o.visible=cam.position.y<h.y;
    if(hit){ PL[0].set(new V(1,0,0),-(hit.x0-m)); PL[1].set(new V(-1,0,0),hit.x1+m); PL[2].set(new V(0,0,1),-(hit.z0-m)); PL[3].set(new V(0,0,-1),hit.z1+m); PL[4].set(new V(0,1,0),-hit.y0); PL[5].set(new V(0,-1,0),hit.y1+.05);
      renderer.clippingPlanes=PL; scene.background.setRGB(0,0,0); }
    else if(renderer.clippingPlanes.length)renderer.clippingPlanes=[];
    // the characters: only those in the room (a troublemaker below ground, hidden by his own mind, left alone)
    const show=(g,x,z,o)=>{ const sh=!hit||within(hit,x,z,.4*TILE); if(!sh){ if(g.visible){ g.visible=false; o._rh=true; } } else if(o._rh){ g.visible=true; o._rh=false; } };
    for(const N of NPCS){ if(N.lv!=='up'||N.mode==='hidden'||N.far)continue; show(N.g,N.g.position.x,N.g.position.z,N); }
    if(typeof MUS!=='undefined'&&MUS.g)show(MUS.g,MUS.at.x,MUS.at.z,MUS); if(typeof PNM!=='undefined'&&PNM.g)show(PNM.g,PNM.at.x,PNM.at.z,PNM); if(typeof SGM!=='undefined'&&SGM.g)show(SGM.g,SGM.at.x,SGM.at.z,SGM); if(typeof DRM!=='undefined'&&DRM.g)show(DRM.g,DRM.at.x,DRM.at.z,DRM);   // (the pianist, the singer and the drummer, in the stored bar: pianist.js, singer.js, drummer.js)
    if(typeof WATER!=='undefined'&&WATER.mesh){ show(WATER.mesh,WATER.mesh.position.x,WATER.mesh.position.z,WATER); for(const w of WATER.extra)if(w.mesh)show(w.mesh,w.mesh.position.x,w.mesh.position.z,w); } };   // (the pool's water, its own shader: shown only from the pool hall; the pond's and the tank's: the store's)
}
