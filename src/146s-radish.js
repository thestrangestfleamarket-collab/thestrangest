// THE OFF-WORLD SEEDS: RADISH.PLANTS, the star cucumber, sun pepper and humming bean (seed, fruit, colours, hours to fruit), and the pot, dirt and rain's names; the Radish himself is archived (owner, 5 Nov 2026).
import {FORAGE} from './003b-systems.js';
import {TILE} from './006-map-pre.js';
const RADISH={}; window.RADISH=RADISH;
{ const T=TILE;
  // each seed: its fruit, its colours, how many game hours of wet dirt to first fruit, and to each one after
  RADISH.PLANTS={star:{seed:'seed_star',fruit:'fr_star',name:'STAR CUCUMBER',leaf:0x4a8a4a,fr:0xc8e8a0,shape:'star',first:24,next:10},
    sun:{seed:'seed_sun',fruit:'fr_sun',name:'SUN PEPPER',leaf:0x3e7a3a,fr:0xf2a020,shape:'pepper',first:36,next:14,glow:1},
    hum:{seed:'seed_hum',fruit:'fr_hum',name:'HUMMING BEAN',leaf:0x5a8a3a,fr:0x8a5ac8,shape:'pod',first:16,next:6}};
  const NM={pot:'CLAY POT',dirt:'BAG OF DIRT',water:'JUG OF RAIN'}; for(const k in RADISH.PLANTS){ const P=RADISH.PLANTS[k]; NM[P.seed]=P.name+' SEEDS'; NM[P.fruit]=P.name; }
  FORAGE.add({names:NM});
}
export {RADISH};
