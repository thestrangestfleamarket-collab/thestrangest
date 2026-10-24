// THE TENANTS: the owner's panel in the menu (players, invite codes, messages; worker/door.js /admin) and the letters the market sends you (/post).
import {SHARED} from './003-shx.js';
import {BUGS, TENANTS} from './003b-systems.js';
{ const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const day=t=>t?new Date(typeof t==='number'?t:Date.parse(t)).toLocaleString():'—';
  const api=async(path,body)=>{ try{ if(BUGS.tok)await BUGS.tok(); }catch(e){}
    const r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body||{})}); let j={}; try{ j=await r.json(); }catch(e){} if(!r.ok&&!j.why)j.why='the server said '+r.status; return j; };
  const room=()=>'s-'+String((SHARED.SECTION&&SHARED.SECTION.id)||'a').toLowerCase().replace(/[^a-z0-9-]/g,'');
  let el=null, D=null, open=null, say='';

  /* ---------- the panel ---------- */
  const draw=()=>{ '@later'; if(!el)return; if(!D){ el.innerHTML='<div class="dim">...</div>'; return; } if(D.why){ el.innerHTML='<div class="dim">'+esc(D.why)+'</div>'; return; }
    const U=D.users.slice().sort((a,b)=>((a.player&&a.player.apt)||1e9)-((b.player&&b.player.apt)||1e9)), on=U.filter(u=>u.online).length;
    const opts='<option value="*">EVERYONE</option>'+U.map(u=>`<option value="${esc(u.id)}">${esc((u.player&&u.player.apt?u.player.apt+' · ':'')+u.email)}</option>`).join('');
    el.innerHTML=`<h3>TENANTS</h3><div class="dim">${U.length} players · ${on} online now${say?' · '+esc(say):''}</div>
      <h3>INVITE CODES</h3><div class="row"><span>USES</span><input id="tuses" type="number" min="1" max="1000" value="1" style="width:60px;font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px"><button class="btn" id="tcode">NEW CODE</button><span id="tnew"></span></div>
      <div>${D.codes.slice().reverse().map(c=>`<div class="row"><code>${esc(c.code)}</code><span class="dim">${esc(c.uses)} of ${esc(c.max_uses)} used</span><span class="dim">${esc(Object.entries(c).filter(([k,v])=>!['code','uses','max_uses'].includes(k)&&v!=null&&v!=='').map(([k,v])=>k+': '+(typeof v==='object'?JSON.stringify(v):v)).join(' · '))}</span>${c.uses<c.max_uses?`<button class="btn" data-off="${esc(c.code)}">TURN OFF</button>`:'<span class="dim">used up</span>'}</div>`).join('')||'<div class="dim">no codes</div>'}</div>
      <h3>MESSAGE</h3><div class="row"><span>TO</span><select id="tto" style="font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px">${opts}</select></div>
      <div class="row"><input id="tsub" type="text" maxlength="120" placeholder="subject (letters and email)" style="flex:1;font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px"></div>
      <div class="row"><textarea id="ttext" rows="3" maxlength="4000" placeholder="your message" style="flex:1;min-width:240px;font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:6px"></textarea></div>
      <div class="row"><label><input type="checkbox" id="tlive" checked> LIVE (if online)</label><label><input type="checkbox" id="tletter"> LETTER (next time they come in)</label><label${D.email?'':' class="dim"'}><input type="checkbox" id="temail"${D.email?'':' disabled'}> EMAIL${D.email?'':' (not set up)'}</label><button class="btn" id="tsend">SEND</button></div>
      <h3>PLAYERS</h3>${U.map(u=>{ const p=u.player||{}; return `<div data-u="${esc(u.id)}" style="border:2px solid var(--line);padding:6px 8px;margin:6px 0">
        <div class="row"><b>${esc(p.apt||'—')}</b><span>${esc(u.email)}</span>${u.online?'<span style="color:#7fdc8a">ONLINE</span>':''}${u.admin?'<span style="color:#ffd27a">OWNER</span>':''}${u.banned?'<span style="color:#e06a5a">BANNED</span>':''}<span class="dim">joined ${esc(day(u.joined))} · last in ${esc(day(u.last))}</span><button class="btn" data-a="more">${open===u.id?'LESS':'MORE'}</button></div>
        ${open===u.id?`<div class="dim" style="white-space:pre-wrap;margin:4px 0">${esc(Object.entries({id:u.id,phone:u.phone,confirmed:u.confirmed,provider:u.provider,...p}).filter(([,v])=>v!==''&&v!=null).map(([k,v])=>k+': '+(typeof v==='object'?JSON.stringify(v):v)).join('\n'))}</div>
          <div class="row"><span>EMAIL</span><input data-f="email" type="text" value="${esc(u.email)}" style="width:220px;font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px"><span>APT</span><input data-f="apt" type="number" value="${esc(p.apt??'')}" style="width:70px;font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px"><span>NEW PASSWORD</span><input data-f="password" type="text" placeholder="8 or more" style="width:120px;font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px"><button class="btn" data-a="save">SAVE</button></div>
          <div class="row"><button class="btn" data-a="admin">${u.admin?'NOT AN OWNER':'MAKE AN OWNER'}</button><button class="btn" data-a="ban">${u.banned?'UNBAN':'BAN'}</button><button class="btn" data-a="delete">DELETE</button></div>`:''}</div>`; }).join('')}
      <h3>LETTERS SENT</h3>${D.letters.length?D.letters.slice(0,20).map(l=>`<div class="dim">${esc(day(l.at))} · to ${esc(l.too==='*'?'EVERYONE':((U.find(u=>u.id===l.too)||{}).email||l.too))} · ${esc(l.subject)} · read ${esc(l.read)}</div>`).join(''):'<div class="dim">none yet</div>'}`;
    const $=s=>el.querySelector(s); for(const f of el.querySelectorAll('input,textarea,select'))for(const ev of ['keydown','keyup'])f.addEventListener(ev,e=>e.stopPropagation());
    const act=async(b,body,ok)=>{ if(b)b.disabled=true; const r=await api('/admin',{room:room(),...body}); say=r.why?'not done: '+r.why:ok(r); await load(); };
    $('#tcode').onclick=e=>act(e.target,{do:'code',uses:+$('#tuses').value||1},r=>{ try{ navigator.clipboard.writeText(r.code); }catch(x){} return 'new code '+r.code+' (copied)'; });
    el.querySelectorAll('[data-off]').forEach(b=>b.onclick=()=>act(b,{do:'codeoff',code:b.dataset.off},()=>'code turned off'));
    $('#tsend').onclick=e=>{ const text=$('#ttext').value.trim(); if(!text){ say='write the message first'; draw(); return; }
      act(e.target,{do:'tell',to:$('#tto').value,subject:$('#tsub').value.trim(),text,live:$('#tlive').checked,letter:$('#tletter').checked,email:$('#temail').checked},
        r=>'sent'+(r.live!=null?' · live to '+r.live:'')+(r.letter?' · letter waiting':'')+(r.email!=null?' · email '+(typeof r.email==='number'?'to '+r.email:r.email):'')); };
    el.querySelectorAll('[data-u]').forEach(box=>box.onclick=e=>{ const b=e.target.closest('[data-a]'); if(!b)return; const id=box.dataset.u, u=D.users.find(x=>x.id===id), a=b.dataset.a;
      if(a==='more'){ open=open===id?null:id; draw(); return; }
      if(a==='save'){ const v=f=>box.querySelector(`[data-f="${f}"]`).value.trim(), body={do:'user',id}; if(v('email')&&v('email')!==u.email)body.email=v('email'); if(v('password'))body.password=v('password'); if(v('apt')!==String((u.player&&u.player.apt)??''))body.apt=v('apt'); act(b,body,()=>'saved'); return; }
      if(a==='admin'){ act(b,{do:'admin',id,on:!u.admin},()=>u.admin?'no longer an owner':'now an owner'); return; }
      if(a==='ban'){ if(!u.banned&&!confirm('Ban '+u.email+'? They are sent out and cannot log in.'))return; act(b,{do:'ban',id,on:!u.banned},()=>u.banned?'unbanned':'banned'); return; }
      if(a==='delete'){ if(!confirm('Delete '+u.email+' for good? This cannot be undone.'))return; act(b,{do:'delete',id},()=>'deleted'); } }); };
  const load=async()=>{ '@later'; D=await api('/admin',{do:'list',room:room()}); draw(); };
  TENANTS.open=e=>{ el=e; D=null; draw(); load(); };

  /* ---------- letters waiting for you, shown when you come in ---------- */
  const letters=async()=>{ '@later'; const r=await api('/post',{}); const L=r.letters||[]; if(!L.length)return;
    const P=document.createElement('div'); P.id='tletter'; P.setAttribute('role','dialog'); P.setAttribute('aria-label','A letter');
    P.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(520px,calc(100vw - 32px));max-height:80vh;overflow:auto;z-index:42;background:#f4efe0;color:#2a2620;border:3px solid #2a2620;padding:18px 20px;font:13px/1.6 Silkscreen,monospace;letter-spacing:.5px;box-shadow:6px 6px 0 #0008';
    P.innerHTML=L.map(l=>`<div style="margin-bottom:16px"><div style="font-size:11px;color:#6a6255">${esc(day(l.at))} · FROM THE MARKET</div><div style="font-size:15px;margin:4px 0 8px">${esc(l.subject)}</div><div style="white-space:pre-wrap">${esc(l.body)}</div></div>`).join('<hr style="border:0;border-top:2px dashed #2a262055">')+'<button id="tletok" style="font:inherit;padding:6px 12px;cursor:pointer;background:#2a2620;color:#f4efe0;border:2px solid #2a2620">PUT IT AWAY</button>';
    document.body.appendChild(P); P.querySelector('#tletok').onclick=()=>{ P.remove(); api('/post',{seen:L.map(l=>l.id)}); }; };

  const go=async()=>{ while(!window.__started)await new Promise(r=>setTimeout(r,500)); await LOAD('later');
    if(!/(?:^|;\s*)tsfm-pass=/.test(document.cookie))return;
    letters().catch(()=>{});
    if(BUGS.owner&&await BUGS.owner().catch(()=>false)){ const b=document.querySelector('[data-t="tenants"]'); if(b)b.hidden=false; } };
  go(); }
