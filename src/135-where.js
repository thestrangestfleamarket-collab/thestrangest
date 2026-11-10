// THE WHERE: WHERE saves where the player is (with the time) and puts them back there on a login within the hour (071); BUILDV is the build stamp.
import {SHARED} from './003-shx.js';
import {CLIP, LEVELS, PH, pos, RAG, ROOMS, WHERE} from './003b-systems.js';
import {OWNED, SAVE} from './005-save.js';
import {MODS, QS, SOL, STORE, SYS, TILE} from './006-map-pre.js';
import {SAVED} from './071-main-11.js';

{ const KEY='where', test=['at','place','sheet','npcat','spot'].some(k=>QS.get(k)!=null);   // KEY on the server (for another device), 'here' in this browser (always the latest here)
  if(QS.get('fresh')!=null){ SAVE.del(KEY); SAVE.del('here'); }
  // saved here every few seconds you move (and each minute you don't), on the server every 30 s and as the page closes: the time says whether you come back to it (071)
  let last='', lt=0, sv='', up=0, t=0; const save=end=>{ if(test||RAG.on||!SYS.started)return; const w={x:+pos.x.toFixed(3),z:+pos.z.toFixed(3),y:+SHARED.py.toFixed(3),hd:+SHARED.heading.toFixed(3),lv:SHARED.floor}, at=JSON.stringify(w), now=Date.now(); w.t=now; w.u=OWNED.me&&OWNED.me.id||''; const j=JSON.stringify(w);
    try{ if(end===true||at!==last||now-lt>60e3){ last=at; lt=now; SAVE.set('here',j); } if(end===true||now-up>30e3&&(at!==sv||now-up>300e3)){ up=now; sv=at; OWNED.set(KEY,j); if(end===true)OWNED.flush(); } }catch(e){} };
  WHERE.tick=dt=>{ if(!SYS.started)return; t+=dt; if(t>2){ t=0; save(); if(STORE.offAt)STORE.offAt(pos.x,pos.z); } };
  addEventListener('pagehide',()=>save(true)); addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden')save(true); });
  // put you back where you left off (071 set a spot on the street before the first frame): rebuild the inside you were in, or the platform if the spot is not sound
  WHERE.restore=async()=>{ let w=SAVED; if(!w)return false; await LOAD('later'); const lv=w.lv||LEVELS.below(w.y);
    if(lv==='down'&&!(MODS.dungeon&&MODS.dungeon.inside(w.x,w.z))&&(Math.abs(MODS.station.ground(w.x,w.z)-w.y)>.5||CLIP.hit(SOL.down,w.x,w.z,.3*TILE))){ const p=MODS.station.plat; w={x:p.x,z:p.z,y:MODS.station.ground(p.x,p.z),hd:w.hd,lv:'down'}; }
    const ap=MODS.apts&&MODS.apts.offAt?await MODS.apts.offAt(w.x,w.z,lv):false; if(ap){ STORE.goTo(ap[0],ap[1],ap[2],null,'up'); SHARED.heading=w.hd; PH.hd=w.hd; return true; }
    const room=lv==='up'&&ROOMS.boxAt?ROOMS.boxAt(w.x,w.z):null; if(room){ ROOMS.enterAt(room,[w.x,w.z,0,w.hd]); return true; }
    if(STORE.inStore&&STORE.inStore(w.x,w.z)&&STORE.ensure)await STORE.ensure(); if(STORE.offAt)await STORE.offAt(w.x,w.z);
    STORE.goTo(w.x,w.z,w.y,null,w.lv); SHARED.heading=w.hd; PH.hd=w.hd; return true; };
  WHERE.save=save; }

const BUILDV=__BUILDV__;
export {BUILDV};
