// THE SAVE: SAVE keeps the player's saved settings and progress in one local storage key, moving old saves forward.
const SAVE=(()=>{ const KEY='market-save', V=4;
  const migrate=o=>{
    if(+o.v<2){ for(const k of ['looks','walker','body','face'])delete o[k]; try{ for(const k of ['market-avatar','market-toe','market-wear','market-bodytype','market-avatarpick','market-speed'])localStorage.removeItem(k); }catch(e){} }
    if(+o.v<3){ for(const k of ['walker','body','face'])delete o[k]; try{ const m=JSON.parse(o.moves||'null'); if(m&&m.ov&&m.ov.stand){ delete m.ov.stand; o.moves=JSON.stringify(m); } }catch(e){}
      try{ for(const k of ['market-bodytype','market-avatar','market-toe'])localStorage.removeItem(k); }catch(e){} }
    if(+o.v<4){ o={}; try{ for(const k of Object.keys(localStorage))if(/^(market-|isowalk-)/.test(k)&&k!==KEY)localStorage.removeItem(k); }catch(e){} }
    o.v=V; return o; };
  const read=()=>{ try{ const o=JSON.parse(localStorage.getItem(KEY)||'null'); if(o&&typeof o==='object'&&!Array.isArray(o)&&+o.v<=V)return migrate(o); }catch(e){} return null; };
  const write=()=>{ try{ localStorage.setItem(KEY,JSON.stringify(S)); return true; }catch(e){ return false; } };
  let S=read(); if(S)write();
  if(!S){ try{ for(const k of Object.keys(localStorage))if(/^(market-|isowalk-)/.test(k))localStorage.removeItem(k); }catch(e){} S={v:V}; write(); }
  const A={V,KEY,
    get:k=>{ const v=S[k]; return v==null?null:typeof v==='string'?v:String(v); },
    set:(k,v)=>{ S[k]=v==null?null:String(v); return write(); },
    del:k=>{ delete S[k]; return write(); },
    all:()=>Object.assign({},S),
    clear:()=>{ S={v:V}; try{ localStorage.removeItem(KEY); }catch(e){} }};
  return A; })();
// THE OWNED STORE: player-owned state — cash, inventory, items, mail, forage. The one seam between the game and where that state lives.
// On the website it is kept on the server (/owned, one copy for every device you log in from), read once before the game starts and written back
// a moment after each change; the browser keeps a copy too. The first time, what this browser already had goes up. The single-file page keeps it local.
const OWNED=await (async()=>{ const L={ get:k=>SAVE.get(k), set:(k,v)=>SAVE.set(k,v), del:k=>SAVE.del(k), flush:()=>{}, me:null };
  if(!/^https?:$/.test(location.protocol)||new URLSearchParams(location.search).has('fresh'))return L;
  const ask=(body,keep)=>fetch('/owned',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',keepalive:!!keep,body:JSON.stringify(body)});
  let srv=null, me=null; try{ const r=await ask({}); if(r.ok){ const j=await r.json(); if(j&&typeof j==='object'&&'owned' in j){ srv=j.owned||{}; me=j.me&&typeof j.me==='object'?j.me:null; } } }catch(e){}
  if(!srv)return L;   // the server can't be reached: play from this browser's copy, and leave the server's alone
  const KEYS=new Set(SAVE.get('owned-keys')?SAVE.get('owned-keys').split(','):[]), first=!Object.keys(srv).length, dirty={}; let t=0, full=false;
  for(const k in srv)SAVE.set(k,srv[k]); if(!first)for(const k of KEYS)if(!(k in srv))SAVE.del(k);   // the server's copy is the truth; this browser's copy follows it (and drops what the server doesn't have: another login's)
  const flush=keep=>{ clearTimeout(t); const put=Object.assign({},dirty); for(const k in dirty)delete dirty[k]; if(!Object.keys(put).length)return;
    ask({put},keep).then(async r=>{ if(r.status===413){ if(!full){ full=true; console.warn('OWNED: server save full (2 MB a player); changes kept on this device only'); try{ if(window.UI&&window.UI.log)window.UI.log('Your saved things are full — new changes are kept on this device only.','#e8a23a'); }catch(e){} } return; }
      const j=r.ok?await r.json():null; if(!j||j.ok!==true)throw 0; full=false; }).catch(()=>{ for(const k in put)if(!(k in dirty))dirty[k]=put[k]; t=setTimeout(flush,15000); }); };
  const note=k=>{ if(!KEYS.has(k)){ KEYS.add(k); SAVE.set('owned-keys',[...KEYS].join(',')); } };
  addEventListener('pagehide',()=>flush(true)); addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden')flush(true); });
  // first time on the server: once the game has read everything it owns, send up what this browser had
  if(first){ const up=()=>{ if(!window.__started)return setTimeout(up,1000); for(const k of KEYS){ const v=SAVE.get(k); if(v!=null)dirty[k]=v; } flush(); }; setTimeout(up,1000); }
  return { get:k=>{ note(k); return SAVE.get(k); }, set:(k,v)=>{ note(k); dirty[k]=v==null?null:String(v); clearTimeout(t); t=setTimeout(flush,2000); return SAVE.set(k,v); },
    del:k=>{ dirty[k]=null; clearTimeout(t); t=setTimeout(flush,2000); return SAVE.del(k); }, flush:()=>flush(true), server:true, isFull:()=>full, me }; })();
export {OWNED, SAVE};
