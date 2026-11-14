// THE HOLODECK'S SHELL (/holo?g=<game>): a holodeck game that is a page of its own, shown alone (no market behind it), LEAVE THE HOLODECK over it, you kept in your section's room
import {NET} from './net.js';
import {cartLink} from './cartlink.js';
const PAGES={vr:'/vr',wave:'/wave',golf:'/golf',scare:'/scare',shoot:'/shoot',duel:'/duel',cantina:'/cantina',sushi:'/sushi'}, g=new URLSearchParams(location.search).get('g'), url=PAGES[g];
if(!url)NET.back();
else{ const fr=document.createElement('iframe'); fr.src=location.protocol==='file:'?'.'+(g==='vr'?'/asylum':url)+'.html':url; fr.allow='xr-spatial-tracking; fullscreen; autoplay; gamepad; microphone'; document.body.prepend(fr); fr.focus(); NET.connect(); }
if(g==='sushi'){ NET.query={cart:'1'}; const L=cartLink(NET,m=>{ const fr=document.querySelector('iframe'); if(fr&&fr.contentWindow)try{ fr.contentWindow.postMessage({market:m},location.origin); }catch(e){} });
  addEventListener('message',e=>{ if(e.origin!==location.origin||!e.data)return; if(e.data.yatai)L.state(e.data.yatai); else if(e.data.yataiEvt)L.evt(e.data.yataiEvt); else if(e.data.yataiItems)L.items(e.data.yataiItems); }); }
document.getElementById('leave').onclick=()=>NET.back();
window.HOLONET=NET;
