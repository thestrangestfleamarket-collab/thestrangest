// ---- HEALTH AND STAMINA (owner, 17 Oct 2026: "lets give all players and npcs and sentient life hit points, stamina - if they run out of hp they
// faint, out of stamina and they cant run"): yours here; every character's on it (N.hp, N.sta: makeNPC, npc-map.js; the skeletons' use of
// them, npc-skel.js). Running spends stamina (a dozen seconds of it), standing or walking gets it back; at none you can't run till it's a
// third back. A blow costs health (VIT.hurt); at none you faint: down as a body falls, a few seconds on the ground, up again with some back.
// Health comes back slowly. Two small bars at the bottom left while either isn't full (the screen otherwise the game's alone) ----
const VIT={hp:1,sta:1,out:0,tired:false};
{ const css=document.createElement('style'); css.textContent=`#vit{position:fixed;left:12px;bottom:12px;width:150px;display:grid;gap:4px;z-index:5;pointer-events:none}
    #vit div{height:7px;background:#0b0d13cc;border:1px solid #2a3040} #vit i{display:block;height:100%}`; document.head.appendChild(css);
  const B=document.createElement('div'); B.id='vit'; B.hidden=true; B.innerHTML='<div><i id="vhp" style="background:#c84a3a"></i></div><div><i id="vst" style="background:#d8b84a"></i></div>'; document.body.appendChild(B);
  const hpI=B.querySelector('#vhp'), stI=B.querySelector('#vst'); let lx=pos.x, lz=pos.z, seen=0, rest=0;
  VIT.hurt=(d)=>{ if(VIT.out>0)return; VIT.hp=Math.max(0,VIT.hp-d); seen=3; if(VIT.hp<=0){ VIT.out=5.5; trip=true; } };
  VIT.tick=dt=>{ const sp=Math.hypot(pos.x-lx,pos.z-lz)/Math.max(dt,1e-3); lx=pos.x; lz=pos.z; const running=st.run>.55&&sp>.6*TILE&&!UI.fly&&!UI.freeCam;
    if(running){ VIT.sta=Math.max(0,VIT.sta-dt/12); rest=0; } else if((rest+=dt)>.8)VIT.sta=Math.min(1,VIT.sta+dt/7);
    if(VIT.sta<=0)VIT.tired=true; if(VIT.tired&&VIT.sta>.33)VIT.tired=false; if(VIT.tired)st.runTarget=0;   // (out of breath: a walk)
    if(VIT.out>0){ VIT.out-=dt; keys.clear(); target=null; if(VIT.out<=0)VIT.hp=Math.max(VIT.hp,.4); } else VIT.hp=Math.min(1,VIT.hp+dt/90);   // (fainted: nothing to be done but lie there)
    if(VIT.hp<.99||VIT.sta<.99)seen=Math.max(seen,1.2); seen-=dt; const show=seen>0; if(B.hidden===show)B.hidden=!show;
    if(show){ hpI.style.width=(VIT.hp*100).toFixed(0)+'%'; stI.style.width=(VIT.sta*100).toFixed(0)+'%'; }
    if(typeof LOOKS!=='undefined')LOOKS.stats(VIT.hp,VIT.sta); };
}
