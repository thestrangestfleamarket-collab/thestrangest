// THE VAULT, YOUR SAFE (owner, 5 Nov 2026; a safe, UO's rules, 11 Nov 2026): stand by or in the bank and say BANK in chat: your safe opens, what you carry on one side and the safe on the other (click moves one, shift-click all), and your gold (the account); kept with your things (OWNED: on the server on the website). Once, everything but what you wear and your tools went into it, and your gold.
import {SHARED} from './003-shx.js';
import {BAG, EQUIP, FORAGE, INV, ITEMS, pos, VAULT, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {QS, SYS, TILE, WP} from './006-map-pre.js';
import {BANKK} from './146zm-bank.js';
{ const say=(t,c)=>SAY(t,c||'#e8e2cc');
  const read=()=>{ try{ const v=OWNED.get('vault'), o=typeof v==='string'?JSON.parse(v):v; return o&&o.v===1&&o.items?o:{v:1,items:{}}; }catch(e){ return {v:1,items:{}}; } };
  const write=o=>{ try{ OWNED.set('vault',JSON.stringify(o)); }catch(e){} };
  // near the bank: in front of its lot on Market St, or inside it
  VAULT.near=()=>{ const b=WP.bank; if(!b||!SHARED.BOD.MX)return false; const x=SHARED.BOD.MX(pos.x), y=SHARED.BOD.MY(pos.z); return x>b.x0-4&&x<b.x1+4&&(b.y1!=null?y>b.y0-8&&y<b.y1+1:y>-96&&y<-62); };   // (a Hudson-row bank faces the river: its promenade side and inside its lot)
  const name=id=>(FORAGE.NM&&FORAGE.NM[id])||String(id).toUpperCase().replace(/_/g,' ');
  const movable=id=>!String(id).includes('~')&&!(ITEMS.prop&&ITEMS.prop(id,'container'));
  const W=document.createElement('div'); W.id='vaultw'; W.hidden=true;
  W.style.cssText='position:fixed;left:50%;top:12%;transform:translateX(-50%);width:min(620px,94vw);max-height:76vh;overflow:auto;z-index:22;padding:14px 16px;font:11px Silkscreen,monospace;color:#e8e2cc;background:linear-gradient(160deg,#4a4f56,#2c3036 55%,#22252a);border:6px solid #15171a;outline:2px solid #6b7178;border-radius:10px;box-shadow:inset 0 0 0 2px #5a6068,inset 0 0 40px rgba(0,0,0,.55),0 10px 34px rgba(0,0,0,.7)';
  document.body.appendChild(W); for(const ev of ['keydown','keyup'])W.addEventListener(ev,e=>e.stopPropagation());
  const B='style="font:inherit;color:#e8e2cc;background:#1c1f23;border:2px solid #5a6068;padding:3px 8px;cursor:pointer"';
  const DIAL='<div style="width:34px;height:34px;border-radius:50%;background:radial-gradient(circle,#c9a64a 0 18%,#8a9098 20% 56%,#3a3e44 58% 64%,#9aa0a8 66%);box-shadow:0 0 0 2px #15171a;flex:none"></div>';
  const row=(id,n,side)=>`<button data-m="${side}" data-id="${id}" style="display:flex;gap:8px;align-items:center;width:100%;text-align:left;margin:2px 0;font:inherit;color:#e8e2cc;background:#1c1f23;border:1px solid #444a52;padding:3px 6px;cursor:pointer">`
    +`<img src="${BAG.icon?BAG.icon(id):''}" alt="" style="width:22px;height:22px;image-rendering:pixelated"><span style="flex:1">${name(id)}</span><span>x${n}</span></button>`;
  const draw=()=>{ '@later'; if(W.hidden)return; const V=read(), mine=(BAG.contents?BAG.contents('bag'):Object.keys(INV.items)).filter(movable), acct=BANKK.account?BANKK.account():{bal:0};
    let o='<div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">'+DIAL+'<b style="flex:1;color:#f2c14e;font-size:12px">YOUR SAFE · THE BANK</b><button '+B+' data-x="1">X</button></div>';
    o+=`<div style="margin-bottom:10px;padding:6px 8px;background:rgba(0,0,0,.3);border:1px solid #444a52">GOLD ON YOU <b style="color:#f2c14e">$${Math.round(INV.cash)}</b> · IN THE SAFE <b style="color:#f2c14e">$${acct.bal}</b><div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><button ${B} data-c="-10">TAKE OUT $10</button><button ${B} data-c="-100">TAKE OUT $100</button><button ${B} data-c="all">PUT IN ALL</button></div></div>`;
    o+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div><div style="color:#aab0b8;margin-bottom:4px">ON YOU (CLICK: INTO THE SAFE)</div>'+(mine.map(id=>row(id,BAG.have?BAG.have(id,'bag'):INV.items[id],'in')).join('')||'<div style="color:#7d828a">NOTHING.</div>')+'</div>';
    o+='<div><div style="color:#aab0b8;margin-bottom:4px">THE SAFE (CLICK: TAKE IT WITH YOU)</div>'+(Object.keys(V.items).filter(id=>V.items[id]>0).sort().map(id=>row(id,V.items[id],'out')).join('')||'<div style="color:#7d828a">EMPTY.</div>')+'</div></div>';
    o+='<div style="color:#7d828a;margin-top:8px">SHIFT-CLICK MOVES THEM ALL. SHOPS TAKE WHAT YOU DO NOT CARRY FROM HERE; WHAT YOU CARRY YOU DROP IF YOU DIE.</div>'; W.innerHTML=o; };
  W.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b)return; const d=b.dataset;
    if(d.x){ W.hidden=true; return; }
    if(d.c){ const n=d.c==='all'?INV.cash:+d.c, r=BANKK.move?BANKK.move(Math.trunc(n)):null; if(typeof r==='string')say(r,'#c8a090'); draw(); return; }
    if(d.m){ const id=d.id; if(d.m==='in'){ const have=BAG.have?BAG.have(id,'bag'):INV.items[id]||0; VAULT.put(id,e.shiftKey?have:1); } else VAULT.take(id,e.shiftKey?read().items[id]:1); draw(); } });
  // a thing (n of it) into the safe from what you carry, or out of the safe to carry; what moved is returned
  VAULT.put=(id,n=1)=>{ const V=read(), have=BAG.have?BAG.have(id,'bag'):INV.items[id]||0; n=Math.min(n,have); if(!(n>0)||!movable(id))return 0; FORAGE.take(id,n); V.items[id]=(V.items[id]||0)+n; write(V); if(FORAGE.save)FORAGE.save(); if(BAG.draw)BAG.draw(); return n; };
  VAULT.take=(id,n=1)=>{ const V=read(); n=Math.min(n,V.items[id]||0); if(!(n>0))return 0; V.items[id]-=n; if(V.items[id]<=0)delete V.items[id]; write(V); FORAGE.give(id,n); if(FORAGE.save)FORAGE.save(); if(BAG.draw)BAG.draw(); return n; };
  VAULT.open=()=>{ if(!VAULT.near())return say('YOU NEED TO BE AT THE BANK.','#c8a090'); W.hidden=false; draw(); };
  VAULT.close=()=>{ W.hidden=true; };
  VAULT.items=()=>Object.assign({},read().items);
  VAULT.moved=()=>!!read().moved; VAULT.spot=()=>{ const b=WP.bank, B=SHARED.BOD; return b&&[((b.x0+b.x1)/2-B.OX)*TILE,((b.y1!=null?b.y0-2:-70)-B.OY)*TILE]; };   // (tests: where to stand to say BANK)
  // once for every player (owner, 11 Nov 2026): what you carry goes into the safe but what you wear or hold and your tools (an item worn or held, or not used up), and your gold
  VAULT.keeps=id=>{ const p=k=>ITEMS.prop?ITEMS.prop(String(id).split('~')[0],k):undefined, on=p('slot'); return Object.values(EQUIP.by||{}).includes(id)||WIELD.on===id||!!(on&&on!=='none')||!!p('reuse'); };
  VAULT.moveIn=()=>{ const V=read(); if(V.moved)return false; let n=0; for(const id of (BAG.contents?BAG.contents('bag'):Object.keys(INV.items)).filter(movable)){ if(VAULT.keeps(id))continue; const h=BAG.have?BAG.have(id,'bag'):INV.items[id]||0; if(h<1)continue; FORAGE.take(id,h); V.items[id]=(V.items[id]||0)+h; n+=h; }
    V.moved=1; write(V); if(FORAGE.save)FORAGE.save(); const c=Math.trunc(INV.cash||0); if(c>0&&BANKK.move)BANKK.move(c); if(BAG.draw)BAG.draw();
    if(n||c>0)say('YOUR THINGS AND YOUR GOLD ARE IN YOUR SAFE AT THE BANK. SAY BANK THERE TO OPEN IT. SHOPS TAKE WHAT YOU DO NOT CARRY FROM IT.','#f2c14e'); return true; };
  if(!QS.get('fresh')||QS.get('bank')==='1')SYS.onStart(()=>setTimeout(()=>VAULT.moveIn(),2000),'146zmb-vault-move'); }   // (after the start's own gifts; a test's fresh page only with ?bank=1)
