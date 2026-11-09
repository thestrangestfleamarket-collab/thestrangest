// THE NEW VERSION: tells the player when a newer build of the game is ready.
import {SYS} from './006-map-pre.js';
import {BUILDV} from './135-where.js';
{ const show=()=>{ '@later'; if(document.getElementById('newver'))return; const d=document.createElement('div'); d.id='newver'; d.className='mlb';
    d.style.cssText='position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:40;font:12px var(--pixel,monospace);color:#f2c14e;background:#0b0d13f2;border:2px solid #f2c14e;padding:8px 12px;display:flex;gap:12px;align-items:center';
    d.innerHTML='<span>A NEW VERSION IS READY</span><button style="font:inherit;color:#0b0d13;background:#f2c14e;border:0;padding:4px 10px;cursor:pointer">REFRESH</button><button aria-label="Close" style="font:inherit;color:#8a8f9c;background:none;border:0;cursor:pointer">X</button>';
    const [r,x]=d.querySelectorAll('button'); r.onclick=()=>location.reload(); x.onclick=()=>d.remove(); document.body.appendChild(d); };
  const peek=async()=>{ if(document.getElementById('newver'))return; try{ const r=await fetch(location.href.split('#')[0],{cache:'no-store'}); if(!r.ok||!r.body)return;
      const rd=r.body.getReader(), dec=new TextDecoder(); let s='';
      while(s.length<65536){ const {value,done}=await rd.read(); if(done)break; s+=dec.decode(value,{stream:true}); const m=/name="market-build" content="(\d+)"/.exec(s); if(m){ rd.cancel().catch(()=>{}); NEWVER.seen=+m[1]; if(+m[1]>BUILDV)show(); return; } }
      rd.cancel().catch(()=>{}); }catch(e){} };
  setTimeout(peek,3000); SYS.every(peek,90000,'136-version'); document.addEventListener('visibilitychange',()=>{ if(!document.hidden)peek(); });
  window.NEWVER=show; NEWVER.peek=peek; }
