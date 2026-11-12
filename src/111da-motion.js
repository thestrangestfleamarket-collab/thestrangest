// THE MOTION: the Walker's recorded moves (Mesh2Motion's human clips fitted to his rig, data/moves2.json, fetched when first used): emotes from the H panel and the moves of things you do (eat, craft, plant, mine, sit down), once or looped, shared with the players near.
import {SHARED} from './003-shx.js';
import {MOTION, pos, RAG, ROOMS, st, TALK, UI, VIT} from './003b-systems.js';
import {FADE, SYS, TILE} from './006-map-pre.js';
import {AVATAR} from './111c-avatar.js';
{ const DATA=__LAZY__("data/moves2.json"), R=RIG, info={}; let ready=null, cur=null;
  const EMOTES=[['WAVE','greet'],['CLAP','clap'],['CHEER','cheer'],['FIST PUMP','fistPump'],['DAB','dab'],['YES','yes'],['NOD','nod'],['NO','no'],['ANGRY','angry'],['CONFUSED','confused'],['FLEX','flex'],['KNOCK','knock'],['POWER UP','powerUp'],['TALK','talk'],['ARMS FOLDED','foldArms'],
    ['DANCE','dance'],['ARM PUMP','armPump'],['BODY ROLL','bodyRoll'],['CHARLESTON','charleston'],['HIP REACH','hipReach'],['MOONWALK','moonwalk'],['JUMPING JACKS','jacks'],['PUSH-UPS','pushups'],['SIT DOWN','sitGround'],['MEDITATE','meditate'],['SLEEP','sleep'],['STARGAZE','stargaze'],['SHIVER','shiver'],
    ['LISTEN','listen'],['DIZZY','dizzy'],['SHAKE OFF','shakeOff'],['HURT','hurt'],['TIRED','tired'],
    ['STROLL','stroll'],['STRUT','strut'],['SNEAK','sneak'],['TIPTOE','tiptoe'],['STAGGER','stagger'],['LIMP','limp'],['SPRINT','sprint'],['BACK UP','backUp'],['CROUCH WALK','crouchWalk'],['CRAWL','crawl'],['FORMAL WALK','formalWalk'],
    ['BACKFLIP','backflip'],['ROLL','rollGo'],['STUMBLE BACK','knockback'],['GROUND POUND','pound'],['FRONT KICK','kickFront'],['ROUNDHOUSE','kickRound'],['GUARD','guard'],['SWORD COMBO','swordCombo'],['SLASH','slash'],
    ['THROW','throw'],['LOB','toss'],['PICK UP','pickUp']];
  // Polyfork's clips with no move of his (AVATAR.PF, owner 7 Nov 2026: "yes lets use mixamo"): on the rig they stand still for the clip's length; the avatar plays the clip
  const PFE=[['AGREE','Agree'],['SHAKE HEAD','Shake'],['LAUGH','Laugh'],['CHAT','Chat'],['PHONE CALL','Phone'],['CROSS ARMS','Cross'],['BOP','Bop'],['HIP HOP','HipHop'],['TWIST','Twist'],['SWING','Swing'],['THRILLER','Thriller'],
    ['TIPSY','Drunk']];
  const TRAV=__LAZY__("data/pfanim-travel.json");   // (Polyfork's emotes that go somewhere: the hips' way forward, metres; 16 rig units a metre, as Mesh2Motion's recordings fit the rig)
  // a recording's angles made continuous from key to key (161 then -151 is 209: a turn of 48 the short way, not 312 back through upright)
  const POSN=new Set(['root','ik','kp']), unwrap=(a,b)=>{ for(const k in a){ if(POSN.has(k)||!(k in b))continue; const v=a[k], u=b[k];
      if(typeof v==='number'&&typeof u==='number'){ let x=v; while(x-u>180)x-=360; while(x-u<-180)x+=360; a[k]=x; }
      else if(Array.isArray(v)&&Array.isArray(u)){ for(let i=0;i<v.length;i++)if(typeof v[i]==='number'&&typeof u[i]==='number'){ while(v[i]-u[i]>180)v[i]-=360; while(v[i]-u[i]<-180)v[i]+=360; } }
      else if(v&&typeof v==='object'&&u&&typeof u==='object')unwrap(v,u); } };
  // an arm held almost straight out sideways: its swing hardly changes where it points, so a big jump in it (the recording's fit) is held from the key before
  const dir=(a,b)=>{ a*=Math.PI/180; b*=Math.PI/180; return [Math.sin(b),-Math.cos(b)*Math.cos(a),Math.cos(b)*Math.sin(a)]; },
    steady=(P,Q)=>{ for(const s of 'LR'){ const A=P[s], B=Q[s]; if(!A||!B)continue; for(const k of ['ua','fa']){ const a=A[k], b=B[k]; if(!a||!b)continue;
        const near=x=>{ while(x-b[0]>180)x-=360; while(x-b[0]<-180)x+=360; return x; }, alt=[near(a[0]+180),(a[1]>=0?180:-180)-a[1]], cost=c=>Math.abs(near(c[0])-b[0])+Math.abs(c[1]-b[1]);
        if(cost(alt)<cost(a)-20){ a[0]=alt[0]; a[1]=alt[1]; }   // (the same way written past straight up: the arm going over, not swinging round)
        if(Math.abs(a[0]-b[0])<=40||Math.max(Math.abs(a[1]),Math.abs(b[1]))<=70)continue;
      const d1=dir(a[0],a[1]), d2=dir(b[0],a[1]); if(Math.acos(Math.min(1,d1[0]*d2[0]+d1[1]*d2[1]+d1[2]*d2[2]))<.35)A[k]=[b[0],a[1]]; } } };
  // a recording made a move: its keys made continuous and steady, then the rig's (MOTION.add: other books of moves, the dances, 146zq)
  const add=(n,m)=>{ for(let i=1;i<m.keys.length;i++){ unwrap(m.keys[i][1],m.keys[i-1][1]); steady(m.keys[i][1],m.keys[i-1][1]); } R.MOVES['mc_'+n]=R.mkMove({keys:m.keys,ex:0,...(m.opts||{})}); info[n]={loop:!!m.loop,dur:m.dur}; };
  const ensure=()=>ready||(ready=Promise.all([DATA(),TRAV()]).then(([J,TV])=>{ for(const [n,m] of Object.entries(J))add(n,m);
    const K0=J.greet.keys[0][1]; for(const [n,[c,a,b,lp]] of Object.entries(AVATAR.PF)){ const tv=TV[c];
      R.MOVES['mc_pf_'+n]=tv?R.mkMove({travel:true,keep:0,ex:0,keys:tv.z.map((z,i)=>[Math.min(i/10,tv.dur),{...K0,root:[0,K0.root[1],+(z*16).toFixed(2)]},'lin'])}):R.mkMove({keys:[[0,K0,'lin'],[b-a,K0,'lin']],ex:0}); info['pf_'+n]={loop:!!lp,dur:b-a}; }
    Object.assign(R.LOOK,{roll:'mc_roll2',frontKick:'mc_kickFront',roundhouse:'mc_kickRound',hook:'mc_hook2',flinch:'mc_hitChest'}); return info; }));   // (the hand-made moves drawn from recordings: their timing, travel and hits kept)
  const has=n=>!!R.MOVES['mc_'+n];
  // play one on a rig state: a whole-body move from his current pose (a held tool's arm still goes where the game aims it); a looped one starts again as it ends, until he walks, another move takes over or its `while` fails
  const start=(S,n,loop)=>{ R.begin(S,'mc_'+n); return {S,n,loop}; };
  const play=async(n,o={})=>{ const sp=MOTION.special&&MOTION.special[n]; if(sp)return sp(o);   // (an emote that is its own thing to do: STARGAZE, 150fi)
    await ensure(); if(!has(n)||RAG.on||VIT.dead)return false; const loop=o.loop??info[n].loop;
    cur=start(st,n,loop); cur.while=o.while; if(o.share!==false)SYS.run('act',{m:'mc_'+n,loop:loop?1:0}); return true; };
  const stop=()=>{ if(!cur)return; const was=cur; cur=null; if(st.move&&st.move.name==='mc_'+was.n)st.move.t=st.move.def.dur; SYS.run('act',{stop:1}); };
  const theirs=new Map();
  const tickOne=(c,dt)=>{ const S=c.S, m=S.move; if(c.while&&!c.while()){ if(m&&m.name==='mc_'+c.n)m.t=m.def.dur; return false; } if(m&&m.name==='mc_'+c.n){ if(c.loop&&!(S.target>0)&&m.t>=m.def.dur-.05)R.begin(S,'mc_'+c.n); return true; } if(!c.loop||S.target>0||m||S.sit||S.climb||S.hang||S.ride||S.water&&S.water.in)return false; R.begin(S,'mc_'+c.n); return true; };   // (a loop starts again from its last pose before it ends: no frame back toward standing between)
  // standing still a moment: listening while someone talks to you, bent over when out of breath, hurting when low on health (until it no longer holds, or you move)
  let still=0; const STANCE=[['listen',()=>!!(TALK&&TALK.on)],['tired',()=>!!VIT.tired],['hurt',()=>VIT.hp>0&&VIT.hp<.3]];
  const idle=()=>!st.move&&!st.up&&!st.sit&&!st.ride&&!st.climb&&!st.hang&&!(st.water&&st.water.in)&&!(st.target>0)&&!RAG.on&&!VIT.dead&&!SHARED.drive&&!UI.freeCam;
  let calm=0; const CALM=['pf_Cross','pf_Phone','pf_Cross'];   // (owner, 9 Nov 2026: "more idle animations for players when standing")
  SYS.add('life',dt=>{ if(cur||!idle()){ still=0; calm=0; return; } calm+=dt; if((still+=dt)<1.5)return; const s=STANCE.find(([,f])=>f());
    if(s){ still=-1e9; play(s[0],{loop:true,while:s[1]}).then(ok=>{ if(!ok)still=0; }); return; }
    if(calm>14+Math.random()*10&&Math.random()<dt){ calm=0; still=-1e9; const until=performance.now()+5000+Math.random()*5000; play(CALM[Math.floor(Math.random()*CALM.length)],{loop:true,while:()=>performance.now()<until}).then(ok=>{ still=0; }); } },'111da-motion');
  // a hard landing (owner, 7 Nov 2026: "add hard landing"): dropped more than about a storey in a moment (off a roof, a fire escape, a ledge), Polyfork's landing where you come down
  let ly=null, lx=0, lz=0, llv=null, hi=null; const LANDH=2.5*TILE;
  SYS.add('life',dt=>{ const y=SHARED.py, skip=ly==null||llv!==SHARED.LVL||Math.hypot(pos.x-lx,pos.z-lz)>2*TILE||FADE.busy||UI.fly||UI.freeCam||st.ride||SHARED.drive||RAG.on||VIT.dead||(st.water&&st.water.in)||st.climb||st.hang||ROOMS.cur;
    lx=pos.x; lz=pos.z; llv=SHARED.LVL; if(skip){ ly=y; hi=null; return; }
    if(dt>0&&(ly-y)/dt>6*TILE){ if(hi==null)hi=ly; } else if(hi!=null){ if(hi-y>LANDH&&!cur&&!st.move&&!st.sit)play('pf_Land'); hi=null; }   // (falling: coming down faster than running down stairs)
    ly=y; },'111da-motion');
  SYS.onStart(()=>setTimeout(()=>ensure().catch(()=>{}),3000),'111da-motion');   // (the recordings soon after the start: the hand-made moves drawn from them from then on)
  SYS.add('life',dt=>{ if(cur&&!tickOne(cur,dt)){ const lp=cur.loop; cur=null; if(lp)SYS.run('act',{stop:1}); } for(const [S,c] of theirs)if(!tickOne(c,dt))theirs.delete(S); },'111da-motion');
  // what another player plays: fetched first if this page has not yet, then on their body here
  const packs=[];   // (other books of moves, fetched when first needed: {pre: their names' start, load()})
  const their=(S,m)=>{ if(m.stop){ theirs.delete(S); return; } const pk=packs.find(p=>m.m.startsWith('mc_'+p.pre)); Promise.all([ensure(),pk&&pk.load()]).then(()=>{ if(!R.MOVES[m.m])return; R.begin(S,m.m); theirs.set(S,{S,n:m.m.slice(3),loop:!!m.loop}); }); };
  // the emote panel (H), a window like the others (owner, 7 Nov 2026: "make the emote menu look like regular menus. also allow to drag them to the favorites bar"): a button an emote, by kind; drag one onto the quick bar
  const sp=document.createElement('div'); sp.id='emotes'; sp.hidden=true;
  sp.style.cssText='position:fixed;right:16px;top:56px;width:min(880px,96vw);max-height:calc(100vh - 72px);overflow:auto;z-index:21;padding:12px 14px;box-sizing:border-box;background:#0b0d13;zoom:var(--uiz,1)';
  document.body.appendChild(sp); sp.addEventListener('keydown',e=>{ if(e.key==='Escape')MOTION.close(); e.stopPropagation(); }); sp.addEventListener('keyup',e=>e.stopPropagation());
  const ALLE=[...EMOTES,...PFE.map(([t,n])=>[t,'pf_'+n])], LABEL=Object.fromEntries(ALLE.map(([t,n])=>[n,t]));
  const KINDS=[['GREET AND TALK',['greet','yes','nod','no','pf_Agree','pf_Shake','talk','pf_Chat','pf_Phone','pf_Laugh','listen','clap','cheer','fistPump','dab','flex','knock','powerUp']],
    ['MOODS',['angry','confused','foldArms','pf_Cross','pf_Drunk','shiver','dizzy','shakeOff','hurt','tired']],
    ['DANCE',['dance','pf_Bop','pf_HipHop','pf_Twist','pf_Swing','pf_Thriller','armPump','bodyRoll','charleston','hipReach','moonwalk']],
    ['REST AND EXERCISE',['sitGround','meditate','sleep','stargaze','jacks','pushups']],
    ['WALKS',['stroll','strut','sneak','tiptoe','stagger','limp','sprint','backUp','crouchWalk','crawl','formalWalk']],
    ['TRICKS AND FIGHTING',['backflip','rollGo','knockback','pound','kickFront','kickRound','guard','swordCombo','slash','throw','toss']],
    ['WORK',['pickUp']],
    ['LEARNT FROM FOLK',[]]];   // (moves the street's trainers show you, 162ee-emotes)
  const B=(t,n)=>{ const b=document.createElement('button'); b.type='button'; b.textContent=t; b.draggable=true; b.title='drag onto the quick bar to keep it there';
    b.onclick=()=>{ play(n); MOTION.close(); }; b.addEventListener('dragstart',e=>{ e.dataTransfer.setData('text/plain','emote:'+n); e.dataTransfer.effectAllowed='copy'; }); return b; };
  { const c=document.createElement('style'); c.textContent='#emotes .emk{color:#3aa866;margin:4px 0 2px;font-size:12px!important;line-height:1.2!important} #emotes h3{margin:0 0 4px} #emotes .emg{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:3px} #emotes .emg button{height:21px;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.1;font-size:10px!important;letter-spacing:0!important;padding:2px!important;box-shadow:inset 0 0 0 1px #2d5a40!important;overflow-wrap:anywhere}'; document.head.appendChild(c); }   // (owner, 7 Nov 2026: "every emote as a square with emote inside it"; his pick: just the name)
  const head=document.createElement('h3'); head.textContent='EMOTES'; sp.append(head);
  const GRID={}; for(const [k,ns] of KINDS){ const h=document.createElement('div'); h.textContent=k; h.className='emk'; const g=document.createElement('div'); g.className='emg'; GRID[k]=g; for(const n of ns)if(LABEL[n])g.append(B(LABEL[n],n)); sp.append(h,g); }
  // a button of another system's in a kind's row (the dance book under DANCE)
  const more=(k,t,fn)=>{ const g=GRID[k]; if(!g)return; const b=document.createElement('button'); b.type='button'; b.textContent=t; b.onclick=()=>{ MOTION.close(); fn(); }; g.append(b); return b; };
  const tip=document.createElement('div'); tip.textContent='WALK TO STOP ONE THAT LOOPS · DRAG ONE ONTO THE QUICK BAR'; tip.className='emk'; sp.append(tip);
  // the fight keys: L a side kick (again late in it, a spin kick), O a dodge back; kicks land through STRIKES by their names, a dodge lets blows miss
  const can=()=>!SHARED.drive&&!RAG.on&&!VIT.dead&&!(VIT.out>0)&&!UI.freeCam&&!st.sit&&!st.ride&&!st.climb&&!st.hang&&!(st.water&&st.water.in)&&!VIT.tired;
  const fight=k=>{ '@later'; if(!can())return; const m=st.move, t=m?m.t:0;
    if(k==='l'){ if(m&&m.name==='mc_kickSide'){ if(t>.45)play('kickSpin'); return; } if(!m||m.name.startsWith('mc_')&&info[m.name.slice(3)]&&!/kick/.test(m.name))play('kickSide'); }
    else if(k==='o'&&(!m||!/^mc_(dodge|kick)/.test(m.name))){ VIT.spend(.06); play('dodge'); } };
  addEventListener('keydown',e=>{ if(e.repeat||e.target&&e.target.closest&&e.target.closest('input,textarea,[contenteditable="true"]'))return; const k=UI.key(e);
    if(k==='h'&&!UI.menuOpen){ if(MOTION.hDown)MOTION.hDown(); else MOTION.toggle(); e.preventDefault(); } else if((k==='l'||k==='o')&&!UI.menuOpen)fight(k); });
  addEventListener('keyup',e=>{ if(e.key&&e.key.toLowerCase()===UI.keyOf('h')&&MOTION.hUp)MOTION.hUp(); });
  window.MOTION=MOTION; Object.defineProperty(MOTION,'cur',{get:()=>cur&&cur.n}); MOTION.dodging=()=>!!(st.move&&st.move.name==='mc_dodge'&&st.move.t<.55); Object.assign(MOTION,{EMOTES,label:n=>LABEL[n]||null,teach:(n,t)=>{ LABEL[n]=t; },labels:()=>({...LABEL}),ensure,play,stop,their,has,info,add,packs,more,
    open:()=>{ sp.hidden=false; ensure(); }, close:()=>{ sp.hidden=true; }, toggle:()=>{ if(sp.hidden)MOTION.open(); else MOTION.close(); }});
}
