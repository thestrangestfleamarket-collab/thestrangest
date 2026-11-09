// THE BOTS PANEL: the owner's test players in the menu's BOTS: BOTS (each bot's state in plain words, call, go to it, on/off, restart, edit one at a time) and TESTING (pick tests one by one or by kind, which bots, start, results with go there, again, to the bug queue); worker/door.js bots, run on Cloudflare or by tools/bots.cjs.
import {SHARED} from './003-shx.js';
import {BUGS, CINEMA, ONLINE, pos, TENANTS, TESTS, TEXT, UI} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
import {AVATAR} from './111c-avatar.js';
{ const esc=TEXT.esc;
  const JOBS=[['stand','STAND STILL'],['wander','WANDER'],['follow','FOLLOW SOMEONE'],['goto','GO TO A PLACE'],['sit','SIT ON A BENCH'],['fish','FISH (AND SELL)'],['mushrooms','MUSHROOMS FOR MONEY'],['decorate','DECORATE ITS APARTMENT'],['fight','FIGHT SOMEONE'],['chat','CHAT'],['tests','RUN TESTS']];
  const IN='font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px';
  const api=async body=>{ '@later'; try{ if(BUGS.tok)await BUGS.tok(); }catch(e){}
    let r; try{ r=await fetch('/admin',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({room:ONLINE.room,...body})}); }catch(e){ return {why:'the server did not answer'}; } let j={}; try{ j=await r.json(); }catch(e){} if(!r.ok&&!j.why)j.why='the server said '+r.status; return j; };
  const ago=t=>{ const s=Math.round((Date.now()-t)/1000); return s<90?s+' s ago':Math.round(s/60)+' min ago'; };
  const people=()=>{ const o=[['me','ME ('+(ONLINE.myName?ONLINE.myName():'you')+')']]; for(const [id,p] of ONLINE.others||[])o.push([id,(p.name||id).slice(0,24)]); return o; };
  const places=()=>{ try{ return [...new Set(['YOUR APARTMENT',...UI.places().map(p=>p[0])])].map(n=>[n,n]); }catch(e){ return []; } };
  const sel=(f,list,v)=>`<select data-f="${f}" style="${IN}">${list.map(([k,n])=>`<option value="${esc(k)}"${k===v?' selected':''}>${esc(n)}</option>`).join('')}</select>`;
  // the menu's BOTS (owner, 9 Nov 2026: "that menu is confusing"; "the tests should have a drop down of all the test involved and you should be able to select which ones"): two tabs, BOTS (each bot's state in plain words, EDIT one at a time) and TESTING (1 what to test, 2 which bots, start, 3 results)
  const CSS='<style>.bots .card{border:1px solid var(--line,#2f8a55);padding:6px 8px;margin:6px 0}.bots .l1{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bots .nm{color:#ffe08a;flex:1}.bots .st{margin:4px 0 2px;padding:2px 8px;border-left:4px solid}.bots .play{border-color:#5cf08a}.bots .start{border-color:#e8c860}.bots .stuck{border-color:#f0907a}.bots .off{border-color:#4a5a50;opacity:.7}.bots .row{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:5px 0}.bots .col label{display:block;margin:2px 0}.bots h4{margin:10px 0 4px;font-size:.85em;letter-spacing:1px;opacity:.85}.bots .pass{color:#7fe89a}.bots .fail{color:#f0907a}.bots .skip{color:#d8c070}.bots .bar{height:8px;border:1px solid #2f8a55;margin:4px 0}.bots .bar i{display:block;height:100%;background:#5cf08a}.bots .tabs{display:flex;gap:6px;margin-bottom:6px}.bots .tabs .btn[aria-pressed=true]{background:#8ff5a9;color:#04140b}.bots .kind{border:1px solid #23603d;margin:4px 0}.bots .kh{display:flex;align-items:center;gap:6px;padding:3px 6px;cursor:pointer;flex-wrap:wrap}.bots .kl{max-height:260px;overflow:auto;padding:2px 8px 6px 26px}.bots .kl label{display:block;font-size:.9em;margin:1px 0}.bots .why{opacity:.75;font-size:.85em}.bots .go{cursor:pointer;text-decoration:underline;margin-left:6px}</style>';
  const KIND={go:'places',use:'things to use',talk:'people to talk to',buy:'buying',sell:'selling',learn:'lessons',skill:'skills',pet:'pets',arcade:'arcade games',job:'sit, decorate'};
  const save=(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }, load_=(k,d)=>{ try{ const v=JSON.parse(localStorage.getItem(k)); return v??d; }catch(e){ return d; } };
  let el=null, D=null, say='', TAB=load_('bots-tab','bots'), EDIT=null, how=false, find='';
  let RES=[]; const RBY=()=>{ const m=new Map(); for(const r of RES)m.set(r.id,r); return m; };   // each test's last result {id,r,why,bot,at}
  const PICK=new Set(load_('bots-pick',[])), OPENK=new Set(load_('bots-openk',[])), FILED=new Set(load_('bots-filed',[]));
  let RUNAT=load_('bots-runat',0), USE=null;   // when the last START was pressed; the bots ticked for it (null: the ones that are on)
  let LIST=null; const list=()=>{ if(!LIST&&TESTS.all){ LIST=[]; TESTS.all().then(L=>{ LIST=L; draw(); }).catch(()=>{}); } return LIST||[]; };
  const tname=id=>{ const t=list().find(x=>x.id===id); return t?t.name:id; };
  // a bot's state in plain words
  const state=b=>{ const s=b.status; if(!b.on)return ['off','○ OFF',''];
    if(!s||Date.now()-s.seen>90000)return s&&Date.now()-s.seen>90000?['stuck','⚠ STUCK','no word from it for '+ago(s.seen).replace(' ago','')+'. RESTART turns it off and on.']:['start','◐ STARTING','waiting for Cloudflare to open its game (1 to 3 minutes)'];
    if(/^(loading|opening|starting|making)/.test(s.doing||''))return ['start','◐ STARTING',s.doing+' (1 to 3 minutes)'];
    return ['play','● PLAYING',(s.doing||'')+(s.cash!=null?' · $'+s.cash:'')+(s.hp!=null?' · health '+Math.round(s.hp*100)+'%':'')]; };
  const jobName=j=>(JOBS.find(x=>x[0]===j)||['',j])[1];
  const card=b=>{ const [k,w,d]=state(b), at=b.status&&b.status.at;
    return `<div class="card" data-b="${esc(b.id)}"><div class="l1"><span class="nm">${esc(b.name)}</span>${b.on?`<button class="btn" data-a="call" title="bring it to where you stand">CALL</button>${at?'<button class="btn" data-a="goto" title="go to where it is, to watch it">GO TO IT</button>':''}`:''}${k==='stuck'?'<button class="btn" data-a="restart">RESTART</button>':''}<button class="btn" data-a="on">${b.on?'OFF':'ON'}</button><button class="btn" data-a="edit">EDIT</button></div>
      <div class="st ${k}">${w} · ${esc(jobName(b.job))}${d?'<br><span class="why">'+esc(d)+'</span>':''}</div></div>`; };
  const botsTab=()=>{ const B=[...D.bots].sort((a,c)=>{ const o={stuck:0,start:1,play:2,off:3}; return o[state(a)[0]]-o[state(c)[0]]; }), n=k=>D.bots.filter(b=>state(b)[0]===k).length;
    const cf=D.cloud===null?'<div class="fail">Cloudflare is not running bots on this server.</div>':D.cloud&&D.cloud.err?'<div class="fail">CLOUDFLARE: '+esc(D.cloud.err)+'</div>':'';
    return `<div class="card"><div><span class="pass">${n('play')} playing</span> · <span class="skip">${n('start')} starting</span> · <span class="fail">${n('stuck')} stuck</span> · ${n('off')} off${say?' · '+esc(say):''}</div>${cf}
      <div class="row"><button class="btn" id="bnew">+ NEW BOT</button><button class="btn" id="ball">CALL ALL TO ME</button><button class="btn" id="boff">ALL OFF</button></div>
      <div class="why">Bots run on Cloudflare: about 9¢ an hour after 10 free hours a month. Turn them off when you are done. <span class="go" id="bhow">${how?'hide':'run them on a PC instead'}</span></div>
      ${how?`<div class="why" style="white-space:pre-wrap;margin:4px 0">Turn them off here first. Once: install Node (nodejs.org), save tools/bots.cjs in a folder, and in that folder run
  npm install playwright
  npx playwright install chromium
Then, while you want bots in the game:
  node bots.cjs ${esc(D.key)}
Leave that window open; Ctrl+C stops every bot.</div><div class="row"><code>${esc(D.key)}</code><button class="btn" id="bcopy">COPY KEY</button><button class="btn" id="bkey">NEW KEY</button></div>`:''}</div>
      ${B.length?B.map(card).join(''):'<div class="why">No bots yet: + NEW BOT makes one where you stand.</div>'}`; };
  // one bot's settings, one column
  const editView=b=>`<div data-b="${esc(b.id)}" class="col"><div class="row"><button class="btn" data-a="back">◀ BACK</button><b>EDIT ${esc(b.name)}</b></div>
      <h4>NAME</h4><input data-f="name" type="text" maxlength="24" value="${esc(b.name)}" style="width:220px;${IN}">
      <h4>JOB</h4>${b.job==='tests'?'<div class="why">It is testing (set in TESTING). Pick another job to stop.</div>':''}${sel('job',JOBS,b.job)}
      <label style="margin-top:4px">GOAL $ <input data-f="goal" type="number" min="0" value="${esc(b.goal||'')}" placeholder="none" style="width:90px;${IN}"> <span class="why">stop the money jobs once it has earned this</span></label>
      <h4>WHERE IT STARTS</h4>${sel('place',[['','WHERE IT IS NOW'],...places()],b.place)}
      <h4>LOOKS</h4>${sel('look',[['','RANDOM'],['me','LIKE ME NOW'],...(b.look&&b.look!=='me'?[[b.look,'AS SET']]:[])],b.look)}<label><input data-f="apt" type="checkbox"${b.apt?' checked':''}> its own apartment</label>
      <h4>FIGHTING</h4><label><input data-f="fight" type="checkbox"${b.fight?' checked':''}> fights back</label><label><input data-f="god" type="checkbox"${b.god?' checked':''}> can't be knocked down</label>
      <label>health <input data-f="hp" type="range" min="5" max="100" value="${esc(Math.round((b.hp??1)*100))}"></label><label>follow / fight ${sel('who',[['','NOBODY'],...people()],b.who&&b.who===ONLINE.me?'me':b.who)}</label>
      <h4>SAYS</h4><input data-f="say" type="text" maxlength="400" value="${esc(b.say||'')}" placeholder="lines it says now and then, split by |" style="width:100%;box-sizing:border-box;${IN}">
      <div class="row" style="margin-top:10px"><button class="btn" data-a="save">SAVE</button><button class="btn" data-a="back">CANCEL</button><span style="flex:1"></span><button class="btn" data-a="del">DELETE</button></div><div class="why">${esc(b.email||'')}</div></div>`;
  // TESTING: 1 what (each kind opens to its tests), 2 which bots, start, 3 results
  const mark=r=>!r?'<span class="why">·</span>':r.r==='pass'?'<span class="pass">✓</span>':r.r==='fail'?'<span class="fail">✗</span>':'<span class="skip">–</span>';
  const testTab=()=>{ const L=list(), R=RBY(), cats=TESTS.cats||[], q=find.trim().toLowerCase(), hit=t=>!q||t.name.toLowerCase().includes(q);
    const kinds=cats.map(([k])=>{ const T=L.filter(t=>t.cat===k), V=T.filter(hit), np=T.filter(t=>PICK.has(t.id)).length, pf=T.filter(t=>R.get(t.id)&&R.get(t.id).r==='fail').length, pp=T.filter(t=>R.get(t.id)&&R.get(t.id).r==='pass').length, op=OPENK.has(k)||!!q;
      if(q&&!V.length)return '';
      return `<div class="kind"><div class="kh" data-k="${k}"><span>${op?'▾':'▸'}</span><input type="checkbox" data-kall="${k}"${np&&np===T.length?' checked':''}> <b>${esc(KIND[k]||k)}</b><span class="why">${np} of ${T.length} picked${pp?' · <span class="pass">'+pp+' ✓</span>':''}${pf?' · <span class="fail">'+pf+' ✗</span>':''}</span></div>
        ${op?`<div class="kl"><div class="row"><button class="btn" data-q="${k}:all">ALL</button><button class="btn" data-q="${k}:none">NONE</button><button class="btn" data-q="${k}:fail">FAILED</button><button class="btn" data-q="${k}:new">NOT RUN</button></div>${V.map(t=>{ const r=R.get(t.id); return `<label title="${esc(r?r.why:'not run yet')}"><input type="checkbox" data-t="${esc(t.id)}"${PICK.has(t.id)?' checked':''}> ${mark(r)} ${esc(t.name)}</label>`; }).join('')}</div>`:''}</div>`; }).join('');
    const B=D.bots, use=USE||new Set(B.filter(b=>b.on&&state(b)[0]!=='stuck').map(b=>b.id)), nb=B.filter(b=>use.has(b.id)).length;
    const runs=B.filter(b=>b.on&&b.job==='tests'), t=runs.reduce((a,b)=>{ const x=b.status&&b.status.tests; if(x){ a.d+=x.pass+x.fail+x.skip; a.l+=x.left; } return a; },{d:0,l:0});
    const mine=RES.filter(r=>r.at>=RUNAT).sort((a,c)=>({fail:0,skip:1,pass:2}[a.r]-{fail:0,skip:1,pass:2}[c.r])), n=k=>mine.filter(r=>r.r===k).length, all=Math.max(t.d+t.l,mine.length);
    const fails=mine.filter(r=>r.r!=='pass');
    return `<h4>1. WHAT TO TEST</h4><div class="row"><input id="tfind" type="text" placeholder="find a test (e.g. skate, fishing rod, cat)" value="${esc(find)}" style="flex:1;min-width:200px;${IN}"><button class="btn" id="tnone">PICK NONE</button></div>${L.length?kinds:'<div class="why">making the list…</div>'}
      <div class="why">${PICK.size} test${PICK.size===1?'':'s'} picked${PICK.size&&nb?' · about '+Math.max(1,Math.round(PICK.size*1.5/nb))+' minute'+(Math.round(PICK.size*1.5/nb)>1?'s':'')+' with '+nb+' bot'+(nb===1?'':'s'):''}</div>
      <h4>2. WHICH BOTS</h4>${B.length?`<div class="row">${B.map(b=>`<label><input type="checkbox" data-u="${esc(b.id)}"${use.has(b.id)?' checked':''}> ${esc(b.name)} <span class="why">(${state(b)[1].slice(2).toLowerCase()})</span></label>`).join('')}</div><div class="why">The picked tests are split between them; START turns them on.</div>`:'<div class="why">No bots yet: make one in BOTS.</div>'}
      <div class="row" style="margin-top:8px"><button class="btn" id="tgo"${PICK.size&&nb?'':' disabled'}>▶ START TESTING</button>${runs.length?'<button class="btn" id="tstop">STOP</button>':''}</div>
      <h4>3. RESULTS${RUNAT?' <span class="why">since '+new Date(RUNAT).toLocaleTimeString()+'</span>':''}</h4>
      ${all?`<div class="bar"><i style="width:${Math.round((mine.length/all)*100)}%"></i></div>`:''}<div class="why">${mine.length} of ${all||PICK.size} done · <span class="pass">${n('pass')} passed</span> · <span class="fail">${n('fail')} failed</span> · <span class="skip">${n('skip')} skipped</span>${runs.length?' · '+runs.length+' bot'+(runs.length===1?'':'s')+' testing':''}</div>
      ${fails.map(r=>`<div class="${r.r}">${r.r==='fail'?'✗':'–'} ${esc(tname(r.id))} <span class="why">— ${esc(r.why)}</span>${goWhere(r.id)?`<span class="go" data-go="${esc(r.id)}">GO THERE</span>`:''}</div>`).join('')}
      ${n('pass')?`<div class="why" style="cursor:pointer" id="tpass">${how==='pass'?mine.filter(r=>r.r==='pass').map(r=>'✓ '+esc(tname(r.id))+' — '+esc(r.why)).join('<br>'):'+ '+n('pass')+' passed (show)'}</div>`:''}
      ${fails.length?`<div class="row" style="margin-top:6px"><button class="btn" id="tre">TEST THE FAILED AGAIN</button><button class="btn" id="tbug">SEND FAILED TO BUG QUEUE</button></div>`:''}${RES.length?'<div class="row"><button class="btn" id="tclr">CLEAR ALL RESULTS</button></div>':''}`; };
  // where a test happens, to see it for yourself
  const goWhere=id=>{ const t=list().find(x=>x.id===id); if(!t)return null; return t.at||t.shop||(t.cat==='pet'?'THE PET STORE':t.cat==='arcade'?'THE ARCADE':null); };
  const callSet=()=>({at:[+pos.x.toFixed(2),+pos.z.toFixed(2),SHARED.LVL==='down'?1:0],place:'',call:Date.now()});
  const act=async(b,body,ok)=>{ if(b)b.disabled=true; const r=await api(body); say=r.why?'not done: '+r.why:ok(r); await load(); };
  const keepPick=()=>save('bots-pick',[...PICK]);
  const start=async btn=>{ const B=D.bots.filter(b=>(USE||new Set(D.bots.filter(x=>x.on&&state(x)[0]!=='stuck').map(x=>x.id))).has(b.id)), ids=list().filter(t=>PICK.has(t.id)).map(t=>t.id); if(!B.length||!ids.length)return;
    btn.disabled=true; RUNAT=Date.now(); save('bots-runat',RUNAT); const share=B.map(()=>[]); ids.forEach((id,i)=>share[i%B.length].push(id));
    for(let i=0;i<B.length;i++)await api({do:'botset',id:B[i].id,set:{on:true,job:'tests',tests:share[i].slice(0,800),run:RUNAT}});
    say=ids.length+' tests started on '+B.length+' bot'+(B.length===1?'':'s'); await load(); };
  const fileFails=async btn=>{ if(!BUGS.file){ say='the bug queue is only on the website'; return draw(); } btn.disabled=true; let n=0;
    for(const r of RES.filter(r=>r.r==='fail'&&r.at>=RUNAT)){ const k=r.id+'|'+r.at; if(FILED.has(k))continue; const b=D.bots.find(x=>x.id===r.bot);
      try{ await BUGS.file('BOT TEST FAILED · '+tname(r.id)+': '+r.why,{bot:b?b.name:r.bot,test:r.id,why:r.why,at:r.at}); FILED.add(k); n++; }catch(e){ say='not sent: '+(e.message||e); break; } }
    save('bots-filed',[...FILED]); if(!say.startsWith('not sent'))say=n?n+' sent to the bug queue (approve them there)':'those are in the queue already'; draw(); };
  const draw=()=>{ '@later'; if(!el)return; if(!D){ el.innerHTML='<div class="why">...</div>'; return; } if(D.why){ el.innerHTML='<div>'+esc(D.why)+'</div>'; return; }
    const b=EDIT&&D.bots.find(x=>x.id===EDIT); if(EDIT&&!b)EDIT=null;
    el.innerHTML=`${CSS}<div class="bots"><div class="tabs"><button class="btn" data-tab="bots" aria-pressed="${TAB==='bots'}">BOTS</button><button class="btn" data-tab="test" aria-pressed="${TAB==='test'}">TESTING</button></div>${TAB==='test'?testTab():b?editView(b):botsTab()}</div>`;
    wire(el,()=>draw()); el.dataset.dirty=''; };
  const wire=(root,redraw)=>{ const $=s=>root.querySelector(s);
    for(const f of root.querySelectorAll('input,select'))for(const ev of ['keydown','keyup'])f.addEventListener(ev,e=>e.stopPropagation());
    root.oninput=e=>{ if(e.target.id==='tfind'){ find=e.target.value; const c=e.target.selectionStart; redraw(); const t=root.querySelector('#tfind'); if(t){ t.focus(); t.setSelectionRange(c,c); } return; } if(e.target.matches('[data-f]'))root.dataset.dirty='1'; };
    root.onchange=e=>{ const x=e.target;
      if(x.dataset.t){ if(x.checked)PICK.add(x.dataset.t); else PICK.delete(x.dataset.t); keepPick(); redraw(); return; }
      if(x.dataset.kall){ for(const t of list())if(t.cat===x.dataset.kall){ if(x.checked)PICK.add(t.id); else PICK.delete(t.id); } keepPick(); redraw(); return; }
      if(x.dataset.u){ USE=USE||new Set(D.bots.filter(b=>b.on&&state(b)[0]!=='stuck').map(b=>b.id)); if(x.checked)USE.add(x.dataset.u); else USE.delete(x.dataset.u); redraw(); return; }
      if(x.matches('[data-f]'))root.dataset.dirty='1'; };
    root.onclick=e=>{ const t=e.target;
      const tab=t.closest('[data-tab]'); if(tab){ TAB=tab.dataset.tab; save('bots-tab',TAB); EDIT=null; redraw(); return; }
      const kh=t.closest('[data-k]'); if(kh&&!t.matches('input')){ const k=kh.dataset.k; if(OPENK.has(k))OPENK.delete(k); else OPENK.add(k); save('bots-openk',[...OPENK]); redraw(); return; }
      const qb=t.closest('[data-q]'); if(qb){ const [k,w]=qb.dataset.q.split(':'), R=RBY(), q=find.trim().toLowerCase(); for(const x of list())if(x.cat===k&&(!q||x.name.toLowerCase().includes(q))){ const r=R.get(x.id), on=w==='all'||(w==='fail'&&r&&r.r==='fail')||(w==='new'&&!r); if(w==='none'||!on)PICK.delete(x.id); else PICK.add(x.id); } keepPick(); redraw(); return; }   // while searching, only the tests shown
      const g=t.closest('[data-go]'); if(g){ const w=goWhere(g.dataset.go); if(w)UI.goName(w); return; }
      if(t.id==='tnone'){ PICK.clear(); keepPick(); redraw(); return; }
      if(t.id==='tgo'){ start(t); return; }
      if(t.id==='tstop'){ t.disabled=true; (async()=>{ for(const b of D.bots.filter(b=>b.on&&b.job==='tests'))await api({do:'botset',id:b.id,set:{job:'stand'}}); say='testing stopped: they stand still'; await load(); })(); return; }
      if(t.id==='tre'){ PICK.clear(); for(const r of RES)if(r.r==='fail'&&r.at>=RUNAT)PICK.add(r.id); keepPick(); start(t); return; }
      if(t.id==='tbug'){ fileFails(t); return; }
      if(t.id==='tclr'){ if(!confirm('Clear every test result?'))return; act(t,{do:'testclear'},()=>'results cleared'); return; }
      if(t.id==='tpass'){ how=how==='pass'?false:'pass'; redraw(); return; }
      if(t.id==='bnew'){ act(t,{do:'botnew',set:{at:[pos.x,pos.z]}},r=>{ if(r.id)EDIT=r.id; return 'a new bot where you stand: set it up below'; }); return; }
      if(t.id==='ball'){ t.disabled=true; (async()=>{ const on=D.bots.filter(b=>b.on), c=callSet(); for(const b of on)await api({do:'botset',id:b.id,set:c}); say=on.length?on.length+' coming':'no bot is on'; await load(); })(); return; }
      if(t.id==='boff'){ t.disabled=true; (async()=>{ const L=D.bots.filter(b=>b.on); for(const b of L)await api({do:'botset',id:b.id,set:{on:false}}); say=L.length?L.length+' turned off':'all off already'; await load(); })(); return; }
      if(t.id==='bhow'){ how=!how; redraw(); return; }
      if(t.id==='bcopy'){ try{ navigator.clipboard.writeText(D.key); say='key copied'; }catch(err){ say='copy it by hand'; } redraw(); return; }
      if(t.id==='bkey'){ if(confirm('A new key stops the old one: restart the runner with the new key.'))act(t,{do:'botkey'},()=>'new key made'); return; }
      const a=t.closest('[data-a]'), box=t.closest('[data-b]'); if(!a||!box)return; const id=box.dataset.b, x=D.bots.find(q=>q.id===id), f=n=>box.querySelector(`[data-f="${n}"]`), A=a.dataset.a;
      if(A==='edit'){ EDIT=id; TAB='bots'; redraw(); return; }
      if(A==='back'){ EDIT=null; if(root===W)shut(); else redraw(); return; }
      if(A==='on'){ act(a,{do:'botset',id,set:{on:!x.on}},()=>x.name+(x.on?' turned off':' turned on')); return; }
      if(A==='restart'){ a.disabled=true; (async()=>{ await api({do:'botset',id,set:{on:false}}); await api({do:'botset',id,set:{on:true}}); say=x.name+' restarting'; await load(); })(); return; }
      if(A==='call'){ act(a,{do:'botset',id,set:callSet()},()=>x.name+' is coming'); return; }
      if(A==='goto'){ const p=x.status.at; UI.goTo(p[0],p[1],'up'); return; }
      if(A==='del'){ if(!confirm('Delete '+x.name+' and its account for good?'))return; EDIT=null; act(a,{do:'botdel',id},()=>'deleted'); return; }
      if(A==='save'){ const look=f('look').value, set={name:f('name').value.trim(),look:look==='me'?AVATAR.code():look,job:f('job').value,who:f('who').value==='me'?ONLINE.me:f('who').value,
          goal:+f('goal').value||0,say:f('say').value.trim(),hp:(+f('hp').value||100)/100,fight:f('fight').checked,god:f('god').checked,apt:f('apt').checked};
        const pl=f('place').value; if(pl!==(x.place||'')){ set.place=pl; if(pl)set.at=null; }
        EDIT=null; act(a,{do:'botset',id,set},()=>x.name+' saved'); if(root===W)shut(); } }; };

  const IDS=new Set(); const load=async()=>{ const [d,t]=await Promise.all([api({do:'bots'}),api({do:'tests'})]); D=d; if(t&&t.tests)RES=t.tests; if(D&&D.bots){ IDS.clear(); for(const b of D.bots)IDS.add(b.id); } if(!el||!el.dataset.dirty)draw(); if(W&&!W.dataset.dirty&&!W.contains(document.activeElement))win(W.dataset.bot); };
  // a bot's own window: double-click it in the world (owners only)
  let W=null; const win=id=>{ '@later'; const b=D&&D.bots&&D.bots.find(q=>q.id===id); if(!b){ shut(); return; }
    if(!W){ W=document.createElement('div'); W.id='botwin'; W.style.cssText='position:fixed;left:50%;top:8%;transform:translateX(-50%);width:min(560px,calc(100vw - 32px));max-height:84vh;overflow:auto;z-index:40;background:#04140b;color:#bdf7c9;border:2px solid #2f8a55;padding:10px 14px;font:14px/1.6 "Share Tech Mono",Silkscreen,monospace;letter-spacing:.5px'; document.body.appendChild(W); }
    W.dataset.bot=id; W.innerHTML=`${CSS}<style>#botwin .btn{font:inherit;padding:2px 10px;background:#082016;color:#d8ffe2;border:1px solid #2f8a55;cursor:pointer}</style><div class="bots">${card(b)}${editView(b)}</div>${say?`<div class="why">${esc(say)}</div>`:''}`;
    wire(W,()=>win(id)); W.dataset.dirty=''; };
  const shut=()=>{ if(W){ W.remove(); W=null; } };
  ONLINE.botUse=o=>{ if(!o||!IDS.has(o.id))return false; (window.LOAD?LOAD('later'):Promise.resolve()).then(async()=>{ if(!D)await load(); win(o.id); }); return true; };
  // an owner learns which players are bots once the start is done
  SYS.onStart(()=>setTimeout(()=>{ (window.LOAD?LOAD('later'):Promise.resolve()).then(()=>CINEMA.isAdmin&&CINEMA.isAdmin()).then(a=>{ if(a)return api({do:'bots'}).then(r=>{ if(r&&r.bots)for(const b of r.bots)IDS.add(b.id); }); }).catch(()=>{}); },4000),'136ca-bots');
  TENANTS.bots=e=>{ el=e; D=null; draw(); load(); if(!TENANTS.bots.t)TENANTS.bots.t=setInterval(()=>{ if(el&&el.offsetParent&&!el.dataset.dirty&&!el.contains(document.activeElement))load(); },10000); }; window.TENANTS=TENANTS;   // live, but never while you are changing a bot
}
