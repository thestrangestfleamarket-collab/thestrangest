// THE VITALS: VIT keeps the player's health, stamina and breath and shows their bars; every blow goes through VIT.hurt (and the guard the swords set on it).
import {SHARED} from './003-shx.js';
import {FORAGE, keys, LOOKS, pos, SFX, st, UI, VIT} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
const AIR=16, AIRCEIL=240;                       // seconds: a plain breath, and the most air you can bank from mushrooms
Object.assign(VIT,{hp:1,sta:1,out:0,fainted:false,tired:false,fight:0,dead:false,def:0,air:AIR,airMax:AIR});
VIT.inFight=t=>{ VIT.fight=Math.max(VIT.fight,t||5); };
VIT.breathe=s=>{ VIT.air=Math.min(AIRCEIL,VIT.air+(+s||0)); };   // a breathing mushroom adds air for the next dive
{ const css=document.createElement('style'); css.textContent=`#vit{position:fixed;left:12px;bottom:12px;width:150px;display:grid;gap:4px;z-index:5;pointer-events:none}
    #vit[hidden]{display:none} #vit div{height:7px;background:#0b0d13cc;border:1px solid #2a3040} #vit i{display:block;height:100%} #vit #vairrow{position:relative} #vit #vairn{position:absolute;right:2px;top:-11px;font:9px Silkscreen,monospace;color:#8fd0ff;text-shadow:1px 1px 0 #000}`; document.head.appendChild(css);
  const B=document.createElement('div'); B.id='vit'; B.hidden=true; B.innerHTML='<div><i id="vhp" style="background:#c84a3a"></i></div><div><i id="vst" style="background:#d8b84a"></i></div><div id="vairrow"><i id="vair" style="background:#4aa6e0"></i><span id="vairn"></span></div>'; document.body.appendChild(B);
  const hpI=B.querySelector('#vhp'), stI=B.querySelector('#vst'), airRow=B.querySelector('#vairrow'), airI=B.querySelector('#vair'), airN=B.querySelector('#vairn'); let lx=pos.x, lz=pos.z, rest=0, glug=0;
  VIT.guard=null;   // set by the swordplay: (d, from) -> {d: what gets through, parry}
  // at none you faint (out cold, the medic comes, up again with some back); a real blow while out cold kills
  let thudAt=0; const FAINT=15;
  VIT.faint=()=>{ if(VIT.dead||VIT.out>0)return; VIT.hp=0; VIT.out=FAINT; VIT.fainted=true; SHARED.trip=true; if(FORAGE.say)FORAGE.say('YOU FAINT'); };
  VIT.hurt=(d,from)=>{ if(VIT.dead)return 0; if(VIT.out>0){ if(VIT.fainted&&d>=.03)VIT.die(); return 0; }
    let parry=false; if(VIT.guard&&from){ const g=VIT.guard(d,from); d=g.d; parry=!!g.parry; }
    if(d>0){ const now=performance.now(); if(now-thudAt>250){ thudAt=now; SFX.play('thud',{vol:.7,vary:.2}); } VIT.hp=Math.max(0,VIT.hp-d*(1-Math.max(0,Math.min(.9,VIT.def||0)))); } VIT.inFight(5); if(VIT.hp<=0)VIT.faint(); else if(d>0&&!parry)SYS.run('hurt',d,from); return parry?2:1; };
  VIT.spend=x=>{ VIT.sta=Math.max(0,VIT.sta-x); rest=0; };   // effort: stamina comes back only after a rest
  VIT.tick=dt=>{ if(VIT.sta<=0)VIT.tired=true; else if(VIT.tired&&VIT.sta>=1/3){ VIT.tired=false; if(keys.has('shift'))st.runTarget=1; }   // empty: no running till a third is back
    if(VIT.tired)st.runTarget=0;
    const sp=Math.hypot(pos.x-lx,pos.z-lz)/Math.max(dt,1e-3); lx=pos.x; lz=pos.z; const running=st.run>.55&&sp>.6*TILE&&!UI.fly&&!UI.freeCam;
    if(running){ VIT.sta=Math.max(0,VIT.sta-dt/12); rest=0; } else if((rest+=dt)>.8)VIT.sta=Math.min(1,VIT.sta+dt/7);
    const W=st.water, under=!!(W&&W.in&&W.level!=null&&W.y<W.level-34);     // fully under, by the river's own measure
    if(under&&!(VIT.supply&&VIT.supply(dt))){ VIT.air=Math.max(0,VIT.air-dt);
      if(VIT.air<=0&&!VIT.dead){ VIT.hp=Math.max(0,VIT.hp-dt/18); if((glug-=dt)<=0){ SFX.play('thud',{vol:.4,pitch:.6,vary:.2}); glug=1; } if(VIT.hp<=0)VIT.die(); } }
    else if(!under){ if(VIT.air<VIT.airMax)VIT.air=Math.min(VIT.airMax,VIT.air+dt*VIT.airMax/2.5); glug=0; }   // a plain breath comes back at the surface; banked air stays
    if(VIT.out>0){ VIT.out-=dt; keys.clear(); SHARED.target=null; if(VIT.out<=0){ VIT.fainted=false; if(!VIT.dead)VIT.hp=Math.max(VIT.hp,.4); } } else if(!VIT.dead){ let k=0; for(const f of VIT.mends)k+=f()||0; if(k>0)VIT.hp=Math.min(1,VIT.hp+dt*k); }   // health never comes back by itself: food, potions, rest, the bath
    VIT.fight=Math.max(0,VIT.fight-dt);
    const wet=!!(st.water&&st.water.in)||VIT.air<VIT.airMax-.05, show=VIT.fight>0||VIT.out>0||wet; if(B.hidden===show)B.hidden=!show;
    if(show){ hpI.style.width=(VIT.hp*100).toFixed(0)+'%'; stI.style.width=(VIT.sta*100).toFixed(0)+'%';
      airRow.style.display=wet?'':'none'; if(wet){ airI.style.width=(VIT.air/Math.max(VIT.airMax,VIT.air)*100).toFixed(0)+'%'; airI.style.background=VIT.air<=0?'#c84a3a':'#4aa6e0'; airN.textContent=Math.ceil(VIT.air)+'s'+(VIT.tankTxt?VIT.tankTxt():''); } }
    LOOKS.stats(VIT.hp,VIT.sta); };
}
