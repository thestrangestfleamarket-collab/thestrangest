// THE HUD: HUD draws the round minimap top right (from the MAP's plan, when you carry a map), the message log bottom left (the game's lines and the chat, UI.log) and the quick bar (ten slots on keys 1 to 0, filled by dragging from the pack).
import {SHARED} from './003-shx.js';
import {ED, FORAGE, HUD, INV, ONLINE, pos, ROOMS, UI, WE, WIELD, ZONES} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
{ const T=TILE, MW=150, N=10, esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const css=document.createElement('style'); css.textContent=`#hmap{position:fixed;right:calc(12px + var(--fx,0px) + env(safe-area-inset-right,0px));top:calc(12px + var(--fy,0px) + env(safe-area-inset-top,0px));width:${MW}px;z-index:5;font:9px Silkscreen,monospace;letter-spacing:1px;color:#fff;text-shadow:1px 1px 0 #000,0 0 3px #000;zoom:var(--uiz,1)}
    #hmap[hidden]{display:none} #hmap canvas{display:block;width:${MW}px;height:${MW}px;border-radius:50%;image-rendering:pixelated;cursor:pointer} #hmap canvas[hidden]{display:none} #hmap .f{padding-top:5px;text-align:center} #hmap .f span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #hlog{position:fixed;left:calc(12px + var(--fx,0px) + env(safe-area-inset-left,0px));bottom:calc(12px + var(--fy,0px) + env(safe-area-inset-bottom,0px));width:min(320px,40vw);z-index:6;font:11px Silkscreen,monospace;letter-spacing:.3px;color:#fff;text-shadow:1px 1px 0 #000,0 0 3px #000;pointer-events:none;zoom:var(--uiz,1)}
    #hlines{display:flex;flex-direction:column;justify-content:flex-end;max-height:150px;overflow:hidden} #hlines div{padding:1px 0;word-wrap:break-word} #hlines div.old{opacity:.5} #hlines b{color:#ffd27a;font-weight:400}
    #hlog:has(#onl.open) #hlines{max-height:60vh;overflow:auto;pointer-events:auto} #hlog:has(#onl.open) #hlines div.old{opacity:.8}
    #hlog #onl{position:static;width:auto;margin-top:4px;zoom:1} #hlog #onllog{display:none}
    #hqb{position:fixed;left:50%;bottom:calc(12px + var(--fy,0px) + env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:flex;gap:3px;z-index:6;zoom:var(--uiz,1)} #hqb[hidden]{display:none}
    #hqb .qs{width:44px;height:44px;position:relative;display:flex;align-items:center;justify-content:center;text-align:center;padding:3px;background:#00000066;font:8px Silkscreen,monospace;line-height:1.25;color:#fff;text-shadow:1px 1px 0 #000;cursor:pointer;overflow:hidden;word-break:break-word}
    #hqb .qs.on{background:#000000b8} #hqb .qs.none{color:#ffffff66} #hqb .qs.over{background:#ffffff30} #hqb .qs em,#hqb .qs u{position:absolute;font-style:normal;text-decoration:none;color:#ffffffa0} #hqb .qs em{left:3px;top:2px} #hqb .qs u{right:3px;bottom:2px}`;
  document.head.appendChild(css); window.HUD=HUD;

  /* ---------- the log ---------- */
  const LG=document.createElement('div'); LG.id='hlog'; LG.innerHTML='<div id="hlines" aria-live="polite"></div><div id="hchat"></div>'; document.body.appendChild(LG); const LN=LG.firstChild;
  UI.log=(text,color,who)=>{ const d=document.createElement('div'); d.dataset.t=String(performance.now()); d.innerHTML=(who?'<b>'+esc(who)+'</b> ':'')+esc(text); if(color&&!who)d.style.color=color; LN.appendChild(d); while(LN.children.length>40)LN.firstChild.remove(); };
  HUD.lines=()=>[...LN.children].map(d=>d.textContent);

  /* ---------- the minimap ---------- */
  const MP=document.createElement('div'); MP.id='hmap'; MP.hidden=true; MP.innerHTML=`<canvas width="${MW}" height="${MW}"></canvas><div class="f"><span id="hmz"></span><span id="hmxy"></span></div>`; document.body.appendChild(MP);
  const cv=MP.firstChild, g=cv.getContext('2d'), zN=MP.querySelector('#hmz'), xyN=MP.querySelector('#hmxy'); let Q=null, qTried=0;
  cv.onclick=()=>{ if(UI.mapWindow)UI.mapWindow(); };
  const plan=()=>{ if(Q||qTried)return Q; qTried=1; try{ Q=UI.mapPlan&&UI.mapPlan(); }catch(e){ console.warn('HUD map',e); } return Q; };
  const paint=()=>{ const K=4, Q=plan(); if(!Q){ cv.hidden=true; return; } cv.hidden=false; const B=SHARED.BOD, mx=Q.sx(B.OX+pos.x/T), my=Q.sy(B.OY+pos.z/T), r=MW/2, w=MW/K*Q.S;
    g.imageSmoothingEnabled=false; g.clearRect(0,0,MW,MW); g.save(); g.beginPath(); g.arc(r,r,r,0,Math.PI*2); g.clip(); g.fillStyle='#0b0d12'; g.fillRect(0,0,MW,MW); g.drawImage(Q.cv,mx-w/2,my-w/2,w,w,0,0,MW,MW);
    const sx=x=>r+(x-mx)*K/Q.S, sy=y=>r+(y-my)*K/Q.S;
    for(const o of ONLINE.others.values()){ if(!o.p)continue; const a=sx(Q.sx(B.OX+o.p.x/T)), b=sy(Q.sy(B.OY+o.p.z/T)); if(Math.hypot(a-r,b-r)>r-3)continue; g.fillStyle='#000'; g.fillRect(a-3,b-3,6,6); g.fillStyle='#ffd27a'; g.fillRect(a-2,b-2,4,4); }
    const h=SHARED.heading||0, dx=Math.sin(h), dy=-Math.cos(h); g.translate(r,r); g.rotate(Math.atan2(dy,dx)+Math.PI/2); g.beginPath(); g.moveTo(0,-7); g.lineTo(5,6); g.lineTo(0,3); g.lineTo(-5,6); g.closePath(); g.fillStyle='#fff'; g.fill(); g.lineWidth=1; g.strokeStyle='#000'; g.stroke(); g.restore();
    g.fillStyle='#fff'; g.strokeStyle='#000'; g.lineWidth=2; g.font='8px Silkscreen,monospace'; g.textAlign='center'; g.strokeText('N',r,10); g.fillText('N',r,10); };
  let mt=0, ot=0;
  const tickMap=dt=>{ if(!window.__started)return; const on=SHARED.LVL==='up'&&!ROOMS.cur&&!!(FORAGE.has&&FORAGE.has('map')); if(MP.hidden===on)MP.hidden=!on; if(!on)return;
    if((mt+=dt)<.2)return; mt=0; paint(); const z=ZONES.cur, sec=(SHARED.SECTION&&SHARED.SECTION.id)||''; zN.textContent=(sec?sec+' · ':'')+(z&&z.name?String(z.name).toUpperCase():''); xyN.textContent='x '+Math.round(pos.x/T)+' z '+Math.round(pos.z/T); };

  /* ---------- the quick bar ---------- */
  const QB=document.createElement('div'); QB.id='hqb'; document.body.appendChild(QB); let S=[]; try{ S=JSON.parse(OWNED.get('quick')||'[]')||[]; }catch(e){ S=[]; } S.length=N; HUD.slots=S;
  const save=()=>{ try{ OWNED.set('quick',JSON.stringify(S)); }catch(e){} };
  const has=id=>!!(id&&FORAGE.has&&FORAGE.has(id)), count=id=>(window.INV&&INV.items&&INV.items[id])||0;
  const draw=()=>{ let o=''; for(let i=0;i<N;i++){ const id=S[i], on=!!id&&WIELD.on===id, n=id?count(id):0; o+=`<div class="qs${on?' on':''}${id&&!n?' none':''}" data-i="${i}" ${id?'draggable="true"':''} title="${id?esc(FORAGE.name(id))+(n?' ×'+n:' (none left)'):'drag a thing here from your pack'}"><em>${(i+1)%10}</em>${id?esc(FORAGE.name(id)):''}${n>1?`<u>${n}</u>`:''}</div>`; } QB.innerHTML=o; };
  HUD.set=(i,id)=>{ if(i<0||i>=N)return; S[i]=id||null; save(); draw(); };
  HUD.use=i=>{ const id=S[i]; if(!id)return false; const say=FORAGE.say||(()=>{}), nm=FORAGE.name(id);
    if(!has(id)){ say('YOU HAVE NO '+nm+'.','#c8a090'); return true; }
    if(WIELD.LIST&&WIELD.LIST.includes(id)){ WIELD.set(WIELD.on===id?null:id); if(!WIELD.on)say('YOUR HANDS ARE FREE.','#e8e2cc'); }
    else if(FORAGE.eats(id))FORAGE.eat(id);
    else if(FORAGE.ACT[id])FORAGE.ACT[id](id);
    else { const rows=FORAGE.ROWB.flatMap(f=>f(id)||[]), a=rows.find(r=>r[1]!=='inspect'&&FORAGE.ACT[r[1]])||rows.find(r=>FORAGE.ACT[r[1]]); if(a)FORAGE.ACT[a[1]](id); else say('NOTHING TO DO WITH THE '+nm+' HERE.','#c8a090'); }   // its own action, else its first pack button (LOOK last)
    draw(); return true; };
  QB.addEventListener('click',e=>{ const s=e.target.closest('.qs'); if(s)HUD.use(+s.dataset.i); });
  QB.addEventListener('contextmenu',e=>{ const s=e.target.closest('.qs'); if(!s)return; e.preventDefault(); HUD.set(+s.dataset.i,null); });
  QB.addEventListener('dragstart',e=>{ const s=e.target.closest('.qs'); if(!s||!S[+s.dataset.i])return e.preventDefault(); e.dataTransfer.setData('text/plain','slot:'+s.dataset.i); e.dataTransfer.effectAllowed='move'; });
  QB.addEventListener('dragover',e=>{ const s=e.target.closest('.qs'); if(!s)return; e.preventDefault(); QB.querySelectorAll('.over').forEach(x=>x.classList.remove('over')); s.classList.add('over'); });
  QB.addEventListener('dragleave',e=>{ const s=e.target.closest('.qs'); if(s)s.classList.remove('over'); });
  QB.addEventListener('drop',e=>{ const s=e.target.closest('.qs'); if(!s)return; e.preventDefault(); const i=+s.dataset.i, d=e.dataTransfer.getData('text/plain')||'';
    if(d.startsWith('item:')){ const id=d.slice(5); const j=S.indexOf(id); if(j>=0&&j!==i)S[j]=null; S[i]=id; }
    else if(d.startsWith('slot:')){ const j=+d.slice(5); if(j!==i){ const t=S[i]; S[i]=S[j]; S[j]=t; } }
    save(); draw(); });
  QB.addEventListener('dragend',e=>{ QB.querySelectorAll('.over').forEach(x=>x.classList.remove('over')); const s=e.target.closest('.qs'); if(s&&e.dataTransfer.dropEffect==='none')HUD.set(+s.dataset.i,null); });   // dragged off the bar: the slot empties
  addEventListener('keydown',e=>{ if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||!/^Digit[0-9]$/.test(e.code))return; if(e.target&&e.target.closest&&e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    if(UI.menuOpen||ED.on||WE.on||!window.__started)return; const i=(+e.code.slice(5)+9)%10; if(!S[i])return; e.preventDefault(); e.stopImmediatePropagation(); HUD.use(i); },true);   // a filled slot takes its key; an empty one leaves it to the moves
  let qt=0, lt=0; const tickBar=dt=>{ if(!window.__started)return; if((qt+=dt)>.5){ qt=0; draw(); } if((lt+=dt)>1){ lt=0; const now=performance.now(); for(const d of LN.children)d.classList.toggle('old',now-+d.dataset.t>20000); } };
  draw();

  const nmN=document.getElementById('vnm'); let named=0;
  SYS.add('vitals',dt=>{ tickMap(dt); tickBar(dt); if(!named&&window.__started&&nmN){ named=1; nmN.textContent=ONLINE.myName?ONLINE.myName():''; } },'162d-hud');
  window.HUDDBG=()=>({map:!MP.hidden,plan:!!Q,slots:[...S],lines:LN.children.length});
}
