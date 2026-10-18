const PPU=30, ZU=1/(PPU*Math.cos(Math.PI/6)), TILE=33.9/PPU, QS=new URLSearchParams(location.search);
const stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({antialias:false,alpha:false}); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.localClippingEnabled=true;
stage.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color('#0d0f14');
const camO=new THREE.OrthographicCamera(-1,1,1,-1,-60,120), camP=new THREE.PerspectiveCamera(28,1,.05,300); let cam=camO;
let ppu=PPU*3, RW=800, RH=600;
const pos=new THREE.Vector3(0,0,0), st=RIG.create(); st.snap=true; let py=0, heading=0;
const RAG={on:false,hd:0}, SHL=[], NPCS=[], MOVEK={}; let LVL='up';
const hemi=new THREE.HemisphereLight(0xdfe6ff,0x3a3428,.9), sun=new THREE.DirectionalLight(0xfff1dc,2.4);
sun.position.set(2.2,4.2,3.2); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-2.6,right:2.6,top:3.4,bottom:-1,near:.1,far:14}); sun.shadow.bias=-.0006; sun.shadow.normalBias=.02;
scene.add(hemi,sun,sun.target);
const CLOCK={sun, h:15.5};
let target=null, yawTo=0, pitchTo=.22, ppuTo=PPU; const clampP=v=>v;
const MAPED={on:false,toggle(){}}, WE={on:false,toggle(){}};
const ORB={yaw:.45,pitch:.18,size:1.55,tx:0,ty:1.2,tz:0,spin:false,spinV:.5,persp:false};
const UI={off:new THREE.Vector3(),menuOpen:false,freeCam:false,fly:false,view:'map',lit:true,thing(){},toggleMenu(){},setFree(){},setFly(){},setView(v){ UI.view=v; },
  setLit(on){ UI.lit=on; W3.mesh.material=on?W3.toon:W3.flat; try{ SAVE.set('avlight',on?'1':'0'); }catch(e){} },
  grab(){}, orbit(dx,dy){ ORB.yaw-=dx*.009; ORB.pitch=Math.max(-1.4,Math.min(1.48,ORB.pitch+dy*.007)); ORB.spin=false; if(window.AVE)AVE.bar(); },
  pan(dx,dy){ const k=2*ORB.size/Math.max(1,renderer.domElement.clientHeight), r=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0), u=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);
    ORB.tx-=(r.x*dx-u.x*dy)*k; ORB.ty-=(r.y*dx-u.y*dy)*k; ORB.tz-=(r.z*dx-u.z*dy)*k; }};
