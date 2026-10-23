// THE DUST: RAYS, dust motes adrift in the sunlight on a sunny day; off indoors, underground and at night. (The sun beams themselves are SHAFTS, 134d.)
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, ROOMS} from './003b-systems.js';
import {scene} from './004-main.js';
import {SYS} from './006-map-pre.js';
{ const RAYS={};
  const cl=v=>Math.max(0,Math.min(1,v));

  // DUST: square specks, world-anchored and slowly falling, tiled in a box that follows the camera.
  const N=500, cell=new Float32Array(N*3), ph=new Float32Array(N);
  for(let i=0;i<N;i++){ cell[i*3]=Math.random(); cell[i*3+1]=Math.random(); cell[i*3+2]=Math.random(); ph[i]=Math.random(); }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3)); geo.setAttribute('cell',new THREE.BufferAttribute(cell,3)); geo.setAttribute('ph',new THREE.BufferAttribute(ph,1));
  const DU={uCam:{value:new THREE.Vector3()},uBox:{value:new THREE.Vector3(30,14,30)},uT:{value:0},uSize:{value:2.4},uK:{value:0},uCol:{value:new THREE.Color(1,.93,.72)}};
  const dmat=new THREE.ShaderMaterial({uniforms:DU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`uniform vec3 uCam,uBox; uniform float uT,uSize,uK; attribute vec3 cell; attribute float ph; varying float vK;
      void main(){ vec3 p=cell*uBox; p.x+=sin(uT*.3+ph*6.28)*.4; p.z+=cos(uT*.24+ph*6.28)*.4; p.y-=uT*.6;
        vec3 origin=uCam-uBox*.5; vec3 wp=origin+mod(p-origin,uBox);
        vK=uK; gl_Position=projectionMatrix*modelViewMatrix*vec4(wp,1.); gl_PointSize=uSize; }`,
    fragmentShader:`uniform vec3 uCol; varying float vK; void main(){ vec2 q=gl_PointCoord-.5; if(max(abs(q.x),abs(q.y))>.5)discard; gl_FragColor=vec4(uCol,vK); }`});
  const pts=new THREE.Points(geo,dmat); pts.frustumCulled=false; pts.visible=false; pts.renderOrder=905; scene.add(pts); RAYS.pts=pts;

  const zero=new THREE.Vector3();
  SYS.add('sky',dt=>{ const cam=SHARED.cam, P=DN.P&&DN.P();
    const out=SHARED.LVL==='up'&&!ROOMS.cur&&CLOCK.sun&&CLOCK.sun.intensity>0&&CLOCK.dir&&CLOCK.dir.y>.03;
    DU.uT.value+=dt;
    const sunI=CLOCK.sun?CLOCK.sun.intensity:0;
    const dk=out&&P?cl(P.dust||0)*.6*cl(sunI):0;
    DU.uK.value=dk; DU.uCam.value.copy(cam?cam.position:zero); pts.visible=dk>.001;
  },'138a-sunrays');
  RAYS.dbg=()=>({dust:+DU.uK.value.toFixed(3),on:pts.visible});
  window.RAYS=RAYS; }
