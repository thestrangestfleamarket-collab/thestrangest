// QUESTS: quests as data (data/quests.json): QUESTS watches each quest's steps against what characters remember, what you carry and where you stand, keeps its characters at their stations while it runs, teaches knowledge when it is done and starts the next; the JOURNAL tab in your PACK lists them; TALK replies can start one (do:quest arg:'start id') and test one (quest:id:on, quest:id:done, quest:knows:x); the minimap marks the step you are on.
import {CHARS, FORAGE, INV, NPCS, pos, TALK, TRAINERS, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {QS, SYS, TILE} from './006-map-pre.js';
const QUESTS={};
{ const D=__DATA__("data/quests.json")||{quests:[]}, Q=D.quests||[], KEY='quests'; let S={v:1,on:{},done:{},knows:{},homes:{}}; try{ const o=JSON.parse(OWNED.get(KEY)||'null'); if(o&&o.v===1)S=Object.assign(S,o); }catch(e){} if(QS.get('fresh')&&QS.get('keepinv')!=='1')S={v:1,on:{},done:{},knows:{},homes:{}};
  const save=()=>OWNED.set(KEY,JSON.stringify(S)), byId=id=>Q.find(q=>q.id===id)||null, npc=id=>NPCS.all().find(N=>CHARS.id(N)===id)||null, wx=v=>CHARS.wx?CHARS.wx(v):v*TILE, wz=v=>CHARS.wz?CHARS.wz(v):v*TILE;
  // one test of a condition {flag:'npc flag'} {has:'id n'} {at:{x,z,r}} {knows:'x'}
  const met=c=>{ if(!c)return true; if(c.flag){ const [n,f]=c.flag.split(/\s+/); return !!(TALK.flags&&TALK.flags(n)[f]); } if(c.has){ const [id,n]=c.has.split(/\s+/); return (INV.items[id]||0)>=(+n||1); } if(c.knows)return !!S.knows[c.knows]; if(c.rank){ const [sk,n]=c.rank.split(/\s+/); return (TRAINERS&&TRAINERS.rank?TRAINERS.rank(sk):0)>=(+n||1); } if(c.at)return Math.hypot(pos.x-wx(c.at.x),pos.z-wz(c.at.z))<=(c.at.r||6)*TILE; return false; };
  const stepOf=q=>{ let i=0; for(let k=q.steps.length-1;k>=0;k--)if(met(q.steps[k])){ i=k+1; break; } return i; };   // a later step done counts the ones before it
  const station=(q,on)=>{ for(const s of q.stations||[]){ const N=npc(s.npc); if(!N)continue; if(on){ if(!S.homes[s.npc]&&N.st&&N.st.home)S.homes[s.npc]={...N.st.home}; N.home={id:s.npc,x:wx(s.x),z:wz(s.z),r:0}; } else if(S.homes[s.npc]){ N.home=S.homes[s.npc]; delete S.homes[s.npc]; } } };
  QUESTS.start=id=>{ const q=byId(id); if(!q||S.on[id]||S.done[id])return false; S.on[id]={at:Date.now()}; station(q,true); save(); SAY('QUEST: '+q.title,'#f2c14e'); UI.log('QUEST: '+q.title,'#f2c14e'); return true; };
  QUESTS.drop=id=>{ const q=byId(id); if(!q||!S.on[id])return; delete S.on[id]; station(q,false); save(); };
  const finish=q=>{ delete S.on[q.id]; S.done[q.id]=Date.now(); for(const k of q.teaches||[])S.knows[k]=1; station(q,false); save(); SAY('DONE: '+q.title,'#f2c14e'); UI.log('DONE: '+q.title,'#f2c14e'); if(q.next)QUESTS.start(q.next); };
  QUESTS.tick=()=>{ for(const q of Q){ if(S.done[q.id])continue; if(!S.on[q.id]){ if(q.starts&&met(q.starts))QUESTS.start(q.id); continue; } if(stepOf(q)>=q.steps.length)finish(q); } };
  SYS.every(()=>{ if(SYS.started)QUESTS.tick(); },2000,'160a-quests');
  QUESTS.on=()=>Q.filter(q=>S.on[q.id]); QUESTS.isDone=id=>!!S.done[id]; QUESTS.knows=k=>!!S.knows[k]; QUESTS.step=id=>{ const q=byId(id); return q?stepOf(q):-1; }; QUESTS.list=()=>Q.slice(); QUESTS.save=save;
  // where the step you are on points: its place, or the character it is about
  QUESTS.anchor=()=>{ for(const q of QUESTS.on()){ const s=q.steps[stepOf(q)]; if(!s)continue; if(s.at)return {x:wx(s.at.x),z:wz(s.at.z),name:s.at.name||q.title}; const n=s.flag?s.flag.split(/\s+/)[0]:q.giver, N=n&&npc(n); if(N&&N.g)return {x:N.g.position.x,z:N.g.position.z,name:q.title}; } return null; };
  // TALK: a reply starts or drops one (do:quest arg:'start id'); its conditions read one (quest:id:on, quest:id:done, quest:knows:x); {quest} says what you are on
  TALK.ops.quest=a=>{ const [w,id]=String(a).trim().split(/\s+/); if(w==='start')QUESTS.start(id); else if(w==='drop')QUESTS.drop(id); };
  TALK.tests.quest=a=>{ const [id,w]=String(a).split(':'); if(id==='knows')return !!S.knows[w]; return w==='on'?!!S.on[id]:w==='done'?!!S.done[id]:false; };
  TALK.vars.quest=()=>{ const q=QUESTS.on()[0]; return q?q.title+': '+(q.steps[stepOf(q)]||{}).text:'NOTHING'; };
  // the JOURNAL in your PACK
  const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  QUESTS.sections=[];   // other systems put their own part in the journal (the trainers' rungs)
  FORAGE.TABS.push({id:'journal',draw:()=>{ '@later'; const head=QUESTS.sections.map(f=>f()).join(''); const on=QUESTS.on(), done=Q.filter(q=>S.done[q.id]); if(!on.length&&!done.length)return head+'<div class="dim">NOTHING ELSE IN YOUR JOURNAL YET. TALK TO PEOPLE.</div>';
    return head+'<div style="margin:4px 0;color:#9b9584">QUESTS</div>'+
    (()=>on.map(q=>{ const i=stepOf(q); return `<div style="margin-bottom:8px"><div style="color:#f2c14e">${esc(q.title)}</div>`+q.steps.map((s,k)=>`<div style="padding-left:8px;${k<i?'opacity:.5;text-decoration:line-through':k===i?'':'opacity:.35'}">${k<i?'✓':'·'} ${esc(s.text)}</div>`).join('')+'</div>'; }).join('')
      +(done.length?'<div class="dim" style="margin-top:6px">DONE: '+done.map(q=>esc(q.title)).join(', ')+'</div>':''))(); }});
  window.QUESTS=QUESTS; }
export {QUESTS};
