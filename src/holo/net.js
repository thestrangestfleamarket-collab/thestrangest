// THE HOLODECK'S WORD TO THE SERVER: a holodeck page keeps you in your section's room (the market's Block) with what the market handed over when you left it (your name, look and where you stood), nothing else of the market
const CARD=(()=>{ try{ return JSON.parse(sessionStorage.getItem('holo')||'null')||{}; }catch(e){ return {}; } })();
const NET={on:false,me:'',others:new Map(),hear:{},card:CARD};
// the login is an hour's token: renewed from the door's saved session before it runs out (as THE MARKET does, 136a), so a page left open stays in its room and keeps its voices
const SB='https://jvcetttmqseoteidfggn.supabase.co', SBK='sb_publishable_UkzD8hOizW1hPr6hm3duQQ_07ZodPik', LS='sb-jvcetttmqseoteidfggn-auth-token';
const ck=()=>{ const m=/(?:^|;\s*)tsfm-pass=([^;]+)/.exec(document.cookie); return m?decodeURIComponent(m[1]):''; };
const exp=t=>{ try{ return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).exp||0; }catch(e){ return 0; } };
NET.tok=async()=>{ const t=ck(); if(t.startsWith('dev:')||(t&&exp(t)*1000>Date.now()+5*60000))return t; let s=null; try{ s=JSON.parse(localStorage.getItem(LS)||'null'); }catch(e){} if(!s||!s.refresh_token)return t;
  try{ const r=await fetch(SB+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:SBK,'content-type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})}); if(!r.ok)return t; const n=await r.json(); localStorage.setItem(LS,JSON.stringify({...s,...n})); document.cookie='tsfm-pass='+n.access_token+'; path=/; max-age=3600; secure; samesite=strict'; return n.access_token; }catch(e){ return t; } };
if(/^https?:$/.test(location.protocol))setInterval(()=>NET.tok(),10*60000);
let sock=null;
const send=m=>{ if(sock&&sock.readyState===1)sock.send(JSON.stringify(m)); };
NET.send=m=>send(m);
const hello=()=>{ const C=NET.card; send({t:'me',name:C.name||'TENANT',look:C.look||'w0',dead:0,hp:C.hp==null?1:C.hp,x:{}}); if(Array.isArray(C.at))send({t:'mv',at:C.at}); };
NET.feed=m=>{ if(!m||typeof m!=='object')return;
  if(m.t==='hi'){ NET.me=m.you||''; NET.others.clear(); for(const p of m.all||[])if(p&&p.id)NET.others.set(p.id,{id:p.id,name:p.name||'',at:Array.isArray(p.at)?p.at:null}); }
  else if(m.t==='in'&&m.p&&m.p.id)NET.others.set(m.p.id,{id:m.p.id,name:m.p.name||'',at:Array.isArray(m.p.at)?m.p.at:null});
  else if(m.t==='me'&&m.id&&NET.others.has(m.id)){ if(m.name)NET.others.get(m.id).name=m.name; }
  else if(m.t==='out')NET.others.delete(m.id);
  const f=NET.hear[m.t]; if(f)try{ f(m); }catch(e){ console.warn('HOLO net',e); } };
NET.connect=async()=>{ const CARD=NET.card; if(sock||!CARD.room||!/^https?:$/.test(location.protocol))return; let PS=null; await NET.tok();
  try{ const m=await import('https://cdn.jsdelivr.net/npm/partysocket@1.3.0/+esm'); PS=m.PartySocket||m.default; }catch(e){ console.warn('HOLO: no connection',e); return; }
  sock=new PS({host:location.host,party:'block',room:CARD.room,query:async()=>{ await NET.tok(); return NET.query||{}; }});   // (asked on every connect and reconnect)
  sock.addEventListener('open',()=>{ NET.on=true; hello(); });
  sock.addEventListener('close',e=>{ NET.on=false; NET.others.clear(); if(e.code>=4000&&e.code<=4002)sock.close(); });
  sock.addEventListener('message',e=>{ let m=null; try{ m=JSON.parse(e.data); }catch(x){} if(m)NET.feed(m); });
  setInterval(()=>{ if(NET.on&&Array.isArray(CARD.at))send({t:'mv',at:CARD.at}); },4000);
  addEventListener('pagehide',()=>{ if(sock){ send({t:'bye'}); sock.close(1000,'bye'); } }); };
// back to the market, where you stood (it starts you where you left off)
NET.back=()=>{ location.assign(NET.card.back||'/'); };
export {NET};
