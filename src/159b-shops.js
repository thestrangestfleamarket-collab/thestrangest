// THE SHOPS: any character the character editor marks a shopkeeper (trade.sells in characters.json) sells those item types to the player, priced by each item's shared VALUE. Walk up or double-click to buy; goods go into your pack and behave by their item properties (edible → eat, sellable → resell). The mushroom and tomato sellers keep their own hand-built shops.
import {THREE} from './003-shx.js';
import {CHARS, INV, ITEMS, LINES, NPCS, SFX, SHOPS, UI} from './003b-systems.js';
import {TILE} from './006-map-pre.js';
Object.assign(SHOPS,{bound:new Set(),cur:null});
{ const T=TILE;
  const name=id=>(window.FORAGE&&window.FORAGE.NM&&window.FORAGE.NM[id])||String(id).toUpperCase().replace(/_/g,' ');
  const price=id=>{ const v=ITEMS&&ITEMS.prop?ITEMS.prop(id,'value'):0; return +v>0?Math.round(+v):1; };
  const cash=()=>window.INV?INV.cash:0;
  const give=(id,n)=>{ const F=window.FORAGE; if(F&&F.give)F.give(id,n); else if(window.INV)INV.add(id,n); if(F&&F.draw)F.draw(); };
  const say=t=>{ const F=window.FORAGE; if(F&&F.say)F.say(t); };
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');

  const sp=document.createElement('div'); sp.id='shopg'; sp.hidden=true;
  sp.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(460px,92vw);max-height:80vh;overflow:auto;z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(sp); sp.addEventListener('keyup',e=>e.stopPropagation());
  sp.addEventListener('keydown',e=>{ if(e.key==='Escape')SHOPS.close(); e.stopPropagation(); });
  const closeB=document.createElement('button'); closeB.className='pX'; closeB.textContent='CLOSE';
  closeB.style.cssText='position:absolute;right:10px;top:10px;font:inherit;color:#c9ccd6;background:#0e1016;border:2px solid #3a3f4e;padding:3px 8px;cursor:pointer'; closeB.onclick=()=>SHOPS.close(); sp.appendChild(closeB);
  const B='style="margin:0 0 0 4px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer"';

  const draw=()=>{ '@later'; const N=SHOPS.cur; if(!N||sp.hidden)return; const tr=CHARS.trade&&CHARS.trade(N); if(!tr){ SHOPS.close(); return; }
    let o=`<h3 style="margin:0 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">${esc(N.name||'A MERCHANT')}</h3><div style="color:#9b9584;margin-bottom:8px">${esc(tr.line||'Take your pick.')}</div><div style="margin-bottom:8px">YOU HAVE <b style="color:#f2c14e">$${Math.round(cash())}</b></div><table style="border-collapse:collapse;width:100%">`;
    for(const id of tr.sells){ const p=price(id); o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${esc(name(id))}</td><td style="text-align:right;padding:4px 6px">$${p}</td><td style="text-align:right;white-space:nowrap"><button ${B} data-buy="${esc(id)}">BUY</button><button ${B} data-buy="${esc(id)}" data-n="5">5 $${p*5}</button></td></tr>`; }
    o+=`</table>`; const x=sp.querySelector(':scope>.pX'); sp.innerHTML=o; if(x)sp.appendChild(x); };
  sp.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b||b.classList.contains('pX')||!SHOPS.cur)return; const id=b.dataset.buy; if(!id)return;
    const n=+b.dataset.n||1, c=price(id)*n; if(cash()<c){ say('YOU CANNOT AFFORD THAT.'); return; } INV.cash-=c; give(id,n); say(`YOU BUY ${n} ${name(id)} FOR $${c}.`); if(window.SFX)SFX.play('clunk',{vol:.5}); draw(); });

  SHOPS.open=N=>{ if(!N||!(CHARS.trade&&CHARS.trade(N)))return; SHOPS.cur=N; sp.hidden=false; draw(); if(window.LINES&&N.g)LINES.say(N,'greet'); };
  SHOPS.close=()=>{ sp.hidden=true; SHOPS.cur=null; };
  SHOPS.draw=draw;

  const bind=N=>{ const id=CHARS.id(N); if(!id||SHOPS.bound.has(id)||!(CHARS.trade&&CHARS.trade(N)))return; SHOPS.bound.add(id);
    for(const th of UI.things)if(th.npc===N){ th.act=()=>SHOPS.open(N); th.reach=Math.max(th.reach||0,2.2*T); th.near=Math.max(th.near||0,3*T); return; }
    if(!N.g||!UI.thing)return; const sc=N.g.scale.y||1, H=(N.H||1.8*T)/sc;
    const hb=new THREE.Mesh(new THREE.BoxGeometry(1.4*T/sc,H,1.4*T/sc),new THREE.MeshBasicMaterial({visible:false})); hb.position.y=H/2; N.g.add(hb);
    UI.thing({name:N.name||'A MERCHANT',npc:N,obj:hb,reach:1.6*T,near:3*T,tall:(N.H||1.8*T)+.3*T,act:()=>SHOPS.open(N)}); };
  SHOPS.sync=()=>{ for(const N of NPCS)try{ bind(N); }catch(e){} };
  { const go=()=>{ if(!window.__started)return setTimeout(go,800); SHOPS.sync(); }; go(); }
  window.SHOPS=SHOPS;
  window.SHOPDBG=()=>({bound:[...SHOPS.bound],cur:SHOPS.cur&&SHOPS.cur.name,cash:window.INV&&INV.cash,things:(UI.things||[]).filter(t=>t.npc&&SHOPS.bound.has(CHARS.id(t.npc))).map(t=>t.name)}); }
