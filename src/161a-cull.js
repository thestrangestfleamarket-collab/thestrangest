const CULL={L:[],M:new Map(),CS:16*TILE,on:QS.get('cull')!=='0'};
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
      if(s.isInstancedMesh){ p=new THREE.InstancedMesh(g,s.material,L.length); if(s.instanceColor)p.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(L.length*3),3); }
      else { const G=new THREE.BufferGeometry(), P=g.attributes.position; B.makeEmpty();
        if(g.index){ for(const n in g.attributes)G.setAttribute(n,g.attributes[n]); const ix=[]; for(const t of L)for(let k=0;k<3;k++){ const a=g.index.getX(t*3+k); ix.push(a); B.expandByPoint(v.fromBufferAttribute(P,a)); } G.setIndex(ix); }
        else for(const n in g.attributes){ const A=g.attributes[n], z=A.itemSize, d=new A.array.constructor(L.length*3*z); L.forEach((t,k)=>d.set(A.array.subarray(t*3*z,(t+1)*3*z),k*3*z)); G.setAttribute(n,new THREE.BufferAttribute(d,z,A.normalized)); if(n==='position')B.setFromBufferAttribute(G.attributes.position); }
        G.boundingSphere=B.getBoundingSphere(new THREE.Sphere()); G.boundingBox=B.clone(); G._bvhDyn=true; p=new THREE.Mesh(G,s.material); }
      p.raycast=()=>{}; p.userData.cullOf=s; p.visible=false; p.matrixAutoUpdate=false; R.px.push(p); R.ix.push(L); }
    if(s.isInstancedMesh)fill(R); };
  const tie=R=>{ const s=R.s; for(const p of R.px){ if(p.parent!==s.parent)s.parent.add(p); p.matrix.copy(s.matrix); p.matrixWorldNeedsUpdate=true; p.visible=R.vis; p.layers.mask=s.layers.mask; p.castShadow=s.castShadow; p.receiveShadow=s.receiveShadow; p.material=s.material;
    p.customDepthMaterial=s.customDepthMaterial; p.customDistanceMaterial=s.customDistanceMaterial; p.renderOrder=s.renderOrder; } };
  CULL.add=s=>{ if(!CULL.on||!s||CULL.M.has(s))return; const R={s,px:[],ix:[],ch:0,np:0}; CULL.M.set(s,R); CULL.L.push(R); };
  CULL.scan=()=>{ if(!CULL.on)return; scene.traverse(o=>{ if(o.isMesh&&o.userData.cull&&!o.isInstancedMesh){ CULL.add(o); return; } if(!o.isInstancedMesh||CULL.M.has(o)||o.userData.cullOf||!o.frustumCulled||o.count<8||Object.values(o.geometry.attributes).some(a=>a.isInstancedBufferAttribute))return;
    if(!o.boundingSphere)o.computeBoundingSphere(); if(o.boundingSphere.radius>CULL.CS)CULL.add(o); }); };
  CULL.begin=()=>{ for(const R of CULL.L){ if(R.off)continue; const s=R.s; if(!s.parent){ drop(R); R.off=true; continue; }
      const vv=vers(s); if(!R.done||s.geometry!==R.g||!s.isInstancedMesh&&vv!==R.v||s.isInstancedMesh&&s.count!==R.n){ if(R.done&&++R.np>8){ drop(R); R.off=true; continue; } R.done=true; R.n=s.count; part(R); if(R.off){ drop(R); continue; } R.ch=0; }
      else if(vv!==R.v){ R.v=vv; fill(R); if(++R.ch>20){ drop(R); R.off=true; continue; } } else R.ch=0;
      R.vis=s.visible; tie(R); s.visible=false; } };
  CULL.end=()=>{ for(const R of CULL.L){ if(R.off||!R.px.length)continue; R.s.visible=R.vis; for(const p of R.px)p.visible=false; } };
  { const b0=PERFX.bounds; PERFX.bounds=()=>{ b0(); CULL.scan(); }; }
  window.CULLDBG=()=>({on:CULL.on,src:CULL.L.length,live:CULL.L.filter(R=>!R.off&&R.px.length).length,proxies:CULL.L.reduce((a,R)=>a+R.px.length,0)}); }
