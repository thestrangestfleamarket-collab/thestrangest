// THE SKATEPARK: the Drive's skatepark kit (data/skatepark.json), its whole layout as a place off the map, entered by its gateway in the park.
import {SHARED, THREE} from './003-shx.js';
import {ROOMS} from './003b-systems.js';
import {scene} from './004-main.js';
import {SOL, TILE, ZU} from './006-map-pre.js';
import {KIT} from './068-kit.js';
const SKATE={};
{ const T=TILE, MH=T/.84, MV=ZU*24/.84, X=x=>SHARED.BOD.XS(x), Z=y=>SHARED.BOD.ZS(y), SK=__LAZY__("data/skatepark.json");
  // off the map, west of everything and north of the pub's room; the park's door by the cross path, east of the bandstand
  const cx=X(-1500), cz=Z(400), DOOR=[X(175),0,Z(62)], w=72, d=88, at=(x,y,z)=>[cx+x*MH,y*MV,cz+z*MH];
  const SOLID=new Set(['skatepark-clubhouse','skate-shop','skate-hall-bay','container-snack-kiosk','skate-team-tour-van','overpass-pier','concrete-full-pipe','wallride-wall','skatepark-floodlight-column']);
  let G=null, S0=[];
  const build=()=>{ G=new THREE.Group(); G.name='skatepark-in'; scene.add(G);
    return ROOMS.part(G,()=>{ const D=SKATE.D, mat=new THREE.MeshLambertMaterial({vertexColors:true}), by={}, m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), v=new THREE.Vector3(), sc=new THREE.Vector3();
      const floor=new THREE.Mesh(new THREE.PlaneGeometry(w*MH,d*MH).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x86a84e})); floor.position.set(cx,-.02,cz); floor.receiveShadow=true; scene.add(floor);
      for(const r of D.layout)(by[r[0]]=by[r[0]]||[]).push(r);
      for(const k in by){ const g=KIT.decode(D.parts[k]), L=by[k], me=new THREE.InstancedMesh(g,mat,L.length);
        L.forEach(([,x,y,z,ry,rx,rz,s],i)=>{ e.set(rx*Math.PI/180,ry*Math.PI/180,rz*Math.PI/180,'XYZ'); q.setFromEuler(e); me.setMatrixAt(i,m4.compose(v.set(...at(x,y,z)),q,sc.set(s*MH,s*MV,s*MH)));
          if(SOLID.has(k)){ const b=g.boundingBox, hw=(b.max.x-b.min.x)*s*MH/2, hd=(b.max.z-b.min.z)*s*MH/2, c=Math.abs(Math.cos(ry*Math.PI/180)), n=Math.abs(Math.sin(ry*Math.PI/180)), ex=hw*c+hd*n, ez=hw*n+hd*c, [wx,,wz]=at(x,0,z), box=[wx-ex,wz-ez,wx+ex,wz+ez]; SOL.up.push(box); S0.push(box); } });
        me.castShadow=me.receiveShadow=true; me.computeBoundingSphere(); scene.add(me); }
      const sun=new THREE.HemisphereLight(0xffffff,0x5a6a4a,.5); sun.position.set(cx,40,cz); scene.add(sun); }); };
  const unbuild=()=>{ for(const b of S0){ const i=SOL.up.indexOf(b); if(i>=0)SOL.up.splice(i,1); } S0=[]; if(G){ G.removeFromParent(); G=null; } };
  ROOMS.off.skatepark={name:'THE SKATEPARK',box:{x0:cx-w/2*MH,z0:cz-d/2*MH,x1:cx+w/2*MH,z1:cz+d/2*MH,y0:-1,y1:20*MV},need:()=>SKATE.D?Promise.resolve():SK().then(D=>{ SKATE.D=D; }),build,unbuild,
    spawn:[at(4,0,37)[0],at(4,0,37)[2],0,Math.PI],out:[DOOR[0],DOOR[2]-1.2*T,0,Math.PI],door:DOOR,exit:at(4,0,41.5),exitName:'OUT TO THE PARK'};
  window.SKATEDBG=()=>({built:!!G,parts:SKATE.D?Object.keys(SKATE.D.parts).length:0,solids:S0.length}); }
