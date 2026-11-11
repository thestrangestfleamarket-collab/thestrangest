// THE TRAINERS: TRAINERS gives each skill's teacher a ladder of asks (data/trainers.json): each rung asks for something rarer or further off, names the place, and pays two to five times its worth when you hand it in at the shop; the rung you have reached is your rank with that trainer (NOVICE to MASTER), the super-rare shows from EXPERT (RARITY), a master's title shows over your head to others (ONLINE); the JOURNAL lists every trainer's ask.
import {SHARED} from './003-shx.js';
import {BIRDS, FORAGE, INV, ITEMS, ONLINE, SFX, TRAINERS, UI, WORTH} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {QS} from './006-map-pre.js';
import {GEMS} from './101-gems.js';
import {PHOTOS} from './146m-prints.js';
import {ASL} from './146zs-signs.js';
import {QUESTS} from './160a-quests.js';
{ const D=__DATA__("data/trainers.json")||{ranks:[],open:3,titles:{},trainers:{},ladders:{}}, KEY='trainers', {BF_KINDS}=SHARED.BOD.STOREK.bf; let S={v:1,rung:{}}; try{ const o=JSON.parse(OWNED.get(KEY)||'null'); if(o&&o.v===1)S=Object.assign(S,o); }catch(e){} if(QS.get('fresh')&&QS.get('keepinv')!=='1')S={v:1,rung:{}};
  const save=()=>OWNED.set(KEY,JSON.stringify(S)), TK={c:'common',r:'rare',s:'super'};
  // an ask's item: bf:NAME is that butterfly's item, bird:NAME that bird's, photo:KIND any print whose subject starts so (146mb); the rest are item ids
  const prints=k=>PHOTOS.mine.filter(p=>p.sub&&p.sub.startsWith(k.slice(6))&&INV.items[p.id]>0), PK={'photo:b_':'BUTTERFLIES','photo:bd_':'BIRDS','photo:w_':'PARK CREATURES','photo:d_':'DUNGEON MONSTERS','photo:d_golem':'A ROCK GOLEM'};
  const idOf=spec=>{ if(spec.startsWith('photo:'))return spec; if(spec.startsWith('bf:')){ const i=BF_KINDS.findIndex(b=>b[0]===spec.slice(3)); return i<0?null:'b_'+i; } if(spec.startsWith('bird:')){ const i=(BIRDS.K||[]).findIndex(b=>b[0]===spec.slice(5)); return i<0?null:'bd_'+i; } return spec; };
  const nameOf=id=>{ if(id.startsWith('photo:'))return 'PRINTS OF '+(PK[id]||id.slice(6).toUpperCase()); if(id.startsWith('b_'))return (BF_KINDS[+id.slice(2)]||[id])[0].toUpperCase(); if(id.startsWith('bd_'))return ((BIRDS.K||[])[+id.slice(3)]||[id])[0]; const g=GEMS.find(g=>g[0]===id); return g?g[1]:FORAGE.name(id); };
  const unitOf=id=>{ if(id.startsWith('photo:'))return 10; const g=GEMS.find(g=>g[0]===id); return g?g[2]:+ITEMS.prop(id,'value')||1; };
  const have=id=>id.startsWith('photo:')?prints(id).length:INV.items[id]||0, takeN=(id,n)=>{ if(!id.startsWith('photo:'))return FORAGE.take(id,n); for(const p of prints(id).slice(0,n)){ FORAGE.take(p.id,1); PHOTOS.mine.splice(PHOTOS.mine.indexOf(p),1); } PHOTOS.save(); }, skillName=sk=>(FORAGE.SK.find(s=>s[0]===sk)||[sk,sk.toUpperCase()])[1];
  TRAINERS.rank=sk=>S.rung[sk]||0; TRAINERS.open=sk=>TRAINERS.rank(sk)>=(D.open||3); TRAINERS.rankName=sk=>D.ranks[Math.min(TRAINERS.rank(sk),D.ranks.length-1)]||'NOVICE';
  TRAINERS.ask=sk=>(D.ladders[sk]||[])[TRAINERS.rank(sk)]||null; TRAINERS.ladder=sk=>D.ladders[sk]||[]; TRAINERS.skills=()=>Object.keys(D.ladders); TRAINERS.of=who=>D.trainers[who]||null;
  TRAINERS.isMaster=sk=>TRAINERS.rank(sk)>=TRAINERS.ladder(sk).length&&TRAINERS.ladder(sk).length>0; TRAINERS.title=()=>{ for(const sk of TRAINERS.skills())if(TRAINERS.isMaster(sk)&&D.titles[sk])return D.titles[sk]; return null; };
  TRAINERS.set=(sk,r)=>{ S.rung[sk]=Math.max(0,Math.min(TRAINERS.ladder(sk).length,r|0)); save(); };
  TRAINERS.pay=sk=>{ const a=TRAINERS.ask(sk); if(!a)return 0; const id=idOf(a.item); return id?WORTH.of(id,a.n,unitOf(id)*a.pay):0; };
  const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])), B='style="font:inherit;background:#2a2f3e;color:#e8e2cc;border:1px solid #3a3f4e;padding:2px 6px;cursor:pointer"';
  // the shop's rows: the trainer's ask for each skill it trains, and HAND IN once you carry it
  TRAINERS.rows=who=>{ '@later'; const T=D.trainers[who]; if(!T)return ''; return T.skills.map(sk=>{ const a=TRAINERS.ask(sk), rn=TRAINERS.rankName(sk);
      if(!a)return `<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px" colspan="3">${esc(skillName(sk))} · ${esc(rn)} · THE LADDER IS DONE</td></tr>`;
      const id=idOf(a.item), n=id?have(id):0, pay=TRAINERS.pay(sk);
      return `<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">THE ASK · ${esc(rn)}: BRING ${a.n} ${esc(id?nameOf(id):a.item)} <span style="color:#9b9584">(${esc(a.where)})</span></td><td style="text-align:right;padding:4px 6px;white-space:nowrap">PAYS ${a.pay}× · $${pay}</td><td style="text-align:right;padding:4px 2px;white-space:nowrap">${n>=a.n?`<button ${B} data-ask="${sk}">HAND IN</button>`:`<span style="color:#7d7a70">${n} OF ${a.n}</span>`}</td></tr>`; }).join(''); };
  TRAINERS.hand=sk=>{ '@later'; const a=TRAINERS.ask(sk); if(!a)return false; const id=idOf(a.item); if(!id||have(id)<a.n){ SAY('YOU DO NOT HAVE THEM YET.','#c8a090'); return false; } const pay=TRAINERS.pay(sk), who=Object.keys(D.trainers).find(k=>D.trainers[k].skills.includes(sk)), T=D.trainers[who]||{name:'THE TRAINER'};
    takeN(id,a.n); INV.cash+=pay; S.rung[sk]=TRAINERS.rank(sk)+1; save(); if(FORAGE.S&&FORAGE.S.sk){ FORAGE.S.sk[sk]=Math.min(1000,(FORAGE.S.sk[sk]||0)+100); if(FORAGE.save)FORAGE.save(); }
    const m=TRAINERS.isMaster(sk); SAY(`${T.name} PAYS $${pay} FOR ${a.n} ${nameOf(id)}. ${m?'YOU ARE A '+(D.titles[sk]||'MASTER')+'.':'YOU ARE NOW '+TRAINERS.rankName(sk)+' AT '+skillName(sk)+'.'}`,'#f2c14e'); UI.log(`${T.name}: $${pay} · ${TRAINERS.rankName(sk)}`,'#f2c14e'); if(SFX.play)SFX.play('clunk',{vol:.5}); if(FORAGE.draw)FORAGE.draw(); return true; };
  FORAGE.askRows=TRAINERS.rows; FORAGE.hand=TRAINERS.hand;
  // the journal: one line per trainer
  TRAINERS.journal=()=>'<div style="margin:0 0 4px;color:#9b9584">TRAINERS</div>'+TRAINERS.skills().map(sk=>{ const a=TRAINERS.ask(sk), who=Object.keys(D.trainers).find(k=>D.trainers[k].skills.includes(sk)), T=D.trainers[who]||{name:''}; const id=a&&idOf(a.item);
      if(a&&who&&!ASL.follows(who,true))return `<div style="margin-bottom:4px"><span style="color:#f2c14e">${esc(skillName(sk))}</span> · ${esc(TRAINERS.rankName(sk))} · ${esc(T.name)} signs what they want; you cannot follow it yet (SIGN LANGUAGE)</div>`;
      return `<div style="margin-bottom:4px"><span style="color:#f2c14e">${esc(skillName(sk))}</span> · ${esc(TRAINERS.rankName(sk))}${a?` · ${esc(T.name)} asks for ${a.n} ${esc(id?nameOf(id):a.item)} <span style="color:#9b9584">(${esc(a.where)}; ${id?have(id):0} of ${a.n})</span>`:' · the ladder is done'}</div>`; }).join('')+'<div style="height:6px"></div>';
  if(QUESTS&&QUESTS.sections)QUESTS.sections.push(TRAINERS.journal);
  ONLINE.mine.title=()=>TRAINERS.title();
  window.TRAINERS=TRAINERS; }
