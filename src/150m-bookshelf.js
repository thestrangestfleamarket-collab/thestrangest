// YOUR RESTORED BOOKS: a book you mend (144c) can stand at home — DECORATE shows each restored book as YOURS; it stands upright on a table or shelf.
import {THREE} from './003-shx.js';
import {FORAGE} from './003b-systems.js';
import {ROOMK} from './150a-bedroom.js';
{ const COL={paper:0x8a3a2a,novel:0x2a4a7a,atlas:0x3a6a3a,hymnal:0x5a2a5a,ledger:0x6a4a2a,herbal:0x4a6a2a,first:0x7a1a1a};
  const make=c=>{ const g=new THREE.Group(), b=new THREE.Mesh(new THREE.BoxGeometry(.05,.24,.17),new THREE.MeshStandardMaterial({color:c,roughness:.7})); b.position.y=.12; g.add(b);
    const p=new THREE.Mesh(new THREE.BoxGeometry(.052,.22,.15),new THREE.MeshStandardMaterial({color:0xf0e8d4,roughness:.9})); p.position.set(0,.12,.012); g.add(p);
    const band=new THREE.Mesh(new THREE.BoxGeometry(.054,.02,.172),new THREE.MeshStandardMaterial({color:0xc8a040,roughness:.4,metalness:.5})); band.position.y=.2; g.add(band); return g; };
  ROOMK.parts.push(ctx=>{ const {R}=ctx; for(const k in COL){ const kk='bk:br_'+k; if(R.kinds[kk])continue; const D={kind:kk,name:(FORAGE.NM&&FORAGE.NM['br_'+k])||'A RESTORED BOOK',own:'br_'+k,loose:false,m:0,wire:null,sol:[[-.03,-.09,.03,.09,.24]],shf:[],dept:'books',deptName:'BOOKS'};
    Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=make(COL[k]); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }}); R.kinds[kk]=D; } });
}
