// ---- ONLY WHAT'S NEEDED, DRAWN (owner, 17 Oct 2026: "we need to look at ways to cut down on lag. we dont need to render rooms we arent in
// already. render rooms only when going in 1st time"; his list from the audit, approved): what's drawn and run is only what can be seen.
// ?perfx=0 turns all of it off (a test's before), ?perfx=-1,-4 one or more of them (1 interiors, 2 self-shadows, 4 bounds, 6 shadow maps, 7 sims) ----
const PERFX={on:{}, inner:[], gen:0};
{ const q=QS.get('perfx'); for(const k of [1,2,4,5,6,7])PERFX.on[k]=q!=='0'&&!(q||'').split(',').includes('-'+k); }
// 1. THE ROOMS' INSIDES: every batched face inside a room's box (its things, its inner walls, its ceiling; not its floor, not the walls round
// it, not its roof) moved to a mesh of that room's own, a child of the batch it came from (so it moves, lifts and hides with it); drawn only
// while you're in that room or at its door, never from the street; its buffers go to the graphics card the first time it's drawn, the first
// time you go in. Each face's thing follows it (OBJS' parts: the world editor, use.js, clip.js)
{ const key=b=>[b.x0,b.z0,b.x1,b.z1,b.y0].map(v=>(+v).toFixed(2)).join();
  PERFX.split=()=>{ if(!PERFX.on[1]){ PERFX.chunk(); PERFX.gen++; return; } const RB=ROOMS.boxes(), m=.25*TILE, tol=.05*TILE, list=[];
    scene.traverse(o=>{ if(o.isMesh&&(o.userData.objOf||o.userData.splitOK)&&!o.userData.split&&!o.userData.inner&&!o.geometry.index)list.push(o); });   // (splitOK: a place's own unbatched mesh, the bodega's things: bodbuild.js)
    const byMe=new Map(); for(const o of OBJS)for(const p of o.parts){ (byMe.get(p.me)||byMe.set(p.me,[]).get(p.me)).push(p); }
    for(const me of list){ me.userData.split=true; const g=me.geometry, P=g.attributes.position.array, nF=P.length/18; me.updateWorldMatrix(true,false); const E=me.matrixWorld.elements;
      const fb=new Int16Array(nF).fill(-1), flat=new Uint8Array(nF), lo=new Float32Array(nF), hiY=new Float32Array(nF), lvA=RB.map(()=>new Map());
      for(let f=0;f<nF;f++){ let x=0,y=0,z=0,a=1e9,b=-1e9; for(let v=0;v<6;v++){ const i=(f*6+v)*3, px=P[i], py_=P[i+1], pz=P[i+2], wy=E[1]*px+E[5]*py_+E[9]*pz+E[13];
          x+=E[0]*px+E[4]*py_+E[8]*pz+E[12]; y+=wy; z+=E[2]*px+E[6]*py_+E[10]*pz+E[14]; a=Math.min(a,wy); b=Math.max(b,wy); } x/=6; y/=6; z/=6; lo[f]=a; hiY[f]=b; flat[f]=b-a<tol?1:0;
        for(let j=0;j<RB.length;j++){ const B=RB[j]; if(x>B.x0+m&&x<B.x1-m&&z>B.z0+m&&z<B.z1-m&&y>B.y0&&y<B.y1-tol){ fb[f]=j;
            if(flat[f]){ const i=f*18, ux=P[i+3]-P[i], uz=P[i+5]-P[i+2], vx=P[i+6]-P[i], vz=P[i+8]-P[i+2], k=Math.round(a/tol), M=lvA[j]; M.set(k,(M.get(k)||0)+Math.abs(ux*vz-uz*vx)); } break; } } }
      const floor=lvA.map(M=>{ let best=null, ba=0; for(const [k,A] of M)if(A>ba){ ba=A; best=k; } return best==null?-1e9:best*tol; });   // (each room's floor: the level its flat faces cover most)
      for(let f=0;f<nF;f++){ const j=fb[f]; if(j>=0&&flat[f]&&hiY[f]<=floor[j]+2*tol)fb[f]=-1; }   // (the floor stays: seen through the door and the windows)
      const groups=new Map(); for(let f=0;f<nF;f++)(groups.get(fb[f])||groups.set(fb[f],[]).get(fb[f])).push(f);
      if(![...groups.keys()].some(j=>j>=0))continue; if(!groups.has(-1))groups.set(-1,[]);
      const where=new Int32Array(nF), into=new Array(nF), names=Object.keys(g.attributes), make=fs=>{ const G=new THREE.BufferGeometry();
        for(const n of names){ const A=g.attributes[n], s=A.itemSize, src=A.array, dst=new src.constructor(fs.length*6*s); fs.forEach((f,k)=>dst.set(src.subarray(f*6*s,(f+1)*6*s),k*6*s)); G.setAttribute(n,new THREE.BufferAttribute(dst,s,A.normalized)); }
        G.computeBoundingSphere(); G.computeBoundingBox(); return G; };
      const objOf=me.userData.objOf;
      for(const [j,fs] of groups){ const G=make(fs), of=objOf?fs.map(f=>objOf[f]):undefined; let tgt;
        if(j<0){ tgt=me; me.geometry=G; me.userData.objOf=of; }
        else{ tgt=new THREE.Mesh(G,me.material); tgt.castShadow=me.castShadow; tgt.receiveShadow=me.receiveShadow; tgt.renderOrder=me.renderOrder; tgt.userData.objOf=of; tgt.userData.inner=key(RB[j]); tgt.userData.box=RB[j];
          tgt.visible=false; me.add(tgt); PERFX.inner.push(tgt); }
        fs.forEach((f,k)=>{ where[f]=k; into[f]=tgt; }); }
      for(const p of byMe.get(me)||[]){ const f=p.v0/6; p.me=into[f]; p.v0=where[f]*6; }
      g.dispose(); } PERFX.chunk(); PERFX.gen++; };
  // 5. THE BATCHES IN CHUNKS (the audit's fix 5, remade: merging small meshes would have gained little, the main pass has only 50 to 80 draws;
  // what cost was one batch spanning the map, the store's far rooms and the street's Diner in one mesh whose bounds always met the view, so
  // 75K triangles with nothing in view were drawn every frame): every batched mesh left outside the rooms is cut by the map's grid into chunks
  // (16 tiles a side), each a child of its own with its own bounds, so the view's frustum and each face of the lamp's shadow cube skip the
  // chunks they don't meet. A mesh that fits one cell stays as it is; a chunk is never made of under 300 faces. Each face's thing follows it
  PERFX.chunk=()=>{ if(!PERFX.on[5])return; const CS=16*TILE, list=[]; scene.traverse(o=>{ if(o.isMesh&&(o.userData.objOf||o.userData.splitOK)&&!o.userData.inner&&!o.userData.chunked&&!o.geometry.index)list.push(o); });
    const byMe=new Map(); for(const o of OBJS)for(const p of o.parts){ (byMe.get(p.me)||byMe.set(p.me,[]).get(p.me)).push(p); }
    for(const me of list){ me.userData.chunked=true; const g=me.geometry, P=g.attributes.position.array, nF=P.length/18; if(nF<600)continue; me.updateWorldMatrix(true,false); const E=me.matrixWorld.elements, cell=new Array(nF), cnt=new Map();
      for(let f=0;f<nF;f++){ let x=0,z=0; for(let v=0;v<6;v++){ const i=(f*6+v)*3, px=P[i], py_=P[i+1], pz=P[i+2]; x+=E[0]*px+E[4]*py_+E[8]*pz+E[12]; z+=E[2]*px+E[6]*py_+E[10]*pz+E[14]; } const k=Math.floor(x/6/CS)*4096+Math.floor(z/6/CS); cell[f]=k; cnt.set(k,(cnt.get(k)||0)+1); }
      if(cnt.size<2)continue; const big=[...cnt.entries()].filter(([,n])=>n>=60).map(([k])=>k); if(!big.length)continue; const home=big.reduce((a,b)=>cnt.get(b)>cnt.get(a)?b:a), cx=k=>Math.floor(k/4096), cz=k=>k-Math.floor(k/4096)*4096;
      const near=new Map(); for(const k of cnt.keys()){ if(big.includes(k)){ near.set(k,k); continue; } let bk=home, bd=1e9; for(const b of big){ const d=Math.hypot(cx(b)-cx(k),cz(b)-cz(k)); if(d<bd){ bd=d; bk=b; } } near.set(k,bk); }   // (a cell with few faces joins the nearest big one)
      const groups=new Map(); for(let f=0;f<nF;f++){ const k=near.get(cell[f]); (groups.get(k)||groups.set(k,[]).get(k)).push(f); } if(groups.size<2)continue;
      const where=new Int32Array(nF), into=new Array(nF), names=Object.keys(g.attributes), objOf=me.userData.objOf;
      const make=fs=>{ const G=new THREE.BufferGeometry(); for(const n of names){ const A=g.attributes[n], sz=A.itemSize, src=A.array, dst=new src.constructor(fs.length*6*sz); fs.forEach((f,k)=>dst.set(src.subarray(f*6*sz,(f+1)*6*sz),k*6*sz)); G.setAttribute(n,new THREE.BufferAttribute(dst,sz,A.normalized)); } G.computeBoundingSphere(); G.computeBoundingBox(); return G; };
      for(const [k,fs] of groups){ const G=make(fs), of=objOf?fs.map(f=>objOf[f]):undefined; let tgt; if(k===home){ tgt=me; me.geometry=G; me.userData.objOf=of; }
        else{ tgt=new THREE.Mesh(G,me.material); tgt.castShadow=me.castShadow; tgt.receiveShadow=me.receiveShadow; tgt.renderOrder=me.renderOrder; tgt.userData.objOf=of; tgt.userData.chunked=true; tgt.userData.chunkOf=me; me.add(tgt); }
        fs.forEach((f,j)=>{ where[f]=j; into[f]=tgt; }); }
      for(const p of byMe.get(me)||[]){ const f=p.v0/6; p.me=into[f]; p.v0=where[f]*6; } g.dispose(); } };
  const ROOMRESET=ROOMS.reset; ROOMS.reset=()=>{ ROOMRESET(); PERFX.split(); };   // (the rooms stacked on the apartments, built after the game opens: store.js)
  PERFX.rooms=()=>{ if(!PERFX.inner.length)return; const cur=ROOMS.cur, ck=cur?key(cur):null, all=UI.freeCam||ED.on||MAPED.on||LVL!=='up', d=1.6*TILE;
    for(const me of PERFX.inner){ const B=me.userData.box; me.visible=all||(ck?me.userData.inner===ck:pos.x>B.x0-d&&pos.x<B.x1+d&&pos.z>B.z0-d&&pos.z<B.z1+d&&py>B.y0-.3&&py<B.y1); } }; }
// 2. SELF-SHADOWS: his own shadow on himself drawn for him and the two characters nearest him (within 12 tiles, drawn); the rest without it
// (their light as before, only no shadow of their own arm across their own chest: at the game's size, a pixel or two)
const SELFSH={set:new Set(), off:new THREE.Matrix4().set(0,0,0,-9, 0,0,0,-9, 0,0,0,-9, 0,0,0,1)};
SELFSH.pick=()=>{ SELFSH.set.clear(); if(!PERFX.on[2])return; const R=12*TILE, c=[];
  for(const N of NPCS){ if(N.far||!N.g.visible||!N.g.parent||!N.g.parent.visible||!N.shadowPass)continue; const d=Math.hypot(N.g.position.x-pos.x,N.g.position.z-pos.z); if(d<R)c.push([d,N]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [,N] of c.slice(0,2))SELFSH.set.add(N); };
SELFSH.use=N=>!PERFX.on[2]||SELFSH.set.has(N);
{ const s0=W3.shadowPass; W3.shadowPass=r=>{ SELFSH.pick(); s0(r); }; }
// 4. BOUNDS: the characters' skinned bodies, the musicians, the Walker and the water had no bounds (frustumCulled off), so each was drawn
// whether on screen or not, and into all six sides of the lamp's shadow; now each has a generous sphere (half again its size, for its moves)
PERFX.bounds=()=>{ if(!PERFX.on[4])return; const S=new THREE.Sphere();
  scene.traverse(o=>{ if(!o.isMesh||o.frustumCulled||o.userData.nb)return;
    if(o.isSkinnedMesh){ o.userData.nb=true; const g=o.geometry; g.computeBoundingBox(); o.boundingSphere=g.boundingBox.getBoundingSphere(new THREE.Sphere()); o.boundingSphere.radius*=1.6; o.frustumCulled=true; return; }   // (its rest pose's box: its bones' matrices are empty till it's first drawn)
    if(o===W3.mesh||(o.material&&o.material.customProgramCacheKey&&/^mus/.test(o.material.customProgramCacheKey()))){ o.userData.nb=true; const g=o.geometry; g.computeBoundingBox(); g.boundingBox.getBoundingSphere(S); g.boundingSphere=S.clone(); g.boundingSphere.radius*=1.6; o.frustumCulled=true; return; }
    if(o===WATER.mesh||(WATER.extra||[]).some(w=>w.mesh===o)){ o.userData.nb=true; const g=o.geometry; g.computeBoundingSphere(); g.boundingSphere.radius+=1.5*TILE; o.frustumCulled=true; } }); };
// 6. SHADOW MAPS no finer than the picture shows: the lamp's 1024 a side (some 0.3 cm a texel at the lamp's reach) to 512, the walker's own and
// the characters' own as they were (seen close up)
PERFX.maps=()=>{ if(!PERFX.on[6])return; const L=LITE.pool[0]; if(L.shadow.mapSize.x>512){ L.shadow.mapSize.set(512,512); if(L.shadow.map){ L.shadow.map.dispose(); L.shadow.map=null; } } };
// 7. THE SIMULATIONS NOBODY SEES: the pool's floats and boats (their physics) only near the pool; the butterflies only near them; the
// musicians not drawn past where they're heard (18 away, their own rule for playing)
PERFX.near=(x,z,r)=>Math.hypot(pos.x-x,pos.z-z)<r;
PERFX.poolNear=()=>{ if(!PERFX.fl0){ PERFX.fl0=true; return true; }   /* (the first frame always: a float's mesh is placed only by the step (floats.js: matrixAutoUpdate off); skipped from the start, they sat at the world's origin, by the bodega, casting shadows) */
  return !PERFX.on[7]||LVL==='up'&&(MODS.pool.inside(pos.x,pos.z)||PERFX.near(POOLR.X((POOLR.bx0+POOLR.bx1)/2),POOLR.Z((POOLR.by0+POOLR.by1)/2),15*TILE)); };
PERFX.bfNear=()=>!PERFX.on[7]||BF.list.some(b=>PERFX.near(b.g.position.x,b.g.position.z,25*TILE));
PERFX.hide=(g,h)=>{ if(!g||!!g.userData.ph===h)return; g.userData.ph=h; g.traverse(o=>{ if(o.userData.lm0===undefined)o.userData.lm0=o.layers.mask; o.layers.mask=h?0:o.userData.lm0; }); };   // (by its layers: its own visible flags, ROOMS's and the stage's, left as they are)
PERFX.tick=()=>{ PERFX.rooms(); if(PERFX.on[7]&&typeof WATER!=='undefined'&&WATER.mesh)PERFX.hide(WATER.mesh,!ROOMS.cur&&!UI.freeCam&&!MAPED.on&&!ED.on&&!PERFX.poolNear());   /* (the pool's water, 33K triangles, not drawn from the street: it's under the building's roof) */
  if((PERFX.fc=(PERFX.fc||0)+1)%120===30)PERFX.bounds();   // (a moment in, and now and then for what's made later)
 
  if(PERFX.on[7])for(const M of [MUS,PNM,SGM,DRM])if(M&&M.g){ const A=M.at||M.g.position; PERFX.hide(M.g,!UI.freeCam&&!MAPED.on&&!PERFX.near(A.x,A.z,18)); } };
