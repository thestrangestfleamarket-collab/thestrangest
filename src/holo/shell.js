// THE HOLODECK'S SHELL (/holo?g=<game>): a holodeck game that is a page of its own, shown alone (no market behind it), LEAVE THE HOLODECK over it, you kept in your section's room
import {NET} from './net.js';
const PAGES={vr:'/vr',wave:'/wave',golf:'/golf',scare:'/scare',shoot:'/shoot',duel:'/duel',cantina:'/cantina',sushi:'/sushi'}, g=new URLSearchParams(location.search).get('g'), url=PAGES[g];
if(!url)NET.back();
else{ const fr=document.createElement('iframe'); fr.src=location.protocol==='file:'?'.'+(g==='vr'?'/asylum':url)+'.html':url; fr.allow='xr-spatial-tracking; fullscreen; autoplay; gamepad; microphone'; document.body.prepend(fr); fr.focus(); NET.connect(); }
if(g==='sushi'){ addEventListener('message',e=>{ if(e.origin===location.origin&&e.data&&e.data.yatai)NET.send({t:'yt',d:e.data.yatai}); });   // the ramen cart tells the section what its cook is doing
  NET.hear.mv=m=>{ const o=m.id&&NET.others.get(m.id); if(o&&Array.isArray(m.at))o.at=m.at; };   // and is told who in the market is standing by the cart
  setInterval(()=>{ const fr=document.querySelector('iframe'); if(!fr||!fr.contentWindow)return; try{ fr.contentWindow.postMessage({market:{me:NET.card.at||null,others:[...NET.others.values()].filter(o=>o.at).map(o=>[o.id,o.name||'',+o.at[0],+o.at[1],String(o.at[4]||'')])}},location.origin); }catch(e){} },500); }
document.getElementById('leave').onclick=()=>NET.back();
window.HOLONET=NET;
