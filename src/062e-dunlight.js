// THE DUNGEON'S BAKED LIGHT: every torch's light worked out once when the dungeon is built (walls block it), drawn on the dungeon's rock for free; the few real lights stay for you, the creatures and what moves (owner, 11 Nov 2026).
import {SHARED, THREE} from './003-shx.js';
import {LITE} from './003b-systems.js';
import {MODS, SYS, TILE} from './006-map-pre.js';
{ const U={dgOn:{value:0},dgL:{value:null},dgMin:{value:new THREE.Vector3()},dgSize:{value:new THREE.Vector3(1,1,1)},dgOff:{value:0},dgK:{value:0},
    dgPos:{value:[0,1,2,3].map(()=>new THREE.Vector3())},dgCol:{value:[0,1,2,3].map(()=>new THREE.Vector3())},dgRD:{value:[0,1,2,3].map(()=>new THREE.Vector2())}};
  const B={on:false,key:null,mats:new Set(),n:0,ms:0,skipped:0}, PK=THREE.Material.prototype.customProgramCacheKey;
  const HEAD='varying vec3 vDgW;\nuniform float dgOn; uniform highp sampler3D dgL; uniform vec3 dgMin; uniform vec3 dgSize; uniform float dgOff; uniform int dgK; uniform vec3 dgPos[4]; uniform vec3 dgCol[4]; uniform vec2 dgRD[4];\n';
  const PSTART='#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )';
  const IN='bool dgIn=dgOn>.5&&all(greaterThan(vDgW,dgMin))&&all(lessThan(vDgW,dgMin+dgSize));\n';
  // the baked light comes in as light from all round, kept as e/(1+e) in bytes, with how much it comes from above or below for the shading; the real lights that aren't torches (a headlight, a fire) are added back by hand
  const ADD=`
#if defined( RE_IndirectDiffuse )
if(dgIn){ vec3 dgWN=normalize(transpose(mat3(viewMatrix))*geometryNormal); vec4 dgT=texture(dgL,(vDgW+dgWN*dgOff-dgMin)/dgSize); irradiance+=dgT.rgb/max(1.-dgT.rgb,vec3(.004))*(.5+.5*dgWN.y*(dgT.a*2.-1.)); }
#endif
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
if(dgIn)for(int i=0;i<4;i++){ if(i>=dgK)break; PointLight dgPL; dgPL.position=(viewMatrix*vec4(dgPos[i],1.)).xyz; dgPL.color=dgCol[i]; dgPL.distance=dgRD[i].x; dgPL.decay=dgRD[i].y;
  getPointLightInfo(dgPL,geometryPosition,directLight); RE_Direct(directLight,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight); }
#endif
`;
  const patch=m=>{ '@dungeon'; if(!m||m.userData.dgb||m.isShaderMaterial||!(m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshStandardMaterial||m.isMeshToonMaterial))return; m.userData.dgb=1; B.mats.add(m);
    const f=m.onBeforeCompile, ck=m.customProgramCacheKey;
    m.onBeforeCompile=function(sh,r){ if(f)f.call(this,sh,r); let fs=sh.fragmentShader; const vs=sh.vertexShader;
      if(vs.indexOf('#include <project_vertex>')<0||fs.indexOf('#include <lights_fragment_maps>')<0){ B.skipped++; return; }
      fs=fs.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin);
      const a=fs.indexOf(PSTART), e=a<0?-1:fs.indexOf('#pragma unroll_loop_end',a), z=e<0?-1:fs.indexOf('#endif',e); if(z<0){ B.skipped++; return; }
      fs=fs.slice(0,a)+IN+PSTART+'\nif(!dgIn){'+fs.slice(a+PSTART.length,z)+'}\n'+fs.slice(z);   // in the dungeon the torches' real lights are already in the bake
      sh.fragmentShader=HEAD+fs.replace('#include <lights_fragment_maps>','#include <lights_fragment_maps>\n'+ADD);
      sh.vertexShader='varying vec3 vDgW;\n'+vs.replace('#include <project_vertex>','#include <project_vertex>\n vDgW=transpose(mat3(viewMatrix))*(mvPosition.xyz-viewMatrix[3].xyz);');
      Object.assign(sh.uniforms,U); };
    m.customProgramCacheKey=function(){ return (ck===PK?(f?f.toString():''):ck.call(this))+'|dgb1'; }; m.needsUpdate=true; };
  const tex=(H,nx,ny,nz)=>{ const t=new THREE.Data3DTexture(H,nx,ny,nz); t.format=THREE.RGBAFormat; t.type=THREE.UnsignedByteType; t.minFilter=t.magFilter=THREE.LinearFilter; t.wrapS=t.wrapT=t.wrapR=THREE.ClampToEdgeWrapping; t.unpackAlignment=1; t.needsUpdate=true; return t; };
  // the same light three's point lights give (LITE's pool: distance ×1.3, decay at least 2.2), summed for every torch that can see the spot
  const bake=({G,lights,bound,open,key})=>{ '@dungeon'; const t0=performance.now();
    const Ls=lights.filter(L=>(L.userData.i0??L.intensity)>0), k=key+'|'+Ls.map(L=>[L.position.x,L.position.y,L.position.z,L.color.getHex(),L.userData.i0??L.intensity,L.distance].map(v=>+(+v).toFixed(2)).join(',')).join(';');
    for(const L of lights)L.userData.dgb=1;
    if(B.key!==k){ if(U.dgL.value){ U.dgL.value.dispose(); U.dgL.value=null; }
      const bx=new THREE.Box3().setFromObject(G), s=TILE/2, x0=bound.x0-s, z0=Math.min(bound.z0,bound.z1)-s, y0=bx.min.y-s, y1=bx.max.y+s;
      const nx=Math.ceil((bound.x1-x0+s)/s), nz=Math.ceil((Math.max(bound.z0,bound.z1)-z0+s)/s), ny=Math.max(2,Math.min(24,Math.ceil((y1-y0)/TILE))), sy=(y1-y0)/ny, N=nx*ny*nz;
      const O=new Uint8Array(nx*nz); for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)O[j*nx+i]=open(x0+(i+.5)*s,z0+(j+.5)*s)?1:0;
      const oAt=(x,z)=>{ const i=Math.floor((x-x0)/s), j=Math.floor((z-z0)/s); return i>=0&&j>=0&&i<nx&&j<nz&&O[j*nx+i]; };
      const E=new Float32Array(N*3), D=new Float32Array(N);
      for(const L of Ls){ const I=L.userData.i0??L.intensity, cr=L.color.r*I, cg=L.color.g*I, cb=L.color.b*I, cut=L.distance*1.3, dk=Math.max(L.decay,2.2), P=L.position, lw=.2126*cr+.7152*cg+.0722*cb;
        const i0=Math.max(0,Math.floor((P.x-cut-x0)/s)), i1=Math.min(nx-1,Math.ceil((P.x+cut-x0)/s)), j0=Math.max(0,Math.floor((P.z-cut-z0)/s)), j1=Math.min(nz-1,Math.ceil((P.z+cut-z0)/s));
        for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){ if(!O[j*nx+i])continue; const cx=x0+(i+.5)*s, cz=z0+(j+.5)*s, dx=P.x-cx, dz=P.z-cz, dh=Math.hypot(dx,dz); if(dh>cut)continue;
          let seen=true; const st=Math.ceil(dh/(s*.5)); for(let q=1;q<st-1;q++){ const u=q/st; if(!oAt(cx+dx*u,cz+dz*u)){ seen=false; break; } } if(!seen)continue;   // a wall between: no light
          for(let l=0;l<ny;l++){ const cy=y0+(l+.5)*sy, dy=P.y-cy, d=Math.hypot(dh,dy); if(d>=cut)continue; const w=Math.max(0,1-(d/cut)**4), a=w*w/Math.max(d**dk,.01), q=(j*ny+l)*nx+i, o=q*3;
            E[o]+=cr*a; E[o+1]+=cg*a; E[o+2]+=cb*a; D[q]+=dy/Math.max(d,1e-6)*lw*a; } } }
      for(let pass=0;pass<2;pass++){ const F=O.slice(); for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){ if(O[j*nx+i])continue; const nb=[[i-1,j],[i+1,j],[i,j-1],[i,j+1]].filter(([a,b])=>a>=0&&b>=0&&a<nx&&b<nz&&O[b*nx+a]); if(!nb.length)continue;   // the closed rock next to a room takes the room's light, so the walls' own edge isn't dark
          for(let l=0;l<ny;l++){ const q=(j*ny+l)*nx+i; for(const [a,b] of nb){ const p=(b*ny+l)*nx+a; for(let c=0;c<3;c++)E[q*3+c]+=E[p*3+c]/nb.length; D[q]+=D[p]/nb.length; } } F[j*nx+i]=1; } O.set(F); }
      const T8=new Uint8Array(N*4); for(let q=0;q<N;q++){ const e0=E[q*3], e1=E[q*3+1], e2=E[q*3+2], lm=.2126*e0+.7152*e1+.0722*e2; T8[q*4]=Math.round(255*e0/(1+e0)); T8[q*4+1]=Math.round(255*e1/(1+e1)); T8[q*4+2]=Math.round(255*e2/(1+e2)); T8[q*4+3]=Math.round(127.5+127.5*Math.max(-1,Math.min(1,lm>1e-6?D[q]/lm:0))); }
      U.dgL.value=tex(T8,nx,ny,nz); U.dgMin.value.set(x0,y0,z0); U.dgSize.value.set(nx*s,ny*sy,nz*s); U.dgOff.value=s*.5; B.key=k; B.n=Ls.length; B.dim=[nx,ny,nz]; }
    G.traverse(o=>{ if(o.isMesh&&!o.isSkinnedMesh)for(const m of [].concat(o.material))patch(m); });
    B.ms=Math.round(performance.now()-t0); B.on=true; };
  SYS.add('life',()=>{ const on=B.on&&SHARED.LVL==='down'; U.dgOn.value=on?1:0; if(!on){ U.dgK.value=0; return; }
    let n=0; for(const L of (LITE.slots||LITE.sel.map(p=>p[1]))){ if(n>=4)break; if(!L||L.userData.dgb||!(L.intensity>0))continue; const I=L.intensity*LITE.dim(L.position);   // what LITE's pool lights that isn't a baked torch
      U.dgPos.value[n].copy(L.position); U.dgCol.value[n].set(L.color.r*I,L.color.g*I,L.color.b*I); U.dgRD.value[n].set(L.distance*1.3,Math.max(L.decay,2.2)); n++; }
    U.dgK.value=n; },'062e-dunlight');
  MODS.dunBake={bake,off:()=>{ B.on=false; U.dgOn.value=0; },U};
  window.DGB=()=>({on:B.on,lights:B.n,ms:B.ms,dim:B.dim,mats:B.mats.size,skipped:B.skipped,dyn:U.dgK.value}); }
