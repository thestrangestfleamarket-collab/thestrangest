// ---- WEEDS AT THE FOOT OF EVERYTHING (owner, 18 Oct 2026: "put natural weeds and grass around places like this all around map ... realistically
// lived in"): where anything stands on the ground out of doors (a wall, a post, a building's side, a lamp's pole, a bench: every solid box the
// map has, FIX), tufts of grass and weeds grow along its foot, a little out from it, thick where a broad noise says the corner is damp and
// neglected, none where it says swept; now and then a dandelion's yellow head. Each tuft two crossed cards painted with blades (see-through
// between), swaying in the park's wind from the root (PARK.sway, PARK.windK). Nothing indoors, nothing between two boxes that touch. Derived from
// whatever stands on the map when the game opens, so a place moved or added elsewhere gets its weeds with no one placing them. Cut into map
// chunks of 32 tiles, each its own draw, so only the ones in the picture are drawn. Cost: some 4 triangles a tuft; no lights, one program ----
const WEEDS=window.WEEDS={};
WEEDS.init=()=>{ WEEDS.dbg=f=>f({FIX,SOL,TILE}); const T=TILE, hsh=(a,b,s)=>{ let h=(Math.floor(a)*374761393+Math.floor(b)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const vn=(x,y,s)=>{ const xi=Math.floor(x), yi=Math.floor(y), fx=x-xi, fy=y-yi, u=fx*fx*(3-2*fx), v=fy*fy*(3-2*fy); return (hsh(xi,yi,s)*(1-u)+hsh(xi+1,yi,s)*u)*(1-v)+(hsh(xi,yi+1,s)*(1-u)+hsh(xi+1,yi+1,s)*u)*v; };
  const B=(FIX.up||[]).filter(b=>b[5]-b[2]>.25*T&&b[2]<.6*T), RB=typeof ROOMS!=='undefined'&&ROOMS.boxes?ROOMS.boxes():[];
  const inside=(x,z)=>RB.some(b=>b.y0<1&&x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1)||(MODS.apts&&MODS.apts.inside&&MODS.apts.inside(x,z));
  const solidAt=(x,z)=>B.some(b=>x>b[0]&&x<b[3]&&z>b[1]&&z<b[4]);
  const gy=(x,z)=>MODS.bodega&&MODS.bodega.ground?MODS.bodega.ground(x,z):0;
  const TUFT=[], FLOW=[]; WEEDS.drop=[0,0,0];
  for(const b of B){ const [x0,z0,,x1,z1]=b, edges=[[x0,z0,x1,z0,0,-1],[x1,z0,x1,z1,1,0],[x1,z1,x0,z1,0,1],[x0,z1,x0,z0,-1,0]];
    for(const [ax,az,bx,bz,nx,nz] of edges){ const L=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.round(L/(.2*T)));
      for(let i=0;i<n;i++){ const t=(i+hsh(ax*7+i,az*3,11))/n, ex=ax+(bx-ax)*t, ez=az+(bz-az)*t, wild=vn(ex/(3*T),ez/(3*T),13);
        if(wild<.3||hsh(ex*13,ez*17,15)>wild*1.7){ WEEDS.drop[0]++; continue; }   // (swept here, neglected there)
        const out=(.03+hsh(ex*5,ez*9,17)*.12)*T, x=ex+nx*out, z=ez+nz*out; if(inside(x,z)){ WEEDS.drop[1]++; continue; } if(solidAt(x,z)){ WEEDS.drop[2]++; continue; }
        const s=(.28+hsh(ex*3,ez*11,19)*.34)*T*(.7+.6*wild); TUFT.push([x,gy(x,z),z,s,hsh(ex,ez,21)*3.14,hsh(ez,ex,23)]);
        if(hsh(ex*19,ez*23,25)<.07)FLOW.push([x+(hsh(ex,ez,27)-.5)*.1*T,gy(x,z)+s*.75,z]); } } }
  if(!TUFT.length)return;
  // the tuft's picture: nine blades, each its own lean and height, darker at the root, lit at the tip, see-through between
  const cv=document.createElement('canvas'); cv.width=cv.height=48; const g=cv.getContext('2d'), id=g.createImageData(48,48);
  for(let k=0;k<9;k++){ const bx=5+k*4.6+Math.sin(k*7)*1.5, lean=(hsh(k,1,41)-.5)*.7, top=Math.floor(48-(18+26*hsh(k,2,42))), wide=hsh(k,3,43)<.25;
    for(let y=top;y<48;y++){ const yy=47-y, px=bx+lean*yy, tt=yy/(47-top||1), w=(wide?3:2.2)*(1-tt*.7); for(let x=Math.floor(px-w);x<=Math.ceil(px+w);x++){ if(x<0||x>47||Math.abs(x-px)>w)continue; const i=(y*48+x)*4; id.data[i]=30+70*tt; id.data[i+1]=58+92*tt; id.data[i+2]=20+30*tt; id.data[i+3]=255; } } }
  g.putImageData(id,0,0); const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; tx.magFilter=THREE.NearestFilter;
  const card=new THREE.PlaneGeometry(1,1).translate(0,.5,0), c2=card.clone().rotateY(Math.PI/2), geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute([...card.attributes.position.array,...c2.attributes.position.array],3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute([...card.attributes.uv.array,...c2.attributes.uv.array],2));
  geo.setAttribute('normal',new THREE.Float32BufferAttribute(new Array(16).fill(0).flatMap(()=>[0,1,0]).slice(0,24),3)); geo.setIndex([0,2,1,2,3,1,4,6,5,6,7,5]);
  const mat=new THREE.MeshLambertMaterial({map:tx,alphaTest:.5,side:THREE.DoubleSide});
  mat.onBeforeCompile=sh=>{ sh.uniforms.uSw=PARK.sway; sh.uniforms.uWk=PARK.windK; sh.vertexShader='uniform float uSw,uWk;\n'+sh.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\n { vec4 w0=instanceMatrix*vec4(0.,0.,0.,1.); float ph=w0.x*.37+w0.z*.21, h=position.y*position.y, g=(.6+.4*sin(uSw*.4+ph*.3))*uWk; transformed.x+=sin(uSw*2.1+ph)*h*.16*g; transformed.z+=sin(uSw*1.7+ph*1.3)*h*.1*g; }'); };
  mat.customProgramCacheKey=()=>'weedsway';
  // the tufts by chunk, each chunk its own mesh with its own bounds (drawn only when in the picture)
  const CH=new Map(), cs=32*T; for(const t of TUFT){ const k=Math.floor(t[0]/cs)+','+Math.floor(t[2]/cs); if(!CH.has(k))CH.set(k,[]); CH.get(k).push(t); }
  const M=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), col=new THREE.Color(); WEEDS.meshes=[];
  for(const list of CH.values()){ const me=new THREE.InstancedMesh(geo,mat,list.length);
    list.forEach(([x,y,z,s,a,c],i)=>{ M.compose(new THREE.Vector3(x,y,z),q.setFromAxisAngle(up,a),new THREE.Vector3(s*1.1,s,s*1.1)); me.setMatrixAt(i,M); me.setColorAt(i,col.setHSL(.24+c*.08,.35+c*.25,.42+c*.2)); });
    me.computeBoundingSphere(); me.receiveShadow=true; scene.add(me); WEEDS.meshes.push(me); }
  if(FLOW.length){ const fm=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.05*T,0),new THREE.MeshLambertMaterial({color:0xf0cc30,emissive:0x2a1c00}),FLOW.length);
    FLOW.forEach(([x,y,z],i)=>{ M.compose(new THREE.Vector3(x,y,z),q.identity(),new THREE.Vector3(1,1,1)); fm.setMatrixAt(i,M); }); fm.computeBoundingSphere(); scene.add(fm); WEEDS.meshes.push(fm); }
  WEEDS.n=TUFT.length; WEEDS.flowers=FLOW.length; };
