// THE CHARACTER EDITOR: a list of every character in the game; pick one to edit its name, look, home and stats, with the 360 view. Writes characters.json; the game reads it (CHARS). shift+3 opens it; the behaviour editor (shift+8) opens it on the BEHAVIOUR tab.
import {CHARED, CHARS, FORAGE, GAMEED, ITEMS, keys, MAPED, NPCS, pos, SHOPS, TALK, TEXT} from './003b-systems.js';
import {FADE, SECTION, TILE} from './006-map-pre.js';
import {TPANE} from './087dz-tpane.js';
Object.assign(CHARED,{on:false,built:false});
{ const ANIMALS=['squirrel','fox','rat','frog','snake','spider','bat','wasp','slime','dragon','raincat','tvcat','scooterfrog','shark','manatee','rainfish','coatbear','origamifox','teddy','ticketfox','deer','wolf','bear','crow','owl','duck','cat','blackcat','dog','cow','pig','horse','wildhorse','mule','ibex','lion','elephant','giraffe','zebra','camel','penguin','raptor','stego','brachio','ptera','antqueen','woodant','aphid','ladybird','hopper','beetle','mantis','caterpillar','slug','snail','crab','bee','bumblebee','firefly'], MONST=/^(ogre|skeleton|slime|golem)/, PEOPLE=/^(hero|villager)/, MERCH=['tomato'];
  const kindOf=k=>MERCH.includes(k)?'MERCHANT':MONST.test(k)?'MONSTER':PEOPLE.test(k)?'PEOPLE':ANIMALS.includes(k)?'ANIMAL':'TOON';
  const behOf=N=>{ const j=N.rig&&N.rig.job; if(j)return 'WORK'; if(MONST.test(N.key))return 'FIGHT'; if(N.roam)return 'ROAM'; if(N.life)return 'DAILY LIFE'; if(N.st&&N.st.hold)return 'STAND'; return 'WANDER'; };
  const esc=TEXT.esc;

CHARED.build=()=>{ '@editor';
  const skin=MAPED.skin, download=MAPED.download, stamp=MAPED.stamp, VIEW=MAPED.VIEW;
  const TABS=[['id','IDENTITY'],['look','APPEARANCE'],['beh','BEHAVIOUR'],['job','JOB'],['talk','TALK']];
  const itemIds=()=>{ try{ return (window.ITEMS&&ITEMS.ids)?ITEMS.ids():[]; }catch(e){ return []; } };
  const itemVal=id=>{ try{ const v=(window.ITEMS&&ITEMS.prop)?ITEMS.prop(id,'value'):0; return +v>0?Math.round(+v):1; }catch(e){ return 1; } };
  const itemName=id=>{ try{ return (window.FORAGE&&FORAGE.NM&&FORAGE.NM[id])||id; }catch(e){ return id; } };
  const sellsOf=N=>{ const r=recR(N); return (r.trade&&Array.isArray(r.trade.sells))?r.trade.sells:[]; };
  const toggleSell=(N,id)=>{ const r=rec(N); r.trade=r.trade||{}; const a=Array.isArray(r.trade.sells)?r.trade.sells:(r.trade.sells=[]); const i=a.indexOf(id);
    if(i<0)a.push(id); else a.splice(i,1); if(!a.length){ delete r.trade.sells; if(!Object.keys(r.trade).length)delete r.trade; }
    CHARS.save(); if(window.SHOPS&&SHOPS.sync){ SHOPS.sync(); if(SHOPS.draw)SHOPS.draw(); } };
  const buysOf=N=>{ const r=recR(N); return (r.trade&&Array.isArray(r.trade.buys))?r.trade.buys:[]; };
  const toggleBuy=(N,g)=>{ const r=rec(N); r.trade=r.trade||{}; const a=Array.isArray(r.trade.buys)?r.trade.buys:(r.trade.buys=[]); const i=a.indexOf(g); if(i<0)a.push(g); else a.splice(i,1); if(!a.length)delete r.trade.buys;
    CHARS.save(); if(window.SHOPS&&SHOPS.draw)SHOPS.draw(); };
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
  #chared .tp{margin:6px 0}
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

  const ALL=()=>NPCS.all();
  const listHTML=()=>{ const groups={}; ALL().forEach((N,i)=>{ if(!N||!N.st)return; (groups[kindOf(N.key)]||(groups[kindOf(N.key)]=[])).push([i,N]); });
    return Object.keys(groups).sort().map(k=>'<div class="grp">'+k+' ('+groups[k].length+')</div>'+groups[k].map(([i,N])=>'<button class="row mb'+(N===sel?' hot':'')+'" data-i="'+i+'">'+esc(N.name||N.key||'someone')+'</button>').join('')).join(''); };
  const detailHTML=()=>{ if(!sel)return '<div class="dim">Pick a character from the list to edit it. Changes are a draft in this browser; EXPORT writes characters.json, which the game reads.</div>';
    const N=sel, tabs=TABS.map(([k,n])=>'<button class="mb'+(tab===k?' hot':'')+'" data-tab="'+k+'">'+n+'</button>').join(''); let b='';
    if(tab==='id')b=TP('id');
    else if(tab==='look')b=TP('look')+'<div class="dim">Scale and tint both ship — tint is a colour grade over the whole body. (Body swap &amp; part palette: a larger effort, not yet.)</div>';
    else if(tab==='beh')b=TP('home')+'<div class="dim">A character keeps to its home range — a circle it is usually found in. Range 0 stays put.</div>'
      +TP('job')+'<div class="dim">Where they work (a place id: bar, bank, diner, park, street...), their hours by the clock, out at a spot or over an area or inside, and where they sleep. Takes effect when the game next loads.</div>'
      +TP('stats');
    else if(tab==='talk')b=talkHTML(N);
    else { const sells=sellsOf(N), ids=itemIds(); b='<div class="sec">SHOPKEEPER</div>'
      +'<div class="dim">Pick the item types this character sells. Price is each item\'s VALUE (set in the item editor, shift+7). Buyers walk up and get them into their pack.</div>';
      if(!ids.length)b+='<div class="dim" style="color:#c8a060">No item types yet — add some in the item editor (shift+7), then they show here.</div>';
      else b+='<div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0">'+ids.map(id=>'<button class="chip" data-sell="'+esc(id)+'" style="padding:4px 8px;border:2px solid '+(sells.includes(id)?'#f2c14e':'#3a3f4e')+';background:#0e1016;color:'+(sells.includes(id)?'#f2c14e':'#9b9584')+';cursor:pointer;font:inherit">'+esc(itemName(id))+' <span style="color:#6f7686">$'+itemVal(id)+'</span></button>').join('')+'</div>';
      { const bys=buysOf(N), G=Object.keys((window.FORAGE&&FORAGE.BUYK)||{}); if(G.length)b+='<div class="sec">BUYS</div><div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0">'+G.map(g=>'<button class="chip" data-buy="'+esc(g)+'" style="padding:4px 8px;border:2px solid '+(bys.includes(g)?'#f2c14e':'#3a3f4e')+';background:#0e1016;color:'+(bys.includes(g)?'#f2c14e':'#9b9584')+';cursor:pointer;font:inherit">'+esc(g.toUpperCase())+'</button>').join('')+'</div>'; }
      if(sells.length)b+='<div class="dim">Sells '+sells.length+' item'+(sells.length===1?'':'s')+'. Walk up to '+esc(N.name||'them')+' in game to buy.</div>'; }
    return '<div class="dhdr">'+esc(N.name||N.key)+'</div><div class="tabs">'+tabs+'</div><div class="fields">'+b+'</div>'; };
  // TALK: the character's script (lines, and the replies under each); the draft starts from the committed one
  const DOS=[['','LEADS ON'],['shop','OPENS THE SHOP'],['give','GIVES (ITEM N)'],['take','TAKES (ITEM N)'],['set','REMEMBERS (FLAG=V)']];
  const talkOf=(N,make)=>{ const r=rec(N); if(!r.talk){ const c=CHARS.rec&&CHARS.rec(CHARS.id(N)); if(c&&c.talk)r.talk=JSON.parse(JSON.stringify(c.talk)); else if(make)r.talk={start:'hi',lines:{hi:{say:'Hello, {name}.',opts:[{t:'GOODBYE.',go:''}]}}}; } return r.talk; };
  const inp=(k,v,w)=>'<input data-tk="'+k+'" value="'+esc(v)+'" style="font:inherit;background:#0e1016;color:#c9ccd6;border:2px solid #3a3f4e;padding:3px 5px;width:'+(w||'100%')+';box-sizing:border-box">';
  const talkHTML=N=>{ const tk=(recR(N).talk)||(CHARS.rec&&(CHARS.rec(CHARS.id(N))||{}).talk);
    if(!tk)return '<div class="dim">No script: this character chats from the line pools (hello, what this place is, its shop if it keeps one, goodbye).</div>'+TP('talk');
    const ids=Object.keys(tk.lines||{});
    const pickS=(opts,k,cur)=>'<select data-tk="'+k+'" style="font:inherit;background:#0e1016;color:#c9ccd6;border:2px solid #3a3f4e;max-width:150px">'+opts.map(([a,n])=>'<option value="'+esc(a)+'"'+(a===(cur||'')?' selected':'')+'>'+esc(n)+'</option>').join('')+'</select>';
    let o='<div class="dim">Each LINE is what they say (one per row: a row is picked at random; {name} is the player; @greet uses a line pool). Under it, your REPLIES: where each leads, what it does, and IF (words: flag, !flag, flag=v, has:item:n) to show it only then. What they REMEMBER is saved per player.</div>'
      +TP('talk');
    for(const id of ids){ const L=tk.lines[id], say=Array.isArray(L.say)?L.say.join('\n'):(L.say||'');
      o+='<div style="border:2px solid #2a3040;padding:6px 8px;margin:8px 0"><div style="display:flex;gap:6px;align-items:center">LINE '+inp('id|'+id,id,'120px')+'<span style="margin-left:auto"></span><button class="mb" data-tdl="'+esc(id)+'">DELETE LINE</button></div>'
        +'<textarea data-tk="say|'+esc(id)+'" rows="2" style="width:100%;box-sizing:border-box;margin:5px 0;font:inherit;background:#0e1016;color:#ece5d3;border:2px solid #3a3f4e;padding:4px">'+esc(say)+'</textarea>'
        +'<div style="display:flex;gap:6px;align-items:center;color:#8a8f9c">ON SAYING IT, REMEMBERS '+inp('lset|'+id,L.set||'','160px')+'</div>';
      (L.opts||[]).forEach((r,i)=>{ const k='|'+id+'|'+i; o+='<div style="display:grid;grid-template-columns:1fr auto;gap:4px;margin:5px 0 0 10px;padding-top:5px;border-top:1px solid #22252f">'+inp('t'+k,r.t||'')+'<button class="mb" data-tdo="'+esc(id)+'|'+i+'">X</button>'
        +'<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;grid-column:1/-1;color:#8a8f9c">TO '+pickS([['','(END)'],...ids.map(x=>[x,x])],'go'+k,r.go)+' '+pickS(DOS,'do'+k,r.do)+' '+inp('arg'+k,r.arg||'','110px')+' IF '+inp('if'+k,r.if||'','120px')+'</div></div>'; });
      o+='<button class="mb" data-tao="'+esc(id)+'" style="margin:6px 0 0 10px">ADD A REPLY</button></div>'; }
    return o; };
  const talkSet=(N,k,v)=>{ const tk=talkOf(N,true), [f,id,i]=k.split('|'), L=tk.lines[id];
    if(f==='start')tk.start=v; else if(f==='say')L.say=v.includes('\n')?v.split('\n').map(s=>s.trim()).filter(Boolean):v; else if(f==='lset'){ if(v.trim())L.set=v.trim(); else delete L.set; }
    else if(f==='id'){ const nv=v.trim().replace(/\s+/g,'_'); if(!nv||tk.lines[nv])return; tk.lines[nv]=L; delete tk.lines[id]; if(tk.start===id)tk.start=nv; for(const x of Object.values(tk.lines))for(const r of x.opts||[])if(r.go===id)r.go=nv; }
    else { const r=L.opts[+i]; if(v===''&&f!=='t')delete r[f]; else r[f]=v; }
    CHARS.save(); dirty(); };
  const TP=k=>'<div class="tp" data-p="'+k+'"></div>';
  let panes=[], gen=0;
  const soon=()=>setTimeout(()=>{ for(const p of panes)p.refresh(); },0);
  const relist=()=>{ q('#chL').innerHTML=listHTML(); skin(q('#chL')); const h=q('#chD .dhdr'); if(h&&sel)h.textContent=sel.name||sel.key; };
  const bind=(N,f,after)=>[()=>cur(N,f),v=>{ setField(N,f,v); (after||soon)(); }];
  const TITLE={home:'HOME',job:'JOB',stats:'STATS'};
  const FILL={
    id:(p,N)=>{ p.addBinding(TPANE.live({name:bind(N,'name',()=>{ relist(); soon(); })}),'name',{label:'NAME'});
      const I={kind:kindOf(N.key),who:N.key||'',section:SECTION.id,level:N.lv==='down'?'UNDERGROUND':'STREET'};
      for(const [k,l] of [['kind','KIND'],['who','WHO'],['section','SECTION'],['level','LEVEL']])p.addBinding(I,k,{label:l,readonly:true,interval:0}); },
    look:(p,N)=>{ const L=TPANE.live({scale:bind(N,'scale'),tint:bind(N,'tint')}); p.addBinding(L,'scale',{label:'SCALE',min:.05,step:.05}); p.addBinding(L,'tint',{label:'TINT',view:'color'});
      p.addButton({title:'VIEW 360'}).on('click',()=>openView(N)); },
    home:(p,N)=>{ const ht=i=>()=>homeTiles(N)[i], L=TPANE.live({homex:[ht(0),bind(N,'homex')[1]],homey:[ht(1),bind(N,'homey')[1]],range:[ht(2),bind(N,'range')[1]]});
      p.addBinding(L,'homex',{label:'HOME X (TILES)',step:.5}); p.addBinding(L,'homey',{label:'HOME Y (TILES)',step:.5}); p.addBinding(L,'range',{label:'RANGE (TILES)',min:0,step:.5});
      p.addButton({title:'HOME = MY SPOT'}).on('click',()=>{ const ht=homeTiles(N); setField(N,'homex',CHARS.tx(pos.x)); setField(N,'homey',CHARS.tz(pos.z)); if(!(ht[2]>0))setField(N,'range',6); soon(); });
      p.addButton({title:'STAYS PUT'}).on('click',()=>{ setField(N,'range',0); soon(); }); },
    job:(p,N)=>{ const J=()=>recR(N).job||{}, S=f=>bind(N,f)[1];
      const L=TPANE.live({jobat:[()=>J().at||'',S('jobat')],jobtitle:[()=>J().title||'',S('jobtitle')],jobopen:[()=>+(J().hours||[9,17])[0]||0,S('jobopen')],jobclose:[()=>+(J().hours||[9,17])[1]||0,S('jobclose')],
        jobr:[()=>J().r==null?'':String(J().r),S('jobr')],jobhome:[()=>J().home||'',S('jobhome')]});
      p.addBinding(L,'jobat',{label:'WORKS AT'}); p.addBinding(L,'jobtitle',{label:'TITLE'});
      p.addBinding(L,'jobopen',{label:'OPENS (HOUR)',min:0,max:24,step:.5}); p.addBinding(L,'jobclose',{label:'CLOSES (HOUR)',min:0,max:24,step:.5});
      p.addBinding(L,'jobr',{label:'OUT: AREA (TILES, BLANK = INSIDE)'}); p.addBinding(L,'jobhome',{label:'HOME (BLANK = OVER WORK; HOUSE, SUBWAY)'}); },
    stats:(p,N)=>{ p.addBinding(TPANE.live({b:[()=>behOf(N),()=>{}]}),'b',{label:'BEHAVIOR',readonly:true,interval:0});
      const L=TPANE.live({hp:bind(N,'hp'),stamina:bind(N,'stamina'),speed:bind(N,'speed'),size:bind(N,'size')});
      p.addBinding(L,'hp',{label:'HEALTH',min:0,step:.1}); p.addBinding(L,'stamina',{label:'STAMINA',min:0,step:.1}); p.addBinding(L,'speed',{label:'SPEED (TILES/S)',min:0,step:.05}); p.addBinding(L,'size',{label:'SIZE (RADIUS)',min:.05,step:.05}); },
    talk:(p,N)=>{ const tk=(recR(N).talk)||(CHARS.rec&&(CHARS.rec(CHARS.id(N))||{}).talk), later=fn=>()=>setTimeout(()=>{ fn(); CHARS.save(); draw(); },0);
      if(!tk){ p.addButton({title:'WRITE A SCRIPT'}).on('click',later(()=>talkOf(N,true))); return; }
      const ids=Object.keys(tk.lines||{});
      p.addBinding(TPANE.live({start:[()=>tk.start,v=>{ if(v!==tk.start){ talkSet(N,'start',v); setTimeout(draw,0); } }]}),'start',{label:'START',options:Object.fromEntries(ids.map(i=>[i,i]))});
      p.addButton({title:'TRY IT'}).on('click',()=>{ CHARED.toggle(); setTimeout(()=>{ if(window.TALK&&TALK.open)TALK.open(N); },300); });
      p.addButton({title:'ADD A LINE'}).on('click',later(()=>{ const tk=talkOf(N,true); let n=1; while(tk.lines['line'+n])n++; tk.lines['line'+n]={say:'',opts:[{t:'BACK.',go:tk.start}]}; }));
      p.addButton({title:'NO SCRIPT'}).on('click',later(()=>{ delete rec(N).talk; })); } };
  const fill=(N,g)=>Promise.all([...q('#chD').querySelectorAll('.tp[data-p]')].map(async el=>{ const t=TITLE[el.dataset.p], p=await TPANE.make(el,t?{title:t}:{}); if(g!==gen||!el.isConnected){ p.dispose(); return; } panes.push(p); FILL[el.dataset.p](p,N); }))
    .catch(e=>{ q('#chN').textContent='PANEL DID NOT LOAD: '+e.message; });
  const draw=()=>{ for(const p of panes)p.dispose(); panes=[]; const g=++gen; q('#chL').innerHTML=listHTML(); q('#chD').innerHTML=detailHTML(); skin(R); dirty(); return sel?fill(sel,g):Promise.resolve(); };

  const applyHome=(N,ht)=>{ if(N.st)N.home={id:CHARS.id(N),x:CHARS.wx(+ht[0]||0),z:CHARS.wz(+ht[1]||0),r:(+ht[2]||0)*TILE}; };
  const setField=(N,f,raw)=>{ const r=rec(N);
    if(f==='name'){ const v=String(raw).slice(0,60); r.name=v; CHARS.live(N,'name',v); }
    else if(f==='scale'){ const v=Math.max(.05,+raw||1); r.scale=v; CHARS.live(N,'scale',v); }
    else if(f==='tint'){ r.tint=/^#[0-9a-f]{6}$/i.test(raw)?raw:'#ffffff'; CHARS.live(N,'tint',r.tint); }
    else if(f==='hp'){ const v=Math.max(0,+raw||0); r.hp=v; CHARS.live(N,'hp',v); }
    else if(f==='stamina'){ const v=Math.max(0,+raw||0); r.stamina=v; CHARS.live(N,'stamina',v); }
    else if(f==='speed'){ const v=Math.max(0,+raw||0); r.speed=v; CHARS.live(N,'speed',v); }
    else if(f==='size'){ const v=Math.max(.05,+raw||.3); r.size=v; CHARS.live(N,'size',v); }
    else if(/^job/.test(f)){ const j=r.job=r.job||{}; if(f==='jobat')j.at=raw.trim().toLowerCase(); else if(f==='jobtitle')j.title=raw.trim().toUpperCase(); else if(f==='jobhome'){ const v=raw.trim().toLowerCase(); if(v)j.home=v; else delete j.home; }
      else if(f==='jobr'){ if(raw.trim()==='')delete j.r; else j.r=Math.max(0,+raw||0); } else { j.hours=j.hours||[9,17]; j.hours[f==='jobopen'?0:1]=Math.max(0,Math.min(24,+raw||0)); }
      if(!j.at)delete r.job; }
    else if(f==='homex'||f==='homey'||f==='range'){ const ht=homeTiles(N); if(f==='homex')ht[0]=+raw||0; else if(f==='homey')ht[1]=+raw||0; else ht[2]=Math.max(0,+raw||0); r.home=[+ht[0],+ht[1],+ht[2]]; applyHome(N,r.home); }
    CHARS.save(); dirty(); };

  const openView=N=>{ const side=document.createElement('div');
    side.innerHTML='<div style="color:#f2c14e;font-size:11px;margin-bottom:6px">'+esc(N.name||N.key)+'</div><div class="tp"></div>'
      +'<div style="color:#8a8f9c;margin-top:8px;line-height:1.6">ITS OWN BODY, LENT TO THE VOID. SCALE AND TINT SHOW HERE; EVERYTHING GOES INTO characters.json.</div>';
    side.addEventListener('mousedown',e=>{ if(e.target.closest('.tpg'))e.stopPropagation(); });
    let vp=null; TPANE.make(side.querySelector('.tp')).then(p=>{ vp=p; const L=TPANE.live({scale:bind(N,'scale',()=>VIEW.redo()),tint:bind(N,'tint',()=>VIEW.redo())});
      p.addBinding(L,'scale',{label:'SCALE',min:.05,step:.05}); p.addBinding(L,'tint',{label:'TINT',view:'color'}); p.addButton({title:'BACK TO THE LIST'}).on('click',()=>VIEW.close()); });
    VIEW.onclose=()=>{ if(vp)vp.dispose(); draw(); };
    VIEW.open({name:N.name||N.key,lend:()=>N.g?[N.g]:[],lendScale:()=>1,opacity:()=>1,look:()=>({})},side); };

  q('#chL').addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('button[data-i]'); if(!b)return; sel=ALL()[+b.dataset.i]||null; draw(); });
  q('#chD').addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('button'); if(!b||!sel)return;
    if(b.dataset.tab){ tab=b.dataset.tab; draw(); }
    else if(b.dataset.sell){ toggleSell(sel,b.dataset.sell); draw(); }
    else if(b.dataset.buy){ toggleBuy(sel,b.dataset.buy); draw(); }
    else if(b.dataset.tdl){ const tk=talkOf(sel,true); if(b.dataset.tdl===tk.start)return; delete tk.lines[b.dataset.tdl]; CHARS.save(); draw(); }
    else if(b.dataset.tao){ const tk=talkOf(sel,true); (tk.lines[b.dataset.tao].opts||(tk.lines[b.dataset.tao].opts=[])).push({t:'',go:''}); CHARS.save(); draw(); }
    else if(b.dataset.tdo){ const [id,i]=b.dataset.tdo.split('|'), tk=talkOf(sel,true); tk.lines[id].opts.splice(+i,1); CHARS.save(); draw(); } });
  q('#chD').addEventListener('change',e=>{ const k=e.target.dataset.tk; if(k&&sel){ talkSet(sel,k,e.target.value); if(/^(id|start|do|go)/.test(k))draw(); } });
  q('#chD').addEventListener('mousedown',e=>{ if(e.target.closest('.tpg'))e.stopPropagation(); });

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
  CHARED.busy=true; await FADE.run('LOADING CHARACTER EDITOR',async()=>{ TPANE.load().catch(()=>{}); await GAMEED.ensure(); CHARED.build(); CHARED.built=true; },{cut:true}); if(CHARED.built)CHARED.show(true,tab0); CHARED.busy=false; };
window.CHARED=CHARED; }
