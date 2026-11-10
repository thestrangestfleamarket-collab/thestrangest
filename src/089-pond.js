// THE POND: POND keeps THE LAKE's spot (the brook's end is its water) and builds the park's hills.
import {SHARED, THREE} from './003-shx.js';
import {PARK, POND} from './003b-systems.js';
import {MODS, TILE, ZU} from './006-map-pre.js';
 window.POND=POND;
{ const go=()=>{ '@park'; if(typeof PARK==='undefined'||!PARK.fire)return setTimeout(go,500);
    const P=PARK, X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0)), Y=SHARED.BOD.YS, [cx,cy,R]=P.lake, RIM=9, LV=7;
    const WX=X(cx), WZ=Z(cy), RW=R*TILE;
    POND.c={x:WX,z:WZ}; POND.r=RW;
    POND.edge=()=>{ const a=Math.random()*Math.PI*2, r=RW+.95*TILE; return {x:WX+Math.cos(a)*r,z:WZ+Math.sin(a)*r}; };
    POND.ready=true;
    if(MODS.land&&P.hill){ const OWN=P.ownGround||[], S=1.25, nx=Math.ceil((P.x1-P.x0)/S), ny=Math.ceil((P.y1-P.y0)/S), V=[], U=[], I=[], idx=new Int32Array((nx+1)*(ny+1)).fill(-1), H=new Float32Array((nx+1)*(ny+1));
      for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)H[j*(nx+1)+i]=P.hill(P.x0+i*S,P.y0+j*S);
      const vi=(i,j)=>{ const k=j*(nx+1)+i; if(idx[k]<0){ const wx=X(P.x0+i*S), wz=Z(P.y0+j*S); idx[k]=V.length/3; V.push(wx,H[k]-.5*ZU+.004,wz); U.push(wx/TILE,-wz/TILE); } return idx[k]; };
      for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){ const h=Math.max(H[j*(nx+1)+i],H[j*(nx+1)+i+1],H[(j+1)*(nx+1)+i],H[(j+1)*(nx+1)+i+1]); if(h<=.001||OWN.some(f=>f(P.x0+(i+.5)*S,P.y0+(j+.5)*S)))continue;
        const a=vi(i,j), b=vi(i+1,j), c=vi(i+1,j+1), d=vi(i,j+1); I.push(a,d,b,b,d,c); }
      if(I.length){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(V,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2)); g.setIndex(I); g.computeVertexNormals();
        const me=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:MODS.land.material.map,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})); me.receiveShadow=true; me.castShadow=true; me.userData.cull=1; P.G.add(me); POND.hills=me; POND.hillTris=I.length/3; } } };
  PARK.later(go); }
