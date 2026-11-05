// THE ITEM MODEL AND EDITOR: ITEMS holds each item type's shared properties (burnable, edible, sellable, value, ...): data/items.json, the owner's edits over it, and what the families register in code (FORAGE.add) under both; ITEMED edits them (the owner's).
import {FORAGE, ITEMED, ITEMS, TEXT} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {TPANE} from './087dz-tpane.js';
{ const BOOL=[['burnable','BURNS'],['edible','EDIBLE'],['stackable','STACKS'],['pickup','PICK UP'],['sellable','SELLABLE'],['offworld','OFF-WORLD'],['rental','RENTAL'],['reuse','NOT USED UP'],['potted','IN CRAB POTS'],['container','HOLDS THINGS']];
  const NUM=[['weight','WEIGHT',0,50,0.1,1],['value','VALUE',0,500,1,0],['breath','BREATH s',0,180,5,0],['darksight','DARKSIGHT s',0,900,30,0],['heals','HEALS',0,1,.05,0],['boostS','BOOST s',0,600,10,0],['tank','TANK s',0,900,30,0],['damage','DAMAGE',0,10,.5,0],['depth','DEPTH m',0,12,.5,0],['fight','FIGHT',0,10,.5,0],['common','COMMON',0,10,.1,0],['holds','HOLDS',0,200,5,0],['speed','SPEED m/s',0,20,.5,0],['len','LENGTH m',0,3,.05,0],['cast','CAST m',0,40,1,0],['line','LINE STRENGTH',0,3,.1,0],['reel','REEL SPEED',0,3,.05,0],['lasts','LASTS h',0,240,1,0]];
  const SEL=[['slot','WORN / HELD',['none','hand','body','legs','head','eyes','back']],['grants','GRANTS (ABILITY)',['none','catch','fight','guard','float','light','sight','fish','breathe','fly','ride','scan','night','lift','prospect','extract']],['water','LIVES IN',['none','river','lake']],['bites','BITES',['any','day','dusk','night']],['bait','BAIT',['none','worm','cut']],['keeps','HOLDS WHAT',['butterflies','fish']],['boost','BOOST',['none','swift','str','regen','keen']],['icon','PICTURE',['auto','mush','potion','dish','fish','fruit','bfly','bird','book','jar','seed','sword','net','rod','goggles','lamp','armour','coat','jeans','tank','board','cage','cigar','gadget','cube','kite','card','gem','mortar','sack','tool','crate']]];
  const CLR=[['color','WORN COLOUR']]; SEL.push(['tier','RARITY',['common','rare','super']]);
  const DEF=()=>{ const d={}; for(const [k] of BOOL)d[k]=false; for(const [k,,,,,v] of NUM)d[k]=v; for(const [k,,opts] of SEL)d[k]=opts[0]; return d; };
  let BAKED={}; try{ BAKED=__DATA__("data/items.json")||{}; }catch(e){}
  try{ for(const id in BAKED)ITEMS.defs[id]=Object.assign(DEF(),BAKED[id]); }catch(e){}
  let OVER={}; try{ OVER=JSON.parse(OWNED.get('items')||'{}')||{}; for(const id in OVER)ITEMS.defs[id]=Object.assign(ITEMS.defs[id]||DEF(),OVER[id]); }catch(e){ OVER={}; }
  ITEMS.reg=(id,props)=>{ const d=ITEMS.defs[id]||(ITEMS.defs[id]=DEF()), b=BAKED[id]||{}, o=OVER[id]||{}; for(const k in props)if(!(k in b)&&!(k in o))d[k]=props[k]; return d; };
  ITEMS.def=id=>ITEMS.defs[id];
  ITEMS.cls=[];   // item classes: ids made in play (a painting) take their class's properties ({is:id=>bool, as:classId, calc:{prop:(id,def)=>value}})
  ITEMS.prop=(id,k)=>{ let d=ITEMS.defs[id]; const c=ITEMS.cls.length&&ITEMS.cls.find(c=>c.is(id)); if(c){ d=ITEMS.defs[c.as]; if(c.calc&&c.calc[k])return c.calc[k](id,d); } return d?d[k]:undefined; };
  ITEMS.ids=()=>Object.keys(ITEMS.defs).sort();
  const save=()=>{ try{ OWNED.set('items',JSON.stringify(ITEMS.defs)); }catch(e){} };
  const css=document.createElement('style'); css.textContent=`
  #ited{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:12px;width:min(400px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20}
  #ited[hidden]{display:none} #ited h2{font:12px var(--pixel);color:var(--key);margin:0;padding:12px 14px;border-bottom:2px solid var(--line)} #ited .pane{padding:10px 14px}
  #ited .dim{color:var(--dim);font-size:10px;line-height:1.5} #ited .tp{margin:8px 0}
  #ited .props{display:flex;flex-wrap:wrap;gap:5px;max-height:150px;overflow:auto} #ited .chip{background:#0e1016;border:2px solid #3a3f4e;color:var(--dim);padding:4px 7px;cursor:pointer;font:inherit} #ited .chip[aria-pressed=true]{border-color:var(--key);color:var(--key)}
  #ited .row{display:flex;gap:6px;align-items:center;margin:8px 0;flex-wrap:wrap}
  #ited .row input[type=text]{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 7px;flex:1;min-width:120px} #ited .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 8px;cursor:pointer}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='ited'; P.hidden=true; document.body.appendChild(P);
  const esc=TEXT.esc;
  const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,'_');
  const discovered=()=>{ const s=new Set();
    try{ if(window.FORAGE&&FORAGE.ids)for(const id of FORAGE.ids())s.add(norm(id)); }catch(e){}
    try{ const G=window.GPH; if(G&&G.loose)for(const it of G.loose())if(it&&it.name)s.add(norm(it.name)); }catch(e){}
    for(const id in ITEMS.defs)s.delete(id); return [...s].sort(); };
  const nameOf=id=>{ try{ return (window.FORAGE&&FORAGE.NM&&FORAGE.NM[id])||id; }catch(e){ return id; } };
  let sel=null, busy=Promise.resolve();
  const HEX=v=>/^#[0-9a-f]{6}$/i.test(v||'');
  const props=async id=>{ '@later'; const el=P.querySelector('.tp'); if(!el)return; const d=ITEMS.defs[id];
    if(!d){ if(el.__tp){ el.__tp.dispose(); el.__tp=null; } return; }
    const w=(get,put)=>[get,v=>{ if(v===get())return; put(v); save(); }];
    const V=TPANE.live(Object.fromEntries([...BOOL.map(([k])=>[k,w(()=>!!d[k],v=>{ d[k]=v; })]),
      ...NUM.map(([k])=>[k,w(()=>+d[k]||0,v=>{ d[k]=+(+v).toFixed(4); })]),
      ...SEL.map(([k,,o])=>[k,w(()=>d[k]==null?o[0]:d[k],v=>{ d[k]=v; })]),
      ...CLR.map(([k])=>[k,w(()=>HEX(d[k])?d[k]:'#000000',v=>{ d[k]=v; cx.forEach(([k2,b])=>{ if(k2===k)b.title='CLEAR'; }); })])]));
    const pane=await TPANE.make(el,{title:id}), cx=[];
    const f1=pane.addFolder({title:'FLAGS'}); for(const [k,n] of BOOL)f1.addBinding(V,k,{label:n});
    const f2=pane.addFolder({title:'NUMBERS'}); for(const [k,n,a,b,st] of NUM)f2.addBinding(V,k,{label:n,min:a,max:b,step:st});
    const f3=pane.addFolder({title:'CHOICES'}); for(const [k,n,o] of SEL)f3.addBinding(V,k,{label:n,options:Object.fromEntries(o.map(x=>[x,x]))});
    const f4=pane.addFolder({title:'COLOUR'}); for(const [k,n] of CLR){ f4.addBinding(V,k,{label:n});
      const b=f4.addButton({title:d[k]?'CLEAR':'NONE'}); cx.push([k,b]);
      b.on('click',()=>{ delete d[k]; save(); b.title='NONE'; pane.refresh(); }); }
    pane.addButton({title:'REMOVE '+id}).on('click',()=>{ delete ITEMS.defs[id]; save(); redraw(); }); };
  const pick=id=>{ sel=id; for(const c of P.querySelectorAll('[data-pick]'))c.setAttribute('aria-pressed',String(c.dataset.pick===id)); return busy=busy.then(()=>props(id)).catch(e=>console.warn('item editor',e)); };
  const draw=async()=>{ '@later'; const ids=ITEMS.ids(); if(!ITEMS.defs[sel])sel=ids[0]||null;
    const old=P.querySelector('.tp'); if(old&&old.__tp)old.__tp.dispose();
    P.innerHTML=`<h2>ITEMS — PROPERTIES</h2><div class="pane">
      <div class="dim">A property is shared by every item of its kind. Turn one on here and the systems that react to it (fire, crafting, …) use it the same way everywhere.</div>
      <div class="row"><input type="text" id="itnew" placeholder="new item id, e.g. crate"><button class="btn" id="itadd">ADD</button></div>
      ${ids.length?`<div class="dim" style="margin-top:10px">ITEM TYPES — click one to edit (${ids.length})</div><div class="props" style="margin:6px 0">${ids.map(id=>`<button class="chip" data-pick="${esc(id)}" aria-pressed="${id===sel}">${esc(id)}</button>`).join('')}</div>`:'<div class="dim" style="margin:10px 0">No item types yet. Add one above.</div>'}
      <div class="tp"></div>
      ${(()=>{ const d=discovered(); return d.length?`<div class="dim" style="margin-top:10px">FROM THE GAME — click to add (${d.length})</div><div class="props" style="margin:6px 0">${d.map(id=>`<button class="chip" data-add="${esc(id)}" title="${esc(nameOf(id))}">${esc(id)}</button>`).join('')}</div>`:''; })()}
      <div class="tpb"></div>
      <div class="dim">Export writes items.json; drop it in data/ to ship. BURNS (fire), EDIBLE and BREATH (eating), SELLABLE (shops), OFF-WORLD (merchant-only), DAMAGE (a blade's blow), WORN/HELD + GRANTS (gear: a merchant sells it, you hold or wear it) and LIVES IN, DEPTH, BITES, BAIT, FIGHT, COMMON, WEIGHT (a fish: where, how deep and when it bites, on what, how hard it pulls, how often, how heavy; a bait: its kind) HOLDS (a jar: how many butterflies), BOOST and BOOST s (eating or drinking it: faster, stronger, mending or keener for that long), HEALS (eating it mends you), WORN COLOUR (clothes: dyes your shirt or trousers), and SPEED and LENGTH (a hoverboard: how fast, how long), LASTS h (food and fish: real hours it stays fresh, 0 the kind's own: a fish a day, other food two days; it sells for less as it ages, nothing once spoiled), RARITY (common, rare or super: how often a ground gives it, 70, 25 or 5 in a hundred; the super only once the skill's trainer ranks you high enough) react in-game; GRANTS scan hears security, night sees in the dark; the rest define properties systems will read.</div></div>`;
    const bp=await TPANE.make(P.querySelector('.tpb'));
    bp.addButton({title:'EXPORT'}).on('click',()=>{ const blob=new Blob([JSON.stringify(ITEMS.defs,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='items.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2e3); });
    bp.addButton({title:'DONE'}).on('click',()=>ITEMED.toggle());
    await props(sel); };
  const redraw=()=>busy=busy.then(draw).catch(e=>console.warn('item editor',e));
  P.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('button'); if(!b)return;
    if(b.id==='itadd'){ const v=(P.querySelector('#itnew').value||'').trim().toLowerCase().replace(/\s+/g,'_'); if(v&&!ITEMS.defs[v]){ ITEMS.defs[v]=DEF(); sel=v; save(); redraw(); } return; }
    if(b.dataset.add){ const id=b.dataset.add; if(!ITEMS.defs[id]){ ITEMS.defs[id]=DEF(); sel=id; save(); redraw(); } return; }
    if(b.dataset.pick){ pick(b.dataset.pick); return; } });
  for(const ev of ['keydown','keyup'])P.addEventListener(ev,e=>{ if(e.target.matches('input,textarea,select'))e.stopPropagation(); });
  ITEMED.toggle=()=>{ ITEMED.on=!ITEMED.on; P.hidden=!ITEMED.on; if(ITEMED.on)return redraw(); };
}
