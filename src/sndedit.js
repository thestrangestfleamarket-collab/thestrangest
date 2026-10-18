// ---- THE SOUND EDITOR (owner, 17 Oct 2026: "add a game sound editor to change levels perm"): the menu's own SOUND tab (owner, 18 Oct 2026:
// "remove the shift+s shortcut, add sound to its own tab in admin menu": no key, its rows in the tab, SNDED.into).
// Every effect made in code (sfx.js) has its level here, 0 to 200%, with PLAY to hear it; the ambience's three loops (the hush, the rain, the
// wind) theirs; the gap between the ambience's small sounds (half as long to twice); the voice blips' level. Each change takes at once and is
// kept for good in the save (SAVE's `sndmix`: {fx:{name:level}, loops:{hum,rain,wind}, gap, blip}); RESET ALL puts every level back to 1.
// EXPORT shows the mix as text: pasted into SNDMIX0 in sfx.js it becomes the game's own. The panel closes and drags as every panel does. ----
const SNDED={};
{ const P=document.createElement('div'); P.id='snded'; P.className='sndx'; P.hidden=true; document.body.appendChild(P);
  const css=document.createElement('style'); css.textContent='#snded{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:auto;font:12px var(--pixel);color:var(--fg);background:var(--panel);border:2px solid var(--line);padding:14px 16px 12px;z-index:16;user-select:none}'
    +'#snded[hidden]{display:none} .sndx h2{font:inherit;font-size:14px;color:var(--key);margin:0 0 8px;letter-spacing:.04em} .sndx h3{font:inherit;color:var(--key);margin:12px 0 4px} .sndx .r{display:flex;align-items:center;gap:8px;margin:3px 0}'
    +'.sndx .r span.n{width:120px;color:var(--fg)} .sndx .r span.v{width:48px;text-align:right;color:var(--dim);font-variant-numeric:tabular-nums} .sndx input[type=range]{flex:1;min-width:120px} .sndx .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:4px 8px;cursor:pointer}'
    +'.sndx .btn:hover{color:var(--key)} .sndx .dim{color:var(--dim);margin:4px 0} .sndx textarea{width:100%;height:70px;font:11px ui-monospace,monospace;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;margin-top:6px}'; document.head.appendChild(css);
  const LOOPN={hum:'THE HUSH',rain:'THE RAIN',wind:'THE WIND'}, FXN={click:'A SWITCH',thud:'A BLOW',page:'A PAGE',latch:'A LATCH',door:'A DOOR',heart:'A HEARTBEAT',cough:'A COUGH',step:'HIS STEPS',clunk:'THE CAN',boom:'A FIREBALL',creak:'A CREAK',drip:'A DRIP',chirp:'A BIRD',cricket:'CRICKETS',bark:'A DOG',car:'A CAR PASSING',horn:'A HORN',rumble:'THE SUBWAY',train:'A TRAIN',siren:'A SIREN',thunder:'THUNDER'};
  const pct=v=>Math.round(v*100)+'%';
  const row=(name,val,min,max,step,on,play)=>{ const r=document.createElement('div'); r.className='r'; r.innerHTML='<span class="n">'+name+'</span><input type="range" min="'+min+'" max="'+max+'" step="'+step+'"><span class="v"></span>'+(play?'<button class="btn" type="button">PLAY</button>':'');
    const i=r.querySelector('input'), v=r.querySelector('.v'); i.value=val; v.textContent=pct(val); i.oninput=()=>{ v.textContent=pct(+i.value); on(+i.value); }; if(play)r.querySelector('button').onclick=play; r.set=x=>{ i.value=x; v.textContent=pct(x); }; return r; };
  let rows={}, playing=null;
  const loopDemo=k=>{ const c=SFX.live(); if(!c)return; if(playing){ try{ playing.s.stop(); }catch(e){} playing=null; } const o=SFX.play(k,{vol:{hum:.08,rain:.25,wind:.2}[k]*(SFX.mix.loops[k]??1)}); if(o){ playing=o; setTimeout(()=>{ try{ o.s.stop(); }catch(e){} if(playing===o)playing=null; },2500); } };
  const build=(T=P)=>{ T.innerHTML=(T===P?'<h2>SOUND EDITOR</h2>':'')+'<div class="dim">each level kept for good; PLAY to hear it as you are</div>'; rows={};
    const M=SFX.mix; const h=t=>{ const e=document.createElement('h3'); e.textContent=t; T.appendChild(e); };
    h('EFFECTS'); for(const k of SFX.names()){ if(SFX.recipe(k).loop)continue; const r=row(FXN[k]||k.toUpperCase(),M.fx[k]??1,0,2,.05,v=>{ M.fx[k]=v; SFX.saveMix(); },()=>SFX.play(k,{vol:1})); rows['fx.'+k]=r; T.appendChild(r); }
    h('THE AMBIENCE'); for(const k of ['hum','rain','wind']){ const r=row(LOOPN[k],M.loops[k]??1,0,2,.05,v=>{ M.loops[k]=v; SFX.saveMix(); },()=>loopDemo(k)); rows['loops.'+k]=r; T.appendChild(r); }
    { const r=row('GAP BETWEEN',M.gap??1,.5,2,.05,v=>{ M.gap=v; SFX.saveMix(); }); rows.gap=r; T.appendChild(r); }
    h('VOICES'); { const r=row('THEIR BLIPS',M.blip??1,0,2,.05,v=>{ M.blip=v; SFX.saveMix(); },()=>{ const v=SFX.voiceOf('tester'); for(let i=0;i<4;i++)setTimeout(()=>SFX.blip(v),i*60); }); rows.blip=r; T.appendChild(r); }
    const foot=document.createElement('div'); foot.className='r'; foot.style.marginTop='10px'; foot.innerHTML='<button class="btn" type="button" id="sndReset">RESET ALL</button><button class="btn" type="button" id="sndExport">EXPORT</button>'; T.appendChild(foot);
    foot.querySelector('#sndReset').onclick=()=>{ SFX.resetMix(); build(T); };
    foot.querySelector('#sndExport').onclick=()=>{ let t=T.querySelector('textarea'); if(!t){ t=document.createElement('textarea'); t.readOnly=true; T.appendChild(t); } t.value='SNDMIX0='+JSON.stringify(SFX.mix)+';'; t.select(); }; };
  SNDED.open=()=>{ build(); P.hidden=false; }; SNDED.close=()=>{ P.hidden=true; if(playing){ try{ playing.s.stop(); }catch(e){} playing=null; } }; SNDED.toggle=()=>P.hidden?SNDED.open():SNDED.close(); SNDED.isOpen=()=>!P.hidden; SNDED.el=P; SNDED.into=el=>{ el.classList.add('sndx'); build(el); };
}
