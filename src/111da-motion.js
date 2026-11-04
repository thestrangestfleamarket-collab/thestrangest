// THE MOTION: the Walker's recorded moves (Mesh2Motion's human clips fitted to his rig, data/moves2.json, fetched when first used): emotes from the H panel and the moves of things you do (eat, craft, plant, mine, sit down), once or looped, shared with the players near.
import {MOTION, RAG, st, UI, VIT} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
{ const DATA=__LAZY__("data/moves2.json"), R=RIG, info={}; let ready=null, cur=null;
  const EMOTES=[['WAVE','greet'],['CLAP','clap'],['CHEER','cheer'],['FIST PUMP','fistPump'],['DAB','dab'],['YES','yes'],['NOD','nod'],['NO','no'],['ANGRY','angry'],['CONFUSED','confused'],['FLEX','flex'],['KNOCK','knock'],['POWER UP','powerUp'],['TALK','talk'],['ARMS FOLDED','foldArms'],
    ['DANCE','dance'],['ARM PUMP','armPump'],['BODY ROLL','bodyRoll'],['CHARLESTON','charleston'],['HIP REACH','hipReach'],['MOONWALK','moonwalk'],['JUMPING JACKS','jacks'],['PUSH-UPS','pushups'],['SIT DOWN','sitGround'],['MEDITATE','meditate'],['SLEEP','sleep'],['SHIVER','shiver'],['ZOMBIE','zombie']];
  const ensure=()=>ready||(ready=DATA().then(J=>{ for(const [n,m] of Object.entries(J)){ R.MOVES['mc_'+n]=R.mkMove({keys:m.keys,ex:0,...(m.opts||{})}); info[n]={loop:!!m.loop,dur:m.dur}; } return info; }));
  const has=n=>!!R.MOVES['mc_'+n];
  // play one on a rig state: a whole-body move from his current pose (a held tool's arm still goes where the game aims it); a looped one starts again as it ends, until he walks, another move takes over or its `while` fails
  const start=(S,n,loop)=>{ R.begin(S,'mc_'+n); return {S,n,loop}; };
  const play=async(n,o={})=>{ await ensure(); if(!has(n)||RAG.on||VIT.dead)return false; const loop=o.loop??info[n].loop;
    cur=start(st,n,loop); cur.while=o.while; if(o.share!==false)SYS.run('act',{m:'mc_'+n,loop:loop?1:0}); return true; };
  const stop=()=>{ if(!cur)return; const was=cur; cur=null; if(st.move&&st.move.name==='mc_'+was.n)st.move.t=st.move.def.dur; SYS.run('act',{stop:1}); };
  const theirs=new Map();
  const tickOne=(c,dt)=>{ const S=c.S, m=S.move; if(c.while&&!c.while()){ if(m&&m.name==='mc_'+c.n)m.t=m.def.dur; return false; } if(m&&m.name==='mc_'+c.n)return true; if(!c.loop||S.target>0||m||S.sit||S.climb||S.hang||S.ride||S.water&&S.water.in)return false; R.begin(S,'mc_'+c.n); return true; };
  SYS.add('life',dt=>{ if(cur&&!tickOne(cur,dt)){ const lp=cur.loop; cur=null; if(lp)SYS.run('act',{stop:1}); } for(const [S,c] of theirs)if(!tickOne(c,dt))theirs.delete(S); },'111da-motion');
  // what another player plays: fetched first if this page has not yet, then on their body here
  const their=(S,m)=>{ if(m.stop){ theirs.delete(S); return; } ensure().then(()=>{ if(!R.MOVES[m.m])return; R.begin(S,m.m); theirs.set(S,{S,n:m.m.slice(3),loop:!!m.loop}); }); };
  // the emote panel (H): a button an emote; a looped one runs until you walk
  const sp=document.createElement('div'); sp.id='emotes'; sp.hidden=true;
  sp.style.cssText='position:fixed;right:16px;bottom:96px;width:min(420px,92vw);max-height:70vh;overflow:auto;z-index:21;padding:12px 14px;box-sizing:border-box;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#ffe9b0;background:rgba(26,16,4,.95);box-shadow:inset 0 0 0 2px #b8862a,0 12px 40px #000;zoom:var(--uiz,1)';
  document.body.appendChild(sp); sp.addEventListener('keydown',e=>{ if(e.key==='Escape')MOTION.close(); e.stopPropagation(); }); sp.addEventListener('keyup',e=>e.stopPropagation());
  const B=(t,f,css='')=>{ const b=document.createElement('button'); b.textContent=t; b.style.cssText='font:inherit;color:#ffe9b0;background:#2a1a06;border:2px solid #b8862a;padding:5px 7px;margin:3px;cursor:pointer;'+css; b.onclick=f; return b; };
  const closeB=B('X',()=>MOTION.close(),'position:absolute;right:8px;top:8px;margin:0'); closeB.className='pX';
  const head=document.createElement('div'); head.textContent='EMOTES'; head.style.cssText='margin:2px 0 8px;color:#ffcf5a';
  const grid=document.createElement('div'); for(const [t,n] of EMOTES)grid.append(B(t,()=>{ play(n); MOTION.close(); }));
  const tip=document.createElement('div'); tip.textContent='WALK TO STOP ONE THAT LOOPS'; tip.style.cssText='margin-top:8px;opacity:.7';
  sp.append(closeB,head,grid,tip);
  addEventListener('keydown',e=>{ if(e.repeat||e.target&&e.target.closest&&e.target.closest('input,textarea,[contenteditable="true"]'))return; if(UI.key(e)==='h'&&!UI.menuOpen){ MOTION.toggle(); e.preventDefault(); } });
  window.MOTION=MOTION; Object.defineProperty(MOTION,'cur',{get:()=>cur&&cur.n}); Object.assign(MOTION,{EMOTES,ensure,play,stop,their,has,info,
    open:()=>{ sp.hidden=false; ensure(); }, close:()=>{ sp.hidden=true; }, toggle:()=>{ if(sp.hidden)MOTION.open(); else MOTION.close(); }});
}
