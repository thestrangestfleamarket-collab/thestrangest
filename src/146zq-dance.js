// THE DANCES (owner, 9 Nov 2026: "Dances CMU motion-capture library"; 10 Nov 2026: "do 1-8"): DANCE, the DANCE skill's book of fifty dances (the emotes' own dances the easy bands, then CMU's recordings by how hard, data/dances.json), danced from the book (EMOTES > DANCE BOOK) by SONGBK's rule: a pass dances it clean, a fail breaks off in a wobble, others see both; tips from townsfolk watching.
import {SHARED} from './003-shx.js';
import {FORAGE, MOTION, RAG, st, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS} from './006-map-pre.js';
import {SONGBK} from './146znz-songbook.js';
const DANCE={}; window.DANCE=DANCE;
{ const DATA=__LAZY__("data/dances.json"), now=()=>performance.now()/1000, SECS=12, WOBBLE='dizzy';
  SONGBK.words.dance={done:'DANCED',piece:'DANCE',stumble:n=>`YOU STUMBLE OUT OF ${n}. TRY IT AGAIN.`,crowd:'WATCHED'};
  // the book: the emotes' dances first (by how hard), then CMU's; each band of ten levels five dances
  const BOOK=[['Bop','pf_Bop'],['Swing','pf_Swing'],['Arm Pump','armPump'],['Twist','pf_Twist'],['Dance','dance'],['Hip Hop','pf_HipHop'],['Body Roll','bodyRoll'],['Hip Reach','hipReach'],
    ['Charleston','charleston'],['Moonwalk','moonwalk'],['Thriller','pf_Thriller']].map(([name,m])=>({name,m,secs:SECS}));
  const lay=()=>BOOK.forEach((T,i)=>{ T.lvl=Math.floor(i/5)*10+1+(i%5)*2; }); lay();
  // a recording's keys packed flat (tools/dances-bake.cjs): a key a 1/kf s, [hipsY, yaw, roll, pitch, side, bend, cyaw, nod, each side ua ua fa fa foot, 1 ik ik ik kp kp kp | 0 th th sh sh]
  const unpack=(k,kf)=>{ const keys=[]; let i=0; const N=n=>k.slice(i,i+=n);
    while(i<k.length){ const [y,yaw,roll,pitch,side,bend,cyaw,nod]=N(8), c={root:[0,y,0],yaw,roll,pitch,side,bend,cyaw,nod};
      for(const s of 'LR'){ const [a,b,f0,f1,foot,ik]=N(6), g={ua:[a,b],fa:[f0,f1],foot}; if(ik){ const q=N(6); g.ik=q.slice(0,3); g.kp={x:q[3],y:q[4],z:q[5]}; } else { const q=N(4); g.th=q.slice(0,2); g.sh=q.slice(2); } c[s]=g; }
      keys.push([+(keys.length/kf).toFixed(3),c,'lin']); }
    return keys; };
  let loadP=null; DANCE.credit='';
  const load=()=>loadP||(loadP=DATA().then(J=>{ DANCE.credit=J.src; for(const d of J.dances){ const n='dn_'+d.id; if(BOOK.some(T=>T.m===n))continue; const keys=unpack(d.k,J.kf);
      MOTION.add(n,{keys,loop:true,dur:keys[keys.length-1][0]}); BOOK.push({name:d.name,m:n,secs:SECS,credit:'CMU '+d.id}); } lay(); PN.fill(); }).catch(e=>{ loadP=null; console.warn('dances',e); }));
  MOTION.packs.push({pre:'dn_',load});
  /* ---------- a try: the dance looped for its length, or broken off where the roll says, into a wobble ---------- */
  let cur=null;
  const can=()=>!SHARED.drive&&!RAG.on&&!VIT.dead&&!st.sit&&!st.ride&&!st.climb&&!st.hang&&!(st.water&&st.water.in);
  DANCE.go=async(i,force)=>{ const T=BOOK[i]; if(!T)return false;
    if(!SONGBK.can('dance',BOOK,T)){ SAY(`${T.name.toUpperCase()} IS NOT OPEN TO YOU YET (DANCE ${T.lvl}; YOURS IS ${(FORAGE.sk('dance')||0).toFixed(1)}). LEARN THE DANCES YOU HAVE.`,'#c8a090'); return false; }
    if(!can()){ SAY('NOT HERE: STAND SOMEWHERE STEADY TO DANCE.','#c8a090'); return false; }
    if(T.m.startsWith('dn_'))await load(); const r=force||SONGBK.start('dance',T), C={T,t0:now(),fail:r.ok?0:+(T.secs*r.at).toFixed(2),on:false}; cur=C; PN.draw();
    await MOTION.ensure(); C.t0=now(); const ok=await MOTION.play(T.m,{loop:true,while:()=>cur===C&&now()<C.t0+(C.fail||T.secs)}); if(cur!==C)return true; if(!ok){ cur=null; PN.draw(); return false; } C.t0=now(); C.on=true; return true; };
  DANCE.stop=()=>{ if(!cur)return; cur=null; MOTION.stop(); PN.draw(); };
  SYS.add('life',()=>{ const C=cur; if(!C||!C.on)return; const t=now()-C.t0, T=C.T;
    if(C.fail&&t>=C.fail){ cur=null; const until=now()+1.8; MOTION.play(WOBBLE,{loop:true,while:()=>now()<until}); SONGBK.done('dance',T,false,C.fail/T.secs); PN.fill(); return; }
    if(!C.fail&&t>=T.secs){ cur=null; SONGBK.done('dance',T,true); SONGBK.busk('dance',T); PN.fill(); return; }
    if(MOTION.cur!==T.m){ cur=null; SAY('YOU STOP DANCING.'); PN.draw(); } },'146zq-dance');
  /* ---------- the book's panel, opened from the emotes' DANCE row ---------- */
  const PN=SONGBK.panel({id:'dnp',title:'DANCE',skill:'dance',book:()=>BOOK,goWord:'DANCE',go:i=>DANCE.go(i),stop:()=>DANCE.stop(),busy:()=>!!cur,off:()=>DANCE.close(),
    now:()=>cur?'DANCING '+cur.T.name.toUpperCase()+(cur.T.credit?' · '+cur.T.credit:''):''});
  DANCE.open=()=>{ PN.show(true); load(); }; DANCE.close=()=>{ DANCE.stop(); PN.show(false); };
  MOTION.more('DANCE','DANCE BOOK',()=>DANCE.open());
  Object.assign(DANCE,{BOOK,load,PN,unpack,cur:()=>cur}); }
