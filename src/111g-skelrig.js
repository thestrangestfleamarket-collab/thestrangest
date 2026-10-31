// COMBAT NPCs ON THE RIG: the dungeon skeletons and the pawns (ogres, skeleton pawns) show as rig-bodies walking the player's gait; the hidden skinned body still drives their combat timing (hits, bolts, death). No attack animation, by the owner's choice. (Golem copies keep their stone skinned body.)
import {THREE} from './003-shx.js';
import {NPCS} from './003b-systems.js';
import {SYS, TILE, ZU} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
const SKELRIG={seen:new Set()}; window.SKELRIG=SKELRIG;
{ const SKD=__LAZY__("data/skelbodies.json"), PWD=__LAZY__("data/pawnbodies.json"); let SKB=null, PWB=null;
  SKD().then(J=>{ SKB={}; for(const k in J.bodies)SKB[k]=BODIES.rebakedBody(J,k); }).catch(e=>console.warn('SKELRIG skel',e));
  PWD().then(J=>{ PWB={}; for(const k in J.bodies)PWB[k]=BODIES.rebakedBody(J,k); }).catch(e=>console.warn('SKELRIG pawn',e));
  const YS=ZU*24/TILE;
  const PEOPLE=new Set(['hero_m','hero_f','villager_m','villager_f']);
  const bodyOf=N=>{ if(N.skelChar)return SKB&&SKB[N.skelChar]; if(!N.pawnKind||!PWB)return null;
    if(N.copy)return PEOPLE.has(N.pawnKind)?PWB[N.pawnKind+'_golem']:null;   // a golem copy -> its stone body
    return PWB[N.pawnKind]; };
  const add=(N,body)=>{ const {me,PM}=BODIES.mesh(body), grp=new THREE.Group(), k=body.height*N.H/((N.tall0||2.166)*52);
    grp.scale.set(k,k*YS,k); grp.add(me); N.g.add(grp);
    for(const m of N.g.children)if(m!==grp)m.visible=false;   // hide the skinned body (and its gear)
    N.rigOv={grp,PM,body,SR:RIG.create(),px:N.st.x,pz:N.st.z,mv:0}; SKELRIG.seen.add(N); };
  SYS.add('dress',dt=>{ dt=dt||1/60;
    for(const N of NPCS){ if(!N.skelChar&&!N.pawnKind)continue;
      if(!N.rigOv){ const body=bodyOf(N); if(body&&N.g&&N.H)add(N,body); continue; }
      const O=N.rigOv, sp=Math.hypot(N.st.x-O.px,N.st.z-O.pz)/dt; O.px=N.st.x; O.pz=N.st.z;
      O.mv+=(((sp>0.25*TILE)?1:0)-O.mv)*Math.min(1,dt*6); O.SR.target=O.mv; RIG.step(O.SR,dt);
      const B=RIG.pose(O.SR,true); BODIES.pose(B,O.PM,O.body); }
  },'rig overlay (skeletons, pawns)');
}
