// THE PARK'S POLYFORK THINGS: data/world.json's things with k 'p:<key>' (data/parkpf.json, tools/park-pf-bake.py), baked a patch of ground at a time into still meshes; only near patches drawn, small things nearer still, shadows close by; the big ones solid.
import {SHARED, THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {PARK, pos} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, MAPG, SOL, SYS, TILE} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
const PARKPF={done:false,things:0,patches:[],tris:0,solids:0,moved:0,skipped:[]};
{ const DATA=__LAZY__("data/parkpf.json"), CELL=24, FAR=72, NEAR=36, SHD=28;
  const SOLID=new Set(['boatshed','conservatory','greenhouse','toilet','seatoilet','refresh','coffee','newsstand','icecream','hotdog','founder','plazafountain','campusfountain','zen','trailmap','trailhead','lion','picnictable','library']);
  const WET=new Set(['raft','canoe','kayak','skiff','duck','dock','launch','lifebuoy','archbridge','creekbridge','woodbridge','logbridge','trestle']);
  const mat=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});
  const model=D=>{ if(D.m)return D.m; const q=I16(D.p), n=D.n, P=new Float32Array(n*3), C=new Float32Array(n*3), col=B64(D.c), c=new THREE.Color();
    for(let i=0;i<n*3;i++)P[i]=(q[i]+32500)*D.sc+D.lo[i%3];
    for(let i=0;i<n*3;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    return D.m={P,C,I:D.i32?new Uint32Array(B64(D.i).buffer):U16(D.i),n}; };
  const build=D=>{ const B=SHARED.BOD, T=TILE, M=T/.84, Pk=PARK, BK=Pk.brook, [LX,LY,LR]=Pk.lake||[0,0,0], root=MAPG.park||scene, sol0=SOL.up.slice();
    const wet=(x,y)=>(FOUNT.lake&&FOUNT.lake(x,y)<.6)||(BK&&BK.wet&&BK.wet(x,y))||Math.hypot(x-LX,y-LY)<LR+.6;
    const hit=(x0,z0,x1,z1)=>{ for(const s of sol0)if(s[0]<x1&&s[2]>x0&&s[1]<z1&&s[3]>z0)return true; return false; };
    const water=(x,z)=>{ const b=FOUNT.bedAt&&FOUNT.bedAt(x,z); return b!=null?FOUNT.LV:-.25*T; };
    const cells=new Map();
    for(const o of LEVEL.things||[]){ if(!String(o.k).startsWith('p:'))continue; const k=o.k.slice(2), Dk=D[k]; if(!Dk){ PARKPF.skipped.push(k); continue; } PARKPF.things++;
      const a=o.rot||0, ca=Math.cos(a), sa=Math.sin(a), [sx,sy,sz]=Dk.size, ex=(Math.abs(ca)*sx+Math.abs(sa)*sz)/2, ez=(Math.abs(sa)*sx+Math.abs(ca)*sz)/2;
      let mx=o.x, my=o.y; const free=(x,y)=>{ const X=B.XS(x), Z=B.ZS(y); return (WET.has(k)||!wet(x,y))&&!hit(X-ex*M*.8,Z-ez*M*.8,X+ex*M*.8,Z+ez*M*.8); };
      if(!free(mx,my)){ let f=null; for(let r=.6;r<=3&&!f;r+=.6)for(let i=0;i<8&&!f;i++){ const u=mx+Math.cos(i*Math.PI/4)*r, v=my+Math.sin(i*Math.PI/4)*r; if(free(u,v))f=[u,v]; }
        if(!f){ PARKPF.skipped.push(o.k+'@'+o.x+','+o.y); continue; } [mx,my]=f; PARKPF.moved++; }
      const x=B.XS(mx), z=B.ZS(my), y=o.float?water(x,z):(SHARED.groundY?SHARED.groundY(x,z):0);
      const big=Math.max(sx,sz)>=2.4||sy>=2.5, key=Math.floor(mx/CELL)+','+Math.floor(my/CELL)+(big?'b':'s'); let c=cells.get(key); if(!c)cells.set(key,c={big,L:[],n:0,t:0});
      const m=model(Dk); c.L.push({m,x,y,z,ca,sa}); c.n+=m.n; c.t+=m.I.length;
      if(SOLID.has(k)){ const s=[x-ex*M,z-ez*M,x+ex*M,z+ez*M]; SOL.up.push(s); FIX.up.push([s[0],s[1],y,s[2],s[3],y+sy*M]); PARKPF.solids++; } }
    for(const c of cells.values()){ const P=new Float32Array(c.n*3), C=new Float32Array(c.n*3), I=c.n>65535?new Uint32Array(c.t):new Uint16Array(c.t); let v=0, j=0;
      for(const {m,x,y,z,ca,sa} of c.L){ for(let i=0;i<m.n;i++){ const px=m.P[i*3]*M, py=m.P[i*3+1]*M, pz=m.P[i*3+2]*M, w=(v+i)*3; P[w]=x+px*ca+pz*sa; P[w+1]=y+py; P[w+2]=z-px*sa+pz*ca; }
        C.set(m.C,v*3); for(let i=0;i<m.I.length;i++)I[j+i]=m.I[i]+v; v+=m.n; j+=m.I.length; }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setIndex(new THREE.BufferAttribute(I,1)); g.computeBoundingSphere();
      const me=new THREE.Mesh(g,mat); me.matrixAutoUpdate=false; me.receiveShadow=true; me.castShadow=false; me.visible=false; me.userData.parkpf=1; root.add(me);
      const bs=g.boundingSphere; PARKPF.patches.push({me,big:c.big,x:bs.center.x,z:bs.center.z,r:bs.radius,tris:c.t/3}); PARKPF.tris+=c.t/3; }
    PARKPF.done=true; cull(); };
  let cullT=0; const cull=()=>{ const up=SHARED.LVL==='up', T=TILE; for(const p of PARKPF.patches){ const d=Math.hypot(p.x-pos.x,p.z-pos.z)-p.r; p.me.visible=up&&d<(p.big?FAR:NEAR)*T; p.me.castShadow=p.me.visible&&p.big&&d<SHD*T; } };
  SYS.add('places',dt=>{ if(!PARKPF.done||(cullT-=dt)>0)return; cullT=.4; cull(); },'111fe-parkpf cull');
  PARK.later(()=>{ DATA().then(build).catch(e=>console.warn('PARKPF',e)); });
  window.PARKPFCHK=()=>{ const B=SHARED.BOD, solid=(x,z)=>SOL.up.some(s=>x>s[0]&&x<s[2]&&z>s[1]&&z<s[3]), mall=[]; for(let y=-20;y<170;y+=4)mall.push(solid(B.XS(112-3*Math.sin(2*Math.PI*3*(y+37)/217)),B.ZS(y)));
    const K=LEVEL.parkPlaces.brook.pts[0], L=FOUNT.S.L; return {want:LEVEL.things.filter(o=>String(o.k).startsWith('p:')).length,mallBlocked:mall.filter(Boolean).length,boats:LEVEL.things.filter(o=>o.float&&FOUNT.bedAt(B.XS(o.x),B.ZS(o.y))!=null).length,brookStart:FOUNT.lake(K[0],K[1]),past:[L.cx>PARK.x1,L.cy>PARK.y1]}; };
  window.PARKPFDBG=()=>({done:PARKPF.done,things:PARKPF.things,patches:PARKPF.patches.length,tris:PARKPF.tris,drawn:PARKPF.patches.filter(p=>p.me.visible).reduce((a,p)=>a+p.tris,0),shadow:PARKPF.patches.filter(p=>p.me.castShadow).length,hid:PARKPF.patches.filter(p=>!p.me.visible).length,solids:PARKPF.solids,moved:PARKPF.moved,skipped:PARKPF.skipped});
}
