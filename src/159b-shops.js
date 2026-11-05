// THE SHOPS: any character the character editor marks a shopkeeper (trade.sells in characters.json) sells those item types to the player, priced by each item's shared VALUE, teaches the skills in trade.teaches and buys the groups of goods in trade.buys. Walk up or double-click to buy; goods go into your pack and behave by their item properties (edible → eat, sellable → resell). The mushroom and tomato sellers keep their own hand-built shops.
import {THREE} from './003-shx.js';
import {CHARS, FORAGE, INV, ITEMS, LINES, NPCS, SFX, SHOPS, TALK, TEXT, UI} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
import {FRESH} from './140c-fresh.js';
Object.assign(SHOPS,{bound:new Set(),cur:null});
{ const T=TILE;
  const name=id=>(window.FORAGE&&window.FORAGE.NM&&window.FORAGE.NM[id])||String(id).toUpperCase().replace(/_/g,' ');
  const price=id=>{ const v=ITEMS&&ITEMS.prop?ITEMS.prop(id,'value'):0; return +v>0?Math.round(+v):1; };
  const cash=()=>window.INV?INV.cash:0;
  const give=(id,n)=>{ const F=window.FORAGE; if(F&&F.give)F.give(id,n); else if(window.INV)INV.add(id,n); if(F&&F.draw)F.draw(); };
  const say=t=>{ const F=window.FORAGE; if(F&&F.say)F.say(t); };
  // trade.buys names groups of goods (FORAGE.BUYK: butterflies, birds, ...); paid at the price the game already gives each
  const buying=tr=>{ const F=window.FORAGE, P=(tr.buys||[]).flatMap(g=>F&&F.BUYK&&F.BUYK[g]||[]); return P.length?Object.keys(INV.items).filter(id=>INV.items[id]>0&&P.some(p=>id.startsWith(p))).sort():[]; };
  const worth=id=>Math.max(1,Math.round(+ITEMS.prop(id,'value')||1));
  const esc=TEXT.esc;

  const sp=document.createElement('div'); sp.id='shopg'; sp.hidden=true;
  sp.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(460px,92vw);max-height:80vh;overflow:auto;z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(sp); sp.addEventListener('keyup',e=>e.stopPropagation());
  sp.addEventListener('keydown',e=>{ if(e.key==='Escape')SHOPS.close(); e.stopPropagation(); });
  const closeB=document.createElement('button'); closeB.className='pX'; closeB.textContent='X';
  closeB.style.cssText='position:absolute;right:10px;top:10px;font:inherit;color:#c9ccd6;background:#0e1016;border:2px solid #3a3f4e;padding:3px 8px;cursor:pointer'; closeB.onclick=()=>SHOPS.close(); sp.appendChild(closeB);
  const B='style="margin:0 0 0 4px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer"';

  const draw=()=>{ const N=SHOPS.cur; if(!N||sp.hidden)return; const tr=CHARS.trade&&CHARS.trade(N); if(!tr){ SHOPS.close(); return; }
    let o=`<h3 style="margin:0 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">${esc(N.name||'A MERCHANT')}</h3><div style="color:#9b9584;margin-bottom:8px">${esc(tr.line||'Take your pick.')}</div><div style="margin-bottom:8px">YOU HAVE <b style="color:#f2c14e">$${Math.round(cash())}</b></div><table style="border-collapse:collapse;width:100%">`;
    for(const id of tr.sells){ const p=price(id), rent=ITEMS.prop&&ITEMS.prop(id,'rental'); o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${esc(name(id))}</td><td style="text-align:right;padding:4px 6px">$${p}</td><td style="text-align:right;white-space:nowrap">${rent?`<button ${B} data-buy="${esc(id)}" data-rent="1">${window.FORAGE&&FORAGE.has(id)?'REFILL':'RENT'}</button>`:`<button ${B} data-buy="${esc(id)}">BUY</button><button ${B} data-buy="${esc(id)}" data-n="5">5 · $${p*5}</button>`}</td></tr>`; }
    const F=window.FORAGE; if(tr.teaches&&tr.teaches.length&&F&&F.trainRows)o+=F.trainRows(tr.teaches); if(F&&F.askRows)o+=F.askRows(CHARS.id(N));
    const bid=buying(tr); if(bid.length)o+=`</table><div style="margin:8px 0 4px;color:#9b9584">BUYS</div><table style="border-collapse:collapse;width:100%">`+bid.map(id=>{ const v=worth(id), n=INV.items[id]; return `<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${esc(name(id))}</td><td style="text-align:right;padding:4px 6px">$${v}</td><td style="text-align:right">x${n}</td><td style="text-align:right;white-space:nowrap"><button ${B} data-sold="${esc(id)}">SELL</button>${n>1?`<button ${B} data-sold="${esc(id)}" data-n="all">ALL · $${v*n}</button>`:''}</td></tr>`; }).join('');
    o+=`</table>`; const x=sp.querySelector(':scope>.pX'); sp.innerHTML=o; if(x)sp.appendChild(x); };
  sp.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||b.classList.contains('pX')||!SHOPS.cur)return; if(b.dataset.train){ window.FORAGE.train(b.dataset.train,+b.dataset.cap); draw(); return; } if(b.dataset.ask){ window.FORAGE.hand(+b.dataset.ask); draw(); return; }
    if(b.dataset.sold){ const id=b.dataset.sold, F=window.FORAGE, n=b.dataset.n==='all'?INV.items[id]||0:Math.min(1,INV.items[id]||0), v=FRESH.worth(id,n,worth(id)); if(!n)return; if(F&&F.take)F.take(id,n); INV.cash+=v; INV.add('x',0); delete INV.items.x; say(`YOU SELL ${n} ${name(id)} FOR $${v}.`); if(window.SFX)SFX.play('clunk',{vol:.5}); if(F&&F.draw)F.draw(); draw(); return; }
    const id=b.dataset.buy; if(!id)return;
    const n=+b.dataset.n||1, c=price(id)*n; if(cash()<c){ say('YOU CANNOT AFFORD THAT.'); return; } INV.cash-=c;
    if(b.dataset.rent){ if(!(window.FORAGE&&FORAGE.has(id)))give(id,1); SYS.run('rent',id); } else { give(id,n); say(`YOU BUY ${n} ${name(id)} FOR $${c}.`); }   // a rental: one at a time, paid each time it is filled
    if(window.SFX)SFX.play('clunk',{vol:.5}); draw(); });

  SHOPS.open=N=>{ if(!N||!(CHARS.trade&&CHARS.trade(N)))return; SHOPS.cur=N; sp.hidden=false; draw(); if(window.LINES&&N.g)LINES.say(N,'greet'); };
  SHOPS.close=()=>{ sp.hidden=true; SHOPS.cur=null; };
  SHOPS.draw=draw;

  const bind=N=>{ const id=CHARS.id(N); if(!id||SHOPS.bound.has(id)||!(CHARS.trade&&CHARS.trade(N)))return; SHOPS.bound.add(id);
    for(const th of UI.things)if(th.npc===N){ th.act=()=>(TALK.open||SHOPS.open)(N); th.reach=Math.max(th.reach||0,2.2*T); th.near=Math.max(th.near||0,3*T); return; }
    if(!N.g||!UI.thing)return; const sc=N.g.scale.y||1, H=(N.H||1.8*T)/sc;
    const hb=new THREE.Mesh(new THREE.BoxGeometry(1.4*T/sc,H,1.4*T/sc),new THREE.MeshBasicMaterial({visible:false})); hb.position.y=H/2; N.g.add(hb);
    UI.thing({name:N.name||'A MERCHANT',npc:N,obj:hb,reach:2.2*T,near:3*T,tall:(N.H||1.8*T)+.3*T,act:()=>(TALK.open||SHOPS.open)(N)}); };
  SHOPS.sync=()=>{ for(const N of NPCS.concat(NPCS.extra||[]))try{ bind(N); }catch(e){} };
  SYS.onStart(()=>SHOPS.sync(),'159b-shops');
  window.SHOPS=SHOPS;
  window.SHOPDBG=()=>({bound:[...SHOPS.bound],cur:SHOPS.cur&&SHOPS.cur.name,cash:window.INV&&INV.cash,things:(UI.things||[]).filter(t=>t.npc&&SHOPS.bound.has(CHARS.id(t.npc))).map(t=>t.name)}); }
