// THE FIELD TELESCOPE: a 60 mm refractor on a folding tripod every player carries; held, a click stands it where you are under open sky and opens the same eyepiece as the apartment's (smaller glass, 100X at most), the sky darker in the park than on the lamp-lit street (ZONES.dark); walking away packs it up.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INV, pos, ROOMS, SKY, WIELD, ZONES} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {QS, SYS, TILE} from './006-map-pre.js';
import {SKYSHOW} from './134bc-skyshow.js';
import {SCOPE} from './150fd-scope.js';
const FIELD={on:false,at:null}; window.FIELD=FIELD;
{ const T=TILE, M=T/.84, lam=c=>new THREE.MeshLambertMaterial({color:c});
  FORAGE.add({names:{fscope:'FIELD TELESCOPE (60 MM)'}});
  if(!OWNED.get('fscope1')||QS.get('fresh')){ if(!INV.items.fscope)INV.items.fscope=1; INV.save(); OWNED.set('fscope1','1'); }   // one for every player, once, kept with the pack
  const tube=(g,len,r,y,z0)=>{ const a=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,10),lam(0xe8e4d8)); a.rotation.x=Math.PI/2; a.position.set(0,y,z0); const b=new THREE.Mesh(new THREE.CylinderGeometry(r*1.15,r*1.15,len*.16,10),lam(0x1c1d20)); b.rotation.x=Math.PI/2; b.position.set(0,y,z0-len*.5); const e=new THREE.Mesh(new THREE.CylinderGeometry(r*.5,r*.5,len*.2,8),lam(0x1c1d20)); e.rotation.x=Math.PI/2; e.position.set(0,y,z0+len*.58); g.add(a,b,e); };
  const kind={name:'FIELD TELESCOPE',hint:'CLICK TO STAND IT ON ITS TRIPOD UNDER OPEN SKY AND LOOK THROUGH IT. WALK AWAY TO PACK IT UP.',
    make:()=>{ '@later'; const g=new THREE.Group(); tube(g,.4*M,.032*M,.08*M,-.1*M); g.traverse(o=>{ o.userData.wield=1; }); g.tipL=new THREE.Vector3(0,.08*M,-.3*M); g.head=g.tipL; return g; },
    use:()=>FIELD.toggle() };
  (WIELD.pend=WIELD.pend||[]).push(['fscope',kind]); if(WIELD.kind)WIELD.kind('fscope',kind);
  let prop=null, A=null, keep=null;
  const stand=()=>{ '@later'; const g=new THREE.Group(), wood=lam(0x7e5430), H=1.25*M; for(let i=0;i<3;i++){ const a=i*Math.PI*2/3+.5, L=new THREE.Mesh(new THREE.CylinderGeometry(.014*M,.011*M,H*1.06,6),wood); L.position.set(Math.cos(a)*.2*M,H/2,Math.sin(a)*.2*M); L.rotation.set(-Math.sin(a)*.33,0,Math.cos(a)*.33,'XZY'); L.castShadow=true; g.add(L); }
    const hd=new THREE.Mesh(new THREE.CylinderGeometry(.04*M,.045*M,.05*M,10),lam(0x1c1d20)); hd.position.y=H; g.add(hd); const a=new THREE.Group(); a.position.y=H+.07*M; tube(a,.55*M,.036*M,0,0); a.children.forEach(o=>{ o.castShadow=true; }); g.add(a); g.userData.tube=a; return g; };
  FIELD.dark=()=>{ const z=ZONES.at(pos.x,pos.z,SHARED.LVL||'up'); return (ZONES.dark&&z&&ZONES.dark[z.id])||0; };
  FIELD.toggle=async()=>{ if(FIELD.on){ if(!SCOPE.isOpen())await SCOPE.open(); return; }
    if(!SKY.on()||ROOMS.cur||SHARED.LVL==='down'){ SAY('THE FIELD TELESCOPE NEEDS OPEN SKY OVER IT.','#c8a090'); return; }
    const d=FIELD.dark(); keep=SCOPE.site; SCOPE.site={ap:60,dark:d,max:100,name:'THE FIELD TELESCOPE',field:true}; if(SCOPE.mag>100)SCOPE.mag=50;
    prop=stand(); A=prop.userData.tube; const hd=SHARED.heading||0; prop.position.set(pos.x+Math.sin(hd)*.6*M,SHARED.py||0,pos.z+Math.cos(hd)*.6*M); scene.add(prop); FIELD.on=true; FIELD.at={x:pos.x,z:pos.z}; SKYSHOW.want=true;
    SAY(d>0?'YOU STAND THE TELESCOPE IN THE GRASS. AWAY FROM THE LAMPS THE SKY IS DARKER: FAINTER THINGS SHOW HERE.':'YOU STAND THE TELESCOPE ON THE PAVEMENT. THE STREET LAMPS WASH OUT THE FAINT THINGS: THE PARK IS DARKER.','#c8e0ff'); await SCOPE.open(); };
  FIELD.pack=()=>{ if(!FIELD.on)return; FIELD.on=false; if(SCOPE.isOpen())SCOPE.close(); if(prop){ scene.remove(prop); prop.traverse(o=>{ if(o.geometry)o.geometry.dispose(); if(o.material)o.material.dispose(); }); prop=null; A=null; } if(keep)SCOPE.site=keep; keep=null; FIELD.at=null; };
  SYS.add('places',()=>{ if(!FIELD.on)return; if(A){ prop.rotation.y=Math.PI-SCOPE.az*Math.PI/180; A.rotation.x=Math.max(-5,SCOPE.alt)*Math.PI/180; }
    if(Math.hypot(pos.x-FIELD.at.x,pos.z-FIELD.at.z)>1.5*T||!SKY.on()||WIELD.on!=='fscope'&&!SCOPE.isOpen()){ FIELD.pack(); SAY('YOU FOLD THE TELESCOPE AWAY.','#c8e0ff'); } },'150fj-fieldscope');
}
