// THE SOUNDS: SFX makes every sound effect and loop in code, with the volume and the sound mix.
import {SHARED, THREE} from './003-shx.js';
import {pos, SFX} from './003b-systems.js';
import {SAVE} from './005-save.js';
import {QS, TILE} from './006-map-pre.js';
const SOUND=QS.get('sound')!=='0';
const SNDMIX0={fx:{},loops:{},gap:1,blip:1};
Object.assign(SFX,{on:true,vol:1,mix:{fx:{},loops:{},gap:1,blip:1}});
{ const rnd=()=>Math.random()*2-1, TAU=Math.PI*2;
  { const s=SAVE.get('sfx'), v=SAVE.get('vol'); if(s!=null)SFX.on=s==='1'; if(v!=null)SFX.vol=Math.max(0,Math.min(1,+v)); }
  const mixOf=o=>({fx:Object.assign({},SNDMIX0.fx,o&&o.fx||{}),loops:Object.assign({},SNDMIX0.loops,o&&o.loops||{}),gap:o&&o.gap!=null?+o.gap:SNDMIX0.gap,blip:o&&o.blip!=null?+o.blip:SNDMIX0.blip});
  try{ SFX.mix=mixOf(JSON.parse(SAVE.get('sndmix')||'null')); }catch(e){ SFX.mix=mixOf(null); }
  SFX.saveMix=()=>SAVE.set('sndmix',JSON.stringify(SFX.mix)); SFX.resetMix=()=>{ SFX.mix={fx:{},loops:{},gap:1,blip:1}; SAVE.del('sndmix'); }; SFX.fxLevel=k=>SFX.mix.fx[k]==null?1:+SFX.mix.fx[k];
  // the page's one audio context: made at the first click or key (or when something asks with SFX.wake), everything heard goes out through SFX.out
  let woke=false; const mk=()=>{ if(!SOUND)return null; if(!SFX.ac)try{ SFX.ac=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; } return SFX.ac; };
  SFX.ctx=()=>SFX.ac||(woke||(navigator.userActivation&&navigator.userActivation.hasBeenActive)?mk():null);
  SFX.wake=()=>{ const c=mk(); if(c&&c.state!=='running')c.resume().catch(()=>{}); return c; };
  { const w=()=>{ woke=true; SFX.wake(); }; addEventListener('pointerdown',w,true); addEventListener('keydown',w,true); }
  SFX.live=()=>{ const c=SFX.ctx(); return c&&c.state==='running'?c:null; };
  SFX.out=c=>{ if(!SFX.m||SFX.m.context!==c){ SFX.m=c.createGain(); SFX.m.gain.value=SFX.vol; SFX.m.connect(c.destination); } return SFX.m; };
  const bus=c=>{ if(!SFX.g||SFX.g.context!==c){ SFX.g=c.createGain(); SFX.g.connect(SFX.out(c)); } SFX.g.gain.value=SFX.on?1:0; return SFX.g; };
  SFX.set=(on,vol)=>{ if(on!=null)SFX.on=on; if(vol!=null)SFX.vol=vol; SAVE.set('sfx',SFX.on?'1':'0'); SAVE.set('vol',String(SFX.vol)); const c=SFX.ac; if(c){ bus(c); SFX.out(c).gain.setTargetAtTime(SFX.vol,c.currentTime,.03); } };
  const env=(t,p)=>Math.pow(Math.max(0,1-t),p), lp=()=>{ let y=0; return (x,k)=>(y=y*(1-k)+x*k); };
  const R={
    click:{len:.015,f:(D,n)=>{ for(let i=0;i<n;i++){ const t=i/n; D[i]=rnd()*env(t,2)*.6; } }},
    thud:{len:.2,f:(D,n,S)=>{ for(let i=0;i<n;i++){ const t=i/n; D[i]=(Math.sin(TAU*80*i/S)*.7+rnd()*.3)*env(t,3); } }},
    page:{len:.25,f:(D,n)=>{ const F=lp(); for(let i=0;i<n;i++){ const t=i/n; D[i]=F(rnd(),.3+t*.5)*Math.sin(t*Math.PI)*.5; } }},
    latch:{len:.06,f:(D,n,S)=>{ for(let i=0;i<n;i++){ const s=i/S, t=i/n; D[i]=(Math.sin(TAU*1800*s)*.4+Math.sin(TAU*3500*s)*.2)*env(t,2)*.5; } }},
    door:{len:.5,f:(D,n,S)=>{ '@later'; const F=lp(); for(let i=0;i<n;i++){ const s=i/S; let v=0; if(s<.03)v+=(Math.sin(TAU*1800*s)*.4+Math.sin(TAU*3500*s)*.2)*env(s/.03,2)*.4;
        if(s>.03&&s<.25){ const lt=(s-.03)/.22; v+=(Math.sin(TAU*45*s)*.6+Math.sin(TAU*90*s)*.3+F(rnd(),.08)*.2)*Math.exp(-lt*5)*.5; } if(s>.08)v+=Math.sin(TAU*120*s)*Math.exp(-(s-.08)/.42*4)*.15; D[i]=v; } }},
    heart:{len:.12,f:(D,n,S)=>{ for(let i=0;i<n;i++){ let v=0; for(const st of [0,n*.42|0]){ const dt=i-st; if(dt>=0){ const t=dt/(n*.5); if(t<1)v+=Math.sin(TAU*62*dt/S)*env(t,3)*(st?.7:1); } } D[i]=v*.8; } }},
    cough:{len:.32,f:(D,n,S)=>{ const F=lp(); for(let i=0;i<n;i++){ let v=0; for(const st of [0,n*.51|0]){ const dt=i-st; if(dt>=0&&dt<n*.37){ const t=dt/(n*.37), e=Math.min(t*30,1)*env(t,2.5); v+=F(rnd(),.55)*e*.55+Math.sin(TAU*110*dt/S)*e*e*.3; } } D[i]=v; } }},
    step:{len:.07,f:(D,n)=>{ const F=lp(); for(let i=0;i<n;i++){ const t=i/n; D[i]=F(rnd(),.35)*Math.min(t*12,1)*env(t,2.2)*.5; } }},
    clunk:{len:.25,f:(D,n,S)=>{ const F=lp(); for(let i=0;i<n;i++){ const s=i/S; let v=F(rnd(),.12)*Math.exp(-s/.03)*.5; if(s>.16)v+=Math.sin(TAU*110*s)*Math.exp(-(s-.16)/.05)*.5; D[i]=v; } }},
    boom:{len:.9,f:(D,n,S)=>{ const F=lp(); for(let i=0;i<n;i++){ const s=i/S, t=i/n; D[i]=(Math.sin(TAU*(48-20*t)*s)*.6+F(rnd(),.05)*.5)*Math.min(t*40,1)*env(t,2.5); } }},
    creak:{len:.3,f:(D,n,S)=>{ const F=lp(); for(let i=0;i<n;i++){ const s=i/S, t=i/n; D[i]=F(rnd(),.2)*(.6+.4*Math.sin(TAU*(28+10*t)*s))*Math.sin(t*Math.PI)*.4; } }},
    drip:{len:.18,f:(D,n,S)=>{ for(let i=0;i<n;i++){ const s=i/S, t=i/n; D[i]=Math.sin(TAU*(1400-600*t)*s)*env(t,4)*.3; } }},
    splash:{len:.32,f:(D,n,S)=>{ const f=lp(); for(let i=0;i<n;i++){ const t=i/n, s=i/S; D[i]=f(rnd(),.35)*env(t,2.5)*.5+Math.sin(TAU*(180-120*t)*s)*env(t,6)*.25; } }},
    blip:{len:.06,f:(D,n,S)=>{ for(let i=0;i<n;i++){ const t=i/n, s=i/S; D[i]=Math.sin(TAU*1800*s)*Math.sin(t*Math.PI)*.3; } }},
    ding:{len:.7,f:(D,n,S)=>{ for(let i=0;i<n;i++){ const s=i/S; D[i]=(Math.sin(TAU*1320*s)+Math.sin(TAU*2640*s)*.35+Math.sin(TAU*3960*s)*.12)*Math.min(s*400,1)*Math.exp(-s*7)*.3; } }},
    chirp:{len:.22,f:(D,n,S)=>{ for(let i=0;i<n;i++){ const t=i/n, s=i/S, k=Math.floor(t*3), u=t*3-k; D[i]=Math.sin(TAU*(2600+1400*u+300*k)*s)*Math.sin(u*Math.PI)*.2; } }},
    cricket:{len:.45,f:(D,n,S)=>{ for(let i=0;i<n;i++){ const s=i/S, t=i/n, g=(s*26)%1<.3?1:0; D[i]=Math.sin(TAU*4200*s)*g*Math.sin(t*Math.PI)*.12; } }},
    bark:{len:.3,f:(D,n,S)=>{ const F=lp(); for(let i=0;i<n;i++){ let v=0; for(const st of [0,n*.5|0]){ const dt=i-st; if(dt>=0&&dt<n*.4){ const t=dt/(n*.4), s=dt/S; v+=(Math.sin(TAU*(320-80*t)*s)*.5+F(rnd(),.4)*.4)*Math.min(t*20,1)*env(t,2); } } D[i]=v*.5; } }},
    car:{len:3,f:(D,n)=>{ const F=lp(); for(let i=0;i<n;i++){ const t=i/n; D[i]=F(rnd(),.06+.12*Math.sin(t*Math.PI))*Math.pow(Math.sin(t*Math.PI),1.6)*.5; } }},
    horn:{len:.4,f:(D,n,S)=>{ for(let i=0;i<n;i++){ const s=i/S, t=i/n; D[i]=(Math.sin(TAU*330*s)+Math.sin(TAU*415*s)*.6)*Math.min(t*20,1)*env(t,.8)*.2; } }},
    rumble:{len:2.5,f:(D,n)=>{ const F=lp(); for(let i=0;i<n;i++){ const t=i/n; D[i]=F(rnd(),.015)*Math.pow(Math.sin(t*Math.PI),1.3)*1.6; } }},
    train:{len:4.5,f:(D,n)=>{ const F=lp(), G=lp(); for(let i=0;i<n;i++){ const t=i/n; D[i]=(F(rnd(),.02)*1.4+G(rnd(),.25)*.25*(((i*73)%1000<500)?1:.6))*Math.pow(Math.sin(t*Math.PI),1.2); } }},
    siren:{len:1.6,f:(D,n,S)=>{ for(let i=0;i<n;i++){ const s=i/S, t=i/n; D[i]=Math.sin(TAU*(700+150*Math.sin(TAU*s*1.1))*s)*Math.sin(t*Math.PI)*.08; } }},
    thunder:{len:2.2,f:(D,n)=>{ const F=lp(); for(let i=0;i<n;i++){ const t=i/n; D[i]=F(rnd(),.03+.04*rnd())*Math.min(t*30,1)*env(t,1.8)*(1+.5*Math.sin(t*37))*1.2; } }},
    scan:{len:1.1,f:(D,n,S)=>{ for(let i=0;i<n;i++){ const s=i/S, t=i/n; D[i]=Math.sin(TAU*(820+620*t)*s)*(Math.floor(s*22)%2?.45:1)*Math.sin(t*Math.PI)*.1; } }},
    laser:{len:.16,f:(D,n,S)=>{ for(let i=0;i<n;i++){ const s=i/S, t=i/n, f0=1900-1300*t; D[i]=(Math.sin(TAU*f0*s)*.5+Math.sin(TAU*f0*2.01*s)*.2+rnd()*.08)*env(t,1.6)*.7; } }},
    whoosh:{len:.55,f:(D,n)=>{ const F=lp(); for(let i=0;i<n;i++){ const t=i/n; D[i]=F(rnd(),.08+t*.5)*Math.sin(Math.min(1,t*2.2)*Math.PI/2)*env(Math.max(0,(t-.35)/.65),1.5)*.9; } }},
    hum:{len:4,loop:true,f:(D,n)=>{ const F=lp(); for(let i=0;i<n;i++)D[i]=F(rnd(),.03); const a=n*.05|0; for(let i=0;i<a;i++){ const k=i/a; D[i]*=k; D[n-1-i]*=k; } }},
    rain:{len:3,loop:true,f:(D,n)=>{ const F=lp(); for(let i=0;i<n;i++)D[i]=(rnd()-F(rnd(),.5)*.5)*.6; const a=n*.05|0; for(let i=0;i<a;i++){ const k=i/a; D[i]*=k; D[n-1-i]*=k; } }},
    wind:{len:5,loop:true,f:(D,n,S)=>{ const F=lp(); for(let i=0;i<n;i++){ const s=i/S; D[i]=F(rnd(),.05)*(.6+.4*Math.sin(TAU*s*.23)*Math.sin(TAU*s*.071)); } const a=n*.05|0; for(let i=0;i<a;i++){ const k=i/a; D[i]*=k; D[n-1-i]*=k; } }},
  };
  SFX.names=()=>Object.keys(R); SFX.recipe=k=>R[k]; SFX.add=(k,r)=>{ R[k]=r; };
  const BUF={}; SFX.buffer=(k,c)=>{ const r=R[k]; if(!r)return null; const key=k+(r.loop?'':''); if(BUF[key]&&BUF[key].sampleRate===c.sampleRate)return BUF[key];
    const S=c.sampleRate, n=Math.max(1,Math.round(r.len*S)), b=c.createBuffer(1,n,S); r.f(b.getChannelData(0),n,S); return BUF[key]=b; };
  const V=new THREE.Vector3(); const place=(o,G,P)=>{ '@later'; if(!o.at)return 1; const x=o.at.x, z=o.at.z!=null?o.at.z:o.at.y, d=Math.hypot(x-pos.x,z-pos.z), far=o.far||9*TILE, k=Math.max(0,1-d/far); if(k<=0)return 0;
    if(P){ V.set(x,o.at.y!=null&&o.at.z!=null?o.at.y:SHARED.py+1,z).project(SHARED.cam); P.pan.value=Math.max(-.8,Math.min(.8,V.x*.8)); } return k; };
  SFX.play=(k,o={})=>{ const c=SFX.live(); if(!c||!SFX.on||!R[k])return null; const b=SFX.buffer(k,c); if(!b)return null;
    const s=c.createBufferSource(), G=c.createGain(); s.buffer=b; s.loop=!!R[k].loop; s.playbackRate.value=(o.pitch||1)*(o.vary?1+(Math.random()-.5)*o.vary:1);
    let P=null; if(o.at&&c.createStereoPanner){ P=c.createStereoPanner(); } else if(o.pan!=null&&c.createStereoPanner){ P=c.createStereoPanner(); P.pan.value=o.pan; }
    const kd=place(o,G,o.at?P:null); if(kd<=0)return null; G.gain.value=(o.vol==null?1:o.vol)*kd*(o.raw?1:SFX.fxLevel(k)); const out=o.bus||bus(c); if(P)s.connect(P).connect(G).connect(out); else s.connect(G).connect(out); s.start(c.currentTime+(o.delay||0)); return {s,G,P}; };
  let ph0=0; SFX.steps=(st,go)=>{ const ph=st.ph||0; const down=Math.floor(ph*2)!==Math.floor(ph0*2); ph0=ph; if(!down||!(go>0)||st.w<.3||st.move||!SFX.on)return; SFX.play('step',{vol:.18+.3*(st.run||0),vary:.25,pitch:.9+Math.random()*.2}); };
  const hashS=s=>{ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  SFX.voiceOf=(key,bank)=>{ const h=hashS(String(key||'')); return {bank:bank||(h&1?'high':'low'),pitch:.92+((h>>>8)%1000)/1000*.16}; };
  const VB={}; const vbuf=(c,bank,i)=>{ '@later'; const key=bank+i; if(VB[key]&&VB[key].sampleRate===c.sampleRate)return VB[key]; const S=c.sampleRate, n=S*.07|0, b=c.createBuffer(1,n,S), D=b.getChannelData(0), f0=(bank==='high'?230:140)*(1+(i%4)*.06), fm=[1.5,2.2,2.8,3.6][(i>>2)%4];
    for(let j=0;j<n;j++){ const s=j/S, t=j/n, e=Math.min(t*18,1)*env(t,1.4); D[j]=(Math.sin(TAU*f0*s)*.6+Math.sin(TAU*f0*2*s)*.3*Math.sin(TAU*fm*s*20)+Math.sin(TAU*f0*3*s)*.12)*e*.35; } return VB[key]=b; };
  SFX.blip=(v,o={})=>{ '@later'; const c=SFX.live(); if(!c||!SFX.on)return; const s=c.createBufferSource(), G=c.createGain(); s.buffer=vbuf(c,v.bank||'low',Math.floor(Math.random()*16)); s.playbackRate.value=(v.pitch||1)*(.96+Math.random()*.08);
    let P=null; if(o.at&&c.createStereoPanner)P=c.createStereoPanner(); const kd=place(o,G,P); if(kd<=0)return; G.gain.value=.22*kd*(SFX.mix.blip==null?1:+SFX.mix.blip); if(P)s.connect(P).connect(G).connect(bus(c)); else s.connect(G).connect(bus(c)); s.start(); };
}
export {SOUND};
