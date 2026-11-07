// THE HUDSON'S TROPHIES in your apartment: the Old Catfish on its plaque for the wall and the Long Swim medal on its little stand (DECORATE shows them as YOURS; placing one uses it up, putting it away gives it back).
import {THREE} from './003-shx.js';
import {ROOMK} from './150a-bedroom.js';
{ const M=(c,r=.7,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m}), add=(g,geo,mat,x,y,z)=>{ const o=new THREE.Mesh(geo,mat); o.position.set(x,y,z); g.add(o); return o; };
  const cat=()=>{ '@later'; const g=new THREE.Group(); add(g,new THREE.BoxGeometry(.9,.36,.03),M(0x5a3a20),0,0,.015); const f=add(g,new THREE.SphereGeometry(.16,14,10),M(0x5e5a48,.6),0,0,.09); f.scale.set(2.4,.8,.45);
    const t=add(g,new THREE.ConeGeometry(.12,.2,4),M(0x4e4a3c,.6),-.42,0,.09); t.rotation.z=Math.PI/2; t.scale.z=.3; for(const s of [-1,1]){ const w=add(g,new THREE.CylinderGeometry(.005,.004,.22,4),M(0x2a2620),.4,s*.03-.04,.12); w.rotation.z=Math.PI/2+s*.5; }
    add(g,new THREE.SphereGeometry(.018,6,4),M(0x111111,.3),.3,.04,.15); add(g,new THREE.BoxGeometry(.28,.05,.005),M(0xc8a040,.4,.6),0,-.14,.033); return g; };
  const medal=()=>{ '@later'; const g=new THREE.Group(); add(g,new THREE.BoxGeometry(.1,.015,.06),M(0x3a2a1a),0,.0075,0); add(g,new THREE.BoxGeometry(.012,.1,.012),M(0x3a2a1a),0,.06,0);
    add(g,new THREE.BoxGeometry(.03,.05,.004),M(0x2a5ac8),0,.095,.008); add(g,new THREE.CylinderGeometry(.03,.03,.006,16),M(0xd8b040,.35,.8),0,.06,.012).rotation.x=Math.PI/2; return g; };
  const lazy=(D,make)=>Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=make(); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }});
  ROOMK.parts.push(ctx=>{ '@later'; const {R}=ctx; for(const [k,name,own,make,more] of [['rv:trophy','THE OLD CATFISH (MOUNTED)','trophy_cat',cat,{sol:[],mount:'wall'}],['rv:medal','THE LONG SWIM MEDAL','medal_swim',medal,{sol:[[-.05,-.03,.05,.03,.13]]}]]){ if(R.kinds[k])continue;
    const D={kind:k,name,own,loose:false,m:0,wire:null,shf:[],dept:'trophies',deptName:'TROPHIES',...more}; lazy(D,make); R.kinds[k]=D; } }); }
