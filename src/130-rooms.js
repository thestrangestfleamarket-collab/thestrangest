// ROOMS: which room you are in, roofs hidden when inside, and roofAt.
const ROOMS={cur:null}; window.ROOMS=ROOMS;
ROOMS.roofAt=(x,y,z)=>{ const h=new THREE.Raycaster(new THREE.Vector3(x,y,z),new THREE.Vector3(0,1,0),0,12).intersectObjects(scene.children,true).find(i=>{ for(let q=i.object;q;q=q.parent)if(!q.visible)return false; return i.object.isMesh&&!i.object.isSkinnedMesh; }); return h?+h.distance.toFixed(2):null; };
{ const V=THREE.Vector3, PL=[0,1,2,3,4,5].map(()=>new THREE.Plane()), m=.14*TILE; let RL=null;
  const NEAR=[new THREE.Plane(new V(0,-1,0),1e6),new THREE.Plane(new V(1,0,0),1e6),new THREE.Plane(new V(0,0,1),1e6)]; let NEARON=false, NEARIN=false;
  { const C=THREE.ShaderChunk, k='clipping_planes_fragment', a0='clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;', a1='if ( clipped ) discard;';
    if(C[k].includes(a0)&&C[k].includes(a1))C[k]=C[k].replace('bool clipped = true;','bool clipped = true; bool cfirst = true; bool cany = ( NUM_CLIPPING_PLANES - UNION_CLIPPING_PLANES ) < 2;')
      .replace(a0,'{ bool c = dot( vClipPosition, plane.xyz ) > plane.w; if ( cfirst ) { clipped = c; cfirst = false; } else cany = cany || c; }').replace(a1,'if ( clipped && cany ) discard;');
    else console.warn('ROOMS: three\'s clipping chunk not as expected; the near side cuts as before'); }
  const box=(X,Z,t,y0,y1)=>{ const a=X(t[0]), b=X(t[2]), c=Z(t[1]), d=Z(t[3]); return {x0:Math.min(a,b),x1:Math.max(a,b),z0:Math.min(c,d),z1:Math.max(c,d),y0,y1}; };
  const sband=R=>{ const d=R.dw, B=R.B, h=d.wd/2+.2; return box(BOD.X,BOD.Z,d.w==='f'?[d.a-h,B.y1-.05,d.a+h,B.y1+.55]:d.w==='b'?[d.a-h,B.y0-.55,d.a+h,B.y0+.05]:d.w==='w'?[B.x0-.55,d.a-h,B.x0+.05,d.a+h]:[B.x1-.05,d.a-h,B.x1+.55,d.a+h],-1,0); };
  const build=()=>{ RL=[]; const B=BOD.B0, mB=(B.x0+B.x1)/2, sb=box(BOD.X,BOD.Z,[B.x0,BOD.BODOFF,B.x1,B.y1],-1,BOD.Y(B.h)), ob=box(BOD.X,BOD.Z,[B.x0,B.y0,B.x1,BOD.BODOFF],-1,BOD.Y(B.h));
    sb.lz=ob.lz='bodega'; sb.band=box(BOD.X,BOD.Z,[mB-.98,B.y1-.05,mB+.98,B.y1+.55],-1,0); RL.push(sb,ob);
    if(BOD.GD){ const G=BOD.GD, h=(G.dw||2.4)/2+.2, gb=box(BOD.X,BOD.Z,G.r,G.y0||-1,BOD.Y(G.H)); gb.lz='bath'; gb.band=box(BOD.X,BOD.Z,[G.door[0]-h,G.door[1]-.3,G.door[0]+h,G.door[1]+.55],-1,0); RL.push(gb); }
    for(const R of STORE.rooms)if(R.walls){ if(R.dw&&R.B&&!R.band)R.band=sband(R); RL.push(R); }
    if(window.CIVIC&&CIVIC.tower){ const t=CIVIC.tower; RL.push({id:'civic',x0:t.x0,x1:t.x1,z0:t.z0,z1:t.z1,y0:t.y-1,y1:t.y+t.H}); } };
  ROOMS.boxes=()=>{ if(!RL)build(); return RL; };
  ROOMS.reset=()=>{ RL=null; if(IV.key){ IV.re=IV.key; leave(); } IV.C.clear(); };
  const within=(b,x,z,e=0)=>x>b.x0-e&&x<b.x1+e&&z>b.z0-e&&z<b.z1+e;
  ROOMS.nearAll=()=>{ NEARON=true; const skip=new Set([W3.group,...NPCS.map(N=>N.g),...NPCS.extra.map(X=>X.g).filter(Boolean)]); for(const o of [typeof MUS!=='undefined'&&MUS.g,typeof PNM!=='undefined'&&PNM.g,typeof SGM!=='undefined'&&SGM.g,typeof DRM!=='undefined'&&DRM.g])if(o)skip.add(o);
        const own=new Set(); for(const g of skip)g.traverse(c=>{ if(c.material)for(const mt of [].concat(c.material))own.add(mt); });
        const walk=o=>{ if(skip.has(o)||o.isSkinnedMesh)return; const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; for(const mt of ms){ if(own.has(mt)||mt.clippingPlanes===NEAR||(mt.isShaderMaterial&&!mt.clipping)||(mt.clippingPlanes&&mt.clippingPlanes.length))continue; mt.clippingPlanes=NEAR; mt.clipIntersection=true; mt.needsUpdate=true; } for(const c of o.children)walk(c); };
        walk(scene); };
  const IV={key:null,b:null,want:null,re:null,busy:false,H:[],L:[],S:[],top:new Set(),nc:0,C:new Map()}; ROOMS.iv=IV;
  ROOMS.lazy={bodega:{name:'THE BODEGA',go:()=>BODB.build&&BODB.build(),need:()=>LOAD(BODB.build&&BODB.build.chunk),done:false},bath:{name:'THE BATH HOUSE',go:()=>BOD.GD&&BOD.GD.build&&BOD.GD.build(),need:()=>LOAD(BOD.GD&&BOD.GD.build&&BOD.GD.build.chunk),done:false}};
  const kOf=b=>[b.x0,b.z0,b.x1,b.z1,b.y0].map(v=>(+v).toFixed(2)).join();
  const lazyOf=b=>{ if(!b)return null; const L=b.lz&&ROOMS.lazy[b.lz]; if(L)return L.done?null:L; const S=b.id&&STORE.inside&&STORE.inside[b.id];
    return S&&!S.done?{name:/^THE /.test(S.name)?S.name:'THE '+S.name,S,go:()=>{ S.busy=false; STORE.inGo(b.id); },need:()=>STORE.need&&STORE.need()}:null; };
  const BX=new THREE.Box3(), V3=new V();
  const ovl=(a,r)=>a.max.x>r.x0&&a.min.x<r.x1&&a.max.z>r.z0&&a.min.z<r.z1&&a.max.y>r.y0&&a.min.y<r.y1, con=(a,r)=>a.min.x>=r.x0&&a.max.x<=r.x1&&a.min.z>=r.z0&&a.max.z<=r.z1&&a.min.y>=r.y0&&a.max.y<=r.y1;
  const pin=(r,x,y,z)=>x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1&&y>r.y0&&y<r.y1;
  const scan=(b,roots)=>{ '@later'; const e=.15*TILE, R={x0:b.x0-e,x1:b.x1+e,z0:b.z0-e,z1:b.z1+e,y0:b.y0-.3,y1:b.y1+.1*TILE}, D=b.band?{x0:b.band.x0,x1:b.band.x1,z0:b.band.z0,z1:b.band.z1,y0:R.y0,y1:R.y1}:null;
    const inn=(x,y,z)=>pin(R,x,y,z)||!!D&&pin(D,x,y,z), T={H:[],L:[],S:[],top:new Set(roots)};
    const skip=new Set([W3.group,...NPCS.map(N=>N.g),...(NPCS.extra||[]).map(q=>q&&q.g),FLAME.me,WATER.mesh,...(WATER.extra||[]).map(w=>w.mesh),
      typeof MUS!=='undefined'&&MUS.g,typeof PNM!=='undefined'&&PNM.g,typeof SGM!=='undefined'&&SGM.g,typeof DRM!=='undefined'&&DRM.g].filter(Boolean));
    const batch=o=>o.isMesh&&!o.isInstancedMesh&&!o.isSkinnedMesh&&!!o.geometry.attributes.aOp&&!o.geometry.index&&!(typeof CULL!=='undefined'&&CULL.M.has(o))&&!(o.userData.intr&&typeof o.userData.intr==='object');
    const st=o=>{ const g=o.geometry; BX.makeEmpty(); if(o.isInstancedMesh){ o.computeBoundingBox(); if(o.boundingBox)BX.copy(o.boundingBox); } else if(g&&!o.isSprite){ if(!g.boundingBox)g.computeBoundingBox(); BX.copy(g.boundingBox); }
      if(BX.isEmpty()){ o.getWorldPosition(V3); return inn(V3.x,V3.y,V3.z)?1:0; } BX.applyMatrix4(o.matrixWorld);
      if(con(BX,R)||D&&con(BX,D))return 1; if(!ovl(BX,R)&&!(D&&ovl(BX,D)))return 0; if(batch(o))return 2; BX.getCenter(V3);
      return inn(V3.x,V3.y,V3.z)&&BX.max.x-BX.min.x<R.x1-R.x0+2*TILE&&BX.max.z-BX.min.z<R.z1-R.z0+2*TILE&&BX.max.y-BX.min.y<R.y1-R.y0+TILE?1:0; };
    const sub=o=>{ const g=o.geometry, P=g.attributes.position.array, n=P.length/18|0, E=o.matrixWorld.elements, k=[];
      for(let f=0;f<n;f++){ let x=0,y=0,z=0; for(let q=0;q<6;q++){ const i=(f*6+q)*3, a=P[i], c=P[i+1], d=P[i+2]; x+=E[0]*a+E[4]*c+E[8]*d+E[12]; y+=E[1]*a+E[5]*c+E[9]*d+E[13]; z+=E[2]*a+E[6]*c+E[10]*d+E[14]; } if(inn(x/6,y/6,z/6))k.push(f); }
      if(k.length===n)return; if(!k.length){ T.L.push(o); return; } const ix=new Uint32Array(k.length*6); k.forEach((f,i)=>{ for(let q=0;q<6;q++)ix[i*6+q]=f*6+q; }); T.S.push({o,g,ix:new THREE.BufferAttribute(ix,1)}); };
    const walk=o=>{ if(skip.has(o)||o.isLight||o.isCamera||o.userData.cullOf)return true; const own=o.geometry||o.isSprite||!o.children.length?st(o):-1; let kept=false; const outs=[];
      for(const c of o.children){ if(walk(c))kept=true; else outs.push(c); }
      if(!kept&&own<=0)return false; for(const c of outs)T.H.push(c); if(own===0)T.L.push(o); else if(own===2)sub(o); return true; };
    for(const c of roots)if(!walk(c))T.H.push(c); return T; };
  const put=T=>{ for(const o of T.H){ IV.H.push([o,o.visible]); o.visible=false; } for(const o of T.L){ IV.L.push([o,o.layers.mask]); o.layers.mask=0; } for(const q of T.S)if(q.o.geometry===q.g){ IV.S.push([q.g,q.g.index]); q.g.setIndex(q.ix); } };
  const leave=()=>{ if(!IV.key)return; for(const [o,v] of IV.H)o.visible=v; for(const [o,m] of IV.L)o.layers.mask=m; for(const [g,i] of IV.S)g.setIndex(i); IV.H=[]; IV.L=[]; IV.S=[]; IV.key=null; IV.b=null;
    if(typeof LITE!=='undefined')for(const L of LITE.pool)if(L.castShadow)L.shadow.needsUpdate=true; };
  const apply=w=>{ leave(); if(!w)return; let T=IV.C.get(w.key); if(!T){ scene.updateMatrixWorld(); T=scan(w.b,scene.children.slice()); IV.C.set(w.key,T); } put(T); IV.top=new Set(T.top); IV.nc=-1; IV.key=w.key; IV.b=w.b; };
  const frames=n=>new Promise(r=>{ const f=()=>--n<=0?r():requestAnimationFrame(f); requestAnimationFrame(f); });
  const swap=async()=>{ const el=document.getElementById('subfade'), w=IV.want, lz=w&&lazyOf(w.b);
    if(!el||!window.__started||el.style.opacity==='1'){ if(lz){ await lz.need(); lz.go(); } apply(IV.want); return; }
    IV.busy=true; const tr=el.style.transition; el.style.transition='none'; el.textContent=lz?'ENTERING '+lz.name:''; el.style.opacity='1';
    try{ if(lz){ if(lz.S)lz.S.busy=true; if(typeof keys!=='undefined'&&keys.clear)keys.clear(); await frames(2); await lz.need(); lz.go(); await frames(1); }
      const l2=IV.want&&lazyOf(IV.want.b); if(l2){ await l2.need(); l2.go(); } apply(IV.want); await frames(2); }
    finally{ el.style.transition=tr; el.style.opacity='0'; IV.busy=false; } };
  ROOMS.hold=()=>{ if(!IV.key)return; if(scene.children.length!==IV.nc){ IV.nc=scene.children.length; const nw=scene.children.filter(c=>!IV.top.has(c)); if(nw.length){ for(const c of nw)IV.top.add(c); put(scan(IV.b,nw)); } }
    for(const q of IV.H)q[0].visible=false; for(const q of IV.L)q[0].layers.mask=0; if(scene.background&&scene.background.isColor)scene.background.setRGB(0,0,0); };
  ROOMS.dark=()=>!!IV.key;
  window.INTDBG=()=>({inside:IV.key?IV.b.lz||IV.b.id||IV.key:null,built:[...Object.keys(ROOMS.lazy).filter(k=>ROOMS.lazy[k].done),...Object.keys(STORE.inside||{}).filter(k=>STORE.inside[k].done)],hidden:IV.H.length+IV.L.length+IV.S.length,busy:IV.busy});
  const unclip=g=>{ if(g)g.traverse(c=>{ if(c.material)for(const mt of [].concat(c.material))if(mt.clippingPlanes===NEAR){ mt.clippingPlanes=null; mt.needsUpdate=true; } }); };
  ROOMS.tick=()=>{ if(!RL)build(); let hit=null, bnd=null; if(NEARON)unclip(W3.group); if(typeof LOOKS!=='undefined'&&LOOKS.light)LOOKS.light();
    if(LVL==='up'&&!UI.freeCam&&!ED.on&&!MAPED.on&&!(window.DRONE&&DRONE.cam)){
      const IN=-.55*TILE; hit=RL.find(b=>(within(b,pos.x,pos.z,0)||!!b.band&&within(b.band,pos.x,pos.z,0))&&py>b.y0-.3&&py<b.y1)||null;
      const A=MODS.apts; if(!hit&&A&&A.in){ const lv=A.floor(), S=BOD.K.STORY; for(const t of A.rects(lv)){ const b=box(BOD.X,BOD.Z,t,A.lvY(lv)-.5,A.lvY(lv+1)); if(within(b,pos.x,pos.z,lv>0?0:IN)){ hit=b; break; } } } }
    ROOMS.cur=hit; { const w=hit?{key:kOf(hit),b:hit}:null; IV.want=w; const wk=w?w.key:null; if(wk!==IV.key&&!IV.busy){ if(wk&&wk===IV.re&&!lazyOf(hit))apply(w); else swap().catch(()=>{ IV.busy=false; }); } IV.re=null; }
    if(BODB.card)BODB.card.visible=!(IV.b&&IV.b.lz==='bodega'); if(BOD.GDK&&BOD.GDK.card)BOD.GDK.card.visible=!(IV.b&&IV.b.lz==='bath'); if(IV.key&&scene.background)scene.background.setRGB(0,0,0);
    UI.isoPlace(); if(BOD.GD)BOD.GD.tick(); if(MODS.dungeon)MODS.dungeon.tick();
    for(const h of OVERHEAD)SEEN(h.o,cam.position.y<h.y);
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
    const HB=IV.key?IV.b:FREE?null:hit, show=(g,x,z,o,y)=>{ const sh=!HB||within(HB,x,z,.4*TILE)&&(y==null||y>HB.y0-.3&&y<HB.y1); if(!sh){ if(g.visible){ g.visible=false; o._rh=true; } } else if(o._rh){ g.visible=true; o._rh=false; } };
    for(const N of NPCS){ if(N.lv!=='up'||N.mode==='hidden'||N.hid)continue; show(N.g,N.g.position.x,N.g.position.z,N,N.g.position.y); }
    if(typeof MUS!=='undefined'&&MUS.g)show(MUS.g,MUS.at.x,MUS.at.z,MUS,MUS.at.y); if(typeof PNM!=='undefined'&&PNM.g)show(PNM.g,PNM.at.x,PNM.at.z,PNM); if(typeof SGM!=='undefined'&&SGM.g)show(SGM.g,SGM.at.x,SGM.at.z,SGM); if(typeof DRM!=='undefined'&&DRM.g)show(DRM.g,DRM.at.x,DRM.at.z,DRM);
    if(typeof WATER!=='undefined'&&WATER.mesh){ show(WATER.mesh,WATER.mesh.position.x,WATER.mesh.position.z,WATER); for(const w of WATER.extra)if(w.mesh)show(w.mesh,w.mesh.position.x,w.mesh.position.z,w); } };
}
{ const t=ROOMS.tick; ROOMS.tick=()=>{ t(); OUT.tick(); }; }
