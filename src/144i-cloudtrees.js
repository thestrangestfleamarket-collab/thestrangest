// THE CLOUD TREES (owner, 5 Nov 2026, of the mockups: "A & C"): the puff oak and the puff pine, soft puffs lit like the sky's clouds that drift in the wind and part when you walk into them; placed from data/world.json's cloudTrees (none yet; ?cloudtrees=demo stands a few by you).
import {SHARED, THREE} from './003-shx.js';
import {pos} from './003b-systems.js';
import {scene} from './004-main.js';
import {LEVEL, QS, SYS, TILE} from './006-map-pre.js';
const CLOUDTREES={list:[]}; window.CLOUDTREES=CLOUDTREES;
{ const T=TILE, WU=T/.84, NEAR=60*WU, hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  const GREEN=[[.37,.6,.32],[.43,.67,.36],[.5,.72,.4],[.31,.54,.28]];
  const puffMat=()=>new THREE.MeshLambertMaterial({color:0xffffff});   // the game's own look shades it, as it does the clouds
  // a tree's puffs in metres about its foot: [x,y,z,r,flow,colour]
  const OAK=seed=>{ '@later'; const P=[]; for(let i=0;i<46;i++){ const u=hs(seed+i,1)*6.28, v=Math.acos(2*hs(seed+i,2)-1), r=.75+hs(seed+i,3)*.4;
      P.push([Math.sin(v)*Math.cos(u)*2.5*r,4.6+Math.cos(v)*1.7*r,Math.sin(v)*Math.sin(u)*2.5*r,.55+hs(seed+i,4)*.6,1,Math.floor(hs(seed,i)*4)]); } return {P,trunk:[3.4,.28,.45]}; };
  const PINE=seed=>{ '@later'; const P=[]; for(let t=0;t<5;t++){ const y=2.2+t*1.15, rad=2.2-t*.42, n=10-t; for(let k=0;k<n;k++){ const u=k/n*6.28+t;
      P.push([Math.cos(u)*rad,y+hs(seed+t,k)*.3,Math.sin(u)*rad,.55-t*.05,.6+t*.25,Math.floor(hs(seed,t*10+k)*4)]); } P.push([0,y+.2,0,.7-t*.08,.5,t%4]); } return {P,trunk:[2.2,.2,.35]}; };
  const KINDS={oak:OAK,pine:PINE};
  let LEAF=null, BARK=null; const M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), SC=new THREE.Vector3(), C=new THREE.Color();
  const build=list=>{ if(LEAF){ scene.remove(LEAF,BARK); LEAF.dispose(); BARK.dispose(); LEAF=BARK=null; } CLOUDTREES.list=[]; if(!list.length)return;
    const trees=list.map((o,i)=>{ '@later'; const K=(KINDS[o.kind]||OAK)(i*17+3), s=(o.s||1)*WU, x=o.wx??SHARED.BOD.XS(o.x), z=o.wz??SHARED.BOD.ZS(o.y), y=SHARED.groundY?SHARED.groundY(x,z):0;
      return {x,y,z,s,trunk:K.trunk,puffs:K.P.map(p=>({b:[p[0],p[1],p[2]],r:p[3],flow:p[4],c:p[5],off:[0,0,0],vel:[0,0,0],ph:hs(i,p[0]*7+p[2])*6.28}))}; });
    const n=trees.reduce((a,t)=>a+t.puffs.length,0);
    LEAF=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,3),puffMat(),n); LEAF.castShadow=LEAF.receiveShadow=true; LEAF.instanceMatrix.setUsage(THREE.DynamicDrawUsage); LEAF.frustumCulled=false;
    BARK=new THREE.InstancedMesh(new THREE.CylinderGeometry(1,1,1,10).translate(0,.5,0),new THREE.MeshLambertMaterial({color:new THREE.Color(.42,.31,.23)}),trees.length); BARK.castShadow=BARK.receiveShadow=true;
    let k=0; trees.forEach((t,i)=>{ const [h,r0,r1]=t.trunk; M4.compose(V.set(t.x,t.y,t.z),Q.identity(),SC.set((r0+r1)*.5*t.s,h*t.s,(r0+r1)*.5*t.s)); BARK.setMatrixAt(i,M4);
      for(const p of t.puffs){ p.i=k++; const g=GREEN[p.c]; LEAF.setColorAt(p.i,C.setRGB(g[0],g[1],g[2],THREE.SRGBColorSpace)); place(t,p,0); } });
    LEAF.instanceMatrix.needsUpdate=true; if(LEAF.instanceColor)LEAF.instanceColor.needsUpdate=true; scene.add(LEAF,BARK); CLOUDTREES.list=trees; };
  const place=(t,p,time)=>{ '@later'; const f=p.flow, wx=Math.sin(time*.7+p.ph)*.18*f, wy=Math.sin(time*1.1+p.ph*1.3)*.06*f, wz=Math.cos(time*.5+p.ph)*.12*f;
    M4.compose(V.set(t.x+(p.b[0]+p.off[0]+wx)*t.s,t.y+(p.b[1]+p.off[1]+wy)*t.s,t.z+(p.b[2]+p.off[2]+wz)*t.s),Q.identity(),SC.setScalar(p.r*t.s)); LEAF.setMatrixAt(p.i,M4); };
  // each frame, the trees near you flow in the wind; you push the puffs you walk into, and they spring back
  let time=0; SYS.add('life',dt=>{ if(!LEAF||!LEAF.visible||SHARED.LVL!=='up')return; time+=dt; dt=Math.min(dt,.05); let any=false;
    for(const t of CLOUDTREES.list){ if(Math.hypot(t.x-pos.x,t.z-pos.z)>NEAR)continue; any=true;
      const yx=(pos.x-t.x)/t.s, yy=((SHARED.py||0)-t.y)/t.s+1, yz=(pos.z-t.z)/t.s;
      for(const p of t.puffs){ const o=p.off, v=p.vel; let fx=-o[0]*14, fy=-o[1]*14, fz=-o[2]*14;
        const dx=p.b[0]+o[0]-yx, dy=p.b[1]+o[1]-yy, dz=p.b[2]+o[2]-yz, d=Math.hypot(dx,dy*.6,dz), R0=1+p.r;
        if(d<R0&&d>1e-4){ const k=(R0-d)*60/d; fx+=dx*k; fy+=Math.max(0,dy)*k*.4; fz+=dz*k; }
        v[0]+=(fx-v[0]*5)*dt; v[1]+=(fy-v[1]*5)*dt; v[2]+=(fz-v[2]*5)*dt; o[0]+=v[0]*dt; o[1]+=v[1]*dt; o[2]+=v[2]*dt; place(t,p,time); } }
    if(any)LEAF.instanceMatrix.needsUpdate=true; },'144i-cloudtrees');
  CLOUDTREES.build=build;
  SYS.onStart(()=>{ const L=(LEVEL.cloudTrees||[]).slice();
    if(QS.get('cloudtrees')==='demo')for(let i=0;i<6;i++){ const a=i/6*6.28; L.push({kind:i%2?'pine':'oak',wx:pos.x+Math.cos(a)*9*WU,wz:pos.z+Math.sin(a)*9*WU}); }
    build(L); },'144i-cloudtrees'); }
