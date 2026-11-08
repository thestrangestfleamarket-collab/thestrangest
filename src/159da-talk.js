// THE TALK WINDOW: TALK — a merchant's double click opens their wares (8 Nov 2026: no talk boxes); TALK.talk still opens the window for a script: its line types out in a window with your replies under it (W/S or 1-4, Enter or a click picks, Esc leaves). A character's script is `talk` in characters.json (the character editor's TALK tab); one without gets a short chat from the line pools. A reply can lead on, open the shop, give or take items, and set what the character remembers (saved with your things).
import {THREE} from './003-shx.js';
import {CHARS, FORAGE, INV, keys, LINES, LOOKS, NPCS, pos, SFX, SHOPS, TALK, TEXT, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
{ const T=TILE, esc=TEXT.esc;
  const NOTALK=/^(ogre|skeleton|slime|dragon|rat|frog|bat|wasp|spider|snake)$|^(ogre|skeleton)_/, CPS=45;
  LINES.add('about',['This is the Strangest Flea Market. Everything is for sale, eventually.','Market St runs the whole block. The park is north, the subway under your feet.','You find things here you did not know you lost.',
    'Stalls open with the sun. The odd ones open later.','Ask the merchants. They know what sells and who buys.','Mind the dragons. They mostly just sit.']);
  LINES.add('bye',['See you around.','Take care out there.','Mind how you go.','Come back soon.','Later, {{name}}.']);
  let M={}; try{ M=JSON.parse(OWNED.get('talk')||'{}')||{}; }catch(e){ M={}; }
  const mem=id=>M[id]||(M[id]={}), save=()=>{ try{ OWNED.set('talk',JSON.stringify(M)); }catch(e){} };
  TALK.flags=id=>Object.assign({},mem(id)); TALK.remember=(id,k,v=1)=>{ if(v==null||v===false)delete mem(id)[k]; else mem(id)[k]=v; save(); };   // what a character remembers, by id (quests read it; a check sets it)
  const recOf=N=>{ const id=CHARS.id(N); return (CHARS.store&&CHARS.store[id])||(CHARS.rec&&CHARS.rec(id))||{}; };
  const nm=id=>(FORAGE.NM&&FORAGE.NM[id])||String(id).toUpperCase().replace(/_/g,' ');
  const have=id=>(INV.items&&INV.items[id])||0, you=()=>(LOOKS.L&&LOOKS.L.name)||'friend';
  const item=a=>{ const [id,n]=String(a||'').trim().split(/\s+/); return {id,n:Math.max(1,+n||1)}; };
  // a reply's conditions, each word one: flag  !flag  flag=value  has:id[:n]  !has:id  cash:n  name:arg (a test another system registers in TALK.tests)
  const test=(c,m)=>String(c||'').trim().split(/\s+/).filter(Boolean).every(w=>{ const neg=w[0]==='!', s=neg?w.slice(1):w; let ok;
    if(s.startsWith('has:')){ const [id,n]=s.slice(4).split(':'); ok=have(id)>=(+n||1); } else if(s.includes(':')&&TALK.tests[s.split(':')[0]]){ const i=s.indexOf(':'); ok=!!TALK.tests[s.slice(0,i)](s.slice(i+1)); } else if(s.includes('=')){ const [k,v]=s.split('='); ok=String(m[k]??'')===v; } else ok=!!m[s];
    return neg?!ok:ok; });
  // a character with no script: hello, what this place is, the shop if it keeps one, goodbye
  const chat=N=>{ '@later'; const shop=TALK.shops.has(N)||CHARS.trade&&CHARS.trade(N), R=[{t:'WHAT IS THIS PLACE?',go:'about'}]; if(shop)R.unshift({t:'WHAT DO YOU SELL?',do:'shop'}); R.push({t:'GOODBYE.',go:'bye'});
    return {start:'hi',lines:{hi:{say:'@greet',opts:R},about:{say:'@about',opts:R.filter(r=>r.go!=='about')},bye:{say:'@bye',opts:[]}}}; };
  TALK.tests.cash=a=>(INV.cash||0)>=(+a||0);
  TALK.script=N=>{ const t=recOf(N).talk||N.talk, s=t&&t.lines&&t.lines[t.start]?t:chat(N); return s; };   // a townsperson's own life is something to ask about (src/158-lives.js)

  const P=document.createElement('div'); P.id='talkp'; P.hidden=true;
  P.style.cssText='position:fixed;left:50%;bottom:calc(64px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(620px,94vw);z-index:22;padding:12px 16px 10px;font:12px Silkscreen,monospace;letter-spacing:.4px;line-height:1.6;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  P.innerHTML='<b id="talkn" style="color:#f2c14e"></b><div id="talkt" style="min-height:3.2em;margin:4px 0 8px"></div><div id="talko"></div><div style="color:#6f7686;font-size:10px;margin-top:6px">W/S OR 1-4 · ENTER PICKS · ESC LEAVES</div>';
  document.body.appendChild(P);
  const tEl=P.querySelector('#talkt'), oEl=P.querySelector('#talko');
  let N=null, S=null, id='', L=null, text='', shown=0, acc=0, opts=[], at=0, last=0, keep=null;
  const voice=()=>N.voice||(N.voice=SFX.voiceOf(N.key||N.name));
  const sayOf=s=>{ const a=Array.isArray(s)?s[Math.floor(Math.random()*s.length)]:String(s||''); if(a[0]==='@')return LINES.pick(a.slice(1),{name:you()})||'...'; return a.replace(/\{(\w+)\}/g,(m,k)=>k==='name'?you():TALK.vars[k]?TALK.vars[k]():m); };
  const drawOpts=()=>{ '@later'; oEl.innerHTML=opts.map((o,i)=>{ const lack=o.do==='take'&&have(item(o.arg).id)<item(o.arg).n;
      return `<div data-i="${i}" style="cursor:${lack?'default':'pointer'};padding:2px 6px;${i===at?'background:#1c2130;color:#f2c14e':''}${lack?';color:#6f7686':''}">${i+1}. ${esc(o.t)}${lack?` <span style="color:#8a6a5a">(YOU NEED ${item(o.arg).n} ${esc(nm(item(o.arg).id))})</span>`:''}</div>`; }).join('')||'<div data-i="-1" style="cursor:pointer;padding:2px 6px;background:#1c2130;color:#f2c14e">1. (LEAVE)</div>'; };
  const show=k=>{ if(!N)return; if(!k||!S.lines[k])return TALK.close(); id=k; L=S.lines[k]; text=sayOf(L.say); shown=0; acc=0; at=0;
    const m=mem(CHARS.id(N)); opts=(L.opts||[]).filter(o=>test(o.if,m)); oEl.innerHTML=''; tEl.textContent=''; if(L.set)set(L.set); };
  const set=a=>{ const m=mem(CHARS.id(N)); for(const w of String(a).trim().split(/\s+/).filter(Boolean)){ const [k,v]=w.split('='); if(k[0]==='!')delete m[k.slice(1)]; else m[k]=v==null?1:v; } save(); };
  const pick=i=>{ '@later'; if(!N)return; if(shown<text.length){ shown=text.length; tEl.textContent=text; drawOpts(); return; } if(i===-1||!opts.length)return TALK.close(); const o=opts[i]; if(!o)return;
    if(o.do==='take'){ const {id:t,n}=item(o.arg); if(have(t)<n)return; FORAGE.take(t,n); SAY(`YOU HAND OVER ${n} ${nm(t)}.`,'#e8e2cc'); }
    else if(o.do==='give'){ const {id:t,n}=item(o.arg); FORAGE.give(t,n); FORAGE.draw&&FORAGE.draw(); SAY(`YOU GET ${n} ${nm(t)}.`,'#f2c14e'); SFX.play&&SFX.play('clunk',{vol:.4}); }
    else if(o.do==='set')set(o.arg);
    else if(TALK.ops[o.do])TALK.ops[o.do](o.arg||'',N);
    if(o.set)set(o.set);
    if(o.do==='shop'){ const n0=N, f=TALK.shops.get(n0); TALK.close(); if(f)f(); else if(SHOPS.open)SHOPS.open(n0); return; }
    show(o.go); };
  const loop=t=>{ if(!N)return; const dt=Math.min(.1,(t-(last||t))/1000); last=t;
    if(shown<text.length){ acc+=dt*CPS; const n=Math.min(text.length,Math.floor(acc)); if(n>shown){ if((n&1)===0||n===text.length)SFX.blip(voice(),{at:{x:N.st.x,z:N.st.z},far:14*T}); shown=n; tEl.textContent=text.slice(0,n); if(n===text.length)drawOpts(); } }
    if(Math.hypot(N.st.x-pos.x,N.st.z-pos.z)>5*T||VIT.dead)TALK.close(); }; SYS.add('win',loop,'159da-talk');
  // no talk boxes (owner, 8 Nov 2026: "remove dialogue boxes from characters in game, when you double click a merchant yu just see their wares"): a merchant's double click opens their wares, anyone else's does nothing; the window below stays for a script that asks for it (TALK.talk)
  const shopOf=n=>TALK.shops.get(n)||(CHARS.trade&&CHARS.trade(n)?()=>SHOPS.open(n):null);
  TALK.sells=n=>!!(n&&shopOf(n));
  TALK.open=n=>{ if(!n||!n.st||VIT.dead)return; const f=shopOf(n); if(f)f(); };
  TALK.talk=n=>{ '@later'; if(!n||!n.st||VIT.dead)return; if(N)TALK.close(); N=n; S=TALK.script(N); const m=mem(CHARS.id(N)); m._n=(+m._n||0)+1; save();
    const st=N.st; keep={to:st.to,next:st.next,face:st.face,hold:st.hold}; st.to=null; st.next=null; st.face={x:pos.x,z:pos.z}; st.hold=true;
    P.querySelector('#talkn').textContent=(N.name||'SOMEONE').toUpperCase(); P.hidden=false; TALK.on=true; if(keys.clear)keys.clear(); show(S.start); last=0; };
  TALK.close=()=>{ if(N&&N.st&&keep){ const st=N.st; st.face=keep.face; st.hold=keep.hold; st.to=keep.to; st.next=keep.next; if(!st.hold)st.wait=.5; } N=null; S=null; keep=null; P.hidden=true; TALK.on=false; };
  TALK.memory=n=>Object.assign({},mem(CHARS.id(n)));
  P.addEventListener('click',e=>{ const d=e.target.closest('[data-i]'); if(d)pick(+d.dataset.i); else if(shown<text.length)pick(0); });
  P.addEventListener('mousemove',e=>{ const d=e.target.closest('[data-i]'); if(d&&+d.dataset.i!==at&&+d.dataset.i>=0){ at=+d.dataset.i; drawOpts(); } });
  addEventListener('keydown',e=>{ if(!TALK.on||e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return; const k=e.key.toLowerCase(), n=Math.max(1,opts.length);
    if(k==='escape')TALK.close(); else if(k==='w'||k==='arrowup'){ at=(at+n-1)%n; drawOpts(); } else if(k==='s'||k==='arrowdown'){ at=(at+1)%n; drawOpts(); }
    else if(k==='enter'||k===' '||k==='e')pick(opts.length?at:-1); else if(/^[1-9]$/.test(k))pick(opts.length?+k-1:-1); else if(!/^(a|d|arrowleft|arrowright|shift)$/.test(k))return;
    e.preventDefault(); e.stopImmediatePropagation(); },true);
  addEventListener('keyup',e=>{ if(TALK.on)e.stopImmediatePropagation(); },true);
  // every merchant is a thing to double-click: their wares (8 Nov 2026)
  const bound=new Set();
  const bind=n=>{ if(!n||!n.g||!n.st||!n.key||bound.has(n)||NOTALK.test(n.key)||!TALK.sells(n))return; bound.add(n);
    for(const th of UI.things)if(th.npc===n){ th.act=()=>TALK.open(n); return; }
    const sc=n.g.scale.y||1, H=(n.H||1.8*T)/sc, hb=new THREE.Mesh(new THREE.BoxGeometry(1.2*T/sc,H,1.2*T/sc),new THREE.MeshBasicMaterial({visible:false})); hb.position.y=H/2; n.g.add(hb);
    UI.thing({name:n.name||'SOMEONE',npc:n,obj:hb,reach:1.6*T,near:3*T,tall:(n.H||1.8*T)+.3*T,act:()=>TALK.open(n)}); };
  TALK.sync=()=>{ for(const n of NPCS.all())try{ bind(n); }catch(e){} };
  SYS.onStart(()=>{ SHOPS.sync(); TALK.sync(); SYS.every(TALK.sync,5000,'159da-talk sync'); },'159da-talk'); }
