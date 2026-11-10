// THE GUITAR'S SOUND: GSND, six strings and the hollow body simulated on the audio thread (tsfm's, owner 14 Oct 2026: "real acoustic strings that vibrate ... empty body ... acoustics matching"), one voice a player, heard from where they stand; the guitar's own audio, as the car radio's (the game's other sounds stay off, 19 Oct 2026).
import {SHARED} from './003-shx.js';
import {pos, SFX} from './003b-systems.js';
import {SAVE} from './005-save.js';
import {TILE} from './006-map-pre.js';
import {gtHz} from './106-game-play-3-guitar-1-body.js';
import {IMX} from './119-game-music-1-engine.js';
const GSND={ctx:null,ok:false,busy:false,vol:.7,voices:new Map()};
{ try{ const v=SAVE.get('gtvol'); if(v!=null)GSND.vol=Math.max(0,Math.min(1,+v)); }catch(e){}
  // each string a travelling wave in a delay line its sounding length long (tuned to a fraction of a sample), losing its highs at the bridge, the wound basses a hair stiff; a pluck a triangle
  // peaked where the finger pulls; the strings drive the body's resonances (the air through the soundhole near 95 Hz, the top's modes, the back's), a little going back into every string
  const SRC=`
class Guitar extends AudioWorkletProcessor{
  constructor(o){ super(); const N=4096; this.S=[]; for(let s=0;s<6;s++)this.S.push({d:new Float32Array(N),N,i:0,len:400,M:400,C:1,g:0.996,a:0.5,lp:0,ap:0,apc:0,mute:1,fd:0});
    this.body=[[95,.9992,1.0],[190,.9988,.8],[250,.9985,.5],[400,.998,.55],[560,.9975,.4],[720,.996,.3]].map(([f,r,w])=>{ const o=2*Math.PI*f/sampleRate; return {c:2*r*Math.cos(o),r2:r*r,k:(1-r)*Math.hypot(1-r*Math.cos(2*o),r*Math.sin(2*o)),w,y1:0,y2:0}; });
    this.ev=(o&&o.processorOptions&&o.processorOptions.ev||[]).slice(); this.quiet=0; this.port.onmessage=e=>{ const m=e.data; if(m.ev)for(const q of m.ev)this.ev.push(q); this.ev.sort((a,b)=>a.t-b.t); }; }
  setLen(S,hz){ const w=2*Math.PI*hz/sampleRate, b=1-S.a, dl=Math.atan2(b*Math.sin(w),1-b*Math.cos(w))/w, a=S.ap, da=a?-(Math.atan2(-Math.sin(w),a+Math.cos(w))-Math.atan2(-a*Math.sin(w),1+a*Math.cos(w)))/w:0; S.len=Math.max(8,sampleRate/hz-dl-da); S.M=Math.floor(S.len); const f=S.len-S.M; S.C=(1-f)/(1+f); }
  pluck(S,pos,amp,bright){ const N=Math.min(S.N-1,Math.round(S.len)); let acc=0;
    for(let j=0;j<N;j++){ const u=j/N, tri=u<pos?u/pos:(1-u)/(1-pos); let v=tri*amp; if(bright<0.9){ acc+=(v-acc)*(0.25+0.6*bright); v=acc; } S.d[(S.i-j+S.N*4)%S.N]=v; }
    S.lp=0; S.mute=1; }
  process(ins,outs){ const o=outs[0][0], n=o.length, sr=sampleRate; const ev=this.ev;
    if(this.quiet>sr&&(!ev.length||ev[0].t>currentTime+n/sr))return true;
    let peak=0;
    for(let i=0;i<n;i++){ const t=currentTime+i/sr;
      while(ev.length&&ev[0].t<=t){ const q=ev.shift(), S=this.S[q.s]; if(q.k==='pluck'){ S.g=q.g; S.a=q.a; S.ap=q.ap; this.setLen(S,q.hz); this.pluck(S,q.pos,q.amp,q.bright); } else if(q.k==='mute')S.mute=q.v; }
      let bridge=0; const fb=this.fb||0;
      for(let k=0;k<6;k++){ const S=this.S[k], d=S.d, M=S.M, C=S.C, x0=d[(S.i-M)&4095], x1=d[(S.i-M-1)&4095], x=C*x0+x1-C*S.fd; S.fd=x;
        S.lp+=(x-S.lp)*S.a; let y=S.lp*S.g*S.mute;
        if(S.ap){ const a=S.ap, z=y; y=S.apc+a*z; S.apc=z-a*y; }
        y+=fb*0.0002; d[S.i&4095]=y; S.i++; bridge+=y; if(S.mute<1)S.mute+=(1-S.mute)*0.00002; }
      let b=0; for(const m of this.body){ const yy=m.c*m.y1-m.r2*m.y2+bridge*m.k; m.y2=m.y1; m.y1=yy; b+=yy*m.w; }
      this.fb=b; o[i]=Math.max(-1,Math.min(1,bridge*0.22+b*0.5)); const ab=o[i]<0?-o[i]:o[i]; if(ab>peak)peak=ab; }
    this.quiet=peak<1e-5?this.quiet+n:0;
    return true; } }
registerProcessor('guitar',Guitar);`;
  // each string's make-up: how long it rings (the loop's gain), how dull the bridge is (nylon trebles duller, the wound basses brighter), its stiffness
  const PM=[{g:.995,a:.62,ap:0},{g:.9955,a:.58,ap:0},{g:.996,a:.55,ap:0},{g:.9965,a:.5,ap:.08},{g:.997,a:.46,ap:.12},{g:.9975,a:.42,ap:.16}];
  let room=null;
  // the guitar's audio, made the first time someone plays (a click or a key: the browser lets sound start then)
  GSND.wake=()=>{ if(GSND.ctx){ if(GSND.ctx.state!=='running')GSND.ctx.resume().catch(()=>{}); return GSND.ok; } if(GSND.busy)return false;
    try{ GSND.ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return false; } const c=GSND.ctx; if(!c.audioWorklet)return false; GSND.busy=true;
    GSND.out=c.createGain(); GSND.out.gain.value=GSND.vol; GSND.out.connect(c.destination);
    // a little air round it: early reflections and a short tail (outdoors mostly; an inside's walls would add more)
    const len=Math.floor(c.sampleRate*.6), ir=c.createBuffer(2,len,c.sampleRate); for(let ch=0;ch<2;ch++){ const q=ir.getChannelData(ch); for(let i=0;i<len;i++){ const t=i/c.sampleRate; q[i]=(Math.random()*2-1)*Math.exp(-t*13.8/.45)*(t<.004?0:1); } for(const ms of [9,14,21,28])q[Math.floor(c.sampleRate*ms/1000)+ch*13]+=.5; }
    const cv=c.createConvolver(), wet=c.createGain(); cv.buffer=ir; wet.gain.value=.16; cv.connect(wet); wet.connect(GSND.out); room=cv;
    c.audioWorklet.addModule('data:application/javascript,'+encodeURIComponent(SRC)).then(()=>{ GSND.ok=true; }).catch(e=>console.warn('guitar strings',e)).finally(()=>{ GSND.busy=false; });
    c.audioWorklet.addModule('data:application/javascript,'+encodeURIComponent(IMX.src)).then(()=>{ GSND.imx=true; }).catch(e=>console.warn('instruments',e));   // (the music engine's strings, heads and hammers: the piano, the drums, the harp, 146zp)
    return false; };
  // a player's voice: its own six strings, its loudness and side from where you hear it
  GSND.voice=who=>{ if(!GSND.ok)return null; let V=GSND.voices.get(who); if(V)return V; const c=GSND.ctx, node=new AudioWorkletNode(c,'guitar',{outputChannelCount:[1]}), g=c.createGain(), pan=SFX.spot(c,true);
    g.gain.value=who==='me'?1:0; node.connect(g); g.connect(pan); pan.connect(GSND.out); pan.connect(room); V={who,node,g,pan,at:performance.now()}; GSND.voices.set(who,V); return V; };
  // an instrument's voice (146zp): the music engine (119) with that instrument's make-up, placed and dropped as a guitar's is (its key: the player and the instrument)
  GSND.inst=(who,dsp)=>{ if(!GSND.imx)return null; let V=GSND.voices.get(who); if(V)return V; const c=GSND.ctx, node=new AudioWorkletNode(c,'imx',{outputChannelCount:[1],processorOptions:dsp}), g=c.createGain(), pan=SFX.spot(c,true);
    g.gain.value=/^me\b/.test(who)?1:0; node.connect(g); g.connect(pan); pan.connect(GSND.out); pan.connect(room); V={who,node,g,pan,at:performance.now()}; GSND.voices.set(who,V); return V; };
  GSND.send=(V,evs,when)=>{ if(!V||!evs.length)return; V.at=performance.now(); V.node.port.postMessage({ev:evs.map(e=>({...e,t:when+(e.dt||0)}))}); };
  GSND.drop=who=>{ const V=GSND.voices.get(who); if(!V)return; try{ V.node.disconnect(); V.g.disconnect(); V.pan.end(); }catch(e){} GSND.voices.delete(who); };
  GSND.SRC=SRC; GSND.PM=PM;   // (for the check: each string's pitch rendered offline and measured)
  GSND.now=()=>GSND.ctx?GSND.ctx.currentTime:0;
  // a pluck: string s (1 the high E) at fret k, at audio time when, pulled amp (0..1), bright 1 the nail and .5 the thumb's flesh, at a fraction pos of the string from the bridge
  GSND.pluck=(V,s,k,when,amp,bright,pos)=>{ if(!V)return; const q=PM[s-1]; V.at=performance.now(); V.node.port.postMessage({ev:[{t:when,k:'pluck',s:s-1,hz:gtHz(s,k),g:q.g,a:q.a,ap:q.ap,amp:Math.min(1,amp)*.9,bright,pos:Math.max(.05,Math.min(.5,pos))}]}); };
  GSND.mute=(V,s,when,v=.25)=>{ if(V)V.node.port.postMessage({ev:[{t:when,k:'mute',s:s-1,v}]}); };
  GSND.setVol=v=>{ GSND.vol=Math.max(0,Math.min(1,v)); try{ SAVE.set('gtvol',String(GSND.vol)); }catch(e){} if(GSND.out)GSND.out.gain.setTargetAtTime(GSND.vol,GSND.ctx.currentTime,.05); };
  // where a voice is heard from: its player's place against yours and the way the view looks (louder near, gone past about 18 m)
  GSND.place=(V,x,z)=>{ if(!V||!GSND.ctx)return; const c=GSND.ctx, d=Math.hypot(x-pos.x,z-pos.z)/TILE*.84, k=/^me\b/.test(V.who)?1:Math.max(0,1-d/18)**2;
    V.g.gain.setTargetAtTime(k,c.currentTime,.08); if(/^me\b/.test(V.who))V.pan.to(); else V.pan.to(x,SHARED.py+TILE,z); }; }
export {GSND};
