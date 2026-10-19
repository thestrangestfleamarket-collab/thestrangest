
  const W=WSUB, {AVE,PLAT,TW,SY0,SY1,END,TUN0,TUN1}=W, T=.25, OX=(AVE+PLAT)/2, OY=W.D1Y, SZ=-UH;
  const X=x=>(x-OX)*TILE+STN.DX, Z=y=>(y-OY)*TILE+STN.DZ, Y=z=>(z-SZ)*ZU+STN.DY;
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
    for(const nx of [-1,1]){ const x=nx<0?x0:x1; bq([X(x),Y(z0),Z(nx<0?y1:y0)],[X(x),Y(z0),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y1:y0)],
      faceTex((y1-y0)*24*k,H,(i,j)=>{ const t=(i+.5)/((y1-y0)*24*k); return side(nx,0,x,nx<0?y1-t*(y1-y0):y0+t*(y1-y0),z1-(j+.5)/k); }),lit,true,chara); }
    for(const ny of [-1,1]){ const y=ny<0?y0:y1; bq([X(ny<0?x0:x1),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z1),Z(y)],[X(ny<0?x0:x1),Y(z1),Z(y)],
      faceTex((x1-x0)*24*k,H,(i,j)=>{ const t=(i+.5)/((x1-x0)*24*k); return side(0,ny,ny<0?x0+t*(x1-x0):x1-t*(x1-x0),y,z1-(j+.5)/k); }),lit,true,chara); }
    bq([X(x0),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y0)],[X(x0),Y(z1),Z(y0)],
      faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(b.top?b.top(x0+(i+.5)/24-ox,y0+(j+.5)/24-oy):b.c)),lit,true,chara); }
  const floor=(x0,y0,x1,y1,z,col)=>quad([X(x0),Y(z+SZ),Z(y1)],[X(x1),Y(z+SZ),Z(y1)],[X(x1),Y(z+SZ),Z(y0)],[X(x0),Y(z+SZ),Z(y0)],faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y0+(j+.5)/24))),true,false);
  const cutaway=(me,nx,nz,foot)=>{ const pl=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); me.material.clippingPlanes=[pl]; cutWalls.push({pl,nx,nz,foot:Y(foot+SZ),me}); return me; };
  const wallY=(x,y0,y1,z0,z1,paint)=>quad([X(x),Y(z0+SZ),Z(y0)],[X(x),Y(z0+SZ),Z(y1)],[X(x),Y(z1+SZ),Z(y1)],[X(x),Y(z1+SZ),Z(y0)],faceTex((y1-y0)*24,z1-z0,(i,j)=>C(paint(y0+(i+.5)/24,z1-j-.5))),true);
  const wallX=(y,x0,x1,z0,z1,paint)=>quad([X(x0),Y(z0+SZ),Z(y)],[X(x1),Y(z0+SZ),Z(y)],[X(x1),Y(z1+SZ),Z(y)],[X(x0),Y(z1+SZ),Z(y)],faceTex((x1-x0)*24,z1-z0,(i,j)=>C(paint(x0+(i+.5)/24,z1-j-.5))),true);
  const solid=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt+SZ)-STN.DY)]); };
  const stile=W.wallPaint('stile'), tubeP=W.wallPaint('tubeP'), conc=(u,z)=>sh(concreteCol(u,z/24),.9);
  floor(AVE,SY0,PLAT,END,0,W.platformCol);
  wallY(PLAT,SY0,SY1,-32,0,(u,z)=>W.platEdge(u,z));
  floor(PLAT,SY0-12,TW,SY1+12,-32,W.tracksCol);
  cutaway(wallY(AVE,SY0,END-8,0,UH,(u,z)=>stile(1,0,AVE,u,z)),1,0,8); cutaway(wallY(AVE,END-8,END,0,UH,conc),1,0,8);
  cutaway(wallY(TW,SY0,SY1,-32,UH,(u,z)=>tubeP(-1,0,TW,u,z)),-1,0,-24);
  cutaway(wallX(SY0,AVE,PLAT,0,UH,(u,z)=>stile(0,1,u,SY0,z)),0,1,8); cutaway(wallX(END,AVE,PLAT,0,UH,(u,z)=>u>=-29&&u<-25?null:conc(u,z)),0,-1,8); cutaway(wallY(PLAT,SY1,END,0,UH,conc),-1,0,8);
  const c0=(TUN0+TUN1)/2, half=(TUN1-TUN0)/2, inArch=(u,z)=>{ const d=Math.abs(u-c0)/half; return d<1&&z+32<40+88*Math.sqrt(1-d*d); };
  for(const y of [SY0,SY1])cutaway(wallX(y,PLAT,TW+2*T,-32,UH,(u,z)=>inArch(u,z)?null:stile(0,y===SY0?1:-1,u,y,z)),0,y===SY0?1:-1,-24);
  for(const [a,b] of [[SY0-12,SY0],[SY1,SY1+12]])for(const x of [TUN0,TUN1])cutaway(wallY(x,a,b,-32,56,conc),x===TUN0?1:-1,0,-24);
  for(const [a,b] of W.TSTEPS)for(let k=0;k<3;k++){ const c=[150,146,138]; gbox({x0:PLAT+k*.25,x1:PLAT+(k+1)*.25,y0:a,y1:b,z0:-UH-32,z1:-UH-8*(k+1),c,top:()=>c,fi:()=>sh(c,.62),fj:()=>sh(c,.8)}); }
  for(const a of [7.14,17.53]){ const p=W.column(TW-8.03,SY0+a); BATCH.tag=OBJ('station','column'); p.boxes.forEach(b=>gbox(b)); solid(TW-8.03,SY0+a,TW-8.03+.7,SY0+a+.7,UH); }
  for(const a of [3.46,8.83,13.7,19.3]){ const x=TW-7.72-.33, p=W.bench(x,SY0+a); BATCH.tag=OBJ('station','bench'); p.boxes.forEach(b=>gbox(b)); solid(x,SY0+a,x+.66,SY0+a+2.8,24); }
  BATCH.tag=OBJ('station','sign'); W.litSign(AVE+3,SY1-.9,'TO STREET ^').boxes.forEach(b=>gbox(b,-UH));
  BATCH.tag=OBJ('station','signal'); W.signal(TUN0+.35,SY0-1.4,1).boxes.forEach(b=>gbox(b,-UH-32)); BATCH.tag=OBJ('station','signal'); W.signal(TUN0+.35,SY1+1.4,0).boxes.forEach(b=>gbox(b,-UH-32));
  BATCH.tag=OBJ('station','train car'); W.carBoxes(0,0).forEach(b=>gbox(b,-UH-32,W.TRACKS[0],W.D1Y,true)); BATCH.tag=null; solid(W.TRACKS[0]-W.CARW,W.D1Y-W.CARL/2,W.TRACKS[0]+W.CARW,W.D1Y+W.CARL/2,96-32);
  for(let y=SY0+3.2;y<SY1;y+=6.4)for(const x of [AVE+2.6,AVE+8.4]){ const L=new THREE.PointLight(new THREE.Color(.5,.54,.64),LAMPI,10*TILE,LAMPD); L.position.set(X(x),Y(SZ+88),Z(y)); scene.add(L); lamps.push(L); }
  solid(AVE-1,SY0-12,AVE,END,UH); solid(TW,SY0-12,TW+1,SY1+12,UH); solid(AVE,SY0-1,PLAT,SY0,UH); solid(AVE,END,-29,END+1,UH); solid(-25,END,PLAT,END+1,UH);
  solid(PLAT,SY1,PLAT+.1,END,UH); solid(TUN0-1,SY0-12,TUN0,SY0,UH); solid(TUN0-1,SY1,TUN0,SY1+12,UH);
  { let y=SY0; for(const [a,b] of W.TSTEPS){ if(a>y)solid(PLAT-.05,y,PLAT+.05,a,0); y=b; } if(y<SY1)solid(PLAT-.05,y,PLAT+.05,SY1,0); }
  BOUND={x0:X(AVE),x1:X(TW),z0:Z(SY0-12),z1:Z(END)};
  BATCH.build((k,map,emap)=>k==='C'?new THREE.MeshBasicMaterial({map,alphaTest:.5,side:THREE.DoubleSide,color:new THREE.Color(.66,.69,.76)}):k==='B'?new THREE.MeshBasicMaterial({map,alphaTest:.5,side:THREE.DoubleSide})
    :new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.6}:{})}));
  groundY=(x,z)=>{ const gx=(x-STN.DX)/TILE+OX, gy=(z-STN.DZ)/TILE+OY; if(gx<PLAT)return 0; const st=W.TSTEPS.find(([a,b])=>gy>=a&&gy<b); if(st&&gx<PLAT+.75)return -(8*(1+Math.floor((gx-PLAT)/.25)))*ZU; return -32*ZU; };
}
}
MODS.station=METRO?{BOUND,ground:(x,z)=>METRO.inside(x,z)?METRO.ground(x,z):STN.DY,DY:METRO.DY,plat:METRO.plat,lane:METRO.lane,path:METRO.path}:{BOUND,ground:(x,z)=>groundY(x,z)+STN.DY,DY:STN.DY,plat:{x:-12.4+LAY.o('subway').x*TILE,z:-24.9+LAY.o('subway').y*TILE}};
 for(const w of cutWalls.slice(c0))if(!w.when)w.when=()=>LVL==='down'; for(const L of SHL)L.removeFromParent(); });
await grab('bodega',async()=>{ const solids=SOL.up, fixed=FIX.up, SHL=[]; let BOUND, groundY; const c0=cutWalls.length;
BOD={meshes:[], walls:{}, lamps:[]};
{
