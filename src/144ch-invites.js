// THE INVITATIONS: INVITES asks a player online in any section to do something with you (a kind is registered in INVITES.kinds by its own file: the café's board games first); they get a card (ACCEPT / NO THANKS), a line in the log, and the place marked on the MAP and the minimap for ten minutes.
import {INVITES, MARKS, ONLINE, SFX, TEXT, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SECTIONS, SYS} from './006-map-pre.js';
{ const LIFE=600000, say=(t,c='#9fe0ff')=>SAY(t,c), sec=r=>(SECTIONS.list.find(b=>'s-'+String(b.id).toLowerCase().replace(/[^a-z0-9-]/g,'')===r)||{}).id;
  const P=[];   // the invitations waiting for your answer: {from,name,sec,k,d,at,el,mark}
  let ALL=[], allAt=0;
  INVITES.send=(to,name,k,d)=>{ if(!(ONLINE.on&&ONLINE.send)){ say('YOU ARE NOT ONLINE.'); return false; } ONLINE.send({t:'inv',to,k,d}); const K=INVITES.kinds[k]; say('YOU INVITED '+(name||'A PLAYER')+(K?' '+K.what(d):'')+'.'); return true; };
  // who you can invite: everyone online in every section (asked of the server, kept a few seconds), else the players here
  INVITES.everyone=()=>{ if(ONLINE.on&&ONLINE.send&&performance.now()-allAt>4000){ allAt=performance.now(); ONLINE.send({t:'everyone'}); }
    const by=new Map(ALL.map(p=>[p.id,p])); for(const o of (ONLINE.others?ONLINE.others.values():[]))if(o.name&&!by.has(o.id))by.set(o.id,{id:o.id,name:o.name,sec:ONLINE.room});
    return [...by.values()].sort((a,b)=>a.name.localeCompare(b.name)); };
  ONLINE.hear.everyone=m=>{ ALL=(Array.isArray(m.all)?m.all:[]).filter(p=>p&&p.id&&p.name&&p.id!==ONLINE.me); };
  const css=()=>{ if(document.getElementById('invcss'))return; const s=document.createElement('style'); s.id='invcss';
    s.textContent=`#invs{position:fixed;top:calc(64px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);z-index:41;display:flex;flex-direction:column;gap:8px;width:min(420px,calc(100vw - 32px))}
      .inv{background:#0b130fe8;border:2px solid #7dffa8;color:#d8ffe4;font:12px/1.5 Silkscreen,monospace;letter-spacing:1px;padding:10px 12px;box-shadow:4px 4px 0 #0008}
      .inv b{color:#7dffa8;font-weight:normal} .inv .r{display:flex;gap:8px;margin-top:8px} .inv button{font:inherit;cursor:pointer;padding:4px 10px;border:2px solid #7dffa8;background:#0b130f;color:#7dffa8} .inv button.y{background:#7dffa8;color:#0b130f}`;
    document.head.appendChild(s); };
  const box=()=>{ let b=document.getElementById('invs'); if(!b){ css(); b=document.createElement('div'); b.id='invs'; b.setAttribute('aria-live','polite'); document.body.appendChild(b); } return b; };
  const drop=v=>{ const i=P.indexOf(v); if(i>=0)P.splice(i,1); if(v.el)v.el.remove(); const j=MARKS.indexOf(v.mark); if(j>=0)MARKS.splice(j,1); };
  const answer=(v,yes)=>{ drop(v); if(ONLINE.send)ONLINE.send({t:'invr',to:v.from,op:yes?'yes':'no',k:v.k}); if(yes)INVITES.go(v); };
  // accepting: go there (in another section the page goes to that section first, and goes on from there when it starts)
  INVITES.go=v=>{ const K=INVITES.kinds[v.k]; if(!K)return; const s=sec(v.sec);
    if(v.sec&&v.sec!==ONLINE.room&&s&&UI.goSection){ try{ sessionStorage.setItem('market-inv',JSON.stringify({k:v.k,d:v.d,sec:v.sec,name:v.name,at:Date.now()})); }catch(e){} UI.goSection(s); return; }
    K.go(v.d,v); };
  SYS.onStart(()=>{ let v=null; try{ v=JSON.parse(sessionStorage.getItem('market-inv')||'null'); sessionStorage.removeItem('market-inv'); }catch(e){} if(!v||Date.now()-v.at>LIFE||!INVITES.kinds[v.k])return;
    setTimeout(()=>INVITES.kinds[v.k].go(v.d,v),1500); },'144ch-invites');
  ONLINE.hear.inv=m=>{ const K=INVITES.kinds[m.k], nm=String(m.name||'A PLAYER');
    if(m.op==='gone'){ say('THEY ARE NOT ONLINE NOW.'); return; }
    if(m.op==='yes'){ say(nm+' ACCEPTED YOUR INVITATION. THEY ARE ON THEIR WAY.','#7dffa8'); return; }
    if(m.op==='no'){ say(nm+' SAID NO THANKS.'); return; }
    if(m.op!=='ask'||!K||!m.from)return;
    for(const o of P.filter(o=>o.from===m.from&&o.k===m.k))drop(o);
    const what=K.what(m.d||{}), far=m.sec&&m.sec!==ONLINE.room?' (SECTION '+(sec(m.sec)||'?')+')':'', v={from:m.from,name:nm,sec:m.sec,k:m.k,d:m.d||{},at:Date.now()};
    const w=K.where&&!far?K.where(v.d):null; if(w){ v.mark={x:w.x,z:w.z,name:w.name,until:v.at+LIFE}; MARKS.push(v.mark); }
    const el=v.el=document.createElement('div'); el.className='inv'; el.setAttribute('role','alertdialog'); el.setAttribute('aria-label','An invitation');
    el.innerHTML=`<div><b>${TEXT.esc(nm)}</b> INVITES YOU ${TEXT.esc(what)}${TEXT.esc(far)}.</div><div class="r"><button class="y">ACCEPT</button><button class="n">NO THANKS</button></div>`;
    el.querySelector('.y').onclick=()=>answer(v,true); el.querySelector('.n').onclick=()=>answer(v,false);
    P.push(v); box().appendChild(el); say(nm+' INVITES YOU '+what+far+(w?'. IT IS MARKED ON YOUR MAP.':'.'),'#7dffa8'); if(SFX&&SFX.play)try{ SFX.play('ding'); }catch(e){} };
  SYS.every(()=>{ const now=Date.now(); for(const v of P.slice())if(now-v.at>LIFE)drop(v); for(let i=MARKS.length-1;i>=0;i--)if(MARKS[i].until<now)MARKS.splice(i,1); },5000,'144ch-invites');
  INVITES.waiting=()=>P.map(v=>({from:v.from,name:v.name,k:v.k,d:v.d,sec:v.sec,marked:!!v.mark}));
  INVITES.answer=(i,yes)=>{ const v=P[i]; if(v)answer(v,yes); }; INVITES.marks=()=>MARKS.slice(); window.INVITES=INVITES;
}
