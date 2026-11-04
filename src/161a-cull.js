// THE CULL: CULL splits big meshes into cells and draws only the cells near and in view; nothing wholly past the distance fog's end (DFOG.cut) or the player's DRAW DISTANCE is drawn.
import {SHARED, THREE} from './003-shx.js';
import {CULL, ED, FAR3, MAPED, pos, ROOMS, UI} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {QS, SYS, TILE} from './006-map-pre.js';
import {DFOG} from './134e-distfog.js';
Object.assign(CULL,{L:[],M:new Map(),CS:10*TILE,on:QS.get('cull')!=='0',FL:[],H:[],D:[],R:0,hz:QS.get('hazecull')!=='0',PAD:2*TILE});
{ const m4=new THREE.Matrix4(), w4=new THREE.Matrix4(), v=new THREE.Vector3(), B=new THREE.Box3(), key=(x,z)=>Math.floor(x/CULL.CS)*4096+Math.floor(z/CULL.CS);
  const drop=R=>{ for(const p of R.px){ p.removeFromParent(); if(p.isInstancedMesh)p.dispose(); else p.geometry.dispose(); } R.px=[]; R.ix=[]; };
  const vers=s=>{ const g=s.geometry; return s.isInstancedMesh?s.instanceMatrix.version+'/'+(s.instanceColor?s.instanceColor.version:0)+'/'+s.count:(g.index?g.index.version:0)+'/'+Object.values(g.attributes).map(a=>a.version).join(); };
  const fill=R=>{ const s=R.s; R.px.forEach((p,j)=>{ const L=R.ix[j], A=s.instanceMatrix.array, D=p.instanceMatrix.array, C=s.instanceColor&&s.instanceColor.array, E=p.instanceColor&&p.instanceColor.array;
    L.forEach((i,k)=>{ for(let q=0;q<16;q++)D[k*16+q]=A[i*16+q]; if(C)for(let q=0;q<3;q++)E[k*3+q]=C[i*3+q]; }); p.instanceMatrix.needsUpdate=true; if(E)p.instanceColor.needsUpdate=true; p.computeBoundingSphere(); }); };
  const part=R=>{ drop(R); const s=R.s, g=s.geometry, cells=new Map(), put=(k,i)=>(cells.get(k)||cells.set(k,[]).get(k)).push(i); s.updateWorldMatrix(true,false); R.g=g; R.v=vers(s);
    if(s.isInstancedMesh)for(let i=0;i<s.count;i++){ s.getMatrixAt(i,m4); v.setFromMatrixPosition(w4.multiplyMatrices(s.matrixWorld,m4)); put(key(v.x,v.z),i); }
    else { const P=g.attributes.position, I=g.index, nT=(I?I.count:P.count)/3; for(let t=0;t<nT;t++){ v.set(0,0,0); for(let k=0;k<3;k++){ const a=I?I.getX(t*3+k):t*3+k; v.x+=P.getX(a); v.y+=P.getY(a); v.z+=P.getZ(a); } v.multiplyScalar(1/3).applyMatrix4(s.matrixWorld); put(key(v.x,v.z),t); } }
    if(cells.size<2){ R.off=true; return; }
    for(const L of cells.values()){ let p;
      if(s.isInstancedMesh){ p=new THREE.InstancedMesh(g,s.material,L.length); if(s.userData.weOnly)p.raycast=()=>{}; if(s.instanceColor)p.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(L.length*3),3); }
      else { const G=new THREE.BufferGeometry(), P=g.attributes.position; B.makeEmpty();
        if(g.index){ for(const n in g.attributes)G.setAttribute(n,g.attributes[n]); const ix=[]; for(const t of L)for(let k=0;k<3;k++){ const a=g.index.getX(t*3+k); ix.push(a); B.expandByPoint(v.fromBufferAttribute(P,a)); } G.setIndex(ix); }
        else for(const n in g.attributes){ const A=g.attributes[n], z=A.itemSize, d=new A.array.constructor(L.length*3*z); L.forEach((t,k)=>d.set(A.array.subarray(t*3*z,(t+1)*3*z),k*3*z)); G.setAttribute(n,new THREE.BufferAttribute(d,z,A.normalized)); if(n==='position')B.setFromBufferAttribute(G.attributes.position); }
        G.boundingSphere=B.getBoundingSphere(new THREE.Sphere()); G.boundingBox=B.clone(); G._bvhDyn=true; p=new THREE.Mesh(G,s.material); }
      p.raycast=()=>{}; p.userData.cullOf=s; p.visible=false; p.matrixAutoUpdate=false; R.px.push(p); R.ix.push(L); }
    if(s.isInstancedMesh)fill(R); };
  const tie=R=>{ const s=R.s; for(const p of R.px){ if(p.parent!==s.parent)s.parent.add(p); p.matrix.copy(s.matrix); p.matrixWorldNeedsUpdate=true; p.visible=R.vis; p.layers.mask=s.layers.mask; p.castShadow=s.castShadow; p.receiveShadow=s.receiveShadow; p.material=s.material;
    p.customDepthMaterial=s.customDepthMaterial; p.customDistanceMaterial=s.customDistanceMaterial; p.renderOrder=s.renderOrder; } };
  const SM=new THREE.Matrix4(), SF=new THREE.Frustum(), SS=new THREE.Sphere();
  CULL.seen=(L,o,skip)=>{ SM.multiplyMatrices(SHARED.cam.projectionMatrix,SHARED.cam.matrixWorldInverse); const e=SM.elements, ox=o?o.x:0, oy=o?o.y:0, oz=o?o.z:0;
    if(!SHARED.cam.isOrthographicCamera){ SF.setFromProjectionMatrix(SM); return L.some(S=>!(skip&&skip(S))&&SF.intersectsSphere(SS.set(S.center,S.radius).translate(v.set(ox,oy,oz)))); }
    const rx=Math.hypot(e[0],e[4],e[8]), ry=Math.hypot(e[1],e[5],e[9]);
    return L.some(S=>{ if(skip&&skip(S))return false; const x=S.center.x+ox, y=S.center.y+oy, z=S.center.z+oz; return Math.abs(e[0]*x+e[4]*y+e[8]*z+e[12])<=1+S.radius*rx&&Math.abs(e[1]*x+e[5]*y+e[9]*z+e[13])<=1+S.radius*ry; }); };
  CULL.pastBox=(x0,z0,x1,z1)=>{ const L=FAR3.land; return CULL.R>0&&Math.hypot(Math.max(x0-pos.x,0,pos.x-x1),Math.max(z0-pos.z,0,pos.z-z1))>CULL.R&&(!L||x0>L[0]&&x1<L[2]&&z0>L[1]&&z1<L[3]); };
  CULL.past=(x,z,r)=>{ const L=FAR3.land; return CULL.R>0&&Math.hypot(x-pos.x,z-pos.z)-r>CULL.R&&(!L||x-r>L[0]&&x+r<L[2]&&z-r>L[1]&&z+r<L[3]); };
  // its footprint on the land (x0, z0, x1, z1): the cut is by distance over the ground to its nearest point, so a tall thin thing (a pipe up the apartment house) goes with the house, not later
  const FT=[0,0,0,0], box=o=>{ if(o.isInstancedMesh){ if(!o.boundingBox)o.computeBoundingBox(); return o.boundingBox; } const g=o.geometry; if(!g.boundingBox)g.computeBoundingBox(); return g.boundingBox; };
  const foot=o=>{ const b=box(o), e=o.matrixWorld.elements; let x0=1e30, x1=-1e30, z0=1e30, z1=-1e30;
    for(let k=0;k<8;k++){ const X=k&1?b.max.x:b.min.x, Y=k&2?b.max.y:b.min.y, Z=k&4?b.max.z:b.min.z, x=e[0]*X+e[4]*Y+e[8]*Z+e[12], z=e[2]*X+e[6]*Y+e[10]*Z+e[14]; if(x<x0)x0=x; if(x>x1)x1=x; if(z<z0)z0=z; if(z>z1)z1=z; }
    FT[0]=x0; FT[1]=z0; FT[2]=x1; FT[3]=z1; return FT; };
  // DRAW DISTANCE in GRAPHICS (owner, 4 Nov 2026: "add a draw distance for far buildings"): in first and third person nothing on the land wholly past it is drawn; 0 is ALL
  const DD={v:120}; try{ const q=SAVE.get('drawd'); if(q!=null&&q!=='')DD.v=+q||0; }catch(e){}
  CULL.drawD=()=>DD.v>0&&UI.persp&&!UI.freeCam&&!ED.on&&!MAPED.on&&!renderer.xr.isPresenting?DD.v*TILE:0;
  CULL.setDraw=v=>{ DD.v=v>=300?0:Math.max(40,Math.round(v)); try{ SAVE.set('drawd',String(DD.v)); }catch(e){} }; CULL.getDraw=()=>DD.v;
  { const gfx=()=>{ const P=document.querySelector('#menu [data-p="graphics"]'); if(!P)return setTimeout(gfx,1000); if(P.querySelector('#ddist'))return;
      const B=document.createElement('div'); B.innerHTML='<h3>DRAW DISTANCE</h3><div class="row"><span>NEAR</span><input type="range" id="ddist" min="40" max="300" step="10"><span>ALL</span><span id="ddistv"></span></div><div class="dim">how far the town is drawn round you in first and third person; nearer draws less and runs faster</div>';
      P.appendChild(B); const R=B.querySelector('#ddist'), V=B.querySelector('#ddistv'), show=()=>{ R.value=DD.v||300; V.textContent=DD.v?DD.v+' TILES':'ALL'; }; R.oninput=e=>{ CULL.setDraw(+e.target.value); show(); }; show(); };
    gfx(); }
  const hazeHide=()=>{ const f=CULL.hz?DFOG.cut():0, d=CULL.drawD(); CULL.R=f>0&&d>0?Math.min(f,d):f||d; if(!(CULL.R>0))return; CULL.R+=CULL.PAD;
    for(const o of CULL.FL){ if(!o.visible||!o.parent)continue; const F=foot(o);
      if(CULL.pastBox(F[0],F[1],F[2],F[3])){ if(o.children.length){ const g=o.geometry; if(g.drawRange.count){ CULL.D.push([g,g.drawRange.count]); g.drawRange.count=0; } } else { o.visible=false; CULL.H.push(o); } } } };
  CULL.add=s=>{ if(!CULL.on||!s||CULL.M.has(s))return; const R={s,px:[],ix:[],ch:0,np:0}; CULL.M.set(s,R); CULL.L.push(R); };
  CULL.scan=()=>{ const FL=[]; scene.traverse(o=>{ if((o.isMesh||o.isPoints||o.isLine)&&o.frustumCulled&&!o.isSkinnedMesh&&o.geometry&&o.geometry.attributes.position&&!CULL.M.has(o))FL.push(o); }); CULL.FL=FL; if(!CULL.on)return; scene.traverse(o=>{ if(o.isMesh&&o.userData.cull&&!o.isInstancedMesh){ CULL.add(o); return; } if(!o.isInstancedMesh||CULL.M.has(o)||o.userData.cullOf||!o.frustumCulled||o.count<8||Object.values(o.geometry.attributes).some(a=>a.isInstancedBufferAttribute))return;
    if(!o.boundingSphere)o.computeBoundingSphere(); if(o.boundingSphere.radius>CULL.CS/2)CULL.add(o); }); };
  CULL.begin=()=>{ if(ROOMS.hold)ROOMS.hold(); for(const R of CULL.L){ if(R.off)continue; const s=R.s; if(!s.parent){ drop(R); R.off=true; continue; }
      const vv=vers(s); if(!R.done||s.geometry!==R.g||!s.isInstancedMesh&&vv!==R.v||s.isInstancedMesh&&(s.count!==R.n||!!s.instanceColor!==!!(R.px[0]&&R.px[0].instanceColor))){ if(R.done&&++R.np>8){ drop(R); R.off=true; continue; } R.done=true; R.n=s.count; part(R); if(R.off){ drop(R); continue; } R.ch=0; }
      else if(vv!==R.v){ R.v=vv; fill(R); if(++R.ch>20){ drop(R); R.off=true; continue; } } else R.ch=0;
      R.vis=s.visible; tie(R); s.visible=false; } hazeHide(); };
  CULL.end=()=>{ for(const o of CULL.H)o.visible=true; for(const [g,n] of CULL.D)g.drawRange.count=n; CULL.D.length=0; CULL.hn=CULL.H.length; CULL.H.length=0; for(const R of CULL.L){ if(R.off||!R.px.length)continue; R.s.visible=R.vis; for(const p of R.px)p.visible=false; } };
  SYS.add('perfBounds',()=>CULL.scan(),'161a-cull');
  window.CULLDBG=()=>({on:CULL.on,hazeR:CULL.R,hazeList:CULL.FL.length,hazeHid:CULL.hn||0,src:CULL.L.length,live:CULL.L.filter(R=>!R.off&&R.px.length).length,proxies:CULL.L.reduce((a,R)=>a+R.px.length,0)}); }
