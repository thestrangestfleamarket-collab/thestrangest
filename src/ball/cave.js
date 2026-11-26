// BALL's underground court: a hall cut in the rock of a great cavern, on the same floor plan. Rough rock walls and vault, columns, an opening in the roof and its shaft of light, braziers, crystals
import * as THREE from 'three';
import { courtside } from './gym.js';
export function makeCave(K){ const {FX,FZ,ptex,tex,cv,shadowOn,V3}=K, g=new THREE.Group(), H=K.CAVEH, R=3.2; K.scene.add(g);
  let sd=77; const rnd=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; }, nz=(x,z)=>Math.sin(x*.9+1.3)*Math.cos(z*.7+.4)*.5+Math.sin(x*2.3+z*1.7)*.25+Math.sin(x*5.1-z*4.3)*.12;
  const std=o=>new THREE.MeshStandardMaterial({roughness:.95,metalness:0,...o}), put=(geo,mat,x,y,z,ry=0)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.y=ry; g.add(m); return m; };
  const rockN=(rx,ry)=>{ const t=ptex('rock_n',rx,ry,false); return t?{normalMap:t,normalScale:new THREE.Vector2(1.6,1.6)}:{}; };
  // the court: honed dark stone that holds the light
  const floor=put(new THREE.PlaneGeometry(FX*2,FZ*2).rotateX(-Math.PI/2),std({map:K.caveMap,...(ptex('concrete_n',FX/1.5,FZ/1.5,false)?{normalMap:ptex('concrete_n',FX/1.5,FZ/1.5,false),normalScale:new THREE.Vector2(.5,.5)}:{}),roughness:.16,metalness:.05,envMapIntensity:1.1}),0,0,0); floor.receiveShadow=true;
  // rock: each wall a sheet pushed back in folds, never forward of the line the ball meets
  const rock=(w,h,rx,ry)=>std({color:0x8b8780,map:ptex('rock_d',rx,ry),...rockN(rx,ry)});
  for(const [w,x,z,ry] of [[FZ*2+1.4,-FX-.35,0,Math.PI/2],[FZ*2+1.4,FX+.35,0,-Math.PI/2],[FX*2+1.4,0,-FZ-.35,0],[FX*2+1.4,0,FZ+.35,Math.PI]]){ const q=new THREE.PlaneGeometry(w,H+.6,Math.round(w*1.6),22), p=q.attributes.position;
    for(let i=0;i<p.count;i++){ const u=p.getX(i), v=p.getY(i); p.setZ(i,-Math.abs(nz(u+ry*7,v*1.3))*1.1-(Math.abs(nz(u*3.1,v*2.7+ry))*.25)); } q.computeVertexNormals(); const m=put(q,rock(w,H,w/5,(H+.6)/5),x,(H+.6)/2-.1,z,ry); m.receiveShadow=m.castShadow=true; }
  // the vault, open in the middle to the sky far above, hung with stalactites
  { const W=FX*2+1.6, L=FZ*2+1.6, nx=44, nzs=72, q=new THREE.PlaneGeometry(W,L,nx,nzs).rotateX(Math.PI/2), p=q.attributes.position, idx=[], I=q.index.array; for(let i=0;i<p.count;i++){ const x=p.getX(i), z=p.getZ(i), d=Math.hypot(x,z); p.setY(i,H+Math.abs(nz(x*.8,z*.8))*1.6+Math.max(0,1.2-Math.abs(d-R)*.6)); }
    for(let i=0;i<I.length;i+=3){ const cx=(p.getX(I[i])+p.getX(I[i+1])+p.getX(I[i+2]))/3, cz=(p.getZ(I[i])+p.getZ(I[i+1])+p.getZ(I[i+2]))/3; if(Math.hypot(cx,cz)>R+1) idx.push(I[i],I[i+1],I[i+2]); } q.setIndex(idx); q.computeVertexNormals();
    const m=put(q,rock(W,L,W/6,L/6),0,0,0); m.castShadow=true; { const lip=put(new THREE.RingGeometry(R,R+2.2,56,1).rotateX(Math.PI/2),std({color:0x6f6a62,map:ptex('rock_d',3,3)}),0,H+.9,0); lip.castShadow=true; }   // a clean round lip, so the pool of light on the floor is round const sh=put(new THREE.CylinderGeometry(R+.1,R+.6,9,28,4,true),std({color:0x77736c,map:ptex('rock_d',6,3),...rockN(6,3),side:THREE.BackSide}),0,H+5.2,0); sh.castShadow=true;
    const tite=std({color:0x8f8a82,map:ptex('rock_d',1,2)}); for(let i=0;i<90;i++){ const x=(rnd()*2-1)*(FX-.3), z=(rnd()*2-1)*(FZ-.3); if(Math.hypot(x,z)<R+1.2) continue; const len=.5+rnd()*rnd()*2.6; put(new THREE.ConeGeometry(.1+len*.09,len,7),tite,x,H+.5-len/2,z).rotation.x=Math.PI; } }
  const sky=new THREE.MeshBasicMaterial({color:0x9fc4ff,fog:false}); put(new THREE.CircleGeometry(R+.7,28).rotateX(Math.PI/2),sky,0,H+9.6,0);
  // columns cut from the rock, standing just behind the wall's line, and a band of carved stone at their feet
  { const stone=std({color:0x9a958c,map:ptex('concrete_d',1.5,5),roughness:.8}), cap=std({color:0x8a8478,map:ptex('concrete_d',1,1),roughness:.8});
    for(const s of[-1,1]) for(let z=-13;z<=13;z+=6.5){ const c=shadowOn(put(new THREE.CylinderGeometry(.5,.56,H-1.2,18),stone,s*(FX+.5),(H-1.2)/2,z)); c.receiveShadow=true; put(new THREE.BoxGeometry(1.5,.5,1.5),cap,s*(FX+.5),.25,z); put(new THREE.BoxGeometry(1.6,.6,1.6),cap,s*(FX+.5),H-1.0,z); put(new THREE.CylinderGeometry(.6,.5,.4,18),cap,s*(FX+.5),H-1.5,z); }
    for(const [w,x,z,ry] of [[FZ*2,-FX-.02,0,Math.PI/2],[FZ*2,FX+.02,0,-Math.PI/2],[FX*2,0,-FZ-.02,0],[FX*2,0,FZ+.02,Math.PI]]){ const q=new THREE.PlaneGeometry(w,.55), a=q.attributes.uv; for(let i=0;i<a.count;i++) a.setX(i,a.getX(i)*w/1.2); put(q,cap,x,.275,z,ry).receiveShadow=true; } }
  // braziers in the corners and at mid-court: iron bowls of embers, each a warm light
  const fireM=new THREE.MeshBasicMaterial({color:0xffa24a,fog:false}), iron=std({color:0x1b1a19,roughness:.6,metalness:.6}), fires=[];
  for(const [x,z] of [[-FX+.9,-FZ+.9],[FX-.9,-FZ+.9],[-FX+.9,FZ-.9],[FX-.9,FZ-.9],[-FX+.7,0],[FX-.7,-9.5]]){ shadowOn(put(new THREE.CylinderGeometry(.07,.12,1.25,10),iron,x,.625,z)); shadowOn(put(new THREE.CylinderGeometry(.34,.16,.26,16,1,true),iron,x,1.36,z)).material.side=THREE.DoubleSide; put(new THREE.SphereGeometry(.26,14,8,0,6.3,0,1.2),fireM,x,1.3,z);
    const l=new THREE.PointLight(0xff9a4a,26,34,2); l.position.set(x,1.9,z); g.add(l); fires.push(l); K.cyls.push({cave:true,x,z,r:.3,h:1.5}); }
  // crystals growing from the foot of the walls, lit from inside
  const crys=[0x49e6d6,0x7c8cff,0xb06bff].map(c=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.55,roughness:.2,metalness:0,flatShading:true})), glows=[];
  for(let i=0;i<16;i++){ const s=i%2?1:-1, onX=i<10, a=(rnd()*2-1)*(onX?FZ-1.5:FX-2.5), x=onX?s*(FX-.12):a, z=onX?a:s*(FZ-.12), m=crys[i%3]; for(let k=0;k<5;k++){ const hgt=.35+rnd()*1.1, c=put(new THREE.ConeGeometry(.07+rnd()*.09,hgt,5),m,x+(onX?-s*rnd()*.12:(rnd()-.5)*.6),hgt*.42,z+(onX?(rnd()-.5)*.6:-s*rnd()*.12)); c.rotation.set((rnd()-.5)*.7,rnd()*3,(rnd()-.5)*.7); }
    if(i%4===0){ const l=new THREE.PointLight(m.color,5,9,2); l.position.set(onX?x-s*.5:x,.7,onX?z:z-s*.5); g.add(l); glows.push(l); } }
  courtside(K,g,3.6);
  // the shaft of light down through the opening, and the dust in it
  const shaftM=new THREE.MeshBasicMaterial({color:0xcfe1ff,transparent:true,opacity:.06,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}), shaft=new THREE.Mesh(new THREE.CylinderGeometry(R,R,1,28,1,true),shaftM); shaft.frustumCulled=false; shaft.userData.dyn=true; g.add(shaft); K.noBake.push(shaft);
  const dust=(()=>{ const n=260, a=new Float32Array(n*3); for(let i=0;i<n;i++){ const t=rnd()*6.283, r=Math.sqrt(rnd())*R*.95; a[i*3]=Math.cos(t)*r; a[i*3+1]=rnd()*H; a[i*3+2]=Math.sin(t)*r; } const p=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(a,3)),new THREE.PointsMaterial({color:0xe8f0ff,size:.02,transparent:true,opacity:.5,depthWrite:false,fog:false})); p.userData.dyn=true; g.add(p); K.noBake.push(p); return p; })();
  // d: the way the light travels down the shaft (turned upright); the shaft leans with it
  const UPY=new V3(0,1,0), _T=new V3(), _F=new V3(), sunIn=(d,k,col)=>{ shaft.visible=dust.visible=k>.02; shaftM.color.copy(col); shaftM.opacity=.035+.05*k; _F.set(d.x*H/d.y,0,d.z*H/d.y); _T.set(-d.x*9.6/d.y,H+9.6,-d.z*9.6/d.y); shaft.position.addVectors(_T,_F).multiplyScalar(.5); shaft.scale.set(1,_T.distanceTo(_F),1); shaft.quaternion.setFromUnitVectors(UPY,_T.sub(_F).normalize()); dust.position.set(_F.x*.5,0,_F.z*.5); };
  const hemi=new THREE.HemisphereLight(0x6f83a8,0x3a2e24,.22); g.add(hemi); const bounce=new THREE.PointLight(0xffffff,0,26,2); bounce.position.set(0,1.6,0); g.add(bounce);   // the shaft's light thrown back off the floor
  return {g,hemi,bounce,fires,glows,fireM,sky,sunIn,dust}; }
