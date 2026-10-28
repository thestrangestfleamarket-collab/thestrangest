// THE WORLD, SENT TO CLAUDE: every world editor change goes to the owner's queue on its own (a reports row marked 'worldedit', status new) when the editor closes or the page is left mid-edit; SEND TO SERVER (owner only) sends it now.
import {BUGS, WE} from './003b-systems.js';
import {SAVE} from './005-save.js';
{ const post=(st,auto)=>{ const n=Object.keys(st).length; return BUGS.sb('/rest/v1/bug_reports',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({id:crypto.randomUUID(),body:'WORLD EDIT — '+n+' change'+(n===1?'':'s')+(auto?' (sent on its own)':''),context:{kind:'worldedit',count:n,edits:st,auto:!!auto},status:'new'})}); };
  const send=async b=>{ '@later'; const st=WE.getState&&WE.getState(); if(!st)return; const n=Object.keys(st).length;
    if(!confirm('Send these '+n+' world change'+(n===1?'':'s')+' to the server for Claude to bake in?'))return;
    b.disabled=true; const t0=b.textContent; b.textContent='SENDING...';
    try{ await post(st); last=JSON.stringify(st); try{ SAVE.set('we-sent',last); }catch(e){} b.textContent='SENT'; }
    catch(e){ b.textContent='FAILED — '+(e.message||'try again'); }
    setTimeout(()=>{ b.textContent=t0; b.disabled=false; },2500); };
  const wire=async()=>{ const b=document.getElementById('wsend'); if(!b||b.dataset.on)return; let own=false; try{ own=await BUGS.owner(); }catch(e){} if(!own)return; b.dataset.on='1'; b.hidden=false; b.onclick=()=>send(b); };
  let last=null; try{ last=SAVE.get('we-sent'); }catch(e){}
  const auto=()=>{ const st=WE.getState&&WE.getState(); if(!st)return; const j=JSON.stringify(st); if(j===last||last==null&&!Object.keys(st).length)return; last=j; try{ SAVE.set('we-sent',j); }catch(e){}
    post(st,true).catch(()=>{ last=null; try{ SAVE.del('we-sent'); }catch(e){} }); };
  { let was=false; setInterval(()=>{ const on=!!WE.on; if(was&&!on)auto(); was=on; },1000); addEventListener('pagehide',()=>{ if(WE.on)auto(); }); }
  const w=()=>{ if(!window.__started||!document.getElementById('wsend')){ setTimeout(w,500); return; } (window.LOAD?LOAD('later'):Promise.resolve()).then(wire).catch(()=>{}); }; w();
}
