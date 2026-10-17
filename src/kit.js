// ---- THE KITS (owner, 17 Oct 2026, the G folder: a city street kit and a restaurant kit, low-poly and textured; tools/kit-bake.py reads them into
// data/kit.json): a piece is a mesh of its points and its texture's colour at each (no texture at run time: the colours ride the points), lit by the
// lamps like the rest (Lambert, its own shadows), placed on the ground at a spot, turned, sized in metres as the characters are (makeNPC's
// scale), and standing in the way (a solid for the Walker, a box for the characters' engine) when it should ----
const KIT={data:KITD,geos:{},things:[]};
{ const b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), i16=s=>new Int16Array(b(s).buffer), u16=s=>new Uint16Array(b(s).buffer), u32=s=>new Uint32Array(b(s).buffer), YS=ZU*24/TILE;
  KIT.geo=name=>{ if(KIT.geos[name])return KIT.geos[name]; const M=KITD[name]; if(!M){ console.warn('kit: no',name); return null; }
    const q=i16(M.p), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3];
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(b(M.c),3,true)); g.setIndex(new THREE.BufferAttribute(M.i32?u32(M.i):u16(M.i),1));
    g.computeVertexNormals(); g.computeBoundingBox(); return KIT.geos[name]=g; };
  KIT.mat=new THREE.MeshLambertMaterial({vertexColors:true});
  // a piece at x, z on the ground (its feet at its box's bottom, its middle over the spot), turned rot about up, its height in metres (or its own
  // size, m 0: the kit's metres as they are); solid: it blocks (its footprint, shrunk a little); group: where it goes (the street's level)
  KIT.put=(name,x,z,o={})=>{ const geo=KIT.geo(name); if(!geo)return null; const M=KITD[name], bb=geo.boundingBox, tall=bb.max.y-bb.min.y, s=o.m?o.m/.84*TILE/tall:1/.84*TILE;
    const me=new THREE.Mesh(geo,o.mat||KIT.mat); me.castShadow=true; me.receiveShadow=true; me.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2);
    const body=new THREE.Group(); body.add(me); body.scale.set(s,s*YS,s); const g=new THREE.Group(); g.add(body); g.rotation.y=o.rot||0;
    const gy=o.ground?o.ground(x,z):MODS.bodega.ground(x,z); g.position.set(x,gy+(o.lift||0),z); (o.group||MAPG.bodega).add(g);
    if(o.solid){ const hw=(bb.max.x-bb.min.x)*s/2*(o.solid===true?.8:o.solid), hd=(bb.max.z-bb.min.z)*s/2*(o.solid===true?.8:o.solid), c=Math.abs(Math.cos(g.rotation.y)), sn=Math.abs(Math.sin(g.rotation.y)), ex=hw*c+hd*sn, ez=hw*sn+hd*c;
      SOL.up.push([x-ex,z-ez,x+ex,z+ez]); FIX.up.push([x-ex,z-ez,gy,x+ex,z+ez,gy+tall*s*YS]); }
    if(o.name)KIT.things.push({name:o.name,obj:g,reach:1.2,tall:tall*s*YS,act:()=>{}});   // (named: a double click walks up to it; joined to the menu's list once the page has started: build.py)
    return g; }; }
