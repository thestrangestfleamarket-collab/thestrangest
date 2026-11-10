// THE SAVE: SAVE keeps the player's saved settings and progress in one local storage key, moving old saves forward (caches and the editors' drafts keep their own keys).
// the capture mode (?capture=1; 5 Nov 2026, from Nevaland's acceptance runs): the same page every time (Math.random seeded, ?seed=; a fresh start at 13:00, CLEAR, one fixed day, offline, unless the address says otherwise) and nothing written anywhere: the save counts what it refused
const CAPTURE=(()=>{ const P=new URLSearchParams(location.search); if(!P.has('capture'))return false; let x=(+P.get('seed')||123456789)|0||1; Math.random=()=>{ x^=x<<13; x^=x>>>17; x^=x<<5; return (x>>>0)/4294967296; };
  try{ const u=new URL(location.href); for(const [k,v] of [['fresh','1'],['hour','13'],['wx','CLEAR'],['day','20000'],['online','0']])if(!u.searchParams.has(k))u.searchParams.set(k,v); history.replaceState(null,'',u); }catch(e){} return true; })();
const SAVE=(()=>{ const KEY='market-save', V=5;
  const migrate=o=>{
    if(+o.v<2){ for(const k of ['looks','walker','body','face'])delete o[k]; try{ for(const k of ['market-avatar','market-toe','market-wear','market-bodytype','market-avatarpick','market-speed'])localStorage.removeItem(k); }catch(e){} }
    if(+o.v<3){ for(const k of ['walker','body','face'])delete o[k]; try{ const m=JSON.parse(o.moves||'null'); if(m&&m.ov&&m.ov.stand){ delete m.ov.stand; o.moves=JSON.stringify(m); } }catch(e){}
      try{ for(const k of ['market-bodytype','market-avatar','market-toe'])localStorage.removeItem(k); }catch(e){} }
    if(+o.v<4){ o={}; try{ for(const k of Object.keys(localStorage))if(/^(market-|isowalk-)/.test(k)&&k!==KEY)localStorage.removeItem(k); }catch(e){} }
    if(+o.v<5){ try{ for(const [k,n] of [['cinema-snd','cinema'],['market-grid','grid'],['market-shade','shade'],['market-self','self'],['market-home','home']]){ const v=localStorage.getItem(k); if(v!=null&&o[n]==null)o[n]=v; localStorage.removeItem(k); } }catch(e){} }
    o.v=V; return o; };
  const read=()=>{ try{ const o=JSON.parse(localStorage.getItem(KEY)||'null'); if(o&&typeof o==='object'&&!Array.isArray(o)&&+o.v<=V)return migrate(o); }catch(e){} return null; };
  let blocked=0; const write=()=>{ if(CAPTURE){ blocked++; return true; } try{ localStorage.setItem(KEY,JSON.stringify(S)); return true; }catch(e){ return false; } };
  let S=read(); if(S)write();
  if(!S){ S={v:V}; write(); }
  const A={V,KEY,
    get:k=>{ const v=S[k]; return v==null?null:typeof v==='string'?v:String(v); },
    set:(k,v)=>{ S[k]=v==null?null:String(v); return write(); },
    del:k=>{ delete S[k]; return write(); },
    V, capture:CAPTURE, get blocked(){ return blocked; }, all:()=>Object.assign({},S),
    clear:()=>{ S={v:V}; try{ localStorage.removeItem(KEY); }catch(e){} }};
  return A; })();
// THE OWNED STORE: player-owned state — cash, inventory, items, mail, forage. The one seam between the game and where that state lives.
// On the website it is kept on the server (/owned, one copy for every device you log in from), read once before the game starts and written back
// a moment after each change; the browser keeps a copy too. The first time, what this browser already had goes up. The single-file page keeps it local.
const OWNED=await (async()=>{ const L={ get:k=>SAVE.get(k), set:(k,v)=>SAVE.set(k,v), del:k=>SAVE.del(k), flush:()=>{}, sync:()=>Promise.resolve(), me:null };
  if(CAPTURE||!/^https?:$/.test(location.protocol)||new URLSearchParams(location.search).has('fresh'))return L;
  const ask=(body,keep)=>{ const b=JSON.stringify(body); return fetch('/owned',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',keepalive:!!keep&&b.length<60000,body:b}); };   // (a browser drops a keepalive send over 64 KB: a bigger one goes as a plain send)
  let srv=null, me=null; try{ const r=await ask({}); if(r.ok){ const j=await r.json(); if(j&&typeof j==='object'&&'owned' in j){ srv=j.owned||{}; me=j.me&&typeof j.me==='object'?j.me:null; } } }catch(e){}
  if(!srv)return L;   // the server can't be reached: play from this browser's copy, and leave the server's alone
  const KEYS=new Set(SAVE.get('owned-keys')?SAVE.get('owned-keys').split(','):[]), first=!Object.keys(srv).length, dirty={}; let t=0, full=false;
  // what this browser changed and the server never got (offline, refused, closed too soon): kept over the server's older copy and sent again (never your money and things: the server's copy of those is the truth)
  const ECONK=new Set(['inv','bank','vault','corpse']), who=me&&me.id||'', PEND=(()=>{ try{ const o=JSON.parse(SAVE.get('owned-pend')||'null'); return o&&o.who===who&&Array.isArray(o.keys)?new Set(o.keys.filter(k=>!ECONK.has(k))):new Set(); }catch(e){ return new Set(); } })(), pend=()=>SAVE.set('owned-pend',JSON.stringify({who,keys:[...PEND]}));
  for(const k in srv)if(!PEND.has(k))SAVE.set(k,srv[k]); if(!first)for(const k of KEYS)if(!(k in srv)&&!PEND.has(k))SAVE.del(k);   // the server's copy is the truth; this browser's copy follows it (and drops what the server doesn't have: another login's)
  let last=Promise.resolve();
  const flush=keep=>{ clearTimeout(t); t=0; const all=Object.assign({},dirty); for(const k in dirty)delete dirty[k]; if(!Object.keys(all).length)return last;
    if(!keep)return last=send(all,false);
    const EK=['inv','bank','vault','corpse'], G=[], ek=EK.filter(k=>k in all); if(ek.length)G.push(ek); for(const k in all)if(!EK.includes(k))G.push([k]);   // (the money and things saved together: the server weighs them as one)
    const sz=g=>g.reduce((a,k)=>a+k.length+String(all[k]||'').length+8,0), small={}, big={}; let n=0; for(const g of G.sort((a,b)=>sz(a)-sz(b))){ const m=sz(g), to=n+m<55000?small:big; if(to===small)n+=m; for(const k of g)to[k]=all[k]; }   // (leaving the page: the small changes in the one send a browser keeps alive (64 KB), the rest after it)
    if(Object.keys(big).length)send(big,false); return last=send(small,true); };
  // what the server takes in one send (worker/door.js /owned): names of letters, digits and . _ -, up to 40; a value up to 256 KB; 80 names. One that can never go is kept on this device only, never holding back the rest
  const bad=new Set(), send=(put,keep)=>{ const EK=['inv','bank','vault','corpse'], ok=[], ek=[];
    for(const k in put){ if(!/^[a-z0-9_.-]{1,40}$/i.test(k)||put[k]!=null&&String(put[k]).length>262144){ if(!bad.has(k)){ bad.add(k); console.warn('OWNED: '+k+' is too big to send; kept on this device only'); } continue; } (EK.includes(k)?ek:ok).push(k); }
    const C=[]; let c=ek.length?ek.slice():[]; for(const k of ok){ if(c.length>=60){ C.push(c); c=[]; } c.push(k); } if(c.length)C.push(c);
    return Promise.all(C.map(ks=>send1(Object.fromEntries(ks.map(k=>[k,put[k]])),keep))); };
  const send1=(put,keep)=>{
    return ask({put},keep).then(async r=>{ if(r.status===400){ console.warn('OWNED: the server refused a save',Object.keys(put)); return; } if(r.status===413){ if(!full){ full=true; console.warn('OWNED: server save full (2 MB a player); changes kept on this device only'); try{ if(window.UI&&window.UI.log)window.UI.log('Your saved things are full — new changes are kept on this device only.','#e8a23a'); }catch(e){} } return; }
      const j=r.ok?await r.json():null; if(!j||j.ok!==true)throw 0; full=false; let ch=0; for(const k in put)if(!(k in dirty)&&PEND.delete(k))ch=1; if(ch)pend();
      if(j.clip){ const f=j.clip.fix||{}; for(const k of ['bank','vault','corpse'])if(f[k]!=null&&!(k in dirty))SAVE.set(k,f[k]); console.warn('OWNED: the server kept less than was saved',j.clip); try{ if(O.onClip)O.onClip(j.clip); }catch(e){} } }).catch(()=>{ for(const k in put)if(!(k in dirty))dirty[k]=put[k]; t=setTimeout(flush,15000); }).catch(()=>{}); };
  const note=k=>{ if(!KEYS.has(k)){ KEYS.add(k); SAVE.set('owned-keys',[...KEYS].join(',')); } };
  addEventListener('pagehide',()=>flush(true)); addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden')flush(true); });
  if(PEND.size){ for(const k of PEND){ const v=SAVE.get(k); dirty[k]=v; } t=setTimeout(flush,2000); }
  // first time on the server: once the game has read everything it owns, send up what this browser had
  if(first){ const up=()=>{ if(!window.__started)return setTimeout(up,1000); for(const k of KEYS){ const v=SAVE.get(k); if(v!=null)dirty[k]=v; } flush(); }; setTimeout(up,1000); }
  const O={ get:k=>{ note(k); return SAVE.get(k); }, set:(k,v)=>{ note(k); dirty[k]=v==null?null:String(v); if(!PEND.has(k)&&!ECONK.has(k)){ PEND.add(k); pend(); } if(!t)t=setTimeout(flush,2000); return SAVE.set(k,v); },   // (sent within 2 s of the first change, however often things change after it)
    del:k=>{ dirty[k]=null; if(!PEND.has(k)&&!ECONK.has(k)){ PEND.add(k); pend(); } if(!t)t=setTimeout(flush,2000); return SAVE.del(k); }, flush:()=>flush(true), sync:()=>flush(false), server:true, isFull:()=>full, me, had:!first, onClip:null }; return O; })();
export {OWNED, SAVE};
