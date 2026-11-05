// THE KIT: KIT turns the baked kit models into meshes and puts them in the world by name.
import {THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {KITD} from './004-main.js';
import {CLIPX, FIX, MAPG, MODS, SOL, TILE, ZU} from './006-map-pre.js';
const KIT={data:KITD,geos:{},things:[]};
{ const b=B64, i16=I16, u16=U16, u32=s=>new Uint32Array(b(s).buffer), YS=ZU*24/TILE;
  // (the bake stores sRGB; vertex colours are linear, so every kit piece came out washed out until 5 Nov 2026)
  KIT.decode=M=>{ const q=i16(M.p), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3];
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); const c8=b(M.c), C=new Float32Array(c8.length), col=new THREE.Color(); for(let i=0;i<c8.length;i+=3){ col.setRGB(c8[i]/255,c8[i+1]/255,c8[i+2]/255,THREE.SRGBColorSpace); C[i]=col.r; C[i+1]=col.g; C[i+2]=col.b; } g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setIndex(new THREE.BufferAttribute(M.i32?u32(M.i):u16(M.i),1));
    g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere(); return g; };
  KIT.geo=name=>{ if(KIT.geos[name])return KIT.geos[name]; const M=KITD[name]; if(!M){ console.warn('kit: no',name); return null; } return KIT.geos[name]=KIT.decode(M); };
  KIT.mat=new THREE.MeshLambertMaterial({vertexColors:true});
  KIT.piece=(name,w,geo)=>{ const g=geo||KIT.geo(name); if(!g)return null; g.boundingBox||g.computeBoundingBox(); const bb=g.boundingBox, s=w/Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z), me=new THREE.Mesh(g,KIT.mat), o=new THREE.Group();
    me.position.set(-(bb.min.x+bb.max.x)/2*s,-(bb.min.y+bb.max.y)/2*s,-(bb.min.z+bb.max.z)/2*s); me.scale.setScalar(s); me.userData.shared=true; o.add(me); return o; };
  KIT.put=(name,x,z,o={})=>{ '@later'; const geo=KIT.geo(name); if(!geo)return null; const M=KITD[name], bb=geo.boundingBox, tall=bb.max.y-bb.min.y, s=o.m?o.m/.84*TILE/tall:1/.84*TILE;
    const me=new THREE.Mesh(geo,o.mat||KIT.mat); me.castShadow=true; me.receiveShadow=true; me.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2);
    const body=new THREE.Group(); body.add(me); body.scale.set(s,s*YS,s); const g=new THREE.Group(); g.add(body); g.rotation.y=o.rot||0;
    const gy=o.ground?o.ground(x,z):MODS.bodega.ground(x,z); g.position.set(x,gy+(o.lift||0),z); (o.group||MAPG.bodega).add(g);
    if(o.solid){ const hw=(bb.max.x-bb.min.x)*s/2*(o.solid===true?.8:o.solid), hd=(bb.max.z-bb.min.z)*s/2*(o.solid===true?.8:o.solid), c=Math.abs(Math.cos(g.rotation.y)), sn=Math.abs(Math.sin(g.rotation.y)), ex=hw*c+hd*sn, ez=hw*sn+hd*c;
      SOL.up.push([x-ex,z-ez,x+ex,z+ez]); FIX.up.push([x-ex,z-ez,gy,x+ex,z+ez,gy+tall*s*YS]); }
    CLIPX.push({place:'kit',name,obj:g});
    if(o.name)KIT.things.push({name:o.name,obj:g,reach:1.2,tall:tall*s*YS,act:()=>{}});
    return g; }; }
export {KIT};
