// ---- A NEW VERSION, SAID (owner, 18 Oct 2026: "when youre playing it hsould check for new versions and let you knwo when one is vailable so you
// can refresh"): every build carries the moment it was built (BUILDV, build.py); the artifact's own shared store keeps the newest build anyone
// has opened (`meta/build`, the `db` capability), a page newer than it says so as it opens, and every open page listens: a newer one published
// and opened anywhere (or written there by the session that published it), a small note at the screen's foot, REFRESH reloads. Nothing else
// changes; no store (signed out, or not granted): nothing shown ----
{ const show=()=>{ if(document.getElementById('newver'))return; const d=document.createElement('div'); d.id='newver';
    d.style.cssText='position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:40;font:12px var(--pixel,monospace);color:#f2c14e;background:#0b0d13f2;border:2px solid #f2c14e;padding:8px 12px;display:flex;gap:12px;align-items:center';
    d.innerHTML='<span>A NEW VERSION IS READY</span><button style="font:inherit;color:#0b0d13;background:#f2c14e;border:0;padding:4px 10px;cursor:pointer">REFRESH</button><button aria-label="Close" style="font:inherit;color:#8a8f9c;background:none;border:0;cursor:pointer">X</button>';
    const [r,x]=d.querySelectorAll('button'); r.onclick=()=>location.reload(); x.onclick=()=>d.remove(); document.body.appendChild(d); };
  const go=async()=>{ const c=window.claude; if(!c||!c.use)return; const db=await c.use('db').catch(()=>null); if(!db)return; const ref=db.doc('meta/build');
    try{ const s=await ref.get(); const v=s.exists?+(s.data().v||0):0; if(BUILDV>v)await ref.set({v:BUILDV}); }catch(e){}   // (this one newer than any opened: it's the newest now)
    ref.onSnapshot(s=>{ const v=s.exists?+(s.data().v||0):0; if(v>BUILDV)show(); },()=>{}); };
  // WITHOUT THE STORE (owner, 18 Oct 2026: "it DOESNT GIVE THAT DAMN MESSAGE EVER AND HASNT IN DAYS"): opened in a tab of its own the page gets
  // no store (claude.use resolves null there), so it heard of nothing. Now it also reads the published page itself, only its first few KB (the
  // build's moment is in a meta near the top: build.py), every 90 s and whenever its tab comes back into view; a newer one, the note
  const peek=async()=>{ if(document.getElementById('newver'))return; try{ const r=await fetch(location.href.split('#')[0],{cache:'no-store'}); if(!r.ok||!r.body)return;
      const rd=r.body.getReader(), dec=new TextDecoder(); let s='';
      while(s.length<65536){ const {value,done}=await rd.read(); if(done)break; s+=dec.decode(value,{stream:true}); const m=/name="market-build" content="(\d+)"/.exec(s); if(m){ rd.cancel().catch(()=>{}); NEWVER.seen=+m[1]; if(+m[1]>BUILDV)show(); return; } }
      rd.cancel().catch(()=>{}); }catch(e){} };
  setTimeout(()=>{ go().catch(()=>{}); peek(); },3000); setInterval(peek,90000); document.addEventListener('visibilitychange',()=>{ if(!document.hidden)peek(); });
  window.NEWVER=show; NEWVER.peek=peek; }   /* (a test's look) */   /* (a test's look) */
