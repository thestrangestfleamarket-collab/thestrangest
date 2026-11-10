// PERFORMANCE SWITCHES: hiding far rooms, props and water; shadow map size; what runs only when near.
import {SHARED, THREE} from './003-shx.js';
import {DRM, ED, LITE, MAPED, MUS, NPCS, PERFX, PNM, pos, ROOMS, SELFSH, SGM, UI, VIS, W3, WINDOWS} from './003b-systems.js';
import {scene} from './004-main.js';
import {BF, FREE, QS, STORE, SYS, TILE} from './006-map-pre.js';
import {OBJS} from './008-batch.js';
import {WATER} from './009-down.js';
Object.assign(PERFX,{on:{}, inner:[], gen:0});
{ const q=QS.get('perfx'); for(const k of [1,2,4,5,6,7])PERFX.on[k]=q!=='0'&&!(q||'').split(',').includes('-'+k); if(FREE&&!(q||'').split(',').includes('+1'))PERFX.on[1]=false; }
{ const key=b=>[b.x0,b.z0,b.x1,b.z1,b.y0].map(v=>(+v).toFixed(2)).join();
  PERFX.split=()=>{ if(!PERFX.on[1]){ PERFX.chunk(); PERFX.gen++; return; } const RB=ROOMS.boxes(), m=.25*TILE, tol=.05*TILE, list=[];
    scene.traverse(o=>{ if(o.isMesh&&(o.userData.objOf||o.userData.splitOK)&&!o.userData.split&&!o.userData.inner&&!o.geometry.index)list.push(o); });
    const byMe=new Map(); for(const o of OBJS)for(const p of o.parts){ (byMe.get(p.me)||byMe.set(p.me,[]).get(p.me)).push(p); }
    for(const me of list){ me.userData.split=true; const g=me.geometry, P=g.attributes.position.array, nF=P.length/18; me.updateWorldMatrix(true,false); const E=me.matrixWorld.elements;
      const fb=new Int16Array(nF).fill(-1), flat=new Uint8Array(nF), lo=new Float32Array(nF), hiY=new Float32Array(nF), lvA=RB.map(()=>new Map());
      for(let f=0;f<nF;f++){ let x=0,y=0,z=0,a=1e9,b=-1e9; for(let v=0;v<6;v++){ const i=(f*6+v)*3, px=P[i], py_=P[i+1], pz=P[i+2], wy=E[1]*px+E[5]*py_+E[9]*pz+E[13];
          x+=E[0]*px+E[4]*py_+E[8]*pz+E[12]; y+=wy; z+=E[2]*px+E[6]*py_+E[10]*pz+E[14]; a=Math.min(a,wy); b=Math.max(b,wy); } x/=6; y/=6; z/=6; lo[f]=a; hiY[f]=b; flat[f]=b-a<tol?1:0;
        for(let j=0;j<RB.length;j++){ const B=RB[j]; if(x>B.x0+m&&x<B.x1-m&&z>B.z0+m&&z<B.z1-m&&y>B.y0&&y<B.y1-tol){ fb[f]=j;
            if(flat[f]){ const i=f*18, ux=P[i+3]-P[i], uz=P[i+5]-P[i+2], vx=P[i+6]-P[i], vz=P[i+8]-P[i+2], k=Math.round(a/tol), M=lvA[j]; M.set(k,(M.get(k)||0)+Math.abs(ux*vz-uz*vx)); } break; } } }
      const floor=lvA.map(M=>{ let best=null, ba=0; for(const [k,A] of M)if(A>ba){ ba=A; best=k; } return best==null?-1e9:best*tol; });
      for(let f=0;f<nF;f++){ const j=fb[f]; if(j>=0&&flat[f]&&hiY[f]<=floor[j]+2*tol)fb[f]=-1; }
      const groups=new Map(); for(let f=0;f<nF;f++)(groups.get(fb[f])||groups.set(fb[f],[]).get(fb[f])).push(f);
      if(![...groups.keys()].some(j=>j>=0))continue; if(!groups.has(-1))groups.set(-1,[]);
      const where=new Int32Array(nF), into=new Array(nF), names=Object.keys(g.attributes), make=fs=>{ '@later'; const G=new THREE.BufferGeometry();
        for(const n of names){ const A=g.attributes[n], s=A.itemSize, src=A.array, dst=new src.constructor(fs.length*6*s); fs.forEach((f,k)=>dst.set(src.subarray(f*6*s,(f+1)*6*s),k*6*s)); G.setAttribute(n,new THREE.BufferAttribute(dst,s,A.normalized)); }
        G.computeBoundingSphere(); G.computeBoundingBox(); return G; };
      const objOf=me.userData.objOf;
      for(const [j,fs] of groups){ const G=make(fs), of=objOf?fs.map(f=>objOf[f]):undefined; let tgt;
        if(j<0){ tgt=me; me.geometry=G; me.userData.objOf=of; }
        else{ tgt=new THREE.Mesh(G,me.material); tgt.castShadow=me.castShadow; tgt.receiveShadow=me.receiveShadow; tgt.renderOrder=me.renderOrder; tgt.userData.objOf=of; tgt.userData.inner=key(RB[j]); tgt.userData.box=RB[j];
          VIS.hide(tgt,'far'); me.add(tgt); PERFX.inner.push(tgt); }
        fs.forEach((f,k)=>{ where[f]=k; into[f]=tgt; }); }
      for(const p of byMe.get(me)||[]){ const f=p.v0/6; p.me=into[f]; p.v0=where[f]*6; }
      g.dispose(); } PERFX.chunk(); PERFX.gen++; };
  PERFX.chunk=()=>{ if(!PERFX.on[5])return; const CS=16*TILE, list=[]; scene.traverse(o=>{ if(o.isMesh&&(o.userData.objOf||o.userData.splitOK)&&!o.userData.inner&&!o.userData.chunked&&!o.geometry.index)list.push(o); });
    const byMe=new Map(); for(const o of OBJS)for(const p of o.parts){ (byMe.get(p.me)||byMe.set(p.me,[]).get(p.me)).push(p); }
    for(const me of list){ me.userData.chunked=true; const g=me.geometry, P=g.attributes.position.array, nF=P.length/18; if(nF<600)continue; me.updateWorldMatrix(true,false); const E=me.matrixWorld.elements, cell=new Array(nF), cnt=new Map();
      for(let f=0;f<nF;f++){ let x=0,z=0; for(let v=0;v<6;v++){ const i=(f*6+v)*3, px=P[i], py_=P[i+1], pz=P[i+2]; x+=E[0]*px+E[4]*py_+E[8]*pz+E[12]; z+=E[2]*px+E[6]*py_+E[10]*pz+E[14]; } const k=Math.floor(x/6/CS)*4096+Math.floor(z/6/CS); cell[f]=k; cnt.set(k,(cnt.get(k)||0)+1); }
      if(cnt.size<2)continue; const big=[...cnt.entries()].filter(([,n])=>n>=60).map(([k])=>k); if(!big.length)continue; const home=big.reduce((a,b)=>cnt.get(b)>cnt.get(a)?b:a), cx=k=>Math.floor(k/4096), cz=k=>k-Math.floor(k/4096)*4096;
      const near=new Map(); for(const k of cnt.keys()){ if(big.includes(k)){ near.set(k,k); continue; } let bk=home, bd=1e9; for(const b of big){ const d=Math.hypot(cx(b)-cx(k),cz(b)-cz(k)); if(d<bd){ bd=d; bk=b; } } near.set(k,bd>1.5?k:bk); }
      const groups=new Map(); for(let f=0;f<nF;f++){ const k=near.get(cell[f]); (groups.get(k)||groups.set(k,[]).get(k)).push(f); } if(groups.size<2)continue;
      const where=new Int32Array(nF), into=new Array(nF), names=Object.keys(g.attributes), objOf=me.userData.objOf;
      const make=fs=>{ const G=new THREE.BufferGeometry(); for(const n of names){ const A=g.attributes[n], sz=A.itemSize, src=A.array, dst=new src.constructor(fs.length*6*sz); fs.forEach((f,k)=>dst.set(src.subarray(f*6*sz,(f+1)*6*sz),k*6*sz)); G.setAttribute(n,new THREE.BufferAttribute(dst,sz,A.normalized)); } G.computeBoundingSphere(); G.computeBoundingBox(); return G; };
      for(const [k,fs] of groups){ const G=make(fs), of=objOf?fs.map(f=>objOf[f]):undefined; let tgt; if(k===home){ tgt=me; me.geometry=G; me.userData.objOf=of; }
        else{ tgt=new THREE.Mesh(G,me.material); tgt.castShadow=me.castShadow; tgt.receiveShadow=me.receiveShadow; tgt.renderOrder=me.renderOrder; tgt.userData.objOf=of; tgt.userData.chunked=true; tgt.userData.chunkOf=me; me.add(tgt); }
        fs.forEach((f,j)=>{ where[f]=j; into[f]=tgt; }); }
      for(const p of byMe.get(me)||[]){ const f=p.v0/6; p.me=into[f]; p.v0=where[f]*6; } g.dispose(); } };
  SYS.add('roomsReset',()=>PERFX.split(),'161-perf');
  PERFX.rooms=()=>{ if(!PERFX.inner.length)return; const cur=ROOMS.cur, ck=cur?key(cur):null, all=UI.freeCam||ED.on||MAPED.on||SHARED.LVL!=='up', d=1.6*TILE;
    for(const me of PERFX.inner){ const B=me.userData.box; VIS.hide(me,'far',!(all||WINDOWS.open((B.x0+B.x1)/2,(B.z0+B.z1)/2)||STORE.openAt&&STORE.openAt((B.x0+B.x1)/2,(B.z0+B.z1)/2)||(ck?me.userData.inner===ck:pos.x>B.x0-d&&pos.x<B.x1+d&&pos.z>B.z0-d&&pos.z<B.z1+d&&SHARED.py>B.y0-.3&&SHARED.py<B.y1))); }
  };
  // the rest of what is inside a room, not painted with it (unless marked userData.seenOut: seen through a window from the street): the people and players' bodies there, the band, and what a place adds (PERFX.own): drawn only while you are in that room
  const OWN=PERFX.owned=new Set(), V=new THREE.Vector3(), BX=new THREE.Box3(); let st=0; PERFX.own=o=>{ if(o)OWN.add(o); };
  const boxes=()=>{ const X=SHARED.BOD.X, Z=SHARED.BOD.Z, Y=SHARED.BOD.Y; return ROOMS.boxes().concat(Object.values(STORE.inside||{}).map(R=>{ const B=R.B; return {x0:Math.min(X(B.x0),X(B.x1)),x1:Math.max(X(B.x0),X(B.x1)),z0:Math.min(Z(B.y0),Z(B.y1)),z1:Math.max(Z(B.y0),Z(B.y1)),y0:-4,y1:Y(B.h)}; })); };
  // any mesh lying wholly inside a room's walls (not its shell, which lies on them) belongs to that room; looked for when the rooms change
  PERFX.claim=()=>{ const RB=boxes(), m=.2*TILE; scene.traverse(o=>{ if(!(o.isMesh||o.isPoints||o.isSprite)||o.isSkinnedMesh||o.userData.shutChk||o.userData.seenOut||OWN.has(o)||o.userData.inner)return; o.userData.shutChk=1; const g=o.geometry; if(!g)return;
      if(o.isInstancedMesh||o.isBatchedMesh){ if(o.isInstancedMesh&&!o.count)return; o.computeBoundingBox(); BX.copy(o.boundingBox).applyMatrix4(o.matrixWorld); } else { if(!g.boundingBox)g.computeBoundingBox(); o.updateWorldMatrix(true,false); BX.copy(g.boundingBox).applyMatrix4(o.matrixWorld); }
      if(BX.isEmpty())return; if(RB.some(b=>BX.min.x>b.x0+m&&BX.max.x<b.x1-m&&BX.min.z>b.z0+m&&BX.max.z<b.z1-m&&BX.min.y>b.y0-.3&&BX.max.y<b.y1-.05))OWN.add(o); }); };
  SYS.add('roomsReset',()=>PERFX.claim(),'161-perf-claim'); SYS.onStart(()=>setTimeout(()=>PERFX.claim(),4000),'161-perf');
  let ct=0; PERFX.shut=()=>{ const now=performance.now(); if(now-st<300)return; st=now; if(now-ct>5000&&SYS.started){ ct=now; PERFX.claim(); } const cur=ROOMS.cur, ck=cur?key(cur):null, all=UI.freeCam||ED.on||MAPED.on||SHARED.LVL!=='up', d=1.6*TILE, RB=boxes(), inR=(B,x,y,z,m)=>x>B.x0-m&&x<B.x1+m&&z>B.z0-m&&z<B.z1+m&&y>B.y0-.3&&y<B.y1;
    const shop=!!(cur&&!cur.off&&STORE.inside&&STORE.inside[cur.id]&&ROOMS.dark());   // inside a street shop: no one outside it is drawn (the live glass lifts this for its own view)
    const list=[...NPCS.map(N=>N.g),...(NPCS.extra||[]).map(X=>X&&X.g),...[MUS,PNM,SGM,DRM].map(M=>M&&M.g),...OWN];
    for(const g of list){ if(!g||!g.parent||g.userData.seenOut)continue; if(OWN.has(g)){ if(!g.userData.mid)g.userData.mid=new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3()); V.copy(g.userData.mid); } else g.getWorldPosition(V); const B=RB.find(b=>inR(b,V.x,V.y,V.z,-.15*TILE)); VIS.hide(g,'shut',(!!B&&!(all||WINDOWS.open(V.x,V.z)||STORE.openAt&&STORE.openAt(V.x,V.z)||(ck?key(B)===ck:inR(B,pos.x,SHARED.py,pos.z,d))))||(!B&&shop&&!all&&!OWN.has(g))); } }; }
Object.assign(SELFSH,{set:new Set(), off:new THREE.Matrix4().set(0,0,0,-9, 0,0,0,-9, 0,0,0,-9, 0,0,0,1)});
SELFSH.pick=()=>{ SELFSH.set.clear(); if(!PERFX.on[2])return; const R=12*TILE, c=[];
  for(const N of NPCS){ if(N.far||!N.g.visible||!N.g.parent||!N.g.parent.visible||!N.shadowPass)continue; const d=Math.hypot(N.g.position.x-pos.x,N.g.position.z-pos.z); if(d<R)c.push([d,N]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [,N] of c.slice(0,Math.round(2*(SHARED.lodK||1))))SELFSH.set.add(N); };
SELFSH.use=N=>!PERFX.on[2]||SELFSH.set.has(N);
SYS.add('shadowPre',()=>SELFSH.pick(),'161-perf');
const PERFX_bounds0=()=>{ if(!PERFX.on[4])return; const S=new THREE.Sphere();
  scene.traverse(o=>{ if(!o.isMesh||o.frustumCulled||o.userData.nb)return;
    if(o.isSkinnedMesh){ o.userData.nb=true; const g=o.geometry; g.computeBoundingBox(); o.boundingSphere=g.boundingBox.getBoundingSphere(new THREE.Sphere()); o.boundingSphere.radius*=1.6; o.frustumCulled=true; return; }
    if(o===W3.mesh)return; if(o.material&&o.material.customProgramCacheKey&&/^mus/.test(o.material.customProgramCacheKey())){ o.userData.nb=true; const g=o.geometry; g.computeBoundingBox(); g.boundingBox.getBoundingSphere(S); g.boundingSphere=S.clone(); g.boundingSphere.radius*=1.6; o.frustumCulled=true; return; }
    if(o===WATER.mesh||(WATER.extra||[]).some(w=>w.mesh===o)){ o.userData.nb=true; const g=o.geometry; g.computeBoundingSphere(); g.boundingSphere.radius+=1.5*TILE; o.frustumCulled=true; } }); };
PERFX.bounds=(...a)=>{ const r=PERFX_bounds0(...a); SYS.run('perfBounds'); return r; };
PERFX.maps=()=>{ if(!PERFX.on[6])return; const L=LITE.pool[0]; if(L.shadow.mapSize.x>512){ L.shadow.mapSize.set(512,512); if(L.shadow.map){ L.shadow.map.dispose(); L.shadow.map=null; } } };
PERFX.near=(x,z,r)=>Math.hypot(pos.x-x,pos.z-z)<r;
PERFX.bfNear=()=>!PERFX.on[7]||BF.list.some(b=>PERFX.near(b.g.position.x,b.g.position.z,25*TILE));
PERFX.hide=(g,h)=>{ if(!g||!!g.userData.ph===h)return; g.userData.ph=h; VIS.hide(g,'perf',h); };
PERFX.tick=()=>{ PERFX.rooms(); PERFX.shut();
  if((PERFX.fc=(PERFX.fc||0)+1)%120===30)PERFX.bounds();
 
  if(PERFX.on[7])for(const M of [MUS,PNM,SGM,DRM])if(M&&M.g){ const A=M.at||M.g.position; PERFX.hide(M.g,!UI.freeCam&&!MAPED.on&&!PERFX.near(A.x,A.z,18)); } };
