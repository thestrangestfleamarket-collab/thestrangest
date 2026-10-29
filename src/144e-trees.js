// THE TREES TO CLIMB: TREES lets you climb the park's trees (hold up at a trunk, or double-click it) and pick the blossoms and fruit in their crowns; the tomato buys them.
import {SHARED, THREE} from './003-shx.js';
import {CITY, FORAGE, INSPECT, INV, MAIL, PARK, pos, st, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {MAPG, MODS, SYS, TILE, ZU} from './006-map-pre.js';
import {VEG} from './144-veggies.js';
const TREES={h:null,want:null}; window.TREES=TREES;
{ const T=TILE, hs=(a,b,c=0)=>{ const s=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return s-Math.floor(s); }, say=(t,c)=>{ if(FORAGE.say)FORAGE.say(t,c); };
  const day=()=>window.MAIL&&MAIL.ready?MAIL.day():window.CITY?CITY.day||0:0;
  const FR=[['fr_apple','APPLE',3,0xd83a2a],['fr_pear','PEAR',3,0xb8d048],['fr_plum','PLUM',4,0x6a2a7a],['fr_fig','FIG',5,0x5a3a4a]], BL=['fl_blossom','OAK BLOSSOM',2,0xfff0f8];
  INSPECT.kinds.push({is:id=>!![...FR,BL].find(f=>f[0]===id),make:id=>{ const f=[...FR,BL].find(f=>f[0]===id), P=INSPECT.part, g=new THREE.Group(); if(f===BL){ for(let i=0;i<5;i++){ const a=i*1.257; g.add(P('ball',f[3],Math.cos(a)*.035,0,Math.sin(a)*.035,.03,.012,.03)); } g.add(P('ball',0xf2c81e,0,.008,0,.012,.01,.012)); return g; }
    g.add(P('ball',f[3],0,0,0,.05,id==='fr_pear'?.065:.048,.05,0,0,0,{flat:1}),P('cyl',0x5a3a1e,0,.06,0,.004,.03,.004),P('ball',0x4a8a3a,.018,.07,0,.022,.004,.01,0,.5)); return g; }});
  FORAGE.add({names:Object.fromEntries([...FR,BL].map(f=>[f[0],f[1]])),prices:Object.fromEntries([...FR,BL].map(f=>[f[0],f[2]]))}); VEG.add({},Object.fromEntries([...FR,BL].map(f=>[f[0],f[2]])));
  // climbing: while you are on a trunk the ground is where you are on it, so the walk and the camera follow you up
  const C={it:null,h:0}, rT=it=>it.sol?(it.sol[2]-it.sol[0])/2:.3*T;   // the trunk's half width const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>TREES.h!=null&&C.it&&Math.hypot(x-C.it.x,z-C.it.z)<rT(C.it)+.6*T?TREES.h:(sg0?sg0(x,z):null);   // only on the trunk: what lands elsewhere stays on the ground
  MODS.climbs=MODS.climbs||[]; MODS.climbs.push((dt,up,dn,off)=>{ if(SHARED.LVL!=='up'||!PARK.treeItems)return false; const IT=PARK.treeItems();
    if(!C.it){ if(!up&&!TREES.want)return false; const it=TREES.want||IT.find(o=>Math.hypot(o.x-pos.x,o.z-pos.z)<rT(o)+.8*T&&o.top-o.y>3*T); TREES.want=null; if(!it)return false; C.it=it; C.h=0; st.climb={z:0,ph:0}; }
    const it=C.it, dx=pos.x-it.x, dz=pos.z-it.z, l=Math.hypot(dx,dz)||1; pos.x=it.x+dx/l*(rT(it)+.28*T); pos.z=it.z+dz/l*(rT(it)+.28*T); SHARED.heading=Math.atan2(-dx,-dz);
    C.h=Math.max(0,Math.min(it.top-it.y-.8*T,C.h+(up?1:dn?-1:0)*dt*38*ZU)); st.climb.ph=C.h/ZU; TREES.h=it.y+C.h;   // as fast as a ladder, a hand over hand per 28 units
    if(off||(dn&&C.h<=0)){ st.climb=null; TREES.h=null; C.it=null; pos.x=it.x+dx/l*(rT(it)+.6*T); pos.z=it.z+dz/l*(rT(it)+.6*T); } return true; });
  PARK.later(()=>{ '@park'; const IT=PARK.treeItems(), g=MAPG.park||scene, SP=[]; let n=0;
    for(const it of IT){ const i=n++; if(it.top-it.y<=3*T)continue; const f=/^Oak/.test(it.k)?BL:FR[Math.floor(hs(i,1)*FR.length)];   // blossoms on the oaks, fruit on the tall trees
      const tb=new THREE.Mesh(new THREE.BoxGeometry(.9*T,1.6*T,.9*T),new THREE.MeshBasicMaterial({visible:false})); tb.position.set(it.x,it.y+.8*T,it.z); g.add(tb); UI.thing({name:'CLIMB THE TREE',obj:tb,reach:1.3*T,near:2.4*T,tall:2*T,act:()=>{ TREES.want=it; }});
      for(let k=0;k<3;k++){ const a=hs(i,k,2)*6.28, r=it.r*(.35+.3*hs(i,k,3)); SP.push({x:it.x+Math.cos(a)*r,y:it.y+(it.top-it.y)*(.62+.2*hs(i,k,4)),z:it.z+Math.sin(a)*r,f,key:'tree:'+i+':'+k,i:SP.length}); } }
    const IM=new THREE.InstancedMesh(new THREE.SphereGeometry(.5,6,5),new THREE.MeshLambertMaterial({color:0xffffff}),Math.max(1,SP.length)), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color(); IM.count=SP.length; g.add(IM);
    const show=(s,on)=>{ IM.setMatrixAt(s.i,m4.compose(new THREE.Vector3(s.x,s.y,s.z),q,new THREE.Vector3(1,1,1).multiplyScalar(on?.22*T:0))); IM.setColorAt(s.i,c.setHex(s.f[3])); IM.instanceMatrix.needsUpdate=true; if(IM.instanceColor)IM.instanceColor.needsUpdate=true; if(s.hb)s.hb.visible=on; };
    for(const s of SP){ s.hb=new THREE.Mesh(new THREE.BoxGeometry(.7*T,.7*T,.7*T),new THREE.MeshBasicMaterial({visible:false})); s.hb.position.set(s.x,s.y,s.z); g.add(s.hb); show(s,INV.ready(s.key));
      UI.thing({name:s.f[1],obj:s.hb,reach:1.4*T,near:2.4*T,tall:.7*T,act:()=>{ if(!INV.ready(s.key))return; if(SHARED.py<s.y-1.6*T)return say('TOO HIGH TO REACH. CLIMB THE TREE.','#c8a090');
        const fl=s.f===BL, ok=FORAGE.use?FORAGE.use(fl?'garden':'forage',0,45):true; INV.picked[s.key]=day(); INV.add('x',0); delete INV.items.x; show(s,false); if(!ok)return say('IT DROPS AND IS LOST IN THE LEAVES.','#c8a090'); FORAGE.give(s.f[0],1); say(fl?'YOU PICK OAK BLOSSOMS.':'YOU PICK A '+s.f[1]+'.'); }}); }
    SYS.add('life',()=>{ const dd=day(); if(dd===TREES.d)return; TREES.d=dd; for(const s of SP)show(s,INV.ready(s.key)); },'144e-trees'); TREES.spots=SP.length; });
  window.TREESDBG=()=>({climbing:!!C.it,h:TREES.h,spots:TREES.spots||0,climbs:(MODS.climbs||[]).length}); }
