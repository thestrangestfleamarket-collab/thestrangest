// THE HANDHELD: ESC pops up a bulky 1980s pager-organiser (a red message light, a green LCD, a little keyboard); every menu opens from its grid of icons, and owners see ADMIN.
import {CHARP, CINEMA, CLOCK, DRONE, FORAGE, HANDHELD, INV, keys, ONLINE, UI} from './003b-systems.js';
import {PHONE} from './146y-operator.js';
{ const ID='tablet';
  const css=document.createElement('style'); css.textContent=`#hh{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:29;width:min(480px,94vw);zoom:var(--uiz,1);background:linear-gradient(#2b2d33,#1b1c20);border-radius:20px;padding:14px 18px 18px;box-shadow:inset 0 2px 0 #4a4d55,inset 0 -6px 0 #101114,0 14px 40px #000c;font:11px Silkscreen,monospace;letter-spacing:1px;color:#9aa0a8;user-select:none}
    #hh .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px} #hh .led{width:11px;height:11px;border-radius:50%;background:#ff4a3a;box-shadow:0 0 9px #ff4a3a}
    #hh .lcd{background:#1c2a24;border:7px solid #0c0d10;border-radius:5px;padding:9px;min-height:214px;font:18px/1.15 'Share Tech Mono',monospace;color:#7dffb0;text-shadow:0 0 6px #4aff9088;background-image:repeating-linear-gradient(#0000 0 2px,#0003 2px 3px)}
    #hh .bar{display:flex;justify-content:space-between;margin-bottom:7px} #hh .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
    #hh button{font:inherit;color:inherit;text-shadow:inherit;background:transparent;border:1px solid #2d5a40;padding:4px 0;cursor:pointer;letter-spacing:1px}
    #hh .grid button b{display:block;font-size:24px;font-weight:normal;line-height:1.1} #hh button:hover,#hh button:focus-visible,#hh button.on{background:#7dffb0;color:#1c2a24;text-shadow:none;outline:0}
    #hh button:disabled{opacity:.35;cursor:default;background:transparent;color:inherit} #hh .adm{border:1px dashed #ff8a6a}
    #hh .ln{display:flex;justify-content:space-between;gap:8px;padding:2px 0} #hh .ln button{padding:0 6px} #hh .hint{margin-top:7px;color:#4ab884}
    #hh .kb{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-top:12px;pointer-events:none} #hh .kb i{font-style:normal;text-align:center;font-size:9px;background:#3a3d45;color:#d8dae2;border-radius:3px;padding:5px 0;box-shadow:inset 0 -2px 0 #15161a} #hh .kb i.w{grid-column:span 2;background:#c8a040;color:#1b1c20}`;
  document.head.appendChild(css);
  const W=document.createElement('div'); W.id='hh'; W.hidden=true; W.setAttribute('role','dialog'); W.setAttribute('aria-label','Menu'); document.body.appendChild(W);
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  let page='home', admin=false, back=false, sel=0;
  const tab=t=>()=>{ back=true; UI.menuTab(t); };
  const APPS=[['you','YOU','☺',()=>true,tab('home')],['pack','PACK','▤',()=>!!FORAGE.PACK,()=>FORAGE.PACK.toggle('pack')],['map','MAP','✦',()=>!!UI.mapWindow,()=>{ back=true; UI.mapWindow(); }],['call','CALL','☏',()=>!!PHONE.dial,()=>PHONE.dial('handheld')],
    ['bbs','BBS','▣',()=>!!DRONE.openAt,()=>DRONE.openAt('menu')],['chat','CHAT','✎',()=>!!(ONLINE.on&&ONLINE.open),()=>setTimeout(()=>ONLINE.open(),0)],['people','PEOPLE','♟',()=>!!ONLINE.others,null],['set','SET','⚙',()=>true,tab('display')],
    ['guide','GUIDE','◉',()=>true,tab('guide')],['help','HELP','?',()=>!!UI.moves,()=>UI.moves()],['bug','BUG','✱',()=>true,tab('bug')],['admin','ADMIN','★',()=>admin,null]];
  const KB='<div class="kb">'+'QWERTYUIOPASDFGHJK'.split('').map(c=>'<i>'+c+'</i>').join('')+'<i class="w">ENTER</i></div>';
  const time=()=>{ const h=CLOCK.h??12, hh=Math.floor(h), mm=Math.floor((h-hh)*60); return ((hh+11)%12+1)+':'+String(mm).padStart(2,'0')+(hh<12?' AM':' PM'); };
  const draw=()=>{ let body;
    if(page==='people'){ const all=ONLINE.others?[...ONLINE.others.values()]:[];
      body='<div class="bar"><span>♟ PEOPLE · '+(all.length+1)+'</span></div>'+(all.length?all.map(o=>'<div class="ln"><span>'+esc(o.name||'TENANT')+'</span>'+(ONLINE.visit?'<button data-visit="'+esc(o.id)+'">VISIT</button>':'')+'</div>').join(''):'<div class="ln">NOBODY ELSE IS ON.</div>')+'<div class="hint">ESC BACK</div>'; }
    else if(page==='admin')body='<div class="bar"><span>★ ADMIN</span></div><div class="ln"><button data-go="panel" style="flex:1;text-align:left">▸ BUG QUEUE · STATS · LOG</button></div><div class="ln"><button data-go="tenants" style="flex:1;text-align:left">▸ TENANTS · CODES · LETTERS</button></div><div class="hint">ESC BACK</div>';
    else body='<div class="bar"><span data-t>'+time()+'</span><span data-c>$'+(INV.cash|0)+'</span></div><div class="grid">'+APPS.filter(a=>a[0]!=='admin'||admin).map(([k,n,ic,ok],i)=>'<button data-app="'+k+'"'+(k==='admin'?' class="adm"':'')+(ok()?'':' disabled')+'><b>'+ic+'</b>'+n+'</button>').join('')+'</div>';
    W.innerHTML='<div class="top"><span>PAGEMASTER 64</span><span class="led"></span></div><div class="lcd">'+body+'</div>'+KB;
    if(page==='home'){ const L=W.querySelectorAll('.grid button'); sel=Math.min(sel,L.length-1); if(L[sel])L[sel].classList.add('on'); } };
  const go=k=>{ const a=APPS.find(q=>q[0]===k); if(!a||!a[3]())return; if(!a[4]){ page=k; return draw(); } close(); a[4](); };
  W.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||b.disabled)return;
    if(b.dataset.visit){ const o=ONLINE.others.get(b.dataset.visit); if(o&&ONLINE.visit){ close(); ONLINE.visit(o.id,o.name); } return; }
    if(b.dataset.go){ close(); if(b.dataset.go==='panel'){ if(CHARP.admin)CHARP.admin(); } else tab('tenants')(); return; }
    if(b.dataset.app)go(b.dataset.app); });
  addEventListener('keydown',e=>{ if(W.hidden)return; const k=e.key; if(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
    const nav={ArrowLeft:-1,ArrowRight:1,ArrowUp:-4,ArrowDown:4}[k];
    if(k==='Escape'){ if(page!=='home'){ page='home'; draw(); } else close(); }
    else if(nav&&page==='home'){ const n=W.querySelectorAll('.grid button').length; sel=(sel+nav+n)%n; draw(); }
    else if(k==='Enter'&&page==='home'){ const b=W.querySelectorAll('.grid button')[sel]; if(b&&!b.disabled)go(b.dataset.app); }
    else return;
    e.preventDefault(); e.stopImmediatePropagation(); },true);
  let tick=0; const open=()=>{ page='home'; back=false; draw(); W.hidden=false; keys.clear(); clearInterval(tick); tick=setInterval(()=>{ if(W.hidden)return clearInterval(tick); const t=W.querySelector('[data-t]'); if(t){ t.textContent=time(); W.querySelector('[data-c]').textContent='$'+(INV.cash|0); } },5000);
    if(!admin&&CINEMA.isAdmin)CINEMA.isAdmin().then(a=>{ if(a&&!admin){ admin=true; if(!W.hidden&&page==='home')draw(); } }).catch(()=>{}); };
  const close=()=>{ W.hidden=true; clearInterval(tick); };
  admin=!!CINEMA.admin;
  HANDHELD.toggle=()=>{ if(W.hidden)open(); else close(); };
  HANDHELD.back=()=>{ if(back)open(); };   // ESC out of a menu page the handheld opened comes back to it
  HANDHELD.up=()=>!W.hidden;
  // the old tablet item leaves the pack
  (async()=>{ while(!window.__started)await new Promise(r=>setTimeout(r,250)); if(FORAGE.has(ID))FORAGE.take(ID,FORAGE.has(ID)); })();
  window.HHDBG=()=>({up:!W.hidden,page,admin,sel,apps:APPS.map(a=>[a[0],!!a[3]()])}); }
