// THE PLAYHOUSE'S KIT: the hands its builders work with (in metres, on the playhouse's own group): boxes, turned and swept shapes, lines, instanced rows, its materials, solids, grounds and things to use.
import {THREE} from './003-shx.js';
const PHK={}, PHX={parts:[]};   // the playhouse's other parts (the cloths, the lighting, the sets, the play) add {make(K), tick(dt,K,now)} here; the playhouse (151z) builds and runs them
PHK.make=TX=>{ '@playhouse';
  const G=new THREE.Group(), V3=THREE.Vector3, K={G,TX,sol:[],gr:[],things:[],seats:[],envMats:[],tick:[],lights:[],mirrors:[]};
  const lam=o=>new THREE.MeshLambertMaterial(o), std=o=>{ const m=new THREE.MeshStandardMaterial(o); K.envMats.push(m); return m; };
  const C=h=>new THREE.Color(h);
  // the materials: cloths, leaf, woods, stones, papers and metals (the shiny ones take the hall's reflection once it is taken)
  const M=K.M={
    velvet:lam({map:TX.velvet.map,bumpMap:TX.velvet.bump,bumpScale:.8}), velvetDark:lam({map:TX.velvetDark.map,bumpMap:TX.velvetDark.bump,bumpScale:.8}),
    seat:lam({map:TX.velvetSeat.map,bumpMap:TX.velvetSeat.bump,bumpScale:.6}), blackVel:lam({map:TX.velvetBlack.map,bumpMap:TX.velvetBlack.bump,bumpScale:.6}),
    gold:std({map:TX.gold,roughnessMap:TX.goldRough,metalness:1,roughness:.55}), orn:std({map:TX.orn,bumpMap:TX.ornBump,bumpScale:4,metalness:.9,roughness:.45}),
    boards:lam({map:TX.boards,bumpMap:TX.boardsBump,bumpScale:.5}), parquet:std({map:TX.parquet,roughness:.32,metalness:0,envMapIntensity:.35}),
    carpet:lam({map:TX.carpet}), damask:lam({map:TX.damask}), plaster:lam({map:TX.plaster}),
    marble:std({map:TX.marble,roughness:.18,metalness:0,envMapIntensity:.5}), marbleRed:std({map:TX.marbleRed,roughness:.2,metalness:0,envMapIntensity:.45}),
    brickBlack:lam({map:TX.brickBlack,bumpMap:TX.brickBump,bumpScale:1}),
    mahog:std({map:TX.mahogany,roughness:.38,metalness:0,envMapIntensity:.4}), pine:lam({map:TX.pine}), canvas:lam({map:TX.canvas,side:THREE.DoubleSide}),
    rope:lam({map:TX.rope}), iron:lam({color:C('#24221f')}), steel:std({color:C('#3a3c40'),metalness:.8,roughness:.5}), black:lam({color:C('#141214')}),
    matte:lam({color:C('#0c0b0c')}), brass:std({color:C('#d4a850'),metalness:1,roughness:.28}), chrome:std({color:C('#c8ccd0'),metalness:1,roughness:.12}),
    glass:std({color:C('#dfe8ec'),metalness:0,roughness:.03,transparent:true,opacity:.18,envMapIntensity:1.6,depthWrite:false,side:THREE.DoubleSide}),
    crystal:std({color:C('#f4fbff'),metalness:.2,roughness:0,transparent:true,opacity:.72,envMapIntensity:2.6}),
    bottle:std({color:C('#2e5a34'),metalness:0,roughness:.05,transparent:true,opacity:.7,envMapIntensity:1.4}),
    ivory:lam({color:C('#ece0c4')}), cream:lam({color:C('#f2e6cc')}), paper:lam({color:C('#efe6d0')}),
    skin:lam({color:C('#d8b090')}),
    bulb:new THREE.MeshBasicMaterial({color:C('#fff2cc')}), bulbOff:lam({color:C('#d8d2c0')}), red:new THREE.MeshBasicMaterial({color:C('#ff3a2a')}), green:new THREE.MeshBasicMaterial({color:C('#3aff6a')}),
    exit:new THREE.MeshBasicMaterial({color:C('#30ff70')}) };
  for(const k of ['velvet','velvetDark','seat','blackVel'])M[k].side=THREE.DoubleSide;
  const CC={}; K.col=c=>CC[c]||(CC[c]=lam({color:C(c)})); K.std=std; K.lam=lam;

  // a box's faces get uvs in metres over s (so one texture tiles the same on every size)
  const boxUV=(g,w,h,d,s)=>{ const uv=g.attributes.uv, dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]]; for(let f=0;f<6;f++)for(let v=0;v<4;v++){ const i=f*4+v; uv.setXY(i,uv.getX(i)*dims[f][0]/s,uv.getY(i)*dims[f][1]/s); } };
  const put=(m,x,y,z,o={})=>{ m.position.set(x,y,z); if(o.ry)m.rotation.y=o.ry; if(o.rx)m.rotation.x=o.rx; if(o.rz)m.rotation.z=o.rz; if(o.sc)m.scale.set(...o.sc);
    m.castShadow=o.cast!==false; m.receiveShadow=o.recv!==false; (o.p||G).add(m); return m; };
  K.put=put;
  K.box=(w,h,d,mat,x,y,z,o={})=>{ const g=new THREE.BoxGeometry(w,h,d); boxUV(g,w,h,d,o.s||1); return put(new THREE.Mesh(g,mat),x,y,z,o); };
  K.boxA=(x0,y0,z0,x1,y1,z1,mat,o={})=>K.box(Math.abs(x1-x0),Math.abs(y1-y0),Math.abs(z1-z0),mat,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,o);
  K.cyl=(r0,r1,h,mat,x,y,z,o={})=>put(new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,h,o.seg||16,1,!!o.open),mat),x,y,z,o);
  K.sph=(r,mat,x,y,z,o={})=>put(new THREE.Mesh(new THREE.SphereGeometry(r,o.seg||14,o.seg2||10,0,Math.PI*2,0,o.phi||Math.PI),mat),x,y,z,o);
  K.lathe=(pts,mat,x,y,z,o={})=>put(new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r,h])=>new THREE.Vector2(r,h)),o.seg||20),mat),x,y,z,o);
  K.plane=(w,h,mat,x,y,z,o={})=>{ const g=new THREE.PlaneGeometry(w,h); if(o.s){ const uv=g.attributes.uv; for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/o.s,uv.getY(i)*h/o.s); } return put(new THREE.Mesh(g,mat),x,y,z,{cast:false,...o}); };
  K.tor=(r,t,mat,x,y,z,o={})=>put(new THREE.Mesh(new THREE.TorusGeometry(r,t,o.seg2||8,o.seg||24,o.arc||Math.PI*2),mat),x,y,z,o);
  // a straight rod between two points (pipes, ropes, rails, chains' runs)
  const UP=new V3(0,1,0);
  K.rod=(a,b,r,mat,o={})=>{ const A=new V3(...a), B=new V3(...b), d=B.clone().sub(A), L=d.length(); const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,o.seg||8,1,!!o.open),mat);
    m.quaternion.setFromUnitVectors(UP,d.normalize()); return put(m,(A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2,{cast:o.cast,recv:o.recv,p:o.p}); };
  // a swept tube through points (a handrail's curve, a rope's sag)
  K.tube=(pts,r,mat,o={})=>{ const c=new THREE.CatmullRomCurve3(pts.map(p=>new V3(...p))); return put(new THREE.Mesh(new THREE.TubeGeometry(c,o.n||Math.max(8,pts.length*6),r,o.seg||8,false),mat),0,0,0,{cast:o.cast,p:o.p}); };
  // a hanging line: its sag found from its length (a catenary between two points, so a slack rope or a swag hangs as a rope does)
  K.cat=(a,b,slack)=>{ const A=new V3(...a), B=new V3(...b), n=16, out=[], span=Math.hypot(B.x-A.x,B.z-A.z), L=A.distanceTo(B)*(1+slack);
    const need=Math.sqrt(Math.max(1e-6,L*L-(B.y-A.y)**2)); let lo=.01, hi=1e4, c=1; for(let i=0;i<60;i++){ c=Math.sqrt(lo*hi); if(2*c*Math.sinh(span/(2*c))>need)lo=c; else hi=c; }
    const sag=x=>c*Math.cosh((x-span/2)/c)-c*Math.cosh(span/(2*c));
    for(let i=0;i<=n;i++){ const t=i/n, x=t*span; out.push([A.x+(B.x-A.x)*t,A.y+(B.y-A.y)*t+sag(x),A.z+(B.z-A.z)*t]); } return out; };
  // an extruded outline (an arch, a cartouche, a bow front): pts in x,y, depth along z
  K.ext=(pts,depth,mat,x,y,z,o={})=>{ const s=new THREE.Shape(pts.map(p=>new THREE.Vector2(p[0],p[1]))); if(o.holes)for(const h of o.holes)s.holes.push(new THREE.Path(h.map(p=>new THREE.Vector2(p[0],p[1]))));
    const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:!!o.bevel,bevelSize:o.bevel||0,bevelThickness:o.bevel||0,bevelSegments:2,curveSegments:o.cs||16});
    if(o.s){ const uv=g.attributes.uv; for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/o.s,uv.getY(i)/o.s); } return put(new THREE.Mesh(g,mat),x,y,z,o); };
  // many of one thing (seats, crystals, balusters, slats): one mesh drawn many times; at is a list of [x,y,z,ry,(sx,sy,sz)]
  K.inst=(geo,mat,at,o={})=>{ const m=new THREE.InstancedMesh(geo,mat,at.length), q=new THREE.Matrix4(), e=new THREE.Euler(), Q=new THREE.Quaternion(), S=new V3(), P=new V3();
    at.forEach((a,i)=>{ e.set(a[5]||0,a[3]||0,a[6]||0); Q.setFromEuler(e); S.set(a[4]||1,a[4]||1,a[4]||1); if(a[7])S.set(a[7][0],a[7][1],a[7][2]); q.compose(P.set(a[0],a[1],a[2]),Q,S); m.setMatrixAt(i,q); });
    m.instanceMatrix.needsUpdate=true; m.castShadow=o.cast!==false; m.receiveShadow=true; (o.p||G).add(m); return m; };
  // several shapes joined into one geometry (each placed by a matrix), so a seat or a lantern is one thing to draw
  K.merge=parts=>{ const P=[], N=[], U=[]; for(const [g0,mx] of parts){ const g=(g0.index?g0.toNonIndexed():g0.clone()); g.applyMatrix4(mx); const p=g.attributes.position, n=g.attributes.normal, u=g.attributes.uv;
      for(let i=0;i<p.count;i++){ P.push(p.getX(i),p.getY(i),p.getZ(i)); N.push(n.getX(i),n.getY(i),n.getZ(i)); U.push(u?u.getX(i):0,u?u.getY(i):0); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2)); return g; };
  K.mx=(x,y,z,rx=0,ry=0,rz=0,s=1)=>new THREE.Matrix4().compose(new V3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),typeof s==='number'?new V3(s,s,s):new V3(...s));
  // solids you can't walk into (x0,z0,x1,z1 in metres) and the ground's height over a region (first that answers wins)
  K.solid=(x0,z0,x1,z1)=>K.sol.push([Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1)]);
  K.ground=f=>K.gr.push(f);
  K.groundAt=(x,z)=>{ for(const f of K.gr){ const y=f(x,z); if(y!=null)return y; } return null; };
  // something to double-click: a box you can't see around it, its name, what it does
  K.thing=(name,x,y,z,w,h,d,act,o={})=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false})); m.position.set(x,y,z); m.userData.soft=m.userData.keep=m.userData.hit=1; G.add(m);
    K.things.push({name,obj:m,act,reach:o.reach||2.2,near:o.near||3.4,tall:h}); return m; };
  return K; };
export {PHK, PHX};
