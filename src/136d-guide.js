// THE GUIDE: GUIDE is the guide book (the menu's GUIDE tab, Shift+G): a chapter for each thing you can do, simple steps and a picture from the game; its words and pictures are fetched the first time it opens.
import {GUIDE} from './003b-systems.js';
Object.assign(GUIDE,{ch:0});
{ const esc=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
  // a step's [KEY] shows as a key cap
  const keys=s=>esc(s).replace(/\[([^\]]+)\]/g,'<b class="gk">$1</b>');
  const GDATA=__LAZY__("data/guide.json"), GPICS=__LAZY__("data/guide-pics.json");
  const draw=el=>{ '@guide'; const G=GUIDE.G, P=GUIDE.P, C=G.chapters, i=Math.max(0,Math.min(C.length-1,GUIDE.ch)), c=C[i];
    if(!document.getElementById('guidecss')){ const st=document.createElement('style'); st.id='guidecss'; st.textContent=`#dguide .gw{display:flex;gap:12px;align-items:flex-start}#dguide .gl{display:flex;flex-direction:column;gap:2px;flex:0 0 clamp(120px,30%,220px);max-height:62vh;overflow:auto;font-size:.78em}#dguide .gl button{padding:3px 6px;white-space:normal;line-height:1.3}
#dguide .gl button{text-align:left}#dguide .gl button[aria-pressed=true]{border-color:var(--key);color:var(--key)}#dguide .gc{flex:1;min-width:0;max-height:62vh;overflow:auto}#dguide .gc img{display:block;width:100%;max-width:520px;border:2px solid var(--line);image-rendering:pixelated;margin:6px 0 8px}
#dguide ol{margin:6px 0;padding-left:20px;line-height:1.7}#dguide .gk{display:inline-block;padding:0 5px;border:1px solid #6a6f7c;border-bottom-width:2px;color:#f2c14e;font-weight:normal;line-height:1.3}#dguide .gt{color:var(--dim);margin-top:6px;line-height:1.6}
@media (max-width:640px){#dguide .gw{flex-direction:column}#dguide .gl{flex-direction:row;flex-wrap:wrap;max-height:none;min-width:0}}`; document.head.appendChild(st); }
    el.innerHTML='<div class="dim" style="margin-bottom:8px">'+keys(G.intro)+'</div><div class="gw"><div class="gl">'+C.map((q,k)=>'<button class="btn" data-gc="'+k+'" aria-pressed="'+(k===i)+'">'+esc(q.title)+'</button>').join('')+'</div>'
      +'<div class="gc"><h3 style="margin:0">'+esc(c.title)+'</h3>'+(P[c.id]?'<img alt="'+esc(c.title)+'" src="'+P[c.id]+'">':'')+'<div>'+keys(c.what||'')+'</div>'
      +(c.sections||[{steps:c.steps}]).map(s=>(s.head?'<div style="margin-top:8px;color:var(--key)">'+esc(s.head)+'</div>':'')+'<ol>'+s.steps.map(t=>'<li>'+keys(t)+'</li>').join('')+'</ol>').join('')
      +(c.tips&&c.tips.length?'<div class="gt">'+c.tips.map(keys).join('<br>')+'</div>':'')+'</div></div>';
    el.querySelectorAll('[data-gc]').forEach(b=>b.onclick=()=>{ GUIDE.ch=+b.dataset.gc; draw(el); }); GUIDE.n=C.length; GUIDE.title=c.title; };
  Object.assign(GUIDE,{open:async el=>{ GUIDE.el=el; el.innerHTML='<div class="dim">OPENING THE GUIDE...</div>'; if(window.LOAD)await LOAD('guide'); if(!GUIDE.G){ const [g,p]=await Promise.all([GDATA(),GPICS()]); GUIDE.G=g; GUIDE.P=p; } draw(el); }}); }
