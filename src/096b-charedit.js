// THE CHARACTER EDITOR: a list of every character in the game; pick one to edit its name, look, home and stats, with the 360 view. Writes characters.json; the game reads it (CHARS). shift+3 opens it; the behaviour editor (shift+8) opens it on the BEHAVIOUR tab.
import {SHARED} from './003-shx.js';
import {CHARED, CHARS, FORAGE, GAMEED, ITEMS, keys, MAPED, NPCS, pos, SHOPS} from './003b-systems.js';
import {FADE, TILE} from './006-map-pre.js';
Object.assign(CHARED,{on:false,built:false});
{ const ANIMALS=['squirrel','fox','rat','frog','snake','spider','bat','wasp','slime','dragon','raincat','tvcat','scooterfrog','shark','manatee','rainfish','coatbear','origamifox','teddy'], MONST=/^(ogre|skeleton|slime|golem)/, PEOPLE=/^(hero|villager)/, MERCH=['tomato'];
  const kindOf=k=>MERCH.includes(k)?'MERCHANT':MONST.test(k)?'MONSTER':PEOPLE.test(k)?'PEOPLE':ANIMALS.includes(k)?'ANIMAL':'TOON';
  const behOf=N=>{ const j=N.rig&&N.rig.job; if(j)return 'WORK'; if(MONST.test(N.key))return 'FIGHT'; if(N.roam)return 'ROAM'; if(N.life)return 'DAILY LIFE'; if(N.st&&N.st.hold)return 'STAND'; return 'WANDER'; };
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

CHARED.build=()=>{ '@editor';
  const skin=MAPED.skin, fld=MAPED.fld, download=MAPED.download, stamp=MAPED.stamp, VIEW=MAPED.VIEW;
  const TABS=[['id','IDENTITY'],['look','APPEARANCE'],['beh','BEHAVIOUR'],['job','JOB']];
  const itemIds=()=>{ try{ return (window.ITEMS&&ITEMS.ids)?ITEMS.ids():[]; }catch(e){ return []; } };
  const itemVal=id=>{ try{ const v=(window.ITEMS&&ITEMS.prop)?ITEMS.prop(id,'value'):0; return +v>0?Math.round(+v):1; }catch(e){ return 1; } };
  const itemName=id=>{ try{ return (window.FORAGE&&FORAGE.NM&&FORAGE.NM[id])||id; }catch(e){ return id; } };
  const sellsOf=N=>{ const r=recR(N); return (r.trade&&Array.isArray(r.trade.sells))?r.trade.sells:[]; };
  const toggleSell=(N,id)=>{ const r=rec(N); r.trade=r.trade||{}; const a=Array.isArray(r.trade.sells)?r.trade.sells:(r.trade.sells=[]); const i=a.indexOf(id);
    if(i<0)a.push(id); else a.splice(i,1); if(!a.length){ delete r.trade.sells; if(!Object.keys(r.trade).length)delete r.trade; }
    CHARS.save(); if(window.SHOPS&&SHOPS.sync){ SHOPS.sync(); if(SHOPS.draw)SHOPS.draw(); } };
  let sel=null, tab='id', exported='';

  const css=document.createElement('style'); css.textContent=`
  #chared{position:fixed;inset:0;z-index:60;display:none;flex-direction:column;background:#07090d;font:10px Silkscreen,monospace;color:#c9ccd6}
  #chared .top{display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:10px 12px;border-bottom:2px solid #2a3040}
  #chared .top b{font-size:12px;color:#ece5d3;margin-right:6px}
  #chared .wrap{flex:1;display:flex;min-height:0}
  #chared #chL{width:260px;overflow:auto;padding:8px;border-right:2px solid #2a3040}
  #chared #chD{flex:1;overflow:auto;padding:12px 16px;max-width:520px}
  #chared .grp{color:#8a8f9c;margin:8px 2px 3px;font-size:9px;letter-spacing:1px}
  #chared .row{display:block;width:100%;text-align:left;margin:2px 0}
  #chared .dhdr{color:#f2c14e;font-size:12px;margin-bottom:8px}
  #chared .tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px}
  #chared .fields label{display:flex;justify-content:space-between;align-items:center;gap:6px;margin:5px 0}
  #chared .kv{display:flex;justify-content:space-between;gap:6px;margin:5px 0;color:#8a8f9c}
  #chared .kv span{color:#c9ccd6}
  #chared .sec{color:#ece5d3;margin:12px 0 2px}
  #chared .dim{color:#8a8f9c;line-height:1.6;margin:8px 0}
  #chared #chN{color:#f2c14e;min-height:12px;margin-left:auto}`;
  document.head.appendChild(css);

  const R=document.createElement('div'); R.id='chared';
  R.innerHTML='<div class="top"><b>CHARACTER EDITOR</b>'
    +'<button class="mb hot" id="chE">EXPORT</button><button class="mb" id="chI">IMPORT</button><input id="chF" type="file" accept=".json,application/json" style="display:none">'
    +'<button class="mb" id="chRA">START OVER (THE GAME AS IT IS)</button><button class="mb" id="chX">DONE</button><span id="chN"></span></div>'
    +'<div class="wrap"><div id="chL"></div><div id="chD"></div></div>';
  document.body.appendChild(R); const q=s=>R.querySelector(s);

  const snap=()=>JSON.stringify(clean()), clean=()=>{ const o={}; for(const id in CHARS.store){ const r=CHARS.store[id]; if(r&&Object.keys(r).length)o[id]=r; } return o; };
  const dirty=()=>{ const n=q('#chN'); if(n)n.textContent=exported===snap()?'':'NOT EXPORTED YET'; };
  const rec=N=>{ const id=CHARS.id(N); return CHARS.store[id]||(CHARS.store[id]={}); };
  const recR=N=>CHARS.store[CHARS.id(N)]||{};
  const homeTiles=N=>{ const r=recR(N); if(r.home)return r.home.slice(); const h=N.home||{}; return [CHARS.tx(h.x||0),CHARS.tz(h.z||0),+(((h.r||0)/TILE)).toFixed(1)]; };
  const cur=(N,f)=>{ const r=recR(N); switch(f){
    case 'name': return r.name!=null?r.name:(N.name||N.key||'');
    case 'scale': return r.scale!=null?r.scale:+(N.g?N.g.scale.x:1).toFixed(2);
    case 'tint': return r.tint||'#ffffff';
    case 'hp': return r.hp!=null?r.hp:(N.hp==null?1:N.hp);
    case 'stamina': return r.stamina!=null?r.stamina:(N.sta==null?1:N.sta);
    case 'speed': return r.speed!=null?r.speed:+(((N.st?N.st.v:0)/TILE)).toFixed(2);
    case 'size': return r.size!=null?r.size:+(((N.st?N.st.R:.3*TILE)/TILE)).toFixed(2); } };

  const ALL=()=>NPCS.concat(NPCS.extra||[]);
  const listHTML=()=>{ const groups={}; ALL().forEach((N,i)=>{ if(!N||!N.st)return; (groups[kindOf(N.key)]||(groups[kindOf(N.key)]=[])).push([i,N]); });
    return Object.keys(groups).sort().map(k=>'<div class="grp">'+k+' ('+groups[k].length+')</div>'+groups[k].map(([i,N])=>'<button class="row mb'+(N===sel?' hot':'')+'" data-i="'+i+'">'+esc(N.name||N.key||'someone')+'</button>').join('')).join(''); };
  const detailHTML=()=>{ if(!sel)return '<div class="dim">Pick a character from the list to edit it. Changes are a draft in this browser; EXPORT writes characters.json, which the game reads.</div>';
    const N=sel, tabs=TABS.map(([k,n])=>'<button class="mb'+(tab===k?' hot':'')+'" data-tab="'+k+'">'+n+'</button>').join(''); let b='';
    if(tab==='id'){ b=fld('NAME','name',cur(N,'name'),0,'text')
      +'<div class="kv">KIND <span>'+kindOf(N.key)+'</span></div>'
      +'<div class="kv">WHO <span>'+esc(N.key||'')+'</span></div>'
      +'<div class="kv">SECTION <span>'+esc((SHARED.SECTION&&SHARED.SECTION.id)||'A')+'</span></div>'
      +'<div class="kv">LEVEL <span>'+(N.lv==='down'?'UNDERGROUND':'STREET')+'</span></div>'; }
    else if(tab==='look'){ b=fld('SCALE','scale',cur(N,'scale'),.05)+fld('TINT','tint',cur(N,'tint'),0,'color')
      +'<div class="dim">Scale and tint both ship — tint is a colour grade over the whole body. (Body swap &amp; part palette: a larger effort, not yet.)</div>'
      +'<div style="margin-top:8px"><button class="mb hot" id="chV">VIEW 360</button></div>'; }
    else if(tab==='beh'){ const ht=homeTiles(N); b='<div class="sec">HOME</div>'
      +fld('HOME X (TILES)','homex',ht[0],.5)+fld('HOME Y (TILES)','homey',ht[1],.5)+fld('RANGE (TILES)','range',ht[2],.5)
      +'<div style="display:flex;gap:4px;flex-wrap:wrap;margin:6px 0"><button class="mb" id="chHere">HOME = MY SPOT</button><button class="mb" id="chPut">STAYS PUT</button></div>'
      +'<div class="dim">A character keeps to its home range — a circle it is usually found in. Range 0 stays put.</div>'
      +'<div class="sec">STATS</div><div class="kv">BEHAVIOR <span>'+behOf(N)+'</span></div>'
      +fld('HEALTH','hp',cur(N,'hp'),.1)+fld('STAMINA','stamina',cur(N,'stamina'),.1)+fld('SPEED (TILES/S)','speed',cur(N,'speed'),.05)+fld('SIZE (RADIUS)','size',cur(N,'size'),.05); }
    else { const sells=sellsOf(N), ids=itemIds(); b='<div class="sec">SHOPKEEPER</div>'
      +'<div class="dim">Pick the item types this character sells. Price is each item\'s VALUE (set in the item editor, shift+7). Buyers walk up and get them into their pack.</div>';
      if(!ids.length)b+='<div class="dim" style="color:#c8a060">No item types yet — add some in the item editor (shift+7), then they show here.</div>';
      else b+='<div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0">'+ids.map(id=>'<button class="chip" data-sell="'+esc(id)+'" style="padding:4px 8px;border:2px solid '+(sells.includes(id)?'#f2c14e':'#3a3f4e')+';background:#0e1016;color:'+(sells.includes(id)?'#f2c14e':'#9b9584')+';cursor:pointer;font:inherit">'+esc(itemName(id))+' <span style="color:#6f7686">$'+itemVal(id)+'</span></button>').join('')+'</div>';
      if(sells.length)b+='<div class="dim">Sells '+sells.length+' item'+(sells.length===1?'':'s')+'. Walk up to '+esc(N.name||'them')+' in game to buy.</div>'; }
    return '<div class="dhdr">'+esc(N.name||N.key)+'</div><div class="tabs">'+tabs+'</div><div class="fields">'+b+'</div>'; };
  const draw=()=>{ q('#chL').innerHTML=listHTML(); q('#chD').innerHTML=detailHTML(); skin(R); dirty(); };

  const applyHome=(N,ht)=>{ if(N.st)N.home={id:CHARS.id(N),x:CHARS.wx(+ht[0]||0),z:CHARS.wz(+ht[1]||0),r:(+ht[2]||0)*TILE}; };
  const setField=(N,f,raw)=>{ const r=rec(N);
    if(f==='name'){ const v=String(raw).slice(0,60); r.name=v; CHARS.live(N,'name',v); }
    else if(f==='scale'){ const v=Math.max(.05,+raw||1); r.scale=v; CHARS.live(N,'scale',v); }
    else if(f==='tint'){ r.tint=/^#[0-9a-f]{6}$/i.test(raw)?raw:'#ffffff'; CHARS.live(N,'tint',r.tint); }
    else if(f==='hp'){ const v=Math.max(0,+raw||0); r.hp=v; CHARS.live(N,'hp',v); }
    else if(f==='stamina'){ const v=Math.max(0,+raw||0); r.stamina=v; CHARS.live(N,'stamina',v); }
    else if(f==='speed'){ const v=Math.max(0,+raw||0); r.speed=v; CHARS.live(N,'speed',v); }
    else if(f==='size'){ const v=Math.max(.05,+raw||.3); r.size=v; CHARS.live(N,'size',v); }
    else if(f==='homex'||f==='homey'||f==='range'){ const ht=homeTiles(N); if(f==='homex')ht[0]=+raw||0; else if(f==='homey')ht[1]=+raw||0; else ht[2]=Math.max(0,+raw||0); r.home=[+ht[0],+ht[1],+ht[2]]; applyHome(N,r.home); }
    CHARS.save(); dirty(); };

  const openView=N=>{ const side=document.createElement('div');
    side.innerHTML='<div style="color:#f2c14e;font-size:11px;margin-bottom:6px">'+esc(N.name||N.key)+'</div>'+fld('SCALE','scale',cur(N,'scale'),.05)+fld('TINT','tint',cur(N,'tint'),0,'color')
      +'<div style="color:#8a8f9c;margin-top:8px;line-height:1.6">ITS OWN BODY, LENT TO THE VOID. SCALE AND TINT SHOW HERE; EVERYTHING GOES INTO characters.json.</div><div style="margin-top:8px"><button class="mb" id="vwX" data-hot="1">BACK TO THE LIST</button></div>';
    side.addEventListener('input',e=>{ const f=e.target.dataset.f; if(f){ setField(N,f,e.target.value); VIEW.redo(); } });
    side.addEventListener('click',e=>{ if(e.target.id==='vwX')VIEW.close(); });
    VIEW.onclose=()=>draw();
    VIEW.open({name:N.name||N.key,lend:()=>N.g?[N.g]:[],lendScale:()=>1,opacity:()=>1,look:()=>({})},side); };

  q('#chL').addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('button[data-i]'); if(!b)return; sel=ALL()[+b.dataset.i]||null; draw(); });
  q('#chD').addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('button'); if(!b||!sel)return;
    if(b.dataset.tab){ tab=b.dataset.tab; draw(); } else if(b.id==='chV')openView(sel);
    else if(b.id==='chHere'){ const ht=homeTiles(sel); setField(sel,'homex',CHARS.tx(pos.x)); setField(sel,'homey',CHARS.tz(pos.z)); if(!(ht[2]>0))setField(sel,'range',6); draw(); }
    else if(b.id==='chPut'){ setField(sel,'range',0); draw(); }
    else if(b.dataset.sell){ toggleSell(sel,b.dataset.sell); draw(); } });
  q('#chD').addEventListener('change',e=>{ const f=e.target.dataset.f; if(f&&sel){ setField(sel,f,e.target.value); draw(); } });
  q('#chD').addEventListener('input',e=>{ const f=e.target.dataset.f; if(f&&sel&&e.target.type!=='color')setField(sel,f,e.target.value); });

  q('#chE').onclick=()=>{ download('characters.json',clean()); exported=snap(); q('#chN').textContent='EXPORTED characters.json'; };
  q('#chI').onclick=()=>q('#chF').click();
  q('#chF').onchange=async e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; if(!f)return; try{ const j=JSON.parse(await f.text()); if(!j||typeof j!=='object'||Array.isArray(j))throw 0; CHARS.store=j; CHARS.save(); if(CHARS.applyAll)CHARS.applyAll(); exported=snap(); draw(); q('#chN').textContent='IMPORTED '+f.name; }catch(err){ q('#chN').textContent='NOT A CHARACTERS FILE: '+f.name; } };
  q('#chRA').onclick=()=>{ CHARS.store={}; CHARS.save(); draw(); q('#chN').textContent='DRAFT CLEARED (committed characters.json still applies on reload)'; };
  q('#chX').onclick=()=>CHARED.toggle();

  addEventListener('keydown',e=>{ if(!CHARED.on)return; if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){ if(e.key==='Escape')e.target.blur(); else return; } e.stopImmediatePropagation();
    if(e.key==='Escape'){ e.preventDefault(); if(VIEW&&VIEW.on)VIEW.close(); else CHARED.toggle(); } },true);
  addEventListener('keyup',e=>{ if(CHARED.on&&!(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)))e.stopImmediatePropagation(); },true);

  CHARED.show=(on,tab0)=>{ CHARED.on=on; R.style.display=on?'flex':'none'; if(on){ if(tab0)tab=tab0; if(keys.clear)keys.clear(); if(sel&&ALL().indexOf(sel)<0)sel=null; draw(); } else if(VIEW&&VIEW.on)VIEW.close(); };
};
CHARED.toggle=async tab0=>{ '@later'; if(CHARED.busy)return;
  if(CHARED.built){ if(CHARED.on){ if(tab0)CHARED.show(true,tab0); else CHARED.show(false); } else CHARED.show(true,tab0); return; }
  CHARED.busy=true; await FADE.run('LOADING CHARACTER EDITOR',async()=>{ await GAMEED.ensure(); CHARED.build(); CHARED.built=true; },{cut:true}); if(CHARED.built)CHARED.show(true,tab0); CHARED.busy=false; };
window.CHARED=CHARED; }
