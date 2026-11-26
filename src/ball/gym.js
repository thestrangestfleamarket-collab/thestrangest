// BALL's indoor court: a school gym on the same floor plan, every fitting where a real one has it
import * as THREE from 'three';
export function makeGym(K){ const {FX,FZ,HL,tex,cv,shadowOn,blackSteel,galv,tube,V3,RACK,BALL_R,BOARD_FACE,BOARD_W,BOARD_H,RIM_H}=K, g=new THREE.Group(), H=K.CEIL; K.scene.add(g);
  const std=o=>new THREE.MeshStandardMaterial({roughness:.9,metalness:0,...o}), rep=c=>{ const t=tex(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; };
  const put=(geo,mat,x,y,z,ry=0,par=g)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.y=ry; par.add(m); return m; };
  const P=(w,h,u=1,v=u)=>{ const q=new THREE.PlaneGeometry(w,h), a=q.attributes.uv; for(let i=0;i<a.count;i++) a.setXY(i,a.getX(i)*w/u,a.getY(i)*h/v); return q; };
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), WALLS=[[FZ*2,-FX,0,Math.PI/2],[FZ*2,FX,0,-Math.PI/2],[FX*2,0,-FZ,0],[FX*2,0,FZ,Math.PI]];
  // painted block, two courses to a tile
  const blockT=(()=>{ const c=cv(256,128),x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,256,128); for(let i=0;i<900;i++){ x.fillStyle=`rgba(0,0,0,${Math.random()*.035})`; x.fillRect(Math.random()*256,Math.random()*128,3,3); }
    x.fillStyle='rgba(60,60,58,.5)'; x.fillRect(0,0,256,3); x.fillRect(0,64,256,3); x.fillRect(0,0,3,64); x.fillRect(128,0,3,64); x.fillRect(64,64,3,64); x.fillRect(192,64,3,64); return rep(c); })();
  const mWall=std({color:0xeeebe1,map:blockT,bumpMap:blockT,bumpScale:.5}), mBlue=std({color:0x1f3f7a,roughness:.75}), mDark=std({color:0x17191b,roughness:.8}), mWhite=std({color:0xe9e8e2,roughness:.7,metalness:.2}), mRed=std({color:0x8f2019,roughness:.6}), mOrange=std({color:0xe2701c,roughness:.7}), mGrey=std({color:0x8a8f92,roughness:.6,metalness:.4});
  const floor=put(new THREE.PlaneGeometry(FX*2,FZ*2).rotateX(-Math.PI/2),std({map:K.gymMap,...(K.ptex('floor_n',FX/1.2,FZ/1.2,false)?{normalMap:K.ptex('floor_n',FX/1.2,FZ/1.2,false),normalScale:new THREE.Vector2(.35,.35)}:{}),roughness:.2,envMapIntensity:1}),0,0,0); floor.receiveShadow=true;
  const WZ=[-12,-6,0,6,12], wallP=(w,h,x,y,z,ry)=>{ const m=put(P(w,h,.8,.4),mWall,x,y,z,ry); m.receiveShadow=m.castShadow=true; };
  for(const [w,x,z,ry] of WALLS){ const s=Math.sin(ry), c=Math.cos(ry); if(x>-FX+.1) wallP(w,H,x,H/2,z,ry); else { wallP(w,5.9,x,2.95,z,ry); wallP(w,H-7.5,x,(H+7.5)/2,z,ry); let z0=-FZ; for(const zc of [...WZ,99]){ const z1=zc>50?FZ:zc-1.7; wallP(z1-z0,1.6,x,6.7,(z0+z1)/2,ry); z0=zc+1.7; } } put(P(w,.32),mBlue,x+s*.012,2.3,z+c*.012,ry); put(P(w,.1),mDark,x+s*.014,.05,z+c*.014,ry); }
  // pads behind each basket, seamed every two feet
  { const c=cv(128,128),x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,128,128); x.fillStyle='rgba(0,0,0,.45)'; x.fillRect(0,0,4,128); x.fillStyle='rgba(0,0,0,.18)'; x.fillRect(4,0,5,128); x.fillRect(0,0,128,4); const mPad=std({color:0x1f3f7a,map:rep(c),roughness:.7});
    for(const s of[-1,1]){ shadowOn(put(B(6.72,1.83,.05),mDark,0,1.02,s*(FZ-.03))); put(P(6.71,1.83,.61,1.83),mPad,0,1.02,s*(FZ-.06),s<0?0:Math.PI); } }
  // roof: ribbed white deck, white joists, high-bay lamps on rods
  { const c=cv(64,64),x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,64,64); x.fillStyle='rgba(0,0,0,.2)'; x.fillRect(0,0,5,64); x.fillStyle='rgba(0,0,0,.08)'; x.fillRect(5,0,6,64); put(P(FX*2,FZ*2,.3,.3).rotateX(Math.PI/2),std({color:0xdcdcd6,map:rep(c)}),0,H,0).castShadow=true; }
  for(const z of[-12,-6,0,6,12]){ put(B(FX*2,.09,.12),mWhite,0,H-.08,z); put(B(FX*2,.09,.12),mWhite,0,H-.75,z); for(let x=-FX+.5;x<FX-.4;x+=1.1) tube(new V3(x,H-.75,z),new V3(x+.55,H-.08,z),.018,mWhite,g), tube(new V3(x+.55,H-.08,z),new V3(x+1.1,H-.75,z),.018,mWhite,g); }
  for(const x of[-6.4,-3.2,0,3.2,6.4]) put(B(.08,.16,FZ*2),mWhite,x,H-.08,0);
  const lampM=new THREE.MeshBasicMaterial({color:0xfff6e4}); for(const x of[-5.6,0,5.6]) for(const z of[-12,-4,4,12]){ put(B(1.2,.09,.45),mWhite,x,H-1.3,z); put(new THREE.PlaneGeometry(1.12,.38).rotateX(Math.PI/2),lampM,x,H-1.347,z); for(const dx of[-.5,.5]) tube(new V3(x+dx,H-1.26,z),new V3(x+dx,H-.05,z),.008,mGrey,g); }
  // supply duct with its hangers and grilles, sprinkler main and branches, the divider curtain rolled up at mid-court
  { const d=put(new THREE.CylinderGeometry(.32,.32,FZ*2-1.2,20).rotateX(Math.PI/2),galv,7.6,H-1.75,0); for(let z=-15;z<=15;z+=3){ put(new THREE.TorusGeometry(.325,.012,6,20),mGrey,7.6,H-1.75,z); tube(new V3(7.6,H-1.42,z),new V3(7.6,H-.05,z),.008,mGrey,g); }
    for(const z of[-12,-6,0,6,12]) put(B(.06,.3,.9),mDark,7.6-.31,H-1.75,z+1.5);
    tube(new V3(-7.2,H-.95,-FZ+.1),new V3(-7.2,H-.95,FZ-.1),.035,mRed,g); for(const z of[-13.5,-9,-3,3,9,13.5]){ tube(new V3(-7.2,H-.95,z),new V3(6.8,H-.95,z),.02,mRed,g); for(const x of[-4,0,4]) tube(new V3(x,H-.95,z),new V3(x,H-1.08,z),.012,mGrey,g); }
    put(new THREE.CylinderGeometry(.27,.27,FX*2-1.4,16).rotateZ(Math.PI/2),std({color:0x55616e,roughness:.8}),0,H-1.12,.55); for(const x of[-7,-3.5,0,3.5,7]) put(B(.06,.75,.62),mDark,x,H-.98,.55); }
  // daylight: high windows over the bleachers, with mullions
  const win=new THREE.MeshBasicMaterial({color:0x101622}); for(const z of WZ){ put(new THREE.PlaneGeometry(3.4,1.6),win,-FX-.02,6.7,z,Math.PI/2); for(const dz of[-1.7,-.57,.57,1.7]) put(B(.07,1.7,.06),mWhite,-FX+.04,6.7,z+dz); for(const dy of[-.82,.82]) put(B(.07,.06,3.46),mWhite,-FX+.04,6.7+dy,z); }
  // telescopic bleachers, pushed back against the wall
  { const c=cv(256,64),x=c.getContext('2d'); x.fillStyle='#b88a57'; x.fillRect(0,0,256,64); for(let i=0;i<60;i++){ x.fillStyle=`rgba(70,40,10,${Math.random()*.12})`; x.fillRect(0,Math.random()*64,256,1+Math.random()*2); } x.fillStyle='#101214'; x.fillRect(0,0,256,9); x.fillStyle='rgba(0,0,0,.35)'; x.fillRect(0,9,256,4); x.fillStyle='#2a2d30'; x.fillRect(0,0,5,64); x.fillRect(126,0,4,64);
    shadowOn(put(B(.98,4.06,24),mDark,-FX+.5,2.03,0)); put(P(24,4.06,2.4,.29),std({map:rep(c),roughness:.6}),-FX+1.0,2.03,0,Math.PI/2).receiveShadow=true; for(const z of[-12.03,12.03]) put(B(.04,1.1,.04),mGrey,-FX+1.0,4.6,z);
    tube(new V3(-FX+1.0,5.1,-12),new V3(-FX+1.0,5.1,12),.02,mGrey,g); K.boxes.push({gym:true,min:new V3(-FX,0,-12),max:new V3(-FX+1,4.06,12),e:.5,snd:'thud'}); K.solids.push({gym:true,x0:-FX,x1:-FX+1,z0:-12,z1:12}); }
  // acoustic panels and speakers
  { const mPan=std({color:0xb9ad94,roughness:1}); for(let z=-12;z<=12;z+=4) put(B(.05,1.2,2.4),mPan,FX-.03,6.6,z); for(const s of[-1,1]) for(const x of[-5,0,5]) put(B(2.4,1.2,.05),mPan,x,7.3,s*(FZ-.03));
    for(const s of[-1,1]) for(const x of[-8,8]) put(B(.42,.62,.34),mDark,x,6.2,s*(FZ-.22)); }
  // doors with frames, EXIT signs, alarm pulls and strobes
  { const c=cv(512,512),x=c.getContext('2d'); x.fillStyle='#737a7d'; x.fillRect(0,0,512,512); x.strokeStyle='#2c3133'; x.lineWidth=8; x.strokeRect(4,4,504,504); x.beginPath(); x.moveTo(256,0); x.lineTo(256,512); x.stroke(); x.fillStyle='#c2c5c4'; x.fillRect(36,246,190,18); x.fillRect(286,246,190,18);
    x.fillStyle='#1b2227'; x.fillRect(160,56,66,120); x.fillRect(286,56,66,120); x.strokeStyle='rgba(180,190,190,.35)'; x.lineWidth=1; for(let i=0;i<7;i++){ x.beginPath(); x.moveTo(160+i*11,56); x.lineTo(160+i*11,176); x.moveTo(286+i*11,56); x.lineTo(286+i*11,176); x.stroke(); } x.fillStyle='#55595b'; x.fillRect(0,470,512,42);
    const mDoor=std({map:tex(c),roughness:.55,metalness:.3}), e=cv(128,64),y=e.getContext('2d'); y.fillStyle='#2a0503'; y.fillRect(0,0,128,64); y.fillStyle='#ff3b2a'; y.font='700 46px Arial'; y.textAlign='center'; y.fillText('EXIT',64,49); const mExit=new THREE.MeshBasicMaterial({map:tex(e)});
    for(const [x0,s] of [[5.6,1],[-5.6,-1]]){ const z=s*(FZ-.02), ry=s>0?Math.PI:0; put(new THREE.PlaneGeometry(1.9,2.13),mDoor,x0,1.065,z,ry); for(const dx of[-1,1]) put(B(.09,2.22,.08),mDark,x0+dx*.99,1.11,s*(FZ-.04)); put(B(2.07,.09,.08),mDark,x0,2.17,s*(FZ-.04));
      put(B(.42,.22,.06),mDark,x0,2.5,s*(FZ-.04)); put(new THREE.PlaneGeometry(.38,.19),mExit,x0,2.5,s*(FZ-.075),ry); put(B(.11,.16,.05),mRed,x0+1.45,1.25,s*(FZ-.03)); put(B(.12,.2,.07),mWhite,x0+1.45,2.45,s*(FZ-.04)); } }
  // the wall clock in its cage
  const ckC=cv(256,256), ckT=tex(ckC); put(new THREE.CircleGeometry(.36,32),std({map:ckT,roughness:.5}),0,5.6,FZ-.03,Math.PI); put(new THREE.TorusGeometry(.37,.022,8,32),mDark,0,5.6,FZ-.035,Math.PI); for(const a of[0,Math.PI/2]){ const b=put(B(.76,.012,.012),mGrey,0,5.6,FZ-.1); b.rotation.z=a; }
  const clock=h=>{ const x=ckC.getContext('2d'); x.fillStyle='#f3f1ea'; x.fillRect(0,0,256,256); x.strokeStyle='#111'; x.lineCap='round'; for(let i=0;i<12;i++){ const a=i*Math.PI/6; x.lineWidth=i%3?4:8; x.beginPath(); x.moveTo(128+Math.sin(a)*100,128-Math.cos(a)*100); x.lineTo(128+Math.sin(a)*114,128-Math.cos(a)*114); x.stroke(); }
    const hand=(a,l,w)=>{ x.lineWidth=w; x.beginPath(); x.moveTo(128,128); x.lineTo(128+Math.sin(a)*l,128-Math.cos(a)*l); x.stroke(); }; hand((h%12)/12*6.2832,62,10); hand((h%1)*6.2832,96,6); ckT.needsUpdate=true; };
  // the scoreboard, the control box and the ball rack, as on the outdoor court
  const face=t=>new THREE.MeshStandardMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.6,roughness:.6});
  put(B(.08,1.2,2.4),[blackSteel,face(K.sbT),blackSteel,blackSteel,blackSteel,blackSteel],FX-.05,4.3,0);
  put(B(.05,.8,.8),[blackSteel,face(K.boxT),blackSteel,blackSteel,blackSteel,blackSteel],FX-.1,K.BOXY-.4,K.BOXZ);
  { const z0=RACK.z-.25, z1=RACK.z+1.15, ry=RACK.y-BALL_R*.78; for(const dx of[-.085,.085]){ tube(new V3(RACK.x+dx,ry,z0),new V3(RACK.x+dx,ry,z1),.014,galv,g); for(const zz of[z0,z1]) tube(new V3(RACK.x+dx,0,zz),new V3(RACK.x+dx,ry+.25,zz),.016,galv,g); }
    for(const zz of[z0,z1]) tube(new V3(RACK.x-.085,ry+.25,zz),new V3(RACK.x+.085,ry+.25,zz),.014,galv,g); }
  // the scorer's table at mid-court and the two team benches of folding chairs
  const chair=(x,z)=>{ shadowOn(put(B(.4,.03,.4),mBlue,x,.45,z)); shadowOn(put(B(.025,.34,.4),mBlue,x+.2,.8,z)); for(const dx of[-.18,.18]) for(const dz of[-.18,.18]) put(B(.02,dx>0?.96:.45,.02),mGrey,x+dx,dx>0?.48:.225,z+dz); };
  shadowOn(put(B(.62,.74,3.2),mBlue,FX-.95,.37,0)); shadowOn(put(B(.7,.035,3.26),mDark,FX-.95,.758,0)); put(B(.3,.1,.42),mDark,FX-.95,.83,-.5); put(B(.2,.16,.3),mGrey,FX-.95,.86,.6); for(const z of[-1,0,1]) chair(FX-.34,z);
  for(let z=-10.4;z<=-3.1;z+=.52) chair(FX-.36,z); for(let z=8.1;z<=11.8;z+=.52) chair(FX-.36,z);
  put(B(.5,.72,.5),mGrey,FX-.4,.36,12.6); shadowOn(put(new THREE.CylinderGeometry(.17,.15,.46,16),mOrange,FX-.4,.95,12.6)); put(new THREE.CylinderGeometry(.175,.175,.05,16),mWhite,FX-.4,1.2,12.6);
  for(const [z0,z1,h] of [[-1.65,1.65,.78],[-10.65,-2.85,.95],[7.85,12.9,.95]]){ K.boxes.push({gym:true,min:new V3(FX-(h<.8?1.3:.62),0,z0),max:new V3(FX,h,z1),e:.4,snd:'thud'}); K.solids.push({gym:true,x0:FX-(h<.8?1.3:.62),x1:FX,z0,z1}); }
  // what gets left in the corners: a dust mop, a bin, a stack of cones
  tube(new V3(FX-.25,.04,FZ-.75),new V3(FX-.1,1.55,FZ-.12),.014,mGrey,g); put(B(.9,.05,.13),mWhite,FX-.3,.03,FZ-.8);
  shadowOn(put(new THREE.CylinderGeometry(.22,.19,.7,16),mGrey,3.9,.35,FZ-.35)); K.cyls.push({gym:true,x:3.9,z:FZ-.35,r:.22,h:.7});
  for(let i=0;i<5;i++) put(new THREE.ConeGeometry(.12,.3,12),mOrange,-FX+.45,.15+i*.045,14.6); put(B(.26,.02,.26),mOrange,-FX+.45,.01,14.6);
  // side baskets folded up to the roof over the bleachers, as they are when the main court is in use
  for(const z of[-6,6]){ shadowOn(put(B(1.83,.05,1.07),mWhite,-6.2,H-1.5,z)); put(B(1.2,.03,.6),mOrange,-6.2,H-1.53,z); tube(new V3(-6.2,H-1.5,z-.3),new V3(-7.6,H-.75,z),.04,mWhite,g); tube(new V3(-6.2,H-1.5,z+.3),new V3(-4.8,H-.75,z),.03,mWhite,g); put(new THREE.TorusGeometry(.23,.01,6,24).rotateY(Math.PI/2),mOrange,-6.2,H-1.78,z+.2); }
  // pennants by year, an extinguisher, a thermostat in its guard, outlets and conduit, a return-air grille
  { const cols=['#1f3f7a','#e9e6da','#1f3f7a','#b08d3c','#1f3f7a','#e9e6da']; [1987,1994,1995,2003,2011,2019].forEach((yr,i)=>{ const c=cv(128,192),x=c.getContext('2d'); x.fillStyle=cols[i]; x.beginPath(); x.moveTo(0,0); x.lineTo(128,0); x.lineTo(128,150); x.lineTo(64,192); x.lineTo(0,150); x.fill(); x.fillStyle=i%3===1?'#1f3f7a':'#f3efe0'; x.font='700 40px Arial'; x.textAlign='center'; x.fillText(yr,64,92); x.fillRect(18,22,92,5); x.fillRect(18,116,92,5);
      put(new THREE.PlaneGeometry(.8,1.2),new THREE.MeshStandardMaterial({map:tex(c),transparent:true,roughness:1}),(i<3?-6.2+i*1.1:4+ (i-3)*1.1),5.4,FZ-.03,Math.PI); });
    shadowOn(put(new THREE.CylinderGeometry(.065,.065,.42,12),mRed,2.9,1.15,-FZ+.1)); put(B(.03,.08,.03),mDark,2.9,1.4,-FZ+.1); put(B(.2,.6,.02),mWhite,2.9,1.15,-FZ+.02);
    put(B(.16,.2,.07),mGrey,-3.9,1.5,FZ-.05); for(const [x,z,ry] of [[-2,-FZ+.02,0],[7,-FZ+.02,0],[2,FZ-.02,0],[FX-.02,-12,0],[FX-.02,13.6,0]]){ put(B(z>-FZ+.1&&z<FZ-.1?.03:.08,.12,z>-FZ+.1&&z<FZ-.1?.08:.03),mGrey,x,.45,z); tube(new V3(x,.5,z),new V3(x,2.14,z),.011,mGrey,g); }
    const c=cv(64,64),x=c.getContext('2d'); x.fillStyle='#9a9c98'; x.fillRect(0,0,64,64); x.fillStyle='#3a3c3b'; for(let i=0;i<8;i++) x.fillRect(0,i*8+4,64,3); const t=tex(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1,3); put(new THREE.PlaneGeometry(1.4,.9),std({map:t,metalness:.4,roughness:.6}),-7.6,.6,-FZ+.02); put(B(1.5,1.0,.03),mGrey,-7.6,.6,-FZ+.005); }
  // the baskets hang from the roof: a glass board in its frame, padded along the bottom, a shot clock over it
  { const c=cv(512,300),x=c.getContext('2d'); x.fillStyle='rgba(205,228,236,.16)'; x.fillRect(0,0,512,300); x.strokeStyle='rgba(255,255,255,.95)'; x.lineWidth=14; x.strokeRect(7,7,498,286); const px=512/BOARD_W, sy=300-(.152)*300/BOARD_H; x.lineWidth=.051*px; x.strokeRect(256-.305*px,sy-.457*300/BOARD_H,.61*px,.457*300/BOARD_H);
    const mGlass=new THREE.MeshStandardMaterial({map:tex(c),transparent:true,roughness:.08,metalness:0,side:THREE.DoubleSide,depthWrite:false,envMapIntensity:1}), bY=RIM_H-.152+BOARD_H/2, zb=-BOARD_FACE, zm=zb-.55, clockM=[mDark,mDark,mDark,mDark,face(K.scT),mDark];
    for(const h of K.hoops){ const q=new THREE.Group(); h.g.add(q); h.gymG=q; put(new THREE.PlaneGeometry(BOARD_W,BOARD_H),mGlass,0,bY,zb-.004,0,q); for(const dy of[-1,1]) put(B(BOARD_W+.05,.045,.05),mWhite,0,bY+dy*BOARD_H/2,zb-.03,0,q); for(const dx of[-1,1]) put(B(.045,BOARD_H,.05),mWhite,dx*BOARD_W/2,bY,zb-.03,0,q);
      shadowOn(put(B(BOARD_W+.09,.07,.09),mBlue,0,bY-BOARD_H/2-.01,zb-.02,0,q)); for(const dx of[-1,1]) put(B(.07,.38,.09),mBlue,dx*(BOARD_W/2+.01),bY-BOARD_H/2+.19,zb-.02,0,q);
      tube(new V3(0,bY-.35,zm),new V3(0,H-.75,zm),.055,mWhite,q); for(const dy of[-.3,.3]) tube(new V3(0,bY+dy,zm),new V3(0,bY+dy,zb-.05),.03,mWhite,q); for(const dx of[-1,1]){ tube(new V3(0,bY+.35,zm),new V3(dx*1.7,H-.75,zm),.028,mWhite,q); tube(new V3(dx*1.7,H-.75,-12),new V3(dx*1.7,H-.75,-FZ),.04,mWhite,q); tube(new V3(dx*.8,bY+.3,zb-.05),new V3(dx*1.7,H-.75,zm-1.6),.022,mWhite,q); }
      tube(new V3(-1.7,H-.75,zm),new V3(1.7,H-.75,zm),.04,mWhite,q); tube(new V3(0,bY,zm),new V3(0,H-.75,zm-2.2),.028,mWhite,q);
      put(B(.62,.42,.14),clockM,0,bY+BOARD_H/2+.36,zb-.2,0,q); } }
  const hemi=new THREE.HemisphereLight(0xfff4e2,0xcdbb98,1.25); g.add(hemi); g.traverse(o=>{ if(o.isMesh&&o.position.y>4.5&&o.material!==mWall&&o.position.y<H-.01) o.castShadow=false; });
  // the lamps' own light, and the sun's shafts through the windows
  const key=new THREE.DirectionalLight(0xfff3e0,1.5); key.position.set(1.5,8.6,2.5); key.shadow.mapSize.set(2048,2048); { const c=key.shadow.camera; c.left=-19; c.right=19; c.top=19; c.bottom=-19; c.near=.2; c.far=10; } key.shadow.bias=-.0004; key.shadow.normalBias=.03; g.add(key,key.target);
  const sp=new Float32Array(WZ.length*8*3), si=[]; WZ.forEach((_,i)=>{ const o=i*8; for(const [a,b] of [[0,1],[1,2],[2,3],[3,0]]) si.push(o+a,o+b,o+4+b, o+a,o+4+b,o+4+a); }); const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(sp,3)); sg.setIndex(si);
  const shaftM=new THREE.MeshBasicMaterial({color:0xfff0d0,transparent:true,opacity:.05,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}), shaft=new THREE.Mesh(sg,shaftM); shaft.frustumCulled=false; shaft.userData.dyn=true; g.add(shaft); K.noBake.push(shaft);
  const sunIn=(d,k,col,op)=>{ shaft.visible=k>.02; if(!shaft.visible) return; shaftM.color.copy(col); shaftM.opacity=op*k; let n=0; for(const zc of WZ){ const C=[[5.9,zc-1.7],[5.9,zc+1.7],[7.5,zc+1.7],[7.5,zc-1.7]]; for(const [y,z] of C){ sp[n++]=-FX; sp[n++]=y; sp[n++]=z; }
      for(const [y,z] of C){ const t=Math.min(y/d.y,(2*FX-.03)/d.x,d.z>1e-4?(FZ-.03-z)/d.z:d.z<-1e-4?(-FZ+.03-z)/d.z:1e9); sp[n++]=-FX+d.x*t; sp[n++]=Math.max(.006,y-d.y*t); sp[n++]=z+d.z*t; } } sg.attributes.position.needsUpdate=true; };
  return {g,win,hemi,clock,key,lampM,sunIn}; }
