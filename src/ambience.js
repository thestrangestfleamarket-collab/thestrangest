// ---- THE AMBIENCE (owner, 17 Oct 2026, from his physician game's ambient.gd: one room loop under everything and, every seven to sixteen
// seconds, one small sound picked by weight, never the same kind twice running, further apart when the place is empty): here the loops are
// made in code (sfx.js: the open air's hush, the rain, the wind) and so are the one-shots. What plays follows where you are and when: the
// street by day (a car passing, a bird, a horn, the subway under the road, a dog), the street by night (crickets, a dog, a car, a far siren),
// indoors (the boards creaking, the street muffled outside), underground (drips, the rumble, a train through the station). The rain's hiss
// and the wind's breath follow the weather (weather.js: WX.now), muffled indoors, none underground; a storm's flash brings its thunder a
// moment after. The gaps shorten with company (characters near you, as the game's waiting room did). AMBIENCE in the menu's DISPLAY (SAVE).
// Cost: three looping sources and at most two one-shots at a time, nothing a frame but a few numbers. ----
const AMB={on:true};
{ const S=SAVE.get('amb'); if(S!=null)AMB.on=S==='1';
  const dB=d=>Math.pow(10,d/20), T=TILE;
  // the one-shots by situation: [sound, weight, loudness in dB, pitch wobble]
  const SETS={
    day:[['car',1.2,-14,.15],['chirp',2.2,-16,.2],['horn',.3,-18,.1],['rumble',.6,-10,0],['bark',.5,-18,.15],['creak',.3,-22,.2]],
    night:[['cricket',2.5,-14,.08],['bark',.6,-18,.15],['car',.8,-16,.15],['siren',.2,-18,.05],['rumble',.6,-11,0],['creak',.3,-22,.2]],
    inside:[['creak',2.5,-15,.25],['car',.6,-24,.15],['latch',.4,-24,.2],['rumble',.4,-16,0]],
    down:[['drip',2.5,-12,.3],['rumble',1.5,-6,0],['train',.5,-6,0],['creak',.5,-20,.2]]};
  const WX_RAIN={vol:.09,inside:.3}, WX_WIND={vol:.07,inside:.25};
  let loops=null, next=0, lastK='', mul=1;
  const bus=c=>{ if(!AMB.g||AMB.g.context!==c){ AMB.g=c.createGain(); AMB.g.gain.value=0; AMB.g.connect(c.destination); } return AMB.g; };
  const mk=(c,k,f0)=>{ const s=c.createBufferSource(), F=c.createBiquadFilter(), G=c.createGain(); s.buffer=SFX.buffer(k,c); s.loop=true; F.type='lowpass'; F.frequency.value=f0; G.gain.value=0; s.connect(F).connect(G).connect(bus(c)); s.start(); return {s,F,G}; };
  const where=()=>LVL==='down'?'down':(typeof ROOMS!=='undefined'&&ROOMS.cur)?'inside':CLOCK.dark()?'night':'day';
  const tgt=(p,v,c,k=.4)=>p.setTargetAtTime(v,c.currentTime,k);
  AMB.set=on=>{ AMB.on=on; SAVE.set('amb',on?'1':'0'); };
  AMB.tick=dt=>{ const c=SFX.live(); if(!c)return; const B=bus(c); B.gain.value=AMB.on&&SFX.on?SFX.vol:0; if(!AMB.on||!SFX.on)return;
    if(!loops||loops.hum.s.context!==c)loops={hum:mk(c,'hum',500),rain:mk(c,'rain',3200),wind:mk(c,'wind',600)};
    const w=where(), W=typeof WX!=='undefined'&&WX.now, out=w==='day'||w==='night', ins=w==='inside';
    // the loops' levels by where you are and the weather
    const LM=k=>SFX.mix.loops[k]==null?1:+SFX.mix.loops[k]; tgt(loops.hum.G.gain,(w==='down'?.05:ins?.02:.035)*LM('hum'),c); tgt(loops.hum.F.frequency,w==='down'?160:ins?260:500,c);
    const rain=W&&w!=='down'?(W.rain+W.snow*.15)*WX_RAIN.vol*(ins?WX_RAIN.inside:1):0, wind=W&&w!=='down'?W.wind*WX_WIND.vol*(ins?WX_WIND.inside:1):0;
    tgt(loops.rain.G.gain,rain*LM('rain'),c); tgt(loops.rain.F.frequency,ins?900:3200,c); tgt(loops.wind.G.gain,wind*LM('wind'),c);
    if(W&&W.flash&&out&&!AMB.thun){ AMB.thun=true; SFX.play('thunder',{vol:.5,delay:.6+Math.random()*1.6,pan:Math.random()*1.2-.6,bus:B}); setTimeout(()=>AMB.thun=false,4000); }
    // the one-shots: picked by weight from the situation's set, not the last kind; the gap 7 to 16 s, longer with no one about
    const now=c.currentTime; if(now<next)return;
    let near=0; for(const N of NPCS)if(!N.far&&N.lv===LVL&&N.g.visible&&Math.hypot(N.st.x-pos.x,N.st.z-pos.z)<10*T)near++; mul=1.8+(1-1.8)*Math.min(1,near/6);
    const set=SETS[w].filter(e=>e[0]!==lastK&&!(W&&W.rain>.3&&e[0]==='chirp')); let tot=0; for(const e of set)tot+=e[1]; let r=Math.random()*tot, pick=set[set.length-1]; for(const e of set){ r-=e[1]; if(r<=0){ pick=e; break; } }
    lastK=pick[0]; SFX.play(pick[0],{vol:dB(pick[2]+Math.random()*-3),vary:pick[3],pan:Math.random()*1.4-.7,bus:B});
    next=now+(7+Math.random()*9)*mul*(SFX.mix.gap==null?1:+SFX.mix.gap)*(next?1:(.3+Math.random()*.4)); };
  AMB.sets=SETS;   // (the data check: every sound named here is a recipe)
}
