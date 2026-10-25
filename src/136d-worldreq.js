// THE WORLD, REQUESTED: what a player changes in EDIT WORLD goes to the owner as a request (worker/door.js /world); the ones he approves in TENANTS are fetched at the start, and on each approval, and put live for everyone through WE.live.
import {SHARED} from './003-shx.js';
import {BUGS, LOOKS, ONLINE, pos, TENANTS, WE} from './003b-systems.js';
{ const LS='market-world-sent', J=v=>JSON.stringify(v);
  let SENT={}; try{ SENT=JSON.parse(localStorage.getItem(LS)||'{}')||{}; }catch(e){}
  const delta=()=>{ const P=WE.pending(), out={}; for(const k of new Set([...Object.keys(P),...Object.keys(SENT)])){ const v=k in P?P[k]:WE.now(k); if(SENT[k]!==undefined?SENT[k]!==J(v):k in P)out[k]=v; } return out; };
  const say=t=>{ const e=document.getElementById('wsay'); if(e)e.textContent=t; };
  const status=()=>{ const n=Object.keys(delta()).length, b=document.getElementById('wsend'); if(b)b.disabled=!n;
    say(n?n+' change'+(n===1?'':'s')+' only you see; sent to the owner when you close the editor':Object.keys(WE.pending()).length?'sent: waiting for the owner to approve':''); };
  let busy=false;
  WE.send=async()=>{ const D=delta(); if(!Object.keys(D).length||busy)return null; busy=true; say('sending...');
    try{ const r=await TENANTS.api('/world',{do:'send',name:((LOOKS.L&&LOOKS.L.name)||'').trim(),edits:D,at:[+pos.x.toFixed(2),+pos.z.toFixed(2),+SHARED.py.toFixed(2)],lvl:SHARED.LVL});
      if(!r.ok)throw new Error(r.why||'not sent'); for(const k in D)SENT[k]=J(D[k]); try{ localStorage.setItem(LS,J(SENT)); }catch(e){} busy=false; status(); return r; }
    catch(e){ busy=false; say('not sent: '+(e.message||e)); return null; } };
  WE.fetchLive=async()=>{ try{ if(BUGS.tok)await BUGS.tok(); }catch(e){} const r=await fetch('/world'); if(!r.ok)return 0; const E=(await r.json()).edits;
    if(!E||typeof E!=='object')return 0; WE.live(E); status(); return Object.keys(E).length; };
  const go=async()=>{ while(!window.__started)await new Promise(r=>setTimeout(r,500)); await LOAD('later');
    if(!/(?:^|;\s*)tsfm-pass=/.test(document.cookie))return;
    const b=document.getElementById('wsend'); if(b){ b.hidden=false; b.onclick=()=>WE.send(); }
    WE.changed=status; WE.closed=()=>{ WE.send(); }; addEventListener('pagehide',()=>{ if(WE.on)WE.send(); }); ONLINE.hear.world=()=>{ WE.fetchLive().catch(()=>{}); };
    WE.fetchLive().catch(()=>{}); status(); };
  go(); }
