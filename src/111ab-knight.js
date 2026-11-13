// THE KNIGHT: the knight in plate (data/knight.json, baked by tools/knight-bake.py from the owner's animated .glb): THE ARMOURER on main street, and a body you can be.
import {BODIES} from './111a-bodies.js';
{ const D=__LAZY__("data/knight.json");
  const go=()=>window.__started?D().then(J=>BODIES.rebaked(J,'knight','KNIGHT',76,{playable:true})).catch(e=>console.warn('KNIGHT',e)):setTimeout(go,600); go();
}
