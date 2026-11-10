// THE TENANTS: the owner's panel (from ADMIN) (players, invite codes, messages, paintings; worker/door.js /admin) and the letters the market sends you (/post).
import {BUGS, ONLINE, SIGNS, TENANTS, TEXT} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
{ const esc=TEXT.esc;
  const day=t=>t?new Date(typeof t==='number'?t:Date.parse(t)).toLocaleString():'—';
  const api=async(path,body)=>{ '@later'; try{ if(BUGS.tok)await BUGS.tok(); }catch(e){}
    let r; try{ r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body||{})}); }catch(e){ return {why:'the server did not answer'}; } let j={}; try{ j=await r.json(); }catch(e){} if(!r.ok&&!j.why)j.why='the server said '+r.status; return j; };
  const room=()=>ONLINE.room;
  let el=null, D=null, open=null, say='';
  // each part folds; which are folded is kept in this browser
  const SECS=['asks','codes','players'], SEC=(()=>{ try{ return JSON.parse(localStorage.getItem('tenants-folds')||'{}')||{}; }catch(e){ return {}; } })();
  const keep=()=>{ try{ localStorage.setItem('tenants-folds',JSON.stringify(SEC)); }catch(e){} };
  const sec=(k,t,body)=>`<details data-sec="${k}"${SEC[k]?'':' open'}><summary style="cursor:pointer;list-style:none"><h3 style="display:inline">${SEC[k]?'▸':'▾'} ${t}</h3></summary>${body}</details>`;

  /* ---------- the panel ---------- */
  const draw=()=>{ '@later'; if(!el)return; if(!D){ el.innerHTML='<div class="dim">...</div>'; return; } if(D.why){ el.innerHTML='<div class="dim">'+esc(D.why)+'</div>'; return; }
    const U=D.users.slice().sort((a,b)=>((a.player&&a.player.apt)||1e9)-((b.player&&b.player.apt)||1e9)), on=U.filter(u=>u.online).length;
    const live=D.codes.filter(c=>c.uses<c.max_uses), done=D.codes.length-live.length;
    el.innerHTML=`<h3>TENANTS</h3><div class="row"><span class="dim">${U.length} players · ${on} online now${say?' · '+esc(say):''}</span><button class="btn" id="tfold">${Object.keys(SEC).length&&SECS.every(k=>SEC[k])?'OPEN ALL':'COLLAPSE ALL'}</button></div>
      ${sec('asks','ASKED FOR AN INVITE',(D.asks||[]).map(a=>`<div class="row" data-ask="${esc(a.email)}"><span>${esc(a.email)}</span><span class="dim">${esc(day(a.at))}${a.sent?' · code sent '+esc(day(a.sent)):''}</span><button class="btn" data-a="send">${a.sent?'SEND AGAIN':'SEND CODE'}</button><button class="btn" data-a="drop">DROP</button></div>`).join('')||'<div class="dim">nobody waiting</div>')}
      ${sec('codes','INVITE CODES',`<div class="row"><span>USES</span><input id="tuses" type="number" min="1" max="1000" value="1" style="width:60px;font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px"><button class="btn" id="tcode">NEW CODE</button></div>
      ${live.slice().reverse().map(c=>`<div class="row"><code>${esc(c.code)}</code><span class="dim">${esc(c.uses)}/${esc(c.max_uses)}</span><button class="btn" data-off="${esc(c.code)}">TURN OFF</button></div>`).join('')||'<div class="dim">no codes open</div>'}${done?`<div class="dim">${done} used up</div>`:''}`)}
      ${sec('players','PLAYERS',U.map(u=>{ const p=u.player||{}; return `<div data-u="${esc(u.id)}" style="border:2px solid var(--line);padding:6px 8px;margin:6px 0">
        <div class="row"><b>${esc(p.apt||'—')}</b>${u.name?`<b>${esc(u.name)}</b>`:''}<span>${esc(u.email)}</span>${u.online?'<span style="color:#7fdc8a">ONLINE</span>':''}${u.admin?'<span style="color:#ffd27a">OWNER</span>':''}${u.banned?'<span style="color:#e06a5a">BANNED</span>':''}<span class="dim">joined ${esc(day(u.joined))} · last in ${esc(day(u.last))}</span><button class="btn" data-a="more">${open===u.id?'LESS':'MORE'}</button></div>
        ${open===u.id?`<div class="dim" style="white-space:pre-wrap;margin:4px 0">${esc(Object.entries({id:u.id,phone:u.phone,confirmed:u.confirmed,provider:u.provider,...p}).filter(([,v])=>v!==''&&v!=null).map(([k,v])=>k+': '+(typeof v==='object'?JSON.stringify(v):v)).join('\n'))}</div>
          <div class="row"><span>EMAIL</span><input data-f="email" type="text" value="${esc(u.email)}" style="width:220px;font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px"><span>APT</span><input data-f="apt" type="number" value="${esc(p.apt??'')}" style="width:70px;font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px"><span>NEW PASSWORD</span><input data-f="password" type="text" placeholder="8 or more" style="width:120px;font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px"><button class="btn" data-a="save">SAVE</button></div>
          <div class="row"><button class="btn" data-a="admin">${u.admin?'NOT AN OWNER':'MAKE AN OWNER'}</button><button class="btn" data-a="ban">${u.banned?'UNBAN':'BAN'}</button><button class="btn" data-a="kit">GIVE FULL KIT</button><button class="btn" data-a="delete">DELETE</button></div>`:''}</div>`; }).join(''))}`;
    el.querySelectorAll('details[data-sec]').forEach(d=>d.ontoggle=()=>{ SEC[d.dataset.sec]=!d.open; keep(); const h=d.querySelector('summary h3'); if(h)h.textContent=(d.open?'▾':'▸')+h.textContent.slice(1); });
    el.querySelector('#tfold').onclick=()=>{ const all=SECS.every(k=>SEC[k]); for(const k of SECS)SEC[k]=!all; keep(); draw(); };
    art(el.querySelector('#tart'),U);
    const $=s=>el.querySelector(s); for(const f of el.querySelectorAll('input,textarea,select'))for(const ev of ['keydown','keyup'])f.addEventListener(ev,e=>e.stopPropagation());
    const act=async(b,body,ok)=>{ if(b)b.disabled=true; const r=await api('/admin',{room:room(),...body}); say=r.why?'not done: '+r.why:ok(r); await load(); };
    $('#tcode').onclick=e=>act(e.target,{do:'code',uses:+$('#tuses').value||1},r=>{ try{ navigator.clipboard.writeText(r.code); }catch(x){} return 'new code '+r.code+' (copied)'; });
    el.querySelectorAll('[data-ask] [data-a]').forEach(b=>b.onclick=()=>{ const m=b.closest('[data-ask]').dataset.ask; act(b,{do:b.dataset.a==='send'?'askcode':'askoff',email:m},r=>b.dataset.a==='send'?'code '+r.code+' emailed to '+m:'dropped '+m); });
    el.querySelectorAll('[data-off]').forEach(b=>b.onclick=()=>act(b,{do:'codeoff',code:b.dataset.off},()=>'code turned off'));
    el.querySelectorAll('[data-u]').forEach(box=>box.onclick=e=>{ const b=e.target.closest('[data-a]'); if(!b)return; const id=box.dataset.u, u=D.users.find(x=>x.id===id), a=b.dataset.a;
      if(a==='more'){ open=open===id?null:id; draw(); return; }
      if(a==='save'){ const v=f=>box.querySelector(`[data-f="${f}"]`).value.trim(), body={do:'user',id}; if(v('email')&&v('email')!==u.email)body.email=v('email'); if(v('password'))body.password=v('password'); if(v('apt')!==String((u.player&&u.player.apt)??''))body.apt=v('apt'); act(b,body,()=>'saved'); return; }
      if(a==='admin'){ act(b,{do:'admin',id,on:!u.admin},()=>u.admin?'no longer an owner':'now an owner'); return; }
      if(a==='ban'){ if(!u.banned&&!confirm('Ban '+u.email+'? They are sent out and cannot log in.'))return; act(b,{do:'ban',id,on:!u.banned},()=>u.banned?'unbanned':'banned'); return; }
      if(a==='kit'){ act(b,{do:'kit',id},()=>'full kit sent to '+(u.name||u.email)+': it lands in their bag the next time they come in'); return; }
      if(a==='delete'){ if(!confirm('Delete '+u.email+' for good? This cannot be undone.'))return; act(b,{do:'delete',id},()=>'deleted'); } }); };
  /* ---------- the players' finished paintings: view one, take one down (its frame goes blank for everyone) ---------- */
  let A=null, seen={};
  const art=(box,U)=>{ '@later'; if(!box)return; const who=id=>{ const u=U.find(x=>x.id===id); return u?((u.player&&u.player.apt?u.player.apt+' · ':'')+u.email):id; };
    if(!A){ box.innerHTML='<div class="row"><button class="btn" id="tartl">SHOW PAINTINGS</button></div>'; box.querySelector('#tartl').onclick=async e=>{ e.target.disabled=true; A=await api('/admin',{do:'art'}); art(box,U); }; return; }
    if(A.why){ box.innerHTML='<div class="dim">'+esc(A.why)+'</div>'; A=null; return; }
    box.innerHTML=(A.art||[]).map(a=>`<div class="row" data-art="${esc(a.id)}"><span>${esc(who(a.who))}</span><span class="dim">${esc(day(a.at))} · ${Math.round(a.n/1024)} KB</span><button class="btn" data-v>${seen[a.id]?'HIDE':'VIEW'}</button><button class="btn" data-x>TAKE DOWN</button>${seen[a.id]?`<div style="flex-basis:100%"><img src="${esc(seen[a.id])}" style="max-width:320px;max-height:320px;image-rendering:pixelated;border:2px solid var(--line)"></div>`:''}</div>`).join('')||'<div class="dim">no paintings yet</div>';
    box.querySelectorAll('[data-art]').forEach(r=>{ const k=r.dataset.art;
      r.querySelector('[data-v]').onclick=async e=>{ if(seen[k]){ delete seen[k]; art(box,U); return; } e.target.disabled=true; const j=await api('/admin',{do:'artget',art:k}); if(j.d)seen[k]=j.d; else say='not shown: '+(j.why||'?'); art(box,U); };
      r.querySelector('[data-x]').onclick=async e=>{ if(!confirm('Take this painting down for good? Its frame goes blank for everyone.'))return; e.target.disabled=true; const j=await api('/admin',{do:'artoff',art:k});
        say=j.why?'not done: '+j.why:'painting taken down'; delete seen[k]; A=await api('/admin',{do:'art'}); draw(); }; }); };
  const load=async()=>{ D=await api('/admin',{do:'list',room:room()}); draw(); };
  // TEXT: the game's text boxes and the signs' words, its own admin tab (owner, 7 Nov 2026)
  TENANTS.text=e=>{ '@later'; if(!e)return; const note=m=>{ const n=e.querySelector('#txsay'); if(n)n.textContent=m; };
    e.innerHTML=`<h3>TEXT</h3><div class="dim" id="txsay"></div><div class="dim">The game's text boxes. Change the words and everyone sees them, on the signs at once. A {part} fills itself in. Empty puts the game's own words back.</div>
      ${TEXT.list().map(t=>`<div class="row" data-txt="${esc(t.id)}"><code style="min-width:130px">${esc(t.id)}</code><input type="text" maxlength="200" value="${esc(t.cur??t.def)}" style="flex:1;min-width:220px;font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px">${t.cur!=null?`<span class="dim">was: ${esc(t.def)}</span>`:''}</div>`).join('')}
      ${SIGNS.list.map(sg=>`<div class="row" data-sign="${esc(sg.name)}"><code style="min-width:130px">${esc(sg.name)}</code><input type="text" maxlength="200" value="${esc((sg.get&&sg.get().text)||'')}" placeholder="the sign's own words" style="flex:1;min-width:220px;font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px"></div>`).join('')}`;
    for(const f of e.querySelectorAll('input'))for(const ev of ['keydown','keyup'])f.addEventListener(ev,x=>x.stopPropagation());
    const put=(key,text,ok)=>api('/admin',{room:room(),do:'text',key,text}).then(r=>note(r.why?'not saved: '+r.why:ok));
    e.querySelectorAll('[data-txt] input').forEach(i=>i.onchange=()=>{ const id=i.closest('[data-txt]').dataset.txt; TEXT.set(id,i.value.trim()); put(id,TEXT.cur[id]||'','text saved'); });
    e.querySelectorAll('[data-sign] input').forEach(i=>i.onchange=()=>{ const n=i.closest('[data-sign]').dataset.sign, sg=SIGNS.list.find(q=>q.name===n), v=i.value.trim(); if(sg&&sg.set)sg.set({...(sg.get?sg.get():{}),text:v||null}); TEXT.set('sign.'+n,v); put('sign.'+n,v,'sign saved'); }); };
  TENANTS.open=e=>{ el=e; D=null; draw(); load(); };

  /* ---------- letters waiting for you, shown when you come in ---------- */
  const letters=async()=>{ '@later'; const r=await api('/post',{}); const L=r.letters||[]; if(!L.length)return;
    const P=document.createElement('div'); P.id='tletter'; P.setAttribute('role','dialog'); P.setAttribute('aria-label','A letter');
    P.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(520px,calc(100vw - 32px));max-height:80vh;overflow:auto;z-index:42;background:#f4efe0;color:#2a2620;border:3px solid #2a2620;padding:18px 20px;font:13px/1.6 Silkscreen,monospace;letter-spacing:.5px;box-shadow:6px 6px 0 #0008';
    P.innerHTML=L.map(l=>`<div style="margin-bottom:16px"><div style="font-size:11px;color:#6a6255">${esc(day(l.at))} · FROM THE MARKET</div><div style="font-size:15px;margin:4px 0 8px">${esc(l.subject)}</div><div style="white-space:pre-wrap">${esc(l.body)}</div></div>`).join('<hr style="border:0;border-top:2px dashed #2a262055">')+'<button id="tletok" style="font:inherit;padding:6px 12px;cursor:pointer;background:#2a2620;color:#f4efe0;border:2px solid #2a2620">PUT IT AWAY</button>';
    document.body.appendChild(P); P.querySelector('#tletok').onclick=()=>{ P.remove(); api('/post',{seen:L.map(l=>l.id)}); }; return L.length; };
  TENANTS.letters=letters;   // the letters waiting for you (also your hall's mailbox)

  const go=async()=>{ await LOAD('later');
    if(!/(?:^|;\s*)tsfm-pass=/.test(document.cookie))return;
    letters().catch(()=>{}); };
  SYS.onStart(go,'136c-tenants'); }
