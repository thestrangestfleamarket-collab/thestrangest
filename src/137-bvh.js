const BVH={on:QS.get('bvh')!=='0', ready:false, lib:null, built:0, ms:0};
{
  const orig=THREE.Mesh.prototype.raycast, MIN=100, OPT={indirect:true, setBoundingBox:false, verbose:false, maxLeafTris:10};
  const tris=g=>(g.index?g.index.count:g.attributes.position?g.attributes.position.count:0)/3;
  const key=g=>(g.index?g.index.version+':'+g.index.count+':'+g.index.array.length:'-')+'/'+g.attributes.position.version+':'+g.attributes.position.count;
  const fit=m=>m.isMesh&&!m.isSkinnedMesh&&!(m.morphTargetInfluences&&m.morphTargetInfluences.length)&&m.geometry&&m.geometry.isBufferGeometry&&m.geometry.attributes.position&&tris(m.geometry)>=MIN;
  const tree=g=>{ if(g._bvhDyn)return null; const k=key(g), t0=performance.now(); if(g.boundsTree&&g._bvhK===k&&g._bvhI===g.index&&g._bvhP===g.attributes.position)return g.boundsTree;
    if(g.boundsTree){ g._bvhT=(g._bvhT||[]).filter(t=>t0-t<2000); g._bvhT.push(t0); if(g._bvhT.length>3){ g.boundsTree=null; g._bvhDyn=true; return null; } }
    try{ g.computeBoundsTree(OPT); }catch(e){ g.boundsTree=null; g._bvhDyn=true; return null; }
    g._bvhK=k; g._bvhI=g.index; g._bvhP=g.attributes.position; BVH.built++; BVH.ms+=performance.now()-t0; return g.boundsTree; };
  const drawn=(m,out,n0)=>{ const g=m.geometry, d=g.drawRange, n=g.index?g.index.count:g.attributes.position.count, cut=d.start>0||d.count<n, gs=Array.isArray(m.material)&&g.groups.length>0;
    if(!cut&&!gs)return; for(let i=out.length-1;i>=n0;i--){ const f=out[i].faceIndex*3; if(f<d.start||f>=d.start+d.count||(gs&&!g.groups.some(q=>f>=q.start&&f<q.start+q.count)))out.splice(i,1); } };
  THREE.Mesh.prototype.raycast=function(rc,out){
    if(BVH.on)for(let q=this;q;q=q.parent)if(!q.visible)return;
    if(BVH.ready&&fit(this)&&tree(this.geometry)){ const n0=out.length; BVH.lib.acceleratedRaycast.call(this,rc,out); drawn(this,out,n0); return; }
    return orig.call(this,rc,out); };
  const origS=THREE.SkinnedMesh.prototype.raycast;
  if(origS!==THREE.Mesh.prototype.raycast)THREE.SkinnedMesh.prototype.raycast=function(rc,out){ if(BVH.on)for(let q=this;q;q=q.parent)if(!q.visible)return; return origS.call(this,rc,out); };
  const warm=()=>{ const all=new Set(); scene.traverse(o=>{ if(fit(o)&&!o.geometry.boundsTree&&!o.geometry._bvhDyn)all.add(o.geometry); });
    const q=[...all].sort((a,b)=>tris(b)-tris(a)); const step=()=>{ const g=q.shift(); if(!g)return; tree(g); setTimeout(step,60); }; step(); };
  BVH.load=()=>{ if(!BVH.on||BVH.lib)return; BVH.lib=true;
    import('https://cdn.jsdelivr.net/npm/three-mesh-bvh@0.8.3/build/index.module.js').then(m=>{
      THREE.BufferGeometry.prototype.computeBoundsTree=m.computeBoundsTree; THREE.BufferGeometry.prototype.disposeBoundsTree=m.disposeBoundsTree;
      BVH.lib=m; BVH.ready=true; warm(); }).catch(e=>{ console.warn('BVH: three-mesh-bvh did not load, rays stay three\'s own',e); BVH.lib=null; BVH.on=false; }); };
  BVH.refit=g=>{ if(!g.boundsTree)return; try{ g.boundsTree.refit(); g._bvhK=key(g); }catch(e){ g.boundsTree=null; } };
  BVH.stats=()=>{ let n=0,t=0,d=0; const seen=new Set(); scene.traverse(o=>{ const g=o.geometry; if(!g||seen.has(g))return; seen.add(g); if(g.boundsTree){ n++; t+=tris(g); } if(g._bvhDyn)d++; }); return {ready:BVH.ready,trees:n,tris:t,dynamic:d,built:BVH.built,ms:+BVH.ms.toFixed(1)}; };
}
