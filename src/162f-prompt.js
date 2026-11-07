// THE PROMPT: PROMPT is the standing line under the quick bar that names the thing in front of you and what to press, or, when it cannot be used now, why not (its can(); 5 Nov 2026, from Nevaland's prompts with a reason); nothing near, no line.
import {UI} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
const PROMPT={};
{ const el=document.createElement('div'); el.id='hprompt'; el.hidden=true; document.body.appendChild(el);
  const css=document.createElement('style'); css.textContent='#hprompt{position:fixed;left:50%;bottom:calc((96px + var(--fy,0px) + env(safe-area-inset-bottom,0px)) / var(--uiz,1));transform:translateX(-50%);z-index:6;font:11px Silkscreen,monospace;color:#e8e2cc;background:#0b0d13c0;border:1px solid #3a3f4e;padding:3px 8px;pointer-events:none;white-space:nowrap;zoom:var(--uiz,1)} #hprompt[hidden]{display:none} #hprompt .why{color:#e0a888} #hprompt .k{color:#f2c14e}'; document.head.appendChild(css);
  let t=0, last=''; PROMPT.text=()=>last; PROMPT.n=0; PROMPT.err=null;
  PROMPT.tick=()=>{ t=.25; PROMPT.n++; let s=''; try{ let th=!UI.menuOpen&&window.__started&&UI.nearThing?UI.nearThing():null; if(th&&th.quiet)th=null;   // (a thing marked quiet, like yourself, is used but never named here)
    if(th){ const why=th.can&&th.can(), k=UI.keyOf&&UI.keyOf('use'), key=k&&k!=='use'?String(k).toUpperCase():'DOUBLE-CLICK'; s=why&&why!==true?`${th.name} · <span class="why">${String(why).toUpperCase()}</span>`:`<span class="k">${key}</span> · ${th.name}`; } }catch(e){ PROMPT.err=String(e&&e.message||e); }
    if(s!==last){ last=s; el.innerHTML=s; el.hidden=!s; } };
  SYS.add('vitals',dt=>{ if((t-=dt||.02)>0)return; PROMPT.tick(); },'162f-prompt');
  window.PROMPT=PROMPT; }
