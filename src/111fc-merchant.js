// THE MERCHANT: polyfork.dev's Merchant (data/merchant.json, tools/polyfork-bake.py) on your rig, a body you can play as from YOU's BODY row; it loads just after the start and does not walk the street itself (the flea market's TRADER wears the same model).
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
{ const DATA=__LAZY__("data/merchant.json");
  SYS.onStart(()=>DATA().then(J=>BODIES.rebaked(J,'merchant','MERCHANT',null,{playable:true})).catch(e=>console.warn('MERCHANT',e)),'111fc-merchant'); }
