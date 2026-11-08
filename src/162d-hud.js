// THE HUD: HUD draws the round minimap top right (from the MAP's plan), the message log bottom left (the game's lines and the chat, UI.log) and the quick bar (ten slots on keys 1 to 0, filled by dragging from the pack).
import {SHARED} from './003-shx.js';
import {BAG, ED, FORAGE, HUD, INV, LEVELS, MOTION, ONLINE, PASSPORT, pos, ROOMS, TEXT, UI, WE, WIELD, WX, ZONES} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {MODS, SECTION, SYS, TILE} from './006-map-pre.js';
import {QUESTS} from './160a-quests.js';
{ const T=TILE, MW=150, esc=TEXT.esc; let N=Math.max(1,Math.min(40,+OWNED.get('quickn')||10));   // (how many quick slots: the player's choice, 1 to 40, owner 7 Nov 2026; the first ten on keys 1 to 0)
  const css=document.createElement('style'); css.textContent=`#hmap{position:fixed;right:calc((24px + var(--fx,0px) + env(safe-area-inset-right,0px)) / var(--uiz,1));top:calc((24px + var(--fy,0px) + env(safe-area-inset-top,0px)) / var(--uiz,1));width:${MW}px;z-index:5;font:9px Silkscreen,monospace;letter-spacing:1px;color:#fff;text-shadow:1px 1px 0 #000,0 0 3px #000;zoom:var(--uiz,1)}
    #hmap[hidden]{display:none} #hmap canvas{display:block;width:${MW}px;height:${MW}px;border-radius:50%;image-rendering:pixelated;cursor:pointer} #hmap canvas[hidden]{display:none} #hmap .f{padding-top:5px;text-align:center} #hmap .f span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #hlog{position:fixed;left:calc((24px + var(--fx,0px) + env(safe-area-inset-left,0px)) / var(--uiz,1));bottom:calc((24px + var(--fy,0px) + var(--logup,0px) + env(safe-area-inset-bottom,0px)) / var(--uiz,1));width:min(320px,40vw);z-index:6;font:11px Silkscreen,monospace;letter-spacing:.3px;color:#fff;text-shadow:1px 1px 0 #000,0 0 3px #000;pointer-events:none;zoom:var(--uiz,1)}
    #hlines{display:flex;flex-direction:column;justify-content:flex-end;max-height:150px;overflow:hidden} #hlines div{padding:1px 0;word-wrap:break-word} #hlines div.old{opacity:.5} #hlines b{color:#ffd27a;font-weight:400}
    #hlog:has(#onl.open) #hlines{max-height:60vh;overflow:auto;pointer-events:auto} #hlog:has(#onl.open) #hlines div.old{opacity:.8}
    #hlog #onl{position:static;width:auto;margin-top:4px;zoom:1} #hlog #onllog{display:none}
    #hqb{position:fixed;left:50%;bottom:calc((24px + var(--fy,0px) + env(safe-area-inset-bottom,0px)) / var(--uiz,1));transform:translateX(-50%);display:flex;gap:3px;z-index:6;zoom:var(--uiz,1)} #hqb[hidden]{display:none}
    #hqb .qs{width:44px;height:44px;position:relative;display:flex;align-items:center;justify-content:center;text-align:center;padding:3px;background:#00000066;font:8px Silkscreen,monospace;line-height:1.25;color:#fff;text-shadow:1px 1px 0 #000;cursor:pointer;overflow:hidden;word-break:break-word}
    #hqb .qg{width:22px;display:flex;align-items:center;justify-content:center;cursor:grab;color:#ffffffa0;background:#00000066;font:14px monospace;user-select:none} #hqb .qg:active{cursor:grabbing} #hqb .qs.on{background:#000000b8} #hqb .qs.none{color:#ffffff66} #hqb .qs.over{background:#ffffff30} #hqb .qs em,#hqb .qs u{position:absolute;font-style:normal;text-decoration:none;color:#ffffffa0} #hqb .qs em{left:3px;top:2px} #hqb .qs u{right:3px;bottom:2px}`;
  document.head.appendChild(css); window.HUD=HUD;

  /* ---------- the log ---------- */
  const LG=document.createElement('div'); LG.id='hlog'; LG.innerHTML='<div id="hlines" aria-live="polite"></div><div id="hchat"></div>'; document.body.appendChild(LG); const LN=LG.firstChild;
  UI.log=(text,color,who)=>{ const L=LN.lastChild, key=(who||'')+'\u0001'+text; if(L&&L.dataset.k===key){ L.dataset.n=String(+L.dataset.n+1); L.dataset.t=String(performance.now()); L.lastChild.textContent=' ×'+L.dataset.n; L.classList.remove('old'); LN.appendChild(L); return; }   // the same line again counts up, never repeats
    const d=document.createElement('div'); d.dataset.k=key; d.dataset.n='1'; d.dataset.t=String(performance.now()); d.innerHTML=(who?'<b>'+esc(who)+'</b> ':'')+esc(text); if(color&&!who)d.style.color=color; d.appendChild(document.createElement('span')); LN.appendChild(d); while(LN.children.length>40)LN.firstChild.remove(); };
  HUD.lines=()=>[...LN.children].map(d=>d.textContent);

  /* ---------- the minimap ---------- */
  const MP=document.createElement('div'); MP.id='hmap'; MP.hidden=true; MP.innerHTML=`<canvas width="${MW}" height="${MW}"></canvas><div class="f"><span id="hmz"></span><span id="hmxy"></span><span id="hmwx"></span></div>`; document.body.appendChild(MP);
  const cv=MP.firstChild, g=cv.getContext('2d'), zN=MP.querySelector('#hmz'), xyN=MP.querySelector('#hmxy'), wxN=MP.querySelector('#hmwx'); let Q=null, qTried=0;
  cv.onclick=()=>{ if(dun()&&MODS.dunMap){ MODS.dunMap.open(); return; } if(UI.mapWindow)UI.mapWindow(); };
  const dun=()=>SHARED.LVL==='down'&&MODS.dungeon&&MODS.dungeon.inside&&MODS.dungeon.inside(pos.x,pos.z);   // below ground in the dungeon the corner map is the dungeon's (owner, 8 Nov 2026)
  const plan=()=>{ if(Q||qTried)return Q; qTried=1; try{ Q=UI.mapPlan&&UI.mapPlan(); }catch(e){ console.warn('HUD map',e); } return Q; };
  const paint=()=>{ const K=4, D=dun()&&MODS.dunMap?MODS.dunMap.plan():null, Q=D||plan(); if(!Q){ cv.hidden=true; return; } cv.hidden=false; const B=SHARED.BOD, mx=D?D.wx(pos.x):Q.sx(B.OX+pos.x/T), my=D?D.wz(pos.z):Q.sy(B.OY+pos.z/T), r=MW/2, w=MW/K*Q.S;
    g.imageSmoothingEnabled=false; g.clearRect(0,0,MW,MW); g.save(); g.beginPath(); g.arc(r,r,r,0,Math.PI*2); g.clip(); g.fillStyle='#0b0d12'; g.fillRect(0,0,MW,MW); g.drawImage(Q.cv,mx-w/2,my-w/2,w,w,0,0,MW,MW);
    const sx=x=>r+(x-mx)*K/Q.S, sy=y=>r+(y-my)*K/Q.S;
    for(const o of ONLINE.others.values()){ if(!o.p)continue; if(D&&!MODS.dungeon.inside(o.p.x,o.p.z))continue; const a=sx(D?D.wx(o.p.x):Q.sx(B.OX+o.p.x/T)), b=sy(D?D.wz(o.p.z):Q.sy(B.OY+o.p.z/T)); if(Math.hypot(a-r,b-r)>r-3)continue; g.fillStyle='#000'; g.fillRect(a-3,b-3,6,6); g.fillStyle='#ffd27a'; g.fillRect(a-2,b-2,4,4); }
    { const A=!D&&window.QUESTS&&QUESTS.anchor&&QUESTS.anchor(); if(A){ const a=sx(Q.sx(B.OX+A.x/T)), b=sy(Q.sy(B.OY+A.z/T)), d=Math.hypot(a-r,b-r), k=d>r-6?(r-6)/d:1, x=r+(a-r)*k, y=r+(b-r)*k; g.save(); g.translate(x,y); g.rotate(Math.PI/4); g.fillStyle='#000'; g.fillRect(-4,-4,8,8); g.fillStyle='#7ad3ff'; g.fillRect(-3,-3,6,6); g.restore(); } }   // the quest's step: a blue diamond, held at the rim when it is off the map
    const h=SHARED.heading||0, dx=Math.sin(h), dy=-Math.cos(h); g.translate(r,r); g.rotate(Math.atan2(dy,dx)+Math.PI/2); g.beginPath(); g.moveTo(0,-7); g.lineTo(5,6); g.lineTo(0,3); g.lineTo(-5,6); g.closePath(); g.fillStyle='#fff'; g.fill(); g.lineWidth=1; g.strokeStyle='#000'; g.stroke(); g.restore();
    g.fillStyle='#fff'; g.strokeStyle='#000'; g.lineWidth=2; g.font='8px Silkscreen,monospace'; g.textAlign='center'; g.strokeText('N',r,10); g.fillText('N',r,10); };
  let mt=0, ot=0;
  const tickMap=dt=>{ if(!window.__started)return; const dn=dun(), on=dn||SHARED.LVL==='up'&&!ROOMS.cur&&!(ROOMS.offIn&&ROOMS.offIn())&&!(MODS.apts&&MODS.apts.in); if(MP.hidden===on)MP.hidden=!on; if(!on)return;
    if((mt+=dt)<.2)return; mt=0; paint(); const z=ZONES.cur, sec=SECTION.id; zN.textContent=dn?String(LEVELS.of.dungeon.label()).toUpperCase().replace(/^THE DUNGEON — /,''):(sec?sec+' · ':'')+(z&&z.name?String(z.name).toUpperCase():''); xyN.textContent=dn?'':'x '+Math.round(pos.x/T)+' z '+Math.round(pos.z/T); if(dn)wxN.textContent=''; else if(WX.forecast){ const F=WX.forecast(); wxN.textContent=F.now.kind+' '+F.now.temp+'°'+(F.next?' · '+F.next.kind+' IN '+(F.next.inMin>=60?Math.round(F.next.inMin/60)+'H':F.next.inMin+'M'):''); } };   // the forecast (4 Nov 2026): the weather now, the temperature, and the next change when the weather runs free

  /* ---------- the quick bar ---------- */
  const QB=document.createElement('div'); QB.id='hqb'; document.body.appendChild(QB); let S=[]; try{ S=JSON.parse(OWNED.get('quick')||'[]')||[]; }catch(e){ S=[]; } S.length=N; HUD.slots=S;
  const save=()=>{ try{ OWNED.set('quick',JSON.stringify(S)); }catch(e){} };
  const has=id=>!!(id&&FORAGE.has&&FORAGE.has(id)), count=id=>(window.INV&&INV.items&&INV.items[id])||0;
  // the things you do most, as quick slots of their own (owner, 7 Nov 2026: "add most common used things in quickbar"): open the map, the bag, the passport, the emotes
  const ACTS={map:['MAP',()=>{ const B=UI.brochure; if(B)B.up()?B.close():B.open(); }],bag:['BAG',()=>BAG.toggle&&BAG.toggle()],passport:['PASSPORT',()=>PASSPORT.open&&PASSPORT.open()],emotes:['EMOTES',()=>MOTION.toggle&&MOTION.toggle()]};
  const AC=id=>typeof id==='string'&&id.startsWith('act:')&&ACTS[id.slice(4)]?id.slice(4):null; HUD.acts=Object.keys(ACTS);
  const EM=id=>typeof id==='string'&&id.startsWith('emote:')?id.slice(6):null;   // an emote kept on the bar (dragged from the H panel): its name, never a thing in the pack
  const draw=()=>{ let o='<div class="qg" title="drag to move the bar">⋮⋮</div>'; for(let i=0;i<N;i++){ const id=S[i], em=EM(id), ac=AC(id), key=i<10?(i+1)%10:''; if(ac){ o+=`<div class="qs" data-i="${i}" draggable="true" title="${ACTS[ac][0]}"><em>${key}</em><span>${ACTS[ac][0]}</span></div>`; continue; } if(em){ o+=`<div class="qs" data-i="${i}" draggable="true" title="${esc(MOTION.label(em)||em)} (emote)"><em>${key}</em><span>${esc(MOTION.label(em)||em)}</span></div>`; continue; } const on=!!id&&WIELD.on===id, n=id?count(id):0; o+=`<div class="qs${on?' on':''}${id&&!n?' none':''}" data-i="${i}" ${id?'draggable="true"':''} title="${id?esc(FORAGE.name(id))+(n?' ×'+n:' (none left)'):'drag a thing here from your pack'}"><em>${key}</em>${id?(BAG.icon?`<img src="${BAG.icon(id)}" alt="" draggable="false" style="width:32px;height:32px;image-rendering:pixelated;pointer-events:none${n?'':';opacity:.35'}">`:esc(FORAGE.name(id))):''}${n>1?`<u>${n}</u>`:''}</div>`; } QB.innerHTML=o; QB.style.maxWidth=N>10?(24+3+10*49)+'px':''; QB.style.flexWrap=N>10?'wrap':''; }; HUD.qdraw=draw;
  HUD.set=(i,id)=>{ if(i<0||i>=N)return; S[i]=id||null; save(); draw(); };
  HUD.use=i=>{ const id=S[i]; if(!id)return false; const ac=AC(id); if(ac){ ACTS[ac][1](); return true; } const em=EM(id); if(em){ MOTION.play(em); return true; } return HUD.useItem(id); };
  HUD.count=n=>{ N=Math.max(1,Math.min(40,Math.round(+n)||10)); S.length=Math.max(S.length,N); try{ OWNED.set('quickn',String(N)); }catch(e){} draw(); return N; }; HUD.n=()=>N;
  HUD.useItem=id=>{ '@later'; const say=SAY, nm=FORAGE.name(id);
    if(!has(id)){ say('YOU HAVE NO '+nm+'.','#c8a090'); return true; }
    if(WIELD.LIST&&WIELD.LIST.includes(id)){ WIELD.set(WIELD.on===id?null:id); if(!WIELD.on)say('YOUR HANDS ARE FREE.','#e8e2cc'); }
    else if(FORAGE.eats(id))FORAGE.eat(id);
    else if(FORAGE.ACT[id])FORAGE.ACT[id](id);
    else { const rows=FORAGE.ROWB.flatMap(f=>f(id)||[]), a=rows.find(r=>r[1]!=='inspect'&&FORAGE.ACT[r[1]])||rows.find(r=>FORAGE.ACT[r[1]]); if(a)FORAGE.ACT[a[1]](id); else say('NOTHING TO DO WITH THE '+nm+' HERE.','#c8a090'); }   // its own action, else its first pack button (LOOK last)
    draw(); return true; };
  QB.addEventListener('click',e=>{ const s=e.target.closest('.qs'); if(s)HUD.use(+s.dataset.i); });
  QB.addEventListener('contextmenu',e=>{ const s=e.target.closest('.qs'); if(!s)return; e.preventDefault(); HUD.set(+s.dataset.i,null); });
  QB.addEventListener('dragstart',e=>{ const s=e.target.closest('.qs'); if(!s||!S[+s.dataset.i])return e.preventDefault(); e.dataTransfer.setData('text/plain','slot:'+s.dataset.i); e.dataTransfer.setData('application/x-slot',s.dataset.i); e.dataTransfer.effectAllowed='move'; });
  QB.addEventListener('dragover',e=>{ const s=e.target.closest('.qs'); if(!s)return; e.preventDefault(); QB.querySelectorAll('.over').forEach(x=>x.classList.remove('over')); s.classList.add('over'); });
  QB.addEventListener('dragleave',e=>{ const s=e.target.closest('.qs'); if(s)s.classList.remove('over'); });
  QB.addEventListener('drop',e=>{ '@later'; const s=e.target.closest('.qs'); if(!s)return; e.preventDefault(); const i=+s.dataset.i, d=e.dataTransfer.getData('text/plain')||'';
    if(d.startsWith('item:')||d.startsWith('emote:')||d.startsWith('act:')){ const id=d.startsWith('item:')?d.slice(5):d; const j=S.indexOf(id); if(j>=0&&j!==i)S[j]=null; S[i]=id; }
    else if(d.startsWith('slot:')){ const j=+d.slice(5); if(j!==i){ const t=S[i]; S[i]=S[j]; S[j]=t; } }
    save(); draw(); });
  QB.addEventListener('dragend',e=>{ QB.querySelectorAll('.over').forEach(x=>x.classList.remove('over')); const s=e.target.closest('.qs'); if(s&&e.dataTransfer.dropEffect==='none')HUD.set(+s.dataset.i,null); });   // dragged off the bar: the slot empties
  addEventListener('keydown',e=>{ if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||!/^Digit[0-9]$/.test(e.code))return; if(e.target&&e.target.closest&&e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    if(UI.menuOpen||ED.on||WE.on||!window.__started)return; const i=(+e.code.slice(5)+9)%10; if(i>=N||!S[i])return; e.preventDefault(); e.stopImmediatePropagation(); HUD.use(i); },true);   // a filled slot takes its key; an empty one leaves it to the moves
  let qt=0, lt=0; const tickBar=dt=>{ if(!window.__started)return; if((qt+=dt)>.5){ qt=0; draw(); } if((lt+=dt)>1){ lt=0; const now=performance.now(); for(const d of LN.children)d.classList.toggle('old',now-+d.dataset.t>20000); } };
  // the common things on every player's bar once, from slot 3 (1 and 2 keep a new player's apples and rod)
  if(!OWNED.get('qcommon')){ let j=2; for(const k of Object.keys(ACTS)){ const id='act:'+k; if(S.includes(id))continue; while(j<N&&S[j])j++; if(j<N)S[j++]=id; } save(); try{ OWNED.set('qcommon','1'); }catch(e){} }
  // SETTINGS, CONTROLS: how many quick slots, and the common things to drag onto the bar
  { const kr=document.getElementById('kreset'), host=kr&&kr.closest('.row')&&kr.closest('.row').parentNode; if(host){ const d=document.createElement('div'); d.id='qbset'; d.style.marginTop='14px';
      d.innerHTML=`<div class="row"><b>QUICK BAR</b>&nbsp; SLOTS <button class="btn" id="qbm" aria-label="fewer slots">−</button> <span id="qbn"></span> <button class="btn" id="qbp" aria-label="more slots">+</button> <span class="dim">1 TO 40 · THE FIRST TEN ON KEYS 1 TO 0</span></div>
        <div class="row" style="margin-top:6px">DRAG ONTO THE BAR: ${Object.entries(ACTS).map(([k,[n]])=>`<button class="btn" draggable="true" data-act="${k}">${n}</button>`).join(' ')}</div>`;
      host.insertBefore(d,document.getElementById('credits')&&document.getElementById('credits').parentNode===host?document.getElementById('credits'):null);
      const sh=()=>{ d.querySelector('#qbn').textContent=N; }; sh(); d.querySelector('#qbm').onclick=()=>{ HUD.count(N-1); sh(); }; d.querySelector('#qbp').onclick=()=>{ HUD.count(N+1); sh(); };
      d.querySelector('#qbm').addEventListener('contextmenu',e=>{ e.preventDefault(); HUD.count(1); sh(); }); d.querySelector('#qbp').addEventListener('contextmenu',e=>{ e.preventDefault(); HUD.count(40); sh(); });
      for(const b of d.querySelectorAll('[data-act]'))b.addEventListener('dragstart',e=>{ e.dataTransfer.setData('text/plain','act:'+b.dataset.act); e.dataTransfer.effectAllowed='copy'; }); } }
  draw();

  const nmN=document.getElementById('vnm'); let named=0;
  let liftT=0; const lift=dt=>{ if((liftT-=dt)>0)return; liftT=.5; const L=document.getElementById('hlog'), Q=document.getElementById('hqb'); if(!L||!Q)return;   // the log never under the quick bar: on a narrow window it sits just above it (unless you moved either)
    let up=0; if(!L.style.top&&!Q.style.top&&!Q.hidden){ const a=L.getBoundingClientRect(), b=Q.getBoundingClientRect(); if(b.height>0&&a.right>b.left+2&&a.left<b.right-2)up=Math.round(b.height+8); }
    if(L.style.getPropertyValue('--logup')!==up+'px')L.style.setProperty('--logup',up+'px'); };
  SYS.add('vitals',dt=>{ tickMap(dt); tickBar(dt); lift(dt); if(window.__started&&nmN&&(named-=dt)<=0){ named=1; const n=ONLINE.myName?ONLINE.myName():''; if(nmN.textContent!==n)nmN.textContent=n; } },'162d-hud');   // the name as it is now, looked at once a second
  window.HUDDBG=()=>({map:!MP.hidden,plan:!!Q,slots:[...S],lines:LN.children.length});
}
