// THE KIT: KIT turns the baked kit models into meshes and puts them in the world by name.
import {THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {KITD} from './004-main.js';
import {CLIPX, FIX, MAPG, MODS, SOL, TILE, ZU} from './006-map-pre.js';
const KIT={data:KITD,geos:{},things:[]};
{ const b=B64, i16=I16, u16=U16, u32=s=>new Uint32Array(b(s).buffer), YS=ZU*24/TILE;
  KIT.decode=M=>{ const q=i16(M.p), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3];
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(b(M.c),3,true)); g.setIndex(new THREE.BufferAttribute(M.i32?u32(M.i):u16(M.i),1));
    g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere(); return g; };
  KIT.geo=name=>{ if(KIT.geos[name])return KIT.geos[name]; const M=KITD[name]; if(!M){ console.warn('kit: no',name); return null; } return KIT.geos[name]=KIT.decode(M); };
  KIT.mat=new THREE.MeshLambertMaterial({vertexColors:true});
  KIT.piece=(name,w,geo)=>{ const g=geo||KIT.geo(name); if(!g)return null; g.boundingBox||g.computeBoundingBox(); const bb=g.boundingBox, s=w/Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z), me=new THREE.Mesh(g,KIT.mat), o=new THREE.Group();
    me.position.set(-(bb.min.x+bb.max.x)/2*s,-(bb.min.y+bb.max.y)/2*s,-(bb.min.z+bb.max.z)/2*s); me.scale.setScalar(s); me.userData.shared=true; o.add(me); return o; };
  const TINT={}; KIT.tint=(name,hex)=>{ const key=name+hex; if(TINT[key])return TINT[key]; const g=TINT[key]=KIT.geo(name).clone(), C=g.attributes.color, a=C.array, n=C.normalized?255:1, t=new THREE.Color().setHex(hex,THREE.LinearSRGBColorSpace), q=new THREE.Color(), out=new Uint8Array(a.length);
    for(let i=0;i<a.length;i+=3){ q.setRGB(a[i]/n,a[i+1]/n,a[i+2]/n); const hsl={}; q.getHSL(hsl); const keep=hsl.s<.18;
      const k=.55+hsl.l*.9; out[i]=keep?a[i]:Math.min(255,t.r*k*255); out[i+1]=keep?a[i+1]:Math.min(255,t.g*k*255); out[i+2]=keep?a[i+2]:Math.min(255,t.b*k*255); }
    g.setAttribute('color',new THREE.BufferAttribute(out,3,true)); return g; };
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
