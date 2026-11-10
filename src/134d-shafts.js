// THE SUN SHAFTS: SHAFTS hangs beams of light along the sun through the air (fixed spots of the world, two crossed sheets each, never turning with you); every beam is lit by the sun's shadow maps, so what the sun does not reach (trees, buildings, people, the ground) blocks it with a soft fade, it shows fully only where the air around it is in shade (through gaps), and anything standing in front of it hides it. These are the sun's rays (SUN SHAFTS in ATMOSPHERE): a real sun up in the sky shining down into the park, seen from the side, never a star drawn at the player.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, pos, SKY, WX} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {MODS, OUT, SYS, TILE} from './006-map-pre.js';
const SHAFTS={on:0,occ:0,list:[]}; window.SHAFTS=SHAFTS;
{ const T=TILE, N=16, CELL=36*TILE, hsh=(i,j,k)=>{ const v=Math.sin(i*127.1+j*311.7+k*74.7)*43758.5453; return v-Math.floor(v); }, cv=document.createElement('canvas'); cv.width=64; cv.height=256; const g=cv.getContext('2d'), img=g.createImageData(64,256);
  for(let y=0;y<256;y++)for(let x=0;x<64;x++){ const u=(x+.5)/64*2-1, v=(y+.5)/256, a=Math.pow(Math.max(0,1-u*u),4)*Math.pow(Math.sin(Math.PI*v),1.2), i=(y*64+x)*4; img.data[i]=img.data[i+1]=img.data[i+2]=255; img.data[i+3]=Math.round(a*255); }
  g.putImageData(img,0,0); const tex=new THREE.CanvasTexture(cv); tex.minFilter=tex.magFilter=THREE.LinearFilter;
  // the sun's light at a point of the air from its shadow maps (near, whole map, moving things): 0 behind solids, fading out over the last 2.5 tiles before where the sunlight lands (no hard line at the ground, a wall or a crown) and past the maps; full only where the air around is in shade (a gap), faint in open sun
  const LIT=`uniform sampler2D uShN,uShF,uShD; uniform mat4 uMN,uMF,uMD; uniform vec4 uPN,uPF; uniform float uOcc,uHasF,uHasD;
    float dep(sampler2D m,vec2 uv){ return texture2D(m,uv).r; }
    float edge(vec3 q,float w){ vec2 e=min(q.xy,1.-q.xy); return q.z>1.?0.:clamp(min(e.x,e.y)/w,0.,1.); }
    float look(sampler2D m,vec3 q,vec4 P){ float c=0.; for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++)c+=clamp((dep(m,q.xy+vec2(float(i),float(j))*P.y)-q.z)/(2.5*P.x),0.,1.); c/=9.;
      if(c<.01)return 0.; float o=0.; for(int k=0;k<6;k++){ float a=float(k)*1.0472; o+=step(q.z-.3*P.x,dep(m,q.xy+vec2(cos(a),sin(a))*P.z)); } return c*mix(.15,1.,1.-o/6.); }
    float lit(vec3 p){ if(uOcc<.5)return 1.; vec4 a=uMN*vec4(p,1.); vec3 q=a.xyz/a.w; float kN=edge(q,.08), s=kN>0.?look(uShN,q,uPN):0.;
      if(kN<1.){ float f=0.; if(uHasF>.5){ vec4 b=uMF*vec4(p,1.); vec3 r=b.xyz/b.w; float kF=edge(r,.03); f=kF>0.?look(uShF,r,uPF)*kF:0.; } s=mix(f,s,kN); }
      if(uHasD>.5&&s>0.){ vec4 b=uMD*vec4(p,1.); vec3 r=b.xyz/b.w; if(edge(r,.001)>0.){ float d=0.; for(int i=0;i<2;i++)for(int j=0;j<2;j++)d+=step(r.z-.002,dep(uShD,r.xy+(vec2(float(i),float(j))-.5)*.002)); s*=d*.25; } }
      return s; }`;
  const SU={uShN:{value:null},uShF:{value:null},uShD:{value:null},uMN:{value:new THREE.Matrix4()},uMF:{value:new THREE.Matrix4()},uMD:{value:new THREE.Matrix4()},uPN:{value:new THREE.Vector4()},uPF:{value:new THREE.Vector4()},uOcc:{value:0},uHasF:{value:0},uHasD:{value:0}};
  const BU=Object.assign({uMap:{value:tex},uCol:{value:new THREE.Color(1,.91,.78)},uOp:{value:0}},SU);
  const mat=new THREE.ShaderMaterial({uniforms:BU,transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,   // depth tested: whatever stands in front of a beam hides it
    vertexShader:`varying vec2 vUv; varying vec3 vW; void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader:`#include <packing>
      uniform sampler2D uMap; uniform vec3 uCol; uniform float uOp; varying vec2 vUv; varying vec3 vW; ${LIT}
      void main(){ float a=texture2D(uMap,vUv).a*uOp; if(a>.002)a*=lit(vW); gl_FragColor=vec4(uCol,a); }`});
  const WARM=new THREE.Color(1,.92,.8);
  const G=new THREE.Group(); G.visible=false; scene.add(G); OUT.add(G,'open'); const geo=new THREE.PlaneGeometry(1,1);
  for(let i=0;i<N;i++){ const m=new THREE.Mesh(geo,mat), m2=new THREE.Mesh(geo,mat); for(const q of [m,m2]){ q.frustumCulled=false; q.matrixAutoUpdate=false; q.renderOrder=850; G.add(q); } m.cross=m2; SHAFTS.list.push(m); }
  const sd=new THREE.Vector3(), rt=new THREE.Vector3(), nm=new THREE.Vector3(), UP=new THREE.Vector3(0,1,0), M=new THREE.Matrix4(), c=new THREE.Vector3(), X=new THREE.Vector3(), Y=new THREE.Vector3(); let t=0; SHAFTS.at=[];
  const put=(S,m,P,id)=>{ const has=!!(S&&S.map); if(has){ SU[m].value=S.map.depthTexture||S.map.texture; SU['uM'+id].value=S.matrix; if(P){ const c=S.camera, w=c.right-c.left; SU[P].value.set(T/(c.far-c.near),.15*T/w,4*T/w,0); } } return has?1:0; };   // one shadow map into the beams' uniforms
  SYS.add('sky',dt=>{ t+=dt; const P=DN.P?DN.P():null, e=CLOCK.elev(), W=WX.now||{cloud:0}, up=SHARED.LVL!=='down'&&OUT.open&&!(MODS.apts&&MODS.apts.inReal), cam=SHARED.cam;   // not in your apartment: its light is the real sun through the glass
    const sunK=up&&P?Math.max(0,Math.min(1,(e-4)/8))*(1-Math.max(0,Math.min(1,(W.cloud-.4)/.5))):0, hr=SHARED.hazeRays||0, sk=hr?Math.max(sunK,up&&P?Math.max(0,Math.min(1,(e+1)/5))*(1-Math.max(0,Math.min(1,(W.cloud-.4)/.5))):0):sunK, k=P&&(P.shaft||hr)?Math.max(P.shaft||0,hr)*sk*(1-.4*(SKY.sunCover||0))*(1+.7*(1-Math.max(0,Math.min(1,(e-10)/30)))):0;   // a low sun's beams cross more air: strongest morning and evening
    { const sh=CLOCK.sun&&CLOCK.sun.shadow, occ=!!(sh&&sh.map&&renderer.shadowMap.enabled&&renderer.shadowMap.type===THREE.BasicShadowMap);   // only hard shadows keep plain depths the beams can read (PCF's are compare-only, VSM's moments): else the beams go unblocked
      SU.uOcc.value=occ?1:0; SHAFTS.occ=occ?1:0;
      if(occ){ put(sh,'uShN','uPN','N'); const f=CLOCK.sunF&&CLOCK.sunF.shadow, d=CLOCK.sunD&&CLOCK.sunD.shadow; SU.uHasF.value=put(f,'uShF','uPF','F'); SU.uHasD.value=put(d,'uShD',null,'D'); } }
    SHAFTS.on=k; G.visible=k>.01; BU.uOp.value=(cam.isOrthographicCamera?.055:.11)*k*(1+.8*hr); BU.uCol.value.copy(CLOCK.sun.color).lerp(WARM,.5+.3*(1-Math.max(0,Math.min(1,(e-6)/24))));
    if(!G.visible)return;
    sd.copy(CLOCK.sunV).normalize(); rt.crossVectors(sd,UP); if(rt.lengthSq()<1e-6)rt.set(1,0,0); rt.normalize(); nm.crossVectors(rt,sd);   // the two sheets' directions, fixed in the world (never turned to face you)
    const L=140*T, cx=Math.floor(pos.x/CELL), cz=Math.floor(pos.z/CELL); let n=0; SHAFTS.at.length=0;   // beams stand on a fixed lattice of the world: the same spots whoever walks by
    for(let i=cx-2;i<=cx+2&&n<N;i++)for(let j=cz-2;j<=cz+2&&n<N;j++){ if(hsh(i,j,1)<.45)continue; const bx=(i+hsh(i,j,2))*CELL, bz=(j+hsh(i,j,3))*CELL; if(Math.hypot(bx-pos.x,bz-pos.z)>2.4*CELL)continue;
      const m=SHAFTS.list[n++], w=9*T*(.6+.8*hsh(i,j,4)); SHAFTS.at.push([+(bx/T).toFixed(1),+(bz/T).toFixed(1)]); c.set(bx,SHARED.py+2*T,bz).addScaledVector(sd,L*.5);
      M.makeBasis(X.copy(rt).multiplyScalar(w),Y.copy(sd).multiplyScalar(L),nm).setPosition(c); m.visible=true; m.matrix.copy(M); m.matrixWorld.copy(M);
      M.makeBasis(X.copy(nm).multiplyScalar(w),Y.copy(sd).multiplyScalar(L),rt).setPosition(c); m.cross.visible=true; m.cross.matrix.copy(M); m.cross.matrixWorld.copy(M); }
    for(;n<N;n++){ SHAFTS.list[n].visible=false; SHAFTS.list[n].cross.visible=false; } },'134d-shafts');
  window.SHAFTDBG=()=>({on:+SHAFTS.on.toFixed(2),occ:SHAFTS.occ,look:DN.mode,open:OUT.open,beams:SHAFTS.at.slice()}); }
