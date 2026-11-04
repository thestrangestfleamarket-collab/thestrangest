// THE PONDS: the map editor's swimmable ponds (world.json ponds, map tiles: x, y, r): a still water with a stone rim on the street level, a bowl of a bed under it; you swim and dive in it like the lake.
import {SHARED, THREE} from './003-shx.js';
import {WEEDS} from './003b-systems.js';
import {scene} from './004-main.js';
import {LEVEL, MODS, SYS, TILE, ZU} from './006-map-pre.js';
{ const PONDS=(Array.isArray(LEVEL.ponds)?LEVEL.ponds:[]).slice(0,20), T=TILE, DEEP=2.6*T, built=[];
  if(PONDS.length){ (MODS.waters=MODS.waters||[]).push({feed:(st,pos,dt,go,keys)=>{ if(SHARED.LVL!=='up')return false;
      for(const p of built){ const d=Math.hypot(pos.x-p.x,pos.z-p.z); if(d>=p.r)continue;
        const k=1-(d/p.r)**2, W=RIG.water(st,{level:p.y/ZU,floor:(p.y-DEEP*k)/ZU}); W.go=!!go; W.fast=W.in&&(keys.has('k')||keys.has('shift'))?1:0;
        if(W.in&&W.floor>=W.level-30&&!st.move&&!W.dive){ W.in=false; if(st.last)st.out={pose:JSON.parse(JSON.stringify(st.last)),t:0,T:.4}; }
        return true; }
      return false; }});
    SYS.onStart(()=>{ const B=SHARED.BOD, gy=(x,z)=>{ try{ return SHARED.groundY(x,z)||0; }catch(e){ return 0; } };
      const water=new THREE.MeshToonMaterial({color:0x2f6f8a,transparent:true,opacity:.9}), rim=new THREE.MeshToonMaterial({color:0x8a8478});
      for(const q of PONDS){ const x=B.XS(q.x), z=B.ZS(q.y), r=q.r*T, y=gy(x,z), g=new THREE.Group();
        const w=new THREE.Mesh(new THREE.CircleGeometry(r,40).rotateX(-Math.PI/2),water); w.position.y=.09; w.renderOrder=2;
        const s=new THREE.Mesh(new THREE.RingGeometry(r,r+.35*T,40).rotateX(-Math.PI/2),rim); s.position.y=.1; s.receiveShadow=true;
        g.add(w,s); g.position.set(x,y,z); g.userData.pond=q; scene.add(g); built.push({x,z,r,y,g});
        if(WEEDS.lawnDrop)WEEDS.lawnDrop([x-r-T,z-r-T,x+r+T,z+r+T]); }
      SHARED.ponds=built; },'089b-ponds'); } }
