// THE EMOTES' EXTRAS (owner, 11 Nov 2026): hold H for a wheel of your eight favourites (a right click on a square in the H window stars it; let go of H to play the one pointed at; a tap still opens the window); /wave and every emote's name typed in the chat plays it, aimed at whoever you face; the street's trainers each show you a move of their trade once you rank APPRENTICE with them (LEARNT FROM FOLK).
import {SHARED} from './003-shx.js';
import {HUD, MOTION, NPCS, ONLINE, pos, TEXT, TRAINERS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SAVE} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
const EMO={};
{ const esc=TEXT.esc, T=TILE;
  // what the folk teach: a trainer's skill, the move, its name
  EMO.FOLK=[['myco','harvest','HARVEST','THE MUSHROOM SELLER'],['garden','plant','PLANT A SEED','THE TOMATO'],['fish','cast','CAST A LINE','THE FISHERMAN IN WADERS'],['bee','water','WATER THE FLOWERS','THE VILLAGE GARDENER'],['gem','mine','HARD LABOUR','THE ROCK GOLEM'],['sword','swingHeavy','BIG SWING','THE SAMURAI WARRIOR'],['fight','hook2','HOOK','THE SQUIRREL']];
  let LEARNT={}; try{ LEARNT=JSON.parse(SAVE.get('emolearn')||'{}')||{}; }catch(e){}
  const shown=new Set();
  const add=([sk,n,t])=>{ MOTION.teach(n,t); if(shown.has(n))return; shown.add(n); MOTION.more('LEARNT FROM FOLK',t,()=>MOTION.play(n)); };
  EMO.learn=(sk,quiet)=>{ const f=EMO.FOLK.find(x=>x[0]===sk); if(!f)return false; if(!LEARNT[f[1]]){ LEARNT[f[1]]=1; try{ SAVE.set('emolearn',JSON.stringify(LEARNT)); }catch(e){} if(!quiet)SAY(f[3]+' SHOWS YOU HOW: '+f[2]+'. IT IS UNDER EMOTES, LEARNT FROM FOLK.','#f2c14e'); } add(f); return true; };
  EMO.knows=n=>!!LEARNT[n];
  for(const f of EMO.FOLK)if(LEARNT[f[1]])add(f);
  SYS.every(()=>{ for(const f of EMO.FOLK)if(!LEARNT[f[1]]&&TRAINERS.rank&&TRAINERS.rank(f[0])>=1)EMO.learn(f[0]); },2000,'162ee-emotes folk');
  // the favourites: starred in the H window, else the quick bar's emotes, else these
  const DEF=['greet','clap','cheer','yes','no','dance','sitGround','flex'];
  let FAV=null; try{ FAV=JSON.parse(SAVE.get('emofav')||'null'); }catch(e){}
  EMO.favs=()=>{ const L=(Array.isArray(FAV)?FAV:[]).filter(n=>MOTION.label(n)); for(const s of HUD.slots||[])if(typeof s==='string'&&s.startsWith('emote:')&&L.length<8&&!L.includes(s.slice(6)))L.push(s.slice(6)); for(const n of DEF)if(L.length<8&&!L.includes(n))L.push(n); return L.slice(0,8); };
  EMO.star=n=>{ const L=Array.isArray(FAV)?FAV.slice():[]; const i=L.indexOf(n); if(i>=0)L.splice(i,1); else { L.unshift(n); L.length=Math.min(L.length,8); } FAV=L; try{ SAVE.set('emofav',JSON.stringify(L)); }catch(e){} mark(); return i<0; };
  const REV=()=>{ const o={}, L=MOTION.labels(); for(const n in L)o[L[n]]=n; return o; };
  const mark=()=>{ const sp=document.getElementById('emotes'); if(!sp)return; const R=REV(), F=Array.isArray(FAV)?FAV:[]; for(const b of sp.querySelectorAll('.emg button')){ const n=R[b.textContent.replace(/^★ /,'')]; if(!n)continue; const on=F.includes(n); b.textContent=(on?'★ ':'')+MOTION.label(n); } };
  addEventListener('contextmenu',e=>{ const b=e.target.closest&&e.target.closest('#emotes .emg button'); if(!b)return; e.preventDefault(); const n=REV()[b.textContent.replace(/^★ /,'')]; if(n)EMO.star(n); },true);
  SYS.every(()=>{ const sp=document.getElementById('emotes'); if(sp&&!sp.hidden&&!sp.dataset.tip){ sp.dataset.tip=1; const t=[...sp.querySelectorAll('.emk')].pop(); if(t)t.textContent+=' · RIGHT CLICK STARS ONE FOR THE H WHEEL'; mark(); } },500,'162ee-emotes tip');
  // the wheel: hold H
  const css=document.createElement('style'); css.textContent=`#emow{position:fixed;inset:0;z-index:39;display:grid;place-items:center;pointer-events:none;font-family:'Share Tech Mono',ui-monospace,monospace} #emow[hidden]{display:none} #emow svg{width:min(360px,80vw);height:min(360px,80vw);pointer-events:auto;zoom:var(--uiz,1)}
    #emow path{fill:rgba(3,26,13,.9);stroke:#3aa866;stroke-width:2} #emow path.hi{fill:#7dffa8} #emow text{fill:#7dffa8;font-size:12px;letter-spacing:1px;pointer-events:none;font-family:inherit} #emow text.hi{fill:#020a06} #emow .c{fill:#3aa866;font-size:10px}`; document.head.appendChild(css);
  const W=document.createElement('div'); W.id='emow'; W.hidden=true; document.body.appendChild(W);
  let L=[], hi=-1, t0=0, timer=0;
  const S=360, C=S/2, R1=S/2-4, R0=58, P=(a,r)=>`${(C+r*Math.cos(a)).toFixed(1)} ${(C+r*Math.sin(a)).toFixed(1)}`;
  const draw=()=>{ L=EMO.favs(); let h=''; L.forEach((n,i)=>{ const a0=(i-.5)/L.length*2*Math.PI-Math.PI/2+.02, a1=(i+.5)/L.length*2*Math.PI-Math.PI/2-.02, am=(a0+a1)/2, rm=(R0+R1)/2;
      h+=`<path data-i="${i}" class="${i===hi?'hi':''}" d="M${P(a0,R0)} L${P(a0,R1)} A${R1} ${R1} 0 0 1 ${P(a1,R1)} L${P(a1,R0)} A${R0} ${R0} 0 0 0 ${P(a0,R0)}Z"/><text data-i="${i}" class="${i===hi?'hi':''}" x="${C+rm*Math.cos(am)}" y="${C+rm*Math.sin(am)+4}" text-anchor="middle">${esc(MOTION.label(n)||n)}</text>`; });
    W.innerHTML=`<svg viewBox="0 0 ${S} ${S}">${h}<text class="c" x="${C}" y="${C+4}" text-anchor="middle">LET GO OF H</text></svg>`; };
  W.addEventListener('pointermove',e=>{ const s=W.querySelector('svg'); if(!s)return; const r=s.getBoundingClientRect(), x=e.clientX-r.left-r.width/2, y=e.clientY-r.top-r.height/2; if(Math.hypot(x,y)<r.width*R0/S){ if(hi!==-1){ hi=-1; draw(); } return; }
    let a=Math.atan2(y,x)+Math.PI/2; if(a<0)a+=2*Math.PI; const i=Math.round(a/(2*Math.PI)*L.length)%L.length; if(i!==hi){ hi=i; draw(); } });
  MOTION.hDown=()=>{ if(SHARED.drive){ MOTION.toggle(); return; } if(timer||!W.hidden)return; t0=performance.now(); timer=setTimeout(()=>{ timer=0; hi=-1; draw(); W.hidden=false; },250); };
  MOTION.hUp=()=>{ if(timer){ clearTimeout(timer); timer=0; MOTION.toggle(); return; } if(W.hidden)return; W.hidden=true; if(hi>=0&&L[hi])MOTION.play(L[hi]); hi=-1; };
  // typed: /wave, /dance, /sit down ...; aimed at whoever stands before you
  const facing=()=>{ const hx=Math.sin(SHARED.heading), hz=Math.cos(SHARED.heading); let best=null, bd=4*T;
    for(const N of NPCS){ if(!N||N.far||N.mode==='hidden'||N.lv!==SHARED.LVL||!N.g)continue; const p=N.g.position, dx=p.x-pos.x, dz=p.z-pos.z, d=Math.hypot(dx,dz); if(d<bd&&d>.1&&(dx*hx+dz*hz)/d>.6){ bd=d; best=N.name; } }
    for(const o of (ONLINE.others?ONLINE.others.values():[])){ const p=o.p||o.pos; if(!p)continue; const dx=p.x-pos.x, dz=p.z-pos.z, d=Math.hypot(dx,dz); if(d<bd&&d>.1&&(dx*hx+dz*hz)/d>.6){ bd=d; best=o.name; } }
    return best; };
  ONLINE.slash=t=>{ const w=t.slice(1).trim().toUpperCase().replace(/_/g,' '); if(!w)return false; const R=REV(); let n=R[w]||(w==='WAVE'?'greet':w==='SIT'?'sitGround':null); if(!n){ const k=Object.keys(R).find(l=>l.startsWith(w)); if(k)n=R[k]; } if(!n){ SAY('NO EMOTE CALLED '+w+'. H SHOWS THEM ALL.','#c8a090'); return true; }
    MOTION.play(n); const who=facing(), lab=String(MOTION.label(n)||n); SAY(who?'YOU '+lab+' AT '+String(who).toUpperCase()+'.':'YOU '+lab+'.','#9fd8ff'); return true; };
  window.EMO=EMO; }
