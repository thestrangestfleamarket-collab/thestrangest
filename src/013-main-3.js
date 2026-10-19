
  const W=WSUB, {AVE,PLAT,TW,SY0,SY1,TUN0,TUN1}=W, T=.25, OY=W.D1Y, SZ=-UH, SM=MAPSTAIR, HW=(SM.x1-SM.x0)/2, A0=OY-HW, A1=OY+HW, TE=12;
  const XC=((SM.x0+SM.x1)/2-72)*TILE, ZB=(SM.y0+77)*TILE, Y=z=>(z-SZ)*ZU+STN.DY, V=(x,y,z)=>[XC+(y-OY)*TILE,Y(z),ZB-(x-AVE)*TILE];
  const faceTex=(w,h,fn)=>{ w=Math.max(1,Math.round(w)); h=Math.max(1,Math.round(h)); const im=new ImageData(w,h), d=im.data; let ie=null, e=null;
    for(let j=0,k=0;j<h;j++)for(let i=0;i<w;i++,k+=4){ const v=fn(i,j); if(!v)continue; d[k]=Math.round(v[0]); d[k+1]=Math.round(v[1]); d[k+2]=Math.round(v[2]); d[k+3]=255;
      if(v.length>3){ if(!ie){ ie=new ImageData(w,h); e=ie.data; } e[k]=d[k]; e[k+1]=d[k+1]; e[k+2]=d[k+2]; e[k+3]=255; } }
    const mk=cv=>{ const t=new THREE.CanvasTexture(cv); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestMipmapNearestFilter; t.colorSpace=THREE.SRGBColorSpace; return t; };
    return {map:mk(im),em:ie?mk(ie):null}; };
  const quad=(a,b,c,d,tx,lit,shadow=false,chara=false)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2)); g.computeVertexNormals();
    const m=chara?new THREE.MeshBasicMaterial({map:tx.map,alphaTest:.5,side:THREE.DoubleSide,color:new THREE.Color(.66,.69,.76)}):lit?new THREE.MeshLambertMaterial({map:tx.map,alphaTest:.5,side:THREE.DoubleSide,...(tx.em?{emissiveMap:tx.em,emissive:0xffffff,emissiveIntensity:1.6}:{})})
      :new THREE.MeshBasicMaterial({map:tx.map,alphaTest:.5,side:THREE.DoubleSide});
    const me=new THREE.Mesh(g,m); me.castShadow=shadow; me.receiveShadow=true; scene.add(me); return me; };
  const C=v=>v;
  const bq=(a,b,c,d,tx,lit,shadow,chara)=>BATCH.add([...a,...b,...c,...a,...c,...d],[0,0,1,0,1,1,0,0,1,1,0,1],tx.map.image,tx.em?tx.em.image:null,chara?'C':lit?'L':'B');
  function gbox(b,dz=0,ox=0,oy=0,chara=false){ const x0=b.x0+ox, x1=b.x1+ox, y0=b.y0+oy, y1=b.y1+oy, z0=b.z0+dz, z1=b.z1+dz, lit=!b.em, k=b.em?2:1, H=(z1-z0)*k;
    const side=(nx,ny,P,Q,z)=>C(b.fs?b.fs(nx,ny,P-ox,Q-oy,z-z0,nx?.68:.84):nx&&b.fi?b.fi(Q-oy,z-SZ):ny&&b.fj?b.fj(P-ox,z-SZ):b.c);
    for(const nx of [-1,1]){ const x=nx<0?x0:x1; bq(V(x,nx<0?y1:y0,z0),V(x,nx<0?y0:y1,z0),V(x,nx<0?y0:y1,z1),V(x,nx<0?y1:y0,z1),
      faceTex((y1-y0)*24*k,H,(i,j)=>{ const t=(i+.5)/((y1-y0)*24*k); return side(nx,0,x,nx<0?y1-t*(y1-y0):y0+t*(y1-y0),z1-(j+.5)/k); }),lit,true,chara); }
    for(const ny of [-1,1]){ const y=ny<0?y0:y1; bq(V(ny<0?x0:x1,y,z0),V(ny<0?x1:x0,y,z0),V(ny<0?x1:x0,y,z1),V(ny<0?x0:x1,y,z1),
      faceTex((x1-x0)*24*k,H,(i,j)=>{ const t=(i+.5)/((x1-x0)*24*k); return side(0,ny,ny<0?x0+t*(x1-x0):x1-t*(x1-x0),y,z1-(j+.5)/k); }),lit,true,chara); }
    bq(V(x0,y1,z1),V(x1,y1,z1),V(x1,y0,z1),V(x0,y0,z1),faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(b.top?b.top(x0+(i+.5)/24-ox,y0+(j+.5)/24-oy):b.c)),lit,true,chara); }
  const put=(p,name,dz=-UH)=>{ BATCH.tag=OBJ('station',name); p.boxes.forEach(b=>gbox(b,dz)); BATCH.tag=null; };
  const floor=(x0,y0,x1,y1,z,col)=>quad(V(x0,y1,z+SZ),V(x1,y1,z+SZ),V(x1,y0,z+SZ),V(x0,y0,z+SZ),faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y0+(j+.5)/24))),true,false);
  const PB=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6), cutaway=(me,nx,nz,foot,pl=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6))=>{ me.material.clippingPlanes=[pl]; cutWalls.push({pl,nx:nz,nz:-nx,foot:Y(foot+SZ),me}); return me; };
  const wallY=(x,y0,y1,z0,z1,paint)=>quad(V(x,y0,z0+SZ),V(x,y1,z0+SZ),V(x,y1,z1+SZ),V(x,y0,z1+SZ),faceTex((y1-y0)*24,z1-z0,(i,j)=>C(paint(y0+(i+.5)/24,z1-j-.5))),true);
  const wallX=(y,x0,x1,z0,z1,paint)=>quad(V(x0,y,z0+SZ),V(x1,y,z0+SZ),V(x1,y,z1+SZ),V(x0,y,z1+SZ),faceTex((x1-x0)*24,z1-z0,(i,j)=>C(paint(x0+(i+.5)/24,z1-j-.5))),true);
  const solid=(x0,y0,x1,y1,zt)=>{ const a=V(x0,y0,0), b=V(x1,y1,0), q=[Math.min(a[0],b[0]),Math.min(a[2],b[2]),Math.max(a[0],b[0]),Math.max(a[2],b[2])]; solids.push(q); fixed.push([q[0],q[1],0,q[2],q[3],Math.max(.05,zt*ZU)]); };
  const stile=W.wallPaint('stile'), tubeP=W.wallPaint('tubeP'), conc=(u,z)=>sh(concreteCol(u,z/24),.9), dark=()=>[14,14,16];
  floor(AVE,SY0,PLAT,SY1,0,W.platformCol);
  wallY(PLAT,SY0,SY1,-32,0,(u,z)=>W.platEdge(u,z));
  floor(PLAT,SY0-TE,TW,SY1+TE,-32,W.tracksCol);
  for(const [a,b] of [[SY0,A0],[A1,SY1]])cutaway(wallY(AVE,a,b,0,UH,(u,z)=>stile(1,0,AVE,u,z)),1,0,8,PB);
  cutaway(wallY(TW,SY0,SY1,-32,UH,(u,z)=>tubeP(-1,0,TW,u,z)),-1,0,-24);
  const c0=(TUN0+TUN1)/2, half=(TUN1-TUN0)/2, inArch=(u,z)=>{ const d=Math.abs(u-c0)/half; return d<1&&z+32<40+88*Math.sqrt(1-d*d); };
  for(const y of [SY0,SY1]){ const n=y===SY0?1:-1; cutaway(wallX(y,AVE,PLAT,0,UH,(u,z)=>stile(0,n,u,y,z)),0,n,8); cutaway(wallX(y,PLAT,TW+2*T,-32,UH,(u,z)=>inArch(u,z)?null:stile(0,n,u,y,z)),0,n,-24); }
  for(const [a,b] of [[SY0-TE,SY0],[SY1,SY1+TE]])for(const x of [TUN0,TUN1])cutaway(wallY(x,a,b,-32,56,conc),x===TUN0?1:-1,0,-24);
  for(const y of [SY0-TE,SY1+TE])cutaway(wallX(y,TUN0,TUN1,-32,56,dark),0,y<SY0?1:-1,-24);
  for(const [a,b] of W.TSTEPS)for(let k=0;k<3;k++){ const c=[150,146,138]; gbox({x0:PLAT+k*.25,x1:PLAT+(k+1)*.25,y0:a,y1:b,z0:-UH-32,z1:-UH-8*(k+1),c,top:()=>c,fi:()=>sh(c,.62),fj:()=>sh(c,.8)}); }
  const CX=TW-8.03, BX=TW-8.05;
  for(const r of [-7.75,7.05]){ put(W.column(CX,OY+r),'column',0); solid(CX,OY+r,CX+.7,OY+r+.7,UH); }
  for(const r of [-11.2,-6.5,4,8.4]){ put(W.bench(BX,OY+r),'bench',0); solid(BX,OY+r,BX+.66,OY+r+2.8,24); }
  const MX=AVE+.08, MY=OY+2.5; put(W.mach(MX,MY),'passport machine'); solid(AVE,MY,MX+.54,MY+.7,46);
  for(const r of [-12,12]){ put(W.bin(BX+.3,OY+r),'trash bin'); solid(BX+.05,OY+r-.25,BX+.55,OY+r+.25,30); }
  put(W.litSign(AVE+1.6,OY,'TO STREET ^'),'sign');
  put(W.gate(AVE+3,SY0,1),'no entry gate'); put(W.gate(AVE+3,SY1,0),'no entry gate');
  put(W.signal(TUN0+.35,SY0-1.4,1),'signal',-UH-32); put(W.signal(TUN0+.35,SY1+1.4,0),'signal',-UH-32);
  BATCH.tag=OBJ('station','train car'); W.carBoxes(0,0).forEach(b=>gbox(b,-UH-32,W.TRACKS[0],OY,true)); BATCH.tag=null; solid(W.TRACKS[0]-W.CARW,OY-W.CARL/2,W.TRACKS[0]+W.CARW,OY+W.CARL/2,96-32);
  for(let y=SY0+3.2;y<SY1;y+=6.4)for(const x of [AVE+2.6,AVE+8.4]){ const L=new THREE.PointLight(new THREE.Color(.5,.54,.64),LAMPI,10*TILE,LAMPD); L.position.set(...V(x,y,SZ+88)); scene.add(L); lamps.push(L); }
  solid(AVE-1,SY0-1,AVE,A0,UH); solid(AVE-1,A1,AVE,SY1+1,UH); solid(AVE,SY0-1,PLAT,SY0,UH); solid(AVE,SY1,PLAT,SY1+1,UH);
  solid(TW,SY0-TE,TW+1,SY1+TE,UH); solid(TUN0-1,SY0-TE,TUN0,SY0,UH); solid(TUN0-1,SY1,TUN0,SY1+TE,UH); solid(TUN0,SY0-TE-1,TUN1,SY0-TE,UH); solid(TUN0,SY1+TE,TUN1,SY1+TE+1,UH);
  { let y=SY0; for(const [a,b] of W.TSTEPS){ if(a>y)solid(PLAT-.05,y,PLAT+.05,a,0); y=b; } if(y<SY1)solid(PLAT-.05,y,PLAT+.05,SY1,0); }
  { const a=V(TW+.5,SY0-TE,0), b=V(AVE,SY1+TE,0); BOUND={x0:a[0],x1:b[0],z0:a[2],z1:(SM.y1+77)*TILE+.5}; }
  BATCH.build((k,map,emap)=>k==='C'?new THREE.MeshBasicMaterial({map,alphaTest:.5,side:THREE.DoubleSide,color:new THREE.Color(.66,.69,.76)}):k==='B'?new THREE.MeshBasicMaterial({map,alphaTest:.5,side:THREE.DoubleSide})
    :new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.6}:{})}));
  for(const [r,k] of [[-10.3,0],[-5,1],[5.2,2],[10,0]])put(W.poster(AVE+.01,OY+r,k),'poster');
  for(const r of [-8,7.7])put(W.namePlate(AVE+.01,OY+r,'MARKET ST'),'name plate');
  for(const [a,b] of [[SY0+.2,A0-.3],[A1+.3,SY1-.2]])put(W.cables(AVE+.01,a,b),'cables');
  BATCH.build((k,map)=>new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:[PB]})); for(const me of BATCH.all(BATCH.meshes,'L'))cutWalls.push({pl:PB,nx:0,nz:-1,foot:Y(SZ+8),me});
  const TX=z=>AVE+(ZB-z)/TILE, TY=x=>OY+(x-XC)/TILE, at=(x,y)=>{ const p=V(x,y,0); return {x:p[0],z:p[2]}; }, box=(x0,y0,x1,y1)=>{ const a=at(x0,y0), b=at(x1,y1); return {x0:Math.min(a.x,b.x),x1:Math.max(a.x,b.x),z0:Math.min(a.z,b.z),z1:Math.max(a.z,b.z)}; };
  const M=METRO={V,Y,TX,TY,at,DY:Y(SZ),OY,A0,A1,AVE,PLAT,XC,ZB,MACH:{x:MX+.27,y:MY+.35}};
  M.inside=(x,z)=>x>BOUND.x0&&x<BOUND.x1&&z>BOUND.z0&&z<ZB+.01;
  M.ground=(x,z)=>{ const tx=TX(z); return Y(SZ+(tx<PLAT?0:W.fzAt(tx,TY(x)))); };
  M.plat=at(AVE+4.2,OY-8.5); M.foot=at(AVE+1.1,OY); M.street={x:XC,z:(SM.y1+77)*TILE+1.4*TILE};
  M.lane=box(AVE+.6,SY0+.6,PLAT-.2,SY1-.6); M.edge=box(PLAT-.7,SY0+.6,PLAT-.15,SY1-.6);
  M.rats=[[M.lane,AVE+4.6,OY-9.6],[M.lane,AVE+3.6,OY+10.6],[M.edge,PLAT-.4,OY-4.6]].map(([lane,x,y])=>({lane,...at(x,y)}));
  M.path=[[SM.y1-.3,0],[SM.y0+.3,1]].map(([y,d])=>d?{x:XC,z:(y+77)*TILE,lv:'down'}:{x:XC,z:(y+77)*TILE}).concat([at(AVE+1.2,OY),at(AVE+4,OY-4),M.plat].map(p=>({...p,lv:'down'})));
