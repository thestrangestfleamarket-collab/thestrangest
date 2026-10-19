const ROOMS={cur:null}; window.ROOMS=ROOMS;
ROOMS.roofAt=(x,y,z)=>{ const h=new THREE.Raycaster(new THREE.Vector3(x,y,z),new THREE.Vector3(0,1,0),0,12).intersectObjects(scene.children,true).find(i=>{ for(let q=i.object;q;q=q.parent)if(!q.visible)return false; return i.object.isMesh&&!i.object.isSkinnedMesh; }); return h?+h.distance.toFixed(2):null; };
{ const V=THREE.Vector3, PL=[0,1,2,3,4,5].map(()=>new THREE.Plane()), m=.14*TILE; let RL=null;
  const NEAR=[new THREE.Plane(new V(0,-1,0),1e6),new THREE.Plane(new V(1,0,0),1e6),new THREE.Plane(new V(0,0,1),1e6)]; let NEARON=false, NEARIN=false;
  { const C=THREE.ShaderChunk, k='clipping_planes_fragment', a0='clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;', a1='if ( clipped ) discard;';
    if(C[k].includes(a0)&&C[k].includes(a1))C[k]=C[k].replace('bool clipped = true;','bool clipped = true; bool cfirst = true; bool cany = ( NUM_CLIPPING_PLANES - UNION_CLIPPING_PLANES ) < 2;')
      .replace(a0,'{ bool c = dot( vClipPosition, plane.xyz ) > plane.w; if ( cfirst ) { clipped = c; cfirst = false; } else cany = cany || c; }').replace(a1,'if ( clipped && cany ) discard;');
    else console.warn('ROOMS: three\'s clipping chunk not as expected; the near side cuts as before'); }
  const box=(X,Z,t,y0,y1)=>{ const a=X(t[0]), b=X(t[2]), c=Z(t[1]), d=Z(t[3]); return {x0:Math.min(a,b),x1:Math.max(a,b),z0:Math.min(c,d),z1:Math.max(c,d),y0,y1}; };
  const build=()=>{ RL=[]; const B=BOD.B0;
    RL.push(box(BOD.X,BOD.Z,[B.x0,BOD.BODOFF,B.x1,B.y1],-1,BOD.Y(B.h)),box(BOD.X,BOD.Z,[B.x0,B.y0,B.x1,BOD.BODOFF],-1,BOD.Y(B.h)));
    for(const t of POOLR.ROOMS||[])RL.push(box(POOLR.X,POOLR.Z,t,POOLR.Y(-150),POOLR.Y(POOLR.H)));
    if(BOD.GD)RL.push(box(BOD.X,BOD.Z,BOD.GD.r,-1,BOD.Y(BOD.GD.H)));
    for(const R of STORE.rooms)if(R.walls)RL.push(R);
    if(window.CIVIC&&CIVIC.tower){ const t=CIVIC.tower; RL.push({id:'civic',x0:t.x0,x1:t.x1,z0:t.z0,z1:t.z1,y0:t.y-1,y1:t.y+t.H}); } };
  ROOMS.boxes=()=>{ if(!RL)build(); return RL; };
  ROOMS.reset=()=>{ RL=null; };
  const within=(b,x,z,e=0)=>x>b.x0-e&&x<b.x1+e&&z>b.z0-e&&z<b.z1+e;
  ROOMS.nearAll=()=>{ NEARON=true; const skip=new Set([W3.group,...NPCS.map(N=>N.g),...NPCS.extra.map(X=>X.g).filter(Boolean)]); for(const o of [typeof MUS!=='undefined'&&MUS.g,typeof PNM!=='undefined'&&PNM.g,typeof SGM!=='undefined'&&SGM.g,typeof DRM!=='undefined'&&DRM.g])if(o)skip.add(o);
        const walk=o=>{ if(skip.has(o)||o.isSkinnedMesh)return; const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; for(const mt of ms){ if(mt.clippingPlanes===NEAR||(mt.isShaderMaterial&&!mt.clipping)||(mt.clippingPlanes&&mt.clippingPlanes.length))continue; mt.clippingPlanes=NEAR; mt.clipIntersection=true; mt.needsUpdate=true; } for(const c of o.children)walk(c); };
        walk(scene); };
  ROOMS.tick=()=>{ if(!RL)build(); let hit=null, bnd=null; if(typeof LOOKS!=='undefined'&&LOOKS.light)LOOKS.light();
    if(LVL==='up'&&!UI.freeCam&&!ED.on&&!MAPED.on&&!(window.DRONE&&DRONE.cam)){
      const IN=-.55*TILE; hit=RL.find(b=>within(b,pos.x,pos.z,IN)&&py>b.y0-.3&&py<b.y1)||null;
      const A=MODS.apts; if(!hit&&A&&A.in){ const lv=A.floor(), S=BOD.K.STORY; for(const t of A.rects(lv)){ const b=box(BOD.X,BOD.Z,t,A.lvY(lv)-.5,A.lvY(lv+1)); if(within(b,pos.x,pos.z,lv>0?0:IN)){ hit=b; break; } } } }
    ROOMS.cur=hit; UI.isoPlace(); if(BOD.GD)BOD.GD.tick(); if(MODS.dungeon)MODS.dungeon.tick();
    for(const h of OVERHEAD)h.o.visible=cam.position.y<h.y;
    const cutOn=hit&&!UI.persp&&(UI.view==='iso'||UI.view==='map');
    if(cutOn){ if(!NEARON||!NEARIN)ROOMS.nearAll(); NEARIN=true;
      const cx=cam.position.x-pos.x, cz=cam.position.z-pos.z, l=Math.hypot(cx,cz)||1, ux=cx/l, uz=cz/l, BAND=1.1*TILE;
      NEAR[0].normal.set(0,-1,0); NEAR[0].constant=py+.45*ZU*24/.84;
      if(Math.abs(ux)>.2){ if(ux>0){ NEAR[1].normal.set(-1,0,0); NEAR[1].constant=hit.x1-BAND; } else { NEAR[1].normal.set(1,0,0); NEAR[1].constant=-(hit.x0+BAND); } } else NEAR[1].set(new V(-1,0,0),1e6);
      if(Math.abs(uz)>.2){ if(uz>0){ NEAR[2].normal.set(0,0,-1); NEAR[2].constant=hit.z1-BAND; } else { NEAR[2].normal.set(0,0,1); NEAR[2].constant=-(hit.z0+BAND); } } else NEAR[2].set(new V(0,0,-1),1e6); }
    else if(!hit&&!UI.persp&&(UI.view==='iso'||UI.view==='map')&&window.BLK&&LVL!=='down'&&(bnd=BLK.band(pos.x,pos.z))&&Math.abs(cam.position.z-pos.z)>.2*Math.hypot(cam.position.x-pos.x,cam.position.z-pos.z)){
      if(!NEARON||!NEARIN)ROOMS.nearAll(); NEARIN=true; NEAR[0].normal.set(0,-1,0); NEAR[0].constant=py+.45*ZU*24/.84; NEAR[1].set(new V(-1,0,0),1e6);
      if(cam.position.z>pos.z){ NEAR[2].normal.set(0,0,-1); NEAR[2].constant=bnd.z1-.05*TILE; } else { NEAR[2].normal.set(0,0,1); NEAR[2].constant=-(bnd.z0+.05*TILE); } }
    else { NEARIN=false; if(NEARON&&NEAR[0].constant<1e5){ NEAR[0].constant=NEAR[1].constant=NEAR[2].constant=1e6; } }
    if(hit&&!FREE){ PL[0].set(new V(1,0,0),-(hit.x0-m)); PL[1].set(new V(-1,0,0),hit.x1+m); PL[2].set(new V(0,0,1),-(hit.z0-m)); PL[3].set(new V(0,0,-1),hit.z1+m); PL[4].set(new V(0,1,0),-hit.y0); PL[5].set(new V(0,-1,0),hit.y1+.05);
      renderer.clippingPlanes=PL; scene.background.setRGB(0,0,0); }
    else if(renderer.clippingPlanes.length)renderer.clippingPlanes=[];
    const show=(g,x,z,o,y)=>{ const sh=FREE||!hit||within(hit,x,z,.4*TILE)&&(y==null||y>hit.y0-.3&&y<hit.y1); if(!sh){ if(g.visible){ g.visible=false; o._rh=true; } } else if(o._rh){ g.visible=true; o._rh=false; } };
    for(const N of NPCS){ if(N.lv!=='up'||N.mode==='hidden'||N.hid)continue; show(N.g,N.g.position.x,N.g.position.z,N,N.g.position.y); }
    if(typeof MUS!=='undefined'&&MUS.g)show(MUS.g,MUS.at.x,MUS.at.z,MUS,MUS.at.y); if(typeof PNM!=='undefined'&&PNM.g)show(PNM.g,PNM.at.x,PNM.at.z,PNM); if(typeof SGM!=='undefined'&&SGM.g)show(SGM.g,SGM.at.x,SGM.at.z,SGM); if(typeof DRM!=='undefined'&&DRM.g)show(DRM.g,DRM.at.x,DRM.at.z,DRM);
    if(typeof WATER!=='undefined'&&WATER.mesh){ show(WATER.mesh,WATER.mesh.position.x,WATER.mesh.position.z,WATER); for(const w of WATER.extra)if(w.mesh)show(w.mesh,w.mesh.position.x,w.mesh.position.z,w); } };
}
{ const t=ROOMS.tick; ROOMS.tick=()=>{ t(); OUT.tick(); }; }
