// THE SUN SHAFTS: SHAFTS hangs beams of light along the sun through the air round you and streaks rays out from the sun on the screen when the look asks for them (SUN SHAFTS in ATMOSPHERE): a few additive planes, and the rays drawn by the look's last pass.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, LOOK, pos, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {OUT, SYS, TILE} from './006-map-pre.js';
const SHAFTS={on:0,list:[]}; window.SHAFTS=SHAFTS;
{ const T=TILE, N=12, CELL=36*TILE, hsh=(i,j,k)=>{ const v=Math.sin(i*127.1+j*311.7+k*74.7)*43758.5453; return v-Math.floor(v); }, cv=document.createElement('canvas'); cv.width=64; cv.height=256; const g=cv.getContext('2d'), img=g.createImageData(64,256);
  for(let y=0;y<256;y++)for(let x=0;x<64;x++){ const u=(x+.5)/64*2-1, v=(y+.5)/256, a=Math.pow(Math.max(0,1-u*u),4)*Math.pow(Math.sin(Math.PI*v),1.2), i=(y*64+x)*4; img.data[i]=img.data[i+1]=img.data[i+2]=255; img.data[i+3]=Math.round(a*255); }
  g.putImageData(img,0,0); const tex=new THREE.CanvasTexture(cv); tex.minFilter=tex.magFilter=THREE.LinearFilter;
  const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,toneMapped:false,color:0xffe9c8});   // no depth test: a beam never cuts a hard line where it meets the ground or a wall
  const RU=LOOK.rays={uSun:{value:new THREE.Vector2(.5,.5)},uRayK:{value:0},uRayCol:{value:new THREE.Color(1,.9,.75)},uAsp:{value:1}}, sv=new THREE.Vector3(), WARM=new THREE.Color(1,.92,.8);   // read by the look's last pass (138), which streaks the rays
  const G=new THREE.Group(); G.visible=false; scene.add(G); OUT.add(G,'open'); const geo=new THREE.PlaneGeometry(1,1);
  for(let i=0;i<N;i++){ const m=new THREE.Mesh(geo,mat); m.frustumCulled=false; m.matrixAutoUpdate=false; m.renderOrder=850; G.add(m); SHAFTS.list.push(m); }
  const sd=new THREE.Vector3(), rt=new THREE.Vector3(), nm=new THREE.Vector3(), toC=new THREE.Vector3(), M=new THREE.Matrix4(), c=new THREE.Vector3(), X=new THREE.Vector3(), Y=new THREE.Vector3(); let t=0;
  SYS.add('sky',dt=>{ t+=dt; const P=DN.P?DN.P():null, e=CLOCK.elev(), W=WX.now||{cloud:0}, up=SHARED.LVL!=='down'&&OUT.open;
    const k=up&&P&&P.shaft?P.shaft*Math.max(0,Math.min(1,(e-4)/8))*(1-Math.max(0,Math.min(1,(W.cloud-.4)/.5))):0;
    SHAFTS.on=k; G.visible=k>.01; const cam=SHARED.cam; mat.opacity=(cam.isOrthographicCamera?.07:.14)*k; mat.color.copy(CLOCK.sun.color).lerp(WARM,.5);
    { let kk=0; if(k>.01){ sv.copy(CLOCK.sunV).multiplyScalar(600).add(cam.position).project(cam); if(sv.z<1&&Math.abs(sv.x)<2.2&&Math.abs(sv.y)<2.2){ kk=k*.55*(1-Math.max(0,Math.min(1,(Math.max(Math.abs(sv.x),Math.abs(sv.y))-1.2)/1))); RU.uSun.value.set(sv.x*.5+.5,sv.y*.5+.5); } }
      RU.uRayK.value=kk; RU.uAsp.value=cam.aspect||1; RU.uRayCol.value.copy(mat.color); }
    if(!G.visible)return;
    sd.copy(CLOCK.sunV).normalize(); const L=140*T, cx=Math.floor(pos.x/CELL), cz=Math.floor(pos.z/CELL); let n=0;   // beams stand on a fixed lattice of the world: the same spots whoever walks by
    for(let i=cx-2;i<=cx+2&&n<N;i++)for(let j=cz-2;j<=cz+2&&n<N;j++){ if(hsh(i,j,1)<.45)continue; const bx=(i+hsh(i,j,2))*CELL, bz=(j+hsh(i,j,3))*CELL; if(Math.hypot(bx-pos.x,bz-pos.z)>2.4*CELL)continue;
      const m=SHAFTS.list[n++]; m.visible=true; c.set(bx,SHARED.py+2*T,bz).addScaledVector(sd,L*.5); toC.copy(cam.position).sub(c); rt.crossVectors(sd,toC); if(rt.lengthSq()<1e-6)rt.set(1,0,0); rt.normalize(); nm.crossVectors(rt,sd);
      M.makeBasis(X.copy(rt).multiplyScalar(9*T*(.6+.8*hsh(i,j,4))),Y.copy(sd).multiplyScalar(L),nm).setPosition(c); m.matrix.copy(M); m.matrixWorld.copy(M); }
    for(;n<N;n++)SHAFTS.list[n].visible=false; },'134d-shafts');
  window.SHAFTDBG=()=>({on:+SHAFTS.on.toFixed(2),rays:+RU.uRayK.value.toFixed(2),sun:RU.uSun.value.toArray().map(v=>+v.toFixed(2)),look:DN.mode}); }
