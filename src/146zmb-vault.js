// THE VAULT (owner, 5 Nov 2026): stand by the bank and say BANK in chat: your vault opens, a container window like the bag, your bag on one side and the vault on the other (click moves one, shift-click all), and your account's cash; kept with your things (OWNED: on the server on the website).
import {SHARED} from './003-shx.js';
import {BAG, FORAGE, INV, ITEMS, pos, VAULT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {WP} from './006-map-pre.js';
import {RARITY} from './013a-rarity.js';
import {BANKK} from './146zm-bank.js';
{ const say=(t,c)=>SAY(t,c||'#e8e2cc');
  const read=()=>{ try{ const v=OWNED.get('vault'), o=typeof v==='string'?JSON.parse(v):v; return o&&o.v===1&&o.items?o:{v:1,items:{}}; }catch(e){ return {v:1,items:{}}; } };
  const write=o=>{ try{ OWNED.set('vault',JSON.stringify(o)); }catch(e){} };
  // near the bank: in front of its lot on Market St, or inside it
  VAULT.near=()=>{ const b=WP.bank; if(!b||!SHARED.BOD.MX)return false; const x=SHARED.BOD.MX(pos.x), y=SHARED.BOD.MY(pos.z); return x>b.x0-4&&x<b.x1+4&&(b.y1!=null?y>b.y0-8&&y<b.y1+1:y>-96&&y<-62); };   // (a Hudson-row bank faces the river: its promenade side and inside its lot)
  const name=id=>(FORAGE.NM&&FORAGE.NM[id])||String(id).toUpperCase().replace(/_/g,' ');
  const movable=id=>!String(id).includes('~')&&!(ITEMS.prop&&ITEMS.prop(id,'container'));
  const W=document.createElement('div'); W.id='vaultw'; W.hidden=true;
  W.style.cssText='position:fixed;left:50%;top:12%;transform:translateX(-50%);width:min(620px,94vw);max-height:76vh;overflow:auto;z-index:22;padding:14px 16px;font:11px Silkscreen,monospace;color:#e8e2cc;background:#2a2622;border:3px solid #6a5a3a;border-radius:6px;box-shadow:0 8px 30px rgba(0,0,0,.6)';
  document.body.appendChild(W); for(const ev of ['keydown','keyup'])W.addEventListener(ev,e=>e.stopPropagation());
  const B='style="font:inherit;color:#e8e2cc;background:#1a1816;border:2px solid #4a4038;padding:3px 8px;cursor:pointer"';
  const row=(id,n,side)=>`<button ${B} data-m="${side}" data-id="${id}" style="display:flex;gap:8px;align-items:center;width:100%;text-align:left;margin:2px 0;font:inherit;color:#e8e2cc;background:#1a1816;border:1px solid #3a3430;padding:3px 6px;cursor:pointer">`
    +`<img data-card="${id}" src="${BAG.icon?BAG.icon(id):''}" alt="" style="width:22px;height:22px;image-rendering:pixelated;border-bottom:3px solid ${RARITY.col(id)}"><span style="flex:1">${name(id)}</span><span>x${n}</span></button>`;
  const draw=()=>{ '@later'; if(W.hidden)return; const V=read(), mine=(BAG.contents?BAG.contents('bag'):Object.keys(INV.items)).filter(movable), acct=BANKK.account?BANKK.account():{bal:0};
    let o='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="color:#f2c14e;font-size:12px">YOUR VAULT · THE BANK</b><button '+B+' data-x="1">X</button></div>';
    o+=`<div style="margin-bottom:10px">CASH ON YOU $${Math.round(INV.cash)} · IN THE ACCOUNT $${acct.bal} <button ${B} data-c="100">PUT IN $100</button> <button ${B} data-c="-100">TAKE OUT $100</button> <button ${B} data-c="all">PUT IN ALL</button></div>`;
    o+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div><div style="color:#9b9584;margin-bottom:4px">YOUR BAG (CLICK: INTO THE VAULT)</div>'+(mine.map(id=>row(id,BAG.have?BAG.have(id,'bag'):INV.items[id],'in')).join('')||'<div style="color:#7d7a70">EMPTY.</div>')+'</div>';
    o+='<div><div style="color:#9b9584;margin-bottom:4px">THE VAULT (CLICK: INTO YOUR BAG)</div>'+(Object.keys(V.items).filter(id=>V.items[id]>0).sort().map(id=>row(id,V.items[id],'out')).join('')||'<div style="color:#7d7a70">EMPTY.</div>')+'</div></div>';
    o+='<div style="color:#7d7a70;margin-top:8px">SHIFT-CLICK MOVES THEM ALL.</div>'; W.innerHTML=o; };
  W.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b)return; const d=b.dataset;
    if(d.x){ W.hidden=true; return; }
    if(d.c){ const n=d.c==='all'?INV.cash:+d.c, r=BANKK.move?BANKK.move(Math.trunc(n)):null; if(typeof r==='string')say(r,'#c8a090'); draw(); return; }
    if(d.m){ const id=d.id, V=read(); if(d.m==='in'){ const have=BAG.have?BAG.have(id,'bag'):INV.items[id]||0, n=e.shiftKey?have:Math.min(1,have); if(n<1)return; FORAGE.take(id,n); V.items[id]=(V.items[id]||0)+n; }
      else { const n=e.shiftKey?V.items[id]:1; if(!(n>0))return; V.items[id]-=n; if(V.items[id]<=0)delete V.items[id]; FORAGE.give(id,n); }
      write(V); if(FORAGE.save)FORAGE.save(); if(BAG.draw)BAG.draw(); draw(); } });
  VAULT.open=()=>{ if(!VAULT.near())return say('YOU NEED TO BE AT THE BANK.','#c8a090'); W.hidden=false; draw(); };
  VAULT.close=()=>{ W.hidden=true; };
  VAULT.items=()=>Object.assign({},read().items); }
