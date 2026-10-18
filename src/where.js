// ---- WHERE YOU LEFT OFF (owner, 17 Oct 2026: "leaves off exactly where your character was last"): where he stands (x, z, the height of his
// floor: a stacked room's, a floor of the apartment house's, the station's) and the way he faces are kept in this browser every couple of
// seconds as he moves and when the page is left, and he is put back there the next time the game opens (the stacked rooms finished first if
// he was in one). A test's start (?at, ?place, ?sheet, ?npcat) wins over it; ?fresh=1 starts on the street and forgets the spot ----
const WHERE={};
{ const KEY='where', test=['at','place','sheet','npcat'].some(k=>QS.get(k)!=null);   // (?fresh=1 only forgets the spot: the new one is kept from then on)
  let W=null; try{ if(QS.get('fresh')!=null)SAVE.del(KEY); else W=JSON.parse(SAVE.get(KEY)||'null'); }catch(e){}
  const back=()=>{ if(!window.__started){ setTimeout(back,200); return; } let w=W; if(!w||![w.x,w.z,w.y,w.hd].every(Number.isFinite))return;
    /* (a spot kept underground that's no floor now, the old station's platform since the Metro took its place, owner 18 Oct 2026: the Metro's platform instead) */
    if(w.y<-1.6&&!(MODS.dungeon&&MODS.dungeon.inside(w.x,w.z))&&(Math.abs(MODS.station.ground(w.x,w.z)-w.y)>.5||CLIP.hit(SOL.down,w.x,w.z,.3*TILE))){ const p=MODS.station.plat; w={x:p.x,z:p.z,y:MODS.station.ground(p.x,p.z),hd:w.hd}; }
    if(STORE.inStore&&STORE.inStore(w.x,w.z)&&STORE.ensure)STORE.ensure();   /* (a stacked room is built after the game opens: store.js) */
    STORE.goTo(w.x,w.z,w.y); heading=w.hd; if(typeof PH!=='undefined')PH.hd=w.hd; };
  if(!test&&W)setTimeout(back,300);
  // (a new player, nothing kept yet: in the cottage, the apartment house's ground floor; owner, 18 Oct 2026, "make it anyone's cottage who
  // starts", his pick: the first visit only, after that where you left off)
  const home=()=>{ if(!window.__started){ setTimeout(home,200); return; } const H=MODS.apts&&MODS.apts.home; if(!H)return; STORE.goTo(H.x,H.z,H.y); heading=H.hd; if(typeof PH!=='undefined')PH.hd=H.hd; };
  if(!test&&!W)setTimeout(home,300);
  // kept as he goes: every two seconds if he moved, and as the page is left
  let last='', t=0; const save=()=>{ if(test||RAG.on)return; const w={x:+pos.x.toFixed(3),z:+pos.z.toFixed(3),y:+py.toFixed(3),hd:+heading.toFixed(3)}, j=JSON.stringify(w); if(j===last)return; last=j; try{ SAVE.set(KEY,j); }catch(e){} };
  WHERE.tick=dt=>{ if(!window.__started)return; t+=dt; if(t>2){ t=0; save(); } };
  addEventListener('pagehide',save); addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden')save(); });
  WHERE.save=save; WHERE.saved=()=>W; }
