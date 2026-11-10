// THE AMBIENCE: AMB plays background sounds for day, night, indoors and underground.
import {SHARED} from './003-shx.js';
import {AMB, CLOCK, NPCS, pos, ROOMS, SFX, WX} from './003b-systems.js';
import {SAVE} from './005-save.js';
import {TILE} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
Object.assign(AMB,{on:true});
{ const S=SAVE.get('amb'); if(S!=null)AMB.on=S==='1';
  const dB=d=>Math.pow(10,d/20), T=TILE;
  const SETS={
    day:[['car',1.2,-14,.15],['chirp',2.2,-16,.2],['horn',.3,-18,.1],['rumble',.6,-10,0],['bark',.5,-18,.15],['creak',.3,-22,.2]],
    night:[['cricket',2.5,-14,.08],['bark',.6,-18,.15],['car',.8,-16,.15],['siren',.2,-18,.05],['rumble',.6,-11,0],['creak',.3,-22,.2]],
    inside:[['creak',2.5,-15,.25],['car',.6,-24,.15],['latch',.4,-24,.2],['rumble',.4,-16,0]],
    down:[['drip',2.5,-12,.3],['rumble',1.5,-6,0],['train',.5,-6,0],['creak',.5,-20,.2]]};
  const WX_RAIN={vol:.09,inside:.3}, WX_WIND={vol:.07,inside:.25};
  let loops=null, next=0, lastK='', mul=1;
  const bus=c=>{ if(!AMB.g||AMB.g.context!==c){ AMB.g=c.createGain(); AMB.g.gain.value=0; AMB.g.connect(SFX.out(c)); } return AMB.g; };
  const mk=(c,k,f0)=>{ const s=c.createBufferSource(), F=c.createBiquadFilter(), G=c.createGain(); s.buffer=SFX.buffer(k,c); s.loop=true; F.type='lowpass'; F.frequency.value=f0; G.gain.value=0; s.connect(F).connect(G).connect(bus(c)); s.start(); return {s,F,G}; };
  const where=()=>SHARED.LVL==='down'?'down':(ROOMS.cur)?'inside':CLOCK.dark()?'night':'day';
  const tgt=(p,v,c,k=.4)=>p.setTargetAtTime(v,c.currentTime,k);
  AMB.set=on=>{ AMB.on=on; SAVE.set('amb',on?'1':'0'); };
  AMB.tick=dt=>{ const c=SFX.live(); if(!c)return; const B=bus(c); B.gain.value=AMB.on&&SFX.on?1:0; if(!AMB.on||!SFX.on)return;
    if(!loops||loops.hum.s.context!==c)loops={hum:mk(c,'hum',500),rain:mk(c,'rain',3200),wind:mk(c,'wind',600),fount:mk(c,'rain',1400)};
    const w=where(), W=WX.now, out=w==='day'||w==='night', ins=w==='inside';
    const LM=k=>SFX.mix.loops[k]==null?1:+SFX.mix.loops[k]; tgt(loops.hum.G.gain,(w==='down'?.05:ins?.02:.035)*LM('hum'),c); tgt(loops.hum.F.frequency,w==='down'?160:ins?260:500,c);
    const rain=W&&w!=='down'?(W.rain+W.snow*.15)*WX_RAIN.vol*(ins?WX_RAIN.inside:1):0, wind=(W&&w!=='down'?W.wind*WX_WIND.vol*(ins?WX_WIND.inside:1):0)+(AMB.breeze||0)*.035;   // AMB.breeze: an open window at home (150a)
    tgt(loops.rain.G.gain,rain*LM('rain'),c); tgt(loops.rain.F.frequency,ins?900:3200,c); tgt(loops.wind.G.gain,wind*LM('wind'),c); tgt(loops.fount.G.gain,FOUNT.hear?FOUNT.hear(pos)*.07:0,c);
    if(W&&W.flash&&out&&!AMB.thun){ AMB.thun=true; SFX.play('thunder',{vol:.5,delay:.6+Math.random()*1.6,pan:Math.random()*1.2-.6,bus:B}); setTimeout(()=>AMB.thun=false,4000); }
    const now=c.currentTime; if(now<next)return;
    let near=0; for(const N of NPCS)if(!N.far&&N.lv===SHARED.LVL&&N.g.visible&&Math.hypot(N.st.x-pos.x,N.st.z-pos.z)<10*T)near++; mul=1.8+(1-1.8)*Math.min(1,near/6);
    const set=SETS[w].filter(e=>e[0]!==lastK&&!(W&&W.rain>.3&&e[0]==='chirp')); let tot=0; for(const e of set)tot+=e[1]; let r=Math.random()*tot, pick=set[set.length-1]; for(const e of set){ r-=e[1]; if(r<=0){ pick=e; break; } }
    lastK=pick[0]; SFX.play(pick[0],{vol:dB(pick[2]+Math.random()*-3),vary:pick[3],pan:Math.random()*1.4-.7,bus:B});
    next=now+(7+Math.random()*9)*mul*(SFX.mix.gap==null?1:+SFX.mix.gap)*(next?1:(.3+Math.random()*.4)); };
  AMB.sets=SETS;
}
