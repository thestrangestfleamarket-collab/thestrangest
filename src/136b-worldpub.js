// THE WORLD, PUBLISHED: lays the server's world edits over the game at the start for every player, and gives the owner a SEND TO SERVER button in the world editor.
import {BUGS, WE} from './003b-systems.js';
{ const ROW='/rest/v1/world_edits', ID='A';
  const pull=async()=>{ '@later'; try{ const r=await BUGS.sb(ROW+'?select=edits&id=eq.'+ID), rows=await r.json(); if(rows&&rows[0]&&rows[0].edits)WE.applyServer(rows[0].edits); }catch(e){} };
  const go=()=>{ if(!window.__started){ setTimeout(go,300); return; } pull(); }; go();
  const send=async b=>{ const st=WE.getState&&WE.getState(); if(!st)return; if(!confirm('Send the world to the server? Every player will see these changes.'))return;
    b.disabled=true; const t0=b.textContent; b.textContent='SENDING...';
    try{ await BUGS.sb(ROW+'?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:ID,edits:st,updated_at:new Date().toISOString()})}); b.textContent='SENT'; }
    catch(e){ b.textContent='FAILED — '+(e.message||'try again'); }
    setTimeout(()=>{ b.textContent=t0; b.disabled=false; },2500); };
  const wire=async()=>{ const b=document.getElementById('wsend'); if(!b||b.dataset.on)return; let own=false; try{ own=await BUGS.owner(); }catch(e){} if(!own)return; b.dataset.on='1'; b.hidden=false; b.onclick=()=>send(b); };
  const w=()=>{ if(!window.__started||!document.getElementById('wsend')){ setTimeout(w,500); return; } wire(); }; w();
}
