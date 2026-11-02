// THE FLEA MARKET AND THE STREET FURNITURE: polyfork.dev's stalls, benches, meters and the like (data/polyfork.json, tools/polyfork-bake.py) put where data/world.json's things say, and their vendors on your rig (data/vendors.json) at the stalls, each selling (characters.json); all loaded after the start.
import {SHARED, THREE} from './003-shx.js';
import {B64, F32} from './003a-skin.js';
import {SHOPS, WED} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, MAPG, SOL, SYS, TILE} from './006-map-pre.js';
import {stfree} from './076-npc-map.js';
import {BODIES} from './111a-bodies.js';
{ const PF=__LAZY__("data/polyfork.json"), VD=__LAZY__("data/vendors.json"), FM=window.FLEA={made:[],want:(LEVEL.things||[]).length};
  const geo=D=>{ const p=F32(D.p), col=B64(D.c), C=new Float32Array(col.length), c=new THREE.Color();
    for(let i=0;i<col.length;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(p,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals(); g.computeBoundingBox(); return g; };
  const build=(P,V)=>{ const B=SHARED.BOD, T=TILE, M=T/.84, things=LEVEL.things||[], kinds={}, mat=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), Y=new THREE.Vector3(0,1,0), root=MAPG.bodega||MAPG.street||scene;
    for(const o of things){ const D=P[o.k]; if(!D)continue; const K=kinds[o.k]||(kinds[o.k]={g:geo(D),s:D.metres*M,L:[]}), bb=K.g.boundingBox, a=o.rot||0, ca=Math.abs(Math.cos(a)), sa=Math.abs(Math.sin(a));
      const hx=(bb.max.x-bb.min.x)/2*K.s, hz=(bb.max.z-bb.min.z)/2*K.s, ex=ca*hx+sa*hz, ez=sa*hx+ca*hz;
      let x=B.XS(o.x), z=B.ZS(o.y); const ok=(x,z)=>{ for(let u=-1;u<=1;u++)for(let v=-1;v<=1;v++)if(!stfree(x+u*ex*.8,z+v*ez*.8,.05*T))return false; return true; };
      if(!ok(x,z)){ let f=null; for(let k=1;k<=12&&!f;k++)for(const s of [1,-1])if(!f&&ok(x+s*k*.35*T,z))f=x+s*k*.35*T; if(f==null)continue; x=f; }
      const y=SHARED.groundY?SHARED.groundY(x,z):0, sol=[x-ex,z-ez,x+ex,z+ez], fix=[x-ex,z-ez,y,x+ex,z+ez,y+D.metres*M*.95]; SOL.up.push(sol); FIX.up.push(fix);
      K.L.push({o,x,y,z,a,sol,fix}); }
    for(const k in kinds){ const K=kinds[k], me=new THREE.InstancedMesh(K.g,mat,K.L.length);
      K.L.forEach((t,i)=>me.setMatrixAt(i,m4.compose(new THREE.Vector3(t.x,t.y,t.z),q.setFromAxisAngle(Y,t.a),new THREE.Vector3(K.s,K.s,K.s))));
      me.castShadow=me.receiveShadow=true; me.computeBoundingSphere(); root.add(me); WED.meshes.push({place:'street',me,items:K.L.map((t,i)=>({k:'pf-'+k+'-'+i,x:t.x,y:t.y,z:t.z,sol:t.sol,fix:t.fix}))}); FM.made.push(...K.L.map(t=>({k,...t}))); }
    for(const t of FM.made){ const w=t.o.who; if(!w||!V.bodies[w])continue; const K=kinds[t.k], bz=K.g.boundingBox.min.z*K.s-.35*M, a=t.a;
      LEVEL.homes[w]=[t.o.x+Math.sin(a)*bz/T,t.o.y+Math.cos(a)*bz/T,0,null];
      BODIES.rebaked(V,w,(LEVEL.chars&&LEVEL.chars[w]&&LEVEL.chars[w].name)||'A VENDOR',t.o.x,{size:V.bodies[w].height/1.8,hd:a}); }
    if(SHOPS.sync)SHOPS.sync(); };
  SYS.onStart(()=>Promise.all([PF(),VD()]).then(([P,V])=>build(P,V)).catch(e=>console.warn('FLEA',e)),'111fb-fleamarket'); }
