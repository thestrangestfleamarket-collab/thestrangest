// THE FLYING BOT: PIP, a small bot you call from the menu's CHAT; it flies beside you and answers what you ask (a chat line starting with @, or hold the ASK key and speak), Claude writing the answer (worker/flybot.js) and the browser's own voice saying it to you and the players near you.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, ONLINE, pos, ROOMS, TEXT, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
import {LABELS} from './104-labels.js';
{ const T=TILE, NAME='PIP', RANGE=20*T, R0=.16*T;
  const B=ONLINE.bot={on:false,voice:true,busy:false,name:NAME,recs:new Map()};
  try{ B.on=SAVE.get('flybot')==='1'; B.voice=SAVE.get('flybotv')!=='0'; }catch(e){}
  ONLINE.mine.ab=()=>B.on?1:null;

  /* ---------- the body: a round shell, a dark visor with two lit eyes, a rotor on a stalk, two fins ---------- */
  let GEO=null;
  const make=()=>{ if(!GEO)GEO={ball:new THREE.SphereGeometry(R0,10,7),box:new THREE.BoxGeometry(1,1,1),shell:new THREE.MeshLambertMaterial({color:0xe8e2cc}),dark:new THREE.MeshLambertMaterial({color:0x1b2230}),trim:new THREE.MeshLambertMaterial({color:0x3a8f8a})};
    const g=new THREE.Group(), bx=(w,h,d,m,x,y,z)=>{ const o=new THREE.Mesh(GEO.box,m); o.scale.set(w,h,d); o.position.set(x,y,z); g.add(o); return o; };
    const shell=new THREE.Mesh(GEO.ball,GEO.shell); shell.scale.y=.86; g.add(shell);
    bx(R0*1.5,R0*.62,R0*.3,GEO.dark,0,R0*.08,R0*.8);
    const lit=new THREE.MeshBasicMaterial({color:0x7ef0c8}), eyes=[bx(R0*.26,R0*.3,R0*.1,lit,-R0*.34,R0*.08,R0*.94),bx(R0*.26,R0*.3,R0*.1,lit,R0*.34,R0*.08,R0*.94)];
    bx(R0*.14,R0*.5,R0*.14,GEO.trim,0,R0*1.0,0); bx(R0*.5,R0*.16,R0*.7,GEO.trim,-R0*1.02,-R0*.1,0); bx(R0*.5,R0*.16,R0*.7,GEO.trim,R0*1.02,-R0*.1,0);
    const rotor=bx(R0*2.6,R0*.05,R0*.26,GEO.dark,0,R0*1.28,0);
    scene.add(g); return {g,lit,eyes,rotor,lab:null,say:'',sayT:0,sayFor:0,mode:'',set:false}; };
  const rec=id=>{ let R=B.recs.get(id); if(!R){ R=make(); B.recs.set(id,R); } return R; };
  const drop=id=>{ const R=B.recs.get(id); if(!R)return; scene.remove(R.g); R.lit.dispose(); if(R.lab)R.lab.remove(); B.recs.delete(id); };
  // it trails whoever it belongs to on a short leash, at head height, looking at them
  const fly=(R,x,y,z,now)=>{ const g=R.g, ty=y+1.85*T+Math.sin(now/520)*.05*T; let dx=g.position.x-x, dz=g.position.z-z, d=Math.hypot(dx,dz);
    if(!R.set||d>9*T){ g.position.set(x+.6*T,ty,z+.25*T); R.set=true; R.t=now; dx=.6*T; dz=.25*T; d=Math.hypot(dx,dz); }
    const dt=Math.min(1,(now-R.t)/1000); R.t=now; const k=1-Math.exp(-dt*4), L=.68*T, tx=d>1e-4?x+dx/d*L:x+L, tz=d>1e-4?z+dz/d*L:z;
    g.position.x+=(tx-g.position.x)*k; g.position.z+=(tz-g.position.z)*k; g.position.y+=(ty-g.position.y)*Math.min(1,k*1.6);
    g.rotation.y=Math.atan2(x-g.position.x,z-g.position.z); g.rotation.z=Math.sin(now/900)*.06; R.rotor.rotation.y=now/38;
    const m=R.mode, c=m==='think'?0xf2c14e:m==='hear'?0xff8a6a:0x7ef0c8; if(R.c!==c){ R.c=c; R.lit.color.set(c); }
    const talk=R.say&&now-R.sayT<R.sayFor, s=talk&&!m?.7+.5*Math.abs(Math.sin(now/90)):1; for(const e of R.eyes)e.scale.y=R0*.3*s;
    if(talk||m){ if(!R.lab)R.lab=LABELS.add(); const t=m==='think'?'…':R.say, h=t+'|'+m; if(R.labS!==h){ R.labS=h;
        R.lab.set('<div style="display:inline-block;max-width:min(340px,72vw);white-space:normal;overflow-wrap:anywhere;font:12px Silkscreen,monospace;line-height:1.5;color:#dff7ee;background:rgba(11,13,19,.9);border:1px solid #3a8f8a;padding:4px 7px;margin-bottom:3px">'+TEXT.esc(t)+'</div><div style="font:11px Silkscreen,monospace;color:#7ef0c8;text-shadow:1px 1px 0 #0b0d13,-1px -1px 0 #0b0d13">'+NAME+'</div>'); }
      R.lab.at(g.position.x,g.position.y+R0*1.6,g.position.z).show(true); }
    else if(R.lab)R.lab.show(false); };
  SYS.add('life',()=>{ if(!B.on&&!B.recs.size&&!ONLINE.others.size)return; const now=performance.now();
    if(B.on)fly(rec('me'),pos.x,SHARED.py||0,pos.z,now); else if(B.recs.has('me'))drop('me');
    for(const o of ONLINE.others.values()){ const want=o.x&&o.x.ab&&o.why==='near you'&&o.p; if(want){ const R=rec(o.id); R.g.visible=true; fly(R,o.p.x,o.p.y||0,o.p.z,now); } else if(B.recs.has(o.id)){ const R=B.recs.get(o.id); if(o.x&&o.x.ab){ R.g.visible=false; R.set=false; if(R.lab)R.lab.show(false); } else drop(o.id); } }
    for(const id of B.recs.keys())if(id!=='me'&&!ONLINE.others.has(id))drop(id); },'111dd-flybot');

  /* ---------- its voice: the browser's own, quieter the further its owner stands ---------- */
  const voiceOf=()=>{ const L=speechSynthesis.getVoices(), en=L.filter(v=>/^en/i.test(v.lang)); return en.find(v=>v.default)||en[0]||null; };
  const speak=(t,vol)=>{ if(!B.voice||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return; try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t), v=voiceOf(); if(v)u.voice=v; u.pitch=1.35; u.rate=1.02; u.volume=Math.max(.05,Math.min(1,vol)); speechSynthesis.speak(u); }catch(e){} };
  const tell=(R,t,vol)=>{ R.mode=''; R.say=t; R.sayT=performance.now(); R.sayFor=Math.min(30000,Math.max(4000,t.length*75)); if(UI.log)UI.log(NAME+': '+t,'#7ef0c8'); speak(t,vol); };
  ONLINE.hear.bot=m=>{ const o=ONLINE.others.get(m.id), t=String(m.text||'').slice(0,600); if(!t||!o||!o.p||!(o.x&&o.x.ab)||o.why!=='near you')return; const d=Math.hypot(o.p.x-pos.x,o.p.z-pos.z); if(d<RANGE)tell(rec(o.id),t,1-d/RANGE); };

  /* ---------- asking: what you are near and the hour go with the question; the answer is said here and sent to the players near you ---------- */
  const where=()=>{ let n='', d=1e18; for(const p of UI.places?UI.places():[]){ const q=Math.hypot(p[1]-pos.x,p[2]-pos.z); if(q<d){ d=q; n=p[0]; } } return n; };
  const state=()=>'the player is near '+(where()||'the street')+(ROOMS.cur&&ROOMS.cur.off?', inside '+(ROOMS.cur.name||ROOMS.cur.off):'')+(SHARED.LVL==='down'?', underground':'')+(CLOCK.h!=null?' · the hour in the game (New York\'s real hour) '+Math.floor(CLOCK.h)+':'+String(Math.floor((CLOCK.h%1)*60)).padStart(2,'0'):'');
  B.ask=async t=>{ t=String(t||'').trim().slice(0,400); if(!t||!B.on)return null; const R=rec('me'); if(B.busy)return null; B.busy=true; R.mode='think'; let j=null;
    try{ const r=await fetch('/bot',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({say:t,state:state()})}); j=await r.json(); }catch(e){}
    B.busy=false; if(!B.on)return null; const say=j&&j.say?String(j.say):j&&j.why?'Sorry: '+j.why+'.':'I can only talk on the website.';
    tell(R,say,1); if(j&&j.say)ONLINE.send({t:'bot',text:say}); return say; };
  // your own chat line: "@ ..." or "pip, ..." is a question for it (the line still goes to the chat, so the players near you know what was asked)
  B.heard=t=>{ if(!B.on)return; const m=/^(?:@|pip\b[,:]?)\s*(.+)$/i.exec(String(t||'')); if(m)B.ask(m[1]); };
  // the ASK key, held: the browser writes down what you say; let go and it is asked
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition; let rc=null, got='';
  ONLINE.ask=down=>{ if(!B.on)return; if(!SR){ if(down)SAY(NAME+' CAN\'T HEAR YOU IN THIS BROWSER: TYPE @ AND YOUR QUESTION IN THE CHAT.'); return; }
    if(!down){ if(rc)try{ rc.stop(); }catch(e){} return; } if(rc||B.busy)return; const R=rec('me'); got='';
    try{ if(window.speechSynthesis)speechSynthesis.cancel(); rc=new SR(); rc.lang=navigator.language||'en-US'; rc.interimResults=true; rc.continuous=true;
      rc.onresult=e=>{ let s=''; for(let i=0;i<e.results.length;i++)s+=e.results[i][0].transcript; got=s; R.mode='hear'; R.say='… '+s; R.sayT=performance.now(); R.sayFor=60000; R.labS=''; };
      rc.onerror=e=>{ if(e.error==='not-allowed'||e.error==='service-not-allowed')SAY('ALLOW THE MICROPHONE TO TALK TO '+NAME+'.'); };
      rc.onend=()=>{ rc=null; const t=got.trim(); got=''; R.mode=''; R.say=''; if(!t)return; if(ONLINE.on&&ONLINE.said)ONLINE.said(('@ '+t).slice(0,200)); else B.ask(t); };
      R.mode='hear'; R.say='… listening'; R.sayT=performance.now(); R.sayFor=60000; rc.start(); }catch(e){ rc=null; R.mode=''; } };

  /* ---------- the settings: FLYING BOT (call it or send it off) and BOT VOICES, in the menu's CHAT ---------- */
  B.set=on=>{ B.on=!!on; try{ SAVE.set('flybot',B.on?'1':'0'); }catch(e){} if(!B.on){ if(window.speechSynthesis)speechSynthesis.cancel(); if(rc)try{ rc.stop(); }catch(e){} } else { const R=rec('me'); R.set=false; tell(R,'Hello! Ask me anything: type @ and your question in the chat'+(SR?', or hold the '+String(UI.keyOf?UI.keyOf('ask'):'/').toUpperCase()+' key and speak.':'.'),1); } };
  const menu=()=>{ const P=document.querySelector('#menu [data-p="chat"]'); if(!P)return setTimeout(menu,1000); if(P.querySelector('#dflybot'))return;
    const R=document.createElement('div'); R.className='row'; R.innerHTML='<span>FLYING BOT</span><button class="btn" id="dflybot"></button><span>VOICE</span><button class="btn" id="dflybotv"></button><span id="dflybotk" style="color:#8a8f9c"></span>'; P.prepend(R);
    const b=R.querySelector('#dflybot'), v=R.querySelector('#dflybotv'), show=()=>{ b.textContent=B.on?'ON':'OFF'; b.setAttribute('aria-pressed',String(B.on)); v.textContent=B.voice?'ON':'OFF'; v.setAttribute('aria-pressed',String(B.voice)); R.querySelector('#dflybotk').textContent='TYPE @ IN THE CHAT'+(SR&&UI.keyOf?' · OR HOLD '+String(UI.keyOf('ask')).toUpperCase()+' AND SPEAK':''); };
    b.onclick=()=>{ B.set(!B.on); show(); b.blur(); }; v.onclick=()=>{ B.voice=!B.voice; try{ SAVE.set('flybotv',B.voice?'1':'0'); }catch(e){} if(!B.voice&&window.speechSynthesis)speechSynthesis.cancel(); show(); v.blur(); }; show(); };
  menu();
  window.FLYBOTDBG=()=>({tile:T,me:pos,on:B.on,voice:B.voice,busy:B.busy,bots:[...B.recs].map(([id,R])=>({id,x:R.g.position.x,y:R.g.position.y,z:R.g.position.z,say:R.say,mode:R.mode,seen:R.g.visible}))}); }
