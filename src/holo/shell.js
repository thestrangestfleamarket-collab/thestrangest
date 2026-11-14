// THE HOLODECK'S SHELL (/holo?g=<game>): a holodeck game that is a page of its own, shown alone (no market behind it), LEAVE THE HOLODECK over it, you kept in your section's room
import {NET} from './net.js';
const PAGES={vr:'/vr',wave:'/wave',golf:'/golf',scare:'/scare',shoot:'/shoot',duel:'/duel',cantina:'/cantina',hide:'/hide'}, g=new URLSearchParams(location.search).get('g'), url=PAGES[g];
if(!url)NET.back();
else{ const fr=document.createElement('iframe'); fr.src=location.protocol==='file:'?'.'+(g==='vr'?'/asylum':url)+'.html':url; fr.allow='xr-spatial-tracking; fullscreen; autoplay; gamepad'; document.body.prepend(fr); fr.focus(); NET.connect(); }
document.getElementById('leave').onclick=()=>NET.back();
window.HOLONET=NET;
