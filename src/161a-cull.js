// THE CULL: CULL draws each big mesh as one BatchedMesh (an instanced mesh's copies a piece each, a plain mesh marked userData.cull in cells of 10 tiles) so three's multi-draw draws only the pieces in view and within the distance fog's end (DFOG.cut) or the player's DRAW DISTANCE; nothing wholly past them is drawn.
import {SHARED, THREE} from './003-shx.js';
import {CULL, ED, FAR3, MAPED, PARK, pos, ROOMS, UI} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {LEVEL, QS, SYS, TILE} from './006-map-pre.js';
import {DFOG} from './134e-distfog.js';
Object.assign(CULL,{L:[],M:new Map(),CS:10*TILE,on:QS.get('cull')!=='0',FL:[],H:[],D:[],R:0,hz:QS.get('hazecull')!=='0',PAD:2*TILE});
{ const m4=new THREE.Matrix4(), w4=new THREE.Matrix4(), v=new THREE.Vector3(), S=new THREE.Sphere(), B=new THREE.Box3(), C=new THREE.Color(), key=(x,z)=>Math.floor(x/CULL.CS)*4096+Math.floor(z/CULL.CS);
  // a material's shader hook written for an instanced mesh (instanceMatrix, USE_INSTANCING) reads the piece's matrix under the batch instead; three expands its chunks after the hook, so only the hook's own lines are touched
  const WM=new WeakMap(), PK=THREE.Material.prototype.customProgramCacheKey, wrap=m=>{ if(!m||m.isShaderMaterial)return; const W=WM.get(m); if(W&&m.onBeforeCompile===W.wrap)return; const prev=m.onBeforeCompile, ck=W&&W.ck&&m.customProgramCacheKey===W.ck?PK:m.customProgramCacheKey;
    const fn=(sh,r)=>{ if(prev)prev(sh,r); if(!sh.batching)return; let s=sh.vertexShader; if(!/instanceMatrix|USE_INSTANCING/.test(s))return;
      s=s.replace(/\binstanceMatrix\b/g,'batchingMatrix').replace(/\bUSE_INSTANCING\b/g,'USE_BATCHING').replace(/\bUSE_INSTANCING_COLOR\b/g,'USE_BATCHING_COLOR').replace(/\binstanceColor\b/g,'batchingColor');
      if(s.includes('#include <batching_vertex>'))s=s.replace('#include <batching_vertex>','').replace(/void main\(\)\s*\{/,'void main() {\n#include <batching_vertex>\n'); sh.vertexShader=s; };
    m.onBeforeCompile=fn; const key=ck===PK?()=>prev.toString():ck; m.customProgramCacheKey=key; WM.set(m,{wrap:m.onBeforeCompile,ck:ck===PK?key:null}); };   // the program's key still names the hook's own text, as three's default does; the hook is remembered as read back (the shader edit check wraps what is set)
  const drop=R=>{ for(const p of R.px){ p.removeFromParent(); p.dispose(); } R.px=[]; R.bm=null; };
  const vers=s=>{ const g=s.geometry; return s.isInstancedMesh?s.instanceMatrix.version+'/'+(s.instanceColor?'c'+s.instanceColor.version:'')+'/'+s.count:(g.index?g.index.version:0)+'/'+Object.values(g.attributes).map(a=>a.version).join(); };
  // each piece's box in the mesh's own frame, for the distance test
  const centres=R=>{ const bm=R.bm, n=R.n, c=R.c=new Float32Array(n*6); for(let i=0;i<n;i++){ bm.getMatrixAt(i,m4); bm.getBoundingBoxAt(R.gid(i),B).applyMatrix4(m4); c[i*6]=B.min.x; c[i*6+1]=B.min.y; c[i*6+2]=B.min.z; c[i*6+3]=B.max.x; c[i*6+4]=B.max.y; c[i*6+5]=B.max.z; } bm.boundingSphere=null; bm.boundingBox=null; R.fresh=true; };
  const fill=R=>{ const s=R.s, bm=R.bm, A=s.instanceMatrix.array, K=s.instanceColor&&s.instanceColor.array; for(let i=0;i<R.n;i++){ bm.setMatrixAt(i,m4.fromArray(A,i*16)); if(K)bm.setColorAt(i,C.setRGB(K[i*3],K[i*3+1],K[i*3+2])); } centres(R); };
  const part=R=>{ drop(R); const s=R.s, g=s.geometry, M=s.material; R.g=g; R.v=vers(s); if(Array.isArray(M)||M.isShaderMaterial||s.customDepthMaterial&&s.customDepthMaterial.isShaderMaterial){ R.off=true; return; } s.updateWorldMatrix(true,false); let bm;
    if(s.isInstancedMesh){ R.n=s.count; if(R.n<2){ R.off=true; return; } const P=g.attributes.position; bm=new THREE.BatchedMesh(R.n,P.count,g.index?g.index.count:0,M); const gid=bm.addGeometry(g); for(let i=0;i<R.n;i++)bm.addInstance(gid); R.gid=()=>gid; R.tri=()=>(g.index?g.index.count:P.count)/3; R.bm=bm; fill(R); }
    else { const P=g.attributes.position, I=g.index, nT=(I?I.count:P.count)/3, cells=new Map(), put=(k,i)=>(cells.get(k)||cells.set(k,[]).get(k)).push(i);
      for(let t=0;t<nT;t++){ v.set(0,0,0); for(let k=0;k<3;k++){ const a=I?I.getX(t*3+k):t*3+k; v.x+=P.getX(a); v.y+=P.getY(a); v.z+=P.getZ(a); } v.multiplyScalar(1/3).applyMatrix4(s.matrixWorld); put(key(v.x,v.z),t); }
      if(cells.size<2){ R.off=true; return; }
      const GS=[], T=[]; let nv=0, ni=0; for(const L of cells.values()){ const G=new THREE.BufferGeometry(); T.push(L.length);
        if(I){ const map=new Map(), ix=new Uint32Array(L.length*3); let n=0; for(const t of L)for(let k=0;k<3;k++){ const a=I.getX(t*3+k); let b=map.get(a); if(b===undefined)map.set(a,b=map.size); ix[n++]=b; } const old=[...map.keys()];
          for(const nm in g.attributes){ const A=g.attributes[nm], z=A.itemSize, d=new A.array.constructor(old.length*z); old.forEach((a,b)=>d.set(A.array.subarray(a*z,(a+1)*z),b*z)); G.setAttribute(nm,new THREE.BufferAttribute(d,z,A.normalized)); } G.setIndex(new THREE.BufferAttribute(ix,1)); nv+=old.length; ni+=ix.length; }
        else { for(const nm in g.attributes){ const A=g.attributes[nm], z=A.itemSize, d=new A.array.constructor(L.length*3*z); L.forEach((t,k)=>d.set(A.array.subarray(t*3*z,(t+1)*3*z),k*3*z)); G.setAttribute(nm,new THREE.BufferAttribute(d,z,A.normalized)); } nv+=L.length*3; } GS.push(G); }
      R.n=GS.length; bm=new THREE.BatchedMesh(R.n,nv,ni,M); m4.identity(); for(const G of GS){ bm.setMatrixAt(bm.addInstance(bm.addGeometry(G)),m4); G.dispose(); } R.gid=i=>i; R.tri=i=>T[i]; R.bm=bm; centres(R); }
    bm.sortObjects=false; bm.raycast=()=>{}; bm.geometry._bvhDyn=true; bm.userData.cullOf=s; bm.visible=false; bm.matrixAutoUpdate=false; R.px=[bm]; };
  const tie=R=>{ const s=R.s, p=R.bm; if(p.parent!==s.parent)s.parent.add(p); p.matrix.copy(s.matrix); p.matrixWorldNeedsUpdate=true; p.visible=R.vis; p.layers.mask=s.layers.mask; p.castShadow=s.castShadow; p.receiveShadow=s.receiveShadow; p.frustumCulled=s.frustumCulled;
    p.material=s.material; p.customDepthMaterial=s.customDepthMaterial; p.customDistanceMaterial=s.customDistanceMaterial; p.renderOrder=s.renderOrder; wrap(s.material); wrap(s.customDepthMaterial); wrap(s.customDistanceMaterial); };
  // the pieces wholly past the distance: left out, until the distance or you move
  const far=R=>{ const bm=R.bm, c=R.c, n=R.n; if(!(CULL.R>0||CULL.keep)){ if(R.hid){ for(let i=0;i<n;i++)bm.setVisibleAt(i,true); R.hid=false; } return; } const e=R.s.matrixWorld.elements; let any=false;
    for(let i=0;i<n;i++){ B.min.set(c[i*6],c[i*6+1],c[i*6+2]); B.max.set(c[i*6+3],c[i*6+4],c[i*6+5]); const F=foot(B,e), p=CULL.pastBox(F[0],F[1],F[2],F[3]); bm.setVisibleAt(i,!p); any=any||p; } R.hid=any; };
  const SM=new THREE.Matrix4(), SF=new THREE.Frustum(), SS=new THREE.Sphere();
  CULL.seen=(L,o,skip)=>{ SM.multiplyMatrices(SHARED.cam.projectionMatrix,SHARED.cam.matrixWorldInverse); const e=SM.elements, ox=o?o.x:0, oy=o?o.y:0, oz=o?o.z:0;
    if(!SHARED.cam.isOrthographicCamera){ SF.setFromProjectionMatrix(SM); return L.some(S=>!(skip&&skip(S))&&SF.intersectsSphere(SS.set(S.center,S.radius).translate(v.set(ox,oy,oz)))); }
    const rx=Math.hypot(e[0],e[4],e[8]), ry=Math.hypot(e[1],e[5],e[9]);
    return L.some(S=>{ if(skip&&skip(S))return false; const x=S.center.x+ox, y=S.center.y+oy, z=S.center.z+oz; return Math.abs(e[0]*x+e[4]*y+e[8]*z+e[12])<=1+S.radius*rx&&Math.abs(e[1]*x+e[5]*y+e[9]*z+e[13])<=1+S.radius*ry; }); };
  CULL.pastBox=(x0,z0,x1,z1)=>{ const L=FAR3.land, K=CULL.keep; if(K&&(x1<K[0]||x0>K[2]||z1<K[1]||z0>K[3])&&(!L||x0>L[0]&&x1<L[2]&&z0>L[1]&&z1<L[3]))return true; return CULL.R>0&&Math.hypot(Math.max(x0-pos.x,0,pos.x-x1),Math.max(z0-pos.z,0,pos.z-z1))>CULL.R&&(!L||x0>L[0]&&x1<L[2]&&z0>L[1]&&z1<L[3]); };
  CULL.past=(x,z,r)=>{ const L=FAR3.land, K=CULL.keep; if(K&&(x+r<K[0]||x-r>K[2]||z+r<K[1]||z-r>K[3])&&(!L||x-r>L[0]&&x+r<L[2]&&z-r>L[1]&&z+r<L[3]))return true; return CULL.R>0&&Math.hypot(x-pos.x,z-pos.z)-r>CULL.R&&(!L||x-r>L[0]&&x+r<L[2]&&z-r>L[1]&&z+r<L[3]); };
  // its footprint on the land (x0, z0, x1, z1): the cut is by distance over the ground to its nearest point, so a tall thin thing (a pipe up the apartment house) goes with the house, not later
  const FT=[0,0,0,0], box=o=>{ if(o.isInstancedMesh||o.isBatchedMesh){ if(!o.boundingBox)o.computeBoundingBox(); return o.boundingBox; } const g=o.geometry; if(!g.boundingBox)g.computeBoundingBox(); return g.boundingBox; };
  const foot=(b,e)=>{ let x0=1e30, x1=-1e30, z0=1e30, z1=-1e30;
    for(let k=0;k<8;k++){ const X=k&1?b.max.x:b.min.x, Y=k&2?b.max.y:b.min.y, Z=k&4?b.max.z:b.min.z, x=e[0]*X+e[4]*Y+e[8]*Z+e[12], z=e[2]*X+e[6]*Y+e[10]*Z+e[14]; if(x<x0)x0=x; if(x>x1)x1=x; if(z<z0)z0=z; if(z>z1)z1=z; }
    FT[0]=x0; FT[1]=z0; FT[2]=x1; FT[3]=z1; return FT; };
  // the triangles of a culled mesh's pieces in a frustum (the render inspector), -1 when none
  CULL.view=(R,F)=>{ const bm=R.bm; if(!bm)return -1; let t=-1; for(let i=0;i<R.n;i++){ if(!bm.getVisibleAt(i))continue; bm.getMatrixAt(i,m4); bm.getBoundingSphereAt(R.gid(i),S).applyMatrix4(w4.multiplyMatrices(bm.matrixWorld,m4)); if(F.intersectsSphere(S))t=Math.max(t,0)+R.tri(i); } return t; };
  // DRAW DISTANCE in GRAPHICS (owner, 4 Nov 2026: "add a draw distance for far buildings"): in first and third person nothing on the land wholly past it is drawn; 0 is ALL
  const DD={v:0};   // everything in view drawn, however far (owner, 7 Nov 2026: "lets remove things vanishing when far away")
  CULL.drawD=()=>DD.v>0&&UI.persp&&!UI.freeCam&&!ED.on&&!MAPED.on&&!renderer.xr.isPresenting?DD.v*TILE:0;
  CULL.setDraw=v=>{ DD.v=v>=300?0:Math.max(40,Math.round(v)); try{ SAVE.set('drawd',String(DD.v)); }catch(e){} }; CULL.getDraw=()=>DD.v;
  { const gfx=()=>{ const P=document.querySelector('#menu [data-p="graphics"]'); if(!P)return setTimeout(gfx,1000); if(P.querySelector('#ddist'))return;
      const B=document.createElement('div'); B.innerHTML='<h3>DRAW DISTANCE</h3><div class="row"><span>NEAR</span><input type="range" id="ddist" min="40" max="300" step="10"><span>ALL</span><span id="ddistv"></span></div><div class="dim">how far the town is drawn round you in first and third person; nearer draws less and runs faster</div>';
      P.appendChild(B); const R=B.querySelector('#ddist'), V=B.querySelector('#ddistv'), show=()=>{ R.value=DD.v||300; V.textContent=DD.v?DD.v+' TILES':'ALL'; }; R.oninput=e=>{ CULL.setDraw(+e.target.value); show(); }; show(); };
    }
  const parkKeep=()=>{ const K=PARK.box().slice(), XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS;   // in the park the apartment houses on West St stay drawn as from the street (owner, 7 Nov 2026: "need to be consistent")
    for(const p of LEVEL.places)if(p.id==='apts'||/^house\d+$/.test(p.id)){ const y0=p.y1!=null?p.y0:LEVEL.block.back, y1=p.y1!=null?p.y1:LEVEL.block.front, xa=Math.min(XS(p.x0),XS(p.x1)), xb=Math.max(XS(p.x0),XS(p.x1)), za=Math.min(ZS(y0),ZS(y1)), zb=Math.max(ZS(y0),ZS(y1)); K[0]=Math.min(K[0],xa); K[2]=Math.max(K[2],xb); K[1]=Math.min(K[1],za); K[3]=Math.max(K[3],zb); } return K; };
  const range=()=>{ const f=CULL.hz?DFOG.cut():0, d=CULL.drawD(); CULL.R=f>0&&d>0?Math.min(f,d):f||d; if(CULL.R>0)CULL.R+=CULL.PAD;
    const free=!ROOMS.cur&&SHARED.LVL==='up'&&!UI.freeCam&&!ED.on&&!MAPED.on, BR=LEVEL.block.backrow, ZS=SHARED.BOD.ZS, zr=ZS(BR[0]), z1=ZS(BR[1]), south=Math.sign(ZS(BR[0]-1)-zr);
    const zone=true?null:PARK.in&&PARK.box&&PARK.within(pos.x,pos.z,1)?'park':(pos.z-zr)*south>0?'hudson':null;   // in the park only the park; on the Hudson (the promenade, the pier, the river) only the Hudson row and south of it (owner, 7 Nov 2026); the sky and far skyline kept
    if(zone!==CULL.zone){ CULL.zone=zone; CULL.keep=zone==='park'?parkKeep():zone==='hudson'?(south<0?[-1e6,-1e6,1e6,z1+.5*TILE]:[-1e6,z1-.5*TILE,1e6,1e6]):null; } };
  const hazeHide=()=>{ if(!(CULL.R>0||CULL.keep))return;
    for(const o of CULL.FL){ if(!o.visible||!o.parent)continue; const F=foot(box(o),o.matrixWorld.elements);
      if(CULL.pastBox(F[0],F[1],F[2],F[3])){ if(o.children.length){ const g=o.geometry; if(g.drawRange.count){ CULL.D.push([g,g.drawRange.count]); g.drawRange.count=0; } } else { o.visible=false; CULL.H.push(o); } } } };
  CULL.add=s=>{ if(!CULL.on||!s||CULL.M.has(s))return; const R={s,px:[],bm:null,n:0,ch:0,np:0}; CULL.M.set(s,R); CULL.L.push(R); };
  // a big, still, plain mesh joins the grid by rule, as an instanced one does: wider than a cell, one plain material, its geometry unchanged between two looks (a mesh still being painted waits)
  const WAIT=new Map(), big=o=>{ const g=o.geometry, M=o.material, P=g.attributes.position; if(Array.isArray(M)||M.isShaderMaterial||M.transparent||o.morphTargetInfluences||(g.index?g.index.count:P.count)<768)return false; if(!g.boundingSphere)g.computeBoundingSphere(); return g.boundingSphere.radius*o.matrixWorld.getMaxScaleOnAxis()>CULL.CS/2; };
  let wt=0; const settle=()=>{ const now=performance.now(); if(!WAIT.size||now-wt<1000)return; wt=now; for(const [o,v] of WAIT){ if(!o.parent||CULL.M.has(o)){ WAIT.delete(o); continue; } const n=vers(o); if(n===v){ WAIT.delete(o); CULL.add(o); return; } WAIT.set(o,n); } };
  CULL.rush=()=>{ for(const o of WAIT.keys())if(o.parent)CULL.add(o); WAIT.clear(); };
  CULL.scan=()=>{ const FL=[]; scene.traverse(o=>{ if((o.isMesh||o.isPoints||o.isLine)&&o.frustumCulled&&!o.isSkinnedMesh&&o.geometry&&o.geometry.attributes.position&&!CULL.M.has(o)&&!o.userData.cullOf)FL.push(o); }); CULL.FL=FL; if(!CULL.on)return; scene.traverse(o=>{ if(o.isMesh&&o.userData.cull&&!o.isInstancedMesh){ CULL.add(o); return; } if(o.isMesh&&!o.isInstancedMesh&&!o.isBatchedMesh&&!o.isSkinnedMesh&&o.frustumCulled&&o.geometry&&o.geometry.attributes.position&&!CULL.M.has(o)&&!o.userData.cullOf&&!WAIT.has(o)&&big(o)){ WAIT.set(o,''); return; } if(!o.isInstancedMesh||CULL.M.has(o)||o.userData.cullOf||!o.frustumCulled||o.count<8||Object.values(o.geometry.attributes).some(a=>a.isInstancedBufferAttribute))return;
    if(!o.boundingSphere)o.computeBoundingSphere(); if(o.boundingSphere.radius>CULL.CS/2)CULL.add(o); }); };
  let lx=1e9, lz=1e9, lR=-1, lK=null;
  CULL.begin=()=>{ if(ROOMS.hold)ROOMS.hold(); range(); settle(); const moved=Math.hypot(pos.x-lx,pos.z-lz)>TILE/2||CULL.R!==lR||CULL.keep!==lK; if(moved){ lx=pos.x; lz=pos.z; lR=CULL.R; lK=CULL.keep; }
    for(const R of CULL.L){ if(R.off)continue; const s=R.s; if(!s.parent){ drop(R); R.off=true; continue; }
      const vv=vers(s); if(!R.done||s.geometry!==R.g||!s.isInstancedMesh&&vv!==R.v||s.isInstancedMesh&&s.count!==R.n){ if(R.done&&++R.np>8){ drop(R); R.off=true; continue; } R.done=true; part(R); if(R.off){ drop(R); continue; } R.ch=0; }
      else if(vv!==R.v){ R.v=vv; fill(R); if(++R.ch>20){ drop(R); R.off=true; continue; } } else R.ch=0;
      R.vis=s.visible; tie(R); s.visible=false; if(moved||R.fresh){ far(R); R.fresh=false; } } hazeHide(); };
  CULL.end=()=>{ for(const o of CULL.H)o.visible=true; for(const [g,n] of CULL.D)g.drawRange.count=n; CULL.D.length=0; CULL.hn=CULL.H.length; CULL.H.length=0; for(const R of CULL.L){ if(R.off||!R.bm)continue; R.s.visible=R.vis; R.bm.visible=false; } };
  SYS.add('perfBounds',()=>CULL.scan(),'161a-cull');
  window.CULLDBG=()=>({on:CULL.on,keep:CULL.keep,hazeR:CULL.R,hazeList:CULL.FL.length,hazeHid:CULL.hn||0,src:CULL.L.length,live:CULL.L.filter(R=>!R.off&&R.bm).length,wait:WAIT.size,pieces:CULL.L.reduce((a,R)=>a+(R.off||!R.bm?0:R.n),0)}); }
