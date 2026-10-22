// THE SUN RAYS: RAYS, the sunny-day look — warm light shafts slanting from the sun and dust motes in the air; off indoors, underground and at night.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, pos, ROOMS, SKY, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
{ const RAYS={};
  const warm=new THREE.Color(1,.82,.55), cl=v=>Math.max(0,Math.min(1,v));

  // SHAFTS: a bundle of thin additive quads rising from the ground toward the sun, around the player.
  // Each faces the camera about the sun axis; the depth test lets rooftops cut them, so they read as beams between buildings.
  const M=9;
  const bg=new THREE.BufferGeometry(), bpos=new Float32Array(M*4*3), aLoc=new Float32Array(M*4*2), aOff=new Float32Array(M*4*2), aSeed=new Float32Array(M*4), idx=[];
  const corners=[[-1,-1],[1,-1],[1,1],[-1,1]];
  for(let m=0;m<M;m++){ const ox=Math.random()*2-1, oy=Math.random()*2-1, sd=Math.random();
    for(let v=0;v<4;v++){ const k=m*4+v; aLoc[k*2]=corners[v][0]; aLoc[k*2+1]=corners[v][1]; aOff[k*2]=ox; aOff[k*2+1]=oy; aSeed[k]=sd; }
    idx.push(m*4,m*4+1,m*4+2,m*4,m*4+2,m*4+3); }
  bg.setAttribute('position',new THREE.BufferAttribute(bpos,3)); bg.setAttribute('aLoc',new THREE.BufferAttribute(aLoc,2));
  bg.setAttribute('aOff',new THREE.BufferAttribute(aOff,2)); bg.setAttribute('aSeed',new THREE.BufferAttribute(aSeed,1)); bg.setIndex(idx);
  const BU={uAxis:{value:new THREE.Vector3(0,1,0)},uP1:{value:new THREE.Vector3(1,0,0)},uP2:{value:new THREE.Vector3(0,0,1)},uWid:{value:new THREE.Vector3(1,0,0)},
    uAnch:{value:new THREE.Vector3()},uLen:{value:22*TILE},uWdt:{value:.33*TILE},uSpread:{value:8*TILE},uK:{value:0},uCol:{value:new THREE.Color(1,.9,.7)}};
  const bmat=new THREE.ShaderMaterial({uniforms:BU,transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,
    vertexShader:`uniform vec3 uAxis,uP1,uP2,uWid,uAnch; uniform float uLen,uWdt,uSpread,uK; attribute vec2 aLoc,aOff; attribute float aSeed; varying float vL,vS,vSeed,vK;
      void main(){ vec3 base=uAnch+uP1*(aOff.x*uSpread)+uP2*(aOff.y*uSpread); float t=aLoc.x*.5+.5;
        vec3 wp=base+uAxis*(t*uLen)+uWid*(aLoc.y*uWdt); vL=t; vS=aLoc.y; vSeed=aSeed; vK=uK;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(wp,1.); }`,
    fragmentShader:`uniform vec3 uCol; varying float vL,vS,vSeed,vK; void main(){
        float core=step(abs(vS),.6); float ends=step(.05,vL)*step(vL,.94); float fade=floor((1.-vL)*3.+.5)/3.;
        float g=step(.42,fract(vSeed*7.13)); float a=core*ends*g*(.35+.65*fade); a=floor(a*3.+.5)/3.;
        if(a<=0.)discard; gl_FragColor=vec4(uCol,a*vK*.6); }`});
  const beams=new THREE.Mesh(bg,bmat); beams.frustumCulled=false; beams.visible=false; beams.renderOrder=904; scene.add(beams); RAYS.beams=beams;

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

  const axis=new THREE.Vector3(), p1=new THREE.Vector3(), p2=new THREE.Vector3(), vd=new THREE.Vector3(), UPV=new THREE.Vector3(0,1,0);
  SYS.add('sky',dt=>{ const cam=SHARED.cam, P=DN.P&&DN.P();
    const out=SHARED.LVL==='up'&&!ROOMS.cur&&CLOCK.sun&&CLOCK.sun.intensity>0&&CLOCK.dir&&CLOCK.dir.y>.03;
    DU.uT.value+=dt;
    const sunI=CLOCK.sun?CLOCK.sun.intensity:0, cloud=(WX.now&&WX.now.cloud)||0;
    let bk=0;
    if(out&&P&&cam){ axis.copy(CLOCK.sunV).normalize(); p1.crossVectors(axis,UPV); if(p1.lengthSq()<1e-4)p1.set(1,0,0); p1.normalize(); p2.crossVectors(axis,p1).normalize();
      cam.getWorldDirection(vd); BU.uWid.value.crossVectors(axis,vd); if(BU.uWid.value.lengthSq()<1e-4)BU.uWid.value.copy(p1); BU.uWid.value.normalize();
      BU.uAxis.value.copy(axis); BU.uP1.value.copy(p1); BU.uP2.value.copy(p2); BU.uAnch.value.set(pos.x,SHARED.py,pos.z);
      const sc=(SKY.U&&SKY.U.uSunCol&&SKY.U.uSunCol.value)||warm; BU.uCol.value.copy(sc).lerp(warm,.45);
      bk=cl(P.ray||0)*.9*(1-.85*cl(cloud)); }
    BU.uK.value=bk; beams.visible=bk>.001;
    const dk=out&&P?cl(P.dust||0)*.6*cl(sunI):0;
    DU.uK.value=dk; DU.uCam.value.copy(cam?cam.position:axis); pts.visible=dk>.001;
  },'138a-sunrays');
  RAYS.dbg=()=>({beam:+BU.uK.value.toFixed(3),dust:+DU.uK.value.toFixed(3),on:beams.visible});
  window.RAYS=RAYS; }
