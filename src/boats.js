// ---- THE BOATS IN THE POOL (owner, 17 Oct 2026, "start importing google drive assets based on most recent": his boat .fbx files, the kayak
// and the fishing boat, tools/props-bake.py → data/props.json): each a body in the pool's own physics with the ball and the ring (floats.js),
// held up by the water as water holds a hull (its buoyancy at points along the keel), rocking on the swell, pushed when you swim into it,
// sliding down the waves; coloured as the pack colours them (its palette), flat-shaded as the floats are ----
{ window.FLOATS=FLOATS; const P=POOLR, TLU=TILE, gx=x=>x/TLU, gy=z=>-z/TLU, toZ=y=>y/TLU+FLOATS.D, lvl=()=>WATER.lvl+(WATER.rise||0), b8=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), f32=s=>new Float32Array(b8(s).buffer);
  // a hull: its faces from the bake (feet at 0, 1 tall), its own size in metres, set round its middle (the mesh y up, as the ball's and the ring's;
  // the body's box z up: its half sizes x, depth, height). The pack's palette wasn't among his files, so each hull is painted by its height:
  // the kayak red with a dark cockpit, the fishing boat a white hull on a blue bottom, a wood deck, a white cabin
  const paint={kayak:y=>y<.62?[.8,.26,.16]:[.16,.16,.18],fisherboat:y=>y<.14?[.16,.24,.44]:y<.42?[.92,.92,.9]:y<.6?[.66,.5,.3]:[.9,.9,.88]};
  const hull=(key,metres)=>{ const D=PROPS[key], p=f32(D.p), s=metres/.84*TLU, g=new THREE.BufferGeometry(), P3=new Float32Array(p.length), C3=new Float32Array(p.length), pc=paint[key];
    for(let i=0;i<p.length;i+=3){ P3[i]=p[i]*s; P3[i+1]=(p[i+1]-.5)*s; P3[i+2]=p[i+2]*s; const c=pc(p[i+1]); C3[i]=c[0]; C3[i+1]=c[1]; C3[i+2]=c[2]; }
    g.setAttribute('position',new THREE.BufferAttribute(P3,3)); g.setAttribute('color',new THREE.BufferAttribute(C3,3)); g.computeVertexNormals(); g.computeBoundingBox();
    const bb=g.boundingBox, h=[(bb.max.x-bb.min.x)/2/TLU,(bb.max.z-bb.min.z)/2/TLU,(bb.max.y-bb.min.y)/2/TLU];
    return {mesh:new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true})),h}; };
  // each: its hull, its weight, where it floats (basin tiles), which way it lies; its buoyancy at ten points along the bottom
  for(const [key,metres,kg,bx,by,turn] of [['kayak',.72,22,P.bx0+10,P.by0+1.7,.3],['fisherboat',2,180,P.bx0+3.6,P.by0+3.6,-1.2]]){ const {mesh,h}=hull(key,metres), [hx,hy,hz]=h, pts=[];
    for(const i of [-.8,-.4,0,.4,.8])for(const j of [-.5,.5])pts.push([i*hx,j*hy,-hz*.6]);
    FLOATS.add({parts:[{t:'box',c:[0,0,0],h:[hx,hy,hz]}],m:kg,mu:.5,e:.25,at:[gx(P.X(bx)),gy(P.Z(by)),toZ(lvl())+hz*.2],q:[Math.cos(turn/2),0,0,Math.sin(turn/2)]},mesh,pts,8*hx*hy*hz*.55); } }   // (q: w, x, y, z; turned about up)
