// SKELETON GUARDS ON THE RIG: the dungeon skeletons show as rig-bodies walking the player's gait; the hidden skinned skeleton still drives their combat timing (hits, bolts, death). No attack animation, by the owner's choice.
import {THREE} from './003-shx.js';
import {NPCS, pos} from './003b-systems.js';
import {SYS, TILE, ZU} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
const SKELRIG={seen:new Set()}; window.SKELRIG=SKELRIG;
{ const DATA=SYS.far(__LAZY__("data/skelbodies.json")); let BM=null;
  DATA().then(J=>{ BM={}; for(const k of ['Warrior','Mage','Minion','Rogue'])BM[k]=BODIES.rebakedBody(J,k); }).catch(e=>console.warn('SKELRIG',e));
  const YS=ZU*24/TILE;
  const add=N=>{ '@later'; const body=BM[N.skelChar]; if(!body)return; const {me,PM}=BODIES.mesh(body), grp=new THREE.Group(), k=body.height*N.H/(2.166*52);
    grp.scale.set(k,k*YS,k); grp.add(me); N.g.add(grp);
    for(const m of N.g.children)if(m!==grp)m.visible=false;   // hide the skinned skeleton (and its gear)
    N.rigOv={grp,PM,body,SR:RIG.create(),px:N.st.x,pz:N.st.z,mv:0}; SKELRIG.seen.add(N); };
  SYS.add('dress',dt=>{ if(!BM)return; dt=dt||1/60;
    for(const N of NPCS){ if(!N.skelChar)continue;
      if(!N.rigOv){ if(N.g&&N.H)add(N); continue; }
      const O=N.rigOv, sp=Math.hypot(N.st.x-O.px,N.st.z-O.pz)/dt; O.px=N.st.x; O.pz=N.st.z;
      if(N.far||N.hid||!N.g.visible||Math.hypot(N.st.x-pos.x,N.st.z-pos.z)>40)continue;   // posed only near you, like the walker bodies
      O.mv+=(((sp>0.25*TILE)?1:0)-O.mv)*Math.min(1,dt*6); O.SR.target=O.mv; RIG.step(O.SR,dt);
      const B=RIG.pose(O.SR,true); BODIES.pose(B,O.PM,O.body); }
  },'skeleton rig overlay');
}
