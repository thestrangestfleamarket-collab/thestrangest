// ---- THE LOOP'S EDGES (owner, 17 Oct 2026: "use force field to block anyone from leaving outside of the city block loop ... add the hudson
// behind the buildings on main street, it goes all the way up and down map"; RING in map-pre.js):
// THE FORCE FIELD: four walls round the loop and the buildings on its outer side, solid for you, every character and the physics (thin solids
// along each edge), and the map's bound (BOUND's own edges: you can't be put past it); seen only near it: a faint cyan of hexagons that comes up
// within a few tiles of you and is gone past them (one draw, additive, no light). THE HUDSON: south of the main street's row and its alley, the
// land's whole width: a stone embankment along its bank, the water a flat surface of its own (not the pool's simulation: the owner's "real water
// only in the pool"), dark teal tinted by the sky, low-res glints drifting downstream. Cost: the river 2 triangles and the bank a few, the field 8 ----
const RINGX={};
{ const R=RING, XS=BOD.XS, ZS=BOD.ZS, F=R.ff, T=TILE;
  const x0=XS(F.x0), x1=XS(F.x1), z0=Math.min(ZS(F.y0),ZS(F.y1)), z1=Math.max(ZS(F.y0),ZS(F.y1)), H=26*T;
  // the bound: the field's edges (the station's below the street kept: it lies within)
  const S=MODS.station.BOUND; BOUND.x0=Math.min(x0,S.x0); BOUND.x1=Math.max(x1,S.x1); BOUND.z0=Math.min(z0,S.z0); BOUND.z1=Math.max(z1,S.z1); RINGX.bound={x0,x1,z0,z1};
  // the walls as solids (a fifth of a tile thick)
  const th=.2*T, wall=(a,b,c,d)=>{ SOL.up.push([a,b,c,d]); FIX.up.push([a,b,0,c,d,H]); };
  wall(x0-th,z0,x0,z1); wall(x1,z0,x1+th,z1); wall(x0,z0-th,x1,z0); wall(x0,z1,x1,z1+th);
  // the field seen: a box's four sides, its hexagons by world position, their light by how near you are
  const U={uP:{value:new THREE.Vector3()},uT:{value:0},uR:{value:6*T}};
  const fm=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
    vertexShader:'varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader:`uniform vec3 uP; uniform float uT,uR; varying vec3 vW;
      float hex(vec2 p){ p/=${(.9*T).toFixed(3)}; vec2 r=vec2(1.,1.732), h=r*.5; vec2 a=mod(p,r)-h, b=mod(p-h,r)-h; vec2 g=dot(a,a)<dot(b,b)?a:b; return max(abs(g.x)*.866+abs(g.y)*.5,abs(g.y)); }
      void main(){ float d=length(vec2(vW.x-uP.x,vW.z-uP.z)), near=1.-smoothstep(uR*.25,uR,d), h=vW.y-uP.y; near*=1.-smoothstep(3.,9.,abs(h)/${T.toFixed(3)});
        vec2 q=abs(vW.x-(${x0.toFixed(3)}))<.05||abs(vW.x-(${x1.toFixed(3)}))<.05?vec2(vW.z,vW.y):vec2(vW.x,vW.y); float e=hex(q), line=step(.475,e);
        float pulse=.55+.45*sin(uT*2.+vW.y*.6+q.x*.3); if(near<.01)discard; gl_FragColor=vec4(vec3(.25,.85,1.)*(line*.42+.03)*near*pulse,1.); }`});
  const box=new THREE.BoxGeometry(x1-x0,H,z1-z0,1,1,1); box.translate((x0+x1)/2,H/2-.5,(z0+z1)/2);
  { const I=box.index.array, keep=[]; for(let f=0;f<I.length;f+=6){ const n=box.attributes.normal.array, v=I[f]; if(Math.abs(n[v*3+1])<.5)keep.push(...Array.from(I.slice(f,f+6))); } box.setIndex(keep); }   // (its sides only)
  const field=new THREE.Mesh(box,fm); field.frustumCulled=false; field.renderOrder=5; scene.add(field); RINGX.field=field;
  // THE HUDSON: the embankment's coping and wall, the water
  const L=MODS.landR, rx0=L.x0*T, rx1=L.x1*T, rz0=Math.min(ZS(R.river.y0),ZS(R.river.y1)), rz1=Math.max(ZS(R.river.y0),ZS(R.river.y1));
  const bankZ=rz1, wy=-.5*ZU+.03;   // (its north bank, by the alley; the water just over the land's sheet)
  const stone=new THREE.MeshLambertMaterial({color:0x7c7a74}), bank=new THREE.Mesh(new THREE.BoxGeometry(rx1-rx0,.9*T,.5*T),stone); bank.position.set((rx0+rx1)/2,-.5*ZU+.1*T,bankZ+.25*T); bank.receiveShadow=bank.castShadow=true; scene.add(bank);
  const WU={uT:{value:0},uSky:{value:new THREE.Color(.5,.62,.75)},uDay:{value:1}};
  const wm=new THREE.ShaderMaterial({uniforms:WU,fog:false,
    vertexShader:'varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader:`uniform float uT,uDay; uniform vec3 uSky; varying vec3 vW;
      float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      void main(){ vec2 p=floor(vec2(vW.x+uT*${(1.6*T).toFixed(3)},vW.z)/${(.5*T).toFixed(3)});   /* (a glint a half-tile pixel, drifting downstream) */
        float g=step(.988,h(p+floor(uT*1.3)*vec2(0.,7.))), band=step(.7,h(vec2(floor(vW.z/${(1.4*T).toFixed(3)}),floor(uT*.6))));
        vec3 deep=vec3(.06,.16,.2)*(.35+.65*uDay), c=mix(deep,uSky*.55,.32)+band*.025; c+=g*(.28+.4*uDay)*vec3(.85,.95,1.); gl_FragColor=vec4(c,1.); }`});
  const water=new THREE.Mesh(new THREE.PlaneGeometry(rx1-rx0,rz1-rz0).rotateX(-Math.PI/2),wm); water.position.set((rx0+rx1)/2,wy,(rz0+rz1)/2); scene.add(water); RINGX.water=water;
  // each frame: the field's light round you, the water's drift and the sky on it
  RINGX.tick=dt=>{ const up=LVL!=='down'; if(!up)scene.background.setRGB(0,0,0);   /* (underground: black round it, not the last sky) */ const ins=typeof ROOMS!=='undefined'&&!!ROOMS.cur; field.visible=up&&!ins; water.visible=bank.visible=up&&!ins;   /* (inside a room: nothing of the world past its walls, owner 18 Oct 2026: their own shaders aren't cut by the room's planes) */ U.uP.value.set(pos.x,py,pos.z); U.uT.value+=dt; WU.uT.value+=dt;
    if(window.SKY&&SKY.U)WU.uSky.value.copy(SKY.U.uH.value); WU.uDay.value=Math.max(.15,Math.min(1,(CLOCK.elev()+4)/14)); };
  window.RINGX=RINGX; }
