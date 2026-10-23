// THE WORLD, SENT TO CLAUDE: the world editor's SEND TO SERVER submits its changes as an update (a reports row marked 'worldedit') for a later Claude session to bake into the game. Owner only.
import {BUGS, WE} from './003b-systems.js';
{ const send=async b=>{ '@later'; const st=WE.getState&&WE.getState(); if(!st)return; const n=Object.keys(st).length;
    if(!confirm('Send these '+n+' world change'+(n===1?'':'s')+' to the server for Claude to bake in?'))return;
    b.disabled=true; const t0=b.textContent; b.textContent='SENDING...';
    try{ await BUGS.sb('/rest/v1/bug_reports',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({id:crypto.randomUUID(),body:'WORLD EDIT — '+n+' change'+(n===1?'':'s'),context:{kind:'worldedit',count:n,edits:st},status:'new'})}); b.textContent='SENT'; }
    catch(e){ b.textContent='FAILED — '+(e.message||'try again'); }
    setTimeout(()=>{ b.textContent=t0; b.disabled=false; },2500); };
  const wire=async()=>{ const b=document.getElementById('wsend'); if(!b||b.dataset.on)return; let own=false; try{ own=await BUGS.owner(); }catch(e){} if(!own)return; b.dataset.on='1'; b.hidden=false; b.onclick=()=>send(b); };
  const w=()=>{ if(!window.__started||!document.getElementById('wsend')){ setTimeout(w,500); return; } (window.LOAD?LOAD('later'):Promise.resolve()).then(wire).catch(()=>{}); }; w();
}
