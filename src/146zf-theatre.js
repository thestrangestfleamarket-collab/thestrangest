// THE MOVIE THEATRE, EMPTY: only the screen (owner, 9 Nov 2026); nobody works or sits there.
import {STORE, SYS} from './006-map-pre.js';
{ const room=()=>(STORE.rooms||[]).find(r=>r.id==='theatre');
  let done=false; const go=()=>{ if(done)return; const R=room(); if(R){ R.spots={}; R.seats=[]; done=true; } }; go(); SYS.add('life',go,'146zf-theatre'); }
