// THE WORLD, LIVE FOR EVERYONE: the owner's world editor changes go to the server's shared file as he makes them (/shared/world-edits.json, worker/door.js) and every player loads it at start; players already in hear a ping and fetch it. A player's own edits (only what differs from the live world) go to the owner's queue (a reports row marked 'worldedit') when the editor closes; APPROVE there lays them on the live file.
import {SHARED} from './003-shx.js';
import {BUGS, ONLINE, pos, WE} from './003b-systems.js';
import {OWNED, SAVE} from './005-save.js';
import {SYS} from './006-map-pre.js';
{ const FILE='/shared/world-edits.json', get=async()=>{ const r=await fetch(FILE,{credentials:'same-origin'}); if(r.status===204)return {}; if(!r.ok)throw new Error(r.status); const j=await r.json(); return j&&typeof j==='object'&&!Array.isArray(j)?j:{}; };
  let own=false, live=null, dirty=false; try{ dirty=!!SAVE.get('we-dirty'); }catch(e){}
  const ownerP=BUGS.owner?BUGS.owner().catch(()=>false):Promise.resolve(false);
  // the first fetch holds the edits' first apply (099 waits for WE.ready), never the start: 6 s at most
  WE.ready=Promise.race([Promise.all([get().catch(()=>null),ownerP]),new Promise(r=>setTimeout(()=>r(null),6000))]).then(x=>{ if(!x)return; own=x[1]===true; if(x[0]){ live=x[0]; WE.setLive(live,!own||dirty); if(own&&dirty)push(); } });
  // who may edit: the owner, and anyone on at least their second visit (a returning player's save counts as one visit before)
  let plays=0; try{ plays=+OWNED.get('plays')||(OWNED.had?1:0); }catch(e){} SYS.onStart(()=>{ plays++; try{ OWNED.set('plays',plays); }catch(e){} },'136b-plays');
  WE.may=()=>own||plays>=2;
  // a player's change set: what differs from the world everyone has (the baked file and the live one); null puts a thing back
  const diff=st=>{ const b=Object.assign({},WE.baked?WE.baked():{},live||{}), d={}; for(const k in st)if(JSON.stringify(st[k])!==JSON.stringify(b[k])&&!(!(k in b)&&WE.blank&&WE.blank(st[k])))d[k]=st[k]; for(const k in b)if(!(k in st))d[k]=null; return d; };
  const post=(st,auto)=>{ '@later'; const n=Object.keys(st).length; return BUGS.sb('/rest/v1/bug_reports',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({id:crypto.randomUUID(),body:'WORLD EDIT — '+n+' change'+(n===1?'':'s')+(auto?' (sent on its own)':''),context:{kind:'worldedit',diff:true,count:n,edits:st,auto:!!auto,at:[+pos.x.toFixed(2),+pos.z.toFixed(2),+SHARED.py.toFixed(2)],lvl:SHARED.LVL,view:'iso'},status:'new'})}); };
  // the owner's APPROVE: the player's changes laid on the live file, for everyone
  BUGS.approveEdit=async r=>{ '@later'; const c=r.context||{}; if(c.kind!=='worldedit'||!c.diff||!c.edits)return; const cur=await get(); for(const k in c.edits){ if(c.edits[k]==null)delete cur[k]; else cur[k]=c.edits[k]; }
    const x=await fetch(FILE,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(cur)}); const o=await x.json().catch(()=>({})); if(!x.ok||!o.ok)throw new Error(o.why||x.status);
    live=cur; if(WE.setLive(cur,dirty))WE.applyAll(); if(ONLINE.put&&ONLINE.on)ONLINE.put('we',Date.now()); };
  // the owner: every change goes live a moment after he makes it; a failed send is kept and sent again at the next start
  let timer=0, sending=null, again=false; const stat=t=>{ const b=document.getElementById('wsend'); if(b)b.textContent=t; };
  const push=()=>{ '@later'; if(sending){ again=true; return; } const st=WE.getState&&WE.getState(); if(!st)return; const j=JSON.stringify(st); if(j===JSON.stringify(live||{})&&!dirty)return; stat('SAVING...');
    sending=fetch(FILE,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:j}).then(async r=>{ const o=await r.json().catch(()=>({})); if(!r.ok||!o.ok)throw new Error(o.why||r.status); live=JSON.parse(j); dirty=false; try{ SAVE.del('we-dirty'); }catch(e){} stat('LIVE FOR EVERYONE'); if(ONLINE.put&&ONLINE.on)ONLINE.put('we',Date.now()); })
      .catch(e=>{ dirty=true; try{ SAVE.set('we-dirty','1'); }catch(e){} stat('NOT SAVED — '+(e.message||'try again')); })
      .finally(()=>{ sending=null; if(again){ again=false; push(); } }); };
  WE.onsave=()=>{ if(!own)return; clearTimeout(timer); timer=setTimeout(push,1200); };
  // the others: a ping says the world changed; fetch it and show it
  let lastWe=null; SYS.add('world',(k,v)=>{ if(k!=='we'||own||v===lastWe)return; lastWe=v; (window.LOAD?LOAD('later'):Promise.resolve()).then(get).then(j=>{ live=j; if(WE.setLive(j,true))WE.applyAll(); }).catch(()=>{}); },'worldlive');
  const wire=async()=>{ const b=document.getElementById('wsend'); if(!b||b.dataset.on)return; try{ own=(await ownerP)===true; }catch(e){} if(!own){ const w=document.getElementById('wwho'); if(w)w.textContent='you see your changes now; everyone else sees them once the owner approves'; return; } b.dataset.on='1'; b.hidden=false; b.disabled=true; b.textContent=dirty?'NOT SAVED YET':'LIVE FOR EVERYONE'; };
  let last=null; try{ last=SAVE.get('we-sent'); }catch(e){}
  const auto=()=>{ '@later'; if(own){ clearTimeout(timer); push(); return; } const s0=WE.getState&&WE.getState(); if(!s0)return; const st=diff(s0), j=JSON.stringify(st); if(j===last||!Object.keys(st).length)return; last=j; try{ SAVE.set('we-sent',j); }catch(e){}
    post(st,true).catch(()=>{ last=null; try{ SAVE.del('we-sent'); }catch(e){} }); };
  { let was=false; SYS.every(()=>{ const on=!!WE.on; if(was&&!on)auto(); was=on; },1000,'136b-worldpub'); addEventListener('pagehide',()=>{ if(WE.on||own&&(timer||sending))auto(); }); }
  const w=()=>{ if(!SYS.started||!document.getElementById('wsend')){ setTimeout(w,500); return; } (window.LOAD?LOAD('later'):Promise.resolve()).then(wire).catch(()=>{}); }; w();
}
