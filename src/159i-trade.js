// SWAP, the trade between players: double-click a player who is standing to ask them to trade; each puts things from the pack and cash in, both ACCEPT, and the block's server tells both games to swap them (a gift is a trade with nothing back).
import {ARCHI, FORAGE, INV, ONLINE, PASSPORT, TEXT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {SYS} from './006-map-pre.js';
import {PAINTINGS} from './159h-paintings.js';
const SWAP={no:[id=>ARCHI(id)||id==='passport'||id.startsWith('photo_')||id.startsWith('wip_')]}; window.SWAP=SWAP;
{
  const say=(t,c)=>SAY(t,c||'#e8e2cc'), esc=TEXT.esc, B='font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer';
  let T=null, ask=null, sendT=0;   // T: {with,name,mine:{items,cash},theirs,okMe,okThem}; ask: {from,name,until}
  const P=document.createElement('div'); P.id='tradep'; P.hidden=true; P.setAttribute('role','dialog');
  P.style.cssText='position:fixed;left:50%;top:8%;transform:translateX(-50%);width:min(620px,94vw);max-height:84vh;overflow:auto;z-index:22;padding:14px 16px;box-sizing:border-box;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(P); for(const t of ['keydown','keyup','keypress'])P.addEventListener(t,e=>{ if(e.key==='Escape'&&t==='keydown')SWAP.cancel(); e.stopPropagation(); });
  const Q=document.createElement('div'); Q.id='tradeq'; Q.hidden=true; Q.style.cssText=P.style.cssText.replace('top:8%','top:16%').replace('width:min(620px,94vw)','width:min(340px,92vw)'); document.body.appendChild(Q);
  Q.addEventListener('keydown',e=>e.stopPropagation());
  const can=id=>INV.items[id]>0&&!SWAP.no.some(f=>{ try{ return f(id); }catch(e){ return false; } });
  const nm=id=>FORAGE.name?FORAGE.name(id):id;
  const cash=()=>Math.floor(INV.cash||0);

  /* ---------- asking and being asked ---------- */
  PASSPORT.trade=o=>SWAP.ask(o); ONLINE.useUp=o=>(ONLINE.botUse&&ONLINE.botUse(o))||(PASSPORT.show?PASSPORT.show(o):SWAP.ask(o));   // an owner's own bot opens its window (136ca); anyone else's ID card shows (owner, 8 Nov 2026), its ASK TO TRADE asks them to trade
  let pre=null;   // a thing dragged onto them goes in as soon as the trade opens
  SWAP.ask=(o,put)=>{ if(!ONLINE.on)return say('TRADING NEEDS THE BLOCK: YOU ARE NOT ONLINE.','#c8a090'); if(T)return say('YOU ARE ALREADY TRADING.','#c8a090'); pre=put&&put.id?put:null;
    ONLINE.send({t:'tr',op:'ask',to:o.id}); say('YOU ASK '+(o.name||'THEM')+' TO TRADE.'); };
  const asked=()=>{ '@later'; if(!ask){ Q.hidden=true; return; } Q.innerHTML=`<h3 style="margin:0 0 8px;color:#f2c14e;font:12px Silkscreen,monospace">TRADE</h3><div>${esc(ask.name||'A TENANT')} WANTS TO TRADE WITH YOU.</div>
      <div style="margin-top:10px;display:flex;gap:6px;justify-content:flex-end"><button data-a="no" style="${B}">NO</button><button data-a="yes" style="${B}">YES</button></div>`; Q.hidden=false; };
  Q.addEventListener('click',e=>{ const b=e.target.closest('[data-a]'); if(!b||!ask)return; ONLINE.send({t:'tr',op:b.dataset.a,to:ask.from}); ask=null; asked(); });
  setInterval(()=>{ if(ask&&performance.now()>ask.until){ ask=null; asked(); } },1000);

  /* ---------- what the server says ---------- */
  ONLINE.hear.tr=m=>{ '@later'; const op=m.op;
    if(op==='ask'){ if(T)return ONLINE.send({t:'tr',op:'no',to:m.from}); ask={from:String(m.from),name:String(m.name||''),until:performance.now()+30000}; asked(); return; }
    if(op==='no')return say((m.name||'THEY')+' DOES NOT WANT TO TRADE.','#c8a090');
    if(op==='far')return say('TOO FAR AWAY TO TRADE: WALK UP TO THEM.','#c8a090');
    if(op==='busy')return say('THEY ARE IN ANOTHER TRADE.','#c8a090');
    if(!T&&op==='x'&&m.back){ take(m.back); return say('THE TRADE FELL THROUGH. WHAT YOU PUT IN IS BACK.','#c8a090'); }
    if(!T&&op==='done'){ take(m.get||{}); return say('A TRADE CAME THROUGH.','#b8f0a0'); }
    if(op==='open'){ ask=null; asked(); T={with:String(m.with),name:String(m.name||'A TENANT'),mine:{items:{},cash:0},theirs:null,okMe:false,okThem:false,done:false}; if(pre&&can(pre.id)){ T.mine.items[pre.id]=Math.min(pre.n||1,INV.items[pre.id]); offer(); } pre=null; P.hidden=false; draw(); return; }
    if(!T)return;
    if(op==='st'){ T.theirs=m.theirs||null; T.okMe=!!m.okMe; T.okThem=!!m.okThem; draw(); return; }
    if(op==='pay'){ pay(m.give||{}); return; }
    if(op==='done'){ done(m); return; }
    if(op==='x'){ if(m.back)take(m.back); say('THE TRADE IS OFF'+(m.why?': '+String(m.why).toUpperCase():'')+(m.back?'. WHAT YOU PUT IN IS BACK':'')+'.','#c8a090'); shut(); } };
  let pend=false;
  const payload=()=>{ '@later'; const items={}, art={}; for(const id in T.mine.items){ const n=Math.min(T.mine.items[id],INV.items[id]||0); if(n>0&&can(id)){ items[id]=n; if(id.startsWith('pt_')&&window.PAINTINGS){ const a=PAINTINGS.meta(id.slice(3)); if(a)art[id.slice(3)]=a; } } } return {items,cash:Math.min(T.mine.cash,cash()),art}; };
  const flush=()=>{ clearTimeout(sendT); if(!T||!pend)return false; pend=false; ONLINE.send({t:'tr',op:'offer',o:payload()}); return true; };
  const offer=()=>{ pend=true; clearTimeout(sendT); sendT=setTimeout(flush,150); };   // the server takes one trade message each 100 ms
  // both accepted: what this game put in leaves the pack now, and the server is told what really left; only that changes hands
  const pay=g=>{ '@later'; const items={}, art={};
    for(const id in g.items||{}){ const n=Math.min(Math.floor(+g.items[id]||0),INV.items[id]||0); if(n>0){ FORAGE.take(id,n); items[id]=n; if(id.startsWith('pt_')&&window.PAINTINGS){ const k=id.slice(3); if(g.art&&g.art[k])art[k]=g.art[k]; PAINTINGS.gave(k); } } }
    const c=Math.min(Math.max(0,Math.floor(+g.cash||0)),cash()); INV.cash=cash()-c; if(INV.save)INV.save(); if(FORAGE.draw)FORAGE.draw();
    ONLINE.send({t:'tr',op:'paid',o:{items,cash:c,art}}); if(T){ T.paying=true; draw(); } };
  // things coming in: the other side's, or this side's own back
  const take=r=>{ '@later'; INV.cash=cash()+Math.max(0,Math.floor(+r.cash||0));
    for(const id in r.art||{})if(window.PAINTINGS)PAINTINGS.got(id,r.art[id]);
    for(const id in r.items||{}){ const n=Math.max(0,Math.floor(+r.items[id]||0)); if(n&&/^[a-z0-9_]{1,48}$/.test(id))FORAGE.give(id,n); }
    if(INV.save)INV.save(); if(FORAGE.draw)FORAGE.draw(); };
  SWAP.pay=pay; SWAP.take=take;
  const done=m=>{ '@later'; const g=m.give||{}, r=m.get||{}; take(r);
    const got=Object.keys(r.items||{}).length||r.cash, gave=Object.keys(g.items||{}).length||g.cash;
    const who=T?T.name:'THEM'; say(got&&gave?'TRADE DONE WITH '+who+'.':got?who+' GAVE YOU SOMETHING.':gave?'YOU GAVE IT TO '+who+'.':'TRADE DONE.','#b8f0a0'); shut(); };
  const shut=()=>{ T=null; P.hidden=true; P.innerHTML=''; };
  SWAP.cancel=()=>{ if(T&&T.paying)return; if(T)ONLINE.send({t:'tr',op:'x'}); shut(); };
  // what a trade left for you while you were away (the server keeps it in OWNED 'tradein')
  SYS.onStart(()=>{ let L=null; try{ L=JSON.parse(OWNED.get('tradein')||'null'); }catch(e){} if(!Array.isArray(L)||!L.length)return; OWNED.del('tradein'); for(const r of L)take(r||{}); say('A TRADE CAME THROUGH WHILE YOU WERE AWAY: IT IS IN YOUR BAG.','#b8f0a0'); },'159i-trade tradein');

  /* ---------- the window ---------- */
  const list=(o,mine)=>{ '@later'; const ks=Object.keys(o&&o.items||{}); let h=ks.map(id=>`<tr><td>${esc(nm(id))}</td><td style="text-align:right">×${o.items[id]}</td>${mine?`<td style="text-align:right"><button data-less="${esc(id)}" style="${B}" aria-label="One fewer">−</button></td>`:''}</tr>`).join('');
    if(o&&o.cash)h+=`<tr><td style="color:#f2c14e">CASH</td><td style="text-align:right;color:#f2c14e">$${Math.floor(o.cash).toLocaleString('en-US')}</td>${mine?'<td></td>':''}</tr>`;
    return h?`<table style="width:100%;border-collapse:collapse">${h}</table>`:'<div style="color:#9b9584">NOTHING YET.</div>'; };
  const draw=()=>{ '@later'; if(!T)return; const x=P.querySelector(':scope>.pX'); const pack=Object.keys(INV.items).filter(id=>can(id)&&(INV.items[id]-(T.mine.items[id]||0))>0).sort((a,b)=>nm(a).localeCompare(nm(b)));
    P.innerHTML=`<h3 style="margin:0 0 8px;color:#f2c14e;font:12px Silkscreen,monospace">TRADE WITH ${esc(T.name)}</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div><div style="color:#9b9584;margin-bottom:4px">YOU GIVE</div>${list(T.mine,true)}
          <div style="margin-top:6px;display:flex;gap:6px;align-items:center"><label for="trcash">CASH $</label><input id="trcash" type="number" min="0" max="${cash()}" step="1" value="${T.mine.cash||0}" style="width:90px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 4px"></div>
          <div style="margin-top:6px;color:${T.okMe?'#b8f0a0':'#9b9584'}">${T.okMe?'✓ YOU ACCEPT':'YOU HAVE NOT ACCEPTED'}</div></div>
        <div><div style="color:#9b9584;margin-bottom:4px">${esc(T.name)} GIVES</div>${list(T.theirs,false)}
          <div style="margin-top:6px;color:${T.okThem?'#b8f0a0':'#9b9584'}">${T.okThem?'✓ THEY ACCEPT':'THEY HAVE NOT ACCEPTED'}</div></div></div>
      <div style="margin-top:10px;color:#9b9584">ANY CHANGE TAKES BACK BOTH ACCEPTS. TO GIVE SOMETHING AWAY, PUT IT IN AND ACCEPT.</div>
      <div style="margin-top:8px;display:flex;gap:6px;justify-content:flex-end"><button data-x="1" style="${B}">CANCEL</button><button data-ok="1" style="${B}">${T.okMe?'TAKE BACK':'ACCEPT'}</button></div>
      <h3 style="margin:12px 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">YOUR PACK</h3>
      ${pack.length?`<table style="width:100%;border-collapse:collapse">${pack.map(id=>`<tr style="border-bottom:1px solid #22252f"><td>${esc(nm(id))}</td><td style="text-align:right;color:#9b9584">${INV.items[id]-(T.mine.items[id]||0)}</td><td style="text-align:right"><button data-add="${esc(id)}" style="${B}">PUT IN</button></td></tr>`).join('')}</table>`:'<div style="color:#9b9584">NOTHING YOU CAN TRADE.</div>'}`;
    if(x)P.appendChild(x); };
  P.addEventListener('click',e=>{ '@later'; if(!T||T.paying)return; const b=e.target.closest('button'); if(!b)return;
    if(b.dataset.add){ const id=b.dataset.add; if(can(id)&&(T.mine.items[id]||0)<INV.items[id]){ T.mine.items[id]=(T.mine.items[id]||0)+1; T.okMe=T.okThem=false; offer(); draw(); } }
    else if(b.dataset.less){ const id=b.dataset.less; if(T.mine.items[id]>1)T.mine.items[id]--; else delete T.mine.items[id]; T.okMe=T.okThem=false; offer(); draw(); }
    else if(b.dataset.ok){ const v=!T.okMe; if(flush())setTimeout(()=>{ if(T)ONLINE.send({t:'tr',op:'ok',v}); },160); else ONLINE.send({t:'tr',op:'ok',v}); }
    else if(b.dataset.x||b.classList.contains('pX'))SWAP.cancel(); });
  P.addEventListener('change',e=>{ if(!T||e.target.id!=='trcash')return; T.mine.cash=Math.max(0,Math.min(cash(),Math.floor(+e.target.value||0))); T.okMe=T.okThem=false; offer(); draw(); });
  SWAP.state=()=>({open:!P.hidden,with:T&&T.with,mine:T&&T.mine,theirs:T&&T.theirs,okMe:T&&T.okMe,okThem:T&&T.okThem,asked:!!ask});
}
export {SWAP};
