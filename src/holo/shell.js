// THE HOLODECK'S SHELL (/holo?g=<game>): a holodeck game that is a page of its own, shown alone (no market behind it), LEAVE THE HOLODECK over it, you kept in your section's room
import {NET} from './net.js';
import {cartLink} from './cartlink.js';
const PAGES={vr:'/asylum',wave:'/wave',golf:'/golf',scare:'/scare',shoot:'/shoot',duel:'/duel',cantina:'/cantina',crumbs:'/crumbs',ramen:'/ramen',sushi:'/ramen'}, q=new URLSearchParams(location.search), g=q.get('g'), url=PAGES[g], cart=g==='ramen'||g==='sushi', guest=cart&&q.get('as')==='guest';   // (a guest of the ramen cart's alley walks it as themselves: 146bg sends them here)
if(!url)NET.back();
else{ const fr=document.createElement('iframe'); fr.src=(location.protocol==='file:'?'.'+url+'.html':url)+(guest?'?guest=1':''); fr.allow='xr-spatial-tracking; fullscreen; autoplay; gamepad; microphone'; document.body.prepend(fr); fr.focus(); NET.connect(); }
if(cart){ NET.query=guest?{}:{cart:'1'}; if(guest)document.getElementById('leave').textContent='LEAVE THE VILLAGE';
  const L=cartLink(NET,m=>{ const fr=document.querySelector('iframe'), w=fr&&fr.contentWindow; if(!w)return; if(m.voice){ try{ if(w.G&&w.G.live&&w.G.live.voice)w.G.live.voice(m.voice); }catch(e){} return; } try{ w.postMessage({market:m},location.origin); }catch(e){} },{guest,mix:guest?null:mm=>{ const fr=document.querySelector('iframe'), w=fr&&fr.contentWindow; return w&&w.G&&w.G.live&&w.G.live.mix?w.G.live.mix(mm):null; }});   // (a voice's stream is handed over as it is: the page is of this site)
  addEventListener('message',e=>{ if(e.origin!==location.origin||!e.data)return; const d=e.data; if(d.yatai)L.state(d.yatai); else if(d.yataiEvt)L.evt(d.yataiEvt); else if(d.yataiItems)L.items(d.yataiItems); else if(d.yataiBody)L.body(d.yataiBody); else if(d.yataiAsk)L.ask(d.yataiAsk);
    else if(d.yataiNet&&(d.yataiNet.t==='yt'||d.yataiNet.t==='mv')){ if(d.yataiNet.t==='mv'&&Array.isArray(d.yataiNet.at))NET.card.at=d.yataiNet.at; L.send(d.yataiNet); }
    else if(d.yataiLeave)NET.back(); else if(d.yataiCook)location.assign(location.protocol==='file:'?'./holo.html?g=ramen':'/holo?g=ramen'); }); }
document.getElementById('leave').onclick=()=>NET.back();
window.HOLONET=NET;
