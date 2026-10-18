const PNA={buf:null,busy:false,failed:0,ok:false,g:null,pan:null,at:{},on:{}};
function pnChain(){ const c=SND.ctx; if(!c||!SND.on||c.state!=='running')return false; if(PNA.g)return true;
  const g=PNA.g=c.createGain(), pan=PNA.pan=c.createStereoPanner(), cv=c.createConvolver(), wet=c.createGain();
  const len=Math.floor(c.sampleRate*1.1), ir=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){ const q=ir.getChannelData(ch); for(let i=0;i<len;i++){ const t=i/c.sampleRate; q[i]=(Math.random()*2-1)*Math.exp(-t*6.9)*(t<0.006?0:1); } for(const ms of [9,14,21,33])q[Math.floor(c.sampleRate*ms/1000)+ch*17]+=0.5; }
  cv.buffer=ir; wet.gain.value=0.24; g.gain.value=0; g.connect(pan); pan.connect(SND.out); pan.connect(cv); cv.connect(wet); wet.connect(SND.out); return true; }
function pnAudio(){ return false; const c=SND.ctx; if(!pnChain())return false; if(PNA.ok||PNA.busy||performance.now()<PNA.failed)return PNA.ok; PNA.busy=true;
  fetch('audio/piano.mp3').then(r=>{ if(!r.ok)throw new Error('audio/piano.mp3: '+r.status); return r.arrayBuffer(); }).then(b=>c.decodeAudioData(b)).then(buf=>{
    const d=buf.getChannelData(0), sr=buf.sampleRate;
    for(const [m,t0,L] of PNSAMP){ const a=Math.max(0,Math.floor((t0-0.06)*sr)), e=Math.min(d.length-1,Math.floor((t0+0.12)*sr)); let pk=0; for(let i=a;i<e;i++)pk=Math.max(pk,Math.abs(d[i]));
      let i=a; while(i<e&&Math.abs(d[i])<pk*0.05)i++; PNA.at[m]={t:Math.max(0,i/sr-0.004),L}; }
    PNA.buf=buf; PNA.ok=true; })
    .catch(e=>{ console.warn('piano sound',e); PNA.failed=performance.now()+10000; }).finally(()=>{ PNA.busy=false; });
  return false; }
function pnPlay(m,when,off,vel){ let q=PNSAMP[0]; for(const x of PNSAMP)if(Math.abs(x[0]-m)<Math.abs(q[0]-m))q=x; const A=PNA.at[q[0]]; if(!A)return; const c=SND.ctx;
  const was=PNA.on[m]; if(was){ was.g.gain.setTargetAtTime(0,when,0.02); try{ was.src.stop(when+0.2); }catch(e){} }
  const src=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(); src.buffer=PNA.buf; src.playbackRate.value=Math.pow(2,(m-q[0])/12);
  f.type='lowpass'; f.frequency.value=900+9000*vel*vel; f.Q.value=0.4; g.gain.value=0.15+0.85*vel;
  src.connect(f); f.connect(g); g.connect(PNA.g); src.start(when,A.t,A.L); g.gain.setTargetAtTime(0,off,m<60?0.12:0.07); try{ src.stop(off+0.9); }catch(e){}
  const v=PNA.on[m]={src,g}; src.onended=()=>{ if(PNA.on[m]===v)delete PNA.on[m]; }; }
function pnStop(){ if(!SND.ctx)return; const t=SND.ctx.currentTime; for(const m in PNA.on){ const v=PNA.on[m]; v.g.gain.cancelScheduledValues(t); v.g.gain.setTargetAtTime(0,t,0.08); try{ v.src.stop(t+0.6); }catch(e){} } PNA.on={}; }
