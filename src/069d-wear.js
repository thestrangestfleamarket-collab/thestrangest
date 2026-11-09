// THE STREET'S WEAR (owner, 9 Nov 2026: "wear tear. outside decor. vents, draings, sidewalk, etc. tufts"): along Market St and the Hudson promenade, storm drains at the kerb, manhole covers in the road, grass tufts in the painted sidewalk's weedy joints and broken corners and at the walls' foot (the cracks, stains and gum are painted by slabCol); each kind one instanced draw.
import {SHARED, THREE} from './003-shx.js';
import {scene} from './004-main.js';
import {BLOCK, MAPSTAIR, MODS, RING, TILE} from './006-map-pre.js';
import {slabCol} from './014-gamekit.js';
{ const B=SHARED.BOD, G=MODS.bodega.ground, M=1/.84*TILE, XS=B.XS, ZS=B.ZS, x0=XS(BLOCK.x0+2), x1=XS(BLOCK.x1-2), h=(a,b,c)=>{ const v=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return v-Math.floor(v); };
  const zMF=ZS(BLOCK.front), zSW=ZS(B.CURB), zFAR=ZS(B.FAR), zPF=ZS(BLOCK.prom[1]), zPN=ZS(BLOCK.prom[0]);   // Market St's walk front..kerb, its road; the Hudson's promenade
  const band=(a,b)=>[Math.min(a,b),Math.max(a,b)], WALK=[band(zMF,zSW),band(zPF,zPN)], ROAD=band(zSW,zFAR);
  const tex=(w,f)=>{ const cv=document.createElement('canvas'); cv.width=cv.height=w; f(cv.getContext('2d'),w); const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; };
  const inst=(geo,mat,L,cast)=>{ if(!L.length)return; const me=new THREE.InstancedMesh(geo,mat,L.length), m=new THREE.Matrix4(), q=new THREE.Quaternion(), Y=new THREE.Vector3(0,1,0);
    L.forEach(([x,y,z,r,s=1],i)=>me.setMatrixAt(i,m.compose(new THREE.Vector3(x,y,z),q.setFromAxisAngle(Y,r),new THREE.Vector3(s,s,s)))); me.receiveShadow=true; me.castShadow=!!cast; me.raycast=()=>{}; scene.add(me); return me; };
  const decal=(w,d)=>new THREE.PlaneGeometry(w*M,d*M).rotateX(-Math.PI/2);
  // storm drains: an iron grate in the gutter every so often, the kerb's mouth beside it
  { const g=tex(64,(c,w)=>{ c.fillStyle='#1a1a1c'; c.fillRect(0,0,w,w); c.fillStyle='#4a4a4c'; for(let i=0;i<w;i+=8)c.fillRect(i,0,4,w); c.fillRect(0,0,w,4); c.fillRect(0,w-4,w,4); c.fillStyle='rgba(120,90,60,.35)'; c.fillRect(0,w*.6,w,w*.4); });
    const L=[]; for(let x=x0+6*M;x<x1;x+=14*M+h(x,1,1)*6*M){ const z=zSW+(zFAR>zSW?.35:-.35)*M; L.push([x,G(x,z)+.012,z,0]); }
    inst(decal(.9,.5),new THREE.MeshLambertMaterial({map:g,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),L); }
  // manhole covers down the road
  { const t=tex(128,(c,w)=>{ c.fillStyle='#3a3a3c'; c.beginPath(); c.arc(w/2,w/2,w/2-2,0,7); c.fill(); c.strokeStyle='#5a5a5c'; c.lineWidth=5; for(const r of [w/2-8,w/2-26])c.beginPath(),c.arc(w/2,w/2,r,0,7),c.stroke();
      c.lineWidth=3; for(let i=-3;i<=3;i++){ c.beginPath(); c.moveTo(w/2+i*12,22); c.lineTo(w/2+i*12,w-22); c.stroke(); c.beginPath(); c.moveTo(22,w/2+i*12); c.lineTo(w-22,w/2+i*12); c.stroke(); } c.fillStyle='rgba(140,100,60,.25)'; c.fillRect(w*.55,w*.2,w*.3,w*.5); });
    const L=[]; for(let x=x0+12*M;x<x1;x+=30*M+h(x,2,2)*10*M){ const z=(ROAD[0]+ROAD[1])/2+(h(x,3,3)-.5)*2*M; L.push([x,G(x,z)+.01,z,h(x,4,4)*6]); }
    const mt=new THREE.MeshLambertMaterial({map:t,transparent:true,alphaTest:.5,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}); inst(decal(.75,.75),mt,L); }
  // tufts where the painted sidewalk has weeds (slabCol's .w): along its joints and in its broken corners; more at the walls' foot and the kerb's edge
  const TU=[], SL=2.4, mx=w=>(w-XS(0))/TILE, my=w=>(w-ZS(0))/TILE, wx=t=>XS(t), wz=t=>ZS(t), tx0=mx(x0), tx1=mx(x1);
  for(const [za,zb] of WALK){ const ty0=Math.min(my(za),my(zb))+.35, ty1=Math.max(my(za),my(zb))-.35, tryAt=(x,y,s)=>{ if(y<ty0||y>ty1||x<tx0||x>tx1)return; if([MAPSTAIR,...RING.stairs].some(S=>x>=S.x0-.3&&x<S.x1+.3&&y>=S.y0-.3&&y<S.y1+.3))return; const c=slabCol(x,y); if(c&&c.w&&h(x,y,31)<.3)TU.push([wx(x),wz(y),s]); };
    for(let gx=Math.ceil(tx0/SL)*SL;gx<tx1;gx+=SL)for(let y=ty0;y<ty1;y+=1/8)tryAt(gx+(h(gx,y,32)-.5)*.05,y,.7+h(gx,y,33)*.5);
    for(let gy=Math.ceil(ty0/SL)*SL;gy<ty1;gy+=SL)for(let x=tx0;x<tx1;x+=1/8)tryAt(x,gy+(h(x,gy,34)-.5)*.05,.7+h(x,gy,35)*.5);
    for(let gx=Math.ceil(tx0/SL)*SL;gx<tx1;gx+=SL)for(let gy=Math.floor(ty0/SL)*SL;gy<=ty1+SL;gy+=SL)for(let k=0;k<10;k++){ const a=h(gx,gy,36+k)*6.28, r=h(gx,gy,50+k)*.4; tryAt(gx+Math.cos(a)*r,gy+Math.sin(a)*r,1); }
    for(let x=x0;x<x1;x+=1.1*M){ if(h(x,za,18)<.28)TU.push([x,za+.12*M,1]); if(h(x,za,19)<.18)TU.push([x,zb===zSW?zb+.08*M:zb-.12*M,.8]); } }
  // the tufts: a few blades crossed, darker at the root
  { const P=[], C=[], blades=7; for(let i=0;i<blades;i++){ const a=i/blades*Math.PI*2+i*.7, r=.03+.05*h(i,1,21), lean=.08+.1*h(i,2,22), ht=.12+.16*h(i,3,23), w=.018, bx=Math.cos(a)*r, bz=Math.sin(a)*r, tx=bx+Math.cos(a)*lean, tz=bz+Math.sin(a)*lean, px=-Math.sin(a)*w, pz=Math.cos(a)*w;
      P.push(bx-px,0,bz-pz, bx+px,0,bz+pz, tx,ht,tz); const g0=[.22,.32,.12], g1=[.42,.58,.22].map(c=>c*(.85+.3*h(i,4,24))); C.push(...g0,...g0,...g1); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P.map(v=>v*M),3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); geo.computeVertexNormals();
    inst(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),TU.map(([x,z,s],i)=>[x,G(x,z),z,h(i,5,25)*6,s*(.8+.5*h(i,6,26))])); }
}
