// THE WHERE: WHERE saves where the player is (every login starts on the subway platform, 071); BUILDV is the build stamp.
import {SHARED} from './003-shx.js';
import {pos, RAG, WHERE} from './003b-systems.js';
import {SAVE} from './005-save.js';
import {QS, STORE} from './006-map-pre.js';

{ const KEY='where', test=['at','place','sheet','npcat'].some(k=>QS.get(k)!=null);
  if(QS.get('fresh')!=null)SAVE.del(KEY);
  let last='', t=0; const save=()=>{ if(test||RAG.on)return; const w={x:+pos.x.toFixed(3),z:+pos.z.toFixed(3),y:+SHARED.py.toFixed(3),hd:+SHARED.heading.toFixed(3),lv:SHARED.floor}, j=JSON.stringify(w); if(j===last)return; last=j; try{ SAVE.set(KEY,j); }catch(e){} };
  WHERE.tick=dt=>{ if(!window.__started)return; t+=dt; if(t>2){ t=0; save(); if(STORE.offAt)STORE.offAt(pos.x,pos.z); } };
  addEventListener('pagehide',save); addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden')save(); });
  WHERE.save=save; }

const BUILDV=__BUILDV__;
export {BUILDV};
