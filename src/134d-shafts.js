// THE SUN SHAFTS: SHAFTS hangs soft beams of light along the sun through the air round you when the look asks for them (SUN SHAFTS in ATMOSPHERE): a few additive planes, nothing else.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, pos, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {OUT, SYS, TILE} from './006-map-pre.js';
const SHAFTS={on:0,list:[]}; window.SHAFTS=SHAFTS;
{ const T=TILE, N=7, cv=document.createElement('canvas'); cv.width=64; cv.height=256; const g=cv.getContext('2d'), img=g.createImageData(64,256);
  for(let y=0;y<256;y++)for(let x=0;x<64;x++){ const u=(x+.5)/64*2-1, v=(y+.5)/256, a=Math.pow(Math.max(0,1-u*u),3)*Math.pow(Math.sin(Math.PI*v),.8), i=(y*64+x)*4; img.data[i]=img.data[i+1]=img.data[i+2]=255; img.data[i+3]=Math.round(a*255); }
  g.putImageData(img,0,0); const tex=new THREE.CanvasTexture(cv); tex.minFilter=tex.magFilter=THREE.LinearFilter;
  const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,toneMapped:false,color:0xffe9c8});
  const G=new THREE.Group(); G.visible=false; scene.add(G); OUT.add(G,'open'); const geo=new THREE.PlaneGeometry(1,1);
  for(let i=0;i<N;i++){ const m=new THREE.Mesh(geo,mat); m.frustumCulled=false; m.matrixAutoUpdate=false; m.renderOrder=850; m.userData.s=[Math.random(),Math.random(),.6+Math.random()*.8]; G.add(m); SHAFTS.list.push(m); }
  const sd=new THREE.Vector3(), rt=new THREE.Vector3(), nm=new THREE.Vector3(), toC=new THREE.Vector3(), M=new THREE.Matrix4(), c=new THREE.Vector3(), X=new THREE.Vector3(), Y=new THREE.Vector3(); let t=0;
  SYS.add('sky',dt=>{ t+=dt; const P=DN.P?DN.P():null, e=CLOCK.elev(), W=WX.now||{cloud:0}, up=SHARED.LVL!=='down'&&OUT.open;
    const k=up&&P&&P.shaft?P.shaft*Math.max(0,Math.min(1,(e-4)/8))*(1-Math.max(0,Math.min(1,(W.cloud-.4)/.5))):0;
    SHAFTS.on=k; G.visible=k>.01; mat.opacity=.14*k; if(!G.visible)return;
    sd.copy(CLOCK.sunV).normalize(); const cam=SHARED.cam, L=80*T, ax=Math.round(pos.x/(24*T))*24*T, az=Math.round(pos.z/(24*T))*24*T;
    SHAFTS.list.forEach((m,i)=>{ const s=m.userData.s, bx=ax+(s[0]-.5)*90*T+Math.sin(t*.03+i)*4*T, bz=az+(s[1]-.5)*90*T+Math.cos(t*.025+i*1.7)*4*T;
      c.set(bx,SHARED.py-6*T,bz).addScaledVector(sd,L*.5); toC.copy(cam.position).sub(c); rt.crossVectors(sd,toC); if(rt.lengthSq()<1e-6)rt.set(1,0,0); rt.normalize(); nm.crossVectors(rt,sd);
      M.makeBasis(X.copy(rt).multiplyScalar(6*T*s[2]),Y.copy(sd).multiplyScalar(L),nm).setPosition(c); m.matrix.copy(M); m.matrixWorld.copy(M); }); },'134d-shafts');
  window.SHAFTDBG=()=>({on:+SHAFTS.on.toFixed(2),look:DN.mode}); }
