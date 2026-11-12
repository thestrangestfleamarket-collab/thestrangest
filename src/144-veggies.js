// THE VEGGIES: VEG, the vegetables the player can grow, pick and sell.
import {SHARED} from './003-shx.js';
import {CIVIC, FORAGE, INSPECT, INV, LINES, PARK, SFX, TALK, UI, VIT, WORTH} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {TILE} from './006-map-pre.js';
import {HOMES} from './076-npc-map.js';
import {STALL} from './081-stalls.js';
import {MERCH} from './111e-merch.js';
import {MUSH} from './111ec-mushseller.js';
import {TOONS} from './111ed-tomato.js';
const VEG={}; window.VEG=VEG;
{ const T=TILE;
  const V=[['v_tomato','TOMATO',3,2,.06,0xc8321e,[.07,.07],1],['v_pepper','BELL PEPPER',4,2,.06,0x2f8a2a,[.07,.08],1],['v_carrot','CARROT',2,1,.05,0xe0742a,[.035,.16],0],
    ['v_corn','EAR OF CORN',3,2,.08,0xe8c84a,[.05,.18],0],['v_cabbage','CABBAGE',5,3,.08,0x8ac05a,[.1,.09],1],['v_eggplant','EGGPLANT',4,2,.07,0x4a2a5a,[.06,.12],1],
    ['v_potato','POTATO',2,1,.07,0xb08a5a,[.06,.05],1],['v_onion','ONION',2,1,.04,0xd8b88a,[.055,.055],1],['v_greens','LEAFY GREENS',3,2,.04,0x4a9a3a,[.09,.05],1],
    ['v_pumpkin','PUMPKIN',12,7,.14,0xe0782a,[.2,.16],1]];
  const NM=Object.fromEntries(V.map(v=>[v[0],v[1]])), SELL=Object.fromEntries(V.map(v=>[v[0],v[2]])), BUY=Object.fromEntries(V.map(v=>[v[0],v[3]])), XS=[], XB=[];
  INSPECT.kinds.push({is:id=>!!NM[id]||/^f_(corn|vstew|stuffpep|psoup)$/.test(id),make:id=>{ const K=STALL.VEG[id.slice(2)]; if(K)return INSPECT.recipe(K);
    return id==='f_corn'?INSPECT.recipe(STALL.VEG.corn):id==='f_stuffpep'?INSPECT.recipe(STALL.VEG.pepper):INSPECT.shape('bowl',id==='f_psoup'?0xe0882a:0x8a5a2a); }});
  VEG.add=(sells,buys)=>{ for(const id in sells){ SELL[id]=sells[id]; XS.push(id); } for(const id in buys){ BUY[id]=buys[id]; XB.push(id); } }; FORAGE.STOCK.push(()=>[...V.map(v=>v[0]),...XS]); const NMV=id=>NM[id]||FORAGE.NM[id]||id;
  FORAGE.add({names:Object.assign({},NM,{f_corn:'ROAST CORN',f_vstew:'VEGETABLE STEW',f_stuffpep:'STUFFED PEPPER',f_psoup:'PUMPKIN SOUP'}),
    raw:Object.fromEntries(V.map(v=>[v[0],[v[4],0]])),
    prices:Object.assign({f_corn:7,f_vstew:14,f_stuffpep:16,f_psoup:28},BUY),
    recipes:[['f_corn','ROAST CORN','cooking',[0,40],{v_corn:1},'fills a fifth'],['f_vstew','VEGETABLE STEW','cooking',[15,60],{v_potato:1,v_carrot:1,v_onion:1},'fills two fifths, some health'],
      ['f_stuffpep','STUFFED PEPPER','cooking',[25,70],{v_pepper:1,m_button:2},'fills two fifths, mends you a minute'],['f_psoup','PUMPKIN SOUP','cooking',[40,85],{v_pumpkin:1,v_onion:1},'fills more than half, strong 2 min']],
    does:{f_corn:()=>FORAGE.feed(.2),f_vstew:()=>{ FORAGE.feed(.4); VIT.heal(.2); },f_stuffpep:()=>{ FORAGE.feed(.4); FORAGE.buff('regen',60); },f_psoup:()=>{ FORAGE.feed(.6); FORAGE.buff('str',120); }}});
  const STAND=()=>{ const P=PARK, X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0)), A=STALL.at('tomato');
    VEG.stand=STALL.build({X,Z,x0:A.x0,x1:A.x1,y:P.y0,veg:true,seed:11,gate:A.gate,name:A.name});
    const N=TOONS.tomato; if(!N)return; if(!HOMES.keeper(N))MERCH.stand(N,VEG.stand);
    TALK.shops.set(N,()=>SHOP.open()); for(const th of UI.things)if(th.npc&&th.npc===N){ th.act=()=>TALK.open(N); th.reach=2.2*T; th.near=3*T; }
  };
  { const wait=()=>{ if(typeof MUSH==='undefined'||!MUSH.booth||typeof TOONS==='undefined'||!TOONS.tomato)return setTimeout(wait,500); STAND(); }; wait(); }
  const SHOP={}; VEG.SHOP=SHOP; const say=SAY, B='style="margin:0 0 0 4px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer"';
  const sp=document.createElement('div'); sp.id='vegp'; sp.hidden=true; sp.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(460px,92vw);max-height:80vh;overflow:auto;z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(sp); sp.addEventListener('keydown',e=>e.stopPropagation()); sp.addEventListener('keyup',e=>e.stopPropagation());
  const row=(a,b,c,d)=>`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${a}</td><td style="text-align:right;padding:4px 6px">${b}</td><td style="text-align:right">${c}</td><td style="text-align:right;white-space:nowrap">${d}</td></tr>`;
  SHOP.draw=()=>{ '@later'; if(sp.hidden)return; const mine=[...V.map(v=>v[0]),...XB].filter(id=>FORAGE.has(id)>0);
    let o=`<h3 style="margin:0 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">THE TOMATO'S VEGGIES</h3><div style="color:#9b9584;margin-bottom:8px">Fresh today. Seeds too. He buys back what you don't want, and flowers.</div><div style="margin-bottom:8px">YOU HAVE <b style="color:#f2c14e">$${Math.round(INV.money())}</b></div>`;
    o+='<table style="border-collapse:collapse;width:100%">'+FORAGE.trainRows(['garden'])+(FORAGE.askRows?FORAGE.askRows('tomato'):'')+'</table>'; o+=`<div style="margin:6px 0 4px;color:#9b9584">HE SELLS</div><table style="border-collapse:collapse;width:100%">`+[...V.map(v=>v[0]),...XS].map(id=>{ const p=SELL[id]; return row(NMV(id),'$'+p,FORAGE.has(id)?'x'+FORAGE.has(id):'',`<button ${B} data-buy="${id}">BUY</button><button ${B} data-buy="${id}" data-n="5">5 $${p*5}</button>`); }).join('')+'</table>';
    o+=`<div style="margin:10px 0 4px;color:#9b9584">HE BUYS</div><table style="border-collapse:collapse;width:100%">`+mine.map(id=>{ const n=FORAGE.has(id), v=WORTH.sell(id,1,BUY[id]), va=WORTH.sell(id,n,BUY[id]); return row(NMV(id),'$'+v,'x'+n,`<button ${B} data-sell="${id}">SELL</button>${n>1?`<button ${B} data-sell="${id}" data-n="all">ALL $${va}</button>`:''}`); }).join('')+'</table>';
    if(!mine.length)o+='<div style="color:#7d7a70;margin-top:6px">No vegetables on you. Cook them by a flame: roast corn, a stew, a stuffed pepper, pumpkin soup.</div>';
    const x=sp.querySelector(':scope>.pX'); sp.innerHTML=o; if(x)sp.appendChild(x); };
  sp.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||b.classList.contains('pX'))return; const d=b.dataset;
    if(d.ask){ if(FORAGE.hand)FORAGE.hand(d.ask); SHOP.draw(); return; } if(d.train){ FORAGE.train(d.train,+d.cap); SHOP.draw(); return; } if(d.buy){ const n=+d.n||1, c=SELL[d.buy]*n; if(!INV.afford(c))say('YOU CANNOT AFFORD THAT.','#c8a090'); else { INV.pay(c); FORAGE.give(d.buy,n); say(`YOU BUY ${n} ${NMV(d.buy)} FOR $${c}.`); if(window.CIVIC&&CIVIC.note)CIVIC.note('you bought '+n+' '+NMV(d.buy).toLowerCase()+' from the tomato','park'); } }
    if(d.sell){ const n=d.n==='all'?FORAGE.has(d.sell):1, v=WORTH.sell(d.sell,n,BUY[d.sell]); FORAGE.take(d.sell,n); INV.cash+=v; say(`YOU SELL ${n} ${NMV(d.sell)} FOR $${v}.`,'#f2c14e'); SFX.play('clunk',{vol:.5}); }
    INV.add('x',0); delete INV.items.x; SHOP.draw(); FORAGE.draw(); });
  SHOP.open=()=>{ sp.hidden=false; SHOP.draw(); if(TOONS.tomato)LINES.say(TOONS.tomato,'greet'); };
  window.VEGDBG=()=>({stand:!!VEG.stand,wx:TOONS.tomato&&TOONS.tomato.st.x,wz:TOONS.tomato&&TOONS.tomato.st.z,x:TOONS.tomato&&+(TOONS.tomato.st.x/T).toFixed(1),z:TOONS.tomato&&+(TOONS.tomato.st.z/T).toFixed(1),held:TOONS.tomato&&TOONS.tomato.st.hold,mine:V.map(v=>[v[0],FORAGE.has(v[0])]).filter(a=>a[1])}); }
export {VEG};
