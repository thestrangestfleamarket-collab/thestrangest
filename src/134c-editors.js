// THE EDITORS LAUNCHER: EDITORS holds the shift+0 menu and the shift+1-8 keys that open each editor.
import {EDITORS, GAMEED, ITEMED, LIGHTED, UI, WE} from './003b-systems.js';
{ const ge=async mode=>{ hide(); if(!GAMEED.open)await GAMEED.toggle(); const b=document.getElementById(mode==='map'?'meTM':'meTC'); if(b&&b.dataset.hot!=='1')b.click(); };
  const list=[
    {key:1,n:'WORLD',d:'double-click a thing to move, size, turn, colour it',go:()=>{ if(!WE.on)WE.toggle(); }},
    {key:2,n:'MAP',d:'the top-down layout',go:()=>ge('map')},
    {key:3,n:'CHARACTER',d:'bodies and NPCs',go:()=>ge('chars')},
    {key:4,n:'ATMOSPHERE',d:'weather, sky, sun, fog',go:()=>UI.menuTab('atmo')},
    {key:5,n:'LIGHTING',d:'render system and quality; cel is the floor',go:()=>LIGHTED.toggle()},
    {key:6,n:'SOUND',d:'each sound and its level',go:()=>UI.menuTab('sound')},
    {key:7,n:'ITEM',d:'item types and their properties',go:()=>ITEMED.toggle()},
    {key:8,n:'BEHAVIOUR',d:'homes, routines, jobs',soon:1}];
  const css=document.createElement('style'); css.textContent=`
  #edmenu{position:fixed;inset:0;z-index:30;display:none;align-items:center;justify-content:center;background:#05070bcc;font:13px var(--pixel,monospace);color:var(--fg,#e9e6dd)}
  #edmenu.on{display:flex} #edmenu .box{background:var(--bg,#0c0e12);border:2px solid var(--line,#2a303a);min-width:300px;max-width:min(94vw,440px);padding:16px 18px}
  #edmenu h2{font:13px var(--pixel,monospace);color:var(--key,#ffbf5e);margin:0 0 12px}
  #edmenu .btn{display:flex;gap:10px;align-items:baseline;width:100%;text-align:left;background:#0e1016;border:2px solid #3a3f4e;color:var(--fg,#e9e6dd);font:inherit;padding:8px 10px;margin:5px 0;cursor:pointer}
  #edmenu .btn:hover,#edmenu .btn:focus-visible{border-color:var(--key,#ffbf5e);color:var(--key,#ffbf5e);outline:none}
  #edmenu .k{color:var(--dim,#828d9c);min-width:30px} #edmenu .btn:hover .k{color:var(--key,#ffbf5e)}
  #edmenu .d{color:var(--dim,#828d9c);font-size:10px;margin-left:auto;padding-left:14px;text-align:right}
  #edmenu .soon .n:after{content:' · soon';color:var(--dim,#828d9c)}
  #edmenu .hint{margin-top:6px;color:var(--dim,#828d9c);font-size:10px}
  #edsoon{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:31;display:none;background:var(--bg,#0c0e12);border:2px solid var(--line,#2a303a);padding:16px 18px;font:12px var(--pixel,monospace);color:var(--fg,#e9e6dd);max-width:min(92vw,360px)}
  #edsoon.on{display:block} #edsoon h3{color:var(--key,#ffbf5e);margin:0 0 8px;font:13px var(--pixel,monospace)} #edsoon p{color:var(--dim,#828d9c);margin:0 0 12px;line-height:1.5}
  #edsoon .btn{font:inherit;color:var(--fg,#e9e6dd);background:#0e1016;border:2px solid #3a3f4e;padding:6px 10px;cursor:pointer}`;
  document.head.appendChild(css);
  const menu=document.createElement('div'); menu.id='edmenu';
  menu.innerHTML='<div class="box"><h2>EDITORS</h2>'+list.map(it=>`<button class="btn${it.soon?' soon':''}" data-k="${it.key}"><span class="k">⇧${it.key}</span><span class="n">${it.n}</span><span class="d">${it.d}</span></button>`).join('')+'<div class="hint">SHIFT+0 OR ESC CLOSES</div></div>';
  document.body.appendChild(menu);
  const soon=document.createElement('div'); soon.id='edsoon'; document.body.appendChild(soon);
  const show=()=>menu.classList.add('on'), hide=()=>menu.classList.remove('on');
  EDITORS.menu=()=>menu.classList.contains('on')?hide():show();
  EDITORS.open=it=>{ if(!it)return; hide(); soon.classList.remove('on');
    if(it.soon){ soon.innerHTML=`<h3>${it.n} EDITOR</h3><p>Not built yet — ${it.d}.</p><button class="btn" id="edsx">OK</button>`; soon.classList.add('on'); soon.querySelector('#edsx').onclick=()=>soon.classList.remove('on'); return; }
    if(it.go)it.go(); };
  EDITORS.key=d=>{ soon.classList.remove('on'); if(d===0){ EDITORS.menu(); return; } EDITORS.open(list.find(x=>x.key===d)); };
  menu.addEventListener('click',e=>{ if(e.target===menu){ hide(); return; } const b=e.target.closest('button[data-k]'); if(b)EDITORS.open(list.find(x=>x.key===+b.dataset.k)); });
  addEventListener('keydown',e=>{ if(e.key!=='Escape')return; if(menu.classList.contains('on')){ hide(); e.stopImmediatePropagation(); } else if(soon.classList.contains('on')){ soon.classList.remove('on'); e.stopImmediatePropagation(); } },true);
}
