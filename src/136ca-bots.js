// THE BOTS PANEL: the owner's test players in TENANTS (spawn, set each one's name, look, place, job, health and fighting; worker/door.js bots, run by tools/bots.cjs).
import {BUGS, ONLINE, pos, TENANTS, TEXT, UI} from './003b-systems.js';
import {AVATAR} from './111c-avatar.js';
{ const esc=TEXT.esc;
  const JOBS=[['stand','STAND STILL'],['wander','WANDER'],['follow','FOLLOW SOMEONE'],['goto','GO TO A PLACE'],['sit','SIT ON A BENCH'],['fish','FISH (AND SELL)'],['mushrooms','MUSHROOMS FOR MONEY'],['decorate','DECORATE ITS APARTMENT'],['fight','FIGHT SOMEONE'],['chat','CHAT']];
  const IN='font:inherit;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;padding:4px';
  const api=async body=>{ '@later'; try{ if(BUGS.tok)await BUGS.tok(); }catch(e){}
    let r; try{ r=await fetch('/admin',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({room:ONLINE.room,...body})}); }catch(e){ return {why:'the server did not answer'}; } let j={}; try{ j=await r.json(); }catch(e){} if(!r.ok&&!j.why)j.why='the server said '+r.status; return j; };
  const ago=t=>{ const s=Math.round((Date.now()-t)/1000); return s<90?s+' s ago':Math.round(s/60)+' min ago'; };
  let el=null, D=null, say='', open=null;
  const people=()=>{ const o=[['me','ME ('+(ONLINE.myName?ONLINE.myName():'you')+')']]; for(const [id,p] of ONLINE.others||[])o.push([id,(p.name||id).slice(0,24)]); return o; };
  const places=()=>{ try{ return [...new Set(['YOUR APARTMENT',...UI.places().map(p=>p[0])])].map(n=>[n,n]); }catch(e){ return []; } };
  const sel=(f,list,v)=>`<select data-f="${f}" style="${IN}">${list.map(([k,n])=>`<option value="${esc(k)}"${k===v?' selected':''}>${esc(n)}</option>`).join('')}</select>`;
  const draw=()=>{ '@later'; if(!el)return; if(!D){ el.innerHTML='<h3>BOTS</h3><div class="dim">...</div>'; return; } if(D.why){ el.innerHTML='<h3>BOTS</h3><div class="dim">'+esc(D.why)+'</div>'; return; }
    const B=D.bots, live=B.filter(b=>b.status&&Date.now()-b.status.seen<20000).length;
    el.innerHTML=`<h3>BOTS</h3><div class="dim">Test players that play the game on your PC. ${B.length} bots · ${live} running${say?' · '+esc(say):''}</div>
      <div class="row"><button class="btn" id="bnew">SPAWN A BOT</button><button class="btn" id="bhow">${open==='how'?'HIDE':'HOW TO RUN THEM'}</button></div>
      ${open==='how'?`<div class="dim" style="white-space:pre-wrap;margin:4px 0">On your PC, once: install Node (nodejs.org), save tools/bots.cjs in a folder, and in that folder run
  npm install playwright
  npx playwright install chromium
Then, while you want bots in the game:
  node bots.cjs ${esc(D.key)}
Leave that window open; Ctrl+C stops every bot.</div><div class="row"><code>${esc(D.key)}</code><button class="btn" id="bcopy">COPY KEY</button><button class="btn" id="bkey">NEW KEY</button></div>`:''}
      ${B.map(b=>{ const s=b.status, on=s&&Date.now()-s.seen<20000; return `<div data-b="${esc(b.id)}" style="border:2px solid var(--line);padding:6px 8px;margin:6px 0">
        <div class="row"><b>${esc(b.name)}</b><span class="dim">${esc((JOBS.find(j=>j[0]===b.job)||['',b.job])[1])}</span>${b.on?(on?'<span style="color:#7fdc8a">RUNNING</span>':'<span class="dim">waiting for your PC</span>'):'<span class="dim">OFF</span>'}
          ${s?`<span class="dim">${esc(s.doing||'')}${s.cash!=null?' · $'+esc(s.cash):''}${s.hp!=null?' · health '+esc(Math.round(s.hp*100))+'%':''} · ${esc(ago(s.seen))}</span>`:''}
          <button class="btn" data-a="on">${b.on?'TURN OFF':'TURN ON'}</button><button class="btn" data-a="edit">${open===b.id?'CLOSE':'SET'}</button></div>
        ${open===b.id?`<div class="row"><span>NAME</span><input data-f="name" type="text" maxlength="24" value="${esc(b.name)}" style="width:160px;${IN}"><span>LOOK</span>${sel('look',[['','RANDOM'],['me','LIKE ME NOW'],...(b.look&&b.look!=='me'?[[b.look,'AS SET']]:[])],b.look)}</div>
          <div class="row"><span>JOB</span>${sel('job',JOBS,b.job)}<span>WHO</span>${sel('who',[['','NOBODY'],...people()],b.who&&b.who===ONLINE.me?'me':b.who)}<span>GOAL $</span><input data-f="goal" type="number" min="0" value="${esc(b.goal||'')}" placeholder="none" style="width:80px;${IN}"></div>
          <div class="row"><span>WHERE</span>${sel('place',[['','WHERE IT IS'],...places()],b.place)}<button class="btn" data-a="here">HERE (WHERE I STAND)</button><span class="dim">${b.at?'at '+esc(b.at.map(v=>v.toFixed(1)).join(', ')):''}</span></div>
          <div class="row"><span>SAYS</span><input data-f="say" type="text" maxlength="400" value="${esc(b.say||'')}" placeholder="lines it says now and then, split by |" style="flex:1;min-width:220px;${IN}"></div>
          <div class="row"><span>HEALTH</span><input data-f="hp" type="range" min="5" max="100" value="${esc(Math.round((b.hp??1)*100))}"><label><input data-f="fight" type="checkbox"${b.fight?' checked':''}> FIGHTS BACK</label><label><input data-f="god" type="checkbox"${b.god?' checked':''}> CAN'T BE KNOCKED DOWN</label></div>
          <div class="row"><button class="btn" data-a="save">SAVE</button><button class="btn" data-a="del">DELETE BOT</button><span class="dim">${esc(b.email||'')}</span></div>`:''}</div>`; }).join('')}`;
    const $=s=>el.querySelector(s); for(const f of el.querySelectorAll('input,select'))for(const ev of ['keydown','keyup'])f.addEventListener(ev,e=>e.stopPropagation());
    const act=async(b,body,ok)=>{ if(b)b.disabled=true; const r=await api(body); say=r.why?'not done: '+r.why:ok(r); await load(); };
    $('#bnew').onclick=e=>act(e.target,{do:'botnew',set:{at:[pos.x,pos.z]}},r=>{ open=r.id; return 'a new bot, where you stand'; });
    $('#bhow').onclick=()=>{ open=open==='how'?null:'how'; draw(); };
    if($('#bcopy'))$('#bcopy').onclick=()=>{ try{ navigator.clipboard.writeText(D.key); say='key copied'; }catch(e){ say='copy it by hand'; } draw(); };
    if($('#bkey'))$('#bkey').onclick=e=>{ if(confirm('A new key stops the old one: restart the runner with the new key.'))act(e.target,{do:'botkey'},()=>'new key made'); };
    el.querySelectorAll('[data-b]').forEach(box=>box.onclick=e=>{ const b=e.target.closest('[data-a]'); if(!b)return; const id=box.dataset.b, x=D.bots.find(q=>q.id===id), a=b.dataset.a, f=n=>box.querySelector(`[data-f="${n}"]`);
      if(a==='edit'){ open=open===id?null:id; draw(); return; }
      if(a==='on'){ act(b,{do:'botset',id,set:{on:!x.on}},()=>x.on?'turned off':'turned on'); return; }
      if(a==='here'){ act(b,{do:'botset',id,set:{at:[pos.x,pos.z],place:''}},()=>'it goes where you stand'); return; }
      if(a==='del'){ if(!confirm('Delete '+x.name+' and its account for good?'))return; act(b,{do:'botdel',id},()=>'deleted'); return; }
      if(a==='save'){ const look=f('look').value, set={name:f('name').value.trim(),look:look==='me'?AVATAR.code():look,job:f('job').value,who:f('who').value==='me'?ONLINE.me:f('who').value,
          goal:+f('goal').value||0,say:f('say').value.trim(),hp:(+f('hp').value||100)/100,fight:f('fight').checked,god:f('god').checked};
        const pl=f('place').value; if(pl!==(x.place||'')){ set.place=pl; if(pl)set.at=null; }
        act(b,{do:'botset',id,set},()=>'saved'); } }); };
  const load=async()=>{ D=await api({do:'bots'}); draw(); };
  TENANTS.bots=e=>{ el=e; D=null; draw(); load(); }; window.TENANTS=TENANTS;
}
