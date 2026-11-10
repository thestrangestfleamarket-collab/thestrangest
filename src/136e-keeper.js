// THE KEEPER: on the website, starts the service worker (src/door/sw.js) that keeps the game's files on the device, and asks the browser not to clear them.
import {SYS} from './006-map-pre.js';
SYS.onStart(()=>{ if(!('serviceWorker' in navigator)||location.protocol==='file:'||location.pathname!=='/')return;
  navigator.serviceWorker.register('/sw.js').then(()=>{ if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{}); }).catch(()=>{}); },'136e-keeper');
