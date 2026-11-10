// THE RARITY: RARITY is the one rule for every find (mushrooms, flowers, butterflies, fish, birds, honey, gems): a ground holds a common, a rare and a super-rare kind at 70, 25 and 5 in a hundred (owner, 5 Nov 2026); the super-rare shows only once your rank with that skill's trainer is high enough (TRAINERS.open), until then its roll gives the rare.
import {TRAINERS} from './003b-systems.js';
const RARITY={ODDS:{c:.7,r:.25,s:.05},TIERS:['c','r','s'],NAMES:{c:'COMMON',r:'RARE',s:'SUPER RARE'}};
{ RARITY.open=skill=>!!(TRAINERS&&TRAINERS.open(skill));
  RARITY.pick=(r,skill)=>r<.7?'c':r<.95?'r':RARITY.open(skill)?'s':'r';
  // T is {c, r, s}, each one kind or a list of kinds; a tier the ground lacks falls to the one below
  RARITY.pickFrom=(T,r,skill,r2)=>{ let t=RARITY.pick(r,skill); for(let i=0;i<2&&(T[t]==null||Array.isArray(T[t])&&!T[t].length);i++)t=t==='s'?'r':'c'; const v=T[t]; return Array.isArray(v)?v[Math.floor(((r2??r)%1)*v.length)%v.length]:v; };
  RARITY.tierOf=(T,k)=>{ for(const t of RARITY.TIERS){ const v=T[t]; if(v===k||Array.isArray(v)&&v.includes(k))return t; } return null; };
  window.RARITY=RARITY; }
export {RARITY};
