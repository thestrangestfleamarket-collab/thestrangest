// ---- THINGS THAT FLOAT: a beach ball and a float ring, bodies of the game's own physics (47-physics-1) in a world of their own whose floor is the
// basin's (its bed in strips, the deck round it), held up by the water as water holds things: at points over each, the weight of the water
// it pushes aside (Archimedes: 1000 kg a cubic metre), so it sits as deep as it weighs, rights itself, tilts with the swell and slides down the
// waves' slopes; slowed by the water's drag; pushing the water back where it moves in it, and throwing spray where it falls in hard; you push
// it swimming, or kick it from the deck ----
const FLOATS={bodies:[], D:6, acc:0};
{ const P=POOLR, D=FLOATS.D, gx=x=>x/TL, gy=z=>-z/TL, toZ=y=>y/TL+D, RHO=1000*0.84**3;   // (water a tile cubed: 593 kg)
  const st=[], X0=P.X(P.bx0), X1=P.X(P.bx1), Z0=P.Z(P.by0), Z1=P.Z(P.by1);
  // the deck round the basin (its walls are the deck's edges), and the bed under the water in quarter-tile strips
  const box=(xa,za,xb,zb,top)=>st.push([gx(Math.min(xa,xb)),gy(Math.max(za,zb)),0,gx(Math.max(xa,xb)),gy(Math.min(za,zb)),top]);
  const R0=P.X(P.x0), R1=P.X(P.x1), Q0=P.Z(P.y0), Q1=P.Z(P.y1);
  box(R0,Q0,X0,Q1,D); box(X1,Q0,R1,Q1,D); box(X0,Q0,X1,Z0,D); box(X0,Z1,X1,Q1,D);
  for(let a=0;a<P.LX;a+=0.25)box(P.X(P.bx0+a),Z0,P.X(P.bx0+a+0.25),Z1,toZ(P.Y(P.bedAt(a+0.125))));
  FLOATS.st=st;
  const lvl=()=>WATER.lvl+(WATER.rise||0);
  const add=FLOATS.add=(o,mesh,pts,vol)=>{ const b=phyBody(o); b.mesh=mesh; b.bp=pts; b.vol=vol; mesh.matrixAutoUpdate=false; mesh.traverse(m=>{ m.castShadow=true; }); scene.add(mesh); FLOATS.bodies.push(b); phyWake(b); return b; };
  // the beach ball: 36 cm across, 0.3 kg, white with coloured panels; its buoyancy at seven points through it
  { const r=0.18/0.84, g=new THREE.IcosahedronGeometry(r*TL,2), col=[], p=g.attributes.position;
    for(let i=0;i<p.count;i++){ const a=Math.atan2(p.getZ(i),p.getX(i)), k=Math.floor((a+Math.PI)/(Math.PI/3))%6, y=p.getY(i)/(r*TL); const c=Math.abs(y)>0.85?[1,1,1]:[[0.9,0.15,0.12],[1,1,1],[0.2,0.4,0.85],[1,1,1],[0.98,0.8,0.15],[1,1,1]][k]; col.push(...c); }
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}));
    const pts=[[0,0,0],[r*.6,0,0],[-r*.6,0,0],[0,r*.6,0],[0,-r*.6,0],[0,0,r*.6],[0,0,-r*.6]];
    add({parts:[{t:'ball',c:[0,0,0],r}],m:0.3,mu:0.4,e:0.55,at:[gx(P.X(P.bx0+3)),gy(P.Z(P.by0+1.6)),toZ(lvl())+r*0.3]},m,pts,4/3*Math.PI*r**3); }
  // the float ring: 60 cm across, a tube 14 cm thick, 0.5 kg, red and white; its buoyancy at twelve points round the tube
  { const R=0.23/0.84, t=0.07/0.84, g=new THREE.TorusGeometry(R*TL,t*TL,6,16); g.rotateX(Math.PI/2); const col=[], p=g.attributes.position;
    for(let i=0;i<p.count;i++){ const a=Math.atan2(p.getZ(i),p.getX(i)); col.push(...(Math.floor((a+Math.PI)/(Math.PI/4))%2?[0.92,0.18,0.15]:[0.96,0.96,0.94])); }
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}));
    const pts=[...Array(12)].map((_,i)=>[Math.cos(i*Math.PI/6)*R,Math.sin(i*Math.PI/6)*R,0]);
    add({parts:[{t:'cyl',c:[0,0,0],r:R+t,hh:t}],m:0.5,mu:0.5,e:0.3,at:[gx(P.X(P.bx0+6.5)),gy(P.Z(P.by0+3)),toZ(lvl())]},m,pts,2*Math.PI**2*R*t*t); }
  // ONE STEP (the engine's 120 a second): the water's push and drag on each, him pushing them, the engine's own step (the floor, the
  // deck, each other, his figure and his fists and feet), then what each did to the water
  const g0=new THREE.Vector3();
  FLOATS.step=(dt,walker)=>{ FLOATS.acc+=Math.min(dt,0.05); let n=0;
    while(FLOATS.acc>=PHH&&n<6){ FLOATS.acc-=PHH; n++; const h=PHH;
      for(const b of FLOATS.bodies){ let wet=0; const per=b.vol/b.bp.length;
        for(const q of b.bp){ const w=phyW(b,q), wx=w[0]*TL, wz=-w[1]*TL, surf=WATER.over(wx,wz)?toZ(lvl()+WATER.hAt(wx,wz)):-1e9, rp=Math.cbrt(per)*0.62, s=Math.max(0,Math.min(1,(surf-w[2])/(2*rp)+0.5));
          if(!s)continue; wet+=s/b.bp.length; const J=RHO*PHG*per*s*h, r=v3s(w,b.x); b.v[2]+=J*b.iM; b.w=v3a(b.w,phyIw(b,v3x(r,[0,0,J]))); }
        if(wet>0){ phyWake(b); b.rest=0; const f=Math.min(1,wet*8);   // (the water's drag and the water it must move to bob: a float settles in about a second, as real ones do)
          b.v=[b.v[0]*Math.exp(-2.5*f*h),b.v[1]*Math.exp(-2.5*f*h),b.v[2]*Math.exp(-45*f*h)]; b.w=v3k(b.w,Math.exp(-8*f*h));
          const sx=b.x[0]*TL, sz=-b.x[1]*TL, [hx,hz]=WATER.slope(sx,sz); b.v[0]-=PHG*hx*wet*h*1.5; b.v[1]+=PHG*hz*wet*h*1.5;   // (down the wave's slope: the water's pressure)
          if(walker.inWater){ const dx=sx-walker.x, dz=sz-walker.z, d=Math.hypot(dx,dz), R=0.45+b.rad*TL; if(d<R&&d>1e-4){ const k2=(R-d)*25*h/TL; b.v[0]+=dx/d*k2+walker.vx/TL*h*3; b.v[1]+=-dz/d*k2-walker.vz/TL*h*3; } } }   // (him, swimming: he shoves it aside and carries it on)
        b.wet0=b.wet; b.wet=wet; }
      PHYZ0=D; const S0=PHYOU.strikes; PHYOU.strikes=(S0||[]).map(s=>({...s,p:[s.p[0],s.p[1],s.p[2]+D]}));
      phyStep(FLOATS.bodies,st,h,null,null); PHYOU.strikes=S0; PHYZ0=0; }
    // what each did to the water: where it bobs or is pushed through it, a ripple; where it fell in fast, a splash and its spray
    for(const b of FLOATS.bodies){ const x=b.x[0]*TL, z=-b.x[1]*TL, y=(b.x[2]-D)*TL, sp=Math.hypot(...b.v)*TL;
      if(b.wet>0&&b.wet<0.99&&sp>0.08&&WATER.over(x,z))WATER.drop(x,z,b.rad*TL*1.4,Math.min(0.02,sp*0.004));
      if(!(b.wet0>0)&&b.wet>0&&b.v[2]*TL<-1.2){ WATER.drop(x,z,b.rad*TL*2,Math.min(0.06,-b.v[2]*TL*0.012)); WATER.splash(x,WATER.lvl,z,24,Math.min(2.4,-b.v[2]*TL*0.5)); }
      b.mesh.matrix.copy(FLOATS.mat(b,x,y,z)); b.mesh.matrixWorldNeedsUpdate=true; } };
  // a body's turn into the scene's frame (its x the scene's x, its y the scene's -z, its z up)
  const CM=new THREE.Matrix3().set(1,0,0,0,0,1,0,-1,0), CMT=CM.clone().transpose(), m3=new THREE.Matrix3(), m4=new THREE.Matrix4();
  FLOATS.mat=(b,x,y,z)=>{ const m=b.m3; m3.set(m[0],m[1],m[2],m[3],m[4],m[5],m[6],m[7],m[8]).premultiply(CM).multiply(CMT); return m4.setFromMatrix3(m3).setPosition(x,y,z); };
}
