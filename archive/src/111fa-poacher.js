// THE EGG POACHER: the owner's character-maker .glb (data/full/egg-poacher.glb) re-baked onto the player's 15-bone rig (rig-rebake.py poacher -> data/poacher.json) in its own colours: a townsperson who walks main street (?poacher=0 keeps it off), not playable.
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
{ const DATA=__LAZY__("data/poacher.json");
  SYS.onStart(()=>DATA().then(J=>BODIES.rebaked(J,'poacher','THE EGG POACHER',52,{size:1.7/1.8})).catch(e=>console.warn('POACHER',e)),'111fa-poacher'); }
