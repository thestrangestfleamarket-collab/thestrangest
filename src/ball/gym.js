// JUNGLE COURT's indoor court: a school gym on the same floor plan (hardwood, painted block walls, pads, trusses, lamps, high windows)
import * as THREE from 'three';
export function makeGym(K){ const {FX,FZ,ptex,tex,cv,shadowOn,blackSteel,galv,tube,V3,RACK,BALL_R}=K, g=new THREE.Group(), H=K.CEIL; K.scene.add(g);
  const std=o=>new THREE.MeshStandardMaterial({roughness:.9,metalness:0,...o}), nm=(n,rx,ry)=>{ const t=ptex(n,rx,ry,false); return t?{normalMap:t}:{}; };
  const put=(geo,mat,x,y,z,ry=0)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.y=ry; g.add(m); return m; };
  const floor=put(new THREE.PlaneGeometry(FX*2,FZ*2).rotateX(-Math.PI/2),std({map:K.gymMap,...nm('floor_n',FX/1.2,FZ/1.2),roughness:.5,envMapIntensity:.3}),0,0,0); floor.receiveShadow=true;
  // walls: a painted band to head height, cream block above
  for(const [w,x,z,ry] of [[FZ*2,-FX,0,Math.PI/2],[FZ*2,FX,0,-Math.PI/2],[FX*2,0,-FZ,0],[FX*2,0,FZ,Math.PI]]){
    put(new THREE.PlaneGeometry(w,H-2.1),std({color:0xd9d2bf,map:ptex('plaster_d',w/3,(H-2.1)/3),...nm('plaster_n',w/3,(H-2.1)/3)}),x,2.1+(H-2.1)/2,z,ry).receiveShadow=true;
    put(new THREE.PlaneGeometry(w,2.1),std({color:0x3d5f8f,map:ptex('plaster_d',w/3,.7),...nm('plaster_n',w/3,.7),roughness:.8}),x,1.05,z,ry).receiveShadow=true; }
  const pad=std({color:0x1c3a6b,roughness:.75}); for(const s of[-1,1]) shadowOn(put(new THREE.BoxGeometry(6,1.9,.07),pad,0,1.0,s*(FZ-.04)));
  put(new THREE.PlaneGeometry(FX*2,FZ*2).rotateX(Math.PI/2),std({color:0x8d8f8c,map:ptex('ceiling_d',FX/2,FZ/2)}),0,H,0);
  for(const z of[-12,-6,0,6,12]){ put(new THREE.BoxGeometry(FX*2,.1,.14),blackSteel,0,H-.1,z); put(new THREE.BoxGeometry(FX*2,.1,.14),blackSteel,0,H-.75,z); for(let x=-FX+.6;x<FX;x+=1.2) put(new THREE.BoxGeometry(.05,.6,.05),blackSteel,x,H-.42,z); }
  const lampM=new THREE.MeshBasicMaterial({color:0xfff4de}); for(const x of[-4.6,4.6]) for(const z of[-12,-4,4,12]){ put(new THREE.BoxGeometry(1.25,.1,.5),blackSteel,x,H-1.0,z); put(new THREE.PlaneGeometry(1.15,.42).rotateX(Math.PI/2),lampM,x,H-1.055,z); }
  const win=new THREE.MeshBasicMaterial({color:0x101622}); for(const z of[-12,-6,0,6,12]){ put(new THREE.PlaneGeometry(3,1.5),win,-FX+.02,6.4,z,Math.PI/2); put(new THREE.BoxGeometry(.06,1.6,.06),blackSteel,-FX+.03,6.4,z); put(new THREE.BoxGeometry(.06,.06,3.1),blackSteel,-FX+.03,5.62,z); }
  // the scoreboard, the control box and the ball rack, as on the outdoor court
  const face=t=>new THREE.MeshStandardMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.6,roughness:.6});
  put(new THREE.BoxGeometry(.08,1.2,2.4),[blackSteel,face(K.sbT),blackSteel,blackSteel,blackSteel,blackSteel],FX-.05,3.6,0);
  put(new THREE.BoxGeometry(.05,.8,.8),[blackSteel,face(K.boxT),blackSteel,blackSteel,blackSteel,blackSteel],FX-.1,K.BOXY-.4,K.BOXZ);
  { const z0=RACK.z-.25, z1=RACK.z+1.15, ry=RACK.y-BALL_R*.78; for(const dx of[-.085,.085]){ tube(new V3(RACK.x+dx,ry,z0),new V3(RACK.x+dx,ry,z1),.014,galv,g); for(const zz of[z0,z1]) tube(new V3(RACK.x+dx,0,zz),new V3(RACK.x+dx,ry+.25,zz),.016,galv,g); }
    for(const zz of[z0,z1]) tube(new V3(RACK.x-.085,ry+.25,zz),new V3(RACK.x+.085,ry+.25,zz),.014,galv,g); }
  { const c=cv(1024,256),x=c.getContext('2d'); x.fillStyle='#1d4a34'; x.fillRect(0,0,1024,256); x.strokeStyle='#e0b23c'; x.lineWidth=10; x.strokeRect(12,12,1000,232); x.fillStyle='#f1ead6'; x.textAlign='center'; x.font='700 120px Arial'; x.fillText('JUNGLE COURT',512,170);
    put(new THREE.PlaneGeometry(6,1.5),std({map:tex(c),roughness:.95}),0,5.2,-FZ+.02); }
  { const c=cv(512,512),x=c.getContext('2d'); x.fillStyle='#6d7477'; x.fillRect(0,0,512,512); x.strokeStyle='#33383a'; x.lineWidth=8; x.strokeRect(4,4,504,504); x.beginPath(); x.moveTo(256,0); x.lineTo(256,512); x.stroke();
    x.fillStyle='#b9bcbb'; x.fillRect(40,250,180,16); x.fillRect(292,250,180,16); x.fillStyle='#20272c'; x.fillRect(150,60,70,110); x.fillRect(292,60,70,110);
    put(new THREE.PlaneGeometry(1.9,2.1),std({map:tex(c),roughness:.6,metalness:.3}),5.5,1.05,FZ-.02,Math.PI); }
  const hemi=new THREE.HemisphereLight(0xfff1dc,0x9a7a52,1.2); g.add(hemi);
  return {g,win,hemi}; }
