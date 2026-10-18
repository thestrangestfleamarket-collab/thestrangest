// ---- THE AVATAR EDITOR, STANDALONE (owner, 18 Oct 2026: "create standalone avatar editor have the character have default poses yuo can push
// button to do, spread all limbs out, etc. allow to sculpt the character, rotate 360, tilt, export, give as many presets as possible"; then "i
// want it based on our new walker and our game"): the game's own Walker (his rig as build.py makes it, his mesh, his shading, his hair's swing:
// walker3d.js) and the game's own editors (the avatar editor, HIS SHAPE, his moves, his looks, his speeds and body types: avatar.js, editor.js,
// animator.js, looks.js, avmove.js, word for word) on a page of their own, build.py's dist/avatar.html. What those files take from the game's
// page is stood in for here, before them: the scale, the renderer and the scene, a camera that turns all the way round him, his state, the
// sun, the menu's hooks. The poses, the view, the outfits and the files come after them (src/avatar-post.js) ----
const PPU=30, ZU=1/(PPU*Math.cos(Math.PI/6)), TILE=33.9/PPU, QS=new URLSearchParams(location.search);   // (the game's: map-pre.js and the base page)
const stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({antialias:false,alpha:false}); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.localClippingEnabled=true;
stage.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color('#0d0f14');
// THE CAMERA: the game's map view (orthographic) or a lens, all the way round him and from under his feet to overhead
const camO=new THREE.OrthographicCamera(-1,1,1,-1,-60,120), camP=new THREE.PerspectiveCamera(28,1,.05,300); let cam=camO;
let ppu=PPU*3, RW=800, RH=600;   // (screen pixels to a world unit at him, the picture's size: editor.js's brush ring and drags read them)
// HIM: where he stands, his rig's state (the game's player's), the ragdoll off
const pos=new THREE.Vector3(0,0,0), st=RIG.create(); st.snap=true; let py=0, heading=0;
const RAG={on:false,hd:0}, SHL=[], NPCS=[], MOVEK={}; let LVL='up';
// THE LIGHT: a sun and the sky's fill, the shadow on the floor (his own on himself: walker3d.js's SELF)
const hemi=new THREE.HemisphereLight(0xdfe6ff,0x3a3428,.9), sun=new THREE.DirectionalLight(0xfff1dc,2.4);
sun.position.set(2.2,4.2,3.2); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-2.6,right:2.6,top:3.4,bottom:-1,near:.1,far:14}); sun.shadow.bias=-.0006; sun.shadow.normalBias=.02;
scene.add(hemi,sun,sun.target);
const CLOCK={sun, h:15.5};
// the game page's view state, as editor.js and avatar.js set and read it (their targets: nothing here eases toward them)
let target=null, yawTo=0, pitchTo=.22, ppuTo=PPU; const clampP=v=>v;
const MAPED={on:false,toggle(){}}, WE={on:false,toggle(){}};
// THE ORBIT: turned by any drag the game's editors hand over (UI.grab, UI.orbit, UI.pan), by the right button, the wheel, the foot's sliders
const ORB={yaw:.45,pitch:.18,size:1.55,tx:0,ty:1.2,tz:0,spin:false,spinV:.5,persp:false};
const UI={off:new THREE.Vector3(),menuOpen:false,freeCam:false,fly:false,view:'map',lit:true,thing(){},toggleMenu(){},setFree(){},setFly(){},setView(v){ UI.view=v; },
  setLit(on){ UI.lit=on; W3.mesh.material=on?W3.toon:W3.flat; try{ SAVE.set('avlight',on?'1':'0'); }catch(e){} },
  grab(){}, orbit(dx,dy){ ORB.yaw-=dx*.009; ORB.pitch=Math.max(-1.4,Math.min(1.48,ORB.pitch+dy*.007)); ORB.spin=false; if(window.AVE)AVE.bar(); },
  pan(dx,dy){ const k=2*ORB.size/Math.max(1,renderer.domElement.clientHeight), r=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0), u=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);
    ORB.tx-=(r.x*dx-u.x*dy)*k; ORB.ty-=(r.y*dx-u.y*dy)*k; ORB.tz-=(r.z*dx-u.z*dy)*k; }};
