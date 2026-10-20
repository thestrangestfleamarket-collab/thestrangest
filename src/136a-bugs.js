const BUGS={};
{ const SB='https://jvcetttmqseoteidfggn.supabase.co', KEY='sb_publishable_UkzD8hOizW1hPr6hm3duQQ_07ZodPik', LS='sb-jvcetttmqseoteidfggn-auth-token';
  const errs=[], err=m=>{ errs.push(String(m||'').slice(0,240)); if(errs.length>8)errs.shift(); };
  addEventListener('error',e=>err(e.message)); addEventListener('unhandledrejection',e=>err(e.reason&&e.reason.message||e.reason));
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const jw=t=>{ try{ return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); }catch(e){ return {}; } };
  const ck=()=>{ const m=/(?:^|;\s*)tsfm-pass=([^;]+)/.exec(document.cookie); return m?decodeURIComponent(m[1]):''; };
  const renew=async()=>{ '@later'; const s=JSON.parse(localStorage.getItem(LS)||'null'); if(!s||!s.refresh_token)return '';
    const r=await fetch(SB+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'content-type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})}); if(!r.ok)return '';
    const n=await r.json(); localStorage.setItem(LS,JSON.stringify({...s,...n})); document.cookie='tsfm-pass='+n.access_token+'; path=/; max-age=3600; secure; samesite=strict'; return T=n.access_token; };
  let T=''; const tok=async()=>{ '@later'; let t=ck()||T; if(t.startsWith('dev:'))return ''; if(!t||(jw(t).exp||0)*1000<Date.now()+60000)t=await renew().catch(()=>''); return t; };
  const sb=async(path,o={})=>{ const t=await tok(); if(!t)throw new Error('log in again to send it');
    const r=await fetch(SB+path,{...o,headers:{apikey:KEY,Authorization:'Bearer '+t,'content-type':'application/json',...(o.headers||{})}}); if(!r.ok)throw new Error('the server said '+r.status); return r; };
  const SITE={
    send:async(body,context,jpg)=>{ '@later'; const id=crypto.randomUUID();
      await sb('/rest/v1/bug_reports',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({id,body,context,shots:jpg?1:0})});
      if(jpg)await sb('/rest/v1/bug_shots',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({report:id,jpg})}); },
    owner:async()=>{ const t=await tok(); if(!t)return false; const r=await sb('/rest/v1/admins?select=user_id&user_id=eq.'+jw(t).sub); return (await r.json()).length>0; },
    list:async()=>(await (await sb('/rest/v1/bug_reports?select=id,player,body,context,shots,status,note,created_at&order=created_at.desc&limit=300')).json()).map(r=>({...r,at:Date.parse(r.created_at)})),
    shot:async r=>{ const a=await (await sb('/rest/v1/bug_shots?select=jpg&report=eq.'+r.id)).json(); if(a.length)return a[0].jpg; if(!r.shots)return '';
      const b=await (await sb('/storage/v1/object/authenticated/bugs/'+r.player+'/'+r.id+'/000.jpg')).blob(); return URL.createObjectURL(b); },
    mark:(id,status)=>sb('/rest/v1/bug_reports?id=eq.'+id,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status})}) };
  const ART=(db,user)=>({
    send:async(body,context,jpg)=>{ const id=crypto.randomUUID(); await db.doc('bugs/'+id).set({body,context,status:'new',at:Date.now(),shots:jpg?1:0}); if(jpg)await db.doc('bugshots/'+id).set({jpg}); },
    owner:async()=>!!(user&&await user.isOwner()),
    list:async()=>(await db.collection('bugs').orderBy('at','desc').limit(300).get()).docs.map(d=>({id:d.id,...d.data()})),
    shot:async r=>{ const s=await db.doc('bugshots/'+r.id).get(); return s.exists?s.data().jpg:''; },
    mark:(id,status)=>db.doc('bugs/'+id).update({status}) });
  let BE=null; const backend=async()=>{ '@later'; if(BE)return BE; const c=window.claude;
    if(c&&c.use){ const db=await c.use('db').catch(()=>null); if(db){ const u=await c.use('user').catch(()=>null); return BE=ART(db,u); } }
    if(ck()||localStorage.getItem(LS))return BE=SITE; return null; };
  const grab=()=>new Promise(res=>requestAnimationFrame(()=>{ try{ const s=renderer.domElement, k=s.width>=1280?1280/s.width:Math.min(3,Math.floor(1280/s.width)), c=document.createElement('canvas');
    c.width=Math.round(s.width*k); c.height=Math.round(s.height*k); const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.drawImage(s,0,0,c.width,c.height);
    let q=.85, u; do{ u=c.toDataURL('image/jpeg',q); q-=.15; }while(u.length>300000&&q>.2); res(u.length>300000?null:u); }catch(e){ res(null); } }));
  const where=()=>{ '@later'; let near='', d=1e9; try{ for(const p of UI.places()){ const q=Math.hypot(p[1]-pos.x,p[2]-pos.z); if(q<d){ d=q; near=p[0]; } } }catch(e){}
    return {build:BUILDV, at:[+pos.x.toFixed(2),+pos.z.toFixed(2),+py.toFixed(2)], hd:+heading.toFixed(2), lvl:LVL, near, far:Math.round(d), hour:+CLOCK.h.toFixed(2), view:UI.view,
      screen:[innerWidth,innerHeight,devicePixelRatio], ua:navigator.userAgent.slice(0,200), errs:errs.slice(), url:location.search.slice(0,200), from:window.claude?'artifact':'site'}; };
  const ST=[['new','NEW'],['approved','APPROVED'],['later','LATER'],['fixed','FIXED'],['no','NO']];
  let shot=null, ctx=null, filt='new', rows=[], el=null;
  const draw=async()=>{ '@later'; const be=await backend(), own=be?await be.owner().catch(()=>false):false;
    el.innerHTML=`<h3>REPORT A BUG</h3><div class="dim">what went wrong? what did you expect? the picture is the screen behind this menu, taken when you opened it (F8 opens this anywhere)</div>
      <div class="row"><textarea id="bugtx" rows="4" maxlength="2000" style="flex:1;min-width:240px;font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:6px"></textarea></div>
      <div class="row"><img id="bugim" alt="the screen" style="max-width:min(320px,80vw);border:2px solid var(--line);image-rendering:pixelated"><label class="dim"><input type="checkbox" id="bugwith" checked> send the picture</label></div>
      <div class="row"><button class="btn" id="bugsend">SEND</button><span class="dim" id="bugsay">${be?'':'reports send from the game on thestrangestfleamarket.com or the claude.ai link'}</span></div>
      ${own?'<h3>THE QUEUE</h3><div class="row" id="bugst"></div><div id="bugq"></div>':''}`;
    const $=s=>el.querySelector(s); if(shot)$('#bugim').src=shot; else $('#bugim').hidden=true; $('#bugsend').disabled=!be;
    for(const ev of ['keydown','keyup'])$('#bugtx').addEventListener(ev,e=>e.stopPropagation());
    $('#bugsend').onclick=async()=>{ const b=$('#bugtx').value.trim(); if(!b){ $('#bugsay').textContent='say what went wrong first'; return; }
      $('#bugsend').disabled=true; $('#bugsay').textContent='sending...';
      try{ await be.send(b,ctx,$('#bugwith').checked?shot:null); $('#bugtx').value=''; $('#bugsay').textContent='SENT. THANK YOU'; if(own)queue(); }
      catch(e){ $('#bugsay').textContent='not sent: '+(e.message||e); } $('#bugsend').disabled=false; };
    if(own)queue(); };
  const queue=async()=>{ '@later'; const be=await backend(), $=s=>el.querySelector(s); if(!$('#bugq'))return;
    try{ rows=await be.list(); }catch(e){ $('#bugq').textContent='the queue would not load: '+(e.message||e); return; }
    $('#bugst').innerHTML=ST.map(([k,n])=>`<button class="btn" data-f="${k}" aria-pressed="${k===filt}">${n} ${rows.filter(r=>(r.status||'new')===k).length}</button>`).join('');
    $('#bugst').onclick=e=>{ const b=e.target.closest('[data-f]'); if(b){ filt=b.dataset.f; queue(); } };
    const L=rows.filter(r=>(r.status||'new')===filt);
    $('#bugq').innerHTML=L.length?L.map(r=>{ const c=r.context||{}; return `<div data-id="${esc(r.id)}" style="border:2px solid var(--line);padding:8px;margin:8px 0">
      <div class="dim">${esc(new Date(r.at).toLocaleString())} &middot; ${esc(c.from||'')} build ${esc(c.build??'?')} &middot; ${esc(c.near?'near '+c.near:'')} ${c.at?esc(c.at.join(', ')):''} &middot; ${c.hour!=null?esc(c.hour)+'h':''} ${esc(c.view||'')}</div>
      <div style="white-space:pre-wrap;margin:6px 0">${esc(r.body)}</div>${c.errs&&c.errs.length?`<div class="dim">errors: ${esc(c.errs.join(' | '))}</div>`:''}
      <div class="row">${r.shots?'<button class="btn" data-a="pic">PICTURE</button>':''}${c.at?'<button class="btn" data-a="go">GO THERE</button>':''}
      ${ST.filter(([k])=>k!==filt).map(([k,n])=>`<button class="btn" data-s="${k}">${({new:'BACK TO NEW',approved:'APPROVE'})[k]||n}</button>`).join('')}</div><img hidden style="max-width:100%;image-rendering:pixelated"></div>`; }).join(''):'<div class="dim">nothing here</div>';
    $('#bugq').onclick=async e=>{ const b=e.target.closest('button'), box=e.target.closest('[data-id]'); if(!b||!box)return; const r=rows.find(x=>x.id===box.dataset.id);
      if(b.dataset.s){ b.disabled=true; try{ await be.mark(r.id,b.dataset.s); queue(); }catch(x){ b.textContent='FAILED'; } return; }
      if(b.dataset.a==='pic'){ const im=box.querySelector('img'); if(!im.hidden){ im.hidden=true; return; } b.textContent='...'; try{ const u=await be.shot(r); if(u){ im.src=u; im.hidden=false; } }catch(x){} b.textContent='PICTURE'; }
      if(b.dataset.a==='go'){ const a=r.context.at; UI.toggleMenu(); STORE.goTo(a[0],a[1],a[2]); if(r.context.hd!=null)heading=r.context.hd; if(r.context.hour!=null)CLOCK.set(r.context.hour); } }; };
  BUGS.open=async e=>{ el=e; ctx=where(); el.innerHTML='<div class="dim">...</div>'; shot=await grab(); draw(); };
  addEventListener('keydown',e=>{ if(e.key==='F8'&&!e.repeat){ e.preventDefault(); UI.menuTab('bug'); } }); }
