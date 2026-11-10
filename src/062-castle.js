// THE DUNGEON STAIR: the stone stair down to the dungeon in its clearing in Central Park, where the castle stood (removed, owner 10 Nov 2026); CASTLE keeps the spot.
import {SHARED, THREE} from './003-shx.js';
import {scene} from './004-main.js';
import {CASTLE, FIX, grab, lamps, MODS, SOL, STN, TILE} from './006-map-pre.js';
const gboxS=(b,kind='L',dy=0,ys=1)=>{ '@later'; const X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, Y=z=>SHARED.BOD.YS(z*ys)+dy, {faceTex,bq,C}=SHARED.BOD, {x0,x1,y0,y1,z0,z1}=b; if(b.foot&&z1-z0<.05)return; const k=(b.em?2:1)*ys*(b.tk||1), H=Math.max(1,Math.round((z1-z0)*k));   // (tk: fewer texels to a unit, for a tall wall)
  if(b.em&&kind==='L')kind='B';
  const side=(nx,ny,P,Q,z)=>C(b.fs?b.fs(nx,ny,P,Q,z-z0,nx?.68:.84):nx&&b.fi?b.fi(Q,z):ny&&b.fj?b.fj(P,z):b.c);
  if(z1-z0>=.5){
    for(const nx of [-1,1]){ const x=nx<0?x0:x1; if(y1-y0<.004)continue; bq([X(x),Y(z0),Z(nx<0?y1:y0)],[X(x),Y(z0),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y1:y0)],
      faceTex((y1-y0)*24*k,H,(i,j)=>{ const t=(i+.5)/((y1-y0)*24*k); return side(nx,0,x,nx<0?y1-t*(y1-y0):y0+t*(y1-y0),z1-(j+.5)/k); }),kind); }
    for(const ny of [-1,1]){ const y=ny<0?y0:y1; if(x1-x0<.004)continue; bq([X(ny<0?x0:x1),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z1),Z(y)],[X(ny<0?x0:x1),Y(z1),Z(y)],
      faceTex((x1-x0)*24*k,H,(i,j)=>{ const t=(i+.5)/((x1-x0)*24*k); return side(0,ny,ny<0?x0+t*(x1-x0):x1-t*(x1-x0),y,z1-(j+.5)/k); }),kind); } }
  if(x1-x0>.004&&y1-y0>.004)bq([X(x0),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y0)],[X(x0),Y(z1),Z(y0)],
    faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(b.top?b.top(x0+(i+.5)/24,y0+(j+.5)/24):b.c)),kind); };
const castleMat=(k,map,emap,pl)=>new THREE.MeshLambertMaterial({map,emissiveMap:emap||null,emissive:emap?new THREE.Color(1,1,1):new THREE.Color(0,0,0),alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:pl?[pl]:[]});
{ const X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, [bx0,bx1,by0,by1]=CASTLE.b, r=1.4; MODS.castle={BOUND:{x0:X(bx0-r),x1:X(bx1+r),z0:Z(by0-r),z1:Z(by1+r)}}; MODS.castleIn=()=>false; }   // the castle is gone (owner, 10 Nov 2026), its clearing kept: the stair down, the well and the loft stand in it

await grab('castlestairs',async()=>{ const X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, Y=SHARED.BOD.YS, S=CASTLE.stair, sd=STN.DY, n=S.steps, rise=S.depth/n, rn=(S.y1-S.y0)/n, P=[], Cc=[], c3=new THREE.Color();
  const quad=(a,b,c,d,col)=>{ c3.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(const v of [a,b,c,a,c,d]){ P.push(...v); Cc.push(c3.r,c3.g,c3.b); } };
  const box=(x0,y0,z0,x1,y1,z1,col)=>{ const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[Y(z0),Y(z1)], dk=col.map(v=>v*.8), lt=col.map(v=>Math.min(255,v*1.08));
    quad([a,f,d],[b,f,d],[b,f,c],[a,f,c],lt); quad([a,e,d],[b,e,d],[b,f,d],[a,f,d],col); quad([b,e,c],[a,e,c],[a,f,c],[b,f,c],col); quad([a,e,c],[a,e,d],[a,f,d],[a,f,c],dk); quad([b,e,d],[b,e,c],[b,f,c],[b,f,d],dk); };
  const ST=[88,84,78], ST2=[74,70,66];
  for(let k=0;k<n;k++){ const yA=S.y0+k*rn, yB=S.y0+(k+1)*rn, zt=-(k+1)*rise, zr=-k*rise, [a,b]=[X(S.x0),X(S.x1)];
    quad([a,Y(zt),Z(yB)],[b,Y(zt),Z(yB)],[b,Y(zt),Z(yA)],[a,Y(zt),Z(yA)],(k&1)?ST:ST2);
    quad([b,Y(zt),Z(yA)],[a,Y(zt),Z(yA)],[a,Y(zr),Z(yA)],[b,Y(zr),Z(yA)],ST2.map(v=>v*.82)); }
  for(const x of [S.x0-.2,S.x1])box(x,S.y0,-S.depth,x+.2,S.y1,0,ST2);
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.computeVertexNormals();
  MODS.castleStairCut=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
  const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,clippingPlanes:[MODS.castleStairCut]})); m.receiveShadow=true; m.castShadow=true; scene.add(m); MODS.castleStairMat=m.material;
  for(const lv of ['up','down'])for(const x of [S.x0-.2,S.x1]){ const base=lv==='down'?sd:0; SOL[lv].push([X(x),Z(S.y0),X(x+.2),Z(S.y1)]); FIX[lv].push([X(x),Z(S.y0),base,X(x+.2),Z(S.y1),base+Y(lv==='down'?98:30)]); }
  const L=new THREE.PointLight(new THREE.Color(1,.82,.58),5,7*TILE,1.6); L.position.set(X((S.x0+S.x1)/2),Y(-44),Z((S.y0+S.y1)/2)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L); });
export {castleMat, gboxS};
