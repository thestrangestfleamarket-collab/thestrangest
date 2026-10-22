// THE ITEM MODEL AND EDITOR: ITEMS holds each item type's shared properties (burnable, edible, ...); ITEMED edits them (shift+7).
import {FORAGE, ITEMED, ITEMS} from './003b-systems.js';
import {OWNED} from './005-save.js';
{ const BOOL=[['burnable','BURNS'],['edible','EDIBLE'],['stackable','STACKS'],['pickup','PICK UP'],['sellable','SELLABLE']];
  const NUM=[['weight','WEIGHT',0,50,0.1,1],['value','VALUE',0,500,1,0]];
  const DEF=()=>{ const d={}; for(const [k] of BOOL)d[k]=false; for(const [k,,,,,v] of NUM)d[k]=v; return d; };
  let BAKED={}; try{ BAKED=__DATA__("data/items.json")||{}; }catch(e){}
  try{ for(const id in BAKED)ITEMS.defs[id]=Object.assign(DEF(),BAKED[id]); }catch(e){}
  try{ const L=JSON.parse(OWNED.get('items')||'{}'); for(const id in L)ITEMS.defs[id]=Object.assign(ITEMS.defs[id]||DEF(),L[id]); }catch(e){}
  ITEMS.def=id=>ITEMS.defs[id];
  ITEMS.prop=(id,k)=>{ const d=ITEMS.defs[id]; return d?d[k]:undefined; };
  ITEMS.ids=()=>Object.keys(ITEMS.defs).sort();
  const save=()=>{ try{ OWNED.set('items',JSON.stringify(ITEMS.defs)); }catch(e){} };
  const css=document.createElement('style'); css.textContent=`
  #ited{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:12px;width:330px;max-height:calc(100vh - 24px);overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20}
  #ited[hidden]{display:none} #ited h2{font:12px var(--pixel);color:var(--key);margin:0;padding:12px 14px;border-bottom:2px solid var(--line)} #ited .pane{padding:10px 14px}
  #ited .dim{color:var(--dim);font-size:10px;line-height:1.5} #ited .it{border:2px solid #2a3040;margin:8px 0;padding:8px 10px}
  #ited .nm{color:var(--key);margin-bottom:5px;display:flex;justify-content:space-between} #ited .nm button{font:inherit;color:var(--dim);background:none;border:0;cursor:pointer}
  #ited .props{display:flex;flex-wrap:wrap;gap:5px} #ited .chip{background:#0e1016;border:2px solid #3a3f4e;color:var(--dim);padding:4px 7px;cursor:pointer;font:inherit} #ited .chip[aria-pressed=true]{border-color:var(--key);color:var(--key)}
  #ited .num{display:flex;align-items:center;gap:5px;color:var(--dim)} #ited .num input{width:120px} #ited .row{display:flex;gap:6px;align-items:center;margin:8px 0;flex-wrap:wrap}
  #ited input[type=text]{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 7px;flex:1;min-width:120px} #ited .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 8px;cursor:pointer}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='ited'; P.hidden=true; document.body.appendChild(P);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,'_');
  const discovered=()=>{ const s=new Set();
    try{ if(window.FORAGE&&FORAGE.ids)for(const id of FORAGE.ids())s.add(norm(id)); }catch(e){}
    try{ const G=window.GPH; if(G&&G.loose)for(const it of G.loose())if(it&&it.name)s.add(norm(it.name)); }catch(e){}
    for(const id in ITEMS.defs)s.delete(id); return [...s].sort(); };
  const nameOf=id=>{ try{ return (window.FORAGE&&FORAGE.NM&&FORAGE.NM[id])||id; }catch(e){ return id; } };
  function draw(){ const ids=ITEMS.ids();
    P.innerHTML=`<h2>ITEMS — PROPERTIES</h2><div class="pane">
      <div class="dim">A property is shared by every item of its kind. Turn one on here and the systems that react to it (fire, crafting, …) use it the same way everywhere.</div>
      <div class="row"><input type="text" id="itnew" placeholder="new item id, e.g. crate"><button class="btn" id="itadd">ADD</button></div>
      ${ids.length?ids.map(id=>{ const d=ITEMS.defs[id]; return `<div class="it"><div class="nm"><span>${esc(id)}</span><button data-del="${esc(id)}">remove</button></div>
        <div class="props">${BOOL.map(([k,n])=>`<button class="chip" data-id="${esc(id)}" data-k="${k}" aria-pressed="${!!d[k]}">${n}</button>`).join('')}</div>
        ${NUM.map(([k,n,a,b,st])=>`<div class="num"><span style="width:70px">${n}</span><input type="range" data-id="${esc(id)}" data-n="${k}" min="${a}" max="${b}" step="${st}" value="${d[k]}"><span data-v="${esc(id)}:${k}">${d[k]}</span></div>`).join('')}</div>`; }).join(''):'<div class="dim" style="margin:10px 0">No item types yet. Add one above.</div>'}
      ${(()=>{ const d=discovered(); return d.length?`<div class="dim" style="margin-top:10px">FROM THE GAME — click to add (${d.length})</div><div class="props" style="margin:6px 0">${d.map(id=>`<button class="chip" data-add="${esc(id)}" title="${esc(nameOf(id))}">${esc(id)}</button>`).join('')}</div>`:''; })()}
      <div class="row"><button class="btn" id="itexp">EXPORT</button><button class="btn" id="itdone">DONE</button></div>
      <div class="dim">Export writes items.json; drop it in data/ to ship. BURNS reacts in-game (fire); the rest define properties systems will read.</div></div>`; }
  P.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('button'); if(!b)return;
    if(b.id==='itadd'){ const v=(P.querySelector('#itnew').value||'').trim().toLowerCase().replace(/\s+/g,'_'); if(v&&!ITEMS.defs[v]){ ITEMS.defs[v]=DEF(); save(); draw(); } return; }
    if(b.dataset.add){ const id=b.dataset.add; if(!ITEMS.defs[id]){ ITEMS.defs[id]=DEF(); save(); draw(); } return; }
    if(b.dataset.del){ delete ITEMS.defs[b.dataset.del]; save(); draw(); return; }
    if(b.dataset.k){ const d=ITEMS.defs[b.dataset.id]; d[b.dataset.k]=!d[b.dataset.k]; b.setAttribute('aria-pressed',String(d[b.dataset.k])); save(); return; }
    if(b.id==='itexp'){ const blob=new Blob([JSON.stringify(ITEMS.defs,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='items.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2e3); return; }
    if(b.id==='itdone'){ ITEMED.toggle(); return; } });
  P.addEventListener('input',e=>{ const t=e.target; if(t.dataset&&t.dataset.n){ ITEMS.defs[t.dataset.id][t.dataset.n]=+t.value; const s=P.querySelector(`[data-v="${t.dataset.id}:${t.dataset.n}"]`); if(s)s.textContent=t.value; save(); } });
  for(const ev of ['keydown','keyup'])P.addEventListener(ev,e=>{ if(e.target.matches('input,textarea'))e.stopPropagation(); });
  ITEMED.toggle=()=>{ ITEMED.on=!ITEMED.on; if(ITEMED.on)draw(); P.hidden=!ITEMED.on; };
}
