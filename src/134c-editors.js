// THE EDITORS LAUNCHER: EDITORS is the shift+0 menu of every editor (the per-editor shift+digit keys are gone, owner 22 Oct 2026).
import {CHARED, EDITORS, FAR3, FEEL, GAMEED, ITEMED, LAND, LIGHTED, UI, WE} from './003b-systems.js';
{ const list=[
    {key:1,n:'WORLD',d:'double-click a thing to move, size, turn, colour it',go:()=>{ if(!WE.on)WE.toggle(); }},
    {key:2,n:'MAP',d:'the top-down layout',go:()=>{ if(!GAMEED.open)GAMEED.toggle(); }},
    {key:3,n:'CHARACTER',d:'a list of every character to edit',go:()=>CHARED.toggle('id')},
    {key:4,n:'ATMOSPHERE',d:'weather, sky, sun, fog',go:()=>UI.menuTab('atmo')},
    {key:5,n:'LIGHTING',d:'render system, quality, the cel bands',go:()=>LIGHTED.toggle()},
    {key:6,n:'SOUND',d:'each sound and its level',go:()=>UI.menuTab('sound')},
    {key:7,n:'ITEM',d:'item types and their properties',go:()=>ITEMED.toggle()},
    {key:8,n:'BEHAVIOUR',d:'homes, stats, jobs, talk',go:()=>CHARED.toggle('beh')},
    {key:9,n:'LANDSCAPE',d:'paint ground, free-draw, place plants & rocks',go:()=>LAND.toggle()},
    {key:10,n:'DISTANCE LOOK',d:'the far skyline, its mist and haze',go:()=>FAR3.panel&&FAR3.panel()},
    {key:11,n:'FEEL LAB',d:'the new controller, its tuning and its test yard',go:()=>FEEL.panel&&FEEL.panel(true)}];
  const css=document.createElement('style'); css.textContent=`
  #edmenu{position:fixed;inset:0;z-index:30;display:none;align-items:center;justify-content:center;background:#05070bcc;font:13px var(--pixel,monospace);color:var(--fg,#e9e6dd)}
  #edmenu.on{display:flex} #edmenu .box{background:var(--bg,#0c0e12);border:2px solid var(--line,#2a303a);min-width:300px;max-width:min(94vw,440px);padding:16px 18px}
  #edmenu h2{font:13px var(--pixel,monospace);color:var(--key,#ffbf5e);margin:0 0 12px}
  #edmenu .btn{display:flex;gap:10px;align-items:baseline;width:100%;text-align:left;background:#0e1016;border:2px solid #3a3f4e;color:var(--fg,#e9e6dd);font:inherit;padding:8px 10px;margin:5px 0;cursor:pointer}
  #edmenu .btn:hover,#edmenu .btn:focus-visible{border-color:var(--key,#ffbf5e);color:var(--key,#ffbf5e);outline:none}
  #edmenu .d{color:var(--dim,#828d9c);font-size:10px;margin-left:auto;padding-left:14px;text-align:right}
  #edmenu .hint{margin-top:6px;color:var(--dim,#828d9c);font-size:10px}`;
  document.head.appendChild(css);
  const menu=document.createElement('div'); menu.id='edmenu';
  menu.innerHTML='<div class="box"><h2>EDITORS</h2>'+list.map(it=>`<button class="btn" data-k="${it.key}"><span class="n">${it.n}</span><span class="d">${it.d}</span></button>`).join('')+'<div class="hint">PICK AN EDITOR · SHIFT+0 OR ESC CLOSES</div></div>';
  document.body.appendChild(menu);
  const show=()=>menu.classList.add('on'), hide=()=>menu.classList.remove('on');
  EDITORS.menu=()=>menu.classList.contains('on')?hide():show();
  EDITORS.open=it=>{ '@later'; if(!it)return; hide(); if(it.go)it.go(); };
  EDITORS.key=d=>{ if(d===0){ EDITORS.menu(); return; } EDITORS.open(list.find(x=>x.key===d)); };
  menu.addEventListener('click',e=>{ if(e.target===menu){ hide(); return; } const b=e.target.closest('button[data-k]'); if(b)EDITORS.open(list.find(x=>x.key===+b.dataset.k)); });
  addEventListener('keydown',e=>{ if(e.key==='Escape'&&menu.classList.contains('on')){ hide(); e.stopImmediatePropagation(); } },true);
}
