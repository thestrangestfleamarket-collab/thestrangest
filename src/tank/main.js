// HULL DOWN: the whole game (the land, your tank and its turret, the gunsight, the enemy's armour, shells, sound); three 0.147 is put in ahead of it by tools/edge.cjs
(() => {
'use strict';
const T = THREE;
const $ = id => document.getElementById(id);

// ---------- helpers ----------
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const wrap=a=>{a=(a+Math.PI)%(Math.PI*2);if(a<0)a+=Math.PI*2;return a-Math.PI;};
const toward=(a,b,m)=>a+clamp(b-a,-m,m);
function cnv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
let maxAniso=4;
function tex(c,rep,srgb=true){const t=new T.CanvasTexture(c);if(rep){t.wrapS=t.wrapT=T.RepeatWrapping;}t.anisotropy=maxAniso;if(srgb)t.encoding=T.sRGBEncoding;return t;}
function worldBox(x0,x1,y0,y1,z0,z1,cu=1.2,cv=1.2){
  const g=new T.BoxGeometry(x1-x0,y1-y0,z1-z0);g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
  const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    if(Math.abs(n.getX(i))>.5)uv.setXY(i,z/cu,y/cv);else if(Math.abs(n.getY(i))>.5)uv.setXY(i,x/cu,z/cu);else uv.setXY(i,x/cu,y/cv);}
  return g;
}
const mergeGeo=gs=>T.BufferGeometryUtils.mergeBufferGeometries(gs,false);
const UP=new T.Vector3(0,1,0);

// ---------- renderer ----------
const canvas=$('c');
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
const PR=Math.min(window.devicePixelRatio||1,1.75);
renderer.setPixelRatio(PR);
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=T.sRGBEncoding;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=.62;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.xr.enabled=true;
renderer.xr.setReferenceSpaceType('local-floor');
if(renderer.xr.setFoveation)renderer.xr.setFoveation(1);
maxAniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());

// ---------- sky + sun ----------
const SUN=new T.Vector3().setFromSphericalCoords(1,T.MathUtils.degToRad(90-11),T.MathUtils.degToRad(205));
function makeSky(){const s=new T.Sky();const u=s.material.uniforms;u.turbidity.value=8;u.rayleigh.value=2.2;u.mieCoefficient.value=.006;u.mieDirectionalG.value=.86;u.sunPosition.value.copy(SUN);s.frustumCulled=false;return s;}
const skyScene=new T.Scene();const skyProbe=makeSky();skyProbe.scale.setScalar(10);skyScene.add(skyProbe);

const FOG=new T.Color(.2,.2,.22),SUNHAZE=new T.Color(.6,.45,.3);
(function probe(){
  try{
    const rt=new T.WebGLRenderTarget(4,4,{type:T.FloatType});const cam=new T.PerspectiveCamera(3,1,.1,100);
    const tm=renderer.toneMapping;renderer.toneMapping=T.NoToneMapping;
    const read=(az)=>{const d=new T.Vector3().setFromSphericalCoords(1,T.MathUtils.degToRad(89),az);cam.position.set(0,0,0);cam.lookAt(d);
      renderer.setRenderTarget(rt);renderer.render(skyScene,cam);const b=new Float32Array(16*4);renderer.readRenderTargetPixels(rt,0,0,4,4,b);
      let r=0,g=0,bl=0;for(let i=0;i<16;i++){r+=b[i*4];g+=b[i*4+1];bl+=b[i*4+2];}return new T.Color(r/16,g/16,bl/16);};
    const sAz=Math.atan2(SUN.x,SUN.z);
    const away=read(sAz+Math.PI),side1=read(sAz+Math.PI/2),side2=read(sAz-Math.PI/2),toward=read(sAz+.35);
    renderer.setRenderTarget(null);renderer.toneMapping=tm;rt.dispose();
    const c=new T.Color().copy(away).add(side1).add(side2).multiplyScalar(1/3);
    if(isFinite(c.r)&&c.r+c.g+c.b>1e-4){FOG.copy(c);SUNHAZE.copy(toward);const m=Math.max(SUNHAZE.r,SUNHAZE.g,SUNHAZE.b),lim=Math.max(c.r,c.g,c.b)*4;if(m>lim)SUNHAZE.multiplyScalar(lim/m);}
  }catch(e){renderer.setRenderTarget(null);}
})();

(function installHaze(){
  const v3=c=>{const a=c.isVector3?[c.x,c.y,c.z]:[c.r,c.g,c.b];return`vec3(${a.map(v=>v.toFixed(5)).join(',')})`;};
  const SC=T.ShaderChunk;
  SC.fog_pars_vertex='#ifdef USE_FOG\nvarying float vFogDepth;\nvarying vec3 vFogWorld;\n#endif';
  SC.fog_vertex='#ifdef USE_FOG\nvFogDepth=-mvPosition.z;\nvec4 fogP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nfogP=instanceMatrix*fogP;\n#endif\nvFogWorld=(modelMatrix*fogP).xyz;\n#endif';
  SC.fog_pars_fragment='#ifdef USE_FOG\nuniform vec3 fogColor;\nvarying float vFogDepth;\nvarying vec3 vFogWorld;\n#ifdef FOG_EXP2\nuniform float fogDensity;\n#else\nuniform float fogNear;\nuniform float fogFar;\n#endif\n#endif';
  SC.fog_fragment='';
  SC.tonemapping_fragment=`#if defined(USE_FOG) && defined(FOG_EXP2)
  {
    vec3 fRay=vFogWorld-cameraPosition;float fDist=length(fRay);vec3 fDir=fRay/max(fDist,1e-3);
    float camH=max(cameraPosition.y-fogDensity,0.0);
    const float FA=0.00105;const float FB=0.0042;
    float dy=fDir.y*FB*fDist;float e0=FA*exp(-FB*camH);
    float amt=abs(dy)>1e-4?e0*fDist*(1.0-exp(-dy))/dy:e0*fDist;
    float ff=1.0-exp(-max(amt,0.0));
    float sa=pow(max(dot(fDir,${v3(SUN)}),0.0),5.0);
    vec3 fc=mix(fogColor,${v3(SUNHAZE)},sa);
    gl_FragColor.rgb=mix(gl_FragColor.rgb,fc,ff);
  }
  #endif
  #if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
  #endif`;
})();

const scene=new T.Scene();
scene.fog=new T.FogExp2(FOG,-30);
const sky=makeSky();sky.scale.setScalar(4000);sky.renderOrder=-10;scene.add(sky);
const pmrem=new T.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(skyScene,0,.1,100).texture;

const camera=new T.PerspectiveCamera(72,innerWidth/innerHeight,.08,9000);
camera.rotation.order='YXZ';
const rig=new T.Group();rig.add(camera);

const sunL=new T.DirectionalLight(0xffc592,3.4);
sunL.castShadow=true;sunL.shadow.mapSize.set(2048,2048);
const shc=sunL.shadow.camera;shc.left=-42;shc.right=42;shc.top=42;shc.bottom=-42;shc.near=1;shc.far=300;
sunL.shadow.bias=-.0004;sunL.shadow.normalBias=.05;
scene.add(sunL,sunL.target);
scene.add(new T.HemisphereLight(0x8ea0c8,0x4a4030,.32));

function glowCanvas(soft){const c=cnv(128,128),g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(soft?.08:.22,'rgba(255,255,255,'+(soft?.5:.75)+')');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return c;}
function smokeCanvas(){const c=cnv(128,128),g=c.getContext('2d'),r=rng(4);for(let i=0;i<26;i++){const x=40+r()*48,y=40+r()*48,rad=14+r()*26,gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,'rgba(255,255,255,.22)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);}return c;}
const glowT=tex(glowCanvas(false),false,false),softT=tex(glowCanvas(true),false,false),smokeT=tex(smokeCanvas(),false,false);
const sunGlow=new T.Sprite(new T.SpriteMaterial({map:softT,color:0xffd2a0,transparent:true,opacity:.32,blending:T.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false}));
sunGlow.scale.setScalar(1200);scene.add(sunGlow);

// ---------- textures ----------
function noiseCanvas(w,h,base,amp,streak,seed=3){
  const c=cnv(w,h),g=c.getContext('2d'),d=g.createImageData(w,h),r=rng(seed);
  const cols=[];for(let x=0;x<w;x++)cols.push(r());
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=streak?(cols[x]*.7+r()*.3):r();const v=(n-.5)*amp;
    d.data[i]=clamp(base[0]+v,0,255);d.data[i+1]=clamp(base[1]+v,0,255);d.data[i+2]=clamp(base[2]+v,0,255);d.data[i+3]=255;}
  g.putImageData(d,0,0);return c;
}
function groundCanvas(){
  const c=noiseCanvas(512,512,[86,92,54],40,false,6),g=c.getContext('2d'),r=rng(61);
  for(let i=0;i<900;i++){g.fillStyle=`rgba(${r()<.5?'60,74,38':'150,134,92'},${r()*.2})`;const x=r()*512,y=r()*512,w=4+r()*26;g.beginPath();g.ellipse(x,y,w,w*(.4+r()*.6),r()*3,0,7);g.fill();}
  for(let i=0;i<2600;i++){g.fillStyle=`rgba(${r()<.6?'46,60,30':'176,164,120'},${.15+r()*.35})`;g.fillRect(r()*512,r()*512,1,2+r()*4);}
  return c;
}
function armourCanvas(base,seed){
  const c=noiseCanvas(256,256,base,26,false,seed),g=c.getContext('2d'),r=rng(seed+9);
  for(let i=0;i<70;i++){g.fillStyle=`rgba(${r()<.5?'20,20,16':'150,140,110'},${r()*.16})`;g.fillRect(r()*256,r()*256,6+r()*50,2+r()*12);}
  for(let i=0;i<40;i++){g.strokeStyle=`rgba(40,30,20,${.1+r()*.25})`;g.lineWidth=1;const x=r()*256,y=r()*256;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*8,y+10+r()*50);g.stroke();}
  for(let y=16;y<256;y+=64)for(let x=16;x<256;x+=32){g.fillStyle='rgba(20,20,16,.5)';g.beginPath();g.arc(x,y,2,0,7);g.fill();g.fillStyle='rgba(220,220,200,.25)';g.beginPath();g.arc(x-.6,y-.6,1,0,7);g.fill();}
  return c;
}

// ---------- the land ----------
const GN=240,GS=10,G0=-1200,HG=new Float32Array((GN+1)*(GN+1));
function h0(x,z){const r=Math.hypot(x,z);return 12*Math.sin(x*.0061+1.3)*Math.cos(z*.0053-.4)+6*Math.sin(x*.017+z*.011)+2.6*Math.sin(x*.041-1)*Math.sin(z*.037+2)+.6*Math.sin(x*.11+z*.09)+Math.min(34,Math.max(0,r-760)*.09);}
for(let j=0;j<=GN;j++)for(let i=0;i<=GN;i++)HG[j*(GN+1)+i]=h0(G0+i*GS,G0+j*GS);
function hAt(x,z){const fx=clamp((x-G0)/GS,0,GN-.001),fz=clamp((z-G0)/GS,0,GN-.001),i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=j*(GN+1)+i;
  return lerp(lerp(HG[k],HG[k+1],u),lerp(HG[k+GN+1],HG[k+GN+2],u),v);}
function los(ax,ay,az,bx,by,bz){const n=Math.max(8,Math.ceil(Math.hypot(bx-ax,bz-az)/7));for(let i=1;i<n;i++){const t=i/n;if(hAt(ax+(bx-ax)*t,az+(bz-az)*t)>ay+(by-ay)*t)return t;}return -1;}
const land=new T.Group();scene.add(land);
(function buildLand(){
  const g=new T.PlaneGeometry(GN*GS,GN*GS,GN,GN);g.rotateX(-Math.PI/2);
  const p=g.attributes.position,col=new Float32Array(p.count*3);
  for(let k=0;k<p.count;k++){const x=p.getX(k),z=p.getZ(k),h=HG[k];p.setY(k,h);
    const n=.5+.5*Math.sin(x*.013+Math.sin(z*.009)*2)*Math.cos(z*.011+1),lo=clamp((h+14)/30,0,1);
    col[k*3]=lerp(.55,1.12,n)*lerp(.8,1.05,lo);col[k*3+1]=lerp(.78,1.02,n)*lerp(.86,1.05,lo);col[k*3+2]=lerp(.6,.9,n)*lerp(.85,1,lo);}
  g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();
  const gt=tex(groundCanvas(),true);gt.repeat.set(GN*GS/9,GN*GS/9);
  const m=new T.Mesh(g,new T.MeshStandardMaterial({map:gt,vertexColors:true,roughness:1,envMapIntensity:.35}));m.receiveShadow=true;land.add(m);
  const r=rng(1944),dm=new T.Object3D();
  const trees=[];for(let c=0;c<46;c++){const cx=(r()-.5)*1700,cz=(r()-.5)*1700,n=6+Math.floor(r()*22),rad=20+r()*60;
    for(let i=0;i<n;i++){const a=r()*6.28,d=Math.sqrt(r())*rad,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d;if(Math.hypot(x,z)<45)continue;trees.push([x,z,.7+r()*.8]);}}
  const crown=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),new T.MeshStandardMaterial({color:0x34421f,roughness:1,flatShading:true,envMapIntensity:.3}),trees.length);
  const trunk=new T.InstancedMesh(new T.CylinderGeometry(.18,.28,3,6),new T.MeshStandardMaterial({color:0x3a2c1e,roughness:1,envMapIntensity:.2}),trees.length);
  trees.forEach((t,i)=>{const y=hAt(t[0],t[1]),s=t[2];dm.rotation.set(0,r()*6,0);
    dm.position.set(t[0],y+1.4*s,t[1]);dm.scale.set(s,s,s);dm.updateMatrix();trunk.setMatrixAt(i,dm.matrix);
    dm.position.set(t[0],y+5*s,t[1]);dm.scale.set(2.4*s,3.4*s,2.4*s);dm.updateMatrix();crown.setMatrixAt(i,dm.matrix);});
  crown.castShadow=trunk.castShadow=true;land.add(crown,trunk);
  const rocks=new T.InstancedMesh(new T.DodecahedronGeometry(1,0),new T.MeshStandardMaterial({color:0x7a756a,roughness:.95,flatShading:true,envMapIntensity:.4}),220);
  for(let i=0;i<220;i++){const x=(r()-.5)*1800,z=(r()-.5)*1800,s=.3+r()*r()*2.2;dm.position.set(x,hAt(x,z)+s*.2,z);dm.rotation.set(r()*6,r()*6,r()*6);dm.scale.set(s,s*.6,s*1.2);dm.updateMatrix();rocks.setMatrixAt(i,dm.matrix);}
  rocks.castShadow=rocks.receiveShadow=true;land.add(rocks);
  const wallC=noiseCanvas(256,256,[150,140,124],60,false,12),wallM=new T.MeshStandardMaterial({map:tex(wallC,true),bumpMap:tex(wallC,true,false),bumpScale:.01,roughness:1,envMapIntensity:.3});
  for(const[fx,fz,ry]of[[-140,-210,.4],[230,-330,1.2],[-320,140,2.2],[120,260,.2]]){const f=new T.Group(),parts=[];
    parts.push(worldBox(-5,5,0,3.4,-4,-3.6,2,2),worldBox(-5,-4.6,0,2.6,-3.6,4,2,2),worldBox(4.6,5,0,4.2,-3.6,1,2,2),worldBox(-5,1.5,0,1.2,3.6,4,2,2),worldBox(7,9,0,.9,-2,4,2,2));
    const m2=new T.Mesh(mergeGeo(parts),wallM);m2.castShadow=m2.receiveShadow=true;f.add(m2);f.position.set(fx,hAt(fx,fz)-.3,fz);f.rotation.y=ry;land.add(f);}
})();

// ---------- your tank ----------
const armourMat=new T.MeshStandardMaterial({map:tex(armourCanvas([86,94,62],3),true),roughness:.62,metalness:.35,envMapIntensity:.55});
const linerMat=new T.MeshStandardMaterial({map:tex(noiseCanvas(128,128,[70,76,66],18,false,8),true),roughness:.8,metalness:0,envMapIntensity:0});
const trackMat=new T.MeshStandardMaterial({map:tex(noiseCanvas(64,256,[40,38,36],30,true,5),true),roughness:.9,metalness:.3,envMapIntensity:.2});
const gunMat=new T.MeshStandardMaterial({color:0x3a3e34,roughness:.45,metalness:.7,envMapIntensity:.8});
const breechMat=new T.MeshStandardMaterial({color:0x2e302c,roughness:.5,metalness:.6,envMapIntensity:.06});
const brassMat=new T.MeshStandardMaterial({color:0xa07a30,roughness:.3,metalness:1,envMapIntensity:.45});
const tank=new T.Group();scene.add(tank);
const turret=new T.Group();turret.position.y=1.55;tank.add(turret);
const gunPivot=new T.Group();gunPivot.position.set(0,.48,-1.42);turret.add(gunPivot);
const gunSlide=new T.Group();gunPivot.add(gunSlide);
const muzzle=new T.Object3D();muzzle.position.set(0,0,-4.75);gunSlide.add(muzzle);
const gunCam=new T.PerspectiveCamera(9,4/3,1.2,9000);gunCam.position.set(.52,.3,-.4);gunPivot.add(gunCam);
const SEAT=new T.Vector3(.5,-.95,.3),LIFT=1.1,CAMH=1.2;
rig.position.copy(SEAT);turret.add(rig);
const hatchLid=new T.Group();hatchLid.position.set(.5,.95,.66);turret.add(hatchLid);
const monitorMat=new T.MeshBasicMaterial({color:0xffffff});
const statC=cnv(320,200),statT=tex(statC);
(function buildTank(){
  const sh=m=>{m.castShadow=m.receiveShadow=true;return m;};
  const hull=[worldBox(-1.35,1.35,.5,.58,-3.3,3.3),worldBox(-1.35,-1.27,.58,1.55,-3.3,3.3),worldBox(1.27,1.35,.58,1.55,-3.3,3.3),worldBox(-1.27,1.27,.58,1.55,-3.3,-3.22),worldBox(-1.27,1.27,.58,1.55,3.22,3.3),
    worldBox(-1.27,1.27,1.47,1.55,-3.22,-1),worldBox(-1.27,1.27,1.47,1.55,1,3.22),worldBox(-1.27,-1,1.47,1.55,-1,1),worldBox(1,1.27,1.47,1.55,-1,1),
    worldBox(-1.9,-1.35,1.05,1.11,-3.45,3.45),worldBox(1.35,1.9,1.05,1.11,-3.45,3.45),worldBox(-.9,.9,1.55,1.75,1.5,3),worldBox(-1.2,-.7,1.55,1.8,-2.9,-2.3),worldBox(.7,1.2,1.55,1.8,-2.9,-2.3)];
  tank.add(sh(new T.Mesh(mergeGeo(hull),armourMat)));
  const tracks=[];for(const s of[-1,1]){tracks.push(worldBox(s>0?1.35:-1.87,s>0?1.87:-1.35,.02,1.05,-3.4,3.4,.5,.5));for(let z=-2.9;z<=2.91;z+=.97)tracks.push(new T.CylinderGeometry(.42,.42,.56,12).rotateZ(Math.PI/2).translate(s*1.63,.44,z));}
  tank.add(sh(new T.Mesh(mergeGeo(tracks.map(g=>g.index?g.toNonIndexed():g)),trackMat)));
  const wall=(b,inner)=>{const mats=Array(6).fill(armourMat);if(inner>=0)mats[inner]=linerMat;turret.add(sh(new T.Mesh(worldBox(...b),mats)));};
  wall([-1.2,1.2,0,.95,-1.5,-1.42],4);wall([-1.2,1.2,0,.95,1.32,1.4],5);wall([-1.2,-1.12,0,.95,-1.42,1.32],0);wall([1.12,1.2,0,.95,-1.42,1.32],1);
  wall([-1.2,.15,.87,.95,-1.5,1.4],3);wall([.85,1.2,.87,.95,-1.5,1.4],3);wall([.15,.85,.87,.95,-1.5,-.05],3);wall([.15,.85,.87,.95,.65,1.4],3);
  const basket=[worldBox(-1,1,-.99,-.95,-1,1),worldBox(-1.03,-1,-.95,0,-1,1),worldBox(1,1.03,-.95,0,-1,1),worldBox(-1,1,-.95,0,-1.03,-1),worldBox(-1,1,-.95,0,1,1.03),worldBox(.2,.8,-.95,-.5,.1,.6)];
  turret.add(sh(new T.Mesh(mergeGeo(basket),linerMat)));
  turret.add(sh(new T.Mesh(mergeGeo([worldBox(-1.25,-1.2,.1,.6,-.6,1.1),worldBox(1.2,1.25,.1,.6,-.6,1.1),worldBox(-.9,.9,.1,.7,1.4,1.75),new T.CylinderGeometry(.38,.38,.14,16).translate(-.45,1.02,.35).toNonIndexed()].map(g=>g.index?g.toNonIndexed():g)),armourMat)));
  const ant=new T.Mesh(new T.CylinderGeometry(.008,.014,2.6,5).translate(-1,2.2,1.2),gunMat);turret.add(ant);
  hatchLid.add(sh(new T.Mesh(worldBox(-.38,.38,0,.05,-.74,0),armourMat)));
  const cyl=(r,l,z)=>new T.CylinderGeometry(r,r,l,14).rotateX(Math.PI/2).translate(0,0,z);
  gunSlide.add(sh(new T.Mesh(mergeGeo([cyl(.075,4.4,-2.4),cyl(.11,.36,-4.5),cyl(.1,.9,-.7)]),gunMat)));
  gunSlide.add(sh(new T.Mesh(mergeGeo([worldBox(-.17,.17,-.17,.17,.1,1.05).toNonIndexed(),cyl(.12,.3,1.2).toNonIndexed()]),breechMat)));
  gunPivot.add(sh(new T.Mesh(worldBox(-.4,.4,-.28,.28,-.36,-.06),armourMat)));
  const rack=[];for(let i=0;i<8;i++)rack.push(new T.CylinderGeometry(.05,.05,.62,12).translate(-1.02,-.38,-.25+i*.17),new T.ConeGeometry(.05,.16,12).translate(-1.02,.01,-.25+i*.17));
  turret.add(new T.Mesh(mergeGeo(rack.map(g=>g.index?g.toNonIndexed():g)),brassMat));
  const mon=new T.Mesh(new T.PlaneGeometry(.46,.345),monitorMat);mon.position.set(.5,.36,-.92);turret.add(mon);
  const bezel=new T.Mesh(worldBox(.25,.75,.17,.55,-1,-.93),breechMat);turret.add(bezel);
  const rc=cnv(512,384),g=rc.getContext('2d');g.strokeStyle='rgba(8,8,6,.9)';g.fillStyle='rgba(8,8,6,.9)';g.lineWidth=2;
  g.beginPath();g.moveTo(96,192);g.lineTo(236,192);g.moveTo(276,192);g.lineTo(416,192);g.moveTo(256,60);g.lineTo(256,172);g.stroke();
  g.lineWidth=1;g.beginPath();g.moveTo(256,198);g.lineTo(256,300);g.stroke();g.font='600 13px monospace';g.textBaseline='middle';
  [[2,11.8],[4,23.6],[6,35.5]].forEach(([n,y])=>{g.fillRect(238,192+y-1,36,2);g.fillText(String(n),282,192+y);});
  const vg=g.createRadialGradient(256,192,170,256,192,250);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.85)');g.fillStyle=vg;g.fillRect(0,0,512,384);
  const ret=new T.Mesh(new T.PlaneGeometry(.46,.345),new T.MeshBasicMaterial({map:tex(rc,false),transparent:true,toneMapped:false,depthWrite:false}));ret.position.set(.5,.36,-.918);turret.add(ret);
  const stat=new T.Mesh(new T.PlaneGeometry(.34,.2125),new T.MeshBasicMaterial({map:statT,toneMapped:false,transparent:true}));stat.position.set(.98,.38,-.62);stat.rotation.y=-1.0;turret.add(stat);
  const dome=new T.Mesh(new T.CircleGeometry(.07,16),new T.MeshBasicMaterial({color:new T.Color(2.4,1.9,1.3)}));dome.rotation.x=Math.PI/2;dome.position.set(-.25,.865,.35);turret.add(dome);
  const domeL=new T.PointLight(0xffd2a0,1.5,5,2);domeL.position.set(-.25,.75,.35);turret.add(domeL);
})();
const sightRT=new T.WebGLRenderTarget(512,384,{type:T.HalfFloatType});monitorMat.map=sightRT.texture;

const NDUST=180,dustP=new Float32Array(NDUST*3);(function(){const r=rng(13);for(let i=0;i<NDUST;i++){dustP[i*3]=(r()-.5)*2;dustP[i*3+1]=-.8+r()*1.6;dustP[i*3+2]=(r()-.5)*2.4;}})();
const dustG=new T.BufferGeometry();dustG.setAttribute('position',new T.BufferAttribute(dustP,3));dustG.boundingSphere=new T.Sphere(new T.Vector3(),4);
const dust=new T.Points(dustG,new T.PointsMaterial({color:0xffdcb0,size:.009,map:glowT,transparent:true,opacity:.5,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
turret.add(dust);
function updateDust(dt){for(let i=0;i<NDUST;i++){const j=i*3;dustP[j]+=Math.sin(time*.5+i)*dt*.02+P.shake*(Math.random()-.5)*.02;dustP[j+1]-=dt*.012;if(dustP[j+1]<-.8)dustP[j+1]=.8;}dustG.attributes.position.needsUpdate=true;}

// ---------- head-locked layers (the headset's messages, hit flash, fade) ----------
const hudC=cnv(1024,200),hudT=tex(hudC);
const hud=new T.Mesh(new T.PlaneGeometry(.78,.152),new T.MeshBasicMaterial({map:hudT,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));
hud.position.set(0,-.2,-.9);hud.renderOrder=1002;hud.visible=false;camera.add(hud);
const vign=new T.Mesh(new T.SphereGeometry(.2,48,24),new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,side:T.BackSide,
  uniforms:{inner:{value:.5},amt:{value:0}},
  vertexShader:'varying vec3 vL;void main(){vL=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform float inner,amt;varying vec3 vL;void main(){float a=acos(clamp(-normalize(vL).z,-1.0,1.0));float v=smoothstep(inner,inner+.55,a);gl_FragColor=vec4(0.25,0.02,0.0,v*amt);}'}));
vign.renderOrder=1000;vign.visible=false;camera.add(vign);
const fade=new T.Mesh(new T.SphereGeometry(.18,16,8),new T.MeshBasicMaterial({color:0,transparent:true,opacity:0,side:T.BackSide,depthTest:false,depthWrite:false}));
fade.renderOrder=1001;fade.visible=false;camera.add(fade);
let hudUntil=0;
function setHud(msg,sub='',secs=0){hudUntil=secs?time+secs:0;
  const el=$('msg');el.hidden=!msg||xrActive||state==='preview';el.firstElementChild.textContent=msg;el.lastElementChild.textContent=sub;
  const g=hudC.getContext('2d');g.clearRect(0,0,1024,200);hud.visible=!!msg&&xrActive;if(!msg)return;
  g.font='600 40px "IBM Plex Mono",monospace';const w=Math.min(1000,Math.max(g.measureText(msg).width,sub?g.measureText(sub).width*.75:0)+80);
  g.fillStyle='rgba(7,8,6,.72)';g.fillRect(512-w/2,sub?20:50,w,sub?160:100);
  g.fillStyle='#ece8dc';g.textAlign='center';g.textBaseline='middle';g.fillText(msg,512,sub?78:100,980);
  if(sub){g.font='400 30px "IBM Plex Mono",monospace';g.fillStyle='#e0b04a';g.fillText(sub,512,136,980);}hudT.needsUpdate=true;}
function setFade(v){fade.material.opacity=v;fade.visible=v>0&&xrActive;$('fade').style.opacity=xrActive?0:v;}

// ---------- flat screens: bloom and the lens ----------
const composer=new T.EffectComposer(renderer,new T.WebGLRenderTarget(innerWidth*PR,innerHeight*PR,{type:T.HalfFloatType,samples:4}));
composer.setPixelRatio(PR);composer.setSize(innerWidth,innerHeight);
const renderPass=new T.RenderPass(scene,camera);composer.addPass(renderPass);
composer.addPass(new T.UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),.5,.6,.8));
const lens=new T.ShaderPass({
  uniforms:{tDiffuse:{value:null},res:{value:new T.Vector2(innerWidth*PR,innerHeight*PR)},time:{value:0},grain:{value:.03},ca:{value:.006},blur:{value:0},desat:{value:0},vig:{value:.32}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 res;uniform float time,grain,ca,blur,desat,vig;varying vec2 vUv;
  float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  vec3 toSRGB(vec3 c){c=max(c,0.0);return mix(c*12.92,1.055*pow(c,vec3(1.0/2.4))-0.055,step(0.0031308,c));}
  void main(){vec2 c=vUv-.5;float asp=res.x/res.y;float r=length(c*vec2(asp,1.0));
    float k=ca*r*r;vec3 col;col.r=texture2D(tDiffuse,vUv-c*k).r;col.g=texture2D(tDiffuse,vUv).g;col.b=texture2D(tDiffuse,vUv+c*k).b;
    float pb=blur*smoothstep(.12,.7,r);
    if(pb>.001){vec3 acc=col;float px=pb*7.0/res.y;for(int i=0;i<12;i++){float a=float(i)*.5236;float d=(i<6)?1.0:2.0;acc+=texture2D(tDiffuse,vUv+vec2(cos(a)/asp,sin(a))*px*d).rgb;}col=acc/13.0;}
    float l=dot(col,vec3(.2126,.7152,.0722));col=mix(col,vec3(l),desat);
    col*=1.0-vig*smoothstep(.35,1.05,r);
    col=toSRGB(col);
    col+=(hash(vUv*res+fract(time*61.0)*137.0)-.5)*grain;
    gl_FragColor=vec4(col,1.0);}`
});
composer.addPass(lens);

// ---------- audio ----------
let ac=null;const A={};
function noiseBuf(sec,brown){const n=ac.sampleRate*sec,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;if(brown){last=(last+.02*w)/1.02;d[i]=last*3.5;}else d[i]=w;}return b;}
function initAudio(){
  if(ac){ac.resume&&ac.resume();return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{ac=new AC();}catch(e){ac=null;return;}
  A.master=ac.createGain();A.master.gain.value=.85;A.master.connect(ac.destination);
  A.out=ac.createBiquadFilter();A.out.type='lowpass';A.out.frequency.value=500;A.out.connect(A.master);
  A.white=noiseBuf(3,false);A.brown=noiseBuf(4,true);
  const loop=(buf,type,f,q,dest)=>{const s=ac.createBufferSource();s.buffer=buf;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=ac.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(dest);s.start();return{f:fl,g};};
  A.wind=loop(A.white,'bandpass',420,.6,A.out);
  A.tracks=loop(A.brown,'bandpass',95,1.1,A.master);
  A.clatter=loop(A.white,'bandpass',900,2,A.out);
  const osc=(type,f,lp,dest)=>{const o=ac.createOscillator();o.type=type;o.frequency.value=f;const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;const g=ac.createGain();g.gain.value=0;o.connect(fl);fl.connect(g);g.connect(dest);o.start();return{o,f:fl,g};};
  A.eng=osc('sawtooth',34,170,A.master);A.eng2=osc('square',17,120,A.master);A.whine=osc('triangle',190,900,A.master);
}
function tone(f0,f1,dur,type,peak,dest,delay=0,filt){if(!ac)return;const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  let n=o;if(filt){const fl=ac.createBiquadFilter();fl.type=filt[0];fl.frequency.value=filt[1];fl.Q.value=filt[2]||1;o.connect(fl);n=fl;}n.connect(g);g.connect(dest||A.master);o.start(t);o.stop(t+dur+.05);}
function burst(dur,type,f,q,peak,dest,delay=0){if(!ac)return;const t=ac.currentTime+delay,s=ac.createBufferSource();s.buffer=A.white;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=ac.createGain();
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+.005);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(dest||A.master);s.start(t,Math.random()*2);s.stop(t+dur+.05);}
const sfx={
  gun(){burst(.6,'lowpass',240,.7,1);tone(74,22,.8,'sine',.8);burst(.1,'highpass',1400,.7,.35,A.out);tone(900,300,.25,'sawtooth',.04,A.master,.05,['bandpass',700,4]);},
  boom(v,delay){burst(.7,'lowpass',200,.7,.8*v,A.out,delay);tone(60,24,.8,'sine',.6*v,A.out,delay);},
  crump(v,delay){burst(.45,'lowpass',420,.8,.7*v,A.out,delay);tone(90,30,.4,'sine',.4*v,A.out,delay);burst(.9,'bandpass',1800,.6,.08*v,A.out,delay+.1);},
  clang(){burst(.05,'highpass',2200,.7,.7);tone(520,180,.5,'square',.2,A.master,0,['bandpass',640,7]);tone(1310,900,.7,'triangle',.12);tone(70,30,.5,'sine',.7);},
  whoosh(){burst(.3,'bandpass',2400,2,.2,A.out);},
  breech(delay){burst(.06,'highpass',1800,.7,.25,A.master,delay);tone(240,120,.12,'square',.08,A.master,delay,['bandpass',500,5]);},
  ready(){tone(180,90,.1,'square',.1,A.master,0,['bandpass',420,5]);burst(.05,'highpass',2400,.7,.2,A.master,.06);},
  hatch(){burst(.25,'bandpass',500,3,.12);tone(140,70,.3,'sawtooth',.06,A.master,.05,['bandpass',380,5]);},
  click(){tone(1500,1500,.05,'square',.03);}
};
function setG(node,v,tc=.15){if(node)node.gain.setTargetAtTime(v,ac.currentTime,tc);}

// ---------- particles, shells ----------
const parts=[];
for(let i=0;i<150;i++){const s=new T.Sprite(new T.SpriteMaterial({map:smokeT,transparent:true,depthWrite:false,fog:false}));s.visible=false;s.userData={t:1,life:1};scene.add(s);parts.push(s);}
let partI=0;
function puff(x,y,z,o){const s=parts[partI=(partI+1)%parts.length],u=s.userData,m=s.material;
  u.t=0;u.life=o.life;u.vx=o.vx||0;u.vy=o.vy||0;u.vz=o.vz||0;u.s0=o.s0;u.s1=o.s1;u.op=o.op==null?1:o.op;
  m.map=o.add?glowT:smokeT;m.blending=o.add?T.AdditiveBlending:T.NormalBlending;m.color.setRGB(o.c[0],o.c[1],o.c[2]);m.rotation=Math.random()*6;m.needsUpdate=true;
  s.position.set(x,y,z);s.scale.setScalar(o.s0);s.visible=true;}
function updateParts(dt){for(const s of parts){if(!s.visible)continue;const u=s.userData;u.t+=dt;const k=u.t/u.life;if(k>=1){s.visible=false;continue;}
  s.position.x+=u.vx*dt;s.position.y+=u.vy*dt;s.position.z+=u.vz*dt;u.vx*=1-dt*.8;u.vz*=1-dt*.8;s.scale.setScalar(lerp(u.s0,u.s1,1-(1-k)*(1-k)));s.material.opacity=u.op*(1-k)*Math.min(1,k*12);}}
function distTo(x,z){return Math.hypot(x-P.x,z-P.z);}
function explode(x,y,z,big,dirt){
  puff(x,y+.5,z,{add:true,c:[3,2,1.1],s0:big?5:2.5,s1:big?16:8,life:.16});
  for(let i=0;i<(big?9:5);i++){const a=Math.random()*6.28,v=1+Math.random()*(big?5:3);
    puff(x,y+.4,z,{c:dirt?[.42,.36,.27]:[.1,.1,.1],s0:2,s1:(big?11:7)+Math.random()*4,life:1.6+Math.random()*2,vx:Math.cos(a)*v,vz:Math.sin(a)*v,vy:1.5+Math.random()*3,op:.85});}
  const d=distTo(x,z);if(ac)(big?sfx.boom:sfx.crump)(clamp(1.2/(1+d/90),0,1),d/340);
}
const shells=[];
const shellGeo=new T.SphereGeometry(1,8,6);
function shell(mine){const m=new T.Mesh(shellGeo,new T.MeshBasicMaterial({color:mine?new T.Color(3.2,1.8,.7):new T.Color(3.2,.9,.5),fog:false}));scene.add(m);const s={m,mine,p:m.position,v:new T.Vector3(),t:0};shells.push(s);return s;}
function dropShell(s){scene.remove(s.m);shells.splice(shells.indexOf(s),1);}

// ---------- the enemy ----------
const foeMat=new T.MeshStandardMaterial({map:tex(armourCanvas([128,116,84],21),true),roughness:.7,metalness:.25,envMapIntensity:.5});
const wreckMat=new T.MeshStandardMaterial({color:0x1c1a18,roughness:.95,metalness:.2,envMapIntensity:.15});
const foeHull=mergeGeo([worldBox(-1.3,1.3,.5,1.5,-3.2,3.2),worldBox(-1.85,-1.3,0,1.05,-3.3,3.3),worldBox(1.3,1.85,0,1.05,-3.3,3.3),worldBox(-1.1,1.1,1.5,1.62,1.2,3)]);
const foeTur=mergeGeo([worldBox(-1.1,1.1,0,.8,-1.3,1.3).toNonIndexed(),new T.CylinderGeometry(.08,.08,4.2,8).rotateX(Math.PI/2).translate(0,.4,-3.3).toNonIndexed(),worldBox(-.35,.35,.15,.65,-1.6,-1.3).toNonIndexed()]);
const foes=[];
function addFoe(x,z,dx,dz){
  const g=new T.Group(),h=new T.Mesh(foeHull,foeMat),t=new T.Mesh(foeTur,foeMat);t.position.y=1.5;g.add(h,t);scene.add(g);
  const yaw=Math.atan2(-(dx-x),-(dz-z));
  const e={g,h,t,x,z,y:hAt(x,z),yaw,tyaw:0,dx,dz,hp:2,state:'advance',fireT:3+Math.random()*3,shots:0,blind:0,smokeT:0,n:new T.Vector3(0,1,0)};
  placeFoe(e,1);foes.push(e);return e;
}
const qa=new T.Quaternion(),qb=new T.Quaternion(),va=new T.Vector3(),vb=new T.Vector3(),vc=new T.Vector3();
function normalAt(x,z,out){return out.set(-(hAt(x+2,z)-hAt(x-2,z))/4,1,-(hAt(x,z+2)-hAt(x,z-2))/4).normalize();}
function placeFoe(e,k){e.y=hAt(e.x,e.z);e.n.lerp(normalAt(e.x,e.z,va),k).normalize();e.g.position.set(e.x,e.y,e.z);e.g.quaternion.setFromUnitVectors(UP,e.n).multiply(qa.setFromAxisAngle(UP,e.yaw));e.t.rotation.y=e.tyaw;}
function killFoe(e){e.state='dead';e.h.material=e.t.material=wreckMat;e.t.rotation.z=.12;e.t.position.x=.3;explode(e.x,e.y+1.5,e.z,true,false);
  for(let i=0;i<6;i++)puff(e.x,e.y+2,e.z,{add:true,c:[3,1.4,.4],s0:3,s1:9,life:.5+Math.random()*.6,vy:4+Math.random()*5,vx:(Math.random()-.5)*4,vz:(Math.random()-.5)*4});}
function foeFire(e){
  const yw=e.yaw+e.tyaw,mx=e.x-Math.sin(yw)*5,mz=e.z-Math.cos(yw)*5,my=e.y+2;
  const d=distTo(e.x,e.z),hullMasked=los(mx,my,mz,P.x,P.y+.75,P.z)>=0;
  let pHit=clamp(1.05-d/600,.15,.8)*(Math.abs(P.v)>2?.5:1)*(hullMasked?.35:1);if(e.shots===0)pHit=0;e.shots++;
  puff(mx,my,mz,{add:true,c:[3,2,1],s0:3,s1:9,life:.14});puff(mx,my,mz,{c:[.5,.48,.44],s0:2,s1:9,life:2.2,vy:1,op:.7});
  if(ac)sfx.boom(clamp(1/(1+d/160),0,1),d/340);
  const s=shell(false);s.p.set(mx,my,mz);s.hit=Math.random()<pHit;s.from=va.set(mx,my,mz).clone();
  if(s.hit)s.to=new T.Vector3(P.x,P.y+2,P.z);
  else if(hullMasked&&Math.random()<.6){const t=los(mx,my,mz,P.x,P.y+.75,P.z);s.to=new T.Vector3(lerp(mx,P.x,t),0,lerp(mz,P.z,t));s.to.y=hAt(s.to.x,s.to.z);}
  else{const a=Math.random()*6.28,r=6+Math.random()*14;s.to=new T.Vector3(P.x+Math.cos(a)*r,0,P.z+Math.sin(a)*r);s.to.y=hAt(s.to.x,s.to.z);}
  s.T=s.from.distanceTo(s.to)/450;
}
function updateFoes(dt){
  for(const e of foes){
    if(e.state==='dead'){e.smokeT-=dt;if(e.smokeT<=0&&distTo(e.x,e.z)<900){e.smokeT=.3;puff(e.x+(Math.random()-.5),e.y+2,e.z+(Math.random()-.5),{c:[.06,.06,.06],s0:2.5,s1:14,life:5,vy:3.5,vx:1.2,op:.8});
      if(Math.random()<.4)puff(e.x,e.y+1.8,e.z,{add:true,c:[2.6,1,.3],s0:1.5,s1:3.5,life:.5,vy:2});}continue;}
    const toP=Math.atan2(-(P.x-e.x),-(P.z-e.z));
    if(e.state==='advance'){
      const dx=e.dx-e.x,dz=e.dz-e.z,d=Math.hypot(dx,dz);
      if(d<6){e.state='hold';e.blind=0;}
      else{e.yaw+=clamp(wrap(Math.atan2(-dx,-dz)-e.yaw),-.5*dt,.5*dt);e.x-=Math.sin(e.yaw)*8*dt;e.z-=Math.cos(e.yaw)*8*dt;
        if(Math.random()<dt*3)puff(e.x+Math.sin(e.yaw)*3,e.y+.4,e.z+Math.cos(e.yaw)*3,{c:[.5,.45,.36],s0:1.5,s1:7,life:2.2,vy:.8,op:.45});}
      e.tyaw+=clamp(wrap(toP-e.yaw-e.tyaw),-.5*dt,.5*dt);
    }else{
      const diff=wrap(toP-e.yaw-e.tyaw);e.tyaw+=clamp(diff,-.6*dt,.6*dt);e.fireT-=dt;
      const seen=los(e.x,e.y+2.1,e.z,P.x,P.y+2.3,P.z)<0;
      if(!seen){e.blind+=dt;if(e.blind>7){const d=Math.max(140,distTo(e.x,e.z)-90),a=Math.atan2(e.x-P.x,e.z-P.z)+(Math.random()-.5)*.5;e.dx=P.x+Math.sin(a)*d;e.dz=P.z+Math.cos(a)*d;e.state='advance';}}
      else{e.blind=0;if(e.fireT<=0&&Math.abs(diff)<.03&&state==='play'){e.fireT=6+Math.random()*3.5;foeFire(e);}}
    }
    placeFoe(e,Math.min(1,dt*3));
  }
}

// ---------- state ----------
let time=0,state='preview',xrActive=false,wave=0,waveT=0,endT=0,statT2=0,cover='';
const WAVES=[2,3,4,5];
const P={x:0,z:0,y:0,yaw:0,v:0,tyaw:0,elev:.03,aimYaw:0,aimPitch:0,armour:100,rounds:40,reload:0,shake:0,hurt:0,hatch:0,hatchOpen:false,sight:false,recoil:0,kills:0,shots:0,hits:0,n:new T.Vector3(0,1,0)};
let expo=.62,yawLook=0;
const keys={};
let best=0;try{best=+localStorage.getItem('hulldown-best')||0;}catch(e){}
function showBest(){const el=$('best');el.hidden=!best;el.textContent='Most tanks knocked out in one battle: '+best;}
showBest();
function haptic(v,ms){const s=renderer.xr.getSession&&renderer.xr.getSession();if(!s)return;for(const src of s.inputSources){const a=src.gamepad&&src.gamepad.hapticActuators&&src.gamepad.hapticActuators[0];if(a&&a.pulse)a.pulse(v,ms).catch(()=>{});}}
const live=()=>foes.filter(e=>e.state!=='dead').length;

function reset(){
  for(const e of foes)scene.remove(e.g);foes.length=0;while(shells.length)dropShell(shells[0]);
  Object.assign(P,{x:0,z:0,yaw:0,v:0,tyaw:0,elev:.03,aimYaw:0,aimPitch:0,armour:100,rounds:40,reload:0,shake:0,hurt:0,hatch:0,hatchOpen:false,sight:false,recoil:0,kills:0,shots:0,hits:0});
  wave=0;waveT=5;endT=0;setFade(0);expo=1.5;
}
function spawnWave(){
  const n=WAVES[wave],base=P.yaw+P.tyaw,spread=[.7,1.3,2.1,3.1][wave];
  for(let i=0;i<n;i++){const a=base+(Math.random()-.5)*2*spread,d=540+Math.random()*110,hold=300+Math.random()*120,a2=a+(Math.random()-.5)*.3;
    addFoe(P.x-Math.sin(a)*d,P.z-Math.cos(a)*d,P.x-Math.sin(a2)*hold,P.z-Math.cos(a2)*hold);}
  setHud('Wave '+(wave+1)+' of '+WAVES.length+' · '+n+' tanks','They are on the plot. Find a crest and lay the gun.',7);
}
function beginPlay(){
  if(state==='preview'||state==='over'){reset();state='play';
    setHud(xrActive?'The screen ahead is your gunsight':'F is the gunsight. H opens the hatch.',xrActive?'Right stick lays the gun. Trigger fires. A opens the hatch.':'The mouse lays the gun. Space fires.',8);}
  syncUi();
}
function toggleHatch(){if(state!=='play')return;P.hatchOpen=!P.hatchOpen;if(P.hatchOpen)P.sight=false;if(ac)sfx.hatch();syncUi();}
function toggleSight(){if(state!=='play'||xrActive)return;P.sight=!P.sight;if(ac)sfx.click();syncUi();}
function syncUi(){const flat=!xrActive&&state!=='preview'&&$('overlay').hidden;$('scope').hidden=!(flat&&P.sight);$('dot').hidden=$('gunmark').hidden=!(flat&&!P.sight&&state==='play');$('stat').hidden=!flat;}
function fire(){
  if(state!=='play'||P.reload>0)return false;
  if(P.rounds<=0){setHud('Out of rounds','',3);return false;}
  P.rounds--;P.shots++;P.reload=3.6;P.recoil=1;P.shake=Math.max(P.shake,.7);
  muzzle.getWorldPosition(va);gunPivot.getWorldQuaternion(qa);vb.set(0,0,-1).applyQuaternion(qa);
  const s=shell(true);s.p.copy(va);s.v.copy(vb).multiplyScalar(450);
  puff(va.x,va.y,va.z,{add:true,c:[3.4,2.2,1.1],s0:3,s1:11,life:.13});
  for(let i=0;i<5;i++)puff(va.x+vb.x*i,va.y+vb.y*i,va.z+vb.z*i,{c:[.55,.52,.48],s0:1.5,s1:7+i,life:1.8+Math.random(),vx:vb.x*(6-i),vy:.8,vz:vb.z*(6-i),op:.6});
  if(ac){sfx.gun();sfx.breech(1.1);sfx.breech(2.3);}
  haptic(1,180);return true;
}
function hurtPlayer(){
  const dmg=P.hatch>.5?34:22;P.armour=Math.max(0,P.armour-dmg);P.shake=1.4;P.hurt=1;if(ac)sfx.clang();haptic(1,400);
  if(P.armour<=0){state='dead';endT=0;setHud('','');if(ac)sfx.boom(1,0);return;}
  setHud('Hit · armour '+P.armour+'%',P.hatch>.5?'You were head out. Close the hatch under fire.':cover==='EXPOSED'?'Your hull is showing. Back down behind a crest.':'',4);
}
function updateShells(dt){
  for(let i=shells.length-1;i>=0;i--){const s=shells[i];s.t+=dt;
    if(!s.mine){const k=s.t/s.T;if(k>=1){dropShell(s);
        if(s.hit&&state==='play'){explode(s.to.x,s.to.y,s.to.z,false,false);hurtPlayer();}
        else{explode(s.to.x,s.to.y,s.to.z,false,true);const d=distTo(s.to.x,s.to.z);if(d<26&&state==='play'){P.shake=Math.max(P.shake,.5);if(ac)sfx.whoosh();haptic(.4,120);}}
        continue;}
      s.p.lerpVectors(s.from,s.to,k);s.p.y+=Math.sin(k*Math.PI)*s.T*s.T*1.2;}
    else{let gone=false;const steps=Math.max(1,Math.ceil(450*dt/2.5)),h=dt/steps;
      for(let n=0;n<steps&&!gone;n++){s.v.y-=9.8*h;s.p.addScaledVector(s.v,h);
        for(const e of foes){if(e.state==='dead')continue;const dx=s.p.x-e.x,dz=s.p.z-e.z,dy=s.p.y-(e.y+1.2);
          if(dx*dx+dz*dz<7.3&&Math.abs(dy)<1.4){const side=(-Math.sin(e.yaw)*s.v.x-Math.cos(e.yaw)*s.v.z)/Math.hypot(s.v.x,s.v.z)>-.5;
            e.hp-=side?2:1;P.hits++;gone=true;
            if(e.hp<=0){killFoe(e);P.kills++;setHud('Target destroyed',live()?live()+' left':'',3);}
            else{explode(s.p.x,s.p.y,s.p.z,false,false);e.fireT=Math.max(e.fireT,2.5);setHud('Hit','Front armour held. Hit it again.',3);}
            break;}}
        if(!gone&&s.p.y<hAt(s.p.x,s.p.z)){explode(s.p.x,s.p.y,s.p.z,false,true);gone=true;}
        if(!gone&&s.t>6)gone=true;}
      if(gone){dropShell(s);continue;}}
    s.m.scale.setScalar(Math.max(.1,distTo(s.p.x,s.p.z)*.0035));
  }
}

function updateTank(dt){
  const play=state==='play';
  let thr=0,steer=0,trav=0,elv=0;
  if(play){
    if(!xrActive){thr=(keys.KeyW?1:0)-(keys.KeyS?1:0);steer=(keys.KeyA?1:0)-(keys.KeyD?1:0);
      const ks=(P.sight?.12:.9)*dt;P.aimYaw+=((keys.ArrowLeft||keys.KeyQ?1:0)-(keys.ArrowRight||keys.KeyE?1:0))*ks;P.aimPitch=clamp(P.aimPitch+((keys.ArrowUp?1:0)-(keys.ArrowDown?1:0))*ks,-1.2,1.2);}
    else{thr=xr.thr;steer=xr.steer;trav=xr.trav;elv=xr.elv;}
  }
  const vT=thr>0?9*thr:4*thr;P.v+=clamp(vT-P.v,-6*dt,(Math.abs(vT)>Math.abs(P.v)?3:6)*dt);
  P.yaw+=steer*.5*dt*(P.v<-.5?-1:1);
  let nx=P.x-Math.sin(P.yaw)*P.v*dt,nz=P.z-Math.cos(P.yaw)*P.v*dt;const r=Math.hypot(nx,nz);
  if(r>640){nx*=640/r;nz*=640/r;P.v*=.5;if(play&&!hudUntil)setHud('Edge of the sector','Turn back.',3);}
  P.x=nx;P.z=nz;
  const bump=Math.abs(P.v)*.004*Math.sin(time*13);
  P.y=lerp(P.y,hAt(P.x,P.z),Math.min(1,dt*8))+bump*dt*8;
  const level=xrActive&&$('levelToggle').checked;
  if(level)P.n.lerp(UP,Math.min(1,dt*3)).normalize();else P.n.lerp(normalAt(P.x,P.z,va),Math.min(1,dt*2.5)).normalize();
  tank.position.set(P.x,P.y,P.z);tank.quaternion.setFromUnitVectors(UP,P.n).multiply(qa.setFromAxisAngle(UP,P.yaw));
  const before=P.tyaw;
  if(xrActive){P.tyaw=wrap(P.tyaw-trav*.55*dt);P.elev=clamp(P.elev+elv*.22*dt,-.14,.32);}
  else if(play||state==='preview'){P.tyaw=wrap(P.tyaw+clamp(wrap(P.aimYaw-P.yaw-P.tyaw),-.6*dt,.6*dt));P.elev=toward(P.elev,clamp(P.aimPitch,-.14,.32),.25*dt);}
  P.turning=Math.abs(wrap(P.tyaw-before))/Math.max(dt,1e-3);
  turret.rotation.y=P.tyaw;gunPivot.rotation.x=P.elev;
  P.recoil=Math.max(0,P.recoil-dt*(P.recoil>.6?9:1.4));gunSlide.position.z=.38*Math.sin(Math.min(1,P.recoil)*Math.PI*.5);
  if(P.reload>0){P.reload-=dt;if(P.reload<=0){P.reload=0;if(ac)sfx.ready();haptic(.3,60);}}
  P.hatch=toward(P.hatch,P.hatchOpen?1:0,dt/1.1);
  hatchLid.rotation.x=clamp(P.hatch*2.2,0,1)*1.95;
  rig.position.set(SEAT.x+xr.cx,SEAT.y+LIFT*clamp((P.hatch-.35)/.65,0,1),SEAT.z+xr.cz);
  P.shake=Math.max(0,P.shake-dt*2.2);P.hurt=Math.max(0,P.hurt-dt*.6);
  if(Math.abs(P.v)>3&&Math.random()<dt*5)puff(P.x+Math.sin(P.yaw)*3.4+(Math.random()-.5)*3,P.y+.3,P.z+Math.cos(P.yaw)*3.4,{c:[.5,.45,.36],s0:1.2,s1:6,life:2,vy:.7,op:.4});
  sunL.target.position.set(P.x,P.y,P.z);sunL.position.copy(sunL.target.position).addScaledVector(SUN,140);
}

function updateGame(dt){
  if(hudUntil&&time>hudUntil)setHud('');
  if(state==='play'){
    if(!live()){
      if(wave>=WAVES.length&&foes.length){state='over';endT=0;best=Math.max(best,P.kills);try{localStorage.setItem('hulldown-best',best);}catch(e){}showBest();
        setHud('Sector held · '+P.kills+' tanks',P.shots+' rounds fired, '+P.hits+' hits. Fire to fight again.',0);}
      else{waveT-=dt;if(waveT<=0){spawnWave();wave++;waveT=7;}}
    }
  }else if(state==='dead'){
    endT+=dt;setFade(clamp(endT/1.6,0,1));
    if(endT>2.4){best=Math.max(best,P.kills);try{localStorage.setItem('hulldown-best',best);}catch(e){}showBest();const k=P.kills,w=wave;reset();state='over';expo=1.5;
      setHud('Knocked out on wave '+w+' · '+k+' tanks','Fire to fight again.',0);}
  }
  statT2-=dt;if(statT2<=0){statT2=.2;drawStat();}
}
function drawStat(){
  let seen=0,masked=0;
  for(const e of foes){if(e.state==='dead')continue;if(los(e.x,e.y+2,e.z,P.x,P.y+2.3,P.z)<0){seen++;if(los(e.x,e.y+2,e.z,P.x,P.y+.75,P.z)>=0)masked++;}}
  cover=!live()?'':!seen?'IN DEFILADE':masked===seen?'HULL DOWN':'EXPOSED';
  const g=statC.getContext('2d');g.clearRect(0,0,320,200);g.fillStyle='rgba(7,8,6,.8)';g.fillRect(0,0,320,200);
  g.font='600 15px "IBM Plex Mono",monospace';g.textBaseline='middle';g.textAlign='left';g.fillStyle='#a09a8c';g.fillText('ARMOUR',12,22);g.fillText('GUN',12,58);g.fillText('ROUNDS',12,94);g.fillText('WAVE',12,124);
  g.fillStyle='#2a2c26';g.fillRect(84,14,92,16);g.fillRect(84,50,92,16);
  g.fillStyle=P.armour>50?'#e0b04a':'#ff5a3c';g.fillRect(84,14,92*P.armour/100,16);
  g.fillStyle=P.reload>0?'#8a8474':'#b9d36a';g.fillRect(84,50,92*(1-P.reload/3.6),16);
  g.fillStyle='#ece8dc';g.fillText(String(P.rounds),84,94);g.fillText(Math.max(1,wave)+'/'+WAVES.length+' · '+live()+' LEFT',84,124);
  if(cover){g.fillStyle=cover==='EXPOSED'?'#ff5a3c':'#b9d36a';g.fillRect(12,150,164,34);g.fillStyle='#10120c';g.textAlign='center';g.fillText(cover,94,168);}
  const cx=248,cy=100,R=58;g.strokeStyle='rgba(236,232,220,.35)';g.lineWidth=1;g.beginPath();g.arc(cx,cy,R,0,7);g.stroke();g.beginPath();g.arc(cx,cy,R/2,0,7);g.stroke();
  g.strokeStyle='#e0b04a';g.lineWidth=2;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx,cy-R);g.stroke();
  const hy=-P.tyaw;g.strokeStyle='rgba(236,232,220,.7)';g.strokeRect(cx-4,cy-6,8,12);g.beginPath();g.moveTo(cx,cy);g.lineTo(cx-Math.sin(hy)*14,cy-Math.cos(hy)*14);g.stroke();
  for(const e of foes){const rel=wrap(Math.atan2(-(e.x-P.x),-(e.z-P.z))-P.yaw-P.tyaw),d=Math.min(1,distTo(e.x,e.z)/700)*R;
    g.fillStyle=e.state==='dead'?'rgba(160,154,140,.5)':'#ff5a3c';g.beginPath();g.arc(cx-Math.sin(rel)*d,cy-Math.cos(rel)*d,e.state==='dead'?2.5:4,0,7);g.fill();}
  statT.needsUpdate=true;
}

// ---------- seeing: eye adaptation, hit effects ----------
function updateVision(dt){
  const fx=$('fxToggle').checked,out=P.hatch>.75,dmg=1-P.armour/100;
  const tgtE=state==='preview'||out||(P.sight&&!xrActive)?.62:lerp(1.5,1.05,P.hatch);
  expo=Math.exp(lerp(Math.log(expo),Math.log(tgtE),1-Math.exp(-dt/(P.sight&&!xrActive?.3:1.5))));
  renderer.toneMappingExposure=expo*(1+P.recoil*.25);
  monitorMat.color.setScalar(.62/expo);
  vign.visible=xrActive&&fx&&P.hurt>.01;vign.material.uniforms.amt.value=P.hurt*.8;
  const u=lens.uniforms;u.time.value=time;u.blur.value=fx?P.hurt*.7+P.shake*.12:0;u.ca.value=.005+(fx?P.hurt*.02+dmg*.005:0);u.desat.value=fx?dmg*.35+P.hurt*.3:0;u.vig.value=.3+(fx?P.hurt*.3:0);
}

// ---------- input ----------
const isTouch=matchMedia('(pointer:coarse)').matches;
addEventListener('keydown',e=>{if(state==='play'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.repeat)return;keys[e.code]=true;
  if($('overlay').hidden&&!xrActive){if(e.code==='Space')trigger();if(e.code==='KeyF')toggleSight();if(e.code==='KeyH')toggleHatch();}});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
$('pad').querySelectorAll('button').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();e.stopPropagation();keys[k]=true;};const off=e=>{e.stopPropagation();keys[k]=false;};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);});
$('fireBtn').addEventListener('pointerdown',e=>{e.preventDefault();trigger();});$('sightBtn').addEventListener('click',toggleSight);$('hatchBtn').addEventListener('click',toggleHatch);
function trigger(){if(state==='over'){state='preview';beginPlay();return;}fire();}
function aimBy(dx,dy,touch){const s=(touch?.006:.0028)*(P.sight?.14:1);P.aimYaw-=dx*s;P.aimPitch=clamp(P.aimPitch-dy*s,-1.2,1.2);}
let drag=null;
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{if(xrActive)return;
  if(e.pointerType==='mouse'){if(e.button===2){toggleSight();return;}if(document.pointerLockElement===canvas){trigger();return;}if(canvas.requestPointerLock&&state!=='preview'){try{const p=canvas.requestPointerLock();if(p&&p.catch)p.catch(()=>{});}catch(err){}}}
  drag={x:e.clientX,y:e.clientY,id:e.pointerId};try{canvas.setPointerCapture(e.pointerId);}catch(err){}});
canvas.addEventListener('pointermove',e=>{if(xrActive||state==='preview')return;
  if(document.pointerLockElement===canvas)aimBy(e.movementX,e.movementY,false);
  else if(drag&&drag.id===e.pointerId){aimBy(e.clientX-drag.x,e.clientY-drag.y,e.pointerType==='touch');drag.x=e.clientX;drag.y=e.clientY;}});
canvas.addEventListener('pointerup',()=>{drag=null;});canvas.addEventListener('pointercancel',()=>{drag=null;});

const mark=new T.Vector3();
function updateFlat(dt){
  if(xrActive)return;
  if(state==='preview'){P.hatchOpen=true;P.aimYaw=.5*Math.sin(time*.07);P.aimPitch=.02;}
  const sh=$('fxToggle').checked?P.shake:0;
  camera.position.set((Math.random()-.5)*.03*sh,CAMH+(Math.random()-.5)*.03*sh+Math.sin(time*1.3)*.003,0);
  camera.rotation.set(P.aimPitch+(Math.random()-.5)*.012*sh,wrap(P.aimYaw-P.yaw-P.tyaw),0);
  const fov=state==='preview'?60:72;if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}
  if(!$('gunmark').hidden){gunPivot.getWorldQuaternion(qa);muzzle.getWorldPosition(mark).add(vb.set(0,0,-400).applyQuaternion(qa));tank.updateMatrixWorld();camera.updateMatrixWorld();mark.project(camera);
    const el=$('gunmark');el.style.display=mark.z<1?'':'none';el.style.left=(mark.x*.5+.5)*100+'%';el.style.top=(-mark.y*.5+.5)*100+'%';}
}

// headset
const xr={thr:0,steer:0,trav:0,elv:0,cx:0,cz:0,centre:0,held:{}};
[0,1].forEach(i=>{const c=renderer.xr.getController(i);c.add(new T.Mesh(new T.BoxGeometry(.035,.035,.13),new T.MeshStandardMaterial({color:0x2c2e2a,roughness:.5})));rig.add(c);});
function updateXR(dt){
  xr.thr=xr.steer=xr.trav=xr.elv=0;if(!xrActive)return;
  const s=renderer.xr.getSession();if(!s)return;
  if(xr.centre>0&&camera.position.y>.3&&--xr.centre===0){xr.cx-=camera.position.x;xr.cz-=camera.position.z;}
  const dz=v=>Math.abs(v)>.15?v:0;
  for(const src of s.inputSources){const gp=src.gamepad;if(!gp)continue;const h=src.handedness,ax=dz(gp.axes[2]||0),ay=dz(gp.axes[3]||0);
    if(h==='left'){xr.thr=-ay;xr.steer=-ax;}else{xr.trav=ax;xr.elv=-ay;}
    const edge=(n,fn)=>{const on=!!(gp.buttons[n]&&gp.buttons[n].pressed),k=h+n;if(on&&!xr.held[k])fn();xr.held[k]=on;};
    edge(0,trigger);edge(4,toggleHatch);edge(3,()=>{xr.cx=xr.cz=0;xr.centre=1;});}
}

// ---------- sound mix ----------
function updateAudio(dt){
  if(!ac)return;const sp=Math.abs(P.v)/9,on=state==='play'||state==='over'?1:.5;
  A.out.frequency.setTargetAtTime(380+15000*P.hatch*P.hatch,ac.currentTime,.12);
  A.eng.o.frequency.setTargetAtTime(34+sp*26,ac.currentTime,.25);A.eng2.o.frequency.setTargetAtTime(17+sp*13,ac.currentTime,.25);
  setG(A.eng.g,(.07+sp*.05)*on,.3);setG(A.eng2.g,(.05+sp*.03)*on,.3);
  setG(A.tracks.g,sp*.5,.2);setG(A.clatter.g,sp*.03,.2);A.clatter.f.frequency.setTargetAtTime(700+sp*900,ac.currentTime,.2);
  setG(A.whine.g,clamp(P.turning||0,0,.6)*.03,.08);
  setG(A.wind.g,.05+P.hatch*.12+sp*.05,.4);
}

// ---------- loop ----------
const clock=new T.Clock(),headW=new T.Vector3();let frameN=0;
function frame(){
  const dt=Math.min(clock.getDelta(),.05);time+=dt;frameN++;
  updateXR(dt);updateTank(dt);updateFlat(dt);updateFoes(dt);updateShells(dt);updateGame(dt);updateParts(dt);updateDust(dt);updateVision(dt);updateAudio(dt);
  tank.updateMatrixWorld();camera.getWorldPosition(headW);sky.position.copy(headW);sunGlow.position.copy(headW).addScaledVector(SUN,3000);
  const vr=renderer.xr.isPresenting,inside=P.hatch<.9;
  if(inside&&(vr||!P.sight)&&state!=='preview'&&(!vr||frameN&1)){
    const prev=renderer.getRenderTarget(),xe=renderer.xr.enabled;renderer.xr.enabled=false;renderer.shadowMap.autoUpdate=false;
    gunCam.aspect=4/3;gunCam.updateProjectionMatrix();renderer.setRenderTarget(sightRT);renderer.render(scene,gunCam);
    renderer.setRenderTarget(prev);renderer.xr.enabled=xe;renderer.shadowMap.autoUpdate=true;}
  if(vr)renderer.render(scene,camera);
  else{const sc=P.sight&&state==='play';if(sc){gunCam.aspect=innerWidth/innerHeight;gunCam.updateProjectionMatrix();}renderPass.camera=sc?gunCam:camera;composer.render(dt);}
}

addEventListener('resize',()=>{if(xrActive)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);lens.uniforms.res.value.set(innerWidth*PR,innerHeight*PR);});

// ---------- menu ----------
const overlay=$('overlay'),vrBtn=$('vrBtn'),flatBtn=$('flatBtn'),vrNote=$('vrNote'),menuBtn=$('menuBtn');
$('stat').appendChild(statC);
function hideMenu(){overlay.hidden=true;menuBtn.hidden=xrActive;$('pad').hidden=$('acts').hidden=!(isTouch&&!xrActive);}
function showMenu(){overlay.hidden=false;menuBtn.hidden=true;$('pad').hidden=$('acts').hidden=true;for(const k in keys)keys[k]=false;if(document.exitPointerLock)document.exitPointerLock();syncUi();$('msg').hidden=true;}
flatBtn.addEventListener('click',()=>{initAudio();xrActive=false;hideMenu();if(state==='preview'){P.hatchOpen=false;P.hatch=0;P.aimYaw=P.yaw+P.tyaw;}beginPlay();flatBtn.textContent='Resume';});
menuBtn.addEventListener('click',showMenu);
if(navigator.xr&&navigator.xr.isSessionSupported){
  navigator.xr.isSessionSupported('immersive-vr').then(ok=>{
    if(ok){vrBtn.disabled=false;vrBtn.textContent='Enter VR';}
    else{vrBtn.textContent='No VR headset found';vrNote.textContent='In a headset, open this page’s link directly in the headset’s browser (for example Meta Quest Browser).';}
  }).catch(()=>{vrBtn.textContent='VR blocked here';vrNote.textContent='This view doesn’t allow VR. Open the page’s link directly in your headset’s browser.';});
}else{vrBtn.textContent='No VR in this browser';vrNote.textContent='For VR, open this page’s link in your headset’s browser. Desktop and phone play works here.';}
vrBtn.addEventListener('click',async()=>{
  initAudio();
  try{
    const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']});
    await renderer.xr.setSession(session);
    xrActive=true;camera.position.set(0,0,0);camera.rotation.set(0,0,0);camera.fov=72;xr.cx=xr.cz=0;xr.centre=20;
    if(state==='preview'){P.hatchOpen=false;P.hatch=0;}
    hideMenu();beginPlay();
    session.addEventListener('end',()=>{xrActive=false;xr.cx=xr.cz=0;hud.visible=false;showMenu();
      camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);vrBtn.textContent='Re-enter VR';});
  }catch(e){vrNote.textContent='Couldn’t start VR here ('+(e&&e.message?e.message:'blocked')+'). Open the page’s link directly in your headset’s browser.';}
});

P.y=hAt(0,0);P.hatch=1;P.hatchOpen=true;
drawStat();renderer.setAnimationLoop(frame);
$('loading').hidden=true;
if(document.fonts&&document.fonts.load)document.fonts.load('600 40px "IBM Plex Mono"').then(drawStat).catch(()=>{});

window.game={get time(){return time;},get state(){return state;},get wave(){return wave;},get cover(){return cover;},get xr(){return xrActive;},get expo(){return expo;},P,foes,shells,WAVES,hAt,los,tank,fire,trigger,toggleHatch,toggleSight,addFoe,live,renderer,camera,rig,
  skip(){waveT=0;},kill(e){killFoe(e);P.kills++;}};
})();
