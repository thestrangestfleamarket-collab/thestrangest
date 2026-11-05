// FRESHNESS: FRESH ages every perishable thing you carry (LASTS h in the ITEM editor; 0 is the kind's own: a fish a day, other food two days; by real hours) in lots from when you got it; the bands FRESH, GOOD, STALE and SPOILED set what it sells for (whole, four fifths, two fifths, nothing); every shop prices through FRESH.worth.
import {INV, ITEMS} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {QS, SYS} from './006-map-pre.js';
const FRESH={};
{ const KEY='fresh', H=()=>Date.now()/3600000; let L={}; try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1)L=D.lots||{}; }catch(e){} if(QS.get('fresh')&&QS.get('keepinv')!=='1')L={};
  const save=()=>OWNED.set(KEY,JSON.stringify({v:1,lots:L}));
  FRESH.lasts=id=>{ const v=+ITEMS.prop(id,'lasts')||0; if(v>0)return v; if(!ITEMS.prop(id,'edible'))return 0; const w=ITEMS.prop(id,'water'); return w&&w!=='none'?24:48; };
  FRESH.BANDS=[['FRESH',.5,1],['GOOD',1,.8],['STALE',2,.4],['SPOILED',Infinity,0]];
  FRESH.band=(age,id)=>{ const l=FRESH.lasts(id); if(!l)return null; const r=age/l; return FRESH.BANDS.find(b=>r<b[1]); };
  // the lots follow the count: more than the lots hold is new (stamped now), fewer takes from the oldest first, so every way of getting or losing a thing is covered
  const fit=id=>{ if(!FRESH.lasts(id)){ if(L[id]){ delete L[id]; save(); } return []; } const lots=L[id]||(L[id]=[]), n=INV.items[id]||0, have=lots.reduce((a,l)=>a+l[1],0); let ch=false;
    if(n>have){ lots.push([H(),n-have]); ch=true; } else if(n<have){ let d=have-n; while(d>0&&lots.length){ const l=lots[0]; if(l[1]<=d){ d-=l[1]; lots.shift(); } else { l[1]-=d; d=0; } } ch=true; } if(!lots.length)delete L[id]; if(ch)save(); return lots; };
  FRESH.lots=id=>fit(id).map(([t,n])=>({age:H()-t,n,band:FRESH.band(H()-t,id)}));
  FRESH.worth=(id,n,unit)=>{ unit=unit??(+ITEMS.prop(id,'value')||0); const lots=fit(id); if(!lots.length)return unit*n; let left=n, v=0; for(const [t,c] of lots){ const k=Math.min(c,left); v+=unit*k*FRESH.band(H()-t,id)[2]; left-=k; if(!left)break; } return Math.round(v+unit*Math.max(0,left)); };
  FRESH.tag=id=>{ const lots=fit(id); return lots.length?FRESH.band(H()-lots[0][0],id)[0]:''; };
  FRESH.spoiled=id=>fit(id).filter(([t])=>FRESH.band(H()-t,id)[2]===0).reduce((a,l)=>a+l[1],0);
  FRESH.age=(id,h)=>{ for(const l of fit(id))l[0]-=h; save(); };
  SYS.every(()=>{ for(const id in INV.items)if(FRESH.lasts(id))fit(id); for(const id in L)if(!INV.items[id])delete L[id]; },5000,'140c-fresh');
  window.FRESH=FRESH; }
export {FRESH};
