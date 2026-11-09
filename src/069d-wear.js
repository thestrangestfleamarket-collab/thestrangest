// THE STREET'S WEAR (owner, 9 Nov 2026: "wear tear. outside decor. vents, draings, sidewalk, etc. tufts"): along Market St and the Hudson promenade, storm drains at the kerb, manhole covers in the road, cracked paving with grass in the cracks and at the walls' foot, stains and gum on the pavement; each kind one instanced draw.
import {SHARED, THREE} from './003-shx.js';
import {DRESS} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLOCK, MODS, TILE} from './006-map-pre.js';
{ const B=SHARED.BOD, G=MODS.bodega.ground, M=1/.84*TILE, XS=B.XS, ZS=B.ZS, x0=XS(BLOCK.x0+2), x1=XS(BLOCK.x1-2), h=(a,b,c)=>{ const v=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return v-Math.floor(v); };
  const zMF=ZS(BLOCK.front), zSW=DRESS.kerb?DRESS.kerb.sw:zMF+4*M, zFAR=DRESS.kerb?DRESS.kerb.far:zSW+10*M, zPF=ZS(BLOCK.prom[1]), zPN=ZS(BLOCK.prom[0]);   // Market St's walk front..kerb, its road; the Hudson's promenade
  const band=(a,b)=>[Math.min(a,b),Math.max(a,b)], WALK=[band(zMF,zSW),band(zPF,zPN)], ROAD=band(zSW,zFAR);
  const tex=(w,f)=>{ const cv=document.createElement('canvas'); cv.width=cv.height=w; f(cv.getContext('2d'),w); const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; };
  const inst=(geo,mat,L,cast)=>{ if(!L.length)return; const me=new THREE.InstancedMesh(geo,mat,L.length), m=new THREE.Matrix4(), q=new THREE.Quaternion(), Y=new THREE.Vector3(0,1,0);
    L.forEach(([x,y,z,r,s=1],i)=>me.setMatrixAt(i,m.compose(new THREE.Vector3(x,y,z),q.setFromAxisAngle(Y,r),new THREE.Vector3(s,s,s)))); me.receiveShadow=true; me.castShadow=!!cast; me.raycast=()=>{}; scene.add(me); return me; };
  const flat=(t,w,d)=>new THREE.MeshLambertMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}), decal=(w,d)=>new THREE.PlaneGeometry(w*M,d*M).rotateX(-Math.PI/2);
  // storm drains: an iron grate in the gutter every so often, the kerb's mouth beside it
  { const g=tex(64,(c,w)=>{ c.fillStyle='#1a1a1c'; c.fillRect(0,0,w,w); c.fillStyle='#4a4a4c'; for(let i=0;i<w;i+=8)c.fillRect(i,0,4,w); c.fillRect(0,0,w,4); c.fillRect(0,w-4,w,4); c.fillStyle='rgba(120,90,60,.35)'; c.fillRect(0,w*.6,w,w*.4); });
    const L=[]; for(let x=x0+6*M;x<x1;x+=14*M+h(x,1,1)*6*M){ const z=zSW+(zFAR>zSW?.35:-.35)*M; L.push([x,G(x,z)+.012,z,0]); }
    inst(decal(.9,.5),new THREE.MeshLambertMaterial({map:g,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),L); }
  // manhole covers down the road
  { const t=tex(128,(c,w)=>{ c.fillStyle='#3a3a3c'; c.beginPath(); c.arc(w/2,w/2,w/2-2,0,7); c.fill(); c.strokeStyle='#5a5a5c'; c.lineWidth=5; for(const r of [w/2-8,w/2-26])c.beginPath(),c.arc(w/2,w/2,r,0,7),c.stroke();
      c.lineWidth=3; for(let i=-3;i<=3;i++){ c.beginPath(); c.moveTo(w/2+i*12,22); c.lineTo(w/2+i*12,w-22); c.stroke(); c.beginPath(); c.moveTo(22,w/2+i*12); c.lineTo(w-22,w/2+i*12); c.stroke(); } c.fillStyle='rgba(140,100,60,.25)'; c.fillRect(w*.55,w*.2,w*.3,w*.5); });
    const L=[]; for(let x=x0+12*M;x<x1;x+=30*M+h(x,2,2)*10*M){ const z=(ROAD[0]+ROAD[1])/2+(h(x,3,3)-.5)*2*M; L.push([x,G(x,z)+.01,z,h(x,4,4)*6]); }
    const mt=new THREE.MeshLambertMaterial({map:t,transparent:true,alphaTest:.5,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}); inst(decal(.75,.75),mt,L); }
  // cracks in the paving, stains and old gum: pictures laid on the walk
  const crackT=tex(128,(c,w)=>{ c.strokeStyle='rgba(30,28,26,.85)'; c.lineCap='round'; const br=(x,y,a,n,lw)=>{ for(let i=0;i<n;i++){ const nx=x+Math.cos(a)*9, ny=y+Math.sin(a)*9; c.lineWidth=lw; c.beginPath(); c.moveTo(x,y); c.lineTo(nx,ny); c.stroke(); x=nx; y=ny; a+=(Math.random()-.5)*.9; lw=Math.max(.8,lw*.92); if(Math.random()<.18&&n-i>3)br(x,y,a+(Math.random()<.5?.9:-.9),Math.floor((n-i)/2),lw*.7); } }; br(8,w/2,0,13,2.4); });
  const stainT=tex(64,(c,w)=>{ const g=c.createRadialGradient(w/2,w/2,2,w/2,w/2,w/2); g.addColorStop(0,'rgba(40,34,30,.5)'); g.addColorStop(.7,'rgba(40,34,30,.25)'); g.addColorStop(1,'rgba(40,34,30,0)'); c.fillStyle=g; c.fillRect(0,0,w,w); });
  const gumT=tex(32,(c,w)=>{ c.fillStyle='rgba(20,20,22,.55)'; c.beginPath(); c.arc(w/2,w/2,w/2-4,0,7); c.fill(); });
  const CR=[], ST=[], GU=[], TU=[];
  for(const [za,zb] of WALK){ for(let x=x0;x<x1;x+=2.2*M){ const r=h(x,za,5); if(r<.32){ const z=za+(.5+h(x,za,6)*(zb-za-1*M)/M)*M, a=h(x,za,7)*6.28, s=.7+h(x,za,8)*.8; CR.push([x,G(x,z)+.006,z,a,s]); if(h(x,za,9)<.6)TU.push([x+Math.cos(a)*.9*M*s,z-Math.sin(a)*.9*M*s,.6]); }
      if(r>.7)ST.push([x+h(x,1,10)*M,G(x,za)+.007,za+(.3+h(x,za,11)*.7)*(zb-za),h(x,za,12)*6,.6+h(x,za,13)*1.2]); if(h(x,za,14)<.5)GU.push([x+h(x,za,15)*2*M,0,za+h(x,za,16)*(zb-za),0,.5+h(x,za,17)*.5]); }
    // grass at the walls' foot and the kerb's edge
    for(let x=x0;x<x1;x+=1.1*M){ if(h(x,za,18)<.28)TU.push([x,za+.12*M,1]); if(h(x,za,19)<.18)TU.push([x,zb-.12*M,.8]); } }
  for(const s of GU)s[1]=G(s[0],s[2])+.007;
  inst(decal(1.6,.5),flat(crackT),CR); inst(decal(1,1),flat(stainT),ST); inst(decal(.12,.12),flat(gumT),GU);
  // the tufts: a few blades crossed, darker at the root
  { const P=[], C=[], blades=7; for(let i=0;i<blades;i++){ const a=i/blades*Math.PI*2+i*.7, r=.03+.05*h(i,1,21), lean=.08+.1*h(i,2,22), ht=.12+.16*h(i,3,23), w=.018, bx=Math.cos(a)*r, bz=Math.sin(a)*r, tx=bx+Math.cos(a)*lean, tz=bz+Math.sin(a)*lean, px=-Math.sin(a)*w, pz=Math.cos(a)*w;
      P.push(bx-px,0,bz-pz, bx+px,0,bz+pz, tx,ht,tz); const g0=[.22,.32,.12], g1=[.42,.58,.22].map(c=>c*(.85+.3*h(i,4,24))); C.push(...g0,...g0,...g1); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P.map(v=>v*M),3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); geo.computeVertexNormals();
    inst(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),TU.map(([x,z,s],i)=>[x,G(x,z),z,h(i,5,25)*6,s*(.8+.5*h(i,6,26))])); }
}
