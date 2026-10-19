const PNA={buf:null,busy:false,failed:0,ok:false,g:null,pan:null,at:{},on:{}};
function pnChain(){ const c=SND.ctx; if(!c||!SND.on||c.state!=='running')return false; if(PNA.g)return true;
  const g=PNA.g=c.createGain(), pan=PNA.pan=c.createStereoPanner(), cv=c.createConvolver(), wet=c.createGain();
  const len=Math.floor(c.sampleRate*1.1), ir=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){ const q=ir.getChannelData(ch); for(let i=0;i<len;i++){ const t=i/c.sampleRate; q[i]=(Math.random()*2-1)*Math.exp(-t*6.9)*(t<0.006?0:1); } for(const ms of [9,14,21,33])q[Math.floor(c.sampleRate*ms/1000)+ch*17]+=0.5; }
  cv.buffer=ir; wet.gain.value=0.24; g.gain.value=0; g.connect(pan); pan.connect(SND.out); pan.connect(cv); cv.connect(wet); wet.connect(SND.out); return true; }
function pnAudio(){ return false; }
function pnPlay(m,when,off,vel){ let q=PNSAMP[0]; for(const x of PNSAMP)if(Math.abs(x[0]-m)<Math.abs(q[0]-m))q=x; const A=PNA.at[q[0]]; if(!A)return; const c=SND.ctx;
  const was=PNA.on[m]; if(was){ was.g.gain.setTargetAtTime(0,when,0.02); try{ was.src.stop(when+0.2); }catch(e){} }
  const src=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(); src.buffer=PNA.buf; src.playbackRate.value=Math.pow(2,(m-q[0])/12);
  f.type='lowpass'; f.frequency.value=900+9000*vel*vel; f.Q.value=0.4; g.gain.value=0.15+0.85*vel;
  src.connect(f); f.connect(g); g.connect(PNA.g); src.start(when,A.t,A.L); g.gain.setTargetAtTime(0,off,m<60?0.12:0.07); try{ src.stop(off+0.9); }catch(e){}
  const v=PNA.on[m]={src,g}; src.onended=()=>{ if(PNA.on[m]===v)delete PNA.on[m]; }; }
function pnStop(){ if(!SND.ctx)return; const t=SND.ctx.currentTime; for(const m in PNA.on){ const v=PNA.on[m]; v.g.gain.cancelScheduledValues(t); v.g.gain.setTargetAtTime(0,t,0.08); try{ v.src.stop(t+0.6); }catch(e){} } PNA.on={}; }
