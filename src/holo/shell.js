// THE HOLODECK'S SHELL (/holo?g=<game>): a holodeck game that is a page of its own, shown alone (no market behind it), LEAVE THE HOLODECK over it, you kept in your section's room
import {NET} from './net.js';
const PAGES={vr:'/vr',wave:'/wave',golf:'/golf',scare:'/scare',shoot:'/shoot',duel:'/duel',cantina:'/cantina',sushi:'/sushi'}, g=new URLSearchParams(location.search).get('g'), url=PAGES[g];
if(!url)NET.back();
else{ const fr=document.createElement('iframe'); fr.src=location.protocol==='file:'?'.'+(g==='vr'?'/asylum':url)+'.html':url; fr.allow='xr-spatial-tracking; fullscreen; autoplay; gamepad; microphone'; document.body.prepend(fr); fr.focus(); NET.connect(); }
if(g==='sushi'){ const frame=()=>{ const fr=document.querySelector('iframe'); return fr&&fr.contentWindow; }, tell=m=>{ const w=frame(); if(w)try{ w.postMessage({market:m},location.origin); }catch(e){} };
  // the ramen cart and the section, both ways: what its cook is doing and what happens to a seated tenant go out; who stands by the cart, and who sits down at it, come in
  addEventListener('message',e=>{ if(e.origin!==location.origin||!e.data)return; if(e.data.yatai)NET.send({t:'yt',d:e.data.yatai}); else if(e.data.yataiEvt)NET.send({t:'yt',d:{e:e.data.yataiEvt}}); });
  NET.hear.mv=m=>{ const o=m.id&&NET.others.get(m.id); if(o&&Array.isArray(m.at))o.at=m.at; };
  NET.hear.yt=m=>{ const o=m.from&&NET.others.get(m.from); if(m.d&&m.d.g)tell({evt:{from:m.from,name:(o&&o.name)||'TENANT',...m.d.g}}); };
  setInterval(()=>tell({me:NET.card.at||null,others:[...NET.others.values()].filter(o=>o.at).map(o=>[o.id,o.name||'',+o.at[0],+o.at[1],String(o.at[4]||'')])}),500);
  // voice: the market's own (111dc: the smaller id offers, the section hands the handshake over): the cook is heard in the market, and a tenant holding their talk key is heard at the cart
  const peers=new Map(), rtc=(to,d)=>NET.send({t:'rtc',to,d}); let ice=null, mic=null;
  const getIce=async()=>{ if(ice)return ice; try{ const r=await fetch('/turn',{credentials:'same-origin'}); if(r.ok){ const j=await r.json(); if(Array.isArray(j.iceServers))return ice=j.iceServers; } }catch(e){} return [{urls:'stun:stun.cloudflare.com:3478'}]; };
  const getMic=async()=>{ if(mic)return mic; try{ mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}); }catch(e){ mic=null; } return mic; };
  const cut=(id,say)=>{ const P=peers.get(id); if(!P)return; peers.delete(id); try{ P.pc.close(); }catch(e){} if(P.el)P.el.remove(); if(say)rtc(id,{bye:1}); };
  const link=async(id,offer)=>{ let P=peers.get(id); if(P)return P; const pc=new RTCPeerConnection({iceServers:await getIce()}); if(peers.has(id)){ pc.close(); return peers.get(id); } P={id,pc,el:null}; peers.set(id,P);
    pc.onicecandidate=e=>{ if(e.candidate)rtc(id,{c:e.candidate.toJSON()}); }; pc.ontrack=e=>{ if(P.el)return; const el=P.el=document.createElement('audio'); el.autoplay=true; el.srcObject=e.streams[0]||new MediaStream([e.track]); el.style.display='none'; document.body.appendChild(el); el.play().catch(()=>{}); };
    pc.onconnectionstatechange=()=>{ if(pc.connectionState==='failed'||pc.connectionState==='closed')cut(id,false); };
    if(offer){ const tr=pc.addTransceiver('audio',{direction:'sendrecv'}), m=await getMic(); if(m)tr.sender.replaceTrack(m.getAudioTracks()[0]).catch(()=>{}); const o=await pc.createOffer(); await pc.setLocalDescription(o); rtc(id,{sdp:pc.localDescription.toJSON()}); }
    return P; };
  NET.hear.rtc=async m=>{ const id=m.from&&String(m.from), d=m.d; if(!id||!d)return; if(d.bye||d.no){ cut(id,false); return; }
    try{ if(d.sdp){ if(d.sdp.type==='offer'&&peers.has(id)&&peers.get(id).pc.signalingState!=='stable')cut(id,false); const P=await link(id,false), pc=P.pc; await pc.setRemoteDescription(d.sdp);
        if(d.sdp.type==='offer'){ const tr=pc.getTransceivers()[0], mm=await getMic(); if(tr){ tr.direction='sendrecv'; if(mm)tr.sender.replaceTrack(mm.getAudioTracks()[0]).catch(()=>{}); } const a=await pc.createAnswer(); await pc.setLocalDescription(a); rtc(id,{sdp:pc.localDescription.toJSON()}); } }
      else if(d.c){ const P=peers.get(id); if(P)await P.pc.addIceCandidate(d.c).catch(()=>{}); } }catch(e){ console.warn('HOLO voice',e); } };
  setInterval(()=>{ const me=NET.card.at; if(!NET.on||!Array.isArray(me))return; for(const o of NET.others.values()){ const near=o.at&&String(o.at[4]||'')===String(me[4]||'')&&Math.hypot(o.at[0]-me[0],o.at[1]-me[1])<24; if(near&&!peers.has(o.id)&&NET.me&&NET.me<o.id)link(o.id,true).catch(()=>{}); else if(!near&&peers.has(o.id))cut(o.id,true); } for(const id of [...peers.keys()])if(!NET.others.has(id))cut(id,false); },2000); }
document.getElementById('leave').onclick=()=>NET.back();
window.HOLONET=NET;
