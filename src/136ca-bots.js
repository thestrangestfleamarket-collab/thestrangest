// THE BOTS PANEL: the owner's test players in TENANTS (spawn, set each one's name, look, place, job, health and fighting; worker/door.js bots, run by tools/bots.cjs).
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
  const card=(b,op)=>{ const s=b.status, on=s&&Date.now()-s.seen<60000; return `<div data-b="${esc(b.id)}" style="border:2px solid var(--line);padding:6px 8px;margin:6px 0">
        <div class="row"><b>${esc(b.name)}</b><span>· ${esc((JOBS.find(j=>j[0]===b.job)||['',b.job])[1])}</span>${b.on?(on?'<span style="color:#7fdc8a">· RUNNING</span>':'<span class="dim">· starting</span>'):'<span class="dim">· OFF</span>'}</div>
        ${s?`<div class="dim" style="margin:2px 0 4px">now: ${esc(s.doing||'')}${s.cash!=null?' · $'+esc(s.cash):''}${s.hp!=null?' · health '+esc(Math.round(s.hp*100))+'%':''}${s.tests?' · tests '+esc(s.tests.pass)+' passed, '+esc(s.tests.fail)+' failed, '+esc(s.tests.skip)+' skipped, '+esc(s.tests.left)+' to go':''} · ${esc(ago(s.seen))}</div>`:''}
        <div class="row"><button class="btn" data-a="call">CALL</button><button class="btn" data-a="on">${b.on?'TURN OFF':'TURN ON'}</button><button class="btn" data-a="edit">${op?'CLOSE':'SET'}</button></div>
        ${op?`<div class="row"><span>NAME</span><input data-f="name" type="text" maxlength="24" value="${esc(b.name)}" style="width:160px;${IN}"><span>LOOK</span>${sel('look',[['','RANDOM'],['me','LIKE ME NOW'],...(b.look&&b.look!=='me'?[[b.look,'AS SET']]:[])],b.look)}</div>
          <div class="row"><span>JOB</span>${sel('job',JOBS,b.job)}<span>WHO</span>${sel('who',[['','NOBODY'],...people()],b.who&&b.who===ONLINE.me?'me':b.who)}<span>GOAL $</span><input data-f="goal" type="number" min="0" value="${esc(b.goal||'')}" placeholder="none" style="width:80px;${IN}"></div>
          ${testRow(b)}
          <div class="row"><span>WHERE</span>${sel('place',[['','WHERE IT IS'],...places()],b.place)}<span class="dim">${b.at?'at '+esc(b.at.map(v=>v.toFixed(1)).join(', ')):''}</span></div>
          <div class="row"><span>SAYS</span><input data-f="say" type="text" maxlength="400" value="${esc(b.say||'')}" placeholder="lines it says now and then, split by |" style="flex:1;min-width:220px;${IN}"></div>
          <div class="row"><span>HEALTH</span><input data-f="hp" type="range" min="5" max="100" value="${esc(Math.round((b.hp??1)*100))}"><label><input data-f="fight" type="checkbox"${b.fight?' checked':''}> FIGHTS BACK</label><label><input data-f="god" type="checkbox"${b.god?' checked':''}> CAN'T BE KNOCKED DOWN</label><label><input data-f="apt" type="checkbox"${b.apt?' checked':''}> OWN APARTMENT</label></div>
          <div class="row"><button class="btn" data-a="save">SAVE</button><button class="btn" data-a="del">DELETE BOT</button><span class="dim">${esc(b.email||'')}</span></div>`:''}</div>`; };
  // the tests the game lists (162h), counted by kind
  let LIST=null; const list=()=>{ if(!LIST&&TESTS.all){ LIST=[]; TESTS.all().then(L=>{ LIST=L; if(el)draw(); if(W)win(W.dataset.bot); if(tel)tdraw(); }).catch(()=>{}); } return LIST||[]; };
  const testRow=b=>{ const L=list(), T=b.tests||[], ids=T.filter(t=>!/:$/.test(t)).length;
    return `<div class="row" data-tr style="display:${b.job==='tests'?'flex':'none'}"><span>TESTS</span>${(TESTS.cats||[]).map(([k,n])=>`<label><input type="checkbox" data-cat="${k}"${T.includes(k+':')?' checked':''}> ${esc(n)} (${L.filter(t=>t.cat===k).length})</label>`).join('')}${ids?`<label><input type="checkbox" data-f="keep" checked> ${ids} PICKED IN ADMIN > TESTS</label>`:''}<button class="btn" data-a="again">RUN AGAIN</button></div>`; };
  // a call: the bot comes to where you stand (in an inside, below ground), its job kept
  const callSet=()=>({at:[+pos.x.toFixed(2),+pos.z.toFixed(2),SHARED.LVL==='down'?1:0],place:'',call:Date.now()});
  const act=async(b,body,ok)=>{ if(b)b.disabled=true; const r=await api(body); say=r.why?'not done: '+r.why:ok(r); await load(); };
  const bind=(root,redraw)=>root.querySelectorAll('[data-b]').forEach(box=>{ const js=box.querySelector('[data-f="job"]'), tr=box.querySelector('[data-tr]'); if(js&&tr)js.onchange=()=>{ tr.style.display=js.value==='tests'?'flex':'none'; }; box.onclick=e=>{ const b=e.target.closest('[data-a]'); if(!b)return; const id=box.dataset.b, x=D.bots.find(q=>q.id===id), a=b.dataset.a, f=n=>box.querySelector(`[data-f="${n}"]`);
      if(a==='edit'){ open=open===id?null:id; redraw(); return; }
      if(a==='on'){ act(b,{do:'botset',id,set:{on:!x.on}},()=>x.on?'turned off':'turned on'); return; }
      if(a==='again'){ act(b,{do:'botset',id,set:{run:Date.now()}},()=>x.name+' starts its tests again'); return; }
      if(a==='call'){ act(b,{do:'botset',id,set:callSet()},()=>x.name+' is coming'); return; }
      if(a==='del'){ if(!confirm('Delete '+x.name+' and its account for good?'))return; act(b,{do:'botdel',id},()=>'deleted'); return; }
      if(a==='save'){ const look=f('look').value, set={name:f('name').value.trim(),look:look==='me'?AVATAR.code():look,job:f('job').value,who:f('who').value==='me'?ONLINE.me:f('who').value,
          goal:+f('goal').value||0,say:f('say').value.trim(),hp:(+f('hp').value||100)/100,fight:f('fight').checked,god:f('god').checked,apt:f('apt').checked};
        const pl=f('place').value; if(pl!==(x.place||'')){ set.place=pl; if(pl)set.at=null; }
        const cs=[...box.querySelectorAll('[data-cat]')]; if(cs.length){ set.tests=[...cs.filter(c=>c.checked).map(c=>c.dataset.cat+':'),...(box.querySelector('[data-f="keep"]')?.checked?(x.tests||[]).filter(t=>!/:$/.test(t)):[])]; }
        if(set.job==='tests'&&(x.job!=='tests'||JSON.stringify(set.tests||x.tests)!==JSON.stringify(x.tests)))set.run=Date.now();
        act(b,{do:'botset',id,set},()=>'saved'); } }; });
  const draw=()=>{ '@later'; if(!el)return; if(!D){ el.innerHTML='<div class="dim">...</div>'; return; } if(D.why){ el.innerHTML='<div class="dim">'+esc(D.why)+'</div>'; return; }
    const B=D.bots, live=B.filter(b=>b.status&&Date.now()-b.status.seen<60000).length;
    el.innerHTML=`<div class="dim">Test players that play the game by themselves, on Cloudflare: a bot that is ON is running, OFF stops it. ${B.length} bots · ${live} running${say?' · '+esc(say):''}</div>
      ${D.cloud&&D.cloud.err?`<div style="color:#e06a5a">CLOUDFLARE: ${esc(D.cloud.err)}</div>`:''}${D.cloud===null?'<div class="dim">Cloudflare is not running bots on this server.</div>':''}
      <div class="row"><button class="btn" id="bnew">SPAWN A BOT</button><label><input type="checkbox" id="bapt"> WITH ITS OWN APARTMENT</label><button class="btn" id="ball">CALL ALL</button><button class="btn" id="bhow">${open==='how'?'HIDE':'COST AND OTHER WAYS'}</button></div>
      ${open==='how'?`<div class="dim" style="white-space:pre-wrap;margin:4px 0">On Cloudflare all the bots share one browser. Cloudflare's paid Workers plan includes 10 browser hours a month, then about 9 cents an hour; the free plan stops after 10 minutes a day. Turn bots OFF when you are done.

Or run them on a PC instead (turn them off here first). Once: install Node (nodejs.org), save tools/bots.cjs in a folder, and in that folder run
  npm install playwright
  npx playwright install chromium
Then, while you want bots in the game:
  node bots.cjs ${esc(D.key)}
Leave that window open; Ctrl+C stops every bot.</div><div class="row"><code>${esc(D.key)}</code><button class="btn" id="bcopy">COPY KEY</button><button class="btn" id="bkey">NEW KEY</button></div>`:''}
      ${B.map(b=>card(b,open===b.id)).join('')}`;
    const $=s=>el.querySelector(s); for(const f of el.querySelectorAll('input,select'))for(const ev of ['keydown','keyup'])f.addEventListener(ev,e=>e.stopPropagation());
    $('#bnew').onclick=e=>act(e.target,{do:'botnew',set:{at:[pos.x,pos.z],apt:$('#bapt').checked}},r=>{ open=r.id; return 'a new bot, where you stand'; });
    $('#ball').onclick=async e=>{ e.target.disabled=true; const on=D.bots.filter(b=>b.on), c=callSet(); for(const b of on)await api({do:'botset',id:b.id,set:c}); say=on.length?on.length+' coming':'no bot is on'; await load(); };
    $('#bhow').onclick=()=>{ open=open==='how'?null:'how'; draw(); };
    if($('#bcopy'))$('#bcopy').onclick=()=>{ try{ navigator.clipboard.writeText(D.key); say='key copied'; }catch(e){ say='copy it by hand'; } draw(); };
    if($('#bkey'))$('#bkey').onclick=e=>{ if(confirm('A new key stops the old one: restart the runner with the new key.'))act(e.target,{do:'botkey'},()=>'new key made'); };
    bind(el,()=>draw());
  };
  const IDS=new Set(); const load=async()=>{ D=await api({do:'bots'}); if(D&&D.bots){ IDS.clear(); for(const b of D.bots)IDS.add(b.id); } draw(); if(W)win(W.dataset.bot); };
  // a bot's own window: double-click it in the world (owners only)
  let W=null; const win=id=>{ '@later'; const b=D&&D.bots&&D.bots.find(q=>q.id===id); if(!b){ shut(); return; }
    if(!W){ W=document.createElement('div'); W.id='botwin'; W.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(620px,calc(100vw - 32px));max-height:80vh;overflow:auto;z-index:40;background:#0e1016;color:#e8ecf4;border:2px solid #3a3f4e;padding:12px 14px;font:14px/1.6 Silkscreen,monospace;letter-spacing:.5px'; document.body.appendChild(W); }
    W.dataset.bot=id; W.innerHTML=`<style>#botwin .row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:8px 0}#botwin .dim{color:#9aa3b5}#botwin b{color:#ffd27a}#botwin .btn{font:inherit;padding:4px 10px;background:#2a2f3c;color:#e8ecf4;border:2px solid #4a5163;cursor:pointer}#botwin .btn:hover{background:#3a4152}#botwin input,#botwin select{font:inherit}</style><div class="row" style="display:flex;justify-content:space-between"><b>BOT</b><button class="btn" id="bwx">X</button></div>${card(b,true)}${say?`<div class="dim">${esc(say)}</div>`:''}`;
    for(const f of W.querySelectorAll('input,select'))for(const ev of ['keydown','keyup'])f.addEventListener(ev,e=>e.stopPropagation());
    W.querySelector('#bwx').onclick=shut; bind(W,()=>win(id)); };
  const shut=()=>{ if(W){ W.remove(); W=null; } };
  ONLINE.botUse=o=>{ if(!o||!IDS.has(o.id))return false; (window.LOAD?LOAD('later'):Promise.resolve()).then(async()=>{ if(!D)await load(); win(o.id); }); return true; };
  // an owner learns which players are bots once the start is done
  SYS.onStart(()=>setTimeout(()=>{ (window.LOAD?LOAD('later'):Promise.resolve()).then(()=>CINEMA.isAdmin&&CINEMA.isAdmin()).then(a=>{ if(a)return api({do:'bots'}).then(r=>{ if(r&&r.bots)for(const b of r.bots)IDS.add(b.id); }); }).catch(()=>{}); },4000),'136ca-bots');
  /* ---------- ADMIN > TESTS: every test, its last result, run the picked ones split over the bots that are on ---------- */
  let tel=null, TR=null, tsay='', pick=new Set(), topen=new Set();
  const tload=async()=>{ const [r,b]=await Promise.all([api({do:'tests'}),api({do:'bots'})]); TR=r&&r.tests?new Map(r.tests.map(x=>[x.id,x])):TR||new Map(); if(b&&b.bots)D=b; tdraw(); };
  const COL={pass:'#7fdc8a',fail:'#e06a5a',skip:'#c8b070'};
  const tdraw=()=>{ '@later'; if(!tel)return; const L=list(), R=TR||new Map(), on=D&&D.bots?D.bots.filter(b=>b.on):[], n=k=>L.filter(t=>R.get(t.id)&&R.get(t.id).r===k).length;
    const runs=on.filter(b=>b.job==='tests'&&b.status&&b.status.tests).map(b=>esc(b.name)+': '+esc(b.status.tests.left)+' to go').join(' · ');
    tel.innerHTML=`<div class="dim">${L.length} tests, made by the game from its own places, shops, skills, pets and games. A bot plays each like a player. Last results: <span style="color:${COL.pass}">${n('pass')} passed</span> · <span style="color:${COL.fail}">${n('fail')} failed</span> · <span style="color:${COL.skip}">${n('skip')} skipped</span> · ${L.length-n('pass')-n('fail')-n('skip')} not run${runs?'<br>running: '+runs:''}${tsay?'<br>'+esc(tsay):''}</div>
      <div class="row"><button class="btn" id="trun">RUN PICKED (${pick.size}) ON ${on.length} BOT${on.length===1?'':'S'}</button><button class="btn" id="tfail">PICK THE FAILED</button><button class="btn" id="tnone">PICK NONE</button><button class="btn" id="tre">REFRESH</button><button class="btn" id="tclr">CLEAR RESULTS</button></div>
      ${(TESTS.cats||[]).map(([k,nm])=>{ const C=L.filter(t=>t.cat===k), all=C.length&&C.every(t=>pick.has(t.id)), f=C.filter(t=>R.get(t.id)&&R.get(t.id).r==='fail').length, p=C.filter(t=>R.get(t.id)&&R.get(t.id).r==='pass').length;
        return `<div style="border:2px solid var(--line);padding:4px 8px;margin:6px 0"><div class="row"><label><input type="checkbox" data-tc="${k}"${all?' checked':''}> <b>${esc(nm)}</b></label><span class="dim">${C.length} · <span style="color:${COL.pass}">${p} passed</span> · <span style="color:${COL.fail}">${f} failed</span></span><button class="btn" data-to="${k}">${topen.has(k)?'HIDE':'SHOW'}</button></div>
          ${topen.has(k)?C.map(t=>{ const x=R.get(t.id); return `<div class="row" style="margin:2px 0"><label><input type="checkbox" data-ti="${esc(t.id)}"${pick.has(t.id)?' checked':''}> ${esc(t.name)}</label>${x?`<span style="color:${COL[x.r]}">${x.r.toUpperCase()}</span><span class="dim">${esc(x.why)} · ${esc(ago(x.at))}</span>`:'<span class="dim">not run</span>'}</div>`; }).join(''):''}</div>`; }).join('')}`;
    const $=q=>tel.querySelector(q);
    tel.querySelectorAll('[data-tc]').forEach(c=>c.onchange=()=>{ for(const t of L)if(t.cat===c.dataset.tc){ if(c.checked)pick.add(t.id); else pick.delete(t.id); } tdraw(); });
    tel.querySelectorAll('[data-ti]').forEach(c=>c.onchange=()=>{ if(c.checked)pick.add(c.dataset.ti); else pick.delete(c.dataset.ti); tdraw(); });
    tel.querySelectorAll('[data-to]').forEach(b=>b.onclick=()=>{ const k=b.dataset.to; if(topen.has(k))topen.delete(k); else topen.add(k); tdraw(); });
    $('#tfail').onclick=()=>{ pick=new Set(L.filter(t=>R.get(t.id)&&R.get(t.id).r==='fail').map(t=>t.id)); tdraw(); };
    $('#tnone').onclick=()=>{ pick.clear(); tdraw(); };
    $('#tre').onclick=()=>tload();
    $('#tclr').onclick=async()=>{ if(!confirm('Clear every test result?'))return; await api({do:'testclear'}); tsay='results cleared'; tload(); };
    $('#trun').onclick=async e=>{ if(!pick.size){ tsay='pick some tests first'; tdraw(); return; } if(!on.length){ tsay='turn a bot on first (ADMIN > TENANTS > BOTS)'; tdraw(); return; } e.target.disabled=true;
      // cheap ones first; the rest dealt round the bots, so each gets a share of every kind
      const ids=L.filter(t=>pick.has(t.id)).map(t=>t.id), share=on.map(()=>[]); ids.forEach((id,i)=>share[i%on.length].push(id)); const run=Date.now();
      for(let i=0;i<on.length;i++)await api({do:'botset',id:on[i].id,set:{job:'tests',tests:share[i].slice(0,800),run}});
      tsay=ids.length+' tests sent to '+on.length+' bot'+(on.length===1?'':'s')+(ids.length>800*on.length?' (800 a bot at most: turn more on for the rest)':''); tload(); };
  };
  TENANTS.tests=e=>{ '@later'; tel=e; list(); tdraw(); tload(); if(!TENANTS.tests.t)TENANTS.tests.t=setInterval(()=>{ if(tel&&tel.offsetParent)tload(); },15000); };
  TENANTS.bots=e=>{ el=e; D=null; draw(); load(); }; window.TENANTS=TENANTS;
}
