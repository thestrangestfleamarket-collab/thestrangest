// THE PASSPORT: PASSPORT is the menu's page of you — your name, login, when you joined, your section, cash and skills — and your choice of hand (L or R: the one that holds, swings, punches and picks up; kept with what you own).
import {SHARED} from './003-shx.js';
import {FORAGE, INV, LOOKS, PASSPORT, st} from './003b-systems.js';
import {OWNED} from './005-save.js';
{ const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'), day=t=>{ const d=new Date(t); return isNaN(d)?'—':d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}).toUpperCase(); };
  const saved=OWNED.get('hand'); st.hand=saved==='L'?'L':'R';
  if(!OWNED.get('joined'))OWNED.set('joined',new Date().toISOString());   // the single-file page, or a login the server could not name: the day this save began
  PASSPORT.setHand=h=>{ h=h==='L'?'L':'R'; if(st.hand===h)return; st.hand=h; OWNED.set('hand',h); if(el)draw(); };
  Object.defineProperty(PASSPORT,'hand',{get:()=>st.hand==='L'?'L':'R'});
  PASSPORT.facts=()=>{ const me=OWNED.me||{}, sk=(FORAGE.S&&FORAGE.S.sk)||{}, tot=Object.values(sk).reduce((a,b)=>a+(+b||0),0), top=(FORAGE.SK||[]).map(([k,n])=>[n,+sk[k]||0]).sort((a,b)=>b[1]-a[1])[0];
    return [['NAME',((LOOKS.L&&LOOKS.L.name)||'YOU').toUpperCase()],['LOGIN',me.email||'—'],['JOINED',day(me.joined||OWNED.get('joined'))],['SECTION',(SHARED.SECTION&&SHARED.SECTION.id)||'A'],['CASH','$'+Math.round(INV.cash||0)],
      ['SKILLS',(tot/10).toFixed(1)+(top&&top[1]>10?' · BEST '+top[0]:'')],['HAND',st.hand==='L'?'LEFT':'RIGHT']]; };
  let el=null; const draw=()=>{ if(!el)return; el.innerHTML=`<div class="pp"><div class="pp-hd">PASSPORT<span>THE STRANGEST FLEA MARKET</span></div><table class="pp-t">${PASSPORT.facts().map(([k,v])=>`<tr><td>${k}</td><td>${esc(v)}</td></tr>`).join('')}</table>
      <div class="pp-hand"><span>HANDED</span><button class="btn" data-h="R" aria-pressed="${st.hand!=='L'}">RIGHT</button><button class="btn" data-h="L" aria-pressed="${st.hand==='L'}">LEFT</button></div>
      <div class="dim">your hand holds, swings, punches and picks things up; the mouse takes the arm round you in full circles</div></div>`; };
  PASSPORT.open=host=>{ el=host; if(!el._pp){ el._pp=1; el.addEventListener('click',e=>{ const b=e.target.closest('[data-h]'); if(b)PASSPORT.setHand(b.dataset.h); }); } draw(); };
  window.PASSPORT=PASSPORT;
  const css=document.createElement('style'); css.textContent=`
  #dpass .pp{max-width:420px;border:2px solid var(--line);padding:14px 16px;background:#0b0d12}
  #dpass .pp-hd{display:flex;justify-content:space-between;align-items:baseline;gap:12px;color:var(--key);letter-spacing:.14em;border-bottom:2px solid var(--line);padding-bottom:8px;margin-bottom:8px}
  #dpass .pp-hd span{color:var(--dim);font-size:9px;letter-spacing:.08em}
  #dpass .pp-t td:first-child{color:var(--dim)} #dpass .pp-t td:last-child{text-align:right;color:var(--fg)}
  #dpass .pp-hand{display:flex;gap:8px;align-items:center;margin:12px 0 8px} #dpass .pp-hand span{color:var(--dim);margin-right:auto}
  #dpass .pp-hand .btn[aria-pressed="true"]{color:var(--mk);background:var(--mf)}`; document.head.appendChild(css); }
