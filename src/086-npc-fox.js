// THE CREATURE MAKERS: CREATURES gathers the creature makers (data/creatures.json), loaded just after the start.
import {SYS} from './006-map-pre.js';

const CREATURES={};   // the creature makers (data/creatures.json); filled by the lazy load just after the start
const CREATURESREADY=new Promise(res=>{ const L=SYS.far(__LAZY__("data/creatures.json")), go=()=>SYS.started?L().then(J=>{ Object.assign(CREATURES,J); res(CREATURES); }).catch(e=>{ console.warn('CREATURES',e); res(CREATURES); }):setTimeout(go,600); go(); });
export {CREATURES, CREATURESREADY};
