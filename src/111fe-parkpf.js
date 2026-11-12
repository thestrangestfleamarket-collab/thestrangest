// THE PARK'S POLYFORK THINGS: data/world.json's things with k 'p:<key>' (data/parkpf.json, tools/park-pf-bake.py), baked a patch of ground at a time into still meshes; only near patches drawn, small things nearer still, shadows close by; the big ones solid; the lamps lit at night.
import {SHARED, THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {BOAT, CLOCK, DN, LITE, PARK, pos, UI, USE, WE, WED, WEEDS} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, MAPG, SOL, SYS, TILE} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
const PARKPF={done:false,things:0,patches:[],tris:0,solids:0,moved:0,skipped:[]};
{ const DATA=__LAZY__("data/parkpf.json"), CELL=24, FAR=72, NEAR=36, SHD=28;
  const LAMP={globelamp:1,colonial:1,campuslamp:1,jlamp:1,sealamp:1,stringlights:.6};
  const SOLID=new Set(['boatshed','conservatory','greenhouse','toilet','seatoilet','refresh','coffee','newsstand','icecream','hotdog','founder','plazafountain','campusfountain','zen','trailmap','trailhead','lion','picnictable','library',
    'ironbench','parkbench','campusbench','logbench','b2bbench','amphi','basket','trashcan','planter','planterbox','bollard','drink','sphere','birdbath','beehive','bikerack','wayfind','campusrail','bowtop','arearail','ironfence','picket']);
  const POST={colonial:.32,globelamp:.32,sealamp:.32,campuslamp:.3,jlamp:.34,birdhouse:.26};   // a lamp or a pole: only its post is in the way, not its head
  const SEAT=new Set(['ironbench','parkbench','campusbench','logbench','b2bbench','amphi']);
  const WET=new Set(['raft','canoe','kayak','skiff','duck','dock','launch','lifebuoy','archbridge','creekbridge','woodbridge','logbridge','trestle']);
  const RAIL=new Set(['campusrail','bowtop','arearail','ironfence','picket']);   // (no tufts along the rails and fences: they run beside every path)
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
    const cells=new Map(), lampAt=[], seats=[], feet=[];
    // the lake's boats: each its own mesh, moored for anyone to row (BOAT, 111ff)
    const CRAFT={canoe:['CANOE',3.4],kayak:['KAYAK',4],skiff:['SKIFF',3]}, mapX=X=>X/T+B.OX-(Pk.ox||0), mapY=Z=>Z/T+B.OY-(Pk.oy||0), rock=(X,Z)=>SOL.up.some(s=>X>s[0]&&X<s[2]&&Z>s[1]&&Z<s[3]);
    const craft=(k,Dk,x,y,z,a)=>{ const m=model(Dk), g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(m.P.map(v=>v*M),3)); g.setAttribute('color',new THREE.BufferAttribute(m.C,3)); g.setIndex(new THREE.BufferAttribute(m.I,1));
      const me=new THREE.Mesh(g,mat); me.castShadow=me.receiveShadow=true; root.add(me);
      BOAT.moor({k,name:'THE '+CRAFT[k][0],g:me,x,z,hd:a,len:Dk.size[2]*M,beam:Dk.size[0]*M,top:CRAFT[k][1]*T,floor:-.1*M,seat:.08*M,lv:()=>y,
        wet:(X,Z)=>FOUNT.wet(X,Z,-.4*T)&&FOUNT.bridgeD(mapX(X),mapY(Z))>.8&&!rock(X,Z),dry:(X,Z)=>!FOUNT.wet(X,Z,.3*T)&&!rock(X,Z)}); };
    for(const o of LEVEL.things||[]){ if(!String(o.k).startsWith('p:'))continue; const k=o.k.slice(2), Dk=D[k]; if(!Dk){ PARKPF.skipped.push(k); continue; } PARKPF.things++;
      const a=o.rot||0, ca=Math.cos(a), sa=Math.sin(a), [sx,sy,sz]=Dk.size, ex=(Math.abs(ca)*sx+Math.abs(sa)*sz)/2, ez=(Math.abs(sa)*sx+Math.abs(ca)*sz)/2;
      let mx=o.x, my=o.y; const free=(x,y)=>{ const X=B.XS(x), Z=B.ZS(y); return o.fixed||BRIDGE.has(k)||(WET.has(k)||!wet(x,y))&&!hit(X-ex*M*.8,Z-ez*M*.8,X+ex*M*.8,Z+ez*M*.8); };   // a bridge spans the brook's bank rocks
      if(!free(mx,my)){ let f=null; for(let r=.6;r<=3&&!f;r+=.6)for(let i=0;i<8&&!f;i++){ const u=mx+Math.cos(i*Math.PI/4)*r, v=my+Math.sin(i*Math.PI/4)*r; if(free(u,v))f=[u,v]; }
        if(!f){ PARKPF.skipped.push(o.k+'@'+o.x+','+o.y); continue; } [mx,my]=f; PARKPF.moved++; }
      const x=B.XS(mx), z=B.ZS(my), y=o.float?water(x,z):(SHARED.groundY?SHARED.groundY(x,z):0);
      if(CRAFT[k]&&o.float&&BOAT.moor){ craft(k,Dk,x,y,z,a); continue; }
      const big=Math.max(sx,sz)>=2.4||sy>=2.5, key=Math.floor(mx/CELL)+','+Math.floor(my/CELL)+(big?'b':'s'); let c=cells.get(key); if(!c)cells.set(key,c={big,L:[],n:0,t:0});
      const m=model(Dk), it={k:k,x,y,z}; c.L.push({m,x,y,z,ca,sa,it}); c.n+=m.n; c.t+=m.I.length;
      if(LAMP[k]){ const h=m.head, M_=M; lampAt.push([x+(h[0]*ca+h[2]*sa)*M_,y+h[1]*M_,z+(-h[0]*sa+h[2]*ca)*M_,LAMP[k],it]); }
      if(SOLID.has(k)||POST[k]){ const top=y+sy*M, put=(cx,cz,hx,hz)=>{ const s=[cx-hx,cz-hz,cx+hx,cz+hz], f=[s[0],s[1],y,s[2],s[3],top]; SOL.up.push(s); FIX.up.push(f); if(it.sol)(it.more=it.more||[]).push([s,f]); else { it.sol=s; it.fix=f; } PARKPF.solids++; };
        if(POST[k])put(x,z,POST[k]/2*M,POST[k]/2*M);
        else { const L=Math.max(sx,sz), W=Math.min(sx,sz), n=Math.abs(Math.sin(2*a))<.05?1:Math.max(1,Math.ceil(L/Math.max(.35,W*1.5))), ux=sx>=sz?ca:sa, uz=sx>=sz?-sa:ca, lx=sx>=sz?sx/n:sx, lz=sx>=sz?sz:sz/n;   // a turned rail or bench: short boxes along it, not one box over its corner
          const hx=(Math.abs(ca)*lx+Math.abs(sa)*lz)/2*M, hz=(Math.abs(sa)*lx+Math.abs(ca)*lz)/2*M; for(let i=0;i<n;i++){ const t=(-L/2+(i+.5)*L/n)*M; put(x+ux*t,z+uz*t,hx,hz); } }
        if(SEAT.has(k))seats.push({m,x,y,z,a,hx:ex*M,hz:ez*M,h:sy*M});
        if(!RAIL.has(k)&&Math.max(sx,sz)<4)feet.push([x,z,(ex+ez)/2*M*.9,.7*T]); } }
    // each patch one batch (one draw), a thing its own entry in it, so the world editor picks, moves and hides each one (owner, 7 Nov 2026: "make sure everything in game can be edited")
    for(const c of cells.values()){ const me=new THREE.BatchedMesh(c.L.length,c.n,c.t,mat), items=[];
      for(const {m,x,y,z,ca,sa,it} of c.L){ const P=new Float32Array(m.n*3);
        for(let i=0;i<m.n;i++){ const px=m.P[i*3]*M, py=m.P[i*3+1]*M, pz=m.P[i*3+2]*M; P[i*3]=x+px*ca+pz*sa; P[i*3+1]=y+py; P[i*3+2]=z-px*sa+pz*ca; }
        const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(m.C,3)); g.setIndex(new THREE.BufferAttribute(m.I,1));
        me.addInstance(me.addGeometry(g)); items.push(it); }
      me.computeBoundingSphere();
      me.matrixAutoUpdate=false; me.receiveShadow=true; me.castShadow=false; me.visible=false; me.userData.parkpf=1; root.add(me); WED.meshes.push({place:'park',me,items});
      const bs=me.boundingSphere; PARKPF.patches.push({me,big:c.big,x:bs.center.x,z:bs.center.z,r:bs.radius,tris:c.t/3}); PARKPF.tris+=c.t/3; }
    lights(lampAt,root); sits(seats,root,M); if(WEEDS.addFeet)WEEDS.addFeet(feet); PARKPF.done=true; cull(); if(WE.late)WE.late(); };
  // the benches: double-click one to sit (USE finds its seat and its back from the bench's own shape)
  const sits=(L,root,M)=>{ const HM=new THREE.MeshBasicMaterial({visible:false});
    for(const b of L){ const hb=new THREE.Mesh(new THREE.BoxGeometry(b.hx*2,b.h,b.hz*2),HM); hb.position.set(b.x,b.y+b.h/2,b.z); root.add(hb); let me=null;
      const th={name:'BENCH',obj:hb,reach:Math.max(b.hx,b.hz)+.5*TILE,near:Math.max(b.hx,b.hz)+1.6*TILE,tall:b.h,act:()=>{ if(!me){ const g=new THREE.BufferGeometry(), P=b.m.P.map(v=>v*M); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setIndex(new THREE.BufferAttribute(b.m.I,1)); me=new THREE.Mesh(g); me.position.set(b.x,b.y,b.z); me.rotation.y=b.a; } USE.sit(me,th); }};
      UI.thing(th); } PARKPF.seats=L.length; };
  // the lamps at night (owner, 7 Nov 2026: "make the park lamps light up at night"): each a light record in the pool (LITE: the nearest few lit for real, the rest a glow on the ground), their heads one glowing points draw
  const lights=(L,root)=>{ PARKPF.lamps=L.length; if(!L.length)return; const T=TILE, recs=[], pp=new Float32Array(L.length*3);
    L.forEach(([x,y,z,k,it],i)=>{ const l=new THREE.PointLight(new THREE.Color(1,.84,.58),40*k,14*T*k,1.6); l.position.set(x,y,z); l.userData.i0=40*k; l.userData.grp=root; l.intensity=0; l.castShadow=false; recs.push(l); LITE.recs.push(l); pp.set([x,y,z],i*3); if(it)it.follow=[l]; });
    const W=32, cv=document.createElement('canvas'); cv.width=cv.height=W; const g=cv.getContext('2d'), im=g.createImageData(W,W);
    for(let j=0;j<W;j++)for(let i=0;i<W;i++){ const d=Math.hypot((i+.5)/W*2-1,(j+.5)/W*2-1), a=d<.22?1:d<.45?.45:d<.75?.16:0, o=(j*W+i)*4; im.data[o]=255; im.data[o+1]=d<.22?240:206; im.data[o+2]=d<.22?200:140; im.data[o+3]=a*255; }
    g.putImageData(im,0,0); const tx=new THREE.CanvasTexture(cv); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.generateMipmaps=false; tx.colorSpace=THREE.SRGBColorSpace;
    const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.BufferAttribute(pp,3)); ge.computeBoundingSphere();
    const glow=new THREE.Points(ge,new THREE.PointsMaterial({map:tx,size:2.6*T,sizeAttenuation:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false})); glow.renderOrder=2; glow.visible=false; glow.raycast=()=>{}; root.add(glow);
    const lit=()=>{ let d=false; try{ d=CLOCK.dark(); }catch(_){ } glow.visible=d; for(const l of recs)l.intensity=d?l.userData.i0*(DN?DN.lk:1):0; PARKPF.lit=d; };
    PARKPF.lamps=recs.length; lit(); SYS.every(lit,2000,'111fe-parkpf lamps'); };
  let cullT=0; const cull=()=>{ const up=SHARED.LVL==='up', T=TILE; for(const p of PARKPF.patches){ const d=Math.hypot(p.x-pos.x,p.z-pos.z)-p.r; p.me.visible=up&&d<(p.big?FAR:NEAR)*T; p.me.castShadow=p.me.visible&&p.big&&d<SHD*T; } };
  SYS.add('places',dt=>{ if(!PARKPF.done||(cullT-=dt)>0)return; cullT=.4; cull(); },'111fe-parkpf cull');
  PARK.later(()=>{ DATA().then(build).catch(e=>console.warn('PARKPF',e)); });
  window.PARKPFCHK=()=>{ const B=SHARED.BOD, solid=(x,z)=>SOL.up.some(s=>x>s[0]&&x<s[2]&&z>s[1]&&z<s[3]), mall=[]; for(let y=-20;y<170;y+=4)mall.push(solid(B.XS(112-3*Math.sin(2*Math.PI*3*(y+37)/217)),B.ZS(y)));
    const K=LEVEL.parkPlaces.brook.pts[0], L=FOUNT.S.L; return {want:LEVEL.things.filter(o=>String(o.k).startsWith('p:')).length,mallBlocked:mall.filter(Boolean).length,boats:LEVEL.things.filter(o=>o.float&&FOUNT.bedAt(B.XS(o.x),B.ZS(o.y))!=null).length,brookStart:FOUNT.lake(K[0],K[1]),past:[L.cx>PARK.x1,L.cy>PARK.y1]}; };
  window.PARKPFDBG=()=>({done:PARKPF.done,things:PARKPF.things,patches:PARKPF.patches.length,tris:PARKPF.tris,drawn:PARKPF.patches.filter(p=>p.me.visible).reduce((a,p)=>a+p.tris,0),shadow:PARKPF.patches.filter(p=>p.me.castShadow).length,hid:PARKPF.patches.filter(p=>!p.me.visible).length,solids:PARKPF.solids,seats:PARKPF.seats||0,lamps:PARKPF.lamps||0,lit:!!PARKPF.lit,moved:PARKPF.moved,skipped:PARKPF.skipped});
}
