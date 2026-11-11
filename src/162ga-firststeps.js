// FIRST STEPS: the beta welcome a player sees first, then a checklist in the corner that ticks itself off as you play; all six pay $100 (owner, 11 Nov 2026: "C").
import {SHARED} from './003-shx.js';
import {FIRSTDAY, INV, ROOMS, st, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {SYS} from './006-map-pre.js';
{ const QS=new URLSearchParams(location.search);
  const STEPS=[
    ['walk','WALK <b class="fk">W A S D</b>, RUN <b class="fk">SHIFT</b>'],
    ['view','CHANGE THE VIEW <b class="fk">V</b>'],
    ['street','GO UP THE STAIRS TO MARKET ST'],
    ['inside','DOUBLE CLICK A DOOR TO GO IN'],
    ['pack','OPEN YOUR PACK <b class="fk">I</b>'],
    ['map','FIND A PLACE ON THE MAP <b class="fk">SHIFT M</b>']];
  const PAY=100, on=()=>QS.get('welcome')==='1'||!!OWNED.me&&!/^dev-/.test(OWNED.me.id||'');   // (the checks' made-up logins and the single-file page go straight in)
  let S={}; try{ S=JSON.parse(OWNED.get('fsteps')||'{}')||{}; }catch(e){ S={}; }
  const save=()=>OWNED.set('fsteps',JSON.stringify(S));
  const css=document.createElement('style'); css.textContent=`#fwel,#fsteps{font-family:'Share Tech Mono',ui-monospace,monospace;letter-spacing:1.5px;color:#7dffa8;background:repeating-linear-gradient(0deg,rgba(125,255,168,.05) 0 1px,transparent 1px 3px),#020a06;box-shadow:0 0 0 2px #3aa866;position:fixed;z-index:55;box-sizing:border-box}
    #fwel{left:50%;top:50%;transform:translate(-50%,-50%);width:min(640px,92vw);padding:22px 24px;font-size:16px;line-height:1.55} #fwel[hidden],#fsteps[hidden]{display:none}
    #fwel .bt{display:inline-block;color:#020a06;background:#f2c14e;padding:2px 10px;font-size:14px;letter-spacing:3px}
    #fwel .big{font-family:system-ui,sans-serif;letter-spacing:0;font-size:clamp(19px,2.6vw,25px);line-height:1.45;color:#d8ffe4;margin:14px 0 16px}
    #fwel p{margin:0 0 10px;color:#7dffa8} #fwel .fk,#fsteps .fk{display:inline-block;padding:0 5px;border:1px solid #3aa866;border-bottom-width:3px;color:#d8ffe4;font-weight:normal}
    #fwel button,#fsteps button{font:inherit;cursor:pointer;border:0} #fwel .go{float:right;margin-top:6px;color:#020a06;background:#7dffa8;padding:6px 16px;font-size:16px}
    #fsteps{right:12px;top:12px;width:min(340px,80vw);font-size:13px;line-height:1.5} #fsteps .tt{display:flex;justify-content:space-between;align-items:center;padding:7px 12px;font-size:16px;letter-spacing:3px;box-shadow:inset 0 0 0 2px #3aa866;background:rgba(3,26,13,.85)}
    #fsteps .tt span{color:#3aa866;font-size:12px} #fsteps .tt button{color:#3aa866;background:none;font-size:16px;padding:0 0 0 10px} #fsteps .pn{padding:8px 12px;box-shadow:inset 0 0 0 2px #3aa866;background:rgba(3,26,13,.85)}
    #fsteps .t{display:flex;gap:8px;margin:3px 0} #fsteps .t i{flex:0 0 14px;font-style:normal} #fsteps .t.d{color:#3aa866;text-decoration:line-through} #fsteps .t.n{color:#d8ffe4} #fsteps .rw{margin-top:6px;color:#3aa866} #fsteps .rw b{color:#f2c14e;font-weight:normal}`;
  document.head.appendChild(css);
  const wel=document.createElement('div'); wel.id='fwel'; wel.hidden=true;
  wel.innerHTML=`<span class="bt">VERY ROUGH BETA</span><div class="big">This is a very rough beta. Everything you see will be changing. We're building the core game engine and world first, then filling it out with The Strangest Flea Market's characters and wares one by one. Stay tuned!</div>`
    +`<p>Everyone you see walking around is a real player, live. You start on the subway platform; Market St is up the stairs.</p>`
    +`<p>Stuck? <b class="fk">?</b> shows everything you can do, <b class="fk">F8</b> reports a bug, and the chat is bottom left.</p><button class="go">GOT IT ▸</button>`;
  const box=document.createElement('div'); box.id='fsteps'; box.hidden=true;
  document.body.append(wel,box);
  const n=()=>STEPS.filter(([k])=>S[k]).length;
  const draw=()=>{ const nx=STEPS.find(([k])=>!S[k]);
    box.innerHTML=`<div class="tt">FIRST STEPS<span>${n()} / ${STEPS.length}<button aria-label="close">✕</button></span></div><div class="pn">`
      +STEPS.map(([k,t])=>`<div class="t${S[k]?' d':nx&&nx[0]===k?' n':''}"><i>${S[k]?'■':nx&&nx[0]===k?'▸':'□'}</i><span>${t}</span></div>`).join('')
      +`<div class="rw">ALL ${STEPS.length}: <b>$${PAY}</b></div></div>`; };
  const finish=()=>{ S.done=1; save(); box.hidden=true; INV.cash=(INV.cash||0)+PAY; INV.save(); SAY('FIRST STEPS DONE: $'+PAY+'. PRESS ? FOR EVERYTHING ELSE YOU CAN DO.','#7dffa8'); };
  wel.querySelector('.go').onclick=()=>{ S.seen=1; save(); wel.hidden=true; if(!S.done&&!S.off){ draw(); box.hidden=false; } };
  box.addEventListener('click',e=>{ if(e.target.closest('button')){ S.off=1; save(); box.hidden=true; } });
  const shown=p=>{ const el=UI.menuOpen&&document.querySelector('#menu .panes>[data-p="'+p+'"]'); return !!el&&!el.hidden; };
  let v0=null, moved=false, ran=false;
  addEventListener('keydown',e=>{ if(/^(KeyW|KeyA|KeyS|KeyD|Arrow)/.test(e.code))moved=true; },{passive:true});
  SYS.onStart(()=>{ if(!on())return; v0=UI.view;
    SYS.every(()=>{ if(FIRSTDAY.on)return; if(!S.seen){ if(wel.hidden)wel.hidden=false; return; } if(S.done||S.off)return; if(box.hidden){ draw(); box.hidden=false; }
      if(moved&&st.run>.5)ran=true;
      const now={walk:moved&&ran,view:v0!=null&&UI.view!==v0,street:SHARED.LVL==='up',inside:!!ROOMS.cur,pack:shown('bag'),map:shown('bro')};
      let ch=false; for(const [k] of STEPS)if(!S[k]&&now[k]){ S[k]=1; ch=true; }
      if(ch){ save(); if(n()===STEPS.length)finish(); else draw(); } },500); },'162ga-firststeps');
}
