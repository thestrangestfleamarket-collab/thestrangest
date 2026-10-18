const VIT={hp:1,sta:1,out:0,tired:false,fight:0};
VIT.inFight=t=>{ VIT.fight=Math.max(VIT.fight,t||5); };
{ const css=document.createElement('style'); css.textContent=`#vit{position:fixed;left:12px;bottom:12px;width:150px;display:grid;gap:4px;z-index:5;pointer-events:none}
    #vit[hidden]{display:none} #vit div{height:7px;background:#0b0d13cc;border:1px solid #2a3040} #vit i{display:block;height:100%}`; document.head.appendChild(css);
  const B=document.createElement('div'); B.id='vit'; B.hidden=true; B.innerHTML='<div><i id="vhp" style="background:#c84a3a"></i></div><div><i id="vst" style="background:#d8b84a"></i></div>'; document.body.appendChild(B);
  const hpI=B.querySelector('#vhp'), stI=B.querySelector('#vst'); let lx=pos.x, lz=pos.z, seen=0, rest=0;
  VIT.hurt=(d)=>{ if(VIT.out>0)return; if(typeof SFX!=='undefined')SFX.play('thud',{vol:.7,vary:.2}); VIT.hp=Math.max(0,VIT.hp-d); VIT.inFight(5); if(VIT.hp<=0){ VIT.out=5.5; trip=true; } };
  VIT.tick=dt=>{ const sp=Math.hypot(pos.x-lx,pos.z-lz)/Math.max(dt,1e-3); lx=pos.x; lz=pos.z; const running=st.run>.55&&sp>.6*TILE&&!UI.fly&&!UI.freeCam;
    if(running){ VIT.sta=Math.max(0,VIT.sta-dt/12); rest=0; } else if((rest+=dt)>.8)VIT.sta=Math.min(1,VIT.sta+dt/7);
    if(VIT.sta<=0)VIT.tired=true; if(VIT.tired&&VIT.sta>.33)VIT.tired=false; if(VIT.tired)st.runTarget=0;
    if(VIT.out>0){ VIT.out-=dt; keys.clear(); target=null; if(VIT.out<=0)VIT.hp=Math.max(VIT.hp,.4); } else VIT.hp=Math.min(1,VIT.hp+dt/90);
    VIT.fight=Math.max(0,VIT.fight-dt); const show=VIT.fight>0||VIT.out>0; if(B.hidden===show)B.hidden=!show;
    if(show){ hpI.style.width=(VIT.hp*100).toFixed(0)+'%'; stI.style.width=(VIT.sta*100).toFixed(0)+'%'; }
    if(typeof LOOKS!=='undefined')LOOKS.stats(VIT.hp,VIT.sta); };
}
