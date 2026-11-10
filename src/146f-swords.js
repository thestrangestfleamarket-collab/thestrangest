// THE SWORDPLAY: FIGHT guards every blow you take while a sword is up (P held: a block halves it, a block on the beat parries it and staggers them).
import {SHARED} from './003-shx.js';
import {FORAGE, MOTION, pos, SFX, VIT, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
const FIGHT={PARRY:.28,parries:0,blocks:0}; window.FIGHT=FIGHT;
{ const say=(t,c)=>SAY(t,c);
  const front=from=>{ if(!from||from.x==null)return false; const dx=from.x-pos.x, dz=from.z-pos.z, l=Math.hypot(dx,dz)||1; return (dx*Math.sin(SHARED.heading)+dz*Math.cos(SHARED.heading))/l>.2; };
  const onBeat=()=>performance.now()-WIELD.blockT<FIGHT.PARRY*1000;
  VIT.guard=(d,from)=>{ '@later'; if(MOTION.dodging())return {d:0}; if(!WIELD.block||!front(from))return {d};
    if(WIELD.bare){ FIGHT.blocks++; VIT.sta=Math.max(0,VIT.sta-.06); SFX.play('block',{vol:.6,vary:.1}); return {d:d*(.6-Math.min(.2,(FORAGE.sk('fight')||0)/500))}; }   // bare hands soften a blow; MARTIAL ARTS softens it more
    if(onBeat()){ FIGHT.parries++; VIT.sta=Math.min(1,VIT.sta+.1); SFX.play('clash',{vol:.7,vary:.08}); say('PARRIED. THEY STAGGER.','#7dffa4'); FORAGE.use('sword',0,80); return {d:0,parry:true}; }
    FIGHT.blocks++; VIT.sta=Math.max(0,VIT.sta-.08); SFX.play('clunk',{vol:.5,pitch:1.6}); return {d:d*(.5-Math.min(.3,(FORAGE.sk('sword')||0)/1000))}; };
  FORAGE.HELP.push('SWORDSMANSHIP: a blade from the swordsmith (wood, iron, steel, enchanted: each hits harder). Swings chain, the third is heavy; each costs stamina. Hold P to block; a block on the beat parries and staggers them. Blows that land and parries teach it.');
  window.FIGHTDBG=()=>({block:WIELD.block,sword:WIELD.sword,on:WIELD.on,parries:FIGHT.parries,blocks:FIGHT.blocks,sk:FORAGE.sk('sword')}); }
