// THE RPG TOWNSFOLK: six Quaternius classes re-baked onto the player's 15-bone rig (rig-rebake.py -> data/rpgbodies.json), walking the street on his gait instead of their own clips.
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
const RPGNPC={list:[]}; window.RPGNPC=RPGNPC;
{ const DATA=__LAZY__("data/rpgbodies.json");
  const KIND={ warrior:{name:'THE WARRIOR',metres:1.85,at:60}, cleric:{name:'THE CLERIC',metres:1.8,at:64}, monk:{name:'THE MONK',metres:1.75,at:68},
    ranger:{name:'THE RANGER',metres:1.8,at:74}, rogue:{name:'THE ROGUE',metres:1.7,at:82}, wizard:{name:'THE WIZARD',metres:1.85,at:86} };
  RPGNPC.load=()=>RPGNPC.wait||(RPGNPC.wait=DATA().then(J=>{ for(const k in KIND){ const K=KIND[k]; BODIES.rebaked(J,k,K.name,K.at,{size:K.metres/1.8});
    const b=BODIES.by[k]; if(b){ const N=b.npc||b; N.key=k; RPGNPC.list.push(N); RPGNPC[k]=N; } } return RPGNPC.list; }));
  SYS.onStart(()=>RPGNPC.load().catch(e=>console.warn('RPGNPC',e)),'111f-rpgfolk'); }
