// THE MIDDLE BODIES: a townsperson past NPCS.MID (and short of the far boxes at NPCS.LOD) is drawn with a simplified copy of its body: the same points, colours and bones, fewer triangles (meshoptimizer's simplifier); its shadow too.
import {SHARED, THREE} from './003-shx.js';
import {NPCS, pos} from './003b-systems.js';
import {QS, SYS, TILE} from './006-map-pre.js';
const MIDB={on:true,made:0,saved:0};
{ let MO=null, asked=false; const K=new WeakMap();
  const lib=()=>{ if(!asked){ asked=true; import('https://cdn.jsdelivr.net/npm/meshoptimizer@1.2.0/meshopt_simplifier.js').then(m=>m.MeshoptSimplifier.ready.then(()=>{ MO=m.MeshoptSimplifier; })).catch(()=>{ MIDB.on=false; }); } return MO; };
  // the simplified copy of one indexed geometry, each material group on its own; null when it would save too little
  // (a body of loose triangles is first joined where corners meet, each corner then taking the colour of the first there)
  const mid=g=>{ const P=g.attributes.position; if(!P||P.itemSize!==3||!(P.array instanceof Float32Array)||P.isInterleavedBufferAttribute)return null;
    const I=g.index?g.index.array:MO.generatePositionRemap(P.array,3), gs=g.groups.length?g.groups:[{start:0,count:I.length,materialIndex:0}], out=[], G=[]; let n=0;
    for(const q of gs){ const s=q.start, c=Math.min(q.count,I.length-s); if(c<=0)continue; const src=Uint32Array.from(I.subarray(s,s+c));
      const [ix]=c>=300?MO.simplify(src,P.array,3,Math.floor(c*.4/3)*3,.02,[]):[src]; G.push({start:n,count:ix.length,materialIndex:q.materialIndex}); n+=ix.length; out.push(ix); }
    if(n>I.length*.75)return null; const all=new (P.count>65535?Uint32Array:Uint16Array)(n); let o=0; for(const ix of out){ all.set(ix,o); o+=ix.length; }
    const m=new THREE.BufferGeometry(); for(const k in g.attributes)m.setAttribute(k,g.attributes[k]); m.morphAttributes=g.morphAttributes; m.setIndex(new THREE.BufferAttribute(all,1));
    if(g.groups.length)for(const q of G)m.addGroup(q.start,q.count,q.materialIndex); m.userData.mid=true; m.boundingSphere=g.boundingSphere; m.boundingBox=g.boundingBox; MIDB.made++; MIDB.saved+=(I.length-n)/3; return m; };
  // a character's own body meshes (each indexed, big enough to matter), each with its whole and middle geometry
  const parts=N=>{ let L=K.get(N); if(L&&L.g===N.g)return L; L=[]; L.g=N.g; N.g.traverse(o=>{ if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return; const g=o.geometry; if((g.index?g.index.count:g.attributes.position.count)<1500*3)return; L.push({me:o,full:o.geometry,mid:undefined}); }); K.set(N,L); return L; };
  const set=(N,want)=>{ for(const p of parts(N)){ if(p.me.geometry!==p.full&&p.me.geometry!==p.mid){ p.full=p.me.geometry; p.mid=undefined; }   // reshaped or swapped by its own code: start again from what it has
      if(want&&p.mid===undefined){ if(!lib())return; p.mid=mid(p.full)||null; }
      const g=want&&p.mid?p.mid:p.full; if(p.me.geometry!==g)p.me.geometry=g; } };
  NPCS.MID=35*TILE;
  SYS.every(()=>{ if(SHARED.LVL==null)return; const R=NPCS.MID*(SHARED.lodK||1), on=MIDB.on&&!QS.has('nomid');
    for(const L of [NPCS,NPCS.extra||[]])for(const N of L){ if(!N||!N.g||N.sheet)continue; const a=N.st||N.at||N.g.position; set(N,on&&!N.lod&&Math.hypot(a.x-pos.x,a.z-pos.z)>R); } },250,'161bd-midbody');
  MIDB.lib=lib; MIDB.mid=g=>lib()&&mid(g); }
window.MIDB=MIDB;
