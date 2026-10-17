// ---- THE STREET DRESSED (owner, 17 Oct 2026: "start fleshing it out with our available assets to make it come to life"; then: "delete
// everything you added except for the new building, street lights, and trash can and bus stop"): the city kit's pieces (kit.js) that stay:
// trash cans at the kerb, a street light (the bus stop and its bench removed) ----
const DRESS={};
{ const G=MODS.bodega.ground, xm=(BOUND.x0+BOUND.x1)/2; let zc=null, zf=null; for(let z=BOUND.z0;z<BOUND.z1;z+=0.02){ const g=G(xm,z); if(zc==null&&g<-.01)zc=z; if(zc!=null&&zf==null&&g>-.01&&z>zc)zf=z; }
  const sw=zc-.5, far=zf+.6, AX=BOD.X(MODS.apts.A.x1), AX0=BOD.X(MODS.apts.A.x0), BX0=BOD.X(BOD.B0.x0);   // the kerb, the far kerb; the house's east wall, the bodega's west wall
  const P=(n,x,z,o)=>KIT.put(n,x,z,{solid:true,...o});
  // (owner, 17 Oct 2026, after the first dressing: "delete everything you added except for the new building, street lights, and trash can and
  // bus stop", "dont remove the dragon either"): the cans at the kerb, the bus stop with its bench, the street light; nothing else of the kit
  P('metaltrashcan_overflowing',BX0-1.2,sw,{rot:.4,m:1.1,name:'TRASH CAN'}); P('trash_can_full',AX0-1.5,sw,{rot:-.3,m:1.4,name:'TRASH CAN'}); P('metaltrashcan_closed',BOUND.x1-2.2,sw,{m:1.0,name:'TRASH CAN'});
  // (the bus stop and its bench: removed, owner 17 Oct 2026, "remove the bus stop and bus bench")
  // STREET LIGHTS AND LAMP POSTS (owner, 17 Oct 2026: "lets add a street light and lamp posts where they would go"): as a New York street has
  // them, the tall street lights at both kerbs, staggered, about every 30 m (the kit's, its arm over the road), each a light at its head; the
  // old cast-iron lamp posts (a post and a lantern, built here) along the park's side of the far sidewalk, a pair at the gate; each lamp a light
  // (LITE lights the 8 nearest you, the rest only glow), solid at its foot. Cost: some 2,000 triangles the lights, 130 the posts, no shadows of their own
  { const M=1/.84*TILE, SP=26*M, n=Math.floor((BOUND.x1-BOUND.x0-8)/SP)+1, x0=(BOUND.x0+BOUND.x1)/2-(n-1)*SP/2, warm=new THREE.Color(1,.88,.68);
    const heads=[], light=(x,y,z,i,r)=>{ const L=new THREE.PointLight(warm,i,r,1.6); L.position.set(x,y,z); L.userData.i0=i; scene.add(L); };
    for(let i=0;i<n;i++){ const x=x0+i*SP;   // (the near kerb's, then the far kerb's half a span along: staggered)
      P('street_light',x,sw-.25,{m:6.2,name:'STREET LIGHT'}); light(x,5.8*M,sw+1.4*M,40,13*TILE); heads.push([x,5.8*M,sw+1.4*M]);
      const xf=x+SP/2; if(xf<BOUND.x1-3){ P('street_light',xf,far+.25,{rot:Math.PI,m:6.2,name:'STREET LIGHT'}); light(xf,5.8*M,far-1.4*M,40,13*TILE); heads.push([xf,5.8*M,far-1.4*M]); } }
    // the lamp posts: the far sidewalk's park side (the wall's line, a little in front of it)
    const wz=BOD.ZS(PARK.y0), pz=far+(wz-far)*.7, g0=BOD.XS(PARK.gate[0]), g1=BOD.XS(PARK.gate[1]), xs=[g0-.9*M,g1+.9*M];
    for(let x=g0-14*M;x>BOUND.x0+2;x-=14*M)xs.push(x); for(let x=g1+14*M;x<BOUND.x1-2;x+=14*M)xs.push(x);
    const H=4.2*M, pole=new THREE.InstancedMesh(new THREE.BoxGeometry(.13*M,H,.13*M).translate(0,H/2,0),new THREE.MeshLambertMaterial({color:0x22262b}),xs.length*2),
      lant=new THREE.InstancedMesh(new THREE.BoxGeometry(.34*M,.5*M,.34*M),new THREE.MeshBasicMaterial({color:0xffe4b0}),xs.length), m4=new THREE.Matrix4(), y0=G(xs[0],pz);
    xs.forEach((x,i)=>{ const y=G(x,pz); pole.setMatrixAt(i*2,m4.makeTranslation(x,y,pz)); pole.setMatrixAt(i*2+1,m4.makeScale(2.6,.06,2.6).setPosition(x,y,pz));   // (the post and its foot)
      lant.setMatrixAt(i,m4.makeTranslation(x,y+H+.25*M,pz)); light(x,y+H+.2*M,pz,18,9*TILE);
      SOL.up.push([x-.12*M,pz-.12*M,x+.12*M,pz+.12*M]); FIX.up.push([x-.12*M,pz-.12*M,y,x+.12*M,pz+.12*M,y+H]); });
    const hd=new THREE.InstancedMesh(new THREE.BoxGeometry(.5*M,.08*M,.26*M),lant.material,heads.length); heads.forEach(([x,y,z],i)=>hd.setMatrixAt(i,m4.makeTranslation(x,y-.08*M,z))); scene.add(hd);   // (each street light's lamp, lit under its head)
    pole.castShadow=true; scene.add(pole,lant); DRESS.posts=xs.length; DRESS.lights=n*2+xs.length; }
  DRESS.tick=()=>{};
}
