// THE BOTS PANEL: the owner's test players in the menu's BOTS: a fleet bar (spawn, call, all on/off, fold), a line a bot that opens to what it does, its test results (run again, the failed, to the bug queue), who it is and its health; worker/door.js bots, run on Cloudflare or by tools/bots.cjs.
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
  let el=null, D=null, say='', open=null;
  const people=()=>{ const o=[['me','ME ('+(ONLINE.myName?ONLINE.myName():'you')+')']]; for(const [id,p] of ONLINE.others||[])o.push([id,(p.name||id).slice(0,24)]); return o; };
  const places=()=>{ try{ return [...new Set(['YOUR APARTMENT',...UI.places().map(p=>p[0])])].map(n=>[n,n]); }catch(e){ return []; } };
  const sel=(f,list,v)=>`<select data-f="${f}" style="${IN}">${list.map(([k,n])=>`<option value="${esc(k)}"${k===v?' selected':''}>${esc(n)}</option>`).join('')}</select>`;
  // the menu's BOTS (owner, 9 Nov 2026: "allow to minimize each bots view ... redesign it for everything i need to do to beta test this with bots"): a fleet bar, then a line a bot that opens to its groups
  const CSS='<style>.bots .bk{border:1px solid var(--line,#2f8a55);margin:8px 0}.bots .bh{display:flex;align-items:center;gap:10px;padding:6px 8px;flex-wrap:wrap;cursor:pointer}.bots .dot{width:10px;height:10px;border-radius:50%;display:inline-block;flex:none}.bots .nm{color:#ffe08a;min-width:90px}.bots .now{flex:1;min-width:160px;opacity:.8;font-size:.9em}.bots .sec{border-top:1px dashed #2a5a40;padding:6px 8px}.bots .sec h4{margin:0 0 4px;font-size:.8em;letter-spacing:2px;opacity:.8}.bots .row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:5px 0}.bots .pass{color:#7fe89a}.bots .fail{color:#f0907a}.bots .skip{color:#d8c070}.bots .bar{height:8px;width:200px;border:1px solid #2f8a55;display:inline-block}.bots .bar i{display:block;height:100%;background:#5cf08a}.bots .btn.red{border-color:#a05040;color:#f0a090}</style>';
  const SHORT={go:'PLACES',use:'THINGS',talk:'PEOPLE',buy:'BUY',sell:'SELL',learn:'LEARN',skill:'SKILLS',pet:'PETS',arcade:'ARCADE',job:'SIT, DECORATE'};
  const keep=(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify([...v])); }catch(e){} }, kept=k=>{ try{ return new Set(JSON.parse(localStorage.getItem(k)||'[]')); }catch(e){ return new Set(); } };
  const OPEN=kept('bots-open'), ALL=new Set(), FILED=kept('bots-filed');
  let RES=[];   // every test's last result {id,r,why,bot,at}
  const live=b=>b.status&&Date.now()-b.status.seen<60000;
  const tname=id=>{ const t=list().find(x=>x.id===id); return t?t.name:id; };
  const mine=b=>RES.filter(r=>r.bot===b.id).sort((a,c)=>({fail:0,skip:1,pass:2}[a.r]-{fail:0,skip:1,pass:2}[c.r])||c.at-a.at);
  const head=(b,op)=>{ const s=b.status, L=live(b), col=b.on?(L?'#5cf08a':'#e8c860'):'#4a5a50';
    const now=!b.on?'off':!s?'starting':(s.doing||'')+(s.cash!=null?' · $'+s.cash:'')+(s.hp!=null?' · '+Math.round(s.hp*100)+'%':'')+(L?'':' · '+ago(s.seen));
    return `<div class="bh" data-a="fold"><span>${op?'▾':'▸'}</span><span class="dot" style="background:${col}" title="${b.on?(L?'running':'starting'):'off'}"></span><b class="nm">${esc(b.name)}</b><span>${esc((JOBS.find(j=>j[0]===b.job)||['',b.job])[1])}</span><span class="now">${esc(now)}</span><button class="btn" data-a="call">CALL</button><button class="btn${b.on?' red':''}" data-a="on">${b.on?'OFF':'ON'}</button></div>`; };
  const results=b=>{ const R=mine(b), t=b.status&&b.status.tests, n=k=>R.filter(r=>r.r===k).length, done=t?t.pass+t.fail+t.skip:R.length, all=t?done+t.left:R.length;
    if(b.job!=='tests'&&!R.length)return '';
    const show=ALL.has(b.id)?R:R.filter(r=>r.r!=='pass').slice(0,8).concat(R.filter(r=>r.r==='pass').slice(0,2)), more=R.length-show.length;
    return `<div class="sec"><h4>RESULTS</h4><div class="row"><span class="bar"><i style="width:${all?Math.round(done/all*100):0}%"></i></span><span class="dim">${done} of ${all} · <span class="pass">${n('pass')} passed</span> · <span class="fail">${n('fail')} failed</span> · <span class="skip">${n('skip')} skipped</span></span>
      <button class="btn" data-a="again">RUN AGAIN</button>${n('fail')?`<button class="btn" data-a="refail">RUN THE FAILED</button><button class="btn" data-a="file">FAILS TO BUG QUEUE</button>`:''}</div>
      ${show.map(r=>`<div class="${r.r}">${r.r==='pass'?'✓':r.r==='fail'?'✗':'–'} ${esc(tname(r.id))} — ${esc(r.why)}</div>`).join('')}${more>0?`<div class="dim" data-a="all" style="cursor:pointer">+ ${more} more (show)</div>`:R.length>10&&ALL.has(b.id)?'<div class="dim" data-a="all" style="cursor:pointer">(show fewer)</div>':''}</div>`; };
  const card=(b,op)=>`<div class="bk" data-b="${esc(b.id)}">${head(b,op)}${op?`
      <div class="sec"><h4>WHAT IT DOES</h4><div class="row"><span>JOB</span>${sel('job',JOBS,b.job)}<span>WHERE</span>${sel('place',[['','WHERE IT IS'],...places()],b.place)}<span>GOAL $</span><input data-f="goal" type="number" min="0" value="${esc(b.goal||'')}" placeholder="none" style="width:80px;${IN}"></div>${testRow(b)}</div>
      ${results(b)}
      <div class="sec"><h4>WHO IT IS</h4><div class="row"><span>NAME</span><input data-f="name" type="text" maxlength="24" value="${esc(b.name)}" style="width:160px;${IN}"><span>LOOK</span>${sel('look',[['','RANDOM'],['me','LIKE ME NOW'],...(b.look&&b.look!=='me'?[[b.look,'AS SET']]:[])],b.look)}<label><input data-f="apt" type="checkbox"${b.apt?' checked':''}> OWN APARTMENT</label></div>
        <div class="row"><span>SAYS</span><input data-f="say" type="text" maxlength="400" value="${esc(b.say||'')}" placeholder="lines it says now and then, split by |" style="flex:1;min-width:220px;${IN}"></div></div>
      <div class="sec"><h4>HEALTH AND FIGHTING</h4><div class="row"><span>HEALTH</span><input data-f="hp" type="range" min="5" max="100" value="${esc(Math.round((b.hp??1)*100))}"><label><input data-f="fight" type="checkbox"${b.fight?' checked':''}> FIGHTS BACK</label><label><input data-f="god" type="checkbox"${b.god?' checked':''}> CAN'T BE KNOCKED DOWN</label><span>FIGHT / FOLLOW</span>${sel('who',[['','NOBODY'],...people()],b.who&&b.who===ONLINE.me?'me':b.who)}</div></div>
      <div class="sec"><div class="row"><button class="btn" data-a="save">SAVE</button><button class="btn red" data-a="del">DELETE BOT</button><span class="dim">${esc(b.email||'')}</span></div></div>`:''}</div>`;
  // the tests the game lists (162h), counted by kind
  let LIST=null; const list=()=>{ if(!LIST&&TESTS.all){ LIST=[]; TESTS.all().then(L=>{ LIST=L; if(el)draw(); if(W)win(W.dataset.bot); }).catch(()=>{}); } return LIST||[]; };
  const testRow=b=>{ const L=list(), T=b.tests||[], ids=T.filter(t=>!/:$/.test(t)).length;
    return `<div class="row" data-tr style="display:${b.job==='tests'?'flex':'none'}"><span class="dim">TESTS</span>${(TESTS.cats||[]).map(([k,n])=>`<label title="${esc(n)}"><input type="checkbox" data-cat="${k}"${T.includes(k+':')?' checked':''}> ${esc(SHORT[k]||n)} ${L.filter(t=>t.cat===k).length}</label>`).join('')}${ids?`<label><input type="checkbox" data-f="keep" checked> ${ids} PICKED ONE BY ONE</label>`:''}</div>`; };
  // a call: the bot comes to where you stand (in an inside, below ground), its job kept
  const callSet=()=>({at:[+pos.x.toFixed(2),+pos.z.toFixed(2),SHARED.LVL==='down'?1:0],place:'',call:Date.now()});
  const act=async(b,body,ok)=>{ if(b)b.disabled=true; const r=await api(body); say=r.why?'not done: '+r.why:ok(r); await load(); };
  const fileFails=async(btn,x)=>{ if(!BUGS.file){ say='the bug queue is not reachable here'; return draw(); } btn.disabled=true; let n=0;
    for(const r of mine(x).filter(r=>r.r==='fail')){ const k=x.id+'|'+r.id+'|'+r.at; if(FILED.has(k))continue; try{ await BUGS.file('BOT TEST FAILED · '+tname(r.id)+': '+r.why,{bot:x.name,test:r.id,why:r.why,at:r.at}); FILED.add(k); n++; }catch(e){ say='not sent: '+(e.message||e); break; } }
    keep('bots-filed',FILED); if(n||!say.startsWith('not sent'))say=n?n+' sent to the bug queue (approve them there)':'those are in the queue already'; await load(); };
  const bind=(root,redraw)=>root.querySelectorAll('[data-b]').forEach(box=>{ const js=box.querySelector('[data-f="job"]'), tr=box.querySelector('[data-tr]'); if(js&&tr)js.onchange=()=>{ tr.style.display=js.value==='tests'?'flex':'none'; }; box.onclick=e=>{ const b=e.target.closest('[data-a]'); if(!b||!box.contains(b))return; const id=box.dataset.b, x=D.bots.find(q=>q.id===id), a=b.dataset.a, f=n=>box.querySelector(`[data-f="${n}"]`);
      if(a==='fold'){ if(e.target.closest('button'))return; if(OPEN.has(id))OPEN.delete(id); else OPEN.add(id); keep('bots-open',OPEN); redraw(); return; }
      if(a==='all'){ if(ALL.has(id))ALL.delete(id); else ALL.add(id); redraw(); return; }
      if(a==='on'){ e.stopPropagation(); act(b,{do:'botset',id,set:{on:!x.on}},()=>x.on?x.name+' turned off':x.name+' turned on'); return; }
      if(a==='again'){ act(b,{do:'botset',id,set:{job:'tests',run:Date.now()}},()=>x.name+' starts its tests again'); return; }
      if(a==='refail'){ const ids=mine(x).filter(r=>r.r==='fail').map(r=>r.id); act(b,{do:'botset',id,set:{job:'tests',tests:ids,run:Date.now()}},()=>x.name+' runs its '+ids.length+' failed tests again'); return; }
      if(a==='file'){ fileFails(b,x); return; }
      if(a==='call'){ e.stopPropagation(); act(b,{do:'botset',id,set:callSet()},()=>x.name+' is coming'); return; }
      if(a==='del'){ if(!confirm('Delete '+x.name+' and its account for good?'))return; act(b,{do:'botdel',id},()=>'deleted'); return; }
      if(a==='save'){ const look=f('look').value, set={name:f('name').value.trim(),look:look==='me'?AVATAR.code():look,job:f('job').value,who:f('who').value==='me'?ONLINE.me:f('who').value,
          goal:+f('goal').value||0,say:f('say').value.trim(),hp:(+f('hp').value||100)/100,fight:f('fight').checked,god:f('god').checked,apt:f('apt').checked};
        const pl=f('place').value; if(pl!==(x.place||'')){ set.place=pl; if(pl)set.at=null; }
        const cs=[...box.querySelectorAll('[data-cat]')]; if(cs.length){ set.tests=[...cs.filter(c=>c.checked).map(c=>c.dataset.cat+':'),...(box.querySelector('[data-f="keep"]')?.checked?(x.tests||[]).filter(t=>!/:$/.test(t)):[])]; }
        if(set.job==='tests'&&(x.job!=='tests'||JSON.stringify(set.tests||x.tests)!==JSON.stringify(x.tests)))set.run=Date.now();
        act(b,{do:'botset',id,set},()=>'saved'); } }; });
  const draw=()=>{ '@later'; if(!el)return; if(!D){ el.innerHTML='<div class="dim">...</div>'; return; } if(D.why){ el.innerHTML='<div class="dim">'+esc(D.why)+'</div>'; return; }
    const B=D.bots, n=B.filter(live).length, cf=D.cloud===null?'<span class="fail">Cloudflare is not running bots on this server</span>':D.cloud&&D.cloud.err?'<span class="fail">Cloudflare: '+esc(D.cloud.err)+'</span>':'Cloudflare OK';
    el.innerHTML=`${CSS}<div class="bots"><div class="bk" style="padding:6px 8px"><div class="row"><b>BOTS</b><span class="dim">${B.length} bot${B.length===1?'':'s'} · <span class="pass">${n} running</span> · ${cf} · about 9¢ an hour after 10 free hours a month${say?' · '+esc(say):''}</span></div>
      <div class="row"><button class="btn" id="bnew">+ SPAWN A BOT</button><label><input type="checkbox" id="bapt"> WITH ITS OWN APARTMENT</label><button class="btn" id="ball">CALL ALL</button><button class="btn" id="bon">ALL ON</button><button class="btn red" id="boff">ALL OFF</button><button class="btn" id="bfold">${B.some(b=>OPEN.has(b.id))?'FOLD ALL':'OPEN ALL'}</button><span class="dim" id="bhow" style="cursor:pointer;text-decoration:underline">${open==='how'?'hide':'run them on a PC instead'}</span></div>
      ${open==='how'?`<div class="dim" style="white-space:pre-wrap;margin:4px 0">Turn them off here first. Once: install Node (nodejs.org), save tools/bots.cjs in a folder, and in that folder run
  npm install playwright
  npx playwright install chromium
Then, while you want bots in the game:
  node bots.cjs ${esc(D.key)}
Leave that window open; Ctrl+C stops every bot.</div><div class="row"><code>${esc(D.key)}</code><button class="btn" id="bcopy">COPY KEY</button><button class="btn" id="bkey">NEW KEY</button></div>`:''}</div>
      ${B.map(b=>card(b,OPEN.has(b.id))).join('')}</div>`;
    const $=s=>el.querySelector(s); for(const f of el.querySelectorAll('input,select'))for(const ev of ['keydown','keyup'])f.addEventListener(ev,e=>e.stopPropagation());
    $('#bnew').onclick=e=>act(e.target,{do:'botnew',set:{at:[pos.x,pos.z],apt:$('#bapt').checked}},r=>{ if(r.id){ OPEN.add(r.id); keep('bots-open',OPEN); } return 'a new bot, where you stand'; });
    $('#ball').onclick=async e=>{ e.target.disabled=true; const on=D.bots.filter(b=>b.on), c=callSet(); for(const b of on)await api({do:'botset',id:b.id,set:c}); say=on.length?on.length+' coming':'no bot is on'; await load(); };
    const every=async(btn,v)=>{ btn.disabled=true; const L=D.bots.filter(b=>!!b.on!==v); for(const b of L)await api({do:'botset',id:b.id,set:{on:v}}); say=L.length?L.length+' turned '+(v?'on':'off'):'all '+(v?'on':'off')+' already'; await load(); };
    $('#bon').onclick=e=>every(e.target,true); $('#boff').onclick=e=>every(e.target,false);
    $('#bfold').onclick=()=>{ if(B.some(b=>OPEN.has(b.id)))OPEN.clear(); else for(const b of B)OPEN.add(b.id); keep('bots-open',OPEN); draw(); };
    $('#bhow').onclick=()=>{ open=open==='how'?null:'how'; draw(); };
    if($('#bcopy'))$('#bcopy').onclick=()=>{ try{ navigator.clipboard.writeText(D.key); say='key copied'; }catch(e){ say='copy it by hand'; } draw(); };
    if($('#bkey'))$('#bkey').onclick=e=>{ if(confirm('A new key stops the old one: restart the runner with the new key.'))act(e.target,{do:'botkey'},()=>'new key made'); };
    bind(el,()=>draw()); el.oninput=el.onchange=e=>{ if(e.target.matches('input,select'))el.dataset.dirty='1'; }; el.dataset.dirty='';
  };
  const IDS=new Set(); const load=async()=>{ const [d,t]=await Promise.all([api({do:'bots'}),api({do:'tests'})]); D=d; if(t&&t.tests)RES=t.tests; if(D&&D.bots){ IDS.clear(); for(const b of D.bots)IDS.add(b.id); } draw(); if(W&&!W.dataset.dirty&&!W.contains(document.activeElement))win(W.dataset.bot); };
  // a bot's own window: double-click it in the world (owners only)
  let W=null; const win=id=>{ '@later'; const b=D&&D.bots&&D.bots.find(q=>q.id===id); if(!b){ shut(); return; }
    if(!W){ W=document.createElement('div'); W.id='botwin'; W.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(620px,calc(100vw - 32px));max-height:80vh;overflow:auto;z-index:40;background:#0e1016;color:#e8ecf4;border:2px solid #3a3f4e;padding:12px 14px;font:14px/1.6 Silkscreen,monospace;letter-spacing:.5px'; document.body.appendChild(W); }
    W.dataset.bot=id; W.classList.add('bots'); W.innerHTML=`${CSS}<style>#botwin .row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:8px 0}#botwin .dim{color:#9aa3b5}#botwin b{color:#ffd27a}#botwin .btn{font:inherit;padding:4px 10px;background:#2a2f3c;color:#e8ecf4;border:2px solid #4a5163;cursor:pointer}#botwin .btn:hover{background:#3a4152}#botwin input,#botwin select{font:inherit}</style><div class="row" style="display:flex;justify-content:space-between"><b>BOT</b><button class="btn" id="bwx">X</button></div>${card(b,true).replace('data-a="fold"','')}${say?`<div class="dim">${esc(say)}</div>`:''}`;
    for(const f of W.querySelectorAll('input,select'))for(const ev of ['keydown','keyup'])f.addEventListener(ev,e=>e.stopPropagation());
    W.querySelector('#bwx').onclick=shut; bind(W,()=>win(id)); W.dataset.dirty=''; W.oninput=W.onchange=e=>{ if(e.target.matches('input,select'))W.dataset.dirty='1'; }; };
  const shut=()=>{ if(W){ W.remove(); W=null; } };
  ONLINE.botUse=o=>{ if(!o||!IDS.has(o.id))return false; (window.LOAD?LOAD('later'):Promise.resolve()).then(async()=>{ if(!D)await load(); win(o.id); }); return true; };
  // an owner learns which players are bots once the start is done
  SYS.onStart(()=>setTimeout(()=>{ (window.LOAD?LOAD('later'):Promise.resolve()).then(()=>CINEMA.isAdmin&&CINEMA.isAdmin()).then(a=>{ if(a)return api({do:'bots'}).then(r=>{ if(r&&r.bots)for(const b of r.bots)IDS.add(b.id); }); }).catch(()=>{}); },4000),'136ca-bots');
  TENANTS.bots=e=>{ el=e; D=null; draw(); load(); if(!TENANTS.bots.t)TENANTS.bots.t=setInterval(()=>{ if(el&&el.offsetParent&&!el.dataset.dirty&&!el.contains(document.activeElement))load(); },10000); }; window.TENANTS=TENANTS;   // live, but never while you are changing a bot
}
