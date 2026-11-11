// VOICE: push-to-talk voice between players near each other (WebRTC browser to browser, the Block hands over the handshake, Cloudflare TURN relays when a network needs it); heard from where they stand, fading out by 20 m.
import {SHARED, THREE} from './003-shx.js';
import {ONLINE, pos, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SAVE} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
{ const RANGE=20, LINK=24*TILE, DROP=30*TILE, MAXP=8, M=TILE;
  const V=ONLINE.voice={on:true,talking:false,peers:new Map(),mic:null,ctx:null};
  try{ V.on=SAVE.get('voice')!=='0'; }catch(e){}
  let ice=null, iceT=0, micAsk=null, HUD=null, scanT=0;
  const rtc=(to,d)=>ONLINE.send({t:'rtc',to,d});
  const getIce=async()=>{ if(ice&&performance.now()-iceT<36e5)return ice; try{ const r=await fetch('/turn',{credentials:'same-origin'}); if(r.ok){ const j=await r.json(); if(Array.isArray(j.iceServers)){ ice=j.iceServers; iceT=performance.now(); return ice; } } }catch(e){} return ice||[{urls:'stun:stun.cloudflare.com:3478'}]; };
  const actx=()=>{ if(!V.ctx){ const C=window.AudioContext||window.webkitAudioContext; if(!C)return null; V.ctx=new C(); } if(V.ctx.state==='suspended')V.ctx.resume().catch(()=>{}); return V.ctx; };
  for(const ev of ['pointerdown','keydown'])addEventListener(ev,()=>{ if(V.ctx&&V.ctx.state==='suspended')V.ctx.resume().catch(()=>{}); },{passive:true});

  /* ---------- one link to each player near you: the smaller id offers, the other answers ---------- */
  const link=async(id,offer)=>{ let P=V.peers.get(id); if(P)return P;
    const pc=new RTCPeerConnection({iceServers:await getIce()}); if(V.peers.has(id)){ pc.close(); return V.peers.get(id); }
    P={id,pc,q:[],el:null,src:null,pan:null,an:null,buf:null,t0:performance.now()};
    V.peers.set(id,P);
    if(offer)mine(P,pc.addTransceiver('audio',{direction:'sendrecv'}));   // (the answerer sends on the offer's own line, below)
    pc.onicecandidate=e=>{ if(e.candidate)rtc(id,{c:e.candidate.toJSON()}); };
    pc.ontrack=e=>hear(P,e.streams[0]||new MediaStream([e.track]));
    pc.onconnectionstatechange=()=>{ if(pc.connectionState==='failed'){ const o=ONLINE.others.get(id); if(o)o.vno=performance.now(); cut(id,true); } };   // (no way through: tried again in ten seconds)
    if(offer){ const o=await pc.createOffer(); await pc.setLocalDescription(o); rtc(id,{sdp:pc.localDescription.toJSON()}); }
    return P; };
  const mine=(P,tr)=>{ if(!tr)return; tr.direction='sendrecv'; P.tx=tr.sender; if(V.mic)P.tx.replaceTrack(V.mic.getAudioTracks()[0]).catch(()=>{}); };
  const cut=(id,tell)=>{ const P=V.peers.get(id); if(!P)return; V.peers.delete(id); try{ P.pc.close(); }catch(e){} for(const n of [P.src,P.g,P.pan,P.an])try{ n&&n.disconnect(); }catch(e){} if(P.el){ P.el.srcObject=null; P.el.remove(); } if(tell)rtc(id,{bye:1}); const o=ONLINE.others.get(id); if(o)o.vt=0; };
  // their voice through the speakers: placed where they stand (the browser's 3D sound), loud close, gone by RANGE
  const hear=(P,ms)=>{ const C=actx(); if(!C||P.src)return;
    const el=P.el=document.createElement('audio'); el.muted=true; el.autoplay=true; el.srcObject=ms; el.style.display='none'; document.body.appendChild(el); el.play().catch(()=>{});   // (Chrome sends a far stream to Web Audio only while an element plays it)
    P.src=C.createMediaStreamSource(ms); P.g=C.createGain(); P.pan=C.createPanner(); Object.assign(P.pan,{panningModel:'HRTF',distanceModel:'linear',refDistance:1.5,maxDistance:RANGE,rolloffFactor:1});
    P.an=C.createAnalyser(); P.an.fftSize=256; P.buf=new Uint8Array(P.an.fftSize);
    P.src.connect(P.an); P.src.connect(P.g); P.g.connect(P.pan); P.pan.connect(C.destination); };
  ONLINE.hear.rtc=async m=>{ const id=m.from&&String(m.from), d=m.d, o=id&&ONLINE.others.get(id); if(!id||!d)return;
    if(d.bye||d.no){ cut(id,false); if(o&&d.no)o.vno=performance.now(); return; }
    if(!V.on||d.sdp&&d.sdp.type==='offer'&&!(o&&o.why==='near you'&&o.dd<DROP)){ if(d.sdp)rtc(id,{no:1}); return; }
    try{ if(d.sdp){ if(d.sdp.type==='offer'&&V.peers.has(id)&&V.peers.get(id).pc.signalingState!=='stable')cut(id,false);
        const P=await link(id,false), pc=P.pc; await pc.setRemoteDescription(d.sdp);
        if(d.sdp.type==='offer'){ if(!P.tx)mine(P,pc.getTransceivers()[0]); const a=await pc.createAnswer(); await pc.setLocalDescription(a); rtc(id,{sdp:pc.localDescription.toJSON()}); }
        for(const c of P.q.splice(0))await pc.addIceCandidate(c).catch(()=>{}); }
      else if(d.c){ const P=V.peers.get(id); if(!P)return; if(P.pc.remoteDescription)await P.pc.addIceCandidate(d.c).catch(()=>{}); else P.q.push(d.c); } }
    catch(e){ console.warn('VOICE: could not link to '+id,e); cut(id,true); } };

  /* ---------- your microphone: asked for the first time you hold the key; sends only while it is held ---------- */
  const mic=()=>micAsk||(micAsk=(async()=>{ if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ SAY('THIS BROWSER HAS NO MICROPHONE FOR VOICE.','#c8a090'); return null; }
    try{ V.mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}); }
    catch(e){ micAsk=null; SAY('NO MICROPHONE: ALLOW IT IN THE BROWSER TO TALK.','#c8a090'); return null; }
    const t=V.mic.getAudioTracks()[0]; t.enabled=V.talking; for(const P of V.peers.values())if(P.tx)P.tx.replaceTrack(t).catch(()=>{}); return V.mic; })());
  ONLINE.talk=on=>{ on=!!on&&V.on&&ONLINE.on; if(on===V.talking)return; V.talking=on; actx(); hud();
    if(on&&!V.mic)mic().then(s=>{ if(s)s.getAudioTracks()[0].enabled=V.talking; }); else if(V.mic)V.mic.getAudioTracks()[0].enabled=on; };
  addEventListener('blur',()=>ONLINE.talk(false));
  const hud=()=>{ if(!HUD){ HUD=document.createElement('div'); HUD.id='vtalk'; HUD.setAttribute('role','status'); HUD.style.cssText='position:fixed;left:50%;bottom:calc(64px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);padding:4px 10px;background:#0b0d13e0;border:2px solid #7dffa8;color:#7dffa8;font:12px Silkscreen,monospace;letter-spacing:1px;z-index:6;pointer-events:none'; document.body.appendChild(HUD); }
    const n=[...V.peers.values()].filter(P=>P.pc.connectionState==='connected').length; HUD.textContent='((·)) TALKING'+(n?' · '+n+' NEAR CAN HEAR':' · NOBODY NEAR'); HUD.hidden=!V.talking; };

  /* ---------- each frame: links follow who is near; their voices move with them and with your ears ---------- */
  const fw=new THREE.Vector3();
  SYS.add('life',dt=>{ if(!ONLINE.on){ if(V.peers.size)for(const id of [...V.peers.keys()])cut(id,false); return; }
    const now=performance.now();
    if(now-scanT>500){ scanT=now; const C=[];
      for(const o of ONLINE.others.values())if(o.why==='near you'&&o.dd<(V.peers.has(o.id)?DROP:LINK)&&!(o.vno&&now-o.vno<1e4))C.push(o);
      C.sort((a,b)=>a.dd-b.dd); const keep=new Set(C.slice(0,MAXP).map(o=>o.id));
      for(const [id,P] of [...V.peers])if(!keep.has(id)||!V.on)cut(id,true); else if(P.pc.connectionState!=='connected'&&now-P.t0>2e4){ const o=ONLINE.others.get(id); if(o)o.vno=now; cut(id,true); }   // (never got through: again in ten seconds)
      if(V.on)for(const id of keep)if(!V.peers.has(id)&&ONLINE.me&&ONLINE.me<id)link(id,true).catch(e=>{ console.warn('VOICE:',e); cut(id,true); });
      if(V.talking)hud(); }
    const C=V.ctx; if(!C||!V.peers.size)return; const L=C.listener, cam=SHARED.cam, lx=pos.x/M, ly=(SHARED.py||0)/M+1.6, lz=pos.z/M;
    cam.getWorldDirection(fw);
    if(L.positionX){ L.positionX.value=lx; L.positionY.value=ly; L.positionZ.value=lz; L.forwardX.value=fw.x; L.forwardY.value=fw.y; L.forwardZ.value=fw.z; L.upX.value=0; L.upY.value=1; L.upZ.value=0; }
    else{ L.setPosition(lx,ly,lz); L.setOrientation(fw.x,fw.y,fw.z,0,1,0); }
    for(const P of V.peers.values()){ const o=ONLINE.others.get(P.id); if(!P.pan||!o||!o.p)continue; const x=o.p.x/M, y=(o.p.y||0)/M+1.6, z=o.p.z/M;
      if(P.pan.positionX){ P.pan.positionX.value=x; P.pan.positionY.value=y; P.pan.positionZ.value=z; } else P.pan.setPosition(x,y,z);
      P.an.getByteTimeDomainData(P.buf); let s=0; for(let i=0;i<P.buf.length;i+=4){ const v=P.buf[i]-128; s+=v*v; } if(Math.sqrt(s/(P.buf.length/4))>4)o.vt=now; }   // speaking: the ((·)) by their name (111d)
  },'111dc-voice');
  window.VOICEDBG=()=>({on:V.on,talking:V.talking,mic:!!V.mic,ctx:V.ctx&&V.ctx.state,peers:[...V.peers.values()].map(P=>({id:P.id,state:P.pc.connectionState,sig:P.pc.signalingState,heard:!!P.src}))});

  // the setting: VOICE (hear and be heard) in the menu's CHAT, beside WORDS STAY
  const set=()=>{ const P=document.querySelector('#menu [data-p="chat"]'); if(!P)return setTimeout(set,1000); if(P.querySelector('#dvoice'))return;
    const R=document.createElement('div'); R.className='row'; R.innerHTML='<span>VOICE</span><button class="btn" id="dvoice"></button><span id="dvoicek" style="color:#8a8f9c"></span>'; P.prepend(R);
    const B=R.querySelector('#dvoice'), show=()=>{ B.textContent=V.on?'ON':'OFF'; B.setAttribute('aria-pressed',String(V.on)); R.querySelector('#dvoicek').textContent=UI.keyOf?'HOLD '+String(UI.keyOf('talk')).toUpperCase()+' TO TALK':''; };
    B.onclick=()=>{ V.on=!V.on; try{ SAVE.set('voice',V.on?'1':'0'); }catch(e){} if(!V.on){ ONLINE.talk(false); for(const id of [...V.peers.keys()])cut(id,true); } show(); B.blur(); }; show(); };
  set(); }
