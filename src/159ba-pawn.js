// THE PAWN SHOP (owner, 9 Nov 2026: Antiques & Pawn, "buys anything"): a keeper whose trade buys "pawn" buys any thing with a value at half of it and sells what was pawned, one stock shared by the section, at the full value (the Block keeps the stock and pays, worker/door.js pawn; off the website the stock lives in the page).
import {ARCHI, FORAGE, INV, ITEMS, ONLINE, SHOPS, TEXT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS} from './006-map-pre.js';
const PAWN={stock:{},BUY:.5};
{ const esc=TEXT.esc, val=id=>{ const v=+(ITEMS.prop&&ITEMS.prop(id,'value')); return v>0&&!ARCHI(id)?v:0; }, pays=id=>Math.max(1,Math.floor(val(id)*PAWN.BUY)), costs=id=>Math.ceil(val(id));
  const say=t=>SAY(t,'#f2c14e'), nm=id=>FORAGE.name?FORAGE.name(id):String(id).toUpperCase(), redraw=()=>{ if(SHOPS.draw)SHOPS.draw(); if(FORAGE.draw)FORAGE.draw(); };
  const on=()=>!!ONLINE.on, send=o=>ONLINE.send({t:'pw',...o});
  // the window's two lists: what is on the shelf (pawned by anyone), and what of yours they would take
  SHOPS.pawnRows=(row,have)=>{ let o=''; const S=Object.keys(PAWN.stock).filter(id=>PAWN.stock[id]>0&&val(id)).sort();
    o+=`<div class="shh">ON THE SHELF</div>`+(S.length?S.map(id=>row(id,`<u>x${PAWN.stock[id]}</u><i>$${costs(id)}</i>`,`data-pbuy="${esc(id)}"`,costs(id)>have?' no':'')).join(''):`<div class="shh" style="opacity:.6">NOTHING YET</div>`);
    const mine=Object.keys(INV.items).filter(id=>INV.items[id]>0&&val(id)).sort();
    if(mine.length)o+=`<div class="shh">THEY BUY</div>`+mine.map(id=>row(id,`<u>x${INV.items[id]}</u><i>$${pays(id)}</i>`,`data-pawn="${esc(id)}"`)).join('');
    return o; };
  SHOPS.pawnAsk=(r,n)=>{ const id=r.dataset.pbuy||r.dataset.pawn; return r.dataset.pbuy?`BUY ${nm(id)} FOR $${costs(id)}?`:`PAWN ${n>1?n+' ':''}${nm(id)} FOR $${pays(id)*n}?`; };
  PAWN.buy=id=>{ const p=costs(id); if(!p||!(PAWN.stock[id]>0))return false; if((INV.cash||0)<p){ say('YOU CANNOT AFFORD THAT.'); return false; }
    if(on()){ send({op:'buy',item:id,n:1,p}); return true; }
    INV.cash-=p; if(!--PAWN.stock[id])delete PAWN.stock[id]; FORAGE.give(id,1); say(`YOU BUY ${nm(id)} FOR $${p}.`); redraw(); return true; };
  PAWN.sell=(id,n)=>{ n=Math.min(n,INV.items[id]||0); if(n<1||!val(id))return false; FORAGE.take(id,n); if(INV.save)INV.save(); for(const f of FORAGE.SOLD||[])f(id,n,pays(id)*n);   // (what a sale clears goes as at any shop: a painting's title, a photo)
    if(on()){ send({op:'sell',item:id,n}); redraw(); return true; }
    const v=pays(id)*n; INV.cash+=v; PAWN.stock[id]=(PAWN.stock[id]||0)+n; say(`YOU PAWN ${n>1?n+' ':''}${nm(id)} FOR $${v}.`); redraw(); return true; };
  SHOPS.pawnDo=(r,n)=>r.dataset.pbuy?PAWN.buy(r.dataset.pbuy):PAWN.sell(r.dataset.pawn,n);
  ONLINE.hear.pw=m=>{ '@later'; const op=m.op;
    if(op==='list'){ PAWN.stock=m.all||{}; redraw(); return; }
    if(op==='one'){ if(m.n>0)PAWN.stock[m.id]=m.n; else delete PAWN.stock[m.id]; redraw(); return; }
    if(op==='paid'){ INV.cash=(INV.cash||0)+Math.max(0,+m.cash||0); if(INV.save)INV.save(); say(`YOU PAWN ${m.n>1?m.n+' ':''}${nm(m.item)} FOR $${m.cash}.`); redraw(); return; }
    if(op==='bought'){ INV.cash=Math.max(0,(INV.cash||0)-Math.max(0,+m.cost||0)); FORAGE.give(m.item,m.n); if(INV.save)INV.save(); say(`YOU BUY ${nm(m.item)} FOR $${m.cost}.`); redraw(); return; }
    if(op==='back'){ for(const k in m.items||{})FORAGE.give(k,m.items[k]); if(INV.save)INV.save(); say('THE PAWN SHOP: '+String(m.why||'NO').toUpperCase()+'.'); redraw(); return; }
    if(op==='no'){ say('THE PAWN SHOP: '+String(m.why||'NO').toUpperCase()+'.'); send({op:'list'}); } };
  SYS.add('hi',()=>{ send({op:'list'}); },'159ba-pawn');
  window.PAWN=PAWN; }
