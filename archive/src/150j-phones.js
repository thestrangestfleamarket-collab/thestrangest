// YOUR TELEPHONE: the home telephone bought from the Operator (146y) is a thing for your apartment (DECORATE shows it as YOURS); a click picks it up and dials any shopkeeper (PHONE.dial).
import {THREE} from './003-shx.js';
import {ROOMK} from './150a-bedroom.js';
{ const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.45,...o});
  const phone=()=>{ const G=new THREE.Group(), body=std(0x9ac8e8); const b=new THREE.Mesh(new THREE.BoxGeometry(.2,.08,.22),body); b.position.y=.04; G.add(b);
    const dial=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.012,24),std(0xe8e4da)); dial.position.set(0,.085,.03); G.add(dial); for(let i=0;i<10;i++){ const a=i/10*Math.PI*1.6+.6, h=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.014,8),std(0x2a2a2a)); h.position.set(Math.cos(a)*.042,.09,.03+Math.sin(a)*.042); G.add(h); }
    const hs=new THREE.Mesh(new THREE.CapsuleGeometry(.025,.17,6,12),body); hs.rotation.z=Math.PI/2; hs.position.set(0,.11,-.06); G.add(hs);
    const cord=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([0,1,2,3,4,5,6,7,8].map(i=>new THREE.Vector3(-.1-Math.sin(i*1.6)*.015,.1-i*.01,-.06+Math.cos(i*1.6)*.015))),40,.004,5),std(0x9ac8e8)); G.add(cord); return G; };
  ROOMK.parts.push(ctx=>{ const {R}=ctx, k='op:phone'; if(R.kinds[k])return; const D={kind:k,name:'HOME TELEPHONE',own:'phone_home',loose:false,m:0,wire:'phone',sol:[],shf:[],dept:'electronics',deptName:'ELECTRONICS'};
    Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=phone(); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }}); R.kinds[k]=D; });
  ROOMK.wires.phone=(un,c)=>{ c.hit(un,()=>'THE TELEPHONE: CALL SOMEONE',()=>PHONE.dial('home')); };
}
