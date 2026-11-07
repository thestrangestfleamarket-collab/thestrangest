// THE MOTION: the Walker's recorded moves (Mesh2Motion's human clips fitted to his rig, data/moves2.json, fetched when first used): emotes from the H panel and the moves of things you do (eat, craft, plant, mine, sit down), once or looped, shared with the players near.
import {SHARED} from './003-shx.js';
import {MOTION, RAG, st, UI, VIT} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
import {AVATAR} from './111c-avatar.js';
{ const DATA=__LAZY__("data/moves2.json"), R=RIG, info={}; let ready=null, cur=null;
  const EMOTES=[['WAVE','greet'],['CLAP','clap'],['CHEER','cheer'],['FIST PUMP','fistPump'],['DAB','dab'],['YES','yes'],['NOD','nod'],['NO','no'],['ANGRY','angry'],['CONFUSED','confused'],['FLEX','flex'],['KNOCK','knock'],['POWER UP','powerUp'],['TALK','talk'],['ARMS FOLDED','foldArms'],
    ['DANCE','dance'],['ARM PUMP','armPump'],['BODY ROLL','bodyRoll'],['CHARLESTON','charleston'],['HIP REACH','hipReach'],['MOONWALK','moonwalk'],['JUMPING JACKS','jacks'],['PUSH-UPS','pushups'],['SIT DOWN','sitGround'],['MEDITATE','meditate'],['SLEEP','sleep'],['SHIVER','shiver'],['ZOMBIE','zombie']];
  // Polyfork's clips with no move of his (AVATAR.PF, owner 7 Nov 2026: "yes lets use mixamo"): on the rig they stand still for the clip's length; the avatar plays the clip
  const PFE=[['AGREE','Agree'],['SHAKE HEAD','Shake'],['LAUGH','Laugh'],['CHAT','Chat'],['PHONE CALL','Phone'],['CROSS ARMS','Cross'],['BOP','Bop'],['HIP HOP','HipHop'],['TWIST','Twist'],['SWING','Swing'],['THRILLER','Thriller'],
    ['TIPSY','Drunk'],['LEAN ON RAIL','Lean'],['CALL OUT','Call'],['CHOP WOOD','Chop'],['FIX','Fix'],['PUSH','Push'],['HOLD TORCH','Torch'],['HOLD LANTERN','Lantern']];
  const ensure=()=>ready||(ready=DATA().then(J=>{ for(const [n,m] of Object.entries(J)){ R.MOVES['mc_'+n]=R.mkMove({keys:m.keys,ex:0,...(m.opts||{})}); info[n]={loop:!!m.loop,dur:m.dur}; }
    const K0=J.greet.keys[0][1]; for(const [n,[,a,b,lp]] of Object.entries(AVATAR.PF)){ R.MOVES['mc_pf_'+n]=R.mkMove({keys:[[0,K0,'lin'],[b-a,K0,'lin']],ex:0}); info['pf_'+n]={loop:!!lp,dur:b-a}; } return info; }));
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
  // the emote panel (H), a window like the others (owner, 7 Nov 2026: "make the emote menu look like regular menus. also allow to drag them to the favorites bar"): a button an emote, by kind; drag one onto the quick bar
  const sp=document.createElement('div'); sp.id='emotes'; sp.hidden=true;
  sp.style.cssText='position:fixed;right:16px;bottom:96px;width:min(460px,92vw);max-height:70vh;overflow:auto;z-index:21;padding:12px 14px;box-sizing:border-box;background:#0b0d13;zoom:var(--uiz,1)';
  document.body.appendChild(sp); sp.addEventListener('keydown',e=>{ if(e.key==='Escape')MOTION.close(); e.stopPropagation(); }); sp.addEventListener('keyup',e=>e.stopPropagation());
  const ALLE=[...EMOTES,...PFE.map(([t,n])=>[t,'pf_'+n])], LABEL=Object.fromEntries(ALLE.map(([t,n])=>[n,t]));
  const KINDS=[['GREET AND TALK',['greet','yes','nod','no','pf_Agree','pf_Shake','talk','pf_Chat','pf_Phone','pf_Call','pf_Laugh','clap','cheer','fistPump','dab','flex','knock','powerUp']],
    ['MOODS',['angry','confused','foldArms','pf_Cross','pf_Drunk','shiver','zombie','pf_Lean']],
    ['DANCE',['dance','pf_Bop','pf_HipHop','pf_Twist','pf_Swing','pf_Thriller','armPump','bodyRoll','charleston','hipReach','moonwalk']],
    ['REST AND EXERCISE',['sitGround','meditate','sleep','jacks','pushups']],['WORK',['pf_Chop','pf_Fix','pf_Push','pf_Torch','pf_Lantern']]];
  const B=(t,n)=>{ const b=document.createElement('button'); b.type='button'; b.textContent=t; b.draggable=true; b.title='drag onto the quick bar to keep it there';
    b.onclick=()=>{ play(n); MOTION.close(); }; b.addEventListener('dragstart',e=>{ e.dataTransfer.setData('text/plain','emote:'+n); e.dataTransfer.effectAllowed='copy'; }); return b; };
  const head=document.createElement('h3'); head.textContent='EMOTES'; sp.append(head);
  for(const [k,ns] of KINDS){ const h=document.createElement('div'); h.textContent=k; h.style.cssText='color:#9b9584;margin:8px 0 2px'; const g=document.createElement('div'); for(const n of ns)if(LABEL[n])g.append(B(LABEL[n],n)); sp.append(h,g); }
  const tip=document.createElement('div'); tip.textContent='WALK TO STOP ONE THAT LOOPS · DRAG ONE ONTO THE QUICK BAR'; tip.style.cssText='margin-top:8px;color:#9b9584'; sp.append(tip);
  // the fight keys: L a side kick (again late in it, a spin kick), O a dodge back; kicks land through STRIKES by their names, a dodge lets blows miss
  const can=()=>!SHARED.drive&&!RAG.on&&!VIT.dead&&!(VIT.out>0)&&!UI.freeCam&&!st.sit&&!st.ride&&!st.climb&&!st.hang&&!(st.water&&st.water.in)&&!VIT.tired;
  const fight=k=>{ '@later'; if(!can())return; const m=st.move, t=m?m.t:0;
    if(k==='l'){ if(m&&m.name==='mc_kickSide'){ if(t>.45)play('kickSpin'); return; } if(!m||m.name.startsWith('mc_')&&info[m.name.slice(3)]&&!/kick/.test(m.name))play('kickSide'); }
    else if(k==='o'&&(!m||!/^mc_(dodge|kick)/.test(m.name))){ VIT.spend(.06); play('dodge'); } };
  addEventListener('keydown',e=>{ if(e.repeat||e.target&&e.target.closest&&e.target.closest('input,textarea,[contenteditable="true"]'))return; const k=UI.key(e);
    if(k==='h'&&!UI.menuOpen){ MOTION.toggle(); e.preventDefault(); } else if((k==='l'||k==='o')&&!UI.menuOpen)fight(k); });
  window.MOTION=MOTION; Object.defineProperty(MOTION,'cur',{get:()=>cur&&cur.n}); MOTION.dodging=()=>!!(st.move&&st.move.name==='mc_dodge'&&st.move.t<.55); Object.assign(MOTION,{EMOTES,label:n=>LABEL[n]||null,ensure,play,stop,their,has,info,
    open:()=>{ sp.hidden=false; ensure(); }, close:()=>{ sp.hidden=true; }, toggle:()=>{ if(sp.hidden)MOTION.open(); else MOTION.close(); }});
}
