// THE POND: POND builds the park's pond, its bed, its ring of rocks and its water.
import {SHARED, THREE} from './003-shx.js';
import {PARK, POND} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, MAPG, MODS, SOL, TILE, ZU} from './006-map-pre.js';
import {WATER} from './009-down.js';
 window.POND=POND;
{ const go=()=>{ '@park'; if(typeof PARK==='undefined'||!PARK.fire)return setTimeout(go,500);
    const P=PARK, X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0)), Y=SHARED.BOD.YS, [cx,cy,R]=P.lake, RIM=9, LV=7;
    const WX=X(cx), WZ=Z(cy), RW=R*TILE;
    POND.c={x:WX,z:WZ}; POND.r=RW;
    const bed=new THREE.Mesh(new THREE.CircleGeometry(RW,32).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x2f3a24})); bed.position.set(WX,.02,WZ); bed.receiveShadow=true;
    const N=40, rocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),N), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), c=new THREE.Color();
    for(let i=0;i<N;i++){ const a=i/N*Math.PI*2, h=Math.sin(i*12.9898)*43758.5453%1, s=(.38+.14*Math.abs(h))*TILE, r=RW+s*.25;
      rocks.setMatrixAt(i,m4.compose(new THREE.Vector3(WX+Math.cos(a)*r,Y(RIM)*.45,WZ+Math.sin(a)*r),q.setFromEuler(e.set(h*3,a+h,h*2)),new THREE.Vector3(s,Y(RIM)*.75,s*.8))); const g=.42+.12*Math.abs(Math.sin(i*7.3)); rocks.setColorAt(i,c.setRGB(g,g*.98,g*.94)); }
    rocks.castShadow=rocks.receiveShadow=true;
    const grp=(typeof MAPG!=='undefined'&&MAPG.park)||scene; grp.add(bed,rocks);
    const W=WATER.body({name:'parkpond',X0:WX-RW,X1:WX+RW,Z0:WZ-RW,Z1:WZ+RW,lvl:Y(LV),GX:72,GY:72,dep:()=>.35});
    W.mat.fragmentShader=W.mat.fragmentShader.replace('void main(){ vec2 t=1./uGrid;','void main(){ if(length(vWp.xz-vec2('+WX.toFixed(3)+','+WZ.toFixed(3)+'))>'+(RW-.02*TILE).toFixed(3)+')discard; vec2 t=1./uGrid;');
    W.mat.customProgramCacheKey=()=>'parkpond'; W.mat.needsUpdate=true;
    for(let i=0;i<16;i++){ const a=i/16*Math.PI*2, x=WX+Math.cos(a)*RW, z=WZ+Math.sin(a)*RW, b=.62*TILE; SOL.up.push([x-b,z-b,x+b,z+b]); FIX.up.push([x-b,z-b,0,x+b,z+b,Y(RIM)]); }
    { const b=RW*.75; SOL.up.push([WX-b,WZ-b,WX+b,WZ+b]); FIX.up.push([WX-b,WZ-b,0,WX+b,WZ+b,Y(RIM)]); }
    POND.edge=()=>{ const a=Math.random()*Math.PI*2, r=RW+.95*TILE; return {x:WX+Math.cos(a)*r,z:WZ+Math.sin(a)*r}; };
    POND.ready=true;
    if(MODS.land&&P.hill){ const S=1.25, nx=Math.ceil((P.x1-P.x0)/S), ny=Math.ceil((P.y1-P.y0)/S), V=[], U=[], I=[], idx=new Int32Array((nx+1)*(ny+1)).fill(-1), H=new Float32Array((nx+1)*(ny+1));
      for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)H[j*(nx+1)+i]=P.hill(P.x0+i*S,P.y0+j*S);
      const vi=(i,j)=>{ const k=j*(nx+1)+i; if(idx[k]<0){ const wx=X(P.x0+i*S), wz=Z(P.y0+j*S); idx[k]=V.length/3; V.push(wx,H[k]-.5*ZU+.004,wz); U.push(wx/TILE,-wz/TILE); } return idx[k]; };
      for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){ const h=Math.max(H[j*(nx+1)+i],H[j*(nx+1)+i+1],H[(j+1)*(nx+1)+i],H[(j+1)*(nx+1)+i+1]); if(h<=.001)continue;
        const a=vi(i,j), b=vi(i+1,j), c=vi(i+1,j+1), d=vi(i,j+1); I.push(a,d,b,b,d,c); }
      if(I.length){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(V,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2)); g.setIndex(I); g.computeVertexNormals();
        const me=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:MODS.land.material.map,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})); me.receiveShadow=true; me.castShadow=true; me.userData.cull=1; grp.add(me); POND.hills=me; POND.hillTris=I.length/3; } } };
  PARK.later(go); }
