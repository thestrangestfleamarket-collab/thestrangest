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
  setTimeout(()=>{ go().catch(()=>{}); },3000); window.NEWVER=show; }   /* (a test's look) */
