// THE INSTRUMENTS YOU SIT AT (owner, 7 Nov 2026: "lets do piano and drums and harp ... play like the guitar"; "start me with every instrument and 100 skill in each"): INSTR, one way to own, set down, sit at and play the piano, the drum kit and the harp (146zpa-c fill in each): the instrument before you, your body seated with its arms, hands and every finger (or stick) on what it plays, its sound from the music engine's strings, heads and hammers, a song book by skill, the close-up, and everyone near seeing and hearing it.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INSTR, ONLINE, pos, st, UI, W3} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
import {HANDS} from './111b-hands.js';
import {BODEGA} from './146ze-bodega.js';
import {SONGBK} from './146znz-songbook.js';
import {GSND} from './146zo-guitar-sound.js';
import {GHOLD} from './146zoa-guitar-hold.js';
import {GUITAR} from './146zob-guitar.js';
 window.INSTR=INSTR;
{ const say=(t,c)=>SAY(t,c||'#e8e2cc'), now=()=>performance.now()/1000, V3=THREE.Vector3, M4=THREE.Matrix4, Q4=THREE.Quaternion;
  const esc=t=>String(t).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
  // a kind: {id, name, skill, model(), board() (a display under the book: the piano's 88 keys), seat:{y,z}, lean, look, feet(P,t), hands(P,t,H), act(P,k,v), anim(P,H,t,dt), keys(e,down), panel(), click(b,down), draw(PN), book(), cam}
  INSTR.kind=K=>{ INSTR.KINDS[K.id]=K; FORAGE.add({names:{[K.id]:K.name}}); FORAGE.sell(K.id);
    FORAGE.ACT[K.id]=()=>{ if(on&&ME.K===K)INSTR.stop(); else INSTR.start(K.id); }; FORAGE.ACT[K.id+'play']=FORAGE.ACT[K.id];
    FORAGE.ROWB.push(id=>id===K.id?[[on&&ME.K===K?'PUT IT AWAY':'PLAY',K.id+'play']]:[]); };
  const skill=K=>FORAGE.sk?FORAGE.sk(K.skill)||0:0;
  INSTR.skill=skill;

  /* ---------- a player at an instrument: what they play (the same shape as a song's), or a song from its book; their voice; the instrument on their body ---------- */
  const mk=(id,K)=>({id,K,live:{ev:[]},song:-1,s0:0,cur:0,V:null,H:null,st:{}});
  const score=P=>P.song>=0&&P.K.BOOK[P.song]?P.K.BOOK[P.song].c:P.live, time=P=>P.song>=0?now()-P.s0:now();
  INSTR.score=score; INSTR.time=time;
  const voice=P=>{ if(!GSND.imx){ GSND.wake(); return null; } return P.V||(P.V=GSND.inst((P.id==='me'?'me':P.id)+'|'+P.K.id,P.K.dsp())); };
  // (the hands keep their place in the score, H.lo: it moves back with what is dropped from the front)
  const trim=P=>{ const L=P.live.ev, t=now()-12; let n=0; while(L.length>200||L.length&&L[0].t+(L[0].d>1e6?0:L[0].d)<t&&L[0].d<1e6){ L.shift(); n++; } if(n&&P.H&&P.H.lo)P.H.lo=Math.max(0,P.H.lo-n); };
  // a note played now: into the live score (the hands follow it) and to the voice
  /* ---------- the recorded sounds (owner, 8 Nov 2026: "real sounds"; data/<id>-samples.mp3 and .json, tools/instrument-samples-bake.py): fetched and decoded the first time someone near plays; till they come, the music engine's model plays ---------- */
  const SMP=GSND.SETS; INSTR.SMP=SMP; INSTR.GSND=GSND;
  const smp=K=>GSND.set(K.id,K.samples);
  INSTR.loadSounds=K=>smp(K);
  // a note out: its recordings (K.sample: which sound, how fast, how loud, how bright; a note that cuts off its own last one, or its group's), else the model's events
  const emit=(P,e,when)=>{ const V=voice(P); if(!V)return; const K=P.K, S=smp(K); if(!(S.ok&&K.sample))return GSND.send(V,K.sound(e,P),when);
    for(const h of K.sample(e,P,S))GSND.play(V,S,h,when); };
  // stopping notes (a damper, a hand on a string): the recordings fade, or the model takes the same events
  const rel=(P,evs,when)=>{ const V=P.V; if(!V||!evs||!evs.length)return; const S=SMP[P.K.id]; if(!(S&&S.ok&&P.K.sample))return GSND.send(V,evs,when);
    for(const q of evs){ const id=q.k==='mute'?q.s:q.id; for(const o of V.on||[])if(o.id===id&&o.end>when){ GSND.fade(o,when,q.k==='mute'?.12:(q.T||.15)); if(q.rel){ const r=GSND.near(S,'r',id); if(r)GSND.play(V,S,{...r,rate:1,gain:q.rel},when); } } } };
  INSTR.note=(P,e)=>{ e.t=e.t??now(); P.live.ev.push(e); trim(P); emit(P,e,GSND.now()+.01); if(P===ME&&++freeN%25===0)FORAGE.use(P.K.skill,-10,45); return e; };
  INSTR.off=(P,e,t)=>{ if(!e||e.d<1e6)return; e.d=Math.max(.03,(t??now())-e.t); if(P.K.release)rel(P,P.K.release(e,P),GSND.now()+.005); };
  INSTR.raw=(P,evs)=>{ voice(P); rel(P,evs,GSND.now()+.01); };
  let freeN=0;
  // a piece played as a player plays it (owner, 10 Nov 2026: "sounds like midi"): each onset a little off the grid (a chord's notes together), the tempo breathing and held back at the end; where the book gives every note the same loudness, the line shapes it (higher and longer louder, the tune over its accompaniment, a phrase's end softer); for the one-note instruments, which notes join; the same for everyone who hears it (from each note's place, not chance)
  const hsh=i=>{ let x=Math.imul(i^0x5bd1e995,0x85ebca6b); x^=x>>>13; x=Math.imul(x,0xc2b2ae35); x^=x>>>16; return (x>>>0)/4294967296; };
  INSTR.feel=(c,K)=>{ if(!c||c.felt||!c.ev.length)return; c.felt=1; const ev=c.ev, end=c.len, vs=new Set(ev.map(e=>Math.round(e.v*20))), flat=vs.size<=2&&K.id!=='drums';
    let lo=127, hi=0; for(const e of ev){ lo=Math.min(lo,e.n); hi=Math.max(hi,e.n); } const span=Math.max(1,hi-lo), ex=t=>t+.04*Math.sin(t*.57)+(t>end-4?.02*(t-end+4)**2:0);
    let on=-1e9, jt=0, top=0;
    for(let i=0;i<ev.length;i++){ const e=ev[i]; if(e.t-on>.015){ on=e.t; jt=(hsh(i)-.5)*.02; top=e.n; for(let j=i+1;j<ev.length&&ev[j].t-on<=.015;j++)top=Math.max(top,ev[j].n); }
      let j=i+1; while(j<ev.length&&ev[j].t<=e.t+.015)j++; const nx=ev[j], gap=nx?nx.t-(e.t+e.d):9;
      let v=e.v; if(flat){ v=.45+.3*(e.n-lo)/span+Math.min(.12,e.d*.12)-(gap>.3?.08:0); if(K.id==='piano'||K.id==='harp')v+=e.n===top&&e.h==='R'?.1:e.h==='L'?-.1:-.04; }
      e.v=Math.max(.06,Math.min(1,v*(1+(hsh(i+7919)-.5)*.14)));
      if(K.mel){ e.lg=!!nx&&gap<.06&&nx.t>e.t+.03; if(e.lg)nx.sl=1; }
      const t0=e.t, t1=ex(t0+e.d); e.t=Math.max(0,ex(t0)+jt+(hsh(i+31)-.5)*.004); e.d=Math.max(.03,t1-ex(t0)); }
    ev.sort((a,b)=>a.t-b.t); c.len=Math.max(ex(end),ev.reduce((a,e)=>Math.max(a,e.t+e.d),0)); };
  const songGo=(P,i,fail=0)=>{ const T=P.K.BOOK[i]; if(!T)return; if(!T.c)P.K.compile(T); INSTR.feel(T.c,P.K); P.song=i; P.s0=now()+.6; P.cur=0; P.fail=fail; };
  const songStop=P=>{ if(P.song<0)return; P.song=-1; if(P.V&&P.K.hush)rel(P,P.K.hush(P),GSND.now()+.01); };
  // a song's notes go to the voice a little ahead of the clock
  const songTick=P=>{ if(P.song<0)return; const T=P.K.BOOK[P.song], c=T&&T.c; if(!c)return songStop(P); const t=time(P); if(P.fail&&t>P.fail){ songStop(P); if(P===ME){ tell('stop'); SONGBK.done(P.K.skill,T,false,P.fail/c.len); fillSongs(); drawPanel(); } return; }
    if(t>c.len+1){ songStop(P); if(P===ME){ SONGBK.done(P.K.skill,T,true); fillSongs(); drawPanel(); } return; } const V=voice(P); if(!V)return;
    while(P.cur<c.ev.length&&c.ev[P.cur].t<=t+.12){ let e=c.ev[P.cur++]; if(e.t<t-.05)continue; if(P.fail&&e.t>P.fail-SONGBK.LEAD){ const d=SONGBK.slip(); if(d===0)continue; if(d){ const R=P.K.slip; e={...e,n:Math.max(R[0],Math.min(R[1],e.n+d))}; } }
      const when=GSND.now()+Math.max(0,e.t-t)+.02; emit(P,e,when);
      if(P.K.release&&e.d<60)rel(P,P.K.release(e,P),when+e.d); } };

  /* ---------- the body seated at it: lowered onto the seat, leaning in, the legs to the floor or the pedals, the arms to where the hands play, each finger on its key or string ---------- */
  const QA=new Q4(), VA=new V3(), VB=new V3(), MA=new M4(), MB=new M4(), F=new M4();
  INSTR.attach=(me,PM,body,P)=>{ if(!body.binv||!GHOLD.IK)return null; const {reach,aim,untwist,turnAbout,org}=GHOLD.IK, K=P.K, G=K.model(); G.matrixAutoUpdate=false; me.add(G);
    const restM=body.binv.map(m=>m.clone().invert()), W=restM.map(()=>new M4()), W0=restM.map(()=>new M4()), R0=HANDS.R0;
    const H={me,PM,G,K,on:true,off:{L:new V3(),R:new V3()},fg:{L:R0.map(f=>f.slice()),R:R0.map(f=>f.slice())},err:{L:[],R:[]},k:30,wr:{L:new V3(),R:new V3()},st:{}};
    const hipY=org(restM[9],new V3()).y, sh={L:org(restM[3],new V3()),R:org(restM[6],new V3())};
    H.sh=sh;
    PM.post=(PMx)=>{ if(!H.on)return; const P_=PMx.value, t=time(P), k=VA.setFromMatrixColumn(P_[0],0).length(), m=v=>v.clone().multiplyScalar(k), dir=v=>v.clone().normalize(); H.k=k;
      F.makeScale(k,k,k); G.matrix.copy(F); G.matrixWorldNeedsUpdate=true;
      for(let i=0;i<15;i++)W[i].multiplyMatrices(F,restM[i]);
      // onto the seat (the thighs' tops a hand above it), then the torso leans in and sways a little with the music
      MA.makeTranslation(0,(K.seat.y+.075-hipY)*k,(K.seat.z||0)*k); for(let i=0;i<15;i++)W[i].premultiply(MA);
      const sway=K.sway?K.sway(P,t,H):0, tj=org(W[1],new V3());
      QA.setFromEuler(new THREE.Euler((K.lean||0)+.012*Math.sin(t*1.3),sway*.6,sway*.25+(K.roll?K.roll(P,t,H):0),'XYZ')); for(let i=1;i<=8;i++)turnAbout(W[i],tj,QA);
      // the legs: knees forward, feet where it wants them
      const ft=K.feet(P,t,H); reach(W,[9,10,11],m(ft.L),dir(new V3(.15,.35,1))); reach(W,[12,13,14],m(ft.R),dir(new V3(-.15,.35,1)));
      // the head looks at what the hands do
      { const hp=org(W[2],new V3()); turnAbout(W[2],hp,QA.setFromEuler(new THREE.Euler(K.look||.3,(K.lookY?K.lookY(P,t,H):0),0,'YXZ'))); }
      const hd=K.hands(P,t,H), st=PMx.hands, E={L:new V3(),R:new V3()};
      for(let i=0;i<15;i++)W0[i].copy(W[i]);
      for(let it=0,worst=1;it<8&&(it<3||worst>.003);it++){ if(it)for(let i=0;i<15;i++)W[i].copy(W0[i]); worst=0;
        for(const [sd,ids] of [['L',[3,4,5]],['R',[6,7,8]]]){ const h=hd[sd]; reach(W,ids,m(h.wr).add(H.off[sd]),dir(h.pole||(sd==='L'?new V3(.9,-.7,-.3):new V3(-.9,-.7,-.3)))); untwist(W,ids,1); }
        for(const [sd,ids] of [['L',[3,4,5]],['R',[6,7,8]]]){ const h=hd[sd]; aim(W,ids[2],sd,dir(h.Fd),dir(h.Dd)); untwist(W,ids,2); }
        if(!st||!st.base)break; let more=false;
        for(const [sd,bi] of [['L',5],['R',8]]){ const h=hd[sd], f=H.fg[sd]; if(h.fist){ for(let i=0;i<5;i++)f[i]=h.fist[i]; H.off[sd].set(0,0,0); continue; }
          if(!st.near){ for(let i=0;i<5;i++)f[i]=R0[i].slice(); continue; }
          const base=MA.multiplyMatrices(W[bi],body.binv[bi]).multiply(st.base[sd]), inv=MB.copy(base).invert(), e=E[sd].set(0,0,0); let ws=0;
          for(let i=0;i<5;i++){ const tg=h.tips[i]; if(!tg){ f[i]=h.rest?h.rest[i].slice():[.25,.35,.25,R0[i][3]]; continue; } const tw=m(tg), v=tw.clone().applyMatrix4(inv); HANDS.reach(i,v,f[i]);
            const tip=HANDS.tip(i,f[i],new V3()).applyMatrix4(base), w=h.w?h.w[i]:1; H.err[sd][i]=tip.distanceTo(tw)/k; if(h.w&&h.w[i]>1)worst=Math.max(worst,H.err[sd][i]); e.addScaledVector(tw.sub(tip),w); ws+=w; }
          if(ws){ e.multiplyScalar(1/ws); H.off[sd].add(e); const mx=.07*k; if(H.off[sd].length()>mx)H.off[sd].setLength(mx); more=true; } }
        if(!more)break; }
      if(st)st.fg=H.fg;
      for(const [sd,bi] of [['L',5],['R',8]])H.wr[sd].setFromMatrixPosition(W[bi]).multiplyScalar(1/k);
      H.W=W; if(K.after)K.after(P,H,t,hd);
      for(let i=0;i<15;i++)P_[i].multiplyMatrices(W[i],body.binv[i]); };
    return H; };
  INSTR.detach=H=>{ if(!H)return; H.on=false; if(H.PM.post)H.PM.post=null; if(H.G.parent)H.G.parent.remove(H.G); const st=H.PM.hands; if(st)st.fg=null; };
  const hold=(P,me,PM,body)=>{ if(P.H&&P.H.me===me&&P.H.K===P.K)return; if(P.H)INSTR.detach(P.H); P.H=me&&PM?INSTR.attach(me,PM,body,P):null; };
  const unhold=P=>{ if(P.H)INSTR.detach(P.H); P.H=null; if(P.V){ GSND.drop(P.V.who); P.V=null; } };

  /* ---------- you ---------- */
  const ME=mk('me',null); let on=false, prevView='';
  INSTR.ME=ME; INSTR.on=()=>on; INSTR.kindOn=()=>on?ME.K.id:null;
  const myMesh=()=>W3.group.children.find(m=>m.userData&&m.userData.hands&&m.userData.PM&&m.visible!==undefined);
  // what you play goes out in one message every 30 ms (a chord is several keys at once): its items each a letter (n a note, u a lift, p a pedal) and the instrument's own few numbers
  const send=(k,v)=>{ if(ONLINE.send)ONLINE.send({t:'ins',k,i:ME.K?ME.K.id:'',v:v==null?'':String(v)}); };
  let Q=[], qT=0; const flush=()=>{ qT=0; if(!Q.length)return; let v=''; while(Q.length&&(v?v.length+1:0)+Q[0].length<=48)v+=(v?',':'')+Q.shift(); send('b',v); if(Q.length)qT=setTimeout(flush,30); };
  const tell=(k,v)=>{ if(k==='n'||k==='u'||k==='p'){ Q.push(k+(v??'')); if(!qT)qT=setTimeout(flush,30); return; } if(k==='off'||k==='on')Q=[]; send(k,v); };
  INSTR.tell=tell;
  // place: one that stands somewhere (the bar's piano and kit): {at()->{x,z,hd} its seat, take(), back(), live()}; you sit there and play the room's own, yours not set down, none needed in your bag
  INSTR.start=(id,place)=>{ const K=INSTR.KINDS[id]; if(!K)return; if(on){ if(ME.K===K)return; INSTR.stop(); }
    if(st.water&&st.water.in||st.ride||st.climb||st.hang||st.sit)return say('NOT HERE: STAND SOMEWHERE STEADY AND OPEN TO SET IT DOWN.','#c8a090');
    if(GUITAR&&GUITAR.on())GUITAR.stop(); GSND.wake(); on=true; ME.K=K; setTimeout(()=>smp(K),400); ME.song=-1; ME.live={ev:[]}; ME.st={}; ME.cur=0;
    ME.place=place||null; if(place){ ME.back=pos.clone(); const a=place.at(); pos.x=a.x; pos.z=a.z; SHARED.heading=a.hd; SHARED.target=null; if(place.take)place.take(); }
    prevView=UI.view; if(CU.on&&!UI.persp)UI.setView('third'); panel(true); tell('on',place?'k':''); K.loadBook&&K.loadBook();
    say((place?'YOU SIT AT '+K.name.replace(/^A /,'THE ')+' WHERE IT STANDS.':'YOU SET DOWN '+K.name+' AND SIT AT IT.')+' PICK A PIECE FROM THE BOOK · ` PLAYS IT · TAB THE CLOSE-UP · ESC TO PUT IT AWAY.'); };
  INSTR.stop=()=>{ if(!on)return; on=false; songStop(ME); if(ME.K&&ME.K.hush&&ME.V)rel(ME,ME.K.hush(ME),GSND.now()+.01); unhold(ME); panel(false); tell('off');
    const pl=ME.place; ME.place=null; if(pl){ if(pl.back)pl.back(); if(ME.back){ pos.x=ME.back.x; pos.z=ME.back.z; } ME.back=null; } if(prevView&&prevView!==UI.view&&!/third/.test(prevView))UI.setView(prevView); prevView=''; };
  INSTR.play=(k,v)=>{ if(!on)return; const K=ME.K; if(k==='song'&&v===ME.song)k='stop';
    if(k==='song'){ const T=K.BOOK[v]; if(!T||!SONGBK.can(K.skill,K.BOOK,T))return say(T?`${T.name.toUpperCase()} IS NOT OPEN TO YOU YET (${K.skill.toUpperCase()} ${T.lvl}; YOURS IS ${skill(K).toFixed(1)}). LEARN THE PIECES YOU HAVE.`:'THAT PIECE IS NOT IN THE BOOK.','#c8a090'); if(!T.c)K.compile(T); const r=SONGBK.start(K.skill,T), f=r.ok?0:+(T.c.len*r.at).toFixed(1); songGo(ME,v,f); tell('song',v+(f?':'+f:'')); }
    else if(k==='stop'){ songStop(ME); tell('stop'); }
    drawPanel(); };

  /* ---------- keys while you play (they are the instrument's, not your feet's) ---------- */
  const KEYS=(e,down)=>{ if(!on||e.ctrlKey||e.metaKey||e.altKey)return; if(e.target&&e.target.closest&&e.target.closest('input,textarea,select,[contenteditable="true"]'))return; if(UI.menuOpen)return;
    const c=e.code; let used=true;
    if(down&&c==='Escape')INSTR.stop();
    else if(down&&c==='Tab'){ if(!e.repeat)closeUp(!CU.on); }
    else if(down&&c==='Backquote'){ if(!e.repeat)INSTR.play(ME.song>=0?'stop':'song',ME.song>=0?null:+(PN&&PN.querySelector('#insong').value||0)); }
    else if(/^(Key[A-Z]|Digit\d|Arrow\w+|Space|Shift\w*|Comma|Period|Slash|Semicolon|Quote|Bracket\w+|Minus|Equal|Backslash)$/.test(c)){}   // (your feet stay put while you play)
    else used=false;
    if(used){ e.preventDefault(); e.stopImmediatePropagation(); } };
  addEventListener('keydown',e=>KEYS(e,true),true); addEventListener('keyup',e=>KEYS(e,false),true);
  addEventListener('blur',()=>{ if(on&&ME.K.blur)ME.K.blur(); });

  /* ---------- the panel: the instrument's own controls (its draw), then the book, the close-up, the volume ---------- */
  let PN=null;
  const css=document.createElement('style'); css.textContent=`#inp{position:fixed;left:50%;bottom:calc((84px + env(safe-area-inset-bottom,0px)) / var(--uiz,1));transform:translateX(-50%);z-index:7;zoom:var(--uiz,1);background:#0b0d13e6;border:2px solid #2a3040;padding:6px 8px;color:#e8e2cc;font:9px Silkscreen,monospace;width:min(700px,calc(100vw - 32px));box-sizing:border-box;user-select:none}
    #inp .r{display:flex;flex-wrap:wrap;gap:2px 4px;align-items:center;margin:2px 0} #inp button{font:inherit;color:inherit;background:#161a24;border:2px solid #2a3040;padding:2px 5px;cursor:pointer} #inp button[aria-pressed=true]{background:#2c4a36;border-color:#5fa06e}
    #inp select{font:inherit;color:inherit;background:#0b0d13;border:2px solid #2a3040;padding:2px;max-width:230px} #inp input[type=range]{width:70px} #inp .h{margin-right:8px} #inp .d{opacity:.6;margin:0 2px 0 8px}
    #inp .kb{position:relative;height:62px;margin:6px 0 3px;touch-action:none} #inp .kb b{position:absolute;top:0;box-sizing:border-box;border:1px solid #2a3040;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:2px;font-weight:normal;font-size:8px;line-height:1.15;overflow:hidden}
    #inp .kb b.w{height:60px;background:#e8e2cc;color:#555} #inp .kb b.k{height:36px;background:#141418;color:#999;z-index:1} #inp .kb b.on,#inp .kb b.pl{background:#5fa06e!important;color:#fff} #inp .kb.all b{font-size:6px}
    #inp .pads{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin:3px 0} #inp .pads button{padding:8px 2px} #inp .pads button.hit{background:#5fa06e}`;
  document.head.appendChild(css);
  const panel=show=>{ if(!show){ if(PN)PN.hidden=true; return; } if(!PN){ PN=document.createElement('div'); PN.id='inp'; document.body.appendChild(PN);
      PN.addEventListener('pointerdown',e=>{ const b=e.target.closest('b,button'); if(!b||!on)return; GSND.wake(); if(b.dataset.n!=null||b.dataset.pad!=null){ e.preventDefault(); ME.K.click(b,true); b.setPointerCapture&&b.setPointerCapture(e.pointerId); } });
      PN.addEventListener('pointerup',e=>{ const b=e.target.closest('b,button'); if(b&&on&&(b.dataset.n!=null||b.dataset.pad!=null))ME.K.click(b,false); });
      PN.addEventListener('pointercancel',e=>{ const b=e.target.closest('b,button'); if(b&&on&&(b.dataset.n!=null||b.dataset.pad!=null))ME.K.click(b,false); });
      PN.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||!on)return; GSND.wake(); if(b.dataset.n!=null||b.dataset.pad!=null)return;
        if(b.id==='inplay')INSTR.play(ME.song>=0?'stop':'song',ME.song>=0?null:+PN.querySelector('#insong').value); else if(b.id==='incu')closeUp(!CU.on); else if(b.id==='inoff')INSTR.stop(); else if(ME.K.boardClick&&(b.dataset.kv||b.dataset.kl))ME.K.boardClick(b); else ME.K.click(b,true); b.blur(); }); }
    PN.innerHTML=`<div class="r"><span class="h" id="insk"></span><span id="innow"></span></div>
      <div class="r"><select id="insong" aria-label="song"></select><button id="inplay" title="\`">PLAY</button><button id="incu" title="tab">CLOSE-UP</button><span class="d">VOL</span><input type="range" id="invol" min="0" max="1" step=".05" aria-label="volume"><button id="inoff" title="esc">PUT AWAY</button></div>${ME.K.board?'<div id="inown">'+ME.K.board()+'</div>':''}${ME.K.samples?`<div class="r" style="opacity:.45">SOUND: ${esc(ME.K.samples.credit)}</div>`:''}`;
    for(const el of PN.querySelectorAll('select,input'))el.addEventListener('keydown',e=>e.stopPropagation());
    PN.querySelector('#invol').oninput=e=>GSND.setVol(+e.target.value);
    PN.hidden=false; fillSongs(); drawPanel(); };
  INSTR.fillSongs=()=>fillSongs(); FORAGE.MAXFN.push(()=>fillSongs());
  const fillSongs=()=>{ const el=PN&&PN.querySelector('#insong'); if(!el||!ME.K)return; const v=el.value, K=ME.K;
    el.innerHTML=SONGBK.options(K.skill,K.BOOK)||'<option>THE BOOK IS ON ITS WAY…</option>';
    if(v)el.value=v; };
  const drawPanel=()=>{ if(!PN||PN.hidden||!ME.K)return; const K=ME.K, T=ME.song>=0&&K.BOOK[ME.song];
    PN.querySelector('#insk').textContent=K.skill.toUpperCase()+' '+skill(K).toFixed(1);
    PN.querySelector('#innow').textContent=T?'PLAYING '+T.name.toUpperCase()+(T.credit?' · '+T.credit.split(': ').pop().split(', http')[0]:''):'PICK A PIECE';
    const pl=PN.querySelector('#inplay'); pl.textContent=ME.song>=0?'STOP':'PLAY'; pl.setAttribute('aria-pressed',String(ME.song>=0)); PN.querySelector('#incu').setAttribute('aria-pressed',String(CU.on)); PN.querySelector('#invol').value=GSND.vol;
    if(K.board)K.boardDraw(PN,ME); };
  INSTR.drawPanel=drawPanel;

  /* ---------- the close-up: the view in close on the hands and what they play (TAB) ---------- */
  const CU={on:true}, CV=new V3(), CT=new V3();
  const closeUp=v=>{ CU.on=v; if(v&&!UI.persp)UI.setView('third'); drawPanel(); };
  UI.camKeeps.push((p,T)=>{ if(!on||!CU.on||!ME.H||UI.view==='first')return; const m=ME.H.G.matrixWorld, c=ME.K.cam; CT.set(...c.t).applyMatrix4(m); CV.set(...c.p).applyMatrix4(m); p.copy(CV); T.copy(CT); });
  INSTR.closeUp=closeUp; INSTR.CU=CU;

  /* ---------- the others: their instruments from their word ('ins'), their sound from where they sit ---------- */
  const THEM=new Map(); INSTR.THEM=()=>THEM;
  const KID={p:'piano',d:'drums',h:'harp',v:'violin',f:'flute',t:'trumpet'};
  ONLINE.mine.ins=()=>on&&ME.K?ME.K.id[0]+(ME.song>=0?'s':'')+(ME.place?'k':''):null;
  const them=(id,kid)=>{ const K=INSTR.KINDS[kid]; if(!K)return null; let P=THEM.get(id); if(P&&P.K!==K){ unhold(P); P=null; } if(!P){ P=mk(id,K); THEM.set(id,P); } return P; };
  ONLINE.hear.ins=m=>{ if(!m.id||!INSTR.KINDS[m.i])return; const P=them(m.id,m.i); if(!P)return; const k=m.k, v=String(m.v||'');
    if(k==='off'){ unhold(P); THEM.delete(m.id); return; } if(k==='on')return;
    if(k==='song'&&parseInt(v)>=0){ const K=P.K, i=parseInt(v), f=+v.split(':')[1]||0; (K.BOOK[i]?Promise.resolve():K.loadBook?K.loadBook():Promise.resolve()).then(()=>{ if(K.BOOK[i])songGo(P,i,f); }); }
    else if(k==='stop')songStop(P);
    else if(k==='b'&&P.K.hear)for(const it of v.split(',').slice(0,12))if(it)P.K.hear(P,it[0],it.slice(1)); };

  /* ---------- each frame: you at yours, the songs' notes, the others at theirs, every instrument's moving parts ---------- */
  let last=now();
  SYS.add('dress',()=>{ const t=now(), dt=Math.min(.1,t-last); last=t;
    if(on){ if(ME.place?ME.place.live&&!ME.place.live():!FORAGE.has(ME.K.id)){ INSTR.stop(); return; } if(st.water&&st.water.in||st.ride){ INSTR.stop(); return; }
      SHARED.target=null; const me=myMesh(), body=BODIES.by[BODIES.pick()]; hold(ME,me,me&&me.userData.PM,body); if(ME.H)ME.H.G.visible=!ME.place; songTick(ME); if(ME.V)GSND.place(ME.V,pos.x,pos.z); if(ME.H)ME.K.anim(ME,ME.H,time(ME),dt); }
    for(const [id,P] of THEM){ const o=ONLINE.others.get(id); if(!o||!o.x||!o.x.ins||KID[o.x.ins[0]]!==P.K.id){ unhold(P); THEM.delete(id); continue; }
      const F_=o.fig; if(F_&&F_.body&&F_.g.visible){ hold(P,F_.me,F_.PM,F_.body); o.wantPose=true; if(P.H)P.H.G.visible=!o.x.ins.includes('k',1); } else if(P.H){ INSTR.detach(P.H); P.H=null; }
      songTick(P); if(P.V&&o.p)GSND.place(P.V,o.p.x,o.p.z); if(P.H)P.K.anim(P,P.H,time(P),dt); }
    // someone already playing when you came: their instrument, quiet till they play
    for(const o of ONLINE.others.values())if(o.id&&o.x&&o.x.ins&&!THEM.has(o.id)&&KID[o.x.ins[0]])them(o.id,KID[o.x.ins[0]]); },'146zp-instruments');

  /* ---------- shared bits the instruments build with ---------- */
  const lam=c=>new THREE.MeshLambertMaterial({color:c});
  INSTR.mat=lam; INSTR.box=(w,h,d,c,x=0,y=0,z=0)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?lam(c):c); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; return m; };
  INSTR.cyl=(r0,r1,h,c,seg=16,x=0,y=0,z=0,open=false)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,h,seg,1,open),typeof c==='number'?lam(c):c); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; return m; };
  INSTR.sm=u=>{ u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u); };
  // Polyfork's models of them (150cyb, fetched after the start): dress(mesh maker) now if they have come, else when they come; dress hides the first shapes and fits the model
  const PFQ=[]; INSTR.PF=null;
  INSTR.pf=f=>{ if(INSTR.PF)f(INSTR.PF.mesh); else PFQ.push(f); };
  INSTR.pfReady=P=>{ INSTR.PF=P; for(const f of PFQ.splice(0))try{ f(P.mesh); }catch(e){ console.warn('instrument model',e); } };
  // a model fitted: turned by ry about the up axis, scaled (a number or [x,y,z]), set at [x,y,z]
  INSTR.fit=(m,ry,s,at)=>{ if(!m)return m; m.rotation.y=ry; if(Array.isArray(s))m.scale.set(...s); else m.scale.setScalar(s); m.position.set(...at); return m; };
  // a stool, its seat's top at y (Polyfork's lab stool once it comes)
  INSTR.stool=(g,y,z=0)=>{ const o=new THREE.Group(); o.add(INSTR.cyl(.17,.17,.06,0x1a1414,18,0,y-.03,z)); for(const a of [.5,2.6,-1.6])o.add(INSTR.cyl(.012,.012,y-.06,0x1a1414,6,Math.sin(a)*.12,(y-.06)/2,z+Math.cos(a)*.12)); g.add(o);
    INSTR.pf(mk=>{ const m=mk('stool'); if(!m)return; o.visible=false; g.add(INSTR.fit(m,0,y/INSTR.bb(m).max.y,[0,0,z])); }); };
  INSTR.bb=m=>{ const G=m.geometry; if(!G.boundingBox)G.computeBoundingBox(); return G.boundingBox; };
  INSTR.FIST=[[.6,.7,.5,0],[1.45,1.7,1.05,-.18],[1.5,1.7,1.05,-.06],[1.55,1.7,1.05,.08],[1.6,1.7,1.05,.22]];
  // the bodega's shelf: each one as a small model of itself on the bottom row of the right wall
  INSTR.shelf=(id,mk,sc)=>{ if(!BODEGA.MAKE)return; BODEGA.MAKE[id]=()=>{ const g=new THREE.Group(), m=mk(); m.scale.setScalar(sc); g.add(m); return g; }; const row=BODEGA.LAYOUT.find(r=>r[0]==='wr1'&&r[1]===0); if(row)row[2].push(id); else BODEGA.LAYOUT.push(['wr1',0,[id]]); };
  // a song book loaded the first time someone near plays (data/<id>-songs.json): each piece its notes compiled by the kind
  INSTR.lazyBook=(K,load)=>{ let p=null; K.loadBook=()=>p||(p=load().then(J=>{ for(const g of J.songs)K.BOOK.push(g); fillSongs(); }).catch(e=>{ p=null; console.warn(K.id+' songs',e); })); }; }
