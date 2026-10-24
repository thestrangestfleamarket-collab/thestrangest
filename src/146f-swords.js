// THE SWORDPLAY: FIGHT guards every blow you take while a sword is up (P held: a block halves it, a block on the beat parries it and staggers them) and runs the knight's duel in the holodeck.
import {SHARED} from './003-shx.js';
import {FORAGE, pos, SFX, VIT, WIELD} from './003b-systems.js';
import {STORE, TILE} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
const FIGHT={PARRY:.28,parries:0,blocks:0}; window.FIGHT=FIGHT;
{ const T=TILE, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c);
  const front=from=>{ if(!from||from.x==null)return false; const dx=from.x-pos.x, dz=from.z-pos.z, l=Math.hypot(dx,dz)||1; return (dx*Math.sin(SHARED.heading)+dz*Math.cos(SHARED.heading))/l>.2; };
  const onBeat=()=>performance.now()-WIELD.blockT<FIGHT.PARRY*1000;
  VIT.guard=(d,from)=>{ if(!WIELD.block||!front(from))return {d};
    if(onBeat()){ FIGHT.parries++; VIT.sta=Math.min(1,VIT.sta+.1); SFX.play('clunk',{vol:.6,pitch:2.2}); say('PARRIED. THEY STAGGER.','#7dffa4'); FORAGE.use('sword',0,80); return {d:0,parry:true}; }
    FIGHT.blocks++; VIT.sta=Math.max(0,VIT.sta-.08); SFX.play('clunk',{vol:.5,pitch:1.6}); return {d:d*(.5-Math.min(.3,(FORAGE.sk('sword')||0)/1000))}; };
  const H=STORE.holo; if(H){ const near=D=>Math.hypot(pos.x-D.x,pos.z-D.z)<2.6*T;
    H.programs.push({name:'THE DUEL',skill:'sword',tool:'sword',cost:15,intro:'THE DUEL. THE KNIGHT COMES AT YOU: HOLD P TO BLOCK AS HE SWINGS (ON THE BEAT, HE STAGGERS), STRIKE WHILE HE IS OPEN. NO BLOOD IN HERE.',
      place:(x,z,hd,G)=>BODIES.place('knight',x,z,hd,G),hide:()=>BODIES.hide('knight'),
      run:(D,dt)=>{ D.t-=dt; if(D.t>0)return;
        if(D.ph==='wind'){ D.ph='open'; D.t=1.2; D.n++; if(!near(D)){ say('STEP IN. HE WAITS.','#c8a090'); return; }
          const bk=WIELD.block&&front(D), pr=bk&&onBeat();
          if(pr){ D.good+=2; D.t=1.8; SFX.play('clunk',{vol:.6,pitch:2.2}); say('A PERFECT PARRY: HE STAGGERS. STRIKE!','#7dffa4'); FORAGE.use('sword',0,100); }
          else if(bk){ D.good++; SFX.play('clunk',{vol:.5,pitch:1.6}); say('BLOCKED. CATCH IT ON THE BEAT TO STAGGER HIM.','#7dffa4'); }
          else say('HIS BLADE FINDS YOU. ONLY LIGHT, IN HERE.','#c8a090'); return; }
        if(D.n>=6){ say('THE DUEL IS DONE: '+D.good+' OF 18.','#7dffa4'); if(D.good)FORAGE.train('sword',800,0,Math.min(18,D.good)*2); H.run=null; return; }
        D.ph='wind'; D.t=.75; say('THE KNIGHT WINDS UP…','#5dff8f'); },
      strike:D=>{ if(D.ph!=='open'||!near(D))return; D.ph='hit'; D.good++; say('A HIT ON THE KNIGHT.','#7dffa4'); FORAGE.use('sword',0,100); } }); }
  FORAGE.HELP.push('SWORDSMANSHIP: a blade from the swordsmith (wood, iron, steel, enchanted: each hits harder). Swings chain, the third is heavy; each costs stamina. Hold P to block; a block on the beat parries and staggers them. Blows that land, parries and the duel in the holodeck teach it.');
  window.FIGHTDBG=()=>({block:WIELD.block,sword:WIELD.sword,on:WIELD.on,parries:FIGHT.parries,blocks:FIGHT.blocks,sk:FORAGE.sk('sword')}); }
