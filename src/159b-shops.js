// THE SHOPS: any character the character editor marks a shopkeeper (trade.sells in characters.json) sells those item types to the player, priced by each item's shared VALUE, teaches the skills in trade.teaches and buys the groups of goods in trade.buys. Double-click a merchant and their wares open (no talk); double-click a thing to buy it, after a confirmation; goods go into your pack and behave by their item properties (edible → eat, sellable → resell). The mushroom and tomato sellers keep their own hand-built shops.
import {THREE} from './003-shx.js';
import {ARCHI, BAG, CHARS, FORAGE, INV, ITEMS, LINES, NPCS, SFX, SHOPS, TEXT, UI, WORTH} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
import {ASL} from './146zs-signs.js';
Object.assign(SHOPS,{bound:new Set(),cur:null});
{ const T=TILE;
  const name=id=>(FORAGE&&FORAGE.NM&&FORAGE.NM[id])||String(id).toUpperCase().replace(/_/g,' ');
  const price=id=>{ const v=ITEMS&&ITEMS.prop?ITEMS.prop(id,'value'):0; return +v>0?Math.round(+v):1; };
  const cash=()=>INV?INV.money():0;
  const give=(id,n)=>{ const F=FORAGE; if(F&&F.give)F.give(id,n); else if(INV)INV.add(id,n); if(F&&F.draw)F.draw(); };
  const say=t=>{ const F=FORAGE; if(F&&F.say)F.say(t); };
  // trade.buys names groups of goods (FORAGE.BUYK: butterflies, birds, ...); paid at the price the game already gives each
  const buying=tr=>{ const F=FORAGE, P=(tr.buys||[]).flatMap(g=>F&&F.BUYK&&F.BUYK[g]||[]); return P.length?Object.keys(INV.items).filter(id=>INV.items[id]>0&&P.some(p=>id.startsWith(p))).sort():[]; };
  const worth=id=>{ const N=SHOPS.cur, tr=N&&CHARS.trade&&CHARS.trade(N); return Math.max(1,Math.round((+ITEMS.prop(id,'value')||1)*((tr&&+tr.pays)||1))); };   // trade.pays: what this buyer pays over the usual (a wholesaler's 1.25)
  const esc=TEXT.esc;

  // the wares window (owner, 8 Nov 2026: "when you double click a merchant you just see their wares (looks like inventory menu but has price, double click to buy (has confirmation before buying))"): the bag's green list, each thing with its picture, name and price
  const css=document.createElement('style'); css.textContent=`#shopg{position:fixed;left:50%;top:12%;transform:translateX(-50%);width:min(340px,92vw);max-height:76vh;display:flex;flex-direction:column;z-index:21;font-family:'Share Tech Mono',ui-monospace,monospace;font-size:13px;letter-spacing:.4px;color:#7dffa8;background:repeating-linear-gradient(0deg,rgba(125,255,168,.05) 0 1px,transparent 1px 3px),rgba(2,10,6,.92);box-shadow:0 0 0 1px #2d5a40;text-shadow:0 0 5px #4aff9055;zoom:var(--uiz,1)} #shopg[hidden]{display:none}
    #shopg .sht{display:flex;align-items:center;gap:8px;padding:8px 8px 6px 12px;color:#3aa866;font-size:12px;letter-spacing:2px} #shopg .sht b{flex:1;font-weight:400;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} #shopg .sht i{font-style:normal;color:#7dffa8;letter-spacing:.4px}
    #shopg .shx{font:inherit;color:#7dffa8;background:#020a06;border:0;box-shadow:inset 0 0 0 1px #3aa866;padding:1px 6px;cursor:pointer} #shopg .shx:hover{color:#020a06;background:#7dffa8}
    #shopg .shm{overflow-y:auto;padding:1px 12px 6px;display:flex;flex-direction:column;gap:3px;scrollbar-color:#3aa866 #020a06;scrollbar-width:thin} #shopg .shh{color:#3aa866;font-size:11px;letter-spacing:2px;margin:6px 0 1px}
    #shopg .shr{display:flex;align-items:center;gap:8px;flex:none;height:30px;padding:0 8px;box-shadow:0 0 0 1px #2d5a40;white-space:nowrap;cursor:pointer;user-select:none;-webkit-user-select:none} #shopg .shr:hover{background:#0d3a1f} #shopg .shr.no{opacity:.45}
    #shopg .shr img{width:16px;height:16px;image-rendering:pixelated;flex:none} #shopg .shr b{font-weight:400;flex:1;overflow:hidden;text-overflow:ellipsis} #shopg .shr i{font-style:normal;color:#f2c14e} #shopg .shr u{text-decoration:none;color:#3aa866;font-size:10px}
    #shopg .shf{padding:5px 12px;border-top:1px solid #2d5a40;color:#3aa866;font-size:10px} #shopg .shx2 button{font:inherit;color:#7dffa8;background:#020a06;border:0;box-shadow:inset 0 0 0 1px #3aa866;padding:2px 7px;margin:2px 4px 2px 0;cursor:pointer}
    #shopg .shq{position:absolute;inset:0;display:grid;place-items:center;background:rgba(2,10,6,.78)} #shopg .shq[hidden]{display:none} #shopg .shq div{padding:12px 14px;background:#020a06;box-shadow:0 0 0 1px #7dffa8;text-align:center;max-width:280px}
    #shopg .shq button{font:inherit;color:#7dffa8;background:#020a06;border:0;box-shadow:inset 0 0 0 1px #3aa866;padding:3px 12px;margin:10px 4px 0;cursor:pointer} #shopg .shq button:hover,#shopg .shq button:focus{color:#020a06;background:#7dffa8;outline:0}`; document.head.appendChild(css);
  const sp=document.createElement('div'); sp.id='shopg'; sp.hidden=true; document.body.appendChild(sp);
  sp.addEventListener('keyup',e=>e.stopPropagation());
  sp.addEventListener('keydown',e=>{ if(e.key==='Escape'){ if(Q)ask(null); else SHOPS.close(); } else if(e.key==='Enter'&&Q)ask(true); e.stopPropagation(); });
  const pic=id=>{ try{ return BAG&&BAG.icon?BAG.icon(id):''; }catch(e){ return ''; } };
  const row=(id,right,data,tag)=>`<div class="shr${tag||''}" ${data} title="${esc(name(id))}"><img alt="" draggable="false" src="${pic(id)}"><b>${esc(name(id))}</b>${right}</div>`;
  let Q=null;   // the confirmation open: its answer
  const ask=v=>{ const q=Q; Q=null; const el=sp.querySelector('.shq'); if(el)el.hidden=true; if(q)q(v); };
  const confirm=text=>new Promise(res=>{ if(Q)ask(null); const el=sp.querySelector('.shq'); if(!el)return res(null); Q=res; el.querySelector('p').textContent=text; el.hidden=false; el.querySelector('[data-q="y"]').focus(); });

  const draw=()=>{ '@later'; const N=SHOPS.cur; if(!N||sp.hidden)return; const tr=CHARS.trade&&CHARS.trade(N); if(!tr){ SHOPS.close(); return; }
    const sc=(sp.querySelector('.shm')||{}).scrollTop||0, have=cash();
    let o=`<div class="sht"><b>${esc(N.name||'A MERCHANT')}</b><i>$${Math.round(have)}</i><button class="shx" type="button" title="close">X</button></div><div class="shm">`;
    o+=tr.sells.filter(id=>!ARCHI(id)).map(id=>{ const p=price(id), rent=ITEMS.prop&&ITEMS.prop(id,'rental'); return row(id,`${rent?`<u>${FORAGE&&FORAGE.has(id)?'REFILL':'RENT'}</u>`:''}<i>$${p}</i>`,`data-buy="${esc(id)}"${rent?' data-rent="1"':''}`,p>have?' no':''); }).join('');
    const pawn=(tr.buys||[]).includes('pawn'); if(pawn&&SHOPS.pawnRows)o+=SHOPS.pawnRows(row,have);   // a pawn shop (159ba): its shelf and what of yours it takes
    const bid=buying(tr); if(bid.length)o+=`<div class="shh">THEY BUY</div>`+bid.map(id=>row(id,`<u>x${INV.items[id]}</u><i>$${WORTH.sell(id,1,worth(id))}</i>`,`data-sold="${esc(id)}"`)).join('');
    const F=FORAGE; let extra=''; if(tr.teaches&&tr.teaches.length&&F&&F.trainRows)extra+=F.trainRows(tr.teaches); if(F&&F.askRows)extra+=F.askRows(CHARS.id(N)); if(extra)o+=`<div class="shx2"><table style="border-collapse:collapse;width:100%">${extra}</table></div>`;
    o+=`</div><div class="shf">DOUBLE CLICK TO ${bid.length||pawn?'BUY OR SELL':'BUY'}</div><div class="shq" hidden><div><p></p><button type="button" data-q="y">YES</button><button type="button" data-q="n">NO</button></div></div>`;
    sp.innerHTML=o; if(sc)sp.querySelector('.shm').scrollTop=sc; };

  // buying and selling, the one way (the window's double click after its confirmation, and the checks)
  SHOPS.buy=(id,n=1,rent=false)=>{ const c=price(id)*n; if(!INV.afford(c)){ say('YOU CANNOT AFFORD THAT.'); return false; } INV.pay(c);
    if(rent){ if(!(FORAGE&&FORAGE.has(id)))give(id,1); SYS.run('rent',id); } else { give(id,n); say(`YOU BUY ${n} ${name(id)} FOR $${c}.`); }   // a rental: one at a time, paid each time it is filled
    if(window.SFX)SFX.play('clunk',{vol:.5}); draw(); return true; };
  SHOPS.sell=(id,n)=>{ const F=FORAGE; n=Math.min(n,INV.items[id]||0); if(!n)return false; const v=WORTH.sell(id,n,worth(id)); if(F&&F.take)F.take(id,n); INV.cash+=v; INV.add('x',0); delete INV.items.x; say(`YOU SELL ${n} ${name(id)} FOR $${v}.`); for(const f of (F&&F.SOLD)||[])f(id,n,v); if(window.SFX)SFX.play('clunk',{vol:.5}); if(F&&F.draw)F.draw(); draw(); return true; };
  sp.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b||!SHOPS.cur)return;
    if(b.classList.contains('shx'))return SHOPS.close(); if(b.dataset.q)return ask(b.dataset.q==='y');
    if(b.dataset.train){ FORAGE.train(b.dataset.train,+b.dataset.cap); draw(); return; } if(b.dataset.ask){ if(FORAGE.hand)FORAGE.hand(+b.dataset.ask); draw(); } });
  sp.addEventListener('dblclick',async e=>{ '@later'; const r=e.target.closest('.shr'); if(!r||!SHOPS.cur||Q)return; e.preventDefault();
    if(r.dataset.buy){ const id=r.dataset.buy, rent=!!r.dataset.rent, p=price(id); if(!INV.afford(p)){ say('YOU CANNOT AFFORD THAT.'); return; }
      if(await confirm(`${rent?(FORAGE&&FORAGE.has(id)?'REFILL':'RENT'):'BUY'} ${name(id)} FOR $${p}?`))SHOPS.buy(id,1,rent); return; }
    if((r.dataset.pbuy||r.dataset.pawn)&&SHOPS.pawnDo){ const have=r.dataset.pawn?INV.items[r.dataset.pawn]||0:1, n=have>1&&BAG&&BAG.ask?await BAG.ask(have,e.clientX,e.clientY):Math.min(1,have); if(!n)return;
      if(await confirm(SHOPS.pawnAsk(r,n)))SHOPS.pawnDo(r,n); return; }
    if(r.dataset.sold){ const id=r.dataset.sold, have=INV.items[id]||0, n=have>1&&BAG&&BAG.ask?await BAG.ask(have,e.clientX,e.clientY):Math.min(1,have); if(!n)return;
      if(await confirm(`SELL ${n>1?n+' ':''}${name(id)} FOR $${WORTH.sell(id,n,worth(id))}?`))SHOPS.sell(id,n); } });

  SHOPS.open=N=>{ if(!N||!(CHARS.trade&&CHARS.trade(N))||!ASL.follows(N))return; { const tr=CHARS.trade(N); if(!(tr.sells||[]).some(id=>!ARCHI(id))&&!(tr.buys||[]).length&&!(tr.teaches||[]).length){ say('CLOSED.'); return; } } SHOPS.cur=N; sp.hidden=false; draw(); if(window.LINES&&N.g)LINES.say(N,'greet'); };
  SHOPS.close=()=>{ if(Q)ask(null); sp.hidden=true; SHOPS.cur=null; };
  SHOPS.draw=draw;

  const bind=N=>{ const id=CHARS.id(N); if(!id||SHOPS.bound.has(id)||!(CHARS.trade&&CHARS.trade(N)))return; SHOPS.bound.add(id);
    for(const th of UI.things)if(th.npc===N){ th.act=()=>SHOPS.open(N); th.reach=Math.max(th.reach||0,2.2*T); th.near=Math.max(th.near||0,3*T); return; }
    if(!N.g||!UI.thing)return; const sc=N.g.scale.y||1, H=(N.H||1.8*T)/sc;
    const hb=new THREE.Mesh(new THREE.BoxGeometry(1.4*T/sc,H,1.4*T/sc),new THREE.MeshBasicMaterial({visible:false})); hb.position.y=H/2; N.g.add(hb);
    UI.thing({name:N.name||'A MERCHANT',npc:N,obj:hb,reach:2.2*T,near:3*T,tall:(N.H||1.8*T)+.3*T,act:()=>SHOPS.open(N)}); };
  SHOPS.sync=()=>{ for(const N of NPCS.concat(NPCS.extra||[]))try{ bind(N); }catch(e){} };
  SYS.onStart(()=>SHOPS.sync(),'159b-shops');
  window.SHOPS=SHOPS;
  window.SHOPDBG=()=>({bound:[...SHOPS.bound],cur:SHOPS.cur&&SHOPS.cur.name,cash:INV&&INV.cash,things:(UI.things||[]).filter(t=>t.npc&&SHOPS.bound.has(CHARS.id(t.npc))).map(t=>t.name)}); }
