// ---- THE CITY'S VEHICLES (owner, 17 Oct 2026: "lets add the rest ... look in the google drive for assets to use for anything new you add
// first before making it for yourself ... minimal"): the Drive's own car pack (Designersoup Low Poly Car Pack Volume 1, five cars, .fbx made
// .glb with fbx2gltf, baked by tools/kit-bake.py with OUT=data/vehicles.json, cut to a third by tools/simplify.py: 2,100-4,500 triangles each)
// dressed for the city by a tint over the pack's paint and a light bar: the PATROL CAR (the Toyoyo Highlight, navy and white), the FIRE TRUCK
// (the Landyroamer, red), the WORKS VAN (the Beatall, orange: deliveries, the trash round, the power crew), the AMBULANCE (the docLorean, white).
// Each drives the road only (the street's two lanes, one each way, on past the street's end to the civic row), to the x it's sent to, and a
// rider steps out at the kerb there (VEH.ride: he's hidden while he rides). The light bar flashes on a call. Cost: four cars, 12,000 triangles
// all told when all are on screen (parked far off they're culled), no lights, nothing a frame while none moves ----
const VEH={list:[],kinds:{}}; window.VEH=VEH;
{ const T=TILE, YS=ZU*24/TILE, b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), i16=s=>new Int16Array(b(s).buffer), u16=s=>new Uint16Array(b(s).buffer), u32=s=>new Uint32Array(b(s).buffer);
  const geoOf=(name,tint,k)=>{ const M=VEHD[name]; if(!M)return null; const q=i16(M.p), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3];
    const C=b(M.c), c=new Uint8Array(C.length); for(let i=0;i<C.length;i+=3){ const l=(C[i]*.3+C[i+1]*.59+C[i+2]*.11)/255; for(let j=0;j<3;j++)c[i+j]=tint?Math.min(255,C[i+j]*(1-k)+tint[j]*255*k*(.35+.65*l)):C[i+j]; }   // (the tint laid over the paint, its shading kept)
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(c,3,true)); g.setIndex(new THREE.BufferAttribute(M.i32?u32(M.i):u16(M.i),1)); g.computeVertexNormals(); g.computeBoundingBox(); return g; };
  VEH.mat=new THREE.MeshLambertMaterial({vertexColors:true}); const barM=[new THREE.MeshBasicMaterial({color:0xff3a2a}),new THREE.MeshBasicMaterial({color:0x3a7aff}),new THREE.MeshBasicMaterial({color:0x2a2a2e})];
  // the road: the street's kerb lines (dress.js), a lane each way; on past the street's end, the same lines
  const lanes=()=>{ const K=DRESS.kerb; return K?{e:K.sw+(K.far-K.sw)*.3,w:K.sw+(K.far-K.sw)*.7,kerb:K.sw}:{e:0,w:0,kerb:0}; };
  VEH.make=(kind,name,piece,tint,k,o={})=>{ const geo=geoOf(piece,tint,k); if(!geo)return null; const bb=geo.boundingBox, s=1/.84*T, me=new THREE.Mesh(geo,VEH.mat); me.castShadow=true; me.receiveShadow=true;
    me.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2); const body=new THREE.Group(); body.add(me); body.scale.set(s,s*YS,s); const g=new THREE.Group(); g.add(body);
    const L=(bb.max.x-bb.min.x)*s, W=(bb.max.z-bb.min.z)*s, H=(bb.max.y-bb.min.y)*s*YS, bar=[];
    if(o.bar){ for(let i=0;i<2;i++){ const m=new THREE.Mesh(new THREE.BoxGeometry(.11*T,.07*T,.16*T),barM[2]); m.position.set((i?.1:-.1)*T,H+.03*T,0); g.add(m); bar.push(m); } }   // (the light bar across the roof's middle)
    MAPG.bodega.add(g); const v={kind,name,piece,g,L,W,H,bar,x:o.x||0,z:0,h:0,v:0,to:null,then:null,alarm:false,rider:null,home:o.x||0,ph:0}; v.z=lanes().e; g.position.set(v.x,MODS.bodega.ground(v.x,v.z),v.z); VEH.list.push(v); VEH.kinds[kind]=v; return v; };
  // drive to an x along the road (the eastbound lane going east, the westbound going west: a turn across the road between them), then park
  VEH.drive=(v,x,then)=>{ v.to=x; v.then=then||null; v.v=7*T; const ln=lanes(); v.lane=x>v.x?ln.e:ln.w; v.dir=x>v.x?1:-1; };
  VEH.ride=(N,v,x,then)=>{ v.rider=N; N.mode='hidden'; N.g.visible=false; N.st.hold=true; N.st.to=null; CITY.stop(N); VEH.drive(v,x,()=>{ const K=lanes(); N.st.x=v.x+v.dir*-.5*T; N.st.z=K.kerb-.6*T; N.g.position.x=N.st.x; N.g.position.z=N.st.z; delete N.mode; N.g.visible=true; N.fv=true; N.st.hold=false; v.rider=null; then&&then(); }); };
  VEH.tick=dt=>{ for(const v of VEH.list){ if(v.to!=null){ const dz=v.lane-v.z, dx=v.to-v.x, d=Math.hypot(dx,dz), s=v.v*dt; if(d<=s){ v.x=v.to; v.z=v.lane; v.to=null; const f=v.then; v.then=null; f&&f(); } else { v.x+=Math.sign(dx)*Math.min(Math.abs(dx),s); v.z+=dz*Math.min(1,dt*2.5); }   /* (along its lane; eased across to it) */
        v.g.position.set(v.x,MODS.bodega.ground(v.x,v.z),v.z); v.g.rotation.y=v.dir>0?0:Math.PI; }   // (the pack's cars lie along x, nose to +x)
      if(v.bar.length){ v.ph+=dt; const on=v.alarm&&v.g.visible; v.bar[0].material=on?(Math.floor(v.ph*4)%2?barM[0]:barM[2]):barM[2]; v.bar[1].material=on?(Math.floor(v.ph*4)%2?barM[2]:barM[1]):barM[2]; } } };
  VEH.at=(v,x)=>Math.abs(v.x-x)<1.5*T;
  window.VEHDBG=()=>VEH.list.map(v=>({kind:v.kind,x:+(v.x/T).toFixed(1),z:+(v.z/T).toFixed(1),to:v.to!=null?+(v.to/T).toFixed(1):null,rider:v.rider&&v.rider.key,alarm:v.alarm,tris:VEHD[v.piece].tris}));
}
