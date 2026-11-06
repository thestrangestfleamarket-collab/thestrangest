// WORTH: WORTH.of is the one price path every shop and trainer pays through (a thing's value times how many, or the unit you give); nothing decays and nothing wears (owner, 5 Nov 2026: "closer to ultima online rules. food doesnt decay, fishing poles dont wear out").
import {ITEMS} from './003b-systems.js';
const WORTH={};
{ WORTH.of=(id,n,unit)=>Math.round((unit??(+ITEMS.prop(id,'value')||0))*n); window.WORTH=WORTH; }
export {WORTH};
