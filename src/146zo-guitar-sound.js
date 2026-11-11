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
  GSND.wake=()=>{ if(GSND.ctx){ SFX.wake(); return GSND.ok; } if(GSND.busy)return false;
    const c=GSND.ctx=SFX.wake(); if(!c||!c.audioWorklet)return false; GSND.busy=true;
    GSND.out=c.createGain(); GSND.out.gain.value=GSND.vol; GSND.out.connect(SFX.out(c));
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
  /* ---------- recorded sounds (owner, 8 and 10 Nov 2026: "real sounds"): data/<id>-samples.mp3 and .json (tools/instrument-samples-bake.py), fetched and decoded the first time someone near plays; a sound's key a midi number or "group:midi" ---------- */
  const SETS={}; GSND.SETS=SETS;
  GSND.set=(id,D)=>{ const S=SETS[id]||(SETS[id]={ok:false,busy:false,retry:0}); if(S.ok||S.busy||!D||!GSND.ctx||performance.now()<S.retry)return S; S.busy=true;
    fetch(D.file).then(r=>{ if(!r.ok)throw new Error(r.status); return r.arrayBuffer(); }).then(b=>GSND.ctx.decodeAudioData(b)).then(buf=>{ const x=buf.getChannelData(0), sr=buf.sampleRate; S.at={}; S.grp={};
      // (each sound from where it really begins: an mp3 shifts its contents a little)
      for(const [k,t,L] of D.s){ const i0=Math.max(0,Math.floor((t-.08)*sr)), i1=Math.min(x.length,Math.floor((t+.1)*sr)); let pk=0; for(let i=i0;i<i1;i++)pk=Math.max(pk,Math.abs(x[i])); let i=i0; while(i<i1&&Math.abs(x[i])<pk*.06)i++; S.at[k]={t:Math.max(0,(i-24)/sr),L};
        const c=String(k).indexOf(':'), g=c<0?'':String(k).slice(0,c); (S.grp[g]||(S.grp[g]=[])).push(+String(k).slice(c+1)); }
      S.buf=buf; S.ok=true; }).catch(e=>{ console.warn(id+' sounds',e); S.retry=performance.now()+15000; }).finally(()=>{ S.busy=false; });
    return S; };
  // the nearest recording in a group to a note, and how fast to play it to sound that note
  GSND.near=(S,g,m)=>{ const L=S.grp&&S.grp[g]; if(!L||!L.length)return null; let m0=L[0]; for(const k of L)if(Math.abs(k-m)<Math.abs(m0-m))m0=k; return {k:g?g+':'+m0:m0,rate:Math.pow(2,(m-m0)/12)}; };
  GSND.fade=(o,when,T)=>{ if(o.end<=when)return; o.g.gain.cancelScheduledValues(when); o.g.gain.setTargetAtTime(0,when,T/3); try{ o.src.stop(when+T*2); if(o.lfo)o.lfo.stop(when+T*2); }catch(_){} o.end=when; };
  // a recording into a voice: h {k, rate, gain, lp, off (start that far in), fin (fade in), xf (how fast it cuts the one it replaces), vib [cents, hz], sw (a held note's swell), id/re (cuts its own last), ch (cuts its group's)}
  GSND.play=(V,S,h,when)=>{ const A=S.at[h.k]; if(!A)return null; const c=GSND.ctx, L=V.on||(V.on=[]); V.at=performance.now();
    for(const o of L)if((h.re&&o.id===h.id)||(h.ch!=null&&o.ch===h.ch))GSND.fade(o,when,h.xf||.04);
    const src=c.createBufferSource(); src.buffer=S.buf; src.playbackRate.value=h.rate||1; let n=src; if(h.lp){ const f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=h.lp; f.Q.value=.4; src.connect(f); n=f; }
    const g=c.createGain(), G=g.gain, off=Math.min(h.off||0,A.L*.5); n.connect(g); g.connect(V.g);
    if(h.fin){ G.setValueAtTime(0,when); G.linearRampToValueAtTime(h.gain,when+h.fin); } else G.setValueAtTime(h.gain,when);
    if(h.sw){ G.setTargetAtTime(h.gain*(1+h.sw),when+(h.fin||0)+.05,h.swT||.4); }
    let lfo=null; if(h.vib){ lfo=c.createOscillator(); lfo.frequency.value=h.vib[1]; const d=c.createGain(); d.gain.setValueAtTime(0,when); d.gain.linearRampToValueAtTime(0,when+.25); d.gain.linearRampToValueAtTime(h.vib[0],when+.7); lfo.connect(d); d.connect(src.detune); lfo.start(when); lfo.stop(when+A.L+.1); }
    src.start(when,A.t+off,A.L-off); const o={src,g,lfo,id:h.id,ch:h.ch,end:when+(A.L-off)/(h.rate||1)}; L.push(o);
    src.onended=()=>{ const i=L.indexOf(o); if(i>=0)L.splice(i,1); try{ g.disconnect(); }catch(_){} }; return o; };
  // the guitar's recordings: a nylon-string classical, each string's note from the nearest; a string plucked again stops its last ring, a hand on it damps it; the strings' model plays till they come
  const GS={...__DATA__("data/guitar-samples.json"),file:__FILE__("data/guitar-samples.mp3")}; GSND.GS=GS;
  GSND.pluck=(V,s,k,when,amp,bright,pos)=>{ if(!V)return; const S=GSND.set('guitar',GS);
    if(S.ok){ const hz=gtHz(s,k), n=GSND.near(S,'',69+12*Math.log2(hz/440)); if(n){ const a=Math.min(1,amp)*(.93+.14*Math.random()); GSND.play(V,S,{...n,gain:1.5*Math.pow(a,.85),lp:1500+9000*bright*(.45+.55*a)*(1.15-Math.max(.05,Math.min(.5,pos))),id:'s'+s,re:true,xf:.03},when); return; } }
    const q=PM[s-1]; V.at=performance.now(); V.node.port.postMessage({ev:[{t:when,k:'pluck',s:s-1,hz:gtHz(s,k),g:q.g,a:q.a,ap:q.ap,amp:Math.min(1,amp)*.9,bright,pos:Math.max(.05,Math.min(.5,pos))}]}); };
  GSND.mute=(V,s,when,v=.25)=>{ if(!V)return; V.node.port.postMessage({ev:[{t:when,k:'mute',s:s-1,v}]}); for(const o of V.on||[])if(o.id==='s'+s)GSND.fade(o,when,v>=.2?.16:.05); };
  GSND.setVol=v=>{ GSND.vol=Math.max(0,Math.min(1,v)); try{ SAVE.set('gtvol',String(GSND.vol)); }catch(e){} if(GSND.out)GSND.out.gain.setTargetAtTime(GSND.vol,GSND.ctx.currentTime,.05); };
  // where a voice is heard from: its player's place against yours and the way the view looks (louder near, gone past about 18 m)
  GSND.place=(V,x,z)=>{ if(!V||!GSND.ctx)return; const c=GSND.ctx, d=Math.hypot(x-pos.x,z-pos.z)/TILE*.84, k=/^me\b/.test(V.who)?1:Math.max(0,1-d/18)**2;
    V.g.gain.setTargetAtTime(k,c.currentTime,.08); if(/^me\b/.test(V.who))V.pan.to(); else V.pan.to(x,SHARED.py+TILE,z); }; }
export {GSND};
