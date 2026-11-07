// THE PARK'S POLYFORK THINGS: data/world.json's things with k 'p:<key>' (data/parkpf.json, tools/park-pf-bake.py), baked a patch of ground at a time into still meshes; only near patches drawn, small things nearer still, shadows close by; the big ones solid; the lamps lit at night.
import {SHARED, THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {CLOCK, DN, LITE, PARK, pos} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, MAPG, SOL, SYS, TILE} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
const PARKPF={done:false,things:0,patches:[],tris:0,solids:0,moved:0,skipped:[]};
{ const DATA=__LAZY__("data/parkpf.json"), CELL=24, FAR=72, NEAR=36, SHD=28;
  const LAMP={globelamp:1,colonial:1,campuslamp:1,jlamp:1,sealamp:1,stringlights:.6};
  const SOLID=new Set(['boatshed','conservatory','greenhouse','toilet','seatoilet','refresh','coffee','newsstand','icecream','hotdog','founder','plazafountain','campusfountain','zen','trailmap','trailhead','lion','picnictable','library']);
  const WET=new Set(['raft','canoe','kayak','skiff','duck','dock','launch','lifebuoy','archbridge','creekbridge','woodbridge','logbridge','trestle']);
  const BRIDGE=new Set(['archbridge','creekbridge','woodbridge','logbridge','trestle']);
  const mat=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});
  const model=D=>{ if(D.m)return D.m; const q=I16(D.p), n=D.n, P=new Float32Array(n*3), C=new Float32Array(n*3), col=B64(D.c), c=new THREE.Color();
    for(let i=0;i<n*3;i++)P[i]=(q[i]+32500)*D.sc+D.lo[i%3];
    for(let i=0;i<n*3;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    let top=-1e9; for(let i=1;i<n*3;i+=3)top=Math.max(top,P[i]); let hx=0, hy=0, hz=0, hn=0; for(let i=0;i<n*3;i+=3)if(P[i+1]>top-.35){ hx+=P[i]; hy+=P[i+1]; hz+=P[i+2]; hn++; }
    return D.m={P,C,I:D.i32?new Uint32Array(B64(D.i).buffer):U16(D.i),n,head:[hx/hn,hy/hn-.12,hz/hn]}; };
  const build=D=>{ const B=SHARED.BOD, T=TILE, M=T/.84, Pk=PARK, BK=Pk.brook, [LX,LY,LR]=Pk.lake||[0,0,0], root=MAPG.park||scene, sol0=SOL.up.slice();
    const wet=(x,y)=>(FOUNT.lake&&FOUNT.lake(x,y)<.6)||(BK&&BK.wet&&BK.wet(x,y))||Math.hypot(x-LX,y-LY)<LR+.6;
    const hit=(x0,z0,x1,z1)=>{ for(const s of sol0)if(s[0]<x1&&s[2]>x0&&s[1]<z1&&s[3]>z0)return true; return false; };
    const water=(x,z)=>{ const b=FOUNT.bedAt&&FOUNT.bedAt(x,z); return b!=null?FOUNT.LV:-.25*T; };
    const cells=new Map(), lampAt=[];
    for(const o of LEVEL.things||[]){ if(!String(o.k).startsWith('p:'))continue; const k=o.k.slice(2), Dk=D[k]; if(!Dk){ PARKPF.skipped.push(k); continue; } PARKPF.things++;
      const a=o.rot||0, ca=Math.cos(a), sa=Math.sin(a), [sx,sy,sz]=Dk.size, ex=(Math.abs(ca)*sx+Math.abs(sa)*sz)/2, ez=(Math.abs(sa)*sx+Math.abs(ca)*sz)/2;
      let mx=o.x, my=o.y; const free=(x,y)=>{ const X=B.XS(x), Z=B.ZS(y); return BRIDGE.has(k)||(WET.has(k)||!wet(x,y))&&!hit(X-ex*M*.8,Z-ez*M*.8,X+ex*M*.8,Z+ez*M*.8); };   // a bridge spans the brook's bank rocks
      if(!free(mx,my)){ let f=null; for(let r=.6;r<=3&&!f;r+=.6)for(let i=0;i<8&&!f;i++){ const u=mx+Math.cos(i*Math.PI/4)*r, v=my+Math.sin(i*Math.PI/4)*r; if(free(u,v))f=[u,v]; }
        if(!f){ PARKPF.skipped.push(o.k+'@'+o.x+','+o.y); continue; } [mx,my]=f; PARKPF.moved++; }
      const x=B.XS(mx), z=B.ZS(my), y=o.float?water(x,z):(SHARED.groundY?SHARED.groundY(x,z):0);
      const big=Math.max(sx,sz)>=2.4||sy>=2.5, key=Math.floor(mx/CELL)+','+Math.floor(my/CELL)+(big?'b':'s'); let c=cells.get(key); if(!c)cells.set(key,c={big,L:[],n:0,t:0});
      const m=model(Dk); c.L.push({m,x,y,z,ca,sa}); c.n+=m.n; c.t+=m.I.length;
      if(LAMP[k]){ const h=m.head, M_=M; lampAt.push([x+(h[0]*ca+h[2]*sa)*M_,y+h[1]*M_,z+(-h[0]*sa+h[2]*ca)*M_,LAMP[k]]); }
      if(SOLID.has(k)){ const s=[x-ex*M,z-ez*M,x+ex*M,z+ez*M]; SOL.up.push(s); FIX.up.push([s[0],s[1],y,s[2],s[3],y+sy*M]); PARKPF.solids++; } }
    for(const c of cells.values()){ const P=new Float32Array(c.n*3), C=new Float32Array(c.n*3), I=c.n>65535?new Uint32Array(c.t):new Uint16Array(c.t); let v=0, j=0;
      for(const {m,x,y,z,ca,sa} of c.L){ for(let i=0;i<m.n;i++){ const px=m.P[i*3]*M, py=m.P[i*3+1]*M, pz=m.P[i*3+2]*M, w=(v+i)*3; P[w]=x+px*ca+pz*sa; P[w+1]=y+py; P[w+2]=z-px*sa+pz*ca; }
        C.set(m.C,v*3); for(let i=0;i<m.I.length;i++)I[j+i]=m.I[i]+v; v+=m.n; j+=m.I.length; }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setIndex(new THREE.BufferAttribute(I,1)); g.computeBoundingSphere();
      const me=new THREE.Mesh(g,mat); me.matrixAutoUpdate=false; me.receiveShadow=true; me.castShadow=false; me.visible=false; me.userData.parkpf=1; root.add(me);
      const bs=g.boundingSphere; PARKPF.patches.push({me,big:c.big,x:bs.center.x,z:bs.center.z,r:bs.radius,tris:c.t/3}); PARKPF.tris+=c.t/3; }
    lights(lampAt,root); PARKPF.done=true; cull(); };
  // the lamps at night (owner, 7 Nov 2026: "make the park lamps light up at night"): each a light record in the pool (LITE: the nearest few lit for real, the rest a glow on the ground), their heads one glowing points draw
  const lights=(L,root)=>{ const T=TILE, recs=[], pp=new Float32Array(L.length*3);
    L.forEach(([x,y,z,k],i)=>{ const l=new THREE.PointLight(new THREE.Color(1,.84,.58),40*k,14*T*k,1.6); l.position.set(x,y,z); l.userData.i0=40*k; l.userData.grp=root; l.intensity=0; l.castShadow=false; recs.push(l); LITE.recs.push(l); pp.set([x,y,z],i*3); });
    const W=32, cv=document.createElement('canvas'); cv.width=cv.height=W; const g=cv.getContext('2d'), im=g.createImageData(W,W);
    for(let j=0;j<W;j++)for(let i=0;i<W;i++){ const d=Math.hypot((i+.5)/W*2-1,(j+.5)/W*2-1), a=d<.22?1:d<.45?.45:d<.75?.16:0, o=(j*W+i)*4; im.data[o]=255; im.data[o+1]=d<.22?240:206; im.data[o+2]=d<.22?200:140; im.data[o+3]=a*255; }
    g.putImageData(im,0,0); const tx=new THREE.CanvasTexture(cv); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.generateMipmaps=false; tx.colorSpace=THREE.SRGBColorSpace;
    const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.BufferAttribute(pp,3)); ge.computeBoundingSphere();
    const glow=new THREE.Points(ge,new THREE.PointsMaterial({map:tx,size:2.6*T,sizeAttenuation:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false})); glow.renderOrder=2; glow.visible=false; glow.raycast=()=>{}; root.add(glow);
    const lit=()=>{ let d=false; try{ d=CLOCK.dark(); }catch(_){ } glow.visible=d; for(const l of recs)l.intensity=d?l.userData.i0*(window.DN?DN.lk:1):0; PARKPF.lit=d; };
    PARKPF.lamps=recs.length; lit(); SYS.every(lit,2000,'111fe-parkpf lamps'); };
  let cullT=0; const cull=()=>{ const up=SHARED.LVL==='up', T=TILE; for(const p of PARKPF.patches){ const d=Math.hypot(p.x-pos.x,p.z-pos.z)-p.r; p.me.visible=up&&d<(p.big?FAR:NEAR)*T; p.me.castShadow=p.me.visible&&p.big&&d<SHD*T; } };
  SYS.add('places',dt=>{ if(!PARKPF.done||(cullT-=dt)>0)return; cullT=.4; cull(); },'111fe-parkpf cull');
  PARK.later(()=>{ DATA().then(build).catch(e=>console.warn('PARKPF',e)); });
  window.PARKPFCHK=()=>{ const B=SHARED.BOD, solid=(x,z)=>SOL.up.some(s=>x>s[0]&&x<s[2]&&z>s[1]&&z<s[3]), mall=[]; for(let y=-20;y<170;y+=4)mall.push(solid(B.XS(112-3*Math.sin(2*Math.PI*3*(y+37)/217)),B.ZS(y)));
    const K=LEVEL.parkPlaces.brook.pts[0], L=FOUNT.S.L; return {want:LEVEL.things.filter(o=>String(o.k).startsWith('p:')).length,mallBlocked:mall.filter(Boolean).length,boats:LEVEL.things.filter(o=>o.float&&FOUNT.bedAt(B.XS(o.x),B.ZS(o.y))!=null).length,brookStart:FOUNT.lake(K[0],K[1]),past:[L.cx>PARK.x1,L.cy>PARK.y1]}; };
  window.PARKPFDBG=()=>({done:PARKPF.done,things:PARKPF.things,patches:PARKPF.patches.length,tris:PARKPF.tris,drawn:PARKPF.patches.filter(p=>p.me.visible).reduce((a,p)=>a+p.tris,0),shadow:PARKPF.patches.filter(p=>p.me.castShadow).length,hid:PARKPF.patches.filter(p=>!p.me.visible).length,solids:PARKPF.solids,lamps:PARKPF.lamps||0,lit:!!PARKPF.lit,moved:PARKPF.moved,skipped:PARKPF.skipped});
}
