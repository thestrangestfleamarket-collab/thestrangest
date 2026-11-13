// THE HOLODECK'S WORD TO THE SERVER: a holodeck page keeps you in your section's room (the market's Block) with what the market handed over when you left it (your name, look and where you stood), nothing else of the market
const CARD=(()=>{ try{ return JSON.parse(sessionStorage.getItem('holo')||'null')||{}; }catch(e){ return {}; } })();
const NET={on:false,me:'',others:new Map(),hear:{},card:CARD};
let sock=null;
const send=m=>{ if(sock&&sock.readyState===1)sock.send(JSON.stringify(m)); };
NET.send=m=>send(m);
const hello=()=>{ send({t:'me',name:CARD.name||'TENANT',look:CARD.look||'w0',dead:0,hp:CARD.hp==null?1:CARD.hp,x:{}}); if(Array.isArray(CARD.at))send({t:'mv',at:CARD.at}); };
NET.feed=m=>{ if(!m||typeof m!=='object')return;
  if(m.t==='hi'){ NET.me=m.you||''; NET.others.clear(); for(const p of m.all||[])if(p&&p.id)NET.others.set(p.id,{id:p.id,name:p.name||''}); }
  else if(m.t==='in'&&m.p&&m.p.id)NET.others.set(m.p.id,{id:m.p.id,name:m.p.name||''});
  else if(m.t==='me'&&m.id&&NET.others.has(m.id)){ if(m.name)NET.others.get(m.id).name=m.name; }
  else if(m.t==='out')NET.others.delete(m.id);
  const f=NET.hear[m.t]; if(f)try{ f(m); }catch(e){ console.warn('HOLO net',e); } };
NET.connect=async()=>{ if(sock||!CARD.room||!/^https?:$/.test(location.protocol))return; let PS=null;
  try{ const m=await import('https://cdn.jsdelivr.net/npm/partysocket@1.3.0/+esm'); PS=m.PartySocket||m.default; }catch(e){ console.warn('HOLO: no connection',e); return; }
  sock=new PS({host:location.host,party:'block',room:CARD.room});
  sock.addEventListener('open',()=>{ NET.on=true; hello(); });
  sock.addEventListener('close',e=>{ NET.on=false; NET.others.clear(); if(e.code>=4000&&e.code<=4002)sock.close(); });
  sock.addEventListener('message',e=>{ let m=null; try{ m=JSON.parse(e.data); }catch(x){} if(m)NET.feed(m); });
  setInterval(()=>{ if(NET.on&&Array.isArray(CARD.at))send({t:'mv',at:CARD.at}); },4000);
  addEventListener('pagehide',()=>{ if(sock){ send({t:'bye'}); sock.close(1000,'bye'); } }); };
// back to the market, where you stood (it starts you where you left off)
NET.back=()=>{ location.assign(CARD.back||'/'); };
export {NET};
