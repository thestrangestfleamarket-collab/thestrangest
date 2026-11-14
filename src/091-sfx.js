// THE SOUNDS: SFX makes every sound effect and loop in code, with the volume and the sound mix.
import {SHARED, THREE} from './003-shx.js';
import {PARK, pos, ROOMS, SFX, UI} from './003b-systems.js';
import {SAVE} from './005-save.js';
import {QS, SYS, TILE} from './006-map-pre.js';
const SOUND=QS.get('sound')!=='0';
const SNDMIX0={fx:{step_stone:.1,step_grass:.1,step_wood:.1},loops:{},gap:1,blip:1};   // footsteps at the lowest level until you raise them (owner, 14 Nov 2026)
Object.assign(SFX,{on:true,vol:1,mix:{fx:{},loops:{},gap:1,blip:1}});   // snd: the one switch over every sound, off until you turn it on (owner, 12 Nov 2026: "turn off all sounsd by default for players , must turn on if want sounds")
{ const rnd=()=>Math.random()*2-1, TAU=Math.PI*2;
  { const s=SAVE.get('sfx'), v=SAVE.get('vol'), a=SAVE.get('snd'); if(s!=null)SFX.on=s==='1'; if(v!=null)SFX.vol=Math.max(0,Math.min(1,+v)); SFX.snd=QS.get('sound')==='1'||a==='1'; }   // (?sound=1 for the checks)
  const mixOf=o=>({fx:Object.assign({},SNDMIX0.fx,o&&o.fx||{}),loops:Object.assign({},SNDMIX0.loops,o&&o.loops||{}),gap:o&&o.gap!=null?+o.gap:SNDMIX0.gap,blip:o&&o.blip!=null?+o.blip:SNDMIX0.blip});
  try{ SFX.mix=mixOf(JSON.parse(SAVE.get('sndmix')||'null')); }catch(e){ SFX.mix=mixOf(null); }
  SFX.saveMix=()=>SAVE.set('sndmix',JSON.stringify(SFX.mix)); SFX.resetMix=()=>{ SFX.mix=mixOf(null); SAVE.del('sndmix'); }; SFX.fxLevel=k=>(SFX.mix.fx[k]==null?1:+SFX.mix.fx[k])*(SFX.setOf?SFX.setOf(k).lvl??1:1);
  // the page's one audio context: made at the first click or key (or when something asks with SFX.wake), everything heard goes out through SFX.out
  let woke=false; const mk=()=>{ if(!SOUND)return null; if(!SFX.ac)try{ SFX.ac=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; } return SFX.ac; };
  SFX.ctx=()=>SFX.ac||(woke||(navigator.userActivation&&navigator.userActivation.hasBeenActive)?mk():null);
  SFX.wake=()=>{ const c=mk(); if(c&&c.state!=='running')c.resume().catch(()=>{}); return c; };
  { const w=e=>{ if(!e.isTrusted)return; woke=true; SFX.wake(); }; addEventListener('pointerdown',w,true); addEventListener('keydown',w,true); }
  SFX.live=()=>{ const c=SFX.ctx(); return c&&c.state==='running'?c:null; };
  SFX.out=c=>{ if(!SFX.m||SFX.m.context!==c){ SFX.m=c.createGain(); SFX.m.gain.value=SFX.snd?SFX.vol:0; SFX.m.connect(c.destination); } return SFX.m; };
  const bus=c=>{ if(!SFX.g||SFX.g.context!==c){ SFX.g=c.createGain(); SFX.g.connect(SFX.out(c)); } SFX.g.gain.value=SFX.on?1:0; return SFX.g; };
  SFX.set=(on,vol)=>{ if(on!=null)SFX.on=on; if(vol!=null)SFX.vol=vol; SAVE.set('sfx',SFX.on?'1':'0'); SAVE.set('vol',String(SFX.vol)); const c=SFX.ac; if(c){ bus(c); SFX.out(c).gain.setTargetAtTime(SFX.snd?SFX.vol:0,c.currentTime,.03); } };
  SFX.master=on=>{ SFX.snd=!!on; SAVE.set('snd',SFX.snd?'1':'0'); const c=SFX.snd?SFX.wake():SFX.ac; if(c)SFX.out(c).gain.setTargetAtTime(SFX.snd?SFX.vol:0,c.currentTime,.03); for(const f of SFX.onAll)try{ f(SFX.snd); }catch(e){} };   // what plays outside this mixer (a TV's film, the cinema, a cabinet's own sound) hears of it through onAll
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
    bell:{len:3,f:(D,n,S)=>{ const P=[[.5,.5,.6],[1,1,.9],[1.19,.55,1.3],[1.5,.35,1.8],[2,.5,2.2],[2.66,.25,3.4],[3.01,.18,4.5]]; for(let i=0;i<n;i++){ const s=i/S; let v=0; for(const [r,a,d] of P)v+=Math.sin(TAU*392*r*s)*a*Math.exp(-s*d); D[i]=v*Math.min(s*600,1,(n-i)/S*3)*.22; } }},
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
  // a sound's place in 3D: one panner a source, the ears on your head and turned the way the view looks; how loud by distance stays each sound's own
  const EARS=new Set(), HEAD=new Set(), EP=new THREE.Vector3(), EF=new THREE.Vector3(), EU=new THREE.Vector3(), put=(P,x,y,z,t)=>{ if(P.positionX){ if(t){ P.positionX.setTargetAtTime(x,t,.05); P.positionY.setTargetAtTime(y,t,.05); P.positionZ.setTargetAtTime(z,t,.05); } else { P.positionX.value=x; P.positionY.value=y; P.positionZ.value=z; } } else P.setPosition(x,y,z); };
  SFX.spot=(c,hrtf)=>{ EARS.add(c); const P=c.createPanner(); P.panningModel=hrtf?'HRTF':'equalpower'; P.rolloffFactor=0; let set=false; put(P,EP.x,EP.y,EP.z);
    P.to=(x,y,z)=>{ if(x==null){ if(!HEAD.has(P)){ HEAD.add(P); if(P.positionX)for(const a of [P.positionX,P.positionY,P.positionZ])a.cancelScheduledValues(0); put(P,EP.x,EP.y,EP.z); } return; } HEAD.delete(P); put(P,x,y,z,set?c.currentTime:0); set=true; };
    P.end=()=>{ HEAD.delete(P); try{ P.disconnect(); }catch(e){} }; return P; };
  SFX.ears=()=>{ const cam=SHARED.cam; if(!cam||!EARS.size)return; const m=cam.matrixWorld.elements, first=UI.view==='first'; EF.set(-m[8],-m[9],-m[10]); EU.set(m[4],m[5],m[6]);
    if(!UI.persp){ if(Math.abs(EF.y)>.98)EF.copy(EU); EF.y=0; EF.normalize(); EU.set(0,1,0); }
    if(first)EP.copy(cam.position); else EP.set(pos.x,SHARED.py+1.9*TILE,pos.z);
    for(const c of EARS){ if(c.state!=='running')continue; const L=c.listener; if(L.positionX){ L.positionX.value=EP.x; L.positionY.value=EP.y; L.positionZ.value=EP.z; L.forwardX.value=EF.x; L.forwardY.value=EF.y; L.forwardZ.value=EF.z; L.upX.value=EU.x; L.upY.value=EU.y; L.upZ.value=EU.z; } else { L.setPosition(EP.x,EP.y,EP.z); L.setOrientation(EF.x,EF.y,EF.z,EU.x,EU.y,EU.z); } }
    for(const P of HEAD)put(P,EP.x,EP.y,EP.z); };
  SYS.add('cam',SFX.ears,'091-sfx ears');
  const place=(o,G,P)=>{ '@later'; if(!o.at)return 1; const x=o.at.x, z=o.at.z!=null?o.at.z:o.at.y, d=Math.hypot(x-pos.x,z-pos.z), far=o.far||9*TILE, k=Math.max(0,1-d/far); if(k<=0)return 0;
    if(P)P.to(x,o.at.y!=null&&o.at.z!=null?o.at.y:SHARED.py+TILE,z); return k; };
  // the recorded takes (tools/sfx-bake.py): fetched and decoded once the sound is on; till they come, and for a name with no takes, the recipe plays
  // three files: the effects, the day and night around you (fetched when the ambience first plays), the fights (at the first fight sound)
  const BANKS=[{tk:__DATA__("data/sfx.json"),f:__FILE__("data/sfx.mp3"),buf:null,busy:false,retry:0,sh:0},{tk:__DATA__("data/amb.json"),f:__FILE__("data/amb.mp3"),buf:null,busy:false,retry:0,sh:0},{tk:__DATA__("data/fight.json"),f:__FILE__("data/fight.mp3"),buf:null,busy:false,retry:0,sh:0}], BANK=BANKS[0];
  const TK=Object.assign({},...BANKS.map(B=>B.tk)), ALT={step_stone:'step',step_grass:'step',step_wood:'step',dooropen:'latch',amb_birds:'chirp',amb_dog:'bark',amb_siren:'siren',punch:'thud',hurt:'thud',swing:'whoosh',blade:'clunk',clash:'clunk',block:'thud'};
  const bankOf=k=>BANKS.find(B=>B.tk[k])||BANK;
  const bank=(c,B=BANK)=>{ if(B.buf)return B; if(B.busy||performance.now()<B.retry)return null; B.busy=true; const TB=B.tk;
    fetch(B.f).then(r=>{ if(!r.ok)throw new Error(r.status); return r.arrayBuffer(); }).then(b=>c.decodeAudioData(b)).then(buf=>{ const x=buf.getChannelData(0), sr=buf.sampleRate, t0=TB[Object.keys(TB).find(k=>k[0]!=='~')][0][0], i0=Math.floor(Math.max(0,t0-.06)*sr); let pk=0; for(let i=i0;i<(t0+.15)*sr;i++)pk=Math.max(pk,Math.abs(x[i])); let i=i0; while(i<(t0+.15)*sr&&Math.abs(x[i])<pk*.03)i++; B.sh=Math.max(-.05,Math.min(.08,i/sr-t0-.004)); B.buf=buf; }).catch(e=>{ console.warn('the recorded sounds',e); B.retry=performance.now()+(location.protocol==='file:'?1e12:15000); }).finally(()=>{ B.busy=false; }); return null; };
  // the owner's sounds (ADMIN > SOUND EDITOR, /shared/sounds.json): for a name, its takes (a baked one {b:[name,i]} or an uploaded file {f}, each trimmed by a and z seconds), level and pitch, over the baked ones; heard by everyone
  const SET=Object.assign({},...BANKS.map(B=>B.tk['~set']||{})), SH={set:{}}, FILES={}, web=/^https?:$/.test(location.protocol);
  const file=(c,f)=>{ const F=FILES[f]||(FILES[f]={buf:null,busy:false}); if(F.buf||F.busy)return F.buf; F.busy=true;
    fetch('/shared/'+f,{credentials:'same-origin'}).then(r=>{ if(!r.ok||r.status===204)throw new Error(r.status); return r.arrayBuffer(); }).then(b=>c.decodeAudioData(b)).then(b=>{ F.buf=b; }).catch(e=>console.warn('the sound '+f,e)); return null; };
  SFX.shared=SH; SFX.files=FILES; SFX.setOf=k=>Object.assign({},SET[k],SH.set[k]);
  SFX.takeList=k=>{ const o=SH.set[k]; return o&&o.takes?o.takes:(TK[k]||[]).map((v,i)=>({b:[k,i]})); };
  // a take's buffer and where it plays (t, L); null while it loads
  SFX.take=(c,q)=>{ if(q.f){ const b=file(c,q.f); return b?{buf:b,t:q.a||0,L:b.duration-(q.a||0)-(q.z||0)}:null; } const T=TK[q.b[0]], v=T&&T[q.b[1]], B=v&&bank(c,bankOf(q.b[0])); return B?{buf:B.buf,t:v[0]+B.sh+(q.a||0),L:v[1]-(q.a||0)-(q.z||0)}:null; };
  const takes=(c,k)=>SFX.takeList(k).map(q=>SFX.take(c,q)).filter(x=>x&&x.L>.01);
  SFX.loadShared=()=>!web?Promise.resolve(SH):fetch('/shared/sounds.json',{credentials:'same-origin'}).then(r=>r.status===200?r.json():null).then(j=>{ SH.set=j&&j.v===1&&j.set&&typeof j.set==='object'?j.set:{}; return SH; }).catch(()=>SH);
  SFX.loadShared(); { let lastV=null; SYS.add('world',(k,v)=>{ if(k==='snd'&&v!==lastV){ lastV=v; SFX.loadShared(); } },'091-sfx shared'); }
  // a recorded loop held as a voice (an engine): its level, speed and place (at, or on your head when none) set as it goes; null till the recordings are in
  SFX.voice=(k,o={})=>{ const c=SFX.live(), q=c&&SFX.takeList(k)[0], v=q&&SFX.take(c,q); if(!v)return null; const s=c.createBufferSource(), G=c.createGain(), P=SFX.spot(c), pt=SFX.setOf(k).pitch||1;
    s.buffer=v.buf; s.loop=true; s.loopStart=v.t; s.loopEnd=v.t+v.L; G.gain.value=0; s.connect(P).connect(G).connect(o.bus||bus(c)); s.start(0,s.loopStart+Math.random()*v.L*.9);
    return {set:(vol,rate,at)=>{ const t=c.currentTime; G.gain.setTargetAtTime(Math.max(0,vol)*SFX.fxLevel(k),t,.08); s.playbackRate.setTargetAtTime(rate*pt,t,.1); if(at)P.to(at.x,at.y,at.z); else P.to(); },
      stop:()=>{ try{ G.gain.setTargetAtTime(0,c.currentTime,.05); s.stop(c.currentTime+.3); setTimeout(()=>P.end(),400); }catch(e){} },ctx:c}; };
  SFX.has=k=>!!(R[k]||TK[k]||SH.set[k]); SFX.takes=k=>TK[k]; SFX.bank=BANK; SFX.bankLoad=c=>BANKS.map(B=>bank(c,B)); SFX.banks=BANKS;
  SFX.all=()=>[...new Set([...Object.keys(R),...Object.keys(TK).filter(k=>k[0]!=='~'),...Object.keys(SH.set)])].sort();
  SFX.play=(k,o={})=>{ const c=SFX.live(); if(!c||!SFX.on)return null; const TT=takes(c,k), B=TT.length?TT[Math.floor(Math.random()*TT.length)]:null, rk=B?null:R[k]?k:ALT[k]; if(!B&&!rk)return null; const b=B?B.buf:SFX.buffer(rk,c); if(!b)return null;
    const s=c.createBufferSource(), G=c.createGain(); s.buffer=b; s.loop=!B&&!!R[rk].loop; s.playbackRate.value=(o.pitch||1)*(SFX.setOf(k).pitch||1)*(o.vary?1+(Math.random()-.5)*o.vary:1);
    let P=null; if(o.at){ P=SFX.spot(c); } else if(o.pan!=null&&c.createStereoPanner){ P=c.createStereoPanner(); P.pan.value=o.pan; }
    const kd=place(o,G,o.at?P:null); if(kd<=0)return null; G.gain.value=(o.vol==null?1:o.vol)*kd*(o.raw?1:SFX.fxLevel(k)); const out=o.bus||bus(c); if(P)s.connect(P).connect(G).connect(out); else s.connect(G).connect(out); const t0=c.currentTime+(o.delay||0); if(B)s.start(t0,Math.max(0,B.t-.012),B.L+.03); else s.start(t0); return {s,G,P}; };
  // what is underfoot (wood inside, grass in the park, stone elsewhere) and a door gone through
  SFX.ground=(x=pos.x,z=pos.z)=>ROOMS.cur||(ROOMS.offIn&&ROOMS.offIn())?'wood':SHARED.LVL==='up'&&PARK.within&&PARK.within(x,z)?'grass':'stone';
  SFX.door=(o={})=>{ SFX.play('dooropen',{vol:.7,...o}); SFX.play('door',{vol:.7,delay:.9,...o}); };
  // a walker's footfalls (you, or another player with {at,far}): one each half of the walk's cycle
  const STEP={stone:'step_stone',grass:'step_grass',wood:'step_wood'}, PH0=new WeakMap(); SFX.steps=(st,go,o)=>{ const ph=st.ph||0, p0=PH0.has(st)?PH0.get(st):ph, down=Math.floor(ph*2)!==Math.floor(p0*2); PH0.set(st,ph); if(!down||!(go>0)||st.w<.3||st.move||!SFX.on)return; const at=o&&o.at; SFX.play(STEP[at?SFX.ground(at.x,at.z):SFX.ground()],{vol:.045+.075*(st.run||0),vary:.12,at,far:o&&o.far}); };
  const hashS=s=>{ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  SFX.voiceOf=(key,bank)=>{ const h=hashS(String(key||'')); return {bank:bank||(h&1?'high':'low'),pitch:.92+((h>>>8)%1000)/1000*.16}; };
  const VB={}; const vbuf=(c,bank,i)=>{ '@later'; const key=bank+i; if(VB[key]&&VB[key].sampleRate===c.sampleRate)return VB[key]; const S=c.sampleRate, n=S*.07|0, b=c.createBuffer(1,n,S), D=b.getChannelData(0), f0=(bank==='high'?230:140)*(1+(i%4)*.06), fm=[1.5,2.2,2.8,3.6][(i>>2)%4];
    for(let j=0;j<n;j++){ const s=j/S, t=j/n, e=Math.min(t*18,1)*env(t,1.4); D[j]=(Math.sin(TAU*f0*s)*.6+Math.sin(TAU*f0*2*s)*.3*Math.sin(TAU*fm*s*20)+Math.sin(TAU*f0*3*s)*.12)*e*.35; } return VB[key]=b; };
  SFX.blip=(v,o={})=>{ '@later'; const c=SFX.live(); if(!c||!SFX.on)return; const s=c.createBufferSource(), G=c.createGain(); s.buffer=vbuf(c,v.bank||'low',Math.floor(Math.random()*16)); s.playbackRate.value=(v.pitch||1)*(.96+Math.random()*.08);
    let P=null; if(o.at)P=SFX.spot(c); const kd=place(o,G,P); if(kd<=0)return; G.gain.value=.22*kd*(SFX.mix.blip==null?1:+SFX.mix.blip); if(P)s.connect(P).connect(G).connect(bus(c)); else s.connect(G).connect(bus(c)); s.start(); };
}
// SETTINGS, SOUND: every sound in the game, each its own level for you (kept with your mix), a PLAY to hear it; the background beds the same
{ const LOOPS=['city','crickets','hum','rain','wind'], STEPS=[.1,2,.1]; let find='', host=null;
  const nm=k=>k.replace(/^amb_/,'').replace(/_/g,' ').toUpperCase(), lv=(o,k)=>o[k]==null?1:+o[k], txt=v=>v<=0?'OFF':Math.round(v*100)+'%';
  const row=(g,k,v)=>'<div class="row" style="margin:2px 0"><span style="flex:1 1 9em">'+nm(k)+'</span>'+(g==='fx'?'<button class="btn" data-sp="'+k+'">PLAY</button>':'')+'<input type="range" data-sg="'+g+'" data-sk="'+k+'" min="0" max="'+STEPS[1]+'" step="'+STEPS[2]+'" value="'+v+'" style="flex:2 1 8em"><span class="dim" data-sv="'+g+k+'" style="min-width:3.5em;text-align:right">'+txt(v)+'</span></div>';
  const draw=()=>{ if(!host||!host.isConnected)return; const L=SFX.all().filter(k=>!find||nm(k).includes(find));
    host.innerHTML='<div class="row"><span>EVERY SOUND</span><input class="smf" placeholder="FIND" value="'+find+'" style="flex:1"><button class="btn" data-sr="1">ALL BACK TO START</button></div>'
      +'<div style="max-height:46vh;overflow:auto">'+L.map(k=>row('fx',k,lv(SFX.mix.fx,k))).join('')+'<div class="dim" style="margin-top:6px">BACKGROUND</div>'+LOOPS.filter(k=>!find||nm(k).includes(find)).map(k=>row('loops',k,lv(SFX.mix.loops,k))).join('')+'</div>'; };
  SFX.mixPanel=el=>{ if(!el)return; const fresh=host!==el; host=el; draw(); if(!fresh)return;
    el.addEventListener('input',e=>{ const t=e.target; if(t.matches('.smf')){ find=t.value.trim().toUpperCase(); const p=t.selectionStart; draw(); const n=host.querySelector('.smf'); n.focus(); n.setSelectionRange(p,p); return; }
      if(!t.dataset.sg)return; const v=+t.value; SFX.mix[t.dataset.sg][t.dataset.sk]=v; SFX.saveMix(); const s=host.querySelector('[data-sv="'+t.dataset.sg+t.dataset.sk+'"]'); if(s)s.textContent=txt(v); });
    el.addEventListener('click',e=>{ const b=e.target.closest('[data-sp],[data-sr]'); if(!b)return; if(b.dataset.sr){ SFX.resetMix(); draw(); return; } SFX.wake(); SFX.play(b.dataset.sp,{vol:.6}); }); }; }
export {SOUND};
