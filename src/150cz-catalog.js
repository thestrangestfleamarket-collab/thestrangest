// THE GAME'S ITEMS FOR YOUR APARTMENT: every kind in the game's catalog is a thing DECORATE sells, its mesh painted the first time it is shown or bought; the small ones loose (real physics), the big ones solid.
import {SHARED, THREE} from './003-shx.js';
import {BATCH} from './003b-systems.js';
import {MODS} from './006-map-pre.js';
import {PEEK} from './008-batch.js';
import {CAT_DEPTS, CAT_INFO, CATALOG, LAMPS, PROPL} from './014-gamekit.js';
import {ROOMK} from './150a-bedroom.js';
{ const cost=I=>{ const n=parseInt(String(I.price??'').replace(/[^0-9]/g,''),10); return n>0?n:20; };
  const deptOf=I=>{ const d=String(I.dept||'').toLowerCase(); if(!d)return ['g:more','MORE']; const D=CAT_DEPTS.find(q=>q[0].toLowerCase()===d||String(q[1]).toLowerCase()===d); return ['g:'+d,String(D?D[1]:I.dept).toUpperCase()]; };
  // one item painted as the street paints it (its boxes through the batch, the apartment's materials), then moved to stand on its own footprint in room metres
  const make=(k,D,M)=>{ '@later'; const APTS=MODS.apts, B=SHARED.BOD, g=new THREE.Group(), keepI=BATCH.items, keepM=BATCH.meshes, kc=BATCH.cast, n0=PROPL.length, l0=LAMPS.length; let p=null, ms=[];
    BATCH.items=[]; BATCH.meshes={}; BATCH.cast=true;
    try{ p=CATALOG[k](0,0); if(p&&p.boxes)for(const b of p.boxes)B.gbox(b,'A'); if(BATCH.items.length){ BATCH.build(APTS.MKA); ms=Object.values(BATCH.meshes||{}); } }
    catch(e){ console.warn('catalog item '+k,e); }
    finally{ BATCH.items=keepI; BATCH.meshes=keepM; BATCH.cast=kc; PROPL.length=n0; LAMPS.length=l0; }
    if(ms.length){ for(let i=PEEK.boxes.length-1;i>=0;i--)if(ms.includes(PEEK.boxes[i].me))PEEK.boxes.splice(i,1); const bb=new THREE.Box3(); for(const me of ms){ me.removeFromParent(); me.geometry.computeBoundingBox(); bb.union(me.geometry.boundingBox); }
      const cx=(bb.min.x+bb.max.x)/2, cz=(bb.min.z+bb.max.z)/2, y0=B.Y(0);
      for(const me of ms){ me.geometry.translate(-cx,-y0,-cz).scale(1/M,1/M,1/M); me.geometry.computeBoundingBox(); me.geometry.computeBoundingSphere(); me.castShadow=me.receiveShadow=true; g.add(me); }
      const lo=(bb.min.y-y0)/M, hi=(bb.max.y-y0)/M, w=(bb.max.x-bb.min.x)/M/2, d=(bb.max.z-bb.min.z)/M/2;
      // small enough to pick up: a loose thing with real physics (as the room's own mugs and books); the big ones stay put, solid
      if(lo<.3&&hi-lo<.9&&Math.max(w,d)<.5&&!(p&&p.walk)){ D.loose=true; D.m=+Math.max(.2,Math.min(15,(hi-lo)*w*d*4*150)).toFixed(2); }
      else if(hi-lo>.25&&lo<.3&&!(p&&(p.walk||p.high)))D.sol=[[-w,-d,w,d,hi]]; }
    else D.bad=true;   // nothing painted (or its maker failed): not for sale
    return g; };
  ROOMK.parts.push(ctx=>{ '@later'; const {R,M}=ctx;
    for(const k in CATALOG){ const id='g:'+k; if(R.kinds[id])continue; const I=CAT_INFO[k]||{}, [dept,deptName]=deptOf(I);
      const D={kind:id,name:String(I.name||k).toUpperCase(),loose:false,m:0,wire:null,sol:[],shf:[],game:k,dept,deptName,price:cost(I)};
      Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=make(k,D,M); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }});
      R.kinds[id]=D; } });
}
