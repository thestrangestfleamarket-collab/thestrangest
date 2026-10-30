// YOUR SPECIMENS AT HOME: a mounted butterfly (143) hangs on your wall and a caged bird (144b) stands in your apartment — DECORATE shows each as YOURS; taking one down puts it back in your pack.
import {SHARED, THREE} from './003-shx.js';
import {INSPECT} from './003b-systems.js';
import {BIRDS} from './144b-birds.js';
import {ROOMK} from './150a-bedroom.js';
{ const {BF_KINDS}=SHARED.BOD.STOREK.bf;
  const lazy=(D,make)=>{ Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=make(); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }}); return D; };
  const cage=k=>{ const g=new THREE.Group(); g.add(INSPECT.shape('cage')); const b=BIRDS.make(k); b.scale.setScalar(.42); b.position.y=.04; g.add(b); return g; };
  const part=ctx=>{ const {R}=ctx;
    BF_KINDS.forEach((b,k)=>{ const kk='sp:s_'+k; if(!R.kinds[kk])R.kinds[kk]=lazy({kind:kk,name:'MOUNTED '+b[0].toUpperCase(),own:'s_'+k,loose:false,m:0,wire:null,sol:[],shf:[],mount:'wall',dept:'specimens',deptName:'SPECIMENS'},()=>INSPECT.model('s_'+k)); });
    BIRDS.K.forEach((b,k)=>{ const kk='sp:bd_'+k; if(!R.kinds[kk])R.kinds[kk]=lazy({kind:kk,name:b[0]+' IN A CAGE',own:'bd_'+k,loose:false,m:0,wire:null,sol:[[-.17,-.17,.17,.17,.45]],shf:[],dept:'specimens',deptName:'SPECIMENS'},()=>cage(k)); }); };
  ROOMK.parts.push(part);
  window.SPECDBG=()=>{ const R={kinds:{}}; part({R}); const a=R.kinds['sp:s_3'], b=R.kinds['sp:bd_2'], m=t=>{ let n=0; t.traverse(o=>{ if(o.isMesh)n++; }); return n; }; return {n:Object.keys(R.kinds).length,wall:a.mount,own:[a.own,b.own],meshes:[m(a.tpl),m(b.tpl)]}; };
}
