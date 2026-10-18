// ---- BVH: three-mesh-bvh for every ray (owner, 18 Oct 2026: "lets start installing libraries for things weve hand written")
// A ray (a double click, the drag's pivot, the world editor's pick, the map editor) tested every triangle of every mesh it met: the street's
// batches are 30,000-116,000 each. three-mesh-bvh puts each still mesh's triangles in a tree, so a ray looks at a few dozen. Fetched once the
// game runs (not at the loading line), till then the rays are three's own. Trees built 'indirect' (the index left as it is: use.js and the
// world editor read faceIndex as the batch made it, interiors.js rewrites the index), a few a moment in the background, the big ones first;
// a mesh whose index, points or draw range change gets a new tree at its next ray, one that keeps changing (the water) keeps three's own.
// Skinned meshes keep three's own (their tree would be of the rest pose). A hidden mesh (or one in a hidden group) isn't looked at (three's rays met them all: the rooms
// you're not in, the hidden characters; every caller threw those hits away). Cost: nothing a frame; the trees some 40 bytes a triangle.
// `?bvh=0` leaves it off; BVH.stats() what's built.
const BVH={on:QS.get('bvh')!=='0', ready:false, lib:null, built:0, ms:0};
{
  const orig=THREE.Mesh.prototype.raycast, MIN=100, OPT={indirect:true, setBoundingBox:false, verbose:false, maxLeafTris:10};
  const tris=g=>(g.index?g.index.count:g.attributes.position?g.attributes.position.count:0)/3;
  const key=g=>(g.index?g.index.version+':'+g.index.count+':'+g.index.array.length:'-')+'/'+g.attributes.position.version+':'+g.attributes.position.count;
  const fit=m=>m.isMesh&&!m.isSkinnedMesh&&!(m.morphTargetInfluences&&m.morphTargetInfluences.length)&&m.geometry&&m.geometry.isBufferGeometry&&m.geometry.attributes.position&&tris(m.geometry)>=MIN;
  // a tree for g, or none when it keeps changing
  // (changed three times inside two seconds: it changes every frame, three's own for good; interiors.js's index swaps are seconds apart)
  const tree=g=>{ if(g._bvhDyn)return null; const k=key(g), t0=performance.now(); if(g.boundsTree&&g._bvhK===k&&g._bvhI===g.index&&g._bvhP===g.attributes.position)return g.boundsTree;
    if(g.boundsTree){ g._bvhT=(g._bvhT||[]).filter(t=>t0-t<2000); g._bvhT.push(t0); if(g._bvhT.length>3){ g.boundsTree=null; g._bvhDyn=true; return null; } }
    try{ g.computeBoundsTree(OPT); }catch(e){ g.boundsTree=null; g._bvhDyn=true; return null; }
    g._bvhK=k; g._bvhI=g.index; g._bvhP=g.attributes.position; BVH.built++; BVH.ms+=performance.now()-t0; return g.boundsTree; };
  // an 'indirect' tree holds every triangle: the hits outside the draw range (or, with a list of materials, outside every group) are let go, as three's own would never find them
  const drawn=(m,out,n0)=>{ const g=m.geometry, d=g.drawRange, n=g.index?g.index.count:g.attributes.position.count, cut=d.start>0||d.count<n, gs=Array.isArray(m.material)&&g.groups.length>0;
    if(!cut&&!gs)return; for(let i=out.length-1;i>=n0;i--){ const f=out[i].faceIndex*3; if(f<d.start||f>=d.start+d.count||(gs&&!g.groups.some(q=>f>=q.start&&f<q.start+q.count)))out.splice(i,1); } };
  THREE.Mesh.prototype.raycast=function(rc,out){
    if(BVH.on)for(let q=this;q;q=q.parent)if(!q.visible)return;   // (a hidden mesh: every caller throws its hits away, and three's own looked at all its triangles to find them)
    if(BVH.ready&&fit(this)&&tree(this.geometry)){ const n0=out.length; BVH.lib.acceleratedRaycast.call(this,rc,out); drawn(this,out,n0); return; }
    return orig.call(this,rc,out); };
  // a skinned mesh has its own ray (every point skinned as it's met): hidden, it isn't looked at either
  const origS=THREE.SkinnedMesh.prototype.raycast;
  if(origS!==THREE.Mesh.prototype.raycast)THREE.SkinnedMesh.prototype.raycast=function(rc,out){ if(BVH.on)for(let q=this;q;q=q.parent)if(!q.visible)return; return origS.call(this,rc,out); };
  // the trees grown in the background, the biggest first, one a moment
  const warm=()=>{ const all=new Set(); scene.traverse(o=>{ if(fit(o)&&!o.geometry.boundsTree&&!o.geometry._bvhDyn)all.add(o.geometry); });
    const q=[...all].sort((a,b)=>tris(b)-tris(a)); const step=()=>{ const g=q.shift(); if(!g)return; tree(g); setTimeout(step,60); }; step(); };
  BVH.load=()=>{ if(!BVH.on||BVH.lib)return; BVH.lib=true;
    import('https://cdn.jsdelivr.net/npm/three-mesh-bvh@0.8.3/build/index.module.js').then(m=>{
      THREE.BufferGeometry.prototype.computeBoundsTree=m.computeBoundsTree; THREE.BufferGeometry.prototype.disposeBoundsTree=m.disposeBoundsTree;
      BVH.lib=m; BVH.ready=true; warm(); }).catch(e=>{ console.warn('BVH: three-mesh-bvh did not load, rays stay three\'s own',e); BVH.lib=null; BVH.on=false; }); };
  BVH.stats=()=>{ let n=0,t=0,d=0; const seen=new Set(); scene.traverse(o=>{ const g=o.geometry; if(!g||seen.has(g))return; seen.add(g); if(g.boundsTree){ n++; t+=tris(g); } if(g._bvhDyn)d++; }); return {ready:BVH.ready,trees:n,tris:t,dynamic:d,built:BVH.built,ms:+BVH.ms.toFixed(1)}; };
}
