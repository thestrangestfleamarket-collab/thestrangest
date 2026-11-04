// THE SOUND EDITOR: SNDED, the panel for setting each sound's level and trying it out.
import {SFX, SNDED} from './003b-systems.js';
import {TPANE} from './087dz-tpane.js';

{ const P=document.createElement('div'); P.id='snded'; P.className='sndx'; P.hidden=true; document.body.appendChild(P);
  const css=document.createElement('style'); css.textContent='#snded{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:auto;font:12px var(--pixel);color:var(--fg);background:var(--panel);border:2px solid var(--line);padding:6px;box-sizing:border-box;z-index:16;user-select:none}'
    +'#snded[hidden]{display:none} .sndx .dim{color:var(--dim);margin:4px 6px} .sndx textarea{width:100%;height:70px;font:11px ui-monospace,monospace;background:#0e1016;color:var(--fg);border:2px solid #3a3f4e;margin-top:6px;box-sizing:border-box}'; document.head.appendChild(css);
  const LOOPN={hum:'THE HUSH',rain:'THE RAIN',wind:'THE WIND'}, FXN={click:'A SWITCH',thud:'A BLOW',page:'A PAGE',latch:'A LATCH',door:'A DOOR',heart:'A HEARTBEAT',cough:'A COUGH',step:'HIS STEPS',clunk:'THE CAN',boom:'A FIREBALL',creak:'A CREAK',drip:'A DRIP',chirp:'A BIRD',cricket:'CRICKETS',bark:'A DOG',car:'A CAR PASSING',horn:'A HORN',rumble:'THE SUBWAY',train:'A TRAIN',siren:'A SIREN',thunder:'THUNDER'};
  const pct=v=>Math.round(v*100)+'%';
  let playing=null;
  const loopDemo=k=>{ const c=SFX.live(); if(!c)return; if(playing){ try{ playing.s.stop(); }catch(e){} playing=null; } const o=SFX.play(k,{vol:{hum:.08,rain:.25,wind:.2}[k]*(SFX.mix.loops[k]??1)}); if(o){ playing=o; setTimeout(()=>{ try{ o.s.stop(); }catch(e){} if(playing===o)playing=null; },2500); } };
  const lvl=(g,k)=>{ const get=()=>+(g?SFX.mix[g][k]??1:SFX.mix[k]??1); return [get,v=>{ v=+(+v).toFixed(2); if(v===get())return; if(g)SFX.mix[g][k]=v; else SFX.mix[k]=v; SFX.saveMix(); }]; };
  const build=async(T=P)=>{ '@later'; if(!T.__k){ T.__k=1; for(const ev of ['keydown','keyup'])T.addEventListener(ev,e=>{ if(e.key!=='Escape'&&e.target.matches('input'))e.stopPropagation(); }); }
    if(!T.querySelector(':scope>.tp'))T.innerHTML='<div class="tp"></div><div class="dim">each level kept for good; PLAY to hear it as you are</div>';
    const FX=SFX.names().filter(k=>!SFX.recipe(k).loop);
    const V=TPANE.live({...Object.fromEntries(FX.map(k=>['fx.'+k,lvl('fx',k)])),...Object.fromEntries(['hum','rain','wind'].map(k=>['loops.'+k,lvl('loops',k)])),gap:lvl(null,'gap'),blip:lvl(null,'blip')});
    const pane=await TPANE.make(T.querySelector(':scope>.tp'),T===P?{title:'SOUND EDITOR'}:{});
    const row=(f,k,lab,min,play)=>{ f.addBinding(V,k,{label:lab,min,max:2,step:.05,format:pct}); if(play)f.addButton({title:'PLAY',label:''}).on('click',play); };
    const fx=pane.addFolder({title:'EFFECTS'}); for(const k of FX)row(fx,'fx.'+k,FXN[k]||k.toUpperCase(),0,()=>SFX.play(k,{vol:1}));
    const am=pane.addFolder({title:'THE AMBIENCE'}); for(const k of ['hum','rain','wind'])row(am,'loops.'+k,LOOPN[k],0,()=>loopDemo(k)); row(am,'gap','GAP BETWEEN',.5);
    const vo=pane.addFolder({title:'VOICES'}); row(vo,'blip','THEIR BLIPS',0,()=>{ const v=SFX.voiceOf('tester'); for(let i=0;i<4;i++)setTimeout(()=>SFX.blip(v),i*60); });
    pane.addButton({title:'RESET ALL'}).on('click',()=>{ SFX.resetMix(); pane.refresh(); });
    pane.addButton({title:'EXPORT'}).on('click',()=>{ let t=T.querySelector('textarea'); if(!t){ t=document.createElement('textarea'); t.readOnly=true; T.appendChild(t); } t.value='SNDMIX0='+JSON.stringify(SFX.mix)+';'; t.select(); }); };
  let busy=Promise.resolve();
  const later=T=>busy=busy.then(()=>build(T)).catch(e=>{ const d=T.querySelector('.dim'); if(d)d.textContent='PANEL DID NOT LOAD: '+e.message; });
  SNDED.open=()=>{ P.hidden=false; return later(P); }; SNDED.close=()=>{ P.hidden=true; if(playing){ try{ playing.s.stop(); }catch(e){} playing=null; } }; SNDED.toggle=()=>P.hidden?SNDED.open():SNDED.close(); SNDED.isOpen=()=>!P.hidden; SNDED.el=P; SNDED.into=el=>{ el.classList.add('sndx'); return later(el); };
}
