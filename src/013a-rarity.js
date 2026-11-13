// THE RARITY: RARITY is the one rule for every thing's rarity, five of them (owner, 11 Nov 2026): JUNK, ODD, STRANGE, STRANGER, THE STRANGEST (j c r x s). A find rolls 55, 25, 12, 6, 2 in a hundred; STRANGER shows once that skill's trainer ranks you JOURNEYMAN, THE STRANGEST from EXPERT (TRAINERS.open); a ground's kinds are c, r, s (and j, x where it has them), a tier it lacks falls to the one below. RARITY.of(id) is any thing's rarity, 0 to 4.
import {ITEMS, TRAINERS} from './003b-systems.js';
const RARITY={ALL:['j','c','r','x','s'],TIERS:['c','r','s'],ODDS5:{j:.55,c:.25,r:.12,x:.06,s:.02},
  NAMES:{j:'JUNK',c:'ODD',r:'STRANGE',x:'STRANGER',s:'THE STRANGEST'},
  COL:['#b8c0c8','#7dffa8','#4fb4ff','#c57dff','#ffcf3f'],
  WORD:['junk','common','rare','stranger','super']};
{ const R=RARITY, A=R.ALL;
  R.open=skill=>!!(TRAINERS&&TRAINERS.open(skill));
  R.openX=skill=>!!(TRAINERS&&TRAINERS.rank&&TRAINERS.rank(skill)>=2);
  // the roll, all five: a gated tier gives the one below
  R.pick5=(r,skill)=>{ const O=R.ODDS5; let t=r<O.j?'j':r<O.j+O.c?'c':r<O.j+O.c+O.r?'r':r<1-O.s?'x':'s'; if(t==='s'&&!R.open(skill))t='x'; if(t==='x'&&!R.openX(skill))t='r'; return t; };
  // the roll on a ground of c, r and s: JUNK is the ground's c, STRANGER its r
  R.pick=(r,skill)=>({j:'c',c:'c',r:'r',x:'r',s:'s'})[R.pick5(r,skill)];
  R.ODDS={c:R.ODDS5.j+R.ODDS5.c,r:R.ODDS5.r+R.ODDS5.x,s:R.ODDS5.s};
  // T is {j?, c, r, x?, s}, each one kind or a list of kinds; a tier the ground lacks falls to the one below, the bottom to the one above
  const has=v=>v!=null&&!(Array.isArray(v)&&!v.length);
  R.pickFrom=(T,r,skill,r2)=>{ const t=R.pick5(r,skill), i=A.indexOf(t); let k=null; for(let j=i;j>=0&&!k;j--)if(has(T[A[j]]))k=A[j]; for(let j=i+1;j<=1&&!k;j++)if(has(T[A[j]]))k=A[j]; if(!k)return undefined; const v=T[k]; return Array.isArray(v)?v[Math.floor(((r2??r)%1)*v.length)%v.length]:v; };
  R.tierOf=(T,k)=>{ for(const t of A){ const v=T[t]; if(v===k||Array.isArray(v)&&v.includes(k))return t; } return null; };
  // any thing's rarity 0..4: the item model's RARITY when set, else the tier its family gave it, else by its worth (shop goods)
  const W={junk:0,common:1,rare:2,stranger:3,super:4}, S={junk:0,odd:1,strange:2,stranger:3,strangest:4};
  R.byWorth=v=>v<=2?0:v<=20?1:v<=80?2:v<=250?3:4;
  R.of=id0=>{ if(id0==null)return 0; const id=String(id0).split('~')[0]; const set=ITEMS.prop&&ITEMS.prop(id,'rarity'); if(set in S)return S[set];
    const t=ITEMS.tiered&&ITEMS.tiered.has(id)?ITEMS.prop(id,'tier'):null; if(t in W)return W[t];
    return R.byWorth(+(ITEMS.prop&&ITEMS.prop(id,'value'))||0); };
  R.name=id=>R.NAMES[A[R.of(id)]]; R.col=id=>R.COL[R.of(id)];
  window.RARITY=RARITY; }
export {RARITY};
