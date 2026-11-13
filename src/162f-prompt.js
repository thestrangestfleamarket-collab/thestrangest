// THE PROMPT: PROMPT is the standing line under the quick bar that names the thing in front of you and what to press (its own key, or the use key), or, when it cannot be used now, why not (its can(); 5 Nov 2026, from Nevaland's prompts with a reason); nothing near, no line.
import {PROMPT, UI} from './003b-systems.js';
import {SYS} from './006-map-pre.js';

{ const el=document.createElement('div'); el.id='hprompt'; el.hidden=true; document.body.appendChild(el);
  const css=document.createElement('style'); css.textContent='#hprompt{position:fixed;left:50%;bottom:calc((96px + var(--fy,0px) + env(safe-area-inset-bottom,0px)) / var(--uiz,1));transform:translateX(-50%);z-index:6;font:11px Silkscreen,monospace;letter-spacing:1px;color:#7dffa8;background:#020a06f2;border:2px solid #1f6b43;padding:4px 10px;pointer-events:none;white-space:nowrap;zoom:var(--uiz,1);transition:opacity .6s} #hprompt.gone{opacity:0} #hprompt[hidden]{display:none} #hprompt .why{color:#e0a888} #hprompt .k{color:#f2c14e} #hprompt .row{padding:1px 4px;color:#4fa877} #hprompt .row.on{color:#d8ffe6;background:#0e2a1a} #hprompt .ft{color:#4fa877;margin-top:3px;border-top:1px solid #1f6b43;padding-top:3px}'; document.head.appendChild(css);
  let t=0, last='', at=0; PROMPT.text=()=>last; PROMPT.n=0; PROMPT.err=null;
  PROMPT.tick=()=>{ t=.25; PROMPT.n++; let s=''; try{ const L=!UI.menuOpen&&SYS.started&&UI.choices?UI.choices():[], c=L[UI.pickI||0], th=c&&!c.held?c.th:null, k=UI.keyOf&&UI.keyOf('use'), uk=k&&k!=='use'?String(k).toUpperCase():'DOUBLE-CLICK', more='';   // never a line for yourself (owner, 7 Nov 2026); several choices: the list, the one chosen marked, SHIFT + WHEEL to step (owner, 13 Nov 2026: the wheel alone zooms)
    if(c&&c.held)s=`<span class="k">${uk}</span> · ${c.name}${more}`;
    else if(th){ const why=!c.sub&&th.can&&th.can(), key=c.sub?uk:th.key||uk; s=why&&why!==true?`${c.name} · <span class="why">${String(why).toUpperCase()}</span>${more}`:`<span class="k">${key}</span> · ${c.name}${more}`; }
    if(s&&L.length>1)s=L.map((q,i)=>`<div class="row${i===(UI.pickI||0)?' on':''}">${i===(UI.pickI||0)?'▸ '+s:'&nbsp; '+q.name}</div>`).join('')+'<div class="ft">SHIFT + WHEEL TO CHOOSE</div>'; }catch(e){ PROMPT.err=String(e&&e.message||e); }
    if(s){ const q=document.getElementById('hqb'), r=q&&!q.hidden&&q.getBoundingClientRect(); if(r&&r.height){ const z=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--uiz'))||1, bt=Math.round((innerHeight-r.top+8)/z)+'px'; if(el.style.bottom!==bt)el.style.bottom=bt; } else if(el.style.bottom)el.style.bottom=''; }   // always just above the bar, however tall it is
    if(s!==last){ last=s; el.innerHTML=s; el.hidden=!s; at=performance.now(); el.classList.remove('gone'); } else if(s&&performance.now()-at>3000)el.classList.add('gone'); };   // a hint fades after 3 s (owner, 8 Nov 2026)
  SYS.add('vitals',dt=>{ if((t-=dt||.02)>0)return; PROMPT.tick(); },'162f-prompt');
  window.PROMPT=PROMPT; }
