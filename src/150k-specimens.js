// YOUR PETS AT HOME: a caged tame bird (144b) stands in your apartment — DECORATE shows it as YOURS; taking it down puts it back in your pack (mounted butterflies are gone, owner 2 Nov 2026).
import {THREE} from './003-shx.js';
import {INSPECT} from './003b-systems.js';
import {BIRDS} from './144b-birds.js';
import {ROOMK} from './150a-bedroom.js';
{
  const lazy=(D,make)=>{ Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=make(); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }}); return D; };
  const cage=k=>{ const g=new THREE.Group(); g.add(INSPECT.shape('cage')); const b=BIRDS.make(k); b.scale.setScalar(.42); b.position.y=.04; g.add(b); return g; };
  const part=ctx=>{ const {R}=ctx;
    BIRDS.K.forEach((b,k)=>{ const kk='sp:bd_'+k; if(!R.kinds[kk])R.kinds[kk]=lazy({kind:kk,name:b[0]+' IN A CAGE',own:'bd_'+k,loose:false,m:0,wire:null,sol:[[-.17,-.17,.17,.17,.45]],shf:[],dept:'pets',deptName:'PETS'},()=>cage(k)); }); };
  ROOMK.parts.push(part);
  window.SPECDBG=()=>{ const R={kinds:{}}; part({R}); const b=R.kinds['sp:bd_2'], m=t=>{ let n=0; t.traverse(o=>{ if(o.isMesh)n++; }); return n; }; return {n:Object.keys(R.kinds).length,own:[b.own],meshes:[m(b.tpl)]}; };
}
