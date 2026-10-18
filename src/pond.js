// ---- THE POND (owner, 18 Oct 2026: "copy the pool into a round pond in central park. the toads and other life will drink from it lik watering
// hole"): in the park's north-east lawn, a round pond of the pool's own real water (water3d.js's body: its waves, its glints, the bed seen through
// it), cut round where its square sheet would show (a disc of water inside a ring of stones, the ring's top a little over the water); its bed a
// dark mud disc; the stones a ring of rough blocks, solid round its edge (you walk round it, not in). The park's creatures that walk come to its
// edge now and then and drink (npc-creatures.js's pick: POND.edge). Cost: the water steps only within 14 tiles (as the shrine's and the tank's),
// one more program (the cut), the ring some 300 triangles, no light ----
const POND={}; window.POND=POND;
{ const go=()=>{ if(typeof PARK==='undefined'||!PARK.fire)return setTimeout(go,500);
    const P=PARK, X=x=>BOD.XS(x+(P.ox||0)), Z=y=>BOD.ZS(y+(P.oy||0)), Y=BOD.YS, [rx,ry]=P.round, cx=rx+12.5, cy=ry+11.5, R=4.2, RIM=9, LV=7;
    const WX=X(cx), WZ=Z(cy), RW=R*TILE;
    POND.c={x:WX,z:WZ}; POND.r=RW;
    // its bed: a dark mud disc, a hair over the lawn
    const bed=new THREE.Mesh(new THREE.CircleGeometry(RW,32).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x2f3a24})); bed.position.set(WX,.02,WZ); bed.receiveShadow=true;
    // the ring of stones: rough blocks round its edge, each its own grey and size
    const N=40, rocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),N), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), c=new THREE.Color();
    for(let i=0;i<N;i++){ const a=i/N*Math.PI*2, h=Math.sin(i*12.9898)*43758.5453%1, s=(.38+.14*Math.abs(h))*TILE, r=RW+s*.25;
      rocks.setMatrixAt(i,m4.compose(new THREE.Vector3(WX+Math.cos(a)*r,Y(RIM)*.45,WZ+Math.sin(a)*r),q.setFromEuler(e.set(h*3,a+h,h*2)),new THREE.Vector3(s,Y(RIM)*.75,s*.8))); const g=.42+.12*Math.abs(Math.sin(i*7.3)); rocks.setColorAt(i,c.setRGB(g,g*.98,g*.94)); }
    rocks.castShadow=rocks.receiveShadow=true;
    const grp=(typeof MAPG!=='undefined'&&MAPG.park)||scene; grp.add(bed,rocks);
    // the water: the pool's body, square, cut to the disc
    const W=WATER.body({name:'parkpond',X0:WX-RW,X1:WX+RW,Z0:WZ-RW,Z1:WZ+RW,lvl:Y(LV),GX:72,GY:72,dep:()=>.35});
    W.mat.fragmentShader=W.mat.fragmentShader.replace('void main(){ vec2 t=1./uGrid;','void main(){ if(length(vWp.xz-vec2('+WX.toFixed(3)+','+WZ.toFixed(3)+'))>'+(RW-.02*TILE).toFixed(3)+')discard; vec2 t=1./uGrid;');
    W.mat.customProgramCacheKey=()=>'parkpond'; W.mat.needsUpdate=true;
    // solid: a ring of boxes round it (no one walks in)
    for(let i=0;i<16;i++){ const a=i/16*Math.PI*2, x=WX+Math.cos(a)*RW, z=WZ+Math.sin(a)*RW, b=.62*TILE; SOL.up.push([x-b,z-b,x+b,z+b]); FIX.up.push([x-b,z-b,0,x+b,z+b,Y(RIM)]); }
    { const b=RW*.75; SOL.up.push([WX-b,WZ-b,WX+b,WZ+b]); FIX.up.push([WX-b,WZ-b,0,WX+b,WZ+b,Y(RIM)]); }
    // a spot on its edge to drink at (just outside the stones)
    POND.edge=()=>{ const a=Math.random()*Math.PI*2, r=RW+.95*TILE; return {x:WX+Math.cos(a)*r,z:WZ+Math.sin(a)*r}; };
    POND.ready=true; };
  go(); }
