// THE MERGE: a built inside's (ROOMS.part) plain, still meshes drawn as a few merged ones, a draw a material instead of a draw a thing (owner, 4 Nov 2026: the apartment's 800 draws); its pieces again while you decorate, rebuilt when a thing moves; what you use, what moves, what is see-through or pictured stays its own.
import {THREE} from './003-shx.js';
import {ROOMS, USE} from './003b-systems.js';
import {scene} from './004-main.js';
import {MODS, SYS} from './006-map-pre.js';
const MERGE={builds:0}; window.MERGE=MERGE; const SG=new Map();
{ const V=new THREE.Vector3(), N3=new THREE.Matrix3(), M=new THREE.Matrix4(), GI=new THREE.Matrix4(), C=new THREE.Color(), DONE=new Map();
  const MOVE=new Set(['lamp','fridge','vend','radio']);
  // what may be merged: a plain mesh, one material without a picture, not see-through, nothing drawn its own way, not something to use or that moves
  const keep=P=>{ const S=new Set(); for(const th of P.things||[])if(th&&th.obj)th.obj.traverse(o=>S.add(o)); return S; };
  const mayMerge=(o,K,root,H)=>{ if(!o.isMesh||o.isSkinnedMesh||o.isInstancedMesh||K.has(o)||o.userData.noMerge||o.userData.merged||o.morphTargetInfluences)return false; const m=o.material;
    if(!m||Array.isArray(m)||m.map||m.transparent||m.alphaTest>0||m.wireframe||!/^Mesh(Lambert|Basic|Phong|Standard|Toon)Material$/.test(m.type))return false;
    if(o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender&&o.onBeforeRender!==THREE.Mesh.prototype.onBeforeRender)return false;
    const g=o.geometry; if(!g||!g.attributes.position||g.morphAttributes&&Object.keys(g.morphAttributes).length)return false;
    for(let q=o;q&&q!==root;q=q.parent){ if(!q.visible&&!H.has(q)||q.userData.noMerge)return false; if(USE.test&&MOVE.has(USE.test.kindOf(q)))return false; } return true; };
  const CP=new WeakMap(); let cpn=0; const cpId=a=>!a||!a.length?0:CP.get(a)||(CP.set(a,++cpn),cpn);
  const keyOf=o=>{ const m=o.material; return [cpId(m.clippingPlanes),m.type,m.side,m.emissive?m.emissive.getHexString():'',m.flatShading?1:0,o.castShadow?1:0,o.receiveShadow?1:0,m.fog?1:0,m.depthWrite?1:0,m.toneMapped?1:0].join('|'); };
  // the pieces of one material into one geometry, in the room's own space, each piece's colour in its corners
  const merge=(L,G)=>{ let nv=0, ni=0; for(const o of L){ const g=o.geometry; nv+=g.attributes.position.count; ni+=g.index?g.index.count:g.attributes.position.count; }
    const P=new Float32Array(nv*3), Nn=new Float32Array(nv*3), Cc=new Float32Array(nv*3), I=nv>65535?new Uint32Array(ni):new Uint16Array(ni); let v=0, i=0;
    GI.copy(G.matrixWorld).invert();
    for(const o of L){ const g=o.geometry, p=g.attributes.position, n=g.attributes.normal, c=g.attributes.color, m=o.material, vc=m.vertexColors&&c; M.multiplyMatrices(GI,o.matrixWorld); N3.getNormalMatrix(M); C.copy(m.color||C.set(1,1,1));
      for(let k=0;k<p.count;k++){ V.fromBufferAttribute(p,k).applyMatrix4(M); P[(v+k)*3]=V.x; P[(v+k)*3+1]=V.y; P[(v+k)*3+2]=V.z;
        if(n){ V.fromBufferAttribute(n,k).applyMatrix3(N3).normalize(); Nn[(v+k)*3]=V.x; Nn[(v+k)*3+1]=V.y; Nn[(v+k)*3+2]=V.z; }
        Cc[(v+k)*3]=C.r*(vc?c.getX(k):1); Cc[(v+k)*3+1]=C.g*(vc?c.getY(k):1); Cc[(v+k)*3+2]=C.b*(vc?c.getZ(k):1); }
      if(g.index){ for(let k=0;k<g.index.count;k++)I[i+k]=g.index.getX(k)+v; i+=g.index.count; } else { for(let k=0;k<p.count;k++)I[i+k]=v+k; i+=p.count; }
      v+=p.count; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('normal',new THREE.BufferAttribute(Nn,3)); g.setAttribute('color',new THREE.BufferAttribute(Cc,3)); g.setIndex(new THREE.BufferAttribute(I,1)); g.computeBoundingSphere(); return g; };
  ROOMS.unmerge=P=>{ const d=DONE.get(P); if(!d)return; for(const me of d.made){ me.removeFromParent(); me.geometry.dispose(); me.material.dispose(); } for(const o of d.hid)o.visible=true; DONE.delete(P); };
  const sigOf=L=>L.length+':'+L.map(o=>{ const e=o.matrixWorld.elements; return o.id+'@'+e[12].toFixed(2)+','+e[13].toFixed(2)+','+e[14].toFixed(2)+','+e[0].toFixed(2)+','+e[8].toFixed(2); }).join(';');
  const mergeRoom=P=>{ const G=P.group, K=keep(P), L=[], d=DONE.get(P), H=new Set(d?d.hid:[]); G.updateMatrixWorld(true); G.traverse(o=>{ if(mayMerge(o,K,G,H))L.push(o); });
    const sig=sigOf(L);
    if(d&&d.sig===sig)return;
    if(d&&d.at){ let moved=0; for(const o of L){ const a=d.at.get(o), e=o.matrixWorld.elements; if(a&&(Math.abs(a[0]-e[12])+Math.abs(a[1]-e[13])+Math.abs(a[2]-e[14])+Math.abs(a[3]-e[0])+Math.abs(a[4]-e[8])>1e-4)){ o.userData.noMerge=true; moved++; } }   // (a piece that moves on its own stays its own)
      if(moved){ const i=L.filter(o=>!o.userData.noMerge); L.length=0; L.push(...i); } }
    MERGE.builds++; if(d)ROOMS.unmerge(P); if(L.length<8){ DONE.set(P,{sig,made:[],hid:[]}); return; }
    const by=new Map(); for(const o of L){ const k=keyOf(o); (by.get(k)||by.set(k,[]).get(k)).push(o); }
    const made=[]; for(const [,B] of by){ if(B.length<2)continue; const m0=B[0].material, mat=m0.clone(); mat.vertexColors=true; if(mat.color)mat.color.set(1,1,1); mat.userData={};
      const me=new THREE.Mesh(merge(B,G),mat); me.castShadow=B[0].castShadow; me.receiveShadow=B[0].receiveShadow; me.name='merged'; me.userData.merged=B.length; G.add(me); made.push(me); for(const o of B)o.visible=false; }
    DONE.set(P,{sig:sigOf(L),made,hid:L.filter(o=>!o.visible),at:new Map(L.map(o=>{ const e=o.matrixWorld.elements; return [o,[e[12],e[13],e[14],e[0],e[8]]]; }))}); };
  let t=0; SYS.add('rooms',()=>{ const now=performance.now(); if(now-t<1000)return; t=now; const ed=MODS.roomed&&MODS.roomed.on;
    for(const g of scene.children)if(g.userData.mergeStatic&&!SG.has(g))SG.set(g,{group:g,things:[]});   // (still groups a builder marks: the view out of your windows)
    for(const [g,P] of SG)if(!g.parent){ ROOMS.unmerge(P); SG.delete(g); }
    for(const P of [...(ROOMS.built||[]),...SG.values()]){ if(ed){ ROOMS.unmerge(P); continue; } let shown=true; for(let q=P.group;q;q=q.parent)if(!q.visible){ shown=false; break; } if(shown)mergeRoom(P); } },'161c-merge');
  MERGE.geo=merge;   // (pieces into one geometry in G's own space, each piece's colour in its corners: the far cars, 161ca)
  ROOMS.mergeNow=P=>mergeRoom(P); window.MERGEDBG=()=>[...DONE].map(([P,d])=>({room:P.group.name,merged:d.made.length,pieces:d.hid.length}));
}
export {MERGE};
