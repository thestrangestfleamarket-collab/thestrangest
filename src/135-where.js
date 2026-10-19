const WHERE={};
{ const KEY='where', test=['at','place','sheet','npcat'].some(k=>QS.get(k)!=null);
  let W=null; try{ if(QS.get('fresh')!=null)SAVE.del(KEY); else W=JSON.parse(SAVE.get(KEY)||'null'); }catch(e){}
  const back=()=>{ if(!window.__started){ setTimeout(back,200); return; } let w=W; if(!w||![w.x,w.z,w.y,w.hd].every(Number.isFinite))return;
    if(w.y<-1.6&&!(MODS.dungeon&&MODS.dungeon.inside(w.x,w.z))&&(Math.abs(MODS.station.ground(w.x,w.z)-w.y)>.5||CLIP.hit(SOL.down,w.x,w.z,.3*TILE))){ const p=MODS.station.plat; w={x:p.x,z:p.z,y:MODS.station.ground(p.x,p.z),hd:w.hd}; }
    if(STORE.inStore&&STORE.inStore(w.x,w.z)&&STORE.ensure)STORE.ensure();
    STORE.goTo(w.x,w.z,w.y); heading=w.hd; if(typeof PH!=='undefined')PH.hd=w.hd; };
  if(!test&&W)setTimeout(back,300);
  const home=()=>{ if(!window.__started){ setTimeout(home,200); return; } UI.goPlace('CENTRAL PARK'); };
  if(!test&&!W)setTimeout(home,300);
  let last='', t=0; const save=()=>{ if(test||RAG.on)return; const w={x:+pos.x.toFixed(3),z:+pos.z.toFixed(3),y:+py.toFixed(3),hd:+heading.toFixed(3)}, j=JSON.stringify(w); if(j===last)return; last=j; try{ SAVE.set(KEY,j); }catch(e){} };
  WHERE.tick=dt=>{ if(!window.__started)return; t+=dt; if(t>2){ t=0; save(); } };
  addEventListener('pagehide',save); addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden')save(); });
  WHERE.save=save; WHERE.saved=()=>W; }

const BUILDV=__BUILDV__;
