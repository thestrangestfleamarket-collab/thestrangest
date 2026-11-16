// THE RAMEN CART'S LINK TO THE SECTION (the holodeck's shell and YATAI '86 on its own page both use it): what the cook is doing and what happens to a seated tenant go out; who stands by the cart and who sits down at it come in (tell); every other cook's cart comes in too; and the market's voice runs between them
export const SLOTS=[0,-3.6,3.6];   // where each cook's cart stands along the alley, in the cart's own metres across (146bg uses the same)
export function cartLink(NET,tell){ let FR=null, mvT=0, bodyT=0, slot=-1, since=0, onT=0; NET.card.look='b:carving_chef';   // the cook is the carving chef in the market (146bg)
  const cooks=new Map();   // the section's other cooks: their slot, since when, when last heard
  const live=()=>[...cooks].filter(([id,c])=>NET.others.has(id)&&Date.now()-c.t<15000);
  // a slot of your own: the lowest no other cook holds; two who took the same, the later one moves on
  const pick=()=>{ if(!NET.on||Date.now()-onT<1500)return; const L=live(), held=new Set(L.map(([,c])=>c.k));
    if(slot>=0){ const clash=L.find(([id,c])=>c.k===slot&&(c.s<since||c.s===since&&id<NET.me)); if(!clash)return; }
    const k=SLOTS.findIndex((_,i)=>!held.has(i)); slot=k<0?SLOTS.length+L.length:k; since=Date.now(); };
  setInterval(pick,500);
  NET.hear.mv=m=>{ const o=m.id&&NET.others.get(m.id); if(o&&Array.isArray(m.at))o.at=m.at; };
  NET.hear.vr=m=>{ if(m.id&&cooks.has(m.id)&&!m.off)tell({cookBody:{from:m.id,h:m.h,L:m.L,R:m.R}}); };
  const mine=g=>!g.to||g.to===NET.me;   // a tenant's word for one cook (sitting, standing, choosing) is for that cook only
  NET.hear.yt=m=>{ const o=m.from&&NET.others.get(m.from), d=m.d, g=d&&d.g; if(!d)return; if(d.a){ tell({fig:{from:m.from,a:d.a}}); return; } if(d.b&&!Array.isArray(d.b)){ const b=d.b; if(o&&Array.isArray(b.p)){ o.cp=[+b.p[0]||0,+b.p[1]||0,+b.p[2]||0]; o.cpT=Date.now(); } tell({pose:{from:m.from,b}}); return; }
    if(String(m.from||'').endsWith('~cart')){ if(d.i){ tell({cookItems:{from:m.from,i:d.i}}); return; } if(d.e||d.g)return; if(d.k>=0){ const c=cooks.get(m.from)||{}; cooks.set(m.from,{k:d.k|0,s:+d.ks||0,t:Date.now()}); if(c.k!==(d.k|0))pick(); } tell({cook:{from:m.from,d}}); return; }   // another cook's cart
    if(!g)return;
    if(Array.isArray(g.p)){ if(o){ o.cp=[+g.p[0]||0,+g.p[1]||0,+g.p[2]||0]; o.cpT=Date.now(); } if(Array.isArray(g.f)&&g.f.length>=6&&g.f.every(v=>isFinite(+v)))FR=g.f.map(Number); const w=g.w, c=NET.card.at; if(Date.now()-bodyT>2000&&Array.isArray(w)&&(!Array.isArray(c)||c[0]!==w[0]||c[1]!==w[1]||c[5]!==w[5])){ NET.card.at=w.slice(0,6); NET.send({t:'mv',at:NET.card.at}); } return; }   // someone in the market's alley: where they stand by the cart, and where the cart's cook stands in the section
    if(!mine(g))return; tell({evt:{from:m.from,name:(o&&o.name)||'TENANT',...g}}); };
  const off=()=>slot>=0?SLOTS[slot]??0:0;
  setInterval(()=>{ for(const id of [...cooks.keys()])if(!NET.others.has(id))cooks.delete(id); const x=off();
    tell({me:NET.card.at||null,slot,sx:x,cooks:live().map(([id,c])=>[id,c.k,SLOTS[c.k]??0]),others:[...NET.others.values()].filter(o=>o.cp&&Date.now()-o.cpT<6000).map(o=>[o.id,o.name||'',o.cp[0]-x,o.cp[1],o.cp[2]])}); },500);   // (the market tells where they stand from the first cart: here, from yours)
  // voice: the market's own (111dc: the smaller id offers, the section hands the handshake over): the cook is heard in the market, and a tenant holding their talk key is heard at the cart, from where they stand (the page places it)
  const peers=new Map(), rtc=(to,d)=>NET.send({t:'rtc',to,d}); let ice=null, mic=null;
  const getIce=async()=>{ if(ice)return ice; try{ const r=await fetch('/turn',{credentials:'same-origin'}); if(r.ok){ const j=await r.json(); if(Array.isArray(j.iceServers))return ice=j.iceServers; } }catch(e){} return [{urls:'stun:stun.cloudflare.com:3478'}]; };
  const getMic=async()=>{ if(mic)return mic; try{ mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}); }catch(e){ mic=null; } return mic; };
  const cut=(id,say)=>{ const P=peers.get(id); if(!P)return; peers.delete(id); try{ P.pc.close(); }catch(e){} if(P.el){ P.el.remove(); tell({voice:{from:id,stream:null}}); } if(say)rtc(id,{bye:1}); };
  const link=async(id,offer)=>{ let P=peers.get(id); if(P)return P; const pc=new RTCPeerConnection({iceServers:await getIce()}); if(peers.has(id)){ pc.close(); return peers.get(id); } P={id,pc,el:null}; peers.set(id,P);
    pc.onicecandidate=e=>{ if(e.candidate)rtc(id,{c:e.candidate.toJSON()}); }; pc.ontrack=e=>{ if(P.el)return; const el=P.el=document.createElement('audio'); el.autoplay=true; el.srcObject=e.streams[0]||new MediaStream([e.track]); el.style.display='none'; document.body.appendChild(el); el.play().catch(()=>{}); tell({voice:{from:id,stream:el.srcObject,el}}); };
    pc.onconnectionstatechange=()=>{ if(pc.connectionState==='failed'||pc.connectionState==='closed')cut(id,false); };
    if(offer){ const tr=pc.addTransceiver('audio',{direction:'sendrecv'}), m=await getMic(); if(m)tr.sender.replaceTrack(m.getAudioTracks()[0]).catch(()=>{}); const o=await pc.createOffer(); await pc.setLocalDescription(o); rtc(id,{sdp:pc.localDescription.toJSON()}); }
    return P; };
  NET.hear.rtc=async m=>{ const id=m.from&&String(m.from), d=m.d; if(!id||!d)return; if(d.bye||d.no){ cut(id,false); return; }
    try{ if(d.sdp){ if(d.sdp.type==='offer'&&peers.has(id)&&peers.get(id).pc.signalingState!=='stable')cut(id,false); const P=await link(id,false), pc=P.pc; await pc.setRemoteDescription(d.sdp);
        if(d.sdp.type==='offer'){ const tr=pc.getTransceivers()[0], mm=await getMic(); if(tr){ tr.direction='sendrecv'; if(mm)tr.sender.replaceTrack(mm.getAudioTracks()[0]).catch(()=>{}); } const a=await pc.createAnswer(); await pc.setLocalDescription(a); rtc(id,{sdp:pc.localDescription.toJSON()}); } }
      else if(d.c){ const P=peers.get(id); if(P)await P.pc.addIceCandidate(d.c).catch(()=>{}); } }catch(e){ console.warn('HOLO voice',e); } };
  setInterval(()=>{ const me=NET.card.at; if(!NET.on||!Array.isArray(me))return; for(const o of NET.others.values()){ const near=o.at&&String(o.at[4]||'')===String(me[4]||'')&&Math.hypot(o.at[0]-me[0],o.at[1]-me[1])<24; if(near&&!peers.has(o.id)&&NET.me&&NET.me<o.id)link(o.id,true).catch(()=>{}); else if(!near&&peers.has(o.id))cut(o.id,true); } for(const id of [...peers.keys()])if(!NET.others.has(id))cut(id,false); },2000);
  NET.hear.hi=()=>{ onT=Date.now(); };   // (a slot is kept over a reconnect, unless another cook took it meanwhile)
  return {state:d=>{ if(slot<0)return; NET.send({t:'yt',d:{...d,k:slot,ks:since}}); },evt:e=>NET.send({t:'yt',d:{e}}),items:i=>{ if(slot>=0)NET.send({t:'yt',d:{i}}); },ask:id=>NET.send({t:'yt',d:{g:{want:id}}}),slot:()=>slot,
    // the cook's body: under the head, facing as the body faces, in the section's own place (the alley's frame came from who stands in it, for the first cart: yours stands along from it), then the head, wrists and fingers as a headset player's (162cb)
    body:b=>{ if(!FR||!NET.on||!b||!Array.isArray(b.p)||slot<0)return; const now=Date.now(), s=Math.sin(b.y), c=Math.cos(b.y), x=b.p[0]+off(); bodyT=now;
      if(now-mvT>200){ mvT=now; NET.card.at=[+(FR[0]+FR[2]*x+FR[4]*b.p[1]).toFixed(2),+(FR[1]+FR[3]*x+FR[5]*b.p[1]).toFixed(2),0,+Math.atan2(FR[2]*s+FR[4]*c,FR[3]*s+FR[5]*c).toFixed(2),'up','alley']; NET.send({t:'mv',at:NET.card.at}); }
      NET.send({t:'vr',h:b.h,L:b.L,R:b.R}); }}; }
