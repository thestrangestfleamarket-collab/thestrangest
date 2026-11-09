// THE STALLS (owner, 9 Nov 2026): the market row's tables on Market St, rented by players: rent one for days, set out things from your bag at your own prices, they sell while you are away, collect the till (less the market's cut); the section's server keeps the stock and the till (worker/door.js stall).
import {THREE} from './003-shx.js';
import {ARCHI, FORAGE, INV, ITEMS, ONLINE, TEXT, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {MAPG, SYS, TILE} from './006-map-pre.js';
const STALLS={all:{},mine:null,RENT:15,DAYS:7,CUT:.05}; window.STALLS=STALLS;
{
  const say=(t,c)=>SAY(t,c||'#e8e2cc'), esc=TEXT.esc, B='font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer';
  const nm=id=>FORAGE.name?FORAGE.name(id):id, cash=()=>Math.floor(INV.cash||0), me=()=>String(ONLINE.me||'');
  const can=id=>INV.items[id]>0&&!ARCHI(id)&&id!=='passport'&&!/^(photo_|wip_|pt_)/.test(id);
  const worth=id=>Math.max(1,Math.round(+ITEMS.prop(id,'value')||1));
  const P=document.createElement('div'); P.id='stallp'; P.hidden=true; P.setAttribute('role','dialog');
  P.style.cssText='position:fixed;left:50%;top:8%;transform:translateX(-50%);width:min(560px,94vw);max-height:84vh;overflow:auto;z-index:22;padding:14px 16px;box-sizing:border-box;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(P); for(const t of ['keydown','keyup','keypress'])P.addEventListener(t,e=>{ if(e.key==='Escape'&&t==='keydown')STALLS.close(); e.stopPropagation(); });
  let cur=null; const things=[];
  const send=o=>ONLINE.send({t:'st',...o});
  const saved=()=>{ if(INV.save)INV.save(); return OWNED.sync().catch(()=>{}); };   // the server pays from its own copy of your pack: bring it up to date first
  const take=r=>{ INV.cash=cash()+Math.max(0,Math.floor(+r.cash||0)); for(const id in r.items||{}){ const n=Math.max(0,Math.floor(+r.items[id]||0)); if(n&&/^[a-z0-9_]{1,48}$/.test(id))FORAGE.give(id,n); } if(INV.save)INV.save(); if(FORAGE.draw)FORAGE.draw(); };
  const label=(id,i)=>{ const o=STALLS.all[id]; return o?(o.who===me()?'YOUR STALL':esc(o.name||'A TENANT')+'\'S STALL'):'STALL '+(i+1)+' (FOR RENT)'; };
  const relabel=()=>things.forEach((th,i)=>{ th.name=label(th.sid,i).replace(/&#39;|&apos;/g,"'"); });
  const days=o=>Math.max(0,Math.ceil((o.until-Date.now())/864e5));
  // the window: a free stall to rent; yours (its goods, the till, your bag to set out); someone else's (their goods to buy)
  const draw=()=>{ '@later'; if(!cur)return; const o=STALLS.all[cur], i=things.findIndex(t=>t.sid===cur); let h=`<h3 style="margin:0 0 8px;color:#f2c14e;font:12px Silkscreen,monospace">${label(cur,i)}</h3>`;
    if(!o){ h+=`<div>RENT THIS TABLE: $${STALLS.RENT} A DAY, UP TO ${STALLS.DAYS} DAYS. SET OUT THINGS AT YOUR OWN PRICES; THEY SELL WHILE YOU ARE AWAY. THE MARKET KEEPS ${Math.round(STALLS.CUT*100)}% OF EACH SALE.</div>
      <div style="margin-top:10px;display:flex;gap:6px">${[1,3,7].map(d=>`<button data-rent="${d}" style="${B}">${d} DAY${d>1?'S':''} · $${d*STALLS.RENT}</button>`).join('')}</div>`; }
    else if(o.who===me()){ const M=STALLS.mine&&STALLS.mine.id===cur?STALLS.mine:{till:0,sold:0};
      h+=`<div>${days(o)} DAY${days(o)===1?'':'S'} LEFT · SOLD ${M.sold||0} · TILL <b style="color:#f2c14e">$${M.till||0}</b> <button data-collect="1" style="${B}">COLLECT</button> ${days(o)<STALLS.DAYS?`<button data-rent="1" style="${B}">+1 DAY · $${STALLS.RENT}</button>`:''} <button data-leave="1" style="${B}">GIVE IT UP</button></div>
        <div style="margin:10px 0 4px;color:#9b9584">ON THE TABLE</div>`+(o.goods.length?o.goods.map(g=>`<div style="display:flex;gap:6px;align-items:center;margin:2px 0"><span style="flex:1">${esc(nm(g.id))} ×${g.n}</span><span>$${g.p}</span><button data-back="${esc(g.id)}" style="${B}">TAKE BACK</button></div>`).join(''):'<div style="color:#7d7a70">NOTHING YET.</div>')+
        `<div style="margin:10px 0 4px;color:#9b9584">SET OUT FROM YOUR BAG (PRICE EACH)</div>`+Object.keys(INV.items).filter(can).sort().map(id=>{ const g=o.goods.find(q=>q.id===id); return `<div style="display:flex;gap:6px;align-items:center;margin:2px 0"><span style="flex:1">${esc(nm(id))} ×${INV.items[id]}</span>$<input data-p="${esc(id)}" type="number" min="1" value="${g?g.p:worth(id)}" style="width:64px;font:inherit;background:#0e1016;color:#ece5d3;border:1px solid #3a3f4e"><button data-put="${esc(id)}" data-n="1" style="${B}">PUT 1</button>${INV.items[id]>1?`<button data-put="${esc(id)}" data-n="all" style="${B}">ALL</button>`:''}</div>`; }).join(''); }
    else h+=(o.goods.length?o.goods.map(g=>`<div style="display:flex;gap:6px;align-items:center;margin:2px 0"><span style="flex:1">${esc(nm(g.id))} ×${g.n}</span><span>$${g.p}</span><button data-buy="${esc(g.id)}" style="${B}">BUY 1</button></div>`).join(''):'<div style="color:#7d7a70">THE TABLE IS BARE.</div>')+`<div style="margin-top:8px;color:#9b9584">YOU HAVE $${cash()}.</div>`;
    h+=`<div style="margin-top:12px;display:flex;justify-content:flex-end"><button data-x="1" style="${B}">CLOSE</button></div>`; P.innerHTML=h; };
  P.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b||!cur)return; const d=b.dataset, o=STALLS.all[cur];
    if(d.x)return STALLS.close();
    if(d.rent){ const c=+d.rent*STALLS.RENT; if(cash()<c)return say('THAT IS $'+c+'. YOU HAVE $'+cash()+'.','#c8a090'); const id=cur; saved().then(()=>send({op:'rent',id,days:+d.rent})); return; }
    if(d.buy){ const g=o&&o.goods.find(q=>q.id===d.buy); if(!g)return; if(cash()<g.p)return say('THAT IS $'+g.p+'. YOU HAVE $'+cash()+'.','#c8a090'); const id=cur; saved().then(()=>send({op:'buy',id,item:g.id,n:1,p:g.p})); return; }
    if(d.collect){ send({op:'collect',id:cur}); return; }
    if(d.leave){ send({op:'leave',id:cur}); return; }
    if(d.back){ send({op:'take',id:cur,item:d.back}); return; }
    if(d.put){ const id=d.put, n=d.n==='all'?INV.items[id]:1, inp=P.querySelector(`input[data-p="${CSS.escape(id)}"]`), p=Math.max(1,Math.floor(+(inp&&inp.value)||worth(id)));
      if(!can(id)||n<1)return; if(o&&!o.goods.some(q=>q.id===id)&&o.goods.length>=12)return say('THE TABLE HOLDS TWELVE KINDS OF THINGS.','#c8a090');
      const sid=cur; saved().then(()=>{ const k=Math.min(n,INV.items[id]||0); if(k<1)return; FORAGE.take(id,k); if(INV.save)INV.save(); if(FORAGE.draw)FORAGE.draw(); send({op:'put',id:sid,item:id,n:k,p}); }); } });
  STALLS.open=sid=>{ '@later'; if(!ONLINE.on)return say('THE STALLS NEED THE BLOCK: YOU ARE NOT ONLINE.','#c8a090'); cur=sid; send({op:'list'}); P.hidden=false; draw(); };
  STALLS.close=()=>{ cur=null; P.hidden=true; P.innerHTML=''; };
  // what the server says
  ONLINE.hear.st=m=>{ '@later'; const op=m.op;
    if(op==='list'){ STALLS.all=m.all||{}; STALLS.mine=m.mine||null; relabel(); draw(); return; }
    if(op==='one'){ if(m.o)STALLS.all[m.id]=m.o; else delete STALLS.all[m.id]; relabel(); if(cur===m.id){ if(m.o&&m.o.who===me())send({op:'list'}); draw(); } return; }
    if(op==='rented'){ INV.cash=Math.max(0,cash()-Math.max(0,+m.cost||0)); if(INV.save)INV.save(); say('THE TABLE IS YOURS FOR '+m.days+' MORE DAY'+(m.days>1?'S':'')+'. $'+m.cost+'.','#b8f0a0'); send({op:'list'}); return; }
    if(op==='bought'){ INV.cash=Math.max(0,cash()-Math.max(0,+m.cost||0)); FORAGE.give(m.item,m.n); if(INV.save)INV.save(); if(FORAGE.draw)FORAGE.draw(); say('YOU BUY '+nm(m.item)+(m.n>1?' ×'+m.n:'')+' FOR $'+m.cost+'.','#f2c14e'); draw(); return; }
    if(op==='sold'){ say('YOUR STALL SOLD '+nm(m.item)+(m.n>1?' ×'+m.n:'')+' FOR $'+m.cost+'.','#f2c14e'); if(STALLS.mine){ STALLS.mine.till+=Math.floor(m.cost*(1-STALLS.CUT)); STALLS.mine.sold+=m.n; } draw(); return; }
    if(op==='back'){ take(m); if(m.why)say('YOUR STALL: '+String(m.why).toUpperCase()+'. '+(m.cash?'$'+m.cash+' AND ':'')+'WHAT WAS LEFT IS IN YOUR BAG.','#b8f0a0'); else if(m.cash)say('YOU COLLECT $'+m.cash+' FROM THE TILL.','#f2c14e'); send({op:'list'}); return; }
    if(op==='no'){ say('THE STALL: '+String(m.why||'NO').toUpperCase()+'.','#c8a090'); } };
  SYS.add('hi',()=>{ send({op:'list'}); },'159j-stalls');
  // the market row's tables (data/world.json 'mstall' and 'ftable', laid by 111fb): each one a stall to double-click
  const hit=new THREE.MeshBasicMaterial({visible:false});
  const make=()=>{ '@later'; if(things.length||!window.FLEA||!FLEA.made)return false; const L=FLEA.made.filter(t=>t.k==='mstall'||t.k==='ftable').slice(0,5); if(!L.length)return false;
    L.forEach((t,i)=>{ const f=t.fix, w=Math.max(.2,f[3]-f[0]), d=Math.max(.2,f[4]-f[1]), hgt=Math.max(.2,f[5]-f[2]), m=new THREE.Mesh(new THREE.BoxGeometry(w,hgt,d),hit);
      m.position.set((f[0]+f[3])/2,f[2]+hgt/2,(f[1]+f[4])/2); (MAPG.bodega||MAPG.street||scene).add(m);
      const th={name:label('s'+(i+1),i),obj:m,reach:2.4*TILE,near:3*TILE,tall:hgt,act:()=>STALLS.open(th.sid),sid:'s'+(i+1)}; things.push(th); UI.thing(th); });
    return true; };
  SYS.every(()=>{ if(!things.length)make(); },1000,'159j-stalls make');
  STALLS.things=things; STALLS.take=take;
}
