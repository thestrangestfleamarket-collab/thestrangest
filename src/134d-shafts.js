// THE SUN SHAFTS: SHAFTS hangs beams of light along the sun through the air (fixed spots of the world, two crossed sheets each, never turning with you); every beam is lit by the sun's shadow map, so what the sun does not reach (trees, buildings, the ground) blocks it with a soft fade. It also streaks rays out from the sun on the screen when the look asks for them (SUN SHAFTS in ATMOSPHERE); the rays are drawn by the look's last pass. (The sunlit dust is off: no dust in the air, owner 23 Oct 2026.)
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, LOOK, pos, WX} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {OUT, SYS, TILE} from './006-map-pre.js';
const SHAFTS={on:0,dust:0,occ:0,list:[]}; window.SHAFTS=SHAFTS;
{ const T=TILE, N=12, CELL=36*TILE, hsh=(i,j,k)=>{ const v=Math.sin(i*127.1+j*311.7+k*74.7)*43758.5453; return v-Math.floor(v); }, cv=document.createElement('canvas'); cv.width=64; cv.height=256; const g=cv.getContext('2d'), img=g.createImageData(64,256);
  for(let y=0;y<256;y++)for(let x=0;x<64;x++){ const u=(x+.5)/64*2-1, v=(y+.5)/256, a=Math.pow(Math.max(0,1-u*u),4)*Math.pow(Math.sin(Math.PI*v),1.2), i=(y*64+x)*4; img.data[i]=img.data[i+1]=img.data[i+2]=255; img.data[i+3]=Math.round(a*255); }
  g.putImageData(img,0,0); const tex=new THREE.CanvasTexture(cv); tex.minFilter=tex.magFilter=THREE.LinearFilter;
  // the sun's shadow test, shared by the beams and the dust: 1 where the sun reaches a point of the world, 0 where something solid is in the way (a 3x3 spread so the edge is a fade, never a cut)
  const LIT=`uniform sampler2D uShadow; uniform mat4 uShMat; uniform float uOcc,uTx;
    float lit(vec3 p){ if(uOcc<.5)return 1.; vec4 s=uShMat*vec4(p,1.); vec3 q=s.xyz/s.w; if(q.x<0.||q.x>1.||q.y<0.||q.y>1.||q.z>1.)return 1.;
      float sum=0.; for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++){ float d=unpackRGBAToDepth(texture2D(uShadow,q.xy+vec2(float(i),float(j))*uTx*5.)); sum+=step(q.z-.0015,d); } return sum/9.; }`;
  const SU={uShadow:{value:null},uShMat:{value:new THREE.Matrix4()},uOcc:{value:0},uTx:{value:1/3072}};
  const BU=Object.assign({uMap:{value:tex},uCol:{value:new THREE.Color(1,.91,.78)},uOp:{value:0}},SU);
  const mat=new THREE.ShaderMaterial({uniforms:BU,transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,   // no depth test: a beam never cuts a hard line where it meets the ground or a wall; the shadow test ends it there softly instead
    vertexShader:`varying vec2 vUv; varying vec3 vW; void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader:`#include <packing>
      uniform sampler2D uMap; uniform vec3 uCol; uniform float uOp; varying vec2 vUv; varying vec3 vW; ${LIT}
      void main(){ float a=texture2D(uMap,vUv).a*uOp*lit(vW); if(a<.002)discard; gl_FragColor=vec4(uCol,a); }`});
  const RU=LOOK.rays={uSun:{value:new THREE.Vector2(.5,.5)},uRayK:{value:0},uRayCol:{value:new THREE.Color(1,.9,.75)},uAsp:{value:1}}, sv=new THREE.Vector3(), WARM=new THREE.Color(1,.92,.8);   // read by the look's last pass (138), which streaks the rays
  const G=new THREE.Group(); G.visible=false; scene.add(G); OUT.add(G,'open'); const geo=new THREE.PlaneGeometry(1,1);
  for(let i=0;i<N;i++){ const m=new THREE.Mesh(geo,mat), m2=new THREE.Mesh(geo,mat); for(const q of [m,m2]){ q.frustumCulled=false; q.matrixAutoUpdate=false; q.renderOrder=850; G.add(q); } m.cross=m2; SHAFTS.list.push(m); }
  // the dust: square motes on a lattice of the world, drifting and slowly falling, tiled in a box that follows the camera; each one lit by the same sun test, so the dust shows only where the sun reaches
  const ND=600, cell=new Float32Array(ND*3), ph=new Float32Array(ND); for(let i=0;i<ND;i++){ cell[i*3]=Math.random(); cell[i*3+1]=Math.random(); cell[i*3+2]=Math.random(); ph[i]=Math.random(); }
  const dg=new THREE.BufferGeometry(); dg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(ND*3),3)); dg.setAttribute('cell',new THREE.BufferAttribute(cell,3)); dg.setAttribute('ph',new THREE.BufferAttribute(ph,1));
  const DU=Object.assign({uCam:{value:new THREE.Vector3()},uBox:{value:new THREE.Vector3(26*T,12*T,26*T)},uT:{value:0},uSize:{value:2.4},uK:{value:0},uCol:{value:new THREE.Color(1,.93,.72)}},SU);
  const dmat=new THREE.ShaderMaterial({uniforms:DU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`#include <packing>
      uniform vec3 uCam,uBox; uniform float uT,uSize,uK; attribute vec3 cell; attribute float ph; varying float vK; ${LIT}
      void main(){ vec3 p=cell*uBox; p.x+=sin(uT*.3+ph*6.28)*.4; p.z+=cos(uT*.24+ph*6.28)*.4; p.y-=uT*.5; vec3 o=uCam-uBox*.5; vec3 wp=o+mod(p-o,uBox);
        vK=uK*lit(wp); gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.); gl_PointSize=uSize; }`,
    fragmentShader:`uniform vec3 uCol; varying float vK; void main(){ vec2 q=gl_PointCoord-.5; if(vK<.03||max(abs(q.x),abs(q.y))>.5)discard; gl_FragColor=vec4(uCol,vK); }`});
  const pts=new THREE.Points(dg,dmat); pts.frustumCulled=false; pts.visible=false; pts.renderOrder=851; scene.add(pts); OUT.add(pts,'open'); SHAFTS.pts=pts;
  const sd=new THREE.Vector3(), rt=new THREE.Vector3(), nm=new THREE.Vector3(), UP=new THREE.Vector3(0,1,0), M=new THREE.Matrix4(), c=new THREE.Vector3(), X=new THREE.Vector3(), Y=new THREE.Vector3(); let t=0; SHAFTS.at=[];
  SYS.add('sky',dt=>{ t+=dt; DU.uT.value+=dt; const P=DN.P?DN.P():null, e=CLOCK.elev(), W=WX.now||{cloud:0}, up=SHARED.LVL!=='down'&&OUT.open, cam=SHARED.cam;
    const sunK=up&&P?Math.max(0,Math.min(1,(e-4)/8))*(1-Math.max(0,Math.min(1,(W.cloud-.4)/.5))):0, k=P&&P.shaft?P.shaft*sunK:0, dk=0;
    { const sun=CLOCK.sun, sh=sun&&sun.shadow, occ=!!(sh&&sh.map&&renderer.shadowMap.enabled&&renderer.shadowMap.type!==THREE.VSMShadowMap);   // VSM keeps moments, not depths: then the beams go unblocked
      SU.uOcc.value=occ?1:0; SHAFTS.occ=occ?1:0; if(occ){ SU.uShadow.value=sh.map.texture; SU.uShMat.value=sh.matrix; SU.uTx.value=1/sh.mapSize.x; } }
    SHAFTS.on=k; SHAFTS.dust=dk; G.visible=k>.01; BU.uOp.value=(cam.isOrthographicCamera?.045:.09)*k; BU.uCol.value.copy(CLOCK.sun.color).lerp(WARM,.5);
    DU.uK.value=dk*.6; DU.uCam.value.copy(cam.position); pts.visible=dk>.01;
    { let kk=0; if(k>.01){ sv.copy(CLOCK.sunV).multiplyScalar(600).add(cam.position).project(cam); if(sv.z<1&&Math.abs(sv.x)<2.2&&Math.abs(sv.y)<2.2){ kk=k*.55*(1-Math.max(0,Math.min(1,(Math.max(Math.abs(sv.x),Math.abs(sv.y))-1.2)/1))); RU.uSun.value.set(sv.x*.5+.5,sv.y*.5+.5); } }
      RU.uRayK.value=kk; RU.uAsp.value=cam.aspect||1; RU.uRayCol.value.copy(BU.uCol.value); }
    if(!G.visible)return;
    sd.copy(CLOCK.sunV).normalize(); rt.crossVectors(sd,UP); if(rt.lengthSq()<1e-6)rt.set(1,0,0); rt.normalize(); nm.crossVectors(rt,sd);   // the two sheets' directions, fixed in the world (never turned to face you)
    const L=140*T, cx=Math.floor(pos.x/CELL), cz=Math.floor(pos.z/CELL); let n=0; SHAFTS.at.length=0;   // beams stand on a fixed lattice of the world: the same spots whoever walks by
    for(let i=cx-2;i<=cx+2&&n<N;i++)for(let j=cz-2;j<=cz+2&&n<N;j++){ if(hsh(i,j,1)<.45)continue; const bx=(i+hsh(i,j,2))*CELL, bz=(j+hsh(i,j,3))*CELL; if(Math.hypot(bx-pos.x,bz-pos.z)>2.4*CELL)continue;
      const m=SHAFTS.list[n++], w=9*T*(.6+.8*hsh(i,j,4)); SHAFTS.at.push([+(bx/T).toFixed(1),+(bz/T).toFixed(1)]); c.set(bx,SHARED.py+2*T,bz).addScaledVector(sd,L*.5);
      M.makeBasis(X.copy(rt).multiplyScalar(w),Y.copy(sd).multiplyScalar(L),nm).setPosition(c); m.visible=true; m.matrix.copy(M); m.matrixWorld.copy(M);
      M.makeBasis(X.copy(nm).multiplyScalar(w),Y.copy(sd).multiplyScalar(L),rt).setPosition(c); m.cross.visible=true; m.cross.matrix.copy(M); m.cross.matrixWorld.copy(M); }
    for(;n<N;n++){ SHAFTS.list[n].visible=false; SHAFTS.list[n].cross.visible=false; } },'134d-shafts');
  window.SHAFTDBG=()=>({on:+SHAFTS.on.toFixed(2),dust:+SHAFTS.dust.toFixed(2),occ:SHAFTS.occ,rays:+RU.uRayK.value.toFixed(2),sun:RU.uSun.value.toArray().map(v=>+v.toFixed(2)),look:DN.mode,open:OUT.open,beams:SHAFTS.at.slice()}); }
